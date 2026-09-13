import assert from 'node:assert/strict';
import { MATH_LABS, makeTenState, regroupState, equivalentHalf, decimalState } from '../src/lib/math-labs.ts';
import { LESSONS } from '../src/lib/lessons.ts';
for (const lesson of LESSONS.filter(l=>l.subject==='math')) assert.ok(MATH_LABS[lesson.id],`Missing manipulative for ${lesson.id}`);
for (let move=0;move<=2;move++) {
  const s=makeTenState(move);
  assert.equal(s.inside+s.outside,8+5,'Moving counters must preserve the total');
  assert.ok(s.inside<=10);
}
assert.equal(makeTenState(2).outside,3);
for (const traded of [false,true]) {
  const s=regroupState(traded);
  assert.equal(s.tens*10+s.ones,27+15,'Regrouping must preserve value');
}
for(let cut=0;cut<=3;cut++) {
  const s=equivalentHalf(cut);
  assert.equal(s.numerator*2,s.denominator,'Every split must preserve half the same whole');
}
for(let tenth=0;tenth<=4;tenth++) {
  const s=decimalState(tenth);
  assert.equal(s.totalHundredths,125+10*tenth);
  assert.equal(s.hundredths,25+10*tenth);
  assert.equal(Math.round(Number(s.label)*100),s.totalHundredths);
}
assert.equal(decimalState(4).label,'1.65');
console.log('All seven math lessons have activities; counter moves, regrouping, fraction splits, and decimal additions preserve their quantities.');
