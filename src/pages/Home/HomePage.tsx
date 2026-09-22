import { useNavigate } from "react-router-dom"
import { HomeTopBar } from "@/components/home/HomeTopBar"
import { StatsCard } from "@/components/home/StatsCard"
import { StudyOverviewCard } from "@/components/home/StudyOverviewCard"
import { SearchBar } from "@/components/home/SearchBar"
import { ViewFilterChips } from "@/components/home/ViewFilterChips"
import { CourseFilterChips } from "@/components/home/CourseFilterChips"
import { TodoMatchList } from "@/components/home/TodoMatchList"
import { NotesList } from "@/components/home/NotesList"
import { UrgentTodoBar } from "@/components/home/UrgentTodoBar"
import { ReviewReminderBar } from "@/components/home/ReviewReminderBar"
import { NoteEditor } from "@/components/home/NoteEditor"
import { NoteDetail } from "@/components/home/NoteDetail"
import { DeleteNoteDialog } from "@/components/home/DeleteNoteDialog"
import { AiCostConfirmDialog } from "@/components/home/AiCostConfirmDialog"
import { CostConfirmDialog } from "@/components/rh/CostConfirmDialog"
import { InstallHint } from "@/components/home/InstallHint"
import { BottomNav } from "@/components/layout/BottomNav"
import type { useHome } from "./useHome"

export function HomePage(p: ReturnType<typeof useHome>) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-background text-foreground dark:from-foreground dark:via-foreground dark:to-foreground dark:text-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden">

        <HomeTopBar
          themeMode={p.themeMode}
          onSetTheme={p.toggleTheme}
        />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pt-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground dark:text-background/60">
            classroom notes
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold leading-tight">
            把每一堂课，<span className="text-primary">理清楚</span>
          </h2>
        </section>

        <StatsCard
          courseCount={p.stats.courseCount}
          noteCount={p.stats.noteCount}
          todoCount={p.stats.todoCount}
          todoInputOpen={p.todoInputOpen}
          todoDraft={p.todoDraft}
          onTodoDraftChange={p.setTodoDraft}
          onAddTodo={p.addTodo}
          onToggleInput={() => p.setTodoInputOpen(!p.todoInputOpen)}
          todoAdding={p.todoAdding}
          onCourseClick={() => navigate("/courses")}
          onTodoClick={() => navigate("/todos")}
        />

        <StudyOverviewCard stats={p.studyStats} />

        <UrgentTodoBar todo={p.urgentTodo} onPress={() => navigate("/todos")} />

        <ReviewReminderBar notes={p.reviewNotes} onPress={p.openNoteDetail} />

        <SearchBar searchQuery={p.searchQuery} onSearchChange={p.setSearchQuery} />

        <ViewFilterChips
          viewFilter={p.viewFilter}
          favoriteCount={p.favoriteCount}
          trashCount={p.trashCount}
          onSelect={p.setViewFilter}
        />

        {p.viewFilter === "trash" ? null : (
          <CourseFilterChips
            courses={p.courses}
            activeCourse={p.courseFilter}
            onSelect={p.setCourseFilter}
          />
        )}

        <TodoMatchList todos={p.matchedTodos} query={p.searchQuery} onOpenTodos={() => navigate("/todos")} />

        {p.needsRhLogin ? (
          <section className="px-4 pt-3">
            <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              登录状态已失效，请重新登录后再使用 AI 整理。
            </p>
          </section>
        ) : null}

        {p.loadError ? (
          <section className="px-4 pt-3">
            <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {p.loadError}
            </p>
          </section>
        ) : null}

        <NotesList
          notes={p.filteredNotes}
          totalNotes={p.stats.noteCount}
          dataLoading={p.dataLoading}
          searchQuery={p.searchQuery}
          activeCourse={p.courseFilter}
          courses={p.courses}
          matchingCourses={p.matchingCourses}
          exitingNoteId={p.exitingNoteId}
          viewFilter={p.viewFilter}
          onEditNote={p.startEditNote}
          onDeleteNote={p.requestDeleteNote}
          onOpenNote={p.openNoteDetail}
          onToggleNoteFlag={p.toggleNoteFlag}
          onRestoreNote={p.restoreNote}
        />

        <BottomNav onCreate={p.openEditor} />

        <InstallHint />
      </div>

      <NoteEditor
        open={p.editorOpen}
        editing={p.editingNoteId !== null}
        onClose={p.closeEditor}
        courses={p.courses}
        noteTitle={p.noteTitle}
        onTitleChange={p.setNoteTitle}
        noteContent={p.noteContent}
        onContentChange={p.setNoteContent}
        courseDraft={p.courseDraft}
        onCourseDraftChange={p.setCourseDraft}
        saving={p.savingNote}
        onSave={p.saveNote}
      />

      <NoteDetail
        note={p.detailNote}
        courses={p.courses}
        onClose={p.closeNoteDetail}
        onToggleTask={p.toggleNoteTask}
        aiSummaryOpen={p.aiSummaryOpen}
        aiSummaryResult={p.aiSummaryResult}
        aiSummaryLoading={p.aiSummaryLoading}
        aiSummaryError={p.aiSummaryError}
        onRequestAiSummarize={p.requestAiSummarize}
        onReplaceWithAiSummary={p.replaceNoteWithAiSummary}
        onDiscardAiSummary={p.discardAiSummary}
        onEdit={(note) => {
          p.closeNoteDetail()
          p.startEditNote(note)
        }}
      />

      <AiCostConfirmDialog
        open={p.aiConfirmOpen}
        onConfirm={p.confirmAiSummarize}
        onCancel={p.cancelAiConfirm}
      />

      <CostConfirmDialog {...p.costConfirm} />

      <DeleteNoteDialog
        open={p.deleteTarget !== null}
        noteTitle={p.deleteTarget?.title ?? ""}
        deleting={p.deletingNote}
        permanent={Boolean(p.deleteTarget?.deleted)}
        onCancel={p.cancelDeleteNote}
        onConfirm={p.confirmDeleteNote}
      />
    </div>
  )
}
