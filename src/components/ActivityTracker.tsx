"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Tracks active practice time toward a kid's daily-minutes goal. Mounted on the
 * practice screen, it sends a heartbeat every `intervalSec` seconds — but only
 * while the tab is visible AND the child has interacted recently (taps/keys), so
 * a left-open or idle tab never inflates usage. The server (record_activity)
 * caps per-call and per-day as a second line of defense.
 */
export function ActivityTracker({ intervalSec = 30 }: { intervalSec?: number }) {
  useEffect(() => {
    const supabase = createClient();
    let lastActive = Date.now();
    const IDLE_MS = 120_000; // skip a tick after 2 min with no interaction

    const markActive = () => {
      lastActive = Date.now();
    };
    window.addEventListener("pointerdown", markActive);
    window.addEventListener("keydown", markActive);

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastActive > IDLE_MS) return;
      void supabase.rpc("record_activity", { p_seconds: intervalSec });
    };
    const id = window.setInterval(tick, intervalSec * 1000);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("pointerdown", markActive);
      window.removeEventListener("keydown", markActive);
    };
  }, [intervalSec]);

  return null;
}
