export type TrendPeriod = {period:'previous'|'recent';questions:number;independent:number;correct:number;helped:number;unknown:number};
export type TrendSkill = {subject_id:string;skill:string;difficulty:number;previous_count:number;previous_correct:number;recent_count:number;recent_correct:number};
export type PracticeTrends = {as_of:string;grade:string|null;periods:TrendPeriod[];skills:TrendSkill[]};
// Four different independent answers in each window is a display floor, not
// statistical significance or evidence of a measured change in ability.
export function comparableSkills(data:PracticeTrends) {
 return data.skills.filter(s=>s.previous_count>=4&&s.recent_count>=4).map(s=>({
  ...s,previousPercent:Math.round(100*s.previous_correct/s.previous_count),recentPercent:Math.round(100*s.recent_correct/s.recent_count),
 }));
}
export function trendDateRange(asOf:string,period:'previous'|'recent') {
 const end=new Date(asOf).getTime()-(period==='previous'?14:0)*86400000;
 const start=end-14*86400000;
 const format=(date:number)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(date);
 return `${format(start)}–${format(end)}`;
}
