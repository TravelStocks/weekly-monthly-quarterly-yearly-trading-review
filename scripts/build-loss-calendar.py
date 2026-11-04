"""Build daily account-loss calendar; never infer account returns from trade cashflow.

Initial import: python scripts/build-loss-calendar.py --trades <broker TSV .xls>
Rebuild from sanitized inputs: python scripts/build-loss-calendar.py
"""
from pathlib import Path
from collections import defaultdict
from decimal import Decimal
import argparse
import csv
import io
import json
import re
import sys
import importlib.util
from bs4 import BeautifulSoup

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'large-loss-review'
spec = importlib.util.spec_from_file_location('episode_builder', ROOT/'scripts/build-large-loss-review.py')
episodes = importlib.util.module_from_spec(spec)
spec.loader.exec_module(episodes)

def read(path):
    return json.loads((ROOT/path).read_text(encoding='utf-8-sig'))

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

def date_in(text, year='2026'):
    m = re.search(r'(?:(20\d{2})[-/年])?(\d{1,2})[-/月.](\d{1,2})(?:日)?', text)
    return f'{m[1] or year}-{int(m[2]):02d}-{int(m[3]):02d}' if m else None

def numeric(value):
    match = re.fullmatch(r'[+−-]?[\d,]+(?:\.\d+)?%?', value.strip())
    return float(value.replace(',', '').replace('−', '-').replace('%', '')) if match else None

def import_trades(path):
    rows = list(csv.DictReader(io.StringIO(path.read_text(encoding='gb18030')), delimiter='\t'))
    clean = []
    for index, r in enumerate(rows, 2):
        raw_date = r['成交日期']
        side = {'买入':'buy','对方买入':'buy','卖出':'sell','对方卖出':'sell'}[r['操作']]
        code = r['证券代码'].zfill(6)
        assert re.fullmatch(r'\d{8}', raw_date) and re.fullmatch(r'\d{6}', code)
        clean.append(dict(date=f'{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:]}',
            time=r['成交时间'], code=code, name=r['证券名称'], side=side,
            qty=int(Decimal(r['成交数量'])), sourceRow=index))
    clean.sort(key=lambda r:(r['date'], r['time'], r['sourceRow']))
    # Deliberately exclude account balance, identifiers, contract and execution IDs.
    write(OUT/'calendar-trades.json', dict(source='table.xls', imported='2026-11-05',
        start=clean[0]['date'], end=clean[-1]['date'], rows=clean))

