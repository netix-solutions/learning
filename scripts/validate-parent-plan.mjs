import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const cache = new Map();
function load(file) {
  if(cache.has(file)) return cache.get(file);
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{exports,require:name=>load(`src/lib/${name.replace('./','')}.ts`)});
  cache.set(file,exports);return exports;
}
const {parentPracticePlan, SUPPORT_LESSONS}=load('src/lib/parent-practice-plan.ts');
const {LESSONS}=load('src/lib/lessons.ts');
const now=Date.parse('2026-10-07T12:00:00Z');
const row={skill:'2.addsub',attempts:6,independent_attempts:4,independent_correct:2,supported_attempts:2,unknown_support_attempts:0,last_practiced:'2026-10-06T12:00:00Z',state:'support'};
const subject=(rows,extra={})=>({id:'math',name:'Math',progress:rows,...extra});
const plan=(rows,grade='2',extra={})=>parentPracticePlan([subject(rows,extra)],grade,now);
assert.equal(plan([row]).steps[0].lesson.id,'2-place');
assert.equal(plan([row],'3').steps[0].lesson,undefined,'Do not suggest another grade’s lesson');
assert.equal(plan([row],'2',{id:'reading'}).steps[0].lesson,undefined,'Do not cross subject boundaries');
assert.equal(plan([row],'2',{unavailable:true}).steps.length,0);
for(const date of [null,'bad','2026-01-01T00:00:00Z','2026-10-08T00:00:00Z'])assert.equal(plan([{...row,last_practiced:date}]).steps.length,0);
assert.equal(plan([{...row,independent_attempts:0,supported_attempts:0,unknown_support_attempts:6}]).steps.length,0);
assert.equal(plan([{...row,state:'secure'}]).steps.length,0);
assert.equal(plan([{...row,state:'secure'}]).hasRecentEvidence,true);
assert.equal(plan([]).hasRecentEvidence,false);
const rows=[{...row,skill:'2.place',state:'building'},row,{...row,skill:'2.skip'},row];
const original=JSON.stringify(rows);const ranked=plan(rows).steps;
assert.equal(ranked.length,2);assert(ranked.every(r=>r.state==='support'));
assert.equal(JSON.stringify(rows),original,'Never mutate report evidence');
assert.equal(plan([row,row]).steps.length,1);
assert.equal(plan([{...row,skill:'unmapped'}]).steps[0].lesson,undefined);
for(const [skill,id] of Object.entries(SUPPORT_LESSONS)) {
 const lesson=LESSONS.find(l=>l.id===id);assert(lesson);assert.equal(lesson.grade,skill.split('.')[0]);
}
console.log('Parent plan: grade/subject isolation, sparse/old/failed evidence, support priority, deduplication, stable input and lesson references passed.');
