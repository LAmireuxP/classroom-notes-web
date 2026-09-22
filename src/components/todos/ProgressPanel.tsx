import { CheckCircle2, Sparkles } from "lucide-react"

interface ProgressPanelProps {
  doneCount: number
  totalCount: number
  allDone: boolean
  progressPct: number
}

export function ProgressPanel(p: ProgressPanelProps) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pt-4">
      <div
        className={
          "rounded-3xl border bg-card p-5 shadow-md transition-colors duration-500 dark:bg-background/10 " +
          (p.allDone
            ? "border-primary/60 ring-2 ring-primary/25"
            : "border-border dark:border-background/15")
        }
      >
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground dark:text-background/60">
            完成进度
          </p>
          <span className="font-mono text-xs font-bold text-primary">{p.progressPct}%</span>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <strong className="font-display text-4xl font-bold leading-none text-primary">
            {p.doneCount}
          </strong>
          <span className="pb-1 text-sm font-bold text-muted-foreground dark:text-background/60">
            / 共 {p.totalCount} 项
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary dark:bg-background/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${p.progressPct}%` }}
          />
        </div>
        {p.allDone ? (
          <p className="mt-4 inline-flex animate-in fade-in zoom-in-75 duration-500 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
            <Sparkles className="h-4 w-4" /> 全部搞定！今天可以奖励自己一下。
          </p>
        ) : p.totalCount > 0 ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground dark:text-background/60">
            <CheckCircle2 className="h-3.5 w-3.5" /> 还剩 {p.totalCount - p.doneCount} 项待完成，加油！
          </p>
        ) : null}
      </div>
    </section>
  )
}
