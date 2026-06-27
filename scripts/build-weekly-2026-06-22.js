const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "2026-06-22_2026-06-26");
const prevHtml = fs.readFileSync(path.join(root, "2026-06-15_2026-06-20", "index.html"), "utf8");
const style = prevHtml.match(/<style>[\s\S]*?<\/style>/)?.[0] || "";
const extraStyle = `<style>
.account-day{grid-template-columns:104px minmax(132px,1.4fr) repeat(5,minmax(76px,1fr))}
.account-day span{font-size:11.5px}
@media(max-width:1120px){
  .account-day{grid-template-columns:108px minmax(150px,1.4fr) repeat(5,minmax(82px,1fr))}
}
@media(max-width:720px){
  html,body{overflow-x:hidden}
  .shell,.page,.hero,.panel,.side{min-width:0;max-width:100%}
  .side{position:sticky;top:0;z-index:20;width:100%;display:flex;gap:8px;overflow-x:auto;padding:10px;border-radius:0 0 var(--radius) var(--radius)}
  .side::-webkit-scrollbar{display:none}
  .side h2{display:none}
  .side a{flex:0 0 auto;min-height:38px;padding:8px 10px;white-space:nowrap}
  .account-day{grid-template-columns:1fr 1fr}
  .account-day strong{grid-column:1/-1}
  h1{font-size:24px;line-height:1.18;overflow-wrap:anywhere;word-break:break-all}
  .hero p{font-size:14px;overflow-wrap:anywhere;word-break:break-all}
}
</style>`;

const dailyLinks = {};

const priorCost = {
  "600110": { qty: 1100, cost: 19270.22, note: "6/18 期末诺德股份持仓成本：1100 股，含费成本 19,270.22。" },
};

const trades = [
  { date: "20260625", time: "09:52:06", code: "600226", name: "亨通股份", side: "买入", qty: 300, price: 11.3, amount: 3390, fees: 5.03, net: -3395.03, balance: 272.22, market: "上海A股", settle: "20260625" },
  { date: "20260625", time: "09:48:01", code: "600487", name: "亨通光电", side: "买入", qty: 100, price: 121.43, amount: 12143, fees: 5.12, net: -12148.12, balance: 3667.25, market: "上海A股", settle: "20260625" },
  { date: "20260625", time: "09:43:57", code: "601991", name: "大唐发电", side: "卖出", qty: 2000, price: 7.84, amount: 15680, fees: 12.84, net: 15667, balance: 15815.37, market: "上海A股", settle: "20260625" },
  { date: "20260625", time: "09:43:28", code: "600226", name: "亨通股份", side: "买入", qty: 300, price: 11.55, amount: 3465, fees: 5.03, net: -3470.03, balance: 148.37, market: "上海A股", settle: "20260625" },
  { date: "20260625", time: "09:31:06", code: "600851", name: "海欣股份", side: "卖出", qty: 300, price: 9.8, amount: 2940, fees: 6.5, net: 2933.5, balance: 3618.4, market: "上海A股", settle: "20260625" },
  { date: "20260624", time: "14:56:58", code: "601991", name: "大唐发电", side: "买入", qty: 2000, price: 7.83, amount: 15660, fees: 5.16, net: -15665.16, balance: 684.9, market: "上海A股", settle: "20260624" },
  { date: "20260624", time: "13:45:17", code: "600851", name: "海欣股份", side: "买入", qty: 300, price: 10.69, amount: 3207, fees: 5.03, net: -3212.03, balance: 28.39, market: "上海A股", settle: "20260624" },
  { date: "20260624", time: "10:08:37", code: "600110", name: "诺德股份", side: "卖出", qty: 1100, price: 14.85, amount: 16335, fees: 13.33, net: 16321.67, balance: 16350.06, market: "上海A股", settle: "20260624" },
];

