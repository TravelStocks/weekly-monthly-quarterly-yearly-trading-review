const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const puppeteer=require('puppeteer-core');
const {readTrades,update}=require('./fill-weekly-daily-traded-stocks.cjs');
const root=path.resolve(__dirname,'..'),week='2026-10-19_2026-10-23';
const dir=path.join(root,week),out=path.join(root,'output/verify-2026-10-19');
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const data=require(path.join(dir,'data/statement.json')),s=require(path.join(dir,'data/summary.json'));
  assert.equal(s.tradeCount,13);assert.equal(s.closedGross,-545);assert.equal(s.buyAmount,15879);assert.equal(s.sellAmount,18221);
  assert.equal(s.endingEquity,10487.86);assert.equal(s.weekPnl,-636);
  assert.deepEqual(s.days.at(-1).holdings.map(h=>[h.code,h.qty]).sort(),[['000530',100],['002242',100]]);
  const before=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  await update([week]);
  assert.equal(fs.readFileSync(path.join(dir,'index.html'),'utf8'),before,'Daily-stock updater must be idempotent');
  assert(!/FZ000|023100|F0000/.test(before),'Private order IDs');
  assert(!before.includes('仅本地更新'),'Publication copy must not claim local-only');
  for(const text of ['分化日与分歧日','择日先手','不适合后手追入','待执行研究','账户日表与费用待补']) assert(before.includes(text),`Missing consolidated note: ${text}`);
  for(const text of ['rotation-wave-comparison','一鸣食品 / 国芳集团 / 金健米业','轮动的时间尺度','不机械套用原连板量能模板','不新增本周实际成交']) assert(before.includes(text),`Missing wave comparison: ${text}`);
  const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const checks=[],errors=[];
  try{
    const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
    for(const width of [1440,390]){
      await page.setViewport({width,height:1000,deviceScaleFactor:1});
      await page.goto(pathToFileURL(path.join(dir,'index.html')).href);
      const extracted=await readTrades(page);assert.equal(extracted.rows.length,13);
      const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,charts:document.querySelectorAll('.chart-card svg').length,candles:[...document.querySelectorAll('.chart-card svg')].map(s=>s.querySelectorAll('rect').length),markers:document.querySelectorAll('.chart-card circle').length,tradeRows:document.querySelectorAll('#trades tbody tr').length,accountRows:document.querySelectorAll('#account tbody tr').length,missingAnchors:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(id=>!document.getElementById(id))}));
      assert.equal(result.overflow,false);assert.equal(result.charts,6);assert.deepEqual(result.candles,Array(6).fill(240));assert.equal(result.markers,12);assert.equal(result.tradeRows,13);assert.equal(result.accountRows,5);assert.deepEqual(result.missingAnchors,[]);
      for(const d of s.days){const line=await page.$eval(`#account tbody tr:nth-child(${s.days.indexOf(d)+1})`,el=>el.textContent);for(const t of d.trades)assert(line.includes(t.name),`${d.date} ${t.name} missing`);}
      await page.screenshot({path:path.join(out,`top-${width}.png`)});
      await (await page.$('#stock-002242')).screenshot({path:path.join(out,`chart-${width}.png`)});
      await (await page.$('#account')).screenshot({path:path.join(out,`account-${width}.png`)});
      await (await page.$('#emotion-repair-sequence')).screenshot({path:path.join(out,`repair-sequence-${width}.png`)});
      const evidence=await page.$eval('#emotion-repair-sequence img',img=>({loaded:img.complete&&img.naturalWidth>0,width:img.getBoundingClientRect().width,parent:img.parentElement.getBoundingClientRect().width}));
      assert(evidence.loaded,'Evidence screenshot missing');
      await (await page.$('#crowding-support-expectation')).screenshot({path:path.join(out,`support-expectation-${width}.png`)});
      assert.equal(await page.$$eval('#crowding-support-expectation tbody tr',rows=>rows.length),5);
      assert.equal(await page.$$eval('#division-divergence-entry tbody tr',rows=>rows.length),2);
      assert.equal(await page.$$eval('#rotation-wave-comparison tbody tr',rows=>rows.length),4);
      await (await page.$('#rotation-wave-comparison')).screenshot({path:path.join(out,`wave-comparison-${width}.png`)});
      await (await page.$('#division-divergence-entry')).screenshot({path:path.join(out,`entry-branches-${width}.png`)});
      await (await page.$('#crowding-crossing-first-move')).screenshot({path:path.join(out,`first-move-${width}.png`)});
      checks.push({width,...result});
    }
    await page.goto(pathToFileURL(path.join(root,'weekly-trading-review/index.html')).href);
    assert(await page.$(`a[href="../${week}/"]`));
    const hub=await page.$eval(`a.week-card[href="../${week}/"]`,el=>el.textContent);assert(hub.includes('545.00'));assert(hub.includes('10,487.86'));
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({passed:true,checks,errors},null,2)+'\n');
  console.log(JSON.stringify({passed:true,checks}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
