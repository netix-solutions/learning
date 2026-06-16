"use client";

import { useEffect, useRef, useState } from "react";
import { getMyPoints } from "@/app/actions/auth";
import { SwitchToParentButton } from "@/components/SwitchToParentButton";

/**
 * Minimal, kid-friendly footer for the children's pages (/home, /practice,
 * /kids). Instead of the full marketing/legal footer it shows just:
 *   - a fun, animated points tracker (counts up; pops when it grows),
 *   - a live clock + date,
 *   - the discreet "Grown-up" button to hand the device back to a parent.
 */
export function KidFooter() {
  const now = useClock();
  const [points, setPoints] = useState<number | null>(null);

  // Fetch the kid's points on mount, then poll so they tick up live as they
  // earn during practice.
  useEffect(() => {
    let alive = true;
    async function load() {
      const p = await getMyPoints();
      if (alive && typeof p === "number") setPoints(p);
    }
    load();
    const id = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <footer className="mt-auto w-full px-4 pb-6 pt-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-sm backdrop-blur sm:px-4">
        <PointsBadge points={points} />

        <div className="text-center leading-tight">
          <div className="font-display text-sm font-bold text-slate-700 tabular-nums">
            {now ? timeStr(now) : ""}
          </div>
          <div className="hidden text-[0.62rem] font-bold uppercase tracking-wide text-slate-400 sm:block">
            {now ? dateStr(now) : ""}
          </div>
        </div>

        <SwitchToParentButton />
      </div>
    </footer>
  );
}

/** Gradient points pill with a count-up animation and a pop when it increases. */
function PointsBadge({ points }: { points: number | null }) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const [pop, setPop] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (points == null) return;
    const start = displayRef.current;
    const end = points;
    const grew = end > start;
    const duration = 700;
    let startTime: number | null = null;

    function tick(t: number) {
      if (startTime === null) startTime = t;
      const k = Math.min(1, (t - startTime) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = Math.round(start + (end - start) * eased);
      displayRef.current = v;
      setDisplay(v);
      if (k < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    // Pop the badge when points go up — set from timers (not synchronously in
    // the effect body) so it's a clean side-effect.
    const popOn = grew ? setTimeout(() => setPop(true), 0) : undefined;
    const popOff = grew ? setTimeout(() => setPop(false), 550) : undefined;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (popOn) clearTimeout(popOn);
      if (popOff) clearTimeout(popOff);
    };
  }, [points]);

  if (points == null) return <span aria-hidden="true" />;

  return (
    <div
      aria-label={`${points} points`}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white shadow-sm ${
        pop ? "animate-cheer" : ""
      }`}
      style={{
        background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))",
      }}
    >
      <span className="animate-bob text-lg leading-none" aria-hidden="true">
        ⭐
      </span>
      <span className="font-display text-lg font-extrabold tabular-nums leading-none">
        {display.toLocaleString()}
      </span>
      <span className="text-[0.62rem] font-extrabold uppercase tracking-wide text-white/90">
        pts
      </span>
    </div>
  );
}

/** Ticks every second; null until mounted so server/client first paint match. */
function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return now;
}

function timeStr(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function dateStr(d: Date) {
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
