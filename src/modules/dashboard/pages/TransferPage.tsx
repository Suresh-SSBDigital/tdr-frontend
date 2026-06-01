import { CertificateTransferPanel } from '../components'
import DashboardPageFrame from './DashboardPageFrame'

export default function TransferPage() {
  return (
    <DashboardPageFrame
      title="TDR / DRC transfer"
      subtitle="Issuance व transfer अलग blockchain anchors — ledger व आवेदन विवरण दोनों से लिंक देखें। नीचे डेमो ट्रांसफ़र भी चला सकते हैं।"
    >
      <CertificateTransferPanel />
    </DashboardPageFrame>
  )
}
