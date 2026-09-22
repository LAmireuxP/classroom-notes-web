import { useEffect, useState } from "react"
import { CheckSquare, Loader2, Mic, Square, StickyNote } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getPocketBaseUrl } from "@/lib/pb"
import { useSpeechToText } from "@/lib/useSpeechToText"

// 语音速记：底部标签栏全局入口。打开即开始听，说完一键存成待办或笔记。

async function postJson(path: string, body: unknown): Promise<void> {
  const resp = await fetch(`${getPocketBaseUrl()}/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(`保存失败 (${resp.status})`)
}

interface VoiceCaptureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoiceCaptureDialog(p: VoiceCaptureDialogProps) {
  const [transcript, setTranscript] = useState("")
  const [interim, setInterim] = useState("")
  const [voiceError, setVoiceError] = useState("")
  const [saving, setSaving] = useState<"todo" | "note" | null>(null)

  const { supported, listening, start, stop } = useSpeechToText({
    onFinal: (text) => {
      setVoiceError("")
      setTranscript((prev) => (prev ? `${prev}\n${text}` : text))
    },
    onInterim: setInterim,
    onError: (message) => {
      setVoiceError(message)
      window.setTimeout(() => setVoiceError(""), 3500)
    },
  })

  // 打开即听、关闭即停（不支持语音的浏览器只展示说明）
  useEffect(() => {
    if (p.open) {
      setTranscript("")
      setInterim("")
      setVoiceError("")
      setSaving(null)
      start()
    } else {
      stop()
    }
  }, [p.open, start, stop])

  const close = () => {
    stop()
    p.onOpenChange(false)
  }

  const save = async (kind: "todo" | "note") => {
    const text = transcript.trim()
    if (!text || saving) return
    setSaving(kind)
    try {
      if (kind === "todo") {
        await postJson("todos", { content: text.replace(/\n+/g, " "), done: false, due: "" })
      } else {
        const firstLine = text.split("\n")[0].trim()
        const title = firstLine.length > 18 ? `${firstLine.slice(0, 18)}…` : firstLine || "语音笔记"
        await postJson("notes", { title, content: text, course: "" })
      }
      // 通知首页/待办页刷新列表
      window.dispatchEvent(new CustomEvent("ktzl:data-changed"))
      close()
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : "保存失败，请重试")
      window.setTimeout(() => setVoiceError(""), 3500)
    } finally {
      setSaving(null)
    }
  }

  const saveBtn =
    "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold transition-all focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"

  return (
    <Dialog open={p.open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-w-sm rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-lg dark:border-background/20 dark:bg-foreground dark:text-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">语音速记</DialogTitle>
          <p className="text-sm text-muted-foreground dark:text-background/60">
            想到什么直接说，说完存成待办或笔记
          </p>
        </DialogHeader>

        {!supported ? (
          <p className="rounded-xl border border-border px-3 py-4 text-center text-sm text-muted-foreground dark:border-background/20 dark:text-background/60">
            当前浏览器不支持语音识别，
            <br />
            换 Chrome / Edge 打开就能用
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={listening ? stop : start}
              aria-pressed={listening}
              aria-label={listening ? "停止收听" : "开始收听"}
              className={`mx-auto grid h-16 w-16 place-items-center rounded-full transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus ${
                listening
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border border-border bg-secondary text-muted-foreground hover:border-primary hover:text-primary dark:border-background/20 dark:bg-background/10 dark:text-background/60"
              }`}
            >
              {listening ? <Square className="h-5 w-5" /> : <Mic className="h-6 w-6" />}
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground dark:text-background/50">
              {listening ? "正在听…再点一下停止" : "点上方的麦克风开始"}
            </p>

            {voiceError ? (
              <p className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {voiceError}
              </p>
            ) : null}

            <div
              className="mt-3 max-h-40 min-h-16 overflow-y-auto rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground dark:border-background/20 dark:bg-background/10 dark:text-background"
              aria-live="polite"
              aria-label="识别结果"
            >
              {transcript || interim ? (
                <>
                  {transcript ? <span className="whitespace-pre-wrap">{transcript}</span> : null}
                  {interim ? (
                    <span className="whitespace-pre-wrap text-muted-foreground dark:text-background/50">
                      {transcript ? "\n" : ""}
                      {interim}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-muted-foreground dark:text-background/50">识别到的文字会出现在这里</span>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={!transcript.trim() || saving !== null}
                onClick={() => save("todo")}
                className={`${saveBtn} border border-border font-semibold hover:border-primary dark:border-background/20`}
              >
                {saving === "todo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4" />}
                存为待办
              </button>
              <button
                type="button"
                disabled={!transcript.trim() || saving !== null}
                onClick={() => save("note")}
                className={`${saveBtn} bg-primary text-primary-foreground shadow-sm hover:shadow-md`}
              >
                {saving === "note" ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />}
                存为笔记
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
