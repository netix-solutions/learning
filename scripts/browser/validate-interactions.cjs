// Requires playwright-core (or PLAYWRIGHT_MODULE pointing to it) and a running development app.
// Uses isolated, local fixtures; never signs in or saves learner activity.
const browsers=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const engine=process.env.BROWSER || 'chromium';
const launchOptions={headless:true,...(engine==='chromium'?{executablePath:process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})};const assert=require('node:assert/strict');
(async()=>{const b=await browsers[engine].launch(launchOptions);const p=await b.newPage({hasTouch:true});
for(const grade of ['K','1','2','3','4','5'])for(const width of [320,390,768,1024]){
await p.setViewportSize({width,height:844});await p.goto((process.env.APP_URL || 'http://localhost:3001') + '/interaction-preview');await p.getByLabel('Grade',{exact:true}).selectOption(grade);
const button=name=>p.getByRole('button',{name,exact:true});const output=p.getByLabel('Submitted answer');
await button('sun').click();await button('day').click();await button('moon').click();await button('night').click();await button('Check it! ✅').click();assert.equal(await output.textContent(),'[1,0]');
await button('Next sample question').click();assert(await button('Finish your answer…').isDisabled());assert.equal(await button('sun').getAttribute('aria-pressed'),'false');assert(await button('day').isDisabled());
for(const kind of ['order','categorize','tapword','truefalse']){
await p.getByLabel('Type',{exact:true}).selectOption(kind);
if(kind==='order'){for(const item of ['first','next','last'])await button(item).click();await button('Check it! ✅').click();assert.equal(await output.textContent(),'[0,1,2]');await button('Next sample question').click();assert(await button('Finish your answer…').isDisabled());assert(await button('first').isVisible());}
if(kind==='categorize'){for(const item of ['first','next','last'])await button(item+': Beginning').click();await button('Check it! ✅').click();assert.equal(await output.textContent(),'[0,0,0]');await button('Next sample question').click();assert(await button('Finish your answer…').isDisabled());assert.equal(await button('first: Beginning').getAttribute('aria-pressed'),'false');}
if(kind==='tapword'){await button('cat').click();assert.equal(await output.textContent(),'1');}
if(kind==='truefalse'){await p.getByRole('button',{name:'✅ True',exact:true}).click();assert.equal(await output.textContent(),'0');}
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${grade}/${width}/${kind} overflow`);
const short=await p.locator('.rounded-3xl.bg-white button').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().height<47).length);assert.equal(short,0);
}
}console.log('24 grade/device combinations passed all five interactions; matching, ordering and sorting reset correctly.');await b.close()})();
