const CACHE_NAME = 'static-cache-v3';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
    "/index.html",
    "/schedule.html",
    "/login.html",
    "/partners.html",
    "/resources.html",
    "/speakers.html",
    "/makemyday.html",
    "./css/styles.css",
    "./js/bundle.js",
    "./img/home-logo.png",
    "./img/icon-256.png",
    "./img/icon-512.png"
];

self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          console.log('[ServiceWorker] Pre-caching offline page');
          return cache.addAll(FILES_TO_CACHE);
        })
    );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
          return Promise.all(keyList.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[ServiceWorker] Removing old cache', key);
              return caches.delete(key);
            }
          }));
        })
    );

  return self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
    if (evt.request.mode !== 'navigate') {
        // Not a page navigation, bail.
        return;
      }
      evt.respondWith(
          fetch(evt.request)
              .catch(() => {
                return caches.open(CACHE_NAME)
                    .then((cache) => {
                      return cache.match('/index.html');
                    });
              })
      );
});