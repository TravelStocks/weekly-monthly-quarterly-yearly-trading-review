const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "monthly-quarterly-trading-review", "2026-q3");
const OUT_FILE = path.join(OUT_DIR, "index.html");

const buildDate = "2026-08-16";

const metrics = [
  {
    label: "当前跨度",
    value: "06.01-08.15",
    note: "按本次要求写入Q3滚动复盘；9月后再校准自然季度",
  },
  {
    label: "阶段结论",
    value: "主升2已会",
    note: "从6月不会做，到7-8月能围绕节点和最高标交易",
    tone: "pos",
  },
  {
    label: "最大系统伤害",
    value: "主升3无先手硬上",
    note: "7月立新能源二次参与成为阶段最大亏损样本",
    tone: "neg",
  },
  {
    label: "下阶段红线",
    value: "-5条件单",
    note: "不及预期开在-4/-3且不快速拉板，先保护再判断",
    tone: "warn",
  },
];

const monthSnapshots = [
  {
    month: "6月",
    status: "主升2未掌握",
    tone: "neg",
    right:
      "大有能源这类第一性、唯一性样本开始做对，趋势科技不会选个股时转向ETF的意识开始形成。",
    wrong:
      "诺德和大唐周期处理差：大唐发电作为标准龙头周期没有主攻，反而在尾段或旁支里处理，属于不会做主升2的系统性错误。",
    lesson:
      "主升2不是尾段追强，也不是后排替代；必须在节点成型时围绕总龙/核心龙头处理。",
  },
  {
    month: "7月",
    status: "主升3吃大亏",
    tone: "warn",
    right:
      "哈药股份与立芯/立新一类龙头周期做进去时，反馈舒服，说明龙头识别和核心处理能力在变强。",
    wrong:
      "7/4、7/10、7/13科技方向追高，没有按趋势低吸节奏处理；立新能源主升3第一天没拿先手，第二天仍硬上，连续大幅亏损，用户口述回撤超过20个点。",
    lesson:
      "主升3是先手游戏：第一天没有先手，第二天不再追；趋势科技不按连板做，必须练低吸与ETF替代。",
  },
  {
    month: "8月截至08.15",
    status: "正收益 / 回撤收敛",
    tone: "pos",
    right:
      "最高标抱团和龙头唯一性做对，百花医药这类最高标确认后敢上，是本阶段最重要的正反馈。",
    wrong:
      "最高标不及预期开在-4/-3以下、没有快速拉板时，未能第一时间走；科技高潮后仍想追高或继续吸，造成利润回吐。",
    lesson:
      "启动共振日可以头铁，高潮次日要卖分歧；科技低吸可以，追高只允许发生在指数、板块、赚钱效应共振的启动点。",
  },
];

