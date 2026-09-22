import { ArrowLeft } from "lucide-react"

interface SettingsTopBarProps {
  onBack: () => void
}

export function SettingsTopBar(p: SettingsTopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-md dark:border-background/15 dark:bg-foreground/80">
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <button
          type="button"
          aria-label="返回首页"
          onClick={p.onBack}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:shadow-focus dark:border-background/20 dark:bg-background/10 dark:text-background"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground dark:text-background/60">
            settings
          </p>
          <h1 className="font-display text-lg font-bold leading-tight">设置</h1>
        </div>
      </div>
    </header>
  )
}
