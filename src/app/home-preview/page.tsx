import type { Metadata } from "next";
import { BrandLogo } from "@/components/BrandLogo";
import { KidHomeView, type KidHomeData } from "@/components/KidHomeView";

// Throwaway, no-login preview of the redesigned kid home so the layout can be
// reviewed without authenticating. Safe to delete once the design is approved
// and folded into /home.
export const metadata: Metadata = {
  title: "Home preview",
  robots: { index: false, follow: false },
};

const MOCK: KidHomeData = {
  name: "Sunny",
  avatar: "fox",
  grade: "3",
  xp: 340,
  streak: 5,
  totals: { attempts: 120, correct: 98, accuracy: 82 },
  subjects: [
    { id: "math", name: "Math", emoji: "➕", color: "blue", attempts: 48, correct: 36 },
    { id: "reading", name: "Reading", emoji: "📚", color: "purple", attempts: 40, correct: 20 },
    { id: "science", name: "Science", emoji: "🔬", color: "green", attempts: 25, correct: 5 },
  ],
  badges: [
    { id: "1", name: "First Win", emoji: "🥇", description: "", earned: true },
    { id: "2", name: "Streak 3", emoji: "🔥", description: "", earned: true },
    { id: "3", name: "Math Star", emoji: "⭐", description: "", earned: true },
    { id: "4", name: "Bookworm", emoji: "🐛", description: "", earned: false },
    { id: "5", name: "Scientist", emoji: "🧪", description: "", earned: false },
    { id: "6", name: "Level 5", emoji: "🚀", description: "", earned: false },
    { id: "7", name: "Perfect", emoji: "💯", description: "", earned: false },
  ],
};

export default function HomePreview() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <BrandLogo href={null} />
        <div className="flex shrink-0 items-center gap-2">
          <span
            title="Grown-up"
            className="btn-pop grid h-10 w-10 place-items-center bg-white text-lg ring-2 ring-slate-200"
          >
            👋
          </span>
          <span className="btn-pop bg-white px-3 py-2 text-sm text-slate-600 ring-2 ring-slate-200">
            Sign out
          </span>
        </div>
      </header>

      <KidHomeView data={MOCK} />

      <p className="mt-8 text-center text-xs text-slate-400">
        Preview with sample data · not the live dashboard
      </p>
    </main>
  );
}
