const fs = require("fs");
const path = require("path");
const assert = require("node:assert/strict");

const repo = path.resolve(__dirname, "..");
const folder = "2026-10-08_2026-10-16";
const directory = path.join(repo, folder);
const review = JSON.parse(fs.readFileSync(path.join(directory, "data/review.json"), "utf8"));
const previous = fs.readFileSync(path.join(repo, "2026-09-21_2026-09-30/index.html"), "utf8");
const baseStyles = previous.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/[ \t]+$/gm, "").trim();
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const amount = (value) => value == null ? "待补" : Number(value).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
const percent = (value) => value == null ? "待补" : `${Number(value).toFixed(2)}%`;
const table = (headings, body, className = "") => `<div class="table-wrap ${className}"><table><thead><tr>${headings.map((text) => `<th scope="col">${esc(text)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
const row = (values) => `<tr>${values.map((text) => `<td>${esc(text)}</td>`).join("")}</tr>`;
const metric = (label, value, foot) => `<article class="metric"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(foot)}</small></article>`;
const cents = (value) => Math.round(value * 100);
const money = (value) => value / 100;
const signed = (value) => `${value > 0 ? "+" : ""}${amount(value)}`;
const sum = (items, key) => items.reduce((total, item) => total + cents(item[key]), 0);

assert.equal(review.accountDays.length, 7);
assert.deepEqual(review.periods.flatMap((period) => period.dates), review.accountDays.map((day) => day.date));
assert.equal(new Set(review.reflections.map((section) => section.id)).size, review.reflections.length);

function reconcileStatement() {
  const prior = JSON.parse(fs.readFileSync(path.resolve(directory, review.opening.source), "utf8"));
  assert.equal(prior.closingCash, review.opening.cash);
  const positions = new Map();
  for (const opening of review.opening.positions) {
    const priorStock = prior.stocks.find((stock) => stock.code === opening.code);
    assert.equal(priorStock.openQty, opening.qty);
    assert.equal(priorStock.openCost, opening.cost);
    positions.set(opening.code, {code: opening.code, name: opening.name, openingQty: opening.qty, openingCost: opening.cost, buyQty: 0, sellQty: 0, buyCost: 0, proceeds: 0, closedCost: 0, openQty: opening.qty, openCost: opening.cost, realized: 0});
  }
  let runningCash = cents(review.opening.cash);
  let previousKey = "";
  const transactions = review.transactions.map((trade) => {
    const key = `${trade.date} ${trade.time}`;
    assert(key > previousKey, `成交顺序异常：${trade.id}`);
    previousKey = key;
    assert(review.accountDays.some((day) => day.date === trade.date));
    assert.equal(cents(trade.qty * trade.price), cents(trade.amount));
    const buying = trade.side === "买入";
    assert(buying || trade.side === "卖出");
    assert(buying ? trade.net < 0 : trade.net > 0);
    const actualFees = buying ? -cents(trade.net) - cents(trade.amount) : cents(trade.amount) - cents(trade.net);
    const feeDifference = actualFees - cents(trade.fee) - cents(trade.tax) - cents(trade.other);
    assert(feeDifference >= 0, `费用差额异常：${trade.id}`);
    runningCash += cents(trade.net);
    if (trade.cash != null) assert.equal(runningCash, cents(trade.cash), `资金不连续：${trade.id}`);
    else assert(amount(money(runningCash)).replaceAll(",", "").startsWith(trade.cashText.replace("…", "")));
    if (!positions.has(trade.code)) positions.set(trade.code, {code: trade.code, name: trade.name, openingQty: 0, openingCost: 0, buyQty: 0, sellQty: 0, buyCost: 0, proceeds: 0, closedCost: 0, openQty: 0, openCost: 0, realized: 0});
    const stock = positions.get(trade.code);
    let realized = 0;
    if (buying) {
      stock.buyQty += trade.qty;
      stock.openQty += trade.qty;
      stock.buyCost = money(cents(stock.buyCost) - cents(trade.net));
      stock.openCost = money(cents(stock.openCost) - cents(trade.net));
    } else {
      assert(stock.openQty >= trade.qty, `缺少期初成本：${trade.code}`);
      // Proportional cost allocation keeps the final sale's remaining cents intact.
      const cost = trade.qty === stock.openQty ? cents(stock.openCost) : Math.round(cents(stock.openCost) * trade.qty / stock.openQty);
      stock.openQty -= trade.qty;
      stock.openCost = money(cents(stock.openCost) - cost);
      stock.sellQty += trade.qty;
      stock.closedCost = money(cents(stock.closedCost) + cost);
      stock.proceeds = money(cents(stock.proceeds) + cents(trade.net));
      realized = cents(trade.net) - cost;
      stock.realized = money(cents(stock.realized) + realized);
    }
    return {...trade, actualFees: money(actualFees), feeDifference: money(feeDifference), reconciledCash: money(runningCash), cashDerived: trade.cash == null, allocatedRealized: money(realized)};
  });
  const totals = (items) => ({
    tradeCount: items.length,
    buyCount: items.filter((trade) => trade.side === "买入").length,
    sellCount: items.filter((trade) => trade.side === "卖出").length,
    buyAmount: money(sum(items.filter((trade) => trade.side === "买入"), "amount")),
    sellAmount: money(sum(items.filter((trade) => trade.side === "卖出"), "amount")),
    turnover: money(sum(items, "amount")),
    fees: money(sum(items, "actualFees")),
    commission: money(sum(items, "fee")),
    stampTax: money(sum(items, "tax")),
    otherFees: money(sum(items, "other")),
    feeDifference: money(sum(items, "feeDifference")),
    netCash: money(sum(items, "net")),
    realized: money(sum(items, "allocatedRealized")),
    lastTradeCash: items.length ? items.at(-1).reconciledCash : null
  });
  const stocks = [...positions.values()].map((stock) => ({...stock, returnRate: stock.closedCost ? stock.realized / stock.closedCost * 100 : null}));
  const result = {
    ...totals(transactions), openingCash: review.opening.cash,
    closingCash: money(runningCash), closingCashDate: transactions.at(-1).date,
    openingCost: money(sum(review.opening.positions, "cost")),
    openCost: money(sum(stocks, "openCost")),
    weeks: review.periods.map((period) => ({...period, ...totals(transactions.filter((trade) => period.dates.includes(trade.date)))})),
    days: review.accountDays.map((day) => ({date: day.date, day: day.day, ...totals(transactions.filter((trade) => trade.date === day.date))})),
    stocks, transactions,
    scope: "截图可见交割及前期成本的含费闭环，不等于本期账户收益。未平仓数量由交割推算，期末持仓与市值待账户截图确认。",
    accountStatus: "pending"
  };
  assert.equal(cents(result.openingCash) + cents(result.netCash), cents(result.closingCash));
  assert.equal(cents(result.realized), cents(result.netCash) + cents(result.openCost) - cents(result.openingCost));
  return result;
}

const summary = reconcileStatement();
const extra = require('./week-2026-10-08-details.cjs')(review, summary, directory);

function executionSummary() {
  const closed = summary.stocks.filter((stock) => stock.sellQty > 0);
  return `<section class="panel" id="execution-summary"><span class="label">Statement Summary</span><h2>两周交割汇总</h2><p>截图筛选区间为10月2日至16日，已见9笔成交，实际日期为10月8日至15日。闽东电力承接<a href="../2026-09-21_2026-09-30/#holdings">上一期9月30日成本</a>；本期心得与交割分别保留来源。</p>
    <div class="summary-grid"><span>买入成交额<b>${amount(summary.buyAmount)}</b></span><span>卖出成交额<b>${amount(summary.sellAmount)}</b></span><span>双边成交额<b>${amount(summary.turnover)}</b></span><span>实际费用合计<b>${amount(summary.fees)}</b></span><span>成交现金净变化<b>${signed(summary.netCash)}</b></span><span>已平仓完整盈亏<b>${signed(summary.realized)}</b></span></div>
    ${table(["周次", "交易日期", "成交笔数", "买入成交额", "卖出成交额", "实际费用", "成交现金净变化"], summary.weeks.map((week) => row([week.label, week.range, `${week.tradeCount}（买${week.buyCount} / 卖${week.sellCount}）`, amount(week.buyAmount), amount(week.sellAmount), amount(week.fees), signed(week.netCash)])).join(""))}
    <h3>已平仓个股</h3>${table(["标的", "卖出股数", "对应含费成本", "卖出净回款", "完整闭环盈亏", "含费收益率", "成本范围"], closed.map((stock) => row([`${stock.name} ${stock.code}`, stock.sellQty, amount(stock.closedCost), amount(stock.proceeds), signed(stock.realized), percent(stock.returnRate), stock.openingQty ? "含9/30买入成本" : "10/8-10/12本期闭环"])).join(""))}
    <p class="scope-note">${esc(summary.scope)} 720.45元与99.09元分别是时代万恒、闽东电力完整持仓的盈亏，不填入每日账户收益表。</p>
    <h3>资金与费用核对</h3><ul class="pending-list"><li>期初可见现金${amount(summary.openingCash)}元，加上成交现金净变化${signed(summary.netCash)}元，等于10月15日末笔成交后余额${amount(summary.closingCash)}元。所有可见完整余额逐笔吻合；此余额不等于期末总资产。</li><li>手续费${amount(summary.commission)}元、印花税${amount(summary.stampTax)}元、原列其他杂费${amount(summary.otherFees)}元；另有沪市成交未单列差额${amount(summary.feeDifference)}元。实际费用按成交金额与发生金额核算，不擅自将差额命名为某一税费。</li><li>10月12日10:28:20余额已由本次新截图确认是10,968.86元，与原先相邻流水补算一致。</li></ul>
    <p class="calendar-source"><a href="data/review.json">原始录入数据</a> · <a href="data/summary.json">汇总与核对数据</a></p>
  </section>`;
}

function holdings() {
  return extra.holdingsHtml();
}

function transactions() {
  return `<section class="panel" id="trades"><span class="label">Transactions</span><h2>本期成交明细</h2><p>按成交时间升序排列，共${summary.tradeCount}笔；手续费、印花税、其他杂费为原图列值，“未单列差额”为发生金额核对差额。仅公开脱敏成交字段，不展示合同、成交编号和券商账户标识。</p>
    ${table(["日期", "时间", "代码", "名称", "方向", "数量", "成交均价", "成交金额", "手续费", "印花税", "其他杂费", "未单列差额", "发生金额", "资金余额", "市场", "交收日期"], summary.transactions.map((trade) => row([trade.date, trade.time, trade.code, trade.name, trade.side, trade.qty, trade.price.toFixed(3), amount(trade.amount), amount(trade.fee), amount(trade.tax), amount(trade.other), amount(trade.feeDifference), signed(trade.net), `${amount(trade.reconciledCash)}${trade.cashDerived ? "（补算）" : ""}`, trade.market, trade.settlementDate])).join(""))}
  </section>`;
}

function reflection() {
  return `<section class="panel" id="second-review" data-status="authored-reflection">
    <span class="label">Second Reflection</span><h2>本期心得总结</h2>
    <p class="lead"><b>${esc(review.title)}</b></p><p>${esc(review.source)}</p><p class="scope-note">${esc(review.scope)}</p>
    <div class="reflection-index">${review.reflections.map((section, i) => `<a href="#reflection-${section.id}"><span>${String(i + 1).padStart(2, "0")}</span>${esc(section.title.split("：")[0])}</a>`).join("")}</div>
    ${review.reflections.map((section, i) => `<article class="reflection-section" id="reflection-${section.id}"><div class="section-number">${String(i + 1).padStart(2, "0")}</div><div><h3>${esc(section.title)}</h3>${section.paragraphs.map((text) => `<p>${esc(text)}</p>`).join("")}</div></article>`).join("")}
  </section>`;
}

function patterns() {
  return `<section class="panel" id="patterns"><span class="label">Trading Patterns</span><h2>四类模式的参与与退出边界</h2>
    ${table(["模式", "入场观察", "仓位定位", "退出与持有", "继续补齐"], review.patterns.map((item) => row([item.name, item.entry, item.position, item.exit, item.pending])).join(""), "prose-table")}
  </section>`;
}

function account() {
  return extra.accountHtml();
}

function daily() {
  return extra.dailyHtml();
}

function sourceRecords() {
  return review.sourceRecords.map((record) => `<details class="record-source"><summary>${esc(record.title)}</summary><figure><a href="${esc(record.path)}" target="_blank" rel="noopener"><img src="${esc(record.path)}" width="${record.width}" height="${record.height}" alt="${esc(record.alt)}" loading="lazy"></a><figcaption>${esc(record.caption)}</figcaption></figure></details>`).join("");
}

function page() {
  return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>2026.10.08 - 2026.10.16 两周交割复盘 · 交割已补</title><style>${baseStyles}
  h1{font-size:42px}h2{font-size:26px}h3{font-size:20px}.page-shell{gap:20px}.hero,.panel{border-radius:0;box-shadow:none;border-width:0 0 1px}.metric{border-radius:8px;box-shadow:none}.hero{align-items:center}.rail a{font-size:12px}.label{border-radius:6px}.scope-note{border-left:3px solid var(--blue);padding:10px 14px;background:#f4f7fc;color:#475569}.period-strip{display:flex;gap:24px;flex-wrap:wrap;margin:18px 0 0;padding-top:14px;border-top:1px solid var(--line)}.period-strip span{font-size:13px;color:var(--muted)}.period-strip b{display:block;color:var(--ink);margin-top:4px}.reflection-index{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0;margin:24px 0 8px;border-top:1px solid var(--line);border-left:1px solid var(--line)}.reflection-index a{display:flex;align-items:center;gap:10px;padding:12px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);font-size:13px;text-decoration:none}.reflection-index a:hover{background:#f4f7fc}.reflection-index span,.section-number{color:var(--red);font-size:12px;font-weight:800;font-variant-numeric:tabular-nums}.reflection-section{display:grid;grid-template-columns:32px minmax(0,1fr);gap:12px;padding:24px 0;border-bottom:1px solid var(--line);scroll-margin-top:20px}.reflection-section:last-child{border-bottom:0;padding-bottom:0}.reflection-section h3{margin:0 0 12px}.reflection-section p{margin:0 0 12px;color:#394457}.reflection-section p:last-child{margin-bottom:0}.section-number{padding-top:5px}.prose-table table{table-layout:fixed;min-width:1000px}.prose-table th,.prose-table td{white-space:normal;text-align:left;vertical-align:top;overflow-wrap:anywhere}.prose-table th:first-child,.prose-table td:first-child{width:140px;font-weight:700}.prose-table td{line-height:1.8}.kiss-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 28px}.kiss-list article{border-top:2px solid var(--line);padding-top:14px}.kiss-list p{margin-bottom:0}.pending-block{border-top:1px solid var(--line);padding:16px 0}.pending-block h3{font-size:18px}.pending-block:last-child{padding-bottom:0}.pending-list{padding-left:22px;display:grid;gap:10px}.pending-list li{overflow-wrap:anywhere}.record-source summary{cursor:pointer;font-weight:700;padding:8px 0}.record-source figure{margin:16px 0 0}.record-source img{display:block;width:100%;height:auto;border:1px solid var(--line)}.record-source figcaption{margin-top:8px;color:var(--muted);font-size:13px}.empty-row{height:76px;text-align:left;color:var(--muted);white-space:normal}.page-foot{display:flex;gap:20px;flex-wrap:wrap;font-size:14px}.page-foot a{color:var(--blue)}.calendar-source{font-size:12px;margin-top:14px}.status-line{font-size:13px;color:var(--muted)}
  @media(max-width:1400px){.rail{position:static;width:min(1180px,calc(100% - 28px));margin:18px auto 0;display:flex;flex-direction:row;flex-wrap:wrap}.rail a{width:auto;padding:8px 12px}}
  @media(max-width:920px){.reflection-index{grid-template-columns:repeat(2,minmax(0,1fr))}h1{font-size:36px}.hero,.panel{padding:22px}.kiss-list{grid-template-columns:1fr}.prose-table th:first-child,.prose-table td:first-child{width:130px}}
  @media(max-width:560px){h1{font-size:30px}h2{font-size:24px}h3{font-size:19px}.hero,.panel{padding:18px}.reflection-section{grid-template-columns:24px minmax(0,1fr);gap:8px}.reflection-index a{padding:10px 8px;gap:7px;font-size:12px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.metric{padding:12px;min-height:100px}.metric strong{font-size:20px}.period-strip{gap:14px 24px}.page-shell,.rail{width:calc(100% - 16px)}}
${extra.styles}.stock-card .source-line{display:block;font-weight:400;border:0;padding:0;margin:12px 0}.stock-card .source-line a{display:inline;font-weight:400}
</style></head><body>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <nav class="rail" aria-label="页面导航"><a href="../weekly-trading-review/">周度主页</a><a href="../">总入口</a><a href="#account">账户与仓位</a><a href="#execution-summary">交割汇总</a><a href="#holdings">期末持仓</a><a href="#profit-loss">盈亏主因</a><a href="#stocks">5分钟买卖点</a><a href="#daily">逐日复盘</a><a href="#second-review">二次心得</a><a href="#patterns">模式边界</a><a href="#kiss">执行纪律</a><a href="#trades">成交明细</a><a href="#missing">资料核对</a></nav>
  <main class="page-shell" id="main-content">
    <section class="hero" id="overview"><div><span class="label">交割已核对 / 收盘估值</span><h1><span class="date-range"><span>2026.10.08 -</span><span>2026.10.16</span></span>两周交割复盘</h1><p>${esc(review.title)}</p><div class="button-row"><a class="button" href="#account">账户收益与仓位</a><a class="button secondary" href="#stocks">5分钟买卖点</a></div><div class="period-strip">${review.periods.map((period) => `<span>${period.label}<b>${period.range} / ${period.dates.length}个交易日</b></span>`).join("")}</div></div><div class="metrics">${metric("本期金额变化（估算）", signed(extra.account.pnl), "现金与持仓收盘市值核算")}${metric("期末权益（估算）", amount(extra.account.endingEquity), "等待券商账户表最终核对")}${metric("已平仓完整盈亏", signed(summary.realized), "含前期成本 / 非账户期间收益")}${metric("平均周仓位（估算）", percent(extra.account.averagePosition), "7个交易日收盘仓位平均")}</div></section>
    ${account()}
    ${executionSummary()}
    ${holdings()}
    ${extra.profitHtml()}
    ${extra.chartsHtml()}
    ${daily()}
    ${reflection()}
    ${patterns()}
    <section class="panel" id="cases"><span class="label">Case Notes</span><h2>口述标的与交割核对</h2><p>以下是心得提及的标的及其讨论角色，候选观察与实际操作分别记录。</p>${table(["标的", "讨论角色", "心得要点", "交割状态"], review.cases.map((item) => row([item.name, item.role, item.note, item.status || "待核对"])).join(""), "prose-table")}</section>
    <section class="panel" id="kiss"><span class="label">KISS</span><h2>本期执行改进</h2><div class="kiss-list">${review.kiss.map((item) => `<article><h3>${esc(item.label)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div></section>
    ${transactions()}
    <section class="panel" id="source-record"><span class="label">Source Record</span><h2>原始交割与盘面记录</h2>${sourceRecords()}<p class="calendar-source">交易日期：10月8日、9日、12日至16日，共7个交易日。<a href="${esc(review.calendarSource)}" target="_blank" rel="noopener">上交所休市安排</a></p></section>
    ${extra.missingHtml()}
    <nav class="page-foot" aria-label="周次导航"><a href="../2026-09-21_2026-09-30/">上一期 09.21-09.30</a><a href="../weekly-trading-review/">全部周报</a></nav>
  </main>
</body></html>`;
}

fs.writeFileSync(path.join(directory, "index.html"), page(), "utf8");
fs.writeFileSync(path.join(directory, "data/summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(`Wrote ${folder}: ${summary.tradeCount} trades, realized ${amount(summary.realized)}, estimated equity ${amount(extra.account.endingEquity)}, PnL ${signed(extra.account.pnl)}.`);
