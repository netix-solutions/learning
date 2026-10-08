import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/reward-discovery.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports});
const {rewardDiscovery:discover}=exports;
const state={theme:'bakery',balance:30,earned:30,spent:0,cars:[],catalog:[{id:'coal',name:'Coal car',price:5}],treats:[],bakeryCatalog:[{id:'donut',name:'Donut',price:5},{id:'cupcake',name:'Cupcake',price:8}],dinosaurs:[],dinosaurCatalog:[{id:'triceratops',name:'Triceratops',price:5}],enginePurchases:[],engineCatalog:[{id:'engine',name:'Classic',price:0},{id:'diesel-engine',name:'Diesel',price:10}]};
assert.equal(discover(state,state),null);
assert.equal(discover(state,{...state,balance:20}),null,'Balance change alone is not ownership');
const bought={...state,balance:25,treats:[{id:'a',treatId:'donut'}]};
assert.equal(discover(state,bought).firstOfKind,true);
assert.equal(discover(state,bought).unique,1);
assert.equal(discover(state,bought).total,2);
assert.equal(discover(bought,bought),null,'Retried response must not reveal again');
assert.equal(discover(bought,state),null,'Selling must not reveal');
const twice={...bought,treats:[...bought.treats,{id:'b',treatId:'donut'}]};
assert.equal(discover(bought,twice).firstOfKind,false);
assert.equal(discover(bought,twice).unique,1,'Duplicates do not advance design collection');
assert.equal(discover(twice,{...twice,treats:[...twice.treats].reverse()}),null,'Reordering is not a purchase');
for(const [theme,key,value] of [['train','cars',{id:'c',carId:'coal'}],['train','enginePurchases',{id:'e',engineId:'diesel-engine'}],['dinosaurs','dinosaurs',{id:'d',dinosaurId:'triceratops'}]]) {
 const before={...state,theme};const next={...before,[key]:[value]};const reveal=discover(before,next);
 assert(reveal);assert(fs.existsSync('public'+reveal.image));assert.equal(reveal.total,1);
 assert.equal(discover(next,{...next,activeEngine:'engine'}),null,'Selecting an engine is not a purchase');
}
assert.equal(discover(state,{...state,treats:[{id:'bad',treatId:'unknown'}]}),null);
console.log('Reward discovery: confirmed ownership, repeats, sale/reorder suppression, all shop types, unique counts and art paths passed.');
