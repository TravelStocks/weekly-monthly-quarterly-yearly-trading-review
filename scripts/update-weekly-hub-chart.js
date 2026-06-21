const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..");
const hubPath = path.join(repo, "weekly-trading-review", "index.html");

const weeks = [
  { label: "04.20-04.24", pnl: 1616.89, equity: 31027.99, href: "../2026-04-20_2026-04-24/" },
  { label: "05.08-05.16", pnl: -4482.26, equity: 26545.73, href: "../2026-05-08_2026-05-16/" },
  { label: "05.18-05.22", pnl: -1553.76, equity: 24991.97, href: "../2026-05-15_2026-05-22/" },
  { label: "05.25-05.29", pnl: -1362.23, equity: 23629.74, href: "../2026-05-25_2026-05-29/" },
  { label: "06.01-06.05", pnl: -31, equity: 23598.74, href: "../2026-06-01_2026-06-05/" },
  { label: "06.08-06.12", pnl: -466, equity: 22879, href: "../2026-06-08_2026-06-12/" },
  { label: "06.15-06.20", pnl: -299, equity: 22567, href: "../2026-06-15_2026-06-20/" },
];

let peak = -Infinity;
for (const week of weeks) {
  peak = Math.max(peak, week.equity);
  week.drawdown = ((week.equity - peak) / peak) * 100;
}

function money(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function pointPath(points) {
  return points.map((p, index) => `${index === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function renderChart() {
  const width = 980;
  const height = 360;
  const left = 82;
  const right = 78;
  const top = 34;
  const bottom = 74;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const amountMin = -5000;
  const amountMax = 2000;
  const ddMin = -30;
  const ddMax = 0;
  const x = (i) => left + (i / (weeks.length - 1)) * plotW;
  const yAmount = (value) => top + ((amountMax - value) / (amountMax - amountMin)) * plotH;
  const yDrawdown = (value) => top + ((ddMax - value) / (ddMax - ddMin)) * plotH;
  const amountPoints = weeks.map((week, i) => ({ x: x(i), y: yAmount(week.pnl), week }));
  const ddPoints = weeks.map((week, i) => ({ x: x(i), y: yDrawdown(week.drawdown), week }));
  const amountTicks = [2000, 0, -2500, -5000];
  const ddTicks = [0, -10, -20, -30];
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
    const color = point.week.pnl >= 0 ? "#14845f" : "#c2412d";
    return `<a href="${point.week.href}"><g><title>${point.week.label} 金额变化 ${money(point.week.pnl)}</title><circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="5.5" fill="${color}" stroke="#fff" stroke-width="2"></circle></g></a>`;
  }).join("");
  const ddDots = ddPoints.map((point) => `<g><title>${point.week.label} 回撤 ${pct(point.week.drawdown)}</title><circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.5" fill="#1d4ed8" stroke="#fff" stroke-width="2"></circle></g>`).join("");
  const zeroY = yAmount(0);

  return `<div class="chart-wrap"><svg class="weekly-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="每周金额变化与回撤百分比折线图"><rect x="0" y="0" width="${width}" height="${height}" rx="12" fill="#fff"></rect>${grid}${rightAxis}${xLabels}<line x1="${left}" x2="${width - right}" y1="${zeroY.toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="rgba(28,37,48,.28)"></line><line x1="${left}" x2="${left}" y1="${top}" y2="${height - bottom}" stroke="rgba(28,37,48,.18)"></line><line x1="${width - right}" x2="${width - right}" y1="${top}" y2="${height - bottom}" stroke="rgba(29,78,216,.22)"></line><path d="${pointPath(amountPoints)}" fill="none" stroke="#c2412d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path><path d="${pointPath(ddPoints)}" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 7"></path>${amountDots}${ddDots}<text x="${left}" y="${top - 12}" class="axis-label">金额变化（元）</text><text x="${width - right}" y="${top - 12}" text-anchor="end" class="axis-label">回撤百分比</text></svg></div>`;
}

function renderPanel() {
  const cumulative = weeks.reduce((sum, week) => sum + week.pnl, 0);
  const best = weeks.reduce((a, b) => (b.pnl > a.pnl ? b : a), weeks[0]);
  const worst = weeks.reduce((a, b) => (b.pnl < a.pnl ? b : a), weeks[0]);
  const latest = weeks[weeks.length - 1];
  const maxDrawdown = weeks.reduce((min, week) => Math.min(min, week.drawdown), 0);
  return `<section class="panel overview-panel"><div class="chart-head"><div><h2>每周资金曲线</h2><p>左轴看每周账户金额变化，右轴看按推算期末权益计算的回撤百分比。早期周间隔口径不完整，回撤用于观察归档趋势。</p></div><div class="legend-row"><span><i class="legend-line amount"></i>金额变化</span><span><i class="legend-line drawdown"></i>回撤百分比</span></div></div>${renderChart()}<div class="mini-grid chart-summary"><span>累计变化 <b class="${cumulative >= 0 ? "pos" : "neg"}">${money(cumulative)}</b></span><span>最大单周盈利 <b class="pos">${best.label} ${money(best.pnl)}</b></span><span>最大单周亏损 <b class="neg">${worst.label} ${money(worst.pnl)}</b></span><span>最新回撤 <b class="neg">${pct(latest.drawdown)}</b></span><span>最大回撤 <b class="neg">${pct(maxDrawdown)}</b></span><span>最新权益 <b>${latest.equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span></div></section>`;
}

const css = `.overview-panel{display:grid;gap:18px}.chart-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.chart-head p{margin-bottom:0}.legend-row{display:flex;flex-wrap:wrap;gap:10px;color:var(--muted);font-size:13px;justify-content:flex-end}.legend-row span{display:inline-flex;align-items:center;gap:7px}.legend-line{width:28px;height:0;border-top:3px solid var(--accent);display:inline-block}.legend-line.drawdown{border-top-color:#1d4ed8;border-top-style:dashed}.chart-wrap{width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff}.weekly-chart{display:block;width:100%;min-width:820px;height:auto}.axis-label{fill:var(--muted);font-size:12px}.chart-summary{grid-template-columns:repeat(6,minmax(0,1fr))}@media(max-width:900px){.chart-head{display:grid}.legend-row{justify-content:flex-start}.chart-summary{grid-template-columns:1fr 1fr}.weekly-chart{min-width:760px}}`;

let html = fs.readFileSync(hubPath, "utf8");
html = html.replace(/\.loss-num\{[^}]+}\@media/, `.loss-num{width:30px;height:30px;border-radius:8px;background:var(--danger);color:#fff;display:inline-grid;place-items:center;font-size:14px;margin-right:8px}${css}@media`);
html = html.replace(/<section class="panel overview-panel">[\s\S]*?<\/section><section class="panel"><h2>最新周复盘<\/h2>/, `<section class="panel"><h2>最新周复盘</h2>`);
html = html.replace(/<\/section><section class="panel"><h2>最新周复盘<\/h2>/, `</section>${renderPanel()}<section class="panel"><h2>最新周复盘</h2>`);
fs.writeFileSync(hubPath, html, "utf8");
