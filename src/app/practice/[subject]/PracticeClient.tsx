"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Confetti } from "@/components/Confetti";
import { teachFor } from "@/lib/teaching";
import { TeachMe } from "@/components/TeachMe";
import { SpeakButton } from "@/components/SpeakButton";
import {
  subjectTheme,
  type AttemptResult,
  type Grade,
  type PracticeQuestion,
  type Subject,
} from "@/lib/types";

const CHEERS = ["Nice! 🎉", "Boom! 💥", "You got it! 🌟", "Sharp! 🧠", "Yes! 🙌"];

type NewBadge = AttemptResult["new_badges"][number];

export function PracticeClient({
  subject,
  grade,
}: {
  subject: Subject;
  grade: Grade;
}) {
  const theme = subjectTheme(subject.color);
  const [phase, setPhase] = useState<"loading" | "playing" | "done" | "empty">(
    "loading",
  );
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [badges, setBadges] = useState<NewBadge[]>([]);
  const [confettiKey, setConfettiKey] = useState(0);
  const [cheer, setCheer] = useState(CHEERS[0]);
  const [tryingMore, setTryingMore] = useState(false);
  const [showTeach, setShowTeach] = useState(false);

  const loadQuestions = useCallback(async () => {
    setPhase("loading");
    setQuestions([]);
    setIndex(0);
    setSelected(null);
    setResult(null);
    setCorrectCount(0);
    setXpEarned(0);
    setBadges([]);

    const supabase = createClient();
    let qs: PracticeQuestion[] = [];

    if (subject.id === "daily") {
      const subjectIds = ["math", "reading"];
      const results = await Promise.all(
        subjectIds.map((s) =>
          supabase.rpc("get_adaptive_questions", {
            p_subject: s,
            p_grade: grade,
            p_count: 3,
          }),
        ),
      );
      qs = results.flatMap((r) => (r.data as PracticeQuestion[]) ?? []);
      // shuffle the mix
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
    } else {
      const { data } = await supabase.rpc("get_adaptive_questions", {
        p_subject: subject.id,
        p_grade: grade,
        p_count: 6,
      });
      qs = (data as PracticeQuestion[]) ?? [];
    }

    setQuestions(qs);
    setPhase(qs.length ? "playing" : "empty");
  }, [subject.id, grade]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const current = questions[index];

  async function choose(choiceIndex: number) {
    if (result || submitting || !current) return;
    setSelected(choiceIndex);
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("record_attempt", {
      p_question_id: current.id,
      p_selected_index: choiceIndex,
    });
    setSubmitting(false);

    if (error || !data) {
      // Surface a gentle retry: clear selection so they can tap again.
      setSelected(null);
      return;
    }

    const res = data as AttemptResult;
    setResult(res);
    if (res.is_correct) {
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + res.xp_earned);
      setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
      setConfettiKey((k) => k + 1);
    }
    if (res.new_badges.length) setBadges((b) => [...b, ...res.new_badges]);
  }

  function next() {
    setShowTeach(false);
    if (index + 1 >= questions.length) {
      setPhase("done");
      setConfettiKey((k) => k + 1);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setResult(null);
  }

  // After a miss, pull a fresh question of the SAME skill and slot it in next,
  // so the kid re-practices what they just got wrong (the answer key stays
  // server-side). If none is available, just move on.
  async function tryOneMore() {
    if (!current?.skill || tryingMore) return;
    setTryingMore(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("get_skill_questions", {
      p_subject: current.subject_id,
      p_grade: grade,
      p_skill: current.skill,
      p_count: 1,
    });
    setTryingMore(false);
    const extra = (data as PracticeQuestion[]) ?? [];
    if (!extra.length) {
      next();
      return;
    }
    setShowTeach(false);
    setQuestions((qs) => {
      const copy = qs.slice();
      copy.splice(index + 1, 0, extra[0]);
      return copy;
    });
    setSelected(null);
    setResult(null);
    setIndex((i) => i + 1);
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

  if (phase === "empty") {
    return (
      <Centered>
        <div className="text-6xl">🦗</div>
        <p className="mt-4 font-display text-xl text-slate-600">
          No questions here yet for Grade {grade}.
        </p>
        <Link href="/home" className="btn-pop mt-6 bg-white px-6 py-3 ring-2 ring-slate-200">
          ← Back home
        </Link>
      </Centered>
    );
  }

  if (phase === "done") {
    const total = questions.length;
    const perfect = correctCount === total;
    return (
      <>
        <Confetti fire={confettiKey} />
        <Centered>
          <div className="card-fun w-full max-w-md p-8 text-center animate-pop">
            <div className="text-7xl">{perfect ? "🏆" : "🌟"}</div>
            <h1 className="mt-3 font-display text-3xl font-bold text-slate-800">
              {perfect ? "Perfect round!" : "Great job!"}
            </h1>
            <p className="mt-1 text-lg text-slate-600">
              You got <b>{correctCount}</b> out of <b>{total}</b> right.
            </p>
            <div
              className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xl font-bold text-white"
              style={{ background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))" }}
            >
              ⚡ +{xpEarned} XP
            </div>

            {badges.length > 0 && (
              <div className="mt-6">
                <p className="font-display text-lg font-bold text-slate-700">
                  New badges unlocked!
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  {badges.map((b) => (
                    <div key={b.id} className="flex flex-col items-center animate-cheer">
                      <span className="text-4xl">{b.emoji}</span>
                      <span className="text-xs font-bold text-slate-600">{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3">
              <button
                onClick={loadQuestions}
                className="btn-pop px-6 py-3 text-lg text-white"
                style={{ background: "var(--brand-blue)" }}
              >
                Play again 🔁
              </button>
              <Link
                href="/home"
                className="btn-pop bg-white px-6 py-3 text-lg text-slate-600 ring-2 ring-slate-200"
              >
                Back home 🏠
              </Link>
            </div>
          </div>
        </Centered>
      </>
    );
  }

  // phase === "playing"
  return (
    <>
      <Confetti fire={confettiKey} count={60} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-4 flex items-center justify-between">
          <Link href="/home" className="font-bold text-slate-500 hover:text-slate-700">
            ← Quit
          </Link>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${theme.soft} ${theme.text}`}>
            {subject.emoji} {subject.name}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
            ⚡ {xpEarned} XP
          </span>
        </header>

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
          <div className="flex items-start gap-3">
            <h1 className="flex-1 font-display text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
              {current.prompt}
            </h1>
            <SpeakButton
              id={`q-${current.id}`}
              label="Read the question"
              text={`${current.prompt}. ${current.choices
                .map((c, i) => `${String.fromCharCode(65 + i)}, ${c}`)
                .join(". ")}`}
              className="mt-1"
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
              return (
                <button
                  key={i}
                  disabled={!!result || submitting}
                  onClick={() => choose(i)}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-lg font-bold transition ${cls}`}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-sm text-slate-500">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{choice}</span>
                  {result && i === result.correct_index && <span className="ml-auto">✅</span>}
                  {result && i === selected && !result.is_correct && (
                    <span className="ml-auto">❌</span>
                  )}
                </button>
              );
            })}
          </div>

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
              {result.new_badges.map((b) => (
                <p key={b.id} className="mt-2 font-bold text-amber-700">
                  🏅 New badge: {b.emoji} {b.name}!
                </p>
              ))}
            </div>
          )}
        </div>

        {result &&
          (result.is_correct ? (
            <button
              onClick={next}
              className="btn-pop mt-5 w-full px-6 py-4 text-xl text-white"
              style={{ background: "var(--brand-orange)" }}
            >
              {index + 1 >= questions.length ? "See my results 🎉" : "Next question →"}
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
                  disabled={tryingMore}
                  className="btn-pop w-full px-6 py-3 text-lg text-white"
                  style={{ background: "var(--brand-blue)" }}
                >
                  {tryingMore ? "Getting one…" : "Try one like it 🔁"}
                </button>
              )}
              <button
                onClick={next}
                className="btn-pop w-full bg-white px-6 py-3 text-base text-slate-500 ring-2 ring-slate-200"
              >
                {index + 1 >= questions.length ? "Finish 🎉" : "Skip for now →"}
              </button>
            </div>
          ))}
      </main>

      {showTeach && current && (
        <TeachMe question={current} selectedIndex={selected} onClose={() => setShowTeach(false)} />
      )}
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
