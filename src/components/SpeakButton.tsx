"use client";

import { useSyncExternalStore } from "react";
import { speak, stop, speechState, serverSpeechState, subscribe } from "@/lib/speech";

/** ElevenLabs narration, with a visible loading state and a second-tap stop. */
export function SpeakButton({ id, text, audioSrc, onListen, label = "Listen", className = "" }: {
  id: string; text: string; audioSrc?: string; onListen?: () => void; label?: string; className?: string;
}) {
  const state = useSyncExternalStore(subscribe, speechState, serverSpeechState);
  const active = state.id === id && (state.status === "loading" || state.status === "playing");
  const loading = active && state.status === "loading";
  const failed = state.id === id && state.status === "error";
  return (
    <button type="button" onClick={e => {
      e.preventDefault(); e.stopPropagation();
      if (active) stop(); else { onListen?.(); speak(id, text, audioSrc); }
    }}
      aria-label={loading ? "Cancel loading narration" : active ? "Stop reading" : failed ? "Retry voice" : label}
      title={loading ? "Loading voice…" : active ? "Stop" : failed ? "Retry voice" : label}
      aria-pressed={active}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${active ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-700 hover:bg-sky-200"} ${className}`}>
      <span aria-hidden="true">{loading ? "…" : active ? "⏹" : failed ? "↻" : "🔊"}</span>
    </button>
  );
}
