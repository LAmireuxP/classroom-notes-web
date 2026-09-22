// 全局偏好：主题与动效（顶栏按钮、底栏设置弹窗、启动初始化共用一份读写）

const THEME_KEY = "ketangzhengli-theme"
const MOTION_KEY = "ketangzhengli-motion"
const FONT_KEY = "ketangzhengli-font"
export const PRIMARY_KEY = "ketangzhengli-primary"
export const BG_KEY = "ketangzhengli-bg"

export type ThemePref = "light" | "dark"

export function readThemePref(): ThemePref {
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"
}

/** 写偏好 + 切换 .dark + 广播给页面同步状态（首页顶栏按钮等） */
export function applyTheme(mode: ThemePref): void {
  window.localStorage.setItem(THEME_KEY, mode)
  document.documentElement.classList.toggle("dark", mode === "dark")
  window.dispatchEvent(new CustomEvent("ktzl:theme-changed", { detail: mode }))
}

/** 启动时按已存偏好套用主题（不广播；页面各自初始化自己的状态） */
export function applyStoredTheme(): void {
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === "dark" || stored === "light") {
    document.documentElement.classList.toggle("dark", stored === "dark")
  }
}

export function readMotionEnabled(): boolean {
  return window.localStorage.getItem(MOTION_KEY) !== "off"
}

/** 动效开关：关闭时 html 挂 .motion-off，全局停用动画/过渡 */
export function applyMotionPref(enabled: boolean): void {
  window.localStorage.setItem(MOTION_KEY, enabled ? "on" : "off")
  document.documentElement.classList.toggle("motion-off", !enabled)
}

export function readFontLarge(): boolean {
  return window.localStorage.getItem(FONT_KEY) === "large"
}

/** 字体大小：大字号时 html 挂 .font-large，整体放大 1.125 倍 */
export function applyFontPref(large: boolean): void {
  window.localStorage.setItem(FONT_KEY, large ? "large" : "normal")
  document.documentElement.classList.toggle("font-large", large)
}

// ---- 自定义主题颜色（主色 + 页面底色）----
// 全部走 documentElement 的 inline CSS 变量覆写：优先级高于 :root/.dark，
// 深浅两模式共用主色；底色只影响浅色基底（深色模式沿用 dark: 类翻转约定）。

/** 底色自定义时会一并覆写/清除的变量清单 */
const BG_VARS = [
  "--background",
  "--card",
  "--popover",
  "--secondary",
  "--muted",
  "--accent",
  "--border",
  "--input",
] as const

const PRIMARY_VARS = ["--primary", "--ring", "--primary-foreground"] as const

function normalizeHex(hex: string): string | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
  return m ? `#${m[1].toLowerCase()}` : null
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const [r0, g0, b0] = hexToRgb(hex).map((v) => v / 255)
  const max = Math.max(r0, g0, b0)
  const min = Math.min(r0, g0, b0)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r0) h = ((g0 - b0) / d + (g0 < b0 ? 6 : 0)) * 60
    else if (max === g0) h = ((b0 - r0) / d + 2) * 60
    else h = ((r0 - g0) / d + 4) * 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/** WCAG 相对亮度，用于自动挑主色前景（黑字/白字） */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function hslValue(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`
}

function clampL(l: number): number {
  return Math.max(0, Math.min(100, l))
}

export function readPrimaryHex(): string | null {
  const stored = window.localStorage.getItem(PRIMARY_KEY)
  return stored ? normalizeHex(stored) : null
}

/** 主色：hex→HSL 写 --primary/--ring，前景按亮度自动黑/白；null=恢复出厂 */
export function applyPrimaryColor(hex: string | null): void {
  const rootStyle = document.documentElement.style
  const normalized = hex ? normalizeHex(hex) : null
  if (!normalized) {
    window.localStorage.removeItem(PRIMARY_KEY)
    for (const key of PRIMARY_VARS) rootStyle.removeProperty(key)
    return
  }
  const { h, s, l } = hexToHsl(normalized)
  rootStyle.setProperty("--primary", hslValue(h, s, l))
  rootStyle.setProperty("--ring", hslValue(h, s, l))
  rootStyle.setProperty(
    "--primary-foreground",
    relativeLuminance(normalized) > 0.45 ? "0 0% 7%" : "0 0% 100%",
  )
  window.localStorage.setItem(PRIMARY_KEY, normalized)
}

export function readBgHex(): string | null {
  const stored = window.localStorage.getItem(BG_KEY)
  return stored ? normalizeHex(stored) : null
}

/**
 * 底色：--background 设为所选色，其余按明度自动配平——
 * card/popover 亮一档（接近白则纯白）、secondary/muted/accent 深 2-3%、
 * border/input 深 8-10%；--foreground 保持近黑不动。null=恢复出厂。
 */
export function applyBgColor(hex: string | null): void {
  const rootStyle = document.documentElement.style
  const normalized = hex ? normalizeHex(hex) : null
  if (!normalized) {
    window.localStorage.removeItem(BG_KEY)
    for (const key of BG_VARS) rootStyle.removeProperty(key)
    return
  }
  const { h, s, l } = hexToHsl(normalized)
  const cardL = l >= 97 ? 100 : clampL(l + 3)
  const sinkL = clampL(l - 2.5)
  const lineL = clampL(l - 9)
  rootStyle.setProperty("--background", hslValue(h, s, l))
  rootStyle.setProperty("--card", hslValue(h, s, cardL))
  rootStyle.setProperty("--popover", hslValue(h, s, cardL))
  rootStyle.setProperty("--secondary", hslValue(h, s, sinkL))
  rootStyle.setProperty("--muted", hslValue(h, s, sinkL))
  rootStyle.setProperty("--accent", hslValue(h, s, sinkL))
  rootStyle.setProperty("--border", hslValue(h, s, lineL))
  rootStyle.setProperty("--input", hslValue(h, s, lineL))
  window.localStorage.setItem(BG_KEY, normalized)
}

/** 恢复出厂配色：清掉全部自定义颜色 inline 覆写 + 存储 */
export function clearCustomColors(): void {
  applyPrimaryColor(null)
  applyBgColor(null)
}

/** 启动时套用已存的自定义颜色（BottomNav 挂载时调用） */
export function applyStoredColors(): void {
  const primary = readPrimaryHex()
  if (primary) applyPrimaryColor(primary)
  const bg = readBgHex()
  if (bg) applyBgColor(bg)
}
