const fs = require("fs");
const path = require("path");
const assert = require("node:assert/strict");

const repo = path.resolve(__dirname, "..");
const folder = "2026-10-08_2026-10-16";
const directory = path.join(repo, folder);
const review = JSON.parse(fs.readFileSync(path.join(directory, "data/review.json"), "utf8"));
const previous = fs.readFileSync(path.join(repo, "2026-09-21_2026-09-30/index.html"), "utf8");
const baseStyles = previous.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/[ \t]+$/gm, "").trim();
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const amount = (value) => value == null ? "待补" : Number(value).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
const percent = (value) => value == null ? "待补" : `${Number(value).toFixed(2)}%`;
const table = (headings, body, className = "") => `<div class="table-wrap ${className}"><table><thead><tr>${headings.map((text) => `<th scope="col">${esc(text)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
const row = (values) => `<tr>${values.map((text) => `<td>${esc(text)}</td>`).join("")}</tr>`;
const metric = (label, value, foot) => `<article class="metric"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(foot)}</small></article>`;

assert.equal(review.accountDays.length, 7);
assert.deepEqual(review.periods.flatMap((period) => period.dates), review.accountDays.map((day) => day.date));
assert.equal(new Set(review.reflections.map((section) => section.id)).size, review.reflections.length);

function reflection() {
  return `<section class="panel" id="second-review" data-status="authored-reflection">
    <span class="label">Second Reflection</span><h2>本期心得总结</h2>
    <p class="lead"><b>${esc(review.title)}</b></p><p>${esc(review.source)}</p><p class="scope-note">${esc(review.scope)}</p>
    <div class="reflection-index">${review.reflections.map((section, i) => `<a href="#reflection-${section.id}"><span>${String(i + 1).padStart(2, "0")}</span>${esc(section.title.split("：")[0])}</a>`).join("")}</div>
    ${review.reflections.map((section, i) => `<article class="reflection-section" id="reflection-${section.id}"><div class="section-number">${String(i + 1).padStart(2, "0")}</div><div><h3>${esc(section.title)}</h3>${section.paragraphs.map((text) => `<p>${esc(text)}</p>`).join("")}</div></article>`).join("")}
  </section>`;
}

function patterns() {
  return `<section class="panel" id="patterns"><span class="label">Trading Patterns</span><h2>四类模式的参与与退出边界</h2>
    ${table(["模式", "入场观察", "仓位定位", "退出与持有", "继续补齐"], review.patterns.map((item) => row([item.name, item.entry, item.position, item.exit, item.pending])).join(""), "prose-table")}
  </section>`;
}

function account() {
  return `<section class="panel" id="account"><span class="label">Account</span><h2>账户收益与仓位</h2><p>账户表尚未提供。本期收益、仓位和权益暂留空，后续与交割核对。</p>
    <div class="summary-grid">${["本期账户收益", "本期收益率", "平均仓位", "期末总资产", "最大盈利日", "最大亏损日"].map((label) => `<span>${label}<b>待补</b></span>`).join("")}</div>
    ${table(["日期", "星期", "收益金额", "收益率", "仓位", "当前总金额"], review.accountDays.map((day) => row([day.date, day.day, amount(day.pnl), percent(day.returnRate), percent(day.position), amount(day.equity)])).join(""))}
  </section>`;
}

function daily() {
  return `<section class="panel" id="daily"><span class="label">Daily Review</span><h2>逐日交割与反思核对</h2><p>本次心得先按主题归档，尚未确定的口述内容不分配到具体交易日。</p>
    ${table(["日期", "星期", "当日买卖", "成交核对", "当日心得归属"], review.accountDays.map((day) => row([day.date, day.day, "待补交割单", "待核对", "待对应日期"])).join(""))}
  </section>`;
}

function page() {
  return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>2026.10.08 - 2026.10.16 两周交割复盘 · 心得初版</title><style>${baseStyles}
  h1{font-size:42px}h2{font-size:26px}h3{font-size:20px}.page-shell{gap:20px}.hero,.panel{border-radius:0;box-shadow:none;border-width:0 0 1px}.metric{border-radius:8px;box-shadow:none}.hero{align-items:center}.rail a{font-size:12px}.label{border-radius:6px}.scope-note{border-left:3px solid var(--blue);padding:10px 14px;background:#f4f7fc;color:#475569}.period-strip{display:flex;gap:24px;flex-wrap:wrap;margin:18px 0 0;padding-top:14px;border-top:1px solid var(--line)}.period-strip span{font-size:13px;color:var(--muted)}.period-strip b{display:block;color:var(--ink);margin-top:4px}.reflection-index{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0;margin:24px 0 8px;border-top:1px solid var(--line);border-left:1px solid var(--line)}.reflection-index a{display:flex;align-items:center;gap:10px;padding:12px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);font-size:13px;text-decoration:none}.reflection-index a:hover{background:#f4f7fc}.reflection-index span,.section-number{color:var(--red);font-size:12px;font-weight:800;font-variant-numeric:tabular-nums}.reflection-section{display:grid;grid-template-columns:32px minmax(0,1fr);gap:12px;padding:24px 0;border-bottom:1px solid var(--line);scroll-margin-top:20px}.reflection-section:last-child{border-bottom:0;padding-bottom:0}.reflection-section h3{margin:0 0 12px}.reflection-section p{margin:0 0 12px;color:#394457}.reflection-section p:last-child{margin-bottom:0}.section-number{padding-top:5px}.prose-table table{table-layout:fixed;min-width:1000px}.prose-table th,.prose-table td{white-space:normal;text-align:left;vertical-align:top;overflow-wrap:anywhere}.prose-table th:first-child,.prose-table td:first-child{width:140px;font-weight:700}.prose-table td{line-height:1.8}.kiss-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 28px}.kiss-list article{border-top:2px solid var(--line);padding-top:14px}.kiss-list p{margin-bottom:0}.pending-block{border-top:1px solid var(--line);padding:16px 0}.pending-block h3{font-size:18px}.pending-block:last-child{padding-bottom:0}.pending-list{padding-left:22px;display:grid;gap:10px}.pending-list li{overflow-wrap:anywhere}.record-source summary{cursor:pointer;font-weight:700;padding:8px 0}.record-source figure{margin:16px 0 0}.record-source img{display:block;width:100%;height:auto;border:1px solid var(--line)}.record-source figcaption{margin-top:8px;color:var(--muted);font-size:13px}.empty-row{height:76px;text-align:left;color:var(--muted);white-space:normal}.page-foot{display:flex;gap:20px;flex-wrap:wrap;font-size:14px}.page-foot a{color:var(--blue)}.calendar-source{font-size:12px;margin-top:14px}.status-line{font-size:13px;color:var(--muted)}
  @media(max-width:1400px){.rail{position:static;width:min(1180px,calc(100% - 28px));margin:18px auto 0;display:flex;flex-direction:row;flex-wrap:wrap}.rail a{width:auto;padding:8px 12px}}
  @media(max-width:920px){.reflection-index{grid-template-columns:repeat(2,minmax(0,1fr))}h1{font-size:36px}.hero,.panel{padding:22px}.kiss-list{grid-template-columns:1fr}.prose-table th:first-child,.prose-table td:first-child{width:130px}}
  @media(max-width:560px){h1{font-size:30px}h2{font-size:24px}h3{font-size:19px}.hero,.panel{padding:18px}.reflection-section{grid-template-columns:24px minmax(0,1fr);gap:8px}.reflection-index a{padding:10px 8px;gap:7px;font-size:12px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.metric{padding:12px;min-height:100px}.metric strong{font-size:20px}.period-strip{gap:14px 24px}.page-shell,.rail{width:calc(100% - 16px)}}
</style></head><body>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <nav class="rail" aria-label="页面导航"><a href="../weekly-trading-review/">周度主页</a><a href="../">总入口</a><a href="#second-review">心得总结</a><a href="#patterns">模式边界</a><a href="#cases">标的回看</a><a href="#kiss">执行改进</a><a href="#account">账户</a><a href="#daily">逐日核对</a><a href="#trades">成交明细</a><a href="#missing">后续待补</a></nav>
  <main class="page-shell" id="main-content">
    <section class="hero" id="overview"><div><span class="label">${esc(review.status)}</span><h1><span class="date-range"><span>2026.10.08 -</span><span>2026.10.16</span></span>两周交割复盘</h1><p>${esc(review.title)}</p><div class="button-row"><a class="button" href="#second-review">查看心得总结</a><a class="button secondary" href="#missing">后续待补</a></div><div class="period-strip">${review.periods.map((period) => `<span>${period.label}<b>${period.range} / ${period.dates.length}个交易日</b></span>`).join("")}</div></div><div class="metrics">${metric("心得状态", "已整理", `${review.reflections.length}个主题 / ${review.patterns.length}类模式`)}${metric("本期区间", "两周合并", "10.08-10.16 / 7个交易日")}${metric("成交笔数", "待补", "尚未收到本期交割单")}${metric("账户收益", "待补", "尚未收到本期账户表")}</div></section>
    ${reflection()}
    ${patterns()}
    <section class="panel" id="cases"><span class="label">Case Notes</span><h2>口述标的与交割核对</h2><p>以下是心得提及的标的及其讨论角色，候选观察与实际操作分别记录。</p>${table(["标的", "讨论角色", "心得要点", "交割状态"], review.cases.map((item) => row([item.name, item.role, item.note, "待核对"])).join(""), "prose-table")}</section>
    <section class="panel" id="kiss"><span class="label">KISS</span><h2>本期执行改进</h2><div class="kiss-list">${review.kiss.map((item) => `<article><h3>${esc(item.label)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div></section>
    ${account()}
    <section class="panel" id="holdings"><span class="label">Closing Positions</span><h2>期末持仓与资金核对</h2>${table(["证券代码", "名称", "持仓数量", "含费成本", "期末市值", "浮动盈亏"], '<tr><td class="empty-row" colspan="6">待补10月16日期末持仓、现金与账户总资产。</td></tr>')}<p class="status-line">期初以10月8日前账户记录为准，跨期成本和期间资金变动一并核对。</p></section>
    ${daily()}
    <section class="panel" id="trades"><span class="label">Transactions</span><h2>本期成交明细</h2>${table(["日期", "时间", "代码", "名称", "方向", "数量", "成交均价", "成交金额", "费用", "发生金额"], '<tr><td class="empty-row" colspan="10">待补2026.10.08-10.16交割单。</td></tr>')}</section>
    <section class="panel" id="source-record"><span class="label">Source Record</span><h2>原始盘面记录</h2><details class="record-source"><summary>10月12日至13日盘面笔记截图</summary><figure><a href="assets/market-notes-2026-10-12-13.jpg" target="_blank" rel="noopener"><img src="assets/market-notes-2026-10-12-13.jpg" width="2772" height="1280" alt="用户提供的10月12日至13日盘面笔记，包含消费分化回流、九阳股份、丽人丽妆及冰雪经济观察" loading="lazy"></a><figcaption>保留用户提供的原图，作为心得的上下文记录。</figcaption></figure></details><p class="calendar-source">交易日期：10月8日、9日、12日至16日，共7个交易日。<a href="${esc(review.calendarSource)}" target="_blank" rel="noopener">上交所休市安排</a></p></section>
    <section class="panel" id="missing"><span class="label">To Fill</span><h2>后续待补内容</h2><div class="pending-block"><h3>交割与账户资料</h3><ul class="pending-list"><li>10月8日至16日完整成交记录：日期、时间、代码、方向、数量、价格、成交额和费用。</li><li>七个交易日的收益金额、收益率、仓位、当前总金额，以及期间入金、出金等资金变动。</li><li>10月8日前期初持仓与成本、10月16日期末持仓、现金和总资产。</li><li>交割核对后再补重点标的真实走势与买卖点、逐日归因，以及利润兑现的具体时间。</li></ul></div><div class="pending-block"><h3>口述表述待核对</h3><ul class="pending-list">${review.pendingClarifications.map((text) => `<li>${esc(text)}</li>`).join("")}</ul></div></section>
    <nav class="page-foot" aria-label="周次导航"><a href="../2026-09-21_2026-09-30/">上一期 09.21-09.30</a><a href="../weekly-trading-review/">全部周报</a></nav>
  </main>
</body></html>`;
}

fs.writeFileSync(path.join(directory, "index.html"), page(), "utf8");
console.log(`Wrote ${folder}/index.html: ${review.reflections.length} reflection topics, ${review.accountDays.length} pending account days; transactions and holdings remain unfilled.`);
