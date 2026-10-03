from __future__ import annotations

import json
from html import escape
from pathlib import Path

from august_trade_data import load_trade_data, money


ROOT = Path(__file__).resolve().parents[1]
MONTHLY_DIR = ROOT / "monthly-quarterly-trading-review"
OUT_DIR = MONTHLY_DIR / "2026-08"
OUT_PATH = OUT_DIR / "index.html"
INDEX_PATH = MONTHLY_DIR / "index.html"


SUMMARY_POINTS = [
    "用户口述认为8月防守进步、进攻没有完全打出来，整月约-1%；当前截图只覆盖部分交易，该整月判断仍待完整流水、资产与出入金核验。",
    "最大遗憾不是亏多，而是传智教育、百花医药、深中华A、千金药业等关键大肉机会没有充分做到。",
    "核心矛盾从“看不懂”变成“看懂但执行不到位”：扫板/排板、同批次PK切换、板上确认和失败撤退需要机械化。",
]

GOOD_POINTS = [
    "口述认为回撤控制明显改善；整月约-1%的估计尚未用完整账户数据核验。",
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
    "补齐8月1日至31日完整成交、7月末与8月末持仓及账户总资产、期间出入金，核验整月收益和回撤；现金余额不能替代总资产。",
    "补齐秦安股份100股、风华高科100股的后续卖出或期末估值；当前仅能确认截图内买入成本。",
    "一鸣食品7月31日买入、8月3日卖出，+15.97元是整段持有期盈亏；计算八月自然月贡献还需7月末估值。",
    "本截图未覆盖汉森制药8月27日、百花医药8月28日等后半月交易；这些手册案例仍需对应流水。",
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


def table(headers: list[str], rows: list[tuple[str, ...]], class_name: str = "", row_classes: list[str] | None = None) -> str:
    head = "".join(f'<th scope="col">{h(header)}</th>' for header in headers)
    body = "".join(
        (f'<tr class="{h(row_classes[index])}">' if row_classes else "<tr>")
        + "".join(f"<td>{h(cell)}</td>" for cell in row) + "</tr>"
        for index, row in enumerate(rows)
    )
    cls = f' class="{class_name}"' if class_name else ""
    return f'<div class="table-wrap"><table{cls}><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'


def card(title: str, body: str, chip: str | None = None) -> str:
    chip_html = f'<span class="chip">{h(chip)}</span>' if chip else ""
    return f'<article class="card"><div class="card-head"><h3>{h(title)}</h3>{chip_html}</div><p>{h(body)}</p></article>'


def render_transactions(rows: list[dict], summary: dict) -> str:
    biggest_profit = max(summary["closed_trades"], key=lambda item: item["net_pnl"])
    biggest_loss = min(summary["closed_trades"], key=lambda item: item["net_pnl"])
    biggest_open = max(summary["open_trades"], key=lambda item: item["buy_cost"])
    reference_loss = min(summary["reference_closed_trades"], key=lambda item: item["net_pnl"])
    focus_labels = {}
    for item, label, tone in [
        (biggest_profit, "八月盈利重点", "profit"),
        (biggest_loss, "八月亏损重点", "loss"),
        (reference_loss, "七月大额亏损", "reference"),
        (biggest_open, "大额未闭合", "cash"),
    ]:
        for source_row in item["source_rows"]:
            focus_labels[source_row] = (label, tone)
    profit_tags = {biggest_profit["code"]: "盈利重点", biggest_loss["code"]: "亏损重点"}
    closed_rows = [(
        profit_tags.get(item["code"], "其他闭合"),
        f"{item['name']} / {item['code']}",
        f"{item['buy_date']} → {item['sell_date']}" + ("（跨月）" if item["cross_month"] else ""),
        str(item["quantity"]), f"{item['buy_average']:.3f} → {item['sell_average']:.3f}",
        money(item["buy_cost"]), money(item["sell_proceeds"]), money(item["total_cost"]),
        money(item["net_pnl"], signed=True), f"{item['return_pct']:+.2f}%",
    ) for item in summary["closed_trades"]]
    closed_classes = [
        "focus-profit" if item is biggest_profit else "focus-loss" if item is biggest_loss else ""
        for item in summary["closed_trades"]
    ]
    open_rows = [(
        "大额未闭合" if item is biggest_open else "未闭合",
        f"{item['name']} / {item['code']}", item["buy_date"], str(item["quantity"]),
        money(item["buy_cost"]), "后续卖出或期末持仓待补；浮盈浮亏未计入",
    ) for item in summary["open_trades"]]
    ledger_rows = []
    for row in rows:
        label, tone = focus_labels.get(row["row_id"], ("", ""))
        if abs(row["cash_flow"]) >= 5000:
            flow_label = "大额流出" if row["is_buy"] else "大额回款"
            label = f"{label} · {flow_label}" if label else flow_label
            tone = tone or "cash"
        cells = [
            row["row_id"], label or "—", row["trade_date"], row["trade_time"], row["code"], row["name"],
            row["side"], row["quantity"], f"{row['price']:.3f}", money(row["amount"]),
            money(row["commission"]), money(row["stamp_tax"]), money(row["other_fees"]),
            money(row["cash_flow"], signed=True), money(row["cash_balance"]),
            row["market"], row["settlement_date"],
        ]
        period = row["trade_date"][:7]
        hidden = " hidden" if period != "2026-08" else ""
        direction = "buy" if row["is_buy"] else "sell"
        ledger_rows.append(
            f'<tr class="focus-{tone}" data-focus="{str(bool(label)).lower()}" data-period="{period}" data-code="{row["code"]}" data-side="{direction}"{hidden}>'
            + "".join(f"<td>{h(cell)}</td>" for cell in cells) + "</tr>"
        )
    headers = ["行号", "重点标记", "成交日期", "成交时间", "代码", "名称", "操作", "数量", "价格", "成交金额", "手续费", "印花税", "其他杂费", "发生金额", "现金余额", "市场", "交收日期"]
    symbols = {row["code"]: row["name"] for row in rows}
    symbol_options = "".join(f'<option value="{code}">{h(name)} {code}</option>' for code, name in sorted(symbols.items()))
    return f"""
        <section class="panel trade-panel" id="trade-summary">
          <h2>实际交易数据与净盈亏</h2>
          <p class="section-note">来源：用户提供的券商交易截图，逐行核对。查询区间为7月26日至8月16日，可见成交为7月27日至8月13日；其中八月26条、七月参考16条，尚未覆盖完整自然月。</p>
          <div class="trade-metrics">
            <div><span>八月可见成交</span><strong>{summary['month_row_count']}条 / {summary['month_symbol_count']}个标的</strong><small>买入{summary['month_buy_count']}条，卖出{summary['month_sell_count']}条</small></div>
            <div><span>可核验闭合净盈亏</span><strong class="pos">{money(summary['closed_net_pnl'], True)}元</strong><small>6组交易；按发生金额含费用</small></div>
            <div><span>八月买入成交额</span><strong>{money(summary['month_buy_amount'])}元</strong><small>卖出成交额 {money(summary['month_sell_amount'])}元</small></div>
            <div><span>八月可见成交费用</span><strong>{money(summary['month_total_cost'])}元</strong><small>手续费130.00元，印花税17.57元</small></div>
          </div>
          <div class="trade-highlights" id="trade-highlights">
            <h3>关键盈亏与大额资金变化</h3>
            <div class="focus-line focus-profit"><div><span class="focus-label">八月可见闭合样本最大盈利</span><h4>{h(biggest_profit['name'])}</h4><p>买入成本{money(biggest_profit['buy_cost'])}元 → 净回款{money(biggest_profit['sell_proceeds'])}元；{biggest_profit['quantity']}股，{biggest_profit['buy_date']}至{biggest_profit['sell_date']}。</p></div><div class="focus-value"><strong>{money(biggest_profit['net_pnl'], True)}元</strong><span>{biggest_profit['return_pct']:+.2f}%</span></div></div>
            <div class="focus-line focus-loss"><div><span class="focus-label">八月可见闭合样本最大亏损 / 最大投入</span><h4>{h(biggest_loss['name'])}</h4><p>买入成本{money(biggest_loss['buy_cost'])}元 → 净回款{money(biggest_loss['sell_proceeds'])}元；{biggest_loss['quantity']}股，{biggest_loss['buy_date']}至{biggest_loss['sell_date']}。</p></div><div class="focus-value"><strong>{money(biggest_loss['net_pnl'], True)}元</strong><span>{biggest_loss['return_pct']:+.2f}%</span></div></div>
            <div class="focus-line focus-cash"><div><span class="focus-label">大额资金占用 / 盈亏待确认</span><h4>{h(biggest_open['name'])}</h4><p>{biggest_open['buy_date']}买入{biggest_open['quantity']}股；截图未见对应卖出，后续持仓和估值待补。</p></div><div class="focus-value"><strong>{money(biggest_open['buy_cost'])}元</strong><span>买入现金成本</span></div></div>
            <p class="focus-insight"><strong>盈利集中：</strong>扣除{h(biggest_profit['name'])}这组盈利，其他5组闭合交易净盈亏合计为{money(summary['closed_net_pnl'] - biggest_profit['net_pnl'], True)}元。</p>
            <details class="reference-highlight"><summary>七月参考：{h(reference_loss['name'])}大额亏损 {money(reference_loss['net_pnl'], True)}元</summary><p>{reference_loss['buy_date']}至{reference_loss['sell_date']}共{reference_loss['quantity']}股，买入现金成本{money(reference_loss['buy_cost'])}元、卖出净回款{money(reference_loss['sell_proceeds'])}元，含费用净亏{money(-reference_loss['net_pnl'])}元（{reference_loss['return_pct']:+.2f}%）。这是七月已闭合交易，不计入八月+1,054.03元汇总；对应原始成交已标记为“七月大额亏损”。</p></details>
          </div>
          <p class="data-basis"><strong>盈亏口径：</strong>只统计买卖成本完整可见、在八月卖出的6组交易。买卖均在八月的5组净盈亏为{money(summary['within_month_pnl'], True)}元；一鸣食品跨月整段盈亏为{money(summary['cross_month_pnl'], True)}元。它们不能代替整月账户收益。截图现金余额为可用资金，不含持仓市值。</p>
          {table(["重点", "标的", "买入 → 卖出", "数量", "成交均价", "买入现金成本", "卖出净回款", "全部费用", "净盈亏（元）", "成本收益率"], closed_rows, "pnl-table", closed_classes)}
          <p class="data-footnote">成本收益率＝净盈亏÷含费用买入成本。费用按成交金额与发生金额差额计算；八月发生金额与截图已列费用合计另有0.67元差额，沿用原发生金额，不推测费用名称。均价由成交金额÷数量计算，原始显示价格保留在下方明细。</p>
          <h3>截图内未闭合交易</h3>
          {table(["重点", "标的", "可见买入日期", "未配对数量", "含费用成本（元）", "状态"], open_rows, "open-table", ["focus-cash" if item is biggest_open else "" for item in summary["open_trades"]])}
          <p class="data-footnote">未配对数量只表示本截图缺少对应卖出，不等同于8月末持仓。七月的立新能源、长缆科技不并入八月盈亏；哈药股份缺少买入成本。</p>
        </section>
        <section class="panel trade-panel" id="trade-ledger">
          <div class="ledger-heading"><div><h2>逐笔成交明细</h2><p class="section-note">42条截图原始记录全部保留；同时间、同价格的多条成交分别计费，未合并。</p></div><div class="download-links"><a href="./trades.csv" download>下载成交CSV</a><a href="./trade-summary.json" download>下载盈亏汇总</a></div></div>
          <div class="ledger-filters">
            <label>月份<select id="ledger-period"><option value="2026-08">八月成交</option><option value="2026-07">七月跨月参考</option><option value="all">全部记录</option></select></label>
            <label>标的<select id="ledger-symbol"><option value="all">全部标的</option>{symbol_options}</select></label>
            <label>操作<select id="ledger-side"><option value="all">全部操作</option><option value="buy">买入（含对方买入）</option><option value="sell">卖出</option></select></label>
            <label class="focus-toggle"><input type="checkbox" id="ledger-focus">仅看重点交易</label>
            <p id="ledger-count" role="status" aria-live="polite">显示26 / 42条</p>
          </div>
          <p class="data-footnote">重点标记：八月最大盈利、最大亏损、大额未闭合及七月大额亏损；另标记单笔发生金额绝对值≥5,000元的资金流出或回款。大额回款是现金流，不等于单笔盈利。</p>
          <div class="table-wrap ledger-wrap" tabindex="0" role="region" aria-label="逐笔成交明细，可横向滚动">
            <table class="ledger-table"><caption class="sr-only">券商截图成交明细；金额单位为元，数量为股或基金份额</caption><thead><tr>{''.join(f'<th scope="col">{h(item)}</th>' for item in headers)}</tr></thead><tbody>{''.join(ledger_rows)}</tbody></table>
          </div>
          <p id="ledger-empty" hidden>当前条件没有成交记录。</p>
        </section>
        <section class="panel trade-panel" id="trade-reflections">
          <h2>从实际成交回看执行</h2>
          <div class="trade-reflection"><h3>百花医药：盈利最大，买入性质仍需确认</h3><p>8月11日09:25以12.750元分三条买入900股；8月12日09:33:05、14:01:25、14:56:08以14.030元分三条卖出，净赚1,115.44元，成本收益率+9.71%。流水能确认竞价成交和分批退出；是否属于建仓或加仓、是否符合当时节点，需要当日计划和分钟线核验。手册中“二波走弱加仓”的后半月案例尚未出现在本截图。</p></div>
          <div class="trade-reflection"><h3>风范股份：控制了单笔亏损，切换动作待核验</h3><p>8月6日09:38至13:07共六条买入1,800股，成交价7.160元；8月10日09:37:22全部卖出，净亏327.55元，成本收益率-2.54%。六条买入手续费合计30元。实际亏损幅度可核验；低开、条件单和是否及时卖弱切强，还需分钟线及当时决策记录。</p></div>
          <div class="trade-reflection"><h3>科技ETF与隔夜套利：按实际净利润评价</h3><p>半导体设备ETF于8月3日买入5,000份、8月4日分三条卖出，净赚105.40元；科创半导体ETF同期买入3,600份并分三条卖出，净赚64.90元。亨通光电8月12日至13日100股净赚79.87元。一鸣食品7月31日至8月3日200股净赚15.97元，归为跨月样本。</p></div>
          <div class="trade-reflection"><h3>整月结论：等待余下流水和持仓估值</h3><p>手册的“约-1%”继续作为口述估计保留。当前闭合样本盈利与该估计口径不同，后半月亏损、未闭合持仓、月初市值和出入金尚不完整，不能据此确认或否定整月结果。月度复盘固定以实际成交、闭合盈亏和期末持仓为基础，再评价模式与执行。</p></div>
        </section>"""


def render(rows: list[dict], trade_summary: dict) -> str:
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
  <title>2026年8月月度交易复盘｜实际成交与战法手册</title>
  <style>
    :root{{--bg:#f5f6f8;--paper:#fff;--ink:#17202a;--muted:#667085;--line:#dde4eb;--soft:#f6f8fa;--accent:#bd3d2a;--accent-soft:#fff1ed;--blue:#1d4ed8;--green:#137a5a;--red:#b4232f;--amber:#a15c07;--shadow:0 18px 44px rgba(23,32,42,.08);--radius:8px}}
    *{{box-sizing:border-box}}html{{scroll-behavior:smooth;overflow-x:hidden}}body{{margin:0;background:linear-gradient(180deg,#fafbfc 0%,#eef2f6 100%);color:var(--ink);font-family:"Avenir Next","PingFang SC","Noto Sans SC","Microsoft YaHei",Arial,sans-serif;overflow-x:hidden}}a{{color:inherit}}h1,h2,h3,p{{margin-top:0;letter-spacing:0}}h1{{margin:12px 0;font-size:clamp(32px,4vw,56px);line-height:1.06}}h2{{font-size:24px;margin-bottom:8px}}h3{{font-size:18px;margin-bottom:8px}}p,li,td{{color:var(--muted);line-height:1.68}}strong{{color:var(--ink)}}.shell{{width:min(1460px,calc(100vw - 24px));margin:0 auto;padding:18px 0 54px;display:grid;gap:18px}}.page-layout{{display:grid;grid-template-columns:230px minmax(0,1fr);gap:18px;align-items:start}}.sidebar{{position:sticky;top:18px}}.sidebar-inner,.hero,.panel,.card,.case-card,.sop-card,.rule-card{{background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);min-width:0}}.sidebar-inner{{padding:14px;display:grid;gap:12px}}.sidebar-brand{{display:grid;gap:3px;padding:10px 10px 12px;text-decoration:none;border-bottom:1px solid var(--line)}}.sidebar-brand span{{color:var(--muted);font-size:12px;font-weight:800}}.sidebar-brand strong{{font-size:20px;line-height:1.18}}.side-nav{{display:grid;gap:6px}}.side-nav a{{min-height:40px;display:flex;align-items:center;padding:9px 10px;border-radius:8px;color:var(--muted);font-size:14px;font-weight:800;text-decoration:none}}.side-nav a:hover,.side-nav a:focus-visible{{background:#f8fafc;color:var(--ink);outline:2px solid transparent}}.side-nav a.primary{{background:var(--ink);color:#fff}}.content{{display:grid;gap:18px;min-width:0}}.hero{{padding:30px;display:grid;grid-template-columns:1.05fr .95fr;gap:24px;align-items:stretch}}.label,.chip{{display:inline-flex;width:max-content;max-width:100%;align-items:center;min-height:28px;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;overflow-wrap:anywhere}}.label{{color:var(--accent);background:var(--accent-soft)}}.chip{{background:#eef2ff;color:#344054;white-space:nowrap}}.chip.warn{{background:#fff7ed;color:#9a3412}}.chip.pos{{background:#ecfdf3;color:#067647}}.chip.neg{{background:#fef2f2;color:#991b1b}}.nav{{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}}.button{{min-height:44px;display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:8px;text-decoration:none;background:var(--ink);color:#fff;font-weight:800}}.button.secondary{{background:#fff;color:var(--ink);border:1px solid var(--line)}}.metrics{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}.metric{{min-height:116px;padding:16px;border:1px solid var(--line);border-radius:8px;background:#f8fafc;display:grid;align-content:space-between}}.metric span,.metric small{{color:var(--muted);font-size:12px;line-height:1.45}}.metric strong{{font-size:25px;overflow-wrap:anywhere}}.panel{{padding:22px;overflow:hidden}}.section-note{{margin-bottom:16px;color:var(--muted)}}.grid-2{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}}.grid-3{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}}.card,.case-card,.sop-card,.rule-card{{box-shadow:none;padding:16px;background:#f8fafc}}.card-head,.case-title{{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}}.card p,.case-card p,.rule-card p{{margin-bottom:0}}.case-grid{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}.sop-grid{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}}.rule-grid{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}}.lead-list{{margin:0;padding-left:20px}}.table-wrap{{width:100%;overflow:auto;border:1px solid var(--line);border-radius:8px;background:#fff}}table{{width:100%;min-width:980px;border-collapse:collapse;font-size:13px}}th,td{{padding:12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}}th{{color:var(--muted);background:#f8fafc;font-size:13px}}tr:last-child td{{border-bottom:0}}.axis{{display:grid;grid-template-columns:repeat(7,minmax(124px,1fr));gap:8px;overflow:auto;padding-bottom:2px}}.axis-item{{min-height:126px;padding:12px;border:1px solid var(--line);border-radius:8px;background:#fff}}.axis-item b{{display:block;font-size:22px;color:var(--accent);margin-bottom:6px}}.source-box{{border:1px solid #f2d39c;background:#fffaf0;border-radius:8px;padding:14px}}.source-box p{{margin:0}}.pending{{margin:0;padding-left:20px}}.pos{{color:var(--green)}}.neg{{color:var(--red)}}.warn{{color:var(--amber)}}@media(max-width:1120px){{.page-layout,.hero,.grid-2,.grid-3,.sop-grid,.rule-grid{{grid-template-columns:1fr}}.sidebar{{position:static}}.side-nav{{grid-template-columns:repeat(4,minmax(0,1fr))}}.case-grid{{grid-template-columns:1fr}}}}@media(max-width:720px){{.shell{{width:min(100vw - 16px,1460px);padding-top:12px}}.hero,.panel{{padding:18px}}.metrics,.side-nav{{grid-template-columns:1fr}}.nav{{display:grid;grid-template-columns:1fr 1fr}}.button{{width:100%;padding-left:10px;padding-right:10px}}h1{{font-size:33px}}.card-head,.case-title{{flex-wrap:wrap}}.axis{{grid-template-columns:1fr;overflow:visible}}table{{min-width:780px;font-size:12px}}}}
  </style>
  <style>
    h1{{font-size:38px;line-height:1.2}}.trade-panel{{border:0;border-bottom:1px solid var(--line);border-radius:0;box-shadow:none;background:var(--paper)}}.trade-metrics{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;margin:22px 0}}.trade-metrics>div{{display:grid;gap:8px;padding-left:14px;border-left:3px solid var(--line);min-width:0}}.trade-metrics span,.trade-metrics small{{color:var(--muted);font-size:13px}}.trade-metrics strong{{font-size:25px;overflow-wrap:anywhere}}.data-basis{{padding:14px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}}.data-footnote{{font-size:13px;margin:12px 0 22px}}.ledger-heading{{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px}}.download-links{{display:flex;flex-wrap:wrap;gap:16px;align-items:center;font-size:13px}}.download-links a{{color:var(--blue);padding:10px 0}}.ledger-filters{{display:flex;flex-wrap:wrap;align-items:end;gap:12px;margin:12px 0 16px}}.ledger-filters label{{display:grid;gap:6px;color:var(--muted);font-size:13px;min-width:160px;flex:1}}.ledger-filters select{{width:100%;height:42px;border:1px solid var(--line);border-radius:4px;background:#fff;color:var(--ink);padding:0 10px;font:inherit}}.ledger-filters p{{font-size:13px;margin:0;padding-bottom:10px;white-space:nowrap}}.ledger-table{{min-width:1810px;font-variant-numeric:tabular-nums}}.ledger-table th,.ledger-table td{{white-space:nowrap;padding:10px}}.ledger-table [data-side="buy"] td:nth-child(6){{color:var(--red)}}.ledger-table [data-side="sell"] td:nth-child(6){{color:var(--blue)}}.ledger-wrap:focus-visible,select:focus-visible{{outline:2px solid var(--blue);outline-offset:2px}}.trade-reflection{{padding:16px 0;border-top:1px solid var(--line)}}.trade-reflection h3{{font-size:17px}}.trade-reflection p{{margin-bottom:0}}.sr-only{{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}}[hidden]{{display:none!important}}@media(max-width:720px){{h1{{font-size:30px}}.trade-metrics{{grid-template-columns:1fr}}.ledger-filters label{{min-width:100%;flex:auto}}.trade-metrics strong{{font-size:23px}}}}
    .trade-highlights{{margin:24px 0;scroll-margin-top:18px}}.trade-highlights h3{{font-size:19px;margin-bottom:14px}}.focus-line{{display:grid;grid-template-columns:minmax(0,1fr) minmax(160px,auto);gap:20px;padding:16px;border-left:4px solid var(--line);border-bottom:1px solid var(--line)}}.focus-line h4{{font-size:18px;margin:6px 0}}.focus-line p{{margin:0;font-size:13px}}.focus-profit{{background:#f0faf5}}.focus-loss{{background:#fff3f3}}.focus-cash{{background:#f0f6ff}}.focus-reference{{background:#fff8ef}}.focus-line.focus-profit{{border-left-color:var(--green)}}.focus-line.focus-loss{{border-left-color:var(--red)}}.focus-line.focus-cash{{border-left-color:var(--blue)}}.focus-label{{font-size:12px;font-weight:700}}.focus-profit .focus-label,.focus-profit .focus-value strong{{color:var(--green)}}.focus-loss .focus-label,.focus-loss .focus-value strong{{color:var(--red)}}.focus-cash .focus-label,.focus-cash .focus-value strong{{color:var(--blue)}}.focus-value{{display:grid;align-content:center;justify-items:end;gap:6px;font-variant-numeric:tabular-nums}}.focus-value strong{{font-size:26px;white-space:nowrap}}.focus-value span{{font-size:13px;color:var(--muted)}}.focus-insight{{font-size:14px;margin:14px 0}}.reference-highlight{{padding:12px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}}.reference-highlight summary{{cursor:pointer;color:var(--amber);font-weight:700;line-height:1.65}}.reference-highlight p{{font-size:13px;margin:10px 0 0}}.pnl-table{{min-width:1180px}}.pnl-table td:first-child,.open-table td:first-child,.ledger-table td:nth-child(2){{font-weight:700}}.pnl-table .focus-profit td:first-child,.pnl-table .focus-profit td:nth-last-child(-n+2){{color:var(--green);font-weight:700}}.pnl-table .focus-loss td:first-child,.pnl-table .focus-loss td:nth-last-child(-n+2){{color:var(--red);font-weight:700}}.ledger-table{{min-width:1990px}}.ledger-table [data-side="buy"] td:nth-child(6),.ledger-table [data-side="sell"] td:nth-child(6){{color:var(--muted)}}.ledger-table [data-side="buy"] td:nth-child(7){{color:var(--red)}}.ledger-table [data-side="sell"] td:nth-child(7){{color:var(--blue)}}.ledger-table .focus-profit td:nth-child(2){{color:var(--green)}}.ledger-table .focus-loss td:nth-child(2){{color:var(--red)}}.ledger-table .focus-cash td:nth-child(2){{color:var(--blue)}}.ledger-table .focus-reference td:nth-child(2){{color:var(--amber)}}.ledger-filters .focus-toggle{{display:flex;align-items:center;gap:8px;min-width:auto;flex:0 0 auto;height:42px;white-space:nowrap;color:var(--ink)}}.focus-toggle input{{width:16px;height:16px;accent-color:var(--blue);margin:0}}@media(max-width:720px){{.focus-line{{grid-template-columns:1fr;gap:10px;padding:14px}}.focus-value{{justify-items:start}}.focus-value strong{{font-size:24px}}}}
    @media(max-width:720px){{.side-nav{{grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}}.side-nav a{{min-height:36px;padding:8px;font-size:13px}}}}
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
            <a href="#trade-summary">实际盈亏</a>
            <a href="#trade-highlights">重点交易</a>
            <a href="#trade-ledger">逐笔成交</a>
            <a href="#trade-reflections">数据复盘</a>
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
            <span class="label">Monthly Trading Review · 实际成交 + 战法手册</span>
            <h1>2026年8月月度交易复盘</h1>
            <p>最高标抱团 / 爆量弱转强 / 同批次PK切换 / 补涨龙边界 / 二波首板 / 一进二套利</p>
            <div class="source-box"><p><strong>数据覆盖：</strong>已加入券商截图42条成交，其中八月26条、七月参考16条，可见交易截至8月13日。手册判断与实际成交一并复盘；完整八月流水、月末持仓和账户收益待核验。</p></div>
            <div class="nav">
              <a class="button" href="../">返回月度导航</a>
              <a class="button secondary" href="../../weekly-trading-review/">周度主页</a>
            </div>
          </div>
          <div class="metrics">
            <article class="metric"><span>八月可见成交</span><strong>26条</strong><small>8个标的；14条买入、12条卖出</small></article>
            <article class="metric"><span>闭合样本净盈亏</span><strong class="pos">{money(trade_summary['closed_net_pnl'], True)}元</strong><small>6组含费用，含跨月；非整月账户收益</small></article>
            <article class="metric"><span>核心矛盾</span><strong>看懂但没做到</strong><small>扫板、排板、切换与确认动作待强化</small></article>
            <article class="metric"><span>下月主题</span><strong>把核心机会做到</strong><small>盘前列池、竞价PK、板上确认、失败撤退</small></article>
          </div>
        </section>
{render_transactions(rows, trade_summary)}
        <section class="panel" id="position">
          <h2>月度定位与核心矛盾</h2>
          <p class="section-note">以下保留增强版手册的用户口述判断。除上方已核验成交外，整月结果和后半月案例仍待对应数据。</p>
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
          <p class="section-note">以下为手册案例与口述反思；本次截图仅覆盖部分实际成交，后半月案例与盘口描述仍需流水及行情核验。</p>
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
          <p class="section-note">已补入42条截图成交；完成整月核验仍需余下流水、月初月末资产和对应行情。</p>
          <ul class="pending">{list_items(PENDING)}</ul>
        </section>
      </div>
    </div>
  </main>
  <script>
    const ledgerRows = [...document.querySelectorAll('.ledger-table tbody tr')];
    const periodFilter = document.getElementById('ledger-period');
    const symbolFilter = document.getElementById('ledger-symbol');
    const sideFilter = document.getElementById('ledger-side');
    const focusFilter = document.getElementById('ledger-focus');
    function filterLedger() {{
      let count = 0;
      for (const row of ledgerRows) {{
        const matches = (periodFilter.value === 'all' || row.dataset.period === periodFilter.value)
          && (symbolFilter.value === 'all' || row.dataset.code === symbolFilter.value)
          && (sideFilter.value === 'all' || row.dataset.side === sideFilter.value)
          && (!focusFilter.checked || row.dataset.focus === 'true');
        row.hidden = !matches;
        if (matches) count++;
      }}
      document.getElementById('ledger-count').textContent = `显示${{count}} / ${{ledgerRows.length}}条`;
      document.getElementById('ledger-empty').hidden = count !== 0;
    }}
    for (const control of [periodFilter, symbolFilter, sideFilter, focusFilter]) control.addEventListener('change', filterLedger);
    filterLedger();
  </script>
</body>
</html>
"""


def update_navigation() -> None:
    html = INDEX_PATH.read_text(encoding="utf-8")
    august_placeholders = [
        '<a class="month-card active" href="./2026-08/"><div class="card-head"><h3>2026年8月</h3><span class="chip warn">战法手册</span></div><p>已生成战法手册版月度复盘：最高标抱团、爆量弱转强、同批次PK与下月执行SOP；逐笔成交待补。</p></a>',
        '<a class="month-card disabled" aria-disabled="true"><div class="card-head"><h3>2026年8月</h3><span class="chip ">待补</span></div><p>等待对应自然月周复盘和月末持仓数据。</p></a>',
        '<a class="month-card disabled" aria-disabled="true"><div class="card-head"><h3>2026年8月</h3><span class="chip warn">Q3草案</span></div><p>已纳入Q3滚动二次反思；8月截至08.15，完整自然月待月底和9月5-10日整理。</p></a>',
    ]
    new_august = '<a class="month-card active" href="./2026-08/"><div class="card-head"><h3>2026年8月</h3><span class="chip warn">实际成交</span></div><p>已补入42条截图成交，含八月26条；6组闭合净盈亏+1,054.03元，结合战法复盘。完整月度流水与期末资产待补。</p></a>'
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
    rows, summary = load_trade_data(OUT_DIR / "trades.csv")
    OUT_PATH.write_text(render(rows, summary), encoding="utf-8", newline="\n")
    (OUT_DIR / "trade-summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, default=str, indent=2) + "\n",
        encoding="utf-8", newline="\n",
    )
    update_navigation()
    print(OUT_PATH)


if __name__ == "__main__":
    main()
