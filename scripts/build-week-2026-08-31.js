const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..");
const weekDir = path.join(repo, "2026-08-31_2026-09-04");

const week = {
  folder: "2026-08-31_2026-09-04",
  rangeText: "2026.08.31 - 2026.09.04",
  tradeRangeText: "2026.08.31 - 2026.09.04",
  label: "08.31-09.04",
  status: "草稿版",
  title: "旧仓兑现后多笔短线闭环，时代出版与欢瑞世纪为主要可见亏损",
  subtitle: "当前版本基于 2026/8/31-9/4 成交截图先做草稿；账户日收益表、期末持仓截图、历史持仓成本、每日操作&情绪复盘和二次反思待补后再校准。",
};

const trades = [
  { date: "20260904", time: "09:38:56", code: "000892", name: "欢瑞世纪", side: "卖出", sideType: "sell", qty: 900, price: 5.21, amount: 4689, fee: 5, tax: 2.34, net: 4681.66, cash: 11169.91, market: "深A" },
  { date: "20260903", time: "11:21:56", code: "000892", name: "欢瑞世纪", side: "买入", sideType: "buy", qty: 300, price: 5.72, amount: 1716, fee: 5, tax: 0, net: -1721, cash: 1449.82, market: "深A" },
  { date: "20260903", time: "11:20:37", code: "000892", name: "欢瑞世纪", side: "买入", sideType: "buy", qty: 600, price: 5.72, amount: 3432, fee: 5, tax: 0, net: -3437, cash: 3170.82, market: "深A" },
  { date: "20260903", time: "09:36:41", code: "600551", name: "时代出版", side: "卖出", sideType: "sell", qty: 600, price: 8.41, amount: 5046, fee: 5, tax: 2.52, net: 5038.43, cash: 6488.25, market: "沪A" },
  { date: "20260902", time: "09:30:59", code: "600551", name: "时代出版", side: "买入", sideType: "buy", qty: 600, price: 9.35, amount: 5610, fee: 5, tax: 0, net: -5615.06, cash: 6607.82, market: "沪A" },
  { date: "20260901", time: "09:35:00", code: "600127", name: "金健米业", side: "卖出", sideType: "sell", qty: 300, price: 12.6, amount: 3780, fee: 5, tax: 1.89, net: 3773.07, cash: 12222.88, market: "沪A" },
  { date: "20260901", time: "09:32:34", code: "600354", name: "敦煌种业", side: "卖出", sideType: "sell", qty: 100, price: 8.45, amount: 845, fee: 5, tax: 0.42, net: 839.57, cash: 8449.81, market: "沪A" },
  { date: "20260831", time: "15:00:00", code: "600127", name: "金健米业", side: "买入", sideType: "buy", qty: 300, price: 12.04, amount: 3612, fee: 5, tax: 0, net: -3617.04, cash: 7610.24, market: "沪A" },
  { date: "20260831", time: "13:37:25", code: "600354", name: "敦煌种业", side: "买入", sideType: "buy", qty: 100, price: 9.03, amount: 903, fee: 5, tax: 0, net: -908.01, cash: 11227.28, market: "沪A" },
  { date: "20260831", time: "10:19:48", code: "600721", name: "百花医药", side: "卖出", sideType: "sell", qty: 500, price: 13.9, amount: 6950, fee: 5, tax: 3.48, net: 6941.45, cash: 6955.93, market: "沪A" },
  { date: "20260831", time: "09:31:04", code: "600378", name: "昊华科技", side: "卖出", sideType: "sell", qty: 100, price: 51.87, amount: 5187, fee: 5, tax: 2.59, net: 5179.36, cash: 12135.29, market: "沪A" },
];

const ignoredOrders = [];

const dailyReviews = {};

