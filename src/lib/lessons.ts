import type { Grade } from "@/lib/types";

export type Lesson = {
  id: string;
  grade: Grade;
  subject: "reading" | "math" | "science";
  title: string;
  preparation?: string;
  prerequisiteIds?: string[];
  benchmark?: { code: string; source: string; scope: string };
  goal: string;
  steps: [string, string, string];
  model: string[];
  check: { prompt: string; choices: string[]; answer: number; explanation: string };
  transfer: { prompt: string; choices: string[]; answer: number; explanation: string };
  reflect: string;
};

// Authored introductory lessons, not a claim of complete benchmark coverage.
// Models and guided checks are deliberately separate from transfer questions.
export const LESSONS: Lesson[] = [
  {
    id: "PK-count", grade: "PK", subject: "math", title: "One touch, one number",
    goal: "Count a small group without missing or counting anything twice.",
    steps: ["Put things in a row. Start at one end.", "Touch each thing once. Say one number for each touch.", "The last number tells how many things are in the group."],
    model: ["●", "● ●", "● ● ●"],
    check: { prompt: "Count these dots: ● ● ●", choices: ["2", "3", "4"], answer: 1, explanation: "Touch and count: one, two, three. There are 3 dots." },
    transfer: { prompt: "Count this new group: ● ● ● ●", choices: ["4", "3", "5"], answer: 0, explanation: "One, two, three, four. The last number is 4." },
    reflect: "Find three safe things nearby. Put them in a row and count them."
  },
  {
    id: "K-add", grade: "K", subject: "math", title: "Put groups together",
    goal: "Show how adding joins two groups.",
    steps: ["Addition means putting groups together.", "Here are 2 dots. Join 1 more dot to them.", "Count the whole group: 1, 2, 3. We write 2 + 1 = 3."], model: ["● ●", "+ ●", "● ● ● = 3"],
    check: { prompt: "You have 3 blocks and add 1 block. How many now?", choices: ["2", "3", "4"], answer: 2, explanation: "Start with 3 and count one more: 4." },
    transfer: { prompt: "Join 2 shells and 3 shells. How many shells?", choices: ["6", "5", "4"], answer: 1, explanation: "Count on from 2: 3, 4, 5. There are 5 shells." },
    reflect: "Show someone an addition story using your fingers."
  },
  {
    id: "1-ten", grade: "1", subject: "math", title: "Make a friendly ten",
    goal: "Use a group of ten to add within 20.",
    steps: ["Ten is a helpful stopping place when we add.", "For 8 + 5, give 2 of the 5 to the 8. Now you have 10 and 3.", "10 + 3 = 13. Moving the counters did not change the total."], model: ["8 + 5", "8 + 2 + 3", "10 + 3 = 13"],
    check: { prompt: "For 9 + 4, give 1 to the 9. What is left from the 4?", choices: ["3", "4", "1"], answer: 0, explanation: "4 splits into 1 and 3. Then 10 + 3 = 13." },
    transfer: { prompt: "Use a ten to solve 7 + 5.", choices: ["11", "13", "12"], answer: 2, explanation: "Split 5 into 3 and 2. 7 + 3 = 10; 10 + 2 = 12." },
    reflect: "Explain why moving part of one group keeps the total the same."
  },
  {
    id: "2-place", grade: "2", subject: "math", title: "Trade ten ones",
    goal: "Explain regrouping using tens and ones.",
    steps: ["A ten is a bundle of 10 ones.", "For 27 + 15, combine 2 tens and 1 ten, then 7 ones and 5 ones.", "That is 3 tens and 12 ones. Trade 10 ones for a ten: 4 tens and 2 ones, or 42."], model: ["27 + 15", "3 tens + 12 ones", "4 tens + 2 ones = 42"],
    check: { prompt: "What is another name for 2 tens and 13 ones?", choices: ["23", "33", "213"], answer: 1, explanation: "Trade 10 of the 13 ones for a ten. You get 3 tens and 3 ones: 33." },
    transfer: { prompt: "What is 36 + 18?", choices: ["44", "514", "54"], answer: 2, explanation: "4 tens and 14 ones becomes 5 tens and 4 ones: 54." },
    reflect: "Explain what happens to 10 ones when you regroup."
  },
  {
    id: "3-groups", grade: "3", subject: "math", title: "See multiplication",
    goal: "Connect equal groups, repeated addition, and multiplication.",
    steps: ["Multiplication counts equal groups.", "Three groups of 4 means 4 + 4 + 4.", "We write 3 × 4 = 12. Three tells the number of groups; four tells the size of each group."], model: ["● ● ● ●", "● ● ● ●", "● ● ● ●"],
    check: { prompt: "Which expression shows 2 groups of 5?", choices: ["2 + 5", "5 − 2", "5 + 5"], answer: 2, explanation: "Each group has 5, so two groups are 5 + 5 = 10." },
    transfer: { prompt: "There are 4 bags with 3 apples in each. How many apples?", choices: ["12", "7", "16"], answer: 0, explanation: "3 + 3 + 3 + 3 = 12, so 4 × 3 = 12." },
    reflect: "Find equal groups nearby. Describe the number of groups and the size of each."
  },
  {
    id: "4-equivalent", grade: "4", subject: "math", title: "Same amount, new pieces",
    goal: "Explain why two fractions can name the same amount.",
    steps: ["Fractions compare equal parts of a whole. Use the same-sized whole when comparing.", "Shade 1 of 2 equal parts. Split every part in half.", "Now 2 of 4 equal parts are shaded. The amount stayed the same: 1/2 = 2/4."], model: ["■ □", "■ ■ □ □", "1/2 = 2/4"],
    check: { prompt: "Split each third in two. What fraction equals 2/3?", choices: ["2/6", "4/6", "3/4"], answer: 1, explanation: "Both the shaded parts and all the parts double: 2/3 = 4/6." },
    transfer: { prompt: "Which fraction equals 3/4?", choices: ["3/8", "4/5", "6/8"], answer: 2, explanation: "Multiply both the numerator and denominator by 2: 3/4 = 6/8." },
    reflect: "Why must both numbers change when you split every part into smaller pieces?"
  },
  {
    id: "5-decimal", grade: "5", subject: "math", title: "Line up the values",
    goal: "Add decimals by matching place values.",
    steps: ["Tenths must join tenths, and hundredths must join hundredths.", "For 1.25 + 0.40, line up the decimal points. Add 5 hundredths and 0 hundredths, then 2 tenths and 4 tenths.", "Add the ones. The sum is 1.65. Writing 0.4 as 0.40 keeps its value."], model: ["1.25", "+ 0.40", "= 1.65"],
    check: { prompt: "Why can we write 0.6 as 0.60?", choices: ["6 tenths equals 60 hundredths", "Zeros always make numbers larger", "6 equals 60"], answer: 0, explanation: "Each tenth contains 10 hundredths. 6 tenths is 60 hundredths." },
    transfer: { prompt: "What is 2.35 + 0.7?", choices: ["2.42", "3.05", "9.35"], answer: 1, explanation: "Use 0.70. 35 hundredths + 70 hundredths = 105 hundredths, so the sum is 3.05." },
    reflect: "Estimate your sum first. Explain why the exact answer makes sense."
  },
  {
    id: "PK-rhyme", grade: "PK", subject: "reading", title: "Listen for rhymes",
    goal: "Hear words that have the same ending sounds.",
    steps: ["Say cat. Now say hat. Listen to the ends of the words.", "Cat and hat rhyme. Their ending sounds match.", "Say cat and sun. Their ending sounds do not match."], model: ["cat · hat", "Same ending sounds", "cat · sun: different"],
    check: { prompt: "Say these words or listen. Which word rhymes with sun?", choices: ["cat", "run", "dog"], answer: 1, explanation: "Sun and run have the same ending sounds." },
    transfer: { prompt: "Which word rhymes with dog? Say the words or listen.", choices: ["log", "hat", "sun"], answer: 0, explanation: "Dog and log have matching ending sounds." },
    reflect: "With a grown-up, say a silly rhyme. Made-up rhyming words are welcome!"
  },
  {
    id: "K-blend", grade: "K", subject: "reading", title: "Slide sounds into a word",
    goal: "Blend the sounds in a simple word.",
    steps: ["Letters can stand for sounds. In mat, m says /m/, a says the short /a/, and t says /t/.", "Point to each letter. Say its sound, then slide the sounds together: mmm-aa-t, mat. Keep the /t/ short; do not add 'uh'.", "Read this sentence: A mat. Point to mat and blend it again."], model: ["m   a   t", "m → a → t", "mat"],
    check: { prompt: "Read: mat. Which letter is at the start?", choices: ["t", "a", "m"], answer: 2, explanation: "m is first. Start with /m/, then blend /a/ and /t/." },
    transfer: { prompt: "Blend s, a, t. Which word did you read? Try before listening.", choices: ["mat", "sat", "tap"], answer: 1, explanation: "The sounds /s/ /a/ /t/ blend into sat." },
    reflect: "Read aloud: Sam sat. A mat. Sam sat. Ask a grown-up to listen to your blending."
  },
  {
    id: "1-short-vowels", grade: "1", subject: "reading", title: "Read every sound",
    preparation: "This is a review for readers who know common consonant sounds and short vowel sounds. Ask a grown-up to help with any sound you do not know yet.",
    benchmark: { code: "ELA.1.F.1.3", source: "https://www.fldoe.org/core/fileparse.php/7539/urlt/elabeststandardsfinal.pdf", scope: "Review of short-vowel decoding as preparation for grade-one phonics. Not coverage of the full benchmark or an oral-reading assessment." },
    goal: "Read short words by looking through every letter, including the vowel.",
    steps: ["A vowel in the middle can change the whole word. Read mat. The a has the short vowel sound in apple. Blend the sounds from left to right.", "Now read sat. Change its a to i to make sit. The i has the short vowel sound in igloo. Blend from left to right to read sit.", "Read sat, sit, and sip. In sat and sit, the middle sound changes. In sit and sip, the last sound changes. Look all the way to the end before saying the word."],
    model: ["m a t → mat", "s a t → s i t", "sat · sit · sip"],
    check: { prompt: "Read sat and sit aloud. Which letter changed?", choices: ["The first letter", "The middle letter", "The last letter"], answer: 1, explanation: "The middle letter changes from a to i. The vowel sound changes too. Read both words again: sat, sit." },
    transfer: { prompt: "Read pin. Change its middle letter to a. Read the new word aloud, then choose it.", choices: ["pit", "nap", "pan"], answer: 2, explanation: "Keep p at the start and n at the end. Change i to a. The new word is pan." },
    reflect: "Read aloud to a grown-up: Sam sat. Tim sat. Ask them to listen while you read each word. If a sound is tricky, practice it and reread the sentence."
  },
  {
    id: "1-sh", grade: "1", subject: "reading", title: "Two letters, one sound",
    prerequisiteIds: ["1-short-vowels"],
    preparation: "Review common consonant sounds and short vowels first. Today s and h will work together.",
    benchmark: { code: "ELA.1.F.1.3", source: "https://www.fldoe.org/core/fileparse.php/7539/urlt/elabeststandardsfinal.pdf", scope: "Introductory decoding with the consonant digraph sh only. Other digraphs, blends, and benchmark components remain separate work." },
    goal: "Read sh as one sound at the beginning or end of a word.",
    steps: ["Say ship. Listen to its first sound. The letters s and h work together to spell that one sound. A pair of letters that spells one sound is called a digraph.", "Look at the three sound parts in ship: sh, i, p. Keep sh together as you blend. Ship has four letters but three sounds.", "Read fish. The sh is at the end this time. Blend f, i, sh. Now read: A fish. A ship. Point under each sound part as you read."],
    model: ["sh", "sh · i · p → ship", "f · i · sh → fish"],
    check: { prompt: "Look at ship. Which letters work together to spell its first sound?", choices: ["ip", "hi", "sh"], answer: 2, explanation: "The s and h form sh. Keep them together as one sound when you read ship." },
    transfer: { prompt: "Read these words aloud. Which word ends with the sh sound?", choices: ["fish", "fit", "sip"], answer: 0, explanation: "Fish ends with sh. Fit ends with t, and sip ends with p. Look at each word's ending." },
    reflect: "Read to a grown-up: A fish in a dish. Read it again, keeping each sh together. Ask your grown-up to check your reading, then tell them what the words mean."
  },
  {
    id: "1-silent-e", grade: "1", subject: "reading", title: "Meet the quiet e",
    prerequisiteIds: ["1-short-vowels"],
    preparation: "Read short-vowel words such as cap, tap, and pin before adding a final e.",
    benchmark: { code: "ELA.1.F.1.3", source: "https://www.fldoe.org/core/fileparse.php/7539/urlt/elabeststandardsfinal.pdf", scope: "Introduction to final-e decoding only; not the full phonics benchmark." },
    goal: "Read words with a vowel, consonant, and final e.",
    steps: ["Read cap. Its a has a short vowel sound.", "Add e to make cape. In this pattern, a says its name and the final e is silent.", "Compare tap and tape. Look through the whole word before you blend. Not every word ending in e follows this pattern."], model: ["cap → cape", "tap → tape", "A cape. A tape."],
    check: { prompt: "Which word has the long a sound? Try reading first.", choices: ["cape", "cap", "cat"], answer: 0, explanation: "In cape, the a says its name. The final e is silent." },
    transfer: { prompt: "Read these words. Which has a silent final e and long i?", choices: ["pin", "sit", "pine"], answer: 2, explanation: "Pine follows the vowel-consonant-e pattern. Its i says its name." },
    reflect: "Read aloud: Sam has a cape. Sam can hop. Compare hop and hope with a grown-up."
  },
  {
    id: "1-cape-story", grade: "1", subject: "reading", title: "Read a tiny story",
    prerequisiteIds: ["1-silent-e"],
    preparation: "First practice short-vowel words and the final-e pattern in cape and tape. In this story, has ends with the sound you hear at the start of zebra.",
    benchmark: { code: "ELA.1.F.1.3", source: "https://www.fldoe.org/core/fileparse.php/7539/urlt/elabeststandardsfinal.pdf", scope: "Apply short-vowel and final-e decoding in controlled connected text. An adult must listen to assess oral reading; quiz answers do not measure fluency." },
    goal: "Use your word-reading skills in a short story, then explain what happened.",
    steps: ["Read these words first: Sam, cape, rip, tape. In cape and tape, the final e is silent and a says its name. If a word is tricky, blend it and then read it again.", "Read the story aloud: Sam has a cape. A rip! Sam has tape. Sam can fix a rip. Point to each word as you read. A rip is a tear in the cape.", "Read the story again. Keep the words in each sentence together, and pause at the period. Tell a grown-up how Sam can solve the problem. Use the words in the story to explain."],
    model: ["Sam · cape · rip · tape", "Sam has a cape. A rip! Sam has tape. Sam can fix a rip.", "Read again. What can Sam use to fix the rip?"],
    check: { prompt: "In the story, what can Sam use to fix the rip?", choices: ["A pin", "Tape", "A cup"], answer: 1, explanation: "The story says Sam has tape. Sam can use the tape to fix the rip." },
    transfer: { prompt: "Read a new tiny story: Tim has a kit. A cap has a rip. Tim can fix a cap. What has a rip?", choices: ["A kit", "A cape", "A cap"], answer: 2, explanation: "The new story says a cap has a rip. Read cap carefully: it has no final e. Cap and cape are different words." },
    reflect: "Read the Sam story to a grown-up without pressing Listen. Ask them to check your words. Tell them which word you practiced and whether rereading helped."
  },
  {
    id: "2-prefix", grade: "2", subject: "reading", title: "A small part changes meaning",
    goal: "Use the prefix un- to understand a word.",
    steps: ["A prefix is a word part added at the beginning of a base word.", "Start with “happy.” Add the prefix “un” to make “unhappy.” The prefix means “not,” so “unhappy” means “not happy.”", "Read the whole sentence to check: The wet socks felt uncomfortable. They did not feel comfortable."], model: ["un + happy", "unhappy", "not happy"],
    check: { prompt: "What does unfair mean?", choices: ["Very fair", "Not fair", "Fair again"], answer: 1, explanation: "The word “unfair” has two parts: “un” and “fair.” The prefix “un” means “not.” So “unfair” means “not fair.”" },
    transfer: { prompt: "The answer was unclear. What does unclear mean here?", choices: ["Not clear", "Very clear", "Clear again"], answer: 0, explanation: "“Unclear” means “not clear.” An unclear answer is hard to understand." },
    reflect: "Say a sentence with unkind. Explain how the prefix changes kind."
  },
  {
    id: "3-evidence", grade: "3", subject: "reading", title: "Read like a detective",
    goal: "Support an inference with a detail from the text.",
    steps: ["An inference uses text clues and what you know to work out something the author does not say directly.", "Read: Maya zipped her coat and pulled on mittens before stepping outside.", "We can infer it is cold. The coat and mittens are evidence. We cannot know the exact temperature."], model: ["Clue: coat + mittens", "These help keep people warm", "Inference: it is cold"],
    check: { prompt: "Which detail best supports the inference that Maya expects cold weather?", choices: ["Her name is Maya", "She steps outside", "She puts on mittens"], answer: 2, explanation: "Mittens keep hands warm, so that detail supports the inference." },
    transfer: { prompt: "Leo heard thunder and hurried to bring his bike inside. What does he probably expect?", choices: ["A birthday party", "A storm", "A broken bike"], answer: 1, explanation: "Thunder is a storm clue. Bringing the bike in suggests he expects stormy weather." },
    reflect: "Explain the difference between a text clue and a guess without evidence."
  },
  {
    id: "4-summary", grade: "4", subject: "reading", title: "Keep the important ideas",
    goal: "Summarize an informational passage without adding opinions.",
    steps: ["A summary gives the central idea and important details in fewer words.", "Read: Mangrove roots help hold soil in place along shores. Their tangled roots also shelter young fish. These trees help protect coastal habitats.", "A summary is: Mangroves support coastal habitats by holding soil and sheltering young fish. It keeps the important ideas without adding an opinion."], model: ["Central idea: protect habitats", "Details: hold soil; shelter fish", "Combine in your own words"],
    check: { prompt: "Which detail belongs in a summary of this passage?", choices: ["Mangroves shelter young fish", "All beaches have mangroves", "Mangroves are the prettiest trees"], answer: 0, explanation: "Sheltering fish is an important detail in the passage. The others are not supported." },
    transfer: { prompt: "Bees move pollen between flowers. This helps many plants make seeds. Which is the best summary?", choices: ["Bees are scary", "Every plant needs bees", "Bees help many plants make seeds by moving pollen"], answer: 2, explanation: "This includes both the main idea and how it happens, without exaggeration." },
    reflect: "Summarize something you read today in two sentences. Leave out your opinion."
  },
  {
    id: "5-structure", grade: "5", subject: "reading", title: "Follow cause and effect",
    goal: "Explain how causes and effects organize a passage.",
    steps: ["A cause explains why something happens. An effect is what happens as a result.", "Read: Heavy rain soaked the ground. Because the soil could absorb no more water, water flowed across the road.", "The saturated soil is a cause of water flowing across the road. Words like because and as a result can signal this relationship."], model: ["Heavy rain", "Soil cannot absorb more", "Water flows across road"],
    check: { prompt: "Why did water flow across the road in the passage?", choices: ["The road was new", "The soil could absorb no more", "There were many cars"], answer: 1, explanation: "The passage connects the soil's inability to absorb more water with the runoff." },
    transfer: { prompt: "A cold night froze water in a shallow puddle. By morning, ice covered it. What is the effect?", choices: ["Ice covered the puddle", "The night was cold", "The puddle was shallow"], answer: 0, explanation: "Ice forming is what happened as a result of the cold." },
    reflect: "Explain a cause-and-effect relationship from a book using evidence from the text."
  },
  {
    id: "PK-observe", grade: "PK", subject: "science", title: "Look closely",
    goal: "Describe what you can observe.",
    steps: ["Scientists look closely and describe what they notice.", "Look at a leaf. You might notice its color and shape.", "Say what you actually notice. You can say 'I wonder' when you have a question."], model: ["Look", "Notice color and shape", "Tell what you see"],
    check: { prompt: "Which tells something you can see about a leaf?", choices: ["It is green", "It is happy", "It wants a friend"], answer: 0, explanation: "Green describes a color you can observe." },
    transfer: { prompt: "You look at a ball. Which is an observation?", choices: ["It is the best ball", "It is round", "It likes to bounce"], answer: 1, explanation: "Round describes a shape you can see." },
    reflect: "Look at a safe object nearby. Describe two things you notice."
  },
  {
    id: "K-push", grade: "K", subject: "science", title: "Push, pull, predict",
    goal: "Describe how a push or pull can change motion.",
    steps: ["A push moves something away from your hand. A pull brings it toward your hand.", "Gently push a toy car on a clear floor. Notice how it starts moving.", "A force can start, stop, or change motion. Predict what a gentle pull would do, then check with a safe toy."], model: ["Hand → toy", "Push: away", "Pull: toward"],
    check: { prompt: "You move a drawer toward yourself to open it. Is that a push or pull?", choices: ["Push", "Neither", "Pull"], answer: 2, explanation: "Bringing the drawer toward you is a pull." },
    transfer: { prompt: "A ball is still. You gently push it. What can the push do?", choices: ["Make it disappear", "Start it moving", "Turn it into a cube"], answer: 1, explanation: "A push is a force that can start an object moving." },
    reflect: "Find one safe push and one safe pull you do every day."
  },
  {
    id: "1-plants", grade: "1", subject: "science", title: "A plant has working parts",
    goal: "Connect plant parts with their jobs.",
    steps: ["Roots take in water and help anchor a plant.", "The stem supports the plant and carries water to other parts.", "Leaves use light to help make food for the plant. Each part helps the plant live."], model: ["Leaves: use light", "Stem: support and transport", "Roots: take in water"],
    check: { prompt: "Which part usually takes water from the soil?", choices: ["Roots", "Flowers", "Leaves"], answer: 0, explanation: "Roots take in water from the soil." },
    transfer: { prompt: "Which part supports the leaves and carries water upward?", choices: ["A petal", "A seed", "The stem"], answer: 2, explanation: "The stem supports the plant and transports water." },
    reflect: "Observe a plant without pulling it up. Point out the parts you can see."
  },
  {
    id: "2-matter", grade: "2", subject: "science", title: "Same water, different state",
    goal: "Describe melting and freezing as changes of state.",
    steps: ["Ice is solid water. Liquid water flows and takes the shape of its container.", "When ice warms enough, it melts into liquid water.", "When liquid water cools enough, it freezes. It is still water in both states."], model: ["Solid ice", "Warming → melting", "Liquid water"],
    check: { prompt: "An ice cube becomes a puddle. What happened?", choices: ["Freezing", "Melting", "Growing"], answer: 1, explanation: "Solid water changed to liquid water. That is melting." },
    transfer: { prompt: "Water is placed in a freezer and becomes ice. What changed?", choices: ["Liquid changed to solid", "Water became a new substance", "Solid changed to gas"], answer: 0, explanation: "Cooling caused freezing: liquid water became solid water." },
    reflect: "With a grown-up, watch ice melt in a bowl. Describe what changes and what stays the same."
  },
  {
    id: "3-energy", grade: "3", subject: "science", title: "Notice energy",
    goal: "Identify light, heat, and sound in everyday observations.",
    steps: ["We can observe effects of energy around us.", "A lamp gives off light. Sunlight can warm a surface. A vibrating drum makes sound.", "One source can have more than one effect: the Sun gives us light and warmth."], model: ["Lamp → light", "Sun → light and warmth", "Vibrating drum → sound"],
    check: { prompt: "What makes the sound when a drum is struck?", choices: ["Its color", "Its shadow", "Its vibrating surface"], answer: 2, explanation: "A drum's surface vibrates and produces sound." },
    transfer: { prompt: "A sunlit sidewalk feels warmer than a shaded one. Which effect is observed?", choices: ["Freezing", "Heating", "Magnetism"], answer: 1, explanation: "Energy from sunlight warms the sidewalk." },
    reflect: "Name one light source and one sound source. Describe the evidence you observe."
  },
  {
    id: "4-transfer", grade: "4", subject: "science", title: "Which way does heat move?",
    goal: "Predict heat transfer between warmer and cooler objects.",
    steps: ["When objects at different temperatures touch, heat transfers from warmer to cooler.", "An ice cube in warmer water gains heat and can melt. The water loses heat and cools.", "We compare temperatures to predict the direction of heat transfer. Cold is not a substance that flows."], model: ["Warmer water", "Heat → cooler ice", "Water cools; ice warms"],
    check: { prompt: "A cool spoon touches warm soup. Which way does heat transfer?", choices: ["Soup to spoon", "Spoon to soup", "Neither direction"], answer: 0, explanation: "Heat transfers from the warmer soup to the cooler spoon." },
    transfer: { prompt: "A warm hand holds a cool cup. Which prediction fits heat transfer?", choices: ["The cup sends cold into the hand", "Heat moves from cup to hand", "Heat moves from hand to cup"], answer: 2, explanation: "The warmer hand transfers heat to the cooler cup." },
    reflect: "Draw an arrow showing heat moving between two objects with different temperatures."
  },
  {
    id: "5-fair-test", grade: "5", subject: "science", title: "Make a test fair",
    goal: "Identify what to change, measure, and keep the same in an investigation.",
    steps: ["Suppose you ask whether a toy car travels farther from a higher ramp.", "Change the ramp height. Measure the distance the car travels. Keep the car, floor, and starting method the same.", "Repeat trials at each height and compare results. Evidence supports a conclusion; one trial is not enough to establish a reliable pattern."], model: ["Change: ramp height", "Measure: travel distance", "Keep: car and surface"],
    check: { prompt: "Why use the same car for each ramp height?", choices: ["To guarantee your prediction", "So a different car does not explain the result", "To avoid measuring"], answer: 1, explanation: "Keeping the car the same helps isolate the effect of ramp height." },
    transfer: { prompt: "You test whether light affects plant growth. What should you change?", choices: ["The amount of light only", "Light, soil, and water together", "The ruler each day"], answer: 0, explanation: "Change light while keeping other relevant conditions alike, then measure growth." },
    reflect: "Plan a safe investigation. Name what you change, measure, and keep the same."
  },
];

export function lessonsForGrade(grade: Grade): Lesson[] {
  return (["reading", "math", "science"] as const).flatMap(subject => LESSONS.filter(l => l.grade === grade && l.subject === subject));
}
