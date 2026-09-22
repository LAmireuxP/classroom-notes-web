interface HighlightTextProps {
  text: string
  query: string
}

/** 大小写不敏感地把命中词包成 <mark>（主色淡底），query 为空时原样输出 */
export function HighlightText({ text, query }: HighlightTextProps) {
  const q = query.trim()
  if (!q || !text) return <>{text}</>
  const lower = text.toLowerCase()
  const ql = q.toLowerCase()
  const parts: Array<{ s: string; hit: boolean }> = []
  let i = 0
  while (i < text.length) {
    const idx = lower.indexOf(ql, i)
    if (idx === -1) {
      parts.push({ s: text.slice(i), hit: false })
      break
    }
    if (idx > i) parts.push({ s: text.slice(i, idx), hit: false })
    parts.push({ s: text.slice(idx, idx + q.length), hit: true })
    i = idx + q.length
  }
  return (
    <>
      {parts.map((part, k) =>
        part.hit ? (
          <mark key={k} className="rounded-sm bg-primary/20 px-0.5 text-primary">
            {part.s}
          </mark>
        ) : (
          <span key={k}>{part.s}</span>
        ),
      )}
    </>
  )
}
