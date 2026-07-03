import { isAdminAuthed } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSceneArt } from "@/lib/ai-art";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * PATCH — review actions from /admin/art.
 * Body: { id, status: 'approved'|'rejected'|'pending' } for one row,
 * or { approveAllPending: true } to bulk-approve everything still pending.
 */
export async function PATCH(req: Request) {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
    approveAllPending?: boolean;
  };
  const admin = createAdminClient();

  if (body.approveAllPending) {
    const { error, count } = await admin
      .from("skill_art")
      .update({ status: "approved" }, { count: "exact" })
      .eq("status", "pending");
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, approved: count ?? 0 });
  }

  if (!body.id || !["approved", "rejected", "pending"].includes(body.status ?? "")) {
    return Response.json({ error: "Need id and a valid status." }, { status: 400 });
  }
  const { error } = await admin
    .from("skill_art")
    .update({ status: body.status })
    .eq("id", body.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

/** POST — repaint one skill's art from its stored art_prompt. Body: { id } */
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return Response.json({ error: "Need id." }, { status: 400 });

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("skill_art")
    .select("id, subject_id, skill, art_prompt")
    .eq("id", body.id)
    .single();
  if (!row?.art_prompt) {
    return Response.json({ error: "Row or art_prompt not found." }, { status: 404 });
  }

  let png: Uint8Array;
  try {
    png = await generateSceneArt(row.art_prompt);
  } catch (err) {
    return Response.json(
      { error: `Image generation failed: ${err instanceof Error ? err.message : err}` },
      { status: 502 },
    );
  }

  // New object key each time so caches can't serve the old image.
  const key = `${row.subject_id}/${row.skill.replaceAll(".", "-")}-${crypto
    .randomUUID()
    .slice(0, 6)}.png`;
  const { error: uploadErr } = await admin.storage
    .from("art")
    .upload(key, png, { contentType: "image/png" });
  if (uploadErr) {
    return Response.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 });
  }
  const {
    data: { publicUrl },
  } = admin.storage.from("art").getPublicUrl(key);

  const { error } = await admin
    .from("skill_art")
    .update({
      image_url: publicUrl,
      status: "pending",
      review_note: "regenerated — not yet reviewed",
    })
    .eq("id", row.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, image_url: publicUrl });
}
