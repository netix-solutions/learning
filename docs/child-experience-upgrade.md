# SunSharp child experience upgrade

Goal: a polished, playful K–5 learning app for iPad, phone PWA, and laptop; responsive to demonstrated learning, with compelling reward worlds and useful parent insight.

## Completion evidence required

- Child navigation and tasks work at 390×844, 768×1024, 1024×768, and laptop sizes; no obscured controls or accidental page overflow. Touch targets at least 44px. Keyboard and reduced-motion alternatives work.
- Installed launch enters the child flow, supports both tablet orientations, respects safe areas, and recovers gracefully from interrupted connections without falsely claiming an answer or purchase saved. Shared devices never receive another child's cached content.
- K–5 questions include accurate curriculum coverage and meaningful interactive formats. Read-aloud uses ElevenLabs. Saved evidence adjusts challenge gradually, offers supported recovery after difficulty, and avoids repetitive rounds. Parent grade remains authoritative.
- All existing reward themes (garden, train, dinosaurs, bakery) gain a satisfying earn/build/play loop, understandable goals, collection feedback, and durable ownership. No punitive missed-day mechanics. Reordering, confirmation, and 50% refunds remain correct.
- Parent reports distinguish participation, supported performance, independent mastery, recent trends, strengths, and next practice priorities. Do not infer mastery from token balances or raw lifetime accuracy alone.
- Complete child and parent flows pass current runtime/browser and database verification; production is checked after deployment. A successful build alone cannot prove this objective complete.

## Current audit (2026-10-03)

The app has grade-specific presentation, interactive question types, recorded lesson guidance, four reward themes, persisted lesson runs, and parent subject/skill views. Current adaptive selection emphasizes freshness and weak skills but ignores question difficulty. It loads a whole round upfront. No evidence yet proves age-aware progressive challenge or independent-mastery reporting.

The initial PWA was portrait-only and launched the marketing page. Mobile navigation behaved like a website header; previews accidentally used the marketing footer. Offline navigation only showed a retry page. These are being addressed first.

## Work sequence

1. Tablet/phone app foundation: child tab navigation, orientation, installed launch, safe areas, connection feedback, educational offline fallback, reliable question loading.
2. Learning progression: verify grade/skill coverage and difficulty distribution; implement tested mastery-aware difficulty and scaffolded recovery, question freshness, and appropriate stretch opportunities.
3. Reward worlds: improve shared earning goals and celebration; make each theme feel like a playable collection with clear next unlocks and accessible item controls.
4. Parent insight: recent skill evidence, growth and support used, useful actionable summaries, transparent uncertainty when evidence is sparse.
5. End-to-end quality: all grades, tablet orientations, phone/laptop, installed PWA, reduced motion, keyboard/screen readers, interrupted connections, persistence, and live deployment.

## Status

Active. Full completion is unproven. Track verified improvements and outstanding requirements here across goal turns.

## Verified progress: app foundation

- Manifest launches `/home`, permits both orientations, and includes practice/reward shortcuts.
- Shared child-route rules fix preview footers and include practice in persistent navigation. Tablet/phone tabs are 62px high; 390px phone and 768px tablet inspections found no horizontal page overflow. Laptop uses header navigation.
- Offline counting game supports correct/incorrect feedback, keyboard focus on the next round, and a cached ElevenLabs instruction clip. It clearly awards no tokens or saved progress.
- Question fetch errors show a recoverable retry state rather than falsely claiming no content exists. Reads time out after 15 seconds. Answer grading and purchase behavior are unchanged.
- Service-worker tests verify authenticated navigation is never cached, cross-origin APIs bypass it, failed static responses aren't cached, and cache cleanup only removes this app's old caches.
- Browser review: iPad portrait home; phone home and offline counting; iPad landscape question error state. No console errors in the reviewed error state. Actual installed-PWA lifecycle, offline connection notice, Safari hardware behavior, successful authenticated quiz/parent flows, and broader interaction quality still require verification.

## Learning evidence audit

Local bank contains difficulty levels 1–2 for K–3 and levels 1–3 for grades 4–5 (PK only level 1). `get_adaptive_questions` ignores this difficulty field; freshness/diversity takes precedence over weak-skill priority. `get_skill_mastery` can call a skill mastered after four attempts with the last three correct, without distinguishing help or repeated questions. The whole practice round loads before play. These findings guide the next implementation; they do not prove adaptive challenge achieved. Local migration history is behind the checked-in reward migrations, so inspect actual function definitions and production history before any schema deployment.
