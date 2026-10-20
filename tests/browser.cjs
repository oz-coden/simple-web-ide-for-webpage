const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const monacoRoot = path.dirname(require.resolve('monaco-editor/package.json'));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
const server = createServer(async (req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
        const data = await readFile(file);
        res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
    } catch { res.writeHead(404).end(); }
});

(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const browser = await chromium.launch(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {});
    let passed = 0;
    async function check(name, run) { await run(); console.log(`PASS ${name}`); passed++; }
    async function setup(blockStorage = false, blockLoader = false) {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.route('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/**', async route => {
            if (blockLoader) { await route.abort(); return; }
            const suffix = new URL(route.request().url()).pathname.split('/0.45.0/')[1];
            const file = path.join(monacoRoot, suffix.replace('loader.min.js', 'loader.js'));
            await route.fulfill({ body: await readFile(file), contentType: types[path.extname(file)] || 'application/octet-stream' });
        });
        if (blockStorage) await page.addInitScript(() => {
            Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
            Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'QuotaExceededError'); };
        });
        await page.goto(base);
        if (!blockLoader) await page.waitForFunction(() => typeof editor !== 'undefined' && editor);
        return { context, page };
    }
    try {
        const { context, page } = await setup();
        const preview = page.frameLocator('#preview');
        const frame = () => page.frames().find(f => f.parentFrame() === page.mainFrame());
        await check('Pages root opens the IDE at its public subpath', async () => {
            assert.equal(new URL(page.url()).pathname, '/webpage-ide/');
            await preview.getByRole('heading', { name: 'h1要素' }).waitFor();
        });
        await check('CSS and module JavaScript resolve attribute variants and Unicode safely', async () => {
            await page.evaluate(() => {
                models.html.setValue(`<h1 id="probe">日本語</h1><link REL="stylesheet" HREF = './style.css?v=1'><script type="module" src = "./script.js#v1"></script><p data-example='src="script.js"'>literal</p>`);
                models.css.setValue('#probe { color: rgb(12, 34, 56); }');
                models.js.setValue(`document.querySelector('#probe').dataset.result = '実行済み </script>';`);
            });
            await preview.locator('#probe[data-result="実行済み </script>"]').waitFor();
            assert.equal(await frame().locator('#probe').evaluate(el => getComputedStyle(el).color), 'rgb(12, 34, 56)');
            assert.equal(await preview.locator('p').getAttribute('data-example'), 'src="script.js"');
        });
        await check('preview cannot read parent DOM or storage, navigate parent, or open popups', async () => {
            await page.evaluate(() => {
                models.js.setValue(`
                    const blocked = {};
                    try { parent.document.body.dataset.compromised = 'yes'; blocked.parent = false; } catch (_) { blocked.parent = true; }
                    try { localStorage.getItem('web_ide_html'); blocked.storage = false; } catch (_) { blocked.storage = true; }
                    try { top.location.href = 'https://example.invalid/'; blocked.navigation = false; } catch (_) { blocked.navigation = true; }
                    blocked.popup = window.open('about:blank') === null;
                    document.querySelector('#probe').textContent = JSON.stringify(blocked);
                `);
            });
            await preview.getByText('{"parent":true,"storage":true,"navigation":true,"popup":true}', { exact: true }).waitFor();
            assert.equal(await page.locator('body').getAttribute('data-compromised'), null);
            assert.equal(new URL(page.url()).pathname, '/webpage-ide/');
        });
        await check('empty drafts survive reload and changes save before preview debounce', async () => {
            await page.evaluate(() => Object.values(models).forEach(model => model.setValue('')));
            assert.deepEqual(await page.evaluate(() => ['html', 'css', 'js'].map(t => localStorage.getItem(`web_ide_${t}`))), ['', '', '']);
            await page.reload();
            await page.waitForFunction(() => typeof editor !== 'undefined' && editor);
            assert.deepEqual(await page.evaluate(() => Object.values(models).map(model => model.getValue())), ['', '', '']);
        });
        await check('file controls work with the keyboard and downloads contain original text', async () => {
            await page.getByRole('button', { name: 'style.css', exact: true }).press('Enter');
            assert.equal(await page.getByRole('button', { name: 'style.css', exact: true }).getAttribute('aria-pressed'), 'true');
            await page.evaluate(() => models.css.setValue('/* 日本語 */\nbody { color: red; }'));
            const downloadEvent = page.waitForEvent('download');
            await page.getByTitle('CSSを保存').click();
            const download = await downloadEvent;
            assert.equal(download.suggestedFilename(), 'style.css');
            assert.equal(await readFile(await download.path(), 'utf8'), '/* 日本語 */\nbody { color: red; }');
        });
        await check('theme persists and mobile layout stays inside the viewport', async () => {
            await page.getByRole('button', { name: 'ダークテーマに切り替え' }).click();
            await page.reload();
            await page.waitForFunction(() => typeof editor !== 'undefined' && editor);
            assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
            await page.setViewportSize({ width: 390, height: 844 });
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
            assert.ok((await page.locator('#editor-container').boundingBox()).height > 100);
            assert.ok((await page.locator('#preview').boundingBox()).height > 100);
        });
        await context.close();
        await check('blocked storage does not stop editing, scripts, themes, or status reporting', async () => {
            const { context, page } = await setup(true);
            await page.evaluate(() => models.html.setValue('<h1>保存失敗時のプレビュー</h1>'));
            await page.frameLocator('#preview').getByRole('heading', { name: '保存失敗時のプレビュー' }).waitFor();
            assert.match(await page.locator('#saveStatus').innerText(), /自動保存できません/);
            await page.getByRole('button', { name: 'ダークテーマに切り替え' }).click();
            assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
            await context.close();
        });
        await check('one failed file save does not block other files or hide unsaved changes', async () => {
            const { context, page } = await setup();
            await page.evaluate(() => {
                window.rejectCssSave = true;
                const originalSetItem = Storage.prototype.setItem;
                Storage.prototype.setItem = function (key, value) {
                    if (key === 'web_ide_css' && window.rejectCssSave) {
                        throw new DOMException('Full', 'QuotaExceededError');
                    }
                    return originalSetItem.call(this, key, value);
                };
                models.css.setValue('body { color: blue; }');
                models.js.setValue('document.body.dataset.saved = "yes";');
            });
            assert.equal(await page.evaluate(() => localStorage.getItem('web_ide_js')), 'document.body.dataset.saved = "yes";');
            assert.match(await page.getByRole('status').innerText(), /自動保存できません/);
            await page.evaluate(() => {
                window.rejectCssSave = false;
                models.html.setValue('<h1>未保存のCSSが残っています</h1>');
            });
            assert.match(await page.getByRole('status').innerText(), /自動保存できません/);
            await page.evaluate(() => models.css.setValue('body { color: green; }'));
            assert.equal(await page.evaluate(() => localStorage.getItem('web_ide_css')), 'body { color: green; }');
            assert.match(await page.getByRole('status').innerText(), /自動保存済/);
            await context.close();
        });
        await check('missing CDN loader produces a useful error', async () => {
            const { context, page } = await setup(false, true);
            await page.getByRole('status').filter({ hasText: 'エディタを読み込めません' }).waitFor();
            await context.close();
        });
        console.log(`${passed} browser regression checks passed`);
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
