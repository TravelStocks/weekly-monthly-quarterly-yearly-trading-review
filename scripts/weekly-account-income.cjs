const assert = require("node:assert/strict");
const data = require("../weekly-trading-review/daily-income.json");
const periods = require("../weekly-trading-review/return-rates.json").periods;

const money = cents => (cents > 0 ? "+" : cents < 0 ? "-" : "") +
  (Math.abs(cents) / 100).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
const rate = points => (points > 0 ? "+" : "") + (points / 100).toFixed(2) + "%";
const trend = value => value > 0 ? "is-profit" : value < 0 ? "is-loss" : "";
const dayLabel = day => `${day.weekday} ${day.date.slice(5)} ${money(day.amountCents)}`;

assert.equal(new Set(data.rows.map(row=>row.date)).size, data.rows.length, "Duplicate daily date");
for(const row of data.rows) {
  assert.ok(Number.isSafeInteger(row.amountCents) && Number.isSafeInteger(row.rateBasisPoints));
  assert.ok(!data.unlistedDates.includes(row.date));
}
for(const control of data.weeklyControls) {
  const rows=data.rows.filter(row=>row.week===control.week);
  assert.equal(rows.length,control.count);
  assert.ok(rows.every(row=>row.date>=control.start && row.date<=control.end));
  assert.equal(rows.reduce((n,row)=>n+row.amountCents,0),control.amountCents);
  assert.equal(rows.reduce((n,row)=>n+row.rateBasisPoints,0),control.rateBasisPoints);
  const period=periods.find(period=>period.start===control.start && period.end===control.end);
  assert.ok(period, "Unmapped source week " + control.week);
  assert.equal(period.basisPoints,control.rateBasisPoints);
}

function forFolder(folder) {
  const matched=periods.filter(period=>period.folder===folder || period.aliases?.includes(folder));
  if(!matched.length) return null;
  const rows=data.rows.filter(row=>matched.some(period=>row.date>=period.start && row.date<=period.end))
    .sort((a,b)=>a.date.localeCompare(b.date));
  assert.ok(rows.length);
  const amountCents=rows.reduce((n,row)=>n+row.amountCents,0);
  const rateBasisPoints=rows.reduce((n,row)=>n+row.rateBasisPoints,0);
  const best=rows.reduce((a,b)=>b.amountCents>a.amountCents ? b : a);
  const worst=rows.reduce((a,b)=>b.amountCents<a.amountCents ? b : a);
  const components=matched.map(period=>{
    const days=rows.filter(row=>row.date>=period.start && row.date<=period.end);
    return `${period.start.slice(5)}–${period.end.slice(5)}：${money(days.reduce((n,row)=>n+row.amountCents,0))} 元 / ${rate(period.basisPoints)}`;
  });
  return {folder, rows, amountCents, rateBasisPoints, best, worst, components};
}

const folders=[...new Set(periods.flatMap(period=>[period.folder,...(period.aliases || [])]).filter(Boolean))];
module.exports={data, folders, forFolder, money, rate, trend, dayLabel};
