import {
  computeMaxSideDimensions,
  decodeImage,
  drawImageToCanvas,
  encodeCanvas,
  type ImageMimeType,
} from './decodeImage'

export type CompressImageOptions = {
  quality?: number
  maxSide?: number
}

export type CompressedImageResult = {
  bytes: Uint8Array
  width: number
  height: number
  mimeType: ImageMimeType
}

const DEFAULT_JPEG_QUALITY = 0.92

export async function compressImage(
  pageBytes: Uint8Array,
  mimeType: ImageMimeType,
  options: CompressImageOptions = {},
): Promise<CompressedImageResult> {
  const bitmap = await decodeImage(pageBytes, mimeType)

  let { width, height } = { width: bitmap.width, height: bitmap.height }

  if (options.maxSide !== undefined) {
    const resized = computeMaxSideDimensions(width, height, options.maxSide)
    width = resized.width
    height = resized.height
  }

  const canvas = drawImageToCanvas(bitmap, width, height)
  bitmap.close()

  const quality =
    mimeType === 'image/jpeg'
      ? (options.quality ?? DEFAULT_JPEG_QUALITY)
      : undefined

  const outputBytes = await encodeCanvas(canvas, mimeType, quality)

  return {
    bytes: outputBytes,
    width,
    height,
    mimeType,
  }
}
