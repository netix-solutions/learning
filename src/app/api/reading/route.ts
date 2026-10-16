import { getSessionProfile } from '@/lib/auth';
import { getStudentEntitlement } from '@/lib/entitlement';
import { createAdminClient } from '@/lib/supabase/admin';
import { findBook } from '@/lib/books/catalog';
import { checkpointFor } from '@/lib/books/types';

const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const integer=(n:unknown,max:number)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=max;
export async function POST(request:Request){
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return reply({error:'Please open this book in SunSharp.'},403);
  if(Number(request.headers.get('content-length')||0)>4096)return reply({error:'Request too large.'},413);
  const {user,profile}=await getSessionProfile();
  if(!user||profile?.role!=='student')return reply({error:'Please sign in with your kid account.'},401);
  if(!(await getStudentEntitlement(user.id)).entitled)return reply({error:'Ask your grown-up to check your learning plan.'},403);
  const raw=await request.text();
  if(raw.length>4096)return reply({error:'Request too large.'},413);
  let body;try{body=JSON.parse(raw);}catch{return reply({error:'Invalid request.'},400);}
  if(!body||typeof body!=='object'||typeof body.bookId!=='string')return reply({error:'Choose a book first.'},400);
  if(body.studentId!==user.id)return reply({error:'Your account changed. Please reopen the library.'},409);
  const book=findBook(body.bookId);
  if(!book)return reply({error:'Book not found.'},404);
  const admin=createAdminClient();
  if(body.action==='sync'){
    if(typeof body.sessionId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.sessionId)||!integer(body.sequence,2147483647)||!integer(body.activeMs,86400000)||!integer(body.listeningMs,body.activeMs)||!integer(body.page,book.pages.length-1)||typeof body.complete!=='boolean')return reply({error:'Invalid reading time.'},400);
    const {data,error}=await admin.rpc('sync_reading_session',{p_student:user.id,p_session:body.sessionId,p_book:book.id,p_revision:book.revision,p_pages:book.pages.length,p_page:body.page,p_sequence:body.sequence,p_active:body.activeMs,p_listening:body.listeningMs,p_complete:body.complete});
    if(error){console.error('[reading] Session save failed',error.code);return reply({error:'Your reading time could not sync. Please retry.'},503);}
    return reply({progress:data});
  }
  if(body.action==='check'){
    if(!integer(body.question,book.questions.length-1)||typeof body.supportUsed!=='boolean')return reply({error:'Invalid question.'},400);
    const question=book.questions[body.question];
    if(!integer(body.choice,question.choices.length-1))return reply({error:'Choose an answer.'},400);
    const {data:progress,error:progressError}=await admin.from('reading_progress').select('furthest_page').eq('student_id',user.id).eq('book_id',book.id).maybeSingle();
    if(progressError)return reply({error:'Please retry in a moment.'},503);
    if(!progress||progress.furthest_page<checkpointFor(book,body.question))return reply({error:'Read to this part of the story first.'},409);
    const correct=body.choice===question.answer;
    const {error}=await admin.from('reading_checks').upsert({student_id:user.id,book_id:book.id,revision:book.revision,question_index:body.question,choice:body.choice,is_correct:correct,support_used:body.supportUsed},{onConflict:'student_id,book_id,revision,question_index',ignoreDuplicates:true});
    if(error)return reply({error:'Your answer could not save. Please retry.'},503);
    return reply({correct,answer:question.answer,explanation:question.explanation,evidencePage:question.evidencePage});
  }
  return reply({error:'Unknown reading action.'},400);
}
