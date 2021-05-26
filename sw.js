const version = "0.1.1";
const cacheName = `dotScorecard-${version}`;
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache
                .addAll([
                    `/DotcardScorecard/index.html`,
                    `/DotcardScorecard/styles/main.css`,
                    `/DotcardScorecard/scripts/diceFaces.js`,
                    `/DotcardScorecard/scripts/fs.js`,
                    `/DotcardScorecard/scripts/gamemodel.js`,
                    `/DotcardScorecard/scripts/localstorage.js`,
                    `/DotcardScorecard/scripts/main.js`,
                    `/DotcardScorecard/scripts/menu.js`,
                    `/DotcardScorecard/scripts/scorecard.js`,
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
