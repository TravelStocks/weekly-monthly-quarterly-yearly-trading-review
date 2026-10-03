// Run after rebuilding the weekly hub. User account amounts take precedence.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const hub = path.join(root, 'weekly-trading-review/index.html');
let count = 0;
let html = fs.readFileSync(hub, 'utf8');
html = html.replace(/<a class="week-card[\s\S]*?<\/a>/g, card => {
  if (!/金额变化\s*<b[^>]*>账户待补<\/b>/.test(card)) return card;
  const folder = card.match(/href="\.\.\/([^/]+)\/"/)[1];
  const source = fs.readFileSync(path.join(root, folder, 'index.html'), 'utf8')
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const result = source.match(/(?:可见闭环盈亏|可见已实现盈亏|闭环盈亏)\s+([+-][\d,]+\.\d{2})/);
  if (!result) return card;
  const amount = result[1];
  count++;
  return card.replace(/金额变化\s*<b[^>]*>账户待补<\/b>/,
    `金额变化（计算） <b class="${amount.startsWith('+') ? 'is-profit' : 'is-loss'}">${amount}</b>`)
    .replace('</p>', ' 金额为可见已平仓交易计算值；账户金额、持仓浮盈亏待补后校准。</p>');
});
fs.writeFileSync(hub, html, 'utf8');
console.log(`Filled ${count} weekly amount cards; existing account amounts and weekly returns preserved.`);
