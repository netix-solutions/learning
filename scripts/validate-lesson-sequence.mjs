import assert from 'node:assert/strict';
import { LESSONS, lessonsForGrade } from '../src/lib/lessons.ts';
import { suggestedLessonIndex } from '../src/lib/lesson-sequence.ts';
const byId = new Map(LESSONS.map(l => [l.id, l]));
function visit(id, path = []) {
  assert.ok(!path.includes(id), `Cyclic prerequisite: ${[...path, id]}`);
  const lesson = byId.get(id);
  assert.ok(lesson, `Unknown prerequisite ${id}`);
  for (const prerequisite of lesson.prerequisiteIds ?? []) {
    const before = byId.get(prerequisite);
    assert.ok(before, `Missing lesson ${prerequisite}`);
    assert.equal(before.grade, lesson.grade, 'Prerequisites must be accessible to this grade');
    assert.equal(before.subject, lesson.subject);
    visit(prerequisite, [...path, id]);
  }
}
LESSONS.forEach(l => visit(l.id));
for (const grade of ['PK', 'K', '1', '2', '3', '4', '5']) {
  const lessons = lessonsForGrade(grade);
  const completed = [];
  while (completed.length < lessons.length) {
    const l = lessons[suggestedLessonIndex(lessons, completed, 'reading')];
    assert.ok(!completed.includes(l.id), 'Sequence got stuck repeating completed content');
    assert.ok((l.prerequisiteIds ?? []).every(id => completed.includes(id)));
    completed.push(l.id);
  }
}
const first = lessonsForGrade('1');
const next = ids => first[suggestedLessonIndex(first, ids, 'reading')].id;
assert.equal(next([]), '1-short-vowels');
assert.equal(next(['1-short-vowels', '1-sh']), '1-silent-e');
assert.equal(next(['1-short-vowels', '1-sh', '1-silent-e']), '1-cape-story');
console.log('Lesson paths have accessible prerequisites, no cycles, and reach every lesson without repeating completed steps.');
