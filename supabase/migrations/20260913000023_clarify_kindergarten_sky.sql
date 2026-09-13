-- Clarify Kindergarten sky questions; preserve IDs, choices, keyed answers, and attempts.
-- Source: https://science.nasa.gov/moon/moon-phases/
update public.questions set prompt = 'What lights up the daytime sky?', explanation = 'The sun lights up the daytime sky. We can sometimes see the moon during the day, too.' where subject_id = 'science' and grade = 'K' and skill = 'K.daynight' and prompt = 'What do we see in the sky during the daytime?';
update public.questions set prompt = 'When is it usually easiest to see many stars in a clear sky?', explanation = 'Stars are easier to see in a dark night sky. The moon can be visible during the day or at night.' where subject_id = 'science' and grade = 'K' and skill = 'K.daynight' and prompt = 'When do we usually see the moon and stars?';
