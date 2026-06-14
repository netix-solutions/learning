"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/**
 * Looping background music for the kid game area (the student home + practice
 * pages). Mounted ONCE in the root layout, so the <audio> element survives
 * client navigation between /home and /practice and the track plays continuously.
 *
 * - Plays only on game paths; pauses everywhere else (parent/marketing).
 * - Preference (on/off) persists in localStorage and defaults to ON.
 * - Respects browser autoplay rules: if play() is blocked before a gesture, we
 *   start on the first tap/keypress.
 * - The floating button (SVG speaker, no emoji) lets kids mute/unmute; it only
 *   shows on game paths, after hydration.
 */

const SRC = "/music/curious-kiddo.mp3";
const STORE_KEY = "ss-music-enabled";

function isGamePath(p: string | null): boolean {
  return p === "/home" || (!!p && p.startsWith("/practice"));
}

// "Am I running on the client (post-hydration)?" without setState-in-effect.
const noopSubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function BackgroundMusic() {
  const pathname = usePathname();
  const isClient = useIsClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Saved preference (default ON). SSR-safe lazy init; only read once the button
  // actually renders (after hydration), so there is no server/client mismatch.
  const [enabled, setEnabled] = useState<boolean>(() =>
    typeof window === "undefined" ? true : localStorage.getItem(STORE_KEY) !== "0",
  );

  // Build the audio element once.
  useEffect(() => {
    const a = new Audio(SRC);
    a.loop = true;
    a.volume = 0.3;
    a.preload = "auto";
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, []);

  const onGame = isGamePath(pathname);

  // Drive play/pause from preference + current route.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    if (!enabled || !onGame) {
      a.pause();
      return;
    }

    let cleanup = () => {};
    a.play().catch(() => {
      // Autoplay blocked until a user gesture — start on the first interaction.
      const start = () => {
        a.play().catch(() => {});
        cleanup();
      };
      cleanup = () => {
        window.removeEventListener("pointerdown", start);
        window.removeEventListener("keydown", start);
      };
      window.addEventListener("pointerdown", start);
      window.addEventListener("keydown", start);
    });
    return () => cleanup();
  }, [enabled, onGame]);

  if (!onGame || !isClient) return null;

  const toggle = () => {
    setEnabled((e) => {
      const next = !e;
      try {
        localStorage.setItem(STORE_KEY, next ? "1" : "0");
      } catch {
        /* ignore storage failures (private mode) */
      }
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? "Turn music off" : "Turn music on"}
      aria-pressed={enabled}
      title={enabled ? "Music on — tap to mute" : "Music off — tap to play"}
      className="fixed bottom-4 right-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-white text-slate-700 shadow-lg ring-2 ring-slate-200 transition hover:scale-105 hover:text-slate-900"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      {enabled ? <SpeakerOn /> : <SpeakerOff />}
    </button>
  );
}

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      <path d="M17 9l4 6M21 9l-4 6" />
    </svg>
  );
}
