/* =========================================
   SERVICE WORKER — TJ KIN České Budějovice
   Verze: změň číslo při každém nasazení
   ========================================= */
const CACHE_VERZE = 'kinplavani-v1';

// Soubory předem stažené při první návštěvě
const PRECACHE = [
    '/',
    '/index.html',
    '/aktuality.html',
    '/terminovka.html',
    '/fotogalerie.html',
    '/treninky.html',
    '/kontakt.html',
    '/style.css',
    '/komponenty.js',
    '/galerie-data.js',
    '/manifest.json',
    '/images/logos/logo.PNG',
    '/images/hero.webp',
    '/images/hero.jpeg',
];

/* --- INSTALACE: předem stáhnout klíčové soubory --- */
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_VERZE).then(cache => cache.addAll(PRECACHE))
    );
    self.skipWaiting();
});

/* --- AKTIVACE: smazat staré cache --- */
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(klice =>
            Promise.all(
                klice
                    .filter(k => k !== CACHE_VERZE)
                    .map(k => caches.delete(k))
            )
        )
    );
    e.waitUntil(clients.claim());
});

/* --- FETCH: strategie podle typu souboru --- */
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    const url = new URL(e.request.url);

    // Ignorovat jiné domény (Google Analytics, fonty...)
    if (url.origin !== location.origin) return;

    // HTML stránky: nejdřív síť, při výpadku cache
    if (e.request.headers.get('accept')?.includes('text/html')) {
        e.respondWith(
            fetch(e.request)
                .then(response => {
                    const klon = response.clone();
                    caches.open(CACHE_VERZE).then(cache => cache.put(e.request, klon));
                    return response;
                })
                .catch(() => caches.match(e.request))
        );
        return;
    }

    // Obrázky, CSS, JS: nejdřív cache, při miss síť (a uložit do cache)
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(response => {
                const klon = response.clone();
                caches.open(CACHE_VERZE).then(cache => cache.put(e.request, klon));
                return response;
            });
        })
    );
});
