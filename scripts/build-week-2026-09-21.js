const fs = require("fs");
const path = require("path");
const assert = require("node:assert/strict");

const repo = path.resolve(__dirname, "..");
const weekDir = path.join(repo, "2026-09-21_2026-09-30");
const config = JSON.parse(fs.readFileSync(path.join(weekDir, "data/config.json"), "utf8"));
const statement = JSON.parse(fs.readFileSync(path.join(weekDir, "data/statement.json"), "utf8"));
const startDate = config.start.replaceAll("-", "");
const endDate = config.end.replaceAll("-", "");
const trades = statement.filter(row => row.date >= startDate && row.date <= endDate);
const referenceTrades = statement.filter(row => row.date < startDate);
const openingByCode = new Map(config.openingLots.map(lot => [lot.code, lot]));
const openingCost = config.openingLots.reduce((total, lot) => total + lot.cost, 0);
const week = {
  folder: config.folder, rangeText: "2026.09.21 - 2026.09.30",
  tradeRangeText: "2026.09.21 - 2026.09.30", label: "09.21-09.30",
  status: "两周合并初版 / 7个交易日",
  title: "内蒙新华分批兑现，前期西陇亏损与后续试错抵消盈利",
  subtitle: "两周合并记录7个交易日、21笔成交与7只标的。四天每日操作反思已摘编；账户日收益、期末持仓确认和二次反思待补。",
};
const ignoredOrders = [];
const sourceData = JSON.parse(fs.readFileSync(path.join(weekDir, "data/daily-reviews.json"), "utf8"));
const dailyReviews = Object.fromEntries(sourceData.reviews.map(row => [row.date.replaceAll("-", ""), row]));
const accountDays = config.accountDays;
const dailyNotes = [
  {date:"20260921",day:"周一",theme:"退出前期仓位，切入内蒙新华",
    action:"卖出前期科创半导200份、西陇科学1,000股；买入内蒙新华200股，尾盘买入科创半导1,400份。",
    review:"当天闭环-353.88元包含前期买入后的全部价差，不能作为当天账户亏损。西陇科学卖出与内蒙新华开仓的当时想法，网站暂未找到。"},
  {date:"20260922",day:"周二",theme:"内蒙新华加仓，ETF小仓来回",
    action:"内蒙新华两笔加400股，累计600股；卖出科创半导1,400份，随后两笔买入500份。",
    review:"日记肯定传媒/AI梯队、一字强度与承接确认，也反思重仓前监管距离和最大亏损未量化。日记的“ETF观察仓”与个股高位仓位要分开评估。",
    kiss:[["Keep 保持","只做主线前排和有梯队支撑的核心；ETF先试仓，再看承接。"],["Improve 改进","最大亏损、减仓点与条件单触发逻辑要在高位加仓前数字化。"],["Start 启动","结合监管反馈、题材前排、自身量价三层验证，不把题材高潮等同于低风险。"],["Stop 停止","不在缺乏梯队和带动性的后排接力，不把科技早盘冲高直接当主升。"]]},
  {date:"20260923",day:"周三",theme:"内蒙新华条件单兑现，南华生物试仓",
    action:"卖出科创半导500份；内蒙新华600股分三笔卖完；南华生物在12.91、12.83元各买100股。",
    review:"正文明确肯定内蒙新华三组条件单退出，避免恐慌卖出或执着最高点。南华生物走弱后停买，但医药高标地位无法抵消板块退潮，退出条件仍待量化。",
    kiss:[["Keep 保持","保留多空分析、三组条件单分批兑现、退潮期小仓试错。"],["Improve 改进","把南华生物的“走弱停买”补成明确的减仓与退出触发条件。"],["Start 启动","先处理旧仓，再核对题材回流、量能与负反馈；写清最大可接受亏损。"],["Stop 停止","不把医药最高标、均线承接或反包预期当作确定性买点。"]]},
  {date:"20260924",day:"周四",theme:"医药反核与传媒唯一性小仓试错",
    action:"继续持有南华生物200股；买入哈药股份100股、天威视讯100股，持三只票过中秋假期。",
    review:"正文将哈药反核列为入场质量偏差，原因是板块强回流前置条件不足；优点是错误后不补仓。天威的唯一性与换手是参与理由，但市场性、持续性和封单质量仍不足。",
    kiss:[["Keep 保持","保持同梯队唯一性、小仓确认与判断错误后不加码。"],["Improve 改进","把深水、快速拉回、反核成功写成价格、时间和量能条件。"],["Start 启动","每只持仓写明触发、动作、失效、仓位上限和最大亏损；反核先检查板块。"],["Stop 停止","不把单票回封等同于题材回流，不补弱，不以可能反包替代退出纪律。"]]},
  {date:"20260928",day:"周一",theme:"三只试错票退出",
    action:"09:30卖出南华生物200股，09:31卖出天威视讯100股，10:07卖出哈药股份100股。",
    review:"三票合计含费亏损245.04元。截图可见仓位在这天退出；卖出前的触发条件、执行速度和实际情绪待补，不能只凭成交时间推断。"},
  {date:"20260929",day:"周二",theme:"空仓等待，保留下一次出手机会",
    action:"本次截图没有成交；当日日记明确记录空仓。",
    review:"原文肯定空仓克制，提醒情绪缓和不等于新周期确认。纪律重点是不做节前低胜率套利，后续只按触发条件观察核心。",
    kiss:[["Keep 保持","保留空仓纪律、核心前排与不做后排的原则。"],["Improve 改进","参与前补齐仓位、失败条件与最大亏损。"],["Start 启动","把候选题材第一次分化写成触发卡，核对核心转强和后排助攻。"],["Stop 停止","停止中位接力、普通超跌反包、纯套利和节前频繁出手。"]]},
  {date:"20260930",day:"周三",theme:"节前尾盘新开闽东电力",
    action:"14:56:59以17.09元买入闽东电力100股，含费成本1,714.00元；截图最后现金8,435.32元。",
    review:"这是本期的新仓，不与9/15至9/17已结束的闽东交易混算。买入逻辑、跨长假持仓预案和主观反思待补。"},
];

const archiveWeeks = [
  { label: "04.20-04.24", folder: "2026-04-20_2026-04-24", pnl: "+1,616.89", pct: "+5.50%", equity: "31,027.99", note: "正收益样本，账户高点。" },
  { label: "05.08-05.16", folder: "2026-05-08_2026-05-16", pnl: "-4,482.26", pct: "-14.45%", equity: "26,545.73", note: "大回撤周。" },
  { label: "05.18-05.22", folder: "2026-05-15_2026-05-22", pnl: "-1,553.76", pct: "-5.85%", equity: "24,991.97", note: "亏损继续收敛中。" },
  { label: "05.25-05.29", folder: "2026-05-25_2026-05-29", pnl: "-1,362.23", pct: "-5.45%", equity: "23,629.74", note: "模式仍在修正。" },
  { label: "06.01-06.05", folder: "2026-06-01_2026-06-05", pnl: "-31.00", pct: "-0.13%", equity: "23,598.74", note: "接近持平。" },
  { label: "06.08-06.12", folder: "2026-06-08_2026-06-12", pnl: "-466.00", pct: "-1.97%", equity: "22,879.00", note: "轻亏周。" },
  { label: "06.15-06.20", folder: "2026-06-15_2026-06-20", pnl: "-299.00", pct: "-1.31%", equity: "22,567.00", note: "继续小亏。" },
  { label: "06.22-06.26*", folder: "2026-06-22_2026-06-26", pnl: "-4,839.42", pct: "-21.44%", equity: "暂估 / 市值17,671.22", note: "暂估口径周。" },
  { label: "06.29-07.04", folder: "2026-06-29_2026-07-04", pnl: "-1,741.00", pct: "-9.85%", equity: "待校准", note: "亏损收敛但仍未扭转。" },
  { label: "07.06-07.10", folder: "2026-07-06_2026-07-10", pnl: "-262.00", pct: "-1.65%", equity: "15,596.00", note: "三冰反核做对，科技ETF择时暴露问题。" },
  { label: "07.10-07.18", folder: "2026-07-10_2026-07-18", pnl: "账户待补", pct: "待补", equity: "待补", note: "截图跨周补档；半导ETF亏损闭环，哈药股份盈利闭环。" },
  { label: "07.20-07.24", folder: "2026-07-20_2026-07-24", pnl: "+1,816.40", pct: "日度见表", equity: "17,648.65", note: "账户日收益已补；手续费与期末持仓继续待校准。" },
  { label: "07.24-08.01", folder: "2026-07-24_2026-08-01", pnl: "账户待补", pct: "待补", equity: "待补", note: "截图跨周补档；立新能源二次参与亏损，一鸣食品跨周试错。" },
  { label: "07.31-08.08", folder: "2026-07-31_2026-08-08", pnl: "账户待补", pct: "待补", equity: "待补", note: "截图跨周补档；半导ETF小赚闭环，风范股份持仓待验证。" },
  { label: "08.10-08.15", folder: "2026-08-10_2026-08-15", pnl: "+1,560.94", pct: "+12.98%", equity: "13,594.00", note: "二次反思已补；期末持仓与风范成本待补。" },
  { label: "08.31-09.04", folder: "2026-08-31_2026-09-04", pnl: "账户待补", pct: "待补", equity: "待补", note: "成交截图草稿；账户日收益、期末持仓、历史成本和二次反思待补。" },
  { label: "09.07-09.11", folder: "2026-09-07_2026-09-11", pnl: "账户待补", pct: "待补", equity: "待补", note: "17笔成交初版；闭环-541.69，桂林旅游留仓1,000股；账户与二次反思待补。" },
  { label:week.label, folder:week.folder, pnl:"账户待补", pct:"待补", equity:"待补", note:"两周7个交易日合并；含前期成本的闭环-221.06元，期末闽东电力100股。账户与二次反思待补。" },
];

