import { GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

let initialized = false

export function setupPdfJs(): void {
  if (initialized) return

  GlobalWorkerOptions.workerSrc = pdfWorkerUrl
  initialized = true
}
