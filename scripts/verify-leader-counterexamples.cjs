const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../research/market-theme-leader-2026');
const d=require(path.join(root,'data/counterexamples.json')),r=require(path.join(root,'data/research.json'));
const pool=r.days['2026-11-05'].pool.stocks,rows=d.cohort;
assert.equal(rows.length,83);assert.equal(new Set(rows.map(x=>x.code)).size,83);
assert.deepEqual(rows.map(x=>x.code).sort(),pool.map(x=>x.code).sort());
for(const x of rows){assert.equal(x.quote.date,'2026-11-06');assert.equal(x.quote.previousDate,'2026-11-05');assert(x.quote.reference>0&&x.quote.open>0);assert(Math.abs(x.openPct-(x.quote.open/x.quote.reference-1)*100)<1e-9);assert(x.quote.source.includes('2026-11-05,2026-11-06'));assert.equal(x.boards,pool.find(p=>p.code===x.code).boards);}
assert.equal(rows.filter(x=>x.openPct>.01).length,22);assert.equal(rows.filter(x=>x.openPct<-.01).length,56);
assert.equal(rows.filter(x=>x.boards>=3).length,4);assert.equal(d.solar.length,16);
for(const s of Object.values(d.opening)){assert.equal(s.known,s.total);assert.equal(s.positive+s.negative+s.flat,s.total);}
const group=r.days['2026-11-06'].themes.find(x=>x.name==='光伏');
for(const code of ['000595','600207','301697','001258'])assert(group.stocks.find(s=>s.code===code).firstSeal>'09:30:06');
const failed=d.solar.find(x=>x.code==='002529');assert(failed.openPct>9.9&&failed.closePct<0);
const html=fs.readFileSync(path.join(root,'counterexamples.html'),'utf8');
for(const id of ['verdict','exceptions','opening','sequence','failed-peer','permission','sources'])assert(html.includes('id="'+id+'"'));
const links=[...html.matchAll(/href="index.html#([^"]+)"/g)];assert.equal(links.length,6);
for(const link of links)assert(require(path.join(root,'data/study.json')).cases.some(c=>c.id===link[1]));
assert(fs.existsSync(path.resolve(root,'../../2026-11-02_2026-11-06/images/minfa-reseal.png')));
assert(!html.includes('./#case-'));
console.log('PASS: full prior-day cohort, 83 exact-date opening quotes, 16 solar names, sign counts, hindsight boundaries, anchors and image.');
