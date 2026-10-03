const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const content = require('./monthly-2026-09-content.cjs');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'monthly-quarterly-trading-review/2026-09');
const dataDir = path.join(out, 'data');
const source = JSON.parse(fs.readFileSync(path.join(dataDir, 'statement-source.json'), 'utf8'));
const daily = JSON.parse(fs.readFileSync(path.join(dataDir, 'daily-reviews.json'), 'utf8')).reviews;
const reflectionSource = JSON.parse(fs.readFileSync(path.join(dataDir, 'second-reflection.json'), 'utf8'));
assert.equal(reflectionSource.clarificationStatus, 'resolved');
assert.equal(reflectionSource.parts.length, 5);
assert(fs.existsSync(path.join(root, '2026-09-21_2026-09-30/data/second-reflection.json')));
for (const [code, judgment] of Object.entries(reflectionSource.confirmedStockJudgments)) {
  if (judgment.profitClassification) assert.equal(content.notes[code].label, judgment.profitClassification);
  if (judgment.lossClassification) assert.equal(content.notes[code].label, judgment.lossClassification);
}
const cents = n => Math.round(n * 100);
const iso = d => `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6)}`;
const h = v => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const money = n => (n / 100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
const signed = n => `${n > 0 ? '+' : ''}${money(n)}`;
const tone = n => n >= 0 ? 'profit' : 'loss';
const readJson = file => JSON.parse(fs.readFileSync(file,'utf8'));
const rows = source.rows.map(values => {
  const row = Object.fromEntries(source.columns.map((key,i) => [key,values[i]]));
  row.amount = Number((row.qty * row.price).toFixed(3));
  row.fee = 5;
  row.side = row.sideType === 'buy' ? '买入' : '卖出';
  if ((row.code === '002403' && row.date === '20260909') || (row.code === '588170' && row.date === '20260921' && row.time === '09:35:53')) {
    row.rawSide = '对方卖出'; row.inferredSide = true;
  }
  row.otherFee = Number((Math.abs(row.net - (row.sideType === 'buy' ? -row.amount : row.amount)) - row.fee - row.tax).toFixed(3));
  return row;
}).sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));

assert.equal(rows.length,86,'Screenshot overlap must not duplicate trades');
assert.equal(new Set(rows.map(r=>r.date+r.time+r.code+r.sideType+r.qty)).size,86);
assert.equal(rows.reduce((n,r)=>n+r.qty,0),35000);
assert.equal(rows.reduce((n,r)=>n+cents(r.amount),0),24517180);
assert.equal(rows.reduce((n,r)=>n+cents(r.net),0),179850);

const notes = content.notes;

