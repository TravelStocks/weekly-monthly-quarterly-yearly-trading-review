const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "monthly-quarterly-trading-review", "2026-05", "index.html");

const sourceDefs = [
  {
    id: "2026-04-20_2026-04-24",
    label: "04.20-04.24",
    range: "2026/4/20 - 2026/4/24",
    accountPnl: 1616.89,
    href: "../../2026-04-20_2026-04-24/",
    role: "月前参考周",
    includedInMay: false,
    note: "神剑股份贡献突出，是定龙正确、围绕最高辨识度操作的盈利样本。",
    parser: "report",
  },
  {
    id: "2026-05-08_2026-05-16",
    label: "05.08-05.16",
    range: "2026/5/8 - 2026/5/16",
    accountPnl: -4482.26,
    href: "../../2026-05-08_2026-05-16/",
    role: "5月自然月",
    includedInMay: true,
    note: "通鼎互联盈利被华电辽能、大唐电信等后排替代交易吞回。",
    parser: "table-trends",
  },
  {
    id: "2026-05-15_2026-05-22",
    label: "05.18-05.22",
    range: "2026/5/18 - 2026/5/22",
    accountPnl: -1553.76,
    href: "../../2026-05-15_2026-05-22/",
    role: "5月自然月",
    includedInMay: true,
    note: "达实智能开始成为核心处理对象，但华电辽能仍是主要亏损源。",
    parser: "table-static",
  },
  {
    id: "2026-05-25_2026-05-29",
    label: "05.25-05.29",
    range: "2026/5/25 - 2026/5/29",
    accountPnl: -1362.23,
    href: "../../2026-05-25_2026-05-29/",
    role: "5月自然月",
    includedInMay: true,
    note: "达实兑现修复，华能蒙电亏损后加单成为最大拖累。",
    parser: "js-series",
  },
  {
    id: "2026-06-01_2026-06-05",
    label: "06.01-06.05",
    range: "2026/6/1 - 2026/6/5",
    accountPnl: -31.0,
    href: "../../2026-06-01_2026-06-05/",
    role: "月后参考周",
    includedInMay: false,
    note: "大有能源验证第一性和唯一性盈利，期末持仓浮盈浮亏已确认。",
    parser: "js-holdings",
  },
];

const TAG_DICTIONARY = [
  "核心龙头",
  "核心处理",
  "值得复制",
  "赚钱但不可复制",
  "后排替代",
  "后排末端",
  "非第一",
  "非唯一",
  "非唯一中高位",
  "跟风票",
  "非模式",
  "补涨乱做",
  "止损后回补",
  "轻仓套利",
  "亏损后加单",
  "卖飞核心",
  "买点过急",
  "尾盘试错",
  "低确定性",
  "正贡献",
  "小额正贡献",
  "负贡献",
  "小亏闭环",
  "买点复盘",
  "待核算",
  "需验证核心地位",
  "需查第一性",
];

const SCORE_RUBRICS = {
  风控质量: ["1分：止损后回补/亏损加单仍出现", "3分：多数亏损能切断，但偶有拖延", "5分：亏损当天切断风险，无红线复发"],
  定龙质量: ["1分：主亏来自后排/非第一", "3分：能抓部分核心，但阶段性偏离", "5分：主要仓位围绕第一唯一性"],
  执行纪律: ["1分：预案失效、临盘扩散明显", "3分：能执行主规则，但红线偶发", "5分：按预案交易，不用情绪修复亏损"],
  买卖点质量: ["1分：买点急、卖点被动", "3分：核心票处理有效，杂票拖累", "5分：买卖点服务于核心和风控"],
  仓位集中度: ["1分：标的明显发散", "3分：多数聚焦，少量扩散", "5分：观察/操作始终不超过8只"],
};

const REDLINE_BASELINE = {
  止损后回补: 1,
  亏损后加单: 1,
  后排替代: 1,
  非模式: 1,
};

const OPERATION_TYPES = ["打板", "低吸", "半路", "做T", "套利", "趋势", "尾盘试错"];

function readSource(id) {
  return fs.readFileSync(path.join(ROOT, id, "index.html"), "utf8");
}

