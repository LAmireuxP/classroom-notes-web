import { COURSE_TONE_DOT, courseToneIndex } from "@/lib/courseTone"
import type { CourseToneSource } from "@/lib/courseTone"

interface CourseFilterChipsProps {
  courses: CourseToneSource[]
  activeCourse: string
  onSelect: (course: string) => void
}

const chipBase =
  "h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus"
const chipSelected = "border border-primary bg-primary text-primary-foreground shadow-sm"
const chipIdle =
  "border border-border bg-card text-foreground/75 hover:border-primary/50 dark:border-background/20 dark:bg-background/10 dark:text-background/75 dark:hover:border-primary/50"

export function CourseFilterChips({ courses, activeCourse, onSelect }: CourseFilterChipsProps) {
  if (courses.length === 0) return null
  return (
    // 横向滚动区：标记 data-no-swipe，滑动从这里起手时不触发切页手势
    <section data-no-swipe className="px-4 pt-4" aria-label="按课程筛选笔记">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`${chipBase} ${activeCourse === "" ? chipSelected : chipIdle}`}
        >
          全部
        </button>
        {courses.map((course) => (
          <button
            key={course.name}
            type="button"
            onClick={() => onSelect(activeCourse === course.name ? "" : course.name)}
            className={`${chipBase} ${activeCourse === course.name ? chipSelected : chipIdle}`}
          >
            {activeCourse === course.name ? null : (
              <span
                aria-hidden
                className={`mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full align-middle ${COURSE_TONE_DOT[courseToneIndex(course.name, courses)]}`}
              />
            )}
            {course.name}
          </button>
        ))}
      </div>
    </section>
  )
}
