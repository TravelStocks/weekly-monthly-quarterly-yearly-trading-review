const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..");
const hubPath = path.join(repo, "weekly-trading-review", "index.html");
const returnRates = require("./weekly-return-rates.cjs");
const equityLedger = require("./weekly-equity.cjs");

const knownWeeks = [
  { label: "04.20-04.24", pnl: 1616.89, equity: 31027.99, avgPosition: 94.7, bestDay: "周二 04-21 +2,117.00", worstDay: "周五 04-24 -2,413.00", href: "../2026-04-20_2026-04-24/" },
  { label: "05.08-05.16", pnl: -4482.26, equity: 26545.73, avgPosition: 79.1, bestDay: "周一 05-11 +593.98", worstDay: "周四 05-14 -2,043.00", href: "../2026-05-08_2026-05-16/" },
  { label: "05.18-05.22", pnl: -1553.76, equity: 24991.97, avgPosition: 53.64, bestDay: "周五 05-22 +1,680.00", worstDay: "周四 05-21 -1,779.76", href: "../2026-05-15_2026-05-22/" },
  { label: "05.25-05.29", pnl: -1362.23, equity: 23629.74, avgPosition: 71.48, bestDay: "周一 05-25 +1,187.00", worstDay: "周四 05-28 -2,628.23", href: "../2026-05-25_2026-05-29/" },
  { label: "06.01-06.05", pnl: -31, equity: 23598.74, avgPosition: 67.16, bestDay: "周四 06-04 +863.00", worstDay: "周三 06-03 -1,113.00", href: "../2026-06-01_2026-06-05/" },
  { label: "06.08-06.12", pnl: -466, equity: 22879, avgPosition: 49.19, bestDay: "周一 06-08 +1,996.00", worstDay: "周二 06-09 -2,492.00", href: "../2026-06-08_2026-06-12/" },
  { label: "06.15-06.20", pnl: -299, equity: 22567, avgPosition: 44.68, bestDay: "周四 06-18 +409.00", worstDay: "周一 06-15 -627.00", href: "../2026-06-15_2026-06-20/" },
  { label: "06.22-06.26*", pnl: -4839.42, equity: 17671.22, equityLabel: "暂估 / 市值17,671.22", avgPosition: 92.57, bestDay: "周一 06-22 -405.22", worstDay: "周五 06-26 -4,839.42", href: "../2026-06-22_2026-06-26/" },
  { label: "06.29-07.04", pnl: -1741, equity: 15858, avgPosition: 58.44, bestDay: "周二 06-30 +257.00", worstDay: "周四 07-02 -1,284.00", href: "../2026-06-29_2026-07-04/" },
  { label: "07.06-07.10", pnl: -262, equity: 15596, avgPosition: 50.08, bestDay: "周四 07-09 +605.00", worstDay: "周五 07-10 -514.40", href: "../2026-07-06_2026-07-10/" },
  { label: "07.20-07.24", pnl: 1816.4, equity: 17648.65, avgPosition: 41.12, bestDay: "周五 07-24 +1,170.00", worstDay: "周一 07-20 +0.00", href: "../2026-07-20_2026-07-24/" },
  { label: "08.10-08.15", pnl: 1560.94, equity: 13594, avgPosition: 59.62, bestDay: "周三 08-12 +1,268.94", worstDay: "周五 08-14 -389.00", href: "../2026-08-10_2026-08-15/" },
];

const weeks = equityLedger.rows.map(row => ({
  ...knownWeeks.find(week => week.href === `../${row.folder}/`),
  label:row.label, href:`../${row.folder}/`, pnl:row.changeCents / 100,
  equity:row.endingCents / 100, equityLabel:equityLedger.money(row.endingCents),
  equityStatus:equityLedger.statusLabel(row), closedOnly:row.closedOnly,
  equityNote:equityLedger.formula(row),
}));

