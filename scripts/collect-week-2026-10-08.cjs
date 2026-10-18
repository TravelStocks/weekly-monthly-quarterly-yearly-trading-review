const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const dir = path.resolve(__dirname, '../2026-10-08_2026-10-16/data');
const review = require(path.join(dir, 'review.json'));
const save = (name, data) => fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2) + '\n');
async function get(url) {
  const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
  assert.ok(response.ok, `${response.status} ${url}`);
  return response;
}
async function main() {
  for (const code of ['600241','000993','000823','002242']) {
    for (const interval of [101, 5]) {
      const url = new URL('https://push2his.eastmoney.com/api/qt/stock/kline/get');
      Object.entries({secid:`${code.startsWith('6')?1:0}.${code}`,klt:interval,fqt:0,beg:'20260930',end:'20261016',lmt:1000,
        fields1:'f1,f2,f3,f4,f5,f6',fields2:'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61'})
        .forEach(([key,value])=>url.searchParams.set(key,value));
      const data = (await (await get(url)).json()).data;
      assert.equal(data?.code,code);
      const bars = data.klines.map(line=>{
        const [dt,open,close,high,low,volume]=line.split(',');
        return {dt,date:dt.slice(0,10),time:dt.slice(11),open:+open,close:+close,high:+high,low:+low,volume:+volume};
      }).filter(bar=>bar.date>='2026-09-30' && bar.date<='2026-10-16');
      assert.ok(bars.length && bars.every(b=>b.high>=Math.max(b.open,b.close) && b.low<=Math.min(b.open,b.close)));
      save(`${code}-${interval===5?'5m':'daily'}.json`, {code,name:data.name,interval:interval===5?'5m':'1d',adjustment:'none',source:url.href,retrievedAt:new Date().toISOString(),bars});
      console.log(`${code} ${interval}: ${bars.length} bars; last ${bars.at(-1).close}`);
    }
  }
  const base = 'https://travelstocks.github.io/daily-trading-review/';
  const html = await (await get(base)).text();
  const records = JSON.parse(html.match(/const records = (\[.*?\]);/s)[1]);
  const selected = records.filter(r=>r.date_iso>=review.start && r.date_iso<=review.end);
  const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const reviews=[];
  try {
    const page=await browser.newPage();
    for(const record of selected) {
      const url = new URL(record.page_path.replaceAll('\\','/'),base).href;
      const html=await (await get(url)).text();
      const sections=await page.evaluate(html=>{
        const doc=new DOMParser().parseFromString(html,'text/html');
        doc.querySelectorAll('script,style').forEach(el=>el.remove());
        return [...doc.querySelectorAll('section')].filter(s=>s.querySelector('h2') && /今日操作结果|KISS/.test(s.querySelector('h2').textContent))
          .map(s=>({heading:s.querySelector('h2').textContent.trim(),text:s.textContent.replace(/\s+/g,' ').trim()}));
      },html);
      reviews.push({date:record.date_iso,url,title:record.title,emotion:record.emotion_summary,operation:record.operation_emotion_analysis,reflections:record.personal_reflection,sections});
    }
  } finally {await browser.close();}
  save('daily-reviews.json',{source:base,retrievedAt:new Date().toISOString(),reviews,
    missingDates:review.accountDays.filter(d=>!reviews.some(r=>r.date===d.date)).map(d=>d.date),
    note:'公开日记中的私人操作反思已隐去；不将市场判断改写为本人的操作情绪。逐日成交及二次心得分别标明来源。'});
  console.log('Daily reviews: '+reviews.map(r=>r.date).join(', '));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
