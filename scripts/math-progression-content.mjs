// Original grade-bound practice. Levels change representation and reasoning,
// not a learner's grade. Strand tags describe partial practice, not certification.
export const MATH_STAGES = {
  K: {count:'MA.K.NSO.1',compare:'MA.K.NSO.2',addsub:'MA.K.AR.1'},
  1: {addsub:'MA.1.NSO.2',place:'MA.1.NSO.1',compare:'MA.1.NSO.1'},
  2: {addsub:'MA.2.NSO.2',place:'MA.2.NSO.1',skip:'MA.2.AR.3'},
  3: {muldiv:'MA.3.NSO.2',area:'MA.3.GR.2',perim:'MA.3.GR.2',round:'MA.3.NSO.1',frac:'MA.3.FR.2'},
  4: {mul:'MA.4.NSO.2',div:'MA.4.NSO.2',place:'MA.4.NSO.1',factor:'MA.4.AR.3',frac:'MA.4.FR.1',dec:'MA.4.FR.1'},
  5: {dec:'MA.5.NSO.2',order:'MA.5.AR.2',volume:'MA.5.GR.3',frac:'MA.5.FR.2'},
};
export function mathProgressionQuestions() {
 const rows=[];
 function add(grade,topic,level,prompt,value,explanation,options={}) {
  const row={subject_id:'math',grade,difficulty:level,skill:`${grade}.${topic}`,standard:MATH_STAGES[grade][topic],prompt,explanation,xp:10,kind:'mcq',payload:null,answer:null,...options};
  if(row.kind==='mcq') {
   let choices=options.choices??[value,value+1,value+2,Math.max(0,value-1)];
   choices=[...new Set(choices.map(String))];
   for(let offset=3;choices.length<4;offset++)if(!choices.includes(String(value+offset)))choices.push(String(value+offset));
   choices=choices.slice(0,4);
   const shift=rows.length%4;
   row.choices=[...choices.slice(shift),...choices.slice(0,shift)];
   row.answer_index=row.choices.indexOf(String(value));
  } else {
   row.choices=null;row.answer_index=null;
   const permutations=[[2,0,1],[1,2,0],[0,2,1],[2,1,0],[1,0,2],[0,1,2]];
   const order=permutations[(rows.length+level)%permutations.length];
   if(row.kind==='order'){
    row.payload={...row.payload,items:order.map(index=>row.payload.items[index])};
    row.answer=row.answer.map(index=>order.indexOf(index));
   } else if(row.kind==='match'){
    row.payload={...row.payload,right:order.map(index=>row.payload.right[index])};
    row.answer=row.answer.map(index=>order.indexOf(index));
   }
  }
  rows.push(row);
 }
 for(const [grade,topics] of Object.entries(MATH_STAGES))for(const topic of Object.keys(topics))for(let level=1;level<=3;level++)for(let i=0;i<8;i++) {
  const n=i+2;let a,b,value;
  const put=(prompt,result,explanation,options)=>add(grade,topic,level,prompt,result,explanation,options);
  if(topic==='count') {
   if(level===1){value=i%4+2;const item=['stars','dots'][Math.floor(i/4)];const symbol=item==='stars'?'★':'●';put(`Count the ${item}: ${Array(value).fill(symbol).join(' ')}`,value,`Touch each ${item==='stars'?'star':'dot'} once. There are ${value}.`);}
   else if(level===2){const items=[n+4,n,n+2].map(String);put('Put the counting numbers in order from smallest to biggest.',null,`Count forward: ${n}, ${n+2}, ${n+4}.`,{kind:'order',payload:{items,label:'smallest → biggest'},answer:[1,2,0]});}
   else {a=i+10;b=2;put(`A train visits stops ${a}, ${a+1}, and ${a+b}. Which stop comes next?`,a+b+1,`Count one more after ${a+b}: ${a+b+1}.`);}
  } else if(topic==='compare') {
   a=grade==='K'?n:level===1?n+10:n*7;
   b=a+(level===3?1:3);
   if(level===2){const items=[b,a,b+2].map(String);put('Put the numbers in order from smallest to biggest.',null,`In order: ${a}, ${b}, ${b+2}.`,{kind:'order',payload:{items,label:'smallest → biggest'},answer:[1,0,2]});}
   else put(level===1?`Which is greater: ${a} or ${b}?`:`One train carries ${a} people. Another carries ${b} people. Which number is greater?`,b,`${b} comes after ${a} when counting, so ${b} is greater.`,{choices:[b,a,a-1,b+1]});
  } else if(topic==='addsub') {
   if(grade==='K'){a=i%4+1;b=Math.floor(i/4)+2;}
   else if(grade==='1'){a=level===1?i+2:i+8;b=level===1?2:3;}
   else {a=level===1?n*10+1:level===2?n*10+8:n*80+19;b=level===1?12:level===2?17:68;}
   value=a+b;
   if(level===1)put(`There are ${a} train cars. Add ${b} more cars. How many cars now?`,value,`${a} + ${b} = ${value}.`);
   else if(level===2)put(`Find the missing number: ${a} + ? = ${value}.`,b,`${value} - ${a} = ${b}, so ${a} + ${b} = ${value}.`);
   else put(`The bakery has ${value} treats. It sells ${b} treats. How many are left?`,a,`${value} - ${b} = ${a}.`);
  } else if(topic==='place') {
   const scale=grade==='1'?10:grade==='2'?100:1000;
   a=n*scale+(grade==='1'?3:grade==='2'?24:246);
   if(level===1)put(`In ${a}, what is the value of the ${scale===10?'tens':scale===100?'hundreds':'thousands'} digit?`,n*scale,`The ${n} is in the ${scale===10?'tens':scale===100?'hundreds':'thousands'} place: ${n} × ${scale} = ${n*scale}.`,{choices:[n*scale,n,n*scale/10,n*scale*10]});
   else if(level===2){const values=grade==='4'?[a,a+scale,a+2*scale]:[a,a-scale,a-2*scale];const left=values.map(v=>String(v).split('').map((digit,index,digits)=>Number(digit)*10**(digits.length-index-1)).filter(value=>value>0).join(' + '));const right=[values[2],values[0],values[1]].map(String);put('Match each expanded form to its number.',null,values.map((v,j)=>`${left[j]} = ${v}`).join('; '),{kind:'match',payload:{left,right},answer:[1,2,0]});}
   else put(`A counter shows ${a}. Add ${scale} to it. What number will it show?`,a+scale,`${a} + ${scale} = ${a+scale}.`);
  } else if(topic==='skip') {
   b=level===1?10:level===2?5:2; a=n*b;
   put(level===3?`There are ${n} bicycles. Each bicycle has ${b} wheels. How many wheels altogether?`:`Count by ${b}s: ${a}, ${a+b}, ${a+2*b}, ?.`,level===3?a:a+3*b,level===3?`${n} groups of ${b} wheels make ${a}.`:`Add ${b} again: ${a+2*b} + ${b} = ${a+3*b}.`);
  } else if(topic==='muldiv') {
   a=level===1?n:n+2;b=level===1?2:level===2?3+i%4:6+i%5;
   if(level===1)put(`There are ${a} groups of ${b} shells. How many shells altogether?`,a*b,`${a} equal groups of ${b} make ${a*b}.`);
   else if(level===2)put(`Find the missing factor: ${a} × ? = ${a*b}.`,b,`${a*b} ÷ ${a} = ${b}, so ${a} × ${b} = ${a*b}.`);
   else put(`Share ${a*b} cupcakes equally among ${b} shelves. How many cupcakes go on each shelf?`,a,`${a*b} ÷ ${b} = ${a}.`);
  } else if(topic==='area'||topic==='perim') {
   a=n;b=level+2;value=topic==='area'?a*b:2*(a+b);
   if(level===1&&topic==='area')put(`A rectangle has ${b} rows of ${a} unit squares. How many unit squares cover it?`,value,`${b} rows × ${a} squares per row = ${value} square units.`);
   else if(level===2&&topic==='area')put(`A rectangle has area ${value} square centimeters and width ${b} centimeters. What is its length?`,a,`${value} ÷ ${b} = ${a} centimeters.`);
   else if(level===1&&topic==='perim')put(`A rectangle has sides ${a} cm, ${b} cm, ${a} cm, and ${b} cm. What is the total distance around it?`,value,`Add all four sides: ${a} + ${b} + ${a} + ${b} = ${value} cm.`);
   else if(level===2&&topic==='perim')put(`Walk around a rectangle ${a} cm long and ${b} cm wide. How far do you walk in centimeters?`,value,`The perimeter is 2 × (${a} + ${b}) = ${value} cm.`);
   else if(level===3&&topic==='perim')put(`A rectangular garden is ${a} meters long and ${b} meters wide. A 2-meter gate needs no fence. How many meters of fence cover the rest?`,value-2,`The perimeter is ${value} meters. Subtract the 2-meter gate: ${value-2} meters of fence.`);
   else put(level===3?`A rectangular garden is ${a} meters long and ${b} meters wide. What is its ${topic==='area'?'area in square meters':'perimeter in meters'}?`:`A rectangle is ${a} cm by ${b} cm. What is its ${topic==='area'?'area':'perimeter'}?`,value,topic==='area'?`${a} × ${b} = ${value} square ${level===3?'meters':'centimeters'}.`:`Add all four sides: ${a} + ${b} + ${a} + ${b} = ${value} ${level===3?'meters':'centimeters'}.`);
  } else if(topic==='round') {
   a=level===1?n*10+2:level===2?n*10+7:n*100+54;
   b=level===3?100:10;value=Math.round(a/b)*b;
   put(level===3?`A library has ${a} books. Round this number to the nearest ${b}.`:`Round ${a} to the nearest ${b}.`,value,`${a} is closer to ${value} than to the other neighboring multiple of ${b}.`,{choices:[value,a,value+b,Math.max(0,value-b)]});
  } else if(topic==='mul'||topic==='div') {
   a=level===1?n:level===2?n*10+3:n*100+17;b=level===1?3:level===2?4:5;
   value=topic==='mul'?a*b:a;
   if(level===2&&topic==='mul'){const left=[a,a+1,a+2].map(x=>`${x} × ${b}`);const right=[(a+2)*b,a*b,(a+1)*b].map(String);put('Match each multiplication to its product.',null,left.map((x,j)=>`${x} = ${(a+j)*b}`).join('; '),{kind:'match',payload:{left,right},answer:[1,2,0]});}
   else if(level===1&&topic==='div')put(`Share ${a*b} blocks into ${b} equal groups. How many blocks go in each group?`,a,`${a*b} ÷ ${b} = ${a} blocks in each group.`);
   else put(level===3?(topic==='mul'?`${b} trains each carry ${a} passengers. How many passengers altogether?`:`Put ${a*b} books equally into ${b} boxes. How many books go in each box?`):`${topic==='mul'?a:a*b} ${topic==='mul'?'×':'÷'} ${b} = ?`,value,topic==='mul'?`${a} × ${b} = ${value}.`:`${a*b} ÷ ${b} = ${value}.`);
  } else if(topic==='factor') {
   a=n;b=level+2;value=a*b;
   const wrong=Array.from({length:20},(_,j)=>j+2).filter(x=>value%x!==0).slice(0,3);
   put(level===3?`A shelf has ${value} treats. Which number of equal groups can hold them with none left over?`:`${level===1?'A factor divides a number with none left over. ':''}Which number is a factor of ${value}?`,a,`${a} × ${b} = ${value}, so ${a} divides ${value} with none left over.`,{choices:[a,...wrong]});
  } else if(topic==='frac'&&grade==='3') {
   const denominators=[2,3,4,5,6,8,10,12];
   const pairs=[[3,4],[4,5],[5,6],[6,8],[8,10],[10,12],[2,4],[3,6]];
   a=level===1?1:2;b=level===1?denominators[i]:pairs[i][0];
   const small=level===1?`${a}/${b}`:`${a}/${pairs[i][1]}`;
   const big=level===1?`${a+1}/${b}`:`${a}/${b}`;
   put(level===3?`One garden uses ${big} of a plot and another uses ${small} of an equal-sized plot. Which fraction is greater?`:`Compare fractions of equal-sized wholes. Which is greater: ${small} or ${big}?`,big,level===1?`The pieces are the same size. ${a+1} pieces is more than ${a} pieces.`:`Both fractions have ${a} pieces. When equal-sized wholes have fewer pieces, each piece is larger.`,{choices:[big,small,'They are equal','There is not enough information']});
  } else if(topic==='frac'&&grade==='4') {
   a=level===1?1:i%3+1;b=n;const m=level+1;value=`${a*m}/${b*m}`;
   if(level===2)put(`Complete the equivalent fraction: ${a}/${b} = ?/${b*m}.`,a*m,`Multiply the denominator by ${m}, so multiply the numerator by ${m} too: ${a*m}.`);
   else put(level===3?`A garden uses ${a}/${b} of a plot. Which fraction describes the same amount?`:`One of ${b} equal parts of a whole is shaded. Which fraction represents this amount?`,value,`Multiply top and bottom by ${m}: ${a}/${b} = ${value}.`,{choices:[value,`${a}/${b*m}`,`${a*m}/${b}`,`${a*m+1}/${b*m}`]});
  } else if(topic==='dec'&&grade==='4') {
   a=level===1?i+1:n*7;b=level===1?10:100;value=`${a}/${b}`;
   put(level===3?`A design has 100 equal tiles. ${a} tiles are blue. What fraction of the tiles are blue?`:`Write ${(a/b).toFixed(level===1?1:2)} as a fraction with denominator ${b}.`,value,`${a} out of ${b} equal parts is ${a}/${b}.`,{choices:[value,`${a+1}/${b}`,`${a-1}/${b}`,`${a}/${b===10?100:10}`]});
  } else if(topic==='dec'&&grade==='5') {
   const precision=level===1?10:level===2?100:1000;a=(n*precision+7)/precision;b=(precision+3)/precision;value=Number((a+b).toFixed(3));
   put(level===3?`A train travels ${a.toFixed(3)} kilometers, then ${b.toFixed(3)} kilometers. How many kilometers altogether?`:`${a.toFixed(level===1?1:2)} + ${b.toFixed(level===1?1:2)} = ?`,value,`Line up the decimal points. ${a} + ${b} = ${value}.`,{choices:[value,Number((value+.1).toFixed(3)),Number((value-.1).toFixed(3)),Number((value+1).toFixed(3))]});
  } else if(topic==='order') {
   a=n;b=3;const c=2+i%3;value=level===3?(a+b)*c:a+b*c;
   if(level===2){const items=[`${a} + ${b} × ${c}`,`(${a} + ${b}) × ${c}`,`${a} + ${b} + ${c}`];put('Put the expressions in order from smallest value to biggest.',null,`Multiply before adding; parentheses come first. In order: ${items[2]}, ${items[0]}, ${items[1]}.`,{kind:'order',payload:{items,label:'smallest value → biggest value'},answer:[2,0,1]});}
   else put(`${level===1?'Multiply first. ':''}What is ${level===3?`(${a} + ${b}) × ${c}`:`${a} + ${b} × ${c}`}?`,value,level===3?`Do parentheses first: ${a} + ${b} = ${a+b}. Then ${a+b} × ${c} = ${value}.`:`Multiply first: ${b} × ${c} = ${b*c}. Then ${a} + ${b*c} = ${value}.`,{choices:[value,level===3?a+b*c:(a+b)*c,value+1,value-1]});
  } else if(topic==='volume') {
   a=n;b=3;const c=level+1;value=level===3?c:a*b*c;
   put(level===1?`A box has ${c} layers. Each layer has ${a} rows of ${b} unit cubes. How many unit cubes fill the box?`:level===2?`A box is ${a} × ${b} × ${c} cm. What is its volume in cubic centimeters?`:`A box has volume ${a*b*c} cubic centimeters, length ${a} cm, and width ${b} cm. What is its height in centimeters?`,value,level===3?`${a} × ${b} × ${c} = ${a*b*c}, so the height is ${c} centimeters.`:`${c} layers × ${a} rows × ${b} cubes = ${value} cubic units.`);
  } else if(topic==='frac'&&grade==='5') {
   const d=[2,3,4,5,6,8,9,10][i];a=1;b=level===1?d:d*2;value=level===1?`2/${d}`:level===2?`1/${b}`:`3/${b}`;
   put(level===3?`A train travels 1/${d} kilometer, then 1/${b} kilometer. What is the total distance?`:`1/${d} ${level===2?'-':'+'} 1/${b} = ?`,value,level===1?`The denominators match: 1/${d} + 1/${d} = 2/${d}.`:`Use denominator ${b}: 1/${d} = 2/${b}. ${level===2?'Subtract':'Add'} 2/${b} ${level===2?'-':'+'} 1/${b} = ${value}.`,{choices:[value,level===2?`2/${b}`:`1/${b}`,`4/${b}`,`5/${b}`]});
  } else throw new Error(`Missing topic ${grade}.${topic}`);
 }
 return rows;
}
