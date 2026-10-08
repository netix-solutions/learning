import type { BakeryTreatId, TrainState } from './train';

export type BakeryStock = { id: BakeryTreatId; name: string; count: number };
export const TRAY_LIMIT = 4;

export function bakeryStock(state: TrainState): BakeryStock[] {
  return (state.bakeryCatalog ?? []).flatMap(item => {
    const count = (state.treats ?? []).filter(treat => treat.treatId === item.id).length;
    return count ? [{ id: item.id, name: item.name, count }] : [];
  });
}

/** Orders only use owned copies. Every new order starts with the whole shelf. */
export function bakeryOrders(stock: BakeryStock[], round = 0): BakeryTreatId[][] {
  const pool = stock.flatMap(item => Array.from({ length: Math.min(TRAY_LIMIT, item.count) }, () => item.id));
  if (!pool.length) return [];
  const offset = Math.max(0, Math.floor(round)) % pool.length;
  return [1, 2, 4].map((size, index) =>
    Array.from({ length: Math.min(size, pool.length) }, (_, step) => pool[(offset + index + step) % pool.length]),
  );
}

export function addToBakeryTray(tray: BakeryTreatId[], id: BakeryTreatId, stock: BakeryStock[]): BakeryTreatId[] {
  const available = stock.find(item => item.id === id)?.count ?? 0;
  if (tray.length >= TRAY_LIMIT || tray.filter(item => item === id).length >= available) return tray;
  return [...tray, id];
}

export function bakeryOrderMatches(order: BakeryTreatId[], tray: BakeryTreatId[]): boolean {
  if (!order.length || order.length !== tray.length) return false;
  const sortedTray = [...tray].sort();
  return [...order].sort().every((id, index) => id === sortedTray[index]);
}
