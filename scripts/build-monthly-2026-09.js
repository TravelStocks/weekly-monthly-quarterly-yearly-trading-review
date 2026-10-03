const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'monthly-quarterly-trading-review/2026-09');
const dataDir = path.join(out, 'data');
const source = JSON.parse(fs.readFileSync(path.join(dataDir, 'statement-source.json'), 'utf8'));
const daily = JSON.parse(fs.readFileSync(path.join(dataDir, 'daily-reviews.json'), 'utf8')).reviews;
const cents = n => Math.round(n * 100);
const iso = d => `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6)}`;
const h = v => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const money = n => (n / 100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
const signed = n => `${n > 0 ? '+' : ''}${money(n)}`;
const tone = n => n >= 0 ? 'profit' : 'loss';
const readJson = file => JSON.parse(fs.readFileSync(file,'utf8'));
const rows = source.rows.map(values => {
  const row = Object.fromEntries(source.columns.map((key,i) => [key,values[i]]));
  row.amount = Number((row.qty * row.price).toFixed(3));
  row.fee = 5;
  row.side = row.sideType === 'buy' ? '买入' : '卖出';
  if ((row.code === '002403' && row.date === '20260909') || (row.code === '588170' && row.date === '20260921' && row.time === '09:35:53')) {
    row.rawSide = '对方卖出'; row.inferredSide = true;
  }
  row.otherFee = Number((Math.abs(row.net - (row.sideType === 'buy' ? -row.amount : row.amount)) - row.fee - row.tax).toFixed(3));
  return row;
}).sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));

assert.equal(rows.length,86,'Screenshot overlap must not duplicate trades');
assert.equal(new Set(rows.map(r=>r.date+r.time+r.code+r.sideType+r.qty)).size,86);
assert.equal(rows.reduce((n,r)=>n+r.qty,0),35000);
assert.equal(rows.reduce((n,r)=>n+cents(r.amount),0),24517180);
assert.equal(rows.reduce((n,r)=>n+cents(r.net),0),179850);

