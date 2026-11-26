alter table public.contact_messages
  add column if not exists tracking_token_hash text,
  add column if not exists reply_text text,
  add column if not exists reply_updated_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contact_messages_tracking_token_hash_format') then
    alter table public.contact_messages add constraint contact_messages_tracking_token_hash_format
      check (tracking_token_hash is null or tracking_token_hash ~ '^[a-f0-9]{64}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'contact_messages_reply_text_length') then
    alter table public.contact_messages add constraint contact_messages_reply_text_length
      check (reply_text is null or char_length(reply_text) between 1 and 5000);
  end if;
end;
$$;

create unique index if not exists contact_messages_tracking_token_hash_uidx
  on public.contact_messages (tracking_token_hash)
  where tracking_token_hash is not null;

grant select on public.contact_messages to service_role;
