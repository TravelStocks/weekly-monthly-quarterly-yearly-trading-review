const assert = require("node:assert/strict");
const input = require("../weekly-trading-review/equity-inputs.json");

function calculate(data) {
  let previous = data.openingCents;
  const seen = new Set();
  return data.periods.map(row => {
    assert.ok(!seen.has(row.folder), "Duplicate equity period: " + row.folder);
    seen.add(row.folder);
    assert.ok(Number.isSafeInteger(previous) && Number.isSafeInteger(row.changeCents));
    const calculatedCents = previous + row.changeCents;
    const endingCents = row.recordedCents ?? calculatedCents;
    assert.ok(Number.isSafeInteger(endingCents));
    const result = {...row, openingCents: previous, calculatedCents, endingCents,
      adjustmentCents: endingCents - calculatedCents,
      status: row.recordedCents == null ? "estimated" : row.provisional ? "provisional" : "recorded"};
    previous = endingCents;
    return result;
  });
}

const money = cents => (cents / 100).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
const statusLabel = row => ({estimated:"推算", provisional:"原暂估", recorded:"已录入"})[row.status];
function formula(row) {
  return `上期 ${money(row.openingCents)} ${row.changeCents < 0 ? "−" : "+"} 本期 ${money(Math.abs(row.changeCents))} = ${money(row.calculatedCents)}`;
}
module.exports = {input, calculate, rows:calculate(input), money, statusLabel, formula};
