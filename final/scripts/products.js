import { initHeader, initFooter } from "./header.js";
import { getJSON } from "./data.js";

// Path is relative to the HTML page (products.html), not to this file.
// Change it if your products.json lives somewhere else (e.g. "products.json").
const DATA_URL = "data/products.json";

// The skinType strings in the JSON are free text ("Combination/oily acne-prone skin"),
// so each filter option matches by keywords instead of exact text.
const SKIN_KEYWORDS = {
    dry: ["dry", "dehydrated"],
    oily: ["oily", "acne"],
    combination: ["combination"],
    sensitive: ["sensitive", "reactive"],
    normal: ["normal"],
};

const state = { category: "all", skin: "all", sort: "default" };
let allProducts = [];

// ---------- DOM refs ----------
const grid = document.getElementById("products-grid");
const count = document.getElementById("results-count");
const categoryBar = document.getElementById("category-filter");
const skinSelect = document.getElementById("skin-filter");
const sortSelect = document.getElementById("sort-by");

// If any of these is missing, products.html is not the updated version.
if (!grid || !count || !categoryBar || !skinSelect || !sortSelect) {
    throw new Error(
        "products.html is missing #products-grid, #results-count, #category-filter, #skin-filter or #sort-by."
    );
}

// ---------- helpers ----------
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

const priceValue = (p) => Number(p.pPrice.replace(/[^0-9.]/g, "")) || 0;

function matchesSkin(product, skin) {
    if (skin === "all") return true;
    const type = product.skinType.toLowerCase();
    if (type.includes("all skin types")) return true;
    return SKIN_KEYWORDS[skin].some((word) => type.includes(word));
}

function getVisibleProducts() {
    const list = allProducts.filter(
        (p) =>
            (state.category === "all" || p.category === state.category) &&
            matchesSkin(p, state.skin)
    );
    if (state.sort === "price-asc") list.sort((a, b) => priceValue(a) - priceValue(b));
    if (state.sort === "price-desc") list.sort((a, b) => priceValue(b) - priceValue(a));
    return list;
}

// ---------- rendering ----------
function createImage(product, alt = "") {
    const frame = el("span", "product-image");
    const img = document.createElement("img");
    img.src = product.pImage;
    img.alt = alt;               // empty in the grid: the name is already next to it
    img.loading = "lazy";
    img.width = 300;
    img.height = 300;
    img.referrerPolicy = "no-referrer";
    // some URLs in the JSON are pages, not images: fall back to a quiet placeholder
    img.addEventListener("error", () => {
        frame.replaceChildren(el("span", "product-fallback", product.category));
    });
    frame.append(img);
    return frame;
}

// STEP 1: the grid card only shows image, name and price. It is a <button>,
// so it works with keyboard and screen readers, and opens the popup.
function createCard(product) {
    const item = el("li");
    const card = el("button", "product");
    card.type = "button";
    card.setAttribute("aria-haspopup", "dialog");

    const body = el("span", "product-body");
    body.append(el("span", "product-name", product.pName), el("span", "product-price", product.pPrice));

    card.append(createImage(product), body);
    card.addEventListener("click", () => openProduct(product));
    item.append(card);
    return item;
}

// ---------- STEP 2: the popup (native <dialog>) ----------
// <dialog>.showModal() gives us for free: Esc to close, focus kept inside,
// the page behind is inert, and focus returns to the card when it closes.
const popup = {};

function buildDialog() {
    const dialog = el("dialog", "product-dialog");
    dialog.setAttribute("aria-labelledby", "dialog-title");

    const content = el("div", "dialog-content");

    const close = el("button", "dialog-close", "\u00D7");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => dialog.close());

    popup.image = el("div", "dialog-image");

    popup.category = el("p", "dialog-category");
    popup.title = el("h2", "dialog-title");
    popup.title.id = "dialog-title";
    popup.description = el("p", "dialog-description");
    popup.skin = el("p", "dialog-skin");
    popup.price = el("p", "dialog-price");

    const book = el("a", "hero-cta", "Book a visit");
    book.href = "book.html";

    const body = el("div", "dialog-body");
    body.append(
        popup.category,
        popup.title,
        popup.description,
        el("h3", "dialog-subtitle", "Skin types"),
        popup.skin,
        popup.price,
        book
    );

    content.append(close, popup.image, body);
    dialog.append(content);

    // a click on the dark area outside the content closes it
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });

    document.body.append(dialog);
    popup.dialog = dialog;
}

function openProduct(product) {
    if (!popup.dialog) buildDialog();

    popup.image.replaceChildren(createImage(product, product.pName));
    popup.category.textContent = product.category;
    popup.title.textContent = product.pName;
    popup.description.textContent = product.pDescription;
    popup.skin.textContent = product.skinType;
    popup.price.textContent = product.pPrice;

    popup.dialog.showModal();
    popup.dialog.scrollTop = 0;
}

function render() {
    const products = getVisibleProducts();
    grid.setAttribute("aria-busy", "false");

    if (products.length === 0) {
        const empty = el("li", "products-empty");
        empty.append(el("p", null, "No products match these filters."));
        const reset = el("button", "chip", "Clear filters");
        reset.type = "button";
        reset.addEventListener("click", resetFilters);
        empty.append(reset);
        grid.replaceChildren(empty);
    } else {
        grid.replaceChildren(...products.map(createCard));
    }

    count.textContent = `${products.length} ${products.length === 1 ? "product" : "products"}`;
}

function syncCategoryButtons() {
    categoryBar.querySelectorAll("button").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.category === state.category));
    });
}

function resetFilters() {
    Object.assign(state, { category: "all", skin: "all", sort: "default" });
    skinSelect.value = "all";
    sortSelect.value = "default";
    syncCategoryButtons();
    render();
}

// ---------- events ----------
categoryBar.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-category]");
    if (!btn) return;
    state.category = btn.dataset.category;
    syncCategoryButtons();
    render();
});

skinSelect.addEventListener("change", () => {
    state.skin = skinSelect.value;
    render();
});

sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    render();
});

// ---------- start ----------
async function init() {
    initHeader();
    initFooter();
    try {
        const data = await getJSON(DATA_URL);
        allProducts = data.products;
        render();
    } catch (error) {
        console.error(error);
        grid.setAttribute("aria-busy", "false");
        grid.replaceChildren(
            el("li", "products-empty", "We couldn't load the products. Please try again later.")
        );
        // Technical detail so the problem can be found while developing
        count.textContent = `${error.message} (looked for: ${new URL(DATA_URL, location.href).href})`;
    }
}

init();