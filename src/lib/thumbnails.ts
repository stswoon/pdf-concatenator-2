import { renderPageToCanvas } from '@/lib/pdf-render/renderPageToCanvas'
import type { SourcePdf, WorkspacePage } from '@/types/workspace'

const THUMBNAIL_MAX_LONG_SIDE = 175

async function canvasToBlobUrl(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error('Failed to create thumbnail blob'))
      },
      'image/png'
    )
  })

  return URL.createObjectURL(blob)
}

function imageBytesToBlobUrl(bytes: Uint8Array, mimeType: string): string {
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }))
}

export async function renderPageThumbnail(
  page: WorkspacePage,
  sources: Record<string, SourcePdf>
): Promise<string> {
  if (page.kind === 'image') {
    return imageBytesToBlobUrl(page.bytes, page.mimeType)
  }

  const source = sources[page.sourcePdfId]
  if (!source) {
    throw new Error(`Missing source PDF for page "${page.label}"`)
  }

  const canvas = await renderPageToCanvas(source.bytes, page.pageIndex, {
    maxLongSide: THUMBNAIL_MAX_LONG_SIDE,
  })

  return canvasToBlobUrl(canvas)
}
