// ════════════════════════════════════════════════════════════════════
// ACHATS+ (18/10/2026 — 4e série). Chargé après js/app.js et js/inventaire-plus.js.
//  1. Ventilation article par article + règles apprises (plan du cabinet)
//  2. Liens article de facture → produit de l'inventaire, alerte unité, hausses
//  3. Pilotage du ratio : estimation mi-mois, objectifs, période précédente
//  4. Export comptable (factures par compte, journal d'achats, totaux)
//  5. Comparateur de prix entre fournisseurs
//  6. Réclamations et avoirs
//  7. Doublons du catalogue (fusion validée une par une)
// ════════════════════════════════════════════════════════════════════

const AP_KEYS = { ca_regles: 'ca_regles', ca_liens: 'ca_liens', ca_articles: 'ca_articles', ca_reclamations: 'ca_reclamations', ca_objectifs: 'ca_objectifs', doublons_ignores: 'haccp_doublons_ignores_v1', ca_clotures: 'ca_clotures' };
// Règles relevées sur les factures annotées par le cabinet (octobre 2026)
const AP_REGLES_DEFAUT = [
  ['sac poubelle', '602220'], ['bobine devidage', '602220'], ['bobine', '602220'],
  ['degraissant', '602290'], ['tork', '602290'], ['nettoyant', '602290'], ['desinfectant', '602290'], ['liquide vaisselle', '602290'],
  ['lavette', '602200'], ['eponge', '602200'],
  ['lunch box', '602230'], ['gobelet', '602230'], ['paille', '602230'], ['plateau', '602230'], ['assiette', '602230'], ['verrine', '602230'],
  ['godet', '602230'], ['film', '602230'], ['barquette', '602230'], ['bol', '602230'], ['sac kraft', '602230'], ['bougie', '602230'],
  ['embout douille', '602230'], ['poche patiss', '602230'], ['serviette', '602230'], ['couvert', '602230'], ['gant', '602230'],
  ['eau plate', '607000'], ['eau minerale', '607000'], ['eau gazeuse', '607000'], ['jus d orange', '607000'], ['jus de pomme', '607000'],
  ['soda', '607000'], ['coca', '607000'], ['limonade', '607000'], ['biere', '607000'], ['vin', '607000'],
  ['fa', '601000'], ['se', '601000'], ['frais de livraison', '601000'], ['port', '601000']
].map(([m, c], i) => ({ id: 'r' + i, motcle: m, code: c }));