const notes = {
  '600721': {model:'非模式', tags:['亏损后加单','负贡献'], label:'可避免', type:'二波试错 / 次日加仓', lesson:'最大亏损不是没有找到有名气的票，而是把老龙身份当作二波续强的保证。8/27买400股、8/28再买100股，8/31在13.90全部退出，损失1,283.64元。', plan:'8月反思确认：二波首板可试，次日必须续强；不续强撤，走弱不加仓。', action:'先确认二波续强和板块支撑；失败时退出，禁止用加仓修复弱势。', basis:'8月战法手册 + 本期交割', copy:null},
  '002403': {model:'非模式', tags:['非第一','买点复盘','负贡献'], label:'可避免', type:'回封打板', lesson:'9/8两笔买入600股，9/9亏损582.81元退出。9/9日记明确承认弱走未第一时间卖、未执行-3%条件单。', plan:'9/8日记：先处理旧仓，再比较题材、主动性、量能与后排反馈。', action:'后排弱、人气不足时降低预期；弱走触发既定退出，先核对-3%参照价。', basis:'9/8–9/9周度正文与KISS', copy:null},
  '600551': {model:'需复核', tags:['负贡献','需查第一性'], label:'不确定', type:'早盘接力试错（待确认）', lesson:'9/2 09:30:59买600股，次日09:36:41卖出，含费亏576.63元。买入逻辑和当时核心排序缺原文，不能只凭亏损判为非模式。', plan:'暂无预案记录。', action:'补齐买前题材、地位、回封和失效条件，再判断是否属于正常模式失败。', basis:'交割截图 / 08.31–09.04周度', copy:null},
  '000892': {model:'需复核', tags:['负贡献','买点复盘'], label:'不确定', type:'反包试错（逻辑待确认）', lesson:'时代出版退出当日又买入欢瑞900股，次日亏476.34元。9/4反思强调个股反包不能代替题材主升，缺少后排带动就降预期。', plan:'暂无买入前预案记录；9/4补记要求反包看板块带动。', action:'传媒连续亏损后重新检验题材回流和退出条件，不把另一只反包票视为自动修复。', basis:'交割 + 9/4日度反思', copy:null},
  '002412': {model:'模式内', tags:['核心处理','值得复制','正贡献'], label:'值得复制', type:'高标试仓 / 确认加仓 / 分批兑现', lesson:'8/25先买300股，8/26在13.56再买600股，8/27三笔卖完900股，净赚597.77元。前期仓位提供利润垫，再次确认后的处理是正样本。', plan:'8月战法手册：跨过关键身位、验证量能和唯一性；断板后切向更强。', action:'保留先手和确认后加仓，退出之后继续比较同批更强高标。', basis:'交割 + 8月战法手册（日期已按交割校正）', copy:['触发：关键身位、题材和量能共同确认','买点：先手小仓，续强确认后增加','卖点：900股分批兑现，不靠猜最高点','失效：断板、板块不跟或更强同批胜出']},
  '603230': {model:'模式内', tags:['核心处理','值得复制','正贡献'], label:'值得复制', type:'题材确认介入 / 三组条件单退出', lesson:'9/21买200股，9/22追加400股，9/23三笔各卖200股，净赚380.86元。日记认可梯队、扩散与承接判断，并明确三组条件单退出。', plan:'9/22–9/23：监管、前排、自身量价三层验证；两层同时转弱减仓或退出。', action:'复制分批条件单退出；重仓前把监管空间、最大亏损和退出价数字化。', basis:'9/22–9/23日度原文', copy:['触发：题材梯队、扩散、主动承接共振','买点：先确认环境与个股量能，受预算约束','卖点：预设三组条件单，分批兑现','失效：监管空间不足或三层验证中两层转弱']},
  '600865': {model:'模式内', tags:['核心龙头','正贡献','值得复制'], label:'值得复制', type:'唯一高标回封 / 次日兑现', lesson:'9/9三笔买600股，次日两笔兑现，净赚69.22元。日记确认反卡亚盛后唯一5板成立；定龙正确不意味着可以忽略败方负反馈。', plan:'9/9：先处理百大，观察亚盛地板检验，败方封死跌停则降低预期。', action:'保持唯一性确认，竞品负反馈出现时同步降预期。', basis:'9/9周度与日度反思', copy:['触发：同身位PK胜出，唯一性确认','买点：量能与换手回封确认','卖点：结合败方和板块负反馈兑现','失效：核心地位或板块回流失效']},
  '000978': {model:'需复核', tags:['止损后回补','买点过急','负贡献'], label:'可避免（回补行为）', type:'尾盘试错 / 清仓后追回', lesson:'9/11旧500股亏23.42元卖完，6分43秒后在10.66买回，累计买1,000股，现金只剩11.22元；9/14新仓又亏52.30元。总亏不大，行为伤害很大。', plan:'9/10–9/11暂无预案记录；9/14日记肯定条件单保护，同时认为板上兑现更优。', action:'清仓后重新开仓必须重新写确认和最大损失，不能因为追回而把原500股放大到1,000股。', basis:'完整交割 + 9/14反思', copy:null},
  '601086': {model:'模式内', tags:['轻仓套利','负贡献'], label:'可避免（退出拖延）', type:'小仓低吸 / 次日退出', lesson:'9/14小仓100股、次日亏147.85元。9/15本人明确指出没设动态条件单、跌停板被动处理；小仓没有免除退出纪律。', plan:'9/14：退潮期看板块回流，总仓仍克制。', action:'按当日模型设置失效条件，小仓也必须具备可执行的退出。', basis:'9/14–9/15日度反思', copy:null},
  '000993': {model:'模式内', tags:['核心龙头','小亏闭环'], label:'不确定', type:'唯一高标打板 / 持仓保护', lesson:'9/15买300股，9/17全部卖出，含费亏58.49元。9/16日记肯定条件单与持仓稳定；9/30新买100股另列持仓，按要求不计浮盈浮亏。', plan:'9/15：缩量转强并带板块则持有，走弱不能回封或后排大负反馈退出。', action:'保留地位、承接和条件单组合；补入9/17卖出原因后评价最终退出。', basis:'9/15–9/16日度 + 本人期末确认', copy:null},
  '000504': {model:'模式内', tags:['轻仓套利','小亏闭环'], label:'模式内正常亏损（暂定）', type:'均线附近分批试仓 / 弱走停买', lesson:'9/23两笔各100股，9/28卖完，亏50.27元。9/23反思认可退潮两成多仓位与走弱停买，但板块支撑判断仍偏乐观。', plan:'9/23：先处理旧仓，无板上确认就空仓；最大亏损尚未量化。', action:'继续弱走停买；把最大亏损、退出价和回流验证写成数字。', basis:'9/23–9/24日度反思', copy:null},
  '600127': {model:'模式内', tags:['核心处理','买点复盘'], label:'可避免部分 + 模式内损益', type:'农业核心试错 / 尾盘套利', lesson:'8/20–8/21第一轮亏176.10元，8/31–9/1第二轮赚156.03元，合计仍亏20.07元。不能拿后一轮盈利覆盖前一轮条件单问题。', plan:'8月反思：题材最强有逻辑，5板题材走弱时前置退出。', action:'分轮审判；核心选择与风险处理分别打分。', basis:'交割 + 8月战法手册', copy:null},
  '000735': {model:'模式内', tags:['轻仓套利','小亏闭环'], label:'模式内正常亏损', type:'一成仓试错 / 次日退出', lesson:'猪肉分支回流失败及时卖出；日记称平出，含费实为-4.68元。', plan:'9/7：持仓去留服从猪肉分支强度。', action:'保留小仓试错、失败即走，把交易费用计入结果。', basis:'9/7–9/8周度与日度', copy:null},
  '000936': {model:'非模式', tags:['非唯一','负贡献'], label:'不确定', type:'科技回流低吸 / 期初仓退出', lesson:'8/14的800股成本5,605.00，8/17卖出回款5,264.36，历史成本闭环亏340.64元。买入不属于本期，不能全部当成本期新开仓损失。', plan:'08.10–08.15周度指出买入过急、非唯一核心，等处理确认。', action:'保留退出动作；先确认科技主线核心，再讨论低吸仓位。', basis:'前期周度交割 + 本期卖出', copy:null},
  '603758': {model:'需复核', tags:['小额正贡献','需查第一性'], label:'不确定', type:'期初仓兑现', lesson:'8/11买入100股成本1,273.01，8/17回款1,337.32，历史成本闭环+64.31元；买入逻辑仍缺完整预案。', plan:'暂无预案记录。', action:'仅确认盈亏，待补当时核心地位与交易逻辑后评价可复制性。', basis:'前期周度 + 本期交割', copy:null},
  '588170': {model:'需复核', tags:['轻仓套利','止损后回补','买点复盘'], label:'不确定', type:'科技ETF多轮试错', lesson:'四轮合计-19.00元。9/21亏10元卖出200份后，当日再买1,400份，自动标记亏损后回补；9/22该轮盈利卖出后再买500份另标待核，不能直接认定为止损违规。', plan:'9/22：观察仓，盘中下跌不机械加仓；科技只做低开承接。', action:'复用工具选择和不机械补仓；500份、300份等小额单的最低佣金会明显消耗价差。', basis:'交割 + 9/22反思', copy:null},
  '159516': {model:'需复核', tags:['轻仓套利','小亏闭环'], label:'不确定', type:'科技ETF尾盘买入 / 次日卖出', lesson:'价格从0.738升至0.740，毛价差+6.20元，但双边最低佣金10元后亏3.80元。方向对不等于净收益为正。', plan:'暂无预案记录。', action:'开仓前核算成本后盈亏比，不为极小价差制造费用。', basis:'交割计算', copy:null},
  '002081': {model:'需复核', tags:['小额正贡献','需查第一性'], label:'不确定', type:'分批买入 / 次日兑现', lesson:'两笔各200股买入、次日400股卖出，净赚5.83元；规模较小，不能据此推定为可复制龙头模型。', plan:'暂无预案记录。', action:'补齐入场逻辑与第一性证据。', basis:'交割计算', copy:null},
  '002584': {model:'需复核', tags:['负贡献','买点复盘'], label:'不确定', type:'分批试仓 / 跨日退出', lesson:'9/17在10.51买400股、9/18在9.80买600股，9/21卖完亏343.88元。成交呈降价增量，是否属于预设低吸还是弱势加仓仍待本人说明。', plan:'暂无预案记录。', action:'补入9/18加600股的预设条件；未证实前不把分批低吸与亏损加单混为一谈。', basis:'交割事实', copy:null},
  '600664': {model:'需复核', tags:['负贡献','需验证核心地位'], label:'不确定', type:'两轮轻仓试错', lesson:'8/21–8/24亏9.43元，9/24–9/28亏100.39元，共亏109.82元。7月做对哈药不代表本次周期自动属于模式内。', plan:'暂无两次开仓的完整预案记录。', action:'每轮重新证明第一性、周期和退出标准。', basis:'交割计算', copy:null},
  '600378': {model:'需复核', tags:['负贡献','买点复盘'], label:'不确定', type:'科技个股试仓', lesson:'8/28在53.31买100股，8/31在51.87卖出，亏156.69元。仅凭交割无法确认是低吸、追高还是板上确认。', plan:'暂无预案记录。', action:'用当日科技节奏核验买点，无法判断个股时再比较ETF工具。', basis:'交割事实', copy:null},
  '600354': {model:'需复核', tags:['轻仓套利','小亏闭环'], label:'不确定', type:'午后试错 / 次日退出', lesson:'8/31买100股、9/1卖出，亏68.44元；农业核心比较和具体买点需补。', plan:'暂无预案记录。', action:'农业分支先比较唯一核心，再决定是否试错。', basis:'交割 / 08.31–09.04周度', copy:null},
  '600313': {model:'需复核', tags:['负贡献','需查第一性'], label:'不确定', type:'农业试错 / 次日退出', lesson:'8/19买100股、8/20卖出，亏70.35元。不能把农业方向正确等同于个股第一性正确。', plan:'暂无预案记录。', action:'补齐与同题材核心的比较证据。', basis:'交割事实', copy:null},
  '002238': {model:'需复核', tags:['负贡献','买点复盘'], label:'不确定', type:'午后试错 / 跨假期退出', lesson:'9/24 13:49买100股、9/28早盘退出，亏94.38元。退潮期仓位虽小，仍需要写清午后买入触发。', plan:'9/24整体纪律：停止错误仓位补仓和尾盘题材追涨；本票具体触发待补。', action:'把个股预案与当天退潮环境对照，判断是否违反已经写下的纪律。', basis:'交割 + 9/24整体反思', copy:null},
};

