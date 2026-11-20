const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const dir=path.join(__dirname,'../2026-11-09_2026-11-13/data');
const trades=[...require(path.join(dir,'trades-partial.json')).trades,...require(path.join(dir,'friday-trades.json')).trades];
const codes=[...new Set(trades.map(t=>t.code))];
const dates=['09','10','11','12','13'].map(d=>'2026-11-'+d);
const file=c=>path.join(dir,c+'-5m.json');
const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
function validate(bars){
 const ends=Array.from({length:48},(_,i)=>(i<24?570:780)+(i%24+1)*5);
 assert.equal(bars.length,240);
 for(const d of dates) assert.deepEqual(bars.filter(b=>b.day.startsWith(d)).map(b=>minutes(b.day.slice(11))),ends);
 for(const b of bars) assert(b.low>0 && b.low<=Math.min(b.open,b.close) && b.high>=Math.max(b.open,b.close) && Number.isFinite(b.high) && b.volume>=0);
}
async function collect(){
 for(const code of codes){
  const source='https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol='+(code.startsWith('6')?'sh':'sz')+code+'&scale=5&ma=no&datalen=1023';
  const r=await fetch(source,{signal:AbortSignal.timeout(20000)});assert(r.ok);
  const bars=(await r.json()).filter(b=>dates.includes(b.day.slice(0,10))).map(b=>({day:b.day,open:+b.open,high:+b.high,low:+b.low,close:+b.close,volume:+b.volume}));
  validate(bars);fs.writeFileSync(file(code),JSON.stringify({code,source,bars})+'\n');console.log(code,bars.length);
 }
}
function charts(snapshot){
 return '<p>红涨绿跌；圆点为实际买入，方点为实际卖出。盘中成交按时间归入对应五分钟区间，纵向位置为交割价。竞价成交单列；周五四笔卖单已补入对应买卖点。</p><div class="chart-list">'+codes.map(code=>{
  const {source,bars}=JSON.parse(fs.readFileSync(file(code)));validate(bars);
  const ts=trades.filter(t=>t.code===code),name=ts[0].name;
  const prices=bars.flatMap(b=>[b.low,b.high]).concat(ts.map(t=>t.price)),lo=Math.min(...prices),hi=Math.max(...prices);
  const x=i=>52+i*3.52,y=p=>236-196*(p-lo)/(hi-lo||1);
  const grid=[lo,(lo+hi)/2,hi].map(p=>'<path stroke="#dde3ea" d="M50 '+y(p)+'h850"/><text x="4" y="'+y(p)+'">'+p.toFixed(2)+'</text>').join('');
  const labels=dates.map((d,j)=>'<path stroke="#e2e7ed" d="M'+(x(j*48)-2)+' 30v212"/><text x="'+x(j*48+18)+'" y="262">'+d.slice(5)+'</text>').join('');
  const candles=bars.map((b,i)=>{const c=b.close>=b.open?'#bc382b':'#127759';return '<g class="candle" fill="'+c+'" stroke="'+c+'"><title>'+b.day+' 开 '+b.open+' 高 '+b.high+' 低 '+b.low+' 收 '+b.close+'</title><path d="M'+x(i)+' '+y(b.high)+'V'+y(b.low)+'"/><rect stroke="none" x="'+(x(i)-1.2)+'" y="'+Math.min(y(b.open),y(b.close))+'" width="2.4" height="'+Math.max(1,Math.abs(y(b.open)-y(b.close)))+'"/></g>'}).join('');
  const describe=t=>t.date.slice(5)+' '+t.time+' '+t.side+' '+t.qty+'股 × '+t.price.toFixed(2)+'元';
  const markers=ts.filter(t=>t.time>='09:30:00').map(t=>{
   const end=Math.ceil((minutes(t.time)+Number(t.time.slice(6))/60)/5)*5;
   const i=bars.findIndex(b=>b.day.startsWith(t.date)&&minutes(b.day.slice(11))===Math.max(575,end));assert(i>=0);
   const pos=t.side==='买入'?'<circle fill="#ad2919" cx="'+x(i)+'" cy="'+y(t.price)+'" r="4"':'<rect fill="#2354a4" x="'+(x(i)-4)+'" y="'+(y(t.price)-4)+'" width="8" height="8"';
   return pos+' class="fill-marker" stroke="white"><title>'+describe(t)+'</title></'+(t.side==='买入'?'circle':'rect')+'>';
  }).join('');
  return '<article class="chart-card"><h3>'+name+' '+code+'</h3><div class="chart-scroll"><svg viewBox="0 0 920 280" role="img" aria-label="'+name+'五分钟K线与成交点">'+grid+labels+candles+markers+'</svg></div><p><a href="'+source.replaceAll('&','&amp;')+'">新浪五分钟行情</a> · <a href="data/'+code+'-5m.json">本周240根原始行情</a></p><ul>'+ts.map(t=>'<li>'+describe(t)+(t.time<'09:30:00'?'（集合竞价，不并入盘中K线）':'')+'</li>').join('')+'</ul>'+(Object.hasOwn(snapshot.clearedPnl,code)?'<p>11-13 已卖清；时间和成交价已核实。</p>':'')+'</article>';
 }).join('')+'</div>';
}
module.exports=charts;
if(require.main===module)collect().catch(e=>{console.error(e);process.exitCode=1});
