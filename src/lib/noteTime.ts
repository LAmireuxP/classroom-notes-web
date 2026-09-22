// 笔记时间展示：今天显示「今天 HH:MM」，其余显示「M月D日」。列表与详情共用。
export function formatNoteTime(created: string): string {
  const d = new Date(created)
  if (Number.isNaN(d.getTime())) return ""
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  if (sameDay) {
    const hh = String(d.getHours()).padStart(2, "0")
    const mm = String(d.getMinutes()).padStart(2, "0")
    return `今天 ${hh}:${mm}`
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
