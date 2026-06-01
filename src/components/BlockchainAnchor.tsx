import { useCallback, useState } from 'react'
import { FiCopy, FiExternalLink } from 'react-icons/fi'
import { getBlockchainTxExplorerUrl } from '../helpers/blockchainExplorer'

interface BlockchainAnchorProps {
  title: string
  txHash: string
  blockNumber?: number
  hint?: string
  compact?: boolean
}

export default function BlockchainAnchor({ title, txHash, blockNumber, hint, compact }: BlockchainAnchorProps) {
  const [copied, setCopied] = useState(false)
  const explorerUrl = getBlockchainTxExplorerUrl(txHash)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(txHash)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [txHash])

  return (
    <div className={`rounded-lg border border-[#e8e8e8] bg-[#fafafa] ${compact ? 'p-2.5' : 'p-3'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8c8c8c]">{title}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1 rounded-md border border-[#d9d9d9] bg-white px-2 py-1 text-[11px] font-medium text-[#262626] hover:border-[#1890ff]"
          >
            <FiCopy className="h-3 w-3" aria-hidden />
            {copied ? 'Copied' : 'Copy'}
          </button>
          {explorerUrl ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-[#1890ff] bg-[#e6f7ff] px-2 py-1 text-[11px] font-semibold text-[#1890ff] hover:bg-[#bae7ff]"
            >
              Explorer
              <FiExternalLink className="h-3 w-3" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
      <p className={`mt-1.5 font-mono text-[#262626] ${compact ? 'break-all text-[11px]' : 'break-all text-xs'}`}>{txHash}</p>
      {blockNumber != null ? (
        <p className="mt-1 text-[11px] text-[#595959]">
          Block <span className="font-mono font-medium">{blockNumber}</span>
        </p>
      ) : null}
      {hint ? <p className="mt-2 text-[11px] leading-snug text-[#8c8c8c]">{hint}</p> : null}
      {!explorerUrl && import.meta.env.DEV ? (
        <p className="mt-2 text-[10px] leading-snug text-[#bfbfbf]">
          Explorer: add <span className="font-mono">VITE_BLOCKCHAIN_EXPLORER_TX=…/tx/{'{hash}'}</span> in <span className="font-mono">.env</span>.
        </p>
      ) : null}
    </div>
  )
}
