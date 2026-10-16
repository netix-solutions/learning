# Reading library release verification

- 56 original stories: eight each for PK, K, grades 1–5.
- 152 comprehension questions, with authored answers and page evidence; answers stay server-only until submission.
- 64 generated illustrations: 56 story images and eight collection images, optimized WebP (about 15 MB total, loaded per visible book/page). Built-in image generator used; full prompts in docs/reading/COLLECTION_PROMPTS.md and docs/reading/STORY_PROMPTS.md.
- All grades 1–5 have one supported mid-story question after page two; the remaining questions follow the ending. PK/K use an early check only where the text supports it.
- TypeScript, targeted ESLint, production build, content validator and timing-boundary checks passed.
- Browser flow exercised at desktop 1280×720, phone 390×844, iPad portrait 768×1024, including text sizing, page turns, vocabulary, look-back help, correct and wrong answers, completion and retelling. Physical-device Safari testing is still distinct from these viewport checks.
- Database rollback tests: session ownership, zero-credit open, duplicate and stale snapshots, overlapping tabs, inactivity cap, page bounds, monotonic time, first-answer retention, student/linked-parent visibility, stranger/anonymous denial, internal clock denied to client roles. Test-only users and telemetry rolled back.
- ElevenLabs successfully generated narration for a story page using the app’s existing production voice configuration.
- Authenticated local API integration against the linked backend: owner/origin/auth validation, checkpoint gating, time persistence, first-attempt retention, completion, bookmark and server answer isolation. Generated QA accounts removed in finally blocks.
- Active time uses a monotonic clock, pauses on hidden tabs or after 120 seconds without interaction, and separates narration playback. Sessions require an online opening handshake. Snapshots retry from account-scoped device storage. Server caps an unacknowledged interval at two minutes and prevents overlapping credit across devices; this is an engagement estimate, not fluency measurement.
- Parent reports distinguish book completion, time without/with narration, and first comprehension answers with/without explicit look-back help. Retelling is not automatically scored.
- Migration reading_library was applied through Supabase MCP, remote version 20261016010800. Local filename matches this applied version. Unrelated pre-existing migration-history differences were left intact.
- Security advisors: no new warnings. reading_clock has intentionally no client policies or grants; its RLS-enabled/no-policy informational notice is expected. Existing unrelated function and Auth warnings are unchanged.

Re-run: npm run validate:books; npx eslint src/components/reading src/app/reading src/app/book-preview src/app/api/reading src/lib/books/*.ts; npm run build.

Database test: wrap supabase/tests/reading_library.sql in BEGIN/ROLLBACK on a database with the migration applied. Never run without the rollback wrapper.

API test: RUN_READING_LIVE_TEST=1 node --env-file=<private-env-file> scripts/test-reading-api.mjs against a running local server with matching backend configuration. The opt-in test creates and removes only its own generated account. Optional READING_TEST_VOICE=1 requests one story-page narration from the existing live ElevenLabs endpoint.
