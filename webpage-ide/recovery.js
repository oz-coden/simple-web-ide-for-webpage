'use strict';
let snapshot = IdeFiles.read();
const dialog = document.getElementById('reset-dialog');
const status = document.getElementById('recovery-status');
function render() {
    for (const type of Object.keys(IdeFiles.names)) document.getElementById('saved-' + type).value = snapshot.codes[type];
    status.textContent = snapshot.readable ? '保存コードを表示しています。このページではコードを実行しません。' : '保存領域を読み込めません。表示は初期コードです。ブラウザの保存設定を確認してください。';
}
for (const type of Object.keys(IdeFiles.names)) document.getElementById('save-' + type).addEventListener('click', () => IdeFiles.save(type, snapshot.codes));
document.getElementById('save-all').addEventListener('click', () => {
    try { IdeFiles.saveAll(snapshot.codes); }
    catch (_) { status.textContent = 'ZIPを保存できませんでした。各ファイルを個別に保存してください。'; }
});
document.getElementById('reset-drafts').addEventListener('click', () => dialog.showModal());
document.getElementById('reset-cancel').addEventListener('click', () => dialog.close());
document.getElementById('reset-confirm').addEventListener('click', () => {
    const failed = IdeFiles.clear();
    snapshot = IdeFiles.read(); render(); dialog.close();
    status.textContent = failed.length ? '保存内容の一部を初期化できませんでした。ブラウザの保存設定を確認してください。' : '保存内容を初期化しました。エディタは初期コードで開きます。';
});
render();
