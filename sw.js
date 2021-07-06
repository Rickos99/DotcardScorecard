const version = "0.2.2";
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
