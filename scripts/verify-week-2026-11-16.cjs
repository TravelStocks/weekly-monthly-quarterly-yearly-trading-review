const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p));
const folder='2026-11-16_2026-11-20',s=json(folder+'/data/summary.json'),a=s.account;
assert.equal(s.status,'complete');assert.equal(s.itemizedTradeCount,7);assert.equal(s.tradeCount,7);
assert.equal(a.opening.equity,9984.32);assert.equal(a.endingEquity,8458.78);assert.equal(a.pnl,-1525.54);assert.equal(a.returnPct.toFixed(2),'-15.28');assert.equal(a.endingPosition,0);assert.equal(a.averagePosition.toFixed(2),'38.40');
assert.deepEqual(a.days.map(d=>d.pnl),[-5,-658.49,0,-489,-373.05]);assert.equal(a.days.at(-1).finalized,true);
assert.equal(s.closed[0].pnl,-663.49);assert.equal(s.closed[1].pnl,-862.05);assert.equal(s.closed[1].net,8063.95);
const html=read(folder+'/index.html');assert.equal((html.match(/class="fill-marker"/g)||[]).length,7);assert.equal((html.match(/class="chart-card"/g)||[]).length,2);
assert(html.includes('24.05'));assert(html.includes('1.00'));assert(html.includes('交割终稿'));assert(!html.includes('<th>合同编号'));
const prev='2026-11-09_2026-11-13',fills=json(prev+'/data/friday-trades.json').trades;
let cash=441413;for(const t of fills){cash+=Math.round(t.net*100);assert.equal(cash,Math.round(t.cash*100))}
assert.equal(cash,998432);assert.equal((read(prev+'/index.html').match(/class="fill-marker"/g)||[]).length,15);
const hub=read('weekly-trading-review/index.html');
assert.equal((hub.match(/class="week-card(?: latest-link)?" href="\.\.\/2026-11-16_2026-11-20\//g)||[]).length,1);
assert.equal((hub.match(/class="week-card(?: latest-link)?" href="\.\.\/2026-11-09_2026-11-13\//g)||[]).length,1);
const overview=json('weekly-trading-review/overview-data.json'),point=overview.weeks.at(-1);
assert(!point.provisional);assert.equal(point.pnl,a.pnl);assert.equal(point.equity,a.endingEquity);
assert(point.bestDay.includes('11-18'));assert(point.worstDay.includes('11-17'));
const svg=hub.match(/<svg class="weekly-chart"[\s\S]*?<\/svg>/)[0];
for(const t of ['11.16-11.20','-1,525.54','-15.28%','-72.74%'])assert(svg.includes(t));
console.log('Final week, four backfilled sells, two charts, balances and overview verified.');
assert(html.includes('id="trade-analysis"'));
for(const text of ['先确认风控问题','95.76%','96.45%','164.27','38.40%','不代填个人KISS'])assert(html.includes(text),text);
for(const doc of [html,hub]){
 assert(doc.includes('<b class="is-loss">-1,525.54</b>'));
 assert(doc.includes('<b class="is-loss">-15.28%</b>'));
}
assert(html.includes('<b class="is-loss">-663.49</b>'));
assert(html.includes('<b class="is-loss">-862.05</b>'));
assert(html.includes('.is-profit{color:#bc382b}'));
assert(html.includes('.is-loss{color:#127759}'));
assert.deepEqual(s.fridaySettlement,{gross:8088,net:8063.95,costs:24.05,costBasis:'总资产衔接所得总费用，非逐笔费税明细'});
for(const f of [folder+'/index.html','weekly-trading-review/index.html','index.html']){const h=read(f);for(const t of ['周五盘中初稿','卖单待补','待收盘核算','本周初稿'])assert(!h.includes(t),f+' '+t)}
