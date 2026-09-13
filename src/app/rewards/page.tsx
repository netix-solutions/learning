import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/auth';
import { getMyGarden } from '@/app/actions/garden';
import { getMyTrain } from '@/app/actions/train';
import { LearningRewards } from '@/components/LearningRewards';
export const metadata={title:'My rewards — SunSharp',robots:{index:false}};
export default async function RewardsPage(){const {user,profile}=await getSessionProfile();if(!user)redirect('/kids');if(profile?.role!=='student')redirect('/parent');const [garden,train]=await Promise.all([getMyGarden(),getMyTrain().catch(()=>undefined)]);return <main data-grade={profile.grade} className="grade-home mx-auto w-full min-w-0 max-w-3xl px-4 py-6"><Link href="/home" className="inline-flex min-h-12 items-center rounded-xl bg-white px-4 font-bold text-slate-700">← Home</Link><LearningRewards grade={profile.grade} initialGarden={garden} initialTrain={train} full/></main>;}