const secids = Object.fromEntries(config.codes.map(code=>[code,`${/^[56]/.test(code) ? "1" : "0"}.${code}`]));

function dailyPage(dateLabel, nextLabel) {
  return encodeURI(`https://travelstocks.github.io/daily-trading-review/pages/章盟主式超短全景复盘（${dateLabel}）+ ${nextLabel}个股板块预案 - AI文档.html`).replace(/\+/g, "%2B");
}

const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFmt = new Intl.NumberFormat("en-US");

function money(value, options = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) return value ?? "待补";
  const sign = options.sign && value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${fmt.format(Math.abs(value))}`;
}

function rawMoney(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return value ?? "待补";
  return fmt.format(value);
}

function qty(value) {
  return intFmt.format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(date) {
  return `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6, 8)}`;
}

function shortDate(date) {
  return `${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

function isoDate(date) {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + row[field], 0);
}

function sortChronological(rows) {
  return [...rows].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

function sortReverseChronological(rows) {
  return [...rows].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
}

function groupByCode(rows) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.code)) {
      grouped.set(row.code, {
        code: row.code,
        name: row.name,
        buyQty: 0,
        sellQty: 0,
        buyAmount: 0,
        sellAmount: 0,
        buyCash: 0,
        sellCash: 0,
        rows: [],
      });
    }
    const item = grouped.get(row.code);
    item.rows.push(row);
    if (row.sideType === "buy") {
      item.buyQty += row.qty;
      item.buyAmount += row.amount;
      item.buyCash += Math.abs(row.net ?? row.amount);
    } else {
      item.sellQty += row.qty;
      item.sellAmount += row.amount;
      item.sellCash += row.net ?? row.amount;
    }
  }

  return [...grouped.values()].map((item) => {
    const fifo = fifoByCode(item.rows);
    return {
      ...item,
      cashDiff: item.sellAmount - item.buyAmount,
      netQty: item.buyQty - item.sellQty,
      avgBuy: item.buyQty ? item.buyAmount / item.buyQty : 0,
      avgSell: item.sellQty ? item.sellAmount / item.sellQty : 0,
      realized: fifo.realized,
      openCost: fifo.openCost,
      openQty: fifo.openQty,
      closedCost: fifo.closedCost,
      realizedByDate: fifo.realizedByDate,
      openingCost: openingByCode.get(item.code)?.cost || 0,
    };
  }).sort((a, b) => {
    const lastA = a.rows.map((row) => `${row.date}${row.time}`).sort().at(-1);
    const lastB = b.rows.map((row) => `${row.date}${row.time}`).sort().at(-1);
    return lastB.localeCompare(lastA);
  });
}

function groupByDate(rows) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.date)) {
      grouped.set(row.date, { date: row.date, buyAmount: 0, sellAmount: 0, buyQty: 0, sellQty: 0, turnover: 0, netCash: 0, rows: [] });
    }
    const item = grouped.get(row.date);
    item.rows.push(row);
    item.turnover += row.amount;
    item.netCash += row.net ?? (row.sideType === "buy" ? -row.amount : row.amount);
    if (row.sideType === "buy") {
      item.buyAmount += row.amount;
      item.buyQty += row.qty;
    } else {
      item.sellAmount += row.amount;
      item.sellQty += row.qty;
    }
  }
  return grouped;
}

function fifoByCode(rows) {
  const opening = openingByCode.get(rows[0].code);
  const lots = opening ? [{ qty: opening.qty, cost: Math.round(opening.cost * 100) }] : [];
  let realizedCents = 0, closedCostCents = 0;
  const realizedByDate = {};
  for (const row of sortChronological(rows)) {
    const netCents = Math.round(row.net * 100);
    if (row.sideType === "buy") {
      lots.push({ qty: row.qty, cost: -netCents });
      continue;
    }
    let remaining = row.qty, matchedCost = 0;
    while (remaining > 0) {
      const lot = lots[0];
      assert.ok(lot, "Missing opening cost: " + row.code);
      const used = Math.min(remaining, lot.qty);
      const cost = Math.round(lot.cost * used / lot.qty);
      lot.cost -= cost; lot.qty -= used; remaining -= used; matchedCost += cost;
      if (!lot.qty) lots.shift();
    }
    const gain = netCents - matchedCost;
    realizedCents += gain; closedCostCents += matchedCost;
    realizedByDate[row.date] = (realizedByDate[row.date] || 0) + gain / 100;
  }
  return { realized: realizedCents / 100, closedCost: closedCostCents / 100, realizedByDate,
    openQty: lots.reduce((n,l)=>n+l.qty,0), openCost: lots.reduce((n,l)=>n+l.cost,0)/100 };
}

const buyRows = trades.filter((row) => row.sideType === "buy");
const sellRows = trades.filter((row) => row.sideType === "sell");
const turnover = sum(trades, "amount");
const buyAmount = sum(buyRows, "amount");
const sellAmount = sum(sellRows, "amount");
const feeTotal = trades.reduce((total, row) => total + (row.fee || 0), 0);
const taxTotal = trades.reduce((total, row) => total + (row.tax || 0), 0);
const netCash = trades.reduce((total, row) => total + (row.net ?? (row.sideType === "buy" ? -row.amount : row.amount)), 0);
const byCode = groupByCode(trades);
const stockByCode = new Map(byCode.map((stock) => [stock.code, stock]));
const dailyStats = groupByDate(trades);
const visibleRealized = byCode.reduce((total, item) => total + item.realized, 0);
const openCost = byCode.reduce((total, item) => total + item.openCost, 0);
const openPositions = byCode.filter((item) => item.openQty > 0);
const accountByDate = new Map(accountDays.map((day) => [day.date, day]));
const knownAccountDays = accountDays.filter((day) => typeof day.pnl === "number");
const accountPnlTotal = knownAccountDays.reduce((total, day) => total + day.pnl, 0);
const accountReturnSum = (accountDays.reduce((total, day) => total * (1 + (typeof day.returnRate === "number" ? day.returnRate : 0) / 100), 1) - 1) * 100;
const finalAccountDay = [...accountDays].reverse().find((day) => typeof day.equity === "number");
const finalEquity = finalAccountDay?.equity ?? null;
const finalPosition = finalAccountDay?.position ?? null;
const maxDailyPnl = Math.max(...knownAccountDays.map((day) => Math.abs(day.pnl || 0)), 1);
const positionDays = accountDays.filter((day) => typeof day.position === "number");
const avgPosition = positionDays.length ? positionDays.reduce((total, day) => total + day.position, 0) / positionDays.length : null;
const bestAccountDay = knownAccountDays.length ? knownAccountDays.reduce((best, day) => (day.pnl > best.pnl ? day : best), knownAccountDays[0]) : null;
const worstAccountDay = knownAccountDays.length ? knownAccountDays.reduce((worst, day) => (day.pnl < worst.pnl ? day : worst), knownAccountDays[0]) : null;
const finalCash = sortReverseChronological(trades).find((row) => typeof row.cash === "number")?.cash ?? null;

const accountPnlLabel = knownAccountDays.length ? money(accountPnlTotal, { sign: true }) : "待补";
const accountReturnLabel = knownAccountDays.length ? pct(accountReturnSum) : "待补";
const finalEquityLabel = finalEquity === null ? "待补" : rawMoney(finalEquity);
const finalPositionLabel = typeof finalPosition === "number" ? `${finalPosition.toFixed(2)}%` : "待补";
const avgPositionLabel = typeof avgPosition === "number" ? `${avgPosition.toFixed(2)}%` : "待补";
const bestWorstLabel = bestAccountDay && worstAccountDay
  ? `${bestAccountDay.day} ${money(bestAccountDay.pnl, { sign: true })} / ${worstAccountDay.day} ${money(worstAccountDay.pnl, { sign: true })}`
  : "待补";

function classByValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return value > 0 ? "is-profit" : value < 0 ? "is-loss" : "";
}

function actionClass(sideType) {
  return sideType === "buy" ? "is-buy" : "is-sell";
}

