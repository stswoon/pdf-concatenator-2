import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePdfWorkspaceStore } from '@/store/usePdfWorkspaceStore'

function CompressPanel() {
  const pages = usePdfWorkspaceStore((state) => state.pages)
  const status = usePdfWorkspaceStore((state) => state.status)
  const compressImagePages = usePdfWorkspaceStore((state) => state.compressImagePages)

  const [quality, setQuality] = useState(70)

  const hasImagePages = pages.some((page) => page.kind === 'image')
  const isBusy = status === 'loading' || status === 'exporting'
  const isDisabled = !hasImagePages || isBusy || pages.length === 0

  const handleApply = useCallback(() => {
    if (isDisabled) {
      return
    }
    void compressImagePages(quality / 100)
  }, [compressImagePages, isDisabled, quality])

  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between',
        isDisabled && 'opacity-60',
      )}
    >
      <div className="space-y-1">
        <h2 className="text-sm font-medium">Compress (image pages)</h2>
        {!hasImagePages && (
          <p className="text-xs text-muted-foreground">Add JPG or PNG pages to enable compression.</p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-3 text-sm">
          <span className="shrink-0 text-muted-foreground">Quality</span>
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={quality}
            disabled={isDisabled}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="h-2 w-full min-w-40 cursor-pointer accent-primary disabled:cursor-not-allowed"
          />
          <span className="w-10 shrink-0 tabular-nums">{quality}%</span>
        </label>

        <Button type="button" variant="secondary" disabled={isDisabled} onClick={handleApply}>
          Apply
        </Button>
      </div>
    </section>
  )
}

export default CompressPanel
