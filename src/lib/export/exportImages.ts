import { renderPageToCanvas } from '@/lib/pdf-render/renderPageToCanvas'
import type { ImageExportFormat, SourcePdf, WorkspacePage } from '@/types/workspace'

import { createZip } from './createZip'

export type ExportedImageFile = {
  fileName: string
  blob: Blob
}

export type ExportImagesResult =
  | { mode: 'single'; file: ExportedImageFile }
  | { mode: 'zip'; bytes: Uint8Array; fileName: string }

const JPEG_EXPORT_QUALITY = 0.92

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageExportFormat
): Promise<Blob> {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error(`Failed to encode canvas as ${format.toUpperCase()}`))
      },
      mimeType,
      format === 'jpeg' ? JPEG_EXPORT_QUALITY : undefined
    )
  })
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const buffer = await blob.arrayBuffer()
  return new Uint8Array(buffer)
}

function stripExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName
}

function pdfPageFileName(sourceFileName: string, pageIndex: number, format: ImageExportFormat): string {
  const baseName = stripExtension(sourceFileName)
  return `${baseName}-p${pageIndex + 1}.${format}`
}

async function exportPdfNativePage(
  source: SourcePdf,
  pageIndex: number,
  format: ImageExportFormat
): Promise<ExportedImageFile> {
  const canvas = await renderPageToCanvas(source.bytes, pageIndex)
  const blob = await canvasToBlob(canvas, format)

  return {
    fileName: pdfPageFileName(source.fileName, pageIndex, format),
    blob,
  }
}

function exportImagePage(page: Extract<WorkspacePage, { kind: 'image' }>): ExportedImageFile {
  return {
    fileName: page.fileName,
    blob: new Blob([page.bytes], { type: page.mimeType }),
  }
}

export async function exportImages(
  pages: WorkspacePage[],
  sources: Record<string, SourcePdf>,
  format: ImageExportFormat
): Promise<ExportImagesResult> {
  const files: ExportedImageFile[] = []

  for (const page of pages) {
    if (page.kind === 'pdf-native') {
      const source = sources[page.sourcePdfId]
      if (!source) {
        throw new Error(`Missing source PDF for page "${page.label}"`)
      }

      files.push(await exportPdfNativePage(source, page.pageIndex, format))
      continue
    }

    files.push(exportImagePage(page))
  }

  if (files.length === 1) {
    return { mode: 'single', file: files[0] }
  }

  const zipEntries = await Promise.all(
    files.map(async (file) => ({
      name: file.fileName,
      data: await blobToUint8Array(file.blob),
    }))
  )

  return {
    mode: 'zip',
    bytes: createZip(zipEntries),
    fileName: `pages.${format}.zip`,
  }
}
