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

const AP_KEYS = { ca_regles: 'ca_regles', ca_liens: 'ca_liens', ca_articles: 'ca_articles', ca_reclamations: 'ca_reclamations', ca_objectifs: 'ca_objectifs', doublons_ignores: 'haccp_doublons_ignores_v1' };
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

let CA_REGLES = [], CA_LIENS = {}, CA_ARTICLES = [], CA_RECLAM = [], CA_OBJECTIFS = {}, DOUBLONS_IGNORES = [];
function apLoad() {
  const g = (k, d) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch (e) { return d; } };
  CA_REGLES = g(AP_KEYS.ca_regles, null) || AP_REGLES_DEFAUT.slice();
  CA_LIENS = g(AP_KEYS.ca_liens, {}) || {};
  CA_ARTICLES = g(AP_KEYS.ca_articles, []) || [];
  CA_RECLAM = g(AP_KEYS.ca_reclamations, []) || [];
  CA_OBJECTIFS = g(AP_KEYS.ca_objectifs, {}) || {};
  DOUBLONS_IGNORES = g(AP_KEYS.doublons_ignores, []) || [];
  if (Array.isArray(CA_LIENS)) CA_LIENS = {};
  if (!Array.isArray(CA_OBJECTIFS) && typeof CA_OBJECTIFS !== 'object') CA_OBJECTIFS = {};
}
apLoad();
function apSave(id) {
  const data = { ca_regles: CA_REGLES, ca_liens: CA_LIENS, ca_articles: CA_ARTICLES, ca_reclamations: CA_RECLAM, ca_objectifs: CA_OBJECTIFS, doublons_ignores: DOUBLONS_IGNORES }[id];
  saveModule(AP_KEYS[id], id, data);
}
// Données reçues d'un autre appareil
function apReload(id) {
  apLoad();
  const ca = document.getElementById('panel-factures-ca');
  if (ca && ca.classList.contains('active') && window.CaApp && CaApp._initialized && ['dashboard', 'regles', 'prix', 'reclam'].includes(CaApp.tab) && !CaApp.editingInvoiceId) CaApp.render();
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
    if (ctx) {
      const h = (PRIX_HISTO_DATA[code] || []); const e = h[h.length - 1];
      if (e && e.date === today && e.note === 'Mercuriale') { e.fournisseur = ctx.fournisseur || e.fournisseur; e.date = ctx.date || e.date; e.note = 'Facture ' + (ctx.fournisseur || ''); h.sort((a, b) => String(a.date).localeCompare(String(b.date))); }
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
  const mois = CaApp.selectedMonth || '';
  const list = CaApp.invoices.filter(i => !mois || monthKey(i.date) === mois);
  if (!list.length) return CaApp.toast('Aucune facture sur cette période.', 'error');
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
  XLSX.writeFile(wb, `Achats_${mois || 'complet'}_cabinet.xlsx`);
  CaApp.toast('Export comptable généré.');
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
