import { LayoutList, Star, Trash2 } from "lucide-react"
import type { NoteViewFilter } from "@/pages/Home/useHome"

// 笔记视图筛选：全部 / 收藏 / 回收站（带数量角标）

interface ViewFilterChipsProps {
  viewFilter: NoteViewFilter
  favoriteCount: number
  trashCount: number
  onSelect: (next: NoteViewFilter) => void
}

const chipBase =
  "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"
const chipSelected = "border-primary bg-primary text-primary-foreground shadow-sm"
const chipIdle =
  "border-border bg-card text-foreground/70 hover:border-primary/50 dark:border-background/20 dark:bg-background/10 dark:text-background/70 dark:hover:border-primary/50"

export function ViewFilterChips(p: ViewFilterChipsProps) {
  const items: Array<{ key: NoteViewFilter; label: string; icon: typeof LayoutList; count?: number }> = [
    { key: "all", label: "全部", icon: LayoutList },
    { key: "favorite", label: "收藏", icon: Star, count: p.favoriteCount },
    { key: "trash", label: "回收站", icon: Trash2, count: p.trashCount },
  ]
  return (
    <section className="px-4 pt-3" aria-label="笔记视图筛选">
      <div className="flex gap-2">
        {items.map((item) => {
          const Icon = item.icon
          const selected = p.viewFilter === item.key
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={selected}
              onClick={() => p.onSelect(item.key)}
              className={`${chipBase} ${selected ? chipSelected : chipIdle}`}
            >
              <Icon className={`h-3.5 w-3.5 ${selected && item.key === "favorite" ? "fill-current" : ""}`} />
              {item.label}
              {item.count ? (
                <span className={`rounded-full px-1.5 text-[10px] leading-4 ${selected ? "bg-primary-foreground/25" : "bg-muted text-muted-foreground dark:bg-background/15 dark:text-background/60"}`}>
                  {item.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
