import { PDFDocument } from 'pdf-lib'

import { A4_HEIGHT_PT, A4_WIDTH_PT, PX_TO_PT } from '@/lib/constants'
import { EXPORT_TARGET_DPI, renderPageToCanvas } from '@/lib/pdf-render/renderPageToCanvas'
import type { SourcePdf, WorkspacePage } from '@/types/workspace'

import {
  clearPdfDocumentCache,
  createPdfDocumentCache,
  getOrLoadPdfDocument,
} from './pdfDocumentCache'

export type ExportPdfResult = {
  bytes: Uint8Array
  warnings: string[]
}

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error('Failed to encode canvas as PNG'))
      },
      'image/png'
    )
  })

  const buffer = await blob.arrayBuffer()
  return new Uint8Array(buffer)
}

async function embedRasterizedPdfPage(
  outDoc: PDFDocument,
  sourceBytes: Uint8Array,
  pageIndex: number
): Promise<void> {
  const canvas = await renderPageToCanvas(sourceBytes, pageIndex)
  const pngBytes = await canvasToPngBytes(canvas)
  const image = await outDoc.embedPng(pngBytes)

  const widthPt = (canvas.width * 72) / EXPORT_TARGET_DPI
  const heightPt = (canvas.height * 72) / EXPORT_TARGET_DPI
  const page = outDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT])

  page.drawImage(image, {
    x: 0,
    y: A4_HEIGHT_PT - heightPt,
    width: widthPt,
    height: heightPt,
  })
}

async function embedImagePage(
  outDoc: PDFDocument,
  page: Extract<WorkspacePage, { kind: 'image' }>
): Promise<void> {
  const pdfPage = outDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT])
  const image =
    page.mimeType === 'image/jpeg'
      ? await outDoc.embedJpg(page.bytes)
      : await outDoc.embedPng(page.bytes)

  const widthPt = page.width * PX_TO_PT
  const heightPt = page.height * PX_TO_PT

  pdfPage.drawImage(image, {
    x: 0,
    y: A4_HEIGHT_PT - heightPt,
    width: widthPt,
    height: heightPt,
  })
}

export async function exportPdf(
  pages: WorkspacePage[],
  sources: Record<string, SourcePdf>
): Promise<ExportPdfResult> {
  const outDoc = await PDFDocument.create()
  const cache = createPdfDocumentCache()
  const warnings: string[] = []

  try {
    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index]

      if (page.kind === 'pdf-native') {
        const source = sources[page.sourcePdfId]
        if (!source) {
          throw new Error(`Missing source PDF for page ${index + 1}`)
        }

        try {
          const srcDoc = await getOrLoadPdfDocument(cache, page.sourcePdfId, source.bytes)
          const [copiedPage] = await outDoc.copyPages(srcDoc, [page.pageIndex])
          outDoc.addPage(copiedPage)
        } catch {
          await embedRasterizedPdfPage(outDoc, source.bytes, page.pageIndex)
          warnings.push(
            `Page ${index + 1} exported as image (original could not be copied)`
          )
        }

        continue
      }

      await embedImagePage(outDoc, page)
    }

    const bytes = await outDoc.save()
    return { bytes, warnings }
  } finally {
    clearPdfDocumentCache(cache)
  }
}
