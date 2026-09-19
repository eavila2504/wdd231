// ============================================================
// main.js — shared module: footer info, nav toggle, theme toggle,
// and helpers reused by chamber.js and home.js.
// ============================================================

export function initFooterMeta() {
    document.getElementById('currentyear').textContent = new Date().getFullYear();
    document.getElementById('lastModified').textContent = `Last Modification: ${document.lastModified}`;
}

export function initNavToggle() {
    const navToggle = document.getElementById('nav-toggle');
    const primaryNav = document.getElementById('primary-nav');

    navToggle.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });
}

export function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;

    themeToggle.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';

        if (next === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }

        themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
        themeToggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        themeToggle.title = themeToggle.getAttribute('aria-label');
    });
}

// ---------- Shared member-data helpers (used by chamber.js and home.js) ----------

export const MEMBERSHIP_LABELS = {
    1: 'Member',
    2: 'Silver Member',
    3: 'Gold Member'
};

// Generic building icon shown when a business photo fails to load.
export const FALLBACK_IMAGE =
    'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
            <rect width="96" height="96" fill="#EFE7D6"/>
            <path d="M28 78V30l20-12 20 12v48" fill="none" stroke="#B98A2E" stroke-width="2"/>
            <rect x="40" y="46" width="16" height="32" fill="none" stroke="#B98A2E" stroke-width="2"/>
            <rect x="34" y="34" width="8" height="8" fill="none" stroke="#B98A2E" stroke-width="2"/>
            <rect x="54" y="34" width="8" height="8" fill="none" stroke="#B98A2E" stroke-width="2"/>
        </svg>
    `);

// The sample data mixes real 10-digit numbers with malformed longer ones,
// so this formats what it can and otherwise just groups digits for readability.
export function formatPhone(raw) {
    const digits = String(raw).replace(/\D/g, '');

    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    // Fallback: group remaining digits in 3s so long/short numbers stay readable.
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ---------- Run the shared UI behavior on every page that imports this module ----------
initFooterMeta();
initNavToggle();
initThemeToggle();