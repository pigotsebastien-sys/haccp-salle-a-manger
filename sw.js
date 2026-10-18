// Service Worker — HACCP LSM — Mode hors-ligne + mise à jour automatique
// Version incrémentée à chaque déploiement pour forcer le rafraîchissement

const CACHE_VERSION = 'haccp-lsm-v20';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './js/core-sync.js',
  './js/app.js',
  './js/inventaire-plus.js',
  './js/achats-plus.js',
  './js/favicon.js',
  './js/sw-register.js',
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

  // Supabase → pas d'interception : l'appli gère elle-même l'absence de réseau.
  // (Avant le 18/10/2026 : hors-ligne, le SW répondait « 200 OK [] » à TOUTES
  // les requêtes Supabase, y compris les envois et le renouvellement de session,
  // ce qui faisait croire à l'appli que le serveur était joignable.)
  if (url.includes('supabase.co')) return;

  // App (HTML/JS/CSS du site) → Network-First : chaque appareil reçoit
  // immédiatement la dernière version du code ; le cache sert seulement hors-ligne.
  // (Avant : Cache-First → tablettes/téléphones gardaient l'ancien code.)
  if (e.request.method === 'GET' && url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' }).then(function(response) {
        if (response && response.status === 200) {
          var toCache = response.clone();
          caches.open(CACHE_VERSION).then(function(cache) { cache.put(e.request, toCache); });
        }
        return response;
      }).catch(function() {
        return caches.match(e.request, { ignoreSearch: true });
      })
    );
    return;
  }

  // Autres origines (CDN SheetJS / Tesseract…) : comportement normal du navigateur
});

// ── Message depuis l'app ──
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
