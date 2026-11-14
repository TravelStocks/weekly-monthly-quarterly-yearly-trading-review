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
const period='11.09–11.13',status='周五清仓 · 全周已核算',headline='前四日12笔逐笔交割；周五卖清4只股票，无买入。周五大分歧选择空仓。二次反思：减少切换、练主升龙回封、提前筛龙二波。周一只观察北纬科技能否带动板块。';
const keyRules=[["切换默认不做，试错最多半成仓","切换不是我的优势。没有成熟模式就不做；真要试，最多用账户的5%。这个上限只管切换，不把抱团仓加仓算进去。"],["没定龙别抢，定龙后回封别慢","同身位PK未结束就等。定龙后，分歧回流符合预案就按盘口执行：连续进攻大单达到剩余压单的1/4只是准备；题材回流、量能达标、进攻压过抛压，才是触发。闽发的教训是看对了日子，却等到回封后才排。"],["龙二波提前筛，首次突破才是买点","每天筛曾走出三连板及以上的票，也看走过一波的趋势龙。提前标平台上沿、前高，观察断板后是否主动反包。首次主动突破新高是我的买点，不再创新高是卖点；错过不补追。抱团单只约一成，仍看组合总仓位。"]];
const keySection='<section id="priority-rules" aria-labelledby="priority-title"><h2 id="priority-title">三件要改的事</h2><ol>'+keyRules.map(([title,note],i)=>'<li><span class="rule-no">0'+(i+1)+'</span><h3>'+title+'</h3><p>'+note+'</p></li>').join('')+'</ol><a href="https://travelstocks.github.io/daily-trading-workbench/#priority-rules">总交易手册 · 盘前纪律</a></section>';
const keyCss='.week-title{margin:0 0 8px;font-size:22px}.page #priority-rules{padding:18px 0 24px;border-top:4px solid #ad3428}.page #priority-title{color:#7c241c;font-size:52px;line-height:1.12;margin:0 0 18px}.page #priority-rules ol{list-style:none;padding:0;margin:0 0 14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.page #priority-rules li{border-top:2px solid #b7c5ca;padding:10px 0}.rule-no{font-weight:800;color:#a33325}.page #priority-rules h3{font-size:28px;line-height:1.3;margin:5px 0}.page #priority-rules p{margin:8px 0;line-height:1.65}@media(max-width:800px){.page #priority-title{font-size:38px}.page #priority-rules ol{grid-template-columns:1fr;gap:4px}.page #priority-rules h3{font-size:24px}}';
const chapters=[
 ['second-review','本周二次反思',`<p><strong>这一周最值得保留的是周五清仓后没有再买；最该改的不是周五卖出，而是周四为什么要切换。</strong>相比上周的−12.55%，我认可本周把亏损收窄了。我的5%上限指整周亏损，不是从周内高点计算。本周亏损3.25%，达标。</p>
 <h3>回看五天：哪一步开始把利润还回去？</h3><p>周一才参与闽发铝业，周二卖清，首轮含费赚218.92元（按成本约+2.21%）。周三分仓做抱团，四只合计日末仓位40.22%，当天账户赚57.98元。我看重的是组合的综合溢价，不要求每只都涨，也不能从一天盈利推断分仓就一定有效。周四我判断抱团开始瓦解，却新开日海智能做切换，同时加仓原有的浙文影业抱团仓，收盘仓位升到56.70%；周五清掉四只、不再开新仓，才把敞口降到零。</p>
 <p><strong>账户核对：</strong>全周−335.65元（−3.25%）；周五单日−210.81元（−2.07%）。按日末权益，周三10,596.87元到周五9,984.32元回落612.55元，周内最大收盘回撤为5.78%。这个高点回落指标不用于判断本周是否守住5%上限，也不代表盘中最大回撤。日海智能周四新开、周五清掉，整轮−355.95元，约占期初权益3.45%；周四至周五的其余变动不能一并归给这笔交易。</p>
 <h3 id="ideal-week">理想节奏：周四兑现，周五空仓</h3>
 <p>这是我事后回看的节奏，不是实际交割，不计算假设收益。</p><ol>
 <li><strong>周一：</strong>持有闽发铝业。</li>
 <li><strong>周二：</strong>卖出闽发铝业，兑现这笔龙头接力的溢价。</li>
 <li><strong>周三：</strong>买入襄阳轴承，做我熟悉的龙二波突破。</li>
 <li><strong>周四：</strong>襄阳轴承炸板时卖出；大业股份、福莱新材也在这一天兑现，不再做切换。</li>
 <li><strong>周五：</strong>全天空仓。理想节奏是周四就把仓位收回来，而不是等到周五再清仓。</li></ol>
 <p><strong>下周只精进两种模式：</strong>主升二阶段龙头的分歧回流、龙头二波的首次突破。盘前写超预期、符合预期、不及预期三个剧本。事后设想的周收益+10%至+15%，以及“上周五排到，周一就可能多赚”的推演，都不是实际收益，也不当成下周目标。</p>`],
 ['daily-account','每日账户与仓位', '<p>期初现金及权益均为'+money(opening.endingEquity)+'元，持仓为零。按发生金额滚动现金、持仓数量乘当日收盘价估值，假设无出入金或漏单。周五截图的“当日盈亏”为0；本表按相邻日末权益计算，9,984.32－10,195.13＝-210.81元（-2.07%）。</p>'+table(['日期','笔数','现金','持仓市值','权益（估）','日收益（估）','日收益率','日末仓位'],days.map((d,i)=>[d.date.slice(5)+' 周'+'一二三四五'[i],d.count??'清仓4只，笔数待补',money(d.cash),money(d.marketValue),money(d.equity),color(d.pnl),signed(d.returnPct)+'%',pct(d.position)]))],
 ['ticket-pnl','闭环交易与损益','<p>前两轮按交割发生金额，周五四轮按清仓截图的盈亏列示，周五净回款为成本加盈亏倒算，并非逐笔成交额。闽发周二卖清后，周三买回的100股是新仓，不与上一轮合并。</p>'+table(['标的','卖清日','闭环数量','含费成本','净回款','含费损益'],closed.map(t=>[t.name,t.date,t.qty,money(t.cost),money(t.proceeds),color(t.pnl)]))],
 ['holdings','周五期末持仓','<p>现金及总资产均为9,984.32元，股票市值为0，期末空仓。周四现金4,414.13元，加上清仓净回款5,570.19元，与截图余额一致。</p><p>四只清仓标的合计亏损570.83元是各自整轮结果，不是周五单日亏损。加上此前两轮盈利235.18元，全周合计亏损335.65元。</p>'],
 ['trade-records','逐笔交割（截至周四）',table(['日期','时间','证券','买卖','数量','成交价','成交额','含费发生金额','资金余额'],trades.map(t=>[t.date.slice(5),t.time,t.name+' '+t.code,t.side,t.qty,t.price.toFixed(3),money(t.amount),signed(t.net),money(t.cash)]))+'<p>'+source+'</p>'],
 ['charts','五分钟K线与买卖点',require('./nov13-five-minute.cjs')(snapshot)],
 ['reflection','周五操作与反思',`<p><strong>今天做对的，是清仓之后没有再买。</strong>在我看来，这是旧周期集中出清的大分歧日。新华传媒的负反馈传到了其他老票。盘中虽然看过襄阳轴承，但看不到企稳迹象，最后没有买。空仓是我的判断，不是没找到股票才被动空下来。</p>`+
 table(['周五清仓','我的卖点复盘'],[
  ['闽发铝业','这次卖的是周三买回的第二轮仓位。价格往跌停方向下冲时，我迟了一步才卖。问题在卖点偏晚，不在清仓本身。'],
  ['浙文影业','盘中稍有冲高就卖了。按当时的大分歧判断，我认可这个时机。'],
  ['冰山冷热','做的是抱团龙二波突破。突破没走出来，跌破均线、回到五日线附近才卖。按我的盘中回忆，当时已跌约六个点；方向没错，但退出偏晚。'],
  ['日海智能','把仓位清掉，我认可这个决定。没有记录更具体的分时卖出信号。']
 ])+'<p>以上是个人口述，不是周五逐笔成交记录。新华传媒已在周四卖出，周五只作为情绪观察。</p>'],
 ['leader-setups','龙头走势及买点',`<p><strong>我这周看到的赚钱效应是龙二波。</strong>之前我盯首波接力多，留给断板之后怎么走的注意力少了。二波不是只有横盘几天再突破这一种，复盘时我要把两种走势分开。</p>
 <h3>平台突破：看突破当天，不以后来的上涨补买点</h3><p>福莱新材看平台突破；襄阳轴承看突破后拉回、重新转强那一下，随后冲板是我复盘里可以兑现的位置，不是实际卖单。冰山冷热的高开、T字换手，是我认为值得研究的强势买点；但我自己做的那笔突破没走出来，回到五日线附近才退出。看对一类机会，不等于自己的入场时机就对了。大业股份也作为突破日的对照案例。</p>
 <h3>断板反包：不一定要等平台形成</h3><p>东方海洋值得看的是断板后很快反包：首波虽然断了，但当时市场还有往上打连板高度的空间。要研究的是它能否主动收复断板时失去的位置、把强势延续下去，而不是把任何断板反弹都叫二波。国芳集团作为相似走法的对照。</p>
 <p><strong>下单前问自己：</strong>我看到的是它第一次主动突破，还是它已经涨了一段，我才开始相信？越晚参与，承担的回落风险越大。错过不补追，也不为了接上下一笔硬做切换。以上是机会复盘，不新增成交或假设收益。</p>`],
 ['market-anchor','情绪锚：先看谁变，再看谁跟',`<p><strong>11月13日，我把新华传媒当作旧周期的情绪锚，而不是当天要交易的票。</strong>它已在周四卖清。周五新华传媒收于13.11元、跌停；我在盘中把监管压力理解为“接续监管”。<a href="https://cgws.com/cczq/sygg/202611/t20261113_328033.html">当日交易风险提示</a>可核对，具体延长期限不据此认定。</p><p>我观察到的次序是：新华传媒跌停，随后其他高标也被砸到深水，部分跌停。值得警惕的不是一只传媒股跌了，而是不同题材的高标也失去承接。此前抱团顺利时恰好相反：一只高标率先走强，其他核心跟上；第一只出现分歧，仍有别的核心顶住。这两种反馈说明，部分高标到这一阶段，价格已不只反映原题材，还反映市场愿不愿意继续持有高标。</p><p><strong>每天问：</strong>锚先发生了什么？是同板块在动，还是跨题材的高标也在同向变化？第一次分歧后，谁还能站住？只有锚在跌，不把它说成集体退潮；只有锚在涨，也不认作抱团修复。传导是我的盘面判断，不把同时下跌当成单一因果。</p>`],
 ['second-wave-pool','龙头二波 · 每日观察池',`<p><strong>收盘把三板及以上的断板股单独列出，入池不等于入场。</strong>逐只记下首波高度、断板日，以及它在题材或市场中的地位。</p><p><strong>平台突破：</strong>先标平台上下沿和前高。平台未破就观察；跌破下沿则移出，不因曾经是龙头继续留。向上突破时，只有原有核心地位仍在、走势是它自己带出来的，才符合我的入场预案。</p><p><strong>断板反包：</strong>不要求先横出平台。东方海洋是复盘样本：跟踪它断板后能否主动收复失地，以及同梯队是跟它还是带它。被动跟涨不算主动反包。</p><p><a href="https://travelstocks.github.io/daily-trading-workbench/#second-wave-pool">打开总手册的每日观察名单</a></p>`],
 ['monday-plan','周一北纬科技竞价预案',`<p><strong>11月16日只验证一件事：北纬科技是先转强、把同题材带起来，还是只冲了自己？没有板块跟随，继续空仓。</strong>竞价按周五大分歧后的修复预期判断强弱；开盘后再看谁先动、谁跟随、第一次回落时谁还守得住。九阳股份只观察旧周期反馈，不是第二个交易计划。</p>`+
 table(['竞价情形','开盘后看什么','我的应对'],[
  ['超预期：北纬明显强开，竞价临近结束仍维持强势。','北纬率先上攻后，同题材前排是否应声走强，随后有更多个股跟上？第一次分歧时，前排能否稳住，北纬能否再带动回流？','有跟随且能延续，才按原预案评估参与。哪怕北纬快速封板，板块没动，也继续空仓。'],
  ['符合预期：北纬平稳开出，有修复，但尚未表现出领涨。','先等第一次有承接的上攻。若北纬先动、前排随后转强，再比较回落后的强弱；若别人先拉、北纬才跟，它是跟随者。','竞价不抢。看清“北纬先动、板块跟上”再评估；先后分不清，或跟随只维持一瞬，就空仓。'],
  ['不及预期：北纬竞价走弱，或原有强度临近开盘消失。','开盘反抽时，题材是否仍然分散？只有北纬自己拉一下，或它被其他强票带起，都不能验证它是新周期龙头。','原计划不触发，不抄底、不换后排；继续空仓。']
 ])+'<p><strong>盘后复核：</strong>分别记下北纬第一次主动上攻、同题材前排开始响应、第一次分歧后的表现。只有第一个时点，最多说明个股强；三个时点都有证据，才保留“可能开启新周期”的判断。</p>'],
 ['pending','待补材料','<p>周五个人复盘和本周二次反思均已补。周五卖单的准确时间、价格、笔数和费用仍待逐笔交割核实；当前四只清仓标的不等于四笔卖单。</p><p>归因已确认：日海智能计入切换；浙文影业属于原抱团仓加仓，其整轮损益不计入切换。周五逐笔卖单由本人后补。</p><p><a href="data/closing-quotes.json">前四日收盘价及来源</a> · <a href="data/summary.json">逐日核算</a></p>']
];
const css=read(prior+'/index.html').match(/<style>([\s\S]*?)<\/style>/)[1];
write(folder+'/index.html','<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+period+' 周度交割复盘</title><style>'+css+keyCss+'.is-profit{color:#bc382b}.is-loss{color:#127759}.numbers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.numbers span{padding:8px;border-bottom:1px solid var(--line)}.numbers b{display:block;font-variant-numeric:tabular-nums}@media(max-width:650px){.numbers{grid-template-columns:1fr 1fr}}</style></head><body><div class="shell"><aside class="side"><h2>周度交割复盘</h2><a href="../weekly-trading-review/">返回周度归档</a><nav><a href="#priority-rules">三件要改的事</a>'+chapters.map(([id,title])=>'<a href="#'+id+'">'+title+'</a>').join('')+'</nav></aside><main class="page"><h1 class="week-title">'+period+' 周度交割复盘</h1>'+keySection+'<header class="hero"><div><span class="eyebrow">TRADING REVIEW · 2026</span><h2>本周账户</h2><p>'+headline+'</p><span class="status">'+status+'</span></div><div class="numbers">'+tiles+'</div></header>'+chapters.map(([id,title,body])=>'<section class="panel" id="'+id+'"><h2>'+title+'</h2>'+body+'</section>').join('')+'<footer><a href="../'+prior+'/">上一期：11.02–11.06</a></footer></main></div></body></html>');
require('./update-weekly-hub-chart.js');
const hubPath='weekly-trading-review/index.html',card='<a class="week-card latest-link" href="../'+folder+'/"><div class="week-head"><h3>'+period+'</h3><span class="chip">'+status+'</span></div><div class="mini-grid">'+tiles+'</div><p>'+headline+'资金曲线已按周五期末资产更新。</p></a>';
let hub=read(hubPath).replace(/<a class="week-card latest-link" href="\.\.\/2026-11-09_2026-11-13\/">[\s\S]*?<\/a>/,'').replace('class="week-card latest-link" href="../'+prior+'/','class="week-card" href="../'+prior+'/').replace('<div class="archive">','<div class="archive">'+card);
hub=hub.replace(/<section class="panel">\s*<span class="label">Latest Review<\/span>[\s\S]*?<\/section>/,'<section class="panel"><span class="label">Latest Review</span><h2>最新周：'+period+'</h2><p>'+headline+'全周收益'+signed(pnl)+'元，期末空仓。</p><a href="../'+folder+'/#daily-account">查看每日账户与仓位</a></section>').replace('../'+prior+'/">进入最新周复盘','../'+folder+'/">进入最新周复盘').replace(/最新一期2026\.[^<]+/,'最新一期2026.'+period+'：'+headline+status+'。').replace(/(<span>最新资料状态<\/span>)<strong[^>]*>[^<]*<\/strong><small>[^<]*<\/small>/,'$1<strong>全周账户已核算</strong><small>周五清仓</small>');
write(hubPath,hub);
write('index.html',read('index.html').replace('./'+prior+'/">最新周复盘','./'+folder+'/">最新周复盘').replace(/最新一期11\.(02|09)至11\.(06|13)：[^<]+/,'最新一期11.09至11.13：'+headline+status+'。').replace('周报 <b>25 篇','周报 <b>26 篇').replace('最新 <b>11.02-11.06','最新 <b>11.09-11.13').replace('状态 <b>前四日交割已补','状态 <b>全周账户已核算'));
