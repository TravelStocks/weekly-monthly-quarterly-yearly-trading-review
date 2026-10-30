const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../2026-10-26_2026-10-30/data');
const data=require(path.join(dir,'statement.json'));
async function main(){
 const audit=[];
 for(const code of [...new Set(data.rows.filter(t=>t.date>=data.start).map(t=>t.code))]){
  const source=`https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=${code.startsWith('6')?'sh':'sz'}${code}&scale=5&ma=no&datalen=1023`;
  try{
   const r=await fetch(source,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(`HTTP ${r.status}`);
   const raw=await r.json();if(!Array.isArray(raw))throw Error('No price array');
   const bars=raw.map(b=>({dt:b.day,date:b.day.slice(0,10),time:b.day.slice(11,16),open:+b.open,high:+b.high,low:+b.low,close:+b.close,volume:+b.volume})).filter(b=>b.date>=data.start&&b.date<=data.coveredThrough);
   for(const d of ['26','27','28','29'])if(bars.filter(b=>b.date===`2026-10-${d}`).length!==48)throw Error(`${d}: incomplete series`);
   if(!bars.every(b=>[b.open,b.high,b.low,b.close,b.volume].every(Number.isFinite)))throw Error('Invalid price');
   fs.writeFileSync(path.join(dir,`${code}-5m.json`),JSON.stringify({code,source,retrievedAt:new Date().toISOString(),bars},null,2)+'\n');
   audit.push({code,status:'ok',count:bars.length,source});
  }catch(e){audit.push({code,status:'unavailable',error:e.message,source});}
 }
 fs.writeFileSync(path.join(dir,'collection-audit.json'),JSON.stringify(audit,null,2)+'\n');console.log(JSON.stringify(audit));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
