import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DeleteCourseDialogProps {
  open: boolean
  courseName: string
  noteCount: number
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

const btnBase =
  "flex-1 rounded-xl py-3 text-sm transition-all focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"

export function DeleteCourseDialog(p: DeleteCourseDialogProps) {
  return (
    <Dialog open={p.open} onOpenChange={(next) => !next && p.onCancel()}>
      <DialogContent className="max-w-sm rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-lg dark:border-background/20 dark:bg-foreground dark:text-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">删除课程</DialogTitle>
          <p className="text-sm text-muted-foreground dark:text-background/60">
            课程会消失，但笔记都会留下来
          </p>
        </DialogHeader>
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-destructive/40 bg-destructive/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm leading-relaxed">
            确定删除课程「{p.courseName}」吗？删除后该课程下的 {p.noteCount}{" "}
            条笔记会保留，归属变为未分课程。
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={p.onCancel}
            disabled={p.deleting}
            className={`${btnBase} border border-border font-semibold transition-colors hover:border-primary dark:border-background/20 dark:text-background`}
          >
            取消
          </button>
          <button
            type="button"
            onClick={p.onConfirm}
            disabled={p.deleting}
            className={`${btnBase} bg-destructive font-bold text-destructive-foreground shadow-sm transition-shadow hover:shadow-md`}
          >
            {p.deleting ? "删除中…" : "确认删除"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
