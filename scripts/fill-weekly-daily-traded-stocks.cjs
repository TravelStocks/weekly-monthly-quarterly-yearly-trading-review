const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {pathToFileURL} = require("node:url");
const puppeteer = require("puppeteer-core");

const root = path.resolve(__dirname, "..");
const folders = () => fs.readdirSync(root).filter(name => /^\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/.test(name));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const normalize = html => html.replace(/[\t ]+\n/g, "\n").replace(/\s*<\/body><\/html>\s*$/, "</body></html>\n");
const css = `.weekly-day-symbols-cell{text-align:left!important;white-space:normal!important;min-width:220px;vertical-align:top}.weekly-day-symbols{display:grid;gap:9px;font-size:13px;line-height:1.5;min-width:0}.weekly-day-symbols .day-trade-group{display:grid;grid-template-columns:32px minmax(0,1fr);gap:8px}.weekly-day-symbols .is-buy{color:#b42318}.weekly-day-symbols .is-sell{color:#1d4ed8}.weekly-day-symbols ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}.weekly-day-symbols li{min-width:0;overflow-wrap:anywhere;white-space:normal}.weekly-day-symbols a{color:var(--ink,#162131);text-decoration:underline;text-underline-offset:3px}.weekly-day-symbols a:focus-visible{outline:2px solid #2563eb;outline-offset:3px}.weekly-day-symbols .symbol-code{font-size:12px;color:var(--muted,#64748b);margin-left:6px}.weekly-day-symbols .trade-quantity{display:block;font-size:12px;color:var(--muted,#64748b);font-variant-numeric:tabular-nums}.weekly-day-symbols .no-trades{color:var(--muted,#64748b)}.weekly-day-symbols-wrap{max-width:100%;overflow-x:auto;border:1px solid var(--line,#dbe3eb);border-radius:8px;margin:16px 0}.weekly-day-symbols-table{width:100%;border-collapse:collapse;font-size:13px;min-width:460px}.weekly-day-symbols-table th,.weekly-day-symbols-table td{padding:12px;border-bottom:1px solid var(--line,#dbe3eb);text-align:left;vertical-align:top;line-height:1.5}.weekly-day-symbols-table th{background:#f8fafc;color:var(--muted,#64748b)}.weekly-day-symbols-table td:first-child{white-space:nowrap}.weekly-day-symbols-table tr:last-child td{border-bottom:0}`;

