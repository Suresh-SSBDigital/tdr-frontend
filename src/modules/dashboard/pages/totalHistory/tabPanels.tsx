import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  findRootApp,
  flattenAllTransactions,
  flattenLedger,
  flattenTransfers,
  flattenUtilizations,
  type FlatAllTransactionRow,
  type FlatLedgerRow,
  type FlatTransferRow,
  type FlatUtilizationRow,
  type RidHistoryApplication,
  type RidHistoryResponse,
} from '../../helpers/ridHistoryTree'
import { d, n } from './format'
import {
  ActionPill,
  AppLink,
  ClickableRow,
  CopyBtn,
  DetailPanel,
  fieldsFromRecord,
  StatusPill,
  TableShell,
  tdClass,
  thClass,
} from './shared'

type TabPanelsProps = {
  historyData: RidHistoryResponse
  rid: string
  currentApplicationId?: string
}

export function OverviewTab({
  historyData,
  rid,
  currentApplicationId,
}: TabPanelsProps) {
  const apps =
    historyData.applications ?? []

  const root = findRootApp(apps)

  const [selected, setSelected] =
    useState<RidHistoryApplication | null>(
      null,
    )

  return (
    <>
      <TableShell
        title="Applications in this RID"
        count={apps.length}
      >
        <table className="w-full min-w-[1250px]">
          <thead>
            <tr>
              <th className={thClass}>
                SR. No.
              </th>

              <th className={thClass}>
                TDR App ID
              </th>

              <th className={thClass}>
                Application ID
              </th>

              <th className={thClass}>
                Owner
              </th>

              <th className={thClass}>
                Status
              </th>

              <th className={thClass}>
                Total TDR
              </th>

              <th className={thClass}>
                Remaining
              </th>

              <th className={thClass}>
                Transferred
              </th>

              <th className={thClass}>
                Utilized
              </th>

              <th className={thClass}>
                Type
              </th>

              <th className={thClass}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {apps.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className={`${tdClass} text-center text-[#8c9ab5]`}
                >
                  No applications found.
                </td>
              </tr>
            ) : (
              apps.map((app, index) => {
                const isRoot =
                  app.application_id ===
                  root?.application_id

                const isCurrent =
                  app.application_id ===
                  currentApplicationId

                return (
                  <ClickableRow
                    key={app.application_id}
                    active={
                      selected?.application_id ===
                      app.application_id
                    }
                    onClick={() =>
                      setSelected(app)
                    }
                  >
                    {/* SR NO */}
                    <td className={tdClass}>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1890ff] text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                    </td>

                    {/* TDR APP ID */}
                    <td className={tdClass}>
                      <span className="font-mono text-[11px] font-semibold">
                        {app.tdrApplicationId ??
                          '—'}
                      </span>

                      {isCurrent ? (
                        <span className="ml-1 rounded bg-[#e6f7ff] px-1.5 py-0.5 text-[9px] font-bold text-[#1890ff]">
                          CURRENT
                        </span>
                      ) : null}
                    </td>

                    {/* APPLICATION ID */}
                    <td className={tdClass}>
                      <AppLink
                        applicationId={
                          app.application_id
                        }
                        samagraId={
                          app.samagra_id
                        }
                        rid={rid}
                        label={
                          app.application_id
                        }
                      />
                    </td>

                    {/* OWNER */}
                    <td className={tdClass}>
                      {app.owner_name ??
                        '—'}
                    </td>

                    {/* STATUS */}
                    <td className={tdClass}>
                      <StatusPill
                        status={app.status}
                      />
                    </td>

                    {/* TOTAL TDR */}
                    <td className={tdClass}>
                      ₹{' '}
                      {n(
                        app.total_tdr_value,
                      )}
                    </td>

                    {/* REMAINING */}
                    <td className={tdClass}>
                      ₹{' '}
                      {n(
                        app.remaining_tdr_value,
                      )}
                    </td>

                    {/* TRANSFERRED */}
                    <td className={tdClass}>
                      ₹{' '}
                      {n(
                        app.transferred_tdr_value,
                      )}
                    </td>

                    {/* UTILIZED */}
                    <td className={tdClass}>
                      ₹{' '}
                      {n(
                        app.utilized_tdr_value,
                      )}
                    </td>

                    {/* TYPE */}
                    <td className={tdClass}>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isRoot
                            ? 'bg-[#e6f7ff] text-[#1890ff]'
                            : 'bg-[#f9f0ff] text-[#722ed1]'
                        }`}
                      >
                        {isRoot
                          ? 'Root'
                          : 'Child'}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className={tdClass}>
                      <Link
                        to={`/dashboard/apply/${encodeURIComponent(
                          app.application_id,
                        )}/history?rid=${encodeURIComponent(
                          rid,
                        )}${
                          app.samagra_id
                            ? `&samagra_id=${encodeURIComponent(
                                app.samagra_id,
                              )}`
                            : ''
                        }`}
                        className="text-[11px] font-semibold text-[#1890ff] hover:underline"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        View history
                      </Link>
                    </td>
                  </ClickableRow>
                )
              })
            )}
          </tbody>
        </table>
      </TableShell>

      {selected ? (
        <DetailPanel
          title={
            selected.tdrApplicationId ??
            selected.application_id
          }
          subtitle={`Owner: ${
            selected.owner_name ?? '—'
          }`}
          fields={fieldsFromRecord(
            selected as unknown as Record<
              string,
              unknown
            >,
          )}
          onClose={() =>
            setSelected(null)
          }
        />
      ) : null}
    </>
  )
}

export function AllTransactionsTab({ historyData, rid }: TabPanelsProps) {
  const rows = useMemo(
    () => flattenAllTransactions(historyData.applications ?? []),
    [historyData],
  )
  const [selected, setSelected] = useState<FlatAllTransactionRow | null>(null)

  return (
    <>
      <TableShell title="All Transactions" count={rows.length}>
        <TransactionsTable rows={rows} rid={rid} onSelect={setSelected} selectedKey={selected?.rowKey} />
      </TableShell>
      {selected ? (
        <DetailPanel
          title={`${selected.txType} — ${selected.referenceId ?? selected.txId ?? 'Transaction'}`}
          subtitle={selected.tdrApplicationId}
          fields={fieldsFromRecord(selected as unknown as Record<string, unknown>)}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  )
}

export function UtilizationsTab({
  historyData,
  rid,
}: TabPanelsProps) {
  const rows = useMemo(
    () =>
      flattenUtilizations(
        historyData.applications ?? [],
      ),
    [historyData],
  )

  const [selected, setSelected] =
    useState<FlatUtilizationRow | null>(
      null,
    )

  return (
    <>
      <TableShell
        title="Utilizations"
        count={rows.length}
      >
        <table className="w-full min-w-[1300px]">
          <thead>
            <tr>
              <th className={thClass}>
                SR. No.
              </th>

              <th className={thClass}>
                Utilization ID
              </th>

              <th className={thClass}>
                Application
              </th>

              <th className={thClass}>
                Utilized By
              </th>

              <th className={thClass}>
                TDR Amount
              </th>

              <th className={thClass}>
                Area
              </th>

              <th className={thClass}>
                Purpose
              </th>

              <th className={thClass}>
                Date
              </th>

              <th className={thClass}>
                Status
              </th>

              <th className={thClass}>
                TxID
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className={`${tdClass} text-center text-[#8c9ab5]`}
                >
                  No utilization records.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <ClickableRow
                  key={row.rowKey}
                  active={
                    selected?.rowKey ===
                    row.rowKey
                  }
                  onClick={() =>
                    setSelected(row)
                  }
                >
                  {/* SR NO */}
                  <td className={tdClass}>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1890ff] text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </td>

                  {/* UTILIZATION ID */}
                  <td className={tdClass}>
                    <span className="font-mono text-[11px]">
                      {row.utilization_id ??
                        '—'}
                    </span>
                  </td>

                  {/* APPLICATION */}
                  <td className={tdClass}>
                    <AppLink
                      applicationId={
                        row.application_id
                      }
                      samagraId={
                        row.samagra_id
                      }
                      rid={rid}
                    />
                  </td>

                  {/* UTILIZED BY */}
                  <td className={tdClass}>
                    {row.utilized_by ??
                      row.owner_name ??
                      '—'}
                  </td>

                  {/* TDR AMOUNT */}
                  <td className={tdClass}>
                    ₹{' '}
                    {n(
                      row.utilized_value_tdr,
                    )}
                  </td>

                  {/* AREA */}
                  <td className={tdClass}>
                    {n(row.utilized_area)}
                  </td>

                  {/* PURPOSE */}
                  <td className={tdClass}>
                    {row.utilization_purpose ??
                      '—'}
                  </td>

                  {/* DATE */}
                  <td className={tdClass}>
                    {d(
                      row.utilization_date,
                    )}
                  </td>

                  {/* STATUS */}
                  <td className={tdClass}>
                    <StatusPill
                      status={row.status}
                    />
                  </td>

                  {/* TX ID */}
                  <td className={tdClass}>
                    <CopyBtn
                      value={row.txId}
                    />
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </TableShell>

      {selected ? (
        <DetailPanel
          title={
            selected.utilization_id ??
            'Utilization'
          }
          subtitle={
            selected.utilization_purpose
          }
          fields={fieldsFromRecord(
            selected as unknown as Record<
              string,
              unknown
            >,
          )}
          onClose={() =>
            setSelected(null)
          }
        />
      ) : null}
    </>
  )
}

export function TransfersTab({ historyData, rid }: TabPanelsProps) {
  const rows = useMemo(
    () => flattenTransfers(historyData.applications ?? []),
    [historyData],
  )

  const [selected, setSelected] =
    useState<FlatTransferRow | null>(null)

  return (
    <>
      <TableShell
        title="Transfers"
        count={rows.length}
      >
        <table className="w-full min-w-[1350px]">
          <thead>
            <tr>
              <th className={thClass}>SR. No.</th>
              <th className={thClass}>TRN ID</th>
              <th className={thClass}>
                From Application
              </th>
              <th className={thClass}>
                Owner From
              </th>
              <th className={thClass}>
                Owner To
              </th>
              <th className={thClass}>
                TDR Amount
              </th>
              <th className={thClass}>Area</th>
              <th className={thClass}>
                Recipient App
              </th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>TxID</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className={`${tdClass} text-center text-[#8c9ab5]`}
                >
                  No transfer records.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <ClickableRow
                  key={row.rowKey}
                  active={
                    selected?.rowKey ===
                    row.rowKey
                  }
                  onClick={() =>
                    setSelected(row)
                  }
                >
                  {/* SR NO */}
                  <td className={tdClass}>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1890ff] text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </td>

                  {/* TRN ID */}
                  <td className={tdClass}>
                    <span className="font-mono text-[11px]">
                      {row.trn_id ?? '—'}
                    </span>
                  </td>

                  {/* FROM APPLICATION */}
                  <td className={tdClass}>
                    <AppLink
                      applicationId={
                        row.application_id
                      }
                      samagraId={
                        row.samagra_id
                      }
                      rid={rid}
                    />
                  </td>

                  {/* OWNER FROM */}
                  <td className={tdClass}>
                    {row.owner_from ?? '—'}
                  </td>

                  {/* OWNER TO */}
                  <td className={tdClass}>
                    {row.owner_to ?? '—'}
                  </td>

                  {/* TDR AMOUNT */}
                  <td className={tdClass}>
                    ₹{' '}
                    {n(
                      row.transferred_tdr_value ??
                        row.trn_value_tdr,
                    )}
                  </td>

                  {/* AREA */}
                  <td className={tdClass}>
                    {n(row.transferred_area)}
                  </td>

                  {/* RECIPIENT APP */}
                  <td className={tdClass}>
                    {row.recipient_application_id ? (
                      <AppLink
                        applicationId={
                          row.recipient_application_id
                        }
                        rid={rid}
                        label={
                          row.recipient_tdrApplicationId ??
                          row.recipient_application_id
                        }
                      />
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* DATE */}
                  <td className={tdClass}>
                    {d(row.trn_date)}
                  </td>

                  {/* STATUS */}
                  <td className={tdClass}>
                    <StatusPill
                      status={row.status}
                    />
                  </td>

                  {/* TX ID */}
                  <td className={tdClass}>
                    <CopyBtn
                      value={row.txId}
                    />
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </TableShell>

      {selected ? (
        <DetailPanel
          title={
            selected.trn_id ??
            'Transfer'
          }
          subtitle={`${
            selected.owner_from ?? '—'
          } → ${
            selected.owner_to ?? '—'
          }`}
          fields={fieldsFromRecord(
            selected as unknown as Record<
              string,
              unknown
            >,
          )}
          onClose={() =>
            setSelected(null)
          }
        />
      ) : null}
    </>
  )
}

export function LedgerTab({
  historyData,
  rid,
}: TabPanelsProps) {
  const rows = useMemo(
    () =>
      flattenLedger(
        historyData.applications ?? [],
      ),
    [historyData],
  )

  const [selected, setSelected] =
    useState<FlatLedgerRow | null>(
      null,
    )

  return (
    <>
      <TableShell
        title="Ledger (MongoDB)"
        count={rows.length}
      >
        <table className="w-full min-w-[1350px]">
          <thead>
            <tr>
              <th className={thClass}>
                SR. No.
              </th>

              <th className={thClass}>
                Action
              </th>

              <th className={thClass}>
                Application
              </th>

              <th className={thClass}>
                Performed By
              </th>

              <th className={thClass}>
                Document
              </th>

              <th className={thClass}>
                Previous → New Status
              </th>

              <th className={thClass}>
                Date
              </th>

              <th className={thClass}>
                TxID
              </th>

              <th className={thClass}>
                Hash
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className={`${tdClass} text-center text-[#8c9ab5]`}
                >
                  No ledger entries.
                </td>
              </tr>
            ) : (
              rows.map(
                (row, index) => (
                  <ClickableRow
                    key={row.rowKey}
                    active={
                      selected?.rowKey ===
                      row.rowKey
                    }
                    onClick={() =>
                      setSelected(row)
                    }
                  >
                    {/* SR NO */}
                    <td className={tdClass}>
                      <span className="font-bold text-[#1890ff]">
                        {index + 1}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className={tdClass}>
                      <ActionPill
                        action={row.action}
                      />
                    </td>

                    {/* APPLICATION */}
                    <td className={tdClass}>
                      <AppLink
                        applicationId={
                          row.application_id
                        }
                        samagraId={
                          row.samagra_id
                        }
                        rid={rid}
                      />
                    </td>

                    {/* PERFORMED BY */}
                    <td className={tdClass}>
                      {row.performed_by ??
                        row.owner_name ??
                        '—'}
                    </td>

                    {/* DOCUMENT */}
                    <td className={tdClass}>
                      {row.document_type ??
                        '—'}
                    </td>

                    {/* STATUS */}
                    <td className={tdClass}>
                      <span className="text-[11px]">
                        {row.previous_status ??
                          '—'}{' '}
                        →{' '}
                        {row.new_status ??
                          '—'}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className={tdClass}>
                      {d(row.createdAt)}
                    </td>

                    {/* TX ID */}
                    <td className={tdClass}>
                      <CopyBtn
                        value={row.txId}
                      />
                    </td>

                    {/* HASH */}
                    <td className={tdClass}>
                      <CopyBtn
                        value={row.hash}
                      />
                    </td>
                  </ClickableRow>
                ),
              )
            )}
          </tbody>
        </table>
      </TableShell>

      {selected ? (
        <DetailPanel
          title={
            selected.action?.replace(
              /_/g,
              ' ',
            ) ?? 'Ledger Entry'
          }
          subtitle={selected.remarks}
          fields={fieldsFromRecord(
            selected as unknown as Record<
              string,
              unknown
            >,
          )}
          onClose={() =>
            setSelected(null)
          }
        />
      ) : null}
    </>
  )
}

