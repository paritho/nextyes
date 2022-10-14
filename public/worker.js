const CACHE_NAME = 'static-cache-v8a';

const FILES_TO_CACHE = [
    "/index.html",
    "/schedule.html",
    "/partners.html",
    "/resources.html",
    "/speakers.html",
    "/makemyday.html",
    "/home.html",
    "/notes.html",
    "/info.html",
    "/trivia.html",
    "./css/styles.css",
    "./css/bootstrap.min.css",
    "./js/schedule.json",
    "./js/index-bundle.js",
    "./js/content-bundle.js",
    "./js/note-bundle.js",
    "./js/home.js",
    "./img/logo-small.png",
    "./img/logo.png",
    "./img/icon-512.png",
    "./img/icon-192.png",
    "./img/favicon.ico",
    "./img/favicon-16x16.png",
    "./img/favicon-32x32.png",
    "./img/apple-touch-icon.png",
    "./img/joe.jpg",
    // "./img/john.jpg",
    // "./img/bena.jpg",
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
          for (const key of keyList){
            if(key != CACHE_NAME){
              console.log('[ServiceWorker] Removing old cache', key);
              caches.delete(key)
            }
          }
        })
    );

  return self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  console.log('[Service Worker] Fetch', evt.request.url);
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker]', cache);
      return cache.match(evt.request, {ignoreSearch: true})
          .then((response) => {
            return response || fetch(evt.request);
          }).catch(e =>{
            console.log(e)
          });
    }));
});