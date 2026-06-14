"use client";

import { useActionState, useState } from "react";
import { setGoal, type GoalFormState } from "@/app/actions/goals";
import {
  DAYS_OPTIONS,
  MINUTES_OPTIONS,
  DEFAULT_DAYS_PER_WEEK,
  DEFAULT_MINUTES_PER_DAY,
} from "@/lib/goals";

const initial: GoalFormState = { error: null, success: null };

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-11 rounded-xl px-3 py-2 text-sm font-bold transition ${
        active
          ? "text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
      style={active ? { background: "var(--brand-blue)" } : undefined}
    >
      {children}
    </button>
  );
}

/** Parent control to set a child's weekly learning-time goal. */
export function GoalForm({
  childId,
  childName,
  initialDays = DEFAULT_DAYS_PER_WEEK,
  initialMinutes = DEFAULT_MINUTES_PER_DAY,
}: {
  childId: string;
  childName: string;
  initialDays?: number;
  initialMinutes?: number;
}) {
  const [state, action, pending] = useActionState(setGoal, initial);
  const [days, setDays] = useState(initialDays);
  const [minutes, setMinutes] = useState(initialMinutes);

  return (
    <form action={action} className="card-fun p-5 sm:p-6">
      <input type="hidden" name="child_id" value={childId} />
      <input type="hidden" name="days_per_week" value={days} />
      <input type="hidden" name="minutes_per_day" value={minutes} />

      <h2 className="font-display text-xl font-bold text-slate-800">
        ⏱️ Time goal for {childName}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        We&apos;ll cheer {childName} on and email you when the goal is met — or
        about to slip.
      </p>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-bold text-slate-600">
          Minutes per day
        </label>
        <div className="flex flex-wrap gap-2">
          {MINUTES_OPTIONS.map((m) => (
            <Chip key={m} active={m === minutes} onClick={() => setMinutes(m)}>
              {m}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-bold text-slate-600">
          Days per week
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OPTIONS.map((d) => (
            <Chip key={d} active={d === days} onClick={() => setDays(d)}>
              {d}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
        🎯 Target: <span className="text-slate-800">{minutes} minutes</span> a
        day, <span className="text-slate-800">{days} day{days === 1 ? "" : "s"}</span>{" "}
        a week.
      </p>

      {state.error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-pop mt-4 w-full px-6 py-3 font-bold text-white"
        style={{ background: "var(--brand-blue)" }}
      >
        {pending ? "Saving…" : "Save goal"}
      </button>
    </form>
  );
}
