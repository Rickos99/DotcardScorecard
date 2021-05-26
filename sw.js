const version = "0.1.1";
const cacheName = `dotScorecard-${version}`;
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache
                .addAll([
                    `/`,
                    `/index.html`,
                    `/styles/main.css`,
                    `/scripts/diceFaces.js`,
                    `/scripts/fs.js`,
                    `/scripts/gamemodel.js`,
                    `/scripts/localstorage.js`,
                    `/scripts/main.js`,
                    `/scripts/menu.js`,
                    `/scripts/scorecard.js`,
                ])
                .then(() => self.skipWaiting());
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches
            .open(cacheName)
            .then(cache => cache.match(event.request, { ignoreSearch: true }))
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
