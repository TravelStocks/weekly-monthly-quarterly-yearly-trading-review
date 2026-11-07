"""Refresh reflection classifications without recalculating historical financial data."""
import json
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'large-loss-review'

def read(name):
    return json.loads((OUT / name).read_text(encoding='utf-8'))

def validate(text, source):
    path, _, anchor = source.partition('#')
    raw = (ROOT / path).read_text(encoding='utf-8')
    soup = BeautifulSoup(raw, 'html.parser')
    assert not anchor or soup.find(id=anchor), source
    assert text in raw or text in soup.get_text(' ', strip=True), (text, source)

def save(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def refresh():
    data = read('data.json')
    annotations = read('annotations.json')
    for record in data['records']:
        note = annotations.get(record['id'])
        if not note:
            continue
        for quote in note.get('quotes', []):
            validate(quote['text'], quote['source'])
            if quote not in record['quotes']:
                record['quotes'].append(quote)
        for key in ['assessment', 'summary', 'errors']:
            record[key] = note[key]
        for error in record['errors']:
            assert any(error['evidence'] in q['text'] for q in record['quotes'])
    calendar = read('calendar-data.json')
    notes = read('calendar-annotations.json')
    for day in calendar['days']:
        if day['date'] in notes:
            day.update(notes[day['date']])
        for error in day['errors']:
            validate(error['evidence'], error['source'])
        for episode in day['relatedEpisodes']:
            note = annotations.get(episode['id'])
            if note:
                for key in ['assessment', 'summary', 'errors']:
                    episode[key] = note[key]
    data['reflectionUpdated'] = calendar['reflectionUpdated'] = '2026-11-06'
    save('data.json', data)
    save('calendar-data.json', calendar)
    print('Refreshed classifications; account returns, trade records and loss thresholds unchanged.')

if __name__ == '__main__':
    refresh()
