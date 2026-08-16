const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const outRoot = path.join(root, "success-failure-trade-review");

const secids = {
  "001258": "0.001258",
  "600110": "1.600110",
  "600403": "1.600403",
  "600863": "1.600863",
  "601700": "1.601700",
};

const cases = [
  {
    slug: "stock-001258-failure",
    code: "001258",
    name: "立新能源",
    subtitle: "主升3硬做失败：没有先手、没有回封确认，还在忙碌状态连续随手单",
    period: "2026-07-28 至 2026-07-29",
    beg: "20260728",
    end: "20260729",
    badge: "大回撤",
    tone: "failure",
    pnlLabel: "闭环亏损",
    pnl: -4234.39,
    metrics: [
      ["买入规模", "1,100 股"],
      ["买入成本", "16,994.00"],
      ["卖出回收", "12,759.61"],
      ["成交均价", "买 15.449 / 卖 11.610"],
    ],
    trades: [
      t("2026-07-28", "09:30:20", "BUY", 100, 15.640, -1569.000),
      t("2026-07-28", "09:30:22", "BUY", 100, 15.640, -1569.000),
      t("2026-07-28", "09:30:45", "BUY", 100, 15.620, -1567.000),
      t("2026-07-28", "09:31:33", "BUY", 100, 15.440, -1549.000),
      t("2026-07-28", "09:31:39", "BUY", 100, 15.360, -1541.000),
      t("2026-07-28", "09:34:42", "BUY", 100, 15.350, -1540.000),
      t("2026-07-28", "09:35:10", "BUY", 100, 15.210, -1526.000),
      t("2026-07-28", "09:35:33", "BUY", 100, 15.380, -1543.000),
      t("2026-07-28", "09:41:45", "BUY", 100, 15.400, -1545.000),
      t("2026-07-28", "09:44:09", "BUY", 100, 15.290, -1534.000),
      t("2026-07-28", "11:15:32", "BUY", 100, 15.060, -1511.000),
      t("2026-07-29", "10:06:55", "SELL", 1100, 11.610, 12759.610),
    ],
    summary:
      "这笔不是普通亏损，而是把熟悉的龙头二次参与错当成确定性。7/28 是主升3分歧日，应该等回封确认；实际却在开盘后一路越跌越买，随后隔日大幅低位离场。",
    sourceNotes: [
      "过往周度复盘已归因：主升3是先手游戏，没有先手不参与。",
      "操作状态不对：外出吃饭、手头忙、不能严肃盯盘时，不应该持续下单。",
      "买入逻辑偏离：应当越涨越买、确认后加仓，而不是跌下来就连续补。",
    ],
    sourceRefs: [
      "每日A股复盘站点未找到 2026-07-28/2026-07-29 对应页面，本案例先使用交割单截图与后续周度归因。",
      "后续若补上 7/28-7/29 每日复盘原文，可继续追加当日临盘心理摘录。",
    ],
    analysis: [
      ["错误核心", "把“熟悉票”当成“核心票”，没有重新确认周期位置、唯一性和当日承接。"],
      ["情绪链路", "想抓二波或修复，结果被盘中下杀牵着走；越跌越想修正成本，随手单替代了计划。"],
      ["下一次规则", "主升3没有先手不参与；10点前重仓必须电脑严肃盯盘；无电脑盯盘单票不超过30%。"],
    ],
  },
  {
    slug: "stock-600110-failure",
    code: "600110",
    name: "诺德股份",
    subtitle: "旧核心预期失效：上一周持仓没有及时降级，最后变成大额止损",
    period: "2026-06-18 至 2026-06-24",
    beg: "20260618",
    end: "20260624",
    badge: "大回撤",
    tone: "failure",
    pnlLabel: "闭环亏损",
    pnl: -2948.55,
    metrics: [
      ["买入规模", "1,100 股"],
      ["买入成本", "19,270.22"],
      ["卖出回收", "16,321.67"],
      ["成交均价", "买约 17.518 / 卖 14.850"],
    ],
    trades: [
      t("2026-06-18", "09:36:49", "BUY", 200, 17.620, -3529.040),
      t("2026-06-18", "09:46:22", "BUY", 200, 17.600, -3525.040),
      t("2026-06-18", "09:46:27", "BUY", 100, 17.530, -1758.020),
      t("2026-06-18", "09:47:06", "BUY", 100, 17.480, -1753.020),
      t("2026-06-18", "09:47:15", "BUY", 100, 17.500, -1755.020),
      t("2026-06-18", "10:10:52", "BUY", 100, 17.350, -1740.020),
      t("2026-06-18", "10:11:09", "BUY", 100, 17.400, -1745.020),
      t("2026-06-18", "10:11:59", "BUY", 100, 17.350, -1740.020),
      t("2026-06-18", "10:13:00", "BUY", 100, 17.200, -1725.020),
      t("2026-06-24", "10:08:37", "SELL", 1100, 14.850, 16321.670),
    ],
    summary:
      "诺德股份的问题是旧核心失效后没有及时降级。它从上一周带入预期，但新周不能继续证明强度时，仓位仍然占用账户，最终在 6/24 形成约 -2,948.55 的大额闭环亏损。",
    sourceNotes: [
      "6/22-6/26 周复盘把诺德列为本周最大已实现亏损源。",
      "复盘重点不是交易频率，而是核心预期变弱后是否及时降级。",
      "旧核心到了新周期不能续强，必须先降级，不能继续占仓位。",
    ],
    sourceRefs: [
      "每日A股复盘 2026-06-18：诺德股份被当作科技/趋势方向观察对象。",
      "6/22-6/26 周度交割复盘：诺德股份为当周最大已实现亏损来源。",
    ],
    analysis: [
      ["错误核心", "用上一周的核心预期延长持仓，却没有让当周盘面重新证明它仍是核心。"],
      ["情绪链路", "因为它曾经强，所以倾向继续相信；真正应该做的是让强度、板块和资金承接重新投票。"],
      ["下一次规则", "跨周旧核心不能自动续命；新周不能主动转强，先降级处理，再看是否有二次买点。"],
    ],
  },
  {
    slug: "stock-600403-failure",
    code: "600403",
    name: "大有能源",
    subtitle: "赚钱票里的失败点：龙头最后一板和第二个爆量大烂板不能硬吃",
    period: "2026-06-03 至 2026-06-09",
    beg: "20260603",
    end: "20260609",
    badge: "利润回吐",
    tone: "mixed",
    pnlLabel: "可见总闭环",
    pnl: 895.19,
    metrics: [
      ["第一段闭环", "+1,433.94"],
      ["第二段回吐", "-538.75"],
      ["6/9账户冲击", "-2,492"],
      ["核心问题", "最后一板 / 大烂板"],
    ],
    trades: [
      t("2026-06-03", "09:25:00", "BUY", 1100, 6.730, -7408.070),
      t("2026-06-04", "09:30:43", "BUY", 900, 7.400, -6665.070),
      t("2026-06-05", "09:55:57", "SELL", 2000, 7.760, 15507.080),
      t("2026-06-05", "13:34:20", "BUY", 2400, 8.140, -19541.200),
      t("2026-06-08", "09:32:23", "BUY", 400, 8.860, -3549.040),
      t("2026-06-09", "09:31:52", "SELL", 2800, 8.060, 22551.490),
    ],
    summary:
      "大有能源整体识别是成功的：煤炭龙、第一性和唯一性判断对了，所以第一段赚钱。但失败点也很清楚：后段继续去抓龙头最后一板，并在爆量大烂板后仍给过高预期，导致利润大幅回吐。",
    sourceNotes: [
      "6/8-6/12 周复盘明确：做龙不是去吃龙头最后一个板，舒适区是中段和尾段前半。",
      "连续两个爆量大烂板非常危险：第一个可以试错，第二个没有转强确认就不该进。",
      "三板纪律不是机械减半：弱板减半保护，强势板或一字板不用强行减半，始终看强弱。",
    ],
    sourceRefs: [
      "每日A股复盘 2026-06-05/2026-06-08：大有能源作为煤炭方向核心与龙头观察。",
      "6/8-6/12 周度二次反思：不要吃满龙头最后一个板，第二个爆量大烂板不再硬进。",
    ],
    analysis: [
      ["做对部分", "识别出煤炭方向龙头，第一段按核心龙参与并兑现，证明“第一性/唯一性”有效。"],
      ["失败部分", "后段从做龙变成赌鱼尾，看到核心龙仍有人气就忽视了爆量大烂板和最后一板风险。"],
      ["下一次规则", "龙头最后一板不满仓硬吃；第二个爆量大烂板若没有明确转强确认，不能再进。"],
    ],
  },
  {
    slug: "stock-600863-failure",
    code: "600863",
    name: "华能蒙电",
    subtitle: "分歧接面：退潮/分歧里没有等最强确认，亏损后继续加单",
    period: "2026-05-28 至 2026-05-29",
    beg: "20260528",
    end: "20260529",
    badge: "大回撤",
    tone: "failure",
    pnlLabel: "闭环亏损",
    pnl: -2060.24,
    metrics: [
      ["买入规模", "3,300 股"],
      ["买入成本", "23,626.23"],
      ["卖出回收", "21,565.99"],
      ["买卖均价", "买约 7.148 / 卖 6.540"],
    ],
    trades: [
      t("2026-05-28", "09:34:22", "BUY", 1400, 7.180, -10057.100),
      t("2026-05-28", "09:34:24", "BUY", 700, 7.190, -5038.050),
      t("2026-05-28", "09:34:33", "BUY", 300, 7.230, -2174.020),
      t("2026-05-28", "09:34:40", "BUY", 200, 7.240, -1453.010),
      t("2026-05-28", "13:13:22", "BUY", 100, 7.000, -705.010),
      t("2026-05-28", "13:13:27", "BUY", 100, 7.000, -705.010),
      t("2026-05-28", "13:13:44", "BUY", 300, 7.000, -2105.020),
      t("2026-05-28", "14:05:19", "BUY", 200, 6.920, -1389.010),
      t("2026-05-29", "09:30:39", "SELL", 3300, 6.540, 21565.990),
    ],
    summary:
      "华能蒙电是 5/25-5/29 周的最大亏损源。问题不是一次买错，而是在板块分歧中把非最强票越跌越补，亏损后继续加单，次日只能被动清仓。",
    sourceNotes: [
      "5/25-5/29 周复盘把华能蒙电列为最大拖累，闭环约 -2,060.24。",
      "当周归因是分歧接面和退潮追涨：刚分歧就进，次日弱化后被动离场。",
      "日度复盘沉淀：板块分歧只做最强和第二强，亏损后停止加单。",
    ],
    sourceRefs: [
      "每日A股复盘 2026-05-29：沉淀板块分歧只做最强和第二强、亏损后停止加单。",
      "5/25-5/29 周度交割复盘：华能蒙电为主要亏损票。",
    ],
    analysis: [
      ["错误核心", "没有把电力内部的强弱排清楚，分歧里过早出手，把非核心当成可回流标的。"],
      ["情绪链路", "早盘买入后没有证明强度，午后继续补仓，实际上是在用加单延长错误。"],
      ["下一次规则", "分歧日先等最强确认；亏损后停止加单；板块回流不等于所有票都能做。"],
    ],
  },
  {
    slug: "stock-601700-failure",
    code: "601700",
    name: "风范股份",
    subtitle: "无题材支撑的旧高标抱团：仓位过大，题材同步走弱时没有及时降级",
    period: "2026-08-06 至 2026-08-10",
    beg: "20260806",
    end: "20260810",
    badge: "高标失败",
    tone: "failure",
    pnlLabel: "截图口径亏损",
    pnl: -327.55,
    metrics: [
      ["买入规模", "1,800 股"],
      ["买入成本", "12,918.13"],
      ["卖出回收", "12,590.58"],
      ["成交均价", "买 7.160 / 卖 7.001"],
    ],
    trades: [
      t("2026-08-06", "09:38:26", "BUY", 200, 7.160, -1437.010),
      t("2026-08-06", "09:38:26", "BUY", 600, 7.160, -4301.040),
      t("2026-08-06", "09:38:29", "BUY", 200, 7.160, -1437.010),
      t("2026-08-06", "09:38:29", "BUY", 500, 7.160, -3585.040),
      t("2026-08-06", "09:39:14", "BUY", 100, 7.160, -721.010),
      t("2026-08-06", "13:07:22", "BUY", 200, 7.160, -1437.020),
      t("2026-08-10", "09:37:22", "SELL", 1800, 7.001, 12590.580),
    ],
    summary:
      "风范股份的失败不在于完全没逻辑，而在于把“最高标抱团可能有溢价”当成了确定性。它是电网旧高标，题材支撑弱、四板爆量，到了 8/7 同题材一起走弱，应该降级处理。",
    sourceNotes: [
      "8/7 日度复盘指出：无题材支撑的纯高标抱团，市场并不认可。",
      "错误之一是仓位过大：即便能试，也只能小仓位试，不能一股脑打满。",
      "后续必须同步盯同题材辨识度票，前中后排共振走弱时，龙头也按题材退潮处理。",
    ],
    sourceRefs: [
      "本地每日A股复盘 2026-08-07：风范股份是最高标抱团，但缺少题材支撑，仓位过大是核心问题。",
      "8/10-8/14 周度二次反思：最高标抱团可以做，但必须盯盘；不盯盘时不能上大仓位。",
    ],
    analysis: [
      ["错误核心", "把旧周期最高标当成新周期确定性，忽略电网题材已经弱化、同题材辨识度票同步走弱。"],
      ["情绪链路", "因为它有高度，所以期待抱团溢价；但高度没有题材支撑时，脉冲冲高只是卖点。"],
      ["下一次规则", "最高标不是免死金牌；无题材支撑的高标只能小仓试，且必须建立同题材盯盘组合。"],
    ],
  },
];

