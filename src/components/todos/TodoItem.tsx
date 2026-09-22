import { useState } from "react"
import { CalendarPlus, Check, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  dueTone,
  formatDueLabel,
  todayDateStr,
  type TodoRecord,
} from "@/pages/Todos/useTodos"

interface TodoItemProps {
  todo: TodoRecord
  variant: "pending" | "done"
  busy: boolean
  delayMs?: number
  onToggle: (todo: TodoRecord) => void
  onDelete: (todo: TodoRecord) => void
  onDueChange: (todo: TodoRecord, nextDue: string) => void
}

const CHIP_TODAY = "border-primary/40 bg-primary/10 text-primary"
const CHIP_OVERDUE = "border-destructive/30 bg-destructive/10 text-destructive"
const CHIP_FUTURE = "border-border bg-muted text-muted-foreground dark:border-background/20 dark:bg-background/10 dark:text-background/60"
const CHIP_DONE = "border-border/50 bg-transparent text-muted-foreground/70 dark:border-background/10 dark:text-background/40"

function dueChipLabel(todo: TodoRecord): string {
  const tone = dueTone(todo.due)
  if (tone === "today") return "今天"
  if (tone === "overdue") return "已逾期"
  return formatDueLabel(todo.due ?? "")
}

export function TodoItem(p: TodoItemProps) {
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [dateValue, setDateValue] = useState("")

  const isDone = p.variant === "done"
  const tone = dueTone(p.todo.due)
  const overdue = !isDone && tone === "overdue"

  const openDateDialog = () => {
    setDateValue((p.todo.due ?? "").trim() || todayDateStr())
    setDateDialogOpen(true)
  }

  const commitDue = (nextDue: string) => {
    p.onDueChange(p.todo, nextDue)
    setDateDialogOpen(false)
  }

  return (
    <li
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${p.delayMs ?? 0}ms` }}
    >
      <div
        className={
          "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all duration-300 " +
          (isDone
            ? "border-border/60 bg-muted/50 dark:border-background/10 dark:bg-background/5"
            : overdue
              ? "border-destructive/40 bg-card hover:shadow-md dark:border-destructive/40 dark:bg-background/10"
              : "border-border bg-card hover:shadow-md dark:border-background/15 dark:bg-background/10")
        }
      >
        <button
          type="button"
          aria-label={isDone ? "恢复为未完成" : "标记为已完成"}
          disabled={p.busy}
          onClick={() => p.onToggle(p.todo)}
          className={
            "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60 " +
            (isDone
              ? "border-primary bg-primary text-primary-foreground"
              : "border-foreground/30 text-transparent hover:border-primary dark:border-background/30")
          }
        >
          {/* 勾选时打勾从小到大弹出，取消时缩回去 */}
          <Check
            className={`h-4 w-4 transition-transform duration-300 ${isDone ? "scale-100" : "scale-50"}`}
            strokeWidth={3}
          />
        </button>
        <span
          className={
            "min-w-0 flex-1 break-words text-sm font-sans transition-all duration-300 " +
            (isDone
              ? "text-muted-foreground line-through decoration-2 dark:text-background/50"
              : "text-foreground dark:text-background")
          }
        >
          {p.todo.content}
        </span>

        {isDone ? (
          (p.todo.due ?? "").trim() ? (
            <span
              className={
                "inline-flex h-6 shrink-0 items-center rounded-full border px-2 text-[11px] font-bold " +
                CHIP_DONE
              }
            >
              {formatDueLabel(p.todo.due ?? "")}
            </span>
          ) : null
        ) : tone === "none" ? (
          <button
            type="button"
            aria-label="添加截止日期"
            disabled={p.busy}
            onClick={openDateDialog}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground/70 transition-all hover:bg-primary/10 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60 dark:text-background/40"
          >
            <CalendarPlus className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="修改截止日期"
            disabled={p.busy}
            onClick={openDateDialog}
            className={
              "inline-flex h-6 shrink-0 items-center rounded-full border px-2 text-[11px] font-bold transition-all hover:brightness-105 active:scale-95 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60 " +
              (tone === "today" ? CHIP_TODAY : tone === "overdue" ? CHIP_OVERDUE : CHIP_FUTURE)
            }
          >
            {dueChipLabel(p.todo)}
          </button>
        )}

        <button
          type="button"
          aria-label="删除待办"
          disabled={p.busy}
          onClick={() => p.onDelete(p.todo)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60 dark:text-background/50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">截止日期</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground dark:text-background/60">{p.todo.content}</p>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            aria-label="选择新日期"
            className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-all focus-visible:border-primary focus-visible:shadow-focus dark:border-background/20 dark:bg-background/10 dark:text-background"
          />
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => commitDue("")}
              className="h-10 rounded-full border border-border px-4 text-sm font-bold text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive active:scale-95 focus-visible:outline-none focus-visible:shadow-focus dark:border-background/20 dark:text-background/60"
            >
              清除日期
            </button>
            <button
              type="button"
              disabled={!dateValue}
              onClick={() => commitDue(dateValue)}
              className="h-10 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-95 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60"
            >
              保存
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </li>
  )
}
