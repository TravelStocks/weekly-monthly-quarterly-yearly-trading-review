from __future__ import annotations

from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MONTHLY_DIR = ROOT / "monthly-quarterly-trading-review"
OUT_DIR = MONTHLY_DIR / "2026-08"
OUT_PATH = OUT_DIR / "index.html"
INDEX_PATH = MONTHLY_DIR / "index.html"


SUMMARY_POINTS = [
    "8月不是大亏月份，而是防守明显进步、进攻没有完全打出来的月份；整月约-1%，回撤控制比前几个月明显改善。",
    "最大遗憾不是亏多，而是传智教育、百花医药、深中华A、千金药业等关键大肉机会没有充分做到。",
    "核心矛盾从“看不懂”变成“看懂但执行不到位”：扫板/排板、同批次PK切换、板上确认和失败撤退需要机械化。",
]

GOOD_POINTS = [
    "回撤控制明显改善，整月约-1%，没有因为单笔错误扩大成月度大亏。",
    "华西股份这种失败案例能用动态跌停条件单及时离场，亏损约-2%可以接受。",
    "很多亏损不是模式大错，而是模式失败后的正常止损，说明风控端开始稳定。",
    "已经能区分“买点没错但市场不认”和“模式本身不该做”，复盘质量提高。",
]

FIX_POINTS = [
    "扫板和排板能力不足，传智教育、百花医药这种核心票看到了但没进去。",
    "没有把同批爆量弱转强标的统一PK，风范股份弱了以后没有及时切到百花医药。",
    "汉森制药断板后，没有第一时间从补涨/不被继续认可的票切到更强最高标深中华A。",
    "百花医药二波走弱后仍加仓和坚守，违反了“二波不续强就撤”的纪律。",
    "金健米业亏损放大来自动态跌停条件单没有设好，执行细节仍要机械化。",
    "科技方向不应按连板接力做，当前能力圈更适合短线投机和最高标抱团。",
]

MODES = [
    ("一进二", "新题材早期套利，抢题材最强身位。", "新题材刚出来时，2板只做题材最强、最有辨识度、最主动的标的。", "后排跟风、题材不新、竞价不强、3板无法转强。", "千金药业、农业方向早期观察"),
    ("二进三/三板", "重要观察节点，可做但难度高。", "3板爆量弱转强或明显放量，有题材最强和身位优势时可试。", "三板时信息不够充分，市场里可能已有更好的高标。", "金健米业3板、百花医药3板"),
    ("3板及以上爆量弱转强", "本战法主战场。", "3-5板有辨识度、最高标或题材最强标，爆量弱转强回封板初步建仓。", "看懂但不扫、只观察；次日不确认还硬拿。", "传智教育、百花医药、风范股份、汉森制药、深中华A"),
    ("最高标抱团", "题材不一定最强，但身位、辨识度和盘口最强。", "最高标爆量弱转强，跨过5板后继续强，优先做最强，不做次高。", "题材弱时不能当强题材主线处理，只能按抱团和承接处理。", "深中华A vs 楚天龙"),
    ("补涨龙", "前龙之后的情绪补涨，天然受高度压制。", "首板、2板、3板优先；4板以后谨慎，除非脱离补涨走新周期。", "把补涨龙按总龙头高度预期，4板以后硬追。", "澳洋健康、神奇制药、汉森制药早期"),
    ("龙头二波首板", "老龙头二波启动试错。", "首板可试；次日必须续强，才考虑继续拿或推进。", "不续强还加仓、走弱还坚守。", "百花医药二波"),
]

NODES = [
    ("首板", "二波启动只可试，不可恋战", "二波首板可以试仓，但不能直接定义成二波成功；次日必须续强，低开、走弱、往跌停方向走就撤。"),
    ("一进二", "新题材最强套利", "只做新题材、新催化、新周期中最强的2板；不做后排跟风，不做题材内身位落后的票。"),
    ("三板", "可做但必须全市场比较", "三板爆量弱转强若同时具备题材最强、身位优势、市场辨识度，可以试；若有更高标和更强盘口，优先级下降。"),
    ("四板", "舒服确认区，但要区分总龙和补涨", "总龙头、新题材最强标、全市场最高标的4板爆量弱转强可以做；补涨龙4板已经接近常规高度上限。"),
    ("五板", "成龙与脱离补涨的关键节点", "跨过5板后，市场认可度、最高标抱团属性和龙头确认意义明显提高；补涨龙也可能尝试脱离补涨身份。"),
    ("六板", "最高标继续确认", "如果5板已经跨过去，且仍是全市场最高标、盘口承接强、题材能支撑，6板仍可作为龙头确认或抱团继续节点。"),
    ("七到八板", "监管压制与极致分歧", "接近100%异动监管压制线，不能只看强，要看监管距离、承接强度、题材持续性和是否过度一致。"),
]

