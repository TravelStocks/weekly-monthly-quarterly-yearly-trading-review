const data = require("../weekly-trading-review/return-rates.json");
const formatRate = points => (points > 0 ? "+" : "") + (points / 100).toFixed(2) + "%";
const rangeLabel = row => row.start.slice(5).replace("-", ".") + "-" + row.end.slice(5).replace("-", ".");
const rateClass = points => points > 0 ? "is-profit" : points < 0 ? "is-loss" : "";

function forFolder(folder) {
  const periods = data.periods.filter(row => row.folder === folder || row.aliases?.includes(folder));
  if (!periods.length) return null;
  const points = periods.reduce((n,row) => n + row.basisPoints, 0);
  const components = periods.map(row => rangeLabel(row) + " " + formatRate(row.basisPoints)).join("；");
  return { points, formatted: formatRate(points), periods,
    note: periods.length > 1 ? components + "；合并按每日收益率相加。" : "收益率区间 " + rangeLabel(periods[0]) + "；每日收益率直接相加。" };
}

module.exports = { data, formatRate, rangeLabel, rateClass, forFolder };
