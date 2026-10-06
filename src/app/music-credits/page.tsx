import Link from 'next/link';
import { MUSIC } from '@/lib/music';
export const metadata = { title: 'Music & sound credits — SunSharp' };
export default function MusicCredits() {
  return <main className="mx-auto max-w-3xl px-5 py-10 text-slate-800">
    <Link href="/home" className="inline-flex min-h-12 items-center font-bold text-sky-800">← Back to SunSharp</Link>
    <h1 className="mt-4 text-3xl font-extrabold">Music & sound credits</h1>
    <p className="mt-3 leading-relaxed">Thank you to the musicians and creators who help make our little worlds sound wonderful.</p>
    <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold">Music by Kevin MacLeod</h2>
      <p className="mt-3">These recordings are by <a href="https://incompetech.com/" className="font-bold underline">Kevin MacLeod (incompetech.com)</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" className="font-bold underline">Creative Commons Attribution 4.0 International</a>.</p>
      <ul className="mt-4 space-y-3">{MUSIC.map(track=><li key={track.file}><a className="font-bold text-sky-800 underline" href={`https://incompetech.com/music/royalty-free/index.html?isrc=${track.isrc}`}>{track.title}</a> — Kevin MacLeod</li>)}</ul>
      <p className="mt-4 text-sm leading-relaxed">Adaptations: converted to AAC for smaller downloads. Playback volume is reduced; tracks may repeat or play in a sequence. No endorsement by the composer is implied.</p>
    </section>
    <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold">Sound effects by Kenney</h2>
      <p className="mt-3"><a href="https://kenney.nl/assets/interface-sounds" className="font-bold text-sky-800 underline">Interface Sounds</a> and <a href="https://kenney.nl/assets/music-jingles" className="font-bold text-sky-800 underline">Music Jingles</a> by Kenney / Kenney Vleugels, provided under <a href="https://creativecommons.org/publicdomain/zero/1.0/" className="font-bold underline">CC0 1.0</a>.</p>
      <p className="mt-3 text-sm">Converted to mono WAV. Playback volume and the pitch of some cues are adjusted.</p>
    </section>
  </main>;
}
