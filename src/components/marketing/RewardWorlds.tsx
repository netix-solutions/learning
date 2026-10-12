'use client';
import Image from 'next/image';
import { useState } from 'react';
import { TrainArt } from '@/components/TrainArt';
const worlds = [
  { id: 'train', name: 'Railway', title: 'All aboard their imagination.', copy: 'Collect engines and carriages, rearrange the train, and take it for a quiet ride.', scene: '/images/dinosaurs/railway.webp', art: '/images/train/engine.webp', extra: '/images/train/passenger.webp', alt: 'A collected steam engine and passenger carriage in a sunny railway scene' },
  { id: 'garden', name: 'Garden', title: 'Watch a little effort bloom.', copy: 'Practice and lessons grow flowers. Build a colorful garden, then play a flower-finding game.', scene: '/images/garden/garden-bed.webp', art: '/images/garden/sunflower.webp', extra: '/images/garden/tulip.webp', alt: 'Sunflowers and tulips in a learning garden' },
  { id: 'dinosaurs', name: 'Dinosaurs', title: 'Make room for a new favorite.', copy: 'Save practice tokens for dinosaurs and arrange a prehistoric collection of their own.', scene: '/images/dinosaurs/habitat.webp', art: '/images/dinosaurs/triceratops.webp', extra: '/images/dinosaurs/brachiosaurus.webp', alt: 'A triceratops and brachiosaurus in a prehistoric habitat' },
  { id: 'bakery', name: 'Bakery', title: 'A shelf full of “I earned that.”', copy: 'Collect donuts, cupcakes and more. Use those treats to fill picture orders in a pretend bakery.', scene: '/images/bakery/bakery-shelf.webp', art: '/images/bakery/cupcake.webp', extra: '/images/bakery/donut.webp', alt: 'A cupcake and sprinkle donut on a bakery shelf' },
] as const;
export function RewardWorlds() {
  const [selected, setSelected] = useState(0);
  const world = worlds[selected];
  return <div className="landing-worlds" data-silent-click>
    <div className="landing-world-tabs" role="group" aria-label="Explore reward worlds">{worlds.map((item, index) => <button key={item.id} aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.name}</button>)}</div>
    <div className="landing-world-stage" data-world={world.id}>
      <div className="landing-world-picture" role="img" aria-label={world.alt}>
        <Image src={world.scene} alt="" fill sizes="(max-width: 700px) 100vw, 680px" className="object-cover" />
        {world.id === 'train' ? <div className="landing-world-train"><div><TrainArt kind="engine" /></div><div><TrainArt kind="passenger" /></div></div> : <>
          <div className="landing-world-object landing-world-object-main"><Image src={world.art} alt="" fill sizes="360px" className="object-contain" /></div>
          <div className="landing-world-object landing-world-object-extra"><Image src={world.extra} alt="" fill sizes="260px" className="object-contain" /></div>
        </>}
      </div>
      <div className="landing-world-copy" aria-live="polite"><span className="landing-small-label">Their {world.name.toLowerCase()}</span><h3>{world.title}</h3><p>{world.copy}</p><span className="landing-world-note">Switch worlds anytime. Their collections stay saved.</span></div>
    </div>
  </div>;
}
