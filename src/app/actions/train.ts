'use server';
import { getSessionProfile } from '@/lib/auth';
import type { TrainState, RewardTheme } from '@/lib/train';
async function call(name: string, args = {}): Promise<TrainState> {
 const {user,profile,supabase}=await getSessionProfile();
 if(!user || profile?.role!=='student') throw new Error('Please sign in to open your train.');
 const {data,error}=await supabase.rpc(name,args);
 if(error || !data) throw new Error('That change could not be saved. Please try again.');
 return data as TrainState;
}
export async function getMyTrain(){return call('get_my_train');}
export async function chooseRewardTheme(theme: RewardTheme){return call('set_reward_theme',{p_theme:theme});}
export async function buyTrainCar(car: string, request: string){return call('buy_train_car',{p_car:car,p_request:request});}
export async function moveTrainCar(purchase: string,direction: number){return call('move_train_car',{p_purchase:purchase,p_direction:direction});}

export async function buyDinosaur(dinosaur: string, request: string){return call('buy_dinosaur',{p_car:dinosaur,p_request:request});}

export async function buyBakeryTreat(treat: string, request: string){return call('buy_bakery_treat',{p_treat:treat,p_request:request});}
