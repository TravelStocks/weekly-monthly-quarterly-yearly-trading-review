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
