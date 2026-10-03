const fs = require("fs");
const path = require("path");
const assert = require("node:assert/strict");

const repo = path.resolve(__dirname, "..");
const data = require("./data/weekly-trades-2026-08-16_2026-09-20.json");
const template = fs.readFileSync(path.join(repo, "2026-08-10_2026-08-15", "index.html"), "utf8");
const styles = template.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/[ \t]+$/gm, "").trim();
const cents = (value) => Math.round(value * 100);
const money = (value, signed = false) => `${signed && value > 0 ? "+" : ""}${(value / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const qty = (value) => value.toLocaleString("en-US");
const iso = (date) => `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
const tone = (value) => value > 0 ? "is-profit" : value < 0 ? "is-loss" : "";
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const sum = (rows, field) => rows.reduce((total, row) => total + row[field], 0);
const chronological = (a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
const positions = new Map(data.openingPositions.map((item) => [item.code, [{ qty: item.qty, cost: cents(item.cost), source: item.source }]]));

function snapshot() {
  return [...positions].filter(([, lots]) => lots.length).map(([code, lots]) => ({
    code, name: data.names[code], qty: sum(lots, "qty"), cost: sum(lots, "cost"),
    sources: [...new Set(lots.map((lot) => lot.source))],
  }));
}

let cash = cents(data.openingCash);
const seen = new Set();
const weeks = data.weeks.map((source) => {
  assert.equal(source.trades.length, source.expectedRows);
  const opening = snapshot();
  const openingCash = cash;
  const rows = source.trades.map((values) => {
    assert.equal(values.length, data.columns.length);
    const row = Object.fromEntries(data.columns.map((field, index) => [field, values[index]]));
    const key = `${row.date}/${row.time}/${row.code}`;
    assert(!seen.has(key), `Duplicate trade: ${key}`);
    seen.add(key);
    assert(iso(row.date) >= source.start && iso(row.date) <= source.end, key);
    assert(row.qty > 0 && ["买入", "卖出", "对方卖出"].includes(row.side), key);
    assert(Math.abs(row.amount - row.price * row.qty) < 0.001, `Price/amount mismatch: ${key}`);
    row.isBuy = row.side === "买入";
    assert.equal(row.isBuy, row.net < 0, key);
    row.name = data.names[row.code];
    assert(row.name, `Missing name: ${row.code}`);
    row.market = /^[56]/.test(row.code) ? "沪A" : "深A";
    for (const field of ["amount", "tax", "net", "cash"]) row[field] = cents(row[field]);
    row.commission = cents(data.commissionPerTrade);
    row.otherFees = cents(data.otherFeesPerTrade);
    row.totalFees = row.isBuy ? -row.net - row.amount : row.amount - row.net;
    row.feeDifference = row.totalFees - row.commission - row.tax - row.otherFees;
    assert(row.feeDifference >= 0 && row.feeDifference <= 20, `Fee mismatch: ${key}`);
    row.realized = 0;
    row.matchedCost = 0;
    row.crossWeek = false;
    return row;
  }).sort(chronological);

  // Carry remaining FIFO lots across query ranges; allocate partial-lot costs in cents.
  for (const row of rows) {
    const lots = positions.get(row.code) || [];
    positions.set(row.code, lots);
    if (row.isBuy) {
      lots.push({ qty: row.qty, cost: -row.net, source: `${iso(row.date)} ${row.time}` });
    } else {
      let remaining = row.qty;
      while (remaining > 0 && lots.length) {
        const lot = lots[0];
        const used = Math.min(remaining, lot.qty);
        const usedCost = Math.round(lot.cost * used / lot.qty);
        row.matchedCost += usedCost;
        row.crossWeek ||= lot.source.slice(0, 10) < source.start;
        lot.qty -= used;
        lot.cost -= usedCost;
        remaining -= used;
        if (lot.qty === 0) lots.shift();
      }
      assert.equal(remaining, 0, `Missing opening cost: ${row.code} ${row.date}`);
      row.realized = row.net - row.matchedCost;
    }
    cash += row.net;
  }
  const closing = snapshot();
  const buys = rows.filter((row) => row.isBuy);
  const sells = rows.filter((row) => !row.isBuy);
  const byCode = [...new Set(rows.map((row) => row.code))].map((code) => {
    const stockRows = rows.filter((row) => row.code === code);
    const stockBuys = stockRows.filter((row) => row.isBuy);
    const stockSells = stockRows.filter((row) => !row.isBuy);
    return {
      code, name: data.names[code], count: stockRows.length,
      opening: opening.find((item) => item.code === code), closing: closing.find((item) => item.code === code),
      buyQty: sum(stockBuys, "qty"), sellQty: sum(stockSells, "qty"),
      buyAmount: sum(stockBuys, "amount"), sellAmount: sum(stockSells, "amount"),
      matchedCost: sum(stockSells, "matchedCost"), realized: sum(stockSells, "realized"),
      crossWeek: stockSells.some((row) => row.crossWeek),
    };
  });
  const daily = [...new Set(rows.map((row) => row.date))].map((date) => {
    const dayRows = rows.filter((row) => row.date === date);
    return {
      date, count: dayRows.length,
      buyAmount: sum(dayRows.filter((row) => row.isBuy), "amount"),
      sellAmount: sum(dayRows.filter((row) => !row.isBuy), "amount"),
      fees: sum(dayRows, "totalFees"), netCash: sum(dayRows, "net"), realized: sum(dayRows, "realized"),
    };
  });
  const calculatedCash = cash;
  const cashBalanceDifference = rows.at(-1).cash - calculatedCash;
  cash = rows.at(-1).cash;
  const week = {
    ...source, rows, opening, closing, byCode, daily, openingCash, closingCash: cash, calculatedCash, cashBalanceDifference,
    folder: `${source.start}_${source.end}`,
    label: `${source.start.slice(5).replace("-", ".")}-${source.end.slice(5).replace("-", ".")}`,
    buyCount: buys.length, sellCount: sells.length,
    buyAmount: sum(buys, "amount"), sellAmount: sum(sells, "amount"), turnover: sum(rows, "amount"),
    commission: sum(rows, "commission"), tax: sum(rows, "tax"), feeDifference: sum(rows, "feeDifference"),
    fees: sum(rows, "totalFees"), netCash: sum(rows, "net"), realized: sum(rows, "realized"),
  };
  assert.equal(calculatedCash + sum(closing, "cost") - openingCash - sum(opening, "cost"), week.realized);
  return week;
});
assert.equal(seen.size, 65);

const metric = (label, value, foot = "", className = "") => `<article class="metric"><span>${label}</span><strong class="${className}">${value}</strong><small>${foot}</small></article>`;
const holding = (item) => item ? `${qty(item.qty)} / ${money(item.cost)}` : "0 / 0.00";
const table = (headings, body, className = "") => `<div class="table-wrap ${className}"><table><thead><tr>${headings.map((heading) => `<th>${heading}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
const cells = (values) => `<tr>${values.map((value) => `<td>${value}</td>`).join("")}</tr>`;
const signed = (value) => `<span class="${tone(value)}">${money(value, true)}</span>`;

function renderWeek(week, index) {
  const previous = weeks[index - 1];
  const next = weeks[index + 1];
  const positionRows = [...new Set([...week.opening, ...week.closing].map((item) => item.code))].map((code) => {
    const stock = week.byCode.find((item) => item.code === code);
    return cells([`${code} ${esc(data.names[code])}`, holding(week.opening.find((item) => item.code === code)),
      qty(stock?.buyQty || 0), qty(stock?.sellQty || 0), holding(week.closing.find((item) => item.code === code))]);
  }).join("");
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${week.start} - ${week.end} 周度交割数据</title>
  <style>${styles}
    h1{font-size:42px}h2{font-size:24px}.page-shell{gap:0}.hero,.panel{border-radius:0;box-shadow:none;border-width:0 0 1px;margin-bottom:20px}.metric{border-radius:8px;box-shadow:none}.data-note{max-width:880px}.data-note p:last-child{margin-bottom:0}.data-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin:18px 0}.data-summary div{padding:12px 0;border-bottom:1px solid var(--line)}.data-summary dt{font-size:13px;color:var(--muted)}.data-summary dd{margin:5px 0 0;font-size:20px;font-weight:700;font-variant-numeric:tabular-nums}.week-navigation{display:flex;flex-wrap:wrap;gap:20px;padding:12px 0 24px}.week-navigation a{color:var(--blue)}.table-wrap{border-radius:8px}td{font-variant-numeric:tabular-nums}.plain-note{font-size:13px}.empty-row{text-align:left;color:var(--muted)}
    @media(max-width:1400px){.rail{position:static;width:min(1180px,calc(100% - 28px));margin:18px auto 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.rail a{width:auto}}
    @media(max-width:920px){h1{font-size:34px}.data-summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:560px){h1{font-size:28px}.hero,.panel{padding:18px}.data-summary dd{font-size:18px}}
  </style>
</head>
<body>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <nav class="rail" aria-label="页面导航"><a href="../weekly-trading-review/">周度主页</a><a href="../">总入口</a><a href="#stocks">标的汇总</a><a href="#daily">逐日数据</a><a href="#positions">持仓结转</a><a href="#trades">成交明细</a></nav>
  <main class="page-shell" id="main-content">
    <section class="hero" id="overview">
      <div><span class="label">周度交割数据</span><h1><span class="date-range"><span>${week.start}</span><span>至 ${week.end}</span></span>周度交割复盘</h1><p>查询区间 ${week.start} 至 ${week.end}；截图成交日期 ${iso(week.rows[0].date)} 至 ${iso(week.rows.at(-1).date)}。</p><div class="button-row"><a class="button" href="../weekly-trading-review/">返回周度主页</a><a class="button secondary" href="trades.csv" download>下载成交数据</a>${week.fullReviewFolder ? `<a class="button secondary" href="../${week.fullReviewFolder}/">已有完整复盘</a>` : ""}</div></div>
      <div class="metrics">${metric("成交笔数", week.rows.length, `买入 ${week.buyCount} / 卖出 ${week.sellCount}`)}${metric("已实现盈亏", money(week.realized, true), "FIFO / 含费用及已确认跨周成本", tone(week.realized))}${metric("成交金额", money(week.turnover), "买入额与卖出额合计")}${metric("期末现金余额", money(week.closingCash), "券商资金余额 / 非账户总资产")}</div>
    </section>
    <section class="panel" id="summary"><span class="label">Data Summary</span><h2>交易汇总</h2><dl class="data-summary">
      <div><dt>买入金额</dt><dd>${money(week.buyAmount)}</dd></div><div><dt>卖出金额</dt><dd>${money(week.sellAmount)}</dd></div><div><dt>现金净流入</dt><dd class="${tone(week.netCash)}">${money(week.netCash, true)}</dd></div>
      <div><dt>手续费</dt><dd>${money(week.commission)}</dd></div><div><dt>印花税</dt><dd>${money(week.tax)}</dd></div><div><dt>实际费用合计</dt><dd>${money(week.fees)}</dd></div>
      <div><dt>标的数量</dt><dd>${week.byCode.length}</dd></div><div><dt>期末结转标的</dt><dd>${week.closing.length}</dd></div><div><dt>期末结转成本</dt><dd>${money(sum(week.closing, "cost"))}</dd></div>
    </dl><div class="data-note"><p>已实现盈亏按卖出发生金额减去 FIFO 配对买入成本计算，计入实际扣费。华西股份、秦安股份的期初成本来自 <a href="../2026-08-10_2026-08-15/">08.10-08.15 周报</a>，其余跨周成本按这五周成交连续结转。</p><p>截图“其他杂费”均为 0.00；发生金额与成交额、手续费、印花税之间的差额合计 ${money(week.feeDifference)}，已计入实际费用。现金净流入包含买卖本金；期末现金余额和结转成本不代表账户总资产。账户收益率、仓位及持仓市值未提供。</p>${week.cashBalanceDifference ? `<p>现金余额核对：期初余额加本周成交发生金额为 ${money(week.calculatedCash)}，截图期末余额为 ${money(week.closingCash)}，差额 ${money(week.cashBalanceDifference, true)}，原因未提供。</p>` : ""}</div></section>
    <section class="panel" id="stocks"><span class="label">Symbols</span><h2>标的交割汇总</h2>${table(["标的", "期初数量 / 成本", "买入数量", "买入金额", "买入均价", "卖出数量", "卖出金额", "卖出均价", "已实现盈亏", "跨周成本", "期末数量 / 成本"], week.byCode.map((stock) => cells([
      `${stock.code} ${esc(stock.name)}`, holding(stock.opening), qty(stock.buyQty), money(stock.buyAmount), stock.buyQty ? (stock.buyAmount / 100 / stock.buyQty).toFixed(3) : "--",
      qty(stock.sellQty), money(stock.sellAmount), stock.sellQty ? (stock.sellAmount / 100 / stock.sellQty).toFixed(3) : "--", signed(stock.realized), stock.crossWeek ? "已衔接" : "--", holding(stock.closing),
    ])).join(""))}<p class="plain-note">均价按成交额与数量计算，未含费用；期初和期末成本含买入费用。盈亏归属卖出所在周。</p></section>
    <section class="panel" id="daily"><span class="label">Daily Data</span><h2>逐日交割数据</h2>${table(["成交日期", "成交笔数", "买入金额", "卖出金额", "实际费用", "现金净流入", "已实现盈亏"], week.daily.map((day) => cells([iso(day.date), day.count, money(day.buyAmount), money(day.sellAmount), money(day.fees), signed(day.netCash), signed(day.realized)])).join(""), "compact-table")}</section>
    <section class="panel" id="positions"><span class="label">Position Carry</span><h2>持仓结转数据</h2>${table(["标的", "期初数量 / 成本", "本周买入数量", "本周卖出数量", "期末数量 / 成本"], positionRows || '<tr><td class="empty-row" colspan="5">截图内期初与期末均无结转持仓。</td></tr>', "compact-table")}<p class="plain-note">按已提供成交重建的数量与成本；实际持仓及浮动盈亏仍以持仓记录为准。</p></section>
    <section class="panel" id="trades"><span class="label">Transactions</span><h2>成交明细</h2>${table(["成交日期", "成交时间", "代码", "名称", "操作", "数量", "成交均价", "成交金额", "手续费", "印花税", "其他杂费", "实际费用", "发生金额", "资金余额", "市场", "交收日期"], [...week.rows].reverse().map((row) => cells([
      iso(row.date), row.time, row.code, esc(row.name), `<span class="${row.isBuy ? "is-buy" : "is-sell"}">${row.side}</span>`, qty(row.qty), row.price.toFixed(3), money(row.amount), money(row.commission), money(row.tax), money(row.otherFees), money(row.totalFees), signed(row.net), money(row.cash), row.market, iso(row.date),
    ])).join(""))}</section>
    <nav class="week-navigation" aria-label="周次导航">${previous ? `<a href="../${previous.folder}/">上一周 ${previous.label}</a>` : '<a href="../2026-08-10_2026-08-15/">上一周 08.10-08.15</a>'}${next ? `<a href="../${next.folder}/">下一周 ${next.label}</a>` : ""}<a href="../weekly-trading-review/">全部周报</a></nav>
  </main>
</body>
</html>`;
}

function csv(week) {
  const headings = ["成交日期", "成交时间", "证券代码", "证券名称", "操作", "成交数量", "成交均价", "成交金额", "手续费", "印花税", "其他杂费", "实际费用", "发生金额", "资金余额", "交易市场", "交收日期"];
  const rows = [...week.rows].reverse().map((row) => [iso(row.date), row.time, row.code, row.name, row.side, row.qty, row.price.toFixed(3), ...[row.amount, row.commission, row.tax, row.otherFees, row.totalFees, row.net, row.cash].map((value) => (value / 100).toFixed(2)), row.market, iso(row.date)]);
  return "\uFEFF" + [headings, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n") + "\r\n";
}

for (const [index, week] of weeks.entries()) {
  const directory = path.join(repo, week.folder);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), renderWeek(week, index), "utf8");
  fs.writeFileSync(path.join(directory, "trades.csv"), csv(week), "utf8");
  const summary = {
    range: { start: week.start, end: week.end }, source: data.source, count: week.rows.length,
    moneyUnit: "CNY cents", buyCount: week.buyCount, sellCount: week.sellCount,
    buyAmount: week.buyAmount, sellAmount: week.sellAmount, turnover: week.turnover,
    commission: week.commission, stampTax: week.tax, feeDifference: week.feeDifference, totalFees: week.fees,
    netCash: week.netCash, openingCash: week.openingCash, closingCash: week.closingCash, calculatedCash: week.calculatedCash, cashBalanceDifference: week.cashBalanceDifference, realizedPnl: week.realized,
    accountReturn: null, accountEquity: null, openingPositions: week.opening, closingPositions: week.closing,
    symbols: week.byCode, daily: week.daily,
  };
  fs.writeFileSync(path.join(directory, "trade-summary.json"), JSON.stringify(summary, null, 2) + "\n", "utf8");
  console.log(`${week.folder}: ${week.rows.length} trades; turnover ${money(week.turnover)}; fees ${money(week.fees)}; realized ${money(week.realized, true)}; cash ${money(week.closingCash)}`);
}
