export const GARDEN_FLOWERS = [
  { id: 'daisy', name: 'Daisy' },
  { id: 'tulip', name: 'Tulip' },
  { id: 'sunflower', name: 'Sunflower' },
  { id: 'poppy', name: 'Poppy' },
  { id: 'iris', name: 'Iris' },
] as const;
export type GardenFlower = typeof GARDEN_FLOWERS[number];
export function flowersInPatch(total: number): number {
  const safe = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  return safe === 0 ? 0 : ((safe - 1) % 10) + 1;
}
export function kindsInPatch(total: number): readonly GardenFlower[] {
  return GARDEN_FLOWERS.slice(0, Math.min(flowersInPatch(total), GARDEN_FLOWERS.length));
}
