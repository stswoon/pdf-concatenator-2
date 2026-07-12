import { PDFDocument } from 'pdf-lib'

const ENCRYPTED_PDF_MESSAGE = 'Encrypted PDF is not supported'

export async function loadPdf(bytes: Uint8Array): Promise<{ pageCount: number }> {
  const doc = await PDFDocument.load(bytes)

  if (doc.isEncrypted) {
    throw new Error(ENCRYPTED_PDF_MESSAGE)
  }

  return { pageCount: doc.getPageCount() }
}
