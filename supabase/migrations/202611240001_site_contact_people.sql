alter table public.site_settings
  add column if not exists contact_person_1_name text not null default 'Davut Aras',
  add column if not exists contact_person_1_phone text not null default '05363548037',
  add column if not exists contact_person_2_name text not null default 'Muhammed Yusuf Aras',
  add column if not exists contact_person_2_phone text not null default '05453558037';

update public.site_settings
set contact_person_1_name = coalesce(nullif(btrim(contact_person_1_name), ''), 'Davut Aras'),
    contact_person_1_phone = coalesce(nullif(btrim(contact_person_1_phone), ''), '05363548037'),
    contact_person_2_name = coalesce(nullif(btrim(contact_person_2_name), ''), 'Muhammed Yusuf Aras'),
    contact_person_2_phone = coalesce(nullif(btrim(contact_person_2_phone), ''), '05453558037');
