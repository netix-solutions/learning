import {redirect} from 'next/navigation';
import {getSessionProfile} from '@/lib/auth';
import {getStudentEntitlement} from '@/lib/entitlement';
import {bookCards} from '@/lib/books/catalog';
import {BookLibrary} from '@/components/reading/BookLibrary';
export const metadata={title:'Your bookshelf · SunSharp'};
export default async function ReadingPage(){
 const {user,profile,supabase}=await getSessionProfile();
 if(!user)redirect('/kids');if(profile?.role!=='student')redirect('/parent');
 if(!(await getStudentEntitlement(user.id)).entitled)redirect('/home');
 const {data,error}=await supabase.from('reading_progress').select('book_id,revision,page,furthest_page,active_ms,listening_ms,completed_at,updated_at').eq('student_id',user.id);
 if(error)throw new Error('Your bookshelf could not load. Please try again.');
 return <BookLibrary books={bookCards()} grade={profile.grade||'K'} progress={data||[]}/>;
}
