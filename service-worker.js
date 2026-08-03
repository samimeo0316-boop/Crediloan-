const CACHE_NAME = "crediloan-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./firebase.js",
  "./auth.js",
  "./firestore.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});