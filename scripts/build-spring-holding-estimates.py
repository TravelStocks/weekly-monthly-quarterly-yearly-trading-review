"""Value April and May holdings from the private statement and unadjusted daily closes.

Usage: python scripts/build-spring-holding-estimates.py <table.xls> <quote-cache-directory>
Only derived valuations are written into the public repository.
"""
import csv
import io
import json
import sys
from collections import Counter, defaultdict
from decimal import Decimal as D
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'large-loss-review/spring-holding-estimates.json'
FIRST = '2026-04-01'
BASELINE = '2026-03-31'
END = '2026-05-29'
ENDPOINT = 'https://web.ifzq.gtimg.cn/appstock/app/fqkline/get'
HALT = 'https://disc.static.szse.cn/disc/disk03/finalpage/2026-04-30/5f3a7fa5-3b97-4709-9958-37d1cf208676.PDF'


def bars(symbol, cache):
    path = cache / (symbol + '.json')
    if not path.exists():
        query = urlencode({'param': f'{symbol},day,2026-03-27,{END},80,'})
        with urlopen(ENDPOINT + '?' + query, timeout=20) as response:
            rows = json.load(response)['data'][symbol]['day']
        path.write_text(json.dumps(rows), encoding='utf-8')
    return {row[0]: row for row in json.loads(path.read_text(encoding='utf-8'))}


def build(statement, cache):
    cache.mkdir(parents=True, exist_ok=True)
    sessions = sorted(date for date in bars('sh000001', cache) if BASELINE <= date <= END)
    groups = defaultdict(list)
    positions = Counter()
    names = {}
    for fill in csv.DictReader(io.StringIO(statement.read_text(encoding='gb18030')), delimiter='\t'):
        raw = fill['成交日期']
        date = f'{raw[:4]}-{raw[4:6]}-{raw[6:]}'
        if date > END:
            continue
        code = fill['证券代码'].zfill(6)
        names[code] = fill['证券名称']
        qty = int(fill['成交数量'])
        side = fill['操作']
        assert side in ('买入','对方买入','卖出','对方卖出')
        signed = qty if '买' in side else -qty
        if date < BASELINE:
            positions[code] += signed
        else:
            assert date in sessions, date
            groups[date].append((code, signed, D(fill['发生金额']), D(fill['资金余额']), D(fill['成交均价'])))

    prices = {}
    previous_market = {}
    previous_equity = None
    cash = None
    days = []
    for date in sessions:
        flows = Counter()
        endpoints = Counter()
        opening_qty = positions.copy()
        fills = groups[date]
        for code, qty, net, balance, price in fills:
            positions[code] += qty
            flows[code] += net
            endpoints[balance] += 1
            endpoints[balance-net] -= 1
        if fills:
            starts, ends = list((-endpoints).elements()), list(endpoints.elements())
            assert len(starts) == len(ends) == 1, date
            assert cash is None or starts[0] == cash, ('cash discontinuity', date)
            cash = ends[0]
        assert cash is not None and min(positions.values()) >= 0
        values = {}
        lines = []
        for code in sorted(set(previous_market) | set(flows) | {c for c,q in positions.items() if q}):
            if code not in prices:
                symbol = ('sh' if code[0] in '569' else 'sz') + code
                prices[code] = bars(symbol, cache)
            quoted_on = date
            if date == '2026-04-30' and code == '002082':
                quoted_on = '2026-04-29'
            bar = prices[code][quoted_on]
            assert not (opening_qty[code] and date >= FIRST and len(bar) > 6), ('check corporate action',date,code)
            for traded_code, _, _, _, price in fills:
                if traded_code == code:
                    assert D(bar[4])-D('.005') <= price <= D(bar[3])+D('.005'), (date,code,price)
            close = D(bar[2])
            value = positions[code] * close
            if positions[code]:
                values[code] = value
            pnl = value - previous_market.get(code, D(0)) + flows[code]
            lines.append(dict(code=code,name=names[code],openingQty=opening_qty[code],closingQty=positions[code],
                              close=float(close),quoteDate=quoted_on,openingValue=float(previous_market.get(code,0)),
                              netTradeCash=float(flows[code]),pnl=float(pnl)))
        market = sum(values.values(),D(0))
        equity = cash + market
        if date >= FIRST:
            pnl = equity-previous_equity
            assert sum(D(str(x['pnl'])) for x in lines)==pnl
            days.append(dict(date=date,amount=float(pnl),rate=float(100*pnl/previous_equity),
                             previousEquity=float(previous_equity),equity=float(equity),cash=float(cash),
                             marketValue=float(market),positions=lines))
        previous_equity,previous_market = equity,values
    payload = dict(method='逐股日损益 = 今收持仓市值 − 昨收持仓市值 + 当日含费买卖净发生额；账户日收益率 = 日损益合计 ÷ 昨收账户权益。',
                   priceSource=ENDPOINT,priceBasis='腾讯行情不复权日收盘价；交易日按上证指数日线。',haltNotice=HALT,days=days)
    (ROOT/SOURCE).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


if __name__=='__main__':
    build(Path(sys.argv[1]), Path(sys.argv[2]))
