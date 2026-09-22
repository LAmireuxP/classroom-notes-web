import type { Components } from "react-markdown"
import { resolveNoteImageSrc } from "@/lib/noteImage"

const bodyText = "text-sm leading-relaxed text-muted-foreground dark:text-background/80"

// Markdown 元素 → token 化样式（深浅两套对比均已核对：muted-foreground / background/80 配对各自底色）
export const mdComponents: Components = {
  h1: ({ children }) => (
    <h3 className="mb-2 mt-5 font-display text-xl font-bold text-foreground first:mt-0 dark:text-background">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="mb-2 mt-5 font-display text-lg font-bold text-foreground first:mt-0 dark:text-background">
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="mb-1.5 mt-4 font-display text-base font-bold text-foreground first:mt-0 dark:text-background">
      {children}
    </h5>
  ),
  p: ({ children }) => <p className={`my-2.5 ${bodyText}`}>{children}</p>,
  ul: ({ children, className }) => (
    <ul
      className={`my-2.5 space-y-1.5 ${
        typeof className === "string" && className.includes("contains-task-list")
          ? "list-none pl-0"
          : "list-disc pl-5 marker:text-primary"
      } ${bodyText}`}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className={`my-2.5 list-decimal space-y-1.5 pl-5 marker:text-primary ${bodyText}`}>{children}</ol>
  ),
  li: ({ children, className }) => {
    // remark-gfm 给任务项 li 挂 task-list-item：去项目符号，复选框与文字对齐
    if (typeof className === "string" && className.includes("task-list-item")) {
      return <li className="flex list-none items-start gap-2 pl-0">{children}</li>
    }
    return <li className="pl-0.5">{children}</li>
  },
  input: ({ checked }) => (
    <input
      type="checkbox"
      checked={!!checked}
      readOnly
      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-sm border-border accent-primary"
    />
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-foreground dark:text-background">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="text-muted-foreground/70 line-through dark:text-background/50">{children}</del>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-primary dark:bg-background/15 dark:text-primary">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-xl border border-border bg-muted p-3 text-foreground dark:border-background/20 dark:bg-background/10 dark:text-background [&_code]:bg-transparent [&_code]:px-0 [&_code]:py-0 dark:[&_code]:bg-transparent">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className={`my-3 border-l-4 border-primary/60 pl-3 italic ${bodyText}`}>{children}</blockquote>
  ),
  hr: () => <hr className="my-4 border-border dark:border-background/25" />,
  img: ({ src, alt }) => (
    <img
      src={resolveNoteImageSrc(String(src ?? ""))}
      alt={alt || "图片"}
      loading="lazy"
      className="my-3 w-full rounded-xl border border-border object-cover dark:border-background/20"
    />
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
}
