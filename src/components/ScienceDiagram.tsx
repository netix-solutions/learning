"use client";

/**
 * Animated, kid-friendly SVG diagrams for the Science subject — the visual analog
 * of the math `SkillVisual`. Picks a diagram from the question's `skill`; falls
 * back to a friendly lab mascot. All motion uses the `sci-*` classes in
 * globals.css (and respects prefers-reduced-motion). Inline SVG → crisp at any
 * size and works offline in the PWA.
 */
export function ScienceDiagram({
  skill,
  className = "",
}: {
  skill?: string | null;
  className?: string;
}) {
  return <div className={`grid place-items-center ${className}`}>{pick(skill ?? "")}</div>;
}

function pick(k: string) {
  if (k.includes("watercycle")) return <WaterCycle />;
  if (k.includes("solar")) return <SolarSystem />;
  if (k.includes("lifecycle")) return <LifeCycle />;
  if (k.includes("plants")) return <PlantGrowth />;
  if (k === "2.matter" || k === "5.matter" || k.includes("matterchange")) return <StatesOfMatter />;
  if (k.includes("moon")) return <MoonPhases />;
  if (k.includes("daynight")) return <DayNight />;
  if (k.includes("foodweb")) return <FoodChain />;
  if (k.includes("circuit")) return <Circuit />;
  if (k.includes("magnet")) return <Magnets />;
  if (k.includes("senses")) return <Senses />;
  if (k.includes("livingnonliving")) return <LivingNonliving />;
  if (k.includes("animalneeds")) return <AnimalNeeds />;
  if (k.includes("animalbabies")) return <AnimalBabies />;
  if (k.includes("weather")) return <Weather />;
  if (k.includes("force") || k.includes("pushpull")) return <Forces />;
  if (k.includes("energy")) return <EnergyRays />;
  if (k.includes("body")) return <Body />;
  if (k.includes("season")) return <Seasons />;
  if (k.includes("habitat")) return <Habitats />;
  return <LabMascot />;
}

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label={label} className="h-auto w-full max-w-[300px]">
      {children}
    </svg>
  );
}

