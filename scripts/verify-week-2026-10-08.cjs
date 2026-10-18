const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const puppeteer=require('puppeteer-core');
const root=path.resolve(__dirname,'..'),folder='2026-10-08_2026-10-16';
const summary=require(path.join(root,folder,'data/summary.json'));
const review=require(path.join(root,folder,'data/review.json'));
const round=n=>Math.round(n*100);
assert.equal(summary.tradeCount,9);
assert.equal(summary.realized,819.54);
assert.equal(summary.closingCash,5039.86);
assert.equal(summary.account.endingEquity,11123.86);
assert.equal(summary.account.pnl,979.54);
assert.equal(summary.account.floating,155);
assert.equal(summary.account.best.date,'2026-10-12');
assert.equal(summary.account.worst.date,'2026-10-14');
assert.equal(round(summary.account.averagePosition),3801);
assert.equal(round(summary.account.dailyRateSum),938);
assert.equal(round(summary.account.returnRate),966);
assert.equal(summary.account.days.find(d=>d.date==='2026-10-13').holdings.length,0);
assert.equal(summary.account.days.find(d=>d.date==='2026-10-16').holdings.length,2);
for(const d of summary.account.days) {
  assert.equal(round(d.equity),round(d.cash)+d.holdings.reduce((n,p)=>n+round(p.qty*p.price),0));
  assert.equal(round(d.position),round(d.marketValue/d.equity*100));
}
for(const stock of summary.stocks) {
  const daily=require(path.join(root,folder,`data/${stock.code}-daily.json`));
  const intraday=require(path.join(root,folder,`data/${stock.code}-5m.json`));
  assert.equal(intraday.adjustment,'none');
  for(const d of summary.account.days) {
    const bars=intraday.bars.filter(b=>b.date===d.date);
    assert.equal(bars.length,48);
    assert.equal(bars.at(-1).close,daily.bars.find(b=>b.date===d.date).close);
  }
}
async function main() {
  const output=path.join(root,'output/verify-2026-10-08');fs.mkdirSync(output,{recursive:true});
  const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const errors=[],checks=[];
  try {
    const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
    for(const width of [1440,390]) {
      await page.setViewport({width,height:1000,deviceScaleFactor:1});
      await page.goto(pathToFileURL(path.join(root,folder,'index.html')).href);
      await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
      const actual=await page.evaluate(()=>({
        width:document.documentElement.scrollWidth,
        charts:document.querySelectorAll('svg.stock-chart').length,
        candles:document.querySelectorAll('.candle').length,
        markers:[...document.querySelectorAll('.trade-marker')].map(m=>({...m.dataset})),
        ids:[...document.querySelectorAll('[id]')].map(e=>e.id),
        broken:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),
        reflections:[...document.querySelectorAll('.reflection-section')].map(e=>({title:e.querySelector('h3').textContent,paragraphs:[...e.querySelectorAll('p')].map(p=>p.textContent)})),
        bad:/NaN|undefined/.test(document.querySelector('main').textContent),
        rawStatement:!!document.querySelector('img[src*="statement-"]'),
      }));
      assert.equal(actual.width,width);assert.equal(actual.charts,4);assert.equal(actual.candles,1344);
      assert.equal(actual.markers.length,9);assert.equal(new Set(actual.ids).size,actual.ids.length);
      assert.deepEqual(actual.broken,[]);assert.equal(actual.bad,false);assert.equal(actual.rawStatement,false);
      assert.deepEqual(actual.reflections,review.reflections.map(s=>({title:s.title,paragraphs:s.paragraphs})));
      for(const m of actual.markers) {
        const t=summary.transactions.find(t=>t.id===m.id);
        assert.equal(m.time,`${t.date} ${t.time}`);assert.equal(Number(m.price),t.price);
        assert.ok(m.bar+':00'>=m.time);assert.equal(m.bar.slice(0,10),t.date);
      }
      await page.screenshot({path:path.join(output,`overview-${width}.png`)});
      await page.$eval('#account',el=>el.scrollIntoView({block:'start'}));
      await page.screenshot({path:path.join(output,`account-${width}.png`)});
      await page.$eval('#stocks',el=>el.scrollIntoView({block:'start'}));
      await page.screenshot({path:path.join(output,`charts-${width}.png`)});
      await page.goto(pathToFileURL(path.join(root,'weekly-trading-review/index.html')).href);
      const hub=await page.evaluate(()=>({width:document.documentElement.scrollWidth,card:document.querySelector('a.latest-link[href*="2026-10-08"]').textContent,
        last:[...document.querySelectorAll('.weekly-data-table tbody tr')].at(-1)?.textContent,
        hero:document.querySelector('.hero')?.textContent}));
      assert.equal(hub.width,width);assert.ok(hub.card.includes('11,123.86'));assert.ok(hub.last.includes('38.01%'));
      assert.ok(!hub.hero.includes('待补'));
      assert.ok(hub.last.includes('周一 10-12 +540.62'));assert.ok(hub.last.includes('周三 10-14 -5.00'));
      checks.push({width,charts:actual.charts,candles:actual.candles,markers:actual.markers.length,hub});
    }
    assert.deepEqual(errors,[]);
  } finally {await browser.close();}
  fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify(checks,null,2)+'\n');
  console.log(JSON.stringify({passed:true,checks},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
