import { CheckSquare, ChevronRight } from "lucide-react"
import type { TodoRecord } from "@/pages/Home/useHome"
import { HighlightText } from "./HighlightText"

// 搜索时命中的待办：首页显示前 3 条预览，点整卡跳待办页。

interface TodoMatchListProps {
  todos: TodoRecord[]
  query: string
  onOpenTodos: () => void
}

export function TodoMatchList({ todos, query, onOpenTodos }: TodoMatchListProps) {
  if (todos.length === 0) return null
  const shown = todos.slice(0, 3)
  return (
    <section className="px-4 pt-3">
      <button
        type="button"
        onClick={onOpenTodos}
        aria-label="查看匹配的待办"
        className="w-full rounded-2xl border border-border bg-card p-3.5 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:shadow-focus dark:border-background/15 dark:bg-background/10"
      >
        <span className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-display text-sm font-bold">待办里也有 · {todos.length} 条</span>
          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground dark:text-background/60" />
        </span>
        <span className="mt-2 flex flex-col gap-1.5">
          {shown.map((t) => (
            <span
              key={t.id}
              className="flex items-center gap-2 text-xs text-muted-foreground dark:text-background/70"
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${t.done ? "bg-muted-foreground/40 dark:bg-background/30" : "bg-primary"}`}
              />
              <span className={`min-w-0 truncate ${t.done ? "line-through opacity-60" : ""}`}>
                <HighlightText text={t.content} query={query} />
              </span>
            </span>
          ))}
        </span>
      </button>
    </section>
  )
}