function SunRays({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g className="sci-spin">
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * (r + 3)}
            y1={cy + Math.sin(a) * (r + 3)}
            x2={cx + Math.cos(a) * (r + 9)}
            y2={cy + Math.sin(a) * (r + 9)}
            stroke="#ffb703"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function WaterCycle() {
  return (
    <Frame label="The water cycle">
      <SunRays cx={32} cy={28} r={11} />
      <circle cx="32" cy="28" r="11" fill="#ffc223" />
      {/* sea */}
      <path d="M0 96 Q55 90 110 96 T220 96 V120 H0 Z" fill="#2aa7e6" />
      {/* rising vapor */}
      {[0, 1, 2].map((i) => (
        <circle key={i} className="sci-rise" style={{ animationDelay: `${i * 0.6}s` }} cx={70 + i * 9} cy="93" r="3" fill="#cdeeff" />
      ))}
      {/* cloud */}
      <g fill="#f1f6fb" stroke="#d7e6f2">
        <ellipse cx="158" cy="42" rx="26" ry="14" />
        <circle cx="144" cy="40" r="11" />
        <circle cx="172" cy="40" r="12" />
      </g>
      {/* rain */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          className="sci-rain"
          style={{ animationDelay: `${i * 0.3}s` }}
          x1={146 + i * 8}
          y1="56"
          x2={146 + i * 8}
          y2="64"
          stroke="#1d70c2"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
      {/* loop arrow hint */}
      <path d="M44 40 Q90 8 132 30" fill="none" stroke="#7fb2dd" strokeWidth="2" strokeDasharray="3 4" markerEnd="" />
    </Frame>
  );
}

function SolarSystem() {
  const planets = [
    { r: 26, size: 2.5, color: "#a9a9a9" },
    { r: 38, size: 3.5, color: "#e6b87a" },
    { r: 50, size: 3.5, color: "#3fa9f5" },
    { r: 64, size: 3, color: "#e0593f" },
    { r: 82, size: 6, color: "#d9a05b" },
  ];
  return (
    <Frame label="The solar system">
      {/* orbit rings */}
      {planets.map((p, i) => (
        <circle key={i} cx="110" cy="60" r={p.r} fill="none" stroke="#dfe7ef" strokeWidth="1" />
      ))}
      {/* the sun */}
      <SunRays cx={110} cy={60} r={11} />
      <circle cx="110" cy="60" r="11" fill="#ffc223" />
      {/* planets revolve together */}
      <g className="sci-orbit" style={{ transformBox: "view-box", transformOrigin: "110px 60px" } as React.CSSProperties}>
        {planets.map((p, i) => (
          <circle key={i} cx={110 + p.r} cy="60" r={p.size} fill={p.color} style={{ transform: `rotate(${i * 67}deg)`, transformBox: "view-box", transformOrigin: "110px 60px" } as React.CSSProperties} />
        ))}
      </g>
    </Frame>
  );
}

function StatesOfMatter() {
  const box = (x: number, label: string, fill: string, pts: [number, number][]) => (
    <g>
      <rect x={x} y="28" width="56" height="56" rx="8" fill="#f4f8fc" stroke="#d7e6f2" />
      {pts.map(([px, py], i) => (
        <circle key={i} className="sci-jiggle" style={{ animationDelay: `${i * 0.12}s` }} cx={x + px} cy={28 + py} r="4" fill={fill} />
      ))}
      <text x={x + 28} y="98" textAnchor="middle" fontSize="10" fontWeight="700" fill="#51688a">
        {label}
      </text>
    </g>
  );
  // solid: tight grid; liquid: looser; gas: spread out
  const grid: [number, number][] = [
    [16, 16], [28, 16], [40, 16], [16, 28], [28, 28], [40, 28], [16, 40], [28, 40], [40, 40],
  ];
  const loose: [number, number][] = [
    [16, 20], [30, 16], [42, 24], [20, 36], [36, 38], [28, 28],
  ];
  const spread: [number, number][] = [
    [14, 14], [44, 18], [24, 40], [46, 44], [30, 26],
  ];
  return (
    <Frame label="States of matter">
      {box(12, "Solid", "#1d70c2", grid)}
      {box(82, "Liquid", "#2aa7e6", loose)}
      {box(152, "Gas", "#7fc4ef", spread)}
    </Frame>
  );
}

function PlantGrowth() {
  return (
    <Frame label="A plant grows">
      <SunRays cx={36} cy={28} r={10} />
      <circle cx="36" cy="28" r="10" fill="#ffc223" />
      {/* soil */}
      <rect x="0" y="100" width="220" height="20" fill="#a9744f" />
      {/* stem grows up */}
      <rect className="sci-grow" x="108" y="58" width="4" height="44" fill="#3fb24b" />
      {/* leaves */}
      <ellipse className="sci-grow" style={{ animationDelay: "0.5s" }} cx="98" cy="80" rx="12" ry="6" fill="#5cc85f" transform="rotate(-20 98 80)" />
      <ellipse className="sci-grow" style={{ animationDelay: "0.7s" }} cx="122" cy="72" rx="12" ry="6" fill="#5cc85f" transform="rotate(20 122 72)" />
      {/* flower */}
      <g className="sci-pulse" style={{ animationDelay: "1s" }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * Math.PI) / 3;
          return <circle key={i} cx={110 + Math.cos(a) * 9} cy={52 + Math.sin(a) * 9} r="6" fill="#f06ea9" />;
        })}
        <circle cx="110" cy="52" r="6" fill="#ffc223" />
      </g>
    </Frame>
  );
}

function Circuit() {
  return (
    <Frame label="A simple circuit">
      {/* wire loop */}
      <rect x="40" y="34" width="140" height="56" rx="10" fill="none" stroke="#9aa7b4" strokeWidth="4" />
      {/* flowing current */}
      <rect x="40" y="34" width="140" height="56" rx="10" fill="none" stroke="#ffc223" strokeWidth="4" className="sci-flow" />
      {/* battery */}
      <rect x="86" y="84" width="48" height="14" rx="2" fill="#143a5e" />
      <rect x="86" y="84" width="10" height="14" fill="#f57c1f" />
      <text x="110" y="112" textAnchor="middle" fontSize="9" fontWeight="700" fill="#51688a">battery</text>
      {/* bulb */}
      <g className="sci-pulse">
        <circle cx="110" cy="30" r="12" fill="#fff2b0" stroke="#ffc223" strokeWidth="2" />
        <text x="110" y="35" textAnchor="middle" fontSize="14">💡</text>
      </g>
    </Frame>
  );
}

