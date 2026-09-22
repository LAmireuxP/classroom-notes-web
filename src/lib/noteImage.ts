import { getPocketBaseUrl } from "@/lib/pb"

// 笔记配图：上传到 PocketBase 标准文件通路，返回可直接插进 Markdown 的写法。
// 链接只存 /api/files/... 相对路径，渲染时按当前环境重新拼前缀，预览/发布都能显示。

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]
const MAX_BYTES = 5 * 1024 * 1024

export function validateNoteImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "只支持 PNG / JPG / WebP / GIF 图片"
  if (file.size > MAX_BYTES) return "图片太大了，请选 5MB 以内的图"
  return null
}

export async function uploadNoteImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("image", file)
  const res = await fetch(`${getPocketBaseUrl()}/api/collections/noteimages/records`, {
    method: "POST",
    body: fd,
  })
  if (!res.ok) throw new Error(`图片上传失败（${res.status}）`)
  const record = (await res.json()) as { collectionId: string; id: string; image: string }
  return `![图片](/api/files/${record.collectionId}/${record.id}/${record.image})`
}

// 把 Markdown 里的 /api/files/... 拼回当前环境的 PocketBase 前缀
export function resolveNoteImageSrc(src: string): string {
  if (src.startsWith("/api/files/")) return `${getPocketBaseUrl()}${src}`
  return src
}
