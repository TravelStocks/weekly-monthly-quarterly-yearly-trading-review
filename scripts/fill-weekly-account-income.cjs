const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const puppeteer = require("puppeteer-core");
const income = require("./weekly-account-income.cjs");
const equity = require("./weekly-equity.cjs");

const root=path.resolve(__dirname,"..");
const normalize=html=>html.replace(/[\t ]+\n/g,"\n").replace(/\s*<\/body><\/html>\s*$/,"</body></html>\n");
const css=`.workbook-account .account-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:10px}.workbook-account .account-summary>span{border:1px solid var(--line);border-radius:8px;background:#f8fafc;padding:12px;color:var(--muted);font-size:13px}.workbook-account .account-summary b{display:block;margin-top:5px;font-size:17px;color:var(--ink)}.workbook-account .account-bars{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:12px;margin:18px 0}.workbook-account .account-day{min-width:0;border:1px solid var(--line);border-radius:8px;background:#fff;padding:12px;display:grid;gap:8px;align-content:start}.workbook-account .account-day-head{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--muted)}.workbook-account .account-bar-track{height:80px;background:#f1f5f9;display:flex;align-items:end;border-radius:6px;overflow:hidden}.workbook-account .account-bar-track i{display:block;width:100%;border-radius:6px 6px 0 0}.workbook-account .account-day>strong{font-size:20px}.workbook-account .account-day>small{color:var(--muted);line-height:1.6}.workbook-account .account-source{font-size:13px;color:var(--muted);overflow-wrap:anywhere}.workbook-account .is-profit{color:#c2412d!important}.workbook-account .is-loss{color:#14845f!important}.workbook-account .account-income-table{min-width:620px}.workbook-account .daily-trades{min-width:0}@media(max-width:560px){.workbook-account .account-summary,.workbook-account .account-bars{grid-template-columns:1fr}}`;