function Magnets() {
  return (
    <Frame label="Magnets attract">
      {/* left magnet (U shape) */}
      <g transform="translate(34,40)">
        <rect x="0" y="0" width="16" height="40" rx="3" fill="#e0593f" />
        <rect x="0" y="0" width="16" height="12" fill="#3fa9f5" />
        <text x="8" y="9" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">N</text>
      </g>
      <g transform="translate(170,40)">
        <rect x="0" y="0" width="16" height="40" rx="3" fill="#3fa9f5" />
        <rect x="0" y="28" width="16" height="12" fill="#e0593f" />
        <text x="8" y="56" textAnchor="middle" fontSize="8" fill="#51688a" fontWeight="700">S</text>
      </g>
      {/* field lines pulling together */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          className="sci-flow"
          style={{ animationDelay: `${i * 0.15}s` }}
          d={`M58 ${52 + i * 8} H162`}
          fill="none"
          stroke="#9b6dd6"
          strokeWidth="2.5"
        />
      ))}
      <text x="110" y="100" textAnchor="middle" fontSize="10" fontWeight="700" fill="#51688a">opposite poles attract</text>
    </Frame>
  );
}

function MoonPhases() {
  const phases = ["🌑", "🌒", "🌓", "🌔", "🌕"];
  return (
    <Frame label="Moon phases">
      {phases.map((m, i) => (
        <text
          key={i}
          x={26 + i * 42}
          y="62"
          textAnchor="middle"
          fontSize="28"
          className={i === phases.length - 1 ? "sci-pulse" : ""}
        >
          {m}
        </text>
      ))}
      <text x="110" y="98" textAnchor="middle" fontSize="10" fontWeight="700" fill="#51688a">new moon → full moon</text>
    </Frame>
  );
}

function DayNight() {
  return (
    <Frame label="Day and night">
      <text x="40" y="66" textAnchor="middle" fontSize="26">☀️</text>
      <g className="sci-spin">
        <circle cx="130" cy="58" r="26" fill="#3fa9f5" />
        <path d="M130 32 a26 26 0 0 1 0 52 z" fill="#143a5e" opacity="0.55" />
        <text x="118" y="63" textAnchor="middle" fontSize="14">🌍</text>
      </g>
      <text x="130" y="104" textAnchor="middle" fontSize="10" fontWeight="700" fill="#51688a">Earth spins</text>
    </Frame>
  );
}

