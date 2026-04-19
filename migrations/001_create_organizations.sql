-- Organizations: one farm per account
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        varchar not null,
  created_at  timestamp with time zone default now()
);

-- Membership: ties a Supabase auth user to an organization
create table organization_members (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  role             varchar not null default 'owner' check (role in ('owner', 'member')),
  created_at       timestamp with time zone default now(),
  unique (organization_id, user_id)
);

-- RLS
alter table organizations enable row level security;
alter table organization_members enable row level security;

create policy "members can view their organization"
  on organizations for select
  using (
    id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

create policy "members can view their own membership"
  on organization_members for select
  using (user_id = auth.uid());

-- Service role bypasses RLS for sign-up provisioning
create policy "service role can manage organizations"
  on organizations for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role can manage members"
  on organization_members for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
