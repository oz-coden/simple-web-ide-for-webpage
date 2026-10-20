/* Resolve the two virtual files without executing or rewriting inline HTML text. */
(function (root) {
    'use strict';

    function dataUrl(content, type) {
        const bytes = new TextEncoder().encode(content);
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return `data:${type};base64,${btoa(binary)}`;
    }

    root.buildPreview = function (html, css, js) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const matchesFile = (value, name) => {
            const path = value.trim().split(/[?#]/, 1)[0];
            return path === name || path === `./${name}`;
        };
        doc.querySelectorAll('link[rel~="stylesheet"][href]').forEach(link => {
            if (matchesFile(link.getAttribute('href'), 'style.css')) {
                link.setAttribute('href', dataUrl(css, 'text/css'));
                link.removeAttribute('integrity');
            }
        });
        doc.querySelectorAll('script[src]').forEach(script => {
            if (matchesFile(script.getAttribute('src'), 'script.js')) {
                script.setAttribute('src', dataUrl(js, 'text/javascript'));
                // Integrity metadata for an external file does not describe edited code.
                script.removeAttribute('integrity');
            }
        });
        const doctype = doc.doctype ? new XMLSerializer().serializeToString(doc.doctype) + '\n' : '';
        return doctype + doc.documentElement.outerHTML;
    };
})(globalThis);
