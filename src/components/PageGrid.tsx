import { useCallback, useState } from 'react'

import PageCard from '@/components/PageCard'
import { usePdfWorkspaceStore } from '@/store/usePdfWorkspaceStore'

const SKELETON_COUNT = 4

function PageGrid() {
  const pages = usePdfWorkspaceStore((state) => state.pages)
  const sources = usePdfWorkspaceStore((state) => state.sources)
  const status = usePdfWorkspaceStore((state) => state.status)
  const removePage = usePdfWorkspaceStore((state) => state.removePage)
  const reorderPages = usePdfWorkspaceStore((state) => state.reorderPages)

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((event: React.DragEvent<HTMLElement>, index: number) => {
    setDragIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>, index: number) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropIndex(index)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>, toIndex: number) => {
      event.preventDefault()
      const fromIndex =
        dragIndex ?? Number.parseInt(event.dataTransfer.getData('text/plain'), 10)

      if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
        reorderPages(fromIndex, toIndex)
      }

      setDragIndex(null)
      setDropIndex(null)
    },
    [dragIndex, reorderPages],
  )

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDropIndex(null)
  }, [])

  if (status === 'loading') {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Pages</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      </section>
    )
  }

  if (pages.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Pages ({pages.length})</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {pages.map((page, index) => (
          <PageCard
            key={page.id}
            page={page}
            index={index}
            sources={sources}
            isDragging={dragIndex === index}
            isDropTarget={dropIndex === index && dragIndex !== index}
            onRemove={removePage}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </section>
  )
}

export default PageGrid
