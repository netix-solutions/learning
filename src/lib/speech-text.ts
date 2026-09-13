// Shared normalization for generated clips and live ElevenLabs requests.
export function forSpeech(text: string): string {
  return text
    // Fill-in-the-blank markers (e.g. "Living things need ___ to grow", or
    // "7 ___ 17") — a teacher reads the gap as "blank", not "underscore".
    .replace(/_{2,}/g, " blank ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/−/g, " minus ")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 minus $2")
    .replace(/\+/g, " plus ")
    .replace(/=/g, " equals ")
    .replace(/≠/g, " is not equal to ")
    .replace(/≤/g, " less than or equal to ")
    .replace(/≥/g, " greater than or equal to ")
    .replace(/</g, " less than ")
    .replace(/>/g, " greater than ")
    .replace(/(\d)\s*\/\s*(\d)/g, "$1 over $2")
    .replace(/(\d)\s*%/g, "$1 percent")
    .replace(/\$\s*(\d)/g, "$1 dollars")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, " ")
    // No awkward pause before punctuation (e.g. "blank ." -> "blank.").
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

