import { Button } from '@/components/ui/button'
import { usePageThumbnail } from '@/hooks/usePageThumbnail'
import { cn } from '@/lib/utils'
import type { SourcePdf, WorkspacePage } from '@/types/workspace'

type PageCardProps = {
  page: WorkspacePage
  index: number
  sources: Record<string, SourcePdf>
  isDragging?: boolean
  isDropTarget?: boolean
  onRemove: (id: string) => void
  onDragStart: (event: React.DragEvent<HTMLElement>, index: number) => void
  onDragOver: (event: React.DragEvent<HTMLElement>, index: number) => void
  onDrop: (event: React.DragEvent<HTMLElement>, index: number) => void
  onDragEnd: () => void
}

function getPageLabel(page: WorkspacePage): string {
  if (page.kind === 'pdf-native') {
    return page.label
  }
  return page.fileName
}

function getBadgeLabel(page: WorkspacePage): string {
  if (page.kind === 'pdf-native') {
    return 'PDF'
  }
  return page.mimeType === 'image/png' ? 'PNG' : 'JPG'
}

function PageCard({
  page,
  index,
  sources,
  isDragging = false,
  isDropTarget = false,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: PageCardProps) {
  const { url, loading, isPdfNative } = usePageThumbnail(page, sources)

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, index)}
      onDragOver={(event) => onDragOver(event, index)}
      onDrop={(event) => onDrop(event, index)}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-opacity',
        isDragging && 'opacity-50',
        isDropTarget && 'ring-2 ring-primary ring-offset-2',
      )}
    >
      <div className="relative aspect-[3/4] w-full bg-muted">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        ) : url ? (
          <img
            src={url}
            alt={getPageLabel(page)}
            className="h-full w-full object-contain object-top"
            draggable={false}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-muted-foreground">
            <span className="text-2xl font-semibold">{isPdfNative ? 'PDF' : '?'}</span>
            <span className="text-xs">{getPageLabel(page)}</span>
          </div>
        )}

        <span className="absolute top-2 left-2 rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium">
          {getBadgeLabel(page)}
        </span>

        <Button
          type="button"
          variant="destructive"
          size="icon-xs"
          className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Remove ${getPageLabel(page)}`}
          onClick={() => onRemove(page.id)}
        >
          ×
        </Button>
      </div>

      <p className="truncate px-2 py-1.5 text-xs text-muted-foreground" title={getPageLabel(page)}>
        {getPageLabel(page)}
      </p>
    </article>
  )
}

export default PageCard
