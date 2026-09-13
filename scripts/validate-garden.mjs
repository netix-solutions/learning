import assert from 'node:assert/strict';
import { gardenProgress } from '../src/lib/garden.ts';
// A practice flower is earned at the boundary, not before it. Lesson rewards
// must not erase partial question progress, and revisiting cannot spend flowers.
for (const [attempts, lessons, flowers, partial] of [
  [0,0,0,0], [4,0,0,4], [5,0,1,0], [9,0,1,4], [10,0,2,0],
  [0,1,1,0], [4,1,1,4], [14,3,5,4], [100,7,27,0],
]) {
  const progress = gardenProgress(attempts, lessons);
  assert.equal(progress.flowers, flowers);
  assert.equal(progress.questionsTowardFlower, partial);
  assert.deepEqual(gardenProgress(attempts, lessons), progress);
  assert.ok(gardenProgress(attempts + 1, lessons).flowers >= flowers);
  assert.equal(gardenProgress(attempts, lessons + 1).flowers, flowers + 1);
}
console.log('Garden: practice boundaries, lessons, preserved partial progress, and no spending passed.');
