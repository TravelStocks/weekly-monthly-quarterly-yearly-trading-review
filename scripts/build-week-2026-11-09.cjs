const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),folder='2026-11-09_2026-11-13',dir=path.join(root,folder),prior='2026-11-02_2026-11-06';
const {trades,source}=require(path.join(dir,'data/trades-partial.json')),quotes=require(path.join(dir,'data/closing-quotes.json'));
const opening=require(path.join(root,prior,'data/summary.json')).account;
assert.equal(opening.endingPosition,0);
const cents=n=>Math.round(n*100), money=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),signed=n=>(n>0?'+':'')+money(n),pct=n=>n.toFixed(2)+'%';
const days=[],closed=[],lots=new Map();let cash=cents(opening.endingEquity),previous=cash;
for(const date of [...new Set(trades.map(t=>t.date))]){
  const daily=trades.filter(t=>t.date===date);
  for(const t of daily){
    assert.equal(cents(t.price*t.qty),cents(t.amount));cash+=cents(t.net);assert.equal(cash,cents(t.cash));
    const lot=lots.get(t.code)||{name:t.name,qty:0,cost:0,proceeds:0,bought:0};
    if(t.side==='买入'){lot.qty+=t.qty;lot.bought+=t.qty;lot.cost-=cents(t.net);}else{lot.qty-=t.qty;lot.proceeds+=cents(t.net);assert(lot.qty>=0);}
    lots.set(t.code,lot);
    if(!lot.qty){closed.push({code:t.code,name:t.name,date,qty:lot.bought,cost:lot.cost/100,proceeds:lot.proceeds/100,pnl:(lot.proceeds-lot.cost)/100});lots.delete(t.code);}
  }
  const holdings=[...lots].map(([code,l])=>{const close=quotes.find(q=>q.code===code).closes[date];assert(close>0);const value=cents(l.qty*close);return {code,name:l.name,qty:l.qty,cost:l.cost/100,close,marketValue:value/100,pnl:(value-l.cost)/100};});
  const market=holdings.reduce((v,h)=>v+cents(h.marketValue),0), equity=cash+market;
  days.push({date,count:daily.length,cash:cash/100,holdings,marketValue:market/100,equity:equity/100,pnl:(equity-previous)/100,returnPct:(equity/previous-1)*100,position:market/equity*100});previous=equity;
}
const thu=days.at(-1), snapshot=require(path.join(dir,'data/friday-snapshot.json')),date=snapshot.date;
assert.equal(thu.cash,4414.13);assert.equal(snapshot.equity,snapshot.cash+snapshot.marketValue);
assert.deepEqual(Object.keys(snapshot.clearedPnl).sort(),[...lots.keys()].sort());
for(const [code,pnl] of Object.entries(snapshot.clearedPnl)){
  const l=lots.get(code);
  closed.push({code,name:l.name,date,qty:l.qty,cost:l.cost/100,pnl,proceeds:(l.cost+cents(pnl))/100,source:'清仓截图盈亏；净回款按成本加盈亏推算'});
}
assert.equal(closed.filter(t=>t.date===date).reduce((s,t)=>s+cents(t.pnl),0),cents(snapshot.displayedPositionPnl));
assert.equal(cash+closed.filter(t=>t.date===date).reduce((s,t)=>s+cents(t.proceeds),0),cents(snapshot.cash));
days.push({date,count:null,cash:snapshot.cash,holdings:[],marketValue:0,equity:snapshot.equity,pnl:(cents(snapshot.equity)-previous)/100,returnPct:(snapshot.equity/thu.equity-1)*100,position:0});
const end=days.at(-1),pnl=(cents(end.equity)-cents(opening.endingEquity))/100,closedPnl=closed.reduce((s,t)=>s+cents(t.pnl),0)/100;
assert.equal(cents(pnl),cents(closedPnl));assert.equal(cents(pnl),days.reduce((s,t)=>s+cents(t.pnl),0));
const account={opening:{equity:opening.endingEquity},days,pnl,returnPct:pnl/opening.endingEquity*100,endingEquity:end.equity,averagePosition:days.reduce((s,d)=>s+d.position,0)/days.length,coveredThrough:end.date,weeklyReturnPct:pnl/opening.endingEquity*100,endingPosition:0,equityStatus:"期末资产截图",basis:"周五期末资产截图与周四交割收盘估值对照，假设无额外出入金。"};
const summary={date:trades[0].date,status:'account-complete-fills-partial',reason:'全周账户已核算；周五清仓已确认，逐笔卖价、时间及笔数未提供。',tradeCount:null,itemizedTradeCount:trades.length,closed,closedPnl,account};
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s),read=f=>fs.readFileSync(path.join(root,f),'utf8');
write(folder+'/data/summary.json',JSON.stringify(summary,null,2)+'\n');
const table=(hs,rows)=>'<div class="table-wrap"><table><thead><tr>'+hs.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const tone=n=>n>0?'is-profit':n<0?'is-loss':'',color=n=>'<b class="'+tone(n)+'">'+signed(n)+'</b>';
const metrics=[['全周账户收益',signed(pnl),tone(pnl)],['周收益率',signed(account.returnPct)+'%',tone(pnl)],['期末权益（截图）',money(end.equity),''],['五日平均日末仓位',pct(account.averagePosition),''],['六轮闭环合计',signed(closedPnl),tone(closedPnl)],['期末仓位',pct(end.position),'']];
const tiles=metrics.map(([k,v,c])=>'<span>'+k+' <b class="'+c+'">'+v+'</b></span>').join('');
const period='11.09–11.13',status='周五清仓 · 全周已核算',headline='前四日12笔逐笔交割；周五卖清4只股票，无买入。';
const chapters=[
 ['daily-account','每日账户与仓位', '<p>期初现金及权益均为'+money(opening.endingEquity)+'元，持仓为零。按发生金额滚动现金、持仓数量乘当日收盘价估值，假设无出入金或漏单。周五截图的“当日盈亏”为0；本表按相邻日末权益计算，9,984.32－10,195.13＝-210.81元（-2.07%）。</p>'+table(['日期','笔数','现金','持仓市值','权益（估）','日收益（估）','日收益率','日末仓位'],days.map((d,i)=>[d.date.slice(5)+' 周'+'一二三四五'[i],d.count??'清仓4只，笔数待补',money(d.cash),money(d.marketValue),money(d.equity),color(d.pnl),signed(d.returnPct)+'%',pct(d.position)]))],
 ['ticket-pnl','闭环交易与损益','<p>前两轮按交割发生金额，周五四轮按清仓截图的盈亏列示，周五净回款为成本加盈亏倒算，并非逐笔成交额。闽发周二卖清后，周三买回的100股是新仓，不与上一轮合并。</p>'+table(['标的','卖清日','闭环数量','含费成本','净回款','含费损益'],closed.map(t=>[t.name,t.date,t.qty,money(t.cost),money(t.proceeds),color(t.pnl)]))],
 ['holdings','周五期末持仓','<p>现金及总资产均为9,984.32元，股票市值为0，期末空仓。周四现金4,414.13元，加上清仓净回款5,570.19元，与截图余额一致。</p><p>四只清仓标的合计亏损570.83元是各自整轮结果，不是周五单日亏损。加上此前两轮盈利235.18元，全周合计亏损335.65元。</p>'],
 ['trade-records','逐笔交割（截至周四）',table(['日期','时间','证券','买卖','数量','成交价','成交额','含费发生金额','资金余额'],trades.map(t=>[t.date.slice(5),t.time,t.name+' '+t.code,t.side,t.qty,t.price.toFixed(3),money(t.amount),signed(t.net),money(t.cash)]))+'<p>'+source+'</p>'],
 ['reflection','个人反思与下周纪律','<p>待本人补充。闽发首轮闭环为盈利、周三另行开仓；当时为何进出、是否符合预案，不能只凭成交单判断。</p>'],
 ['pending','待补材料','<p>① 周五逐笔交割明细（如需标注实际卖点、时间和费用）。② 本周个人操作心得与希望复盘的买卖点。</p><p><a href="data/closing-quotes.json">前四日收盘价及来源</a> · <a href="data/summary.json">逐日核算</a></p>']
];
const css=read(prior+'/index.html').match(/<style>([\s\S]*?)<\/style>/)[1];
write(folder+'/index.html','<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+period+' 周度交割复盘</title><style>'+css+'.is-profit{color:#bc382b}.is-loss{color:#127759}.numbers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.numbers span{padding:8px;border-bottom:1px solid var(--line)}.numbers b{display:block;font-variant-numeric:tabular-nums}@media(max-width:650px){.numbers{grid-template-columns:1fr 1fr}}</style></head><body><div class="shell"><aside class="side"><h2>周度交割复盘</h2><a href="../weekly-trading-review/">返回周度归档</a><nav>'+chapters.map(([id,title])=>'<a href="#'+id+'">'+title+'</a>').join('')+'</nav></aside><main class="page"><header class="hero"><div><span class="eyebrow">TRADING REVIEW · 2026</span><h1>'+period+'<br>周度交割复盘</h1><p>'+headline+'</p><span class="status">'+status+'</span></div><div class="numbers">'+tiles+'</div></header>'+chapters.map(([id,title,body])=>'<section class="panel" id="'+id+'"><h2>'+title+'</h2>'+body+'</section>').join('')+'<footer><a href="../'+prior+'/">上一期：11.02–11.06</a></footer></main></div></body></html>');
require('./update-weekly-hub-chart.js');
const hubPath='weekly-trading-review/index.html',card='<a class="week-card latest-link" href="../'+folder+'/"><div class="week-head"><h3>'+period+'</h3><span class="chip">'+status+'</span></div><div class="mini-grid">'+tiles+'</div><p>'+headline+'资金曲线已按周五期末资产更新。</p></a>';
let hub=read(hubPath).replace(/<a class="week-card latest-link" href="\.\.\/2026-11-09_2026-11-13\/">[\s\S]*?<\/a>/,'').replace('class="week-card latest-link" href="../'+prior+'/','class="week-card" href="../'+prior+'/').replace('<div class="archive">','<div class="archive">'+card);
hub=hub.replace(/<section class="panel">\s*<span class="label">Latest Review<\/span>[\s\S]*?<\/section>/,'<section class="panel"><span class="label">Latest Review</span><h2>最新周：'+period+'</h2><p>'+headline+'全周收益'+signed(pnl)+'元，期末空仓。</p><a href="../'+folder+'/#daily-account">查看每日账户与仓位</a></section>').replace('../'+prior+'/">进入最新周复盘','../'+folder+'/">进入最新周复盘').replace(/最新一期2026\.[^<]+/,'最新一期2026.'+period+'：'+headline+status+'。').replace(/(<span>最新资料状态<\/span>)<strong[^>]*>[^<]*<\/strong><small>[^<]*<\/small>/,'$1<strong>全周账户已核算</strong><small>周五清仓</small>');
write(hubPath,hub);
write('index.html',read('index.html').replace('./'+prior+'/">最新周复盘','./'+folder+'/">最新周复盘').replace(/最新一期11\.(02|09)至11\.(06|13)：[^<]+/,'最新一期11.09至11.13：'+headline+status+'。').replace('周报 <b>25 篇','周报 <b>26 篇').replace('最新 <b>11.02-11.06','最新 <b>11.09-11.13').replace('状态 <b>前四日交割已补','状态 <b>全周账户已核算'));
