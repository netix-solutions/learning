// Inventory the actual seed rows, not generator targets or marketing totals.
// These counts describe content supply, never verified benchmark coverage.
import { readFileSync, writeFileSync } from 'node:fs';
import { SCIENCE_OBSERVATIONS } from '../src/lib/content/science-observations.ts';
import { READING_STORIES } from '../src/lib/content/reading-stories.ts';
import { LESSONS } from '../src/lib/lessons.ts';

function readQuestions(path) {
  let columns = null;
  const rows = [];
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    const header = line.match(/^insert into public\.questions \(([^)]+)\) values$/i);
    if (header) { columns = header[1].split(',').map(x => x.trim()); continue; }
    if (!columns || !line || line.startsWith('--')) continue;
    if (!line.startsWith('(')) throw new Error(`Unsupported question SQL: ${path}: ${line.slice(0, 80)}`);
    const fields = [];
    let at = 1;
    while (at < line.length) {
      while (line[at] === ' ') at++;
      if (line[at] === "'") {
        let value = ''; at++;
        let closed = false;
        while (at < line.length) {
          if (line[at] === "'") {
            if (line[at + 1] === "'") { value += "'"; at += 2; }
            else { at++; closed = true; break; }
          } else value += line[at++];
        }
        if (!closed) throw new Error('Unclosed SQL string');
        fields.push(value);
      } else {
        const start = at;
        while (at < line.length && ![',', ')'].includes(line[at])) at++;
        const token = line.slice(start, at).trim();
        if (!/^(NULL|\d+)$/i.test(token)) throw new Error(`Unsupported SQL token ${token}`);
        fields.push(/^NULL$/i.test(token) ? null : Number(token));
      }
      while (line[at] === ' ') at++;
      if (line[at] === ',') { at++; continue; }
      if (line[at] === ')') break;
      throw new Error('Expected field separator');
    }
    if (fields.length !== columns.length) throw new Error('Column count mismatch');
    rows.push(Object.fromEntries(columns.map((c, i) => [c, fields[i]])));
    if (line.endsWith(';')) columns = null;
  }
  if (columns) throw new Error('Incomplete question insert');
  if (!rows.length) throw new Error(`No questions in ${path}`);
  return rows;
}
const files = ['supabase/seed.sql', 'supabase/seeds/questions.sql'];
const banks = [
  {path: 'src/lib/content/science-observations.ts', rows: SCIENCE_OBSERVATIONS.flatMap(a=>a.questions.map(q=>({grade:a.grade,subject_id:'science',skill:`${a.grade}.observation`,standard:null,prompt:q.prompt})))},
  ...files.map(path => ({ path, rows: readQuestions(path) })),
  {path: 'src/lib/content/reading-stories.ts', rows: READING_STORIES.flatMap(story => story.questions.map(q=>({grade:story.grade,subject_id:'reading',skill:story.skill,standard:story.standard,prompt:`Read: "${story.passage}" ${q.prompt}`})))},
];
const rows = banks.flatMap(b => b.rows);
const grades = ['PK', 'K', '1', '2', '3', '4', '5'];
const subjects = ['math', 'reading', 'science', 'geography', 'history', 'civics', 'economics'];
const inventory = [];
for (const grade of grades) for (const subject of subjects) {
  const selected = rows.filter(q => q.grade === grade && q.subject_id === subject);
  const skills = [...new Set(selected.map(q => q.skill).filter(Boolean))].sort();
  inventory.push({ grade, subject, seedRows: selected.length,
    distinctPrompts: new Set(selected.map(q => q.prompt)).size,
    skills: skills.map(skill => ({ skill, rows: selected.filter(q => q.skill === skill).length })),
    missingSkill: selected.filter(q => !q.skill).length,
    missingStandard: selected.filter(q => !q.standard).length,
    standardTags: [...new Set(selected.map(q => q.standard).filter(Boolean))].sort(),
    lessonIds: LESSONS.filter(l => l.grade === grade && l.subject === subject).map(l => l.id),
  });
}
const report = {
  scope: 'Repository question seeds, additive reading stories and science observations, and authored lessons; not a live database audit. Distinct prompts are not distinct skills. Strand tags are not benchmark coverage. Legacy skill tags may be populated by other migrations.',
  sources: banks.map(b => ({ file: b.path, rows: b.rows.length })), inventory,
};
writeFileSync('docs/curriculum-inventory.json', JSON.stringify(report, null, 2) + '\n');
console.log(report.scope);
console.log(report.sources);
for (const grade of grades) console.log(grade, inventory.filter(i => i.grade === grade).map(i => `${i.subject}: ${i.seedRows} rows/${i.distinctPrompts} prompts/${i.skills.length} skill tags/${i.lessonIds.length} lessons`).join('; '));
