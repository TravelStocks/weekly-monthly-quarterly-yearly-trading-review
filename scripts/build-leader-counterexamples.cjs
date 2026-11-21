const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../research/market-theme-leader-2026');
const d=require(path.join(root,'data/counterexamples.json')),study=require(path.join(root,'data/study.json'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const pct=v=>'<span class="'+(v>0?'pos':v<0?'neg':'')+'">'+(v>0?'+':'')+v.toFixed(2)+'%</span>';
assert.equal(d.cohort.length,83);assert.equal(d.opening.all.known,83);
const row=(name,s)=>'<tr><td>'+name+'</td><td>'+s.total+'</td><td class="pos">'+s.positive+'</td><td class="neg">'+s.negative+'</td><td>'+s.flat+'</td><td>'+pct(s.mean)+'</td><td>'+pct(s.median)+'</td></tr>';
const stocks=a=>a.map(s=>'<tr><td>'+esc(s.name)+' '+s.code+'</td><td>'+s.boards+'板</td><td>'+s.quote.reference.toFixed(2)+'</td><td>'+s.quote.open.toFixed(2)+'</td><td>'+pct(s.openPct)+'</td><td><a href="'+esc(s.quote.source)+'">日K原接口</a></td></tr>').join('');
const high=d.cohort.filter(s=>s.boards>=3);
const solarRest=d.solar.filter(s=>!['002578','603381','301697','002529'].includes(s.code));
const restMean=solarRest.reduce((s,x)=>s+x.openPct,0)/solarRest.length;
const minfa=study.cases.find(c=>c.id==='minfa');
const solarBefore=minfa.before.strength.find(s=>s.name==='光伏'),solarAfter=minfa.current.strength.find(s=>s.name==='光伏');
const chart=[['昨日涨停池',d.opening.all],['昨日三板及以上',d.opening.high],['昨日光伏涨停池',d.opening.solar]].map(([label,s])=>'<div class="opening-row"><b>'+label+'</b><div class="opening-bar" role="img" aria-label="'+label+'：高开'+s.positive+'只，平开'+s.flat+'只，低开'+s.negative+'只"><span class="up" style="width:'+s.positive/s.total*100+'%">'+s.positive+'</span><span class="flat" style="width:'+s.flat/s.total*100+'%">'+(s.flat||'')+'</span><span class="down" style="width:'+s.negative/s.total*100+'%">'+s.negative+'</span></div><small>'+s.total+'只</small></div>').join('');
const html=`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>反例专项核验：指数、情绪与题材独立性</title><link rel="stylesheet" href="study.css"><style>
.opening-row{display:grid;grid-template-columns:160px minmax(0,1fr) 45px;gap:12px;align-items:center;margin:13px 0}.opening-bar{display:flex;height:30px;overflow:hidden;background:#e7ecef}.opening-bar span{display:flex;align-items:center;justify-content:center;color:white;font-size:12px;min-width:0}.opening-bar .up{background:#c43a2d}.opening-bar .down{background:#07846a}.opening-bar .flat{background:#697783}.audit-image{display:block;width:100%;height:auto;border:1px solid #dce4e9}.decision-table td:first-child{min-width:145px}.plain-list li{margin:12px 0}.source-links a{overflow-wrap:anywhere}@media(max-width:650px){.opening-row{grid-template-columns:105px minmax(0,1fr) 30px;gap:7px;font-size:12px}.opening-bar{height:28px}}
</style></head><body><header><a href="./">返回六组日K对照</a><span>反例专项 / 截止买点可见证据</span><a href="data/counterexamples.json">核算数据</a></header>
<div class="layout"><aside><strong>反例核验</strong><nav><a href="#verdict">先看结论</a><a href="#exceptions">六组逐项筛选</a><a href="#opening">闽发：开盘三层情绪</a><a href="#sequence">09:30:06时序</a><a href="#failed-peer">海源：失败对照</a><a href="#permission">什么才算例外</a><a href="#sources">来源与缺口</a></nav></aside><main>
<section id="verdict"><p class="eyebrow">市场事实 ≠ 交易准入 ≠ 保证赚钱</p><h1>指数弱时走出的龙头<br>哪些是反例，哪些只是事后合理化？</h1>
<p class="lead"><strong>闽发11月6日更接近“市场广泛接力偏弱，跨题材少数高位核心与光伏前排逆势承接”，而不是“大盘差、短线情绪全面强”，也不是“光伏全板块集体转强”。</strong></p>
<p>这是根据开盘截面和封板顺序作出的研究判断。题材相对独立有证据，09:30:06这一笔是否完全符合你可执行的例外规则，仍缺同步盘口与预先固定的例外条件，不能盖章为“确定可以买”。</p>
<div class="summary-strip"><div><span>已经能排除</span><b>全面强情绪</b><small>昨日涨停池83只，56只低开</small></div><div><span>有证据支持</span><b>核心集中、前排独立</b><small>闽发、永臻、浙文涨停开</small></div><div><span>不能倒推</span><b>后来涨了＝当时合格</b><small>成功与失败样本同样纳入</small></div></div>
<p class="notice">分类不是二选一。指数、全市场接力、高位核心、题材前排可能四者分化。没有完整历史情绪快照时，只判断已覆盖的部分；不把“未证明情绪强”偷换成“已证明所有情绪都弱”。本页不修改现有风控纪律，不新增自动开仓例外。</p></section>
<section id="exceptions"><h2>六组案例：真正反驳了什么？</h2><div class="table-wrap"><table class="decision-table"><thead><tr><th>样本 / 研究点</th><th>买前与开盘证据</th><th>反例性质</th><th>能否批准这笔买点？</th></tr></thead><tbody>
<tr><td><a href="index.html#lixin">立新能源</a><br>7月16日起涨 / 7月22日五板</td><td>首板早于指数企稳；但选择的7月22日买点前，21日指数已涨1.79%。22日开盘−0.64%，有低开后的承接待核。</td><td>反驳“下降时不会出现龙头”，不直接反驳“等待修复后再买”。</td><td>22日属于修复后候选，不必硬列为例外。7月20日三板等更早入口另审，不能借后面五板背书。</td></tr>
<tr><td><a href="index.html#chuanzhi">传智教育</a><br>7月29日三板 / 31日五板</td><td>30日指数仍跌0.62%并探低；31日开盘+0.76%，已经有当日修复信号。09:32:03最终回封；本组其他收盘涨停股最早09:40:29才首封。</td><td>“指数未连续企稳，个股先强”的候选；不等于买入时指数仍持续杀跌。31日收盘98只涨停与AI应用扩散是后验。</td><td>7月30日完整强度和全市场梯队缺失；09:32情绪与承接待核。不能借8月5日后指数修复，也不能借后来小弟涨停批准早盘买点。</td></tr>
<tr><td><a href="index.html#baihua">百花医药</a><br>8月7日四板</td><td>5、6日指数先涨1.47%、0.57%；7日微低开0.10%。百花09:31先触板，其他医药股随后扩散。</td><td>不是明显逆市例外，更接近“先有指数修复，再有个股主动带动”。</td><td>可以继续研究原模式，但不能因为属医药就证明“防御行业在差环境下一律可做”。开盘时不预知全天缩量。</td></tr>
<tr><td><a href="index.html#jinjian">金健米业 / 万向德农</a><br>8月25日与27日分开</td><td>25日盘中新低，金健尚未越过旧高9.45；26日指数+0.59%站回MA5，27日近乎平开，农业已有09:25一字助攻。</td><td>25日不宜包装成已确认的新高突破。27日是修复后候选，而非明确的持续下行例外。</td><td>二波与连板三板分别审；8月26日完整强度缺失。不能把金健反包、突破和万向三板并成同一买点。</td></tr>
<tr><td><a href="index.html#longban">龙版传媒</a><br>9月7日六板</td><td>前几日指数偏弱，7日开盘+0.32%；09:30:47首封。前一日市场唯一五板，但AI应用其他收盘涨停股最早09:50:39首封。</td><td>高位核心先强、市场当日修复的候选；不是已证明的“题材先全面强，再推龙头”。</td><td>买点时情绪快照缺失。收盘全市场涨停38→92，AI应用分组却7→6、强度3954→3677，不能把市场修复等同于本题材增强。</td></tr>
<tr><td><a href="index.html#mindong">闽东电力</a><br>9月16日六板</td><td>前日指数−0.54%，16日微低开0.07%；09:36:51首次上板前已有三只同组股首封。但当日最低是否在买点前发生，日K不能回答。</td><td>不是“后续指数反弹证明16日低风险”。有早盘助攻，也不能因为电力标签自动通过。</td><td>初次上板时的指数与情绪仍待核。之后反复开板是逐步新增的失效证据，全天20次开板、13:57才封稳和次日低开，不能提前假装已知，也不能被忽略。</td></tr>
<tr><td><a href="#opening">闽发铝业</a><br>11月6日五板回封</td><td>指数开盘−2.11%且破昨低；昨日涨停池多数低开，少数高位核心强；光伏前排有独立强度。</td><td><strong>最明确的逆指数、分层情绪样本。</strong>但“前排独立”不等于“整体强情绪”或“整个题材普涨”。</td><td>优先列为窄例外研究样本，尚不是已完成验证的交易许可。下面锁定09:30:06逐项核验。</td></tr>
</tbody></table></div><p>严格说，反例包括“规律本身不成立”和“原来的区间归因不成立”两类。后一类不能凑成可交易例外。上述链接保留原日K对照；原研究日期不因后续结果临时移动。</p></section>
<section id="opening"><h2>闽发：先拆开盘时的三层情绪</h2><p>固定样本为<strong>11月5日收盘涨停的83只沪深股票</strong>，再取全部83只11月6日开盘价，不按次日成败筛选。开盘涨跌幅＝开盘价/前收−1。高开/低开按超过±0.01%区分，仅作舍入容差，不是交易阈值。</p>
<p><strong>这是历史日K重建的开盘截面，不是09:30:06实时行情屏。</strong>它可以排除“广泛接力一致高开”的说法，但不能证明开盘六秒后的封单、撤单与所有个股即时状态。</p>
<h3>红：高开　灰：平开　绿：低开</h3>${chart}
<div class="table-wrap"><table><thead><tr><th>固定样本</th><th>总数</th><th>高开</th><th>低开</th><th>平开</th><th>开盘等权均值</th><th>开盘中位数</th></tr></thead><tbody>${row('昨日涨停全部沪深股',d.opening.all)}${row('昨日首板',d.opening.first)}${row('昨日二板',d.opening.second)}${row('昨日三板及以上',d.opening.high)}${row('昨日光伏涨停股（沪深）',d.opening.solar)}</tbody></table></div>
<h3>第一层：广泛接力偏弱，不能叫全面强情绪</h3><p>83只中56只低开，占67.47%；高开仅26.51%，中位数−1.18%。前期情绪锚大业股份、上海九百、大晟文化分别低开约−4.51%、−1.98%、−7.00%。这些是开盘风险信号；三者最终跌停是收盘信息，不能拿最终跌停倒判09:30:06。</p>
<h3>第二层：高位核心分化，确实不是全体崩溃</h3><div class="table-wrap"><table><thead><tr><th>昨日高位股</th><th>昨日板数</th><th>前收</th><th>开盘</th><th>开盘涨幅</th><th>来源</th></tr></thead><tbody>${stocks(high)}</tbody></table></div><p>闽发、永臻、浙文强开；鲁阳低开。浙文属于另一题材，说明不只是光伏单线强，也存在跨题材高位核心集中。不能用“3只强开”替代全部高标持续强：浙文最终回封10:07:58，鲁阳直到14:45:51才首次触板，收盘4只全部晋级不是竞价已经完成。</p>
<h3>第三层：光伏是前排强，不是全板块一致</h3><p>前日光伏分组17只含1只北交所，本开盘比较统一用其中16只沪深股：7只高开、8只低开、1只平开；中位数−0.20%。均值+2.32%主要被闽发、永臻、贝特利、海源抬高，去掉这四只后其余12只均值为${pct(restMean)}。这支持<strong>核心独立承接、内部明显分化</strong>，不支持“后排集体强开”。</p>
<details><summary>逐只核对光伏前日涨停池开盘（包含后来失败者）</summary><div class="table-wrap"><table><thead><tr><th>股票</th><th>昨日板数</th><th>前收</th><th>开盘</th><th>开盘涨幅</th><th>来源</th></tr></thead><tbody>${stocks(d.solar)}</tbody></table></div></details>
<details><summary>完整83只开盘样本，防止只展示赢家</summary><div class="table-wrap"><table><thead><tr><th>股票</th><th>昨日板数</th><th>前收</th><th>开盘</th><th>开盘涨幅</th><th>来源</th></tr></thead><tbody>${stocks(d.cohort)}</tbody></table></div></details>
<div class="finding"><strong>归类结论：</strong>“指数明显弱 + 广泛接力偏弱 + 跨题材高位少数核心强 + 光伏前排独立”。这比“指数差但情绪强”更准确，也比“整个光伏逆势大回流”更克制。它是结构性机会候选，不是全面环境转强。</div></section>
<section id="sequence"><h2>锁住09:30:06：哪些条件真的已经发生？</h2><div class="table-wrap"><table><thead><tr><th>时点</th><th>当时可见 / 后验核对</th><th>不能推出什么</th></tr></thead><tbody>
<tr><td>11月5日收盘</td><td>光伏强度14744、排名1；分组17只。闽发四板、永臻三板、贝特利等二板，前日题材梯队强。</td><td>昨日高潮不是今日一定回流；开盘必须重新核对。</td></tr>
<tr><td>11月6日开盘</td><td>指数3612.15，较3689.91低2.11%，跌破昨低3646.57。闽发5.01、永臻涨停开；贝特利高开13.38%；海源开盘也在涨停价。浙文同为昨日四板且涨停开。</td><td>不能把贝特利高开当作三板已封；不能把市场唯一性或光伏后排全部转强当作已确认。</td></tr>
<tr><td>09:30:06</td><td>用户闽发截图累计成交额3.55亿元，达到用户复盘口径中的2.60亿元观察线（起量板基准是否在下单前已固定，仍需原预案核对），存在回封进攻。永臻从09:25首封且收盘档案开板0次，支持此前助攻。</td><td>只证明本票量与盘口的一帧；不能证明之后不炸板。海源、浙文在这一秒是否仍封稳、撤单情况、指数即时承接仍待核。</td></tr>
<tr><td>09:30:08–09</td><td>城市传媒09:30:08首封，属于另一题材；闽发09:30:09最终回封。</td><td>城市传媒不能算09:30:06之前的助攻；“最终”回封只有收盘后才能知道。</td></tr>
<tr><td>09:31:36–09:34:36</td><td>新能09:31:36、安彩09:32:05、贝特利09:34:06、立新能源09:34:36先后首封。</td><td><strong>这些是回封窗口之后新增的确认，不是早一秒下单时已齐备。</strong>未封板前是否已主动拉升，需补当时分时，不凭缺少首封就断言完全没跟随。</td></tr>
<tr><td>收盘</td><td>光伏排名仍1，但强度${solarBefore.strength}→${solarAfter.strength}（下降${((1-solarAfter.strength/solarBefore.strength)*100).toFixed(2)}%），分组17→6；全市场涨停83→32、跌停0→15。</td><td>用于检验“内部收缩、核心抱团”的判断，不用于提前否决或批准09:30:06。不能把“相对第一”误写成绝对扩散。</td></tr>
</tbody></table></div><figure><img class="audit-image" src="../../2026-11-02_2026-11-06/images/minfa-reseal.png" alt="用户提供的闽发铝业09:30:06回放截图，显示累计成交额3.55亿元和回封盘口" loading="lazy"><figcaption class="chart-note">保留用户原始标注，不把图中文字“高胜率”“必须进”当作统计验证。该图只覆盖闽发本票，不覆盖全市场同秒状态。</figcaption></figure>
<p><strong>两条不能同时偷用的逻辑：</strong>如果你的模式要求“后排首板和完整梯队已经确认”，09:30:06尚未具备这些已封板证据；如果改为“前日强题材、今日前排逆势就足够试错”，这是另一套更窄、容错更低的例外，需要事先定义并另行验证。不能为了保住这次早买的结论，事后把条件换掉。</p></section>
<section id="failed-peer"><h2>必须一起看海源复材：同题材、强开，也会失败</h2><p>海源前日二板，11月6日开盘7.39元、前收6.72元，约+9.97%，当日最高7.39元，收盘6.60元（−1.79%）。从开盘价到收盘约−10.69%，均未计费税。其“光伏+强开”信号并不能保证成功。</p>
<p>这不意味着海源等同闽发：海源是较低身位竞争者，闽发是本题材最高连续板；后者还多了五板换手回封的本票盘口证据。这个失败对照的作用是<strong>否定“题材有一字、我这只也强开，所以都能买”的泛化</strong>，不是用海源收盘失败提前证明它09:30:06已经走弱。</p>
<p>此前封板顺序表只覆盖收盘成功股，会漏掉海源这种早盘强、最终失败的样本。本次已补回开盘池；但海源打开涨停的精确秒数仍缺失，所以不能把它计为09:30:06“持续封稳的助攻”，也不能提前计为当时已失败的反证。</p></section>
<section id="permission"><h2>“真正可做的例外”先通过这张审查表</h2><p>以下是<strong>待验证的例外研究框架</strong>，不是已经获得你授权的新交易模式。当前纪律仍优先：指数与情绪共振下行不新开普通中高位接力仓；有分层分化时先查证，不能自行把它升级成强天时。</p>
<div class="table-wrap"><table class="decision-table"><thead><tr><th>类型</th><th>买前必须看到的证据</th><th>闽发11月6日对应</th><th>当前结论</th></tr></thead><tbody>
<tr><td>A 指数弱、广泛短线情绪强</td><td>预先固定的昨日涨停池与高标观察池，多数有正反馈；不是仅一两只核心强。买点前仍保持，失败票不被剔除。</td><td>83只中56只低开，中位数负；老情绪锚也低开。</td><td><strong>不支持归入A。</strong>不能凭最高板晋级说情绪全面强。</td></tr>
<tr><td>B 指数与广泛接力弱，题材核心独立</td><td>题材前日基础、同日不止本票的独立承接、核心主动性、非核心失败反馈及本票买点均要核；需区分“已有助攻”与“期待后排跟上”。</td><td>前日光伏最强；闽发、永臻、贝特利开盘相对强，但整体题材分化，海源同秒状态缺失。</td><td><strong>最接近B，列优先研究。</strong>不能据此批准近满仓，也不能证明这一秒已经满足完整例外条件。</td></tr>
<tr><td>C 只有本票冲，没有题材或核心承接</td><td>如果移除本票，独立强度证据消失，或助攻撤退、本票放量仍无法修复，就是孤立脉冲风险。</td><td>永臻等提供了本票之外的前置信号，因此不是纯单票独舞；但持续性仍要逐秒验证。</td><td>不把“不是C”直接等同“B已通过”。</td></tr>
</tbody></table></div>
<h3>在看次日结果之前，先写下</h3><ol class="plain-list"><li><strong>固定观察池和时点：</strong>昨天选哪些情绪锚、同题材核心、较低身位与失败候选；核对到哪一秒。不能事后只留闽发、删海源。</li><li><strong>固定买点要求：</strong>到底要求前排独立即可，还是要求后排首板/题材广度回流？若要求后者，就接受09:30窗口可能错过，不把后面的信号搬回来。</li><li><strong>固定取消条件：</strong>助攻打开后无承接、主要竞争者转负、本票放量回封失败、市场负反馈扩散时怎么处理。具体时限与阈值须由你的模式确认，不由本页补造。</li><li><strong>固定风险预算：</strong>先看本周是否曾亏到5%；触线则本周新增预算0。未触线且例外最终获得确认，也不能把弱环境小仓试错升级成强环境满仓；更严规则优先，例外规则未确认就只观察。</li><li><strong>再验结果：</strong>同时记录同信号失败样本、可成交性、次日退出与真实盈亏。不能用两只后来涨了的票来估计胜率，也不把未买到的涨停计成利润。</li></ol>
<div class="risk"><h3>现在可以确定的结论</h3><p>“指数不好就绝对不会有龙头”不成立；“出现龙头就说明买点值得做”同样不成立。闽发给出的研究方向是<strong>弱大环境中的核心集中和局部独立</strong>，不是一条已证实高胜率的防御行业特权。</p><p>当前材料不足以认定09:30:06就是“纪律内确定可做的例外”。这不等于当时一定不能赚，只意味着不能用后来赚到钱替代当时尚缺的确认。<strong>安全边界先定，买点才能验；例外不能在错过上涨后临时发明。</strong></p></div></section>
<section id="sources"><h2>核算来源、时序边界与补充清单</h2><ul class="plain-list"><li>开盘样本：短线侠11月5日完整沪深涨停池83只；非“含北交所84只”的口径。光伏分组17只中北交所酉立智能不纳入沪深16只开盘统计。首板62、二板17、三板及以上4，合计83。不存在缺失开盘价按0填充。</li><li>价格：腾讯不复权日K，按11月5日前收、6日开盘重算；72只复用指定日已归档数据，其余按同源补齐。完整83只及三只额外情绪锚的来源地址、原始字段均保留在<a href="data/counterexamples.json">核算JSON</a>。开盘价是历史可重建事实，不是保存下来的整屏实时行情。</li><li>指数、题材、封板顺序：沿用<a href="data/research.json">原研究档案</a>。收盘市场涨跌停和炸板数据复用东方财富指定日池；本页同口径为83→32涨停、0→15跌停、47→13炸板。不同网站出现84/33或14/17炸板等，不混为同一分母；炸板率下降也不单独代表情绪增强。</li><li>11月6日光伏强度下降75.04%、家数收缩，是<strong>收盘结果</strong>；不充当09:30买点的前置信号。同理，次日跌停或后来七板都不能反写当时决策。</li><li>新尝试海源历史1分钟接口，指定11月6日却返回11月20日数据，日期不匹配已拒用。没有拿近端分钟线冒充历史分时。即使有09:31分钟K，仍不能定位09:30:06的撤单和开板先后。</li><li><strong>优先补：</strong>11月6日09:24–09:35带时间轴回放，至少包含指数、闽发、永臻、海源、贝特利、浙文及昨日涨停池实时反馈；再补当日事前竞价预案与例外定义。闽发本票截图已具备，但不能替代这些横向证据。</li><li>其他案例：传智前日7月30日完整题材强度和全市场梯队、农业8月26日完整强度缺失；龙版、闽东买点秒级市场与情绪状态未取得。不因此补造“强情绪”，也不把盘后市场上涨当盘前已知。</li></ul>
<p class="source-links">交叉核对：<a href="https://finance.eastmoney.com/a/202607313827695864.html">东方财富Choice：传智7月31日竞价快照</a>（09:35发布，不能把发布时间当09:26已读新闻）；<a href="https://static.cninfo.com.cn/finalpage/2026-11-07/1225662241.PDF">闽发11月7日异动公告</a>；<a href="https://static.cninfo.com.cn/finalpage/2026-11-07/1225662145.PDF">浙文11月7日公告</a>；<a href="https://static.cninfo.com.cn/finalpage/2026-09-09/1225554689.PDF">龙版9月9日起停牌公告</a>。公告仅核验日期/风险，不作为披露前的买入依据。龙版9月9日日K缺口对应停牌，原图仍不补造价格。</p>
<p class="muted">本文为对既有模式的历史核验，不保证盈利或卖出可成交；没有估算模拟满仓收益。所有“可研究”与“已符合开仓纪律”严格分开。</p></section>
</main></div></body></html>`;
fs.writeFileSync(path.join(root,'counterexamples.html'),html+'\n');
assert(html.includes('56只低开')&&html.includes('海源')&&html.includes('09:30:06'));
console.log('Built counterexamples.html; opening cohort:',d.cohort.length,'solar:',d.solar.length);
