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

# 2. Apply schema + seed (thousands of K–5 questions, 11 badges, 2 subjects)
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

## The question bank

The bank holds **thousands of questions per grade** and is produced by a generator
rather than authored by hand — a deliberate "library, built with AI" design (we do
**not** generate questions live per request: a wrong answer key would teach a child
something false, and live generation adds latency, cost, and unreviewed content).

```bash
npm run generate:questions      # rewrites supabase/seeds/questions.sql
supabase db reset               # reloads seed.sql + seeds/questions.sql
```

Two engines fill it (`scripts/generate-questions.mjs`):

- **Math** — deterministic template generators. Every answer is **computed**, so it's
  correct by construction, and the space is combinatorial (thousands of distinct items
  per grade). Distractors are plausible near-misses (off-by-one, place-value slips),
  not random numbers.
- **Reading** — an **AI-authored content batch** (comprehension, inference,
  author's-purpose, vocabulary-in-context) embedded as data, plus foundational skill
  drills built from curated word banks (phonics, rhyming, synonyms/antonyms, affixes,
  grammar, spelling, contractions, homophones). Several hundred distinct items/grade.

Every row passes a **structural verifier** (exactly 4 distinct choices, valid answer
index, non-empty prompt) before it's written; math answers are additionally
re-computed independently. Output is **deterministic** (seeded PRNG) so the SQL diff is
stable across runs. `standard` is only tagged with **real** Florida B.E.S.T. codes that
the curated `seed.sql` already uses — anything uncertain is left `NULL` rather than
faked. The original 72 hand-tuned questions still live in `seed.sql` and load alongside.

> **Scaling reading further:** math scales to true thousands/grade for free; high-quality
> reading comprehension is the limiting factor. To push reading into the thousands, wire
> an offline LLM batch (generate → second-model verify answer + grade-fit + safety →
> human spot-check a sample → insert) keyed on an `ANTHROPIC_API_KEY`. The current
> generator is structured so that batch can drop straight into `comprehension()`.

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
  seed.sql                    Subjects, badges, 72 hand-tuned questions
  seeds/questions.sql         Generated question bank (thousands/grade) — do not hand-edit
scripts/
  generate-questions.mjs      Question-bank generator (npm run generate:questions)
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
  supabase db push          # applies BOTH migrations (schema + adaptive engine)
  # Load seed content. `db push` does NOT run seed files, and config.toml's
  # sql_paths is local-only — so load both files explicitly, in this order:
  psql "<hosted DB connection string>" \
    -f supabase/seed.sql \           # subjects, badges, 72 curated questions
    -f supabase/seeds/questions.sql  # generated bank (~7,340 questions/skills)
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
- [x] Expand the question bank to thousands/grade — see **The question bank** above
      (`npm run generate:questions`). Adding more subjects still just means inserting
      into `subjects` and extending the generator.
- [ ] Have a teacher spot-check a sample of generated reading items for grade-fit before
      a wide launch (math answers are computed, so they're correct by construction).

---

## Verified

`npm run build` passes, `tsc --noEmit` is clean, and an end-to-end script exercised the
full flow against the live DB (19/19 checks), including **RLS isolation** between two
parents and **anti-tamper** on student XP.

**Question bank** (`npm run validate:questions`): 7,340 generated rows parsed
independently — 0 structural defects, and **3,914 computable math answers re-derived
from the prompt with 0 mismatches** (arithmetic, decimals, order-of-ops, area, volume,
rounding, skip-count, place value, factors, fraction equivalence). Answer positions are
evenly distributed (no "always B" bias). The file was loaded into local Postgres inside
a rolled-back transaction: **all rows accepted** (jsonb, `grade` check-constraint, FK to
`subjects`), the DB's own constraint scan found 0 bad rows. Reading items are
**AI-authored / bank-built and structurally linted — not answer-recomputed**; a teacher
should spot-check reading grade-fit before launch (see the hardening checklist).
