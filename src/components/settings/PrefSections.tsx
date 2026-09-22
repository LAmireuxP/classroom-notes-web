import { Moon, Sun, Type, Zap } from "lucide-react"
import type { ThemePref } from "@/lib/prefs"

// 外观主题 / 动效开关 / 字体大小 三个偏好分区（原 SettingsDialog 同款交互整页化）。

interface PrefSectionsProps {
  mode: ThemePref
  motionOn: boolean
  fontLarge: boolean
  onTheme: (next: ThemePref) => void
  onToggleMotion: () => void
  onFont: (large: boolean) => void
}

const sectionLabel = "mb-2 text-xs font-bold text-muted-foreground dark:text-background/60"

const segWrap =
  "flex gap-1 rounded-2xl border border-border bg-secondary/50 p-1 dark:border-background/15 dark:bg-background/5"

function segBtn(active: boolean): string {
  return `flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus ${
    active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:text-foreground dark:text-background/60 dark:hover:text-background"
  }`
}

export function PrefSections(p: PrefSectionsProps) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <p className={sectionLabel}>外观主题</p>
      <div className={segWrap}>
        <button
          type="button"
          aria-pressed={p.mode === "light"}
          onClick={() => p.onTheme("light")}
          className={segBtn(p.mode === "light")}
        >
          <Sun className="h-4 w-4" /> 浅色
        </button>
        <button
          type="button"
          aria-pressed={p.mode === "dark"}
          onClick={() => p.onTheme("dark")}
          className={segBtn(p.mode === "dark")}
        >
          <Moon className="h-4 w-4" /> 深色
        </button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground dark:text-background/50">
        和首页右上角的太阳/月亮按钮是同一份偏好
      </p>

      <p className={`${sectionLabel} mt-6`}>动效</p>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm dark:border-background/15 dark:bg-background/5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold">界面动效</p>
            <p className="mt-0.5 text-xs text-muted-foreground dark:text-background/60">
              入场动画、数字滚动、滑动切页提示等
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={p.motionOn}
          aria-label="界面动效开关"
          onClick={p.onToggleMotion}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:shadow-focus ${
            p.motionOn ? "bg-primary" : "bg-muted dark:bg-background/15"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-background shadow transition-all duration-300 dark:bg-foreground ${
              p.motionOn ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      <p className={`${sectionLabel} mt-6`}>字体大小</p>
      <div className={segWrap}>
        <button
          type="button"
          aria-pressed={!p.fontLarge}
          onClick={() => p.onFont(false)}
          className={segBtn(!p.fontLarge)}
        >
          <Type className="h-4 w-4" /> 标准
        </button>
        <button
          type="button"
          aria-pressed={p.fontLarge}
          onClick={() => p.onFont(true)}
          className={segBtn(p.fontLarge)}
        >
          <Type className="h-5 w-5" /> 大
        </button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground dark:text-background/50">
        整个应用的文字一起放大，看小字费劲时打开
      </p>
    </section>
  )
}
