import type { Lesson } from "./lessons";

export type NarrationSlot = "goal" | "step-0" | "step-1" | "step-2" | "guided" | "transfer" | "guided-feedback" | "transfer-feedback" | "reflect";
export const NARRATION_SLOTS: NarrationSlot[] = ["goal", "step-0", "step-1", "step-2", "guided", "transfer", "guided-feedback", "transfer-feedback", "reflect"];

// Speak visual counting instructions without voicing a dot as "black circle"
// or accidentally saying the answer before the child has counted.
const SPOKEN_OVERRIDES: Record<string, Partial<Record<NarrationSlot, string>>> = {
  "PK-count": {
    guided: "Count the dots on the screen. How many are there? Choice one: two. Choice two: three. Choice three: four.",
    transfer: "Count this new group of dots on the screen. How many are there? Choice one: four. Choice two: three. Choice three: five.",
  },
  "K-blend": {
    "step-0": "Letters can stand for sounds. Look at mat. The first sound is the sound at the start of moon. The middle sound is the sound at the start of apple. The last sound is the sound at the start of top.",
    "step-1": "Point to each letter in mat. Say its sound, then slide the sounds together to read the word, mat. Keep the last sound short. Do not add an extra vowel sound.",
    "step-2": "Read the words: A mat. Point to mat and blend it again.",
    "guided-feedback": "The letter M is first. Start with the first sound in moon. Then blend in the first sound in apple, and the first sound in top, to read mat.",
    "transfer-feedback": "The first sounds in sun, apple, and top blend into the word sat.",
  },
};

export function narrationFor(lesson: Lesson, slot: NarrationSlot): string {
  const override = SPOKEN_OVERRIDES[lesson.id]?.[slot];
  if (override) return override;
  if (slot === "goal") return `${lesson.title}. ${lesson.goal}`;
  if (slot.startsWith("step-")) return lesson.steps[Number(slot.slice(-1))];
  if (slot === "reflect") return lesson.reflect;
  const q = slot.startsWith("guided") ? lesson.check : lesson.transfer;
  if (slot.endsWith("feedback")) return q.explanation;
  return `${q.prompt}. ${q.choices.map((c, i) => `Choice ${i + 1}: ${c}`).join(". ")}.`;
}

export function narrationId(lesson: Lesson, slot: NarrationSlot): string {
  return `${lesson.id}:${slot}`;
}
