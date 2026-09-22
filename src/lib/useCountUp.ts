import { useEffect, useRef, useState } from "react"

// 数字滚动：数值变化时用 easeOut 平滑计数（约 0.45s），首次加载从 0 起跳。
// 系统开启「减弱动态效果」时直接显示目标值，不做动画。
export function useCountUp(target: number): number {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    // 系统「减弱动态效果」或应用内设置关掉动效时，直接显示目标值
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("motion-off")
    if (reduced) {
      setDisplay(target)
      fromRef.current = target
      return
    }
    const from = fromRef.current
    if (from === target) return
    const start = performance.now()
    const duration = 450
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        fromRef.current = target
      }
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target])

  return display
}
