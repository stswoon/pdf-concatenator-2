import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { usePagePreview } from '@/hooks/usePagePreview'
import type { SourcePdf, WorkspacePage } from '@/types/workspace'

type PagePreviewModalProps = {
  page: WorkspacePage
  sources: Record<string, SourcePdf>
  onClose: () => void
}

function getPageLabel(page: WorkspacePage): string {
  if (page.kind === 'pdf-native') {
    return page.label
  }
  return page.fileName
}

function PagePreviewModal({ page, sources, onClose }: PagePreviewModalProps) {
  const { url, loading } = usePagePreview(page, sources)
  const label = getPageLabel(page)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="flex max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border bg-background shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5">
          <p className="truncate text-sm font-medium">{label}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close preview"
            onClick={onClose}
          >
            ×
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-muted/30">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center p-8">
              <div className="size-8 animate-pulse rounded-full bg-muted" />
            </div>
          ) : url ? (
            <img
              src={url}
              alt={label}
              className="block max-w-none"
              draggable={false}
            />
          ) : (
            <div className="flex min-h-48 items-center justify-center p-8 text-sm text-muted-foreground">
              Failed to load preview
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PagePreviewModal
