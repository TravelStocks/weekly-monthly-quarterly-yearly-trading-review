"""Data regressions and provenance checks for the loss archive."""
import importlib.util
import json
import sys
from pathlib import Path
from collections import Counter
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
sys.dont_write_bytecode=True
spec=importlib.util.spec_from_file_location('loss_builder',ROOT/'scripts/build-large-loss-review.py')
builder=importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
data=json.loads((ROOT/'large-loss-review/data.json').read_text(encoding='utf-8'))
records=data['records']
by_id={r['id']:r for r in records}
assert len(by_id)==len(records)
for r in records:
    assert r['cost']>0 and r['pnl']<0 and r['rate'] < -2
    assert abs(r['pnl']/r['cost']*100-r['rate'])<1e-10
    assert len({e['category'] for e in r['errors']})==len(r['errors'])
    if r['assessment'] in ['正常试错','待归因']: assert not r['errors']
    for e in r['errors']:
        assert any(e['evidence'] in q['text'] for q in r['quotes'])

# The profitable earlier round must not hide the later loss.
assert by_id['600403-2026-06-09-closed']['pnl']==-538.75
assert by_id['001258-2026-07-29-closed']['pnl']==-4234.39
# Known costs from another week; no duplicate June 5 floating loss.
assert by_id['600110-2026-06-24-closed']['cost']==19270.22
assert len([r for r in records if r['code']=='600255'])==1
assert by_id['600487-2026-06-29-closed']['pnl']==-1487.57
assert len([r for r in records if r['code']=='600396'])==2
# Later settlement evidence replaces earlier fee-free order-history rows.
assert by_id['002076-2026-10-23-closed']['pnl']==-94.49
assert by_id['002076-2026-10-23-closed']['cost']==1077
# Do not mix partial fees with fee-free sales.
assert by_id['002242-2026-10-19-closed']['pnl']==-125
assert by_id['002242-2026-10-19-closed']['cost']==3459
assert not any(r['code']=='000678' and r['status']=='floating' for r in records)
assert all(r['end']!='2026-10-30' for r in records if r['status']=='floating')
# The latest settled trades and historical snapshot share the calendar cutoff.
assert data['audit']['tradesThrough']=='2026-11-04'
assert data['audit']['snapshotThrough']=='2026-11-04'
for id,cost,pnl in [('603278-2026-11-02-closed',3928.04,-425.83),('603131-2026-11-03-closed',3872.04,-758.63),('600715-2026-11-04-floating',2178.02,-202.02)]:
    assert by_id[id]['cost']==cost and by_id[id]['pnl']==pnl
    assert by_id[id]['errors']
assert [e['category'] for e in by_id['603131-2026-11-03-closed']['errors']]==['catch_up_height']
assert sum(any(e['category']=='catch_up_height' for e in r['errors']) for r in records)==3
for id in ['001258-2026-07-29-closed','603278-2026-11-02-closed']:
    assert [e['category'] for e in by_id[id]['errors']]==['regulatory_timing']
assert sum(any(e['category']=='regulatory_timing' for e in r['errors']) for r in records)==2
# Partial sales must reduce snapshot cost, not leave all purchases as the denominator.
position={'qty':100,'trades':[{'side':'buy','qty':200,'cash':2010,'gross':2000},{'side':'sell','qty':100,'cash':1100,'gross':1105}]}
assert builder.remaining_cost(position)==(1005,True)
position['trades'][1]['cash']=None
assert builder.remaining_cost(position)==(1000,False)

# Reconciled monthly rounds, including smaller losses and acceptable failures.
monthly=json.loads((ROOT/'monthly-quarterly-trading-review/2026-09/data/summary.json').read_text(encoding='utf-8'))
for s in monthly['stocks']:
    for r in s['rounds']:
        if r.get('end') and r['pnl']/r['cost']*100 < -2:
            actual=by_id[f"{s['code']}-{r['end']}-closed"]
            assert actual['pnl']==r['pnl'] and actual['cost']==r['cost']
