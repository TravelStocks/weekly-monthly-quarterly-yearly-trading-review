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
assert by_id['000678-2026-10-29-floating']['pnl']==-377
assert all(r['end']!='2026-10-30' for r in records if r['status']=='floating')
# Reconciled monthly rounds, including smaller losses and acceptable failures.
monthly=json.loads((ROOT/'monthly-quarterly-trading-review/2026-09/data/summary.json').read_text(encoding='utf-8'))
for s in monthly['stocks']:
    for r in s['rounds']:
        if r.get('end') and r['pnl']/r['cost']*100 < -2:
            actual=by_id[f"{s['code']}-{r['end']}-closed"]
            assert actual['pnl']==r['pnl'] and actual['cost']==r['cost']
assert not by_id['600313-2026-08-20-closed']['errors']
assert not by_id['002238-2026-09-28-closed']['errors']
assert {e['category'] for e in by_id['600378-2026-08-31-closed']['errors']}=={'cycle'}
assert {e['category'] for e in by_id['003029-2026-10-21-closed']['errors']}=={'exit'}

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
