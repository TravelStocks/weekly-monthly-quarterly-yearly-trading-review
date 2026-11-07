'use strict';
const CATEGORIES = {
  wrong_side: {name:'操作失误，买卖按错', rule:'本人认定为偶发性下单方向失误。'},
  trend_nonleader: {name:'趋势行情下参与非龙头连板', rule:'趋势行情下，连板只做已确认的唯一龙头。非龙头连板加速时放弃参与。慢趋势更合我的节奏，可以空仓，也可以小仓位参与，趋势交易合计最多两成。'},
  trend_mode: {name:'趋势模式不熟悉', rule:'科技处于下降趋势时，我容易踏错反弹节奏。趋势模式最多用账户两成仓位。大仓位只留给熟悉的龙头模式。'},
  recoup: {name:'想要快速扳平亏损', rule:'亏损后先停下来。下一笔交易重新核对模式和买点，不能用急于回本作为入场理由。'},
  second_wave_entry: {name:'龙头二波买点错误', rule:'做龙头二波，等股价突破新高再买入。提前下注，容易在下杀时被洗出，也容易影响心态。'},
  board_ceiling: {name:'连板高度压制', rule:'遇到连板高度压制，提前卖出，不大仓位博弈未来溢价。'},
  regulatory_timing: {name:'监管反核节奏错误（首日上板、次日退出）', rule:'本人纪律：监管首日反核必须上板确认才参与，只有首日这一次参与窗口；次日必须卖出，不在次日新开仓或继续反复博弈。'},
  catch_up_height: {name:'补涨龙高度错误（仅三板参与）', rule:'本人纪律：补涨龙只能在三板做；先确认补涨龙地位与题材支撑，三板也不自动构成买点。更高位置不再新开仓，避免高度有限、题材走弱时连续承受大亏。'},
  mid_after_leader: {name:'同题材龙头刚结束的中位非补涨', rule:'同题材龙头刚结束时，放弃既非龙头、也不具备补涨或切换条件的中位股。'},
  theme_support: {name:'题材走弱、梯队负反馈仍做龙头', rule:'先看题材与梯队是否仍有支撑；分歧延续、集体负反馈时降低预期，按既定退出条件处理，不因仍是龙头而继续做。'},
  switch_mode: {name:'切换模式错误', rule:'尽量避免不熟悉的低位接力切换；如参与，最多小仓位试错，不用大仓位押注尚未掌握的模式。'},
  board_confirm: {name:'低卡高未定，未等上板确认', rule:'领先身位下方仅低一板且有多只有辨识度个股时，先等领先身位上板确认龙头卡位；高开不能代替上板确认，不半路抢入。'},
  pk: {name:'同身位PK未决，抢先手押注', rule:'同题材、同身位尚未决出龙头唯一性时，一字板和换手板都不能替代确认；让市场决定胜者，先定龙，再参与。'},
  cycle: {name:'阶段 / 题材判断错位', rule:'先判断题材所处阶段及持续性，再选择龙头、补涨、二波或切换模式。'},
  leader: {name:'非核心 / 唯一性未确认', rule:'参与前确认第一性与唯一性；竞争尚未胜出，不提前赋予核心预期。'},
  entry: {name:'入场过早 / 买点不合规', rule:'把可执行的分时触发写清楚；窗口错过或确认未到，放弃参与。'},
  exit: {name:'失效未退 / 利润保护不足', rule:'把原有失效条件、利润保护和兑现步骤写进预案，出现负反馈时执行。'},
  add: {name:'亏损想要摊平成本', rule:'区分强度确认后加仓与为降低成本而补仓；后者是需要反复检查的错误。'},
  size: {name:'仓位超过确定性', rule:'仓位服从已确认的题材强度、个股地位与风险预算。'},
  execution: {name:'条件单 / 下单执行问题', rule:'开盘前复核条件单，提交前核对方向、数量和有效期。'},
  mode: {name:'模式外交易 / 临盘随手单', rule:'不熟悉的模式先研究，不用临盘一时兴起替代交易计划。'},
  emotion: {name:'情绪化回补 / 恐慌卖出', rule:'退出后重新审视入场条件，不把回本、踏空或恐慌当成信号。'}
};
const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => Number(value).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
const link = path => path.startsWith('large-loss-review/index.html#') ? path.slice(path.indexOf('#')) : '../' + path;
let DATA;

