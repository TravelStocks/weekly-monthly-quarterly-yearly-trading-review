const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '../research/market-theme-leader-2026');
const rawDir = path.join(root, 'data/raw');
fs.mkdirSync(rawDir, {recursive:true});
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const cases = [
 {id:'lixin', name:'立新能源', code:'001258', theme:'电力', from:'2026-07-14', to:'2026-07-24', observed:'7.20–7.23'},
 {id:'chuanzhi', name:'传智教育', code:'003032', theme:'AI应用', from:'2026-07-24', to:'2026-08-13', observed:'7.29–8.12'},
 {id:'baihua', name:'百花医药', code:'600721', theme:'医药', from:'2026-07-24', to:'2026-08-13', observed:'7.29–8.12'},
 {id:'jinjian', name:'金健米业', code:'600127', theme:'农业', from:'2026-08-14', to:'2026-09-02', observed:'8.25–9.1'},
 {id:'wanxiang', name:'万向德农', code:'600371', theme:'农业', from:'2026-08-14', to:'2026-09-02', observed:'8.25–9.1'},
 {id:'longban', name:'龙版传媒', code:'605577', theme:'文化传媒', from:'2026-08-28', to:'2026-09-09', observed:'9.2–9.8'},
 {id:'mindong', name:'闽东电力', code:'000993', theme:'电力', from:'2026-09-07', to:'2026-09-23', observed:'9.16–9.22'},
 {id:'minfa', name:'闽发铝业', code:'002578', theme:'光伏', from:'2026-10-29', to:'2026-11-11', observed:'11.4–11.10'},
];
const quoteUrl = (secid, interval='101', from='20260601', to='20261120') => 'https://push2his.eastmoney.com/api/qt/stock/kline/get?' + new URLSearchParams({secid,klt:interval,fqt:'0',beg:from,end:to,lmt:'10000',fields1:'f1,f2,f3,f4,f5,f6',fields2:'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61'});
async function quote(code, secid) {
 const file=path.join(rawDir,code+'-daily.json'), source=quoteUrl(secid);
 if(fs.existsSync(file))return JSON.parse(fs.readFileSync(file));
 const command=`[Console]::OutputEncoding=[Text.UTF8Encoding]::new(); $ErrorActionPreference='Stop'; $r=Invoke-RestMethod -Uri '${source}' -TimeoutSec 25; $r | ConvertTo-Json -Depth 30 -Compress`;
 const payload=JSON.parse(cp.execFileSync('powershell.exe',['-NoProfile','-Command',command],{encoding:'utf8',timeout:32000,maxBuffer:12*1024*1024,windowsHide:true}).replace(/^\uFEFF/,''));
 if(payload.data?.code!==code||!payload.data?.klines?.length)throw Error('Quote identity/coverage '+code);
 const result={source,retrievedAt:new Date().toISOString(),adjustment:'none',payload};write(file,result);return result;
}
function post(endpoint,body) {
 const source='https://v.duanxianxia.com/api/'+endpoint;
 const timeout=process.argv[2]==='retry'?12:20;
 const data=Object.entries(body).map(([k,v])=>`'${k}'='${v}'`).join(';');
 const command=`[Console]::OutputEncoding=[Text.UTF8Encoding]::new(); $ErrorActionPreference='Stop'; $r=Invoke-RestMethod -Uri '${source}' -Method Post -Body @{${data}} -UserAgent 'Mozilla/5.0' -TimeoutSec ${timeout}; $r | ConvertTo-Json -Depth 30 -Compress`;
 const output=cp.execFileSync('powershell.exe',['-NoProfile','-Command',command],{encoding:'utf8',timeout:28000,maxBuffer:12*1024*1024,windowsHide:true});
 return {source,request:body,retrievedAt:new Date().toISOString(),payload:JSON.parse(output.replace(/^\uFEFF/,''))};
}
async function main(){
 const mode=process.argv[2]||'all';
 const parserRoot='C:/Users/Administrator/Desktop/Codex/tmp/workbench-refresh-20261030/scripts/';
 const {parseStockBars,parseStrength,parseThemeDetails}=await import(pathToFileURL(parserRoot+'daily-baseline.mjs'));
 const {parseDxxPool}=await import(pathToFileURL(parserRoot+'promotions.mjs'));
 const resultFile=path.join(root,'data/research.json');
 const result=fs.existsSync(resultFile)?JSON.parse(fs.readFileSync(resultFile)):{cases,quotes:{},days:{},errors:[]};
 result.cases=cases;
 if(mode==='all'||mode==='quotes'){
  for(const item of [{code:'000001',secid:'1.000001'},...cases.map(c=>({code:c.code,secid:(c.code.startsWith('6')?'1.':'0.')+c.code}))]){
   try{const r=await quote(item.code,item.secid);result.quotes[item.code]={source:r.source,retrievedAt:r.retrievedAt,adjustment:'none',bars:Object.values(parseStockBars(r.payload,item.code,r.source))};console.log(item.code,result.quotes[item.code].bars.length);}
   catch(e){result.errors.push({part:'quotes',code:item.code,error:e.message});console.log(item.code,e.message);}
   write(resultFile,result);
  }
 }
 if(mode==='all'||mode==='themes'||mode==='retry'){
  const dates=result.quotes['000001'].bars.map(b=>b.date).filter(d=>cases.some(c=>d>=c.from&&d<=c.to));
  if(mode==='retry'){
   const priority=new Set(['2026-07-28','2026-07-29','2026-07-30','2026-08-25','2026-08-26','2026-09-10','2026-11-05','2026-11-06']);
   dates.sort((a,b)=>Number(priority.has(b))-Number(priority.has(a))||a.localeCompare(b));
  }
  for(const date of dates){
   if(mode==='retry'&&result.days[date]?.strength&&result.days[date]?.themes)continue;
   const item={date};
   try{
    const file=path.join(rawDir,date+'-strength.json');
    const r=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):post('getPlateRotatData',{from:'kaipan',days:'1',dates:`${date} - ${date}`});
    write(file,r);item.strength=parseStrength(r.payload,date);item.strengthSource=r.source;item.retrievedAt=r.retrievedAt;
   }catch(e){item.strengthError=e.message;}
   try{
    const file=path.join(rawDir,date+'-themes.json');let r;
    if(fs.existsSync(file))r=JSON.parse(fs.readFileSync(file));
    else{const calendar=post('getFupanDate',{date,type:'choose'});if(calendar.payload.date!==date)throw Error('Calendar date mismatch');r=post('getFupanByYidong',{date,type:'plate'});r.calendar=calendar.payload;write(file,r);}
    item.themes=parseThemeDetails(r.payload,date);item.pool=parseDxxPool(r.payload,date);item.themeSource=r.source;
   }catch(e){item.themeError=e.message;}
   result.days[date]=item;write(resultFile,result);console.log(date,'strength',item.strength?.length||0,'groups',item.themes?.length||0,'pool',item.pool?.stocks?.length||0,item.strengthError||item.themeError||'');
  }
 }
 result.errors=result.errors.filter(e=>e.part!=='quotes'||!result.quotes[e.code]);
 result.updatedAt=new Date().toISOString();write(resultFile,result);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
