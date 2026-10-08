import type {TrainState} from './train';
export const RIDE_STATIONS = [
 {id:'meadow',name:'Meadow',arrival:'Meadow Station',sky:'#dff2da',tint:'transparent'},
 {id:'hilltop',name:'Hilltop',arrival:'Hilltop Station',sky:'#ffdeb2',tint:'rgba(189,91,26,.18)'},
 {id:'starlight',name:'Starlight',arrival:'Starlight Station',sky:'#182d50',tint:'rgba(10,23,61,.62)'},
] as const;
export type RidePhase='ready'|'riding'|'paused'|'arrived';
export const RIDE_DURATION=12000;
export function advanceRide(elapsed:number,delta:number) {return Math.min(RIDE_DURATION,Math.max(0,elapsed)+Math.max(0,Number.isFinite(delta)?delta:0));}
export function rideVehicles(state:TrainState) {
 const engine=state.activeEngine??'engine';
 return [{id:'ride-engine',kind:engine,name:state.engineCatalog?.find(e=>e.id===engine)?.name??'Classic steam engine'},
 ...state.cars.map((car,index)=>({id:car.id,kind:car.carId,name:`Car ${index+1}: ${state.catalog.find(c=>c.id===car.carId)?.name??'Train car'}`}))];
}
