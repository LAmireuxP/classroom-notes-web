import { useState } from "react"
import { CalendarDays, Mic, Plus, Square, X } from "lucide-react"
import { formatDueLabel, todayDateStr } from "@/pages/Todos/useTodos"
import { useSpeechToText } from "@/lib/useSpeechToText"

interface TodoComposerProps {
  todoDraft: string
  onDraftChange: (value: string) => void
  onAdd: () => void
  adding: boolean
  dueDraft: string
  onDueDraftChange: (value: string) => void
}

export function TodoComposer(p: TodoComposerProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [voiceInterim, setVoiceInterim] = useState("")
  const [voiceError, setVoiceError] = useState("")

  // 语音口述待办：整句识别结果接到输入框文字后面
  const { supported: voiceSupported, listening, toggle: toggleVoice, stop: stopVoice } = useSpeechToText({
    onFinal: (text) => {
      setVoiceError("")
      const draft = p.todoDraft.trim()
      p.onDraftChange(draft ? `${draft} ${text}` : text)
    },
    onInterim: setVoiceInterim,
    onError: (message) => {
      setVoiceError(message)
      window.setTimeout(() => setVoiceError(""), 3500)
    },
  })

  // 悬浮在底部导航之上（导航高 3.5rem + 安全区）
  return (
    <footer className="fixed inset-x-0 bottom-[calc(3.5rem_+_env(safe-area-inset-bottom))] z-30">
      <div className="mx-auto w-full max-w-md bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-3 pt-6 dark:from-foreground dark:via-foreground/90">
        {p.dueDraft ? (
          <div className="mb-2 flex animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              type="button"
              onClick={() => p.onDueDraftChange("")}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary transition-all hover:bg-primary/20 active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDueLabel(p.dueDraft)}
              <span className="text-primary/60">·</span>
              <span className="inline-flex items-center gap-0.5">
                <X className="h-3 w-3" />
                取消
              </span>
            </button>
          </div>
        ) : pickerOpen ? (
          <div className="mb-2 flex animate-in fade-in slide-in-from-bottom-2 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm duration-300 dark:border-background/20 dark:bg-background/10">
            <label htmlFor="composer-due" className="shrink-0 text-xs font-bold text-muted-foreground dark:text-background/60">
              截止日期
            </label>
            <input
              id="composer-due"
              type="date"
              min={todayDateStr()}
              onChange={(e) => {
                if (e.target.value) {
                  p.onDueDraftChange(e.target.value)
                  setPickerOpen(false)
                }
              }}
              className="h-8 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none dark:text-background"
            />
            <button
              type="button"
              aria-label="收起日期选择"
              onClick={() => setPickerOpen(false)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-all hover:bg-muted active:scale-95 focus-visible:outline-none focus-visible:shadow-focus dark:text-background/60 dark:hover:bg-background/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {voiceError ? (
          <p className="mb-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {voiceError}
          </p>
        ) : null}
        {listening ? (
          <div className="mb-2 flex animate-in fade-in slide-in-from-bottom-2 items-center gap-2 rounded-2xl border border-primary/40 bg-card px-3 py-2 shadow-sm duration-300 dark:border-primary/40 dark:bg-background/10">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-foreground dark:text-background">
              {voiceInterim || "正在听…说出你的待办"}
            </span>
            <button
              type="button"
              onClick={stopVoice}
              className="shrink-0 text-xs font-bold text-primary transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"
            >
              完成
            </button>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="选择截止日期"
            aria-pressed={pickerOpen}
            disabled={p.adding || Boolean(p.dueDraft)}
            onClick={() => setPickerOpen((open) => !open)}
            className={
              "grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-40 " +
              (pickerOpen
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary dark:border-background/20 dark:bg-background/10 dark:text-background/60")
            }
          >
            <CalendarDays className="h-5 w-5" />
          </button>
          <input
            value={p.todoDraft}
            disabled={p.adding}
            onChange={(e) => p.onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") p.onAdd()
            }}
            placeholder="想做点什么？回车添加"
            aria-label="新增待办"
            className="h-12 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus-visible:border-primary focus-visible:shadow-focus disabled:opacity-60 dark:border-background/20 dark:bg-background/10 dark:text-background"
          />
          {voiceSupported ? (
            <button
              type="button"
              aria-label={listening ? "停止语音输入" : "语音输入待办"}
              aria-pressed={listening}
              disabled={p.adding}
              onClick={toggleVoice}
              className={
                "grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-40 " +
                (listening
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary dark:border-background/20 dark:bg-background/10 dark:text-background/60")
              }
            >
              {listening ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={p.onAdd}
            disabled={p.adding}
            aria-label="添加待办"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-95 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </footer>
  )
}
