export type Grade = "PK" | "K" | "1" | "2" | "3" | "4" | "5";
export const GRADES: Grade[] = ["PK", "K", "1", "2", "3", "4", "5"];

/** Friendly label for a grade: "Pre-K", "Grade K", "Grade 3", … */
export function gradeLabel(g: string | null | undefined): string {
  if (!g) return "";
  if (g === "PK") return "Pre-K";
  return `Grade ${g}`;
}

export type Role = "parent" | "student";

export type Profile = {
  id: string;
  role: Role;
  display_name: string;
  username: string | null;
  grade: Grade | null;
  avatar: string;
  xp: number;
  streak_count: number;
  last_active_date: string | null;
  created_at: string;
};

export type Subject = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sort: number;
};

export type PracticeQuestion = {
  id: string;
  subject_id: string;
  grade: Grade;
  prompt: string;
  choices: string[];
  standard: string | null;
  xp: number;
  // Adaptive engine extras (present when served by get_adaptive_questions).
  skill?: string | null;
  focus?: "new" | "review" | "practice" | null;
};

export type AttemptResult = {
  is_correct: boolean;
  correct_index: number;
  explanation: string | null;
  xp_earned: number;
  new_xp: number;
  new_streak: number;
  new_badges: { id: string; name: string; emoji: string; description: string }[];
};

export type StudentSummary = {
  profile: {
    id: string;
    role: Role;
    display_name: string;
    grade: Grade | null;
    avatar: string;
    xp: number;
    streak_count: number;
    last_active_date: string | null;
  };
  totals: { attempts: number; correct: number; accuracy: number };
  subjects: {
    subject_id: string;
    name: string;
    emoji: string;
    color: string;
    attempts: number;
    correct: number;
  }[];
  badges: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    earned_at: string;
  }[];
  recent: {
    subject_id: string;
    is_correct: boolean;
    xp_earned: number;
    created_at: string;
  }[];
};

export type ChildOverview = {
  id: string;
  display_name: string;
  username: string | null;
  grade: Grade | null;
  avatar: string;
  xp: number;
  streak_count: number;
  last_active_date: string | null;
  total_attempts: number;
  total_correct: number;
  badge_count: number;
};

/** Fun avatar choices for kids. */
export const AVATARS = [
  "🦊", "🐼", "🐵", "🦁", "🐯", "🐸", "🐙", "🦄",
  "🐶", "🐱", "🐢", "🐧", "🦉", "🐝", "🦖", "🐳",
];

/** Map a subject color key to a tailwind gradient + accent classes. */
export const SUBJECT_THEME: Record<
  string,
  { gradient: string; ring: string; text: string; soft: string }
> = {
  blue: {
    gradient: "from-sky-400 to-blue-500",
    ring: "ring-blue-300",
    text: "text-blue-700",
    soft: "bg-blue-50",
  },
  purple: {
    gradient: "from-fuchsia-400 to-purple-500",
    ring: "ring-purple-300",
    text: "text-purple-700",
    soft: "bg-purple-50",
  },
  green: {
    gradient: "from-emerald-400 to-green-500",
    ring: "ring-emerald-300",
    text: "text-emerald-700",
    soft: "bg-emerald-50",
  },
  orange: {
    gradient: "from-amber-400 to-orange-500",
    ring: "ring-orange-300",
    text: "text-orange-700",
    soft: "bg-orange-50",
  },
};

export function subjectTheme(color: string) {
  return SUBJECT_THEME[color] ?? SUBJECT_THEME.blue;
}
