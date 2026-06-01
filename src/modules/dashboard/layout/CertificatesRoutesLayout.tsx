import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { CertificatesDataLoadingProvider } from './certificatesDataLoadingContext'

function CertificatesSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <span
        className="h-9 w-9 shrink-0 animate-spin rounded-full border-2 border-[#91caff] border-t-[#1d39c4]"
        aria-hidden
      />
      <p className="text-center text-sm font-medium text-[#1d39c4]">{label ?? 'Loading…'}</p>
    </div>
  )
}

export default function CertificatesRoutesLayout() {
  return (
    <CertificatesDataLoadingProvider>
      <Suspense
        fallback={
          <div className="flex min-h-[45vh] items-center justify-center bg-[#f6f8fb]">
            <div className="rounded-xl border border-[#d6e4ff] bg-white px-10 py-8 shadow-sm">
              <CertificatesSpinner label="Loading certificates…" />
            </div>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </CertificatesDataLoadingProvider>
  )
}
