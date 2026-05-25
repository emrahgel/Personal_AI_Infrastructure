import { createClient } from '@/lib/supabase/server'

type OrganizationMembership = {
  organization_id: string
  role: string
}

export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireOrganizationAccess(orgId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('organization_id', orgId)
    .maybeSingle<OrganizationMembership>()

  if (error) {
    throw new Error(`Membership sorgusu başarısız: ${error.message}`)
  }

  if (!data) {
    throw new Error('Forbidden')
  }

  return {
    user,
    membership: data,
  }
}

export async function requireRole(orgId: string, allowedRoles: string[]) {
  const { user, membership } = await requireOrganizationAccess(orgId)

  if (!allowedRoles.includes(membership.role)) {
    throw new Error('Forbidden')
  }

  return {
    user,
    membership,
  }
}

export async function getCurrentOrganization() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<OrganizationMembership>()

  if (error) {
    throw new Error(`Organization sorgusu başarısız: ${error.message}`)
  }

  if (!data) {
    throw new Error('No active organization')
  }

  return data
}