RULES = [
    ("爆量弱转强当天", "回封板建仓", "价值在于拿先手；如果次日转强确认，原始仓位已有利润垫，后面更容易拿得住。"),
    ("次日转强确认", "只做板上，不做竞价和半路", "竞价高开是预期，不是成交确认；冲板过程是验证，不是结果；封住或回封才是确认。"),
    ("同批次PK", "弱的卖，强的切", "3板及以上爆量弱转强品种必须统一观察，比较高开、上板顺序、盘口承接、题材顺度和身位。"),
    ("龙头二波首板", "启动可试，不续强就撤", "二波首板不是无条件加仓点；如果后续没有续强，甚至往跌停方向走，就说明短线资金已转弱。"),
    ("补涨龙", "低位参与，高位除非脱离", "前龙如果7板，补涨龙3-4板就接近常规高度上限；首板、2板、3板优先，5板脱离再另看。"),
]

CASES = [
    ("传智教育", "错失", "8月第一周核心大肉。看到了爆量弱转强，但扫板和排板能力不足，没有排进去；如果在5板爆量弱转强节点进去，后面利润空间会完全不同。", "最高标爆量弱转强不能只观察，必须提前准备扫板/排板。"),
    ("风范股份", "切换不够", "3板爆量弱转强、4板缩量转强确认，买点逻辑不是原则性错误；次日低开严重不及预期，应卖弱并切向百花医药。", "持仓低开弱，竞品高开强，就要卖弱切强。"),
    ("百花医药", "没吃舒服", "3板/4板是最好的参与窗口；二波首板可以试，但后续没有续强、往跌停方向走时不能加仓坚守。", "二波首板不是信仰点，不续强就撤，走弱不加仓。"),
    ("华西股份", "小亏可接受", "爆量弱转强后次日没有转强确认，科技题材持续性不足；亏损约-2%，动态跌停条件单处理较好。", "错了一个板走，不把小亏拖成大亏。"),
    ("深中华A", "该切未切", "4板爆量，5板爆量弱转强，且是更高身位标的；题材虽弱，但盘口承接、上板顺序、分时表现强于楚天龙。", "题材弱也可以做最高标抱团，有最强做最强，不做次高。"),
    ("楚天龙", "次高不优先", "同批次里与深中华A对比，题材节奏、盘口承接、身位表现都偏弱，炸板反复、封板不稳。", "同批PK时，不做次高标，不做盘口弱于最强者的票。"),
    ("汉森制药", "5板确认有效", "4板更像补涨阶段，5板跨过后才有脱离补涨、尝试走下一个周期的确认意义；8月27日转强加仓吃到大肉。", "补涨龙若跨过5板并具备唯一高标属性，可以按新周期确认看。"),
    ("澳洋健康", "补涨高位", "医药补涨龙，4板爆量弱转强从盘口角度有逻辑，但补涨龙高度通常约为前龙一半，4板已接近上限。", "补涨龙4板以后性价比下降，最好做首板、2板、3板。"),
    ("神奇制药", "体系外超预期", "名牌补涨龙，3板时可以看，4板才真正爆量则偏晚；后续行情超预期，不应倒推为体系内必须追。", "超出体系的利润可以错过，不用为非体系机会改变纪律。"),
    ("金健米业", "条件单问题", "农业新题材最强标，3板和4板买点有逻辑；5板受题材共振走弱拖累，亏损放大来自动态跌停条件单没有设好。", "选股和买点可以没错，但题材走弱和条件单缺失会让正确买点变被动亏损。"),
    ("明月（待确认）", "半路反面", "差一点上板，但板上仍有约6000万未解决，随后转头下杀。", "差一点封板不是确认，必须等板上扫板或回封。"),
    ("千金药业", "应重点关注", "爆量弱转强机会较好，甚至2板就应该重点关注，属于本月进攻端没有充分做到的机会之一。", "一进二/二板套利与三板以上爆量弱转强要衔接起来。"),
    ("万向德农与新龙股份（待确认）", "题材内排序", "农业方向里万向德农相对更强，新龙股份在它后面，优先级不如题材最高标。", "做题材就做题材最高标、身位优势标，不做后排。"),
]

