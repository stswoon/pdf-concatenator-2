import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePdfWorkspaceStore } from '@/store/usePdfWorkspaceStore'

function ExportActions() {
  const pages = usePdfWorkspaceStore((state) => state.pages)
  const status = usePdfWorkspaceStore((state) => state.status)
  const exportPdf = usePdfWorkspaceStore((state) => state.exportPdf)
  const exportImages = usePdfWorkspaceStore((state) => state.exportImages)

  const isEmpty = pages.length === 0 || status === 'empty'
  const isExporting = status === 'exporting'
  const isLoading = status === 'loading'
  const isDisabled = isEmpty || isExporting || isLoading

  const handleExportPdf = useCallback(() => {
    if (!isDisabled) {
      void exportPdf()
    }
  }, [exportPdf, isDisabled])

  const handleExportPng = useCallback(() => {
    if (!isDisabled) {
      void exportImages('png')
    }
  }, [exportImages, isDisabled])

  const handleExportJpg = useCallback(() => {
    if (!isDisabled) {
      void exportImages('jpeg')
    }
  }, [exportImages, isDisabled])

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={isDisabled} onClick={handleExportPdf}>
          Export PDF
        </Button>
        <Button type="button" variant="outline" disabled={isDisabled} onClick={handleExportPng}>
          Export PNG
        </Button>
        <Button type="button" variant="outline" disabled={isDisabled} onClick={handleExportJpg}>
          Export JPG
        </Button>
      </div>

      <p
        className={cn(
          'text-sm text-muted-foreground',
          !isExporting && 'invisible',
        )}
        aria-live="polite"
      >
        Processing…
      </p>
    </section>
  )
}

export default ExportActions