const dailyNotes = [
  { date: "20260831", day: "周一", theme: "旧仓兑现 + 农业尾盘试错", action: "卖出昊华科技100股、百花医药500股；午后买入敦煌种业100股，尾盘买入金健米业300股。", review: "旧仓处理后转向农业线，金健米业次日形成小赚闭环，敦煌种业次日小亏止损。日度操作&情绪原文待补，本页先按交割行为占位。" },
  { date: "20260901", day: "周二", theme: "农业试错快速闭环", action: "卖出敦煌种业100股、金健米业300股。", review: "金健米业实现约+156.03，敦煌种业约-68.44。这里能看出快进快出纪律在线，但需要补当日对农业题材强弱、卖点是否过早/过慢的反思。" },
  { date: "20260902", day: "周三", theme: "时代出版接力试错", action: "早盘买入时代出版600股。", review: "时代出版次日亏损闭环约-576.63，是本周可见最大亏损票。需要补充买入逻辑：是文化传媒题材回流、连板接力、还是反抽套利。" },
  { date: "20260903", day: "周四", theme: "时代止损后切入欢瑞世纪", action: "早盘卖出时代出版600股；中午前后买入欢瑞世纪900股。", review: "同日从时代出版切换到欢瑞世纪，说明仍在传媒/影视方向继续试错。若板块强度并未确认，容易出现亏损后继续在同方向加风险。" },
  { date: "20260904", day: "周五", theme: "欢瑞世纪亏损闭环", action: "早盘卖出欢瑞世纪900股。", review: "欢瑞世纪可见闭环约-476.34，和时代出版一起构成本周主要可见亏损。后续需要用二次反思确认：亏损来自题材退潮、非唯一核心、追高接力，还是卖点纪律问题。" },
];

const accountDays = [];

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
  { label: "08.31-09.04", folder: week.folder, pnl: "账户待补", pct: "待补", equity: "待补", note: "成交截图草稿；账户日收益、期末持仓、历史成本和二次反思待补。" },
];

const secids = {
  "000892": "0.000892",
  "600551": "1.600551",
  "600127": "1.600127",
  "600354": "1.600354",
  "600721": "1.600721",
  "600378": "1.600378",
};

function dailyPage(dateLabel, nextLabel) {
  return encodeURI(`https://travelstocks.github.io/daily-trading-review/pages/章盟主式超短全景复盘（${dateLabel}）+ ${nextLabel}个股板块预案 - AI文档.html`).replace(/\+/g, "%2B");
}

const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFmt = new Intl.NumberFormat("en-US");

function money(value, options = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
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
  const lots = [];
  let realized = 0;
  for (const row of sortChronological(rows)) {
    if (row.sideType === "buy") {
      lots.push({ qty: row.qty, costPerShare: Math.abs(row.net ?? row.amount) / row.qty });
      continue;
    }

    let remaining = row.qty;
    const sellPrice = (row.net ?? row.amount) / row.qty;
    while (remaining > 0 && lots.length) {
      const lot = lots[0];
      const used = Math.min(remaining, lot.qty);
      realized += used * (sellPrice - lot.costPerShare);
      lot.qty -= used;
      remaining -= used;
      if (lot.qty <= 0.00001) lots.shift();
    }
  }

  const openQty = lots.reduce((total, lot) => total + lot.qty, 0);
  const openCost = lots.reduce((total, lot) => total + lot.qty * lot.costPerShare, 0);
  return { realized, openQty, openCost };
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
const accountReturnSum = accountDays.reduce((total, day) => total + (typeof day.returnRate === "number" ? day.returnRate : 0), 0);
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
  return value >= 0 ? "is-profit" : "is-loss";
}

function actionClass(sideType) {
  return sideType === "buy" ? "is-buy" : "is-sell";
}

