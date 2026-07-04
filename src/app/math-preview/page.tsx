import type { Metadata } from "next";
import { parseArithmetic } from "@/lib/math-parse";
import { StackedProblem } from "@/components/StackedProblem";
import { AnimatedMath } from "@/components/AnimatedMath";

// No-login preview of the math presentation + animated help, so the layouts
// can be eyeballed without a kid session (same pattern as /home-preview).
export const metadata: Metadata = {
  title: "Math preview",
  robots: { index: false, follow: false },
};

const STACKED = ["51 - 13 = ?", "63 + 18 = ?", "2 + 7 + 2 = ?", "304 - 178 = ?", "6 × 4 = ?", "24 ÷ 6 = ?"];
const ANIMATED = ["51 - 13 = ?", "63 + 18 = ?", "304 - 178 = ?", "3 + 4 = ?", "9 - 3 = ?", "6 × 4 = ?", "24 ÷ 6 = ?"];

export default function MathPreview() {
  return (
    <main className="relative z-10 mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-800">
        Question presentation (stacked)
      </h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {STACKED.map((p) => {
          const parsed = parseArithmetic(p);
          return (
            <div key={p} className="card-fun p-4">
              <p className="text-xs font-bold text-slate-400">{p}</p>
              {parsed ? <StackedProblem parsed={parsed} /> : <p>unparsed!</p>}
            </div>
          );
        })}
      </div>

      <h1 className="mt-10 font-display text-2xl font-bold text-slate-800">
        Animated help (Teach me)
      </h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {ANIMATED.map((p) => {
          const parsed = parseArithmetic(p);
          return (
            <div key={p} className="card-fun p-4">
              <p className="mb-2 text-xs font-bold text-slate-400">{p}</p>
              {parsed ? <AnimatedMath parsed={parsed} /> : <p>unparsed!</p>}
            </div>
          );
        })}
      </div>
    </main>
  );
}
