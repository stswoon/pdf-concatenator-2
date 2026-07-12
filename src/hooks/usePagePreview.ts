import { useEffect, useState } from 'react'

import type { SourcePdf, WorkspacePage } from '@/types/workspace'

type PagePreviewState = {
  url: string | null
  loading: boolean
}

export function usePagePreview(
  page: WorkspacePage | null,
  sources: Record<string, SourcePdf>,
): PagePreviewState {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!page) {
      setUrl(null)
      setLoading(false)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false

    setLoading(true)
    setUrl(null)

    void (async () => {
      try {
        const { setupPdfJs } = await import('@/lib/pdf-render/setupPdfJs')
        setupPdfJs()

        const { renderPagePreview } = await import('@/lib/thumbnails')
        const previewUrl = await renderPagePreview(page, sources)
        objectUrl = previewUrl

        if (!cancelled) {
          setUrl(previewUrl)
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

  return { url, loading }
}
