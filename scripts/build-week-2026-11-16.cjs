const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),folder='2026-11-16_2026-11-20',prior='2026-11-09_2026-11-13',dir=path.join(root,folder);
const {trades,snapshot}=require(path.join(dir,'data/input.json'));
const opening=require(path.join(root,prior,'data/summary.json')).account.endingEquity;
const cents=n=>Math.round(n*100),money=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),signed=n=>(n>0?'+':'')+money(n);
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),write=(f,s)=>fs.writeFileSync(path.join(root,f),s);
const histories=Object.fromEntries(['002148','002685'].map(c=>[c,require(path.join(dir,'data/'+c+'-5m.json'))]));
let cash=cents(opening),previous=cash,held=null;const days=[];
for(const date of ['2026-11-16','2026-11-17','2026-11-18','2026-11-19']){
 const ts=trades.filter(t=>t.date===date);
 for(const t of ts){assert.equal(cents(t.price*t.qty),cents(t.amount));cash+=cents(t.net);assert.equal(cash,cents(t.cash));held=t.side==='买入'?t:null;}
 const close=held?histories[held.code].bars.find(b=>b.day===date+' 15:00:00')?.close:null;
 assert(!held||close>0);const value=held?cents(held.qty*close):0,equity=cash+value;
 days.push({date,count:ts.length,cash:cash/100,held:held?{code:held.code,name:held.name,qty:held.qty,close}:null,marketValue:value/100,equity:equity/100,pnl:(equity-previous)/100,returnPct:(equity/previous-1)*100,position:value/equity*100,finalized:true});previous=equity;
}
assert.equal(cash,39483);
const friday=trades.filter(t=>t.date===snapshot.date),gross=friday.reduce((s,t)=>{assert.equal(cents(t.price*t.qty),cents(t.amount));return s+cents(t.amount)},0);
assert.equal(friday.reduce((s,t)=>s+t.qty,0),1100);assert.equal(gross,808800);
const impliedNet=cents(snapshot.totalAssets)-cash,huadongPnl=(impliedNet-892600)/100,sellCosts=(gross-impliedNet)/100;
assert.equal(sellCosts,24.05);assert.equal((gross-cents(days.at(-1).marketValue))/100,snapshot.displayedPnl);
assert.equal(huadongPnl,snapshot.clearedPnl);
days.push({date:snapshot.date,count:friday.length,cash:snapshot.totalAssets,held:null,marketValue:0,equity:snapshot.totalAssets,pnl:(cents(snapshot.totalAssets)-previous)/100,returnPct:(snapshot.totalAssets/(previous/100)-1)*100,position:0,finalized:true,basis:'本人确认以清仓资产作为周终稿；非收盘采集，按周五后续无资产变动'});
const pnl=(cents(snapshot.totalAssets)-cents(opening))/100,rate=pnl/opening*100;
const closed=[{code:'002148',name:'北纬科技',qty:1100,cost:9630,net:8966.51,pnl:-663.49,source:'买卖交割已核实'},{code:'002685',name:'华东重机',qty:1100,cost:8926,net:impliedNet/100,pnl:huadongPnl,source:'四笔成交已核；总费用24.05元按总资产衔接，未分摊逐笔费用'}];
assert.equal(cents(pnl),closed.reduce((s,c)=>s+cents(c.pnl),0));assert.equal(cents(pnl),days.reduce((s,d)=>s+cents(d.pnl),0));
const account={opening:{equity:opening},days,pnl,returnPct:rate,weeklyReturnPct:rate,endingEquity:snapshot.totalAssets,endingPosition:0,averagePosition:days.reduce((s,d)=>s+d.position,0)/days.length,coveredThrough:snapshot.date,equityStatus:'本人确认终稿资产',basis:'本人确认周终稿，无额外出入金且清仓后无资产变动。周五四笔卖出8088元、净回款8063.95元；费用24.05元由资产衔接得出。可用金额差1元保留原截图口径。'};
write(folder+'/data/summary.json',JSON.stringify({date:snapshot.date,status:'complete',reason:'本人确认终稿；全周7笔成交已补齐，周五卖出费用按总资产衔接，个人二次反思已补充。',tradeCount:trades.length,itemizedTradeCount:trades.length,fridaySettlement:{gross:gross/100,net:impliedNet/100,costs:sellCosts,costBasis:'总资产衔接所得总费用，非逐笔费税明细'},closed,closedPnl:pnl,account},null,2)+'\n');
// Reconcile last week's newly supplied fills before updating the shared archive.
require('./build-week-2026-11-09.cjs');
const table=(heads,rows)=>'<div class="table-wrap"><table><thead><tr>'+heads.map(s=>'<th>'+s+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(s=>'<td>'+s+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const metric=[['全周收益',signed(pnl)],['全周收益率',signed(rate)+'%'],['期末总资产',money(snapshot.totalAssets)],['已核逐笔成交','7 笔'],['周五状态','09:39:10 已清仓'],['五日日末平均仓位',account.averagePosition.toFixed(2)+'%']];
const tone=n=>n<0?'is-loss':n>0?'is-profit':'';
const color=(n,suffix='')=>'<b class="'+tone(n)+'">'+signed(n)+suffix+'</b>';
const tiles=metric.map(([k,v],i)=>'<span>'+k+'<b class="'+(i<2?tone(pnl):'')+'">'+v+'</b></span>').join('');
const analysis=require('./nov20-trade-analysis.cjs')({table,color});
const headline='周一买入北纬科技，周二卖清；周三空仓；周四买华东重机，周五09:39:10清仓。本人补充确认：买前有强题材与唯一性龙头信号，卖出因不及预期；周四急于扳回亏损，导致纪律与仓位失控。最重要错误仍是周亏超5%后仍近满仓开新仓；整周亏损达到5%即停止本周开新仓。';
const sections=[
 ['preflight','下周盘前必问自己的三个问题',analysis.preflight],
 ['focus','本周最重要的错误',analysis.confirmed],
 ['second-review','二次反思：弱天时、左侧买点与仓位',require('./nov20-second-review.cjs')({table,color})],
 ['trade-analysis','两笔交易：买点、卖点与仓位',analysis.details],
 ['scope','数据口径与差异','<p>复盘区间为11月16日至20日；查询截图中的11月12、13日属于上一周，已回填，不重复计算。11月20日四笔卖单已补齐，按本人确认将清仓后的总资产作为本周终稿；不将原账户截图冒称收盘采集。五分钟行情仅覆盖至10:05，完整覆盖四笔卖出时段。本人二次反思已纳入；题材节奏、冰点计数和模式归因明确标为本人观察，成交事实独立核对。</p>'+table(['核对项','结果'],[['可用金额与总资产','8,457.78 与 8,458.78，相差1.00元，依本人终稿确认使用总资产8,458.78元，保留原始字段差异。'],['周五当日盈亏','四笔卖出8,088元减周四持仓市值8,437元，恰为截图-349.00元；再扣资产衔接所得卖出费用24.05元，含费日收益-373.05元（-4.22%）。费用未展示逐笔，不擅自分配。'],['资金余额与冻结数量','快照394.83元及冻结1100股与本人确认卖清未同步；不凭此恢复持仓。'],['截图7.490','是市价。实际四笔卖出为7.40、7.31、7.33、7.31元，加权均价7.3527元，不能以7.490替代。'],['出入金','按两周交割现金连续衔接，暂假设无额外出入金；若存在须重算。']])],
 ['daily-account','每日账户与仓位',table(['日期','成交','现金','持仓/估值价','权益','日收益','日收益率','仓位'],days.map((d,i)=>[d.date+' 周'+'一二三四五'[i]+(!d.finalized?'（盘中）':''),d.count===null?'清仓已确认，笔数待补':d.count+'笔',d.cash===null?'余额字段待同步':money(d.cash),d.held?d.held.name+' '+d.held.qty+'股 × '+d.held.close.toFixed(2):'空仓',money(d.equity),color(d.pnl),color(d.returnPct,'%'),d.position.toFixed(2)+'%']))+'<p>前四日收盘价来自下方五分钟行情的15:00收盘。按本人确认，周五清仓资产用于周终稿，日末仓位记0%，五日日末仓位简单平均；不是盘中平均持仓。周三零收益建立在无遗漏交易、无出入金且周二已清仓的前提下。</p>'],
 ['ticket-pnl','本周持有/闭环票：赚钱与亏损主因',table(['标的','状态','含费投入','净回款','整轮损益','证据'],closed.map(c=>[c.name,'已卖清',money(c.cost),money(c.net),color(c.pnl),c.source]))+'<h3>北纬科技：<span class="is-loss">-663.49元</span></h3><p>交割事实：8.75元买1100股，次日8.16元卖清。价差亏649.00元，费用14.49元。含费买入约占期初资产96.45%。本人确认买前启动题材强、四板唯一性成立；后续回流没有兑现，开盘严重不及本人预期而决定退出。不能因亏损倒推选股必错；弱天时近满仓与参与时点分别检验。实际开8.58元、尾盘卖出，判断到成交的过程仍待核。</p><h3>华东重机：<span class="is-loss">-862.05元</span></h3><p>周四8.11元买1100股；周五09:36:02至09:39:10分四笔卖清，成交额8,088元。按总资产衔接，净回款8,063.95元、卖出费用24.05元；价差亏833元，加上买入5元及卖出24.05元，整轮亏862.05元。本人确认买前有龙头信号，但急于快速扳回亏损，使仓位、买点与个股选择的执行失控；周亏越线仍近满仓开仓是首要错误。次日深水开不及预期，反弹后分批退出。当前损失占两轮合计约56.51%，是本周较大亏损贡献。</p>'],
 ['charts','五分钟K线与买卖点',require('./nov20-five-minute.cjs')()],
 ['trades','已核逐笔交割',table(['日期','时间','证券','买卖','数量','成交价','成交额','手续费','印花税','含费发生额','资金余额'],trades.map(t=>[t.date,t.time,t.name+' '+t.code,t.side,t.qty,t.price.toFixed(3),money(t.amount),t.fee===null?'未列':money(t.fee),t.tax===null?'未列':money(t.tax),t.net===null?'见合计':signed(t.net),t.cash===null?'未列':money(t.cash)]))+'<p>全周7笔：买入成交额18,546.00元，卖出17,064.00元，含费合计亏损1,525.54元。前3笔已知费用19.49元，加周五按资产衔接所得24.05元，总费用43.54元；周五每笔费用、税金及现金余额未展示，不作猜填。订单与合同编号不公开。</p>'],
 ['kiss','每日操作与尚待核对细节',table(['日期','已知动作','本人判断与尚待核对细节'],[['周一11-16','北纬科技买入1100股','本人确认强题材与四板唯一性信号；分歧切核心参与，买前跟随时点仍待核。'],['周二11-17','14:56:47卖清北纬科技','退出理由已确认：开盘严重不及预期；实际尾盘卖出，判断到成交的过程仍待核。'],['周三11-18','无可见成交，按记录空仓','当天观察与空仓原因待补。'],['周四11-19','09:30买入华东重机1100股','本人确认有龙头信号，也有急于扳回亏损的心态，导致仓位、买点与个股选择的执行失控；委托细节仍可补。'],['周五11-20','09:36:02至09:39:10分四笔清仓','退出理由已确认：深水开严重不及预期；具体分批安排及触发到成交的过程待补。']])+'<p>心理动机已由本人补充：周四想快速扳回亏损，不再写成待确认，也不外推为周一同样的动机。Keep / Improve / Stop已同步到二次反思。</p>'],
 ['rules','现行规则复核','<p>整周亏损上限5%以期初权益为基准，不按周内高点回撤。本周亏损15.28%，已超出这一上限。现明确：整周亏损达到5%就停止本周开新仓，不用下一笔重仓回本；弱天时三成及以下仅适用于未触发此禁令时。</p><p>模式优先级与二波卖点沿用总手册，不把未知交易强行贴模式标签；平台突破/反包是观察路径，不自动确认题材二波。<a href="https://travelstocks.github.io/daily-trading-workbench/#leader-modes">回看总交易手册</a></p>'],
 ['pending','终稿与后续反思','<p>已按本人要求完成交割终稿，周五四笔卖点已全部入图，不再等待卖单或收盘截图才能归档。买卖理由和二次反思已补齐。后续只需进一步核对原定止损条件、买前板块跟随及实际触发时点；逐笔费税若有新增明细可再核对。</p><p>无需重发11月13日四笔卖单，已录入上一周并补齐图上的卖点。后续补充会覆盖本周同一条归档及曲线，不新增重复周。</p><p><a href="data/summary.json">本周计算结果</a> · <a href="data/input.json">脱敏输入与差异</a></p>']
];
const css=read(prior+'/index.html').match(/<style>([\s\S]*?)<\/style>/)[1];
const extra='.is-loss{color:#127759}.is-profit{color:#bc382b}.hero h1{font-size:30px;line-height:1.3}.page #focus,.page #preflight{border-top:4px solid #a33325}.page #focus h2,.page #preflight h2{font-size:36px}.preflight-list{padding-left:28px;margin:22px 0}.preflight-list li{padding:14px 0;border-top:1px solid #dce4e9}.preflight-list li::marker{font-size:24px;font-weight:700;color:#7c241c}.page .preflight-list h3{font-size:25px;line-height:1.45;margin:0 0 10px;color:#7c241c}.critical-rule{font-size:28px;line-height:1.4;color:#7c241c}@media(max-width:650px){.page #focus h2,.page #preflight h2{font-size:28px}.page .preflight-list h3{font-size:22px}.critical-rule{font-size:24px}}.page #focus li{margin:18px 0}.numbers{min-width:0}.numbers span{overflow-wrap:anywhere}.chart-scroll{overflow-x:auto}.chart-scroll svg{min-width:760px}.panel{min-width:0}.table-wrap{overflow-x:auto}';
const renderSection=([id,t,b])=>'<section class="panel" id="'+id+'"><h2>'+t+'</h2>'+b+'</section>';
write(folder+'/index.html','<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>11.16–11.20 周度交割复盘</title><style>'+css+extra+'</style></head><body><div class="shell"><aside class="side"><h2>周度交割复盘</h2><a href="../weekly-trading-review/">返回周度归档</a><nav>'+sections.map(([id,t])=>'<a href="#'+id+'">'+t+'</a>').join('')+'</nav></aside><main class="page">'+renderSection(sections[0])+'<header class="hero"><div><span class="eyebrow">2026 · 交割终稿</span><h1>11.16–11.20 交割复盘</h1><p>'+headline+'</p><span class="status">终稿 · 全周7笔成交 · 期末空仓</span></div><div class="numbers">'+tiles+'</div></header>'+sections.slice(1).map(renderSection).join('')+'<footer><a href="../'+prior+'/">上一周11.09–11.13 · 卖单已补齐</a></footer></main></div></body></html>');
const card='<a class="week-card latest-link" href="../'+folder+'/"><div class="week-head"><h3>11.16–11.20</h3><span class="chip">交割终稿</span></div><div class="mini-grid">'+tiles+'</div><p>'+headline+'</p></a>';
let hub=read('weekly-trading-review/index.html').replace(new RegExp('<a class="week-card latest-link" href="../'+folder+'/">[\\s\\S]*?</a>','g'),'').replace('class="week-card latest-link" href="../'+prior+'/','class="week-card" href="../'+prior+'/').replace('<div class="archive">','<div class="archive">'+card);
hub=hub.replace(/<section class="panel">\s*<span class="label">Latest Review<\/span>[\s\S]*?<\/section>/,'<section class="panel"><span class="label">Latest Review</span><h2>最新周：11.16–11.20</h2><p>'+headline+'</p><a href="../'+folder+'/#daily-account">查看每日账户</a></section>').replace('../'+prior+'/">进入最新周复盘','../'+folder+'/">进入最新周复盘').replace(/最新一期2026\.[^<]+/,'最新一期2026.11.16–11.20：'+headline).replace(/(<span>最新资料状态<\/span>)<strong[^>]*>[^<]*<\/strong><small>[^<]*<\/small>/,'$1<strong>交割终稿</strong><small>全周7笔已核</small>');
write('weekly-trading-review/index.html',hub);
let home=read('index.html').replace('./'+prior+'/">最新周复盘','./'+folder+'/">最新周复盘').replace(/最新一期11\.(?:09至11\.13|16至11\.20)：[^<]+/,'最新一期11.16至11.20：'+headline).replace('周报 <b>26 篇','周报 <b>27 篇').replace('最新 <b>11.09-11.13','最新 <b>11.16-11.20').replace(/状态 <b>(?:全周账户已核算|周五盘中初稿)/,'状态 <b>交割终稿');
write('index.html',home);
console.log({opening,pnl,rate,end:snapshot.totalAssets,days:days.map(d=>d.pnl)});
