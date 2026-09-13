// Isolated browser test of the real PracticeClient. All browser database requests
// are intercepted; this never authenticates or records a real learner attempt.
const browsers=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const engine=process.env.BROWSER || 'chromium';
const launchOptions={headless:true,...(engine==='chromium'?{executablePath:process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})};
const assert=require('node:assert/strict');
(async()=>{
 const b=await browsers[engine].launch(launchOptions);
 for(const [grade,size] of [['K',5],['1',6],['2',7],['3',8],['4',10],['5',12]]) for(const width of [320,768]) {
  const context=await b.newContext({serviceWorkers:"block",hasTouch:true,reducedMotion:"reduce",viewport:{width,height:1024}});const p=await context.newPage();p.on('pageerror',e=>console.error('Browser error:',e.message));let failed=false,saved=0;const requested=[];
  await context.route('**/api/tts',r=>r.fulfill({status:503,body:'Audio unavailable in isolated test'}));
  await context.route('**/rest/v1/**',async r=>{
   const url=r.request().url();const body=r.request().postDataJSON();
   const json=(data,status=200)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
   if(url.includes('/rpc/get_adaptive_questions')){assert.equal(body.p_grade,grade);requested.push(body);return json(Array.from({length:body.p_count},(_,i)=>({id:`${body.p_subject}-${i}`,subject_id:body.p_subject,grade,prompt:'Choose the word red.',choices:['red','book','table','shoe'],standard:null,xp:0,kind:'mcq'})));}
   if(url.includes('/rpc/record_attempt')){if(!failed){failed=true;return json({message:'Test connection failure',code:'TEST'},400);}saved++;return json({is_correct:true,correct_index:0,correct:0,explanation:'The selected word is red.',xp_earned:0,new_xp:0,new_streak:0,new_badges:[]});}
   return json([]);
  });
  await p.goto((process.env.APP_URL||'http://localhost:3001')+'/quiz-preview?grade='+grade);
  await p.getByText(`Question 1 of ${size}`,{exact:true}).waitFor().catch(async e=>{console.log('Debug:',requested, (await p.locator('body').innerText()).slice(0,500));throw e});
  assert.equal(requested.reduce((n,x)=>n+x.p_count,0),size);assert.deepEqual(requested.map(x=>x.p_subject).sort(),['math','reading','science']);
  await p.getByRole('button',{name:/A.*red/}).click();await p.getByRole('alert').filter({hasText:'Your answer did not save'}).waitFor();assert.equal(saved,0);
  if(['K','1','2'].includes(grade)) {
   const notice=p.getByRole('status').filter({hasText:'The voice is unavailable right now'});await notice.waitFor();
   const noticeBox=await notice.boundingBox();const mainBox=await p.locator('main').boundingBox();
   assert(noticeBox.y+noticeBox.height<=mainBox.y,'Voice notice overlaps quiz controls');
  }
  await p.getByRole('button',{name:'Try saving again',exact:true}).click();await p.getByRole('button',{name:'Next question →',exact:true}).waitFor({timeout:8000}).catch(async e=>{await p.screenshot({path:'/tmp/sunsharp-quiz-failure.png'});console.log('After retry:',saved,(await p.locator('body').innerText()).slice(0,1800));throw e});assert.equal(saved,1);
  await p.locator(".confetti-piece").first().waitFor({state:"attached"});
  assert(await p.locator(".confetti-piece").evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).display==="none"&&getComputedStyle(n).animationName==="none")),"Confetti ignores reduced motion");
  for(let i=1;i<size;i++){await p.getByRole('button',{name:'Next question →',exact:true}).click();await p.getByText(`Question ${i+1} of ${size}`,{exact:true}).waitFor();await p.getByRole('button',{name:/A.*red/}).click();}
  await p.getByRole('button',{name:'See my results 🎉',exact:true}).click();await p.getByText(`You tried ${size} questions and got ${size} right.`,{exact:true}).waitFor();assert.equal(saved,size);
  assert(await p.getByRole('link',{name:'Done for now ✓',exact:true}).isVisible());
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${grade}/${width} results overflow`);
  console.log(`${grade}/${width}: ${size}-question round, failed save, retry, and completion passed.`);await context.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
