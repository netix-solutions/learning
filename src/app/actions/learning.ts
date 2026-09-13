"use server";
import { createHash } from "node:crypto";
import { getSessionProfile } from "@/lib/auth";
import { getStudentEntitlement } from "@/lib/entitlement";
import { createAdminClient } from "@/lib/supabase/admin";
import { LESSONS, type Lesson } from "@/lib/lessons";
import { mathLabFor } from "@/lib/math-labs";
import type { LearningResult, LearningStage, LearningRun } from "@/lib/learning-progress";

function revision(lesson: Lesson) {
  return createHash("sha256").update(JSON.stringify({ lesson, lab: mathLabFor(lesson.id) })).digest("hex");
}
async function authorize(lessonId: string) {
  const { user, profile } = await getSessionProfile();
  if (!user || profile?.role !== "student") return { error: "Please sign in as a learner to save your lesson." } as const;
  const lesson = LESSONS.find(l => l.id === lessonId && l.grade === profile.grade);
  if (!lesson) return { error: "This lesson is not available for your grade." } as const;
  if (!(await getStudentEntitlement(user.id)).entitled) return { error: "Ask your grown-up to check your learning plan." } as const;
  return { user, lesson };
}
function failed(error: unknown): LearningResult {
  // Provider errors are not displayed to children or logged with profile data.
  if (error) console.error("[learning] Could not save a lesson operation.");
  return { error: "We could not save that step. Check your connection, then try again. Your last saved step is safe." };
}
export async function beginLesson(lessonId: string): Promise<LearningResult> {
  try {
    const context = await authorize(lessonId);
    if (context.error) return { error: context.error };
    const { lesson, user } = context;
    const { data, error } = await createAdminClient().rpc("begin_learning_run", {
      p_student: user.id, p_lesson: lesson.id, p_revision: revision(lesson), p_grade: lesson.grade,
      p_subject: lesson.subject, p_has_lab: !!mathLabFor(lesson.id),
    });
    return error || !data ? failed(error) : { run: data as LearningRun };
  } catch (error) { return failed(error); }
}
export async function saveLessonStep(input: {
  lessonId: string; runId: string; operation: "checkpoint" | "answer" | "complete";
  stage: LearningStage; step?: number; labExplored?: boolean; supportUsed?: boolean; choice?: number;
}): Promise<LearningResult> {
  try {
    if (!input || typeof input.lessonId !== "string" || typeof input.runId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.runId)) return failed(null);
    const context = await authorize(input.lessonId);
    if (context.error) return { error: context.error };
    const { lesson, user } = context;
    const allowed = ["teach", "explore", "guided", "transfer", "reflect"];
    if (!allowed.includes(input.stage) || !["checkpoint", "answer", "complete"].includes(input.operation)) return failed(null);
    const step = input.step ?? 0;
    if (!Number.isInteger(step) || step < 0 || step > 2) return failed(null);
    const question = input.stage === "guided" ? lesson.check : lesson.transfer;
    if (input.operation === "answer" && (!(input.stage === "guided" || input.stage === "transfer") || !Number.isInteger(input.choice) || input.choice! < 0 || input.choice! >= question.choices.length)) return failed(null);
    const admin = createAdminClient();
    // Bind the requested lesson to the run before passing trusted answer data.
    const { data: owned } = await admin.from("learning_runs").select("lesson_id, revision").eq("id", input.runId).eq("student_id", user.id).maybeSingle();
    if (owned?.lesson_id !== lesson.id) return failed(null);
    if (owned.revision !== revision(lesson)) return { error: "This lesson has been updated. Go Home and open it again to start the new version." };
    const { data, error } = await admin.rpc("advance_learning_run", {
      p_student: user.id, p_run: input.runId, p_revision: revision(lesson), p_operation: input.operation,
      p_stage: input.stage, p_step: step, p_lab_explored: input.labExplored === true, p_support_used: input.supportUsed === true,
      p_choice: input.operation === "answer" ? input.choice : null,
      p_correct: input.operation === "answer" ? input.choice === question.answer : null,
      p_explanation: input.operation === "answer" ? question.explanation : null,
    });
    return error || !data ? failed(error) : { run: data as LearningRun };
  } catch (error) { return failed(error); }
}
