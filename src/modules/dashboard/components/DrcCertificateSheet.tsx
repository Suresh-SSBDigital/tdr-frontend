import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { CertificateRecord } from '../data/certificateLedgerData'
import { getDrcCertificateVerifyUrl } from '../helpers/drcCertificateDocument'
import {
  demoSha256Hex,
  parseCertificateIssueDate,
  resolveDrcCertificateDisplay,
} from '../helpers/drcCertificateDisplay'

type Props = {
  record: CertificateRecord
  blockchainTxHash?: string
  blockNumber?: number
}

function SectionBar({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex min-h-[32px] items-stretch bg-[#1b5e20] text-white shadow-[inset_0_-2px_0_rgba(0,0,0,.12)]">
      <div className="flex w-9 shrink-0 items-center justify-center border-r border-white/25 bg-black/25 text-[13px] font-black tabular-nums">
        {num}
      </div>
      <div className="flex flex-1 items-center px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em]">{title}</div>
    </div>
  )
}

function FieldTable({ rows }: { rows: [string, string][] }) {
  const rowKey = (label: string, i: number) => `${label || 'row'}-${i}`
  return (
    <div className="overflow-hidden border-2 border-[#2e7d32] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
      {rows.map(([k, v], i) => (
        <div
          key={rowKey(k, i)}
          className="grid grid-cols-[minmax(0,42%)_minmax(0,58%)] border-b border-[#b2dfbc] text-[11px] last:border-b-0 sm:grid-cols-[39%_61%]"
        >
          <div className="border-r border-[#b2dfbc] bg-[#e8f5e9] px-2.5 py-2 font-bold uppercase leading-snug tracking-wide text-[#1b5e20]">
            {k || '\u00a0'}
          </div>
          <div className="bg-white px-2.5 py-2 leading-relaxed text-[#263238]">{v}</div>
        </div>
      ))}
    </div>
  )
}

/** Ornate circular seal — Government of Madhya Pradesh (demo vector). */
function MpSealMark({ className = 'h-[88px] w-[88px]' }: { className?: string }) {
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const a = (i * Math.PI * 2) / 24 - Math.PI / 2
    const x2 = 40 + Math.cos(a) * 14
    const y2 = 40 + Math.sin(a) * 14
    return <line key={i} x1="40" y1="40" x2={x2} y2={y2} stroke="#c9a227" strokeWidth="0.65" />
  })
  return (
    <svg className={className} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="seal-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffef5" />
          <stop offset="100%" stopColor="#f5f0e6" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#seal-inner)" stroke="#5d1010" strokeWidth="2.5" />
      <circle cx="40" cy="40" r="33" fill="none" stroke="#8d6e63" strokeWidth="1.2" />
      <circle cx="40" cy="40" r="28" fill="none" stroke="#c9a227" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="22" fill="#fffdf8" stroke="#a1887f" strokeWidth="0.6" />
      {spokes}
      <circle cx="40" cy="40" r="6" fill="#fffdf8" stroke="#c9a227" strokeWidth="1" />
      <text x="40" y="29" textAnchor="middle" fill="#4e342e" fontSize="6.2" fontWeight="800" letterSpacing="0.06em">
        GOVERNMENT OF
      </text>
      <text x="40" y="38" textAnchor="middle" fill="#6d1b1b" fontSize="8.5" fontWeight="900">
        M.P.
      </text>
      <text x="40" y="49" textAnchor="middle" fill="#37474f" fontSize="5.8" fontWeight="700" letterSpacing="0.12em">
        URBAN ADMIN.
      </text>
      <text x="40" y="58" textAnchor="middle" fill="#5d4037" fontSize="5.5" fontWeight="600">
        SATYAMEVA JAYATE
      </text>
      <text x="40" y="69" textAnchor="middle" fill="#78909c" fontSize="5">
        (Official Seal · Demo)
      </text>
    </svg>
  )
}

