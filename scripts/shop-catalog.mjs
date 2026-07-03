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
