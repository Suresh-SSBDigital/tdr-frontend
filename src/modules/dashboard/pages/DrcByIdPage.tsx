import { Suspense, lazy } from 'react'
import { useParams } from 'react-router-dom'

// Reuse the already-tested DRC certificate UI + fetching logic.
const DrcApiDetailPage = lazy(() => import('./DrcApiDetailPage'))

export default function DrcByIdPage() {
  const { drcId = '' } = useParams()

  // Keep wrapper minimal; DrcApiDetailPage handles loading/error/data + theme.
  return (
    <Suspense fallback={<div className="min-h-[48vh]" />}>{drcId ? <DrcApiDetailPage /> : null}</Suspense>
  )
}