function FoodChain() {
  const nodes = ["☀️", "🌱", "🐛", "🐦", "🦊"];
  return (
    <Frame label="A food chain">
      {nodes.map((n, i) => (
        <text key={i} x={24 + i * 44} y="56" textAnchor="middle" fontSize="22">
          {n}
        </text>
      ))}
      {nodes.slice(0, -1).map((_, i) => (
        <line
          key={i}
          className="sci-flow"
          style={{ animationDelay: `${i * 0.12}s` }}
          x1={36 + i * 44}
          y1="52"
          x2={56 + i * 44}
          y2="52"
          stroke="#3fb24b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <text x="110" y="86" textAnchor="middle" fontSize="10" fontWeight="700" fill="#51688a">energy flows this way →</text>
    </Frame>
  );
}

function Weather() {
  return (
    <Frame label="Weather">
      <SunRays cx={70} cy={42} r={13} />
      <circle cx="70" cy="42" r="13" fill="#ffc223" />
      <g fill="#f1f6fb" stroke="#d7e6f2">
        <ellipse cx="128" cy="52" rx="34" ry="18" />
        <circle cx="110" cy="48" r="14" />
        <circle cx="146" cy="48" r="16" />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          className="sci-rain"
          style={{ animationDelay: `${i * 0.22}s` }}
          x1={104 + i * 11}
          y1="70"
          x2={104 + i * 11}
          y2="80"
          stroke="#2aa7e6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
    </Frame>
  );
}

function Forces() {
  return (
    <Frame label="Push and pull">
      <rect className="animate-bob" x="96" y="48" width="34" height="30" rx="5" fill="#3fa9f5" />
      {/* push arrow */}
      <g className="sci-pulse">
        <line x1="56" y1="63" x2="90" y2="63" stroke="#f57c1f" strokeWidth="5" strokeLinecap="round" />
        <path d="M90 63 l-10 -6 v12 z" fill="#f57c1f" />
      </g>
      <text x="110" y="100" textAnchor="middle" fontSize="10" fontWeight="700" fill="#51688a">a push makes it move →</text>
    </Frame>
  );
}

function EnergyRays() {
  return (
    <Frame label="Energy">
      <SunRays cx={64} cy={56} r={16} />
      <circle cx="64" cy="56" r="16" fill="#ffc223" />
      <g className="sci-flow">
        <line x1="86" y1="56" x2="138" y2="56" stroke="#ffb703" strokeWidth="4" />
      </g>
      <g className="sci-pulse">
        <text x="160" y="64" textAnchor="middle" fontSize="30">💡</text>
      </g>
    </Frame>
  );
}

function Body() {
  return (
    <Frame label="The human body">
      <g className="sci-pulse">
        <text x="110" y="70" textAnchor="middle" fontSize="42">❤️</text>
      </g>
      <text x="110" y="104" textAnchor="middle" fontSize="10" fontWeight="700" fill="#51688a">your heart pumps blood</text>
    </Frame>
  );
}

function LifeCycle() {
  const stages = ["🥚", "🐛", "🟢", "🦋"];
  return (
    <Frame label="A butterfly's life cycle">
      {stages.map((s, i) => (
        <g key={i} className={i === stages.length - 1 ? "sci-pulse" : ""}>
          <text x={28 + i * 56} y="56" textAnchor="middle" fontSize="24">
            {s}
          </text>
        </g>
      ))}
      {stages.slice(0, -1).map((_, i) => (
        <line key={i} x1={42 + i * 56} y1="52" x2={68 + i * 56} y2="52" stroke="#9b6dd6" strokeWidth="3" strokeLinecap="round" />
      ))}
      <text x="110" y="86" textAnchor="middle" fontSize="9" fontWeight="700" fill="#51688a">egg → caterpillar → chrysalis → butterfly</text>
    </Frame>
  );
}

function Senses() {
  return (
    <Frame label="The five senses">
      {/* head */}
      <circle cx="92" cy="54" r="34" fill="#ffe0b8" stroke="#e8a86a" strokeWidth="2" />
      {/* ears (hearing) */}
      <circle cx="58" cy="54" r="7" fill="#ffd2a0" stroke="#e8a86a" strokeWidth="2" />
      <circle cx="126" cy="54" r="7" fill="#ffd2a0" stroke="#e8a86a" strokeWidth="2" />
      {/* eyes (sight) */}
      <circle cx="80" cy="46" r="5" fill="#fff" stroke="#5b4636" strokeWidth="1.5" />
      <circle cx="104" cy="46" r="5" fill="#fff" stroke="#5b4636" strokeWidth="1.5" />
      <circle cx="80" cy="46" r="2.2" fill="#2d2a32" />
      <circle cx="104" cy="46" r="2.2" fill="#2d2a32" />
      {/* nose (smell) */}
      <path d="M92 50 v9 l-4 2" fill="none" stroke="#c98a57" strokeWidth="2" strokeLinecap="round" />
      {/* mouth (taste) */}
      <path d="M82 68 q10 7 20 0" fill="none" stroke="#b5503c" strokeWidth="2.4" strokeLinecap="round" />
      {/* hand (touch) */}
      <g transform="translate(150 36)">
        <rect x="2" y="16" width="20" height="20" rx="6" fill="#ffd2a0" stroke="#e8a86a" strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={3 + i * 4.6} y="4" width="3.2" height="16" rx="1.6" fill="#ffd2a0" stroke="#e8a86a" strokeWidth="1.5" />
        ))}
      </g>
      <text x="110" y="108" textAnchor="middle" fontSize="10" fontWeight="700" fill="#51688a">see · hear · smell · taste · touch</text>
    </Frame>
  );
}

function LivingNonliving() {
  return (
    <Frame label="Living and non-living things">
      <rect x="0" y="92" width="220" height="28" fill="#e2f1d8" />
      {/* living: a plant that grows */}
      <g className="sci-grow">
        <line x1="70" y1="92" x2="70" y2="54" stroke="#3fb24b" strokeWidth="4" strokeLinecap="round" />
        <path d="M70 72 q-18 -3 -24 -16 q17 -1 24 12 z" fill="#5bc85f" />
        <path d="M70 64 q18 -3 24 -16 q-17 -1 -24 12 z" fill="#5bc85f" />
        <circle cx="70" cy="48" r="9" fill="#ff8fb1" />
        <circle cx="70" cy="48" r="3.2" fill="#ffd23f" />
      </g>
      {/* non-living: a rock */}
      <path d="M132 92 q4 -28 30 -28 q28 0 28 28 z" fill="#9aa3ad" stroke="#7c858f" strokeWidth="2" />
      <path d="M150 78 l7 -7 7 7" fill="none" stroke="#7c858f" strokeWidth="1.5" strokeLinecap="round" />
      <text x="70" y="110" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#3f8e45">living — it grows</text>
      <text x="162" y="110" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#6b7480">non-living</text>
    </Frame>
  );
}

