import { ArrowLeft } from "lucide-react"

interface TodosTopBarProps {
  onBack: () => void
}

export function TodosTopBar(p: TodosTopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-md dark:border-background/15 dark:bg-foreground/80">
      <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
        <button
          type="button"
          aria-label="返回首页"
          onClick={p.onBack}
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:shadow-focus dark:border-background/20 dark:bg-background/10 dark:text-background"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-lg font-bold">待办清单</h1>
        <span aria-hidden className="h-10 w-10 shrink-0" />
      </div>
    </header>
  )
}
