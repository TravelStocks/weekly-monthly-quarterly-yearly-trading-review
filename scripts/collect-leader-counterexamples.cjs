const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../research/market-theme-leader-2026');
const raw=require(path.join(root,'data/research.json'));
const workbench=require('C:/Users/Administrator/Desktop/Codex/tmp/workbench-refresh-20261030/docs/data/market-context.json');
const out=path.join(root,'data/counterexamples.json');
const cache=fs.existsSync(out)?JSON.parse(fs.readFileSync(out,'utf8')):{quotes:{}};
const date='2026-11-06',previous='2026-11-05';
const cohort=raw.days[previous].pool.stocks;
const byCode=new Map(cohort.map(s=>[s.code,s]));
for(const code of ['603278','600838','600892'])if(!byCode.has(code))byCode.set(code,{code,name:({'603278':'大业股份','600838':'上海九百','600892':'大晟文化'})[code],role:'此前情绪锚补充，不纳入昨日涨停池'});
function fetchQuote(code){
 const symbol=(code.startsWith('6')?'sh':'sz')+code;
 const source='https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param='+symbol+',day,2026-11-05,2026-11-06,10,';
 const cmd="[Console]::OutputEncoding=[Text.UTF8Encoding]::new(); $ErrorActionPreference='Stop'; Invoke-RestMethod -Uri '"+source+"' -TimeoutSec 18 | ConvertTo-Json -Depth 30 -Compress";
 const payload=JSON.parse(cp.execFileSync('powershell.exe',['-NoProfile','-Command',cmd],{encoding:'utf8',timeout:25000,maxBuffer:3000000,windowsHide:true}).replace(/^\uFEFF/,''));
 const bars=payload.data?.[symbol]?.day;
 const b=bars?.find(b=>b[0]===date),p=bars?.find(b=>b[0]===previous);if(!b||!p)throw Error('Missing exact dates '+code);
 return {date,previousDate:previous,code,open:+b[1],close:+b[2],high:+b[3],low:+b[4],reference:+p[2],source,retrievedAt:new Date().toISOString(),payload};
}
for(const [code,s]of byCode){
 if(cache.quotes[code])continue;
 const archived=workbench.promotionFeedbackQuotes[date+':'+code];
 try{cache.quotes[code]=archived?{...archived,archiveUpdatedAt:workbench.updatedAt,provenance:'既有工作台按指定日归档的腾讯日K'}:fetchQuote(code);console.log(code,s.name,'OK');}
 catch(e){console.log(code,e.message);}
 fs.writeFileSync(out,JSON.stringify(cache,null,2)+'\n');
}
const rows=cohort.map(s=>{const q=cache.quotes[s.code];return {...s,quote:q?{...q,payload:undefined}:null,openPct:q?(q.open/q.reference-1)*100:null,closePct:q?(q.close/q.reference-1)*100:null};});
function stats(a){const known=a.filter(s=>s.openPct!==null),v=known.map(s=>s.openPct).sort((a,b)=>a-b);return {total:a.length,known:v.length,positive:v.filter(x=>x>0.01).length,negative:v.filter(x=>x<-.01).length,flat:v.filter(x=>Math.abs(x)<=.01).length,belowMinus5:v.filter(x=>x<=-5).length,mean:v.reduce((a,b)=>a+b,0)/v.length,median:v.length?(v[Math.floor((v.length-1)/2)]+v[Math.ceil((v.length-1)/2)])/2:null};}
const solar=raw.days[previous].themes.find(g=>g.name==='光伏').stocks.filter(s=>/^[036]/.test(s.code)).map(s=>rows.find(r=>r.code===s.code));
assert(solar.every(Boolean));
cache.date=date;cache.previous=previous;cache.generatedAt=new Date().toISOString();cache.cohort=rows;
cache.opening={all:stats(rows),first:stats(rows.filter(s=>s.boards===1)),second:stats(rows.filter(s=>s.boards===2)),high:stats(rows.filter(s=>s.boards>=3)),solar:stats(solar)};
cache.solar=solar;cache.riskDays={};
for(const d of [previous,date]){const r=workbench.marketRiskDays[d];cache.riskDays[d]={provider:r.provider,sources:r.sources,limitUpCount:r.limitUpCount,brokenCount:r.brokenCount,brokenRate:r.brokenRate,limitDownCount:r.limitDownCount};}
cache.cohortPromotion={total:cohort.length,success:cohort.filter(s=>raw.days[date].pool.stocks.some(t=>t.code===s.code&&t.boards===s.boards+1)).length};
fs.writeFileSync(out,JSON.stringify(cache,null,2)+'\n');
console.log(JSON.stringify(cache.opening,null,2));
if(rows.some(r=>!r.quote))process.exitCode=2;
