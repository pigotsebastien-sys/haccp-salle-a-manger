// Service Worker — HACCP LSM — Mode hors-ligne + mise à jour automatique
// Version incrémentée à chaque déploiement pour forcer le rafraîchissement

const CACHE_VERSION = 'haccp-lsm-v8';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

// ── Installation ──
self.addEventListener('install', function(e) {
  // skipWaiting() immédiat pour remplacer l'ancien SW sans attendre
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
});

// ── Activation : supprimer anciens caches + notifier les clients ──
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_VERSION; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    }).then(function() {
      // Notifier tous les onglets ouverts qu'une nouvelle version est disponible
      return self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// ── Fetch : Cache-First pour app shell, Network-First pour Supabase ──
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Supabase → réseau direct, fallback JSON vide hors-ligne
  if (url.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // App shell → Cache-First avec revalidation en arrière-plan
  if (e.request.method === 'GET') {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        var networkFetch = fetch(e.request).then(function(response) {
          if (response && response.status === 200) {
            var toCache = response.clone();
            caches.open(CACHE_VERSION).then(function(cache) {
              cache.put(e.request, toCache);
            });
          }
          return response;
        }).catch(function() { return null; });
        return cached || networkFetch;
      })
    );
    return;
  }

  e.respondWith(fetch(e.request));
});

// ── Message depuis l'app ──
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
