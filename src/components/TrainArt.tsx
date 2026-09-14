import Image from 'next/image';
import type { TrainCarId, TrainEngineId } from '@/lib/train';

// Align the generated wheel baselines without stretching the vehicles.
const wheelOffset: Partial<Record<TrainCarId | TrainEngineId, number>> = { engine: 0, 'passenger-engine': 8, 'bullet-engine': 13, 'diesel-engine': 8, dining: 8, sleeper: 9, 'bullet-coach': 14, tanker: -1, 'log-flatcar': 7, passenger: 4.2, cargo: 0, aquarium: -2, garden: -3.8, observatory: -0.5, caboose: 0 };
export function TrainArt({ kind }: { kind: TrainCarId | TrainEngineId; friendly?: boolean }) {
  return (
    <div aria-hidden="true" className="relative aspect-[3/2] w-full">
      <Image
        src={`/images/train/${kind}.webp`}
        alt=""
        fill
        unoptimized
        sizes="(max-width: 640px) 220px, 280px"
        className="pointer-events-none select-none object-contain"
        style={{ transform: `translateY(${wheelOffset[kind] ?? 0}%)` }}
      />
    </div>
  );
}
