#!/usr/bin/env node
// Smoke tests HACCP LSM — exécuter avant chaque déploiement
// Usage: node smoke-test.js
//
// MàJ 19/09/2026 : depuis l'éclatement d'index.html en fichiers séparés
// (commit "Éclate index.html en fichiers CSS/JS"), ce script ne lisait plus
// que index.html — donc 14 vérifications sur 25 échouaient à tort (le code
// qu'elles cherchaient avait simplement déménagé dans js/app.js, js/core-sync.js
// etc.), et bloquait tout déploiement même sans régression réelle. Corrigé pour
// chercher dans TOUS les fichiers réellement servis par le site.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const indexPath = path.join(ROOT, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html introuvable');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf-8');
const css = fs.existsSync(path.join(ROOT, 'style.css')) ? fs.readFileSync(path.join(ROOT, 'style.css'), 'utf-8') : '';
const sw = fs.existsSync(path.join(ROOT, 'sw.js')) ? fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf-8') : '';

const jsDir = path.join(ROOT, 'js');
const jsFiles = fs.existsSync(jsDir)
  ? fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort()
  : [];
const jsContents = {};
for (const f of jsFiles) jsContents[f] = fs.readFileSync(path.join(jsDir, f), 'utf-8');
const allJs = Object.values(jsContents).join('\n');

// Tout ce que le navigateur charge réellement pour faire tourner l'appli —
// c'est ce périmètre-là qui doit contenir chaque fonction/chaîne attendue,
// peu importe dans quel fichier elle vit aujourd'hui.
const everything = html + '\n' + css + '\n' + sw + '\n' + allJs;

let pass = 0, fail = 0;
function check(desc, condition) {
  if (condition) { console.log('  ✅', desc); pass++; }
  else { console.error('  ❌', desc); fail++; }
}

console.log('\n🔍 HACCP LSM — Smoke Tests\n');

// ── Structure HTML (reste dans index.html) ──
check('DOCTYPE présent', html.includes('<!DOCTYPE html>'));
check('Panneau inventaire présent', html.includes('id="panel-inventaire"'));
check('Panneau recettes présent', html.includes('id="panel-recettes"'));
check('Panneau DLC présent', html.includes('id="panel-dlc"'));
check('Panneau réception présent', html.includes('id="panel-reception-mp"'));
check('Panneau factures présent', html.includes('id="panel-factures-ca"'));
check('Panneau allergènes présent', html.includes('id="panel-allergenes"'));
check('Auth login présent', html.includes('id="login-screen"'));

// ── Fichiers JS/CSS bien référencés depuis index.html ──
check('style.css chargé', /href=["']style\.css(\?[^"']*)?["']/.test(html));
for (const f of ['app.js', 'core-sync.js', 'sw-register.js', 'favicon.js', 'inventaire-plus.js', 'achats-plus.js']) {
  check(`js/${f} chargé`, html.includes(`js/${f}`));
}
// Chaque fichier JS servi doit être syntaxiquement valide
const vm = require('vm');
for (const f of jsFiles) {
  let ok = true;
  try { new vm.Script(jsContents[f], { filename: f }); } catch (e) { ok = false; console.error('     ', e.message); }
  check(`js/${f} : syntaxe valide`, ok);
}
// Chaque fichier JS référencé par index.html doit exister et être mis en cache par le SW
for (const m of html.matchAll(/src="(js\/[^"?]+)/g)) {
  check(`${m[1]} existe`, fs.existsSync(path.join(ROOT, m[1])));
  check(`${m[1]} dans le cache hors-ligne (sw.js)`, sw.includes('./' + m[1]));
}

// La liste produits intégrée ne doit contenir aucun « trou » (virgule seule) :
// DATA.find() planterait sur les produits situés après.
{
  const app = jsContents['app.js'] || '';
  const a = app.indexOf('const DATA=['), b = app.indexOf('];', a);
  let ok = false, n = 0;
  try { const D = vm.runInNewContext(app.slice(a + 11, b + 1)); n = D.length; ok = D.length > 0 && Array.from({ length: D.length }, (_, i) => i in D && D[i] && D[i].code).every(Boolean); } catch (e) {}
  check(`Liste produits intégrée sans trou (${n} produits)`, ok);
}

