if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js')
      .then(function(reg) { console.log('[SW] Enregistré:', reg.scope); })
      .catch(function(e) { console.warn('[SW] Échec:', e); });
  });
}

// Quand une nouvelle version du site est installée, recharger automatiquement
// la page une fois pour que l'appareil utilise tout de suite le nouveau code.
if ('serviceWorker' in navigator) {
  var _swReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (_swReloaded) return; _swReloaded = true;
    window.location.reload();
  });
  navigator.serviceWorker.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'SW_UPDATED' && !_swReloaded) { _swReloaded = true; window.location.reload(); }
  });
}