let peak = -Infinity;
let previousEquity = null;
for (const week of weeks) {
  const startEquity = previousEquity ?? (week.equity - week.pnl);
  const supplied = returnRates.forFolder(week.href.split("/").filter(part => part !== "..").find(Boolean));
  week.weekPct = supplied ? supplied.points / 100 : startEquity ? (week.pnl / startEquity) * 100 : 0;
  peak = Math.max(peak, week.equity);
  week.drawdown = ((week.equity - peak) / peak) * 100;
  previousEquity = week.equity;
}

function money(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function trendClass(value) {
  return value >= 0 ? "trade-up" : "trade-down";
}

function pointPath(points) {
  return points.map((p, index) => `${index === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function renderChart() {
  const width = Math.max(1080, weeks.length * 110 + 180);
  const height = 430;
  const left = 90;
  const right = 92;
  const top = 56;
  const bottom = 92;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const amountMin = -5000;
  const amountMax = 2000;
  const ddMin = Math.floor(Math.min(...weeks.map(week => week.drawdown), ...weeks.map(week => week.weekPct)) / 10) * 10;
  const ddMax = Math.max(10, Math.ceil(Math.max(...weeks.map(week => week.weekPct)) / 10) * 10);
  const x = (i) => left + (i / (weeks.length - 1)) * plotW;
  const yAmount = (value) => top + ((amountMax - value) / (amountMax - amountMin)) * plotH;
  const yDrawdown = (value) => top + ((ddMax - value) / (ddMax - ddMin)) * plotH;
  const amountPoints = weeks.map((week, i) => ({ x: x(i), y: yAmount(week.pnl), week }));
  const ddPoints = weeks.map((week, i) => ({ x: x(i), y: yDrawdown(week.drawdown), week }));
  const weekPctPoints = weeks.map((week, i) => ({ x: x(i), y: yDrawdown(week.weekPct), week }));
  const labelYs = weeks.map((week, i) => {
    const labels = [
      {key:"amount", y:amountPoints[i].y + (week.pnl > 0 || i >= 4 ? 23 : -14)},
      {key:"drawdown", y:ddPoints[i].y + 19},
      {key:"rate", y:weekPctPoints[i].y - 14},
    ].sort((a,b)=>a.y-b.y);
    labels.forEach((label,j)=>{label.y=Math.max(top+12,label.y,j ? labels[j-1].y+17 : top+12);});
    for(let j=labels.length-1;j>=0;j--) labels[j].y=Math.min(labels[j].y,j===labels.length-1 ? height-bottom-8 : labels[j+1].y-17);
    return Object.fromEntries(labels.map(label=>[label.key,label.y]));
  });
  const amountTicks = [2000, 0, -2500, -5000];
  const ddTicks = Array.from({ length: (ddMax - ddMin) / 10 + 1 }, (_, i) => ddMax - i * 10);
  const grid = amountTicks.map((tick) => {
    const y = yAmount(tick);
    return `<g><line x1="${left}" x2="${width - right}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(28,37,48,.10)" stroke-dasharray="4 7"></line><text x="${left - 12}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="axis-label">${money(tick)}</text></g>`;
  }).join("");
  const rightAxis = ddTicks.map((tick) => {
    const y = yDrawdown(tick);
    return `<text x="${width - right + 12}" y="${(y + 4).toFixed(1)}" class="axis-label">${pct(tick)}</text>`;
  }).join("");
  const xLabels = weeks.map((week, i) => {
    const xx = x(i);
    return `<g><line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${top}" y2="${height - bottom}" stroke="rgba(28,37,48,.08)"></line><text x="${xx.toFixed(1)}" y="${height - 34}" text-anchor="middle" class="axis-label">${week.label}</text></g>`;
  }).join("");
  const amountDots = amountPoints.map((point) => {
    const color = point.week.pnl >= 0 ? "#c2412d" : "#14845f";
    return `<a href="${point.week.href}"><g><title>${point.week.label} 金额变化 ${money(point.week.pnl)}</title><circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="5.5" fill="${color}" stroke="#fff" stroke-width="2"></circle></g></a>`;
  }).join("");
  const amountLabels = amountPoints.map((point, index) => {
    const y = labelYs[index].amount;
    const fill = point.week.pnl >= 0 ? "#c2412d" : "#14845f";
    return `<text x="${point.x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" class="value-label amount-label" style="fill:${fill}">${money(point.week.pnl)}</text>`;
  }).join("");
  const ddDots = ddPoints.map((point) => `<g><title>${point.week.label} 累计回撤 ${pct(point.week.drawdown)}</title><circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.5" fill="#1d4ed8" stroke="#fff" stroke-width="2"></circle></g>`).join("");
  const ddLabels = ddPoints.map((point, index) => {
    const y = labelYs[index].drawdown;
    return `<text x="${point.x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" class="value-label cum-label">累${pct(point.week.drawdown)}</text>`;
  }).join("");
  const weekPctDots = weekPctPoints.map((point) => `<g><title>${point.week.label} 周收益率 ${pct(point.week.weekPct)}</title><circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.5" fill="#d97706" stroke="#fff" stroke-width="2"></circle></g>`).join("");
  const weekPctLabels = weekPctPoints.map((point, index) => {
    const y = labelYs[index].rate;
    return `<text x="${point.x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" class="value-label week-label ${trendClass(point.week.weekPct)}">${pct(point.week.weekPct)}</text>`;
  }).join("");
  const zeroY = yAmount(0);

  return `<div class="chart-wrap"><svg class="weekly-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="每周金额变化、累计回撤与周收益率折线图"><rect x="0" y="0" width="${width}" height="${height}" rx="12" fill="#fff"></rect>${grid}${rightAxis}${xLabels}<line x1="${left}" x2="${width - right}" y1="${zeroY.toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="rgba(28,37,48,.28)"></line><line x1="${left}" x2="${left}" y1="${top}" y2="${height - bottom}" stroke="rgba(28,37,48,.18)"></line><line x1="${width - right}" x2="${width - right}" y1="${top}" y2="${height - bottom}" stroke="rgba(29,78,216,.22)"></line><path d="${pointPath(amountPoints)}" fill="none" stroke="#c2412d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path><path d="${pointPath(ddPoints)}" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 7"></path><path d="${pointPath(weekPctPoints)}" fill="none" stroke="#d97706" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 7"></path>${amountDots}${ddDots}${weekPctDots}${amountLabels}${ddLabels}${weekPctLabels}<text x="${left}" y="${top - 24}" class="axis-label">金额变化（元）</text><text x="${width - right}" y="${top - 24}" text-anchor="end" class="axis-label">百分比轴：累计回撤 / 周收益率</text></svg></div>`;
}

