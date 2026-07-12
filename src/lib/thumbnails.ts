import { renderPageToCanvas } from '@/lib/pdf-render/renderPageToCanvas'
import type { SourcePdf, WorkspacePage } from '@/types/workspace'

const THUMBNAIL_MAX_LONG_SIDE = 175
const PREVIEW_TARGET_DPI = 150

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

export async function renderPageThumbnail(
  page: WorkspacePage,
  sources: Record<string, SourcePdf>
): Promise<string> {
  if (page.kind === 'image') {
    const { renderImagePageOnA4 } = await import('@/lib/image/renderImagePageOnA4')
    const canvas = await renderImagePageOnA4(page, { maxLongSide: THUMBNAIL_MAX_LONG_SIDE })
    return canvasToBlobUrl(canvas)
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

export async function renderPagePreview(
  page: WorkspacePage,
  sources: Record<string, SourcePdf>,
): Promise<string> {
  if (page.kind === 'image') {
    const { renderImagePageOnA4 } = await import('@/lib/image/renderImagePageOnA4')
    const canvas = await renderImagePageOnA4(page, { targetDpi: PREVIEW_TARGET_DPI })
    return canvasToBlobUrl(canvas)
  }

  const source = sources[page.sourcePdfId]
  if (!source) {
    throw new Error(`Missing source PDF for page "${page.label}"`)
  }

  const canvas = await renderPageToCanvas(source.bytes, page.pageIndex, {
    targetDpi: PREVIEW_TARGET_DPI,
  })

  return canvasToBlobUrl(canvas)
}