const stocks = [...new Set(rows.map(r=>r.code))].map(code=>({
  code,name:rows.find(r=>r.code===code).name,rows:rows.filter(r=>r.code===code),
  qty:0,cost:0,realized:0,rounds:[],round:null,opening:source.openingLots.find(x=>x.code===code),...notes[code],
}));
const byCode = Object.fromEntries(stocks.map(s=>[s.code,s]));
for(const lot of source.openingLots) {
  const s=byCode[lot.code]; s.qty=lot.qty;s.cost=cents(lot.cost);
  s.round={start:'期初持仓',cost:s.cost,pnl:0,old:true};
}
const snapshots=[];
const realizedByDate={};
let cash=cents(6636.02),maxHeld=0;
for(let i=0;i<rows.length;i++) {
  const r=rows[i],s=byCode[r.code];
  cash+=cents(r.net);
  if(r.sideType==='buy') {
    if(s.qty===0) s.round={start:iso(r.date),cost:0,pnl:0,old:false};
    s.qty+=r.qty;s.cost+=-cents(r.net);s.round.cost+=-cents(r.net);
  } else {
    assert(s.qty>=r.qty,`Unmatched sell ${r.code} ${r.date}`);
    const allocated=r.qty===s.qty?s.cost:Math.round(s.cost*r.qty/s.qty);
    r.realized=cents(r.net)-allocated;s.realized+=r.realized;s.round.pnl+=r.realized;
    realizedByDate[r.date]=(realizedByDate[r.date]||0)+r.realized;
    s.qty-=r.qty;s.cost-=allocated;
    if(s.qty===0) {r.roundRealized=s.round.pnl;s.rounds.push({...s.round,end:iso(r.date)});s.round=null;}
  }
  maxHeld=Math.max(maxHeld,stocks.filter(s=>s.qty>0).length);
  if(i===rows.length-1||rows[i+1].date!==r.date) {
    const cost=stocks.reduce((n,s)=>n+s.cost,0);
    const observed=cents(r.cash);
    snapshots.push({date:iso(r.date),held:stocks.filter(s=>s.qty>0).length,cost,cash:observed,costUsage:cost/(observed+cost)*100,realized:realizedByDate[r.date]||0});
  }
}
assert.equal(byCode['000993'].qty,100);
assert.equal(byCode['000993'].cost,171400);
assert(stocks.filter(s=>s.code!=='000993').every(s=>s.qty===0));
const totalPnl=stocks.reduce((n,s)=>n+s.realized,0);
assert.equal(totalPnl,-336551);
const oldPnl=stocks.filter(s=>s.opening).reduce((n,s)=>n+s.realized,0);
const totalFees=rows.reduce((n,r)=>n+cents(r.fee+r.tax+r.otherFee),0);
const profit=stocks.filter(s=>s.realized>0).sort((a,b)=>b.realized-a.realized);
const loss=stocks.filter(s=>s.realized<0).sort((a,b)=>a.realized-b.realized);
const grossProfit=profit.reduce((n,s)=>n+s.realized,0);
const grossLoss=-loss.reduce((n,s)=>n+s.realized,0);
const sessions=readJson(path.join(dataDir,'000993-5m.json')).bars.map(b=>b.date);
const dates=[...new Set(sessions)].sort();
const reentries=[];
for(const s of stocks) {
  let sale;
  for(const r of s.rows) {
    if(r.sideType==='sell') sale=r;
    else if(sale) {
      const diff=dates.indexOf(iso(r.date))-dates.indexOf(iso(sale.date));
      if(diff===0||diff===1) {
        reentries.push({code:s.code,name:s.name,sell:iso(sale.date)+' '+sale.time,buy:iso(r.date)+' '+r.time,
          precedingRealized:sale.roundRealized??sale.realized, confirmedLoss:(sale.roundRealized??sale.realized)<0});
        sale=null;
      }
    }
  }
}
const rounds=stocks.flatMap(s=>s.rounds.map(r=>({...r,code:s.code,name:s.name})));
const models=['模式内','非模式','需复核'].map(label=>({label,count:stocks.filter(s=>s.model===label).length}));
const important=new Set([...profit.slice(0,2),...loss.slice(0,3)].map(s=>s.code));
const fullSummary={range:source.range,buildDate:'2026-10-04',trades:rows.length,stocks:stocks.length,
  closedRealized:totalPnl/100,newPositionRealized:(totalPnl-oldPnl)/100,openingPositionRealized:oldPnl/100,
  allTradeFees:totalFees/100,grossProfit:grossProfit/100,grossLoss:grossLoss/100,
  rankingBasis:'含费历史成本闭环；闽东电力期末100股浮盈浮亏按用户要求排除。跨期持仓闭环不等于本期资产贡献。',
  accountReturn:null,accountMaxDrawdown:null,accountPnl:null,
  cashReconciliationDifference:(cents(rows.at(-1).cash)-cash)/100,
  maxConcurrentHoldings:maxHeld,models,reentries,snapshots,
  stocks:stocks.map(s=>({code:s.code,name:s.name,realized:s.realized/100,openQty:s.qty,openCost:s.cost/100,
    openingQty:s.opening?.qty||0,model:s.model,tags:s.tags,classification:s.label,rounds:s.rounds.map(r=>({...r,cost:r.cost/100,pnl:r.pnl/100}))})),
  pendingReflectionQuestions:[],
  reflection:{status:'integrated',updatedOn:'2026-10-04',sourceParts:5,inheritedWeeklyRange:'09.21–09.30',poorRoundCount:6,countBasis:'本人总体回看，不是独立重算的成交数',skippedRebuyJudgment:'桂林旅游'},
};
fs.writeFileSync(path.join(dataDir,'summary.json'),JSON.stringify(fullSummary,null,2)+'\n');
fs.writeFileSync(path.join(dataDir,'trades.json'),JSON.stringify(rows,null,2)+'\n');
const csvCols=['date','time','code','name','side','qty','price','amount','fee','tax','otherFee','net'];
fs.writeFileSync(path.join(dataDir,'trades.csv'),'\uFEFF'+['成交日期,成交时间,证券代码,证券名称,操作,数量,成交价,成交额,手续费,印花税,其他费用,发生金额',...rows.map(r=>csvCols.map(k=>k==='code'?`="${r[k]}"`:r[k]).join(','))].join('\r\n'));

