export type ReadingPrompt = { passage: string; question: string };
// Only split explicitly marked passage prompts. Quoted vocabulary and dialogue
// without this exact boundary remain intact instead of guessing at a passage.
export function splitReadingPrompt(prompt: string): ReadingPrompt | null {
  if ((prompt.match(/["“”]/g) ?? []).length !== 2) return null;
  const match = /^Read:\s*["“]([\s\S]+?)["”]\s+([^\s][\s\S]*)$/.exec(prompt.trim());
  if (!match || /["“”]/.test(match[1])) return null;
  return { passage: match[1].trim(), question: match[2].trim() };
}