const stocks = [...new Set(rows.map(r=>r.code))].map(code=>({
  code,name:rows.find(r=>r.code===code).name,rows:rows.filter(r=>r.code===code),
  qty:0,cost:0,realized:0,rounds:[],round:null,opening:source.openingLots.find(x=>x.code===code),...notes[code],
}));
const byCode = Object.fromEntries(stocks.map(s=>[s.code,s]));
for(const lot of source.openingLots) {
  const s=byCode[lot.code]; s.qty=lot.qty;s.cost=cents(lot.cost);
  s.round={start:'期初持仓',cost:s.cost,pnl:0,old:true};
}
const snapshots=[];
const realizedByDate={};
let cash=cents(6636.02),maxHeld=0;
for(let i=0;i<rows.length;i++) {
  const r=rows[i],s=byCode[r.code];
  cash+=cents(r.net);
  if(r.sideType==='buy') {
    if(s.qty===0) s.round={start:iso(r.date),cost:0,pnl:0,old:false};
    s.qty+=r.qty;s.cost+=-cents(r.net);s.round.cost+=-cents(r.net);
  } else {
    assert(s.qty>=r.qty,`Unmatched sell ${r.code} ${r.date}`);
    const allocated=r.qty===s.qty?s.cost:Math.round(s.cost*r.qty/s.qty);
    r.realized=cents(r.net)-allocated;s.realized+=r.realized;s.round.pnl+=r.realized;
    realizedByDate[r.date]=(realizedByDate[r.date]||0)+r.realized;
    s.qty-=r.qty;s.cost-=allocated;
    if(s.qty===0) {r.roundRealized=s.round.pnl;s.rounds.push({...s.round,end:iso(r.date)});s.round=null;}
  }
  maxHeld=Math.max(maxHeld,stocks.filter(s=>s.qty>0).length);
  if(i===rows.length-1||rows[i+1].date!==r.date) {
    const cost=stocks.reduce((n,s)=>n+s.cost,0);
    const observed=cents(r.cash);
    snapshots.push({date:iso(r.date),held:stocks.filter(s=>s.qty>0).length,cost,cash:observed,costUsage:cost/(observed+cost)*100,realized:realizedByDate[r.date]||0});
  }
}
assert.equal(byCode['000993'].qty,100);
assert.equal(byCode['000993'].cost,171400);
assert(stocks.filter(s=>s.code!=='000993').every(s=>s.qty===0));
const totalPnl=stocks.reduce((n,s)=>n+s.realized,0);
assert.equal(totalPnl,-336551);
const oldPnl=stocks.filter(s=>s.opening).reduce((n,s)=>n+s.realized,0);
const totalFees=rows.reduce((n,r)=>n+cents(r.fee+r.tax+r.otherFee),0);
const profit=stocks.filter(s=>s.realized>0).sort((a,b)=>b.realized-a.realized);
const loss=stocks.filter(s=>s.realized<0).sort((a,b)=>a.realized-b.realized);
const grossProfit=profit.reduce((n,s)=>n+s.realized,0);
const grossLoss=-loss.reduce((n,s)=>n+s.realized,0);
const sessions=readJson(path.join(dataDir,'000993-5m.json')).bars.map(b=>b.date);
const dates=[...new Set(sessions)].sort();
const reentries=[];
for(const s of stocks) {
  let sale;
  for(const r of s.rows) {
    if(r.sideType==='sell') sale=r;
    else if(sale) {
      const diff=dates.indexOf(iso(r.date))-dates.indexOf(iso(sale.date));
      if(diff===0||diff===1) {
        reentries.push({code:s.code,name:s.name,sell:iso(sale.date)+' '+sale.time,buy:iso(r.date)+' '+r.time,
          precedingRealized:sale.roundRealized??sale.realized, confirmedLoss:(sale.roundRealized??sale.realized)<0});
        sale=null;
      }
    }
  }
}
const rounds=stocks.flatMap(s=>s.rounds.map(r=>({...r,code:s.code,name:s.name})));
const models=['模式内','非模式','需复核'].map(label=>({label,count:stocks.filter(s=>s.model===label).length}));
const important=new Set([...profit.slice(0,2),...loss.slice(0,3)].map(s=>s.code));
const fullSummary={range:source.range,buildDate:'2026-10-03',trades:rows.length,stocks:stocks.length,
  closedRealized:totalPnl/100,newPositionRealized:(totalPnl-oldPnl)/100,openingPositionRealized:oldPnl/100,
  allTradeFees:totalFees/100,grossProfit:grossProfit/100,grossLoss:grossLoss/100,
  rankingBasis:'含费历史成本闭环；闽东电力期末100股浮盈浮亏按用户要求排除。跨期持仓闭环不等于本期资产贡献。',
  accountReturn:null,accountMaxDrawdown:null,accountPnl:null,
  cashReconciliationDifference:(cents(rows.at(-1).cash)-cash)/100,
  maxConcurrentHoldings:maxHeld,models,reentries,snapshots,
  stocks:stocks.map(s=>({code:s.code,name:s.name,realized:s.realized/100,openQty:s.qty,openCost:s.cost/100,
    openingQty:s.opening?.qty||0,model:s.model,tags:s.tags,classification:s.label,rounds:s.rounds.map(r=>({...r,cost:r.cost/100,pnl:r.pnl/100}))})),
  pendingReflectionQuestions:source.pendingReflectionQuestions,
};
fs.writeFileSync(path.join(dataDir,'summary.json'),JSON.stringify(fullSummary,null,2)+'\n');
fs.writeFileSync(path.join(dataDir,'trades.json'),JSON.stringify(rows,null,2)+'\n');
const csvCols=['date','time','code','name','side','qty','price','amount','fee','tax','otherFee','net'];
fs.writeFileSync(path.join(dataDir,'trades.csv'),'\uFEFF'+['成交日期,成交时间,证券代码,证券名称,操作,数量,成交价,成交额,手续费,印花税,其他费用,发生金额',...rows.map(r=>csvCols.map(k=>k==='code'?`="${r[k]}"`:r[k]).join(','))].join('\r\n'));

