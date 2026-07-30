const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..");
const weekDir = path.join(repo, "2026-07-20_2026-07-24");

const week = {
  folder: "2026-07-20_2026-07-24",
  rangeText: "2026.07.20 - 2026.07.24",
  label: "07.20-07.24",
  status: "草稿版",
  title: "电力龙头做T兑现，科技轮动试错后转向医药",
  subtitle: "当前版本基于成交回报截图、本地日度复盘与账户日收益生成；手续费、期末持仓继续待补后再校准。",
};

const trades = [
  { date: "20260724", time: "10:05:05", code: "600664", name: "哈药股份", side: "买入", sideType: "buy", qty: 100, price: 5.4, amount: 540, market: "沪A" },
  { date: "20260724", time: "09:39:14", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 100, price: 12.99, amount: 1299, market: "深A" },
  { date: "20260724", time: "09:32:28", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 100, price: 12.85, amount: 1285, market: "深A" },
  { date: "20260724", time: "09:32:26", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 200, price: 12.81, amount: 2562, market: "深A" },
  { date: "20260724", time: "09:32:21", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 300, price: 12.95, amount: 3885, market: "深A" },
  { date: "20260724", time: "09:32:01", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 600, price: 13.2, amount: 7920, market: "深A" },
  { date: "20260723", time: "09:32:52", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 200, price: 12.11, amount: 2422, market: "深A" },
  { date: "20260723", time: "09:32:04", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 200, price: 12.11, amount: 2422, market: "深A" },
  { date: "20260723", time: "09:31:12", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 12.05, amount: 1205, market: "深A" },
  { date: "20260723", time: "09:31:07", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 12.08, amount: 1208, market: "深A" },
  { date: "20260723", time: "09:30:55", code: "588170", name: "科创半导体ETF华夏", side: "对方卖出", sideType: "sell", qty: 3800, price: 1.015, amount: 3857, market: "沪A" },
  { date: "20260723", time: "09:30:35", code: "000815", name: "美利云", side: "卖出", sideType: "sell", qty: 200, price: 16.3, amount: 3260, market: "深A" },
  { date: "20260723", time: "09:20:55", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 400, price: 12.08, amount: 4832, market: "深A" },
  { date: "20260722", time: "09:42:31", code: "588170", name: "科创半导体ETF华夏", side: "对方买入", sideType: "buy", qty: 1300, price: 1.042, amount: 1354.6, market: "沪A" },
  { date: "20260722", time: "09:37:39", code: "588170", name: "科创半导体ETF华夏", side: "对方买入", sideType: "buy", qty: 1600, price: 1.062, amount: 1699.2, market: "沪A" },
  { date: "20260722", time: "09:31:40", code: "588170", name: "科创半导体ETF华夏", side: "对方买入", sideType: "buy", qty: 900, price: 1.062, amount: 955.8, market: "沪A" },
  { date: "20260722", time: "09:30:09", code: "001258", name: "立新能源", side: "卖出", sideType: "sell", qty: 300, price: 10.5, amount: 3150, market: "深A" },
  { date: "20260722", time: "09:20:48", code: "000815", name: "美利云", side: "买入", sideType: "buy", qty: 200, price: 16.13, amount: 3226, market: "深A" },
  { date: "20260721", time: "09:51:57", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 9.89, amount: 989, market: "深A" },
  { date: "20260721", time: "09:51:53", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 9.85, amount: 985, market: "深A" },
  { date: "20260721", time: "09:44:47", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 9.85, amount: 985, market: "深A" },
  { date: "20260721", time: "09:14:43", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 300, price: 10.01, amount: 3003, market: "深A" },
];

