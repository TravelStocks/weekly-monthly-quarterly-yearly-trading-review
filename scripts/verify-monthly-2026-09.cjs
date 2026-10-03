const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');
let playwright;
try { playwright=require('playwright'); }
catch { playwright=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }

async function main() {
  const root=path.resolve(__dirname,'..');
  const output=path.join(root,'output/playwright/monthly-2026-09');
  fs.mkdirSync(output,{recursive:true});
  const summary=JSON.parse(fs.readFileSync(path.join(root,'monthly-quarterly-trading-review/2026-09/data/summary.json'),'utf8'));
  assert.equal(summary.closedRealized,-3365.51);
  assert.equal(summary.stocks.find(s=>s.code==='000993').realized,-58.49);
  assert.equal(summary.stocks.find(s=>s.code==='000993').openQty,100);
  assert.equal(summary.reentries.filter(r=>r.confirmedLoss).length,2);
  assert.equal(summary.reentries.find(r=>r.code==='000978').precedingRealized,-2342);
  const reflection=JSON.parse(fs.readFileSync(path.join(root,'monthly-quarterly-trading-review/2026-09/data/second-reflection.json'),'utf8'));
  assert.equal(reflection.clarificationStatus,'resolved');
  assert.equal(reflection.parts.length,5);
  assert.equal(reflection.confirmedFramework.twoWaveEntry.minimumDailyReturnPercent,5);
  assert.equal(summary.reflection.status,'integrated');
  assert.deepEqual(summary.pendingReflectionQuestions,[]);
  assert.equal(summary.stocks.find(s=>s.code==='002412').classification,'运气盈利');
  for(const code of ['603758','002081']) assert.equal(summary.stocks.find(s=>s.code===code).classification,'赚钱但不可复制');
  for(const code of ['600378','002584','600551','000892']) assert.equal(summary.stocks.find(s=>s.code===code).classification,'可避免');
  assert.equal(summary.stocks.find(s=>s.code==='000978').classification,'不确定（方向认可）');
  assert(summary.stocks.every(s=>s.tags.length<=4));
  const content=fs.readFileSync(path.join(root,'monthly-quarterly-trading-review/2026-09/index.html'),'utf8');
  assert(!/二次反思尚待|二次反思 · 等你补充|二次反思待补区|分类待二次反思确认|时代与欢瑞的买前逻辑仍待/.test(content));
  const server=http.createServer((request,response)=>{
    const relative=decodeURIComponent(new URL(request.url,'http://localhost').pathname).replace(/^\/+/, '');
    let file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep)&&file!==root) {response.writeHead(403).end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)) {response.writeHead(404).end();return;}
    response.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json; charset=utf-8':'application/octet-stream');
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await playwright.chromium.launch({channel:'chrome',headless:true});
  const checks=[];
  try {
    for(const width of [1440,768,390,360]) {
      const page=await browser.newPage({viewport:{width,height:1050},deviceScaleFactor:1});
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.goto(base+'/monthly-quarterly-trading-review/2026-09/');
      const check=await page.evaluate(()=>({
        width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        trades:document.querySelectorAll('#trades tbody tr').length,
        stocks:document.querySelectorAll('.stock-section').length,
        opened:document.querySelectorAll('.stock-section[open]').length,
        charts:document.querySelectorAll('.stock-chart').length,
        candles:document.querySelectorAll('.candle').length,
        markers:document.querySelectorAll('.trade-marker').length,
        missingAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash),
        duplicateIds:[...document.querySelectorAll('[id]')].map(el=>el.id).filter((id,i,all)=>all.indexOf(id)!==i),
        localFiles:[...document.querySelectorAll('a[href]')].filter(a=>a.origin===location.origin&&!a.hash).map(a=>a.pathname),
        profitPosition:document.getElementById('profits').getBoundingClientRect().top,
        lossPosition:document.getElementById('losses').getBoundingClientRect().top,
        badText:/undefined|NaN/.test(document.body.textContent),
        reflection:document.getElementById('reflection').dataset.status,
        cases:document.querySelectorAll('.case-row').length,
        weeks:document.querySelectorAll('.reflection-week').length,
        checklist:document.querySelectorAll('#next .checklist>li').length,
        targets:document.querySelectorAll('#next .targets>article').length,
        reflectionPosition:document.getElementById('reflection').getBoundingClientRect().top,
      }));
      assert.equal(check.width,check.scrollWidth,`Overflow at ${width}`);
      assert.equal(check.trades,86);assert.equal(check.stocks,24);assert.equal(check.opened,5);
      assert.equal(check.charts,60);assert.equal(check.candles,2880);assert.equal(check.markers,86);
      assert.deepEqual(check.missingAnchors,[]);assert.deepEqual(check.duplicateIds,[]);assert.equal(check.badText,false);
      assert(check.lossPosition>check.profitPosition,'Profit and loss rankings must be separate rows');
      assert.equal(check.reflection,'integrated');assert.equal(check.cases,14);assert.equal(check.weeks,6);
      assert.equal(check.checklist,8);assert.equal(check.targets,3);
      assert(check.reflectionPosition<check.profitPosition,'Confirmed reflection must precede long rankings');
      assert((await page.locator('#reflection-models').textContent()).includes('当日相对昨收涨幅达到5%'));
      assert.equal(await page.locator('#stock-002412 .copy-model').count(),0);
      for(const href of check.localFiles) {
        const file=path.join(root,decodeURIComponent(href).replace(/^\/+/,''));
        assert(fs.existsSync(file),`Missing linked file ${file}`);
      }
      await page.screenshot({path:path.join(output,`overview-${width}.png`)});
      await page.locator('#reflection').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,`reflection-${width}.png`)});
      await page.locator('#reflection-weeks').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,`weeks-${width}.png`)});
      await page.locator('#reflection-week-5>summary').click();
      assert.equal(await page.locator('#reflection-week-5').evaluate(el=>el.open),true);
      await page.locator('#reflection-week-5>summary').click();
      assert.equal(await page.locator('#reflection-week-5').evaluate(el=>el.open),false);
      if(width===1440) {
        await page.locator('#stock-600721 .chart').first().screenshot({path:path.join(output,'baihua-chart.png')});
        await page.locator('.stock-index>summary').click();
        assert.equal(await page.locator('.stock-index').evaluate(el=>el.open),false);
        await page.locator('.stock-index>summary').click();
      } else {
        assert.equal(await page.locator('.chapter-index').evaluate(el=>el.open),false);
        await page.locator('.chapter-index>summary').click();
        assert.equal(await page.locator('.rail a[href="#trades"]').isVisible(),true);
        await page.locator('.chapter-index>summary').click();
        assert.equal(await page.locator('.stock-index').evaluate(el=>el.open),false);
        await page.locator('.stock-index>summary').click();
      }
      await page.locator('[data-order="time"]').click();
      const first=await page.locator('.stock-links a').first().getAttribute('data-code');
      assert.equal(first,'000936');
      await page.locator('[data-order="pnl"]').click();
      assert.equal(await page.locator('.stock-links a').first().getAttribute('data-code'),'600721');
      await page.locator('#stock-search').fill('000978');
      assert.equal(await page.locator('.stock-links a:not([hidden])').count(),1);
      await page.locator('.stock-links a[data-code="000978"]').click();
      assert.equal(await page.locator('#stock-000978').evaluate(el=>el.open),true);
      await page.locator('#stock-000978>summary').click();
      assert.equal(await page.locator('#stock-000978').evaluate(el=>el.open),false);
      await page.locator('#stock-search').fill('不存在的标的');
      assert.equal(await page.locator('#no-stock-results').isVisible(),true);
      assert.deepEqual(errors,[]);
      checks.push({width,charts:check.charts,markers:check.markers,stocks:check.stocks,trades:check.trades,reflection:check.reflection,cases:check.cases,weeks:check.weeks,overflow:false,interactions:'pass'});
      await page.close();
    }
    const page=await browser.newPage();
    await page.goto(base+'/monthly-quarterly-trading-review/');
    await page.locator('a[href="./2026-09/"]').click();
    assert((await page.title()).includes('阶段复盘'));
    await page.goto(base+'/monthly-quarterly-trading-review/2026-09/#stock-588170');
    assert.equal(await page.locator('#stock-588170').evaluate(el=>el.open),true);
    await page.goto(base+'/monthly-quarterly-trading-review/2026-09/#reflection');
    assert.equal(await page.locator('#reflection').getAttribute('data-status'),'integrated');
    await page.close();
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
  console.log(JSON.stringify(checks,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
