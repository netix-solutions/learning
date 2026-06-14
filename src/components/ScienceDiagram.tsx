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
  if (k.includes("senses")) return <Emojis label="The five senses" items={["👁️", "👂", "👃", "👅", "✋"]} />;
  if (k.includes("weather")) return <Weather />;
  if (k.includes("force") || k.includes("pushpull")) return <Forces />;
  if (k.includes("energy")) return <EnergyRays />;
  if (k.includes("body")) return <Body />;
  if (k.includes("season")) return <Emojis label="The four seasons" items={["🌸", "☀️", "🍂", "❄️"]} />;
  if (k.includes("animalbabies")) return <Emojis label="Animal babies" items={["🥚", "🐣", "🐤", "🐔"]} />;
  if (k.includes("habitat")) return <Emojis label="Habitats" items={["🌊", "🏜️", "🌳", "❄️"]} />;
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

function Emojis({ label, items }: { label: string; items: string[] }) {
  const step = 200 / items.length;
  return (
    <Frame label={label}>
      {items.map((s, i) => (
        <text
          key={i}
          x={20 + i * step}
          y="66"
          textAnchor="middle"
          fontSize="30"
          className="sci-pulse"
          style={{ animationDelay: `${i * 0.18}s` }}
        >
          {s}
        </text>
      ))}
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
