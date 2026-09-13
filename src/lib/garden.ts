export type GardenProgress = { flowers: number; questionsTowardFlower: number; lessons: number; attempts: number };
// Rewards recognize participation, not mastery. Only saved server records count.
export function gardenProgress(attempts: number, lessons: number): GardenProgress {
  const safeAttempts = Math.max(0, Math.floor(attempts));
  const safeLessons = Math.max(0, Math.floor(lessons));
  return { flowers: Math.floor(safeAttempts / 5) + safeLessons, questionsTowardFlower: safeAttempts % 5, lessons: safeLessons, attempts: safeAttempts };
}
