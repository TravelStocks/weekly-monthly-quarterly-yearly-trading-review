const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const input = require("../weekly-trading-review/equity-inputs.json");

async function main() {
  const quotes = [];
  for(const row of input.periods.filter(row=>row.snapshot)) {
    for(const holding of row.snapshot.holdings) {
      const date=row.snapshot.date;
      const url=new URL("https://push2his.eastmoney.com/api/qt/stock/kline/get");
      const params={secid:`${/^[56]/.test(holding.code)?1:0}.${holding.code}`,klt:101,fqt:0,
        beg:date.replaceAll("-",""),end:date.replaceAll("-",""),lmt:10,
        fields1:"f1,f2,f3,f4,f5,f6",fields2:"f51,f52,f53,f54,f55,f56"};
      Object.entries(params).forEach(([key,value])=>url.searchParams.set(key,String(value)));
      const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
      assert.ok(response.ok,`Quote HTTP ${response.status}: ${holding.code}`);
      const data=(await response.json()).data;
      assert.equal(data?.code,holding.code);
      const bars=data.klines.map(line=>line.split(","));
      const bar=bars.find(bar=>bar[0]===date);
      assert.ok(bar,`Missing ${date} ${holding.code}`);
      const close=Number(bar[2]);
      assert.ok(Number.isFinite(close)&&close>0);
      const quote={code:holding.code,name:data.name,date,close,priceMilli:Math.round(close*1000),
        adjustment:"none",source:url.href,retrievedAt:new Date().toISOString(),raw:bar};
      quotes.push(quote);
      console.log(`${date} ${holding.code} ${data.name} close=${close}`);
    }
  }
  fs.writeFileSync(path.resolve(__dirname,"../weekly-trading-review/equity-quotes.json"),
    JSON.stringify({source:"东方财富不复权日K收盘价",quotes},null,2)+"\n");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
