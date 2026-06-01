import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  parseStoredUserRole,
  ROLE_STORAGE_KEY,
  USER_ROLE_LABELS,
} from '../constants/userRoles'
import type { AuditLog, BlockchainRecord, TdrRecord, TdrStatus, UserRole } from '../types/tdr'

const seedData: TdrRecord[] = [
  {
    drcId: 'DRC001',
    owner: 'Rajesh Kumar',
    area: 1200,
    fsi: 2.5,
    status: 'ISSUED',
    txHash: '0xA34F56B89',
    verified: true,
  },
  {
    drcId: 'DRC002',
    owner: 'Priya Sharma',
    area: 1800,
    fsi: 3.1,
    status: 'ACTIVE',
    txHash: '0xTX298ABCD',
    verified: true,
  },
  {
    drcId: 'DRC003',
    owner: 'Aarav Developers',
    area: 900,
    fsi: 1.9,
    status: 'TRANSFERRED',
    txHash: '0xFF777D912',
    verified: true,
  },
  {
    drcId: 'DRC004',
    owner: 'Skyline Infra',
    area: 2200,
    fsi: 3.4,
    status: 'PENDING',
    txHash: '0xPNDG44221',
    verified: false,
  },
]

const defaultBlockchainData: BlockchainRecord = {
  txHash: '0xA34F56B89',
  blockNumber: 10234,
  status: 'VALID',
  timestamp: '2026-04-29',
  signature: '0xSIGN123',
}

type Toast = { id: number; message: string }
type UserProfile = { name: string; email: string }

export interface TdrContextType {
  tdrData: TdrRecord[]
  auditLogs: AuditLog[]
  role: UserRole
  theme: 'light' | 'dark'
  globalSearch: string
  toasts: Toast[]
  userProfile: UserProfile | null
  setRole: (role: UserRole) => void
  setUserProfile: (profile: UserProfile | null) => void
  /** Clears saved profile + role (call before navigating away on logout). */
  signOut: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setGlobalSearch: (value: string) => void
  dismissToast: (id: number) => void
  verifyRecord: (query: string) => BlockchainRecord | null
  transferTdr: (drcId: string, buyer: string) => void
  utilizeTdr: (drcId: string, project: string, deductFsi: number) => void
}

export const TdrContext = createContext<TdrContextType | null>(null)

const randomHash = () => `0x${Math.random().toString(16).substring(2, 11).toUpperCase()}`

const now = () => new Date().toLocaleString()
const PROFILE_STORAGE_KEY = 'tdr.portal.profile'

export function TdrProvider({ children }: { children: ReactNode }) {
  const [tdrData, setTdrData] = useState<TdrRecord[]>(seedData)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { action: 'DRC Issued', actor: USER_ROLE_LABELS.TdrOfficer, timestamp: now(), txHash: '0xA34F56B89' },
  ])
  const [role, setRoleState] = useState<UserRole>(() => parseStoredUserRole(localStorage.getItem(ROLE_STORAGE_KEY)) ?? 'SuperAdmin')
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Partial<UserProfile>
      if (typeof parsed.name === 'string' && typeof parsed.email === 'string') {
        return { name: parsed.name, email: parsed.email }
      }
    } catch {
      return null
    }
    return null
  })

  const setRole = (next: UserRole) => {
    setRoleState(next)
    localStorage.setItem(ROLE_STORAGE_KEY, next)
  }
  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileState(profile)
    if (profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
      return
    }
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  }

  const signOut = useCallback(() => {
    setUserProfileState(null)
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    localStorage.removeItem(ROLE_STORAGE_KEY)
    setRoleState(parseStoredUserRole(null) ?? 'SuperAdmin')
  }, [])
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [globalSearch, setGlobalSearch] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme)
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const pushToast = (message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2600)
  }

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((toast) => toast.id !== id))

  const addAuditLog = (action: string, txHash: string) => {
    setAuditLogs((prev) => [{ action, actor: USER_ROLE_LABELS[role], timestamp: now(), txHash }, ...prev])
  }

  const verifyRecord = (query: string): BlockchainRecord | null => {
    const record = tdrData.find(
      (item) => item.txHash.toLowerCase() === query.toLowerCase() || item.drcId.toLowerCase() === query.toLowerCase(),
    )

    if (!record) return null

    const statusMap: Record<TdrStatus, BlockchainRecord['status']> = {
      ISSUED: 'VALID',
      ACTIVE: 'VALID',
      TRANSFERRED: 'VALID',
      UTILIZED: 'UTILIZED',
      PENDING: 'VALID',
      REVOKED: 'REVOKED',
    }

    return {
      ...defaultBlockchainData,
      txHash: record.txHash,
      status: statusMap[record.status],
      blockNumber: 10000 + Math.floor(Math.random() * 9000),
      timestamp: new Date().toISOString().slice(0, 10),
      signature: `0xSIGN${record.drcId}`,
    }
  }

  const transferTdr = (drcId: string, buyer: string) => {
    const txHash = randomHash()
    setTdrData((prev) =>
      prev.map((item) => (item.drcId === drcId ? { ...item, owner: buyer, status: 'TRANSFERRED', txHash } : item)),
    )
    addAuditLog(`TDR transferred to ${buyer}`, txHash)
    pushToast(`Transfer successful (${drcId})`)
  }

  const utilizeTdr = (drcId: string, project: string, deductFsi: number) => {
    const txHash = randomHash()
    setTdrData((prev) =>
      prev.map((item) =>
        item.drcId === drcId
          ? { ...item, fsi: Math.max(Number((item.fsi - deductFsi).toFixed(2)), 0), status: 'UTILIZED', txHash }
          : item,
      ),
    )
    addAuditLog(`TDR utilized for ${project}`, txHash)
    pushToast(`Utilization saved (${drcId})`)
  }

  const value = {
    tdrData,
    auditLogs,
    role,
    theme,
    globalSearch,
    toasts,
    userProfile,
    setRole,
    setUserProfile,
    signOut,
    setTheme,
    setGlobalSearch,
    dismissToast,
    verifyRecord,
    transferTdr,
    utilizeTdr,
  }

  return <TdrContext.Provider value={value}>{children}</TdrContext.Provider>
}
