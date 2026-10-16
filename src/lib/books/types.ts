import type { Grade } from '../types';
export type BookWorld = 'forest'|'train'|'space'|'bakery'|'ocean'|'dinosaur'|'garden'|'museum';
export type ReadingQuestion = { prompt:string; choices:string[]; skill:string; evidencePage:number };
export type Book = { id:string; revision:string; title:string; grade:Grade; world:BookWorld; genre:string; description:string; pages:string[]; vocabulary:{word:string;meaning:string}[]; questions:ReadingQuestion[]; retell:string; words:number };
export type BookCard = Omit<Book,'pages'|'questions'|'vocabulary'|'retell'> & {pageCount:number};
export type ReadingProgress = { book_id:string; page:number; furthest_page:number; active_ms:number; listening_ms:number; completed_at:string|null; updated_at:string; revision:string };
export type ReadingCheck = {book_id:string;question_index:number;is_correct:boolean;support_used:boolean;created_at:string};
export type ReadingSnapshot = { action:'sync'; sessionId:string; bookId:string; sequence:number; activeMs:number; listeningMs:number; page:number; complete:boolean };
export const WORLD_NAMES:Record<BookWorld,string>={forest:'Fernwood friends',train:'Juniper Junction',space:'Moon Mail',bakery:'The little bakery',ocean:'Under the waves',dinosaur:'Dinosaur valley',garden:'Backyard discoveries',museum:'Museum mysteries'};
export function readingTime(ms:number){const seconds=Math.max(0,Math.floor(ms/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
/** One supported question midway; deeper questions wait for the ending. */
export function checkpointFor(book:Book,question:number){
 const middle=book.questions.findIndex(q=>q.evidencePage<=1);
 return question===middle?1:book.pages.length-1;
}
