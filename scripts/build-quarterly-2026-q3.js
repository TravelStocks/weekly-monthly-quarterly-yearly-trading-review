const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "monthly-quarterly-trading-review", "2026-q3");
const OUT_FILE = path.join(OUT_DIR, "index.html");

const assert = require("node:assert/strict");
const content = require("./quarterly-2026-q3-content.cjs");
const review = require("../monthly-quarterly-trading-review/2026-q3/data/system-review.json");
const income = require("./weekly-account-income.cjs");
const equity = require("./weekly-equity.cjs");
const september = require("../monthly-quarterly-trading-review/2026-09/data/summary.json");
const confirmed = require("../monthly-quarterly-trading-review/2026-09/data/second-reflection.json");

assert.equal(september.reflection.status, "integrated");
assert.equal(confirmed.clarificationStatus, "resolved");
assert.equal(confirmed.confirmedFramework.twoWaveEntry.minimumDailyReturnPercent, 5);
assert.equal(review.checklist.length, 8);
assert.equal(review.goals.length, 3);
assert.equal(new Set(review.weeklySources.map(w => w.folder)).size, review.weeklySources.length);
for (const sample of review.winningCases) {
  assert(Number.isSafeInteger(sample.pnlCents) && sample.pnlCents > 0);
  assert.equal(sample.buyQty, sample.sellQty, sample.name + " must be closed");
}
for (const error of review.repeatErrors) {
  assert.equal(new Set(error.months.map(m => m.month)).size, error.months.length);
}
const buildDate = review.updatedOn;
const { metrics, monthSnapshots, stages, scores, wrongActions, rules, checklist, goals } = review;
const weeklySources = review.weeklySources.map(week => {
  const account = income.forFolder(week.folder);
  const position = equity.rows.find(row => row.folder === week.folder);
  assert(position, "Missing weekly equity: " + week.folder);
  return {
    ...week, href: "../../" + week.folder + "/",
    change: account ? income.rate(account.rateBasisPoints) : week.legacyRate,
    pnl: account ? income.money(account.amountCents) : content.money(position.changeCents),
    pnlNote: account ? "日盈亏整数元合计 · " + account.rows.length + "天" : position.provisional ? "原暂估周金额，非闭环总和" : "原周账户记录",
    equity: equity.money(position.endingCents),
    equityNote: equity.statusLabel(position)
  };
});
const sections = content.render(review, esc);

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chip(text, tone = "") {
  return `<span class="chip ${tone}">${esc(text)}</span>`;
}

function metricCards(items) {
  return items
    .map(
      (item) => `
        <article class="metric">
          <span>${esc(item.label)}</span>
          <strong class="${item.tone || ""}">${esc(item.value)}</strong>
          <small>${esc(item.note)}</small>
        </article>`
    )
    .join("");
}

function sourceRows(items) {
  return items.map(item => `<tr>
    <td><a class="blue" href="${item.href}">${esc(item.range)}</a></td>
    <td><strong class="${item.change.startsWith('-') ? 'neg' : 'pos'}">${esc(item.change)}</strong></td>
    <td><strong class="${item.pnl.startsWith('-') ? 'neg' : 'pos'}">${esc(item.pnl)}</strong>${item.pnlNote ? `<small class="source-tag">${esc(item.pnlNote)}</small>` : ''}</td>
    <td><strong>${esc(item.equity)}</strong>${item.equityNote ? `<small class="source-tag">${esc(item.equityNote)}</small>` : ''}</td>
    <td class="weekly-reflection"><strong>${esc(item.reflectionTitle)}</strong><p>${esc(item.reflection)}</p><a class="blue" href="${item.href}">查看完整周复盘 →</a></td>
  </tr>`).join('');
}

function monthCards(items) {
  return items
    .map(
      (item) => `
        <article class="card month-snapshot ${item.tone}">
          <div class="card-head">
            <h3>${esc(item.month)}</h3>
            ${chip(item.status, item.tone)}
          </div>
          <div class="mini-stack">
            <p><b>做对：</b>${esc(item.right)}</p>
            <p><b>做错：</b>${esc(item.wrong)}</p>
            <p><b>结论：</b>${esc(item.lesson)}</p>
          </div>
        </article>`
    )
    .join("");
}

