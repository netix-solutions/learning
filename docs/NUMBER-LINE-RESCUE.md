# Number Line Rescue

An original interactive math question for grades 1 and 2. Students choose an
operation and a two-digit distance, then watch their spaceship move in jumps of
ten and a final jump for the remaining ones. For example: 41 → 51 → 61.

- Questions appear within normal math and mixed practice for grades 1 and 2;
  there is no separate Home shortcut.
- Grade 1 starts within 20, then moves to jumps of ten within 100.
- Grade 2 starts with tens, then combines tens and ones, including crossing tens.
- Each grade has three stages of 12 questions (six addition, six subtraction).
- Answers are `[direction, distance]`; the existing server scorer awards credit.
- Existing independent/helped progress, retries, rewards, narration and correct
  answer celebrations are reused. Replaying a solution never submits an attempt.
- Reduced-motion users see the completed path immediately. Controls work by
  keyboard or touch; no dragging or timed answering is required.

## Content and checks

Edit `scripts/number-line-content.mjs`, then run:

```sh
npm run generate:number-line
npm run validate:number-line
npm run validate:math-progression
npm run build
node scripts/build-number-line-test.mjs > /tmp/sunsharp-number-line-test.sql
supabase db query --linked --file /tmp/sunsharp-number-line-test.sql
```

The SQL integration test runs inside a rollback-only transaction with isolated
test users. It checks all 72 answers, additive/idempotent content, selection,
progression, credits, wrong answers, repeat requests and recorded hint use.
It preserves existing questions, users, attempts and balances.

Local visual preview: `/quiz-preview?grade=2&scenario=numberline` (also grade 1).
It exercises the practice UI without saving answers or rewards and is unavailable
in production. Check correct, incorrect, replay, hint, keyboard, mobile layout and
reduced-motion behavior there.

## Release order

Deploy the question renderer first, then apply only the
`number_line_rescue` migration. It extends the question-kind constraint and
inserts the authored rows; it does not replace scoring functions or permissions.
If remote migration history differs from the checkout, apply this exact migration
through the connected Supabase migration tool rather than repairing unrelated
history or replaying previous migrations.

The initial release passed build, lint, content and rollback-only database checks.
Visual interaction testing was unavailable because the connected Mac was locked.
