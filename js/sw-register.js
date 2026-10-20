if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js')
      .then(function(reg) { console.log('[SW] Enregistré:', reg.scope); })
      .catch(function(e) { console.warn('[SW] Échec:', e); });
  });
}

// Quand une nouvelle version du site est installée, recharger automatiquement
// la page une fois pour que l'appareil utilise tout de suite le nouveau code.
// 18/10/2026 : pas de rechargement à la toute première visite (aucune ancienne
// version à remplacer), et on attend que l'utilisateur ait fini sa saisie
// (champ actif ou fenêtre ouverte) pour ne pas lui faire perdre un formulaire.
if ('serviceWorker' in navigator) {
  var _swReloaded = false;
  var _swHadController = !!navigator.serviceWorker.controller;
  function _swUserBusy() {
    var a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT')) return true;
    return !!document.querySelector('.open, .modal-overlay');
  }
  function _swReloadWhenIdle() {
    if (_swReloaded || !_swHadController) return;
    if (_swUserBusy()) { setTimeout(_swReloadWhenIdle, 5000); return; }
    _swReloaded = true;
    window.location.reload();
  }
  navigator.serviceWorker.addEventListener('controllerchange', _swReloadWhenIdle);
  navigator.serviceWorker.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'SW_UPDATED') _swReloadWhenIdle();
  });
}
