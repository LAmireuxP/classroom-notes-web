import { ClipboardList, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { TodosTopBar } from "@/components/todos/TodosTopBar"
import { ProgressPanel } from "@/components/todos/ProgressPanel"
import { TodoComposer } from "@/components/todos/TodoComposer"
import { TodoSection } from "@/components/todos/TodoSection"
import { TodosEmpty } from "@/components/todos/TodosEmpty"
import { BottomNav } from "@/components/layout/BottomNav"
import type { useTodos } from "./useTodos"

export function TodosPage(p: ReturnType<typeof useTodos>) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-background text-foreground dark:from-foreground dark:via-foreground dark:to-foreground dark:text-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden">

        <TodosTopBar onBack={() => navigate("/")} />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-[1fr_auto] items-center gap-3 px-4 pt-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground dark:text-background/60">
              to do list
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold leading-tight">
              一件一件，<span className="text-primary">全部拿下</span>
            </h2>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
        </section>

        <ProgressPanel
          doneCount={p.doneCount}
          totalCount={p.totalCount}
          allDone={p.allDone}
          progressPct={p.progressPct}
        />

        {p.loadError ? (
          <section className="px-4 pt-3">
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">{p.loadError}</p>
              <button
                type="button"
                aria-label="关闭提示"
                onClick={() => p.setLoadError(null)}
                className="shrink-0 rounded-full p-1 text-destructive transition-all hover:bg-destructive/10 active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </section>
        ) : null}

        <main className="flex-1 px-4 pb-[calc(10rem_+_env(safe-area-inset-bottom))] pt-5">
          {p.dataLoading ? (
            <section aria-hidden className="space-y-3">
              <div className="h-16 animate-pulse rounded-2xl border border-border/60 bg-muted/60 dark:border-background/10 dark:bg-background/5" />
              <div className="h-16 animate-pulse rounded-2xl border border-border/60 bg-muted/60 dark:border-background/10 dark:bg-background/5" />
              <div className="h-16 animate-pulse rounded-2xl border border-border/60 bg-muted/60 dark:border-background/10 dark:bg-background/5" />
            </section>
          ) : p.totalCount === 0 ? (
            <TodosEmpty />
          ) : (
            <div className="space-y-7">
              <TodoSection
                title="未完成"
                items={p.pendingTodos}
                variant="pending"
                togglingIds={p.togglingIds}
                emptyHint="太棒了，没有要做的事了！"
                onToggle={p.toggleTodo}
                onDelete={p.deleteTodo}
                onDueChange={p.updateTodoDue}
              />
              <TodoSection
                title="已完成"
                items={p.doneTodos}
                variant="done"
                togglingIds={p.togglingIds}
                emptyHint="完成一条待办后，它会滑到这里休息。"
                onToggle={p.toggleTodo}
                onDelete={p.deleteTodo}
                onDueChange={p.updateTodoDue}
              />
            </div>
          )}
        </main>

        <BottomNav />
      </div>

      <TodoComposer
        todoDraft={p.todoDraft}
        onDraftChange={p.setTodoDraft}
        onAdd={p.addTodo}
        adding={p.todoAdding}
        dueDraft={p.dueDraft}
        onDueDraftChange={p.setDueDraft}
      />
    </div>
  )
}
