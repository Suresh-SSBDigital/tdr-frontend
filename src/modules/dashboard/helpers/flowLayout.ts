import dagre from 'dagre'
import { type Node, type Edge, Position } from '@xyflow/react'

export const APP_WIDTH = 300
export const APP_HEIGHT = 380
export const TX_WIDTH = 188
export const TX_HEIGHT = 185

function nodeSize(node: Node) {
  if (node.type === 'applicationNode') return { w: APP_WIDTH, h: APP_HEIGHT }
  return { w: TX_WIDTH, h: TX_HEIGHT }
}

function safeDagrePos(
  graph: dagre.graphlib.Graph,
  nodeId: string,
  fallback: { x: number; y: number },
) {
  const pos = graph.node(nodeId)
  if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') return pos
  return fallback
}

function boxesOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  pad = 28,
) {
  return !(
    a.x + a.w + pad <= b.x ||
    b.x + b.w + pad <= a.x ||
    a.y + a.h + pad <= b.y ||
    b.y + b.h + pad <= a.y
  )
}

function resolveOverlaps(nodes: Node[]) {
  const placed = nodes.map((n) => {
    const { w, h } = nodeSize(n)
    return { node: n, x: n.position.x, y: n.position.y, w, h }
  })

  for (let pass = 0; pass < 12; pass++) {
    let moved = false
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]
        const b = placed[j]
        if (!boxesOverlap(a, b, 20)) continue
        b.y = a.y + a.h + 36
        moved = true
      }
    }
    if (!moved) break
  }

  return placed.map((p) => ({
    ...p.node,
    position: { x: p.x, y: p.y },
  }))
}

/** Layout transfer chain left-to-right; utilizations in rows below parent (no overlap). */
export function layoutRidHistoryTree(nodes: Node[], edges: Edge[]) {
  if (nodes.length === 0) return { nodes: [], edges }

  const utilTargets = new Set(
    edges.filter((e) => String(e.target).startsWith('u-')).map((e) => e.target),
  )
  const flowNodes = nodes.filter((n) => !utilTargets.has(n.id))
  const flowEdges = edges.filter((e) => !utilTargets.has(e.target))

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 130, ranksep: 220, marginx: 60, marginy: 80 })

  flowNodes.forEach((node) => {
    const { w, h } = nodeSize(node)
    dagreGraph.setNode(node.id, { width: w, height: h })
  })

  flowEdges.forEach((edge) => {
    if (dagreGraph.hasNode(edge.source) && dagreGraph.hasNode(edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target)
    }
  })

  try {
    dagre.layout(dagreGraph)
  } catch {
    flowNodes.forEach((node, i) => {
      const { w, h } = nodeSize(node)
      dagreGraph.setNode(node.id, { x: i * (w + 120), y: 0, width: w, height: h })
    })
  }

  const positioned = new Map<string, Node>()

  flowNodes.forEach((node, index) => {
    const { w, h } = nodeSize(node)
    const pos = safeDagrePos(dagreGraph, node.id, { x: index * (w + 140), y: 0 })
    positioned.set(node.id, {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
    })
  })

  const utilByApp = new Map<string, string[]>()
  for (const edge of edges) {
    if (!String(edge.target).startsWith('u-')) continue
    const list = utilByApp.get(edge.source) ?? []
    list.push(edge.target)
    utilByApp.set(edge.source, list)
  }

  const UTIL_GAP_X = 40
  const UTIL_GAP_Y = 44
  const UTIL_PER_ROW = 3
  const UTIL_TOP = 72

  for (const [appId, utilIds] of utilByApp) {
    const appNode = positioned.get(appId)
    if (!appNode) continue

    utilIds.forEach((uid, index) => {
      const utilNode = nodes.find((n) => n.id === uid)
      if (!utilNode) return
      const col = index % UTIL_PER_ROW
      const row = Math.floor(index / UTIL_PER_ROW)
      const rowCount = Math.min(UTIL_PER_ROW, utilIds.length - row * UTIL_PER_ROW)
      const rowWidth = rowCount * TX_WIDTH + Math.max(0, rowCount - 1) * UTIL_GAP_X
      const baseX = appNode.position.x + APP_WIDTH / 2 - rowWidth / 2

      positioned.set(uid, {
        ...utilNode,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: {
          x: baseX + col * (TX_WIDTH + UTIL_GAP_X),
          y: appNode.position.y + APP_HEIGHT + UTIL_TOP + row * (TX_HEIGHT + UTIL_GAP_Y),
        },
      })
    })
  }

  const layoutedNodes = nodes.map((n, index) => {
    const placed = positioned.get(n.id)
    if (placed) return placed
    return {
      ...n,
      position: { x: index * 80, y: index * 80 },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    }
  })

  return { nodes: resolveOverlaps(layoutedNodes), edges }
}

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  if (nodes.some((n) => n.type === 'utilizationNode' || n.type === 'applicationNode')) {
    return layoutRidHistoryTree(nodes, edges)
  }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 160 })

  nodes.forEach((node) => {
    const { w, h } = nodeSize(node)
    dagreGraph.setNode(node.id, { width: w, height: h })
  })

  edges.forEach((edge) => {
    if (dagreGraph.hasNode(edge.source) && dagreGraph.hasNode(edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node, index) => {
    const pos = safeDagrePos(dagreGraph, node.id, { x: index * 220, y: 0 })
    const { w, h } = nodeSize(node)
    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
    }
  })

  return { nodes: layoutedNodes, edges }
}
