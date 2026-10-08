import type { TrainState } from './train';
export type RewardDiscovery = {
  purchaseId: string; name: string; image: string; firstOfKind: boolean;
  unique: number; total: number; balance: number;
  theme: 'train' | 'dinosaurs' | 'bakery'; collectionLabel: string; destination: string;
};

/** Derive a reveal only from newly confirmed ownership, never from spending alone. */
export function rewardDiscovery(before: TrainState, after: TrainState): RewardDiscovery | null {
  const groups = [
    { theme: 'train' as const, label: 'car designs', destination: 'See my train', folder: 'train',
      previous: before.cars.map(x=>({id:x.id,kind:x.carId})), current: after.cars.map(x=>({id:x.id,kind:x.carId})), catalog: after.catalog },
    { theme: 'train' as const, label: 'special engines', destination: 'See my train', folder: 'train',
      previous: (before.enginePurchases??[]).map(x=>({id:x.id,kind:x.engineId})), current: (after.enginePurchases??[]).map(x=>({id:x.id,kind:x.engineId})), catalog: (after.engineCatalog??[]).filter(x=>x.id!=='engine') },
    { theme: 'dinosaurs' as const, label: 'dinosaur kinds', destination: 'See my dinosaurs', folder: 'dinosaurs',
      previous: (before.dinosaurs??[]).map(x=>({id:x.id,kind:x.dinosaurId})), current: (after.dinosaurs??[]).map(x=>({id:x.id,kind:x.dinosaurId})), catalog: after.dinosaurCatalog??[] },
    { theme: 'bakery' as const, label: 'treat kinds', destination: 'See my bakery', folder: 'bakery',
      previous: (before.treats??[]).map(x=>({id:x.id,kind:x.treatId})), current: (after.treats??[]).map(x=>({id:x.id,kind:x.treatId})), catalog: after.bakeryCatalog??[] },
  ];
  for (const group of groups) {
    if (after.theme !== group.theme) continue;
    const ids = new Set(group.previous.map(x=>x.id));
    const added = group.current.find(x=>!ids.has(x.id));
    const item = added && group.catalog.find(x=>x.id===added.kind);
    if (!added || !item) continue;
    const catalogIds = new Set<string>(group.catalog.map(x=>x.id));
    return { purchaseId: added.id, name: item.name, image: `/images/${group.folder}/${item.id}.webp`,
      firstOfKind: !group.previous.some(x=>x.kind===added.kind),
      unique: new Set(group.current.filter(x=>catalogIds.has(x.kind)).map(x=>x.kind)).size,
      total: catalogIds.size, balance: after.balance, theme: group.theme,
      collectionLabel: group.label, destination: group.destination };
  }
  return null;
}