function pct(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "待补";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

async function fetchTrend(code) {
  const secid = secids[code];
  if (!secid || typeof fetch !== "function") return [];

  const url = new URL("https://push2his.eastmoney.com/api/qt/stock/trends2/get");
  url.searchParams.set("secid", secid);
  url.searchParams.set("fields1", "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11");
  url.searchParams.set("fields2", "f51,f52,f53,f54,f55,f56,f57,f58");
  url.searchParams.set("ndays", "5");
  url.searchParams.set("iscr", "0");
  url.searchParams.set("iscca", "0");
  url.searchParams.set("ut", "fa5fd1943c7b386f172d6893dbfba10b");

  try {
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) return [];
    const json = await response.json();
    const trends = json?.data?.trends || [];
    return trends
      .map((line) => {
        const parts = line.split(",");
        const dt = parts[0];
        const price = Number(parts[2]);
        if (!dt || !Number.isFinite(price)) return null;
        return { dt, date: dt.slice(0, 10), time: dt.slice(11, 16), price };
      })
      .filter((point) => point && point.date >= "2026-08-31" && point.date <= "2026-09-04");
  } catch {
    return [];
  }
}

function renderTrendSvg(stock, points) {
  const rows = sortChronological(stock.rows);
  if (!points.length) {
    return `<div class="chart-empty"><b>行情图待校准</b><span>行情接口未返回 ${week.rangeText} 的5分钟数据，先保留成交点明细。补充K线截图后可重新生成买卖点图。</span></div>`;
  }

  const width = 920;
  const height = 280;
  const left = 54;
  const right = 26;
  const top = 28;
  const bottom = 46;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const prices = [...points.map((point) => point.price), ...rows.map((row) => row.price)];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const pad = Math.max((maxPrice - minPrice) * 0.12, maxPrice * 0.004, 0.01);
  const low = minPrice - pad;
  const high = maxPrice + pad;
  const x = (index) => left + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth);
  const y = (price) => top + ((high - price) / (high - low)) * chartHeight;
  const pathLine = points.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index).toFixed(1)},${y(point.price).toFixed(1)}`).join(" ");
  const uniqueDays = [];
  for (let index = 0; index < points.length; index += 1) {
    if (!uniqueDays.some((day) => day.date === points[index].date)) {
      uniqueDays.push({ date: points[index].date, index });
    }
  }

  const markers = rows.map((row) => {
    const target = `${isoDate(row.date)} ${row.time.slice(0, 5)}`;
    let bestIndex = 0;
    let bestDiff = Number.POSITIVE_INFINITY;
    const targetTime = new Date(`${target}:00+08:00`).getTime();
    points.forEach((point, index) => {
      const currentTime = new Date(`${point.dt}:00+08:00`).getTime();
      const diff = Math.abs(currentTime - targetTime);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIndex = index;
      }
    });
    const markerX = x(bestIndex);
    const markerY = y(row.price);
    const labelY = row.sideType === "buy" ? markerY - 12 : markerY + 19;
    return `<g class="trade-marker ${row.sideType}">
      <circle cx="${markerX.toFixed(1)}" cy="${markerY.toFixed(1)}" r="5.5"></circle>
      <text x="${markerX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle">${row.sideType === "buy" ? "B" : "S"} ${row.time.slice(0, 5)}</text>
      <title>${formatDate(row.date)} ${row.time} ${row.side} ${qty(row.qty)} @ ${row.price.toFixed(3)}</title>
    </g>`;
  }).join("");

  const axis = [low, (low + high) / 2, high].map((price) => {
    const yy = y(price);
    return `<g><line x1="${left}" x2="${width - right}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}"></line><text x="${left - 10}" y="${(yy + 4).toFixed(1)}" text-anchor="end">${price.toFixed(stock.code.startsWith("5") ? 3 : 2)}</text></g>`;
  }).join("");

  const dayTicks = uniqueDays.map((day) => {
    const xx = x(day.index);
    return `<g class="day-tick"><line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${top}" y2="${height - bottom}"></line><text x="${xx.toFixed(1)}" y="${height - 18}" text-anchor="middle">${day.date.slice(5)}</text></g>`;
  }).join("");

  return `<svg class="stock-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(stock.name)} 5分钟走势与成交点">
    <rect x="0" y="0" width="${width}" height="${height}" rx="10"></rect>
    <g class="axis">${axis}</g>
    <g class="day-grid">${dayTicks}</g>
    <path d="${pathLine}" fill="none"></path>
    ${markers}
  </svg>`;
}

