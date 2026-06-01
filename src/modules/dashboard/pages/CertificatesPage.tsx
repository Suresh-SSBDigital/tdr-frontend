import { USER_ROLE_LABELS } from '../../../constants/userRoles'
import { useTdr } from '../../../context/useTdr'
import { DrcFullHistoryPanel, PageHeader } from '../components'

export default function CertificatesPage() {
  const { role } = useTdr()

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

      <DrcFullHistoryPanel />
    </div>
  )
}
