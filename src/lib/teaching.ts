// Per-skill "how it works" teaching used to re-teach a kid right after a miss.
// Keyed by the internal skill tag (questions.skill, e.g. "3.muldiv"). Authored,
// deterministic content — no LLM in the child's path. Pair this general method
// with the question's own `explanation` (the worked solution) when re-teaching.

export type SkillTeach = { title: string; tip: string };

export const SKILL_TEACH: Record<string, SkillTeach> = {
  // ---- Math ----
  "K.count": { title: "Counting", tip: "Touch each thing once and say one number as you go: 1, 2, 3. The last number you say is how many there are." },
  "K.compare": { title: "Bigger & smaller", tip: "The number you count to later is bigger. 7 comes after 4 when you count, so 7 is bigger than 4." },
  "K.addsub": { title: "Adding & taking away", tip: "To add, start at one number and count up. To take away, count backward. Your fingers can help!" },
  "K.shape": { title: "Shapes", tip: "Count the straight sides to name a shape: a triangle has 3, a square 4, a pentagon 5, a hexagon 6." },
  "1.addsub": { title: "Add & subtract to 20", tip: "Make a 10 first. For 8 + 5, move 2 from the 5 to make 8 into 10, then add the 3 left over: 13." },
  "1.place": { title: "Tens & ones", tip: "In a two-digit number, the left digit is tens and the right is ones. In 27, the 2 means 2 tens (20) and the 7 means 7 ones." },
  "1.compare": { title: "Greater than & less than", tip: "The < and > signs always open toward the bigger number and point at the smaller one. 6 < 9." },
  "1.shape": { title: "Shapes & sides", tip: "Name a 2-D shape by its number of straight sides: triangle 3, square/rectangle 4, pentagon 5, hexagon 6, octagon 8." },
  "2.addsub": { title: "Two-digit add & subtract", tip: "Add the tens and the ones separately, then put them together. 45 + 38 → 70 and 13 → 83." },
  "2.place": { title: "Place value", tip: "Each place is worth 10 times the place to its right: ones, tens, hundreds. In 437 the 4 means 400." },
  "2.skip": { title: "Skip counting", tip: "Add the same amount every time. Counting by 5s: 5, 10, 15, 20 — just keep adding 5." },
  "3.muldiv": { title: "Multiply & divide", tip: "Multiplying is repeated adding: 7 × 6 means 7 groups of 6. Dividing splits into equal groups: 56 ÷ 8 asks how many 8s make 56." },
  "3.perim": { title: "Perimeter", tip: "Perimeter is the distance all the way around. Add up every side. For a rectangle: 2 × (length + width)." },
  "3.frac": { title: "Comparing fractions", tip: "With the same whole, a smaller bottom number means bigger pieces. 1/2 is bigger than 1/4." },
  "3.round": { title: "Rounding", tip: "Look at the digit just to the right. 5 or more rounds up; less than 5 rounds down. 268 to the nearest hundred is 300." },
  "3.area": { title: "Area of a rectangle", tip: "Area = length × width. Count the squares inside, or multiply the two sides: 4 × 3 = 12 square cm." },
  "4.mul": { title: "Multiplying bigger numbers", tip: "Break the number apart. 23 × 4 → (20 × 4) + (3 × 4) = 80 + 12 = 92." },
  "4.frac": { title: "Equivalent fractions", tip: "Multiply (or divide) the top and bottom by the same number. 1/2 = 3/6 because both were multiplied by 3." },
  "4.place": { title: "Place value to thousands", tip: "Each place is 10× the one to its right: ones, tens, hundreds, thousands. In 6,420 the 6 means 6,000." },
  "4.dec": { title: "Decimals & fractions", tip: "The first place after the dot is tenths. 0.7 means 7 tenths, which is 7/10." },
  "4.factor": { title: "Factors & multiples", tip: "Factors are numbers that multiply to make another number (3 × 8 = 24). A multiple is what you get counting by a number: 24 is a multiple of 3 because 3 × 8 = 24." },
  "4.div": { title: "Division", tip: "Division splits a total into equal groups. 144 ÷ 12 asks 'how many 12s make 144?' — and 12 × 12 = 144, so the answer is 12." },
  "5.dec": { title: "Decimal math", tip: "Line up the dots, then add or subtract as usual: 0.40 + 0.35 = 0.75. Multiplying by 10 moves the dot one place right." },
  "5.frac": { title: "Adding fractions", tip: "Make the bottoms match first. 1/2 + 1/4 → change 1/2 to 2/4, then 2/4 + 1/4 = 3/4." },
  "5.order": { title: "Order of operations", tip: "Do multiplication and division before adding and subtracting. 3 + 4 × 2 → 4 × 2 = 8 first, then 3 + 8 = 11." },
  "5.volume": { title: "Volume", tip: "Volume = length × width × height. A 2 × 3 × 4 box holds 2 × 3 × 4 = 24 cubes." },

  // ---- Reading ----
  "K.sound": { title: "Letter sounds & rhymes", tip: "Say the word slowly and listen to the sounds. Words rhyme when they end the same — cat and hat both end in “-at.”" },
  "K.print": { title: "About words", tip: "Letters build words. Count the letters one at a time: d-o-g has 3 letters." },
  "1.phon": { title: "Vowel sounds", tip: "Short vowels say a quick sound (a in “map”); long vowels say their name (a in “cake”). Say it out loud to hear which one." },
  "1.cloze": { title: "Fill in the blank", tip: "Read the whole sentence, then pick the word that both makes sense and sounds right." },
  "1.vocab": { title: "Word meanings", tip: "Think about what the word means. Antonyms are opposites — the opposite of “big” is “small.”" },
  "1.read": { title: "Understanding a story", tip: "Read carefully and look back at the words. The answer is right there in what the story tells you." },
  "2.vocab": { title: "Synonyms, antonyms & prefixes", tip: "Synonyms mean the same (happy/glad); antonyms are opposites (fast/slow). A prefix changes meaning: “re-” means again." },
  "2.main": { title: "Main idea", tip: "The main idea is what the whole passage is mostly about — not just one small detail." },
  "2.foundation": { title: "Syllables & contractions", tip: "Clap the word to count syllables (rab-bit = 2). A contraction joins two words with an apostrophe: do not → don’t." },
  "3.fig": { title: "Figurative language", tip: "A simile compares using “like” or “as.” A metaphor says one thing IS another. Personification gives human actions to things." },
  "3.vocab": { title: "Vocabulary in context", tip: "Use the other words in the sentence as clues to figure out what a new word means." },
  "3.detail": { title: "Supporting details", tip: "Details are the small facts that tell you more about the main idea. Look back in the text to find them." },
  "3.grammar": { title: "Parts of speech", tip: "A noun is a person, place, or thing. A verb is an action. An adjective describes something." },
  "4.theme": { title: "Theme", tip: "The theme is the lesson or message of the story — what the characters (and you) learn by the end." },
  "4.vocab": { title: "Prefixes & suffixes", tip: "Word parts change meaning. “-less” means without (fearless = without fear); “re-” means again." },
  "4.purpose": { title: "Author’s purpose", tip: "Ask why the author wrote it: to inform (teach facts), to persuade (convince you), or to entertain." },
  "5.fig": { title: "Figurative language", tip: "Notice how the words paint a picture. Personification gives human traits to non-human things (“the wind whispered”)." },
  "5.infer": { title: "Making inferences", tip: "An inference is a smart guess using clues in the text plus what you already know — even when it isn’t stated directly." },
  "5.vocab": { title: "Vocabulary in context", tip: "Use the sentence around a tricky word as clues to its meaning." },
  "5.grammar": { title: "Grammar", tip: "Watch pronouns and homophones: use “He and I” as subjects; they’re = they are, their = belongs to them, there = a place." },

  // ---- Science ----
  "K.senses": { title: "The five senses", tip: "We explore the world with five senses: see (eyes), hear (ears), smell (nose), taste (tongue), and touch (skin)." },
  "K.livingnonliving": { title: "Living & non-living", tip: "Living things grow and need food, water, and air. Non-living things — like rocks and toys — do not grow or eat." },
  "K.weather": { title: "Weather", tip: "Weather is what the sky and air are doing: sunny, rainy, windy, or snowy. Clouds are made of tiny drops of water." },
  "K.daynight": { title: "Day & night", tip: "Earth spins like a top. The side facing the sun has daytime; the side turned away has night." },
  "K.pushpull": { title: "Pushes & pulls", tip: "A push moves something away from you; a pull brings it toward you. Both are forces that make things move." },
  "K.animalneeds": { title: "What animals need", tip: "Every animal needs food, water, air, and a safe place (shelter) to live." },
  "1.plants": { title: "Plant parts", tip: "Each part has a job: roots drink water, the stem holds the plant up, leaves make food from sunlight, and flowers make seeds." },
  "1.animalbabies": { title: "Animal babies", tip: "Baby animals usually look like their parents and often have special names: dog→puppy, cat→kitten, cow→calf, frog→tadpole." },
  "1.seasons": { title: "Seasons", tip: "A year has four seasons: spring (plants grow), summer (warm), fall (leaves drop), and winter (cold)." },
  "1.shadow": { title: "Light & shadow", tip: "A shadow forms when a solid object blocks light. Light travels in straight lines, so the blocked spot is dark." },
  "1.materials": { title: "Materials", tip: "Objects are made of materials with different properties: metal is hard, glass is clear, cloth is soft, wood floats." },
  "1.sky": { title: "The sky", tip: "The sun (a star) lights the day; the moon and stars appear at night. The moon shines by reflecting the sun's light." },
  "2.matter": { title: "States of matter", tip: "Matter has three states: solid (keeps its shape), liquid (pours), and gas (spreads out). Heating and cooling can change the state." },
  "2.lifecycle": { title: "Life cycles", tip: "Living things change as they grow. A butterfly goes egg → caterpillar → chrysalis → butterfly." },
  "2.magnets": { title: "Magnets", tip: "Magnets pull on iron and steel — not plastic, wood, or paper. Two magnets can attract (pull) or repel (push)." },
  "2.weather": { title: "Measuring weather", tip: "We use tools to measure weather: a thermometer for temperature and a weather vane for wind direction. Weather changes day to day." },
  "2.habitats": { title: "Habitats", tip: "A habitat is an animal's home that gives it food, water, and shelter. Animals live where they fit best (fish→water, camel→desert)." },
  "3.watercycle": { title: "The water cycle", tip: "The sun evaporates water into vapor → it condenses into clouds → it falls as precipitation (rain/snow) → it collects in rivers and lakes." },
  "3.energy": { title: "Forms of energy", tip: "Energy comes in forms — light, heat, sound, and electrical. The sun gives light and heat; a drum makes sound." },
  "3.forces": { title: "Forces & motion", tip: "A force is a push or pull that changes how something moves. Gravity pulls things down; friction slows them." },
  "3.matterchange": { title: "Changing matter", tip: "Heating and cooling change matter's state (water ↔ ice ↔ steam). Melting and freezing can be reversed." },
  "3.soilrocks": { title: "Soil & rocks", tip: "Soil is made of broken-down rock and rotted plants. Over a long time, wind and water break rocks apart — that's weathering." },
  "4.circuits": { title: "Circuits", tip: "Electricity needs a complete path: a battery for energy, wires (conductors), and a switch. Break the path and the bulb goes out." },
  "4.energytransfer": { title: "Energy transfer", tip: "Energy moves and changes form. Heat flows from hot to cold; a lamp changes electrical energy into light and heat." },
  "4.weatherclimate": { title: "Weather vs. climate", tip: "Weather is what's happening now; climate is the usual pattern over many years. Places near the equator stay warm." },
  "4.moon": { title: "Moon phases", tip: "The moon reflects sunlight. As it orbits Earth (about a month), we see different amounts lit — its phases, from new moon to full moon." },
  "4.adaptations": { title: "Adaptations", tip: "An adaptation is a feature that helps a living thing survive: thick fur for cold, a cactus storing water, gills for breathing underwater." },
  "5.solar": { title: "The solar system", tip: "The Sun (a star) is at the center; planets orbit it. Earth is our planet, Jupiter is the largest, and Mars is the Red Planet." },
  "5.matter": { title: "Matter & changes", tip: "All matter is made of tiny particles. A physical change (melting) keeps the same substance; a chemical change (burning) makes a new one. Mass stays the same." },
  "5.forcemotion": { title: "Force & motion", tip: "Forces (pushes and pulls) change an object's speed or direction. Gravity pulls down, friction resists motion, and heavier things need more force." },
  "5.foodweb": { title: "Food webs", tip: "Energy flows from the Sun → producers (plants) → consumers (herbivores, then carnivores) → decomposers, which return nutrients to the soil." },
  "5.body": { title: "Body systems", tip: "Your body has systems: the heart pumps blood, lungs take in oxygen, the brain leads the nervous system, bones support you, and the digestive system breaks down food." },
  "5.watercycle": { title: "The water cycle", tip: "Powered by the Sun, water cycles forever: evaporation (liquid→vapor), condensation (vapor→clouds), precipitation (rain/snow), then collection." },
};