function renderPanel() {
  const cumulative = weeks.reduce((sum, week) => sum + week.pnl, 0);
  const best = weeks.reduce((a, b) => (b.pnl > a.pnl ? b : a), weeks[0]);
  const worst = weeks.reduce((a, b) => (b.pnl < a.pnl ? b : a), weeks[0]);
  const latest = weeks[weeks.length - 1];
  const maxDrawdown = weeks.reduce((min, week) => Math.min(min, week.drawdown), 0);
  const rows = weeks.map((week) => `<tr><td><a href="${week.href}">${week.label}</a></td><td class="${trendClass(week.pnl)}">${money(week.pnl)}${week.closedOnly ? '<small class="equity-caption">已平仓口径</small>' : ''}</td><td class="${trendClass(week.weekPct)}">${pct(week.weekPct)}</td><td>${week.avgPosition == null ? '待补' : week.avgPosition.toFixed(2)+'%'}</td><td title="${week.equityNote}">${week.equityLabel}<small class="equity-caption">${week.equityStatus}</small></td><td class="${trendClass(week.drawdown)}">${pct(week.drawdown)}</td><td class="trade-up">${week.bestDay || '待补'}</td><td class="trade-down">${week.worstDay || '待补'}</td></tr>`).join("");
  return `<section class="panel overview-panel"><div class="chart-head"><div><h2>每周资金曲线</h2><p>期末权益＝期末现金＋持仓数量×当期最后交易日不复权收盘价（多只标的分别相加）；已有账户总金额优先保留。估值以交割单可见现金、持仓及无额外资金变动为前提，不等于券商已确认资产，也不再累计已平仓盈亏替代权益。累计回撤按归档期末权益计算（含估值），并非每日最大回撤。周收益率保留每日直接相加值，其余早期周沿用原口径；平均周仓位按已提供交易日仓位简单平均。<a href="equity-inputs.json">现金与持仓依据</a> · <a href="equity-quotes.json">历史收盘价来源</a></p></div><div class="legend-row"><span><i class="legend-line amount"></i>金额变化</span><span><i class="legend-line drawdown"></i>累计回撤（含估值）</span><span><i class="legend-line weekly"></i>周收益率</span></div></div>${renderChart()}<div class="weekly-data-wrap"><table class="weekly-data-table"><thead><tr><th>周区间</th><th>金额变化</th><th>周收益率</th><th>平均周仓位</th><th>期末权益</th><th>累计回撤<br>（含估值）</th><th>最赚日</th><th>最亏日</th></tr></thead><tbody>${rows}</tbody></table></div><div class="mini-grid chart-summary"><span>金额变化合计 <b class="${cumulative >= 0 ? "pos" : "neg"}">${money(cumulative)}</b></span><span>最大单周盈利 <b class="pos">${best.label} ${money(best.pnl)}</b></span><span>最大单周亏损 <b class="neg">${worst.label} ${money(worst.pnl)}</b></span><span>最新入曲线 <b class="${latest.weekPct >= 0 ? "pos" : "neg"}">${latest.label} ${pct(latest.weekPct)}</b></span><span>最新累计回撤（含估值） <b class="neg">${pct(latest.drawdown)}</b></span><span>最大累计回撤（含估值） <b class="neg">${pct(maxDrawdown)}</b></span><span>最新权益（${latest.equityStatus}） <b>${latest.equityLabel}</b></span></div></section>`;
}

