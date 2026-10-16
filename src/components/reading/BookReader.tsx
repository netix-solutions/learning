'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {SpeakButton} from '@/components/SpeakButton';
import {Confetti} from '@/components/Confetti';
import {AudioControls} from '@/components/AudioControls';
import {playSound} from '@/lib/sound';
import {stop} from '@/lib/speech';
import {checkpointFor,readingTime,WORLD_NAMES,type Book,type ReadingProgress,type ReadingCheck} from '@/lib/books/types';
import {useReadingTimer} from './useReadingTimer';
import './reading.css';
type Result={correct:boolean;answer:number;explanation:string;evidencePage:number};
export function BookReader({book,studentId,progress,checks=[],previewAnswers}:{book:Book;studentId:string;progress?:ReadingProgress;checks?:ReadingCheck[];previewAnswers?:{answer:number;explanation:string}[]}){
 const preview=!!previewAnswers,early=['PK','K','1'].includes(book.grade);
 const [page,setPage]=useState(Math.min(progress?.page||0,book.pages.length-1));
 const [mode,setMode]=useState<'read'|'check'|'done'>('read');
 const [textSize,setTextSize]=useState(1),[word,setWord]=useState<string|null>(null);
 const [answered,setAnswered]=useState<number[]>(checks.map(c=>c.question_index));
 const [questionIndex,setQuestionIndex]=useState(0),[supportUsed,setSupportUsed]=useState(false),[review,setReview]=useState<{question:number;page:number}|null>(null);
 const [result,setResult]=useState<Result|null>(null),[choice,setChoice]=useState<number|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[fire,setFire]=useState(0);
 const [results,setResults]=useState<Record<number,boolean>>(Object.fromEntries(checks.map(c=>[c.question_index,c.is_correct])));
 const content=useRef<HTMLElement>(null),heading=useRef<HTMLHeadingElement>(null),touch=useRef<{x:number;y:number}|null>(null);
 const timer=useReadingTimer(studentId,book.id,page,preview);
 const startReading=timer.start;
 useEffect(()=>{
  let started=false,active=true;
  const begin=()=>{if(active&&!started&&!document.hidden)void startReading().then(ok=>{if(active)started=ok;});};
  const opening=setTimeout(begin,0);
  document.addEventListener('visibilitychange',begin);
  return()=>{active=false;clearTimeout(opening);document.removeEventListener('visibilitychange',begin);};
 },[startReading]);
 const question=book.questions[questionIndex];
 const library=preview?`/book-preview?grade=${book.grade}`:'/reading';
 const available=(at:number,done=answered)=>book.questions.map((_,i)=>i).filter(i=>checkpointFor(book,i)<=at&&!done.includes(i));
 function focusPage(){requestAnimationFrame(()=>{content.current?.scrollTo({top:0});heading.current?.focus({preventScroll:true});});}
 function openQuestion(index:number){stop();void timer.pause();setQuestionIndex(index);setMode('check');setSupportUsed(false);setResult(null);setChoice(null);setError('');focusPage();}
 async function finish(){if(!await timer.flush(book.pages.length-1,true)){setError('Your progress could not save. Please try again.');return;}await timer.pause();setMode('done');setFire(f=>f+1);playSound('win');focusPage();}
 async function next(){
  if(busy)return;setBusy(true);setError('');stop();setWord(null);
  if(review){setPage(review.page);setQuestionIndex(review.question);setReview(null);setMode('check');await timer.pause();setBusy(false);focusPage();return;}
  if(!await timer.start()||!await timer.flush(page,page===book.pages.length-1)){setError('Your progress could not save. Check your connection and try again.');setBusy(false);return;}
  const due=available(page);
  if(due.length)openQuestion(due[0]);else if(page===book.pages.length-1)await finish();else {setPage(page+1);void timer.flush(page+1);focusPage();}
  setBusy(false);
 }
 function previous(){if(busy||page===0||review)return;stop();setWord(null);setPage(page-1);void timer.flush(page-1);focusPage();}
 function lookBack(){setSupportUsed(true);setReview({question:questionIndex,page});setPage(question.evidencePage);setMode('read');setWord(null);focusPage();}
 async function answer(index:number){
  if(busy||result)return;setBusy(true);setChoice(index);setError('');stop();
  try{
   let value:Result;
   if(previewAnswers){const expected=previewAnswers[questionIndex];value={correct:index===expected.answer,answer:expected.answer,explanation:expected.explanation,evidencePage:question.evidencePage};}
   else {const response=await fetch('/api/reading',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'check',studentId,bookId:book.id,question:questionIndex,choice:index,supportUsed})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Please retry your answer.');value=data;}
   setResult(value);setResults(current=>({...current,[questionIndex]:value.correct}));setAnswered(current=>[...new Set([...current,questionIndex])]);
   if(value.correct){setFire(f=>f+1);playSound('correct');}
  }catch(err){setError(err instanceof Error?err.message:'Please retry your answer.');setChoice(null);}finally{setBusy(false);}
 }
 async function afterAnswer(){const due=available(page);if(due.length)openQuestion(due[0]);else if(page===book.pages.length-1)await finish();else {setMode('read');setPage(page+1);void timer.start();void timer.flush(page+1);focusPage();}}
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(mode!=='read'||event.altKey||event.ctrlKey||event.metaKey||event.target instanceof HTMLInputElement||event.target instanceof HTMLSelectElement||event.target instanceof HTMLButtonElement)return;if(event.key==='ArrowRight'){event.preventDefault();void next();}if(event.key==='ArrowLeft'){event.preventDefault();previous();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);});
 const baseSize=early?[24,29,34][textSize]:[21,25,29][textSize];
 const text=book.pages[page];
 const pattern=book.vocabulary.map(v=>v.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
 const parts=pattern?text.split(new RegExp(`(\\b(?:${pattern})\\b)`,'gi')):[text];
 return <div className={`book-reader ${early?'book-reader-early':''}`} style={{'--reading-text-size':`${baseSize}px`} as CSSProperties}>
  <Confetti fire={fire} count={36}/>
  <header className="book-toolbar"><Link href={library} onClick={()=>void timer.pause()} className="book-library-link" aria-label="Back to bookshelf"><span aria-hidden>←</span> <span>Bookshelf</span></Link><div className="book-timer"><span className={timer.running?'book-timer-dot active':'book-timer-dot'} aria-hidden/><span aria-label={`${readingTime(timer.elapsed)} active book time`}>{readingTime(timer.elapsed)}</span>{mode==='read'&&<button disabled={timer.starting} onClick={()=>timer.running?void timer.pause():void timer.start()}>{timer.starting?'…':timer.running?'Pause':'Resume'}</button>}</div><div className="book-toolbar-tools"><label className="book-type-control">Text<select aria-label="Reading text size" value={textSize} onChange={e=>setTextSize(Number(e.target.value))}><option value={0}>A</option><option value={1}>A+</option><option value={2}>A++</option></select></label><AudioControls/></div></header>
  <section aria-label="Book content" ref={content} className="book-stage" onTouchStart={e=>{touch.current={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};}} onTouchEnd={e=>{const start=touch.current;touch.current=null;if(!start||mode!=='read'||(e.target as HTMLElement).closest('button,a,select'))return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>80&&Math.abs(dy)<35){if(dx<0)void next();else previous();}}}>
   {mode==='read'&&<>
    {!timer.running&&timer.pauseReason&&<div className="book-pause-note" role="status">{timer.pauseReason}</div>}
    <article className="book-spread" key={page} aria-label={`Page ${page+1} of ${book.pages.length}`}>
     <div className="book-illustration"><Image src={page%2===0?`/images/books/stories/${book.id}.webp`:`/images/books/${book.world}.webp`} alt={page%2===0?`Story artwork for ${book.title}`:`The world of ${WORLD_NAMES[book.world]}`} fill sizes="(max-width: 700px) 100vw, 1100px" loading="eager"/><span>{WORLD_NAMES[book.world]}</span></div>
     <div className="book-paper"><div className="book-page-title"><h1 ref={heading} tabIndex={-1}>{book.title}</h1><SpeakButton id={`book:${book.id}:${page}`} text={text} onListen={()=>void timer.start()} label="Listen to this page"/></div><p className="book-prose">{parts.map((part,index)=>{const vocab=book.vocabulary.find(v=>v.word.toLowerCase()===part.toLowerCase());return vocab?<button className="book-word" key={index} onClick={()=>setWord(word===vocab.word?null:vocab.word)} aria-expanded={word===vocab.word}>{part}</button>:part;})}</p>{word&&<aside className="book-word-help" role="status"><strong>{word}</strong><p>{book.vocabulary.find(v=>v.word===word)?.meaning}</p><button onClick={()=>setWord(null)} aria-label="Close word meaning">×</button></aside>}<div className="book-paper-foot"><span>{book.vocabulary.some(v=>text.toLowerCase().includes(v.word.toLowerCase()))?'Tap an underlined word for help.':''}</span><span>{page+1}</span></div></div>
    </article>
   </>}
   {mode==='check'&&<section className="book-check"><span className="reading-kicker">{page===book.pages.length-1?'Think about the story':'A little story check'}</span><h1 ref={heading} tabIndex={-1}>{question.prompt}</h1><div className="book-check-tools"><SpeakButton id={`book-check:${book.id}:${questionIndex}`} text={`${question.prompt} ${question.choices.map((c,i)=>`${i+1}. ${c}`).join('. ')}`} label="Listen to the question"/><button onClick={lookBack} className="book-clue-button">Look back for clues <span aria-hidden>↗</span></button></div><div className="book-answer-list">{question.choices.map((answerText,index)=><button key={index} disabled={busy||!!result} className={`${result&&result.answer===index?'correct':''} ${choice===index?'selected':''}`} onClick={()=>void answer(index)}><span aria-hidden>{String.fromCharCode(65+index)}</span>{answerText}{result&&result.answer===index&&<span className="book-answer-check" aria-label="Correct answer">✓</span>}</button>)}</div>{result&&<div className={`book-feedback ${result.correct?'correct':''}`} role="status"><strong>{result.correct?'You found it!':'Let’s follow the clue.'}</strong><p>{result.explanation}</p><span>The clue is on page {result.evidencePage+1}.</span><button className="reading-primary" onClick={()=>void afterAnswer()}>{available(page).length?'Next question':page===book.pages.length-1?'Finish book':'Back to the story'} →</button></div>}{supportUsed&&<p className="book-support-note">Looking back is a useful reading skill.</p>}</section>}
   {mode==='done'&&<section className="book-complete"><div className="book-complete-art"><Image src={`/images/books/stories/${book.id}.webp`} alt="" fill sizes="360px"/></div><span className="reading-kicker">Book complete</span><h1 ref={heading} tabIndex={-1}>You read {book.title}!</h1><p>{readingTime(timer.elapsed)} book time this visit · {Object.values(results).filter(Boolean).length} of {book.questions.length} questions answered correctly.</p><div className="book-retell"><h2>Tell it your way</h2><p>{book.retell}</p><span>Share with a grown-up, or say it to yourself.</span></div><div className="book-complete-actions"><Link className="reading-primary" href={library}>Find another story →</Link><button onClick={()=>{setAnswered([]);setResults({});setMode('read');setPage(0);void timer.start();void timer.flush(0);focusPage();}}>Read it again</button></div></section>}
   {error&&<p className="book-error" role="alert">{error}</p>}
  </section>
  <footer className="book-footer"><div className="book-save-status"><span title={timer.status}>{preview?'Preview · no account activity saved':timer.status}</span>{!preview&&!timer.starting&&timer.status!=='Opening book…'&&timer.status!=='Reading time saved'&&<button onClick={()=>{void (async()=>{await timer.retry();if(mode==='read')await timer.start();})();}}>Try again</button>}</div>{mode==='read'&&<nav className="book-page-navigation" aria-label="Book pages"><button onClick={previous} disabled={page===0||!!review||busy} aria-label="Previous page">← <span>Back</span></button><span>Page {page+1} <span className="book-page-of">of {book.pages.length}</span><progress value={page+1} max={book.pages.length} aria-label="Book progress"/></span><button className="reading-primary" onClick={()=>void next()} disabled={busy}>{busy?'Saving…':review?'Back to question':available(page).length?'Story check':page===book.pages.length-1?'Finish':'Next'} <span aria-hidden>→</span></button></nav>}</footer>
 </div>;
}