function t(date, time, side, qty, price, net) {
  return { date, time, side, qty, price, net };
}

function money(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function cnSide(side) {
  return side === "BUY" ? "买入" : "卖出";
}

function toneClass(value) {
  return value > 0 ? "pos" : value < 0 ? "neg" : "";
}

async function fetchKlines(c) {
  const secid = secids[c.code];
  if (!secid) return [];
  const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=5&fqt=1&beg=${c.beg}&end=${c.end}`;
  let text = "";
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    text = await res.text();
  } catch (error) {
    try {
      text = execFileSync("curl.exe", ["-s", "-L", "--compressed", "-A", "Mozilla/5.0", url], { encoding: "utf8", maxBuffer: 1024 * 1024 * 12 });
    } catch (curlError) {
      console.warn(`kline fetch failed for ${c.code}: ${curlError.message}`);
      return [];
    }
  }
  try {
    const json = JSON.parse(text);
    return (json.data?.klines || []).map(parseKline);
  } catch (error) {
    console.warn(`kline parse failed for ${c.code}: ${error.message}`);
    return [];
  }
}

function parseKline(line) {
  const [dt, open, close, high, low, volume, amount, amplitude] = line.split(",");
  return { dt, open: +open, close: +close, high: +high, low: +low, volume: +volume, amount: +amount, amplitude: +amplitude };
}

function stamp(value) {
  return new Date(`${value.replace(" ", "T")}:00+08:00`).getTime();
}

function tradeStamp(trade) {
  return new Date(`${trade.date}T${trade.time}+08:00`).getTime();
}

function renderChart(c, klines) {
  if (!klines.length) return renderTradeWindowChart(c);
  const w = 980, h = 360, left = 58, right = 24, top = 26, bottom = 44;
  const prices = [
    ...klines.flatMap((point) => [point.high, point.low]),
    ...c.trades.map((trade) => trade.price),
  ].filter(Number.isFinite);
  if (!prices.length) return `<div class="empty-chart">缺少可用5分钟K数据，先保留买卖点表。</div>`;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = Math.max((max - min) * 0.08, 0.03);
  const yMin = min - pad;
  const yMax = max + pad;
  const x = (i) => left + (klines.length <= 1 ? 0 : (i / (klines.length - 1)) * (w - left - right));
  const y = (price) => top + ((yMax - price) / (yMax - yMin || 1)) * (h - top - bottom);
  const step = klines.length <= 1 ? 12 : (w - left - right) / (klines.length - 1);
  const bodyWidth = Math.max(2, Math.min(8, step * 0.6));
  const grid = [yMax, (yMax + yMin) / 2, yMin].map((price) => {
    const yy = y(price);
    return `<g><line x1="${left}" x2="${w - right}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" stroke="rgba(23,32,42,.08)"></line><text x="${left - 10}" y="${(yy + 4).toFixed(1)}" text-anchor="end" class="axis">${price.toFixed(2)}</text></g>`;
  }).join("");
  const dayMarks = [];
  const seen = new Set();
  klines.forEach((point, i) => {
    const date = point.dt.slice(5, 10);
    if (!seen.has(date)) {
      seen.add(date);
      dayMarks.push(`<g><line x1="${x(i).toFixed(1)}" x2="${x(i).toFixed(1)}" y1="${top}" y2="${h - bottom}" stroke="rgba(23,32,42,.08)" stroke-dasharray="4 7"></line><text x="${x(i).toFixed(1)}" y="${h - 16}" text-anchor="middle" class="axis">${date}</text></g>`);
    }
  });
  const candles = klines.map((point, i) => {
    const cx = x(i);
    const up = point.close >= point.open;
    const color = up ? "#c2412d" : "#14845f";
    const yHigh = y(point.high);
    const yLow = y(point.low);
    const yOpen = y(point.open);
    const yClose = y(point.close);
    const bodyY = Math.min(yOpen, yClose);
    const bodyH = Math.max(1.2, Math.abs(yOpen - yClose));
    return `<g><line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${yHigh.toFixed(1)}" y2="${yLow.toFixed(1)}" stroke="${color}" stroke-width="1"></line><rect x="${(cx - bodyWidth / 2).toFixed(1)}" y="${bodyY.toFixed(1)}" width="${bodyWidth.toFixed(1)}" height="${bodyH.toFixed(1)}" rx=".7" fill="${color}" opacity=".76"></rect></g>`;
  }).join("");
  const klineStamps = klines.map((point) => stamp(point.dt));
  const markerCounts = new Map();
  const markers = c.trades.map((trade) => {
    const ts = tradeStamp(trade);
    let bestIndex = 0;
    let bestGap = Number.POSITIVE_INFINITY;
    klineStamps.forEach((value, i) => {
      const gap = Math.abs(value - ts);
      if (gap < bestGap) {
        bestGap = gap;
        bestIndex = i;
      }
    });
    const key = `${bestIndex}-${trade.side}`;
    const count = markerCounts.get(key) || 0;
    markerCounts.set(key, count + 1);
    const cx = x(bestIndex) + (count % 6) * 9 - 18;
    const cy = y(trade.price) + Math.floor(count / 6) * 15;
    const buy = trade.side === "BUY";
    const fill = buy ? "#b91c1c" : "#1d4ed8";
    const shape = buy
      ? `<path d="M ${cx.toFixed(1)} ${(cy - 11).toFixed(1)} L ${(cx - 7).toFixed(1)} ${(cy + 5).toFixed(1)} L ${(cx + 7).toFixed(1)} ${(cy + 5).toFixed(1)} Z" fill="${fill}" stroke="#fff" stroke-width="1.5"></path>`
      : `<path d="M ${cx.toFixed(1)} ${(cy + 11).toFixed(1)} L ${(cx - 7).toFixed(1)} ${(cy - 5).toFixed(1)} L ${(cx + 7).toFixed(1)} ${(cy - 5).toFixed(1)} Z" fill="${fill}" stroke="#fff" stroke-width="1.5"></path>`;
    return `<g><line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${top}" y2="${h - bottom}" stroke="rgba(23,32,42,.12)" stroke-dasharray="3 6"></line>${shape}<text x="${cx.toFixed(1)}" y="${(buy ? cy - 16 : cy + 23).toFixed(1)}" text-anchor="middle" class="marker-label">${buy ? "B" : "S"}</text><title>${c.name} ${cnSide(trade.side)} ${trade.date} ${trade.time} ${trade.price.toFixed(3)} / ${trade.qty}股</title></g>`;
  }).join("");
  return `<svg class="k-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${c.name} 5分钟K买卖点">${grid}${dayMarks.join("")}${candles}${markers}<text x="${left}" y="18" class="axis">5分钟K，红涨绿跌；B=买入，S=卖出</text><text x="${w - right}" y="18" text-anchor="end" class="axis">高 ${max.toFixed(2)} / 低 ${min.toFixed(2)}</text></svg>`;
}

