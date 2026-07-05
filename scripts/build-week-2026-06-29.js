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
  {
    day: "周一",
    date: "2026/06/29",
    title: "退潮期清仓，先把高位科技风险切掉",
    tag: "退潮防守",
    tone: "neutral",
    action: "卖出亨通光电、亨通股份，账户 -647，期末空仓。",
    market: "每日复盘把这一天定义为高位科技退潮后的防守日：断板和连板负反馈很大，科技高位破位，创新药和半导体只是后续观察方向，不适合继续用主升思维硬扛。",
    operation: "核心动作是承认退潮并清仓等待。原文 KISS 写到“破位止损、退潮期空仓、只围绕核心，不碰杂毛”，说明这天真正做对的是没有在亏损后扩大交易范围。",
    reflection: "问题不在清仓，而在趋势启动早期上车慢，错过 ETF 级别波段；以后半导体方向如果个股选不清，优先用 588170 等 ETF 承接趋势，而不是把仓位集中在单一个股上。",
    next: "6/30 先看负反馈是否继续扩散；医药强分化后只做最强 1 进 2 小仓位接力，半导体 ETF 无强负反馈时可以小仓位波段参与。",
    sourceUrl: dailySources.d0629,
  },
  {
    day: "周二",
    date: "2026/06/30",
    title: "强情绪普涨，切换到科技 ETF 主仓",
    tag: "科技主线",
    tone: "good",
    action: "买入芯片ETF、科创半导体ETF、半导体设备ETF、芯片设计ETF，账户 +257，仓位 67.40%。",
    market: "每日复盘认为当天是强情绪普涨高潮，科技、芯片、半导体、科创半导体是主场，断板反包较多，封板质量好，但传统连板高度仍有畏高压力。",
    operation: "操作框架从“看不清中盘核心就犹豫”升级为“主仓 ETF，小仓核心个股试错”。原文明确：ETF 不是退而求其次，而是在趋势普涨、个股辨识度不够时提高仓位效率的工具。",
    reflection: "主要改进点是早盘主线强分歧时 ETF 上仓偏慢，半导体设备 ETF 进场偏晚；ETF 内部也要按四大指数强弱选择，科创新高时优先科创半导体 ETF，而不是只看行业名称。",
    next: "启动“高开做T、深水接回”和“四指数 ETF 选择法”：先比较上证、深成指、创业板、科创，再决定 ETF 品种；禁止高潮日后排个股开超市。",
    sourceUrl: dailySources.d0630,
  },
  {
    day: "周三",
    date: "2026/07/01",
    title: "判断到三高分歧，但没有知行合一",
    tag: "三高分歧",
    tone: "warn",
    action: "继续加芯片ETF/科创芯片ETF，买入太极实业，账户 -107，仓位 99.90%。",
    market: "每日复盘记录到科技、半导体、芯片连续三天高潮后已经从一致转分歧，同时保险、养殖、医药、消费、化工、证券等低位防守板块顶出来，市场进入高低切换观察期。",
    operation: "这天节奏判断是对的，但动作没有跟上。原文写得很直白：ETF 没有条件单，没有在高胜率卖点兑现；主观知道“不可能全都高潮”，行动上却没有主动减仓。",
    reflection: "最重要的规则是：ETF 也不是可以裸拿的仓位。三高以后要把盘中观察转成自动执行规则，尤其是 ETF 条件单、微型 V 型低点、三高卖点。",
    next: "所有持仓预设止盈止损条件；防守板块高潮时，主动降低进攻仓位；停止在连续高潮第三天幻想继续大幅拉升。",
    sourceUrl: dailySources.d0701,
  },
  {
    day: "周四",
    date: "2026/07/02",
    title: "科技高位补跌，满仓后手变成最亏日",
    tag: "冰点补跌",
    tone: "warn",
    action: "早盘集中卖出半导体/芯片 ETF 篮子和太极实业，买入海南海药，账户 -1,284，仓位 99.90%。",
    market: "每日复盘把这一天定性为大科技高位补跌后的冰点日：半导体设备、算力硬件、存储芯片明显杀跌，早盘资金回流只是自救，不是主动进攻；创新药/海南线成为抱团穿越观察点。",
    operation: "核心失误是科技三高未提前走，趋势后手导致亏损扩大。趋势行情要么启动早期进，要么三高砸；晚进没有利润垫，又遇到高位分歧，最终容易两头挨打。",
    reflection: "正向进化是能区分科技弱回流和主动修复，也能把海南海药作为唯一性、第一性、抗跌性更强的穿越龙头处理；但条件单必须提前，不能临盘重仓处理。",
    next: "只围绕海南海药五板超预期、创新药回流、科技冰点修复三条线验证；做对加仓龙头，做错溢价退出，没有核心就空仓。",
    sourceUrl: dailySources.d0702,
  },
  {
    day: "周五",
    date: "2026/07/03",
    title: "弱修复日，保本离场后小仓试错科创新材",
    tag: "弱修复",
    tone: "good",
    action: "卖出海南海药，尾盘买入科创新材ETF博时，账户 +40，仓位 25.00%。",
    market: "每日复盘判断这不是主升修复，而是退潮后的缩量弱修复。创新药回流弱，科技负反馈收敛但仍容易接反杀，机器人方向更强但已经高潮。",
    operation: "海南海药不亏出局，说明条件单纪律和回撤控制有效；科创新材料只用两成多小仓位，说明没有把反弹试错做成重仓博命，机器人高潮也没有追。",
    reflection: "核心要提高的是周期阶段识别：主升结束后会有弱修复、反抽、出清和新题材切换，不能把弱修复本能联想成反转，科技方向后续只按反弹出清做。",
    next: "启动强趋势 ETF 打法：机器人 ETF、航空航天 ETF、创新药 ETF 不在高潮日追，等突破后延续，再等缩量回调阴线或回踩 5/10 日线介入。",
    sourceUrl: dailySources.d0703,
  },
];

