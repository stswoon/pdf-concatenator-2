import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURES = join(__dirname, '..', 'test-fixtures')

mkdirSync(FIXTURES, { recursive: true })

async function drawPage(doc, font, text) {
  const page = doc.addPage([595.28, 841.89])
  page.drawText(text, { x: 72, y: 750, size: 24, font, color: rgb(0, 0, 0) })
}

async function createText2pPdf() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  await drawPage(doc, font, 'Page one selectable text ALPHA')
  await drawPage(doc, font, 'Page two selectable text BETA')
  writeFileSync(join(FIXTURES, 'text-2p.pdf'), await doc.save())
}

async function createSinglePagePdf(name, text) {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  await drawPage(doc, font, text)
  writeFileSync(join(FIXTURES, name), await doc.save())
}

async function create3PagePdf() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  for (let i = 1; i <= 3; i += 1) {
    await drawPage(doc, font, `Three-page doc page ${i}`)
  }
  writeFileSync(join(FIXTURES, '3page.pdf'), await doc.save())
}

async function createEncryptedPdf() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  await drawPage(doc, font, 'Encrypted content')
  const bytes = await doc.save({
    userPassword: 'secret',
    ownerPassword: 'owner',
  })
  writeFileSync(join(FIXTURES, 'encrypted.pdf'), bytes)
}

function writeCorruptPdf() {
  writeFileSync(join(FIXTURES, 'corrupt.pdf'), 'not a real pdf file content')
}

function writeUnsupportedTxt() {
  writeFileSync(join(FIXTURES, 'unsupported.txt'), 'unsupported format test')
}

// 1x1 red PNG
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

// minimal valid JPEG (1x1)
const TINY_JPG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AP/B//9k=',
  'base64',
)

async function main() {
  await createText2pPdf()
  await createSinglePagePdf('a.pdf', 'Single page A')
  const bDoc = await PDFDocument.create()
  const font = await bDoc.embedFont(StandardFonts.Helvetica)
  await drawPage(bDoc, font, 'B page one')
  await drawPage(bDoc, font, 'B page two')
  writeFileSync(join(FIXTURES, 'b.pdf'), await bDoc.save())
  await create3PagePdf()
  await createEncryptedPdf()
  writeCorruptPdf()
  writeUnsupportedTxt()
  writeFileSync(join(FIXTURES, 'test.png'), TINY_PNG)
  writeFileSync(join(FIXTURES, 'small.jpg'), TINY_JPG)
  writeFileSync(join(FIXTURES, 'tiny.png'), TINY_PNG)
  console.log('Fixtures written to', FIXTURES)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
