export function AboutSection() {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <p className="mb-2 text-xs font-bold text-muted-foreground dark:text-background/60">关于</p>
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-sm dark:border-background/15 dark:bg-background/5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-base font-bold text-primary-foreground shadow-sm">
          课
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold">课堂整理</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground dark:text-background/60">
            课程、笔记、待办一屏理清，支持图文排版、语音速记与深浅主题。所有偏好都保存在这台设备上，改动即时生效。
          </p>
        </div>
      </div>
    </section>
  )
}
