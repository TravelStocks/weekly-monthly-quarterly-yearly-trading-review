const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..");
const weekDir = path.join(repo, "2026-06-29_2026-07-04");

const week = {
  rangeText: "2026.06.29 - 2026.07.04",
  label: "06.29-07.04",
  folder: "2026-06-29_2026-07-04",
  status: "草稿版",
  title: "半导体ETF试错回撤，周五转入科创新材",
};

const trades = [
  { date: "20260703", time: "14:56:35", code: "588010", name: "科创新材ETF博时", side: "买入", sideType: "buy", qty: 2800, price: 1.399, amount: 3917.2, fee: 5, tax: 0, net: -3922.2, balance: 11933.02, market: "上海A股" },
  { date: "20260703", time: "09:30:44", code: "000566", name: "海南海药", side: "卖出", sideType: "sell", qty: 1800, price: 6.06, amount: 10908, fee: 5, tax: 5.45, net: 10897.55, balance: 15855.22, market: "深圳A股" },
  { date: "20260702", time: "10:15:46", code: "000566", name: "海南海药", side: "买入", sideType: "buy", qty: 500, price: 6.04, amount: 3020, fee: 5, tax: 0, net: -3025, balance: 6774.67, market: "深圳A股" },
  { date: "20260702", time: "10:15:46", code: "000566", name: "海南海药", side: "买入", sideType: "buy", qty: 300, price: 6.04, amount: 1812, fee: 5, tax: 0, net: -1817, balance: 4957.67, market: "深圳A股" },
  { date: "20260702", time: "10:15:45", code: "000566", name: "海南海药", side: "买入", sideType: "buy", qty: 1000, price: 6.04, amount: 6040, fee: 5, tax: 0, net: -6045, balance: 9799.67, market: "深圳A股" },
  { date: "20260702", time: "09:32:29", code: "588710", name: "科创半导体设备ETF华泰柏瑞", side: "对方卖出", sideType: "sell", qty: 600, price: 3.99, amount: 2394, fee: 5, tax: 0, net: 2389, balance: 15844.67, market: "上海A股" },
  { date: "20260702", time: "09:32:24", code: "588890", name: "科创芯片ETF南方", side: "对方卖出", sideType: "sell", qty: 400, price: 5.056, amount: 2022.4, fee: 5, tax: 0, net: 2017.4, balance: 13455.67, market: "上海A股" },
  { date: "20260702", time: "09:32:18", code: "589260", name: "科创芯片设计ETF国泰", side: "对方卖出", sideType: "sell", qty: 1100, price: 1.639, amount: 1802.9, fee: 5, tax: 0, net: 1797.9, balance: 11438.27, market: "上海A股" },
  { date: "20260702", time: "09:32:13", code: "512760", name: "芯片ETF国泰", side: "对方卖出", sideType: "sell", qty: 1200, price: 1.447, amount: 1736.4, fee: 5, tax: 0, net: 1731.4, balance: 9640.37, market: "上海A股" },
  { date: "20260702", time: "09:32:07", code: "588170", name: "科创半导体ETF华夏", side: "对方卖出", sideType: "sell", qty: 1300, price: 3.842, amount: 4994.6, fee: 5, tax: 0, net: 4989.6, balance: 7908.97, market: "上海A股" },
  { date: "20260702", time: "09:31:15", code: "600667", name: "太极实业", side: "对方卖出", sideType: "sell", qty: 100, price: 29.08, amount: 2908, fee: 5, tax: 1.45, net: 2901.52, balance: 2919.37, market: "上海A股" },
  { date: "20260701", time: "10:46:24", code: "512760", name: "芯片ETF国泰", side: "买入", sideType: "buy", qty: 100, price: 1.595, amount: 159.5, fee: 5, tax: 0, net: -164.5, balance: 17.85, market: "上海A股" },
  { date: "20260701", time: "09:43:35", code: "600667", name: "太极实业", side: "买入", sideType: "buy", qty: 100, price: 31.88, amount: 3188, fee: 5, tax: 0, net: -3193.03, balance: 182.35, market: "上海A股" },
  { date: "20260701", time: "09:36:45", code: "588890", name: "科创芯片ETF南方", side: "买入", sideType: "buy", qty: 400, price: 5.593, amount: 2237.2, fee: 5, tax: 0, net: -2242.2, balance: 3375.38, market: "上海A股" },
  { date: "20260630", time: "14:59:05", code: "589260", name: "科创芯片设计ETF国泰", side: "买入", sideType: "buy", qty: 1100, price: 1.791, amount: 1970.1, fee: 5, tax: 0, net: -1975.1, balance: 5617.58, market: "上海A股" },
  { date: "20260630", time: "14:16:48", code: "588710", name: "科创半导体设备ETF华泰柏瑞", side: "买入", sideType: "buy", qty: 600, price: 4.209, amount: 2525.4, fee: 5, tax: 0, net: -2530.4, balance: 7592.68, market: "上海A股" },
  { date: "20260630", time: "11:20:13", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 400, price: 3.977, amount: 1590.8, fee: 5, tax: 0, net: -1595.8, balance: 10123.08, market: "上海A股" },
  { date: "20260630", time: "10:26:03", code: "588170", name: "科创半导体ETF华夏", side: "买入", sideType: "buy", qty: 900, price: 3.99, amount: 3591, fee: 5, tax: 0, net: -3596, balance: 11718.88, market: "上海A股" },
  { date: "20260630", time: "09:42:13", code: "512760", name: "芯片ETF国泰", side: "买入", sideType: "buy", qty: 1100, price: 1.528, amount: 1680.8, fee: 5, tax: 0, net: -1685.8, balance: 15314.88, market: "上海A股" },
  { date: "20260629", time: "09:59:54", code: "600487", name: "亨通光电", side: "卖出", sideType: "sell", qty: 100, price: 106.71, amount: 10671, fee: 5, tax: 5.34, net: 10660.55, balance: 17006.18, market: "上海A股" },
  { date: "20260629", time: "09:52:18", code: "600226", name: "亨通股份", side: "卖出", sideType: "sell", qty: 600, price: 10.09, amount: 6054, fee: 5, tax: 3.03, net: 6045.91, balance: 6345.63, market: "上海A股" },
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
  "000566": 10.55,
  "600667": -291.51,
  "588890": -224.8,
  "589260": -177.2,
  "588710": -141.4,
  "588170": -202.2,
  "512760": -118.9,
};
const visibleClosedLoopPnl = Object.values(closedPnL).reduce((a, b) => a + b, 0);
const chipBasketPnl = closedPnL["588890"] + closedPnL["589260"] + closedPnL["588710"] + closedPnL["588170"] + closedPnL["512760"];
const priorSellCash = trades.filter((row) => ["600487", "600226"].includes(row.code)).reduce((total, row) => total + row.net, 0);
const openPositionCost = trades.filter((row) => row.code === "588010").reduce((total, row) => total + -row.net, 0);

