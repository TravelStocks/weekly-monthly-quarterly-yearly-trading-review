"""Profit episode arithmetic, historical corrections, classification and provenance."""
from pathlib import Path
from collections import Counter
import json
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT/'large-profit-review/data.json').read_text(encoding='utf-8'))
records = data['records']
by_id = {r['id']: r for r in records}
assert len(by_id) == len(records)
assert data['threshold'] == 2
assert data['audit']['tradesThrough']=='2026-11-04'
assert data['audit']['snapshotThrough']=='2026-11-04'
categories = {'leader', 'entry', 'exit', 'cycle', 'size', 'holding'}
for r in records:
    assert r['cost'] > 0 and r['pnl'] > 0 and r['rate'] > 2
    assert abs(r['pnl'] / r['cost'] * 100 - r['rate']) < 1e-10
    assert len({f['category'] for f in r['factors']}) == len(r['factors'])
    assert r['assessment'] in {'有据可循', '盈利但不可复制', '待归因'}
    if r['assessment'] != '有据可循':
        assert not r['factors']
    else:
        assert r['factors']
    for f in r['factors']:
        assert f['category'] in categories
        assert any(f['evidence'] in q['text'] for q in r['quotes']), (r['id'], f)
    if r['assessmentEvidence']:
        assert any(r['assessmentEvidence'] in q['text'] for q in r['quotes'])
    if r['assessment'] == '盈利但不可复制':
        assert r['assessmentEvidence']

# Cross-period FIFO and different episodes must not be collapsed into net stock PnL.
expected = {
    '000678-2026-10-29-closed': (10101, 1510.19),
    '001258-2026-07-24-closed': (18096, 1964.95),
    '600403-2026-06-05-closed': (14073.14, 1433.94),
    '002421-2026-05-25-closed': (35250, 1331.70),
    '000993-2026-10-12-closed': (1714, 99.09),
    '603230-2026-09-23-closed': (9443.10, 380.86),
}
for key, (cost, pnl) in expected.items():
    assert (by_id[key]['cost'], by_id[key]['pnl']) == (cost, pnl), key
assert by_id['001258-2026-07-24-closed']['basis'].startswith('含费闭环')
assert by_id['002412-2026-08-27-closed']['assessment'] == '盈利但不可复制'
assert by_id['603758-2026-08-17-closed']['assessment'] == '盈利但不可复制'
assert by_id['000678-2026-10-29-closed']['assessment'] == '待归因'
assert {f['category'] for f in by_id['600241-2026-10-12-closed']['factors']} == {'exit'}
assert {f['category'] for f in by_id['002119-2026-06-12-closed']['factors']} == {'size'}
assert not any(r['code'] == '000678' and r['status'] == 'floating' for r in records)
loss = json.loads((ROOT/'large-loss-review/data.json').read_text(encoding='utf-8'))
assert not set(by_id).intersection(r['id'] for r in loss['records'])

# Every eligible reconciled monthly round appears exactly once.
monthly = json.loads((ROOT/'monthly-quarterly-trading-review/2026-09/data/summary.json').read_text(encoding='utf-8'))
for stock in monthly['stocks']:
    for r in stock['rounds']:
        if r.get('end') and r['pnl']/r['cost']*100 > 2:
            actual = by_id[f"{stock['code']}-{r['end']}-closed"]
            assert actual['pnl'] == r['pnl'] and actual['cost'] == r['cost']

# Assert the entire eligible statement set, including repeated entries in one stock.
statement = json.loads((ROOT/'large-profit-review/statement-rounds.json').read_text(encoding='utf8'))
expected_rounds = {(r['code'],r['start'],r['end'],r['cost'],r['pnl']) for r in statement['profits']}
actual_rounds = {(r['code'],r['start'],r['end'],r['cost'],r['pnl']) for r in records
                 if r['status']=='closed' and statement['start'] <= r['end'] <= statement['end']}
assert actual_rounds == expected_rounds
assert len(expected_rounds) == len(statement['profits'])
assert data['audit']['statement']['fills'] == sum(d['tradeCount'] for d in
    json.loads((ROOT/'large-loss-review/calendar-data.json').read_text(encoding='utf8'))['days']
    if statement['start'] <= d['date'] <= statement['end'])
assert by_id['159516-2026-07-10-closed']['pnl'] == 341.7
# Verify links, literal quote evidence, and navigation without external resources.
sources = {s for r in records for s in r['sources']} | {q['source'] for r in records for q in r['quotes']}
cache = {}
for source in sources:
    path, _, anchor = source.partition('#')
    assert (ROOT/path).is_file(), source
    if anchor:
        if path not in cache:
            cache[path] = BeautifulSoup((ROOT/path).read_text(encoding='utf-8'), 'html.parser')
        assert cache[path].find(id=anchor), source
for page, target in [('index.html', './large-profit-review/'), ('large-loss-review/index.html', '../large-profit-review/'), ('success-failure-trade-review/index.html', '../large-profit-review/')]:
    assert target in (ROOT/page).read_text(encoding='utf-8')
for page in ['large-profit-review/index.html', 'large-loss-review/index.html', 'index.html']:
    soup = BeautifulSoup((ROOT/page).read_text(encoding='utf-8'), 'html.parser')
    ids = [n['id'] for n in soup.find_all(id=True)]
    assert len(ids) == len(set(ids)), page
assert not any(t in (ROOT/'large-profit-review/data.json').read_text(encoding='utf-8') for t in ['source_path', 'C:\\\\Users', 'D:\\\\Users'])
scope = [r for r in records if r['instrument'] == 'stock' and r['status'] == 'closed']
print('PASS: arithmetic, cross-period rounds, corrections, evidence, source anchors, navigation, privacy')
print('Closed stock episodes:', len(scope), 'Unique stocks:', len({r['code'] for r in scope}))
print('Assessments:', dict(Counter(r['assessment'] for r in scope)))
print('Factor frequencies:', dict(Counter(f['category'] for r in scope for f in r['factors'])))
