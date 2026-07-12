import { create } from 'zustand'

import {
  SOFT_LIMIT_PAGE_COUNT,
  SOFT_LIMIT_TOTAL_BYTES,
} from '@/lib/constants'
import { downloadBlob, downloadUint8Array } from '@/lib/download'
import type {
  AppStatus,
  ImageExportFormat,
  SourcePdf,
  WorkspacePage,
} from '@/types/workspace'

type PdfWorkspaceState = {
  sources: Record<string, SourcePdf>
  pages: WorkspacePage[]
  status: AppStatus
  error: string | null
}

type PdfWorkspaceActions = {
  addFiles: (files: FileList | File[]) => Promise<void>
  removePage: (id: string) => void
  reorderPages: (fromIndex: number, toIndex: number) => void
  compressImagePages: (quality: number, maxSide?: number) => Promise<void>
  exportPdf: () => Promise<void>
  exportImages: (format: ImageExportFormat) => Promise<void>
  clear: () => void
  dismissError: () => void
}

export type PdfWorkspaceStore = PdfWorkspaceState & PdfWorkspaceActions

let pdfLibsInitialized = false

async function ensurePdfLibs(): Promise<void> {
  if (pdfLibsInitialized) {
    return
  }

  const { setupPdfJs } = await import('@/lib/pdf-render/setupPdfJs')
  setupPdfJs()
  await import('pdf-lib')
  await import('pdfjs-dist')

  pdfLibsInitialized = true
}

function createId(): string {
  return crypto.randomUUID()
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

type FileKind = 'pdf' | 'jpeg' | 'png'

function getFileKind(file: File): FileKind | null {
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return 'pdf'
  }

  if (name.endsWith('.png') || file.type === 'image/png') {
    return 'png'
  }

  if (
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    file.type === 'image/jpeg'
  ) {
    return 'jpeg'
  }

  return null
}

function computeTotalBytes(
  pages: WorkspacePage[],
  sources: Record<string, SourcePdf>,
): number {
  let total = 0

  for (const source of Object.values(sources)) {
    total += source.bytes.byteLength
  }

  for (const page of pages) {
    if (page.kind === 'image') {
      total += page.bytes.byteLength
    }
  }

  return total
}

function getSoftLimitWarning(
  pages: WorkspacePage[],
  sources: Record<string, SourcePdf>,
): string | null {
  const warnings: string[] = []

  if (pages.length > SOFT_LIMIT_PAGE_COUNT) {
    warnings.push(
      `Workspace has ${pages.length} pages (recommended limit: ${SOFT_LIMIT_PAGE_COUNT}). Performance may degrade.`,
    )
  }

  const totalBytes = computeTotalBytes(pages, sources)

  if (totalBytes > SOFT_LIMIT_TOTAL_BYTES) {
    const totalMb = Math.round(totalBytes / (1024 * 1024))
    warnings.push(
      `Total file size is about ${totalMb} MB (recommended limit: 200 MB). The browser may run out of memory.`,
    )
  }

  return warnings.length > 0 ? warnings.join('\n\n') : null
}

function pruneUnusedSources(
  pages: WorkspacePage[],
  sources: Record<string, SourcePdf>,
): Record<string, SourcePdf> {
  const usedSourceIds = new Set(
    pages
      .filter((page): page is Extract<WorkspacePage, { kind: 'pdf-native' }> => page.kind === 'pdf-native')
      .map((page) => page.sourcePdfId),
  )

  return Object.fromEntries(
    Object.entries(sources).filter(([id]) => usedSourceIds.has(id)),
  )
}

