import { useState, type FormEvent } from 'react'
import { useTdr } from '../context/useTdr'
import {
  cardClassName,
  inputClassName,
  labelClassName,
  labelTitleClassName,
  primaryButtonClassName,
} from '../modules/dashboard/helpers/uiHelpers'

export default function TransferForm() {
  const { tdrData, transferTdr } = useTdr()
  const [drcId, setDrcId] = useState(tdrData[0]?.drcId ?? '')
  const [buyer, setBuyer] = useState('')
  const canSubmit = Boolean(drcId) && buyer.trim().length >= 3

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    transferTdr(drcId, buyer.trim())
    setBuyer('')
  }

  return (
    <section className={cardClassName}>
      <h3 className="mb-1 font-semibold">Transfer Module</h3>
      <p className="mb-4 text-sm text-slate-500">Transfer selected DRC ownership and auto-generate blockchain transaction hash.</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className={labelClassName}>
          <span className={labelTitleClassName}>Select DRC</span>
          <select value={drcId} onChange={(event) => setDrcId(event.target.value)} className={inputClassName}>
            {tdrData.map((item) => (
              <option key={item.drcId} value={item.drcId}>
                {item.drcId} - {item.owner}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClassName}>
          <span className={labelTitleClassName}>Buyer Name</span>
          <input
            value={buyer}
            onChange={(event) => setBuyer(event.target.value)}
            placeholder="Enter buyer full name"
            className={inputClassName}
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`${primaryButtonClassName} w-full`}
          >
            Transfer TDR
          </button>
        </div>
      </form>
    </section>
  )
}
