const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..");
const weekDir = path.join(repo, "2026-08-10_2026-08-15");

const week = {
  folder: "2026-08-10_2026-08-15",
  rangeText: "2026.08.10 - 2026.08.15",
  tradeRangeText: "2026.08.10 - 2026.08.14",
  label: "08.10-08.15",
  status: "草稿版",
  title: "百花医药闭环兑现，通鼎反抽亏损，华西低吸待验证",
  subtitle: "当前版本基于 2026/8/10-8/14 成交截图、账户日收益表、daily-trading-review 日度复盘摘取与二次反思生成；期末持仓和风范历史成本待补后再校准。",
};

const trades = [
  { date: "20260814", time: "10:59:42", code: "000936", name: "华西股份", side: "买入", sideType: "buy", qty: 100, price: 6.97, amount: 697, fee: 5, tax: 0, net: -702, cash: 6636.02, market: "深A" },
  { date: "20260814", time: "10:58:39", code: "000936", name: "华西股份", side: "买入", sideType: "buy", qty: 100, price: 6.97, amount: 697, fee: 5, tax: 0, net: -702, cash: 7338.02, market: "深A" },
  { date: "20260814", time: "10:57:41", code: "000936", name: "华西股份", side: "买入", sideType: "buy", qty: 100, price: 6.97, amount: 697, fee: 5, tax: 0, net: -702, cash: 8040.02, market: "深A" },
  { date: "20260814", time: "10:22:11", code: "000936", name: "华西股份", side: "买入", sideType: "buy", qty: 100, price: 6.97, amount: 697, fee: 5, tax: 0, net: -702, cash: 8742.02, market: "深A" },
  { date: "20260814", time: "10:21:49", code: "000936", name: "华西股份", side: "买入", sideType: "buy", qty: 100, price: 6.97, amount: 697, fee: 5, tax: 0, net: -702, cash: 9444.02, market: "深A" },
  { date: "20260814", time: "10:21:37", code: "000936", name: "华西股份", side: "买入", sideType: "buy", qty: 100, price: 6.93, amount: 693, fee: 5, tax: 0, net: -698, cash: 10146.02, market: "深A" },
  { date: "20260814", time: "10:21:34", code: "000936", name: "华西股份", side: "买入", sideType: "buy", qty: 100, price: 6.9, amount: 690, fee: 5, tax: 0, net: -695, cash: 10844.02, market: "深A" },
  { date: "20260814", time: "10:18:44", code: "000936", name: "华西股份", side: "买入", sideType: "buy", qty: 100, price: 6.97, amount: 697, fee: 5, tax: 0, net: -702, cash: 11539.02, market: "深A" },
  { date: "20260814", time: "09:36:37", code: "002491", name: "通鼎互联", side: "卖出", sideType: "sell", qty: 300, price: 18.25, amount: 5475, fee: 5, tax: 2.74, net: 5467.26, cash: 12241.02, market: "深A" },
  { date: "20260813", time: "10:10:26", code: "000636", name: "风华高科", side: "卖出", sideType: "sell", qty: 100, price: 66.59, amount: 6659, fee: 5, tax: 3.33, net: 6650.67, cash: 6773.76, market: "深A" },
  { date: "20260813", time: "09:38:05", code: "002491", name: "通鼎互联", side: "买入", sideType: "buy", qty: 300, price: 20.72, amount: 6216, fee: 5, tax: 0, net: -6221, cash: 123.09, market: "深A" },
  { date: "20260813", time: "09:30:41", code: "600487", name: "亨通光电", side: "卖出", sideType: "sell", qty: 100, price: 60.23, amount: 6023, fee: 5, tax: 3.01, net: 6014.93, cash: 6344.09, market: "沪A" },
  { date: "20260812", time: "15:00:00", code: "600487", name: "亨通光电", side: "买入", sideType: "buy", qty: 100, price: 59.3, amount: 5930, fee: 5, tax: 0, net: -5935, cash: 6985.16, market: "沪A" },
  { date: "20260812", time: "15:00:00", code: "000636", name: "风华高科", side: "买入", sideType: "buy", qty: 100, price: 66.51, amount: 6651, fee: 5, tax: 0, net: -6656, cash: 329.16, market: "深A" },
  { date: "20260812", time: "14:56:08", code: "600721", name: "百花医药", side: "卖出", sideType: "sell", qty: 200, price: 14.03, amount: 2806, fee: 5, tax: 1.4, net: 2799.57, cash: 12920.22, market: "沪A" },
  { date: "20260812", time: "14:01:25", code: "600721", name: "百花医药", side: "卖出", sideType: "sell", qty: 200, price: 14.03, amount: 2806, fee: 5, tax: 1.4, net: 2799.57, cash: 10120.65, market: "沪A" },
  { date: "20260812", time: "09:33:05", code: "600721", name: "百花医药", side: "卖出", sideType: "sell", qty: 500, price: 14.03, amount: 7015, fee: 5, tax: 3.51, net: 7006.42, cash: 7321.08, market: "沪A" },
  { date: "20260811", time: "09:32:13", code: "603758", name: "秦安股份", side: "买入", sideType: "buy", qty: 100, price: 12.68, amount: 1268, fee: 5, tax: 0, net: -1273.01, cash: 314.66, market: "沪A" },
  { date: "20260811", time: "09:25:00", code: "600721", name: "百花医药", side: "买入", sideType: "buy", qty: 500, price: 12.75, amount: 6375, fee: 5, tax: 0, net: -6380.06, cash: 6697.73, market: "沪A" },
  { date: "20260811", time: "09:25:00", code: "600721", name: "百花医药", side: "买入", sideType: "buy", qty: 200, price: 12.75, amount: 2550, fee: 5, tax: 0, net: -2555.03, cash: 4142.7, market: "沪A" },
  { date: "20260811", time: "09:25:00", code: "600721", name: "百花医药", side: "买入", sideType: "buy", qty: 200, price: 12.75, amount: 2550, fee: 5, tax: 0, net: -2555.03, cash: 1587.67, market: "沪A" },
  { date: "20260810", time: "09:37:22", code: "601700", name: "风范股份", side: "卖出", sideType: "sell", qty: 1800, price: 7.001, amount: 12602, fee: 5, tax: 6.3, net: 12590.58, cash: 13077.79, market: "沪A" },
];

