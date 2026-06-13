# ☀️ SummerSharp

A fun, web-based summer learning app that keeps **Florida elementary students (K–5)**
sharp over the break. Kids practice **Math** and **Reading** (tagged to Florida
**B.E.S.T.** domains), earn XP, build daily streaks, and unlock badges. Parents own
the account and watch their kids' progress.

Built with **Next.js 16** (App Router) + **Supabase** (Postgres, Auth, RLS).

---

## How it works

### Accounts (COPPA-aware by design)
- **Parents** own the account — they sign up with email + password.
- **Parents create each child's login** server-side. Kids log in with just a
  **username + 4-digit PIN** (no email, nothing collected from the child directly).
- A `parent_child` table links them; **Row Level Security** guarantees a parent only
  ever sees their own kids.
- XP, streaks, badges, and answer keys are written **only through `SECURITY DEFINER`
  database functions** — never editable from the browser, so progress can't be faked.

### Roles & routes
| Route | Who | What |
|---|---|---|
| `/` | everyone | Landing + login choices |
| `/signup`, `/login` | parents | Create / access a family account |
| `/kids` | students | Username + PIN login |
| `/parent` | parents | Add kids, see progress, drill into a child |
| `/home` | students | Dashboard: XP, streak, subjects, badges |
| `/practice/[subject]` | students | The quiz loop (`math`, `reading`, or `daily`) |

---

## Local development

Prerequisites: **Node 20+**, **Docker** (running), and the **Supabase CLI**.

```bash
# 1. Start the local Supabase stack (Postgres + Auth + Studio)
supabase start

# 2. Apply schema + seed (72 K–5 questions, 11 badges, 2 subjects)
supabase db reset

# 3. Run the app
npm install
npm run dev
```

- App: http://localhost:3001 (or 3000 if free)
- Supabase Studio: http://localhost:55323
- Test emails (Mailpit): http://localhost:55324

> This project's local stack uses **+1000 ports** (API `55321`, DB `55322`, Studio
> `55323`) so it can run alongside another Supabase project. See `supabase/config.toml`.

Env vars live in `.env.local` (see `.env.example`). Read live local values any time with:
```bash
supabase status -o env
```

### Brand asset
Drop the SummerSharp logo at **`public/logo.png`** and it appears in the header and
landing hero automatically. Until then, a styled "SummerSharp" wordmark is shown.

---

## Project layout

```
src/
  app/
    page.tsx                  Landing
    login/  signup/  kids/    Auth pages
    home/                     Student dashboard
    practice/[subject]/       Quiz loop (PracticeClient is the interactive island)
    parent/                   Parent dashboard
    parent/child/[id]/        Per-child progress
    actions/                  Server actions (auth.ts, children.ts)
  components/                 BrandLogo, Confetti, XpBar, forms, ...
  lib/supabase/               client.ts (browser), server.ts (SSR), admin.ts (service-role)
  lib/auth.ts, lib/types.ts
  proxy.ts                    Next 16 request proxy → refreshes the Supabase session
supabase/
  migrations/                 Schema, RLS policies, RPCs, triggers
  seed.sql                    Subjects, badges, questions
```

---

## Going to production (hosted Supabase + Vercel)

The app runs fully on the local stack today. To ship it:

### 1. Create a hosted Supabase project
- Create a project at https://supabase.com/dashboard.
- Link and push the schema/seed:
  ```bash
  supabase login
  supabase link --project-ref <your-project-ref>
  supabase db push          # applies supabase/migrations to the hosted DB
  # optional: load seed content into the hosted DB
  psql "<hosted DB connection string>" -f supabase/seed.sql
  ```
- In the hosted project's **Auth settings**, keep email confirmations **on** for parents
  (the local stack disables them for convenience).

### 2. Deploy to Vercel
- Import the repo at https://vercel.com/new.
- Set environment variables (Project → Settings → Environment Variables):
  | Name | Value |
  |---|---|
  | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your project's **publishable** key |
  | `SUPABASE_SERVICE_ROLE_KEY` | your project's **secret** key (server-only) |
  | `NEXT_PUBLIC_CHILD_EMAIL_DOMAIN` | e.g. `students.summersharp.app` |
- Deploy. Vercel auto-builds with `next build`.

### Before real users (hardening checklist)
- [ ] Raise `minimum_password_length` back to 8+ in `supabase/config.toml`; the app
      already enforces 8+ for parents — keep kid PINs short via app logic instead.
- [ ] Add a privacy policy / COPPA consent step for parent-provisioned child accounts.
- [ ] Add rate limiting on auth + abuse protection (Supabase + Vercel firewall).
- [ ] Expand the question bank and add more subjects (the schema already supports them —
      just insert into `subjects` and `questions`).

---

## Verified

`npm run build` passes, `tsc --noEmit` is clean, and an end-to-end script exercised the
full flow against the live DB (19/19 checks), including **RLS isolation** between two
parents and **anti-tamper** on student XP.
