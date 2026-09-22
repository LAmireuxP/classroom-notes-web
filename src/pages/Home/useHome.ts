import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { getPocketBaseUrl } from "@/lib/pb"
import { callLlmWithFallback } from "@/lib/llm"
import { useCostConfirm } from "@/hooks/useCostConfirm"
import { toggleTaskAt } from "@/lib/markdownTask"
import { computeStudyStats } from "@/lib/studyStats"
import { dueTone } from "@/pages/Todos/useTodos"
import type { DueTone } from "@/pages/Todos/useTodos"

export interface CourseRecord {
  id: string
  name: string
  /** 手动指定配色：0/缺省 = 按位置自动，1-4 = 手动档位 */
  color?: number
  created: string
}

export interface NoteRecord {
  id: string
  title: string
  content: string
  course: string
  /** 置顶 */
  pinned?: boolean
  /** 收藏 */
  favorite?: boolean
  /** 非空 = 移入回收站的时间（ISO）；空/缺省 = 正常笔记 */
  deleted?: string
  /** 最近一次「复习」（打开详情）的时间（ISO） */
  last_reviewed?: string
  created: string
  updated?: string
}

/** 首页笔记视图：全部 / 收藏 / 回收站 */
export type NoteViewFilter = "all" | "favorite" | "trash"

export interface TodoRecord {
  id: string
  content: string
  done: boolean
  due?: string
  created: string
}

export type ThemeMode = "light" | "dark"

const THEME_KEY = "ketangzhengli-theme"

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

interface ListResult<T> {
  items: T[]
  totalItems: number
}

const SEED_COURSES = ["数据结构", "大学英语"]
const SEED_NOTES: Array<{ title: string; content: string; course: string }> = [
  {
    title: "树与二叉树要点",
    content: "满二叉树每层节点 2^i-1；前序 = 根左右，中序 = 左根右。考试重点：由前序+中序还原二叉树。",
    course: "数据结构",
  },
  {
    title: "Unit 3 高频词汇",
    content: "abandon 放弃；essential 本质的；contribute 贡献。课后用例句各造一遍。",
    course: "大学英语",
  },
]
const SEED_TODOS = ["周三前交数据结构作业", "复习英语 Unit 3 单词"]

/** 超过 7 天没碰（创建/编辑/复习都算「碰过」）的笔记进入待复习 */
const REVIEW_AFTER_MS = 7 * 24 * 60 * 60 * 1000

/** 内容少于这个字数时不提供 AI 整理（太短没必要） */
export const AI_SUMMARY_MIN_CHARS = 20

const AI_SUMMARY_MODEL = "doubao-seed-evolving"

const AI_SUMMARY_SYSTEM_PROMPT = [
  "你是一位细心的课堂笔记整理助手，负责把学生的原始笔记梳理成结构清晰的 Markdown 学习笔记。",
  "输出要求：",
  "1. 只输出 Markdown 正文，不要任何开场白、解释或结尾说明；",
  "2. 按以下分节组织：## 核心要点、## 知识梳理、## 建议待办；",
  "3. 「建议待办」每条使用「- [ ] 」任务清单语法；",
  "4. 忠于原始笔记，不编造原文没有涉及的知识点；",
  "5. 语言与原始笔记保持一致，措辞简洁、要点完整。",
].join("\n")

/** 把 LLM 原始错误码归类成友好的中文提示，不裸露错误码 */
function classifyLlmError(rawError: string | undefined): string {
  const code = (rawError ?? "").toLowerCase()
  if (!code) return "整理失败，请重试"
  if (code.includes("rh_login") || code.includes("login")) {
    return "登录状态已失效，请重新登录后再试"
  }
  if (
    code.includes("moderation") ||
    code.includes("sensitive") ||
    code.includes("content") ||
    code.includes("review")
  ) {
    return "笔记内容未通过审核，请调整内容后重试"
  }
  if (
    code.includes("timeout") ||
    code.includes("network") ||
    code.includes("abort") ||
    code.includes("not_found") ||
    code.includes("connect")
  ) {
    return "网络连接不畅，请检查网络后重试"
  }
  return "AI 服务暂时不可用，请稍后重试"
}

function lastTouchTime(note: NoteRecord): number {
  let t = 0
  for (const iso of [note.created, note.updated, note.last_reviewed]) {
    if (!iso) continue
    const ms = new Date(iso.replace(" ", "T")).getTime()
    if (!Number.isNaN(ms) && ms > t) t = ms
  }
  return t
}