// ── Garde-fous anti-régression (audit du 18/10/2026) ──
check('Module réceptions synchronisé', allJs.includes("'receptions':"));
check('Pas d\'interception hors-ligne de syncToCloud', !allJs.includes('_originalSyncToCloud'));
check('Le SW n\'invente plus de réponses Supabase', !sw.includes('JSON.stringify([])'));
check('Scan facture : plan comptable envoyé', /systemPrompt:\s*systemPrompt/.test(allJs));
check('CSS Cahier d\'achats limité à son panneau', !/^\s*body\s*\{[^}]*#e9e4d8/m.test(css) && !/,\s*select,\s*input\[type=text\]/.test(css));
check('Manifest PWA = manifest.json', /rel="manifest" href="manifest\.json"/.test(html));
check('SheetJS à jour (≥ 0.20)', /xlsx-0\.2\d/.test(html));

// ── Fonctions/config — cherchées dans tout ce qui est servi, pas juste index.html ──
check('Supabase URL configurée', everything.includes('pbydidazdjqqihkolzgc.supabase.co'));
check('Service Worker référencé', html.includes('serviceWorker') || allJs.includes('serviceWorker'));
check('normalizeUnite() présent', everything.includes('function normalizeUnite('));
check('normalizeFournisseur() présent', everything.includes('function normalizeFournisseur('));
check('logSyncError() présent', everything.includes('function logSyncError('));
check('renderRecettes() présent', everything.includes('function renderRecettes('));
check('calcRecetteCout() présent', everything.includes('function calcRecetteCout('));
check('syncToCloud() présent', everything.includes('function syncToCloud('));
check('initSync() présent', everything.includes('function initSync('));
check('handleAuthCallback() présent (lien email : reset mdp + magic link)', everything.includes('function handleAuthCallback('));
check('doForgotPassword() présent (vraie réinitialisation, pas magic link)', everything.includes('function doForgotPassword('));
check('scan-etiquette endpoint', everything.includes('scan-etiquette'));
check('scan-facture endpoint', everything.includes('scan-facture'));
check('openMercuriale() présent', everything.includes('function openMercuriale('));
check('goHomeScreen() présent', everything.includes('function goHomeScreen('));
check('Pas de clé API directe dans navigateur', !everything.includes('anthropic-dangerous-direct-browser-access'));
check('Double confirmation reset', everything.includes('ACTION IRRÉVERSIBLE'));
check('SW version définie', sw.includes('haccp-lsm-v'));

// ── Poids total réellement téléchargé par un client (html + css + js, hors libs CDN) ──
const shippedBytes = Buffer.byteLength(html, 'utf-8') + Buffer.byteLength(css, 'utf-8') + Buffer.byteLength(sw, 'utf-8') +
  Object.values(jsContents).reduce((n, c) => n + Buffer.byteLength(c, 'utf-8'), 0);
check('Poids total raisonnable (< 900KB, hors librairies CDN)', shippedBytes < 900000);

// ── Garde-fou anti-régression : le split CSS/JS (19/09/2026) a laissé des
// fichiers js/ dont TOUTES les fonctions sont des copies mortes de fonctions
// identiques dans un autre fichier chargé après (js/reception.js entier, et
// 6 fonctions de js/ca-app.js, étaient dans ce cas). Ce n'est pas un bug de
// comportement aujourd'hui (les copies sont identiques), mais un piège pour
// la prochaine modif : on édite la copie "morte" sans effet, ou on modifie
// les deux et elles divergent. On avertit sans bloquer le déploiement.
function extractTopLevelFunctions(src) {
  const fns = {};
  const re = /^function ([A-Za-z0-9_]+)\(/gm;
  let m;
  while ((m = re.exec(src))) {
    const start = m.index;
    const braceOpen = src.indexOf('{', start);
    if (braceOpen === -1) continue;
    const closeRe = /^\}/gm;
    closeRe.lastIndex = braceOpen;
    const closeM = closeRe.exec(src);
    if (!closeM) continue;
    fns[m[1]] = src.slice(start, closeM.index + 1);
  }
  return fns;
}
const byFile = {};
for (const f of jsFiles) byFile[f] = extractTopLevelFunctions(jsContents[f]);
const dead = [];
for (let i = 0; i < jsFiles.length; i++) {
  for (let j = 0; j < jsFiles.length; j++) {
    if (i === j) continue;
    const a = jsFiles[i], b = jsFiles[j];
    for (const [name, body] of Object.entries(byFile[a])) {
      if (byFile[b][name] === body) {
        // a est chargé avant b dans index.html ? alors la copie de a est écrasée par b (morte).
        const posA = html.indexOf(`js/${a}`);
        const posB = html.indexOf(`js/${b}`);
        if (posA !== -1 && posB !== -1 && posA < posB) dead.push(`${name}() dans js/${a} (écrasée par js/${b})`);
      }
    }
  }
}
if (dead.length) {
  console.warn(`  ⚠️  ${dead.length} fonction(s) dupliquée(s)/mortes détectée(s) (avertissement, ne bloque pas) :`);
  [...new Set(dead)].forEach(d => console.warn('      -', d));
} else {
  console.log('  ✅ Aucune fonction dupliquée/morte entre fichiers js/');
}

const size = shippedBytes;
console.log(`\n📊 Poids total: ${Math.round(size/1024)}KB (index.html ${Math.round(Buffer.byteLength(html,'utf-8')/1024)}KB, style.css ${Math.round(Buffer.byteLength(css,'utf-8')/1024)}KB, js/ ${Math.round(Object.values(jsContents).reduce((n,c)=>n+Buffer.byteLength(c,'utf-8'),0)/1024)}KB)`);
console.log(`\n${pass} tests passés, ${fail} échoués`);

if (fail > 0) {
  console.error('\n❌ DÉPLOIEMENT BLOQUÉ — corrigez les erreurs ci-dessus');
  process.exit(1);
} else {
  console.log('\n✅ Tous les tests passés — déploiement autorisé');
}
