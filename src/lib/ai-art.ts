import "server-only";
import { generateText } from "ai";

// Kept in sync with scripts/shop-catalog.mjs (plain-node scripts can't import
// TS, so the style prompt lives in both places).
const AVATAR_STYLE = [
  "Cute flat vector-style illustration for a children's learning app avatar.",
  "A single friendly character's head and shoulders, centered, facing forward,",
  "big expressive eyes, soft rounded shapes, bold clean outlines,",
  "on a solid pastel circular background that fills the square frame.",
  "Bright cheerful colors. No text, no watermark, no photorealism.",
].join(" ");

const MODEL = "google/gemini-3.1-flash-image-preview";

// Kept in sync with scripts/generate-skill-art.mjs.
const SCENE_STYLE = [
  "Cute flat vector-style illustration for a children's learning app, wide landscape composition.",
  "Soft rounded shapes, bold clean outlines, bright cheerful pastel colors, sunny friendly mood.",
  "Absolutely no words, letters, numbers, or signs anywhere in the image.",
  "No photorealism, no watermark.",
].join(" ");

/**
 * Generate one piece of avatar-shop artwork through the Vercel AI Gateway
 * (auth: OIDC on Vercel, AI_GATEWAY_API_KEY elsewhere). Returns raw PNG bytes.
 */
export async function generateAvatarArt(subject: string): Promise<Uint8Array> {
  return paint(`${AVATAR_STYLE}\n\nThe character: ${subject}.`, "avatar-shop");
}

/** Wide scene banner for question skill-art (see /admin/art). */
export async function generateSceneArt(scene: string): Promise<Uint8Array> {
  return paint(`${SCENE_STYLE}\n\nThe scene: ${scene}`, "skill-art");
}

async function paint(prompt: string, tag: string): Promise<Uint8Array> {
  const result = await generateText({
    model: MODEL,
    prompt,
    providerOptions: { gateway: { tags: [`feature:${tag}`] } },
  });
  const image = result.files.find((f) => f.mediaType?.startsWith("image/"));
  if (!image) {
    throw new Error(
      `Model returned no image (${result.text?.slice(0, 120) || "no text"})`,
    );
  }
  return image.uint8Array;
}