export function useHome() {
  const [courses, setCourses] = useState<CourseRecord[]>([])
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [todos, setTodos] = useState<TodoRecord[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("")
  const [viewFilter, setViewFilter] = useState<NoteViewFilter>("all")
  const [themeMode, setThemeMode] = useState<ThemeMode>("light")

  const [editorOpen, setEditorOpen] = useState(false)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [courseDraft, setCourseDraft] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NoteRecord | null>(null)
  const [deletingNote, setDeletingNote] = useState(false)
  const [exitingNoteId, setExitingNoteId] = useState<string | null>(null)
  const [detailNoteId, setDetailNoteId] = useState<string | null>(null)

  const [todoDraft, setTodoDraft] = useState("")
  const [todoAdding, setTodoAdding] = useState(false)
  const [todoInputOpen, setTodoInputOpen] = useState(false)

  // AI 整理笔记：费用确认弹窗 + 结果区状态
  const costConfirm = useCostConfirm()
  const { runWithCostConfirm } = costConfirm
  const [aiConfirmOpen, setAiConfirmOpen] = useState(false)
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false)
  const [aiSummaryResult, setAiSummaryResult] = useState("")
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null)
  const [needsRhLogin, setNeedsRhLogin] = useState(false)

  const didInit = useRef(false)

  // 主题：初始化时读取记住的偏好并应用到根节点
  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY)
    const initial: ThemeMode = saved === "dark" ? "dark" : "light"
    setThemeMode(initial)
    document.documentElement.classList.toggle("dark", initial === "dark")
  }, [])

  const refreshAll = useCallback(async () => {
    setLoadError(null)
    try {
      const [courseRes, noteRes, todoRes] = await Promise.all([
        requestJson<ListResult<CourseRecord>>("courses?perPage=200"),
        requestJson<ListResult<NoteRecord>>("notes?perPage=200"),
        requestJson<ListResult<TodoRecord>>("todos?perPage=200"),
      ])
      setCourses(courseRes.items)
      setNotes(noteRes.items)
      setTodos(todoRes.items)
      return {
        courseCount: courseRes.items.length,
        noteCount: noteRes.items.length,
        todoCount: todoRes.items.length,
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "数据加载失败，请稍后重试")
      return null
    }
  }, [])

  // 首次进入：若完全没数据，写入示例内容帮助上手
  const seedSamples = useCallback(async () => {
    for (const courseName of SEED_COURSES) {
      await requestJson<CourseRecord>("courses", {
        method: "POST",
        body: JSON.stringify({ name: courseName }),
      })
    }
    for (const note of SEED_NOTES) {
      await requestJson<NoteRecord>("notes", {
        method: "POST",
        body: JSON.stringify(note),
      })
    }
    for (const content of SEED_TODOS) {
      await requestJson<TodoRecord>("todos", {
        method: "POST",
        body: JSON.stringify({ content, done: false }),
      })
    }
  }, [])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    void (async () => {
      setDataLoading(true)
      const counts = await refreshAll()
      if (counts && counts.courseCount === 0 && counts.noteCount === 0 && counts.todoCount === 0) {
        try {
          await seedSamples()
          await refreshAll()
        } catch {
          // 示例数据写入失败不阻塞，走友好空状态
        }
      }
      setDataLoading(false)
    })()
  }, [refreshAll, seedSamples])

  const toggleTheme = useCallback((next: ThemeMode) => {
    setThemeMode(next)
    window.localStorage.setItem(THEME_KEY, next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }, [])

  const openEditor = useCallback(() => {
    setEditingNoteId(null)
    setNoteTitle("")
    setNoteContent("")
    setCourseDraft("")
    setEditorOpen(true)
  }, [])

  // 底部导航「+」从其他页面跳回时带 ?new=1：自动打开新建编辑卡并清掉参数
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    if (!searchParams.has("new")) return
    openEditor()
    const next = new URLSearchParams(searchParams)
    next.delete("new")
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, openEditor])

  // 底部栏「语音速记」保存后刷新列表；「设置」弹窗切主题后同步顶栏状态
  useEffect(() => {
    const onDataChanged = () => void refreshAll()
    const onThemeChanged = (e: Event) => {
      const detail = (e as CustomEvent<ThemeMode>).detail
      if (detail === "light" || detail === "dark") setThemeMode(detail)
    }
    window.addEventListener("ktzl:data-changed", onDataChanged)
    window.addEventListener("ktzl:theme-changed", onThemeChanged)
    return () => {
      window.removeEventListener("ktzl:data-changed", onDataChanged)
      window.removeEventListener("ktzl:theme-changed", onThemeChanged)
    }
  }, [refreshAll])

  const startEditNote = useCallback((note: NoteRecord) => {
    setEditingNoteId(note.id)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setCourseDraft(note.course)
    setEditorOpen(true)
  }, [])

  const closeEditor = useCallback(() => {
    setEditorOpen(false)
    setEditingNoteId(null)
  }, [])

  const saveNote = useCallback(async () => {
    const trimmedTitle = noteTitle.trim()
    if (!trimmedTitle || savingNote) return
    setSavingNote(true)
    try {
      const trimmedCourse = courseDraft.trim() || "未分类"
      const exists = courses.some((c) => c.name === trimmedCourse)
      if (!exists) {
        await requestJson<CourseRecord>("courses", {
          method: "POST",
          body: JSON.stringify({ name: trimmedCourse }),
        })
      }
      const payload = {
        title: trimmedTitle,
        content: noteContent.trim(),
        course: trimmedCourse,
      }
      if (editingNoteId) {
        await requestJson<NoteRecord>(`notes/${editingNoteId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      } else {
        await requestJson<NoteRecord>("notes", {
          method: "POST",
          body: JSON.stringify(payload),
        })
      }
      setEditorOpen(false)
      setEditingNoteId(null)
      setDetailNoteId(null)
      await refreshAll()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "保存失败，请重试")
    } finally {
      setSavingNote(false)
    }
  }, [noteTitle, noteContent, courseDraft, courses, editingNoteId, savingNote, refreshAll])

  const addTodo = useCallback(async () => {
    const trimmed = todoDraft.trim()
    if (!trimmed || todoAdding) return
    setTodoAdding(true)
    try {
      await requestJson<TodoRecord>("todos", {
        method: "POST",
        body: JSON.stringify({ content: trimmed, done: false }),
      })
      setTodoDraft("")
      setTodoInputOpen(false)
      await refreshAll()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "添加待办失败，请重试")
    } finally {
      setTodoAdding(false)
    }
  }, [todoDraft, todoAdding, refreshAll])

  // 打开待复习笔记 = 复习过一次：写 last_reviewed（乐观更新，失败静默回滚不打断阅读）
  const markNoteReviewed = useCallback(async (note: NoteRecord) => {
    if (lastTouchTime(note) >= Date.now() - REVIEW_AFTER_MS) return
    const nowIso = new Date().toISOString()
    const prevReviewed = note.last_reviewed ?? ""
    setNotes((list) => list.map((n) => (n.id === note.id ? { ...n, last_reviewed: nowIso } : n)))
    try {
      await requestJson<NoteRecord>(`notes/${note.id}`, {
        method: "PATCH",
        body: JSON.stringify({ last_reviewed: nowIso }),
      })
    } catch {
      setNotes((list) => list.map((n) => (n.id === note.id ? { ...n, last_reviewed: prevReviewed } : n)))
    }
  }, [])

  // 切换/关闭详情时清空 AI 整理状态，避免下一条笔记看到上一条的结果
  const resetAiSummary = useCallback(() => {
    setAiConfirmOpen(false)
    setAiSummaryOpen(false)
    setAiSummaryResult("")
    setAiSummaryError(null)
  }, [])

  const openNoteDetail = useCallback(
    (note: NoteRecord) => {
      resetAiSummary()
      setDetailNoteId(note.id)
      void markNoteReviewed(note)
    },
    [markNoteReviewed, resetAiSummary],
  )

  const closeNoteDetail = useCallback(() => {
    resetAiSummary()
    setDetailNoteId(null)
  }, [resetAiSummary])

  const detailNote = useMemo(
    () => notes.find((n) => n.id === detailNoteId) ?? null,
    [notes, detailNoteId],
  )

  const requestDeleteNote = useCallback((note: NoteRecord) => {
    setDeleteTarget(note)
  }, [])

  const cancelDeleteNote = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  const confirmDeleteNote = useCallback(async () => {
    if (!deleteTarget || deletingNote) return
    const targetId = deleteTarget.id
    // 回收站里的再删 = 彻底删除；正常笔记 = 移入回收站（软删除，可恢复）
    const permanent = Boolean(deleteTarget.deleted)
    setDeletingNote(true)
    setDeleteTarget(null)
    setDetailNoteId(null)
    setExitingNoteId(targetId)
    try {
      if (permanent) {
        await requestJson<NoteRecord>(`notes/${targetId}`, { method: "DELETE" })
      } else {
        await requestJson<NoteRecord>(`notes/${targetId}`, {
          method: "PATCH",
          body: JSON.stringify({ deleted: new Date().toISOString() }),
        })
      }
      await refreshAll()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "删除失败，请重试")
    } finally {
      setDeletingNote(false)
      setExitingNoteId(null)
    }
  }, [deleteTarget, deletingNote, refreshAll])

  // 置顶/收藏：乐观更新，失败回滚
  const toggleNoteFlag = useCallback(async (note: NoteRecord, field: "pinned" | "favorite") => {
    const next = !note[field]
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, [field]: next } : n)))
    try {
      await requestJson<NoteRecord>(`notes/${note.id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: next }),
      })
    } catch (err) {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, [field]: !next } : n)))
      setLoadError(err instanceof Error ? err.message : "操作失败，请重试")
    }
  }, [])

  const restoreNote = useCallback(async (note: NoteRecord) => {
    const prevDeleted = note.deleted ?? ""
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, deleted: "" } : n)))
    try {
      await requestJson<NoteRecord>(`notes/${note.id}`, {
        method: "PATCH",
        body: JSON.stringify({ deleted: "" }),
      })
    } catch (err) {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, deleted: prevDeleted } : n)))
      setLoadError(err instanceof Error ? err.message : "恢复失败，请重试")
    }
  }, [])

  // 详情页勾选任务清单：翻转 content 里第 taskIndex 个任务，乐观更新 + 失败回滚
  const toggleNoteTask = useCallback(async (note: NoteRecord, taskIndex: number) => {
    const prevContent = note.content
    const nextContent = toggleTaskAt(prevContent, taskIndex)
    if (nextContent === prevContent) return
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, content: nextContent } : n)))
    try {
      await requestJson<NoteRecord>(`notes/${note.id}`, {
        method: "PATCH",
        body: JSON.stringify({ content: nextContent }),
      })
    } catch (err) {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, content: prevContent } : n)))
      setLoadError(err instanceof Error ? err.message : "更新失败，请重试")
    }
  }, [])

  // AI 整理：点「AI 帮我整理」先弹费用确认，确认后才发起生成（防重复点击）
  const requestAiSummarize = useCallback(() => {
    if (!detailNote || aiSummaryLoading) return
    if (detailNote.content.trim().length < AI_SUMMARY_MIN_CHARS) return
    setAiSummaryError(null)
    setAiConfirmOpen(true)
  }, [detailNote, aiSummaryLoading])

  const cancelAiConfirm = useCallback(() => setAiConfirmOpen(false), [])

  const runAiSummarize = useCallback(
    async (note: NoteRecord) => {
      setAiSummaryLoading(true)
      setAiSummaryError(null)
      try {
        const result = await callLlmWithFallback(AI_SUMMARY_MODEL, {
          messages: [
            { role: "system", content: AI_SUMMARY_SYSTEM_PROMPT },
            {
              role: "user",
              content: `笔记标题：${note.title}\n所属课程：${note.course || "未分类"}\n笔记原文：\n${note.content}`,
            },
          ],
          page: "home",
        })
        if (result.status === "success" && result.text) {
          setNeedsRhLogin(false)
          setAiSummaryResult(result.text)
          setAiSummaryOpen(true)
        } else {
          // 412 / rh_login_required：捕获登录失效，View 渲染重新登录 banner
          if (result.needsLogin || (result.error ?? "").includes("rh_login_required")) {
            setNeedsRhLogin(true)
          }
          setAiSummaryError(classifyLlmError(result.error))
        }
      } catch {
        setAiSummaryError(classifyLlmError("network"))
      } finally {
        setAiSummaryLoading(false)
      }
    },
    [],
  )

  const confirmAiSummarize = useCallback(() => {
    setAiConfirmOpen(false)
    if (!detailNote || aiSummaryLoading) return
    const note = detailNote
    // 付费调用统一包在 runWithCostConfirm 里（发布审计的用户触发证据）
    runWithCostConfirm(() => {
      void runAiSummarize(note)
    }, "本次整理会产生一次 AI 调用费用")
  }, [detailNote, aiSummaryLoading, runWithCostConfirm, runAiSummarize])

  // 放弃：只关结果区，原文不动（结果保留，可再次生成）
  const discardAiSummary = useCallback(() => {
    setAiSummaryOpen(false)
    setAiSummaryError(null)
  }, [])

  // 替换原文：把 AI 结果写回笔记 content（乐观更新 + 失败回滚，参考 toggleNoteTask）
  const replaceNoteWithAiSummary = useCallback(
    async (note: NoteRecord) => {
      const nextContent = aiSummaryResult
      if (!nextContent) return
      const prevContent = note.content
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, content: nextContent } : n)))
      setAiSummaryOpen(false)
      try {
        await requestJson<NoteRecord>(`notes/${note.id}`, {
          method: "PATCH",
          body: JSON.stringify({ content: nextContent }),
        })
      } catch (err) {
        setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, content: prevContent } : n)))
        setLoadError(err instanceof Error ? err.message : "替换失败，请重试")
        // 回滚后把结果区重新打开，AI 结果不丢，可再试
        setAiSummaryOpen(true)
      }
    },
    [aiSummaryResult],
  )

  const activeNotes = useMemo(() => notes.filter((n) => !n.deleted), [notes])
  const trashedNotes = useMemo(() => notes.filter((n) => Boolean(n.deleted)), [notes])

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const base =
      viewFilter === "trash"
        ? trashedNotes
        : viewFilter === "favorite"
          ? activeNotes.filter((n) => n.favorite)
          : activeNotes
    let sorted = [...base].sort((a, b) => {
      if (viewFilter !== "trash") {
        const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
        if (pinDiff !== 0) return pinDiff
      }
      return a.created < b.created ? 1 : -1
    })
    if (courseFilter && viewFilter !== "trash") {
      sorted = sorted.filter((n) => n.course === courseFilter)
    }
    if (!q) return sorted
    return sorted.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.course.toLowerCase().includes(q),
    )
  }, [activeNotes, trashedNotes, searchQuery, courseFilter, viewFilter])

  const matchingCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return courses.filter((c) => c.name.toLowerCase().includes(q))
  }, [courses, searchQuery])

  // 搜索同时命中待办：首页给预览卡，点击跳待办页
  const matchedTodos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return todos.filter((t) => t.content.toLowerCase().includes(q))
  }, [todos, searchQuery])

  // 最紧急的一条待办（逾期 > 今天 > 最近到期；无截止日期的不参与），供首页提醒条使用
  const urgentTodo = useMemo(() => {
    const rank: Record<DueTone, number> = { overdue: 0, today: 1, future: 2, none: 3 }
    const dated = todos.filter((t) => !t.done && t.due)
    if (dated.length === 0) return null
    return [...dated].sort((a, b) => {
      const r = rank[dueTone(a.due)] - rank[dueTone(b.due)]
      if (r !== 0) return r
      return a.due! < b.due! ? -1 : 1
    })[0]
  }, [todos])

  // 学习概览：近 14 天记录活跃、连续天数、本周数据（按 created 归日，不依赖后端新字段）
  const studyStats = useMemo(() => computeStudyStats(notes, todos), [notes, todos])

  // 待复习：超过 7 天没碰过的正常笔记，最久没看的排最前
  const reviewNotes = useMemo(() => {
    const cutoff = Date.now() - REVIEW_AFTER_MS
    return activeNotes
      .filter((n) => {
        const t = lastTouchTime(n)
        return t > 0 && t < cutoff
      })
      .sort((a, b) => lastTouchTime(a) - lastTouchTime(b))
  }, [activeNotes])

  return {
    courses,
    notes,
    filteredNotes,
    matchingCourses,
    matchedTodos,
    todos,
    urgentTodo,
    studyStats,
    reviewNotes,
    stats: {
      courseCount: courses.length,
      noteCount: activeNotes.length,
      todoCount: todos.filter((t) => !t.done).length,
    },
    favoriteCount: activeNotes.filter((n) => n.favorite).length,
    trashCount: trashedNotes.length,
    dataLoading,
    loadError,
    refreshAll,
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    viewFilter,
    setViewFilter,
    themeMode,
    toggleTheme,
    editorOpen,
    openEditor,
    closeEditor,
    noteTitle,
    setNoteTitle,
    noteContent,
    setNoteContent,
    courseDraft,
    setCourseDraft,
    savingNote,
    saveNote,
    editingNoteId,
    startEditNote,
    deleteTarget,
    requestDeleteNote,
    cancelDeleteNote,
    confirmDeleteNote,
    toggleNoteFlag,
    restoreNote,
    toggleNoteTask,
    deletingNote,
    exitingNoteId,
    detailNote,
    openNoteDetail,
    closeNoteDetail,
    todoDraft,
    setTodoDraft,
    todoAdding,
    todoInputOpen,
    setTodoInputOpen,
    addTodo,
    costConfirm,
    aiConfirmOpen,
    aiSummaryOpen,
    aiSummaryResult,
    aiSummaryLoading,
    aiSummaryError,
    needsRhLogin,
    setNeedsRhLogin,
    requestAiSummarize,
    confirmAiSummarize,
    cancelAiConfirm,
    discardAiSummary,
    replaceNoteWithAiSummary,
  }
}
