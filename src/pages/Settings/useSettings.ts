import { useEffect, useState } from "react"
import { getPocketBaseUrl } from "@/lib/pb"
import {
  applyBgColor,
  applyFontPref,
  applyMotionPref,
  applyPrimaryColor,
  applyTheme,
  clearCustomColors,
  readBgHex,
  readFontLarge,
  readMotionEnabled,
  readPrimaryHex,
  readThemePref,
  type ThemePref,
} from "@/lib/prefs"

// 设置页 Logic：外观主题 / 动效 / 字体 / 自定义主题颜色 / 数据导出与清空。
// 导出备份与清空数据的实现自原 SettingsDialog 整体迁移。

export interface ColorSwatch {
  label: string
  hex: string
}

export const DEFAULT_PRIMARY_HEX = "#2563eb"
export const DEFAULT_BG_HEX = "#ffffff"

/** 主色预设色板（hex 只作为色板选项数据存在，View 渲染色点专用） */
export const PRIMARY_SWATCHES: ColorSwatch[] = [
  { label: "默认蓝", hex: DEFAULT_PRIMARY_HEX },
  { label: "墨黑", hex: "#171717" },
  { label: "暖橙", hex: "#ea7317" },
  { label: "草绿", hex: "#16a34a" },
  { label: "紫罗兰", hex: "#7c3aed" },
  { label: "砖红", hex: "#dc2626" },
]

/** 背景底色预设色板 */
export const BG_SWATCHES: ColorSwatch[] = [
  { label: "默认白", hex: DEFAULT_BG_HEX },
  { label: "米白", hex: "#faf7f2" },
  { label: "淡蓝", hex: "#f2f7fc" },
  { label: "淡绿", hex: "#f3faf5" },
  { label: "淡灰", hex: "#f5f5f6" },
  { label: "淡黄", hex: "#fdf9ef" },
]

interface NoteRow {
  id: string
  title: string
  content: string
  course: string
  created: string
}
interface CourseRow {
  id: string
  name: string
  created: string
}
interface TodoRow {
  id: string
  content: string
  done: boolean
  due: string
  created: string
}
interface ListResult<T> {
  items: T[]
}

async function fetchList<T>(collection: string): Promise<T[]> {
  const resp = await fetch(
    `${getPocketBaseUrl()}/api/collections/${collection}/records?perPage=500&sort=-created`,
  )
  if (!resp.ok) throw new Error(`读取${collection}失败 (${resp.status})`)
  const data = (await resp.json()) as ListResult<T>
  return data.items
}

function formatDate(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("zh-CN", { hour12: false })
}

function buildMarkdown(notes: NoteRow[], courses: CourseRow[], todos: TodoRow[]): string {
  const lines: string[] = []
  lines.push("# 课堂整理 · 数据备份")
  lines.push("")
  lines.push(`导出时间：${formatDate(new Date().toISOString())}`)
  lines.push("")
  lines.push(`## 课程（${courses.length}）`)
  lines.push("")
  for (const c of courses) lines.push(`- ${c.name}`)
  lines.push("")
  lines.push(`## 笔记（${notes.length}）`)
  lines.push("")
  for (const n of notes) {
    lines.push(`### ${n.title || "无标题"}`)
    lines.push("")
    lines.push(`> 课程：${n.course || "未分类"} · ${formatDate(n.created)}`)
    lines.push("")
    lines.push(n.content || "（空）")
    lines.push("")
  }
  lines.push(`## 待办（${todos.length}）`)
  lines.push("")
  for (const t of todos) {
    const due = t.due ? `（截止 ${t.due}）` : ""
    lines.push(`- [${t.done ? "x" : " "}] ${t.content}${due}`)
  }
  lines.push("")
  return lines.join("\n")
}

