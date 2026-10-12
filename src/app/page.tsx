import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/auth';
import { isBillingOn } from '@/lib/settings';
import { HeroAdventure } from '@/components/marketing/HeroAdventure';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { PracticeSample } from '@/components/marketing/PracticeSample';
import { RewardWorlds } from '@/components/marketing/RewardWorlds';
import { TRIAL_DAYS, BASE_PRICE_CENTS, EXTRA_PRICE_CENTS, formatCents } from '@/lib/billing';
import './landing.css';

const description = 'Playful K–5 math, reading and science practice, read-aloud help, four reward worlds, and clear progress insights for parents. Start your family’s SunSharp adventure.';
export const metadata: Metadata = {
  title: 'SunSharp — A little practice. A big adventure.', description,
  alternates: { canonical: '/' },
  openGraph: { title: 'SunSharp — A little practice. A big adventure.', description, url: '/' },
  twitter: { title: 'SunSharp — A little practice. A big adventure.', description },
};
const subjects = [
  { id: 'math', name: 'Math', title: 'More “I figured it out.”', copy: 'Count, spot patterns, work with shapes, and build toward bigger problems—one idea at a time.', topics: 'Numbers · Shapes · Problem solving', alt: 'Children building a colorful geometric bridge in a sunny discovery workshop' },
  { id: 'reading', name: 'Reading', title: 'A new world in every word.', copy: 'Explore sounds and vocabulary, read short passages, and find the details that bring a story together.', topics: 'Sounds · Words · Comprehension', alt: 'Children discovering a tiny storybook world in a cozy treehouse reading nook' },
  { id: 'science', name: 'Science', title: 'Let their “why?” lead the way.', copy: 'Investigate living things, matter, Earth, and space through questions that invite a closer look.', topics: 'Living things · Earth · Discovery', alt: 'Young explorers observing a butterfly, a seedling, and a leaf through a microscope' },
];

