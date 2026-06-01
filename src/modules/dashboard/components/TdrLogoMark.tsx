/** Inline emblem for DRC / TCP branding (captures cleanly in PDF via html2canvas). */
export default function TdrLogoMark({ className = 'h-[72px] w-[72px] shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="tdr-emblem-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0050b3" />
          <stop offset="100%" stopColor="#1890ff" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#tdr-emblem-grad)" opacity={0.95} />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={2} />
      <path
        d="M50 22 L58 42 L80 42 L62 54 L70 76 L50 62 L30 76 L38 54 L20 42 L42 42 Z"
        fill="#ffffff"
        fillOpacity={0.92}
      />
      <text x="50" y="88" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700" letterSpacing="0.08em">
        TCP · MP
      </text>
    </svg>
  )
}