const ignoredOrders = [];

const dailyReviews = {
  "20260810": {
    title: "8/10 日度复盘",
    href: dailyPage("2026.8.10 周一", "8.11"),
    emotion: "君正集团低开后未快速拉板，日内定义为卖点不是格局点；机器人高潮后的后排套利不再做。",
    focus: "保留退潮信号出现就减仓的反应；低开弱反弹要卖，普涨高潮后的后排不追。",
  },
  "20260811": {
    title: "8/11 日度复盘",
    href: dailyPage("2026.8.11 周二", "8.12"),
    emotion: "轮动行情中能空仓，不在没有确定性时硬做；算力硬件与创新药来回切。",
    focus: "分歧低吸优先，高开冲高慎追；一致性预期后的追高要降级处理。",
  },
  "20260812": {
    title: "8/12 日度复盘",
    href: dailyPage("2026.8.12 周三", "8.13"),
    emotion: "情绪改善，退潮可能结束；百花医药做对但卖早，尾盘科技先手属于试错。",
    focus: "提高持股定力，不因害怕利润回吐过早止盈；科技尾盘先手要次日强度确认。",
  },
  "20260813": {
    title: "8/13 日度复盘",
    href: dailyPage("2026.8.13 周四", "8.14"),
    emotion: "科技分歧日止盈意识较强，亨通、风华处理干净；通鼎互联老龙反抽买点偏急。",
    focus: "老龙反抽只做小仓试错，不能给龙头预期；分歧日不追情绪票，先看承接。",
  },
  "20260814": {
    title: "8/14 日度复盘",
    href: dailyPage("2026.8.14 周五", "8.17"),
    emotion: "华西股份买入过急，国产算力/芯片回流但持续性仍待确认；华西有承接但不是唯一核心。",
    focus: "低吸要拆成确认前小仓与确认后加仓；通鼎止损果断，华西需要下周验证。",
  },
};