function renderMotto() {
  return `<section class="panel cycle-motto"><div class="chart-head"><div><span class="label">Cycle Motto</span><h2>周期格言</h2><p>冰点和高潮都不是随手交易的地方，真正要记住的是反人性节点。</p></div></div><div class="motto-grid"><article class="motto-card"><h3>冰点割肉</h3><p class="motto-line">冰点是连续的大分歧：二冰反核，三冰反核（70%），四冰反核（100%）。</p><div class="motto-note"><span>冰点别恐慌割肉</span><span>反核节点看修复</span></div></article><article class="motto-card"><h3>高潮追高</h3><p class="motto-line">高潮是连续的强回流：二高砸盘，三高砸盘（成功率70%），四高砸盘（接近100%）。</p><div class="motto-note"><span>高潮别追高接力</span><span>强回流后防兑现</span></div></article></div></section>`;
}

const css = `.cycle-motto{border:2px solid rgba(194,65,45,.2);background:linear-gradient(135deg,#fff7ed 0%,#fff 58%)}.motto-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.motto-card{background:#fff;border:1px solid rgba(194,65,45,.18);border-radius:10px;padding:18px;display:grid;gap:10px}.motto-card h3{margin:0;font-size:20px}.motto-line{font-size:18px;font-weight:800;color:var(--ink);line-height:1.55}.motto-note{display:flex;flex-wrap:wrap;gap:8px}.motto-note span{display:inline-flex;border:1px solid var(--line);background:#f8fafc;border-radius:999px;padding:7px 10px;color:var(--muted);font-size:12px;font-weight:700}.overview-panel{display:grid;gap:18px}.chart-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.chart-head p{margin-bottom:0}.legend-row{display:flex;flex-wrap:wrap;gap:10px;color:var(--muted);font-size:13px;justify-content:flex-end}.legend-row span{display:inline-flex;align-items:center;gap:7px}.legend-line{width:28px;height:0;border-top:3px solid var(--accent);display:inline-block}.legend-line.drawdown{border-top-color:#1d4ed8;border-top-style:dashed}.legend-line.weekly{border-top-color:#d97706;border-top-style:dotted}.trade-up{color:#c2412d;fill:#c2412d}.trade-down{color:#14845f;fill:#14845f}.chart-wrap,.weekly-data-wrap{width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff}.weekly-chart{display:block;width:100%;min-width:960px;height:auto}.axis-label{fill:var(--muted);font-size:12px}.value-label{font-size:11px;font-weight:800;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}.amount-label{fill:#c2412d}.cum-label{fill:#1d4ed8}.weekly-data-table{width:100%;border-collapse:collapse;min-width:1060px;font-size:13px}.weekly-data-table th,.weekly-data-table td{padding:12px 14px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}.weekly-data-table th{color:var(--muted);background:#f8fafc;font-weight:700}.weekly-data-table th:first-child,.weekly-data-table td:first-child{text-align:left}.weekly-data-table tr:last-child td{border-bottom:0}.weekly-data-table a{color:var(--ink);font-weight:700;text-decoration:none}.chart-summary{grid-template-columns:repeat(7,minmax(0,1fr))}@media(max-width:900px){.motto-grid{grid-template-columns:1fr}.motto-line{font-size:16px}.chart-head{display:grid}.legend-row{justify-content:flex-start}.chart-summary{grid-template-columns:1fr 1fr}.weekly-chart{min-width:980px}.weekly-data-table{min-width:980px}}`;

