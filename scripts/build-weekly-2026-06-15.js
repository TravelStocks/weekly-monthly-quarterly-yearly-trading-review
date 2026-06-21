const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "2026-06-15_2026-06-20");
const prevHtml = fs.readFileSync(path.join(root, "2026-06-08_2026-06-12", "index.html"), "utf8");
const style = prevHtml.match(/<style>[\s\S]*?<\/style>/)?.[0] || "";
const extraStyle = `<style>
@media(max-width:720px){
  html,body{overflow-x:hidden}
  .shell,.page,.hero,.panel,.side{min-width:0;max-width:100%}
  .side{position:sticky;top:0;z-index:20;width:100%;display:flex;gap:8px;overflow-x:auto;padding:10px;border-radius:0 0 var(--radius) var(--radius)}
  .side::-webkit-scrollbar{display:none}
  .side h2{display:none}
  .side a{flex:0 0 auto;min-height:38px;padding:8px 10px;white-space:nowrap}
  h1{font-size:24px;line-height:1.18;overflow-wrap:anywhere;word-break:break-all}
  .hero p{font-size:14px;overflow-wrap:anywhere;word-break:break-all}
}
</style>`;

const dailyLinks = {
  "2026-06-15": "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.6.15%20%E5%91%A8%E4%B8%80%EF%BC%89%2B%206.16%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3.html",
  "2026-06-16": "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.6.16%20%E5%91%A8%E4%BA%8C%EF%BC%89%2B%206.17%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3.html",
  "2026-06-17": "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.6.17%20%E5%91%A8%E4%B8%89%EF%BC%89%2B%206.18%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3.html",
  "2026-06-18": "https://travelstocks.github.io/daily-trading-review/pages/%E7%AB%A0%E7%9B%9F%E4%B8%BB%E5%BC%8F%E8%B6%85%E7%9F%AD%E5%85%A8%E6%99%AF%E5%A4%8D%E7%9B%98%EF%BC%882026.6.18%20%E5%91%A8%E5%9B%9B%EF%BC%89%2B%206.22%E4%B8%AA%E8%82%A1%E6%9D%BF%E5%9D%97%E9%A2%84%E6%A1%88%20-%20AI%E6%96%87%E6%A1%A3.html",
};

const priorCost = {
  "600500": { qty: 1900, cost: 15051.15, note: "6/12 期末持仓成本来源：1900 股，中化国际成本价约 7.922。" },
};

const trades = [
  { date: "20260618", time: "10:13:00", code: "600110", name: "诺德股份", side: "买入", qty: 100, price: 17.2, amount: 1720, fees: 5.02, net: -1725.02, balance: 3240.42, market: "上海A股", settle: "20260618" },
  { date: "20260618", time: "10:11:59", code: "600110", name: "诺德股份", side: "买入", qty: 100, price: 17.35, amount: 1735, fees: 5.02, net: -1740.02, balance: 4965.44, market: "上海A股", settle: "20260618" },
  { date: "20260618", time: "10:11:09", code: "600110", name: "诺德股份", side: "买入", qty: 100, price: 17.4, amount: 1740, fees: 5.02, net: -1745.02, balance: 6705.46, market: "上海A股", settle: "20260618" },
  { date: "20260618", time: "10:10:52", code: "600110", name: "诺德股份", side: "买入", qty: 100, price: 17.35, amount: 1735, fees: 5.02, net: -1740.02, balance: 8450.48, market: "上海A股", settle: "20260618" },
  { date: "20260618", time: "09:47:15", code: "600110", name: "诺德股份", side: "买入", qty: 100, price: 17.5, amount: 1750, fees: 5.02, net: -1755.02, balance: 10190.5, market: "上海A股", settle: "20260618" },
  { date: "20260618", time: "09:47:06", code: "600110", name: "诺德股份", side: "买入", qty: 100, price: 17.48, amount: 1748, fees: 5.02, net: -1753.02, balance: 11945.52, market: "上海A股", settle: "20260618" },
  { date: "20260618", time: "09:46:27", code: "600110", name: "诺德股份", side: "买入", qty: 100, price: 17.53, amount: 1753, fees: 5.02, net: -1758.02, balance: 13698.54, market: "上海A股", settle: "20260618" },
  { date: "20260618", time: "09:46:22", code: "600110", name: "诺德股份", side: "买入", qty: 200, price: 17.6, amount: 3520, fees: 5.04, net: -3525.04, balance: 15456.56, market: "上海A股", settle: "20260618" },
  { date: "20260618", time: "09:36:49", code: "600110", name: "诺德股份", side: "买入", qty: 200, price: 17.62, amount: 3524, fees: 5.04, net: -3529.04, balance: 18981.6, market: "上海A股", settle: "20260618" },
  { date: "20260618", time: "09:36:20", code: "002636", name: "金安国纪", side: "卖出", qty: 100, price: 96.16, amount: 9616, fees: 9.81, net: 9606.19, balance: 22510.64, market: "深圳A股", settle: "20260618" },
  { date: "20260618", time: "09:32:44", code: "002119", name: "康强电子", side: "卖出", qty: 100, price: 33.51, amount: 3351, fees: 6.68, net: 3344.32, balance: 12904.45, market: "深圳A股", settle: "20260618" },
  { date: "20260618", time: "09:31:13", code: "002741", name: "光华科技", side: "卖出", qty: 200, price: 40.58, amount: 8116, fees: 9.06, net: 8106.94, balance: 9560.13, market: "深圳A股", settle: "20260618" },
  { date: "20260617", time: "14:56:38", code: "002636", name: "金安国纪", side: "买入", qty: 100, price: 95.59, amount: 9559, fees: 5, net: -9564, balance: 1451.89, market: "深圳A股", settle: "20260617" },
  { date: "20260617", time: "14:54:33", code: "002119", name: "康强电子", side: "买入", qty: 100, price: 33.26, amount: 3326, fees: 5, net: -3331, balance: 11015.89, market: "深圳A股", settle: "20260617" },
  { date: "20260617", time: "10:02:00", code: "002741", name: "光华科技", side: "买入", qty: 200, price: 39.44, amount: 7888, fees: 5, net: -7893, balance: 14346.89, market: "深圳A股", settle: "20260617" },
  { date: "20260615", time: "09:32:00", code: "600500", name: "中化国际", side: "卖出", qty: 1900, price: 7.6, amount: 14440, fees: 12.36, net: 14427.64, balance: 22239.89, market: "上海A股", settle: "20260615" },
];

