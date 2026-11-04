"""Verify source reconciliation and the calendar's account-return boundary."""
import csv
import io
import json
from collections import Counter
from decimal import Decimal
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT/path).read_text(encoding='utf-8-sig'))

data = read('large-loss-review/calendar-data.json')
trades = read('large-loss-review/calendar-trades.json')['rows']
days = {d['date']: d for d in data['days']}
assert len(days) == len(data['days']) == 159
assert data['threshold'] == -2
assert len(trades) == data['tradeCount'] == sum(d['tradeCount'] for d in days.values()) == 720
assert {t['sourceRow'] for t in trades} == set(range(2, 722))
assert all(set(t) == {'date','time','code','name','side','qty','sourceRow'} for t in trades)
by_row = {t['sourceRow']: t for t in trades}
seen = Counter()
for date, d in days.items():
    assert data['start'] <= date <= data['end']
    assert d['tradeCount'] == sum(t['count'] for t in d['trades'])
    for group in d['trades']:
        rows = [by_row[i] for i in group['sourceRows']]
        seen.update(group['sourceRows'])
        assert group['count'] == len(rows)
        assert group['qty'] == sum(r['qty'] for r in rows)
        assert all(r['date'] == date and r['code'] == group['code'] and r['side'] == group['side'] for r in rows)
assert seen == Counter({i: 1 for i in by_row})

# If the original attachment is available, compare every retained field independently.
attachment = Path.home()/'Desktop/table.xls'
if attachment.exists():
    source = list(csv.DictReader(io.StringIO(attachment.read_text(encoding='gb18030')), delimiter='\t'))
    assert len(source) == 720
    for i, row in enumerate(source, 2):
        actual = by_row[i]
        assert actual['date'].replace('-', '') == row['成交日期']
        assert actual['time'] == row['成交时间']
        assert actual['name'] == row['证券名称']
        assert actual['code'] == row['证券代码'].zfill(6)
        assert actual['qty'] == int(Decimal(row['成交数量']))
        assert actual['side'] == ('buy' if row['操作'] in ['买入','对方买入'] else 'sell')

recorded = [d for d in days.values() if d['income'] and d['income']['kind']=='recorded']
estimated = [d for d in days.values() if d['income'] and d['income']['kind']=='estimated']
assert len(recorded)==97 and len(estimated)==21
assert len([d for d in recorded if d['income']['rate'] < -2])==30
assert len([d for d in estimated if d['income']['rate'] < -2])==5
assert sum(d['tradeCount']>0 and not d['income'] for d in days.values())==41
for r in read('weekly-trading-review/daily-income.json')['rows']:
    actual = days[r['date']]['income']
    assert actual['rate']==r['rateBasisPoints']/100
    assert actual['amount']==r['amountCents']/100
    assert actual['source']=='weekly-trading-review/daily-income.json'
assert days['2026-04-24']['income']['rate']==-6.36
assert days['2026-07-28']['income']['rate']==-17.03
assert days['2026-07-29']['income']['rate']==-9.76
assert days['2026-08-14']['income']['rate']==-2.84  # newer source overrides -2.78
assert days['2026-09-29']['income']['rate']==0
assert '2026-09-25' not in days  # unknown is never filled with zero
assert days['2026-10-30']['income'] is None  # stale conditional estimate excluded
assert days['2026-11-04']['income'] is None
assert sum(t['qty'] for t in days['2026-11-04']['trades'] if t['code']=='600715' and t['side']=='buy')==800

# An account loss may arise from an existing position without any new trade.
assert days['2026-08-07']['tradeCount']==0
assert any(r['code']=='601700' for r in days['2026-08-07']['relatedEpisodes'])
assert all(e['scope']=='持仓延续' for e in days['2026-08-07']['errors'])
assert all(e['scope']=='当日操作' for e in days['2026-07-28']['errors'])
assert all(e['scope']=='持仓延续' for e in days['2026-07-29']['errors'])
assert not any(e['category']=='add' for e in days['2026-09-17']['errors'])  # add was next day
assert not days['2026-05-21']['errors']  # missing attribution
assert not days['2026-06-11']['errors']  # disciplined stop
assert not days['2026-09-11']['errors']  # later reflection corrected initial suspicion
guilin={t['side']:t['qty'] for t in days['2026-09-11']['trades'] if t['code']=='000978'}
assert guilin=={'buy':1000,'sell':500}

cache = {}
def source_text(source):
    path, _, anchor = source.partition('#')
    assert (ROOT/path).is_file(), source
    if path not in cache:
        raw=(ROOT/path).read_text(encoding='utf-8')
        cache[path]=(raw,BeautifulSoup(raw,'html.parser'))
    raw,soup=cache[path]
    assert not anchor or soup.find(id=anchor), source
    return raw,soup

for d in days.values():
    if d['income']: source_text(d['income']['source'])
    for note in d['notes']: source_text(note['source'])
    for e in d['errors']:
        assert e['category'] in ['cycle','leader','entry','exit','add','size','execution','mode','emotion']
        assert e['scope'] in ['当日操作','持仓延续','本轮回看']
        raw,soup=source_text(e['source'])
        assert e['evidence'] in raw or e['evidence'] in soup.get_text(' ',strip=True)
        assert e['stocks'] and all(len(s['code'])==6 for s in e['stocks'])
for filename in ['calendar-data.json','calendar-trades.json','calendar-annotations.json']:
    raw=(ROOT/'large-loss-review'/filename).read_text(encoding='utf-8')
    assert not any(s in raw for s in ['合同编号','成交编号','资金余额','账户号码','C:\\\\Users','source_path'])
html=BeautifulSoup((ROOT/'large-loss-review/index.html').read_text(encoding='utf-8'),'html.parser')
ids=[n['id'] for n in html.select('[id]')]
assert len(ids)==len(set(ids))
print('PASS: 720 source rows reconciled, 30 recorded + 5 estimated loss days; provenance, missing data, carry-over attribution, privacy, HTML IDs')
