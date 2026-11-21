const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'../research/market-theme-leader-2026');
const raw=JSON.parse(fs.readFileSync(path.join(root,'data/research.json'),'utf8'));
const fallbackFile=path.join(root,'data/archive-theme-fallback.json');
const archivePath='C:/Users/Administrator/Desktop/Codex/leader-cycle-archive/data/daily-limit-ups.js';
let fallback=fs.existsSync(fallbackFile)?JSON.parse(fs.readFileSync(fallbackFile,'utf8')):{records:[]};
if(fs.existsSync(archivePath)){
 const context={window:{}};vm.runInNewContext(fs.readFileSync(archivePath,'utf8'),context);
 const archived=context.window.LEADER_CYCLE_DAILY_LIMIT_UPS;
 const selected=new Set(['lixin-power-2026-07','chuanzhi-ai-2026-08','baihua-medicine-2026-08','wanxiang-agri-2026-09']);
 const money=x=>{const n=Number.parseFloat(x);return Number.isFinite(n)?n*(String(x).includes('亿')?1e8:String(x).includes('万')?1e4:1):null;};
 fallback={source:archived.endpoint,sourceName:archived.sourceName,archivedAt:archived.generatedAt,scope:'仅已归档的单题材分组，不是全市场涨停池',records:[]};
 for(const [id,cycle]of Object.entries(archived.cycles))if(selected.has(id))for(const record of Object.values(cycle.records)){
  const date=record.sourceDate.split('-').map((p,i)=>i?p.padStart(2,'0'):p).join('-');
  const group={name:record.plate,count:record.count,catalyst:record.catalyst,archived:true,archivedAt:archived.generatedAt,archiveSource:archived.endpoint,stocks:record.stocks.map(s=>({code:s.code,name:s.name,boards:Number(s.streak),pct:Number.parseFloat(s.pct),amount:money(s.amount),turnover:Number.parseFloat(s.turnover),firstSeal:s.firstSeal,lastSeal:s.lastSeal,opens:Number(s.openCount),reason:s.reason}))};
  assert.equal(group.stocks.length,group.count);fallback.records.push({date,group,original:record});
 }
 fs.writeFileSync(fallbackFile,JSON.stringify(fallback,null,2)+'\n');
}
const plans={
 lixin:{group:1,date:'2026-07-22',title:'四板分歧后的五板转强',level:'有前置修复证据，盘中确认待核',market:'7月21日收涨1.79%，收盘重新站上当日MA5，给7月22日盘前提供了修复证据；但22日仍低开0.64%，不能直接判成强天时。',logic:'7月21日四板成交额15.79亿元、反复开板；22日开盘10.90元高于前高10.01元，是能在开盘识别的向上缺口。研究点放在五板主动转强，而不是把16日首板解释成企稳之后才诞生。',trigger:'开盘缺口有效、早盘电力助攻出现，且指数低开后不继续恶化，再观察09:32附近的主动上板。盘中成交速度与承接仍需当时分时或盘口证明。',reject:'7月20日三板时，前一交易日指数刚跌3.05%；当日也曾创新低，不能用随后21日的大阳线批准20日重仓。7月21日爆量与17次开板是分歧证据，不是开盘时已知的缩量确认。',alternatives:[['2026-07-20','三板左侧观察','前一日大跌，天时未完成修复；不作为强环境大仓买点。'],['2026-07-21','四板分歧','收盘才知道大盘修复成功；当日个股反复开板。']],themeKey:'电力'},
 chuanzhi:{group:2,date:'2026-07-31',title:'三板一字不可假定成交，五板T回封另审',level:'题材强，指数只属短暂修复',market:'7月30日指数仍跌0.62%，低点继续下探，盘前没有连续企稳证据。31日高开0.76%只构成开盘修复信号，不等于下跌波段已结束。',logic:'7月29日是三板一字，事后看是缩量确认，但没有可成交证明；7月31日五板涨停开后T字换手，是另一种量能要求，不能与前者混写。',trigger:'按31日涨停开后的分歧回封研究：前排、题材助攻以及指数修复需同步成立；不能等全天3.60亿元成交后再说09:32已经量够。',reject:'三板一字只记确认点、不是保证能买到的点。五板回封属于弱环境下条件观察，不因为后来八板就放行左侧重仓。',alternatives:[['2026-07-29','三板一字确认','开盘即涨停，排队成交未知；盘前指数仍处低位反复。'],['2026-07-30','四板快速上板','不同于极致缩量一字；缺少当时盘口，不能补造半路成交。']],themeKey:'AI应用'},
 baihua:{group:2,date:'2026-08-07',title:'三板爆量分歧，四板缺口转强',level:'八只样本中前置环境较匹配',market:'8月5日、6日指数连续上涨1.47%、0.57%；截至6日已站上MA5且均线向上。7日开盘仅微低0.10%，前置环境比传智7月29日、31日更好，不能把两只票笼统算同一种天时。',logic:'8月6日三板成交额11.89亿元、反复开板；7日开盘10.25元，超过前高9.58元，缺口约6.99%，符合先分歧、后开盘超预期的研究结构。',trigger:'盘前有市场修复背景，竞价有个股缺口，随后核主动买单与医药跟随。若自己先上板，题材后扩散，应按主动带动型研究，不能把下午小弟涨停视作竞价已存在的助攻。',reject:'7日全天成交额6.28亿元、成交量约前日0.48倍是收盘结论；不能提前叫作“竞价已确认全天极致缩量”。5、6板的一字/T字不能假定无限量可买。',alternatives:[['2026-08-06','三板爆量','天时已修复，但个股仍在分歧；与7日右侧确认分开。'],['2026-08-10','五板一字','加速与可成交性是两件事；不把买不到的板计入策略收益。']],themeKey:'医药'},
 jinjian:{group:3,date:'2026-08-27',title:'断板反包与越过旧高分开验证',level:'8月25日不等于突破前高',market:'8月25日指数只涨0.19%，盘中低点3850.86低于24日3855.35；26日才收回MA5。27日盘前有一日修复证据，尚不能叫持续强趋势。',logic:'8月21日旧高9.45元。25日涨停9.31元仍未越过，属于断板后的再涨停，不能记为平台新高突破。26日盘中最高10.01元越过旧高但未封板；27日开盘10.30元再越过26日高点，是更清楚的右侧研究位置。',trigger:'按二波主动性研究：开盘越过已知10.01元压力，回落不失去突破结构并获农业梯队支持，再核承接；没有逐笔分时，不能指定当天最低9.91元为“可精准买到的回踩点”。',reject:'27日盘中曾跌至9.91元，说明开盘缺口并非全程不回补。不得把全天缩量和最终涨停反推开盘无风险；也不能把25日“7天5板”当连续五板。',alternatives:[['2026-08-25','断板再涨停','未越过8月21日9.45元高点，不是新高突破确认。'],['2026-08-26','盘中越过旧高','当天最高10.01元，收9.80元，日线不能定位首次突破时刻或承接。']],themeKey:'农业'},
 wanxiang:{group:3,date:'2026-08-27',title:'新一轮二进三，跳空快速转强',level:'较匹配的右侧候选，仍需题材时序',market:'8月26日指数收涨0.59%，站回MA5；27日几乎平开。买前可见的是修复尝试，27日最终涨1.13%是后验加强而非竞价依据。',logic:'8月25日为新一轮首板，26日二板放量换手；27日三板开盘10.45元，超过前高9.54元约9.54%，随后快速触板。8月19日旧二板失败与本轮连续板必须断开统计。',trigger:'缺口、前排和农业承接共振时观察三板确认；特别核同题材是否有更高连板竞争者，而不是把金健的多日多板标签当同口径连板高度。',reject:'8月28日四板一字，不能假定可成交。27日全天成交量约前日0.34倍只能事后复核，开盘需用当时竞价和成交速度。',alternatives:[['2026-08-26','二板换手','个股仍在放量确认过程中。'],['2026-08-28','四板一字加速','是持仓加速观察，不自动成为无持仓者的可执行买点。']],themeKey:'农业'},
 longban:{group:4,date:'2026-09-07',title:'五板缩量后六板缺口，不能忽略高位风险',level:'指数横盘偏弱，不属于强天时',market:'9月2日至4日指数收盘持续位于MA5下方，4日再跌0.30%且低点下移；“高位横盘”不等于环境已经强。7日开盘高0.32%，只能记修复尝试。',logic:'8月31日首板，9月3日四板成交额6.76亿元；4日五板全天成交额4.95亿元，但只高开0.57%，并不是明显超预期竞价缺口。7日六板开16.56元，较前高15.55元高6.50%，才更接近明确缺口确认。',trigger:'研究六板高位右侧时必须核传媒题材回流、前一日同身位竞争和市场情绪；不能只见个股缺口就忽略指数偏弱。',reject:'不把9月4日最终缩量涨停说成9:25就已确认。六板已经高位，后续9月8日触及涨停但收盘未封，不是第七个连续涨停。9月9日行情缺口另标，不补线。',alternatives:[['2026-09-03','四板放量','左侧承接考验，非缩量转强节点。'],['2026-09-04','五板缩量候选','早盘只小幅高开，全天缩量属于收盘信息；需分时确认，不能仅用日线批准。']],themeKey:'文化传媒'},
 mindong:{group:5,date:'2026-09-16',title:'五板分歧后的六板，恰是反例检查',level:'买前指数尚未企稳，次日负反馈',market:'9月15日指数仍跌0.54%，低于MA5，盘前不能确认下跌结束；16日开盘再微低0.07%，当天盘中还创阶段新低3842.72。18日至22日的后续反弹不能倒用于16日。',logic:'本轮9月9日首板、15日五板、16日六板。15日成交额22.11亿元；16日开盘17.22元，高于前高16.80元约2.50%，只能作为弱环境下的小缺口转强候选，而非强环境大仓节点。',trigger:'在指数止跌和电力实际回流未被盘中确认前，研究结论是等待或放弃。仅凭“唯一高板+前日放量”不够。',reject:'17日开16.64元，较16日收盘低约9.96%，虽日内回升也已断板。18日涨9.07%而非涨停；不能把9月16日至22日整段指数反弹等同于这只票有低风险连板买点。',alternatives:[['2026-09-11','三板T字','指数当日跌1.18%；需先查盘前与盘中环境，不能因后面六板反推早买正确。'],['2026-09-18','断板后反弹','不属于连续第八板；二波/反包需单独核，不用后续涨幅证明16日合规。']],themeKey:'电力'},
 minfa:{group:6,date:'2026-11-06',title:'五板T字回封：个股超预期，不等于天时强',level:'明显逆势候选，不能批准重仓',market:'11月4日指数大涨2.16%、5日微涨0.10%，盘前有短暂修复背景；但6日开盘3612.15点，较昨收低2.11%，已跌破前日低点3646.57。开盘已知环境恶化，无需等收盘才否定“天时强”。',logic:'11月2日首板、5日四板一字、6日五板T字、9日六板、10日七板。6日涨停开5.01元超预期，但需要换手完成量能，不能把涨停开等同于直接无量加速成功。',trigger:'用户提供09:30:06盘口显示累计成交额3.55亿元，09:30:09已回封；这些是该时点个股证据。仍需核当时光伏助攻顺序及指数承接，不能用收盘题材第一替代早盘确认。',reject:'光伏11月5日收盘强度14744、6日3680，排名都第一但绝对强度下降约75%；涨停家数也由17降至6。相对最强与绝对扩散不同。前一日浙文影业同为四板，闽发不是全市场唯一最高板。',alternatives:[['2026-11-04','三板放量','当日大盘最终大涨不代表开盘已确认。'],['2026-11-09','六板一字开后换手','高度与前期获利盘增加；不能把“错过五板”变成六板加仓理由。']],themeKey:'光伏'}
};
// Preserve the user's category while explicitly mapping the provider's taxonomy.
plans.longban.themeKey='AI应用';
plans.longban.sourceNote='本人归类为文化传媒；短线侠在本研究日前后将龙版传媒列入AI应用涨停分组，因此强度比较使用AI应用，不把两个分类无声混用。';
plans.mindong.themeKey='风电';
plans.mindong.sourceNote='本人归类为电力；短线侠本期涨停分组为风电/电力，强度榜以风电作为相关观察项，同时保留完整前10榜。风电缺席前10不等于整个电力强度为0。';
plans.mindong.auditNote='关键反证：9月15日五板开板28次，16日六板仍开板20次，最终13:57:27才封住。即使全天成交量降至前日约0.74倍，也不能把它归为干净的缩量转强确认；16日收盘已能看到分歧未消失，17日再低开近跌停。';
plans.minfa.referenceTime='09:30:06';
plans.minfa.referenceLabel='用户截图时刻，不是实际成交时刻';
plans.minfa.auditNote='超重点时序修正：09:30:06的回封过程中，永臻股份已在09:25一字助攻；但新能股份09:31:36、安彩高科09:32:05、立新能源09:34:36才首次封板，贝特利09:34:06才首封。因此不能把当天后排首板与梯队最终回流，全部当成09:30:06已确认的条件。';
plans.chuanzhi.referenceTime='09:32:03';
plans.chuanzhi.referenceLabel='收盘档案的最终回封时刻，仅作先后复核，不是假定下单时刻';
plans.lixin.auditNote='电力收盘11只涨停不等于09:32:57已有完整助攻。首封更早的是新能股份09:32:03、长缆科技09:32:36；重要三进四华银电力直到14:41才首次封板，不能倒算成早盘已晋级。';
function previous(date){let a=raw.quotes['000001'].bars,i=a.findIndex(x=>x.date===date);return a[i-1]?.date;}
function stockAt(code,date){return raw.quotes[code].bars.find(x=>x.date===date);}
function capitalAt(c,date){
 const file=path.join(root,'data/raw',date+'-themes.json'),plain=s=>s.replace(/<[^>]+>/g,'').trim();
 if(fs.existsSync(file)){
  const html=JSON.parse(fs.readFileSync(file,'utf8')).payload.html;
  for(const table of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)){
   const heads=[...table[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map(x=>plain(x[1]));
   for(const row of table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>x[1]);
    if(cells[0]?.match(/code=['"](\d{6})/)?.[1]!==c.code)continue;
    const get=k=>plain(cells[heads.indexOf(k)]||'');
    return {actualFloat:get('实际流通'),floatMarket:get('流通市值'),total:get('总市值'),source:'当日短线侠收盘分组，原字段单位'};
   }
  }
 }
 const old=fallback.records.find(r=>r.date===date&&r.original.stocks.some(s=>s.code===c.code))?.original.stocks.find(s=>s.code===c.code);
 return old?{actualFloat:old.floatCap,floatMarket:old.floatMarketCap,total:old.totalMarketCap,source:'2026-09-06保存的短线侠历史收盘分组'}:null;
}
function marketAt(date){const a=raw.quotes['000001'].bars,i=a.findIndex(x=>x.date===date),b=a[i];if(!b)return null;const ma=n=>a.slice(i-n+1,i+1).reduce((s,x)=>s+x.close,0)/n;return {...b,ma5:ma(5),ma10:ma(10),priorClose:a[i-1]?.close,openingPct:(b.open/a[i-1].close-1)*100,previousLow:a[i-1]?.low};}
function groupAt(c,date){const d=raw.days[date];return d?.themes?.find(t=>t.stocks.some(s=>s.code===c.code))||d?.themes?.find(t=>t.name.includes(c.theme))||fallback.records.find(r=>r.date===date&&(r.group.stocks.some(s=>s.code===c.code)||r.group.name.includes(c.theme)))?.group;}
function dayEvidence(c,date){const d=raw.days[date],g=groupAt(c,date),s=stockAt(c.code,date),p=stockAt(c.code,previous(date));return {date,market:marketAt(date),stock:s,priorStock:p,capital:capitalAt(c,date),strength:d?.strength||[],theme:g||null,allThemes:d?.themes?.map(t=>({name:t.name,count:t.count}))||[],pool:d?.pool?.stocks||[],missing:[!d?.strength?'题材强度缺失':null,!d?.themes?'全市场涨停梯队缺失':null,!s?'个股日K缺失':null].filter(Boolean)};}
const cases=raw.cases.map(c=>{const p=plans[c.id];let from=c.id==='mindong'?'2026-09-07':c.from;return {...c,...p,from,previous:previous(p.date),before:dayEvidence(c,previous(p.date)),current:dayEvidence(c,p.date),timeline:raw.quotes['000001'].bars.filter(b=>b.date>=from&&b.date<=c.to).map(b=>dayEvidence(c,b.date)),stockBars:raw.quotes[c.code].bars.filter(b=>b.date>=from&&b.date<=c.to),indexBars:raw.quotes['000001'].bars.filter(b=>b.date>=from&&b.date<=c.to).map(b=>marketAt(b.date)),alternatives:p.alternatives.map(([date,title,note])=>({date,title,note,evidence:dayEvidence(c,date)}))};});
for(const c of cases){assert(c.current.stock&&c.before.stock);for(const b of c.stockBars)assert(b.low<=Math.min(b.open,b.close)&&b.high>=Math.max(b.open,b.close));}
const study={generatedAt:new Date().toISOString(),title:'天时 · 地利 · 个股：六组买点核验',cases,sources:{index:raw.quotes['000001'].source,stocks:Object.fromEntries(raw.cases.map(c=>[c.code,raw.quotes[c.code].source])),strength:'https://v.duanxianxia.com/api/getPlateRotatData',ladder:'https://v.duanxianxia.com/api/getFupanByYidong'},coverage:{quoteCount:Object.keys(raw.quotes).length,themeDates:Object.keys(raw.days).length,strengthDates:Object.values(raw.days).filter(d=>d.strength).length,ladderDates:Object.values(raw.days).filter(d=>d.themes).length,missing:Object.values(raw.days).filter(d=>!d.strength||!d.themes).map(d=>({date:d.date,strength:!!d.strength,ladder:!!d.themes}))}};
fs.writeFileSync(path.join(root,'data/study.json'),JSON.stringify(study,null,2)+'\n');
fs.writeFileSync(path.join(root,'data/study.js'),'window.STUDY='+JSON.stringify(study)+';\n');
const csv=['股票,代码,研究日期,前日指数涨幅,当日指数开盘涨幅,当日指数收盘涨幅,个股开盘,前日个股最高,当日成交额亿元,前日成交额亿元,结论',...cases.map(c=>[c.name,c.code,c.date,c.before.market.pct,c.current.market.openingPct.toFixed(2),c.current.market.pct,c.current.stock.open,c.before.stock.high,(c.current.stock.amount/1e8).toFixed(2),(c.before.stock.amount/1e8).toFixed(2),c.level].join(','))].join('\n');
fs.writeFileSync(path.join(root,'data/candidates.csv'),'\uFEFF'+csv+'\n');
console.log('Built',cases.length,'stock studies;',study.coverage);
