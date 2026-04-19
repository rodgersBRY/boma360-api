-- Drop any pre-existing permissive policies, then add org-scoped ones.
-- Run 002 before this migration.

-- Helper: returns the caller's organization_id
create or replace function auth_org_id() returns uuid
  language sql stable
  as $$
    select organization_id
    from organization_members
    where user_id = auth.uid()
    limit 1;
  $$;

-- ── COWS ─────────────────────────────────────────────────────────────────────

drop policy if exists "Users can view their own cows" on cows;
drop policy if exists "Users can insert their own cows" on cows;
drop policy if exists "Users can update their own cows" on cows;

create policy "org members can select cows"
  on cows for select
  using (organization_id = auth_org_id());

create policy "org members can insert cows"
  on cows for insert
  with check (organization_id = auth_org_id());

create policy "org members can update cows"
  on cows for update
  using (organization_id = auth_org_id());

-- ── HEALTH RECORDS ───────────────────────────────────────────────────────────

drop policy if exists "Users can view their own health records" on health_records;
drop policy if exists "Users can insert their own health records" on health_records;
drop policy if exists "Users can update their own health records" on health_records;

create policy "org members can select health_records"
  on health_records for select
  using (organization_id = auth_org_id());

create policy "org members can insert health_records"
  on health_records for insert
  with check (organization_id = auth_org_id());

create policy "org members can update health_records"
  on health_records for update
  using (organization_id = auth_org_id());

-- ── BREEDING RECORDS ─────────────────────────────────────────────────────────

drop policy if exists "Users can view their own breeding records" on breeding_records;
drop policy if exists "Users can insert their own breeding records" on breeding_records;
drop policy if exists "Users can update their own breeding records" on breeding_records;

create policy "org members can select breeding_records"
  on breeding_records for select
  using (organization_id = auth_org_id());

create policy "org members can insert breeding_records"
  on breeding_records for insert
  with check (organization_id = auth_org_id());

create policy "org members can update breeding_records"
  on breeding_records for update
  using (organization_id = auth_org_id());

-- ── MILK LOGS ────────────────────────────────────────────────────────────────

drop policy if exists "Users can view their own milk logs" on milk_logs;
drop policy if exists "Users can insert their own milk logs" on milk_logs;
drop policy if exists "Users can update their own milk logs" on milk_logs;

create policy "org members can select milk_logs"
  on milk_logs for select
  using (organization_id = auth_org_id());

create policy "org members can insert milk_logs"
  on milk_logs for insert
  with check (organization_id = auth_org_id());

create policy "org members can update milk_logs"
  on milk_logs for update
  using (organization_id = auth_org_id());

-- ── EXPENSE LOGS ─────────────────────────────────────────────────────────────

drop policy if exists "Users can view their own expense logs" on expense_logs;
drop policy if exists "Users can insert their own expense logs" on expense_logs;
drop policy if exists "Users can update their own expense logs" on expense_logs;

create policy "org members can select expense_logs"
  on expense_logs for select
  using (organization_id = auth_org_id());

create policy "org members can insert expense_logs"
  on expense_logs for insert
  with check (organization_id = auth_org_id());

create policy "org members can update expense_logs"
  on expense_logs for update
  using (organization_id = auth_org_id());

-- ── MILK SALES ───────────────────────────────────────────────────────────────

drop policy if exists "Users can view their own milk sales" on milk_sales;
drop policy if exists "Users can insert their own milk sales" on milk_sales;
drop policy if exists "Users can update their own milk sales" on milk_sales;

create policy "org members can select milk_sales"
  on milk_sales for select
  using (organization_id = auth_org_id());

create policy "org members can insert milk_sales"
  on milk_sales for insert
  with check (organization_id = auth_org_id());

create policy "org members can update milk_sales"
  on milk_sales for update
  using (organization_id = auth_org_id());
