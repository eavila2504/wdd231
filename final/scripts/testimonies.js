import { initHeader, initFooter } from "./header.js";
import { getJSON } from "./data.js";

// ---------- settings ----------
const DATA_URL = "data/testimonies.json"; 
const VISIBLE = 3;       
const INTERVAL = 7000;   
const FADE_MS = 350;      

// ---------- DOM ----------
const list = document.getElementById("testimonies-list");
const shuffleBtn = document.getElementById("shuffle-btn");
const autoplayBtn = document.getElementById("autoplay-btn");

// ---------- state ----------
let all = [];
let current = [];
let timer = null;
let busy = false;      
let hovering = false;  
let userPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- STEP 1: small helpers ----------
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

// Fisher-Yates: an unbiased shuffle 
function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// This turns them into the direct image URL so the JSON can keep either kind.
function toImageURL(url) {
    const match = url.match(/pexels\.com\/photo\/.*-(\d+)\/?$/);
    if (!match) return url;
    const id = match[1];
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop`;
}

// ---------- STEP 2: build one card ----------
function createAvatar(testimony) {
    const avatar = el("span", "testimony-avatar");
    avatar.setAttribute("aria-hidden", "true");
    const initial = testimony.name.charAt(0).toUpperCase();

    if (!testimony.imageURL) {
        avatar.textContent = initial;
        return avatar;
    }

    const img = document.createElement("img");
    img.src = toImageURL(testimony.imageURL);
    img.alt = "";                 
    img.width = 48;
    img.height = 48;
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", () => avatar.replaceChildren(initial));
    avatar.append(img);
    return avatar;
}

function createCard(testimony) {
    const item = el("li");
    const figure = el("figure", "testimony");

    const quote = el("blockquote");
    quote.append(el("p", null, testimony.testimony));

    const who = el("div");
    who.append(
        el("p", "testimony-name", testimony.name),
        el("p", "testimony-meta", `${testimony.age} years old, ${testimony.location}`)
    );

    const caption = el("figcaption");
    caption.append(createAvatar(testimony), who);

    figure.append(quote, caption);
    item.append(figure);
    return item;
}

// ---------- STEP 3: pick 3 at random (never the ones already on screen) ----------
function pickNext() {
    const shownIds = new Set(current.map((t) => t.id));
    let pool = all.filter((t) => !shownIds.has(t.id));
    if (pool.length < VISIBLE) pool = all;   // tiny lists: allow repeats
    return shuffle(pool).slice(0, VISIBLE);
}

// ---------- STEP 4: render, with a fade between sets ----------
function paint(testimonies) {
    current = testimonies;
    list.replaceChildren(...testimonies.map(createCard));
    list.setAttribute("aria-busy", "false");
}

function rotate() {
    if (busy || all.length === 0) return;
    busy = true;
    list.classList.add("is-fading");
    setTimeout(() => {
        paint(pickNext());
        list.classList.remove("is-fading");
        busy = false;
    }, FADE_MS);
}

// ---------- STEP 5: automatic change + pause rules ----------
function stopTimer() {
    clearInterval(timer);
    timer = null;
}

function startTimer() {
    stopTimer();
    if (userPaused || hovering || document.hidden || all.length <= VISIBLE) return;
    timer = setInterval(rotate, INTERVAL);
}

function syncAutoplayButton() {
    autoplayBtn.textContent = userPaused ? "Play" : "Pause";
}

// ---------- STEP 6: events ----------
shuffleBtn.addEventListener("click", () => {
    rotate();
    startTimer();   // restart the countdown after a manual change
});

autoplayBtn.addEventListener("click", () => {
    userPaused = !userPaused;
    syncAutoplayButton();
    startTimer();
});

// don't change the text while someone is reading it
list.addEventListener("mouseenter", () => { hovering = true; startTimer(); });
list.addEventListener("mouseleave", () => { hovering = false; startTimer(); });
list.addEventListener("focusin", () => { hovering = true; startTimer(); });
list.addEventListener("focusout", () => { hovering = false; startTimer(); });

// no point rotating in a background tab
document.addEventListener("visibilitychange", startTimer);

// ---------- start ----------
async function init() {
    initHeader();
    initFooter();
    syncAutoplayButton();
    try {
        const data = await getJSON(DATA_URL);
        all = data.testimonies;
        paint(shuffle(all).slice(0, VISIBLE));
        startTimer();
    } catch (error) {
        console.error(error);
        list.setAttribute("aria-busy", "false");
        list.replaceChildren(
            el("li", "testimonies-status", "We couldn't load the testimonies. Please try again later.")
        );
        shuffleBtn.hidden = true;
        autoplayBtn.hidden = true;
    }
}

init();

