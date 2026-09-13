"use client";
import { useState } from "react";
import { decimalState, equivalentHalf, makeTenState, mathLabFor, regroupState } from "@/lib/math-labs";
import { RecordedNarration } from "@/components/LessonNarration";

const ACTION = "min-h-12 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white disabled:bg-slate-200 disabled:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800";
const SECONDARY = "min-h-12 rounded-xl bg-white px-4 py-3 font-bold text-slate-700 ring-1 ring-slate-300";
type Props = { onComplete: () => void };

export function MathLab({ lessonId, onComplete }: Props & { lessonId: string }) {
  const spec = mathLabFor(lessonId);
  if (!spec) return null;
  return <section className="lesson-lab space-y-5" aria-label={spec.title}>
    <div className="flex items-start gap-3">
      <div className="flex-1"><h3 className="font-display text-2xl font-bold">{spec.title}</h3><p className="mt-2 leading-relaxed text-slate-600">{spec.instruction}</p></div>
      <RecordedNarration id={`${lessonId}:explore`} text={spec.instruction} />
    </div>
    {spec.kind === "count" && <CountLab onComplete={onComplete} />}
    {spec.kind === "join" && <JoinLab onComplete={onComplete} />}
    {spec.kind === "ten" && <TenLab onComplete={onComplete} />}
    {spec.kind === "regroup" && <RegroupLab onComplete={onComplete} />}
    {spec.kind === "array" && <ArrayLab onComplete={onComplete} />}
    {spec.kind === "fraction" && <FractionLab onComplete={onComplete} />}
    {spec.kind === "decimal" && <DecimalLab onComplete={onComplete} />}
  </section>;
}

function CountLab({ onComplete }: Props) {
  const [counted, setCounted] = useState<number[]>([]);
  return <>
    <div className="grid grid-cols-3 gap-3 rounded-2xl bg-cyan-50 p-4 sm:grid-cols-5">
      {[0, 1, 2, 3, 4].map(i => {
        const order = counted.indexOf(i);
        return <button key={i} aria-label={`Shell ${i + 1}${order >= 0 ? `, counted as ${order + 1}` : ', not counted'}`} aria-disabled={order >= 0}
          onClick={() => { if (order >= 0) return; const next = [...counted, i]; setCounted(next); if (next.length === 5) onComplete(); }}
          className={`lab-counter relative min-h-24 rounded-2xl border-2 p-3 ${order >= 0 ? "border-emerald-500 bg-emerald-50" : "border-cyan-200 bg-white"}`}>
          <span aria-hidden="true" className="text-4xl">🐚</span>
          <span aria-hidden="true" className="mt-2 block text-xl font-bold">{order >= 0 ? `${order + 1} ✓` : "Tap"}</span>
        </button>;
      })}
    </div>
    <p role="status" className="text-center text-xl font-bold">{counted.length === 5 ? "5 shells! The last number tells how many." : `${counted.length} counted. Touch a shell without a check mark.`}</p>
    <button className={SECONDARY} onClick={() => setCounted([])}>Count again</button>
  </>;
}

