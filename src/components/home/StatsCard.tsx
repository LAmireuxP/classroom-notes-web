import { ArrowRight, BookOpen, CheckSquare, StickyNote, Plus } from "lucide-react"
import { useCountUp } from "@/lib/useCountUp"

interface StatsCardProps {
  courseCount: number
  noteCount: number
  todoCount: number
  todoInputOpen: boolean
  todoDraft: string
  onTodoDraftChange: (value: string) => void
  onAddTodo: () => void
  onToggleInput: () => void
  todoAdding: boolean
  onCourseClick?: () => void
  onTodoClick?: () => void
}

const TILES = [
  { key: "course", label: "课程", icon: BookOpen },
  { key: "note", label: "笔记", icon: StickyNote },
  { key: "todo", label: "待办", icon: CheckSquare },
] as const

const tileBase =
  "flex min-h-20 h-full animate-in fade-in slide-in-from-bottom-2 duration-500 flex-col items-start rounded-xl border border-border bg-secondary/40 px-2.5 py-2.5 text-left transition-all dark:border-background/15 dark:bg-background/5"

export function StatsCard(p: StatsCardProps) {
  // 数字滚动：加载完成/新增删除时平滑过渡，首屏从 0 起跳
  const courseShown = useCountUp(p.courseCount)
  const noteShown = useCountUp(p.noteCount)
  const todoShown = useCountUp(p.todoCount)
  const counts = { course: courseShown, note: noteShown, todo: todoShown }
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pt-4">
      <div className="rounded-2xl border border-border bg-card p-3 shadow-md dark:border-background/15 dark:bg-background/10">
        <div className="grid grid-cols-3 gap-2">
          {TILES.map((tile, idx) => {
            const tileDelay = { animationDelay: `${60 + idx * 70}ms` }
            const Icon = tile.icon
            const isTodo = tile.key === "todo"
            const clickable =
              (tile.key === "course" && p.onCourseClick !== undefined) ||
              (isTodo && p.onTodoClick !== undefined)
            const tileBody = (
              <>
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground dark:text-background/60" />
                <strong className="mt-1.5 font-display text-xl font-bold leading-none text-primary">
                  {counts[tile.key]}
                </strong>
                <span className="mt-auto inline-flex items-center gap-0.5 pt-1 text-xs text-muted-foreground dark:text-background/60">
                  {tile.label}
                  {clickable ? <ArrowRight className="h-3 w-3" /> : null}
                </span>
                {isTodo ? (
                  p.todoInputOpen ? (
                    <input
                      autoFocus
                      value={p.todoDraft}
                      disabled={p.todoAdding}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => p.onTodoDraftChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") p.onAddTodo()
                      }}
                      placeholder="一句话待办, 回车添加"
                      className="mt-1.5 w-full rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:shadow-focus dark:border-background/20 dark:bg-background/10 dark:text-background"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        p.onToggleInput()
                      }}
                      className="mt-1.5 inline-flex items-center gap-0.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground transition-all hover:bg-secondary-foreground/15 active:scale-95 dark:bg-background/10 dark:text-background"
                    >
                      <Plus className="h-3 w-3" /> 添加
                    </button>
                  )
                ) : null}
              </>
            )
            return clickable ? (
              <button
                key={tile.key}
                type="button"
                onClick={isTodo ? p.onTodoClick : p.onCourseClick}
                aria-label={isTodo ? "进入待办清单" : "进入课程管理"}
                className={`${tileBase} hover:border-primary/60 hover:shadow-sm active:scale-95 focus-visible:outline-none focus-visible:shadow-focus`}
                style={tileDelay}
              >
                {tileBody}
              </button>
            ) : (
              <div key={tile.key} className={tileBase} style={tileDelay}>
                {tileBody}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
