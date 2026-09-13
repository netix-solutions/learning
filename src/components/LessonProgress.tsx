import { createClient } from "@/lib/supabase/server";
import { LESSONS } from "@/lib/lessons";

type Row = { id: string; lesson_id: string; completed_at: string | null; updated_at: string; learning_checks: { stage: string; is_correct: boolean; support_used: boolean }[] };

export async function LessonProgress({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  // Student/parent visibility is enforced by RLS, including the nested checks.
  const { data, error } = await supabase.from("learning_runs")
    .select("id,lesson_id,completed_at,updated_at,learning_checks(stage,is_correct,support_used)")
    .eq("student_id", studentId).order("updated_at", { ascending: false }).limit(6);
  if (error) return <p className="mt-6 text-sm text-slate-500">Lesson progress is temporarily unavailable.</p>;
  if (!data?.length) return null;
  return <section className="card-fun mt-6 p-5">
    <h2 className="font-display text-xl font-bold text-slate-800">Recent lessons</h2>
    <p className="mt-1 text-sm text-slate-500">First answers are saved separately from lesson completion. These short checks are practice evidence, not a mastery assessment.</p>
    <ul className="mt-4 divide-y divide-slate-100">{(data as Row[]).map(row => {
      const lesson = LESSONS.find(l => l.id === row.lesson_id);
      const guided = row.learning_checks.find(c => c.stage === "guided");
      const transfer = row.learning_checks.find(c => c.stage === "transfer");
      return <li key={row.id} className="py-3">
        <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold text-slate-800">{lesson?.title ?? "Learning lesson"}</h3><span className="text-sm text-slate-500">{row.completed_at ? "Completed" : "In progress"}</span></div>
        <p className="mt-1 text-sm text-slate-600">Guided question: {guided ? guided.is_correct ? "correct" : "review needed" : "not answered"}. New-question check: {transfer ? transfer.is_correct ? "correct" : "review needed" : "not answered"}.</p>
        {transfer && <p className="mt-1 text-xs font-semibold text-slate-500">{transfer.support_used ? "Help or read-aloud requested for the new-question check." : "No help requested for the new-question check."}</p>}
      </li>;
    })}</ul>
  </section>;
}
