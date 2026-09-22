import { stripMarkdown } from "@/lib/markdownText"

// 笔记字数 / 预计阅读时长统计。中文按字、西文按词计数，阅读速度取 300 字/分钟。

/** 正文字数：剥掉 markdown 标记后，中文每字计 1、连续西文/数字每词计 1 */
export function countWords(content: string): number {
  const text = stripMarkdown(content ?? "")
  if (!text) return 0
  const cjk = (text.match(/[㐀-䶿一-鿿豈-﫿]/g) || []).length
  const words = (text.match(/[A-Za-z0-9'’-]+/g) || []).length
  return cjk + words
}

/** 预计阅读分钟数，至少 1 分钟（有内容时）；无内容返回 0 */
export function readingMinutes(content: string): number {
  const words = countWords(content)
  if (words === 0) return 0
  return Math.max(1, Math.round(words / 300))
}

/** 一行摘要文案，例：「128 字 · 约 1 分钟」 */
export function noteStatsLabel(content: string): string {
  const words = countWords(content)
  if (words === 0) return "0 字"
  return `${words} 字 · 约 ${readingMinutes(content)} 分钟读完`
}
