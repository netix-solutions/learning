import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/AdminShell";
import {
  SkillArtActions,
  ApproveAllPending,
} from "@/components/admin/SkillArtReview";

export const metadata = { title: "Question Art · SummerSharp Admin" };
export const dynamic = "force-dynamic";

type ArtRow = {
  id: string;
  subject_id: string;
  skill: string;
  image_url: string;
  art_prompt: string | null;
  review_note: string | null;
  status: "pending" | "approved" | "rejected";
};

const STATUS_CHIP: Record<ArtRow["status"], string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-slate-100 text-slate-500 ring-slate-200",
};

export default async function AdminArtPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const admin = createAdminClient();
  const { data } = await admin
    .from("skill_art")
    .select("id, subject_id, skill, image_url, art_prompt, review_note, status")
    .order("subject_id")
    .order("skill");
  const rows = (data ?? []) as ArtRow[];
  const pending = rows.filter((r) => r.status === "pending").length;
  const flagged = rows.filter((r) => r.review_note?.startsWith("NEEDS")).length;

  const bySubject = new Map<string, ArtRow[]>();
  for (const r of rows) {
    bySubject.set(r.subject_id, [...(bySubject.get(r.subject_id) ?? []), r]);
  }

  return (
    <AdminShell active="art">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">
            Question Art
          </h1>
          <p className="mt-1 text-slate-500">
            AI scene illustrations per skill. Kids only see <b>approved</b> art.{" "}
            {rows.length} total · {pending} pending
            {flagged > 0 && (
              <span className="font-semibold text-amber-600">
                {" "}
                · {flagged} flagged by the auto-check
              </span>
            )}
            .
          </p>
        </div>
        <ApproveAllPending pending={pending} />
      </div>

      {[...bySubject.entries()].map(([subject, items]) => (
        <section key={subject} className="mt-8">
          <h2 className="mb-3 font-display text-xl font-bold capitalize text-slate-700">
            {subject} <span className="text-slate-400">({items.length})</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <div
                key={r.id}
                className={`overflow-hidden rounded-2xl border bg-white ${
                  r.review_note?.startsWith("NEEDS")
                    ? "border-amber-300"
                    : "border-slate-200"
                } ${r.status === "rejected" ? "opacity-60" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.image_url}
                  alt={r.skill}
                  className="aspect-[5/2] w-full object-cover"
                />
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-xs font-bold text-slate-600">
                      {r.skill}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ring-1 ${STATUS_CHIP[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  {r.art_prompt && (
                    <p className="line-clamp-2 text-xs text-slate-500" title={r.art_prompt}>
                      {r.art_prompt}
                    </p>
                  )}
                  {r.review_note?.startsWith("NEEDS") && (
                    <p className="text-xs font-semibold text-amber-600">
                      ⚠ {r.review_note}
                    </p>
                  )}
                  <SkillArtActions id={r.id} status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {rows.length === 0 && (
        <p className="mt-10 text-center text-slate-400">
          No art yet — run scripts/generate-skill-art.mjs to create the catalog.
        </p>
      )}
    </AdminShell>
  );
}