let CA_REGLES = [], CA_LIENS = {}, CA_ARTICLES = [], CA_RECLAM = [], CA_OBJECTIFS = {}, DOUBLONS_IGNORES = [], CA_CLOTURES = { parametres: {}, mois: {} };
function apLoad() {
  const g = (k, d) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch (e) { return d; } };
  CA_REGLES = g(AP_KEYS.ca_regles, null) || AP_REGLES_DEFAUT.slice();
  CA_LIENS = g(AP_KEYS.ca_liens, {}) || {};
  CA_ARTICLES = g(AP_KEYS.ca_articles, []) || [];
  CA_RECLAM = g(AP_KEYS.ca_reclamations, []) || [];
  CA_OBJECTIFS = g(AP_KEYS.ca_objectifs, {}) || {};
  DOUBLONS_IGNORES = g(AP_KEYS.doublons_ignores, []) || [];
  CA_CLOTURES = g(AP_KEYS.ca_clotures, null) || {};
  if (!CA_CLOTURES.parametres) CA_CLOTURES.parametres = {};
  if (!CA_CLOTURES.mois) CA_CLOTURES.mois = {};
  if (Array.isArray(CA_LIENS)) CA_LIENS = {};
  if (!Array.isArray(CA_OBJECTIFS) && typeof CA_OBJECTIFS !== 'object') CA_OBJECTIFS = {};
}
apLoad();
function apSave(id) {
  const data = { ca_regles: CA_REGLES, ca_liens: CA_LIENS, ca_articles: CA_ARTICLES, ca_reclamations: CA_RECLAM, ca_objectifs: CA_OBJECTIFS, doublons_ignores: DOUBLONS_IGNORES, ca_clotures: CA_CLOTURES }[id];
  saveModule(AP_KEYS[id], id, data);
}
// Données reçues d'un autre appareil
function apReload(id) {
  apLoad();
  const ca = document.getElementById('panel-factures-ca');
  if (ca && ca.classList.contains('active') && window.CaApp && CaApp._initialized && ['dashboard', 'regles', 'prix', 'reclam', 'cloture', 'annee'].includes(CaApp.tab) && !CaApp.editingInvoiceId) CaApp.render();
  if (id === 'ca_objectifs' && document.getElementById('panel-historique')?.classList.contains('active')) renderConsommation();
  if (id === 'doublons_ignores' && document.getElementById('qualite-overlay')?.classList.contains('open') && _qcTab === 'doublons') qcRender();
}
const apEur = v => (Number(v) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const apR2 = v => Math.round(v * 100) / 100;
function apCodeLib(code) { const c = (window.CaApp && CaApp.codes || []).find(x => x.code === code); return c ? c.libelle : ''; }
function apCodeOptions(sel) { return (CaApp.codes || []).filter(c => c.code !== '635200').map(c => `<option value="${esc(c.code)}"${c.code === sel ? ' selected' : ''}>${esc(c.code)} — ${esc(c.libelle)}</option>`).join(''); }

// ── 1. Ventilation article par article ──────────────────────────────
function apRegle(designation) {
  const n = mercNorm(designation), pad = ' ' + n + ' ';
  let best = null;
  CA_REGLES.forEach(r => {
    const m = mercNorm(r.motcle); if (!m) return;
    // Mots-clés très courts (« fa », « se » = frais) : désignation exacte seulement
    const ok = m.length <= 2 ? n === m : (n === m || pad.includes(' ' + m + ' ') || (m.length >= 5 && n.includes(m)));
    if (ok && (!best || m.length > mercNorm(best.motcle).length)) best = r;
  });
  return best;
}
// Renvoie [{code, ht}] si les articles retombent sur le total HT (±5 cts), sinon null
function apVentiler(articles, totalHT) {
  const arts = (articles || []).filter(a => Number.isFinite(a.montant_ht));
  if (!arts.length || arts.length < (articles || []).length) return null;
  const somme = arts.reduce((s, a) => s + a.montant_ht, 0);
  if (totalHT != null && Math.abs(somme - totalHT) > 0.05) return null;
  const map = {};
  arts.forEach(a => {
    if (!a.codeIA) a.codeIA = a.code;
    const r = apRegle(a.designation);
    if (r && !a.codeManuel) { a.code = r.code; a.regle = r.motcle; }
    map[a.code] = (map[a.code] || 0) + a.montant_ht;
  });
  return Object.entries(map).filter(([, ht]) => Math.abs(ht) >= 0.005).map(([code, ht]) => ({ code, ht: apR2(ht) }));
}
function apArticlesHtml(s) {
  const arts = s.allArticles || [];
  if (!arts.length) return '';
  return `<details class="ap-details"><summary>🧾 ${arts.length} articles lus — ventilation article par article (changer un compte l'apprend pour les prochaines factures)</summary>
    <table class="ap-table"><tr><th>Article</th><th class="num">Montant HT</th><th>Compte</th></tr>` +
    arts.map((a, i) => `<tr><td>${esc(a.designation)}${a.regle ? `<br><small class="muted">règle « ${esc(a.regle)} »</small>` : ''}</td>
      <td class="num">${Number.isFinite(a.montant_ht) ? apEur(a.montant_ht) : '—'}</td>
      <td><select onchange="apArticleCode(${i}, this.value)">${apCodeOptions(a.code)}</select></td></tr>`).join('') + '</table></details>';
}
function apMotCle(designation) {
  return mercNorm(designation).split(' ').filter(w => w.length > 1 && !/^\d/.test(w)).slice(0, 3).join(' ');
}
function apArticleCode(i, code) {
  CaApp.syncScanLinesFromDom();
  const s = CaApp.scan, a = (s.allArticles || [])[i]; if (!a) return;
  a.code = code; a.codeManuel = true; a.regle = '';
  // Règle apprise (modifiable dans l'onglet « Règles de ventilation »)
  const m = apMotCle(a.designation);
  if (m) {
    const ex = CA_REGLES.find(r => mercNorm(r.motcle) === m);
    if (ex) ex.code = code; else CA_REGLES.push({ id: uid(), motcle: m, code });
    apSave('ca_regles');
    CaApp.toast(`Règle retenue : « ${m} » → ${code}`);
  }
  // Ventilation recalculée, ligne TVA conservée
  const map = {};
  s.allArticles.forEach(x => { if (Number.isFinite(x.montant_ht)) map[x.code] = (map[x.code] || 0) + x.montant_ht; });
  const tva = s.lines.filter(l => l.code === '635200');
  s.lines = Object.entries(map).map(([c, ht]) => ({ id: uid(), code: c, ht: apR2(ht), taux: 0 })).concat(tva);
  CaApp.render();
}
function apRenderRegles() {
  const regles = CA_REGLES.slice().sort((a, b) => a.code.localeCompare(b.code) || a.motcle.localeCompare(b.motcle, 'fr'));
  return `<div class="card" style="margin-bottom:14px;font-size:13px;line-height:1.5">Quand une facture est scannée, chaque article est classé sur le compte de la règle dont le mot-clé apparaît dans sa désignation (le mot-clé le plus long l'emporte), sinon sur le compte proposé par l'IA. Changer le compte d'un article pendant la vérification crée ou met à jour une règle.</div>
    <div class="row" style="align-items:flex-start;">
    <div class="card" style="flex:1 1 460px;padding:0;overflow:hidden;"><table>
      <thead><tr><th>Mot-clé dans la désignation</th><th>Compte</th><th></th></tr></thead><tbody>` +
    regles.map(r => `<tr><td><input value="${esc(r.motcle)}" onchange="apRegleMaj(${jsArg(r.id)},'motcle',this.value)"></td>
      <td><select onchange="apRegleMaj(${jsArg(r.id)},'code',this.value)">${apCodeOptions(r.code)}</select></td>
      <td style="text-align:right"><button class="btn-icon" onclick="apRegleSuppr(${jsArg(r.id)})">🗑</button></td></tr>`).join('') +
    `</tbody></table></div>
    <div class="card" style="flex:1 1 280px;"><div style="font-size:13px;font-weight:600;margin-bottom:12px;">Ajouter une règle</div>
      <div style="display:flex;flex-direction:column;gap:10px;"><input id="ap-regle-mot" placeholder="Mot-clé (ex : sac poubelle)">
      <select id="ap-regle-code">${apCodeOptions('602230')}</select>
      <button class="btn btn-primary" onclick="apRegleAjout()">+ Ajouter</button>
      <div style="font-size:12.5px;color:#8a8478;margin-top:6px">Tester une désignation :</div>
      <input placeholder="ex : SAC POUBELLE NOIR 50L" oninput="const r=apRegle(this.value);document.getElementById('ap-regle-test').textContent=r?('→ '+r.code+' (règle « '+r.motcle+' »)'):'→ compte proposé par l\\'IA'">
      <div id="ap-regle-test" style="font-size:12.5px;font-weight:600"></div></div></div></div>`;
}
function apRegleMaj(id, f, v) { const r = CA_REGLES.find(x => x.id === id); if (!r) return; r[f] = f === 'motcle' ? v.trim().toLowerCase() : v; apSave('ca_regles'); }
function apRegleSuppr(id) { CA_REGLES = CA_REGLES.filter(x => x.id !== id); apSave('ca_regles'); CaApp.render(); }
function apRegleAjout() {
  const m = document.getElementById('ap-regle-mot').value.trim().toLowerCase(), c = document.getElementById('ap-regle-code').value;
  if (!m) return CaApp.toast('Mot-clé requis.', 'error');
  const ex = CA_REGLES.find(r => mercNorm(r.motcle) === mercNorm(m));
  if (ex) ex.code = c; else CA_REGLES.push({ id: uid(), motcle: m, code: c });
  apSave('ca_regles'); CaApp.toast('Règle enregistrée.'); CaApp.render();
}

// Après l'enregistrement d'une facture : articles mémorisés, réclamation soldée par un avoir
function apApresEnregistrement(f) {
  const arts = (f.articles || []).filter(a => a.designation);
  arts.forEach(a => CA_ARTICLES.push({ id: uid(), factureId: f.factureId, date: f.date, fournisseur: f.fournisseur, designation: a.designation, reference: a.reference || '',
    quantite: Number.isFinite(a.quantite) ? a.quantite : null, unite: a.unite || '', prix: Number.isFinite(a.prix_ht) ? a.prix_ht : null,
    montant: Number.isFinite(a.montant_ht) ? a.montant_ht : null, compte: a.code || '', produit: CA_LIENS[mercNorm(a.designation)] || '' }));
  if (arts.length) { if (CA_ARTICLES.length > 4000) CA_ARTICLES = CA_ARTICLES.slice(-4000); apSave('ca_articles'); }
  if (f.file) apUploadFacture(f.factureId, f.date, f.file);
  if (f.avoirDe) {
    const r = CA_RECLAM.find(x => x.statut === 'ouverte' && apFourn(x.fournisseur) === apFourn(f.fournisseur) && String(x.facture).trim() === String(f.avoirDe).trim());
    if (r) { r.statut = 'résolue'; r.avoirFactureId = f.factureId; r.resoluLe = localISODate(); apSave('ca_reclamations'); setTimeout(() => CaApp.toast('Réclamation soldée par cet avoir.'), 2700); }
  }
}

// ── 2. Liens article → produit, unités, hausses ─────────────────────
function apUnite(u) {
  const x = String(u || '').toUpperCase().replace(/[.\s]/g, '');
  const m = { KGS: 'KG', KILO: 'KG', K: 'KG', LT: 'L', LITRE: 'L', LITRES: 'L', PC: 'PCE', PCS: 'PCE', PU: 'PCE', PIECE: 'PCE', 'PIÈCE': 'PCE', UN: 'PCE', U: 'PCE', UNITE: 'PCE', BTE: 'BT', BOITE: 'BT', 'BOÎTE': 'BT', SACHET: 'ST', SAC: 'ST', COLIS: 'CT', CARTON: 'CT', CTN: 'CT', SEAU: 'SE', BID: 'L' };
  return m[x] || x;
}
function apUniteDiff(a, b) { const x = apUnite(a), y = apUnite(b); return !!(x && y && x !== y); }
const _apMercMatch0 = mercMatch;
mercMatch = function (lines) {
  const res = _apMercMatch0(lines);
  res.forEach(m => {
    const code = CA_LIENS[mercNorm(m.mercLine.designation)];
    const d = code && DATA.find(x => x.code === code);
    if (d) { m.dataProduct = d; m.score = 1; m.lien = true; m.checked = true; }
    m.uniteDiff = !!(m.dataProduct && apUniteDiff(m.mercLine.unite, m.dataProduct.unite));
    if (m.uniteDiff && !m.lien) m.checked = false;
  });
  return res;
};
const _apMercRender0 = mercRenderResults;
mercRenderResults = function () {
  _apMercRender0();
  if (!document.getElementById('ap-prod-list')) {
    const dl = document.createElement('datalist'); dl.id = 'ap-prod-list'; document.body.appendChild(dl);
  }
  document.getElementById('ap-prod-list').innerHTML = DATA.map(d => `<option value="${esc(d.code)} — ${esc(d.produit)}">`).join('');
  document.querySelectorAll('#merc-tbody tr').forEach((tr, i) => {
    const m = _mercMatches[i]; if (!m) return;
    const td = tr.children[2];
    if (td) td.insertAdjacentHTML('beforeend', `<input class="ap-assoc" list="ap-prod-list" placeholder="${m.dataProduct ? 'Changer…' : 'Associer à un produit…'}" onchange="apAssocier(${i}, this.value)">${m.lien ? '<br><small class="muted">🔗 lien mémorisé</small>' : ''}`);
    if (m.uniteDiff && tr.children[5]) tr.children[5].insertAdjacentHTML('beforeend', `<br><small class="ap-warn">⚠ unité ${esc(m.mercLine.unite)} ≠ ${esc(m.dataProduct.unite)} : vérifier avant d'appliquer</small>`);
  });
};
function apAssocier(i, val) {
  const code = String(val || '').split(' — ')[0].trim();
  const d = DATA.find(x => x.code === code); const m = _mercMatches[i];
  if (!d || !m) return;
  m.dataProduct = d; m.lien = true; m.score = 1;
  m.uniteDiff = apUniteDiff(m.mercLine.unite, d.unite); m.checked = !m.uniteDiff;
  CA_LIENS[mercNorm(m.mercLine.designation)] = d.code; apSave('ca_liens');
  mercRenderResults();
}
const _apOpenMerc0 = openMercuriale;
openMercuriale = function () { window._apFactureCtx = null; _apOpenMerc0(); };
const _apInvToPrix0 = invoiceArticlesToPrix;
invoiceArticlesToPrix = function () {
  const c = CaApp.scan && CaApp.scan.common;
  _apInvToPrix0();
  window._apFactureCtx = c ? { fournisseur: c.fournisseur, date: c.date } : null;
};
const _apMercApply0 = mercApplySelected;
mercApplySelected = function () {
  const toApply = _mercMatches.filter(m => m.checked && m.dataProduct).map(m => ({ m, ancien: m.dataProduct.prix }));
  _apMercApply0();
  if (document.getElementById('merc-results').classList.contains('show')) return; // annulé
  const ctx = window._apFactureCtx, today = localISODate();
  const hausses = [];
  toApply.forEach(({ m, ancien }) => {
    const code = m.dataProduct.code, k = mercNorm(m.mercLine.designation);
    CA_LIENS[k] = code;
    CA_ARTICLES.forEach(a => { if (!a.produit && mercNorm(a.designation) === k) a.produit = code; });
    // Fournisseur et date de la facture (lot : propres à chaque ligne)
    const four = m.mercLine.four || (ctx && ctx.fournisseur), dt = m.mercLine.dateFacture || (ctx && ctx.date);
    if (four) {
      const h = (PRIX_HISTO_DATA[code] || []); const e = h[h.length - 1];
      if (e && e.date === today && e.note === 'Mercuriale') { e.fournisseur = four; e.date = dt || e.date; e.note = 'Facture ' + four; h.sort((a, b) => String(a.date).localeCompare(String(b.date))); }
    }
    if (ancien > 0 && m.mercLine.prix_ht > ancien * 1.10) hausses.push(`${m.dataProduct.produit} +${Math.round((m.mercLine.prix_ht / ancien - 1) * 100)} %`);
  });
  apSave('ca_liens'); apSave('ca_articles'); saveNewModules();
  if (hausses.length) setTimeout(() => alert('📈 Hausses de plus de 10 % :\n\n' + hausses.join('\n')), 300);
};

// ── 3. Pilotage du ratio ────────────────────────────────────────────
const _apRenderConso0 = renderConsommation;
renderConsommation = function () {
  _apRenderConso0();
  const box = document.getElementById('conso-card'); if (!box || !HISTO_DATA.length) return;
  const snaps = [...HISTO_DATA].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const debId = box.querySelector('#conso-debut')?.value, finId = box.querySelector('#conso-fin')?.value || 'actuel';
  const iDeb = Math.max(0, snaps.findIndex(s => String(s.id) === debId));
  const debut = snaps[iDeb] || snaps[snaps.length - 1];
  const ratioEntre = (a, bItems, bDate) => {
    const sA = _stockSplit(a.items), sB = _stockSplit(bItems), ach = _achatsEntre(a.date, bDate);
    const ca = CA_MENSUEL[caMoisDe(bDate)] || {};
    const r = k => ca[k] > 0 ? (sA[k] + ach[k] - sB[k]) / ca[k] * 100 : null;
    return { nourriture: r('nourriture'), boissons: r('boissons') };
  };
  const rows = [];
  let estim = null, nbTop = 0, nbTopFaits = 0;
  if (finId === 'actuel') {
    // Produits pas encore recomptés : quantité de l'inventaire de début
    const q0 = c => { const it = (debut.items || []).find(i => i.code === c); return it && it.qte != null ? Number(it.qte) : null; };
    const items = DATA.map(d => Object.assign({}, d, { qte: d.qte != null ? d.qte : q0(d.code) }));
    estim = ratioEntre(debut, items, new Date().toISOString());
    const top = DATA.map(d => ({ d, v: (q0(d.code) || 0) * (d.prix || 0) })).filter(x => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 30);
    nbTop = top.length; nbTopFaits = top.filter(x => x.d.qte != null).length;
  }
  const prec = iDeb > 0 ? ratioEntre(snaps[iDeb - 1], debut.items, debut.date) : null;
  const obj = { nourriture: Number(CA_OBJECTIFS.nourriture) || null, boissons: Number(CA_OBJECTIFS.boissons) || null };
  const cell = (v, k) => {
    if (v == null) return '<td class="num">—</td>';
    const o = obj[k]; let cls = '';
    if (o) cls = v <= o ? 'ap-vert' : v <= o * 1.1 ? 'ap-orange' : 'ap-rouge';
    return `<td class="num ${cls}">${Math.round(v * 10) / 10} %</td>`;
  };
  if (estim) rows.push(`<tr><td>Estimation en cours de mois<br><small class="muted">produits non recomptés = quantité de début · ${nbTopFaits}/${nbTop} des 30 plus chers recomptés</small></td>${cell(estim.nourriture, 'nourriture')}${cell(estim.boissons, 'boissons')}</tr>`);
  if (prec) rows.push(`<tr><td>Période précédente<br><small class="muted">« ${esc(snaps[iDeb - 1].label)} » → « ${esc(debut.label)} »</small></td>${cell(prec.nourriture, 'nourriture')}${cell(prec.boissons, 'boissons')}</tr>`);
  box.insertAdjacentHTML('beforeend', `<div class="conso-sub">🎯 Pilotage</div>
    <table class="conso-table"><tr><th></th><th class="num">🍴 Nourriture</th><th class="num">🥤 Boissons</th></tr>${rows.join('')}
    <tr><td>Objectif de ratio (%)</td>
      <td class="num"><input type="number" inputmode="decimal" min="0" max="100" step="0.5" value="${obj.nourriture || ''}" placeholder="ex : 30" onchange="apObjectif('nourriture',this.value)"></td>
      <td class="num"><input type="number" inputmode="decimal" min="0" max="100" step="0.5" value="${obj.boissons || ''}" placeholder="ex : 25" onchange="apObjectif('boissons',this.value)"></td></tr></table>
    <div class="conso-foot">Vert = sous l'objectif · orange = jusqu'à 10 % au-dessus · rouge = au-delà. En cours de mois, saisissez le CA HT <b>à date</b> ci-dessus et recomptez les produits qui pèsent le plus :
      <button class="dlc-btn-sm" onclick="openQuickInv('TOP30')">⭐ Compter les 30 produits les plus chers</button></div>`);
  // Couleurs sur la ligne « Ratio matière » d'origine
  const ratioRow = [...box.querySelectorAll('.conso-table tr.conso-total')].find(tr => /Ratio matière/.test(tr.textContent));
  if (ratioRow) ['nourriture', 'boissons'].forEach((k, j) => {
    const td = ratioRow.children[j + 1], v = parseFloat(String(td.textContent).replace(',', '.'));
    if (obj[k] && !isNaN(v)) td.classList.add(v <= obj[k] ? 'ap-vert' : v <= obj[k] * 1.1 ? 'ap-orange' : 'ap-rouge');
  });
};
function apObjectif(k, v) { const n = parseFloat(String(v).replace(',', '.')); CA_OBJECTIFS[k] = isNaN(n) ? null : n; apSave('ca_objectifs'); renderConsommation(); }

// ── 4. Export comptable ─────────────────────────────────────────────
function apFactures(list) {
  const g = {};
  list.forEach(i => { const k = i.factureId || i.id; (g[k] = g[k] || { id: k, date: i.date, fournisseur: i.fournisseur, bl: i.bl || '', avoirDe: i.avoirDe || '', ttcFacture: i.ttcFacture, lignes: [] }).lignes.push(i); });
  return Object.values(g).map(f => Object.assign(f, { ttc: apR2(f.lignes.reduce((s, l) => s + computeLine(l).ttc, 0)) }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.fournisseur.localeCompare(b.fournisseur));
}
function apExportComptable() {
  const r = apExportWorkbook(CaApp.selectedMonth || '');
  if (!r) return CaApp.toast('Aucune facture sur cette période.', 'error');
  XLSX.writeFile(r.wb, r.name);
  CaApp.toast('Export comptable généré.');
}
function apExportWorkbook(mois) {
  const list = CaApp.invoices.filter(i => !mois || monthKey(i.date) === mois);
  if (!list.length) return null;
  const titre = 'La Salle à Manger · Grenoble — Achats ' + (mois ? monthLabel(mois) : '(toutes périodes)');
  const facts = apFactures(list);
  const ordre = CaApp.codes.map(c => c.code);
  const codes = [...new Set(list.map(i => i.code))].sort((a, b) => (ordre.indexOf(a) + 1 || 999) - (ordre.indexOf(b) + 1 || 999));
  // Feuille 1 : une ligne par facture, une colonne par compte
  const a1 = [[titre], [], ['Date', 'Fournisseur', 'N° facture', 'Avoir sur', ...codes, 'Total TTC']];
  facts.forEach(f => a1.push([f.date.split('-').reverse().join('/'), f.fournisseur, f.bl, f.avoirDe,
    ...codes.map(c => { const v = f.lignes.filter(l => l.code === c).reduce((s, l) => s + computeLine(l).ht, 0); return v ? apR2(v) : ''; }), f.ttc]));
  a1.push(['TOTAL', '', facts.length + ' pièces', '', ...codes.map(c => apR2(list.filter(l => l.code === c).reduce((s, l) => s + computeLine(l).ht, 0))), apR2(facts.reduce((s, f) => s + f.ttc, 0))]);
  a1.push([], ['Libellés :', ...codes.map(c => c + ' = ' + apCodeLib(c))]);
  // Feuille 2 : journal d'achats (débit charges / crédit fournisseur)
  const a2 = [[titre + ' — journal AC'], [], ['Date', 'Journal', 'N° pièce', 'Compte', 'Libellé', 'Débit', 'Crédit']];
  let tD = 0, tC = 0;
  facts.forEach(f => {
    const d = f.date.split('-').reverse().join('/'), lib = `${f.fournisseur}${f.bl ? ' fact. ' + f.bl : ''}${f.avoirDe ? ' (avoir sur ' + f.avoirDe + ')' : ''}`;
    codes.forEach(c => {
      const v = apR2(f.lignes.filter(l => l.code === c).reduce((s, l) => s + computeLine(l).ht, 0)); if (!v) return;
      a2.push([d, 'AC', f.bl, c, lib, v > 0 ? v : '', v < 0 ? -v : '']); if (v > 0) tD += v; else tC -= v;
    });
    // TVA calculée (lignes à taux > 0, ancien mode de saisie)
    const tva = apR2(f.lignes.reduce((s, l) => s + computeLine(l).tva, 0));
    if (tva) { a2.push([d, 'AC', f.bl, '445660', lib + ' TVA', tva > 0 ? tva : '', tva < 0 ? -tva : '']); if (tva > 0) tD += tva; else tC -= tva; }
    a2.push([d, 'AC', f.bl, '401000', lib, f.ttc < 0 ? -f.ttc : '', f.ttc > 0 ? f.ttc : '']); if (f.ttc > 0) tC += f.ttc; else tD -= f.ttc;
  });
  a2.push(['', '', '', '', 'TOTAUX', apR2(tD), apR2(tC)]);
  // Feuille 3 : totaux par compte + contrôles
  const a3 = [[titre + ' — totaux'], [], ['Compte', 'Libellé', 'Total HT']];
  codes.forEach(c => a3.push([c, apCodeLib(c), apR2(list.filter(l => l.code === c).reduce((s, l) => s + computeLine(l).ht, 0))]));
  a3.push(['', 'TOTAL TTC', apR2(facts.reduce((s, f) => s + f.ttc, 0))], []);
  const ctrl = [];
  facts.forEach(f => {
    if (!f.bl) ctrl.push(`${f.date} ${f.fournisseur} : facture sans numéro`);
    if (Number.isFinite(f.ttcFacture) && Math.abs(f.ttcFacture - f.ttc) > 0.02) ctrl.push(`${f.date} ${f.fournisseur} ${f.bl} : ventilé ${f.ttc} ≠ TTC ${f.ttcFacture}`);
  });
  const vus = {}; facts.forEach(f => { if (!f.bl) return; const k = apFourn(f.fournisseur) + '|' + f.bl; if (vus[k]) ctrl.push(`${f.fournisseur} ${f.bl} : numéro enregistré deux fois`); vus[k] = 1; });
  a3.push(['Contrôles'], ...(ctrl.length ? ctrl.map(x => ['', x]) : [['', 'Aucune anomalie détectée']]));
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(a1); ws1['!cols'] = [{ wch: 11 }, { wch: 16 }, { wch: 14 }, { wch: 11 }, ...codes.map(() => ({ wch: 10 })), { wch: 11 }];
  const ws2 = XLSX.utils.aoa_to_sheet(a2); ws2['!cols'] = [{ wch: 11 }, { wch: 7 }, { wch: 14 }, { wch: 9 }, { wch: 44 }, { wch: 11 }, { wch: 11 }];
  const ws3 = XLSX.utils.aoa_to_sheet(a3); ws3['!cols'] = [{ wch: 9 }, { wch: 56 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Factures par compte');
  XLSX.utils.book_append_sheet(wb, ws2, 'Journal achats');
  XLSX.utils.book_append_sheet(wb, ws3, 'Totaux et controles');
  return { wb, name: `Achats_${mois || 'complet'}_cabinet.xlsx`, controles: ctrl, facts, codes, list };
}

// ── 5. Comparateur de prix entre fournisseurs ───────────────────────
function apFourn(s) { return String(s || '').trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/)[0] || ''; }
function apPrixParFournisseur() {
  const res = {}; // code → {FOURN: {prix, date, nom}}
  const add = (code, f, prix, date) => {
    if (!code || !f || !(prix > 0)) return;
    const k = apFourn(f), r = res[code] = res[code] || {};
    if (!r[k] || String(date) >= String(r[k].date)) r[k] = { prix: Number(prix), date: String(date || ''), nom: f };
  };
  Object.entries(PRIX_HISTO_DATA || {}).forEach(([code, h]) => (Array.isArray(h) ? h : []).forEach(e => add(code, e.fournisseur, e.prix, e.date)));
  CA_ARTICLES.forEach(a => add(a.produit, a.fournisseur, a.prix, a.date));
  return res;
}
function apRenderComparateur() {
  const pf = apPrixParFournisseur();
  const rows = Object.entries(pf).filter(([, r]) => Object.keys(r).length >= 2).map(([code, r]) => {
    const d = DATA.find(x => x.code === code) || (window.ARCHIVES || []).find(x => x.code === code) || { produit: code, unite: '' };
    const l = Object.values(r).sort((a, b) => a.prix - b.prix);
    return { code, d, l, ecart: l[l.length - 1].prix / l[0].prix - 1 };
  }).sort((a, b) => b.ecart - a.ecart);
  const nbProduits = Object.keys(pf).length;
  return `<div class="card" style="margin-bottom:14px;font-size:13px;line-height:1.5">Dernier prix payé chez chaque fournisseur, à partir de l'historique des prix et des articles des factures scannées (${nbProduits} produits avec au moins un prix). Seuls les produits achetés chez au moins deux fournisseurs apparaissent. Vérifiez le conditionnement : un prix au kilo et un prix à la boîte ne se comparent pas.</div>` +
    (rows.length ? `<div class="card" style="padding:0;overflow:auto"><table><thead><tr><th>Produit</th><th>Le moins cher</th><th>Autres fournisseurs</th><th class="num">Écart</th></tr></thead><tbody>` +
      rows.map(x => `<tr><td>${esc(x.d.produit)}<br><small class="muted">${esc(x.code)} · ${esc(x.d.unite || '')}</small></td>
        <td><b>${esc(x.l[0].nom)}</b> ${x.l[0].prix.toFixed(3)} €<br><small class="muted">${esc(x.l[0].date)}</small></td>
        <td>${x.l.slice(1).map(p => `${esc(p.nom)} ${p.prix.toFixed(3)} € <small class="muted">(${esc(p.date)})</small>`).join('<br>')}</td>
        <td class="num ${x.ecart > 0.1 ? 'ap-rouge' : ''}">+${Math.round(x.ecart * 100)} %</td></tr>`).join('') + '</tbody></table></div>'
      : '<div class="empty card">Pas encore de produit acheté chez deux fournisseurs différents. Le comparateur se remplit au fil des factures scannées (bouton « Comparer avec l\'inventaire » puis « Appliquer »).</div>');
}

// ── 6. Réclamations et avoirs ───────────────────────────────────────
function apAvoirs(fournisseur) {
  return apFactures(CaApp.invoices.filter(i => apFourn(i.fournisseur) === apFourn(fournisseur))).filter(f => f.ttc < 0 || f.avoirDe);
}
function apRenderReclamations() {
  const l = CA_RECLAM.slice().sort((a, b) => (a.statut === 'ouverte' ? 0 : 1) - (b.statut === 'ouverte' ? 0 : 1) || String(b.date).localeCompare(String(a.date)));
  const ouvertes = l.filter(r => r.statut === 'ouverte');
  return `<div class="row" style="align-items:flex-start;">
    <div class="card" style="flex:1 1 520px;padding:0;overflow:auto">
      <div class="group-head"><span>Réclamations (${ouvertes.length} ouverte${ouvertes.length > 1 ? 's' : ''} · ${apEur(ouvertes.reduce((s, r) => s + (Number(r.montant) || 0), 0))} attendus)</span></div>
      ${l.length ? `<table><thead><tr><th>Date</th><th>Fournisseur / facture</th><th>Objet</th><th class="num">Montant HT</th><th>Statut</th><th>Avoir reçu</th><th></th></tr></thead><tbody>` +
      l.map(r => { const av = apAvoirs(r.fournisseur); return `<tr class="${r.statut === 'ouverte' ? 'ap-ouverte' : ''}"><td>${esc(r.date)}</td><td>${esc(r.fournisseur)}<br><small class="muted">fact. ${esc(r.facture || '—')}</small></td><td>${esc(r.objet)}</td><td class="num">${r.montant ? apEur(r.montant) : '—'}</td>
        <td><select onchange="apReclamMaj(${jsArg(r.id)},'statut',this.value)">${['ouverte', 'résolue', 'abandonnée'].map(s => `<option${s === r.statut ? ' selected' : ''}>${s}</option>`).join('')}</select></td>
        <td><select onchange="apReclamMaj(${jsArg(r.id)},'avoirFactureId',this.value)"><option value="">—</option>${av.map(f => `<option value="${esc(f.id)}"${f.id === r.avoirFactureId ? ' selected' : ''}>${esc(f.bl || 'sans n°')} du ${esc(f.date)} (${apEur(f.ttc)})</option>`).join('')}</select></td>
        <td><button class="btn-icon" onclick="apReclamSuppr(${jsArg(r.id)})">🗑</button></td></tr>`; }).join('') + '</tbody></table>'
      : '<div class="empty">Aucune réclamation.</div>'}
    </div>
    <div class="card" style="flex:1 1 280px;"><div style="font-size:13px;font-weight:600;margin-bottom:12px;">Nouvelle réclamation</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <input type="date" id="ap-rec-date" value="${localISODate()}">
        <select id="ap-rec-four">${CaApp.suppliers.map(s => `<option>${esc(s.nom)}</option>`).join('')}</select>
        <input id="ap-rec-fact" placeholder="N° de facture concernée">
        <input id="ap-rec-objet" placeholder="Objet (produit manquant, prix erroné, casse…)">
        <input id="ap-rec-mt" type="number" step="0.01" placeholder="Montant attendu HT (€)">
        <button class="btn btn-primary" onclick="apReclamAjout()">+ Enregistrer</button>
        <div style="font-size:12px;color:#8a8478">Quand l'avoir arrive, saisissez-le avec « Avoir sur la facture n° » : la réclamation est soldée automatiquement.</div>
      </div></div></div>`;
}
function apReclamAjout() {
  const v = id => document.getElementById(id).value.trim();
  if (!v('ap-rec-objet')) return CaApp.toast('Objet requis.', 'error');
  CA_RECLAM.push({ id: uid(), date: v('ap-rec-date') || localISODate(), fournisseur: v('ap-rec-four'), facture: v('ap-rec-fact'), objet: v('ap-rec-objet'), montant: parseFloat(v('ap-rec-mt').replace(',', '.')) || null, statut: 'ouverte' });
  apSave('ca_reclamations'); CaApp.toast('Réclamation enregistrée.'); CaApp.render();
}
function apReclamMaj(id, f, v) {
  const r = CA_RECLAM.find(x => x.id === id); if (!r) return;
  r[f] = v; if (f === 'avoirFactureId' && v) { r.statut = 'résolue'; r.resoluLe = localISODate(); }
  apSave('ca_reclamations'); CaApp.render();
}
function apReclamSuppr(id) { if (!confirm('Supprimer cette réclamation ?')) return; CA_RECLAM = CA_RECLAM.filter(x => x.id !== id); apSave('ca_reclamations'); CaApp.render(); }
function apDashboardExtra() {
  const msgs = [];
  const rap = apRappelCloture();
  if (rap) msgs.push(`🔒 ${esc(rap.texte)} — <a href="#" onclick="_apCloMois=${jsArg(rap.mois)};CaApp.setTab('cloture');return false">continuer</a>`);
  const ouv = CA_RECLAM.filter(r => r.statut === 'ouverte');
  if (ouv.length) msgs.push(`📮 ${ouv.length} réclamation${ouv.length > 1 ? 's' : ''} ouverte${ouv.length > 1 ? 's' : ''} (${apEur(ouv.reduce((s, r) => s + (Number(r.montant) || 0), 0))} attendus) — <a href="#" onclick="CaApp.setTab('reclam');return false">voir</a>`);
  const facts = apFactures(CaApp.filteredInvoices());
  const sansNo = facts.filter(f => !f.bl).length;
  if (sansNo) msgs.push(`🔢 ${sansNo} facture${sansNo > 1 ? 's' : ''} sans numéro`);
  const vus = {}, dbl = [];
  facts.forEach(f => { if (!f.bl) return; const k = apFourn(f.fournisseur) + '|' + f.bl; if (vus[k]) dbl.push(f.fournisseur + ' ' + f.bl); vus[k] = 1; });
  if (dbl.length) msgs.push(`⚠️ Numéro enregistré deux fois : ${dbl.map(esc).join(', ')}`);
  return msgs.length ? `<div class="banner" style="margin-bottom:14px;line-height:1.6">${msgs.join('<br>')}</div>` : '';
}

// ── 7. Doublons du catalogue ────────────────────────────────────────
function apMots(s) { return mercNorm(s).split(' ').filter(w => w.length > 1); }
function apDoublons() {
  const ign = new Set(DOUBLONS_IGNORES);
  const prods = DATA.map(d => ({ d, w: new Set(apMots(d.produit)), n: mercNorm(d.produit) })).filter(p => p.w.size);
  const out = [];
  for (let i = 0; i < prods.length; i++) for (let j = i + 1; j < prods.length; j++) {
    const a = prods[i], b = prods[j];
    const key = [a.d.code, b.d.code].sort().join('|'); if (ign.has(key)) continue;
    let score = 0;
    if (a.n === b.n) score = 1;
    else {
      const inter = [...a.w].filter(x => b.w.has(x)).length, union = new Set([...a.w, ...b.w]).size;
      const jac = inter / union, petit = Math.min(a.w.size, b.w.size);
      if (jac >= 0.75) score = jac;
      else if (petit >= 2 && inter === petit) score = 0.7; // tous les mots du nom court sont dans le long
    }
    if (score) out.push({ a: a.d, b: b.d, score, key });
  }
  return out.sort((x, y) => y.score - x.score);
}
function apFiche(d) {
  return `<div class="ap-fiche"><b>${esc(d.produit)}</b><br><small>${esc(d.code)} · ${esc((ZONES[d.zone] || { label: d.zone }).label)} · ${esc(d.fournisseur || '—')}</small><br>
    ${d.prix ? d.prix.toFixed(3) + ' € / ' + esc(d.unite || '?') : 'sans prix'} · stock : ${d.qte != null ? esc(d.qte) + ' ' + esc(d.unite || '') : '—'}</div>`;
}
function apRenderDoublons(body) {
  const l = apDoublons();
  body.innerHTML = `<div class="conso-foot">Fiches qui se ressemblent fortement. Pour chaque paire, choisissez la fiche à garder : l'autre est archivée (restaurable), sa quantité est reportée si l'unité est la même, et son historique de prix est fusionné. « Pas un doublon » retire la paire de la liste.</div>` +
    (l.length ? l.slice(0, 80).map(p => `<div class="ap-paire"><div class="ap-paire-fiches">${apFiche(p.a)}${apFiche(p.b)}</div>
      <div class="qc-actions"><button class="dlc-btn-sm" onclick="apFusionner(${jsArg(p.a.code)},${jsArg(p.b.code)})">Garder la 1re</button>
      <button class="dlc-btn-sm" onclick="apFusionner(${jsArg(p.b.code)},${jsArg(p.a.code)})">Garder la 2e</button>
      <button class="dlc-btn-sm" onclick="apPasDoublon(${jsArg(p.key)})">Pas un doublon</button>
      <small class="muted">ressemblance ${Math.round(p.score * 100)} %</small></div></div>`).join('')
      : '<div class="quick-empty">✅ Aucun doublon probable.</div>');
}
function apPasDoublon(key) { if (!DOUBLONS_IGNORES.includes(key)) DOUBLONS_IGNORES.push(key); apSave('doublons_ignores'); qcRender(); }
async function apFusionner(keepCode, dropCode) {
  const k = DATA.find(d => d.code === keepCode), x = DATA.find(d => d.code === dropCode);
  if (!k || !x) return;
  const memeUnite = !apUniteDiff(k.unite, x.unite) && apUnite(k.unite) === apUnite(x.unite);
  const report = x.qte != null && Number(x.qte) > 0;
  let msg = `Garder « ${k.produit} » (${k.code}) et archiver « ${x.produit} » (${x.code}) ?`;
  if (report) msg += memeUnite ? `\n\nLa quantité comptée de la 2e fiche (${x.qte} ${x.unite || ''}) sera ajoutée à la 1re.` : `\n\n⚠ Unités différentes (${x.unite || '?'} / ${k.unite || '?'}) : la quantité ${x.qte} n'est PAS reportée — recomptez la fiche gardée.`;
  if (!confirm(msg)) return;
  x.archived = true;
  if (!(await pushProductToCloud(x))) { x.archived = false; return alert('Fusion impossible : connexion au serveur.'); }
  const i = DATA.indexOf(x); if (i >= 0) DATA.splice(i, 1);
  if (report && memeUnite) k.qte = Math.round(((Number(k.qte) || 0) + Number(x.qte)) * 1000) / 1000;
  x.qte = null; (window.ARCHIVES = window.ARCHIVES || []).push(x);
  if (PRIX_HISTO_DATA[x.code]) { PRIX_HISTO_DATA[k.code] = (PRIX_HISTO_DATA[k.code] || []).concat(PRIX_HISTO_DATA[x.code]).sort((a, b) => String(a.date).localeCompare(String(b.date))); delete PRIX_HISTO_DATA[x.code]; saveNewModules(); }
  let liens = false; Object.keys(CA_LIENS).forEach(c => { if (CA_LIENS[c] === x.code) { CA_LIENS[c] = k.code; liens = true; } });
  if (liens) apSave('ca_liens');
  autoSave();
  qcRender();
}

// ── 8. Fichiers des factures (espace privé Supabase « factures ») ───
const AP_BUCKET = 'factures';
const _apUploadsEnAttente = []; // {factureId, date, file} — réessayés toutes les minutes
async function apUploadFacture(factureId, date, file) {
  try {
    if (!(await ensureFreshToken(false))) throw new Error('non connecté');
    let blob = file, ext = 'pdf', type = file.type || 'application/pdf';
    if (type.startsWith('image/')) { blob = await CaApp.resizeImageFile(file, 2200); ext = 'jpg'; type = 'image/jpeg'; }
    else if (type !== 'application/pdf') throw new Error('format non pris en charge (PDF ou photo)');
    const path = String(date || localISODate()).slice(0, 7) + '/' + factureId + '.' + ext;
    const r = await fetch(SUPA_URL + '/storage/v1/object/' + AP_BUCKET + '/' + path, {
      method: 'POST', headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + window._supabaseAuthToken, 'Content-Type': type, 'x-upsert': 'true' }, body: blob });
    if (!r.ok) throw new Error('envoi refusé (' + r.status + ')');
    let n = 0; CaApp.invoices.forEach(i => { if ((i.factureId || i.id) === factureId) { i.fichier = path; n++; } });
    if (n) { CaApp.saveInvoices(); if (CaApp._initialized && ['registre', 'cloture'].includes(CaApp.tab) && !CaApp.editingInvoiceId) CaApp.render(); }
    return true;
  } catch (e) {
    console.warn('[FACTURES] fichier non envoyé :', e.message);
    if (!_apUploadsEnAttente.some(u => u.factureId === factureId)) _apUploadsEnAttente.push({ factureId, date, file });
    return false;
  }
}
setInterval(async () => {
  if (!_apUploadsEnAttente.length || !navigator.onLine) return;
  const l = _apUploadsEnAttente.splice(0);
  for (const u of l) await apUploadFacture(u.factureId, u.date, u.file);
}, 60000);
window.addEventListener('beforeunload', e => { if (_apUploadsEnAttente.length) { e.preventDefault(); e.returnValue = ''; } });
function apFichierHtml(inv) {
  const fid = inv.factureId || inv.id;
  return inv.fichier ? ` <a href="#" class="ap-pj" title="Voir la facture" onclick="apOuvrirFichier(${jsArg(inv.fichier)});return false">📎</a>`
    : ` <label class="ap-pj ap-pj-add" title="Joindre le PDF ou la photo de la facture">📎+<input type="file" accept="application/pdf,image/*" style="display:none" onchange="apJoindre(${jsArg(fid)},${jsArg(inv.date)},this)"></label>`;
}
async function apJoindre(fid, date, input) {
  const f = input.files && input.files[0]; input.value = ''; if (!f) return;
  CaApp.toast('Envoi du fichier…');
  const ok = await apUploadFacture(fid, date, f);
  CaApp.toast(ok ? 'Fichier joint à la facture.' : 'Fichier non envoyé (connexion ?) — nouvel essai automatique.', ok ? 'success' : 'error');
}
async function apFichierBlob(path) {
  await ensureFreshToken(false);
  const r = await fetch(SUPA_URL + '/storage/v1/object/authenticated/' + AP_BUCKET + '/' + path, { headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + (window._supabaseAuthToken || SUPA_KEY) } });
  if (!r.ok) throw new Error('fichier indisponible (' + r.status + ')');
  return r.blob();
}
async function apOuvrirFichier(path) {
  const w = window.open('', '_blank');
  try { const u = URL.createObjectURL(await apFichierBlob(path)); if (w) w.location = u; else location.href = u; }
  catch (e) { if (w) w.close(); alert('⚠️ ' + e.message + ' — connectez-vous pour voir les factures.'); }
}
// Lot : comparaison des prix de toutes les factures enregistrées
function apBatchPrix() {
  const b = CaApp.batch; if (!b) return;
  const lignes = [];
  b.items.filter(x => x.status === 'enregistrée' && x.scan && x.scan.common).forEach(x => (x.scan.articles || []).forEach(a => lignes.push({
    designation: a.designation, reference: a.reference || '', prix_ht: a.prix_ht, unite: a.unite || '',
    conditionnement: 'Facture ' + x.scan.common.fournisseur + ' du ' + String(x.scan.common.date).split('-').reverse().join('/'),
    four: x.scan.common.fournisseur, dateFacture: x.scan.common.date })));
  if (!lignes.length) return CaApp.toast('Aucun prix d\'article lu dans ce lot.', 'error');
  openMercuriale();
  _mercMatches = mercMatch(lignes);
  const st = document.getElementById('merc-status');
  st.className = 'merc-status ok';
  st.textContent = '🧾 ' + lignes.length + ' articles lus sur les factures du lot — ' + _mercMatches.filter(m => m.dataProduct).length + ' correspondances. Vérifiez puis appliquez.';
  mercRenderResults();
}

// ── 9. Clôture mensuelle ────────────────────────────────────────────
let _apCloMois = null;
const apMoisDecal = (m, n) => { const [y, mm] = m.split('-').map(Number); const d = new Date(y, mm - 1 + n, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
function apSnapDuMois(m) { return _snapsTries().filter(s => caMoisDe(s.date) === m).slice(-1)[0] || null; }
function apSnapAvant(m) { return _snapsTries().filter(s => caMoisDe(s.date) < m).slice(-1)[0] || null; }
function apRatioMois(m) {
  const fin = apSnapDuMois(m), deb = apSnapAvant(m);
  if (!fin || !deb) return null;
  const sA = _stockSplit(deb.items), sB = _stockSplit(fin.items), ach = _achatsEntre(deb.date, fin.date), ca = CA_MENSUEL[m] || {};
  const conso = { nourriture: sA.nourriture + ach.nourriture - sB.nourriture, boissons: sA.boissons + ach.boissons - sB.boissons };
  const r = k => ca[k] > 0 ? conso[k] / ca[k] * 100 : null;
  return { conso, ca, nourriture: r('nourriture'), boissons: r('boissons'), deb, fin };
}
function apEtapesCloture(m) {
  const c = CA_CLOTURES.mois[m] || {};
  const facts = apFactures(CaApp.invoices.filter(i => monthKey(i.date) === m));
  const exp = apExportWorkbook(m), ctrl = exp ? exp.controles : [];
  const sansFichier = facts.filter(f => !f.lignes.some(l => l.fichier)).length;
  const recl = CA_RECLAM.filter(x => x.statut === 'ouverte' && String(x.date).slice(0, 7) <= m);
  const snap = apSnapDuMois(m), ca = CA_MENSUEL[m] || {};
  return [
    { id: 'factures', bloquant: true, ok: !!c.facturesOk && facts.length > 0, titre: `Toutes les factures du mois sont saisies (${facts.length} enregistrées)` },
    { id: 'controles', bloquant: true, ok: facts.length > 0 && !ctrl.length, titre: 'Aucune anomalie (numéros manquants ou en double, écarts de TTC)', ctrl },
    { id: 'fichiers', bloquant: false, ok: facts.length > 0 && !sansFichier, titre: 'PDF ou photo joint à chaque facture', sansFichier },
    { id: 'reclam', bloquant: false, ok: !recl.length, titre: 'Réclamations traitées', recl },
    { id: 'inventaire', bloquant: true, ok: !!snap, titre: 'Inventaire de fin de mois archivé', snap },
    { id: 'ca', bloquant: true, ok: ca.nourriture > 0 && ca.boissons != null, titre: 'Chiffre d\'affaires HT du mois saisi', ca },
    { id: 'envoi', bloquant: true, ok: !!c.envoyeLe, titre: 'Achats envoyés au cabinet comptable', c },
    { id: 'sauvegarde', bloquant: false, ok: !!c.sauvegardeLe, titre: 'Copie de sauvegarde rangée sur votre ordinateur (OneDrive)', c }
  ];
}
function apRappelCloture() {
  const auj = localISODate(), jour = Number(auj.slice(8, 10)), cur = auj.slice(0, 7);
  const cands = [];
  if (jour <= 12) cands.push(apMoisDecal(cur, -1));
  if (jour >= 25) cands.push(cur);
  for (const m of cands) {
    if ((CA_CLOTURES.mois[m] || {}).clotureLe) continue;
    if (!CaApp.invoices.some(i => monthKey(i.date) === m) && m !== cur) continue;
    const e = apEtapesCloture(m), ok = e.filter(x => x.ok).length;
    return { mois: m, texte: `Clôture de ${monthLabel(m).toLowerCase()} : ${ok}/${e.length} étapes faites` };
  }
  return null;
}
// Rappel une fois par jour à l'ouverture
setTimeout(() => {
  try {
    if (!CaApp._initialized) CaApp.loadFromStorage();
    const r = apRappelCloture(); if (!r) return;
    const k = 'ap_rappel_cloture', auj = localISODate();
    if (localStorage.getItem(k) === auj) return;
    localStorage.setItem(k, auj);
    showSyncToast('🔒 ' + r.texte + ' (Factures › Clôture du mois)');
  } catch (e) { }
}, 20000);
function apRenderCloture() {
  const mois = [...new Set(CaApp.invoices.map(i => monthKey(i.date)).concat([localISODate().slice(0, 7), apMoisDecal(localISODate().slice(0, 7), -1)]))].sort().reverse();
  const r0 = apRappelCloture();
  const m = _apCloMois || (r0 && r0.mois) || CaApp.selectedMonth || mois[0];
  const c = CA_CLOTURES.mois[m] || {}, etapes = apEtapesCloture(m);
  const okB = etapes.filter(e => e.bloquant).every(e => e.ok), nOk = etapes.filter(e => e.ok).length;
  const det = e => {
    if (e.id === 'factures') return `<label style="display:flex;gap:8px;align-items:center;font-size:13px"><input type="checkbox" ${c.facturesOk ? 'checked' : ''} onchange="apCloSet(${jsArg(m)},'facturesOk',this.checked)"> Je confirme que toutes les factures et avoirs de ${esc(monthLabel(m).toLowerCase())} sont dans le cahier</label>`;
    if (e.id === 'controles') return e.ctrl.length ? '<ul class="ap-ul">' + e.ctrl.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : '';
    if (e.id === 'fichiers') return e.sansFichier ? `${e.sansFichier} facture(s) sans fichier : joignez-les depuis le <a href="#" onclick="CaApp.setMonth(${jsArg(m)});CaApp.setTab('registre');return false">Registre</a> (📎+). Non bloquant.` : '';
    if (e.id === 'reclam') return e.recl.length ? `${e.recl.length} réclamation(s) encore ouverte(s) — <a href="#" onclick="CaApp.setTab('reclam');return false">voir</a>. Non bloquant.` : '';
    if (e.id === 'inventaire') return e.snap ? `« ${esc(e.snap.label)} » du ${new Date(e.snap.date).toLocaleDateString('fr-FR')}` : `<button class="btn btn-ghost" onclick="apArchiverFinDeMois(${jsArg(m)})">📸 Archiver l'inventaire actuel comme fin de ${esc(monthLabel(m).toLowerCase())}</button>`;
    if (e.id === 'ca') return `<span style="display:inline-flex;gap:8px;flex-wrap:wrap;align-items:center">🍴 <input id="ap-ca-n" type="number" step="0.01" min="0" style="width:120px" value="${e.ca.nourriture ?? ''}" placeholder="CA nourriture"> 🥤 <input id="ap-ca-b" type="number" step="0.01" min="0" style="width:120px" value="${e.ca.boissons ?? ''}" placeholder="CA boissons"> <button class="btn btn-ghost" onclick="apCloCA(${jsArg(m)})">Enregistrer</button></span>`;
    if (e.id === 'envoi') return `<span style="display:inline-flex;gap:8px;flex-wrap:wrap;align-items:center">✉️ <input id="ap-cab-mail" type="email" style="width:240px" value="${esc(CA_CLOTURES.parametres.cabinetEmail || '')}" placeholder="adresse e-mail du cabinet" onchange="apCabinetMail(this.value)">
      <button class="btn ${e.ok ? 'btn-ghost' : 'btn-primary'}" onclick="apPreparerEnvoi(${jsArg(m)})">📦 Préparer l'envoi (ZIP + e-mail)</button></span>${e.c.envoyeLe ? `<div style="font-size:12px;color:#8a8478;margin-top:4px">Préparé le ${esc(e.c.envoyeLe.split('-').reverse().join('/'))} — ${e.c.nbFichiers || 0} fichier(s) de factures dans le ZIP</div>` : ''}`;
    if (e.id === 'sauvegarde') return `<button class="btn btn-ghost" onclick="apSauvegardeZip(${jsArg(m)})">🗂 Télécharger la sauvegarde complète (données + PDF des factures de l'année)</button>${e.c.sauvegardeLe ? `<div style="font-size:12px;color:#8a8478;margin-top:4px">Téléchargée le ${esc(e.c.sauvegardeLe.split('-').reverse().join('/'))} — rangez le fichier dans un dossier OneDrive.</div>` : '<div style="font-size:12px;color:#8a8478;margin-top:4px">Le serveur fait déjà une copie chaque nuit ; celle-ci est une copie de plus, chez vous, avec les PDF. Non bloquant.</div>'}`;
    return '';
  };
  let resultat = '';
  if (c.clotureLe) {
    const r = c.resultat || {};
    resultat = `<div class="banner ap-ok" style="margin-top:14px;line-height:1.6">🔒 <b>${esc(monthLabel(m))} clôturé le ${esc(c.clotureLe.split('-').reverse().join('/'))}</b><br>
      Achats HT : nourriture ${apEur(r.achatsN)} · boissons ${apEur(r.achatsB)} · autres ${apEur(r.achatsAutres)} · total TTC ${apEur(r.ttc)}<br>
      Ratio matière : nourriture <b>${r.ratioN != null ? Math.round(r.ratioN * 10) / 10 + ' %' : '—'}</b> · boissons <b>${r.ratioB != null ? Math.round(r.ratioB * 10) / 10 + ' %' : '—'}</b>
      <div style="margin-top:6px"><button class="btn btn-ghost" onclick="apRouvrir(${jsArg(m)})">Rouvrir le mois</button></div></div>`;
  } else {
    resultat = `<div style="margin-top:14px"><button class="btn btn-primary" ${okB ? '' : 'disabled'} onclick="apCloturer(${jsArg(m)})">🔒 Clôturer ${esc(monthLabel(m).toLowerCase())}</button>
      ${okB ? '' : '<span style="font-size:12.5px;color:#8a8478;margin-left:8px">Les étapes obligatoires (★) doivent être faites.</span>'}</div>`;
  }
  return `<div style="margin-bottom:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <span style="font-size:13px;color:#8a8478;font-weight:500;">Mois :</span>
      <select style="width:auto" onchange="_apCloMois=this.value;CaApp.render()">${mois.map(x => `<option value="${x}"${x === m ? ' selected' : ''}>${esc(monthLabel(x))}${(CA_CLOTURES.mois[x] || {}).clotureLe ? ' 🔒' : ''}</option>`).join('')}</select>
      <span style="font-size:13px;font-weight:600">${nOk}/${etapes.length} étapes faites</span></div>
    <div class="card" style="padding:0;overflow:hidden">` +
    etapes.map(e => `<div class="ap-etape${e.ok ? ' ok' : ''}"><div class="ap-etape-ic">${e.ok ? '✅' : e.bloquant ? '⬜' : '⚠️'}</div>
      <div style="flex:1"><div class="ap-etape-t">${esc(e.titre)}${e.bloquant ? ' <span title="obligatoire">★</span>' : ''}</div><div class="ap-etape-d">${det(e)}</div></div></div>`).join('') +
    `</div>${resultat}`;
}
function apCloSet(m, k, v) { CA_CLOTURES.mois[m] = Object.assign({}, CA_CLOTURES.mois[m], { [k]: v }); apSave('ca_clotures'); CaApp.render(); }
function apCabinetMail(v) { CA_CLOTURES.parametres.cabinetEmail = String(v || '').trim(); apSave('ca_clotures'); }
function apCloCA(m) {
  const n = parseFloat(String(document.getElementById('ap-ca-n').value).replace(',', '.')), b = parseFloat(String(document.getElementById('ap-ca-b').value).replace(',', '.'));
  CA_MENSUEL[m] = { nourriture: isNaN(n) ? null : n, boissons: isNaN(b) ? null : b };
  saveModule(CA_KEY, 'ca_mensuel', CA_MENSUEL); CaApp.toast('Chiffre d\'affaires enregistré.'); CaApp.render();
}
function apArchiverFinDeMois(m) {
  const lib = 'Inventaire ' + monthLabel(m).toLowerCase();
  if (!confirm(`Archiver l'inventaire actuel (quantités comptées aujourd'hui) sous le nom « ${lib} » ?\n\nVérifiez que le comptage de fin de mois est terminé.`)) return;
  // Inventaire fait au début du mois suivant : daté du dernier jour du mois clôturé (23 h)
  const [y, mm] = m.split('-').map(Number);
  const finMois = new Date(y, mm, 0, 23, 0, 0);
  const date = new Date() > finMois ? finMois : new Date();
  const snap = { id: Date.now(), label: lib, date: date.toISOString(), total: DATA.reduce((s, d) => s + (mont(d) || 0), 0), refs: DATA.length,
    items: DATA.map(d => ({ code: d.code, produit: d.produit, zone: d.zone, qte: d.qte ?? null, prix: d.prix })) };
  HISTO_DATA.unshift(snap);
  HISTO_DATA.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  if (HISTO_DATA.length > 36) HISTO_DATA = HISTO_DATA.slice(0, 36);
  saveAllData(); CaApp.toast('Inventaire archivé.'); CaApp.render();
}
function apLoadScript(src) {
  return new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('chargement impossible : ' + src)); document.head.appendChild(s); });
}
async function apPreparerEnvoi(m) {
  const mail = (document.getElementById('ap-cab-mail')?.value || CA_CLOTURES.parametres.cabinetEmail || '').trim();
  if (mail && mail !== CA_CLOTURES.parametres.cabinetEmail) apCabinetMail(mail);
  const exp = apExportWorkbook(m);
  if (!exp) return CaApp.toast('Aucune facture ce mois-ci.', 'error');
  CaApp.toast('Préparation du ZIP…');
  try {
    if (!window.JSZip) await apLoadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    const zip = new JSZip();
    zip.file(exp.name, XLSX.write(exp.wb, { bookType: 'xlsx', type: 'array' }));
    let nb = 0; const manquants = [];
    const propre = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9-]+/g, '_').replace(/^_|_$/g, '');
    for (const f of exp.facts) {
      const path = (f.lignes.find(l => l.fichier) || {}).fichier;
      if (!path) { manquants.push(`${f.date} ${f.fournisseur} ${f.bl}`); continue; }
      try { zip.file('Factures/' + [f.date, propre(f.fournisseur), propre(f.bl || f.id)].join('_') + '.' + path.split('.').pop(), await apFichierBlob(path)); nb++; }
      catch (e) { manquants.push(`${f.date} ${f.fournisseur} ${f.bl} (${e.message})`); }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const nomZip = `Achats_${m}_La_Salle_a_Manger_Grenoble.zip`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nomZip; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    const tot = c => apR2(exp.list.filter(l => l.code === c).reduce((s, l) => s + computeLine(l).ht, 0));
    const ttc = apR2(exp.facts.reduce((s, f) => s + f.ttc, 0));
    const corps = `Bonjour,\n\nVeuillez trouver ci-joint les achats de ${monthLabel(m).toLowerCase()} de La Salle à Manger · Grenoble : ${exp.facts.length} pièces, total TTC ${apEur(ttc)}.\n\nTotaux par compte :\n` +
      exp.codes.map(c => `${c} ${apCodeLib(c)} : ${apEur(tot(c))}`).join('\n') +
      `\n\nPièce jointe : ${nomZip} (export comptable + ${nb} facture(s) en PDF/photo).` + (manquants.length ? `\nFactures sans fichier joint : ${manquants.length}.` : '') + `\n\nCordialement`;
    CA_CLOTURES.mois[m] = Object.assign({}, CA_CLOTURES.mois[m], { envoyeLe: localISODate(), nbFichiers: nb });
    apSave('ca_clotures');
    location.href = 'mailto:' + encodeURIComponent(mail) + '?subject=' + encodeURIComponent(`Achats ${monthLabel(m)} — La Salle à Manger · Grenoble`) + '&body=' + encodeURIComponent(corps);
    setTimeout(() => alert(`📦 ${nomZip} est téléchargé (${nb} facture(s)${manquants.length ? ', ' + manquants.length + ' sans fichier' : ''}).\n\nDans le brouillon d'e-mail qui s'ouvre, joignez ce fichier depuis vos Téléchargements, puis envoyez.`), 600);
    CaApp.render();
  } catch (e) { CaApp.toast('Envoi non préparé : ' + e.message, 'error'); }
}
function apCloturer(m) {
  const list = CaApp.invoices.filter(i => monthKey(i.date) === m);
  const s = codes => apR2(list.filter(i => codes(i.code)).reduce((t, i) => t + computeLine(i).ht, 0));
  const r = apRatioMois(m);
  const resultat = {
    achatsN: s(c => CONSO_CODES.nourriture.includes(c)), achatsB: s(c => CONSO_CODES.boissons.includes(c)),
    achatsAutres: s(c => !CONSO_CODES.nourriture.includes(c) && !CONSO_CODES.boissons.includes(c) && c !== '635200'),
    ttc: apR2(list.reduce((t, i) => t + computeLine(i).ttc, 0)),
    ratioN: r ? r.nourriture : null, ratioB: r ? r.boissons : null
  };
  CA_CLOTURES.mois[m] = Object.assign({}, CA_CLOTURES.mois[m], { clotureLe: localISODate(), resultat });
  apSave('ca_clotures'); CaApp.toast(monthLabel(m) + ' clôturé.'); CaApp.render();
  // Copie du serveur à la clôture (après l'envoi des dernières modifications)
  setTimeout(async () => {
    try { await ensureFreshToken(false); const r = await supa('/rest/v1/rpc/haccp_backup_cloture', { method: 'POST', body: '{}' }); if (!r.ok) console.warn('[SAUVEGARDE] clôture', r.status); }
    catch (e) { console.warn('[SAUVEGARDE] clôture :', e.message); }
  }, 8000);
}
function apRouvrir(m) {
  if (!confirm('Rouvrir ' + monthLabel(m).toLowerCase() + ' ? Le résultat de la clôture sera recalculé à la prochaine clôture.')) return;
  const c = Object.assign({}, CA_CLOTURES.mois[m]); delete c.clotureLe; delete c.resultat;
  CA_CLOTURES.mois[m] = c; apSave('ca_clotures'); CaApp.render();
}

