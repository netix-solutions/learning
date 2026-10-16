'use client';
import Link from 'next/link';
export default function ReadingError({reset}:{reset:()=>void}){return <section className="mx-auto max-w-lg p-8 text-center"><h1 className="text-2xl font-extrabold">Your books need a moment.</h1><p className="my-5">We couldn’t load your saved reading progress. Please try again.</p><button className="rounded-xl bg-sky-800 px-6 py-3 font-bold text-white" onClick={reset}>Try again</button><Link href="/home" className="block p-5 underline">Back home</Link></section>;}