function TransactionsTable({
  rows,
  rid,
  onSelect,
  selectedKey,
}: {
  rows: FlatAllTransactionRow[]
  rid: string
  onSelect: (row: FlatAllTransactionRow) => void
  selectedKey?: string
}) {
  return (
    <table className="w-full min-w-[1200px]">
      <thead>
        <tr>
          <th className={thClass}>Step</th>
          <th className={thClass}>Type</th>
          <th className={thClass}>Reference ID</th>
          <th className={thClass}>Application</th>
          <th className={thClass}>Amount (TDR)</th>
          <th className={thClass}>Area</th>
          <th className={thClass}>Counterparty / Purpose</th>
          <th className={thClass}>Date</th>
          <th className={thClass}>Status</th>
          <th className={thClass}>TxID</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={10} className={`${tdClass} text-center text-[#8c9ab5]`}>
              No transactions found.
            </td>
          </tr>
        ) : (
          rows.map((row, rowIdx) => (
            <ClickableRow
              key={row.rowKey}
              active={selectedKey === row.rowKey}
              onClick={() => onSelect(row)}
            >
              <td className={tdClass}>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1890ff] text-[10px] font-bold text-white">
                  {rowIdx + 1}
                </span>
              </td>
              <td className={tdClass}>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    row.txType === 'TRANSFER'
                      ? 'bg-[#fff7e6] text-[#d46b08]'
                      : 'bg-[#f6ffed] text-[#237804]'
                  }`}
                >
                  {row.txType}
                </span>
              </td>
              <td className={tdClass}>
                <span className="font-mono text-[11px]">{row.referenceId ?? '—'}</span>
              </td>
              <td className={tdClass}>
                <AppLink applicationId={row.application_id} samagraId={row.samagra_id} rid={rid} />
              </td>
              <td className={tdClass}>₹ {n(row.amountTdr)}</td>
              <td className={tdClass}>{n(row.area)}</td>
              <td className={tdClass}>
                {row.txType === 'UTILIZATION' ? row.purpose : row.counterparty}
              </td>
              <td className={tdClass}>{d(row.date)}</td>
              <td className={tdClass}>
                <StatusPill status={row.status} />
              </td>
              <td className={tdClass}>
                <CopyBtn value={row.txId} />
              </td>
            </ClickableRow>
          ))
        )}
      </tbody>
    </table>
  )
}
