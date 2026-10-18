// ════════════════════════════════════════════════════════════════════
// INVENTAIRE+ (18/10/2026) — Inventaire rapide (téléphone + tablette),
// alerte d'écart, colisage, ordre des étagères, code-barres, comptage à
// plusieurs, archivage automatique, écarts, produits dormants, évolution
// sur 12 mois, CA mensuel. Chargé après js/app.js (utilise ses fonctions).
// ════════════════════════════════════════════════════════════════════

const ORDRE_KEY = 'haccp_ordre_comptage_v1';   // {zone: [codes dans l'ordre des étagères]}
const CA_KEY = 'haccp_ca_mensuel_v1';          // {'AAAA-MM': {nourriture, boissons}}
let ORDRE = {}, CA_MENSUEL = {};
function _lsJSON(k, def) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : def; } catch (e) { return def; } }
function invPlusLoad() { ORDRE = _lsJSON(ORDRE_KEY, {}) || {}; CA_MENSUEL = _lsJSON(CA_KEY, {}) || {}; }
invPlusLoad();
// Données reçues d'un autre appareil
function invPlusReload(id) {
  invPlusLoad();
  if (id === 'ordre_comptage' && document.getElementById('quick-overlay')?.classList.contains('open')) quickRefreshProgress();
  if (id === 'ca_mensuel' && document.getElementById('panel-historique')?.classList.contains('active')) renderHistorique();
}

// Position d'un produit dans l'ordre des étagères de sa zone (sinon : à la fin)
function ordreIndex(d) {
  const l = ORDRE[d.zone];
  if (!Array.isArray(l)) return 1e6;
  const i = l.indexOf(d.code);
  return i < 0 ? 1e6 : i;
}
function _zoneIdx(z) { const k = Object.keys(ZONES); const i = k.indexOf(z); return i < 0 ? k.length : i; }
function ordreComptage(a, b) {
  return _zoneIdx(a.zone) - _zoneIdx(b.zone) || ordreIndex(a) - ordreIndex(b) ||
    a.produit.localeCompare(b.produit, 'fr', { sensitivity: 'base' });
}