def build():
    imported = read('large-loss-review/calendar-trades.json')
    rates, notes, pages = {}, defaultdict(list), {}
    conflicts = []
    def add_rate(date, rate, amount, source, kind='recorded', basis='原站每日账户记录'):
        if date is None or rate is None:
            return
        candidate = dict(rate=rate, amount=amount, source=source, kind=kind, basis=basis)
        if date in rates and rates[date]['kind']=='recorded':
            if abs(rate-rates[date]['rate']) > .005:
                conflicts.append(dict(date=date, selected=rates[date], alternative=candidate))
            return
        rates[date] = candidate
    # Explicit daily-income source is authoritative over old duplicated page rows.
    income = read('weekly-trading-review/daily-income.json')
    for r in income['rows']:
        add_rate(r['date'], r['rateBasisPoints']/100, r['amountCents']/100,
            'weekly-trading-review/daily-income.json', basis='每日收益明细 · 已归档源表')
    for file in sorted(ROOT.glob('20*/index.html')):
        path = file.relative_to(ROOT).as_posix()
        raw = file.read_text(encoding='utf-8')
        soup = BeautifulSoup(raw, 'html.parser')
        pages[path] = soup
        if file.parent.name.startswith('2026-04'):
            payload = episodes.embedded(raw, 'REPORT_DATA')
            for r in payload['actual_account']['days']:
                add_rate(r['date'], r['return_pct'], r['pnl'], path+'#actual-account-section')
            for r in payload['daily_reviews']:
                # Only source prose is considered; numeric trading summaries stay separate.
                for key in ['reflection', 'analysis', 'notes', 'operation', 'emotion']:
                    value = r.get(key)
                    if isinstance(value, str):
                        notes[r['date']].append(dict(text=value, source=path+'#reflection-section'))
        account = soup.select_one('#account')
        if account:
            for table in account.select('table'):
                headers = [h.get_text(' ',strip=True) for h in table.select('th')]
                if '日期' not in headers:
                    continue
                ri = next((i for i,h in enumerate(headers) if '收益率' in h or '参考涨跌率' in h), None)
                ai = next((i for i,h in enumerate(headers) if any(k in h for k in ['收益金额','日盈亏','日收益（'])), None)
                if ri is None:
                    continue
                for row in table.select('tr:has(td)'):
                    cells = [n.get_text(' ',strip=True) for n in row.select('td')]
                    if len(cells)!=len(headers):continue
                    date = date_in(cells[headers.index('日期')])
                    # October 30 was a conditional unchanged-position scenario. The new
                    # statement has actual trades that day, so this stale estimate is excluded.
                    if date == '2026-10-30':continue
                    kind = 'estimated' if file.parent.name.startswith('2026-10') else 'recorded'
                    add_rate(date, numeric(cells[ri]), numeric(cells[ai]) if ai is not None else None,
                        path+'#account', kind, '原站账户估算 · '+headers[ri]+'（非券商确认）' if kind=='estimated' else '原站每日账户记录')
            for card in account.select('.account-day'):
                heading = card.select_one('strong')
                if not heading:continue
                rate = amount = None
                for node in card.select(':scope > span'):
                    text = node.get_text(' ',strip=True)
                    value = node.find('b')
                    if not value:continue
                    if text.startswith(('收益率','当日亏损比例')):rate=numeric(value.get_text(strip=True))
                    elif text.startswith(('收益 ','当日亏损金额')):amount=numeric(value.get_text(strip=True))
                kind = 'estimated' if file.parent.name.startswith('2026-06-22') else 'recorded'
                add_rate(date_in(heading.get_text()), rate, amount, path+'#account', kind,
                    '原站市值估算（非券商确认）' if kind=='estimated' else '原站每日账户记录')
        # Older weekly templates store account values in day cards, not tables.
        for card in soup.select('#daily .day-card, #daily .day-grid-cards > article'):
            date=date_in(card.get_text(' ',strip=True)[:160])
            if not date:continue
            card_text=card.get_text(' ',strip=True)
            if file.parent.name.startswith(('2026-05-08','2026-05-15')):
                rate_match=re.search(r'收益率\s*([+−-]?[\d.]+)%', card_text)
                amount_node=card.select_one('.day-pnl, .day-result, .day-head strong')
                add_rate(date,float(rate_match[1]) if rate_match else None,
                    numeric(amount_node.get_text(strip=True)) if amount_node else None,path+'#daily')
            for node in card.select('p, li, dd'):
                text=node.get_text(' ',strip=True)
                if len(text)>15 and not node.find_parent('table'):
                    notes[date].append(dict(text=text, source=episodes.nearest_link(card,path)))
    # Daily notes stored as JSON are already published on the corresponding weekly pages.
    for file in ROOT.glob('20*/data/daily-reviews.json'):
        payload=json.loads(file.read_text(encoding='utf-8'))
        for r in payload.get('reviews',[]):
            date=r.get('date')
            if not date:continue
            source=file.parent.parent.relative_to(ROOT).as_posix()+'/index.html#daily'
            for text in r.get('reflections',[]):
                if isinstance(text,str):notes[date].append(dict(text=text,source=source))
    by_date=defaultdict(list)
    for t in imported['rows']:by_date[t['date']].append(t)
    loss=read('large-loss-review/data.json')['records']
    annotation_file=OUT/'calendar-annotations.json'
    annotations=json.loads(annotation_file.read_text(encoding='utf-8')) if annotation_file.exists() else {}
    days=[]
    for date in sorted(set(rates)|set(by_date)):
        grouped={}
        for t in by_date[date]:
            key=(t['code'],t['side'])
            g=grouped.setdefault(key,dict(code=t['code'],name=t['name'],side=t['side'],qty=0,count=0,sourceRows=[]))
            g['qty']+=t['qty'];g['count']+=1;g['sourceRows'].append(t['sourceRow'])
        seen=set()
        day_notes=[n for n in notes[date] if not(n['text'] in seen or seen.add(n['text']))]
        relevant=[r for r in loss if r['start']<=date<=r['end']]
        # Episode labels are context only, never automatically labelled as errors made today.
        related=[dict(id=r['id'],name=r['name'],code=r['code'],start=r['start'],end=r['end'],
            summary=r['summary'],errors=r['errors'],assessment=r['assessment']) for r in relevant]
        a=annotations.get(date,{})
        errors=a.get('errors',[])
        for e in errors:
            assert e['scope'] in ['当日操作','持仓延续','本轮回看']
            source=e['source']; path,_,anchor=source.partition('#')
            text=(ROOT/path).read_text(encoding='utf-8')
            soup=pages.get(path) or BeautifulSoup(text,'html.parser')
            assert not anchor or soup.find(id=anchor), source
            # Embedded April text is not in the static DOM. Validate against both.
            assert e['evidence'] in soup.get_text(' ',strip=True) or e['evidence'] in text, (date,e)
        days.append(dict(date=date,income=rates.get(date),trades=list(grouped.values()),
            tradeCount=len(by_date[date]),notes=day_notes,relatedEpisodes=related,
            summary=a.get('summary',''),assessment=a.get('assessment','待归因'),errors=errors))
    payload=dict(updated='2026-11-05',threshold=-2,start=imported['start'],end=imported['end'],
        tradeSource=imported['source'],tradeCount=len(imported['rows']),days=days,
        audit=dict(incomeSource=income['source'],conflicts=conflicts,
            excludedEstimates=[dict(date='2026-10-30',reason='原站以10/29持仓不变为前提的估算，与新交割单10/30实际买卖不符，未用于筛选。')]))
    write(OUT/'calendar-data.json',payload)
    flagged=[d for d in days if d['income'] and d['income']['rate'] < -2]
    print('days',len(days),'rates',len(rates),'recorded',sum(r['kind']=='recorded' for r in rates.values()),'flagged',len(flagged))
    for d in flagged:print(d['date'],d['income']['rate'],d['income']['kind'],','.join(dict.fromkeys(t['name'] for t in d['trades'])),len(d['notes']))
    return payload

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--trades',type=Path)
    args=parser.parse_args()
    if args.trades:import_trades(args.trades)
    build()
