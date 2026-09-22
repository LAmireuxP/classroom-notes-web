import { Check, GraduationCap, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  COURSE_TONE_AUTO,
  COURSE_TONE_CARD,
  COURSE_TONE_COUNT,
  COURSE_TONE_DOT_FOREGROUND,
} from "@/lib/courseTone"

interface CourseFormDialogProps {
  open: boolean
  editing: boolean
  nameDraft: string
  /** 0 = 自动配色，1-4 = 手动档位 */
  colorDraft: number
  /** 自动档实时预览用的位置色 index；新建课无法预知位置时传 -1 */
  autoToneIndex: number
  saving: boolean
  onNameChange: (value: string) => void
  onColorChange: (value: number) => void
  onClose: () => void
  onSave: () => void
}

const btnBase =
  "flex-1 rounded-xl py-3 text-sm transition-all focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"

/** 弹窗色点的底色（第 4 档用卡面底色 + 描边区分，深浅模式都可辨） */
const DOT_SURFACE = ["bg-primary", "bg-secondary", "bg-foreground dark:bg-background", "bg-card dark:bg-background/30"]
const dotBase =
  "grid h-8 w-8 place-items-center rounded-full border-2 transition-all active:scale-90 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50"

export function CourseFormDialog(p: CourseFormDialogProps) {
  const previewIndex = p.colorDraft === COURSE_TONE_AUTO ? p.autoToneIndex : p.colorDraft - 1
  const previewVariant =
    previewIndex >= 0 && previewIndex < COURSE_TONE_COUNT ? COURSE_TONE_CARD[previewIndex] : null

  return (
    <Dialog open={p.open} onOpenChange={(next) => !next && p.onClose()}>
      <DialogContent className="max-w-sm rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-lg dark:border-background/20 dark:bg-foreground dark:text-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </span>
            {p.editing ? "重命名课程" : "新建课程"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground dark:text-background/60">
            {p.editing ? "改名后该课程下的笔记会自动跟着换名字" : "给新课程起个好记的名字"}
          </p>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground dark:text-background/60">课程名称</label>
          <input
            autoFocus
            value={p.nameDraft}
            disabled={p.saving}
            maxLength={30}
            onChange={(e) => p.onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") p.onSave()
            }}
            placeholder="例如：线性代数"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:shadow-focus dark:border-background/20 dark:bg-background/10 dark:text-background"
          />
          <p className="font-mono text-xs text-muted-foreground dark:text-background/50">{p.nameDraft.length} / 30</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground dark:text-background/60">卡片颜色</label>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={p.saving}
              aria-label="自动配色"
              aria-pressed={p.colorDraft === COURSE_TONE_AUTO}
              onClick={() => p.onColorChange(COURSE_TONE_AUTO)}
              className={`${dotBase} border-dashed ${
                p.colorDraft === COURSE_TONE_AUTO
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                  : "border-border/60 bg-muted/40 text-muted-foreground hover:border-primary/50 dark:border-background/30 dark:bg-background/10 dark:text-background/60"
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <span className="mr-1 text-xs text-muted-foreground dark:text-background/50">自动</span>
            {Array.from({ length: COURSE_TONE_COUNT }, (_, tone) => {
              const selected = p.colorDraft === tone + 1
              return (
                <button
                  key={tone}
                  type="button"
                  disabled={p.saving}
                  aria-label={`手动配色第 ${tone + 1} 档`}
                  aria-pressed={selected}
                  onClick={() => p.onColorChange(tone + 1)}
                  className={`${dotBase} ${DOT_SURFACE[tone]} ${
                    selected ? "scale-110 border-primary ring-2 ring-primary/30" : "border-border/50 hover:scale-105 dark:border-background/25"
                  } ${COURSE_TONE_DOT_FOREGROUND[tone]}`}
                >
                  {selected ? <Check className="h-4 w-4" /> : null}
                </button>
              )
            })}
          </div>

          {previewVariant ? (
            <div className={`rounded-2xl border px-4 py-3 shadow-sm ${previewVariant.surface}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold break-all">
                  {p.nameDraft.trim() || "课程名预览"}
                </span>
                <span className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-xs font-bold ${previewVariant.chip}`}>
                  {p.colorDraft === COURSE_TONE_AUTO ? "自动" : "手动"}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-75">
                {p.colorDraft === COURSE_TONE_AUTO ? "按课程顺序自动配色" : "已手动指定，将始终用这个颜色"}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground dark:border-background/25 dark:text-background/50">
              新课程会按排列顺序自动配色，之后随时能改
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={p.onClose}
            disabled={p.saving}
            className={`${btnBase} border border-border font-semibold transition-colors hover:border-primary dark:border-background/20 dark:text-background`}
          >
            取消
          </button>
          <button
            type="button"
            onClick={p.onSave}
            disabled={p.saving || !p.nameDraft.trim()}
            className={`${btnBase} bg-primary font-bold text-primary-foreground shadow-sm transition-shadow hover:shadow-md`}
          >
            {p.saving ? "保存中…" : p.editing ? "保存修改" : "创建课程"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