export default async function Home() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === 'parent' ? '/parent' : '/home');
  const billingOn = await isBillingOn();
  const cta = billingOn ? `Start ${TRIAL_DAYS}-day free trial` : 'Create a free family account';
  const offer = billingOn ? `${TRIAL_DAYS} days free, then ${formatCents(BASE_PRICE_CENTS)}/month for your first child. ${formatCents(EXTRA_PRICE_CENTS)}/month per additional child.` : 'Free for a limited time. No credit card needed.';
  const faqs = [
    { q: 'Who is SunSharp for?', a: 'SunSharp is designed for children in kindergarten through fifth grade. A parent chooses each child’s grade, and children practice grade-level skills in math, reading, science, and more.' },
    { q: 'Do kids and parents use the same login?', a: 'No. Parents use an email and password to manage the family and see progress. Kids use the username and PIN their parent creates to open their own practice and rewards.' },
    { q: 'What if my child gets an answer wrong?', a: 'Trying is part of learning. Children can use hints and explanations, explore a related lesson, and keep practicing. Practice attempts earn tokens even when an answer needs more work.' },
    { q: 'Can we use it on an iPad or phone?', a: 'Yes. SunSharp works in the browser on tablets, phones, and laptops. You can also add it to your home screen for an app-like experience. An internet connection is recommended for the full experience.' },
    { q: 'How much does it cost?', a: billingOn ? `${offer} All four reward worlds and the parent dashboard are included. See Pricing for the family plan and subscription details.` : 'SunSharp is free for a limited time, with no credit card required. You can explore the subjects, reward worlds, and parent dashboard. See Pricing for details.' },
    { q: 'Are there ads or things kids need to pay for?', a: 'There are no ads. Kids collect reward items with tokens earned through practice and lessons. Parents manage the family account and any subscription; children do not need a payment card.' },
  ];
  return <>
    <MarketingNav />
    <main className="landing-page" data-silent-click>
      <section className="marketing-hero landing-wrap" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <span className="landing-kicker">For curious minds in kindergarten–grade 5</span>
          <h1 id="landing-title">A little practice.<br/><em>A big adventure.</em></h1>
          <p>Math, reading, and science that give kids something to work toward—and parents a clearer picture of how they’re doing.</p>
          <div className="landing-hero-actions"><Link href="/signup" className="marketing-cta">{cta}<Arrow /></Link><a href="#try-practice" className="landing-text-link">Try a sample <Arrow /></a></div>
          <p className="landing-offer">{offer}</p>
        </div>
        <HeroAdventure />
      </section>

      <div className="landing-benefits landing-wrap" aria-label="Included in SunSharp">
        <span><Check />Grade-level practice</span><span><Check />Read-aloud guidance</span><span><Check />Four reward worlds</span><span><Check />No ads</span>
      </div>

      <section className="landing-section landing-wrap" aria-labelledby="subjects-heading">
        <div className="landing-section-heading"><span className="landing-kicker">So much to be curious about</span><h2 id="subjects-heading">Big ideas. Little lightbulb moments.</h2><p>Start with a subject they love. Build confidence to explore the next one.</p></div>
        <div className="landing-subjects">{subjects.map(subject => <article key={subject.id} className={`landing-subject landing-subject-${subject.id}`}>
          <div className="landing-subject-picture"><Image src={`/images/ui/subject-${subject.id}-adventure.webp`} alt={subject.alt} fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1152px) 32vw, 365px" className="object-cover" /><span>{subject.name}</span></div>
          <div className="landing-subject-copy"><h3>{subject.title}</h3><p>{subject.copy}</p><span>{subject.topics}</span></div>
        </article>)}</div>
        <p className="landing-more-subjects">And more to explore: geography, history, civics, and economics.</p>
      </section>

      <section id="try-practice" className="landing-section landing-wrap landing-demo" aria-labelledby="sample-heading">
        <div><span className="landing-kicker">A little try-it-yourself moment</span><h2 id="sample-heading">See how a small win feels.</h2><p className="landing-body">Choose an answer. Ask for a hint. Try again. A short round makes room for curiosity, even on a busy day.</p><ul className="landing-checklist"><li><Check />Practice starts with your child’s grade.</li><li><Check />Spoken guidance is a tap away in the app.</li><li><Check />Step-by-step lessons help explain new ideas.</li></ul><p className="landing-demo-invite">Pick a subject and give it a try.</p></div>
        <PracticeSample />
      </section>

      <section className="landing-rewards" aria-labelledby="rewards-heading"><div className="landing-wrap">
        <div className="landing-section-heading"><span className="landing-kicker">Their effort becomes something they can see</span><h2 id="rewards-heading">First, a little practice.<br/>Then, a world of their own.</h2><p>Questions earn tokens. Lessons earn tokens, too. Kids choose what to collect and make their favorite world a little more theirs.</p></div>
        <RewardWorlds />
        <p className="landing-effort"><Check />Effort counts. Mistakes earn practice tokens, too.</p>
      </div></section>

      <section className="landing-section landing-wrap landing-parent" aria-labelledby="parents-heading">
        <div className="landing-parent-preview" aria-label="Illustrative parent dashboard example">
          <div className="landing-parent-preview-top"><span>Parent view</span><span>Illustrative example</span></div>
          <h3>A clearer next step.</h3><p className="landing-parent-subtitle">See the skills behind the subject.</p>
          <div className="landing-progress-row"><div><strong>Addition</strong><span>Math</span></div><span className="landing-status-strong">Going well</span></div>
          <div className="landing-progress-row"><div><strong>Story details</strong><span>Reading</span></div><span className="landing-status-building">Keep building</span></div>
          <div className="landing-progress-row"><div><strong>Fractions</strong><span>Math</span></div><span className="landing-status-support">Try with help</span></div>
          <div className="landing-next-step"><span>Your next practice together</span><strong>Make fractions something they can see.</strong><p>Fold a piece of paper into equal parts. Ask your child to show one half.</p></div>
        </div>
        <div><span className="landing-kicker">Fun for them. Useful for you.</span><h2 id="parents-heading">Know what’s clicking.<br/>Know where to help.</h2><p className="landing-body">Go beyond “How was practice?” See what your child is working on, where they’re getting comfortable, and which skills could use a little support.</p><ul className="landing-checklist"><li><Check />A closer look at progress by subject and skill.</li><li><Check />Practice snapshots that distinguish independent answers from answers with help.</li><li><Check />Simple suggestions for what to practice together next.</li></ul><Link href="/signup" className="landing-text-link">Start your family’s journey <Arrow /></Link></div>
      </section>

      <section id="how-it-works" className="landing-setup"><div className="landing-wrap">
        <div className="landing-section-heading"><span className="landing-kicker">One family. Their own adventures.</span><h2>A simple start for everyone.</h2></div>
        <ol className="landing-steps"><li><span>1</span><h3>You create the family account.</h3><p>Add your child, choose their grade, and set up a username and PIN.</p></li><li><span>2</span><h3>They practice and collect.</h3><p>Kids open their own space for questions, lessons, and rewards.</p></li><li><span>3</span><h3>You see what comes next.</h3><p>Check their progress and find a small next step to work on together.</p></li></ol>
        <div className="landing-login-panel"><div><h3>Already part of SunSharp?</h3><p>Choose your login to pick up where you left off.</p></div><Link href="/kids"><strong>Kids log in <Arrow /></strong><span>My username &amp; PIN</span></Link><Link href="/login"><strong>Parents log in <Arrow /></strong><span>My email &amp; password</span></Link></div>
      </div></section>

      <section className="landing-section landing-wrap landing-faq" aria-labelledby="faq-heading"><div><span className="landing-kicker">Before your first adventure</span><h2 id="faq-heading">A few things<br/>parents ask.</h2><Link href="/pricing" className="landing-text-link">See pricing details <Arrow /></Link></div><div>{faqs.map(faq => <details key={faq.q}><summary>{faq.q}<span aria-hidden="true">+</span></summary><p>{faq.a}</p></details>)}</div></section>

      <section className="landing-final landing-wrap" aria-labelledby="final-heading"><div><span className="landing-kicker">Let’s find their next “I did it!”</span><h2 id="final-heading">Their next discovery<br/>starts with a little practice.</h2><p>Make space for learning, imagination, and a world they’re proud to build.</p><Link href="/signup" className="marketing-cta">{cta}<Arrow /></Link><p className="landing-offer">{offer}</p></div><div className="landing-final-art"><Image src="/images/ui/logo-sunbook.webp" alt="SunSharp’s friendly sun reading a book" fill sizes="(max-width: 700px) 140px, 280px" className="object-contain" /></div></section>
    </main>
  </>;
}
function Arrow() { return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h13m-5-5 5 5-5 5" /></svg>; }
function Check() { return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="currentColor" opacity=".12"/><path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
