import Image from 'next/image';

/** An illustrated invitation and a static practice example, not a live quiz. */
export function HeroAdventure() {
  return <figure className="hero-adventure">
    <div className="hero-adventure-scene">
      <Image
        src="/images/ui/sunsharp-adventure-hero.webp"
        alt="A storybook adventure with children riding a green train, a friendly dinosaur, a flower garden, a little bakery, and SunSharp’s green-eyed sun."
        fill
        preload
        sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1152px) 53vw, 600px"
        className="object-cover"
      />
    </div>
    <figcaption className="hero-practice-preview">
      <div className="hero-preview-heading"><span>Practice preview</span><span className="hero-preview-token"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.7"/><path d="m10 5 1.5 3 3.5.5-2.5 2.4.6 3.5-3.1-1.6-3.1 1.6.6-3.5L5 8.5 8.5 8 10 5Z" fill="currentColor"/></svg>1 token earned</span></div>
      <strong className="hero-preview-question">What comes next?</strong>
      <div className="hero-preview-pattern" aria-label="2, 4, 6, 8. Correct: count by twos."><span>2</span><span>4</span><span>6</span><span className="hero-preview-answer">8<svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span></div>
      <span className="hero-preview-feedback">You found the pattern!</span>
    </figcaption>
  </figure>;
}
