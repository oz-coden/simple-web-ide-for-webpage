const assert = require('node:assert/strict');
const { test } = require('node:test');
const { unzipSync, strFromU8 } = require('fflate');
const createZip = require('../webpage-ide/archive.js');

test('ZIP is independently readable and preserves empty and UTF-8 files', async () => {
    const files = [{ name: 'index.html', content: '<h1>日本語 😀</h1>'.repeat(4000) }, { name: 'style.css', content: '' }, { name: 'script.js', content: 'console.log("ok");' }];
    const bytes = new Uint8Array(await createZip(files).arrayBuffer());
    const result = unzipSync(bytes);
    assert.deepEqual(Object.fromEntries(Object.entries(result).map(([name, data]) => [name, strFromU8(data)])), Object.fromEntries(files.map(file => [file.name, file.content])));
});
test('ZIP stores the standard CRC32 checksum and rejects unsupported entry counts', async () => {
    const data = await createZip([{ name: 'test.txt', content: '123456789' }]).arrayBuffer();
    assert.equal(new DataView(data).getUint32(14, true), 0xcbf43926);
    assert.throws(() => createZip(new Array(65536)), /多すぎます/);
});
