const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const card=`<a class="week-card latest-link" href="../2026-10-26_2026-10-30/"><div class="week-head"><h3>10.26-10.30</h3><span class="chip">截至29日 / 待补周五</span></div><p>已录入12笔本周成交，5只股票真实五分钟走势。完整闭环含费盈亏+1,566.43元；襄阳首轮平仓后同价买回600股，新仓与已实现利润分开核算。上周4笔仅作成本参考。</p><div class="mini-grid"><span>完整闭环 <b>+1,566.43</b></span><span>最新可见现金 <b>284.18</b></span><span>本周账户收益 <b>待补</b></span></div></a>`;
let hub=fs.readFileSync(path.join(root,'weekly-trading-review/index.html'),'utf8');
if(!hub.includes('href="../2026-10-26_2026-10-30/"')){
 hub=hub.replaceAll('class="week-card latest-link"','class="week-card"');
 const anchor='<a class="week-card" href="../2026-10-19_2026-10-23/">';assert(hub.includes(anchor));hub=hub.replace(anchor,card+anchor);
 hub=hub.replace('href="../2026-10-19_2026-10-23/">进入最新周复盘','href="../2026-10-26_2026-10-30/">进入最新周复盘');
 hub=hub.replace('最新一期2026.10.19-10.23：13条已成记录、5日账户参考、6张真实五分钟K线及8个反思主题；费用与正式账户日表仍待补充。','最新一期2026.10.26-10.30：截至29日已录入12笔成交、5张真实五分钟走势图；30日交割、账户日表及本周心得待补。');
 hub=hub.replace('<span>周报数量</span><strong class="">23</strong>','<span>周报数量</span><strong class="">24</strong>');
 hub=hub.replace('<span>最新区间</span><strong class="">10.19</strong><small>至 10.23 / 5个交易日</small>','<span>最新区间</span><strong class="">10.26</strong><small>至 10.30 / 已覆盖至29日</small>');
 hub=hub.replace('<span>最新权益参考（费用前）</span><strong class="">10,487.86</strong><small>参考变化 -636.00 / 平均仓位29.98%</small>','<span>最新可见现金</span><strong class="">284.18</strong><small>截至10/29末笔 / 非总资产</small>');
 hub=hub.replace('<span>最新心得</span><strong class="">承接与梯队</strong><small>区分连板与抱团 / 分化与分歧</small>','<span>最新资料状态</span><strong class="">交割初稿</strong><small>周五交割、日表与心得待补</small>');
 fs.writeFileSync(path.join(root,'weekly-trading-review/index.html'),hub);
}
let home=fs.readFileSync(path.join(root,'index.html'),'utf8');
home=home.replace('href="./2026-10-19_2026-10-23/">最新周复盘','href="./2026-10-26_2026-10-30/">最新周复盘');
home=home.replace('最新一期10.19至10.23：13条已成记录、6张真实五分钟K线、逐票归因与8个二次反思主题。新增分化/分歧参与区别、高位抱团先手与承接。','最新一期10.26至10.30：截至29日12笔成交，完整闭环含费盈亏+1,566.43元；周五交割、账户日表与心得待补。');
home=home.replace('<span>周报 <b>23 篇</b></span><span>最新 <b>10.19-10.23</b></span><span>状态 <b>日表与费用待补</b></span>','<span>周报 <b>24 篇</b></span><span>最新 <b>10.26-10.30</b></span><span>状态 <b>截至29日初稿</b></span>');
fs.writeFileSync(path.join(root,'index.html'),home);
console.log('Linked new draft; historical account curves and previous weeks preserved.');
