'use strict';
let editor;
let monacoApi;
const models = {};
const viewStates = {};
let currentFileType = 'html';
let previewTimer;
let storageReadable = true;

const defaultCodes = {
    html: `<!DOCTYPE html>\n<html lang="ja">\n\n<head>\n    <meta charset="UTF-8">\n    <title>ここにはタイトルが入ります</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n\n<body>\n\n    <h1>h1要素</h1>\n    <p>文章がここに入ります。</p>\n\n    <script src="script.js"></script>\n</body>\n\n</html>`,
    css: `body {\n    padding: 20px;\n    font-family: sans-serif;\n    background: #f0f0f0;\n}`,
    js: `console.log("JavaScript Loaded!");`
};

function readCode(type) {
    try {
        // Empty files are valid saved documents.
        return localStorage.getItem(`web_ide_${type}`) ?? defaultCodes[type];
    } catch (_) {
        storageReadable = false;
        return defaultCodes[type];
    }
}

function saveCode() {
    const status = document.getElementById('saveStatus');
    try {
        for (const type of Object.keys(models)) {
            localStorage.setItem(`web_ide_${type}`, models[type].getValue());
        }
        status.textContent = storageReadable
            ? '自動保存済: ' + new Date().toLocaleTimeString()
            : '以前の保存内容を読み込めませんでした。必要なコードをダウンロードしてください。';
    } catch (_) {
        status.textContent = '自動保存できません。コードをダウンロードしてください。';
    }
}

function updatePreview() {
    clearTimeout(previewTimer);
    document.getElementById('preview').srcdoc = buildPreview(
        models.html.getValue(), models.css.getValue(), models.js.getValue()
    );
}

function onCodeChanged() {
    // Persist immediately; only the expensive iframe reload is debounced.
    saveCode();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 250);
}

window.addEventListener('themeChanged', event => {
    if (monacoApi) monacoApi.editor.setTheme(event.detail === 'dark' ? 'vs-dark' : 'vs');
});

function editorLoadFailed() {
    document.getElementById('saveStatus').textContent = 'エディタを読み込めません。通信環境を確認して再読み込みしてください。';
}

if (typeof require !== 'function' || typeof require.config !== 'function') {
    editorLoadFailed();
} else {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
    require(['vs/editor/editor.main'], function (monaco) {
        monacoApi = monaco;
        models.html = monaco.editor.createModel(readCode('html'), 'html');
        models.css = monaco.editor.createModel(readCode('css'), 'css');
        models.js = monaco.editor.createModel(readCode('js'), 'javascript');
        editor = monaco.editor.create(document.getElementById('editor-container'), {
            model: models.html,
            theme: document.documentElement.dataset.theme === 'dark' ? 'vs-dark' : 'vs',
            automaticLayout: true,
            minimap: { enabled: false }
        });
        Object.values(models).forEach(model => model.onDidChangeContent(onCodeChanged));
        // Do not overwrite stored drafts merely by opening the editor.
        document.getElementById('saveStatus').textContent = storageReadable
            ? '編集内容はこのブラウザに自動保存されます'
            : '保存内容を読み込めません。コードをダウンロードしてください。';
        updatePreview();
    }, editorLoadFailed);
}

window.switchFile = function (fileType) {
    if (!editor || !Object.hasOwn(models, fileType) || fileType === currentFileType) return;
    viewStates[currentFileType] = editor.saveViewState();
    document.getElementById(`tab-${currentFileType}`).classList.remove('active');
    document.querySelector(`#tab-${currentFileType} .file-select`).setAttribute('aria-pressed', 'false');
    document.getElementById(`tab-${fileType}`).classList.add('active');
    document.querySelector(`#tab-${fileType} .file-select`).setAttribute('aria-pressed', 'true');
    editor.setModel(models[fileType]);
    if (viewStates[fileType]) editor.restoreViewState(viewStates[fileType]);
    currentFileType = fileType;
    editor.focus();
};

window.downloadFile = function (event, fileType) {
    event.stopPropagation();
    if (!editor || !Object.hasOwn(models, fileType)) return;
    const fileNames = { html: 'index.html', css: 'style.css', js: 'script.js' };
    const mimeTypes = { html: 'text/html', css: 'text/css', js: 'text/javascript' };
    const url = URL.createObjectURL(new Blob([models[fileType].getValue()], { type: mimeTypes[fileType] }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileNames[fileType];
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
