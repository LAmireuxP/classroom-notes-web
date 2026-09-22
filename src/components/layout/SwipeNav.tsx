import { createContext, useRef, useState, type ReactNode, type TouchEvent } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"

// 滑动进行中即将进入的页面路径（无滑动为 null），供底部导航预亮目标页签
export const SwipePreviewContext = createContext<string | null>(null)

// 应用式左右滑动切页：首页 ← 课程 ← 待办（顺序与底部导航一致）。
// 手指横滑时同侧边缘亮起方向提示，滑够距离松手即切页；
// 横向滚动区（课程筛选标签）与按钮/输入框上起手不劫持。

const TAB_PATHS = ["/", "/courses", "/todos"]
const TAB_LABELS = ["首页", "课程", "待办"]
const MIN_DX = 64
const MAX_VISUAL = 120

export function SwipeNav({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const dragRef = useRef(0)
  const [drag, setDrag] = useState(0)

  const tabIndex = pathname.startsWith("/courses") ? 1 : pathname.startsWith("/todos") ? 2 : 0

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest("[data-no-swipe]") || target.closest("button, input, textarea, [role='button']")) return
    const t = e.touches[0]
    startRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
    dragRef.current = 0
  }

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const s = startRef.current
    if (!s) return
    const t = e.touches[0]
    const dx = t.clientX - s.x
    const dy = t.clientY - s.y
    // 竖向滚动意图明确：放弃本次滑动
    if (Math.abs(dy) > Math.max(Math.abs(dx) * 1.5, 24)) {
      startRef.current = null
      dragRef.current = 0
      setDrag(0)
      return
    }
    if (Math.abs(dx) > 8) {
      const clamped = Math.max(-MAX_VISUAL, Math.min(MAX_VISUAL, dx))
      dragRef.current = clamped
      setDrag(clamped)
    }
  }

  const endSwipe = () => {
    const s = startRef.current
    const dx = dragRef.current
    const elapsed = s ? Date.now() - s.t : 0
    startRef.current = null
    dragRef.current = 0
    setDrag(0)
    if (!s || Math.abs(dx) < MIN_DX || elapsed > 800) return
    const nextIndex = tabIndex + (dx < 0 ? 1 : -1)
    if (nextIndex < 0 || nextIndex >= TAB_PATHS.length) return
    navigate(TAB_PATHS[nextIndex])
  }

  const showRight = drag < 0 && tabIndex < TAB_PATHS.length - 1
  const showLeft = drag > 0 && tabIndex > 0
  const intensity = Math.min(Math.abs(drag) / MAX_VISUAL, 1)
  const targetLabel = drag < 0 ? TAB_LABELS[tabIndex + 1] : TAB_LABELS[tabIndex - 1]

  const previewPath = showRight
    ? TAB_PATHS[tabIndex + 1]
    : showLeft
      ? TAB_PATHS[tabIndex - 1]
      : null

  return (
    <SwipePreviewContext.Provider value={previewPath}>
    <div
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={endSwipe}
      onTouchCancel={endSwipe}
    >
      {children}
      {showRight ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-y-0 right-0 z-50 flex w-20 items-center justify-end bg-gradient-to-l from-primary/20 to-transparent pr-3"
          style={{ opacity: intensity }}
        >
          <span className="flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-md">
            {targetLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      ) : null}
      {showLeft ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-y-0 left-0 z-50 flex w-20 items-center justify-start bg-gradient-to-r from-primary/20 to-transparent pl-3"
          style={{ opacity: intensity }}
        >
          <span className="flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-md">
            <ChevronLeft className="h-3.5 w-3.5" />
            {targetLabel}
          </span>
        </div>
      ) : null}
    </div>
    </SwipePreviewContext.Provider>
  )
}
