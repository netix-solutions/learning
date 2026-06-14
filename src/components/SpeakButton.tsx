"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { speak, stop, speakingId, subscribe, speechSupported } from "@/lib/speech";

/**
 * A tap-to-listen 🔊 button. Reads `text` aloud with the on-device voice; tap
 * again (or tap another) to stop. Renders nothing where speech isn't supported.
 * Tap-initiated by design — browsers (esp. iOS) block auto-playing audio.
 */
export function SpeakButton({
  id,
  text,
  label = "Listen",
  className = "",
}: {
  id: string;
  text: string;
  label?: string;
  className?: string;
}) {
  const current = useSyncExternalStore(subscribe, speakingId, () => null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Render identically on the server and first client paint (null) to avoid a
  // hydration mismatch, then reveal once we know speech is available.
  if (!mounted || !speechSupported()) return null;

  const active = current === id;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (active) stop();
        else speak(id, text);
      }}
      aria-label={active ? "Stop reading" : label}
      title={active ? "Stop" : label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg transition ${
        active
          ? "animate-pulse bg-sky-500 text-white"
          : "bg-sky-100 text-sky-700 hover:bg-sky-200"
      } ${className}`}
    >
      {active ? "⏹" : "🔊"}
    </button>
  );
}
