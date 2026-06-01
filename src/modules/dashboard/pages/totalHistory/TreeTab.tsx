import React, { useEffect } from 'react'
import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type EdgeTypes,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react'

import {
  FiGitBranch,
  FiMaximize,
  FiZoomIn,
  FiZoomOut,
  FiClock,
} from 'react-icons/fi'

import '@xyflow/react/dist/style.css'

import { ApplicationNode, TransferNode, UtilizationNode } from '../../components/FlowNodes'
import type { AppBlockchainVerification } from '../../helpers/ridHistoryTree'
import { layoutRidHistoryTree } from '../../helpers/flowLayout'
import {
  buildTreeGraph,
  enrichTransfer,
  enrichUtilization,
  flattenAllTransactions,
  type RidHistoryResponse,
} from '../../helpers/ridHistoryTree'

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type RfApi = Pick<
  ReactFlowInstance,
  'fitView' | 'zoomIn' | 'zoomOut'
>

/* -------------------------------------------------------------------------- */
/*                            STEP EDGE COMPONENT                             */
/* -------------------------------------------------------------------------- */

function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] =
    getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    })

  const isUtilization = String(label).includes('UTILIZATION')
  const stepNumber = String(label).replace('STEP ', '').split('•')[0].trim()
  const stepText = String(label).split('•')[1]?.trim() ?? String(label)

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: isUtilization ? '#22c55e' : '#2563eb',
          strokeWidth: 3,
          strokeDasharray: isUtilization ? '6 5' : '4 3',
          opacity: 0.95,
          ...style,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white/95 px-3 py-1.5 shadow-xl"
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${
              isUtilization ? 'bg-[#22c55e]' : 'bg-[#2563eb]'
            }`}
          >
            {stepNumber}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${
              isUtilization ? 'text-[#22c55e]' : 'text-[#2563eb]'
            }`}
          >
            {stepText}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                                EDGE TYPES                                  */
/* -------------------------------------------------------------------------- */

const edgeTypes: EdgeTypes = {
  stepEdge: StepEdge,
}

/* -------------------------------------------------------------------------- */
/*                             HELPERS                                        */
/* -------------------------------------------------------------------------- */

function injectRidOnApps(
  nodes: Node[],
  rid: string,
): Node[] {
  return nodes.map((node) => {
    if (node.type !== 'applicationNode')
      return node

    const app = node.data?.app as
      | Record<string, unknown>
      | undefined

    return {
      ...node,
      data: {
        ...node.data,
        rid,
        samagraId: app?.samagra_id
          ? String(app.samagra_id)
          : undefined,
      },
    }
  })
}

/* -------------------------------------------------------------------------- */
/*                           BUILD GRAPH                                      */
/* -------------------------------------------------------------------------- */

