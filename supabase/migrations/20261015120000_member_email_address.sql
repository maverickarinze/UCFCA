-- Members: add email and address, matching the club's member register.

alter table public.members
  add column email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add column address text;

-- One member per email address, ignoring case.
create unique index members_email_key on public.members (lower(email));
