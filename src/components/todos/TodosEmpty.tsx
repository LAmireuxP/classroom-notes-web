import { ArrowDown, ClipboardList } from "lucide-react"

export function TodosEmpty() {
  return (
    <section className="animate-in fade-in zoom-in-95 duration-500">
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-sm dark:border-background/20 dark:bg-background/5">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10">
          <ClipboardList className="h-9 w-9 text-primary" />
        </div>
        <p className="mt-4 font-display text-xl font-bold">这里还空空的</p>
        <p className="mt-2 text-sm text-muted-foreground dark:text-background/60">
          还没有任何待办，写一句话就能开始
        </p>
        <p className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-primary">
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> 在下方输入框添加第一条
        </p>
      </div>
    </section>
  )
}
