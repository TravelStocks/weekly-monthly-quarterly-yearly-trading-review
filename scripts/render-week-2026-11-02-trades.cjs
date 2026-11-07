const assert = require('node:assert/strict');
const account = require('./calculate-account-2026-11-02.cjs');
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
const closed = ['603278', '603131', '600715'].map(code => {
  const rows = all.filter(t => t.code === code), buys = rows.filter(t => t.side === '买入'), sells = rows.filter(t => t.side === '卖出');
  assert.equal(buys.reduce((s,t)=>s+t.qty,0), sells.reduce((s,t)=>s+t.qty,0));
  const cost = -sum(buys, 'net'), proceeds = sum(sells, 'net');
  return {code, name: rows[0].name, qty: buys.reduce((s,t)=>s+t.qty,0), cost: cost/100, proceeds: proceeds/100, pnl: (proceeds-cost)/100, returnPct: (proceeds-cost)/cost*100};
});
const buyAmount = sum(data.trades.filter(t=>t.side==='买入'),'amount')/100;
const sellAmount = sum(data.trades.filter(t=>t.side==='卖出'),'amount')/100;
const fees = data.trades.reduce((s,t)=>s+Math.abs(cents(t.net)-cents(t.side==='买入'?-t.amount:t.amount)),0)/100;
const summary = {status:'complete-trades', date:data.weekStart, coveredThrough:data.weekEnd, account, tradeCount:data.trades.length, referenceCount:data.reference.length, buyAmount, sellAmount, fees, netCash:sum(data.trades,'net')/100, lastCash:data.trades.at(-1).cash, closed, closedPnl:closed.reduce((s,t)=>s+cents(t.pnl),0)/100, friday:data.friday, reason:'全周成交已核实，账户按无额外出入金估算。'};
assert.equal(summary.closedPnl,-1504.43);
assert.equal(summary.fees,44.39);
assert.equal(summary.netCash,2423.61);
function render({section,table,esc}) {
  const metric = (label,value,cls='') => `<div><span>${label}</span><strong class="${cls}">${value}</strong></div>`;
  const rows = data.trades.map(t=>[t.date.slice(5),t.time,`${t.name} ${t.code}`,t.side,t.qty,t.price.toFixed(3),money(t.amount),signed(t.net),money(t.cash)]);
  const detail = table(['日期','时间','证券','操作','数量','成交均价','成交金额','发生金额（含费）','资金余额'],rows).replaceAll('<td>买入</td>','<td class="trade-up">买入</td>').replaceAll('<td>卖出</td>','<td class="trade-down">卖出</td>');
  const days = account.days.map((d,i)=>[d.date.slice(5)+' '+['周一','周二','周三','周四','周五'][i],statementSummary(d.date),money(d.cash),d.holdings.map(h=>h.name+h.qty+'股 × '+h.close.toFixed(2)).join('；')||'空仓（按可见成交）',signed(d.pnl),signed(d.returnPct)+'%',money(d.position)+'%',money(d.equity)]);
  function statementSummary(date){const ts=data.trades.filter(t=>t.date===date);if(!ts.length)return '无成交 · 空仓';return ts.length+'笔：'+ts.map(t=>t.name+t.side+t.qty+'股').join('；');}

  const pnl = closed.map(t=>`<article class="opportunity"><h3>${esc(t.name)} · 已闭环</h3><p><strong class="trade-down">${signed(t.pnl)}元</strong> · 含费成本收益率 ${t.returnPct.toFixed(2)}%</p><p>数量${t.qty}股；含费买入成本${money(t.cost)}元，卖出净回款${money(t.proceeds)}元。</p><p>${t.code==='600715'?'周三2.71元分两笔买入800股，周四09:38:02以2.33元全部卖出。次日净回款1,858.05元。本人反思：同身位PK未决就抢先押注。':t.code==='603278'?'10月30日19.61元、19.57元各买100股；11月2日17.57元分两次各卖100股。这是跨周整笔交易损失，含上周成本，不等于11月2日账户当日亏损。本人反思：绕异动博弈仓位过重，把非主模式当作主模式处理。':'11月2日09:47:14、09:48:19以19.31元各买100股；11月3日09:32:51以15.60元卖出200股。本人反思：未定龙抢板、第二笔缺少新增确认，并带有扳回大业错误的动机。'}</p><p><b>对应纪律：</b>${t.code==='600715'?'等同身位胜负明确，再按预案判断；轻仓不能代替地位确认。':t.code==='603278'?'非主模式不能取得主模式仓位豁免；先核交易逻辑与风险边界。':'先定龙再参与；加仓必须有新增依据，上一笔亏损不是下一笔的理由。'}</p></article>`).join('');
  return section('trade-records','11月2日至6日 · 全周成交与账户',`<p>来源：${esc(data.source)}。本周8笔、3只股票；10月30日5笔仅作跨周参考。</p><div class="trade-metrics">${metric('全周账户收益（估）',signed(account.pnl),'trade-down')}${metric('周收益率（估）',signed(account.returnPct)+'%','trade-down')}${metric('期末权益（估）',money(account.endingEquity))}${metric('平均日末仓位',money(account.averagePosition)+'%')}${metric('三笔闭环含费盈亏',signed(summary.closedPnl),'trade-down')}${metric('期末仓位','0.00%')}</div><p>${esc(account.basis)}</p><p>周四现金：8,461.92＋1,858.05＝10,319.97元。三只股票的完整闭环含费损失为1,504.43元，其中大业的24.04元浮亏已在上周期末权益中体现，所以本周账户损失为1,480.39元。</p><h3>每日账户收益与仓位</h3>${table(['日期','操作','现金','收盘持仓 / 价格','日收益（估）','日收益率（估）','日末仓位','日末权益（估）'],days).replaceAll('<td>-','<td class="trade-down">-')}<p class="subtle"><a href="data/closing-quotes.json">收盘价来源</a> · <a href="data/summary.json">逐日计算依据</a></p><h3>本周成交明细</h3>${detail}<p>买入成交额${money(buyAmount)}元；卖出成交额${money(sellAmount)}元；实际费用${money(fees)}元。现金净变化${signed(summary.netCash)}元不是账户利润。</p><details><summary>10月30日跨周参考（不计入本周成交笔数）</summary>${table(['日期','时间','证券','操作','数量','均价','含费发生金额','资金余额'],data.reference.map(t=>[t.date,t.time,t.name,t.side,t.qty,t.price.toFixed(3),signed(t.net),money(t.cash)]))}</details>`)+section('ticket-pnl','本周持有/闭环票：赚钱与亏损主因',pnl)+section('missing-records','资料核对',`<p>周一至周四的成交已对齐，周五本人确认空仓。截图余额被截断的末位按上一笔余额与实际发生金额推算，未将交割截图公开。资产与收益为交割估算，不是券商确认日表。</p>`);
}
const hubCard=`<a class="week-card latest-link" href="../2026-11-02_2026-11-06/"><div class="week-head"><h3>11.02–11.06</h3><span class="chip">全周交割已补 · 期末空仓</span></div><p>全周8笔成交；周四卖出文投800股后清仓，周五无成交。</p><div class="mini-grid">${[['周收益（估）',signed(account.pnl),'is-loss'],['周收益率（估）',signed(account.returnPct)+'%','is-loss'],['期末权益（估）',money(account.endingEquity),''],['平均日末仓位',money(account.averagePosition)+'%',''],['完整闭环含费盈亏',signed(summary.closedPnl),'is-loss'],['期末仓位','0.00%','']].map(([label,value,cls])=>`<span>${label} <b class="${cls}">${value}</b></span>`).join('')}</div><p class="equity-basis">以期初11,800.36元和期末现金10,319.97元计算；假设无遗漏持仓或额外出入金。</p></a>`;
module.exports = {summary,render,hubCard};