const accountDays = [
  { weekday: "周一", date: "2026/06/29", returnRate: -3.67, pnl: -647, position: 0, equity: 17006 },
  { weekday: "周二", date: "2026/06/30", returnRate: 1.51, pnl: 257, position: 67.4, equity: 17258 },
  { weekday: "周三", date: "2026/07/01", returnRate: -0.62, pnl: -107, position: 99.9, equity: 17145 },
  { weekday: "周四", date: "2026/07/02", returnRate: -7.5, pnl: -1284, position: 99.9, equity: 15829 },
  { weekday: "周五", date: "2026/07/03", returnRate: 0.25, pnl: 40, position: 25, equity: 15858 },
];
const accountPnl = accountDays.reduce((total, day) => total + day.pnl, 0);
const accountReturnSum = accountDays.reduce((total, day) => total + day.returnRate, 0);
const avgPosition = accountDays.reduce((total, day) => total + day.position, 0) / accountDays.length;
const endingEquity = accountDays.at(-1).equity;
const endingPosition = accountDays.at(-1).position;
const bestAccountDay = accountDays.reduce((best, day) => day.pnl > best.pnl ? day : best, accountDays[0]);
const worstAccountDay = accountDays.reduce((worst, day) => day.pnl < worst.pnl ? day : worst, accountDays[0]);
const inferredStockValue = Math.max(0, endingEquity - finalCash);

const dailySources = {
  d0629: "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.6.29%20%E5%91%A8%E4%B8%80%EF%BC%89%2B%206.30%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3.html",
  d0630: "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.6.30%20%E5%91%A8%E4%BA%8C%EF%BC%89%2B%207.1%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3.html",
  d0701: "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.7.1%20%E5%91%A8%E4%B8%89%EF%BC%89%2B%207.2%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E5%85%A8%E9%87%8F%E6%96%87%E6%A1%A3.html",
  d0702: "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.7.2%20%E5%91%A8%E5%9B%9B%EF%BC%89%2B%207.3%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3.html",
  d0703: "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.7.3%20%E5%91%A8%E4%BA%94%EF%BC%89%2B%207.6%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3%EF%BC%88%E5%85%A8%E9%87%8F%E7%89%88%EF%BC%89.html",
};

const dailyCards = [
  { day: "周一", date: "2026/06/29", title: "退潮期清仓，先把高位科技风险切掉", text: "账户亏损 -647，最终空仓。个人每日复盘的重点是：科技高位破位后止损果断，清掉亨通光电、亨通股份并等待新主线；问题是趋势启动早期介入慢，后续要么做核心中盘股，要么直接用 ETF 承接趋势。", tone: "neutral", sourceUrl: dailySources.d0629 },
  { day: "周二", date: "2026/06/30", title: "方向判断对，ETF主仓执行还可更快", text: "账户修复 +257，仓位推到 67.40%。每日复盘认为科技、芯片、半导体仍是唯一主线，用 ETF 代替看不清的中盘核心是正确进化；改进点是早盘强分歧时上仓偏慢，ETF内部也要优先选择最强指数承载品种。", tone: "good", sourceUrl: dailySources.d0630 },
  { day: "周三", date: "2026/07/01", title: "看出三高分歧，但没有把观察变成动作", text: "账户小亏 -107，仓位升到 99.90%。个人复盘确认已看到科技连续高潮、防守板块启动和一致转分歧，但 ETF 没设条件单、没在高胜率卖点兑现；核心规则是 ETF 也必须有止盈止损，三高不能幻想继续加速。", tone: "warn", sourceUrl: dailySources.d0701 },
  { day: "周四", date: "2026/07/02", title: "最亏日：趋势后手叠加三高未砸", text: "账户亏损 -1,284，仓位仍接近满仓。每日复盘把问题说得很清楚：科技不是普通分歧，而是高位补跌和趋势破位；早盘自救不能当强修复，趋势票晚进没有利润垫，三高之后必须先砸、条件单必须提前。", tone: "warn", sourceUrl: dailySources.d0702 },
  { day: "周五", date: "2026/07/03", title: "条件单保住回撤，小仓位转入科创新材试错", text: "账户小幅 +40，仓位降到 25.00%。海南海药不亏出局是正确动作，说明条件单纪律有效；尾盘科创新材ETF是两成多小仓位双冰/双兵试错，不是主线确认，下周必须按冲高兑现和弱修复不恋战处理。", tone: "good", sourceUrl: dailySources.d0703 },
];

