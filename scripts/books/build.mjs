export function booksFor(grade,rows){
 return rows.map(([world,title,text,vocabulary,checks,retell])=>{
 const pages=text.split('|').map(p=>p.trim());
 const id=`${grade.toLowerCase()}-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'')}`;
 return {id,revision:'2026-10-v1',grade,world,title,genre:{forest:'Adventure',train:'Adventure',space:'Fantasy',bakery:'Funny stories',ocean:'Animal stories',dinosaur:'Fantasy',garden:'Everyday discoveries',museum:'Mystery'}[world],description:pages[0].split(/(?<=[.!?])\s/)[0],pages,
 vocabulary:vocabulary.split(';').filter(Boolean).map(v=>{const [word,meaning]=v.split('=');return {word,meaning};}),
 questions:checks.map(([prompt,correct,wrong1,wrong2,evidencePage,skill,explanation],i)=>{const choices=[correct,wrong1,wrong2];const shift=(id.length+i)%3;for(let n=0;n<shift;n++)choices.push(choices.shift());return {prompt,choices,answer:choices.indexOf(correct),evidencePage,skill,explanation};}),
 retell:retell||'Tell someone what happened at the beginning, in the middle, and at the end.',words:pages.join(' ').split(/\s+/).length};
 });
}
