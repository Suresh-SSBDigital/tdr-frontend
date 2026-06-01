import { AuditLogs } from '../components'
import DashboardPageFrame from './DashboardPageFrame'

export default function AuditLogsPage() {
  return (
    <DashboardPageFrame title="Audit Logs" subtitle="Track every action with actor, timestamp, and transaction hash.">
      <AuditLogs />
    </DashboardPageFrame>
  )
}
