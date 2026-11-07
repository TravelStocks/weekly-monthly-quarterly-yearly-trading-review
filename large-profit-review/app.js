'use strict';
const CATEGORIES = {
  leader: {name:'核心 / 唯一性识别', rule:'反思中反复认可的共同点，是识别题材核心、第一性和唯一性。'},
  entry: {name:'买点 / 强度确认', rule:'竞价、量能、回封或承接验证有原文依据时，才记录为有效入场做法。'},
  exit: {name:'兑现纪律 / 利润保护', rule:'按预案分批兑现、触发条件后退出，保留有据可查的利润保护动作。'},
  cycle: {name:'题材 / 阶段匹配', rule:'把参与模式放回当时题材和阶段，不把后来的理解倒填为当时判断。'},
  size: {name:'仓位与确定性匹配', rule:'只记录原复盘认可的仓位边界；小仓套利不因此升级为重仓模型。'},
  holding: {name:'计划内持有 / 聚焦', rule:'有原文确认时，保留等待强度兑现、不随意切换的动作。'}
};
const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => Number(value).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
const link = path => '../' + path;
let DATA;

function scopedRecords() {
  const term=$('search').value.trim().toLowerCase();
  return DATA.records.filter(r => ($('instrument').value==='all'||r.instrument===$('instrument').value)
    && ($('status').value==='all'||r.status===$('status').value)
    && ($('month').value==='all'||r.end.startsWith($('month').value))
    && (!term||r.name.toLowerCase().includes(term)||r.code.includes(term)));
}
function rankedFactors(records) {
  return Object.entries(CATEGORIES).map(([id,category])=>({id,...category,
    count:records.filter(r=>r.factors.some(e=>e.category===id)).length}))
    .filter(x=>x.count).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'zh-CN'));
}
function renderRecord(r) {
  const tags=r.factors.length ? r.factors.map(e=>`<span class="tag">${escape(CATEGORIES[e.category].name)}</span>`).join('')
    :`<span class="tag neutral">${escape(r.assessment)}</span>`;
  const evidence=r.factors.map(e=>{
    const q=r.quotes.find(q=>q.text.includes(e.evidence));
    return `<div class="evidence"><strong>${escape(CATEGORIES[e.category].name)} · 归类依据</strong><blockquote>“${escape(e.evidence)}”</blockquote><a href="${escape(link(q.source))}">查看对应原文 ↗</a></div>`;
  }).join('');
  return `<details class="record" id="${r.id}"><summary><span class="stock-name">${escape(r.name)}<small>${r.code} · ${escape(r.start)} → ${r.end}${r.status==='floating'?' · 浮盈快照':''}</small></span><span class="profit-rate">+${r.rate.toFixed(2)}%<small>+${money(r.pnl)} 元 · ${r.basis.startsWith('费用前')?'费用前':'含费成本'}</small></span><span class="tags">${tags}</span></summary>
    <div class="record-body"><p>${escape(r.summary)}</p><div class="numbers"><span>对应成本<b>${money(r.cost)} 元</b></span><span>${r.status==='closed'?'该轮盈利':'快照浮盈'}<b>+${money(r.pnl)} 元</b></span><span>计算口径<b>${escape(r.basis)}</b></span></div>${evidence}
    ${r.caveat?`<p class="coverage"><strong>仍需改进 / 适用边界：</strong>${escape(r.caveat)}</p>`:''}
    ${r.assessmentEvidence?`<div class="evidence"><strong>评价依据 · ${escape(r.assessment)}</strong><blockquote>“${escape(r.assessmentEvidence)}”</blockquote><a href="${escape(link(r.quotes.find(q=>q.text.includes(r.assessmentEvidence)).source))}">查看对应原文 ↗</a></div>`:''}
    ${r.assessment==='盈利但不可复制'?'<p class="coverage">保留盈利事实，原文不认可其可复制性，不纳入有效做法排行榜。</p>':''}
    <div class="source-links">${r.sources.map((s,i)=>`<a href="${escape(link(s))}">成交 / 核算来源 ${i+1} ↗</a>`).join('')}<a href="#${r.id}">此轮固定链接</a></div>
    <details class="quote-archive"><summary>关联反思与历史记录 · ${r.quotes.length} 段</summary><p class="subtle">原文保留当时措辞，可能包含早期疑问、后来修正和同页其他交易。上方摘要按本轮与后续明确反思归类；原文提及的盘中涨跌或账户收益不作为本轮收益率。</p>${r.quotes.length?r.quotes.map(q=>`<blockquote class="quote"><p>${escape(q.text)}</p><a href="${escape(link(q.source))}">原复盘 · ${escape(q.source.split('/')[0])} ↗</a></blockquote>`).join(''):'<p>已有公开复盘没有可对应的个股反思文字，暂不推测成功原因。</p>'}</details></div></details>`;
}
function render() {
  const records=scopedRecords(), ranks=rankedFactors(records), tagged=records.filter(r=>r.factors.length).length,
    normal=records.filter(r=>r.assessment==='盈利但不可复制').length, pending=records.length-tagged-normal;
  $('metrics').innerHTML=[['盈利样本',records.length,`${new Set(records.map(r=>r.code)).size} 个不同标的 · 当前筛选范围`],
    ['有依据的有效做法',tagged,'至少一项 · 不代表整轮无瑕疵'],['盈利但不可复制',normal,'原文否定模式 · 不计成功标签'],['待归因',pending,'材料不足 · 不由盈利倒推成功']]
    .map(([title,value,note])=>`<article class="metric"><span>${title}</span><strong>${value}</strong><small>${note}</small></article>`).join('');
  const top=ranks[0], tied=top?ranks.filter(r=>r.count===top.count):[];
  $('insight-title').textContent=top?`${tied.length>1?'并列最多：':'当前最多：'}${tied.map(t=>t.name).join('、')}`:'当前范围还没有可确认的有效做法排名';
  $('insight-copy').textContent=top?`出现 ${top.count} 轮，占当前 ${records.length} 轮盈利样本的 ${(top.count/records.length*100).toFixed(1)}%。${top.rule} 这是现有反思中可确认的频次，不是因果证明，也不是该做法的胜率。`:'可切换范围查看其他样本；缺少归因的记录仍可在下方查看。';
  $('factor-ranks').innerHTML=ranks.length?ranks.map((r,i)=>`<button class="rank" type="button" data-category="${r.id}" aria-pressed="${$('category').value===r.id}"><span class="rank-number">${String(i+1).padStart(2,'0')}</span><span class="rank-title">${r.name}</span><span class="rank-count">${r.count} 轮<small>${(r.count/records.length*100).toFixed(1)}%</small></span><span class="track" aria-hidden="true"><i style="width:${r.count/ranks[0].count*100}%"></i></span></button>`).join(''):'<div class="empty">当前范围暂无有依据的有效做法分类。</div>';
  const groups=new Map();
  records.forEach(r=>{if(!groups.has(r.code))groups.set(r.code,{code:r.code,name:r.name,count:0,pnl:0});const g=groups.get(r.code);g.count++;g.pnl+=r.pnl;});
  $('stock-ranks').innerHTML=Array.from(groups.values()).sort((a,b)=>b.count-a.count||b.pnl-a.pnl).slice(0,7).map((r,i)=>`<div class="stock-rank"><span class="rank-number">${i+1}</span><button type="button" data-stock="${r.code}"><b>${escape(r.name)}</b><small>${r.code} · ${r.count} 轮入选</small></button><div class="amount">${money(r.pnl)}<small>盈利合计 / 元</small></div></div>`).join('')||'<div class="empty">当前范围无盈利样本。</div>';
  const category=$('category').value;
  const visible=records.filter(r=>category==='all'||(category==='nonrepeat'?r.assessment==='盈利但不可复制':category==='pending'?r.assessment==='待归因':r.factors.some(e=>e.category===category)));
  visible.sort($('sort').value==='amount'?(a,b)=>b.pnl-a.pnl:$('sort').value==='recent'?(a,b)=>b.end.localeCompare(a.end)||b.rate-a.rate:(a,b)=>b.rate-a.rate);
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
    const response=await fetch('./data.json?v=20261106-complete');
    if(!response.ok)throw new Error('HTTP '+response.status);
    DATA=await response.json();
    Object.entries(CATEGORIES).forEach(([id,c])=>$('category').insertAdjacentHTML('beforeend',`<option value="${id}">${c.name}</option>`));
    [...new Set(DATA.records.map(r=>r.end.slice(0,7)))].sort().reverse().forEach(m=>$('month').insertAdjacentHTML('beforeend',`<option value="${m}">${m}</option>`));
    for(const id of ['instrument','status','month','category','sort'])$(id).addEventListener('change',render);
    $('search').addEventListener('input',render);
    $('reset').addEventListener('click',()=>{for(const [id,value] of Object.entries({instrument:'stock',status:'closed',month:'all',category:'all',sort:'rate',search:''}))$(id).value=value;render();});
    $('clear-category').addEventListener('click',()=>{$('category').value='all';render();});
    $('factor-ranks').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){$('category').value=b.dataset.category;render();$('records').scrollIntoView();$('category').focus({preventScroll:true});}});
    $('stock-ranks').addEventListener('click',e=>{const b=e.target.closest('[data-stock]');if(b){$('search').value=b.dataset.stock;$('category').value='all';render();$('records').scrollIntoView();}});
    const closed=DATA.records.filter(r=>r.status==='closed'), floating=DATA.records.filter(r=>r.status==='floating');
    $('coverage').textContent=`已扫描 ${DATA.audit.scannedPages.length} 份周/月档案，成交覆盖至 ${DATA.audit.tradesThrough}；共有 ${closed.length} 轮可核算盈利、${floating.length} 条历史浮盈快照（含ETF）。已核对最新成交，未新增满足高于2%阈值的已平仓盈利轮次。没有成本或退出记录的部分不补造收益；分类采用有原文依据的最新反思。`;
    $('audit-details').innerHTML=`<h3>已扫描档案</h3><ul>${DATA.audit.scannedPages.map(p=>`<li><a href="${escape(link(p.source))}">${escape(p.source.replace('/index.html',''))}</a> · ${escape(p.kind)}</li>`).join('')}</ul><h3>未配齐成本的历史卖出</h3><p class="subtle">以下卖出不凭现金流计算盈利率。4月独立报告已核算的轮次另行使用其已补成本。</p><ul>${DATA.audit.unknownCostSales.map(t=>`<li>${t.date} · ${escape(t.name)} ${t.code} · <a href="${escape(link(t.source))}">来源</a></li>`).join('')||'<li>无</li>'}</ul>`;
    $('updated').textContent=DATA.updated;$('load-state').hidden=true;$('content').hidden=false;render();openHash();
    window.addEventListener('hashchange',openHash);
  } catch(error) {
    $('load-state').textContent='档案暂未加载成功，请刷新重试。';
    const retry=document.createElement('button');retry.textContent='刷新重试';retry.addEventListener('click',()=>location.reload());$('load-state').append(retry);
    console.error(error);
  }
}
init();
