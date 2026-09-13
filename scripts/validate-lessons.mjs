import assert from 'node:assert/strict';
import { LESSONS, lessonsForGrade } from '../src/lib/lessons.ts';

const grades = ['PK', 'K', '1', '2', '3', '4', '5'];
assert.equal(new Set(LESSONS.map(l => l.id)).size, LESSONS.length, 'Lesson IDs must be unique for saved progress');
for (const grade of grades) {
  const lessons = lessonsForGrade(grade);
  assert.deepEqual([...new Set(lessons.map(l => l.subject))], ['reading', 'math', 'science'], `${grade}: all introductory subjects must be reachable`);
  for (const l of lessons) {
    for (const field of ['title', 'goal', 'reflect']) assert.ok(l[field]?.trim(), `${l.id}: missing ${field}`);
    assert.equal(l.steps.length, 3);
    assert.equal(l.model.length, 3);
    assert.ok(l.steps.every(s => s.trim()) && l.model.every(s => s.trim()));
    assert.notEqual(l.check.prompt, l.transfer.prompt, `${l.id}: transfer must use a different question`);
    for (const q of [l.check, l.transfer]) {
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, `${l.id}: inaccessible answer`);
      assert.equal(new Set(q.choices).size, q.choices.length, `${l.id}: ambiguous duplicate choices`);
      assert.ok(q.explanation.trim());
    }
  }
}
// Independently calculate the numerical transfer keys, not just their shape.
const numericTransfers = { 'PK-count': 4, 'K-add': 2 + 3, '1-ten': 7 + 5, '2-place': 36 + 18, '3-groups': 4 * 3, '5-decimal': 2.35 + 0.7 };
for (const [id, expected] of Object.entries(numericTransfers)) {
  const q = LESSONS.find(l => l.id === id).transfer;
  assert.ok(Math.abs(Number(q.choices[q.answer]) - expected) < 1e-10, `${id}: incorrect arithmetic key`);
}
const fraction = LESSONS.find(l => l.id === '4-equivalent').transfer;
const [n, d] = fraction.choices[fraction.answer].split('/').map(Number);
assert.equal(n * 4, d * 3, 'Equivalent fraction key must equal 3/4');
console.log(`Validated ${LESSONS.length} introductory lessons, all grade/subject entry points, ${LESSONS.length * 2} question structures, and 7 math transfer keys. Reading/science require editorial review; these checks do not establish full curriculum coverage.`);