// ── 1. Alerte d'écart anormal ───────────────────────────────────────
// Référence : quantité du dernier inventaire archivé où le produit était compté.
function _derniereQte(code) {
  const snaps = [...(HISTO_DATA || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  for (const s of snaps) {
    const it = (s.items || []).find(i => i.code === code);
    if (it && it.qte != null) return { qte: Number(it.qte), label: s.label };
  }
  return null;
}
function ecartMessage(d, v) {
  if (v == null || isNaN(v)) return null;
  const unite = d.unite ? ' ' + d.unite : '';
  const ref = _derniereQte(d.code);
  const montant = v * (d.prix || 0);
  if (ref && ref.qte > 0 && v >= ref.qte * 5 && v - ref.qte >= 5)
    return `${v}${unite} pour « ${d.produit} », soit ${Math.round(v / ref.qte)} fois plus qu'au dernier inventaire (${ref.qte}${unite}, « ${ref.label} »).`;
  if ((!ref || ref.qte === 0) && v >= 200)
    return `${v}${unite} pour « ${d.produit} » : quantité très élevée.`;
  if (montant >= 1500 && (!ref || ref.qte * (d.prix || 0) < montant / 3))
    return `${v}${unite} pour « ${d.produit} » représente ${montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} de stock.`;
  return null;
}
function confirmerEcart(d, v) {
  const m = ecartMessage(d, v);
  return !m || confirm('⚠️ Vérification\n\n' + m + '\n\nConfirmez-vous cette quantité ?');
}
// Liste principale de l'inventaire : contrôle à la sortie du champ
function ecartCheckInput(inp) {
  const d = DATA.find(x => x.code === inp.dataset.code);
  if (!d) return;
  const raw = String(inp.value).trim();
  if (raw === '') return;
  const v = parseFloat(raw.replace(',', '.'));
  if (!confirmerEcart(d, v)) {
    const prev = inp.dataset.prev != null ? inp.dataset.prev : '';
    inp.value = prev;
    upd(d.code, prev);
    setTimeout(() => inp.focus(), 50);
  }
}

// ── 2. Inventaire rapide ────────────────────────────────────────────
let _qList = [], _qIdx = 0, _qReorder = false;
function openQuickInv() {
  invPlusLoad();
  const sel = document.getElementById('quick-zone');
  sel.innerHTML = '<option value="TOUT">Toutes les zones</option>' + Object.keys(ZONES).filter(z => DATA.some(d => d.zone === z))
    .map(z => `<option value="${esc(z)}">${esc(ZONES[z].label)}</option>`).join('');
  sel.value = (activeZone && activeZone !== 'TOUT' && DATA.some(d => d.zone === activeZone)) ? activeZone : 'TOUT';
  _qReorder = false;
  document.getElementById('quick-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  quickRebuild();
}
function closeQuickInv() {
  if (_qReorder) quickToggleReorder();
  document.getElementById('quick-overlay').classList.remove('open');
  document.body.style.overflow = '';
  render(); updateStats(); scheduleBilanRebuild(); buildZoneTabs();
  autoArchiveCheck();
}
function quickRebuild() {
  const z = document.getElementById('quick-zone').value;
  const onlyMissing = document.getElementById('quick-missing').checked && !_qReorder;
  // Liste figée : un produit saisi ne disparaît pas sous les doigts
  _qList = DATA.filter(d => (z === 'TOUT' || d.zone === z) && (!onlyMissing || d.qte === null || d.qte === undefined))
    .sort(ordreComptage).map(d => d.code);
  _qIdx = 0;
  quickRender();
}
function _qItem() { return DATA.find(d => d.code === _qList[_qIdx]); }
function _qItems() { return _qList.map(c => DATA.find(d => d.code === c)).filter(Boolean); }

// Avancement par zone (comptage à plusieurs : mis à jour en direct)
function _zoneProgress() {
  return Object.keys(ZONES).map(z => {
    const items = DATA.filter(d => d.zone === z);
    if (!items.length) return null;
    const done = items.filter(d => d.qte != null).length;
    return { z, label: ZONES[z].label, n: items.length, done, pct: Math.round(done / items.length * 100) };
  }).filter(Boolean);
}
function quickRefreshProgress() {
  const ov = document.getElementById('quick-overlay');
  if (!ov || !ov.classList.contains('open')) return;
  const items = _qItems();
  const done = items.filter(d => d.qte != null).length;
  const pct = items.length ? Math.round(done / items.length * 100) : 0;
  document.getElementById('quick-progress-fill').style.width = pct + '%';
  document.getElementById('quick-progress-txt').textContent = items.length
    ? `${done} / ${items.length} comptés (${pct} %) — produit ${Math.min(_qIdx + 1, items.length)} sur ${items.length}` : '';
  const cur = document.getElementById('quick-zone').value;
  document.getElementById('quick-zones').innerHTML = _zoneProgress().map(p =>
    `<button class="quick-zchip${p.z === cur ? ' current' : ''}${p.pct === 100 ? ' done' : ''}" onclick="quickSetZone(${jsArg(p.z)})" title="${p.done} / ${p.n}">${esc(p.label)} <b>${p.pct}%</b></button>`).join('');
  const list = document.getElementById('quick-list');
  list.innerHTML = (_qReorder ? '<div class="quick-reorder-help">Rangez les produits dans l\'ordre des étagères avec ▲ ▼ : l\'inventaire rapide suivra ce parcours.</div>' : '') +
    items.map((d, i) => `<div class="quick-li${i === _qIdx ? ' current' : ''}${d.qte != null ? ' done' : ''}" onclick="${_qReorder ? '' : `quickGo(${i})`}">
      <span class="quick-li-name">${esc(d.produit)}</span>
      ${_qReorder ? `<span class="quick-li-move"><button onclick="event.stopPropagation();quickMove(${i},-1)" ${i === 0 ? 'disabled' : ''}>▲</button><button onclick="event.stopPropagation();quickMove(${i},1)" ${i === items.length - 1 ? 'disabled' : ''}>▼</button></span>`
        : `<span class="quick-li-q">${d.qte != null ? esc(d.qte) + ' ' + esc(d.unite || '') : '—'}</span>`}</div>`).join('');
  const c = list.querySelector('.current'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'nearest' });
}
function quickSetZone(z) { document.getElementById('quick-zone').value = z; quickRebuild(); }

function quickRender() {
  quickRefreshProgress();
  const card = document.getElementById('quick-card');
  if (_qReorder) {
    card.innerHTML = `<div class="quick-empty">↕ Mode « ordre des étagères »<br><br>
      <button class="quick-big primary" onclick="quickToggleReorder()">✓ Terminer le rangement</button></div>`;
    return;
  }
  const d = _qItem();
  if (!d) {
    card.innerHTML = `<div class="quick-empty">${_qList.length ? '🎉 Zone terminée !' : 'Aucun produit à compter avec ces filtres.'}<br><br>
      <button class="quick-big primary" onclick="closeQuickInv()">✓ Terminer</button></div>`;
    return;
  }
  const col = d.colisage > 0 ? d.colisage : 0;
  const ref = _derniereQte(d.code);
  let saisie;
  if (col) {
    // Colisage : « 2 cartons de 12 + 3 » → 27
    const q = d.qte != null ? Number(d.qte) : null;
    const nbColis = q != null ? Math.floor(q / col) : '';
    const reste = q != null ? Math.round((q - nbColis * col) * 100) / 100 : '';
    saisie = `<div class="quick-colis">
        <label>Colis de ${col}<div class="quick-input-row small">
          <button class="quick-step" onclick="quickStepField('quick-colis',-1)">−1</button>
          <input id="quick-colis" class="quick-qte" type="number" inputmode="decimal" min="0" step="1" value="${nbColis}" placeholder="0" oninput="quickColisTotal()" onkeydown="if(event.key==='Enter'){event.preventDefault();quickNext(true);}">
          <button class="quick-step" onclick="quickStepField('quick-colis',1)">+1</button></div></label>
        <label>+ ${esc(d.unite || 'unités')} à l'unité<div class="quick-input-row small">
          <button class="quick-step" onclick="quickStepField('quick-unites',-1)">−1</button>
          <input id="quick-unites" class="quick-qte" type="number" inputmode="decimal" min="0" step="0.01" value="${reste}" placeholder="0" oninput="quickColisTotal()" onkeydown="if(event.key==='Enter'){event.preventDefault();quickNext(true);}">
          <button class="quick-step" onclick="quickStepField('quick-unites',1)">+1</button></div></label>
        <div class="quick-colis-total" id="quick-colis-total"></div></div>`;
  } else {
    saisie = `<div class="quick-input-row">
      <button class="quick-step" onclick="quickStepField('quick-qte',-1)">−1</button>
      <button class="quick-step" onclick="quickStepField('quick-qte',-0.5)">−½</button>
      <input id="quick-qte" class="quick-qte" type="number" inputmode="decimal" min="0" step="0.01" value="${d.qte != null ? d.qte : ''}" placeholder="0" onkeydown="if(event.key==='Enter'){event.preventDefault();quickNext(true);}">
      <button class="quick-step" onclick="quickStepField('quick-qte',0.5)">+½</button>
      <button class="quick-step" onclick="quickStepField('quick-qte',1)">+1</button></div>
      <div class="quick-unit">${esc(d.unite || '')}</div>`;
  }
  const zc = (ZONES[d.zone] || { color: '#888', label: d.zone });
  card.innerHTML = `
    <div class="quick-zone-pill" style="background:${zc.color}22;color:${zc.color}">${esc(zc.label)}</div>
    <div class="quick-name">${esc(d.produit)}</div>
    <div class="quick-meta">${esc(d.code)}${d.fournisseur ? ' · ' + esc(d.fournisseur) : ''} · ${d.prix ? d.prix.toFixed(2) + ' € / ' + esc(d.unite || 'u.') : 'prix non renseigné'}${ref ? ` · dernier inventaire : <b>${ref.qte} ${esc(d.unite || '')}</b>` : ''}</div>
    ${saisie}
    <div class="quick-actions">
      <button class="quick-big" onclick="quickPrev()" ${_qIdx === 0 ? 'disabled' : ''}>◀ Précédent</button>
      <button class="quick-big" onclick="quickSetZero()">0</button>
      <button class="quick-big" onclick="quickNext(false)">Passer ▶</button>
      <button class="quick-big primary" onclick="quickNext(true)">✓ Valider et suivant</button>
    </div>`;
  if (col) quickColisTotal();
  const inp = document.getElementById(col ? 'quick-colis' : 'quick-qte');
  if (inp && window.matchMedia('(pointer:fine)').matches) setTimeout(() => { inp.focus(); inp.select(); }, 30);
}
function quickStepField(id, delta) {
  const inp = document.getElementById(id); if (!inp) return;
  const v = parseFloat(String(inp.value).replace(',', '.')) || 0;
  inp.value = Math.max(0, Math.round((v + delta) * 100) / 100);
  if (id !== 'quick-qte') quickColisTotal();
}
function _qValeurSaisie() {
  const d = _qItem(); if (!d) return null;
  if (d.colisage > 0) {
    const c = document.getElementById('quick-colis'), u = document.getElementById('quick-unites');
    if (!c || (String(c.value).trim() === '' && String(u.value).trim() === '')) return null;
    const nc = parseFloat(String(c.value).replace(',', '.')) || 0, nu = parseFloat(String(u.value).replace(',', '.')) || 0;
    return Math.round((nc * d.colisage + nu) * 100) / 100;
  }
  const inp = document.getElementById('quick-qte');
  if (!inp || String(inp.value).trim() === '') return null;
  return parseFloat(String(inp.value).replace(',', '.'));
}
function quickColisTotal() {
  const el = document.getElementById('quick-colis-total'); const d = _qItem();
  if (!el || !d) return;
  const v = _qValeurSaisie();
  el.textContent = v == null ? '' : `= ${v} ${d.unite || ''} au total`;
}
// Enregistre la saisie ; renvoie false si l'utilisateur annule (écart)
function _qSave() {
  const d = _qItem(); if (!d) return true;
  const v = _qValeurSaisie();
  if (v == null || isNaN(v)) return true;  // champ vide : quantité inchangée
  if (v === d.qte) return true;
  if (!confirmerEcart(d, v)) return false;
  upd(d.code, v);
  const field = document.querySelector(`input.qte-input[data-code="${CSS.escape(d.code)}"]`);
  if (field) field.value = d.qte != null ? d.qte : '';
  return true;
}
function quickSetZero() {
  const d = _qItem(); if (!d) return;
  if (d.colisage > 0) { document.getElementById('quick-colis').value = '0'; document.getElementById('quick-unites').value = '0'; }
  else document.getElementById('quick-qte').value = '0';
  quickNext(true);
}
function quickNext(save) { if (save && !_qSave()) return; _qIdx = Math.min(_qIdx + 1, _qList.length); quickRender(); }
function quickPrev() { if (!_qSave()) return; if (_qIdx > 0) _qIdx--; quickRender(); }
function quickGo(i) { if (!_qSave()) return; _qIdx = i; quickRender(); }

// ── 3. Ordre des étagères ───────────────────────────────────────────
function quickToggleReorder() {
  const z = document.getElementById('quick-zone').value;
  if (!_qReorder && z === 'TOUT') { alert('Choisissez d\'abord une zone (ex. Frigo 1) pour ranger ses produits dans l\'ordre des étagères.'); return; }
  _qReorder = !_qReorder;
  document.getElementById('quick-reorder-btn').classList.toggle('active', _qReorder);
  if (!_qReorder) saveModule(ORDRE_KEY, 'ordre_comptage', ORDRE);
  quickRebuild();
}
function quickMove(i, dir) {
  const j = i + dir; if (j < 0 || j >= _qList.length) return;
  [_qList[i], _qList[j]] = [_qList[j], _qList[i]];
  const z = document.getElementById('quick-zone').value;
  ORDRE[z] = _qList.slice();
  _qIdx = j;
  quickRefreshProgress();
}

// ── 4. Code-barres (appareil photo, ou douchette / saisie) ──────────
let _scanStream = null, _scanTimer = null;
async function quickScan() {
  let ov = document.getElementById('scan-overlay');
  if (!ov) {
    ov = document.createElement('div'); ov.id = 'scan-overlay'; ov.className = 'scan-overlay';
    ov.innerHTML = `<div class="scan-box"><div class="scan-head"><b>📷 Scanner un code-barres</b><button class="quick-close" onclick="closeScan()">✕</button></div>
      <video id="scan-video" playsinline muted></video>
      <div id="scan-msg" class="scan-msg"></div>
      <div class="scan-manual"><input id="scan-input" class="dlc-input" inputmode="numeric" placeholder="ou tapez / scannez le code (douchette)" onkeydown="if(event.key==='Enter'){handleScannedCode(this.value);}">
      <button class="quick-big" onclick="handleScannedCode(document.getElementById('scan-input').value)">OK</button></div></div>`;
    document.body.appendChild(ov);
  }
  ov.classList.add('open');
  const msg = document.getElementById('scan-msg'), video = document.getElementById('scan-video');
  document.getElementById('scan-input').value = '';
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices) {
    video.style.display = 'none';
    msg.textContent = 'La lecture par l\'appareil photo n\'est pas disponible sur ce navigateur (iPhone/iPad notamment). Tapez le code, ou utilisez une douchette Bluetooth.';
    setTimeout(() => document.getElementById('scan-input').focus(), 100);
    return;
  }
  try {
    _scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
    video.style.display = 'block'; video.srcObject = _scanStream; await video.play();
    msg.textContent = 'Visez le code-barres…';
    const det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
    const loop = async () => {
      if (!_scanStream) return;
      try { const codes = await det.detect(video); if (codes.length) { handleScannedCode(codes[0].rawValue); return; } } catch (e) {}
      _scanTimer = setTimeout(loop, 250);
    };
    loop();
  } catch (e) {
    video.style.display = 'none';
    msg.textContent = 'Appareil photo indisponible (' + e.message + '). Tapez le code ci-dessous.';
  }
}
function closeScan() {
  clearTimeout(_scanTimer);
  if (_scanStream) { _scanStream.getTracks().forEach(t => t.stop()); _scanStream = null; }
  document.getElementById('scan-overlay')?.classList.remove('open');
}
function handleScannedCode(raw) {
  const code = String(raw || '').replace(/\s/g, '');
  if (!code) return;
  closeScan();
  const d = DATA.find(x => x.ean === code);
  if (d) {
    let i = _qList.indexOf(d.code);
    if (i < 0) { document.getElementById('quick-zone').value = d.zone; document.getElementById('quick-missing').checked = false; quickRebuild(); i = _qList.indexOf(d.code); }
    if (i >= 0) { _qIdx = i; quickRender(); }
    return;
  }
  const cur = _qItem();
  if (cur && confirm(`Code ${code} inconnu.\n\nL'associer au produit affiché « ${cur.produit} » ?\n(les prochains scans de ce code ouvriront directement ce produit)`)) {
    cur.ean = code;
    pushProductToCloud(cur).then(ok => showSyncToast(ok ? '🔖 Code-barres enregistré pour ' + cur.produit : '⚠ Code-barres NON enregistré sur le serveur'));
  }
}

// ── 5. Archivage automatique ────────────────────────────────────────
// - Clôture du mois : le dernier jour après 18 h, ou du 1er au 3 du mois suivant
//   (si aucun inventaire n'a été archivé dans les 5 jours) ;
// - Inventaire complet : dès que 100 % des produits sont comptés (une fois par mois).
// Identifiants fixes (auto-…) : deux appareils ne créent pas de doublon.
function _snapshot(id, label) {
  return {
    id, label, auto: true, date: new Date().toISOString(),
    total: DATA.reduce((s, d) => s + (mont(d) || 0), 0), refs: DATA.length,
    items: DATA.map(d => ({ code: d.code, produit: d.produit, zone: d.zone, qte: d.qte ?? null, prix: d.prix }))
  };
}
function autoArchiveCheck() {
  try {
    if (!Array.isArray(HISTO_DATA) || !DATA.length) return;
    const now = new Date();
    const counted = DATA.filter(d => d.qte != null).length;
    if (counted / DATA.length < 0.3) return; // inventaire trop incomplet pour être archivé
    const mois = d => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    let changed = false;
    // a) Inventaire complet
    if (counted === DATA.length) {
      const id = 'auto-complet-' + localISODate(now).slice(0, 7);
      const snap = _snapshot(id, 'Inventaire complet ' + mois(now) + ' (auto)');
      const i = HISTO_DATA.findIndex(h => h.id === id);
      if (i >= 0) HISTO_DATA[i] = snap; else HISTO_DATA.unshift(snap);
      changed = true;
    }
    // b) Clôture du mois
    const dernierJour = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    let cible = null;
    if (now.getDate() === dernierJour && now.getHours() >= 18) cible = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (now.getDate() <= 3) cible = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    if (cible) {
      const id = 'auto-cloture-' + localISODate(cible).slice(0, 7);
      const recent = HISTO_DATA.some(h => h.id === id || (now - new Date(h.date)) < 5 * 86400000);
      if (!recent) { HISTO_DATA.unshift(_snapshot(id, 'Clôture ' + mois(cible) + ' (auto)')); changed = true; }
    }
    if (changed) {
      HISTO_DATA.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      if (HISTO_DATA.length > 36) HISTO_DATA = HISTO_DATA.slice(0, 36);
      saveAllData();
      if (document.getElementById('panel-historique')?.classList.contains('active')) renderHistorique();
    }
  } catch (e) { console.warn('[ARCHIVE AUTO]', e.message); }
}
// Contrôle au démarrage (après la 1re synchro) puis toutes les 30 min
setTimeout(autoArchiveCheck, 15000);
setInterval(autoArchiveCheck, 30 * 60 * 1000);

// ── 6. CA mensuel (ratio matière) ───────────────────────────────────
function caMoisDe(dateISO) { return localISODate(new Date(dateISO)).slice(0, 7); }
function consoSaveCA(mois) {
  const n = parseFloat(String(document.getElementById('conso-ca-n')?.value || '').replace(',', '.'));
  const b = parseFloat(String(document.getElementById('conso-ca-b')?.value || '').replace(',', '.'));
  CA_MENSUEL[mois] = { nourriture: isNaN(n) ? null : n, boissons: isNaN(b) ? null : b };
  saveModule(CA_KEY, 'ca_mensuel', CA_MENSUEL);
}

// ── 7. Analyses (onglet Historique) ─────────────────────────────────
function invPlusRenderAnalyses() {
  renderEcarts(); renderDormants(); renderEvolution();
}
const _eur = v => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
function _snapsTries() { return [...(HISTO_DATA || [])].sort((a, b) => String(a.date).localeCompare(String(b.date))); }

// Écarts : stock théorique (début + entrées − sorties/pertes de la Traçabilité) vs compté
function renderEcarts() {
  const box = document.getElementById('ecarts-card'); if (!box) return;
  const snaps = _snapsTries();
  if (!snaps.length) { box.innerHTML = ''; return; }
  const debId = document.getElementById('conso-debut')?.value;
  const deb = snaps.find(s => String(s.id) === debId) || snaps[snaps.length - 1];
  const mvts = {};
  (TRAC_DATA || []).forEach(t => {
    if (!t.date || new Date(t.date) <= new Date(deb.date)) return;
    const m = mvts[t.code] || (mvts[t.code] = { in: 0, out: 0 });
    const q = Number(t.qte) || 0;
    if (t.type === 'entree') m.in += q; else if (t.type === 'sortie' || t.type === 'perte') m.out += q;
  });
  const lignes = [], variations = [];
  DATA.forEach(d => {
    const it = (deb.items || []).find(i => i.code === d.code);
    const q0 = it && it.qte != null ? Number(it.qte) : null;
    if (q0 == null || d.qte == null) return;
    const m = mvts[d.code];
    if (m) {
      const theo = q0 + m.in - m.out, ecart = d.qte - theo;
      if (Math.abs(ecart) > 0.001) lignes.push({ d, q0, m, theo, ecart, val: ecart * (d.prix || 0) });
    } else {
      const v = d.qte - q0;
      if (Math.abs(v) > 0.001) variations.push({ d, q0, v, val: v * (d.prix || 0) });
    }
  });
  lignes.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
  variations.sort((a, b) => a.val - b.val);
  const u = d => esc(d.unite || '');
  box.innerHTML = `<div class="conso-title">🔎 Écarts d'inventaire depuis « ${esc(deb.label)} »</div>` +
    (lignes.length ? `<table class="conso-table"><tr><th>Produit</th><th class="num">Début</th><th class="num">+ Entrées</th><th class="num">− Sorties</th><th class="num">Théorique</th><th class="num">Compté</th><th class="num">Écart</th></tr>` +
      lignes.slice(0, 15).map(l => `<tr><td>${esc(l.d.produit)}</td><td class="num">${l.q0}</td><td class="num">${l.m.in}</td><td class="num">${l.m.out}</td><td class="num">${Math.round(l.theo * 100) / 100}</td><td class="num">${l.d.qte} ${u(l.d)}</td>
        <td class="num ${l.ecart < 0 ? 'neg' : ''}">${l.ecart > 0 ? '+' : ''}${Math.round(l.ecart * 100) / 100} (${_eur(l.val)})</td></tr>`).join('') + '</table>'
      : '<div class="conso-foot">Aucun écart calculable : les entrées / sorties / pertes de la période n\'ont pas été saisies dans la Traçabilité.</div>') +
    (variations.length ? `<div class="conso-sub">Plus fortes consommations (produits sans mouvement saisi) :</div><table class="conso-table">` +
      variations.slice(0, 10).map(v => `<tr><td>${esc(v.d.produit)}</td><td class="num">${v.q0} → ${v.d.qte} ${u(v.d)}</td><td class="num ${v.val < 0 ? 'neg' : ''}">${_eur(v.val)}</td></tr>`).join('') + '</table>' : '') +
    `<div class="conso-foot">Un écart négatif = produit manquant par rapport au théorique (perte non déclarée, casse, erreur de comptage…).</div>`;
}

// Produits dormants : aucune variation sur les 3 derniers inventaires archivés
function renderDormants() {
  const box = document.getElementById('dormants-card'); if (!box) return;
  const snaps = _snapsTries().slice(-3);
  if (snaps.length < 2) { box.innerHTML = ''; return; }
  const q = (s, c) => { const it = (s.items || []).find(i => i.code === c); return it && it.qte != null ? Number(it.qte) : null; };
  const dormants = DATA.filter(d => {
    const vals = snaps.map(s => q(s, d.code)).concat([d.qte != null ? Number(d.qte) : null]);
    const nonNuls = vals.filter(v => v != null);
    if (nonNuls.length < 2) return false;
    return nonNuls.every(v => v === nonNuls[0]);
  }).map(d => ({ d, val: (d.qte || 0) * (d.prix || 0) })).sort((a, b) => b.val - a.val);
  const total = dormants.reduce((s, x) => s + x.val, 0);
  box.innerHTML = `<div class="conso-title">💤 Produits dormants (${dormants.length}) — ${_eur(total)} immobilisés</div>` +
    (dormants.length ? `<div class="conso-foot">Quantité identique sur les ${snaps.length} derniers inventaires et aujourd'hui : à écouler, ou à retirer du catalogue si le produit n'est plus utilisé.</div>
      <table class="conso-table">` + dormants.slice(0, 25).map(x => `<tr><td>${esc(x.d.produit)}<br><small style="color:var(--text3)">${esc((ZONES[x.d.zone] || { label: x.d.zone }).label)}</small></td>
        <td class="num">${x.d.qte != null ? x.d.qte + ' ' + esc(x.d.unite || '') : '—'}</td><td class="num">${_eur(x.val)}</td>
        <td class="num"><button class="dlc-btn-sm" onclick="openEditProduct(${jsArg(x.d.code)})">Modifier</button></td></tr>`).join('') + '</table>'
      : '<div class="conso-foot">Aucun produit dormant.</div>');
}

// Évolution sur 12 mois : valeur du stock, consommation et ratio matière
function renderEvolution() {
  const box = document.getElementById('evolution-card'); if (!box) return;
  const snaps = _snapsTries().slice(-13);
  if (snaps.length < 2) { box.innerHTML = ''; return; }
  const pts = [];
  for (let i = 1; i < snaps.length; i++) {
    const a = snaps[i - 1], b = snaps[i];
    const sA = _stockSplit(a.items), sB = _stockSplit(b.items), ach = _achatsEntre(a.date, b.date);
    const conso = sA.nourriture + ach.nourriture - sB.nourriture + sA.boissons + ach.boissons - sB.boissons;
    const ca = CA_MENSUEL[caMoisDe(b.date)] || {};
    const caTot = (ca.nourriture || 0) + (ca.boissons || 0);
    pts.push({ label: new Date(b.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), stock: sB.nourriture + sB.boissons, conso, ratio: caTot > 0 ? conso / caTot * 100 : null });
  }
  box.innerHTML = `<div class="conso-title">📈 Évolution (${pts.length} période${pts.length > 1 ? 's' : ''})</div>
    <canvas id="evo-canvas" height="220" style="width:100%;display:block"></canvas>
    <div class="conso-legend"><span><i style="background:#2E6DAF"></i>Valeur du stock</span><span><i style="background:#BA7517"></i>Consommation</span><span>• Ratio matière (si CA saisi)</span></div>`;
  requestAnimationFrame(() => {
    const cv = document.getElementById('evo-canvas'); if (!cv) return;
    const W = cv.parentElement.clientWidth || 320, H = 220, dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    const pad = { l: 48, r: 10, t: 18, b: 34 }, pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    const max = Math.max(1, ...pts.map(p => Math.max(p.stock, p.conso)));
    const dark = window.matchMedia('(prefers-color-scheme:dark)').matches;
    ctx.font = '10px Arial'; ctx.fillStyle = dark ? '#aaa' : '#666'; ctx.strokeStyle = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)';
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ph * (1 - i / 4); ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(Math.round(max * i / 4).toLocaleString('fr-FR') + ' €', pad.l - 4, y + 3);
    }
    const gw = pw / pts.length, bw = Math.min(26, gw / 3);
    pts.forEach((p, i) => {
      const x = pad.l + gw * i + gw / 2;
      const hS = ph * p.stock / max, hC = ph * Math.max(0, p.conso) / max;
      ctx.fillStyle = '#2E6DAF'; ctx.fillRect(x - bw - 1, pad.t + ph - hS, bw, hS);
      ctx.fillStyle = '#BA7517'; ctx.fillRect(x + 1, pad.t + ph - hC, bw, hC);
      ctx.fillStyle = dark ? '#ccc' : '#444'; ctx.textAlign = 'center'; ctx.fillText(p.label, x, H - 18);
      if (p.ratio != null) { ctx.font = 'bold 10px Arial'; ctx.fillText(Math.round(p.ratio) + ' %', x, H - 5); ctx.font = '10px Arial'; }
    });
  });
}

// ── 8. Factures scannées → mise à jour des prix ─────────────────────
// Réutilise l'écran de la mercuriale : rapprochement avec le catalogue,
// cases à cocher, validation, enregistrement et historique des prix.
function invoiceArticlesToPrix() {
  const arts = (window.CaApp && CaApp.scan && CaApp.scan.articles) || [];
  if (!arts.length) return;
  openMercuriale();
  const fourn = (CaApp.scan.common && CaApp.scan.common.fournisseur) || '';
  _mercMatches = mercMatch(arts.map(a => ({ designation: a.designation, reference: a.reference || '', prix_ht: a.prix_ht, unite: a.unite || '', conditionnement: fourn ? 'Facture ' + fourn : '' })));
  const n = _mercMatches.filter(m => m.dataProduct).length;
  const st = document.getElementById('merc-status');
  st.className = 'merc-status ok';
  st.textContent = '🧾 ' + arts.length + ' articles lus sur la facture — ' + n + ' correspondances dans l\'inventaire. Vérifiez puis appliquez.';
  mercRenderResults();
}