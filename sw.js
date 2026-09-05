// Service Worker — HACCP LSM v6 — auto-nettoyage
const CACHE_NAME = 'haccp-lsm-v6';

// Au démarrage : supprimer TOUS les anciens caches
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        return caches.delete(key);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Ne rien mettre en cache — tout passe par le réseau
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request).catch(function() {
    return caches.match(e.request);
  }));
});
