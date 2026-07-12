import { getDocument, PixelsPerInch } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import { setupPdfJs } from './setupPdfJs'

export const EXPORT_TARGET_DPI = 300

export type RenderPageToCanvasOptions = {
  targetDpi?: number
  maxLongSide?: number
}

const pdfJsDocumentCache = new WeakMap<Uint8Array, Promise<PDFDocumentProxy>>()

async function loadPdfJsDocument(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  setupPdfJs()

  let cached = pdfJsDocumentCache.get(bytes)
  if (!cached) {
    cached = getDocument({ data: bytes.slice() }).promise
    pdfJsDocumentCache.set(bytes, cached)
  }

  return cached
}

function resolveScale(
  baseViewport: { width: number; height: number },
  options: RenderPageToCanvasOptions
): number {
  if (options.maxLongSide != null) {
    const longSide = Math.max(baseViewport.width, baseViewport.height)
    return options.maxLongSide / longSide
  }

  const targetDpi = options.targetDpi ?? EXPORT_TARGET_DPI
  return targetDpi / PixelsPerInch.PDF
}

export async function renderPageToCanvas(
  pdfBytes: Uint8Array,
  pageIndex: number,
  options: RenderPageToCanvasOptions = {}
): Promise<HTMLCanvasElement> {
  const pdf = await loadPdfJsDocument(pdfBytes)
  const page = await pdf.getPage(pageIndex + 1)
  const baseViewport = page.getViewport({ scale: 1 })
  const scale = resolveScale(baseViewport, options)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Failed to create canvas context')
  }

  await page.render({ canvas, canvasContext: context, viewport }).promise
  return canvas
}
