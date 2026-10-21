(function () {
    'use strict';
    const defaults = Object.freeze({
        html: `<!DOCTYPE html>\n<html lang="ja">\n\n<head>\n    <meta charset="UTF-8">\n    <title>ここにはタイトルが入ります</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n\n<body>\n\n    <h1>h1要素</h1>\n    <p>文章がここに入ります。</p>\n\n    <script src="script.js"></script>\n</body>\n\n</html>`,
        css: `body {\n    padding: 20px;\n    font-family: sans-serif;\n    background: #f0f0f0;\n}`,
        js: `console.log("JavaScript Loaded!");`
    });
    const names = Object.freeze({ html: 'index.html', css: 'style.css', js: 'script.js' });
    const types = { html: 'text/html;charset=utf-8', css: 'text/css;charset=utf-8', js: 'text/javascript;charset=utf-8' };
    function read() {
        const codes = {};
        let readable = true;
        for (const type of Object.keys(names)) {
            try { codes[type] = localStorage.getItem('web_ide_' + type) ?? defaults[type]; }
            catch (_) { codes[type] = defaults[type]; readable = false; }
        }
        return { codes, readable };
    }
    function clear() {
        const failed = [];
        for (const type of Object.keys(names)) {
            try { localStorage.removeItem('web_ide_' + type); } catch (_) { failed.push(type); }
        }
        return failed;
    }
    function download(blob, name) {
        const url = URL.createObjectURL(blob), link = document.createElement('a');
        link.href = url; link.download = name;
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    function save(type, codes) {
        if (Object.hasOwn(names, type)) download(new Blob([codes[type]], { type: types[type] }), names[type]);
    }
    function saveAll(codes) {
        download(createSourceZip(Object.entries(names).map(([type, name]) => ({ name, content: codes[type] }))), 'webpage-source.zip');
    }
    window.IdeFiles = Object.freeze({ defaults, names, read, clear, save, saveAll });
})();
