import type { TodoRecord } from "@/pages/Todos/useTodos"
import { TodoItem } from "./TodoItem"

interface TodoSectionProps {
  title: string
  items: TodoRecord[]
  variant: "pending" | "done"
  togglingIds: string[]
  emptyHint: string
  onToggle: (todo: TodoRecord) => void
  onDelete: (todo: TodoRecord) => void
  onDueChange: (todo: TodoRecord, nextDue: string) => void
}

export function TodoSection(p: TodoSectionProps) {
  return (
    <section>
      <div className="flex min-h-8 items-center gap-2 px-1">
        <h3 className="font-display text-lg font-bold">{p.title}</h3>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-bold text-primary">
          {p.items.length}
        </span>
      </div>
      {p.items.length === 0 ? (
        <p className="mt-2 rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground dark:border-background/20 dark:text-background/50">
          {p.emptyHint}
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {p.items.map((todo, idx) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              variant={p.variant}
              busy={p.togglingIds.includes(todo.id)}
              delayMs={Math.min(idx * 50, 200)}
              onToggle={p.onToggle}
              onDelete={p.onDelete}
              onDueChange={p.onDueChange}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