const weeklySources = [
  {
    range: "06.01-06.05",
    href: "../../2026-06-01_2026-06-05/",
    result: "账户 -31.00；持仓浮盈 +1,151.70",
    focus: "大有能源验证第一性，粤电力A/中京电子/鑫科材料暴露非第一问题。",
  },
  {
    range: "06.08-06.12",
    href: "../../2026-06-08_2026-06-12/",
    result: "账户表估算 -466",
    focus: "中化国际期末仓位，6月中旬仍处在定位和口径校准阶段。",
  },
  {
    range: "06.15-06.20",
    href: "../../2026-06-15_2026-06-20/",
    result: "账户口径 -299.00",
    focus: "诺德股份成为期末核心，但后续证明这段处理需要按买点、预期和止损线重审。",
  },
  {
    range: "06.22-06.26",
    href: "../../2026-06-22_2026-06-26/",
    result: "暂估总亏损 -4,839.42",
    focus: "诺德大亏后切仓，大唐尾段处理；核心问题是主升2没有在正确节点围绕龙头做。",
  },
  {
    range: "06.29-07.04",
    href: "../../2026-06-29_2026-07-04/",
    result: "账户口径 -1,741.00",
    focus: "科技与ETF节奏继续暴露，7月初追高问题从这里开始需要被拉红线。",
  },
  {
    range: "07.06-07.10",
    href: "../../2026-07-06_2026-07-10/",
    result: "账户口径 -262.00",
    focus: "半导设备ETF/科创半导持仓待校准，趋势科技仍不是连板打法。",
  },
  {
    range: "07.10-07.18",
    href: "../../2026-07-10_2026-07-18/",
    result: "可见闭环 -533.37；账户待补",
    focus: "半导ETF亏损闭环，哈药股份盈利闭环；正确方向是龙头，错误方向是科技追高。",
  },
  {
    range: "07.20-07.24",
    href: "../../2026-07-20_2026-07-24/",
    result: "账户日收益 +1,816.40",
    focus: "立新能源围绕核心处理、哈药试错；主线龙头和弱修复轮动开始分层。",
  },
  {
    range: "07.24-08.01",
    href: "../../2026-07-24_2026-08-01/",
    result: "可见闭环 -4,434.59；账户待补",
    focus: "立新能源二次参与成为阶段最大亏损样本：高位龙头重新参与必须重新定性。",
  },
  {
    range: "07.31-08.08",
    href: "../../2026-07-31_2026-08-08/",
    result: "可见闭环 +186.27；账户待补",
    focus: "半导ETF小赚闭环，风范股份期末持仓待验证，回撤控制开始收敛。",
  },
  {
    range: "08.10-08.15",
    href: "../../2026-08-10_2026-08-15/",
    result: "账户日收益 +1,560.94",
    focus: "百花医药最高标唯一性做对，科技环境未稳时追高造成利润回吐。",
  },
];

const coreTickets = [
  {
    phase: "6月大唐周期",
    should: "大唐发电 / 当期最高辨识度核心",
    actual: "诺德、大唐尾段及其他方向",
    correct: "否",
    evidence:
      "用户二次反思明确：大唐发电龙头周期很标准，但当时没有做，说明主升2不会做。",
    reason: "判断慢；主升2节点理解不足；尾段才介入。",
    judgment: "不是个别买点错，是没有在主升2核心节点围绕龙头做。",
    tone: "neg",
  },
  {
    phase: "7月龙头正样本",
    should: "哈药股份；立芯/立新类龙头样本",
    actual: "参与龙头周期",
    correct: "是",
    evidence:
      "用户反思：哈药龙头做对，立芯/立新作为龙头做对，做进去就赚钱且反馈舒服。",
    reason: "围绕龙头；没有跑到后排。",
    judgment: "这类动作要继续复制。",
    tone: "pos",
  },
  {
    phase: "7月主升3样本",
    should: "立新能源第一天先手，或第二天直接放弃",
    actual: "第一天没上，第二天追入并连续承压",
    correct: "否",
    evidence:
      "用户口述：主升3是彻底先手游戏，第二天硬上后吃天地板和地板，合计亏损20多个点。",
    reason: "没有先手还追；把主升3当主升2处理。",
    judgment: "阶段主罪，系统伤害最大。",
    tone: "neg",
  },
  {
    phase: "8月最高标抱团",
    should: "百花医药这类最高标唯一性确认票",
    actual: "百花医药盈利闭环",
    correct: "是",
    evidence:
      "08.10-08.15周复盘：百花医药最高标唯一性、竞价强度、T字板介入同时做对。",
    reason: "高开确认、对手破板、唯一性清晰。",
    judgment: "下阶段最该保留的正反馈。",
    tone: "pos",
  },
  {
    phase: "6-8月科技趋势",
    should: "低吸前排或ETF；只在指数/板块/赚钱效应共振启动日追高",
    actual: "7/4、7/10、7/13及8月部分节点追高",
    correct: "否/需复核",
    evidence:
      "用户二次反思与08.10-08.15周复盘均指向：科技不应逆境追高，高潮次日更不能追。",
    reason: "把趋势科技当连板情绪处理；高潮后不卖分歧。",
    judgment: "趋势系统仍未稳定，需要规则化。",
    tone: "warn",
  },
];

