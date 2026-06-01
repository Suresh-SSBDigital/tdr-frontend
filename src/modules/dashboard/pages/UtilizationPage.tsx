import { UtilizationForm } from '../components'
import DashboardPageFrame from './DashboardPageFrame'

export default function UtilizationPage() {
  return (
    <DashboardPageFrame title="Utilization" subtitle="Map DRC usage with project and update lifecycle status.">
      <UtilizationForm />
    </DashboardPageFrame>
  )
}