function table(headers,body,className='') {
  return `<div class="table-scroll"><table class="${className}"><thead><tr>${headers.map(x=>`<th scope="col">${h(x)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}
const cells=items=>'<tr>'+items.map(x=>'<td>'+x+'</td>').join('')+'</tr>';
const tags=s=>s.tags.map(t=>`<span class="tag">${h(t)}</span>`).join('');
function ranking(list) {
  return table(['标的 / 排名','已实现净额','归类 / 标签','月度判断'],list.map((s,i)=>cells([
    `<a href="#stock-${s.code}"><strong>${i+1}. ${h(s.name)}</strong></a><small>${s.code}${s.opening?' · 期初仓':''}</small>`,
    `<strong class="${tone(s.realized)} numeric">${signed(s.realized)}</strong><small>${s.rounds.length}轮闭环${s.qty?' · 期末仓排除':''}</small>`,
    `<b>${h(s.label)}</b><div class="tags">${tags(s)}</div>`,h(s.lesson),
  ])).join(''),'ranking');
}
const displayPrice = (n,code) => n.toFixed(code==='588170'||code==='159516'?3:2);
const charts=[];
function chart(s,date,bars,trades) {
  assert.equal(bars.length,48,`Expected full intraday session ${s.code} ${date}`);
  const W=980,H=320,L=66,R=26,T=42,B=46;
  const values=[...bars.flatMap(b=>[b.high,b.low]),...trades.map(r=>r.price)];
  const min=Math.min(...values),max=Math.max(...values),pad=Math.max((max-min)*.12,max*.006);
  const low=min-pad,high=max+pad;
  const x=i=>L+(i+.5)*(W-L-R)/48, y=p=>T+(high-p)/(high-low)*(H-T-B);
  const grid=Array.from({length:5},(_,i)=>{
    const p=low+(high-low)*i/4;
    return `<line x1="${L}" x2="${W-R}" y1="${y(p)}" y2="${y(p)}" stroke="#e3e7ec"/><text x="${L-10}" y="${y(p)+4}" text-anchor="end" class="axis">${displayPrice(p,s.code)}</text>`;
  }).join('');
  const candles=bars.map((b,i)=>{
    const color=b.close>=b.open?'#c2412d':'#14845f';
    return `<g class="candle"><title>${h(b.dt)} 开${b.open} 高${b.high} 低${b.low} 收${b.close}</title><line x1="${x(i)}" x2="${x(i)}" y1="${y(b.high)}" y2="${y(b.low)}" stroke="${color}"/><rect x="${x(i)-4}" y="${Math.min(y(b.open),y(b.close))}" width="8" height="${Math.max(1,Math.abs(y(b.open)-y(b.close)))}" fill="${color}"/></g>`;
  }).join('');
  const line=bars.map((b,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(b.close).toFixed(1)}`).join(' ');
  const axis=[0,11,23,35,47].map(i=>`<text x="${x(i)}" y="${H-16}" text-anchor="middle" class="axis">${bars[i].time}</text>`).join('');
  const labels=[];
  const markers=trades.map(r=>{
    // A five-minute bar is labelled by interval end; transaction seconds remain in the ledger.
    const i=bars.findIndex(b=>`${b.time}:00`>=r.time);
    assert(i>=0,`No trade bar ${s.code} ${date} ${r.time}`);
    const bar=bars[i];
    assert(r.price>=bar.low-.011&&r.price<=bar.high+.011,`Trade price outside bar ${s.code} ${date} ${r.time}: ${r.price}, range ${bar.low}-${bar.high}`);
    const px=x(i),py=y(r.price),buy=r.sideType==='buy',color=buy?'#b83126':'#1d4ed8';
    let lx=px,ly=py;
    for(let k=0;k<40;k++) {
      lx=Math.max(L+14,Math.min(W-R-14,px+[0,35,-35,70,-70][k%5]));
      ly=Math.max(20,Math.min(H-B-8,py+(buy?-1:1)*(22+Math.floor(k/5)*22)));
      if(!labels.some(p=>Math.abs(p.x-lx)<30&&Math.abs(p.y-ly)<18)) break;
    }
    labels.push({x:lx,y:ly});
    const pts=buy?`${px},${py-6} ${px-5},${py+4} ${px+5},${py+4}`:`${px},${py+6} ${px-5},${py-4} ${px+5},${py-4}`;
    return `<g class="trade-marker ${r.sideType}" data-time="${iso(r.date)} ${r.time}"><title>${r.marker} ${r.side} ${r.time} ${r.price} / ${r.qty}</title><line x1="${px}" x2="${lx}" y1="${py}" y2="${ly}" stroke="${color}" stroke-dasharray="3 3"/><polygon points="${pts}" fill="${color}" stroke="#fff"/><text x="${lx}" y="${ly}" text-anchor="middle" fill="${color}" class="point-label">${r.marker}</text></g>`;
  }).join('');
  charts.push({code:s.code,date,markers:trades.length,bars:bars.length});
  return `<figure class="chart"><figcaption><strong>${h(s.name)} · ${date}</strong><span>B 买入 · S 卖出 · 真实5分钟，不复权</span></figcaption><div class="chart-scroll"><svg class="stock-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${h(s.name)} ${date}真实5分钟买卖点图"><rect width="${W}" height="${H}" fill="#fff"/>${grid}${candles}<path d="${line}" fill="none" stroke="#8b96a6" stroke-width="1"/>${markers}${axis}</svg></div></figure>`;
}
function stockSection(s) {
  const file=path.join(dataDir,s.code+'-5m.json');
  assert(fs.existsSync(file),`Missing chart ${s.code}`);
  const market=readJson(file);
  s.rows.forEach((r,i)=>r.marker=(r.sideType==='buy'?'B':'S')+(i+1));
  const tradeDates=[...new Set(s.rows.map(r=>iso(r.date)))];
  const plots=tradeDates.map(date=>chart(s,date,market.bars.filter(b=>b.date===date),s.rows.filter(r=>iso(r.date)===date))).join('');
  const flow=table(['点位','完整成交时间','操作','成交价 / 数量','发生金额'],s.rows.map(r=>cells([
    `<b class="${r.sideType}">${r.marker}</b>`,`${iso(r.date)}<br>${r.time}`,`${r.side}${r.inferredSide?'<small>原列：对方卖出</small>':''}`,
    `${displayPrice(r.price,s.code)} / ${r.qty.toLocaleString()}${s.code.startsWith('5')||s.code.startsWith('15')?'份':'股'}`,
    `<span class="numeric">${signed(cents(r.net))}</span>`,
  ])).join(''),'flow');
  const roundHtml=s.rounds.map((r,i)=>`${i+1}轮 ${r.start} → ${r.end}：<b class="${tone(r.pnl)}">${signed(r.pnl)}</b>`).join('；');
  return `<details class="stock-section" id="stock-${s.code}" ${important.has(s.code)?'open':''}><summary><span><strong>${h(s.name)}</strong><small>${s.code} · ${s.rows.length}笔 · ${h(s.type)}</small></span><b class="${tone(s.realized)}">${signed(s.realized)}</b></summary><div class="stock-body"><p class="stock-lesson"><strong>${s.realized>0?'关键复制点':'关键错误 / 检查点'}：</strong>${h(s.lesson)}</p><p class="subtle">${roundHtml}${s.qty?`；期末${s.qty}股，含费成本${money(s.cost)}，浮盈浮亏按要求排除。`:''}</p><dl class="stock-review"><div><dt>操作类型</dt><dd>${h(s.type)}</dd></div><div><dt>预案 vs 实际</dt><dd>${h(s.plan)}<br>实际：${s.rows.filter(r=>r.sideType==='buy').reduce((n,r)=>n+r.qty,0)}买入 / ${s.rows.filter(r=>r.sideType==='sell').reduce((n,r)=>n+r.qty,0)}卖出；${h(s.label)}。</dd></div><div><dt>当时最正确动作</dt><dd>${h(s.action)}</dd></div></dl>${s.copy?`<div class="copy-model"><h4>可复制模型</h4><ul>${s.copy.map(t=>`<li>${h(t)}</li>`).join('')}</ul></div>`:''}<p class="evidence">判断依据：${h(s.basis)}${s.model==='需复核'?'；分类待二次反思确认。':''}</p>${flow}${plots}<p class="evidence">行情来源：<a href="${h(market.source)}" target="_blank" rel="noopener">新浪真实5分钟行情</a> · 成交秒级时间保留在表中，图中对齐其所在5分钟区间。</p></div></details>`;
}
const stockHtml=[...stocks].sort((a,b)=>Math.abs(b.realized)-Math.abs(a.realized)).map(stockSection).join('');
assert.equal(charts.reduce((n,c)=>n+c.markers,0),86);
const navStock=s=>`<a href="#stock-${s.code}" data-code="${s.code}" data-name="${h(s.name)}" data-pnl="${Math.abs(s.realized)}" data-first="${s.rows[0].date+s.rows[0].time}" title="${h(s.name)} ${s.code}"><span>${h(s.name)}<small>${s.code}</small></span><b class="${tone(s.realized)}">${signed(s.realized)}</b></a>`;
const sourceHtml=table(['来源 / 覆盖','本期用途','状态'],[
  cells(['<a href="../../2026-08-10_2026-08-15/">08.10–08.15 周度</a>','华西800股、秦安100股的历史买入成本；不计为本期新成交。','期初仓依据']),
  cells(['<a href="../2026-08/">8月复盘</a> / <a href="data/prior-august-review.html">原战法手册留档</a>','二波续强、同批PK、条件单规则与此前本人反思。','规则对照']),
  cells(['08.17–08.28 补档','三张交割截图直接补齐27笔；逐票分钟图与本期明细完整保留。','本期补档']),
  cells(['<a href="../../2026-08-31_2026-09-04/">08.31–09.04 周度</a>','11笔，含百花旧仓处理、农业短线及传媒试错。','已有周度']),
  cells(['<a href="../../2026-09-07_2026-09-11/">09.07–09.11 周度</a>','17笔，含爱仕达止损、百大确认、桂林清仓后回补。','已有周度']),
  cells(['09.14–09.18 补档','11笔，桂林退出、国芳、闽东、西陇与ETF；对照9/14–9/16日记。','本期补档']),
  cells([fs.existsSync(path.join(root,'2026-09-21_2026-09-30/index.html'))?'<a href="../../2026-09-21_2026-09-30/">09.21–09.30 双周复盘</a>':'09.21–09.30 补档','20笔；对照9/22、9/23、9/24、9/29日度原文，纳入三张截图。','本期来源']),
  cells(['<a href="data/statement-source.json">交割核对底稿</a>','86笔去重，数量35,000，成交额245,171.80，发生金额合计+1,798.50。','已核对']),
].join(''));
const scores=[
  ['风控质量','2 / 5','爱仕达、国芳条件单未执行/未设置；内蒙分批条件单与后期空仓有进步。','1：退出失效 / 3：多数能退出 / 5：预案风控稳定执行'],
  ['定龙质量','3 / 5','百大、闽东、内蒙有地位与题材依据，但弱题材、二波和核心错过仍反复。','1：主做后排 / 3：部分核心做对 / 5：第一唯一性持续验证'],
  ['执行纪律','2 / 5','二波走弱加仓与清仓后放大回补伤害系统；9/23、9/29执行转好。','1：红线反复 / 3：主规则执行，偶有失误 / 5：触发和失效均按预案'],
  ['买卖点质量','2 / 5','汉森先手、内蒙分批有效；桂林追回、爱仕达弱走处理暴露买卖点问题。','1：买急卖被动 / 3：核心有效、杂票拖累 / 5：买卖点服从地位与风控'],
  ['仓位集中度','3 / 5',`同时持仓最多${maxHeld}只，标的数量没有证明超限；8/28和9/11现金极少，集中仓位仍可能过重。`,'1：持仓发散 / 3：集中但风险配置不稳 / 5：聚焦核心且暴露服从阶段'],
];
const coreRows=[
  ['8月下旬','汉森 / 深中华A（依据8月反思）','汉森参与并盈利；深中华A未见成交。','部分是','关键身位确认后，仍要比较更高、更强同批。','此前反思承认该切未切；具体遗漏日期待核。'],
  ['二波试错','百花医药重新验证续强','8/27建400股、8/28再加100股。','否（续强纪律）','老龙知名度不能代替二波次日确认。','旧龙信念延续，走弱仍加。'],
  ['9/7–9/9','百大集团 / 龙版传媒','先做罗牛、爱仕达，9/9切百大。','百大是','日记确认反卡后唯一5板；龙版模式内转强被错过。','主动性识别偏慢 / 早期形态印象。'],
  ['9/15–9/17','闽东电力','9/15买300股，9/17卖完。','是（入场地位）','9/15日记称唯一5板破局；9/16认可保护和承接。','最终卖点需9/17反思，不能只按中途浮盈打分。'],
  ['9/21–9/23','内蒙新华','按梯队、扩散与承接买入，三组条件单退出。','是（题材确认）','9/22、9/23日记认可逻辑与执行，同时提示监管风险。','最大亏损、仓位预算尚未完全数字化。'],
  ['9月末退潮','无已确认新周期核心','南华小仓、9/29空仓；9/30闽东观察仓。','不确定','日记强调核心与回流验证，不能把缓和当新周期。','9/30入场逻辑与本期二次反思等待补充。'],
];
const monthlyPeriods=[['08.17–08.31','202608'],['09.01–09.30','202609']].map(([label,key])=>{
  const pnl=Object.entries(realizedByDate).filter(([date])=>date.startsWith(key)).reduce((n,[,v])=>n+v,0);
  return cells([label,`${rows.filter(r=>r.date.startsWith(key)).length}笔`, `<b class="${tone(pnl)}">${signed(pnl)}</b>`,key==='202608'?'含期初华西、秦安历史成本闭环；8/31金健300股跨入9月。':'包含跨入9月的金健闭环；9/30闽东100股排除浮盈浮亏。']);
}).join('');
const highUsage=snapshots.filter(s=>s.costUsage>95);
const checklist=[
  '盘前列核心票池：最高标、题材最强与同身位PK，常看5–6只，观察与操作池不超过8只。',
  '每笔开仓写触发、仓位、最大亏损、退出价与失效条件；无数字化退出，不开新仓。',
  '二波首板只试仓，次日不续强就降预期；走弱不加仓，老龙身份不豁免。',
  '按模型挂条件单；-3%与此前-5%分别写清适用场景、参照价及动作，T+1不可卖的新仓靠仓位预算防守。',
  '清仓后当日或下一交易日回补，必须重新证明买点；自动标记后复核，不默认放大原仓。',
  '确认加仓前检查监管距离、板块反馈和现金余量；弱环境不把集中等同于接近满仓。',
  '科技ETF先验证趋势承接，再核算最低佣金后的盈亏比；不机械补仓。',
  '收盘逐笔对照预案，分别记录选股正确性、执行正确性和费用后净结果。',
];
const dailyHtml=daily.map(r=>`<details class="daily-note"><summary>${r.date} · 操作与情绪依据</summary><div><p>${h(r.operation).replaceAll('\n','<br>')}</p><ul>${(r.reflections||[]).map(t=>`<li>${h(t)}</li>`).join('')}</ul><a href="${h(r.url)}" target="_blank" rel="noopener">查看当日日度原文</a></div></details>`).join('');
const allTrades=table(['完整成交时间','标的','操作','数量','价格','成交金额','总费用','发生金额'],rows.map(r=>cells([
  `${iso(r.date)}<br>${r.time}`,`<a href="#stock-${r.code}">${h(r.name)}</a><small>${r.code}</small>`,`${r.side}${r.inferredSide?'<small>原列：对方卖出</small>':''}`,r.qty.toLocaleString(),displayPrice(r.price,r.code),money(cents(r.amount)),money(cents(r.fee+r.tax+r.otherFee)),signed(cents(r.net)),
])).join(''),'all-trades');
const html=`<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2026年9月阶段复盘｜08.15–09.30 交易审判书</title>
<style>
:root{--bg:#f4f6f8;--paper:#fff;--ink:#1b2430;--muted:#5e6b7c;--line:#dbe2e9;--accent:#b83126;--up:#08764f;--down:#b42332;--blue:#1d4ed8;--soft:#f7f9fb}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.7 "Microsoft YaHei","PingFang SC",Arial,sans-serif;letter-spacing:0}a{color:var(--blue);text-underline-offset:3px}a:hover{text-decoration:underline}button,input{font:inherit}a,button,summary,input{touch-action:manipulation}a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible{outline:2px solid var(--blue);outline-offset:3px}h1,h2,h3,h4,p{margin-top:0}h1{font-size:32px;line-height:1.35;margin:10px 0 12px}h2{font-size:23px;line-height:1.4;margin:0 0 10px}h3{font-size:18px;margin:0 0 8px}h4{margin:0 0 8px}p{margin-bottom:12px}small{display:block;color:var(--muted);font-size:12px;line-height:1.6}ul,ol{padding-left:23px}li{margin:7px 0}strong,b{font-weight:700}.profit{color:var(--up)}.loss{color:var(--down)}.numeric{font-variant-numeric:tabular-nums;white-space:nowrap}.subtle,.evidence{color:var(--muted)}.evidence{font-size:13px}.skip{position:absolute;left:-9999px}.skip:focus{left:12px;top:8px;background:white;padding:10px;z-index:9}.shell{display:grid;grid-template-columns:246px minmax(0,1fr);gap:24px;max-width:1536px;margin:auto;padding:24px}.rail{position:sticky;top:20px;max-height:calc(100dvh - 40px);overflow:auto;padding:16px 14px;background:var(--paper);border:1px solid var(--line);border-radius:8px}.rail-brand{text-decoration:none;color:var(--ink);display:block;padding:4px 8px 14px;border-bottom:1px solid var(--line)}.rail-brand strong{font-size:20px}.rail nav{display:grid;gap:3px;margin:12px 0}.rail nav>a{display:flex;align-items:center;min-height:40px;padding:7px 9px;color:var(--muted);border-radius:4px;text-decoration:none;font-size:14px}.rail nav>a:hover,.rail nav>a.active{background:var(--soft);color:var(--ink)}.rail summary{min-height:44px;cursor:pointer;font-weight:700;padding:8px}.stock-index{border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:12px 0;padding:5px 0}.index-controls{padding:8px 2px}.segments{display:flex;border:1px solid var(--line);border-radius:4px;overflow:hidden}.segments button{flex:1;min-height:40px;background:white;border:0;cursor:pointer;font-size:13px;color:var(--muted)}.segments button[aria-pressed=true]{background:#eaf0f8;color:var(--blue);font-weight:700}.search-label{display:block;font-size:12px;margin:10px 0 4px;color:var(--muted)}#stock-search{width:100%;min-height:40px;border:1px solid var(--line);padding:7px;border-radius:4px}.stock-links{display:grid;gap:2px}.stock-links a{display:flex;justify-content:space-between;align-items:center;gap:6px;min-height:44px;padding:5px 8px;text-decoration:none;font-size:13px;color:var(--ink)}.stock-links a:hover{background:var(--soft)}.stock-links b{font-size:12px;font-variant-numeric:tabular-nums}.stock-links a[hidden]{display:none}.content{min-width:0;background:var(--paper);border:1px solid var(--line)}section{padding:26px 28px;border-bottom:1px solid var(--line);scroll-margin-top:20px;min-width:0}section:last-child{border-bottom:0}.range{font-size:13px;color:var(--muted);margin:0}.verdict{border-left:4px solid var(--accent);padding:5px 0 5px 16px;margin:16px 0}.verdict h2{font-size:22px}.verdict p{margin:0}.notice{padding:12px 0;color:var(--muted);font-size:13px;border-top:1px solid var(--line)}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin:20px 0}.metric{padding-left:14px;border-left:2px solid var(--line);min-width:0}.metric span{display:block;color:var(--muted);font-size:13px}.metric strong{display:block;font-size:25px;line-height:1.5;overflow-wrap:anywhere}.table-scroll{overflow-x:auto;max-width:100%;border:1px solid var(--line);border-radius:4px;margin:14px 0}table{border-collapse:collapse;width:100%;font-size:13px;min-width:700px}th{background:var(--soft);font-size:12px;color:var(--muted);font-weight:700}th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid var(--line)}tr:last-child td{border-bottom:0}td{overflow-wrap:anywhere}td a{color:var(--ink)}.ranking td:first-child{width:145px}.ranking td:nth-child(2){width:130px}.ranking td:nth-child(3){width:170px}.tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}.tag{font-size:11px;color:var(--muted);background:var(--soft);border:1px solid var(--line);padding:1px 6px;border-radius:3px}.finding{padding:17px 0;border-top:1px solid var(--line)}.finding p:last-child{margin-bottom:0}.finding:first-of-type{border-top:0}.score td:nth-child(2){white-space:nowrap;font-size:18px;font-weight:700}.model-strip{display:flex;gap:24px;flex-wrap:wrap;margin:18px 0}.model-strip b{font-size:19px}.rules{display:grid;grid-template-columns:1fr 1fr;gap:0 30px}.rules article{padding:14px 0;border-top:1px solid var(--line)}.checklist li{padding-left:4px}.targets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin:20px 0}.targets article{border-top:3px solid var(--blue);padding-top:12px}.targets b{display:block;font-size:20px;margin-bottom:8px}.stock-section{border-top:1px solid var(--line);scroll-margin-top:20px}.stock-section:last-child{border-bottom:1px solid var(--line)}.stock-section>summary{list-style:none;display:flex;justify-content:space-between;gap:18px;align-items:center;min-height:76px;padding:14px 0;cursor:pointer}.stock-section>summary::-webkit-details-marker{display:none}.stock-section>summary strong{font-size:18px}.stock-section>summary>b{font-size:18px;white-space:nowrap;font-variant-numeric:tabular-nums}.stock-section>summary>span:before{content:"";display:inline-block;width:8px;height:8px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(-45deg);margin-right:10px;vertical-align:3px}.stock-section[open]>summary>span:before{transform:rotate(45deg)}.stock-body{padding:0 0 25px}.stock-lesson{padding:13px 16px;background:var(--soft);border-left:3px solid var(--line)}.stock-review{margin:16px 0}.stock-review>div{display:grid;grid-template-columns:120px minmax(0,1fr);gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}dt{font-weight:700;font-size:13px}dd{margin:0;color:var(--muted);font-size:13px}.copy-model{padding:12px 0}.copy-model ul{margin:0}.buy{color:var(--accent)}.sell{color:var(--blue)}.flow{min-width:600px}.chart{margin:18px 0;border:1px solid var(--line);border-radius:4px}.chart figcaption{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:10px 14px;background:var(--soft);font-size:13px}.chart figcaption span{color:var(--muted);font-size:12px}.chart-scroll{overflow:auto}.stock-chart{display:block;width:100%;min-width:700px;aspect-ratio:980/320}.axis{fill:var(--muted);font:12px Arial,sans-serif}.point-label{font:700 13px Arial,sans-serif;paint-order:stroke;stroke:#fff;stroke-width:3px}.all-trades{min-width:900px}.daily-note{padding:12px 0;border-top:1px solid var(--line)}.daily-note summary{cursor:pointer;min-height:32px;font-weight:700}.daily-note>div{padding:12px 0;font-size:14px;color:var(--muted)}.button-links{display:flex;gap:18px;flex-wrap:wrap;margin:12px 0}.button-links a{min-height:40px;display:inline-flex;align-items:center;font-size:14px}.footer{font-size:12px;color:var(--muted);padding:24px 0}#no-stock-results{font-size:13px;padding:8px}#no-stock-results[hidden]{display:none}@media(max-width:1180px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.shell{grid-template-columns:220px minmax(0,1fr);gap:16px;padding:16px}section{padding:22px}}@media(max-width:900px){.shell{display:block;padding:12px}.rail{position:static;max-height:none;margin-bottom:16px}.rail nav{grid-template-columns:repeat(3,minmax(0,1fr))}.rail nav>a{justify-content:center;text-align:center}.stock-links{grid-template-columns:repeat(3,minmax(0,1fr))}.rail-brand small{display:inline;margin-left:8px}.rail .index-controls{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:end}.search-label{grid-column:2;grid-row:1;margin:0}#stock-search{grid-column:2;grid-row:2}.segments{grid-column:1;grid-row:2}.rail .stock-index{margin:4px 0}.rail nav:last-child{border-top:1px solid var(--line);padding-top:10px}h1{font-size:29px}}@media(max-width:560px){body{font-size:15px}.shell{padding:8px}.rail{padding:10px}.rail nav{grid-template-columns:repeat(2,minmax(0,1fr))}.stock-links{grid-template-columns:repeat(2,minmax(0,1fr))}.stock-links a{font-size:12px}.stock-links b{font-size:11px}.content section{padding:22px 16px}.metrics{gap:18px 10px}.metric{padding-left:10px}.metric strong{font-size:22px}.rules,.targets{grid-template-columns:1fr}.stock-review>div{grid-template-columns:1fr;gap:4px}.stock-section>summary{gap:8px}.stock-section>summary strong,.stock-section>summary>b{font-size:16px}.verdict h2{font-size:20px}.verdict{padding-left:12px}h1{font-size:27px}.chart figcaption{gap:4px}.rail-brand small{display:block;margin-left:0}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
.chapter-index>summary{display:none}@media(max-width:900px){.chapter-index>summary{display:list-item;min-height:44px;cursor:pointer;font-weight:700;padding:8px;border-bottom:1px solid var(--line)}}
</style></head><body><a class="skip" href="#overview">跳到复盘正文</a><div class="shell"><aside class="rail" aria-label="月度复盘导航"><a class="rail-brand" href="#overview"><strong>9月阶段复盘</strong><small>08.15–09.30 · 1.5个月</small></a><details class="chapter-index" open><summary>本期章节</summary><nav aria-label="本页章节"><a href="#overview" class="active">本期概览</a><a href="#verdict">交易审判书</a><a href="#sources">周度来源</a><a href="#profits">盈利排行</a><a href="#losses">亏损排行</a><a href="#scores">五项评分</a><a href="#core">真正核心票</a><a href="#problems">共性问题</a><a href="#followthrough">上期规则检查</a><a href="#rules">落地铁律</a><a href="#maps">买卖点地图</a><a href="#trades">完整成交</a><a href="#next">10月目标</a><a href="#reflection">二次反思</a></nav></details><details class="stock-index" open><summary>逐票买卖点索引 · 24</summary><div class="index-controls"><div class="segments" role="group" aria-label="股票导航排序"><button type="button" data-order="pnl" aria-pressed="true">盈亏重要性</button><button type="button" data-order="time" aria-pressed="false">交易时间</button></div><label for="stock-search" class="search-label">名称 / 代码</label><input id="stock-search" type="search" autocomplete="off"></div><div class="stock-links">${[...stocks].sort((a,b)=>Math.abs(b.realized)-Math.abs(a.realized)).map(navStock).join('')}</div><p id="no-stock-results" hidden>没有匹配标的</p></details><nav aria-label="站点导航"><a href="../">月 / 季导航</a><a href="../../weekly-trading-review/">周度主页</a><a href="../../index.html">总首页</a></nav></aside>
<main class="content">
<section id="overview"><p class="range">2026.08.15–09.30 · 本期实际成交08.17–09.30 · 整理于2026.10.03</p><h1>1.5个月交易审判书</h1><div class="verdict"><h2>最大错误：把辨识度当成续强确认，失效后的退出仍不稳定。</h2><p>百花二波不续强仍加、爱仕达弱走没按条件单退出、国芳小仓也漏设保护。真正需要升级的，是“认出核心之后，按环境和失效条件处理”的能力。</p></div><div class="metrics"><div class="metric"><span>含费闭环已实现</span><strong class="loss">${signed(totalPnl)}</strong><small>含期初仓历史成本闭环</small></div><div class="metric"><span>交割覆盖</span><strong>86笔 / 24只</strong><small>全部秒级时间，${charts.length}张日内图</small></div><div class="metric"><span>单票最大正贡献</span><strong class="profit">+597.77</strong><small>汉森制药</small></div><div class="metric"><span>单票最大负贡献</span><strong class="loss">-1,283.64</strong><small>百花医药二波</small></div></div><p class="notice">按本人指定的8/15–9/30跨月范围统计。9/30仅剩闽东电力100股，成本1,714.00元，其浮盈浮亏按本人要求暂不计入。上方金额是交割闭环结果，不能替代账户收益率或本期资产变化；二次反思尚待本人补充。</p></section>
<section id="verdict"><h2>主罪、次罪与隐患</h2><article class="finding"><h3>主罪：失效退出还停留在“知道”，没有稳定变成动作</h3><p>直接点名百花医药、爱仕达、国芳集团。百花二波亏1,283.64元；爱仕达亏582.81元，9/9原文承认弱走没及时卖与-3%纪律未执行；国芳亏147.85元，9/15原文承认漏挂动态条件单。</p><p><strong>系统伤害：高。</strong>这三票闭环合计-${money(128364+58281+14785)}，只是已发生损失；本期二波、弱题材与退出问题的复发更值得防范。该合计不是“全部可避免损失”的反事实估算。</p></article><article class="finding"><h3>次罪：核心判断进步了，买入与仓位仍会被临盘拉动</h3><p>桂林旅游9/11先清仓，随后买回数量翻倍。虽然总亏只有75.72元，清仓后放大回补、现金只剩11.22元的行为风险很高；它不能因亏得少就获得低分惩罚。</p></article><article class="finding"><h3>隐患：规则中的“转强、深水、退出”仍缺统一参照</h3><p>上期有-5%保护思路，9/9提出-3%防守。不同场景可以有不同阈值，但须写清从成本、昨收还是开盘测量，及触发后减仓还是退出。没有参照的百分比不能稳定执行。</p></article></section>
<section id="sources"><h2>周度来源与数据口径</h2><p class="subtle">周度交割、前期成本、本人日记和本次截图相互核对；无独立周度页的区间直接在本期补档。排行统一按含费历史成本闭环，跨月明细保留。</p>${sourceHtml}${table(['成交段','成交数','该段兑现损益','说明'],monthlyPeriods)}<p class="evidence">已核对：86笔、24只标的、总成交数量35,000（股票股数与ETF份数合计）、总成交额245,171.80元。发生金额合计+1,798.50元是现金流，减期初成本6,878.01元、加回排除持仓成本1,714.00元后，得到闭环净额-3,365.51元。</p><p class="evidence">现金桥仍差0.80元，可能来自截图外资金项目，不能强行归为交易收益。期初仓历史成本闭环-${money(-oldPnl)}元；本期新建且已闭环仓位${signed(totalPnl-oldPnl)}元。账户本期收益、收益率、最大回撤仍需账户表核定。</p></section>
<section id="profits"><h2>盈利排行</h2><p class="subtle">5只盈利、合计${signed(grossProfit)}元。复制模型与利润金额分别判断；期初秦安单独标记。</p>${ranking(profit)}</section>
<section id="losses"><h2>亏损排行</h2><p class="subtle">19只负贡献、合计-${money(grossLoss)}元。百花、爱仕达、时代、欢瑞四票合计亏2,919.42元，占负贡献约${((128364+58281+57663+47634)/grossLoss*100).toFixed(1)}%；时代与欢瑞的买前逻辑仍待二次反思。</p>${ranking(loss)}</section>
<section id="scores"><h2>五项系统评分</h2><p class="subtle">暂定1–5分，按风控、定龙、纪律、买卖点、集中度依次审判。二次反思补入后校正；没有完整账户曲线，不给风控打高分。</p>${table(['维度','暂定分','证据','1 / 3 / 5分标准'],scores.map(r=>cells(r.map(h))).join(''),'score')}<div class="model-strip">${models.map(m=>`<span>${m.label} <b>${m.count}只 / ${(m.count/24*100).toFixed(1)}%</b></span>`).join('')}</div><p class="evidence">按24只去重标的计算，跨轮标的以待复核优先；“需复核”表示预案证据不足，不等于非模式。模式内也可能正常亏损，盈利也可能缺少可复制证据。</p></section>
<section id="core"><h2>本期真正应该做的核心票</h2>${table(['市场阶段','应观察核心','实际行为','定龙正确？','依据','偏离 / 待核原因'],coreRows.map(r=>cells(r.map(h))).join(''))}<p class="evidence">“核心”以本人当时日记和既有反思为证据，未补全的阶段保持不确定，不从事后涨跌倒推必须买哪只。</p></section>
<section id="problems"><h2>抓住共性，保留进步</h2><article class="finding"><h3>01 · 不是找到龙头就结束，退出仍是主矛盾</h3><p>百花、爱仕达、国芳证明：地位、回封、小仓都不能豁免失效退出。二波要重新确认，弱题材要更快降预期。最大单票损失来自二波纪律失效，而非没有听说过核心。</p></article><article class="finding"><h3>02 · 亏损集中在少数重伤票，不能用小亏平均数安慰自己</h3><p>四只主要亏损票吞回汉森与内蒙的有效利润。下阶段优先减少大额失效损失；不要为增大胜率而扩散到更多小套利。</p></article><article class="finding"><h3>03 · 持仓数量不多，风险却可能过于集中</h3><p>本期同时持仓最多${maxHeld}只；24只是整段交易过的去重数量，不能当作同时观察池超8只的证据。${highUsage.map(x=>x.date.slice(5)).join('、')}成本口径占用超过95%，其中8/28现金14.48、9/11现金11.22元，重仓的环境匹配仍需重点复核。</p></article><article class="finding"><h3>04 · 盈亏要含费用，特别是小额ETF</h3><p>全86笔费用与净额差额合计${money(totalFees)}元，其中佣金430.00、印花税58.62、发生金额反推差额${money(rows.reduce((n,r)=>n+cents(r.otherFee),0))}元（具体项目待核）；该费用已经体现在净额中，不能再重复扣。半导设备毛价差+6.20，含费却-3.80；科创半导四轮合计-19.00。</p></article><article class="finding"><h3>05 · 已经做好的动作要继续</h3><p>汉森先手、百大唯一性确认、内蒙三组条件单分批退出，构成明确正样本。南华弱走停买、罗牛小仓失败退出、9/29主动空仓也应保留；小亏正常试错不与漏设保护的大亏混罚。</p></article><h3>自动回补标记</h3>${table(['标的','最近卖出','重新买入','判定'],reentries.map(r=>cells([h(r.name),r.sell,r.buy,r.confirmedLoss?'止损后回补：前序闭环为亏损':'卖出后回补：前序闭环盈利，是否违规需复核'])).join(''))}<p class="evidence">同日/下一交易日按真实行情交易日识别，一次重新入场计一个事件，拆成多笔买入不重复计数。多笔卖出清仓时，以整轮闭环判断盈亏，避免桂林最后一笔盈利掩盖整轮亏损。</p></section>
<section id="followthrough"><h2>上期规则执行检查</h2>${table(['此前规则','本期证据','执行判定'],[
['二波不续强就撤','百花8/28仍加100股，8/31低位退出。','红线再犯：8月原文与本期交割为同一事件，跨报告不重复计数。'],
['条件单前置，不怕卖飞','8月金健反思有缺失；9/9爱仕达、9/15国芳再次明确缺失/未执行。','红线再犯：现有本人原文支持至少3起；无法量化每次条件单状态。'],
['做第一唯一性，并看同批PK','百大、闽东地位确认；9/7–9/8仍错过标准主动机会。','部分执行，定龙速度还需训练。'],
['科技不追高，能力不够用ETF','两只ETF均有成交，9/22认可不机械补仓；昊华买点待核。','工具选择进步，趋势买点和费用预算待改。'],
['清仓后不能情绪化回补','桂林9/11亏损退出后买回翻倍；ETF9/21亏损退出后当日回补，9/22盈利退出后又回补。','2起亏损后回补已自动标记；9/22盈利回补另标待核，动机等待本人补充。'],
['无确认可空仓','9/29本人反思明确空仓，9/28已卖出其他票，9/30仅100股闽东。','正向进步；9/30买入原因待二次反思。'],
].map(r=>cells(r.map(h))).join(''))}<p class="evidence">两处原文与交割冲突待本人确认：8月手册称“8/27汉森转强加仓”，交割显示8/26加仓、8/27全部卖出；华西口述约-2%，已记录历史成本闭环约-6.08%。日期、数量、净额以交割为准，旧原文保留。</p></section>
<section id="rules"><h2>落地铁律</h2><div class="rules"><article><h3>定龙必须反复验证</h3><p>第一、唯一、身位与主动性要同时放回环境里。老龙二波不自动续强，弱题材回封不自动启动主升。</p></article><article><h3>失效要可执行</h3><p>开仓前确定失效、参照价和退出动作；持仓后不因害怕卖飞延后。A股新买仓T+1不能当天卖，条件单不能替代仓位预算。<a href="https://www.sse.com.cn/lawandrules/sselawsrules2025/fund/trading/c/c_20260424_10817739.shtml" target="_blank" rel="noopener">交易规则依据</a></p></article><article><h3>确认与仓位相匹配</h3><p>先手小仓、续强确认后加。全仓不是聚焦的证明，退潮与弱题材不使用强环境风险预算。</p></article><article><h3>回补视为新交易</h3><p>重新写理由、最大亏损和失效条件；系统自动标记，禁止无理由追回和为了修复上一笔放大新仓。</p></article></div></section>
<section id="maps"><h2>每只票的买卖点地图</h2><p class="subtle">24只全部保留，按实际成交日展示${charts.length}张真实5分钟图、86个成交点。默认展开前两名盈利与前三名亏损；导航跳转自动展开目标标的。</p>${stockHtml}</section>
<section id="trades"><h2>完整成交明细</h2><div class="button-links"><a href="data/trades.csv" download>下载86笔成交 CSV</a><a href="data/summary.json" target="_blank" rel="noopener">查看核算汇总</a></div><p class="evidence">保留每笔成交日期、秒级时间、数量、价格与费用。未发布合同号、成交编号、账号和原始私密截图。</p>${allTrades}</section>
<section id="next"><h2>10月执行清单</h2><ol class="checklist">${checklist.map(x=>`<li>${h(x)}</li>`).join('')}</ol><h3>下月三个目标</h3><div class="targets"><article><b>01 · 退出规则100%</b><p>每笔买入预先写清参照价、失效、仓位和最大亏损。漏设可卖仓保护、失效后无计划加仓次数为0。</p></article><article><b>02 · 只复制确认</b><p>每天记录至少1份同批PK或无核心结论；每笔交易写明第一性证据。二波走弱仍加仓次数为0。</p></article><article><b>03 · 回补有新理由</b><p>所有同日或次日回补自动标记并100%复核；无新确认而放大旧仓次数为0。小额ETF开仓前100%核算费用。</p></article></div><h3>心理偏差（待本人复核）</h3><p>百花可能有老龙身份锚定；桂林可能有卖后怕踏空；爱仕达存在本人已承认的怕卖飞与退出迟疑。除本人原文之外，动机均为待确认分析。</p><h3>下月交易誓约</h3><p>我先写清怎样认错，再决定怎样进场；只做确认后的核心，失效就按计划处理，不用新仓位修复旧情绪。</p></section>
<section id="reflection"><h2>二次反思 · 等你补充</h2><p>已按你的要求记录这三个问题。当前判断依据交割与既有周度/日度原文，收到二次反思后再校正审判、分类和10月目标。</p><ol>${source.pendingReflectionQuestions.map(q=>`<li>${h(q)}</li>`).join('')}</ol><p class="evidence">另外记录待核项：账户区间收益与回撤；时代/欢瑞买入逻辑；西陇第二笔的计划；桂林回补触发；9/17闽东卖点；9/30闽东新仓理由；两处8月原文日期与收益冲突。</p><h3>日度依据归档 · ${daily.length}天</h3>${dailyHtml}<p class="footer">2026年9月阶段复盘 · 08.15–09.30 · 同一交割事件跨8月报告复用时，不重复累计违规次数。</p></section>
</main></div><script>
const links=document.querySelector('.stock-links');
if(window.matchMedia('(max-width:900px)').matches){document.querySelector('.stock-index').open=false;document.querySelector('.chapter-index').open=false;}
document.querySelectorAll('[data-order]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-order]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const items=[...links.children];
  items.sort((a,b)=>button.dataset.order==='pnl'?Number(b.dataset.pnl)-Number(a.dataset.pnl)||a.dataset.code.localeCompare(b.dataset.code):a.dataset.first.localeCompare(b.dataset.first));
  items.forEach(a=>links.append(a));
}));
document.querySelector('#stock-search').addEventListener('input',event=>{
  const q=event.target.value.trim().toLowerCase();let found=0;
  [...links.children].forEach(a=>{a.hidden=!((a.dataset.name+a.dataset.code).toLowerCase().includes(q));if(!a.hidden)found++;});
  document.querySelector('#no-stock-results').hidden=found>0;
});
function reveal(hash){const id=decodeURIComponent(hash.slice(1));const el=document.getElementById(id);if(el?.classList.contains('stock-section')){el.open=true;requestAnimationFrame(()=>el.scrollIntoView({block:'start'}));}}
document.querySelectorAll('a[href^="#stock-"]').forEach(a=>a.addEventListener('click',()=>reveal(a.hash)));
window.addEventListener('hashchange',()=>reveal(location.hash));reveal(location.hash);
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){document.querySelectorAll('.rail nav a[href^="#"]').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}},{rootMargin:'-10% 0px -70% 0px'});
document.querySelectorAll('main>section').forEach(el=>observer.observe(el));
</script></body></html>`;
fs.writeFileSync(path.join(out,'index.html'),html);

const indexPath=path.join(root,'monthly-quarterly-trading-review/index.html');
let index=fs.readFileSync(indexPath,'utf8');
const card=`<a class="month-card active" href="./2026-09/"><div class="card-head"><h3>2026年9月</h3><span class="chip warn">阶段复盘</span></div><p>本次按指定08.15–09.30统计1.5个月：86笔、24只、含费闭环-3,365.51；完整分时买卖点与二次反思待补区。</p></a>`;
const oldCard=/<a\b[^>]*class="month-card[^\"]*"[^>]*><div class="card-head"><h3>2026年9月<\/h3>[\s\S]*?<\/a>/;
assert(oldCard.test(index),'September navigation card not found');
index=index.replace(oldCard,card);
fs.writeFileSync(indexPath,index);
console.log(JSON.stringify({trades:86,stocks:24,charts:charts.length,markers:86,closedRealized:totalPnl/100,fees:totalFees/100,models,maxHeld,reentries,rounds:rounds.length,initialOpen:important.size},null,2));
