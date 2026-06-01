/**
 * Optional explorer deep-link for transaction hashes (consortium / public chain).
 * Set in `.env`: VITE_BLOCKCHAIN_EXPLORER_TX=https://your-explorer.example/tx/{hash}
 */
export function getBlockchainTxExplorerUrl(txHash: string): string | null {
  const raw = import.meta.env.VITE_BLOCKCHAIN_EXPLORER_TX as string | undefined
  const template = typeof raw === 'string' ? raw.trim() : ''
  if (!template || !txHash.trim()) return null
  if (!template.includes('{hash}')) return null
  return template.replace(/\{hash\}/g, encodeURIComponent(txHash.trim()))
}
