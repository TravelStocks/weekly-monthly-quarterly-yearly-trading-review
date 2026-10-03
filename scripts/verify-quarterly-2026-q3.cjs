const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }

async function main() {
  const root = path.resolve(__dirname, '..');
  const quarter = 'monthly-quarterly-trading-review/2026-q3/';
  const output = path.join(root, 'output/playwright/quarterly-2026-q3');
  fs.mkdirSync(output, {recursive:true});
  const review = JSON.parse(fs.readFileSync(path.join(root, quarter, 'data/system-review.json'), 'utf8'));
  const summary = JSON.parse(fs.readFileSync(path.join(root, quarter, 'data/summary.json'), 'utf8'));
  const income = require('./weekly-account-income.cjs');
  const money = require('./quarterly-2026-q3-content.cjs').money;
  assert.equal(summary.septemberReflection, 'integrated');
  assert.equal(review.scope.accountTotalsVerified, false);
  assert.deepEqual(review.winningCases.map(c => c.pnlCents), [143394,205000,85503,111544,38086]);
  assert.deepEqual(review.contrasts.map(c => c.negativeCents), [-423439,-128364,-10039]);
  assert.deepEqual(review.repeatErrors.map(e => e.months.length), [4,4,4,3,3]);
  assert.equal(review.weeklySources.length, 17);
  assert.equal(new Set(review.weeklySources.map(w => w.folder)).size, 17);
  for (const week of summary.weeklySources) {
    const account = income.forFolder(week.folder);
    if (account) {
      assert.equal(week.pnl, income.money(account.amountCents));
      assert.equal(week.change, income.rate(account.rateBasisPoints));
    }
  }
  const trackedOutputs = [quarter+'index.html', quarter+'data/summary.json', 'monthly-quarterly-trading-review/index.html', 'monthly-quarterly-trading-review/2026-09/index.html'];
  const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
  const previous = trackedOutputs.map(digest);
  const rebuild = spawnSync(process.execPath, ['scripts/build-quarterly-2026-q3.js'], {cwd:root,encoding:'utf8'});
  assert.equal(rebuild.status, 0, rebuild.stderr);
  assert.deepEqual(trackedOutputs.map(digest), previous, 'Rebuild must be idempotent and leave September intact');
  const server = http.createServer((request,response) => {
    const relative = decodeURIComponent(new URL(request.url,'http://localhost').pathname).replace(/^\/+/, '');
    let file = path.resolve(root,relative);
    if (!file.startsWith(root+path.sep) && file!==root) {response.writeHead(403).end();return;}
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
    if (!fs.existsSync(file)) {response.writeHead(404).end();return;}
    response.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json; charset=utf-8':'application/octet-stream');
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const base = 'http://127.0.0.1:'+server.address().port;
  let browser;
  const results = [];
  try {
    browser = await playwright.chromium.launch({channel:'chrome',headless:true});
    for (const width of [1440,768,390,360]) {
      const page = await browser.newPage({viewport:{width,height:1050},deviceScaleFactor:1});
      const errors = [];
      page.on('pageerror',error => errors.push(error.message));
      await page.goto(base+'/'+quarter);
      const check = await page.evaluate(() => ({
        scrollWidth:document.documentElement.scrollWidth,
        duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,all)=>all.indexOf(id)!==i),
        missingAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash),
        localLinks:[...document.querySelectorAll('a[href]')].filter(a=>a.origin===location.origin).map(a=>({pathname:a.pathname,hash:a.hash})),
        samples:document.querySelectorAll('.winning-sample').length,
        excluded:document.querySelectorAll('.excluded-samples article').length,
        matrix:document.querySelectorAll('.repeat-table tbody tr').length,
        pairs:document.querySelectorAll('g[data-pair]').length,
        visibleBars:[...document.querySelectorAll('g[data-pair] rect')].filter(r=>r.getBoundingClientRect().width>1&&r.getBoundingClientRect().height>1).length,
        months:document.querySelectorAll('#months .month-snapshot').length,
        points:document.querySelectorAll('.september-points>li').length,
        scores:[...document.querySelectorAll('.score-top strong')].map(s=>s.textContent),
        checklist:document.querySelectorAll('#checklist li').length,
        goals:document.querySelectorAll('#goals .goal-card').length,
        weeks:[...document.querySelectorAll('#sources tbody tr')].map(row=>[...row.querySelectorAll('td')].slice(0,3).map(td=>td.querySelector('strong')?.textContent||td.textContent.trim())),
        chapterOpen:document.querySelector('.chapter-nav').open,
        reflection:document.getElementById('reflection').dataset.status,
        badText:/undefined|NaN|9月结束后需要再补|6-8月二次反思|9月后补齐完整自然季度/.test(document.body.textContent)
      }));
      assert.equal(check.scrollWidth,width, 'Page overflow at '+width);
      assert.deepEqual(check.duplicateIds,[]);
      assert.deepEqual(check.missingAnchors,[]);
      assert.equal(check.samples,5); assert.equal(check.excluded,3); assert.equal(check.matrix,5);
      assert.equal(check.pairs,3); assert.equal(check.visibleBars,6); assert.equal(check.months,4);
      assert.equal(check.points,6); assert.equal(check.checklist,8); assert.equal(check.goals,3);
      assert.equal(check.reflection,'integrated'); assert.equal(check.badText,false);
      assert.deepEqual(check.scores,['2/5','3/5','2/5','2/5','3/5']);
      assert.equal(check.chapterOpen,width>1120);
      assert.equal(check.weeks.length,17);
      summary.weeklySources.forEach((w,i) => assert.deepEqual(check.weeks[i],[w.range,w.change,w.pnl]));
      for (const link of check.localLinks) {
        let file=path.join(root,decodeURIComponent(link.pathname).replace(/^\/+/,''));
        assert(fs.existsSync(file),'Missing link '+link.pathname);
        if (fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
        if (link.hash && file.endsWith('.html')) {
          const source=fs.readFileSync(file,'utf8');
          const found=await page.evaluate(({source,id}) => !!new DOMParser().parseFromString(source,'text/html').getElementById(id), {source,id:decodeURIComponent(link.hash.slice(1))});
          assert(found,'Missing target '+link.pathname+link.hash);
        }
      }
      await page.screenshot({path:path.join(output,'overview-'+width+'.png')});
      for (const id of ['right','wins','wrong','core','reflection']) {
        await page.evaluate(id => {const y=document.getElementById(id).getBoundingClientRect().top+scrollY;scrollTo({top:y,behavior:'instant'});},id);
        if (width>1120) {
          const sidebar=await page.locator('.sidebar').boundingBox();
          assert(sidebar.y>=17 && sidebar.y<=19,'Desktop navigation must stay sticky');
          assert(sidebar.y+sidebar.height<=1050,'Desktop navigation must fit the viewport');
        }
        await page.screenshot({path:path.join(output,id+'-'+width+'.png')});
      }
      await page.locator('.sample-nav>summary').click();
      assert.equal(await page.locator('.sample-nav').evaluate(e=>e.open),true);
      await page.locator('.sample-nav a[href="#sample-baihua-first"]').click();
      await page.waitForURL('**/#sample-baihua-first');
      assert.equal(await page.locator('#sample-baihua-first .sample-value strong').textContent(),money(111544));
      await page.locator('.sample-nav>summary').click();
      assert.equal(await page.locator('.sample-nav').evaluate(e=>e.open),false);
      if (width<=1120) {
        await page.locator('.chapter-nav>summary').click();
        assert.equal(await page.locator('.chapter-nav').evaluate(e=>e.open),true);
        await page.locator('.chapter-nav a[href="#wrong"]').click();
        await page.waitForURL('**/#wrong');
        await page.locator('.chapter-nav>summary').click();
        assert.equal(await page.locator('.chapter-nav').evaluate(e=>e.open),false);
      }
      await page.locator('.quarter-note>summary').click();
      assert.equal(await page.locator('.quarter-note').evaluate(e=>e.open),true);
      assert((await page.locator('.quarter-note').textContent()).includes('5%基准是昨收'));
      assert.deepEqual(errors,[]);
      results.push({width,samples:check.samples,repeatCategories:check.matrix,weeklySources:check.weeks.length,svgBars:check.visibleBars,overflow:false,interactions:'pass'});
      await page.close();
    }
    const page=await browser.newPage();
    await page.goto(base+'/monthly-quarterly-trading-review/');
    assert((await page.locator('a[href="./2026-q3/"]').textContent()).includes('反思已整合'));
    await page.locator('a[href="./2026-q3/"]').click();
    assert((await page.title()).includes('6–9月'));
    await page.goto(base+'/'+quarter+'#reflection');
    assert.equal(await page.locator('#reflection').getAttribute('data-status'),'integrated');
    await page.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log(JSON.stringify({idempotent:true,septemberUnchanged:true,results},null,2));
}
main().catch(error => {console.error(error);process.exitCode=1;});
