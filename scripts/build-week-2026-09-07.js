const fs = require("fs");
const path = require("path");
const assert = require("node:assert/strict");

const repo = path.resolve(__dirname, "..");
const weekDir = path.join(repo, "2026-09-07_2026-09-11");
const week = {
  folder: "2026-09-07_2026-09-11",
  rangeText: "2026.09.07 - 2026.09.11",
  tradeRangeText: "2026.09.07 - 2026.09.11",
  label: "09.07-09.11",
  status: "初版 / 待补账户与二次反思",
  title: "爱仕达止损亏损最大，百大集团小赚；桂林旅游卖出后重新建仓",
  subtitle: "17笔成交、4只标的。已补入周一至周三每日复盘正文与KISS；周四、周五反思、每日账户数据和期末持仓截图待补。",
};
const trades = [
  { date:"20260907", time:"09:30:48", code:"000735", name:"罗牛山", side:"买入", sideType:"buy", qty:200, price:6.74, amount:1348, fee:5, tax:0, net:-1353, cash:9816.91, market:"深A" },
  { date:"20260908", time:"09:30:50", code:"000735", name:"罗牛山", side:"卖出", sideType:"sell", qty:100, price:6.86, amount:686, fee:5, tax:0.34, net:680.66, cash:5032.57, market:"深A" },
  { date:"20260908", time:"09:31:55", code:"002403", name:"爱仕达", side:"买入", sideType:"buy", qty:400, price:13.65, amount:5460, fee:5, tax:0, net:-5465, cash:4351.91, market:"深A" },
  { date:"20260908", time:"09:32:16", code:"000735", name:"罗牛山", side:"卖出", sideType:"sell", qty:100, price:6.73, amount:673, fee:5, tax:0.34, net:667.66, cash:5700.23, market:"深A" },
  { date:"20260908", time:"09:48:12", code:"002403", name:"爱仕达", side:"买入", sideType:"buy", qty:200, price:13.65, amount:2730, fee:5, tax:0, net:-2735, cash:2965.23, market:"深A" },
  { date:"20260909", time:"09:32:05", code:"002403", name:"爱仕达", side:"卖出（原列未知）", rawSide:"未知", inferredSide:true, sideType:"sell", qty:600, price:12.71, amount:7626, fee:5, tax:3.81, net:7617.19, cash:null, market:"深A" },
  { date:"20260909", time:"09:32:41", code:"600865", name:"百大集团", side:"买入", sideType:"buy", qty:200, price:15.11, amount:3022, fee:5, tax:0, net:-3027.03, cash:7555.39, market:"沪A" },
  { date:"20260909", time:"09:32:45", code:"600865", name:"百大集团", side:"买入", sideType:"buy", qty:200, price:15.11, amount:3022, fee:5, tax:0, net:-3027.03, cash:4528.36, market:"沪A" },
  { date:"20260909", time:"09:48:57", code:"600865", name:"百大集团", side:"买入", sideType:"buy", qty:200, price:15.11, amount:3022, fee:5, tax:0, net:-3027.04, cash:1501.32, market:"沪A" },
  { date:"20260910", time:"09:32:16", code:"600865", name:"百大集团", side:"卖出", sideType:"sell", qty:300, price:15.42, amount:4626, fee:5, tax:2.31, net:4618.64, cash:6119.96, market:"沪A" },
  { date:"20260910", time:"09:32:21", code:"600865", name:"百大集团", side:"卖出", sideType:"sell", qty:300, price:15.13, amount:4539, fee:5, tax:2.27, net:4531.68, cash:null, market:"沪A" },
  { date:"20260910", time:"15:00:00", code:"000978", name:"桂林旅游", side:"买入", sideType:"buy", qty:500, price:9.69, amount:4845, fee:5, tax:0, net:-4850, cash:5801.64, market:"深A" },
  { date:"20260911", time:"09:31:22", code:"000978", name:"桂林旅游", side:"卖出", sideType:"sell", qty:400, price:9.60, amount:3840, fee:5, tax:1.92, net:3833.08, cash:9634.72, market:"深A" },
  { date:"20260911", time:"09:35:38", code:"000978", name:"桂林旅游", side:"卖出", sideType:"sell", qty:100, price:9.99, amount:999, fee:5, tax:0.50, net:993.50, cash:null, market:"深A" },
  { date:"20260911", time:"09:42:21", code:"000978", name:"桂林旅游", side:"买入", sideType:"buy", qty:200, price:10.66, amount:2132, fee:5, tax:0, net:-2137, cash:8491.22, market:"深A" },
  { date:"20260911", time:"09:42:23", code:"000978", name:"桂林旅游", side:"买入", sideType:"buy", qty:700, price:10.66, amount:7462, fee:5, tax:0, net:-7467, cash:1024.22, market:"深A" },
  { date:"20260911", time:"09:48:59", code:"000978", name:"桂林旅游", side:"买入", sideType:"buy", qty:100, price:10.08, amount:1008, fee:5, tax:0, net:-1013, cash:11.22, market:"深A" },
];
const ignoredOrders = [];
const sourceData = JSON.parse(fs.readFileSync(path.join(weekDir, "data/daily-reviews.json"), "utf8"));
const dailyReviews = Object.fromEntries(sourceData.reviews.map(row => [row.date.replaceAll("-", ""), row]));
const accountDays = [];
const dailyNotes = [
  {date:"20260907", day:"周一", theme:"强修复中的小仓试错", action:"09:30买入罗牛山200股，含费成本1,353.00元。", review:"每日正文肯定仓位克制，同时指出百大集团、金健米业的主动核心识别偏慢。罗牛山能否持有要服从猪肉分支强度。", kiss:[
    ["Keep 保持","只做前排、身位和板块核心，继续观察爆量后弱转强、缩量转强与前排卡位。"],
    ["Improve 改进","关键晋级节点提前列量能条件；把不参与高标的原因拆成题材、筹码、竞价和监管空间。"],
    ["Start 启动","用板块节奏、个股量能、主动性/领涨性三项决定试仓。"],
    ["Stop 停止","题材分歧后没有强回流就不恋战；错过标准身位票后不补后排。"]]},
  {date:"20260908", day:"周二", theme:"罗牛山退出，爱仕达回封试错", action:"两笔卖完罗牛山200股，含费闭环-4.68元；两笔买入爱仕达600股，含费成本8,200.00元。", review:"日记将罗牛山称为平出，含费后实际微亏；买入爱仕达回封，同时已认识到机器人后排弱、爱仕达人气不足。", kiss:[
    ["Keep 保持","坚持强板块、强节点、量能节奏共振，重点看高标唯一性确认。"],
    ["Improve 改进","区分独立新题材与主线内小分支，买前检查题材大小和板块效应。"],
    ["Start 启动","高潮次日只接分化后的确认，观察弱转强、回封与承接。"],
    ["Stop 停止","不因早期形态不完美就否定后续持续超预期，也不接后排一致加速。"]]},
  {date:"20260909", day:"周三", theme:"爱仕达止损，转向百大唯一高标", action:"09:32卖出爱仕达600股，含费亏损582.81元；随后三笔买入百大集团600股，含费成本9,081.10元。", review:"正文明确指出爱仕达弱走时没有第一时间处理，条件单未按日记中的-3%纪律执行。正向进化是百大反卡亚盛后，结合量能、梯队与唯一性选择高标。", kiss:[
    ["Keep 保持","保留题材、量能、梯队和唯一性综合判断，将个股放回市场环境中分析。"],
    ["Improve 改进","弱题材分化后接分歧，缺少回流和后排助攻时前置卖点。"],
    ["Start 启动","把原日记提出的-3%防守条件写清参照价和触发动作；同时跟踪亚盛负反馈。"],
    ["Stop 停止","不因怕卖飞而不设条件单，不对弱机器人、持续性不足的小题材幻想反包。"]]},
  {date:"20260910", day:"周四", theme:"百大小赚兑现，尾盘新开桂林", action:"早盘两笔卖出百大集团600股，实现+69.22元；15:00买入桂林旅游500股，成本4,850.00元。", review:"成交事实已核算。每日网站尚未发布本日复盘，卖出百大的原因、桂林旅游尾盘买入逻辑和当时情绪待补。"},
  {date:"20260911", day:"周五", theme:"桂林卖完旧仓后放大新仓", action:"卖出桂林旅游原500股，闭环-23.42元；随后在10.66元买回900股，再在10.08元买100股，留下1,000股。", review:"成交显示卖出后新买数量是原持仓的两倍，最后现金11.22元。是计划内重新确认、临盘追回还是其他原因，需要本人反思确认。"},
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
  { label: week.label, folder: week.folder, pnl: "账户待补", pct: "待补", equity: "待补", note: "17笔成交初版；闭环-541.69，桂林旅游留仓1,000股；账户与二次反思待补。" },
];