DRAGON_DIMS = [
    ("身位", "是否是题材内最高标，或全市场最高标。", "优先最高标，不做次高标。"),
    ("领涨性", "是否主动带动题材，而不是被题材推着走。", "主动上板、先于同批标的上板者优先。"),
    ("抗跌性", "分歧时是否承接住，是否比同批标的更抗跌。", "主力流出仍承接住、分时不破坏者加分。"),
    ("市场性", "是否被全市场短线资金识别，而非只在板块内有名。", "弱题材也可能凭市场辨识度走抱团。"),
    ("价值性", "是否有催化、逻辑或题材支撑，哪怕只是小支线。", "题材强加分，题材弱则只能按抱团做。"),
    ("题材内唯一性", "是否是本题材第一选择。", "做题材就做题材最高、最强、最先确认。"),
    ("题材间高度唯一性", "是否是跨题材比较后的唯一最高标。", "最高标抱团优先级高于普通题材跟风。"),
    ("监管距离", "是否接近7-8板或100%异动监管压制区。", "高位必须降低盲目加仓，重点看承接和分歧。"),
    ("量能健康", "爆量是否发生在3-5板合理区，而不是高位第一次放量。", "3-4板放量可接受，高位第一次放量更危险。"),
]

SOP = [
    ("盘前准备", [
        "列出所有3板及3板以上标的，标注板数、题材、身位、是否最高标、是否爆量弱转强。",
        "单独列出一进二候选，只保留新题材里最强、最主动、最有身位优势的标的。",
        "把标的分成总龙、补涨龙、最高标抱团、二波首板、趋势票五类，不混用买法。",
        "给持仓票提前设置失败退出条件，尤其是动态跌停、破位或走弱条件单。",
        "准备同批次PK表：同一日爆量弱转强的标的，次日必须横向比较。",
    ]),
    ("竞价检查", [
        "持仓票是否高开超预期、平开符合预期，还是低开严重不及预期。",
        "同批票里是否出现比持仓更强的高开、强承接或题材更顺的标的。",
        "如果持仓严重低开且竞品明显强，优先考虑卖弱切强。",
        "竞价只能定预期，不能直接替代板上确认；加仓不能只凭竞价完成。",
    ]),
    ("开盘到封板", [
        "爆量弱转强当天，等回封板或板上扫板建立先手。",
        "次日转强确认，必须等板上封住或回封确认，再考虑加仓或切换。",
        "看到冲高但没封住，不做半路点火，明月案例就是反面样本。",
        "若低开不及预期、承接弱、题材走弱，按计划撤，不等幻想修复。",
    ]),
    ("收盘复盘", [
        "每笔交易分为做对、做错、没做到三类，不只看盈亏。",
        "记录是否符合节点：一进二、三板、四板、五板、六板、七到八板。",
        "记录有没有执行同批次PK，有没有做弱强切换。",
        "记录条件单是否执行，是否出现该走没走、走弱加仓。",
        "把次日所有爆量弱转强标的继续放入同一张PK表。",
    ]),
]

BANS = [
    ("看懂不扫", "最高标一旦加速，后面买点会变差。", "传智教育、百花医药", "爆量弱转强回封时提前准备扫板/排板。"),
    ("只看持仓不看同批", "持仓弱不代表市场没机会，强票可能已经胜出。", "风范股份 vs 百花医药", "同批次PK，卖弱切强。"),
    ("做次高标", "短线资金优先抱团最高、最强、最有辨识度标的。", "楚天龙弱于深中华A", "有最高标做最高标。"),
    ("竞价加仓", "竞价是预期，不是封板确认。", "金健米业风险、明月案例", "只在板上扫板或回封确认加仓。"),
    ("半路点火", "差一点封板也可能转头A杀。", "明月（待确认）", "等封住或回封。"),
    ("二波走弱还加仓", "二波不续强说明资金不认。", "百花医药8月28日", "不续强撤，走弱割。"),
    ("补涨龙4板以后硬追", "补涨高度受前龙压制，4板附近性价比下降。", "澳洋健康、神奇制药", "补涨龙首板、2板、3板优先，5板脱离再另看。"),
    ("科技连板追高", "科技更偏趋势，当前不适合短线接力硬做。", "华西股份及6月科技趋势经验", "科技做ETF/趋势核心/分仓，不单吊连板。"),
    ("条件单缺失", "模式失败后会把小亏拖成大亏。", "金健米业", "建仓后同步设置失败退出条件。"),
]

