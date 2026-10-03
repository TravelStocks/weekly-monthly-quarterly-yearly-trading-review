const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'monthly-quarterly-trading-review/2026-09/data');
const statement = JSON.parse(fs.readFileSync(path.join(dir, 'statement-source.json'), 'utf8'));
const codes = [...new Set(statement.rows.map(row => row[2]))];
const start = '2026-08-15', end = '2026-09-30';
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}
async function collectChart(code) {
  const file = path.join(dir, `${code}-5m.json`);
  if (fs.existsSync(file)) return { code, cached: true };
  const url = new URL('https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_monthly=/CN_MarketDataService.getKLineData');
  url.searchParams.set('symbol', `${code.startsWith('6') || code.startsWith('5') ? 'sh' : 'sz'}${code}`);
  url.searchParams.set('scale', '5'); url.searchParams.set('ma', 'no'); url.searchParams.set('datalen', '1970');
  const raw = await (await get(url)).text();
  const match = raw.match(/var _monthly=\((\[[\s\S]*\])\);/);
  if (!match) throw new Error(`${code}: invalid JSONP response`);
  const bars = JSON.parse(match[1]).map(row => ({
    dt: row.day.slice(0,16), date: row.day.slice(0,10), time: row.day.slice(11,16),
    open: +row.open, high: +row.high, low: +row.low, close: +row.close, volume: +row.volume,
  })).filter(row => row.date >= start && row.date <= end);
  assert(bars.length > 0, `${code}: no bars in period`);
  assert(bars.every(b => [b.open,b.close,b.high,b.low,b.volume].every(Number.isFinite)), `${code}: invalid bars`);
  const tradeDates = [...new Set(statement.rows.filter(row => row[2] === code).map(row => row[0]))];
  for (const date of tradeDates) {
    const iso = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6)}`;
    assert(bars.some(bar => bar.date === iso), `${code}: missing ${iso}`);
  }
  fs.writeFileSync(file, JSON.stringify({code, interval:'5m', adjustment:'none', source:url.href, retrievedAt:new Date().toISOString(), bars},null,2)+'\n');
  return {code, bars:bars.length, first:bars[0].dt, last:bars.at(-1).dt};
}
async function main() {
  fs.mkdirSync(dir,{recursive:true});
  for (const code of codes) {
    try { console.log(JSON.stringify(await collectChart(code))); }
    catch(error) { console.error(error.message); process.exitCode=1; }
  }
  const url='https://travelstocks.github.io/daily-trading-review/';
  const html=await (await get(url)).text();
  const records=JSON.parse(html.match(/const records = (\[.*?\]);/s)[1]);
  const reviews=records.filter(r=>r.date_iso>=start&&r.date_iso<=end).map(r=>({
    date:r.date_iso, title:r.title,
    url:new URL(r.page_path.replaceAll('\\','/'),url).href,
    reflections:r.personal_reflection, operation:r.operation_emotion_analysis,
  }));
  // Retain the already archived full text; archive metadata supplies the additional days.
  const archivedFiles=['2026-09-07_2026-09-11/data/daily-reviews.json','2026-09-21_2026-09-30/data/daily-reviews.json'];
  for (const relative of archivedFiles) {
    const file=path.join(root,relative); if(!fs.existsSync(file)) continue;
    for (const item of JSON.parse(fs.readFileSync(file,'utf8')).reviews) {
      const index=reviews.findIndex(r=>r.date===item.date);
      if(index>=0) reviews[index]={...reviews[index],...item};
    }
  }
  const august=path.join(root,'monthly-quarterly-trading-review/2026-08/index.html');
  if(fs.existsSync(august)) fs.copyFileSync(august,path.join(dir,'prior-august-review.html'));
  fs.writeFileSync(path.join(dir,'daily-reviews.json'),JSON.stringify({source:url,retrievedAt:new Date().toISOString(),reviews:reviews.sort((a,b)=>a.date.localeCompare(b.date))},null,2)+'\n');
  console.log(`Collected ${reviews.length} daily reflections.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
