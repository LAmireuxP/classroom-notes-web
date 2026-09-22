import { Search, X } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function SearchBar(p: SearchBarProps) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pt-4">
      <div className="flex h-12 items-center gap-2 rounded-full border border-border bg-card pl-4 pr-3 shadow-sm transition-all focus-within:border-primary focus-within:shadow-focus dark:border-background/15 dark:bg-background/10">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground dark:text-background/60" />
        <input
          value={p.searchQuery}
          onChange={(e) => p.onSearchChange(e.target.value)}
          placeholder="搜索笔记与课程"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground dark:text-background"
        />
        {p.searchQuery ? (
          <button
            type="button"
            onClick={() => p.onSearchChange("")}
            aria-label="清空搜索"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-all hover:text-foreground active:scale-90 dark:bg-background/10 dark:text-background/60 dark:hover:text-background"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </section>
  )
}