const ticketCards = [
  {
    role: "主要亏损线",
    title: "半导体 / 芯片 ETF 篮子",
    codes: "512760 / 588170 / 588710 / 588890 / 589260",
    pnl: chipBasketPnl,
    text: "这一组可见闭环亏损约 -864.50。ETF 方向本身不是错，科技趋势走出来时，用 ETF 吃板块趋势溢价比乱抓个股更稳；错在科技已经连续高潮、进入三高和退潮边缘时，没有在浮盈阶段主动砸掉。",
    emotion: "心理上把“趋势还能延续”放大成了“高位分歧也能再等”。这不是龙头格局，而是趋势节奏没有执行：三高时做大概率动作，先保护利润，再看有没有新的低吸窗口。",
    rule: "科技趋势 ETF 可以做，但必须绑定节奏：主升早期敢拿，三高/高位退潮要砸；ETF 不是无条件持有，更不是满仓后手扛退潮。",
  },
  {
    role: "主要亏损票",
    title: "太极实业",
    codes: "600667",
    pnl: closedPnL["600667"],
    text: "7/1 买入 100 股，7/2 早盘卖出，可见闭环约 -291.51。它属于科技趋势里的单票试错，不是明确的唯一核心，也不是能替代 ETF 的稳态工具。",
    emotion: "这笔亏损提醒：趋势行情里最难的是个股选择。没有连板情绪时，资金不一定集中打一个绝对龙头，趋势个股节奏更细，拿捏不好就容易买在缩容或退潮末端。",
    rule: "趋势战法不熟时，个股只能小仓试错；把握不好个股第一性，就优先做 ETF，不用趋势个股承担主仓位。",
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
    text: `周五尾盘买入 2800 股，含费用成本约 ${rawMoney(openPositionCost)} 元。它体现出这周开始接受 ETF 玩法：趋势没有连板情绪时，用 ETF 吃板块整体轮动，比赌某只中屁股更贴合稳定收益目标。`,
    emotion: "这笔是更舒服的方向，但仍然不能因为是 ETF 就放松节奏。下周一如果板块只是弱修复或反抽，仍要按试错仓处理。",
    rule: "ETF 是趋势行情里的优先工具，但必须写清强弱验证、止损线、加仓条件和退潮退出条件。",
  },
  {
    role: "趋势个股亏损根源",
    title: "亨通光电 / 亨通股份",
    codes: "600487 / 600226",
    pnl: null,
    text: `6/29 两笔卖出合计回笼现金 ${rawMoney(priorSellCash)} 元。由于缺少历史成本，本页不计算单票精确盈亏，但二次反思已明确：亏损根源是科技趋势尾段去做趋势个股，且没有从 ETF 走势里提前识别见顶。`,
    emotion: "这里的问题不是卖出现金流，而是趋势周期判断：主升一全面推进后，主升二会缩容到更硬或没涨过的方向，老题材和已被证伪方向会退潮。此时再进趋势个股，胜率很差。",
    rule: "趋势尾段不重仓中屁股；看不准个股时做 ETF。个股只小仓试错，不让单票承担趋势主仓位。",
  },
];

