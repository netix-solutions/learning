import { experienceFor } from '@/lib/grade-experience';
import Link from 'next/link';
import Image from 'next/image';
import { RecordedNarration } from '@/components/LessonNarration';
import { HOME_NARRATION } from '@/lib/home-narration';
import type { Grade, Subject } from '@/lib/types';
const hints: Record<string,string> = {math:'Numbers & shapes',reading:'Words & stories',science:'How things work',geography:'Maps & places',history:'People & the past',civics:'People & rules',economics:'Money & choices'};
function Voice({name}:{name:string}) {const id=`home:${name}`;return HOME_NARRATION[id]?<RecordedNarration id={id} text={HOME_NARRATION[id]} label={`Hear about ${name==='learn'?'learning':name}`}/>:null;}
export function HomeLearningChoices({grade,subjects}:{grade:Grade|null;subjects:Subject[]}) {
 const experience=experienceFor(grade);const core=subjects.filter(s=>['math','reading','science'].includes(s.id));const more=subjects.filter(s=>!['math','reading','science'].includes(s.id));
 function cards(items:Subject[]){return <div className="subject-grid">{items.map(s=><article key={s.id} className={`subject-card subject-${s.id}`}><Link href={`/practice/${s.id}`}><div className="subject-art">{['math','reading','science','geography','history','civics','economics'].includes(s.id)?<Image src={`/images/ui/${s.id}.webp`} alt="" fill unoptimized sizes="180px" className="object-contain"/>:<span aria-hidden="true">{s.emoji}</span>}</div><h3>{s.name}</h3><p>{hints[s.id]??'Explore & practice'}</p></Link><div className="subject-listen"><Voice name={s.id}/></div></article>)}</div>;}
 return <section aria-label="Choose your learning" className="learning-choices"><div className="practice-hero"><Link href="/practice/daily" className="practice-hero-link"><span className="eyebrow">A little practice. A big discovery.</span><h2>Practice quizzes</h2><p>{experience.quizHint}</p><span className="practice-hero-cta">Let’s practice <span aria-hidden="true">↗</span></span></Link><div className="practice-hero-art"><Image src="/images/ui/discovery.webp" alt="" fill unoptimized sizes="300px" className="object-contain"/></div><div className="practice-hero-voice"><Voice name="practice"/></div></div>
 <div className="practice-details"><span>{experience.roundSize} questions · Go at your own pace</span><RecordedNarration id="home:guide" text={HOME_NARRATION['home:guide']} label="Hear how to use this page"/></div>
 <div className="section-heading"><h2>Pick a subject</h2><span>A different way to explore</span></div>{cards(core)}
 {grade && ['1','2'].includes(grade) && core.some(s=>s.id==='math') && <Link href="/practice/math?game=numberline" className="mt-4 flex min-h-20 items-center gap-4 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-teal-900"><svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none" className="shrink-0"><path d="M12 27Q12 8 24 8Q36 8 36 27" fill="#d8f8f3" stroke="#236662" strokeWidth="2"/><ellipse cx="24" cy="29" rx="20" ry="7" fill="#2a827a"/><circle cx="19" cy="21" r="2" fill="#174e4b"/><circle cx="29" cy="21" r="2" fill="#174e4b"/><path d="m18 38 6 7 6-7" fill="#e8af43"/></svg><span className="flex-1"><strong className="block text-lg">Number Line Rescue</strong><span className="mt-1 block text-sm">Choose a move. Fly to the goal.</span></span><span aria-hidden="true">→</span></Link>}
 {more.length>0&&<details className="more-subjects"><summary>Explore more subjects <span aria-hidden="true">＋</span></summary>{cards(more)}</details>}
 <div className="lesson-invitation"><Link href="/learn"><span className="lesson-invitation-icon" aria-hidden="true">↗</span><span><strong>Learn something new</strong><span>Step-by-step lessons, whenever you’re curious.</span></span></Link><Voice name="learn"/></div>
 </section>;
}
