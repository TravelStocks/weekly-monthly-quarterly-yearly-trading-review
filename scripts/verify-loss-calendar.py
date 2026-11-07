"""Verify source reconciliation and the calendar's account-return boundary."""
import csv
import io
import json
import re
from collections import Counter
from decimal import Decimal
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT/path).read_text(encoding='utf-8-sig'))

categories=set(re.findall(r'^  ([a-z_]+):', (ROOT/'large-loss-review/app.js').read_text(encoding='utf-8'), re.M))
data = read('large-loss-review/calendar-data.json')
trades = read('large-loss-review/calendar-trades.json')['rows']
days = {d['date']: d for d in data['days']}
assert len(days) == len(data['days']) == 160
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
assert len(recorded)==97 and len(estimated)==48
assert len([d for d in recorded if d['income']['rate'] < -2])==30
assert len([d for d in estimated if d['income']['rate'] < -2])==15
assert sum(d['tradeCount']>0 and not d['income'] for d in days.values())==15
spring = read('large-loss-review/spring-holding-estimates.json')['days']
assert Counter(v['date'][:7] for v in spring) == {'2026-04':21,'2026-05':18}
for v in spring:
    assert days[v['date']]['income']
    contributions = Decimal(0)
    for h in v['positions']:
        closing_value = h['closingQty'] * Decimal(str(h['close']))
        pnl = closing_value - Decimal(str(h['openingValue'])) + Decimal(str(h['netTradeCash']))
        assert pnl == Decimal(str(h['pnl']))
        contributions += pnl
    assert contributions == Decimal(str(v['amount']))
assert days['2026-05-27']['tradeCount']==0 and days['2026-05-27']['income']['amount']==1108
halted = next(h for h in days['2026-04-30']['income']['calculation']['positions'] if h['code']=='002082')
assert halted['quoteDate']=='2026-04-29' and halted['pnl']==0
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
# Actual October 30 trades replace the stale unchanged-position scenario.
assert days['2026-10-30']['income']['amount']==266.18
assert days['2026-10-30']['income']['calculation']['equity']==11800.36
november=read('2026-11-02_2026-11-06/data/summary.json')['account']
for date,amount in [('2026-11-02',-813.83),('2026-11-03',-346.59),('2026-11-04',-202.02)]:
    actual=days[date]['income']
    expected=next(d for d in november['days'] if d['date']==date)
    assert actual['kind']=='estimated' and actual['amount']==amount==expected['pnl']
    assert actual['rate']==expected['returnPct']
    assert actual['source']=='2026-11-02_2026-11-06/index.html#trade-records'
assert days['2026-11-02']['income']['calculation']['previousEquity']==11800.36
assert days['2026-11-04']['income']['rate'] > -2  # stock loss does not imply a >2% account loss
assert '2026-11-05' not in days and '2026-11-06' not in days  # no invented later-day income
assert sum(t['qty'] for t in days['2026-11-04']['trades'] if t['code']=='600715' and t['side']=='buy')==800

# Latest user attribution applies to entry day and its next-day carry-over only.
assert days['2026-09-02']['income']['rate']==-3.62
assert days['2026-09-03']['income']['rate']==-6.11
for date,scope in [('2026-09-02','当日操作'),('2026-09-03','持仓延续')]:
    errors=[e for e in days[date]['errors'] if any(t['code']=='600551' for t in e['stocks'])]
    assert len(errors)==1 and errors[0]['category']=='board_confirm' and errors[0]['scope']==scope

# Later personal clarification replaces only the named stock's classification.
for date,code,scope in [('2026-08-28','600378','当日操作'),('2026-08-31','600378','持仓延续'),('2026-09-17','002584','当日操作'),('2026-10-19','002085','当日操作'),('2026-10-21','002085','持仓延续')]:
    errors=[e for e in days[date]['errors'] if any(t['code']==code for t in e['stocks'])]
    assert len(errors)==1 and errors[0]['category']=='switch_mode' and errors[0]['scope']==scope
assert '2026-08-29' not in days
for date,scope in [('2026-08-14','当日操作'),('2026-08-17','持仓延续')]:
    huaxi_errors=[e for e in days[date]['errors'] if any(s['code']=='000936' for s in e['stocks'])]
    assert [(e['category'],e['scope']) for e in huaxi_errors]==[('switch_mode',scope)]
    assert any(r['id']=='000936-2026-08-17-closed' for r in days[date]['relatedEpisodes'])
for month,count in [('2026-08',5),('2026-09',1),('2026-10',2)]:
    assert sum(d['date'].startswith(month) and d['income'] and d['income']['rate'] < -2 and any(e['category']=='switch_mode' for e in d['errors']) for d in days.values())==count