const missingItems = [
  "7/3 或 7/4 期末持仓截图：科创新材ETF博时的市价、盈亏、仓位占比、总资产。",
  "亨通光电、亨通股份的上周买入成本或持仓成本，用于计算真实盈亏。",
  "如需校验分钟线口径，可补券商/同花顺分时截图；当前页面已用行情接口生成 5 日分钟线买卖点。",
];

const secids = {
  "600487": "1.600487",
  "600226": "1.600226",
  "512760": "1.512760",
  "588170": "1.588170",
  "588710": "1.588710",
  "588890": "1.588890",
  "589260": "1.589260",
  "600667": "1.600667",
  "000566": "0.000566",
  "588010": "1.588010",
};

const stockDisplayNames = {
  "600487": "亨通光电",
  "600226": "亨通股份",
  "512760": "芯片ETF国泰",
  "588170": "科创半导体ETF华夏",
  "588710": "科创半导体设备ETF华泰柏瑞",
  "588890": "科创芯片ETF南方",
  "589260": "科创芯片设计ETF国泰",
  "600667": "太极实业",
  "000566": "海南海药",
  "588010": "科创新材ETF博时",
};

const stockCardOrder = ["512760", "588170", "588710", "588890", "589260", "600667", "000566", "588010", "600487", "600226"];

