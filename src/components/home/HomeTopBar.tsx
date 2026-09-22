import { Moon, Sun } from "lucide-react"
import type { ThemeMode } from "@/pages/Home/useHome"

interface HomeTopBarProps {
  themeMode: ThemeMode
  onSetTheme: (next: ThemeMode) => void
}

// 右上角深浅切换：太阳/月亮同位轮换——切深色时太阳旋转缩小落下、月亮升起，反之亦然
export function HomeTopBar(p: HomeTopBarProps) {
  const dark = p.themeMode === "dark"
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-md dark:border-background/15 dark:bg-foreground/80">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-base font-bold text-primary-foreground shadow-sm"
          >
            课
          </span>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">课堂整理</h1>
            <p className="font-mono text-xs leading-tight text-muted-foreground dark:text-background/60">
              NOTES · COURSES · TODO
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => p.onSetTheme(dark ? "light" : "dark")}
          aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
          title={dark ? "切换到浅色模式" : "切换到深色模式"}
          className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary active:scale-90 focus-visible:outline-none focus-visible:shadow-focus dark:border-background/20 dark:bg-background/10 dark:text-background"
        >
          <Sun
            aria-hidden
            className={`absolute h-5 w-5 transition-all duration-500 ease-out ${
              dark ? "-rotate-[120deg] scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <Moon
            aria-hidden
            className={`absolute h-5 w-5 transition-all duration-500 ease-out ${
              dark ? "rotate-0 scale-100 opacity-100" : "rotate-[120deg] scale-0 opacity-0"
            }`}
          />
        </button>
      </div>
    </header>
  )
}