export const usePdfWorkspaceStore = create<PdfWorkspaceStore>((set, get) => ({
  sources: {},
  pages: [],
  status: 'empty',
  error: null,

  addFiles: async (files) => {
    const fileArray = Array.from(files)

    if (fileArray.length === 0) {
      return
    }

    set({ status: 'loading', error: null })

    try {
      await ensurePdfLibs()

      const { loadPdf } = await import('@/lib/pdf/importPdf')
      const { fitImageToA4 } = await import('@/lib/image/fitImageToA4')

      const { sources, pages } = get()
      const nextSources = { ...sources }
      const nextPages = [...pages]

      for (const file of fileArray) {
        const kind = getFileKind(file)

        if (!kind) {
          throw new Error(`Unsupported file format: ${file.name}`)
        }

        const bytes = new Uint8Array(await file.arrayBuffer())

        if (kind === 'pdf') {
          const { pageCount } = await loadPdf(bytes)
          const sourceId = createId()

          nextSources[sourceId] = {
            id: sourceId,
            fileName: file.name,
            bytes,
            pageCount,
          }

          for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
            nextPages.push({
              id: createId(),
              kind: 'pdf-native',
              sourcePdfId: sourceId,
              pageIndex,
              label: `${file.name} — p.${pageIndex + 1}`,
            })
          }

          continue
        }

        const mimeType = kind === 'png' ? 'image/png' : 'image/jpeg'
        const fitted = await fitImageToA4(bytes, mimeType)

        nextPages.push({
          id: createId(),
          kind: 'image',
          fileName: file.name,
          mimeType: fitted.mimeType,
          bytes: fitted.bytes,
          width: fitted.width,
          height: fitted.height,
        })
      }

      const nextStatus: AppStatus = nextPages.length > 0 ? 'ready' : 'empty'

      set({
        sources: nextSources,
        pages: nextPages,
        status: nextStatus,
        error: null,
      })

      const warning = getSoftLimitWarning(nextPages, nextSources)
      if (warning) {
        window.alert(warning)
      }
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },

  removePage: (id) => {
    set((state) => {
      const pages = state.pages.filter((page) => page.id !== id)
      const sources = pruneUnusedSources(pages, state.sources)

      return {
        pages,
        sources,
        status: pages.length > 0 ? 'ready' : 'empty',
      }
    })
  },

  reorderPages: (fromIndex, toIndex) => {
    set((state) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.pages.length ||
        toIndex >= state.pages.length ||
        fromIndex === toIndex
      ) {
        return state
      }

      const pages = [...state.pages]
      const [moved] = pages.splice(fromIndex, 1)
      pages.splice(toIndex, 0, moved)

      return { pages }
    })
  },

  compressImagePages: async (quality, maxSide) => {
    const { pages } = get()
    const imagePages = pages.filter((page) => page.kind === 'image')

    if (imagePages.length === 0) {
      return
    }

    set({ status: 'loading', error: null })

    try {
      const { compressImage } = await import('@/lib/image/compressImage')

      const updatedPages = await Promise.all(
        pages.map(async (page) => {
          if (page.kind !== 'image') {
            return page
          }

          const result = await compressImage(page.bytes, page.mimeType, {
            quality,
            maxSide,
          })

          return {
            ...page,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            quality,
          }
        }),
      )

      set({
        pages: updatedPages,
        status: 'ready',
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },

  exportPdf: async () => {
    const { pages, sources } = get()

    if (pages.length === 0) {
      return
    }

    set({ status: 'exporting', error: null })

    try {
      await ensurePdfLibs()

      const { exportPdf: exportPdfLib } = await import('@/lib/pdf/exportPdf')
      const { bytes, warnings } = await exportPdfLib(pages, sources)

      downloadUint8Array(bytes, 'merged.pdf', 'application/pdf')

      if (warnings.length > 0) {
        window.alert(warnings.join('\n'))
      }

      set({ status: 'ready', error: null })
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },

  exportImages: async (format) => {
    const { pages, sources } = get()

    if (pages.length === 0) {
      return
    }

    set({ status: 'exporting', error: null })

    try {
      await ensurePdfLibs()

      const { exportImages: exportImagesLib } = await import('@/lib/export/exportImages')
      const result = await exportImagesLib(pages, sources, format)

      if (result.mode === 'single') {
        downloadBlob(result.file.blob, result.file.fileName)
      } else {
        downloadUint8Array(result.bytes, result.fileName, 'application/zip')
      }

      set({ status: 'ready', error: null })
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },

  clear: () => {
    set({
      sources: {},
      pages: [],
      status: 'empty',
      error: null,
    })
  },

  dismissError: () => {
    set((state) => ({
      error: null,
      status: state.pages.length > 0 ? 'ready' : 'empty',
    }))
  },
}))
