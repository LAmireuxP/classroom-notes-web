import { useEffect, useState } from "react"
import { MonitorSmartphone, Sparkles, X } from "lucide-react"

// 安装引导：安卓 Chrome 在满足条件时会抛出"可安装"事件，这里接住并弹一条可关闭的引导条。
// 已加到桌面（独立窗口打开）或用户关过两次就不再打扰。

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "ketangzhengli-install-dismissed"

function isStandalone(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  // iOS Safari 专用标记
  return (navigator as unknown as { standalone?: boolean }).standalone === true
}

function readDismissCount(): number {
  const raw = Number(window.localStorage.getItem(DISMISS_KEY))
  return Number.isFinite(raw) ? raw : 0
}

export function InstallHint() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone() || readDismissCount() >= 2) return
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  // 已经装上了（比如引导条还开着就通过菜单装了），直接收起来
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)")
    const onChange = () => mq.matches && setVisible(false)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  if (!visible || !promptEvent) return null

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(readDismissCount() + 1))
    setVisible(false)
  }

  const onInstall = async () => {
    try {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === "accepted") {
        window.localStorage.setItem(DISMISS_KEY, "99")
      }
      setVisible(false)
    } catch {
      // 个别浏览器不支持编程触发，保持引导条可见，用户可走浏览器菜单
    }
    setPromptEvent(null)
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4"
      style={{ bottom: "calc(6.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto flex w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 items-center gap-3 rounded-2xl border border-border bg-card/95 p-3.5 shadow-lg backdrop-blur-md dark:border-background/20 dark:bg-foreground/95">
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
        >
          <MonitorSmartphone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-card-foreground dark:text-background">
            把「课堂整理」加到主屏幕
          </p>
          <p className="truncate text-xs text-muted-foreground dark:text-background/60">
            全屏打开、独立图标，像应用一样顺手
          </p>
        </div>
        <button
          type="button"
          onClick={onInstall}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"
        >
          <Sparkles className="h-3.5 w-3.5" /> 添加
        </button>
        <button
          type="button"
          aria-label="关闭安装引导"
          onClick={dismiss}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-all hover:bg-muted active:scale-95 focus-visible:outline-none focus-visible:shadow-focus dark:text-background/60 dark:hover:bg-background/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
