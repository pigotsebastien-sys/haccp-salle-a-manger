// ══════════════════════════════════════════════════════════════════
// MODULE RÉCEPTION MARCHANDISES — Standalone v1.0
// Auteur : HACCP Pro · haccp-lsm.netlify.app
// Intégration : inclure ce fichier dans votre application
// Événement : document.addEventListener('receptionSaved', fn) 
//             → fn reçoit { detail: { id, date, fourn, produit, ... } }
// Storage : localStorage clé 'haccp-reception-v1'
// ══════════════════════════════════════════════════════════════════


// ── État local ─────────────────────────────────────────────────────────
var recState = { receptions: [], nextId: 1 };

function recLoad() {
  try { var r=localStorage.getItem('haccp-reception-v1'); if(r) recState=JSON.parse(r); }
  catch(e) {}
}
function recSave() {
  try { 
    localStorage.setItem('haccp-reception-v1', JSON.stringify(recState));
    if(typeof syncToCloud==='function') syncToCloud('receptions', recState);
  }
  catch(e) {}
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  recLoad();
  renderReceptions();
  recRenderCal();
  var now = new Date();
  var dateEl  = document.getElementById('rec-date');
  var heureEl = document.getElementById('rec-heure');
  if(dateEl)  dateEl.value  = now.toISOString().slice(0,10);
  if(heureEl) heureEl.value = now.toTimeString().slice(0,5);
});


function recCalcDlc() {
  var fab   = document.getElementById('rec-date-fab')?.value;
  var dlc   = document.getElementById('rec-dlc-date')?.value;
  var badge = document.getElementById('rec-dlc-badge');
  if(!badge) return;
  if(!dlc) { badge.textContent='—'; badge.className='rec-dlc-badge'; return; }
  var today   = new Date(); today.setHours(0,0,0,0);
  var dlcDate = new Date(dlc);
  var diff    = Math.round((dlcDate - today) / 86400000);
  var fabText = '';
  if(fab) {
    var fabDate = new Date(fab);
    var age = Math.round((today - fabDate) / 86400000);
    fabText = ' · J+' + age + ' fab.';
  }
  if(diff < 0)       { badge.textContent='EXPIRÉ ('+Math.abs(diff)+'j)'+fabText; badge.className='rec-dlc-badge danger'; }
  else if(diff === 0){ badge.textContent='Expire auj.'+fabText;                   badge.className='rec-dlc-badge danger'; }
  else if(diff <= 3) { badge.textContent=diff+' j restants'+fabText;             badge.className='rec-dlc-badge warn';   }
  else               { badge.textContent=diff+' j restants'+fabText;             badge.className='rec-dlc-badge ok';     }
}


function checkReception() {
  var temp = parseFloat(document.getElementById('rec-temp')?.value);
  var typeTemp = document.getElementById('rec-type-temp')?.value;
  var box = document.getElementById('rec-alert-box');
  if(!box) return;
  if(isNaN(temp) || typeTemp === 'na') { box.innerHTML = ''; return; }
  var limit = parseFloat(typeTemp);
  if(temp > limit) {
    box.innerHTML = '<div style="background:#FEF2F2;border:1.5px solid #FECACA;border-radius:8px;padding:10px 14px;margin-bottom:12px;color:#991B1B;font-weight:600;font-size:13px">⚠️ Température non conforme ('+temp+'°C > '+limit+'°C). Action corrective requise.</div>';
  } else {
    box.innerHTML = '<div style="background:#F0FAF4;border:1.5px solid #74C69D;border-radius:8px;padding:10px 14px;margin-bottom:12px;color:#1B4332;font-weight:600;font-size:13px">✅ Température conforme ('+temp+'°C ≤ '+limit+'°C)</div>';
  }
}


