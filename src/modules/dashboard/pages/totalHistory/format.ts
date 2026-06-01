import { toast } from 'react-toastify'

export function n(v?: number | null) {
  if (v == null || Number.isNaN(v)) return '—'
  return v.toLocaleString('en-IN')
}

export function d(v?: string | Date | null) {
  if (!v) return '—'
  const dt = new Date(v)
  if (Number.isNaN(dt.getTime())) return String(v)
  return dt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncateMiddle(value?: string, head = 8, tail = 6) {
  if (!value) return '—'
  if (value.length <= head + tail + 3) return value
  return `${value.slice(0, head)}...${value.slice(-tail)}`
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  } catch {
    toast.error('Could not copy')
  }
}

export function statusBadgeClass(status?: string) {
  const s = (status ?? '').toUpperCase()
  if (s === 'CREATED' || s === 'COMPLETED' || s === 'TRANSFERRED')
    return 'bg-[#f6ffed] text-[#389e0d] border border-[#b7eb8f]'
  if (s === 'DRC_GENERATED') return 'bg-[#f9f0ff] text-[#722ed1] border border-[#d3adf7]'
  if (s.includes('TRANSFER')) return 'bg-[#fff7e6] text-[#d46b08] border border-[#ffd591]'
  if (s.includes('UTIL')) return 'bg-[#f6ffed] text-[#237804] border border-[#b7eb8f]'
  return 'bg-[#f5f5f5] text-[#595959] border border-[#d9d9d9]'
}

export function actionBadgeClass(action?: string) {
  const a = (action ?? '').toUpperCase()
  if (a.includes('TRANSFER_OUT')) return 'bg-[#fff7e6] text-[#d46b08] border border-[#ffd591]'
  if (a.includes('TRANSFER_IN')) return 'bg-[#e6fffb] text-[#08979c] border border-[#87e8de]'
  if (a.includes('UTILIZATION')) return 'bg-[#f6ffed] text-[#237804] border border-[#b7eb8f]'
  return 'bg-[#f0f5ff] text-[#1890ff] border border-[#adc6ff]'
}

export const thClass =
  'sticky top-0 z-20 border-b border-white/10 bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#312e81] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-white whitespace-nowrap shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]'
export const tdClass = 'border-b border-[#f5f7fa] px-3 py-2.5 text-xs text-[#1c2b4a] align-top'
