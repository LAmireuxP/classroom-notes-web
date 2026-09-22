import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Bold, Code2, Eye, Heading1, ImagePlus, Italic, List, ListOrdered, ListTodo, Loader2, Mic, PenLine, Square } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CourseRecord } from "@/pages/Home/useHome"
import { mdComponents } from "@/lib/markdownComponents"
import { uploadNoteImage, validateNoteImage } from "@/lib/noteImage"
import { useSpeechToText } from "@/lib/useSpeechToText"
import { noteStatsLabel } from "@/lib/noteStats"
import { NOTE_TEMPLATES, type NoteTemplate } from "@/lib/noteTemplates"

interface NoteEditorProps {
  open: boolean
  onClose: () => void
  courses: CourseRecord[]
  noteTitle: string
  onTitleChange: (value: string) => void
  noteContent: string
  onContentChange: (value: string) => void
  courseDraft: string
  onCourseDraftChange: (value: string) => void
  editing: boolean
  saving: boolean
  onSave: () => void
}

const labelCls = "mb-1.5 block text-xs font-bold text-muted-foreground dark:text-background/60"
const fieldCls =
  "rounded-xl border border-border bg-background text-sm text-foreground transition-all focus-visible:shadow-focus dark:border-background/20 dark:bg-background/10 dark:text-background"
const chipBase = "h-8 rounded-full border px-3 text-xs font-semibold transition-all active:scale-95"
const btnBase =
  "flex-1 rounded-xl py-3 text-sm transition-all focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
const toolBtn =
  "grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:shadow-focus dark:border-background/20 dark:text-background/70 dark:hover:border-primary dark:hover:text-primary"

