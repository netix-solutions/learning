"use client";

import { useActionState, useEffect, useState } from "react";
import { createChild, type ChildFormState } from "@/app/actions/children";
import { GRADES } from "@/lib/types";
import { AVATAR_DEFS, DEFAULT_AVATAR, Avatar } from "@/components/Avatar";
import { gaEvent } from "@/lib/gtag";

const initial: ChildFormState = { error: null, success: null };
const inputClass =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg outline-none focus:border-[var(--brand-blue)]";

export function AddChildForm() {
  const [state, action, pending] = useActionState(createChild, initial);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [grade, setGrade] = useState("");

  useEffect(() => {
    if (state.success) gaEvent("add_child");
  }, [state.success]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-bold text-slate-600">Child&apos;s first name</label>
          <input name="display_name" type="text" placeholder="Emma" className={inputClass} required />
        </div>
        <div>
          <label className="mb-1 block font-bold text-slate-600">Username</label>
          <input
            name="username"
            type="text"
            autoCapitalize="none"
            placeholder="sunnyfox"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-bold text-slate-600">Grade</label>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setGrade(g)}
              className={`h-12 w-12 rounded-2xl border-2 font-display text-lg font-bold transition ${
                grade === g
                  ? "border-[var(--brand-blue)] bg-blue-50 text-[var(--brand-blue)]"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <input type="hidden" name="grade" value={grade} />
      </div>

      <div>
        <label className="mb-1 block font-bold text-slate-600">4-digit PIN</label>
        <input
          name="pin"
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="1234"
          className={`${inputClass} max-w-40 tracking-[0.3em]`}
          required
        />
        <p className="mt-1 text-sm text-slate-400">Your child uses this to log in.</p>
      </div>

      <div>
        <label className="mb-1 block font-bold text-slate-600">Pick an avatar</label>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {AVATAR_DEFS.map((a) => (
            <button
              type="button"
              key={a.id}
              onClick={() => setAvatar(a.id)}
              title={a.name}
              aria-label={a.name}
              aria-pressed={avatar === a.id}
              className={`aspect-square rounded-2xl border-2 p-0.5 transition ${
                avatar === a.id
                  ? "border-[var(--brand-orange)] bg-orange-50 scale-110"
                  : "border-transparent hover:bg-slate-100"
              }`}
            >
              <Avatar id={a.id} className="h-full w-full" />
            </button>
          ))}
        </div>
        <input type="hidden" name="avatar" value={avatar} />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 font-semibold text-emerald-700">
          ✅ {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-pop w-full px-6 py-3 text-lg text-white"
        style={{ background: "var(--brand-orange)" }}
      >
        {pending ? "Adding…" : "Add child"}
      </button>
    </form>
  );
}
