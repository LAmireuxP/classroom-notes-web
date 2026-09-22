import type { NoteRecord, TodoRecord } from "@/pages/Home/useHome"

// 首页「学习概览」统计：整月记录热力日历 + 连续记录天数 + 本周新增。
// 纯函数，数据来自已有的 notes/todos（按 created 归日），不依赖后端新字段。

export interface MonthCell {
  key: string
  /** YYYY-MM-DD；占位空格为 "" */
  date: string
  /** 当月第几天；占位空格为 0 */
  dayNum: number
  count: number
  /** false = 月初对齐用的占位空格 */
  inMonth: boolean
  isToday: boolean
  /** 当月但晚于今天（还没到，不上色） */
  isFuture: boolean
}

export interface StudyStats {
  monthLabel: string
  cells: MonthCell[]
  maxCount: number
  /** 连续有记录的天数（今天没记录则从昨天起算，不断链） */
  streak: number
  weekNotes: number
  weekTodos: number
  doneTodos: number
  totalNotes: number
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** 活跃强度分档 0-4，用于热力格上色 */
export function heatLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (maxCount <= 1) return 4
  const ratio = count / maxCount
  if (ratio >= 0.75) return 4
  if (ratio >= 0.5) return 3
  if (ratio >= 0.25) return 2
  return 1
}

export function computeStudyStats(
  notes: NoteRecord[],
  todos: TodoRecord[],
  today: Date = new Date(),
): StudyStats {
  const activeNotes = notes.filter((n) => !n.deleted)

  const counts = new Map<string, number>()
  const bump = (iso?: string) => {
    if (!iso) return
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return
    const k = dateKey(d)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  for (const n of activeNotes) bump(n.created)
  for (const t of todos) bump(t.created)

  const year = today.getFullYear()
  const month = today.getMonth()
  const todayKey = dateKey(today)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // 周一为一周第一天：1 号前需要补的占位格数
  const leadBlanks = (new Date(year, month, 1).getDay() + 6) % 7

  const cells: MonthCell[] = []
  for (let i = 0; i < leadBlanks; i++) {
    cells.push({ key: `blank-${i}`, date: "", dayNum: 0, count: 0, inMonth: false, isToday: false, isFuture: false })
  }
  let maxCount = 1
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    const key = dateKey(d)
    const count = counts.get(key) ?? 0
    if (d <= today && count > maxCount) maxCount = count
    cells.push({
      key,
      date: key,
      dayNum: day,
      count,
      inMonth: true,
      isToday: key === todayKey,
      isFuture: d > today,
    })
  }

  // 连续记录天数：今天有记录从今天起算，否则从昨天起算（今天还没记不算断）
  let streak = 0
  const cursor = new Date(today)
  if ((counts.get(dateKey(cursor)) ?? 0) === 0) cursor.setDate(cursor.getDate() - 1)
  while ((counts.get(dateKey(cursor)) ?? 0) > 0) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // 本周（周一为一周起点）
  const startOfWeek = new Date(today)
  startOfWeek.setHours(0, 0, 0, 0)
  startOfWeek.setDate(today.getDate() - (today.getDay() + 6) % 7)
  const inWeek = (iso?: string) => {
    if (!iso) return false
    const d = new Date(iso)
    return !Number.isNaN(d.getTime()) && d >= startOfWeek && d <= today
  }

  return {
    monthLabel: `${year} 年 ${month + 1} 月`,
    cells,
    maxCount,
    streak,
    weekNotes: activeNotes.filter((n) => inWeek(n.created)).length,
    weekTodos: todos.filter((t) => inWeek(t.created)).length,
    doneTodos: todos.filter((t) => t.done).length,
    totalNotes: activeNotes.length,
  }
}
