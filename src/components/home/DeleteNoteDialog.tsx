import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DeleteNoteDialogProps {
  open: boolean
  noteTitle: string
  deleting: boolean
  /** true = 回收站内彻底删除；false = 移入回收站（可恢复） */
  permanent?: boolean
  onCancel: () => void
  onConfirm: () => void
}

const btnBase =
  "flex-1 rounded-xl py-3 text-sm transition-all focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"

export function DeleteNoteDialog(p: DeleteNoteDialogProps) {
  return (
    <Dialog open={p.open} onOpenChange={(next) => !next && p.onCancel()}>
      <DialogContent className="max-w-sm rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-lg dark:border-background/20 dark:bg-foreground dark:text-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">
            {p.permanent ? "彻底删除" : "删除笔记"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground dark:text-background/60">
            {p.permanent ? "这个操作没法撤销，先确认一下" : "会先移入回收站，随时可以恢复"}
          </p>
        </DialogHeader>
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-destructive/40 bg-destructive/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm leading-relaxed">
            {p.permanent
              ? `确定要彻底删除「${p.noteTitle}」吗？删除后无法恢复。`
              : `把「${p.noteTitle}」移入回收站？之后可在回收站里恢复。`}
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
            {p.deleting ? "删除中…" : p.permanent ? "彻底删除" : "移入回收站"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
