import {
  getCurrentOrganization,
  requireOrganizationAccess,
  requireRole,
  requireUser,
} from '@/lib/auth/require-user'

/**
 * Kritik kural:
 * - Client'tan gelen organization_id değerine doğrudan güvenmeyin.
 * - Her state-changing server action/route içinde bu helper'lardan birini kullanarak
 *   user + organization membership doğrulaması yapın.
 */

export { requireUser, requireOrganizationAccess, requireRole, getCurrentOrganization }

export async function assertStateChangingAccess(params: {
  organizationIdFromClient: string
  allowedRoles?: string[]
}) {
  const { organizationIdFromClient, allowedRoles } = params

  if (allowedRoles && allowedRoles.length > 0) {
    return requireRole(organizationIdFromClient, allowedRoles)
  }

  return requireOrganizationAccess(organizationIdFromClient)
}
