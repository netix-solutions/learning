import type { Grade } from './types';
export type GradeExperience = {
  name: string; invitation: string; roundSize: number; autoRead: boolean;
  earlyReader: boolean; accent: string; pale: string; sky: string; ground: string;
  setting: 'meadow' | 'woodland' | 'coast' | 'rainforest' | 'desert' | 'night';
  gardenName: string; quizHint: string;
};
export const GRADE_EXPERIENCES: Record<Grade, GradeExperience> = {
  PK: { name: 'Little explorers', invitation: 'Listen, tap, and try.', roundSize: 4, autoRead: true, earlyReader: true, accent: '#27654c', pale: '#eef8df', sky: '#e1f1e6', ground: '#acd09a', setting: 'meadow', gardenName: 'My sunny garden', quizHint: 'One little question at a time.' },
  K: { name: 'Wonder meadow', invitation: 'What will you find today?', roundSize: 5, autoRead: true, earlyReader: true, accent: '#25604a', pale: '#f2f8df', sky: '#e3f2df', ground: '#a5cf92', setting: 'meadow', gardenName: 'My meadow garden', quizHint: 'Listen. Pick. Try!' },
  '1': { name: 'Woodland trail', invitation: 'Follow your curiosity.', roundSize: 6, autoRead: true, earlyReader: true, accent: '#79502d', pale: '#faf1e4', sky: '#f2eddb', ground: '#b7cc91', setting: 'woodland', gardenName: 'My woodland garden', quizHint: 'A new question around every bend.' },
  '2': { name: 'Coast explorers', invitation: 'Ready for a new discovery?', roundSize: 7, autoRead: true, earlyReader: false, accent: '#176778', pale: '#e5f5f8', sky: '#dcf3f5', ground: '#d9cd9b', setting: 'coast', gardenName: 'My coastal garden', quizHint: 'Explore a mix of skills.' },
  '3': { name: 'Rainforest expedition', invitation: 'Explore. Connect. Discover.', roundSize: 8, autoRead: false, earlyReader: false, accent: '#276345', pale: '#e7f2ec', sky: '#dcebe5', ground: '#81ac89', setting: 'rainforest', gardenName: 'My rainforest garden', quizHint: 'Put your ideas to the test.' },
  '4': { name: 'Canyon discoveries', invitation: 'Look closer. Think it through.', roundSize: 10, autoRead: false, earlyReader: false, accent: '#8c4933', pale: '#fcf0e6', sky: '#f5e3d0', ground: '#dcb99b', setting: 'desert', gardenName: 'My desert garden', quizHint: 'Use what you know. Find a strategy.' },
  '5': { name: 'Night-sky explorers', invitation: 'Investigate your next question.', roundSize: 12, autoRead: false, earlyReader: false, accent: '#45437e', pale: '#eeeeF9', sky: '#333d68', ground: '#8f9bab', setting: 'night', gardenName: 'My moonlight garden', quizHint: 'Reason carefully. Make connections.' },
};
export function experienceFor(grade: Grade | null | undefined) { return GRADE_EXPERIENCES[grade ?? 'K']; }
// Keep all three core subjects in a mixed round, including the shortest rounds.
export function mixedRoundCounts(size: number) {
  return [0, 1, 2].map(index => Math.floor(size / 3) + (index < size % 3 ? 1 : 0));
}
