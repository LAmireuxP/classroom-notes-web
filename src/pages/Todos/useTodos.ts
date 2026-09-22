import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getPocketBaseUrl } from "@/lib/pb"

export interface TodoRecord {
  id: string
  content: string
  done: boolean
  due?: string
  created: string
  updated: string
}

interface ListResult<T> {
  items: T[]
  totalItems: number
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${getPocketBaseUrl()}/api/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!resp.ok) {
    throw new Error(`请求失败 (${resp.status})`)
  }
  return (await resp.json()) as T
}

/** 本地今天的 YYYY-MM-DD（不用 UTC 解析，避免时区偏移） */
export function todayDateStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** "2026-09-25" → "9月25日" */
export function formatDueLabel(due: string): string {
  const parts = due.trim().split("-")
  if (parts.length !== 3) return due
  const m = Number(parts[1])
  const d = Number(parts[2])
  if (!Number.isFinite(m) || !Number.isFinite(d)) return due
  return `${m}月${d}日`
}

export type DueTone = "none" | "today" | "overdue" | "future"

/** 日期标签语气：无日期 / 今天 / 已逾期 / 未来 */
export function dueTone(due?: string): DueTone {
  const v = (due ?? "").trim()
  if (!v) return "none"
  const today = todayDateStr()
  if (v === today) return "today"
  return v < today ? "overdue" : "future"
}

/** 未完成区排序档位：逾期 0 → 今天 1 → 最近到期 2 → 无日期 3 */
function dueRank(due?: string): number {
  const tone = dueTone(due)
  if (tone === "overdue") return 0
  if (tone === "today") return 1
  if (tone === "future") return 2
  return 3
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoRecord[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [todoDraft, setTodoDraft] = useState("")
  const [dueDraft, setDueDraft] = useState("")
  const [todoAdding, setTodoAdding] = useState(false)
  const [togglingIds, setTogglingIds] = useState<string[]>([])
  const [dueSavingIds, setDueSavingIds] = useState<string[]>([])

  const didInit = useRef(false)

  const refreshTodos = useCallback(async () => {
    setLoadError(null)
    try {
      const res = await requestJson<ListResult<TodoRecord>>("todos?perPage=200")
      setTodos(res.items)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "数据加载失败，请稍后重试")
    }
  }, [])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    void (async () => {
      setDataLoading(true)
      await refreshTodos()
      setDataLoading(false)
    })()
  }, [refreshTodos])

  // 底部栏「语音速记」存了待办后刷新列表
  useEffect(() => {
    const onDataChanged = () => void refreshTodos()
    window.addEventListener("ktzl:data-changed", onDataChanged)
    return () => window.removeEventListener("ktzl:data-changed", onDataChanged)
  }, [refreshTodos])

  const addTodo = useCallback(async () => {
    const trimmed = todoDraft.trim()
    if (!trimmed || todoAdding) return
    setTodoAdding(true)
    try {
      await requestJson<TodoRecord>("todos", {
        method: "POST",
        body: JSON.stringify({ content: trimmed, done: false, due: dueDraft.trim() }),
      })
      setTodoDraft("")
      setDueDraft("")
      await refreshTodos()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "添加待办失败，请重试")
    } finally {
      setTodoAdding(false)
    }
  }, [todoDraft, dueDraft, todoAdding, refreshTodos])

  const toggleTodo = useCallback(
    async (todo: TodoRecord) => {
      if (togglingIds.includes(todo.id)) return
      const nextDone = !todo.done
      setTogglingIds((prev) => [...prev, todo.id])
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, done: nextDone } : t)))
      try {
        await requestJson<TodoRecord>(`todos/${todo.id}`, {
          method: "PATCH",
          body: JSON.stringify({ done: nextDone }),
        })
        await refreshTodos()
      } catch (err) {
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, done: todo.done } : t)))
        setLoadError(err instanceof Error ? err.message : "更新待办状态失败，请重试")
      } finally {
        setTogglingIds((prev) => prev.filter((id) => id !== todo.id))
      }
    },
    [togglingIds, refreshTodos],
  )

  /** 改期 / 清除日期：乐观更新，失败回滚 */
  const updateTodoDue = useCallback(
    async (todo: TodoRecord, nextDue: string) => {
      if (dueSavingIds.includes(todo.id)) return
      const prevDue = todo.due ?? ""
      if (prevDue === nextDue.trim()) return
      setDueSavingIds((prev) => [...prev, todo.id])
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, due: nextDue } : t)))
      try {
        await requestJson<TodoRecord>(`todos/${todo.id}`, {
          method: "PATCH",
          body: JSON.stringify({ due: nextDue }),
        })
        await refreshTodos()
      } catch (err) {
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, due: prevDue } : t)))
        setLoadError(err instanceof Error ? err.message : "更新日期失败，请重试")
      } finally {
        setDueSavingIds((prev) => prev.filter((id) => id !== todo.id))
      }
    },
    [dueSavingIds, refreshTodos],
  )

  const deleteTodo = useCallback(
    async (todo: TodoRecord) => {
      setTodos((prev) => prev.filter((t) => t.id !== todo.id))
      try {
        await requestJson<TodoRecord>(`todos/${todo.id}`, { method: "DELETE" })
        await refreshTodos()
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "删除待办失败，请重试")
        await refreshTodos()
      }
    },
    [refreshTodos],
  )

  const pendingTodos = useMemo(
    () =>
      todos
        .filter((t) => !t.done)
        .sort((a, b) => {
          const rankA = dueRank(a.due)
          const rankB = dueRank(b.due)
          if (rankA !== rankB) return rankA - rankB
          // 未来组按到期时间近的在前，其余组内新添加的置顶
          if (rankA === 2) {
            const dueA = (a.due ?? "").trim()
            const dueB = (b.due ?? "").trim()
            if (dueA !== dueB) return dueA < dueB ? -1 : 1
          }
          return a.created < b.created ? 1 : -1
        }),
    [todos],
  )

  const doneTodos = useMemo(
    () => todos.filter((t) => t.done).sort((a, b) => (a.updated < b.updated ? 1 : -1)),
    [todos],
  )

  const totalCount = todos.length
  const doneCount = doneTodos.length
  const allDone = totalCount > 0 && doneCount === totalCount
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return {
    pendingTodos,
    doneTodos,
    totalCount,
    doneCount,
    allDone,
    progressPct,
    dataLoading,
    loadError,
    setLoadError,
    todoDraft,
    setTodoDraft,
    dueDraft,
    setDueDraft,
    todoAdding,
    addTodo,
    toggleTodo,
    updateTodoDue,
    deleteTodo,
    togglingIds,
    dueSavingIds,
  }
}