const dailyCards = [
  {
    date: "2026-06-15",
    title: "周一：中化离场，科技趋势启动被低估",
    tag: "结构修复",
    trade: "卖出中化国际 1900 股。",
    source: [
      "指数超级大阳线直接修复到 4100 压力位，短线连板高度仍受压，赚钱效应切到科技反包、PCB/铜箔/覆铜板和机构趋势大票。",
      "短线情绪处于高潮期，但不是连板接力主升，首板大爆发后明日更适合等待强分化确认核心趋势龙。",
      "真正的问题不是止损，而是低估科技趋势启动速度，后续要从连板高度思维切到机构趋势龙筛选。",
    ],
    analysis: "这一天本周交易动作很简单：处理上周中化持仓。复盘价值不在卖出本身，而在于市场风格已经从连板高度转到科技趋势，后续选股应该先看趋势核心、容量核心和行业地位。",
  },
  {
    date: "2026-06-16",
    title: "周二：无成交，空仓是纪律胜利",
    tag: "高位分化",
    trade: "无交割单成交记录。",
    source: [
      "连续三天放量高潮后，指数高位十字抗跌，赚钱效应仍牢牢锁在科技硬件产业链和机构趋势核心，不在纯连板聚焦。",
      "情绪仍属高潮期但较昨日降温，明日关键不是追一致，而是等强分化后筛最抗跌核心。",
      "今天最关键的不是没赚钱，而是没有因为踏空烦躁去追高，空仓本身是纪律胜利。",
    ],
    analysis: "无成交本身是好动作。强趋势启动后，容易因为踏空焦虑去追一致，但这天更适合等分化后确认核心。后续计划表要提前画好趋势票低吸位，而不是盘中临时追。",
  },
  {
    date: "2026-06-17",
    title: "周三：切入科技链，但核心级别仍要再筛",
    tag: "趋势主升",
    trade: "买入光华科技、康强电子、金安国纪。",
    source: [
      "市场表面跌多涨少，但科技内部狂欢，趋势主升正在形成；连板高度没有突破，资金更偏爱产业链趋势和分支情绪龙。",
      "6月17日三表给出高潮期，但腾落数显示不是普涨，而是科技主线的结构性主升。",
      "真正该赚的钱是科技趋势启动的前两天，这次核心问题是介入太慢。",
    ],
    analysis: "三只票都围绕科技链分支展开，方向贴合当日赚钱效应。但这一天的核心提醒是：趋势票不能只看强不强，还要看谁是行业地位最高、谁最抗跌、谁最先回拉。",
  },
  {
    date: "2026-06-18",
    title: "周四：卖出科技试错，重仓切入诺德",
    tag: "强分歧小退潮",
    trade: "卖出光华科技、康强电子、金安国纪；分批买入诺德股份 1100 股。",
    source: [
      "节前最后一天极致分化，科技股继续做趋势抱团，传统白酒、消费、银行、煤炭拖累沪指翻绿。",
      "用户口径把今天定义为强分歧小退潮，不是科技主线结束。",
      "今天是典型的选对了诺德，但没做对模式和仓位。",
      "分化行情之后，更应该回到机构超级核心，而不是去杂毛和边缘后排里找安全感。",
    ],
    analysis: "这天的方向选择更接近机构趋势核心。账户表已补后可倒推出诺德小浮盈，但原文里已经提示“选对了诺德，但没做对模式和仓位”，所以下一版要重点拆买点、仓位和下周防守预案。",
  },
  {
    date: "2026-06-19",
    title: "周五：资料待确认",
    tag: "待补",
    trade: "截图无 6/19 交割记录，daily-trading-review 暂未找到 6/19 页面。",
    source: [
      "本日暂无可引用的个人每日复盘页面。",
      "若当天休市或无交易，后续只需确认即可。",
    ],
    analysis: "先不强行补结论。等你确认 6/19 是否休市/无成交，或补上当天复盘后，再把这一日归档。",
  },
];

const accountDays = [
  { date: "2026/6/15", weekday: "周一", returnRate: -2.74, pnl: -627, position: 0, total: 22239 },
  { date: "2026/6/16", weekday: "周二", returnRate: 0, pnl: 0, position: 0, total: 22239 },
  { date: "2026/6/17", weekday: "周三", returnRate: 0, pnl: 0, position: 93.7, total: 22239 },
  { date: "2026/6/18", weekday: "周四", returnRate: 1.85, pnl: 409, position: 85, total: 22567 },
];

