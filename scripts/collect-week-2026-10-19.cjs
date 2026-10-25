const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '../2026-10-19_2026-10-23/data');
const statement = require(path.join(dir, 'statement.json'));
const save = (name, value) => fs.writeFileSync(path.join(dir, name), JSON.stringify(value, null, 2) + '\n');
async function get(url) {
  const r = await fetch(url, {signal: AbortSignal.timeout(20000)});
  assert(r.ok, `HTTP ${r.status}`);
  return r;
}
async function main() {
  const audit = [];
  for (const code of new Set(statement.trades.map(t => t.code))) {
    const source = `https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=sz${code}&scale=5&ma=no&datalen=1023`;
    try {
      const raw = await (await get(source)).json();
      const bars = raw.map(b => ({dt:b.day.slice(0,16), date:b.day.slice(0,10), time:b.day.slice(11,16), open:+b.open, high:+b.high, low:+b.low, close:+b.close, volume:+b.volume})).filter(b => b.date >= '2026-10-16' && b.date <= statement.end);
      assert(bars.every(b => [b.open,b.high,b.low,b.close,b.volume].every(Number.isFinite) && b.high >= Math.max(b.open,b.close) && b.low <= Math.min(b.open,b.close)));
      for (const day of ['16','19','20','21','22','23']) assert(bars.filter(b => b.date === `2026-10-${day}`).length === 48, `${code}: ${day} incomplete`);
      save(`${code}-5m.json`, {code, interval:'5m', source, retrievedAt:new Date().toISOString(), adjustment:'provider_raw', bars});
      audit.push({code, status:'ok', count:bars.length, source});
      console.log(code, bars.length, bars.at(-1).close);
    } catch(e) {audit.push({code, status:'failed', source, error:e.message});}
  }
  const base = 'https://travelstocks.github.io/daily-trading-review/';
  try {
    const html = await (await get(base)).text();
    const records = JSON.parse(html.match(/const records = (\[.*?\]);/s)[1]);
    const selected = records.filter(r => r.date_iso >= statement.start && r.date_iso <= statement.end);
    save('daily-reviews.json', {source:base, retrievedAt:new Date().toISOString(), records:selected, missingDates:['19','20','21','22','23'].map(d=>`2026-10-${d}`).filter(d=>!selected.some(r=>r.date_iso===d)), note:'仅检索到公开索引；个人操作与反思已隐去。本周逐日操作采用成交记录，情绪采用用户本次二次心得，不伪装成每日原文。'});
  } catch(e) {save('daily-reviews.json', {source:base, records:[], error:e.message});}
  save('collection-audit.json', {retrievedAt:new Date().toISOString(), attemptedProviders:[{name:'Eastmoney',status:'connection closed'},{name:'Tencent',status:'DNS failure'},{name:'Sina',status:'see per-code records'}], results:audit});
  assert(audit.every(r => r.status === 'ok'), 'Some charts are incomplete; see collection-audit.json');
}
main().catch(e => {console.error(e);process.exitCode=1;});
