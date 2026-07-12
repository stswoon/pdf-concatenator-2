export type ImageMimeType = 'image/jpeg' | 'image/png'

export async function decodeImage(
  source: File | Uint8Array,
  mimeType?: ImageMimeType,
): Promise<ImageBitmap> {
  const blob =
    source instanceof File
      ? source
      : new Blob([source], { type: mimeType ?? 'application/octet-stream' })

  return createImageBitmap(blob)
}

export function computeFitDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }

  const scale = Math.min(maxWidth / width, maxHeight / height)

  return {
    width: Math.floor(width * scale),
    height: Math.floor(height * scale),
  }
}

export function computeMaxSideDimensions(
  width: number,
  height: number,
  maxSide: number,
): { width: number; height: number } {
  const longSide = Math.max(width, height)

  if (longSide <= maxSide) {
    return { width, height }
  }

  const scale = maxSide / longSide

  return {
    width: Math.floor(width * scale),
    height: Math.floor(height * scale),
  }
}

export function drawImageToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas 2d context')
  }

  ctx.drawImage(source, 0, 0, width, height)

  return canvas
}

export async function encodeCanvas(
  canvas: HTMLCanvasElement,
  mimeType: ImageMimeType,
  quality?: number,
): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Failed to encode image'))
        }
      },
      mimeType,
      mimeType === 'image/jpeg' ? quality : undefined,
    )
  })

  const buffer = await blob.arrayBuffer()
  return new Uint8Array(buffer)
}
