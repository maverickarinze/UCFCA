-- UCFCA attendance: foundation schema.
--
-- Access model
--   * Officers sign in with Supabase Auth (email + password) and are listed in
--     public.officers with a role: 'recorder' (record/edit) or 'viewer' (read only).
--   * Members never use Supabase Auth. Their check-ins go through server functions
--     using the secret key, so the credential/device/secret tables below have RLS
--     enabled and no policies: nothing in the browser can read or write them.
--   * "Absent" is not stored: a member with no attendance row for a closed meeting
--     they were eligible for is absent.

create extension if not exists pgcrypto with schema extensions;

create type public.officer_role as enum ('recorder', 'viewer');
create type public.attendance_status as enum ('present', 'late', 'excused');

-- Officers ------------------------------------------------------------------

create table public.officers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.officer_role not null,
  created_at timestamptz not null default now()
);

-- Role of the signed-in user, or null if they are not an officer.
create function public.current_officer_role()
returns public.officer_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.officers where user_id = (select auth.uid())
$$;

-- Members -------------------------------------------------------------------

create table public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) > 0),
  phone text,
  joined_on date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- PIN and setup-link state. Server-only.
create table public.member_credentials (
  member_id uuid primary key references public.members (id) on delete cascade,
  pin_hash text,
  setup_token_hash text unique,
  setup_token_expires_at timestamptz,
  failed_pin_attempts int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

-- Phones a member has signed in on ("remembered devices"). Server-only.
create table public.member_devices (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index member_devices_member_id_idx on public.member_devices (member_id);

-- Meetings ------------------------------------------------------------------

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  venue text,
  starts_at timestamptz not null,
  grace_minutes int not null default 15 check (grace_minutes >= 0),
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (opens_at <= starts_at and starts_at < closes_at)
);

-- Secret behind each meeting's rotating QR code. Server-only.
create table public.meeting_secrets (
  meeting_id uuid primary key references public.meetings (id) on delete cascade,
  qr_secret text not null default encode(extensions.gen_random_bytes(32), 'hex')
);

create function public.create_meeting_secret()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.meeting_secrets (meeting_id) values (new.id);
  return new;
end
$$;

create trigger meetings_create_secret
after insert on public.meetings
for each row execute function public.create_meeting_secret();

-- Attendance ----------------------------------------------------------------

create table public.attendance (
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  status public.attendance_status not null,
  checked_in_at timestamptz,
  method text not null check (method in ('self', 'assisted', 'manual')),
  recorded_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (meeting_id, member_id)
);
create index attendance_member_id_idx on public.attendance (member_id);

-- Row-level security --------------------------------------------------------

alter table public.officers enable row level security;
alter table public.members enable row level security;
alter table public.member_credentials enable row level security;
alter table public.member_devices enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_secrets enable row level security;
alter table public.attendance enable row level security;

-- Nothing here is public.
revoke all on public.officers, public.members, public.member_credentials,
  public.member_devices, public.meetings, public.meeting_secrets, public.attendance
  from anon;
-- Server-only tables: not even signed-in officers.
revoke all on public.member_credentials, public.member_devices, public.meeting_secrets
  from authenticated;

create policy "Officers can see the officer list"
  on public.officers for select to authenticated
  using (public.current_officer_role() is not null);

create policy "Officers can see members"
  on public.members for select to authenticated
  using (public.current_officer_role() is not null);
create policy "Recorders can add members"
  on public.members for insert to authenticated
  with check (public.current_officer_role() = 'recorder');
create policy "Recorders can edit members"
  on public.members for update to authenticated
  using (public.current_officer_role() = 'recorder')
  with check (public.current_officer_role() = 'recorder');
-- No delete policy: members are deactivated, never deleted, so history is kept.

create policy "Officers can see meetings"
  on public.meetings for select to authenticated
  using (public.current_officer_role() is not null);
create policy "Recorders can create meetings"
  on public.meetings for insert to authenticated
  with check (public.current_officer_role() = 'recorder');
create policy "Recorders can edit meetings"
  on public.meetings for update to authenticated
  using (public.current_officer_role() = 'recorder')
  with check (public.current_officer_role() = 'recorder');
create policy "Recorders can delete meetings"
  on public.meetings for delete to authenticated
  using (public.current_officer_role() = 'recorder');

create policy "Officers can see attendance"
  on public.attendance for select to authenticated
  using (public.current_officer_role() is not null);
create policy "Recorders can record attendance"
  on public.attendance for insert to authenticated
  with check (public.current_officer_role() = 'recorder');
create policy "Recorders can edit attendance"
  on public.attendance for update to authenticated
  using (public.current_officer_role() = 'recorder')
  with check (public.current_officer_role() = 'recorder');
create policy "Recorders can remove attendance"
  on public.attendance for delete to authenticated
  using (public.current_officer_role() = 'recorder');

-- Reports -------------------------------------------------------------------

-- Per-member totals over meetings that have closed since the member joined.
-- security_invoker: the caller's RLS applies, so only officers get rows.
create view public.member_attendance_summary
with (security_invoker = true)
as
select
  m.id as member_id,
  m.full_name,
  m.active,
  count(mt.id) as meetings_held,
  count(a.member_id) filter (where a.status = 'present') as present,
  count(a.member_id) filter (where a.status = 'late') as late,
  count(a.member_id) filter (where a.status = 'excused') as excused,
  count(mt.id) - count(a.member_id) as absent
from public.members m
left join public.meetings mt
  on mt.closes_at < now()
  and (m.joined_on is null or mt.starts_at::date >= m.joined_on)
left join public.attendance a
  on a.meeting_id = mt.id and a.member_id = m.id
group by m.id;

revoke all on public.member_attendance_summary from anon;
