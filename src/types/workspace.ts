export type SourcePdf = {
  id: string
  fileName: string
  bytes: Uint8Array
  pageCount: number
}

export type WorkspacePage =
  | {
      id: string
      kind: 'pdf-native'
      sourcePdfId: string
      pageIndex: number
      label: string
    }
  | {
      id: string
      kind: 'image'
      fileName: string
      mimeType: 'image/jpeg' | 'image/png'
      bytes: Uint8Array
      width: number
      height: number
      quality?: number
    }

export type AppStatus = 'empty' | 'loading' | 'ready' | 'exporting' | 'error'

export type ImageExportFormat = 'png' | 'jpeg'