function stageCards(items) {
  return items
    .map(
      (item) => `
        <article class="card stage-card ${item.tone}">
          <div class="card-head">
            <h3>${esc(item.name)}</h3>
            ${chip(item.level, item.tone)}
          </div>
          <p>${esc(item.summary)}</p>
          <p><b>下一步：</b>${esc(item.next)}</p>
        </article>`
    )
    .join("");
}

function scoreCards(items) {
  return items
    .map(
      (item) => `
        <article class="score-card ${item.tone}">
          <div class="score-top">
            <span>${esc(item.name)}</span>
            <strong>${esc(item.score)}</strong>
          </div>
          <p>${esc(item.reason)}</p>
          <small>${esc(item.rubric)}</small>
        </article>`
    )
    .join("");
}

function verdictCards(items) {
  return items
    .map(
      (item) => `
        <article class="verdict-card ${item.tone}">
          <div class="card-head">
            <h3>${esc(item.title)}</h3>
            ${chip(item.tag, item.tone)}
          </div>
          <p>${esc(item.body)}</p>
        </article>`
    )
    .join("");
}

function ruleList(items) {
  return items
    .map(
      (item, index) => `
        <li>
          <b>${index + 1}</b>
          <span><strong>${esc(item.title)}：</strong>${esc(item.body)}</span>
        </li>`
    )
    .join("");
}

function checklistItems(items) {
  return items
    .map(
      (item, index) => `
        <li>
          <b>${index + 1}</b>
          <span>${esc(item)}</span>
        </li>`
    )
    .join("");
}

