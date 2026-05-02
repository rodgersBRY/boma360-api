create table if not exists notification_tokens (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  token           text not null unique,
  platform        varchar(20) not null check (platform in ('android')),
  device_id       text,
  last_seen_at    timestamp with time zone not null default now(),
  created_at      timestamp with time zone not null default now(),
  updated_at      timestamp with time zone not null default now()
);

create index if not exists idx_notification_tokens_org_user
  on notification_tokens(organization_id, user_id);

create index if not exists idx_notification_tokens_last_seen
  on notification_tokens(last_seen_at);

alter table notification_tokens enable row level security;

create policy "org members can select notification tokens"
  on notification_tokens for select
  using (organization_id = auth_org_id());

create policy "org members can insert notification tokens"
  on notification_tokens for insert
  with check (organization_id = auth_org_id() and user_id = auth.uid());

create policy "org members can update notification tokens"
  on notification_tokens for update
  using (organization_id = auth_org_id() and user_id = auth.uid())
  with check (organization_id = auth_org_id() and user_id = auth.uid());

create policy "org members can delete notification tokens"
  on notification_tokens for delete
  using (organization_id = auth_org_id() and user_id = auth.uid());
