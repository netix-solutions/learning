import 'server-only';
import data from './catalog.json';
import type { Book, BookCard, ReadingQuestion } from './types';

export type AuthoredBook = Omit<Book,'questions'> & {questions:(ReadingQuestion & {answer:number;explanation:string})[]};
export const books = data as AuthoredBook[];
export function findBook(id:string){return books.find(book=>book.id===id);}
export function publicBook(book:AuthoredBook):Book {
  return {...book,questions:book.questions.map(({prompt,choices,skill,evidencePage})=>({prompt,choices,skill,evidencePage}))};
}
export function bookCards():BookCard[]{
  return books.map(({id,revision,title,grade,world,genre,description,words,pages})=>({id,revision,title,grade,world,genre,description,words,pageCount:pages.length}));
}
