"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { experienceFor, mixedRoundCounts } from "@/lib/grade-experience";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LearningRewards } from "@/components/LearningRewards";
import { Confetti } from "@/components/Confetti";
import { CorrectCelebration } from "@/components/CorrectCelebration";
import { ActivityTracker } from "@/components/ActivityTracker";
import { teachFor } from "@/lib/teaching";
import { playCorrect, playWrong, playQuizStart } from "@/lib/sound";
import { TeachMe } from "@/components/TeachMe";
import { ReadingPrompt } from "@/components/ReadingPrompt";
import { splitReadingPrompt } from "@/lib/reading-prompt";
import { SpeakButton } from "@/components/SpeakButton";
import { ScienceObservation } from "@/components/ScienceObservation";
import { isScienceObservation } from "@/lib/science-observation";
import { ScienceDiagram, hasScienceDiagram } from "@/components/ScienceDiagram";
import { QuestionInteraction } from "@/components/QuestionTypes";
import { speak, stop } from "@/lib/speech";
import { parseArithmetic, type ParsedArithmetic } from "@/lib/math-parse";
import { StackedProblem } from "@/components/StackedProblem";
import { canAnimate, buildNarration } from "@/components/AnimatedMath";
import { MathTeachMe } from "@/components/MathTeachMe";
import {
  subjectTheme,
  gradeLabel,
  type AttemptResult,
  type Grade,
  type PracticeQuestion,
  type SubmittedAnswer,
  type Subject,
} from "@/lib/types";

const subscribeVoicePreference = (notify: () => void) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};
const CHEERS = ["Nice! 🎉", "Boom! 💥", "You got it! 🌟", "Sharp! 🧠", "Yes! 🙌"];


