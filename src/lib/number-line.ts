export type NumberLineProblem = { start: number; target: number; min: number; max: number };
export type NumberLineAnswer = [direction: 1 | -1, amount: number];

export function isNumberLineProblem(value: unknown): value is NumberLineProblem {
  if (!value || typeof value !== 'object') return false;
  const p = value as NumberLineProblem;
  return [p.start, p.target, p.min, p.max].every(Number.isInteger) && p.min === 0 &&
    [20, 100].includes(p.max) && p.start >= p.min && p.start <= p.max &&
    p.target >= p.min && p.target <= p.max && p.start !== p.target && Math.abs(p.target - p.start) <= 99;
}

/** Each ten is its own jump; the remaining ones make one smaller jump. */
export function numberLineJumps(start: number, [direction, amount]: NumberLineAnswer): number[] {
  if (!Number.isInteger(start) || ![1, -1].includes(direction) || !Number.isInteger(amount) || amount < 1 || amount > 99) return [];
  const stops: number[] = [];
  let position = start;
  for (let left = amount; left > 0;) {
    const jump = Math.min(10, left);
    position += direction * jump;
    stops.push(position);
    left -= jump;
  }
  return stops;
}
