export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function downloadUint8Array(
  bytes: Uint8Array,
  fileName: string,
  mime: string,
): void {
  const blob = new Blob([bytes], { type: mime })
  downloadBlob(blob, fileName)
}