RULE_CARDS = [
    ("买点", "一进二做新题材最强套利；3板及以上进入爆量弱转强主战场；4板更舒服但要区分总龙和补涨；5板是成龙或脱离补涨节点；次日加仓只在板上扫板或回封确认。"),
    ("卖点", "低开严重不及预期走；断板走；题材共振走弱降预期；二波不续强走；走弱不加仓；条件单必须前置。"),
    ("选股", "有最强做最强，有最高标做最高标，不做次高标。题材强时做题材龙头，题材弱时只做最高标抱团，补涨龙低位做，高位除非脱离，科技趋势不按连板硬追。"),
    ("最终纪律", "下月不是增加交易次数，而是把该做的核心机会做到：盘前列池，竞价PK，板上确认，弱强切换，失败条件单结束。"),
]

PENDING = [
    "“明月”具体标的名称待确认。",
    "“新龙股份”具体名称待确认，可能存在语音识别误差。",
    "“利辛”或此前月份主升案例名称待确认。",
    "深中华A主力净额流出1.71亿等资金数据待外部核验。",
    "8月28日等具体交易日以用户口述为主，后续如需正式归档可再用行情数据校正。",
]


def h(text: str) -> str:
    return escape(str(text), quote=True)


def list_items(items: list[str]) -> str:
    return "".join(f"<li>{h(item)}</li>" for item in items)


def table(headers: list[str], rows: list[tuple[str, ...]], class_name: str = "") -> str:
    head = "".join(f"<th>{h(header)}</th>" for header in headers)
    body = "".join(
        "<tr>" + "".join(f"<td>{h(cell)}</td>" for cell in row) + "</tr>"
        for row in rows
    )
    cls = f' class="{class_name}"' if class_name else ""
    return f'<div class="table-wrap"><table{cls}><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'


def card(title: str, body: str, chip: str | None = None) -> str:
    chip_html = f'<span class="chip">{h(chip)}</span>' if chip else ""
    return f'<article class="card"><div class="card-head"><h3>{h(title)}</h3>{chip_html}</div><p>{h(body)}</p></article>'


