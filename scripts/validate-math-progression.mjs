// Independent arithmetic from visible prompts/payloads, without generator answers.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mathProgressionSQL} from './generate-math-progression.mjs';
import {mathProgressionQuestions,MATH_STAGES} from './math-progression-content.mjs';
const close=(a,b)=>Math.abs(a-b)<1e-8;
function fraction(s){const m=String(s).match(/^(\d+)\/(\d+)$/);return m?Number(m[1])/Number(m[2]):NaN;}
function evaluate(q){
 const p=q.prompt;let m;
 if((m=p.match(/Find the missing number: (\d+) \+ \? = (\d+)/)))return {number:+m[2]- +m[1]};
 if((m=p.match(/Find the missing factor: (\d+) × \? = (\d+)/)))return {number:+m[2]/ +m[1]};
 if((m=p.match(/A rectangle has area (\d+) square centimeters and width (\d+)/)))return {number:+m[1]/ +m[2]};
 if((m=p.match(/A rectangle has sides (\d+) cm, (\d+) cm, (\d+) cm, and (\d+) cm/)))return {number:+m[1]+ +m[2]+ +m[3]+ +m[4]};
 if((m=p.match(/Walk around a rectangle (\d+) cm long and (\d+) cm wide/)))return {number:2*(+m[1]+ +m[2])};
 if((m=p.match(/A rectangular garden is (\d+) meters long and (\d+) meters wide\. A (\d+)-meter gate/)))return {number:2*(+m[1]+ +m[2])- +m[3]};
 if((m=p.match(/Share (\d+) blocks into (\d+) equal groups/)))return {number:+m[1]/ +m[2]};
 if((m=p.match(/One of (\d+) equal parts of a whole is shaded/)))return {fraction:1/ +m[1]};
 if((m=p.match(/^(\d+\/\d+) - (\d+\/\d+) = \?$/)))return {fraction:fraction(m[1])-fraction(m[2])};
 if((m=p.match(/^Count the (stars|dots): (.+)$/)))return {number:m[2].split(' ').length};
 if((m=p.match(/A train visits stops (\d+), (\d+), and (\d+)\./)))return {number:+m[3]+1};
 if((m=p.match(/Which is greater: (\d+) or (\d+)\?/i)))return {number:Math.max(+m[1],+m[2])};
 if((m=p.match(/One train carries (\d+) people\. Another carries (\d+) people/)))return {number:Math.max(+m[1],+m[2])};
 if((m=p.match(/There are (\d+) train cars\. Add (\d+) more/)))return {number:+m[1]+ +m[2]};
 if((m=p.match(/The bakery has (\d+) treats\. It sells (\d+) treats/)))return {number:+m[1]- +m[2]};
 if((m=p.match(/^In (\d+), what is the value of the (tens|hundreds|thousands) digit/))){const scale={tens:10,hundreds:100,thousands:1000}[m[2]];return {number:Math.floor(+m[1]/scale)%10*scale};}
 if((m=p.match(/A counter shows (\d+)\. Add (\d+) to it/)))return {number:+m[1]+ +m[2]};
 if((m=p.match(/^Count by (\d+)s: (\d+), (\d+), (\d+), \?\./))){assert.equal(+m[3]- +m[2],+m[1]);assert.equal(+m[4]- +m[3],+m[1]);return {number:+m[4]+ +m[1]};}
 if((m=p.match(/There are (\d+) bicycles\. Each bicycle has (\d+) wheels/)))return {number:+m[1]* +m[2]};
 if((m=p.match(/There are (\d+) groups of (\d+) shells/)))return {number:+m[1]* +m[2]};
 if((m=p.match(/Share (\d+) cupcakes equally among (\d+) shelves/)))return {number:+m[1]/ +m[2]};
 if((m=p.match(/A rectangle has (\d+) rows of (\d+) unit squares/)))return {number:+m[1]* +m[2]};
 if((m=p.match(/(?:A rectangle is|A rectangular garden is) (\d+) (?:cm by|meters long and) (\d+) (?:cm|meters wide)\. What is its (area|perimeter)/)))return {number:m[3]==='area'?+m[1]* +m[2]:2*(+m[1]+ +m[2])};
 if((m=p.match(/^Round (\d+) to the nearest (\d+)/))||(m=p.match(/A library has (\d+) books\. Round this number to the nearest (\d+)/)))return {number:Math.round(+m[1]/ +m[2])* +m[2]};
 if((m=p.match(/^(\d+(?:\.\d+)?) ([+×÷]) (\d+(?:\.\d+)?) = \?$/)))return {number:m[2]==='+'?+m[1]+ +m[3]:m[2]==='×'?+m[1]* +m[3]:+m[1]/ +m[3]};
 if((m=p.match(/(\d+) trains each carry (\d+) passengers/)))return {number:+m[1]* +m[2]};
 if((m=p.match(/Put (\d+) books equally into (\d+) boxes/)))return {number:+m[1]/ +m[2]};
 if((m=p.match(/Which number is a factor of (\d+)/))||(m=p.match(/A shelf has (\d+) treats\. Which number of equal groups/)))return {predicate:s=>Number(s)>0&&+m[1]%Number(s)===0};
 if((m=p.match(/Which is greater: (\d+\/\d+) or (\d+\/\d+)/i))||(m=p.match(/One garden uses (\d+\/\d+) of a plot and another uses (\d+\/\d+)/)))return {fraction:Math.max(fraction(m[1]),fraction(m[2]))};
 if((m=p.match(/Which fraction is equal to (\d+\/\d+)/))||(m=p.match(/A garden uses (\d+\/\d+) of a plot/)))return {fraction:fraction(m[1])};
 if((m=p.match(/Complete the equivalent fraction: (\d+)\/(\d+) = \?\/(\d+)/)))return {number:+m[1]* +m[3]/ +m[2]};
 if((m=p.match(/Write (\d+\.\d+) as a fraction with denominator (\d+)/)))return {fraction:+m[1]};
 if((m=p.match(/A design has 100 equal tiles\. (\d+) tiles are blue/)))return {fraction:+m[1]/100};
 if((m=p.match(/A train travels (\d+\.\d+) kilometers, then (\d+\.\d+) kilometers/)))return {number:+m[1]+ +m[2]};
 if((m=p.match(/What is (\d+) \+ (\d+) × (\d+)\?/)))return {number:+m[1]+ +m[2]* +m[3]};
 if((m=p.match(/What is \((\d+) \+ (\d+)\) × (\d+)\?/)))return {number:(+m[1]+ +m[2])* +m[3]};
 if((m=p.match(/A box has (\d+) layers\. Each layer has (\d+) rows of (\d+) unit cubes/)))return {number:+m[1]* +m[2]* +m[3]};
 if((m=p.match(/A box is (\d+) × (\d+) × (\d+) cm/)))return {number:+m[1]* +m[2]* +m[3]};
 if((m=p.match(/A box has volume (\d+) cubic centimeters, length (\d+) cm, and width (\d+) cm/)))return {number:+m[1]/(+m[2]* +m[3])};
 if((m=p.match(/^(\d+\/\d+) \+ (\d+\/\d+) = \?$/))||(m=p.match(/A train travels (\d+\/\d+) kilometer, then (\d+\/\d+) kilometer/)))return {fraction:fraction(m[1])+fraction(m[2])};
 throw new Error('No independent solver: '+p);
}
function expressionValue(s){
 if(/^\d+$/.test(s))return Number(s);
 let m;if((m=s.match(/^\((\d+) \+ (\d+)\) × (\d+)$/)))return (+m[1]+ +m[2])* +m[3];
 if((m=s.match(/^(\d+) \+ (\d+) × (\d+)$/)))return +m[1]+ +m[2]* +m[3];
 if((m=s.match(/^(\d+) \+ (\d+) \+ (\d+)$/)))return +m[1]+ +m[2]+ +m[3];
 throw new Error('Unsupported order expression '+s);
}
const rows=mathProgressionQuestions();const seen=new Set();const distribution=[0,0,0,0];
for(const q of rows){
 const key=q.grade+'|'+q.prompt+'|'+JSON.stringify(q.payload);assert(!seen.has(key),'Duplicate task: '+key);seen.add(key);
 assert(q.explanation&&q.standard&&q.skill);
 if(q.kind==='order'){
  const values=q.payload.items.map(expressionValue);assert.equal(new Set(values).size,values.length);
  const expected=values.map((v,i)=>i).sort((a,b)=>values[a]-values[b]);assert.deepEqual(q.answer,expected);

 } else if(q.kind==='match'){
  const left=q.payload.left.map(s=>{if(q.skill==='4.mul'){const m=s.match(/^(\d+) × (\d+)$/);assert(m);return +m[1]* +m[2];} assert(/^\d+(?: \+ \d+)*$/.test(s));return s.split(' + ').map(Number).reduce((sum,n)=>sum+n,0);});
  const right=q.payload.right.map(Number);assert.equal(new Set(right).size,right.length);
  assert.deepEqual(q.answer,left.map(value=>right.indexOf(value)));assert(q.answer.every(i=>i>=0));
  if(q.grade==='2')assert(right.every(v=>v<=1000));
  if(q.grade==='1')assert(right.every(v=>v<=120));
 } else {
  assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.answer_index>=0&&q.answer_index<4);
  const expected=evaluate(q);
  const predicate=expected.predicate??(expected.fraction!==undefined?s=>close(fraction(s),expected.fraction):s=>close(Number(s),expected.number));
  const hits=q.choices.map(predicate);assert.equal(hits.filter(Boolean).length,1,'Ambiguous choices: '+q.prompt);assert(hits[q.answer_index],'Incorrect answer: '+q.prompt);distribution[q.answer_index]++;
 }
 assert(!JSON.stringify(q.payload).includes('answer'));
 if(q.grade==='K'&&q.skill==='K.addsub')assert((q.prompt.match(/\d+/g)??[]).map(Number).every(n=>n<=10));
 if(q.grade==='1'&&q.skill==='1.addsub')assert((q.prompt.match(/\d+/g)??[]).map(Number).every(n=>n<=20));
 if(q.grade==='2'&&['2.addsub','2.place'].includes(q.skill))assert((q.prompt.match(/\d+/g)??[]).map(Number).every(n=>n<=1000));
 if(q.skill==='3.frac')assert([...q.prompt.matchAll(/\d+\/(\d+)/g)].every(m=>[2,3,4,5,6,8,10,12].includes(+m[1])));
}
for(const [grade,topics] of Object.entries(MATH_STAGES))for(const topic of Object.keys(topics))for(const level of [1,2,3])assert.equal(rows.filter(q=>q.skill===`${grade}.${topic}`&&q.difficulty===level).length,8);
const interactiveGroups=new Map();
for(const q of rows.filter(q=>q.kind==='order'||q.kind==='match')){
 const key=`${q.skill}:${q.difficulty}`;
 if(!interactiveGroups.has(key))interactiveGroups.set(key,new Set());
 interactiveGroups.get(key).add(JSON.stringify(q.answer));
}
for(const [key,answers] of interactiveGroups)assert(answers.size>=4,`Predictable interactive answer positions: ${key}`);
console.log(`Verified ${rows.length} distinct tasks, 24 skills × 3 levels × 8 questions; all keyed answers independently recomputed. MCQ positions: ${distribution.join(', ')}.`);

assert.equal(readFileSync('supabase/seeds/math-progression.sql','utf8'),mathProgressionSQL(rows),'Regenerate the SQL seed after changing content.');
