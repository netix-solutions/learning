import Image from 'next/image';
import type { TrainCarId } from '@/lib/train';

// Align the generated wheel baselines without stretching the vehicles.
const wheelOffset = { engine: 0, passenger: 4.2, cargo: 0, aquarium: -2, garden: -3.8, observatory: -0.5, caboose: 0 };
export function TrainArt({ kind }: { kind: TrainCarId | 'engine'; friendly?: boolean }) {
  return (
    <div aria-hidden="true" className="relative aspect-[3/2] w-full">
      <Image
        src={`/images/train/${kind}.webp`}
        alt=""
        fill
        sizes="(max-width: 640px) 220px, 280px"
        className="pointer-events-none select-none object-contain"
        style={{ transform: `translateY(${wheelOffset[kind]}%)` }}
      />
    </div>
  );
}