const stockNotes = {
  "512760": {
    headline: `芯片ETF国泰是本周半导体篮子的一部分，闭环约 ${money(closedPnL["512760"])}。`,
    bullets: ["6/30 建仓，7/1 小幅加仓，7/2 早盘随科技高位破位一起撤退。", "问题不在单只 ETF，而是同主题多 ETF 同时铺开，本质是一笔主题仓位。"],
  },
  "588170": {
    headline: `科创半导体ETF华夏是篮子中买入金额最大的 ETF，闭环约 ${money(closedPnL["588170"])}。`,
    bullets: ["6/30 分两笔买入 1300 股，7/2 早盘卖出。", "趋势普涨时 ETF 可以提高仓位效率，但三高以后必须有条件单和撤退线。"],
  },
  "588710": {
    headline: `科创半导体设备ETF华泰柏瑞闭环约 ${money(closedPnL["588710"])}。`,
    bullets: ["6/30 尾盘买入，7/2 早盘卖出。", "进场偏晚且没有等到主线延续确认，容易吃到高位分歧后的回撤。"],
  },
  "588890": {
    headline: `科创芯片ETF南方闭环约 ${money(closedPnL["588890"])}。`,
    bullets: ["7/1 早盘买入，7/2 早盘撤退。", "这笔体现的是三高后继续加仓的问题：知道分歧，却没有把判断转成减仓动作。"],
  },
  "589260": {
    headline: `科创芯片设计ETF国泰闭环约 ${money(closedPnL["589260"])}。`,
    bullets: ["6/30 尾盘买入，7/2 早盘卖出。", "同主题 ETF 篮子不能当作多笔独立机会，后续要先定义主题强弱再决定是否铺开。"],
  },
  "600667": {
    headline: `太极实业 7/1 试错、7/2 早盘撤退，闭环约 ${money(closedPnL["600667"])}。`,
    bullets: ["它不是当时最明确的唯一核心，买前需要先确认题材第一性和唯一性。", "试错失败后及时撤退是对的，但买入前的角色定义还要更硬。"],
  },
  "000566": {
    headline: `海南海药 7/2 买入、7/3 卖出，闭环约 ${money(closedPnL["000566"])}。`,
    bullets: ["这笔基本小幅保本，说明隔日不强时有及时处理。", "后续要补清它是计划内接力、穿越观察，还是临盘试错。"],
  },
  "588010": {
    headline: `科创新材ETF博时 7/3 尾盘买入 2800 股，含费成本约 ${rawMoney(openPositionCost)}。`,
    bullets: ["当前只有买点，缺期末持仓市价和浮盈亏截图。", "下周一必须先写强弱验证、止损线、是否加仓和退出条件。"],
  },
  "600487": {
    headline: `亨通光电 6/29 卖出跨周持仓，回笼现金 ${rawMoney(trades.find((row) => row.code === "600487")?.net || 0)}。`,
    bullets: ["缺上周买入成本，暂不计算真实盈亏。", "跨周卖出必须补历史成本，否则现金流会误导周度贡献判断。"],
  },
  "600226": {
    headline: `亨通股份 6/29 卖出跨周持仓，回笼现金 ${rawMoney(trades.find((row) => row.code === "600226")?.net || 0)}。`,
    bullets: ["缺上周买入成本，暂不计算真实盈亏。", "它属于跨周持仓处理，后续需要和 6/22 那周成本接上。"],
  },
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
    return `<div class="trade-map"><div class="trade-map-head"><h4>5 日分钟线买卖点</h4><div class="trade-legend"><span class="legend-item"><i class="legend-shape buy"></i>买入</span><span class="legend-item"><i class="legend-shape sell"></i>卖出</span></div></div><p class="caption">分钟线暂未拉取成功，先保留真实成交点列表。</p><div class="trade-point-list">${fallbackList}</div></div>`;
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

  return `<div class="trade-map"><div class="trade-map-head"><h4>5 日分钟线买卖点</h4><div class="trade-legend"><span class="legend-item"><i class="legend-shape buy"></i>买入</span><span class="legend-item"><i class="legend-shape sell"></i>卖出</span></div></div><div class="trade-chart-wrap"><svg class="trade-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(stock.name)}分钟走势与买卖点"><rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="#fff"></rect><line x1="${left}" x2="${width - right}" y1="${height - bottom}" y2="${height - bottom}" stroke="#e5e7eb"></line><line x1="${left}" x2="${width - right}" y1="${top}" y2="${top}" stroke="#edf0f3"></line><text x="${left}" y="17" class="axis-label">高 ${max.toFixed(2)}</text><text x="${width - right}" y="17" text-anchor="end" class="axis-label">低 ${min.toFixed(2)}</text><polyline points="${points}" class="market-line"></polyline>${markers}<text x="${left}" y="${height - 10}" text-anchor="start" class="axis-label">${escapeHtml(dateStart)}</text><text x="${width - right}" y="${height - 10}" text-anchor="end" class="axis-label">${escapeHtml(dateEnd)}</text></svg></div><div class="trade-point-list">${pointList}</div></div>`;
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
    { name: "半导体 / 芯片 ETF 篮子", code: "512760 / 588170 / 588710 / 588890 / 589260", pnl: chipBasketPnl, note: "同主题多 ETF 同时铺开，本质是一笔半导体方向仓位，是本周最明确的闭环亏损来源。" },
    { name: "太极实业", code: "600667", pnl: closedPnL["600667"], note: "不是当时最明确的唯一核心，7/1 试错、7/2 早盘撤退。" },
    { name: "海南海药", code: "000566", pnl: closedPnL["000566"], note: "隔日小幅保本离场，风险没有扩大。" },
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
        <li>本周最大问题不是交易次数，而是半导体/芯片 ETF 篮子在同一主题上形成集中暴露，7/2 早盘撤退后闭环约 ${money(chipBasketPnl)}。</li>
        <li>太极实业试错亏损约 ${money(closedPnL["600667"])}，核心是买前没有把“题材第一性”和“唯一性”确认到位。</li>
        <li>海南海药基本保本，说明隔日不强时能处理；但它不是本周主要收益来源。</li>
        <li>7/3 尾盘转入科创新材ETF，当前只能按持仓待确认处理，下周一必须先写强弱验证和止损预案。</li>
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
        <div class="section-head"><div><h2>本周持有/闭环票：赚钱与亏损主因</h2><p>已按你的二次反思更新：本周核心不是交易次数问题，而是科技趋势退潮阶段、ETF 与趋势个股的工具选择和节奏处理问题。</p></div><span class="chip">二次反思口径</span></div>
        <div class="ticket-list">${renderTicketCards()}</div>
      </section>

      <section class="panel" id="weekly-reflection">
        <div class="section-head"><div><h2>本周整体复盘</h2><p>这周的核心失误不是没有看到科技趋势，而是科技趋势进入主升后段和三高退潮时，没有及时把 ETF 浮盈保护住，同时在趋势个股上承担了不适合自己的风险。</p></div><span class="chip">二次反思已入</span></div>
        <div class="grid-2">
          <article class="info-card"><h3>本周亏损主因</h3><p>周一亏在科技趋势个股尾段，周四亏在科技连续高潮后的退潮没有高位离场。本周账户口径亏损 ${money(accountPnl)}，最大压力集中在 ${worstAccountDay.weekday} ${worstAccountDay.date.slice(5).replace("/", "-")}：${money(worstAccountDay.pnl)}。</p></article>
          <article class="info-card"><h3>做对的地方</h3><p>开始接受 ETF 作为趋势行情的主要工具，这是进步。没有连板高度、短线情绪弱的时候，ETF 吃的是板块整体趋势溢价，比硬抓某个趋势个股更稳。</p></article>
          <article class="info-card"><h3>错在节奏</h3><p>科技主升一全面推进后，主升二会分歧缩容，前面涨过或逻辑证伪的方向开始退潮，资金会切到更硬或没涨过的方向。三高阶段还不砸，就容易从浮盈变大亏。</p></article>
          <article class="info-card"><h3>下周重点</h3><p>围绕科创新材ETF制定明确处理预案：只在板块趋势继续强化时持有或加仓；若只是弱修复或反抽，按 ETF 试错仓处理，先守住回撤。</p></article>
        </div>
      </section>

      <section class="panel" id="secondary-reflection">
        <div class="section-head"><div><h2>本周二次反思总结</h2><p>把 5 月初、6/22、6/29 三次较大回撤放在一起看，亏损源头都不是单纯买卖点，而是战法和周期错配。</p></div><span class="chip warn">回撤归因</span></div>
        <div class="grid-2">
          <article class="info-card"><h3>1. 5 月初：有龙不做龙，去做补涨杂毛</h3><p>5 月初那周出现了大唐发电这类清晰龙头，但当时龙头战法经验不足，没有把大唐发电、大连热电、华电能源、大唐电信、华电辽能这条线处理好，反而去做补涨和跟风。那次 14% 回撤的第一性原因，是有龙头却没有做龙头。</p></article>
          <article class="info-card"><h3>2. 6/22：没有连板效应，却重仓连板个股</h3><p>6/22-6/26 那周短线连板没有高度，情绪效应玩不了，却硬做了貌似龙头的诺德股份。趋势战法当时还不成熟，正确做法应该偏向 ETF 或分散持仓的趋势中盘，而不是重仓单一连板个股。</p></article>
          <article class="info-card"><h3>3. 本周：科技三高没有砸，趋势个股没有换 ETF</h3><p>本周科技退潮前已经连续高潮，周三切 ETF 没问题，周四高位就该走。当时账面曾有 3%-4% 浮盈，但三高不砸，科技全面退潮后就直接变成周四 -7.50% 的账户回撤。</p></article>
          <article class="info-card"><h3>4. 之后的趋势战法边界</h3><p>科技趋势这波证明：对自己来说，趋势行情最好的模式是 ETF，而不是重仓中屁股。ETF 吃板块整体趋势溢价；个股吃的是个股选择、节奏和资金偏好的溢价。个股没拿捏稳，就不能让它承担主仓位。</p></article>
        </div>
        <div class="quote" style="margin-top:14px">核心结论：有龙做龙，没龙接力；没有连板情绪、进入趋势行情时，先用 ETF 做稳定正期望。连续二高、三高要砸；连续二冰、三冰要准备反核，但必须结合指数和板块趋势，不机械套公式。</div>
      </section>

      <section class="panel" id="daily">
        <div class="section-head"><div><h2>逐日操作&情绪复盘</h2><p>按前几周周度模板重做：每日内容从 daily-trading-review 对应日期页面摘取，拆成主线与情绪、操作&情绪复盘、个人反思、次日关注四块，并保留每日原文链接。</p></div><span class="chip">每日A股复盘引入</span></div>
        <div class="day-list">${renderDailyCards()}</div>
      </section>

      <section class="panel" id="stocks">
        <h2>重点走势图</h2>
        <p class="section-note">用 5 日分钟线标出本周所有实际买卖过的股票。图是为了直观看买卖点和前后走势，不替代成交单。</p>
        <div class="stock-grid">${renderStockCards(trends)}</div>
      </section>

      <section class="panel" id="rules">
        <div class="section-head"><div><h2>本周沉淀规则</h2><p>根据二次反思精修后的执行准则，重点约束科技趋势、ETF、趋势个股和高潮/冰点节奏。</p></div><span class="chip">正式规则</span></div>
        <div class="rules">
          <article class="rule"><h3>趋势不熟先做 ETF</h3><p>没有连板高度、市场走趋势轮动时，优先用 ETF 吃板块整体趋势溢价；中屁股个股只允许小仓试错。</p></article>
          <article class="rule"><h3>连续三高必须砸</h3><p>连续两天高潮要警惕兑现，连续三天高潮大概率砸盘；浮盈阶段先保护利润，不用小概率延续对抗大概率退潮。</p></article>
          <article class="rule"><h3>主升二会缩容</h3><p>主升一全面推进后，主升二会分歧缩容，前期涨过或逻辑证伪的题材会退潮，资金会切到更硬或没涨过的方向。</p></article>
          <article class="rule"><h3>趋势个股不重仓后手</h3><p>尾段进入趋势个股，尤其是旧方向和高位中盘，很容易吃退潮；看不准个股第一性时，不用个股承担主仓位。</p></article>
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
      <div><h2>最新周日度面板</h2><p>直接看 06.29-07.04 每天的盈亏百分比、收益金额和持仓比例；最亏集中在周四，高仓位叠加科技趋势破位。</p></div>
      <span class="chip">日度账户已补</span>
    </div>
    <div class="latest-summary">
      <span>周账户 <b class="${classByValue(accountPnl)}">${money(accountPnl)}</b></span>
      <span>日收益率合计 <b class="${classByValue(accountReturnSum)}">${pct(accountReturnSum)}</b></span>
      <span>平均仓位 <b>${avgPosition.toFixed(2)}%</b></span>
      <span>最亏日 <b class="is-loss">${worstAccountDay.weekday} ${pct(worstAccountDay.returnRate)}</b></span>
    </div>
    <div class="day-strip">${dayCards}</div>
    <a class="week-card latest-link" href="../2026-06-29_2026-07-04/">
      <div class="week-head"><div><h3>进入 2026.06.29 - 2026.07.04 复盘</h3><p>查看交割明细、每日复盘、买卖点图和本周待补材料。最新版本已加入日度收益/仓位图和成交价买卖点图。</p></div><span class="chip">草稿版</span></div>
    </a>
  </section>`;
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
  <section class="hero"><div><span class="label">weekly-monthly-quarterly-yearly-trading-review</span><h1>周度 / 月度 / 季度 / 年度交易复盘</h1><p>这里是总入口：周度单独成页；月度和季度放在同一个复盘主页；年度复盘单独沉淀交易体系。</p><div class="button-row"><a class="button" href="./weekly-trading-review/">周度主页</a><a class="button secondary" href="./monthly-quarterly-trading-review/">月度 / 季度主页</a><a class="button secondary" href="./yearly-trading-review/">年度主页</a></div></div><div class="metrics">${renderMetric("周度归档", "9", "已发布/草稿周复盘")}${renderMetric("最新区间", "06.29", "至 07.04")}${renderMetric("最新账户", money(accountPnl), `期末 ${rawMoney(endingEquity)}`, classByValue(accountPnl))}${renderMetric("长期结构", "3 个主页", "周度 / 月季 / 年度")}</div></section>
  <section class="panel"><h2>复盘主页</h2><div class="loss-grid"><a class="week-card" href="./weekly-trading-review/"><div class="week-head"><h3>周度交割复盘</h3><span class="chip">主页 1</span></div><p>每周一个独立复盘页面，记录交割单、买卖点、账户变化、KISS 复盘和周度规则。</p><div class="mini-grid"><span>周报 <b>9 篇</b></span><span>最新 <b>06.29-07.04</b></span><span>状态 <b>草稿版</b></span></div></a><a class="week-card" href="./monthly-quarterly-trading-review/"><div class="week-head"><h3>月度 / 季度复盘</h3><span class="chip">主页 2</span></div><p>月度承接周度结果，季度检查模式和仓位是否真正改善账户曲线。</p><div class="mini-grid"><span>月度 <b>1-12 月</b></span><span>季度 <b>Q1-Q4</b></span><span>状态 <b>框架版</b></span></div></a><a class="week-card" href="./yearly-trading-review/"><div class="week-head"><h3>年度交易复盘</h3><span class="chip">主页 3</span></div><p>年度层面聚焦账户画像、模式进化、仓位风控、心理纪律和下一年执行准则。</p><div class="mini-grid"><span>年度 <b>自然年</b></span><span>核心 <b>体系沉淀</b></span><span>状态 <b>框架版</b></span></div></a></div></section>
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
