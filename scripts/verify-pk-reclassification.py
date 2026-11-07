"""Regressions for the user's explicit same-rank PK reclassification."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'large-loss-review'
days = {d['date']: d for d in json.loads((ROOT / 'calendar-data.json').read_text(encoding='utf-8'))['days']}
for date, code, scope in [
    ('2026-09-03', '000892', '当日操作'),
    ('2026-11-04', '600715', '当日操作'),
]:
    errors = [e for e in days[date]['errors'] if any(s['code'] == code for s in e['stocks'])]
    assert len(errors) == 1 and errors[0]['category'] == 'pk', date
    assert errors[0]['scope'] == scope
assert any(e['category'] != 'pk' and e['stocks'][0]['code'] == '600551' for e in days['2026-09-03']['errors'])
assert any(e['category'] == 'theme_support' and e['stocks'][0]['code'] == '003029' for e in days['2026-10-21']['errors'])
assert sum(any(e['category'] == 'pk' for e in d['errors']) for d in days.values() if d['date'].startswith('2026-10')) == 0  # Wanfeng superseded by later switch-mode clarification.
print('PASS: two stocks, two dates; unresolved PK unified, carry-over and other stocks preserved.')
