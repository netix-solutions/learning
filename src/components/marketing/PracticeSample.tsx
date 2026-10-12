'use client';
import { useState } from 'react';

const samples = [
  { id: 'math', name: 'Math', prompt: 'You have 8 shells and find 7 more. How many shells do you have now?', choices: ['14', '15', '16'], answer: 1, hint: 'Try making ten: 8 plus 2 is 10. There are 5 more to add.', explanation: '8 + 7 = 15. Making a ten can help you add!' },
  { id: 'reading', name: 'Reading', passage: 'Mia planted a seed in a pot. She put the pot by the window and watered it every morning.', prompt: 'Where did Mia put the pot?', choices: ['Under the bed', 'On the roof', 'By the window'], answer: 2, hint: 'Look at the second sentence. It tells you where the pot went.', explanation: 'The story says she put the pot by the window. You found the detail!' },
  { id: 'science', name: 'Science', prompt: 'Which part of a plant takes in water from the soil?', choices: ['Roots', 'Flowers', 'Leaves'], answer: 0, hint: 'Think about the part that grows down into the soil.', explanation: 'Roots take in water from the soil and help hold a plant in place.' },
] as const;

export function PracticeSample() {
  const [subject, setSubject] = useState(0);
  return <div className="landing-sample" data-silent-click>
    <div role="group" aria-label="Choose a sample subject" className="landing-sample-tabs">{samples.map((sample, index) => <button key={sample.id} aria-pressed={subject === index} onClick={() => setSubject(index)}>{sample.name}</button>)}</div>
    <SampleQuestion key={subject} sample={samples[subject]} />
    <p className="landing-sample-note">Example questions. Your child’s saved practice starts in their account.</p>
  </div>;
}
function SampleQuestion({ sample }: { sample: typeof samples[number] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const correct = selected === sample.answer;
  return <div className="landing-sample-question">
    <span className="landing-small-label">Grade 2 sample</span>
    {'passage' in sample && <p className="landing-sample-passage">{sample.passage}</p>}
    <h3>{sample.prompt}</h3>
    <div className="landing-sample-answers" role="group" aria-label="Choose your answer">{sample.choices.map((choice, index) => <button key={choice} aria-pressed={selected === index} className={selected === index ? correct ? 'is-correct' : 'try-again' : ''} onClick={() => setSelected(index)}>{choice}{selected === index && <span aria-hidden="true">{correct ? '✓' : '↻'}</span>}</button>)}</div>
    <div className="landing-sample-result" role="status">{selected === null ? 'Give it a try. Every attempt is a step forward.' : correct ? sample.explanation : 'Not quite yet. Try another answer, or use a hint.'}</div>
    <button className="landing-hint-button" aria-expanded={hint} onClick={() => setHint(!hint)}>{hint ? 'Hide hint' : 'Show a hint'}</button>
    {hint && <p className="landing-sample-hint">{sample.hint}</p>}
  </div>;
}
