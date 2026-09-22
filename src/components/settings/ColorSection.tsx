import { Check, Palette, RotateCcw } from "lucide-react"
import type { ColorSwatch } from "@/pages/Settings/useSettings"

// 主题颜色分区：实时预览条 + 主色色板 + 背景底色色板 + 恢复默认。
// 色板圆点用 style 渲选项 hex（业务数据，页面配色仍全 token）。

interface ColorSectionProps {
  primarySwatches: ColorSwatch[]
  bgSwatches: ColorSwatch[]
  primaryActive: string
  bgActive: string
  primaryInputValue: string
  bgInputValue: string
  colorsCustomized: boolean
  onPickPrimary: (hex: string) => void
  onPickBg: (hex: string) => void
  onResetColors: () => void
}

function SwatchDot(p: { item: ColorSwatch; active: boolean; onPick: (hex: string) => void }) {
  return (
    <button
      type="button"
      aria-label={`主色 ${p.item.label}`}
      aria-pressed={p.active}
      onClick={() => p.onPick(p.item.hex)}
      className={`relative grid h-11 w-11 place-items-center rounded-full border bg-card transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus ${
        p.active
          ? "border-primary shadow-md ring-2 ring-primary/40"
          : "border-border shadow-sm hover:border-primary/50"
      }`}
    >
      <span className="h-7 w-7 rounded-full" style={{ backgroundColor: p.item.hex }} />
      {p.active ? (
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
          <Check className="h-3 w-3" />
        </span>
      ) : null}
    </button>
  )
}

function BgSwatchDot(p: { item: ColorSwatch; active: boolean; onPick: (hex: string) => void }) {
  return (
    <button
      type="button"
      aria-label={`底色 ${p.item.label}`}
      aria-pressed={p.active}
      onClick={() => p.onPick(p.item.hex)}
      className={`relative grid h-11 w-11 place-items-center rounded-full border transition-all active:scale-95 focus-visible:outline-none focus-visible:shadow-focus ${
        p.active
          ? "border-primary shadow-md ring-2 ring-primary/40"
          : "border-border bg-card shadow-sm hover:border-primary/50"
      }`}
    >
      <span
        className="h-7 w-7 rounded-full border border-border/60"
        style={{ backgroundColor: p.item.hex }}
      />
      {p.active ? (
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
          <Check className="h-3 w-3" />
        </span>
      ) : null}
    </button>
  )
}

function CustomPicker(p: {
  label: string
  ariaLabel: string
  value: string
  onPick: (hex: string) => void
}) {
  return (
    <label className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-dashed border-border bg-card shadow-sm transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40">
      <Palette className="h-5 w-5 text-muted-foreground dark:text-background/60" />
      <input
        type="color"
        aria-label={p.ariaLabel}
        value={p.value}
        onChange={(e) => p.onPick(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  )
}

const gridLabel = "mt-1.5 text-center text-xs text-muted-foreground dark:text-background/50"

export function ColorSection(p: ColorSectionProps) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-muted-foreground dark:text-background/60">主题颜色</p>
        <button
          type="button"
          onClick={p.onResetColors}
          disabled={!p.colorsCustomized}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-bold text-muted-foreground transition-all hover:border-primary hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-40 dark:border-background/15 dark:bg-background/5 dark:text-background/60"
        >
          <RotateCcw className="h-3.5 w-3.5" /> 恢复默认
        </button>
      </div>

      {/* 实时预览条：当前主色 + 当前底色派生的卡片色，所见即所得 */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-md dark:border-background/15 dark:bg-background/5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm">
            示例按钮
          </span>
          <span className="text-sm font-bold text-primary">强调文字</span>
          <span className="inline-flex h-7 items-center rounded-full bg-primary/10 px-3 text-xs font-bold text-primary">
            标签
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground dark:text-background/60">
          这是一段正文示例，放在当前底色与卡片色上，看看读起来舒不舒服。
        </p>
      </div>

      <p className="mb-2 mt-5 text-xs font-bold text-foreground/70 dark:text-background/70">主色</p>
      <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-7">
        {p.primarySwatches.map((item) => (
          <div key={item.hex} className="flex flex-col items-center">
            <SwatchDot item={item} active={p.primaryActive === item.hex} onPick={p.onPickPrimary} />
            <span className={gridLabel}>{item.label}</span>
          </div>
        ))}
        <div className="flex flex-col items-center">
          <CustomPicker
            label="自定义"
            ariaLabel="自定义主色取色器"
            value={p.primaryInputValue}
            onPick={p.onPickPrimary}
          />
          <span className={gridLabel}>自定义</span>
        </div>
      </div>

      <p className="mb-2 mt-5 text-xs font-bold text-foreground/70 dark:text-background/70">
        背景底色
      </p>
      <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-7">
        {p.bgSwatches.map((item) => (
          <div key={item.hex} className="flex flex-col items-center">
            <BgSwatchDot item={item} active={p.bgActive === item.hex} onPick={p.onPickBg} />
            <span className={gridLabel}>{item.label}</span>
          </div>
        ))}
        <div className="flex flex-col items-center">
          <CustomPicker
            label="自定义"
            ariaLabel="自定义底色取色器"
            value={p.bgInputValue}
            onPick={p.onPickBg}
          />
          <span className={gridLabel}>自定义</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground dark:text-background/50">
        卡片、边框、次要底色会跟着自动配平；深色模式的页面基底不受底色影响
      </p>
    </section>
  )
}
