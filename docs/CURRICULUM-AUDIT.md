# Curriculum audit — September 2026

Run `npm run audit:curriculum` to rebuild `curriculum-inventory.json` from the repository's two question seeds, additive reading stories, and the actual lesson catalogue. The parser validates column counts and refuses unsupported question-row syntax. The inventory is not a production database export; other migrations can populate legacy skill fields. Counts do not establish educational quality or benchmark coverage.

## Evidence and corrections

The [Florida Department of Education K–5 math progression](https://www.fldoe.org/core/fileparse.php/7576/urlt/Math-Standard-Progression-K-5.pdf), pages 1–6, supports these strand corrections. These are strand-level classifications, not claims that an item meets every benchmark in the strand.

| Skill | Previous tag | Corrected strand | Reason |
|---|---|---|---|
| K.compare | MA.K.NSO.3 | MA.K.NSO.2 | Compare numbers; previous strand is addition/subtraction. |
| 1.compare | MA.1.AR.1 | MA.1.NSO.1 | Numerical comparison belongs with number sense. |
| 1.shape | MA.1.M.1 | MA.1.GR.1 | Shape attributes belong with geometry. |
| 4.dec | MA.4.FR.3 | MA.4.FR.1 | Decimal/fraction relationships; FR.3 is not a listed strand. |
| 4.factor | MA.4.AR.2 | MA.4.AR.3 | Factor pairs belong with numerical patterns. |
| 5.volume | MA.5.GR.4 | MA.5.GR.3 | GR.4 addresses coordinates, not volume. |
| 5.deccmp | MA.5.FR.1 | MA.5.NSO.1 | Decimal comparison belongs with place value. |

Generator mappings and curated seed tags are corrected. Migration 20 updates matching existing questions without replacing IDs, choices, answers, or learner attempts. Regeneration changed only 1,348 standard fields in the generated bank. Seven curated rows also changed. Remaining tags still need item-level review.

Florida's [science standards](https://www.fldoe.org/academics/standards/subject-areas/math-science/science/) are separate from B.E.S.T. The parent panel now distinguishes the frameworks and labels its subject percentage as practice accuracy rather than standards completion. Marketing no longer claims every question is tagged or that coverage is 100% verified.

## Current supply

The generated bank has 12,978 rows; the curated seed adds 72. Earlier upgrade notes describing 7,340 generated rows are stale. The current independent validator checks all generated rows structurally and recomputes 6,981 math answers, with zero mismatches. This does not validate reading/science facts or prove instructional coverage.

There are 24 introductory lessons: one per core subject per grade, plus three additional first-grade reading lessons. There are no authored geography, history, civics, or economics lessons. PK has no seeded questions in those four subjects. The inventory enumerates every grade/subject combination, including zeroes.

Prompt variety is much smaller than row counts in several reading banks: grade 1 has 302 rows / 68 prompts; grade 2 has 619 / 124; grade 4 has 277 / 34. A repeated prompt with different choices can offer practice, but is not a new reading passage or a new skill. Prompt counts also do not distinguish shared passages across different questions.

## Instructional work this evidence prioritizes

1. Build a cumulative K–2 decoding sequence, starting with sound awareness and taught letter/sound correspondences, then blending, segmenting, controlled connected text and supported fluency. The current single K blending lesson cannot provide this sequence.
2. Map each new lesson and assessment to a verified benchmark and explicit prerequisites. Record partial scope, required response modality, and unmet portions; do not count a multiple-choice item as evidence of oral reading fluency.
3. Expand grades 3–5 with genuinely different passages and text-based reasoning, rather than permutations of answer options.
4. Add science observation/prediction/investigation lessons and social-studies teaching before treating quiz supply as curriculum coverage.
5. Build saved nightly sequencing and spaced review around these prerequisites and independent evidence. Repeating the current three lessons cannot sustain a full learning progression.

The full objective remains incomplete. This audit identifies concrete supply and mapping defects; it is not a standards-alignment certification or an outcome study.

Validation: the correction migration updated 1,355 local question tags inside a rolled-back transaction. A full-row comparison excluding only `standard` confirmed no other question data changed; a second application updated zero rows. Changed-file lint and the production build passed. These follow-up changes have not yet been deployed.


## Grade-specific reading update

Twelve original stories add 24 questions (four per K–5 grade), stored in `src/lib/content/reading-stories.ts` and migration 21. Kindergarten and first grade address story events and characters; grades 2–3 compare character perspectives; grade 4 pairs theme with supporting actions; grade 5 examines how perspective develops. Benchmark references were checked against the [FDOE ELA standards](https://www.fldoe.org/file/7539/elabeststandardsfinal.pdf), literary-elements/perspective/theme progressions and grade-specific clarifications. These multiple-choice activities cover only parts of the referenced benchmarks; they do not establish fluency or full mastery.

The quiz now separates explicitly marked passages from their questions. Ambiguous quoted prompts are left intact. Passages use normal reading text, independent narration controls, and generated ElevenLabs recordings for the new stories. This is a first expansion of variety, not a complete reading programme or a validated grade-level text-complexity study.

## Observation-based science questions

Six original illustrative records add 12 questions across K–5 (migration 22). K uses pictured objects; grade 1 reads a weather record; grade 2 compares light observations; grade 3 reads a common-scale bar chart; grade 4 compares controlled starting conditions and temperature changes; grade 5 interprets repeated trials. Evidence payloads carry no answer keys. Charts are generated from the same values used in visible labels and narration. Tables can scroll within their own container on small screens.

General skill diagrams now appear in optional post-answer help instead of above unrelated questions. The new observations are explicitly sample classroom data, not reported experimental measurements. The tasks target observation and evidence reasoning within the [Florida science framework](https://www.fldoe.org/academics/standards/subject-areas/math-science/science/); individual benchmark tags remain unset pending a full item-level mapping. They do not establish inquiry mastery or substitute for conducting investigations.
