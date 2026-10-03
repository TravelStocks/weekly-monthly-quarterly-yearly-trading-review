const data = require("../weekly-trading-review/return-rates.json");
const formatRate = points => (points > 0 ? "+" : "") + (points / 100).toFixed(2) + "%";
const rangeLabel = row => row.start.slice(5).replace("-", ".") + "-" + row.end.slice(5).replace("-", ".");
const rateClass = points => points > 0 ? "is-profit" : points < 0 ? "is-loss" : "";

function forFolder(folder) {
  const periods = data.periods.filter(row => row.folder === folder);
  if (!periods.length) return null;
  const points = periods.reduce((n,row) => n + row.basisPoints, 0);
  const components = periods.map(row => rangeLabel(row) + " " + formatRate(row.basisPoints)).join("；");
  return { points, formatted: formatRate(points), periods,
    note: periods.length > 1 ? components + "；合并按每日收益率相加。" : "收益率区间 " + rangeLabel(periods[0]) + "；每日收益率直接相加。" };
}

function renderTable() {
  return '<section class="panel" id="weekly-return-rates"><h2>周收益率</h2>' +
    '<p>按提供的每日收益率直接相加，不是复利收益率，也不等于闭环盈亏除以成本。未提供账户金额的周不反推金额、仓位或累计回撤；此前各周继续保留原口径。</p>' +
    '<div class="table-wrap"><table style="min-width:0"><thead><tr><th>日期范围</th><th>周收益率<br>（每日直接相加）</th><th>复盘记录</th></tr></thead><tbody>' +
    data.periods.map(row => '<tr><td>' + rangeLabel(row) + '</td><td class="' + rateClass(row.basisPoints) + '"><b>' + formatRate(row.basisPoints) + '</b></td><td>' +
      (row.folder ? '<a href="../' + row.folder + '/">' + (row.folder === "2026-09-21_2026-09-30" ? '合并复盘' : '查看复盘') + '</a>' : '周报待补') + '</td></tr>').join("") +
    '</tbody></table></div><p>9/21–9/30合并收益率：<strong class="is-profit">' + forFolder("2026-09-21_2026-09-30").formatted + '</strong>（+4.99% - 3.64%）。金额变化按原有账户或闭环口径独立保留。</p></section>';
}
module.exports = { data, formatRate, rangeLabel, rateClass, forFolder, renderTable };
