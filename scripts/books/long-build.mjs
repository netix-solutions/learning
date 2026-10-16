import {booksFor} from './build.mjs';
/** New books have explicit checkpoints; existing books keep their saved question order. */
export function longBooksFor(grade,rows){
 return booksFor(grade,rows).map(book=>({...book,revision:'2026-10-long-v1',questions:book.questions.map((q,index)=>({...q,checkpointPage:grade==='PK'||index===book.questions.length-1?book.pages.length-1:Math.min(Math.ceil((q.evidencePage+1)/3)*3-1,book.pages.length-1)}))}));
}
