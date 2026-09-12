const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

const dir = path.resolve(__dirname, '../2026-09-07_2026-09-11/data');
const start = '2026-09-07';
const end = '2026-09-11';
const dailyBase = 'https://travelstocks.github.io/daily-trading-review/';

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
}

async function main() {
  fs.mkdirSync(dir, { recursive: true });
  const html = await (await get(dailyBase)).text();
  const records = JSON.parse(html.match(/const records = (\[.*?\]);/s)[1]);
  const selected = records.filter(row => row.date_iso >= start && row.date_iso <= end);
  const browser = await puppeteer.launch({
    executablePath: 'C:/Users/abcha/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
    headless: true,
  });
  const reviews = [];
  try {
    const page = await browser.newPage();
    for (const row of selected) {
      const url = new URL(row.page_path.replaceAll('\\', '/'), dailyBase).href;
      const sourceHtml = await (await get(url)).text();
      const content = await page.evaluate(source => {
        const doc = new DOMParser().parseFromString(source, 'text/html');
        const section = [...doc.querySelectorAll('section')].find(el => el.id.startsWith('chapter-5-'));
        const kiss = [...doc.querySelectorAll('[data-kiss-three-section] .kiss-card')].map(el => ({
          label: el.querySelector('span')?.textContent.trim(),
          text: el.querySelector('p')?.textContent.trim(),
        }));
        return { chapter: section?.textContent.trim() || '', kiss };
      }, sourceHtml);
      reviews.push({ date: row.date_iso, title: row.title, url,
        emotion: row.emotion_summary, reflections: row.personal_reflection,
        operation: row.operation_emotion_analysis, ...content });
    }
  } finally {
    await browser.close();
  }
  let missingPageCandidates = [];
  try {
    const tree = await (await get('https://api.github.com/repos/TravelStocks/daily-trading-review/git/trees/main?recursive=1')).json();
    missingPageCandidates = (tree.tree || []).filter(x => x.path.startsWith('pages/') && /2026[.-]0?9[.-](10|11)(?:\D|$)/.test(x.path)).map(x => x.path);
  } catch (error) {
    console.log(`Daily archive listing: ${error.message}`);
  }
  fs.writeFileSync(path.join(dir, 'daily-reviews.json'), JSON.stringify({
    source: dailyBase, retrievedAt: new Date().toISOString(), reviews, missingPageCandidates,
    missingDates: ['2026-09-10', '2026-09-11'].filter(date => !reviews.some(row => row.date === date)),
  }, null, 2) + '\n');
  console.log(JSON.stringify({ reviews: reviews.map(r => ({ date: r.date, kiss: r.kiss, chapter: r.chapter })), missingPageCandidates }));

  for (const code of ['000735', '002403', '600865', '000978']) {
    const url = new URL('https://push2his.eastmoney.com/api/qt/stock/kline/get');
    const params = { secid: `${code.startsWith('6') ? '1' : '0'}.${code}`, klt: '5', fqt: '0',
      beg: '20260907', end: '20260911', lmt: '1000', fields1: 'f1,f2,f3,f4,f5,f6', fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61' };
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    try {
      const json = await (await get(url)).json();
      const bars = (json.data?.klines || []).map(line => {
        const [dt, open, close, high, low, volume] = line.split(',');
        return { dt, date: dt.slice(0, 10), time: dt.slice(11), open: +open, close: +close, high: +high, low: +low, volume: +volume };
      }).filter(bar => bar.date >= start && bar.date <= end);
      if (!bars.length || bars.some(b => ![b.open, b.close, b.high, b.low].every(Number.isFinite))) throw new Error('No valid bars');
      fs.writeFileSync(path.join(dir, `${code}-5m.json`), JSON.stringify({ code, interval: '5m', adjustment: 'none', source: url.href, retrievedAt: new Date().toISOString(), bars }, null, 2) + '\n');
      console.log(`${code}: ${bars.length} bars; close ${bars.at(-1).close}`);
    } catch (error) {
      console.log(`${code}: ${error.message}; chart remains pending`);
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
