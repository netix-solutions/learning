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

The app has grade-specific presentation, interactive question types, recorded lesson guidance, four reward themes, persisted lesson runs, and parent subject/skill views. The previous adaptive selector ignored difficulty and loaded the whole round upfront. The new progression slice below now responds to independent evidence, but limited bank coverage prevents full progressive challenge across every skill.

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


## Verified progress: independent practice and parent evidence

- Migration `20261004025344_progressive_practice.sql` is applied to production. New RPCs require authentication, enforce the learner’s parent-selected grade, and withhold answer keys until grading. Parent reads require `can_view_student`. Legacy RPCs remain available for older clients.
- Answer retries reuse a request ID; the database serializes grading for the learner and returns the original result rather than awarding twice. Changed answers cannot reuse that ID. Known help is stored separately; old answers remain NULL/unknown.
- Progress uses the latest answer to each distinct question. Four independent questions with at least 80% correct and the last three independent/correct establish a difficulty level. Two misses or helped answers among the last three trigger supported recovery. One correct recovery answer does not jump back immediately.
- Practice refreshes the next question after each saved answer, preserves the round’s subject mix, excludes questions already in the round, and uses a new same-skill question after a miss. Supported follow-up answers remain marked as helped. Interaction state resets when a new question is loaded.
- Parent evidence is near the top of the child report: independent success, helped questions, current bank challenge, strengths, and support priorities. Expandable home teaching tips remain available. Failed report reads are identified explicitly rather than presented as no practice.
- K–5 database integration passed locally and on production in a rolled-back transaction: every authored subject selected; all 16 available grade/format combinations graded correctly and incorrectly; request deduplication, repeated-question exclusion, supported/legacy evidence, recovery, grade limits, unrelated learner access, and linked parent access verified. Confirmed no production test users remain.
- Authenticated local browser check: independent miss → fresh same-skill follow-up → correct helped answer → updated review question. Stored rows match the distinction. Parent report matches the test learner’s evidence, tips expand, and phone/iPad portrait/landscape widths have no page overflow. Reviewed quiz console had no errors.
- Local selector measured approximately 8ms for a seven-question grade-2 math request. TypeScript and scoped ESLint checks passed.
- The new functions intentionally allow signed-in callers as SECURITY DEFINER because questions have no direct read policy and grading writes protected rewards. Each has explicit authorization and a fixed search path. Anonymous execution is revoked. The [Supabase advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) flags those intentional endpoints; review the older endpoint/security baseline separately before a full completion claim.

## Remaining content and experience gaps

Production audit: 194 tagged skills across K–5; 184 have only one difficulty level. Skills with fewer than four questions at a level: K 1, grade 1 8, grade 2 10, grade 3 3, grade 4 2, grade 5 2. Single-level skills: K 26/26, grade 1 35/36, grade 2 34/36, grade 3 29/32, grade 4 29/32, grade 5 31/32. Therefore the engine alone cannot satisfy progressive challenge across all skills. Expand and curate the bank, especially scaffolded questions, comprehension and interactive formats; verify curriculum accuracy and distinct skill tagging. Do not relabel existing questions just to make the difficulty count look better.

The full four-world reward redesign, richer parent trends and lesson recommendations, complete rounds for every grade, and actual installed iPad/Safari PWA lifecycle remain unverified/incomplete. The goal remains active. The previous train scrollbar turn made progress: committed/deployed `ed5ef2f`, inspected a longer train, and verified production CSS.

## Verified progress: grade-bound math stages (2026-10-04)