function TdrBuildingLogo({ className = 'h-[84px] w-[100px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 88" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="8" y="10" width="84" height="30" rx="3" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="1.2" />
      <text x="50" y="22" textAnchor="middle" fill="#1b5e20" fontSize="13" fontWeight="900" letterSpacing="0.05em">
        TDR
      </text>
      <text x="50" y="33" textAnchor="middle" fill="#33691e" fontSize="6" fontWeight="700">
        TRANSFERABLE DEVELOPMENT RIGHTS
      </text>
      <rect x="10" y="52" width="26" height="30" rx="2" fill="#1b5e20" stroke="#0d2818" strokeWidth="0.75" />
      <rect x="17" y="60" width="5" height="8" fill="#e8f5e9" opacity={0.92} />
      <rect x="25" y="60" width="5" height="8" fill="#e8f5e9" opacity={0.92} />
      <rect x="37" y="44" width="28" height="38" rx="2" fill="#2e7d32" stroke="#1b5e20" strokeWidth="0.75" />
      <rect x="45" y="54" width="6" height="9" fill="#fff" opacity={0.9} />
      <rect x="54" y="54" width="6" height="9" fill="#fff" opacity={0.9} />
      <rect x="68" y="50" width="22" height="32" rx="2" fill="#388e3c" stroke="#1b5e20" strokeWidth="0.75" />
      <rect x="73" y="58" width="4" height="6" fill="#c8e6c9" opacity={0.95} />
      <rect x="81" y="58" width="4" height="6" fill="#c8e6c9" opacity={0.95} />
      <polygon points="50,38 54,46 46,46" fill="#66bb6a" stroke="#2e7d32" strokeWidth="0.5" />
    </svg>
  )
}

function LocationMapPlaceholder() {
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full max-h-[148px]" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="200" height="160" fill="#fafafa" stroke="#2e7d32" strokeWidth="2" />
      <rect x="3" y="3" width="194" height="154" fill="#ffffff" stroke="#81c784" strokeWidth="1" />
      <text x="100" y="16" textAnchor="middle" fill="#424242" fontSize="10" fontWeight="700">
        LOCATION MAP
      </text>
      <path d="M170 28 L178 22 L178 34 Z" fill="#1976d2" />
      <text x="182" y="30" fill="#1976d2" fontSize="9" fontWeight="700">
        N
      </text>
      <rect x="24" y="44" width="52" height="40" fill="#e3f2fd" stroke="#90caf9" strokeWidth="1" />
      <text x="50" y="68" textAnchor="middle" fill="#1565c0" fontSize="8">
        123/1
      </text>
      <rect x="82" y="52" width="46" height="36" fill="#e8f5e9" stroke="#81c784" strokeWidth="1" />
      <text x="105" y="73" textAnchor="middle" fill="#2e7d32" fontSize="8">
        124/2
      </text>
      <rect x="134" y="60" width="44" height="32" fill="#fff3e0" stroke="#ffb74d" strokeWidth="1" />
      <text x="156" y="79" textAnchor="middle" fill="#ef6c00" fontSize="8">
        Road
      </text>
      <text x="100" y="142" textAnchor="middle" fill="#757575" fontSize="7">
        Indicative cadastral sketch (demo)
      </text>
    </svg>
  )
}

function FooterSeal({ className = 'h-[72px] w-[72px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="40" cy="40" r="36" fill="#f5faf5" stroke="#2e7d32" strokeWidth="2" />
      <circle cx="40" cy="40" r="29" fill="none" stroke="#66bb6a" strokeWidth="1" strokeDasharray="4 3" />
      <text x="40" y="32" textAnchor="middle" fill="#1b5e20" fontSize="7" fontWeight="700">
        GOVT. OF M.P.
      </text>
      <text x="40" y="44" textAnchor="middle" fill="#37474f" fontSize="8" fontWeight="800">
        TDR
      </text>
      <text x="40" y="56" textAnchor="middle" fill="#388e3c" fontSize="6.5" fontWeight="600">
        CERTIFIED
      </text>
    </svg>
  )
}

function CheckVerified() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-2 py-0.5 text-[10px] font-bold text-[#2e7d32] ring-1 ring-[#a5d6a7]">
      <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
        <circle cx="8" cy="8" r="8" fill="#43a047" />
        <path d="M4.5 8.2 L7 10.7 L11.5 5.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      On-Chain Verified
    </span>
  )
}

