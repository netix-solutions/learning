process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const p=await b.newPage({serviceWorkers:'block',hasTouch:true,reducedMotion:'reduce'});
for(const width of [320,390,768,1280]){
 await p.setViewportSize({width,height:900});await p.goto('http://localhost:3001/train-preview?tokens=100');await p.locator('[data-rewards-ready="true"]').waitFor();
 assert.equal(await p.locator('.reward-manager').count(),0);
 await p.getByRole('button',{name:'Buy Coal car for 8 tokens',exact:true}).click();await p.getByRole('button',{name:'Buy Dining car for 10 tokens',exact:true}).click();
 await p.getByRole('button',{name:'Move Dining car 2 earlier',exact:true}).click();assert((await p.locator('[data-train-car]').first().locator('img').getAttribute('src')).includes('dining.webp'));
 await p.getByRole('button',{name:'Sell back Coal car 2 for 4 tokens',exact:true}).click();await p.getByRole('button',{name:'Keep Coal car',exact:true}).click();await p.locator('[aria-label="82 tokens"]').waitFor();await p.getByRole('button',{name:'Sell back Coal car 2 for 4 tokens',exact:true}).click();await p.getByRole('button',{name:'Confirm sell Coal car for 4 tokens',exact:true}).click();await p.locator('[aria-label="86 tokens"]').waitFor();
 await p.getByRole('button',{name:'Buy Passenger engine for 15 tokens',exact:true}).click();const railway=p.getByRole('region',{name:'Your train. Scroll sideways to see every car.',exact:true});await railway.getByRole('button',{name:'Sell back Passenger engine 1 for 7 tokens',exact:true}).click();await railway.getByRole('button',{name:'Confirm sell Passenger engine for 7 tokens',exact:true}).click();await p.locator('[data-active-engine="engine"]').waitFor();
 for(const [theme,one,two,attr] of [['🦕 Dinosaurs','Triceratops','Stegosaurus','data-collected-dinosaur'],['🧁 Bakery','Sprinkle donut','Swirl cupcake','data-collected-treat']]){
  await p.getByRole('button',{name:theme,exact:true}).click();await p.getByRole('button',{name:`Buy ${one} for 5 tokens`,exact:true}).click();await p.getByRole('button',{name:`Buy ${two} for 8 tokens`,exact:true}).click();await p.getByRole('button',{name:`Move ${two} 2 earlier`,exact:true}).click();assert((await p.locator(`[${attr}]`).first().getByRole('group').getAttribute('aria-label')).includes(two));
  await p.getByRole('button',{name:`Sell back ${one} 2 for 2 tokens`,exact:true}).click();await p.getByRole('button',{name:`Confirm sell ${one} for 2 tokens`,exact:true}).click();assert.equal(await p.locator(`[${attr}]`).count(),1);
 }
 await p.locator('[aria-label="56 tokens"]').waitFor();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow '+width);
 const sizes=await p.locator('.reward-item-controls button').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(sizes.every(s=>s.w>=44&&s.h>=44),'small touch target');
 await p.screenshot({path:`/tmp/reward-direct-${width}.png`,fullPage:true});console.log(width+': direct arrows, refund/cancel, engine fallback, all collections and touch targets passed');
}
await b.close();})().catch(e=>{console.error(e);process.exit(1)});
