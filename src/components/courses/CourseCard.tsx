import { ChevronDown, NotebookPen, Pencil, Trash2 } from "lucide-react"
import type { CourseRecord, NoteRecord } from "@/pages/Home/useHome"
import { COURSE_TONE_CARD, COURSE_TONE_COUNT } from "@/lib/courseTone"
import { stripMarkdown } from "@/lib/markdownText"

interface CourseCardProps {
  course: CourseRecord
  noteCount: number
  expanded: boolean
  notes: NoteRecord[]
  /** 配色档位 index（已含手动色优先逻辑），由页面统一计算传入 */
  variantIndex: number
  /** 入场动画错峰用的列表序号 */
  delayIndex: number
  onToggle: () => void
  onRename: () => void
  onDelete: () => void
}

const iconBtnBase =
  "grid h-8 w-8 cursor-pointer place-items-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"

function formatNoteTime(created: string): string {
  const d = new Date(created)
  if (Number.isNaN(d.getTime())) return ""
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  if (sameDay) {
    const hh = String(d.getHours()).padStart(2, "0")
    const mm = String(d.getMinutes()).padStart(2, "0")
    return `今天 ${hh}:${mm}`
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function CourseCard(p: CourseCardProps) {
  const v = COURSE_TONE_CARD[p.variantIndex % COURSE_TONE_COUNT]
  return (
    <article
      className={`animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border shadow-md transition-all duration-300 hover:shadow-lg ${v.surface}`}
      style={{ animationDelay: `${Math.min(p.delayIndex * 70, 280)}ms` }}
    >
      <button
        type="button"
        onClick={p.onToggle}
        aria-expanded={p.expanded}
        className="w-full rounded-t-2xl p-4 text-left focus-visible:outline-none focus-visible:shadow-focus"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-snug break-all">{p.course.name}</h3>
          <ChevronDown
            className={`h-5 w-5 shrink-0 opacity-70 transition-transform duration-300 ${p.expanded ? "rotate-180" : ""}`}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-bold ${v.chip}`}>
            <NotebookPen className="h-3 w-3" /> {p.noteCount} 篇
          </span>
          <div className="flex shrink-0 gap-2">
            <span
              role="button"
              tabIndex={0}
              aria-label={`重命名课程 ${p.course.name}`}
              onClick={(e) => {
                e.stopPropagation()
                p.onRename()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation()
                  p.onRename()
                }
              }}
              className={`${iconBtnBase} ${v.iconBtn}`}
            >
              <Pencil className="h-4 w-4" />
            </span>
            <span
              role="button"
              tabIndex={0}
              aria-label={`删除课程 ${p.course.name}`}
              onClick={(e) => {
                e.stopPropagation()
                p.onDelete()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation()
                  p.onDelete()
                }
              }}
              className={`${iconBtnBase} border-transparent hover:border-destructive hover:bg-destructive/15 hover:text-destructive`}
            >
              <Trash2 className="h-4 w-4" />
            </span>
          </div>
        </div>
      </button>

      {p.expanded ? (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 border-t border-current/15 px-4 pb-4 pt-3">
          {p.notes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-current/30 px-3 py-4 text-center text-sm opacity-80">
              这门课还没有笔记，去首页记一条吧
            </p>
          ) : (
            <ul className="space-y-2">
              {p.notes.map((note) => (
                <li key={note.id} className="rounded-xl border border-current/20 bg-current/5 px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-sm font-bold break-all">{note.title}</span>
                    <time className="shrink-0 font-mono text-xs opacity-70">{formatNoteTime(note.created)}</time>
                  </div>
                  {stripMarkdown(note.content) ? (
                    <p className="mt-1 line-clamp-2 text-xs opacity-75">{stripMarkdown(note.content)}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </article>
  )
}
