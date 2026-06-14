/**
 * Decorative, animated summer-beach backdrop for the landing page.
 *
 * Purely presentational and `aria-hidden` — a fixed, full-viewport layer of
 * gently drifting emoji (clouds, palms, sparkles) that sits behind the page
 * content. Pointer events are disabled so it never intercepts taps. All motion
 * is CSS-only and respects `prefers-reduced-motion`.
 */
type Deco = {
  emoji: string;
  className: string; // position + animation
  style?: React.CSSProperties;
  size: string;
};

const DECOR: Deco[] = [
  // Drifting clouds
  { emoji: "☁️", className: "left-[6%] top-[14%] animate-drift", style: { animationDuration: "11s" }, size: "text-5xl" },
  { emoji: "☁️", className: "right-[10%] top-[10%] animate-drift", style: { animationDuration: "14s", animationDelay: "1.5s" }, size: "text-6xl" },
  { emoji: "☁️", className: "left-[42%] top-[6%] animate-drift", style: { animationDuration: "16s", animationDelay: "0.6s" }, size: "text-4xl" },
  // Sparkles that twinkle
  { emoji: "✨", className: "left-[18%] top-[34%] animate-twinkle", size: "text-2xl" },
  { emoji: "⭐", className: "right-[16%] top-[40%] animate-twinkle", style: { animationDelay: "0.9s" }, size: "text-xl" },
  { emoji: "✨", className: "left-[30%] top-[64%] animate-twinkle", style: { animationDelay: "1.4s" }, size: "text-2xl" },
  { emoji: "⭐", className: "right-[26%] top-[70%] animate-twinkle", style: { animationDelay: "0.4s" }, size: "text-lg" },
  // Bobbing beach things
  { emoji: "🏖️", className: "right-[7%] bottom-[20%] animate-bob", style: { animationDelay: "0.5s" }, size: "text-4xl" },
  { emoji: "🐚", className: "left-[12%] bottom-[24%] animate-bob", style: { animationDelay: "1.1s" }, size: "text-3xl" },
  { emoji: "🪁", className: "right-[30%] top-[22%] animate-bob", style: { animationDuration: "5s" }, size: "text-3xl" },
  // Swaying palms anchored at the bottom corners
  { emoji: "🌴", className: "left-[2%] bottom-[2%] animate-sway", size: "text-6xl sm:text-7xl" },
  { emoji: "🌴", className: "right-[3%] bottom-[2%] animate-sway", style: { animationDelay: "0.8s" }, size: "text-5xl sm:text-7xl" },
];

export function BeachScene() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
    >
      {DECOR.map((d, i) => (
        <span
          key={i}
          className={`absolute opacity-70 drop-shadow-sm ${d.size} ${d.className}`}
          style={d.style}
        >
          {d.emoji}
        </span>
      ))}
    </div>
  );
}
