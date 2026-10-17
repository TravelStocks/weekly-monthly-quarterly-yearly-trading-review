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

function executionSummary() {
  const closed = summary.stocks.filter((stock) => stock.sellQty > 0);
  return `<section class="panel" id="execution-summary"><span class="label">Statement Summary</span><h2>两周交割汇总</h2><p>截图筛选区间为10月2日至16日，已见9笔成交，实际日期为10月8日至15日。闽东电力承接<a href="../2026-09-21_2026-09-30/#holdings">上一期9月30日成本</a>；本期心得与交割分别保留来源。</p>
    <div class="summary-grid"><span>买入成交额<b>${amount(summary.buyAmount)}</b></span><span>卖出成交额<b>${amount(summary.sellAmount)}</b></span><span>双边成交额<b>${amount(summary.turnover)}</b></span><span>实际费用合计<b>${amount(summary.fees)}</b></span><span>成交现金净变化<b>${signed(summary.netCash)}</b></span><span>已平仓完整盈亏<b>${signed(summary.realized)}</b></span></div>
    ${table(["周次", "交易日期", "成交笔数", "买入成交额", "卖出成交额", "实际费用", "成交现金净变化"], summary.weeks.map((week) => row([week.label, week.range, `${week.tradeCount}（买${week.buyCount} / 卖${week.sellCount}）`, amount(week.buyAmount), amount(week.sellAmount), amount(week.fees), signed(week.netCash)])).join(""))}
    <h3>已平仓个股</h3>${table(["标的", "卖出股数", "对应含费成本", "卖出净回款", "完整闭环盈亏", "含费收益率", "成本范围"], closed.map((stock) => row([`${stock.name} ${stock.code}`, stock.sellQty, amount(stock.closedCost), amount(stock.proceeds), signed(stock.realized), percent(stock.returnRate), stock.openingQty ? "含9/30买入成本" : "10/8-10/12本期闭环"])).join(""))}
    <p class="scope-note">${esc(summary.scope)} 720.45元与99.09元分别是时代万恒、闽东电力完整持仓的盈亏，不填入每日账户收益表。</p>
    <h3>资金与费用核对</h3><ul class="pending-list"><li>期初可见现金${amount(summary.openingCash)}元，加上成交现金净变化${signed(summary.netCash)}元，等于10月15日末笔成交后余额${amount(summary.closingCash)}元。所有可见完整余额逐笔吻合；此余额不等于期末总资产。</li><li>手续费${amount(summary.commission)}元、印花税${amount(summary.stampTax)}元、原列其他杂费${amount(summary.otherFees)}元；另有沪市成交未单列差额${amount(summary.feeDifference)}元。实际费用按成交金额与发生金额核算，不擅自将差额命名为某一税费。</li><li>10月12日10:28:20余额原图仅显示10968.8…；由4,797.01 + 6,171.85补算为10,968.86元，且与下一笔8,508.86元余额及2,460.00元支出相互吻合。明细中标为“补算”。</li></ul>
    <p class="calendar-source"><a href="data/review.json">原始录入数据</a> · <a href="data/summary.json">汇总与核对数据</a></p>
  </section>`;
}

function holdings() {
  const open = summary.stocks.filter((stock) => stock.openQty > 0);
  return `<section class="panel" id="holdings"><span class="label">Visible Positions</span><h2>交割推算的未平仓持仓</h2><p>按前期可见持仓和本次9笔成交推算，时代万恒、闽东电力已卖完；超声电子和九阳股份未见后续卖出。下表以没有漏单或其他持仓变动为前提，等待10月16日期末账户确认。</p>
    ${table(["代码", "名称", "可见未平仓股数", "含费成本", "含费单位成本", "期末市值", "浮动盈亏"], open.map((stock) => row([stock.code, stock.name, stock.openQty, amount(stock.openCost), (stock.openCost / stock.openQty).toFixed(3), "待补", "待补"])).join(""))}
    <p class="status-line">合计含费成本${amount(summary.openCost)}元。最新可见现金${amount(summary.closingCash)}元为10月15日成交后余额；期末总资产与仓位需使用持仓市值及账户记录核对，不能用买入成本代替市值。</p>
  </section>`;
}

