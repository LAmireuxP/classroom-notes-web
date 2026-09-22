// 任务清单（GFM task list）在 markdown 源码上的读写工具。
// 只认行首的 `- [ ]` / `- [x]`（含 *、+ 及有序列表变体、缩进），与 remark-gfm 解析口径一致。

const TASK_LINE = /^(\s*(?:[-*+]|\d+[.)])\s+\[)([ xX])(\]\s*)/

/** content 里的任务总数 */
export function countTasks(content: string): number {
  if (!content) return 0
  return content.split(/\r?\n/).reduce((n, line) => (TASK_LINE.test(line) ? n + 1 : n), 0)
}

/** 已完成任务数 */
export function countDoneTasks(content: string): number {
  if (!content) return 0
  return content.split(/\r?\n/).reduce((n, line) => {
    const m = TASK_LINE.exec(line)
    return m && m[2].toLowerCase() === "x" ? n + 1 : n
  }, 0)
}

/**
 * 翻转第 index 个（0 基）任务的勾选状态，返回新 content。
 * index 越界或无任务时原样返回。
 */
export function toggleTaskAt(content: string, index: number): string {
  if (!content || index < 0) return content
  const lines = content.split(/\r?\n/)
  let seen = -1
  for (let i = 0; i < lines.length; i++) {
    const m = TASK_LINE.exec(lines[i])
    if (!m) continue
    seen++
    if (seen === index) {
      const checked = m[2].toLowerCase() === "x"
      lines[i] = lines[i].replace(TASK_LINE, `${m[1]}${checked ? " " : "x"}${m[3]}`)
      break
    }
  }
  return lines.join("\n")
}