function AnimalNeeds() {
  return (
    <Frame label="What animals need to live">
      {/* food bowl */}
      <path d="M20 52 h32 a16 16 0 0 1 -32 0 z" fill="#e0a96d" stroke="#b07c45" strokeWidth="2" />
      <circle cx="30" cy="48" r="2.6" fill="#b07c45" />
      <circle cx="38" cy="49" r="2.6" fill="#b07c45" />
      <circle cx="46" cy="48" r="2.6" fill="#b07c45" />
      <text x="36" y="82" textAnchor="middle" fontSize="9" fontWeight="700" fill="#51688a">food</text>
      {/* water drop */}
      <path d="M92 36 q13 17 0 26 q-13 -9 0 -26 z" fill="#4fb3e6" stroke="#2a8bc0" strokeWidth="2" />
      <text x="92" y="82" textAnchor="middle" fontSize="9" fontWeight="700" fill="#51688a">water</text>
      {/* air (breeze) */}
      <g fill="none" stroke="#9fc6dd" strokeWidth="3" strokeLinecap="round">
        <path d="M130 46 h22 a5 5 0 1 0 -5 -5" />
        <path d="M130 56 h30 a5 5 0 1 1 -5 5" />
      </g>
      <text x="150" y="82" textAnchor="middle" fontSize="9" fontWeight="700" fill="#51688a">air</text>
      {/* shelter (home) */}
      <path d="M182 50 l14 -12 14 12 z" fill="#e2725b" stroke="#b4533f" strokeWidth="2" />
      <rect x="186" y="50" width="20" height="16" fill="#f3d2a0" stroke="#b4533f" strokeWidth="2" />
      <text x="196" y="82" textAnchor="middle" fontSize="9" fontWeight="700" fill="#51688a">shelter</text>
    </Frame>
  );
}

function SeasonCell({ x, label, children }: { x: number; label: string; children: React.ReactNode }) {
  return (
    <g>
      <rect x={x} y="20" width="44" height="54" rx="8" fill="#f6faff" stroke="#dce8f2" />
      {children}
      <text x={x + 22} y="92" textAnchor="middle" fontSize="9" fontWeight="700" fill="#51688a">{label}</text>
    </g>
  );
}

function Seasons() {
  return (
    <Frame label="The four seasons">
      <SeasonCell x={8} label="spring">
        <line x1="30" y1="62" x2="30" y2="46" stroke="#3fb24b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="42" r="6" fill="#ff8fb1" />
        <circle cx="30" cy="42" r="2" fill="#ffd23f" />
      </SeasonCell>
      <SeasonCell x={60} label="summer">
        <SunRays cx={82} cy={46} r={9} />
        <circle cx="82" cy="46" r="9" fill="#ffc223" />
      </SeasonCell>
      <SeasonCell x={112} label="fall">
        <path d="M134 38 q11 9 0 20 q-11 -11 0 -20 z" fill="#e08a2f" />
        <line x1="134" y1="48" x2="134" y2="60" stroke="#9c5a1e" strokeWidth="1.5" />
      </SeasonCell>
      <SeasonCell x={164} label="winter">
        <g stroke="#7fb8e0" strokeWidth="2.4" strokeLinecap="round">
          <line x1="186" y1="36" x2="186" y2="58" />
          <line x1="176" y1="47" x2="196" y2="47" />
          <line x1="179" y1="40" x2="193" y2="54" />
          <line x1="179" y1="54" x2="193" y2="40" />
        </g>
      </SeasonCell>
    </Frame>
  );
}