const ticketCards = [
  {
    role: "主要亏损线",
    title: "半导体 / 芯片 ETF 篮子",
    codes: "512760 / 588170 / 588710 / 588890 / 589260",
    pnl: chipBasketPnl,
    text: "这一组是本周最清晰的可见亏损来源，合计约 -864.50。问题不在于单只 ETF 的盘口，而在于同一主题同时铺开后，本质上形成了半导体方向的集中暴露；如果板块没有走成主线，多个 ETF 会一起回撤。",
    emotion: "交易情绪上更像是主题左侧试错：看到板块可能启动，就先铺篮子。但 ETF 篮子如果没有明确退出条件，容易把“分散买”误读成“风险低”。",
    rule: "ETF 篮子必须先定义主题强弱确认和撤退条件；同主题多 ETF 只能算一笔主题仓位，不能当作分散仓位。",
  },
  {
    role: "主要亏损票",
    title: "太极实业",
    codes: "600667",
    pnl: closedPnL["600667"],
    text: "7/1 买入 100 股，7/2 早盘卖出，可见闭环约 -291.51。它和 ETF 篮子一起在 7/2 早盘撤退，说明这笔试错没有得到盘面确认。",
    emotion: "这类单票如果不是当时板块唯一核心，就不能给太多主观期待。试错失败后能够撤退是对的，但买入前需要更明确它在题材里的第一性和唯一性。",
    rule: "单票试错前先问：它是不是主题第一名，或者至少是不是唯一可交易核心；不是，就降低仓位与预期。",
  },
  {
    role: "小幅盈利闭环",
    title: "海南海药",
    codes: "000566",
    pnl: closedPnL["000566"],
    text: "7/2 买入 1800 股，7/3 早盘卖出，可见闭环约 +10.55，基本是小幅保本离场。它不是本周主要利润来源，但体现出隔日不强时及时处理。",
    emotion: "这一笔没有扩大风险，说明卖点纪律还在。后续需要结合你的每日复盘确认：它到底是计划内接力，还是临盘试错。",
    rule: "小赚保本不是问题，关键是把买入前的角色写清楚：接力套利、观察试错，还是龙头预备。",
  },
  {
    role: "期末浮动持仓",
    title: "科创新材ETF博时",
    codes: "588010",
    pnl: null,
    text: `周五尾盘买入 2800 股，含费用成本约 ${rawMoney(openPositionCost)} 元。缺少期末持仓截图和当前价，暂时不能判断浮盈浮亏。`,
    emotion: "尾盘转入新 ETF 需要下周一处理预案：如果只是主题试错，不能用龙头格局的方式持有。",
    rule: "新开 ETF 持仓必须补：次日强弱验证、最大亏损线、是否允许加仓、何时直接退出。",
  },
  {
    role: "历史持仓卖出",
    title: "亨通光电 / 亨通股份",
    codes: "600487 / 600226",
    pnl: null,
    text: `6/29 两笔卖出合计回笼现金 ${rawMoney(priorSellCash)} 元。由于缺少买入成本，本页只记录现金回笼，不计算盈亏贡献。`,
    emotion: "这两笔属于跨周持仓处理，需要上周成本才能判断卖得是否正确。",
    rule: "跨周卖出必须补历史成本，否则周度盈亏票分析会被现金流误导。",
  },
];

const missingItems = [
  "7/3 或 7/4 期末持仓截图：科创新材ETF博时的市价、盈亏、仓位占比、总资产。",
  "亨通光电、亨通股份的上周买入成本或持仓成本，用于计算真实盈亏。",
  "本周二次反思总结：主要赚钱/亏损票、错误根源、情绪偏差和下周执行规则。",
  "如果要画真实分时买卖点图，需要提供分钟线数据或允许后续接入行情数据源。",
];

const hubWeeks = [
  { label: "04.20-04.24", title: "2026.04.20 - 2026.04.24", pnl: 1616.89, equity: 31027.99, avgPosition: 94.7, bestDay: "周二 04-21 +2,117.00", worstDay: "周五 04-24 -2,413.00", href: "../2026-04-20_2026-04-24/", trades: "63 笔", status: "已发布" },
  { label: "05.08-05.16", title: "2026.05.08 - 2026.05.16", pnl: -4482.26, equity: 26545.73, avgPosition: 79.1, bestDay: "周一 05-11 +593.98", worstDay: "周四 05-14 -2,043.00", href: "../2026-05-08_2026-05-16/", trades: "37 笔", status: "已发布" },
  { label: "05.18-05.22", title: "2026.05.18 - 2026.05.22", pnl: -1553.76, equity: 24991.97, avgPosition: 53.64, bestDay: "周五 05-22 +1,680.00", worstDay: "周四 05-21 -1,779.76", href: "../2026-05-15_2026-05-22/", trades: "35 笔", status: "已发布" },
  { label: "05.25-05.29", title: "2026.05.25 - 2026.05.29", pnl: -1362.23, equity: 23629.74, avgPosition: 71.48, bestDay: "周一 05-25 +1,187.00", worstDay: "周四 05-28 -2,628.23", href: "../2026-05-25_2026-05-29/", trades: "25 笔", status: "已发布" },
  { label: "06.01-06.05", title: "2026.06.01 - 2026.06.05", pnl: -31, equity: 23598.74, avgPosition: 67.16, bestDay: "周四 06-04 +863.00", worstDay: "周三 06-03 -1,113.00", href: "../2026-06-01_2026-06-05/", trades: "11 笔", status: "已发布" },
  { label: "06.08-06.12", title: "2026.06.08 - 2026.06.12", pnl: -466, equity: 22879, avgPosition: 49.19, bestDay: "周一 06-08 +1,996.00", worstDay: "周二 06-09 -2,492.00", href: "../2026-06-08_2026-06-12/", trades: "14 笔", status: "已发布" },
  { label: "06.15-06.20", title: "2026.06.15 - 2026.06.20", pnl: -299, equity: 22567, avgPosition: 44.68, bestDay: "周四 06-18 +409.00", worstDay: "周一 06-15 -627.00", href: "../2026-06-15_2026-06-20/", trades: "16 笔", status: "草稿版" },
  { label: "06.22-06.26*", title: "2026.06.22 - 2026.06.26", pnl: -4839.42, equity: 17671.22, displayEquity: "暂估 / 市值17,671.22", avgPosition: 92.57, bestDay: "周一 06-22 -405.22", worstDay: "周五 06-26 -4,839.42", href: "../2026-06-22_2026-06-26/", trades: "8 笔", status: "草稿版" },
  { label: "06.29-07.04", title: "2026.06.29 - 2026.07.04", pnl: accountPnl, equity: endingEquity, avgPosition, bestDay: `${bestAccountDay.weekday} ${bestAccountDay.date.slice(5).replace("/", "-")} ${money(bestAccountDay.pnl)}`, worstDay: `${worstAccountDay.weekday} ${worstAccountDay.date.slice(5).replace("/", "-")} ${money(worstAccountDay.pnl)}`, href: "../2026-06-29_2026-07-04/", trades: "21 笔", status: "草稿版" },
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
  const days = ["06-29", "06-30", "07-01", "07-02", "07-03"];
  const ticks = days.map((day, i) => {
    const x = 60 + (i / (days.length - 1)) * 780;
    return `<g><line x1="${x}" x2="${x}" y1="34" y2="168" stroke="rgba(28,37,48,.10)" stroke-dasharray="4 8"></line><text x="${x}" y="198" text-anchor="middle" class="axis">${day}</text></g>`;
  }).join("");
  const markers = sorted.map((row, index) => {
    const x = timelineX(row);
    const y = 64 + (index % 4) * 24;
    const cls = row.sideType === "buy" ? "buy-dot" : "sell-dot";
    const label = row.sideType === "buy" ? "B" : "S";
    return `<g class="${cls}">
      <title>${row.name} ${row.side} ${row.qty}股 @ ${row.price} · ${formatDate(row.date)} ${row.time}</title>
      <line x1="${x}" x2="${x}" y1="${y + 8}" y2="166" stroke="currentColor" stroke-width="1" stroke-opacity=".35"></line>
      <circle cx="${x}" cy="${y}" r="8"></circle>
      <text x="${x}" y="${y + 4}" text-anchor="middle">${label}</text>
      <text x="${x}" y="${Math.max(18, y - 12)}" text-anchor="middle" class="marker-label">${row.code}</text>
    </g>`;
  }).join("");
  return `<article class="trade-map">
    <div class="trade-map-head"><div><h3>${title}</h3><p>${subtitle}</p></div><span class="chip">${summary}</span></div>
    <div class="trade-chart-wrap"><svg class="trade-chart" viewBox="0 0 900 220" role="img" aria-label="${title} 买卖点时间轴">
      <rect x="0" y="0" width="900" height="220" rx="12" fill="#fff"></rect>
      <line x1="60" x2="840" y1="166" y2="166" stroke="rgba(28,37,48,.20)"></line>
      ${ticks}${markers}
      <text x="60" y="24" class="axis">成交时间轴：红 B 买入 / 蓝 S 卖出</text>
    </svg></div>
    <p class="caption">${note}</p>
  </article>`;
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
    return `<article class="daily-card ${card.tone}">
    <span>${card.day} · ${card.date}</span>
    <h3>${card.title}</h3>
    ${account ? `<div class="daily-account"><b class="${classByValue(account.pnl)}">${money(account.pnl)}</b><span class="${classByValue(account.returnRate)}">${pct(account.returnRate)}</span><span>仓位 ${account.position.toFixed(2)}%</span></div>` : ""}
    <p>${card.text}</p>
    <a class="source-link" href="${card.sourceUrl}" target="_blank" rel="noreferrer">个人每日复盘来源</a>
  </article>`;
  }).join("");
}

