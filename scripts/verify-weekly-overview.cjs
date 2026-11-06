const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const data=JSON.parse(read('weekly-trading-review/overview-data.json'));
const weeks=data.weeks,latest=weeks.at(-1),recent=JSON.parse(read('2026-10-26_2026-10-30/data/account-estimate.json'));
assert.equal(data.archiveCount,25);assert.equal(data.reflectionOnly.length,0);
assert.equal(data.incompleteReports.length,1);
assert.equal(data.incompleteReports[0].folder,'2026-11-02_2026-11-06');
assert(!weeks.some(w=>w.href.includes('2026-11-02_2026-11-06')),'Incomplete trade report must not invent full-week account returns');
assert.equal(weeks.length,24);assert.equal(new Set(weeks.map(w=>w.href)).size,weeks.length);
assert.equal(latest.label,'10.26-10.30');assert.equal(latest.pnl,recent.pnl);assert.equal(latest.weekPct,recent.weeklyReturnPct);
assert.equal(latest.equity,recent.endingEquity);assert.equal(latest.avgPosition,recent.averagePosition);assert(latest.conditional);
const previous=weeks.at(-2);assert.equal(previous.pnl,-636);assert.equal(previous.equity,10487.86);assert.equal(previous.equityStatus,'费用前估算');
assert.equal(data.totalChange,Math.round(weeks.reduce((s,w)=>s+w.pnl,0)*100)/100);
let peak=-Infinity;for(const w of weeks){peak=Math.max(peak,w.equity);assert(Math.abs(w.drawdown-(w.equity/peak-1)*100)<1e-9);}
for(const f of ['weekly-trading-review/index.html','index.html']){const html=read(f);assert(html.includes('11,132.18'));assert(!html.includes('NaN'));}
const html=read('weekly-trading-review/index.html'),table=html.match(/<table class="weekly-data-table">([\s\S]*?)<\/table>/)[1];
assert.equal((table.match(/<tr>/g)||[]).length,25);
for(const w of weeks)assert(table.includes(`href="${w.href}"`),`Missing table period ${w.label}`);
assert(html.includes('-17,805.81'));assert(html.includes('-64.12%'));assert(html.includes('期初期末口径'));
assert.equal((html.match(/class="panel overview-panel"/g)||[]).length,1);
console.log('24 periods verified: latest account, fee basis, totals, drawdowns, table coverage and homepage.');
