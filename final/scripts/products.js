import { initHeader, initFooter } from "./header.js";
import { getJSON } from "./data.js";

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
function createImage(product) {
    const frame = el("div", "product-image");
    const img = document.createElement("img");
    img.src = product.pImage;
    img.alt = product.pName;
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

function createCard(product) {
    const item = el("li");
    const card = el("article", "product");

    const body = el("div", "product-body");
    body.append(
        el("p", "product-category", product.category),
        el("h3", "product-name", product.pName),
        el("p", "product-description", product.pDescription),
        el("p", "product-skin", product.skinType)
    );

    card.append(createImage(product), body, el("p", "product-price", product.pPrice));
    item.append(card);
    return item;
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
        count.textContent = "";
    }
}

init();