// ── Service Worker — Inventaire HACCP La Salle à Manger ──
const CACHE_NAME = 'haccp-lsm-v5';

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['/', '/index.html', '/manifest.json'])
        .catch(() => cache.addAll(['/', '/index.html']))
    ).then(() => self.skipWaiting())
  );
});

// Activation : supprimer les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ⚡ LAISSER PASSER sans interception :
  // - Supabase (API + WebSocket temps réel)
  // - cdnjs (lib Supabase)
  // - Toutes requêtes non-GET
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.com') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    event.request.method !== 'GET'
  ) {
    return; // Ne pas intercepter → requête normale
  }

  // CDN jsdelivr : cache first
  if (url.hostname.includes('jsdelivr.net')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  // App principale : Network First
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Autres assets locaux : cache first
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).catch(() => new Response('', {status: 503}))
    )
  );
});

// Message : forcer mise à jour
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