const dailyCards = [
  {
    date: "2026-06-22",
    title: "周一：资料待补，先保留空位",
    tag: "待补",
    trade: "截图范围内无 6/22 交割记录；是否无交易待确认。",
    source: [
      "本日没有可引用的交割单截图和个人二次反思。",
      "如果当天无交易，后续只需补一句确认；如果有复盘内容，再替换为正式卡片。",
    ],
    analysis: "这一日先不强行写结论，避免把后面的交易结果倒推回当天。",
  },
  {
    date: "2026-06-23",
    title: "周二：冰点期，科技仍有局部强度",
    tag: "冰点期",
    trade: "截图范围内无 6/23 交割记录。",
    source: [
      "沪指 4106.25，深指 15854.20，创业板 4192.19，科创 1916.21，两市成交约 34,408 亿。",
      "情绪数据标记为冰点期，涨停 94、跌停 39、炸板 48，封板率 66%。",
      "板块强度里芯片 +9,251、通信 +5,370、算力 +4,374；同花顺热榜持续出现长电科技、大唐发电、亨通光电等科技/电力容量票。",
    ],
    analysis: "从已有数据看，这天是情绪冰点但科技链仍有承接。没有成交不一定是问题，关键是隔天从诺德切出后，是否把仓位切到更强的主线容量核心。",
  },
  {
    date: "2026-06-24",
    title: "周三：止损诺德，切到海欣和大唐",
    tag: "切仓日",
    trade: "卖出诺德股份 1100 股；买入海欣股份 300 股、大唐发电 2000 股。",
    source: [
      "诺德股份以 14.850 卖出 1100 股，承接上一周含费成本后闭环约 -2,948.55。",
      "海欣股份 13:45 买入 300 股，成交均价 10.690；大唐发电 14:56 买入 2000 股，成交均价 7.830。",
      "这一天的核心不是交易笔数，而是从上一周重仓核心里撤退，并立刻切到新的轮动方向。",
    ],
    analysis: "诺德是本周最大亏损源。切仓动作本身是必要的，但后续买入海欣、大唐是否有足够主线级别和次日溢价，需要你补二次反思后再定稿。",
  },
  {
    date: "2026-06-25",
    title: "周四：止损海欣，打平大唐，切入亨通系",
    tag: "科技回流",
    trade: "卖出海欣股份、大唐发电；买入亨通光电 100 股、亨通股份 600 股。",
    source: [
      "沪指 4120.28，深指 16344.08，创业板 4371.99，科创 2066.33，两市成交约 35,943 亿。",
      "涨停 85、跌停 17、炸板 31，封板率 73%；宽度为涨 1199、跌 3940，指数与个股体感分化。",
      "板块强度里芯片 +17,645、通信 +12,359、元器件 +8,398、算力 +5,904；同花顺热榜里京东方A、长电科技、亨通光电仍在前排。",
      "海欣股份闭环约 -278.53，大唐发电闭环约 +1.84；期末转入亨通光电与亨通股份。",
    ],
    analysis: "这天交易重新回到芯片/通信/元器件这一条强线，方向比海欣更贴近当日资金强度。问题留给下一版：亨通光电是趋势核心，亨通股份更像低价弹性，二者仓位和预期不能混成一笔。",
  },
  {
    date: "2026-06-26",
    title: "周五：资料待补，等待收盘与账户截图",
    tag: "待补",
    trade: "暂无 6/26 交割单、账户截图和个人复盘。",
    source: [
      "本页当前只做到 6/25 的截图口径。",
      "6/26 的持仓去留、最终权益、当周收益率和二次反思均待补。",
    ],
    analysis: "先保留空位，等你补完今天的交割单和账户截图后，再把本周从草稿版升级为正式版。",
  },
];

const accountDays = [
  { date: "2026/6/22", weekday: "周一", note: "诺德未卖，按收盘 17.15 暂估", dayLoss: "-405.22", dayLossPct: "-1.80%", tempLoss: "-405.22", position: "85.34%", total: "22,105.42" },
  { date: "2026/6/23", weekday: "周二", note: "诺德未卖，按收盘 15.44 暂估", dayLoss: "-1,881.00", dayLossPct: "-8.51%", tempLoss: "-2,286.22", position: "83.98%", total: "20,224.42" },
  { date: "2026/6/24", weekday: "周三", note: "海欣/大唐未卖，按收盘暂估", dayLoss: "-872.52", dayLossPct: "-4.31%", tempLoss: "-3,158.74", position: "96.46%", total: "19,351.90" },
  { date: "2026/6/25", weekday: "周四", note: "亨通系未卖，按收盘暂估", dayLoss: "-59.68", dayLossPct: "-0.31%", tempLoss: "-3,218.42", position: "98.59%", total: "19,292.22" },
  { date: "2026/6/26", weekday: "周五", note: "若未卖出，按收盘暂估", dayLoss: "-1,621.00", dayLossPct: "-8.40%", tempLoss: "-4,839.42", position: "98.46%", total: "17,671.22" },
];