function metricCard(label, value, foot, className = "") {
  return `<article class="metric"><span>${label}</span><strong class="${className}">${value}</strong><small>${foot}</small></article>`;
}

function isHistoricalSellOnly(stock) {
  return stock.sellQty > 0 && stock.buyQty === 0;
}

function realizedText(stock) {
  return isHistoricalSellOnly(stock) ? "历史成本待补" : money(stock.realized, { sign: true });
}

function realizedClass(stock) {
  return isHistoricalSellOnly(stock) ? "" : classByValue(stock.realized);
}

function renderStockCards(charts) {
  return byCode.map((stock) => {
    const realizedClassName = realizedClass(stock);
    const tradeCount = stock.rows.length;
    const openText = stock.openQty ? `${qty(stock.openQty)} 股/份，按FIFO成本约 ${rawMoney(stock.openCost)}` : "已清仓";
    const note = stockNote(stock);
    return `<article class="stock-card" id="stock-${stock.code}">
      <div class="stock-card-head">
        <div><span class="code">${stock.code}</span><h3>${stock.name}</h3></div>
        <span class="chip">${tradeCount} 笔</span>
      </div>
      <div class="stock-metrics">
        <span>买入 <b>${qty(stock.buyQty)}</b><em>${rawMoney(stock.buyAmount)} / 现金${rawMoney(stock.buyCash)}</em></span>
        <span>卖出 <b>${qty(stock.sellQty)}</b><em>${rawMoney(stock.sellAmount)} / 到账${rawMoney(stock.sellCash)}</em></span>
        <span>可见已实现 <b class="${realizedClassName}">${realizedText(stock)}</b><em>FIFO / 含截图费用</em></span>
        <span>期末可见 <b>${openText}</b><em>持仓截图待校准</em></span>
      </div>
      <p>${note}</p>
      <div class="chart-frame">${charts[stock.code] || renderTrendSvg(stock, [])}</div>
    </article>`;
  }).join("");
}

function stockNote(stock) {
  const notes = {
    "000892": "欢瑞世纪是本周第二个清楚亏损闭环：9/3 中午前后两笔买入900股，9/4早盘卖出，含费用约-476.34，约-9.23%。从成交行为看，更像亏损后继续在传媒/影视方向寻找修复，后续需要补充当日题材地位和买点确认。",
    "600551": "时代出版是本周可见最大亏损票：9/2早盘买入600股，9/3早盘卖出，含费用约-576.63，约-10.27%。这笔需要重点复盘买入前是否确认了题材强度、唯一性和次日承接预期。",
    "600127": "金健米业是本周可见主要盈利票：8/31尾盘买入300股，9/1早盘卖出，含费用约+156.03，约+4.31%。它说明农业线短线试错里，隔日能快速兑现利润是对的。",
    "600354": "敦煌种业8/31午后买入100股，9/1早盘卖出，含费用约-68.44，约-7.54%。小亏可控，但说明同方向试错里不是所有票都具备足够强度，后续要分清第一性和跟随性。",
    "600721": "百花医药8/31卖出500股，到账约6,941.45。截图没有本次持仓买入成本，本页只记录卖出动作，真实盈亏等待历史成本补齐后校准。",
    "600378": "昊华科技8/31卖出100股，到账约5,179.36。截图没有本次持仓买入成本，本页只记录卖出动作，真实盈亏等待历史成本补齐后校准。",
  };
  return notes[stock.code] || "成交回报口径已记录，等待补充账户和持仓数据后做最终归因。";
}

function stockFigure(code) {
  const stock = stockByCode.get(code);
  if (!stock) return "待补";
  return money(stock.realized, { sign: true });
}

