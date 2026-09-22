import { Sparkles } from "lucide-react"

interface AiCostConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** AI 整理前的费用确认弹窗：明确告知本次调用会产生费用，确认后才发起生成 */
export function AiCostConfirmDialog(p: AiCostConfirmDialogProps) {
  if (!p.open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6"
      onClick={p.onCancel}
    >
      <div
        className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-lg dark:border-background/20 dark:bg-foreground dark:text-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-background/15">
            <Sparkles className="h-4 w-4 text-primary dark:text-background" />
          </span>
          <h3 className="text-sm font-bold">AI 帮我整理</h3>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground dark:text-background/60">
          本次整理会产生一次 AI 调用费用，生成后可以选「替换原文」或「放弃」。要继续吗？
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={p.onCancel}
            className="rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted dark:border-background/20 dark:text-background dark:hover:bg-background/10"
          >
            先不要
          </button>
          <button
            type="button"
            onClick={p.onConfirm}
            className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"
          >
            开始整理
          </button>
        </div>
      </div>
    </div>
  )
}
