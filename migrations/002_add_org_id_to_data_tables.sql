-- Add organization_id to every data table.
-- NOT NULL is enforced after backfilling existing rows.

alter table cows             add column organization_id uuid references organizations(id) on delete cascade;
alter table health_records   add column organization_id uuid references organizations(id) on delete cascade;
alter table breeding_records add column organization_id uuid references organizations(id) on delete cascade;
alter table milk_logs        add column organization_id uuid references organizations(id) on delete cascade;
alter table expense_logs     add column organization_id uuid references organizations(id) on delete cascade;
alter table milk_sales       add column organization_id uuid references organizations(id) on delete cascade;

-- After running the data backfill script, enforce NOT NULL:
-- alter table cows             alter column organization_id set not null;
-- alter table health_records   alter column organization_id set not null;
-- alter table breeding_records alter column organization_id set not null;
-- alter table milk_logs        alter column organization_id set not null;
-- alter table expense_logs     alter column organization_id set not null;
-- alter table milk_sales       alter column organization_id set not null;