assert not by_id['600313-2026-08-20-closed']['errors']
for code in ['002238', '600664']:
    assert [e['category'] for e in by_id[f'{code}-2026-09-28-closed']['errors']] == ['mode']
assert {e['category'] for e in by_id['600378-2026-08-31-closed']['errors']}=={'switch_mode'}
assert {e['category'] for e in by_id['003029-2026-10-21-closed']['errors']}=={'theme_support'}
for id in ['000892-2026-09-04-closed']:
    assert [e['category'] for e in by_id[id]['errors']] == ['pk']

assert {e['category'] for e in by_id['600551-2026-09-03-closed']['errors']}=={'board_confirm'}
assert by_id['600551-2026-09-03-closed']['pnl']==-576.63

assert {e['category'] for e in by_id['002085-2026-10-21-closed']['errors']}=={'switch_mode'}
assert {e['category'] for e in by_id['002584-2026-09-21-closed']['errors']}=={'switch_mode','add'}
huaxi = by_id['000936-2026-08-17-closed']
assert (huaxi['start'], huaxi['cost'], huaxi['pnl']) == ('2026-08-14', 5605, -340.64)
assert [e['category'] for e in huaxi['errors']] == ['switch_mode']
assert sum(any(e['category']=='switch_mode' for e in r['errors']) for r in records)==5

assert {e['category'] for e in by_id['002403-2026-09-09-closed']['errors']}=={'theme_support'}
assert {e['category'] for e in by_id['601700-2026-08-10-closed']['errors']}=={'theme_support'}
assert by_id['601700-2026-08-10-closed']['pnl']==-327.55
assert [e['category'] for e in by_id['600127-2026-08-21-closed']['errors']]==['theme_support']
assert [e['category'] for e in by_id['600403-2026-06-09-closed']['errors']]==['theme_support']
assert sum(any(e['category']=='theme_support' for e in r['errors']) for r in records)==5

# Overlapping documents must not duplicate fills; real identical fills survive.
sample=dict(date='2026-01-01',time='09:30:00',code='000001',name='测试',side='buy',qty=100,gross=1000,cash=1005,source='one')
dedup=builder.deduplicate([[sample,sample],[{**sample,'source':'two'}]])
assert len(dedup)==2
assert dedup[0]['sources']==['one','two']
sell={**sample,'date':'2026-01-02','side':'sell','gross':970,'cash':965,'sources':['one']}
buy={**sample,'sources':['one']}
closed,active,unknown=builder.close_rounds([buy,sell])
assert len(closed)==1 and closed[0]['pnl']==-40 and not active and not unknown
gross,_,_=builder.close_rounds([buy,{**sell,'cash':None}])
assert gross[0]['cost']==1000 and gross[0]['pnl']==-30
missing,_,unknown=builder.close_rounds([sell])
assert not missing and len(unknown)==1

# Every origin URL and anchor must lead to an existing local source.
source_paths={p for r in records for p in r['sources']}|{q['source'] for r in records for q in r['quotes']}
cache={}
for source in source_paths:
    path,_,anchor=source.partition('#')
    assert (ROOT/path).is_file(), source
    if anchor:
        if path not in cache:cache[path]=BeautifulSoup((ROOT/path).read_text(encoding='utf-8'),'html.parser')
        assert cache[path].find(id=anchor), source
for page,target in [('index.html','./large-loss-review/'),('success-failure-trade-review/index.html','../large-loss-review/')]:
    assert target in (ROOT/page).read_text(encoding='utf-8')
assert not any(token in (ROOT/'large-loss-review/data.json').read_text(encoding='utf-8') for token in ['source_path','D:\\\\Users','C:\\\\Users'])
scope=[r for r in records if r['status']=='closed' and r['instrument']=='stock']
print('PASS: math, cross-period dedup, later fees, monthly completeness, classification evidence, source links, privacy')
print('Closed stock episodes:',len(scope),'Unique stocks:',len({r['code'] for r in scope}))
print('Error frequencies:',dict(Counter(e['category'] for r in scope for e in r['errors'])))
