export const MATH_LABS = {
  "PK-count": { kind: "count", title: "Count every shell", instruction: "Tap each shell once. Say the number as you touch it. A check mark means you already counted that shell." },
  "K-add": { kind: "join", title: "Bring the groups together", instruction: "Start with two blue counters. Move the three orange counters into the group, one at a time. Count how many there are altogether." },
  "1-ten": { kind: "ten", title: "Fill a ten-frame", instruction: "Start with eight in the ten-frame and five outside. Move just enough counters to fill the ten-frame. What is left outside?" },
  "2-place": { kind: "regroup", title: "Build it, then trade", instruction: "Combine twenty-seven and fifteen. Each long rod is ten ones. When you have ten loose ones, trade them for one ten-rod. The total stays the same." },
  "3-groups": { kind: "array", title: "Build an array", instruction: "Build three equal rows with four dots in each row. Count by fours as you add each row." },
  "4-equivalent": { kind: "fraction", title: "Cut the pieces, keep the amount", instruction: "Both bars show the same-sized whole. Half is shaded. Split each part of the lower bar in half. Does the shaded amount change?" },
  "5-decimal": { kind: "decimal", title: "Give decimals a picture", instruction: "Start with one whole and twenty-five hundredths. Add four tenths, one tenth at a time. Each tenth fills ten small squares." },
} as const;
export type MathLabId = keyof typeof MATH_LABS;
export function mathLabFor(id: string) { return MATH_LABS[id as MathLabId]; }

// Integer arithmetic preserves the represented quantity during each move.
export function makeTenState(moves: number) {
  const count = Math.min(2, Math.max(0, Math.trunc(moves)));
  return { inside: 8 + count, outside: 5 - count, moved: count, total: 13 };
}
export function regroupState(traded: boolean) {
  return traded ? { tens: 4, ones: 2, total: 42 } : { tens: 3, ones: 12, total: 42 };
}
export function equivalentHalf(splits: number) {
  const cuts = Math.min(3, Math.max(0, Math.trunc(splits)));
  return { numerator: 2 ** cuts, denominator: 2 ** (cuts + 1) };
}
export function decimalState(tenthsAdded: number) {
  const tenths = Math.min(4, Math.max(0, Math.trunc(tenthsAdded)));
  return { hundredths: 25 + tenths * 10, totalHundredths: 125 + tenths * 10, added: tenths * 10, label: `1.${25 + tenths * 10}` };
}