# Latest theme-support attribution must preserve other stocks and daily returns.
for date,code,scope,rate in [('2026-06-09','600403','持仓延续',-9.83),('2026-06-11','002354','持仓延续',-4.43),('2026-08-07','601700','持仓延续',-9.69),('2026-08-21','600127','本轮回看',-2.24),('2026-09-09','002403','持仓延续',-5.27),('2026-10-21','003029','本轮回看',-2.13)]:
    errors=[e for e in days[date]['errors'] if any(t['code']==code for t in e['stocks'])]
    assert len(errors)==1 and errors[0]['category']=='theme_support' and errors[0]['scope']==scope
    assert days[date]['income']['rate']==rate
assert sum(any(e['category']=='theme_support' for e in d['errors']) for d in days.values())==6
assert days['2026-08-07']['income']['amount']==-1296
for month,count in [('2026-06',2),('2026-08',2),('2026-09',1),('2026-10',1)]:
    assert sum(d['date'].startswith(month) and d['income'] and d['income']['rate'] < -2 and any(e['category']=='theme_support' for e in d['errors']) for d in days.values())==count

# Calendar links now include November closed episodes and the dated WENTOU snapshot.
assert any(r['id']=='603131-2026-11-03-closed' for r in days['2026-11-02']['relatedEpisodes'])
assert any(r['id']=='603278-2026-11-02-closed' for r in days['2026-11-02']['relatedEpisodes'])
assert any(r['id']=='600715-2026-11-04-floating' for r in days['2026-11-04']['relatedEpisodes'])
assert not any(r['id']=='000678-2026-10-29-floating' for d in days.values() for r in d['relatedEpisodes'])
for date in ['2026-11-02','2026-11-03']:
    errors=[e for e in days[date]['errors'] if any(s['code']=='603131' for s in e['stocks'])]
    assert len(errors)==1 and errors[0]['category']=='catch_up_height'
    assert errors[0]['scope']==('当日操作' if date=='2026-11-02' else '持仓延续')
assert sum(any(e['category']=='catch_up_height' for e in d['errors']) for d in days.values())==10

# One regulatory-timing attribution per round; exits are carry-over, not new mistakes.
for date,code,scope in [('2026-07-28','001258','当日操作'),('2026-07-29','001258','持仓延续'),('2026-10-30','603278','当日操作'),('2026-11-02','603278','持仓延续')]:
    errors=[e for e in days[date]['errors'] if any(s['code']==code for s in e['stocks'])]
    assert len(errors)==1 and errors[0]['category']=='regulatory_timing' and errors[0]['scope']==scope
for month,count in [('2026-07',2),('2026-10',0),('2026-11',1)]:
    assert sum(d['date'].startswith(month) and d['income'] and d['income']['rate'] < -2 and any(e['category']=='regulatory_timing' for e in d['errors']) for d in days.values())==count
assert sum(any(e['category']=='regulatory_timing' for e in d['errors']) for d in days.values())==4

# An account loss may arise from an existing position without any new trade.
assert days['2026-08-07']['tradeCount']==0
assert any(r['code']=='601700' for r in days['2026-08-07']['relatedEpisodes'])
assert all(e['scope']=='持仓延续' for e in days['2026-08-07']['errors'])
assert {(s['code'], e['scope']) for e in days['2026-07-28']['errors'] for s in e['stocks']} == {('001258', '当日操作'), ('002879', '本轮回看')}
assert all(e['scope']=='持仓延续' for e in days['2026-07-29']['errors'])
assert not any(e['category']=='add' for e in days['2026-09-17']['errors'])  # add was next day
assert not days['2026-05-21']['errors']  # missing attribution
assert len(days['2026-06-11']['errors'])==1  # Attribution belongs to the prior holding.
assert [(e['category'],e['scope']) for e in days['2026-09-11']['errors']] == [('wrong_side','当日操作')]
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
    calculation=d['income'].get('calculation') if d['income'] else None
    if calculation:
        source_text(calculation['source'])
        previous=Decimal(str(calculation['previousEquity']))
        equity=Decimal(str(calculation['equity']))
        pnl=Decimal(str(d['income']['amount']))
        assert equity-previous==pnl
        assert Decimal(str(calculation['cash']))+Decimal(str(calculation['marketValue']))==equity
        assert abs(float(pnl/previous*100)-d['income']['rate'])<1e-9
    for note in d['notes']: source_text(note['source'])
    for e in d['errors']:
        assert e['category'] in categories
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
print('PASS: 720 source rows reconciled, 30 recorded + 15 estimated loss days; spring holdings, November account bridge, provenance, missing data, attribution, privacy, HTML IDs')
