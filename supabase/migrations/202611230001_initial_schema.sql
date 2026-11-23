-- Aras Plastik website schema. Run with `supabase db push` or the Supabase SQL editor.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null check (char_length(name_tr) between 1 and 120),
  name_en text check (name_en is null or char_length(name_en) <= 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description_tr text,
  description_en text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null check (char_length(name_tr) between 1 and 180),
  name_en text check (name_en is null or char_length(name_en) <= 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  product_code text unique check (product_code is null or char_length(product_code) <= 80),
  category_id uuid references public.categories(id) on delete set null,
  short_description_tr text check (short_description_tr is null or char_length(short_description_tr) <= 320),
  short_description_en text check (short_description_en is null or char_length(short_description_en) <= 320),
  description_tr text,
  description_en text,
  technical_specs jsonb not null default '{}'::jsonb check (jsonb_typeof(technical_specs) = 'object'),
  material text check (material is null or char_length(material) <= 160),
  dimensions text check (dimensions is null or char_length(dimensions) <= 160),
  usage_area_tr text,
  usage_area_en text,
  cover_image text,
  video_url text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  seo_title_tr text check (seo_title_tr is null or char_length(seo_title_tr) <= 180),
  seo_title_en text check (seo_title_en is null or char_length(seo_title_en) <= 180),
  seo_description_tr text check (seo_description_tr is null or char_length(seo_description_tr) <= 320),
  seo_description_en text check (seo_description_en is null or char_length(seo_description_en) <= 320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_public_listing_idx on public.products (is_published, is_featured, created_at desc);
create index products_category_idx on public.products (category_id, created_at desc);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text_tr text,
  alt_text_en text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (order_number ~ '^AP-[A-Z0-9-]{8,48}$'),
  submission_token uuid not null unique,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null check (char_length(product_name_snapshot) between 1 and 180),
  product_code_snapshot text check (product_code_snapshot is null or char_length(product_code_snapshot) <= 80),
  quantity integer not null check (quantity between 1 and 1000000),
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  phone text not null check (phone ~ '^[+]?[0-9[:space:]().-]{7,24}$'),
  email text check (email is null or char_length(email) <= 254),
  company_name text check (company_name is null or char_length(company_name) <= 120),
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new','reviewing','contacted','quoted','approved','completed','rejected')),
  admin_note text,
  privacy_consent boolean not null default false check (privacy_consent),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quote_requests_created_idx on public.quote_requests (created_at desc);
create index quote_requests_status_idx on public.quote_requests (status, created_at desc);
create index quote_requests_product_name_idx on public.quote_requests (product_name_snapshot);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (phone ~ '^[+]?[0-9[:space:]().-]{7,24}$'),
  email text check (email is null or char_length(email) <= 254),
  company_name text check (company_name is null or char_length(company_name) <= 120),
  message text not null check (char_length(message) between 10 and 5000),
  privacy_consent boolean not null default false check (privacy_consent),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);
create index contact_messages_unread_idx on public.contact_messages (is_read, created_at desc);

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'Aras Plastik',
  company_description_tr text,
  company_description_en text,
  phone text,
  email text,
  whatsapp text,
  address_tr text,
  address_en text,
  map_url text,
  instagram text,
  linkedin text,
  logo_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create table public.site_content (
  content_key text primary key check (content_key ~ '^[a-z0-9_-]{2,80}$'),
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

-- This table has no client policies. The narrowly scoped SECURITY DEFINER RPC
-- below is the only public operation exposed for form rate limiting.
create table public.form_rate_limits (
  id bigint generated always as identity primary key,
  request_key text not null check (request_key ~ '^[a-f0-9]{64}$'),
  action text not null check (action in ('contact','quote')),
  created_at timestamptz not null default now()
);
create index form_rate_limits_lookup_idx on public.form_rate_limits (request_key, action, created_at desc);
create index form_rate_limits_expiry_idx on public.form_rate_limits (created_at);

create or replace function public.consume_form_rate_limit(p_key text, p_action text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_count integer;
begin
  if p_key !~ '^[a-f0-9]{64}$' or p_action not in ('contact','quote') or p_limit < 1 or p_limit > 20 or p_window_seconds < 60 or p_window_seconds > 3600 then
    return false;
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_action), pg_catalog.hashtext(p_key));
  delete from public.form_rate_limits where created_at < now() - interval '1 hour';
  delete from public.form_rate_limits
    where request_key = p_key and action = p_action
      and created_at < now() - pg_catalog.make_interval(secs => p_window_seconds);
  insert into public.form_rate_limits (request_key, action) values (p_key, p_action);
  select count(*) into request_count from public.form_rate_limits
    where request_key = p_key and action = p_action
      and created_at >= now() - pg_catalog.make_interval(secs => p_window_seconds);
  return request_count <= p_limit;
end;
$$;
revoke all on function public.consume_form_rate_limit(text, text, integer, integer) from public;
revoke all on function public.consume_form_rate_limit(text, text, integer, integer) from anon, authenticated;
grant execute on function public.consume_form_rate_limit(text, text, integer, integer) to service_role;

create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger quote_requests_set_updated_at before update on public.quote_requests for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
create trigger site_content_set_updated_at before update on public.site_content for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_content enable row level security;
alter table public.form_rate_limits enable row level security;

create policy "Public reads active categories" on public.categories for select to anon, authenticated using (is_active or public.is_admin());
create policy "Admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public reads published products" on public.products for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public reads images for published products" on public.product_images for select to anon, authenticated using (
  exists (select 1 from public.products p where p.id = product_id and (p.is_published or public.is_admin()))
);
create policy "Admins manage product images" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins read quote requests" on public.quote_requests for select to authenticated using (public.is_admin());
create policy "Admins update quote requests" on public.quote_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins read contact messages" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "Admins update contact messages" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public reads site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins update site settings" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public reads published site content" on public.site_content for select to anon, authenticated using (is_public or public.is_admin());
create policy "Admins manage site content" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Public image/video delivery, authenticated administrator upload and deletion only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-images', 'product-images', true, 15728640, array['image/jpeg','image/png','image/webp','image/avif']),
  ('product-videos', 'product-videos', true, 52428800, array['video/mp4','video/webm']),
  ('company-images', 'company-images', true, 15728640, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads website media" on storage.objects for select to anon, authenticated using (bucket_id in ('product-images','product-videos','company-images'));
create policy "Admins upload website media" on storage.objects for insert to authenticated with check (bucket_id in ('product-images','product-videos','company-images') and public.is_admin());
create policy "Admins update website media" on storage.objects for update to authenticated using (bucket_id in ('product-images','product-videos','company-images') and public.is_admin()) with check (bucket_id in ('product-images','product-videos','company-images') and public.is_admin());
create policy "Admins delete website media" on storage.objects for delete to authenticated using (bucket_id in ('product-images','product-videos','company-images') and public.is_admin());

grant select on public.products, public.categories, public.product_images, public.site_settings, public.site_content to anon, authenticated;
grant select on public.products to service_role;
grant insert on public.quote_requests, public.contact_messages to service_role;
grant select, insert, update, delete on public.products, public.categories, public.product_images, public.site_content to authenticated;
grant select, update on public.quote_requests, public.contact_messages, public.site_settings to authenticated;