function renderMissingItems() {
  return missingItems.map((item) => `<li>${item}</li>`).join("");
}

function renderWeekPage() {
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
    .page{display:grid;gap:18px}.hero,.panel,.metric,.ticket-card,.daily-card,.trade-map{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.hero{padding:26px;display:grid;grid-template-columns:1.15fr .85fr;gap:22px;align-items:end}.label{display:inline-flex;width:max-content;max-width:100%;padding:7px 10px;border-radius:999px;background:var(--accent-soft);color:var(--accent);font-size:12px;font-weight:800}.hero h1{margin:14px 0 12px;font-size:clamp(34px,5vw,66px);line-height:1.04;letter-spacing:0}.hero p,.panel p,.daily-card p,.ticket-card p,.caption,li{color:var(--muted);line-height:1.72}.hero-side,.metric-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.metric{padding:16px;display:grid;gap:8px;min-height:104px}.metric span,.metric small{color:var(--muted);font-size:12px}.metric strong{font-size:24px}.panel{padding:24px}.panel h2{margin:0 0 12px;font-size:24px}.section-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:16px}.section-head p{margin:6px 0 0}.chip{display:inline-flex;align-items:center;white-space:nowrap;border:1px solid var(--line);border-radius:999px;padding:7px 10px;background:#f8fafc;color:var(--muted);font-size:12px;font-weight:800}.grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.info-card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:16px}.info-card h3{margin:0 0 8px;font-size:18px}.is-profit,.buy-text{color:var(--red)}.is-loss,.sell-text{color:var(--green)}.warn{color:var(--amber)}
    .source-strip{display:grid;grid-template-columns:1.1fr .9fr;gap:14px}.quote{border-left:4px solid var(--accent);padding:12px 14px;background:#fff7ed;border-radius:0 10px 10px 0;color:var(--ink);font-weight:700}.ticket-list,.daily-grid,.trade-map-grid{display:grid;gap:14px}.ticket-head,.trade-map-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.ticket-head h3,.trade-map h3{font-size:21px;margin:8px 0 4px}.ticket-head strong{font-size:24px}.note-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.note-grid p{background:#f8fafc;border:1px solid var(--line);border-radius:10px;margin:0;padding:12px}.note-grid b{display:block;color:var(--ink);margin-bottom:4px}.daily-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.daily-card{padding:16px}.daily-card span{font-size:12px;color:var(--muted);font-weight:800}.daily-card h3{font-size:17px;margin:8px 0}.daily-account{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.daily-account b,.daily-account span{display:inline-flex;align-items:center;min-height:26px;padding:4px 8px;border-radius:999px;background:#f8fafc;border:1px solid var(--line);font-size:12px}.source-link{display:inline-flex;margin-top:8px;color:var(--blue);font-size:12px;font-weight:800;text-decoration:none}.source-link:hover{text-decoration:underline}.account-table{margin-top:14px}.daily-card.good{border-color:rgba(20,132,95,.28)}.daily-card.warn{border-color:rgba(183,99,5,.28)}.trade-map{padding:16px}.trade-chart-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff}.trade-chart{display:block;width:100%;min-width:780px;height:auto}.axis{font-size:12px;fill:var(--muted)}.buy-dot{color:var(--red);fill:var(--red)}.sell-dot{color:var(--blue);fill:var(--blue)}.buy-dot text,.sell-dot text{fill:#fff;font-size:10px;font-weight:900}.marker-label{fill:var(--ink)!important;stroke:#fff;stroke-width:4px;paint-order:stroke;font-size:10px;font-weight:800}.caption{font-size:13px;margin:10px 0 0}
    .table-wrap{overflow:auto;border:1px solid var(--line);border-radius:10px;background:#fff}table{width:100%;border-collapse:collapse;min-width:980px;font-size:13px}th,td{padding:10px 12px;border-bottom:1px solid var(--line);white-space:nowrap;text-align:right}th:first-child,td:first-child,th:nth-child(2),td:nth-child(2),th:nth-child(3),td:nth-child(3),th:nth-child(4),td:nth-child(4){text-align:left}th{background:#f8fafc;color:var(--muted);font-weight:800}tr:last-child td{border-bottom:0}.rules{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.rule{border:1px solid var(--line);border-radius:10px;background:#fff;padding:16px}.rule h3{margin:0 0 8px}.missing{border:2px solid rgba(183,99,5,.24);background:linear-gradient(135deg,#fff7ed 0%,#fff 65%)}.missing ul{margin:8px 0 0;padding-left:20px}
    @media(max-width:1100px){.shell{grid-template-columns:minmax(0,1fr);overflow-x:hidden}.page,.hero,.panel,.metric,.ticket-card,.daily-card,.trade-map,.source-strip,.grid-2,.grid-3,.daily-grid,.rules,.note-grid{min-width:0;max-width:100%}.page{width:100%;overflow-x:hidden}.panel{overflow-x:hidden}.side{position:sticky;top:0;z-index:10;width:100%;max-width:100%;min-width:0;display:flex;overflow-x:auto;border-radius:0 0 var(--radius) var(--radius)}.side h2{display:none}.side a{flex:0 0 auto}.hero,.source-strip,.grid-2{grid-template-columns:minmax(0,1fr)}.daily-grid,.rules,.grid-3{grid-template-columns:repeat(2,minmax(0,1fr))}.note-grid{grid-template-columns:minmax(0,1fr)}}
    @media(max-width:720px){html,body{overflow-x:hidden}.shell{width:min(100vw - 14px,1480px);padding-top:0}.hero,.panel{padding:18px}.hero-side,.metric-grid,.daily-grid,.rules,.grid-3{grid-template-columns:minmax(0,1fr)}.hero h1{font-size:32px}.section-head,.ticket-head,.trade-map-head{display:grid}}
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
          <p>本页已把交割单、你补充的每日账户数据和个人每日复盘摘要合并成第一版；期末持仓市价、跨周成本和二次反思等你后面补齐后再升级成正式版。</p>
        </div>
        <div class="hero-side">
          ${renderMetric("可见闭环盈亏", money(visibleClosedLoopPnl), "不含跨周持仓卖出，不含期末浮动", classByValue(visibleClosedLoopPnl))}
          ${renderMetric("成交笔数", `${trades.length} 笔`, `${buyRows.length} 买 / ${sellRows.length} 卖`)}
          ${renderMetric("期末可见持仓", "科创新材ETF", "588010 · 2800 股，市价待补")}
          ${renderMetric("账户口径", money(accountPnl), `日收益率合计 ${pct(accountReturnSum)}`, classByValue(accountPnl))}
        </div>
      </section>

      <section class="panel" id="source">
        <div class="section-head"><div><h2>数据口径</h2><p>本周交割单范围为 2026/6/29 - 2026/7/3，截图筛选结束日为 2026/7/4。合同号、成交编号等隐私字段已隐藏，不进入网页。</p></div><span class="chip">截图转录 · 待复核</span></div>
        <div class="source-strip">
          <div class="grid-3">
            ${renderMetric("总成交额", rawMoney(turnover), "成交金额合计")}
            ${renderMetric("费用税费", rawMoney(totalCost), `手续费 ${rawMoney(fees)} / 印花税 ${rawMoney(tax)}`)}
            ${renderMetric("可见现金变动", money(netCash), `期末截图现金余额 ${rawMoney(finalCash)}`, classByValue(netCash))}
          </div>
          <div class="quote">注意：现金流不是收益。本周账户收益已按你补充的每日账户表入账；6/29 跨周卖出的亨通票仍缺历史成本，7/3 新开的科创新材ETF仍缺期末持仓市价。</div>
        </div>
      </section>

      <section class="panel" id="account">
        <div class="section-head"><div><h2>账户与持仓口径</h2><p>已按你补充的每日账户表更新，本周账户结果为 ${money(accountPnl)}，平均周仓位 ${avgPosition.toFixed(2)}%。</p></div><span class="chip">账户已补 · 持仓待补</span></div>
        <div class="grid-3">
          <article class="info-card"><h3>周账户结果</h3><p><b class="${classByValue(accountPnl)}">${money(accountPnl)} 元</b></p><p>日收益率合计 ${pct(accountReturnSum)}；最赚日 ${bestAccountDay.weekday} ${bestAccountDay.date.slice(5).replace("/", "-")} ${money(bestAccountDay.pnl)}，最亏日 ${worstAccountDay.weekday} ${worstAccountDay.date.slice(5).replace("/", "-")} ${money(worstAccountDay.pnl)}。</p></article>
          <article class="info-card"><h3>期末权益与仓位</h3><p><b>${rawMoney(endingEquity)} 元</b></p><p>期末仓位 ${endingPosition.toFixed(2)}%，平均周仓位 ${avgPosition.toFixed(2)}%。</p></article>
          <article class="info-card"><h3>资金结构</h3><p><b>现金 ${rawMoney(finalCash)} / 推算市值 ${rawMoney(inferredStockValue)}</b></p><p>期末新持仓为 588010 科创新材ETF博时 2800 股，市价和浮盈浮亏仍待截图确认。</p></article>
        </div>
        <div class="table-wrap account-table"><table><thead><tr><th>日期</th><th>星期</th><th>收益率</th><th>收益金额</th><th>仓位</th><th>当前总金额</th></tr></thead><tbody>${renderAccountRows()}</tbody></table></div>
      </section>

      <section class="panel" id="ticket-analysis">
        <div class="section-head"><div><h2>本周持有/闭环票：赚钱与亏损主因</h2><p>先按交割单可支持的事实写 Codex 草稿分析；你的二次反思补充后，我再把这里改成你的最终口径。</p></div><span class="chip">主因草稿</span></div>
        <div class="ticket-list">${renderTicketCards()}</div>
      </section>

      <section class="panel">
        <div class="section-head"><div><h2>本周整体复盘草稿</h2><p>这周的交易主线不是连板龙头，而是半导体/芯片主题 ETF 试错、单票太极实业试错、海南海药短闭环，以及周五切到科创新材ETF。</p></div><span class="chip">待二次反思覆盖</span></div>
        <div class="grid-2">
          <article class="info-card"><h3>做对的地方</h3><p>7/2 对半导体/芯片 ETF 篮子和太极实业做了集中撤退，说明当主题没有延续时，风险没有继续扩大；海南海药隔日小幅保本离场，也没有让小试错演变成大亏损。</p></article>
          <article class="info-card"><h3>需要追问的地方</h3><p>半导体 ETF 篮子铺得比较散，但方向高度同质，实际不是分散风险。后续要确认：当时买入是预案内主题试错，还是临盘看到板块异动后的分散追入。</p></article>
          <article class="info-card"><h3>账户层结论</h3><p>本周账户口径亏损 ${money(accountPnl)}，最大压力集中在 ${worstAccountDay.weekday} ${worstAccountDay.date.slice(5).replace("/", "-")}：${money(worstAccountDay.pnl)}。这一天对应科技趋势高位破位、ETF篮子撤退和满仓压力。</p></article>
          <article class="info-card"><h3>下周重点</h3><p>围绕科创新材ETF制定明确处理预案：若主题不能继续强化，按 ETF 试错处理；若主题走强，再看是否允许加仓或只做持有确认。</p></article>
        </div>
      </section>

      <section class="panel" id="daily">
        <div class="section-head"><div><h2>逐日操作复盘</h2><p>已从你的个人每日复盘站点摘取并压缩成周报口径；这里只保留操作与情绪重点，详细内容可点每张卡片的来源链接。</p></div><span class="chip">来源摘取版</span></div>
        <div class="daily-grid">${renderDailyCards()}</div>
      </section>

      <section class="panel" id="stocks">
        <div class="section-head"><div><h2>重点买卖点图</h2><p>这里先画真实成交点的时间轴。缺少分钟行情数据时，不伪造价格曲线；后续拿到分时数据后再升级为“价格曲线 + B/S 点”。</p></div><span class="chip">成交点真实 · 行情待补</span></div>
        <div class="trade-map-grid">
          ${renderTradeTimeline("半导体/芯片 ETF 篮子", "6/30-7/1 建仓，7/2 早盘集中撤退。", chipRows, `可见闭环合计 ${money(chipBasketPnl)}，是本周最明确的亏损来源。`, money(chipBasketPnl))}
          ${renderTradeTimeline("海南海药", "7/2 买入 1800 股，7/3 竞价后卖出。", hainanRows, `闭环约 ${money(closedPnL["000566"])}，本质是小幅保本。`, money(closedPnL["000566"]))}
          ${renderTradeTimeline("太极实业", "7/1 试错，7/2 早盘撤退。", taijiRows, `闭环约 ${money(closedPnL["600667"])}，需要复盘买入时是否具备题材第一性。`, money(closedPnL["600667"]))}
          ${renderTradeTimeline("科创新材ETF博时", "7/3 尾盘买入，作为期末新持仓。", openRows, "只有买点，没有卖点和期末市价；下周必须补处理预案。", "持仓待补")}
          ${renderTradeTimeline("亨通光电 / 亨通股份", "6/29 卖出跨周持仓。", priorRows, "缺上周买入成本，暂不计算盈亏。", "历史成本待补")}
        </div>
      </section>

      <section class="panel" id="rules">
        <div class="section-head"><div><h2>本周先沉淀的规则</h2><p>这是基于交割单的临时规则，等你补二次反思后再精修。</p></div></div>
        <div class="rules">
          <article class="rule"><h3>同主题 ETF 算一笔仓位</h3><p>多个半导体/芯片 ETF 同时买，不是分散风险，而是放大同一主题暴露。</p></article>
          <article class="rule"><h3>左侧试错必须有撤退线</h3><p>主题没有走出强度确认时，不能靠“再等等”消化回撤。</p></article>
          <article class="rule"><h3>跨周票要补成本</h3><p>没有历史成本，卖出现金流不能当作盈利贡献。</p></article>
          <article class="rule"><h3>新持仓要写隔日预案</h3><p>科创新材ETF下周一必须先定强弱验证、止损点和是否加仓。</p></article>
        </div>
      </section>

      <section class="panel" id="summary-table">
        <div class="section-head"><div><h2>标的闭环汇总</h2><p>只在买卖数量匹配且都发生于本周的情况下计算可见闭环盈亏。</p></div></div>
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

function renderArchiveCards() {
  const latest = {
    title: "2026.06.29 - 2026.07.04",
    href: "../2026-06-29_2026-07-04/",
    text: "半导体/芯片 ETF 篮子试错后撤退，海南海药小幅闭环，周五转入科创新材ETF。账户口径 -1,741，二次反思和期末持仓待补。",
    tags: ["21 笔", money(accountPnl), "账户已补"],
    status: "草稿版",
  };
  const previous = [...hubWeeks].reverse().filter((item) => item.label !== "06.29-07.04").map((item) => ({
    title: item.title,
    href: item.href,
    text: item.label === "06.22-06.26*" ? "诺德止损后切入海欣/大唐，再回到芯片通信强线，期末持有亨通光电与亨通股份并按收盘价暂估浮亏。" : item.label === "06.15-06.20" ? "连板高度切到机构趋势核心，诺德股份为期末持仓。" : "历史周度交割复盘归档。",
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
  <section class="hero"><div><span class="label">Weekly Trading Review</span><h1>周度交割复盘</h1><p>这里专门承载每周交割复盘：每一周一个独立页面，记录交割单、账户收益、买卖点图、逐日复盘和当周新增交易纪律。</p><div class="button-row"><a class="button" href="../2026-06-29_2026-07-04/">进入最新周复盘</a><a class="button secondary" href="../index.html">返回总首页</a></div></div><div class="metrics">${renderMetric("周报数量", "9", "已归档周数")}${renderMetric("最新区间", "06.29", "至 07.04")}${renderMetric("最新账户", money(accountPnl), `期末 ${rawMoney(endingEquity)} / 仓位 ${endingPosition.toFixed(2)}%`, classByValue(accountPnl))}${renderMetric("最新规则", "ETF篮子控险", "同主题 ETF 算一笔仓位")}</div></section>
  <section class="loss-banner"><h2>亏损源头</h2><div class="loss-grid"><article><b>1. 分歧接面</b><p>刚分歧不要那么快进去，先等承接和方向确认。</p></article><article><b>2. 主升空仓</b><p>主升期要贪婪重仓，核心龙头出现时不能缩在场外。</p></article><article><b>3. 冰点割肉</b><p>冰点还割肉，次日修复没先手，直接亏上加亏。</p></article><article><b>4. 退潮追涨</b><p>退潮期追涨，没等进入混沌就大出手，这就容易死。</p></article></div></section>
  <section class="panel cycle-motto"><span class="label">Cycle Motto</span><h2>周期格言</h2><div class="motto-grid"><article><h3>冰点割肉</h3><p>冰点是连续的大分歧：二冰反核，三冰反核（70%），四冰反核（100%）。</p></article><article><h3>高潮追高</h3><p>高潮是连续的强回流：二高砸盘，三高砸盘（成功率70%），四高砸盘（接近100%）。</p></article></div></section>
  <section class="panel overview-panel"><div class="chart-head"><div><h2>每周资金曲线</h2><p>左轴看每周账户金额变化；右轴同时看累计回撤和当周涨跌/回撤。06.22-06.26 带 * 为暂估市值口径；06.29-07.04 已按账户表入曲线，期末持仓截图待补。</p></div><div class="legend-row"><span><i class="legend amount"></i>金额变化</span><span><i class="legend drawdown"></i>累计回撤</span><span><i class="legend weekly"></i>当周涨跌/回撤</span></div></div>${renderHubChart()}<div class="table-wrap"><table><thead><tr><th>周区间</th><th>金额变化</th><th>当周涨跌/回撤</th><th>平均周仓位</th><th>期末权益</th><th>累计回撤</th><th>最赚日</th><th>最亏日</th></tr></thead><tbody>${renderHubRows()}</tbody></table></div><div class="summary-grid"><span>累计变化 <b class="${classByValue(cumulative)}">${money(cumulative)}</b></span><span>最大单周盈利 <b>${best.label} ${money(best.pnl)}</b></span><span>最大单周亏损 <b>${worst.label} ${money(worst.pnl)}</b></span><span>最新已入曲线 <b>${pct(latest.weekPct)}</b></span><span>最新累计回撤 <b>${pct(latest.drawdown)}</b></span><span>最大累计回撤 <b>${pct(maxDrawdown)}</b></span></div></section>
  <section class="panel"><h2>最新周复盘</h2><a class="week-card" href="../2026-06-29_2026-07-04/"><div class="week-head"><div><h3>2026.06.29 - 2026.07.04</h3><p>半导体/芯片 ETF 篮子试错后撤退，海南海药小幅闭环，周五转入科创新材ETF。账户 ${money(accountPnl)}，期末权益 ${rawMoney(endingEquity)}。</p></div><span class="chip">草稿版</span></div><div class="mini-grid"><span>成交 <b>21 笔</b></span><span>标的 <b>10 个</b></span><span>账户 <b class="${classByValue(accountPnl)}">${money(accountPnl)}</b></span></div></a></section>
  <section class="panel"><h2>周度归档</h2><div class="archive">${renderArchiveCards()}</div></section>
  <section class="panel"><h2>周度高频规则</h2><div class="rules"><article><h3>只做最强</h3><p>有最强做最强，无最强再选次强；后排杂毛和非主线左侧试错要从源头放弃。</p></article><article><h3>三板强弱纪律</h3><p>第三板若是弱板就减半仓；若是强势板或一字板就不用机械减半，总是见机行事。</p></article><article><h3>中高位唯一性</h3><p>连板如果不是唯一最高辨识度，中高位/爆量都容易死掉。</p></article><article><h3>ETF主题仓位</h3><p>同一主题多个 ETF 同时买，本质是一笔主题仓位，不是分散仓位。</p></article></div></section>
</main></body></html>`;
}

function hubStyle() {
  return `<style>
    :root{--ink:#1c2530;--muted:#667085;--line:#dfe4ea;--accent:#c2412d;--accent-soft:#fff1ed;--red:#c2412d;--green:#14845f;--blue:#1d4ed8;--amber:#d97706;--danger:#a11822;--shadow:0 18px 44px rgba(28,37,48,.08);--radius:12px}
    *{box-sizing:border-box}body{margin:0;color:var(--ink);background:linear-gradient(180deg,#f7f8fa 0%,#eef2f5 100%);font-family:"Avenir Next","PingFang SC","Noto Sans SC","Microsoft YaHei",Arial,sans-serif}.hub-shell{width:min(1180px,calc(100vw - 28px));margin:0 auto;padding:34px 0 52px;display:grid;gap:20px}.hero,.panel,.metric,.week-card,.loss-banner{background:rgba(255,255,255,.95);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.hero{padding:30px;display:grid;grid-template-columns:1.12fr .88fr;gap:26px;align-items:end}.label{display:inline-flex;width:max-content;color:var(--accent);background:var(--accent-soft);padding:7px 10px;border-radius:999px;font-size:12px;font-weight:800}h1{margin:14px 0 12px;font-size:clamp(40px,5vw,70px);line-height:1.04}h2,h3,p{margin-top:0;letter-spacing:0}p,li{color:var(--muted);line-height:1.72}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.metric{padding:16px;min-height:104px;display:grid;align-content:space-between}.metric span,.metric small{color:var(--muted);font-size:12px}.metric strong{font-size:23px}.panel{padding:24px}.button-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border-radius:8px;background:var(--ink);color:#fff;text-decoration:none;font-weight:800}.button.secondary{background:#fff;color:var(--ink);border:1px solid var(--line)}.loss-banner{padding:26px;border:2px solid rgba(161,24,34,.22);background:linear-gradient(135deg,#fff1f0 0%,#fff 62%)}.loss-grid,.motto-grid,.rules{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.loss-grid article,.motto-grid article,.rules article{background:#fff;border:1px solid rgba(161,24,34,.14);border-radius:10px;padding:16px}.motto-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.motto-grid p{font-size:18px;font-weight:800;color:var(--ink)}.overview-panel{display:grid;gap:18px}.chart-head{display:flex;justify-content:space-between;gap:18px}.legend-row{display:flex;gap:12px;flex-wrap:wrap;color:var(--muted);font-size:13px}.legend{width:28px;height:0;border-top:3px solid var(--red);display:inline-block;margin-right:6px}.legend.drawdown{border-top-color:var(--blue);border-top-style:dashed}.legend.weekly{border-top-color:var(--amber);border-top-style:dotted}.chart-wrap,.table-wrap{width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff}.weekly-chart{display:block;width:100%;min-width:960px;height:auto}.axis-label{fill:var(--muted);font-size:12px}.value-label{font-size:11px;font-weight:900;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}.amount-label{fill:var(--red)}.drawdown-label{fill:var(--blue)}.pct-positive-label{fill:var(--red)}.pct-negative-label{fill:var(--green)}.amount-positive circle{fill:var(--red);stroke:#fff;stroke-width:2}.amount-negative circle{fill:var(--green);stroke:#fff;stroke-width:2}.drawdown circle{fill:var(--blue);stroke:#fff;stroke-width:2}.pct-positive circle{fill:var(--red);stroke:#fff;stroke-width:2}.pct-negative circle{fill:var(--green);stroke:#fff;stroke-width:2}table{width:100%;border-collapse:collapse;min-width:1060px;font-size:13px}th,td{padding:12px 14px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}th{background:#f8fafc;color:var(--muted)}a{color:inherit}.is-profit,.pct-positive-text{color:var(--red)}.is-loss,.pct-negative-text{color:var(--green)}.summary-grid,.mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.summary-grid{grid-template-columns:repeat(6,minmax(0,1fr))}.summary-grid span,.mini-grid span{background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:10px;color:var(--muted);font-size:13px}.summary-grid b,.mini-grid b{display:block;color:var(--ink);margin-top:4px}.week-card{padding:20px;display:grid;gap:14px;text-decoration:none;color:inherit}.week-head{display:flex;justify-content:space-between;gap:14px}.chip{display:inline-flex;white-space:nowrap;border:1px solid var(--line);border-radius:999px;background:#f8fafc;padding:7px 10px;color:var(--muted);font-size:12px;font-weight:800}.archive{display:grid;gap:14px}.rules{grid-template-columns:repeat(4,minmax(0,1fr))}
    @media(max-width:900px){.hero,.loss-grid,.motto-grid,.rules{grid-template-columns:1fr}.metrics,.summary-grid,.mini-grid{grid-template-columns:1fr}.hub-shell{width:min(100vw - 16px,1180px);padding-top:22px}.hero,.panel,.loss-banner{padding:20px}.chart-head,.week-head{display:grid}.weekly-chart{min-width:980px}}
  </style>`;
}

function renderRootHome() {
  return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>周度 / 月度 / 季度 / 年度交易复盘总览</title>${hubStyle()}</head>
<body><main class="hub-shell">
  <section class="loss-banner"><h1>亏损源头</h1><div class="loss-grid"><article><b>1. 分歧接面</b><p>刚分歧不要那么快进去。</p></article><article><b>2. 主升空仓</b><p>主升期要贪婪重仓。</p></article><article><b>3. 冰点割肉</b><p>冰点还割肉，次日修复没先手，直接亏上加亏。</p></article><article><b>4. 退潮追涨</b><p>退潮期追涨，没等进入混沌就大出手，这就容易死。</p></article></div></section>
  <section class="hero"><div><span class="label">weekly-monthly-quarterly-yearly-trading-review</span><h1>周度 / 月度 / 季度 / 年度交易复盘</h1><p>这里是总入口：周度单独成页；月度和季度放在同一个复盘主页；年度复盘单独沉淀交易体系。</p><div class="button-row"><a class="button" href="./weekly-trading-review/">周度主页</a><a class="button secondary" href="./monthly-quarterly-trading-review/">月度 / 季度主页</a><a class="button secondary" href="./yearly-trading-review/">年度主页</a></div></div><div class="metrics">${renderMetric("周度归档", "9", "已发布/草稿周复盘")}${renderMetric("最新区间", "06.29", "至 07.04")}${renderMetric("最新账户", money(accountPnl), `期末 ${rawMoney(endingEquity)}`, classByValue(accountPnl))}${renderMetric("长期结构", "3 个主页", "周度 / 月季 / 年度")}</div></section>
  <section class="panel"><h2>复盘主页</h2><div class="loss-grid"><a class="week-card" href="./weekly-trading-review/"><div class="week-head"><h3>周度交割复盘</h3><span class="chip">主页 1</span></div><p>每周一个独立复盘页面，记录交割单、买卖点、账户变化、KISS 复盘和周度规则。</p><div class="mini-grid"><span>周报 <b>9 篇</b></span><span>最新 <b>06.29-07.04</b></span><span>状态 <b>草稿版</b></span></div></a><a class="week-card" href="./monthly-quarterly-trading-review/"><div class="week-head"><h3>月度 / 季度复盘</h3><span class="chip">主页 2</span></div><p>月度承接周度结果，季度检查模式和仓位是否真正改善账户曲线。</p><div class="mini-grid"><span>月度 <b>1-12 月</b></span><span>季度 <b>Q1-Q4</b></span><span>状态 <b>框架版</b></span></div></a><a class="week-card" href="./yearly-trading-review/"><div class="week-head"><h3>年度交易复盘</h3><span class="chip">主页 3</span></div><p>年度层面聚焦账户画像、模式进化、仓位风控、心理纪律和下一年执行准则。</p><div class="mini-grid"><span>年度 <b>自然年</b></span><span>核心 <b>体系沉淀</b></span><span>状态 <b>框架版</b></span></div></a></div></section>
</main></body></html>`;
}

fs.mkdirSync(weekDir, { recursive: true });
fs.writeFileSync(path.join(weekDir, "index.html"), renderWeekPage(), "utf8");
fs.writeFileSync(path.join(repo, "weekly-trading-review", "index.html"), renderWeeklyHub(), "utf8");
fs.writeFileSync(path.join(repo, "index.html"), renderRootHome(), "utf8");

console.log(`Wrote ${path.relative(repo, path.join(weekDir, "index.html"))}`);
console.log(`Wrote weekly-trading-review/index.html`);
console.log(`Wrote index.html`);
