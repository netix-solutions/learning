"use client";

import { useEffect, useState } from "react";

/**
 * A floating "+N points" reward that pops up, lifts, and fades whenever the kid
 * scores. Bump `fire` to re-trigger; `amount` is the points earned. Anchored
 * near the top so it reads as points flying toward the score counter.
 */
export function PointsPopup({
  fire,
  amount,
}: {
  fire: number;
  amount: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!fire) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, [fire]);

  if (!show || amount <= 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-[14%] z-[60]"
    >
      <span className="points-pop inline-flex items-center gap-1.5 rounded-full px-5 py-2 font-display text-2xl font-extrabold text-white drop-shadow-lg sm:text-3xl"
        style={{
          background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))",
          boxShadow: "0 8px 24px -4px rgba(245, 124, 31, 0.6)",
        }}
      >
        <span>⭐</span>+{amount} points!
      </span>
    </div>
  );
}