const DrcCertificateSheet = forwardRef<HTMLDivElement, Props>(function DrcCertificateSheet(
  { record, blockchainTxHash, blockNumber }: Props,
  ref,
) {
  const d = resolveDrcCertificateDisplay(record)
  const verifyUrl = getDrcCertificateVerifyUrl(record)
  const tx = blockchainTxHash ?? `0xISSUED${record.sno.toString().padStart(4, '0')}`
  const block = blockNumber ?? 10000 + record.sno
  const shaHex = demoSha256Hex(tx)
  const issueDt = parseCertificateIssueDate(record.issueDate)
  const chainTs =
    issueDt?.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) ?? `${d.issueDateFormatted} · 12:00`

  const ownerRows: [string, string][] = [
    ['Owner Name', d.ownerName],
    ['Father / Husband Name', d.fatherOrHusbandName],
    ['Samagra ID', d.samagraId],
    ['Mobile No.', d.mobileNo],
    ['Address', d.address],
  ]

  const landRows: [string, string][] = [
    ['Khasra No.', d.khasraNo],
    ['Village', d.village],
    ['Tehsil', d.tehsil],
    ['District', d.district],
    ['Total Land Area', `${d.totalLandAreaSqM} Sq.m.`],
    ['Land Use', d.landUse],
    ['Zone / Sector', d.zoneSector],
  ]

  const tdrRows: [string, string][] = [
    ['Permissible FSI / FAR', d.permissibleFsi],
    ['Base FSI Consumed', d.baseFsiConsumed],
    ['Additional TDR (Permissible)', d.additionalTdrLine],
    ['TDR Value', d.tdrValueFormula],
    ['Total TDR Granted', `${d.totalTdrGranted} Sq.m.`],
    ['', `(${d.totalTdrWords})`],
    ['TDR Certificate Valid Upto', `${d.validUptoFormatted} (5 Years from Issue Date)`],
    ['Balance TDR (remaining, registry)', `${d.balanceTdrSqm} Sq.m.`],
    ['Market value / sq.m (₹)', d.marketValueSqm],
  ]

  const utilRows: [string, string][] = [
    ['Utilization (TDR issued vs remaining)', `${d.utilizedPct} of total TDR — remaining ${d.balanceTdrSqm} Sq.m.`],
    ['Transferred TDR', `${d.transferredTdrSqm} Sq.m.`],
    ['Transfer Restriction', d.transferRestriction],
    ['Verification', d.verificationLine],
  ]

  return (
    <div
      ref={ref}
      className="relative box-border w-full max-w-[794px] overflow-hidden bg-[#eceff1] text-[#212121]"
      style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, Arial, sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="-rotate-[22deg] select-none text-[clamp(76px,21vw,138px)] font-black leading-none text-[#2e7d32]/[0.038]">
          TDR
        </span>
      </div>

      {/* Outer statutory frame: double green band like printed form */}
      <div className="relative m-3 rounded-[2px] bg-[#2e7d32] p-[5px] shadow-[0_4px_24px_rgba(0,0,0,.1)]">
        <div className="rounded-[1px] border-[3px] border-double border-[#1b5e20] bg-[#fffdf7] p-[2px]">
          <div className="border border-[#558b2f]/90 bg-[#fffdf9]">
            <header className="border-b-2 border-[#c8e6c9] bg-gradient-to-b from-[#f1f8e9]/90 to-[#fffdf9] px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
              <div className="flex flex-col items-stretch gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex shrink-0 justify-center lg:justify-start">
                  <MpSealMark />
                </div>

                <div className="min-w-0 flex-1 text-center lg:px-4">
                  <p className="text-[16px] font-black uppercase leading-[1.15] tracking-[0.04em] text-[#0a1929] sm:text-[18px]">
                    Government of Madhya Pradesh
                  </p>
                  <p className="mt-2 text-[11px] font-bold uppercase leading-snug tracking-[0.08em] text-[#132f4c] sm:text-[12px]">
                    Department of Urban Administration &amp; Development
                  </p>
                  <p className="mt-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#1b5e20] sm:text-[13px]">
                    TDR (Transferable Development Rights) Certificate
                  </p>
                  <div className="mt-3 flex justify-center">
                    <span className="rounded-full bg-[#6a1b9a] px-8 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_2px_8px_rgba(106,27,154,.35)] ring-2 ring-[#ede7f6]">
                      DRC Certificate
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 justify-center lg:justify-end lg:pt-1">
                  <TdrBuildingLogo />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 rounded-sm border border-[#a5d6a7] bg-[#f9fff9] px-4 py-2.5 text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,.85)] sm:flex-row sm:items-center sm:justify-between">
                <p>
                  <span className="font-extrabold text-[#263238]">Certificate No. : </span>
                  <span className="font-mono text-[13px] font-bold tracking-tight text-[#b71c1c]">{d.certificateNo}</span>
                </p>
                <p className="sm:text-right">
                  <span className="font-extrabold text-[#263238]">Date of Issue : </span>
                  <span className="font-semibold text-[#212121]">{d.issueDateFormatted}</span>
                </p>
              </div>

              <div className="mt-4 rounded-sm border border-[#b2dfbc] bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-justify text-[11px] font-medium leading-[1.65] text-[#37474f]">
                  This is to certify that the Development Rights available in the TDR Generating Area as per the provisions of{' '}
                  <span className="font-bold text-[#1b5e20]">MP TDR Policy, 2017</span> have been calculated and duly issued in favour of the
                  owner as per details given below.
                </p>
              </div>
            </header>

          <div className="space-y-[18px] bg-[#fffdf9] px-4 py-5 sm:px-6">
            <section className="shadow-[0_1px_0_rgba(46,125,50,.15)]">
              <SectionBar num={1} title="Owner Details" />
              <div className="mt-2 grid gap-3 md:grid-cols-[minmax(0,1fr)_156px]">
                <FieldTable rows={ownerRows} />
                <div className="flex flex-col items-center justify-start border-2 border-[#546e7a] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,.8)]">
                  <p className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#263238]">
                    Scan to Verify
                  </p>
                  <QRCodeSVG
                    value={verifyUrl}
                    size={124}
                    level="H"
                    includeMargin
                    marginSize={2}
                    fgColor="#141414"
                    bgColor="#ffffff"
                  />
                  <a
                    href={verifyUrl}
                    className="mt-2 line-clamp-3 text-center font-mono text-[8px] leading-tight text-[#1565c0] underline"
                  >
                    Open portal
                  </a>
                </div>
              </div>
            </section>

            <section className="shadow-[0_1px_0_rgba(46,125,50,.15)]">
              <SectionBar num={2} title="Land / Property Details (TDR Generating Area)" />
              <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,38%)]">
                <FieldTable rows={landRows} />
                <div className="flex min-h-[148px] items-stretch justify-center border-2 border-[#2e7d32] bg-[#fafafa] p-1.5 shadow-inner">
                  <LocationMapPlaceholder />
                </div>
              </div>
            </section>

            <section className="shadow-[0_1px_0_rgba(46,125,50,.15)]">
              <SectionBar num={3} title="TDR Details" />
              <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,34%)]">
                <FieldTable rows={tdrRows} />
                <div className="overflow-hidden rounded-sm border-2 border-[#43a047] bg-white shadow-md">
                  <div className="bg-[#a5d6a7] px-3 py-2.5 text-center text-[11px] font-black uppercase tracking-[0.14em] text-[#1b5e20] ring-1 ring-[#c8e6c9]">
                    TDR Value Summary
                  </div>
                  <div className="space-y-1 px-3 py-3 text-[11px]">
                    <div className="flex justify-between gap-2 border-b border-[#e8f5e9] pb-1">
                      <span className="font-semibold text-[#424242]">Issued area</span>
                      <span className="font-mono font-semibold">{d.summaryAreaLabel} Sq.m.</span>
                    </div>
                    <div className="flex justify-between gap-2 border-b border-[#e8f5e9] pb-1">
                      <span className="font-semibold text-[#424242]">TDR Factor</span>
                      <span className="font-mono font-semibold">{d.summaryTdrFactor}</span>
                    </div>
                    <div className="flex justify-between gap-2 pt-0.5">
                      <span className="font-semibold text-[#424242]">Total TDR</span>
                      <span className="font-mono font-bold text-[#2e7d32]">{d.summaryTotalTdr} Sq.m.</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="shadow-[0_1px_0_rgba(46,125,50,.15)]">
              <SectionBar num={4} title="DRC Utilization (TDR Receiving Area)" />
              <p className="mt-2 mb-2 text-justify text-[10.5px] leading-relaxed text-[#424242]">
                This Development Rights Certificate may be utilized in any notified TDR Receiving Area within Madhya Pradesh subject to
                applicable FAR / premium charges and verification by the competent Urban Local Body / authority.
              </p>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,42%)]">
                <FieldTable rows={utilRows} />
                <div className="overflow-hidden rounded-sm border-2 border-[#1976d2] bg-white shadow-md">
                  <div className="bg-[#90caf9] px-3 py-2.5 text-center text-[11px] font-black uppercase tracking-[0.12em] text-[#0d47a1] ring-1 ring-[#bbdefb]">
                    Blockchain Verification
                  </div>
                  <div className="space-y-2 px-3 py-3 text-[10px] leading-snug">
                    <div>
                      <p className="font-bold text-[#546e7a]">Transaction ID</p>
                      <p className="mt-0.5 break-all font-mono text-[#212121]">{tx}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[#546e7a]">Block Number</p>
                      <p className="mt-0.5 font-mono font-semibold text-[#1565c0]">{block}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[#546e7a]">Hash (SHA-256)</p>
                      <p className="mt-0.5 break-all font-mono text-[9px] text-[#37474f]">{shaHex}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[#546e7a]">Timestamp</p>
                      <p className="mt-0.5 font-mono text-[#212121]">{chainTs} IST</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="font-bold text-[#546e7a]">Status:</span>
                      <CheckVerified />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <footer className="border-t-2 border-[#c8e6c9] bg-[#f9fff9]/80 pt-5">
              <div className="grid gap-5 sm:grid-cols-3 sm:items-start">
                <div className="flex flex-col items-center text-center">
                  <FooterSeal />
                  <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wide text-[#546e7a]">(Official Seal)</p>
                </div>

                <div className="rounded-sm border-2 border-[#ffb300] bg-[#fff8e1] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]">
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.15em] text-[#e65100]">
                    Important Instructions
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[9.5px] leading-snug text-[#424242]">
                    <li>Validity is restricted to five (5) years from the date of issue unless revised by competent authority.</li>
                    <li>Utilization shall conform to MP TDR Policy, 2017, departmental circulars and ULB approvals.</li>
                    <li>Tampering, falsification or misuse may attract penal action as per applicable laws.</li>
                    <li>For authenticity, scan the QR code or verify through the official TCP / Urban Administration portal.</li>
                  </ul>
                </div>

                <div className="text-center sm:text-right">
                  <p className="font-serif text-[23px] italic leading-none text-[#0d47a1]">Anil Kumar Singh</p>
                  <div className="mx-auto mt-2.5 h-[2px] w-40 bg-gradient-to-r from-transparent via-[#37474f] to-transparent sm:ml-auto sm:mr-0" />
                  <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wide text-[#37474f]">Additional Director</p>
                  <p className="text-[10px] font-semibold text-[#546e7a]">Urban Administration &amp; Development</p>
                  <p className="mt-1.5 text-[9px] italic text-[#78909c]">(Digital signature · demo)</p>
                </div>
              </div>

              <p className="mt-5 border-t border-dashed border-[#cfd8dc] pt-3 text-center text-[9px] font-semibold italic text-[#607d8b]">
                Note: This is a computer generated certificate and does not require physical signature.
              </p>
            </footer>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
})

DrcCertificateSheet.displayName = 'DrcCertificateSheet'

export default DrcCertificateSheet