async function update() {
  const browser=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  try {
    const page=await browser.newPage();
    for(const folder of income.folders) {
      const file=path.join(root,folder,"index.html");
      if(!fs.existsSync(file)) continue;
      const summary=income.forFolder(folder);
      const result=await page.evaluate(({html,summary,source,css})=>{
        const doc=new DOMParser().parseFromString(html,"text/html");
        const money=cents=>(cents>0?"+":cents<0?"-":"")+(Math.abs(cents)/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
        const rate=points=>(points>0?"+":"")+(points/100).toFixed(2)+"%";
        const trend=value=>value>0?"is-profit":value<0?"is-loss":"";
        const dayLabel=day=>`${day.weekday} ${day.date.slice(5)} ${money(day.amountCents)}`;
        const protectedSelectors=["#trades","#stocks","#charts","#daily","#positions","#holdings","#reflection","#second-review","#profit-loss"];
        const protectedContent=protectedSelectors.map(selector=>doc.querySelector(selector)?.innerHTML);
        let account=doc.querySelector("#account");
        if(!account) {
          account=doc.createElement("section");account.id="account";account.className="panel account-panel";
          account.innerHTML='<span class="label">Account Curve</span><h2>账户收益与仓位</h2><p class="lead"></p>';
          const after=doc.querySelector("#summary");
          if(after) after.after(account);else doc.querySelector("main").append(account);
        }
        account.classList.add("workbook-account");
        account.dataset.accountSource=source;
        account.dataset.accountAmountCents=summary.amountCents;
        account.dataset.accountRateBasisPoints=summary.rateBasisPoints;
        let lead=account.querySelector(".lead");
        if(!lead){lead=doc.createElement("p");lead.className="lead";account.querySelector("h2").after(lead);}
        lead.textContent=`${summary.rows[0].date} 至 ${summary.rows.at(-1).date}，共 ${summary.rows.length} 条每日记录。日盈亏合计 ${money(summary.amountCents)} 元，日收益率简单相加 ${rate(summary.rateBasisPoints)}。金额为截图整数元之和，不等于现金余额变化或交割闭环盈亏；收益率不计复利。`;
        if(summary.components.length>1)lead.textContent+=" 分周："+summary.components.join("；")+"。";
        account.querySelector(".account-placeholder")?.remove();
        let metrics=account.querySelector(".account-summary");
        if(!metrics){metrics=doc.createElement("div");metrics.className="account-summary";lead.after(metrics);}
        const setMetric=(key,label,value,match,cls="")=>{
          let item=[...metrics.children].find(el=>el.dataset.accountField===key || match?.test(el.firstChild?.textContent));
          if(!item){item=doc.createElement("span");metrics.append(item);}
          item.dataset.accountField=key;item.replaceChildren(doc.createTextNode(label+" "));
          const b=doc.createElement("b");b.textContent=value;b.className=cls;item.append(b);
        };
        setMetric("amount","日盈亏合计（整数元）",money(summary.amountCents),/^(账户)?日收益合计/,trend(summary.amountCents));
        setMetric("rate","收益率（每日相加）",rate(summary.rateBasisPoints),null,trend(summary.rateBasisPoints));
        setMetric("count","每日记录",summary.rows.length+" 天");
        setMetric("best","最赚日",dayLabel(summary.best),/^最佳单日/,trend(summary.best.amountCents));
        setMetric("worst","最亏日",dayLabel(summary.worst),null,trend(summary.worst.amountCents));
        const paired=[...metrics.children].find(el=>/^最佳\/最差日/.test(el.firstChild?.textContent));
        if(paired) paired.remove();
        if(![...metrics.children].some(el=>/^平均仓位/.test(el.firstChild?.textContent))) setMetric("position","平均仓位","待补");
        let table=account.querySelector("table");
        if(!table) {
          const wrap=doc.createElement("div");wrap.className="table-wrap compact-table";
          wrap.innerHTML='<table class="account-income-table"><thead><tr><th>日期</th><th>星期</th><th>日收益率</th><th>日盈亏金额（元）</th><th>仓位</th><th>当前总金额</th></tr></thead><tbody></tbody></table>';
          account.append(wrap);table=wrap.querySelector("table");
        }
        const headers=[...table.querySelectorAll("thead th")];
        const dateIndex=headers.findIndex(el=>el.textContent==="日期");
        const rateIndex=headers.findIndex(el=>/收益率/.test(el.textContent));
        const amountIndex=headers.findIndex(el=>/收益金额|日盈亏金额/.test(el.textContent));
        if([dateIndex,rateIndex,amountIndex].some(i=>i<0))throw new Error("Unrecognized daily account columns");
        headers[rateIndex].textContent="日收益率";headers[amountIndex].textContent="日盈亏金额（元）";
        for(const day of summary.rows) {
          let row=[...table.tBodies[0].rows].find(row=>row.cells[dateIndex].textContent.trim().replaceAll("/","-")===day.date);
          if(!row){row=table.tBodies[0].insertRow();headers.forEach(()=>{row.insertCell().textContent="待补";});row.cells[dateIndex].textContent=day.date.replaceAll("-","/");row.cells[1].textContent=day.weekday;}
          row.dataset.accountDate=day.date;
          row.cells[rateIndex].textContent=rate(day.rateBasisPoints);row.cells[rateIndex].className=trend(day.rateBasisPoints);
          row.cells[amountIndex].textContent=money(day.amountCents);row.cells[amountIndex].className=trend(day.amountCents);
          row.cells[rateIndex].dataset.rateBasisPoints=day.rateBasisPoints;row.cells[amountIndex].dataset.amountCents=day.amountCents;
          const reflection=row.querySelector(".reflection-cell");
          if(reflection?.textContent==="账户日收益、仓位、当前总金额待补；本行先展示成交统计。")reflection.textContent="日收益已补齐；每日仓位与当前总金额待补。";
        }
        let bars=account.querySelector(".account-bars");
        if(!bars){bars=doc.createElement("div");bars.className="account-bars";metrics.after(bars);}
        const max=Math.max(1,...summary.rows.map(day=>Math.abs(day.amountCents)));
        for(const day of summary.rows) {
          let card=[...bars.querySelectorAll(".account-day")].find(card=>card.querySelector(".account-day-head span")?.textContent.trim().replaceAll(".","-")===day.date.slice(5));
          if(!card){card=doc.createElement("article");card.className="account-day";card.innerHTML='<div class="account-day-head"><b></b><span></span></div><div class="account-bar-track"><i></i></div><strong></strong><small>仓位待补</small>';bars.append(card);}
          card.dataset.accountDate=day.date;
          card.querySelector(".account-day-head b").textContent=day.weekday;card.querySelector(".account-day-head span").textContent=day.date.slice(5);
          const strong=card.querySelector(":scope>strong");strong.textContent=money(day.amountCents);strong.className=trend(day.amountCents);
          const small=card.querySelector(":scope>small");
          const position=small.textContent.match(/仓位\s*[-\d.]+%/)?.[0] || "仓位待补";
          small.textContent=rate(day.rateBasisPoints)+" / "+position;
          const bar=card.querySelector(".account-bar-track i");
          bar.style.height=(day.amountCents===0 ? 0 : Math.max(6,Math.abs(day.amountCents)/max*100))+"%";
          bar.style.background=day.amountCents>0 ? "#c2412d" : day.amountCents<0 ? "#14845f" : "#cbd5e1";
        }
        let note=account.querySelector(".account-source");
        if(!note){note=doc.createElement("p");note.className="account-source";account.append(note);}
        note.textContent=`来源：《${source}》的“每日明细”与“每周汇总”。每日金额按源表整数元录入，未提供的数据不反推。`;
        const nav=doc.querySelector('.rail');
        let accountLink=nav?.querySelector('a[href="#account"]');
        if(nav && !accountLink){accountLink=doc.createElement("a");accountLink.setAttribute("href","#account");nav.append(accountLink);}
        if(accountLink)accountLink.textContent="账户收益";
        for(const metric of doc.querySelectorAll(".hero .metric")) {
          const label=metric.querySelector("span");
          if(/^账户(收益|日收益)/.test(label?.textContent)) {
            label.textContent="账户日盈亏合计";
            const strong=metric.querySelector("strong");strong.textContent=money(summary.amountCents);strong.className=trend(summary.amountCents);
            metric.querySelector("small").textContent="每日收益率相加 "+rate(summary.rateBasisPoints);
          }
        }
        for(const item of doc.querySelectorAll("#missing .missing-list article")) {
          const b=item.querySelector("b"),p=item.querySelector("p");
          if(p && (/本周每日账户收益率|每日收益率、收益金额/.test(p.textContent)||/七天账户数据/.test(b?.textContent))){
            b.textContent=(b.textContent.match(/^\d+[.、]\s*/)?.[0] || "")+"每日仓位与券商账户权益";
            p.textContent="每日收益金额与收益率已补齐。仍需每日仓位、券商确认总资产及期间出入金记录，用于核对仓位和每日权益回撤。";
          }
        }
        const replacements=[
          ["账户日收益、收益率、仓位、期末权益暂缺","账户日收益金额与收益率已补齐；每日仓位与券商确认权益仍待补"],
          ["账户收益率、仓位及持仓市值未提供","账户日收益金额与收益率已补齐；仓位及持仓市值未提供"],
          ["账户日收益、期末持仓、日度KISS与二次反思待补","账户日收益已补齐；期末持仓、日度KISS与二次反思待补"],
          ["账户日收益、期末持仓确认和二次反思待补","账户日收益已补齐；期末持仓确认和二次反思待补"],
          ["账户日数据与期末持仓确认继续待补","账户每日金额与收益率已补齐；每日仓位与期末持仓确认仍待补"],
          ["手续费、印花税、账户收益、资金余额、每日仓位均暂不硬算","手续费、印花税、资金余额和每日仓位不据成交截图硬算；账户日盈亏与收益率另按每日收益明细记录"],
          ["未提供9/18收盘权益及7天账户表，因此不填账户收益率、平均仓位或最大回撤","7天账户日收益金额与收益率已补齐；9/18券商确认权益与每日仓位仍待补，因此平均仓位和每日权益回撤仍不填"],
        ];
        for(const p of doc.querySelectorAll(".hero p,.thesis-grid p,.data-panel p,.data-note p")) {
          const walker=doc.createTreeWalker(p,NodeFilter.SHOW_TEXT);
          while(walker.nextNode())for(const [from,to] of replacements)walker.currentNode.textContent=walker.currentNode.textContent.replaceAll(from,to);
        }
        let style=doc.getElementById("weekly-account-income-style");
        if(!style){style=doc.createElement("style");style.id="weekly-account-income-style";doc.head.append(style);}
        style.textContent=css;
        return {html:"<!DOCTYPE html>\n"+doc.documentElement.outerHTML+"\n",rows:table.querySelectorAll("tbody [data-account-date]").length,
          protectedUnchanged:protectedSelectors.every((selector,i)=>doc.querySelector(selector)?.innerHTML===protectedContent[i])};
      },{html:fs.readFileSync(file,"utf8"),summary,source:income.data.source,css});
      assert.equal(result.rows,summary.rows.length,folder);
      assert.equal(result.protectedUnchanged,true,"Protected trading sections changed: "+folder);
      fs.writeFileSync(file,normalize(result.html),"utf8");
      console.log(`${folder}: ${summary.rows.length} days, ${income.money(summary.amountCents)}, ${income.rate(summary.rateBasisPoints)}`);
    }
    const file=path.join(root,"weekly-trading-review/index.html");
    const html=await page.evaluate(({html,summaries,source})=>{
      const doc=new DOMParser().parseFromString(html,"text/html");
      for(const card of doc.querySelectorAll(".archive .week-card")) {
        const folder=card.getAttribute("href").split("/").filter(x=>x!=="..").find(Boolean);
        const row=summaries.find(row=>row.folder===folder);if(!row)continue;
        let item=card.querySelector("[data-account-amount]");
        if(!item){item=doc.createElement("span");item.dataset.accountAmount="";card.querySelector(".mini-grid").append(item);}
        item.textContent="日盈亏合计（整数元） ";
        const b=doc.createElement("b");b.textContent=row.amount;b.className=row.trend;item.append(b);
        let note=card.querySelector(".account-income-basis");
        if(!note){note=doc.createElement("small");note.className="account-income-basis";card.append(note);}
        note.textContent=`${row.count}条每日记录，金额按整数元合计；与闭环盈亏独立列示。`;
        for(const original of card.querySelectorAll(".mini-grid>span:not([data-account-amount])")) {
          if(/^金额变化|^账户日收益/.test(original.firstChild?.textContent)) {
            original.firstChild.textContent="日盈亏合计（整数元） ";original.querySelector("b").textContent=row.amount;original.querySelector("b").className=row.trend;
            item.remove();original.dataset.accountAmount="";
          }
        }
        if(row.closedAmount) {
          const existing=[...card.querySelectorAll(".mini-grid>span")].filter(el=>el.hasAttribute("data-closed-contribution") || /^(已实现盈亏|可见闭环盈亏|闭环盈亏)/.test(el.firstChild?.textContent));
          let closed=existing[0];existing.slice(1).forEach(el=>el.remove());
          if(!closed){closed=doc.createElement("span");closed.dataset.closedContribution="";card.querySelector(".mini-grid").append(closed);}
          closed.dataset.closedContribution="";
          closed.textContent="可见闭环盈亏 ";
          const b=doc.createElement("b");b.textContent=row.closedAmount;b.className=row.closedTrend;closed.append(b);
        }
        const description=card.querySelector("p");
        if(description)description.textContent=description.textContent.replace("金额为可见已平仓交易计算值；账户金额、持仓浮盈亏待补后校准。","账户日盈亏与可见闭环盈亏分别列示；期末权益沿用已录入或收盘估值口径。").replace("账户与二次反思待补。","每日仓位与二次反思待补。").replace("账户日数据与持仓确认待补。","账户日收益已补齐，每日仓位与持仓确认待补。");
      }
      const latest=summaries.find(row=>row.folder==="2026-09-21_2026-09-30");
      for(const p of doc.querySelectorAll(".hero p"))p.textContent=p.textContent.replace("账户数据和二次反思待补","账户日收益已补齐，仓位和二次反思待补");
      for(const section of doc.querySelectorAll("main>section")) {
        if(!section.querySelector("h2")?.textContent.startsWith("最新周"))continue;
        for(const p of section.querySelectorAll("p"))p.textContent=p.textContent.replace("账户日收益合计 待补，期末总金额 待补。",`账户日盈亏合计 ${latest.amount} 元，每日收益率相加 ${latest.rate}。`);
        for(const item of section.querySelectorAll(".latest-summary>span"))if(/^账户日收益/.test(item.firstChild?.textContent)){item.firstChild.textContent="账户日盈亏合计 ";item.querySelector("b").textContent=latest.amount;item.querySelector("b").className=latest.trend;}
        for(const item of section.querySelectorAll(".latest-summary>span"))if(/^账户口径/.test(item.firstChild?.textContent)){item.firstChild.textContent="账户收益率（每日相加） ";item.querySelector("b").textContent=latest.rate;item.querySelector("b").className="is-profit";}
      }
      return "<!DOCTYPE html>\n"+doc.documentElement.outerHTML+"\n";
    },{html:fs.readFileSync(file,"utf8"),source:income.data.source,summaries:income.folders.map(folder=>{
      const s=income.forFolder(folder),ledger=equity.rows.find(row=>row.folder===folder);
      return {folder,amount:income.money(s.amountCents),rate:income.rate(s.rateBasisPoints),trend:income.trend(s.amountCents),count:s.rows.length,
        closedAmount:ledger?.closedOnly ? income.money(ledger.changeCents) : null,closedTrend:ledger?.closedOnly ? income.trend(ledger.changeCents) : null};
    })});
    fs.writeFileSync(file,normalize(html),"utf8");
  } finally {await browser.close();}
}
if(require.main===module)update().catch(error=>{console.error(error);process.exitCode=1;});
module.exports=update;