def render() -> str:
    mode_cards = "".join(card(name, f"{position} {buy} 风险：{risk} 案例：{example}", "模式") for name, position, buy, risk, example in MODES)
    rule_cards = "".join(card(name, f"{action}。{body}", "动作") for name, action, body in RULES)
    case_cards = "".join(
        f'<article class="case-card"><div class="case-title"><h3>{h(name)}</h3><span class="chip warn">{h(tag)}</span></div><p>{h(body)}</p><p><strong>规则沉淀：</strong>{h(rule)}</p></article>'
        for name, tag, body, rule in CASES
    )
    sop_sections = "".join(
        f'<article class="sop-card"><h3>{h(title)}</h3><ol>{list_items(items)}</ol></article>'
        for title, items in SOP
    )
    rule_card_html = "".join(
        f'<article class="rule-card"><h3>{h(title)}</h3><p>{h(body)}</p></article>'
        for title, body in RULE_CARDS
    )

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>2026年8月月度交易复盘｜战法手册版</title>
  <style>
    :root{{--bg:#f5f6f8;--paper:#fff;--ink:#17202a;--muted:#667085;--line:#dde4eb;--soft:#f6f8fa;--accent:#bd3d2a;--accent-soft:#fff1ed;--blue:#1d4ed8;--green:#137a5a;--red:#b4232f;--amber:#a15c07;--shadow:0 18px 44px rgba(23,32,42,.08);--radius:8px}}
    *{{box-sizing:border-box}}html{{scroll-behavior:smooth;overflow-x:hidden}}body{{margin:0;background:linear-gradient(180deg,#fafbfc 0%,#eef2f6 100%);color:var(--ink);font-family:"Avenir Next","PingFang SC","Noto Sans SC","Microsoft YaHei",Arial,sans-serif;overflow-x:hidden}}a{{color:inherit}}h1,h2,h3,p{{margin-top:0;letter-spacing:0}}h1{{margin:12px 0;font-size:clamp(32px,4vw,56px);line-height:1.06}}h2{{font-size:24px;margin-bottom:8px}}h3{{font-size:18px;margin-bottom:8px}}p,li,td{{color:var(--muted);line-height:1.68}}strong{{color:var(--ink)}}.shell{{width:min(1460px,calc(100vw - 24px));margin:0 auto;padding:18px 0 54px;display:grid;gap:18px}}.page-layout{{display:grid;grid-template-columns:230px minmax(0,1fr);gap:18px;align-items:start}}.sidebar{{position:sticky;top:18px}}.sidebar-inner,.hero,.panel,.card,.case-card,.sop-card,.rule-card{{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);min-width:0}}.sidebar-inner{{padding:14px;display:grid;gap:12px}}.sidebar-brand{{display:grid;gap:3px;padding:10px 10px 12px;text-decoration:none;border-bottom:1px solid var(--line)}}.sidebar-brand span{{color:var(--muted);font-size:12px;font-weight:800}}.sidebar-brand strong{{font-size:20px;line-height:1.18}}.side-nav{{display:grid;gap:6px}}.side-nav a{{min-height:40px;display:flex;align-items:center;padding:9px 10px;border-radius:8px;color:var(--muted);font-size:14px;font-weight:800;text-decoration:none}}.side-nav a:hover,.side-nav a:focus-visible{{background:#f8fafc;color:var(--ink);outline:2px solid transparent}}.side-nav a.primary{{background:var(--ink);color:#fff}}.content{{display:grid;gap:18px;min-width:0}}.hero{{padding:30px;display:grid;grid-template-columns:1.05fr .95fr;gap:24px;align-items:stretch}}.label,.chip{{display:inline-flex;width:max-content;max-width:100%;align-items:center;min-height:28px;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;overflow-wrap:anywhere}}.label{{color:var(--accent);background:var(--accent-soft)}}.chip{{background:#eef2ff;color:#344054;white-space:nowrap}}.chip.warn{{background:#fff7ed;color:#9a3412}}.chip.pos{{background:#ecfdf3;color:#067647}}.chip.neg{{background:#fef2f2;color:#991b1b}}.nav{{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}}.button{{min-height:44px;display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:8px;text-decoration:none;background:var(--ink);color:#fff;font-weight:800}}.button.secondary{{background:#fff;color:var(--ink);border:1px solid var(--line)}}.metrics{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}.metric{{min-height:116px;padding:16px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;display:grid;align-content:space-between}}.metric span,.metric small{{color:var(--muted);font-size:12px;line-height:1.45}}.metric strong{{font-size:25px;overflow-wrap:anywhere}}.panel{{padding:22px;overflow:hidden}}.section-note{{margin-bottom:16px;color:var(--muted)}}.grid-2{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}}.grid-3{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}}.card,.case-card,.sop-card,.rule-card{{box-shadow:none;padding:16px;background:#f8fafc}}.card-head,.case-title{{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}}.card p,.case-card p,.rule-card p{{margin-bottom:0}}.case-grid{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}.sop-grid{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}}.rule-grid{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}}.lead-list{{margin:0;padding-left:20px}}.table-wrap{{width:100%;overflow:auto;border:1px solid var(--line);border-radius:8px;background:#fff}}table{{width:100%;min-width:980px;border-collapse:collapse;font-size:13px}}th,td{{padding:12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}}th{{color:var(--muted);background:#f8fafc;font-size:13px}}tr:last-child td{{border-bottom:0}}.axis{{display:grid;grid-template-columns:repeat(7,minmax(124px,1fr));gap:8px;overflow:auto;padding-bottom:2px}}.axis-item{{min-height:126px;padding:12px;border:1px solid var(--line);border-radius:8px;background:#fff}}.axis-item b{{display:block;font-size:22px;color:var(--accent);margin-bottom:6px}}.source-box{{border:1px solid #f2d39c;background:#fffaf0;border-radius:8px;padding:14px}}.source-box p{{margin:0}}.pending{{margin:0;padding-left:20px}}.pos{{color:var(--green)}}.neg{{color:var(--red)}}.warn{{color:var(--amber)}}@media(max-width:1120px){{.page-layout,.hero,.grid-2,.grid-3,.sop-grid,.rule-grid{{grid-template-columns:1fr}}.sidebar{{position:static}}.side-nav{{grid-template-columns:repeat(4,minmax(0,1fr))}}.case-grid{{grid-template-columns:1fr}}}}@media(max-width:720px){{.shell{{width:min(100vw - 16px,1460px);padding-top:12px}}.hero,.panel{{padding:18px}}.metrics,.side-nav{{grid-template-columns:1fr}}.nav{{display:grid;grid-template-columns:1fr 1fr}}.button{{width:100%;padding-left:10px;padding-right:10px}}h1{{font-size:33px}}.card-head,.case-title{{flex-wrap:wrap}}.axis{{grid-template-columns:1fr;overflow:visible}}table{{min-width:780px;font-size:12px}}}}
  </style>
</head>
<body>
  <main class="shell">
    <div class="page-layout">
      <aside class="sidebar" aria-label="八月复盘导航">
        <div class="sidebar-inner">
          <a class="sidebar-brand" href="#top"><span>2026年8月</span><strong>月度复盘</strong></a>
          <nav class="side-nav" aria-label="本页导航">
            <a class="primary" href="#top">本月概览</a>
            <a href="#position">核心矛盾</a>
            <a href="#modes">战法框架</a>
            <a href="#nodes">板数节点</a>
            <a href="#actions">买卖动作</a>
            <a href="#cases">关键案例</a>
            <a href="#dragon">七维核验</a>
            <a href="#sop">执行SOP</a>
            <a href="#bans">禁止清单</a>
            <a href="#rules">规则卡</a>
            <a href="#pending">待确认</a>
          </nav>
          <nav class="side-nav">
            <a href="../">月度导航</a>
            <a href="../../weekly-trading-review/">周度主页</a>
            <a href="../../index.html">总首页</a>
          </nav>
        </div>
      </aside>
      <div class="content">
        <section class="hero" id="top">
          <div>
            <span class="label">Monthly Trading Review · 战法手册版</span>
            <h1>2026年8月月度交易复盘</h1>
            <p>最高标抱团 / 爆量弱转强 / 同批次PK切换 / 补涨龙边界 / 二波首板 / 一进二套利</p>
            <div class="source-box"><p><strong>口径说明：</strong>本页依据《2026年8月交易战法手册-增强版》整理，保留用户口述判断；未额外抓取行情、龙虎榜、主力净额或异动监管数据。逐笔成交、分钟线买卖点和外部核验数据后续可继续补齐。</p></div>
            <div class="nav">
              <a class="button" href="../">返回月度导航</a>
              <a class="button secondary" href="../../weekly-trading-review/">周度主页</a>
            </div>
          </div>
          <div class="metrics">
            <article class="metric"><span>月度状态</span><strong>防守进步</strong><small>错误数量减少，亏损没有扩大</small></article>
            <article class="metric"><span>账户结果</span><strong class="neg">约 -1%</strong><small>以口述复盘为准，待成交数据核验</small></article>
            <article class="metric"><span>核心矛盾</span><strong>看懂但没做到</strong><small>扫板、排板、切换与确认动作待强化</small></article>
            <article class="metric"><span>下月主题</span><strong>把核心机会做到</strong><small>盘前列池、竞价PK、板上确认、失败撤退</small></article>
          </div>
        </section>
        <section class="panel" id="position">
          <h2>月度定位与核心矛盾</h2>
          <p class="section-note">增强版手册的重点不是增加交易次数，而是把“该做的核心机会”标准化。</p>
          <div class="grid-3">{''.join(card(f"结论 {idx}", point) for idx, point in enumerate(SUMMARY_POINTS, 1))}</div>
          <div class="grid-2" style="margin-top:14px">
            <article class="card"><div class="card-head"><h3>本月做得最好的地方</h3><span class="chip pos">Keep</span></div><ul class="lead-list">{list_items(GOOD_POINTS)}</ul></article>
            <article class="card"><div class="card-head"><h3>本月最需要修正的地方</h3><span class="chip neg">Improve</span></div><ul class="lead-list">{list_items(FIX_POINTS)}</ul></article>
          </div>
        </section>
        <section class="panel" id="modes">
          <h2>战法总框架</h2>
          <p class="section-note">这套战法不是单纯打板，而是围绕短线情绪周期中的最高标、辨识度、爆量弱转强、次日确认、题材强弱和临盘切换建立组合打法。</p>
          <div class="grid-3">{mode_cards}</div>
        </section>
        <section class="panel" id="nodes">
          <h2>板数节点体系</h2>
          <p class="section-note">节点不是死记板数，而是判断赔率、确认度、监管压力和补涨高度边界。</p>
          <div class="axis">{''.join(f'<article class="axis-item"><b>{h(node)}</b><strong>{h(title)}</strong><p>{h(body)}</p></article>' for node, title, body in NODES)}</div>
        </section>
        <section class="panel" id="actions">
          <h2>核心买点与动作规范</h2>
          <p class="section-note">买入靠回封确认，持有靠次日转强确认，失败靠条件单和走弱即走结束。</p>
          <div class="grid-3">{rule_cards}</div>
        </section>
        <section class="panel" id="cases">
          <h2>关键案例详解</h2>
          <p class="section-note">每个案例都落到一个可执行规则：要么下次必须做，要么下次必须撤。</p>
          <div class="case-grid">{case_cards}</div>
        </section>
        <section class="panel" id="dragon">
          <h2>龙头七维与辅助核验</h2>
          <p class="section-note">七维不是为了写报告好看，而是为了临盘做取舍：同批次里到底做谁、卖谁、切谁。</p>
          {table(["维度", "判断含义", "临盘用途"], DRAGON_DIMS, "audit-table")}
        </section>
        <section class="panel" id="sop">
          <h2>临盘执行SOP</h2>
          <p class="section-note">盘前定池，竞价PK，板上确认，收盘归因。</p>
          <div class="sop-grid">{sop_sections}</div>
        </section>
        <section class="panel" id="bans">
          <h2>禁止清单</h2>
          <p class="section-note">这些不是情绪化否定，而是本月已经付过成本的系统红线。</p>
          {table(["禁止项", "为什么禁止", "本月反面样本", "替代动作"], BANS, "ban-table")}
        </section>
        <section class="panel" id="rules">
          <h2>一页规则卡</h2>
          <p class="section-note">下月不是增加交易次数，而是把该做的核心机会做到。</p>
          <div class="rule-grid">{rule_card_html}</div>
        </section>
        <section class="panel" id="pending">
          <h2>待确认与后续补充</h2>
          <p class="section-note">正式归档或升级为逐笔成交页前，需要补充行情与交易流水核验。</p>
          <ul class="pending">{list_items(PENDING)}</ul>
        </section>
      </div>
    </div>
  </main>
</body>
</html>
"""


def update_navigation() -> None:
    html = INDEX_PATH.read_text(encoding="utf-8")
    august_placeholders = [
        '<a class="month-card disabled" aria-disabled="true"><div class="card-head"><h3>2026年8月</h3><span class="chip ">待补</span></div><p>等待对应自然月周复盘和月末持仓数据。</p></a>',
        '<a class="month-card disabled" aria-disabled="true"><div class="card-head"><h3>2026年8月</h3><span class="chip warn">Q3草案</span></div><p>已纳入Q3滚动二次反思；8月截至08.15，完整自然月待月底和9月5-10日整理。</p></a>',
    ]
    new_august = '<a class="month-card active" href="./2026-08/"><div class="card-head"><h3>2026年8月</h3><span class="chip warn">战法手册</span></div><p>已生成战法手册版月度复盘：最高标抱团、爆量弱转强、同批次PK与下月执行SOP；逐笔成交待补。</p></a>'
    for placeholder in august_placeholders:
        if placeholder in html:
            html = html.replace(placeholder, new_august)
            break
    else:
        if new_august not in html:
            raise RuntimeError("Could not find the August card.")

    if 'href="./2026-q3/"' not in html:
        raise RuntimeError("Could not find the Q3 navigation link from the latest index.")
    INDEX_PATH.write_text(html, encoding="utf-8", newline="")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(render(), encoding="utf-8", newline="\n")
    update_navigation()
    print(OUT_PATH)


if __name__ == "__main__":
    main()