const closePrices = {
  "2026-06-25": { "600487": 123.00, "600226": 11.20 },
  "2026-06-26": { "600487": 110.81, "600226": 10.53 },
};

const stockNotes = {
  "600110": {
    headline: "诺德股份为本周最大已实现亏损，闭环约 -2,948.55。",
    bullets: ["上一周重仓延续到本周，6/24 以 14.850 卖出 1100 股。", "这笔要重点补二次反思：为什么没有更早处理，是否把强趋势核心误判成可继续格局。"],
  },
  "600851": {
    headline: "海欣股份隔日止损，闭环约 -278.53。",
    bullets: ["6/24 买入 300 股，6/25 早盘卖出。", "它更像轮动尝试，亏损不大但说明选股强度和题材地位不够硬。"],
  },
  "601991": {
    headline: "大唐发电基本打平，闭环约 +1.84。",
    bullets: ["6/24 尾盘买入，6/25 早盘卖出。", "这笔没有扩大亏损，但也没有贡献收益，需要确认它是否只是防守轮动而非主线核心。"],
  },
  "600487": {
    headline: "亨通光电为 6/25 新开核心持仓，100 股，含费成本约 12,148.12。",
    bullets: ["6/25 通信板块强度 +12,359，亨通光电在同花顺热榜第 8。", "这是更接近容量趋势核心的一笔，后续要补 6/26 去留和浮动盈亏。"],
  },
  "600226": {
    headline: "亨通股份为 6/25 新开弹性持仓，600 股，含费成本约 6,865.06。",
    bullets: ["分两笔买入，均价约 11.425，含费成本均价约 11.442。", "它与亨通光电同属亨通系，但仓位预期不能混同：一个看趋势核心，一个看低价弹性。"],
  },
};

