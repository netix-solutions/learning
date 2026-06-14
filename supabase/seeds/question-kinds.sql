-- Demo questions for the non-multiple-choice kinds (schema added in migration
-- 20260613000008_question_kinds.sql). A couple of each kind under fresh skills so
-- they surface quickly as "✨ New skill" in the relevant subject + grade.
--
-- Loaded AFTER seed.sql (which creates the subjects these rows reference) — see
-- config.toml `sql_paths`. Authored payloads are already shuffled; the withheld
-- answer encoding is documented in the migration. Re-running is safe to add more.

-- THIS-OR-THAT (true/false). choices = ["True","False"]; answer_index picks one.
insert into public.questions (subject_id, grade, difficulty, kind, skill, standard, prompt, choices, answer_index, explanation, xp) values
  ('math','1',1,'truefalse','1.tf-compare',NULL,'True or False?  7 is greater than 4.', '["True","False"]', 0, '7 comes after 4 when we count, so 7 is greater. True!', 10),
  ('math','2',1,'truefalse','2.tf-even',NULL,'True or False?  10 is an even number.', '["True","False"]', 0, '10 splits into two equal groups of 5, so it is even. True!', 10),
  ('science','1',1,'truefalse','1.tf-living',NULL,'True or False?  A rock is a living thing.', '["True","False"]', 1, 'A rock does not grow, eat, or breathe — it is not living. False!', 10),
  ('reading','2',1,'truefalse','2.tf-vowel',NULL,'True or False?  The letter B is a vowel.', '["True","False"]', 1, 'The vowels are A, E, I, O, U. B is a consonant. False!', 10);

-- TAP-THE-WORD. payload.tokens are the sentence words; answer = {"index": N}.
insert into public.questions (subject_id, grade, difficulty, kind, skill, standard, prompt, payload, answer, explanation, xp) values
  ('reading','1',1,'tapword','1.find-noun',NULL,'Tap the NOUN (a person, place, or thing).',
    '{"tokens":["The","happy","dog","ran"]}', '{"index":2}', 'A noun names a thing. "dog" is the noun! 🐶', 12),
  ('reading','2',2,'tapword','2.find-verb',NULL,'Tap the VERB (the action word).',
    '{"tokens":["Birds","sing","every","morning"]}', '{"index":1}', 'A verb is an action. Birds "sing" — that is the verb! 🎶', 12),
  ('reading','2',2,'tapword','2.find-vowel',NULL,'Tap the word that starts with a VOWEL.',
    '{"tokens":["table","apple","kite","drum"]}', '{"index":1}', '"apple" starts with A — a vowel! 🍎', 12);

-- PUT IN ORDER. payload.items are shuffled; answer = item indices in correct order.
insert into public.questions (subject_id, grade, difficulty, kind, skill, standard, prompt, payload, answer, explanation, xp) values
  ('math','1',2,'order','1.order-numbers',NULL,'Put the numbers in order from smallest to biggest.',
    '{"items":["7","2","9","4"],"label":"smallest → biggest"}', '[1,3,0,2]', 'In order: 2, 4, 7, 9. 🔢', 15),
  ('math','2',2,'order','2.order-numbers',NULL,'Put the numbers in order from smallest to biggest.',
    '{"items":["30","12","21","3"],"label":"smallest → biggest"}', '[3,1,2,0]', 'In order: 3, 12, 21, 30. 🔢', 15),
  ('science','2',2,'order','2.life-cycle',NULL,'Put the butterfly life cycle in order, first to last.',
    '{"items":["🐛 Caterpillar","🦋 Butterfly","🥚 Egg","🛡️ Chrysalis"],"label":"first → last"}', '[2,0,3,1]', 'Egg → Caterpillar → Chrysalis → Butterfly. 🦋', 15);

-- SORT INTO BUCKETS. payload.buckets + payload.items; answer = bucket index per item.
insert into public.questions (subject_id, grade, difficulty, kind, skill, standard, prompt, payload, answer, explanation, xp) values
  ('math','2',2,'categorize','2.even-odd-sort',NULL,'Sort each number into Even or Odd.',
    '{"buckets":["Even","Odd"],"items":["4","7","10","3"]}', '[0,1,0,1]', '4 and 10 are even; 7 and 3 are odd. ⚖️', 15),
  ('science','1',2,'categorize','1.living-sort',NULL,'Sort each one: Living or Not living.',
    '{"buckets":["Living","Not living"],"items":["🌳 Tree","🪨 Rock","🐶 Dog","☁️ Cloud"]}', '[0,1,0,1]', 'A tree and a dog grow and need food — living. A rock and a cloud are not. 🌱', 15);

-- MATCH PAIRS. payload.left + payload.right (right shuffled); answer = right-index per left.
insert into public.questions (subject_id, grade, difficulty, kind, skill, standard, prompt, payload, answer, explanation, xp) values
  ('math','2',2,'match','2.match-doubles',NULL,'Match each addition to its answer.',
    '{"left":["2 + 2","5 + 5","3 + 3"],"right":["10","6","4"]}', '[2,0,1]', '2+2=4, 5+5=10, 3+3=6. ➕', 15),
  ('reading','1',1,'match','1.rhyme-match',NULL,'Match the words that rhyme.',
    '{"left":["cat","star","tree"],"right":["bee","hat","car"]}', '[1,2,0]', 'cat–hat, star–car, tree–bee. They rhyme! 🎵', 15),
  ('geography','2',1,'match','2.what-is-it',NULL,'Match the place to what it is.',
    '{"left":["USA","Atlantic","Everest"],"right":["an ocean","a country","a mountain"]}', '[1,0,2]', 'USA is a country, the Atlantic is an ocean, Everest is a mountain. 🗺️', 15);
