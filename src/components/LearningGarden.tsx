"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyGarden } from "@/app/actions/garden";
import type { GardenProgress } from "@/lib/garden";
import { RecordedNarration } from "@/components/LessonNarration";
import { HOME_NARRATION } from "@/lib/home-narration";

function Flower({ x, y, color, small = false }: { x: number; y: number; color: string; small?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${small ? .78 : 1})`}>
    <path d="M0 0 Q-6 26 0 52" fill="none" stroke="#237454" strokeWidth="5" strokeLinecap="round" />
    <path d="M0 34 Q-28 10 -24 33 Q-10 45 0 40 M0 25 Q28 5 23 26 Q9 37 0 32" fill="#4f9e66" />
    {[0, 60, 120, 180, 240, 300].map(a => <ellipse key={a} cx="0" cy="-13" rx="9" ry="15" fill={color} transform={`rotate(${a})`} />)}
    <circle r="9" fill="#ffda72" /><circle cx="-3" cy="-1" r="1.3" fill="#795033" /><circle cx="3" cy="-1" r="1.3" fill="#795033" />
    <path d="M-3 3 Q0 6 3 3" fill="none" stroke="#795033" strokeWidth="1.4" strokeLinecap="round" />
  </g>;
}
export function GardenScene({ flowers }: { flowers: number }) {
  const visible = flowers === 0 ? 0 : ((flowers - 1) % 10) + 1;
  const colors = ["#ef91ad", "#b0a0e5", "#f5b65c", "#83c6e0", "#ef91ad"];
  return <svg viewBox="0 0 560 240" role="img" aria-label={flowers ? `A garden patch with ${visible} growing flowers` : "A sunny garden ready for your first flower"} className="w-full">
    <rect width="560" height="240" rx="24" fill="#e5f3ed" />
    <circle cx="470" cy="53" r="26" fill="#f6cf77" />
    <g fill="#fff" opacity=".85"><ellipse cx="105" cy="48" rx="44" ry="12" /><ellipse cx="88" cy="41" rx="22" ry="15" /><ellipse cx="354" cy="79" rx="34" ry="9" /></g>
    <path d="M0 158 Q140 85 295 154 T560 142 V240 H0Z" fill="#c5dfb8" />
    <path d="M0 195 Q165 131 320 187 T560 167 V240 H0Z" fill="#a7cfa2" />
    <ellipse cx="280" cy="220" rx="228" ry="15" fill="#729f74" opacity=".25" />
    {Array.from({ length: visible }, (_, i) => <Flower key={i} x={70 + (i % 5) * 102} y={i < 5 ? 121 : 165} color={colors[i % 5]} small={i < 5} />)}
    {visible === 0 && <g><path d="M280 206 V181 M280 193 Q250 168 255 190 Q268 203 280 198 M280 185 Q303 160 305 181 Q295 195 280 193" fill="#4c9463" stroke="#37754d" strokeWidth="3" /><ellipse cx="280" cy="211" rx="28" ry="6" fill="#8b7654" /></g>}
    <g fill="#fff4c5"><circle cx="32" cy="189" r="3" /><circle cx="527" cy="206" r="3" /><circle cx="505" cy="140" r="2" /></g>
  </svg>;
}
export function LearningGarden({ initial, full = false }: { initial: GardenProgress | null; full?: boolean }) {
  const [progress, setProgress] = useState(initial);
  const [failed, setFailed] = useState(false);
  const [selectedPatch, setSelectedPatch] = useState<number | null>(null);
  useEffect(() => {
    if (initial) return;
    let active = true;
    getMyGarden().then(value => { if (active) { setProgress(value); setFailed(!value); } }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [initial]);
  if (!progress) return <section className="mt-5 rounded-3xl bg-white p-6 text-slate-700" role="status">{failed ? <>Your garden could not load. Your learning is still saved. <Link href="/garden" className="font-bold underline">Open my garden</Link></> : "Opening your garden…"}</section>;
  const { flowers, questionsTowardFlower } = progress;
  const patchCount = Math.max(1, Math.ceil(flowers / 10));
  const patch = Math.min(selectedPatch ?? patchCount, patchCount);
  const shownFlowers = full && patch < patchCount ? 10 : flowers;
  return <section aria-label="My learning garden" className="mt-5 overflow-hidden rounded-[2rem] border border-emerald-100 bg-[#fffdf5] shadow-[0_8px_0_0_#dce8da]">
    <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-7">
      <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Look what you’re growing</p><h2 className="mt-1 font-display text-2xl font-bold text-[#264f3f]">My learning garden</h2></div>
      <RecordedNarration id="home:garden" text={HOME_NARRATION['home:garden']} label="Hear how my garden grows" />
    </div>
    <div className="px-3"><GardenScene flowers={shownFlowers} /></div>
    {full && patchCount > 1 && <div className="mt-3 flex items-center justify-between gap-2 px-5"><button disabled={patch === 1} onClick={() => setSelectedPatch(patch - 1)} className="min-h-12 rounded-xl bg-emerald-50 px-4 font-bold text-emerald-900 disabled:opacity-40">← Previous</button><p className="text-sm font-bold text-emerald-900" aria-live="polite">Patch {patch} of {patchCount}</p><button disabled={patch === patchCount} onClick={() => setSelectedPatch(patch + 1)} className="min-h-12 rounded-xl bg-emerald-50 px-4 font-bold text-emerald-900 disabled:opacity-40">Next →</button></div>}
    <div className="p-5 sm:px-7">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xl font-bold text-[#264f3f]">{flowers === 0 ? "Your first flower is on its way" : `${flowers} ${flowers === 1 ? "flower" : "flowers"} grown`}</p>{!full && flowers > 10 && <span className="text-sm font-bold text-emerald-800">Patch {Math.ceil(flowers / 10)}</span>}</div>
      <p className="mt-2 text-base leading-relaxed text-slate-600">Finish a lesson or try 5 questions to grow a flower.</p>
      <div className="mt-4 flex items-center gap-2" aria-label={`${questionsTowardFlower} of 5 questions toward your next flower`}>
        {Array.from({ length: 5 }, (_, i) => <span key={i} aria-hidden="true" className={`grid h-10 w-10 place-items-center rounded-full border-2 text-lg font-bold ${i < questionsTowardFlower ? "border-emerald-600 bg-emerald-600 text-white" : "border-emerald-200 bg-white text-emerald-800"}`}>{i < questionsTowardFlower ? "✓" : i + 1}</span>)}
      </div>
      <p className="mt-2 text-sm text-slate-600">{5 - questionsTowardFlower} more {5 - questionsTowardFlower === 1 ? "question" : "questions"} for your next flower. Mistakes count, too.</p>
      {full ? <><p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-base text-emerald-900">Your flowers stay here when you take a break. Every flower remembers time you spent learning.</p><Link href="/practice/daily" className="mt-5 inline-flex min-h-12 items-center rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white">Practice and grow →</Link></> : <Link href="/garden" className="mt-4 inline-flex min-h-12 items-center font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4">Visit my garden →</Link>}
    </div>
  </section>;
}
