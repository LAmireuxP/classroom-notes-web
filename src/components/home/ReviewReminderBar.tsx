import { ChevronRight, History } from "lucide-react"
import type { NoteRecord } from "@/pages/Home/useHome"

// 复习提醒条：有超过一周没碰过的笔记时出现，点击直接打开最久没看的那条详情。
// 打开即视为复习过（详情侧会写 last_reviewed），提醒数量随之减少。

interface ReviewReminderBarProps {
  /** 待复习笔记（已按最久未看排序） */
  notes: NoteRecord[]
  onPress: (note: NoteRecord) => void
}

export function ReviewReminderBar({ notes, onPress }: ReviewReminderBarProps) {
  if (notes.length === 0) return null
  const first = notes[0]
  return (
    <button
      type="button"
      onClick={() => onPress(first)}
      aria-label="复习最久没看的笔记"
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:shadow-focus dark:border-background/15 dark:bg-background/10"
    >
      <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <History className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-bold">
          {notes.length} 条笔记超过一周没复习
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground dark:text-background/60">
          最久没看：{first.title}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-foreground/80 dark:bg-background/15 dark:text-background/80">
        去复习
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground dark:text-background/60" />
    </button>
  )
}
