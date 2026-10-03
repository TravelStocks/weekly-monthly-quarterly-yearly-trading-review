const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const puppeteer = require("puppeteer-core");
const equity = require("./weekly-equity.cjs");

async function update() {
  const file = path.resolve(__dirname, "../weekly-trading-review/index.html");
  const updates = equity.rows.map(row => ({...row, value:equity.money(row.endingCents),
    label:`期末权益${row.status === "recorded" ? "" : "（" + equity.statusLabel(row) + "）"}`,
    note:row.snapshot ? equity.formula(row) + "。按交割单可见现金与持仓核算，不复权收盘估值；无其他持仓、漏单或资金变动为前提。" + (row.snapshot.note || "") : ""}));
  const browser = await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  try {
    const page = await browser.newPage();
    const result = await page.evaluate(({html,updates}) => {
      const doc = new DOMParser().parseFromString(html,"text/html");
      let count = 0;
      for(const card of doc.querySelectorAll(".archive .week-card")) {
        const folder = card.getAttribute("href").split("/").filter(x=>x!=="..").find(Boolean);
        const row = updates.find(item=>item.folder===folder);
        if(!row) continue;
        let span = [...card.querySelectorAll(".mini-grid>span")].find(el=>/^期末权益/.test(el.textContent));
        if(!span) {span=doc.createElement("span");card.querySelector(".mini-grid").append(span);}
        const value=doc.createElement("b");value.textContent=row.value;
        span.replaceChildren(doc.createTextNode(row.label+" "),value);
        span.dataset.equityStatus=row.status;
        let note=card.querySelector(".equity-basis");
        if(row.note) {
          if(!note) {note=doc.createElement("small");note.className="equity-basis";card.append(note);}
          note.textContent=row.note;
        } else if(note) note.remove();
        count++;
      }
      const latest=updates.at(-1);
      const metric=[...doc.querySelectorAll(".hero .metric")].find(el=>/^最新账户|^最新权益/.test(el.querySelector("span")?.textContent));
      if(metric && latest.snapshot) {
        metric.querySelector("span").textContent="最新权益（估值）";
        metric.querySelector("strong").textContent=latest.value;
        metric.querySelector("small").textContent="现金与持仓市值合计 / 待券商核对";
      }
      while(doc.body.lastChild?.nodeType === 3 && !doc.body.lastChild.textContent.trim()) doc.body.lastChild.remove();
      return {html:"<!DOCTYPE html>\n"+doc.documentElement.outerHTML+"\n",count};
    },{html:fs.readFileSync(file,"utf8"),updates});
    assert.equal(result.count,updates.length,"All equity periods must have archive cards");
    fs.writeFileSync(file,result.html,"utf8");
    console.log(`Updated ${result.count} ending equities; ${updates.filter(row=>row.snapshot).length} cash/holding valuations.`);
  } finally {await browser.close();}
}
if(require.main===module)update().catch(error=>{console.error(error);process.exitCode=1;});
module.exports=update;