// ── 10. Bilan annuel ────────────────────────────────────────────────
let _apAnnee = null;
function apDonneesAnnee(y) {
  const grp = c => CONSO_CODES.nourriture.includes(c) ? 'n' : CONSO_CODES.boissons.includes(c) ? 'b' : c === '635200' ? 'tva' : 'autres';
  const mois = Array.from({ length: 12 }, (_, i) => y + '-' + String(i + 1).padStart(2, '0'));
  const rows = mois.map(m => {
    const list = CaApp.invoices.filter(i => monthKey(i.date) === m);
    const r = { m, n: 0, b: 0, autres: 0, tva: 0, ttc: 0, nb: new Set(list.map(i => i.factureId || i.id)).size };
    list.forEach(i => { const c = computeLine(i); r[grp(i.code)] += c.ht; r.tva += c.tva; r.ttc += c.ttc; });
    const ca = CA_MENSUEL[m] || {}; r.caN = ca.nourriture; r.caB = ca.boissons;
    const rat = apRatioMois(m); r.ratioN = rat ? rat.nourriture : null; r.ratioB = rat ? rat.boissons : null;
    r.consoN = rat && ca.nourriture > 0 ? rat.conso.nourriture : null; r.consoB = rat && ca.boissons > 0 ? rat.conso.boissons : null;
    r.clos = !!(CA_CLOTURES.mois[m] || {}).clotureLe;
    return r;
  });
  const sum = k => rows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  const tot = { n: sum('n'), b: sum('b'), autres: sum('autres'), tva: sum('tva'), ttc: sum('ttc'), nb: sum('nb') };
  const avecN = rows.filter(r => r.consoN != null), avecB = rows.filter(r => r.consoB != null);
  tot.ratioN = avecN.length ? avecN.reduce((s, r) => s + r.consoN, 0) / avecN.reduce((s, r) => s + r.caN, 0) * 100 : null;
  tot.ratioB = avecB.length ? avecB.reduce((s, r) => s + r.consoB, 0) / avecB.reduce((s, r) => s + r.caB, 0) * 100 : null;
  const four = {};
  CaApp.invoices.filter(i => i.date.startsWith(y) && i.code !== '635200').forEach(i => { four[i.fournisseur] = (four[i.fournisseur] || 0) + computeLine(i).ht; });
  const fournisseurs = Object.entries(four).map(([nom, ht]) => ({ nom, ht })).sort((a, b) => b.ht - a.ht);
  const hausses = [];
  Object.entries(PRIX_HISTO_DATA || {}).forEach(([code, h]) => {
    const l = (Array.isArray(h) ? h : []).filter(e => String(e.date).startsWith(y) && e.prix > 0).sort((a, b) => String(a.date).localeCompare(String(b.date)));
    if (l.length < 2) return;
    const d = DATA.find(x => x.code === code) || { produit: code, unite: '' };
    const pct = l[l.length - 1].prix / l[0].prix - 1;
    if (Math.abs(pct) >= 0.005) hausses.push({ code, produit: d.produit, unite: d.unite, de: l[0], a: l[l.length - 1], pct });
  });
  hausses.sort((a, b) => b.pct - a.pct);
  return { y, rows, tot, fournisseurs, hausses };
}
function apRenderAnnee() {
  const years = [...new Set(CaApp.invoices.map(i => i.date.slice(0, 4)).concat([localISODate().slice(0, 4)]))].sort();
  const y = _apAnnee || years[years.length - 1];
  const D = apDonneesAnnee(y), obj = { n: Number(CA_OBJECTIFS.nourriture) || null, b: Number(CA_OBJECTIFS.boissons) || null };
  const pc = (v, o) => v == null ? '—' : `<span class="${o ? (v <= o ? 'ap-vert' : v <= o * 1.1 ? 'ap-orange' : 'ap-rouge') : ''}">${Math.round(v * 10) / 10} %</span>`;
  const max = Math.max(1, ...D.rows.map(r => r.n + r.b + r.autres));
  const court = m => new Date(m + '-15').toLocaleDateString('fr-FR', { month: 'short' });
  return `<div style="margin-bottom:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <span style="font-size:13px;color:#8a8478;font-weight:500;">Année :</span>
      <select style="width:auto" onchange="_apAnnee=this.value;CaApp.render()">${years.map(x => `<option${x === y ? ' selected' : ''}>${x}</option>`).join('')}</select>
      <button class="btn btn-ghost" onclick="apExportAnnee(${jsArg(y)})">⬇ Excel</button>
      <button class="btn btn-ghost" onclick="apImprimerAnnee()">🖨 Imprimer / PDF</button></div>
    <div id="ap-annee">
    <h2 class="ap-print-only">La Salle à Manger · Grenoble — Bilan des achats ${esc(y)}</h2>
    <div class="row" style="margin-bottom:8px;">
      <div class="kpi"><div class="label">Achats HT (hors TVA)</div><div class="value">${apEur(D.tot.n + D.tot.b + D.tot.autres)}</div><div class="muted" style="font-size:12px;margin-top:4px">${D.tot.nb} factures</div></div>
      <div class="kpi"><div class="label">Total TTC</div><div class="value">${apEur(D.tot.ttc)}</div></div>
      <div class="kpi"><div class="label">Ratio nourriture</div><div class="value">${pc(D.tot.ratioN, obj.n)}</div></div>
      <div class="kpi"><div class="label">Ratio boissons</div><div class="value">${pc(D.tot.ratioB, obj.b)}</div></div>
    </div>
    <div class="card" style="margin-bottom:14px"><div style="font-size:13px;font-weight:600;margin-bottom:10px">Achats HT par mois</div>
      <div class="ap-chart">${D.rows.map(r => `<div class="ap-col" title="${esc(monthLabel(r.m))} : ${apEur(r.n + r.b + r.autres)}">
        <div class="ap-bar"><div style="height:${(r.autres / max * 100).toFixed(1)}%;background:#8a8478"></div><div style="height:${(r.b / max * 100).toFixed(1)}%;background:#4a6670"></div><div style="height:${(r.n / max * 100).toFixed(1)}%;background:#7f1d2e"></div></div>
        <div class="ap-col-l">${esc(court(r.m))}</div></div>`).join('')}</div>
      <div style="font-size:12px;color:#8a8478;margin-top:6px"><span class="dot" style="background:#7f1d2e"></span>Nourriture <span class="dot" style="background:#4a6670;margin-left:10px"></span>Boissons <span class="dot" style="background:#8a8478;margin-left:10px"></span>Fournitures, entretien…</div></div>
    <div class="card" style="padding:0;overflow:auto;margin-bottom:14px"><table>
      <thead><tr><th>Mois</th><th class="num">Nourriture</th><th class="num">Boissons</th><th class="num">Autres</th><th class="num">TVA</th><th class="num">TTC</th><th class="num">CA HT</th><th class="num">Ratio 🍴</th><th class="num">Ratio 🥤</th><th></th></tr></thead><tbody>` +
    D.rows.map(r => `<tr><td>${esc(monthLabel(r.m))}</td><td class="num">${r.n ? apEur(r.n) : '—'}</td><td class="num">${r.b ? apEur(r.b) : '—'}</td><td class="num">${r.autres ? apEur(r.autres) : '—'}</td>
      <td class="num muted">${r.tva ? apEur(r.tva) : '—'}</td><td class="num" style="font-weight:600">${r.ttc ? apEur(r.ttc) : '—'}</td>
      <td class="num">${(r.caN || 0) + (r.caB || 0) ? apEur((r.caN || 0) + (r.caB || 0)) : '—'}</td><td class="num">${pc(r.ratioN, obj.n)}</td><td class="num">${pc(r.ratioB, obj.b)}</td><td>${r.clos ? '🔒' : ''}</td></tr>`).join('') +
    `<tr style="font-weight:700"><td>Total ${esc(y)}</td><td class="num">${apEur(D.tot.n)}</td><td class="num">${apEur(D.tot.b)}</td><td class="num">${apEur(D.tot.autres)}</td><td class="num">${apEur(D.tot.tva)}</td><td class="num">${apEur(D.tot.ttc)}</td><td></td><td class="num">${pc(D.tot.ratioN, obj.n)}</td><td class="num">${pc(D.tot.ratioB, obj.b)}</td><td></td></tr>
      </tbody></table></div>
    <div class="row" style="align-items:flex-start">
      <div class="card" style="flex:1 1 300px"><div style="font-size:13px;font-weight:600;margin-bottom:10px">Fournisseurs (HT hors TVA)</div>` +
    (D.fournisseurs.length ? D.fournisseurs.slice(0, 10).map(f => `<div style="display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid #f0ece0"><span>${esc(f.nom)}</span><span class="muted">${apEur(f.ht)}</span></div>`).join('') : '<div class="muted">—</div>') +
    `</div><div class="card" style="flex:1 1 380px"><div style="font-size:13px;font-weight:600;margin-bottom:10px">Plus fortes variations de prix ${esc(y)}</div>` +
    (D.hausses.length ? '<table class="ap-table">' + D.hausses.slice(0, 12).map(h => `<tr><td>${esc(h.produit)}</td><td class="num">${h.de.prix.toFixed(2)} → ${h.a.prix.toFixed(2)} €</td><td class="num ${h.pct > 0.1 ? 'ap-rouge' : h.pct < 0 ? 'ap-vert' : ''}">${h.pct > 0 ? '+' : ''}${Math.round(h.pct * 100)} %</td></tr>`).join('') + '</table>'
      : '<div class="muted">Pas encore assez d\'historique de prix.</div>') +
    `</div></div>
    <div class="muted" style="font-size:12px;margin-top:10px">Ratio = (stock de début + achats − stock de fin) ÷ CA HT, calculé pour chaque mois disposant d'un inventaire archivé de fin de mois et du mois précédent, et du CA saisi. Couleurs selon les objectifs fixés dans l'onglet Historique.</div>
    </div>`;
}
function apExportAnnee(y) {
  const D = apDonneesAnnee(y), r2 = v => v == null ? '' : Math.round(v * 100) / 100, r1 = v => v == null ? '' : Math.round(v * 10) / 10;
  const a1 = [[`La Salle à Manger · Grenoble — Bilan des achats ${y}`], [], ['Mois', 'Nourriture HT', 'Boissons HT', 'Autres HT', 'TVA (635200)', 'Total TTC', 'Factures', 'CA nourriture', 'CA boissons', 'Ratio nourriture %', 'Ratio boissons %', 'Clôturé']];
  D.rows.forEach(r => a1.push([monthLabel(r.m), r2(r.n), r2(r.b), r2(r.autres), r2(r.tva), r2(r.ttc), r.nb, r2(r.caN), r2(r.caB), r1(r.ratioN), r1(r.ratioB), r.clos ? 'oui' : '']));
  a1.push(['TOTAL', r2(D.tot.n), r2(D.tot.b), r2(D.tot.autres), r2(D.tot.tva), r2(D.tot.ttc), D.tot.nb, '', '', r1(D.tot.ratioN), r1(D.tot.ratioB), '']);
  const a2 = [['Fournisseur', 'Achats HT (hors TVA)'], ...D.fournisseurs.map(f => [f.nom, r2(f.ht)])];
  const a3 = [['Code', 'Produit', 'Unité', 'Prix début', 'Date', 'Prix fin', 'Date', 'Variation %'], ...D.hausses.map(h => [h.code, h.produit, h.unite || '', h.de.prix, h.de.date, h.a.prix, h.a.date, r1(h.pct * 100)])];
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(a1); ws1['!cols'] = [{ wch: 16 }, ...Array(11).fill({ wch: 13 })];
  XLSX.utils.book_append_sheet(wb, ws1, 'Mois');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(a2), 'Fournisseurs');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(a3), 'Variations de prix');
  XLSX.writeFile(wb, `Bilan_achats_${y}_La_Salle_a_Manger.xlsx`);
}
function apImprimerAnnee() {
  const el = document.getElementById('ap-annee'); if (!el) return;
  const w = window.open('', '_blank'); if (!w) return alert('Autorisez les fenêtres pour imprimer.');
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Bilan des achats</title><style>
    body{font-family:Arial,sans-serif;color:#222;margin:24px;font-size:12px} h2{font-size:18px;margin:0 0 14px}
    .row{display:flex;gap:10px;flex-wrap:wrap}.kpi,.card{border:1px solid #ddd;border-radius:8px;padding:10px;flex:1 1 160px;margin-bottom:10px}
    .kpi .label{font-size:10px;text-transform:uppercase;color:#777}.kpi .value{font-size:18px;font-weight:700}
    table{width:100%;border-collapse:collapse}th,td{padding:4px 6px;border-bottom:1px solid #eee;text-align:left}.num{text-align:right}
    .muted{color:#777}.ap-vert{color:#27500a;font-weight:700}.ap-orange{color:#a35d00;font-weight:700}.ap-rouge{color:#b3261e;font-weight:700}
    .ap-chart{display:flex;gap:6px;height:140px;align-items:flex-end}.ap-col{flex:1;display:flex;flex-direction:column;height:100%}.ap-bar{flex:1;display:flex;flex-direction:column-reverse}.ap-col-l{text-align:center;font-size:10px}
    .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}
    @media print{body{margin:10mm}}</style></head><body>${el.innerHTML}</body></html>`);
  w.document.close(); setTimeout(() => w.print(), 400);
}

// ── 11. Sauvegarde complète chez l'utilisateur (ZIP : données du serveur + PDF des factures) ──
async function apSauvegardeZip(m) {
  const annee = String(m || localISODate()).slice(0, 4);
  const toast = (t, k) => { if (window.CaApp && CaApp._initialized && document.getElementById('panel-factures-ca')?.classList.contains('active')) CaApp.toast(t, k); else showSyncToast(t); };
  toast('Préparation de la sauvegarde…');
  try {
    if (!window.JSZip) await apLoadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    if (!CaApp._initialized) CaApp.loadFromStorage();
    const zip = new JSZip();
    // Données : version du serveur (référence commune à tous les appareils), sinon celle de cet appareil
    let store = null, produits = null, source = 'serveur';
    try {
      if (!(await ensureFreshToken(false))) throw new Error('non connecté');
      const r1 = await supa('/rest/v1/haccp_store?select=id,data,updated_at,updated_by');
      const r2 = await supa('/rest/v1/haccp_products?select=*&order=code');
      if (!r1.ok || !r2.ok) throw new Error('lecture refusée');
      store = {}; (await r1.json()).forEach(r => { store[r.id] = { data: r.data, updated_at: r.updated_at, updated_by: r.updated_by }; });
      produits = await r2.json();
    } catch (e) {
      source = 'appareil (' + e.message + ')'; store = {};
      Object.entries(SYNC_MODULES).forEach(([id, key]) => { try { const v = localStorage.getItem(key); if (v) store[id] = { data: JSON.parse(v) }; } catch (x) { } });
      produits = DATA.concat(window.ARCHIVES || []);
    }
    zip.file('donnees.json', JSON.stringify({ app: 'Inventaire SP Conseil — La Salle à Manger · Grenoble', type: 'sauvegarde-complete', source, exportedAt: new Date().toISOString(), store, produits }, null, 1));
    // PDF / photos des factures de l'année
    const facts = apFactures(CaApp.invoices.filter(i => i.date.startsWith(annee)));
    const propre = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9-]+/g, '_').replace(/^_|_$/g, '');
    let nb = 0, ko = 0, sans = 0;
    for (const f of facts) {
      const path = (f.lignes.find(l => l.fichier) || {}).fichier;
      if (!path) { sans++; continue; }
      try { zip.file(`Factures/${f.date.slice(0, 7)}/${[f.date, propre(f.fournisseur), propre(f.bl || f.id)].join('_')}.${path.split('.').pop()}`, await apFichierBlob(path)); nb++; }
      catch (e) { ko++; }
    }
    zip.file('LISEZMOI.txt', `Sauvegarde complète — Inventaire SP Conseil (La Salle à Manger · Grenoble)\r\nFaite le ${new Date().toLocaleString('fr-FR')} — données : ${source}\r\n\r\n` +
      `donnees.json : toutes les données de l'appli (inventaire, historique, cahier d'achats, règles, clôtures…) et le catalogue des ${produits.length} produits.\r\n` +
      `Factures/ : ${nb} facture(s) de ${annee} (PDF ou photo)${sans ? ', ' + sans + ' facture(s) sans fichier joint' : ''}${ko ? ', ' + ko + ' fichier(s) illisible(s)' : ''}.\r\n\r\n` +
      `Rangez ce fichier dans un dossier OneDrive. Le serveur garde en plus une copie chaque nuit (24 mois).\r\n` +
      `Pour restaurer : confiez ce fichier à l'administrateur de l'appli (procédure : supabase/2026-10-19_sauvegardes.sql).\r\n`);
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    const nom = `Sauvegarde_Inventaire_SP_Conseil_${localISODate()}.zip`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nom; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    if (m) { CA_CLOTURES.mois[m] = Object.assign({}, CA_CLOTURES.mois[m], { sauvegardeLe: localISODate() }); apSave('ca_clotures'); if (CaApp._initialized && CaApp.tab === 'cloture') CaApp.render(); }
    const fb = document.getElementById('save-feedback');
    const msg = `✓ ${nom} téléchargé : données (${source}) + ${nb} facture(s). Rangez-le dans un dossier OneDrive.`;
    if (fb) { fb.className = 'voice-feedback ok'; fb.textContent = msg; }
    toast(msg.replace('✓ ', ''));
  } catch (e) { toast('Sauvegarde impossible : ' + e.message, 'error'); }
}
