document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const buttons = document.querySelectorAll('.theme-toggle-btn');
    const update = () => {
        const dark = html.dataset.theme === 'dark';
        buttons.forEach(button => {
            button.textContent = dark ? '☀️' : '🌙';
            button.setAttribute('aria-label', dark ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え');
        });
    };
    update();
    buttons.forEach(button => button.addEventListener('click', () => {
        const theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
        html.dataset.theme = theme;
        try { localStorage.setItem('oz_tools_theme', theme); } catch (_) {}
        update();
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    }));
});
