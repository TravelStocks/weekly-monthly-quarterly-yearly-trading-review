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
const impliedNet=cents(snapshot.totalAssets)-cash,huadongPnl=(impliedNet-892600)/100;
assert.equal(huadongPnl,snapshot.clearedPnl);
days.push({date:snapshot.date,count:null,cash:null,held:null,marketValue:0,equity:snapshot.totalAssets,pnl:(cents(snapshot.totalAssets)-previous)/100,returnPct:(snapshot.totalAssets/(previous/100)-1)*100,position:0,finalized:false,basis:'本人确认清仓；总资产快照，不是收盘'});
const pnl=(cents(snapshot.totalAssets)-cents(opening))/100,rate=pnl/opening*100;
const closed=[{code:'002148',name:'北纬科技',qty:1100,cost:9630,net:8966.51,pnl:-663.49,source:'买卖交割已核实'},{code:'002685',name:'华东重机',qty:1100,cost:8926,net:impliedNet/100,pnl:huadongPnl,source:'本人确认已卖清；截图盈亏与资产衔接，非逐笔成交'}];
assert.equal(cents(pnl),closed.reduce((s,c)=>s+cents(c.pnl),0));assert.equal(cents(pnl),days.reduce((s,d)=>s+cents(d.pnl),0));
const account={opening:{equity:opening},days,pnl,returnPct:rate,weeklyReturnPct:rate,endingEquity:snapshot.totalAssets,endingPosition:0,averagePosition:null,coveredThrough:snapshot.date,equityStatus:'11-20盘中截图，非收盘',basis:'无额外出入金假设；前四日按交割与实际收盘估值，周五按本人确认清仓及总资产截图。可用金额差1元、当日盈亏口径差24.05元待核。'};
write(folder+'/data/summary.json',JSON.stringify({date:snapshot.date,status:'partial-trades',reason:'盘中初稿：周五已清仓，逐笔卖单、收盘账户和个人反思待补。',tradeCount:null,itemizedTradeCount:3,closed,closedPnl:pnl,partialAccount:account},null,2)+'\n');
// Reconcile last week's newly supplied fills before updating the shared archive.
require('./build-week-2026-11-09.cjs');
const table=(heads,rows)=>'<div class="table-wrap"><table><thead><tr>'+heads.map(s=>'<th>'+s+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(s=>'<td>'+s+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const metric=[['区间收益（暂估）',signed(pnl)],['区间收益率（暂估）',signed(rate)+'%'],['周五盘中总资产',money(snapshot.totalAssets)],['已核逐笔成交','3 笔'],['周五状态','已清仓，卖单待补'],['全周平均仓位','待收盘核算']];
const tiles=metric.map(([k,v])=>'<span>'+k+'<b>'+v+'</b></span>').join('');
const headline='周一买入北纬科技，周二卖清；周三按已给记录为空仓；周四买入华东重机，周五已确认卖清。当前为盘中初稿，不是全周收盘。';
const sections=[
 ['focus','本周先核对三件事','<ol><li><strong>北纬科技是否按预案确认了板块跟随？</strong>上周预案是“没有板块跟随就空仓”。本周09:31:46买入属已知事实，但当时是否出现跟随、买入属于三种竞价预案中的哪一种，仍等本人复盘。</li><li><strong>整周亏损5%的纪律如何执行？</strong>周二卖清后区间已亏663.49元，约6.65%；周四又投入8,926元，约占当时现金的95.76%。这是风险暴露核对，不擅自推断买入动机或添加停手规则。</li><li><strong>华东重机属于哪一类龙头，退出依据是什么？</strong>模式优先级仍是唯一性主升二阶段龙头、题材主升二波的龙头二波、抱团龙。没有本人判断前，不把这笔自动归类为切换或二波。</li></ol>'],
 ['scope','数据口径与差异','<p>复盘区间为11月16日至20日；查询截图中的11月12、13日属于上一周，已回填，不重复计算。11月20日由本人确认已全部卖出；行情仅取到10:05，账户截图未给具体时刻，故保留盘中标记。个人反思尚未提供，以下问题与分析不冒充本人口述。</p>'+table(['核对项','结果'],[['可用金额与总资产','8,457.78 与 8,458.78，相差1.00元，暂按总资产核算。'],['周五当日盈亏','截图-349.00元（-3.96%）；周四收盘权益8,831.83元至本次快照为-373.05元（-4.22%），差24.05元，未强行对齐。'],['资金余额与冻结数量','快照394.83元及冻结1100股与本人确认卖清未同步；不凭此恢复持仓。'],['截图7.490','是市价，不是卖出成交均价；不推断卖价或时间。'],['出入金','按两周交割现金连续衔接，暂假设无额外出入金；若存在须重算。']])],
 ['daily-account','每日账户与仓位',table(['日期','成交','现金','持仓/估值价','权益','日收益','日收益率','仓位'],days.map((d,i)=>[d.date+' 周'+'一二三四五'[i]+(!d.finalized?'（盘中）':''),d.count===null?'清仓已确认，笔数待补':d.count+'笔',d.cash===null?'余额字段待同步':money(d.cash),d.held?d.held.name+' '+d.held.qty+'股 × '+d.held.close.toFixed(2):'空仓',money(d.equity),signed(d.pnl),signed(d.returnPct)+'%',d.position.toFixed(2)+'%']))+'<p>前四日收盘价来自下方五分钟行情的15:00收盘。周五不是日末值，因此不把这五行混算成全周平均日末仓位。周三零收益建立在无遗漏交易、无出入金且周二已清仓的前提下。</p>'],
 ['ticket-pnl','本周持有/闭环票：赚钱与亏损主因',table(['标的','状态','含费投入','净回款','整轮损益','证据'],closed.map(c=>[c.name,'已卖清',money(c.cost),money(c.net),signed(c.pnl),c.source]))+'<h3>北纬科技：-663.49元</h3><p>交割事实：8.75元买1100股，次日8.16元卖清。价差亏649.00元，费用14.49元。含费买入约占期初资产96.45%。是否抢在题材跟随确认前买入、卖出是否符合失效条件，须结合本人盘面回忆和分时证据，不能仅凭亏损倒推。</p><h3>华东重机：-862.05元（快照核对）</h3><p>周四8.11元买1100股，周五本人确认卖清。按总资产减买后现金，推算净回款8,063.95元，与截图整轮亏损相符；这不是卖出成交额。09:30成交不能单独证明主动性或龙头地位，买卖逻辑待补。当前损失占两轮合计约56.51%，是本周较大亏损贡献。</p>'],
 ['charts','五分钟K线与买卖点',require('./nov20-five-minute.cjs')()],
 ['trades','已核逐笔交割',table(['日期','时间','证券','买卖','数量','成交价','成交额','手续费','印花税','含费发生额','资金余额'],trades.map(t=>[t.date,t.time,t.name+' '+t.code,t.side,t.qty,t.price.toFixed(3),money(t.amount),money(t.fee),money(t.tax),signed(t.net),money(t.cash)]))+'<p>已给3笔：买入成交额18,546.00元，卖出8,976.00元；已知费用19.49元。周五卖出尚未计入笔数、成交额与费用。订单与合同编号不公开。</p>'],
 ['kiss','每日KISS与整体反思 · 待本人补充',table(['日期','已知动作','待补的本人判断'],[['周一11-16','北纬科技买入1100股','竞价属于哪一档？何时确认主动性及板块跟随？'],['周二11-17','14:56:47卖清北纬科技','失效信号、是否执行预案、尾盘卖出的考虑。'],['周三11-18','无可见成交，按记录空仓','当天观察与空仓原因。'],['周四11-19','09:30买入华东重机1100股','所属模式、唯一性、量能与仓位决策。'],['周五11-20','本人确认清仓','具体卖单、退出触发、是否有执行延迟。']])+'<p>Keep / Improve / Start / Stop 尚不代填。当前仅能确认结果与敞口，不能判断当时的情绪、冲动或纪律执行过程。</p>'],
 ['rules','现行规则复核','<p>整周亏损上限5%以期初权益为基准，不按周内高点回撤。按当前资产变化，区间亏损15.28%，已超出这一上限；后续无新增交易也不能把本期改记为达标。</p><p>模式优先级与二波卖点沿用总手册，不把未知交易强行贴模式标签；平台突破/反包是观察路径，不自动确认题材二波。<a href="https://travelstocks.github.io/daily-trading-workbench/#leader-modes">回看总交易手册</a></p>'],
 ['pending','下一次补充','<ol><li>11月20日华东重机逐笔卖出：成交时间、数量、均价、发生金额和费用。</li><li>周五收盘后的总资产与现金，核对1元差异；如有出入金一并补充。</li><li>北纬科技和华东重机的买卖理由、当日预案及本周整体反思。</li></ol><p>无需重发11月13日四笔卖单，已录入上一周并补齐图上的卖点。后续补充会覆盖本周同一条归档及曲线，不新增重复周。</p><p><a href="data/summary.json">本周计算结果</a> · <a href="data/input.json">脱敏输入与差异</a></p>']
];
const css=read(prior+'/index.html').match(/<style>([\s\S]*?)<\/style>/)[1];
const extra='.hero h1{font-size:30px;line-height:1.3}.page #focus{border-top:4px solid #a33325}.page #focus h2{font-size:32px}.page #focus li{margin:18px 0}.numbers{min-width:0}.numbers span{overflow-wrap:anywhere}.chart-scroll{overflow-x:auto}.chart-scroll svg{min-width:760px}.panel{min-width:0}.table-wrap{overflow-x:auto}';
write(folder+'/index.html','<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>11.16–11.20 周度交割复盘</title><style>'+css+extra+'</style></head><body><div class="shell"><aside class="side"><h2>周度交割复盘</h2><a href="../weekly-trading-review/">返回周度归档</a><nav>'+sections.map(([id,t])=>'<a href="#'+id+'">'+t+'</a>').join('')+'</nav></aside><main class="page"><header class="hero"><div><span class="eyebrow">2026 · 本周初稿</span><h1>11.16–11.20 交割复盘</h1><p>'+headline+'</p><span class="status">截至11-20盘中 · 逐笔卖单与反思待补</span></div><div class="numbers">'+tiles+'</div></header>'+sections.map(([id,t,b])=>'<section class="panel" id="'+id+'"><h2>'+t+'</h2>'+b+'</section>').join('')+'<footer><a href="../'+prior+'/">上一周11.09–11.13 · 卖单已补齐</a></footer></main></div></body></html>');
const card='<a class="week-card latest-link" href="../'+folder+'/"><div class="week-head"><h3>11.16–11.20</h3><span class="chip">11-20盘中初稿</span></div><div class="mini-grid">'+tiles+'</div><p>'+headline+'</p></a>';
let hub=read('weekly-trading-review/index.html').replace(new RegExp('<a class="week-card latest-link" href="../'+folder+'/">[\\s\\S]*?</a>','g'),'').replace('class="week-card latest-link" href="../'+prior+'/','class="week-card" href="../'+prior+'/').replace('<div class="archive">','<div class="archive">'+card);
hub=hub.replace(/<section class="panel">\s*<span class="label">Latest Review<\/span>[\s\S]*?<\/section>/,'<section class="panel"><span class="label">Latest Review</span><h2>最新周：11.16–11.20</h2><p>'+headline+'</p><a href="../'+folder+'/#daily-account">查看每日账户</a></section>').replace('../'+prior+'/">进入最新周复盘','../'+folder+'/">进入最新周复盘').replace(/最新一期2026\.[^<]+/,'最新一期2026.11.16–11.20：'+headline).replace(/(<span>最新资料状态<\/span>)<strong[^>]*>[^<]*<\/strong><small>[^<]*<\/small>/,'$1<strong>周五盘中初稿</strong><small>卖单及反思待补</small>');
write('weekly-trading-review/index.html',hub);
let home=read('index.html').replace('./'+prior+'/">最新周复盘','./'+folder+'/">最新周复盘').replace(/最新一期11\.09至11\.13：[^<]+/,'最新一期11.16至11.20：'+headline).replace('周报 <b>26 篇','周报 <b>27 篇').replace('最新 <b>11.09-11.13','最新 <b>11.16-11.20').replace('状态 <b>全周账户已核算','状态 <b>周五盘中初稿');
write('index.html',home);
console.log({opening,pnl,rate,end:snapshot.totalAssets,days:days.map(d=>d.pnl)});
