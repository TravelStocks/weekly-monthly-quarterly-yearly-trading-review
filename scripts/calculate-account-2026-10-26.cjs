const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=function(root){
 const folder='2026-10-26_2026-10-30',dir=path.join(root,folder),s=require(path.join(dir,'data/statement.json'));
 const round=n=>Math.round(n*100)/100, cents=n=>Math.round(n*100), sources=[];
 function close(code,date){
  const candidates=[`2026-10-19_2026-10-23/data/${code}-5m.json`,`${folder}/data/${code}-5m.json`,`${folder}/data/opportunities/${code}.json`];
  for(const file of candidates){const p=path.join(root,file);if(!fs.existsSync(p))continue;const data=JSON.parse(fs.readFileSync(p,'utf8'));const b=data.bars.find(b=>b.date===date&&b.time==='15:00');if(b){sources.push({code,date,close:b.close,file,source:data.source,retrievedAt:data.retrievedAt});return b.close;}}
  throw Error(`Missing closing quote ${code} ${date}`);
 }
 let cash=cents(s.openingCash);const positions=new Map(s.openingHoldings.map(h=>[h.code,{code:h.code,name:h.name,qty:h.qty}]));
 function value(date){const holdings=[...positions.values()].filter(p=>p.qty).map(p=>({...p,close:close(p.code,date)}));const marketCents=holdings.reduce((a,h)=>a+cents(h.qty*h.close),0);return {date,cash:cash/100,holdings,marketValue:marketCents/100,equity:(cash+marketCents)/100,position:marketCents/(cash+marketCents)*100};}
 const opening=value('2026-10-23'),days=[];let previous=opening.equity;
 for(const date of ['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30']){
  for(const t of s.rows.filter(t=>t.date===date).sort((a,b)=>a.time.localeCompare(b.time))){cash+=cents(t.net);if(t.cash!==null)assert.equal(cash,cents(t.cash));const h=positions.get(t.code)||{code:t.code,name:t.name,qty:0};h.qty+=t.side==='买入'?t.qty:-t.qty;assert(h.qty>=0);positions.set(t.code,h);}
  const v=value(date),pnl=round(v.equity-previous);days.push({...v,pnl,returnPct:pnl/previous*100,status:date>s.coveredThrough?'无新增交易情景估算':'交割与收盘估算'});previous=v.equity;
 }
 const ending=days.at(-1),pnl=round(ending.equity-opening.equity),dailyRateSum=days.reduce((n,d)=>n+d.returnPct,0);
 assert.equal(cents(days.reduce((n,d)=>n+d.pnl,0)),cents(pnl));
 assert(Math.abs((days.reduce((n,d)=>n*(1+d.returnPct/100),1)-1)*100-pnl/opening.equity*100)<1e-8);
 const result={status:'statement-close-estimate',basis:'按已提供完整可见持仓、实际发生金额（含费）及不复权15:00五分钟收盘报价还原。已补10/30实际成交：襄阳卖出600股，大业买入200股；期末现金7896.36元，大业200股按19.52元收盘估值。假设无遗漏持仓或非交易现金变动。非券商确认收益。',opening,days,endingEquity:ending.equity,pnl,weeklyReturnPct:pnl/opening.equity*100,dailyRateSum,averagePosition:days.reduce((n,d)=>n+d.position,0)/days.length,endingPosition:ending.position,through29Pnl:round(days[3].equity-opening.equity),through29ReturnPct:(days[3].equity/opening.equity-1)*100,sources};
 fs.writeFileSync(path.join(dir,'data/account-estimate.json'),JSON.stringify(result,null,2)+'\n');return result;
};
if(require.main===module)console.log(JSON.stringify(module.exports(path.resolve(__dirname,'..')),null,2));
