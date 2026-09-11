// Service Worker — HACCP LSM — Mode hors-ligne
// Stratégie: Cache-First pour l'app shell, Network-First pour les données Supabase

const CACHE_NAME = 'haccp-lsm-v7';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

// ── Installation : mise en cache de l'app shell ──
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
});

// ── Activation : supprimer les anciens caches ──
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── Fetch : stratégie selon la ressource ──
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // 1. Requêtes Supabase (données) → Network-First avec fallback silencieux
  //    On ne met pas en cache les données Supabase — c'est localStorage qui joue ce rôle
  if (url.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(function() {
        // Hors-ligne : retourner une réponse vide pour ne pas bloquer l'app
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. App shell (HTML, JS, CSS, icônes) → Cache-First
  //    L'app fonctionne hors-ligne grâce au cache
  if (e.request.method === 'GET') {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        // Mettre à jour le cache en arrière-plan (stale-while-revalidate)
        var networkFetch = fetch(e.request).then(function(response) {
          if (response && response.status === 200) {
            var toCache = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(e.request, toCache);
            });
          }
          return response;
        }).catch(function() { return null; });

        // Retourner le cache immédiatement si disponible, sinon attendre le réseau
        return cached || networkFetch;
      })
    );
    return;
  }

  // 3. Tout le reste → réseau direct
  e.respondWith(fetch(e.request));
});

// ── Message : forcer la mise à jour du cache ──
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