export function NoteEditor(p: NoteEditorProps) {
  const canSave = p.noteTitle.trim().length > 0 && !p.saving
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [previewing, setPreviewing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [voiceInterim, setVoiceInterim] = useState("")
  const [voiceError, setVoiceError] = useState("")

  // 语音输入：整句识别结果追加到内容末尾，中间结果实时显示在麦克风旁的字幕条
  const { supported: voiceSupported, listening, toggle: toggleVoice, stop: stopVoice } = useSpeechToText({
    onFinal: (text) => {
      setVoiceError("")
      const value = p.noteContent
      const needsBreak = value.length > 0 && !value.endsWith("\n") && !value.endsWith(" ")
      p.onContentChange(value + (needsBreak ? "\n" : "") + text)
    },
    onInterim: setVoiceInterim,
    onError: (message) => {
      setVoiceError(message)
      window.setTimeout(() => setVoiceError(""), 3500)
    },
  })

  // 每次打开编辑卡片都回到写作态；关闭时停掉语音、清字幕
  useEffect(() => {
    if (p.open) {
      setPreviewing(false)
    } else {
      stopVoice()
      setVoiceInterim("")
      setVoiceError("")
    }
  }, [p.open, stopVoice])

  // 包住选中文本插入成对标记；无选中时插入占位词并回选，方便直接改字
  const applyWrap = (before: string, after: string, placeholder: string) => {
    const el = textareaRef.current
    if (!el) return
    const value = p.noteContent
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end) || placeholder
    p.onContentChange(value.slice(0, start) + before + selected + after + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  // 在光标所在行行首插入前缀（标题/列表）
  const applyLinePrefix = (prefix: string) => {
    const el = textareaRef.current
    if (!el) return
    const value = p.noteContent
    const start = el.selectionStart
    const lineStart = value.lastIndexOf("\n", start - 1) + 1
    p.onContentChange(value.slice(0, lineStart) + prefix + value.slice(lineStart))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length)
    })
  }
  // 套用模板：填入内容，标题为空时顺带填模板名，然后聚焦正文
  const applyTemplate = (tpl: NoteTemplate) => {
    p.onContentChange(tpl.content)
    if (!p.noteTitle.trim()) p.onTitleChange(tpl.label)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  // 选图 → 上传 → 在光标处插入图片写法
  const onFilePicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const invalid = validateNoteImage(file)
    if (invalid) {
      window.alert(invalid)
      return
    }
    setUploading(true)
    try {
      const imageMarkdown = await uploadNoteImage(file)
      const el = textareaRef.current
      const value = p.noteContent
      const caret = el ? el.selectionStart : value.length
      const pad = caret > 0 && value[caret - 1] !== "\n" ? "\n" : ""
      const inserted = pad + imageMarkdown + "\n"
      p.onContentChange(value.slice(0, caret) + inserted + value.slice(caret))
      requestAnimationFrame(() => {
        if (!el) return
        el.focus()
        const next = caret + inserted.length
        el.setSelectionRange(next, next)
      })
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "图片上传失败，请重试")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={p.open} onOpenChange={(next) => !next && p.onClose()}>
      <DialogContent className="max-w-md rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-lg dark:border-background/20 dark:bg-foreground dark:text-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">
            {p.editing ? "编辑笔记" : "创建笔记"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground dark:text-background/60">
            记一条课堂重点，归属到某门课程
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>标题</label>
            <Input
              value={p.noteTitle}
              onChange={(e) => p.onTitleChange(e.target.value)}
              placeholder="例如：树与二叉树要点"
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>内容</label>
            {!p.editing && !p.noteContent.trim() ? (
              <div className="mb-2 flex items-center gap-1.5">
                <span className="shrink-0 text-xs text-muted-foreground dark:text-background/60">模板</span>
                {NOTE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    disabled={previewing}
                    onClick={() => applyTemplate(tpl)}
                    className={`${chipBase} border-border bg-card text-foreground/75 hover:border-primary/50 hover:text-primary disabled:opacity-40 dark:border-background/20 dark:bg-background/10 dark:text-background/75`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div
              className="mb-2 flex items-center gap-1.5"
              role="toolbar"
              aria-label="排版快捷按钮"
            >
              <button type="button" aria-label="加粗" title="加粗" className={`${toolBtn} disabled:opacity-40 disabled:active:scale-100`} disabled={previewing} onClick={() => applyWrap("**", "**", "加粗文字")}>
                <Bold className="h-4 w-4" />
              </button>
              <button type="button" aria-label="斜体" title="斜体" className={`${toolBtn} disabled:opacity-40 disabled:active:scale-100`} disabled={previewing} onClick={() => applyWrap("*", "*", "斜体文字")}>
                <Italic className="h-4 w-4" />
              </button>
              <button type="button" aria-label="小标题" title="小标题" className={`${toolBtn} disabled:opacity-40 disabled:active:scale-100`} disabled={previewing} onClick={() => applyLinePrefix("## ")}>
                <Heading1 className="h-4 w-4" />
              </button>
              <button type="button" aria-label="要点列表" title="要点列表" className={`${toolBtn} disabled:opacity-40 disabled:active:scale-100`} disabled={previewing} onClick={() => applyLinePrefix("- ")}>
                <List className="h-4 w-4" />
              </button>
              <button type="button" aria-label="编号列表" title="编号列表" className={`${toolBtn} disabled:opacity-40 disabled:active:scale-100`} disabled={previewing} onClick={() => applyLinePrefix("1. ")}>
                <ListOrdered className="h-4 w-4" />
              </button>
              <button type="button" aria-label="任务清单" title="任务清单（可勾选）" className={`${toolBtn} disabled:opacity-40 disabled:active:scale-100`} disabled={previewing} onClick={() => applyLinePrefix("- [ ] ")}>
                <ListTodo className="h-4 w-4" />
              </button>
              <button type="button" aria-label="行内代码" title="行内代码" className={`${toolBtn} disabled:opacity-40 disabled:active:scale-100`} disabled={previewing} onClick={() => applyWrap("`", "`", "code")}>
                <Code2 className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={onFilePicked}
              />
              <button
                type="button"
                aria-label="插入图片"
                title={uploading ? "图片上传中…" : "插入图片"}
                className={`${toolBtn} disabled:opacity-40 disabled:active:scale-100`}
                disabled={previewing || uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              </button>
              {voiceSupported ? (
                <button
                  type="button"
                  aria-label={listening ? "停止语音输入" : "语音输入"}
                  aria-pressed={listening}
                  title={listening ? "停止语音输入" : "语音输入（说话转文字）"}
                  className={`${toolBtn} disabled:opacity-40 disabled:active:scale-100 ${
                    listening ? "border-primary bg-primary text-primary-foreground" : ""
                  }`}
                  disabled={previewing}
                  onClick={toggleVoice}
                >
                  {listening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
                </button>
              ) : null}
              <div className="ml-auto flex items-center rounded-lg border border-border p-0.5 dark:border-background/20" role="group" aria-label="写作与预览切换">
                <button
                  type="button"
                  aria-pressed={!previewing}
                  title="写作"
                  onClick={() => setPreviewing(false)}
                  className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:shadow-focus ${
                    !previewing
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground dark:text-background/60 dark:hover:text-background"
                  }`}
                >
                  <PenLine className="h-3.5 w-3.5" /> 写作
                </button>
                <button
                  type="button"
                  aria-pressed={previewing}
                  title="预览"
                  onClick={() => setPreviewing(true)}
                  className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:shadow-focus ${
                    previewing
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground dark:text-background/60 dark:hover:text-background"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> 预览
                </button>
              </div>
            </div>
            {voiceError ? (
              <p className="mb-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {voiceError}
              </p>
            ) : null}
            {listening ? (
              <div className="mb-2 flex animate-in fade-in slide-in-from-bottom-2 items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2 duration-300 dark:bg-primary/10">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-foreground dark:text-background">
                  {voiceInterim || "正在听…开始说话吧"}
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
            {previewing ? (
              <div
                className={`${fieldCls} min-h-[6rem] max-h-60 overflow-y-auto px-3.5 py-2.5`}
                aria-label="内容预览"
              >
                {p.noteContent.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{p.noteContent}</ReactMarkdown>
                ) : (
                  <p className="text-sm italic text-muted-foreground dark:text-background/50">
                    还没有内容，切回「写作」写点什么吧
                  </p>
                )}
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                value={p.noteContent}
                onChange={(e) => p.onContentChange(e.target.value)}
                placeholder="写下这堂课的重点…"
                rows={4}
                className={fieldCls}
              />
            )}
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-primary">
                {noteStatsLabel(p.noteContent)}
              </span>
              <span className="truncate text-xs text-muted-foreground dark:text-background/50">
                支持 **加粗** *斜体* # 标题 - 列表 - [ ] 任务 `代码`
              </span>
            </div>
          </div>
          <div>
            <label className={labelCls}>归属课程</label>
            {p.courses.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-2">
                {p.courses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => p.onCourseDraftChange(c.name)}
                    className={`${chipBase} ${
                      p.courseDraft === c.name
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground/75 hover:border-primary/50 dark:border-background/20 dark:bg-background/10 dark:text-background/75"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            ) : null}
            <Input
              value={p.courseDraft}
              onChange={(e) => p.onCourseDraftChange(e.target.value)}
              placeholder="选一门课，或直接输入新课程名"
              className={fieldCls}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={p.onClose}
              className={`${btnBase} border border-border font-semibold transition-colors hover:border-primary dark:border-background/20 dark:text-background`}
            >
              取消
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={p.onSave}
              className={`${btnBase} bg-primary font-bold text-primary-foreground shadow-sm transition-shadow hover:shadow-md`}
            >
              {p.saving ? "保存中…" : p.editing ? "保存修改" : "保存笔记"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
