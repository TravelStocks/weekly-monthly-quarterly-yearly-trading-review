const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'../2026-11-16_2026-11-20/data');
const {trades}=require(path.join(dir,'input.json'));
const codes=[...new Set(trades.map(t=>t.code))],dates=['16','17','18','19','20'].map(d=>'2026-11-'+d);
const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
function validate(bars){
 assert(bars.length);assert.equal(new Set(bars.map(b=>b.day)).size,bars.length);
 for(const d of dates.slice(0,4))assert.equal(bars.filter(b=>b.day.startsWith(d)).length,48,d+'缺少完整五分钟行情');
 for(const b of bars)assert(dates.includes(b.day.slice(0,10))&&b.low>0&&b.low<=Math.min(b.open,b.close)&&b.high>=Math.max(b.open,b.close)&&b.volume>=0);
}
async function collect(){
 for(const code of codes){
  const source='https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=sz'+code+'&scale=5&ma=no&datalen=1023';
  const r=await fetch(source,{signal:AbortSignal.timeout(20000)});assert(r.ok);
  const bars=(await r.json()).filter(b=>dates.includes(b.day.slice(0,10))).map(b=>({day:b.day,open:+b.open,high:+b.high,low:+b.low,close:+b.close,volume:+b.volume}));
  validate(bars);fs.writeFileSync(path.join(dir,code+'-5m.json'),JSON.stringify({code,source,fetchedAt:new Date().toISOString(),bars})+'\n');
  console.log(code,bars.length,bars.at(-1).day);
 }
}
function charts(){
 return '<p>真实五分钟OHLC，红涨绿跌。买点圆标、卖点方标；周五成交时间与价格待补，不以截图市价画卖点。周五仅展示已取得行情，不冒充全天。</p><div class="chart-list">'+codes.map(code=>{
  const {source,bars}=JSON.parse(fs.readFileSync(path.join(dir,code+'-5m.json')));validate(bars);
  const ts=trades.filter(t=>t.code===code),prices=bars.flatMap(b=>[b.low,b.high]).concat(ts.map(t=>t.price)),lo=Math.min(...prices),hi=Math.max(...prices);
  const x=i=>52+i*3.52,y=p=>236-196*(p-lo)/(hi-lo||1);
  const grid=[lo,(lo+hi)/2,hi].map(p=>'<path stroke="#dde3ea" d="M50 '+y(p)+'h850"/><text x="4" y="'+y(p)+'">'+p.toFixed(2)+'</text>').join('');
  const labels=dates.map((d,j)=>'<path stroke="#e2e7ed" d="M'+(x(j*48)-2)+' 30v212"/><text x="'+x(j*48+18)+'" y="262">'+d.slice(5)+'</text>').join('');
  const candles=bars.map((b,i)=>{const c=b.close>=b.open?'#bc382b':'#127759';return '<g class="candle" fill="'+c+'" stroke="'+c+'"><title>'+b.day+' 开 '+b.open+' 高 '+b.high+' 低 '+b.low+' 收 '+b.close+'</title><path d="M'+x(i)+' '+y(b.high)+'V'+y(b.low)+'"/><rect stroke="none" x="'+(x(i)-1.2)+'" y="'+Math.min(y(b.open),y(b.close))+'" width="2.4" height="'+Math.max(1,Math.abs(y(b.open)-y(b.close)))+'"/></g>'}).join('');
  const describe=t=>t.date+' '+t.time+' '+t.side+' '+t.qty+'股 × '+t.price.toFixed(2)+'元';
  const markers=ts.map(t=>{
   const end=Math.max(575,Math.ceil((minutes(t.time)+Number(t.time.slice(6))/60)/5)*5);
   const i=bars.findIndex(b=>b.day.startsWith(t.date)&&minutes(b.day.slice(11))===end);assert(i>=0);
   return (t.side==='买入'?'<circle cx="'+x(i)+'" cy="'+y(t.price)+'" r="4" fill="#ad2919"':'<rect x="'+(x(i)-4)+'" y="'+(y(t.price)-4)+'" width="8" height="8" fill="#2354a4"')+' class="fill-marker" stroke="white"><title>'+describe(t)+'</title></'+(t.side==='买入'?'circle':'rect')+'>';
  }).join('');
  return '<article class="chart-card"><h3>'+ts[0].name+' '+code+'</h3><div class="chart-scroll"><svg viewBox="0 0 920 280" role="img" aria-label="'+ts[0].name+'五分钟K线">'+grid+labels+candles+markers+'</svg></div><p>行情截至 '+bars.at(-1).day+' · '+bars.length+' 根 · <a href="data/'+code+'-5m.json">本期原始行情</a> · <a href="'+source.replaceAll('&','&amp;')+'">新浪来源</a></p><ul>'+ts.map(t=>'<li>'+describe(t)+'</li>').join('')+'</ul>'+(code==='002685'?'<p>11-20 已清仓（本人确认），卖点待逐笔交割补齐。</p>':'')+'</article>';
 }).join('')+'</div>';
}
module.exports=charts;
if(require.main===module)collect().catch(e=>{console.error(e);process.exitCode=1});
