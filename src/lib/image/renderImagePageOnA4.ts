import { A4_HEIGHT_PX, A4_WIDTH_PX } from '@/lib/constants'
import type { WorkspacePage } from '@/types/workspace'

import { decodeImage } from './decodeImage'

const BASE_DPI = 300

type RenderImagePageOnA4Options = {
  targetDpi?: number
  maxLongSide?: number
}

function resolveTargetDpi(options: RenderImagePageOnA4Options): number {
  if (options.targetDpi != null) {
    return options.targetDpi
  }

  if (options.maxLongSide != null) {
    const a4LongSidePxAtBase = Math.max(A4_WIDTH_PX, A4_HEIGHT_PX)
    return BASE_DPI * (options.maxLongSide / a4LongSidePxAtBase)
  }

  return BASE_DPI
}

export async function renderImagePageOnA4(
  page: Extract<WorkspacePage, { kind: 'image' }>,
  options: RenderImagePageOnA4Options = {},
): Promise<HTMLCanvasElement> {
  const targetDpi = resolveTargetDpi(options)
  const scale = targetDpi / BASE_DPI
  const pageWidth = Math.floor(A4_WIDTH_PX * scale)
  const pageHeight = Math.floor(A4_HEIGHT_PX * scale)
  const imageWidth = Math.floor(page.width * scale)
  const imageHeight = Math.floor(page.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = pageWidth
  canvas.height = pageHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas 2d context')
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, pageWidth, pageHeight)

  const bitmap = await decodeImage(page.bytes, page.mimeType)
  ctx.drawImage(bitmap, 0, 0, imageWidth, imageHeight)
  bitmap.close()

  return canvas
}
