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
const closed = ['603278', '603131'].map(code => {
  const rows = all.filter(t => t.code === code), buys = rows.filter(t => t.side === '买入'), sells = rows.filter(t => t.side === '卖出');
  assert.equal(buys.reduce((s,t)=>s+t.qty,0), sells.reduce((s,t)=>s+t.qty,0));
  const cost = -sum(buys, 'net'), proceeds = sum(sells, 'net');
  return {code, name: rows[0].name, qty: buys.reduce((s,t)=>s+t.qty,0), cost: cost/100, proceeds: proceeds/100, pnl: (proceeds-cost)/100, returnPct: (proceeds-cost)/cost*100};
});
const buyAmount = sum(data.trades.filter(t=>t.side==='买入'),'amount')/100;
const sellAmount = sum(data.trades.filter(t=>t.side==='卖出'),'amount')/100;
const fees = data.trades.reduce((s,t)=>s+Math.abs(cents(t.net)-cents(t.side==='买入'?-t.amount:t.amount)),0)/100;
const summary = {status:'partial-trades', date:data.weekStart, coveredThrough:'2026-11-04', account:null, partialAccount:account, tradeCount:data.trades.length, referenceCount:data.reference.length, buyAmount, sellAmount, fees, netCash:sum(data.trades,'net')/100, lastCash:data.trades.at(-1).cash, closed, closedPnl:closed.reduce((s,t)=>s+cents(t.pnl),0)/100, friday:data.friday, reason:'已录入11月2日至4日成交；11月5日待补，11月6日用户确认空仓。已计算前三日收盘估算；缺少周四成交及期末资产，不计算全周收益。'};
assert.equal(summary.closedPnl,-1184.46);
assert.equal(summary.fees,38.44);
assert.equal(summary.netCash,565.56);
function render({section,table,esc}) {
  const metric = (label,value,cls='') => `<div><span>${label}</span><strong class="${cls}">${value}</strong></div>`;
  const rows = data.trades.map(t=>[t.date.slice(5),t.time,`${t.name} ${t.code}`,t.side,t.qty,t.price.toFixed(3),money(t.amount),signed(t.net),money(t.cash)]);
  const detail = table(['日期','时间','证券','操作','数量','成交均价','成交金额','发生金额（含费）','资金余额'],rows).replaceAll('<td>买入</td>','<td class="trade-up">买入</td>').replaceAll('<td>卖出</td>','<td class="trade-down">卖出</td>');
  const days = account.days.map((d,i)=>[d.date.slice(5)+' '+['周一','周二','周三'][i],statementSummary(d.date),money(d.cash),d.holdings.map(h=>h.name+h.qty+'股 × '+h.close.toFixed(2)).join('；')||'空仓（按可见成交）',signed(d.pnl),signed(d.returnPct)+'%',money(d.position)+'%',money(d.equity)]);
  days.push(['11-05 周四','记录待补','待补','待补','待补','待补','待补','待补'],['11-06 周五','本人确认空仓','待补','空仓','待补','待补','0.00%','待补']);
  function statementSummary(date){const ts=data.trades.filter(t=>t.date===date);return ts.length+'笔：'+ts.map(t=>t.name+t.side+t.qty+'股').join('；');}

  const pnl = closed.map(t=>`<article class="opportunity"><h3>${esc(t.name)} · 已闭环</h3><p><strong class="trade-down">${signed(t.pnl)}元</strong> · 含费成本收益率 ${t.returnPct.toFixed(2)}%</p><p>数量${t.qty}股；含费买入成本${money(t.cost)}元，卖出净回款${money(t.proceeds)}元。</p><p>${t.code==='603278'?'10月30日19.61元、19.57元各买100股；11月2日17.57元分两次各卖100股。这是跨周整笔交易损失，含上周成本，不等于11月2日账户当日亏损。本人反思：绕异动博弈仓位过重，把非主模式当作主模式处理。':'11月2日09:47:14、09:48:19以19.31元各买100股；11月3日09:32:51以15.60元卖出200股。本人反思：未定龙抢板、第二笔缺少新增确认，并带有扳回大业错误的动机。'}</p><p><b>对应纪律：</b>${t.code==='603278'?'非主模式不能取得主模式仓位豁免；先核交易逻辑与风险边界。':'先定龙再参与；加仓必须有新增依据，上一笔亏损不是下一笔的理由。'}</p></article>`).join('');
  return section('trade-records','11月2日至4日 · 成交记录已补',`<p>来源：${esc(data.source)}。本周7笔、3只股票；另附10月30日5笔跨周参考。合同编号、成交编号等已剔除。周四待补，周五空仓由本人确认。</p><div class="trade-metrics">${metric('截至周三收益（估）',signed(account.pnl),'trade-down')}${metric('截至周三收益率（估）',signed(account.returnPct)+'%','trade-down')}${metric('周三收盘权益（估）',money(account.endingEquity))}${metric('前三日日末仓位均值（估）',money(account.averagePosition)+'%')}${metric('完整闭环含费盈亏',signed(summary.closedPnl),'trade-down')}${metric('周五仓位（本人确认）','0.00%')}</div><p><strong>闭环损失不等于全周账户损失。</strong>现金净流入${signed(summary.netCash)}元也不是利润；文投仍缺卖出记录，无法据周五空仓倒推卖出时间、价格或收益。周五空仓不自动等于当日收益为零。</p><p><strong>计算范围：11月2日至4日。</strong>${esc(account.basis)}</p><p>周三现金8,461.92＋文投800股×2.47＝10,437.92元；对比期初11,800.36元，累计估算收益-1,362.44元。闭环损失-1,184.46＋文投浮亏-202.02－期初大业浮亏（-24.04）＝-1,362.44元。平均仓位只取前三日，不把周四待补当0。</p><h3>每日账户收益与仓位（部分估算）</h3>${table(['日期','已提供记录','现金','收盘持仓 / 价格','日收益（估）','日收益率（估）','日末仓位（估）','日末权益（估）'],days).replaceAll('<td>-','<td class="trade-down">-')}<p class="subtle"><a href="data/closing-quotes.json">收盘价及原始来源</a> · <a href="data/summary.json">逐日计算依据</a>。周四、周五账户收益仍待补，未入全周资金曲线。</p><h3>本周成交明细</h3>${detail}<p>买入成交额${money(buyAmount)}元；卖出成交额${money(sellAmount)}元。费用以成交金额与实际发生金额的差额计${money(fees)}元；列示手续费35.00元、印花税3.32元，另有0.12元差额，未擅自归类。</p><details><summary>10月30日跨周参考（不计入本周成交笔数）</summary>${table(['日期','时间','证券','操作','数量','均价','含费发生金额','资金余额'],data.reference.map(t=>[t.date,t.time,t.name,t.side,t.qty,t.price.toFixed(3),signed(t.net),money(t.cash)]))}<p>10月30日襄阳轴承实际卖出600股，随后买入大业股份200股。它推翻上周“周五无新增交易、继续持有襄阳”的旧情景；本次仅将这5笔作为跨周成本及现金衔接依据，不沿用旧情景权益计算本周收益。上周账户已同步按实际持仓重算：期末权益11,800.36元，作为本周期初依据。</p></details>`)+section('ticket-pnl','本周持有/闭环票：赚钱与亏损主因',pnl+`<article class="opportunity"><h3>文投控股 · 买入已核实，退出待补</h3><p>11月4日09:32:56、09:33:41，以2.71元各买400股，合计800股；含费成本2,178.02元。11月4日可见记录尚未卖出，不能判定期末浮盈亏。周五空仓不代表该笔无亏损。</p><p><b>本人反思：</b>同题材同身位PK尚未完成就抢换手板。<b>对应纪律：</b>先等PK结果，再核龙头七维和买点；按11月6日修订，合格补涨、切换最高两成，补涨限定三板且地位确认；不合格或PK未决则观望。</p></article>`)+section('missing-records','后续待补材料',`<ul><li>11月5日完整成交，包括文投控股退出记录；如有其他日期遗漏成交也需一并补入。</li><li>11月6日期末总资产或现金，以及本周出入金情况。当前仅确认空仓。</li><li>前三日收益与仓位已按交割和收盘价估算，后续用券商日表及出入金核对；周四、周五账户权益仍待补齐。</li></ul><p>原有个人心得、历史规则版本和学习模块继续保留。未编造分时价格路径；实际成交时间、价格见上表。</p>`);
}
const hubCard=`<a class="week-card latest-link" href="../2026-11-02_2026-11-06/"><div class="week-head"><h3>11.02–11.06</h3><span class="chip">已估算至周三 / 周四待补 / 周五空仓</span></div><p>已录入前三日7笔成交、3只股票。按实际交割与收盘价还原，截至11月4日账户估算收益${signed(account.pnl)}元；全周结果待周四记录与期末资产补齐，原有心得保留，新增“三大交易禁忌”及低一身位一字托举龙头的小题材案例。</p><div class="mini-grid"><span>截至周三收益（估） <b class="is-loss">${signed(account.pnl)}</b></span><span>截至周三收益率（估） <b class="is-loss">${signed(account.returnPct)}%</b></span><span>周三收盘权益（估） <b>${money(account.endingEquity)}</b></span><span>前三日日末仓位均值（估） <b>${money(account.averagePosition)}%</b></span><span>完整闭环含费盈亏 <b class="is-loss">${signed(summary.closedPnl)}</b></span><span>周五仓位（本人确认） <b>0.00%</b></span></div><p class="equity-basis">期初权益11,800.36元；周三现金8,461.92＋文投800股×2.47＝10,437.92元。收益率按期初至周三计算，仓位均值只取前三日；周五空仓不代表当日零收益。缺失日不按0填充，暂不入完整周资金曲线。</p></a>`;
module.exports = {summary,render,hubCard};
