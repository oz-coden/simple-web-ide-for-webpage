'use strict';
let editor;
let monacoApi;
const models = {};
const viewStates = {};
let currentFileType = 'html';
let previewTimer;
let resetting = false;
const initialDrafts = IdeFiles.read();
let storageReadable = initialDrafts.readable;
const unsavedFiles = new Set();
const automatic = document.getElementById('auto-preview');
const frame = document.getElementById('preview');
const paused = document.getElementById('preview-paused');
const previewStatus = document.getElementById('preview-status');
const resetDialog = document.getElementById('reset-dialog');

function codes() {
    return Object.fromEntries(Object.keys(IdeFiles.names).map(type => [type, models[type]?.getValue() ?? initialDrafts.codes[type]]));
}
function showSaveStatus() {
    document.getElementById('saveStatus').textContent = unsavedFiles.size
        ? '自動保存できません。未保存のコードをダウンロードしてください。'
        : storageReadable ? '自動保存済: ' + new Date().toLocaleTimeString()
        : '以前の保存内容を読み込めませんでした。必要なコードをダウンロードしてください。';
}
function saveCode(type) {
    try { localStorage.setItem('web_ide_' + type, models[type].getValue()); unsavedFiles.delete(type); }
    catch (_) { unsavedFiles.add(type); }
    showSaveStatus();
}
function stopPreview() {
    clearTimeout(previewTimer);
    automatic.checked = false;
    frame.srcdoc = '';
    frame.hidden = true;
    paused.hidden = false;
    previewStatus.textContent = 'プレビューは停止中です。保存済みコードも起動時には実行しません。';
}
function updatePreview() {
    clearTimeout(previewTimer);
    if (!editor) return;
    const source = codes();
    frame.srcdoc = buildPreview(source.html, source.css, source.js);
    frame.hidden = false;
    paused.hidden = true;
    previewStatus.textContent = automatic.checked ? '編集後にプレビューを自動実行します。' : '現在のコードを実行しました。編集後は再実行してください。';
}
function onCodeChanged(type) {
    if (resetting) return;
    saveCode(type);
    clearTimeout(previewTimer);
    if (automatic.checked) previewTimer = setTimeout(updatePreview, 250);
}
function theme() { return document.documentElement.dataset.theme === 'dark' ? 'vs-dark' : 'oz-light'; }
window.addEventListener('themeChanged', () => { if (monacoApi) monacoApi.editor.setTheme(theme()); });
function editorLoadFailed() {
    document.getElementById('saveStatus').textContent = 'エディタを読み込めません。保存内容はZIP保存・復旧ページから回収できます。通信環境も確認してください。';
}
function initializeEditor() {
    if (typeof require !== 'function' || typeof require.config !== 'function') { editorLoadFailed(); return; }
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
    require(['vs/editor/editor.main'], function (monaco) {
        monacoApi = monaco;
        monaco.editor.defineTheme('oz-light', {
            base: 'vs', inherit: true,
            rules: [
                { token: 'delimiter.html', foreground: '595959' },
                { token: 'metatag.html', foreground: '595959' },
                { token: 'metatag.content.html', foreground: 'A31515' },
                { token: 'attribute.name.html', foreground: 'A31515' }
            ], colors: {}
        });
        for (const [type, language] of Object.entries({ html: 'html', css: 'css', js: 'javascript' })) {
            models[type] = monaco.editor.createModel(initialDrafts.codes[type], language);
            models[type].onDidChangeContent(() => onCodeChanged(type));
        }
        editor = monaco.editor.create(document.getElementById('editor-container'), { model: models.html, theme: theme(), automaticLayout: true, minimap: { enabled: false } });
        document.getElementById('run-preview').disabled = false;
        automatic.disabled = false;
        document.getElementById('reset-drafts').disabled = false;
        document.getElementById('saveStatus').textContent = storageReadable ? '編集内容はこのブラウザに自動保存されます' : '保存内容を読み込めません。コードをダウンロードしてください。';
        // Restored drafts remain inert until an explicit run, including after a looping preview.
    }, editorLoadFailed);
}
const loader = document.createElement('script');
loader.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
loader.addEventListener('load', initializeEditor);
loader.addEventListener('error', editorLoadFailed);
document.head.append(loader);
window.switchFile = function (type) {
    if (!editor || !Object.hasOwn(models, type) || type === currentFileType) return;
    viewStates[currentFileType] = editor.saveViewState();
    document.getElementById('tab-' + currentFileType).classList.remove('active');
    document.querySelector('#tab-' + currentFileType + ' .file-select').setAttribute('aria-pressed', 'false');
    document.getElementById('tab-' + type).classList.add('active');
    document.querySelector('#tab-' + type + ' .file-select').setAttribute('aria-pressed', 'true');
    editor.setModel(models[type]);
    if (viewStates[type]) editor.restoreViewState(viewStates[type]);
    currentFileType = type;
    editor.focus();
};
window.downloadFile = function (event, type) { event.stopPropagation(); IdeFiles.save(type, codes()); };
document.getElementById('save-all').addEventListener('click', () => {
    try { IdeFiles.saveAll(codes()); }
    catch (_) { document.getElementById('saveStatus').textContent = 'ZIPを保存できませんでした。各ファイルを個別に保存してください。'; }
});
document.getElementById('run-preview').addEventListener('click', updatePreview);
document.getElementById('stop-preview').addEventListener('click', stopPreview);
automatic.addEventListener('change', () => { clearTimeout(previewTimer); if (automatic.checked) updatePreview(); });
document.getElementById('reset-drafts').addEventListener('click', () => resetDialog.showModal());
document.getElementById('reset-cancel').addEventListener('click', () => resetDialog.close());
document.getElementById('reset-confirm').addEventListener('click', () => {
    stopPreview();
    IdeFiles.clear();
    resetting = true;
    for (const type of Object.keys(models)) { models[type].setValue(IdeFiles.defaults[type]); delete viewStates[type]; }
    resetting = false;
    for (const type of Object.keys(models)) saveCode(type);
    resetDialog.close();
    document.getElementById('run-preview').focus();
});
