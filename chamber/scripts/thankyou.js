import './main.js';

const params = new URLSearchParams(window.location.search);

function fill(id, value, formatter) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!value) {
        el.textContent = '—';
        return;
    }
    el.textContent = formatter ? formatter(value) : value;
}

fill('out-first', params.get('first'));
fill('out-last', params.get('last'));
fill('out-email', params.get('email'));
fill('out-phone', params.get('phone'));
fill('out-orgname', params.get('orgname'));
fill('out-timestamp', params.get('timestamp'), (v) => {
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleString();
});