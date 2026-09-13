export type ScienceObservation = {
  title: string; context: string; format: 'objects' | 'weather' | 'bars' | 'table';
  columns: string[]; rows: { label: string; values: string[]; symbol?: 'red-ball' | 'blue-ball' | 'sun' | 'rain'; amount?: number }[];
  scaleMax?: number; unit?: string;
};
export function isScienceObservation(value: unknown): value is ScienceObservation {
  if (!value || typeof value !== 'object') return false;
  const v = value as ScienceObservation;
  return typeof v.title === 'string' && typeof v.context === 'string' && ['objects','weather','bars','table'].includes(v.format)
    && Array.isArray(v.columns) && v.columns.length >= 1 && v.columns.length <= 4 && v.columns.every(c=>typeof c==='string')
    && Array.isArray(v.rows) && v.rows.length >= 1 && v.rows.length <= 6 && v.rows.every(r=>r && typeof r.label==='string' && Array.isArray(r.values) && r.values.length===v.columns.length && r.values.every(c=>typeof c==='string') && (r.symbol===undefined || ['red-ball','blue-ball','sun','rain'].includes(r.symbol)))
    && (v.format !== 'objects' || v.rows.every(r=>r.symbol==='red-ball'||r.symbol==='blue-ball'))
    && (v.format !== 'weather' || v.rows.every(r=>r.symbol==='sun'||r.symbol==='rain'))
    && (v.format !== 'bars' || (Number.isFinite(v.scaleMax) && v.scaleMax! > 0 && typeof v.unit==='string' && v.rows.every(r=>Number.isFinite(r.amount) && r.amount!>=0 && r.amount!<=v.scaleMax!)));
}
export function observationNarration(observation: ScienceObservation) {
  return `${observation.title}. ${observation.context} ${observation.rows.map(r=>`${r.label}: ${r.values.map((value,i)=>`${observation.columns[i]}, ${value}`).join('; ')}.`).join(' ')}`;
}