const secids = {
  "600110": "1.600110",
  "600851": "1.600851",
  "601991": "1.601991",
  "600487": "1.600487",
  "600226": "1.600226",
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

function ratioPct(n) {
  return `${n.toFixed(2)}%`;
}

function signedMoney(n) {
  return `${n > 0 ? "+" : ""}${money(n)}`;
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
  const order = ["600110", "600851", "601991", "600487", "600226"];
  return order.map((code) => {
    const s = stats.find((item) => item.code === code) || { code, name: trades.find((t) => t.code === code)?.name || code, realized: 0, openQty: 0, buyQty: 0, sellQty: 0 };
    const note = stockNotes[code];
    const realizedLabel = s.openQty > 0 ? "持仓待确认" : (s.realized >= 0 ? `+${money(s.realized)}` : `-${money(Math.abs(s.realized))}`);
    const chipClass = s.openQty > 0 ? "warn" : (s.realized >= 0 ? "pos" : "neg");
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
  const newRootLatest = `<article class="metric"><span>周度归档</span><strong>8</strong><small>已发布周复盘</small></article><article class="metric"><span>最新区间</span><strong>06.22</strong><small>至 06.26</small></article><article class="metric"><span>最新账户</span><strong class="neg">暂估 -4,839</strong><small>6/26 市值口径</small></article><article class="metric"><span>长期结构</span><strong>3 个主页</strong><small>周度 / 月季 / 年度</small></article>`;
  const rootPath = path.join(root, "index.html");
  let rootHtml = fs.readFileSync(rootPath, "utf8");
  rootHtml = replaceOnce(rootHtml, /<article class="metric"><span>周度归档<\/span>[\s\S]*?<span>长期结构<\/span><strong>3 个主页<\/strong><small>周度 \/ 月季 \/ 年度<\/small><\/article>/, newRootLatest, "root metrics");
  rootHtml = replaceOnce(rootHtml, /<span>周报 <b>.*?<\/b><\/span><span>最新 <b>.*?<\/b><\/span><span>状态 <b>.*?<\/b><\/span>/, `<span>周报 <b>8 篇</b></span><span>最新 <b>06.22-06.26</b></span><span>状态 <b>草稿待补</b></span>`, "root weekly card");
  fs.writeFileSync(rootPath, rootHtml, "utf8");

  const hubPath = path.join(root, "weekly-trading-review", "index.html");
  let hub = fs.readFileSync(hubPath, "utf8");
  hub = replaceOnce(hub, /href="\.\.\/2026-06-15_2026-06-20\/">进入最新周复盘/, `href="../2026-06-22_2026-06-26/">进入最新周复盘`, "hub latest button");
  hub = replaceOnce(hub, /<article class="metric"><span>周报数量<\/span>[\s\S]*?<span>最新规则<\/span><strong>.*?<\/strong><small>.*?<\/small><\/article>/, `<article class="metric"><span>周报数量</span><strong>8</strong><small>已归档周数</small></article><article class="metric"><span>最新区间</span><strong>06.22</strong><small>至 06.26</small></article><article class="metric"><span>最新账户</span><strong class="neg">暂估 -4,839</strong><small>6/26 市值口径</small></article><article class="metric"><span>最新规则</span><strong>切仓纪律</strong><small>核心亏损后不混预期</small></article>`, "hub metrics");
  const latestPanel = `<section class="panel"><h2>最新周复盘</h2><a class="week-card" href="../2026-06-22_2026-06-26/"><div class="week-head"><h3>2026.06.22 - 2026.06.26</h3><span class="chip">草稿版</span></div><p>本周按交割单和未卖持仓收盘市值做第一版：诺德为主要已实现亏损源，期末亨通光电与亨通股份按 6/26 收盘暂估浮亏。</p><div class="mini-grid"><span>成交 <b>8 笔</b></span><span>暂估 <b>约 -4,839</b></span><span>口径 <b>6/26 市值</b></span></div></a></section>`;
  hub = replaceOnce(hub, /<section class="panel"><h2>最新周复盘<\/h2>[\s\S]*?<\/section><section class="panel"><h2>周度归档<\/h2>/, `${latestPanel}<section class="panel"><h2>周度归档</h2>`, "hub latest panel");
  const newArchiveCard = `<a class="week-card" href="../2026-06-22_2026-06-26/"><div class="week-head"><h3>2026.06.22 - 2026.06.26</h3><span class="chip">草稿版</span></div><p>诺德止损后切入海欣/大唐，再回到芯片通信强线，期末持有亨通光电与亨通股份并按收盘价暂估浮亏。</p><div class="mini-grid"><span>成交 <b>8 笔</b></span><span>暂估 <b>约 -4,839</b></span><span>状态 <b>账户待补</b></span></div></a>`;
  const archiveStart = hub.indexOf(`<div class="archive">`);
  const archiveHtml = archiveStart >= 0 ? hub.slice(archiveStart) : "";
  if (!archiveHtml.includes(`href="../2026-06-22_2026-06-26/"`)) {
    hub = replaceOnce(hub, /<div class="archive">/, `<div class="archive">${newArchiveCard}`, "hub archive insert");
  }
  hub = hub.replace(/(<a class="week-card" href="\.\.\/2026-06-15_2026-06-20\/"[\s\S]*?<span class="chip">)草稿版(<\/span>)/, "$1已发布$2");
  fs.writeFileSync(hubPath, hub, "utf8");
}

async function main() {
  const stats = calcStockStats();
  const closedStats = stats.filter((s) => !s.openQty);
  const openStats = stats.filter((s) => s.openQty);
  const totals = {
    trades: trades.length,
    buys: trades.filter((t) => t.side.includes("买")).length,
    sells: trades.filter((t) => t.side.includes("卖")).length,
    stocks: new Set(trades.map((t) => t.code)).size,
    buyGross: trades.filter((t) => t.side.includes("买")).reduce((s, t) => s + t.amount, 0),
    sellGross: trades.filter((t) => t.side.includes("卖")).reduce((s, t) => s + t.amount, 0),
    costs: trades.reduce((s, t) => s + t.fees, 0),
    realized: closedStats.reduce((s, t) => s + t.realized, 0),
  };
  const previousWeekEquity = 22567;
  const priorCash = 3240.42;
  const priorCostBasisEquity = priorCash + priorCost["600110"].cost;
  const closedRate = (totals.realized / priorCostBasisEquity) * 100;
  const finalCash = 272.22;
  const openCost = openStats.reduce((sum, s) => sum + s.openCost, 0);
  const costBasisEquity = finalCash + openCost;
  const finalPositionRate = (openCost / costBasisEquity) * 100;
  const finalCashRate = (finalCash / costBasisEquity) * 100;
  const openHoldingMarks = openStats.map((s) => {
    const close625 = closePrices["2026-06-25"][s.code];
    const close626 = closePrices["2026-06-26"][s.code];
    const market625 = s.openQty * close625;
    const market626 = s.openQty * close626;
    return {
      ...s,
      close625,
      close626,
      market625,
      market626,
      pnl625: market625 - s.openCost,
      pnl626: market626 - s.openCost,
    };
  });
  const marketValue625 = openHoldingMarks.reduce((sum, s) => sum + s.market625, 0);
  const marketValue626 = openHoldingMarks.reduce((sum, s) => sum + s.market626, 0);
  const unrealized625 = marketValue625 - openCost;
  const unrealized626 = marketValue626 - openCost;
  const marketEquity625 = finalCash + marketValue625;
  const marketEquity626 = finalCash + marketValue626;
  const tempLoss625 = marketEquity625 - priorCostBasisEquity;
  const tempLoss626 = marketEquity626 - priorCostBasisEquity;
  const tempLossRate626 = (tempLoss626 / priorCostBasisEquity) * 100;
  const marketPosition625 = (marketValue625 / marketEquity625) * 100;
  const marketPosition626 = (marketValue626 / marketEquity626) * 100;
  const maxClosedAbs = Math.max(1, ...closedStats.map((s) => Math.abs(s.realized)));
  const trends = {};
  for (const code of Object.keys(secids)) {
    trends[code] = await fetchTrend(code);
  }

  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>2026.06.22 - 2026.06.26 每周交割复盘</title>${style}${extraStyle}</head>
<body><main class="shell"><nav class="side" aria-label="周复盘导航"><h2>本周导航</h2><a href="../weekly-trading-review/">周度主页</a><a href="../index.html">总首页</a><a href="#top">本周总览</a><a href="#source">数据口径</a><a href="#account">账户口径</a><a href="#ticket-analysis">盈亏票</a><a href="#second-review">二次复盘</a><a href="#daily">逐日复盘</a><a href="#stocks">买卖点图</a><a href="#rules">沉淀规则</a><a href="#trades">成交明细</a><a href="#todo">缺口清单</a></nav>
<div class="page">
<section class="hero" id="top"><div><span class="label">2026.06.22 - 2026.06.26 · 草稿版</span><h1>止损旧核心，重新切回通信科技线</h1><p>本页先按你这张 6/18-6/25 交割单截图、6/23 与 6/25 市场数据做第一版。未卖出的持仓不再只写成本，而是按当天收盘价计算市值和暂时盈亏；6/26 暂按亨通系没有卖出、继续持有到收盘处理。</p></div><div class="hero-side"><article class="metric"><span>暂估总亏损</span><strong class="neg">${money(tempLoss626)}</strong><small>6/26 市值口径，约 ${pct(tempLossRate626)}</small></article><article class="metric"><span>期末仓位</span><strong>${ratioPct(marketPosition626)}</strong><small>6/26 持仓市值 ${money(marketValue626)}</small></article><article class="metric"><span>资料状态</span><strong>先版</strong><small>正式账户截图待补</small></article></div></section>
<section class="metric-grid"><article class="metric"><span>本周成交</span><strong>${totals.trades} 笔</strong><small>买入 ${totals.buys} / 卖出 ${totals.sells}</small></article><article class="metric"><span>涉及标的</span><strong>${totals.stocks} 只</strong><small>诺德、海欣、大唐、亨通光电、亨通股份</small></article><article class="metric"><span>已实现亏损</span><strong class="${totals.realized >= 0 ? "pos" : "neg"}">${signedMoney(totals.realized)}</strong><small>已平仓交割单口径</small></article><article class="metric"><span>未实现浮亏</span><strong class="${unrealized626 >= 0 ? "pos" : "neg"}">${signedMoney(unrealized626)}</strong><small>6/26 未卖持仓市值</small></article></section>
<section class="panel source-lock" id="source"><h2>数据口径先锁住</h2><p><strong>本周有效区间：</strong>2026/6/22 - 2026/6/26；当前已录入 6/24 - 6/25 交割单。你给的截图里 6/18 的诺德买入属于上一周，本页只用它的期末成本衔接 6/24 卖出，不重复计入本周成交。</p><p class="section-note">成交明细隐藏合同号、成交编号等敏感字段；市场数据来自本地 6/23、6/25 三表审计 JSON；未卖持仓市值使用东方财富日 K 收盘价暂估，分钟走势来自东方财富 5 日分钟接口，仅用于定位买卖点，成交价格仍以交割单为准。</p></section>
<section class="two-col"><article class="panel" id="account"><h2>交割单 + 市值口径核算</h2><p>通过交割单先确定期初：现金 ${money(priorCash)} 与诺德股份成本 ${money(priorCost["600110"].cost)}，合计 ${money(priorCostBasisEquity)}。已卖出的票按交割单锁定盈亏，未卖出的持仓按当天收盘价计算市值。逐日表里，“当日亏损金额”按当天市值总额减上一日市值总额计算；“当日亏损比例”按上一日市值总额计算，6/22 则以期初成本总额为基准。6/26 若未卖出，亨通系市值 ${money(marketValue626)}、浮盈亏 ${signedMoney(unrealized626)}，本周暂估总亏损 ${signedMoney(tempLoss626)}。</p><div class="mini-grid"><span>期初成本总额 <b>${money(priorCostBasisEquity)}</b></span><span>已实现亏损 <b class="${totals.realized >= 0 ? "pos" : "neg"}">${signedMoney(totals.realized)}</b></span><span>6/25 暂时亏损 <b class="${tempLoss625 >= 0 ? "pos" : "neg"}">${signedMoney(tempLoss625)}</b></span><span>6/26 暂估亏损 <b class="${tempLoss626 >= 0 ? "pos" : "neg"}">${signedMoney(tempLoss626)}</b></span><span>6/26 市值总额 <b>${money(marketEquity626)}</b></span><span>6/26 持仓市值 <b>${money(marketValue626)}</b></span><span>6/26 仓位 <b>${ratioPct(marketPosition626)}</b></span><span>现金占比 <b>${ratioPct(finalCash / marketEquity626 * 100)}</b></span></div><div class="account-days">${accountDays.map((day) => `<div class="account-day"><strong>${esc(day.date)} ${esc(day.weekday)}</strong><span>状态 <b>${esc(day.note)}</b></span><span>当日亏损金额 <b class="${day.dayLoss.startsWith("-") ? "neg" : ""}">${esc(day.dayLoss)}</b></span><span>当日亏损比例 <b class="${day.dayLossPct.startsWith("-") ? "neg" : ""}">${esc(day.dayLossPct)}</b></span><span>暂时亏损 <b class="${day.tempLoss.startsWith("-") ? "neg" : ""}">${esc(day.tempLoss)}</b></span><span>仓位 <b>${esc(day.position)}</b></span><span>市值总额 <b>${esc(day.total)}</b></span></div>`).join("")}</div></article><article class="panel"><h2>先版结论</h2><ul class="takeaways"><li>本周最大问题不是交易频率，而是诺德股份从上一周浮盈/核心预期转成大额止损，单票闭环约 -2,948.55。</li><li>海欣股份隔日止损约 -278.53，大唐发电基本打平，说明 6/24 的切仓方向还没有形成稳定赚钱贡献。</li><li>6/25 市场强度重新聚焦芯片、通信、元器件、算力，买入亨通光电和亨通股份，方向回到更强主线。</li><li>按 6/26 收盘价暂估，亨通光电与亨通股份的未实现浮亏合计约 -1,614.18，本周总亏损暂扩大到 -4,839.42。</li></ul></article></section>
<section class="two-col"><article class="panel"><h2>闭环贡献</h2><p class="section-note">这里先统计已平仓且能由交割单/上一周期末成本推算的部分；未平仓的亨通光电与亨通股份在右侧按收盘市值计入暂时盈亏。</p><div class="bar-list">${closedStats.map((s) => {
    const width = Math.max(12, Math.min(100, Math.abs(s.realized) / maxClosedAbs * 100));
    return `<div class="bar-row"><div class="bar-meta"><span>${esc(s.name)} ${s.code}</span><strong class="${s.realized >= 0 ? "pos" : "neg"}">${s.realized >= 0 ? "+" : ""}${money(s.realized)}</strong></div><div class="bar-track"><span class="${s.realized < 0 ? "neg" : ""}" style="width:${width.toFixed(1)}%"></span></div><p>${esc(stockNotes[s.code]?.headline || "")}</p></div>`;
  }).join("")}</div></article><article class="panel"><h2>未卖持仓市值推算</h2><p class="section-note">截至 6/25 截图，期末持仓为亨通光电 100 股、亨通股份 600 股。按你的口径，未卖出的持仓直接用当天收盘价计算市值和暂时盈亏；6/26 暂按没有卖出、继续持有到收盘处理。</p><div class="mini-grid">${openHoldingMarks.map((s) => `<span>${esc(s.name)} 持仓 <b>${s.openQty.toLocaleString("en-US")} 股</b></span><span>${esc(s.name)} 成本 <b>${money(s.openCost)}</b></span><span>${esc(s.name)} 6/25 <b>收 ${s.close625.toFixed(2)} / ${money(s.market625)} / <em class="${s.pnl625 >= 0 ? "pos" : "neg"}">${signedMoney(s.pnl625)}</em></b></span><span>${esc(s.name)} 6/26 <b>收 ${s.close626.toFixed(2)} / ${money(s.market626)} / <em class="${s.pnl626 >= 0 ? "pos" : "neg"}">${signedMoney(s.pnl626)}</em></b></span>`).join("")}<span>6/25 持仓浮盈亏 <b class="${unrealized625 >= 0 ? "pos" : "neg"}">${signedMoney(unrealized625)}</b></span><span>6/26 持仓浮盈亏 <b class="${unrealized626 >= 0 ? "pos" : "neg"}">${signedMoney(unrealized626)}</b></span><span>6/25 市值总额 <b>${money(marketEquity625)}</b></span><span>6/26 市值总额 <b>${money(marketEquity626)}</b></span><span>6/25 仓位 <b>${ratioPct(marketPosition625)}</b></span><span>6/26 仓位 <b>${ratioPct(marketPosition626)}</b></span></div></article></section>
<section class="panel" id="ticket-analysis"><h2>本周赚钱/亏损主要票及其分析</h2><p class="section-note">结合交割单、市值暂估和你补充的二次复盘，先把本周主要票归因到模式边界里。</p><div class="rule-grid"><article class="rule-card"><h3>诺德股份 600110</h3><p><strong class="neg">最大亏损源：</strong>承接上周 1100 股持仓，6/24 卖出后闭环约 -2,948.55。</p><p>这笔要重点反思的是“核心预期变弱后是否及时降级”。如果 6/18 的买点本来就是过急，那么本周不该再让它继续占用判断空间。</p></article><article class="rule-card"><h3>海欣股份 600851</h3><p><strong class="neg">隔日亏损：</strong>买入 300 股、卖出 300 股，闭环约 -278.53。</p><p>亏损幅度可控，但说明切仓后的新方向不够硬，不能把轮动票当成确定性主线。</p></article><article class="rule-card"><h3>大唐发电 601991</h3><p><strong class="pos">基本打平：</strong>买入 2000 股、卖出 2000 股，闭环约 +1.84。</p><p>执行上没有扩大风险，但收益贡献几乎为零。后续要确认它是电力容量核心，还是只是人气榜轮动对象。</p></article><article class="rule-card"><h3>亨通光电 600487</h3><p><strong class="warn">期末持仓：</strong>6/25 买入 100 股，含费成本约 12,148.12。</p><p>这笔贴合 6/25 通信强度和热榜位置，但二次复盘里明确提醒：趋势核心不能只因为强就重押，必须看是否是一致续强，且爆量分歧不能太大。</p></article><article class="rule-card"><h3>亨通股份 600226</h3><p><strong class="warn">期末持仓：</strong>6/25 买入 600 股，含费成本约 6,865.06。</p><p>它与亨通光电同名但不是同一类预期，后续要拆清楚：是低价补涨弹性，还是可持续主线核心。</p></article></div></section>
<section class="panel" id="second-review"><h2>二次复盘心得凝练</h2><p class="section-note">来自 2026/6/26 17:29 与 18:07 两份语音复盘原文。以下是清洗后的交易规则，不逐字保留语音识别里的错词。</p><div class="rule-grid"><article class="rule-card"><h3>只做自己真正赚过的钱</h3><p>当前更适合两类机会：一是情绪聚拢后的前排辨识度票；二是阶段主线里的趋势核心或中军，但市值不能过大，最好是百亿到千亿之间、有资金弹性的核心。</p></article><article class="rule-card"><h3>趋势核心要用板确认启动</h3><p>最舒服的模式不是小碎步趋势中途追，而是首板启动、一进二转强确认，类似超声电子、爱华集团这种“板的形式启动”的新核心。已经走出一段、涨幅过大、再去赌高度的票不在优势区。</p></article><article class="rule-card"><h3>一进二可以做，但必须分仓</h3><p>趋势核心的一进二不是孤注一掷。更适合分 3 到 5 笔去试，先确认强度，再随板块和个股反馈慢慢加减仓，避免把单只票的判断变成账户级风险。</p></article><article class="rule-card"><h3>三板去留看量和板块节奏</h3><p>三板能否继续拿，不只看个股强弱，还要看板块是否进入高潮。如果板块次日容易高潮兑现，三板应更偏兑现；如果量能没有明显失控，才有继续扛风险的条件。</p></article><article class="rule-card"><h3>爆量分歧不是正常分歧</h3><p>板块分歧可以接受，但核心票如果在分歧里爆出过大的量，说明筹码松动、资金出逃，不能硬扛。除非次日重新缩量转强，否则更适合先出，等重新确认后再接回。</p></article><article class="rule-card"><h3>亨通系的教训</h3><p>6/25 切回通信强线方向没错，但亨通光电和亨通股份都需要接受“量能和分歧”的过滤。买入后如果不是一致续强，而是放量承接失败，就不能用趋势核心的预期去硬扛。</p></article></div></section>
<section class="panel" id="daily"><h2>逐日操作&情绪复盘</h2><p class="section-note">以下每日内容来自你的个人每日复盘站，Codex 只做周度归纳，不把它包装成你已经确认的二次反思。</p><div class="day-list">${renderDailyCards()}</div></section>
<section class="panel" id="stocks"><h2>重点走势图</h2><p class="section-note">用分钟线标出本周所有实际买卖过的股票。图是为了直观看买卖点和前后走势，不替代成交单。</p><div class="stock-grid">${renderStockCards(trends)}</div></section>
<section class="panel" id="rules"><h2>本周先沉淀规则</h2><p class="section-note">这些规则结合已有成交、市值暂估和你补充的二次复盘先做沉淀，后续可继续按你的正式表述微调。</p><div class="rule-grid"><article class="rule-card"><h3>旧核心及时降级</h3><p>上一周的核心票，一旦新周不能继续证明强度，先降级处理，不能靠原有预期硬扛。</p></article><article class="rule-card"><h3>切仓后先小仓验证</h3><p>刚止损大亏票后，情绪最容易急着找回损失，新方向没有主线级别前不要立刻重仓。</p></article><article class="rule-card"><h3>同名不等于同预期</h3><p>亨通光电与亨通股份必须拆开看：趋势容量核心和低价弹性票的持仓逻辑不同。</p></article><article class="rule-card"><h3>强线优先于轮动</h3><p>6/25 数据显示芯片、通信、元器件更强，后续仓位优先围绕强线核心，不在弱轮动里找安全感。</p></article><article class="rule-card"><h3>已实现亏损要当天复盘</h3><p>诺德这种大额亏损不能只记成交，要当天拆买点、预期、止损线和仓位错配。</p></article><article class="rule-card"><h3>浮盈浮亏当天标记</h3><p>没有账户截图时，已卖出的票按交割单锁定，未卖出的持仓先按当天收盘市值暂估，后续再用券商截图校准。</p></article></div></section>
<section class="panel" id="trades"><h2>成交明细</h2>${renderTradeTable()}</section>
<section class="panel" id="todo"><h2>缺口清单</h2><div class="todo-grid"><article class="todo-card"><h3>还需要你补</h3><ul><li>确认 6/26 是否有额外成交；若没有，本页 6/26 市值暂估即可沿用。</li><li>6/26 收盘账户截图、持仓截图和券商最终权益。</li><li>如果二次复盘还有第三段补充，再继续追加到规则模块。</li></ul></article><article class="todo-card"><h3>已完成</h3><ul><li>截图中 6/24-6/25 的 8 笔成交已录入。</li><li>诺德、海欣、大唐三个已闭环标的已先核算。</li><li>未卖持仓已按当日收盘价计算市值和暂时盈亏。</li><li>逐日表已补当日亏损金额和当日亏损比例。</li><li>两份二次复盘原文已凝练为交易规则。</li><li>6/23 与 6/25 市场/板块/热榜数据已纳入逐日复盘。</li><li>成交明细已隐藏合同号、成交编号。</li></ul></article><article class="todo-card"><h3>下版优先更新</h3><ul><li>用正式账户截图校准券商权益。</li><li>若 6/26 有卖出或新买入，替换当前“未卖出继续持有”假设。</li><li>把规则语言再压缩成你的最终交易纪律。</li></ul></article></div></section>
</div></main></body></html>`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  updateIndexes();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
