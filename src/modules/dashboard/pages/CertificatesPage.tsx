import { useMemo, useState } from 'react'
import { USER_ROLE_LABELS } from '../../../constants/userRoles'
import { useTdr } from '../../../context/useTdr'
import { DrcFullHistoryPanel, PageHeader } from '../components'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../../../api/api'
import type { PaginationState } from '@tanstack/react-table'
import type { DrcCertApiResponse } from '../components/drcFullHistoryPanel.types'

const API_KEY = (import.meta.env.VITE_API_KEY ?? '').trim()

export default function CertificatesPage() {
  const { role } = useTdr()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const limit = pagination.pageSize
  const offset = pagination.pageIndex * pagination.pageSize

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    p.set('limit', String(limit))
    p.set('offset', String(offset))
    p.set('sortDir', 'desc')
    return p
  }, [limit, offset])

  const {
    data: apiData,
    isLoading: apiIsLoading,
    error: apiError,
  } = useQuery<DrcCertApiResponse>({
    queryKey: ['drc-certificates', limit, offset],
    queryFn: ({ signal }) =>
      apiRequest<DrcCertApiResponse>({
        method: 'GET',
        url: `/api/tdr/drc-certificates/all?${qs.toString()}`,
        headers: API_KEY
          ? { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
        signal,
      }),
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="All DRC"
        subtitle={
          role === 'SuperAdmin' || role === 'Auditor'
            ? `Statewide DRC blockchain history (${USER_ROLE_LABELS[role]} monitoring view).`
            : 'Full ledger of DRC events across every certificate — filter, sort, and open individual ledgers.'
        }
      />

      <DrcFullHistoryPanel
        apiData={apiData ?? null}
        apiIsLoading={apiIsLoading}
        apiError={apiError}
        pagination={pagination}
        setPagination={setPagination}
      />
    </div>
  )
}

