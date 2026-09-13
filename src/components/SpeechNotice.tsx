"use client";
import { useSyncExternalStore } from "react";
import { speechState, serverSpeechState, subscribe, retrySpeech, stop } from "@/lib/speech";

/** Includes auto-read failures, which otherwise have no active Listen button. */
export function SpeechNotice() {
  const state = useSyncExternalStore(subscribe, speechState, serverSpeechState);
  if (state.status !== "error") return null;
  return <aside role="status" className="relative z-20 mx-auto my-3 w-[calc(100%-1.5rem)] max-w-lg shrink-0 rounded-2xl border-2 border-sky-200 bg-white p-4 text-slate-800 shadow-sm">
    <p className="text-sm font-semibold">{state.message}</p>
    <div className="mt-3 flex gap-3">
      <button onClick={retrySpeech} className="rounded-xl bg-sky-700 px-4 py-3 font-bold text-white">Retry voice</button>
      <button onClick={stop} className="rounded-xl px-4 py-3 font-bold ring-1 ring-slate-200">Keep reading</button>
    </div>
  </aside>;
}