async function readTrades(page) {
  return page.evaluate(() => {
    const date = value => {
      const match = String(value).match(/\d{4}[-/]?\d{2}[-/]?\d{2}/);
      if (!match) throw new Error("Missing trade date: " + value);
      const digits = match[0].replace(/\D/g, "");
      return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`;
    };
    let rows;
    if (window.REPORT_DATA?.trades) {
      rows = window.REPORT_DATA.trades.map(t => ({date:date(t.date || t.dt), time:t.dt.slice(11), code:t.code, name:t.name, side:t.side, qty:t.qty}));
    } else {
      const table = document.querySelector("#trades table");
      if (!table) throw new Error("No original trade table");
      const headers = [...table.querySelectorAll("thead th")].map(el => el.textContent.trim());
      const index = pattern => headers.findIndex(label => pattern.test(label));
      const day = index(/^(成交)?日期$/), time = index(/^(成交)?时间$/);
      const code = index(/^(证券)?代码$/), name = index(/^(证券)?名称$/);
      const side = index(/^(操作|方向)$/), qty = index(/^(成交)?数量$/);
      if ([code,name,side,qty].some(i => i < 0) || (day < 0 && time < 0)) throw new Error("Unknown original trade columns");
      rows = [...table.tBodies[0].rows].map(row => ({
        date:date(row.cells[day < 0 ? time : day].textContent),
        time:time < 0 ? "" : row.cells[time].textContent.trim().split(" ").at(-1),
        code:row.cells[code].textContent.trim(), name:row.cells[name].textContent.trim(),
        side:row.cells[side].textContent.trim(), qty:Number(row.cells[qty].textContent.replaceAll(",", "")),
      }));
    }
    rows.forEach(row => {
      row.code = String(row.code).padStart(6, "0");
      row.side = row.side.replace(/（原列未知）$/, "");
      if (["买入","对方买入","BUY","buy"].includes(row.side)) row.side = "buy";
      else if (["卖出","对方卖出","SELL","sell"].includes(row.side)) row.side = "sell";
      else throw new Error("Unknown trade side: " + row.side);
      if (!/^\d{6}$/.test(row.code) || !Number.isInteger(row.qty) || row.qty <= 0 || !row.name) throw new Error("Invalid original trade");
    });
    return {rows, ids:[...document.querySelectorAll("[id]")].map(el => el.id)};
  });
}

function renderTrades(date, rows, ids = []) {
  const day = rows.filter(row => row.date === date).sort((a,b) => a.time.localeCompare(b.time));
  if (!day.length) return `<div class="daily-trades weekly-day-symbols" data-date="${date}"><span class="no-trades">无成交</span></div>`;
  const groups = ["buy","sell"].map(side => {
    const stocks = new Map();
    for (const row of day.filter(row => row.side === side)) {
      if (!stocks.has(row.code)) stocks.set(row.code, {...row, qty:0, count:0});
      stocks.get(row.code).qty += row.qty;
      stocks.get(row.code).count++;
    }
    if (!stocks.size) return "";
    const label = side === "buy" ? "买入" : "卖出";
    const items = [...stocks.values()].map(stock => {
      const target = ids.find(id => id === "stock-" + stock.code);
      const name = target ? `<a href="#${target}">${escape(stock.name)}</a>` : `<span>${escape(stock.name)}</span>`;
      const unit = /^[15]/.test(stock.code) ? "份" : "股";
      return `<li data-code="${stock.code}" data-side="${side}" data-qty="${stock.qty}" data-count="${stock.count}">${name}<span class="symbol-code">${stock.code}</span><span class="trade-quantity">${stock.qty.toLocaleString("en-US")}${unit} · ${stock.count}笔</span></li>`;
    }).join("");
    return `<div class="day-trade-group"><b class="is-${side}">${label}</b><ul>${items}</ul></div>`;
  }).join("");
  return `<div class="daily-trades weekly-day-symbols" data-date="${date}">${groups}</div>`;
}

async function update(selected = folders()) {
  const browser = await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe", headless:true});
  const results = [];
  try {
    const page = await browser.newPage();
    for (const folder of selected) {
      const file = path.join(root, folder, "index.html");
      if (!fs.existsSync(file)) continue;
      const original = fs.readFileSync(file, "utf8");
      await page.goto(pathToFileURL(file).href);
      const source = await readTrades(page);
      assert.ok(source.rows.length, "No original trades: " + folder);
      const dates = [...new Set(source.rows.map(row => row.date))].sort();
      const days = dates.map(date => ({date, count:source.rows.filter(row => row.date === date).length, html:renderTrades(date, source.rows, source.ids)}));
      const result = await page.evaluate(({original,days,css}) => {
        const doc = new DOMParser().parseFromString(original, "text/html");
        const protectedSelectors = ["#trades","#stocks","#stock-grid","#charts","#positions","#holdings","#reflection","#second-review","#profit-loss","#rules"];
        const before = protectedSelectors.map(selector => doc.querySelector(selector)?.innerHTML);
        const dayOf = value => {
          const match = value.match(/\d{4}[-/]?\d{2}[-/]?\d{2}/);
          if (!match) return null;
          const d = match[0].replace(/\D/g, "");
          return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
        };
        const targets = [...doc.querySelectorAll("#account table,#daily table,[data-weekly-trade-summary] table")].filter(table => {
          const h = [...table.querySelectorAll("thead th")].map(el => el.textContent.trim());
          return h.some(x => /^(成交)?日期$/.test(x)) && !h.some(x => /^(证券)?代码$|^操作$|^方向$/.test(x));
        });
        const makeSummary = summaryDays => {
          const wrap = doc.createElement("div");
          wrap.className = "weekly-day-symbols-wrap";
          wrap.dataset.weeklyTradeSummary = "";
          wrap.innerHTML = '<table class="weekly-day-symbols-table"><thead><tr><th>成交日期</th><th>成交笔数</th></tr></thead><tbody>' + summaryDays.map(day => `<tr><td>${day.date}</td><td>${day.count}</td></tr>`).join("") + '</tbody></table>';
          return wrap;
        };
        if (!targets.length) {
          const wrap = makeSummary(days);
          const section = doc.querySelector("#daily,#daily-review-section");
          if (section) {
            const heading = section.querySelector("h2");
            (heading.closest(".section-head") || heading).after(wrap);
          }
          else {
            const panel = doc.createElement("section");
            panel.id = "daily-trade-summary"; panel.className = "panel";
            panel.innerHTML = "<h2>逐日交割数据</h2>";panel.append(wrap);
            const after = doc.querySelector("#summary,#overview,.hero");
            if (after) after.after(panel);else doc.querySelector("main").append(panel);
          }
          targets.push(wrap.querySelector("table"));
        }
        for (const wrap of doc.querySelectorAll("[data-weekly-trade-summary]")) {
          const head = wrap.closest(".section-head");
          if (head) head.after(wrap);
        }
        const coveredDates = new Set(targets.flatMap(table => {
          const dateIndex = [...table.querySelectorAll("thead th")].findIndex(el => /^(成交)?日期$/.test(el.textContent.trim()));
          return [...table.tBodies[0].rows].map(row => dayOf(row.cells[dateIndex].textContent));
        }));
        const extraDays = days.filter(day => !coveredDates.has(day.date));
        if (extraDays.length) {
          const wrap = makeSummary(extraDays);
          const title = doc.createElement("h3");title.textContent = "区间内其他成交日";
          const section = doc.querySelector("#account,#daily,#daily-trade-summary");
          section.append(title,wrap);
          targets.push(wrap.querySelector("table"));
        }
        let changed = 0;
        for (const table of targets) {
          const headers = [...table.querySelectorAll("thead th")];
          const dateIndex = headers.findIndex(el => /^(成交)?日期$/.test(el.textContent.trim()));
          let stockIndex = headers.findIndex(el => el.textContent.trim() === "当日操作标的");
          const existing = stockIndex >= 0;
          if (!existing) {
            stockIndex = dateIndex + 1;
            const th = doc.createElement("th");th.textContent = "当日操作标的";th.scope = "col";
            headers[dateIndex].after(th);
          }
          for (const row of table.tBodies[0].rows) {
            const date = dayOf(row.cells[dateIndex].textContent);
            if (!date) throw new Error("Unknown summary date");
            let cell = row.cells[stockIndex];
            if (existing && !cell.querySelector(".weekly-day-symbols")) continue;
            if (!existing) cell = row.insertCell(stockIndex);
            cell.classList.add("weekly-day-symbols-cell");
            cell.innerHTML = days.find(day => day.date === date)?.html || `<div class="daily-trades weekly-day-symbols" data-date="${date}"><span class="no-trades">无成交</span></div>`;
            changed++;
          }
        }
        if (changed) {
          let style = doc.getElementById("weekly-day-symbols-style");
          if (!style) {style = doc.createElement("style");style.id = "weekly-day-symbols-style";doc.head.append(style);}
          style.textContent = css;
        }
        return {html:changed ? "<!DOCTYPE html>\n" + doc.documentElement.outerHTML + "\n" : original,
          tables:targets.length, changed,
          protectedUnchanged:protectedSelectors.every((selector,i) => doc.querySelector(selector)?.innerHTML === before[i])};
      }, {original, days, css:css + ".page:has([data-weekly-trade-summary]){min-width:0}.weekly-day-symbols-wrap{width:100%;min-width:0}#daily-review-section:has(>[data-weekly-trade-summary]){opacity:1;transform:none}"});
      assert.equal(result.protectedUnchanged, true, "Original trading sections changed: " + folder);
      if (result.changed) {
        const html = normalize(result.html);
        fs.writeFileSync(file, original.includes("\r\n") ? html.replace(/\n/g,"\r\n") : html, "utf8");
      }
      results.push({folder, trades:source.rows.length, tables:result.tables, updatedRows:result.changed});
      console.log(`${folder}: ${source.rows.length} trades, ${result.tables} daily tables, ${result.changed} stock cells updated`);
    }
  } finally {await browser.close();}
  return results;
}

if (require.main === module) update(process.argv.slice(2).length ? process.argv.slice(2) : undefined).catch(error => {console.error(error);process.exitCode = 1;});
module.exports = {update, readTrades, renderTrades, folders};