function Dots({ total, blue = total }: { total: number; blue?: number }) {
  return <div aria-hidden="true" className="flex flex-wrap justify-center gap-2">{Array.from({length: total}, (_, i) => <span key={i} className={`lab-dot h-8 w-8 rounded-full border-2 border-white shadow-sm ${i < blue ? "bg-sky-600" : "bg-orange-500"}`} />)}</div>;
}
function JoinLab({ onComplete }: Props) {
  const [moved, setMoved] = useState(0);
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="min-h-32 rounded-2xl bg-sky-50 p-5" role="img" aria-label={`Joined group: ${2 + moved} counters`}><p className="mb-4 text-center font-bold">Together: {2 + moved}</p><Dots total={2 + moved} blue={2} /></div>
      <div className="min-h-32 rounded-2xl bg-orange-50 p-5" role="img" aria-label={`${3 - moved} counters left to join`}><p className="mb-4 text-center font-bold">Still to join: {3 - moved}</p><Dots total={3 - moved} blue={0} /></div>
    </div>
    <button className={ACTION} disabled={moved === 3} onClick={() => { setMoved(moved + 1); if (moved + 1 === 3) onComplete(); }}>Move one counter</button>
    <p role="status" className="text-xl font-bold">{moved === 3 ? "2 + 3 = 5. Count all five counters together." : `We joined ${moved} of the 3 orange counters.`}</p>
  </>;
}
function TenLab({ onComplete }: Props) {
  const [moves, setMoves] = useState(0);
  const value = makeTenState(moves);
  return <>
    <div className="rounded-2xl bg-sky-50 p-4">
      <div role="img" aria-label={`Ten-frame: ${value.inside} filled spaces, ${10 - value.inside} empty spaces`} className="mx-auto grid max-w-sm grid-cols-5 gap-1 rounded-lg border-2 border-slate-600 bg-white p-1">
        {Array.from({length:10}, (_, i) => <div key={i} className="grid aspect-square place-items-center border border-slate-300 p-1"><span aria-hidden="true" className={`lab-counter h-full w-full rounded-full ${i < 8 ? "bg-sky-600" : i < value.inside ? "bg-orange-500" : "bg-slate-50"}`} /></div>)}
      </div>
      <div className="mt-5" role="img" aria-label={`${value.outside} counters outside the frame`}><Dots total={value.outside} blue={0} /></div>
      <p className="mt-3 text-center font-bold">{value.outside} outside the frame</p>
    </div>
    <button className={ACTION} disabled={moves === 2} onClick={() => { setMoves(moves + 1); if (moves + 1 === 2) onComplete(); }}>Move one into the frame</button>
    <p role="status" className="text-xl font-bold">{moves === 2 ? "10 + 3 = 13. We made a ten without changing the total!" : `${value.inside} + ${value.outside} = 13. Keep the total; fill the frame.`}</p>
  </>;
}