function goalCards(items) {
  return items
    .map(
      (item, index) => `
        <article class="goal-card">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.target)}</p>
        </article>`
    )
    .join("");
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>每季交割复盘｜2026 Q3｜6–9月系统演进与红线再犯</title>
  <style>
    :root {
      --bg: #f6f7f8;
      --panel: #fff;
      --ink: #1c2530;
      --muted: #667085;
      --line: #dfe4ea;
      --soft: #f8fafc;
      --accent: #c2412d;
      --accent-soft: #fff1ed;
      --up: #14845f;
      --down: #b4232f;
      --blue: #1d4ed8;
      --warn: #b76305;
      --shadow: 0 16px 42px rgba(28, 37, 48, 0.08);
      --radius: 10px;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; overflow-x: clip; }
    body {
      margin: 0;
      color: var(--ink);
      background: var(--bg);
      font-family: "Avenir Next", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", Arial, sans-serif;
      overflow-x: clip;
    }
    a { color: inherit; }
    h1, h2, h3, h4, p { margin-top: 0; letter-spacing: 0; }
    h1 { margin: 12px 0; font-size: 32px; line-height: 1.08; overflow-wrap: anywhere; word-break: break-word; }
    h2 { font-size: 24px; margin-bottom: 8px; }
    h3 { font-size: 18px; margin-bottom: 8px; }
    p, li, td { color: var(--muted); line-height: 1.68; }
    .shell {
      width: min(1480px, calc(100vw - 24px));
      margin: 0 auto;
      padding: 18px 0 52px;
    }
    .page-layout {
      display: grid;
      grid-template-columns: 230px minmax(0, 1fr);
      gap: 18px;
      align-items: start;
    }
    .content { display: grid; gap: 18px; min-width: 0; }
    .sidebar { position: sticky; top: 18px; align-self: start; min-width: 0; }
    .sidebar-inner, .hero, .panel, .card, .metric, .verdict-card, .score-card, .goal-card {
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      min-width: 0;
    }
    .sidebar-inner { padding: 14px; display: grid; gap: 14px; }
    .sidebar-brand {
      display: grid;
      gap: 3px;
      padding: 10px 10px 12px;
      text-decoration: none;
      border-bottom: 1px solid var(--line);
    }
    .sidebar-brand span { color: var(--muted); font-size: 12px; font-weight: 700; }
    .sidebar-brand strong { font-size: 20px; line-height: 1.2; }
    .side-nav { display: grid; gap: 6px; min-width: 0; }
    .side-nav a {
      min-height: 40px;
      display: flex;
      align-items: center;
      padding: 9px 10px;
      border-radius: 8px;
      color: var(--muted);
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .side-nav a:hover, .side-nav a:focus-visible { background: var(--soft); color: var(--ink); outline: 2px solid transparent; }
    .side-nav a.primary { background: var(--ink); color: #fff; }
    .side-nav.external { padding-top: 12px; border-top: 1px solid var(--line); }
    .sidebar-meta {
      padding: 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--soft);
      display: grid;
      gap: 4px;
    }
    .sidebar-meta b { font-size: 15px; }
    .sidebar-meta span { color: var(--muted); font-size: 12px; line-height: 1.5; }
    .hero {
      padding: 28px;
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 22px;
      align-items: stretch;
    }
    .label {
      display: inline-flex;
      width: max-content;
      max-width: 100%;
      padding: 7px 10px;
      border-radius: 999px;
      color: var(--accent);
      background: var(--accent-soft);
      font-size: 12px;
      font-weight: 800;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .hero p { font-size: 16px; max-width: 860px; }
    .button-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .button {
      min-height: 44px;
      padding: 0 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      background: var(--ink);
      border-radius: 8px;
      text-decoration: none;
      font-weight: 800;
      min-width: 0;
      text-align: center;
      overflow-wrap: anywhere;
    }
    .button.secondary { color: var(--ink); background: #fff; border: 1px solid var(--line); }
    .metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .metric { padding: 16px; min-height: 112px; display: grid; align-content: space-between; box-shadow: none; }
    .metric span, .metric small { font-size: 12px; color: var(--muted); line-height: 1.45; }
    .metric strong { font-size: 24px; overflow-wrap: anywhere; }
    .panel { padding: 22px; overflow: hidden; }
    .section-note { margin-bottom: 16px; color: var(--muted); }
    .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .card, .verdict-card, .score-card, .goal-card { padding: 18px; box-shadow: none; }
    .card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .chip {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 6px 10px;
      border-radius: 999px;
      background: #eef2ff;
      color: #344054;
      font-size: 12px;
      font-weight: 800;
      max-width: 100%;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .chip.pos { background: #ecfdf3; color: #067647; }
    .chip.neg { background: #fef2f2; color: #991b1b; }
    .chip.warn { background: #fff7ed; color: #9a3412; }
    .pos { color: var(--up); }
    .neg { color: var(--down); }
    .warn { color: var(--warn); }
    .blue { color: var(--blue); font-weight: 800; text-decoration: none; }
    .verdict-strip {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
      gap: 14px;
      align-items: stretch;
    }
    .verdict-main {
      border: 1px solid #f3c8cd;
      border-radius: 10px;
      background: #fff7f7;
      padding: 18px;
    }
    .verdict-main h2 { color: var(--down); }
    .verdict-aside {
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--soft);
      padding: 18px;
    }
    .mini-stack { display: grid; gap: 8px; }
    .mini-stack p { margin: 0; }
    .mini-stack b { color: var(--ink); }
    .month-snapshot.neg { border-color: #f3c8cd; background: #fffafa; }
    .month-snapshot.warn { border-color: #f2d39c; background: #fffdf8; }
    .month-snapshot.pos { border-color: #bbf7d0; background: #fbfffd; }
    .source-tag { display:block; color:var(--muted); font-size:12px; margin-top:5px; }
    #sources th:nth-child(-n+4), #sources td:nth-child(-n+4) { white-space:nowrap; }
    #sources .weekly-reflection { width:55%; min-width:340px; }
    #sources .weekly-reflection > strong { color:var(--ink); font-size:15px; }
    #sources .weekly-reflection p { margin:7px 0; line-height:1.75; }
    .table-wrap { width: 100%; overflow: auto; border: 1px solid var(--line); border-radius: 10px; background: #fff; }
    table { width: 100%; border-collapse: collapse; min-width: 980px; font-size: 14px; }
    th, td { padding: 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { color: var(--muted); background: var(--soft); font-size: 13px; }
    tr:last-child td { border-bottom: 0; }
    td strong { color: var(--ink); }
    .stage-card.neg, .verdict-card.neg, .score-card.neg { background: #fff7f7; border-color: #f3c8cd; }
    .stage-card.warn, .verdict-card.warn, .score-card.warn { background: #fffaf0; border-color: #f2d39c; }
    .stage-card.pos, .score-card.pos { background: #f0fdf4; border-color: #bbf7d0; }
    .compact-card { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 10px; align-items: start; background: var(--soft); }
    .compact-card .number, .goal-card span {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      font-size: 13px;
      font-weight: 900;
    }
    .compact-card p { margin: 0; color: var(--ink); }
    .score-top { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
    .score-top span { color: var(--muted); font-size: 13px; font-weight: 800; }
    .score-top strong { font-size: 26px; color: var(--ink); }
    .score-card small { color: var(--muted); line-height: 1.5; }
    .rule-list, .check-list { display: grid; gap: 10px; margin: 0; padding: 0; }
    .rule-list li, .check-list li {
      list-style: none;
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 10px;
      padding: 12px;
      background: var(--soft);
      border: 1px solid var(--line);
      border-radius: 10px;
    }
    .rule-list b, .check-list b {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      font-size: 13px;
    }
    .rule-list strong { color: var(--ink); }
    .goal-card { display: grid; align-content: start; gap: 8px; }
    .goal-card h3 { margin: 0; }
    .missing-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .missing-grid article {
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--soft);
    }
    .missing-grid b { color: var(--ink); }
    .anchor { display: block; height: 0; scroll-margin-top: 18px; visibility: hidden; }
    @media (max-width: 1120px) {
      .page-layout { grid-template-columns: 1fr; }
      .sidebar { position: static; }
      .side-nav { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .side-nav.external { grid-template-columns: repeat(3, minmax(0, 1fr)); padding-top: 0; border-top: 0; }
      .sidebar-meta { display: none; }
      .hero, .grid-2, .grid-3, .grid-4, .verdict-strip, .missing-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 720px) {
      .shell { width: min(100vw - 16px, 1480px); padding-top: 12px; }
      .hero, .panel { padding: 18px; }
      .metrics, .side-nav, .side-nav.external { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .side-nav a { justify-content: center; text-align: center; }
      .sidebar-inner { padding: 12px; }
      .sidebar-brand { display: none; }
      h1 { font-size: 31px; }
      .card-head { flex-wrap: wrap; }
      .metrics, .grid-2, .grid-3, .grid-4, .missing-grid { grid-template-columns: 1fr; }
      table { min-width: 860px; font-size: 13px; }
    }

${content.styles}
    .chapter-nav>summary{display:none}
    .quarter-verdict{margin-top:22px}
    @media(max-width:1120px){.chapter-nav>summary{display:list-item;cursor:pointer;font-weight:700;min-height:44px;padding:8px 10px}}
  </style>
</head>
<body>
  <main class="shell" id="top">
    <div class="page-layout">
      <aside class="sidebar" aria-label="季度复盘导航">
        <div class="sidebar-inner">
          <a class="sidebar-brand" href="#top"><span>2026 Q3 · 6月作基线</span><strong>每季交割复盘</strong></a>
          <details class="chapter-nav" open>
            <summary>章节导航</summary>
            <nav class="side-nav" aria-label="本页导航">
              <a class="primary" href="#top">Q3概览</a>
              <a href="#verdict">季度审判书</a>
              <a href="#right">优势与边界</a>
              <a href="#wins">大肉证据</a>
              <a href="#wrong">红线再犯矩阵</a>
              <a href="#core">同票前后对照</a>
              <a href="#months">6–9月演进</a>
              <a href="#reflection">9月关键点</a>
              <a href="#stages">能力图</a>
              <a href="#score">系统评分</a>
              <a href="#rules">落地规则</a>
              <a href="#checklist">执行清单</a>
              <a href="#goals">下阶段目标</a>
              <a href="#sources">17段周度来源</a>
              <a href="#missing">证据边界</a>
            </nav>
          </details>
          <details class="sample-nav">
            <summary>盈利样本索引</summary>
            <div>${sections.sampleIndex}</div>
          </details>
          <nav class="side-nav external" aria-label="站点导航">
            <a href="../">月/季导航</a>
            <a href="../../weekly-trading-review/">周度主页</a>
            <a href="../../index.html">总首页</a>
          </nav>
          <div class="sidebar-meta">
            <b>9月反思已整合</b>
            <span>再犯矩阵统计有证据月份，不把跨周闭环重复计数。6月只作基线，不并入自然Q3收益。</span>
          </div>
        </div>
      </aside>
      <div class="content">
        <section class="hero">
          <span class="label">6–9月系统演进 · 更新 ${esc(buildDate)}</span>
          <h1>2026 Q3 季度复盘</h1>
          <p>把6月作为进化基线，回看7–9月自然季度：哪种大肉来自有效动作，哪类错误一直在重复，以及9月补齐了什么。反思覆盖6–9月，不把四个月、跨月阶段和自然Q3收益混算。</p>
          <div class="button-row">
            <a class="button" href="#wrong">查看红线再犯</a>
            <a class="button secondary" href="#wins">查看大肉证据</a>
          </div>
          <div class="metrics">${metricCards(metrics)}</div>
        </section>
        <section class="panel" id="verdict">
          <div class="verdict-strip">
            <div class="verdict-main">
              <span class="label">季度审判书 · 按系统伤害排序</span>
              <h2>最大的错误：先买熟悉的票，后解释阶段；错了又用追加修复成本。</h2>
              <p>6月错过主升2、7月无先手硬上主升3、8月补涨期盲目切换、9月弱切换和陌生反核，根子都是阶段与模式错配。粤电力、科技ETF、百花、西陇的追加则把判断错误放大成风险错误。</p>
            </div>
            <div class="verdict-aside">
              <h3>同时也别抹掉已经做对的事</h3>
              <p>大有、立新前段、哈药、百花前段支持你在明确节点下识别第一唯一性核心的相对优势。短板更多在阶段迁移、窗口约束和利润保护，而不是从来不会定龙。</p>
              <p><strong>下一步优先级：先停止放大错误，再稳定复制优势；不是增加出手数量。</strong></p>
            </div>
          </div>
          <div class="grid-3 quarter-verdict">${verdictCards(wrongActions)}</div>
        </section>
        ${sections.strengths}
        ${sections.wins}
        ${sections.repeated}
        ${sections.contrasts}
        <section class="panel" id="months">
          <h2>6–9月：进步到了哪里，哪里仍在原地？</h2>
          <p class="section-note">按事件所在月份拆解。8月前半段盈利与后段亏损分别看；9月阶段页跨8/15–9/30，不整段重复计入两个月。</p>
          <div class="grid-2">${monthCards(monthSnapshots)}</div>
        </section>
        ${sections.september}
        <section class="panel" id="stages">
          <h2>能力图：优势、形成中、训练区</h2>
          <p class="section-note">回看能解释，和盘中能稳定执行，是两回事。主升1/2/3、补涨、二波、科技趋势不合并成一个“龙头追涨”。</p>
          <div class="grid-3">${stageCards(stages)}</div>
        </section>
        <section class="panel" id="score">
          <h2>系统评分 · 1–5分</h2>
          <p class="section-note">主观诊断，不是策略统计。按风控质量 &gt; 定龙质量 &gt; 执行纪律 &gt; 买卖点质量 &gt; 仓位集中度排列；缺失数据不伪装成精确胜率。</p>
          <div class="grid-3">${scoreCards(scores)}</div>
        </section>
        <section class="panel" id="rules">
          <h2>落地规则</h2>
          <p class="section-note">这是本人复盘形成的执行规则，不是未来盈利保证。确认买点仍要先检查风险预算与可卖保护。</p>
          <ul class="rule-list">${ruleList(rules)}</ul>
        </section>
        <section class="panel" id="checklist">
          <h2>下阶段执行清单 · 8条</h2>
          <ul class="check-list">${checklistItems(checklist)}</ul>
        </section>
        <section class="panel" id="goals">
          <h2>下阶段三个目标</h2>
          <div class="grid-3">${goalCards(goals)}</div>
        </section>
        <section class="panel" id="sources">
          <h2>17段周度来源：结果与行为一起看</h2>
          <p class="section-note">7/13起金额优先用每日收益表整数元日盈亏合计，收益率按本人既定口径逐日相加，非复利；更早周保留原记录并标明暂估。期末权益沿用账户记录或已有收盘估值，不用个股闭环盈亏倒推；跨月周不直接归为自然月总额。9/25每日收益缺失。</p>
          <div class="table-wrap"><table>
            <thead><tr><th>周度区间</th><th>周收益率</th><th>账户金额变化（元）</th><th>期末权益（元）</th><th>每周反思 / 下一步规则</th></tr></thead>
            <tbody>${sourceRows(weeklySources)}</tbody>
          </table></div>
        </section>
        <section class="panel" id="missing">
          <h2>证据边界与待补项</h2>
          <div class="missing-grid">${review.openEvidence.map((text,index) => `<article><b>${index + 1}. 证据边界</b><p>${esc(text)}</p></article>`).join("")}</div>
          <div class="button-row">
            <a class="blue" href="../2026-09/#maps">9月完整分时买卖点</a>
            <a class="blue" href="../2026-09/#trades">全部成交时间</a>
            <a class="blue" href="data/system-review.json">季度证据与规则</a>
            <a class="blue" href="data/summary.json">结构化摘要</a>
          </div>
        </section>
      </div>
    </div>
  </main>
  <script>
    const chapterNav = document.querySelector('.chapter-nav');
    const compactNavigation = matchMedia('(max-width:1120px)');
    function syncNavigation() { chapterNav.open = !compactNavigation.matches; }
    syncNavigation();
    compactNavigation.addEventListener('change', syncNavigation);
    function revealHash() {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;
      for (let node = target.parentElement; node; node = node.parentElement) {
        if (node.tagName === 'DETAILS') node.open = true;
      }
    }
    revealHash();
    addEventListener('hashchange', revealHash);
    const links = Array.from(document.querySelectorAll('.chapter-nav a'));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.classList.contains('hero') ? 'top' : visible.target.id;
      links.forEach(link => link.classList.toggle('primary', link.hash === '#' + id));
    }, {rootMargin:'-5% 0px -65% 0px', threshold:[0,0.1,0.5]});
    document.querySelectorAll('.content>section').forEach(section => observer.observe(section));
  </script>
</body>
</html>
`;
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html, "utf8");
const summary = {
  scope: review.scope, updatedOn: buildDate,
  septemberReflection: september.reflection.status,
  winningSamples: review.winningCases, excludedWinners: review.excludedWinners,
  repeatErrors: review.repeatErrors.map(error => ({id:error.id,title:error.title,coveredMonths:error.months.map(month => month.month)})),
  weeklySources, checklistCount: checklist.length, targetCount: goals.length,
  countingBoundary: review.countingBoundary
};
fs.mkdirSync(path.join(OUT_DIR, "data"), { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "data/summary.json"), JSON.stringify(summary, null, 2) + "\n", "utf8");
const hubPath = path.join(ROOT, "monthly-quarterly-trading-review/index.html");
const hub = fs.readFileSync(hubPath, "utf8");
const quarterCard = /<a class="quarter-card active" href="\.\/2026-q3\/">[\s\S]*?<\/a>/g;
assert.equal((hub.match(quarterCard) || []).length, 1, "Expected one Q3 navigation card");
const updatedHub = hub.replace(quarterCard, '<a class="quarter-card active" href="./2026-q3/"><div class="card-head"><h3>2026 Q3</h3><span class="chip warn">反思已整合</span></div><p>6–9月系统演进：6月作基线，补入9月关键点；标记红线再犯，核对大肉与运气盈利。自然Q3账户总收益另待统一核算。</p></a>');
if (hub !== updatedHub) fs.writeFileSync(hubPath, updatedHub, "utf8");
console.log("Wrote " + path.relative(ROOT, OUT_FILE));
