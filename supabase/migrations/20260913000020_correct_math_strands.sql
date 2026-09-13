-- Correct seven math strand tags against the FDOE K–5 progression.
-- https://www.fldoe.org/core/fileparse.php/7576/urlt/Math-Standard-Progression-K-5.pdf
-- Strand tags do not certify full benchmark coverage. Keep question IDs and attempts intact.
update public.questions set standard = 'MA.K.NSO.2'
where subject_id = 'math' and grade = 'K' and standard = 'MA.K.NSO.3'
  and (skill = 'K.compare' or prompt = 'Which number is bigger?');
update public.questions set standard = 'MA.1.NSO.1'
where subject_id = 'math' and grade = '1' and standard = 'MA.1.AR.1'
  and (skill = '1.compare' or prompt = 'Which sign makes it true?  6 ___ 9');
update public.questions set standard = 'MA.1.GR.1'
where subject_id = 'math' and grade = '1' and standard = 'MA.1.M.1'
  and (skill = '1.shape' or prompt = 'How many sides does a triangle have?');
update public.questions set standard = 'MA.4.FR.1'
where subject_id = 'math' and grade = '4' and standard = 'MA.4.FR.3'
  and (skill = '4.dec' or prompt = '0.7 written as a fraction is:');
update public.questions set standard = 'MA.4.AR.3'
where subject_id = 'math' and grade = '4' and standard = 'MA.4.AR.2'
  and (skill = '4.factor' or prompt = 'A factor pair of 24 is:');
update public.questions set standard = 'MA.5.GR.3'
where subject_id = 'math' and grade = '5' and standard = 'MA.5.GR.4'
  and (skill = '5.volume' or prompt = 'A box is 2 × 3 × 4. What is its volume?');
update public.questions set standard = 'MA.5.NSO.1'
where subject_id = 'math' and grade = '5' and standard = 'MA.5.FR.1'
  and (skill = '5.deccmp' or prompt = 'Which decimal is the largest?');