function PlaceBlocks({ tens, ones }: { tens: number; ones: number }) {
  return <div role="img" aria-label={`${tens} tens and ${ones} ones`} className="flex flex-wrap items-start justify-center gap-5 rounded-2xl bg-sky-50 p-5">
    <div className="flex gap-2" aria-hidden="true">{Array.from({length:tens},(_,i) => <div key={i} className="lab-dot grid w-4 grid-rows-10 overflow-hidden rounded-sm border border-sky-800 bg-sky-600">{Array.from({length:10},(_,j) => <span key={j} className="h-4 border-b border-sky-200 last:border-0" />)}</div>)}</div>
    <div aria-hidden="true" className="grid grid-cols-5 gap-2">{Array.from({length:ones},(_,i)=><span key={i} className="lab-dot h-4 w-4 rounded-sm border border-orange-700 bg-orange-400" />)}</div>
  </div>;
}
function RegroupLab({ onComplete }: Props) {
  const [phase, setPhase] = useState(0);
  const value = regroupState(phase === 2);
  return <>
    {phase === 0 ? <div className="grid gap-3 sm:grid-cols-2"><div><p className="mb-2 text-center font-bold">27</p><PlaceBlocks tens={2} ones={7} /></div><div><p className="mb-2 text-center font-bold">15</p><PlaceBlocks tens={1} ones={5} /></div></div> : <PlaceBlocks tens={value.tens} ones={value.ones} />}
    <button className={ACTION} disabled={phase === 2} onClick={() => { setPhase(phase + 1); if (phase === 1) onComplete(); }}>{phase === 0 ? "Combine the blocks" : "Trade 10 ones for 1 ten"}</button>
    <p role="status" className="text-xl font-bold">{phase === 0 ? "27 + 15. Put the tens and ones together." : phase === 1 ? "3 tens and 12 ones. Can you make another ten?" : "4 tens and 2 ones = 42. Trading kept the value the same."}</p>
  </>;
}
function ArrayLab({ onComplete }: Props) {
  const [rows, setRows] = useState(0);
  return <>
    <div className="space-y-3 rounded-2xl bg-sky-50 p-5" role="img" aria-label={`${rows} rows of four dots, ${rows * 4} dots total`}>
      {[0,1,2].map(i => <div key={i} className={`lab-counter flex min-h-14 items-center justify-center gap-3 rounded-xl border-2 border-dashed p-2 ${i < rows ? "border-sky-300 bg-white" : "border-slate-200"}`} aria-hidden="true">{[0,1,2,3].map(j => <span key={j} className={`h-9 w-9 rounded-full ${i < rows ? "bg-sky-600" : "bg-slate-200"}`} />)}</div>)}
    </div>
    <button className={ACTION} disabled={rows === 3} onClick={() => { setRows(rows + 1); if (rows + 1 === 3) onComplete(); }}>Add a row of 4</button>
    <p role="status" className="text-xl font-bold">{rows === 0 ? "Start with an empty array." : `${Array(rows).fill('4').join(' + ')} = ${rows * 4}. ${rows} ${rows === 1 ? 'row' : 'rows'} of 4.`}</p>
  </>;
}
function FractionBar({ numerator, denominator }: { numerator: number; denominator: number }) {
  return <div role="img" aria-label={`${numerator} of ${denominator} equal parts shaded`} className="relative flex h-16 overflow-hidden rounded-xl border-2 border-violet-700 bg-white">
    <div aria-hidden="true" className="absolute inset-y-0 left-0 bg-violet-500" style={{width:`${numerator / denominator * 100}%`}} />
    {Array.from({length:denominator},(_,i)=><span key={i} aria-hidden="true" className="lab-divider relative z-10 flex-1 border-r-2 border-violet-800 last:border-0" />)}
  </div>;
}
function FractionLab({ onComplete }: Props) {
  const [splits, setSplits] = useState(0);
  const fraction = equivalentHalf(splits);
  return <>
    <div className="space-y-4 rounded-2xl bg-violet-50 p-5"><div><p className="mb-2 font-bold">Original: 1/2</p><FractionBar numerator={1} denominator={2} /></div><div><p className="mb-2 font-bold">New pieces: {fraction.numerator}/{fraction.denominator}</p><FractionBar {...fraction} /></div></div>
    <button className={ACTION} disabled={splits === 3} onClick={() => { setSplits(splits + 1); onComplete(); }}>Split every part in half</button>
    <p role="status" className="text-xl font-bold">{splits ? `1/2 = ${fraction.numerator}/${fraction.denominator}. More pieces, the same shaded amount.` : "Look at the shaded amount before you cut."}</p>
    {splits > 0 && <button className={SECONDARY} onClick={() => setSplits(0)}>Join the pieces again</button>}
  </>;
}
function DecimalLab({ onComplete }: Props) {
  const [tenths, setTenths] = useState(0);
  const value = decimalState(tenths);
  return <>
    <div className="grid grid-cols-2 items-start gap-3 rounded-2xl bg-sky-50 p-4">
      <div><div className="aspect-square rounded-lg bg-sky-600" role="img" aria-label="One whole filled square" /><p className="mt-2 text-center font-bold">1 whole</p></div>
      <div><div className="grid aspect-square grid-cols-10 gap-px overflow-hidden rounded-lg border border-slate-400 bg-slate-300" role="img" aria-label={`${value.hundredths} hundredths shaded: 25 blue and ${value.added} orange`}>
        {Array.from({length:100},(_,i)=><span key={i} aria-hidden="true" className={`lab-counter ${i < 25 ? "bg-sky-600" : i < value.hundredths ? "bg-orange-400" : "bg-white"}`} />)}
      </div><p className="mt-2 text-center font-bold">{value.hundredths}/100</p></div>
    </div>
    <p className="text-sm text-slate-600">Blue shows the starting amount. Orange shows what you added. Each full square represents one whole.</p>
    <button className={ACTION} disabled={tenths === 4} onClick={() => { setTenths(tenths + 1); if (tenths + 1 === 4) onComplete(); }}>Add 1 tenth (10 hundredths)</button>
    <p role="status" className="text-xl font-bold">1.25 + 0.{tenths}0 = {value.label}{tenths === 4 ? ". Four tenths is forty hundredths." : ""}</p>
  </>;
}
