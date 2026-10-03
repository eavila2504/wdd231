import './main.js'; // shared init: footer meta, nav toggle, theme toggle
import { items } from '../data/items.mjs';

// ---------- Cards ----------
const grid = document.getElementById('discover-grid');

items.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = `discover-card item-${index}`; // item-N maps to a named grid area

    const title = document.createElement('h2');
    title.textContent = item.name;

    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = item.photo;
    img.alt = item.name;
    img.width = 300;
    img.height = 200;
    img.loading = index === 0 ? 'eager' : 'lazy';
    figure.appendChild(img);

    const address = document.createElement('address');
    address.textContent = item.address;

    const desc = document.createElement('p');
    desc.textContent = item.description;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'learn-more';
    button.textContent = 'Learn more';
    button.setAttribute('aria-label', `Learn more about ${item.name}`);
    button.addEventListener('click', () => {
        const query = encodeURIComponent(`${item.name} ${item.address}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener');
    });

    card.append(title, figure, address, desc, button);
    grid.appendChild(card);
});

// ---------- Last-visit message (localStorage) ----------
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const STORAGE_KEY = 'chamber-last-visit';
const messageBox = document.getElementById('visit-message');
const messageText = document.getElementById('visit-message-text');

function visitMessage() {
    const now = Date.now();
    let last = null;
    try {
        last = Number(localStorage.getItem(STORAGE_KEY)) || null;
        localStorage.setItem(STORAGE_KEY, String(now));
    } catch (err) {
        console.error('localStorage unavailable:', err);
    }

    if (!last) return 'Welcome! Let us know if you have any questions.';

    const diff = now - last;
    if (diff < MS_PER_DAY) return 'Back so soon! Awesome!';

    const days = Math.floor(diff / MS_PER_DAY);
    return `You last visited ${days} ${days === 1 ? 'day' : 'days'} ago.`;
}

messageText.textContent = visitMessage();
messageBox.hidden = false;
document.getElementById('visit-message-close').addEventListener('click', () => {
    messageBox.hidden = true;
});
