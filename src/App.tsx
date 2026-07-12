import { useCallback, useRef } from 'react'

import CompressPanel from '@/components/CompressPanel'
import DropZone from '@/components/DropZone'
import ExportActions from '@/components/ExportActions'
import PageGrid from '@/components/PageGrid'
import { Button } from '@/components/ui/button'
import { usePdfWorkspaceStore } from '@/store/usePdfWorkspaceStore'

const ACCEPT = '.pdf,.png,.jpg,.jpeg'

function App() {
  const pages = usePdfWorkspaceStore((state) => state.pages)
  const status = usePdfWorkspaceStore((state) => state.status)
  const addFiles = usePdfWorkspaceStore((state) => state.addFiles)
  const clear = usePdfWorkspaceStore((state) => state.clear)

  const inputRef = useRef<HTMLInputElement>(null)
  const isBusy = status === 'loading' || status === 'exporting'
  const hasPages = pages.length > 0

  const handleAddFilesClick = useCallback(() => {
    if (!isBusy) {
      inputRef.current?.click()
    }
  }, [isBusy])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        void addFiles(event.target.files)
      }
      event.target.value = ''
    },
    [addFiles],
  )

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <h1 className="text-xl font-semibold tracking-tight">PDF Concatenator</h1>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={handleInputChange}
              disabled={isBusy}
            />
            <Button type="button" disabled={isBusy} onClick={handleAddFilesClick}>
              Add files
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!hasPages || isBusy}
              onClick={clear}
            >
              Clear all
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <DropZone />
        <PageGrid />
        {hasPages && (
          <>
            <ExportActions />
            <CompressPanel />
          </>
        )}
      </main>
    </div>
  )
}

export default App
