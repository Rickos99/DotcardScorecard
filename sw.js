const version = "0.1.1";
const cacheName = `dotScorecard-${version}`;
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache
                .addAll([
                    `/DotcardScorecard/index.html`,
                    `/DotcardScorecard/styles/main.css`,
                    `/DotcardScorecard/javascript/diceFaces.js`,
                    `/DotcardScorecard/javascript/fs.js`,
                    `/DotcardScorecard/javascript/gamemodel.js`,
                    `/DotcardScorecard/javascript/localstorage.js`,
                    `/DotcardScorecard/javascript/main.js`,
                    `/DotcardScorecard/javascript/menu.js`,
                    `/DotcardScorecard/javascript/scorecard.js`,
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
