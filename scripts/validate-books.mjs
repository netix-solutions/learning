import assert from 'node:assert/strict';
import fs from 'node:fs';
import {books} from './books/catalog.mjs';
import {readingTick,READING_IDLE_MS} from '../src/lib/books/timing.ts';
import {checkpointFor} from '../src/lib/books/types.ts';
const generated=JSON.parse(fs.readFileSync('src/lib/books/catalog.json','utf8'));
assert.deepEqual(generated,books,'Regenerate the checked-in catalog after editing stories.');
assert.equal(books.length,56);assert.equal(new Set(books.map(b=>b.id)).size,56);
for(const grade of ['PK','K','1','2','3','4','5'])assert.equal(books.filter(b=>b.grade===grade).length,8,grade);
for(const book of books){
 assert.ok(book.pages.length>=4&&book.pages.length<=8);assert.ok(book.pages.every(p=>p.trim().length));
 assert.equal(book.questions.length,['PK','K'].includes(book.grade)?2:3);
 assert.ok(fs.existsSync(`public/images/books/stories/${book.id}.webp`),book.id);
 assert.ok(fs.existsSync(`public/images/books/${book.world}.webp`));
 for(const v of book.vocabulary)assert.ok(v.meaning&&book.pages.join(' ').toLowerCase().includes(v.word.toLowerCase()),`${book.id} vocabulary ${v.word}`);
 for(const [i,q] of book.questions.entries()){
  assert.equal(q.choices.length,3);assert.equal(new Set(q.choices).size,3);assert.ok(q.answer>=0&&q.answer<3);
  assert.ok(q.evidencePage>=0&&q.evidencePage<book.pages.length);assert.ok(q.explanation.length>15);assert.ok(checkpointFor(book,i)>=q.evidencePage);
 }
}
assert.equal(readingTick(1000,true,200,true),1000);
assert.equal(readingTick(15000,true,200,true),2500,'suspended timers must not jump');
assert.equal(readingTick(1000,false,200,true),0,'hidden tabs do not count');
assert.equal(readingTick(1000,true,READING_IDLE_MS,true),0,'idle pauses');
assert.equal(readingTick(1000,true,200,false),0,'paused timers do not count');
assert.equal(readingTick(-100,true,200,true),0);
console.log(`Validated ${books.length} books, ${books.reduce((n,b)=>n+b.questions.length,0)} comprehension questions, 64 image paths, checkpoint evidence and timer boundaries.`);
console.table(['PK','K','1','2','3','4','5'].map(grade=>{const set=books.filter(b=>b.grade===grade);return {grade,books:set.length,minWords:Math.min(...set.map(b=>b.words)),maxWords:Math.max(...set.map(b=>b.words)),midwayChecks:set.filter(b=>b.questions.some((q,i)=>checkpointFor(b,i)===1)).length};}));
