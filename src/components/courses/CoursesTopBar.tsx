import { ArrowLeft, Plus } from "lucide-react"

interface CoursesTopBarProps {
  onBack: () => void
  onCreate: () => void
}

export function CoursesTopBar(p: CoursesTopBarProps) {
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
        <h1 className="font-display text-lg font-bold">课程管理</h1>
        <button
          type="button"
          onClick={p.onCreate}
          className="inline-flex h-10 items-center gap-1 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"
        >
          <Plus className="h-4 w-4" /> 新建
        </button>
      </div>
    </header>
  )
}
