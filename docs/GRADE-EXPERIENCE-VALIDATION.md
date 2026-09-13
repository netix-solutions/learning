# Grade experience verification

Verified 2026-09-13. The grade-specific interface, content, and rewards remain the scope; this is not a claim of complete curriculum coverage or measured child engagement.

- K–5 have distinct settings and garden scenery. Round lengths are 5, 6, 7, 8, 10, and 12 questions; early grades default to narration and larger touch controls. Practice quizzes remain the primary home action.
- The browser interaction regression covers matching, ordering, sorting, word selection, and true/false at 320, 390, 768, and 1024px for each grade. It checks submitted values, reset between consecutive questions, touch target height, and page overflow. Chromium and WebKit passed.
- The complete-round regression uses the actual PracticeClient with isolated API responses, verifies each grade's round length and three core subjects, simulates a failed save and retry, and checks completion counts at 320 and 768px. Chromium and WebKit passed. Service workers are blocked in this mock test because WebKit service-worker requests bypass interception. This does not test offline service-worker behavior.
- The voice failure notice now participates in page layout; it cannot cover quiz buttons. Early-grade round tests verify its position above the quiz.
- `test-grade-quiz-progress.sql` verifies real local database selection for all six grades and three subjects, response fields without answer keys, saved incorrect attempts, the five-attempt flower boundary, and isolation between students. All fixtures roll back; no test accounts remain.
- `test-learning-progress.sql` verifies lesson resumption, checkpoint gates, first-answer preservation, completion, student ownership, parent visibility, and restricted write functions. Its fixtures also roll back.
- `validate-garden.mjs` checks practice and lesson reward boundaries, partial progress, and absence of spending.

The local database had coupon and lesson tables created outside migration history. Their columns were inspected; missing migrations were applied in one transaction, preserving existing tables and data, refreshing their functions/policies, and recording history. The local migration command now reports up to date through migration 23.

Run browser regressions with a running development app and `PLAYWRIGHT_MODULE` pointing to playwright-core; set `BROWSER=webkit` for WebKit. Database regressions require local Supabase and `psql -v ON_ERROR_STOP=1`. Device-sized automated browser checks are not physical iPhone/iPad testing.
