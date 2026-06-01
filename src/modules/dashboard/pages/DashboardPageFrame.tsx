import type { ReactNode } from 'react'
import { PageHeader } from '../components'

interface DashboardPageFrameProps {
  title: string
  subtitle: string
  children: ReactNode
}

export default function DashboardPageFrame({ title, subtitle, children }: DashboardPageFrameProps) {
  return (
    <div className="space-y-3">
      <PageHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  )
}
