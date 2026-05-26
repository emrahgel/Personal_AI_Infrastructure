create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(org uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org
      and om.user_id = auth.uid()
      and om.role = any (allowed_roles)
  );
$$;

-- organizations policies
create policy organizations_select_member
on public.organizations for select
using (public.is_org_member(id));

create policy organizations_insert_owner
on public.organizations for insert
with check (owner_id = auth.uid());

create policy organizations_update_owner_admin
on public.organizations for update
using (public.has_org_role(id, array['owner', 'admin']))
with check (public.has_org_role(id, array['owner', 'admin']));

create policy organizations_delete_owner
on public.organizations for delete
using (public.has_org_role(id, array['owner']));

-- organization_members policies
create policy org_members_select_owner_admin
on public.organization_members for select
using (public.has_org_role(organization_id, array['owner', 'admin']));

create policy org_members_insert_owner_admin
on public.organization_members for insert
with check (public.has_org_role(organization_id, array['owner', 'admin']));

create policy org_members_update_owner_only
on public.organization_members for update
using (public.has_org_role(organization_id, array['owner']))
with check (public.has_org_role(organization_id, array['owner']));

create policy org_members_delete_owner_only
on public.organization_members for delete
using (public.has_org_role(organization_id, array['owner']));

-- organization_modules policies
create policy org_modules_select_owner_admin
on public.organization_modules for select
using (public.has_org_role(organization_id, array['owner', 'admin']));

create policy org_modules_insert_owner_admin
on public.organization_modules for insert
with check (public.has_org_role(organization_id, array['owner', 'admin']));

create policy org_modules_update_owner_admin
on public.organization_modules for update
using (public.has_org_role(organization_id, array['owner', 'admin']))
with check (public.has_org_role(organization_id, array['owner', 'admin']));

create policy org_modules_delete_owner_admin
on public.organization_modules for delete
using (public.has_org_role(organization_id, array['owner', 'admin']));

-- audit_logs policies
create policy audit_logs_select_owner_admin
on public.audit_logs for select
using (public.has_org_role(organization_id, array['owner', 'admin']));

create policy audit_logs_insert_member
on public.audit_logs for insert
with check (public.is_org_member(organization_id));
