import { useState, type FormEvent } from 'react'
import { useTdr } from '../context/useTdr'
import {
  cardClassName,
  inputClassName,
  labelClassName,
  labelTitleClassName,
  primaryButtonClassName,
} from '../modules/dashboard/helpers/uiHelpers'

export default function UtilizationForm() {
  const { tdrData, utilizeTdr } = useTdr()
  const [drcId, setDrcId] = useState(tdrData[0]?.drcId ?? '')
  const [project, setProject] = useState('')
  const [deductFsi, setDeductFsi] = useState(0.2)
  const canSubmit = Boolean(drcId) && project.trim().length >= 3 && deductFsi > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    utilizeTdr(drcId, project.trim(), deductFsi)
    setProject('')
    setDeductFsi(0.2)
  }

  return (
    <section className={cardClassName}>
      <h3 className="mb-1 font-semibold">Utilization Module</h3>
      <p className="mb-4 text-sm text-slate-500">Map DRC utilization to project and deduct FSI with status update.</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className={labelClassName}>
          <span className={labelTitleClassName}>Select DRC</span>
          <select value={drcId} onChange={(event) => setDrcId(event.target.value)} className={inputClassName}>
            {tdrData.map((item) => (
              <option key={item.drcId} value={item.drcId}>
                {item.drcId} - FSI {item.fsi}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClassName}>
          <span className={labelTitleClassName}>Project Name</span>
          <input
            value={project}
            onChange={(event) => setProject(event.target.value)}
            placeholder="Enter project name"
            className={inputClassName}
          />
        </label>
        <label className={labelClassName}>
          <span className={labelTitleClassName}>Deduct FSI</span>
          <input
            type="number"
            min={0.1}
            step="0.1"
            value={deductFsi}
            onChange={(event) => setDeductFsi(Number(event.target.value))}
            className={inputClassName}
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`${primaryButtonClassName} w-full`}
          >
            Apply Utilization
          </button>
        </div>
      </form>
    </section>
  )
}