// A friendly, DELIBERATELY GENERIC four-legged critter — not any nameable
// species. The "animal babies" questions name many different animals (and list
// others as wrong choices), so the shared diagram must never depict a specific
// one: showing a chick next to "A baby goat is called a ___" both contradicts
// the prompt and illustrates a wrong answer.
function Critter({
  cx,
  cy,
  s,
  className = "",
}: {
  cx: number;
  cy: number;
  s: number;
  className?: string;
}) {
  return (
    <g className={className} transform={`translate(${cx} ${cy}) scale(${s})`}>
      {/* legs */}
      <rect x="-17" y="6" width="5" height="13" rx="2.5" fill="#c98a57" />
      <rect x="-6" y="8" width="5" height="13" rx="2.5" fill="#c98a57" />
      <rect x="5" y="8" width="5" height="13" rx="2.5" fill="#c98a57" />
      <rect x="15" y="6" width="5" height="13" rx="2.5" fill="#c98a57" />
      {/* tail */}
      <path d="M-25 -2 q-11 -1 -11 -13" fill="none" stroke="#c98a57" strokeWidth="3" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="0" cy="2" rx="25" ry="15" fill="#e0a96d" stroke="#c98a57" strokeWidth="2" />
      {/* head */}
      <circle cx="23" cy="-11" r="12" fill="#e8b878" stroke="#c98a57" strokeWidth="2" />
      {/* ears */}
      <path d="M15 -20 l-3 -10 8 5 z" fill="#e8b878" stroke="#c98a57" strokeWidth="1.5" />
      <path d="M29 -20 l3 -10 -8 5 z" fill="#e8b878" stroke="#c98a57" strokeWidth="1.5" />
      {/* eye + smile */}
      <circle cx="26" cy="-12" r="2" fill="#2d2a32" />
      <path d="M19 -5 q5 4 10 0" fill="none" stroke="#a06a3a" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function AnimalBabies() {
  return (
    <Frame label="Animals and their babies">
      {/* A parent and its baby of the SAME generic kind — the concept "every
          animal has a baby," with no specific (answerable) species shown. */}
      <Critter cx={64} cy={64} s={1} />
      <Critter cx={150} cy={80} s={0.56} className="animate-bob" />
      {/* heart between them */}
      <g className="sci-pulse">
        <path
          d="M130 52 C123 44 114 44 114 36 C114 30 121 29 125 33 C127 35 130 38 130 38 C130 38 133 35 135 33 C139 29 146 30 146 36 C146 44 137 44 130 52 Z"
          fill="#ff8fb1"
        />
      </g>
      <text x="110" y="108" textAnchor="middle" fontSize="10" fontWeight="700" fill="#51688a">every animal has a baby</text>
    </Frame>
  );
}

function HabitatCell({ x, label, children }: { x: number; label: string; children: React.ReactNode }) {
  return (
    <g>
      <rect x={x} y="20" width="44" height="54" rx="8" fill="#f6faff" stroke="#dce8f2" />
      {children}
      <text x={x + 22} y="92" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#51688a">{label}</text>
    </g>
  );
}

function Habitats() {
  return (
    <Frame label="Animal habitats">
      <HabitatCell x={8} label="ocean">
        <rect x="14" y="46" width="32" height="24" rx="3" fill="#2aa7e6" />
        <path d="M14 50 q8 -5 16 0 t16 0" fill="none" stroke="#bfe3f5" strokeWidth="2" />
      </HabitatCell>
      <HabitatCell x={60} label="desert">
        <SunRays cx={94} cy={34} r={5} />
        <circle cx="94" cy="34" r="5" fill="#ffc223" />
        <rect x="78" y="48" width="6" height="22" rx="3" fill="#3fb24b" />
        <rect x="73" y="54" width="5" height="3" rx="1.5" fill="#3fb24b" />
        <rect x="84" y="51" width="5" height="3" rx="1.5" fill="#3fb24b" />
      </HabitatCell>
      <HabitatCell x={112} label="forest">
        <polygon points="134,38 122,62 146,62" fill="#3f8e45" />
        <rect x="131" y="62" width="6" height="8" fill="#8a5a36" />
      </HabitatCell>
      <HabitatCell x={164} label="arctic">
        <rect x="170" y="58" width="32" height="12" rx="3" fill="#dff0ff" />
        <path d="M174 58 l8 -10 8 10 z" fill="#ffffff" />
        <path d="M188 58 l8 -8 8 8 z" fill="#eaf6ff" />
      </HabitatCell>
    </Frame>
  );
}

function LabMascot() {
  return (
    <Frame label="Science">
      <g className="animate-float">
        <text x="110" y="64" textAnchor="middle" fontSize="40">🔬</text>
      </g>
      <g className="sci-rise" style={{ animationDelay: "0.2s" }}>
        <circle cx="96" cy="50" r="3" fill="#7fc4ef" />
      </g>
      <g className="sci-rise" style={{ animationDelay: "0.9s" }}>
        <circle cx="124" cy="50" r="3" fill="#f06ea9" />
      </g>
      <text x="110" y="98" textAnchor="middle" fontSize="11" fontWeight="700" fill="#51688a">Let&apos;s explore! 🧪</text>
    </Frame>
  );
}
