'use client';
import { useState } from 'react';
import { QuestionInteraction } from '@/components/QuestionTypes';
import type { PracticeQuestion, QuestionKind, SubmittedAnswer } from '@/lib/types';
export default function Preview() {
  const [kind, setKind] = useState<QuestionKind>('match');
  const [grade, setGrade] = useState('K');
  const [number, setNumber] = useState(0);
  const [answer, setAnswer] = useState<SubmittedAnswer | null>(null);
  const question: PracticeQuestion = { id: `${kind}-${number}`, grade: 'K', subject_id: 'reading', standard: null, xp: 0, prompt: 'Interaction check', kind, choices: ['True', 'False'], payload: { left: ['sun', 'moon'], right: ['night', 'day'], items: ['first', 'next', 'last'], buckets: ['Beginning', 'Ending'], tokens: ['The', 'cat', 'runs.'] } };
  return <main data-grade={grade} className="grade-quiz mx-auto w-full min-w-0 max-w-3xl px-4 py-6">
    <h1>Interaction preview · no answers saved</h1>
    <label>Grade <select aria-label="Grade" value={grade} onChange={e => setGrade(e.target.value)}>{['K','1','2','3','4','5'].map(g => <option key={g}>{g}</option>)}</select></label>
    <label>Type <select aria-label="Type" value={kind} onChange={e => { setKind(e.target.value as QuestionKind); setAnswer(null); }}>{['match','order','categorize','tapword','truefalse'].map(k => <option key={k}>{k}</option>)}</select></label>
    <button onClick={() => {setNumber(n => n + 1); setAnswer(null);}}>Next sample question</button>
    <div className="rounded-3xl bg-white p-6 sm:p-8"><QuestionInteraction question={question} result={null} submitting={false} onSubmit={setAnswer} /></div>
    <output aria-label="Submitted answer">{JSON.stringify(answer)}</output>
  </main>;
}