- Production migration `20261004152501_math_progression_content.sql` adds 576 distinct tasks: 24 core math skills, eight questions at each of three stages. There are 512 multiple-choice questions and 64 matching/ordering tasks. All four MCQ answer positions are balanced; each interactive stage uses six answer-position permutations.
- The independent validator recomputes every answer from the visible prompt/payload, checks ambiguity and key number/denominator bounds, and verifies the generated seed is current. Stages vary guidance, representation, and application within the selected grade; they are authored practice levels, not a psychometric assessment or full benchmark coverage.
- Local additive insertion test verified that replay inserts no duplicates and changes no previous question rows. Production replay verified the same invariants. Existing attempts and reward ownership remain attached to their original question IDs.
- Database integration passed locally and on production in rollback-only transactions: all 576 answers graded correctly, every skill selected four questions at stages 1/2/3 after independent evidence, and two helped answers caused recovery to stage 2. No production fixture users remain. The existing practice regression test also passed locally across all K–5 subjects and 19 grade/format combinations.
- The live bank has 13,737 questions. Of 194 tagged K–5 skills, 164 still have just one difficulty level (K 23, grade 1 32, grade 2 33, grade 3 25, grade 4 24, grade 5 27). The wider content requirement remains incomplete.
- Curriculum references: [FDOE B.E.S.T. mathematics standards](https://cdn.fldoe.org/core/fileparse.php/18736/urlt/StandardsMathematics.pdf) and [grade instructional guides](https://cdn.fldoe.org/academics/standards/subject-areas/math-science/mathematics/bestmath.stml). Tags identify relevant strands and partial practice, not verified coverage of every benchmark.

## Practice layout: keep one turn together

- Active practice uses a compact grade/read-aloud toolbar, a thin progress bar, smaller card spacing, and two columns for short answer choices. Decorative scene images do not consume answer space.
- Reading passages and science evidence sit beside answer choices on tablets/laptops. Long evidence is independently scrollable and keyboard-focusable. On phones it uses a compact panel above the question; readable text and 48px/56px answer targets are retained.
- Next/retry/recovery actions stay above the child tab bar. Answer explanations can scroll within their panel; full teaching remains in the existing Teach me dialog. Each new question resets page position and focuses the practice region.
- Loading/error states account for the app header/tab bar instead of adding a whole extra viewport. The child footer is omitted during active practice. Development previews use the actual PracticeClient with isolated fixture answers; no attempts, activity, or rewards are saved, and those routes remain unavailable in production.
- Local verification: 390×844 phone — kindergarten wrong-answer feedback and continuation, matching, stacked arithmetic, longest authored grade-5 story with all choices, and grade-1 science choices. 1024×768 iPad — math choices, reading/feedback/Next, ordering answer submission. New-question transition resets selection and page position. Four-item sorting and portrait tablet verification are recorded below after the final checks.
- An old development stylesheet cache interfered with review. Development now unregisters only this app's own PWA worker; production registration and offline behavior remain intact. TypeScript, scoped ESLint, production build, and PWA worker isolation tests passed.

The four-world reward redesign, progression for the remaining subject/skill content, fuller parent trends and recommendations, actual installed iPad/Safari testing, and older security advisor findings still require work. Full goal completion remains unproven.
- Final sorting check: four kindergarten items at 390×844 retain 56px targets; Check is at y=707 (navigation starts y=765). Incorrect-answer review shows chosen/correct categories, explanation, Teach me/Try similar/Finish together; document height is 844px and actions end at y=724.
- Final long-story check: 390×844 document height is 844px, with the last answer at y=731 (navigation y=765). iPad portrait 768×1024 also has no page overflow. At 1024×768, PageDown scrolls the passage 236px while page scroll stays zero; answer choices remain visible. Reviewed preview console has no errors. No universal no-scroll claim is made for enlarged text, very short displays, or unusually long answer sets; content remains reachable, with Check/continuation sticky above the navigation.

## Follow-up: responsive question turns (2026-10-04)

The previous sticky Check/continuation behavior could cover the last sorting item or the explanation on a short phone. Those controls now follow content without overlapping it. Sorting uses two compact cards per row on phones at least 360px wide; touch targets remain 56px for kindergarten/grade 1 and 48px for older grades. Wider screens up to 850px tall place the question beside the interaction. Short-screen spacing adapts without clipping content or disabling zoom/document scrolling.

After grading a multiple-choice answer, review retains the learner's answer and the correct answer, removing other distractors to give the explanation and continuation room. Long reading passages remain independently scrollable; on phones the review passage is shorter. The development interaction preview has a compact toolbar and a separate sample-continuation control.

Browser evidence using the actual PracticeClient fixtures: 390×667 kindergarten sorting shows all four items and Check with document height 667; correct review/continuation fits above the tab bar (rounding leaves approximately one pixel of document overflow). At 390×844, the longest authored grade-5 reading example fits all choices, and incorrect review retains two choices, explanation and three recovery actions within one viewport (actions bottom 760, navigation top 765, document height 844). Matching fits at 1024×768; grade-5 ordering fits at 768×1024. Reviewed console has no errors. A 390×667 screen still needs document scrolling for the longest grade-5 story answer set; readable content is preserved. This is not a universal no-scroll guarantee, nor an actual Safari/PWA device test.

TypeScript, scoped ESLint and production build are checked for this update. The full goal remains active, with the remaining requirements listed above.

### Music and reward sounds — October 5, 2026

Added six Kevin MacLeod CC BY 4.0 instrumentals and eight short Kenney CC0 effects. Source records, original license text and asset hashes are under public/audio/licenses; public attribution is at /music-credits. Music rotates on home, changes with the saved reward theme, and stays quieter in practice/lessons. Shared Web Audio gain lowers music during ElevenLabs narration and supports iOS volume control. Separate persistent music/effect switches live in the student header. Playback pauses while hidden; effects are precached for offline use, while full music tracks load on demand.

Correct/retry/start/win cues and confirmed purchase/move/sell cues use the licensed effects. No reward economics changed. Unit checks cover cold decoding, failed-load retries, muting, debounce, track rotation, narration mixing and cleanup; PWA isolation tests pass. Browser review confirmed actual AAC playback without media errors, saved mute state after reload, dinosaur theme switching, a preview purchase (50 to 45 tokens), keyboard dismissal and menu fit at 320px. Actual Safari hardware playback has not been tested. Local production builds encountered an existing Google Fonts loader failure; clean deployment build verification is recorded separately. The broader app-upgrade goal remains active.

## Parent practice plans (2026-10-07)

The previous goal turn made progress: audio assets and controllers were committed as d6d6cb9 and production deployment dpl_E7zaD7kM6LgZy2EZMEjH617j26cN reached Ready. This turn inspected the current worktree and parent report before continuing.

Parents now receive at most two actionable next-practice suggestions above the detailed evidence. Skills in support take priority, then skills still building; candidates require known-help evidence and a last-practiced date within 30 days. Unavailable subjects, future/invalid dates, old practice, unknown-help-only evidence and duplicate skill rows do not create new priorities. Suggestions use existing teaching tips and nine reviewed same-grade/same-subject introductory lesson matches. The wording distinguishes related introductions from full skill coverage and fresh independent answers from practice with help. Lifetime hero metrics are explicitly labeled all-time.

Meaningful selector tests cover priority, deduplication, source immutability, sparse/stale/unavailable evidence, grade and subject boundaries, and valid lesson references. TypeScript, scoped ESLint and production build pass. The actual component was reviewed with synthetic evidence at phone 390×844 and tablet 768×1024: no horizontal overflow or console errors. The preview is development-only. This turn did not verify a newly authenticated parent session against production data; it reuses the existing authorized skill RPC results without adding reads or writes. Trend comparisons and broader lesson matching remain unfinished, as do the full reward redesign, remaining progressive content coverage and installed-device checks. The full goal remains active.

## Reward purchase reveals (2026-10-07)

Previous turn made progress: parent plans committed in ae6cbcf and deployed Ready to sunsharp.app. This turn inspected the shared reward state and three shops. Confirmed purchases now reveal the actual item against its themed scene, remaining tokens, and the count of currently owned distinct designs. Repeated items say “Another favorite”; sales, rearrangements and active-engine selection do not trigger discovery. Children can return to shopping or jump to their collection. Native dialog focus containment, explicit focus restoration, Escape, 48px controls, bounded phone height and reduced-motion CSS are included. No ownership/economy writes changed.

During review the user rejected the purchase beep. It is removed from purchases and token tallies, and delegated tap sounds are suppressed throughout reward shops. Visual purchase feedback remains. Existing correct-answer and win cues are unchanged.

Selector tests verify all shop types, idempotent ownership responses, duplicate-design counting, sale/reorder suppression and asset paths. Audio regressions, scoped ESLint and production build pass. Browser fixtures verified bakery first/duplicate purchases, engine and dinosaur reveals, collection focus/scroll, and Escape restoration. The 390×667 engine reveal fits with both buttons visible; reviewed console has no errors. Browser review caught and fixed a React Strict Mode dialog cleanup issue before release. This verifies local fixture interactions, not a newly authenticated production purchase or physical Safari device. The garden growth experience and fuller playable reward-world redesign still require work; the overall goal remains active.

## Garden flower hunt (2026-10-07)

Previous turn made progress: purchase reveals and removal of the rejected purchase beep shipped in 8db6d0c. The current garden was inspected before adding optional play with earned flowers.

The full garden now offers a quiet flower-matching hunt using only the kinds in the displayed patch. Children can retry without penalty, finish finding each kind, stop, or replay. Switching patches resets play. This is a reward-world activity, not adaptive curriculum evidence: it writes no attempts, mastery, ownership, or tokens. Existing garden growth and patch history stay intact. No click or success beep is added. Five short recorded ElevenLabs instructions use the existing voice and content-addressed audio manifest; changing or leaving the prompt stops its narration.

Browser fixture evidence: an 11-flower garden correctly offers one kind on patch 2 and five kinds on patch 1. Incorrect selection retains the question; all five matches reach completion; next actions receive keyboard focus. Recorded narration played successfully. Phone 390×844 and tablet 768×1024 have no horizontal overflow; tablet choices measure approximately 118×112px. A narrow flower label was corrected during review. No console errors were observed. Patch-boundary checks (0,1,5,10,11,20,21), all 285 narration manifest/hash checks, audio-file inspection of the five new clips, scoped ESLint, and production build pass. Physical iPad/PWA and authenticated production-garden checks are still outstanding. This small recognition game does not satisfy the remaining progressive-content requirement or complete the wider reward-world redesign. The goal remains active.
