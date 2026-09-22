import { NotebookPen, Pencil, Pin, RotateCcw, SearchX, Star, Trash2 } from "lucide-react"
import type { CourseRecord, NoteRecord, NoteViewFilter } from "@/pages/Home/useHome"
import { COURSE_TONE_BAR, COURSE_TONE_TAG, courseToneIndex } from "@/lib/courseTone"
import type { CourseToneSource } from "@/lib/courseTone"
import { stripMarkdown } from "@/lib/markdownText"
import { formatNoteTime } from "@/lib/noteTime"
import { HighlightText } from "./HighlightText"

interface NotesListProps {
  notes: NoteRecord[]
  totalNotes: number
  dataLoading: boolean
  searchQuery: string
  activeCourse?: string
  courses?: CourseToneSource[]
  matchingCourses: CourseRecord[]
  exitingNoteId: string | null
  viewFilter: NoteViewFilter
  onEditNote: (note: NoteRecord) => void
  onDeleteNote: (note: NoteRecord) => void
  onOpenNote: (note: NoteRecord) => void
  onToggleNoteFlag: (note: NoteRecord, field: "pinned" | "favorite") => void
  onRestoreNote: (note: NoteRecord) => void
}

const emptyShell =
  "rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-sm dark:border-background/20 dark:bg-background/10"
const iconCircle = "mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10"
const iconBtnBase =
  "grid h-9 w-9 place-items-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"

