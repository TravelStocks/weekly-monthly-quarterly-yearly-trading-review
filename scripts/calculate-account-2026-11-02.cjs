const assert=require('node:assert/strict');
const statement=require('../2026-11-02_2026-11-06/data/trades-partial.json');
const quotes=require('../2026-11-02_2026-11-06/data/closing-quotes.json');
const prior=require('../2026-10-26_2026-10-30/data/account-estimate.json');
const cents=n=>Math.round(n*100);
const opening=prior.days.at(-1);
assert.equal(opening.date,'2026-10-30');
assert.equal(opening.cash,statement.reference.at(-1).cash);
assert.equal(prior.status,'statement-close-estimate');
let cash=cents(opening.cash),previous=cents(opening.equity);
const positions=new Map(opening.holdings.map(h=>[h.code,{code:h.code,name:h.name,qty:h.qty}]));
const days=[];
for(const date of statement.coveredDates){
  for(const t of statement.trades.filter(t=>t.date===date)){
    cash+=cents(t.net);assert.equal(cash,cents(t.cash));
    const h=positions.get(t.code)||{code:t.code,name:t.name,qty:0};
    h.qty+=t.side==='买入'?t.qty:-t.qty;assert(h.qty>=0);positions.set(t.code,h);
  }
  const holdings=[...positions.values()].filter(h=>h.qty).map(h=>{
    const source=quotes.find(q=>q.code===h.code),bar=source?.bars.find(b=>b.date===date);
    assert(bar,`Missing verified close ${h.code} ${date}`);
    return {...h,close:bar.close};
  });
  const market=holdings.reduce((sum,h)=>sum+cents(h.qty*h.close),0),equity=cash+market,pnl=equity-previous;
  days.push({date,cash:cash/100,holdings,marketValue:market/100,equity:equity/100,pnl:pnl/100,returnPct:pnl/previous*100,position:market/equity*100,status:'交割与收盘估算'});
  previous=equity;
}
const ending=days.at(-1),pnl=(cents(ending.equity)-cents(opening.equity))/100;
assert.equal(pnl,-1480.39);
assert.equal(ending.marketValue,0);
assert.equal(days.reduce((s,d)=>s+cents(d.pnl),0),cents(pnl));
assert(Math.abs(days.reduce((s,d)=>s*(1+d.returnPct/100),1)-ending.equity/opening.equity)<1e-10);
module.exports={status:'statement-close-estimate',coveredThrough:statement.weekEnd,opening,days,pnl,returnPct:pnl/opening.equity*100,endingEquity:ending.equity,averagePosition:days.reduce((s,d)=>s+d.position,0)/days.length,endingPosition:ending.position,weeklyReturnPct:pnl/opening.equity*100,fridayPositionPct:0,basis:'按10/30实际成交及大业收盘价19.52元还原期初权益11,800.36元；逐日使用实际发生金额与不复权收盘价估值，假设无遗漏持仓或非交易出入金。11/5卖出文投后全部清仓；周五无成交、空仓，按无额外出入金延续前日现金。',sources:quotes};
