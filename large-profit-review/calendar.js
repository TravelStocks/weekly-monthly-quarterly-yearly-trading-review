(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => Number(value).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
  const rateText = value => (value>0?'+':'')+value.toFixed(2)+'%';
  const sourceLink = path => '../'+path;
  let archive, dates, months, selected, month;
  const names = new Map();
  const methodLink = document.querySelector('.hero-note a');
  const heroScope = document.querySelector('.hero .scope');
  const stockScope = heroScope.innerHTML;
  const heroNote = document.querySelector('.hero-note p'), stockNote=heroNote.textContent;
  const activeIncome = d => d?.income && (d.income.kind==='recorded'||el('calendar-estimates').checked);
  const isGain = d => activeIncome(d) && d.income.rate > 2;
  const displayName = t => names.get(t.code)||t.name.normalize('NFKC').replace(/\s/g,'');

  function showView(dateView) {
    methodLink.href=dateView?'#calendar-method':'#method';
    el('stock-view').hidden=dateView;el('date-view').hidden=!dateView;
    el('view-stock').setAttribute('aria-pressed',String(!dateView));
    el('view-date').setAttribute('aria-pressed',String(dateView));
    heroScope.innerHTML=dateView?'筛选：账户当日收益率 <strong>高于 +2%</strong> · 点击日历回看当天操作与反思':stockScope;
    heroNote.textContent=dateView?'日收益记录与交割按日期对应，默认包含估算并单独标记；可回看当天成交、盈利交易和已有反思。':stockNote;
  }
  function selectDate(date, focus=false, scrollDetail=false) {
    if(!dates.has(date))return;
    selected=date;month=date.slice(0,7);el('calendar-month').value=month;
    render();history.replaceState(null,'','#day='+date);
    if(focus){el('calendar-day-detail').focus({preventScroll:true});if(scrollDetail||matchMedia('(max-width:1000px)').matches)el('calendar-day-detail').scrollIntoView({behavior:'smooth',block:'start'});}
  }
  function changeMonth(value) {
    month=value;
    const available=archive.days.filter(d=>d.date.startsWith(month));
    const choice=available.find(isGain)||available.find(activeIncome)||available[0];
    if(choice){selectDate(choice.date);return;}
    selected=null;render();history.replaceState(null,'','#calendar');
  }
  function renderDetail() {
    const d=dates.get(selected);
    if(!d){el('calendar-day-detail').innerHTML='<h2>选择一个日期</h2><p>点击有账户或交割记录的日期查看操作与反思。</p>';return;}
    const income=d.income, shown=activeIncome(d), flagged=isGain(d);
    const calc=income?.calculation;
    const holdings=calc?.positions;
    const contributions=holdings?.length ? '<p><strong>各标的当日损益</strong></p><ul>'+holdings.map(h=>
      `<li>${esc(h.name)} ${esc(h.code)} · ${money(h.pnl)} 元<br><small>持仓 ${h.openingQty} → ${h.closingQty}，收盘价 ${money(h.close)} 元${h.quoteDate!==d.date?'（停牌，沿用 '+esc(h.quoteDate)+' 收盘价）':''}</small></li>`
    ).join('')+'</ul>' : holdings ? '<p>全天空仓且没有成交，持仓损益为0元。</p>' : '';
    const calculation=calc?`<details class="quote-archive"><summary>查看当日损益估算过程</summary><p>收盘总资产：现金 ${money(calc.cash)} + 持仓市值 ${money(calc.marketValue)} = ${money(calc.equity)} 元。</p><p>当日损益：${money(calc.equity)} − 上一交易日总资产 ${money(calc.previousEquity)} = ${money(income.amount)} 元。</p><p>日收益率：${money(income.amount)} ÷ ${money(calc.previousEquity)} × 100% = ${rateText(income.rate)}。</p>${contributions}<p class="subtle">含交易费用；假设没有遗漏持仓或额外出入金。<a href="${esc(sourceLink(calc.source))}">查看逐日核算与收盘价依据 ↗</a></p></details>`:'';
    const status=flagged?(income.kind==='estimated'?'估算大赚日':'大赚日'):income?(income.kind==='estimated'?(shown?'估算记录 · 未高于 +2%':'估算记录 · 尚未计入当前筛选'):'日收益未高于 +2%'):'日收益率未提供';
    const trades=['buy','sell'].map(side=>{
      const group=d.trades.filter(t=>t.side===side);
      return group.length?`<div class="calendar-trade-group ${side}"><b>${side==='buy'?'买入':'卖出'}</b><ul>${group.map(t=>`<li>${esc(displayName(t))}<small>${t.code} · ${t.qty.toLocaleString('zh-CN')}${/^(15|51|58)/.test(t.code)?'份':'股'} · ${t.count}笔</small></li>`).join('')}</ul></div>`:'';
    }).join('');
    const reviews=d.profits.map(r=>`<article class="calendar-error"><strong><a href="#${esc(r.id)}">${esc(r.name)} · ${rateText(r.rate)}</a></strong><p>${esc(r.start)} → ${esc(r.end)} · 整轮收益</p><p>${esc(r.summary)}</p>${r.factors.map(f=>`<p><b>${esc(CATEGORIES[f.category].name)}</b> · ${esc(f.evidence)}</p>`).join('')}${r.caveat?`<p>${esc(r.caveat)}</p>`:''}</article>`).join('');
    el('calendar-day-detail').innerHTML=`<span class="eyebrow">DAILY REVIEW / 日期档案</span><h2>${d.date}</h2><span class="pill">${status}</span><div class="calendar-day-result">${income?`<strong class="${income.rate>0?'is-profit':''}">${rateText(income.rate)}${income.kind==='estimated'?' <small>估</small>':''}</strong><span>${income.amount===null?'日盈亏金额未提供':`${income.amount>0?'+':''}${money(income.amount)} 元`}</span>`:'<strong>—</strong><span>不以现金流计算日收益</span>'}</div>${income?`<p class="subtle">${esc(income.basis)}${!shown?'，未计入当前统计':''}。<a href="${esc(sourceLink(income.source))}">收益来源 ↗</a></p>`:''}${calculation}<h3>当天做了哪些标的 · ${d.tradeCount}笔</h3><div class="calendar-trades">${trades||'<p class="calendar-nothing">本次交割单当天无买卖记录。账户收益仍可能受此前持仓影响。</p>'}</div><h3>关联盈利交易与复盘 · ${d.profits.length}轮</h3>${reviews||'<p class="calendar-nothing">当天未关联到已收录的盈利交易轮次。</p>'}${d.notes.length?`<details class="quote-archive"><summary>当天日记与原记录 · ${d.notes.length}段</summary><p class="subtle">原文可能包含初步判断、后续修正或旧收益数字。日收益以上方指定来源为准。</p>${d.notes.map(n=>`<blockquote class="quote"><p>${esc(n.text)}</p><a href="${esc(sourceLink(n.source))}">原复盘 ↗</a></blockquote>`).join('')}</details>`:''}<p class="calendar-details-note">交割：${esc(archive.tradeSource)}。${d.trades.length?'对应原表行 '+d.trades.flatMap(t=>t.sourceRows).sort((a,b)=>a-b).join('、')+'。':''}账户日收益与整轮交易收益分别核算。</p>`;
  }
  function renderMonthFactors(gains) {
    const groups=new Map();
    for (const day of gains) {
      for (const round of day.profits) {
        for (const factor of round.factors) {
          if (!groups.has(factor.category)) groups.set(factor.category,new Map());
          const byDate=groups.get(factor.category);
          if (!byDate.has(day.date)) byDate.set(day.date,new Set());
          byDate.get(day.date).add(round.name);
        }
      }
    }
    el('calendar-month-errors-title').textContent=month+' · 有效做法';
    el('calendar-month-errors-note').textContent=`本月 ${gains.length} 个大赚日，其中 ${gains.filter(d=>d.income.kind==='estimated').length} 个为估算。`;
    el('calendar-month-errors').innerHTML=[...groups].sort((a,b)=>b[1].size-a[1].size).map(([key,days])=>
      `<article class="month-error-card"><div class="month-error-head"><h4>${esc(CATEGORIES[key].name)}</h4><strong>${days.size} 天</strong></div>${[...days].map(([date,names])=>`<button type="button" class="month-error-date" data-date="${date}"><span>${date.slice(5)}</span><span>${esc([...names].join('、'))}</span></button>`).join('')}</article>`
    ).join('')||'<p class="calendar-nothing">本月大赚日暂无已关联的有效做法。</p>';
  }
  function render() {
    const active=archive.days.filter(activeIncome), flagged=archive.days.filter(isGain);
    const missing=archive.days.filter(d=>d.tradeCount && !d.income).length;
    const metrics=[['已收录日收益',active.length,el('calendar-estimates').checked?'含估算记录 · 单独标记':'仅已有账户记录 · 不含估算'],['账户大赚日',flagged.length,'日收益率严格高于 +2%'],['关联盈利交易的大赚日',flagged.filter(d=>d.profits.length).length,'按账户盈利日计数'],['缺日收益的成交日',missing,'已列买卖 · 不判定是否大赚']];
    el('calendar-metrics').innerHTML=metrics.map(([label,value,note])=>`<article class="metric"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');
    el('calendar-loss-picker').innerHTML='<option value="">选择大赚日期</option>'+flagged.map(d=>`<option value="${d.date}">${d.date} · ${rateText(d.income.rate)}${d.income.kind==='estimated'?'（估）':''}</option>`).join('');
    el('calendar-loss-picker').value=flagged.some(d=>d.date===selected)?selected:'';
    el('calendar-month').value=month;
    const [year,mo]=month.split('-').map(Number),offset=(new Date(Date.UTC(year,mo-1,1)).getUTCDay()+6)%7;
    const count=new Date(Date.UTC(year,mo,0)).getUTCDate();
    el('calendar-heading').textContent=`${year}年${mo}月`;
    el('calendar-prev').disabled=months.indexOf(month)===0;el('calendar-next').disabled=months.indexOf(month)===months.length-1;
    let html='<span class="calendar-blank" aria-hidden="true"></span>'.repeat(offset);
    for(let day=1;day<=count;day++) {
      const date=month+'-'+String(day).padStart(2,'0'),d=dates.get(date),income=d?.income,known=activeIncome(d),flagged=isGain(d);
      const total=d?new Set(d.trades.map(t=>t.code)).size:0;
      const value=known?rateText(income.rate):income?'估算隐藏':d?'未提供':'—';
      const note=d?(total?`${total}只 / ${d.tradeCount}笔`:'无成交'):'';
      const label=`${date}，${known?'账户日收益 '+rateText(income.rate):income?'有估算记录':'未提供日收益'}${flagged?'，大赚日':''}${d?'，'+note:''}`;
      html+=`<button type="button" class="calendar-day ${!known?'is-missing':''} ${flagged?'is-gain':''} ${known&&income.kind==='estimated'?'is-estimated':''}" data-date="${date}" aria-label="${label}" aria-pressed="${selected===date}" ${!d?'disabled':''}><b>${day}</b><span class="day-rate">${value}</span><small>${note}</small>${flagged?`<span class="loss-mark">${income.kind==='estimated'?'估算大赚':'大赚日'}</span>`:''}</button>`;
    }
    el('calendar-grid').innerHTML=html;
    const monthly=archive.days.filter(d=>d.date.startsWith(month)), known=monthly.filter(activeIncome), losses=monthly.filter(isGain);
    el('calendar-month-note').textContent=`本月 ${known.length} 条当前口径日收益，${losses.length} 个大赚日。${monthly.filter(d=>d.tradeCount&&!d.income).length} 个成交日缺少日收益率。`;
    el('calendar-loss-list').innerHTML=losses.map(d=>`<button type="button" data-date="${d.date}" aria-pressed="${selected===d.date}"><span>${d.date.slice(5)}${d.income.kind==='estimated'?'（估）':''}</span><small>${d.trades.length?[...new Set(d.trades.map(displayName))].map(esc).join('、'):'无成交 · 查看持仓周期'}</small><strong>${rateText(d.income.rate)}</strong></button>`).join('')||'<p class="calendar-nothing">本月当前口径没有已知大赚日。缺少日收益记录不代表没有盈利。</p>';
    renderMonthFactors(losses);
    renderDetail();
  }
  function route() {
    const hash=location.hash.slice(1),date=/^day=(\d{4}-\d{2}-\d{2})$/.exec(hash)?.[1];
    const dateView=hash==='calendar'||hash==='calendar-method'||Boolean(date);showView(dateView);
    if(dateView && archive){if(date&&dates.has(date))selectDate(date);else render();}
    if(dateView && !archive && !loading) init();
    if(!dateView && el(hash)?.classList.contains('record')) openHash();
    else if(el(hash))el(hash).scrollIntoView();
  }
  let loading=false;
  el('view-stock').addEventListener('click',()=>{location.hash='stocks';});
  el('view-date').addEventListener('click',()=>{location.hash='calendar';});
  window.addEventListener('hashchange',route);route();
  async function init() {
    loading=true;
    try {
      const [response,profit]=await Promise.all([fetch('../large-loss-review/calendar-data.json',{cache:'no-cache'}),profitArchive]);
      if(!response.ok) throw new Error('HTTP '+response.status);
      archive=await response.json();
      dates=new Map(archive.days.map(d=>[d.date,d]));
      for(const r of profit.records) names.set(r.code,r.name);
      for(const d of archive.days){
        d.profits=profit.records.filter(r=>r.end>=d.date && (/^\d{4}-\d{2}-\d{2}$/.test(r.start)
          ? r.start<=d.date : r.end===d.date));
      }
      months=[];let current=archive.start.slice(0,7),end=archive.end.slice(0,7);
      while(current<=end){months.push(current);let [y,m]=current.split('-').map(Number);m++;if(m===13){m=1;y++;}current=y+'-'+String(m).padStart(2,'0');}
      el('calendar-month').innerHTML=months.map(m=>`<option value="${m}">${m.replace('-','年')}月</option>`).join('');
      selected=archive.days.filter(isGain).at(-1)?.date||archive.days.at(-1).date;
      month=selected.slice(0,7);
      el('calendar-month').addEventListener('change',e=>changeMonth(e.target.value));
      el('calendar-prev').addEventListener('click',()=>changeMonth(months[months.indexOf(month)-1]));
      el('calendar-next').addEventListener('click',()=>changeMonth(months[months.indexOf(month)+1]));
      el('calendar-loss-picker').addEventListener('change',e=>{if(e.target.value)selectDate(e.target.value,true);});
      el('calendar-estimates').addEventListener('change',render);
      for(const id of ['calendar-grid','calendar-loss-list','calendar-month-errors'])el(id).addEventListener('click',e=>{const button=e.target.closest('[data-date]');if(button)selectDate(button.dataset.date,true,id==='calendar-month-errors');});
      el('calendar-source-note').textContent=`交割来源：${archive.tradeSource}，${archive.start} 至 ${archive.end}，共 ${archive.tradeCount} 笔，仅提取日期、标的、方向和数量。日收益沿用网站已有账户记录；每日明细源表：${archive.audit.incomeSource}。更新：${archive.updated}。`;
      el('calendar-loading').hidden=true;el('calendar-content').hidden=false;route();
    } catch(error) {el('calendar-loading').textContent='日历未能加载，请刷新重试。';console.error(error);}
  }
})();
