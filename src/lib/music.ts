import { isStudentRoute, studentTab } from '@/lib/student-routes';
import type { RewardTheme } from '@/lib/train';
export const MUSIC = [
  { file: 'life-of-riley', title: 'Life of Riley', isrc: 'USUAN1400054' },
  { file: 'carefree', title: 'Carefree', isrc: 'USUAN1400037' },
  { file: 'bassa-island', title: 'Bassa Island Game Loop', isrc: 'USUAN1100840' },
  { file: 'monkeys', title: 'Monkeys Spinning Monkeys', isrc: 'USUAN1400011' },
  { file: 'friendly-day', title: 'Friendly Day', isrc: 'USUAN1100223' },
  { file: 'fluffing-a-duck', title: 'Fluffing a Duck', isrc: 'USUAN1100768' },
] as const;
export function musicFor(path: string | null, theme: RewardTheme): string[] {
  if (!path || !isStudentRoute(path)) return [];
  const tab = studentTab(path);
  if (tab === 'practice' || tab === 'learn') return ['bassa-island'];
  if (tab === 'home') return ['life-of-riley', 'carefree'];
  return { garden: ['bassa-island'], train: ['friendly-day'], dinosaurs: ['monkeys'], bakery: ['carefree', 'fluffing-a-duck'] }[theme];
}
