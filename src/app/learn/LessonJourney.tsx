"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/lessons";
import { suggestedLessonIndex } from "@/lib/lesson-sequence";
import { LessonNarration } from "@/components/LessonNarration";
import { LearningGarden } from "@/components/LearningGarden";
import { ActivityTracker } from "@/components/ActivityTracker";
import { MathLab } from "@/components/lessons/MathLab";
import { mathLabFor } from "@/lib/math-labs";
import { beginLesson, saveLessonStep } from "@/app/actions/learning";
import type { LearningRun } from "@/lib/learning-progress";
import { stop } from "@/lib/speech";

type Stage = "teach" | "explore" | "guided" | "transfer" | "reflect";

const LABELS = { teach: "Learn", explore: "Explore", guided: "Try together", transfer: "Try a new one", reflect: "Explain it" };
const SUBJECTS = { reading: { icon: "📖", label: "Reading" }, math: { icon: "🔢", label: "Math" }, science: { icon: "🔬", label: "Science" } };

function subscribeProgress(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener("lesson-progress", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("lesson-progress", notify);
  };
}

export function LessonJourney({ lessons, studentId, trackActivity = true, initialCompleted = [] }: { lessons: Lesson[]; studentId: string; trackActivity?: boolean; initialCompleted?: string[] }) {
  const [lessonIndex, setLessonIndex] = useState(() => suggestedLessonIndex(lessons, initialCompleted));
  const [stage, setStage] = useState<Stage>("teach");
  const [step, setStep] = useState(0);
  const [labReady, setLabReady] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState<string[]>([]);
  const [run, setRun] = useState<LearningRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<{ id: string; message: string } | null>(null);
  const [loadNonce, setLoadNonce] = useState(0);
  const [supportUsed, setSupportUsed] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const lesson = lessons[lessonIndex];
  const storageKey = `summersharp:intro-lessons:v1:${studentId}`;

  const saved = useSyncExternalStore(subscribeProgress, () => {
    try { return localStorage.getItem(storageKey) ?? "[]"; }
    catch { return "unavailable"; }
  }, () => "[]");
  let savedIds: string[] = [];
  try {
    const value: unknown = JSON.parse(saved);
    if (Array.isArray(value)) savedIds = value.filter((id): id is string => typeof id === "string" && lessons.some(l => l.id === id));
  } catch { /* Invalid local data must never prevent a lesson from opening. */ }
  const completed = [...new Set([...(trackActivity ? initialCompleted : savedIds), ...sessionCompleted])];
  useEffect(() => () => stop(), []);

  // Start/resume only through a server action. Preview lessons never write data.
  useEffect(() => {
    if (!trackActivity || !lesson) return;
    let active = true;
    void beginLesson(lesson.id).then(result => {
      if (!active) return;
      if (result.error) setLoadError({ id: lesson.id, message: result.error });
      else if (result.run) {
        const restored = result.run;
        setRun(restored); setStage(restored.stage); setStep(restored.step);
        setLabReady(restored.lab_explored); setSupportUsed(restored.support_used);
        const answer = restored.checks.find(c => c.stage === restored.stage);
        setChoice(answer?.choice ?? null); setChecked(!!answer);
      }
    }).catch(() => { if (active) setLoadError({ id: lesson.id, message: "We could not open your saved lesson. Please try again." }); });
    return () => { active = false; };
  }, [lesson, trackActivity, loadNonce]);

  function applyRun(next: LearningRun) {
    setRun(next); setStage(next.stage); setStep(next.step);
    setLabReady(next.lab_explored); setSupportUsed(next.support_used);
    const answer = next.checks.find(c => c.stage === next.stage);
    setChoice(answer?.choice ?? null); setChecked(!!answer);
  }
  async function persist(operation: "checkpoint" | "answer" | "complete", nextStage: Stage, nextStep = step, selected?: number, explored = labReady, supported = supportUsed) {
    if (!trackActivity) return true;
    if (!run || busy) return false;
    setBusy(true); setSaveError(null);
    try {
      const result = await saveLessonStep({ lessonId: lesson.id, runId: run.id, operation, stage: nextStage, step: nextStep, labExplored: explored, supportUsed: supported, choice: selected });
      if (result.error) { setSaveError(result.error); return false; }
      if (result.run) applyRun(result.run);
      return !!result.run;
    } catch { setSaveError("We could not save that step. Please try again."); return false; }
    finally { setBusy(false); }
  }
  async function go(next: Stage, nextStep = step, supported = supportUsed) {
    stop();
    if (!(await persist("checkpoint", next, nextStep, undefined, labReady, supported))) return;
    if (!trackActivity) { setStage(next); setStep(nextStep); setChoice(null); setChecked(false); }
    requestAnimationFrame(() => heading.current?.focus());
  }
  function selectLesson(index: number) {
    if (busy) return;
    stop(); setLessonIndex(index); setRun(null); setLoadError(null); setSaveError(null);
    setLoadNonce(n => n + 1); setLabReady(false); setSupportUsed(false);
    setStep(0); setStage("teach"); setChoice(null); setChecked(false);
  }
  async function submit() {
    if (choice === null) return;
    stop();
    if (await persist("answer", stage, step, choice)) setChecked(true);
  }
  async function finish() {
    if (!(await persist("complete", "reflect"))) return;
    const next = [...new Set([...completed, lesson.id])];
    setSessionCompleted(next);
    if (!trackActivity) {
      try { localStorage.setItem(storageKey, JSON.stringify(next)); window.dispatchEvent(new Event("lesson-progress")); }
      catch { setStorageWarning(true); }
    }
  }
  if (!lesson) return <main className="mx-auto max-w-xl p-6"><h1>No lessons available yet.</h1><Link href="/home">Back home</Link></main>;
  const question = stage === "guided" ? lesson.check : lesson.transfer;
  const savedCheck = trackActivity ? run?.checks.find(c => c.stage === stage) : undefined;
  const isCorrect = checked && (trackActivity ? savedCheck?.is_correct === true : choice === question.answer);
  const loading = trackActivity && run?.lesson_id !== lesson.id;
  const currentDone = trackActivity ? !!run?.completed_at : completed.includes(lesson.id);
  const suggestedNext = suggestedLessonIndex(lessons, completed, lesson.subject);
  const prerequisites = lessons.filter(l => lesson.prerequisiteIds?.includes(l.id));
  const allComplete = lessons.every(l => completed.includes(l.id));
  const subject = SUBJECTS[lesson.subject];
  const hasLab = !!mathLabFor(lesson.id);
  const stages: Stage[] = hasLab ? ["teach", "explore", "guided", "transfer", "reflect"] : ["teach", "guided", "transfer", "reflect"];

  return (
    <>
      {trackActivity && !loading && !currentDone && <ActivityTracker />}
      <main className="mx-auto max-w-3xl px-4 py-6 text-slate-800">
        <header className="mb-6 flex items-center justify-between gap-3">
          <Link href="/home" onClick={stop} className="rounded-xl bg-white px-4 py-3 font-bold ring-1 ring-slate-200">← Home</Link>
          <span className="text-sm font-bold text-slate-600">Learn · Try · Explain</span>
        </header>
        <div className="mb-6">
          <p className="text-sm font-extrabold uppercase tracking-wider text-sky-700">Your learning lab</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Small steps. Big discoveries.</h1>
          <p className="mt-2 text-slate-600">Start with a lesson, then put your new idea to work. Take your time.</p>
        </div>
        <nav aria-label="Choose a lesson" className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {lessons.map((item, i) => (
            <button key={item.id} disabled={busy} onClick={() => selectLesson(i)} aria-current={i === lessonIndex ? "step" : undefined}
              className={`min-h-20 rounded-2xl border-2 p-3 text-center font-bold transition-colors ${i === lessonIndex ? "border-sky-500 bg-sky-50 text-sky-900" : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"}`}>
              <span aria-hidden="true" className="block text-2xl">{SUBJECTS[item.subject].icon}</span>
              <span className="block text-xs">{SUBJECTS[item.subject].label}</span>
              <span className="block">{item.title}</span>
              {completed.includes(item.id) && <span className="block text-xs text-emerald-700">✓ Explored</span>}
            </button>
          ))}
        </nav>
        {loading ? <section className="rounded-3xl bg-white p-8 text-center ring-1 ring-slate-200" aria-live="polite">
          <p className="text-lg font-bold">{loadError?.id === lesson.id ? loadError.message : "Opening your saved lesson…"}</p>
          {loadError?.id === lesson.id && <button onClick={() => { setLoadError(null); setLoadNonce(n => n + 1); }} className="mt-4 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white">Try again</button>}
        </section> : <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-sky-700">{subject.icon} {subject.label}</p>
                <h2 ref={heading} tabIndex={-1} className="mt-1 font-display text-2xl font-bold outline-none sm:text-3xl">{lesson.title}</h2>
              </div>
              <LessonNarration lesson={lesson} slot="goal" />
            </div>
            <p className="mt-3 text-slate-600">{lesson.goal}</p>
            {lesson.preparation && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{lesson.preparation}</p>}
            {prerequisites.length > 0 && <div className="mt-3 text-sm text-slate-600">
              <p className="font-bold">Practice first, or revisit for help:</p>
              {prerequisites.map(item => <button key={item.id} disabled={busy} onClick={() => selectLesson(lessons.indexOf(item))} className="mr-2 mt-2 rounded-xl bg-sky-50 px-4 py-3 font-semibold text-sky-800 underline">{item.title}{completed.includes(item.id) ? " ✓" : ""}</button>)}
            </div>}
            <ol aria-label="Lesson steps" className={`mt-5 grid gap-2 ${hasLab ? "grid-cols-5" : "grid-cols-4"}`}>
              {stages.map((item, i) => <li key={item} aria-current={item === stage ? "step" : undefined} className="text-center text-xs font-bold">
                <div className={`mb-2 h-2 rounded-full ${i <= stages.indexOf(stage) ? "bg-sky-500" : "bg-slate-100"}`} />
                {LABELS[item]}
              </li>)}
            </ol>
          </div>
          {saveError && <p role="alert" className="mx-5 mt-5 rounded-xl bg-amber-50 p-4 font-semibold text-amber-950">{saveError}</p>}
          <fieldset disabled={busy} className="min-w-0 border-0 p-5 sm:p-7">
            <legend className="sr-only">Lesson activities</legend>
            {stage === "teach" && <>
              <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 p-5 sm:p-8" aria-label="Worked example">
                <p className="mb-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">Watch the idea grow</p>
                <div className="space-y-3">
                  {lesson.model.slice(0, step + 1).map((line, i) => <div key={`${lesson.id}-${i}`} className={`lesson-reveal rounded-xl bg-white p-4 text-center text-xl text-sky-900 shadow-sm sm:text-2xl ${lesson.subject === "reading" ? "font-sans font-medium leading-relaxed" : "font-display font-bold"}`}>{line}</div>)}
                </div>
              </div>
              <div className="mt-5 flex items-start gap-3" aria-live="polite">
                <p className="flex-1 text-lg leading-relaxed">{lesson.steps[step]}</p>
                <LessonNarration lesson={lesson} slot={`step-${step}` as "step-0" | "step-1" | "step-2"} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {step > 0 && <button onClick={() => go("teach", step - 1)} className="rounded-xl px-4 py-3 font-bold text-slate-600 ring-1 ring-slate-200">← Previous</button>}
                <button onClick={() => go(step < 2 ? "teach" : hasLab ? "explore" : "guided", step < 2 ? step + 1 : step)} className="btn-pop rounded-xl bg-sky-600 px-6 py-4 font-bold text-white">{step < 2 ? "Next step →" : hasLab ? "Explore it →" : "Let’s try together →"}</button>
              </div>
            </>}
            {stage === "explore" && <>
              <MathLab key={lesson.id} lessonId={lesson.id} onComplete={() => { setLabReady(true); void persist("checkpoint", "explore", step, undefined, true); }} />
              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="mb-3 text-sm text-slate-600">{labReady ? "You made the idea work. Now try a question." : "Use the activity above to see what changes."}</p>
                <button disabled={!labReady} onClick={() => go("guided")} className="btn-pop rounded-xl bg-sky-600 px-6 py-4 font-bold text-white disabled:opacity-40">Let’s try together →</button>
              </div>
            </>}
            {(stage === "guided" || stage === "transfer") && <>
              <p className="mb-3 text-sm font-bold text-sky-700">{stage === "guided" ? "Use what we just learned. Help is welcome." : "A different question. Try it yourself first."}</p>
              <div className="flex items-start gap-3">
                <h3 className="flex-1 text-xl font-bold leading-relaxed">{question.prompt}</h3>
                <LessonNarration lesson={lesson} slot={stage} onListen={() => { if (stage === "transfer" && lesson.subject === "reading") setSupportUsed(true); }} />
              </div>
              <fieldset disabled={checked} className="mt-5 space-y-3">
                <legend className="sr-only">Choose an answer</legend>
                {question.choices.map((answer, i) => <label key={answer} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 text-lg font-semibold ${choice === i ? "border-sky-500 bg-sky-50" : "border-slate-200"}`}>
                  <input type="radio" name={`${lesson.id}-${stage}`} value={i} checked={choice === i} onChange={() => setChoice(i)} className="h-5 w-5 accent-sky-600" />{answer}
                </label>)}
              </fieldset>
              {checked && <div role="status" className={`mt-5 rounded-2xl p-5 ${isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}>
                <p className="font-bold">{isCorrect ? "You used the idea!" : "Let’s work through it."}</p>
                <p className="mt-2 leading-relaxed">{savedCheck?.explanation ?? question.explanation}</p>
                <LessonNarration lesson={lesson} slot={`${stage}-feedback`} className="mt-3" />
              </div>}
              <div className="mt-6 flex flex-wrap gap-3">
                {!checked ? <button disabled={choice === null} onClick={submit} className="btn-pop rounded-xl bg-sky-600 px-6 py-4 font-bold text-white disabled:opacity-40">Check my thinking</button>
                  : <button onClick={() => go(stage === "guided" ? "transfer" : "reflect")} className="btn-pop rounded-xl bg-sky-600 px-6 py-4 font-bold text-white">{stage === "guided" ? "Try a new question →" : "Explain the idea →"}</button>}
                <button onClick={() => { const requested = supportUsed || stage === "transfer"; setSupportUsed(requested); void go("teach", 0, requested); }} className="rounded-xl px-4 py-3 font-bold text-slate-600 ring-1 ring-slate-200">See the lesson again</button>
              </div>
            </>}
            {stage === "reflect" && <>
              <div className="rounded-2xl bg-violet-50 p-6">
                <p className="text-3xl" aria-hidden="true">💬</p>
                <h3 className="mt-3 font-display text-2xl font-bold">Make the idea your own</h3>
                <p className="mt-3 text-lg leading-relaxed">{lesson.reflect}</p>
                <LessonNarration lesson={lesson} slot="reflect" className="mt-3" />
              </div>
              <p className="mt-4 text-slate-600">Say it aloud, draw it, or share it with a grown-up.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {!currentDone ? <button onClick={finish} className="btn-pop rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white disabled:opacity-40">I explained it ✓</button> : <p role="status" className="w-full font-bold text-emerald-700">✓ You explored this lesson.</p>}
                {currentDone && !allComplete && suggestedNext !== lessonIndex && <button onClick={() => selectLesson(suggestedNext)} className="btn-pop rounded-xl bg-sky-600 px-6 py-4 font-bold text-white">Next discovery →</button>}
                <Link href={`/practice/${lesson.subject}`} onClick={stop} className="rounded-xl bg-white px-5 py-4 font-bold text-sky-700 ring-2 ring-sky-200">Practice more {subject.label.toLowerCase()} →</Link>
              </div>
              {currentDone && trackActivity && <LearningGarden initial={null} />}
              {allComplete && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-900">You explored all available introductory lessons! You can revisit any lesson or keep practicing.</p>}
            </>}
          </fieldset>
          {busy && <p role="status" className="px-5 pb-4 text-sm font-bold text-sky-700">Saving your step…</p>}
        </section>}
        <p className="mt-5 text-center text-xs text-slate-500">{trackActivity ? "Your lesson steps and first answers are saved to your account. Your grown-up can see your learning progress." : storageWarning || saved === "unavailable" ? "This browser could not save lesson progress. You can still learn and practice." : "Explored lessons are saved on this device. Practice results appear in your grown-up’s dashboard."}</p>
      </main>
    </>
  );
}
