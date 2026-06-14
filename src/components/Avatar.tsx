import type { ReactNode } from "react";

/**
 * Detailed SVG avatars for kids to pick from.
 *
 * Each avatar is a self-contained 100x100 illustration (its own coloured
 * background circle + character). Stored on a profile as its string `id`
 * (e.g. "fox"). Legacy profiles that still hold an emoji render via the
 * `<Avatar>` fallback below, so nothing breaks for existing kids.
 */

type AvatarDef = {
  id: string;
  /** Friendly label, used for aria + the picker. */
  name: string;
  /** Inner SVG content, drawn in a 0 0 100 100 viewBox. */
  art: ReactNode;
};

// Shared little helpers keep the faces consistent + cut repetition.
function Eyes({ x1 = 38, x2 = 62, y = 52, r = 5 }: { x1?: number; x2?: number; y?: number; r?: number }) {
  return (
    <>
      <circle cx={x1} cy={y} r={r} fill="#2D2A32" />
      <circle cx={x2} cy={y} r={r} fill="#2D2A32" />
      <circle cx={x1 + 1.6} cy={y - 1.6} r={r * 0.32} fill="#fff" />
      <circle cx={x2 + 1.6} cy={y - 1.6} r={r * 0.32} fill="#fff" />
    </>
  );
}

function Blush({ y = 62, color = "#FF9E9E" }: { y?: number; color?: string }) {
  return (
    <>
      <circle cx={31} cy={y} r={4.5} fill={color} opacity={0.55} />
      <circle cx={69} cy={y} r={4.5} fill={color} opacity={0.55} />
    </>
  );
}

