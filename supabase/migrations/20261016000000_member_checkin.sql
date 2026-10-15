-- UCFCA attendance step 2: member setup, sign-in and QR check-in.
--
-- All rules run here, in security-definer functions, so the browser only ever
-- calls them with the public (publishable) key:
--   * officer_* functions check the caller is an officer (Supabase Auth).
--   * member_* functions identify the member by a setup token or a device token.
--     Tokens are random and stored only as SHA-256 hashes; PINs as bcrypt hashes.
--   * The database clock decides whether a check-in is on time or late.
-- Member functions return JSON ({ ok: true, ... } or { ok: false, error: '...' })
-- rather than raising, so failed-PIN counters are saved instead of rolled back.

-- Helpers (not callable from the API) ---------------------------------------

create function public.hash_token(p_token text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(extensions.digest(p_token, 'sha256'), 'hex')
$$;

-- Nigerian numbers in one form: 08031234567 (also accepts +234..., 234..., 803...).
create function public.normalise_phone(p_phone text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when d ~ '^234[789]\d{9}$' then '0' || substr(d, 4)
    when d ~ '^[789]\d{9}$' then '0' || d
    else d
  end
  from (select regexp_replace(coalesce(p_phone, ''), '\D', '', 'g') as d) s
$$;

create function public.first_name(p_full_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select split_part(trim(p_full_name), ' ', 1)
$$;

-- Member behind a device token, or null. Also records when the phone was last used.
create function public.member_for_device(p_device_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member uuid;
begin
  update public.member_devices d
     set last_used_at = now()
    from public.members m
   where d.token_hash = public.hash_token(p_device_token)
     and m.id = d.member_id
     and m.active
  returning d.member_id into v_member;
  return v_member;
end
$$;

-- Issues a new remembered-device token for a member.
create function public.issue_device(p_member uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  insert into public.member_devices (member_id, token_hash)
  values (p_member, public.hash_token(v_token));
  return v_token;
end
$$;

-- Rotating check-in code for a meeting and a 30-second window.
create function public.meeting_code(p_meeting uuid, p_window bigint)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select left(encode(extensions.hmac(p_meeting::text || ':' || p_window, s.qr_secret, 'sha256'), 'hex'), 10)
  from public.meeting_secrets s
  where s.meeting_id = p_meeting
$$;

create function public.current_code_window()
returns bigint
language sql
stable
set search_path = ''
as $$
  select floor(extract(epoch from now()) / 30)::bigint
$$;

-- Officer functions -----------------------------------------------------------

-- Creates a one-time setup link token (valid 14 days) for a member. Recorders only.
create function public.officer_create_setup_token(p_member_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  if public.current_officer_role() is distinct from 'recorder' then
    raise exception 'Only recorders can create setup links' using errcode = '42501';
  end if;
  if not exists (select 1 from public.members where id = p_member_id and active) then
    raise exception 'Member not found or inactive' using errcode = 'P0002';
  end if;
  insert into public.member_credentials (member_id, setup_token_hash, setup_token_expires_at)
  values (p_member_id, public.hash_token(v_token), now() + interval '14 days')
  on conflict (member_id) do update
    set setup_token_hash = excluded.setup_token_hash,
        setup_token_expires_at = excluded.setup_token_expires_at,
        updated_at = now();
  return v_token;
end
$$;

-- Whether each member has set a PIN or has an unused setup link. Officers only.
create function public.officer_member_access()
returns table (member_id uuid, has_pin boolean, link_pending boolean, devices int)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id,
         c.pin_hash is not null,
         coalesce(c.setup_token_expires_at > now(), false),
         (select count(*)::int from public.member_devices d where d.member_id = m.id)
  from public.members m
  left join public.member_credentials c on c.member_id = m.id
  where public.current_officer_role() is not null
$$;

-- The code to show on the check-in screen. Recorders only.
create function public.officer_meeting_code(p_meeting_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_meeting public.meetings;
  v_window bigint := public.current_code_window();
begin
  if public.current_officer_role() is distinct from 'recorder' then
    raise exception 'Only recorders can show the check-in code' using errcode = '42501';
  end if;
  select * into v_meeting from public.meetings where id = p_meeting_id;
  if not found then
    raise exception 'Meeting not found' using errcode = 'P0002';
  end if;
  if now() < v_meeting.opens_at then
    return json_build_object('state', 'not-open', 'opens_at', v_meeting.opens_at);
  elsif now() > v_meeting.closes_at then
    return json_build_object('state', 'closed', 'closes_at', v_meeting.closes_at);
  end if;
  return json_build_object(
    'state', 'open',
    'code', public.meeting_code(p_meeting_id, v_window),
    'seconds_left', 30 - (floor(extract(epoch from now()))::bigint % 30),
    'closes_at', v_meeting.closes_at
  );
end
$$;

-- Member functions --------------------------------------------------------------

-- First name for a valid setup link, so the setup page can greet the member.
create function public.member_setup_info(p_token text)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select json_build_object('ok', true, 'first_name', public.first_name(m.full_name), 'has_pin', c.pin_hash is not null)
       from public.member_credentials c
       join public.members m on m.id = c.member_id
      where c.setup_token_hash = public.hash_token(p_token)
        and c.setup_token_expires_at > now()
        and m.active),
    json_build_object('ok', false, 'error', 'invalid_link')
  )
$$;

-- Sets the member's PIN from a setup link and remembers this phone.
-- Signs the member out of any other phones (the PIN has changed).
create function public.member_complete_setup(p_token text, p_pin text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member uuid;
  v_name text;
begin
  if coalesce(p_pin, '') !~ '^\d{4}$' then
    return json_build_object('ok', false, 'error', 'invalid_pin');
  end if;
  select c.member_id, m.full_name into v_member, v_name
    from public.member_credentials c
    join public.members m on m.id = c.member_id
   where c.setup_token_hash = public.hash_token(p_token)
     and c.setup_token_expires_at > now()
     and m.active;
  if v_member is null then
    return json_build_object('ok', false, 'error', 'invalid_link');
  end if;
  update public.member_credentials
     set pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')),
         setup_token_hash = null,
         setup_token_expires_at = null,
         failed_pin_attempts = 0,
         locked_until = null,
         updated_at = now()
   where member_id = v_member;
  delete from public.member_devices where member_id = v_member;
  return json_build_object('ok', true, 'device_token', public.issue_device(v_member),
                           'first_name', public.first_name(v_name));
end
$$;

-- Signs in on a new phone with phone number or email, plus PIN.
-- Five wrong PINs lock the member's PIN for 15 minutes.
create function public.member_sign_in(p_identifier text, p_pin text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id text := lower(trim(coalesce(p_identifier, '')));
  v_cred public.member_credentials;
  v_name text;
  v_attempts int;
begin
  select c.* into v_cred
    from public.members m
    join public.member_credentials c on c.member_id = m.id
   where m.active
     and c.pin_hash is not null
     and (lower(m.email) = v_id
          or (public.normalise_phone(v_id) <> '' and public.normalise_phone(m.phone) = public.normalise_phone(v_id)))
   limit 1;
  select full_name into v_name from public.members where id = v_cred.member_id;
  if v_cred.member_id is null then
    -- Same answer as a wrong PIN, so the form can't be used to discover members.
    return json_build_object('ok', false, 'error', 'invalid_credentials');
  end if;
  if v_cred.locked_until > now() then
    return json_build_object('ok', false, 'error', 'locked',
                             'minutes', ceil(extract(epoch from v_cred.locked_until - now()) / 60));
  end if;
  if v_cred.pin_hash <> extensions.crypt(coalesce(p_pin, ''), v_cred.pin_hash) then
    v_attempts := v_cred.failed_pin_attempts + 1;
    update public.member_credentials
       set failed_pin_attempts = case when v_attempts >= 5 then 0 else v_attempts end,
           locked_until = case when v_attempts >= 5 then now() + interval '15 minutes' else null end,
           updated_at = now()
     where member_id = v_cred.member_id;
    if v_attempts >= 5 then
      return json_build_object('ok', false, 'error', 'locked', 'minutes', 15);
    end if;
    return json_build_object('ok', false, 'error', 'invalid_credentials');
  end if;
  update public.member_credentials
     set failed_pin_attempts = 0, locked_until = null, updated_at = now()
   where member_id = v_cred.member_id;
  return json_build_object('ok', true, 'device_token', public.issue_device(v_cred.member_id),
                           'first_name', public.first_name(v_name));
end
$$;

-- Checks a member in with the code from the QR on screen.
create function public.member_check_in(p_device_token text, p_meeting_id uuid, p_code text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member uuid := public.member_for_device(p_device_token);
  v_meeting public.meetings;
  v_window bigint := public.current_code_window();
  v_existing public.attendance;
  v_status public.attendance_status;
  v_name text;
begin
  if v_member is null then
    return json_build_object('ok', false, 'error', 'signed_out');
  end if;
  select full_name into v_name from public.members where id = v_member;
  select * into v_meeting from public.meetings where id = p_meeting_id;
  if not found then
    return json_build_object('ok', false, 'error', 'no_meeting');
  end if;
  if now() < v_meeting.opens_at then
    return json_build_object('ok', false, 'error', 'not_open', 'opens_at', v_meeting.opens_at);
  end if;
  if now() > v_meeting.closes_at then
    return json_build_object('ok', false, 'error', 'closed');
  end if;

  select * into v_existing from public.attendance
   where meeting_id = p_meeting_id and member_id = v_member;
  if found and v_existing.status <> 'excused' then
    return json_build_object('ok', true, 'already', true, 'status', v_existing.status,
                             'checked_in_at', v_existing.checked_in_at,
                             'meeting_title', v_meeting.title, 'first_name', public.first_name(v_name));
  end if;

  -- Current or previous 30-second code, so a scan made just before it changes still works.
  if p_code is null or p_code not in (public.meeting_code(p_meeting_id, v_window),
                                      public.meeting_code(p_meeting_id, v_window - 1)) then
    return json_build_object('ok', false, 'error', 'code_expired');
  end if;

  v_status := case
    when now() <= v_meeting.starts_at + make_interval(mins => v_meeting.grace_minutes) then 'present'
    else 'late'
  end;
  insert into public.attendance (meeting_id, member_id, status, checked_in_at, method)
  values (p_meeting_id, v_member, v_status, now(), 'self')
  on conflict (meeting_id, member_id) do update
    set status = excluded.status, checked_in_at = excluded.checked_in_at,
        method = 'self', recorded_by = null, updated_at = now();
  return json_build_object('ok', true, 'already', false, 'status', v_status, 'checked_in_at', now(),
                           'meeting_title', v_meeting.title, 'first_name', public.first_name(v_name));
end
$$;

-- The signed-in member's own record: every meeting since they joined.
create function public.member_my_attendance(p_device_token text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member_id uuid := public.member_for_device(p_device_token);
  v_member public.members;
  v_meetings json;
begin
  select * into v_member from public.members where id = v_member_id;
  if v_member.id is null then
    return json_build_object('ok', false, 'error', 'signed_out');
  end if;
  select coalesce(json_agg(row_to_json(r) order by r.starts_at desc), '[]'::json) into v_meetings
  from (
    select mt.title, mt.venue, mt.starts_at,
           coalesce(a.status::text, case when mt.closes_at < now() then 'absent' else 'open' end) as status,
           a.checked_in_at
      from public.meetings mt
      left join public.attendance a on a.meeting_id = mt.id and a.member_id = v_member.id
     where mt.opens_at <= now()
       and (v_member.joined_on is null or mt.starts_at::date >= v_member.joined_on)
  ) r;
  return json_build_object('ok', true, 'full_name', v_member.full_name, 'meetings', v_meetings);
end
$$;

-- Forgets this phone.
create function public.member_sign_out(p_device_token text)
returns json
language sql
security definer
set search_path = ''
as $$
  delete from public.member_devices where token_hash = public.hash_token(p_device_token);
  select json_build_object('ok', true);
$$;

-- Permissions -----------------------------------------------------------------

-- Supabase lets the API roles execute new functions by default; lock everything
-- down, then open only what each audience needs.
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.current_officer_role() to authenticated;
grant execute on function
  public.officer_create_setup_token(uuid),
  public.officer_member_access(),
  public.officer_meeting_code(uuid)
  to authenticated;
grant execute on function
  public.member_setup_info(text),
  public.member_complete_setup(text, text),
  public.member_sign_in(text, text),
  public.member_check_in(text, uuid, text),
  public.member_my_attendance(text),
  public.member_sign_out(text)
  to anon, authenticated;
