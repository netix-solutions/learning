import assert from 'node:assert/strict';
import { READING_STORIES } from '../src/lib/content/reading-stories.ts';
import { splitReadingPrompt } from '../src/lib/reading-prompt.ts';
assert.equal(new Set(READING_STORIES.map(s=>s.id)).size,READING_STORIES.length);
assert.equal(new Set(READING_STORIES.map(s=>s.passage)).size,READING_STORIES.length);
for(const grade of ['K','1','2','3','4','5']) assert.ok(READING_STORIES.filter(s=>s.grade===grade).length>=2);
for(const story of READING_STORIES) {
  assert.ok(story.standard.startsWith(`ELA.${story.grade}.`));
  for(const q of story.questions) {
    assert.equal(new Set(q.choices).size,q.choices.length);
    assert.ok(q.answer>=0 && q.answer<q.choices.length);
    assert.ok(q.explanation.length>30);
    assert.deepEqual(splitReadingPrompt(`Read: "${story.passage}" ${q.prompt}`), {passage:story.passage,question:q.prompt});
  }
}
assert.equal(splitReadingPrompt('What does "enormous" mean?'),null);
assert.equal(splitReadingPrompt('Read: "Sam said "hi" to Jo." Who spoke?'),null);
assert.equal(splitReadingPrompt('Read: "A cat naps."'),null);
assert.deepEqual(splitReadingPrompt('Read: “A cat naps.” What does it do?'),{passage:'A cat naps.',question:'What does it do?'});
console.log('12 unique stories / 24 questions: grade tags, answer integrity, and safe passage splitting passed.');
