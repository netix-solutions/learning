# Learning upgrade — active work

Objective: children in Pre-K–5 should be able to spend about 20 minutes nightly learning reading, math, science, and additional Florida curriculum topics through accessible instruction, meaningful animation, guided practice, independent checks, and spaced review.

Completion requires more than a quiz facelift:
- Verified grade-by-grade Florida benchmark mapping and coverage, with prerequisite sequences and explicit gaps.
- Systematic foundational reading: sound awareness, phonics, blending, decoding, connected text, vocabulary, comprehension, and fluency practice.
- Math instruction using concrete representations, worked examples, gradual release, and transfer questions.
- Science explanations, observation/prediction activities, and evidence-based checks; additional subjects included in the progression.
- A coherent approximately 20-minute routine with saved progress, recovery, adaptive review, and parent-visible learning evidence.
- Accessible mobile UI, read-aloud support that does not invalidate reading assessment, purposeful animations, reduced motion, and robust loading/error states.
- Content validation, meaningful behavioral checks, build validation, and visual inspection on mobile and desktop.

Evidence sources:
- Florida official standards hub: https://www.fldoe.org/academics/standards/
- Florida mathematics: https://www.fldoe.org/academics/standards/subject-areas/math-science/mathematics/
- Florida ELA: https://www.fldoe.org/core/fileparse.php/7539/urlt/elabeststandardsfinal.pdf
- IES foundational reading guide: https://ies.ed.gov/ncee/WWC/PracticeGuide/21/Published

Initial inspection: existing app has adaptive bank questions, post-error teaching, visual arithmetic, activity tracking, rewards, and parent goals. It lacks a coherent instruction-first curriculum and sustained nightly lesson sequence. README describes an older version. Benchmarks and actual bank coverage need auditing; a standards label alone does not establish alignment. Improved learning outcomes require learner evidence and must not be promised based on UI changes.

## Implemented foundation
- `/learn` is an authenticated, entitlement-gated lesson route linked from the child home page.
- 21 authored introductory lessons: reading/math/science for each of PK, K, 1–5. These are introductions, not complete grade curricula.
- Learner-controlled example reveals, narration controls, guided and distinct transfer questions, explanatory feedback, and reflection. Reduced-motion treatment for reveals.
- Server-backed lesson attempts, checkpoints, answers, and support requests, with cross-device resume and parent-visible learning evidence; no mastery or XP awarded for completing lesson screens. Active lesson time uses the existing activity tracker.
- Development-only `/learn-preview?grade=K` enables review without touching a child account; activity tracking is disabled there. Production preview returns not-found.
- Content validator checks all 21 entries and 42 question structures and independently recomputes all seven math transfer answers.
- Browser-tested K reading path: step navigation, wrong-answer feedback, distinct transfer, reflection, and explored marker surviving reload. Inspected 390px phone rendering without horizontal overflow.
- Changed-file lint passed. Final production build (including preview/footer additions) passed with TypeScript checks.

## Next work (full objective remains active)
1. Replace the introductory-only selection with a prerequisite-based curriculum and verify each benchmark against official Florida source text. Audit the existing question bank's skill and grade coverage.
2. Build meaningful manipulatives and systematic phonics activities, including reliable phoneme audio; ordinary text-to-speech of slash notation is not reliable phonics instruction. Add decodable text and comprehension/fluency practice with adequate progression.
3. Extend the saved lesson attempts and parent evidence into a complete nightly session plan. Lesson progress now resumes across devices; completion does not imply mastery.
4. Assemble the approximately 20-minute nightly plan, diagnostic entry, spaced retrieval, mastery criteria and next-lesson selection. Subject practice links currently lead to broad grade practice, not the exact lesson skill.
5. Expand science/inquiry and additional subjects. Complete editorial accuracy review and accessibility/behavior coverage across grades. Do not promise measurable gains until supported by learning-outcome evidence.

## Narration and manipulatives (2026-09-13)
User requirements carried forward: use generated ElevenLabs voice matching the lessons, never the default browser/OS voice; write clear child-facing explanations (the phrase “Un- means not here” was specifically rejected).

Implemented:
- Generated 196 ElevenLabs MP3 clips using the configured voice, multilingual v2, and one shared narration profile: 189 lesson segments and 7 math activity instructions. The existing key permits synthesis, though voice-metadata/quota endpoints return 401; synthesis itself was verified successful.
- Content-addressed files in `public/audio/lessons`; a manifest records text, voice/model/settings, file size, and SHA-256. `generate:lesson-audio` reuses matching assets and persists progress after every clip.
- Exact narration matching chooses recorded clips; revised scripts never use obsolete audio. Dynamic quiz/tutor text still uses authenticated `/api/tts` with the same voice profile.
- Removed browser speech fallback across the app. Playback exposes loading, stop, retry, and read-on states, including auto-read failure notices. Cancels stale requests and guards old audio events. Server no longer silently truncates at 600 characters.
- K blending narration uses sound anchors (moon/apple/top) rather than asking TTS to pronounce slash notation. This does not replace the still-needed validated isolated-phoneme recordings and systematic phonics curriculum.
- Rewrote prefix feedback to explicitly separate “un” and “fair” and define “not fair.” Revised unhappy/unclear explanations and regenerated all three affected recordings.
- Seven math Explore activities: one-to-one counting, joining groups, ten-frames, base-ten regrouping, equal-row arrays, equivalent-fraction bars, and hundredths grids. Students manipulate a representation before moving into guided questions. Final states remain readable with reduced motion.

Verification:
- `npm run validate:lessons` passes: 21 lessons, 42 question structures, seven math transfer keys, quantity-conservation checks, all 196 narration fingerprints/files, and controller regression tests for replay, error/retry, autoplay rejection, cancellation, stale events, and no system voice fallback.
- Native MP3 inspection accepted all 196 files, 44.1kHz MP3, positive bounded durations; the complete catalogue contains about 24.7 minutes of narration across all seven grades, not per nightly session. File checks and one verified browser playback do not establish expert auditory/phoneme quality review.
- Browser checked all seven activities through their final states; observed 3 tens + 12 ones becoming 4 tens + 2 ones, arrays totaling 12, fraction halves staying equivalent through 8/16, and decimal total 1.65. Recorded ElevenLabs playback reached the playing state.
- Production build passed including TypeScript. Changed-file lint passed in the prior run; final expanded lint run checked after this note.

Still open: the full curriculum/benchmark audit, explicit reading progression and fluency, richer science/additional-subject activities, adaptive 20-minute session sequencing, and broader content/accessibility evaluation. Lesson attempts are saved server-side; completion is not mastery. The overall goal is not complete.

## Saved progress release
Authenticated lessons now save each checkpoint and first answer through server actions. Database ownership checks, row locks, immutable answers, revision checks, and parent read policies protect learning evidence. Save failures offer retry without advancing. Parents see recent lessons and whether help/read-aloud was requested. Local transactional database tests cover progression, resume, duplicate requests, completion, ownership and parent isolation, and mutation privileges.

## Curriculum inventory follow-up
See `CURRICULUM-AUDIT.md` and generated `curriculum-inventory.json` for the current repository inventory and seven verified math-strand corrections. The current bank has 12,978 generated rows, not the older 7,340 figure. Full item-level alignment remains open. Migration 20 is prepared for the next release; migration 19 is deployed.