async function saveReception() {
  var dateEl   = document.getElementById('rec-date');
  var heureEl  = document.getElementById('rec-heure');
  var fournEl  = document.getElementById('rec-fourn');
  var prodEl   = document.getElementById('rec-produit');
  var qteEl    = document.getElementById('rec-qte');
  var uniteEl  = document.getElementById('rec-unite');
  var tempEl   = document.getElementById('rec-temp');
  var dlcEl    = document.getElementById('rec-dlc');
  var embEl    = document.getElementById('rec-emb');
  var decEl    = document.getElementById('rec-decision');
  var opEl     = document.getElementById('rec-op');
  var obsEl    = document.getElementById('rec-obs');
  var fabEl    = document.getElementById('rec-date-fab');
  var dlcDateEl= document.getElementById('rec-dlc-date');

  if(!fournEl?.value.trim()) { alert('Veuillez saisir le fournisseur'); return; }
  if(!prodEl?.value.trim())  { alert('Veuillez saisir le produit'); return; }

  var rec = {
    id:       Date.now(),
    date:     dateEl?.value || new Date().toISOString().slice(0,10),
    heure:    heureEl?.value || '',
    fourn:    normalizeFournisseur(fournEl?.value) || '',
    produit:  prodEl?.value.trim() || '',
    qte:      qteEl?.value || '',
    unite:    uniteEl?.value || 'kg',
    temp:     tempEl?.value || '',
    dlc:      dlcEl?.value || 'ok',
    emb:      embEl?.value || 'ok',
    decision: decEl?.value || 'ok',
    op:       opEl?.value.trim() || '',
    obs:      obsEl?.value.trim() || '',
    dateFab:  fabEl?.value || '',
    dlcDate:  dlcDateEl?.value || '',
    photos:   [],
    ts:       Date.now()
  };

  // Photos
  if(window.recPendingPhotos?.length) {
    rec.photos = window.recPendingPhotos.map(p => p.dataURL);
  }

  // Sauvegarder
  recState.receptions.unshift(rec);
  recSave();
  renderReceptions();

  // Reset
  if(prodEl)    prodEl.value  = '';
  if(fournEl)   fournEl.value = '';
  if(qteEl)     qteEl.value   = '';
  if(tempEl)    tempEl.value  = '';
  if(obsEl)     obsEl.value   = '';
  if(fabEl)     fabEl.value   = '';
  if(dlcDateEl) dlcDateEl.value = '';
  var badge = document.getElementById('rec-dlc-badge');
  if(badge) { badge.textContent='—'; badge.className='rec-dlc-badge'; }
  window.recPendingPhotos = [];
  var prev = document.getElementById('rec-photo-previews');
  if(prev) prev.innerHTML = '';

  // Feedback visuel
  var btn = document.querySelector('.rec-btn-save');
  if(btn) {
    var orig = btn.innerHTML;
    btn.innerHTML = '✅ Réception enregistrée !';
    btn.style.background = '#1B4332';
    setTimeout(function(){ btn.innerHTML = orig; btn.style.background = ''; }, 2000);
  }

  // Déclencher un événement custom pour intégration externe
  document.dispatchEvent(new CustomEvent('receptionSaved', { detail: rec }));
}


function renderReceptions() {
  var tbody = document.getElementById('rec-tbody');
  if(!tbody) return;
  var recs = recState.receptions || [];
  if(!recs.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#9B9892;padding:20px">Aucune réception enregistrée</td></tr>';
    return;
  }
  tbody.innerHTML = recs.map(function(r) {
    var decCls = r.decision==='ok'?'color:#1B4332;font-weight:700': r.decision==='reserve'?'color:#D97706;font-weight:700':'color:#991B1B;font-weight:700';
    var tempNum = parseFloat(r.temp);
    var tempLimit = parseFloat(r['type-temp']||'4');
    var tempOk = isNaN(tempNum) || isNaN(tempLimit) || tempNum <= tempLimit;
    var tempCls = tempOk ? '' : 'color:#991B1B;font-weight:700';
    var photos = r.photos?.length ? '<span style="cursor:pointer;color:#2D6A4F;font-weight:600" onclick="openLightbox(recState.receptions.find(function(x){return x.id==='+r.id+'}).photos[0])">📷 '+r.photos.length+'</span>' : '—';
    return '<tr>'+
      '<td>'+r.date+'</td>'+
      '<td>'+r.heure+'</td>'+
      '<td style="font-weight:600">'+r.fourn+'</td>'+
      '<td>'+r.produit+(r.qte?' — <b>'+r.qte+' '+(r.unite||'')+'</b>':'')+'</td>'+
      '<td style="font-family:monospace;font-weight:600;'+tempCls+'">'+r.temp+(r.temp?'°C':'—')+'</td>'+
      '<td>'+(r.dlc==='ok'?'✅':'❌')+'</td>'+
      '<td>'+(r.emb==='ok'?'✅':r.emb==='partiel'?'⚠️':'❌')+'</td>'+
      '<td style="'+decCls+'">'+(r.decision==='ok'?'✅ Accepté':r.decision==='reserve'?'⚠️ Réserve':'❌ Refusé')+'</td>'+
      '<td>'+photos+'</td>'+
      '<td>'+r.op+'</td>'+
    '</tr>';
  }).join('');
}


