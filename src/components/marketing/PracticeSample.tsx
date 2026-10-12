'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Confetti } from '@/components/Confetti';
import { audioSettings, serverAudioSettings, setAudioEnabled, subscribeAudioSettings } from '@/lib/audio-settings';
import { playSound, preloadSounds, unlockAudio } from '@/lib/sound';

const samples = [
  { id: 'math', name: 'Math', prompt: 'You have 8 shells and find 7 more. How many shells do you have now?', choices: ['14', '15', '16'], answer: 1, hint: 'Try making ten: 8 plus 2 is 10. There are 5 more to add.', explanation: '8 + 7 = 15. Making a ten can help you add!' },
  { id: 'reading', name: 'Reading', passage: 'Mia planted a seed in a pot. She put the pot by the window and watered it every morning.', prompt: 'Where did Mia put the pot?', choices: ['Under the bed', 'On the roof', 'By the window'], answer: 2, hint: 'Look at the second sentence. It tells you where the pot went.', explanation: 'The story says she put the pot by the window. You found the detail!' },
  { id: 'science', name: 'Science', prompt: 'Which part of a plant takes in water from the soil?', choices: ['Roots', 'Flowers', 'Leaves'], answer: 0, hint: 'Think about the part that grows down into the soil.', explanation: 'Roots take in water from the soil and help hold a plant in place.' },
] as const;

export function PracticeSample() {
  const [subject, setSubject] = useState(0);
  const [focusQuestion, setFocusQuestion] = useState(false);
  const settings = useSyncExternalStore(subscribeAudioSettings, audioSettings, serverAudioSettings);
  useEffect(() => { preloadSounds('win'); }, []);
  const nextSubject = (subject + 1) % samples.length;
  return <div className="landing-sample" data-silent-click>
    <div className="landing-sample-toolbar"><span>Give SunSharp a try</span><button type="button" aria-label="Sample sound effects" aria-pressed={settings.effects} onClick={() => { unlockAudio(); setAudioEnabled('effects', !settings.effects); }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9v6h4l5 4V5L7 9H3z"/>{settings.effects ? <path d="M16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/> : <path d="m17 9 5 6m0-6-5 6"/>}</svg>Sound {settings.effects ? 'on' : 'off'}</button></div>
    <div role="group" aria-label="Choose a sample subject" className="landing-sample-tabs">{samples.map((sample, index) => <button key={sample.id} aria-pressed={subject === index} onClick={() => { setFocusQuestion(false); setSubject(index); }}>{sample.name}</button>)}</div>
    <SampleQuestion key={subject} sample={samples[subject]} nextName={samples[nextSubject].name.toLowerCase()} focusOnMount={focusQuestion} onNext={() => { setFocusQuestion(true); setSubject(nextSubject); }} />
    <p className="landing-sample-note">Example questions. Your child’s saved practice starts in their account.</p>
  </div>;
}
function SampleQuestion({ sample, nextName, focusOnMount, onNext }: { sample: typeof samples[number]; nextName: string; focusOnMount: boolean; onNext: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!focusOnMount) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: 'nearest' });
  }, [focusOnMount]);
  const correct = selected === sample.answer;
  function chooseAnswer(index: number) {
    if (correct) return;
    setSelected(index);
    if (index === sample.answer) playSound('win');
  }
  return <div className="landing-sample-question">
    <Confetti fire={correct ? 1 : 0} count={64} />
    <span className="landing-small-label">Grade 2 sample</span>
    {'passage' in sample && <p className="landing-sample-passage">{sample.passage}</p>}
    <h3 ref={heading} tabIndex={-1}>{sample.prompt}</h3>
    <div className="landing-sample-answers" role="group" aria-label="Choose your answer">{sample.choices.map((choice, index) => <button key={choice} type="button" aria-pressed={selected === index} aria-disabled={correct} className={selected === index ? correct ? 'is-correct' : 'try-again' : ''} onClick={() => chooseAnswer(index)}>{choice}{selected === index && (correct ? <svg className="landing-sample-check" aria-hidden="true" width="25" height="25" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m6.5 12 3.5 3.5 7.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : <span aria-hidden="true">↻</span>)}</button>)}</div>
    <div className="landing-sample-result" role="status" aria-atomic="true">{correct ? <div className="landing-sample-celebration"><Image className="landing-sample-mascot" src="/images/ui/logo-sunbook.webp" alt="" width={64} height={64} /><div><strong>You got it!</strong><p>{sample.explanation}</p></div></div> : <p>{selected === null ? 'Give it a try. Every attempt is a step forward.' : 'Not quite yet. Try another answer, or use a hint.'}</p>}</div>
    {correct ? <button type="button" className="landing-sample-next" onClick={onNext}>Try {nextName}<svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h13m-5-5 5 5-5 5"/></svg></button> : <button className="landing-hint-button" aria-expanded={hint} onClick={() => setHint(!hint)}>{hint ? 'Hide hint' : 'Show a hint'}</button>}
    {hint && !correct && <p className="landing-sample-hint">{sample.hint}</p>}
  </div>;
}
