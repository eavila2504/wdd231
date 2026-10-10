import { initHeader, initFooter } from "./header.js";
import { getJSON } from "./data.js";

// header and footer first: they must work even if the rest fails
initHeader();
initFooter();

const BRANCHES_URL = "data/branches.json";
const NO_PREFERENCE = "No preference";

const titleEl = document.getElementById("thanks-title");
const introEl = document.getElementById("thanks-intro");
const summaryEl = document.getElementById("summary");

// ---------- STEP 1: read the data the form sent in the URL ----------

const params = new URLSearchParams(window.location.search);
const get = (name) => (params.get(name) ?? "").trim();

// ---------- STEP 2: format values for people ----------
function formatDate(value) {
    if (!value) return NO_PREFERENCE;
    const [year, month, day] = value.split("-").map(Number);
    // new Date("2026-10-20") would be read as UTC and could show the previous day
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatTime(value) {
    if (!value) return NO_PREFERENCE;
    const [hours, minutes] = value.split(":").map(Number);
    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
}

async function getBranchText(id) {
    if (!id) return NO_PREFERENCE;
    try {
        const { branches } = await getJSON(BRANCHES_URL);
        const branch = branches.find((b) => b.id === id);
        return branch ? `${branch.name}, ${branch.address}` : NO_PREFERENCE;
    } catch (error) {
        console.error(error);
        return NO_PREFERENCE;   // the summary still shows up if the JSON fails
    }
}

// ---------- STEP 3: draw the summary ----------
// textContent (not innerHTML) so nothing typed in the form can inject HTML
function addRow(label, value) {
    const row = document.createElement("div");
    row.className = "summary-row";
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    row.append(dt, dd);
    summaryEl.append(row);
}

// ---------- start ----------
async function init() {
    if (!titleEl || !introEl || !summaryEl) {
        console.error("thankyou.html is missing #thanks-title, #thanks-intro or #summary.");
        return;
    }

    // opened directly, without coming from the form
    if (!params.has("first") && !params.has("email")) {
        titleEl.textContent = "Nothing to show yet";
        introEl.textContent = "It looks like you came here without booking. You can book a visit below.";
        document.getElementById("book-again").hidden = true;
        return;
    }

    const first = get("first");
    titleEl.textContent = first ? `Thank you, ${first}!` : "Thank you!";
    introEl.textContent =
        "We received your request. Someone from our team will contact you soon to confirm your visit.";

    addRow("Name", `${first} ${get("last")}`.trim());
    addRow("Email", get("email"));
    addRow("Phone", get("phone"));
    addRow("Branch", await getBranchText(get("branch")));
    addRow("Preferred day", formatDate(get("best-day")));
    addRow("Preferred time", formatTime(get("best-time")));
    addRow("About your skin", get("feedback"));

    summaryEl.hidden = false;
}

init();