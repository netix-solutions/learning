const {webkit}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert=require('node:assert/strict');
(async()=>{const b=await webkit.launch({headless:true});const p=await b.newPage({hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
for(const grade of ['K','1','2','3','4','5'])for(const width of [320,390,768,1024]){
await p.setViewportSize({width,height:844});await p.goto(`http://localhost:3001/train-preview?grade=${grade}`);
await p.getByRole('button',{name:'Buy Sunny passenger car for 5 tokens'}).click();
await p.locator('[aria-label="25 tokens"]').waitFor();
await p.getByRole('button',{name:'Buy Cargo car for 8 tokens'}).click();await p.locator('[aria-label="17 tokens"]').waitFor();
await p.getByRole('button',{name:'← Toward engine',exact:true}).click();
assert.match(await p.getByRole('button',{name:/Select .*car 1/}).getAttribute('aria-label'),/Cargo/);
await p.getByRole('button',{name:'🌱 Garden',exact:true}).click();await p.getByRole('button',{name:'🚂 Train',exact:true}).click();
await p.locator('[aria-label="17 tokens"]').waitFor();assert.equal(await p.getByRole('button',{name:/Select .*car [12]/}).count(),2);
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${grade}/${width} overflow`);
if(width===390)await p.locator('main').screenshot({path:`/tmp/train-${grade}.png`});
console.log(`${grade}/${width} purchase, order, switch, layout passed`);
}await b.close();})().catch(e=>{console.error(e);process.exit(1)});
