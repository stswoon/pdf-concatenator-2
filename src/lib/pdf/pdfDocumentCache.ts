import { PDFDocument } from 'pdf-lib'

export type PdfDocumentCache = Map<string, PDFDocument>

export function createPdfDocumentCache(): PdfDocumentCache {
  return new Map()
}

export async function getOrLoadPdfDocument(
  cache: PdfDocumentCache,
  sourcePdfId: string,
  bytes: Uint8Array
): Promise<PDFDocument> {
  const cached = cache.get(sourcePdfId)
  if (cached) return cached

  const doc = await PDFDocument.load(bytes)
  cache.set(sourcePdfId, doc)
  return doc
}

export function clearPdfDocumentCache(cache: PdfDocumentCache): void {
  cache.clear()
}
