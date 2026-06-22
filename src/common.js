document.addEventListener("DOMContentLoaded", () => {
    const htmlTag = document.documentElement;
    const themeBtns = document.querySelectorAll(".theme-toggle-btn");
    const STORAGE_KEY = "oz_tools_theme";

    let currentTheme = htmlTag.getAttribute("data-theme") || "light";

    const updateButtonUI = (theme) => {
        themeBtns.forEach(btn => {
            btn.textContent = theme === "light" ? "🌙" : "☀️";
        });
    };

    updateButtonUI(currentTheme);

    themeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            currentTheme = currentTheme === "light" ? "dark" : "light";
            
            htmlTag.setAttribute("data-theme", currentTheme);
            localStorage.setItem(STORAGE_KEY, currentTheme);
            updateButtonUI(currentTheme);

            window.dispatchEvent(new CustomEvent('themeChanged', { detail: currentTheme }));
        });
    });
});