export function useSettings() {
  const [mode, setMode] = useState<ThemePref>("light")
  const [motionOn, setMotionOn] = useState(true)
  const [fontLarge, setFontLarge] = useState(false)
  const [primaryHex, setPrimaryHex] = useState<string | null>(null)
  const [bgHex, setBgHex] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [busy, setBusy] = useState<"export" | "clear" | null>(null)
  const [statusText, setStatusText] = useState("")
  const [errorText, setErrorText] = useState("")

  // 进场读一遍已存偏好（主题/动效/字体已由 BottomNav 启动时套用到文档）
  useEffect(() => {
    setMode(readThemePref())
    setMotionOn(readMotionEnabled())
    setFontLarge(readFontLarge())
    setPrimaryHex(readPrimaryHex())
    setBgHex(readBgHex())
  }, [])

  // 主题可能在别处被改（首页顶栏太阳/月亮按钮），跟随广播同步分段器
  useEffect(() => {
    const onThemeChanged = () => setMode(readThemePref())
    window.addEventListener("ktzl:theme-changed", onThemeChanged)
    return () => window.removeEventListener("ktzl:theme-changed", onThemeChanged)
  }, [])

  const flash = (text: string) => {
    setStatusText(text)
    window.setTimeout(() => setStatusText(""), 2500)
  }

  const onTheme = (next: ThemePref) => {
    setMode(next)
    applyTheme(next)
  }

  const onToggleMotion = () => {
    const next = !motionOn
    setMotionOn(next)
    applyMotionPref(next)
  }

  const onFont = (large: boolean) => {
    setFontLarge(large)
    applyFontPref(large)
  }

  const onPickPrimary = (hex: string) => {
    applyPrimaryColor(hex)
    setPrimaryHex(readPrimaryHex())
  }

  const onPickBg = (hex: string) => {
    applyBgColor(hex)
    setBgHex(readBgHex())
  }

  const onResetColors = () => {
    clearCustomColors()
    setPrimaryHex(null)
    setBgHex(null)
    flash("已恢复出厂配色")
  }

  const onExport = async () => {
    if (busy) return
    setBusy("export")
    setErrorText("")
    try {
      const [notes, courses, todos] = await Promise.all([
        fetchList<NoteRow>("notes"),
        fetchList<CourseRow>("courses"),
        fetchList<TodoRow>("todos"),
      ])
      const md = buildMarkdown(notes, courses, todos)
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `课堂整理备份-${new Date().toISOString().slice(0, 10)}.md`
      a.click()
      URL.revokeObjectURL(url)
      flash(`已导出 ${notes.length} 条笔记 · ${todos.length} 条待办`)
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "导出失败，请稍后重试")
    } finally {
      setBusy(null)
    }
  }

  const openClearConfirm = () => setConfirmClear(true)
  const cancelClearConfirm = () => setConfirmClear(false)

  const onClear = async () => {
    if (busy) return
    setBusy("clear")
    setErrorText("")
    try {
      const [notes, courses, todos] = await Promise.all([
        fetchList<NoteRow>("notes"),
        fetchList<CourseRow>("courses"),
        fetchList<TodoRow>("todos"),
      ])
      const base = getPocketBaseUrl()
      for (const [collection, rows] of [
        ["notes", notes],
        ["todos", todos],
        ["courses", courses],
      ] as const) {
        for (const row of rows) {
          const resp = await fetch(`${base}/api/collections/${collection}/records/${row.id}`, {
            method: "DELETE",
          })
          if (!resp.ok) throw new Error(`清空${collection}失败 (${resp.status})`)
        }
      }
      window.dispatchEvent(new CustomEvent("ktzl:data-changed"))
      setConfirmClear(false)
      flash("已清空全部数据")
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "清空失败，请稍后重试")
    } finally {
      setBusy(null)
    }
  }

  return {
    mode,
    motionOn,
    fontLarge,
    primaryHex,
    bgHex,
    // 色板数据与派生展示值（View 不接触 hex 字面量）
    primarySwatches: PRIMARY_SWATCHES,
    bgSwatches: BG_SWATCHES,
    primaryActive: primaryHex ?? DEFAULT_PRIMARY_HEX,
    bgActive: bgHex ?? DEFAULT_BG_HEX,
    primaryInputValue: primaryHex ?? DEFAULT_PRIMARY_HEX,
    bgInputValue: bgHex ?? DEFAULT_BG_HEX,
    colorsCustomized: primaryHex !== null || bgHex !== null,
    confirmClear,
    busy,
    statusText,
    errorText,
    onTheme,
    onToggleMotion,
    onFont,
    onPickPrimary,
    onPickBg,
    onResetColors,
    openClearConfirm,
    cancelClearConfirm,
    onExport,
    onClear,
  }
}