const secids = { "000735":"0.000735", "002403":"0.002403", "600865":"1.600865", "000978":"0.000978" };

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
  const file = path.join(weekDir, "data", code + "-5m.json");
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return data.bars.filter(bar => bar.date >= "2026-09-07" && bar.date <= "2026-09-11");
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
    const label=(buy?'B':'S')+(i+1);
    let lx=px, ly=py;
    for (let attempt=0; attempt<36; attempt++) {
      lx=Math.max(left+12,Math.min(width-right-12,px+[0,30,-30][attempt%3]));
      ly=Math.max(top-20,Math.min(height-bottom-8,py+(buy?1:-1)*(26+Math.floor(attempt/3)*20)));
      if (!labelPositions.some(p=>Math.abs(p.x-lx)<28 && Math.abs(p.y-ly)<18)) break;
    }
    labelPositions.push({x:lx,y:ly});
    const points=buy ? px+','+(py-5)+' '+(px-5)+','+(py+4)+' '+(px+5)+','+(py+4) : px+','+(py+5)+' '+(px-5)+','+(py-4)+' '+(px+5)+','+(py-4);
    return '<g class="trade-marker ' + row.sideType + '" data-time="' + row.date+' '+row.time + '"><title>' + label + ' ' + formatDate(row.date)+' '+row.time+' '+row.side+' '+row.price.toFixed(2)+'元 / '+row.qty+'股</title><line x1="'+px+'" x2="'+lx+'" y1="'+py+'" y2="'+ly+'" stroke="'+color+'" stroke-dasharray="2 3"/><polygon points="'+points+'" fill="'+color+'" stroke="#fff" stroke-width="1"/><text x="'+lx+'" y="'+ly+'" text-anchor="middle">'+label+'</text></g>';
  }).join('');
  return '<svg class="stock-chart" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="'+stock.name+' 9月7日至11日5分钟K线及买卖点"><rect width="'+width+'" height="'+height+'" style="fill:#fff"/><text x="'+left+'" y="23" font-size="14" fill="#17202a">5分钟K线 · 不复权 · '+bars.length+'根</text>'+grid+dayLabels+candles+markers+'</svg>';
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
  return byCode.map(stock => {
    const markers = sortChronological(stock.rows).map((r,i) => '<span class="trade-point '+actionClass(r.sideType)+'"><b>'+(r.sideType==='buy'?'B':'S')+(i+1)+'</b> '+shortDate(r.date)+' '+r.time+' '+r.side+'<strong>'+r.price.toFixed(2)+' / '+qty(r.qty)+'股</strong></span>').join('');
    return '<article class="stock-card" id="stock-'+stock.code+'"><div class="stock-card-head"><div><span class="code">'+stock.code+'</span><h3>'+stock.name+'</h3></div><span class="chip">'+stock.rows.length+'笔</span></div><div class="stock-metrics"><span>买入数量<b>'+qty(stock.buyQty)+'</b></span><span>卖出数量<b>'+qty(stock.sellQty)+'</b></span><span>已实现 / 闭环收益率<b class="'+classByValue(stock.realized)+'">'+realizedText(stock)+' / '+stockPctFigure(stock.code)+'</b></span><span>期末可见数量<b>'+qty(stock.openQty)+'</b></span></div><p>'+stockNote(stock)+'</p><div class="chart-heading"><b>5分钟K线买卖点</b><span><i class="is-buy">▲ 买入</i> <i class="is-sell">▼ 卖出</i></span></div><div class="chart-frame">'+charts[stock.code]+'</div><div class="trade-points">'+markers+'</div><p class="source-line"><small>行情：东方财富历史5分钟K线，不复权；按实际成交价标记，时间归入对应5分钟区间。<a href="./data/'+stock.code+'-5m.json">行情记录</a></small></p></article>';
  }).join('');
}

