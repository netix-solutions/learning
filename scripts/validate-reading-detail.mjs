import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {READING_DETAIL_ITEMS,readingDetailQuestions} from './reading-detail-content.mjs';
import {readingDetailSQL} from './generate-reading-detail.mjs';
import {splitReadingPrompt} from '../src/lib/reading-prompt.ts';
const rows=readingDetailQuestions();
assert.equal(rows.length,24);
assert.equal(new Set(READING_DETAIL_ITEMS.map(q=>q.id)).size,24);
assert.equal(new Set(READING_DETAIL_ITEMS.map(q=>q.passage)).size,24);
for(const [i,item] of READING_DETAIL_ITEMS.entries()) {
 const row=rows[i];
 assert.ok(item.passage.includes(item.evidence),`${item.id}: evidence must be verbatim`);
 assert.ok(item.passage.split(/\s+/).length<=65,`${item.id}: keep passages short`);
 assert.equal(row.subject_id,'reading');assert.equal(row.grade,'3');assert.equal(row.skill,'3.detail');
 assert.equal(row.choices.length,4);assert.equal(new Set(row.choices).size,4);
 assert.equal(row.choices[row.answer_index],item.correct);
 assert.deepEqual(splitReadingPrompt(row.prompt),{passage:item.passage,question:item.prompt});
 assert.ok(item.explanation.length>40);
}
for(const stage of [1,2,3]) {
 const selected=rows.filter(q=>q.difficulty===stage);
 assert.equal(selected.length,8);
 for(const position of [0,1,2,3])assert.equal(selected.filter(q=>q.answer_index===position).length,2);
}
const sql=readingDetailSQL(rows);
assert.equal(readFileSync('supabase/seeds/reading-detail.sql','utf8'),sql);
assert.equal(readFileSync('supabase/migrations/20261008015414_reading_detail_progression.sql','utf8'),sql);
console.log('24 unique passages: evidence excerpts, answer positions, passage rendering, stage supply and generated SQL agree. Semantic review remains a separate editorial check.');
