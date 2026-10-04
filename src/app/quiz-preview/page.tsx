import { notFound } from 'next/navigation';
import { PracticeClient, type PracticePreview } from '@/app/practice/[subject]/PracticeClient';
import type { Grade, PracticeQuestion, SubmittedAnswer } from '@/lib/types';
import {mathProgressionQuestions} from '../../../scripts/math-progression-content.mjs';
import {READING_STORIES} from '@/lib/content/reading-stories';
import {SCIENCE_OBSERVATIONS} from '@/lib/content/science-observations';
export default async function Page({searchParams}: {searchParams: Promise<{grade?: string; scenario?:string}>}) {
  if(process.env.NODE_ENV === 'production') notFound();
  const {grade = 'K',scenario='math'} = await searchParams;
  if(!['K','1','2','3','4','5'].includes(grade)) notFound();
  const previews:PracticePreview=[];
  function add(question:PracticeQuestion,correct:SubmittedAnswer,explanation:string){previews.push({question,result:{is_correct:true,correct,correct_index:typeof correct==='number'?correct:0,explanation,xp_earned:0,new_xp:0,new_streak:0,new_badges:[]}});}
  if(scenario==='categorize'){
    add({id:'sort-shapes',grade:grade as Grade,subject_id:'math',prompt:'Sort the shapes into flat shapes and solid shapes.',choices:[],kind:'categorize',payload:{items:['Triangle','Cube','Circle','Sphere'],buckets:['Flat shape','Solid shape']},standard:null,skill:`${grade}.shapes`,xp:0},[0,1,0,1],'Triangles and circles are flat. Cubes and spheres are solid shapes.');
  } else if(scenario==='arithmetic'){
    const prompt=grade==='K'?'5 - 2 = ?':grade==='1'?'15 - 7 = ?':'98 - 37 = ?';
    const correct=grade==='K'?3:grade==='1'?8:61;
    add({id:'stacked-math',grade:grade as Grade,subject_id:'math',prompt,choices:[correct,correct+1,correct-1,correct+2].map(String),kind:'mcq',standard:null,skill:`${grade}.addsub`,xp:0},0,`The answer is ${correct}.`);
  } else if(scenario==='reading'){
    const story=READING_STORIES.filter(s=>s.grade===grade).sort((a,b)=>b.passage.length-a.passage.length)[0];
    if(story)for(const [i,q] of story.questions.entries())add({id:`story-${i}`,grade:grade as Grade,subject_id:'reading',prompt:`Read: "${story.passage}" ${q.prompt}`,choices:[...q.choices],kind:'mcq',standard:story.standard,skill:story.skill,xp:0},q.answer,q.explanation);
  } else if(scenario==='science'){
    const activity=SCIENCE_OBSERVATIONS.find(a=>a.grade===grade);
    if(activity)for(const [i,q] of activity.questions.entries())add({id:`science-${i}`,grade:grade as Grade,subject_id:'science',prompt:q.prompt,choices:q.choices,kind:'mcq',payload:{observation:activity.observation,observationQuestion:q.prompt},standard:null,skill:`${grade}.observation`,xp:0},q.answer,q.explanation);
  } else {
    const bank=mathProgressionQuestions().filter(q=>q.grade===grade&&(scenario==='math'?q.kind==='mcq'&&q.difficulty===3:q.kind===scenario));
    for(const [i,q] of bank.slice(0,4).entries())add({...q,id:`math-${i}`,choices:q.choices??[]} as PracticeQuestion,q.kind==='mcq'?q.answer_index:q.answer,q.explanation);
  }
  return <PracticeClient grade={grade as Grade} preview={previews} studentId="isolated-quiz-preview" subject={{id:'daily',name:'Practice quizzes',emoji:'⭐',color:'blue',sort:0}} />;
}