let html = fs.readFileSync(hubPath, "utf8");
html = html.replace(/<section\b[^>]*\bid="weekly-return-rates"[^>]*>[\s\S]*?<\/section>/g, "");
let injectedCssStart = html.indexOf(".cycle-motto{");
if (injectedCssStart < 0) {
  injectedCssStart = html.indexOf(".overview-panel{");
}
if (injectedCssStart >= 0) {
  const nextMedia = html.indexOf("@media(max-width:900px){.hero", injectedCssStart);
  if (nextMedia >= 0) {
    html = html.slice(0, injectedCssStart) + html.slice(nextMedia);
  }
}
if (!html.includes(".cycle-motto{")) {
  html = html.replace(/@media\(prefers-reduced-motion:reduce\)/, `${css}@media(prefers-reduced-motion:reduce)`);
}

html = html.replace(/<section class="panel cycle-motto">[\s\S]*?<section class="panel">\s*<span class="label">Latest Draft<\/span>/, `<section class="panel">\n      <span class="label">Latest Draft</span>`);
html = html.replace(/<section class="panel overview-panel">[\s\S]*?<section class="panel">\s*<span class="label">Latest Draft<\/span>/, `<section class="panel">\n      <span class="label">Latest Draft</span>`);
html = html.replace(/<\/section>\s*<section class="panel">\s*<span class="label">Latest Draft<\/span>/, `</section>${renderMotto()}${renderPanel()}<section class="panel">\n      <span class="label">Latest Draft</span>`);
const equityCss = `<style id="weekly-equity-style">.equity-caption{display:block;margin-top:4px;color:var(--muted);font-size:11px}.equity-basis{display:block;color:var(--muted);line-height:1.6;overflow-wrap:anywhere}.weekly-chart{min-width:${Math.max(1080,weeks.length*110+180)}px}.weekly-data-table th{vertical-align:middle}.overview-panel .chart-head{display:grid;gap:12px}.overview-panel .legend-row{justify-content:flex-start}.legend-row span{white-space:nowrap}.legend-line.amount{border-top:3px solid var(--red)}</style>`;
html = html.replace(/<style id="weekly-equity-style">[\s\S]*?<\/style>/, "");
html = html.replace("</head>", `${equityCss}</head>`);
const latestChartScript = `<script id="weekly-chart-latest">const weeklyChart = document.querySelector(".overview-panel .chart-wrap"); if (weeklyChart) weeklyChart.scrollLeft = weeklyChart.scrollWidth;</script>`;
html = html.replace(/<script id="weekly-chart-latest">[\s\S]*?<\/script>/g, "");
html = html.replace("</body>", `${latestChartScript}</body>`);
fs.writeFileSync(hubPath, html, "utf8");
