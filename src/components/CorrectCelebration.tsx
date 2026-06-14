"use client";

import { useEffect, useState, type CSSProperties } from "react";

// A lively mix of celebratory emoji flung outward on each correct answer.
const EMOJI = ["⭐", "🌟", "✨", "🎉", "💫", "🏆", "🥳", "💥", "🔥", "🎊", "👏", "🚀"];

type Particle = {
  id: string;
  emoji: string;
  tx: number;
  ty: number;
  spin: number;
  delay: number;
  size: number;
};

/**
 * Big "you got it!" moment. Bump `fire` to re-trigger. Renders, from screen
 * center: an expanding success ring, a radial burst of emoji, a soft green
 * flash, and a bouncing cheer badge. Everything auto-clears, and the whole
 * thing is suppressed under `prefers-reduced-motion` via CSS.
 */
export function CorrectCelebration({
  fire,
  cheer,
}: {
  fire: number;
  cheer: string;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!fire) return;
    const count = 22;
    const next: Particle[] = Array.from({ length: count }).map((_, i) => {
      // Spread evenly around the circle, with a little jitter and varied reach.
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 130 + Math.random() * 170;
      return {
        id: `${fire}-${i}`,
        emoji: EMOJI[Math.floor(Math.random() * EMOJI.length)],
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist - 30, // bias upward so it feels like it lifts
        spin: Math.random() * 720 - 360,
        delay: Math.random() * 0.08,
        size: 1.4 + Math.random() * 1.8,
      };
    });
    setParticles(next);
    const t = setTimeout(() => setParticles([]), 1700);
    return () => clearTimeout(t);
  }, [fire]);

  if (!particles.length) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <div className="success-flash" />

      <span
        className="ripple-ring"
        style={{
          width: 90,
          height: 90,
          borderWidth: 5,
          borderColor: "var(--brand-sun)",
        }}
      />
      <span
        className="ripple-ring"
        style={{
          width: 90,
          height: 90,
          borderWidth: 3,
          borderColor: "#34d399",
          animationDelay: "0.1s",
        }}
      />

      {particles.map((p) => (
        <span
          key={p.id}
          className="burst-particle"
          style={
            {
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--spin": `${p.spin}deg`,
              fontSize: `${p.size}rem`,
              animationDelay: `${p.delay}s`,
            } as CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}

      <span className="cheer-badge">
        <span
          className="inline-block rounded-full px-7 py-3 font-display text-3xl font-extrabold text-white sm:text-4xl"
          style={{
            background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))",
            boxShadow: "0 10px 30px -6px rgba(245, 124, 31, 0.6)",
            WebkitTextStroke: "0",
          }}
        >
          {cheer}
        </span>
      </span>
    </div>
  );
}
