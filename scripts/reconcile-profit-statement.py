"""Reconcile a broker TSV export into public, aggregate profit rounds only."""
from collections import Counter
from datetime import datetime
from decimal import Decimal
from pathlib import Path
import csv
import json
import sys

OUTPUT = Path(__file__).resolve().parents[1] / 'large-profit-review/statement-rounds.json'
# Guotai announcement: July 9 holders received two units per unit before July 10 trading.
SPLIT_SOURCE = 'https://static.cninfo.com.cn/finalpage/2026-07-10/1225417952.PDF'


def reconcile(path):
    with path.open(encoding='gb18030', newline='') as stream:
        rows = list(reversed(list(csv.DictReader(stream, delimiter='\t'))))
    positions = {}
    profits = []
    fills = Counter()
    closed = 0
    for row in sorted(rows, key=lambda r: (r['成交日期'], r['成交时间'])):
        code = row['证券代码'].strip().zfill(6)
        date = datetime.strptime(row['成交日期'], '%Y%m%d').date().isoformat()
        side = row['操作'].strip()
        assert side in ('买入', '卖出', '对方买入', '对方卖出'), side
        shares = int(row['成交数量'])
        cash = Decimal(row['发生金额'])
        pos = positions.setdefault(code, dict(start=date, qty=0, cost=Decimal(0), pnl=Decimal(0), last=date, count=0))
        if code == '159516' and pos['last'] < '2026-07-10' <= date:
            pos['qty'] *= 2
        if '买' in side:
            assert cash < 0
            pos['qty'] += shares
            pos['cost'] -= cash
        else:
            assert cash > 0 and pos['qty'] >= shares, (code, date, 'missing opening cost or corporate action')
            pos['qty'] -= shares
        pos['pnl'] += cash
        pos['last'] = date
        pos['count'] += 1
        fills[date] += 1
        if not pos['qty']:
            closed += 1
            if pos['pnl'] * 100 > 2 * pos['cost']:
                profits.append(dict(code=code, name=''.join(row['证券名称'].split()), start=pos['start'], end=date,
                                    cost=float(pos['cost']), pnl=float(pos['pnl']), fills=pos['count']))
            del positions[code]
    return dict(start=min(fills), end=max(fills), fills=sum(fills.values()), closed=closed,
                openPositions=[dict(code=k, qty=v['qty'], start=v['start']) for k,v in positions.items()],
                splitSource=SPLIT_SOURCE, profits=profits)


if __name__ == '__main__':
    result = reconcile(Path(sys.argv[1]))
    OUTPUT.write_text(json.dumps(result, indent=2, ensure_ascii=False)+'\n', encoding='utf8')
    print(result['fills'], result['closed'], len(result['profits']), result['openPositions'])
