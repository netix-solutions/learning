export const READING_IDLE_MS=120_000;
/** Ignore suspended-browser jumps; elapsed time is engagement, not fluency. */
export function readingTick(elapsed:number,visible:boolean,idle:number,running:boolean){
 return running&&visible&&idle<READING_IDLE_MS?Math.max(0,Math.min(2500,elapsed)):0;
}
