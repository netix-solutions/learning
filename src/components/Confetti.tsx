"use client";

import { useEffect, useState } from "react";

const COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#c780ff", "#ff9f45"];

/** A short burst of confetti. Bump `fire` to re-trigger. */
export function Confetti({ fire, count = 80 }: { fire: number; count?: number }) {
  const [pieces, setPieces] = useState<
    { id: string; left: number; delay: number; color: string; rot: number }[]
  >([]);

  useEffect(() => {
    if (!fire) return;
    const next = Array.from({ length: count }).map((_, i) => ({
      id: `${fire}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.35,
      color: COLORS[i % COLORS.length],
      rot: Math.random() * 360,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 2600);
    return () => clearTimeout(t);
  }, [fire, count]);

  return (
    <div aria-hidden className="pointer-events-none">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
