import { A4_HEIGHT_PX, A4_WIDTH_PX } from '@/lib/constants'
import {
  computeFitDimensions,
  decodeImage,
  drawImageToCanvas,
  encodeCanvas,
  type ImageMimeType,
} from './decodeImage'

export type FittedImageResult = {
  bytes: Uint8Array
  width: number
  height: number
  mimeType: ImageMimeType
}

const DEFAULT_JPEG_QUALITY = 0.92

export async function fitImageToA4(
  bytes: Uint8Array,
  mimeType: ImageMimeType,
): Promise<FittedImageResult> {
  const bitmap = await decodeImage(bytes, mimeType)
  const { width, height } = computeFitDimensions(
    bitmap.width,
    bitmap.height,
    A4_WIDTH_PX,
    A4_HEIGHT_PX,
  )

  const canvas = drawImageToCanvas(bitmap, width, height)
  bitmap.close()

  const quality = mimeType === 'image/jpeg' ? DEFAULT_JPEG_QUALITY : undefined
  const outputBytes = await encodeCanvas(canvas, mimeType, quality)

  return {
    bytes: outputBytes,
    width,
    height,
    mimeType,
  }
}
