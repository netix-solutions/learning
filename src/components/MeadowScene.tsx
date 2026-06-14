import type { CSSProperties } from "react";

// A friendly, animated background: a soft sky with a bobbing sun and drifting
// clouds, over rolling grassy hills pinned to the bottom of the viewport. A
// light frosted-glass scrim sits on top so page content stays readable.
// Pure SVG + CSS, decorative (aria-hidden), behind all content.

// The flying biplane is built and ready (Biplane / Puff below + .scene-plane
// styles in globals.css) but currently disabled — set to true to re-enable it.
const SHOW_PLANE = false;

const CLOUDS: { top: string; scale: number; dur: number; delay: number; o: number }[] = [
  { top: "8%", scale: 1.0, dur: 90, delay: -10, o: 0.95 },
  { top: "16%", scale: 0.7, dur: 70, delay: -45, o: 0.85 },
  { top: "5%", scale: 0.55, dur: 110, delay: -80, o: 0.8 },
  { top: "24%", scale: 0.85, dur: 100, delay: -30, o: 0.9 },
  { top: "13%", scale: 0.6, dur: 130, delay: -100, o: 0.8 },
];

function Cloud({ o }: { o: number }) {
  return (
    <svg width="220" height="100" viewBox="0 0 220 100" fill="none">
      <g fill="#ffffff" opacity={o}>
        <ellipse cx="70" cy="64" rx="50" ry="36" />
        <ellipse cx="122" cy="54" rx="48" ry="42" />
        <ellipse cx="168" cy="66" rx="44" ry="32" />
        <rect x="48" y="62" width="140" height="34" rx="17" />
      </g>
      <ellipse cx="122" cy="92" rx="92" ry="9" fill="#cdeeff" opacity={o * 0.5} />
    </svg>
  );
}

// A tiny puff of cloud left behind in the plane's wake. Sits to the left of the
// tail and (via .scene-puff) drifts back, swells, and fades — staggered so the
// trail shimmers continuously while the plane is on screen.
function Puff({ cx, cy, s, delay }: { cx: number; cy: number; s: number; delay: number }) {
  return (
    <g className="scene-puff" style={{ animationDelay: `${delay}s` }} fill="#ffffff" opacity={0.9}>
      <ellipse cx={cx} cy={cy} rx={6 * s} ry={5 * s} />
      <ellipse cx={cx + 7 * s} cy={cy - 2 * s} rx={5 * s} ry={4.5 * s} />
      <ellipse cx={cx - 6 * s} cy={cy + 1 * s} rx={4.5 * s} ry={4 * s} />
    </g>
  );
}

// A green biplane, nose pointing right (its travel direction). A long tapered
// fuselage, two stacked wings with struts, a canopy, fixed landing gear, and a
// spinning propeller — plus a trail of Puffs behind the tail. Decorative SVG.
function Biplane() {
  return (
    <svg width="300" height="128" viewBox="-10 0 300 128" fill="none" aria-hidden>
      <defs>
        <linearGradient id="planeBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#74d863" />
          <stop offset="52%" stopColor="#4fb84a" />
          <stop offset="100%" stopColor="#359a3e" />
        </linearGradient>
      </defs>

      {/* Wake of tiny clouds, trailing behind the tail */}
      <Puff cx={52} cy={64} s={0.8} delay={0} />
      <Puff cx={32} cy={58} s={1.0} delay={0.6} />
      <Puff cx={12} cy={66} s={1.2} delay={1.2} />

      {/* Lower wing (behind the body) */}
      <rect x="128" y="72" width="100" height="12" rx="6" fill="#3fae46" />
      <rect x="128" y="72" width="100" height="4" rx="2" fill="#57c24a" />

      {/* Tail: vertical fin + horizontal stabiliser */}
      <path d="M86,58 L70,26 L106,52 Z" fill="#359a3e" />
      <path d="M84,62 L58,60 L86,54 Z" fill="#2f9e3f" />

      {/* Long tapered fuselage, nose at the right */}
      <path
        d="M68,60 C96,51 134,48 174,48 C212,48 238,52 250,60 C238,68 212,72 174,72 C134,72 96,69 68,60 Z"
        fill="url(#planeBody)"
      />

      {/* Cockpit canopy (top dome) */}
      <path d="M182,49 a17,12 0 0 1 34,0 Z" fill="#bfe8ff" />
      <path d="M182,49 a17,12 0 0 1 34,0" fill="none" stroke="#2f8f38" strokeWidth="2.5" strokeLinecap="round" />

      {/* Cabane / interplane struts */}
      <rect x="150" y="34" width="3" height="16" rx="1.5" fill="#2f9e3f" />
      <rect x="200" y="34" width="3" height="16" rx="1.5" fill="#2f9e3f" />

      {/* Upper wing */}
      <rect x="138" y="28" width="106" height="12" rx="6" fill="#5bc24f" />
      <rect x="138" y="28" width="106" height="4" rx="2" fill="#7ed957" />

      {/* Fixed landing gear */}
      <path d="M168,72 L162,98 M188,72 L184,98" stroke="#2f9e3f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="173" cy="100" r="9" fill="#3a4a3f" />
      <circle cx="173" cy="100" r="3.5" fill="#9fb3a4" />

      {/* Engine cowl + spinning propeller at the nose */}
      <ellipse cx="250" cy="60" rx="9" ry="12" fill="#359a3e" />
      <circle cx="256" cy="60" r="19" fill="#ffffff" opacity="0.13" />
      <g className="scene-prop">
        <ellipse cx="256" cy="60" rx="3.4" ry="19" fill="#2f8f38" />
        <ellipse cx="256" cy="60" rx="19" ry="3.4" fill="#2f8f38" opacity="0.45" />
      </g>
      <circle cx="256" cy="60" r="5" fill="#235b2b" />
    </svg>
  );
}

