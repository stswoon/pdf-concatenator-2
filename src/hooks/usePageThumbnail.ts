import { useEffect, useState } from 'react'

import type { SourcePdf, WorkspacePage } from '@/types/workspace'

type ThumbnailState = {
  url: string | null
  loading: boolean
  isPdfNative: boolean
}

export function usePageThumbnail(
  page: WorkspacePage,
  sources: Record<string, SourcePdf>,
): ThumbnailState {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    setLoading(true)
    setUrl(null)

    void (async () => {
      try {
        const { setupPdfJs } = await import('@/lib/pdf-render/setupPdfJs')
        setupPdfJs()

        const { renderPageThumbnail } = await import('@/lib/thumbnails')
        const thumbnailUrl = await renderPageThumbnail(page, sources)
        objectUrl = thumbnailUrl

        if (!cancelled) {
          setUrl(thumbnailUrl)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setUrl(null)
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [page, sources])

  return {
    url,
    loading,
    isPdfNative: page.kind === 'pdf-native',
  }
}