export const AVATAR_DEFS: AvatarDef[] = [
  {
    id: "fox",
    name: "Fox",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#FFEAD2" />
        <path d="M21 30 33 13 41 38Z" fill="#E8732C" />
        <path d="M79 30 67 13 59 38Z" fill="#E8732C" />
        <path d="M27 28 33 18 37 34Z" fill="#3E2B22" />
        <path d="M73 28 67 18 63 34Z" fill="#3E2B22" />
        <path d="M50 25c20 0 30 16 30 31 0 16-14 28-30 28S20 72 20 56c0-15 10-31 30-31Z" fill="#F4863C" />
        <path d="M50 49c12 0 22 8 22 17 0 10-10 18-22 18s-22-8-22-18c0-9 10-17 22-17Z" fill="#FFF7EF" />
        <Eyes />
        <path d="M50 71l-6-7h12z" fill="#3E2B22" />
        <ellipse cx="50" cy="63" rx="4.2" ry="3.2" fill="#3E2B22" />
        <Blush />
      </>
    ),
  },
  {
    id: "panda",
    name: "Panda",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#EAF3F5" />
        <circle cx="28" cy="28" r="13" fill="#2D2A32" />
        <circle cx="72" cy="28" r="13" fill="#2D2A32" />
        <circle cx="50" cy="54" r="32" fill="#FFFFFF" />
        <ellipse cx="36" cy="50" rx="9" ry="11" fill="#2D2A32" transform="rotate(-12 36 50)" />
        <ellipse cx="64" cy="50" rx="9" ry="11" fill="#2D2A32" transform="rotate(12 64 50)" />
        <circle cx="37" cy="51" r="4" fill="#fff" />
        <circle cx="63" cy="51" r="4" fill="#fff" />
        <circle cx="37" cy="51" r="2" fill="#2D2A32" />
        <circle cx="63" cy="51" r="2" fill="#2D2A32" />
        <ellipse cx="50" cy="64" rx="4.5" ry="3" fill="#2D2A32" />
        <path d="M50 67c0 4-4 5-7 4M50 67c0 4 4 5 7 4" fill="none" stroke="#2D2A32" strokeWidth="2" strokeLinecap="round" />
        <Blush y={62} />
      </>
    ),
  },
  {
    id: "monkey",
    name: "Monkey",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#F6ECDD" />
        <circle cx="22" cy="48" r="12" fill="#8A5A36" />
        <circle cx="78" cy="48" r="12" fill="#8A5A36" />
        <circle cx="22" cy="48" r="7" fill="#E7C9A4" />
        <circle cx="78" cy="48" r="7" fill="#E7C9A4" />
        <circle cx="50" cy="48" r="30" fill="#8A5A36" />
        <path d="M50 38c16 0 26 10 26 22 0 13-12 22-26 22s-26-9-26-22c0-12 10-22 26-22Z" fill="#E7C9A4" />
        <Eyes y={50} />
        <ellipse cx="44" cy="64" rx="3" ry="2" fill="#5C3B22" />
        <ellipse cx="56" cy="64" rx="3" ry="2" fill="#5C3B22" />
        <path d="M42 70c4 4 12 4 16 0" fill="none" stroke="#5C3B22" strokeWidth="2.4" strokeLinecap="round" />
        <Blush y={60} color="#F2A988" />
      </>
    ),
  },
  {
    id: "lion",
    name: "Lion",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#FBEAC8" />
        <g fill="#C9842B">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const cx = 50 + Math.cos(a) * 30;
            const cy = 50 + Math.sin(a) * 30;
            return <circle key={i} cx={cx} cy={cy} r="11" />;
          })}
        </g>
        <circle cx="50" cy="50" r="27" fill="#F2B84B" />
        <Eyes y={48} />
        <path d="M50 66l-6-7h12z" fill="#7A4A1E" />
        <ellipse cx="50" cy="59" rx="4" ry="3" fill="#7A4A1E" />
        <path d="M50 66v5M50 71c0 3-3 4-6 3M50 71c0 3 3 4 6 3" fill="none" stroke="#7A4A1E" strokeWidth="2" strokeLinecap="round" />
        <Blush y={58} />
      </>
    ),
  },
  {
    id: "tiger",
    name: "Tiger",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#FFE9CC" />
        <circle cx="27" cy="27" r="11" fill="#F2933B" />
        <circle cx="73" cy="27" r="11" fill="#F2933B" />
        <circle cx="27" cy="27" r="5" fill="#FBC9A0" />
        <circle cx="73" cy="27" r="5" fill="#FBC9A0" />
        <circle cx="50" cy="52" r="31" fill="#F7A23E" />
        <path d="M50 50c11 0 20 7 20 16 0 10-9 18-20 18s-20-8-20-18c0-9 9-16 20-16Z" fill="#FFF3E4" />
        <g stroke="#3E2B22" strokeWidth="3" strokeLinecap="round">
          <path d="M50 22v9" />
          <path d="M40 24l3 8M60 24l-3 8" />
          <path d="M24 44l8 3M76 44l-8 3" />
          <path d="M25 56l8 1M75 56l-8 1" />
        </g>
        <Eyes y={52} />
        <path d="M50 68l-5-6h10z" fill="#C25B3A" />
        <ellipse cx="50" cy="62" rx="3.6" ry="2.6" fill="#C25B3A" />
        <Blush y={64} />
      </>
    ),
  },
  {
    id: "frog",
    name: "Frog",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#E6F6D8" />
        <circle cx="30" cy="30" r="15" fill="#7CC44C" />
        <circle cx="70" cy="30" r="15" fill="#7CC44C" />
        <circle cx="30" cy="29" r="8" fill="#fff" />
        <circle cx="70" cy="29" r="8" fill="#fff" />
        <circle cx="31" cy="30" r="4" fill="#2D2A32" />
        <circle cx="69" cy="30" r="4" fill="#2D2A32" />
        <circle cx="29.5" cy="28" r="1.4" fill="#fff" />
        <circle cx="67.5" cy="28" r="1.4" fill="#fff" />
        <path d="M50 38c19 0 31 11 31 25 0 12-14 19-31 19S19 75 19 63c0-14 12-25 31-25Z" fill="#7CC44C" />
        <path d="M30 64c6 8 34 8 40 0" fill="none" stroke="#3F7A26" strokeWidth="3" strokeLinecap="round" />
        <circle cx="42" cy="66" r="1.8" fill="#3F7A26" />
        <circle cx="58" cy="66" r="1.8" fill="#3F7A26" />
        <Blush y={62} color="#F2A0B0" />
      </>
    ),
  },
  {
    id: "octopus",
    name: "Octopus",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#FCE0F0" />
        <g fill="#C45BB0">
          {[26, 38, 50, 62, 74].map((x, i) => (
            <path key={i} d={`M${x} 64c-3 8-3 16 0 22 ${i % 2 ? "" : ""}`} stroke="#C45BB0" strokeWidth="9" strokeLinecap="round" fill="none" />
          ))}
        </g>
        <path d="M50 22c17 0 27 13 27 28 0 9-4 16-10 20H33c-6-4-10-11-10-20 0-15 10-28 27-28Z" fill="#D870C2" />
        <Eyes y={48} r={5.5} />
        <path d="M43 62c4 3 10 3 14 0" fill="none" stroke="#8E3C7E" strokeWidth="2.4" strokeLinecap="round" />
        <Blush y={56} color="#F58FD0" />
      </>
    ),
  },
  {
    id: "unicorn",
    name: "Unicorn",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#F3ECFF" />
        <path d="M50 12l5 20h-10z" fill="#FFC857" />
        <path d="M50 14l3.5 16h-7z" fill="#FFE2A1" />
        <path d="M34 24c-4-6-12-7-12-7s2 8 8 11Z" fill="#C9A7F0" />
        <path d="M66 24c4-6 12-7 12-7s-2 8-8 11Z" fill="#C9A7F0" />
        <path d="M50 28c18 0 28 13 28 29 0 16-12 27-28 27S22 73 22 57c0-16 10-29 28-29Z" fill="#FFFFFF" />
        <path d="M40 30c10-6 22-4 28 4-8-2-16-2-28-4Z" fill="#FF8FB1" />
        <path d="M44 29c8-3 16-2 22 3" fill="none" stroke="#8ED1E0" strokeWidth="3" strokeLinecap="round" />
        <Eyes y={56} />
        <ellipse cx="50" cy="68" rx="4" ry="2.6" fill="#E5A0C0" />
        <Blush y={66} color="#FFAFCF" />
      </>
    ),
  },
  {
    id: "dog",
    name: "Puppy",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#F3ECE2" />
        <path d="M22 34c-6 6-6 24 2 34l16-12c-8-6-12-18-18-22Z" fill="#8A5A36" />
        <path d="M78 34c6 6 6 24-2 34L60 56c8-6 12-18 18-22Z" fill="#8A5A36" />
        <circle cx="50" cy="50" r="29" fill="#D9A86E" />
        <path d="M50 52c11 0 19 7 19 16 0 9-8 16-19 16s-19-7-19-16c0-9 8-16 19-16Z" fill="#F3E3CC" />
        <Eyes y={48} />
        <ellipse cx="50" cy="62" rx="5" ry="3.6" fill="#3E2B22" />
        <path d="M50 66v5M50 71c0 3-3 4-6 3M50 71c0 3 3 4 6 3" fill="none" stroke="#3E2B22" strokeWidth="2" strokeLinecap="round" />
        <Blush y={60} />
      </>
    ),
  },
  {
    id: "cat",
    name: "Kitty",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#EFEAF6" />
        <path d="M24 24 38 40 22 46Z" fill="#9B8FB0" />
        <path d="M76 24 62 40 78 46Z" fill="#9B8FB0" />
        <path d="M28 28 36 38 27 41Z" fill="#F5C0CE" />
        <path d="M72 28 64 38 73 41Z" fill="#F5C0CE" />
        <circle cx="50" cy="52" r="29" fill="#A99BC0" />
        <Eyes y={50} />
        <path d="M50 62l-3 3 3 3 3-3z" fill="#5C4B72" />
        <path d="M47 66c0 4-3 5-6 4M53 66c0 4 3 5 6 4" fill="none" stroke="#5C4B72" strokeWidth="2" strokeLinecap="round" />
        <g stroke="#5C4B72" strokeWidth="1.6" strokeLinecap="round">
          <path d="M30 56h-9M30 60l-8 3M70 56h9M70 60l8 3" />
        </g>
        <Blush y={60} color="#F5A8C0" />
      </>
    ),
  },
  {
    id: "turtle",
    name: "Turtle",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#DFF3EC" />
        <ellipse cx="50" cy="58" rx="33" ry="28" fill="#5FB58C" />
        <path d="M50 34c14 0 24 10 24 22 0 4-1 8-3 11H29c-2-3-3-7-3-11 0-12 10-22 24-22Z" fill="#3E8E66" />
        <g stroke="#2E6B4D" strokeWidth="2.2" fill="none">
          <path d="M50 38v14M38 46l8 6M62 46l-8 6M50 58l-9 7M50 58l9 7" />
        </g>
        <circle cx="50" cy="30" r="14" fill="#7BC9A0" />
        <Eyes x1={44} x2={56} y={28} r={3.6} />
        <path d="M45 35c3 2 7 2 10 0" fill="none" stroke="#2E6B4D" strokeWidth="2" strokeLinecap="round" />
        <Blush y={32} color="#F2A0B0" />
      </>
    ),
  },
  {
    id: "penguin",
    name: "Penguin",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#D9EEF7" />
        <ellipse cx="50" cy="52" rx="29" ry="32" fill="#34384A" />
        <path d="M50 30c13 0 21 11 21 26 0 13-9 22-21 22s-21-9-21-22c0-15 8-26 21-26Z" fill="#fff" />
        <circle cx="42" cy="42" r="6" fill="#fff" />
        <circle cx="58" cy="42" r="6" fill="#fff" />
        <circle cx="42" cy="43" r="3" fill="#2D2A32" />
        <circle cx="58" cy="43" r="3" fill="#2D2A32" />
        <path d="M50 48l-7 6h14z" fill="#F5A623" />
        <path d="M43 54l7 5 7-5z" fill="#E0901A" />
        <ellipse cx="30" cy="74" rx="8" ry="5" fill="#F5A623" />
        <ellipse cx="70" cy="74" rx="8" ry="5" fill="#F5A623" />
        <Blush y={50} color="#FF9E9E" />
      </>
    ),
  },
  {
    id: "owl",
    name: "Owl",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#EFE6D8" />
        <path d="M26 26l8 14-14 2z" fill="#9E6B3E" />
        <path d="M74 26l-8 14 14 2z" fill="#9E6B3E" />
        <path d="M50 24c18 0 30 14 30 31S68 86 50 86 20 72 20 55s12-31 30-31Z" fill="#B5803F" />
        <path d="M50 44c10 0 18 6 18 14 0 12-9 22-18 22s-18-10-18-22c0-8 8-14 18-14Z" fill="#E8CFA6" />
        <circle cx="38" cy="46" r="12" fill="#fff" />
        <circle cx="62" cy="46" r="12" fill="#fff" />
        <circle cx="38" cy="46" r="6" fill="#2D2A32" />
        <circle cx="62" cy="46" r="6" fill="#2D2A32" />
        <circle cx="40" cy="44" r="2" fill="#fff" />
        <circle cx="64" cy="44" r="2" fill="#fff" />
        <path d="M50 54l-5 6h10z" fill="#F5A623" />
        <Blush y={62} color="#F2A988" />
      </>
    ),
  },
  {
    id: "bee",
    name: "Bee",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#FFF6CC" />
        <ellipse cx="28" cy="40" rx="13" ry="9" fill="#fff" opacity="0.85" transform="rotate(-25 28 40)" />
        <ellipse cx="72" cy="40" rx="13" ry="9" fill="#fff" opacity="0.85" transform="rotate(25 72 40)" />
        <circle cx="50" cy="54" r="28" fill="#FFD23F" />
        <g fill="#3E2B22">
          <path d="M34 38c10-5 22-5 32 0l-2 8c-9-4-19-4-28 0z" />
          <path d="M28 56c14-6 30-6 44 0l-2 9c-13-5-27-5-40 0z" />
        </g>
        <path d="M40 24l-3-8M60 24l3-8" stroke="#3E2B22" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="36" cy="15" r="3" fill="#3E2B22" />
        <circle cx="64" cy="15" r="3" fill="#3E2B22" />
        <Eyes x1={42} x2={58} y={48} r={4.5} />
        <path d="M44 60c4 3 8 3 12 0" fill="none" stroke="#3E2B22" strokeWidth="2.2" strokeLinecap="round" />
        <Blush y={58} color="#FF9E9E" />
      </>
    ),
  },
  {
    id: "dino",
    name: "Dino",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#E2F4E0" />
        <path d="M50 24c19 0 31 14 31 31 0 17-13 29-31 29S19 72 19 55c0-17 12-31 31-31Z" fill="#62B85C" />
        <g fill="#3E8E45">
          <path d="M40 23l-3-8 7 5zM50 21l-2-9 5 7zM60 23l3-8-7 5z" />
        </g>
        <path d="M40 58c10 0 30 0 30 0 0 9-7 16-15 16s-15-7-15-16Z" fill="#E8F6D8" />
        <circle cx="38" cy="46" r="9" fill="#fff" />
        <circle cx="62" cy="46" r="9" fill="#fff" />
        <circle cx="39" cy="47" r="4" fill="#2D2A32" />
        <circle cx="61" cy="47" r="4" fill="#2D2A32" />
        <g stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M43 60h4M51 60h4M59 60h4" />
        </g>
        <Blush y={56} color="#F2A0B0" />
      </>
    ),
  },
  {
    id: "whale",
    name: "Whale",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#D8EEFA" />
        <path d="M50 30c7-6 12-12 12-12s2 8-2 14c14 3 24 14 24 26 0 14-15 22-34 22S16 72 16 58c0-15 15-28 34-28Z" fill="#4FA3D9" />
        <path d="M40 64c8 6 24 6 32 0v3c0 7-7 12-16 12s-16-5-16-12z" fill="#BFE3F5" />
        <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M50 20c0-4 3-7 3-7M55 20c2-3 6-5 6-5" />
        </g>
        <circle cx="40" cy="50" r="4.5" fill="#2D2A32" />
        <circle cx="62" cy="50" r="4.5" fill="#2D2A32" />
        <circle cx="41.4" cy="48.6" r="1.5" fill="#fff" />
        <circle cx="63.4" cy="48.6" r="1.5" fill="#fff" />
        <Blush y={58} color="#FF9E9E" />
      </>
    ),
  },
  {
    id: "koala",
    name: "Koala",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#EEEAEF" />
        <circle cx="24" cy="40" r="15" fill="#9AA2AD" />
        <circle cx="76" cy="40" r="15" fill="#9AA2AD" />
        <circle cx="24" cy="40" r="8" fill="#CBA6B8" />
        <circle cx="76" cy="40" r="8" fill="#CBA6B8" />
        <circle cx="50" cy="52" r="28" fill="#A7AEB8" />
        <Eyes y={50} />
        <path d="M50 58c-5 0-9 4-9 9 0 5 4 9 9 9s9-4 9-9c0-5-4-9-9-9Z" fill="#4A4750" />
        <ellipse cx="50" cy="62" rx="2.4" ry="3" fill="#2D2A32" />
        <Blush y={58} color="#F5A8C0" />
      </>
    ),
  },
  {
    id: "bunny",
    name: "Bunny",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#FCEEF2" />
        <ellipse cx="38" cy="24" rx="8" ry="20" fill="#fff" />
        <ellipse cx="62" cy="24" rx="8" ry="20" fill="#fff" />
        <ellipse cx="38" cy="26" rx="4" ry="14" fill="#F7C5D4" />
        <ellipse cx="62" cy="26" rx="4" ry="14" fill="#F7C5D4" />
        <circle cx="50" cy="56" r="28" fill="#fff" />
        <Eyes y={54} />
        <path d="M50 64l-3 3 3 2 3-2z" fill="#E58AA0" />
        <path d="M47 67c0 4-3 5-6 4M53 67c0 4 3 5 6 4" fill="none" stroke="#C77A90" strokeWidth="2" strokeLinecap="round" />
        <Blush y={62} color="#F7AFC5" />
      </>
    ),
  },
  {
    id: "bear",
    name: "Bear",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#F1E6D8" />
        <circle cx="28" cy="30" r="12" fill="#A06A3E" />
        <circle cx="72" cy="30" r="12" fill="#A06A3E" />
        <circle cx="28" cy="30" r="6" fill="#D8B083" />
        <circle cx="72" cy="30" r="6" fill="#D8B083" />
        <circle cx="50" cy="52" r="30" fill="#B57C46" />
        <ellipse cx="50" cy="62" rx="15" ry="13" fill="#E8D2B0" />
        <Eyes y={48} />
        <ellipse cx="50" cy="58" rx="4.5" ry="3.2" fill="#3E2B22" />
        <path d="M50 61v5M50 66c0 3-3 4-6 3M50 66c0 3 3 4 6 3" fill="none" stroke="#3E2B22" strokeWidth="2" strokeLinecap="round" />
        <Blush y={56} color="#F2A988" />
      </>
    ),
  },
  {
    id: "pig",
    name: "Piggy",
    art: (
      <>
        <circle cx="50" cy="50" r="50" fill="#FCE7EE" />
        <path d="M30 26 26 42 42 38Z" fill="#F39BB8" />
        <path d="M70 26 74 42 58 38Z" fill="#F39BB8" />
        <circle cx="50" cy="52" r="30" fill="#F7A9C4" />
        <Eyes y={46} r={4.5} />
        <ellipse cx="50" cy="62" rx="13" ry="9" fill="#EE85AC" />
        <ellipse cx="45" cy="62" rx="2.6" ry="3.6" fill="#C85F86" />
        <ellipse cx="55" cy="62" rx="2.6" ry="3.6" fill="#C85F86" />
        <Blush y={56} color="#F26F9C" />
      </>
    ),
  },
];

const DEF_BY_ID: Record<string, AvatarDef> = Object.fromEntries(
  AVATAR_DEFS.map((d) => [d.id, d]),
);

/** Ordered list of valid avatar ids (single source of truth for the picker). */
export const AVATAR_IDS = AVATAR_DEFS.map((d) => d.id);

export const DEFAULT_AVATAR = "fox";

/**
 * Render a kid's avatar. `id` is an avatar id (e.g. "fox"); unknown values —
 * including legacy emoji stored on older profiles — fall back to rendering the
 * raw string centred in the same square so nothing looks broken.
 */
export function Avatar({
  id,
  className = "h-full w-full",
}: {
  id: string;
  className?: string;
}) {
  const def = DEF_BY_ID[id];
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={def?.name ?? "Avatar"}
    >
      {def ? (
        def.art
      ) : (
        <text x="50" y="50" fontSize="58" textAnchor="middle" dominantBaseline="central">
          {id}
        </text>
      )}
    </svg>
  );
}
