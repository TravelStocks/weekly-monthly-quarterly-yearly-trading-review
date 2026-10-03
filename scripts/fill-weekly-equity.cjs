const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const puppeteer = require("puppeteer-core");
const equity = require("./weekly-equity.cjs");

async function update() {
  const file = path.resolve(__dirname, "../weekly-trading-review/index.html");
  const updates = equity.rows.map(row => ({...row, value:equity.money(row.endingCents),
    label:`期末权益${row.status === "recorded" ? "" : "（" + equity.statusLabel(row) + "）"}`,
    note:row.status === "estimated" ? equity.formula(row) + "。沿用现有金额，未校准未知持仓浮盈亏或出入金。" :
      row.adjustmentCents ? equity.formula(row) + `；保留原权益 ${equity.money(row.endingCents)} 校准，口径差额 ${equity.money(row.adjustmentCents)}，原因待核对。` : ""}));
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
      while(doc.body.lastChild?.nodeType === 3 && !doc.body.lastChild.textContent.trim()) doc.body.lastChild.remove();
      return {html:"<!DOCTYPE html>\n"+doc.documentElement.outerHTML+"\n",count};
    },{html:fs.readFileSync(file,"utf8"),updates});
    assert.equal(result.count,updates.length,"All equity periods must have archive cards");
    fs.writeFileSync(file,result.html,"utf8");
    console.log(`Updated ${result.count} ending equities; ${updates.filter(row=>row.status==="estimated").length} estimated.`);
  } finally {await browser.close();}
}
if(require.main===module)update().catch(error=>{console.error(error);process.exitCode=1;});
module.exports=update;