function money(value) {
  if (value == null || Number.isNaN(value)) return "待核算";
  return Number(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function moneySigned(value) {
  if (value == null || Number.isNaN(value)) return "待核算";
  return `${value >= 0 ? "+" : ""}${money(value)}`;
}

function fmt0(value) {
  return Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

function fmt3(value) {
  return Number(value || 0).toFixed(3);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

function stripTags(value) {
  return decodeHtml(String(value ?? "").replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

function parseNum(value) {
  const cleaned = stripTags(value).replace(/[,+%]/g, "").replace(/[^\d.-]/g, "");
  if (!cleaned) return 0;
  return Number(cleaned);
}

function normalizeDate(value) {
  return stripTags(value).replace(/\//g, "-");
}

function normalizeSide(value) {
  const text = stripTags(value);
  if (text.includes("买")) return "买入";
  if (text.includes("卖")) return "卖出";
  if (text.toUpperCase().includes("BUY")) return "买入";
  if (text.toUpperCase().includes("SELL")) return "卖出";
  return text;
}

function extractExpression(html, start) {
  let i = start;
  while (/\s/.test(html[i])) i += 1;
  const open = html[i];
  const close = open === "{" ? "}" : open === "[" ? "]" : null;
  if (!close) throw new Error(`Cannot extract expression at ${start}`);
  let depth = 0;
  let quote = null;
  let escape = false;
  for (let j = i; j < html.length; j += 1) {
    const ch = html[j];
    if (quote) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) return html.slice(i, j + 1);
    }
  }
  throw new Error("Unclosed expression");
}

function extractConst(html, name) {
  const marker = `const ${name} =`;
  const idx = html.indexOf(marker);
  if (idx < 0) return null;
  const start = html.indexOf("=", idx) + 1;
  const expression = extractExpression(html, start);
  return Function(`"use strict"; return (${expression});`)();
}

function extractReport(html) {
  const match = html.match(/window\.REPORT_DATA\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (!match) throw new Error("REPORT_DATA not found");
  return JSON.parse(match[1]);
}

function parseTradesFromTable(html, source) {
  const rows = [];
  for (const rowMatch of html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    if (cells.length < 10) continue;
    const code = stripTags(cells[2]);
    if (!/^\d{6}$/.test(code)) continue;
    rows.push({
      date: normalizeDate(cells[0]),
      time: stripTags(cells[1]),
      code,
      name: stripTags(cells[3]),
      side: normalizeSide(cells[4]),
      qty: parseNum(cells[5]),
      price: parseNum(cells[6]),
      gross: parseNum(cells[7]),
      feeTax: parseNum(cells[8]),
      net: parseNum(cells[9]),
      market: cells[10] ? stripTags(cells[10]) : "",
      settle: cells[11] ? stripTags(cells[11]) : "",
      source: source.label,
      sourceId: source.id,
    });
  }
  return rows;
}

function parseBarContributions(html, source) {
  const entries = [];
  const re = /<div class="bar-meta"><span>([^<]*?)\s+(\d{6})<\/span><strong class="[^"]*">([^<]+)<\/strong>/g;
  for (const match of html.matchAll(re)) {
    const name = stripTags(match[1]);
    const code = match[2];
    const value = parseNum(match[3]);
    if (!name || !/^\d{6}$/.test(code)) continue;
    if (entries.some((item) => item.code === code && item.source === source.label)) continue;
    entries.push({
      code,
      name,
      value,
      source: source.label,
      sourceId: source.id,
      kind: "closed",
      note: `${source.label} 周复盘贡献 ${moneySigned(value)}。`,
    });
  }
  return entries;
}

function extractBalancedTag(html, start, tagName) {
  const openRe = new RegExp(`<${tagName}(?=\\s|>)`, "gi");
  const closeRe = new RegExp(`</${tagName}>`, "gi");
  openRe.lastIndex = start;
  closeRe.lastIndex = start;
  let depth = 0;
  let cursor = start;
  while (cursor < html.length) {
    openRe.lastIndex = cursor;
    closeRe.lastIndex = cursor;
    const open = openRe.exec(html);
    const close = closeRe.exec(html);
    if (!close) break;
    if (open && open.index < close.index) {
      depth += 1;
      cursor = open.index + 1;
    } else {
      depth -= 1;
      cursor = close.index + close[0].length;
      if (depth === 0) return html.slice(start, cursor);
    }
  }
  return "";
}

function extractStaticTradeMaps(html) {
  const start = html.indexOf('<section class="panel" id="stocks"');
  const end = html.indexOf('<section class="panel" id="trades"', start);
  if (start < 0 || end < 0) return {};
  const section = html.slice(start, end);
  const maps = {};
  let offset = 0;
  while (true) {
    const articleStart = section.indexOf('<article class="stock-card">', offset);
    if (articleStart < 0) break;
    const articleHtml = extractBalancedTag(section, articleStart, "article");
    offset = articleStart + Math.max(articleHtml.length, 1);
    const name = stripTags(articleHtml.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] || "");
    const codeText = stripTags(articleHtml.match(/<h3>[\s\S]*?<\/h3>\s*<p>([\s\S]*?)<\/p>/)?.[1] || "");
    const code = codeText.match(/\d{6}/)?.[0];
    const mapStart = articleHtml.indexOf('<div class="trade-map"');
    if (!code || mapStart < 0) continue;
    const tradeMap = extractBalancedTag(articleHtml, mapStart, "div");
    maps[code] = {
      code,
      name,
      html: tradeMap.replace(/<h4>真实分钟线与买卖点<\/h4>/, "<h4>周度真实分钟线与买卖点</h4>"),
    };
  }
  return maps;
}

function groupTrades(trades) {
  const map = new Map();
  for (const trade of trades) {
    const key = `${trade.date}|${trade.time}|${trade.code}|${trade.side}|${trade.qty}|${trade.price}`;
    if (!map.has(key)) {
      map.set(key, { ...trade, sources: [trade.source], sourceIds: [trade.sourceId] });
    } else {
      const existing = map.get(key);
      if (!existing.sources.includes(trade.source)) existing.sources.push(trade.source);
      if (!existing.sourceIds.includes(trade.sourceId)) existing.sourceIds.push(trade.sourceId);
    }
  }
  return [...map.values()].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function sourceSeriesFromReport(report) {
  const series = {};
  for (const stock of report.stocks || []) {
    series[stock.code] = (stock.minute || []).map((point) => [point.ts, point.price]);
  }
  return series;
}

function buildReportSource(source, html) {
  const report = extractReport(html);
  const stockNotes = {};
  for (const stock of report.stocks || []) {
    const line = Array.isArray(stock.analysis) && stock.analysis.length ? stock.analysis[0] : stock.headline;
    stockNotes[stock.code] = stripTags(line || `${source.label} 实际交易标的。`);
  }
  return {
    ...source,
    html,
    trades: (report.trades || []).map((trade) => ({
      date: trade.date || String(trade.dt).slice(0, 10),
      time: String(trade.dt).slice(11),
      code: trade.code,
      name: trade.name,
      side: normalizeSide(trade.side),
      qty: trade.qty,
      price: trade.price,
      gross: trade.gross || Math.abs(trade.net || 0),
      feeTax: trade.fee || 0,
      net: trade.net || 0,
      market: trade.market || "",
      settle: "",
      source: source.label,
      sourceId: source.id,
    })),
    contributions: (report.summary?.stock_contributions || []).map((item) => ({
      code: item.code,
      name: item.name,
      value: Number(item.value || 0),
      source: source.label,
      sourceId: source.id,
      kind: "source-total",
      note: `${source.label} 周度单票贡献 ${moneySigned(item.value)}。`,
    })),
    series: sourceSeriesFromReport(report),
    staticMaps: {},
    stockNotes,
  };
}

function buildTableTrendsSource(source, html) {
  const trends = extractConst(html, "marketTrends") || {};
  const series = {};
  for (const [code, value] of Object.entries(trends)) {
    series[code] = value.points || [];
  }
  return {
    ...source,
    html,
    trades: parseTradesFromTable(html, source),
    contributions: parseBarContributions(html, source),
    series,
    staticMaps: {},
    stockNotes: extractStockNotes(html),
  };
}

function buildTableStaticSource(source, html) {
  return {
    ...source,
    html,
    trades: parseTradesFromTable(html, source),
    contributions: parseBarContributions(html, source),
    series: {},
    staticMaps: extractStaticTradeMaps(html),
    stockNotes: extractStockNotes(html),
  };
}

function buildJsSeriesSource(source, html) {
  const trades = (extractConst(html, "trades") || []).map((trade) => ({
    ...trade,
    side: normalizeSide(trade.side),
    source: source.label,
    sourceId: source.id,
  }));
  const stockMeta = extractConst(html, "stockMeta") || {};
  const contributions = [];
  for (const [code, meta] of Object.entries(stockMeta)) {
    const trade = trades.find((item) => item.code === code);
    contributions.push({
      code,
      name: trade?.name || code,
      value: Number(meta.pnl || 0),
      source: source.label,
      sourceId: source.id,
      kind: "closed",
      note: `${meta.tag || "周度贡献"}：${meta.note || ""}`,
    });
  }
  return {
    ...source,
    html,
    trades,
    contributions,
    series: extractConst(html, "marketSeries") || {},
    staticMaps: {},
    stockNotes: Object.fromEntries(Object.entries(stockMeta).map(([code, meta]) => [code, `${meta.tag || "周度贡献"}：${meta.note || ""}`])),
  };
}

function buildJsHoldingsSource(source, html) {
  const trades = (extractConst(html, "trades") || []).map((trade) => ({
    ...trade,
    side: normalizeSide(trade.side),
    source: source.label,
    sourceId: source.id,
  }));
  const analyses = extractConst(html, "stockAnalyses") || [];
  const stockMeta = extractConst(html, "stockMeta") || {};
  const holdings = extractConst(html, "confirmedHoldings") || {};
  const contributions = analyses.map((item) => {
    const hold = holdings[item.code];
    const value = hold ? Number(hold.pnl) : Number(item.realized || 0);
    const holdNote = hold
      ? `期末持仓口径：持有 ${fmt0(hold.qty)} 股，持仓盈亏 ${moneySigned(hold.pnl)}，仓位 ${hold.weight.toFixed(2)}%。`
      : `${stockMeta[item.code]?.tag || "闭环"}：${stockMeta[item.code]?.note || "本周已闭环。"}`;
    return {
      code: item.code,
      name: item.name,
      value,
      source: source.label,
      sourceId: source.id,
      kind: hold ? "holding" : "closed",
      note: holdNote,
    };
  });
  return {
    ...source,
    html,
    trades,
    contributions,
    series: extractConst(html, "marketSeries") || {},
    staticMaps: {},
    stockNotes: Object.fromEntries(contributions.map((item) => [item.code, item.note])),
  };
}

function extractStockNotes(html) {
  const notes = {};
  let offset = 0;
  while (true) {
    const idx = html.indexOf('<article class="stock-card">', offset);
    if (idx < 0) break;
    const article = extractBalancedTag(html, idx, "article");
    offset = idx + Math.max(article.length, 1);
    const h3 = stripTags(article.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] || "");
    const codeText = stripTags(article.match(/<h3>[\s\S]*?<\/h3>\s*<p>([\s\S]*?)<\/p>/)?.[1] || "");
    const code = codeText.match(/\d{6}/)?.[0];
    if (!code) continue;
    const afterTop = article.split(/<\/div>\s*<p>/)[1];
    const note = afterTop ? stripTags(afterTop.split("</p>")[0]) : "";
    notes[code] = note || `${h3} 周度实际交易标的。`;
  }
  return notes;
}

function buildSource(source) {
  const html = readSource(source.id);
  if (source.parser === "report") return buildReportSource(source, html);
  if (source.parser === "table-trends") return buildTableTrendsSource(source, html);
  if (source.parser === "table-static") return buildTableStaticSource(source, html);
  if (source.parser === "js-series") return buildJsSeriesSource(source, html);
  if (source.parser === "js-holdings") return buildJsHoldingsSource(source, html);
  throw new Error(`Unknown parser ${source.parser}`);
}

function renderTradeMap(stockTrades, series, stock, source) {
  const sorted = [...stockTrades].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const points = (series || []).filter((point) => Array.isArray(point) && point.length >= 2 && Number.isFinite(Number(point[1])));
  const hasSeries = points.length > 1;
  const width = 900;
  const height = 300;
  const left = 54;
  const right = 876;
  const top = 24;
  const base = 252;
  const priceValues = hasSeries ? points.map((point) => Number(point[1])).concat(sorted.map((item) => item.price)) : sorted.map((item) => item.price);
  const min = Math.min(...priceValues);
  const max = Math.max(...priceValues);
  const pad = Math.max((max - min) * 0.12, max * 0.006, 0.02);
  const low = min - pad;
  const high = max + pad;
  const y = (price) => base - ((price - low) / Math.max(0.0001, high - low)) * (base - top);
  const parseStamp = (stamp) => {
    const [date, time] = String(stamp).split(" ");
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute || 0).getTime();
  };
  const minuteIndex = new Map(points.map((point, index) => [point[0], index]));
  const nearestIndex = (stamp) => {
    if (!hasSeries) return 0;
    if (minuteIndex.has(stamp)) return minuteIndex.get(stamp);
    const target = parseStamp(stamp);
    let best = 0;
    let gap = Infinity;
    for (let index = 0; index < points.length; index += 1) {
      const currentGap = Math.abs(parseStamp(points[index][0]) - target);
      if (currentGap < gap) {
        best = index;
        gap = currentGap;
      }
    }
    return best;
  };
  const x = (index) => {
    if (!hasSeries) return sorted.length <= 1 ? left + (right - left) / 2 : left + (index / (sorted.length - 1)) * (right - left);
    return left + (index / Math.max(1, points.length - 1)) * (right - left);
  };
  const dayStarts = [];
  const seenDays = new Set();
  points.forEach((point, index) => {
    const day = point[0].slice(5, 10);
    if (!seenDays.has(day)) {
      seenDays.add(day);
      dayStarts.push({ day, index });
    }
  });
  const line = hasSeries ? points.map((point, index) => `${x(index).toFixed(1)},${y(Number(point[1])).toFixed(1)}`).join(" ") : "";
  const fill = hasSeries ? `M ${line} L ${right} ${base} L ${left} ${base} Z` : "";
  const ticks = [high, (high + low) / 2, low];
  const grid = dayStarts.map(({ day, index }) => {
    const xx = x(index);
    return `<g><line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${top}" y2="${base}" stroke="rgba(28,37,48,.06)" stroke-dasharray="4 6"></line><text x="${xx.toFixed(1)}" y="287" text-anchor="middle" class="axis-label">${day}</text></g>`;
  }).join("");
  const markerSlots = {};
  const markers = sorted.map((trade, fallbackIndex) => {
    const stamp = `${trade.date} ${trade.time.slice(0, 5)}`;
    const idx = hasSeries ? nearestIndex(stamp) : fallbackIndex;
    const xx = x(idx);
    const yy = y(trade.price);
    const slotKey = `${stamp}|${trade.side}`;
    const slot = markerSlots[slotKey] || 0;
    markerSlots[slotKey] = slot + 1;
    const isBuy = trade.side === "买入";
    const color = isBuy ? "#d04a34" : "#1d4ed8";
    const labelY = Math.max(14, Math.min(286, yy + (isBuy ? -14 : 20) + (slot % 4) * (isBuy ? -10 : 10)));
    const labelX = Math.max(18, Math.min(882, xx + ((slot % 5) - 2) * 9));
    const shape = isBuy
      ? `<path d="M ${xx.toFixed(1)} ${(yy - 8).toFixed(1)} L ${(xx - 8).toFixed(1)} ${(yy + 8).toFixed(1)} L ${(xx + 8).toFixed(1)} ${(yy + 8).toFixed(1)} Z" fill="${color}" stroke="#fff" stroke-width="2"></path>`
      : `<path d="M ${xx.toFixed(1)} ${(yy + 8).toFixed(1)} L ${(xx - 8).toFixed(1)} ${(yy - 8).toFixed(1)} L ${(xx + 8).toFixed(1)} ${(yy - 8).toFixed(1)} Z" fill="${color}" stroke="#fff" stroke-width="2"></path>`;
    return `<g><title>${escapeHtml(trade.name)} ${trade.side} ${trade.date} ${trade.time} ${fmt3(trade.price)} / ${fmt0(trade.qty)} 股</title><line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${Math.min(yy, base).toFixed(1)}" y2="${base}" stroke="rgba(28,37,48,.18)" stroke-dasharray="3 5"></line>${shape}<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" class="point-label">${isBuy ? "买" : "卖"}</text></g>`;
  }).join("");
  const chart = hasSeries
    ? `<svg class="trade-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(stock.name)} ${escapeHtml(source.label)} 真实分钟线买卖点图"><defs><linearGradient id="fill-${stock.code}-${source.label.replace(/\W/g, "")}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="rgba(20,149,111,.22)"></stop><stop offset="100%" stop-color="rgba(20,149,111,.02)"></stop></linearGradient></defs><line x1="${left}" x2="${left}" y1="${top}" y2="${base}" stroke="rgba(28,37,48,.16)"></line><line x1="${left}" x2="${right}" y1="${base}" y2="${base}" stroke="rgba(28,37,48,.16)"></line>${ticks.map((value, index) => { const yy = top + index * ((base - top) / 2); return `<g><line x1="${left}" x2="${right}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" stroke="rgba(28,37,48,.08)"></line><text x="42" y="${(yy + 4).toFixed(1)}" text-anchor="end" class="axis-label">${value.toFixed(2)}</text></g>`; }).join("")}${grid}<path d="${fill}" fill="url(#fill-${stock.code}-${source.label.replace(/\W/g, "")})"></path><polyline points="${line}" class="market-line"></polyline>${markers}<text x="${left}" y="272" text-anchor="start" class="axis-label">${points[0][0].slice(5)}</text><text x="${right}" y="272" text-anchor="end" class="axis-label">${points[points.length - 1][0].slice(5)}</text></svg>`
    : `<svg class="trade-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(stock.name)} 分钟线缺失"><text x="450" y="150" text-anchor="middle" class="axis-label">该来源周分钟线数据待补，成交时间已完整保留</text>${markers}</svg>`;
  const buys = sorted.filter((trade) => trade.side === "买入");
  const sells = sorted.filter((trade) => trade.side === "卖出");
  const avgBuy = buys.length ? buys.reduce((sum, item) => sum + item.price * item.qty, 0) / buys.reduce((sum, item) => sum + item.qty, 0) : null;
  const avgSell = sells.length ? sells.reduce((sum, item) => sum + item.price * item.qty, 0) / sells.reduce((sum, item) => sum + item.qty, 0) : null;
  const rangeLine = hasSeries
    ? `${source.label} 真实分钟线：${points[0][0].slice(5)} 至 ${points[points.length - 1][0].slice(5)}，高 ${Math.max(...points.map((point) => point[1])).toFixed(2)} / 低 ${Math.min(...points.map((point) => point[1])).toFixed(2)}。`
    : `${source.label} 暂无可结构化分钟线，先保留买卖点和完整流水。`;
  return `<div class="trade-map" aria-label="${escapeHtml(stock.name)} ${escapeHtml(source.label)} 买卖点地图">
    <div class="trade-map-head"><h4>${escapeHtml(source.label)} 真实分钟线与买卖点</h4><div class="trade-legend"><span class="legend-item"><i class="legend-shape buy"></i>买入</span><span class="legend-item"><i class="legend-shape sell"></i>卖出</span></div></div>
    <ul class="trade-context"><li>图中绿线为周复盘同口径真实分钟走势，买/卖标记为该来源周实际成交点。</li><li>${escapeHtml(rangeLine)}</li><li>成交 ${sorted.length} 笔；${avgBuy ? `买入均价 ${avgBuy.toFixed(3)}；` : "无买入；"}${avgSell ? `卖出均价 ${avgSell.toFixed(3)}。` : "无卖出。"}</li></ul>
    <div class="trade-chart-wrap">${chart}</div>
    <div class="trade-point-list">${sorted.map((trade) => `<div class="trade-point-item"><span><b class="${trade.side === "买入" ? "buy" : "sell"}">${trade.side}</b> ${trade.date.slice(5)} ${trade.time}</span><strong>${fmt3(trade.price)} / ${fmt0(trade.qty)} 股</strong></div>`).join("")}</div>
  </div>`;
}

function capTags(tags) {
  const aliases = {
    非第一趋势: "非第一",
    弱转强误判: "买点复盘",
    可复制: "值得复制",
  };
  const normalized = [];
  for (const tag of tags) {
    const fixed = aliases[tag] || tag;
    if (!TAG_DICTIONARY.includes(fixed)) continue;
    if (!normalized.includes(fixed)) normalized.push(fixed);
  }
  return normalized.slice(0, 4);
}

function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00+08:00`).getTime();
  const b = new Date(`${dateB}T00:00:00+08:00`).getTime();
  return Math.round((b - a) / 86400000);
}

function detectStopLossRebuy(stock) {
  if (!stock.pnlKnown || stock.pnl >= 0) return false;
  const sorted = [...stock.trades].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  for (let i = 0; i < sorted.length; i += 1) {
    const trade = sorted[i];
    if (trade.side !== "卖出") continue;
    for (let j = i + 1; j < sorted.length; j += 1) {
      const next = sorted[j];
      if (next.side !== "买入") continue;
      const gap = daysBetween(trade.date, next.date);
      if (gap >= 0 && gap <= 3) return true;
    }
  }
  return false;
}

function repeatableModel(trigger, buy, sell, invalidation) {
  return { trigger, buy, sell, invalidation };
}

function finalizeAudit(stock, audit) {
  const redLines = [...(audit.redLines || [])];
  const tags = [...(audit.tags || [])];
  if (detectStopLossRebuy(stock)) {
    if (!redLines.includes("止损后回补")) redLines.push("止损后回补");
    if (!tags.includes("止损后回补")) tags.unshift("止损后回补");
  }
  const operationType = OPERATION_TYPES.includes(audit.operationType) ? audit.operationType : "套利";
  return {
    mode: audit.mode || "需复核",
    operationType,
    plan: audit.plan || "暂无预案记录。",
    execution: audit.execution || "实际执行待从周度预案补齐。",
    correctAction: audit.correctAction || "先确认是否第一唯一性；不确定则轻仓或放弃。",
    dragonEvidence: audit.dragonEvidence || "暂无定龙证据记录。",
    redLines,
    psychology: audit.psychology || [],
    copyModel: audit.copyModel || null,
    ...audit,
    operationType,
    tags: capTags(tags),
    redLines,
  };
}

function judgment(stock, value) {
  const name = stock.name;
  if (name === "神剑股份") return "月前参考周的核心正样本：定龙正确、辨识度最高，说明围绕第一唯一性做时利润弹性最大。";
  if (name === "通鼎互联") return "5月自然月内唯一明确大幅正贡献，说明主线与核心嗅觉在线。";
  if (name === "大有能源") return "月后参考周的正样本：第一性、唯一性确认后，期末持仓浮盈能够放大利润。";
  if (name === "达实智能") return "5月后段核心处理较有效，条件单兑现和留仓利润修复了部分回撤。";
  if (name === "华电辽能") return "最大纪律样本：后排替代核心、止损后快速回补，风险切断没有真正完成。";
  if (name === "华能蒙电") return "亏损后加单、弱票当核心，是5月后段必须停止的主要动作。";
  if (name === "大唐电信") return "后排替代大唐发电核心，确定性不足，题材热不等于个股有地位。";
  if (name === "粤电力A") return "月后参考周的亏损样本：有身位不等于唯一辨识度，中高位弱转强没有唯一性不能做。";
  if (name === "中京电子") return "趋势题材里非第一名，不能按核心预期处理。";
  if (value > 500) return "正贡献较明显，后续复盘重点看是否来自核心地位，而不是偶然价差。";
  if (value > 0) return "小额正贡献，不构成月度主线，保留为低仓套利样本。";
  if (value < -500) return "负贡献较大，优先检查是否偏离第一性、唯一性或出现亏损后加仓。";
  if (value < 0) return "小亏闭环，重点检查买点是否过急、标的地位是否不够。";
  return "贡献待核算，先保留成交事实和买卖点。";
}

function stockAudit(stock) {
  const presets = {
    神剑股份: {
      tags: ["核心龙头", "值得复制"],
      verdict: "值得复制",
      lessonType: "copy",
      lesson: "定龙正确、围绕第一唯一性参与，是本月可复制的盈利样本。",
    },
    通鼎互联: {
      tags: ["核心龙头", "值得复制"],
      verdict: "值得复制",
      lessonType: "copy",
      lesson: "5月自然月内最清晰正贡献，说明主线核心嗅觉在线，应继续复制。",
    },
    大有能源: {
      tags: ["核心龙头", "值得复制"],
      verdict: "值得复制",
      lessonType: "copy",
      lesson: "第一性和唯一性确认后持仓放大利润，是月后参考周的正样本。",
    },
    达实智能: {
      tags: ["核心处理", "值得复制"],
      verdict: "值得复制",
      lessonType: "copy",
      lesson: "围绕阶段核心做条件单和留仓，修复了部分回撤，但仍需控制非核心扩散。",
    },
    华电辽能: {
      tags: ["后排替代", "止损后回补"],
      verdict: "可避免",
      lessonType: "error",
      lesson: "最大错误样本：后排替代核心，止损后又快速买回同等仓位，风险切断失败。",
    },
    华能蒙电: {
      tags: ["亏损后加单", "非唯一中高位"],
      verdict: "可避免",
      lessonType: "error",
      lesson: "弱票当核心且亏损后加单，是5月后段必须停止的动作。",
    },
    大唐电信: {
      tags: ["后排替代", "非第一"],
      verdict: "可避免",
      lessonType: "error",
      lesson: "大唐主线里没有做唯一高辨识度核心，转去后排替代，确定性不足。",
    },
    大连热电: {
      tags: ["后排末端", "低确定性"],
      verdict: "可避免",
      lessonType: "error",
      lesson: "大唐方向后排末端，容错低，不能当核心预期处理。",
    },
    华电能源: {
      tags: ["后排替代", "跟风票"],
      verdict: "可避免",
      lessonType: "error",
      lesson: "华能/电力线里的跟风票，不能给核心预期。",
    },
    粤电力A: {
      tags: ["非唯一中高位", "弱转强误判"],
      verdict: "可避免",
      lessonType: "error",
      lesson: "有身位不等于唯一辨识度，中高位没有唯一性时不能左侧硬做。",
    },
    中京电子: {
      tags: ["非第一趋势", "非模式"],
      verdict: "可避免",
      lessonType: "error",
      lesson: "趋势题材里非第一名，不能按核心龙头模式处理。",
    },
    圣阳股份: {
      tags: ["非模式", "尾盘试错"],
      verdict: "可避免",
      lessonType: "error",
      lesson: "非模式标的和尾盘试错不应进入月度主战场。",
    },
    京能电力: {
      tags: ["买点过急", "非唯一"],
      verdict: "可避免",
      lessonType: "error",
      lesson: "开盘快速成交、买点太急，标的地位也不够唯一。",
    },
  };
  const enhancements = {
    神剑股份: {
      mode: "模式内",
      operationType: "做T",
      plan: "暂无预案记录；按月度规则，应围绕第一唯一性核心处理。",
      execution: "实际围绕核心辨识度标的参与，并形成大额正贡献。",
      correctAction: "继续只围绕第一唯一性做，盈利后保护利润。",
      dragonEvidence: "题材内辨识度高、周度贡献突出、走势弹性强。",
      copyModel: repeatableModel("第一唯一性确认，且市场辨识度集中", "只在核心确认后参与，不扩散到后排", "利润兑现或强转弱时降风险", "失去唯一性、后排开始分流、封单/承接转弱"),
    },
    通鼎互联: {
      mode: "模式内",
      operationType: "做T",
      plan: "暂无预案记录；应围绕5月自然月内最明确核心处理。",
      execution: "抓住5月最清晰正贡献，但后排交易稀释利润。",
      correctAction: "主仓留在通鼎互联这类第一辨识度，其他后排不分仓。",
      dragonEvidence: "5月自然月内唯一明确大幅正贡献，主线核心嗅觉在线。",
      copyModel: repeatableModel("主线强、个股辨识度唯一且贡献开始放大", "围绕核心分歧/确认点做，不用后排替代", "核心走弱或利润达到预案时分批落袋", "不再是题材第一、成交承接明显弱化"),
    },
    大有能源: {
      mode: "模式内",
      operationType: "低吸",
      plan: "暂无预案记录；确认第一性和唯一性后才允许持有。",
      execution: "第一性确认后持仓，期末浮盈放大利润。",
      correctAction: "只在第一性确认后继续持有，避免扩散到同题材后排。",
      dragonEvidence: "月后参考周中第一性、唯一性较清晰，期末持仓浮盈确认。",
      copyModel: repeatableModel("阶段核心地位确认，走势与辨识度同步增强", "确认后低吸或回踩承接点参与", "保留核心利润，跌破核心地位即减仓", "题材退潮、同题材更强票夺位"),
    },
    达实智能: {
      mode: "模式内",
      operationType: "做T",
      plan: "暂无预案记录；阶段核心出现后围绕核心处理。",
      execution: "条件单兑现与留仓修复了部分回撤。",
      correctAction: "继续围绕阶段核心处理，但不能把利润扩散到弱票。",
      dragonEvidence: "5月后段核心处理有效，利润修复来自更接近核心的标的。",
      copyModel: repeatableModel("阶段核心走出，且有条件单/承接可执行", "围绕核心分歧做T，仓位不扩散", "条件单兑现或弱化时保护利润", "核心地位不再明确或同阶段更强票出现"),
    },
    华电辽能: {
      mode: "非模式",
      operationType: "低吸",
      plan: "暂无预案记录；按月度规则，非第一后排应放弃。",
      execution: "做了后排替代，止损后又快速买回，风险切断失败。",
      correctAction: "卖出后当天不回补；只回到阶段第一辨识度核心。",
      dragonEvidence: "非第一唯一性，亏损来自后排替代核心。",
      redLines: ["后排替代", "止损后回补"],
      psychology: ["后排幻想", "亏损修复冲动"],
    },
    华能蒙电: {
      mode: "非模式",
      operationType: "低吸",
      plan: "暂无预案记录；弱票和非唯一中高位不应当核心做。",
      execution: "弱票当核心，且亏损后继续加单。",
      correctAction: "亏损后先降风险，不加单；没有唯一性就放弃。",
      dragonEvidence: "非唯一中高位，不能证明市场第一辨识度。",
      redLines: ["亏损后加单", "非唯一中高位"],
      psychology: ["急躁", "亏损修复冲动"],
    },
    大唐电信: {
      mode: "非模式",
      operationType: "半路",
      plan: "暂无预案记录；大唐方向应盯大唐发电这类第一辨识度。",
      execution: "用后排替代大唐方向核心。",
      correctAction: "只看第一核心；后排没有地位就不做。",
      dragonEvidence: "题材热，但个股不是唯一高辨识度核心。",
      redLines: ["后排替代", "非第一"],
      psychology: ["题材兴奋", "后排幻想"],
    },
    大连热电: {
      mode: "非模式",
      operationType: "套利",
      plan: "暂无预案记录；后排末端不能按核心预期处理。",
      execution: "大唐方向后排末端试错，容错低。",
      correctAction: "后排末端直接放弃。",
      dragonEvidence: "后排末端，低确定性，缺乏唯一性。",
      redLines: ["后排替代"],
      psychology: ["后排幻想"],
    },
    华电能源: {
      mode: "非模式",
      operationType: "套利",
      plan: "暂无预案记录；华能/电力线应只看阶段第一辨识度。",
      execution: "参与跟风票。",
      correctAction: "跟风票不做，只等真正第一核心。",
      dragonEvidence: "跟风票，非题材内唯一。",
      redLines: ["后排替代", "非第一"],
      psychology: ["后排幻想"],
    },
    粤电力A: {
      mode: "非模式",
      operationType: "低吸",
      plan: "暂无预案记录；非唯一中高位不做左侧硬参与。",
      execution: "有身位但不唯一，中高位弱转强误判。",
      correctAction: "没有唯一性时只观察，不左侧买。",
      dragonEvidence: "有身位不等于唯一辨识度。",
      redLines: ["非唯一中高位"],
      psychology: ["急躁", "题材兴奋"],
    },
    中京电子: {
      mode: "非模式",
      operationType: "趋势",
      plan: "暂无预案记录；趋势题材非第一不纳入龙头模式。",
      execution: "把非第一趋势票按核心预期处理。",
      correctAction: "不熟悉趋势行情就不参与。",
      dragonEvidence: "趋势方向非第一名，不符合龙头唯一性。",
      redLines: ["非模式", "非第一"],
      psychology: ["题材兴奋"],
    },
    圣阳股份: {
      mode: "非模式",
      operationType: "尾盘试错",
      plan: "暂无预案记录；非模式标的不进入月度主战场。",
      execution: "尾盘试错失败，亏损来自价差和费用。",
      correctAction: "非模式尾盘票直接放弃。",
      dragonEvidence: "不属于当前核心模式。",
      redLines: ["非模式"],
      psychology: ["急躁"],
    },
    京能电力: {
      mode: "非模式",
      operationType: "半路",
      plan: "暂无预案记录；开盘急买前必须确认唯一性。",
      execution: "开盘7分钟内快速成交，买点太急。",
      correctAction: "先等地位确认，买点不追急。",
      dragonEvidence: "标的地位不够唯一，买点过急。",
      redLines: ["买点过急"],
      psychology: ["急躁"],
    },
  };
  const preset = presets[stock.name];
  if (preset) return finalizeAudit(stock, { ...preset, ...(enhancements[stock.name] || {}) });
  if (!stock.pnlKnown) {
    return finalizeAudit(stock, {
      tags: ["待核算"],
      verdict: "不确定",
      lessonType: "neutral",
      lesson: "贡献待核算，先保留买卖点和完整流水。",
      mode: "需复核",
      operationType: "套利",
    });
  }
  if (stock.pnl > 0) {
    return finalizeAudit(stock, {
      tags: stock.pnl > 500 ? ["正贡献", "需验证核心地位"] : ["轻仓套利", "小额正贡献"],
      verdict: stock.pnl > 500 ? "不确定" : "赚钱但不可复制",
      lessonType: "copy",
      lesson: stock.pnl > 500 ? "正贡献较明显，但仍需确认是否来自核心地位。" : "小额盈利只可作为轻仓套利样本，赚钱但不可复制，不能升级为主线。",
      mode: "需复核",
      operationType: "套利",
      correctAction: "盈利也不能自动升级为核心；只保留轻仓套利定位。",
      execution: "形成小额正贡献，但不构成本月主线。",
    });
  }
  return finalizeAudit(stock, {
    tags: stock.pnl < -500 ? ["负贡献", "需查第一性"] : ["小亏闭环", "买点复盘"],
    verdict: stock.pnl < -500 ? "可避免" : "不确定",
    lessonType: "error",
    lesson: stock.pnl < -500 ? "负贡献较大，优先检查是否偏离第一性、唯一性或出现亏损后加仓。" : "小亏闭环，重点检查买点是否过急、标的地位是否不够。",
    mode: "需复核",
    operationType: "套利",
    correctAction: "亏损票先查第一性；不能证明核心地位就不做。",
  });
}

function renderChips(items, extraClass = "") {
  return items.map((item) => `<span class="mini-chip ${extraClass}">${escapeHtml(item)}</span>`).join("");
}

function modeStats(stocks) {
  const total = stocks.length || 1;
  return ["模式内", "非模式", "需复核"].map((mode) => {
    const items = stocks.filter((stock) => stock.audit.mode === mode);
    return { mode, count: items.length, pct: Math.round((items.length / total) * 100) };
  });
}

function redlineStats(stocks) {
  const counts = new Map();
  for (const stock of stocks) {
    for (const redLine of stock.audit.redLines || []) {
      if (!counts.has(redLine)) counts.set(redLine, { name: redLine, count: 0, stocks: [] });
      const item = counts.get(redLine);
      item.count += 1;
      item.stocks.push(stock.name);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

function operationStats(stocks) {
  const counts = new Map();
  for (const stock of stocks) {
    const key = stock.audit.operationType || "套利";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function renderAuditMeta(stock) {
  const redLines = stock.audit.redLines?.length ? renderChips(stock.audit.redLines, "danger") : `<span class="mini-chip">无红线标记</span>`;
  return `<div class="audit-strip">
    <span><b>操作类型</b>${escapeHtml(stock.audit.operationType)}</span>
    <span><b>模式归属</b>${escapeHtml(stock.audit.mode)}</span>
    <span><b>交易前预案</b>${escapeHtml(stock.audit.plan)}</span>
    <span><b>实际执行</b>${escapeHtml(stock.audit.execution)}</span>
    <span><b>当时最正确动作</b>${escapeHtml(stock.audit.correctAction)}</span>
    <span><b>红线标记</b><em>${redLines}</em></span>
  </div>`;
}

function renderCopyModel(model) {
  if (!model) return "";
  return `<div class="copy-model"><h4>可复制模型</h4><div class="mini-grid">
    <span><b>触发条件</b>${escapeHtml(model.trigger)}</span>
    <span><b>买点</b>${escapeHtml(model.buy)}</span>
    <span><b>卖点</b>${escapeHtml(model.sell)}</span>
    <span><b>失效条件</b>${escapeHtml(model.invalidation)}</span>
  </div></div>`;
}

function buildModel() {
  const sources = sourceDefs.map(buildSource);
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const allRawTrades = sources.flatMap((source) => source.trades);
  const trades = groupTrades(allRawTrades);
  const stockMap = new Map();

  function ensureStock(code, name) {
    if (!stockMap.has(code)) {
      stockMap.set(code, {
        code,
        name: name || code,
        trades: [],
        contributionEntries: [],
        sources: new Set(),
        notes: [],
      });
    }
    const stock = stockMap.get(code);
    if (name && stock.name === code) stock.name = name;
    return stock;
  }

  for (const trade of trades) {
    const stock = ensureStock(trade.code, trade.name);
    stock.trades.push(trade);
    for (const label of trade.sources) stock.sources.add(label);
  }

  for (const source of sources) {
    for (const entry of source.contributions) {
      const stock = ensureStock(entry.code, entry.name);
      stock.contributionEntries.push(entry);
      stock.sources.add(entry.source);
      if (entry.note) stock.notes.push(entry.note);
    }
    for (const [code, note] of Object.entries(source.stockNotes || {})) {
      const stock = stockMap.get(code);
      if (stock && note) stock.notes.push(note);
    }
  }

  const stocks = [...stockMap.values()].map((stock) => {
    const pnlKnown = stock.contributionEntries.length > 0;
    const pnl = pnlKnown ? stock.contributionEntries.reduce((sum, entry) => sum + Number(entry.value || 0), 0) : null;
    const chartSources = sources.filter((source) => stock.trades.some((trade) => trade.sourceIds.includes(source.id)));
    const built = {
      ...stock,
      pnlKnown,
      pnl,
      sourceLabels: [...stock.sources],
      chartSources,
      note: [...new Set(stock.notes)].filter(Boolean).slice(0, 3).join("；") || judgment(stock, pnl || 0),
    };
    return {
      ...built,
      audit: stockAudit(built),
      firstTradeTime: stock.trades
        .map((trade) => `${trade.date} ${trade.time}`)
        .sort()[0] || "",
    };
  });

  const includedMay = sources.filter((source) => source.includedInMay).reduce((sum, source) => sum + source.accountPnl, 0);
  const expanded = sources.reduce((sum, source) => sum + source.accountPnl, 0);
  const sourceStockPairs = stocks.reduce((sum, stock) => sum + stock.chartSources.length, 0);
  return {
    sources,
    sourceMap,
    trades,
    stocks,
    includedMay,
    expanded,
    sourceStockPairs,
    buyCount: trades.filter((trade) => trade.side === "买入").length,
    sellCount: trades.filter((trade) => trade.side === "卖出").length,
  };
}

function renderRankRows(stocks, positive) {
  const rows = stocks
    .filter((stock) => stock.pnlKnown && (positive ? stock.pnl > 0 : stock.pnl < 0))
    .sort((a, b) => positive ? b.pnl - a.pnl : a.pnl - b.pnl);
  return rows.map((stock) => `<tr>
    <td><strong>${escapeHtml(stock.name)}</strong><br><small>${escapeHtml(stock.code)}</small></td>
    <td class="${stock.pnl >= 0 ? "pos" : "neg"}"><strong>${moneySigned(stock.pnl)}</strong></td>
    <td>${escapeHtml(stock.sourceLabels.join(" / "))}</td>
    <td><div class="tag-row">${renderChips(stock.audit.tags)}</div></td>
    <td>${escapeHtml(stock.audit.operationType)}<br><small>${escapeHtml(stock.audit.mode)}</small></td>
    <td><span class="chip ${stock.audit.verdict === "值得复制" ? "pos" : stock.audit.verdict === "可避免" ? "neg" : "warn"}">${escapeHtml(positive ? `可复制性：${stock.audit.verdict}` : `可避免性：${stock.audit.verdict}`)}</span></td>
    <td>${escapeHtml(judgment(stock, stock.pnl))}</td>
  </tr>`).join("");
}

function renderUnknownRows(stocks) {
  const rows = stocks.filter((stock) => !stock.pnlKnown);
  if (!rows.length) return "";
  return `<section class="panel"><h2>待核算标的</h2><p class="section-note">这些票有成交事实和买卖点，但源周未给出可确认成本或闭环贡献，先不硬塞进盈亏排行。</p><div class="mini-grid">${rows.map((stock) => `<span><b>${escapeHtml(stock.name)} ${escapeHtml(stock.code)}</b>${escapeHtml(stock.sourceLabels.join(" / "))}</span>`).join("")}</div></section>`;
}

function renderStockGroup(stock, model, openSet) {
  const flow = stock.trades.map((trade) => `<div class="flow-item"><b class="${trade.side === "买入" ? "neg" : "blue"}">${trade.side}</b> ${trade.date} ${trade.time}<br>${fmt3(trade.price)} / ${fmt0(trade.qty)} 股 · ${escapeHtml(trade.sources.join(" / "))}</div>`).join("");
  const chartStack = stock.chartSources.map((source) => {
    const trades = stock.trades.filter((trade) => trade.sourceIds.includes(source.id));
    const staticMap = source.staticMaps?.[stock.code]?.html;
    const chart = staticMap || renderTradeMap(trades, source.series?.[stock.code] || [], stock, source);
    return `<article class="chart-card"><div class="card-head"><span class="chip">${escapeHtml(source.label)}</span><a class="blue" href="${source.href}">来源周复盘</a></div>${chart}</article>`;
  }).join("");
  const lessonClass = stock.audit.lessonType === "copy" ? "pos" : stock.audit.lessonType === "error" ? "neg" : "warn";
  const lessonTitle = stock.audit.lessonType === "copy" ? "关键复制点" : stock.audit.lessonType === "error" ? "关键错误点" : "关键观察点";
  const openAttr = openSet.has(stock.code) ? " open" : "";
  return `<section class="stock-group" id="stock-${escapeHtml(stock.code)}">
    <details class="stock-detail"${openAttr}>
      <summary><div class="stock-group-head"><div><h3>${escapeHtml(stock.name)} <small>${escapeHtml(stock.code)}</small></h3><p>${escapeHtml(stock.note)}</p><div class="tag-row">${renderChips(stock.audit.tags)}</div></div><span class="chip ${stock.pnl == null ? "" : stock.pnl >= 0 ? "pos" : "neg"}">${stock.pnlKnown ? moneySigned(stock.pnl) : "待核算"}</span></div></summary>
      <div class="stock-detail-body">
        <div class="lesson-box ${lessonClass}"><b>${lessonTitle}</b><p>${escapeHtml(stock.audit.lesson)}</p></div>
        ${renderAuditMeta(stock)}
${renderCopyModel(stock.audit.copyModel)}
        <div><h4>完整成交流水</h4><div class="flow-list">${flow}</div></div>
        <div class="chart-stack">${chartStack}</div>
      </div>
    </details>
  </section>`;
}

function renderTradesTable(trades) {
  return trades.map((trade) => `<tr>
    <td>${trade.date}</td><td>${trade.time}</td><td>${trade.code}</td><td>${escapeHtml(trade.name)}</td>
    <td><span class="side-tag ${trade.side === "买入" ? "buy" : "sell"}">${trade.side}</span></td>
    <td>${fmt0(trade.qty)}</td><td>${fmt3(trade.price)}</td><td>${money(trade.gross)}</td><td>${money(trade.feeTax)}</td>
    <td class="${trade.net >= 0 ? "pos" : "neg"}">${moneySigned(trade.net)}</td><td>${escapeHtml(trade.sources.join(" / "))}</td>
  </tr>`).join("");
}

function renderStockNavLinks(stocks, title) {
  return `<div class="stock-nav-mode">${escapeHtml(title)}</div>${stocks.map((stock) => {
    const pnlClass = stock.pnlKnown ? (stock.pnl >= 0 ? "pos" : "neg") : "warn";
    const pnlText = stock.pnlKnown ? moneySigned(stock.pnl) : "待核算";
    return `<a href="#stock-${escapeHtml(stock.code)}"><span>${escapeHtml(stock.name)} <small>${escapeHtml(stock.code)}</small></span><b class="${pnlClass}">${pnlText}</b></a>`;
  }).join("")}`;
}

function renderVerdictSection() {
  return `<section class="panel verdict-panel" id="verdict">
    <div class="card-head"><div><h2>本月最大错误</h2><p class="section-note">审判结论先行：按系统伤害排序，5月不是买卖点单点问题，而是交易对象偏离第一唯一性。</p></div><span class="chip neg">审判书</span></div>
    <div class="damage-bar"><b>系统伤害</b><strong class="neg">极高</strong><span>可见后果：5月自然月账户结果 ${moneySigned(-7398.25)}；伤害本质是“核心盈利被后排与红线动作吞噬”，不是单票亏损大小。</span></div>
    <div class="verdict-grid">
      <article class="verdict-card danger"><div class="card-head"><h3>主罪：放弃第一龙头，转做后排替代</h3><span class="chip neg">系统伤害最大</span></div><p>华电辽能、大唐电信、大连热电、华能蒙电、华电能源共同指向同一件事：题材热不等于个股有地位，非第一没有核心预期。</p></article>
      <article class="verdict-card danger"><div class="card-head"><h3>次罪：止损后回补，亏损后加单</h3><span class="chip neg">红线</span></div><p>华电辽能止损后快速买回，华能蒙电亏损后继续加单，说明卖出动作没有真正切断风险，反而把错误延长。</p></article>
      <article class="verdict-card warn"><div class="card-head"><h3>隐患：标的扩散，弱化核心专注</h3><span class="chip warn">下月盯紧</span></div><p>扩展样本 34 只、159 笔，说明注意力仍会被后排、补涨、非模式标的稀释；正确样本其实已经很清楚：神剑股份、通鼎互联、大有能源、达实智能。</p></article>
    </div>
  </section>`;
}

function renderScoresSection() {
  const scores = [
    ["风控质量", "1/5", "多笔亏损属于可避免亏损，风险没有在第一次卖出时结束。", "neg"],
    ["定龙质量", "2/5", "有通鼎互联、达实智能、大有能源等正确样本，但最大亏损来自放弃第一、转做后排。", "neg"],
    ["执行纪律", "1/5", "止损后回补、亏损后加单、临盘扩散仍出现，是本月最需要审判的执行问题。", "neg"],
    ["买卖点质量", "2/5", "部分核心票处理有效，但京能电力、华能蒙电等买点过急，买卖点质量被选股错误拖垮。", "warn"],
    ["仓位集中度", "2/5", "扩展样本 34 只、159 笔，标的数量明显偏多，注意力被后排和非模式标的稀释。", "warn"],
  ];
  return `<section class="panel" id="scores"><h2>五项评分</h2><p class="section-note">评分服务于审判，不做安慰分；优先级固定为：风控质量 > 定龙质量 > 执行纪律 > 买卖点质量 > 仓位集中度。即便账户赚钱，只要利润来自非系统标的，系统分也要低。</p><div class="score-grid">${scores.map(([name, score, note, cls]) => `<article class="score-card ${cls}"><div><h3>${name}</h3><strong>${score}</strong></div><p>${note}</p><ul class="rubric-list">${SCORE_RUBRICS[name].map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>`).join("")}</div></section>`;
}

function renderCoreTicketSection() {
  const rows = [
    ["月前参考：神剑股份", "神剑股份", "神剑股份", "是", "辨识度高、贡献突出、走势弹性强", "已抓住第一唯一性", "定龙正确，贡献突出，可复制。"],
    ["5月主正样本：通鼎互联", "通鼎互联", "通鼎互联", "是", "5月自然月唯一明确大幅正贡献", "已抓住，但后排亏损稀释利润", "唯一明确大幅正贡献，说明主线核心嗅觉在线。"],
    ["大唐方向", "大唐发电", "大唐电信 / 大连热电", "否", "应盯题材第一辨识度，不用题材热替代个股地位", "被后排吸引，题材热被误当个股地位", "做了后排替代，确定性不足。"],
    ["华能/电力方向", "阶段第一辨识度核心", "华电辽能 / 华能蒙电 / 华电能源", "否", "实际交易票未证明题材内/跨题材唯一性", "非唯一中高位左侧，止损后回补/亏损后加单", "跟风与非唯一中高位反复亏损，且出现红线动作。"],
    ["5月后段修复：达实智能", "达实智能", "达实智能", "是", "阶段核心处理有效，条件单与留仓修复回撤", "回到核心处理，但仍需防扩散", "核心处理较有效，但不能扩散到弱票。"],
    ["月后参考：大有能源", "大有能源", "大有能源", "是", "第一性与唯一性确认后，持仓浮盈验证", "第一性确认后持有", "第一性和唯一性验证后，持仓浮盈放大利润。"],
  ];
  return `<section class="panel" id="core"><h2>本月真正应该做的核心票</h2><p class="section-note">轻量定龙判断只判“是否围绕第一唯一性”，不展开五维打分；无明确核心的阶段只允许轻仓套利，不能硬造龙头。</p><div class="table-wrap"><table class="audit-table"><thead><tr><th>阶段</th><th>真正应该盯的核心</th><th>实际交易</th><th>定龙是否正确</th><th>定龙证据</th><th>错过/偏离原因</th><th>审判</th></tr></thead><tbody>${rows.map(([phase, core, actual, ok, evidence, reason, note]) => `<tr><td>${phase}</td><td><strong>${core}</strong></td><td>${actual}</td><td><span class="chip ${ok === "是" ? "pos" : "neg"}">${ok}</span></td><td>${evidence}</td><td>${reason}</td><td>${note}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function renderSystemSection(model) {
  const modes = modeStats(model.stocks);
  const redlines = redlineStats(model.stocks);
  const ops = operationStats(model.stocks);
  return `<section class="panel" id="system"><h2>系统统计</h2><p class="section-note">这里统计的是“交易系统质量”，不是账户盈亏安慰分；小额赚钱但不可复制的票不自动算模式内。</p>
    <div class="grid-4">
      ${modes.map((item) => `<article class="card"><h3>${item.mode}</h3><strong>${item.count} 只 / ${item.pct}%</strong><p>${item.mode === "模式内" ? "核心龙头或核心处理样本。" : item.mode === "非模式" ? "后排、非第一、非唯一或红线样本。" : "缺少足够证据，先不升级为系统机会。"}</p></article>`).join("")}
      <article class="card"><h3>自动红线</h3><strong>止损后回补</strong><p>同票卖出后当日或次交易日买回，且该票为亏损样本时自动标记。</p></article>
    </div>
    <div class="grid-2 system-subgrid">
      <article class="card"><h3>红线触发与再犯基线</h3><div class="redline-list">${redlines.map((item) => `<span>${escapeHtml(item.name)}：${item.count}只 / 累计${REDLINE_BASELINE[item.name] || item.count}次</span>`).join("") || "<span>暂无</span>"}</div><p>6月开始逐月累计，重复违反直接标为 <strong class="neg">红线再犯</strong>。</p></article>
      <article class="card"><h3>操作类型分布</h3><div class="tag-row">${ops.map(([type, count]) => `<span class="mini-chip">${escapeHtml(type)}：${count}只</span>`).join("")}</div><p>每只票详情里都保留操作类型，用来复盘到底是在做核心，还是在用套利/趋势/尾盘试错稀释系统。</p></article>
    </div>
    <article class="card tag-dictionary"><h3>固定标签字典</h3><div class="tag-row">${TAG_DICTIONARY.map((tag) => `<span class="mini-chip">${escapeHtml(tag)}</span>`).join("")}</div></article>
  </section>`;
}

function renderModelsSection(model) {
  const stocks = model.stocks.filter((stock) => stock.audit.copyModel);
  return `<section class="panel" id="models"><h2>可复制模型</h2><p class="section-note">只沉淀已经被月度结果证明、且符合第一唯一性或阶段核心处理的盈利样本；赚钱但不可复制的票不进入这里。</p><div class="model-grid">${stocks.map((stock) => `<article class="card"><div class="card-head"><h3>${escapeHtml(stock.name)}</h3><span class="chip pos">${moneySigned(stock.pnl)}</span></div>${renderCopyModel(stock.audit.copyModel)}</article>`).join("")}</div></section>`;
}

function renderPsychologySection() {
  const biases = [
    ["后排幻想", "看到题材热，就把后排当成核心替代。", "用“是否市场第一唯一性”一票否决。"],
    ["亏损修复冲动", "止损后想快速赚回来，导致回补或加单。", "亏损后先降风险，当天不做同一错误修复。"],
    ["急躁", "开盘过快成交、未等地位确认。", "先确认地位，再谈买点。"],
    ["题材兴奋", "题材有强度时忽略个股排名。", "题材强只说明可观察，不说明可买后排。"],
  ];
  return `<section class="panel" id="psychology"><h2>心理偏差</h2><p class="section-note">心理偏差只保留最影响系统的几条，方便下月开盘前快速自检。</p><div class="grid-4">${biases.map(([name, symptom, fix]) => `<article class="card"><h3>${name}</h3><p>${symptom}</p><p><strong>纠偏：</strong>${fix}</p></article>`).join("")}</div></section>`;
}

function renderChecklistSection() {
  const checklist = [
    "只做市场第一辨识度和唯一性最强标的；第一名无机会才看第二名。",
    "无明确核心龙头时，只允许轻仓套利，不做中高位非唯一左侧。",
    "止损后当天不回补同一错误仓位；亏损后不加单。",
    "观察与操作总标的不超过 8 只，日常聚焦 5-6 只核心。",
    "每笔交易先写清：它是核心龙头、轻仓套利，还是必须放弃的后排。",
  ];
  const redLines = [
    "非第一不做",
    "后排替代不做",
    "非模式不做",
    "亏损后不加单",
    "止损后不立刻买回",
  ];
  const goals = [
    "风控质量达到 3/5：无止损后回补、无亏损后加单",
    "模式内交易占比高于 60%：只围绕第一唯一性或明确轻仓套利",
    "观察/操作标的始终不超过 8 只",
  ];
  return `<section class="panel" id="checklist"><h2>下月执行清单、红线与三个目标</h2><p class="section-note">6月复盘必须逐条回看：做到就是规则，没做到就是继续审判；重复违反直接标为“红线再犯”。</p><div class="grid-2"><article class="card"><h3>下月三个目标</h3><div class="goal-list">${goals.map((item, index) => `<span><b>${index + 1}</b>${item}</span>`).join("")}</div><h3>下月只执行</h3><ol class="check-list">${checklist.map((item) => `<li>${item}</li>`).join("")}</ol></article><article class="card"><h3>红线清单</h3><div class="redline-list">${redLines.map((item) => `<span>${item}</span>`).join("")}</div><p>本月没有上一份月度红线可回查；从这页开始，下一月必须对照执行结果，重复违反标记为 <strong class="neg">红线再犯</strong>。</p><div class="oath"><b>下月交易誓约</b><p>我只为第一唯一性付出仓位；看不懂不做，非第一不做，亏损后先切断风险。</p></div></article></div></section>`;
}

function renderPage(model) {
  const positiveRows = renderRankRows(model.stocks, true);
  const negativeRows = renderRankRows(model.stocks, false);
  const detailStocks = [...model.stocks].sort((a, b) => {
    const av = a.pnlKnown ? Math.abs(a.pnl) : -1;
    const bv = b.pnlKnown ? Math.abs(b.pnl) : -1;
    return bv - av || a.name.localeCompare(b.name, "zh-CN");
  });
  const timeStocks = [...model.stocks].sort((a, b) => a.firstTradeTime.localeCompare(b.firstTradeTime) || a.name.localeCompare(b.name, "zh-CN"));
  const openSet = new Set([
    ...model.stocks.filter((stock) => stock.pnlKnown && stock.pnl > 0).sort((a, b) => b.pnl - a.pnl).slice(0, 3).map((stock) => stock.code),
    ...model.stocks.filter((stock) => stock.pnlKnown && stock.pnl < 0).sort((a, b) => a.pnl - b.pnl).slice(0, 5).map((stock) => stock.code),
  ]);
  const css = `
    :root{--bg:#f5f7f9;--panel:#fff;--ink:#1c2530;--muted:#667085;--line:#dfe4ea;--soft:#eef2f5;--accent:#c2412d;--accent-soft:#fff1ed;--up:#14845f;--down:#b4232f;--warn:#b76305;--blue:#1d4ed8;--shadow:0 18px 44px rgba(28,37,48,.08);--radius:10px}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:linear-gradient(180deg,#f8fafc 0%,#eef2f5 100%);font-family:"Avenir Next","PingFang SC","Noto Sans SC","Microsoft YaHei",Arial,sans-serif}a{color:inherit}.shell{width:min(1480px,calc(100vw - 24px));margin:0 auto;padding:18px 0 52px;display:grid;gap:18px}.hero,.panel,.source-item,.stock-group,.chart-card,.card{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);min-width:0}.hero{padding:30px;display:grid;grid-template-columns:1.1fr .9fr;gap:24px;align-items:stretch}.label{display:inline-flex;width:max-content;color:var(--accent);background:var(--accent-soft);padding:7px 10px;border-radius:999px;font-size:12px;font-weight:700}.nav{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.button{min-height:44px;display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:8px;text-decoration:none;background:var(--ink);color:#fff;font-weight:700}.button.secondary{background:#fff;color:var(--ink);border:1px solid var(--line)}h1,h2,h3,h4,p{margin-top:0;letter-spacing:0}h1{margin:14px 0 12px;font-size:clamp(34px,4vw,56px);line-height:1.06}h2{font-size:24px;margin-bottom:8px}h3{font-size:20px;margin-bottom:6px}h4{font-size:15px;margin-bottom:8px}p,li{color:var(--muted);line-height:1.72}.hero p{font-size:16px;max-width:850px}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.metric{padding:16px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;display:grid;align-content:space-between;min-height:120px}.metric span,.metric small{color:var(--muted);font-size:12px}.metric strong{font-size:25px}.panel,.stock-group{padding:22px}.source-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}.source-item{padding:16px;display:grid;gap:8px}.source-item strong{font-size:18px}.source-item a,.blue{color:var(--blue);font-weight:700}.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:18px}.grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.card{box-shadow:none;padding:16px;background:#f8fafc}.card-head,.stock-group-head,.trade-map-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.section-note{margin:0 0 16px;color:var(--muted)}.table-wrap{width:100%;overflow:auto;border:1px solid var(--line);border-radius:8px}table{width:100%;border-collapse:collapse;min-width:1180px;font-size:13px}th,td{padding:12px 11px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;line-height:1.55}th{color:var(--muted);background:#f8fafc;position:sticky;top:0}small{color:var(--muted)}.pos{color:var(--up)}.neg{color:var(--down)}.warn{color:var(--warn)}.blue{color:var(--blue)}.chip{display:inline-flex;align-items:center;width:max-content;min-height:32px;padding:7px 10px;border-radius:999px;background:#eef2ff;color:#344054;font-size:12px;font-weight:700;white-space:nowrap}.chip.pos{background:#ecfdf3;color:#067647}.chip.neg{background:#fef2f2;color:#991b1b}.chip.warn{background:#fff7ed;color:#9a3412}.flow-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px}.flow-item{min-height:58px;padding:9px 10px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;color:var(--muted);font-size:12px;line-height:1.55}.chart-stack{display:grid;gap:14px;margin-top:14px}.chart-card{padding:14px;box-shadow:none;background:#fff}.trade-map{margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;display:grid;gap:12px;min-width:0}.trade-legend{display:flex;flex-wrap:wrap;gap:8px;color:var(--muted);font-size:12px}.legend-item{display:inline-flex;align-items:center;gap:5px}.legend-shape{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent}.legend-shape.buy{border-bottom:11px solid var(--down)}.legend-shape.sell{border-top:11px solid var(--blue)}.trade-chart-wrap{width:100%;overflow:hidden}.trade-chart{width:100%;min-height:220px;display:block}.axis-label{fill:var(--muted);font-size:11px}.point-label{fill:var(--ink);font-size:11px;font-weight:700;paint-order:stroke;stroke:#fff;stroke-width:3px}.market-line{fill:none;stroke:#14956f;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.trade-context{display:grid;gap:6px;margin:0;padding-left:18px}.trade-context li{font-size:13px;line-height:1.55;color:var(--muted)}.trade-point-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.trade-point-item{display:flex;justify-content:space-between;gap:10px;align-items:center;min-height:40px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;font-size:12px;color:var(--muted);min-width:0}.trade-point-item span{min-width:0;overflow-wrap:anywhere}.trade-point-item strong{color:var(--ink);white-space:nowrap}.trade-point-item .buy{color:var(--down);font-weight:700}.trade-point-item .sell{color:var(--blue);font-weight:700}details{border:1px solid var(--line);border-radius:var(--radius);background:#fff;overflow:hidden;min-width:0}summary{cursor:pointer;padding:16px 18px;font-weight:700;min-height:48px}.side-tag.buy{color:var(--down);font-weight:700}.side-tag.sell{color:var(--blue);font-weight:700}.mini-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.mini-grid span{background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:10px;color:var(--muted);font-size:13px;min-width:0}.mini-grid b{display:block;color:var(--ink);margin-bottom:4px;overflow-wrap:anywhere}.tag-row{display:flex;flex-wrap:wrap;gap:6px}.mini-chip{display:inline-flex;align-items:center;min-height:26px;padding:5px 8px;border-radius:999px;background:#eef2ff;color:#344054;font-size:12px;font-weight:700}.verdict-grid,.score-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.score-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.verdict-card,.score-card{border:1px solid var(--line);border-radius:8px;background:#f8fafc;padding:16px;min-width:0}.verdict-card.danger,.score-card.neg{background:#fff7f7;border-color:#f3c8cd}.verdict-card.warn,.score-card.warn{background:#fffaf0;border-color:#f2d39c}.score-card div{display:flex;justify-content:space-between;gap:10px}.score-card strong{font-size:24px}.lesson-box{border:1px solid var(--line);border-radius:8px;padding:12px 14px;background:#f8fafc;margin:12px 0}.lesson-box p{margin:4px 0 0}.lesson-box.pos{background:#f0fdf4;border-color:#bbf7d0}.lesson-box.neg{background:#fff7f7;border-color:#f3c8cd}.stock-detail summary{padding:0}.stock-detail-body{display:grid;gap:14px;padding-top:12px}.goal-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 14px}.goal-list span{min-height:70px;display:grid;align-content:center;gap:3px;padding:10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font-weight:800}.goal-list b{color:var(--accent);font-size:18px}.check-list{margin:0;padding-left:20px}.redline-list{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}.redline-list span{display:inline-flex;padding:7px 10px;border-radius:999px;background:#fef2f2;color:#991b1b;font-weight:800;font-size:12px}.audit-table{min-width:1120px}@media(max-width:1120px){.hero,.grid-2,.grid-4,.source-row,.verdict-grid,.score-grid{grid-template-columns:1fr}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.shell{width:min(100vw - 16px,1480px);padding-top:12px}.hero,.panel,.stock-group{padding:18px}.nav{display:grid;grid-template-columns:1fr 1fr}.button{width:100%;padding-left:10px;padding-right:10px}.metrics,.trade-point-list,.goal-list{grid-template-columns:1fr}h1{font-size:34px}.stock-group-head,.card-head,.trade-map-head{flex-wrap:wrap}.trade-chart-wrap{overflow-x:auto}.trade-chart{width:760px;max-width:none;min-height:0}table{font-size:12px}.flow-list{grid-template-columns:1fr}}`;
  const sidebarCss = `
    .damage-bar{display:grid;grid-template-columns:auto auto minmax(0,1fr);gap:10px;align-items:center;margin:0 0 14px;padding:12px 14px;border:1px solid #f3c8cd;border-radius:8px;background:#fff7f7}.damage-bar span{color:var(--muted);line-height:1.6}.rubric-list{display:grid;gap:4px;margin:8px 0 0;padding-left:18px}.rubric-list li{font-size:12px;line-height:1.45}.audit-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.audit-strip span{display:grid;gap:4px;align-content:start;min-height:74px;padding:10px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;color:var(--muted);font-size:12px;line-height:1.5}.audit-strip b{color:var(--ink)}.audit-strip em{font-style:normal}.mini-chip.danger{background:#fef2f2;color:#991b1b}.copy-model{display:grid;gap:10px;padding:12px;border:1px solid #bbf7d0;border-radius:8px;background:#f0fdf4}.copy-model h4{margin:0}.model-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.system-subgrid{margin-top:14px}.tag-dictionary{margin-top:14px}.tag-dictionary .tag-row{max-height:150px;overflow:auto}.oath{margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:8px;background:#fff}.oath p{margin:4px 0 0;font-weight:800;color:var(--ink)}
    .page-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:18px;align-items:start}.content{display:grid;gap:18px;min-width:0}.sidebar{position:sticky;top:18px;align-self:start;min-width:0}.sidebar-inner{background:rgba(255,255,255,.97);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:14px;display:grid;gap:14px}.sidebar-brand{display:grid;gap:3px;padding:10px 10px 12px;text-decoration:none;border-bottom:1px solid var(--line)}.sidebar-brand span{color:var(--muted);font-size:12px;font-weight:700}.sidebar-brand strong{font-size:20px;line-height:1.2}.side-nav{display:grid;gap:6px}.side-nav a{min-height:40px;display:flex;align-items:center;padding:9px 10px;border-radius:8px;color:var(--muted);font-size:14px;font-weight:700;text-decoration:none}.side-nav a:hover,.side-nav a:focus-visible{background:#f8fafc;color:var(--ink);outline:2px solid transparent}.side-nav a.primary{background:var(--ink);color:#fff}.stock-nav{border:1px solid var(--line);border-radius:8px;background:#f8fafc;overflow:hidden;min-width:0}.stock-nav summary{min-height:40px;padding:9px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--ink);font-size:14px;font-weight:800;list-style:none}.stock-nav summary::-webkit-details-marker{display:none}.stock-nav summary::after{content:"展开";color:var(--muted);font-size:12px;font-weight:700}.stock-nav[open] summary::after{content:"收起"}.stock-nav-list{max-height:360px;overflow:auto;padding:0 8px 8px;display:grid;gap:4px}.stock-nav-mode{padding:8px 8px 2px;color:var(--ink);font-size:12px;font-weight:900}.stock-nav-list a{min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:7px;color:var(--muted);font-size:12px;font-weight:700;text-decoration:none}.stock-nav-list a:hover,.stock-nav-list a:focus-visible{background:#fff;color:var(--ink);outline:2px solid transparent}.stock-nav-list span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.stock-nav-list small{font-size:11px}.stock-nav-list b{font-size:11px;white-space:nowrap}.side-nav.external{padding-top:12px;border-top:1px solid var(--line)}.sidebar-meta{padding:10px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;display:grid;gap:4px}.sidebar-meta b{font-size:15px}.sidebar-meta span{color:var(--muted);font-size:12px}.hero .nav{display:none}.anchor{display:block;height:0;scroll-margin-top:18px;visibility:hidden}.stock-group{scroll-margin-top:18px}@media(max-width:1120px){.page-layout{grid-template-columns:1fr}.sidebar{position:static}.side-nav{grid-template-columns:repeat(4,minmax(0,1fr))}.stock-nav-list{max-height:260px}.side-nav.external{grid-template-columns:repeat(3,minmax(0,1fr));padding-top:0;border-top:0}.sidebar-meta{display:none}.model-grid,.audit-strip{grid-template-columns:1fr}}@media(max-width:720px){.side-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.side-nav.external{grid-template-columns:repeat(3,minmax(0,1fr))}.side-nav a{justify-content:center;text-align:center}.stock-nav summary{justify-content:center}.stock-nav-list{grid-template-columns:1fr;max-height:240px}.sidebar-inner{padding:12px}.sidebar-brand{display:none}.damage-bar{grid-template-columns:1fr}}`;
  const sourceCards = model.sources.map((source) => `<article class="source-item">
    <strong>${source.label}</strong><b class="${source.accountPnl >= 0 ? "pos" : "neg"}">${moneySigned(source.accountPnl)}</b>
    <span class="chip ${source.includedInMay ? "pos" : "warn"}">${source.role}</span>
    <p>${escapeHtml(source.note)}</p><a href="${source.href}">周复盘</a>
  </article>`).join("");
  const stockNavLinks = `${renderStockNavLinks(detailStocks, "按盈亏/重要性")}${renderStockNavLinks(timeStocks, "按成交时间")}`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>2026年5月月度交易复盘</title>
  <style>${css}${sidebarCss}</style>
</head>
<body>
  <main class="shell">
    <div class="page-layout">
      <aside class="sidebar" aria-label="月度复盘导航">
        <div class="sidebar-inner">
          <a class="sidebar-brand" href="#top"><span>2026年5月</span><strong>月度复盘</strong></a>
          <nav class="side-nav" aria-label="本页导航">
            <a class="primary" href="#top">本月概览</a>
            <a href="#verdict">最大错误</a>
            <a href="#scores">五项评分</a>
            <a href="#core">核心票对照</a>
            <a href="#system">系统统计</a>
            <a href="#sources">周度来源</a>
            <a href="#ranks">盈亏排行</a>
            <a href="#models">可复制模型</a>
            <a href="#patterns">共性问题</a>
            <a href="#psychology">心理偏差</a>
            <a href="#rules">落地铁律</a>
            <a href="#checklist">下月清单</a>
            <a href="#stocks">买卖点地图</a>
            <a href="#trades">成交明细</a>
          </nav>
          <details class="stock-nav">
            <summary>个股买卖点 ${detailStocks.length} 只</summary>
            <div class="stock-nav-list">${stockNavLinks}</div>
          </details>
          <nav class="side-nav external" aria-label="站点导航">
            <a href="../">月/季导航</a>
            <a href="../../weekly-trading-review/">周度主页</a>
            <a href="../../index.html">总首页</a>
          </nav>
          <div class="sidebar-meta"><b>${model.trades.length} 笔 / ${model.stocks.length} 只</b><span>${model.sourceStockPairs} 张买卖点图</span></div>
        </div>
      </aside>
      <div class="content">
    <section class="hero" id="top">
      <div>
        <span class="label">2026年5月 · 自然月结果 + 前后参考周扩展样本</span>
        <h1>5月月度交易复盘</h1>
        <p><strong class="neg">本月最大错误：</strong>放弃市场第一唯一性，转去做后排替代，并在亏损后回补/加单。</p>
        <p>5月账户结果仍按自然月周复盘 05.08-05.29 统计；同时把 04.20-04.24、05.08-05.16、06.01-06.05 的对应标的、成交时间、盈亏贡献和分时买卖点全部纳入下方扩展样本，用来抓出“定龙正确赚钱、后排替代亏钱”的共性。</p>
        <div class="nav"><a class="button" href="../">月/季导航</a><a class="button secondary" href="../../weekly-trading-review/">周度主页</a><a class="button secondary" href="../../index.html">总首页</a><a class="button secondary" href="#stocks">买卖点地图</a></div>
      </div>
      <div class="metrics">
        <article class="metric"><span>5月账户结果</span><strong class="neg">${moneySigned(model.includedMay)}</strong><small>05.08-05.29 自然月周复盘合计</small></article>
        <article class="metric"><span>扩展样本账户</span><strong class="${model.expanded >= 0 ? "pos" : "neg"}">${moneySigned(model.expanded)}</strong><small>04.20-06.05 五个来源周合计</small></article>
        <article class="metric"><span>扩展成交流水</span><strong>${model.trades.length} 笔 / ${model.stocks.length} 只</strong><small>买入 ${model.buyCount} / 卖出 ${model.sellCount}，完整成交时间保留</small></article>
        <article class="metric"><span>买卖点地图</span><strong>${model.sourceStockPairs} 张</strong><small>每个来源周股票独立保留分时图</small></article>
      </div>
    </section>
    ${renderVerdictSection()}
    ${renderScoresSection()}
    ${renderCoreTicketSection()}
    ${renderSystemSection(model)}
    <section class="panel" id="sources"><h2>周度来源</h2><p class="section-note">来源周不只做入口：所有来源周的票都已进入下方排行、成交流水和买卖点地图。5月自然月账户结果仍只取05.08-05.29，前后两周用于共性对照。</p><div class="source-row">${sourceCards}</div></section>
    <span id="ranks" class="anchor"></span>
    <section class="grid-2">
      <article class="panel"><h2>盈利排行</h2><p class="section-note">扩展样本口径；有期末持仓的来源周按期末持仓浮盈浮亏展示，并标出是否值得复制。</p><div class="table-wrap"><table><thead><tr><th>标的</th><th>贡献</th><th>来源</th><th>标签</th><th>类型/模式</th><th>可复制性</th><th>月度判断</th></tr></thead><tbody>${positiveRows}</tbody></table></div></article>
      <article class="panel"><h2>亏损排行</h2><p class="section-note">亏损根源集中在后排替代核心、止损后回补、非唯一中高位左侧和亏损后加单，并标出是否可避免。</p><div class="table-wrap"><table><thead><tr><th>标的</th><th>贡献</th><th>来源</th><th>标签</th><th>类型/模式</th><th>可避免性</th><th>月度判断</th></tr></thead><tbody>${negativeRows}</tbody></table></div></article>
    </section>
    ${renderUnknownRows(model.stocks)}
    ${renderModelsSection(model)}
    <section class="panel" id="patterns"><h2>月度共性问题</h2><div class="grid-4">
      <article class="card"><div class="card-head"><h3>盈利只来自第一</h3><span class="chip pos">持续</span></div><p>神剑股份、通鼎互联、大有能源、达实智能都说明，利润集中在辨识度最高、最接近核心龙头的标的。</p></article>
      <article class="card"><div class="card-head"><h3>后排替代核心</h3><span class="chip neg">停止</span></div><p>华电辽能、大唐电信、大连热电、华电能源、华能蒙电反复证明：题材热不等于个股有地位。</p></article>
      <article class="card"><div class="card-head"><h3>止损必须切断风险</h3><span class="chip neg">红线</span></div><p>华电辽能止损后快速买回同等仓位，说明卖出动作没有真正完成风险切断。</p></article>
      <article class="card"><div class="card-head"><h3>无龙只轻仓套利</h3><span class="chip warn">执行</span></div><p>没有唯一龙头时，只能轻仓试错；中高位非唯一、亏损后加单和临盘扩散都要压掉。</p></article>
    </div></section>
    ${renderPsychologySection()}
    <section class="panel" id="rules"><h2>落地铁律</h2><div class="grid-4">
      <article class="card"><h3>唯龙头</h3><p>非模式、非核心、非第一标的坚决不做，先定龙再谈买卖点。</p></article>
      <article class="card"><h3>唯唯一性</h3><p>题材内唯一、跨题材唯一、市场高度唯一同时验证；第一名无机会才看第二名。</p></article>
      <article class="card"><h3>精简标的</h3><p>观察与操作总量控制在 8 只以内，日常聚焦 5-6 只核心标的。</p></article>
      <article class="card"><h3>亏损不加单</h3><p>亏损后先降风险，不用回补、补涨、后排幻想修复账户曲线。</p></article>
    </div></section>
    ${renderChecklistSection()}
    <section class="panel" id="stocks"><h2>每只票的买卖点地图</h2><p class="section-note">每只票先列完整成交时间，再按来源周放真实分钟线买卖点图。重复出现在多个来源周的票，分周保留图，方便对照节奏变化。</p></section>
    ${detailStocks.map((stock) => renderStockGroup(stock, model, openSet)).join("\n")}
    <section class="panel" id="trades"><h2>全部成交明细</h2><details open><summary>展开 / 收起合并后的去重成交流水</summary><div class="table-wrap"><table><thead><tr><th>日期</th><th>时间</th><th>代码</th><th>名称</th><th>操作</th><th>数量</th><th>均价</th><th>成交金额</th><th>费用税费</th><th>发生金额</th><th>来源</th></tr></thead><tbody>${renderTradesTable(model.trades)}</tbody></table></div></details></section>
      </div>
    </div>
  </main>
</body>
</html>`;
}

function replaceNth(haystack, needle, replacement, nth = 1) {
  let index = -1;
  let offset = 0;
  for (let i = 0; i < nth; i += 1) {
    index = haystack.indexOf(needle, offset);
    if (index === -1) return haystack;
    offset = index + needle.length;
  }
  return `${haystack.slice(0, index)}${replacement}${haystack.slice(index + needle.length)}`;
}

function addPageAnchors(html) {
  return html;
}

const model = buildModel();
fs.writeFileSync(OUT, addPageAnchors(renderPage(model)), "utf8");
console.log(JSON.stringify({
  output: path.relative(ROOT, OUT),
  sources: model.sources.length,
  trades: model.trades.length,
  stocks: model.stocks.length,
  charts: model.sourceStockPairs,
  includedMay: model.includedMay,
  expanded: model.expanded,
}, null, 2));
