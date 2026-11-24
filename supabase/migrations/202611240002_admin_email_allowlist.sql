-- Limit application and RLS administrator access to the requested account.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    lower(auth.jwt() ->> 'email') = 'davutaras1978@gmail.com'
    and auth.jwt() -> 'app_metadata' ->> 'role' = 'admin',
    false
  );
$$;
