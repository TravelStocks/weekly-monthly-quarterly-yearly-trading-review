const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer-core');

async function main() {
  const repo = path.resolve(__dirname, '..');
  const output = path.join(repo, 'output/2026-09-07-verification');
  fs.mkdirSync(output, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Users/abcha/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe', headless: true });
  const results = [];
  try {
    const page = await browser.newPage();
    for (const width of [1440, 390]) {
      await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
      for (const file of ['2026-09-07_2026-09-11/index.html', 'weekly-trading-review/index.html', 'index.html']) {
        await page.goto(pathToFileURL(path.join(repo, file)).href, { waitUntil: 'load' });
        const result = await page.evaluate(() => ({
          width: innerWidth, documentWidth: document.documentElement.scrollWidth,
          charts: document.querySelectorAll('svg.stock-chart').length,
          markers: document.querySelectorAll('svg.stock-chart .trade-marker').length,
          candles: document.querySelectorAll('svg.stock-chart .candle').length,
          missingAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash),
          tradeRows: document.querySelectorAll('#trades tbody tr').length,
          invalidText: /undefined|NaN/.test(document.body.innerText),
        }));
        assert.equal(result.documentWidth, width, 'Page must not overflow at ' + file);
        assert.equal(result.invalidText, false);
        assert.deepEqual(result.missingAnchors, []);
        if (file.startsWith('2026-09-07')) {
          assert.equal(result.charts, 4);
          assert.equal(result.markers, 17);
          assert.equal(result.candles, 960);
          assert.equal(result.tradeRows, 17);
          await page.screenshot({ path: path.join(output, 'week-' + width + '.png') });
          if (width === 1440) {
            await (await page.$('#stock-000978')).screenshot({ path: path.join(output, 'guilin-chart.png') });
            await (await page.$('#daily .day-card:nth-child(3)')).screenshot({ path: path.join(output, 'wednesday-review.png') });
          }
        }
        results.push({ file, ...result });
      }
    }
  } finally { await browser.close(); }
  console.log(JSON.stringify(results, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
