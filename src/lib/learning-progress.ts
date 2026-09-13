export type LearningStage = "teach" | "explore" | "guided" | "transfer" | "reflect";
export type LearningCheck = {
  stage: "guided" | "transfer"; choice: number; is_correct: boolean;
  support_used: boolean; explanation: string; created_at: string;
};
export type LearningRun = {
  id: string; lesson_id: string; revision: string; grade: string; subject: string;
  stage: LearningStage; step: number; lab_explored: boolean; support_used: boolean;
  created_at: string; updated_at: string; completed_at: string | null; checks: LearningCheck[];
};
export type LearningResult = { run: LearningRun; error?: never } | { error: string; run?: never };
