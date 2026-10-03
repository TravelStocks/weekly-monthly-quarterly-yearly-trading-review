const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer-core');

async function main() {
  const repo = path.resolve(__dirname, '..');
  const output = path.join(repo, 'output/2026-09-21-verification');
  fs.mkdirSync(output, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const results = [];
  const expectedTrades = {
    '20260921':['buy:603230:200','buy:588170:1400','sell:588170:200','sell:002584:1000'],
    '20260922':['buy:603230:400','buy:588170:500','sell:588170:1400'],
    '20260923':['buy:000504:200','sell:588170:500','sell:603230:600'],
    '20260924':['buy:600664:100','buy:002238:100'],
    '20260928':['sell:000504:200','sell:002238:100','sell:600664:100'],
    '20260929':[],
    '20260930':['buy:000993:100'],
  };
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 390]) {
      await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
      for (const file of ['2026-09-21_2026-09-30/index.html', 'weekly-trading-review/index.html', 'index.html']) {
        await page.goto(pathToFileURL(path.join(repo, file)).href, { waitUntil: 'load' });
        const result = await page.evaluate(() => ({
          width: innerWidth, documentWidth: document.documentElement.scrollWidth,
          charts: document.querySelectorAll('svg.stock-chart').length,
          markers: document.querySelectorAll('svg.stock-chart .trade-marker').length,
          candles: document.querySelectorAll('svg.stock-chart .candle').length,
          dailyCards: document.querySelectorAll('#daily .day-card').length,
          accountRows: document.querySelectorAll('#account tbody tr').length,
          operations:[...document.querySelectorAll('#account .daily-trades')].map(el=>({
            date:el.dataset.date,
            inTable:!!el.closest('td'),
            entries:[...el.querySelectorAll('li')].map(li=>`${li.dataset.side}:${li.dataset.code}:${li.dataset.qty}`),
            empty:el.querySelector('.no-trades')?.textContent,
            links:[...el.querySelectorAll('li')].every(li=>li.querySelector('a').getAttribute('href')==='#stock-'+li.dataset.code),
            overflow:el.scrollWidth>el.clientWidth+1,
          })),
          missingAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash),
          tradeRows: document.querySelectorAll('#trades tbody tr').length,
          invalidText: /undefined|NaN/.test(document.body.innerText),
          markerOverlaps: [...document.querySelectorAll('svg.stock-chart')].flatMap(svg => {
            const labels=[...svg.querySelectorAll('.trade-marker text')];
            return labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>{
              const x=a.getBBox(),y=b.getBBox();
              return x.x<y.x+y.width && x.x+x.width>y.x && x.y<y.y+y.height && x.y+x.height>y.y;
            }).map(b=>a.textContent+'/'+b.textContent));
          }),
        }));
        assert.equal(result.documentWidth, width, 'Page overflow: ' + file);
        assert.equal(result.invalidText, false);
        assert.deepEqual(result.missingAnchors, []);
        assert.deepEqual(result.markerOverlaps, []);
        if (file.startsWith('2026-09-21')) {
          assert.equal(result.charts, 7);
          assert.equal(result.markers, 24);
          assert.equal(result.candles, 2544);
          assert.equal(result.tradeRows, 21);
          assert.equal(result.dailyCards, 7);
          assert.equal(result.accountRows, 7);
          assert.equal(result.operations.length, 14);
          assert.equal(result.operations.filter(op=>op.inTable).length,7);
          for(const operation of result.operations) {
            assert.deepEqual(operation.entries.slice().sort(),expectedTrades[operation.date].slice().sort());
            assert.equal(operation.links,true);
            assert.equal(operation.overflow,false);
            if(operation.date==='20260929')assert.equal(operation.empty,'无成交');
          }
          await (await page.$('#account')).screenshot({path:path.join(output,'account-operations-'+width+'.png')});
          await page.locator('#account .account-day:first-child a[href="#stock-603230"]').click();
          assert.equal(await page.evaluate(()=>location.hash),'#stock-603230');
          await page.screenshot({ path: path.join(output, 'week-' + width + '.png') });
          if (width === 1440) {
            for(const [selector,name] of [['#stock-603230','neimeng-chart'],['#stock-588170','etf-chart'],['#daily .day-card:nth-child(3)','wednesday-review'],['#holdings','holdings']]) {
              await (await page.$(selector)).screenshot({path:path.join(output,name+'.png')});
            }
          }
          const links=await page.$$eval('a[href]',els=>els.map(el=>el.getAttribute('href')).filter(h=>!h.startsWith('#')&&!/^https?:/.test(h)));
          for(const href of links){
            const target=path.resolve(repo,path.dirname(file),href);
            assert.ok(fs.existsSync(target),'Missing local link: '+href);
          }
          await page.locator('#daily details summary').click();
          assert.equal(await page.$eval('#daily details',el=>el.open),true);
        }
        results.push({ file, ...result });
      }
    }
    assert.deepEqual(errors,[]);
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results,null,2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