function transactions() {
  return `<section class="panel" id="trades"><span class="label">Transactions</span><h2>本期成交明细</h2><p>按成交时间升序排列，共${summary.tradeCount}笔；手续费、印花税、其他杂费为原图列值，“未单列差额”为发生金额核对差额。合同编号及成交编号在原图中被截断，保留在原图中。</p>
    ${table(["日期", "时间", "代码", "名称", "方向", "股数", "成交均价", "成交金额", "手续费", "印花税", "其他杂费", "未单列差额", "发生金额", "资金余额", "市场", "交收日期"], summary.transactions.map((trade) => row([trade.date, trade.time, trade.code, trade.name, trade.side, trade.qty, trade.price.toFixed(3), amount(trade.amount), amount(trade.fee), amount(trade.tax), amount(trade.other), amount(trade.feeDifference), signed(trade.net), `${amount(trade.reconciledCash)}${trade.cashDerived ? "（补算）" : ""}`, trade.market, trade.settlementDate])).join(""))}
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
  return `<section class="panel" id="account"><span class="label">Account</span><h2>账户收益与仓位</h2><p>交割已录入；每日账户收益、仓位和权益尚未提供。已平仓完整盈亏与成交现金净变化均不代替账户期间收益。</p>
    <div class="summary-grid">${["本期账户收益", "本期收益率", "平均仓位", "期末总资产", "最大盈利日", "最大亏损日"].map((label) => `<span>${label}<b>待补</b></span>`).join("")}</div>
    ${table(["日期", "星期", "收益金额", "收益率", "仓位", "当前总金额"], review.accountDays.map((day) => row([day.date, day.day, amount(day.pnl), percent(day.returnRate), percent(day.position), amount(day.equity)])).join(""))}
  </section>`;
}

function daily() {
  const notes = {
    "2026-10-08": "对应时代万恒首笔参与，后续与首笔仓位反思对照。",
    "2026-10-09": "对应时代万恒第二笔加仓；精确账户仓位待账户表。",
    "2026-10-12": "时代、闽东退出日期已确认；六板对应关系与盘中最高浮盈仍待行情核验。",
    "2026-10-14": "超声电子趋势抱团买入已确认，后续持有结果待补。",
    "2026-10-15": "九阳两笔买入已确认；与此前高位退出心得分开记录。"
  };
  return `<section class="panel" id="daily"><span class="label">Daily Review</span><h2>逐日交割与心得对应</h2><p>按交割确认实际操作日期。截图没有成交行的日期标为“截图无成交记录”，不据此填写账户盈亏为零。</p>
    ${table(["日期", "星期", "当日买卖", "成交现金净变化", "末笔成交后余额", "心得对应"], summary.days.map((day) => {
      const trades = summary.transactions.filter((trade) => trade.date === day.date);
      const detail = trades.map((trade) => `${trade.time} ${trade.name}${trade.side}${trade.qty}股 @ ${trade.price.toFixed(3)}`).join("；");
      const last = trades.at(-1);
      return row([day.date, day.day, detail || "截图无成交记录", signed(day.netCash), last ? `${amount(last.reconciledCash)}${last.cashDerived ? "（补算）" : ""}` : "无成交行", notes[day.date] || "心得仍按主题保留，未强行分配日期。"]);
    }).join(""), "prose-table")}
  </section>`;
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
</style></head><body>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <nav class="rail" aria-label="页面导航"><a href="../weekly-trading-review/">周度主页</a><a href="../">总入口</a><a href="#execution-summary">交割汇总</a><a href="#second-review">心得总结</a><a href="#patterns">模式边界</a><a href="#cases">标的回看</a><a href="#kiss">执行改进</a><a href="#account">账户</a><a href="#holdings">可见持仓</a><a href="#daily">逐日核对</a><a href="#trades">成交明细</a><a href="#missing">后续待补</a></nav>
  <main class="page-shell" id="main-content">
    <section class="hero" id="overview"><div><span class="label">${esc(review.status)}</span><h1><span class="date-range"><span>2026.10.08 -</span><span>2026.10.16</span></span>两周交割复盘</h1><p>${esc(review.title)}</p><div class="button-row"><a class="button" href="#execution-summary">查看交割汇总</a><a class="button secondary" href="#second-review">心得总结</a></div><div class="period-strip">${review.periods.map((period) => `<span>${period.label}<b>${period.range} / ${period.dates.length}个交易日</b></span>`).join("")}</div></div><div class="metrics">${metric("心得状态", "已整理", `${review.reflections.length}个主题 / ${review.patterns.length}类模式`)}${metric("成交笔数", `${summary.tradeCount}笔`, `买${summary.buyCount}笔 / 卖${summary.sellCount}笔`)}${metric("已平仓完整盈亏", signed(summary.realized), "含前期成本 / 非账户期间收益")}${metric("最新成交后现金", amount(summary.closingCash), "截至10月15日 / 非总资产")}</div></section>
    ${executionSummary()}
    ${reflection()}
    ${patterns()}
    <section class="panel" id="cases"><span class="label">Case Notes</span><h2>口述标的与交割核对</h2><p>以下是心得提及的标的及其讨论角色，候选观察与实际操作分别记录。</p>${table(["标的", "讨论角色", "心得要点", "交割状态"], review.cases.map((item) => row([item.name, item.role, item.note, item.status || "待核对"])).join(""), "prose-table")}</section>
    <section class="panel" id="kiss"><span class="label">KISS</span><h2>本期执行改进</h2><div class="kiss-list">${review.kiss.map((item) => `<article><h3>${esc(item.label)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div></section>
    ${account()}
    ${holdings()}
    ${daily()}
    ${transactions()}
    <section class="panel" id="source-record"><span class="label">Source Record</span><h2>原始交割与盘面记录</h2>${sourceRecords()}<p class="calendar-source">交易日期：10月8日、9日、12日至16日，共7个交易日。<a href="${esc(review.calendarSource)}" target="_blank" rel="noopener">上交所休市安排</a></p></section>
    <section class="panel" id="missing"><span class="label">To Fill</span><h2>后续待补内容</h2><div class="pending-block"><h3>账户资料与盘面核对</h3><ul class="pending-list"><li>本次9笔交割已录入；闽东电力跨期成本已接上，所有可见完整资金余额核对一致。</li><li>七个交易日的收益金额、收益率、仓位、当前总金额，以及期间入金、出金等非成交资金变动记录。</li><li>10月16日期末账户截图，用于确认超声电子100股、九阳股份200股是否为全部持仓，以及期末市值、现金和总资产。</li><li>重点标的对应日期的真实走势、板位及盘面反馈，用于核对六板退出、卡位先后与利润回吐的具体时间。</li></ul></div><div class="pending-block"><h3>口述表述待核对</h3><ul class="pending-list">${review.pendingClarifications.map((text) => `<li>${esc(text)}</li>`).join("")}</ul></div></section>
    <nav class="page-foot" aria-label="周次导航"><a href="../2026-09-21_2026-09-30/">上一期 09.21-09.30</a><a href="../weekly-trading-review/">全部周报</a></nav>
  </main>
</body></html>`;
}

fs.writeFileSync(path.join(directory, "index.html"), page(), "utf8");
fs.writeFileSync(path.join(directory, "data/summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(`Wrote ${folder}/index.html and data/summary.json: ${summary.tradeCount} trades, realized ${amount(summary.realized)}, latest cash ${amount(summary.closingCash)}; daily account data remains pending.`);
