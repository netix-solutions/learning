// Shared types + constants for parent-set learning-time goals.

export type GoalProgress = {
  minutes_per_day: number;
  days_per_week: number;
  today_minutes: number;
  today_met: boolean;
  week_goal_days: number;
  week_met: boolean;
  week_start: string;
  et_today: string;
  dow: number; // 0=Sun .. 6=Sat
};

export const DEFAULT_DAYS_PER_WEEK = 5;
export const DEFAULT_MINUTES_PER_DAY = 15;

// Friendly options offered in the parent goal picker.
export const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
export const MINUTES_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export function clampDays(n: number): number {
  return Math.max(1, Math.min(7, Math.round(n)));
}
export function clampMinutes(n: number): number {
  return Math.max(1, Math.min(240, Math.round(n)));
}
