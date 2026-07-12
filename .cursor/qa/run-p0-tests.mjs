import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURES = join(__dirname, '..', 'test-fixtures')
const OUT = join(__dirname, 'p0-results.json')

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url,
).href

async function extractText(bytes, pageIndex) {
  const doc = await pdfjs.getDocument({ data: bytes }).promise
  const page = await doc.getPage(pageIndex + 1)
  const content = await page.getTextContent()
  return content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
}

async function runSd1() {
  const text2p = readFileSync(join(FIXTURES, 'text-2p.pdf'))
  const png = readFileSync(join(FIXTURES, 'test.png'))

  const { exportPdf } = await import('../../src/lib/pdf/exportPdf.ts')
  const { fitImageToA4 } = await import('../../src/lib/image/fitImageToA4.ts')

  const sourceId = 'src-text-2p'
  const fitted = await fitImageToA4(new Uint8Array(png), 'image/png')

  const pages = [
    { id: 'p1', kind: 'pdf-native', sourcePdfId: sourceId, pageIndex: 0, label: 'p1' },
    { id: 'p2', kind: 'image', fileName: 'test.png', mimeType: fitted.mimeType, bytes: fitted.bytes, width: fitted.width, height: fitted.height },
    { id: 'p3', kind: 'pdf-native', sourcePdfId: sourceId, pageIndex: 1, label: 'p2' },
  ]

  const sources = {
    [sourceId]: {
      id: sourceId,
      fileName: 'text-2p.pdf',
      bytes: new Uint8Array(text2p),
      pageCount: 2,
    },
  }

  const { bytes, warnings } = await exportPdf(pages, sources)
  const mergedSize = bytes.byteLength
  const originalSize = text2p.byteLength
  const ratio = mergedSize / originalSize

  const page1Text = await extractText(bytes, 0)
  const page3Text = await extractText(bytes, 2)

  return {
    id: 'TC-SD-1/TC-20/TC-21/TC-22',
    pass:
      warnings.length === 0 &&
      page1Text.includes('ALPHA') &&
      page3Text.includes('BETA') &&
      ratio < 2,
    warnings,
    pageCount: (await PDFDocument.load(bytes)).getPageCount(),
    page1Text,
    page3Text,
    originalSize,
    mergedSize,
    ratio,
  }
}

async function runEncrypted() {
  const { loadPdf } = await import('../../src/lib/pdf/importPdf.ts')
  const bytes = readFileSync(join(FIXTURES, 'encrypted.pdf'))
  let message = ''
  try {
    await loadPdf(new Uint8Array(bytes))
  } catch (error) {
    message = error instanceof Error ? error.message : String(error)
  }

  const pass = /encrypt/i.test(message)
  return { id: 'TC-07', pass, message }
}

async function main() {
  const results = {
    build: 'passed separately',
    sd1: await runSd1(),
    encrypted: await runEncrypted(),
    timestamp: new Date().toISOString(),
  }
  writeFileSync(OUT, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