function buildLaidOutGraph(
  historyData: RidHistoryResponse,
  hideUtilizations: boolean,
  rid: string,
): { nodes: Node[]; edges: Edge[] } {
  const apps =
    historyData.applications ?? []

  if (apps.length === 0) {
    return {
      nodes: [],
      edges: [],
    }
  }

  try {
    const {
      nodes: rawNodes,
      edges: rawEdges,
    } = buildTreeGraph(apps)

    // Use the exact same sorted list as the All Transactions tab for step numbering
    const allTxRows = flattenAllTransactions(apps)

    // Build a map from React Flow node ID -> step number (1-based, matching table row order)
    const txStepMap = new Map<string, number>()
    const appTransferIndexMap = new Map<string, number>()

    // Track which array indices have been consumed per app, to handle duplicate IDs
    const usedTransferIdx = new Map<string, Set<number>>()
    const usedUtilIdx = new Map<string, Set<number>>()

    allTxRows.forEach((row, idx) => {
      const appId = row.application_id
      const step = idx + 1
      const app = apps.find((a) => a.application_id === appId)
      if (!app) return

      if (row.txType === 'TRANSFER') {
        const transfers = Array.isArray(app.transfers) ? app.transfers : []
        const used = usedTransferIdx.get(appId) ?? new Set<number>()

        // Find the first unused transfer matching this row's referenceId
        let matchIdx = -1
        for (let i = 0; i < transfers.length; i++) {
          if (used.has(i)) continue
          if ((transfers[i].trn_id ?? '') === (row.referenceId ?? '')) {
            matchIdx = i
            break
          }
        }
        if (matchIdx < 0) matchIdx = 0
        used.add(matchIdx)
        usedTransferIdx.set(appId, used)

        const tId = `t-${appId}-${transfers[matchIdx]?.trn_id ?? 'trn'}-${matchIdx}`
        txStepMap.set(tId, step)
        appTransferIndexMap.set(tId, matchIdx + 1)
      } else {
        const utilizations = Array.isArray(app.utilizations) ? app.utilizations : []
        const used = usedUtilIdx.get(appId) ?? new Set<number>()

        let matchIdx = -1
        for (let i = 0; i < utilizations.length; i++) {
          if (used.has(i)) continue
          if ((utilizations[i].utilization_id ?? '') === (row.referenceId ?? '')) {
            matchIdx = i
            break
          }
        }
        if (matchIdx < 0) matchIdx = 0
        used.add(matchIdx)
        usedUtilIdx.set(appId, used)

        const uId = `u-${appId}-${utilizations[matchIdx]?.utilization_id ?? 'util'}-${matchIdx}`
        txStepMap.set(uId, step)
      }
    })

    const flowNodes: Node[] =
      rawNodes.map((n) => {
        const baseNode = {
          id: n.id,
          type: n.type,
          data: n.data,
          position: n.position,
        }

        if (n.type === 'transferNode' || n.type === 'utilizationNode') {
          const stepNumber = txStepMap.get(n.id)
          const transferIndex = n.type === 'transferNode' ? appTransferIndexMap.get(n.id) : undefined

          return {
            ...baseNode,
            data: {
              ...baseNode.data,
              txStepNumber: stepNumber,
              transferIndex: transferIndex,
            },
          }
        }

        return baseNode
      })

    const filteredNodes =
      hideUtilizations
        ? flowNodes.filter(
            (node) =>
              node.type !==
              'utilizationNode',
          )
        : flowNodes

    const visibleIds = new Set(
      filteredNodes.map((n) => n.id),
    )

    const filteredEdges: Edge[] =
      rawEdges
        .filter(
          (edge) =>
            visibleIds.has(edge.source) &&
            visibleIds.has(edge.target),
        )
        .map((edge) => {
          const isUtilization = edge.target.startsWith('u-')
          const isTransferTx = edge.target.startsWith('t-')
          const isTransferLinkage = edge.source.startsWith('t-')

          if (isTransferTx || isUtilization) {
            const step = txStepMap.get(edge.target) ?? 1
            return {
              ...edge,
              type: 'stepEdge',
              animated: true,

              label: isUtilization
                ? `STEP ${step} • UTILIZATION`
                : `STEP ${step} • TRANSFER`,

              style: {
                stroke: isUtilization
                  ? '#22c55e'
                  : '#2563eb',
              },
            }
          } else if (isTransferLinkage) {
            return {
              ...edge,
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: '#2563eb',
                strokeWidth: 3,
                strokeDasharray: '4 3',
                opacity: 0.95,
              },
            }
          }

          return {
            ...edge,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: '#b8c0cc',
              strokeWidth: 2,
            },
          }
        })

    const laidOut =
      layoutRidHistoryTree(
        filteredNodes,
        filteredEdges,
      )

    return {
      nodes: injectRidOnApps(
        laidOut.nodes,
        rid,
      ),
      edges: laidOut.edges,
    }
  } catch (err) {
    console.error(
      '[buildLaidOutGraph]',
      err,
    )

    return {
      nodes: [],
      edges: [],
    }
  }
}

type TimelineEvent = {
  title: string
  detail: string
  time: string
  actor: string
  category: 'created' | 'transfer' | 'utilization'
}