const dailyNotes = [
  { date: "20260810", day: "周一", theme: "历史持仓处理", action: "卖出风范股份1800股，成交金额12,602.00，发生金额+12,590.58。", review: "日度复盘强调低开未快速转强就是卖点。本页暂缺风范股份历史成本，先把它归为“历史持仓卖出，真实盈亏待补”。" },
  { date: "20260811", day: "周二", theme: "创新药试错与轮动纪律", action: "竞价买入百花医药900股，另买入秦安股份100股。", review: "轮动行情中，确定性不够时管住手是对的。百花医药属于创新药方向试错并在次日形成闭环；秦安股份期末是否仍持有待截图确认。" },
  { date: "20260812", day: "周三", theme: "百花兑现，尾盘科技先手", action: "卖出百花医药900股；尾盘买入亨通光电100股、风华高科100股。", review: "百花医药闭环盈利是本周最清楚的正贡献，但日度复盘也提示卖早。科技尾盘先手可以，但必须次日用强度验证，不能一开始就给主线仓位。" },
  { date: "20260813", day: "周四", theme: "科技处理与老龙反抽", action: "卖出亨通光电100股、风华高科100股；买入通鼎互联300股。", review: "亨通、风华处理干净，说明科技分歧日止盈意识在线；通鼎互联是老龙反抽，买点偏急，买入后承接不足，不能给龙头预期。" },
  { date: "20260814", day: "周五", theme: "通鼎止损，华西低吸待验证", action: "卖出通鼎互联300股；分8笔买入华西股份800股。", review: "通鼎互联止损果断，避免把老龙反抽当龙头格局；华西股份买入过急，虽有承接但不是唯一核心，下周需要期末持仓和处理计划确认。" },
];

const accountDays = [
  { date: "20260810", day: "周一", returnRate: 8.27, pnl: 999, position: 0, equity: 13057, reflection: "抓住了最高标抱团，跌停错杀的反包板，没有题材支撑只是主力自救的动作，所以反包完之后直接走。" },
  { date: "20260811", day: "周二", returnRate: -0.15, pnl: -20, position: 97.6, equity: 13057, reflection: "大胆做好预判上重仓龙头，轻仓试错连板最强低位标的，很舒服。" },
  { date: "20260812", day: "周三", returnRate: 9.73, pnl: 1268.94, position: 97.7, equity: 14305, reflection: "大胆板上清龙头，等监管之后反核再介入！小仓位机器人直接一字继续吃，舒服舒服！！！！" },
  { date: "20260813", day: "周四", returnRate: -2.09, pnl: -298, position: 51.6, equity: 13990, reflection: "科技在大环境不好的时候不要追高，只能低吸；追高直接-10个点炸板巨深一个；只要在共振指数的时候才能做科技追高。" },
  { date: "20260814", day: "周五", returnRate: -2.78, pnl: -389, position: 51.2, equity: 13594, reflection: "科技低吸可以，千万不能追高，而且是大环境不好的末期去追高那就更死咯。" },
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
  { label: "07.20-07.24", folder: "2026-07-20_2026-07-24", pnl: "+1,816.40", pct: "日度见表", equity: "17,648.65", note: "账户日收益已补；手续费与期末持仓继续待校准。" },
  { label: "08.10-08.15", folder: week.folder, pnl: "+1,560.94", pct: "+12.98%", equity: "13,594.00", note: "二次反思已补；期末持仓与风范成本待补。" },
];