const stages = [
  {
    name: "主升1",
    level: "待训练",
    tone: "warn",
    summary: "核心是1进2水平和早期辨识度判断，目前还没有形成稳定打法。",
    next: "盘前必须列一进二候选，分清题材第一、市场第一和试错票。",
  },
  {
    name: "主升2",
    level: "已明显进化",
    tone: "pos",
    summary: "6月不会做，7月后开始能围绕节点和核心龙头，说明这一段已经从认知变成可执行动作。",
    next: "主升2必须盯盘，节点到来时只围绕最高辨识度核心上仓位。",
  },
  {
    name: "主升3",
    level: "主攻短板",
    tone: "neg",
    summary: "立新能源样本证明主升3不是追确认，而是先手游戏；没有第一天先手，第二天风险收益失衡。",
    next: "主升3第一天不上，第二天默认不做；除非竞价和承接极端超预期并重新给出买点。",
  },
  {
    name: "趋势科技",
    level: "需重练",
    tone: "warn",
    summary: "科技、PCB、半导一类不能按连板追高处理。个股选不准时，ETF比杂乱追票更优。",
    next: "只低吸前排，或用ETF；追高只允许在指数共振启动日发生。",
  },
];

const scores = [
  {
    name: "风控质量",
    score: "3/5",
    tone: "warn",
    reason:
      "8月回撤控制明显改善，但-4/-3不及预期开盘未快速退出、动态条件单未跟上，仍是硬伤。",
  },
  {
    name: "定龙质量",
    score: "3.5/5",
    tone: "pos",
    reason:
      "从6月错过大唐发电，到7-8月能做哈药、立新能源、百花医药，定龙能力在进化。",
  },
  {
    name: "执行纪律",
    score: "3/5",
    tone: "warn",
    reason:
      "龙头上能执行，但仍有不盯盘下单、科技高潮后继续追、无先手硬上的问题。",
  },
  {
    name: "买卖点质量",
    score: "2.5/5",
    tone: "neg",
    reason:
      "科技追高、主升3第二天追、卖点条件单不前置，说明买卖点仍需要靠规则强制。",
  },
  {
    name: "仓位集中度",
    score: "3.5/5",
    tone: "pos",
    reason:
      "8月开始围绕最高标和核心处理，仓位错误没有明显放大；但不盯盘时仍不能上大仓位。",
  },
];

const rightActions = [
  "最高标抱团和龙头唯一性看清楚后敢做，百花医药是最该复制的样本。",
  "主升2从不会做到开始会做，说明规则正在从复盘文字进入盘中动作。",
  "趋势科技选股没有把握时，用ETF替代个股，能减少非核心个股伤害。",
  "8月错误仓位没有明显放大，回撤控制比7月更稳，这是账户层面最重要的进步。",
  "开始意识到题材梯队要放进自选池，用二板、三板及以上票做强度跟踪。",
];

const wrongActions = [
  {
    title: "主罪：主升3没有第一天先手，第二天还硬上",
    tag: "系统伤害最大",
    tone: "neg",
    body:
      "立新能源样本说明：主升3不是等确认后追，而是第一天就要拿先手。第一天没上，第二天再追，容易直接接天地板和次日地板。",
  },
  {
    title: "次罪：趋势科技高潮后追高，不按低吸/ETF节奏做",
    tag: "重复伤害",
    tone: "warn",
    body:
      "7/4、7/10、7/13以及8月部分科技动作，本质都是把趋势题材当连板处理。启动共振日可以头铁，高潮次日应该卖分歧。",
  },
  {
    title: "隐患：不及预期开盘没有条件单先保护",
    tag: "风控缺口",
    tone: "warn",
    body:
      "最高标开在-4/-3以下、没有快速拉板，先退出再观察。风范股份这种低开样本，应该把-5作为硬保护线。",
  },
  {
    title: "隐患：不盯盘也下单，容易变成随手单",
    tag: "执行污染",
    tone: "neg",
    body:
      "立新能源在外面吃饭时下单就是反例。大仓位只能发生在盯盘状态，不能把临盘随机冲动包装成模式交易。",
  },
];

