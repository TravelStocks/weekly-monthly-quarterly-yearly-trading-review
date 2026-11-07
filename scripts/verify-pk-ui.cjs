const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {})
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('http://review.local/**', async route => {
      let file = path.join(__dirname, '..', new URL(route.request().url()).pathname);
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      await route.fulfill({ path: file });
    });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const date of ['2026-09-03', '2026-11-04']) {
        await page.goto('http://review.local/large-loss-review/#day=' + date);
        await page.waitForSelector('#calendar-day-detail .calendar-error');
        const text = await page.locator('#calendar-day-detail').innerText();
        if (!text.includes('同身位PK未决，抢先手押注')) throw new Error(date);
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) {
          throw new Error('Horizontal overflow: ' + width);
        }
      }
    }
    await page.goto('http://review.local/large-loss-review/#stocks');
    await page.waitForSelector('#category option[value=pk]', { state: 'attached' });
    await page.selectOption('#category', 'pk');
    if (await page.locator('#record-list .record').count() !== 1) throw new Error('Episode count');
    await page.goto('http://review.local/large-loss-review/#day=2026-10-21');
    const group = page.locator('.month-error-card[data-category=switch_mode]');
    await group.waitFor();
    const text = await group.innerText();
    if (!['10-19', '10-21', '持仓延续'].every(value => text.includes(value))) {
      throw new Error('Monthly classification');
    }
    await group.locator('button').first().click();
    if (!(await page.locator('#calendar-day-detail').innerText()).includes('2026-10-19')) {
      throw new Error('Date navigation');
    }
    if (errors.length) throw new Error(errors.join('; '));
    console.log('PASS: desktop/mobile, two dates, one PK round, October summary, navigation, no JS errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
