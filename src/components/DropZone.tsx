import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePdfWorkspaceStore } from '@/store/usePdfWorkspaceStore'

const ACCEPT = '.pdf,.png,.jpg,.jpeg'

function DropZone() {
  const status = usePdfWorkspaceStore((state) => state.status)
  const error = usePdfWorkspaceStore((state) => state.error)
  const addFiles = usePdfWorkspaceStore((state) => state.addFiles)
  const dismissError = usePdfWorkspaceStore((state) => state.dismissError)

  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const isBusy = status === 'loading' || status === 'exporting'

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || isBusy) {
        return
      }
      void addFiles(fileList)
    },
    [addFiles, isBusy],
  )

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return
    }
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragOver(false)
      handleFiles(event.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleClick = useCallback(() => {
    if (!isBusy) {
      inputRef.current?.click()
    }
  }, [isBusy])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files)
      event.target.value = ''
    },
    [handleFiles],
  )

  return (
    <div className="space-y-3">
      {error && status === 'error' && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <p>{error}</p>
          <Button type="button" variant="ghost" size="sm" onClick={dismissError}>
            Dismiss
          </Button>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
          }
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-muted-foreground/40',
          isBusy && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={handleInputChange}
          disabled={isBusy}
        />

        {status === 'loading' ? (
          <p className="text-sm text-muted-foreground">Loading files…</p>
        ) : status === 'exporting' ? (
          <p className="text-sm text-muted-foreground">Processing export…</p>
        ) : (
          <>
            <p className="text-sm font-medium">Drop PDF, JPG or PNG here</p>
            <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
          </>
        )}
      </div>
    </div>
  )
}

export default DropZone
