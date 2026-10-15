// Original problems inspired by the number-line / missing-operation activity.
// Six addition and six subtraction problems at each grade-bound stage.
const PAIRS = {
 '1': [
  [[3,8],[12,7],[6,10],[16,9],[7,13],[18,12],[8,15],[14,6],[4,9],[17,10],[9,18],[20,13]],
  [[23,33],[74,64],[41,51],[68,58],[56,66],[91,81],[32,42],[45,35],[18,28],[83,73],[60,70],[30,20]],
  [[21,51],[87,57],[14,34],[65,45],[32,72],[94,54],[48,78],[76,46],[25,45],[61,41],[43,83],[82,42]],
 ],
 '2': [
  [[41,61],[83,63],[24,54],[76,46],[35,45],[92,82],[16,46],[68,38],[53,73],[71,51],[27,57],[64,34]],
  [[24,37],[58,42],[32,54],[76,63],[41,65],[89,67],[13,36],[65,41],[52,68],[47,24],[21,45],[94,72]],
  [[28,61],[72,39],[47,73],[83,57],[19,54],[64,28],[36,72],[91,46],[58,94],[70,37],[29,65],[80,49]],
 ],
};
export function numberLineQuestions() {
 return Object.entries(PAIRS).flatMap(([grade, stages]) => stages.flatMap((pairs, index) => pairs.map(([start,target]) => {
  const amount=Math.abs(target-start),direction=target>start?1:-1;
  const tens=Math.floor(amount/10),ones=amount%10;
  const pieces=[tens?`${tens} ${tens===1?'ten':'tens'}`:'',ones?`${ones} ${ones===1?'one':'ones'}`:''].filter(Boolean).join(' and ');
  let at=start;const stops=[at];for(let left=amount;left>0;){const jump=Math.min(10,left);at+=direction*jump;stops.push(at);left-=jump;}
  return {subject_id:'math',grade,skill:`${grade}.numberline`,difficulty:index+1,standard:null,xp:10,kind:'numberline',
   prompt:`Start at ${start}. Rescue the star at ${target}. Choose plus or minus and how far to move.`,
   payload:{numberLine:{start,target,min:0,max:grade==='1'&&index===0?20:100}},
   choices:null,answer_index:null,answer:[direction,amount],
   explanation:`Move ${direction===1?'right':'left'} by ${pieces} (${amount}): ${stops.join(' → ')}. ${start} ${direction===1?'+':'−'} ${amount} = ${target}.`,
  };
 })));
}
