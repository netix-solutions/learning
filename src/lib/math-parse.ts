/**
 * Parse a bare-arithmetic prompt ("51 - 13 = ?", "2 + 7 + 2 = ?", "6 × 4 = ?")
 * into its parts so the UI can present it school-style (stacked) and animate
 * the algorithm. Returns null for anything that isn't pure arithmetic —
 * word problems, comparisons, etc. keep their normal text rendering.
 */
export type ParsedArithmetic = {
  op: "+" | "-" | "×" | "÷";
  operands: number[];
  answer: number;
};

export function parseArithmetic(prompt: string): ParsedArithmetic | null {
  const m = prompt.match(
    /^\s*(?:What is\s+)?(\d+)((?:\s*[-+×x*÷/]\s*\d+)+)\s*=?\s*\?*\s*$/i,
  );
  if (!m) return null;

  const rest = m[2].match(/([-+×x*÷/])\s*(\d+)/g);
  if (!rest) return null;

  const operands = [Number(m[1])];
  let op: ParsedArithmetic["op"] | null = null;
  for (const part of rest) {
    const pm = part.match(/([-+×x*÷/])\s*(\d+)/)!;
    const thisOp = ({ "+": "+", "-": "-", "×": "×", x: "×", "*": "×", "÷": "÷", "/": "÷" } as const)[
      pm[1] as "+" | "-" | "×" | "x" | "*" | "÷" | "/"
    ];
    if (!thisOp) return null;
    // Only same-operator chains (2 + 7 + 2). Mixed expressions stay as text.
    if (op && thisOp !== op) return null;
    op = thisOp;
    operands.push(Number(pm[2]));
  }
  if (!op) return null;
  if (op !== "+" && operands.length !== 2) return null;
  if (operands.some((n) => !Number.isFinite(n) || n > 9999)) return null;

  let answer = operands[0];
  for (const n of operands.slice(1)) {
    if (op === "+") answer += n;
    else if (op === "-") answer -= n;
    else if (op === "×") answer *= n;
    else {
      if (n === 0 || answer % n !== 0) return null; // only exact division
      answer /= n;
    }
  }
  if (op === "-" && answer < 0) return null;

  return { op, operands, answer };
}

/** Digits of n, padded to `width`, most significant first ("" for pad). */
export function paddedDigits(n: number, width: number): string[] {
  const s = String(n);
  return [...(" ".repeat(width - s.length) + s)].map((c) => (c === " " ? "" : c));
}
