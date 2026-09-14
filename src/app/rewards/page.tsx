import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/auth';
import { getMyGarden } from '@/app/actions/garden';
import { getMyTrain } from '@/app/actions/train';
import { LearningRewards } from '@/components/LearningRewards';
export const metadata={title:'My rewards — SunSharp',robots:{index:false}};
export default async function RewardsPage(){const {user,profile}=await getSessionProfile();if(!user)redirect('/kids');if(profile?.role!=='student')redirect('/parent');const [garden,train]=await Promise.all([getMyGarden(),getMyTrain().catch(()=>undefined)]);return <main data-grade={profile.grade} className="grade-home mx-auto w-full min-w-0 max-w-5xl px-4 py-6"><div className="page-heading"><p className="eyebrow">Made by your curiosity</p><h1>Your little worlds</h1><p>Keep practicing. Collect your favorites. Make it yours.</p></div><LearningRewards grade={profile.grade} initialGarden={garden} initialTrain={train} full/></main>;}