function stockPctFigure(code) {
  const stock = stockByCode.get(code);
  if (!stock || !stock.buyCash || !stock.sellQty) return "成本待补";
  return pct((stock.realized / stock.buyCash) * 100);
}

function renderProfitLossPanel() {
  return `<section class="panel" id="profit-loss">
    <span class="label">Profit / Loss Roots</span>
    <h2>本周赚钱/亏损主要票及其分析</h2>
    <div class="thesis-grid">
      <article>
        <b>主要赚钱：金健米业 ${stockFigure("600127")} / ${stockPctFigure("600127")}</b>
        <p>8/31尾盘买入，9/1早盘卖出，短线闭环小赚。赚钱根源是试错后没有拖泥带水，隔日有利润就兑现；但是否是农业线最强、是否卖早，需要等日度复盘和二次反思补齐后再定稿。</p>
      </article>
      <article>
        <b>主要亏损：时代出版 ${stockFigure("600551")} / ${stockPctFigure("600551")}</b>
        <p>9/2早盘买入，9/3早盘止损，是本周可见最大亏损。亏损根源暂定为“接力/题材地位未完全确认就上手”，需要补充当日传媒/文化方向的强弱排序和情绪背景。</p>
      </article>
      <article>
        <b>连续亏损：欢瑞世纪 ${stockFigure("000892")} / ${stockPctFigure("000892")}</b>
        <p>时代出版止损后，当天继续买入欢瑞世纪，次日再亏损卖出。两笔都在传媒/影视线附近，后面重点要确认：这是板块回流失败，还是非唯一核心的连续试错。</p>
      </article>
    </div>
    <div class="rules">
      <article><span>01</span><b>赚钱根源</b><p>金健米业盈利来自尾盘试错后隔日快速兑现，先手和卖出纪律都比较清楚。</p></article>
      <article><span>02</span><b>亏损根源</b><p>时代出版、欢瑞世纪共同指向“题材地位和唯一性待验证”，不是简单卖点问题。</p></article>
      <article><span>03</span><b>待核算票</b><p>百花医药、昊华科技只有卖出记录，缺历史成本，不能把现金到账直接当盈利。</p></article>
      <article><span>04</span><b>下周重点</b><p>亏损后不要在同一弱方向连续找补，先确认板块回流、唯一核心和买点级别。</p></article>
    </div>
  </section>`;
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
      <p class="lead">这部分按账户日收益表记录，和成交回报/FIFO闭环分开看。本周账户日收益、收益率、平均仓位和期末权益暂缺，先保留表格位置，等你补数据后直接校准。</p>
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

function renderDailyCards() {
  return dailyNotes.map((day) => {
    const stat = dailyStats.get(day.date) || { buyAmount: 0, sellAmount: 0, buyQty: 0, sellQty: 0, turnover: 0, rows: [] };
    const review = dailyReviews[day.date];
    const account = accountByDate.get(day.date);
    const sourceLink = review ? `<a href="${review.href}" target="_blank" rel="noreferrer">${review.title}</a>` : `<span>日度复盘待补</span>`;
    return `<article class="day-card">
      <div class="day-card-head"><div><b>${day.day}</b><span>${formatDate(day.date)}</span></div><strong>${day.theme}</strong></div>
      <div class="day-numbers">
        <span>成交笔数 <b>${stat.rows.length}</b></span>
        <span>买入金额 <b>${rawMoney(stat.buyAmount)}</b></span>
        <span>卖出金额 <b>${rawMoney(stat.sellAmount)}</b></span>
        <span>成交额 <b>${rawMoney(stat.turnover)}</b></span>
      </div>
      <p><b>操作：</b>${day.action}</p>
      <p><b>复盘：</b>${day.review}</p>
      ${account && typeof account.pnl === "number" ? `<div class="account-strip">
        <span>收益率 <b class="${classByValue(account.returnRate)}">${pct(account.returnRate)}</b></span>
        <span>收益 <b class="${classByValue(account.pnl)}">${money(account.pnl, { sign: true })}</b></span>
        <span>仓位 <b>${account.position.toFixed(2)}%</b></span>
        <span>总金额 <b>${typeof account.equity === "number" ? rawMoney(account.equity) : "未填"}</b></span>
      </div><p><b>个人反思：</b>${account.reflection}</p>` : `<div class="account-strip"><span>账户收益 <b>待补</b></span><span>仓位 <b>待补</b></span></div>`}
      <div class="source-line">${sourceLink}${review ? `<small>${review.emotion}</small>` : "<small>后续补充日度复盘文本后再同步。</small>"}</div>
    </article>`;
  }).join("");
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
  const rules = [
    ["旧仓另算", "百花医药、昊华科技只有本周卖出记录，没有对应买入成本；必须补历史成本后再核算，不把现金到账误判成盈利。"],
    ["闭环先看地位", "时代出版、欢瑞世纪亏损都要回到题材地位复盘：是否第一性、是否唯一性、是否只是跟风修复。"],
    ["亏损后停一下", "时代出版亏损后继续切欢瑞世纪，容易变成同方向找补；亏损日要先确认板块是否还在给机会。"],
    ["小赚要复盘卖点", "金健米业小赚兑现是正反馈，但也要补日度复盘确认：卖出是纪律兑现，还是卖早。"],
    ["同题材只做前排", "农业、传媒、影视这种轮动线，如果没有清楚的板块第一和全场辨识度，就只能轻仓快验。"],
    ["隔日不强就走", "接力/套利票买入前必须写好隔日处理：低开、冲高、弱反、不能回均线分别怎么做。"],
    ["账户口径分离", "成交净流入不是账户收益；期末持仓市值、浮盈亏、总资产和日收益表必须单独补齐。"],
    ["图形只辅助", "5分钟线标买卖点用于复盘节奏，不替代成交单；真正归因仍看题材、地位、周期和纪律。"],
  ];
  return rules.map(([title, body], index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><b>${title}</b><p>${body}</p></article>`).join("");
}

function renderWeekPage(charts) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${week.rangeText} 周度交易复盘</title>
  <style>${sharedStyles()}</style>
</head>
<body>
  <nav class="rail" aria-label="页面导航">
    <a href="../weekly-trading-review/">周度主页</a>
    <a href="../">总入口</a>
    <a href="#overview">总览</a>
    <a href="#profit-loss">盈亏票</a>
    <a href="#account">账户</a>
    <a href="#stocks">标的</a>
    <a href="#daily">逐日</a>
    <a href="#rules">规则</a>
    <a href="#trades">成交</a>
  </nav>
  <main class="page-shell">
    <section class="hero" id="overview">
      <div>
        <span class="label">${week.status} / 成交回报口径</span>
        <h1><span class="date-range"><span>2026.08.31 -</span><span>2026.09.04</span></span>周度交易复盘</h1>
        <p>${week.subtitle}</p>
        <div class="button-row">
          <a class="button" href="../weekly-trading-review/">返回周度主页</a>
          <a class="button secondary" href="#missing">待补清单</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("成交笔数", `${trades.length}`, "仅统计截图中“已成”记录")}
        ${metricCard("账户日收益", accountPnlLabel, `日收益率合计 ${accountReturnLabel}`, knownAccountDays.length ? classByValue(accountPnlTotal) : "")}
        ${metricCard("期末总金额", finalEquityLabel, `仓位 ${finalPositionLabel} / 现金 ${finalCash === null ? "待补" : rawMoney(finalCash)}`)}
        ${metricCard("可见闭环盈亏", money(visibleRealized, { sign: true }), "同周买卖FIFO，含截图费用", classByValue(visibleRealized))}
      </div>
    </section>

    <section class="panel thesis-panel">
      <span class="label">Week Thesis</span>
      <h2>这一周先写成一个核心问题</h2>
      <p class="lead">本周先版的核心问题是：旧仓卖出后，新的短线闭环质量不够稳定。金健米业小赚，说明有利润能走；但时代出版和欢瑞世纪连续亏损，说明在传媒/影视方向的题材地位、唯一性和买点级别还需要重新核对。账户收益和仓位待补，所以这里先不下最终周级结论。</p>
      <div class="thesis-grid">
        <article><b>做对</b><p>金健米业隔日小赚兑现，说明尾盘试错后次日快速处理是有效的，没有把套利票拖成被动持仓。</p></article>
        <article><b>待优化</b><p>时代出版和欢瑞世纪连续亏损，重点不是单笔买卖价差，而是进入前有没有确认板块回流、个股唯一性和隔日承接预期。</p></article>
        <article><b>待确认</b><p>百花医药、昊华科技是历史仓卖出，缺买入成本；账户日收益、仓位、期末总资产和二次反思也需要你后续补齐。</p></article>
      </div>
    </section>

    <section class="panel data-panel">
      <div>
        <span class="label">Data Scope</span>
        <h2>本版数据口径</h2>
        <p>截图是成交查询，不包含期末持仓市值和历史买入成本。本页按“发生金额”复盘本周能闭环的票；百花医药、昊华科技因缺历史成本暂不计算真实盈亏，账户收益表和期末持仓截图补齐后再校准。</p>
      </div>
      <div class="summary-grid">
        <span>买入笔数 <b>${buyRows.length}</b></span>
        <span>卖出笔数 <b>${sellRows.length}</b></span>
        <span>买入金额 <b>${rawMoney(buyAmount)}</b></span>
        <span>卖出金额 <b>${rawMoney(sellAmount)}</b></span>
        <span>现金差额 <b class="${classByValue(netCash)}">${money(netCash, { sign: true })}</b></span>
        <span>费用合计 <b>${rawMoney(feeTotal + taxTotal)}</b></span>
      </div>
    </section>

    ${renderProfitLossPanel()}

    ${renderAccountPanel()}

    <section class="panel" id="stocks">
      <span class="label">Stock Review</span>
      <h2>标的复盘与买卖点</h2>
      <div class="table-wrap compact-table"><table>
        <thead><tr><th>标的</th><th>买入数量</th><th>买入金额</th><th>卖出数量</th><th>卖出金额</th><th>可见已实现</th><th>期末可见</th></tr></thead>
        <tbody>${renderCodeSummaryRows()}</tbody>
      </table></div>
      <div class="stock-grid">${renderStockCards(charts)}</div>
    </section>

    <section class="panel" id="daily">
      <span class="label">Daily Review</span>
      <h2>逐日复盘</h2>
      <div class="day-grid-cards">${renderDailyCards()}</div>
    </section>

    <section class="panel" id="rules">
      <span class="label">Second Review</span>
      <h2>二次复盘沉淀</h2>
      <p class="lead">二次复盘待补。当前先沉淀成交单能看出的临时规则：本周真正需要解释的是时代出版、欢瑞世纪为什么连续亏损，以及金健米业为什么能小赚兑现；等你补充每日操作&情绪复盘后，再把这里整理成完整的Keep / Improve / Start / Stop。</p>
      <div class="thesis-grid">
        <article><b>赚钱票先问原因</b><p>金健米业的小赚要确认是农业方向地位做对，还是单纯隔日卖点执行好；两者对应的下周规则不同。</p></article>
        <article><b>亏损票先问地位</b><p>时代出版、欢瑞世纪都需要回到“是否第一、是否唯一、是否有板块承接”三个问题，不能只复盘卖点。</p></article>
        <article><b>旧仓不要混算</b><p>百花医药和昊华科技卖出只代表释放现金，真实盈亏必须等历史成本补齐，避免账户口径和成交口径混在一起。</p></article>
      </div>
      <div class="rules">${renderRules()}</div>
    </section>

    <section class="panel" id="trades">
      <span class="label">Transactions</span>
      <h2>成交明细</h2>
      ${renderTradeTable()}
    </section>

    <section class="panel" id="ignored">
      <span class="label">Orders Not Booked</span>
      <h2>撤单 / 废单 / 已报</h2>
      <p>这些记录不计入成交和盈亏，只作为操作意图核对。若后续你给完整交割单，以交割单为准。</p>
      ${renderIgnoredOrders()}
    </section>

    <section class="panel missing-panel" id="missing">
      <span class="label">To Fill</span>
      <h2>后续待补内容</h2>
      <div class="missing-list">
        <article><b>1. 账户日收益表</b><p>需要 8/31-9/4 每日收益率、收益金额、仓位、当前总金额，用来补账户曲线和周度主页汇总。</p></article>
        <article><b>2. 期末持仓截图</b><p>确认 9/4 收盘是否空仓、现金余额、持仓市值和总资产；成交截图最后一笔现金余额为 11,169.91，只能作交易后现金参考。</p></article>
        <article><b>3. 历史持仓成本</b><p>百花医药500股、昊华科技100股只有卖出记录，需要补买入成本/上周结转成本后计算真实盈亏。</p></article>
        <article><b>4. 日度与二次反思</b><p>每日操作&情绪复盘、二次反思、主要赚钱亏损票的主观归因待补；我会据此替换当前占位文案。</p></article>
      </div>
    </section>
  </main>
</body>
</html>`;
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
        <p>每周一个独立页面，记录成交单、买卖点、账户变化、逐日复盘和当周新增交易纪律。最新周为 2026.08.31-09.04，当前为成交截图草稿，账户日收益、期末持仓、历史成本和二次反思待补。</p>
        <div class="button-row">
          <a class="button" href="../${week.folder}/">进入最新周复盘</a>
          <a class="button secondary" href="../index.html">返回总首页</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("周报数量", `${archiveWeeks.length}`, "含本周草稿")}
        ${metricCard("最新区间", "08.31", "至 09.04")}
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
      <p>本周先版基于成交截图：金健米业小赚，时代出版与欢瑞世纪构成本周主要可见亏损；百花医药、昊华科技为历史仓卖出，真实盈亏待补成本后校准。账户日收益合计 ${accountPnlLabel}，期末总金额 ${finalEquityLabel}。</p>
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
        ${metricCard("最新区间", "08.31", "至 09.04")}
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
        <span>周收益 <b>${item.pct}</b></span>
        <span>期末权益 <b>${item.equity}</b></span>
      </div>
    </a>`;
  };
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
    .account-bars{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:18px 0}
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
    @media(max-width:560px){.page-shell,.rail{width:calc(100% - 16px);max-width:100%;margin-left:auto;margin-right:auto}.rail{grid-template-columns:repeat(2,minmax(0,1fr))}.day-grid-cards,.account-bars,.account-strip{grid-template-columns:1fr}h1{font-size:34px}.metric strong{font-size:19px}}
  `;
}

async function main() {
  const charts = {};
  await Promise.all(byCode.map(async (stock) => {
    charts[stock.code] = renderTrendSvg(stock, await fetchTrend(stock.code));
  }));

  fs.mkdirSync(weekDir, { recursive: true });
  fs.writeFileSync(path.join(weekDir, "index.html"), renderWeekPage(charts), "utf8");
  fs.writeFileSync(path.join(repo, "weekly-trading-review", "index.html"), renderWeeklyHub(), "utf8");
  fs.writeFileSync(path.join(repo, "index.html"), renderRootIndex(), "utf8");
  require("./update-weekly-hub-chart.js");

  console.log(`Wrote ${path.relative(repo, weekDir)}\\index.html`);
  console.log("Updated weekly-trading-review\\index.html");
  console.log("Updated index.html");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
