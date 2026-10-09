// Shared header behavior — import it from each page's module (main.js, book.js, testimonies.js)
export function initHeader() {
    const nav = document.getElementById("primary-nav");
    const navToggle = document.getElementById("nav-toggle");
    const themeToggle = document.getElementById("theme-toggle");

    navToggle?.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(open));
    });

    const root = document.documentElement;
    const apply = (theme) => {
        root.dataset.theme = theme;
        const dark = theme === "dark";
        themeToggle?.setAttribute("aria-pressed", String(dark));
        const label = dark ? "Switch to light mode" : "Switch to dark mode";
        themeToggle?.setAttribute("aria-label", label);
        themeToggle?.setAttribute("title", label);
    };

    apply(localStorage.getItem("adelia-theme") ?? "light");
    themeToggle?.addEventListener("click", () => {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        localStorage.setItem("adelia-theme", next);
        apply(next);
    });
}

export function initFooter() {
    const year = document.getElementById("currentyear");
    const modified = document.getElementById("lastModified");
    if (year) year.textContent = new Date().getFullYear();
    if (modified) modified.textContent = `Last modified: ${document.lastModified}`;
}