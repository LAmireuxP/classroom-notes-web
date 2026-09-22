import { useContext, useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { BookOpen, CheckSquare, Home as HomeIcon, Mic, PenLine, Plus, Settings } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SwipePreviewContext } from "./SwipeNav"
import { VoiceCaptureDialog } from "./VoiceCaptureDialog"
import {
  applyFontPref,
  applyMotionPref,
  applyStoredColors,
  applyStoredTheme,
  readFontLarge,
  readMotionEnabled,
} from "@/lib/prefs"

// 应用式底部导航（5 格对称）：首页 / 课程 / 中间创建 / 待办 / 设置。
// 中间「+」弹创建方式卡：语音速记 或 手写笔记（非首页时手写会跳回首页打开编辑卡）。

interface BottomNavProps {
  /** 首页传入时「手写笔记」直接打开编辑卡；其他页面不传，走跳转 */
  onCreate?: () => void
}

const tabBase =
  "flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:shadow-focus"

function tabClass(isActive: boolean): string {
  return `${tabBase} ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground dark:text-background/50 dark:hover:text-background"}`
}

export function BottomNav({ onCreate }: BottomNavProps) {
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  // 滑动切页进行中：目标页签跟随预亮
  const previewPath = useContext(SwipePreviewContext)

  // 底栏各页常驻：启动时把已存的主题、动效、字体与自定义颜色套到当前文档
  useEffect(() => {
    applyStoredTheme()
    applyMotionPref(readMotionEnabled())
    applyFontPref(readFontLarge())
    applyStoredColors()
  }, [])

  const startManualCreate = () => {
    setCreateOpen(false)
    if (onCreate) {
      onCreate()
      return
    }
    navigate("/?new=1")
  }

  const startVoiceCreate = () => {
    setCreateOpen(false)
    setVoiceOpen(true)
  }

  const optionCard =
    "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/60 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus dark:border-background/20 dark:bg-background/10"

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md dark:border-background/15 dark:bg-foreground/95">
        <div className="mx-auto flex w-full max-w-md items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
          <NavLink to="/" end className={({ isActive }) => tabClass(isActive || previewPath === "/")}>
            <HomeIcon className="h-5 w-5" />
            <span>首页</span>
          </NavLink>
          <NavLink to="/courses" className={({ isActive }) => tabClass(isActive || previewPath === "/courses")}>
            <BookOpen className="h-5 w-5" />
            <span>课程</span>
          </NavLink>
          <div className="flex h-14 flex-1 items-center justify-center">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              aria-label="创建"
              className={`grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-95 focus-visible:outline-none focus-visible:shadow-focus ${createOpen ? "ring-2 ring-primary/40" : ""}`}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <NavLink to="/todos" className={({ isActive }) => tabClass(isActive || previewPath === "/todos")}>
            <CheckSquare className="h-5 w-5" />
            <span>待办</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => tabClass(isActive)}>
            <Settings className="h-5 w-5" />
            <span>设置</span>
          </NavLink>
        </div>
      </nav>

      {/* 创建方式卡：语音 / 手写 二选一，收拢原先重复的入口 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xs rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-lg dark:border-background/20 dark:bg-foreground dark:text-background">
          <p className="text-center font-display text-base font-bold">想怎么记？</p>
          <div className="mt-4 space-y-3">
            <button type="button" onClick={startVoiceCreate} className={optionCard}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Mic className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">语音速记</span>
                <span className="block text-xs text-muted-foreground dark:text-background/60">
                  开口说，自动变文字，可存待办或笔记
                </span>
              </span>
            </button>
            <button type="button" onClick={startManualCreate} className={optionCard}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground dark:bg-background/10 dark:text-background">
                <PenLine className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">手写笔记</span>
                <span className="block text-xs text-muted-foreground dark:text-background/60">
                  打开编辑卡，打字排版插图都行
                </span>
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <VoiceCaptureDialog open={voiceOpen} onOpenChange={setVoiceOpen} />
    </>
  )
}