const stockNotes = {
  "600500": {
    headline: "上周持仓在 6/15 离场，闭环亏损约 -623.51。",
    bullets: ["中化国际卖出来自上一周期末持仓，本页只统计卖出与成本衔接。", "它不是本周新开核心，分析重点是把遗留仓位处理干净，不让旧仓影响新周判断。"],
  },
  "002741": {
    headline: "光华科技隔日卖出，闭环约 +213.94。",
    bullets: ["方向属于科技链分支，赚钱但幅度不大。", "后续趋势票要继续筛行业地位、抗跌性和是否为最先回拉的核心。"],
  },
  "002119": {
    headline: "康强电子小仓试错，闭环约 +13.32。",
    bullets: ["这笔更像小仓验证，不应升级为重仓模式。", "若作为科技趋势链参与，必须确认它相对同题材标的的唯一性。"],
  },
  "002636": {
    headline: "金安国纪隔日小赚，闭环约 +42.19。",
    bullets: ["尾盘介入、次日快速处理，纪律上没有扩大风险。", "但它仍需要被放进同题材比较，不能只看单票强度。"],
  },
  "600110": {
    headline: "诺德股份为期末持仓，1100 股，按账户表倒推浮盈约 +56.36。",
    bullets: ["每日复盘源里明确写到：选对了诺德，但模式和仓位需要复盘。", "这笔是下一轮二次反思重点：是否机构超级核心、买点是否过急、仓位是否过重、下周止损预案是否清晰。"],
  },
};

