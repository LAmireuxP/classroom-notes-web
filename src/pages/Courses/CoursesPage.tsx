import { useNavigate } from "react-router-dom"
import { BookOpen, Layers, Plus } from "lucide-react"
import { CoursesTopBar } from "@/components/courses/CoursesTopBar"
import { CourseCard } from "@/components/courses/CourseCard"
import { CourseFormDialog } from "@/components/courses/CourseFormDialog"
import { DeleteCourseDialog } from "@/components/courses/DeleteCourseDialog"
import { BottomNav } from "@/components/layout/BottomNav"
import { courseToneIndex } from "@/lib/courseTone"
import type { useCourses } from "./useCourses"

const statPillBase = "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold"

export function CoursesPage(p: ReturnType<typeof useCourses>) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-background text-foreground dark:from-foreground dark:via-foreground dark:to-foreground dark:text-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden">
        <CoursesTopBar onBack={() => navigate("/")} onCreate={p.openCreateCourse} />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pb-2 pt-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground dark:text-background/60">
            my courses
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold leading-tight">
            我的<span className="text-primary">课程</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-background/60">
            点课程卡展开看笔记，改名字笔记会跟着走
          </p>
          <div className="mt-4 flex gap-2">
            <span className={`${statPillBase} bg-primary text-primary-foreground shadow-sm`}>
              <Layers className="h-3.5 w-3.5" /> {p.courses.length} 门课
            </span>
            <span className={`${statPillBase} border border-border bg-card text-foreground/75 shadow-sm dark:border-background/20 dark:bg-background/10 dark:text-background/75`}>
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground dark:text-background/60" />
              {p.totalNotes} 条笔记
            </span>
          </div>
        </section>

        {p.loadError ? (
          <section className="px-4 pt-2">
            <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {p.loadError}
            </p>
          </section>
        ) : null}

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 px-4 pb-8 pt-4">
          {p.dataLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl border border-border/60 bg-muted/60 dark:border-background/10 dark:bg-background/5"
                />
              ))}
            </div>
          ) : p.courses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-sm dark:border-background/20 dark:bg-background/10">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-4 font-display text-lg font-bold">还没有课程</p>
              <p className="mt-1 text-sm text-muted-foreground dark:text-background/60">
                点右上角「新建」，给第一门课起个名字吧
              </p>
              <button
                type="button"
                onClick={p.openCreateCourse}
                className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
              >
                <Plus className="h-4 w-4" /> 新建课程
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {p.courses.map((course, idx) => (
                <div key={course.id} className={p.expandedCourseId === course.id ? "col-span-2" : ""}>
                  <CourseCard
                    course={course}
                    noteCount={p.noteCountByCourse.get(course.name || "未分类") ?? 0}
                    expanded={p.expandedCourseId === course.id}
                    notes={p.notesOfCourse(course.name)}
                    variantIndex={courseToneIndex(course.name, p.courses)}
                    delayIndex={idx}
                    onToggle={() => p.toggleExpand(course.id)}
                    onRename={() => p.openRenameCourse(course)}
                    onDelete={() => p.requestDeleteCourse(course)}
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="border-t border-border px-4 pb-[calc(5rem_+_env(safe-area-inset-bottom))] pt-6 text-center dark:border-background/15">
          <p className="font-mono text-xs text-muted-foreground dark:text-background/60">
            共 {p.courses.length} 门课程 · {p.totalNotes} 条笔记
          </p>
        </footer>

        <BottomNav />
      </div>

      <CourseFormDialog
        open={p.courseFormOpen}
        editing={p.editingCourse !== null}
        nameDraft={p.courseNameDraft}
        colorDraft={p.courseColorDraft}
        autoToneIndex={p.editingCourse ? courseToneIndex(p.editingCourse.name, p.courses) : -1}
        saving={p.savingCourse}
        onNameChange={p.setCourseNameDraft}
        onColorChange={p.setCourseColorDraft}
        onClose={p.closeCourseForm}
        onSave={p.saveCourse}
      />

      <DeleteCourseDialog
        open={p.deleteCourseTarget !== null}
        courseName={p.deleteCourseTarget?.name ?? ""}
        noteCount={p.deleteTargetNoteCount}
        deleting={p.deletingCourse}
        onCancel={p.cancelDeleteCourse}
        onConfirm={p.confirmDeleteCourse}
      />
    </div>
  )
}
