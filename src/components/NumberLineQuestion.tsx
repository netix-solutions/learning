'use client';

import { useEffect, useState } from 'react';
import { SpeakButton } from '@/components/SpeakButton';
import { isNumberLineProblem, numberLineJumps, type NumberLineAnswer, type NumberLineProblem } from '@/lib/number-line';
import type { AttemptResult, PracticeQuestion, SubmittedAnswer } from '@/lib/types';
import './number-line.css';

type Props = { question: PracticeQuestion; result: AttemptResult | null; submitting: boolean; onSubmit: (answer: SubmittedAnswer) => void; onSupport?: () => void };
type Flight = { answer: NumberLineAnswer; stops: number[]; step: number; replay: boolean };

export function NumberLineQuestion(props: Props) {
  const problem = props.question.payload?.numberLine;
  if (!isNumberLineProblem(problem)) return <p role="alert">This number line could not load. Please start a new round.</p>;
  return <Rescue key={props.question.id} {...props} problem={problem} />;
}

function Rescue({ question, problem, result, submitting, onSubmit, onSupport }: Props & { problem: NumberLineProblem }) {
  const [direction, setDirection] = useState<1 | -1 | null>(null);
  const [tens, setTens] = useState('0');
  const [ones, setOnes] = useState('0');
  const [hint, setHint] = useState(false);
  const [message, setMessage] = useState('');
  const [flight, setFlight] = useState<Flight | null>(null);
  const [landed, setLanded] = useState(problem.start);
  const [trail, setTrail] = useState<number[]>([]);
  const busy = submitting || !!result || !!flight;
  const amount = Number(tens) * 10 + Number(ones);
  const ready = direction !== null && /^\d$/.test(tens) && /^\d$/.test(ones) && amount > 0;
  const position = flight?.step ? flight.stops[flight.step - 1] : landed;
  const stops = flight ? flight.stops.slice(0, flight.step) : trail;
  const hintText = `Start at ${problem.start}. The goal is ${problem.target}. Plus moves right to bigger numbers. Minus moves left to smaller numbers. Each ten makes a jump of ten. Then move the remaining ones.`;

  useEffect(() => {
    if (!flight) return;
    const timer = setTimeout(() => {
      if (flight.step < flight.stops.length) {
        setFlight({ ...flight, step: flight.step + 1 });
      } else {
        setLanded(flight.stops.at(-1)!);
        setTrail(flight.stops);
        setFlight(null);
        if (!flight.replay) onSubmit(flight.answer);
      }
    }, flight.step === 0 ? 80 : 500);
    return () => clearTimeout(timer);
  }, [flight, onSubmit]);

  function launch(answer: NumberLineAnswer, replay = false) {
    if (flight || submitting || (result && !replay)) return;
    const path = numberLineJumps(problem.start, answer);
    const end = path.at(-1);
    if (end === undefined || end < problem.min || end > problem.max) {
      setMessage(`That move goes past ${end !== undefined && end < problem.min ? problem.min : problem.max}. Try a smaller number or change direction.`);
      return;
    }
    setMessage('');
    setTrail([]);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLanded(end); setTrail(path);
      if (!replay) onSubmit(answer);
    } else {
      setLanded(problem.start);
      setFlight({ answer, stops: path, step: 0, replay });
    }
  }
  const revealed = Array.isArray(result?.correct) && result.correct.length === 2 &&
    [1, -1].includes(result.correct[0]) && Number.isInteger(result.correct[1]) && result.correct[1] > 0 && result.correct[1] <= 99
    ? result.correct as NumberLineAnswer : null;
  const jumpFrom = stops.length > 1 ? stops[stops.length - 2] : problem.start;
  const jumpLabel = stops.length ? `${position > jumpFrom ? '+' : '−'}${Math.abs(position - jumpFrom)}` : '';

  return <div className="number-line-game" data-silent-click>
    <div className="number-line-scene">
      <div className="number-line-mission"><strong>Number Line Rescue</strong><span>Start {problem.start} · Goal {problem.target}</span></div>
      <svg className="number-line-map" viewBox="0 0 600 230" role="img" aria-label={`Number line from ${problem.min} to ${problem.max}. Start ${problem.start}, goal ${problem.target}. Your spaceship is at ${position}.`}>
        <path d="M0 145Q90 65 180 138T360 132T600 120V230H0Z" fill="#d7e7ed"/>
        <path d="M0 175Q120 110 240 163T460 157T600 168V230H0Z" fill="#b8d6d6"/>
        <circle cx="54" cy="40" r="22" fill="#f6ce78"/><path d="m480 28 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#e8f6f7"/>
        <line x1="44" x2="556" y1="180" y2="180" stroke="#315b65" strokeWidth="3"/>
        {Array.from({ length: problem.max + 1 }, (_, n) => {
          const major = n % (problem.max === 20 ? 2 : 10) === 0;
          return <g key={n}><line x1={x(n, problem)} x2={x(n, problem)} y1={major ? 173 : 177} y2={major ? 187 : 183} stroke="#315b65" strokeWidth={major ? 2 : 1}/>{major && <text className={n % (problem.max === 20 ? 4 : 20) ? 'number-line-minor-label' : ''} x={x(n, problem)} y="213" textAnchor="middle" fontSize="24" fontWeight="800" fill="#214c57">{n}</text>}</g>;
        })}
        <g aria-hidden="true" transform={`translate(${x(problem.target, problem)},0)`}><line y1="65" y2="180" stroke="#a35d20" strokeWidth="2" strokeDasharray="4 5"/><rect x="-25" y="34" width="50" height="31" rx="10" fill="#ffdc87"/><text y="57" textAnchor="middle" fontSize="24" fontWeight="800" fill="#694414">{problem.target}</text><path d="m0 75 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z" fill="#f4b844" stroke="#a9671e" strokeWidth="2"/></g>
        {stops.map((stop, i) => { const from = i ? stops[i - 1] : problem.start; return <path key={i} d={`M${x(from, problem)} 176Q${(x(from, problem) + x(stop, problem)) / 2} ${138 - i % 2 * 12} ${x(stop, problem)} 176`} stroke="#23756d" strokeWidth="3" fill="none"/>; })}
        <g className={`number-line-ship ${flight?.step === 0 ? 'is-resetting' : ''}`} style={{ transform: `translateX(${x(position, problem)}px)` }} aria-hidden="true">
          <g key={`${flight?.step ?? 'landed'}`} className={flight?.step ? 'number-line-hop' : ''}>
            <path d="M-18 146Q-20 115 0 112Q20 115 18 146" fill="#d8f8f3" stroke="#236662" strokeWidth="3"/>
            <ellipse cy="147" rx="32" ry="10" fill="#2a827a" stroke="#174e4b" strokeWidth="3"/>
            <circle cx="-9" cy="132" r="3" fill="#174e4b"/><circle cx="9" cy="132" r="3" fill="#174e4b"/><path d="M-5 138Q0 142 5 138" fill="none" stroke="#174e4b" strokeWidth="2"/>
            <circle cx="-20" cy="147" r="3" fill="#ffe19a"/><circle cy="151" r="3" fill="#ffe19a"/><circle cx="20" cy="147" r="3" fill="#ffe19a"/>
            <path d="M-10 161 0 173 10 161" fill="#f5bb55"/>
          </g>
        </g>
      </svg>
      <p className="number-line-position" role="status">{flight ? flight.step ? `Moving: ${jumpFrom} ${jumpLabel} = ${position}` : 'Ready for launch…' : stops.length ? `Landed on ${position}${position === problem.target ? ' — goal reached!' : `. The goal is ${problem.target}.`}` : 'Choose your move, then press Go.'}</p>
    </div>
    {!result && <>
      <div className="number-line-equation" aria-label="Build your equation">
        <strong className="number-line-fixed">{problem.start}</strong>
        <div className="number-line-direction" role="group" aria-label="Choose plus or minus">{([1, -1] as const).map(sign => <button key={sign} type="button" aria-label={sign === 1 ? 'Plus: move right' : 'Minus: move left'} aria-pressed={direction === sign} disabled={busy} onClick={() => { setDirection(sign); setMessage(''); }}>{sign === 1 ? '+' : '−'}</button>)}</div>
        <Digit label="Tens" value={tens} disabled={busy} onChange={value => { setTens(value); setMessage(''); }}/>
        <Digit label="Ones" value={ones} disabled={busy} onChange={value => { setOnes(value); setMessage(''); }}/>
        <span aria-hidden="true">=</span><strong className="number-line-fixed">{problem.target}</strong>
      </div>
      <div className="number-line-actions"><button type="button" className="number-line-go" disabled={!ready || busy} onClick={() => direction && launch([direction, amount])}>{flight ? 'Flying…' : submitting ? 'Checking…' : 'Go!'}</button><button type="button" className="number-line-hint" aria-expanded={hint} disabled={!!flight || submitting} onClick={() => { setHint(!hint); if (!hint) onSupport?.(); }}>{hint ? 'Hide hint' : 'Show hint'}</button></div>
      {message && <p className="number-line-message" role="alert">{message}</p>}
      {hint && <div className="number-line-help"><p>{hintText}</p><SpeakButton id={`number-line-hint-${question.id}`} label="Read the hint" text={hintText}/></div>}
    </>}
    {result && revealed && <div className="number-line-review"><strong>{problem.start} {revealed[0] === 1 ? '+' : '−'} {revealed[1]} = {problem.target}</strong><button type="button" disabled={!!flight} onClick={() => launch(revealed, true)}>{flight ? 'Flying…' : result.is_correct ? 'Replay the jumps' : 'Show the right jumps'}</button></div>}
  </div>;
}
function x(value: number, problem: NumberLineProblem) { return 44 + (value - problem.min) / (problem.max - problem.min) * 512; }
function Digit({ label, value, disabled, onChange }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void }) {
  const number = Number(value);
  return <div className="number-line-digit"><span>{label}</span><button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={disabled || number >= 9} onClick={() => onChange(String(number + 1))}><Chevron/></button><input aria-label={label} inputMode="numeric" autoComplete="off" maxLength={1} value={value} disabled={disabled} onChange={event => { if (/^\d?$/.test(event.target.value)) onChange(event.target.value); }}/><button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={disabled || number <= 0} onClick={() => onChange(String(number - 1))}><Chevron down/></button></div>;
}
function Chevron({ down = false }: { down?: boolean }) { return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={down ? 'm5 7 5 5 5-5' : 'm5 12 5-5 5 5'}/></svg>; }
