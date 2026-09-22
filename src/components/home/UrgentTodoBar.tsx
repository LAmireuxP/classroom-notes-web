import { ChevronRight, Flame } from "lucide-react"
import { dueTone, formatDueLabel } from "@/pages/Todos/useTodos"
import type { TodoRecord } from "@/pages/Home/useHome"

interface UrgentTodoBarProps {
  todo: TodoRecord | null
  onPress: () => void
}

const toneChip = {
  today: "bg-primary text-primary-foreground",
  overdue: "bg-destructive text-destructive-foreground",
  future: "bg-muted text-foreground/80 dark:bg-background/15 dark:text-background/80",
  none: "bg-muted text-foreground/80 dark:bg-background/15 dark:text-background/80",
} as const

export function UrgentTodoBar({ todo, onPress }: UrgentTodoBarProps) {
  if (!todo) return null
  const tone = dueTone(todo.due)
  const overdue = tone === "overdue"
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label="查看待办清单"
      className={`animate-in fade-in slide-in-from-bottom-4 duration-500 mx-4 mt-4 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border bg-card p-3.5 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:shadow-focus dark:bg-background/10 ${
        overdue ? "border-destructive/40" : "border-border dark:border-background/15"
      }`}
    >
      <span
        aria-hidden
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          overdue ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        }`}
      >
        <Flame className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-bold">{todo.content}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground dark:text-background/60">
          {overdue ? "已经逾期，先把它办了吧" : "最紧急的一条待办"}
        </span>
      </span>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${toneChip[tone]}`}>
        {formatDueLabel(todo.due!)}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground dark:text-background/60" />
    </button>
  )
}