const ignoredOrders = [
  { date: "20260724", time: "09:36:56", code: "001258", name: "立新能源", side: "卖出", status: "已撤", qty: 100, price: 13.18 },
  { date: "20260723", time: "09:31:50", code: "001258", name: "立新能源", side: "对方买入", status: "废单", qty: 200, price: 12.11 },
  { date: "20260723", time: "09:31:44", code: "001258", name: "立新能源", side: "对方买入", status: "废单", qty: 200, price: 12.11 },
  { date: "20260723", time: "00:10:34", code: "001258", name: "立新能源", side: "买入", status: "已撤", qty: 400, price: 12.11 },
  { date: "20260722", time: "10:13:59", code: "001258", name: "立新能源", side: "买入", status: "已报", qty: 400, price: 11.01 },
  { date: "20260722", time: "10:13:47", code: "001258", name: "立新能源", side: "对方买入", status: "废单", qty: 200, price: 11.01 },
  { date: "20260722", time: "09:36:10", code: "000815", name: "美利云", side: "对方买入", status: "废单", qty: 100, price: 16.13 },
  { date: "20260720", time: "10:07:55", code: "001258", name: "立新能源", side: "买入", status: "已报", qty: 100, price: 9.1 },
];

const dailyReviews = {
  "20260720": {
    title: "7/20 日度复盘",
    href: "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.7.17%20%E5%91%A8%E4%BA%94%20%2B%202026.7.20%20%E5%91%A8%E4%B8%80%EF%BC%89%2B%207.21%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3%EF%BC%88%E6%AD%A3%E5%BC%8F%E7%89%88%EF%BC%89.html",
    emotion: "冰点期；电力为次日唯一重点验证方向，AI应用、机器人、光伏负反馈未收敛。",
    focus: "立新能源若电力梯队继续完整可小仓试水，哈药股份只看趋势承接与板块修复。",
  },
  "20260722": {
    title: "7/22 日度复盘",
    href: "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.7.22%20%E5%91%A8%E4%B8%89%EF%BC%89%2B%207.23%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3.html",
    emotion: "退潮期；电力强度回流延续优先，重点看立新能源6板，科技线只看能否停止继续杀。",
    focus: "立新能源能顶住且开得不错可加大仓；美利云核心看能否摆脱科技负反馈。",
  },
};

const dailyNotes = [
  { date: "20260720", day: "周一", theme: "电力方向预热", action: "无已成成交，立新能源买入已报未成交。", review: "市场处在冰点期，日度复盘把电力列为次日唯一重点验证方向。这里的重点不是急着扫，而是等梯队完整、龙头承接确认。" },
  { date: "20260721", day: "周二", theme: "确认后试错立新能源", action: "立新能源分四笔买入600股，成交金额5,962.00。", review: "方向选择比较集中，核心在电力龙头，但仓位仍偏保守。当天小赚，问题是空仓错过科技大反弹后没有更果断地追最强回流。" },
  { date: "20260722", day: "周三", theme: "兑现一部分，切入科技轮动", action: "卖出立新能源300股；买入科创半导体ETF华夏3,800份与美利云200股。", review: "日度复盘定义为退潮期，电力仍优先，科技只能看弱修复。ETF和美利云属于轮动试错，后面需要用强度确认，不能按主线仓位处理。" },
  { date: "20260723", day: "周四", theme: "科技试错退出，回到电力龙头", action: "科创半导体ETF华夏全卖；美利云卖出；立新能源再买入1,000股。", review: "科创半导体ETF按可见成交亏损152.60，美利云小赚34.00。核心动作是从弱修复轮动撤回，再集中到立新能源做T。" },
  { date: "20260724", day: "周五", theme: "高位兑现与医药试错", action: "立新能源分五笔卖出1,300股；买入哈药股份100股。", review: "立新能源卖点集中在早盘高位附近，兑现动作较果断。哈药股份属于医药方向重新试错，期末持仓成本和浮盈亏需要等账户截图补齐。" },
];

const accountDays = [
  { date: "20260720", day: "周一", returnRate: 0, pnl: 0, position: 0, equity: null, reflection: "熊市不敢多操作，直接空仓" },
  { date: "20260721", day: "周二", returnRate: 0.15, pnl: 24, position: 37.5, equity: 15596, reflection: "空仓错过科技大反弹，小仓位继续试错龙头，应该追反弹的！" },
  { date: "20260722", day: "周三", returnRate: 1.85, pnl: 293.4, position: 64.4, equity: 16149.76, reflection: "小仓位做对龙头" },
  { date: "20260723", day: "周四", returnRate: 2.04, pnl: 329, position: 100, equity: 16149.76, reflection: "加仓龙头晚了一点，要不然更爽了；转强次日没有更早打上仓位！！！！！！！" },
  { date: "20260724", day: "周五", returnRate: 7.1, pnl: 1170, position: 3.7, equity: 17648.65, reflection: "稍微出去早了一点，利润少了两个点，但总体上来说是没问题的！" },
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
  { label: "07.20-07.24", folder: week.folder, pnl: "+1,816.40", pct: "日度见表", equity: "17,648.65", note: "账户日收益已补；手续费与期末持仓继续待校准。" },
];

