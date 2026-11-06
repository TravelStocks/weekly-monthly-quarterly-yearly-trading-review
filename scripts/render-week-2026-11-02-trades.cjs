const assert = require('node:assert/strict');
const data = require('../2026-11-02_2026-11-06/data/trades-partial.json');
const cents = n => Math.round(n * 100);
const sum = (rows, key) => rows.reduce((n, r) => n + cents(r[key]), 0);
const money = n => n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const signed = n => `${n > 0 ? '+' : ''}${money(n)}`;
const all = [...data.reference, ...data.trades];
for (let i = 1; i < all.length; i++) {
  assert.equal(cents(all[i].cash), cents(all[i - 1].cash) + cents(all[i].net), 'Cash continuity');
}
for (const t of all) assert.equal(cents(t.price * t.qty), cents(t.amount), 'Quantity times price');
const closed = ['603278', '603131'].map(code => {
  const rows = all.filter(t => t.code === code), buys = rows.filter(t => t.side === '买入'), sells = rows.filter(t => t.side === '卖出');
  assert.equal(buys.reduce((s,t)=>s+t.qty,0), sells.reduce((s,t)=>s+t.qty,0));
  const cost = -sum(buys, 'net'), proceeds = sum(sells, 'net');
  return {code, name: rows[0].name, qty: buys.reduce((s,t)=>s+t.qty,0), cost: cost/100, proceeds: proceeds/100, pnl: (proceeds-cost)/100, returnPct: (proceeds-cost)/cost*100};
});
const buyAmount = sum(data.trades.filter(t=>t.side==='买入'),'amount')/100;
const sellAmount = sum(data.trades.filter(t=>t.side==='卖出'),'amount')/100;
const fees = data.trades.reduce((s,t)=>s+Math.abs(cents(t.net)-cents(t.side==='买入'?-t.amount:t.amount)),0)/100;
const summary = {status:'partial-trades', date:data.weekStart, coveredThrough:'2026-11-04', account:null, tradeCount:data.trades.length, referenceCount:data.reference.length, buyAmount, sellAmount, fees, netCash:sum(data.trades,'net')/100, lastCash:data.trades.at(-1).cash, closed, closedPnl:closed.reduce((s,t)=>s+cents(t.pnl),0)/100, friday:data.friday, reason:'已录入11月2日至4日成交；11月5日待补，11月6日用户确认空仓。缺少完整账户权益与出入金，不计算全周收益。'};
assert.equal(summary.closedPnl,-1184.46);
assert.equal(summary.fees,38.44);
assert.equal(summary.netCash,565.56);
function render({section,table,esc}) {
  const metric = (label,value,cls='') => `<div><span>${label}</span><strong class="${cls}">${value}</strong></div>`;
  const rows = data.trades.map(t=>[t.date.slice(5),t.time,`${t.name} ${t.code}`,t.side,t.qty,t.price.toFixed(3),money(t.amount),signed(t.net),money(t.cash)]);
  const detail = table(['日期','时间','证券','操作','数量','成交均价','成交金额','发生金额（含费）','资金余额'],rows).replaceAll('<td>买入</td>','<td class="trade-up">买入</td>').replaceAll('<td>卖出</td>','<td class="trade-down">卖出</td>');
  const days = [
    ['11-02 周一','4笔：沪工买入200股；大业卖出200股','7,526.53','沪工200股（按可见成交）','待补'],
    ['11-03 周二','1笔：沪工卖出200股','10,639.94','按可见成交已无持仓','待补'],
    ['11-04 周三','2笔：文投买入800股','8,461.92','文投800股（按可见成交）','待补'],
    ['11-05 周四','记录待补','待补','待补','待补'],
    ['11-06 周五','用户确认空仓；具体是否成交未提供','待补','空仓，仓位0%','待补']
  ];
  const pnl = closed.map(t=>`<article class="opportunity"><h3>${esc(t.name)} · 已闭环</h3><p><strong class="trade-down">${signed(t.pnl)}元</strong> · 含费成本收益率 ${t.returnPct.toFixed(2)}%</p><p>数量${t.qty}股；含费买入成本${money(t.cost)}元，卖出净回款${money(t.proceeds)}元。</p><p>${t.code==='603278'?'10月30日19.61元、19.57元各买100股；11月2日17.57元分两次各卖100股。这是跨周整笔交易损失，含上周成本，不等于11月2日账户当日亏损。本人反思：绕异动博弈仓位过重，把非主模式当作主模式处理。':'11月2日09:47:14、09:48:19以19.31元各买100股；11月3日09:32:51以15.60元卖出200股。本人反思：未定龙抢板、第二笔缺少新增确认，并带有扳回大业错误的动机。'}</p><p><b>对应纪律：</b>${t.code==='603278'?'非主模式不能取得主模式仓位豁免；先核交易逻辑与风险边界。':'先定龙再参与；加仓必须有新增依据，上一笔亏损不是下一笔的理由。'}</p></article>`).join('');
  return section('trade-records','11月2日至4日 · 成交记录已补',`<p>来源：${esc(data.source)}。本周7笔、3只股票；另附10月30日5笔跨周参考。合同编号、成交编号等已剔除。周四待补，周五空仓由本人确认。</p><div class="trade-metrics">${metric('已确认闭环损失',signed(summary.closedPnl),'trade-down')}${metric('本周已录成交','7笔 / 3只')}${metric('11月4日最新可见现金',money(summary.lastCash))}${metric('周五仓位','0%')}${metric('已录成交费用',money(fees))}${metric('全周账户收益','待补齐后核算')}</div><p><strong>闭环损失不等于全周账户损失。</strong>现金净流入${signed(summary.netCash)}元也不是利润；文投仍缺卖出记录，无法据周五空仓倒推卖出时间、价格或收益。周五空仓不自动等于当日收益为零。</p><h3>每日记录状态</h3>${table(['日期','已提供记录','最新可见现金','持仓 / 仓位','账户日收益'],days)}<h3>本周成交明细</h3>${detail}<p>买入成交额${money(buyAmount)}元；卖出成交额${money(sellAmount)}元。费用以成交金额与实际发生金额的差额计${money(fees)}元；列示手续费35.00元、印花税3.32元，另有0.12元差额，未擅自归类。</p><details><summary>10月30日跨周参考（不计入本周成交笔数）</summary>${table(['日期','时间','证券','操作','数量','均价','含费发生金额','资金余额'],data.reference.map(t=>[t.date,t.time,t.name,t.side,t.qty,t.price.toFixed(3),signed(t.net),money(t.cash)]))}<p>10月30日襄阳轴承实际卖出600股，随后买入大业股份200股。它推翻上周“周五无新增交易、继续持有襄阳”的旧情景；本次仅将这5笔作为跨周成本及现金衔接依据，不沿用旧情景权益计算本周收益。上周账户估值尚待按实际持仓重算。</p></details>`)+section('ticket-pnl','本周持有/闭环票：赚钱与亏损主因',pnl+`<article class="opportunity"><h3>文投控股 · 买入已核实，退出待补</h3><p>11月4日09:32:56、09:33:41，以2.71元各买400股，合计800股；含费成本2,178.02元。11月4日可见记录尚未卖出，不能判定期末浮盈亏。周五空仓不代表该笔无亏损。</p><p><b>本人反思：</b>同题材同身位PK尚未完成就抢换手板。<b>对应纪律：</b>先等PK结果，再核龙头七维和买点；不是龙头的合格切换或补涨机会最多一成，否则观望。</p></article>`)+section('missing-records','后续待补材料',`<ul><li>11月5日完整成交，包括文投控股退出记录；如有其他日期遗漏成交也需一并补入。</li><li>11月6日期末总资产或现金，以及本周出入金情况。当前仅确认空仓。</li><li>每日收益、权益或持仓收盘估值依据，用于账户日收益、全周收益率及仓位统计。</li></ul><p>原有个人心得、历史规则版本和学习模块继续保留。未编造分时价格路径；实际成交时间、价格见上表。</p>`);
}
module.exports = {summary,render};
