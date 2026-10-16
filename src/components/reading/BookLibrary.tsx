'use client';
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {WORLD_NAMES,readingTime,type BookCard,type ReadingProgress} from '@/lib/books/types';
import type {Grade} from '@/lib/types';
import './reading.css';
const levels:Grade[]=['PK','K','1','2','3','4','5'];
export function BookLibrary({books,grade,progress,preview=false}:{books:BookCard[];grade:Grade;progress:ReadingProgress[];preview?:boolean}){
 const [level,setLevel]=useState(grade),[query,setQuery]=useState(''),[world,setWorld]=useState('all');
 const available=books.filter(b=>b.grade===level&&(!query||`${b.title} ${b.genre} ${WORLD_NAMES[b.world]}`.toLowerCase().includes(query.toLowerCase()))&&(world==='all'||b.world===world));
 const byBook=new Map(progress.map(p=>[p.book_id,p]));
 const recent=progress.filter(p=>!p.completed_at).sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).map(p=>books.find(b=>b.id===p.book_id)).find(Boolean);
 const featured=recent||books.find(b=>b.grade===level&&b.world==='forest')!;
 const href=(book:BookCard)=>preview?`/book-preview?grade=${book.grade}&book=${book.id}`:`/reading/${book.id}`;
 const total=progress.reduce((sum,p)=>sum+p.active_ms,0);
 return <div className="reading-library">
  <div className="reading-library-top"><Link href="/home">← Home</Link><Link href="/practice/reading">Quick reading quiz ↗</Link></div>
  <section className="reading-invitation">
   <div><span className="reading-kicker">Your story starts here</span><h1>A little book.<br/>A whole new world.</h1><p>Meet curious friends, follow surprising clues, and find your next favorite story.</p><Link className="reading-primary" href={href(featured)}>{recent?'Keep reading':'Open a book'} <span aria-hidden>→</span></Link>{recent&&<p className="reading-continue">Continue <strong>{recent.title}</strong></p>}</div>
   <Link href={href(featured)} className="reading-featured" aria-label={`Read ${featured.title}`}><Image src={`/images/books/stories/${featured.id}.webp`} alt={`Illustration for ${featured.title}`} fill sizes="(max-width: 700px) 90vw, 800px" loading="eager"/><span>{featured.title}</span></Link>
  </section>
  <section aria-labelledby="bookshelf-heading">
   <div className="reading-shelf-heading"><div><span className="reading-kicker">The bookshelf</span><h2 id="bookshelf-heading">What will you discover?</h2></div>{total>0&&<p>{readingTime(total)} book time · {progress.filter(p=>p.completed_at).length} books finished</p>}</div>
   <div className="reading-filters"><label>Reading level<select value={level} onChange={e=>setLevel(e.target.value as Grade)}>{levels.map(g=><option key={g} value={g}>{g==='PK'?'Pre-K':g==='K'?'Kindergarten':`Grade ${g}`}{g===grade?' · Your level':''}</option>)}</select></label><label>Find a story<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try trains, mystery, or a title"/></label><label>Collection<select value={world} onChange={e=>setWorld(e.target.value)}><option value="all">All collections</option>{Object.entries(WORLD_NAMES).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label></div>
   <p className="reading-level-note">{level==='PK'||level==='K'?'Read together, point to the pictures, and listen when you need help.':'Choose a story that feels comfortable. You can try another level anytime.'} <span aria-live="polite">{available.length} books to explore.</span></p>
   <div className="reading-shelf">{available.map(book=>{const saved=byBook.get(book.id);return <article key={book.id} className={`reading-book reading-world-${book.world}`}><Link href={href(book)}><div className="reading-cover"><Image src={`/images/books/stories/${book.id}.webp`} alt="" fill sizes="(max-width: 550px) 90vw, (max-width: 900px) 60vw, 500px"/><div className="reading-cover-type"><span>{WORLD_NAMES[book.world]}</span><h3>{book.title}</h3></div>{saved?.completed_at&&<span className="reading-finished">✓ Read it!</span>}</div><div className="reading-book-info"><span>{book.genre} · {book.pageCount} pages</span><strong>{saved&&!saved.completed_at?`Continue on page ${saved.page+1}`:'Read this book'} <span aria-hidden>→</span></strong></div></Link></article>;})}</div>
   {!available.length&&<div className="reading-empty"><h3>No stories match just yet.</h3><button onClick={()=>{setQuery('');setWorld('all');}}>Show all books at this level</button></div>}
  </section>
  <p className="reading-library-foot">A story to read. A moment to think. A new favorite to find.</p>
  {preview&&<p className="reading-preview-note">Preview library · Reading activity here stays on this device.</p>}
 </div>;
}
