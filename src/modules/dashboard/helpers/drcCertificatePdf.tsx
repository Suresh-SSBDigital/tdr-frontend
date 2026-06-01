import { createRoot } from 'react-dom/client'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

import type { CertificateRecord } from '../data/certificateLedgerData'
import DrcCertificateSheet from '../components/DrcCertificateSheet'

export function drcCertificatePdfFilename(
  record: CertificateRecord,
): string {
  const base = record.certificateNo
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')

  return `DRC_${base}.pdf`
}

/**
 * Export HTML element to A4 PDF, scaling to full page width and splitting into pages if needed.
 */
export async function downloadDrcCertificatePdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  // Convert HTML to PNG
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    skipFonts: false,
  })

  // Load image
  const img = new Image()
  img.src = dataUrl

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
  })

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const margin = 6
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2

  const imgWidth = img.width
  const imgHeight = img.height

  // Fit the certificate into one A4 page, preserving aspect ratio.
  const scale = Math.min(usableWidth / imgWidth, usableHeight / imgHeight)
  const scaledWidth = imgWidth * scale
  const scaledHeight = imgHeight * scale
  const x = margin
  const y = margin

  pdf.addImage(dataUrl, 'PNG', x, y, scaledWidth, scaledHeight)

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}



function waitForPaint(): Promise<void> {

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 300)
      })
    })
  })
}

/**
 * Render certificate offscreen and export PDF
 */
export async function downloadDrcCertificatePdfFromRecord(
  record: CertificateRecord,
  opts?: {
    blockchainTxHash?: string
    blockNumber?: number
  },
): Promise<void> {
  // Create hidden wrapper
  const wrap = document.createElement('div')

  wrap.style.cssText = `
    position: fixed;
    left: -99999px;
    top: 0;
    width: 210mm;
    background: #ffffff;
    overflow: visible;
    pointer-events: none;
    z-index: -1;
  `

  document.body.appendChild(wrap)

  const root = createRoot(wrap)

  let captureEl: HTMLDivElement | null = null

  try {
    root.render(
      <DrcCertificateSheet
        ref={(el) => {
          captureEl = el
        }}
        record={record}
        blockchainTxHash={opts?.blockchainTxHash}
        blockNumber={opts?.blockNumber}
      />,
    )

    // Wait for render + fonts
    await waitForPaint()

    // Wait for images
    const images = Array.from(
      wrap.querySelectorAll('img'),
    )

    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve()

        return new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve()
        })
      }),
    )

    if (!captureEl) {
      throw new Error('Certificate mount failed')
    }

    await downloadDrcCertificatePdf(
      captureEl,
      drcCertificatePdfFilename(record),
    )
  } catch (err) {
    console.error('PDF generation failed:', err)
    throw err
  } finally {
    root.unmount()
    wrap.remove()
  }
}