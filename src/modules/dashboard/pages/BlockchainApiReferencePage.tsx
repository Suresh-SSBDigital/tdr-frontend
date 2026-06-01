import {
  DELETE_SHAPE_FILE_GUIDANCE,
  OPENAPI_NOTE,
  READ_APIS_QUERY_RECORD,
} from '../../../constants/blockchainBackendApiReference'
import { PageHeader } from '../components'

const th = 'border border-[#d9d9d9] bg-[#fafafa] px-3 py-2.5 text-left text-xs font-semibold text-[#595959]'
const td = 'border border-[#d9d9d9] px-3 py-2.5 text-sm text-[#262626] align-top'

export default function BlockchainApiReferencePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Backend API ↔ blockchain mapping"
        subtitle="English reference: which REST endpoints align with read-only chain queries, and how DELETE must be handled off-chain."
      />

      <section className="rounded-xl border border-[#d9d9d9] bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-[#262626]">3. READ APIs (blockchain query operations)</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#595959]">
          These endpoints fetch data from the application layer. When you reconcile or display anchored facts, treat them as backed by
          blockchain <strong className="text-[#262626]">queryRecord</strong> style reads (no state change on-chain from these calls alone).
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[#f0f0f0]">
          <table className="min-w-[640px] w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>API path</th>
                <th className={th}>Description</th>
                <th className={th}>Chain operation</th>
                <th className={th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {READ_APIS_QUERY_RECORD.map((row) => (
                <tr key={row.path} className="hover:bg-[#fafafa]">
                  <td className={`${td} font-mono text-xs`}>{row.path}</td>
                  <td className={td}>{row.description}</td>
                  <td className={`${td} font-mono text-xs`}>{row.blockchainOperation}</td>
                  <td className={`${td} text-xs text-[#8c8c8c]`}>{row.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-[#ffccc7] bg-[#fff2f0] p-5 shadow-sm">
        <h2 className="text-base font-semibold text-[#cf1322]">4. DELETE API (not recommended on-chain)</h2>
        <p className="mt-2 text-sm font-mono text-[#434343]">{DELETE_SHAPE_FILE_GUIDANCE.path}</p>
        <p className="mt-3 text-sm leading-relaxed text-[#434343]">
          <strong>{DELETE_SHAPE_FILE_GUIDANCE.title}.</strong> {DELETE_SHAPE_FILE_GUIDANCE.recommendation}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#595959]">{DELETE_SHAPE_FILE_GUIDANCE.blockchainWarning}</p>
      </section>

      <section className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-5">
        <h2 className="text-sm font-semibold text-[#262626]">OpenAPI schemas</h2>
        <p className="mt-2 text-sm text-[#595959]">{OPENAPI_NOTE}</p>
      </section>
    </div>
  )
}
