import './main.js'; // shared header/footer/theme behavior (auto-runs on import)
import { items } from '../data/items.mjs'; // NAMED import — items.mjs uses "export const items"

// ============================================================
// Build the 8 discover cards
// ============================================================

const grid = document.getElementById('discover-grid');

function buildCard(item, index) {
    const card = document.createElement('section');
    card.className = `discover-card item-${index}`;

    const h2 = document.createElement('h2');
    h2.textContent = item.iName;
    card.appendChild(h2);

    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = item.iPhoto;
    img.alt = item.iName;
    img.loading = 'lazy';
    img.width = 300;
    img.height = 200;
    figure.appendChild(img);
    card.appendChild(figure);

    const address = document.createElement('address');
    address.textContent = item.iAddress;
    card.appendChild(address);

    const p = document.createElement('p');
    p.textContent = item.iDescription;
    card.appendChild(p);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'learn-more';
    button.textContent = 'Learn More';
    button.title = `Open ${item.iName} in Google Maps`;
    button.addEventListener('click', () => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.iAddress)}`;
        window.open(mapsUrl, '_blank', 'noopener');
    });
    card.appendChild(button);

    return card;
}

if (grid) {
    items.slice(0, 8).forEach((item, index) => grid.appendChild(buildCard(item, index)));
}

// ============================================================
// Last-visit message (localStorage)
// ============================================================

const VISIT_KEY = 'discoverLastVisit';
const messageEl = document.getElementById('visit-message');
const messageText = document.getElementById('visit-message-text');
const closeBtn = document.getElementById('visit-message-close');

function showVisitMessage() {
    if (!messageEl || !messageText) return;

    const now = Date.now();
    const lastVisit = localStorage.getItem(VISIT_KEY);

    let text;
    if (!lastVisit) {
        text = 'Welcome! Let us know if you have any questions.';
    } else {
        const msSince = now - Number(lastVisit);
        const oneDay = 1000 * 60 * 60 * 24;

        if (msSince < oneDay) {
            text = 'Back so soon! Awesome!';
        } else {
            const days = Math.floor(msSince / oneDay);
            text = `You last visited ${days} ${days === 1 ? 'day' : 'days'} ago.`;
        }
    }

    messageText.textContent = text;
    messageEl.hidden = false;

    localStorage.setItem(VISIT_KEY, String(now));
}

if (closeBtn && messageEl) {
    closeBtn.addEventListener('click', () => { messageEl.hidden = true; });
}

showVisitMessage();