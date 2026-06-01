import { useState } from 'react'
import { useTdr } from '../context/useTdr'
import { QRCodeSVG } from 'qrcode.react'

export default function VerifyPanel() {
  const { verifyRecord } = useTdr()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<ReturnType<typeof verifyRecord> | null>(null)

  const onVerify = () => {
    setResult(verifyRecord(query))
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-2 font-semibold">Blockchain Verification</h3>
      <div className="flex flex-col gap-2 md:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter Tx Hash or DRC ID"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <button onClick={onVerify} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500">
          Verify
        </button>
      </div>

      {result ? (
        <div className="mt-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <p>Status: <strong>{result.status}</strong></p>
          <p>Block Number: <strong>{result.blockNumber}</strong></p>
          <p>Timestamp: <strong>{result.timestamp}</strong></p>
          <p>Digital Signature: <strong>{result.signature}</strong></p>
          <div className="md:col-span-2 mt-2">
            <QRCodeSVG value={result.txHash} size={92} />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No verification result yet.</p>
      )}
    </section>
  )
}