function table(headers,body,className='') {
  return `<div class="table-scroll"><table class="${className}"><thead><tr>${headers.map(x=>`<th scope="col">${h(x)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}
const cells=items=>'<tr>'+items.map(x=>'<td>'+x+'</td>').join('')+'</tr>';
const tags=s=>s.tags.map(t=>`<span class="tag">${h(t)}</span>`).join('');
function ranking(list) {
  return table(['标的 / 排名','已实现净额','归类 / 标签','月度判断'],list.map((s,i)=>cells([
    `<a href="#stock-${s.code}"><strong>${i+1}. ${h(s.name)}</strong></a><small>${s.code}${s.opening?' · 期初仓':''}</small>`,
    `<strong class="${tone(s.realized)} numeric">${signed(s.realized)}</strong><small>${s.rounds.length}轮闭环${s.qty?' · 期末仓排除':''}</small>`,
    `<b>${h(s.label)}</b><div class="tags">${tags(s)}</div>`,h(s.lesson),
  ])).join(''),'ranking');
}
const displayPrice = (n,code) => n.toFixed(code==='588170'||code==='159516'?3:2);
const charts=[];
function chart(s,date,bars,trades) {
  assert.equal(bars.length,48,`Expected full intraday session ${s.code} ${date}`);
  const W=980,H=320,L=66,R=26,T=42,B=46;
  const values=[...bars.flatMap(b=>[b.high,b.low]),...trades.map(r=>r.price)];
  const min=Math.min(...values),max=Math.max(...values),pad=Math.max((max-min)*.12,max*.006);
  const low=min-pad,high=max+pad;
  const x=i=>L+(i+.5)*(W-L-R)/48, y=p=>T+(high-p)/(high-low)*(H-T-B);
  const grid=Array.from({length:5},(_,i)=>{
    const p=low+(high-low)*i/4;
    return `<line x1="${L}" x2="${W-R}" y1="${y(p)}" y2="${y(p)}" stroke="#e3e7ec"/><text x="${L-10}" y="${y(p)+4}" text-anchor="end" class="axis">${displayPrice(p,s.code)}</text>`;
  }).join('');
  const candles=bars.map((b,i)=>{
    const color=b.close>=b.open?'#c2412d':'#14845f';
    return `<g class="candle"><title>${h(b.dt)} 开${b.open} 高${b.high} 低${b.low} 收${b.close}</title><line x1="${x(i)}" x2="${x(i)}" y1="${y(b.high)}" y2="${y(b.low)}" stroke="${color}"/><rect x="${x(i)-4}" y="${Math.min(y(b.open),y(b.close))}" width="8" height="${Math.max(1,Math.abs(y(b.open)-y(b.close)))}" fill="${color}"/></g>`;
  }).join('');
  const line=bars.map((b,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(b.close).toFixed(1)}`).join(' ');
  const axis=[0,11,23,35,47].map(i=>`<text x="${x(i)}" y="${H-16}" text-anchor="middle" class="axis">${bars[i].time}</text>`).join('');
  const labels=[];
  const markers=trades.map(r=>{
    // A five-minute bar is labelled by interval end; transaction seconds remain in the ledger.
    const i=bars.findIndex(b=>`${b.time}:00`>=r.time);
    assert(i>=0,`No trade bar ${s.code} ${date} ${r.time}`);
    const bar=bars[i];
    assert(r.price>=bar.low-.011&&r.price<=bar.high+.011,`Trade price outside bar ${s.code} ${date} ${r.time}: ${r.price}, range ${bar.low}-${bar.high}`);
    const px=x(i),py=y(r.price),buy=r.sideType==='buy',color=buy?'#b83126':'#1d4ed8';
    let lx=px,ly=py;
    for(let k=0;k<40;k++) {
      lx=Math.max(L+14,Math.min(W-R-14,px+[0,35,-35,70,-70][k%5]));
      ly=Math.max(20,Math.min(H-B-8,py+(buy?-1:1)*(22+Math.floor(k/5)*22)));
      if(!labels.some(p=>Math.abs(p.x-lx)<30&&Math.abs(p.y-ly)<18)) break;
    }
    labels.push({x:lx,y:ly});
    const pts=buy?`${px},${py-6} ${px-5},${py+4} ${px+5},${py+4}`:`${px},${py+6} ${px-5},${py-4} ${px+5},${py-4}`;
    return `<g class="trade-marker ${r.sideType}" data-time="${iso(r.date)} ${r.time}"><title>${r.marker} ${r.side} ${r.time} ${r.price} / ${r.qty}</title><line x1="${px}" x2="${lx}" y1="${py}" y2="${ly}" stroke="${color}" stroke-dasharray="3 3"/><polygon points="${pts}" fill="${color}" stroke="#fff"/><text x="${lx}" y="${ly}" text-anchor="middle" fill="${color}" class="point-label">${r.marker}</text></g>`;
  }).join('');
  charts.push({code:s.code,date,markers:trades.length,bars:bars.length});
  return `<figure class="chart"><figcaption><strong>${h(s.name)} · ${date}</strong><span>B 买入 · S 卖出 · 真实5分钟，不复权</span></figcaption><div class="chart-scroll"><svg class="stock-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${h(s.name)} ${date}真实5分钟买卖点图"><rect width="${W}" height="${H}" fill="#fff"/>${grid}${candles}<path d="${line}" fill="none" stroke="#8b96a6" stroke-width="1"/>${markers}${axis}</svg></div></figure>`;
}
function stockSection(s) {
  const file=path.join(dataDir,s.code+'-5m.json');
  assert(fs.existsSync(file),`Missing chart ${s.code}`);
  const market=readJson(file);
  s.rows.forEach((r,i)=>r.marker=(r.sideType==='buy'?'B':'S')+(i+1));
  const tradeDates=[...new Set(s.rows.map(r=>iso(r.date)))];
  const plots=tradeDates.map(date=>chart(s,date,market.bars.filter(b=>b.date===date),s.rows.filter(r=>iso(r.date)===date))).join('');
  const flow=table(['点位','完整成交时间','操作','成交价 / 数量','发生金额'],s.rows.map(r=>cells([
    `<b class="${r.sideType}">${r.marker}</b>`,`${iso(r.date)}<br>${r.time}`,`${r.side}${r.inferredSide?'<small>原列：对方卖出</small>':''}`,
    `${displayPrice(r.price,s.code)} / ${r.qty.toLocaleString()}${s.code.startsWith('5')||s.code.startsWith('15')?'份':'股'}`,
    `<span class="numeric">${signed(cents(r.net))}</span>`,
  ])).join(''),'flow');
  const roundHtml=s.rounds.map((r,i)=>`${i+1}轮 ${r.start} → ${r.end}：<b class="${tone(r.pnl)}">${signed(r.pnl)}</b>`).join('；');
  return `<details class="stock-section" id="stock-${s.code}" ${important.has(s.code)?'open':''}><summary><span><strong>${h(s.name)}</strong><small>${s.code} · ${s.rows.length}笔 · ${h(s.type)}</small></span><b class="${tone(s.realized)}">${signed(s.realized)}</b></summary><div class="stock-body"><p class="stock-lesson"><strong>${s.realized>0?'盈利质量 / 复盘点':'关键错误 / 检查点'}：</strong>${h(s.lesson)}</p><p class="subtle">${roundHtml}${s.qty?`；期末${s.qty}股，含费成本${money(s.cost)}，浮盈浮亏按要求排除。`:''}</p><dl class="stock-review"><div><dt>操作类型</dt><dd>${h(s.type)}</dd></div><div><dt>预案 vs 实际</dt><dd>${h(s.plan)}<br>实际：${s.rows.filter(r=>r.sideType==='buy').reduce((n,r)=>n+r.qty,0)}买入 / ${s.rows.filter(r=>r.sideType==='sell').reduce((n,r)=>n+r.qty,0)}卖出；${h(s.label)}。</dd></div><div><dt>当时最正确动作</dt><dd>${h(s.action)}</dd></div></dl>${s.copy?`<div class="copy-model"><h4>可复制模型</h4><ul>${s.copy.map(t=>`<li>${h(t)}</li>`).join('')}</ul></div>`:''}<p class="evidence">判断依据：${h(s.basis)}${s.model==='需复核'?'；保留未裁定或历史预案不足的边界，不把它等同于尚未收到反思。':''}</p>${flow}${plots}<p class="evidence">行情来源：<a href="${h(market.source)}" target="_blank" rel="noopener">新浪真实5分钟行情</a> · 成交秒级时间保留在表中，图中对齐其所在5分钟区间。</p></div></details>`;
}
const stockHtml=[...stocks].sort((a,b)=>Math.abs(b.realized)-Math.abs(a.realized)).map(stockSection).join('');
assert.equal(charts.reduce((n,c)=>n+c.markers,0),86);
const navStock=s=>`<a href="#stock-${s.code}" data-code="${s.code}" data-name="${h(s.name)}" data-pnl="${Math.abs(s.realized)}" data-first="${s.rows[0].date+s.rows[0].time}" title="${h(s.name)} ${s.code}"><span>${h(s.name)}<small>${s.code}</small></span><b class="${tone(s.realized)}">${signed(s.realized)}</b></a>`;
const sourceHtml=table(['来源 / 覆盖','本期用途','状态'],[
  cells(['<a href="../../2026-08-10_2026-08-15/">08.10–08.15 周度</a>','华西800股、秦安100股的历史买入成本；不计为本期新成交。','期初仓依据']),
  cells(['<a href="../2026-08/">8月复盘</a> / <a href="data/prior-august-review.html">原战法手册留档</a>','二波续强、同批PK、条件单规则与此前本人反思。','规则对照']),
  cells(['<a href="../../2026-08-16_2026-08-23/">08.16–08.23 周度</a> / <a href="../../2026-08-23_2026-08-30/">08.23–08.30 周度</a>','本期27笔交割补齐08.17–08.28；与本人医药补涨阶段反思相互核对。','周度 + 交割补档']),
  cells(['<a href="../../2026-08-31_2026-09-04/">08.31–09.04 周度</a>','11笔，含百花旧仓处理、农业短线及传媒试错。','已有周度']),
  cells(['<a href="../../2026-09-07_2026-09-11/">09.07–09.11 周度</a>','17笔，含爱仕达止损、百大确认、桂林清仓后回补。','已有周度']),
  cells(['<a href="../../2026-09-13_2026-09-20/">09.13–09.20 周度</a>','本期11笔09.14–09.18交割；桂林退出、国芳、闽东、西陇与ETF，对照本人反思。','周度 + 交割补档']),
  cells([fs.existsSync(path.join(root,'2026-09-21_2026-09-30/index.html'))?'<a href="../../2026-09-21_2026-09-30/">09.21–09.30 双周复盘</a>':'09.21–09.30 补档','20笔；对照9/22、9/23、9/24、9/29日度原文，纳入三张截图。','本期来源']),
  cells(['<a href="data/statement-source.json">交割核对底稿</a>','86笔去重，数量35,000，成交额245,171.80，发生金额合计+1,798.50。','已核对']),
  cells(['<a href="data/second-reflection.json">本轮二次反思与澄清</a>','五段口述、两轮澄清；9/21–9/30沿用已确认双周二次反思。','已整合']),
].join(''));
const scores=content.scores(maxHeld);
const coreRows=content.coreRows;

const monthlyPeriods=[['08.17–08.31','202608'],['09.01–09.30','202609']].map(([label,key])=>{
  const pnl=Object.entries(realizedByDate).filter(([date])=>date.startsWith(key)).reduce((n,[,v])=>n+v,0);
  return cells([label,`${rows.filter(r=>r.date.startsWith(key)).length}笔`, `<b class="${tone(pnl)}">${signed(pnl)}</b>`,key==='202608'?'含期初华西、秦安历史成本闭环；8/31金健300股跨入9月。':'包含跨入9月的金健闭环；9/30闽东100股排除浮盈浮亏。']);
}).join('');
const dailyHtml=daily.map(r=>`<details class="daily-note"><summary>${r.date} · 操作与情绪依据</summary><div><p>${h(r.operation).replaceAll('\n','<br>')}</p><ul>${(r.reflections||[]).map(t=>`<li>${h(t)}</li>`).join('')}</ul><a href="${h(r.url)}" target="_blank" rel="noopener">查看当日日度原文</a></div></details>`).join('');
const allTrades=table(['完整成交时间','标的','操作','数量','价格','成交金额','总费用','发生金额'],rows.map(r=>cells([
  `${iso(r.date)}<br>${r.time}`,`<a href="#stock-${r.code}">${h(r.name)}</a><small>${r.code}</small>`,`${r.side}${r.inferredSide?'<small>原列：对方卖出</small>':''}`,r.qty.toLocaleString(),displayPrice(r.price,r.code),money(cents(r.amount)),money(cents(r.fee+r.tax+r.otherFee)),signed(cents(r.net)),
])).join(''),'all-trades');
const sections=content.render({h,table,cells,reentries,maxHeld,totalFees,money,raw:reflectionSource,dailyHtml,dailyCount:daily.length});
const html=`<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2026年9月阶段复盘｜08.15–09.30 交易审判书</title>
<style>
:root{--bg:#f4f6f8;--paper:#fff;--ink:#1b2430;--muted:#5e6b7c;--line:#dbe2e9;--accent:#b83126;--up:#08764f;--down:#b42332;--blue:#1d4ed8;--soft:#f7f9fb}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.7 "Microsoft YaHei","PingFang SC",Arial,sans-serif;letter-spacing:0}a{color:var(--blue);text-underline-offset:3px}a:hover{text-decoration:underline}button,input{font:inherit}a,button,summary,input{touch-action:manipulation}a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible{outline:2px solid var(--blue);outline-offset:3px}h1,h2,h3,h4,p{margin-top:0}h1{font-size:32px;line-height:1.35;margin:10px 0 12px}h2{font-size:23px;line-height:1.4;margin:0 0 10px}h3{font-size:18px;margin:0 0 8px}h4{margin:0 0 8px}p{margin-bottom:12px}small{display:block;color:var(--muted);font-size:12px;line-height:1.6}ul,ol{padding-left:23px}li{margin:7px 0}strong,b{font-weight:700}.profit{color:var(--up)}.loss{color:var(--down)}.numeric{font-variant-numeric:tabular-nums;white-space:nowrap}.subtle,.evidence{color:var(--muted)}.evidence{font-size:13px}.skip{position:absolute;left:-9999px}.skip:focus{left:12px;top:8px;background:white;padding:10px;z-index:9}.shell{display:grid;grid-template-columns:246px minmax(0,1fr);gap:24px;max-width:1536px;margin:auto;padding:24px}.rail{position:sticky;top:20px;max-height:calc(100dvh - 40px);overflow:auto;padding:16px 14px;background:var(--paper);border:1px solid var(--line);border-radius:8px}.rail-brand{text-decoration:none;color:var(--ink);display:block;padding:4px 8px 14px;border-bottom:1px solid var(--line)}.rail-brand strong{font-size:20px}.rail nav{display:grid;gap:3px;margin:12px 0}.rail nav>a{display:flex;align-items:center;min-height:40px;padding:7px 9px;color:var(--muted);border-radius:4px;text-decoration:none;font-size:14px}.rail nav>a:hover,.rail nav>a.active{background:var(--soft);color:var(--ink)}.rail summary{min-height:44px;cursor:pointer;font-weight:700;padding:8px}.stock-index{border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:12px 0;padding:5px 0}.index-controls{padding:8px 2px}.segments{display:flex;border:1px solid var(--line);border-radius:4px;overflow:hidden}.segments button{flex:1;min-height:40px;background:white;border:0;cursor:pointer;font-size:13px;color:var(--muted)}.segments button[aria-pressed=true]{background:#eaf0f8;color:var(--blue);font-weight:700}.search-label{display:block;font-size:12px;margin:10px 0 4px;color:var(--muted)}#stock-search{width:100%;min-height:40px;border:1px solid var(--line);padding:7px;border-radius:4px}.stock-links{display:grid;gap:2px}.stock-links a{display:flex;justify-content:space-between;align-items:center;gap:6px;min-height:44px;padding:5px 8px;text-decoration:none;font-size:13px;color:var(--ink)}.stock-links a:hover{background:var(--soft)}.stock-links b{font-size:12px;font-variant-numeric:tabular-nums}.stock-links a[hidden]{display:none}.content{min-width:0;background:var(--paper);border:1px solid var(--line)}section{padding:26px 28px;border-bottom:1px solid var(--line);scroll-margin-top:20px;min-width:0}section:last-child{border-bottom:0}.range{font-size:13px;color:var(--muted);margin:0}.verdict{border-left:4px solid var(--accent);padding:5px 0 5px 16px;margin:16px 0}.verdict h2{font-size:22px}.verdict p{margin:0}.notice{padding:12px 0;color:var(--muted);font-size:13px;border-top:1px solid var(--line)}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin:20px 0}.metric{padding-left:14px;border-left:2px solid var(--line);min-width:0}.metric span{display:block;color:var(--muted);font-size:13px}.metric strong{display:block;font-size:25px;line-height:1.5;overflow-wrap:anywhere}.table-scroll{overflow-x:auto;max-width:100%;border:1px solid var(--line);border-radius:4px;margin:14px 0}table{border-collapse:collapse;width:100%;font-size:13px;min-width:700px}th{background:var(--soft);font-size:12px;color:var(--muted);font-weight:700}th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid var(--line)}tr:last-child td{border-bottom:0}td{overflow-wrap:anywhere}td a{color:var(--ink)}.ranking td:first-child{width:145px}.ranking td:nth-child(2){width:130px}.ranking td:nth-child(3){width:170px}.tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}.tag{font-size:11px;color:var(--muted);background:var(--soft);border:1px solid var(--line);padding:1px 6px;border-radius:3px}.finding{padding:17px 0;border-top:1px solid var(--line)}.finding p:last-child{margin-bottom:0}.finding:first-of-type{border-top:0}.score td:nth-child(2){white-space:nowrap;font-size:18px;font-weight:700}.model-strip{display:flex;gap:24px;flex-wrap:wrap;margin:18px 0}.model-strip b{font-size:19px}.rules{display:grid;grid-template-columns:1fr 1fr;gap:0 30px}.rules article{padding:14px 0;border-top:1px solid var(--line)}.checklist li{padding-left:4px}.targets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin:20px 0}.targets article{border-top:3px solid var(--blue);padding-top:12px}.targets b{display:block;font-size:20px;margin-bottom:8px}.stock-section{border-top:1px solid var(--line);scroll-margin-top:20px}.stock-section:last-child{border-bottom:1px solid var(--line)}.stock-section>summary{list-style:none;display:flex;justify-content:space-between;gap:18px;align-items:center;min-height:76px;padding:14px 0;cursor:pointer}.stock-section>summary::-webkit-details-marker{display:none}.stock-section>summary strong{font-size:18px}.stock-section>summary>b{font-size:18px;white-space:nowrap;font-variant-numeric:tabular-nums}.stock-section>summary>span:before{content:"";display:inline-block;width:8px;height:8px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(-45deg);margin-right:10px;vertical-align:3px}.stock-section[open]>summary>span:before{transform:rotate(45deg)}.stock-body{padding:0 0 25px}.stock-lesson{padding:13px 16px;background:var(--soft);border-left:3px solid var(--line)}.stock-review{margin:16px 0}.stock-review>div{display:grid;grid-template-columns:120px minmax(0,1fr);gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}dt{font-weight:700;font-size:13px}dd{margin:0;color:var(--muted);font-size:13px}.copy-model{padding:12px 0}.copy-model ul{margin:0}.buy{color:var(--accent)}.sell{color:var(--blue)}.flow{min-width:600px}.chart{margin:18px 0;border:1px solid var(--line);border-radius:4px}.chart figcaption{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:10px 14px;background:var(--soft);font-size:13px}.chart figcaption span{color:var(--muted);font-size:12px}.chart-scroll{overflow:auto}.stock-chart{display:block;width:100%;min-width:700px;aspect-ratio:980/320}.axis{fill:var(--muted);font:12px Arial,sans-serif}.point-label{font:700 13px Arial,sans-serif;paint-order:stroke;stroke:#fff;stroke-width:3px}.all-trades{min-width:900px}.daily-note{padding:12px 0;border-top:1px solid var(--line)}.daily-note summary{cursor:pointer;min-height:32px;font-weight:700}.daily-note>div{padding:12px 0;font-size:14px;color:var(--muted)}.button-links{display:flex;gap:18px;flex-wrap:wrap;margin:12px 0}.button-links a{min-height:40px;display:inline-flex;align-items:center;font-size:14px}.footer{font-size:12px;color:var(--muted);padding:24px 0}#no-stock-results{font-size:13px;padding:8px}#no-stock-results[hidden]{display:none}@media(max-width:1180px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.shell{grid-template-columns:220px minmax(0,1fr);gap:16px;padding:16px}section{padding:22px}}@media(max-width:900px){.shell{display:block;padding:12px}.rail{position:static;max-height:none;margin-bottom:16px}.rail nav{grid-template-columns:repeat(3,minmax(0,1fr))}.rail nav>a{justify-content:center;text-align:center}.stock-links{grid-template-columns:repeat(3,minmax(0,1fr))}.rail-brand small{display:inline;margin-left:8px}.rail .index-controls{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:end}.search-label{grid-column:2;grid-row:1;margin:0}#stock-search{grid-column:2;grid-row:2}.segments{grid-column:1;grid-row:2}.rail .stock-index{margin:4px 0}.rail nav:last-child{border-top:1px solid var(--line);padding-top:10px}h1{font-size:29px}}@media(max-width:560px){body{font-size:15px}.shell{padding:8px}.rail{padding:10px}.rail nav{grid-template-columns:repeat(2,minmax(0,1fr))}.stock-links{grid-template-columns:repeat(2,minmax(0,1fr))}.stock-links a{font-size:12px}.stock-links b{font-size:11px}.content section{padding:22px 16px}.metrics{gap:18px 10px}.metric{padding-left:10px}.metric strong{font-size:22px}.rules,.targets{grid-template-columns:1fr}.stock-review>div{grid-template-columns:1fr;gap:4px}.stock-section>summary{gap:8px}.stock-section>summary strong,.stock-section>summary>b{font-size:16px}.verdict h2{font-size:20px}.verdict{padding-left:12px}h1{font-size:27px}.chart figcaption{gap:4px}.rail-brand small{display:block;margin-left:0}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
.chapter-index>summary{display:none}@media(max-width:900px){.chapter-index>summary{display:list-item;min-height:44px;cursor:pointer;font-weight:700;padding:8px;border-bottom:1px solid var(--line)}}
${content.styles}
</style></head><body><a class="skip" href="#overview">跳到复盘正文</a><div class="shell"><aside class="rail" aria-label="月度复盘导航"><a class="rail-brand" href="#overview"><strong>9月阶段复盘</strong><small>08.15–09.30 · 1.5个月</small></a><details class="chapter-index" open><summary>本期章节</summary><nav aria-label="本页章节"><a href="#overview" class="active">本期概览</a><a href="#verdict">交易审判书</a><a href="#reflection">二次反思总评</a><a class="reflection-sub" href="#reflection-cases">关键案例</a><a class="reflection-sub" href="#reflection-weeks">逐周演进</a><a class="reflection-sub" href="#reflection-models">三类买点</a><a href="#sources">周度来源</a><a href="#profits">盈利排行</a><a href="#losses">亏损排行</a><a href="#scores">五项评分</a><a href="#core">真正核心票</a><a href="#problems">共性问题</a><a href="#followthrough">上期规则检查</a><a href="#rules">落地铁律</a><a href="#maps">买卖点地图</a><a href="#trades">完整成交</a><a href="#next">10月目标</a><a href="#reflection-archive">反思留档</a></nav></details><details class="stock-index" open><summary>逐票买卖点索引 · 24</summary><div class="index-controls"><div class="segments" role="group" aria-label="股票导航排序"><button type="button" data-order="pnl" aria-pressed="true">盈亏重要性</button><button type="button" data-order="time" aria-pressed="false">交易时间</button></div><label for="stock-search" class="search-label">名称 / 代码</label><input id="stock-search" type="search" autocomplete="off"></div><div class="stock-links">${[...stocks].sort((a,b)=>Math.abs(b.realized)-Math.abs(a.realized)).map(navStock).join('')}</div><p id="no-stock-results" hidden>没有匹配标的</p></details><nav aria-label="站点导航"><a href="../">月 / 季导航</a><a href="../../weekly-trading-review/">周度主页</a><a href="../../index.html">总首页</a></nav></aside>
<main class="content">
<section id="overview"><p class="range">2026.08.15–09.30 · 本期实际成交08.17–09.30 · 反思更新于2026.10.04</p><h1>1.5个月交易审判书</h1><div class="verdict"><h2>最大错误：没先认清题材阶段，就选票、套模式；错后还想摊低成本。</h2><p>百花窗口错后追加、西陇弱势摊成本、爱仕达补涨期做弱切换。阶段、模式、买点、风险预算必须先匹配；同时保留百大确认、内蒙兑现与后段等待的进步。</p></div><div class="metrics"><div class="metric"><span>含费闭环已实现</span><strong class="loss">${signed(totalPnl)}</strong><small>含期初仓历史成本闭环</small></div><div class="metric"><span>交割覆盖</span><strong>86笔 / 24只</strong><small>全部秒级时间，${charts.length}张日内图</small></div><div class="metric"><span>单票最大正贡献</span><strong class="profit">+597.77</strong><small>汉森制药 · 运气盈利</small></div><div class="metric"><span>单票最大负贡献</span><strong class="loss">-1,283.64</strong><small>百花医药二波</small></div></div><p class="notice">按本人指定的8/15–9/30跨月范围统计。9/30仅剩闽东电力100股，成本1,714.00元，其浮盈浮亏按本人要求暂不计入。上方金额是交割闭环结果，不能替代账户收益率或本期资产变化；五段二次反思、两轮澄清及双周反思已整合；未裁定项不新增结论。</p></section>
${sections.verdict}
${sections.reflection}
${sections.cases}
${sections.weeks}
${sections.models}
<section id="sources"><h2>周度来源与数据口径</h2><p class="subtle">周度交割、前期成本、本人日记和本次截图相互核对；无独立周度页的区间直接在本期补档。排行统一按含费历史成本闭环，跨月明细保留。</p>${sourceHtml}${table(['成交段','成交数','该段兑现损益','说明'],monthlyPeriods)}<p class="evidence">已核对：86笔、24只标的、总成交数量35,000（股票股数与ETF份数合计）、总成交额245,171.80元。发生金额合计+1,798.50元是现金流，减期初成本6,878.01元、加回排除持仓成本1,714.00元后，得到闭环净额-3,365.51元。</p><p class="evidence">现金桥仍差0.80元，可能来自截图外资金项目，不能强行归为交易收益。期初仓历史成本闭环-${money(-oldPnl)}元；本期新建且已闭环仓位${signed(totalPnl-oldPnl)}元。账户本期收益、收益率、最大回撤仍需账户表核定。</p></section>
<section id="profits"><h2>盈利排行</h2><p class="subtle">5只盈利、合计${signed(grossProfit)}元。复制模型与利润金额分别判断；期初秦安单独标记。</p>${ranking(profit)}</section>
<section id="losses"><h2>亏损排行</h2><p class="subtle">19只负贡献、合计-${money(grossLoss)}元。百花、爱仕达、时代、欢瑞四票合计亏2,919.42元，占负贡献约${((128364+58281+57663+47634)/grossLoss*100).toFixed(1)}%；时代按分时买点错、欢瑞按唯一性未确认归类；亏损金额不代替系统伤害。</p>${ranking(loss)}</section>
<section id="scores"><h2>五项系统评分</h2><p class="subtle">依据已确认反思给出1–5分，按风控、定龙、纪律、买卖点、集中度依次审判。后段有进步不抵销前段错误；评分是复盘归纳，不是账户绩效量化。</p>${table(['维度','评分','证据','1 / 3 / 5分标准'],scores.map(r=>cells(r.map(h))).join(''),'score')}<div class="model-strip">${models.map(m=>`<span>${m.label} <b>${m.count}只 / ${(m.count/24*100).toFixed(1)}%</b></span>`).join('')}</div><p class="evidence">按24只去重标的、含入场和执行质量归类；多轮标的可能混合，未裁定或预案不足保留“需复核”。这是标的占比，不是闭环胜率；模式内也会亏，盈利也可能来自运气或非模式。</p></section>
<section id="core"><h2>本期真正应该做的核心票</h2>${table(['市场阶段','应观察核心','实际行为','定龙正确？','依据','偏离 / 待核原因'],coreRows.map(r=>cells(r.map(h))).join(''))}<p class="evidence">核心与阶段识别引用本人回看及日度依据；实际成交单列。事后候选不等于当时必然可买，不新增虚拟收益。</p></section>
${sections.problems}
${sections.followthrough}
${sections.rules}
<section id="maps"><h2>每只票的买卖点地图</h2><p class="subtle">24只全部保留，按实际成交日展示${charts.length}张真实5分钟图、86个成交点。默认展开前两名盈利与前三名亏损；导航跳转自动展开目标标的。</p>${stockHtml}</section>
<section id="trades"><h2>完整成交明细</h2><div class="button-links"><a href="data/trades.csv" download>下载86笔成交 CSV</a><a href="data/summary.json" target="_blank" rel="noopener">查看核算汇总</a></div><p class="evidence">保留每笔成交日期、秒级时间、数量、价格与费用。未发布合同号、成交编号、账号和原始私密截图。</p>${allTrades}</section>
${sections.next}
${sections.archive}
</main></div><script>
const links=document.querySelector('.stock-links');
if(window.matchMedia('(max-width:900px)').matches){document.querySelector('.stock-index').open=false;document.querySelector('.chapter-index').open=false;}
document.querySelectorAll('[data-order]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-order]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const items=[...links.children];
  items.sort((a,b)=>button.dataset.order==='pnl'?Number(b.dataset.pnl)-Number(a.dataset.pnl)||a.dataset.code.localeCompare(b.dataset.code):a.dataset.first.localeCompare(b.dataset.first));
  items.forEach(a=>links.append(a));
}));
document.querySelector('#stock-search').addEventListener('input',event=>{
  const q=event.target.value.trim().toLowerCase();let found=0;
  [...links.children].forEach(a=>{a.hidden=!((a.dataset.name+a.dataset.code).toLowerCase().includes(q));if(!a.hidden)found++;});
  document.querySelector('#no-stock-results').hidden=found>0;
});
function reveal(hash){const id=decodeURIComponent(hash.slice(1));const el=document.getElementById(id);if(el?.classList.contains('stock-section')){el.open=true;requestAnimationFrame(()=>el.scrollIntoView({block:'start'}));}}
document.querySelectorAll('a[href^="#stock-"]').forEach(a=>a.addEventListener('click',()=>reveal(a.hash)));
window.addEventListener('hashchange',()=>reveal(location.hash));reveal(location.hash);
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){document.querySelectorAll('.rail nav a[href^="#"]').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}},{rootMargin:'-10% 0px -70% 0px'});
document.querySelectorAll('main>section').forEach(el=>observer.observe(el));
</script></body></html>`;
fs.writeFileSync(path.join(out,'index.html'),html);

const indexPath=path.join(root,'monthly-quarterly-trading-review/index.html');
let index=fs.readFileSync(indexPath,'utf8');
const card=`<a class="month-card active" href="./2026-09/"><div class="card-head"><h3>2026年9月</h3><span class="chip warn">阶段复盘</span></div><p>本次按指定08.15–09.30统计1.5个月：86笔、24只、含费闭环-3,365.51；已整合二次反思、关键案例与三类买点；完整分时图与全部成交保留。</p></a>`;
const oldCard=/<a\b[^>]*class="month-card[^\"]*"[^>]*><div class="card-head"><h3>2026年9月<\/h3>[\s\S]*?<\/a>/;
assert(oldCard.test(index),'September navigation card not found');
index=index.replace(oldCard,card);
fs.writeFileSync(indexPath,index);
console.log(JSON.stringify({trades:86,stocks:24,charts:charts.length,markers:86,closedRealized:totalPnl/100,fees:totalFees/100,models,maxHeld,reentries,rounds:rounds.length,initialOpen:important.size},null,2));
