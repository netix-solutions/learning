-- Seed data for SummerSharp. Loaded automatically on `supabase db reset`.
-- Content is grade-appropriate and tagged with Florida B.E.S.T. domain codes.

-- Subjects -------------------------------------------------------------------
insert into public.subjects (id, name, emoji, color, sort) values
  ('math',      'Math',      '➕', 'blue',   1),
  ('reading',   'Reading',   '📚', 'purple', 2),
  ('science',   'Science',   '🔬', 'green',  3),
  ('geography', 'Geography', '🗺️', 'teal',   4),
  ('history',   'History',   '📜', 'orange', 5),
  ('civics',    'Civics',    '🏛️', 'red',    6),
  ('economics', 'Economics', '💰', 'indigo', 7);

-- Badges ---------------------------------------------------------------------
insert into public.badges (id, name, description, emoji, kind, threshold, subject_id, sort) values
  ('first_correct', 'First Steps',      'Answer your very first question right!', '🌟', 'total_correct',   1,   null, 1),
  ('correct_10',    'Getting Sharp',    'Get 10 questions correct.',              '✏️', 'total_correct',   10,  null, 2),
  ('correct_25',    'Brain Booster',    'Get 25 questions correct.',              '🧠', 'total_correct',   25,  null, 3),
  ('correct_50',    'Super Scholar',    'Get 50 questions correct.',              '🎓', 'total_correct',   50,  null, 4),
  ('correct_100',   'Summer Champion',  'Get 100 questions correct!',             '🏆', 'total_correct',   100, null, 5),
  ('streak_3',      'On Fire',          'Practice 3 days in a row.',              '🔥', 'streak',          3,   null, 6),
  ('streak_7',      'Week Warrior',     'Practice 7 days in a row.',              '📅', 'streak',          7,   null, 7),
  ('math_20',       'Math Whiz',        'Get 20 math questions correct.',         '🔢', 'subject_correct', 20,  'math',    8),
  ('reading_20',    'Bookworm',         'Get 20 reading questions correct.',      '🐛', 'subject_correct', 20,  'reading', 9),
  ('science_20',    'Science Explorer', 'Get 20 science questions correct.',      '🔬', 'subject_correct', 20,  'science', 10),
  ('science_50',    'Lab Star',         'Get 50 science questions correct!',      '🧪', 'subject_correct', 50,  'science', 11),
  ('geography_20',  'Map Explorer',     'Get 20 geography questions correct.',    '🗺️', 'subject_correct', 20,  'geography', 14),
  ('history_20',    'Time Traveler',    'Get 20 history questions correct.',      '📜', 'subject_correct', 20,  'history',   15),
  ('civics_20',     'Good Citizen',     'Get 20 civics questions correct.',       '🏛️', 'subject_correct', 20,  'civics',    16),
  ('economics_20',  'Smart Saver',      'Get 20 economics questions correct.',    '💰', 'subject_correct', 20,  'economics', 17),
  ('xp_250',        'XP Hunter',        'Earn 250 XP.',                           '⚡', 'xp',              250, null, 12),
  ('xp_1000',       'XP Legend',        'Earn 1000 XP!',                          '💎', 'xp',              1000, null, 13);