const secids = {
  "601700": "1.601700",
  "600721": "1.600721",
  "603758": "1.603758",
  "600487": "1.600487",
  "000636": "0.000636",
  "002491": "0.002491",
  "000936": "0.000936",
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
const accountPnlTotal = accountDays.reduce((total, day) => total + (typeof day.pnl === "number" ? day.pnl : 0), 0);
const accountReturnSum = accountDays.reduce((total, day) => total + (typeof day.returnRate === "number" ? day.returnRate : 0), 0);
const finalAccountDay = [...accountDays].reverse().find((day) => typeof day.equity === "number");
const finalEquity = finalAccountDay?.equity ?? null;
const finalPosition = finalAccountDay?.position ?? null;
const maxDailyPnl = Math.max(...accountDays.map((day) => Math.abs(day.pnl || 0)), 1);
const positionDays = accountDays.filter((day) => typeof day.position === "number");
const avgPosition = positionDays.reduce((total, day) => total + day.position, 0) / positionDays.length;
const bestAccountDay = accountDays.reduce((best, day) => ((day.pnl ?? Number.NEGATIVE_INFINITY) > (best.pnl ?? Number.NEGATIVE_INFINITY) ? day : best), accountDays[0]);
const worstAccountDay = accountDays.reduce((worst, day) => ((day.pnl ?? Number.POSITIVE_INFINITY) < (worst.pnl ?? Number.POSITIVE_INFINITY) ? day : worst), accountDays[0]);
const finalCash = sortReverseChronological(trades).find((row) => typeof row.cash === "number")?.cash ?? null;

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
      .filter((point) => point && point.date >= "2026-08-10" && point.date <= "2026-08-15");
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
        <span>买入 <b>${qty(stock.buyQty)}</b><em>${rawMoney(stock.buyAmount)} / 现金${rawMoney(stock.buyCash)}</em></span>
        <span>卖出 <b>${qty(stock.sellQty)}</b><em>${rawMoney(stock.sellAmount)} / 到账${rawMoney(stock.sellCash)}</em></span>
        <span>可见已实现 <b class="${realizedClass}">${money(stock.realized, { sign: true })}</b><em>FIFO / 含截图费用</em></span>
        <span>期末可见 <b>${openText}</b><em>持仓截图待校准</em></span>
      </div>
      <p>${note}</p>
      <div class="chart-frame">${charts[stock.code] || renderTrendSvg(stock, [])}</div>
    </article>`;
  }).join("");
}

function stockNote(stock) {
  const notes = {
    "600721": "本周最清楚的赚钱票。百花医药竞价买入900股，次日分三笔全部兑现，含费用可见闭环约+1,115.44。赚钱根源是最高标抱团的唯一性识别：百花高开、宝鼎破板后，连板唯一性已经清楚，T字板重仓介入符合体系。",
    "002491": "本周最清楚的亏损闭环。通鼎互联是老龙反抽，买点偏急，买入后承接不够强，次日止损虽然果断，但根源在于它不是当日唯一核心，也不能用龙头预期格局。",
    "600487": "亨通光电尾盘先手，次日早盘卖出，含费用小赚约+79.93。它属于科技分歧日的先手试错，处理干净是优点，但仓位级别必须低于主线龙头。",
    "000636": "风华高科尾盘先手，次日卖出基本打平，含费用约-5.33。结果不是核心，重点是科技试错必须用次日强度验证，不强就走。",
    "000936": "华西股份周五分8笔买入800股，发生金额合计约5,605.00。日度复盘已指出买入过急，它有承接但不是唯一核心，期末持仓、浮盈亏和下周处理计划待补。",
    "603758": "秦安股份周二买入100股，发生金额约1,273.01。截图里没有卖出记录，是否仍持有、是否属于机器人/汽车方向试错，需要期末持仓确认。",
    "601700": "风范股份周一卖出1800股，发生金额+12,590.58。因为缺少上一周/历史买入成本，本页只记录处理动作，不计算真实盈亏。",
  };
  return notes[stock.code] || "成交回报口径已记录，等待补充账户和持仓数据后做最终归因。";
}

function stockFigure(code) {
  const stock = stockByCode.get(code);
  if (!stock) return "待补";
  return money(stock.realized, { sign: true });
}

function renderProfitLossPanel() {
  return `<section class="panel" id="profit-loss">
    <span class="label">Profit / Loss Roots</span>
    <h2>本周赚钱/亏损主要票及其分析</h2>
    <div class="thesis-grid">
      <article>
        <b>主要赚钱：百花医药 ${stockFigure("600721")}</b>
        <p>百花医药是本周最清楚的正反馈：百花医药和宝鼎科技PK时，宝鼎破板，百花高开并确认最高连板唯一性，T字板重仓介入符合“有最高标抱团就做最高标”的体系。后续只要继续把唯一性、竞价强度和盯盘条件同时满足，再上大仓位是对的。</p>
      </article>
      <article>
        <b>主要亏损：通鼎互联 ${stockFigure("002491")}</b>
        <p>老龙反抽买点偏急，买入后承接不足，次日止损是正确动作；亏损根源是把反抽票的预期给高了。它不是当日唯一核心，也不是板块第一性机会，后续只能小仓快验。</p>
      </article>
      <article>
        <b>待验证：华西股份 / 秦安股份</b>
        <p>华西股份周五分8笔买入800股，属于回流低吸但不是唯一核心；秦安股份周二买入100股，截图未见卖出。两者都需要期末持仓、成本、市值、下周处理计划后才能定稿。</p>
      </article>
    </div>
    <div class="rules">
      <article><span>01</span><b>赚钱根源</b><p>百花医药是“最高标唯一性 + 竞价强度 + T字板介入”三件事同时做对。</p></article>
      <article><span>02</span><b>亏损根源</b><p>通鼎互联是“老龙反抽 + 非唯一核心 + 买急”叠加，亏损是大概率。</p></article>
      <article><span>03</span><b>情绪处理</b><p>百花卖早说明盈利时害怕回吐；通鼎卖出说明亏损时止损纪律仍在线。</p></article>
      <article><span>04</span><b>下周重点</b><p>科技方向大环境未企稳时只低吸不追高；不盯盘时不允许上大仓位。</p></article>
    </div>
  </section>`;
}

function renderAccountPanel() {
  return `<section class="panel account-panel" id="account">
      <span class="label">Account Curve</span>
      <h2>账户收益与仓位</h2>
      <p class="lead">这部分按你补充的账户日收益表记录，和成交回报/FIFO闭环分开看。本周账户日收益合计 ${money(accountPnlTotal, { sign: true })}，日收益率简单相加 ${pct(accountReturnSum)}，期末总金额 ${rawMoney(finalEquity)}。</p>
      <div class="account-summary">
        <span>账户日收益合计 <b class="${classByValue(accountPnlTotal)}">${money(accountPnlTotal, { sign: true })}</b></span>
        <span>期末总金额 <b>${rawMoney(finalEquity)}</b></span>
        <span>平均仓位 <b>${avgPosition.toFixed(2)}%</b></span>
        <span>期末现金余额 <b>${finalCash === null ? "待补" : rawMoney(finalCash)}</b></span>
        <span>截图闭环盈亏 <b class="${classByValue(visibleRealized)}">${money(visibleRealized, { sign: true })}</b></span>
        <span>最佳/最差日 <b>${bestAccountDay.day} ${money(bestAccountDay.pnl, { sign: true })} / ${worstAccountDay.day} ${money(worstAccountDay.pnl, { sign: true })}</b></span>
      </div>
      <div class="account-bars">${accountDays.map(renderAccountBar).join("")}</div>
      <div class="table-wrap compact-table"><table>
        <thead><tr><th>日期</th><th>星期</th><th>收益率</th><th>收益金额</th><th>仓位</th><th>当前总金额</th><th>成交笔数</th><th>买入金额</th><th>卖出金额</th><th>个人反思</th></tr></thead>
        <tbody>${accountDays.map((day) => {
          const stat = dailyStats.get(day.date) || { rows: [], buyAmount: 0, sellAmount: 0, netCash: 0 };
          return `<tr>
          <td>${formatDate(day.date)}</td>
          <td>${day.day}</td>
          <td class="${classByValue(day.returnRate)}">${pct(day.returnRate)}</td>
          <td class="${classByValue(day.pnl)}">${money(day.pnl, { sign: true })}</td>
          <td>${day.position.toFixed(2)}%</td>
          <td>${rawMoney(day.equity)}</td>
          <td>${stat.rows.length}</td>
          <td>${rawMoney(stat.buyAmount)}</td>
          <td>${rawMoney(stat.sellAmount)}</td>
          <td class="reflection-cell">${day.reflection}</td>
        </tr>`;
        }).join("")}</tbody>
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
    <td class="${classByValue(stock.realized)}">${money(stock.realized, { sign: true })}</td>
    <td>${stock.openQty ? `${qty(stock.openQty)} / ${rawMoney(stock.openCost)}` : "已清仓"}</td>
  </tr>`).join("");
}

function renderRules() {
  const rules = [
    ["科技不逆境追高", "大环境没有彻底企稳、也不是PCB那种狂潮主升时，科技方向更适合低吸，不适合追高；周四周五利润回吐的根源就在这里。"],
    ["科技追高要共振", "只有指数、板块和赚钱效应共振时，科技追高才有正期望；否则追高很容易变成高位接回落。"],
    ["最高标唯一性", "百花医药和宝鼎科技PK时，宝鼎破板、百花高开，连板唯一性已经确认；最高标抱团出现时，要敢于按体系上仓位。"],
    ["T字板重仓条件", "最高标、竞价强度、唯一性和盯盘条件同时满足时，T字板介入可以重一点；缺任一项就降级。"],
    ["不盯盘不重仓", "大仓位必须建立在实时盯盘上；不盯盘的时候不能上大仓位，避免盘中强弱变化无法及时处理。"],
    ["利润回吐可接受", "本周科技追高有错误，但仓位不大，回吐没有伤到账户主线；错了但没有放大，是这周风控做得好的地方。"],
    ["老龙反抽降级", "通鼎互联这类老龙反抽只能当小仓试错，不能给龙头预期；买入后承接不足要迅速止损。"],
    ["低吸先分层", "华西股份这种回流低吸，确认前只能小仓，确认后再加仓；第一次下探不能直接打满预期。"],
    ["历史持仓另算", "风范股份这种历史持仓卖出，必须补历史成本再核算，不把现金到账误判成盈利。"],
    ["账户口径分离", "成交净流入不是账户收益；期末持仓市值、浮盈亏、总资产必须单独补齐。"],
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
        <h1><span class="date-range"><span>2026.08.10 -</span><span>2026.08.15</span></span>周度交易复盘</h1>
        <p>${week.subtitle}</p>
        <div class="button-row">
          <a class="button" href="../weekly-trading-review/">返回周度主页</a>
          <a class="button secondary" href="#missing">待补清单</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("成交笔数", `${trades.length}`, "仅统计截图中“已成”记录")}
        ${metricCard("账户日收益", money(accountPnlTotal, { sign: true }), `日收益率合计 ${pct(accountReturnSum)}`, classByValue(accountPnlTotal))}
        ${metricCard("期末总金额", rawMoney(finalEquity), `仓位 ${finalPosition.toFixed(2)}% / 现金 ${finalCash === null ? "待补" : rawMoney(finalCash)}`)}
        ${metricCard("可见闭环盈亏", money(visibleRealized, { sign: true }), "同周买卖FIFO，含截图费用", classByValue(visibleRealized))}
      </div>
    </section>

    <section class="panel thesis-panel">
      <span class="label">Week Thesis</span>
      <h2>这一周先写成一个核心问题</h2>
      <p class="lead">本周核心不是交易频率，而是“最高标唯一性是否看清楚”：百花医药是最高标抱团确认后的成功闭环，通鼎互联是老龙反抽买急后的亏损闭环，华西股份是回流低吸但还没被证明是唯一核心的期末待验证仓。整体没有大的体系性错误，主要瑕疵是科技环境未稳时追高导致周四周五利润回吐。</p>
      <div class="thesis-grid">
        <article><b>做对</b><p>百花医药隔日闭环贡献约+1,115.44，说明最高标唯一性、竞价强度和T字板介入都执行到位；这是本周最值得保留的动作。</p></article>
        <article><b>待优化</b><p>科技方向在大环境没有彻底企稳时不该追高，只能低吸或等共振确认；通鼎互联这种老龙反抽也只能小仓、快验、快走。</p></article>
        <article><b>待确认</b><p>华西股份800股、秦安股份100股和风范股份历史成本都缺期末/历史口径，下周处理计划需要你补材料后定稿。</p></article>
      </div>
    </section>

    <section class="panel data-panel">
      <div>
        <span class="label">Data Scope</span>
        <h2>本版数据口径</h2>
        <p>截图是成交查询，不包含期末持仓市值和历史买入成本。本页按“发生金额”复盘本周能闭环的票，并按你补充的账户表展示账户日收益；风范股份真实盈亏、华西/秦安浮盈亏仍标为待补。</p>
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
      <p class="lead">这周没有特别大的体系性问题，主线进步很清楚：最高标抱团和连板唯一性开始能看明白，也敢在百花医药这种5进6节点上按体系上仓位。主要瑕疵在科技方向，市场环境没有彻底企稳、也不是PCB那种狂潮时，追高不如低吸；周四周五利润回吐就是这条纪律没有完全守住，但仓位不大，账户没有被错误放大。</p>
      <div class="thesis-grid">
        <article><b>最高标抱团做对</b><p>百花医药和宝鼎科技PK时，百花高开、宝鼎破板，连板唯一性确认。这个时候做百花医药，是“有龙做龙”的正确执行。</p></article>
        <article><b>科技追高要降级</b><p>科技只有在指数和板块共振、赚钱效应明确时才适合追高；环境差时更适合低吸，追高容易吃炸板和利润回吐。</p></article>
        <article><b>大仓位必须盯盘</b><p>能实时看盘、能处理炸板/回落/转弱，才允许大仓位；不盯盘时只能小仓试错或放弃。</p></article>
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
        <article><b>1. 期末持仓截图</b><p>重点确认华西股份800股、秦安股份100股是否仍持有，以及成本价、市价、市值、浮盈亏、总资产。</p></article>
        <article><b>2. 风范股份历史成本</b><p>8/10 卖出风范股份1800股属于历史持仓，没有上一笔买入成本，真实盈亏暂不能计算。</p></article>
        <article><b>3. 分时/K线补强</b><p>若你希望完全按券商/同花顺5分钟线呈现，请补对应截图或确认可继续用东方财富分钟接口。</p></article>
        <article><b>4. 文件命名确认</b><p>当前按实际交易周做成 2026-08-10_2026-08-15；如需改成截图筛选区间 2026-08-09_2026-08-15，可再统一改名。</p></article>
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
        <p>每周一个独立页面，记录成交单、买卖点、账户变化、逐日复盘和当周新增交易纪律。最新周为 2026.08.10-08.15，账户日收益和二次反思已补，期末持仓与风范历史成本待补。</p>
        <div class="button-row">
          <a class="button" href="../${week.folder}/">进入最新周复盘</a>
          <a class="button secondary" href="../index.html">返回总首页</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("周报数量", `${archiveWeeks.length}`, "含本周草稿")}
        ${metricCard("最新区间", "08.10", "至 08.15")}
        ${metricCard("最新账户", money(accountPnlTotal, { sign: true }), `期末 ${rawMoney(finalEquity)} / 仓位 ${finalPosition.toFixed(2)}%`, classByValue(accountPnlTotal))}
        ${metricCard("最新规则", "唯一性", "最高标抱团 / 科技不逆境追高")}
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
      <p>本周核心是百花医药最高标唯一性做对，科技环境未稳时追高导致利润回吐，通鼎互联老龙反抽亏损、华西股份低吸仍待验证。账户日收益合计 ${money(accountPnlTotal, { sign: true })}，期末总金额 ${rawMoney(finalEquity)}。</p>
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
        ${metricCard("最新区间", "08.10", "至 08.15")}
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
