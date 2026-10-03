const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {pathToFileURL} = require("node:url");
const {execFileSync} = require("node:child_process");
const puppeteer = require("puppeteer-core");
const equity = require("./weekly-equity.cjs");

async function main() {
  assert.equal(equity.rows.length,21);
  assert.deepEqual(equity.rows.filter(row=>row.snapshot).map(row=>row.endingCents),
    [1767122,1583894,1321403,1207921,1298227,1306548,1116991,988122,1002118,1014432]);
  assert.throws(()=>equity.calculate(equity.input,[]),/Missing unadjusted/);
  const adjustedQuotes=equity.market.quotes.map(quote=>({...quote,adjustment:"forward"}));
  assert.throws(()=>equity.calculate(equity.input,adjustedQuotes),/Missing unadjusted/);
  assert.equal(equity.rows.find(row=>row.label==="09.14-09.18").holdings[0].valueCents,20380);
  equity.rows.forEach((row,i)=>{
    assert.equal(row.openingCents,i ? equity.rows[i-1].endingCents : equity.input.openingCents);
    assert.equal(row.calculatedCents,row.openingCents+row.changeCents);
    if(row.snapshot) {
      assert.equal(row.endingCents,row.snapshot.cashCents+row.marketValueCents);
      row.holdings.forEach(holding=>assert.equal(holding.quote.date,row.snapshot.date));
    } else assert.equal(row.endingCents,row.recordedCents);
  });
  const root=path.resolve(__dirname,"..");
  const output=path.join(root,"output/weekly-equity");
  fs.mkdirSync(output,{recursive:true});
  const file=path.join(root,"weekly-trading-review/index.html");
  const before=fs.readFileSync(file,"utf8");
  execFileSync(process.execPath,[path.join(__dirname,"update-weekly-hub-chart.js")]);
  await require("./fill-weekly-return-rates.cjs")();
  await require("./fill-weekly-equity.cjs")();
  assert.equal(fs.readFileSync(file,"utf8"),before,"Rebuilding must be idempotent");
  const browser=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  const results=[];
  try {
    const page=await browser.newPage();
    for(const width of [1440,390]) {
      await page.setViewport({width,height:1000,deviceScaleFactor:1});
      await page.goto(pathToFileURL(file).href);
      const result=await page.evaluate(()=>({
        width:innerWidth, scrollWidth:document.documentElement.scrollWidth,
        cards:[...document.querySelectorAll(".archive .week-card")].map(card=>({
          href:card.getAttribute("href"),
          value:card.querySelector("[data-equity-status] b")?.textContent,
          status:card.querySelector("[data-equity-status]")?.dataset.equityStatus,
          count:card.querySelectorAll("[data-equity-status]").length,
          notes:card.querySelectorAll(".equity-basis").length,
          formula:card.querySelector(".equity-basis")?.textContent,
          cash:[...card.querySelectorAll(".mini-grid>span")].find(el=>el.textContent.startsWith("期末现金"))?.querySelector("b").textContent,
        })),
        rows:[...document.querySelectorAll(".weekly-data-table tbody tr")].map(row=>({
          href:row.querySelector("a").getAttribute("href"),equity:row.cells[4].firstChild.textContent,
          status:row.cells[4].querySelector("small").textContent,position:row.cells[3].textContent,
          best:row.cells[6].textContent,worst:row.cells[7].textContent,
        })),
        points:document.querySelectorAll(".weekly-chart circle").length,
        styles:document.querySelectorAll("#weekly-equity-style").length,
        redundantRates:document.querySelectorAll("#weekly-return-rates").length,
        latestChartVisible:(()=>{const el=document.querySelector(".chart-wrap");return Math.abs(el.scrollLeft+el.clientWidth-el.scrollWidth)<=1;})(),
        summary:document.querySelector(".chart-summary").textContent,
        amountLegend:getComputedStyle(document.querySelector(".legend-line.amount")).borderTopColor,
        amountLegendWidth:getComputedStyle(document.querySelector(".legend-line.amount")).borderTopWidth,
        invalid:/undefined|NaN/.test(document.body.innerText),
        clipped:[...document.querySelectorAll(".weekly-chart text")].some(text=>{
          const r=text.getBBox(),v=text.ownerSVGElement.viewBox.baseVal;
          return r.x<0 || r.y<0 || r.x+r.width>v.width || r.y+r.height>v.height;
        }),
      }));
      assert.equal(result.scrollWidth,width);
      assert.equal(result.cards.length,21);
      assert.equal(result.rows.length,21);
      assert.equal(result.points,63);
      assert.equal(result.styles,1);
      assert.equal(result.redundantRates,0);
      assert.equal(result.latestChartVisible,true);
      assert.equal(result.amountLegend,"rgb(194, 65, 45)");
      assert.equal(result.amountLegendWidth,"3px");
      for(const value of ["-18,189.64","09.21-09.30（合并） +1.35%","-67.31%","10,144.32"])
        assert.ok(result.summary.includes(value));
      assert.equal(result.invalid,false);
      assert.equal(result.clipped,false);
      for(const row of equity.rows) {
        const href=`../${row.folder}/`;
        const card=result.cards.find(card=>card.href===href);
        const table=result.rows.find(item=>item.href===href);
        assert.equal(card.value,equity.money(row.endingCents));
        assert.equal(card.status,row.status);
        assert.equal(card.count,1);
        assert.ok(card.notes<=1);
        assert.equal(table.equity,card.value);
        assert.equal(table.status,equity.statusLabel(row));
        if(row.snapshot) assert.ok(card.formula.includes(equity.formula(row)));
        if(row.snapshot && row.closedOnly) {
          assert.equal(table.position,"待补");
          assert.equal(table.best,"待补");
          assert.equal(table.worst,"待补");
        }
      }
      assert.deepEqual(result.cards.filter(card=>card.cash).map(card=>card.cash).sort(),
        ["12,165.27","14.48","11,169.91","11.22","67.38"].sort());
      await (await page.$(".overview-panel")).screenshot({path:path.join(output,`overview-${width}.png`)});
      await (await page.$(".weekly-data-wrap")).screenshot({path:path.join(output,`equity-table-${width}.png`)});
      await (await page.$('.week-card[href="../2026-09-21_2026-09-30/"]')).screenshot({path:path.join(output,`latest-card-${width}.png`)});
      await page.$eval(".chart-wrap",el=>{el.scrollLeft=el.scrollWidth;});
      await (await page.$(".chart-wrap")).screenshot({path:path.join(output,`latest-chart-${width}.png`)});
      results.push(result);
    }
  } finally {await browser.close();}
  fs.writeFileSync(path.join(output,"checks.json"),JSON.stringify(results,null,2)+"\n");
  console.log(JSON.stringify(results.map(r=>({width:r.width,cards:r.cards.length,rows:r.rows.length,points:r.points})),null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
