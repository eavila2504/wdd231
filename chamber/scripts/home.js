import { MEMBERSHIP_LABELS, FALLBACK_IMAGE, formatPhone } from './main.js';

// ============================================================
// Weather — OpenWeatherMap (current conditions + 3-day forecast)
// ============================================================

const myTown = document.querySelector('#town');
const myDescription = document.querySelector('#description');
const myTemperature = document.querySelector('#temperature');
const myGraphic = document.querySelector('#graphic');
const myForecast = document.querySelector('#weather-forecast');

const myKey = 'a5633f47ee001ae105eaa381664cdac3';
// Puebla, Mexico
const myLat = '19.0414';
const myLong = '-98.2063';
const myUnits = 'metric'; 

const currentURL = `https://api.openweathermap.org/data/2.5/weather?lat=${myLat}&lon=${myLong}&appid=${myKey}&units=${myUnits}`;
const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${myLat}&lon=${myLong}&appid=${myKey}&units=${myUnits}`;

async function apiFetch() {
    try {
        const response = await fetch(currentURL);
        if (response.ok) {
            const data = await response.json();
            displayResults(data);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.log(error);
        if (myDescription) myDescription.textContent = 'Weather data is unavailable right now.';
    }
}

function displayResults(data) {
    myTown.innerHTML = data.name;
    myDescription.innerHTML = data.weather[0].description;
    myTemperature.innerHTML = `${Math.round(data.main.temp)}&deg;C`;
    const iconsrc = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    myGraphic.setAttribute('src', iconsrc);
    myGraphic.setAttribute('alt', data.weather[0].description);
}

apiFetch();

// ---- 3-day forecast (5 day / 3 hour endpoint, grouped by local day) ----
async function forecastFetch() {
    if (!myForecast) return;
    try {
        const response = await fetch(forecastURL);
        if (!response.ok) throw Error(await response.text());
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.log(error);
        myForecast.innerHTML = '<li>3-day forecast unavailable right now.</li>';
    }
}

function displayForecast(data) {
    const offsetSeconds = data.city.timezone; // seconds, city-local offset from UTC

    // Group the 3-hour entries by the city's local calendar date.
    const byDate = {};
    data.list.forEach((entry) => {
        const localMs = (entry.dt + offsetSeconds) * 1000;
        const localDate = new Date(localMs);
        const dateKey = localDate.toISOString().slice(0, 10); // YYYY-MM-DD (already local, shifted)

        if (!byDate[dateKey]) byDate[dateKey] = [];
        byDate[dateKey].push({ ...entry, localDate, localHour: localDate.getUTCHours() });
    });

    const todayKey = new Date((Date.now() / 1000 + offsetSeconds) * 1000).toISOString().slice(0, 10);
    const upcomingDates = Object.keys(byDate).filter((d) => d !== todayKey).slice(0, 3);

    myForecast.innerHTML = '';
    upcomingDates.forEach((dateKey) => {
        const entries = byDate[dateKey];
        const hi = Math.round(Math.max(...entries.map((e) => e.main.temp_max)));
        const lo = Math.round(Math.min(...entries.map((e) => e.main.temp_min)));

        // Pick the entry closest to local noon as the representative icon/description.
        const midday = entries.reduce((best, e) =>
            Math.abs(e.localHour - 12) < Math.abs(best.localHour - 12) ? e : best
        );

        const dayLabel = midday.localDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        const icon = midday.weather[0].icon;
        const desc = midday.weather[0].description;

        const li = document.createElement('li');
        li.className = 'forecast-day';
        li.innerHTML = `
            <span class="forecast-day-label">${dayLabel}</span>
            <img class="forecast-icon-img" src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
            <span class="forecast-desc">${desc}</span>
            <span class="forecast-temps"><strong>${hi}°</strong> / ${lo}°C</span>
        `;
        myForecast.appendChild(li);
    });
}

forecastFetch();

// ============================================================
// Member spotlight — 2–3 random Gold/Silver members from members.json
// ============================================================

async function loadSpotlight() {
    const spotlightEl = document.getElementById('spotlight-cards');
    if (!spotlightEl) return;

    try {
        const response = await fetch('data/members.json');
        if (!response.ok) throw new Error(`Members request failed: ${response.status}`);
        const data = await response.json();
        const all = data.company || [];

        // Only Gold (3) and Silver (2) members qualify for the spotlight.
        const eligible = all.filter((b) => b.membershiplvl === 2 || b.membershiplvl === 3);

        // Shuffle (Fisher–Yates) so the pick changes on every page render.
        const shuffled = [...eligible];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const count = Math.random() < 0.5 ? 2 : 3;
        const picks = shuffled.slice(0, Math.min(count, shuffled.length));

        spotlightEl.innerHTML = '';
        picks.forEach((business) => spotlightEl.appendChild(buildSpotlightCard(business)));
    } catch (err) {
        spotlightEl.textContent = 'Member spotlight is unavailable right now.';
        console.error('Spotlight fetch error:', err);
    }
}

function buildSpotlightCard(business) {
    const compname = (business.compname || 'Business Name').trim();
    const address = (business.adresses || '').trim();
    const levelLabel = MEMBERSHIP_LABELS[business.membershiplvl] || 'Member';

    const card = document.createElement('article');
    card.className = 'spotlight-card';

    const badge = document.createElement('span');
    badge.className = `spotlight-badge spotlight-badge--${business.membershiplvl === 3 ? 'gold' : 'silver'}`;
    badge.textContent = levelLabel;
    card.appendChild(badge);

    const photo = document.createElement('img');
    photo.className = 'spotlight-photo';
    photo.src = business.imageurl && business.imageurl !== 'N/A' ? business.imageurl : FALLBACK_IMAGE;
    photo.alt = `Logo of ${compname}`;
    photo.loading = 'lazy';
    photo.width = 96;
    photo.height = 96;
    photo.addEventListener('error', () => { photo.src = FALLBACK_IMAGE; }, { once: true });
    card.appendChild(photo);

    const name = document.createElement('h3');
    name.textContent = compname;
    card.appendChild(name);

    const addr = document.createElement('p');
    addr.className = 'spotlight-address';
    addr.textContent = address;
    card.appendChild(addr);

    const contact = document.createElement('p');
    contact.className = 'spotlight-contact';
    if (business.url && business.url !== 'N/A') {
        const a = document.createElement('a');
        a.href = business.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = business.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        contact.appendChild(a);
    } else {
        contact.innerHTML = `<strong>Phone:</strong> ${formatPhone(business.phnumber)}`;
    }
    card.appendChild(contact);

    return card;
}

loadSpotlight();