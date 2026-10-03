const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {pathToFileURL} = require("node:url");
const puppeteer = require("puppeteer-core");
const rates = require("./weekly-return-rates.cjs");

async function main() {
  assert.deepEqual(rates.data.periods.map(row=>row.basisPoints),[168,1110,-2679,-844,1263,-455,90,-1508,-1184,221,499,-364]);
  assert.equal(rates.forFolder("2026-09-21_2026-09-30").points,135);
  const root=path.resolve(__dirname,"..");
  const output=path.join(root,"output/weekly-return-rates");
  fs.mkdirSync(output,{recursive:true});
  const browser=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  const results=[];
  try {
    const page=await browser.newPage();
    for(const width of [1440,390]) {
      await page.setViewport({width,height:1000,deviceScaleFactor:1});
      await page.goto(pathToFileURL(path.join(root,"weekly-trading-review/index.html")).href);
      const result=await page.evaluate(()=>{
        const cards=[...document.querySelectorAll(".archive .week-card")].map(card=>({
          href:card.getAttribute("href"),
          rate:[...card.querySelectorAll(".mini-grid>span")].find(el=>el.textContent.startsWith("周收益率"))?.querySelector("b").textContent,
          note:card.querySelector(".return-basis")?.textContent
        }));
        return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,cards,
          rates:[...document.querySelectorAll("#weekly-return-rates tbody tr")].map(row=>row.cells[1].textContent),
          sections:document.querySelectorAll("#weekly-return-rates").length,
          oldLabels:[...document.querySelectorAll(".archive .mini-grid>span")].filter(el=>/^周收益\s/.test(el.textContent)).length,
          moneyPreserved:["-533.37","-4,434.59","+186.27","-965.38","-541.69","-221.06"].every(value=>document.querySelector(".archive").textContent.includes(value)),
          positiveColors:[...document.querySelectorAll("#weekly-return-rates .is-profit")].map(el=>getComputedStyle(el).color),
          negativeColors:[...document.querySelectorAll("#weekly-return-rates .is-loss")].map(el=>getComputedStyle(el).color),
          invalid:/undefined|NaN/.test(document.body.innerText)
        };
      });
      assert.equal(result.scrollWidth,width);
      assert.equal(result.sections,1);
      assert.equal(result.oldLabels,0);
      assert.equal(result.invalid,false);
      assert.equal(result.moneyPreserved,true);
      assert.equal(result.cards.length,18);
      assert.deepEqual(result.rates,rates.data.periods.map(row=>rates.formatRate(row.basisPoints)));
      for(const folder of new Set(rates.data.periods.map(row=>row.folder).filter(Boolean))){
        const card=result.cards.find(row=>row.href==="../"+folder+"/");
        assert.equal(card.rate,rates.forFolder(folder).formatted);
        assert.ok(card.note.includes("相加"));
      }
      assert.ok(result.positiveColors.every(c=>c==="rgb(194, 65, 45)"));
      assert.ok(result.negativeColors.every(c=>c==="rgb(20, 132, 95)"));
      await (await page.$("#weekly-return-rates")).screenshot({path:path.join(output,"rates-"+width+".png")});
      await (await page.$(".archive")).screenshot({path:path.join(output,"archive-"+width+".png")});
      results.push(result);
    }
  } finally {await browser.close();}
  fs.writeFileSync(path.join(output,"checks.json"),JSON.stringify(results,null,2)+"\n");
  console.log(JSON.stringify(results.map(r=>({width:r.width,rows:r.rates.length,archiveCards:r.cards.length,oldLabels:r.oldLabels,moneyPreserved:r.moneyPreserved})),null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