function buildTimelineEvents(historyData: RidHistoryResponse): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const app of historyData.applications ?? []) {
    const owner = String(app.owner_name ?? 'Unknown')
    const rootCreated = String(app.mongo_ledger?.[0]?.createdAt ?? '')

    if (!app.source_application_id) {
      if (rootCreated) {
        events.push({
          title: 'Parent DRC Created',
          detail: app.application_id ?? 'Application created',
          time: rootCreated,
          actor: owner,
          category: 'created',
        })
      }
    }

    const rawTransfers = Array.isArray(app.transfers) ? app.transfers : []
    rawTransfers.forEach((raw, idx) => {
      const transfer = enrichTransfer(app, raw, idx)
      const transferTime = transfer.trn_date
      if (!transferTime) return
      events.push({
        title: 'Transfer Out',
        detail: `${n(Number(transfer.transferred_tdr_value ?? transfer.trn_value_tdr))} TDR`,
        time: transferTime,
        actor: String(transfer.owner_from ?? owner),
        category: 'transfer',
      })
    })

    const rawUtilizations = Array.isArray(app.utilizations) ? app.utilizations : []
    rawUtilizations.forEach((raw, idx) => {
      const utilization = enrichUtilization(app, raw, idx)
      const utilTime = utilization.utilization_date
      if (!utilTime) return
      events.push({
        title: 'Utilization',
        detail: `${n(Number(utilization.utilized_value_tdr ?? utilization.utilized_tdr_value))} TDR`,
        time: utilTime,
        actor: String(utilization.utilized_by ?? owner),
        category: 'utilization',
      })
    })
  }

  return events
    .filter((event) => event.time)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}

/* -------------------------------------------------------------------------- */
/*                             TREE CANVAS                                    */
/* -------------------------------------------------------------------------- */

function TreeCanvas({
  historyData,
  hideUtilizations,
  rid,
  onReady,
  nodeTypes,
}: {
  historyData: RidHistoryResponse
  hideUtilizations: boolean
  rid: string
  onReady: (api: RfApi) => void
  nodeTypes: unknown
}) {
  const [
    nodes,
    setNodes,
    onNodesChange,
  ] = useNodesState<Node>([])

  const [
    edges,
    setEdges,
    onEdgesChange,
  ] = useEdgesState<Edge>([])

  const { fitView, zoomIn, zoomOut } =
    useReactFlow()

  const graphKey = `${
    historyData.rid ?? 'rid'
  }-${hideUtilizations}-${rid}`

  useEffect(() => {
    onReady({
      fitView,
      zoomIn,
      zoomOut,
    })
  }, [
    fitView,
    zoomIn,
    zoomOut,
    onReady,
  ])

  useEffect(() => {
    const graph = buildLaidOutGraph(
      historyData,
      hideUtilizations,
      rid,
    )

    setNodes(graph.nodes)
    setEdges(graph.edges)

    if (graph.nodes.length > 0) {
      const t = window.setTimeout(() => {
        void fitView({
          padding: 0.35,
          duration: 500,
        })
      }, 200)

      return () =>
        window.clearTimeout(t)
    }
  }, [
    graphKey,
    setNodes,
    setEdges,
    fitView,
    historyData,
    hideUtilizations,
    rid,
  ])

  if (nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[450px] items-center justify-center text-sm font-medium text-[#94a3b8]">
        No transaction tree data found.
      </div>
    )
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes as any}
      edgeTypes={edgeTypes}
      fitView
      minZoom={0.1}
      maxZoom={2}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      proOptions={{
        hideAttribution: true,
      }}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Background
        color="#dbe4f0"
        gap={22}
        size={1}
      />
    </ReactFlow>
  )
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

function n(v?: number) {
  if (v == null) return '—'
  return v.toLocaleString('en-IN')
}

function d(v?: string | Date) {
  if (!v) return '—'
  const dt = new Date(v)
  if (Number.isNaN(dt.getTime())) return String(v)
  return (
    dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  )
}

function truncateHash(hash?: string) {
  if (!hash) return '—'
  if (hash.length <= 18) return hash
  return `${hash.slice(0, 10)}...${hash.slice(-4)}`
}