window.recPendingPhotos = [];
function handleRecPhotos(input) {
  var files = Array.from(input.files || []);
  var prev  = document.getElementById('rec-photo-previews');
  if(!prev) return;
  files.forEach(function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var dataURL = e.target.result;
      window.recPendingPhotos = window.recPendingPhotos || [];
      window.recPendingPhotos.push({ dataURL: dataURL, name: file.name });
      var img = document.createElement('img');
      img.src = dataURL;
      img.className = 'photo-preview';
      img.onclick = function() { openLightbox(dataURL); };
      prev.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}


function openLightbox(url) {
  var lb = document.getElementById('lightbox');
  var img = document.getElementById('lightbox-img');
  if(!lb || !img || !url) return;
  img.src = url;
  lb.style.display = 'flex';
}
function closeLightbox() {
  var lb = document.getElementById('lightbox');
  if(lb) lb.style.display = 'none';
}


var recCalYear  = new Date().getFullYear();
var recCalMonth = new Date().getMonth();

function recCalPrev() { recCalMonth--; if(recCalMonth<0){recCalMonth=11;recCalYear--;} recRenderCal(); }
function recCalNext() { recCalMonth++; if(recCalMonth>11){recCalMonth=0;recCalYear++;} recRenderCal(); }

function recRenderCal() {
  var grid = document.getElementById('rec-cal-grid');
  var label = document.getElementById('rec-cal-month-label');
  if(!grid) return;
  var months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  if(label) label.textContent = months[recCalMonth] + ' ' + recCalYear;
  var days = ['L','M','M','J','V','S','D'];
  var first = new Date(recCalYear, recCalMonth, 1).getDay();
  first = first === 0 ? 6 : first - 1;
  var total = new Date(recCalYear, recCalMonth + 1, 0).getDate();
  var recs = recState.receptions || [];
  var html = days.map(function(d){ return '<div class="rec-cal-day-hdr">'+d+'</div>'; }).join('');
  for(var i=0; i<first; i++) html += '<div></div>';
  for(var d=1; d<=total; d++) {
    var dateStr = recCalYear+'-'+String(recCalMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var dayRecs = recs.filter(function(r){ return r.date===dateStr; });
    var cls = 'rec-cal-cell';
    if(dayRecs.length) {
      var hasRefus = dayRecs.some(function(r){ return r.decision==='refuse'; });
      var hasReserve = dayRecs.some(function(r){ return r.decision==='reserve'; });
      cls += hasRefus ? ' danger' : hasReserve ? ' warn' : ' ok';
    }
    html += '<div class="'+cls+'" data-d="'+dateStr+'" onclick="recSelectDay(this.dataset.d)">'+d+(dayRecs.length?'<span class="rec-cal-count">'+dayRecs.length+'</span>':'')+'</div>';
  }
  grid.innerHTML = html;
}

function recSelectDay(dateStr) {
  var panel = document.getElementById('rec-day-panel');
  var list  = document.getElementById('rec-day-list');
  var dateLabel = document.getElementById('rec-day-panel-date');
  if(!panel || !list) return;
  var dayRecs = (recState.receptions || []).filter(function(r){ return r.date===dateStr; });
  if(dateLabel) dateLabel.textContent = dateStr;
  if(!dayRecs.length) { list.innerHTML = '<p style="color:#9B9892;font-size:13px">Aucune réception ce jour</p>'; return; }
  list.innerHTML = dayRecs.map(function(r){
    return '<div style="padding:8px;border-radius:8px;background:#F7F5F0;margin-bottom:6px;font-size:13px">'+
      '<b>'+r.fourn+'</b> — '+r.produit+(r.qte?' ('+r.qte+' '+r.unite+')':'')+'<br>'+
      '<span style="color:#5C5954">'+r.temp+(r.temp?'°C · ':'')+(r.decision==='ok'?'✅ Accepté':r.decision==='reserve'?'⚠️ Réserve':'❌ Refusé')+'</span>'+
    '</div>';
  }).join('');
  panel.style.display = 'block';
}

function recCalToggle() {
  var content = document.getElementById('rec-cal-content');
  var chevron = document.getElementById('rec-cal-chevron');
  if(!content) return;
  var hidden = content.style.display === 'none';
  content.style.display = hidden ? '' : 'none';
  if(chevron) chevron.textContent = hidden ? 'expand_less' : 'expand_more';
  if(hidden) recRenderCal();
}


function exportReceptions() {
  var recs = recState.receptions || [];
  if(!recs.length) { alert('Aucune réception à exporter'); return; }
  var header = 'Date,Heure,Fournisseur,Produit,Quantité,Unité,Température,DLC,Emballages,Décision,Opérateur,Observations,Date fabrication,DLC date';
  var rows = recs.map(function(r) {
    return [r.date,r.heure,r.fourn,r.produit,r.qte,r.unite,r.temp,r.dlc,r.emb,r.decision,r.op,r.obs,r.dateFab,r.dlcDate]
      .map(function(v){ return '"'+(v||'').replace(/"/g,'""')+'"'; }).join(',');
  });
  var csv = header + '\n' + rows.join('\n');
  var blob = new Blob(['﻿'+csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'receptions_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}

