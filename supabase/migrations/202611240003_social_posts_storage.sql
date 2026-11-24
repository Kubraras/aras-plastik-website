-- Public delivery for published social-style site posts; only the allowlisted
-- administrator can add, replace, or remove files from this bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('social-posts', 'social-posts', true, 52428800, array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads social post media" on storage.objects;
create policy "Public reads social post media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'social-posts');

drop policy if exists "Admins upload social post media" on storage.objects;
create policy "Admins upload social post media" on storage.objects
  for insert to authenticated with check (bucket_id = 'social-posts' and public.is_admin());

drop policy if exists "Admins update social post media" on storage.objects;
create policy "Admins update social post media" on storage.objects
  for update to authenticated using (bucket_id = 'social-posts' and public.is_admin())
  with check (bucket_id = 'social-posts' and public.is_admin());

drop policy if exists "Admins delete social post media" on storage.objects;
create policy "Admins delete social post media" on storage.objects
  for delete to authenticated using (bucket_id = 'social-posts' and public.is_admin());
