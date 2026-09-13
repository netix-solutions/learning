// Review the production components in development-only previews using WebKit.
const {webkit}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert=require('node:assert/strict');
(async()=>{const b=await webkit.launch({headless:true});const p=await b.newPage({hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
for(const grade of ['K','1','2','3','4','5']){
 for(const [width,height] of [[320,740],[390,844],[768,1024],[1024,768]]){
  await p.setViewportSize({width,height});
  for(const surface of ['home','reading','science','learn']){
   await p.goto((process.env.APP_URL||'http://localhost:3001')+`/${surface}-preview?grade=${grade}`);await p.locator('main').waitFor();
   assert.equal(await p.locator('main').getAttribute('data-grade'),grade);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${surface}/${grade}/${width} overflow`);
   if(surface==='home'){
    const links=p.locator('section[aria-label="Choose your learning"] a');assert.equal(await links.first().getAttribute('href'),'/practice/daily');
    if(Number(grade)>=3)assert.equal(await p.locator('.meadow-backdrop').evaluate(el=>getComputedStyle(el).display),'none');
   }
   if(surface==='reading')assert.equal(await p.getByRole('region',{name:'Reading passage'}).count(),2);
   if(surface==='learn'){
    const lessons=p.getByRole('navigation',{name:'Choose a lesson'}).getByRole('button');
    assert(await lessons.count()>=3);
    for(let i=0;i<await lessons.count();i++){await lessons.nth(i).tap();for(let step=0;step<2;step++){await p.getByRole("button",{name:"Next step →",exact:true}).tap();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`lesson step ${step}/${grade}/${width} overflow`);}assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`lesson ${i}/${grade}/${width} overflow`);}
   }
   if(width===390)await p.locator('main').screenshot({path:`/tmp/sunsharp-final-${surface}-${grade}.png`});
  }
  await p.goto((process.env.APP_URL||'http://localhost:3001')+`/home-preview?grade=${grade}&garden=full&flowers=23`);
  await p.getByText('Patch 3 of 3',{exact:true}).waitFor();await p.getByRole('button',{name:'← Previous',exact:true}).tap();await p.getByText('Patch 2 of 3',{exact:true}).waitFor();
  assert(await p.getByText('23 flowers grown',{exact:true}).isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`garden/${grade}/${width} overflow`);
 }
 console.log(`${grade}: home, reading, science, all lesson choices, and garden passed four phone/iPad sizes.`);
}await b.close()})().catch(e=>{console.error(e);process.exit(1)});
