import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import BlockchainAnchor from '../../../components/BlockchainAnchor'
import { buildLedgerData, certificateRecords } from '../data/certificateLedgerData'
import {
  cardClassName,
  inputClassName,
  labelClassName,
  labelTitleClassName,
  primaryButtonClassName,
} from '../helpers/uiHelpers'

export default function CertificateTransferPanel() {
  const selectable = useMemo(
    () =>
      [...certificateRecords]
        .filter((r) => r.applicationId)
        .sort((a, b) => String(a.applicationId).localeCompare(String(b.applicationId))),
    [],
  )
  const [applicationId, setApplicationId] = useState(selectable[0]?.applicationId ?? '')
  const record = useMemo(() => selectable.find((r) => r.applicationId === applicationId), [selectable, applicationId])
  const ledger = useMemo(() => (record ? buildLedgerData(record) : null), [record])
  const [buyer, setBuyer] = useState('')
  const [simulated, setSimulated] = useState<{
    txHash: string
    blockNumber: number
    buyer: string
    at: string
  } | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!ledger || !record?.applicationId || buyer.trim().length < 3) return
    setSimulated({
      txHash: `0xXFER${Date.now().toString(16).toUpperCase().slice(-14)}`,
      blockNumber: 130_000 + Math.floor(Math.random() * 8000),
      buyer: buyer.trim(),
      at: new Date().toLocaleString('en-IN'),
    })
    setBuyer('')
  }

  if (!ledger || !record?.applicationId) {
    return <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">कोई लिंक्ड आवेदन वाला DRC डेमो नहीं मिला।</p>
  }

  const canDemoSubmit = buyer.trim().length >= 3

  return (
    <div className="space-y-4">
      <section className={cardClassName}>
        <h3 className="mb-1 font-semibold text-slate-900">DRC हस्तांतरण (डेमो)</h3>
        <p className="mb-4 text-sm text-slate-600">
          वास्तविक सिस्टम में TCP अनुमोदन के बाद API नया TRANSFER transaction anchor करेगा। यहाँ पहले से जारी + मौजूदा transfer hash ledger से दिख
          रहे हैं; फॉर्म सिर्फ UI डेमो है।
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <BlockchainAnchor
            compact
            title="मौजूदा issuance (CREATE)"
            txHash={ledger.blockchainTxHash}
            blockNumber={ledger.blockNumber}
          />
          {ledger.transferAnchor ? (
            <BlockchainAnchor
              compact
              title="पहले से दर्ज transfer (TRANSFER)"
              txHash={ledger.transferAnchor.txHash}
              blockNumber={ledger.transferAnchor.blockNumber}
              hint="यही ledger की Sale/transfer पंक्ति से जुड़ा है।"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              इस प्रमाणपत्र पर अभी कोई डेबिट नहीं — अलग transfer anchor नहीं बना।
            </div>
          )}
        </div>

        <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 md:grid-cols-2">
          <label className={labelClassName}>
            <span className={labelTitleClassName}>Application / DRC</span>
            <select value={applicationId} onChange={(ev) => setApplicationId(ev.target.value)} className={inputClassName}>
              {selectable.map((r) => (
                <option key={r.sno} value={r.applicationId}>
                  {r.applicationId} — {r.certificateNo}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClassName}>
            <span className={labelTitleClassName}>नए खरीदार / स्थानांतरी का नाम</span>
            <input
              value={buyer}
              onChange={(ev) => setBuyer(ev.target.value)}
              placeholder="पूरा नाम (डेमो)"
              className={inputClassName}
              autoComplete="off"
            />
          </label>
          <div className="flex flex-col justify-end md:col-span-2">
            <button type="submit" disabled={!canDemoSubmit} className={`${primaryButtonClassName} w-full md:max-w-xs`}>
              डेमो — नया transfer anchor उत्पन्न करें
            </button>
            {!canDemoSubmit ? (
              <p className="mt-2 text-xs text-slate-500">कम से कम 3 अक्षर का नाम दर्ज करें।</p>
            ) : null}
          </div>
        </form>

        {simulated ? (
          <div className="mt-6 border-t border-emerald-100 pt-6">
            <p className="mb-2 text-sm font-medium text-emerald-900">डेमो परिणाम — {simulated.buyer}</p>
            <p className="mb-3 text-xs text-slate-600">{simulated.at}</p>
            <BlockchainAnchor
              title="Simulated नया TRANSFER (केवल फ्रंटएंड)"
              txHash={simulated.txHash}
              blockNumber={simulated.blockNumber}
              hint="Production में यही hash बैकएंड / चेन से आएगा और ledger में नई Dr. पंक्ति जुड़ेगी।"
            />
          </div>
        ) : null}

        <p className="mt-6 text-sm">
          <Link to={`/dashboard/certificates/by-application/${encodeURIComponent(record.applicationId)}`} className="font-semibold text-blue-600 hover:underline">
            इस आवेदन का पूरा ledger व blockchain history →
          </Link>
        </p>
      </section>
    </div>
  )
}
