const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const puppeteer = require("puppeteer-core");
const rates = require("./weekly-return-rates.cjs");

async function update() {
  const file = path.resolve(__dirname, "../weekly-trading-review/index.html");
  const browser = await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  try {
    const page = await browser.newPage();
    const updates = [...new Set(rates.data.periods.map(row=>row.folder).filter(Boolean))]
      .map(folder=>({folder,...rates.forFolder(folder)}));
    const original = fs.readFileSync(file,"utf8");
    const result = await page.evaluate(({html,updates,table})=>{
      const doc = new DOMParser().parseFromString(html,"text/html");
      let count=0;
      for(const card of doc.querySelectorAll(".archive .week-card")){
        const folder=card.getAttribute("href").split("/").filter(x=>x!=="..").find(Boolean);
        const update=updates.find(row=>row.folder===folder);
        let value=[...card.querySelectorAll(".mini-grid>span")].find(el=>/^周收益/.test(el.textContent));
        if(!value && update){
          value=doc.createElement("span");value.innerHTML="周收益率 <b>待补</b>";
          card.querySelector(".mini-grid").append(value);
        }
        if(!value)continue;
        const b=value.querySelector("b");
        value.firstChild.textContent="周收益率 ";
        if(!update)continue;
        count++;
        b.textContent=update.formatted;
        b.className=update.points>0?"is-profit":update.points<0?"is-loss":"";
        let note=card.querySelector(".return-basis");
        if(!note){note=doc.createElement("small");note.className="return-basis";card.append(note);}
        note.textContent=update.note;
      }
      const archive=[...doc.querySelectorAll("section")].find(el=>el.querySelector(".archive"));
      const existing=doc.getElementById("weekly-return-rates");
      if(existing)existing.outerHTML=table;
      else archive.insertAdjacentHTML("beforebegin",table);
      return {html:"<!DOCTYPE html>\n"+doc.documentElement.outerHTML+"\n",count};
    },{html:original,updates,table:rates.renderTable()});
    assert.equal(result.count,updates.length);
    fs.writeFileSync(file,result.html,"utf8");
    console.log("Updated "+result.count+" archive rates and all "+rates.data.periods.length+" supplied weeks.");
  } finally {await browser.close();}
}
if(require.main===module)update().catch(error=>{console.error(error);process.exitCode=1;});
module.exports=update;
