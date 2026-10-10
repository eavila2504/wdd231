import { initHeader, initFooter } from "./header.js";
import { getJSON } from "./data.js";

// header and footer first: they must work even if the map fails
initHeader();
initFooter();

const DATA_URL = "data/branches.json";
const TILES_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const FOCUS_ZOOM = 13;

const mapEl = document.getElementById("branches-map");
const listEl = document.getElementById("branches-list");
const branchSelect = document.getElementById("branch-select");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// id -> { branch, marker, button }
const items = new Map();
let map;

// ---------- helpers ----------
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

// ---------- STEP 1: the Leaflet map (OpenStreetMap tiles) ----------
function createMap() {
    map = L.map(mapEl, { scrollWheelZoom: false });   // so the page can still scroll over the map
    L.tileLayer(TILES_URL, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(map);
}

function fitAll(branches) {
    const bounds = L.latLngBounds(branches.map((b) => [b.lat, b.lng]));
    map.fitBounds(bounds, { padding: [40, 40], animate: !reduceMotion });
}

// ---------- STEP 2: one marker + popup per branch ----------
function createPin() {
    return L.divIcon({
        className: "branch-pin",
        html: "<span></span>",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28],
    });
}

function createPopup(branch) {
    const box = el("div", "branch-popup");
    box.append(el("strong", "branch-popup-name", `Adelia Studio ${branch.name}`));
    box.append(el("span", null, branch.address));
    box.append(el("span", null, branch.hours));

    const phone = el("a", null, branch.phone);
    phone.href = `tel:${branch.phone.replace(/[^\d+]/g, "")}`;
    box.append(phone);

    const choose = el("button", "popup-button", "Book here");
    choose.type = "button";
    choose.addEventListener("click", () => {
        selectBranch(branch.id, { fly: false });
        items.get(branch.id).marker.closePopup();
        branchSelect.focus();
    });
    box.append(choose);
    return box;
}

function addMarker(branch) {
    const marker = L.marker([branch.lat, branch.lng], { icon: createPin(), title: branch.name })
        .addTo(map)
        .bindPopup(createPopup(branch));
    marker.on("click", () => selectBranch(branch.id, { fly: false }));
    return marker;
}

// ---------- STEP 3: the list under the map ----------
function addListItem(branch) {
    const li = el("li");
    const button = el("button", "branch-item");
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.append(
        el("span", "branch-item-name", branch.name),
        el("span", "branch-item-address", branch.address)
    );
    button.addEventListener("click", () => selectBranch(branch.id));
    li.append(button);
    listEl.append(li);
    return button;
}

// ---------- STEP 4: the form select ----------
function addOption(branch) {
    const option = el("option", null, branch.name);
    option.value = branch.id;
    branchSelect.append(option);
}

// ---------- STEP 5: keep map, list and select in sync ----------
function selectBranch(id, { fly = true } = {}) {
    const item = items.get(id);
    if (!item) return;

    items.forEach((other) => other.button.setAttribute("aria-pressed", String(other === item)));
    branchSelect.value = id;

    if (fly) {
        map.setView([item.branch.lat, item.branch.lng], FOCUS_ZOOM, { animate: !reduceMotion });
    }
    item.marker.openPopup();
}

function clearSelection(branches) {
    items.forEach((item) => item.button.setAttribute("aria-pressed", "false"));
    map.closePopup();
    fitAll(branches);
}

// ---------- start ----------
async function init() {
    if (!mapEl || !listEl || !branchSelect) {
        console.error("book.html is missing #branches-map, #branches-list or #branch-select.");
        return;
    }
    if (typeof L === "undefined") {
        mapEl.textContent = "The map could not be loaded.";
        console.error("Leaflet (L) is not defined: check the <script> tag for Leaflet in book.html <head>.");
        return;
    }

    try {
        const { branches } = await getJSON(DATA_URL);

        createMap();
        branches.forEach((branch) => {
            items.set(branch.id, {
                branch,
                marker: addMarker(branch),
                button: addListItem(branch),
            });
            addOption(branch);
        });
        fitAll(branches);

        branchSelect.addEventListener("change", () => {
            if (branchSelect.value) selectBranch(branchSelect.value);
            else clearSelection(branches);
        });
    } catch (error) {
        console.error(error);
        mapEl.textContent = "We couldn't load our branches. Please try again later.";
    }
}

init();