export function PracticeClient({
  subject,
  grade,
  studentId = "preview",
}: {
  subject: Subject;
  grade: Grade;
  studentId?: string;
}) {
  const theme = subjectTheme(subject.color);
  const experience = experienceFor(grade);
  const voiceKey = `sunsharp:autoread:${studentId}:${grade}`;
  const [phase, setPhase] = useState<"loading" | "playing" | "done" | "empty" | "error">(
    "loading",
  );
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unsavedAnswer, setUnsavedAnswer] = useState<SubmittedAnswer | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);
  const [correctKey, setCorrectKey] = useState(0);
  const [combo, setCombo] = useState(0);
  const [cheer, setCheer] = useState(CHEERS[0]);
  const submissionInFlight = useRef(false);
  const requestId = useRef<string | null>(null);
  const supportUsed = useRef(false);
  const [adapting, setAdapting] = useState(false);
  const [transitionError, setTransitionError] = useState('');
  const [tryingMore, setTryingMore] = useState(false);
  const [showTeach, setShowTeach] = useState(false);
  // Pre-answer "Teach me how" for arithmetic (animated numbers + voiceover).
  const [mathHelp, setMathHelp] = useState<ParsedArithmetic | null>(null);
  // Approved AI scene art per "subject/skill" (RLS only exposes approved rows).
  // Skills can have several variants; each question hashes to one so a given
  // question always shows the same art but a round feels varied.
  const [artMap, setArtMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("skill_art")
      .select("subject_id, skill, image_url")
      .order("id")
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string[]> = {};
        for (const r of data) {
          const k = `${r.subject_id}/${r.skill}`;
          (map[k] ??= []).push(r.image_url);
        }
        setArtMap(map);
      });
  }, []);

  const loadQuestions = useCallback(async () => {
    requestId.current=null; supportUsed.current=false; setTransitionError('');
    setPhase("loading");
    setQuestions([]);
    setIndex(0);
    setSelected(null);
    setUnsavedAnswer(null);
    setResult(null);
    setCorrectCount(0);
    setCombo(0);

    try {
      if (!navigator.onLine) throw new Error("Offline");
      const supabase = createClient();
      let qs: PracticeQuestion[] = [];

      if (subject.id === "daily") {
        const subjectIds = ["math", "reading", "science"];
        const results = await Promise.all(
          subjectIds.map((s, subjectIndex) =>
            supabase.rpc("get_progressive_questions", {
              p_subject: s,
              p_grade: grade,
              p_count: mixedRoundCounts(experience.roundSize)[subjectIndex],
            }).abortSignal(AbortSignal.timeout(15000)),
          ),
        );
        if (results.some(r => r.error)) throw new Error("Questions unavailable");
        qs = results.flatMap((r) => (r.data as PracticeQuestion[]) ?? []);
        // shuffle the mix
        for (let i = qs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [qs[i], qs[j]] = [qs[j], qs[i]];
        }
      } else {
        const { data, error } = await supabase.rpc("get_progressive_questions", {
          p_subject: subject.id,
          p_grade: grade,
          p_count: experience.roundSize,
        }).abortSignal(AbortSignal.timeout(15000));
        if (error) throw new Error("Questions unavailable");
        qs = (data as PracticeQuestion[]) ?? [];
      }

      setQuestions(qs);
      setPhase(qs.length ? "playing" : "empty");
      if (qs.length) playQuizStart();
    } catch { setPhase("error"); }
  }, [subject.id, grade, experience.roundSize]);

  useEffect(() => {
    // This effect starts the external question request; explicit retries also reset the round.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadQuestions();
  }, [loadQuestions]);

  const rawCurrent = questions[index];
  // The stored prompt includes plain-text evidence for older/offline clients.
  // New clients display the same evidence in its own accessible visual panel.
  const current = rawCurrent && isScienceObservation(rawCurrent.payload?.observation) && typeof rawCurrent.payload?.observationQuestion === "string"
    ? { ...rawCurrent, prompt: rawCurrent.payload.observationQuestion }
    : rawCurrent;
  const observation = isScienceObservation(current?.payload?.observation) ? current.payload!.observation! : null;
  const readingParts = current?.subject_id === "reading" ? splitReadingPrompt(current.prompt) : null;
  const isPreK = grade === "PK";
  // Young kids are still learning to read, so auto-read includes the answer
  // choices for them; older kids just hear the question and can tap 🔊 for more.
  const isYoung = grade === "PK" || grade === "K" || grade === "1" || grade === "2";

  // Auto-read is on by default (great for emerging readers) but a kid or grown-up
  // can mute it from the header; the choice is remembered on this device.
  const storedAutoRead = useSyncExternalStore(subscribeVoicePreference, () => {
    try {
      const saved = window.localStorage.getItem(voiceKey);
      return saved == null ? experience.autoRead : saved === "1";
    } catch { return experience.autoRead; }
  }, () => experience.autoRead);
  const [readOverride, setReadOverride] = useState<boolean | null>(null);
  const autoRead = readOverride ?? storedAutoRead;
  const toggleAutoRead = useCallback(() => {
    const next = !autoRead;
    setReadOverride(next);
    try { window.localStorage.setItem(voiceKey, next ? "1" : "0"); } catch {}
    if (!next) stop();
  }, [autoRead, voiceKey]);

  // What to read for a given question: the prompt always, plus the lettered
  // choices for young readers on multiple-choice questions.
  const speechFor = useCallback(
    (q: PracticeQuestion) =>
      isYoung && (!q.kind || q.kind === "mcq")
        ? `${q.prompt}. ${q.choices
            .map((c, i) => `${String.fromCharCode(65 + i)}, ${c}`)
            .join(". ")}`
        : q.prompt,
    [isYoung],
  );

  // Read each new question aloud when auto-read is on (best-effort; browsers may
  // need a prior tap, which the kid provides by tapping into the round).
  useEffect(() => {
    if (autoRead && phase === "playing" && current) {
      speak(`q-${current.id}`, speechFor(current));
    }
  }, [autoRead, phase, current?.id, speechFor]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(answer: SubmittedAnswer) {
    if (result || submissionInFlight.current || !current) return;
    if(unsavedAnswer!==null && JSON.stringify(answer)!==JSON.stringify(unsavedAnswer))return;
    submissionInFlight.current=true;
    if (typeof answer === "number") setSelected(answer);
    setSubmitting(true);
    setUnsavedAnswer(null);

    const supabase = createClient();
    requestId.current ??= crypto.randomUUID();
    const { data, error } = await supabase.rpc("record_practice_attempt", {
      p_question_id: current.id,
      p_answer: answer,
      p_support_used: supportUsed.current,
      p_request_id: requestId.current,
    }).abortSignal(AbortSignal.timeout(15000)).then(response => response, () => ({ data: null, error: true }));
    submissionInFlight.current=false;
    setSubmitting(false);

    if (error || !data) {
      // Keep this question open until the server confirms the answer was saved.
      setSelected(null);
      setUnsavedAnswer(answer);
      return;
    }

    const res = data as AttemptResult;
    setResult(res);
    if (res.is_correct) {
      playCorrect(combo);
      setCorrectCount((c) => c + 1);
      setConfettiKey((k) => k + 1);
      setCorrectKey((k) => k + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);

      setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
    } else {
      playWrong();
      setCombo(0);
    }
  }

  async function next() {
    if(adapting || tryingMore)return;
    setTransitionError('');
    setShowTeach(false);
    if (index + 1 >= questions.length) {
      setPhase("done");
      setConfettiKey((k) => k + 1);
      return;
    }
    setAdapting(true);
    try {
      const upcoming=questions[index+1];
      const {data,error}=await createClient().rpc("get_progressive_questions",{
        p_subject:upcoming.subject_id,p_grade:grade,p_count:1,p_exclude:questions.map(q=>q.id),
      }).abortSignal(AbortSignal.timeout(15000));
      if(error)throw error;
      const fresh=(data as PracticeQuestion[] | null)?.[0];
      if(fresh)setQuestions(qs=>qs.map((q,i)=>i===index+1?fresh:q));
      requestId.current=null;supportUsed.current=false;
      setIndex((i) => i + 1);
      setSelected(null);setUnsavedAnswer(null);setResult(null);
    } catch {setTransitionError('The next question couldn’t load. Your saved answer is safe. Try again.');}
    finally {setAdapting(false);}
  }

  // After a miss, pull a fresh question of the SAME skill and slot it in next,
  // so the kid re-practices what they just got wrong (the answer key stays
  // server-side). Reuse an unseen queued question if the bank has no extra one.
  async function tryOneMore() {
    if (!current?.skill || tryingMore) return;
    setTryingMore(true);
    setTransitionError('');
    try {
      const {data,error}=await createClient().rpc("get_progressive_questions",{
        p_subject:current.subject_id,p_grade:grade,p_count:1,p_exclude:questions.map(q=>q.id),p_skill:current.skill,
      }).abortSignal(AbortSignal.timeout(15000));
      if(error)throw error;
      const extra=((data as PracticeQuestion[])??[]).find(q=>q.skill===current.skill);
      const queued=questions.findIndex((q,i)=>i>index&&q.skill===current.skill);
      if(!extra&&queued<0){setTransitionError('No new question for this skill right now. You can continue your round.');return;}
      setShowTeach(false);
      setQuestions(qs=>{const copy=qs.slice();const followUp=extra??copy.splice(queued,1)[0];copy.splice(index+1,0,followUp);return copy;});
      requestId.current=null;supportUsed.current=true;
      setSelected(null);setUnsavedAnswer(null);setResult(null);setIndex(i=>i+1);
    } catch {setTransitionError('That practice question couldn’t load. Try again, or continue your round.');}
    finally {setTryingMore(false);}
  }

  // ---- Render states ------------------------------------------------------

  if (phase === "loading") {
    return (
      <Centered>
        <div className="animate-float text-6xl">{subject.emoji}</div>
        <p className="mt-4 font-display text-xl text-slate-500">Getting questions ready…</p>
      </Centered>
    );
  }

  if (phase === "error") {
    return <Centered>
      <h1 className="font-display text-2xl font-bold text-slate-800">Let’s get your questions ready</h1>
      <p className="mt-3 max-w-sm text-lg text-slate-600">We couldn’t connect. Check your internet, then try again.</p>
      <button onClick={loadQuestions} className="btn-pop mt-6 min-h-12 rounded-2xl bg-sky-700 px-6 py-3 font-bold text-white">Try again</button>
      <Link href="/home" className="mt-3 inline-flex min-h-12 items-center px-4 font-bold text-slate-600">Back home</Link>
    </Centered>;
  }

  if (phase === "empty") {
    return (
      <Centered>
        <div className="text-6xl">🦗</div>
        <p className="mt-4 font-display text-xl text-slate-600">
          No questions here yet for {gradeLabel(grade)}.
        </p>
        <Link href="/home" className="btn-pop mt-6 bg-white px-6 py-3 ring-2 ring-slate-200">
          ← Back home
        </Link>
      </Centered>
    );
  }

  if (phase === "playing" && current?.payload?.observation && !observation) {
    return <Centered><p className="text-xl font-bold text-slate-800">These observation notes could not load.</p><p className="mt-2 text-slate-600">Let’s try another set of questions.</p><button onClick={loadQuestions} className="mt-5 min-h-12 rounded-xl bg-sky-700 px-5 py-3 font-bold text-white">Try another set</button><Link href="/home" className="mt-4 block p-3 font-bold text-slate-700">Back home</Link></Centered>;
  }

  if (phase === "done") {
    return <><Confetti fire={confettiKey} /><main data-grade={grade} className="grade-quiz mx-auto w-full min-w-0 max-w-3xl px-4 py-6">
      <div className="rounded-3xl bg-white p-6 text-center">
        <p aria-hidden="true" className="text-5xl">🌱</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-800">You kept learning!</h1>
        <p className="mt-2 text-lg text-slate-600">You tried {questions.length} questions and got {correctCount} right.</p>
        <p className="mt-2 text-base text-slate-600">Every question you tried adds to your rewards.</p>
      </div>
      <LearningRewards grade={grade} />
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/home" className="inline-flex min-h-12 items-center rounded-2xl bg-emerald-700 px-6 py-3 font-bold text-white">Done for now ✓</Link>
        <button onClick={loadQuestions} className="min-h-12 rounded-2xl bg-white px-6 py-3 font-bold text-slate-700">Practice again</button>
      </div>
    </main></>;
  }

  // phase === "playing"
  return (
    <>
      <Confetti fire={confettiKey} count={60} />
      <CorrectCelebration fire={correctKey} cheer={cheer} />
      <ActivityTracker />
      <main data-grade={grade} className="grade-quiz mx-auto w-full min-w-0 max-w-3xl px-4 py-6">
        <header className="mb-4 flex items-center justify-between">
          <Link href="/home" className="inline-flex min-h-12 items-center rounded-xl px-3 font-bold text-slate-600 hover:text-slate-800">
            ← Home
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAutoRead}
              aria-pressed={autoRead}
              aria-label={autoRead ? "Turn off read-aloud" : "Turn on read-aloud"}
              title={autoRead ? "Read-aloud is on" : "Read-aloud is off"}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-base transition ${
                autoRead
                  ? "bg-sky-100 text-sky-700 hover:bg-sky-200"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              {autoRead ? "🔊" : "🔇"}
            </button>

          </div>
        </header>

        <p className="mb-3 text-sm font-bold" style={{color: experience.accent}}>{gradeLabel(grade)} · {experience.name}</p>
        {/* progress */}
        <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-white/70 ring-2 ring-white">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-[width] duration-300`}
            style={{ width: `${(index / questions.length) * 100}%` }}
          />
        </div>

        <div className="card-fun p-6 sm:p-8">
          <div className="mb-1 flex items-center gap-2">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Question {index + 1} of {questions.length}
            </p>
            {current.focus === "stretch" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">A little stretch</span>}
            {current.focus === "new" && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">
                ✨ New skill
              </span>
            )}
            {current.focus === "review" && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                🔁 Review
              </span>
            )}
          </div>
          {(() => {
            if (readingParts || current.subject_id === "science") return null;
            // Hand-made science diagrams stay authoritative; AI scene art fills
            // in everywhere else it exists (never math — its SVG manipulatives
            // are answer-exact and live in TeachMe).
            const variants =
              current.subject_id !== "math" && current.skill
                ? artMap[`${current.subject_id}/${current.skill}`]
                : undefined;
            // Stable per-question pick: hash the question id into the variants.
            let art: string | undefined;
            if (variants?.length) {
              let h = 0;
              for (const c of current.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
              art = variants[h % variants.length];
            }
            if (art) {
              return (
                <div className="mb-4 overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art}
                    alt=""
                    aria-hidden
                    className="max-h-44 w-full object-cover"
                  />
                </div>
              );
            }
            return null;
          })()}
          {observation && <ScienceObservation key={current.id} observation={observation} id={current.id} />}
          {readingParts ? <ReadingPrompt parts={readingParts} grade={grade} questionId={current.id} /> : <div className="flex items-start gap-3">
            {(() => {
              // Math questions that are pure arithmetic get the school-style
              // stacked layout kids know from worksheets (51 over −13, rule
              // line, ?). Everything else stays as text.
              const parsed =
                current.subject_id === "math" ? parseArithmetic(current.prompt) : null;
              if (parsed) {
                return (
                  <div className="min-w-0 flex-1">
                    <h1 className="sr-only">{current.prompt}</h1>
                    <StackedProblem parsed={parsed} />
                  </div>
                );
              }
              return (
                <h1 className={`quiz-prompt min-w-0 flex-1 font-bold leading-relaxed text-slate-800 ${experience.earlyReader ? "text-3xl" : "text-2xl"}`}>
                  {current.prompt}
                </h1>
              );
            })()}
            <SpeakButton
              id={`q-${current.id}`}
              label="Read the question"
              text={
                isPreK || (current.kind && current.kind !== "mcq")
                  ? current.prompt
                  : `${current.prompt}. ${current.choices
                      .map((c, i) => `${String.fromCharCode(65 + i)}, ${c}`)
                      .join(". ")}`
              }
              className="mt-1"
            />
          </div>}

          {/* Pre-answer help for arithmetic: a kid who's stuck can watch the
              numbers work out and hear it explained, instead of guessing. */}
          {!result &&
            (() => {
              const p =
                current.subject_id === "math" ? parseArithmetic(current.prompt) : null;
              if (!p || !canAnimate(p)) return null;
              return (
                <button
                  onClick={() => {
                    // Start the voiceover inside the tap so iOS allows audio.
                    speak("math-teach", buildNarration(p));
                    supportUsed.current=true;
                    setMathHelp(p);
                  }}
                  className="btn-pop mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-violet-200 bg-violet-50 px-4 py-3 text-base font-extrabold text-violet-700"
                >
                  🤔 Not sure? Teach me how 🔊
                </button>
              );
            })()}

          {/* Non-multiple-choice kinds bring their own interaction + feedback. */}
          <QuestionInteraction key={current.id} question={current} result={result} submitting={submitting||unsavedAnswer!==null} onSubmit={submit} />

          {(!current.kind || current.kind === "mcq") && (
          <div className={`mt-6 grid gap-3 ${isPreK ? "grid-cols-2" : "sm:grid-cols-2"}`}>
            {current.choices.map((choice, i) => {
              let cls =
                "border-slate-200 bg-white hover:border-[var(--brand-blue)] hover:bg-blue-50";
              if (result) {
                if (i === result.correct_index)
                  cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
                else if (i === selected)
                  cls = "border-red-400 bg-red-50 text-red-700";
                else cls = "border-slate-200 bg-white opacity-60";
              }
              // Make the right answer pop + glow when the kid nails it.
              if (result?.is_correct && i === result.correct_index) {
                cls += " answer-correct";
              }
              // Pre-K: big, picture-first buttons with no A/B/C/D labels.
              if (isPreK) {
                return (
                  <button
                    key={i}
                    disabled={!!result || submitting || unsavedAnswer!==null}
                    onClick={() => submit(i)}
                    className={`relative grid min-h-28 place-items-center rounded-3xl border-4 px-3 py-6 text-center text-6xl font-bold transition ${cls}`}
                  >
                    <span className="min-w-0 break-words">{choice}</span>
                    {result && i === result.correct_index && (
                      <span className="absolute right-3 top-3 text-3xl">✅</span>
                    )}
                    {result && i === selected && !result.is_correct && (
                      <span className="absolute right-3 top-3 text-3xl">❌</span>
                    )}
                  </button>
                );
              }
              return (
                <button
                  key={i}
                  disabled={!!result || submitting || unsavedAnswer!==null}
                  onClick={() => submit(i)}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-lg font-bold transition ${cls}`}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-100 text-sm text-slate-500">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0 break-words">{choice}</span>
                  {result && i === result.correct_index && <span className="ml-auto">✅</span>}
                  {result && i === selected && !result.is_correct && (
                    <span className="ml-auto">❌</span>
                  )}
                </button>
              );
            })}
          </div>
          )}

          {submitting&&<p role="status" className="mt-4 font-bold text-slate-600">Saving your answer…</p>}
          {unsavedAnswer !== null && !result && <div role="alert" className="mt-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-slate-800">
            <p className="text-lg font-bold">Let’s make sure your answer saved. Please try again.</p>
            <div className="mt-3 flex items-center gap-3">
              <button onClick={() => submit(unsavedAnswer)} disabled={submitting} className="min-h-12 rounded-xl bg-sky-700 px-4 py-3 font-bold text-white">Try saving again</button>
              <SpeakButton id="answer-save-error" label="Read the save message" text="Let’s make sure your answer saved. Please try again." />
            </div>
          </div>}

          {/* feedback — a quick cheer when right, a real re-teach when wrong */}
          {result && (
            <div
              className={`mt-6 rounded-2xl p-4 animate-pop ${
                result.is_correct ? "bg-emerald-50" : "bg-orange-50"
              }`}
            >
              <p className="font-display text-xl font-bold">
                {result.is_correct ? cheer : "Let's learn it 💡"}
              </p>
              {result.explanation && (
                <div className="mt-1 flex items-start gap-2">
                  <p className="flex-1 text-slate-700">{result.explanation}</p>
                  <SpeakButton
                    id={`e-${current.id}`}
                    label="Read the explanation"
                    text={result.explanation}
                  />
                </div>
              )}
              {current.subject_id === "science" && !observation && hasScienceDiagram(current.skill) && <details className="mt-4 rounded-xl bg-white p-3"><summary className="min-h-12 cursor-pointer p-2 font-bold text-sky-800">Explore this science topic</summary><ScienceDiagram skill={current.skill} /></details>}
              {/* On a miss, re-teach the general method for this skill. */}
              {!result.is_correct &&
                (() => {
                  const teach = teachFor(current.skill);
                  return teach ? (
                    <div className="mt-3 rounded-xl bg-white/70 p-3">
                      <p className="text-sm font-bold text-slate-700">
                        💡 How {teach.title.toLowerCase()} works
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">{teach.tip}</p>
                    </div>
                  ) : null;
                })()}

            </div>
          )}
        </div>

        {transitionError&&<p role="alert" className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-slate-800">{transitionError}</p>}
        {result &&
          (result.is_correct ? (
            <button
              onClick={next}
              disabled={adapting||tryingMore}
              className="btn-pop mt-5 w-full px-6 py-4 text-xl text-white"
              style={{ background: "var(--brand-orange)" }}
            >
              {adapting?"Finding your next challenge…":index + 1 >= questions.length ? "See my results 🎉" : "Next question →"}
            </button>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              <button
                onClick={() => setShowTeach(true)}
                className="btn-pop w-full px-6 py-4 text-xl text-white"
                style={{ background: "linear-gradient(90deg, #8b5cf6, #d946ef)" }}
              >
                🧑‍🏫 Teach me how ✨
              </button>
              {current.skill && (
                <button
                  onClick={tryOneMore}
                  disabled={tryingMore||adapting}
                  className="btn-pop w-full px-6 py-3 text-lg text-white"
                  style={{ background: "var(--brand-blue)" }}
                >
                  {tryingMore ? "Getting one…" : "Try one like it 🔁"}
                </button>
              )}
              <button
                onClick={next}
              disabled={adapting||tryingMore}
                className="btn-pop w-full bg-white px-6 py-3 text-base text-slate-500 ring-2 ring-slate-200"
              >
                {adapting?"Getting your next question…":index + 1 >= questions.length ? "Finish 🎉" : "Continue →"}
              </button>
            </div>
          ))}
      </main>

      {showTeach && current && (
        <TeachMe
          question={current}
          selectedIndex={selected}
          onClose={() => setShowTeach(false)}
          onTryOne={
            current.skill
              ? () => {
                  setShowTeach(false);
                  tryOneMore();
                }
              : undefined
          }
        />
      )}

      {mathHelp && <MathTeachMe parsed={mathHelp} onClose={() => setMathHelp(null)} />}
    </>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
      {children}
    </main>
  );
}
