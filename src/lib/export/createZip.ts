import { zipSync } from 'fflate'

export type ZipEntry = {
  name: string
  data: Uint8Array
}

export function createZip(entries: ZipEntry[]): Uint8Array {
  const files: Record<string, Uint8Array> = {}

  for (const entry of entries) {
    files[entry.name] = entry.data
  }

  return zipSync(files)
}
