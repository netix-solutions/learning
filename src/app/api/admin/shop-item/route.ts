import { isAdminAuthed } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAvatarArt } from "@/lib/ai-art";

// Image generation takes ~20–40s, well past the default function timeout.
export const runtime = "nodejs";
export const maxDuration = 60;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * POST — generate a new shop item: AI artwork via the Vercel AI Gateway,
 * uploaded to the public `shop` storage bucket, then a shop_items row.
 * Body: { name, subject, price }
 */
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    subject?: string;
    price?: number;
  };
  const name = (body.name ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const price = Math.round(Number(body.price));
  if (!name || !subject || !Number.isFinite(price) || price < 0) {
    return Response.json(
      { error: "Need a name, a character description, and a price ≥ 0." },
      { status: 400 },
    );
  }

  let png: Uint8Array;
  try {
    png = await generateAvatarArt(subject);
  } catch (err) {
    return Response.json(
      { error: `Image generation failed: ${err instanceof Error ? err.message : err}` },
      { status: 502 },
    );
  }

  // Random suffix so regenerating "Robo Buddy" never collides or overwrites.
  const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 6)}`;
  const admin = createAdminClient();

  const { error: uploadErr } = await admin.storage
    .from("shop")
    .upload(`${slug}.png`, png, { contentType: "image/png" });
  if (uploadErr) {
    return Response.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 });
  }
  const {
    data: { publicUrl },
  } = admin.storage.from("shop").getPublicUrl(`${slug}.png`);

  const { data: item, error: insertErr } = await admin
    .from("shop_items")
    .insert({
      kind: "avatar",
      slug,
      name,
      image_url: publicUrl,
      price,
      // New items go live immediately; retire from the same admin page.
      active: true,
    })
    .select()
    .single();
  if (insertErr) {
    return Response.json({ error: insertErr.message }, { status: 500 });
  }

  return Response.json({ item });
}

/** PATCH — retire or relist an item. Body: { id, active } */
export async function PATCH(req: Request) {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    active?: boolean;
  };
  if (!body.id || typeof body.active !== "boolean") {
    return Response.json({ error: "Need id and active." }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("shop_items")
    .update({ active: body.active })
    .eq("id", body.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
