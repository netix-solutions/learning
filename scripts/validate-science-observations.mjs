import assert from 'node:assert/strict';
import { SCIENCE_OBSERVATIONS } from '../src/lib/content/science-observations.ts';
import { isScienceObservation, observationNarration } from '../src/lib/science-observation.ts';
for(const grade of ['K','1','2','3','4','5']) assert.equal(SCIENCE_OBSERVATIONS.filter(a=>a.grade===grade).length,1);
for(const a of SCIENCE_OBSERVATIONS){
 assert(isScienceObservation(a.observation));assert(observationNarration(a.observation).length<1800);
 assert(!JSON.stringify(a.observation).includes('answer_index'));
 for(const q of a.questions){assert.equal(new Set(q.choices).size,q.choices.length);assert(q.answer>=0&&q.answer<q.choices.length);}
}
const ramp=SCIENCE_OBSERVATIONS.find(a=>a.grade==='3').observation;
assert.deepEqual(ramp.rows.map(r=>r.amount),[40,65,90]);assert.equal(ramp.scaleMax,100);
assert.deepEqual(ramp.rows.map(r=>r.values[0]),ramp.rows.map(r=>`${r.amount} cm`));
const weather=SCIENCE_OBSERVATIONS.find(a=>a.grade==='1');assert.equal(weather.observation.rows.filter(r=>r.symbol==='rain').length,Number(weather.questions[0].choices[weather.questions[0].answer]));
const cups=SCIENCE_OBSERVATIONS.find(a=>a.grade==='4').observation.rows;
assert.deepEqual(cups.map(r=>parseInt(r.values[0])-parseInt(r.values[1])),[10,6,3]);
const trials=SCIENCE_OBSERVATIONS.find(a=>a.grade==='5').observation.rows.map(r=>r.values.map(parseFloat));assert(Math.min(...trials[2])>Math.max(...trials[0],...trials[1]));
assert(!isScienceObservation({...ramp,scaleMax:0}));assert(!isScienceObservation({...ramp,rows:[{label:'Bad',values:['9'],amount:900}]}));assert(!isScienceObservation({format:'table',rows:[]}));
console.log('Observation schemas, chart scales, narration bounds, and quantitative evidence checks passed.');
