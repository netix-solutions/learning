import type { Lesson } from "./lessons";

// Completion selects a suggested next experience; it never establishes mastery.
// Prerequisites are recommendations, so a family can revisit or choose freely.
export function suggestedLessonIndex(lessons: Lesson[], completedIds: string[], preferredSubject?: Lesson["subject"]): number {
  const completed = new Set(completedIds);
  const ready = (l: Lesson) => !completed.has(l.id) && (l.prerequisiteIds ?? []).every(id => completed.has(id));
  const preferred = lessons.findIndex(l => l.subject === preferredSubject && ready(l));
  if (preferred >= 0) return preferred;
  const next = lessons.findIndex(ready);
  return next >= 0 ? next : 0;
}
