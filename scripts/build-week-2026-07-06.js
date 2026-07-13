const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..");
const weekDir = path.join(repo, "2026-07-06_2026-07-10");

const week = {
  rangeText: "2026.07.06 - 2026.07.10",
  label: "07.06-07.10",
  folder: "2026-07-06_2026-07-10",
  status: "草稿版",
  title: "三冰反核做对，周五科技被商业航天虹吸",
};

const trades = [
  { date: "20260710", time: "14:04:05", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 700, price: 1.334, amount: 933.8, fee: 5, tax: 0, net: -938.8, balance: 1791.31, market: "上海A股" },
  { date: "20260710", time: "14:03:43", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 1100, price: 0.937, amount: 1030.7, fee: 5, tax: 0, net: -1035.7, balance: 2730.11, market: "深圳A股" },
  { date: "20260710", time: "13:54:12", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 1300, price: 0.949, amount: 1233.7, fee: 5, tax: 0, net: -1238.7, balance: 3765.81, market: "深圳A股" },
  { date: "20260710", time: "13:49:44", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 1200, price: 1.349, amount: 1618.8, fee: 5, tax: 0, net: -1623.8, balance: 5004.51, market: "上海A股" },
  { date: "20260710", time: "13:49:31", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 2100, price: 0.947, amount: 1988.7, fee: 5, tax: 0, net: -1993.7, balance: 6628.31, market: "深圳A股" },
  { date: "20260710", time: "13:22:32", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 2000, price: 0.962, amount: 1924, fee: 5, tax: 0, net: -1929, balance: 8622.01, market: "深圳A股" },
  { date: "20260710", time: "13:21:56", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 2900, price: 0.962, amount: 2789.8, fee: 5, tax: 0, net: -2794.8, balance: 10551.01, market: "深圳A股" },
  { date: "20260710", time: "13:20:38", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 1500, price: 1.369, amount: 2053.5, fee: 5, tax: 0, net: -2058.5, balance: 13345.81, market: "上海A股" },
  { date: "20260710", time: "13:00:00", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 1000, price: 0.963, amount: 963, fee: 5, tax: 0, net: -968, balance: 15404.31, market: "深圳A股" },
  { date: "20260710", time: "09:56:14", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 600, price: 0.999, amount: 599.4, fee: 5, tax: 0, net: 594.4, balance: 16372.31, market: "深圳A股" },
  { date: "20260710", time: "09:44:09", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 600, price: 0.995, amount: 597, fee: 5, tax: 0, net: 592, balance: 15777.91, market: "深圳A股" },
  { date: "20260710", time: "09:43:44", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1200, price: 0.996, amount: 1195.2, fee: 5, tax: 0, net: 1190.2, balance: 15185.91, market: "深圳A股" },
  { date: "20260710", time: "09:43:22", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1200, price: 0.998, amount: 1197.6, fee: 5, tax: 0, net: 1192.6, balance: 13995.71, market: "深圳A股" },
  { date: "20260710", time: "09:40:38", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1200, price: 1.003, amount: 1203.6, fee: 5, tax: 0, net: 1198.6, balance: 12803.11, market: "深圳A股" },
  { date: "20260710", time: "09:37:19", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1600, price: 0.995, amount: 1592, fee: 5, tax: 0, net: 1587, balance: 11604.51, market: "深圳A股" },
  { date: "20260710", time: "09:35:34", code: "588170", name: "科创半导体ETF华夏", side: "卖出", sideType: "sell", qty: 3300, price: 1.409, amount: 4649.7, fee: 5, tax: 0, net: 4644.7, balance: 10017.51, market: "上海A股" },
  { date: "20260710", time: "09:35:20", code: "512760", name: "芯片ETF国泰", side: "卖出", sideType: "sell", qty: 1400, price: 1.564, amount: 2189.6, fee: 5, tax: 0, net: 2184.6, balance: 5372.81, market: "上海A股" },
  { date: "20260709", time: "14:02:09", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 100, price: 1.898, amount: 189.8, fee: 5, tax: 0, net: -194.8, balance: 3188.21, market: "深圳A股" },
  { date: "20260709", time: "14:02:06", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 100, price: 1.897, amount: 189.7, fee: 5, tax: 0, net: -194.7, balance: 3383.01, market: "深圳A股" },
  { date: "20260709", time: "14:01:49", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 200, price: 1.893, amount: 378.6, fee: 5, tax: 0, net: -383.6, balance: 3577.71, market: "深圳A股" },
  { date: "20260709", time: "14:01:45", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 200, price: 1.892, amount: 378.4, fee: 5, tax: 0, net: -383.4, balance: 3961.31, market: "深圳A股" },
  { date: "20260709", time: "13:56:57", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 300, price: 1.347, amount: 404.1, fee: 5, tax: 0, net: -409.1, balance: 4344.71, market: "上海A股" },
  { date: "20260709", time: "13:56:54", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 300, price: 1.347, amount: 404.1, fee: 5, tax: 0, net: -409.1, balance: 4753.81, market: "上海A股" },
  { date: "20260709", time: "13:53:48", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 1200, price: 1.898, amount: 2277.6, fee: 5, tax: 0, net: -2282.6, balance: 5162.91, market: "深圳A股" },
  { date: "20260709", time: "13:18:59", code: "512760", name: "芯片ETF国泰", side: "买入", sideType: "buy", qty: 500, price: 1.485, amount: 742.5, fee: 5, tax: 0, net: -747.5, balance: 7445.51, market: "上海A股" },
  { date: "20260709", time: "13:18:41", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 400, price: 1.837, amount: 734.8, fee: 5, tax: 0, net: -739.8, balance: 8193.01, market: "深圳A股" },
  { date: "20260709", time: "13:18:38", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 400, price: 1.838, amount: 735.2, fee: 5, tax: 0, net: -740.2, balance: 8932.81, market: "深圳A股" },
  { date: "20260709", time: "13:18:27", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 800, price: 1.31, amount: 1048, fee: 5, tax: 0, net: -1053, balance: 9673.01, market: "上海A股" },
  { date: "20260709", time: "13:18:21", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 800, price: 1.308, amount: 1046.4, fee: 5, tax: 0, net: -1051.4, balance: 10726.01, market: "上海A股" },
  { date: "20260709", time: "10:26:02", code: "159506", name: "恒生医疗", side: "卖出", sideType: "sell", qty: 100, price: 1.198, amount: 119.8, fee: 5, tax: 0, net: 114.8, balance: 11777.41, market: "深圳A股" },
  { date: "20260709", time: "10:24:42", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 600, price: 1.815, amount: 1089, fee: 5, tax: 0, net: -1094, balance: 11662.61, market: "深圳A股" },
  { date: "20260709", time: "10:23:04", code: "512760", name: "芯片ETF国泰", side: "买入", sideType: "buy", qty: 900, price: 1.461, amount: 1314.9, fee: 5, tax: 0, net: -1319.9, balance: 12756.61, market: "上海A股" },
  { date: "20260709", time: "10:22:26", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 1100, price: 1.296, amount: 1425.6, fee: 5, tax: 0, net: -1430.6, balance: 14076.51, market: "上海A股" },
  { date: "20260709", time: "09:36:35", code: "600094", name: "大名城", side: "卖出", sideType: "sell", qty: 100, price: 4.26, amount: 426, fee: 5, tax: 0.21, net: 420.79, balance: 15507.11, market: "上海A股" },
  { date: "20260709", time: "09:35:11", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1500, price: 1.796, amount: 2694, fee: 5, tax: 0, net: 2689, balance: 15086.32, market: "深圳A股" },
  { date: "20260708", time: "15:00:00", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 1500, price: 1.768, amount: 2652, fee: 5, tax: 0, net: -2657, balance: 12397.32, market: "深圳A股" },
  { date: "20260708", time: "09:44:03", code: "159506", name: "恒生医疗", side: "买入", sideType: "buy", qty: 100, price: 1.218, amount: 121.8, fee: 5, tax: 0, net: -126.8, balance: 15054.32, market: "深圳A股" },
  { date: "20260708", time: "09:30:54", code: "600094", name: "大名城", side: "买入", sideType: "buy", qty: 100, price: 4.22, amount: 422, fee: 5, tax: 0, net: -427, balance: 15181.12, market: "上海A股" },
  { date: "20260707", time: "09:42:29", code: "159050", name: "机器人ETF广发", side: "卖出", sideType: "sell", qty: 8900, price: 1.075, amount: 9567.5, fee: 5, tax: 0, net: 9562.5, balance: 15608.12, market: "深圳A股" },
  { date: "20260706", time: "14:08:57", code: "159050", name: "机器人ETF广发", side: "买入", sideType: "buy", qty: 1100, price: 1.078, amount: 1185.8, fee: 5, tax: 0, net: -1190.8, balance: 6045.62, market: "深圳A股" },
  { date: "20260706", time: "10:40:19", code: "159050", name: "机器人ETF广发", side: "买入", sideType: "buy", qty: 2100, price: 1.089, amount: 2286.9, fee: 5, tax: 0, net: -2291.9, balance: 7236.42, market: "深圳A股" },
  { date: "20260706", time: "10:06:27", code: "159050", name: "机器人ETF广发", side: "买入", sideType: "buy", qty: 2000, price: 1.09, amount: 2180, fee: 5, tax: 0, net: -2185, balance: 9528.32, market: "深圳A股" },
  { date: "20260706", time: "09:37:39", code: "159050", name: "机器人ETF广发", side: "买入", sideType: "buy", qty: 1800, price: 1.115, amount: 2007, fee: 5, tax: 0, net: -2012, balance: 11713.32, market: "深圳A股" },
  { date: "20260706", time: "09:33:22", code: "159050", name: "机器人ETF广发", side: "买入", sideType: "buy", qty: 1900, price: 1.119, amount: 2126.1, fee: 5, tax: 0, net: -2131.1, balance: 13725.32, market: "深圳A股" },
  { date: "20260706", time: "09:33:03", code: "588010", name: "科创新材ETF博时", side: "卖出", sideType: "sell", qty: 2800, price: 1.403, amount: 3928.4, fee: 5, tax: 0, net: 3923.4, balance: 15856.42, market: "上海A股" },
];

const chronological = [...trades].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function money(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${fmt.format(Math.abs(value))}`;
}

function rawMoney(value) {
  return fmt.format(value);
}

function pct(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function classByValue(value) {
  return value >= 0 ? "is-profit" : "is-loss";
}

function formatDate(date) {
  return `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6, 8)}`;
}

function shortDate(date) {
  return `${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + row[field], 0);
}

function groupByCode(rows) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.code)) {
      grouped.set(row.code, {
        code: row.code,
        name: row.name,
        buyCash: 0,
        sellCash: 0,
        buyQty: 0,
        sellQty: 0,
        fees: 0,
        tax: 0,
        rows: [],
      });
    }
    const item = grouped.get(row.code);
    item.rows.push(row);
    item.fees += row.fee;
    item.tax += row.tax;
    if (row.sideType === "buy") {
      item.buyCash += -row.net;
      item.buyQty += row.qty;
    } else {
      item.sellCash += row.net;
      item.sellQty += row.qty;
    }
  }
  return [...grouped.values()].sort((a, b) => {
    const lastA = a.rows.map((row) => `${row.date}${row.time}`).sort().at(-1);
    const lastB = b.rows.map((row) => `${row.date}${row.time}`).sort().at(-1);
    return lastB.localeCompare(lastA);
  });
}

const grouped = groupByCode(trades);
const buyRows = trades.filter((row) => row.sideType === "buy");
const sellRows = trades.filter((row) => row.sideType === "sell");
const turnover = sum(trades, "amount");
const fees = sum(trades, "fee");
const tax = sum(trades, "tax");
const totalCost = fees + tax;
const netCash = sum(trades, "net");
const finalCash = trades[0].balance;

const closedPnL = {
  "588010": 1.2,
  "159050": -248.3,
  "600094": -6.21,
  "159506": -12,
  "512760": 117.2,
  "588170": 291.5,
};
const visibleClosedLoopPnl = Object.values(closedPnL).reduce((a, b) => a + b, 0);
const robotPnl = closedPnL["159050"];
const smallTestPnl = closedPnL["600094"] + closedPnL["159506"];
const semiconductorClosedPnl = closedPnL["512760"] + closedPnL["588170"];
const priorCost588010 = 3922.2;
const priorPnl588010 = closedPnL["588010"];
const openPositionCost159516 = 9959.9;
const openPositionCost588170 = 4621.1;
const openPositionCost = openPositionCost159516 + openPositionCost588170;

const accountDays = [
  { weekday: "周一", date: "2026/07/06", returnRate: -2.02, pnl: 320, position: 61.1, equity: 15533, note: "大分歧进早了一点，所以ETF都亏了两个点。" },
  { weekday: "周二", date: "2026/07/07", returnRate: 0.5, pnl: 80, position: 0, equity: 15608, note: "退潮期管住手设置好条件单，稳稳躲掉大亏。" },
  { weekday: "周三", date: "2026/07/08", returnRate: -0.12, pnl: -19, position: 20.5, equity: 15588, note: "空仓躲了一整天，尾盘才做反核试错。" },
  { weekday: "周四", date: "2026/07/09", returnRate: 4.3, pnl: 605, position: 80.3, equity: 16195, note: "择时的魅力，三冰反核的魅力。" },
  { weekday: "周五", date: "2026/07/10", returnRate: -3.1, pnl: -514.4, position: 88.5, equity: 15596, note: "割裂的强修复，难受的商业航天。" },
];
const previousEndingEquity = 15858;
const reportedPnlSum = accountDays.reduce((total, day) => total + day.pnl, 0);
const endingEquity = accountDays.at(-1).equity;
const accountPnl = endingEquity - previousEndingEquity;
const accountReturnSum = accountDays.reduce((total, day) => total + day.returnRate, 0);
const avgPosition = accountDays.reduce((total, day) => total + day.position, 0) / accountDays.length;
const endingPosition = accountDays.at(-1).position;
const bestAccountDay = accountDays.reduce((best, day) => day.pnl > best.pnl ? day : best, accountDays[0]);
const worstAccountDay = accountDays.reduce((worst, day) => day.pnl < worst.pnl ? day : worst, accountDays[0]);
const inferredStockValue = Math.max(0, endingEquity - finalCash);

