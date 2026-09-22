import { useNavigate } from "react-router-dom"
import { BottomNav } from "@/components/layout/BottomNav"
import { AboutSection } from "@/components/settings/AboutSection"
import { ColorSection } from "@/components/settings/ColorSection"
import { DataSection } from "@/components/settings/DataSection"
import { PrefSections } from "@/components/settings/PrefSections"
import { SettingsTopBar } from "@/components/settings/SettingsTopBar"
import type { useSettings } from "./useSettings"

export function SettingsPage(p: ReturnType<typeof useSettings>) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-background text-foreground dark:from-foreground dark:via-foreground dark:to-foreground dark:text-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden">
        <SettingsTopBar onBack={() => navigate("/")} />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pb-2 pt-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground dark:text-background/60">
            preferences
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold leading-tight">
            按你的习惯，<span className="text-primary">调教它</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-background/60">
            主题、颜色、动效和数据都在这页调，改动即时生效，下次打开还在
          </p>
        </section>

        <main className="flex-1 space-y-8 px-4 pb-[calc(6rem_+_env(safe-area-inset-bottom))] pt-5">
          <PrefSections
            mode={p.mode}
            motionOn={p.motionOn}
            fontLarge={p.fontLarge}
            onTheme={p.onTheme}
            onToggleMotion={p.onToggleMotion}
            onFont={p.onFont}
          />
          <ColorSection
            primarySwatches={p.primarySwatches}
            bgSwatches={p.bgSwatches}
            primaryActive={p.primaryActive}
            bgActive={p.bgActive}
            primaryInputValue={p.primaryInputValue}
            bgInputValue={p.bgInputValue}
            colorsCustomized={p.colorsCustomized}
            onPickPrimary={p.onPickPrimary}
            onPickBg={p.onPickBg}
            onResetColors={p.onResetColors}
          />
          <DataSection
            busy={p.busy}
            statusText={p.statusText}
            errorText={p.errorText}
            confirmClear={p.confirmClear}
            onExport={p.onExport}
            openClearConfirm={p.openClearConfirm}
            cancelClearConfirm={p.cancelClearConfirm}
            onClear={p.onClear}
          />
        </main>

        <footer className="border-t border-border px-4 pb-4 pt-6 dark:border-background/15">
          <AboutSection />
        </footer>

        <BottomNav />
      </div>
    </div>
  )
}