export function NotesList(p: NotesListProps) {
  const query = p.searchQuery.trim()
  return (
    <main className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 px-4 pb-[calc(9rem_+_env(safe-area-inset-bottom))] pt-5">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="font-display text-xl font-bold">笔记</h2>
        <span className="font-mono text-xs text-muted-foreground dark:text-background/60">
          {p.dataLoading ? "加载中" : `${p.notes.length} 条`}
        </span>
      </div>

      {query && p.matchingCourses.length > 0 ? (
        <section className="mb-3">
          <p className="mb-2 px-1 font-mono text-xs uppercase tracking-widest text-muted-foreground dark:text-background/60">
            相关课程
          </p>
          <div className="flex flex-wrap gap-2 px-1">
            {p.matchingCourses.map((c) => (
              <span
                key={c.id}
                className="inline-flex h-7 items-center rounded-full bg-primary/10 px-3 text-xs font-bold text-primary"
              >
                {c.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {p.dataLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/60 dark:border-background/10 dark:bg-background/5"
            />
          ))}
        </div>
      ) : p.totalNotes === 0 && p.viewFilter !== "trash" ? (
        <div className={emptyShell}>
          <div className={iconCircle}>
            <NotebookPen className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 font-display text-lg font-bold">还没有笔记</p>
          <p className="mt-1 text-sm text-muted-foreground dark:text-background/60">
            点击下方「创建笔记」, 记下第一条课堂重点吧
          </p>
        </div>
      ) : p.notes.length === 0 ? (
        <div className={emptyShell}>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted dark:bg-background/10">
            <SearchX className="h-6 w-6 text-muted-foreground dark:text-background/60" />
          </div>
          {p.viewFilter === "trash" && !query ? (
            <>
              <p className="mt-4 font-display text-lg font-bold">回收站是空的</p>
              <p className="mt-1 text-sm text-muted-foreground dark:text-background/60">
                删除的笔记会先放在这里，随时可以恢复
              </p>
            </>
          ) : p.viewFilter === "favorite" && !query && !p.activeCourse ? (
            <>
              <p className="mt-4 font-display text-lg font-bold">还没有收藏的笔记</p>
              <p className="mt-1 text-sm text-muted-foreground dark:text-background/60">
                点笔记卡片上的星星，把重点收藏到这里
              </p>
            </>
          ) : query ? (
            <>
              <p className="mt-4 font-display text-lg font-bold">没有找到「{query}」相关笔记</p>
              <p className="mt-1 text-sm text-muted-foreground dark:text-background/60">
                换个关键词试试, 或清空搜索查看全部
              </p>
            </>
          ) : p.activeCourse ? (
            <>
              <p className="mt-4 font-display text-lg font-bold">「{p.activeCourse}」下还没有笔记</p>
              <p className="mt-1 text-sm text-muted-foreground dark:text-background/60">
                点顶部「全部」查看所有笔记, 或为这门课记一条
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 font-display text-lg font-bold">没有找到相关笔记</p>
              <p className="mt-1 text-sm text-muted-foreground dark:text-background/60">换个条件试试吧</p>
            </>
          )}
        </div>
      ) : (
          // 切课程/视图筛选时整列重挂载，让卡片重新逐个错峰入场（搜索时不重挂载、不闪）
          <ul key={`${p.viewFilter}-course-${p.activeCourse ?? "all"}`} className="space-y-3">
          {p.notes.map((note, idx) => (
            <li
              key={note.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${Math.min(idx * 60, 240)}ms` }}
            >
              <article
                role="button"
                tabIndex={0}
                aria-label={`查看笔记详情 ${note.title}`}
                onClick={() => p.onOpenNote(note)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") p.onOpenNote(note)
                }}
                className={`relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-4 pl-5 shadow-sm transition-all duration-300 active:scale-[0.99] dark:border-background/15 dark:bg-background/10 ${
                  p.exitingNoteId === note.id
                    ? "translate-x-8 scale-95 opacity-0"
                    : note.deleted
                      ? "opacity-75 hover:opacity-100"
                      : "hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute bottom-3 left-0 top-3 w-1.5 rounded-r-full ${
                    COURSE_TONE_BAR[courseToneIndex(note.course || "未分类", p.courses ?? [])]
                  }`}
                />
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex items-start gap-1.5 font-display text-lg font-bold leading-snug">
                    {note.pinned && !note.deleted ? (
                      <Pin aria-label="已置顶" className="mt-1 h-3.5 w-3.5 shrink-0 fill-primary text-primary" />
                    ) : null}
                    <HighlightText text={note.title} query={p.searchQuery} />
                  </h3>
                  <time className="shrink-0 pt-1 font-mono text-xs text-muted-foreground dark:text-background/60">
                    {formatNoteTime(note.created)}
                  </time>
                </div>
                {stripMarkdown(note.content) ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground dark:text-background/70">
                    <HighlightText text={stripMarkdown(note.content)} query={p.searchQuery} />
                  </p>
                ) : null}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ${
                      COURSE_TONE_TAG[courseToneIndex(note.course || "未分类", p.courses ?? [])]
                    }`}
                  >
                    {note.course || "未分类"}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    {note.deleted ? (
                      <>
                        <button
                          type="button"
                          aria-label={`恢复笔记 ${note.title}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            p.onRestoreNote(note)
                          }}
                          className={`${iconBtnBase} border-border text-muted-foreground hover:border-primary hover:text-primary dark:border-background/20 dark:text-background/70`}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`彻底删除笔记 ${note.title}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            p.onDeleteNote(note)
                          }}
                          className={`${iconBtnBase} border-transparent text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive dark:text-background/70`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          aria-label={note.pinned ? `取消置顶 ${note.title}` : `置顶笔记 ${note.title}`}
                          aria-pressed={Boolean(note.pinned)}
                          onClick={(e) => {
                            e.stopPropagation()
                            p.onToggleNoteFlag(note, "pinned")
                          }}
                          className={`${iconBtnBase} ${
                            note.pinned
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary hover:text-primary dark:border-background/20 dark:text-background/70"
                          }`}
                        >
                          <Pin className={`h-4 w-4 ${note.pinned ? "fill-current" : ""}`} />
                        </button>
                        <button
                          type="button"
                          aria-label={note.favorite ? `取消收藏 ${note.title}` : `收藏笔记 ${note.title}`}
                          aria-pressed={Boolean(note.favorite)}
                          onClick={(e) => {
                            e.stopPropagation()
                            p.onToggleNoteFlag(note, "favorite")
                          }}
                          className={`${iconBtnBase} ${
                            note.favorite
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary hover:text-primary dark:border-background/20 dark:text-background/70"
                          }`}
                        >
                          <Star className={`h-4 w-4 ${note.favorite ? "fill-current" : ""}`} />
                        </button>
                        <button
                          type="button"
                          aria-label={`编辑笔记 ${note.title}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            p.onEditNote(note)
                          }}
                          className={`${iconBtnBase} border-border text-muted-foreground hover:border-primary hover:text-primary dark:border-background/20 dark:text-background/70`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`删除笔记 ${note.title}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            p.onDeleteNote(note)
                          }}
                          className={`${iconBtnBase} border-transparent text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive dark:text-background/70`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