type SelectedDetails =
  | {
      kind: 'application'
      app: Record<string, unknown>
      isChild?: boolean
      treeLabel?: string
      linkedParentLabel?: string
      transferCount?: number
      utilizationCount?: number
      verification?: AppBlockchainVerification
      rid?: string
      samagraId?: string
    }
  | {
      kind: 'utilization'
      utilization: Record<string, unknown>
      treeLabel?: string
      utilIndex?: number
      chainVerified?: boolean
    }
  | null

export default function TreeTab({
  historyData,
  hideUtilizations,
  onHideUtilizationsChange,
  rid,
  rfApi,
  onFit,
  onReady,
}: {
  historyData: RidHistoryResponse
  hideUtilizations: boolean
  onHideUtilizationsChange: (hide: boolean) => void
  rid: string
  rfApi: RfApi | null
  onFit: () => void
  onReady: (api: RfApi) => void
}) {
  const appCount = historyData.applications?.length ?? 0
  const [selected, setSelected] = React.useState<SelectedDetails>(null)

  const closeModal = () => setSelected(null)

  const nodeTypes = React.useMemo(
    () => ({
      applicationNode: (props: any) => (
        <ApplicationNode
          {...props}
          onViewDetails={(payload: any) =>
            setSelected(payload ?? null)
          }
        />
      ),
      transferNode: (props: any) => (
        <TransferNode {...props} />
      ),
      utilizationNode: (props: any) => (
        <UtilizationNode
          {...props}
          onViewDetails={(payload: any) =>
            setSelected(payload ?? null)
          }
        />
      ),
    }),
    [],
  )

  return (
    <section className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm">
      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eef2f7] bg-white px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f172a]">
            <FiGitBranch className="text-[#2563eb]" />
            Transaction Timeline Flow
          </h2>

          <p className="mt-1 text-xs text-[#64748b]">
            {appCount} application
            {appCount !== 1 ? 's' : ''}{' '}
            connected in timeline flow
          </p>
        </div>

        {/* CONTROLS */}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onHideUtilizationsChange(
                false,
              )
            }
            className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3 py-2 text-xs font-semibold text-[#2563eb] transition hover:bg-[#dbeafe]"
          >
            Show Utilizations
          </button>

          <button
            type="button"
            onClick={() =>
              onHideUtilizationsChange(true)
            }
            className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-semibold text-[#475569] transition hover:bg-[#f8fafc]"
          >
            Hide Utilizations
          </button>

          <div className="mx-1 h-5 w-px bg-[#e2e8f0]" />

          <button
            type="button"
            onClick={() => rfApi?.zoomIn()}
            className="rounded-xl border border-[#e2e8f0] p-2 text-[#475569] transition hover:bg-[#f8fafc]"
          >
            <FiZoomIn />
          </button>

          <button
            type="button"
            onClick={() => rfApi?.zoomOut()}
            className="rounded-xl border border-[#e2e8f0] p-2 text-[#475569] transition hover:bg-[#f8fafc]"
          >
            <FiZoomOut />
          </button>

          <button
            type="button"
            onClick={onFit}
            className="rounded-xl border border-[#e2e8f0] p-2 text-[#475569] transition hover:bg-[#f8fafc]"
          >
            <FiMaximize />
          </button>
        </div>
      </div>

      {/* FLOW */}

      <div className="relative h-[min(760px,calc(100vh-18rem))] min-h-[600px] w-full bg-[#f8fafc]">
        <ReactFlowProvider>
          <TreeCanvas
            key={`tree-${
              historyData.rid ?? 'rid'
            }-${
              hideUtilizations ? 'hide' : 'show'
            }`}
            historyData={historyData}
            hideUtilizations={hideUtilizations}
            rid={rid}
            onReady={onReady}
            nodeTypes={nodeTypes}
          />
        </ReactFlowProvider>
      </div>

      <section className="mt-6 rounded-3xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#0f172a]">Blockchain Activity Timeline</p>
            <p className="text-xs text-[#64748b]">Trace the key steps across transfers and utilizations.</p>
          </div>
          <span className="rounded-full bg-[#e6f7ff] px-3 py-1 text-[10px] font-semibold uppercase text-[#1890ff]">
            {historyData.rid ? 'Trace enabled' : 'No data'}
          </span>
        </div>

        <div className="space-y-3">
          {buildTimelineEvents(historyData).slice(0, 5).map((event, index) => (
            <div
              key={`${event.title}-${event.time}-${index}`}
              className="flex flex-col gap-3 rounded-3xl border border-[#eef2f7] bg-[#f8fbff] px-4 py-4 sm:flex-row sm:items-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-bold text-[#2563eb] shadow-sm">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1c2b4a]">{event.title}</p>
                <p className="mt-1 text-[11px] text-[#64748b]">{event.detail}</p>
              </div>
              <div className="grid gap-1 text-[11px] text-[#475569] sm:text-right">
                <span className="inline-flex items-center gap-1 text-[#2563eb]">
                  <FiClock size={12} />
                  {d(event.time)}
                </span>
                <span>{event.actor}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL (owned by TreeTab, outside ReactFlow) */}
      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#d6e4ff] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#e8efff] bg-gradient-to-r from-[#e6f0ff] to-[#f5f9ff] px-4 py-3">
              <p className="text-sm font-semibold text-[#1d39c4]">
                {selected.kind === 'application'
                  ? 'Application Details'
                  : 'Utilization Details'}
              </p>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-[#d6e4ff] bg-white p-2 text-[#5c6b8a] transition hover:border-[#597ef7] hover:text-[#1d39c4]"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
              {selected.kind === 'application' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">
                        Application ID
                      </p>
                      <p className="mt-1 break-words font-mono text-sm font-semibold text-[#1c2b4a]">
                        {String(selected.app.application_id ?? '—')}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">
                        Owner
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-[#1c2b4a]">
                        {String(selected.app.owner_name ?? '—')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">
                        Status
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-[#1c2b4a]">
                        {String(selected.app.status ?? '—')}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">
                        TDR / Area
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#1c2b4a]">
                        ₹ {n(Number(selected.app.total_tdr_value ?? 0))} total
                        <br />
                        ₹ {n(Number(selected.app.remaining_tdr_value ?? 0))} remaining
                        <br />
                        Area: {n(Number(selected.app.total_area ?? 0))}
                      </p>
                    </div>
                  </div>

                  {selected.verification ? (
                    <div className="rounded-xl border border-[#ffe7ba] bg-[#fff7e6] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#d46b08]">
                        Blockchain Verification
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#1c2b4a]">
                        {selected.verification.tampered ? 'Tampered' : 'Verified'}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">
                        TxID
                      </p>
                      <p className="mt-1 break-words font-mono text-sm font-semibold text-[#1c2b4a]">
                        {truncateHash(String(selected.utilization.txId ?? '—'))}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">
                        Purpose
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-[#1c2b4a]">
                        {String(selected.utilization.utilization_purpose ?? '—')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">
                        Date
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-[#1c2b4a]">
                        {d(String(selected.utilization.utilization_date ?? ''))}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#d6e4ff] bg-white/95 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#597ef7]">
                        Amount / Area
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#1c2b4a]">
                        {n(
                          Number(
                            (selected.utilization as any).utilized_value_tdr ??
                              (selected.utilization as any).utilized_tdr_value ??
                              0,
                          ),
                        )}{' '}
                        TDR
                        <br />
                        Area: {n(Number((selected.utilization as any).utilized_area ?? 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#e8efff] bg-[#fafcff] px-4 py-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-[#d6e4ff] bg-white px-3 py-2 text-sm font-medium text-[#5c6b8a] transition hover:border-[#597ef7] hover:text-[#1d39c4]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* FOOTER */}

      <footer className="flex flex-wrap items-center gap-5 border-t border-[#eef2f7] bg-white px-5 py-4 text-[11px] font-semibold text-[#64748b]">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#1890ff]" />
          Root Application
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#9254de]" />
          Child Application
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#2563eb]" />
          Transfer Timeline
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#22c55e]" />
          Utilization Timeline
        </span>

        <span className="ml-auto text-[#94a3b8]">
          STEP 1 → STEP 2 → STEP 3
          timeline flow enabled
        </span>
      </footer>
    </section>
  )
}