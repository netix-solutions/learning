// Parent-facing, grade-level "what good looks like" standards.
//
// Plain-language goals aligned to Florida's B.E.S.T. domains for K–5 (plus a
// gentle Pre-K set). These are intentionally high-level and parent-friendly —
// they explain what a child at each grade is working toward so the progress
// numbers elsewhere on the page have context. Not a substitute for the official
// standards; see https://www.fldoe.org/academics/standards/.

import type { Grade } from "@/lib/types";

export type StandardGoal = { area: string; can: string };
export type SubjectStandards = { summary: string; goals: StandardGoal[] };

/** grade → subjectId → standards */
export const GRADE_STANDARDS: Record<Grade, Record<string, SubjectStandards>> = {
  PK: {
    math: {
      summary: "Pre-K is all about playing with numbers, shapes, and sorting.",
      goals: [
        { area: "Counting", can: "Count to 10 and point to each object once" },
        { area: "Numbers", can: "Recognize numbers and say which group has more or fewer" },
        { area: "Shapes", can: "Name circles, squares, and triangles" },
        { area: "Sorting", can: "Sort objects by color, size, or shape" },
      ],
    },
    reading: {
      summary: "Pre-K builds the love of stories and the sounds inside words.",
      goals: [
        { area: "Letters", can: "Recognize and name many letters" },
        { area: "Sounds", can: "Hear and make rhyming words" },
        { area: "Stories", can: "Retell what happened in a favorite story" },
        { area: "Print", can: "Hold a book and turn pages the right way" },
      ],
    },
    science: {
      summary: "Pre-K scientists explore the world with their five senses.",
      goals: [
        { area: "Observing", can: "Describe things using sight, sound, and touch" },
        { area: "Weather", can: "Notice if it is sunny, rainy, or windy" },
        { area: "Living things", can: "Tell living things from non-living things" },
        { area: "Curiosity", can: "Ask questions about plants, animals, and nature" },
      ],
    },
  },
  K: {
    math: {
      summary: "Kindergarten lays the foundation: counting, adding, and shapes.",
      goals: [
        { area: "Counting", can: "Count to 100 by ones and tens" },
        { area: "Add & subtract", can: "Add and subtract within 10" },
        { area: "Compare", can: "Tell which number is greater or less" },
        { area: "Shapes", can: "Name 2D and 3D shapes and describe them" },
      ],
    },
    reading: {
      summary: "Kindergarten cracks the code from letters to first words.",
      goals: [
        { area: "Phonics", can: "Match each letter to its sound" },
        { area: "Blending", can: "Blend sounds to read simple words (c-a-t → cat)" },
        { area: "Sight words", can: "Read common words on sight (the, and, is)" },
        { area: "Comprehension", can: "Identify characters and the setting of a story" },
      ],
    },
    science: {
      summary: "Kindergarten scientists observe objects, weather, and living things.",
      goals: [
        { area: "Matter", can: "Describe objects by color, shape, and texture" },
        { area: "Weather", can: "Track weather and the four seasons" },
        { area: "Life", can: "Tell what plants and animals need to live" },
        { area: "Motion", can: "Explore how pushes and pulls move things" },
      ],
    },
  },
  "1": {
    math: {
      summary: "First grade builds fluency to 20 and an understanding of tens.",
      goals: [
        { area: "Add & subtract", can: "Add and subtract within 20" },
        { area: "Place value", can: "Understand tens and ones up to 100" },
        { area: "Measurement", can: "Compare and order lengths of objects" },
        { area: "Time", can: "Tell time to the hour and half-hour" },
      ],
    },
    reading: {
      summary: "First graders become readers of whole sentences and short stories.",
      goals: [
        { area: "Decoding", can: "Sound out and read grade-level words" },
        { area: "Fluency", can: "Read short texts smoothly" },
        { area: "Main idea", can: "Tell the main topic of a passage" },
        { area: "Details", can: "Retell key details from a story" },
      ],
    },
    science: {
      summary: "First grade explores matter, the sky, and living things.",
      goals: [
        { area: "Matter", can: "Sort solids and liquids by their properties" },
        { area: "Sky", can: "Observe the sun, light, and shadows" },
        { area: "Life", can: "Name the parts of plants and animals" },
        { area: "Inquiry", can: "Make and record simple observations" },
      ],
    },
  },
  "2": {
    math: {
      summary: "Second grade masters facts to 100 and the idea behind multiplying.",
      goals: [
        { area: "Add & subtract", can: "Add and subtract within 100 with regrouping" },
        { area: "Place value", can: "Read and build numbers up to 1,000" },
        { area: "Groups", can: "Use arrays and repeated addition (toward × )" },
        { area: "Money & time", can: "Count coins and tell time to 5 minutes" },
      ],
    },
    reading: {
      summary: "Second graders read fluently and dig into meaning.",
      goals: [
        { area: "Fluency", can: "Read aloud smoothly with expression" },
        { area: "Main idea", can: "Find the main idea and supporting details" },
        { area: "Vocabulary", can: "Use context clues to learn new words" },
        { area: "Compare", can: "Compare two stories or texts" },
      ],
    },
    science: {
      summary: "Second grade investigates matter, life cycles, and Earth.",
      goals: [
        { area: "Matter", can: "Describe how materials change (e.g., heating, cooling)" },
        { area: "Life cycles", can: "Describe how plants and animals grow and change" },
        { area: "Earth", can: "Explore land, water, and Earth's surface" },
        { area: "Inquiry", can: "Measure and record what they observe" },
      ],
    },
  },
  "3": {
    math: {
      summary: "Third grade is a big year: multiplication, division, and fractions.",
      goals: [
        { area: "Multiply & divide", can: "Multiply and divide within 100" },
        { area: "Fractions", can: "Understand fractions and place them on a number line" },
        { area: "Measurement", can: "Find area and perimeter of shapes" },
        { area: "Time", can: "Tell and find elapsed time to the minute" },
      ],
    },
    reading: {
      summary: "Third graders read to learn and support ideas with evidence.",
      goals: [
        { area: "Main idea", can: "Identify the main idea and theme" },
        { area: "Evidence", can: "Answer questions using details from the text" },
        { area: "Vocabulary", can: "Use context clues, prefixes, and suffixes" },
        { area: "Characters", can: "Describe characters and how they change" },
      ],
    },
    science: {
      summary: "Third grade studies forces, life cycles, and weather.",
      goals: [
        { area: "Forces", can: "Explore forces, motion, and magnets" },
        { area: "Life", can: "Describe life cycles and inherited traits" },
        { area: "Weather", can: "Read weather patterns and climate" },
        { area: "Energy", can: "Identify forms of energy like heat and light" },
      ],
    },
  },
  "4": {
    math: {
      summary: "Fourth grade extends to bigger numbers, fractions, and decimals.",
      goals: [
        { area: "Operations", can: "Multiply multi-digit numbers and do long division" },
        { area: "Fractions", can: "Find equivalent fractions and connect them to decimals" },
        { area: "Number sense", can: "Use factors, multiples, and patterns" },
        { area: "Geometry", can: "Measure angles and classify shapes" },
      ],
    },
    reading: {
      summary: "Fourth graders analyze texts and explain their thinking.",
      goals: [
        { area: "Summarize", can: "Summarize a text in their own words" },
        { area: "Point of view", can: "Compare different points of view" },
        { area: "Language", can: "Interpret similes, metaphors, and idioms" },
        { area: "Evidence", can: "Cite text evidence to support an answer" },
      ],
    },
    science: {
      summary: "Fourth grade investigates energy, Earth, and ecosystems.",
      goals: [
        { area: "Energy", can: "Explore light, heat, sound, and electricity" },
        { area: "Earth", can: "Study rocks, soil, and Earth's changing surface" },
        { area: "Ecosystems", can: "Explain adaptations and how living things survive" },
        { area: "Method", can: "Plan and carry out a fair test" },
      ],
    },
  },
  "5": {
    math: {
      summary: "Fifth grade prepares for middle school with decimals and fractions.",
      goals: [
        { area: "Decimals", can: "Add, subtract, multiply, and divide decimals" },
        { area: "Fractions", can: "Add, subtract, and multiply fractions" },
        { area: "Expressions", can: "Use order of operations to solve problems" },
        { area: "Geometry", can: "Find volume and plot points on a grid" },
      ],
    },
    reading: {
      summary: "Fifth graders interpret deeper meaning and compare texts.",
      goals: [
        { area: "Theme", can: "Analyze the theme and message of a text" },
        { area: "Compare", can: "Compare how two texts treat the same topic" },
        { area: "Language", can: "Understand figurative language and word relationships" },
        { area: "Inference", can: "Support inferences with evidence from the text" },
      ],
    },
    science: {
      summary: "Fifth grade ties together matter, Earth, space, and ecosystems.",
      goals: [
        { area: "Matter", can: "Describe matter and its physical and chemical changes" },
        { area: "Earth", can: "Explain the water cycle and weather" },
        { area: "Space", can: "Describe the Sun, Earth, and Moon system" },
        { area: "Ecosystems", can: "Trace energy flow through an ecosystem" },
      ],
    },
  },
};

export function standardsFor(
  grade: Grade | null | undefined,
  subjectId: string,
): SubjectStandards | null {
  if (!grade) return null;
  return GRADE_STANDARDS[grade]?.[subjectId] ?? null;
}
