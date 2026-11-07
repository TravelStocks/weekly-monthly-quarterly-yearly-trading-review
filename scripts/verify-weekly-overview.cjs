const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const data=JSON.parse(read('weekly-trading-review/overview-data.json'));
const weeks=data.weeks,latest=weeks.at(-1),recent=JSON.parse(read('2026-10-26_2026-10-30/data/account-estimate.json'));
assert.equal(data.archiveCount,25);assert.equal(data.reflectionOnly.length,0);
assert.equal(weeks.length,25);assert.equal(new Set(weeks.map(w=>w.href)).size,weeks.length);
assert.equal(data.incompleteReports.length,0);
assert.equal(weeks.at(-3).pnl,-636);assert.equal(weeks.at(-3).equity,10487.86);
assert.equal(latest.label,'11.02-11.06');assert.equal(latest.pnl,-1480.39);assert.equal(latest.equity,10319.97);assert.equal(weeks.at(-2).equity,recent.endingEquity);
assert.equal(latest.avgPosition.toFixed(2),'10.08');assert(!latest.conditional);
assert.equal(data.totalChange,Math.round(weeks.reduce((s,w)=>s+w.pnl,0)*100)/100);
let peak=-Infinity;for(const w of weeks){peak=Math.max(peak,w.equity);assert(Math.abs(w.drawdown-(w.equity/peak-1)*100)<1e-9);}
for(const f of ['weekly-trading-review/index.html','index.html']){const html=read(f);assert(html.includes('10,319.97'));assert(!html.includes('NaN'));}
const html=read('weekly-trading-review/index.html'),table=html.match(/<table class="weekly-data-table">([\s\S]*?)<\/table>/)[1];
assert.equal((table.match(/<tr>/g)||[]).length,26);
for(const w of weeks)assert(table.includes(`href="${w.href}"`),`Missing table period ${w.label}`);
assert(html.includes('-18,618.02'));assert(html.includes('-66.74%'));assert(html.includes('期初期末口径'));
assert.equal((html.match(/class="panel overview-panel"/g)||[]).length,1);
console.log('25 periods verified: latest account, fee basis, totals, drawdowns, table coverage and homepage.');
const report=JSON.parse(read('2026-11-02_2026-11-06/data/summary.json')),account=report.account;
assert.equal(report.tradeCount,8);assert.equal(report.closed.length,3);assert.equal(report.closedPnl,-1504.43);
assert.equal(account.opening.equity,11800.36);assert.deepEqual(account.days.map(d=>d.pnl),[-813.83,-346.59,-202.02,-117.95,0]);
assert.equal(Math.round((account.endingEquity-account.opening.equity)*100),account.days.reduce((s,d)=>s+Math.round(d.pnl*100),0));
assert.equal(latest.weekPct,account.weeklyReturnPct);
const card=html.match(/<a class="week-card latest-link" href="\.\.\/2026-11-02_2026-11-06\/">([\s\S]*?)<\/a>/)[1];
assert.equal((card.match(/<b/g)||[]).length,6);assert(card.includes('-1,480.39'));assert(card.includes('10.08%'));
