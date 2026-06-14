"use client";

import { useEffect } from "react";
import { playClick, preloadSounds } from "@/lib/sound";

// Elements that should make the tap sound.
const INTERACTIVE =
  "button, a[href], [role='button'], summary, input[type='submit'], " +
  "input[type='button'], input[type='radio'], input[type='checkbox']";

/**
 * Plays a playful tap sound whenever the user clicks a button, link, or quiz
 * answer — anywhere in the app. Implemented as a single delegated listener
 * mounted once in the root layout, so individual buttons need no wiring.
 *
 * Uses `pointerdown` (capture) for snappy feedback that fires even if a handler
 * calls `stopPropagation`. Disabled controls stay silent.
 */
export function ClickSound() {
  useEffect(() => {
    // Decode the sounds up front so the very first tap/correct cue has audio.
    preloadSounds();

    function onPointerDown(e: PointerEvent) {
      // Ignore non-primary buttons (right/middle click).
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      const el = target?.closest?.(INTERACTIVE) as
        | HTMLButtonElement
        | HTMLAnchorElement
        | HTMLInputElement
        | null;
      if (!el) return;
      if ("disabled" in el && el.disabled) return;
      if (el.getAttribute("aria-disabled") === "true") return;
      playClick();
    }

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () =>
      window.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
  }, []);

  return null;
}