export function MeadowScene() {
  return (
    <>
      {/* The scene itself */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: -2 }}
      >
        {/* Sky */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,#aee2ff 0%,#cfeeff 38%,#e9fbff 64%,#eafff2 100%)" }}
        />

        {/* Sun */}
        <div className="scene-sun absolute" style={{ top: "5%", left: "7%" }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="#ffe9a8" opacity="0.55" />
            <g className="scene-rays">
              {Array.from({ length: 12 }).map((_, i) => (
                <rect
                  key={i}
                  x="58"
                  y="2"
                  width="4"
                  height="16"
                  rx="2"
                  fill="#ffc223"
                  transform={`rotate(${i * 30} 60 60)`}
                />
              ))}
            </g>
            <circle cx="60" cy="60" r="34" fill="#ffd23f" />
            <circle cx="60" cy="60" r="34" fill="url(#sunhi)" />
            <defs>
              <radialGradient id="sunhi" cx="38%" cy="34%" r="70%">
                <stop offset="0%" stopColor="#fff6cf" />
                <stop offset="100%" stopColor="#ffd23f" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Clouds */}
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className="scene-cloud absolute left-0"
            style={
              {
                top: c.top,
                animationDuration: `${c.dur}s`,
                animationDelay: `${c.delay}s`,
              } as CSSProperties
            }
          >
            <div style={{ transform: `scale(${c.scale})`, transformOrigin: "left center" }}>
              <Cloud o={c.o} />
            </div>
          </div>
        ))}

        {/* Biplane crossing just below the clouds — disabled for now (too
            distracting); flip SHOW_PLANE to true to bring it back. */}
        {SHOW_PLANE && (
          <div className="scene-plane absolute left-0" style={{ top: "29%" }}>
            <div style={{ transform: "scale(0.78)", transformOrigin: "left center" }}>
              <Biplane />
            </div>
          </div>
        )}

        {/* Rolling grassy hills, anchored to the bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 360"
          preserveAspectRatio="xMidYMax meet"
          style={{ height: "auto" }}
        >
          <defs>
            <linearGradient id="grassFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7ed957" />
              <stop offset="100%" stopColor="#57c24a" />
            </linearGradient>
          </defs>

          {/* Back hills */}
          <path
            d="M0,120 C 260,64 470,104 720,92 C 980,80 1180,120 1440,84 L1440,360 L0,360 Z"
            fill="#bfe98a"
          />
          <path
            d="M0,180 C 240,228 380,156 700,180 C 980,200 1180,158 1440,190 L1440,360 L0,360 Z"
            fill="#a7df76"
          />

          {/* Tree */}
          <g transform="translate(170,96)">
            <rect x="44" y="120" width="26" height="96" rx="12" fill="#9c6b3f" />
            <g className="scene-sway">
              <circle cx="56" cy="44" r="46" fill="#5bc24f" />
              <circle cx="14" cy="86" r="40" fill="#4fb646" />
              <circle cx="98" cy="84" r="42" fill="#67cf5a" />
              <circle cx="56" cy="92" r="44" fill="#5bc24f" />
            </g>
          </g>

          {/* Front grass */}
          <path
            d="M0,236 C 300,198 520,244 760,230 C 1000,216 1240,248 1440,222 L1440,360 L0,360 Z"
            fill="url(#grassFront)"
          />

          {/* Grass tufts */}
          {[120, 250, 470, 600, 760, 900, 1080, 1180, 1340].map((x, i) => (
            <path
              key={i}
              d={`M${x},356 q -7,-24 0,-38 q 7,14 0,38 M${x + 12},356 q -6,-18 0,-28 q 6,12 0,28`}
              fill="#46b14a"
            />
          ))}
        </svg>
      </div>

      {/* Frosted-glass scrim — softens the scene so content stays readable */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: -1,
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          background: "rgba(255,255,255,0.32)",
        }}
      />
    </>
  );
}