const dailySources = {
  d0706: "https://travelstocks.github.io/daily-trading-review/pages/" + encodeURIComponent("章盟主式超短全景复盘（2026.7.6 周一）+ 7.7个股板块预案-AI文档.html"),
  d0707: "https://travelstocks.github.io/daily-trading-review/pages/" + encodeURIComponent("章盟主式超短全景复盘（2026.7.7 周二）+ 7.8个股板块预案-AI文档.html"),
  d0708: "https://travelstocks.github.io/daily-trading-review/pages/" + encodeURIComponent("章盟主式超短全景复盘（2026.7.8 周三）+ 7.9个股板块预案-AI文档.html"),
  d0709: "https://travelstocks.github.io/daily-trading-review/pages/" + encodeURIComponent("章盟主式超短全景复盘（2026.7.9 周四）+ 7.10 个股板块预案-AI文档.html"),
  d0710: "https://travelstocks.github.io/daily-trading-review/pages/" + encodeURIComponent("章盟主式超短全景复盘（2026.7.10 周五）+ 7.13个股板块预案-AI文档.html"),
};

const dailyCards = [
  { day: "周一", date: "2026/07/06", title: "大分歧进早，机器人ETF仓位偏重", tag: "分歧进早", tone: "warn", action: "买入机器人ETF广发，处理科创新材ETF跨周仓；账户表收益率 -2.02%，仓位 61.10%。", market: "每日复盘把这一天定义为高潮次日分歧：机器人开盘已经兑现，板块没有一致回流，也没有核心一字顶住。", operation: "做对的是选择 ETF 而不是接力个股，降低了退潮期个股波动；做错的是看到位置到达就进，忽略板块一致性和核心强度确认，随后阴跌中继续补仓。", reflection: "机器人ETF不是自动确认主线延续的龙头载体。退潮期用 ETF 试错可以，但要等有量回升和企稳确认；跌到 -5%、-6% 才止跌，已经不是普通分歧，而是破位信号。", next: "强回流才继续看 2-3 天；不强回流、跌破 5 日线、资金被医药或防御抢走就离场。", sourceUrl: dailySources.d0706 },
  { day: "周二", date: "2026/07/07", title: "条件单清掉机器人ETF，大冰日空仓防守", tag: "退潮空仓", tone: "good", action: "卖出机器人ETF广发，期末空仓；账户 +80，仓位 0%。", market: "每日复盘认为这是二冰大冰日，退潮没有完整度过前要保持防守，不能因为跌多就提前抄底。", operation: "机器人ETF处理很好：提前设置条件单，冲高不急跑，第一次下杀不慌，跌破开盘价和第一波下杀拐点后清仓，避开后面大亏。", reflection: "不亏就是大赚。冰点不是买点本身，只有冰点、企稳信号、核心题材持续性同时出现，才是试错条件。", next: "明天即使有三冰反核，也只围绕机器人核心、芯片/光模块高位优质票反弹，小仓试错，不扩散到杂毛。", sourceUrl: dailySources.d0707 },
  { day: "周三", date: "2026/07/08", title: "空仓等到尾盘，只做退潮末期反核试错", tag: "尾盘试错", tone: "good", action: "买入半导体设备ETF、大名城、恒生医疗小仓；账户 -19，仓位 20.50%。", market: "每日复盘认为仍处退潮 2 末期，早盘不出手、盘中弱修复不追，尾盘才看抗跌核心的反核试错。", operation: "半导体设备ETF 159516 的试错理由是承接强、均线/零轴上方平台企稳、涨幅不算过分、尾盘反包。大名城和恒生医疗只用于感受水温，不影响账户。", reflection: "今天没有核心失误，最大风险是盘中追高但实际没有发生。退潮期空仓不是怂，小仓位试错是为了验证盘面。", next: "明天如果指数弱反抽失败、159516 跌破平台、核心票无法带队，就承认退潮 3 开始并立刻降风险。", sourceUrl: dailySources.d0708 },
  { day: "周四", date: "2026/07/09", title: "三冰反核兑现，ETF主仓进攻有效", tag: "三冰反核", tone: "good", action: "卖出大名城、恒生医疗、部分半导设备；买入半导设备ETF、科创半导体ETF、芯片ETF；账户 +605，仓位 80.30%。", market: "每日复盘将其视为科技主升三启动日：指数前低附近、主线消息发酵、科创综指/芯片/ETF共振企稳。", operation: "方向和仓位推进整体正确，用 ETF 表达主线，避免分仓大票或追连板杂毛。缺点是最便宜的 3929/3939 附近试探仓下得不够果断。", reflection: "三冰反核要果断；真正高手在启动日敢于在赔率最好的位置先上桌，后续确认再加，而不是等完全确认才追。", next: "二高潮次日按分化预期做T：有先手高开砸、低开吸；ETF 错了按约 2% 止损。", sourceUrl: dailySources.d0709 },
  { day: "周五", date: "2026/07/10", title: "早盘高抛正确，午后商业航天虹吸后摊平成本", tag: "预案失效", tone: "warn", action: "早盘高抛 159516、588170、512760，午后重新买入半导设备ETF与科创半导体ETF；账户 -514.40，仓位 88.50%。", market: "每日复盘认为盘面结构很割裂：商业航天午后虹吸资金，科技链从正常分歧升级成承接塌陷，芯片/半导体被打到冰点。", operation: "早盘 159516 在 2%-3% 附近高抛、588170 约 1% 冲高卖出是对的；真正错误是 -3% 后继续向 -4%、-5% 走时，没有承认低吸预案失效，继续加仓摊平成本。", reflection: "金字塔加仓只能用于做对之后扩大战果，不能用于做错后安慰自己。做错时第一动作是停止继续犯错，而不是把仓位越打越重。", next: "7/13 只按强修复、弱修复、不修复三套预案处理；强修复也降仓，弱修复减仓，不修复认错，禁止继续摊平。", sourceUrl: dailySources.d0710 },
];

const ticketCards = [
  { role: "主要赚钱/做对线", title: "三冰反核 ETF 主仓", codes: "159516 / 588170 / 512760", pnl: semiconductorClosedPnl, text: "可见闭环部分约 " + money(semiconductorClosedPnl) + "，但期末仍持有 159516 与 588170，真实周贡献需等持仓截图校准。赚钱的根源不是某只票，而是周四三冰反核节点踩对，用 ETF 承接科技修复。", emotion: "周四敢把仓位推到 80% 是进步，说明能在极致冰点后的反核确认日从防守切进攻。这里要保留的是择时和 ETF 主仓，而不是随意重仓任何科技票。", rule: "三冰反核是高性价比节点，但必须用预案管理：启动日敢打，二高潮次日先按分化做T，错了按 ETF 单笔风险离场。" },
  { role: "主要亏损票", title: "机器人ETF广发", codes: "159050", pnl: robotPnl, text: "7/6 分批买入 8900 股，7/7 条件单清仓，可见闭环约 " + money(robotPnl) + "。亏损根源是高潮次日分歧还进早了，机器人没有一致回流，也没有核心一字顶住。", emotion: "心理上有着急回本和摊成本倾向：价格到大阳线一半/5日线就想动手，但没有等板块强度和核心信号确认。", rule: "退潮期 ETF 试错仓必须小，不能靠补仓解决节奏错误；补仓只能发生在确认加仓，而不是摊成本。" },
  { role: "主要亏损/风险根源", title: "半导体设备ETF国泰", codes: "159516", pnl: null, text: "本周可见买入 15100 股、卖出 7900 股，期末按可见口径剩余 7200 股；但 7/10 早盘卖出数量与本周前序可见买入、价格口径存在明显跨期/复权口径问题，真实盈亏待持仓截图与历史成本校准。", emotion: "周五早盘高抛是对的，午后商业航天虹吸后继续低吸摊平是错的。错误不在第一次低吸，而在 -3% 后承接失效仍继续加仓。", rule: "ETF低吸必须有失效线：正常分歧可 -1%、-2%、-3% 分批；跌破 -3% 后继续走弱且资金被别的题材虹吸，就进入冷静模式，不再摊平。" },
  { role: "期末持仓/待校准", title: "科创半导体ETF华夏", codes: "588170", pnl: closedPnL["588170"], text: "7/9 买入的 3300 股在 7/10 早盘卖出，可见闭环约 " + money(closedPnL["588170"]) + "；7/10 午后又买回 3400 股，含费可见成本约 " + rawMoney(openPositionCost588170) + "，期末市价和浮盈亏待持仓截图确认。", emotion: "这票体现出会做T，但预案失效后停手不够的问题。前半段高抛正确，后半段在科技承接塌陷时继续接回，风险抬高。", rule: "顺势做T可以，逆势摊平不行；商业航天这类新题材虹吸改变资金结构时，旧主线不能再按普通分歧模板处理。" },
  { role: "小仓试错", title: "大名城 / 恒生医疗", codes: "600094 / 159506", pnl: smallTestPnl, text: "两笔小仓试错合计约 " + money(smallTestPnl) + "，金额很小，不是本周账户主因。它们的价值是感受水温，而不是贡献收益。", emotion: "周三小仓试错控制得住，没有把不确定票做成主仓，这是对的。", rule: "退潮末期观察票只做感受水温；没有题材强度、分时主动性和止损边界，就不加仓。" },
  { role: "跨周处理", title: "科创新材ETF博时", codes: "588010", pnl: priorPnl588010, text: "7/3 买入 2800 股含费成本约 " + rawMoney(priorCost588010) + "，7/6 卖出净回笼 3923.40，可见跨周小幅约 " + money(priorPnl588010) + "。", emotion: "这笔不是本周核心问题，更多是跨周仓位的平稳处理。", rule: "跨周仓必须把前一周成本带进来，否则现金流会误导单票贡献。" },
];

const missingItems = [
  "7/10 期末持仓截图：请补 159516、588170 的持股数、成本价、市价、市值、浮盈亏、总资产和仓位占比，用于校准期末持仓盈亏。",
  "159516 的历史持仓/复权口径：7/10 早盘卖出数量与本周可见前序买入、价格口径存在不匹配，需要持仓成本或券商持仓截图确认。",
  "7/6 收益金额口径：表格写 +320，但收益率 -2.02%、期末权益较上周下降；页面已按期末权益变化入周度曲线，待你确认是否应改成 -320 或其他口径。",
];

const secids = {
  "588010": "1.588010",
  "159050": "0.159050",
  "600094": "1.600094",
  "159506": "0.159506",
  "159516": "0.159516",
  "512760": "1.512760",
  "588170": "1.588170",
};

const stockDisplayNames = {
  "588010": "科创新材ETF博时",
  "159050": "机器人ETF广发",
  "600094": "大名城",
  "159506": "恒生医疗ETF富国",
  "159516": "半导体设备ETF国泰",
  "512760": "芯片ETF国泰",
  "588170": "科创半导体ETF华夏",
};

const stockCardOrder = ["159050", "159516", "588170", "512760", "600094", "159506", "588010"];

const stockNotes = {
  "159050": { headline: "机器人ETF广发是本周主要亏损闭环，可见约 " + money(closedPnL["159050"]) + "。", bullets: ["7/6 在机器人高潮次日分歧中进早并补仓，7/7 条件单清仓。", "做对的是次日按结构卖出躲掉后续大亏；做错的是退潮期仓位 61% 偏重。"] },
  "159516": { headline: "半导体设备ETF国泰是周四三冰反核主仓，也是周五预案失效后的最大待校准风险。", bullets: ["7/8 尾盘试错，7/9 扩大为主仓，7/10 早盘高抛后午后重新接回。", "7/10 跌破 -3% 后继续走弱，低吸预案已经失效，后续不能再摊平成本。", "该票存在历史持仓或复权口径问题，真实盈亏需要期末持仓截图校准。"] },
  "588170": { headline: "科创半导体ETF华夏 7/9 买入部分在 7/10 早盘闭环盈利，午后又成为期末持仓。", bullets: ["7/9 买入 3300 股，7/10 早盘卖出，按可见成本约 " + money(closedPnL["588170"]) + "。", "7/10 午后买回 3400 股，含费可见成本约 " + rawMoney(openPositionCost588170) + "，期末浮盈亏待补。"] },
  "512760": { headline: "芯片ETF国泰 7/9 买入、7/10 早盘卖出，可见闭环约 " + money(closedPnL["512760"]) + "。", bullets: ["这是三冰反核后 ETF 篮子的盈利闭环之一。", "后续注意同一科技主题多个 ETF 本质是一笔主题仓位，不要误以为分散。"] },
  "600094": { headline: "大名城 100 股小仓试错，闭环约 " + money(closedPnL["600094"]) + "。", bullets: ["周三只做水温观察，周四卖出。", "金额小，不影响账户主线，保持小仓观察属性即可。"] },
  "159506": { headline: "恒生医疗ETF富国小仓试错，闭环约 " + money(closedPnL["159506"]) + "。", bullets: ["周三买入、周四卖出，仓位极小。", "破位方向只能观察，不允许加仓摊平。"] },
  "588010": { headline: "科创新材ETF博时是 7/3 跨周仓，7/6 卖出后可见约 " + money(closedPnL["588010"]) + "。", bullets: ["该票成本来自上周 7/3 截图行，已按可见跨周成本纳入。", "它不是本周核心盈亏来源。"] },
};