const rules = [
  {
    title: "不及预期开盘",
    body: "-4/-3以下开、不能快速拉板、继续向下跳，先走；同时设置-5动态条件单。",
  },
  {
    title: "主升3",
    body: "第一天没有先手，第二天默认不追。主升3不是确认游戏，是先手游戏。",
  },
  {
    title: "主升2",
    body: "节点成型时只做最高辨识度核心；尾段再追、后排替代，都不算主升2。",
  },
  {
    title: "趋势科技",
    body: "不会抓个股就做ETF；要做个股必须低吸前排，追高只允许指数/板块/赚钱效应共振启动日。",
  },
  {
    title: "高潮次日",
    body: "第二天高潮后，次日以卖分歧为主；可以打回封，不要上板追高。",
  },
  {
    title: "金字塔信号",
    body: "越买越高、越卖越低，多半做错；越卖越高，说明利润卖早，应用条件单保护而不是急卖。",
  },
  {
    title: "盯盘仓位",
    body: "只有盯盘时才能把仓位打上去；不盯盘只允许轻仓或不交易。",
  },
];

const checklist = [
  "盘前列出二板、三板及以上全部核心候选，重点看量能、题材、个股地位。",
  "自选池按题材和梯队建立票池，不能把所有票混在同一列里看。",
  "有明确龙头时，只围绕最高辨识度核心；没有龙头时，只做轻仓套利。",
  "主升2节点必须盯盘确认，确认后围绕核心上仓位，不做尾段后排。",
  "主升3第一天没先手，第二天默认放弃，不能硬接高位风险。",
  "科技/PCB/半导只低吸前排或ETF，高潮后不追，上板追高禁止。",
  "每笔核心仓都设置动态保护线，低开不及预期样本用-5条件单先保命。",
  "不盯盘不大仓位，不在吃饭、路上、情绪上头时下随手单。",
];

const goals = [
  {
    name: "主升3",
    target: "把“第一天先手/第二天不追”写进盘前计划，连续执行一个月。",
  },
  {
    name: "不及预期开盘",
    target: "所有核心仓开盘前写保护线；-4/-3弱开且不快速拉板，执行-5退出。",
  },
  {
    name: "趋势科技",
    target: "只做共振启动日追高、分歧低吸前排或ETF，杜绝高潮后追。",
  },
];

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
  return items
    .map(
      (item) => `
        <tr>
          <td><a class="blue" href="${item.href}">${esc(item.range)}</a></td>
          <td><strong>${esc(item.result)}</strong></td>
          <td>${esc(item.focus)}</td>
          <td>${chip("已接入", "pos")}</td>
        </tr>`
    )
    .join("");
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

