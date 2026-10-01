  const SUPA_URL = 'https://pbydidazdjqqihkolzgc.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRpZGF6ZGpxcWloa29semdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNDI4MDQsImV4cCI6MjEwMzYxODgwNH0.xrrlnV6-7gBwQyC3UMKsEd5wTDsyBhCjc7tZevIaQWE';
  const WS_URL   = 'wss://pbydidazdjqqihkolzgc.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRpZGF6ZGpxcWloa29semdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNDI4MDQsImV4cCI6MjEwMzYxODgwNH0.xrrlnV6-7gBwQyC3UMKsEd5wTDsyBhCjc7tZevIaQWE&vsn=1.0.0';

  const DEVICE_ID = localStorage.getItem('haccp_device_id') || (() => {
    const id = 'dev_' + Math.random().toString(36).substr(2,8);
    localStorage.setItem('haccp_device_id', id);
    return id;
  })();

  // Identifiant utilisateur pour la traçabilité HACCP
  // Priorité: email authentifié > DEVICE_ID (fallback si non connecté)
  function getCurrentUserIdentifier() {
    try {
      // Lire depuis la session Supabase Auth
      if (window.currentSession) {
        // currentSession peut contenir user.email directement
        var session = window.currentSession;
        if (session.user && session.user.email) return session.user.email;
        // Ou dans le JWT (access_token)
        if (session.access_token) {
          var payload = JSON.parse(atob(session.access_token.split('.')[1]));
          if (payload.email) return payload.email;
        }
      }
      // Fallback: lire depuis localStorage de session
      var stored = localStorage.getItem('haccp_session');
      if (stored) {
        var s = JSON.parse(stored);
        if (s.access_token) {
          var p = JSON.parse(atob(s.access_token.split('.')[1]));
          if (p.email) return p.email;
        }
      }
    } catch(e) {}
    // Dernier recours: DEVICE_ID
    return DEVICE_ID;
  }

  const SYNC_MODULES = {
    'inventaire':     'haccp_salleamanger_inventaire_v1',
    'dlc':            'haccp_dlc_v1',
    'historique':     'haccp_historique_v1',
    'seuils':         'haccp_seuils_v1',
    'temperatures':   'haccp_temperatures_v1',
    'allergenes':     'haccp_allergenes_v1',
    'commande':       'haccp_commande_v1',
    'recettes':       'haccp_recettes_v1',
    'tracabilite':    'haccp_tracabilite_v1',
    'prix_historique':'haccp_prix_historique_v1',
    'plats':          'haccp_plats_v1',
  };

  // ════════════════════════════════════════════════════════════════════
  // SYNCHRONISATION MULTI-APPAREILS (refonte du 01/10/2026)
  //
  // Problèmes corrigés :
  //  1. pullCloud() ignorait toute ligne dont updated_by == l'email de
  //     l'utilisateur connecté. Comme tous les appareils (PC, tablette,
  //     téléphone) sont connectés avec le MÊME compte, chaque appareil
  //     ignorait les modifications faites par les autres → inventaires
  //     différents sur chaque poste.
  //  2. Le jeton de connexion (1 h) n'était renouvelé qu'au chargement de
  //     la page : une tablette laissée ouverte perdait ses envois après 1 h.
  //     Les envois refusés étaient en plus retirés de la file (perdus).
  //  3. Un PATCH sans les droits renvoie « 200 / 0 ligne » : l'échec passait
  //     inaperçu. On demande maintenant la ligne en retour pour vérifier.
  //  4. L'inventaire était envoyé en bloc : deux appareils qui comptent en
  //     même temps s'écrasaient. Il est maintenant fusionné produit par
  //     produit côté serveur (fonction SQL inventaire_merge).
  //  5. Les horodatages venaient de l'horloge de chaque appareil ; ils sont
  //     maintenant posés par le serveur (trigger haccp_store_touch).
  //  6. Rien ne resynchronisait au retour de veille (tablette/téléphone) :
  //     on resynchronise au retour au premier plan + toutes les 30 s.
  // ════════════════════════════════════════════════════════════════════

  let ws = null;
  let wsRef = 0;
  let wsPingTimer = null;
  let wsReconnTimer = null;
  let syncEnabled = false;
  let syncQueue = {};
  let syncTimer = null;
  let retryTimer = null;
  let flushing = false;
  let flushAgain = false;
  let initRunning = false;
  let lastTs = {};
  let notLoggedWarned = false;
  let deferredInvApply = null;

  const INV_KEY         = SYNC_MODULES.inventaire;
  const INV_BASE_KEY    = INV_KEY + '_base';     // dernières quantités connues du serveur
  const INV_PENDING_KEY = INV_KEY + '_pending';  // saisies locales pas encore envoyées
  const INV_BACKUP_KEY  = INV_KEY + '_backup_avant_synchro';
  const SYNC_VERSION_KEY = 'haccp_sync_version';
  const SYNC_VERSION = '2';

  // Première exécution de cette version : on repart du serveur comme référence
  // (les anciens horodatages venaient de l'horloge de chaque appareil).
  try {
    if (localStorage.getItem(SYNC_VERSION_KEY) !== SYNC_VERSION) {
      Object.values(SYNC_MODULES).forEach(function(k) { localStorage.removeItem(k + '_sync_ts'); });
      localStorage.removeItem(INV_BASE_KEY);
      localStorage.removeItem(INV_PENDING_KEY);
      localStorage.setItem(SYNC_VERSION_KEY, SYNC_VERSION);
    }
  } catch(e) {}

  function lsGet(k, def) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : def; } catch(e) { return def; } }
  function lsSet(k, v)   { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
  function normQ(v) {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }
  function qtesDiffer(a, b) {
    a = a || {}; b = b || {};
    for (const k in a) if (normQ(a[k]) !== normQ(b[k])) return true;
    for (const k in b) if (normQ(a[k]) !== normQ(b[k])) return true;
    return false;
  }

  // ── Jeton de connexion : renouvelé avant expiration ──
  let refreshPromise = null;
  function readSession() { return lsGet('haccp_session', null); }
  async function ensureFreshToken(force) {
    const s = readSession();
    if (!s || !s.refresh_token) return !!window._supabaseAuthToken;
    if (!force && s.expires_at && Date.now() < s.expires_at - 5 * 60 * 1000) {
      if (window._supabaseAuthToken !== s.access_token) window._supabaseAuthToken = s.access_token;
      return true;
    }
    if (!refreshPromise) {
      refreshPromise = (async function() {
        try {
          if (typeof refreshSession === 'function') await refreshSession(s.refresh_token);
        } catch(e) {}
        refreshPromise = null;
      })();
    }
    await refreshPromise;
    return !!window._supabaseAuthToken;
  }

  // ── REST fetch helper ──
  // Authorization = jeton de l'utilisateur connecté (RLS : écriture réservée
  // aux comptes connectés) ; apikey = clé anonyme (identifiant du projet).
  function supa(path, opts) {
    const authToken = window._supabaseAuthToken || SUPA_KEY;
    return fetch(SUPA_URL + path, {
      ...opts,
      headers: {
        apikey: SUPA_KEY,
        Authorization: 'Bearer ' + authToken,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
        ...(opts && opts.headers || {})
      }
    });
  }

  function isEditingInventory() {
    const a = document.activeElement;
    if (!a || (a.tagName !== 'INPUT' && a.tagName !== 'TEXTAREA')) return false;
    const p = document.getElementById('panel-inventaire');
    return !p || p.contains(a);
  }

  // ── Inventaire : appliquer l'état du serveur + nos saisies non envoyées ──
  function applyInventaireRemote(remoteData, updatedAt) {
    const remoteQ = (remoteData && remoteData.qtes) || {};
    const hadBase = localStorage.getItem(INV_BASE_KEY) !== null;
    const local = lsGet(INV_KEY, null);
    if (!hadBase && local && local.qtes && qtesDiffer(local.qtes, remoteQ)) {
      // Première synchro de cet appareil : copie de sécurité de sa version locale
      lsSet(INV_BACKUP_KEY, Object.assign({}, local, { backupAt: new Date().toISOString() }));
      if (typeof refreshInvBackupButton === 'function') refreshInvBackupButton();
    }
    lsSet(INV_BASE_KEY, remoteQ);
    if (updatedAt) { lastTs.inventaire = updatedAt; localStorage.setItem(INV_KEY + '_sync_ts', new Date(updatedAt).getTime()); }
    const pending = lsGet(INV_PENDING_KEY, {});
    const merged = Object.assign({}, remoteQ, pending);
    if (local && local.qtes && !qtesDiffer(local.qtes, merged)) return false;
    lsSet(INV_KEY, { savedAt: (remoteData && remoteData.savedAt) || updatedAt || new Date().toISOString(), qtes: merged });
    if (isEditingInventory()) {
      // Ne pas redessiner pendant une saisie : on applique dès que le champ est quitté
      clearTimeout(deferredInvApply);
      deferredInvApply = setTimeout(function retry() {
        if (isEditingInventory()) { deferredInvApply = setTimeout(retry, 1500); return; }
        applyModule('inventaire');
      }, 1500);
    } else {
      applyModule('inventaire');
    }
    return true;
  }

  // Enregistre les quantités modifiées localement (différences avec le serveur)
  function recordInventaireChanges(payload) {
    if (!payload || !payload.qtes) return;
    const base = lsGet(INV_BASE_KEY, null);
    if (!base) return; // jamais synchronisé sur cet appareil : on attend le 1er chargement
    const pending = lsGet(INV_PENDING_KEY, {});
    for (const code in payload.qtes) {
      const v = normQ(payload.qtes[code]);
      if (v !== normQ(base[code])) pending[code] = v;
      else delete pending[code];
    }
    lsSet(INV_PENDING_KEY, pending);
  }

  // ── Appliquer une ligne reçue du serveur (pull ou temps réel) ──
  function applyRow(row) {
    if (!row || !row.id) return false;
    if (row.id === 'inventaire') return applyInventaireRemote(row.data, row.updated_at);
    const lk = SYNC_MODULES[row.id];
    if (!lk || !row.data || !Object.keys(row.data).length) return false;
    if (syncQueue[row.id] !== undefined) return false; // modif locale en attente d'envoi
    const remoteTs = new Date(row.updated_at).getTime();
    const localTs  = parseInt(localStorage.getItem(lk + '_sync_ts') || '0');
    if (remoteTs <= localTs) return false;
    localStorage.setItem(lk, JSON.stringify(row.data));
    localStorage.setItem(lk + '_sync_ts', remoteTs);
    lastTs[row.id] = row.updated_at;
    applyModule(row.id);
    return true;
  }

  // ── Charger depuis le cloud ──
  async function pullCloud() {
    try {
      const r = await supa('/rest/v1/haccp_store?select=id,data,updated_at,updated_by');
      if (!r.ok) return;
      const rows = await r.json();
      let n = 0;
      for (const row of rows) if (applyRow(row)) n++;
      if (n) showSyncToast('🔄 ' + n + ' module(s) mis à jour');
    } catch(e) { if (typeof logSyncError === 'function') logSyncError('pull', e); }
  }

  // ── Appliquer un module reçu ──
  function applyModule(id) {
    try {
      switch(id) {
        case 'inventaire':
          if (typeof loadAutoSave==='function') loadAutoSave();
          if (typeof render==='function') render();
          if (typeof updateStats==='function') updateStats();
          if (typeof buildBilan==='function') buildBilan();
          break;
        case 'dlc':
          try{const r=localStorage.getItem(DLC_KEY);if(r)DLC_DATA=JSON.parse(r);}catch(e){}
          if (typeof renderDLC==='function') renderDLC();
          break;
        case 'historique':
          try{const r=localStorage.getItem(HISTO_KEY);if(r)HISTO_DATA=JSON.parse(r);}catch(e){}
          break;
        case 'commande':
          try{const r=localStorage.getItem(CMD_KEY);if(r)CMD_DATA=JSON.parse(r);}catch(e){}
          if (typeof renderCommande==='function') renderCommande();
          break;
        case 'tracabilite':
        case 'prix_historique':
          if (typeof loadNewModules==='function') loadNewModules();
          if (id==='tracabilite' && typeof renderTracabilite==='function') renderTracabilite();
          break;
        case 'recettes':
          if (typeof loadNewModules==='function') loadNewModules();
          if (typeof renderRecettes==='function') renderRecettes();
          break;
        case 'allergenes':
          try{const r=localStorage.getItem(ALLERGENS_KEY);if(r)ALLERGEN_DATA=JSON.parse(r);}catch(e){}
          if (typeof renderAllergens==='function') renderAllergens();
          break;
        case 'plats':
          try{const r=localStorage.getItem(PLATS_KEY);if(r)PLATS_DATA=JSON.parse(r);}catch(e){}
          if (typeof renderPlats==='function') renderPlats();
          break;
        case 'seuils':
          try{const r=localStorage.getItem(SEUILS_KEY);if(r)SEUILS_DATA=JSON.parse(r);}catch(e){}
          break;
        case 'temperatures':
          try{const r=localStorage.getItem(TEMP_KEY);if(r)TEMP_DATA=JSON.parse(r);}catch(e){}
          if (typeof renderTemperatures==='function') renderTemperatures();
          break;
        default: break;
      }
    } catch(e) {}
  }

  // ── Envoyer vers le cloud ──
  function syncToCloud(moduleId, data) {
    if (moduleId === 'inventaire') {
      // Toujours mémorisé (même hors-ligne / avant connexion) : envoyé dès que possible
      recordInventaireChanges(data);
    } else {
      if (!syncEnabled) return;
      syncQueue[moduleId] = data;
    }
    clearTimeout(syncTimer);
    syncTimer = setTimeout(flushQueue, 600);
  }

  function scheduleRetry(ms) {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(flushQueue, ms || 10000);
  }

  function warnNotLogged() {
    updateSyncDot('red');
    if (!notLoggedWarned) {
      notLoggedWarned = true;
      showSyncToast('⚠️ Non connecté : vos saisies restent sur cet appareil. Connectez-vous pour les partager.');
    }
  }

  async function flushQueue() {
    if (flushing) { flushAgain = true; return; }
    flushing = true;
    let failed = false;
    try {
      if (!syncEnabled) return;
      const pending = lsGet(INV_PENDING_KEY, {});
      const hasInv = Object.keys(pending).length > 0;
      const hasOther = Object.keys(syncQueue).length > 0;
      if (!hasInv && !hasOther) return;

      if (!(await ensureFreshToken(false))) { warnNotLogged(); failed = true; return; }
      notLoggedWarned = false;

      // 1) Inventaire : fusion produit par produit côté serveur
      if (hasInv) {
        const sent = Object.assign({}, pending);
        let r = await supa('/rest/v1/rpc/inventaire_merge', {
          method: 'POST', headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ p_qtes: sent, p_by: getCurrentUserIdentifier() })
        });
        if (r.status === 401 && await ensureFreshToken(true)) {
          r = await supa('/rest/v1/rpc/inventaire_merge', {
            method: 'POST', headers: { Prefer: 'return=representation' },
            body: JSON.stringify({ p_qtes: sent, p_by: getCurrentUserIdentifier() })
          });
        }
        const rows = r.ok ? await r.json().catch(function() { return null; }) : null;
        if (rows && rows.length) {
          const cur = lsGet(INV_PENDING_KEY, {});
          for (const c in sent) if (c in cur && cur[c] === sent[c]) delete cur[c];
          lsSet(INV_PENDING_KEY, cur);
          applyInventaireRemote(rows[0].data, rows[0].updated_at);
        } else {
          console.warn('[SYNC] inventaire refusé — HTTP', r.status, '— saisies conservées, nouvel essai bientôt.');
          if (r.status === 401 || r.status === 403 || (r.ok && rows && !rows.length)) warnNotLogged();
          failed = true;
        }
      }

      // 2) Autres modules : envoi du module complet
      const q = Object.assign({}, syncQueue); syncQueue = {};
      for (const [id, data] of Object.entries(q)) {
        try {
          const body = JSON.stringify({ data: data, updated_by: getCurrentUserIdentifier() });
          let r = await supa('/rest/v1/haccp_store?id=eq.' + id, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: body });
          if (r.status === 401 && await ensureFreshToken(true)) {
            r = await supa('/rest/v1/haccp_store?id=eq.' + id, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: body });
          }
          const rows = r.ok ? await r.json().catch(function() { return null; }) : null;
          if (!rows || !rows.length) {
            console.warn('[SYNC] push refusé pour', id, '— HTTP', r.status, '— nouvel essai bientôt.');
            if (syncQueue[id] === undefined) syncQueue[id] = data; // garder pour réessayer
            failed = true;
            continue;
          }
          const ts = rows[0].updated_at;
          localStorage.setItem(SYNC_MODULES[id] + '_sync_ts', new Date(ts).getTime());
          lastTs[id] = ts;
        } catch(e) {
          console.warn('[SYNC] push:', id, e.message);
          if (syncQueue[id] === undefined) syncQueue[id] = data;
          failed = true;
        }
      }
    } catch(e) {
      console.warn('[SYNC] flush:', e.message);
      failed = true;
    } finally {
      flushing = false;
      if (failed) { updateSyncDot('red'); scheduleRetry(10000); }
      else if (syncEnabled && ws && ws.readyState === 1) updateSyncDot('green');
      if (flushAgain) { flushAgain = false; clearTimeout(syncTimer); syncTimer = setTimeout(flushQueue, 300); }
    }
  }

  // ── WebSocket Supabase Realtime ──
  function connectWS() {
    if (ws && ws.readyState < 2) return; // déjà connecté/en cours
    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = function() {
        console.log('[SYNC] WebSocket connecté ✓');
        wsRef++;
        ws.send(JSON.stringify({
          topic: 'realtime:public:haccp_store',
          event: 'phx_join',
          payload: {config: {broadcast:{self:false}, presence:{key:''}, postgres_changes:[{event:'*',schema:'public',table:'haccp_store'}]}},
          ref: String(wsRef)
        }));
        updateSyncDot('green');
        clearInterval(wsPingTimer);
        wsPingTimer = setInterval(function() {
          if (ws && ws.readyState === 1) {
            wsRef++;
            ws.send(JSON.stringify({topic:'phoenix',event:'heartbeat',payload:{},ref:String(wsRef)}));
          }
        }, 25000);
      };

      ws.onmessage = function(e) {
        try {
          const msg = JSON.parse(e.data);
          const d = msg.payload && msg.payload.data;
          const type = (d && d.type) || msg.event;
          if (type !== 'UPDATE' && type !== 'INSERT') return;
          const record = (d && d.record) || (msg.payload && msg.payload.record);
          if (!record) return;
          if (applyRow(record)) {
            showSyncToast('⚡ ' + record.id + ' synchronisé');
            console.log('[SYNC] ⚡ Changement reçu:', record.id);
          }
        } catch(e2) {}
      };

      ws.onerror = function() { updateSyncDot('orange'); };

      ws.onclose = function() {
        clearInterval(wsPingTimer);
        clearTimeout(wsReconnTimer);
        updateSyncDot('orange');
        // Reconnexion + rattrapage de ce qui a pu être manqué pendant la coupure
        wsReconnTimer = setTimeout(function() { connectWS(); pullCloud(); }, 3000);
      };

    } catch(e) {
      console.warn('[SYNC] WS init:', e.message);
      clearTimeout(wsReconnTimer);
      wsReconnTimer = setTimeout(connectWS, 5000);
    }
  }

  // ── Init ──
  async function initSync() {
    if (initRunning) return;
    initRunning = true;
    try {
      await ensureFreshToken(false);
      const r = await supa('/rest/v1/haccp_store?select=id&limit=1');
      if (!r.ok) throw new Error('HTTP '+r.status);
      syncEnabled = true;
      updateSyncDot('green');
      console.log('[SYNC] REST OK ✓ — Device:', DEVICE_ID);
      await pullCloud();
      connectWS();
      flushQueue();
    } catch(e) {
      console.warn('[SYNC] Init échoué:', e.message);
      updateSyncDot('red');
      setTimeout(initSync, 8000);
    } finally {
      initRunning = false;
    }
  }

  // ── Resynchroniser au retour au premier plan (veille tablette/téléphone) ──
  async function resyncNow() {
    if (!syncEnabled) { initSync(); return; }
    await ensureFreshToken(false);
    await pullCloud();
    connectWS();
    flushQueue();
  }
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') resyncNow();
  });
  window.addEventListener('online', function() { setTimeout(resyncNow, 1000); });
  setInterval(function() {
    if (document.visibilityState === 'visible' && syncEnabled) { pullCloud(); flushQueue(); }
  }, 30000);
  // Renouveler le jeton en arrière-plan avant qu'il n'expire
  setInterval(function() { ensureFreshToken(false); }, 60000);

  function restoreInvBackup() {
    const b = lsGet(INV_BACKUP_KEY, null);
    const fb = document.getElementById('save-feedback');
    if (!b || !b.qtes) { if (fb) { fb.className='voice-feedback err'; fb.textContent='Aucune copie de sécurité sur cet appareil.'; } return; }
    const when = b.savedAt ? new Date(b.savedAt).toLocaleString('fr-FR') : '?';
    if (!confirm('Remplacer l\'inventaire partagé par la version de cet appareil (enregistrée le ' + when + ') ?\nTous les appareils recevront cette version.')) return;
    const pending = lsGet(INV_PENDING_KEY, {});
    for (const c in b.qtes) pending[c] = normQ(b.qtes[c]);
    lsSet(INV_PENDING_KEY, pending);
    const base = lsGet(INV_BASE_KEY, {}) || {};
    applyInventaireRemote({ qtes: base, savedAt: b.savedAt }, null);
    flushQueue().then(function() {
      const left = Object.keys(lsGet(INV_PENDING_KEY, {})).length;
      if (fb) {
        fb.className = left ? 'voice-feedback err' : 'voice-feedback ok';
        fb.textContent = left ? '⚠️ Pas encore envoyé (connexion ?). Nouvel essai automatique.' : '✓ Version de cet appareil envoyée à tous les appareils.';
      }
      if (!left) { localStorage.removeItem(INV_BACKUP_KEY); refreshInvBackupButton(); }
    });
  }

  function refreshInvBackupButton() {
    const btn = document.getElementById('inv-backup-btn');
    if (!btn) return;
    const b = lsGet(INV_BACKUP_KEY, null);
    btn.style.display = (b && b.qtes) ? '' : 'none';
    if (b && b.savedAt) btn.textContent = '♻️ Récupérer l\'inventaire de cet appareil (avant synchro, ' + new Date(b.savedAt).toLocaleDateString('fr-FR') + ')';
  }
  window.addEventListener('load', function() { setTimeout(refreshInvBackupButton, 500); });

  // ── UI ──

  // Charger, mettre à jour ET ajouter les produits depuis Supabase
  async function syncProductsFromCloud() {
    try {
      const r = await supa('/rest/v1/haccp_products?select=code,zone,cat,produit,unite,prix,fournisseur,status&order=code');
      if (!r.ok) return;
      const rows = await r.json();
      if (!rows || !rows.length) return;
      let updated = 0, added = 0;
      rows.forEach(row => {
        const item = DATA.find(d => d.code === row.code);
        if (item) {
          // Mettre à jour prix, nom, zone, fournisseur
          if (Math.abs(item.prix - parseFloat(row.prix)) > 0.001) { item.prix = parseFloat(row.prix); updated++; }
          if (item.produit !== row.produit) { item.produit = row.produit; updated++; }
          if (item.zone !== row.zone) { item.zone = row.zone; updated++; }
          if (item.fournisseur !== row.fournisseur) { item.fournisseur = row.fournisseur; }
          if (row.unite && item.unite !== row.unite) { item.unite = row.unite; }
        } else {
          // Nouveau produit dans Supabase → l'ajouter au DATA local
          DATA.push({
            code: row.code,
            zone: row.zone,
            cat: row.cat,
            produit: row.produit,
            unite: row.unite || '',
            prix: parseFloat(row.prix) || 0,
            qte: null,
            fournisseur: row.fournisseur || '',
            status: row.status || 'new'
          });
          added++;
        }
      });
      if (updated > 0 || added > 0) {
        console.log('[SYNC] ' + updated + ' MAJ + ' + added + ' nouveaux produits depuis Supabase');
        if (added > 0) {
          if (typeof buildZoneTabs==='function') buildZoneTabs();
          if (typeof buildFilters==='function') buildFilters();
        }
        if (typeof render === 'function') render();
        if (typeof updateStats === 'function') updateStats();
        if (typeof buildBilan === 'function') buildBilan();
        if (added > 0) showSyncToast('✨ ' + added + ' nouveau(x) produit(s) chargé(s)');
      }
    } catch(e) { console.warn('[SYNC] syncProducts:', e.message); }
  }

  // Envoyer un produit modifié vers Supabase
  async function pushProductToCloud(item) {
    if (!syncEnabled) return;
    try {
      await ensureFreshToken(false);
      const r = await supa('/rest/v1/haccp_products?code=eq.' + encodeURIComponent(item.code), {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          produit: item.produit,
          zone: item.zone,
          cat: item.cat,
          unite: item.unite,
          prix: item.prix,
          fournisseur: item.fournisseur || '',
          status: item.status || ''
        })
      });
      const rows = r.ok ? await r.json().catch(function() { return null; }) : null;
      if (!rows || !rows.length) {
        console.warn('[SYNC] pushProduct refusé pour', item.code, '— HTTP', r.status, '— la modification n\'est PAS enregistrée sur le serveur.');
        updateSyncDot('red');
      }
    } catch(e) { console.warn('[SYNC] pushProduct:', e.message); updateSyncDot('red'); }
  }

  function updateSyncDot(color) {
    const dot = document.getElementById('sync-dot');
    if (!dot) return;
    const colors = {green:'#22c55e', orange:'#f59e0b', red:'#ef4444'};
    dot.style.background = colors[color]||colors.orange;
    dot.title = color==='green'?'Synchronisé ✓':color==='red'?'Hors ligne':'Connexion...';
  }

  function showSyncToast(msg) {
    const t = document.getElementById('sync-toast');
    if (!t) return;
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.style.opacity='0', 2500);
  }

  window.addEventListener('load', function() { 
  initRecettesPDF();
  // Afficher l'écran d'accueil immédiatement
  var hs = document.getElementById('home-screen');
  if (hs) hs.style.display = 'block';
  // Masquer les panneaux au démarrage
  document.querySelectorAll('.panel').forEach(function(p) {
    p.classList.remove('active');
  });
  setTimeout(initSync, 1500);
  // Mettre à jour les stats après chargement des données
  setTimeout(function() {
    try { showHomeScreen(); } catch(e) {}
  }, 3000);
});