const hubWeeks = [
  { label: "04.20-04.24", title: "2026.04.20 - 2026.04.24", pnl: 1616.89, equity: 31027.99, avgPosition: 94.7, bestDay: "周二 04-21 +2,117.00", worstDay: "周五 04-24 -2,413.00", href: "../2026-04-20_2026-04-24/", trades: "63 笔", status: "已发布" },
  { label: "05.08-05.16", title: "2026.05.08 - 2026.05.16", pnl: -4482.26, equity: 26545.73, avgPosition: 79.1, bestDay: "周一 05-11 +593.98", worstDay: "周四 05-14 -2,043.00", href: "../2026-05-08_2026-05-16/", trades: "37 笔", status: "已发布" },
  { label: "05.18-05.22", title: "2026.05.18 - 2026.05.22", pnl: -1553.76, equity: 24991.97, avgPosition: 53.64, bestDay: "周五 05-22 +1,680.00", worstDay: "周四 05-21 -1,779.76", href: "../2026-05-15_2026-05-22/", trades: "35 笔", status: "已发布" },
  { label: "05.25-05.29", title: "2026.05.25 - 2026.05.29", pnl: -1362.23, equity: 23629.74, avgPosition: 71.48, bestDay: "周一 05-25 +1,187.00", worstDay: "周四 05-28 -2,628.23", href: "../2026-05-25_2026-05-29/", trades: "25 笔", status: "已发布" },
  { label: "06.01-06.05", title: "2026.06.01 - 2026.06.05", pnl: -31, equity: 23598.74, avgPosition: 67.16, bestDay: "周四 06-04 +863.00", worstDay: "周三 06-03 -1,113.00", href: "../2026-06-01_2026-06-05/", trades: "11 笔", status: "已发布" },
  { label: "06.08-06.12", title: "2026.06.08 - 2026.06.12", pnl: -466, equity: 22879, avgPosition: 49.19, bestDay: "周一 06-08 +1,996.00", worstDay: "周二 06-09 -2,492.00", href: "../2026-06-08_2026-06-12/", trades: "14 笔", status: "已发布" },
  { label: "06.15-06.20", title: "2026.06.15 - 2026.06.20", pnl: -299, equity: 22567, avgPosition: 44.68, bestDay: "周四 06-18 +409.00", worstDay: "周一 06-15 -627.00", href: "../2026-06-15_2026-06-20/", trades: "16 笔", status: "草稿版" },
  { label: "06.22-06.26*", title: "2026.06.22 - 2026.06.26", pnl: -4839.42, equity: 17671.22, displayEquity: "暂估 / 市值17,671.22", avgPosition: 92.57, bestDay: "周一 06-22 -405.22", worstDay: "周五 06-26 -4,839.42", href: "../2026-06-22_2026-06-26/", trades: "8 笔", status: "草稿版" },
  { label: "06.29-07.04", title: "2026.06.29 - 2026.07.04", pnl: -1741, equity: 15858, avgPosition: 58.44, bestDay: "周二 06-30 +257.00", worstDay: "周四 07-02 -1,284.00", href: "../2026-06-29_2026-07-04/", trades: "21 笔", status: "草稿版" },
  { label: "07.06-07.10", title: "2026.07.06 - 2026.07.10", pnl: accountPnl, equity: endingEquity, avgPosition, bestDay: bestAccountDay.weekday + " " + bestAccountDay.date.slice(5).replace("/", "-") + " " + money(bestAccountDay.pnl), worstDay: worstAccountDay.weekday + " " + worstAccountDay.date.slice(5).replace("/", "-") + " " + money(worstAccountDay.pnl), href: "../2026-07-06_2026-07-10/", trades: trades.length + " 笔", status: "草稿版" },
];

