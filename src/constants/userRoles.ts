import type { UserRole } from '../types/tdr'

/** Persisted between sessions until API-backed roles replace inference. */
export const ROLE_STORAGE_KEY = 'tdr.portal.role'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SuperAdmin: 'Super Admin',
  TdrOfficer: 'TDR Officer',
  Auditor: 'Auditor',
  TcpAdmin: 'TCP Admin',
  Developer: 'Developer',
}

/**
 * Workflow authority: statutory / TCP workflow decisions stay with notified officers (TDR Officer, TCP Admin).
 * Super Admin and Auditor align with typical gazette-style separation — statewide monitoring without substituting field approvals.
 */
export function canPerformWorkflowApprovals(role: UserRole): boolean {
  return role === 'TdrOfficer' || role === 'TcpAdmin'
}

export function isReadOnlyApplicationViewer(role: UserRole): boolean {
  return !canPerformWorkflowApprovals(role)
}

export function dashboardTitleForRole(role: UserRole): string {
  if (role === 'SuperAdmin') return 'Super Admin Dashboard'
  if (role === 'TdrOfficer') return 'TDR Officer Dashboard'
  if (role === 'Auditor') return 'Auditor Dashboard'
  if (role === 'TcpAdmin') return 'TCP Admin Dashboard'
  return 'Developer Dashboard'
}

export function portalSubtitleForRole(role: UserRole): string {
  if (role === 'SuperAdmin') return 'Super Admin Portal'
  return 'TDR Blockchain Portal'
}

export function userInitialsFromRole(role: UserRole): string {
  const label = USER_ROLE_LABELS[role]
  const parts = label.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return label.slice(0, 2).toUpperCase()
}

/** Until `/api/auth/signin` returns roles, infer from email for demo / staging parity with portal fixtures. */
export function inferUserRoleFromEmail(email: string): UserRole {
  const e = email.trim().toLowerCase()
  if (!e) return 'SuperAdmin'
  if (e.includes('super.admin') || e.includes('superadmin')) return 'SuperAdmin'
  if (e.includes('auditor')) return 'Auditor'
  if (e.includes('officer')) return 'TdrOfficer'
  if (e.includes('developer') || e.includes('dev.')) return 'Developer'
  if (e.includes('tcp.admin')) return 'TcpAdmin'
  if (e.includes('admin')) return 'TcpAdmin'
  return 'SuperAdmin'
}

export function parseStoredUserRole(raw: string | null): UserRole | null {
  if (
    raw === 'SuperAdmin' ||
    raw === 'TdrOfficer' ||
    raw === 'Auditor' ||
    raw === 'TcpAdmin' ||
    raw === 'Developer'
  ) {
    return raw
  }
  if (raw === 'Admin') return 'TcpAdmin'
  if (raw === 'Officer') return 'TdrOfficer'
  return null
}
