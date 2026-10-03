const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {pathToFileURL} = require("node:url");
const puppeteer = require("puppeteer-core");
const {update, readTrades, renderTrades, folders} = require("./fill-weekly-daily-traded-stocks.cjs");

async function main() {
  const root = path.resolve(__dirname, "..");
  const selected = folders();
  const output = path.join(root, "output/weekly-daily-traded-stocks");
  fs.mkdirSync(output, {recursive:true});
  const before = selected.map(folder => fs.readFileSync(path.join(root,folder,"index.html"),"utf8"));
  await update();
  selected.forEach((folder,i) => assert.equal(fs.readFileSync(path.join(root,folder,"index.html"),"utf8"), before[i], "Non-idempotent update: " + folder));
  const fixtures = [
    {date:"2026-09-21",time:"09:31:00",code:"588170",name:"科创半导",side:"buy",qty:100},
    {date:"2026-09-21",time:"09:32:00",code:"588170",name:"科创半导",side:"buy",qty:200},
    {date:"2026-09-21",time:"09:33:00",code:"588170",name:"科创半导",side:"sell",qty:100},
  ];
  const test = renderTrades("2026-09-21", fixtures);
  assert.ok(test.includes('data-side="buy" data-qty="300" data-count="2"'));
  assert.ok(test.includes('data-side="sell" data-qty="100" data-count="1"'));
  assert.ok(renderTrades("2026-09-22", fixtures).includes("无成交"));
  const browser = await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe", headless:true});
  const results = [], errors = [];
  try {
    const page = await browser.newPage();
    page.on("pageerror", error => errors.push(error.message));
    for (const width of [1440,390]) {
      await page.setViewport({width,height:1000,deviceScaleFactor:1});
      for (const folder of selected) {
        await page.goto(pathToFileURL(path.join(root,folder,"index.html")).href);
        if (width === 1440) {
          const baseline = before[selected.indexOf(folder)];
          const unchanged = await page.evaluate(baseline => {
            const original = new DOMParser().parseFromString(baseline,"text/html");
            const current = new DOMParser().parseFromString(document.documentElement.outerHTML,"text/html");
            const scripts = doc => [...doc.querySelectorAll("script")].map(el => el.textContent);
            const accountCells = doc => [...doc.querySelectorAll("#account table,#daily table")].filter(table => !table.closest("[data-weekly-trade-summary]")).map(table => {
              const headers = [...table.querySelectorAll("thead th")].map(el => el.textContent);
              const stockIndex = headers.indexOf("当日操作标的");
              return [...table.tBodies[0].rows].map(row => [...row.cells].filter((cell,i) => i !== stockIndex).map(cell => cell.textContent));
            });
            return {scripts:JSON.stringify(scripts(original)) === JSON.stringify(scripts(current)),
              metrics:JSON.stringify(accountCells(original)) === JSON.stringify(accountCells(current))};
          }, baseline);
          assert.equal(unchanged.scripts,true,"Original chart scripts changed: " + folder);
          assert.equal(unchanged.metrics,true,"Original daily figures/reflections changed: " + folder);
        }
        const source = await readTrades(page);
        const actual = await page.evaluate(() => {
          const day = value => {
            const m = value.match(/\d{4}[-/]?\d{2}[-/]?\d{2}/);
            if (!m) return null;
            const d = m[0].replace(/\D/g, "");
            return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
          };
          const tables = [...document.querySelectorAll("#account table,#daily table,[data-weekly-trade-summary] table")].filter(t => [...t.querySelectorAll("thead th")].some(th => th.textContent === "当日操作标的"));
          return {width:document.documentElement.scrollWidth, tables:tables.map(table => {
            const headers = [...table.querySelectorAll("thead th")].map(el => el.textContent);
            const stock = headers.indexOf("当日操作标的"), date = headers.findIndex(x => /^(成交)?日期$/.test(x));
            return {columns:headers.length, unique:headers.filter(x => x === "当日操作标的").length, rows:[...table.tBodies[0].rows].map(row => ({
              date:day(row.cells[date].textContent), columns:row.cells.length,
              empty:row.cells[stock].querySelector(".no-trades")?.textContent,
              overflow:row.cells[stock].querySelector(".daily-trades").scrollWidth > row.cells[stock].querySelector(".daily-trades").clientWidth + 1,
              entries:[...row.cells[stock].querySelectorAll("li")].map(li => ({side:li.dataset.side,code:li.dataset.code,qty:Number(li.dataset.qty),label:li.closest(".day-trade-group").querySelector("b").textContent})),
            }))};
          }), invalid:tables.some(t => /undefined|NaN/.test(t.textContent)),
            badLinks:[...document.querySelectorAll('.weekly-day-symbols a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash)};
        });
        assert.equal(actual.width, width, "Page overflow: " + folder);
        assert.ok(actual.tables.length, "No daily stock table: " + folder);
        assert.equal(actual.invalid, false);
        assert.deepEqual(actual.badLinks, []);
        const covered = new Set(actual.tables.flatMap(table => table.rows.map(row => row.date)));
        assert.ok(source.rows.every(row => covered.has(row.date)), "Unlisted trade day: " + folder);
        for (const table of actual.tables) {
          assert.equal(table.unique, 1);
          for (const row of table.rows) {
            assert.equal(row.columns, table.columns, "Misaligned columns: " + folder);
            assert.equal(row.overflow, false, "Stock text overflow: " + folder);
            const expected = new Map();
            for (const trade of source.rows.filter(t => t.date === row.date)) {
              const key = trade.side + ":" + trade.code;
              expected.set(key, (expected.get(key) || 0) + trade.qty);
            }
            assert.deepEqual(row.entries.map(e => `${e.side}:${e.code}:${e.qty}`).sort(), [...expected].map(([key,qty]) => `${key}:${qty}`).sort(), "Wrong daily stocks: " + folder + " " + row.date);
            row.entries.forEach(e => assert.equal(e.label, e.side === "buy" ? "买入" : "卖出"));
            if (!expected.size) assert.equal(row.empty, "无成交");
          }
        }
        results.push({folder,width,trades:source.rows.length,tables:actual.tables.length,days:actual.tables.reduce((n,t) => n+t.rows.length,0)});
        if (["2026-04-20_2026-04-24","2026-08-30_2026-09-06","2026-09-21_2026-09-30"].includes(folder)) {
          const selector = folder === "2026-04-20_2026-04-24" ? "[data-weekly-trade-summary]" : folder === "2026-08-30_2026-09-06" ? "#daily" : "#account .table-wrap";
          await page.addStyleTag({content:"html{scroll-behavior:auto!important}"});
          await page.$eval(selector, el => el.scrollIntoView({block:"start"}));
          const visible = await page.$eval(selector, el => {
            for (let node = el; node; node = node.parentElement) if (Number(getComputedStyle(node).opacity) === 0) return false;
            return el.getBoundingClientRect().width > 200;
          });
          assert.equal(visible,true,"Daily table not visible: " + folder);
          await (await page.$(selector)).screenshot({path:path.join(output,folder+"-"+width+".png")});
        }
      }
    }
    assert.deepEqual(errors, []);
  } finally {await browser.close();}
  fs.writeFileSync(path.join(output,"checks.json"),JSON.stringify(results,null,2)+"\n");
  console.log(JSON.stringify({pages:selected.length,viewports:2,tables:results.filter(r => r.width === 1440).reduce((n,r) => n+r.tables,0),passed:true}));
}
main().catch(error => {console.error(error);process.exitCode = 1;});
