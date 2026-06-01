import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

const noop = (_v: boolean) => { }

const SetLoadingCtx = createContext<(v: boolean) => void>(noop)

export function useCertificatesSetDataLoading(): (v: boolean) => void {
  return useContext(SetLoadingCtx)
}

function CertificatesDataSpinner({ label }: { label?: string }) {
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

export function CertificatesDataLoadingProvider({ children }: { children: ReactNode }) {
  const [dataLoading, setDataLoading] = useState(false)
  const setBusy = useCallback((v: boolean) => {
    setDataLoading(v)
  }, [])

  return (
    <SetLoadingCtx.Provider value={setBusy}>
      <div className="relative min-h-[12rem]">
        {dataLoading ? (
          <div
            className="absolute inset-0 z-30 flex min-h-[45vh] items-center justify-center bg-[#f6f8fb]/92 backdrop-blur-[1px]"
            aria-busy="true"
            aria-live="polite"
          >
            <div className="rounded-xl border border-[#d6e4ff] bg-white px-10 py-8 shadow-[0_8px_32px_-12px_rgba(29,57,196,0.25)]">
              <CertificatesDataSpinner label="Loading DRC certificates…" />
            </div>
          </div>
        ) : null}
        {children}
      </div>
    </SetLoadingCtx.Provider>
  )
}
