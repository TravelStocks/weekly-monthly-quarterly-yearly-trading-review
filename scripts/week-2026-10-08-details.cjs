const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const esc = s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const fmt = n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const signed = n=>(n>0?'+':'')+fmt(n);
const pct = n=>(n>0?'+':'')+n.toFixed(2)+'%';
const cls = n=>n>0?'is-profit':n<0?'is-loss':'';
const round = n=>Math.round(n*100)/100;
const metric = (label,value)=>`<span>${label}<b>${value}</b></span>`;
const table = (heads,rows)=>`<div class="table-wrap"><table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

module.exports = function details(review, summary, dir) {
  const load = name=>JSON.parse(fs.readFileSync(path.join(dir,'data',name),'utf8'));
  const diary = load('daily-reviews.json');
  const quotes = Object.fromEntries(summary.stocks.map(s=>[s.code,load(`${s.code}-daily.json`)]));
  const close = (code,date)=>{
    const bar=quotes[code].bars.find(b=>b.date===date);
    assert.ok(bar,`Missing closing price ${code} ${date}`);
    return bar.close;
  };
  const positions = new Map(review.opening.positions.map(p=>[p.code,{code:p.code,name:p.name,qty:p.qty,cost:p.cost}]));
  const openingMarketValue = round([...positions.values()].reduce((n,p)=>n+p.qty*close(p.code,review.opening.date),0));
  const openingEquity = round(review.opening.cash+openingMarketValue);
  const openingFloating = round(openingMarketValue-summary.openingCost);
  let cash = review.opening.cash, previousEquity = openingEquity;
  const days = review.accountDays.map(day=>{
    const trades=summary.transactions.filter(t=>t.date===day.date);
    for(const t of trades) {
      cash=round(cash+t.net);
      if(!positions.has(t.code)) positions.set(t.code,{code:t.code,name:t.name,qty:0,cost:0});
      const p=positions.get(t.code);
      if(t.side==='买入') {p.qty+=t.qty;p.cost=round(p.cost-t.net);}
      else {p.cost=round(p.cost-(t.net-t.allocatedRealized));p.qty-=t.qty;}
      assert.ok(p.qty>=0);
    }
    const holdings=[...positions.values()].filter(p=>p.qty).map(p=>({...p,price:close(p.code,day.date),value:round(p.qty*close(p.code,day.date))}));
    const marketValue=round(holdings.reduce((n,p)=>n+p.value,0));
    const equity=round(cash+marketValue), pnl=round(equity-previousEquity), returnRate=pnl/previousEquity*100;
    previousEquity=equity;
    return {...day,cash,marketValue,equity,pnl,returnRate,position:marketValue/equity*100,holdings,trades:trades.map(t=>t.id),status:'estimated'};
  });
  const last=days.at(-1), pnl=round(last.equity-openingEquity);
  const finalHoldings=last.holdings.map(p=>({...p,pnl:round(p.value-p.cost),returnRate:(p.value-p.cost)/p.cost*100,position:p.value/last.equity*100}));
  const floating=round(finalHoldings.reduce((n,p)=>n+p.pnl,0));
  assert.equal(round(summary.realized+floating-openingFloating),pnl);
  assert.equal(round(days.reduce((n,d)=>n+d.pnl,0)),pnl);
  let peak=openingEquity, maxDrawdown=0;
  for(const day of days) {peak=Math.max(peak,day.equity);day.drawdown=(day.equity/peak-1)*100;maxDrawdown=Math.min(maxDrawdown,day.drawdown);}
  const account={status:'estimated',basis:'用户确认本期交割完整。交割现金 + 持仓数量 × 不复权收盘价；无额外分红或出入金为估值前提，不是券商账户日表。无成交不自动等于空仓，已买未卖继续结转。',
    openingDate:review.opening.date,openingEquity,openingFloating,endingEquity:last.equity,pnl,returnRate:pnl/openingEquity*100,
    dailyRateSum:days.reduce((n,d)=>n+d.returnRate,0),averagePosition:days.reduce((n,d)=>n+d.position,0)/days.length,
    maxDrawdown,best:days.reduce((a,b)=>a.pnl>b.pnl?a:b),worst:days.reduce((a,b)=>a.pnl<b.pnl?a:b),floating,days,holdings:finalHoldings};
  account.weeks=review.periods.map((w,i)=>{
    const ds=days.filter(d=>w.dates.includes(d.date)), start=i?days[1].equity:openingEquity;
    return {...w,openingEquity:start,endingEquity:ds.at(-1).equity,pnl:round(ds.at(-1).equity-start),returnRate:(ds.at(-1).equity/start-1)*100,
      dailyRateSum:ds.reduce((n,d)=>n+d.returnRate,0),averagePosition:ds.reduce((n,d)=>n+d.position,0)/ds.length};
  });
  summary.account=account;summary.accountStatus='estimated';
  summary.scope='交割闭环按含费成本核算；账户按现金与真实不复权收盘价估算。闭环收益含跨期成本，不等于期间账户收益。';

  function operations(date) {
    const list=summary.transactions.filter(t=>t.date===date);
    if(!list.length) return '无成交';
    return ['买入','卖出'].map(side=>{
      const groups=new Map();
      for(const t of list.filter(t=>t.side===side)) {
        if(!groups.has(t.code)) groups.set(t.code,{...t,qty:0});
        groups.get(t.code).qty+=t.qty;
      }
      return [...groups.values()].map(t=>`${side} ${esc(t.name)} ${t.code} ${t.qty}股`).join('；');
    }).filter(Boolean).join('<br>');
  }
  function accountHtml() {
    const max=Math.max(...days.map(d=>Math.abs(d.pnl)),1);
    const tradeCell = date=>require('./fill-weekly-daily-traded-stocks.cjs').renderTrades(date,summary.transactions.map(t=>({...t,side:t.side==='买入'?'buy':'sell'})),summary.stocks.map(s=>'stock-'+s.code));
    return `<section class="panel" id="account"><span class="label">Account Curve</span><h2>账户收益与仓位</h2><p class="scope-note">全部数字为收盘估算：${account.basis} 日收益＝当日权益－上一交易日权益；日收益率以上一日权益为分母。平均仓位是7个交易日收盘仓位的简单平均，不是某日仓位。</p>
      <div class="summary-grid">${metric('本期金额变化（估算）',signed(pnl))}${metric('本期收益率（区间权益）',pct(account.returnRate))}${metric('日收益率相加（估算）',pct(account.dailyRateSum))}${metric('期末权益（估算）',fmt(last.equity))}${metric('平均仓位',account.averagePosition.toFixed(2)+'%')}${metric('期末仓位',last.position.toFixed(2)+'%')}${metric('最赚日',account.best.day+' '+account.best.date.slice(5)+' '+signed(account.best.pnl))}${metric('最亏日',account.worst.day+' '+account.worst.date.slice(5)+' '+signed(account.worst.pnl))}${metric('区间最大回撤（收盘口径）',pct(maxDrawdown))}</div>
      <div class="account-bars">${days.map(d=>`<article class="account-day"><div class="day-head"><b>${d.day}</b><small>${d.date.slice(5)}</small></div><div class="account-track"><i class="${cls(d.pnl)}" style="height:${Math.max(2,Math.abs(d.pnl)/max*100)}%"></i></div><strong class="${cls(d.pnl)}">${pct(d.returnRate)}</strong><span class="${cls(d.pnl)}">${signed(d.pnl)} 元</span><small>仓位 ${d.position.toFixed(2)}% · 权益 ${fmt(d.equity)}</small><div class="position-track"><i style="width:${d.position}%"></i></div><p>${operations(d.date)}</p></article>`).join('')}</div>
      ${table(['日期','星期','收益金额（估）','收益率（估）','仓位（估）','期末权益（估）','收盘持仓','当日操作标的'],days.map(d=>[d.date,d.day,`<b class="${cls(d.pnl)}">${signed(d.pnl)}</b>`,pct(d.returnRate),d.position.toFixed(2)+'%',fmt(d.equity),d.holdings.map(p=>`${p.name} ${p.qty}股`).join('；')||'空仓',tradeCell(d.date)]))}
      <h3>分周核算</h3>${table(['区间','金额变化（估）','周收益率（每日相加）','区间权益收益率','平均周仓位','期末权益'],account.weeks.map(w=>[w.range,signed(w.pnl),pct(w.dailyRateSum),pct(w.returnRate),w.averagePosition.toFixed(2)+'%',fmt(w.endingEquity)]))}
      <p class="source-line">期初9/30权益 ${fmt(openingEquity)}＝现金 ${fmt(review.opening.cash)}＋闽东电力100股市值 ${fmt(openingMarketValue)}。<a href="data/summary.json">每日计算明细</a>；各股收盘价见下方行情记录。</p></section>`;
  }
  function holdingsHtml() {
    return `<section class="panel" id="holdings"><span class="label">Closing Positions</span><h2>期末持仓与市值核算</h2><p>截至10月16日，按本人确认的完整交割结转持仓。市值用当日不复权收盘价，未用成本代替权益；现金沿用10/15末笔后的余额，按无额外资金变动估算。</p>
      ${table(['标的','股数','含费成本','含费均价','10/16收盘价','持仓市值','浮动盈亏','浮动收益率','占总资产'],finalHoldings.map(p=>[`${p.name} ${p.code}`,p.qty,fmt(p.cost),(p.cost/p.qty).toFixed(3),fmt(p.price),fmt(p.value),`<b class="${cls(p.pnl)}">${signed(p.pnl)}</b>`,pct(p.returnRate),p.position.toFixed(2)+'%']))}
      <div class="summary-grid">${metric('期末现金',fmt(last.cash))}${metric('持仓市值',fmt(last.marketValue))}${metric('期末权益（估算）',fmt(last.equity))}${metric('持仓浮盈（含费）',signed(floating))}</div>
      <p>核算桥：闭环 ${signed(summary.realized)} ＋ 期末浮盈 ${signed(floating)} － 期初浮盈 ${signed(openingFloating)} ＝ 本期权益变化 ${signed(pnl)} 元。</p></section>`;
  }
  const ticketNotes={
    '600241':{role:'主要已实现盈利票 / 金字塔建仓与六板退出',root:'交割证实10/8首仓200股、10/9加仓500股、10/12分三笔卖完700股，实际完整闭环+720.45元。本人将这三天分别回顾为四板建仓、五板补仓、六板退出，并明确认可六板退出本身；板位为本人回顾口径。',emotion:'要改的是四板首仓偏轻、五板补仓偏重，以及六板盯盘不够紧；本人估计因此回吐或少保护了两三个点，不另记为实际亏损。10/9账户估算仓位96.09%，仍需对照弱天时的总仓位预算，不能因最后盈利忽略风险。',rule:'按本人金字塔原则，计划内第一笔重一些，第二笔轻一些，三笔之内完成建仓，但不提高既定总风险预算。六板若封得牢、不炸板、不放量分歧且封单强，可结合当时条件观察；弱天时一旦分歧就出完，不盲目押七板、八板。'},
    '000993':{role:'跨期反抽盈利票',root:'承接9/30的100股试仓，10/12卖出，完整闭环+99.09元；9/30收盘时已有-5元费用浮亏，因此本期间权益贡献是+104.09元。',emotion:'本人认可监管反抽的小仓位参与和小利润兑现，没有在本期追加为重仓龙头预期。',rule:'反抽、接力和趋势持有分别定义预期；本例仅记录100股的已完成交易，不把个人监管经验当成确定法规。'},
    '000823':{role:'期末浮盈票 / 尚未闭环',root:'10/14竞价买100股，期末收盘25.26元，高于24.55元买入价；扣买入费用后浮盈66元。10/16较前一收盘价下跌带来61元当日回吐。',emotion:'本人二次心得称通过此笔发现更适应有题材支撑的科技趋势抱团，并强调持有定力。浮盈不是已实现利润，持股定力也不能替代失效条件。',rule:'先确认题材持续性与核心地位，区分正常波动和逻辑失效；退出计划仍待本人具体价格、时间条件。'},
    '002242':{role:'期末浮盈票 / 尚未闭环',root:'10/15两笔各100股，含费成本3,469元；10/16收盘17.79元，市值3,558元，浮盈89元。不是已经卖出的利润。',emotion:'本人进一步将九阳归为多概念辨识度抱团，区别于时代万恒的经典题材龙头，并以圣阳作历史类比。核心前提是多个概念在同周期实际发酵；具体接力证据与卡位评论的日期、回封先后仍待核对。',rule:'核对同周期活跃题材、身位与实际承接，不用概念数量替代退出判断；不同交易回合分开记，不将口述中的更早卖出计入这200股。'}
  };
  function profitHtml() {
    return `<section class="panel" id="profit-loss"><span class="label">Profit And Loss</span><h2>本周持有/闭环票：赚钱与亏损主因</h2><p>本期两只已平仓标的均盈利，期末两只持仓按收盘估算均浮盈，没有已确认的亏损闭环票。10/14买入费用造成当日估算亏损5元；10/16超声电子市值回吐61元，但九阳增加96元，账户合计仍增加35元。盘中回吐、单票结果与账户结果分别判断。</p><div class="ticket-grid">${summary.stocks.map(s=>{
      const note=ticketNotes[s.code],holding=finalHoldings.find(p=>p.code===s.code),v=holding?holding.pnl:s.realized,r=holding?holding.returnRate:s.returnRate;
      return `<article class="ticket-card"><div class="day-head"><h3>${s.name} <small>${s.code}</small></h3><strong class="${cls(v)}">${signed(v)} / ${pct(r)}</strong></div><p class="source-line">${note.role} · ${holding?'浮动':'完整闭环'}含费收益率</p><p><b>盈亏来源：</b>${note.root}</p><p><b>操作与情绪：</b>${note.emotion}</p><p><b>复盘规则（整理）：</b>${note.rule}</p><a href="#stock-${s.code}">查看5分钟买卖点</a></article>`;
    }).join('')}</div></section>`;
  }
  const dailyThemes={
    '2026-10-08':['时代万恒首笔接力','买入200股，另持闽东电力100股。本人最新二次心得将此笔归为四板首仓，认为计划内第一笔应更重一些；这是事后反思，不假定当天已知未来强弱，也不提高弱环境的总仓位预算。'],
    '2026-10-09':['时代万恒加仓','增持500股至700股。本人回顾为五板补仓，认为首仓小、后仓大的结构减少了利润空间；今后按第一笔重、第二笔轻、最多三笔的金字塔原则安排。当天总仓位估算96.09%，仍须核对弱环境预算。'],
    '2026-10-12':['两个闭环兑现，转为空仓','时代700股与闽东100股全部卖出；与10/9收盘权益相比当日增加540.62元，是本期最大盈利日。本人认可时代六板退出，需改进的是盯盘与利润保护；所述两三个点为个人回顾估计，不等同于当日账户亏损。弱天时高位分歧出完，是本次明确要保持的动作。'],
    '2026-10-13':['空仓等待','交割无成交、可见持仓为零。已有10/12–13盘面笔记和周期主题心得保留在原文中，但没有据此编造当日个人KISS。'],
    '2026-10-14':['小仓参与超声电子趋势抱团','竞价买入100股；当天收盘同为24.55元，估算亏损5元来自费用。本人二次心得强调科技趋势核心及持有定力。'],
    '2026-10-15':['九阳股份两次建仓','13:00与14:47各买100股，叠加超声电子持仓。按收盘计算总仓位约55%，并非只看九阳一只的仓位。'],
    '2026-10-16':['持仓观察，没有新增成交','按现有交割继续持有超声100股、九阳200股；账户当日市值变化是两只持仓合并结果。日记中的市场修复不等于个人买卖动作。']
  };
  function dailyHtml() {
    return `<section class="panel" id="daily"><span class="label">Daily Review</span><h2>逐日操作与情绪复盘</h2><p>成交事实按交割；当时的市场判断摘自个人每日复盘；回看评价来自本期二次心得或注明为整理分析。公开日记已隐藏私人操作情绪，不擅自补写成当日原话。</p><div class="daily-grid">${days.map(d=>{
      const source=diary.reviews.find(r=>r.date===d.date),[title,note]=dailyThemes[d.date];
      return `<article class="day-card"><div class="day-head"><h3>${d.date.slice(5)} ${d.day} · ${title}</h3><b class="${cls(d.pnl)}">${signed(d.pnl)} / ${pct(d.returnRate)}（估）</b></div><p><b>交割操作：</b>${operations(d.date)}</p><p><b>回看与核对：</b>${note}</p>${source?`<p><b>当日市场情绪（原复盘）：</b>${esc(source.emotion)}</p><p><b>原文公开执行原则：</b>${esc(source.sections.find(s=>/KISS/.test(s.heading))?.text.replace(/^Daily Review五、操作与情绪复盘 KISS模型\s*/,'')||source.operation)}</p><a href="${esc(source.url)}" target="_blank" rel="noopener">当日复盘来源</a>`:'<p class="source-line">该日期公开日记未找到；保留交割与二次心得核对，不冒充当日操作/情绪原文。</p>'}</article>`;
    }).join('')}</div></section>`;
  }
  function chart(stock) {
    const data=load(`${stock.code}-5m.json`), bars=data.bars.filter(b=>b.date>=review.start && b.date<=review.end);
    assert.equal(bars.length,336,`${stock.code} seven sessions`);
    const trades=summary.transactions.filter(t=>t.code===stock.code);
    const width=1200,height=360,left=64,right=24,top=52,bottom=48,w=width-left-right,h=height-top-bottom;
    const values=[...bars.flatMap(b=>[b.high,b.low]),...trades.map(t=>t.price)];
    const min=Math.min(...values),max=Math.max(...values),pad=Math.max((max-min)*.14,.1),lo=min-pad,hi=max+pad;
    const x=i=>left+(i+.5)*w/bars.length,y=p=>top+(hi-p)/(hi-lo)*h;
    const grid=Array.from({length:5},(_,i)=>{
      const p=lo+(hi-lo)*i/4;
      return `<line x1="${left}" x2="${width-right}" y1="${y(p)}" y2="${y(p)}" stroke="#e2e7ed"/><text x="54" y="${y(p)+4}" text-anchor="end" font-size="12" fill="#667085">${p.toFixed(2)}</text>`;
    }).join('');
    const candles=bars.map((b,i)=>{
      const color=b.close>=b.open?'#c2412d':'#14845f';
      return `<g class="candle"><title>${b.dt} 开${b.open} 高${b.high} 低${b.low} 收${b.close}</title><line x1="${x(i)}" x2="${x(i)}" y1="${y(b.high)}" y2="${y(b.low)}" stroke="${color}"/><rect x="${x(i)-1}" y="${Math.min(y(b.open),y(b.close))}" width="2" height="${Math.max(1,Math.abs(y(b.open)-y(b.close)))}" fill="${color}"/></g>`;
    }).join('');
    const dates=bars.map((b,i)=>i===0||b.date!==bars[i-1].date?`<line x1="${x(i)}" x2="${x(i)}" y1="${top}" y2="${height-bottom}" stroke="#dfe4ea" stroke-dasharray="3 5"/><text x="${x(i)+5}" y="${height-16}" font-size="13" fill="#667085">${b.date.slice(5)}</text>`:'').join('');
    const used=[];
    const markers=trades.map((t,i)=>{
      // The provider timestamps each bar at its end; compare seconds to avoid mapping 10:00:59 into 10:00.
      const at=bars.findIndex(b=>b.date===t.date && b.time+':00'>=t.time);
      assert.ok(at>=0,`Unmapped trade ${t.id}`);
      const px=x(at),py=y(t.price),buy=t.side==='买入',color=buy?'#c2412d':'#1d4ed8',label=(buy?'B':'S')+(i+1);
      let lx=px,ly=py;
      for(let step=0;step<30;step++) {
        lx=Math.max(left+12,Math.min(width-right-12,px+[0,35,-35][step%3]));
        ly=Math.max(30,Math.min(height-bottom-8,py+(buy?1:-1)*(25+Math.floor(step/3)*20)));
        if(!used.some(p=>Math.abs(p.x-lx)<32 && Math.abs(p.y-ly)<18)) break;
      }
      used.push({x:lx,y:ly});
      const shape=buy?`${px},${py-6} ${px-6},${py+5} ${px+6},${py+5}`:`${px},${py+6} ${px-6},${py-5} ${px+6},${py-5}`;
      return `<g class="trade-marker" data-id="${t.id}" data-time="${t.date} ${t.time}" data-bar="${bars[at].dt}" data-price="${t.price}"><title>${label} ${t.date} ${t.time} ${t.side} ${t.qty}股 @ ${t.price}</title><line x1="${px}" y1="${py}" x2="${lx}" y2="${ly}" stroke="${color}" stroke-dasharray="2 3"/><polygon points="${shape}" fill="${color}" stroke="white"/><text x="${lx}" y="${ly}" text-anchor="middle" font-size="13" font-weight="700" fill="${color}">${label}</text></g>`;
    }).join('');
    return `<article class="stock-card" id="stock-${stock.code}"><div class="day-head"><h3>${stock.name} <small>${stock.code}</small></h3><span>${trades.length}笔 · 买${stock.buyQty}股 / 卖${stock.sellQty}股</span></div><div class="chart-frame"><svg class="stock-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${stock.name}真实5分钟K线及买卖点"><rect width="1200" height="360" fill="white"/><text x="64" y="23" font-size="14">5分钟K线 · 不复权 · ${bars.length}根 · 10/08–10/16</text>${grid}${dates}${candles}${markers}</svg></div><div class="trade-points">${trades.map((t,i)=>`<span class="trade-point"><b class="${t.side==='买入'?'is-profit':'is-sell'}">${t.side==='买入'?'B':'S'}${i+1} ${t.side}</b> ${t.date.slice(5)} ${t.time}<strong>${t.price.toFixed(3)} / ${t.qty}股</strong></span>`).join('')}</div>${stock.openingQty?`<p class="source-line">期初成本：9/30 14:56:59 买入100股 @17.090，含费1,714元；发生在图示区间前，不伪造为本期买点。</p>`:''}<p class="source-line"><a href="data/${stock.code}-5m.json">5分钟行情原始记录</a> · <a href="data/${stock.code}-daily.json">日K收盘估值来源</a>。B买入 / S卖出，纵坐标按真实成交价；竞价单落在当日首根K线并保留09:25原时间。</p></article>`;
  }
  function chartsHtml() {return `<section class="panel" id="stocks"><span class="label">Trade Charts</span><h2>重点走势图 · 5分钟K线买卖点</h2><p>覆盖本期实际交易的4只股票、9笔成交。图中价格为东方财富不复权历史行情，成交点来自交割单；区间之后的价格不用于倒推买卖判断。</p><div class="chart-list">${summary.stocks.map(chart).join('')}</div></section>`;}
  function missingHtml() {return `<section class="panel" id="missing"><span class="label">Source Status</span><h2>已补齐与仍需确认</h2><ul class="pending-list"><li>已完成：9笔交割、4只标的、跨期成本、完整资金链、7日收盘估算账户表、分周收益率、平均仓位、期末市值和4张真实5分钟买卖点图。</li><li>本人已确认这些是本期完整交割，按此先完成复盘。10/12卖完后与10/13为空仓；期末超声电子100股、九阳股份200股继续结转，不再以缺持仓截图阻塞复盘。</li><li>账户日数据采用交割与行情估算，不是券商账户导出值；后续如提供券商日表或出入金、分红明细，可替换估值口径并保留差额核对。</li><li>公开日记仅找到10/9、10/16且个人操作情绪已隐去。10/8、10/12、10/13、10/14、10/15的每日原文及两个已公开日期的私人KISS仍可补充；现有二次心得已完整保留，缺失原文没有杜撰。</li></ul><details><summary>二次心得中待核对的表述</summary><ul>${review.pendingClarifications.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></details></section>`;}
  const styles=`.account-bars{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:20px 0}.account-day{padding:14px;border:1px solid var(--line);border-radius:8px;display:grid;gap:7px;align-content:start;min-width:0}.day-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}.day-head h3{margin:0}.day-head small,.source-line{color:var(--muted);font-size:12px}.account-day>strong{font-size:22px}.account-day p{font-size:12px;margin:2px 0}.account-track{height:60px;display:flex;align-items:end;background:#f1f5f9;border-radius:4px;overflow:hidden}.account-track i{display:block;width:100%;background:#b9c5d3}.account-track i.is-profit{background:#c2412d}.account-track i.is-loss{background:#14845f}.position-track{height:5px;background:#e9eef5}.position-track i{display:block;height:100%;background:#526f91}.is-profit{color:#c2412d!important}.is-loss{color:#14845f!important}.ticket-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.ticket-card{padding:18px 0;border-top:1px solid var(--line)}.ticket-card p{font-size:14px}.daily-grid,.chart-list{display:grid;gap:18px}.day-card{padding:18px;border:1px solid var(--line);border-radius:8px;box-shadow:none}.chart-frame{overflow-x:auto;background:#fff}.stock-chart{display:block;width:100%;min-width:1000px;height:auto}.stock-card{border:1px solid var(--line);padding:18px;border-radius:8px;box-shadow:none}.trade-point{font-size:12px}.trade-point strong{display:block}.source-line{overflow-wrap:anywhere}.table-wrap td{vertical-align:top}#account table{min-width:1250px}#account td:nth-last-child(-n+2){white-space:normal;min-width:180px;text-align:left}.summary-grid span{min-width:0}h1,h2,h3,body{letter-spacing:0}@media(max-width:700px){.account-bars,.ticket-grid{grid-template-columns:1fr 1fr}.ticket-grid{grid-template-columns:1fr}.account-day{padding:10px}.day-head>strong{font-size:16px}}@media(max-width:400px){.account-bars{grid-template-columns:1fr}.summary-grid{grid-template-columns:1fr 1fr}}`;
  return {account,accountHtml,holdingsHtml,profitHtml,dailyHtml,chartsHtml,missingHtml,styles};
};
