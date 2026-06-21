let editor;
const models = {};
let currentFileType = 'html';
let currentCssUrl = null;
let currentJsUrl = null;

const defaultCodes = {
    html: `<!DOCTYPE html>\n<html lang="ja">\n\n<head>\n    <meta charset="UTF-8">\n    <title>ここにはタイトルが入ります</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n\n<body>\n\n    <h1>h1要素</h1>\n    <p>文章がここに入ります。</p>\n\n    <script src="script.js"></script>\n</body>\n\n</html>`,
    css: `body {\n    padding: 20px;\n    font-family: sans-serif;\n    background: #f0f0f0;\n}`,
    js: `console.log("JavaScript Loaded!");`,
    theme: `dark`
};

const savedTheme = localStorage.getItem('web_ide_theme') || 'dark';

document.documentElement.setAttribute('data-theme', savedTheme);

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.textContent = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    }
});

require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

require(['vs/editor/editor.main'], function (monaco) {
    const savedHtml = localStorage.getItem('web_ide_html') || defaultCodes.html;
    const savedCss = localStorage.getItem('web_ide_css') || defaultCodes.css;
    const savedJs = localStorage.getItem('web_ide_js') || defaultCodes.js;

    models.html = monaco.editor.createModel(savedHtml, "html");
    models.css = monaco.editor.createModel(savedCss, "css");
    models.js = monaco.editor.createModel(savedJs, "javascript");

    editor = monaco.editor.create(document.getElementById('editor-container'), {
        model: models.html,
        theme: `vs-${savedTheme}`,
        automaticLayout: true,
        minimap: { enabled: false }
    });

    models.html.onDidChangeContent(updatePreview);
    models.css.onDidChangeContent(updatePreview);
    models.js.onDidChangeContent(updatePreview);

    updatePreview();
});

window.switchFile = function (fileType) {
    if (!editor) return;
    document.getElementById(`tab-${currentFileType}`).classList.remove('active');
    document.getElementById(`tab-${fileType}`).classList.add('active');
    editor.setModel(models[fileType]);
    currentFileType = fileType;
};

window.downloadFile = function (event, fileType) {
    event.stopPropagation();

    if (!editor) return;

    const fileNames = { html: 'index.html', css: 'style.css', js: 'script.js' };
    const mimeTypes = { html: 'text/html', css: 'text/css', js: 'text/javascript' };

    const content = models[fileType].getValue();
    const blob = new Blob([content], { type: mimeTypes[fileType] });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileNames[fileType];
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

function updatePreview() {
    if (currentCssUrl) URL.revokeObjectURL(currentCssUrl);
    if (currentJsUrl) URL.revokeObjectURL(currentJsUrl);

    const htmlCode = models.html.getValue();
    const cssCode = models.css.getValue();
    const jsCode = models.js.getValue();

    currentCssUrl = URL.createObjectURL(new Blob([cssCode], { type: 'text/css' }));
    currentJsUrl = URL.createObjectURL(new Blob([jsCode], { type: 'text/javascript' }));

    let finalHtml = htmlCode.replace(/href=["']style\.css["']/g, `href="${currentCssUrl}"`)
        .replace(/src=["']script\.js["']/g, `src="${currentJsUrl}"`);

    document.getElementById('preview').srcdoc = finalHtml;

    localStorage.setItem('web_ide_html', htmlCode);
    localStorage.setItem('web_ide_css', cssCode);
    localStorage.setItem('web_ide_js', jsCode);

    document.getElementById('saveStatus').textContent = "自動保存済:  " + new Date().toLocaleTimeString();
}

window.toggleTheme = function () {
    const htmlTag = document.documentElement;
    const themeBtn = document.getElementById('themeToggleBtn');

    const currentTheme = htmlTag.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    htmlTag.setAttribute('data-theme', newTheme);

    themeBtn.textContent = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';

    if (editor) {
        monaco.editor.setTheme(newTheme === 'dark' ? 'vs-dark' : 'vs');
    }

    localStorage.setItem('web_ide_theme', newTheme);
}