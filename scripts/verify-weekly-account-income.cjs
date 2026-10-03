const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {pathToFileURL}=require("node:url");
const puppeteer=require("puppeteer-core");
const income=require("./weekly-account-income.cjs");
const rates=require("./weekly-return-rates.cjs");

async function main() {
  assert.equal(income.data.rows.length,57);
  assert.equal(income.data.rows.reduce((n,row)=>n+row.amountCents,0),-544800);
  assert.deepEqual(income.data.weeklyControls.map(row=>row.amountCents),
    [24300,181000,-443400,-113500,151600,-61100,8400,-189500,-128900,14100,50500,-38300]);
  assert.equal(income.forFolder("2026-09-21_2026-09-30").amountCents,12200);
  const root=path.resolve(__dirname,"..");
  const output=path.join(root,"output/weekly-account-income");fs.mkdirSync(output,{recursive:true});
  const files=income.folders.map(folder=>path.join(root,folder,"index.html"));
  const hub=path.join(root,"weekly-trading-review/index.html");
  const before=[...files,hub].map(file=>fs.readFileSync(file,"utf8"));
  await require("./fill-weekly-account-income.cjs")();
  [...files,hub].forEach((file,i)=>assert.equal(fs.readFileSync(file,"utf8"),before[i],"Update is not idempotent: "+file));
  const browser=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  const results=[];
  try {
    const page=await browser.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
    for(const width of [1440,390]) {
      await page.setViewport({width,height:1000,deviceScaleFactor:1});
      for(const folder of income.folders) {
        await page.goto(pathToFileURL(path.join(root,folder,"index.html")).href);
        const actual=await page.evaluate(()=>{
          const account=document.querySelector("#account");
          const headers=[...account.querySelectorAll("thead th")].map(el=>el.textContent);
          const amount=headers.findIndex(x=>/日盈亏金额/.test(x)),rate=headers.findIndex(x=>/日收益率/.test(x));
          return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,accounts:document.querySelectorAll("#account").length,
            amountCents:Number(account.dataset.accountAmountCents),rateBasisPoints:Number(account.dataset.accountRateBasisPoints),
            source:account.dataset.accountSource,
            rows:[...account.querySelectorAll("tbody tr[data-account-date]")].map(row=>({date:row.dataset.accountDate,amount:row.cells[amount].textContent,rate:row.cells[rate].textContent,amountCents:Number(row.cells[amount].dataset.amountCents),rateBasisPoints:Number(row.cells[rate].dataset.rateBasisPoints)})),
            cards:[...account.querySelectorAll(".account-day")].map(card=>({date:card.dataset.accountDate,amount:card.querySelector(":scope>strong").textContent,rate:card.querySelector(":scope>small").textContent.split(" / ")[0]})),
            summary:account.querySelector(".account-summary").textContent,
            missingAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash),
            invalid:/undefined|NaN/.test(account.textContent),
          };
        });
        const expected=income.forFolder(folder);
        assert.equal(actual.scrollWidth,width,"Overflow: "+folder);
        assert.equal(actual.accounts,1);assert.equal(actual.invalid,false);assert.equal(actual.source,income.data.source);
        assert.equal(actual.amountCents,expected.amountCents);assert.equal(actual.rateBasisPoints,expected.rateBasisPoints);
        assert.equal(actual.rows.length,expected.rows.length);assert.equal(actual.cards.length,expected.rows.length);
        for(const day of expected.rows) {
          const row=actual.rows.find(row=>row.date===day.date),card=actual.cards.find(row=>row.date===day.date);
          assert.ok(row && card,"Missing day "+day.date+" in "+folder);
          assert.equal(row.amountCents,day.amountCents);assert.equal(row.rateBasisPoints,day.rateBasisPoints);
          assert.equal(row.amount,income.money(day.amountCents));assert.equal(row.rate,income.rate(day.rateBasisPoints));
          assert.equal(card.amount,row.amount);assert.equal(card.rate,row.rate);
        }
        assert.ok(!actual.rows.some(row=>row.date==="2026-09-25"));
        assert.ok(actual.summary.includes(income.dayLabel(expected.best)) && actual.summary.includes(income.dayLabel(expected.worst)));
        assert.deepEqual(actual.missingAnchors,[],"Invalid anchors: "+folder);
        if(["2026-07-20_2026-07-24","2026-08-16_2026-08-23","2026-09-21_2026-09-30"].includes(folder)) {
          await (await page.$("#account .account-summary")).screenshot({path:path.join(output,folder+"-summary-"+width+".png")});
          await page.$eval("#account",el=>el.scrollIntoView());
          await page.screenshot({path:path.join(output,folder+"-view-"+width+".png")});
        }
        results.push({folder,width,rows:actual.rows.length,amount:income.money(actual.amountCents),rate:income.rate(actual.rateBasisPoints)});
      }
      await page.goto(pathToFileURL(hub).href);
      const home=await page.evaluate(()=>({
        rows:[...document.querySelectorAll(".weekly-data-table tbody tr")].map(row=>({href:row.querySelector("a").getAttribute("href"),amount:row.cells[1].firstChild.textContent,rate:row.cells[2].textContent})),
        cards:[...document.querySelectorAll(".archive .week-card")].map(card=>({href:card.getAttribute("href"),amount:card.querySelector("[data-account-amount] b")?.textContent})),
        redundantRateSections:document.querySelectorAll("#weekly-return-rates").length,
      }));
      assert.equal(home.redundantRateSections,0);
      for(const folder of new Set(rates.data.periods.map(row=>row.folder))) {
        const expected=income.forFolder(folder),href="../"+folder+"/";
        const row=home.rows.find(row=>row.href===href),card=home.cards.find(row=>row.href===href);
        assert.equal(row.amount,income.money(expected.amountCents));assert.equal(card.amount,row.amount);
        assert.equal(row.rate,income.rate(expected.rateBasisPoints));
      }
    }
    assert.deepEqual(errors,[]);
  } finally {await browser.close();}
  fs.writeFileSync(path.join(output,"checks.json"),JSON.stringify(results,null,2)+"\n");
  console.log(JSON.stringify(results,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
