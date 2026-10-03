const assert = require("node:assert/strict");
const input = require("../weekly-trading-review/equity-inputs.json");
const market = require("../weekly-trading-review/equity-quotes.json");

function calculate(data, quotes = market.quotes) {
  let previous = data.openingCents;
  const seen = new Set();
  return data.periods.map(row => {
    assert.ok(!seen.has(row.folder), "Duplicate equity period: " + row.folder);
    seen.add(row.folder);
    assert.ok(Number.isSafeInteger(previous) && Number.isSafeInteger(row.changeCents));
    const calculatedCents = previous + row.changeCents;
    let holdings = [], marketValueCents = null;
    if(row.snapshot) {
      assert.ok(Number.isSafeInteger(row.snapshot.cashCents));
      holdings = row.snapshot.holdings.map(holding => {
        const quote=quotes.find(quote=>quote.code===holding.code && quote.date===row.snapshot.date);
        assert.ok(quote && quote.adjustment==="none", `Missing unadjusted closing price: ${holding.code} ${row.snapshot.date}`);
        assert.ok(Number.isSafeInteger(holding.qty) && holding.qty>0);
        assert.ok(Number.isSafeInteger(quote.priceMilli) && quote.priceMilli>0);
        return {...holding, quote, valueCents:Math.round(holding.qty*quote.priceMilli/10)};
      });
      marketValueCents=holdings.reduce((sum,holding)=>sum+holding.valueCents,0);
    }
    const endingCents = row.snapshot ? row.snapshot.cashCents+marketValueCents : row.recordedCents;
    // Closed-trade PnL is not the account's change in marked-to-market equity.
    assert.ok(Number.isSafeInteger(endingCents));
    const result = {...row, holdings, marketValueCents, openingCents: previous, calculatedCents, endingCents,
      adjustmentCents: endingCents - calculatedCents,
      status: row.snapshot ? holdings.length ? "valued" : "cash" : row.provisional ? "provisional" : "recorded"};
    previous = endingCents;
    return result;
  });
}

const money = cents => (cents / 100).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
const statusLabel = row => ({valued:"收盘估值", cash:"可见空仓", provisional:"原暂估", recorded:"已录入"})[row.status];
function formula(row) {
  if(!row.snapshot) return `已提供账户期末金额 ${money(row.endingCents)} 元`;
  const parts=row.holdings.map(holding=>{
    const isFund=/^[15]/.test(holding.code);
    const price=(holding.quote.priceMilli/1000).toFixed(isFund?3:2);
    return `${holding.name} ${holding.qty.toLocaleString("en-US")}${isFund?"份":"股"} × ${price} = ${money(holding.valueCents)}`;
  });
  return `截至 ${row.snapshot.date}：现金 ${money(row.snapshot.cashCents)}${parts.length ? "；"+parts.join("；") : "；可见持仓 0.00"}；合计 ${money(row.endingCents)} 元`;
}
module.exports = {input, market, calculate, rows:calculate(input), money, statusLabel, formula};
