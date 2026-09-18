if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js')
      .then(function(reg) { console.log('[SW] Enregistré:', reg.scope); })
      .catch(function(e) { console.warn('[SW] Échec:', e); });
  });
}
