// ---------- Footer: year & last modified ----------
document.getElementById('currentyear').textContent = new Date().getFullYear();
document.getElementById('lastModified').textContent = `Last Modification: ${document.lastModified}`;

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('nav-toggle');
const primaryNav = document.getElementById('primary-nav');

navToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

// ---------- Theme toggle (light / dark) ----------
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

// ---------- Grid / List view toggle ----------
const gridBtn = document.getElementById('grid-btn');
const listBtn = document.getElementById('list-btn');
const cardsContainer = document.getElementById('cards');

function setView(view) {
    const isGrid = view === 'grid';
    cardsContainer.classList.toggle('cards--grid', isGrid);
    cardsContainer.classList.toggle('cards--list', !isGrid);

    gridBtn.classList.toggle('is-active', isGrid);
    gridBtn.setAttribute('aria-pressed', String(isGrid));

    listBtn.classList.toggle('is-active', !isGrid);
    listBtn.setAttribute('aria-pressed', String(!isGrid));
}

gridBtn.addEventListener('click', () => setView('grid'));
listBtn.addEventListener('click', () => setView('list'));

// ---------- Fetch and render member businesses ----------
const dataUrl = 'data/chamber-directory.json';
const loadStatus = document.getElementById('load-status');

const MEMBERSHIP_LABELS = {
    1: 'Member',
    2: 'Silver Member',
    3: 'Gold Member'
};

const FALLBACK_IMAGE =
    'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
            <rect width="96" height="96" fill="#EFE7D6"/>
            <path d="M28 78V30l20-12 20 12v48" fill="none" stroke="#B98A2E" stroke-width="2"/>
            <rect x="40" y="46" width="16" height="32" fill="none" stroke="#B98A2E" stroke-width="2"/>
            <rect x="34" y="34" width="8" height="8" fill="none" stroke="#B98A2E" stroke-width="2"/>
            <rect x="54" y="34" width="8" height="8" fill="none" stroke="#B98A2E" stroke-width="2"/>
        </svg>
    `);


function formatPhone(raw) {
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

function buildCard(business) {
    const card = document.createElement('article');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';

    const compname = (business.compname || 'Business Name').trim();
    const address = (business.adresses || '').trim();

    const name = document.createElement('h2');
    name.textContent = compname;
    header.appendChild(name);

    const tagline = document.createElement('p');
    tagline.className = 'card-tagline';
    tagline.textContent = address;
    header.appendChild(tagline);

    const body = document.createElement('div');
    body.className = 'card-body';

    const photo = document.createElement('img');
    photo.className = 'card-photo';
    photo.src = business.imageurl && business.imageurl !== 'N/A' ? business.imageurl : FALLBACK_IMAGE;
    photo.alt = `Logo of ${compname}`;
    photo.loading = 'lazy';
    photo.width = 96;
    photo.height = 96;
    // Some thumbnail URLs are unreliable (expired Google cache links) — fall back gracefully.
    photo.addEventListener('error', () => {
        photo.src = FALLBACK_IMAGE;
    }, { once: true });
    body.appendChild(photo);

    const details = document.createElement('div');
    details.className = 'card-details';

    const email = document.createElement('p');
    const emailValue = (business.email || 'N/A').trim();
    email.innerHTML = `<strong>Email:</strong> `;
    if (emailValue !== 'N/A') {
        const a = document.createElement('a');
        a.href = `mailto:${emailValue}`;
        a.textContent = emailValue;
        email.appendChild(a);
    } else {
        email.append('N/A');
    }
    details.appendChild(email);

    const phone = document.createElement('p');
    phone.innerHTML = `<strong>Phone:</strong> ${formatPhone(business.phnumber)}`;
    details.appendChild(phone);

    const url = document.createElement('p');
    url.innerHTML = `<strong>URL:</strong> `;
    if (business.url && business.url !== 'N/A') {
        const a = document.createElement('a');
        a.href = business.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = business.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        url.appendChild(a);
    } else {
        url.append('N/A');
    }
    details.appendChild(url);

    if (business.membershiplvl) {
        const level = document.createElement('p');
        level.innerHTML = `<strong>Level:</strong> ${MEMBERSHIP_LABELS[business.membershiplvl] || business.membershiplvl}`;
        details.appendChild(level);
    }

    body.appendChild(details);

    card.appendChild(header);
    card.appendChild(body);
    return card;
}

async function getChamberData() {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = await response.json();
        displayChamber(data.company || []);
    } catch (err) {
        loadStatus.textContent = 'Sorry, member businesses could not be loaded right now.';
        console.error('Chamber directory fetch error:', err);
    }
}

function displayChamber(businesses) {
    cardsContainer.innerHTML = '';
    businesses.forEach((business) => {
        cardsContainer.appendChild(buildCard(business));
    });
    loadStatus.hidden = true;
}

getChamberData();