function stockNote(stock) {
  const notes = {
    "000735": "罗牛山：小仓试错，回流失败退出。日记称“平出”，成交含费口径为-4.68元。原始记录将原因归到猪肉只是农业内部小分支，不能按独立主线期待。",
    "002403": "爱仕达：本周主要已实现亏损，-582.81元 / -7.11%。9/9正文明确反思机器人持续性不足、弱走时处理不够及时、条件单未按计划执行。这是本人日记归因；具体触发价仍需与当时条件单核对。",
    "600865": "百大集团：本周唯一盈利闭环，+69.22元 / +0.76%。9/9日记肯定题材、量能、唯一高标的共同确认，并提示继续观察败方亚盛集团反馈。9/10实际卖点动机待当日日记补齐。",
    "000978": "桂林旅游：原500股闭环-23.42元 / -0.48%；周五新买1,000股成本10,617.00元。两笔10.66元买回900股后又在10.08元买100股，未卖新仓的浮盈亏另列，不能混入已实现收益。本人当时想法待补。",
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
  if (!stock || !stock.buyCash || !stock.sellQty) return "成本待补";
  return pct((stock.realized / (stock.buyCash - stock.openCost)) * 100);
}

function renderProfitLossPanel() {
  const roles = { "600865":"主要赚钱票", "002403":"主要亏损票", "000735":"小亏闭环", "000978":"闭环微亏 / 期末持仓" };
  return '<section class="panel" id="profit-loss"><span class="label">Profit / Loss Roots</span><h2>本周持有/闭环票：赚钱与亏损主因</h2><p>闭环收益率 = 含费用已实现盈亏 / 对应已卖份额的含费成本。桂林旅游的新仓单列，不计入旧仓收益率。</p><div class="ticket-analysis">' +
    ["600865","002403","000735","000978"].map(code => '<article><span class="code">' + roles[code] + '</span><h3>' + stockByCode.get(code).name + ' <span class="' + classByValue(stockByCode.get(code).realized) + '">' + stockFigure(code) + ' / ' + stockPctFigure(code) + '</span></h3><p>' + stockNote(stockByCode.get(code)) + '</p></article>').join('') +
    '</div><p><b>操作与情绪线索：</b>已发布日记显示，从罗牛山的小仓验证，转到爱仕达回封，再到百大唯一性确认。爱仕达的亏损已有本人反思支持；桂林旅游放大新仓的主观原因尚未提供，初版只列待核对问题。</p></section>';
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
  return dailyNotes.map(day => {
    const stat = dailyStats.get(day.date);
    const review = dailyReviews[day.date];
    return '<article class="day-card"><div class="day-card-head"><h3>' + formatDate(day.date) + ' ' + day.day + '</h3><b>' + day.theme + '</b></div>' +
      '<div class="day-numbers"><span>成交笔数<b>' + stat.rows.length + '</b></span><span>买入金额<b>' + rawMoney(stat.buyAmount) + '</b></span><span>卖出金额<b>' + rawMoney(stat.sellAmount) + '</b></span></div>' +
      '<p><b>成交操作：</b>' + day.action + '</p><p><b>' + (review ? '日记摘编与核对' : '待补反思') + '：</b>' + day.review + '</p>' +
      (review ? '<p><b>市场情绪（原日记口径）：</b>' + escapeHtml(review.emotion) + '</p><div class="kiss-grid">' +
      day.kiss.map(([label, content]) => '<div><b>' + label + '</b><p>' + content + '</p></div>').join('') +
      '</div><details><summary>查看当日操作与情绪复盘正文</summary><div class="source-excerpt">' + escapeHtml(review.chapter) + '</div></details><p class="source-line"><a href="' + escapeHtml(review.url) + '" target="_blank" rel="noreferrer">来源：' + escapeHtml(review.title) + '</a><small>KISS按正文整理；账户比例不能由“一成仓”等文字替代。</small></p>' :
      '<div class="chart-empty"><b>当日操作与情绪原文待补</b><span>截至本次抓取，个人每日复盘主页及公开页面目录未找到本日记录。未将前一日预案当成本日实际反思。</span></div>') +
      '</article>';
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
  const rules = [
    ["保留小仓验证", "9/7日记：试仓要服从题材强度，分支逻辑不成立时及时结束。"],
    ["题材级别前置", "9/8日记：先区分独立主线与内部小分支，再比较量能、主动性和板块效应。"],
    ["弱票执行防守", "9/9日记：爱仕达的教训是条件单和卖点没有落实。原文的-3%需明确参照价、触发条件和执行方式。"],
    ["看胜方也看败方", "9/9日记：百大唯一性确认后，仍需观察亚盛负反馈与情绪环境。"],
    ["回买单独立项", "待本人确认：桂林旅游卖出后回买，应单列入场条件、新仓数量上限与失效点。"],
    ["先补数据再定稿", "账户收益、平均周仓位与最大盈亏日等待日度账户表；二次反思待本人补充。"],
  ];
  return rules.map(([title, body]) => '<article><b>' + title + '</b><p>' + body + '</p></article>').join('');
}

function renderHoldingsPanel() {
  const stock = stockByCode.get("000978");
  const file = path.join(weekDir,"data/000978-5m.json");
  const source = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,"utf8")) : null;
  const last = source?.bars.at(-1);
  const closingPrice = last?.dt==="2026-09-11 15:00" ? last.close : null;
  const value = closingPrice===null ? null : closingPrice*stock.openQty;
  const holdingPnl = value===null ? null : value-stock.openCost;
  return '<section class="panel" id="holdings"><span class="label">Closing Positions</span><h2>期末持仓与收盘估算</h2><p>交割截图可见桂林旅游新仓1,000股。以下按9/11最后一根5分钟K线收盘价估算，券商期末持仓截图待确认。</p><div class="summary-grid"><span>桂林旅游数量<b>'+qty(stock.openQty)+'股</b></span><span>含费买入成本<b>'+rawMoney(stock.openCost)+'</b></span><span>含费单位成本<b>'+(stock.openCost/stock.openQty).toFixed(3)+'</b></span><span>行情收盘价<b>'+rawMoney(closingPrice)+'</b></span><span>估算市值<b>'+rawMoney(value)+'</b></span><span>估算浮盈亏<b class="'+classByValue(holdingPnl)+'">'+money(holdingPnl,{sign:true})+' / '+pct(holdingPnl===null?null:holdingPnl/stock.openCost*100)+'</b></span></div><p>截图最后一笔现金为'+rawMoney(finalCash)+'元。仅此持仓与该现金合计为'+(value===null?'待补':rawMoney(value+finalCash))+'元，不能据此确认账户总资产和全账户仓位。可见组合的已实现与持仓估算合计'+money(holdingPnl===null?null:visibleRealized+holdingPnl,{sign:true})+'元，也不替代券商周收益。</p></section>';
}

function renderWeekPage(charts) {
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+week.rangeText+' 每周交割复盘</title><style>'+sharedStyles()+'</style></head><body>' +
    '<nav class="rail" aria-label="页面导航"><a href="../weekly-trading-review/">周度主页</a><a href="../">总入口</a><a href="#overview">本周总览</a><a href="#second-review">二次反思</a><a href="#account">账户</a><a href="#holdings">期末持仓</a><a href="#profit-loss">盈亏主因</a><a href="#stocks">买卖点</a><a href="#daily">每日KISS</a><a href="#trades">成交明细</a><a href="#missing">待补清单</a></nav>' +
    '<main class="page-shell"><section class="hero" id="overview"><div><span class="label">'+week.status+'</span><h1><span class="date-range"><span>2026.09.07 -</span><span>2026.09.11</span></span>每周交割复盘</h1><p>'+week.subtitle+'</p><div class="button-row"><a class="button" href="#stocks">查看买卖点</a><a class="button secondary" href="#missing">后续待补</a></div></div><div class="metrics">'+
    metricCard("成交 / 标的",trades.length+"笔 / "+byCode.length+"只","仅统计本次成交截图")+
    metricCard("可见已实现盈亏",money(visibleRealized,{sign:true}),"含费用；未卖持仓单列",classByValue(visibleRealized))+
    metricCard("主要亏损票","爱仕达 "+stockFigure("002403"),stockPctFigure("002403")+" / 对应已卖成本", "is-loss")+
    metricCard("期末可见持仓","桂林旅游 1,000股","新仓成本10,617.00；截图待确认")+'</div></section>' +
    '<section class="panel" id="second-review"><span class="label">Second Reflection</span><h2>本周二次反思总结</h2><p class="lead">待你补充本周二次心得。初版先整理已经发布的每日反思与实际成交，后续在这里汇总你对收益、亏损和情绪变化的最终判断。</p></section>' +
    '<section class="panel"><h2>本周初步结论</h2><div class="thesis-grid"><article><b>小仓验证有执行</b><p>罗牛山从一成仓试错到回流失败退出，日记肯定了仓位纪律。成交含费后-4.68元，接近持平。</p></article><article><b>弱题材与防守执行</b><p>爱仕达是最大已实现亏损。9/9正文明确指出弱题材参与过深、弱走时未及时处理，以及条件单没有落实。</p></article><article><b>回买后的新风险</b><p>百大集团闭环+69.22元；桂林旅游周五旧仓退出后新买1,000股，回买理由与仓位上限需要二次反思解释。</p></article></div></section>' +
    '<section class="panel data-panel"><div><h2>交割单口径核算</h2><p>按“发生金额”计算含费FIFO闭环。爱仕达9/9的操作原列为“未知”，结合正向到账7,617.19元、印花税及持仓数量，暂按卖出600股记账，并在明细保留标记。</p><p>部分资金余额被截图截断，记为待补；另有显示余额顺序与成交时间不一致的记录，因此不据此填充每日总资产。合同号、成交编号和原始私人截图均不公开。</p></div><div class="summary-grid"><span>买入笔数<b>'+buyRows.length+'</b></span><span>卖出笔数<b>'+sellRows.length+'</b></span><span>买入成交额<b>'+rawMoney(buyAmount)+'</b></span><span>卖出成交额<b>'+rawMoney(sellAmount)+'</b></span><span>成交净现金流<b class="'+classByValue(netCash)+'">'+money(netCash,{sign:true})+'</b></span><span>全部现金费用<b>'+rawMoney(sellAmount-buyAmount-netCash)+'</b></span></div></section>' +
    renderAccountPanel()+renderHoldingsPanel()+renderProfitLossPanel()+
    '<section class="panel" id="stocks"><span class="label">Trade Charts</span><h2>重点走势图与买卖点</h2><p>四只实际交易标的均使用本周真实5分钟K线。买卖点保留成交价、时间和数量；未卖持仓独立列示。</p><div class="table-wrap"><table><thead><tr><th>标的</th><th>买入数量</th><th>买入成交额</th><th>卖出数量</th><th>卖出成交额</th><th>可见已实现</th><th>期末数量 / 成本</th></tr></thead><tbody>'+renderCodeSummaryRows()+'</tbody></table></div><div class="stock-grid">'+renderStockCards(charts)+'</div></section>'+
    '<section class="panel" id="daily"><span class="label">Daily KISS</span><h2>每日操作与情绪复盘</h2><p>9/7、9/8、9/9摘自个人每日复盘正文第五节，并保留原文与来源。周四、周五只有成交事实，主观操作与情绪暂待补入。</p><div class="day-grid-cards">'+renderDailyCards()+'</div></section>'+
    '<section class="panel" id="rules"><h2>本周已有规则与待验证问题</h2><p>以下依据已发布日记整理；桂林旅游回买问题待本人补充，不预设情绪动机。</p><div class="rules">'+renderRules()+'</div></section>'+
    '<section class="panel" id="trades"><h2>成交明细</h2><p>金额单位为元。盈亏以发生金额核算，沪市发生金额中另含共0.20元的费用差额；截图显示手续费85.00元、印花税11.49元，全部现金费用96.69元。</p>'+renderTradeTable()+'</section>'+
    '<section class="panel" id="missing"><span class="label">To Fill</span><h2>后续待补内容</h2><div class="missing-list"><article><b>1. 每日账户数据</b><p>9/7至9/11每日收益率、收益金额、仓位、当前总金额。用于日度图、平均周仓位、最赚/最亏日和周度主页曲线。</p></article><article><b>2. 9/11期末持仓</b><p>确认桂林旅游1,000股，以及现金、成本、持仓市值、总资产；是否还持有其他标的，或发生入金/出金。</p></article><article><b>3. 周四与周五日记</b><p>9/10、9/11尚未在每日网站找到，重点补百大卖出与桂林旅游卖出后回买的想法。</p></article><article><b>4. 本周二次反思</b><p>补充你对主要盈亏与仓位变化的总结。爱仕达9/9“未知”方向暂按卖出处理，若券商另有含义再更正。</p></article></div></section></main></body></html>';
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
        <p>每周一个独立页面，记录成交单、买卖点、账户变化、逐日复盘和当周新增交易纪律。最新周为 2026.09.07-09.11；17笔成交和4只标的买卖点已整理，前三日操作反思已提取，账户数据和二次反思待补。</p>
        <div class="button-row">
          <a class="button" href="../${week.folder}/">进入最新周复盘</a>
          <a class="button secondary" href="../index.html">返回总首页</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("周报数量", `${archiveWeeks.length}`, "含本周草稿")}
        ${metricCard("最新区间", "09.07", "至 09.11")}
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
      <p>本周可见已实现-541.69元，爱仕达为主要亏损票，百大集团小赚；桂林旅游留仓1,000股，另列持仓估算。账户日收益合计 ${accountPnlLabel}，期末总金额 ${finalEquityLabel}。</p>
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
        ${metricCard("最新区间", "09.07", "至 09.11")}
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

function weekExtraStyles() {
  return '.summary-grid b.is-loss,.stock-metrics b.is-loss,.mini-grid b.is-loss,.account-summary b.is-loss{color:var(--green)}.summary-grid b.is-profit,.stock-metrics b.is-profit,.mini-grid b.is-profit,.account-summary b.is-profit{color:var(--red)}h1{font-size:46px}.label{max-width:100%;white-space:normal;overflow-wrap:anywhere}.ticket-analysis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.ticket-analysis article{border-top:1px solid var(--line);padding-top:16px}.ticket-analysis .code{margin-bottom:10px}.day-grid-cards{grid-template-columns:1fr}.day-card-head{display:flex;flex-wrap:wrap;align-items:center}.day-numbers{grid-template-columns:repeat(3,minmax(0,1fr))}.kiss-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.kiss-grid>div{border-top:2px solid #dce3ea;padding-top:12px}.source-excerpt{white-space:pre-wrap;line-height:1.8;color:var(--muted);padding:14px 0}.source-line a{overflow-wrap:anywhere}details summary{cursor:pointer;font-weight:700;padding:8px 0}.chart-heading{display:flex;justify-content:space-between;gap:16px}.chart-heading i{font-style:normal;font-size:13px}.stock-chart{min-width:1100px}.stock-chart .trade-marker text{font-size:12px}.trade-points{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.trade-point{padding:10px;border:1px solid var(--line);border-radius:6px;font-size:13px}.trade-point strong{display:block;color:var(--ink);margin-top:4px}.stock-metrics b{font-size:16px}.rules{grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:1400px){.rail{position:static;width:min(1180px,calc(100% - 28px));margin:18px auto 0;display:flex;flex-direction:row;flex-wrap:wrap}.rail a{width:auto;padding:8px 12px}}@media(max-width:800px){h1{font-size:36px}.kiss-grid,.ticket-analysis,.rules{grid-template-columns:1fr 1fr}}@media(max-width:560px){h1{font-size:32px}h2{font-size:24px}.kiss-grid,.ticket-analysis,.rules,.day-numbers{grid-template-columns:1fr}.hero,.panel{padding:18px}.loss-banner h1{font-size:34px}}';
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
    ${weekExtraStyles()}
    @media(max-width:560px){.page-shell,.rail{width:calc(100% - 16px);max-width:100%;margin-left:auto;margin-right:auto}.rail{grid-template-columns:repeat(2,minmax(0,1fr))}.day-grid-cards,.account-bars,.account-strip{grid-template-columns:1fr}h1{font-size:34px}.metric strong{font-size:19px}}
  `;
}

async function main() {
  const charts = {};
  await Promise.all(byCode.map(async (stock) => {
    charts[stock.code] = renderTrendSvg(stock, await fetchTrend(stock.code));
  }));

  assert.equal(trades.length,17);
  assert.equal(byCode.length,4);
  assert.equal(Math.round(visibleRealized*100),-54169);
  assert.equal(Math.round(stockByCode.get('000735').realized*100),-468);
  assert.equal(Math.round(stockByCode.get('600865').realized*100),6922);
  assert.equal(Math.round((sellAmount-buyAmount-netCash)*100),9669);
  assert.equal(openPositions.length,1);
  assert.equal(openPositions[0].openQty,1000);
  assert.equal(Math.round(openCost*100),1061700);
  assert.equal(Math.round((netCash + openCost)*100),Math.round(visibleRealized*100));
  for (const row of trades) assert.equal(Math.round(row.price*row.qty*100),Math.round(row.amount*100));
  fs.writeFileSync(path.join(weekDir,"data/trades.json"),JSON.stringify(trades,null,2)+"\n");
  fs.writeFileSync(path.join(weekDir,"data/summary.json"),JSON.stringify({
    range:week.rangeText, tradeCount:trades.length, stockCount:byCode.length,
    buyAmount,sellAmount,turnover,feeTotal,taxTotal,netCash,visibleRealized,openCost,
    stocks:byCode.map(stock=>({code:stock.code,name:stock.name,buyQty:stock.buyQty,sellQty:stock.sellQty,
      realized:+stock.realized.toFixed(2),closedReturn:+(stock.realized/(stock.buyCash-stock.openCost)*100).toFixed(4),
      openQty:stock.openQty,openCost:+stock.openCost.toFixed(2)})),
    accountStatus:"pending",sourceDates:sourceData.reviews.map(r=>r.date),
  },null,2)+"\n");
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