function renderTradeWindowChart(c) {
  const w = 980, h = 360, left = 58, right = 24, top = 34, bottom = 58;
  const trades = c.trades.map((trade) => ({ ...trade, bucket: fiveMinuteBucket(trade.time) }));
  const prices = trades.map((trade) => trade.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = Math.max((max - min) * 0.15, 0.05);
  const yMin = min - pad;
  const yMax = max + pad;
  const x = (i) => left + (trades.length <= 1 ? 0 : (i / (trades.length - 1)) * (w - left - right));
  const y = (price) => top + ((yMax - price) / (yMax - yMin || 1)) * (h - top - bottom);
  const grid = [yMax, (yMax + yMin) / 2, yMin].map((price) => {
    const yy = y(price);
    return `<g><line x1="${left}" x2="${w - right}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" stroke="rgba(23,32,42,.08)"></line><text x="${left - 10}" y="${(yy + 4).toFixed(1)}" text-anchor="end" class="axis">${price.toFixed(2)}</text></g>`;
  }).join("");
  const seenDates = new Set();
  const dayMarks = trades.map((trade, i) => {
    if (seenDates.has(trade.date)) return "";
    seenDates.add(trade.date);
    return `<g><line x1="${x(i).toFixed(1)}" x2="${x(i).toFixed(1)}" y1="${top}" y2="${h - bottom}" stroke="rgba(23,32,42,.08)" stroke-dasharray="4 7"></line><text x="${x(i).toFixed(1)}" y="${h - 20}" text-anchor="middle" class="axis">${trade.date.slice(5)}</text></g>`;
  }).join("");
  const path = trades.map((trade, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(trade.price).toFixed(1)}`).join(" ");
  const markers = trades.map((trade, i) => {
    const cx = x(i);
    const cy = y(trade.price);
    const buy = trade.side === "BUY";
    const fill = buy ? "#b91c1c" : "#1d4ed8";
    const shape = buy
      ? `<path d="M ${cx.toFixed(1)} ${(cy - 11).toFixed(1)} L ${(cx - 7).toFixed(1)} ${(cy + 5).toFixed(1)} L ${(cx + 7).toFixed(1)} ${(cy + 5).toFixed(1)} Z" fill="${fill}" stroke="#fff" stroke-width="1.5"></path>`
      : `<path d="M ${cx.toFixed(1)} ${(cy + 11).toFixed(1)} L ${(cx - 7).toFixed(1)} ${(cy - 5).toFixed(1)} L ${(cx + 7).toFixed(1)} ${(cy - 5).toFixed(1)} Z" fill="${fill}" stroke="#fff" stroke-width="1.5"></path>`;
    const labelY = buy ? cy - 17 : cy + 24;
    const anchorShift = i === 0 ? 14 : i === trades.length - 1 ? -14 : 0;
    return `<g><line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${top}" y2="${h - bottom}" stroke="rgba(23,32,42,.12)" stroke-dasharray="3 6"></line>${shape}<text x="${(cx + anchorShift).toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" class="marker-label">${buy ? "B" : "S"}</text><title>${c.name} ${cnSide(trade.side)} ${trade.date} ${trade.time} ${trade.price.toFixed(3)} / ${trade.qty}股</title></g>`;
  }).join("");
  const timeLabels = trades.map((trade, i) => {
    const show = trades.length <= 8 || i === 0 || i === trades.length - 1 || trade.date !== trades[Math.max(i - 1, 0)].date;
    if (!show) return "";
    return `<text x="${x(i).toFixed(1)}" y="${h - 36}" text-anchor="middle" class="axis">${trade.bucket}</text>`;
  }).join("");
  return `<svg class="k-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${c.name} 成交5分钟窗口买卖点">${grid}${dayMarks}<path d="${path}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 6"></path>${markers}${timeLabels}<text x="${left}" y="20" class="axis">成交5分钟窗口图：按真实成交价标记，行情K线待补</text><text x="${w - right}" y="20" text-anchor="end" class="axis">成交价高 ${max.toFixed(2)} / 低 ${min.toFixed(2)}</text></svg>`;
}

function fiveMinuteBucket(time) {
  const [hh, mm] = time.split(":").map(Number);
  const bucket = Math.ceil(mm / 5) * 5;
  const outH = bucket >= 60 ? hh + 1 : hh;
  const outM = bucket >= 60 ? 0 : bucket;
  return `${String(outH).padStart(2, "0")}:${String(outM).padStart(2, "0")}`;
}

function pageHtml(c, chart, hasKlines) {
  const isPositive = c.pnl > 0;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${c.name}失败案例复盘</title>
  <style>
    :root{--ink:#17202a;--muted:#667085;--line:#dfe4ea;--paper:#fff;--wash:#f5f7fa;--red:#c2412d;--green:#14845f;--blue:#1d4ed8;--amber:#b45309;--shadow:0 18px 44px rgba(23,32,42,.08);--radius:10px}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:linear-gradient(180deg,#f7f8fa 0%,#eef2f5 100%);font-family:"Avenir Next","PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif}a{color:inherit}h1,h2,h3,h4,p{margin-top:0;letter-spacing:0}h1{margin:12px 0;font-size:clamp(34px,5vw,62px);line-height:1.05}h2{font-size:26px;margin-bottom:12px}h3{font-size:18px;margin-bottom:8px}p,li,td{color:var(--muted);line-height:1.72}.shell{width:min(1180px,calc(100vw - 28px));margin:0 auto;padding:32px 0 56px;display:grid;gap:18px}.hero,.panel,.metric,.card{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}.hero{padding:30px;display:grid;grid-template-columns:1.1fr .9fr;gap:24px;align-items:end}.panel{padding:24px}.label,.chip{display:inline-flex;width:max-content;max-width:100%;white-space:nowrap;border-radius:999px;font-size:12px;font-weight:800}.label{color:var(--red);background:#fff1ed;padding:7px 10px}.chip{border:1px solid var(--line);background:#f8fafc;padding:7px 10px;color:var(--muted)}.lead{font-size:17px;color:#334155}.button-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 15px;border-radius:8px;background:var(--ink);color:#fff;text-decoration:none;font-weight:800}.button.secondary{background:#fff;color:var(--ink);border:1px solid var(--line)}.metrics,.grid,.mini-grid,.rules{display:grid;gap:12px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.metric{padding:16px;min-height:104px;display:grid;align-content:space-between}.metric span,.metric small{color:var(--muted);font-size:12px}.metric strong{font-size:22px;line-height:1.18;font-variant-numeric:tabular-nums}.pos{color:var(--red)!important}.neg{color:var(--green)!important}.warn{color:var(--amber)!important}.mini-grid{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:14px}.mini-grid span{background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:10px;color:var(--muted);font-size:13px}.mini-grid b{display:block;color:var(--ink);font-size:16px;margin-top:4px}.grid{grid-template-columns:repeat(3,minmax(0,1fr))}.card{box-shadow:none;padding:16px}.card p{margin-bottom:0}.chart-wrap{border:1px solid var(--line);border-radius:10px;background:#fff;overflow:hidden}.k-chart{display:block;width:100%;height:auto;min-height:280px;background:#fff}.axis{font-size:12px;fill:#64748b}.marker-label{font-size:12px;font-weight:900;fill:#111827}.note{background:#f8fafc;border:1px dashed #b8c1cc;border-radius:10px;padding:14px;margin-top:12px}.table-wrap{width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:9px;background:#fff}table{width:100%;min-width:760px;border-collapse:collapse;font-size:13px}th,td{padding:11px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:#f8fafc;color:var(--muted)}td:first-child{font-weight:800;color:var(--ink);white-space:nowrap}tr:last-child td{border-bottom:0}.rules{grid-template-columns:repeat(3,minmax(0,1fr))}.source-list{margin:0;padding-left:18px}.empty-chart{padding:28px;color:var(--muted)}@media(max-width:900px){.hero,.metrics,.grid,.mini-grid,.rules{grid-template-columns:1fr}.shell{width:min(calc(100vw - 16px),1180px);padding-top:22px}.hero,.panel{padding:20px}}
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div>
        <span class="label">${c.badge} · ${c.code}</span>
        <h1>${c.name}</h1>
        <p class="lead">${c.subtitle}</p>
        <div class="button-row">
          <a class="button" href="../index.html#target-dimension">返回成功/失败复盘</a>
          <a class="button secondary" href="../../weekly-trading-review/">周度主页</a>
        </div>
      </div>
      <div class="metrics">
        <article class="metric"><span>${c.pnlLabel}</span><strong class="${toneClass(c.pnl)}">${money(c.pnl)}</strong><small>${c.period}</small></article>
        ${c.metrics.map(([label, value]) => `<article class="metric"><span>${label}</span><strong>${value}</strong><small>交割单截图口径</small></article>`).join("")}
      </div>
    </section>

    <section class="panel">
      <h2>一句话结论</h2>
      <p>${c.summary}</p>
      <div class="note"><strong>数据口径：</strong>成交记录只保留日期、时间、方向、数量、价格和发生金额；已隐藏合同号、成交编号等敏感字段。${hasKlines ? "行情图使用东方财富历史 5 分钟K接口生成，成交价格仍以交割单截图为准。" : "东方财富接口未返回该历史区间的 5 分钟K，本页先用成交5分钟窗口图标记真实买卖点，行情K线待补。成交价格仍以交割单截图为准。"}</div>
    </section>

    <section class="panel">
      <h2>5分钟K买卖点</h2>
      <p>红色 B 为买入，蓝色 S 为卖出；多笔同一 5 分钟窗口成交会横向错开，方便看清楚密集买入/卖出的位置。</p>
      <div class="chart-wrap">${chart}</div>
    </section>

    <section class="panel">
      <h2>操作与情绪复盘摘录</h2>
      ${c.sourceRefs ? `<div class="note"><strong>来源口径：</strong><ul class="source-list">${c.sourceRefs.map((ref) => `<li>${ref}</li>`).join("")}</ul></div>` : ""}
      <ul class="source-list">${c.sourceNotes.map((note) => `<li>${note}</li>`).join("")}</ul>
      <div class="grid" style="margin-top:14px">${c.analysis.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>
    </section>

    <section class="panel">
      <h2>成交明细</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>日期</th><th>时间</th><th>方向</th><th>数量</th><th>成交价</th><th>发生金额</th></tr></thead>
          <tbody>
            ${c.trades.map((trade) => `<tr><td>${trade.date}</td><td>${trade.time}</td><td class="${trade.side === "BUY" ? "pos" : "neg"}">${cnSide(trade.side)}</td><td>${trade.qty.toLocaleString("en-US")}</td><td>${trade.price.toFixed(3)}</td><td class="${toneClass(trade.net)}">${money(trade.net)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <h2>沉淀规则</h2>
      <div class="rules">
        <article class="card"><h3>先定地位</h3><p>先问它是不是题材第一、是不是唯一核心、当前位置能不能做左侧；回答不清楚就降级为小仓观察。</p></article>
        <article class="card"><h3>再定仓位</h3><p>旧高标、非唯一中高位、爆量弱转强、第二个大烂板，都不能给核心仓位。</p></article>
        <article class="card"><h3>最后定卖点</h3><p>冲高回落、题材同步走弱、不能重新证明强度时，先保护账户，不把幻想留到隔日。</p></article>
      </div>
    </section>
  </main>
</body>
</html>`;
}

async function main() {
  for (const c of cases) {
    const klines = await fetchKlines(c);
    const chart = renderChart(c, klines);
    const dir = path.join(outRoot, c.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), pageHtml(c, chart, klines.length > 0), "utf8");
    console.log(`wrote ${c.slug} (${klines.length} klines)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