let peak = -Infinity;
let previousEquity = null;
for (const item of hubWeeks) {
  const startEquity = previousEquity ?? item.equity - item.pnl;
  item.weekPct = startEquity ? (item.pnl / startEquity) * 100 : 0;
  peak = Math.max(peak, item.equity);
  item.drawdown = ((item.equity - peak) / peak) * 100;
  previousEquity = item.equity;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMetric(label, value, sub, cls = "") {
  return `<article class="metric"><span>${label}</span><strong class="${cls}">${value}</strong><small>${sub}</small></article>`;
}

function cnDate(date) {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

function trendTime(date, time) {
  return `${cnDate(date)} ${time.slice(0, 5)}`;
}

async function fetchTrend(code) {
  const secid = secids[code];
  if (!secid) return [];
  const url = `https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f53&iscr=0&iscca=0&ut=fa5fd1943c7b386f172d6893dbfba10b&ndays=5`;
  try {
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    const json = await response.json();
    return (json?.data?.trends || [])
      .map((row) => {
        const [time, price] = row.split(",");
        return { time, price: Number(price) };
      })
      .filter((item) => Number.isFinite(item.price));
  } catch (error) {
    console.warn(`trend fetch failed for ${code}: ${error.message}`);
    return [];
  }
}

function nearestIndex(data, time) {
  if (!data.length) return -1;
  const exact = data.findIndex((item) => item.time === time);
  if (exact >= 0) return exact;
  const target = new Date(time.replace(" ", "T")).getTime();
  let best = 0;
  let bestDelta = Infinity;
  data.forEach((item, index) => {
    const delta = Math.abs(new Date(item.time.replace(" ", "T")).getTime() - target);
    if (delta < bestDelta) {
      best = index;
      bestDelta = delta;
    }
  });
  return best;
}

function renderMinuteChart(stock, trend) {
  const stockTrades = trades
    .filter((trade) => trade.code === stock.code)
    .slice()
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const fallbackList = stockTrades.map((trade) => `<div class="trade-point-item"><span><b class="${trade.sideType === "buy" ? "buy" : "sell"}">${escapeHtml(trade.side)}</b> ${cnDate(trade.date).slice(5)} ${trade.time}</span><strong>${trade.price.toFixed(3)} / ${trade.qty.toLocaleString("en-US")} 股</strong></div>`).join("");
  if (!trend.length) {
    return `<div class="trade-map"><div class="trade-map-head"><h4>5 分钟线买卖点</h4><div class="trade-legend"><span class="legend-item"><i class="legend-shape buy"></i>买入</span><span class="legend-item"><i class="legend-shape sell"></i>卖出</span></div></div><p class="caption">分钟线暂未拉取成功，先保留真实成交点列表。</p><div class="trade-point-list">${fallbackList}</div></div>`;
  }

  const width = 876;
  const height = 290;
  const left = 52;
  const right = 24;
  const top = 24;
  const bottom = 38;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const prices = trend.map((item) => item.price);
  const markerPrices = stockTrades.map((trade) => trade.price);
  let min = Math.min(...prices, ...markerPrices);
  let max = Math.max(...prices, ...markerPrices);
  const pad = Math.max((max - min) * 0.12, max * 0.006, 0.01);
  min -= pad;
  max += pad;
  const x = (index) => left + (index / Math.max(1, trend.length - 1)) * plotW;
  const y = (price) => top + ((max - price) / Math.max(0.0001, max - min)) * plotH;
  const markerIndexes = new Set(stockTrades.map((trade) => nearestIndex(trend, trendTime(trade.date, trade.time))).filter((index) => index >= 0));
  const points = trend
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => index % 3 === 0 || markerIndexes.has(index) || index === trend.length - 1)
    .map(({ item, index }) => `${x(index).toFixed(1)},${y(item.price).toFixed(1)}`)
    .join(" ");
  const markers = stockTrades.map((trade, index) => {
    const trendIndex = nearestIndex(trend, trendTime(trade.date, trade.time));
    if (trendIndex < 0) return "";
    const mx = x(trendIndex);
    const my = y(trade.price);
    const isBuy = trade.sideType === "buy";
    const labelY = Math.max(14, my - 12 - (index % 4) * 10);
    const labelX = Math.min(width - 30, Math.max(30, mx + ((index % 3) - 1) * 16));
    const shape = isBuy
      ? `<path d="M ${mx.toFixed(1)} ${(my - 8).toFixed(1)} L ${(mx - 7).toFixed(1)} ${(my + 6).toFixed(1)} L ${(mx + 7).toFixed(1)} ${(my + 6).toFixed(1)} Z" fill="#c2412d" stroke="#fff" stroke-width="2"></path>`
      : `<path d="M ${mx.toFixed(1)} ${(my + 8).toFixed(1)} L ${(mx - 7).toFixed(1)} ${(my - 6).toFixed(1)} L ${(mx + 7).toFixed(1)} ${(my - 6).toFixed(1)} Z" fill="#1d4ed8" stroke="#fff" stroke-width="2"></path>`;
    return `<g><title>${escapeHtml(stock.name)} ${escapeHtml(trade.side)} ${cnDate(trade.date)} ${trade.time} ${trade.price.toFixed(3)} / ${trade.qty}股</title><line x1="${mx.toFixed(1)}" x2="${mx.toFixed(1)}" y1="${my.toFixed(1)}" y2="${height - bottom}" stroke="rgba(28,37,48,.18)" stroke-dasharray="3 5"></line>${shape}<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" class="point-label">${isBuy ? "B" : "S"}</text></g>`;
  }).join("");
  const dateStart = trend[0].time.slice(5, 16);
  const dateEnd = trend[trend.length - 1].time.slice(5, 16);
  const pointList = stockTrades.map((trade) => `<div class="trade-point-item"><span><b class="${trade.sideType === "buy" ? "buy" : "sell"}">${escapeHtml(trade.side)}</b> ${cnDate(trade.date).slice(5)} ${trade.time}</span><strong>${trade.price.toFixed(3)} / ${trade.qty.toLocaleString("en-US")} 股</strong></div>`).join("");

  return `<div class="trade-map"><div class="trade-map-head"><h4>5 分钟线买卖点</h4><div class="trade-legend"><span class="legend-item"><i class="legend-shape buy"></i>买入</span><span class="legend-item"><i class="legend-shape sell"></i>卖出</span></div></div><div class="trade-chart-wrap"><svg class="trade-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(stock.name)}5分钟走势与买卖点"><rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="#fff"></rect><line x1="${left}" x2="${width - right}" y1="${height - bottom}" y2="${height - bottom}" stroke="#e5e7eb"></line><line x1="${left}" x2="${width - right}" y1="${top}" y2="${top}" stroke="#edf0f3"></line><text x="${left}" y="17" class="axis-label">高 ${max.toFixed(2)}</text><text x="${width - right}" y="17" text-anchor="end" class="axis-label">低 ${min.toFixed(2)}</text><polyline points="${points}" class="market-line"></polyline>${markers}<text x="${left}" y="${height - 10}" text-anchor="start" class="axis-label">${escapeHtml(dateStart)}</text><text x="${width - right}" y="${height - 10}" text-anchor="end" class="axis-label">${escapeHtml(dateEnd)}</text></svg></div><div class="trade-point-list">${pointList}</div></div>`;
}

function timelineX(row) {
  const days = ["20260629", "20260630", "20260701", "20260702", "20260703"];
  const dayIndex = Math.max(0, days.indexOf(row.date));
  const [hh, mm] = row.time.split(":").map(Number);
  const start = 9 * 60 + 30;
  const end = 15 * 60;
  const minute = Math.max(start, Math.min(end, hh * 60 + mm));
  const fraction = (minute - start) / (end - start);
  return 60 + ((dayIndex + fraction) / days.length) * 780;
}

function renderTradeTimeline(title, subtitle, rows, note, summary) {
  const sorted = [...rows].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const width = 900;
  const height = 286;
  const left = 92;
  const right = 42;
  const top = 44;
  const bottom = 58;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const days = [
    { raw: "20260629", label: "06-29" },
    { raw: "20260630", label: "06-30" },
    { raw: "20260701", label: "07-01" },
    { raw: "20260702", label: "07-02" },
    { raw: "20260703", label: "07-03" },
  ];
  const codes = [...new Set(sorted.map((row) => row.code))];
  const xFor = (row) => {
    const dayIndex = Math.max(0, days.findIndex((day) => day.raw === row.date));
    const [hh, mm] = row.time.split(":").map(Number);
    const start = 9 * 60 + 30;
    const end = 15 * 60;
    const minute = Math.max(start, Math.min(end, hh * 60 + mm));
    const intraday = (minute - start) / (end - start);
    return left + ((dayIndex + intraday) / days.length) * plotW;
  };
  const ticks = days.map((day, i) => {
    const x = left + (i / (days.length - 1)) * plotW;
    return `<g><line x1="${x}" x2="${x}" y1="${top}" y2="${height - bottom}" stroke="rgba(28,37,48,.10)" stroke-dasharray="4 8"></line><text x="${x}" y="${height - 28}" text-anchor="middle" class="axis">${day.label}</text></g>`;
  }).join("");
  const markerTitle = (row) => `${row.name} ${row.side} ${row.qty}股 @ ${row.price} · ${formatDate(row.date)} ${row.time}`;
  let chartBody = "";
  if (codes.length <= 1) {
    const prices = sorted.map((row) => row.price);
    const rawMin = Math.min(...prices);
    const rawMax = Math.max(...prices);
    const pad = Math.max((rawMax - rawMin) * 0.18, rawMax * 0.006, 0.02);
    const minPrice = rawMin - pad;
    const maxPrice = rawMax + pad;
    const yFor = (price) => top + ((maxPrice - price) / (maxPrice - minPrice)) * plotH;
    const pricePath = sorted.map((row, i) => `${i ? "L" : "M"} ${xFor(row).toFixed(1)},${yFor(row.price).toFixed(1)}`).join(" ");
    const axisTicks = [maxPrice, (maxPrice + minPrice) / 2, minPrice].map((price) => {
      const y = yFor(price);
      return `<g><line x1="${left}" x2="${width - right}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(28,37,48,.08)"></line><text x="${left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="axis">${price.toFixed(3)}</text></g>`;
    }).join("");
    const seen = new Map();
    const markers = sorted.map((row) => {
      const key = `${row.date}${row.time}${row.price}`;
      const count = seen.get(key) || 0;
      seen.set(key, count + 1);
      const x = xFor(row) + (count - 0.5) * 12;
      const y = yFor(row.price);
      const cls = row.sideType === "buy" ? "buy-dot" : "sell-dot";
      const label = row.sideType === "buy" ? "B" : "S";
      const labelY = row.sideType === "buy" ? y + 26 + count * 12 : y - 17 - count * 12;
      return `<g class="${cls}">
        <title>${markerTitle(row)}</title>
        <line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${y.toFixed(1)}" y2="${height - bottom}" stroke="currentColor" stroke-width="1" stroke-opacity=".28"></line>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9"></circle>
        <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle">${label}</text>
        <text x="${x.toFixed(1)}" y="${Math.max(top + 12, Math.min(height - bottom - 6, labelY)).toFixed(1)}" text-anchor="middle" class="trade-price-label">${row.price.toFixed(3)}</text>
      </g>`;
    }).join("");
    chartBody = `${axisTicks}<path d="${pricePath}" fill="none" stroke="#15a477" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>${markers}<text x="${left}" y="24" class="axis">成交价分时点图：仅连接真实成交价，不伪造分钟行情</text>`;
  } else {
    const laneH = plotH / codes.length;
    const codeMeta = new Map(codes.map((code) => {
      const first = sorted.find((row) => row.code === code);
      return [code, first ? first.name : code];
    }));
    const lanes = codes.map((code, index) => {
      const y = top + laneH * index + laneH / 2;
      return `<g><line x1="${left}" x2="${width - right}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(28,37,48,.12)"></line><text x="${left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="trade-lane-label">${code}</text><text x="${left + 4}" y="${(y - laneH / 2 + 13).toFixed(1)}" class="axis">${escapeHtml(codeMeta.get(code))}</text></g>`;
    }).join("");
    const seen = new Map();
    const markers = sorted.map((row) => {
      const laneIndex = codes.indexOf(row.code);
      const key = `${row.date}${row.time}${row.code}`;
      const count = seen.get(key) || 0;
      seen.set(key, count + 1);
      const x = xFor(row) + (count - 0.5) * 10;
      const y = top + laneH * laneIndex + laneH / 2;
      const cls = row.sideType === "buy" ? "buy-dot" : "sell-dot";
      const label = row.sideType === "buy" ? "B" : "S";
      return `<g class="${cls}">
        <title>${markerTitle(row)}</title>
        <line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${y.toFixed(1)}" y2="${height - bottom}" stroke="currentColor" stroke-width="1" stroke-opacity=".24"></line>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8.5"></circle>
        <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle">${label}</text>
        <text x="${x.toFixed(1)}" y="${(y - 13).toFixed(1)}" text-anchor="middle" class="trade-price-label">${row.price.toFixed(3)}</text>
      </g>`;
    }).join("");
    chartBody = `${lanes}${markers}<text x="${left}" y="24" class="axis">多标的成交分布：按代码分行展示真实 B/S 点与成交价</text>`;
  }
  return `<article class="trade-map">
    <div class="trade-map-head"><div><h3>${title}</h3><p>${subtitle}</p></div><span class="chip">${summary}</span></div>
    <div class="trade-chart-wrap"><svg class="trade-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title} 买卖点图">
      <rect x="0" y="0" width="${width}" height="${height}" rx="12" fill="#fff"></rect>
      <line x1="${left}" x2="${width - right}" y1="${height - bottom}" y2="${height - bottom}" stroke="rgba(28,37,48,.20)"></line>
      ${ticks}${chartBody}
      <text x="${left}" y="${height - 10}" class="axis">红 B 买入 / 蓝 S 卖出；完整分钟曲线待行情数据补齐</text>
    </svg></div>
    <p class="caption">${note}</p>
  </article>`;
}

function renderDailyAccountChart() {
  const width = 900;
  const height = 328;
  const left = 76;
  const right = 86;
  const top = 42;
  const bottom = 82;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const returnMin = -10;
  const returnMax = 10;
  const positionMin = 0;
  const positionMax = 100;
  const xFor = (index) => left + (index / (accountDays.length - 1)) * plotW;
  const yReturn = (value) => top + ((returnMax - value) / (returnMax - returnMin)) * plotH;
  const yPosition = (value) => top + ((positionMax - value) / (positionMax - positionMin)) * plotH;
  const grid = [-10, -5, 0, 5, 10].map((tick) => {
    const y = yReturn(tick);
    return `<g><line x1="${left}" x2="${width - right}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(28,37,48,.09)" stroke-dasharray="4 7"></line><text x="${left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="axis">${pct(tick)}</text></g>`;
  }).join("");
  const rightTicks = [0, 25, 50, 75, 100].map((tick) => {
    const y = yPosition(tick);
    return `<text x="${width - right + 12}" y="${(y + 4).toFixed(1)}" class="axis">${tick}%</text>`;
  }).join("");
  const zeroY = yReturn(0);
  const barW = 52;
  const bars = accountDays.map((day, index) => {
    const x = xFor(index);
    const y = yReturn(day.returnRate);
    const barY = Math.min(y, zeroY);
    const barH = Math.max(2, Math.abs(zeroY - y));
    const fill = day.returnRate >= 0 ? "#c2412d" : "#14845f";
    const labelY = day.returnRate >= 0 ? barY - 9 : barY + barH + 16;
    return `<g>
      <rect x="${(x - barW / 2).toFixed(1)}" y="${barY.toFixed(1)}" width="${barW}" height="${barH.toFixed(1)}" rx="6" fill="${fill}" opacity=".9"></rect>
      <text x="${x.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" class="daily-chart-label" fill="${fill}">${pct(day.returnRate)}</text>
      <text x="${x.toFixed(1)}" y="${(height - 42).toFixed(1)}" text-anchor="middle" class="axis">${day.weekday}</text>
      <text x="${x.toFixed(1)}" y="${(height - 24).toFixed(1)}" text-anchor="middle" class="axis">${day.date.slice(5).replace("/", "-")}</text>
      <text x="${x.toFixed(1)}" y="${(height - 6).toFixed(1)}" text-anchor="middle" class="daily-money-label">${money(day.pnl)}</text>
    </g>`;
  }).join("");
  const positionPoints = accountDays.map((day, index) => ({ x: xFor(index), y: yPosition(day.position), day }));
  const positionPath = positionPoints.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const positionDots = positionPoints.map((point) => `<g>
    <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="5.5" fill="#1d4ed8" stroke="#fff" stroke-width="2"></circle>
    <text x="${point.x.toFixed(1)}" y="${Math.max(top + 12, point.y - 12).toFixed(1)}" text-anchor="middle" class="position-label">${point.day.position.toFixed(1)}%</text>
  </g>`).join("");
  return `<div class="account-chart-wrap"><svg class="account-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="每日收益率与仓位比例">
    <rect x="0" y="0" width="${width}" height="${height}" rx="12" fill="#fff"></rect>
    ${grid}${rightTicks}
    <line x1="${left}" x2="${width - right}" y1="${zeroY.toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="rgba(28,37,48,.30)"></line>
    ${bars}
    <path d="${positionPath}" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 7"></path>
    ${positionDots}
    <text x="${left}" y="24" class="axis">左轴：每日盈亏百分比 / 柱状图</text>
    <text x="${width - right}" y="24" text-anchor="end" class="axis">右轴：每日持仓比例 / 蓝色虚线</text>
  </svg></div>`;
}

function renderTradeTable() {
  return chronological.map((row) => `<tr>
    <td>${formatDate(row.date)}</td>
    <td>${row.time}</td>
    <td>${row.code}</td>
    <td>${row.name}</td>
    <td class="${row.sideType === "buy" ? "buy-text" : "sell-text"}">${row.side}</td>
    <td>${row.qty}</td>
    <td>${row.price.toFixed(3)}</td>
    <td>${rawMoney(row.amount)}</td>
    <td>${rawMoney(row.fee)}</td>
    <td>${rawMoney(row.tax)}</td>
    <td class="${classByValue(row.net)}">${money(row.net)}</td>
    <td>${rawMoney(row.balance)}</td>
  </tr>`).join("");
}

function renderGroupRows() {
  return grouped.map((item) => {
    const supported = item.buyQty > 0 && item.sellQty > 0 && item.buyQty === item.sellQty;
    const pnl = item.sellCash - item.buyCash;
    const role = item.buyQty > item.sellQty ? "期末持仓/待补市价" : item.sellQty > item.buyQty ? "历史持仓卖出/待补成本" : "本周闭环";
    return `<tr>
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td>${role}</td>
      <td>${item.buyQty}</td>
      <td>${item.sellQty}</td>
      <td>${item.buyCash ? rawMoney(item.buyCash) : "-"}</td>
      <td>${item.sellCash ? rawMoney(item.sellCash) : "-"}</td>
      <td class="${supported ? classByValue(pnl) : ""}">${supported ? money(pnl) : "待补"}</td>
    </tr>`;
  }).join("");
}

function renderTicketCards() {
  return ticketCards.map((card) => `<article class="ticket-card">
    <div class="ticket-head"><div><span class="label">${card.role}</span><h3>${card.title}</h3><p>${card.codes}</p></div><strong class="${card.pnl == null ? "" : classByValue(card.pnl)}">${card.pnl == null ? "待补" : money(card.pnl)}</strong></div>
    <div class="note-grid">
      <p><b>盈亏依据</b>${card.text}</p>
      <p><b>操作&情绪</b>${card.emotion}</p>
      <p><b>下次规则</b>${card.rule}</p>
    </div>
  </article>`).join("");
}

function renderAccountRows() {
  return accountDays.map((day) => `<tr>
    <td>${day.date}</td>
    <td>${day.weekday}</td>
    <td class="${classByValue(day.returnRate)}">${pct(day.returnRate)}</td>
    <td class="${classByValue(day.pnl)}">${money(day.pnl)}</td>
    <td>${day.position.toFixed(2)}%</td>
    <td>${rawMoney(day.equity)}</td>
  </tr>`).join("");
}

function renderDailyCards() {
  return dailyCards.map((card) => {
    const account = accountDays.find((day) => day.date === card.date);
    return `<article class="day-card ${card.tone}">
    <div class="day-head">
      <div>
        <span>${card.day} · ${card.date}</span>
        <h3>${card.title}</h3>
        <p>${card.action}</p>
      </div>
      <strong class="chip ${card.tone === "warn" ? "chip-warn" : card.tone === "good" ? "chip-good" : ""}">${card.tag}</strong>
    </div>
    ${account ? `<div class="daily-account"><b class="${classByValue(account.pnl)}">${money(account.pnl)} 元</b><span class="${classByValue(account.returnRate)}">${pct(account.returnRate)}</span><span>仓位 ${account.position.toFixed(2)}%</span><span>总金额 ${rawMoney(account.equity)}</span></div>` : ""}
    <div class="raw-note-grid">
      <section><h4>主线与情绪</h4><p>${card.market}</p></section>
      <section><h4>操作&情绪复盘</h4><p>${card.operation}</p></section>
      <section><h4>个人反思</h4><p>${card.reflection}</p></section>
      <section><h4>次日关注</h4><p>${card.next}</p><a class="source-link" href="${card.sourceUrl}" target="_blank" rel="noreferrer">查看每日原文</a></section>
    </div>
  </article>`;
  }).join("");
}

function renderMissingItems() {
  return missingItems.map((item) => `<li>${item}</li>`).join("");
}

function renderStockCards(trends) {
  return stockCardOrder.map((code) => {
    const item = grouped.find((row) => row.code === code) || {
      code,
      name: stockDisplayNames[code] || code,
      buyQty: 0,
      sellQty: 0,
      buyCash: 0,
      sellCash: 0,
    };
    const name = stockDisplayNames[code] || item.name;
    const openQty = Math.max(0, item.buyQty - item.sellQty);
    const pnl = Object.prototype.hasOwnProperty.call(closedPnL, code) ? closedPnL[code] : null;
    const chipText = pnl != null ? money(pnl) : code === "588010" ? "持仓待确认" : "历史成本待补";
    const chipClass = pnl == null ? "warn" : classByValue(pnl);
    const note = stockNotes[code] || { headline: "该票待补分析。", bullets: ["后续补充对应操作与情绪分析。"] };
    return `<article class="stock-card">
      <div class="stock-top">
        <div><h3>${escapeHtml(name)}</h3><p>${code} · 买入 ${item.buyQty.toLocaleString("en-US")} 股 / 卖出 ${item.sellQty.toLocaleString("en-US")} 股${openQty ? ` / 未平 ${openQty.toLocaleString("en-US")} 股` : ""}</p></div>
        <span class="chip ${chipClass}">${escapeHtml(chipText)}</span>
      </div>
      <p><strong>${escapeHtml(note.headline)}</strong></p>
      <ul class="trade-context">${note.bullets.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      ${renderMinuteChart({ code, name }, trends[code] || [])}
    </article>`;
  }).join("");
}

function renderLegacyOverviewSections() {
  const contributionRows = [
    { name: "半导体 / 芯片 ETF 篮子", code: "512760 / 588170 / 588710 / 588890 / 589260", pnl: chipBasketPnl, note: "ETF 方向本身可做，亏在科技连续高潮后没有三高砸盘，浮盈没有转成防守。" },
    { name: "太极实业", code: "600667", pnl: closedPnL["600667"], note: "趋势个股试错失败，不是当时最明确的唯一核心，不能承担主仓位预期。" },
    { name: "海南海药", code: "000566", pnl: closedPnL["000566"], note: "隔日小幅保本离场，风险没有扩大，说明处理弱修复票时纪律还在。" },
  ];
  const maxAbs = Math.max(...contributionRows.map((row) => Math.abs(row.pnl)), 1);
  return `<section class="two-col">
    <article class="panel" id="legacy-account">
      <h2>交割单 + 账户口径核算</h2>
      <p>本周交割单覆盖 2026/6/29 至 2026/7/3。账户口径按你补充的每日收益表入账：本周账户盈亏 ${money(accountPnl)}，日收益率合计 ${pct(accountReturnSum)}，平均周仓位 ${avgPosition.toFixed(2)}%。现金流不直接等于收益，6/29 跨周卖出的亨通光电和亨通股份仍缺历史成本，7/3 新开的科创新材ETF仍缺期末持仓市价。</p>
      <div class="mini-grid">
        <span>账户周盈亏 <b class="${classByValue(accountPnl)}">${money(accountPnl)}</b></span>
        <span>收益率合计 <b class="${classByValue(accountReturnSum)}">${pct(accountReturnSum)}</b></span>
        <span>平均周仓位 <b>${avgPosition.toFixed(2)}%</b></span>
        <span>期末权益 <b>${rawMoney(endingEquity)}</b></span>
        <span>期末现金 <b>${rawMoney(finalCash)}</b></span>
        <span>推算持仓市值 <b>${rawMoney(inferredStockValue)}</b></span>
        <span>期末仓位 <b>${endingPosition.toFixed(2)}%</b></span>
        <span>费用税费 <b>${rawMoney(totalCost)}</b></span>
      </div>
      <div class="account-days">${accountDays.map((day) => `<div class="account-day"><strong>${escapeHtml(day.date)} ${escapeHtml(day.weekday)}</strong><span>当日盈亏 <b class="${classByValue(day.pnl)}">${money(day.pnl)}</b></span><span>收益率 <b class="${classByValue(day.returnRate)}">${pct(day.returnRate)}</b></span><span>仓位 <b>${day.position.toFixed(2)}%</b></span><span>总金额 <b>${rawMoney(day.equity)}</b></span></div>`).join("")}</div>
    </article>
    <article class="panel">
      <h2>先版结论</h2>
      <ul class="takeaways">
        <li>本周最大问题不是交易次数，而是科技趋势退潮节奏没有处理好：三高阶段没有砸，浮盈没有先保护住。</li>
        <li>趋势行情里 ETF 是更适合当前体系的工具；中屁股和趋势个股可以小仓试错，但不能在看不准时承担主仓位。</li>
        <li>6/29 亨通光电、亨通股份的亏损根源，是科技趋势尾段还去做个股；7/2 的亏损根源，是科技退潮时 ETF 没有高位撤退。</li>
        <li>7/3 尾盘转入科创新材ETF，方向上更贴近趋势 ETF 打法，但下周一仍必须先写强弱验证、止损线和是否加仓条件。</li>
      </ul>
    </article>
  </section>
  <section class="two-col">
    <article class="panel">
      <h2>闭环贡献</h2>
      <p class="section-note">这里统计已平仓且能由本周交割单直接锁定的部分；跨周卖出的亨通系因缺历史成本暂不纳入真实盈亏。</p>
      <div class="bar-list">${contributionRows.map((row) => {
        const width = Math.max(12, Math.min(100, Math.abs(row.pnl) / maxAbs * 100));
        return `<div class="bar-row"><div class="bar-meta"><span>${escapeHtml(row.name)} ${escapeHtml(row.code)}</span><strong class="${classByValue(row.pnl)}">${money(row.pnl)}</strong></div><div class="bar-track"><span class="${row.pnl < 0 ? "is-loss" : "is-profit"}" style="width:${width.toFixed(1)}%"></span></div><p>${escapeHtml(row.note)}</p></div>`;
      }).join("")}</div>
    </article>
    <article class="panel">
      <h2>未卖持仓市值推算</h2>
      <p class="section-note">7/3 尾盘买入科创新材ETF博时 2800 股，含费成本约 ${rawMoney(openPositionCost)}。当前缺期末持仓截图，所以这里只按账户期末权益和现金余额反推持仓市值，后续以券商截图校准。</p>
      <div class="mini-grid">
        <span>科创新材ETF 持仓 <b>2,800 股</b></span>
        <span>含费成本 <b>${rawMoney(openPositionCost)}</b></span>
        <span>期末现金 <b>${rawMoney(finalCash)}</b></span>
        <span>期末权益 <b>${rawMoney(endingEquity)}</b></span>
        <span>推算持仓市值 <b>${rawMoney(inferredStockValue)}</b></span>
        <span>推算浮盈亏 <b class="${classByValue(inferredStockValue - openPositionCost)}">${money(inferredStockValue - openPositionCost)}</b></span>
        <span>期末仓位 <b>${endingPosition.toFixed(2)}%</b></span>
        <span>状态 <b>待截图确认</b></span>
      </div>
    </article>
  </section>`;
}

function renderLegacyOverviewSections() {
  const contributionRows = [
    { name: "机器人ETF广发", code: "159050", pnl: robotPnl, note: "高潮次日分歧进早，退潮期仓位偏重；次日条件单卖出是对的。" },
    { name: "三冰反核ETF闭环", code: "512760 / 588170", pnl: semiconductorClosedPnl, note: "周四择时正确，ETF主仓有效；真实总贡献仍需纳入期末浮动。" },
    { name: "大名城 / 恒生医疗", code: "600094 / 159506", pnl: smallTestPnl, note: "小仓感受水温，不是主因，保持观察属性。" },
    { name: "科创新材ETF跨周", code: "588010", pnl: priorPnl588010, note: "7/3 跨周仓，7/6 平稳卖出，基本不影响本周结论。" },
  ];
  const maxAbs = Math.max(...contributionRows.map((row) => Math.abs(row.pnl)), 1);
  const accountHtml = accountDays.map((day) => '<div class="account-day"><strong>' + escapeHtml(day.date) + ' ' + escapeHtml(day.weekday) + '</strong><span>当日盈亏 <b class="' + classByValue(day.pnl) + '">' + money(day.pnl) + '</b></span><span>收益率 <b class="' + classByValue(day.returnRate) + '">' + pct(day.returnRate) + '</b></span><span>仓位 <b>' + day.position.toFixed(2) + '%</b></span><span>总金额 <b>' + rawMoney(day.equity) + '</b></span></div>').join('');
  const bars = contributionRows.map((row) => {
    const width = Math.max(12, Math.min(100, Math.abs(row.pnl) / maxAbs * 100));
    return '<div class="bar-row"><div class="bar-meta"><span>' + escapeHtml(row.name) + ' ' + escapeHtml(row.code) + '</span><strong class="' + classByValue(row.pnl) + '">' + money(row.pnl) + '</strong></div><div class="bar-track"><span class="' + (row.pnl < 0 ? 'is-loss' : 'is-profit') + '" style="width:' + width.toFixed(1) + '%"></span></div><p>' + escapeHtml(row.note) + '</p></div>';
  }).join('');
  return '<section class="two-col">'
    + '<article class="panel" id="legacy-account"><h2>交割单 + 账户口径核算</h2><p>本周交割单覆盖 2026/7/6 至 2026/7/10。周度资金曲线先按期末权益变化入账：上周末权益 15,858.00，本周末权益 15,596.00，账户口径 ' + money(accountPnl) + '。你补充的每日收益金额合计为 ' + money(reportedPnlSum) + '，其中 7/6 收益金额与收益率/权益变化口径不一致，已列入待补。</p><div class="mini-grid"><span>账户周变化 <b class="' + classByValue(accountPnl) + '">' + money(accountPnl) + '</b></span><span>日收益率合计 <b class="' + classByValue(accountReturnSum) + '">' + pct(accountReturnSum) + '</b></span><span>平均周仓位 <b>' + avgPosition.toFixed(2) + '%</b></span><span>期末权益 <b>' + rawMoney(endingEquity) + '</b></span><span>期末现金 <b>' + rawMoney(finalCash) + '</b></span><span>推算持仓市值 <b>' + rawMoney(inferredStockValue) + '</b></span><span>期末仓位 <b>' + endingPosition.toFixed(2) + '%</b></span><span>费用税费 <b>' + rawMoney(totalCost) + '</b></span></div><div class="account-days">' + accountHtml + '</div></article>'
    + '<article class="panel"><h2>先版结论</h2><ul class="takeaways"><li>本周做对的核心是周二空仓防守、周三尾盘小仓试错、周四三冰反核敢用 ETF 主仓进攻。</li><li>本周最大问题是周一分歧进早，以及周五商业航天虹吸后，科技链从正常分歧变成承接塌陷时，仍继续摊平成本。</li><li>趋势/ETF 玩法正在成型：没有连板高度时，用 ETF 表达主线比赌单只个股更贴合当前体系。</li><li>下周最重要的是处理 159516 和 588170：强修复也降仓，弱修复减仓，不修复认错，禁止继续摊平。</li></ul></article></section>'
    + '<section class="two-col"><article class="panel"><h2>闭环贡献</h2><p class="section-note">这里只统计截图可支持的闭环部分；159516 由于历史持仓/复权口径待补，暂不硬算真实贡献。</p><div class="bar-list">' + bars + '</div></article>'
    + '<article class="panel"><h2>期末持仓市值推算</h2><p class="section-note">期末可见持仓主要为 159516 半导体设备ETF国泰和 588170 科创半导体ETF华夏。缺 7/10 持仓截图，所以这里先用期末权益减现金余额反推总市值，后续以券商持仓截图校准。</p><div class="mini-grid"><span>159516 可见未平 <b>7,200 股</b></span><span>588170 可见未平 <b>3,400 股</b></span><span>可见持仓成本 <b>' + rawMoney(openPositionCost) + '</b></span><span>期末现金 <b>' + rawMoney(finalCash) + '</b></span><span>期末权益 <b>' + rawMoney(endingEquity) + '</b></span><span>推算持仓市值 <b>' + rawMoney(inferredStockValue) + '</b></span><span>推算浮动 <b class="' + classByValue(inferredStockValue - openPositionCost) + '">' + money(inferredStockValue - openPositionCost) + '</b></span><span>状态 <b>待截图确认</b></span></div></article></section>';
}

function renderWeekPage(trends = {}) {
  const chipRows = trades.filter((row) => ["512760", "588170", "588710", "588890", "589260"].includes(row.code));
  const hainanRows = trades.filter((row) => row.code === "000566");
  const taijiRows = trades.filter((row) => row.code === "600667");
  const openRows = trades.filter((row) => row.code === "588010");
  const priorRows = trades.filter((row) => ["600487", "600226"].includes(row.code));

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${week.rangeText} 每周交割复盘</title>
  <style>
    :root{--bg:#f6f7f8;--panel:#fff;--ink:#1c2530;--muted:#667085;--line:#dfe4ea;--soft:#f2f5f8;--accent:#c2412d;--accent-soft:#fff1ed;--red:#c2412d;--green:#14845f;--blue:#1d4ed8;--amber:#b76305;--shadow:0 18px 44px rgba(28,37,48,.08);--radius:12px}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:linear-gradient(180deg,#f7f8fa 0%,#eef2f5 100%);color:var(--ink);font-family:"Avenir Next","PingFang SC","Noto Sans SC","Microsoft YaHei",Arial,sans-serif}
    a{color:inherit}.shell{width:min(1480px,calc(100vw - 24px));margin:0 auto;padding:18px 0 48px;display:grid;grid-template-columns:176px 1fr;gap:18px}.side{position:sticky;top:16px;align-self:start;background:rgba(255,255,255,.95);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:14px;display:grid;gap:8px}.side h2{font-size:13px;margin:0 0 4px;color:var(--muted)}.side a{min-height:34px;display:flex;align-items:center;padding:7px 9px;border-radius:8px;text-decoration:none;font-size:13px;color:var(--muted)}.side a:hover{background:var(--soft);color:var(--ink)}
    .page{display:grid;gap:18px}.hero,.panel,.metric,.ticket-card,.daily-card,.trade-map,.stock-card{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.hero{padding:26px;display:grid;grid-template-columns:1.15fr .85fr;gap:22px;align-items:end}.label{display:inline-flex;width:max-content;max-width:100%;padding:7px 10px;border-radius:999px;background:var(--accent-soft);color:var(--accent);font-size:12px;font-weight:800}.hero h1{margin:14px 0 12px;font-size:clamp(34px,5vw,66px);line-height:1.04;letter-spacing:0}.hero p,.panel p,.daily-card p,.ticket-card p,.caption,li{color:var(--muted);line-height:1.72}.hero-side,.metric-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.metric{padding:16px;display:grid;gap:8px;min-height:104px}.metric span,.metric small{color:var(--muted);font-size:12px}.metric strong{font-size:24px}.panel{padding:24px}.panel h2{margin:0 0 12px;font-size:24px}.section-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:16px}.section-head p{margin:6px 0 0}.chip{display:inline-flex;align-items:center;white-space:nowrap;border:1px solid var(--line);border-radius:999px;padding:7px 10px;background:#f8fafc;color:var(--muted);font-size:12px;font-weight:800}.chip.is-profit{background:#fef2f2;color:#991b1b}.chip.is-loss{background:#ecfdf3;color:#067647}.chip.warn{background:#fff7ed;color:#b76305}.grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.two-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.info-card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:16px}.info-card h3{margin:0 0 8px;font-size:18px}.is-profit,.buy-text{color:var(--red)}.is-loss,.sell-text{color:var(--green)}.warn{color:var(--amber)}.old-trade-section{display:none!important}
    .source-strip{display:grid;grid-template-columns:1.1fr .9fr;gap:14px}.quote{border-left:4px solid var(--accent);padding:12px 14px;background:#fff7ed;border-radius:0 10px 10px 0;color:var(--ink);font-weight:700}.mini-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.mini-grid span{background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:10px;color:var(--muted);font-size:13px;min-width:0}.mini-grid b{display:block;color:var(--ink);margin-top:4px;overflow-wrap:anywhere}.mini-grid b.is-profit{color:var(--red)}.mini-grid b.is-loss{color:var(--green)}.account-days{display:grid;gap:8px;margin-top:14px}.account-day{display:grid;grid-template-columns:138px repeat(4,minmax(0,1fr));gap:8px;align-items:center;background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:10px;min-width:0}.account-day strong{font-size:13px}.account-day span{color:var(--muted);font-size:12px;line-height:1.45;min-width:0}.account-day b{display:block;color:var(--ink);margin-top:2px}.account-day b.is-profit{color:var(--red)}.account-day b.is-loss{color:var(--green)}.takeaways{padding-left:20px}.bar-list{display:grid;gap:12px}.bar-meta{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.bar-track{height:10px;background:var(--soft);border-radius:999px;overflow:hidden}.bar-track span{display:block;height:100%;border-radius:inherit;background:var(--red)}.bar-track span.is-loss{background:var(--green)}.bar-row p{margin:6px 0 0;font-size:12px}.ticket-list,.daily-grid,.day-list,.trade-map-grid,.stock-grid{display:grid;gap:14px}.stock-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.stock-card{padding:18px}.stock-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.stock-top h3{font-size:21px;margin:0 0 8px}.stock-top p{margin:0}.trade-context{display:grid;gap:6px;margin:0 0 12px;padding-left:18px}.trade-context li{font-size:13px;line-height:1.55;color:var(--muted)}.ticket-head,.trade-map-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.ticket-head h3,.trade-map h3{font-size:21px;margin:8px 0 4px}.ticket-head strong{font-size:24px}.note-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.note-grid p{background:#f8fafc;border:1px solid var(--line);border-radius:10px;margin:0;padding:12px}.note-grid b{display:block;color:var(--ink);margin-bottom:4px}.daily-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.daily-card{padding:16px}.daily-card span{font-size:12px;color:var(--muted);font-weight:800}.daily-card h3{font-size:17px;margin:8px 0}.day-card{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px}.day-card.good{border-color:rgba(20,132,95,.28)}.day-card.warn{border-color:rgba(183,99,5,.28)}.day-card>span,.day-head span{font-size:12px;color:var(--muted);font-weight:800}.day-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.day-head h3{font-size:21px;margin:8px 0 6px}.day-head p{margin:0}.chip-good{background:#ecfdf3;color:#067647;border-color:rgba(20,132,95,.26)}.chip-warn{background:#fff7ed;color:#b76305;border-color:rgba(183,99,5,.26)}.daily-account{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.daily-account b,.daily-account span{display:inline-flex;align-items:center;min-height:26px;padding:4px 8px;border-radius:999px;background:#f8fafc;border:1px solid var(--line);font-size:12px}.raw-note-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:12px}.raw-note-grid section{background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:12px;min-width:0}.raw-note-grid h4{margin:0 0 6px;font-size:14px;color:var(--ink)}.raw-note-grid p{margin:0;font-size:13px}.source-link{display:inline-flex;margin-top:8px;color:var(--blue);font-size:12px;font-weight:800;text-decoration:none}.source-link:hover{text-decoration:underline}.account-chart-wrap{margin-top:14px;overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff}.account-chart{display:block;width:100%;min-width:780px;height:auto}.daily-chart-label,.position-label,.daily-money-label,.trade-price-label,.trade-lane-label{font-size:11px;font-weight:900;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}.position-label{fill:var(--blue)}.daily-money-label{fill:var(--ink);font-size:10px}.trade-price-label{fill:var(--ink)}.trade-lane-label{fill:var(--ink)}.account-table{margin-top:14px}.daily-card.good{border-color:rgba(20,132,95,.28)}.daily-card.warn{border-color:rgba(183,99,5,.28)}.trade-map{padding:16px;margin-top:14px;background:#f8fafc}.trade-map-head h4{margin:0;font-size:15px}.trade-legend{display:flex;gap:8px;color:var(--muted);font-size:12px}.legend-item{display:inline-flex;align-items:center;gap:5px}.legend-shape{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent}.legend-shape.buy{border-bottom:11px solid var(--red)}.legend-shape.sell{border-top:11px solid var(--blue)}.trade-chart-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff}.trade-chart{display:block;width:100%;min-width:780px;height:auto}.axis,.axis-label{font-size:12px;fill:var(--muted)}.market-line{fill:none;stroke:#14956f;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.point-label{fill:var(--ink);font-size:11px;font-weight:800;paint-order:stroke;stroke:#fff;stroke-width:3px}.buy-dot{color:var(--red);fill:var(--red)}.sell-dot{color:var(--blue);fill:var(--blue)}.buy-dot text,.sell-dot text{fill:#fff;font-size:10px;font-weight:900}.marker-label{fill:var(--ink)!important;stroke:#fff;stroke-width:4px;paint-order:stroke;font-size:10px;font-weight:800}.trade-point-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.trade-point-item{display:flex;justify-content:space-between;gap:10px;align-items:center;min-height:40px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;font-size:12px;color:var(--muted);min-width:0}.trade-point-item span{min-width:0;overflow-wrap:anywhere}.trade-point-item strong{color:var(--ink);white-space:nowrap}.trade-point-item .buy{color:var(--red);font-weight:800}.trade-point-item .sell{color:var(--blue);font-weight:800}.caption{font-size:13px;margin:10px 0 0}
    .table-wrap{overflow:auto;border:1px solid var(--line);border-radius:10px;background:#fff}table{width:100%;border-collapse:collapse;min-width:980px;font-size:13px}th,td{padding:10px 12px;border-bottom:1px solid var(--line);white-space:nowrap;text-align:right}th:first-child,td:first-child,th:nth-child(2),td:nth-child(2),th:nth-child(3),td:nth-child(3),th:nth-child(4),td:nth-child(4){text-align:left}th{background:#f8fafc;color:var(--muted);font-weight:800}tr:last-child td{border-bottom:0}.rules{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.rule{border:1px solid var(--line);border-radius:10px;background:#fff;padding:16px}.rule h3{margin:0 0 8px}.missing{border:2px solid rgba(183,99,5,.24);background:linear-gradient(135deg,#fff7ed 0%,#fff 65%)}.missing ul{margin:8px 0 0;padding-left:20px}
    @media(max-width:1100px){.shell{grid-template-columns:minmax(0,1fr);overflow-x:hidden}.page,.hero,.panel,.metric,.ticket-card,.daily-card,.day-card,.trade-map,.stock-card,.source-strip,.grid-2,.grid-3,.daily-grid,.day-list,.rules,.note-grid,.raw-note-grid,.two-col,.stock-grid{min-width:0;max-width:100%}.page{width:100%;overflow-x:hidden}.panel{overflow-x:hidden}.side{position:sticky;top:0;z-index:10;width:100%;max-width:100%;min-width:0;display:flex;overflow-x:auto;border-radius:0 0 var(--radius) var(--radius)}.side h2{display:none}.side a{flex:0 0 auto}.hero,.source-strip,.grid-2,.two-col{grid-template-columns:minmax(0,1fr)}.daily-grid,.rules,.grid-3,.raw-note-grid,.stock-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.note-grid{grid-template-columns:minmax(0,1fr)}}
    @media(max-width:720px){html,body{overflow-x:hidden}.shell{width:min(100vw - 14px,1480px);padding-top:0}.hero,.panel{padding:18px}.hero-side,.metric-grid,.daily-grid,.rules,.grid-3,.raw-note-grid,.mini-grid,.stock-grid,.trade-point-list{grid-template-columns:minmax(0,1fr)}.account-day{grid-template-columns:1fr 1fr}.account-day strong{grid-column:1/-1}.hero h1{font-size:32px}.section-head,.ticket-head,.trade-map-head,.day-head,.stock-top{display:grid}.trade-chart{width:760px;max-width:none;min-width:0}}
  </style>
</head>
<body>
  <main class="shell">
    <nav class="side" aria-label="周复盘导航">
      <h2>本周导航</h2>
      <a href="../weekly-trading-review/">周度主页</a>
      <a href="../index.html">总首页</a>
      <a href="#top">本周总览</a>
      <a href="#source">数据口径</a>
      <a href="#account">账户口径</a>
      <a href="#ticket-analysis">盈亏票</a>
      <a href="#secondary-reflection">二次反思</a>
      <a href="#daily">逐日复盘</a>
      <a href="#stocks">买卖点图</a>
      <a href="#rules">沉淀规则</a>
      <a href="#trades">成交明细</a>
      <a href="#todo">缺口清单</a>
    </nav>
    <div class="page">
      <section class="hero" id="top">
        <div>
          <span class="label">${week.rangeText} · ${week.status}</span>
          <h1>${week.title}</h1>
          <p>本页已把本周交割单、每日账户数据、daily-trading-review 对应日期复盘和本周二次复盘合并成一版；159516 的历史持仓/复权口径和 7/10 期末持仓截图后续再校准。</p>
        </div>
        <div class="hero-side">
          ${renderMetric("可见闭环盈亏", money(visibleClosedLoopPnl), "不含跨周持仓卖出，不含期末浮动", classByValue(visibleClosedLoopPnl))}
          ${renderMetric("成交笔数", `${trades.length} 笔`, `${buyRows.length} 买 / ${sellRows.length} 卖`)}
          ${renderMetric("期末可见持仓", "159516 / 588170", "半导设备ETF 7200 股；科创半导 3400 股（待校准）")}
          ${renderMetric("账户口径", money(accountPnl), `日收益率合计 ${pct(accountReturnSum)}`, classByValue(accountPnl))}
        </div>
      </section>

      <section class="panel" id="source">
        <div class="section-head"><div><h2>数据口径</h2><p>本周交割单范围为 2026/7/6 - 2026/7/10。合同号、成交编号等隐私字段已隐藏，不进入网页；7/3 的科创新材ETF买入只作为跨周成本辅助，不列入本周逐笔明细。</p></div><span class="chip">截图转录 · 待复核</span></div>
        <div class="source-strip">
          <div class="grid-3">
            ${renderMetric("总成交额", rawMoney(turnover), "成交金额合计")}
            ${renderMetric("费用税费", rawMoney(totalCost), `手续费 ${rawMoney(fees)} / 印花税 ${rawMoney(tax)}`)}
            ${renderMetric("可见现金变动", money(netCash), `期末截图现金余额 ${rawMoney(finalCash)}`, classByValue(netCash))}
          </div>
          <div class="quote">注意：现金流不是收益。周度资金曲线先按期末权益变化入账；7/6 日收益金额与收益率/权益变化存在口径冲突，159516 也需要持仓截图校准真实盈亏。</div>
        </div>
      </section>

      ${renderLegacyOverviewSections()}

      <section class="panel" id="account">
        <div class="section-head"><div><h2>账户与持仓口径</h2><p>已按你补充的每日账户表更新，本周账户结果为 ${money(accountPnl)}，平均周仓位 ${avgPosition.toFixed(2)}%。</p></div><span class="chip">账户已补 · 持仓待补</span></div>
        <div class="grid-3">
          <article class="info-card"><h3>周账户结果</h3><p><b class="${classByValue(accountPnl)}">${money(accountPnl)} 元</b></p><p>日收益率合计 ${pct(accountReturnSum)}；最赚日 ${bestAccountDay.weekday} ${bestAccountDay.date.slice(5).replace("/", "-")} ${money(bestAccountDay.pnl)}，最亏日 ${worstAccountDay.weekday} ${worstAccountDay.date.slice(5).replace("/", "-")} ${money(worstAccountDay.pnl)}。</p></article>
          <article class="info-card"><h3>期末权益与仓位</h3><p><b>${rawMoney(endingEquity)} 元</b></p><p>期末仓位 ${endingPosition.toFixed(2)}%，平均周仓位 ${avgPosition.toFixed(2)}%。</p></article>
          <article class="info-card"><h3>资金结构</h3><p><b>现金 ${rawMoney(finalCash)} / 推算市值 ${rawMoney(inferredStockValue)}</b></p><p>期末新持仓为 588010 科创新材ETF博时 2800 股，市价和浮盈浮亏仍待截图确认。</p></article>
        </div>
        ${renderDailyAccountChart()}
        <div class="table-wrap account-table"><table><thead><tr><th>日期</th><th>星期</th><th>收益率</th><th>收益金额</th><th>仓位</th><th>当前总金额</th></tr></thead><tbody>${renderAccountRows()}</tbody></table></div>
      </section>

      <section class="panel" id="ticket-analysis">
        <div class="section-head"><div><h2>本周持有/闭环票：赚钱与亏损主因</h2><p>按交割单、每日复盘和本周二次复盘口径合并：本周核心不是 ETF 工具错，而是进场择时早于企稳确认，破位后又继续接。</p></div><span class="chip">二次复盘口径</span></div>
        <div class="ticket-list">${renderTicketCards()}</div>
      </section>

      <section class="panel" id="weekly-reflection">
        <div class="section-head"><div><h2>本周整体复盘</h2><p>本质上这周就一个问题：进场和离场的择时不对称。卖点整体不错，买点太急，机器人ETF和半导体ETF都在没有企稳时提前进场。</p></div><span class="chip">二次复盘已入</span></div>
        <div class="grid-2">
          <article class="info-card"><h3>本周亏损主因</h3><p>亏损主要来自买入时机太早：以为 ETF 跌到 -2%、-3% 就能进，实际一路杀到 -5%、-6% 才停止，这已经代表破位，不能再按普通分歧低吸继续干。</p></article>
          <article class="info-card"><h3>做对的地方</h3><p>出场时机整体还行，机器人ETF和半导体ETF多次卖在高点附近；ETF 作为趋势行情工具也继续成立，问题不在工具，而在买入必须等企稳确认。</p></article>
          <article class="info-card"><h3>错在价格阻力</h3><p>高位芯片向上阻力很大，前高附近容易做双头，抛压非常重。价格趋势线尚未形成就急于做T接回，本质上是在阻力最小方向没有判断清楚时抢跑。</p></article>
          <article class="info-card"><h3>下周重点</h3><p>先判断市场牛熊、题材逻辑、个股基本/技术/情绪，再判断压力支撑强度和价格阻力最小方向。只在突破、回升、有量企稳后买，不急着买最低点。</p></article>
        </div>
      </section>

      <section class="panel" id="secondary-reflection">
        <div class="section-head"><div><h2>本周二次复盘总结</h2><p>正式二次复盘口径：卖出不是主要问题，真正要优化的是进场节点、价格阻力判断和做错后的停止机制。</p></div><span class="chip">正式二次复盘</span></div>
        <div class="grid-2">
          <article class="info-card"><h3>1. 核心问题：进场早于企稳</h3><p>本周只有一个核心问题：进场离场时机不对称。卖点基本在高点附近，买点却抢在企稳前，机器人ETF和半导体ETF都是没等回升确认就先进去。</p></article>
          <article class="info-card"><h3>2. 下杀过深就是破位</h3><p>原本以为 -2%、-3% 低吸没问题，但本周多次一路杀到 -5%、-6% 才停。这个幅度本身就是破位表现，破位情况下不应该继续接，更不能靠补仓修正节奏错误。</p></article>
          <article class="info-card"><h3>3. 买点要等回升企稳</h3><p>节点买入的好处不是买在最低点，而是等最低点回升、拉升之后有量企稳再买；卖在高点附近已经可以接受，后续利润要从“有量拉稳后的买点”里抠出来。</p></article>
          <article class="info-card"><h3>4. 先判断阻力最小方向</h3><p>高位芯片在前高附近双头压力很大，向上阻力重、抛压重。不判断压力支撑强度和价格阻力最小方向，就急着做T接回，容易一口大面。</p></article>
          <article class="info-card"><h3>5. 四层判断框架</h3><p>先看基本市场条件：现在是牛市还是熊市；再看当前题材和板块逻辑；再看个股的基本面、技术面和情绪面；最后判断前三者对应的压力、支撑和突破方向。</p></article>
          <article class="info-card"><h3>6. 强回流次日强度</h3><p>无论是强回流启动，还是强回流后的二次启动，第二天分歧分化时必须有一字二板顶出来抗强度；没有这个强度确认，就不能把分歧当成无脑低吸点。</p></article>
        </div>
        <div class="quote" style="margin-top:14px">核心结论：买的时候越买越高才买，买进之后有利润才继续买；卖的时候越卖越低才卖，卖出之后有下跌才继续卖。没有利润就不要再买，没有下跌就不要再卖。做错的唯一解法，就是停止继续犯错。</div>
      </section>

      <section class="panel" id="daily">
        <div class="section-head"><div><h2>逐日操作&情绪复盘</h2><p>按前几周周度模板重做：每日内容从 daily-trading-review 对应日期页面摘取，拆成主线与情绪、操作&情绪复盘、个人反思、次日关注四块，并保留每日原文链接。</p></div><span class="chip">每日A股复盘引入</span></div>
        <div class="day-list">${renderDailyCards()}</div>
      </section>

      <section class="panel" id="stocks">
        <h2>重点走势图</h2>
        <p class="section-note">用 5 分钟线标出本周所有实际买卖过的股票。图是为了直观看买卖点和前后走势，不替代成交单。</p>
        <div class="stock-grid">${renderStockCards(trends)}</div>
      </section>

      <section class="panel" id="rules">
        <div class="section-head"><div><h2>本周沉淀规则</h2><p>根据正式二次复盘沉淀执行准则，重点约束企稳买点、价格阻力方向、金字塔加减仓和强回流次日确认。</p></div><span class="chip">正式规则</span></div>
        <div class="rules">
          <article class="rule"><h3>企稳后再买</h3><p>不要求买在最低点；只在最低点回升、拉升后有量企稳时买。没有企稳确认，ETF 跌到位置也不能重仓接。</p></article>
          <article class="rule"><h3>破位不摊平</h3><p>-2%、-3% 还能视作正常分歧；若继续杀到 -5%、-6% 才停止，就按破位处理，停止低吸和补仓。</p></article>
          <article class="rule"><h3>先判阻力方向</h3><p>每次交易前先判断压力、支撑和价格阻力最小方向。前高双头、抛压重、趋势线未形成时，不急着做T接回。</p></article>
          <article class="rule"><h3>金字塔买卖</h3><p>买的时候越买越高才买，买进之后有利润才继续买；卖的时候越卖越低才卖，卖出之后有下跌才继续卖。</p></article>
          <article class="rule"><h3>做错就停手</h3><p>没有利润就不要再买，没有下跌就不要再卖。做错的唯一解法不是加仓修正，而是停止继续犯错。</p></article>
          <article class="rule"><h3>二板抗强度</h3><p>强回流启动或二次启动后的第二天分歧，必须有一字二板顶出来抗强度；没有强度确认，就不把分歧当买点。</p></article>
        </div>
      </section>

      <section class="panel" id="summary-table">
        <div class="section-head"><div><h2>标的闭环汇总</h2><p>只在买卖数量、历史成本和价格口径都能支持时计算可见闭环盈亏；159516 暂不硬算。</p></div></div>
        <div class="table-wrap"><table><thead><tr><th>代码</th><th>名称</th><th>角色</th><th>买入数量</th><th>卖出数量</th><th>买入现金</th><th>卖出现金</th><th>可见盈亏</th></tr></thead><tbody>${renderGroupRows()}</tbody></table></div>
      </section>

      <section class="panel" id="trades">
        <div class="section-head"><div><h2>逐笔交割明细</h2><p>已去掉合同编号、成交编号等隐私字段，只保留复盘需要的交易信息。</p></div></div>
        <div class="table-wrap"><table><thead><tr><th>成交日期</th><th>成交时间</th><th>代码</th><th>名称</th><th>操作</th><th>数量</th><th>均价</th><th>金额</th><th>手续费</th><th>印花税</th><th>发生金额</th><th>资金余额</th></tr></thead><tbody>${renderTradeTable()}</tbody></table></div>
      </section>

      <section class="panel missing" id="todo">
        <div class="section-head"><div><h2>后续待补材料</h2><p>你后面补这些，我就能把草稿版升级成正式版。</p></div><span class="chip">待补 ${missingItems.length} 项</span></div>
        <ul>${renderMissingItems()}</ul>
      </section>
    </div>
  </main>
</body>
</html>`;
}

function renderHubChart() {
  const width = 1080;
  const height = 430;
  const left = 90;
  const right = 92;
  const top = 56;
  const bottom = 92;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const amountMin = -5000;
  const amountMax = 2000;
  const ddMin = -50;
  const ddMax = 10;
  const x = (i) => left + (i / (hubWeeks.length - 1)) * plotW;
  const yAmount = (value) => top + ((amountMax - value) / (amountMax - amountMin)) * plotH;
  const yPct = (value) => top + ((ddMax - value) / (ddMax - ddMin)) * plotH;
  const amountPoints = hubWeeks.map((item, i) => ({ x: x(i), y: yAmount(item.pnl), item }));
  const ddPoints = hubWeeks.map((item, i) => ({ x: x(i), y: yPct(item.drawdown), item }));
  const weekPctPoints = hubWeeks.map((item, i) => ({ x: x(i), y: yPct(item.weekPct), item }));
  const pathLine = (points) => points.map((point, i) => `${i ? "L" : "M"} ${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const amountTicks = [2000, 0, -2500, -5000];
  const pctTicks = [10, 0, -10, -20, -30, -40, -50];
  const grid = amountTicks.map((tick) => {
    const y = yAmount(tick);
    return `<g><line x1="${left}" x2="${width - right}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(28,37,48,.10)" stroke-dasharray="4 7"></line><text x="${left - 12}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="axis-label">${money(tick)}</text></g>`;
  }).join("");
  const rightAxis = pctTicks.map((tick) => `<text x="${width - right + 12}" y="${(yPct(tick) + 4).toFixed(1)}" class="axis-label">${pct(tick)}</text>`).join("");
  const xLabels = hubWeeks.map((item, i) => {
    const xx = x(i);
    return `<g><line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${top}" y2="${height - bottom}" stroke="rgba(28,37,48,.08)"></line><text x="${xx.toFixed(1)}" y="${height - 34}" text-anchor="middle" class="axis-label">${item.label}</text></g>`;
  }).join("");
  const dots = (points, type) => points.map((point) => {
    const item = point.item;
    const value = type === "amount" ? item.pnl : type === "drawdown" ? item.drawdown : item.weekPct;
    const label = type === "amount" ? money(value) : pct(value);
    const cls = type === "amount" ? (value >= 0 ? "amount-positive" : "amount-negative") : type === "drawdown" ? "drawdown" : (value >= 0 ? "pct-positive" : "pct-negative");
    return `<a href="${item.href}"><g class="${cls}"><title>${item.label} ${label}</title><circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${type === "amount" ? 5.5 : 4.5}"></circle></g></a>`;
  }).join("");
  const labels = amountPoints.map((point) => {
    const y = Math.max(top + 12, Math.min(height - bottom - 8, point.y + (point.item.pnl > 0 ? 23 : -14)));
    return `<text x="${point.x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" class="value-label amount-label">${money(point.item.pnl)}</text>`;
  }).join("") + ddPoints.map((point) => {
    const y = Math.max(top + 12, Math.min(height - bottom - 8, point.y + 19));
    return `<text x="${point.x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" class="value-label drawdown-label">累${pct(point.item.drawdown)}</text>`;
  }).join("") + weekPctPoints.map((point) => {
    const y = Math.max(top + 12, Math.min(height - bottom - 8, point.y - 14));
    const cls = point.item.weekPct >= 0 ? "pct-positive-label" : "pct-negative-label";
    return `<text x="${point.x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" class="value-label ${cls}">${pct(point.item.weekPct)}</text>`;
  }).join("");
  return `<div class="chart-wrap"><svg class="weekly-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="每周资金曲线">${grid}${rightAxis}${xLabels}<line x1="${left}" x2="${width - right}" y1="${yAmount(0).toFixed(1)}" y2="${yAmount(0).toFixed(1)}" stroke="rgba(28,37,48,.28)"></line><path d="${pathLine(amountPoints)}" fill="none" stroke="#c2412d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path><path d="${pathLine(ddPoints)}" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 7"></path><path d="${pathLine(weekPctPoints)}" fill="none" stroke="#d97706" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 7"></path>${dots(amountPoints, "amount")}${dots(ddPoints, "drawdown")}${dots(weekPctPoints, "weekPct")}${labels}<text x="${left}" y="${top - 24}" class="axis-label">金额变化（元）</text><text x="${width - right}" y="${top - 24}" text-anchor="end" class="axis-label">百分比轴：累计回撤 / 当周涨跌</text></svg></div>`;
}

function renderHubRows() {
  return hubWeeks.map((item) => `<tr>
    <td><a href="${item.href}">${item.label}</a></td>
    <td class="${classByValue(item.pnl)}">${money(item.pnl)}</td>
    <td class="${item.weekPct >= 0 ? "pct-positive-text" : "pct-negative-text"}">${pct(item.weekPct)}</td>
    <td>${item.avgPosition.toFixed(2)}%</td>
    <td>${item.displayEquity || rawMoney(item.equity)}</td>
    <td class="${item.drawdown >= 0 ? "pct-positive-text" : "pct-negative-text"}">${pct(item.drawdown)}</td>
    <td class="pct-positive-text">${item.bestDay}</td>
    <td class="pct-negative-text">${item.worstDay}</td>
  </tr>`).join("");
}

function renderLatestDailyPanel() {
  const dayCards = accountDays.map((day) => {
    const tone = day.pnl >= 0 ? "profit" : "loss";
    return `<article class="latest-day ${tone}">
      <div class="latest-day-head"><span>${day.weekday}</span><b>${day.date.slice(5).replace("/", "-")}</b></div>
      <strong>${pct(day.returnRate)}</strong>
      <p class="${classByValue(day.pnl)}">${money(day.pnl)} 元</p>
      <div class="pos-track"><i style="width:${Math.max(0, Math.min(100, day.position)).toFixed(2)}%"></i></div>
      <small>仓位 ${day.position.toFixed(2)}% · 权益 ${rawMoney(day.equity)}</small>
    </article>`;
  }).join("");
  return `<section class="panel latest-panel">
    <div class="chart-head">
      <div><h2>最新周日度面板</h2><p>直接看 07.06-07.10 每天的盈亏百分比、收益金额和持仓比例；本周节奏是周二空仓、周三试错、周四三冰反核、周五预案失效。</p></div>
      <span class="chip">日度账户已补</span>
    </div>
    <div class="latest-summary">
      <span>周账户 <b class="${classByValue(accountPnl)}">${money(accountPnl)}</b></span>
      <span>日收益率合计 <b class="${classByValue(accountReturnSum)}">${pct(accountReturnSum)}</b></span>
      <span>平均仓位 <b>${avgPosition.toFixed(2)}%</b></span>
      <span>最亏日 <b class="is-loss">${worstAccountDay.weekday} ${pct(worstAccountDay.returnRate)}</b></span>
    </div>
    <div class="day-strip">${dayCards}</div>
    <a class="week-card latest-link" href="../2026-07-06_2026-07-10/">
      <div class="week-head"><div><h3>进入 2026.07.06 - 2026.07.10 复盘</h3><p>查看交割明细、每日复盘、买卖点图和本周待补材料。最新版本已加入日度收益/仓位图和 5 分钟线买卖点图。</p></div><span class="chip">草稿版</span></div>
    </a>
  </section>`;
}

function renderArchiveCards() {
  const latest = {
    title: "2026.07.06 - 2026.07.10",
    href: "../2026-07-06_2026-07-10/",
    text: "三冰反核做对，周五商业航天虹吸后科技低吸预案失效；159516 和 588170 期末持仓待截图校准。",
    tags: [trades.length + " 笔", money(accountPnl), "草稿版"],
    status: "草稿版",
  };
  const previous = [...hubWeeks].reverse().filter((item) => item.label !== "07.06-07.10").map((item) => ({
    title: item.title,
    href: item.href,
    text: item.label === "06.29-07.04" ? "半导体/芯片 ETF 篮子试错后撤退，海南海药小幅闭环，周五转入科创新材ETF。" : item.label === "06.22-06.26*" ? "诺德止损后切入海欣/大唐，再回到芯片通信强线，期末持有亨通光电与亨通股份并按收盘价暂估浮亏。" : item.label === "06.15-06.20" ? "连板高度切到机构趋势核心，诺德股份为期末持仓。" : "历史周度交割复盘归档。",
    tags: [item.trades, money(item.pnl), item.status],
    status: item.status,
  }));
  return [latest, ...previous].map((item) => `<a class="week-card" href="${item.href}"><div class="week-head"><div><h3>${item.title}</h3><p>${item.text}</p></div><span class="chip">${item.status}</span></div><div class="mini-grid">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div></a>`).join("");
}

function renderWeeklyHub() {
  const cumulative = hubWeeks.reduce((total, item) => total + item.pnl, 0);
  const best = hubWeeks.reduce((a, b) => b.pnl > a.pnl ? b : a, hubWeeks[0]);
  const worst = hubWeeks.reduce((a, b) => b.pnl < a.pnl ? b : a, hubWeeks[0]);
  const latest = hubWeeks.at(-1);
  const maxDrawdown = hubWeeks.reduce((min, item) => Math.min(min, item.drawdown), 0);
  return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>周度交割复盘</title>${hubStyle()}</head>
<body><main class="hub-shell">
  <section class="hero"><div><span class="label">Weekly Trading Review</span><h1>周度交割复盘</h1><p>这里专门承载每周交割复盘：每一周一个独立页面，记录交割单、账户收益、买卖点图、逐日复盘和当周新增交易纪律。</p><div class="button-row"><a class="button" href="../2026-07-06_2026-07-10/">进入最新周复盘</a><a class="button secondary" href="../index.html">返回总首页</a></div></div><div class="metrics">${renderMetric("周报数量", "10", "已归档周数")}${renderMetric("最新区间", "07.06", "至 07.10")}${renderMetric("最新账户", money(accountPnl), `期末 ${rawMoney(endingEquity)} / 仓位 ${endingPosition.toFixed(2)}%`, classByValue(accountPnl))}${renderMetric("最新规则", "三冰反核", "ETF低吸必须有失效线")}</div></section>
  <section class="loss-banner"><h2>亏损源头</h2><div class="loss-grid"><article><b>1. 分歧接面</b><p>刚分歧不要那么快进去，先等承接和方向确认。</p></article><article><b>2. 主升空仓</b><p>主升期要贪婪重仓，核心龙头出现时不能缩在场外。</p></article><article><b>3. 冰点割肉</b><p>冰点还割肉，次日修复没先手，直接亏上加亏。</p></article><article><b>4. 退潮追涨</b><p>退潮期追涨，没等进入混沌就大出手，这就容易死。</p></article></div></section>
  <section class="panel cycle-motto"><span class="label">Cycle Motto</span><h2>周期格言</h2><div class="motto-grid"><article><h3>冰点割肉</h3><p>冰点是连续的大分歧：二冰反核，三冰反核（70%），四冰反核（100%）。</p></article><article><h3>高潮追高</h3><p>高潮是连续的强回流：二高砸盘，三高砸盘（成功率70%），四高砸盘（接近100%）。</p></article></div></section>
  <section class="panel overview-panel"><div class="chart-head"><div><h2>每周资金曲线</h2><p>左轴看每周账户金额变化；右轴同时看累计回撤和当周涨跌/回撤。06.22-06.26 带 * 为暂估市值口径；07.06-07.10 已按期末权益变化入曲线，7/6 日收益金额和期末持仓待补校准。</p></div><div class="legend-row"><span><i class="legend amount"></i>金额变化</span><span><i class="legend drawdown"></i>累计回撤</span><span><i class="legend weekly"></i>当周涨跌/回撤</span></div></div>${renderHubChart()}<div class="table-wrap"><table><thead><tr><th>周区间</th><th>金额变化</th><th>当周涨跌/回撤</th><th>平均周仓位</th><th>期末权益</th><th>累计回撤</th><th>最赚日</th><th>最亏日</th></tr></thead><tbody>${renderHubRows()}</tbody></table></div><div class="summary-grid"><span>累计变化 <b class="${classByValue(cumulative)}">${money(cumulative)}</b></span><span>最大单周盈利 <b>${best.label} ${money(best.pnl)}</b></span><span>最大单周亏损 <b>${worst.label} ${money(worst.pnl)}</b></span><span>最新已入曲线 <b>${pct(latest.weekPct)}</b></span><span>最新累计回撤 <b>${pct(latest.drawdown)}</b></span><span>最大累计回撤 <b>${pct(maxDrawdown)}</b></span></div></section>
  ${renderLatestDailyPanel()}
  <section class="panel"><h2>周度归档</h2><div class="archive">${renderArchiveCards()}</div></section>
  <section class="panel"><h2>周度高频规则</h2><div class="rules"><article><h3>只做最强</h3><p>有最强做最强，无最强再选次强；后排杂毛和非主线左侧试错要从源头放弃。</p></article><article><h3>三板强弱纪律</h3><p>第三板若是弱板就减半仓；若是强势板或一字板就不用机械减半，总是见机行事。</p></article><article><h3>中高位唯一性</h3><p>连板如果不是唯一最高辨识度，中高位/爆量都容易死掉。</p></article><article><h3>ETF主题仓位</h3><p>同一主题多个 ETF 同时买，本质是一笔主题仓位，不是分散仓位。</p></article></div></section>
</main></body></html>`;
}

function hubStyle() {
  return `<style>
    :root{--ink:#1c2530;--muted:#667085;--line:#dfe4ea;--accent:#c2412d;--accent-soft:#fff1ed;--red:#c2412d;--green:#14845f;--blue:#1d4ed8;--amber:#d97706;--danger:#a11822;--shadow:0 18px 44px rgba(28,37,48,.08);--radius:12px}
    *{box-sizing:border-box}body{margin:0;color:var(--ink);background:linear-gradient(180deg,#f7f8fa 0%,#eef2f5 100%);font-family:"Avenir Next","PingFang SC","Noto Sans SC","Microsoft YaHei",Arial,sans-serif}.hub-shell{width:min(1180px,calc(100vw - 28px));margin:0 auto;padding:34px 0 52px;display:grid;gap:20px}.hero,.panel,.metric,.week-card,.loss-banner{background:rgba(255,255,255,.95);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.hero{padding:30px;display:grid;grid-template-columns:1.12fr .88fr;gap:26px;align-items:end}.label{display:inline-flex;width:max-content;color:var(--accent);background:var(--accent-soft);padding:7px 10px;border-radius:999px;font-size:12px;font-weight:800}h1{margin:14px 0 12px;font-size:clamp(40px,5vw,70px);line-height:1.04}h2,h3,p{margin-top:0;letter-spacing:0}p,li{color:var(--muted);line-height:1.72}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.metric{padding:16px;min-height:104px;display:grid;align-content:space-between}.metric span,.metric small{color:var(--muted);font-size:12px}.metric strong{font-size:23px}.panel{padding:24px}.button-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border-radius:8px;background:var(--ink);color:#fff;text-decoration:none;font-weight:800}.button.secondary{background:#fff;color:var(--ink);border:1px solid var(--line)}.loss-banner{padding:26px;border:2px solid rgba(161,24,34,.22);background:linear-gradient(135deg,#fff1f0 0%,#fff 62%)}.loss-grid,.motto-grid,.rules{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.loss-grid article,.motto-grid article,.rules article{background:#fff;border:1px solid rgba(161,24,34,.14);border-radius:10px;padding:16px}.motto-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.motto-grid p{font-size:18px;font-weight:800;color:var(--ink)}.overview-panel{display:grid;gap:18px}.chart-head{display:flex;justify-content:space-between;gap:18px}.legend-row{display:flex;gap:12px;flex-wrap:wrap;color:var(--muted);font-size:13px}.legend{width:28px;height:0;border-top:3px solid var(--red);display:inline-block;margin-right:6px}.legend.drawdown{border-top-color:var(--blue);border-top-style:dashed}.legend.weekly{border-top-color:var(--amber);border-top-style:dotted}.chart-wrap,.table-wrap{width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff}.weekly-chart{display:block;width:100%;min-width:960px;height:auto}.axis-label{fill:var(--muted);font-size:12px}.value-label{font-size:11px;font-weight:900;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}.amount-label{fill:var(--red)}.drawdown-label{fill:var(--blue)}.pct-positive-label{fill:var(--red)}.pct-negative-label{fill:var(--green)}.amount-positive circle{fill:var(--red);stroke:#fff;stroke-width:2}.amount-negative circle{fill:var(--green);stroke:#fff;stroke-width:2}.drawdown circle{fill:var(--blue);stroke:#fff;stroke-width:2}.pct-positive circle{fill:var(--red);stroke:#fff;stroke-width:2}.pct-negative circle{fill:var(--green);stroke:#fff;stroke-width:2}table{width:100%;border-collapse:collapse;min-width:1060px;font-size:13px}th,td{padding:12px 14px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}th{background:#f8fafc;color:var(--muted)}a{color:inherit}.is-profit,.pct-positive-text{color:var(--red)}.is-loss,.pct-negative-text{color:var(--green)}.summary-grid,.mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.summary-grid{grid-template-columns:repeat(6,minmax(0,1fr))}.summary-grid span,.mini-grid span{background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:10px;color:var(--muted);font-size:13px}.summary-grid b,.mini-grid b{display:block;color:var(--ink);margin-top:4px}.latest-panel{display:grid;gap:16px}.latest-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.latest-summary span{background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:12px;color:var(--muted);font-size:13px}.latest-summary b{display:block;color:var(--ink);font-size:18px;margin-top:4px}.day-strip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.latest-day{border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px;display:grid;gap:8px}.latest-day.loss{border-color:rgba(20,132,95,.26)}.latest-day.profit{border-color:rgba(194,65,45,.24)}.latest-day-head{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:12px;font-weight:800}.latest-day strong{font-size:26px;line-height:1;color:var(--ink)}.latest-day p{margin:0;font-weight:900}.latest-day small{color:var(--muted);font-size:12px;line-height:1.5}.pos-track{height:8px;border-radius:999px;background:#edf2f7;overflow:hidden}.pos-track i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#1d4ed8,#67a3ff)}.latest-link{box-shadow:none}.week-card{padding:20px;display:grid;gap:14px;text-decoration:none;color:inherit}.week-head{display:flex;justify-content:space-between;gap:14px}.chip{display:inline-flex;white-space:nowrap;border:1px solid var(--line);border-radius:999px;background:#f8fafc;padding:7px 10px;color:var(--muted);font-size:12px;font-weight:800}.archive{display:grid;gap:14px}.rules{grid-template-columns:repeat(4,minmax(0,1fr))}
    @media(max-width:900px){.hero,.loss-grid,.motto-grid,.rules{grid-template-columns:1fr}.metrics,.summary-grid,.mini-grid,.latest-summary{grid-template-columns:1fr}.day-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.hub-shell{width:min(100vw - 16px,1180px);padding-top:22px}.hero,.panel,.loss-banner{padding:20px}.chart-head,.week-head{display:grid}.weekly-chart{min-width:980px}}
    @media(max-width:560px){.day-strip{grid-template-columns:1fr}.latest-day strong{font-size:24px}}
  </style>`;
}

function renderRootHome() {
  return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>周度 / 月度 / 季度 / 年度交易复盘总览</title>${hubStyle()}</head>
<body><main class="hub-shell">
  <section class="loss-banner"><h1>亏损源头</h1><div class="loss-grid"><article><b>1. 分歧接面</b><p>刚分歧不要那么快进去。</p></article><article><b>2. 主升空仓</b><p>主升期要贪婪重仓。</p></article><article><b>3. 冰点割肉</b><p>冰点还割肉，次日修复没先手，直接亏上加亏。</p></article><article><b>4. 退潮追涨</b><p>退潮期追涨，没等进入混沌就大出手，这就容易死。</p></article></div></section>
  <section class="hero"><div><span class="label">weekly-monthly-quarterly-yearly-trading-review</span><h1>周度 / 月度 / 季度 / 年度交易复盘</h1><p>这里是总入口：周度单独成页；月度和季度放在同一个复盘主页；年度复盘单独沉淀交易体系。</p><div class="button-row"><a class="button" href="./weekly-trading-review/">周度主页</a><a class="button secondary" href="./monthly-quarterly-trading-review/">月度 / 季度主页</a><a class="button secondary" href="./yearly-trading-review/">年度主页</a></div></div><div class="metrics">${renderMetric("周度归档", "10", "已发布/草稿周复盘")}${renderMetric("最新区间", "07.06", "至 07.10")}${renderMetric("最新账户", money(accountPnl), `期末 ${rawMoney(endingEquity)}`, classByValue(accountPnl))}${renderMetric("长期结构", "3 个主页", "周度 / 月季 / 年度")}</div></section>
  <section class="panel"><h2>复盘主页</h2><div class="loss-grid"><a class="week-card" href="./weekly-trading-review/"><div class="week-head"><h3>周度交割复盘</h3><span class="chip">主页 1</span></div><p>每周一个独立复盘页面，记录交割单、买卖点、账户变化、KISS 复盘和周度规则。</p><div class="mini-grid"><span>周报 <b>10 篇</b></span><span>最新 <b>07.06-07.10</b></span><span>状态 <b>草稿版</b></span></div></a><a class="week-card" href="./monthly-quarterly-trading-review/"><div class="week-head"><h3>月度 / 季度复盘</h3><span class="chip">主页 2</span></div><p>月度承接周度结果，季度检查模式和仓位是否真正改善账户曲线。</p><div class="mini-grid"><span>月度 <b>1-12 月</b></span><span>季度 <b>Q1-Q4</b></span><span>状态 <b>框架版</b></span></div></a><a class="week-card" href="./yearly-trading-review/"><div class="week-head"><h3>年度交易复盘</h3><span class="chip">主页 3</span></div><p>年度层面聚焦账户画像、模式进化、仓位风控、心理纪律和下一年执行准则。</p><div class="mini-grid"><span>年度 <b>自然年</b></span><span>核心 <b>体系沉淀</b></span><span>状态 <b>框架版</b></span></div></a></div></section>
</main></body></html>`;
}

async function main() {
  const trends = {};
  for (const code of Object.keys(secids)) {
    trends[code] = await fetchTrend(code);
  }

  fs.mkdirSync(weekDir, { recursive: true });
  fs.writeFileSync(path.join(weekDir, "index.html"), renderWeekPage(trends), "utf8");
  fs.writeFileSync(path.join(repo, "weekly-trading-review", "index.html"), renderWeeklyHub(), "utf8");
  fs.writeFileSync(path.join(repo, "index.html"), renderRootHome(), "utf8");

  console.log(`Wrote ${path.relative(repo, path.join(weekDir, "index.html"))}`);
  console.log(`Wrote weekly-trading-review/index.html`);
  console.log(`Wrote index.html`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
