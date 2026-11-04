"""Rebuild the loss archive from published reports. Requires beautifulsoup4.

Only parses local, already-public data; never copies account IDs or raw screenshots.
Run from any directory: python scripts/build-large-loss-review.py
"""
from pathlib import Path
from collections import Counter, defaultdict
import json
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'large-loss-review'
THRESHOLD = -2

def read_json(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8-sig'))

def number(text):
    return float(str(text).replace(',', '').replace('−', '-').replace('+', '').strip())

def iso(value):
    value = value.replace('/', '-')
    return f'{value[:4]}-{value[4:6]}-{value[6:8]}' if re.fullmatch(r'\d{8}', value) else value

def embedded(text, name):
    match = re.search(r'(?:const\s+' + name + r'|window\.' + name + r')\s*=\s*', text)
    if not match:
        return None
    value = text[match.end():]
    try:
        return json.JSONDecoder().raw_decode(value)[0]
    except json.JSONDecodeError:
        # The May report uses a literal array with unquoted property names.
        value = value.split(';', 1)[0]
        value = re.sub(r'([{,]\s*)(\w+)\s*:', r'\1"\2":', value)
        value = re.sub(r',\s*([}\]])', r'\1', value)
        return json.loads(value)

def trade_key(t):
    # Net cash and displayed price precision vary between overlapping archives.
    return (t['date'], t['time'], t['code'], t['side'], t['qty'], round(t['gross'], 2))

def table_trades(soup, source):
    result = []
    for table in soup.select('table'):
        headers = [x.get_text(' ', strip=True) for x in table.select('th')]
        if not any('代码' in h for h in headers) or not any(h in headers for h in ['成交金额', '金额', '成交额']):
            continue
        def cell(cells, *labels):
            for label in labels:
                if label in headers:
                    return cells[headers.index(label)]
            return None
        for row in table.select('tr:has(td)'):
            cells = [x.get_text(' ', strip=True) for x in row.select('td')]
            if len(cells) != len(headers):
                continue
            side = cell(cells, '操作', '方向')
            if not side or not any(x in side for x in ['买入', '卖出']):
                continue
            stamp = cell(cells, '成交时间', '时间', '委托时间')
            if not stamp:
                continue
            if ' ' in stamp:
                date, time = stamp.split(' ', 1)
            else:
                date, time = cell(cells, '成交日期', '日期'), stamp
            cash = cell(cells, '发生金额')
            result.append(dict(date=iso(date), time=time, code=cell(cells, '证券代码', '代码'),
                name=cell(cells, '证券名称', '名称'), side='buy' if '买入' in side else 'sell',
                qty=int(number(cell(cells, '成交数量', '数量', '股数'))),
                gross=number(cell(cells, '成交金额', '金额', '成交额')),
                cash=abs(number(cash)) if cash else None, source=source))
    return result

def deduplicate(batches):
    counts, chosen, sources = Counter(), {}, defaultdict(set)
    for batch in batches:
        local = Counter()
        for t in batch:
            key = trade_key(t)
            local[key] += 1
            sources[key].add(t['source'])
            if key not in chosen or t['cash'] is not None:
                chosen[key] = t
        counts |= local  # Preserve genuine identical fills within a source.
    result = []
    for key, count in counts.items():
        t = {**chosen[key], 'sources': sorted(sources[key])}
        result.extend([t] * count)
    return sorted(result, key=lambda t: (t['date'], t['time'], t['code']))

def close_rounds(trades):
    active, closed, unknown = {}, [], []
    for t in trades:
        code = t['code']
        if t['side'] == 'buy':
            if code not in active:
                active[code] = dict(code=code, name=t['name'], start=t['date'], qty=0, trades=[])
            active[code]['qty'] += t['qty']
            active[code]['trades'].append(t)
        elif code not in active or active[code]['qty'] < t['qty']:
            unknown.append(t)
            active.pop(code, None)
        else:
            r = active[code]
            r['qty'] -= t['qty']
            r['trades'].append(t)
            if r['qty'] == 0:
                fee_known = all(x['cash'] is not None for x in r['trades'])
                field = 'cash' if fee_known else 'gross'
                cost = sum(x[field] for x in r['trades'] if x['side'] == 'buy')
                proceeds = sum(x[field] for x in r['trades'] if x['side'] == 'sell')
                closed.append(dict(code=code, name=r['name'], start=r['start'], end=t['date'],
                    cost=round(cost, 2), pnl=round(proceeds-cost, 2), status='closed',
                    basis='含费闭环' if fee_known else '费用前闭环（费用未完整提供）',
                    sources=sorted({p for x in r['trades'] for p in x['sources']})))
                del active[code]
    return closed, active, unknown

def nearest_link(node, path):
    anchor = node.get('id') or next((p.get('id') for p in node.parents if p.get('id')), None)
    return path + ('#' + anchor if anchor else '')

def extract_quotes(soup, path, name, code):
    result = []
    for node in soup.select('.case-row'):
        stock = node.select_one('.case-stock strong')
        if stock and stock.get_text(strip=True) == name:
            result.append(dict(text=node.get_text(' ',strip=True),source=nearest_link(node,path)))
    stock = soup.select_one('#stock-' + code)
    if stock:
        for node in stock.select('.stock-review > div'):
            result.append(dict(text=node.get_text(' ',strip=True),source=nearest_link(stock,path)))
    # Stock-specific cards include reflections whose individual sentences omit the name.
    for node in soup.select('article, .target-card, .thought-card'):
        heading = node.find(['h3', 'h2'])
        if heading and name in heading.get_text(' ', strip=True):
            for p in node.select('p, li'):
                if p.find_parent('svg') or p.find_parent('table'):
                    continue
                text = p.get_text(' ', strip=True)
                if 12 <= len(text) < 2200:
                    result.append(dict(text=text, source=nearest_link(node, path)))
    # Keep original named reflections, excluding tables, chart captions and nav.
    for node in soup.select('p, li'):
        text = node.get_text(' ', strip=True)
        if name in text and len(text) >= 18 and not node.find_parent(['table', 'svg', 'nav']):
            if len(text) < 2200:
                result.append(dict(text=text, source=nearest_link(node, path)))
    seen = set()
    return [q for q in result if not (q['text'] in seen or seen.add(q['text']))]

def build():
    pages, batches, scan = {}, [], []
    report_files = sorted(ROOT.glob('20*/index.html')) + [ROOT / f'monthly-quarterly-trading-review/{month}/index.html' for month in ['2026-05','2026-08']]
    for f in report_files:
        path = f.relative_to(ROOT).as_posix()
        text = f.read_text(encoding='utf-8')
        soup = BeautifulSoup(text, 'html.parser')
        pages[path] = soup
        if f.parent.name.startswith('2026-04'):
            scan.append(dict(source=path, kind='嵌入的逐轮交易与持仓数据'))
            continue
        trades = table_trades(soup, path)
        if not trades:
            raw = embedded(text, 'trades')
            if raw:
                trades = [dict(date=iso(t['date']), time=t['time'], code=t['code'], name=t['name'],
                    side='buy' if '买入' in t['side'] else 'sell', qty=t['qty'], gross=t['gross'],
                    cash=abs(t['net']), source=path) for t in raw]
        batches.append(trades)
        scan.append(dict(source=path, trades=len(trades), kind='公开成交明细' if trades else '心得归档，无成交数据'))
    trades = deduplicate(batches)
    # October's later settlement statement supplies exact cash for four earlier
    # order-history rows. Match only unambiguous economic fills, not nearby times.
    for t in trades[:]:
        if t['cash'] is None and t['date'] >= '2026-10-19':
            matches = [x for x in trades if x['cash'] is not None and
                all(x[k] == t[k] for k in ['date','code','side','qty','gross'])]
            if len(matches) == 1:
                matches[0]['sources'] = sorted(set(matches[0]['sources'] + t['sources']))
                trades.remove(t)
    rounds, active, unknown = close_rounds(trades)
    unknown = [t for t in unknown if t['date'] > '2026-04-24']
    # The monthly archive has explicitly reconciled FIFO rounds and personal
    # classifications. It replaces overlapping Aug/Sep reconstructions entirely.
    rounds = [r for r in rounds if r['end'] > '2026-04-24' and not '2026-08-15' <= r['end'] <= '2026-09-30']
    monthly_path = 'monthly-quarterly-trading-review/2026-09/index.html'
    pages[monthly_path] = BeautifulSoup((ROOT/monthly_path).read_text(encoding='utf-8'),'html.parser')
    monthly = read_json('monthly-quarterly-trading-review/2026-09/data/summary.json')
    for s in monthly['stocks']:
        for r in s['rounds']:
            if not r.get('end'):
                continue
            rounds.append(dict(code=s['code'], name=s['name'], start=r['start'], end=r['end'],
                cost=r['cost'], pnl=r['pnl'], status='closed', basis='含费闭环（月度已核对）',
                originalClassification=s['classification'], sources=[monthly_path]))
    april_path = '2026-04-20_2026-04-24/index.html'
    april = embedded((ROOT/april_path).read_text(encoding='utf-8'), 'REPORT_DATA')
    for stock in april['stocks']:
        for r in stock['campaigns']:
            rounds.append(dict(code=stock['code'], name=stock['name'], start=r['start'][:10],
                end=(r['end'] or '2026-04-24')[:10], cost=r['buy_cash'] if r['status']=='closed' else r['open_cost'],
                pnl=round(r['realized'] if r['status']=='closed' else r['floating'], 2),
                status='closed' if r['status']=='closed' else 'floating',
                basis='含费闭环' if r['status']=='closed' else '历史持仓浮亏 · 04/24收盘快照，后续平仓未知', sources=[april_path]))
    october = read_json('2026-10-26_2026-10-30/data/summary.json')
    # Last observed holdings, not the conditional October 30 unchanged-position scenario.
    for s in october['stocks']:
        if s['openQty']:
            day = next(d for d in october['account']['days'] if d['date']=='2026-10-29')
            holding = next(h for h in day['holdings'] if h['code']==s['code'])
            rounds.append(dict(code=s['code'], name=s['name'], start='2026-10-29', end='2026-10-29',
                cost=s['openCost'], pnl=round(holding['qty']*holding['close']-s['openCost'],2), status='floating',
                basis='新仓浮亏 · 10/29收盘快照；前一轮盈利独立核算', sources=['2026-10-26_2026-10-30/index.html']))
    candidates=[]
    for r in rounds:
        if r['cost'] <= 0:
            raise ValueError('Non-positive basis: '+str(r))
        r['rate'] = r['pnl']/r['cost']*100
        if r['rate'] >= THRESHOLD:
            continue
        r['id'] = f"{r['code']}-{r['end']}-{r['status']}"
        r['instrument'] = 'ETF' if r['code'].startswith(('15','51','58')) else 'stock'
        source_pages = set(r['sources'])
        if monthly_path in source_pages:
            for path in pages:
                if not re.match(r'^\d{4}-\d{2}-\d{2}_',path):
                    continue
                a,b=path.split('/')[0].split('_')
                if a <= r['end'] <= b or a <= r['start'] <= b:
                    source_pages.add(path)
        quotes=[]
        for path in sorted(source_pages):
            soup=pages.get(path) or BeautifulSoup((ROOT/path).read_text(encoding='utf-8'),'html.parser')
            quotes += extract_quotes(soup,path,r['name'],r['code'])
            meta=embedded((ROOT/path).read_text(encoding='utf-8'), 'stockMeta') if path.startswith(('2026-05-25','2026-06-01')) else None
            if meta and r['code'] in meta:
                for k,v in meta[r['code']].items():
                    if isinstance(v,str) and len(v)>15: quotes.append(dict(text=v,source=path))
        # Dedicated failure case pages correspond to specific dated rounds only.
        case=ROOT/'success-failure-trade-review'/f"stock-{r['code']}-failure"/'index.html'
        if case.exists() and r['end']<'2026-08-15':
            path=case.relative_to(ROOT).as_posix(); soup=BeautifulSoup(case.read_text(encoding='utf-8'),'html.parser')
            for p in soup.select('p, li'):
                text=p.get_text(' ',strip=True)
                if len(text)>18 and not p.find_parent(['table','svg','nav']): quotes.append(dict(text=text,source=nearest_link(p,path)))
        if r['end'] <= '2026-04-24':
            # Only text from the reflection payload, never account/source paths.
            def walk(v):
                if isinstance(v,dict):
                    for k,x in v.items():
                        if k not in ['source_name','source_path']: yield from walk(x)
                elif isinstance(v,list):
                    for x in v: yield from walk(x)
                elif isinstance(v,str) and r['name'] in v: yield v
            quotes += [dict(text=t,source=april_path+'#reflection-section') for t in walk(april['reflection'])]
            stock = next(s for s in april['stocks'] if s['code']==r['code'])
            quotes += [dict(text='原站个股分析（非本人反思原话）：'+stock['headline'],source=april_path)]
            quotes += [dict(text='原站个股分析（非本人反思原话）：'+t,source=april_path) for t in stock['analysis']]
        seen=set(); r['quotes']=[q for q in quotes if not(q['text'] in seen or seen.add(q['text']))]
        candidates.append(r)
    ids=[r['id'] for r in candidates]
    assert len(ids)==len(set(ids)), 'Duplicate loss episodes: '+str([r for r in candidates if ids.count(r['id'])>1])
    annotations_path=OUT/'annotations.json'
    annotations=json.loads(annotations_path.read_text(encoding='utf-8')) if annotations_path.exists() else {}
    for r in candidates:
        note=annotations.get(r['id'],{})
        r['assessment']=note.get('assessment','待归因')
        r['summary']=note.get('summary','尚无足够的个股错误归因，保留已有记录供回看。')
        r['errors']=note.get('errors',[])
        for error in r['errors']:
            # Each label must have a literal, traceable quote, not a keyword guess.
            assert any(error['evidence'] in q['text'] for q in r['quotes']), (r['id'],error)
    candidates.sort(key=lambda r:r['rate'])
    OUT.mkdir(exist_ok=True)
    payload=dict(updated='2026-11-04',threshold=THRESHOLD,records=candidates,
        audit=dict(scannedPages=scan, uniqueTrades=len(trades),unknownCostSales=[
            {k:t[k] for k in ['date','code','name','source']} for t in unknown],
            monthlySource=monthly_path, noDataThrough='2026-11-04'))
    (OUT/'data.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'{len(candidates)} loss records; {len(trades)} unique fills; {len(unknown)} unmatched historical sales')
    for r in candidates:
        print(r['id'],r['name'],round(r['rate'],3),r['pnl'],r['cost'],len(r['quotes']),r['basis'])
    return payload

if __name__ == '__main__':
    build()