function coreRows(items) {
  return items
    .map(
      (item) => `
        <tr>
          <td><strong>${esc(item.phase)}</strong></td>
          <td>${esc(item.should)}</td>
          <td>${esc(item.actual)}</td>
          <td>${chip(item.correct, item.tone)}</td>
          <td>${esc(item.evidence)}</td>
          <td>${esc(item.reason)}</td>
          <td>${esc(item.judgment)}</td>
        </tr>`
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
          <small>1分：完全失控 / 3分：知道规则但执行不稳 / 5分：盘前有规则、盘中能执行、盘后可复核。</small>
        </article>`
    )
    .join("");
}

function plainCards(items) {
  return items
    .map(
      (text, index) => `
        <article class="card compact-card">
          <span class="number">${String(index + 1).padStart(2, "0")}</span>
          <p>${esc(text)}</p>
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
  <title>2026 Q3滚动交易复盘｜6-8月二次反思</title>
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
    html { scroll-behavior: smooth; overflow-x: hidden; }
    body {
      margin: 0;
      color: var(--ink);
      background: linear-gradient(180deg, #f8fafb 0%, #eef2f5 100%);
      font-family: "Avenir Next", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", Arial, sans-serif;
      overflow-x: hidden;
    }
    a { color: inherit; }
    h1, h2, h3, h4, p { margin-top: 0; letter-spacing: 0; }
    h1 { margin: 12px 0; font-size: clamp(32px, 4vw, 52px); line-height: 1.08; overflow-wrap: anywhere; word-break: break-word; }
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
  </style>
</head>
<body>
  <main class="shell" id="top">
    <div class="page-layout">
      <aside class="sidebar" aria-label="季度复盘导航">
        <div class="sidebar-inner">
          <a class="sidebar-brand" href="#top"><span>2026 Q3滚动</span><strong>6-8月复盘</strong></a>
          <nav class="side-nav" aria-label="本页导航">
            <a class="primary" href="#top">Q3首页</a>
            <a href="#verdict">最大错误</a>
            <a href="#months">月份拆解</a>
            <a href="#sources">周度来源</a>
            <a href="#core">核心票审判</a>
            <a href="#stages">能力图</a>
            <a href="#score">阶段评分</a>
            <a href="#rules">铁律</a>
            <a href="#checklist">执行清单</a>
            <a href="#goals">下阶段目标</a>
            <a href="#missing">待补数据</a>
          </nav>
          <nav class="side-nav external" aria-label="站点导航">
            <a href="../">月/季导航</a>
            <a href="../../weekly-trading-review/">周度主页</a>
            <a href="../../index.html">总首页</a>
          </nav>
          <div class="sidebar-meta">
            <b>二次反思版</b>
            <span>精确月度排行、全部成交时间和买卖点地图待按自然月回填。</span>
          </div>
        </div>
      </aside>

      <div class="content">
        <section class="hero">
          <div>
            <span class="label">2026 Q3 Rolling Trading Review · built ${esc(buildDate)}</span>
            <h1>2026 Q3滚动复盘：<br />6-8月二次反思</h1>
            <p>本页按你本次要求，把2026年6月、7月、8月截至08.15的阶段复盘写入Q3页。自然季度Q3通常是7-9月，所以9月结束后需要再补9月并校准为完整季度；当前版本先作为6-8月滚动审判书。</p>
            <div class="button-row">
              <a class="button" href="#verdict">先看最大错误</a>
              <a class="button secondary" href="#sources">周度来源</a>
              <a class="button secondary" href="../">月/季导航</a>
            </div>
          </div>
          <div class="metrics">
            ${metricCards(metrics)}
          </div>
        </section>

        <section class="panel" id="verdict">
          <div class="verdict-strip">
            <div class="verdict-main">
              <span class="label">季度审判书</span>
              <h2>最大错误：主升阶段识别滞后，尤其主升3没有先手还硬上</h2>
              <p>6月的问题是不会做主升2，标准大唐发电周期没有主攻；7月的问题是主升3第一天没拿先手，第二天仍追进去，立新能源样本造成阶段最大系统伤害；8月的问题已经缩小到“最高标不及预期开盘时没有马上用条件单保护”。这说明系统在进化，但短板也很清楚：主升1和主升3还没有完全内化，趋势科技也不能再用连板追高思维做。</p>
            </div>
            <div class="verdict-aside">
              <h3>一句话结论</h3>
              <p><strong>从6月到8月，你不是没有进步，而是从“不会做主升2”进化到“主升2能做、主升3还会被先手规则惩罚”。</strong></p>
              <p>后续账户曲线要继续变好，关键不是增加交易，而是把主升3、科技趋势、不及预期开盘这三类红线写死。</p>
            </div>
          </div>
        </section>

        <section class="panel" id="months">
          <h2>6-7-8月拆解</h2>
          <p class="section-note">先按二次反思提炼，不强行合并成自然月总收益。自然月盈亏排行、期末持仓浮盈浮亏和全部成交时间，等完整月度页再回填。</p>
          <div class="grid-3">
            ${monthCards(monthSnapshots)}
          </div>
        </section>

        <section class="panel" id="sources">
          <h2>周度来源</h2>
          <p class="section-note">这些周度复盘已接入本页作为来源。跨月周不在这里拆分自然月盈亏，只保留来源链接和阶段事实。</p>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>周度区间</th>
                  <th>已见账户/闭环结果</th>
                  <th>对Q3判断的作用</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                ${sourceRows(weeklySources)}
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel" id="core">
          <h2>真正应该做的核心票</h2>
          <p class="section-note">轻量定龙审判：只判断是否围绕第一性/唯一性，不展开完整月度票级买卖点地图。</p>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>阶段</th>
                  <th>真正应该盯的核心</th>
                  <th>实际处理</th>
                  <th>定龙是否正确</th>
                  <th>定龙证据</th>
                  <th>偏离原因</th>
                  <th>审判</th>
                </tr>
              </thead>
              <tbody>
                ${coreRows(coreTickets)}
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel" id="stages">
          <h2>主升阶段能力图</h2>
          <p class="section-note">这部分是这次6-8月最关键的系统进化图：不要把主升1、主升2、主升3混成一个“龙头追涨”。</p>
          <div class="grid-4">
            ${stageCards(stages)}
          </div>
        </section>

        <section class="panel" id="score">
          <h2>阶段评分</h2>
          <p class="section-note">这是二次反思版主观评分，等完整月度账户数据和票级排行补齐后再校准。</p>
          <div class="grid-3">
            ${scoreCards(scores)}
          </div>
        </section>

        <section class="panel" id="right">
          <h2>好的动作：继续复制</h2>
          <p class="section-note">这里抓的不是某一笔盈利，而是能反复带来正期望的动作。</p>
          <div class="grid-2">
            ${plainCards(rightActions)}
          </div>
        </section>

        <section class="panel" id="wrong">
          <h2>共性问题：主罪 + 次罪 + 隐患</h2>
          <p class="section-note">按系统伤害排序，不按单笔金额排序。</p>
          <div class="grid-2">
            ${verdictCards(wrongActions)}
          </div>
        </section>

        <section class="panel" id="rules">
          <h2>落地铁律</h2>
          <p class="section-note">后续每个月都要回看这些规则是否被执行，重复违反就标红线再犯。</p>
          <ul class="rule-list">
            ${ruleList(rules)}
          </ul>
        </section>

        <section class="panel" id="checklist">
          <h2>下阶段执行清单</h2>
          <p class="section-note">控制在8条以内，盘前能直接照着检查。</p>
          <ul class="check-list">
            ${checklistItems(checklist)}
          </ul>
        </section>

        <section class="panel" id="goals">
          <h2>下阶段三个目标</h2>
          <div class="grid-3">
            ${goalCards(goals)}
          </div>
        </section>

        <section class="panel" id="missing">
          <h2>待补数据</h2>
          <p class="section-note">这些数据补齐后，才能升级成完整自然月/完整季度核算页。</p>
          <div class="missing-grid">
            <article><b>1. 6月、7月、8月自然月账户结果</b><p>起始资产、期末资产、月收益、月收益率、最大回撤。</p></article>
            <article><b>2. 票级盈亏排行</b><p>按月末持仓浮盈浮亏口径，把赢家和亏家分开两行展示。</p></article>
            <article><b>3. 全部成交时间</b><p>月度明细页必须保留每笔成交时间，不压缩成交流水。</p></article>
            <article><b>4. 买卖点地图</b><p>从周度复盘回填每只票真实分时图，月度只展开最重要前几名。</p></article>
          </div>
        </section>
      </div>
    </div>
  </main>
</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html, "utf8");
console.log(`Wrote ${path.relative(ROOT, OUT_FILE)}`);