export function teachFor(skill?: string | null): SkillTeach | null {
  return skill ? SKILL_TEACH[skill] ?? null : null;
}

/** Parent-facing standing for a skill the child has actually attempted. */
export type SkillStanding = "strong" | "building" | "focus";

/**
 * Classify an attempted skill for the parent view. Derived from the integer
 * counts (NOT the RPC's numeric `accuracy`, which is a 0–1 fraction that can
 * arrive as a string). `mastered` is "doing great"; a low hit-rate or a recent
 * miss flags it as something to focus on.
 */
export function skillStanding(m: {
  state: string;
  attempts: number;
  correct: number;
  last_correct: boolean;
}): SkillStanding {
  if (m.state === "mastered") return "strong";
  const rate = m.attempts > 0 ? m.correct / m.attempts : 0;
  if (!m.last_correct || rate < 0.6) return "focus";
  return "building";
}

/** Friendly title for a skill, falling back to a cleaned-up version of the code. */
export function skillTitle(skill: string): string {
  const authored = SKILL_TEACH[skill]?.title;
  if (authored) return authored;
  // e.g. "3.muldiv" -> "muldiv"; keep it readable rather than showing the code raw.
  return skill.replace(/^[A-Za-z0-9]+\./, "").replace(/[_-]+/g, " ");
}
