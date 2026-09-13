process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const p=await b.newPage({hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
for(const grade of ['K','1','2','3','4','5'])for(const width of [320,390,768,1024]){
await p.setViewportSize({width,height:844});await p.goto(`http://localhost:3001/train-preview?grade=${grade}`,{waitUntil:'domcontentloaded'});
await p.getByRole('button',{name:'Buy Sunny passenger car for 5 tokens'}).click();await p.locator('[aria-label="25 tokens"]').waitFor();
await p.getByRole('button',{name:'🦕 Dinosaurs',exact:true}).click();await p.getByRole('button',{name:'Buy Triceratops for 5 tokens'}).click();await p.locator('[aria-label="20 tokens"]').waitFor();assert.equal(await p.locator('[data-collected-dinosaur]').count(),1);await p.waitForFunction(()=>document.querySelector('img[src="/images/dinosaurs/habitat.webp"]')?.naturalWidth>0);
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`dinosaurs ${grade}/${width} overflow`);
if([390,1024].includes(width)&&['K','5'].includes(grade)){await p.evaluate(()=>Promise.race([Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})),new Promise(r=>setTimeout(r,5000))]));await p.locator('main').screenshot({path:`/tmp/rewards-dinosaurs-${grade}-${width}.png`});}
await p.getByRole('button',{name:'🚂 Train',exact:true}).click();await p.locator('[aria-label="20 tokens"]').waitFor();assert.equal(await p.getByRole('button',{name:/Select .*car 1/}).count(),1);
await p.waitForFunction(()=>document.querySelector('img[src="/images/dinosaurs/railway.webp"]')?.naturalWidth>0);
if(width===1024&&grade==='K'){await p.evaluate(()=>Promise.race([Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})),new Promise(r=>setTimeout(r,5000))]));await p.locator('main').screenshot({path:'/tmp/rewards-train.png'});}
await p.getByRole('button',{name:'🌱 Garden',exact:true}).click();assert.equal(await p.locator('[data-garden-flower]').count(),6);await p.waitForFunction(()=>document.querySelector('img[src="/images/garden/garden-bed.webp"]')?.naturalWidth>0);
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`garden ${grade}/${width} overflow`);
if([390,1024].includes(width)&&['K','5'].includes(grade)){await p.evaluate(()=>Promise.race([Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})),new Promise(r=>setTimeout(r,5000))]));await p.locator('main').screenshot({path:`/tmp/rewards-garden-${grade}-${width}.png`});}
await p.getByRole('button',{name:'🦕 Dinosaurs',exact:true}).click();assert.equal(await p.locator('[data-collected-dinosaur]').count(),1);await p.locator('[aria-label="20 tokens"]').waitFor();
console.log(`${grade}/${width}: shared purchases, all themes, layout passed`);
}
for(const flowers of [0,1,10,23]){await p.goto(`http://localhost:3001/home-preview?grade=K&garden=full&flowers=${flowers}`,{waitUntil:'domcontentloaded'});assert.equal(await p.locator('[data-garden-flower]').count(),flowers?((flowers-1)%10)+1:0);if(flowers===23){await p.getByRole('button',{name:'← Previous',exact:true}).click();assert.equal(await p.locator('[data-garden-flower]').count(),10);}}
await b.close();})().catch(e=>{console.error(e);process.exit(1)});
