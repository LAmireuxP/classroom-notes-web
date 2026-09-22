// Markdown 源码 → 纯文本摘要：列表卡片两行预览用，剥掉标记、不显示星号井号。
export function stripMarkdown(source: string): string {
  if (!source) return ""
  const lines = source.split(/\r?\n/)
  const out: string[] = []
  for (const raw of lines) {
    let line = raw.trim()
    if (/^([-*_]\s*){3,}$/.test(line)) continue // 分隔线整行丢弃
    line = line.replace(/^#{1,6}\s+/, "") // 标题
    line = line.replace(/^>\s?/, "") // 引用
    line = line.replace(/^([-*+]|\d+[.)])\s+/, "") // 无序 / 有序列表
    line = line.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // 图片 → alt 文本
    line = line.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // 链接 → 链接文字
    line = line.replace(/`{1,3}([^`]*)`{1,3}/g, "$1") // 行内 / 围栏代码
    line = line.replace(/(\*\*|__)(.*?)\1/g, "$2") // 加粗
    line = line.replace(/(\*|_)(.*?)\1/g, "$2") // 斜体
    line = line.replace(/~~(.*?)~~/g, "$1") // 删除线
    if (line) out.push(line)
  }
  return out.join(" ")
}
