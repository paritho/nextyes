const CACHE_NAME = 'static-cache-v8';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
    "/index.html",
    "/schedule.html",
    "/partners.html",
    "/resources.html",
    "/speakers.html",
    "/makemyday.html",
    "/home.html",
    "./css/styles.css",
    "./css/bootstrap.min.css",
    "./css/bootstrap.min.css.map",
    "./js/index-bundle.js",
    "./js/content-bundle.js",
    "./img/logo-small.png",
    "./img/blur-logo.png",
    "./img/icon-512.png",
    "./img/icon-256.png",
    "./img/icon-splash.jpg",
    "./fonts/font1.woff2",
    "./fonts/font2.woff2",
    "./fonts/font3.woff2"
];

self.addEventListener('install', (evt) => {
  console.log('[Service Worker] Install', evt);
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          console.log('[ServiceWorker] Pre-caching offline page');
          return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (evt) => {
  console.log('[Service Worker] Activate', evt);
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
  console.log('[Service Worker] Fetch', evt.request.url);
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(cache);
      return cache.match(evt.request, {ignoreSearch: true})
          .then((response) => {
            return response || fetch(evt.request);
          }).catch(e =>{
            console.log(e)
          });
    }));
});