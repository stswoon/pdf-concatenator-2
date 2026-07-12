import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

function App() {
  const count = useAppStore((state) => state.count)
  const increment = useAppStore((state) => state.increment)
  const reset = useAppStore((state) => state.reset)

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Hello World</h1>
        <p className="text-muted-foreground">React + TypeScript + Vite + Zustand + shadcn</p>
      </div>
      <p className="text-lg tabular-nums">Count: {count}</p>
      <div className="flex gap-2">
        <Button onClick={increment}>Increment</Button>
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
    </main>
  )
}

export default App
