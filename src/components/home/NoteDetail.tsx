import { useEffect, useRef, useState } from "react"
import { Check, Loader2, Pencil, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { NoteRecord } from "@/pages/Home/useHome"
import { AI_SUMMARY_MIN_CHARS } from "@/pages/Home/useHome"
import { COURSE_TONE_TAG, courseToneIndex } from "@/lib/courseTone"
import type { CourseToneSource } from "@/lib/courseTone"
import { mdComponents } from "@/lib/markdownComponents"
import { formatNoteTime } from "@/lib/noteTime"
import { countDoneTasks, countTasks } from "@/lib/markdownTask"
import { noteStatsLabel } from "@/lib/noteStats"

interface NoteDetailProps {
  note: NoteRecord | null
  courses: CourseToneSource[]
  onClose: () => void
  onEdit: (note: NoteRecord) => void
  /** 点击任务清单复选框：翻转第 index 个任务并保存 */
  onToggleTask: (note: NoteRecord, index: number) => void
  /** AI 整理：结果区是否展开 */
  aiSummaryOpen: boolean
  /** AI 整理：Markdown 结构化摘要结果 */
  aiSummaryResult: string
  /** AI 整理：生成中（转圈 + 防重复点击） */
  aiSummaryLoading: boolean
  /** AI 整理：失败友好提示（网络/服务/内容审核归类） */
  aiSummaryError: string | null
  onRequestAiSummarize: () => void
  onReplaceWithAiSummary: (note: NoteRecord) => void
  onDiscardAiSummary: () => void
}

export function NoteDetail(p: NoteDetailProps) {
  const note = p.note
  const bodyRef = useRef<HTMLDivElement>(null)
  const tone = courseToneIndex(note?.course || "未分类", p.courses)

  // 事件委托：点到渲染出来的任务复选框时，按它在容器里的序号翻转对应任务
  const onBodyClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName !== "INPUT" || (target as HTMLInputElement).type !== "checkbox") return
    if (!note || !bodyRef.current) return
    e.preventDefault()
    const boxes = Array.from(bodyRef.current.querySelectorAll('input[type="checkbox"]'))
    const index = boxes.indexOf(target as HTMLInputElement)
    if (index >= 0) p.onToggleTask(note, index)
  }

  const total = note ? countTasks(note.content) : 0
  const done = note ? countDoneTasks(note.content) : 0

  // AI 整理结果区：原文 / 整理结果切换（结果区打开时默认展示整理结果）
  const [aiPane, setAiPane] = useState<"original" | "summary">("original")
  useEffect(() => {
    if (p.aiSummaryOpen) setAiPane("summary")
  }, [p.aiSummaryOpen])
  const tooShort = note ? note.content.trim().length < AI_SUMMARY_MIN_CHARS : false

  const originalPane = (
    <div ref={bodyRef} className="mt-1" onClick={onBodyClick}>
      {note ? (
        note.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {note.content}
          </ReactMarkdown>
        ) : (
          <p className="text-sm text-muted-foreground italic dark:text-background/50">
            这条笔记还没有内容，点下面「编辑」补上吧
          </p>
        )
      ) : null}
    </div>
  )

  return (
    <Dialog open={note !== null} onOpenChange={(next) => !next && p.onClose()}>
      <DialogContent className="max-h-[82vh] max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-lg dark:border-background/20 dark:bg-foreground dark:text-background">
        {note ? (
          <>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ${COURSE_TONE_TAG[tone]}`}
              >
                {note.course || "未分类"}
              </span>
              <time className="font-mono text-xs text-muted-foreground dark:text-background/60">
                {formatNoteTime(note.created)}
              </time>
            </div>
            <DialogHeader className="mt-3 items-start text-left">
              <DialogTitle className="font-display text-2xl font-bold leading-tight">
                {note.title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={tooShort || p.aiSummaryLoading}
                onClick={p.onRequestAiSummarize}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20 focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-40 dark:bg-background/15 dark:text-background dark:hover:bg-background/25"
              >
                {p.aiSummaryLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {p.aiSummaryLoading ? "整理中…" : "AI 帮我整理"}
              </button>
              {tooShort && !p.aiSummaryLoading ? (
                <span className="text-xs text-muted-foreground dark:text-background/50">
                  内容太短，不用整理
                </span>
              ) : null}
            </div>
            {p.aiSummaryError ? (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
                <p className="text-xs text-destructive">{p.aiSummaryError}</p>
                <button
                  type="button"
                  onClick={p.onRequestAiSummarize}
                  disabled={p.aiSummaryLoading || tooShort}
                  className="shrink-0 rounded-full border border-destructive/40 px-2.5 py-1 text-xs font-bold text-destructive transition-colors hover:bg-destructive/15 disabled:opacity-40"
                >
                  重试
                </button>
              </div>
            ) : null}
            {p.aiSummaryOpen ? (
              <div
                role="tablist"
                aria-label="原文与整理结果切换"
                className="mt-3 inline-flex rounded-full border border-border p-0.5 dark:border-background/20"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={aiPane === "original"}
                  onClick={() => setAiPane("original")}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    aiPane === "original"
                      ? "bg-primary text-primary-foreground dark:bg-background dark:text-foreground"
                      : "text-muted-foreground dark:text-background/60"
                  }`}
                >
                  原文
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={aiPane === "summary"}
                  onClick={() => setAiPane("summary")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    aiPane === "summary"
                      ? "bg-primary text-primary-foreground dark:bg-background dark:text-foreground"
                      : "text-muted-foreground dark:text-background/60"
                  }`}
                >
                  <Sparkles className="h-3 w-3" /> 整理结果
                </button>
              </div>
            ) : null}
            {p.aiSummaryOpen && aiPane === "summary" ? (
              <div className="mt-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 dark:border-background/20 dark:bg-background/10">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {p.aiSummaryResult}
                </ReactMarkdown>
              </div>
            ) : (
              originalPane
            )}
            {p.aiSummaryOpen ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => p.onReplaceWithAiSummary(note)}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-all hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
                >
                  <Check className="h-4 w-4" /> 替换原文
                </button>
                <button
                  type="button"
                  onClick={p.onDiscardAiSummary}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl border border-border text-sm font-bold text-foreground transition-colors hover:bg-muted active:scale-[0.98] dark:border-background/20 dark:text-background dark:hover:bg-background/10"
                >
                  放弃
                </button>
              </div>
            ) : null}
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 font-mono text-xs text-muted-foreground dark:border-background/15 dark:text-background/60">
              <span>{noteStatsLabel(note.content)}</span>
              {total > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-sans font-bold text-primary">
                  任务 {done}/{total}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => p.onEdit(note)}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground shadow-sm transition-all hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
            >
              <Pencil className="h-4 w-4" /> 编辑
            </button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
