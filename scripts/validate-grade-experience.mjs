import assert from 'node:assert/strict';
import { GRADE_EXPERIENCES, mixedRoundCounts } from '../src/lib/grade-experience.ts';
const grades = ['K','1','2','3','4','5'];
assert.equal(new Set(grades.map(g=>GRADE_EXPERIENCES[g].name)).size, 6);
assert.equal(new Set(grades.map(g=>GRADE_EXPERIENCES[g].setting)).size, 6);
for (const grade of ['PK', ...grades]) {
  const experience = GRADE_EXPERIENCES[grade];
  const counts = mixedRoundCounts(experience.roundSize);
  assert.equal(counts.reduce((a,b)=>a+b), experience.roundSize);
  assert.ok(counts.every(n=>n>=1));
  assert.ok(experience.roundSize >= 4 && experience.roundSize <= 12);
}
assert.equal(GRADE_EXPERIENCES.K.autoRead, true);
assert.equal(GRADE_EXPERIENCES['5'].autoRead, false);
console.log('Distinct K–5 settings, accessible defaults, and balanced mixed round lengths passed.');
