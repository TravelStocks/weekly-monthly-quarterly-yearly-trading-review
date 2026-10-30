const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),folder='2026-10-26_2026-10-30',dir=path.join(root,folder);
const data=require(path.join(dir,'data/statement.json'));
const cents=n=>Math.round(n*100),cashfmt=n=>Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),sign=n=>(n>0?'+':'')+cashfmt(n);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const prev=require(path.join(root,'2026-10-19_2026-10-23/data/statement.json'));
let cash=cents(data.rows[0].cash)-cents(data.rows[0].net);
const rows=data.rows.map(t=>{
 assert.equal(cents(t.qty*t.price),cents(t.amount));cash+=cents(t.net);
 if(t.cash!==null)assert.equal(cents(t.cash),cash);else assert((cash/100).toFixed(2).startsWith(t.cashText.replace('…','')));
 const totalFee=t.side==='买入'?-cents(t.net)-cents(t.amount):cents(t.amount)-cents(t.net);
 return {...t,cashReconciled:cash/100,cashDerived:t.cash===null,totalFee:totalFee/100,feeDifference:(totalFee-cents(t.fee)-cents(t.tax)-cents(t.other))/100};
});
const reference=rows.filter(t=>t.date<data.start),trades=rows.filter(t=>t.date>=data.start);
assert.equal(reference.length,4);assert.equal(trades.length,12);assert.equal(reference.at(-1).cash,data.openingCash);
for(const t of reference){const old=prev.trades.find(p=>p.date===t.date&&p.code===t.code&&p.side===t.side);assert(old);assert.equal(old.amount,t.amount);assert.equal(old.qty,t.qty);}
const stocks=new Map(data.openingHoldings.map(p=>[p.code,{...p,openQty:p.qty,openCost:cents(p.cost),buyQty:0,sellQty:0,realized:0,closedCost:0,proceeds:0}]));
for(const t of trades){
 if(!stocks.has(t.code))stocks.set(t.code,{code:t.code,name:t.name,openQty:0,openCost:0,buyQty:0,sellQty:0,realized:0,closedCost:0,proceeds:0});
 const s=stocks.get(t.code);
 if(t.side==='买入'){s.buyQty+=t.qty;s.openQty+=t.qty;s.openCost-=cents(t.net);}else{assert(s.openQty>=t.qty);const cost=t.qty===s.openQty?s.openCost:Math.round(s.openCost*t.qty/s.openQty);s.openQty-=t.qty;s.openCost-=cost;s.closedCost+=cost;s.proceeds+=cents(t.net);s.realized+=cents(t.net)-cost;s.sellQty+=t.qty;}
}
const stockList=[...stocks.values()].map(s=>({...s,openCost:s.openCost/100,closedCost:s.closedCost/100,proceeds:s.proceeds/100,realized:s.realized/100}));
const sum=(ts,k)=>ts.reduce((n,t)=>n+cents(t[k]),0)/100;
const summary={start:data.start,end:data.end,coveredThrough:data.coveredThrough,tradeCount:trades.length,referenceCount:4,buyAmount:sum(trades.filter(t=>t.side==='买入'),'amount'),sellAmount:sum(trades.filter(t=>t.side==='卖出'),'amount'),fees:sum(trades,'totalFee'),feeDifference:sum(trades,'feeDifference'),netCash:sum(trades,'net'),openingCash:data.openingCash,lastCash:trades.at(-1).cashReconciled,realized:sum(stockList,'realized'),stocks:stockList,accountStatus:'待补10月30日交割、每日账户表及期末持仓'};
assert.equal(summary.realized,1566.43);assert.equal(summary.lastCash,284.18);assert.equal(cents(summary.openingCash)+cents(summary.netCash),cents(summary.lastCash));
fs.writeFileSync(path.join(dir,'data/summary.json'),JSON.stringify({...summary,trades,reference},null,2)+'\n');
const table=(heads,rs)=>`<div class="table-wrap"><table><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rs.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const section=(id,title,body)=>`<section class="panel" id="${id}"><h2>${title}</h2>${body}</section>`;
const metrics=entries=>`<div class="metrics">${entries.map(([k,v])=>`<div class="metric"><span>${k}</span><strong>${v}</strong></div>`).join('')}</div>`;
const codes=[...new Set(trades.map(t=>t.code))];
const markets=Object.fromEntries(codes.map(c=>[c,fs.existsSync(path.join(dir,`data/${c}-5m.json`))?require(path.join(dir,`data/${c}-5m.json`)):null]));
function chart(code){
 const source=markets[code];if(!source)return '<p>真实五分钟行情未取得，图表待补入。</p>';
 const bars=source.bars,ts=trades.filter(t=>t.code===code),prices=[...bars.map(b=>b.close),...ts.map(t=>t.price)],lo=Math.min(...prices)*.99,hi=Math.max(...prices)*1.01;
 const x=i=>55+i/(bars.length-1)*805,y=p=>255-(p-lo)/(hi-lo)*220;
 const line=bars.map((b,i)=>`${x(i).toFixed(2)},${y(b.close).toFixed(2)}`).join(' ');
 const marks=ts.filter(t=>t.time>'09:25:00').map(t=>{let i=bars.findIndex(b=>b.date===t.date&&`${b.time}:00`>=t.time);if(i<0)return '';const buy=t.side==='买入';return `<g><title>${esc(`${t.date} ${t.time} ${t.side} ${t.qty}股 @ ${t.price}`)}</title><circle cx="${x(i)}" cy="${y(t.price)}" r="5" fill="${buy?'#b42318':'#2456c5'}"/><text x="${x(i)}" y="${y(t.price)+(buy?-12:20)}" text-anchor="middle">${buy?'B':'S'}</text></g>`;}).join('');
 return `<div class="chart-scroll"><svg viewBox="0 0 920 310" role="img" aria-label="${ts[0].name}真实五分钟收盘线与成交点">${[lo,(lo+hi)/2,hi].map(p=>`<line x1="55" x2="860" y1="${y(p)}" y2="${y(p)}" stroke="#dce3e9"/><text x="5" y="${y(p)+4}">${p.toFixed(2)}</text>`).join('')}${['26','27','28','29'].map(d=>{const i=bars.findIndex(b=>b.date===`2026-10-${d}`);return `<text x="${x(i)}" y="290">10/${d}</text>`;}).join('')}<polyline fill="none" stroke="#087f63" stroke-width="1.7" points="${line}"/>${marks}</svg></div><p class="subtle"><a href="${esc(source.source)}">新浪五分钟行情</a>，每只192根，覆盖10/26–10/29。线为各五分钟收盘价；成交价格来自交割，时间归入对应五分钟区间。竞价成交只在下方列表列示。</p>`;
}
const notes={
 '000678':['主要赚钱票 / 再次持仓','首轮三笔买入600股，含费成本10,101.00元，10/29卖出净回款11,611.19元，盈利1,510.19元；随后同价19.37元买回600股，形成新仓。','同价卖出再买回的两笔费用合计15.81元，未形成价差收益；首轮利润已实现，但重新持仓仍承担后续涨跌。买回动机、计划和风险边界待本人补充。'],
 '002535':['已平仓小幅盈利','3.33元买入900股，次日3.40元卖出，毛价差63元，扣费用后盈利51.47元。','收益来自已发生的买卖价差；题材地位、入场依据与退出原因待补，不能仅由盈利判断模式正确。'],
 '603278':['已平仓小幅盈利','两笔买入300股，成交额5,175元；卖出成交额5,220元，毛价差45元，含费后盈利27.28元。','实际费用17.72元占毛价差约39.38%；需要结合预期空间与执行原因复盘，暂不归因为追涨或犹豫。'],
 '002242':['跨周平仓盈利','承接10/23买入100股的含费成本2,121元，10/26卖出净回款2,156.92元，闭环盈利35.92元。','这一轮与10/15–10/19的九阳交易分开核算；卖出依据和与抱团预期的关系待补。'],
 '000530':['本期已平仓亏损票','承接10/23买入100股的含费成本916元，10/26卖出净回款857.57元，亏损58.43元。','价格由9.11元到8.63元，价差亏损48元，费用进一步减少收益；止损触发、题材判断与心态待本人说明。']
};
const header=`<header class="hero" id="top"><div><span class="eyebrow">2026 · WEEKLY TRADING REVIEW</span><h1>10.26–10.30<br>周度交割复盘</h1><p class="lead">交割先核对，心得与周五数据后续补齐。</p><p>截至10月29日：12笔成交、5只标的。上周4笔仅作成本及现金依据，不重复计入本周。</p><span class="status">数据初稿 · 10月30日尚未覆盖</span></div>${metrics([['已平仓完整盈亏',sign(summary.realized)+' 元'],['本周已见成交','12 笔 / 5 只'],['最新可见现金','284.18 元'],['可见未平仓','襄阳轴承 600股']])}</header>`;
const scope=section('scope','数据范围与核对',`<div class="warning">本页是10/26–10/30周报草稿，交割仅覆盖至10/29，不能视为完整周报。已平仓盈亏含上周持仓成本，不等于本周账户收益。</div><p>原图筛选范围10/22–10/29，共16笔；10/22–10/23的4笔已在<a href="../2026-10-19_2026-10-23/">上一期</a>记录。本图补足其实际费用及资金余额，以10/23现金7,307.75元和九阳、冰山各100股承接本周。前一期费用前估算不当作实际现金沿用。</p>${metrics([['本周买入成交额',cashfmt(summary.buyAmount)],['本周卖出成交额',cashfmt(summary.sellAmount)],['实际费用合计',cashfmt(summary.fees)],['成交现金净变化',sign(summary.netCash)]])}<p>全16笔资金链逐笔核对一致。被截断的10/23卖出后余额补算为10,344.75元，10/29卖出后余额补算为11,911.18元，均经下一笔余额验证。大业股份3笔合计${cashfmt(summary.feeDifference)}元未单列差额按发生金额计入费用，不擅自命名税费。</p><p class="subtle">原始合同号、成交号及私人截图不公开。<a href="data/statement.json">脱敏录入数据</a> · <a href="data/summary.json">计算汇总</a></p>`);
const closed=section('closed','已平仓盈亏与可见持仓',table(['标的','卖出股数','对应含费成本','净回款','完整闭环盈亏'],stockList.filter(s=>s.sellQty).map(s=>[s.name,s.sellQty,cashfmt(s.closedCost),cashfmt(s.proceeds),sign(s.realized)]))+`<p>襄阳轴承首轮卖出后新买600股，含费成本11,627.00元，单位含费成本19.3783元。末笔现金284.18元；期末实际持仓和总资产须由10/30账户确认。</p>`+table(['标的','可见未平仓','新仓含费成本','10/29行情收盘价','10/29参考浮盈亏'],stockList.filter(s=>s.openQty).map(s=>{const close=markets[s.code]?.bars.at(-1)?.close;return [s.name,s.openQty,cashfmt(s.openCost),close??'待补入',close?sign(s.openQty*close-s.openCost):'待补入'];}))+`<p class="subtle">行情估值仅截至10/29，不是10/30持仓快照，不推算完整周收益率。前轮已实现盈亏与新仓浮盈亏分开。</p>`);
const tickets=section('ticket-review','本周持有/闭环票：赚钱与亏损主因',`<p>以下为交割事实及Codex初步整理；仅说明已发生的价差和费用，不代写交易动机、市场判断或个人反思。</p><div class="stock-grid">${['000678','002535','603278','002242','000530'].map(c=>{const s=stockList.find(s=>s.code===c),n=notes[c];return `<article class="stock-card"><h3>${s.name} · ${sign(s.realized)}元</h3><b>${n[0]}</b><p>${n[1]}</p><p>${n[2]}</p><p class="subtle">操作/情绪与下一条纪律：待本人心得补入，再与成交核对。</p></article>`;}).join('')}</div>`);
const daily=section('daily','逐日操作与KISS',table(['日期','当日已见成交','操作记录','KISS/情绪'],['26','27','28','29','30'].map(d=>{const ts=trades.filter(t=>t.date===`2026-10-${d}`);return [`2026-10-${d}`,d==='30'?'未提供':ts.length,ts.map(t=>`${t.time} ${t.name}${t.side}${t.qty}股 @ ${t.price.toFixed(3)}`).join('；')||'等待10/30交割；不是确认无交易','Keep / Improve / Start / Stop 待本人补入'];})));
const account=section('account','账户收益与仓位',`<p>账户日表尚未提供，现金净变化和完整闭环盈亏不代替日收益。</p>`+table(['日期','收益金额','收益率','仓位','总资产'],['26','27','28','29','30'].map(d=>[`2026-10-${d}`,...Array(4).fill('待补入')])));
const chartSection=section('charts','真实五分钟走势与买卖点',`<div class="chart-list">${codes.map(c=>`<article class="chart-card"><h3>${stockList.find(s=>s.code===c).name} ${c}</h3>${chart(c)}<div class="points">${trades.filter(t=>t.code===c).map(t=>`<div class="point"><b>${t.side}</b> ${t.date.slice(5)} ${t.time}<br>${t.price.toFixed(3)} / ${t.qty}股</div>`).join('')}</div></article>`).join('')}</div>`);
const tradeTable=ts=>table(['日期','成交时间','代码','名称','方向','股数','均价','成交额','手续费','印花税','其他杂费','未单列差额','发生金额','资金余额'],ts.map(t=>[t.date,t.time,t.code,t.name,t.side,t.qty,t.price.toFixed(3),cashfmt(t.amount),cashfmt(t.fee),cashfmt(t.tax),cashfmt(t.other),cashfmt(t.feeDifference),sign(t.net),cashfmt(t.cashReconciled)+(t.cashDerived?'（补算）':'')]));
const details=section('trades','本周脱敏成交明细',tradeTable(trades));
const refs=section('reference','跨周成本依据（不计本周笔数）',tradeTable(reference)+`<p>星光股份本轮含费亏损94.49元，属于10/22–10/23，不计入本周1,566.43元。本图冰山冷热时间为实际成交13:52:10，上期13:52:01为委托时间，两者分别保留。</p>`);
const reflection=section('reflection','周度心得与新增纪律',`<p>本周个人心得尚未提供，暂不沿用上周结论。优先补充襄阳轴承同价买回的原因、九阳与冰山的退出依据，以及本周做对和需要改进的各一点。</p><p>新增硬化规则待心得确认；不把单次盈利当作模式有效性的验证。</p>`);
const missing=section('missing','后续请补这些资料',`<ol><li><b>10月30日交割：</b>若当天没有成交，请确认无交易，用于完成本周范围。</li><li><b>10/30收盘账户与持仓截图：</b>现金、总资产、持仓数量、成本、市价和持仓盈亏；核对襄阳600股是否仍在，以及有无其他持仓。</li><li><b>10/26–10/30每日账户表：</b>收益金额、收益率、仓位、当前总金额，以及出入金或其他非交易资金变动。</li><li><b>本周心得：</b>尤其襄阳卖出后同价买回的理由和计划，冰山止损、九阳兑现，以及林州和大业的买卖逻辑。可分段口述。</li></ol>`);
const priorHtml=fs.readFileSync(path.join(root,'2026-10-19_2026-10-23/index.html'),'utf8'),css=priorHtml.match(/<style>([\s\S]*?)<\/style>/)[1];
const nav=[['top','本周概览'],['scope','数据核对'],['closed','盈亏与持仓'],['ticket-review','逐票主因'],['daily','逐日操作'],['account','账户表'],['charts','买卖点'],['trades','成交明细'],['reference','跨周依据'],['reflection','心得'],['missing','待补材料']];
fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2026.10.26–10.30 周度交割复盘（截至29日）</title><style>${css}</style></head><body><div class="shell"><aside class="side"><h2>周度交割复盘</h2><a href="../weekly-trading-review/">返回周度归档</a><nav>${nav.map(([id,t])=>`<a href="#${id}">${t}</a>`).join('')}</nav></aside><main class="page">${header}${scope}${closed}${tickets}${account}${daily}${reflection}${chartSection}${details}${refs}${missing}<footer>整理日期2026-10-30 · 数据初稿。<a href="../2026-10-19_2026-10-23/">上一期10.19–10.23</a></footer></main></div></body></html>\n`);
console.log(JSON.stringify(summary));