const secids = {
  "001258": "0.001258",
  "588170": "1.588170",
  "000815": "0.000815",
  "600664": "1.600664",
};

const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFmt = new Intl.NumberFormat("en-US");

function money(value, options = {}) {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
  const sign = options.sign && value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${fmt.format(Math.abs(value))}`;
}

function rawMoney(value) {
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
        rows: [],
      });
    }
    const item = grouped.get(row.code);
    item.rows.push(row);
    if (row.sideType === "buy") {
      item.buyQty += row.qty;
      item.buyAmount += row.amount;
    } else {
      item.sellQty += row.qty;
      item.sellAmount += row.amount;
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
      grouped.set(row.date, { date: row.date, buyAmount: 0, sellAmount: 0, buyQty: 0, sellQty: 0, turnover: 0, rows: [] });
    }
    const item = grouped.get(row.date);
    item.rows.push(row);
    item.turnover += row.amount;
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
      lots.push({ qty: row.qty, costPerShare: row.amount / row.qty });
      continue;
    }

    let remaining = row.qty;
    const sellPrice = row.amount / row.qty;
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
const netCash = sellAmount - buyAmount;
const byCode = groupByCode(trades);
const dailyStats = groupByDate(trades);
const visibleRealized = byCode.reduce((total, item) => total + item.realized, 0);
const openCost = byCode.reduce((total, item) => total + item.openCost, 0);
const openPositions = byCode.filter((item) => item.openQty > 0);
const accountByDate = new Map(accountDays.map((day) => [day.date, day]));
const accountPnlTotal = sum(accountDays, "pnl");
const finalAccountDay = [...accountDays].reverse().find((day) => typeof day.equity === "number");
const finalEquity = finalAccountDay?.equity || 0;
const finalPosition = finalAccountDay?.position || 0;
const maxDailyPnl = Math.max(...accountDays.map((day) => Math.abs(day.pnl)), 1);
const avgPosition = accountDays.reduce((total, day) => total + day.position, 0) / accountDays.length;
const bestAccountDay = accountDays.reduce((best, day) => (day.pnl > best.pnl ? day : best), accountDays[0]);

function classByValue(value) {
  return value >= 0 ? "is-profit" : "is-loss";
}

function actionClass(sideType) {
  return sideType === "buy" ? "is-buy" : "is-sell";
}

function pct(value) {
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
      .filter((point) => point && point.date >= "2026-07-20" && point.date <= "2026-07-24");
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

function renderStockCards(charts) {
  return byCode.map((stock) => {
    const realizedClass = classByValue(stock.realized);
    const tradeCount = stock.rows.length;
    const openText = stock.openQty ? `${qty(stock.openQty)} 股/份，按FIFO成本约 ${rawMoney(stock.openCost)}` : "已清仓";
    const note = stockNote(stock);
    return `<article class="stock-card" id="stock-${stock.code}">
      <div class="stock-card-head">
        <div><span class="code">${stock.code}</span><h3>${stock.name}</h3></div>
        <span class="chip">${tradeCount} 笔</span>
      </div>
      <div class="stock-metrics">
        <span>买入 <b>${qty(stock.buyQty)}</b><em>${rawMoney(stock.buyAmount)}</em></span>
        <span>卖出 <b>${qty(stock.sellQty)}</b><em>${rawMoney(stock.sellAmount)}</em></span>
        <span>可见已实现 <b class="${realizedClass}">${money(stock.realized, { sign: true })}</b><em>FIFO / 未计费</em></span>
        <span>期末可见 <b>${openText}</b><em>持仓截图待校准</em></span>
      </div>
      <p>${note}</p>
      <div class="chart-frame">${charts[stock.code] || renderTrendSvg(stock, [])}</div>
    </article>`;
  }).join("");
}

function stockNote(stock) {
  const notes = {
    "001258": "本周核心交易。周二完成电力龙头试错，周三先兑现300股后又在更高位置重新买回，周五早盘集中卖出1200股。卖点强于买点，后续要把“龙头强度确认后再加”写成硬规则。",
    "588170": "科技轮动试错。周三买入后周四全部卖出，按成交回报口径亏损152.60。它提示退潮期ETF不要用主线仓位处理，弱修复要更快验证。",
    "000815": "美利云是科技线独立性试错，买入后次日卖出，可见小赚34.00。虽然结果不差，但它依赖科技负反馈能否收敛，确定性弱于电力龙头。",
    "600664": "周五买入100股，属于医药方向试错仓。当前只知道买入成本540.00，是否继续持有、浮盈亏和处理计划需要期末持仓截图补齐。",
  };
  return notes[stock.code] || "成交回报口径已记录，等待补充账户和持仓数据后做最终归因。";
}

function renderAccountPanel() {
  return `<section class="panel account-panel" id="account">
      <span class="label">Account Curve</span>
      <h2>账户收益与仓位</h2>
      <p class="lead">这部分按你补充的账户日数据记录，和成交回报/FIFO推演分开看。周一总金额为空，先保留为空仓日，不强行补数。</p>
      <div class="account-summary">
        <span>日收益合计 <b class="${classByValue(accountPnlTotal)}">${money(accountPnlTotal, { sign: true })}</b></span>
        <span>期末总金额 <b>${rawMoney(finalEquity)}</b></span>
        <span>周五收益率 <b class="${classByValue(finalAccountDay.returnRate)}">${pct(finalAccountDay.returnRate)}</b></span>
        <span>平均仓位 <b>${avgPosition.toFixed(2)}%</b></span>
        <span>最高仓位 <b>100.00%</b></span>
        <span>最佳单日 <b>${bestAccountDay.day} ${money(bestAccountDay.pnl, { sign: true })}</b></span>
      </div>
      <div class="account-bars">${accountDays.map(renderAccountBar).join("")}</div>
      <div class="table-wrap compact-table"><table>
        <thead><tr><th>日期</th><th>星期</th><th>收益率</th><th>收益金额</th><th>仓位</th><th>当前总金额</th><th>个人反思</th></tr></thead>
        <tbody>${accountDays.map((day) => `<tr>
          <td>${formatDate(day.date)}</td>
          <td>${day.day}</td>
          <td class="${classByValue(day.returnRate)}">${pct(day.returnRate)}</td>
          <td class="${classByValue(day.pnl)}">${money(day.pnl, { sign: true })}</td>
          <td>${day.position.toFixed(2)}%</td>
          <td>${typeof day.equity === "number" ? rawMoney(day.equity) : "空仓 / 未填"}</td>
          <td class="reflection-cell">${day.reflection}</td>
        </tr>`).join("")}</tbody>
      </table></div>
    </section>`;
}

function renderAccountBar(day) {
  const barHeight = Math.max(6, Math.round((Math.abs(day.pnl) / maxDailyPnl) * 100));
  return `<article class="account-day">
    <div class="account-day-head"><b>${day.day}</b><span>${shortDate(day.date)}</span></div>
    <div class="account-bar-track"><i style="height:${barHeight}%"></i></div>
    <strong class="${classByValue(day.pnl)}">${money(day.pnl, { sign: true })}</strong>
    <small>${pct(day.returnRate)} / 仓位 ${day.position.toFixed(2)}%</small>
    <div class="position-meter" aria-label="${day.day} 仓位 ${day.position.toFixed(2)}%"><i style="width:${Math.max(0, Math.min(100, day.position))}%"></i></div>
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
      ${account ? `<div class="account-strip">
        <span>收益率 <b class="${classByValue(account.returnRate)}">${pct(account.returnRate)}</b></span>
        <span>收益 <b class="${classByValue(account.pnl)}">${money(account.pnl, { sign: true })}</b></span>
        <span>仓位 <b>${account.position.toFixed(2)}%</b></span>
        <span>总金额 <b>${typeof account.equity === "number" ? rawMoney(account.equity) : "未填"}</b></span>
      </div><p><b>个人反思：</b>${account.reflection}</p>` : ""}
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
    <td>${row.market}</td>
  </tr>`).join("");

  return `<div class="table-wrap"><table>
    <thead><tr><th>成交时间</th><th>代码</th><th>名称</th><th>操作</th><th>数量</th><th>成交均价</th><th>成交金额</th><th>市场</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

function renderIgnoredOrders() {
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
    <td class="${classByValue(stock.realized)}">${money(stock.realized, { sign: true })}</td>
    <td>${stock.openQty ? `${qty(stock.openQty)} / ${rawMoney(stock.openCost)}` : "已清仓"}</td>
  </tr>`).join("");
}

function renderRules() {
  const rules = [
    ["先判市场", "先判断牛熊/退潮/冰点，确认今天能不能进攻，再谈具体标的。"],
    ["再判题材", "题材要有逻辑、梯队和强度，强回流次日必须有一字二板顶强度。"],
    ["个股三面", "基本面、技术面、情绪面一起看，不能只因价格下跌就当成便宜。"],
    ["阻力最小", "判断压力支撑强度，耐心等价格阻力最小的方向出现突破。"],
    ["金字塔买入", "买的时候越买越高才买，买进后有利润才继续买。"],
    ["金字塔卖出", "卖的时候越卖越低才卖，卖出后有下跌才继续卖。"],
    ["不逆破位", "破位后的-2、-3不是安全区，杀到-5、-6本身就是弱势确认。"],
    ["停止犯错", "如果做错，唯一解法就是停止犯错。没有利润不再买，没有下跌不再卖。"],
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
    <a href="#account">账户待补</a>
    <a href="#stocks">标的</a>
    <a href="#daily">逐日</a>
    <a href="#rules">规则</a>
    <a href="#trades">成交</a>
  </nav>
  <main class="page-shell">
    <section class="hero" id="overview">
      <div>
        <span class="label">${week.status} / 成交回报口径</span>
        <h1><span class="date-range"><span>2026.07.20 -</span><span>2026.07.24</span></span>周度交易复盘</h1>
        <p>${week.subtitle}</p>
        <div class="button-row">
          <a class="button" href="../weekly-trading-review/">返回周度主页</a>
          <a class="button secondary" href="#missing">待补清单</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("成交笔数", `${trades.length}`, "仅统计截图中“已成”记录")}
        ${metricCard("账户日收益合计", money(accountPnlTotal, { sign: true }), `周五收益率 ${pct(finalAccountDay.returnRate)}`, classByValue(accountPnlTotal))}
        ${metricCard("当前总金额", rawMoney(finalEquity), `周五仓位 ${finalPosition.toFixed(2)}%`)}
        ${metricCard("可见已实现", money(visibleRealized, { sign: true }), "成交FIFO推演，未计手续费/税费", classByValue(visibleRealized))}
      </div>
    </section>

    <section class="panel thesis-panel">
      <span class="label">Week Thesis</span>
      <h2>这一周先写成一个核心问题</h2>
      <p class="lead">本周交易核心不是“有没有抓到龙头”，而是如何把主线龙头、弱修复轮动和次新试错分层处理。立新能源卖点比较坚决，问题主要落在周三科技轮动试错的强度验证，以及周五哈药股份试错后需要下一步计划。</p>
      <div class="thesis-grid">
        <article><b>做对</b><p>电力主线方向识别清楚，立新能源从周二买入到周五高位卖出，整体围绕核心龙头做T，没有完全跑散。</p></article>
        <article><b>待优化</b><p>科创半导体ETF和美利云不是当周最强主线，只能作为弱修复试错，进出节奏必须更快、更轻。</p></article>
        <article><b>待确认</b><p>周五哈药股份只是100股试错，是否变成主线仓位，要等医药强度、个股承接和期末持仓计划一起确认。</p></article>
      </div>
    </section>

    <section class="panel data-panel">
      <div>
        <span class="label">Data Scope</span>
        <h2>本版数据口径</h2>
        <p>截图是委托/成交查询，不是完整交割单。本页先按“已成成交金额”复盘买卖动作；手续费、印花税、账户收益、资金余额、每日仓位均暂不硬算。</p>
      </div>
      <div class="summary-grid">
        <span>买入笔数 <b>${buyRows.length}</b></span>
        <span>卖出笔数 <b>${sellRows.length}</b></span>
        <span>买入金额 <b>${rawMoney(buyAmount)}</b></span>
        <span>卖出金额 <b>${rawMoney(sellAmount)}</b></span>
        <span>现金差额 <b class="${classByValue(netCash)}">${money(netCash, { sign: true })}</b></span>
        <span>撤废/未成 <b>${ignoredOrders.length}</b></span>
      </div>
    </section>

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
      <p class="lead">这周暂时先把成交动作反推出可执行规则。后续你补充主观复盘后，我会把这里改成完整“二次复盘”文本。</p>
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
        <article><b>1. 周一总金额</b><p>当前表格里周一总金额为空，先按空仓/未填处理，后续可补具体金额。</p></article>
        <article><b>2. 持仓截图</b><p>确认期末哈药股份100股的真实成本与浮盈亏，以及截图未覆盖的其他持仓。</p></article>
        <article><b>3. 完整交割单</b><p>补充手续费、印花税、资金余额后，校准本页FIFO推演值。</p></article>
        <article><b>4. 日度复盘</b><p>补充7/21、7/23、7/24日度复盘原文后，再把逐日复盘改成正式版。</p></article>
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
        <p>每周一个独立页面，记录成交单、买卖点、账户变化、逐日复盘和当周新增交易纪律。最新周为 2026.07.20-07.24，当前为成交回报草稿版。</p>
        <div class="button-row">
          <a class="button" href="../${week.folder}/">进入最新周复盘</a>
          <a class="button secondary" href="../index.html">返回总首页</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("周报数量", `${archiveWeeks.length}`, "含本周草稿")}
        ${metricCard("最新区间", "07.20", "至 07.24")}
        ${metricCard("最新账户", money(accountPnlTotal, { sign: true }), `期末 ${rawMoney(finalEquity)} / 仓位 ${finalPosition.toFixed(2)}%`, classByValue(accountPnlTotal))}
        ${metricCard("最新规则", "强度确认", "主线/轮动/试错分层处理")}
      </div>
    </section>
    <section class="panel">
      <span class="label">Latest Draft</span>
      <h2>最新周：${week.label}</h2>
      <div class="latest-summary">
        <span>成交笔数 <b>${trades.length}</b></span>
        <span>成交额 <b>${rawMoney(turnover)}</b></span>
        <span>可见已实现 <b class="${classByValue(visibleRealized)}">${money(visibleRealized, { sign: true })}</b></span>
        <span>账户口径 <b class="${classByValue(accountPnlTotal)}">${money(accountPnlTotal, { sign: true })}</b></span>
      </div>
      <p>本周核心是立新能源做T兑现，科创半导体ETF/美利云作为科技弱修复试错，周五切入哈药股份小仓观察。账户日收益合计 ${money(accountPnlTotal, { sign: true })}，期末总金额 ${rawMoney(finalEquity)}。</p>
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
        ${metricCard("最新区间", "07.20", "至 07.24")}
        ${metricCard("最新账户", money(accountPnlTotal, { sign: true }), `期末 ${rawMoney(finalEquity)}`, classByValue(accountPnlTotal))}
        ${metricCard("长期结构", "4 个主页", "周度 / 月季 / 年度 / 案例")}
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
    .hero,.panel,.metric,.week-card,.stock-card{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
    .hero{padding:30px;display:grid;grid-template-columns:1.08fr .92fr;gap:26px;align-items:end}
    .panel{padding:24px}
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
    @media(max-width:920px){.hero,.data-panel,.account-placeholder{grid-template-columns:1fr}.metrics,.summary-grid,.latest-summary,.account-summary,.stock-metrics,.mini-ledger,.mini-grid,.thesis-grid,.rules,.missing-list,.archive,.entrance-grid,.dimension-grid.time,.dimension-grid.outcome{grid-template-columns:1fr}.dimension-head{display:grid}.account-bars{grid-template-columns:repeat(2,minmax(0,1fr))}.day-grid-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.page-shell{width:min(calc(100vw - 16px),1180px);padding-top:22px}.hero,.panel{padding:20px}}
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

  console.log(`Wrote ${path.relative(repo, weekDir)}\\index.html`);
  console.log("Updated weekly-trading-review\\index.html");
  console.log("Updated index.html");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
