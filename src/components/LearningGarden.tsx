"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMyGarden } from "@/app/actions/garden";
import { experienceFor } from "@/lib/grade-experience";
import type { Grade } from "@/lib/types";
import type { GardenProgress } from "@/lib/garden";
import { RecordedNarration } from "@/components/LessonNarration";
import { HOME_NARRATION } from "@/lib/home-narration";

const FLOWERS = ['daisy', 'tulip', 'sunflower', 'poppy', 'iris'];
export function GardenScene({ flowers, grade }: { flowers: number; grade?: Grade | null }) {
  const experience = experienceFor(grade);
  const visible = flowers === 0 ? 0 : ((flowers - 1) % 10) + 1;
  const night = experience.setting === 'night';
  return <div role="img" aria-label={flowers ? `A garden patch with ${visible} growing flowers` : "A sunny garden ready for your first flower"} className="relative isolate aspect-[2/1] w-full overflow-hidden rounded-3xl" style={{ background: experience.ground }}>
    <Image src="/images/garden/garden-bed.webp" alt="" fill unoptimized loading="eager" sizes="(max-width: 768px) 100vw, 740px" className="object-cover" style={{ filter: night ? 'brightness(.62) saturate(.65)' : undefined }} />
    {night && <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-indigo-950/20" />}
    {Array.from({ length: visible }, (_, i) => {
      const back = i < 5;
      return <div key={i} data-garden-flower className="absolute" style={{ left: `${6 + (i % 5) * 17 + (back ? 0 : 4)}%`, bottom: back ? '25%' : '9%', width: '16%', height: back ? '49%' : '58%', zIndex: back ? 1 : 2 }}>
        <Image src={`/images/garden/${FLOWERS[i % FLOWERS.length]}.webp`} alt="" fill sizes="(max-width: 768px) 16vw, 120px" className="pointer-events-none object-contain object-bottom" style={{ filter: night ? 'brightness(.86)' : undefined }} />
      </div>;
    })}
    {visible === 0 && <div className="absolute bottom-[12%] left-[41%] h-[34%] w-[18%]"><Image src="/images/garden/sprout.webp" alt="" fill sizes="120px" className="object-contain object-bottom" /></div>}
  </div>;
}
export function LearningGarden({ initial, full = false, grade }: { initial: GardenProgress | null; full?: boolean; grade?: Grade | null }) {
  const experience = experienceFor(grade);
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
      <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Look what you’re growing</p><h2 className="mt-1 font-display text-2xl font-bold text-[#264f3f]">{experience.gardenName}</h2></div>
      <RecordedNarration id="home:garden" text={HOME_NARRATION['home:garden']} label="Hear how my garden grows" />
    </div>
    <div className="px-3"><GardenScene grade={grade} flowers={shownFlowers} /></div>
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
