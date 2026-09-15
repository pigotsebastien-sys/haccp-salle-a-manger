#!/usr/bin/env node
// Smoke tests HACCP LSM — exécuter avant chaque déploiement
// Usage: node smoke-test.js

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html introuvable');
  process.exit(1);
}

const content = fs.readFileSync(indexPath, 'utf-8');
let pass = 0, fail = 0;

function check(desc, condition) {
  if (condition) { console.log('  ✅', desc); pass++; }
  else { console.error('  ❌', desc); fail++; }
}

console.log('\n🔍 HACCP LSM — Smoke Tests\n');

// Syntaxe JS basique
check('DOCTYPE présent', content.includes('<!DOCTYPE html>'));
check('Supabase URL configurée', content.includes('pbydidazdjqqihkolzgc.supabase.co'));
check('Service Worker référencé', content.includes('serviceWorker') && content.includes('sw.js'));
check('Panneau inventaire présent', content.includes('id="panel-inventaire"'));
check('Panneau recettes présent', content.includes('id="panel-recettes"'));
check('Panneau DLC présent', content.includes('id="panel-dlc"'));
check('Panneau réception présent', content.includes('id="panel-reception-mp"'));
check('Panneau factures présent', content.includes('id="panel-factures-ca"'));
check('Panneau allergènes présent', content.includes('id="panel-allergenes"'));
check('Auth login présent', content.includes('id="login-screen"'));
check('normalizeUnite() présent', content.includes('function normalizeUnite('));
check('normalizeFournisseur() présent', content.includes('function normalizeFournisseur('));
check('logSyncError() présent', content.includes('function logSyncError('));
check('renderRecettes() présent', content.includes('function renderRecettes('));
check('calcRecetteCout() présent', content.includes('function calcRecetteCout('));
check('syncToCloud() présent', content.includes('function syncToCloud('));
check('initSync() présent', content.includes('function initSync('));
check('scan-etiquette endpoint', content.includes('scan-etiquette'));
check('scan-facture endpoint', content.includes('scan-facture'));
check('openMercuriale() présent', content.includes('function openMercuriale('));
check('goHomeScreen() présent', content.includes('function goHomeScreen('));
check('Pas de clé API directe dans navigateur', !content.includes('anthropic-dangerous-direct-browser-access'));
check('Double confirmation reset', content.includes('ACTION IRRÉVERSIBLE'));
check('SW version définie', fs.existsSync(path.join(__dirname, 'sw.js')) && fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf-8').includes('haccp-lsm-v'));
check('Taille raisonnable (< 700KB)', Buffer.byteLength(content, 'utf-8') < 700000);

const size = Buffer.byteLength(content, 'utf-8');
console.log(`\n📊 Taille: ${Math.round(size/1024)}KB`);
console.log(`\n${pass} tests passés, ${fail} échoués`);

if (fail > 0) {
  console.error('\n❌ DÉPLOIEMENT BLOQUÉ — corrigez les erreurs ci-dessus');
  process.exit(1);
} else {
  console.log('\n✅ Tous les tests passés — déploiement autorisé');
}
