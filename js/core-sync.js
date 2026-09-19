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

  let ws = null;
  let wsRef = 0;
  let wsPingTimer = null;
  let wsReconnTimer = null;
  let syncEnabled = false;
  let syncQueue = {};
  let syncTimer = null;
  let lastTs = {};

  // ── REST fetch helper ──
  // IMPORTANT (corrigé le 19/09/2026) : utiliser le token de l'utilisateur connecté
  // (window._supabaseAuthToken, posé par updateSupabaseAuth() dans app.js après
  // connexion) plutôt que la clé anonyme fixe. Les règles RLS de haccp_store et
  // haccp_products exigent auth.role()='authenticated' pour écrire (INSERT/UPDATE/
  // DELETE) — avec la clé anonyme, ces écritures étaient silencieusement ignorées
  // par Postgres (0 ligne modifiée, aucune erreur), donc rien n'était jamais
  // réellement synchronisé entre appareils. La clé apikey reste toujours la clé
  // anonyme (identifiant du projet, pas de rôle) ; seul le Authorization change.
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

  // ── Charger depuis le cloud ──
  async function pullCloud() {
    try {
      const r = await supa('/rest/v1/haccp_store?select=id,data,updated_at,updated_by');
      if (!r.ok) return;
      const rows = await r.json();
      let n = 0;
      for (const row of rows) {
        if (row.updated_by === DEVICE_ID || row.updated_by === getCurrentUserIdentifier()) continue;
        const lk = SYNC_MODULES[row.id];
        if (!lk || !row.data || !Object.keys(row.data).length) continue;
        const remoteTs = new Date(row.updated_at).getTime();
        const localTs  = parseInt(localStorage.getItem(lk+'_sync_ts')||'0');
        if (remoteTs > localTs) {
          localStorage.setItem(lk, JSON.stringify(row.data));
          localStorage.setItem(lk+'_sync_ts', remoteTs);
          lastTs[row.id] = row.updated_at;
          n++;
          applyModule(row.id);
        }
      }
      if (n) showSyncToast('🔄 '+n+' module(s) mis à jour');
    } catch(e) { logSyncError('pull', e); }
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
        case 'dlc': if (typeof renderDLC==='function') renderDLC(); break;
        case 'tracabilite': if (typeof renderTracabilite==='function') renderTracabilite(); break;
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
    if (!syncEnabled) return;
    syncQueue[moduleId] = data;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(flushQueue, 600);
  }

  async function flushQueue() {
    const q = {...syncQueue}; syncQueue = {};
    for (const [id, data] of Object.entries(q)) {
      try {
        const ts = new Date().toISOString();
        const r = await supa('/rest/v1/haccp_store?id=eq.'+id, {
          method: 'PATCH',
          body: JSON.stringify({data, updated_by: getCurrentUserIdentifier(), updated_at: ts})
        });
        if (!r.ok) {
          // Écriture refusée (session expirée, token invalide...) — ne pas se taire :
          // sans ce contrôle, un échec silencieux fait perdre la modification sans
          // que personne ne s'en aperçoive (voir correctif du 19/09/2026).
          console.warn('[SYNC] push refusé pour', id, '— HTTP', r.status, '— la modification n\'est PAS enregistrée sur le serveur.');
          updateSyncDot('red');
          continue;
        }
        localStorage.setItem(SYNC_MODULES[id]+'_sync_ts', Date.now());
        lastTs[id] = ts;
      } catch(e) { console.warn('[SYNC] push:', id, e.message); updateSyncDot('red'); }
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
        // S'abonner aux changements de haccp_store
        ws.send(JSON.stringify({
          topic: 'realtime:public:haccp_store',
          event: 'phx_join',
          payload: {config: {broadcast:{self:false}, presence:{key:''}, postgres_changes:[{event:'UPDATE',schema:'public',table:'haccp_store'}]}},
          ref: String(wsRef)
        }));
        // Ping toutes les 25s pour garder la connexion
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
          // Changement Postgres détecté
          if (msg.event === 'UPDATE' || (msg.payload && msg.payload.data && msg.payload.data.type === 'UPDATE')) {
            const record = msg.payload.record || (msg.payload.data && msg.payload.data.record);
            if (!record) return;
            if (record.updated_by === DEVICE_ID) return; // nos propres données
            const lk = SYNC_MODULES[record.id];
            if (!lk || !record.data) return;
            const remoteTs = new Date(record.updated_at).getTime();
            const localTs  = parseInt(localStorage.getItem(lk+'_sync_ts')||'0');
            if (remoteTs > localTs) {
              localStorage.setItem(lk, JSON.stringify(record.data));
              localStorage.setItem(lk+'_sync_ts', remoteTs);
              lastTs[record.id] = record.updated_at;
              applyModule(record.id);
              showSyncToast('⚡ '+record.id+' synchronisé');
              console.log('[SYNC] ⚡ Changement reçu:', record.id);
            }
          }
        } catch(e2) {}
      };

      ws.onerror = function() {
        updateSyncDot('orange');
      };

      ws.onclose = function() {
        clearInterval(wsPingTimer);
        clearTimeout(wsReconnTimer);
        // Dot orange pendant la reconnexion (pas d'alerte — reconnexion normale)
        updateSyncDot('orange');
        wsReconnTimer = setTimeout(connectWS, 3000);
      };

    } catch(e) {
      console.warn('[SYNC] WS init:', e.message);
      clearTimeout(wsReconnTimer);
      wsReconnTimer = setTimeout(connectWS, 5000);
    }
  }

  // ── Init ──
  async function initSync() {
    try {
      // Test REST
      const r = await supa('/rest/v1/haccp_store?select=id&limit=1');
      if (!r.ok) throw new Error('HTTP '+r.status);
      syncEnabled = true;
      updateSyncDot('green');
      console.log('[SYNC] REST OK ✓ — Device:', DEVICE_ID);
      // Charger données
      await pullCloud();
      // Connecter WebSocket temps réel
      connectWS();
    } catch(e) {
      console.warn('[SYNC] Init échoué:', e.message);
      updateSyncDot('red');
      setTimeout(initSync, 8000);
    }
  }

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
      const r = await supa('/rest/v1/haccp_products?code=eq.' + item.code, {
        method: 'PATCH',
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
      if (!r.ok) {
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
