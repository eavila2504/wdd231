// Shared data loader — products.js and testimonies.js can both use it.
export async function getJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not load ${url} (${response.status})`);
    }
    return response.json();
}