const secids = {
  "600500": "1.600500",
  "002741": "0.002741",
  "002119": "0.002119",
  "002636": "0.002636",
  "600110": "1.600110",
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n) {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(n) {
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function cnDate(date) {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

function trendTime(date, time) {
  return `${cnDate(date)} ${time.slice(0, 5)}`;
}

async function fetchTrend(code) {
  const url = `https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=${secids[code]}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f53&iscr=0&iscca=0&ut=fa5fd1943c7b386f172d6893dbfba10b&ndays=5`;
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    const json = await res.json();
    return (json?.data?.trends || []).map((row) => {
      const [time, price] = row.split(",");
      return { time, price: Number(price) };
    }).filter((item) => Number.isFinite(item.price));
  } catch (error) {
    console.warn(`trend fetch failed for ${code}: ${error.message}`);
    return [];
  }
}

function nearestIndex(data, time) {
  if (!data.length) return -1;
  let exact = data.findIndex((d) => d.time === time);
  if (exact >= 0) return exact;
  const target = new Date(time.replace(" ", "T")).getTime();
  let best = 0;
  let bestDelta = Infinity;
  data.forEach((d, i) => {
    const delta = Math.abs(new Date(d.time.replace(" ", "T")).getTime() - target);
    if (delta < bestDelta) {
      best = i;
      bestDelta = delta;
    }
  });
  return best;
}

function renderChart(stock, trend) {
  const stockTrades = trades.filter((trade) => trade.code === stock.code).slice().reverse();
  if (!trend.length) {
    return `<div class="trade-map"><p>分钟线暂未拉取成功，买卖点以成交列表为准。</p></div>`;
  }
  const width = 876;
  const height = 290;
  const left = 52;
  const right = 24;
  const top = 24;
  const bottom = 38;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const prices = trend.map((d) => d.price);
  const markerPrices = stockTrades.map((t) => t.price);
  let min = Math.min(...prices, ...markerPrices);
  let max = Math.max(...prices, ...markerPrices);
  const pad = Math.max((max - min) * 0.12, max * 0.006);
  min -= pad;
  max += pad;
  const x = (i) => left + (i / Math.max(1, trend.length - 1)) * plotW;
  const y = (price) => top + ((max - price) / Math.max(0.0001, max - min)) * plotH;
  const markerIndexes = new Set(stockTrades.map((trade) => nearestIndex(trend, trendTime(trade.date, trade.time))).filter((i) => i >= 0));
  const points = trend
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % 3 === 0 || markerIndexes.has(i) || i === trend.length - 1)
    .map(({ d, i }) => `${x(i).toFixed(1)},${y(d.price).toFixed(1)}`)
    .join(" ");
  const markers = stockTrades.map((trade, idx) => {
    const i = nearestIndex(trend, trendTime(trade.date, trade.time));
    if (i < 0) return "";
    const mx = x(i);
    const my = y(trade.price);
    const isBuy = trade.side.includes("买");
    const labelY = Math.max(14, my - 12 - (idx % 4) * 10);
    const labelX = Math.min(width - 30, Math.max(30, mx + ((idx % 3) - 1) * 16));
    const shape = isBuy
      ? `<path d="M ${mx.toFixed(1)} ${(my - 8).toFixed(1)} L ${(mx - 7).toFixed(1)} ${(my + 6).toFixed(1)} L ${(mx + 7).toFixed(1)} ${(my + 6).toFixed(1)} Z" fill="#d04a34" stroke="#fff" stroke-width="2"></path>`
      : `<path d="M ${mx.toFixed(1)} ${(my + 8).toFixed(1)} L ${(mx - 7).toFixed(1)} ${(my - 6).toFixed(1)} L ${(mx + 7).toFixed(1)} ${(my - 6).toFixed(1)} Z" fill="#1d4ed8" stroke="#fff" stroke-width="2"></path>`;
    return `<g><title>${esc(stock.name)} ${esc(trade.side)} ${cnDate(trade.date)} ${trade.time} ${trade.price.toFixed(3)} / ${trade.qty}股</title><line x1="${mx.toFixed(1)}" x2="${mx.toFixed(1)}" y1="${my.toFixed(1)}" y2="${height - bottom}" stroke="rgba(28,37,48,.18)" stroke-dasharray="3 5"></line>${shape}<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" class="point-label">${isBuy ? "B" : "S"}</text></g>`;
  }).join("");
  const dateStart = trend[0].time.slice(5, 16);
  const dateEnd = trend[trend.length - 1].time.slice(5, 16);
  const pointList = stockTrades.map((trade) => `<div class="trade-point-item"><span><b class="${trade.side.includes("买") ? "buy" : "sell"}">${esc(trade.side)}</b> ${cnDate(trade.date).slice(5)} ${trade.time}</span><strong>${trade.price.toFixed(3)} / ${trade.qty.toLocaleString("en-US")} 股</strong></div>`).join("");
  return `<div class="trade-map"><div class="trade-map-head"><h4>5 日分钟线买卖点</h4><div class="trade-legend"><span class="legend-item"><i class="legend-shape buy"></i>买入</span><span class="legend-item"><i class="legend-shape sell"></i>卖出</span></div></div><div class="trade-chart-wrap"><svg class="trade-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(stock.name)}分钟走势与买卖点"><defs><linearGradient id="area-${stock.code}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#14a37f" stop-opacity=".18"></stop><stop offset="100%" stop-color="#14a37f" stop-opacity="0"></stop></linearGradient></defs><rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="#fff"></rect><line x1="${left}" x2="${width - right}" y1="${height - bottom}" y2="${height - bottom}" stroke="#e5e7eb"></line><line x1="${left}" x2="${width - right}" y1="${top}" y2="${top}" stroke="#edf0f3"></line><text x="${left}" y="17" class="axis-label">高 ${max.toFixed(2)}</text><text x="${width - right}" y="17" text-anchor="end" class="axis-label">低 ${min.toFixed(2)}</text><polyline points="${points}" class="market-line"></polyline>${markers}<text x="${left}" y="${height - 10}" text-anchor="start" class="axis-label">${esc(dateStart)}</text><text x="${width - right}" y="${height - 10}" text-anchor="end" class="axis-label">${esc(dateEnd)}</text></svg></div><div class="trade-point-list">${pointList}</div></div>`;
}

function calcStockStats() {
  const stats = {};
  for (const trade of trades.slice().reverse()) {
    stats[trade.code] ||= { code: trade.code, name: trade.name, buyQty: 0, buyCost: 0, sellQty: 0, sellNet: 0, realized: 0, openQty: 0, openCost: 0 };
    const s = stats[trade.code];
    if (trade.side.includes("买")) {
      s.buyQty += trade.qty;
      s.buyCost += Math.abs(trade.net);
      s.openQty += trade.qty;
      s.openCost += Math.abs(trade.net);
    } else {
      s.sellQty += trade.qty;
      s.sellNet += trade.net;
      if (priorCost[trade.code] && s.openQty === 0) {
        s.realized += trade.net - priorCost[trade.code].cost;
      } else if (s.openQty > 0) {
        const avgCost = s.openCost / s.openQty;
        const cost = avgCost * trade.qty;
        s.realized += trade.net - cost;
        s.openQty -= trade.qty;
        s.openCost -= cost;
      }
    }
  }
  return Object.values(stats);
}

function renderDailyCards() {
  return dailyCards.map((day) => {
    const link = dailyLinks[day.date] ? `<a href="${dailyLinks[day.date]}" target="_blank" rel="noopener">查看每日原文</a>` : `<span>原文待补</span>`;
    return `<article class="day-card"><div class="day-head"><div><h3>${esc(day.date)} ${esc(day.title)}</h3><p>${esc(day.trade)}</p></div><span class="chip ${day.tag === "待补" ? "warn" : ""}">${esc(day.tag)}</span></div><div class="raw-note"><h4>每日复盘来源摘录</h4><ul>${day.source.map((item) => `<li>${esc(item)}</li>`).join("")}</ul><h4>Codex 周度归纳</h4><p>${esc(day.analysis)}</p><p>${link}</p></div></article>`;
  }).join("");
}

function renderStockCards(trends) {
  const stats = calcStockStats();
  const order = ["600110", "600500", "002741", "002119", "002636"];
  return order.map((code) => {
    const s = stats.find((item) => item.code === code) || { code, name: trades.find((t) => t.code === code)?.name || code, realized: 0, openQty: 0, buyQty: 0, sellQty: 0 };
    const note = stockNotes[code];
    const realizedLabel = code === "600110" ? "倒推 +56.36" : (s.openQty > 0 ? "持仓待确认" : (s.realized >= 0 ? `+${money(s.realized)}` : `-${money(Math.abs(s.realized))}`));
    const chipClass = code === "600110" ? "pos" : (s.openQty > 0 ? "warn" : (s.realized >= 0 ? "pos" : "neg"));
    const stock = { code, name: s.name };
    return `<article class="stock-card"><div class="stock-top"><div><h3>${esc(s.name)}</h3><p>${esc(code)} · 买入 ${s.buyQty || 0} 股 / 卖出 ${s.sellQty || 0} 股${s.openQty ? ` / 未平 ${s.openQty} 股` : ""}</p></div><span class="chip ${chipClass}">${esc(realizedLabel)}</span></div><p><strong>${esc(note.headline)}</strong></p><ul class="trade-context">${note.bullets.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>${renderChart(stock, trends[code] || [])}</article>`;
  }).join("");
}

function renderTradeTable() {
  return `<details open><summary>展开 / 收起交割单明细（已隐藏合同号、成交编号等敏感字段）</summary><div class="table-wrap"><table><thead><tr><th>成交日期</th><th>成交时间</th><th>证券代码</th><th>证券名称</th><th>操作</th><th>成交数量</th><th>成交均价</th><th>成交金额</th><th>费用税费</th><th>发生金额</th><th>资金余额</th><th>交易市场</th><th>交收日期</th></tr></thead><tbody>${trades.map((trade) => `<tr><td>${trade.date}</td><td>${trade.time}</td><td>${trade.code}</td><td>${esc(trade.name)}</td><td><span class="side-tag ${trade.side.includes("买") ? "buy" : "sell"}">${esc(trade.side)}</span></td><td>${trade.qty.toLocaleString("en-US")}</td><td>${trade.price.toFixed(3)}</td><td>${money(trade.amount)}</td><td>${money(trade.fees)}</td><td class="${trade.net < 0 ? "neg" : "pos"}">${trade.net < 0 ? "-" : "+"}${money(Math.abs(trade.net))}</td><td>${money(trade.balance)}</td><td>${esc(trade.market)}</td><td>${trade.settle}</td></tr>`).join("")}</tbody></table></div></details>`;
}

function replaceOnce(text, pattern, replacement, label) {
  const next = text.replace(pattern, replacement);
  if (next === text) console.warn(`replace did not match: ${label}`);
  return next;
}

function updateIndexes() {
  const newRootLatest = `<article class="metric"><span>周度归档</span><strong>7</strong><small>已发布周复盘</small></article><article class="metric"><span>最新区间</span><strong>06.15</strong><small>至 06.20</small></article><article class="metric"><span>最新账户</span><strong class="neg">约 -299</strong><small>6/15-6/18 账户口径</small></article><article class="metric"><span>长期结构</span><strong>3 个主页</strong><small>周度 / 月季 / 年度</small></article>`;
  const rootPath = path.join(root, "index.html");
  let rootHtml = fs.readFileSync(rootPath, "utf8");
  rootHtml = replaceOnce(rootHtml, /<article class="metric"><span>周度归档<\/span>[\s\S]*?<span>长期结构<\/span><strong>3 个主页<\/strong><small>周度 \/ 月季 \/ 年度<\/small><\/article>/, newRootLatest, "root metrics");
  rootHtml = replaceOnce(rootHtml, /<span>周报 <b>.*?<\/b><\/span><span>最新 <b>.*?<\/b><\/span><span>状态 <b>.*?<\/b><\/span>/, `<span>周报 <b>7 篇</b></span><span>最新 <b>06.15-06.20</b></span><span>状态 <b>新周草稿</b></span>`, "root weekly card");
  fs.writeFileSync(rootPath, rootHtml, "utf8");

  const hubPath = path.join(root, "weekly-trading-review", "index.html");
  let hub = fs.readFileSync(hubPath, "utf8");
  hub = replaceOnce(hub, /href="\.\.\/2026-06-08_2026-06-12\/">进入最新周复盘/, `href="../2026-06-15_2026-06-20/">进入最新周复盘`, "hub latest button");
  hub = replaceOnce(hub, /<article class="metric"><span>周报数量<\/span>[\s\S]*?<span>最新规则<\/span><strong>.*?<\/strong><small>.*?<\/small><\/article>/, `<article class="metric"><span>周报数量</span><strong>7</strong><small>已归档周数</small></article><article class="metric"><span>最新区间</span><strong>06.15</strong><small>至 06.20</small></article><article class="metric"><span>最新账户</span><strong class="neg">约 -299</strong><small>6/15-6/18 账户口径</small></article><article class="metric"><span>最新规则</span><strong>趋势核心</strong><small>机构核心与唯一性确认</small></article>`, "hub metrics");
  const latestPanel = `<section class="panel"><h2>最新周复盘</h2><a class="week-card" href="../2026-06-15_2026-06-20/"><div class="week-head"><h3>2026.06.15 - 2026.06.20</h3><span class="chip">草稿版</span></div><p>本周先根据交割单截图、账户表和 daily-trading-review 的 6/15-6/18 每日复盘做第一版。核心暂定为：从连板高度思维切到机构趋势核心筛选，诺德股份为期末持仓。</p><div class="mini-grid"><span>成交 <b>16 笔</b></span><span>账户 <b>约 -299</b></span><span>资料 <b>二次反思待补</b></span></div></a></section>`;
  hub = replaceOnce(hub, /<section class="panel"><h2>最新周复盘<\/h2>[\s\S]*?<\/section><section class="panel"><h2>周度归档<\/h2>/, `${latestPanel}<section class="panel"><h2>周度归档</h2>`, "hub latest panel");
  const newArchiveCard = `<a class="week-card" href="../2026-06-15_2026-06-20/"><div class="week-head"><h3>2026.06.15 - 2026.06.20</h3><span class="chip">草稿版</span></div><p>机构趋势主线确认中，诺德股份期末持仓；每日复盘已引用 6/15-6/18。</p><div class="mini-grid"><span>成交 <b>16 笔</b></span><span>账户 <b>约 -299</b></span><span>状态 <b>二次反思待补</b></span></div></a>`;
  if (!hub.includes(`<div class="archive">${newArchiveCard}`)) {
    hub = replaceOnce(hub, /<div class="archive">/, `<div class="archive">${newArchiveCard}`, "hub archive insert");
  }
  hub = hub.replace(/(<a class="week-card" href="\.\.\/2026-06-08_2026-06-12\/"[\s\S]*?<span class="chip">)最新(<\/span>)/, "$1已发布$2");
  fs.writeFileSync(hubPath, hub, "utf8");
}

async function main() {
  const stats = calcStockStats();
  const totals = {
    trades: trades.length,
    buys: trades.filter((t) => t.side.includes("买")).length,
    sells: trades.filter((t) => t.side.includes("卖")).length,
    stocks: new Set(trades.map((t) => t.code)).size,
    buyGross: trades.filter((t) => t.side.includes("买")).reduce((s, t) => s + t.amount, 0),
    sellGross: trades.filter((t) => t.side.includes("卖")).reduce((s, t) => s + t.amount, 0),
    costs: trades.reduce((s, t) => s + t.fees, 0),
    realized: stats.reduce((s, t) => s + (t.openQty ? 0 : t.realized), 0),
  };
  const accountStart = accountDays[0].total - accountDays[0].pnl;
  const accountEnd = accountDays[accountDays.length - 1].total;
  const accountPnl = accountEnd - accountStart;
  const accountReturn = (accountPnl / accountStart) * 100;
  const accountDayPnlSum = accountDays.reduce((sum, day) => sum + day.pnl, 0);
  const accountDiff = accountPnl - accountDayPnlSum;
  const finalCash = 3240.42;
  const nordCost = trades.filter((trade) => trade.code === "600110").reduce((sum, trade) => sum + Math.abs(trade.net), 0);
  const nordShares = trades.filter((trade) => trade.code === "600110").reduce((sum, trade) => sum + trade.qty, 0);
  const inferredStockValue = accountEnd - finalCash;
  const inferredNordPrice = inferredStockValue / nordShares;
  const inferredNordPnl = inferredStockValue - nordCost;
  const trends = {};
  for (const code of Object.keys(secids)) {
    trends[code] = await fetchTrend(code);
  }

  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>2026.06.15 - 2026.06.20 每周交割复盘</title>${style}${extraStyle}</head>
<body><main class="shell"><nav class="side" aria-label="周复盘导航"><h2>本周导航</h2><a href="../weekly-trading-review/">周度主页</a><a href="../index.html">总首页</a><a href="#top">本周总览</a><a href="#source">数据口径</a><a href="#account">账户口径</a><a href="#ticket-analysis">盈亏票</a><a href="#daily">逐日复盘</a><a href="#stocks">买卖点图</a><a href="#rules">沉淀规则</a><a href="#trades">成交明细</a><a href="#todo">缺口清单</a></nav>
<div class="page">
<section class="hero" id="top"><div><span class="label">2026.06.15 - 2026.06.20 · 草稿版</span><h1>从连板高度切到机构趋势核心</h1><p>本页先按你给的交割单截图、账户表，以及 daily-trading-review 的 6/15-6/18 个人每日复盘做第一版。账户表已补到 6/18，期末诺德持仓先用“账户总额 + 现金余额”倒推，二次反思等你后面补充后再覆盖正式版。</p></div><div class="hero-side"><article class="metric"><span>账户口径</span><strong class="neg">${accountPnl >= 0 ? "+" : ""}${money(accountPnl)}</strong><small>${accountDays[0].date} - ${accountDays[accountDays.length - 1].date}，约 ${pct(accountReturn)}</small></article><article class="metric"><span>期末核心</span><strong>诺德股份</strong><small>1100 股，倒推浮盈约 ${inferredNordPnl >= 0 ? "+" : ""}${money(inferredNordPnl)}</small></article><article class="metric"><span>日复盘来源</span><strong>4 天</strong><small>6/15-6/18 已找到，6/19 待确认</small></article></div></section>
<section class="metric-grid"><article class="metric"><span>本周成交</span><strong>${totals.trades} 笔</strong><small>买入 ${totals.buys} / 卖出 ${totals.sells}</small></article><article class="metric"><span>涉及标的</span><strong>${totals.stocks} 只</strong><small>中化、光华、康强、金安、诺德</small></article><article class="metric"><span>成交额</span><strong>${money(totals.buyGross + totals.sellGross)}</strong><small>买入 ${money(totals.buyGross)} / 卖出 ${money(totals.sellGross)}</small></article><article class="metric"><span>闭环盈亏</span><strong class="${totals.realized >= 0 ? "pos" : "neg"}">${totals.realized >= 0 ? "+" : ""}${money(totals.realized)}</strong><small>不含诺德持仓浮动盈亏</small></article></section>
<section class="panel source-lock" id="source"><h2>数据口径先锁住</h2><p><strong>本周有效区间：</strong>2026/6/15 - 2026/6/20。你给的截图筛选范围从 2026/6/12 开始，其中 6/12 的中化国际买入和康强电子卖出属于上一周，本页只用 6/12 中化持仓成本做 6/15 卖出闭环衔接，不重复计入本周成交。</p><p class="section-note">成交明细隐藏合同号、成交编号等敏感字段；每日操作与情绪复盘来源于 <a href="https://travelstocks.github.io/daily-trading-review/" target="_blank" rel="noopener">daily-trading-review</a>；分钟走势来自东方财富 5 日分钟接口，仅用于定位买卖点，成交价格仍以交割单为准。</p></section>
<section class="two-col"><article class="panel" id="account"><h2>账户口径</h2><p>按你补的账户表，周一总额 22,239、当日亏损 627，可倒推本周期初约 ${money(accountStart)}；6/18 当前总金额 ${money(accountEnd)}，账户口径本周约 ${accountPnl >= 0 ? "+" : ""}${money(accountPnl)}，约 ${pct(accountReturn)}。日收益金额合计为 ${accountDayPnlSum >= 0 ? "+" : ""}${money(accountDayPnlSum)}，与期初/期末口径存在 ${accountDiff >= 0 ? "+" : ""}${money(accountDiff)} 差异，先按账户总额口径保留。</p><div class="mini-grid"><span>估算期初 <b>${money(accountStart)}</b></span><span>6/18 总额 <b>${money(accountEnd)}</b></span><span>账户收益 <b class="${accountPnl >= 0 ? "pos" : "neg"}">${accountPnl >= 0 ? "+" : ""}${money(accountPnl)}</b></span><span>账户收益率 <b class="${accountReturn >= 0 ? "pos" : "neg"}">${pct(accountReturn)}</b></span><span>日收益合计 <b class="${accountDayPnlSum >= 0 ? "pos" : "neg"}">${accountDayPnlSum >= 0 ? "+" : ""}${money(accountDayPnlSum)}</b></span><span>口径差 <b class="${accountDiff >= 0 ? "pos" : "neg"}">${accountDiff >= 0 ? "+" : ""}${money(accountDiff)}</b></span></div><div class="account-days">${accountDays.map((day) => `<div class="account-day"><strong>${esc(day.date)} ${esc(day.weekday)}</strong><span>收益率 <b class="${day.returnRate >= 0 ? "pos" : "neg"}">${pct(day.returnRate)}</b></span><span>收益 <b class="${day.pnl >= 0 ? "pos" : "neg"}">${day.pnl >= 0 ? "+" : ""}${money(day.pnl)}</b></span><span>仓位 <b>${day.position.toFixed(2)}%</b></span><span>总额 <b>${money(day.total)}</b></span></div>`).join("")}</div></article><article class="panel"><h2>先版结论</h2><ul class="takeaways"><li>本周成交集中在 5 只票，数量是收敛的，符合“少做、只做核心”的方向。</li><li>每日复盘显示，市场赚钱效应正在从纯连板高度切到科技硬件、机构趋势、容量核心和分支情绪龙。</li><li>中化国际是上周持仓卖出，本周闭环亏损约 -623.51；光华、康强、金安三只科技链小闭环合计约 +269.45。</li><li>诺德股份是本周真正需要二次反思的核心持仓：账户表倒推 6/18 持仓浮盈约 ${inferredNordPnl >= 0 ? "+" : ""}${money(inferredNordPnl)}，但方向、买点、仓位和下周止损预案都要等你的二次反思再定稿。</li></ul></article></section>
<section class="two-col"><article class="panel"><h2>闭环贡献</h2><p class="section-note">只统计已平仓且能由交割单/上周期末成本推算的部分；诺德股份未平仓，暂不计入闭环。</p><div class="bar-list">${stats.filter((s) => !s.openQty).map((s) => {
    const width = Math.max(12, Math.min(100, Math.abs(s.realized) / 623.51 * 100));
    return `<div class="bar-row"><div class="bar-meta"><span>${esc(s.name)} ${s.code}</span><strong class="${s.realized >= 0 ? "pos" : "neg"}">${s.realized >= 0 ? "+" : ""}${money(s.realized)}</strong></div><div class="bar-track"><span class="${s.realized < 0 ? "neg" : ""}" style="width:${width.toFixed(1)}%"></span></div><p>${esc(stockNotes[s.code]?.headline || "")}</p></div>`;
  }).join("")}</div></article><article class="panel"><h2>期末持仓推算</h2><p class="section-note">根据 6/18 交割单，诺德股份合计买入 ${nordShares.toLocaleString("en-US")} 股，现金成本 ${money(nordCost)}。用 6/18 账户总额 ${money(accountEnd)} 减现金余额 ${money(finalCash)}，可倒推股票市值约 ${money(inferredStockValue)}，对应价格约 ${inferredNordPrice.toFixed(3)}，持仓浮盈约 ${inferredNordPnl >= 0 ? "+" : ""}${money(inferredNordPnl)}。若后续有正式持仓截图，再以截图为准。</p><div class="mini-grid"><span>持仓股票 <b>诺德股份</b></span><span>持股数量 <b>${nordShares.toLocaleString("en-US")} 股</b></span><span>成交均价 <b>17.477</b></span><span>含费成本 <b>${money(nordCost)}</b></span><span>倒推市值 <b>${money(inferredStockValue)}</b></span><span>倒推浮盈 <b class="${inferredNordPnl >= 0 ? "pos" : "neg"}">${inferredNordPnl >= 0 ? "+" : ""}${money(inferredNordPnl)}</b></span><span>现金余额 <b>${money(finalCash)}</b></span><span>期末仓位 <b>约 85.66%</b></span></div></article></section>
<section class="panel" id="ticket-analysis"><h2>本周赚钱/亏损主要票及其分析</h2><p class="section-note">这是缺少二次反思前的第一版归因，后续会用你的二次反思覆盖成正式版。</p><div class="rule-grid"><article class="rule-card"><h3>中化国际 600500</h3><p><strong class="neg">主要已实现亏损：</strong>6/15 卖出 1900 股，结合 6/12 成本，闭环约 -623.51。</p><p>这笔属于上一周遗留仓位处理，不是本周主动新开错误。复盘重点是：新周第一天先清理旧仓，避免旧票拖累新的主线判断。</p></article><article class="rule-card"><h3>光华科技 002741</h3><p><strong class="pos">闭环盈利：</strong>6/17 买入、6/18 卖出，约 +213.94。</p><p>方向贴近科技链，但后续要继续用“趋势第一名、行业地位、抗跌和最先回拉”筛选，而不是只看当日强度。</p></article><article class="rule-card"><h3>康强电子 002119</h3><p><strong class="pos">小仓验证：</strong>闭环约 +13.32。</p><p>这笔更像验证仓，不是重仓模式。混沌或分化时，赚钱的小票也不能自动升级成核心票。</p></article><article class="rule-card"><h3>金安国纪 002636</h3><p><strong class="pos">隔日小赚：</strong>闭环约 +42.19。</p><p>尾盘买、次日卖，执行没有扩大风险；但仍需要放进同题材排序里判断它是不是第一性与唯一性。</p></article><article class="rule-card"><h3>诺德股份 600110</h3><p><strong class="pos">期末持仓倒推小浮盈：</strong>买入 1100 股，现金成本 19,270.22；按账户表倒推市值约 19,326.58，浮盈约 +56.36。</p><p>每日复盘原文已经给出关键句：选对了诺德，但没做对模式和仓位。后续二次反思要重点拆：买点是否过急、仓位是否过重、下周止损点在哪里。</p></article></div></section>
<section class="panel" id="daily"><h2>逐日操作&情绪复盘</h2><p class="section-note">以下每日内容来自你的个人每日复盘站，Codex 只做周度归纳，不把它包装成你已经确认的二次反思。</p><div class="day-list">${renderDailyCards()}</div></section>
<section class="panel" id="stocks"><h2>重点走势图</h2><p class="section-note">用分钟线标出本周所有实际买卖过的股票。图是为了直观看买卖点和前后走势，不替代成交单。</p><div class="stock-grid">${renderStockCards(trends)}</div></section>
<section class="panel" id="rules"><h2>本周先沉淀规则</h2><p class="section-note">这些是从每日复盘与交割单里先提取出的临时规则，等你补二次反思后再合并。</p><div class="rule-grid"><article class="rule-card"><h3>趋势第一名</h3><p>从连板高度思维切到机构趋势龙筛选：先看行业地位，再看抗跌性和最先回拉。</p></article><article class="rule-card"><h3>等强分化</h3><p>高潮后不追一致，等强分化后筛最抗跌核心；空仓不是错，乱追才是错。</p></article><article class="rule-card"><h3>计划低吸位</h3><p>机构趋势票要前一晚画好低吸位，不能盘中临时靠感觉追高。</p></article><article class="rule-card"><h3>二次确认仓位</h3><p>像诺德这种机构超级核心，方向对不等于仓位对，买点和止损必须写清楚。</p></article><article class="rule-card"><h3>旧仓先处理</h3><p>跨周旧仓先按计划处理，不让遗留票干扰新主线。</p></article><article class="rule-card"><h3>非核心不重仓</h3><p>科技链分支小赚可以接受，但不能因为小赚就把它当成核心龙头。</p></article><article class="rule-card"><h3>强分歧不结束</h3><p>强分歧小退潮不等于主线结束，关键是分歧后谁还能被资金抱团。</p></article><article class="rule-card"><h3>先手优先</h3><p>趋势启动的前两天才是最舒服的钱，后续必须提升主线启动识别速度。</p></article></div></section>
<section class="panel" id="trades"><h2>成交明细</h2>${renderTradeTable()}</section>
<section class="panel" id="todo"><h2>缺口清单</h2><div class="todo-grid"><article class="todo-card"><h3>还需要你补</h3><ul><li>6/19 是否休市/无成交，或当天个人每日复盘链接。</li><li>如果有正式持仓截图，可用截图替换诺德股份倒推口径。</li><li>本周二次反思和主要票情绪分析。</li></ul></article><article class="todo-card"><h3>已完成</h3><ul><li>交割单截图中本周 16 笔成交已录入。</li><li>账户表 6/15-6/18 已补入。</li><li>所有成交过股票均已做买卖点分钟图。</li><li>6/15-6/18 每日操作&情绪复盘已从 daily-trading-review 引入。</li><li>成交明细已隐藏合同号、成交编号。</li></ul></article><article class="todo-card"><h3>下版优先更新</h3><ul><li>确认 6/19 是否需要一张空白/休市日卡片。</li><li>把“本周赚钱/亏损主要票”改成你的正式二次反思口径。</li><li>根据二次反思重写下周操作纪律。</li></ul></article></div></section>
</div></main></body></html>`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  updateIndexes();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
