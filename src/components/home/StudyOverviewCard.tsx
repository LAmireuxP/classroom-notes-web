import { useState } from "react"
import { BarChart3, ChevronDown, Flame } from "lucide-react"
import type { StudyStats } from "@/lib/studyStats"
import { heatLevel } from "@/lib/studyStats"

// 首页学习概览：整月记录热力日历 + 连续记录天数 + 本周数据。可折叠，默认展开。

interface StudyOverviewCardProps {
  stats: StudyStats
}

const HEAT_CLASS = [
  "bg-muted dark:bg-background/10",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
] as const

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"]

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-secondary/50 px-2 py-2 dark:bg-background/5">
      <span className="font-display text-xl font-bold leading-none text-primary">{value}</span>
      <span className="mt-1 text-center text-xs text-muted-foreground dark:text-background/60">{label}</span>
    </div>
  )
}

export function StudyOverviewCard({ stats }: StudyOverviewCardProps) {
  const [open, setOpen] = useState(true)

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pt-4">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md dark:border-background/15 dark:bg-background/10">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:shadow-focus dark:hover:bg-background/5"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-sm font-bold">学习概览</span>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground dark:text-background/60">
              {stats.streak > 0 ? (
                <>
                  <Flame className="h-3.5 w-3.5 text-primary" />
                  连续记录 {stats.streak} 天
                </>
              ) : (
                `${stats.monthLabel}记录一览`
              )}
            </span>
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 dark:text-background/60 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open ? (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 border-t border-border px-4 pb-3.5 pt-3 dark:border-background/15">
            <p className="mb-1.5 font-mono text-xs text-muted-foreground dark:text-background/50">{stats.monthLabel}</p>
            {/* 星期表头 */}
            <div className="mx-auto grid max-w-[13.5rem] grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map((w) => (
                <span key={w} className="text-center text-[11px] leading-none text-muted-foreground dark:text-background/50">
                  {w}
                </span>
              ))}
            </div>
            {/* 整月热力日历 */}
            <div
              className="mx-auto mt-1.5 grid max-w-[13.5rem] grid-cols-7 gap-1"
              role="img"
              aria-label={`${stats.monthLabel}记录热力日历，连续记录 ${stats.streak} 天`}
            >
              {stats.cells.map((cell) => {
                if (!cell.inMonth) {
                  return <span key={cell.key} aria-hidden className="aspect-square" />
                }
                const level = cell.isFuture ? 0 : heatLevel(cell.count, stats.maxCount)
                return (
                  <div
                    key={cell.key}
                    title={`${cell.date.slice(5).replace("-", "/")}（${cell.dayNum} 日）· ${cell.count} 条`}
                    className={`aspect-square rounded-lg transition-colors ${HEAT_CLASS[level]} ${
                      cell.isToday
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-card dark:ring-offset-background/10"
                        : ""
                    } ${cell.isFuture ? "opacity-40" : ""}`}
                  />
                )
              })}
            </div>
            <div className="mt-2 flex items-center justify-end gap-1 text-xs text-muted-foreground dark:text-background/50">
              少
              {[0, 1, 2, 3, 4].map((lv) => (
                <span key={lv} className={`h-2.5 w-2.5 rounded-sm ${HEAT_CLASS[lv]}`} />
              ))}
              多
            </div>

            {/* 本周数据 */}
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <MiniStat value={stats.weekNotes} label="本周新笔记" />
              <MiniStat value={stats.weekTodos} label="本周新待办" />
              <MiniStat value={stats.doneTodos} label="累计完成" />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
