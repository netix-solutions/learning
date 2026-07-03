// The avatar-shop starter catalog. Data only — safe to import from any script.
// generate-shop-art.mjs turns `subject` into artwork in public/shop/<slug>.png;
// seed-shop-items.mjs upserts the rows into shop_items.

export const CATALOG = [
  // slug, name, price (points), prompt subject
  { slug: "astro-cat", name: "Astro Cat", price: 150, subject: "an orange cat wearing a shiny white-and-blue astronaut helmet with stars reflected in the visor" },
  { slug: "dino-rex", name: "Dino Rex", price: 150, subject: "a happy green T-rex dinosaur with tiny arms and a big friendly grin" },
  { slug: "mermaid-star", name: "Mermaid Star", price: 150, subject: "a smiling mermaid kid with teal hair and a starfish hairclip" },
  { slug: "robo-buddy", name: "Robo Buddy", price: 200, subject: "a round friendly robot with glowing cyan eyes and a little antenna with a light" },
  { slug: "unicorn-sparkle", name: "Sparkle", price: 200, subject: "a white unicorn with a rainbow mane and a golden horn, surrounded by tiny sparkles" },
  { slug: "ninja-frog", name: "Ninja Frog", price: 200, subject: "a green frog wearing a red ninja headband, looking determined and cute" },
  { slug: "surf-shark", name: "Surf Shark", price: 250, subject: "a cool blue shark wearing sunglasses with a tiny surfboard, summer vibes" },
  { slug: "wizard-owl", name: "Wizard Owl", price: 250, subject: "a wise little owl wearing a purple wizard hat with silver stars" },
  { slug: "pirate-parrot", name: "Pirate Parrot", price: 250, subject: "a colorful parrot wearing a tiny pirate hat and a golden earring" },
  { slug: "dragon-ember", name: "Ember", price: 300, subject: "a small friendly red dragon with tiny wings puffing a heart-shaped smoke puff" },
  { slug: "space-pup", name: "Space Pup", price: 300, subject: "a corgi puppy floating in a bubble space helmet with a planet in the background" },
  { slug: "queen-bee", name: "Queen Bee", price: 300, subject: "a cheerful bee wearing a tiny golden crown, with sparkly wings" },
  // Wave 2 — snake, turtle, and the Florida wildlife crew.
  { slug: "slither-sam", name: "Slither Sam", price: 150, subject: "a friendly green snake with big happy eyes, coiled in a cute spiral with its head up and a little tongue out" },
  { slug: "shelly-turtle", name: "Shelly", price: 150, subject: "a smiling turtle with a colorful patterned shell and rosy cheeks" },
  { slug: "pete-pelican", name: "Pete Pelican", price: 150, subject: "a goofy happy pelican with a big orange beak and a tiny sailor hat" },
  { slug: "gecko-splash", name: "Splash", price: 150, subject: "a bright green gecko with big curious eyes hanging on playfully" },
  { slug: "bella-butterfly", name: "Bella", price: 150, subject: "a beautiful butterfly with big rainbow wings and a sweet smiling face" },
  { slug: "flo-flamingo", name: "Flo Flamingo", price: 200, subject: "a pink flamingo wearing heart-shaped sunglasses, striking a sassy pose" },
  { slug: "ollie-octopus", name: "Ollie", price: 200, subject: "a purple octopus juggling seashells with a big happy grin" },
  { slug: "luna-sloth", name: "Luna Sloth", price: 200, subject: "a sleepy smiling sloth hugging a branch with a tiny flower tucked behind its ear" },
  { slug: "rascal-raccoon", name: "Rascal", price: 200, subject: "a mischievous cute raccoon with a masked face and a playful grin" },
  { slug: "gator-gus", name: "Gator Gus", price: 250, subject: "a friendly green alligator with a huge toothy smile wearing a backwards baseball cap" },
  { slug: "dottie-dolphin", name: "Dottie", price: 250, subject: "a joyful dolphin leaping with a splash of sparkly water droplets" },
  { slug: "sunny-seaturtle", name: "Sunny", price: 300, subject: "a sea turtle wearing a snorkel mask, gliding with flippers spread wide and bubbles around" },
  { slug: "manny-manatee", name: "Manny Manatee", price: 300, subject: "a gentle round manatee with kind eyes, hugging a small seagrass bouquet" },
  { slug: "florida-panther", name: "Florida Panther", price: 400, subject: "a majestic tan panther with bright golden eyes and a confident heroic smile, epic and rare-looking" },
  // Summer Splash — limited-time seasonal drop (gone after July).
  { slug: "popsicle-yeti", name: "Popsicle Yeti", price: 250, until: "2026-07-31T23:59:59Z", subject: "a fluffy white yeti happily licking a giant rainbow popsicle, tiny snowflakes sparkling around it" },
  { slug: "sandy-crab", name: "Sandy Crab", price: 200, until: "2026-07-31T23:59:59Z", subject: "a happy orange crab wearing an upside-down sandcastle bucket as a hat, holding a tiny shovel" },
  { slug: "snorkel-puppy", name: "Snorkel Puppy", price: 300, until: "2026-07-31T23:59:59Z", subject: "a golden retriever puppy wearing a snorkel mask underwater with sparkling bubbles around it" },
];

// Shared style so the whole catalog looks like one matched set — and matches
// the app's existing flat, friendly SVG avatars.
export const AVATAR_STYLE = [
  "Cute flat vector-style illustration for a children's learning app avatar.",
  "A single friendly character's head and shoulders, centered, facing forward,",
  "big expressive eyes, soft rounded shapes, bold clean outlines,",
  "on a solid pastel circular background that fills the square frame.",
  "Bright cheerful colors. No text, no watermark, no photorealism.",
].join(" ");
