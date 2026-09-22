// 课程配色：卡墙 4 档配方的单一来源。
// 手动指定色优先（courses.color = 1-4），未指定（0/缺省）按课程在列表中的位置轮换。
export const COURSE_TONE_COUNT = 4

/** color 字段语义：0 = 按位置自动配色 */
export const COURSE_TONE_AUTO = 0

/** 参与取色的最小课程形状（CourseRecord 结构兼容） */
export interface CourseToneSource {
  name: string
  color?: number
}

/** 课程标签胶囊配色（笔记列表 / 筛选用） */
export const COURSE_TONE_TAG = [
  "bg-primary/12 text-primary",
  "bg-secondary text-secondary-foreground",
  "bg-foreground text-background dark:bg-background dark:text-foreground",
  "bg-muted text-foreground/80 dark:bg-background/15 dark:text-background/80",
] as const

/** 笔记卡片左侧色条 / 弹窗色点 */
export const COURSE_TONE_BAR = [
  "bg-primary",
  "bg-secondary",
  "bg-foreground dark:bg-background",
  "border-2 border-border bg-card dark:bg-background/10",
] as const

/** 筛选标签 idle 态小色点（与色条同档，加深 idle 底上的可辨度） */
export const COURSE_TONE_DOT = [
  "bg-primary",
  "bg-secondary",
  "bg-foreground dark:bg-background",
  "border-2 border-border bg-card dark:border-background/40 dark:bg-background/30",
] as const

/** 课程卡墙 4 档完整配方 */
export const COURSE_TONE_CARD = [
  {
    surface: "border-primary bg-primary text-primary-foreground",
    chip: "bg-primary-foreground/25 text-primary-foreground",
    iconBtn: "border-primary-foreground/40 hover:bg-primary-foreground/20",
  },
  {
    surface: "border-border bg-secondary text-secondary-foreground",
    chip: "bg-secondary-foreground/10 text-secondary-foreground",
    iconBtn: "border-secondary-foreground/30 hover:bg-secondary-foreground/10",
  },
  {
    // 深色模式下页面近黑，黑卡靠浅色描边与背景拉开
    surface: "border-foreground bg-foreground text-background dark:border-background/35",
    chip: "bg-background/15 text-background",
    iconBtn: "border-background/40 hover:bg-background/15",
  },
  {
    surface: "border-primary bg-card text-card-foreground",
    chip: "bg-primary/10 text-primary",
    iconBtn: "border-foreground/15 hover:border-primary hover:text-primary",
  },
] as const

/** 色点上勾选图标的前景配对色 */
export const COURSE_TONE_DOT_FOREGROUND = [
  "text-primary-foreground",
  "text-secondary-foreground",
  "text-background dark:text-foreground",
  "text-primary",
] as const

/** 手动指定的档位 index（0-3），未手动指定返回 null */
export function courseManualTone(course: CourseToneSource | null | undefined): number | null {
  if (!course) return null
  const value = Number(course.color)
  if (!Number.isInteger(value) || value < 1 || value > COURSE_TONE_COUNT) return null
  return value - 1
}

/** 统一取色：手动色优先，未设置按列表位置轮换；「未分类」等不在列表的落到第 4 档中性色 */
export function courseToneIndex(courseName: string, courses: CourseToneSource[]): number {
  const found = courses.find((c) => c.name === courseName)
  const manual = courseManualTone(found)
  if (manual !== null) return manual
  const i = courses.findIndex((c) => c.name === courseName)
  return (i === -1 ? 3 : i) % COURSE_TONE_COUNT
}