-- Questions ------------------------------------------------------------------
insert into public.questions (subject_id, grade, difficulty, standard, prompt, choices, answer_index, explanation, xp) values
-- ===== MATH: Kindergarten =====
('math','K',1,'MA.K.NSO.1','How many apples? 🍎🍎🍎', '["2","3","4","5"]', 1, 'Count them one by one: 1, 2, 3. There are 3 apples.', 10),
('math','K',1,'MA.K.NSO.3','Which number is bigger?', '["7","4","2","1"]', 0, '7 is the biggest number in the list.', 10),
('math','K',1,'MA.K.AR.1','2 + 1 = ?', '["2","3","4","5"]', 1, 'Start at 2 and count up 1 more: 3.', 10),
('math','K',1,'MA.K.GR.1','Which shape is a circle?', '["⬛","🔺","⚪","⭐"]', 2, 'A circle is perfectly round, like ⚪.', 10),
('math','K',1,'MA.K.NSO.1','What comes right after 5?', '["4","6","7","5"]', 1, 'Counting up: 5, then 6.', 10),
('math','K',1,'MA.K.AR.1','3 - 1 = ?', '["1","2","3","4"]', 1, 'Take 1 away from 3 to get 2.', 10),
-- ===== MATH: Grade 1 =====
('math','1',1,'MA.1.NSO.2','8 + 5 = ?', '["12","13","14","11"]', 1, '8 + 2 = 10, then 3 more makes 13.', 10),
('math','1',1,'MA.1.NSO.2','14 - 6 = ?', '["7","8","9","6"]', 1, '14 - 4 = 10, then take 2 more to get 8.', 10),
('math','1',1,'MA.1.NSO.1','In the number 27, what is the tens digit?', '["7","2","27","9"]', 1, '27 means 2 tens and 7 ones. The tens digit is 2.', 10),
('math','1',1,'MA.1.AR.1','Which sign makes it true?  6 ___ 9', '[">","<","=","+"]', 1, '6 is less than 9, so we use the < sign.', 10),
('math','1',2,'MA.1.NSO.2','Count by 10s: 10, 20, 30, ?', '["31","40","35","50"]', 1, 'Counting by tens, after 30 comes 40.', 10),
('math','1',1,'MA.1.M.1','How many sides does a triangle have?', '["2","3","4","5"]', 1, 'A triangle always has 3 sides.', 10),
-- ===== MATH: Grade 2 =====
('math','2',1,'MA.2.NSO.2','45 + 38 = ?', '["73","83","81","93"]', 1, '45 + 38: add tens (70) and ones (13) to get 83.', 10),
('math','2',1,'MA.2.NSO.2','90 - 47 = ?', '["43","53","47","33"]', 0, '90 - 47 = 43.', 10),
('math','2',1,'MA.2.NSO.1','What is the value of the 4 in 437?', '["4","40","400","7"]', 2, 'The 4 is in the hundreds place, so it means 400.', 10),
('math','2',2,'MA.2.AR.3','Skip count by 5s: 5, 10, 15, ?', '["16","20","25","18"]', 1, 'Counting by fives, after 15 comes 20.', 10),
('math','2',2,'MA.2.M.2','How many minutes are in 1 hour?', '["30","60","100","24"]', 1, 'There are 60 minutes in one hour.', 10),
('math','2',2,'MA.2.NSO.1','Which is an even number?', '["7","9","12","15"]', 2, '12 can be split into two equal groups, so it is even.', 10),
-- ===== MATH: Grade 3 =====
('math','3',1,'MA.3.NSO.2','7 × 6 = ?', '["42","36","48","49"]', 0, '7 groups of 6 is 42.', 10),
('math','3',1,'MA.3.NSO.2','56 ÷ 8 = ?', '["6","7","8","9"]', 1, '8 × 7 = 56, so 56 ÷ 8 = 7.', 10),
('math','3',2,'MA.3.FR.1','Which fraction is the largest?', '["1/2","1/4","1/3","1/8"]', 0, 'With the same whole, 1/2 is the biggest piece.', 10),
('math','3',2,'MA.3.NSO.1','Round 268 to the nearest hundred.', '["200","260","270","300"]', 3, '268 is closer to 300 than to 200.', 15),
('math','3',2,'MA.3.GR.2','A rectangle is 4 cm by 3 cm. What is its area?', '["7 sq cm","12 sq cm","14 sq cm","10 sq cm"]', 1, 'Area = length × width = 4 × 3 = 12 square cm.', 15),
('math','3',1,'MA.3.AR.1','9 × 0 = ?', '["9","1","0","90"]', 2, 'Any number times 0 is 0.', 10),
-- ===== MATH: Grade 4 =====
('math','4',2,'MA.4.NSO.2','23 × 4 = ?', '["82","92","86","94"]', 1, '20 × 4 = 80 and 3 × 4 = 12; 80 + 12 = 92.', 15),
('math','4',2,'MA.4.FR.1','Which fraction is equal to 1/2?', '["2/3","3/6","2/5","4/10"]', 1, '3/6 simplifies to 1/2.', 15),
('math','4',2,'MA.4.NSO.1','What is the value of the 6 in 6,420?', '["6","600","6,000","60"]', 2, 'The 6 is in the thousands place, so it means 6,000.', 15),
('math','4',2,'MA.4.FR.3','0.7 written as a fraction is:', '["7/10","7/100","1/7","70"]', 0, '0.7 means 7 tenths, which is 7/10.', 15),
('math','4',3,'MA.4.AR.2','A factor pair of 24 is:', '["5 and 5","3 and 8","7 and 4","6 and 5"]', 1, '3 × 8 = 24, so 3 and 8 are factors of 24.', 15),
('math','4',2,'MA.4.GR.1','An angle that is exactly 90° is called:', '["acute","obtuse","right","straight"]', 2, 'A 90° angle is a right angle, like the corner of a square.', 15),
-- ===== MATH: Grade 5 =====
('math','5',2,'MA.5.NSO.2','0.4 + 0.35 = ?', '["0.39","0.75","0.45","0.84"]', 1, 'Line up the decimals: 0.40 + 0.35 = 0.75.', 15),
('math','5',3,'MA.5.FR.2','1/2 + 1/4 = ?', '["2/6","3/4","1/6","2/4"]', 1, 'Rewrite 1/2 as 2/4, then 2/4 + 1/4 = 3/4.', 15),
('math','5',2,'MA.5.AR.2','What is 3 + 4 × 2 ?', '["14","11","10","24"]', 1, 'Multiply first: 4 × 2 = 8, then 3 + 8 = 11.', 15),
('math','5',3,'MA.5.GR.4','A box is 2 × 3 × 4. What is its volume?', '["9","24","14","20"]', 1, 'Volume = length × width × height = 2 × 3 × 4 = 24.', 15),
('math','5',2,'MA.5.NSO.2','12.5 × 10 = ?', '["1.25","125","1250","12.50"]', 1, 'Multiplying by 10 moves the decimal one place right: 125.', 15),
('math','5',3,'MA.5.FR.1','Which decimal is the largest?', '["0.5","0.45","0.09","0.5 and 0.45 are equal"]', 0, '0.5 is the same as 0.50, which is larger than 0.45 and 0.09.', 15),
-- ===== READING: Kindergarten =====
('reading','K',1,'ELA.K.F.2','Which word starts with the same sound as "Sun"? ☀️', '["Moon","Snake","Cat","Dog"]', 1, '"Sun" and "Snake" both start with the /s/ sound.', 10),
('reading','K',1,'ELA.K.F.2','Which word rhymes with "cat"?', '["dog","hat","sun","cup"]', 1, '"Cat" and "hat" rhyme — they end with the same "-at" sound.', 10),
('reading','K',1,'ELA.K.F.1','How many letters are in the word "dog"?', '["2","3","4","5"]', 1, 'd-o-g has 3 letters.', 10),
('reading','K',1,'ELA.K.F.3','Which is a real sight word?', '["the","blorp","zix","quomp"]', 0, '"the" is a common word we see all the time.', 10),
('reading','K',1,'ELA.K.F.2','What sound does the letter "B" make?', '["/s/","/b/","/m/","/t/"]', 1, 'The letter B makes the /b/ sound, like in "ball".', 10),
('reading','K',1,'ELA.K.F.2','Which word begins with the letter M?', '["apple","moon","tree","fish"]', 1, '"Moon" begins with the letter M.', 10),
-- ===== READING: Grade 1 =====
('reading','1',1,'ELA.1.F.3','Fill in: The dog likes to ___.', '["run","rug","red","rock"]', 0, '"The dog likes to run" makes sense in the sentence.', 10),
('reading','1',1,'ELA.1.F.2','Which word has a short "a" sound?', '["cake","map","rain","day"]', 1, '"Map" has the short /a/ sound. The others say the long A.', 10),
('reading','1',1,'ELA.1.V.1','What is the plural of "cat"?', '["cat","cats","caties","cates"]', 1, 'Add -s to make more than one: cats.', 10),
('reading','1',2,'ELA.1.R.1','Read: "Sam ran fast. He won the race." Why was Sam happy?', '["He fell","He won the race","He was tired","He lost"]', 1, 'Sam won the race, which is why he was happy.', 10),
('reading','1',1,'ELA.1.F.3','Which word is spelled correctly?', '["frend","freind","friend","frnd"]', 2, '"Friend" is the correct spelling.', 10),
('reading','1',2,'ELA.1.V.1','The opposite of "big" is:', '["large","huge","small","tall"]', 2, '"Small" is the opposite of "big".', 10),
-- ===== READING: Grade 2 =====
('reading','2',2,'ELA.2.V.1','A "rewrite" means to write again. What does the prefix "re-" mean?', '["not","again","before","after"]', 1, 'The prefix "re-" means "again," so rewrite = write again.', 10),
('reading','2',2,'ELA.2.V.1','Which word means almost the same as "happy"?', '["sad","glad","angry","tired"]', 1, '"Glad" is a synonym for "happy".', 10),
('reading','2',2,'ELA.2.R.2','What is the main idea of a story about a girl planting a garden?', '["The sky is blue","A girl grows a garden","Dogs bark","It is winter"]', 1, 'The main idea is what the story is mostly about: growing a garden.', 10),
('reading','2',2,'ELA.2.V.1','The word "unhappy" means:', '["very happy","not happy","happy again","almost happy"]', 1, 'The prefix "un-" means "not," so unhappy = not happy.', 10),
('reading','2',1,'ELA.2.F.1','Which word has two syllables?', '["dog","rabbit","cat","sun"]', 1, '"Rab-bit" has two syllables (two beats).', 10),
('reading','2',2,'ELA.2.V.1','The opposite (antonym) of "fast" is:', '["quick","slow","speedy","rapid"]', 1, '"Slow" is the opposite of "fast".', 10),
-- ===== READING: Grade 3 =====
('reading','3',2,'ELA.3.R.3','"The stars were diamonds in the sky." This is an example of a:', '["question","metaphor","list","title"]', 1, 'It compares stars to diamonds without using "like" or "as" — a metaphor.', 15),
('reading','3',2,'ELA.3.V.1','In "The enormous elephant," what does "enormous" mean?', '["tiny","very big","fast","gray"]', 1, '"Enormous" means very big or huge.', 10),
('reading','3',2,'ELA.3.R.2','A detail that supports the main idea is called a:', '["title","supporting detail","cover","guess"]', 1, 'Supporting details give more information about the main idea.', 15),
('reading','3',2,'ELA.3.C.3','Which word is a noun?', '["run","quickly","teacher","happy"]', 2, 'A noun names a person, place, or thing — "teacher" is a person.', 10),
('reading','3',2,'ELA.3.R.3','"As busy as a bee" is an example of a:', '["simile","noun","verb","rhyme"]', 0, 'It compares using "as," which makes it a simile.', 15),
('reading','3',2,'ELA.3.V.1','The prefix "pre-" in "preview" means:', '["after","before","again","not"]', 1, '"Pre-" means before, so a preview is seeing something before.', 10),
-- ===== READING: Grade 4 =====
('reading','4',2,'ELA.4.R.1','The lesson or message of a story is called the:', '["title","theme","setting","author"]', 1, 'The theme is the big idea or lesson the story teaches.', 15),
('reading','4',2,'ELA.4.V.1','In "a fragile glass," the word "fragile" means:', '["strong","easily broken","heavy","clear"]', 1, '"Fragile" means delicate and easily broken.', 15),
('reading','4',3,'ELA.4.R.2','An author who wants to convince you to recycle is writing to:', '["entertain","persuade","confuse","rhyme"]', 1, 'Writing to convince someone is called persuading.', 15),
('reading','4',2,'ELA.4.V.1','The suffix "-less" in "fearless" means:', '["full of","without","again","before"]', 1, '"-less" means without, so fearless = without fear.', 15),
('reading','4',2,'ELA.4.V.1','Which word is a synonym for "begin"?', '["end","start","stop","finish"]', 1, '"Start" means the same as "begin".', 10),
('reading','4',3,'ELA.4.C.3','Choose the correct word: "Their / There going to the park."', '["Their","There","They''re","Thier"]', 2, '"They are" going — the contraction is "They''re".', 15),
-- ===== READING: Grade 5 =====
('reading','5',3,'ELA.5.R.3','"The wind whispered through the trees" gives the wind human traits. This is:', '["a simile","personification","a fact","a question"]', 1, 'Giving human actions to non-human things is personification.', 15),
('reading','5',3,'ELA.5.R.2','When you use clues in a text to figure out something not stated, you:', '["copy","infer","skip","spell"]', 1, 'Using clues to draw a conclusion is called inferring.', 15),
('reading','5',2,'ELA.5.V.1','In "an abundant harvest," "abundant" means:', '["plenty","empty","small","late"]', 0, '"Abundant" means a large amount — plenty.', 15),
('reading','5',3,'ELA.5.R.2','The reason an author writes a how-to article is mainly to:', '["entertain","inform","persuade","scare"]', 1, 'A how-to article is written to inform or teach the reader.', 15),
('reading','5',2,'ELA.5.C.3','Which sentence is correct?', '["Me and him went.","Him and me went.","He and I went.","I and he goes."]', 2, '"He and I went" uses the correct subject pronouns.', 15),
('reading','5',3,'ELA.5.R.3','A story told from "I" and "me" point of view is:', '["third person","first person","no person","future"]', 1, 'When the narrator uses "I" and "me," it is first person.', 15);
