"use client";

/**
 * A collectible trading card. Renders a framed card (rarity decides the frame
 * and whether it has a holo foil), with a front (the character art + name +
 * card number) and a back (a branded card back + a fun fact). Pass `flipped`
 * to show the back; `faceDown` renders it as an un-flippable mystery back for
 * cards the kid hasn't collected yet.
 */

export type CardData = {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  rarity: string;
  collection: string;
  number?: number; // position within its set (1-based)
  total?: number; // set size
  fact?: string;
};

export function rarityCard(r: string) {
  switch (r) {
    case "shiny":
      return { label: "Holo", frame: "border-amber-400", banner: "bg-amber-100 text-amber-800", glow: "shadow-amber-300/60", foil: true };
    case "epic":
      return { label: "Epic", frame: "border-violet-400", banner: "bg-violet-100 text-violet-800", glow: "shadow-violet-300/40", foil: false };
    case "rare":
      return { label: "Rare", frame: "border-sky-400", banner: "bg-sky-100 text-sky-800", glow: "shadow-sky-300/40", foil: false };
    default:
      return { label: "Common", frame: "border-slate-300", banner: "bg-slate-100 text-slate-600", glow: "shadow-slate-300/30", foil: false };
  }
}

/** The branded reverse of every card (also the mystery look for uncollected). */
function CardBack({ mystery = false }: { mystery?: boolean }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center rounded-xl border-4 border-white/70 text-white"
      style={{ background: "radial-gradient(circle at 30% 20%, #60a5fa, #6366f1 60%, #7c3aed)" }}
    >
      <span className="text-3xl drop-shadow">{mystery ? "❓" : "☀️"}</span>
      <span className="mt-1 text-center font-display text-[0.6rem] font-extrabold uppercase leading-tight tracking-wider">
        SummerSharp
        <br />
        Cards
      </span>
    </div>
  );
}

function CardFront({ card }: { card: CardData }) {
  const rc = rarityCard(card.rarity);
  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-xl border-4 bg-white ${rc.frame}`}
    >
      {/* name banner */}
      <div className={`flex items-center justify-between gap-1 px-1.5 py-0.5 ${rc.banner}`}>
        <span className="truncate font-display text-[0.62rem] font-extrabold leading-tight">
          {card.name}
        </span>
        {rc.foil ? (
          <span className="shrink-0 text-[0.55rem] font-extrabold">✦</span>
        ) : null}
      </div>

      {/* art window */}
      <div className="relative flex-1 p-1">
        <div className="h-full w-full overflow-hidden rounded-md ring-1 ring-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image_url} alt={card.name} className="h-full w-full object-cover" />
        </div>
        {rc.foil && <div className="card-foil pointer-events-none absolute inset-1 rounded-md" />}
      </div>

      {/* footer: rarity + card number */}
      <div className="flex items-center justify-between px-1.5 pb-1 text-[0.5rem] font-bold">
        <span
          className={`rounded-full px-1.5 py-0.5 uppercase tracking-wide ${rc.banner}`}
        >
          {rc.label}
        </span>
        {card.number != null && card.total != null && (
          <span className="text-slate-400">
            #{card.number}/{card.total}
          </span>
        )}
      </div>
    </div>
  );
}

/** Pack-opening card: starts as a mystery back, flips to reveal the front. */
export function RevealCard({
  card,
  flipped,
  className = "",
}: {
  card: CardData;
  flipped: boolean;
  className?: string;
}) {
  const rc = rarityCard(card.rarity);
  return (
    <div className={`card-flip aspect-[3/4] ${className}`}>
      <div className={`card-flip-inner ${flipped ? "flipped" : ""} rounded-xl shadow-lg ${rc.glow}`}>
        <div className="card-face">
          <CardBack />
        </div>
        <div className="card-face card-face-back">
          <CardFront card={card} />
        </div>
      </div>
    </div>
  );
}

export function TradingCard({
  card,
  faceDown = false,
  flipped = false,
  className = "",
}: {
  card: CardData;
  /** Uncollected mystery card (shows the back, no flip). */
  faceDown?: boolean;
  /** Show the info back (only meaningful when collected). */
  flipped?: boolean;
  className?: string;
}) {
  const rc = rarityCard(card.rarity);

  if (faceDown) {
    return (
      <div className={`aspect-[3/4] ${className}`}>
        <CardBack mystery />
      </div>
    );
  }

  return (
    <div className={`card-flip aspect-[3/4] ${className}`}>
      <div className={`card-flip-inner ${flipped ? "flipped" : ""} rounded-xl shadow-lg ${rc.glow}`}>
        <div className="card-face">
          <CardFront card={card} />
        </div>
        <div className="card-face card-face-back">
          {/* Info back: branded panel + the fun fact. */}
          <div
            className={`flex h-full w-full flex-col rounded-xl border-4 bg-white ${rc.frame}`}
          >
            <div className={`px-2 py-0.5 text-center font-display text-[0.62rem] font-extrabold ${rc.banner}`}>
              {card.name}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-1 p-2 text-center">
              <span className="text-2xl">💡</span>
              <p className="text-[0.62rem] font-semibold leading-snug text-slate-600">
                {card.fact ?? "A one-of-a-kind SummerSharp card!"}
              </p>
            </div>
            <div className="px-2 pb-1 text-center text-[0.5rem] font-bold uppercase tracking-wide text-slate-400">
              {card.collection} · #{card.number}/{card.total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
