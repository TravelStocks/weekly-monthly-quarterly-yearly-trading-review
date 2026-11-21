const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../research/market-theme-leader-2026');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/study.json'),'utf8'));
const raw=JSON.parse(fs.readFileSync(path.join(root,'data/research.json'),'utf8'));
assert.equal(data.cases.length,8);
assert.equal(new Set(data.cases.map(c=>c.group)).size,6);
const count={dates:0,candles:0,groups:0,missingCandidateDays:[]};
for(const [code,q]of Object.entries(raw.quotes)){
 assert.equal(new Set(q.bars.map(b=>b.date)).size,q.bars.length,code+' duplicate dates');
 for(const b of q.bars){assert(b.low>0&&b.low<=Math.min(b.open,b.close)&&b.high>=Math.max(b.open,b.close));assert(b.amount>=0&&b.volume>=0);count.candles++;}
}
for(const [date,d]of Object.entries(raw.days)){
 assert.equal(date,d.date);count.dates++;
 if(d.strength)for(let i=0;i<d.strength.length;i++){assert.equal(d.strength[i].rank,i+1);if(i)assert(d.strength[i].strength<=d.strength[i-1].strength);}
 for(const g of d.themes||[]){assert.equal(g.stocks.length,g.count);assert.equal(new Set(g.stocks.map(s=>s.code)).size,g.count);for(const s of g.stocks){assert(/^\d{2}:\d{2}:\d{2}$/.test(s.firstSeal));assert(s.lastSeal>=s.firstSeal);assert(s.boards>=1);}count.groups++;}
}
for(const c of data.cases){
 assert(c.previous<c.date);assert.equal(c.before.date,c.previous);assert.equal(c.current.date,c.date);
 for(const d of [c.previous,c.date])if(!raw.days[d]?.strength||!raw.days[d]?.themes)count.missingCandidateDays.push(c.id+':'+d);
 assert.equal(c.indexBars.length,c.timeline.length);assert(c.stockBars.some(b=>b.date===c.date));
}
const minfa=data.cases.find(c=>c.id==='minfa'),baihua=data.cases.find(c=>c.id==='baihua'),mindong=data.cases.find(c=>c.id==='mindong');
assert(Math.abs(minfa.current.market.openingPct+2.107)<.01);
assert.equal(baihua.current.stock.open,10.25);
assert.equal(mindong.current.stock.close,18.48);
assert.equal(data.cases.find(c=>c.id==='jinjian').stockBars.find(b=>b.date==='2026-08-25').high,9.31);
console.log(JSON.stringify(count,null,2));
if(count.missingCandidateDays.length)process.exitCode=2;
