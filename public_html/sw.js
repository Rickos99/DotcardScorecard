const version = "1.1.0";
const cacheName = `dotScorecard-${version}`;
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache
                .addAll([
                    `./index.html`,
                    `./styles/main.css`,
                    `./javascript/diceFaces.js`,
                    `./javascript/fs.js`,
                    `./javascript/gamemodel.js`,
                    `./javascript/localstorage.js`,
                    `./javascript/main.js`,
                    `./javascript/menu.js`,
                    `./javascript/scorecard.js`,
                ])
                .then(() => self.skipWaiting());
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", async event => {
    event.respondWith(
        caches.match(event.request, { cacheName }).then(response => {
            if (response !== undefined) return response;

            return fetch(event.request).then(response => {
                var responseCopy = response.clone();
                caches.open(cacheName).then(cache => {
                    cache.put(event.request, responseCopy);
                });
                return response;
            });
        })
    );
});
