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

/**
 * Generate one piece of avatar-shop artwork through the Vercel AI Gateway
 * (auth: OIDC on Vercel, AI_GATEWAY_API_KEY elsewhere). Returns raw PNG bytes.
 */
export async function generateAvatarArt(subject: string): Promise<Uint8Array> {
  const result = await generateText({
    model: MODEL,
    prompt: `${AVATAR_STYLE}\n\nThe character: ${subject}.`,
    providerOptions: { gateway: { tags: ["feature:avatar-shop"] } },
  });
  const image = result.files.find((f) => f.mediaType?.startsWith("image/"));
  if (!image) {
    throw new Error(
      `Model returned no image (${result.text?.slice(0, 120) || "no text"})`,
    );
  }
  return image.uint8Array;
}
