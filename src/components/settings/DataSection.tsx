import { Check, Download, Loader2, Trash2, TriangleAlert } from "lucide-react"

// 数据分区：导出备份（三表打包 Markdown 下载）+ 清空全部数据（内嵌二次确认卡）。
// 实现自原 SettingsDialog 迁移，状态与回调全部来自 useSettings。

interface DataSectionProps {
  busy: "export" | "clear" | null
  statusText: string
  errorText: string
  confirmClear: boolean
  onExport: () => void
  openClearConfirm: () => void
  cancelClearConfirm: () => void
  onClear: () => void
}

export function DataSection(p: DataSectionProps) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <p className="mb-2 text-xs font-bold text-muted-foreground dark:text-background/60">数据</p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={p.onExport}
          disabled={p.busy !== null}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-all hover:border-primary/60 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50 dark:border-background/15 dark:bg-background/5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            {p.busy === "export" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold">导出备份</span>
            <span className="block text-xs text-muted-foreground dark:text-background/60">
              课程、笔记、待办打包成一个 Markdown 文件
            </span>
          </span>
        </button>

        {p.confirmClear ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-destructive">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              清空后无法恢复，确定吗？
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={p.busy !== null}
                onClick={p.cancelClearConfirm}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-muted-foreground transition-all hover:border-primary active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50 dark:border-background/20 dark:text-background/60"
              >
                再想想
              </button>
              <button
                type="button"
                disabled={p.busy !== null}
                onClick={p.onClear}
                className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-bold text-destructive-foreground transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50"
              >
                {p.busy === "clear" ? "清空中…" : "确认清空"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={p.openClearConfirm}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-destructive/40 py-3 text-sm font-bold text-destructive transition-all hover:bg-destructive/10 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
          >
            <Trash2 className="h-4 w-4" /> 清空全部数据
          </button>
        )}
      </div>

      {p.statusText ? (
        <p className="mt-3 flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2 text-xs font-bold text-primary">
          <Check className="h-3.5 w-3.5 shrink-0" /> {p.statusText}
        </p>
      ) : null}
      {p.errorText ? (
        <p className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {p.errorText}
        </p>
      ) : null}
    </section>
  )
}