function pct(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "待补";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

async function fetchTrend(code) {
  const file = path.join(weekDir, "data", code + "-5m.json");
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return data.bars.filter(bar => bar.date >= (openingByCode.has(code) ? "2026-09-17" : config.start) && bar.date <= config.end);
}

function renderTrendSvg(stock, bars) {
  if (!bars.length) return '<div class="chart-empty"><b>5分钟K线待补</b><span>没有本周有效行情，成交明细仍保留。</span></div>';
  const width = 1200, height = 360, left = 62, right = 24, top = 58, bottom = 52;
  const values = [...bars.flatMap(b => [b.low, b.high]), ...stock.rows.map(r => r.price)];
  const min = Math.min(...values), max = Math.max(...values), pad = Math.max((max-min)*0.15, max*0.015);
  const low = min-pad, high = max+pad, w = width-left-right, h = height-top-bottom;
  const x = index => left + (index+0.5)/bars.length*w;
  const y = price => top+(high-price)/(high-low)*h;
  const candleW = Math.max(1.5, w/bars.length*0.64);
  const grid = Array.from({length:5}, (_,i) => {
    const p = low+(high-low)*i/4;
    return '<line x1="' + left + '" x2="' + (width-right) + '" y1="' + y(p) + '" y2="' + y(p) + '" stroke="#e2e7ed"/><text x="50" y="' + (y(p)+4) + '" text-anchor="end" fill="#667085" font-size="12">' + p.toFixed(2) + '</text>';
  }).join('');
  const dayLabels = bars.map((b,i) => i===0 || bars[i-1].date!==b.date ? '<line x1="' + x(i) + '" x2="' + x(i) + '" y1="' + top + '" y2="' + (height-bottom) + '" stroke="#dfe4ea" stroke-dasharray="3 5"/><text x="' + x(i) + '" y="' + (height-20) + '" fill="#667085" font-size="13">' + b.date.slice(5) + '</text>' : '').join('');
  const candles = bars.map((b,i) => {
    const color = b.close>=b.open ? '#c2412d' : '#14845f';
    return '<g class="candle"><title>' + b.dt + ' 开 ' + b.open.toFixed(2) + ' 高 ' + b.high.toFixed(2) + ' 低 ' + b.low.toFixed(2) + ' 收 ' + b.close.toFixed(2) + '</title><line x1="' + x(i) + '" x2="' + x(i) + '" y1="' + y(b.high) + '" y2="' + y(b.low) + '" stroke="' + color + '"/><rect x="' + (x(i)-candleW/2) + '" y="' + Math.min(y(b.open),y(b.close)) + '" width="' + candleW + '" height="' + Math.max(1,Math.abs(y(b.open)-y(b.close))) + '" style="fill:' + color + '"/></g>';
  }).join('');
  const labelPositions = [];
  const markers = sortChronological(stock.rows).map((row,i) => {
    // A bar timestamp is its interval end; 09:32 belongs to the 09:35 bar.
    const index = bars.findIndex(b => b.date===isoDate(row.date) && b.time>=row.time.slice(0,5));
    if(index<0) return '';
    const px=x(index), py=y(row.price), buy=row.sideType==='buy', color=buy?'#c2412d':'#1d4ed8';
    const label=(row.reference?'期初B':buy?'B':'S')+(i+1);
    let lx=px, ly=py;
    for (let attempt=0; attempt<36; attempt++) {
      lx=Math.max(left+12,Math.min(width-right-12,px+[0,30,-30][attempt%3]));
      ly=Math.max(top-20,Math.min(height-bottom-8,py+(buy?1:-1)*(26+Math.floor(attempt/3)*20)));
      if (!labelPositions.some(p=>Math.abs(p.x-lx)<28 && Math.abs(p.y-ly)<18)) break;
    }
    labelPositions.push({x:lx,y:ly});
    const points=buy ? px+','+(py-5)+' '+(px-5)+','+(py+4)+' '+(px+5)+','+(py+4) : px+','+(py+5)+' '+(px-5)+','+(py-4)+' '+(px+5)+','+(py-4);
    return '<g class="trade-marker ' + row.sideType + '" data-time="' + row.date+' '+row.time + '"><title>' + label + ' ' + formatDate(row.date)+' '+row.time+' '+row.side+' '+row.price.toFixed(row.code.startsWith('5') ? 3 : 2)+'元 / '+row.qty+'股</title><line x1="'+px+'" x2="'+lx+'" y1="'+py+'" y2="'+ly+'" stroke="'+color+'" stroke-dasharray="2 3"/><polygon points="'+points+'" fill="'+color+'" stroke="#fff" stroke-width="1"/><text x="'+lx+'" y="'+ly+'" text-anchor="middle">'+label+'</text></g>';
  }).join('');
  return '<svg class="stock-chart" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="'+stock.name+' 本期5分钟K线及买卖点"><rect width="'+width+'" height="'+height+'" style="fill:#fff"/><text x="'+left+'" y="23" font-size="14" fill="#17202a">5分钟K线 · 不复权 · '+bars.length+'根</text>'+grid+dayLabels+candles+markers+'</svg>';
}

function metricCard(label, value, foot, className = "") {
  return `<article class="metric"><span>${label}</span><strong class="${className}">${value}</strong><small>${foot}</small></article>`;
}

function isHistoricalSellOnly(stock) {
  return stock.sellQty > 0 && stock.buyQty === 0;
}

function realizedText(stock) {
  return money(stock.realized, { sign: true });
}

function realizedClass(stock) {
  return classByValue(stock.realized);
}

function chartRows(stock) {
  const reference = openingByCode.has(stock.code) ? referenceTrades.filter(r=>r.code===stock.code && r.sideType==="buy" && openingByCode.get(stock.code).dates.includes(r.date)).map(r=>({...r,reference:true})) : [];
  return sortChronological([...reference,...stock.rows]);
}

function renderStockCards(charts) {
  return byCode.map(stock => {
    const markers = chartRows(stock).map((r,i) => '<span class="trade-point '+actionClass(r.sideType)+'"><b>'+(r.reference?'期初B':r.sideType==='buy'?'B':'S')+(i+1)+'</b> '+shortDate(r.date)+' '+r.time+' '+r.side+'<strong>'+r.price.toFixed(r.code.startsWith('5')?3:2)+' / '+qty(r.qty)+(r.code.startsWith('5')?'份':'股')+'</strong></span>').join('');
    return '<article class="stock-card" id="stock-'+stock.code+'"><div class="stock-card-head"><div><span class="code">'+stock.code+'</span><h3>'+stock.name+'</h3></div><span class="chip">本期'+stock.rows.length+'笔</span></div><div class="stock-metrics"><span>本期买入<b>'+qty(stock.buyQty)+'</b></span><span>本期卖出<b>'+qty(stock.sellQty)+'</b></span><span>闭环盈亏 / 收益率<b class="'+classByValue(stock.realized)+'">'+realizedText(stock)+' / '+stockPctFigure(stock.code)+'</b></span><span>期末可见数量<b>'+qty(stock.openQty)+'</b></span></div><p>'+stockNote(stock)+'</p><div class="chart-heading"><b>5分钟K线买卖点</b><span><i class="is-buy">▲ 买入</i> <i class="is-sell">▼ 卖出</i></span></div><div class="chart-frame">'+charts[stock.code]+'</div><div class="trade-points">'+markers+'</div><p class="source-line"><small>东方财富历史5分钟K线，不复权；按实际成交价标记。“期初B”仅作成本来源，不计本期笔数。<a href="./data/'+stock.code+'-5m.json">行情记录</a></small></p></article>';
  }).join('');
}

function stockNote(stock) {
  const notes = {
    "002584":"9/17买400股、9/18买600股，含费成本10,094.00元；9/21全部卖出到账9,750.12元，闭环-343.88元（-3.41%）。这是前期建仓后的完整亏损，不能全部归到9/21当日。买入理由和退出情绪缺原文，暂不推断。",
    "588170":"期初200份卖出亏10.00元；本期1,400份隔日闭环赚15.20元；之后500份闭环亏18.20元，三段净亏13.00元。三段买卖毛价差合计+22.00元，完整闭环手续费35.00元，收益被费用抵消；其中5.00元属于期初买入。",
    "603230":"600股含费成本9,443.10元，三笔卖出到账9,823.96元，闭环+380.86元（+4.03%）。9/22日记确认题材梯队和承接；9/23正文肯定面对监管负反馈时等待反抽、三组条件单分批退出，不执着最高点。",
    "000504":"9/23均线附近两笔买200股，9/28卖出，闭环-50.27元（-1.95%）。日记肯定分批试仓、走弱停买；同时反思医药高标不能抵消板块退潮与爆量，最大亏损和退出触发条件仍需量化。",
    "600664":"9/24以8.33元买100股，9/28以7.43元卖出，闭环-100.39元（-11.98%）。9/24正文明确指出反核前置条件不足：医药板块回流基础弱。做对的是判断失误后没有补仓，改进点是先验证板块再验证个股。",
    "002238":"9/24以8.43元买100股，9/28以7.59元卖出，闭环-94.38元（-11.13%）。原日记将唯一3板、换手和多题材接口作为参与理由，也提示封单薄、市场性不足。不能把唯一性当作可忽略题材退潮的依据；实际卖出触发待补。",
    "000993":"9/30尾盘新买100股，含费成本1,714.00元，尚未卖出。9/15至9/17另一次300股交易已结束，不并入本期。新仓买入逻辑、假期持仓预案与期末截图待补。",
  };
  return notes[stock.code];
}

function stockFigure(code) {
  const stock = stockByCode.get(code);
  if (!stock) return "待补";
  return money(stock.realized, { sign: true });
}

function stockPctFigure(code) {
  const stock = stockByCode.get(code);
  return stock?.closedCost ? pct(stock.realized / stock.closedCost * 100) : "未平仓";
}

function renderProfitLossPanel() {
  const roles = {"603230":"主要赚钱票","002584":"主要亏损票 / 前期仓","600664":"反核亏损","002238":"接力亏损","000504":"试错亏损","588170":"ETF费用影响","000993":"期末未平仓"};
  const rows = ["603230","002584","600664","002238","000504","588170"].map(code=>{
    const stock=stockByCode.get(code);
    return '<article><span class="code">'+roles[code]+'</span><h3>'+stock.name+' <span class="'+classByValue(stock.realized)+'">'+stockFigure(code)+' / '+stockPctFigure(code)+'</span></h3><p>'+stockNote(stock)+'</p></article>';
  }).join('');
  return '<section class="panel" id="profit-loss"><span class="label">Profit / Loss Roots</span><h2>本期持有/闭环票：赚钱与亏损主因</h2><p>收益率 = 含费闭环盈亏 / 对应已卖份额成本。它是这笔交易的收益率，不是个股最高点回撤，也不是账户收益率。</p><div class="ticket-analysis">'+rows+'</div><p><b>操作与情绪线索：</b>正文支持的进步是内蒙新华按条件单兑现、试错走弱后停止加码以及9/29空仓。需要补足的环节是把“等回流”“深水就走”“反核成功”写成可执行的价格、时间、量能条件。西陇科学与9/30闽东电力的主观原因等待本人补充。</p></section>';
}

function renderAccountPanel() {
  const accountRows = accountDays.length ? accountDays.map((day) => {
    const stat = dailyStats.get(day.date) || { rows: [], buyAmount: 0, sellAmount: 0, netCash: 0 };
    const positionText = typeof day.position === "number" ? `${day.position.toFixed(2)}%` : "待补";
    return `<tr>
          <td>${formatDate(day.date)}</td>
          <td>${day.day}</td>
          <td class="${classByValue(day.returnRate)}">${pct(day.returnRate)}</td>
          <td class="${classByValue(day.pnl)}">${money(day.pnl, { sign: true })}</td>
          <td>${positionText}</td>
          <td>${rawMoney(day.equity)}</td>
          <td>${stat.rows.length}</td>
          <td>${rawMoney(stat.buyAmount)}</td>
          <td>${rawMoney(stat.sellAmount)}</td>
          <td class="reflection-cell">${day.reflection || "待补"}</td>
        </tr>`;
  }).join("") : dailyNotes.map((day) => {
    const stat = dailyStats.get(day.date) || { rows: [], buyAmount: 0, sellAmount: 0, netCash: 0 };
    return `<tr>
          <td>${formatDate(day.date)}</td>
          <td>${day.day}</td>
          <td>待补</td>
          <td>待补</td>
          <td>待补</td>
          <td>待补</td>
          <td>${stat.rows.length}</td>
          <td>${rawMoney(stat.buyAmount)}</td>
          <td>${rawMoney(stat.sellAmount)}</td>
          <td class="reflection-cell">账户日收益、仓位、当前总金额待补；本行先展示成交统计。</td>
        </tr>`;
  }).join("");

  return `<section class="panel account-panel" id="account">
      <span class="label">Account Curve</span>
      <h2>账户收益与仓位</h2>
      <p class="lead">这部分按账户日收益表记录，和成交回报/FIFO闭环分开看。本期7个交易日的账户日收益、收益率、平均仓位和期末权益暂缺，先保留表格位置，等你补数据后直接校准。</p>
      <div class="account-summary">
        <span>账户日收益合计 <b class="${knownAccountDays.length ? classByValue(accountPnlTotal) : ""}">${accountPnlLabel}</b></span>
        <span>期末总金额 <b>${finalEquityLabel}</b></span>
        <span>平均仓位 <b>${avgPositionLabel}</b></span>
        <span>期末现金余额 <b>${finalCash === null ? "待补" : rawMoney(finalCash)}</b></span>
        <span>截图闭环盈亏 <b class="${classByValue(visibleRealized)}">${money(visibleRealized, { sign: true })}</b></span>
        <span>最佳/最差日 <b>${bestWorstLabel}</b></span>
      </div>
      <div class="account-bars">${accountDays.length ? accountDays.map(renderAccountBar).join("") : dailyNotes.map(renderPendingAccountBar).join("")}</div>
      <div class="table-wrap compact-table"><table>
        <thead><tr><th>日期</th><th>星期</th><th>收益率</th><th>收益金额</th><th>仓位</th><th>当前总金额</th><th>成交笔数</th><th>买入金额</th><th>卖出金额</th><th>个人反思</th></tr></thead>
        <tbody>${accountRows}</tbody>
      </table></div>
    </section>`;
}

function renderAccountBar(day) {
  const pnlValue = typeof day.pnl === "number" ? day.pnl : 0;
  const positionValue = typeof day.position === "number" ? day.position : 0;
  const barHeight = Math.max(6, Math.round((Math.abs(pnlValue) / maxDailyPnl) * 100));
  return `<article class="account-day">
    <div class="account-day-head"><b>${day.day}</b><span>${shortDate(day.date)}</span></div>
    <div class="account-bar-track"><i style="height:${barHeight}%"></i></div>
    <strong class="${classByValue(day.pnl)}">${money(day.pnl, { sign: true })}</strong>
    <small>${pct(day.returnRate)} / 仓位 ${typeof day.position === "number" ? `${day.position.toFixed(2)}%` : "待补"}</small>
    <div class="position-meter" aria-label="${day.day} 仓位 ${typeof day.position === "number" ? `${day.position.toFixed(2)}%` : "待补"}"><i style="width:${Math.max(0, Math.min(100, positionValue))}%"></i></div>
  </article>`;
}

function renderPendingAccountBar(day) {
  return `<article class="account-day">
    <div class="account-day-head"><b>${day.day}</b><span>${shortDate(day.date)}</span></div>
    <div class="account-bar-track"><i style="height:6%;background:#cbd5e1"></i></div>
    <strong>待补</strong>
    <small>收益率 / 收益金额 / 仓位待补</small>
    <div class="position-meter" aria-label="${day.day} 仓位待补"><i style="width:0%"></i></div>
  </article>`;
}

function dailyRealized(date) {
  return byCode.reduce((n,stock)=>n+(stock.realizedByDate[date]||0),0);
}

function renderDailyCards() {
  return dailyNotes.map(day=>{
    const stat=dailyStats.get(day.date)||{rows:[],buyAmount:0,sellAmount:0};
    const review=dailyReviews[day.date];
    const excerpt=review ? [review.operationChapter,review.chapter].filter((v,i,a)=>v&&a.indexOf(v)===i).join("\n\n") || review.operation : "";
    return '<article class="day-card"><div class="day-card-head"><h3>'+formatDate(day.date)+' '+day.day+'</h3><b>'+day.theme+'</b></div><div class="day-numbers"><span>成交笔数<b>'+stat.rows.length+'</b></span><span>买入成交额<b>'+rawMoney(stat.buyAmount)+'</b></span><span>卖出成交额<b>'+rawMoney(stat.sellAmount)+'</b></span><span>当日平仓的完整盈亏<b class="'+classByValue(dailyRealized(day.date))+'">'+money(dailyRealized(day.date),{sign:true})+'</b></span></div><p><b>实际成交：</b>'+day.action+'</p><p><b>'+(review?'日记摘编与核对':'待补反思')+'：</b>'+day.review+'</p>'+
    (review?'<p><b>市场情绪（原日记口径）：</b>'+escapeHtml(review.emotion)+'</p><div class="kiss-grid">'+day.kiss.map(([label,content])=>'<div><b>'+label+'</b><p>'+content+'</p></div>').join('')+'</div><details><summary>查看对应日期的操作与反思正文</summary><div class="source-excerpt">'+escapeHtml(excerpt)+'</div></details><p class="source-line"><a href="'+escapeHtml(review.url)+'" target="_blank" rel="noreferrer">'+escapeHtml(review.title)+'</a><small>KISS由当日正文摘编；口述仓位仅保留为反思背景，精确账户比例仍待日度表。</small></p>':
    '<div class="chart-empty"><b>当日个人反思待补</b><span>每日网站主页及公开目录暂未找到本日记录。本卡只列成交事实和待核对问题。</span></div>')+'</article>';
  }).join('');
}

function renderTradeTable() {
  const rows = sortReverseChronological(trades).map((row) => `<tr>
    <td>${formatDate(row.date)} ${row.time}</td>
    <td>${row.code}</td>
    <td>${row.name}</td>
    <td class="${actionClass(row.sideType)}">${row.side}</td>
    <td>${qty(row.qty)}</td>
    <td>${row.price.toFixed(row.code.startsWith("5") ? 3 : 2)}</td>
    <td>${rawMoney(row.amount)}</td>
    <td>${rawMoney(row.fee || 0)}</td>
    <td>${rawMoney(row.tax || 0)}</td>
    <td class="${classByValue(row.net)}">${money(row.net, { sign: true })}</td>
    <td>${typeof row.cash === "number" ? rawMoney(row.cash) : "待补"}</td>
    <td>${row.market}</td>
  </tr>`).join("");

  return `<div class="table-wrap"><table>
    <thead><tr><th>成交时间</th><th>代码</th><th>名称</th><th>操作</th><th>数量</th><th>成交均价</th><th>成交金额</th><th>手续费</th><th>印花税</th><th>发生金额</th><th>资金余额</th><th>市场</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

function renderIgnoredOrders() {
  if (!ignoredOrders.length) {
    return `<div class="chart-empty"><b>本次截图未见撤单/废单记录</b><span>如后续给委托单截图，可在这里补充未成交意图和撤单原因。</span></div>`;
  }
  const rows = sortReverseChronological(ignoredOrders).map((row) => `<tr>
    <td>${formatDate(row.date)} ${row.time}</td>
    <td>${row.code}</td>
    <td>${row.name}</td>
    <td>${row.side}</td>
    <td>${row.status}</td>
    <td>${qty(row.qty)}</td>
    <td>${row.price.toFixed(row.code.startsWith("5") ? 3 : 2)}</td>
  </tr>`).join("");

  return `<div class="table-wrap compact-table"><table>
    <thead><tr><th>委托时间</th><th>代码</th><th>名称</th><th>操作</th><th>状态</th><th>数量</th><th>委托价</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

function renderCodeSummaryRows() {
  return byCode.map((stock) => `<tr>
    <td><a href="#stock-${stock.code}">${stock.code} ${stock.name}</a></td>
    <td>${qty(stock.buyQty)}</td>
    <td>${rawMoney(stock.buyAmount)}</td>
    <td>${qty(stock.sellQty)}</td>
    <td>${rawMoney(stock.sellAmount)}</td>
    <td class="${realizedClass(stock)}">${realizedText(stock)}</td>
    <td>${stock.openQty ? `${qty(stock.openQty)} / ${rawMoney(stock.openCost)}` : "已清仓"}</td>
  </tr>`).join("");
}

function renderRules() {
  const rules=[
    ["保留分批退出","9/23日记：监管反馈、板块与自身量价一起看，用条件单分批退出，不以卖到最高点衡量执行。"],
    ["唯一性要有板块支持","9/24日记：唯一性需与题材余温、承接和市场环境共同成立，不能单凭身位放大预期。"],
    ["反核先验证条件","9/24日记：先有板块强回流，再看个股主动反核；判断错误后不补仓。"],
    ["模糊词改成触发卡","9/22至9/24反思共同要求写明价格、时间、动作、失效、仓位上限和最大亏损。"],
    ["允许空仓","9/29日记：不把情绪缓和当成新周期，不因节前想做一笔而降低入场标准。"],
    ["小额ETF先核费用","本次交割核算：三段完整ETF闭环毛价差+22.00元，手续费35.00元。下次复盘单列净收益与拆单成本。"],
  ];
  return rules.map(([title,body])=>'<article><b>'+title+'</b><p>'+body+'</p></article>').join('');
}

function renderHoldingsPanel() {
  const stock=stockByCode.get("000993");
  const source=JSON.parse(fs.readFileSync(path.join(weekDir,"data/000993-5m.json"),"utf8"));
  const last=source.bars.at(-1);
  const close=last.dt==="2026-09-30 15:00"?last.close:null;
  const value=close===null?null:close*stock.openQty;
  const pnl=value===null?null:value-stock.openCost;
  const estimate=value===null?null:finalCash+value;
  return '<section class="panel" id="holdings"><span class="label">Closing Positions</span><h2>期末持仓与收盘估算</h2><p>截图可见新仓为闽东电力100股。按9/30真实5分钟行情收盘价估值，券商持仓截图尚待确认。</p><div class="summary-grid"><span>本期未平仓<b>闽东电力100股</b></span><span>含费成本<b>'+rawMoney(stock.openCost)+'</b></span><span>含费单位成本<b>'+rawMoney(stock.openCost/stock.openQty)+'</b></span><span>9/30行情收盘价<b>'+rawMoney(close)+'</b></span><span>估算持仓市值<b>'+rawMoney(value)+'</b></span><span>估算浮盈亏<b class="'+classByValue(pnl)+'">'+money(pnl,{sign:true})+' / '+pct(pnl===null?null:pnl/stock.openCost*100)+'</b></span><span>末笔现金余额<b>'+rawMoney(finalCash)+'</b></span><span>仅可见现金 + 持仓<b>'+rawMoney(estimate)+'</b></span><span>仅可见组合仓位<b>'+pct(estimate?value/estimate*100:null)+'</b></span></div><p>上述组合估算以“没有其他持仓或未展示资金变动”为前提，不作为已确认账户总资产或日度仓位。9/15至9/17的旧闽东交易不计入本期。</p></section>';
}

function renderWeekPage(charts) {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${week.rangeText} 合并交割复盘</title><style>${sharedStyles()}</style></head><body>
    <nav class="rail" aria-label="页面导航"><a href="../weekly-trading-review/">周度主页</a><a href="../">总入口</a><a href="#overview">本期总览</a><a href="#second-review">二次反思</a><a href="#account">账户</a><a href="#holdings">期末持仓</a><a href="#profit-loss">盈亏主因</a><a href="#stocks">买卖点</a><a href="#daily">每日KISS</a><a href="#trades">成交明细</a><a href="#missing">待补清单</a></nav>
    <main class="page-shell"><section class="hero" id="overview"><div><span class="label">${week.status}</span><h1><span class="date-range"><span>2026.09.21 -</span><span>2026.09.30</span></span>两周交割复盘</h1><p>${week.subtitle}</p><p>按“两周合计7个交易日”暂定本期区间；截图9/14–9/18仅作期初成本参考，不重复计入本期成交。9/25休市，交易日为9/21、22、23、24、28、29、30。<a href="${config.holidaySource}" target="_blank" rel="noopener">交易所休市安排</a></p><div class="button-row"><a class="button" href="#stocks">查看买卖点</a><a class="button secondary" href="#missing">后续待补</a></div></div><div class="metrics">
    ${metricCard("成交 / 标的",trades.length+"笔 / "+byCode.length+"只","7个交易日；9/29无成交")}
    ${metricCard("含费闭环盈亏",money(visibleRealized,{sign:true}),"含期初持仓完整成本，不是账户期间收益",classByValue(visibleRealized))}
    ${metricCard("主要盈利 / 亏损","内蒙新华 / 西陇科学","+380.86元 / -343.88元")}
    ${metricCard("期末可见持仓","闽东电力 100股","9/30新仓；含费成本1,714.00元")}</div></section>
    <section class="panel" id="second-review"><span class="label">Second Reflection</span><h2>本期二次反思总结</h2><p class="lead">待你补充两周二次心得。以下先分开记录交割事实与已发布日记，不用成交结果反推你当时的情绪，也不替你编写最终总结。</p></section>
    <section class="panel"><h2>本期初步结论</h2><div class="thesis-grid"><article><b>内蒙新华分批兑现</b><p>600股闭环+380.86元，含费收益率+4.03%。9/23日记肯定在监管与负反馈并存时用三组条件单退出，而不是执着最高点；9/22重仓前的风险量化仍需改进。</p></article><article><b>前期亏损与后续试错抵消盈利</b><p>西陇科学9/21卖出，完整持仓闭环-343.88元。南华生物、哈药股份、天威视讯合计-245.04元；日记反思题材退潮下，个股地位或唯一性不等于足够的入场条件。</p></article><article><b>空仓克制与新仓待验证</b><p>9/29无成交，日记肯定防守与等待。9/30尾盘新买闽东电力100股，尚未闭环；买入逻辑、节后预案和风险上限待补。ETF闭环-13.00元，费用抵消了毛价差。</p></article></div></section>
    <section class="panel data-panel"><div><h2>交割单 + 市值口径核算</h2><p>按“发生金额”进行含费FIFO核算。期初沿用9/17–9/18买入的西陇科学1,000股（成本10,094.00元）、科创半导200份（成本209.00元），以及现金67.38元。本期21笔成交净现金流与9/30余额8,435.32元完全衔接。</p><p>闭环包含跨期持仓的完整成本；未提供9/18收盘权益及7天账户表，因此不填账户收益率、平均仓位或最大回撤。原始私人截图、合同号、成交编号不公开。</p></div><div class="summary-grid"><span>买入笔数<b>${buyRows.length}</b></span><span>卖出笔数<b>${sellRows.length}</b></span><span>买入成交额<b>${rawMoney(buyAmount)}</b></span><span>卖出成交额<b>${rawMoney(sellAmount)}</b></span><span>成交净现金流<b>${money(netCash,{sign:true})}</b></span><span>本期现金费用<b>${rawMoney(sellAmount-buyAmount-netCash)}</b></span></div></section>
    ${renderAccountPanel()}${renderHoldingsPanel()}${renderProfitLossPanel()}
    <section class="panel" id="stocks"><span class="label">Trade Charts</span><h2>重点走势图与5分钟K线买卖点</h2><p>7只实际交易标的均使用真实5分钟K线。红色B为买入、蓝色S为卖出；编号对应下方精确成交时间、价格与数量。西陇科学与科创半导延长至9/17，标出“期初B”；其余从9/21开始。行情来源：东方财富，未复权。</p><div class="table-wrap"><table><thead><tr><th>标的</th><th>本期买入数量</th><th>买入成交额</th><th>本期卖出数量</th><th>卖出成交额</th><th>含费闭环</th><th>期末数量 / 成本</th></tr></thead><tbody>${renderCodeSummaryRows()}</tbody></table></div><div class="stock-grid">${renderStockCards(charts)}</div></section>
    <section class="panel" id="daily"><span class="label">Daily KISS</span><h2>每日操作与情绪复盘</h2><p>9/22、9/23、9/24、9/29摘编自对应日期个人复盘正文，并附原文及链接。只采用当日操作章节，不混用网页底部重复的旧KISS卡片。9/21、9/28、9/30保留成交事实，情绪与反思待补。</p><div class="day-grid-cards">${renderDailyCards()}</div></section>
    <section class="panel" id="rules"><h2>本期已有规则与待验证问题</h2><p>根据已发布日记整理，属于个人复盘纪律，不把经验判断写成确定收益或成功率。</p><div class="rules">${renderRules()}</div></section>
    <section class="panel" id="trades"><h2>本期成交明细</h2><p>仅列9/21–9/30的21笔成交。金额单位元，ETF数量单位份。截图手续费${rawMoney(feeTotal)}元、印花税${rawMoney(taxTotal)}元，发生金额另含${rawMoney(sellAmount-buyAmount-netCash-feeTotal-taxTotal)}元费用差额。现金流为交易资金流，不是账户盈亏。</p>${renderTradeTable()}</section>
    <section class="panel" id="missing"><span class="label">To Fill</span><h2>后续待补内容</h2><div class="missing-list"><article><b>1. 七天账户数据</b><p>9/21、22、23、24、28、29、30每日收益率、收益金额、仓位、当前总金额，另补9/18期末总资产。用于账户曲线、7日平均仓位、最赚/最亏日和期间回撤。</p></article><article><b>2. 9/30期末持仓</b><p>确认闽东电力100股、现金8,435.32元，是否还有其他持仓；补期末账户截图及期间是否有入金、出金或其他资金变动。</p></article><article><b>3. 三天每日反思</b><p>网站尚未找到9/21、9/28、9/30的日记。重点补西陇退出、三只试错票兑现、新开闽东电力的想法及情绪。</p></article><article><b>4. 两周二次反思</b><p>补充主要赚钱/亏损根源、仓位与情绪变化、节后持仓计划。区间先按9/21–9/30；9/14–9/18不纳入本期。</p></article></div></section></main></body></html>`;
}

function renderWeeklyHub() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>周度交割复盘</title>
  <style>${sharedStyles()}</style>
</head>
<body>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <main class="page-shell" id="main-content">
    <section class="hero">
      <div>
        <span class="label">Weekly Trading Review</span>
        <h1>周度交割复盘</h1>
        <p>每周一个独立页面，记录成交单、买卖点、账户变化、逐日复盘和当周新增交易纪律。最新一期合并 2026.09.21-09.30 的7个交易日；21笔成交、7只标的的5分钟K线买卖点及四天操作反思已整理，账户数据和二次反思待补。</p>
        <div class="button-row">
          <a class="button" href="../${week.folder}/">进入最新周复盘</a>
          <a class="button secondary" href="../index.html">返回总首页</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("周报数量", `${archiveWeeks.length}`, "含本周草稿")}
        ${metricCard("最新区间", "09.21", "至 09.30 / 两周合并")}
        ${metricCard("最新账户", accountPnlLabel, `期末 ${finalEquityLabel} / 仓位 ${finalPositionLabel}`, knownAccountDays.length ? classByValue(accountPnlTotal) : "")}
        ${metricCard("最新规则", "待二次反思", "先看题材地位 / 唯一性 / 卖点")}
      </div>
    </section>
    <section class="panel">
      <span class="label">Latest Draft</span>
      <h2>最新周：${week.label}</h2>
      <div class="latest-summary">
        <span>成交笔数 <b>${trades.length}</b></span>
        <span>成交额 <b>${rawMoney(turnover)}</b></span>
        <span>可见已实现 <b class="${classByValue(visibleRealized)}">${money(visibleRealized, { sign: true })}</b></span>
        <span>账户口径 <b class="${knownAccountDays.length ? classByValue(accountPnlTotal) : ""}">${accountPnlLabel}</b></span>
      </div>
      <p>本期含费闭环-221.06元：内蒙新华+380.86元，西陇科学-343.88元；期末可见闽东电力100股。闭环含前期持仓成本，不等同于本期账户收益。账户日收益合计 ${accountPnlLabel}，期末总金额 ${finalEquityLabel}。</p>
    </section>
    <section class="panel">
      <span class="label">Archive</span>
      <h2>周报归档</h2>
      <div class="archive">${archiveWeeks.map(renderArchiveCard("..")).join("")}</div>
    </section>
  </main>
</body>
</html>`;
}

function renderRootIndex() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>周度 / 月度 / 季度 / 年度交易复盘总览</title>
  <style>${sharedStyles()}</style>
</head>
<body>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <main class="page-shell" id="main-content">
    <section class="hero">
      <div>
        <span class="label">weekly-monthly-quarterly-yearly-trading-review</span>
        <h1><span class="title-line">周度 / 月度 / 季度</span><span class="title-line">年度交易复盘</span></h1>
        <p>这里是总入口：周度独立成页；月度和季度放在同一个复盘主页；年度复盘沉淀交易体系；成功与失败案例单独回看。</p>
        <div class="button-row">
          <a class="button" href="./weekly-trading-review/">周度主页</a>
          <a class="button secondary" href="./${week.folder}/">最新周复盘</a>
          <a class="button secondary" href="./monthly-quarterly-trading-review/">月度 / 季度主页</a>
          <a class="button secondary" href="./yearly-trading-review/">年度主页</a>
          <a class="button secondary" href="./success-failure-trade-review/">成功与失败交割复盘</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("周度归档", `${archiveWeeks.length}`, "已发布/草稿周复盘")}
        ${metricCard("最新区间", "09.21", "至 09.30 / 两周合并")}
        ${metricCard("最新账户", accountPnlLabel, `期末 ${finalEquityLabel}`, knownAccountDays.length ? classByValue(accountPnlTotal) : "")}
        ${metricCard("长期结构", "4 个主页", "周度 / 月季 / 年度 / 案例")}
      </div>
    </section>
    <section class="loss-banner">
      <span class="label">Loss Roots</span>
      <h1>亏损源头</h1>
      <div class="loss-grid">
        <article><b>1. 分歧接面</b><p>刚分歧不要那么快进去。</p></article>
        <article><b>2. 主升空仓</b><p>主升期要贪婪重仓。</p></article>
        <article><b>3. 冰点割肉</b><p>冰点还割肉，次日修复没先手，直接亏上加亏。</p></article>
        <article><b>4. 退潮追涨</b><p>退潮期追涨，没等进入混沌就大出手，这就容易死。</p></article>
      </div>
    </section>
    <section class="panel">
      <span class="label">Review Entrances</span>
      <h2>复盘主页</h2>
      <div class="dimension-stack">
        <div class="dimension-head"><div><span class="dimension-mark">时间维度</span><h3>按周期看账户曲线</h3></div><p>周度记录交割动作，月度/季度检查模式变化，年度沉淀交易体系。</p></div>
        <div class="entrance-grid dimension-grid time">
          <a class="week-card" href="./weekly-trading-review/"><div class="week-head"><h3>周度交割复盘</h3><span class="chip">时间 1</span></div><p>每周一个独立复盘页面，记录交割、买卖点、账户变化、KISS复盘和周度规则。</p><div class="mini-grid"><span>周报 <b>${archiveWeeks.length} 篇</b></span><span>最新 <b>${week.label}</b></span><span>状态 <b>草稿版</b></span></div></a>
          <a class="week-card" href="./monthly-quarterly-trading-review/"><div class="week-head"><h3>月度 / 季度复盘</h3><span class="chip">时间 2</span></div><p>月度承接周度结果，季度检查模式和仓位是否真正改善账户曲线。</p><div class="mini-grid"><span>月度 <b>1-12 月</b></span><span>季度 <b>Q1-Q4</b></span><span>状态 <b>框架版</b></span></div></a>
          <a class="week-card" href="./yearly-trading-review/"><div class="week-head"><h3>年度交易复盘</h3><span class="chip">时间 3</span></div><p>年度层面聚焦账户画像、模式进化、仓位风控、心理纪律和下一年执行准则。</p><div class="mini-grid"><span>年度 <b>自然年</b></span><span>核心 <b>体系沉淀</b></span><span>状态 <b>框架版</b></span></div></a>
        </div>
        <div class="dimension-head"><div><span class="dimension-mark">成功与失败维度</span><h3>按结果拆成功周、失败周和关键标的</h3></div><p>单独沉淀大盈利、大回撤样本，把周级账户影响和个股/ETF买卖点分开复盘。</p></div>
        <div class="entrance-grid dimension-grid outcome">
          <a class="week-card" href="./success-failure-trade-review/"><div class="week-head"><h3>成功与失败交割复盘</h3><span class="chip">结果 1</span></div><p>分成周维度和个股/ETF维度：周维度看成功/失败周，标的维度看大利润个股与大回撤个股的买卖点和交易思路。</p><div class="mini-grid"><span>周维度 <b>成功/失败周</b></span><span>标的维度 <b>个股/ETF</b></span><span>重点 <b>买卖点复盘</b></span></div></a>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function renderArchiveCard(prefix) {
  return (item) => {
    const isDraft = item.folder === week.folder;
    return `<a class="week-card ${isDraft ? "latest-link" : ""}" href="${prefix}/${item.folder}/">
      <div class="week-head"><h3>${item.label}</h3><span class="chip">${isDraft ? "最新草稿" : "已归档"}</span></div>
      <p>${item.note}</p>
      <div class="mini-grid">
        <span>金额变化 <b class="${item.pnl.startsWith("+") ? "is-profit" : item.pnl.startsWith("-") ? "is-loss" : ""}">${item.pnl}</b></span>
        <span>周收益率 <b>${item.pct}</b></span>
        <span>期末权益 <b>${item.equity}</b></span>
      </div>
    </a>`;
  };
}

function weekExtraStyles() {
  return '.summary-grid b.is-loss,.stock-metrics b.is-loss,.mini-grid b.is-loss,.account-summary b.is-loss{color:var(--green)}.summary-grid b.is-profit,.stock-metrics b.is-profit,.mini-grid b.is-profit,.account-summary b.is-profit{color:var(--red)}h1{font-size:46px}.label{max-width:100%;white-space:normal;overflow-wrap:anywhere}.ticket-analysis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.ticket-analysis article{border-top:1px solid var(--line);padding-top:16px}.ticket-analysis .code{margin-bottom:10px}.day-grid-cards{grid-template-columns:1fr}.day-card-head{display:flex;flex-wrap:wrap;align-items:center}.day-numbers{grid-template-columns:repeat(4,minmax(0,1fr))}.kiss-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.kiss-grid>div{border-top:2px solid #dce3ea;padding-top:12px}.source-excerpt{white-space:pre-wrap;line-height:1.8;color:var(--muted);padding:14px 0}.source-line a{overflow-wrap:anywhere}details summary{cursor:pointer;font-weight:700;padding:8px 0}.chart-heading{display:flex;justify-content:space-between;gap:16px}.chart-heading i{font-style:normal;font-size:13px}.stock-chart{min-width:1100px}.stock-chart .trade-marker text{font-size:12px}.trade-points{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.trade-point{padding:10px;border:1px solid var(--line);border-radius:6px;font-size:13px}.trade-point strong{display:block;color:var(--ink);margin-top:4px}.stock-metrics b{font-size:16px}.rules{grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:1400px){.rail{position:static;width:min(1180px,calc(100% - 28px));margin:18px auto 0;display:flex;flex-direction:row;flex-wrap:wrap}.rail a{width:auto;padding:8px 12px}}@media(max-width:800px){h1{font-size:36px}.kiss-grid,.ticket-analysis,.rules{grid-template-columns:1fr 1fr}}@media(max-width:560px){h1{font-size:32px}h2{font-size:24px}.kiss-grid,.ticket-analysis,.rules,.day-numbers{grid-template-columns:1fr}.hero,.panel{padding:18px}.loss-banner h1{font-size:34px}}';
}

function sharedStyles() {
  return `
    :root{--ink:#17202a;--muted:#667085;--line:#dfe4ea;--paper:#ffffff;--wash:#f5f7fa;--red:#c2412d;--green:#14845f;--blue:#1d4ed8;--amber:#b45309;--violet:#6d5bd0;--shadow:0 18px 44px rgba(23,32,42,.08);--radius:10px}
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{margin:0;color:var(--ink);background:linear-gradient(180deg,#f7f8fa 0%,#eef2f5 100%);font-family:"Avenir Next","PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif;overflow-x:hidden}
    a{color:inherit;-webkit-tap-highlight-color:rgba(194,65,45,.12);touch-action:manipulation}
    a:focus-visible{outline:3px solid rgba(29,78,216,.38);outline-offset:3px}
    p,li{color:var(--muted);line-height:1.72}
    h1,h2,h3,p{margin-top:0;letter-spacing:0}
    h1{margin:14px 0 14px;font-size:clamp(38px,5vw,68px);line-height:1.04;text-wrap:balance}
    .date-range,.title-line{display:grid;gap:0}
    h2{font-size:28px;margin-bottom:12px}
    h3{font-size:18px;margin-bottom:8px}
    .page-shell{width:min(1180px,calc(100vw - 28px));margin:0 auto;padding:34px 0 56px;display:grid;gap:20px}
    section[id]{scroll-margin-top:18px}
    .skip-link{position:absolute;left:16px;top:12px;z-index:5;transform:translateY(-140%);border-radius:8px;background:var(--ink);color:#fff;padding:10px 14px;text-decoration:none;font-weight:800}
    .skip-link:focus-visible{transform:translateY(0)}
    .page-shell > *,.hero > *,.panel > *,.account-placeholder > *,.metric,.week-card,.stock-card,.day-card{min-width:0}
    .rail{position:fixed;left:18px;top:18px;z-index:2;display:flex;flex-direction:column;gap:7px}
    .rail a{width:78px;min-height:34px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.9);text-decoration:none;color:var(--muted);font-size:12px;font-weight:800;box-shadow:0 10px 28px rgba(23,32,42,.06)}
    .hero,.panel,.metric,.week-card,.stock-card,.loss-banner{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
    .hero{padding:30px;display:grid;grid-template-columns:1.08fr .92fr;gap:26px;align-items:end}
    .panel{padding:24px}
    .loss-banner{padding:28px;border:2px solid rgba(194,65,45,.24);background:linear-gradient(135deg,#fff1ed 0%,#fff 64%)}
    .loss-banner h1{font-size:clamp(34px,4vw,54px);line-height:1.05;margin:8px 0 16px}
    .loss-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
    .loss-grid article{background:#fff;border:1px solid rgba(194,65,45,.16);border-radius:8px;padding:16px}
    .loss-grid b{display:block;margin-bottom:7px;font-size:17px}
    .loss-grid p{margin-bottom:0}
    .label{display:inline-flex;width:max-content;color:var(--red);background:#fff1ed;padding:7px 10px;border-radius:999px;font-size:12px;font-weight:800}
    .button-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
    .button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border-radius:8px;background:var(--ink);color:#fff;text-decoration:none;font-weight:800;transition:transform .16s ease,border-color .16s ease,background-color .16s ease}
    .button:hover{transform:translateY(-1px);background:#0f1720}
    .button.secondary{background:#fff;color:var(--ink);border:1px solid var(--line)}
    .button.secondary:hover{background:#f8fafc;border-color:#c6d0dc}
    .metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .metric{padding:16px;min-height:106px;display:grid;align-content:space-between}
    .metric span,.metric small{color:var(--muted);font-size:12px}
    .metric strong{font-size:22px;line-height:1.18;word-break:break-word;font-variant-numeric:tabular-nums}
    .lead{font-size:17px;color:#334155}
    .thesis-grid,.summary-grid,.stock-metrics,.day-numbers,.missing-list,.entrance-grid,.dimension-stack,.dimension-grid{display:grid;gap:12px}
    .thesis-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
    .thesis-grid article,.rules article,.missing-list article{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}
    .thesis-grid b,.rules b,.missing-list b{display:block;margin-bottom:7px}
    .data-panel{display:grid;grid-template-columns:.95fr 1.05fr;gap:22px;align-items:center}
    .summary-grid,.latest-summary,.account-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .summary-grid span,.latest-summary span,.mini-grid span,.day-numbers span,.stock-metrics span,.mini-ledger span,.account-summary span,.account-strip span{background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:10px;color:var(--muted);font-size:13px}
    .summary-grid b,.latest-summary b,.mini-grid b,.day-numbers b,.stock-metrics b,.mini-ledger b,.account-summary b,.account-strip b{display:block;color:var(--ink);font-size:17px;margin-top:4px}
    .stock-metrics{grid-template-columns:repeat(4,minmax(0,1fr))}
    .stock-metrics em{display:block;font-style:normal;font-size:12px;color:var(--muted);margin-top:3px}
    .table-wrap{width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:9px;background:#fff;margin:14px 0}
    table{width:100%;min-width:920px;border-collapse:collapse;font-size:13px}
    th,td{padding:11px 12px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
    th:first-child,td:first-child{text-align:left}
    th{background:#f8fafc;color:var(--muted)}
    .reflection-cell{text-align:left;white-space:normal;min-width:260px;color:var(--ink)}
    .compact-table table{min-width:760px}
    .is-profit,.is-buy{color:var(--red)}
    .is-loss{color:var(--green)}
    .is-sell{color:var(--blue)}
    .account-placeholder{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;align-items:center;border:1px dashed #b8c1cc;border-radius:10px;background:#f8fafc;padding:18px}
    .account-placeholder strong{font-size:22px}
    .account-bars{display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:12px;margin:18px 0}
    .account-day{border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px;display:grid;gap:8px;min-height:236px}
    .account-day-head{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:12px}
    .account-day-head b{color:var(--ink);font-size:15px}
    .account-bar-track{height:92px;border-radius:7px;background:#f1f5f9;display:flex;align-items:end;overflow:hidden}
    .account-bar-track i{display:block;width:100%;border-radius:7px 7px 0 0;background:linear-gradient(180deg,#c2412d,#e8917f)}
    .account-day strong{font-size:19px}
    .account-day small{color:var(--muted);line-height:1.45}
    .position-meter{height:8px;border-radius:999px;background:#edf2f7;overflow:hidden}
    .position-meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#1d4ed8,#7fb0ff)}
    .mini-ledger,.mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .stock-grid{display:grid;gap:16px;margin-top:18px}
    .stock-card{padding:18px;box-shadow:none}
    .stock-card-head,.week-head,.day-card-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
    .code,.chip{display:inline-flex;white-space:nowrap;border:1px solid var(--line);border-radius:999px;background:#f8fafc;padding:7px 10px;color:var(--muted);font-size:12px;font-weight:800}
    .chart-frame{margin-top:14px;border:1px solid var(--line);border-radius:10px;overflow-x:auto;background:#fff}
    .stock-chart{display:block;width:100%;min-width:860px;height:auto}
    .stock-chart rect{fill:#fff}
    .stock-chart .axis line,.stock-chart .day-grid line{stroke:rgba(23,32,42,.10);stroke-dasharray:4 6}
    .stock-chart .axis text,.stock-chart .day-grid text{fill:var(--muted);font-size:12px}
    .stock-chart path{stroke:var(--ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    .trade-marker.buy circle{fill:var(--red);stroke:#fff;stroke-width:2}
    .trade-marker.sell circle{fill:var(--blue);stroke:#fff;stroke-width:2}
    .trade-marker text{font-size:11px;font-weight:900;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}
    .trade-marker.buy text{fill:var(--red)}
    .trade-marker.sell text{fill:var(--blue)}
    .chart-empty{padding:22px;display:grid;gap:6px;color:var(--muted)}
    .chart-empty b{color:var(--ink)}
    .day-grid-cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
    .day-card{border:1px solid var(--line);border-radius:8px;background:#fff;padding:15px;display:grid;gap:10px}
    .day-card-head{display:grid;gap:8px}
    .day-card-head span{display:block;color:var(--muted);font-size:12px;margin-top:3px}
    .day-numbers{grid-template-columns:repeat(2,minmax(0,1fr))}
    .account-strip{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .day-card p{margin-bottom:0}
    .source-line{display:grid;gap:5px;border-top:1px solid var(--line);padding-top:10px;color:var(--blue);font-size:13px;font-weight:800}
    .source-line small{color:var(--muted);font-weight:500;line-height:1.55}
    .rules{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
    .rules article span{display:inline-flex;color:var(--blue);font-size:12px;font-weight:900;margin-bottom:8px}
    .missing-list{grid-template-columns:repeat(4,minmax(0,1fr))}
    .archive{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
    .week-card{padding:20px;display:grid;gap:14px;text-decoration:none;color:inherit;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
    .week-card:hover{border-color:#c6d0dc;box-shadow:0 20px 48px rgba(23,32,42,.1);transform:translateY(-1px)}
    .latest-link{border-color:rgba(29,78,216,.28)}
    .entrance-grid,.dimension-grid.time{grid-template-columns:repeat(3,minmax(0,1fr))}
    .dimension-grid.outcome{grid-template-columns:1fr}
    .dimension-head{display:flex;justify-content:space-between;gap:14px;align-items:end;margin-top:10px}
    .dimension-head h3{margin:0;font-size:20px}
    .dimension-head p{margin:0;max-width:620px;font-size:14px}
    .dimension-mark{display:inline-flex;white-space:nowrap;border:1px solid var(--line);border-radius:999px;background:#f8fafc;padding:7px 10px;color:var(--muted);font-size:12px;font-weight:800}
    .entrance-grid .mini-grid{grid-template-columns:1fr}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.button,.week-card{transition:none}.button:hover,.week-card:hover{transform:none}}
    @media(max-width:1260px){.rail{position:static;width:min(1180px,calc(100vw - 28px));margin:18px auto 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}.rail a{width:auto}}
    @media(max-width:920px){.hero,.data-panel,.account-placeholder{grid-template-columns:1fr}.metrics,.summary-grid,.latest-summary,.account-summary,.stock-metrics,.mini-ledger,.mini-grid,.thesis-grid,.rules,.missing-list,.archive,.entrance-grid,.dimension-grid.time,.dimension-grid.outcome,.loss-grid{grid-template-columns:1fr}.dimension-head{display:grid}.account-bars{grid-template-columns:repeat(2,minmax(0,1fr))}.day-grid-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.page-shell{width:min(calc(100vw - 16px),1180px);padding-top:22px}.hero,.panel,.loss-banner{padding:20px}}
    ${weekExtraStyles()}
    @media(max-width:560px){.page-shell,.rail{width:calc(100% - 16px);max-width:100%;margin-left:auto;margin-right:auto}.rail{grid-template-columns:repeat(2,minmax(0,1fr))}.day-grid-cards,.account-bars,.account-strip{grid-template-columns:1fr}h1{font-size:34px}.metric strong{font-size:19px}}
  `;
}

async function main() {
  const charts = {};
  await Promise.all(byCode.map(async (stock) => {
    const referenceRows = openingByCode.has(stock.code) ? referenceTrades.filter(r => r.code===stock.code && r.sideType==="buy" && openingByCode.get(stock.code).dates.includes(r.date)).map(r=>({...r,reference:true})) : [];
    charts[stock.code] = renderTrendSvg({...stock,rows:[...referenceRows,...stock.rows]}, await fetchTrend(stock.code));
  }));

  assert.equal(trades.length,21);
  assert.equal(byCode.length,7);
  assert.equal(dailyNotes.length,7);
  assert.equal(Math.round(visibleRealized*100),-22106);
  const expected = {"002584":-34388,"588170":-1300,"603230":38086,"000504":-5027,"600664":-10039,"002238":-9438,"000993":0};
  for (const [code,cents] of Object.entries(expected)) assert.equal(Math.round(stockByCode.get(code).realized*100),cents,code);
  assert.equal(openPositions.length,1);
  assert.equal(openPositions[0].code,"000993");
  assert.equal(openPositions[0].openQty,100);
  assert.equal(Math.round(openCost*100),171400);
  assert.equal(Math.round((netCash + openCost - openingCost)*100),Math.round(visibleRealized*100));
  assert.equal(Math.round((config.openingCash+netCash)*100),843532);
  assert.equal(sourceData.reviews.length,4);
  for (const row of trades) assert.equal(Math.round(row.price*row.qty*100),Math.round(row.amount*100));
  const n=value=>Number(value.toFixed(2));
  fs.writeFileSync(path.join(weekDir,"data/trades.json"),JSON.stringify(trades,null,2)+"\n");
  fs.writeFileSync(path.join(weekDir,"data/summary.json"),JSON.stringify({
    range:week.rangeText, tradeCount:trades.length, stockCount:byCode.length, sessions:config.sessions,
    scope:"9/21-9/30合并7个交易日；9/14-9/18仅作期初成本参考",
    buyAmount:n(buyAmount),sellAmount:n(sellAmount),turnover:n(turnover),feeTotal:n(feeTotal),taxTotal:n(taxTotal),
    cashFees:n(sellAmount-buyAmount-netCash),netCash:n(netCash),visibleRealized:n(visibleRealized),
    openingCost:n(openingCost),openingCash:config.openingCash,closingCash:finalCash,openCost:n(openCost),
    stocks:byCode.map(stock=>({code:stock.code,name:stock.name,buyQty:stock.buyQty,sellQty:stock.sellQty,
      realized:n(stock.realized),closedCost:n(stock.closedCost),
      closedReturn:stock.closedCost ? +(stock.realized/stock.closedCost*100).toFixed(4) : null,
      openQty:stock.openQty,openCost:n(stock.openCost)})),
    realizedBySaleDate:dailyNotes.map(day=>({date:day.date,realized:n(dailyRealized(day.date))})),
    accountStatus:"pending",sourceDates:sourceData.reviews.map(r=>r.date),
    missingSourceDates:dailyNotes.filter(day=>!dailyReviews[day.date]).map(day=>day.date),
    warning:"完整持仓含费闭环不是账户期间收益，未计其他未知持仓或资金变动。",
  },null,2)+"\n");
  fs.mkdirSync(weekDir, { recursive: true });
  fs.writeFileSync(path.join(weekDir, "index.html"), renderWeekPage(charts), "utf8");
  fs.writeFileSync(path.join(repo, "weekly-trading-review", "index.html"), renderWeeklyHub(), "utf8");
  fs.writeFileSync(path.join(repo, "index.html"), renderRootIndex(), "utf8");
  require("./update-weekly-hub-chart.js");
  if (fs.existsSync(path.join(__dirname, "fill-weekly-hub-calculated-pnl.js"))) require("./fill-weekly-hub-calculated-pnl.js");
  await require("./fill-weekly-return-rates.cjs")();

  console.log(`Wrote ${path.relative(repo, weekDir)}\\index.html`);
  console.log("Updated weekly-trading-review\\index.html");
  console.log("Updated index.html");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