function scopedRecords() {
  const term=$('search').value.trim().toLowerCase();
  return DATA.records.filter(r => ($('instrument').value==='all'||r.instrument===$('instrument').value)
    && ($('status').value==='all'||r.status===$('status').value)
    && ($('month').value==='all'||r.end.startsWith($('month').value))
    && (!term||r.name.toLowerCase().includes(term)||r.code.includes(term)));
}
function rankedErrors(records) {
  return Object.entries(CATEGORIES).map(([id,category])=>({id,...category,
    count:records.filter(r=>r.errors.some(e=>e.category===id)).length}))
    .filter(x=>x.count).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'zh-CN'));
}
function renderRecord(r) {
  const tags=r.errors.length ? r.errors.map(e=>`<span class="tag">${escape(CATEGORIES[e.category].name)}</span>`).join('')
    :`<span class="tag neutral">${escape(r.assessment)}</span>`;
  const evidence=r.errors.map(e=>{
    const q=r.quotes.find(q=>q.text.includes(e.evidence));
    return `<div class="evidence"><strong>${escape(CATEGORIES[e.category].name)} · 归类依据</strong><blockquote>“${escape(e.evidence)}”</blockquote><a href="${escape(link(q.source))}">查看对应原文 ↗</a></div>`;
  }).join('');
  return `<details class="record" id="${r.id}"><summary><span class="stock-name">${escape(r.name)}<small>${r.instrument==='ETF'?'ETF · ':''}${r.code} · ${escape(r.start)} → ${r.end}${r.status==='floating'?' · 浮亏快照':''}</small></span><span class="loss-rate">${r.rate.toFixed(2)}%<small>${money(r.pnl)} 元 · ${r.basis.startsWith('费用前')?'费用前':'含费成本'}</small></span><span class="tags">${tags}</span></summary>
    <div class="record-body"><p>${escape(r.summary)}</p><div class="numbers"><span>对应成本<b>${money(r.cost)} 元</b></span><span>${r.status==='closed'?'该轮亏损':'快照浮亏'}<b>${money(r.pnl)} 元</b></span><span>计算口径<b>${escape(r.basis)}</b></span></div>${evidence}
    ${r.assessment==='正常试错'?'<p class="coverage">保留在亏损明细中，不纳入错误排行榜。</p>':''}
    <div class="source-links">${r.sources.map((s,i)=>`<a href="${escape(link(s))}">成交 / 核算来源 ${i+1} ↗</a>`).join('')}<a href="#${r.id}">此轮固定链接</a></div>
    <details class="quote-archive"><summary>关联反思与历史记录 · ${r.quotes.length} 段</summary><p class="subtle">原文保留当时措辞，可能包含早期疑问、后来修正和同页其他交易。上方摘要按本轮与后续明确反思归类；原文提及的盘中涨跌或账户收益不作为本轮收益率。</p>${r.quotes.length?r.quotes.map(q=>`<blockquote class="quote"><p>${escape(q.text)}</p><a href="${escape(link(q.source))}">原复盘 · ${escape(q.source.split('/')[0])} ↗</a></blockquote>`).join(''):'<p>已有公开复盘没有可对应的个股反思文字，暂不推测错误。</p>'}</details></div></details>`;
}
function render() {
  const records=scopedRecords(), ranks=rankedErrors(records), tagged=records.filter(r=>r.errors.length).length,
    normal=records.filter(r=>r.assessment==='正常试错').length, pending=records.length-tagged-normal;
  $('metrics').innerHTML=[['亏损样本',records.length,`${new Set(records.map(r=>r.code)).size} 个不同标的 · 当前筛选范围`],
    ['有明确错误归类',tagged,'每个标签附对应原文依据'],['正常试错',normal,'保留原评价 · 不计错误频次'],['待归因',pending,'材料不足 · 不由亏损倒推错误']]
    .map(([title,value,note])=>`<article class="metric"><span>${title}</span><strong>${value}</strong><small>${note}</small></article>`).join('');
  const top=ranks[0], tied=top?ranks.filter(r=>r.count===top.count):[];
  $('insight-title').textContent=top?`${tied.length>1?'并列最多：':'当前最多：'}${tied.map(t=>t.name).join('、')}`:'当前范围还没有可确认的错误排名';
  $('insight-copy').textContent=top?`出现 ${top.count} 轮，占当前 ${records.length} 轮亏损样本的 ${(top.count/records.length*100).toFixed(1)}%。${top.rule} 这是现有反思中可确认的频次，不代表每笔亏损都由此造成。`:'可切换范围查看其他样本；缺少归因的记录仍可在下方查看。';
  $('error-ranks').innerHTML=ranks.length?ranks.map((r,i)=>`<button class="rank" type="button" data-category="${r.id}" aria-pressed="${$('category').value===r.id}"><span class="rank-number">${String(i+1).padStart(2,'0')}</span><span class="rank-title">${r.name}</span><span class="rank-count">${r.count} 轮<small>${(r.count/records.length*100).toFixed(1)}%</small></span><span class="track" aria-hidden="true"><i style="width:${r.count/ranks[0].count*100}%"></i></span></button>`).join(''):'<div class="empty">当前范围暂无有依据的错误分类。</div>';
  const groups=new Map();
  records.forEach(r=>{if(!groups.has(r.code))groups.set(r.code,{code:r.code,name:r.name,count:0,pnl:0});const g=groups.get(r.code);g.count++;g.pnl+=r.pnl;});
  $('stock-ranks').innerHTML=Array.from(groups.values()).sort((a,b)=>b.count-a.count||a.pnl-b.pnl).slice(0,7).map((r,i)=>`<div class="stock-rank"><span class="rank-number">${i+1}</span><button type="button" data-stock="${r.code}"><b>${escape(r.name)}</b><small>${r.code} · ${r.count} 轮入选</small></button><div class="amount">${money(r.pnl)}<small>亏损合计 / 元</small></div></div>`).join('')||'<div class="empty">当前范围无亏损样本。</div>';
  const category=$('category').value;
  const visible=records.filter(r=>category==='all'||(category==='normal'?r.assessment==='正常试错':category==='pending'?r.assessment==='待归因':r.errors.some(e=>e.category===category)));
  visible.sort($('sort').value==='amount'?(a,b)=>a.pnl-b.pnl:$('sort').value==='recent'?(a,b)=>b.end.localeCompare(a.end)||a.rate-b.rate:(a,b)=>a.rate-b.rate);
  $('record-count').textContent=`显示 ${visible.length} / ${records.length} 轮`;
  $('record-list').innerHTML=visible.map(renderRecord).join('')||'<div class="empty">没有符合条件的记录。可清除分类或重置筛选。</div>';
  $('clear-category').hidden=category==='all';
}
function openHash() {
  const id=location.hash.slice(1), record=DATA.records.find(r=>r.id===id);
  if(!record){const target=$(id);if(target)target.scrollIntoView();return;}
  $('instrument').value=record.instrument;$('status').value=record.status;$('month').value='all';$('search').value='';$('category').value='all';render();
  const target=$(id);target.open=true;target.scrollIntoView();
}
async function init() {
  try {
    const response=await fetch('./data.json?v=20261106-changlan');
    if(!response.ok)throw new Error('HTTP '+response.status);
    DATA=await response.json();
    Object.entries(CATEGORIES).forEach(([id,c])=>$('category').insertAdjacentHTML('beforeend',`<option value="${id}">${c.name}</option>`));
    [...new Set(DATA.records.map(r=>r.end.slice(0,7)))].sort().reverse().forEach(m=>$('month').insertAdjacentHTML('beforeend',`<option value="${m}">${m}</option>`));
    for(const id of ['instrument','status','month','category','sort'])$(id).addEventListener('change',render);
    $('search').addEventListener('input',render);
    $('reset').addEventListener('click',()=>{for(const [id,value] of Object.entries({instrument:'all',status:'closed',month:'all',category:'all',sort:'rate',search:''}))$(id).value=value;render();});
    $('clear-category').addEventListener('click',()=>{$('category').value='all';render();});
    $('error-ranks').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){$('category').value=b.dataset.category;render();$('records').scrollIntoView();$('category').focus({preventScroll:true});}});
    $('stock-ranks').addEventListener('click',e=>{const b=e.target.closest('[data-stock]');if(b){$('search').value=b.dataset.stock;$('category').value='all';render();$('records').scrollIntoView();}});
    const closed=DATA.records.filter(r=>r.status==='closed'), floating=DATA.records.filter(r=>r.status==='floating');
    $('coverage').textContent=`已扫描 ${DATA.audit.scannedPages.length} 份周/月档案，成交覆盖至 ${DATA.audit.tradesThrough}；共有 ${closed.length} 轮可核算亏损、${floating.length} 条历史浮亏快照（含ETF）。当前包含上海沪工、大业股份的11月已平仓记录，文投11月4日浮亏作为历史快照单独展示。没有成本或退出记录的部分不补造收益；分类采用有原文依据的最新反思。`;
    $('audit-details').innerHTML=`<h3>已扫描档案</h3><ul>${DATA.audit.scannedPages.map(p=>`<li><a href="${escape(link(p.source))}">${escape(p.source.replace('/index.html',''))}</a> · ${escape(p.kind)}</li>`).join('')}</ul><h3>未配齐成本的历史卖出</h3><p class="subtle">以下卖出不凭现金流计算亏损率。4月独立报告已核算的轮次另行使用其已补成本。</p><ul>${DATA.audit.unknownCostSales.map(t=>`<li>${t.date} · ${escape(t.name)} ${t.code} · <a href="${escape(link(t.source))}">来源</a></li>`).join('')||'<li>无</li>'}</ul>`;
    $('updated').textContent=DATA.reflectionUpdated||DATA.updated;$('load-state').hidden=true;$('content').hidden=false;render();openHash();
    window.addEventListener('hashchange',openHash);
  } catch(error) {
    $('load-state').textContent='档案暂未加载成功，请刷新重试。';
    const retry=document.createElement('button');retry.textContent='刷新重试';retry.addEventListener('click',()=>location.reload());$('load-state').append(retry);
    console.error(error);
  }
}
init();
