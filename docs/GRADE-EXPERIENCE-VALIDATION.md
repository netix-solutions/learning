# Grade experience verification

Verified 2026-09-13. The grade-specific interface, content, and rewards remain the scope; this is not a claim of complete curriculum coverage or measured child engagement.

- K–5 have distinct settings and garden scenery. Round lengths are 5, 6, 7, 8, 10, and 12 questions; early grades default to narration and larger touch controls. Practice quizzes remain the primary home action.
- The browser interaction regression covers matching, ordering, sorting, word selection, and true/false at 320, 390, 768, and 1024px for each grade. It checks submitted values, reset between consecutive questions, touch target height, and page overflow. Chromium and WebKit passed.
- The complete-round regression uses the actual PracticeClient with isolated API responses, verifies each grade's round length and three core subjects, simulates a failed save and retry, and checks completion counts at 320 and 768px. Chromium and WebKit passed. Service workers are blocked in this mock test because WebKit service-worker requests bypass interception. This does not test offline service-worker behavior.
- The voice failure notice now participates in page layout; it cannot cover quiz buttons. Early-grade round tests verify its position above the quiz.
- `test-grade-quiz-progress.sql` verifies real local database selection for all six grades and three subjects, response fields without answer keys, saved incorrect attempts, the five-attempt flower boundary, and isolation between students. All fixtures roll back; no test accounts remain.
- `test-learning-progress.sql` verifies lesson resumption, checkpoint gates, first-answer preservation, completion, student ownership, parent visibility, and restricted write functions. Its fixtures also roll back.
- `validate-recorded-reading.cjs` starts and stops both recorded passages for each of K–5 with touch gestures in WebKit. Actual MP3 responses and playing state are checked; no synthetic/browser-default narration is used. All 12 passed.
- `validate-garden.mjs` checks practice and lesson reward boundaries, partial progress, and absence of spending.

The local database had coupon and lesson tables created outside migration history. Their columns were inspected; missing migrations were applied in one transaction, preserving existing tables and data, refreshing their functions/policies, and recording history. The local migration command now reports up to date through migration 23.

Run browser regressions with a running development app and `PLAYWRIGHT_MODULE` pointing to playwright-core; set `BROWSER=webkit` for WebKit. Database regressions require local Supabase and `psql -v ON_ERROR_STOP=1`. Device-sized automated browser checks are not physical iPhone/iPad testing.

## Final visual and behavior audit

The final WebKit layout regression covers home, reading, science, every introductory lesson's three teaching steps, and garden patch navigation for all six grades at 320×740, 390×844, 768×1024, and 1024×768. Screenshots for each grade's home, reading, science, and lesson views were visually inspected. All passed. The quiz regression now enables reduced motion and confirms that generated confetti elements have no display or animation.

Review found and corrected worked-example ordering in the plant, silent-e, prefix, water-state, and energy lessons. Each lesson's three displayed examples was compared with its three explanations. Existing ElevenLabs recordings still match the spoken text; the 276-clip validator passes. The Kindergarten blending instruction now calls “A mat” words rather than a complete sentence.

| Requested behavior | Implementation and evidence |
| --- | --- |
| A distinct experience for every grade K–5 | Six named settings, accent palettes, garden scenes, grade-specific introductions, 5–12-question pacing, narration defaults, and typography; `grade-experience.ts`, grade validator, and six rendered home screens. |
| Age-appropriate interface | Larger early-reader text and touch targets; quieter older-grade backgrounds and type; passages separated from questions; primary practice action followed by optional lessons. Home and interaction checks cover every grade. |
| Grade-appropriate questions | Grade-filtered math, reading, and science banks; progressively longer original reading passages and evidence tasks from pictured objects to repeated trials. Local database tests verify grade/subject selection; independent math-answer checks, lesson review, reading and science validators pass. This is practice content, not a claim of a complete curriculum. |
| Useful graphics and engaging activities | Native math manipulatives preserve quantities, science pictures/charts/tables represent the displayed evidence, five answer interaction types work with touch, and six garden settings show persistent progress. Visual inspection and interaction regressions pass. Engagement is a design assessment; child retention has not been measured. |
| Clear, suitable rewards | One flower for five attempted questions or a completed lesson, including mistakes; no spending or loss for taking breaks. Grade-specific scenery, garden boundaries, patch navigation, saved progress, and student isolation checks pass. |
| Easy use on phones and iPads | Four portrait/landscape dimensions checked in WebKit, with earlier Chromium coverage; full rounds, retries, selection resets, narration touch playback, readable arithmetic, and reduced motion verified. Physical devices were not used. |
| Practice primary, learning secondary | Home link order and displayed hierarchy verified; primary link starts mixed practice containing all three core subjects. |
| ElevenLabs narration | Content-matched recorded files and ElevenLabs runtime speech; 276 assets validate, 12 recorded passages play and stop in WebKit, and speech tests reject system-voice fallback. |

The remaining limits above concern real-world engagement measurement, physical-device testing, and full curriculum coverage. They are not represented as completed tests. Existing unrelated effect-style lint findings remain in older components; type checking, production builds, and the targeted functional checks pass.
