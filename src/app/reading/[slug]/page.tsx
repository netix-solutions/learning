import {notFound,redirect} from 'next/navigation';
import {getSessionProfile} from '@/lib/auth';
import {getStudentEntitlement} from '@/lib/entitlement';
import {findBook,publicBook} from '@/lib/books/catalog';
import {BookReader} from '@/components/reading/BookReader';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const book=findBook((await params).slug);return {title:book?`${book.title} · SunSharp`:'SunSharp Books'};}
export default async function ReadingBook({params}:{params:Promise<{slug:string}>}){
 const book=findBook((await params).slug);if(!book)notFound();
 const {user,profile,supabase}=await getSessionProfile();if(!user)redirect('/kids');if(profile?.role!=='student')redirect('/parent');
 if(!(await getStudentEntitlement(user.id)).entitled)redirect('/home');
 const [progress,checks]=await Promise.all([supabase.from('reading_progress').select('book_id,revision,page,furthest_page,active_ms,listening_ms,completed_at,updated_at').eq('student_id',user.id).eq('book_id',book.id).maybeSingle(),supabase.from('reading_checks').select('book_id,question_index,is_correct,support_used,created_at').eq('student_id',user.id).eq('book_id',book.id).eq('revision',book.revision)]);
 if(progress.error||checks.error)throw new Error('Your reading progress could not load. Please try again.');
 return <BookReader key={book.id} book={publicBook(book)} studentId={user.id} progress={progress.data||undefined} checks={checks.data||[]}/>;
}
