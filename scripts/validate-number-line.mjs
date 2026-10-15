// Independently solve the authored questions and check the animated paths.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {numberLineQuestions} from './number-line-content.mjs';
import {isNumberLineProblem,numberLineJumps} from '../src/lib/number-line.ts';

const rows=numberLineQuestions(),seen=new Set();
assert.equal(rows.length,72);
for(const q of rows){
 const p=q.payload.numberLine,delta=p.target-p.start;
 assert(isNumberLineProblem(p));
 assert.equal(q.kind,'numberline');assert.equal(q.subject_id,'math');
 assert.deepEqual(q.answer,[Math.sign(delta),Math.abs(delta)]);
 assert.equal(q.answer_index,null);
 assert(!JSON.stringify(q.payload).includes('answer'));
 const key=`${q.grade}:${p.start}:${p.target}`;assert(!seen.has(key));seen.add(key);
 assert(q.prompt.includes(`Start at ${p.start}.`));assert(q.prompt.includes(`star at ${p.target}.`));
 const path=numberLineJumps(p.start,q.answer);
 assert.equal(path.at(-1),p.target);assert.equal(path.length,Math.ceil(Math.abs(delta)/10));
 path.forEach((stop,i)=>{
  const previous=i?path[i-1]:p.start,step=stop-previous;
  assert(stop>=p.min&&stop<=p.max);assert.equal(Math.sign(step),Math.sign(delta));
  assert.equal(Math.abs(step),i===path.length-1?(Math.abs(delta)%10||10):10);
 });
 assert(q.explanation.includes([p.start,...path].join(' → ')));
 if(q.grade==='1'&&q.difficulty===1){assert.equal(p.max,20);assert(Math.abs(delta)<10);}
 else assert.equal(p.max,100);
 if((q.grade==='1'&&q.difficulty>1)||(q.grade==='2'&&q.difficulty===1))assert.equal(Math.abs(delta)%10,0);
 if(q.grade==='2'&&q.difficulty>=2)assert(Math.abs(delta)>10&&Math.abs(delta)%10>0);
}
for(const grade of ['1','2'])for(const level of [1,2,3]){
 const stage=rows.filter(q=>q.grade===grade&&q.difficulty===level);
 assert.equal(stage.length,12);assert.equal(stage.filter(q=>q.answer[0]===1).length,6);
}
assert.deepEqual(numberLineJumps(41,[1,20]),[51,61]);
assert.deepEqual(numberLineJumps(72,[-1,33]),[62,52,42,39]);
assert.deepEqual(numberLineJumps(90,[1,10]),[100]);
assert.deepEqual(numberLineJumps(10,[-1,10]),[0]);
for(const answer of [[1,0],[1,-1],[1,100],[1,1.5],[0,20],[2,20]])assert.deepEqual(numberLineJumps(41,answer),[]);
for(const p of [null,{}, {start:41,target:61,min:1,max:100},{start:41,target:41,min:0,max:100},{start:0,target:100,min:0,max:100},{start:1.5,target:20,min:0,max:20},{start:1,target:21,min:0,max:20}])assert(!isNumberLineProblem(p));
const seed=readFileSync('supabase/seeds/number-line.sql','utf8');
assert.deepEqual(JSON.parse(seed.split('$math_progression$')[1]),rows,'Regenerate the content SQL.');
console.log('72 original questions verified: grades 1–2, three stages each, balanced addition/subtraction, correct keys and animated tens/ones paths.');
