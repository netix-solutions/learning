process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const p=await b.newPage({serviceWorkers:'block',hasTouch:true,reducedMotion:'reduce'});
for(const grade of ['K','1','2','3','4','5'])for(const width of [320,390,768,1024]){
await p.setViewportSize({width,height:844});await p.goto(`http://localhost:3001/train-preview?theme=bakery&grade=${grade}`,{waitUntil:'domcontentloaded'});
await p.locator('[data-rewards-ready="true"]').waitFor();await p.getByRole('button',{name:'Buy Sprinkle donut for 5 tokens'}).click();await p.locator('[aria-label="25 tokens"]').waitFor();assert.equal(await p.locator('[data-collected-treat]').count(),1);
await p.getByRole('button',{name:'🚂 Train',exact:true}).click();await p.getByRole('button',{name:'Buy Sunny passenger car for 5 tokens'}).click();await p.locator('[aria-label="20 tokens"]').waitFor();
await p.getByRole('button',{name:'🦕 Dinosaurs',exact:true}).click();await p.getByRole('button',{name:'Buy Triceratops for 5 tokens'}).click();await p.locator('[aria-label="15 tokens"]').waitFor();
await p.getByRole('button',{name:'🧁 Bakery',exact:true}).click();assert.equal(await p.locator('[data-collected-treat]').count(),1);await p.locator('[aria-label="15 tokens"]').waitFor();await p.getByRole('button',{name:'Buy Chocolate cake pop for 10 tokens'}).click();await p.locator('[aria-label="5 tokens"]').waitFor();assert(await p.getByRole('button',{name:'Buy Swirl cupcake for 8 tokens'}).isDisabled());
await p.waitForFunction(()=>document.querySelector('img[src="/images/bakery/bakery-shelf.webp"]')?.naturalWidth>0);
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${grade}/${width} overflow`);
console.log(`${grade}/${width}: shelf, shared wallet, affordability and theme persistence passed`);
}
await p.setViewportSize({width:1024,height:900});await p.goto('http://localhost:3001/train-preview?theme=bakery&tokens=100',{waitUntil:'domcontentloaded'});
for(const name of ['Sprinkle donut for 5','Swirl cupcake for 8','Chocolate cake pop for 10','Chocolate chip cookie for 5','Golden croissant for 8','Macaron stack for 12'])await p.getByRole('button',{name:`Buy ${name} tokens`,exact:true}).click();
assert.equal(await p.locator('[data-collected-treat]').count(),6);
await p.evaluate(()=>Promise.race([Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})),new Promise(r=>setTimeout(r,5000))]));await p.locator('main').screenshot({path:'/tmp/bakery-full.png'});
await p.locator('[data-rewards-ready="true"]').waitFor();await p.getByRole('button',{name:'Buy Sprinkle donut for 5 tokens'}).click();await p.getByText('Display 2 of 2',{exact:true}).waitFor();assert.equal(await p.locator('[data-collected-treat]').count(),1);await p.getByRole('button',{name:'← Previous',exact:true}).click();assert.equal(await p.locator('[data-collected-treat]').count(),6);
await p.setViewportSize({width:390,height:844});await p.locator('main').screenshot({path:'/tmp/bakery-phone.png'});
const response=p.waitForResponse(r=>r.url().includes('/audio/lessons/')&&[200,206].includes(r.status()));await p.getByRole('button',{name:'Hear how my bakery works',exact:true}).tap();await response;await p.getByRole('button',{name:'Stop reading',exact:true}).waitFor();await p.getByRole('button',{name:'Stop reading',exact:true}).tap();console.log('All six treats, additional displays, and ElevenLabs playback passed.');await b.close();})().catch(e=>{console.error(e);process.exit(1)});
