import { useCallback, useEffect, useMemo, useState } from "react"
import { getPocketBaseUrl } from "@/lib/pb"
import { COURSE_TONE_AUTO, courseManualTone } from "@/lib/courseTone"
import type { CourseRecord, NoteRecord } from "@/pages/Home/useHome"

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

export function useCourses() {
  const [courses, setCourses] = useState<CourseRecord[]>([])
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)

  const [courseFormOpen, setCourseFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null)
  const [courseNameDraft, setCourseNameDraft] = useState("")
  const [courseColorDraft, setCourseColorDraft] = useState(COURSE_TONE_AUTO)
  const [savingCourse, setSavingCourse] = useState(false)

  const [deleteCourseTarget, setDeleteCourseTarget] = useState<CourseRecord | null>(null)
  const [deletingCourse, setDeletingCourse] = useState(false)

  const refreshAll = useCallback(async () => {
    setLoadError(null)
    try {
      const [courseRes, noteRes] = await Promise.all([
        requestJson<ListResult<CourseRecord>>("courses?perPage=200"),
        requestJson<ListResult<NoteRecord>>("notes?perPage=200"),
      ])
      setCourses(courseRes.items)
      setNotes(noteRes.items)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "数据加载失败，请稍后重试")
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setDataLoading(true)
      await refreshAll()
      setDataLoading(false)
    })()
  }, [refreshAll])

  // 设置里「清空全部数据」后刷新课程墙
  useEffect(() => {
    const onDataChanged = () => void refreshAll()
    window.addEventListener("ktzl:data-changed", onDataChanged)
    return () => window.removeEventListener("ktzl:data-changed", onDataChanged)
  }, [refreshAll])

  const noteCountByCourse = useMemo(() => {
    const map = new Map<string, number>()
    for (const note of notes) {
      const key = note.course || "未分类"
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [notes])

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => (a.created < b.created ? 1 : -1)),
    [notes],
  )

  const notesOfCourse = useCallback(
    (courseName: string): NoteRecord[] => {
      const key = courseName || "未分类"
      return sortedNotes.filter((n) => (n.course || "未分类") === key)
    },
    [sortedNotes],
  )

  const toggleExpand = useCallback((courseId: string) => {
    setExpandedCourseId((prev) => (prev === courseId ? null : courseId))
  }, [])

  const openCreateCourse = useCallback(() => {
    setEditingCourse(null)
    setCourseNameDraft("")
    setCourseColorDraft(COURSE_TONE_AUTO)
    setCourseFormOpen(true)
  }, [])

  const openRenameCourse = useCallback((course: CourseRecord) => {
    setEditingCourse(course)
    setCourseNameDraft(course.name)
    const manual = courseManualTone(course)
    setCourseColorDraft(manual === null ? COURSE_TONE_AUTO : manual + 1)
    setCourseFormOpen(true)
  }, [])

  const closeCourseForm = useCallback(() => {
    setCourseFormOpen(false)
    setEditingCourse(null)
  }, [])

  const saveCourse = useCallback(async () => {
    const trimmed = courseNameDraft.trim()
    if (!trimmed || savingCourse) return
    const duplicated = courses.some(
      (c) => c.name === trimmed && c.id !== editingCourse?.id,
    )
    if (duplicated) {
      setLoadError(`已有同名课程「${trimmed}」，换个名字吧`)
      return
    }
    setSavingCourse(true)
    try {
      if (editingCourse) {
        await requestJson<CourseRecord>(`courses/${editingCourse.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: trimmed, color: courseColorDraft }),
        })
        const affected = notes.filter((n) => n.course === editingCourse.name)
        await Promise.all(
          affected.map((n) =>
            requestJson<NoteRecord>(`notes/${n.id}`, {
              method: "PATCH",
              body: JSON.stringify({ course: trimmed }),
            }),
          ),
        )
      } else {
        await requestJson<CourseRecord>("courses", {
          method: "POST",
          body: JSON.stringify({ name: trimmed, color: courseColorDraft }),
        })
      }
      setCourseFormOpen(false)
      setEditingCourse(null)
      await refreshAll()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "保存失败，请重试")
    } finally {
      setSavingCourse(false)
    }
  }, [courseNameDraft, courseColorDraft, savingCourse, courses, editingCourse, notes, refreshAll])

  const requestDeleteCourse = useCallback((course: CourseRecord) => {
    setDeleteCourseTarget(course)
  }, [])

  const cancelDeleteCourse = useCallback(() => {
    setDeleteCourseTarget(null)
  }, [])

  const confirmDeleteCourse = useCallback(async () => {
    if (!deleteCourseTarget || deletingCourse) return
    const target = deleteCourseTarget
    setDeletingCourse(true)
    setDeleteCourseTarget(null)
    try {
      await requestJson<CourseRecord>(`courses/${target.id}`, { method: "DELETE" })
      const affected = notes.filter((n) => n.course === target.name)
      await Promise.all(
        affected.map((n) =>
          requestJson<NoteRecord>(`notes/${n.id}`, {
            method: "PATCH",
            body: JSON.stringify({ course: "" }),
          }),
        ),
      )
      if (expandedCourseId === target.id) setExpandedCourseId(null)
      await refreshAll()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "删除失败，请重试")
    } finally {
      setDeletingCourse(false)
    }
  }, [deleteCourseTarget, deletingCourse, notes, expandedCourseId, refreshAll])

  const deleteTargetNoteCount = deleteCourseTarget
    ? (noteCountByCourse.get(deleteCourseTarget.name || "未分类") ?? 0)
    : 0

  return {
    courses,
    dataLoading,
    loadError,
    expandedCourseId,
    toggleExpand,
    noteCountByCourse,
    notesOfCourse,
    courseFormOpen,
    editingCourse,
    courseNameDraft,
    setCourseNameDraft,
    courseColorDraft,
    setCourseColorDraft,
    savingCourse,
    openCreateCourse,
    openRenameCourse,
    closeCourseForm,
    saveCourse,
    deleteCourseTarget,
    deleteTargetNoteCount,
    deletingCourse,
    requestDeleteCourse,
    cancelDeleteCourse,
    confirmDeleteCourse,
    totalNotes: notes.length,
  }
}
