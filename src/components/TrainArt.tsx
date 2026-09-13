import type { TrainCarId } from '@/lib/train';
export function TrainArt({kind, friendly=false}:{kind:TrainCarId|'engine';friendly?:boolean}) {
 const color={engine:'#176779',passenger:'#e7ae3c',cargo:'#bb7550',aquarium:'#4aa0b9',garden:'#67956c',observatory:'#8274b3',caboose:'#d36c60'}[kind];
 return <svg viewBox="0 0 220 140" aria-hidden="true" className="h-auto w-full overflow-visible">
  <path d="M0 106H220" stroke="#596774" strokeWidth="7"/>
  {kind==='engine'?<><path d="M16 97L5 114H37" fill="#edac47"/><rect x="25" y="67" width="104" height="37" rx="13" fill={color}/><rect x="107" y="39" width="67" height="66" rx="8" fill={color}/><path d="M102 40H179L174 29H110Z" fill="#244b5f"/><rect x="117" y="49" width="44" height="28" rx="5" fill="#daf3ec"/><path d="M46 67V40H63V67" fill="#244b5f"/><rect x="41" y="36" width="27" height="8" rx="3" fill="#e7ae3c"/><circle cx="35" cy="83" r="7" fill="#ffe7a2"/>{friendly&&<><circle cx="132" cy="61" r="3" fill="#244b5f"/><path d="M140 64Q147 69 153 61" stroke="#244b5f" fill="none" strokeWidth="2"/></>}</>:<>
   <rect x="12" y="56" width="196" height="49" rx="9" fill={color}/>
   {kind==='passenger'&&<><rect x="14" y="43" width="192" height="18" rx="8" fill="#b97d28"/>{[30,73,116,159].map(x=><rect key={x} x={x} y="63" width="29" height="27" rx="5" fill="#edf8ed"/>)}</>}
   {kind==='cargo'&&[24,81,138].map((x,i)=><g key={x}><rect x={x} y={29+i%2*8} width="50" height="60" rx="4" fill={i%2?'#e9b764':'#dbaa73'} stroke="#925c38" strokeWidth="3"/><path d={`M${x+5} 38L${x+45} 82M${x+45} 38L${x+5} 82`} stroke="#925c38" strokeWidth="3"/></g>)}
   {kind==='aquarium'&&<><rect x="24" y="29" width="172" height="65" rx="11" fill="#cceff5" stroke={color} strokeWidth="6"/><path d="M28 47Q65 35 109 47T192 47V90H28Z" fill="#7acada"/>{[60,128].map(x=><g key={x}><ellipse cx={x} cy="68" rx="15" ry="9" fill="#edaf49"/><path d={`M${x+10} 68l17 -12v24Z`} fill="#edaf49"/><circle cx={x-7} cy="65" r="2" fill="#344b5c"/></g>)}</>}
   {kind==='garden'&&[42,86,131,175].map((x,i)=><g key={x}><path d={`M${x} 78V43m0 21q-20 -20 -19 -4m19 0q20 -20 19 -4`} stroke="#397653" strokeWidth="5" fill="#397653"/><circle cx={x} cy="39" r="14" fill={i%2?'#f0b64f':'#e697aa'}/><circle cx={x} cy="39" r="6" fill="#ffe6a1"/></g>)}
   {kind==='observatory'&&<><path d="M46 66a64 51 0 0 1 128 0Z" fill="#c8c7ef" stroke={color} strokeWidth="5"/><path d="M81 55l51 -23 8 16 -51 24Z" fill="#615886"/><path d="M110 60l-13 25m13 -25 13 25" stroke="#615886" strokeWidth="4"/><path d="M33 31v12m-6 -6h12M183 18v12m-6 -6h12" stroke="#e7ae3c" strokeWidth="3"/></>}
   {kind==='caboose'&&<><rect x="67" y="25" width="84" height="45" rx="7" fill={color}/><path d="M57 29H161L149 18H72Z" fill="#934c49"/>{[31,91,158].map(x=><rect key={x} x={x} y="66" width="28" height="24" rx="4" fill="#ffedc6"/>) }<rect x="85" y="36" width="45" height="19" rx="3" fill="#ffedc6"/></>}
  </>}
  <rect x="15" y="101" width="192" height="9" rx="4" fill="#354e5b"/>
  {[48,169].map(x=><g key={x}><circle cx={x} cy="113" r="16" fill="#344653"/><circle cx={x} cy="113" r="8" fill="#afc2c4"/><circle cx={x} cy="113" r="3" fill="#344653"/></g>)}
 </svg>;
}
