import {notFound} from 'next/navigation';
import {bookCards,findBook,publicBook} from '@/lib/books/catalog';
import {BookLibrary} from '@/components/reading/BookLibrary';
import {BookReader} from '@/components/reading/BookReader';
import type {Grade} from '@/lib/types';
export default async function BookPreview({searchParams}:{searchParams:Promise<{book?:string;grade?:string}>}){
 if(process.env.NODE_ENV==='production')notFound();
 const {book:id,grade='2'}=await searchParams;if(!['PK','K','1','2','3','4','5'].includes(grade))notFound();
 if(!id)return <BookLibrary books={bookCards()} grade={grade as Grade} progress={[]} preview/>;
 const book=findBook(id);if(!book)notFound();
 return <BookReader key={book.id} book={publicBook(book)} studentId="isolated-book-preview" previewAnswers={book.questions.map(({answer,explanation})=>({answer,explanation}))}/>;
}
