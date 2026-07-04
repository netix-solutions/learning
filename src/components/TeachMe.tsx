"use client";

import { useEffect, useRef, useState } from "react";
import { SkillVisual } from "@/components/SkillVisual";
import { ScienceDiagram } from "@/components/ScienceDiagram";
import { AnimatedMath, canAnimate } from "@/components/AnimatedMath";
import { SpeakButton } from "@/components/SpeakButton";
import { parseArithmetic } from "@/lib/math-parse";
import type { PracticeQuestion } from "@/lib/types";

/**
 * A one-tap AI tutor panel. Streams a short, grounded, kid-safe lesson for the
 * given question from /api/teach (the child never types — no chat surface), and
 * shows an animated visual aid alongside it.
 */
export function TeachMe({
  question,
  selectedIndex,
  onClose,
  onTryOne,
}: {
  question: PracticeQuestion;
  selectedIndex: number | null;
  onClose: () => void;
  /** Jump straight into a fresh question of the same skill — the lesson only
   *  sticks when the kid immediately applies it. */
  onTryOne?: () => void;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"loading" | "streaming" | "done" | "error">("loading");
  const started = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (started.current) return; // guard against double-invoke in dev StrictMode
    started.current = true;
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/teach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id, selectedIndex }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          setText((await res.text().catch(() => "")) || "Hmm, I couldn't load a lesson — try again! 🙂");
          setStatus("error");
          return;
        }
        setStatus("streaming");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          setText((t) => t + decoder.decode(value, { stream: true }));
        }
        setStatus("done");
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setStatus("error");
          setText("Something went wrong — try again! 🙂");
        }
      }
    })();
    return () => ctrl.abort();
  }, [question.id, selectedIndex]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [text]);

  const subject = ["reading", "science"].includes(question.subject_id) ? question.subject_id : "math";
  const busy = status === "loading" || status === "streaming";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card-fun animate-pop flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 border-b border-slate-100 p-4">
          <span className="animate-wiggle text-3xl">🧑‍🏫</span>
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-slate-800">Your tutor</p>
            <p className="text-xs font-semibold text-slate-400">Let&apos;s understand it together</p>
          </div>
          {text && <SpeakButton id={`teach-${question.id}`} text={text} label="Read the lesson" />}
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full px-3 py-1 text-xl text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </header>

        <div ref={scrollRef} className="overflow-y-auto p-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            {(() => {
              // Arithmetic gets the animated walkthrough (carrying, borrowing,
              // counting) — the visual analog of what the tutor text explains.
              const parsed = subject === "math" ? parseArithmetic(question.prompt) : null;
              if (parsed && canAnimate(parsed)) return <AnimatedMath parsed={parsed} />;
              if (subject === "science") return <ScienceDiagram skill={question.skill} />;
              return (
                <SkillVisual prompt={question.prompt} skill={question.skill} subject={subject} />
              );
            })()}
          </div>
          <div className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-slate-700">
            {text}
            {busy && (
              <span className="ml-0.5 inline-block h-5 w-2 animate-pulse rounded-sm bg-violet-400 align-middle" />
            )}
          </div>
          {status === "loading" && !text && (
            <p className="mt-2 text-slate-400">Thinking of the best way to explain… ✨</p>
          )}
        </div>

        <footer className="flex flex-col gap-2 border-t border-slate-100 p-4">
          {status === "done" && onTryOne ? (
            <>
              <button
                onClick={onTryOne}
                className="btn-pop animate-pop w-full px-6 py-3 text-lg font-extrabold text-white"
                style={{ background: "linear-gradient(90deg, #10b981, #22c55e)" }}
              >
                Now you try one! 💪
              </button>
              <button
                onClick={onClose}
                className="btn-pop w-full bg-white px-6 py-2.5 text-base text-slate-500 ring-2 ring-slate-200"
              >
                Got it 👍
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="btn-pop w-full px-6 py-3 text-lg text-white"
              style={{ background: "var(--brand-blue)" }}
            >
              {status === "done" || status === "error" ? "Got it! 👍" : "Keep reading…"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
