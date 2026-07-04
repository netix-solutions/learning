import { paddedDigits, type ParsedArithmetic } from "@/lib/math-parse";

/**
 * A math problem laid out the way kids see it at school: numbers stacked with
 * the operator bottom-left and a rule line, digits in neat place-value columns.
 * Division stays horizontal (long-division notation comes later in school),
 * just big and friendly.
 */
export function StackedProblem({ parsed }: { parsed: ParsedArithmetic }) {
  if (parsed.op === "÷") {
    return (
      <div className="my-2 flex items-baseline justify-center gap-3 font-display text-5xl font-extrabold tabular-nums text-slate-800">
        {parsed.operands[0]}
        <span className="text-[var(--brand-blue)]">÷</span>
        {parsed.operands[1]}
        <span className="text-slate-300">=</span>
        <span className="text-slate-300">?</span>
      </div>
    );
  }

  const width = Math.max(...parsed.operands.map((n) => String(n).length));
  return (
    <div className="my-2 flex justify-center">
      <div className="inline-block">
        {parsed.operands.map((n, row) => {
          const last = row === parsed.operands.length - 1;
          return (
            <div key={row} className="flex items-center justify-end gap-1">
              <span className="w-8 text-right font-display text-4xl font-extrabold text-[var(--brand-blue)] sm:text-5xl">
                {last ? parsed.op : ""}
              </span>
              {paddedDigits(n, width).map((d, i) => (
                <span
                  key={i}
                  className="w-8 text-center font-display text-4xl font-extrabold tabular-nums text-slate-800 sm:w-10 sm:text-5xl"
                >
                  {d}
                </span>
              ))}
            </div>
          );
        })}
        <div
          className="mt-1 h-1.5 rounded-full bg-slate-700"
          style={{ marginLeft: "2rem" }}
        />
        <div className="flex justify-end gap-1 pt-1">
          <span className="w-8" />
          {Array.from({ length: width }).map((_, i) => (
            <span
              key={i}
              className="w-8 text-center font-display text-4xl font-extrabold text-slate-300 sm:w-10 sm:text-5xl"
            >
              {i === width - 1 ? "?" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
