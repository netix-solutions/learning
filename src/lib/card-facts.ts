// Card flavor: a short, kid-friendly fun fact shown on the back of each card.
// Real animals get a real fact (a little sneaky learning); made-up characters
// get playful flavor. Keyed by the item slug.

export const CARD_FACTS: Record<string, string> = {
  // Ocean Pals
  "mermaid-star": "Sings songs that make the waves dance!",
  "pete-pelican": "A pelican's beak can hold more than its belly!",
  "shelly-turtle": "Some turtles can live to be over 100 years old!",
  "ollie-octopus": "An octopus has three hearts and blue blood!",
  "sandy-crab": "Crabs walk sideways across the sand.",
  "dottie-dolphin": "Dolphins call each other by name using whistles!",
  "surf-shark": "A shark can grow thousands of teeth in its life!",
  "manny-manatee": "Manatees are gentle giants nicknamed 'sea cows.'",
  "snorkel-puppy": "Loves diving down to find shiny seashells!",
  "sunny-seaturtle": "Baby sea turtles race to the ocean by moonlight.",

  // Animal Friends
  "bella-butterfly": "Butterflies taste with their feet!",
  "gecko-splash": "Geckos can climb straight up a glass window!",
  "slither-sam": "Snakes smell the air with their tongues!",
  "ninja-frog": "A frog can leap 20 times its own body length!",
  "luna-sloth": "Sloths can sleep up to 15 hours a day.",
  "rascal-raccoon": "Raccoons like to wash their food before eating!",
  "gator-gus": "Alligators have been around since the dinosaurs!",
  "queen-bee": "One beehive can be home to 50,000 bees!",
  "flo-flamingo": "Flamingos turn pink from the shrimp they eat!",
  "florida-panther": "The rare Florida state animal — and super fast!",

  // Space & Magic
  "astro-cat": "Dreams of taking a nap on the moon.",
  "robo-buddy": "Beeps a happy little tune when you get one right!",
  "space-pup": "Fetches shooting stars way out in space!",
  "unicorn-sparkle": "Leaves a trail of rainbow sparkles everywhere!",
  "wizard-owl": "The wisest owl in the whole enchanted forest.",
  "dragon-ember": "Breathes tiny puffs of heart-shaped smoke!",
  "popsicle-yeti": "Stays cool with a giant rainbow popsicle!",
  "pirate-parrot": "Knows where the treasure is buried… maybe!",
  "dino-rex": "Tiny arms, but a GIANT friendly smile!",
};

export const CARD_ALBUMS: { key: string; name: string; emoji: string }[] = [
  { key: "ocean", name: "Ocean Pals", emoji: "🌊" },
  { key: "animals", name: "Animal Friends", emoji: "🐾" },
  { key: "spacemagic", name: "Space & Magic", emoji: "🚀" },
  { key: "extras", name: "Extras", emoji: "✨" },
];

export function albumMeta(key: string) {
  return CARD_ALBUMS.find((a) => a.key === key) ?? { key, name: key, emoji: "🃏" };
}
