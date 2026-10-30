const fs=require('fs'),path=require('path');
const dir=path.resolve(__dirname,'../2026-10-26_2026-10-30/data/opportunities');fs.mkdirSync(dir,{recursive:true});
(async()=>{for(const code of ['600241','002242','603278','000678']){
 const source=`https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=${code[0]==='6'?'sh':'sz'}${code}&scale=5&ma=no&datalen=1023`;
 const r=await fetch(source,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(r.status);const raw=await r.json();
 const bars=raw.map(b=>({dt:b.day,date:b.day.slice(0,10),time:b.day.slice(11,16),open:+b.open,high:+b.high,low:+b.low,close:+b.close,volume:+b.volume})).filter(b=>b.date>='2026-10-08'&&b.date<='2026-10-30');
 fs.writeFileSync(path.join(dir,code+'.json'),JSON.stringify({code,source,retrievedAt:new Date().toISOString(),bars},null,2)+'\n');
 for(const date of ({'600241':['2026-10-08','2026-10-09','2026-10-12'],'002242':['2026-10-19','2026-10-20','2026-10-21'],'603278':['2026-10-23','2026-10-26','2026-10-29','2026-10-30'],'000678':['2026-10-27','2026-10-28','2026-10-29']})[code]){
 const ds=bars.filter(b=>b.date===date),prev=bars.filter(b=>b.date<date).at(-1)?.close;
 console.log(JSON.stringify({code,date,prev,first:ds[0],zero:ds.find(b=>b.close>prev),firstHigh:ds.find(b=>b.high===Math.max(...ds.map(b=>b.high))),last:ds.at(-1)}));
 }
}})().catch(e=>{console.error(e);process.exitCode=1;});
