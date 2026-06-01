import { VerifyPanel } from '../components'
import DashboardPageFrame from './DashboardPageFrame'

export default function VerificationPage() {
  return (
    <DashboardPageFrame title="Verification" subtitle="Validate DRC or transaction hash against simulated blockchain ledger.">
      <VerifyPanel />
    </DashboardPageFrame>
  )
}
