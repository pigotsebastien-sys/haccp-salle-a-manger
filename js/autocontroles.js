// ══════════════════════════════════════════════════════════════════
// MODULE AUTOCONTRÔLES HACCP — Huile de friture / Nettoyage / Anomalies
// Digitalisation des fiches papier "Autocontrôle mensuel SAM Grenoble"
// Storage : localStorage + sync cloud (voir js/core-sync.js)
// ══════════════════════════════════════════════════════════════════

const HUILE_KEY = 'haccp_huile_friture_v1';
const NETT_KEY  = 'haccp_nettoyage_v1';
const ANOM_KEY  = 'haccp_anomalies_v1';
const TEMP_KEY  = 'haccp_temperatures_v1'; // réutilise la clé/synchro de l'ancien relevé simple

// Chambres froides du site, avec seuils repris des fiches papier.
// Statut : value<=confMax → conforme ; value<=tolMax → à surveiller ; au-delà → non conforme
// (la même comparaison fonctionne pour le froid négatif car tolMax > confMax dans les deux cas,
// ex. congélateur : confMax=-18, tolMax=-17 → -17 est bien "au-delà" de -18)
const TEMP_CHAMBRES = [
  {id:'congelateur',    label:'Congélateur',             confMin:-25, confMax:-18, tolMax:-17},
  {id:'fruits_legumes', label:'Fruits & Légumes',        confMin:0,   confMax:8,   tolMax:10},
  {id:'bof',            label:'BOF (Beurre-Œufs-Fromage)',confMin:0,  confMax:3,   tolMax:4},
  {id:'congel_mep',     label:'Congel MEP',              confMin:-25, confMax:-18, tolMax:-17},
  {id:'mep',            label:'MEP',                     confMin:0,   confMax:3,   tolMax:4},
  {id:'desserts',       label:'Desserts',                confMin:0,   confMax:3,   tolMax:4},
  {id:'mep_viande',     label:'MEP viande',              confMin:0,   confMax:3,   tolMax:4},
];
const TEMP_SERVICES = ['matin','soir'];

const NETT_ZONES_DEFAUT = [
  'Four gauche','Four droit','Armoire MEP','Timbre réfrigéré','Top congélateur','Sol cuisine',
  'Plonge (desserte + machine)','Bac plonge batterie','Sol plonge','Bac légumerie','Sol légumerie',
  'Petite positive','Grande positive','Chambre négative','Sol positive + négative','Lingerie',
  'Réserve sèche','Toilette personnel','Local poubelle + sol','Vestiaire homme','Vestiaire femme','Murs'
].map(function(label, i){ return {id:'z'+i, label:label}; });

var HUILE_DATA = {entries:[]};
var NETT_DATA  = {zones:NETT_ZONES_DEFAUT.slice(), entries:{}};
var ANOM_DATA  = {entries:[]};
var TEMP_DATA  = {entries:{}, cellule:[]}; // entries: {date:{chambreId:{matin:{temp,visa},soir:{temp,visa}}}}
var anomUIState = {}; // {id: {openStep: 'analyse'|'action'|'verif'|null}} — état d'affichage, non persisté

var nettCalYear  = new Date().getFullYear();
var nettCalMonth = new Date().getMonth();
var tempCalYear  = new Date().getFullYear();
var tempCalMonth = new Date().getMonth();

function todayStr(){ return new Date().toISOString().slice(0,10); }
function nowTime(){ return new Date().toTimeString().slice(0,5); }

// ── Chargement / sauvegarde ──────────────────────────────────────────
function autocLoad(){
  try{ var r=localStorage.getItem(HUILE_KEY); if(r){ var d=JSON.parse(r); if(d && d.entries) HUILE_DATA=d; } }catch(e){}
  try{
    var r2=localStorage.getItem(NETT_KEY);
    if(r2){ var d2=JSON.parse(r2); if(d2){ NETT_DATA={zones:(d2.zones&&d2.zones.length?d2.zones:NETT_ZONES_DEFAUT.slice()),entries:d2.entries||{}}; } }
  }catch(e){}
  try{ var r3=localStorage.getItem(ANOM_KEY); if(r3){ var d3=JSON.parse(r3); if(d3 && d3.entries) ANOM_DATA=d3; } }catch(e){}
  try{
    var r4=localStorage.getItem(TEMP_KEY);
    if(r4){ var d4=JSON.parse(r4); if(d4 && !Array.isArray(d4)) TEMP_DATA={entries:d4.entries||{}, cellule:d4.cellule||[]}; }
  }catch(e){}
}

function autocSaveHuileData(){
  try{ localStorage.setItem(HUILE_KEY, JSON.stringify(HUILE_DATA)); if(typeof syncToCloud==='function') syncToCloud('huile_friture', HUILE_DATA); }catch(e){}
}
function autocSaveNettData(){
  try{ localStorage.setItem(NETT_KEY, JSON.stringify(NETT_DATA)); if(typeof syncToCloud==='function') syncToCloud('nettoyage', NETT_DATA); }catch(e){}
}
function autocSaveAnomData(){
  try{ localStorage.setItem(ANOM_KEY, JSON.stringify(ANOM_DATA)); if(typeof syncToCloud==='function') syncToCloud('anomalies', ANOM_DATA); }catch(e){}
}
function autocSaveTempData(){
  try{ localStorage.setItem(TEMP_KEY, JSON.stringify(TEMP_DATA)); if(typeof syncToCloud==='function') syncToCloud('temperatures', TEMP_DATA); }catch(e){}
}

// Appelé par core-sync.js quand une mise à jour distante arrive (WebSocket/pull)
function autocReload(moduleId){
  autocLoad();
  if(moduleId==='huile_friture') renderHuile();
  if(moduleId==='nettoyage'){ renderNettoyage(); nettRenderCal(); }
  if(moduleId==='anomalies') renderAnomalies();
  if(moduleId==='temperatures'){ renderTempChambres(); renderCellule(); tempRenderCal(); }
  updateAutocAlertDot();
}

// ── Init (appelé à l'ouverture du panneau) ──────────────────────────
function autocInit(){
  autocLoad();
  var hd=document.getElementById('huile-date'); if(hd && !hd.value) hd.value=todayStr();
  var nd=document.getElementById('nett-date');   if(nd && !nd.value) nd.value=todayStr();
  var td=document.getElementById('temp-date');   if(td && !td.value) td.value=todayStr();
  var cd=document.getElementById('cell-date');   if(cd && !cd.value) cd.value=todayStr();
  renderTempChambres();
  renderCellule();
  tempRenderCal();
  renderHuile();
  renderNettoyage();
  nettRenderCal();
  renderAnomalies();
  updateAutocAlertDot();
}

// Ouvre directement le sous-onglet Températures (depuis le bouton resté dans l'onglet DLC, ou la voix)
function openAutocTemp(){
  if(typeof switchTabByName==='function') switchTabByName('autocontroles');
  setTimeout(function(){
    var btn=document.querySelector('.autoc-subnav-btn[onclick*="temperatures"]');
    if(btn) autocSwitch('temperatures', btn);
  }, 50);
}

// ══════════════════════════════════════════════════════════════════
// TEMPÉRATURES — chambres froides (matin/soir) + cellule de refroidissement
// ══════════════════════════════════════════════════════════════════
function tempDate(){ var el=document.getElementById('temp-date'); return (el && el.value) || todayStr(); }

// null = pas de relevé, sinon 'conforme' | 'surveiller' | 'nonconforme'
function tempStatus(ch, val){
  if(val===''||val===null||val===undefined) return null;
  val=parseFloat(val);
  if(isNaN(val)) return null;
  if(val<=ch.confMax) return 'conforme';
  if(val<=ch.tolMax) return 'surveiller';
  return 'nonconforme';
}
var TEMP_STATUS_CLS={conforme:'dlc-badge-green', surveiller:'dlc-badge-yellow', nonconforme:'dlc-badge-red'};
var TEMP_STATUS_LABEL={conforme:'Conforme', surveiller:'À surveiller', nonconforme:'Non conforme'};
var TEMP_STATUS_RANK={conforme:1, surveiller:2, nonconforme:3};

function setTempVal(chambreId, service, field, value){
  var date=tempDate();
  if(!TEMP_DATA.entries[date]) TEMP_DATA.entries[date]={};
  if(!TEMP_DATA.entries[date][chambreId]) TEMP_DATA.entries[date][chambreId]={};
  if(!TEMP_DATA.entries[date][chambreId][service]) TEMP_DATA.entries[date][chambreId][service]={temp:'',visa:''};
  TEMP_DATA.entries[date][chambreId][service][field]=value;
  autocSaveTempData();
  if(field==='temp') renderTempChambres(); // recalcule le badge de statut
  tempRenderCal();
}

function renderTempChambres(){
  var list=document.getElementById('temp-chambres-list');
  var prog=document.getElementById('temp-progress');
  if(!list) return;
  var date=tempDate();
  var dayData=TEMP_DATA.entries[date]||{};
  var filled=0, total=TEMP_CHAMBRES.length*TEMP_SERVICES.length;
  TEMP_CHAMBRES.forEach(function(ch){
    TEMP_SERVICES.forEach(function(svc){
      var v=dayData[ch.id] && dayData[ch.id][svc] && dayData[ch.id][svc].temp;
      if(v!=='' && v!=null) filled++;
    });
  });
  if(prog) prog.textContent = filled+'/'+total+' relevés';

  list.innerHTML = TEMP_CHAMBRES.map(function(ch){
    var worst=null;
    var blocks = TEMP_SERVICES.map(function(svc){
      var cur=(dayData[ch.id] && dayData[ch.id][svc]) || {temp:'',visa:''};
      var st=tempStatus(ch, cur.temp);
      if(st && (!worst || TEMP_STATUS_RANK[st]>TEMP_STATUS_RANK[worst])) worst=st;
      var borderColor = st==='conforme' ? 'var(--green-text)' : st==='surveiller' ? 'var(--amber-text)' : st==='nonconforme' ? 'var(--pink-text)' : 'var(--border2)';
      return '<div style="flex:1;min-width:0">'+
        '<div class="rec-label">'+(svc==='matin'?'Matin':'Soir')+'</div>'+
        '<div style="display:flex;gap:4px">'+
          '<input type="number" step="0.1" class="rec-input" style="width:64px;border-color:'+borderColor+'" placeholder="°C" value="'+(cur.temp===''||cur.temp==null?'':cur.temp)+'" oninput="setTempVal(\''+ch.id+'\',\''+svc+'\',\'temp\',this.value)">'+
          '<input type="text" class="rec-input" style="width:56px" placeholder="Visa" value="'+(cur.visa||'').replace(/"/g,'&quot;')+'" oninput="setTempVal(\''+ch.id+'\',\''+svc+'\',\'visa\',this.value)">'+
        '</div></div>';
    }).join('');
    var badge = worst ? '<span class="dlc-badge '+TEMP_STATUS_CLS[worst]+'">'+TEMP_STATUS_LABEL[worst]+'</span>' : '';
    return '<div class="autoc-zone-row" style="flex-direction:column;align-items:stretch;gap:6px;padding:10px 0">'+
      '<div style="display:flex;justify-content:space-between;align-items:center">'+
        '<span style="font-weight:600;font-size:13px">'+ch.label+'</span>'+badge+
      '</div>'+
      '<div style="display:flex;gap:10px">'+blocks+'</div>'+
    '</div>';
  }).join('');
}

// ── Cellule de refroidissement ──
function saveCellule(){
  var produit=document.getElementById('cell-produit').value.trim();
  var visa=document.getElementById('cell-visa').value.trim();
  if(!produit){ alert('Veuillez indiquer la nature du produit'); return; }
  if(!visa){ alert('Veuillez saisir le visa (initiales)'); return; }
  TEMP_DATA.cellule.unshift({
    id: Date.now(),
    date: document.getElementById('cell-date').value || todayStr(),
    produit: produit,
    heureEntree: document.getElementById('cell-heure-entree').value,
    tEntree: document.getElementById('cell-t-entree').value,
    heureSortie: document.getElementById('cell-heure-sortie').value,
    tSortie: document.getElementById('cell-t-sortie').value,
    visa: visa,
    ts: Date.now()
  });
  autocSaveTempData();
  document.getElementById('cell-produit').value='';
  document.getElementById('cell-heure-entree').value='';
  document.getElementById('cell-t-entree').value='';
  document.getElementById('cell-heure-sortie').value='';
  document.getElementById('cell-t-sortie').value='';
  document.getElementById('cell-visa').value='';
  renderCellule();
}
function deleteCellule(id){
  TEMP_DATA.cellule = TEMP_DATA.cellule.filter(function(c){ return c.id!==id; });
  autocSaveTempData();
  renderCellule();
}
// Durée en minutes entre deux heures "HH:MM" (gère le passage de minuit)
function minutesBetween(h1,h2){
  if(!h1||!h2) return null;
  var p1=h1.split(':').map(Number), p2=h2.split(':').map(Number);
  var m1=p1[0]*60+p1[1], m2=p2[0]*60+p2[1];
  var diff=m2-m1; if(diff<0) diff+=24*60;
  return diff;
}
function renderCellule(){
  var list=document.getElementById('cellule-list');
  if(!list) return;
  var entries=TEMP_DATA.cellule||[];
  if(!entries.length){ list.innerHTML='<div class="histo-empty">Aucun refroidissement enregistré</div>'; return; }
  list.innerHTML = entries.map(function(c){
    var mins=minutesBetween(c.heureEntree,c.heureSortie);
    var tSortie=parseFloat(c.tSortie);
    var okTemps = mins==null ? null : mins<=120;
    var okTemp = isNaN(tSortie) ? null : tSortie<=10;
    var conforme = okTemps!==false && okTemp!==false;
    var badge = (okTemps===null&&okTemp===null) ? '' :
      conforme ? '<span class="dlc-badge dlc-badge-green">Conforme</span>' : '<span class="dlc-badge dlc-badge-red">Non conforme</span>';
    return '<div class="dlc-card"><div class="dlc-card-header">'+
      '<div class="dlc-card-left"><div><div class="dlc-card-name">'+c.produit+' · '+c.date+'</div>'+
      '<div class="dlc-card-meta">'+(c.heureEntree||'—')+' ('+(c.tEntree||'—')+'°C) → '+(c.heureSortie||'—')+' ('+(c.tSortie||'—')+'°C)'+(mins!=null?' · '+mins+' min':'')+' · Visa : '+c.visa+'</div></div></div>'+
      badge+
      '</div>'+
      '<div class="dlc-card-actions"><button class="dlc-btn-sm" onclick="deleteCellule('+c.id+')">🗑 Supprimer</button></div>'+
    '</div>';
  }).join('');
}

// ── Vue mensuelle (calendrier) ──
function tempCalPrev(){ tempCalMonth--; if(tempCalMonth<0){tempCalMonth=11;tempCalYear--;} tempRenderCal(); }
function tempCalNext(){ tempCalMonth++; if(tempCalMonth>11){tempCalMonth=0;tempCalYear++;} tempRenderCal(); }

function tempDayWorst(dateStr){
  var dayData=TEMP_DATA.entries[dateStr]||{};
  var filled=0, worst=null;
  TEMP_CHAMBRES.forEach(function(ch){
    TEMP_SERVICES.forEach(function(svc){
      var cur=dayData[ch.id] && dayData[ch.id][svc];
      var v=cur && cur.temp;
      if(v!=='' && v!=null){
        filled++;
        var st=tempStatus(ch, v);
        if(st && (!worst || TEMP_STATUS_RANK[st]>TEMP_STATUS_RANK[worst])) worst=st;
      }
    });
  });
  return {filled:filled, worst:worst};
}

function tempRenderCal(){
  var grid=document.getElementById('temp-cal-grid');
  var label=document.getElementById('temp-cal-label');
  if(!grid) return;
  var months=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  if(label) label.textContent = months[tempCalMonth]+' '+tempCalYear;
  var days=['L','M','M','J','V','S','D'];
  var first=new Date(tempCalYear, tempCalMonth, 1).getDay();
  first = first===0 ? 6 : first-1;
  var total=new Date(tempCalYear, tempCalMonth+1, 0).getDate();
  var totalSlots=TEMP_CHAMBRES.length*TEMP_SERVICES.length;
  var html=days.map(function(d){ return '<div class="rec-cal-day-hdr">'+d+'</div>'; }).join('');
  for(var i=0;i<first;i++) html+='<div></div>';
  for(var d=1; d<=total; d++){
    var dateStr=tempCalYear+'-'+String(tempCalMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var r=tempDayWorst(dateStr);
    var cls='rec-cal-cell';
    if(r.worst==='nonconforme') cls+=' danger';
    else if(r.worst==='surveiller' || (r.filled>0 && r.filled<totalSlots)) cls+=' warn';
    else if(r.filled>0) cls+=' ok';
    html+='<div class="'+cls+'" onclick="document.getElementById(\'temp-date\').value=\''+dateStr+'\';renderTempChambres()">'+d+(r.filled?'<span class="rec-cal-count">'+r.filled+'</span>':'')+'</div>';
  }
  grid.innerHTML=html;
}

function exportTempCSV(){
  var total=new Date(tempCalYear, tempCalMonth+1, 0).getDate();
  var header=['Chambre','Service'];
  for(var d=1; d<=total; d++) header.push(String(d));
  var rows=[];
  TEMP_CHAMBRES.forEach(function(ch){
    TEMP_SERVICES.forEach(function(svc){
      var row=[ch.label, svc==='matin'?'Matin':'Soir'];
      for(var d=1; d<=total; d++){
        var dateStr=tempCalYear+'-'+String(tempCalMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        var dayData=TEMP_DATA.entries[dateStr]||{};
        var cur=dayData[ch.id] && dayData[ch.id][svc];
        row.push(cur && cur.temp!=='' && cur.temp!=null ? cur.temp+(cur.visa?' ('+cur.visa+')':'') : '');
      }
      rows.push(row.map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(','));
    });
  });
  downloadCSV(header.join(',')+'\n'+rows.join('\n'), 'temperatures_'+tempCalYear+'-'+String(tempCalMonth+1).padStart(2,'0')+'.csv');
}

function autocSwitch(name, btn){
  document.querySelectorAll('.autoc-subnav-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('.autoc-sub').forEach(function(s){ s.classList.remove('active'); });
  if(btn) btn.classList.add('active');
  var sub=document.getElementById('autoc-sub-'+name);
  if(sub) sub.classList.add('active');
}

function updateAutocAlertDot(){
  var dot=document.getElementById('autoc-alert-dot');
  if(!dot) return;
  var hasOpen=(ANOM_DATA.entries||[]).some(function(a){ return a.status!=='cloturee'; });
  dot.style.display = hasOpen ? 'block' : 'none';
}

// ══════════════════════════════════════════════════════════════════
// HUILE DE FRITURE
// ══════════════════════════════════════════════════════════════════
function saveHuile(){
  var date=document.getElementById('huile-date').value || todayStr();
  var visa=document.getElementById('huile-visa').value.trim();
  if(!visa){ alert('Veuillez saisir le visa (initiales)'); return; }
  var entry={
    id: Date.now(),
    date: date,
    visa: visa,
    filtrage: document.getElementById('huile-filtrage').value,
    changement: document.getElementById('huile-changement').value,
    indice: document.getElementById('huile-indice').value,
    chrono: document.getElementById('huile-chrono').value,
    note: document.getElementById('huile-note').value.trim(),
    ts: Date.now()
  };
  HUILE_DATA.entries.unshift(entry);
  autocSaveHuileData();
  document.getElementById('huile-visa').value='';
  document.getElementById('huile-note').value='';
  renderHuile();
}

function deleteHuile(id){
  HUILE_DATA.entries = HUILE_DATA.entries.filter(function(e){ return e.id!==id; });
  autocSaveHuileData();
  renderHuile();
}

var HUILE_LABELS = {bon:'🟢 Bon', moyen:'🟡 À surveiller', mauvais:'🔴 Mauvais',
  conforme:'🟢 Conforme', limite:'🟡 Limite', depasse:'🔴 Dépassé'};
var HUILE_BADGE_CLS = {bon:'dlc-badge-green', moyen:'dlc-badge-yellow', mauvais:'dlc-badge-red',
  conforme:'dlc-badge-green', limite:'dlc-badge-yellow', depasse:'dlc-badge-red'};

function renderHuile(){
  var list=document.getElementById('huile-list');
  if(!list) return;
  var entries=HUILE_DATA.entries||[];
  if(!entries.length){ list.innerHTML='<div class="histo-empty">Aucun contrôle enregistré</div>'; return; }
  list.innerHTML = entries.map(function(e){
    return '<div class="dlc-card"><div class="dlc-card-header">'+
      '<div class="dlc-card-left"><div><div class="dlc-card-name">'+e.date+' · '+(e.visa||'—')+'</div>'+
      '<div class="dlc-card-meta">'+
        'Filtrage '+(e.filtrage==='oui'?'✓':'✕')+' · Changement '+(e.changement==='oui'?'✓':'✕')+
        (e.note?' · '+e.note:'')+
      '</div></div></div>'+
      '<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">'+
        '<span class="dlc-badge '+HUILE_BADGE_CLS[e.indice]+'">'+HUILE_LABELS[e.indice]+'</span>'+
        '<span class="dlc-badge '+HUILE_BADGE_CLS[e.chrono]+'">'+HUILE_LABELS[e.chrono]+'</span>'+
      '</div></div>'+
      '<div class="dlc-card-actions"><button class="dlc-btn-sm" onclick="deleteHuile('+e.id+')">🗑 Supprimer</button></div>'+
    '</div>';
  }).join('');
}

function exportHuileCSV(){
  var entries=HUILE_DATA.entries||[];
  if(!entries.length){ alert('Aucun contrôle à exporter'); return; }
  var header='Date,Visa,Filtrage,Indice bandelette,Temps chrono,Changement huile,Observation';
  var rows=entries.map(function(e){
    return [e.date,e.visa,e.filtrage,e.indice,e.chrono,e.changement,e.note]
      .map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(',');
  });
  downloadCSV(header+'\n'+rows.join('\n'), 'controle_huile_friture_'+todayStr()+'.csv');
}

// ══════════════════════════════════════════════════════════════════
// NETTOYAGE (checklist mensuelle par zone)
// ══════════════════════════════════════════════════════════════════
function nettDate(){ var el=document.getElementById('nett-date'); return (el && el.value) || todayStr(); }

function nettToggle(zoneId){
  var date=nettDate();
  if(!NETT_DATA.entries[date]) NETT_DATA.entries[date]={};
  var cur=NETT_DATA.entries[date][zoneId] || {done:false,visa:''};
  cur.done = !cur.done;
  NETT_DATA.entries[date][zoneId]=cur;
  autocSaveNettData();
  renderNettoyage();
  nettRenderCal();
}

function nettSetVisa(zoneId, value){
  var date=nettDate();
  if(!NETT_DATA.entries[date]) NETT_DATA.entries[date]={};
  var cur=NETT_DATA.entries[date][zoneId] || {done:true,visa:''};
  cur.visa=value;
  NETT_DATA.entries[date][zoneId]=cur;
  autocSaveNettData();
}

function addNettZone(){
  var input=document.getElementById('nett-new-zone');
  var label=input.value.trim();
  if(!label) return;
  NETT_DATA.zones.push({id:'z'+Date.now(), label:label});
  autocSaveNettData();
  input.value='';
  renderNettoyage();
}

function removeNettZone(zoneId){
  if(!confirm('Retirer cette zone de la liste ?')) return;
  NETT_DATA.zones = NETT_DATA.zones.filter(function(z){ return z.id!==zoneId; });
  autocSaveNettData();
  renderNettoyage();
  nettRenderCal();
}

function renderNettoyage(){
  var list=document.getElementById('nett-list');
  var prog=document.getElementById('nett-progress');
  if(!list) return;
  var date=nettDate();
  var dayData=NETT_DATA.entries[date]||{};
  var zones=NETT_DATA.zones||[];
  var doneCount=zones.filter(function(z){ return dayData[z.id] && dayData[z.id].done; }).length;
  if(prog) prog.textContent = doneCount+'/'+zones.length+' zones nettoyées';
  list.innerHTML = zones.map(function(z){
    var st=dayData[z.id]||{done:false,visa:''};
    return '<div class="autoc-zone-row">'+
      '<input type="checkbox" class="autoc-zone-check" '+(st.done?'checked':'')+' onchange="nettToggle(\''+z.id+'\')">'+
      '<span class="autoc-zone-label'+(st.done?' done':'')+'">'+z.label+'</span>'+
      (st.done?'<input type="text" class="autoc-zone-visa" placeholder="Visa" value="'+(st.visa||'').replace(/"/g,'&quot;')+'" oninput="nettSetVisa(\''+z.id+'\',this.value)">':'')+
      '<button class="autoc-zone-remove" onclick="removeNettZone(\''+z.id+'\')" title="Retirer la zone">✕</button>'+
    '</div>';
  }).join('');
}

function nettCalPrev(){ nettCalMonth--; if(nettCalMonth<0){nettCalMonth=11;nettCalYear--;} nettRenderCal(); }
function nettCalNext(){ nettCalMonth++; if(nettCalMonth>11){nettCalMonth=0;nettCalYear++;} nettRenderCal(); }

function nettRenderCal(){
  var grid=document.getElementById('nett-cal-grid');
  var label=document.getElementById('nett-cal-label');
  if(!grid) return;
  var months=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  if(label) label.textContent = months[nettCalMonth]+' '+nettCalYear;
  var days=['L','M','M','J','V','S','D'];
  var first=new Date(nettCalYear, nettCalMonth, 1).getDay();
  first = first===0 ? 6 : first-1;
  var total=new Date(nettCalYear, nettCalMonth+1, 0).getDate();
  var zones=NETT_DATA.zones||[];
  var html=days.map(function(d){ return '<div class="rec-cal-day-hdr">'+d+'</div>'; }).join('');
  for(var i=0;i<first;i++) html+='<div></div>';
  for(var d=1; d<=total; d++){
    var dateStr=nettCalYear+'-'+String(nettCalMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var dayData=NETT_DATA.entries[dateStr]||{};
    var doneCount=zones.filter(function(z){ return dayData[z.id] && dayData[z.id].done; }).length;
    var cls='rec-cal-cell';
    if(zones.length && doneCount===zones.length) cls+=' ok';
    else if(doneCount>0) cls+=' warn';
    html+='<div class="'+cls+'" onclick="document.getElementById(\'nett-date\').value=\''+dateStr+'\';renderNettoyage()">'+d+(doneCount?'<span class="rec-cal-count">'+doneCount+'</span>':'')+'</div>';
  }
  grid.innerHTML=html;
}

function exportNettoyageCSV(){
  var zones=NETT_DATA.zones||[];
  if(!zones.length){ alert('Aucune zone définie'); return; }
  var total=new Date(nettCalYear, nettCalMonth+1, 0).getDate();
  var header=['Zone'];
  for(var d=1; d<=total; d++) header.push(String(d));
  var rows=zones.map(function(z){
    var row=[z.label];
    for(var d=1; d<=total; d++){
      var dateStr=nettCalYear+'-'+String(nettCalMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      var st=(NETT_DATA.entries[dateStr]||{})[z.id];
      row.push(st && st.done ? (st.visa||'✓') : '');
    }
    return row.map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(',');
  });
  downloadCSV(header.join(',')+'\n'+rows.join('\n'), 'controle_nettoyage_'+nettCalYear+'-'+String(nettCalMonth+1).padStart(2,'0')+'.csv');
}

// ══════════════════════════════════════════════════════════════════
// ANOMALIES (fiche de non-conformité + suivi des actions correctives)
// ══════════════════════════════════════════════════════════════════
var ANOM_STATUS_LABEL = {ouverte:'🔴 Ouverte', analyse:'🟡 Analyse en cours', action:'🟡 Action en cours', cloturee:'🟢 Clôturée'};

function autocToggleAnomalieForm(){
  var wrap=document.getElementById('anomalie-form-wrap');
  var hidden = wrap.style.display==='none';
  wrap.style.display = hidden ? 'block' : 'none';
  if(hidden){
    document.getElementById('anom-date').value=todayStr();
    document.getElementById('anom-heure').value=nowTime();
  }
}

function saveAnomalie(){
  var desc=document.getElementById('anom-desc').value.trim();
  var visa=document.getElementById('anom-visa').value.trim();
  if(!desc){ alert('Veuillez décrire l\'anomalie constatée'); return; }
  if(!visa){ alert('Veuillez saisir le visa (initiales)'); return; }
  var entry={
    id: Date.now(),
    date: document.getElementById('anom-date').value || todayStr(),
    heure: document.getElementById('anom-heure').value || nowTime(),
    description: desc,
    visa: visa,
    status: 'ouverte',
    steps: {},
    ts: Date.now()
  };
  ANOM_DATA.entries.unshift(entry);
  autocSaveAnomData();
  document.getElementById('anom-desc').value='';
  document.getElementById('anom-visa').value='';
  autocToggleAnomalieForm();
  renderAnomalies();
  updateAutocAlertDot();
}

function deleteAnomalie(id){
  if(!confirm('Supprimer cette fiche d\'anomalie ?')) return;
  ANOM_DATA.entries = ANOM_DATA.entries.filter(function(a){ return a.id!==id; });
  autocSaveAnomData();
  renderAnomalies();
  updateAutocAlertDot();
}

function autocOpenAnomStep(id, step){
  anomUIState[id] = {openStep: step};
  renderAnomalies();
}
function autocCancelAnomStep(id){
  anomUIState[id] = {openStep: null};
  renderAnomalies();
}

// step: 'analyse' | 'action' | 'verif'
function saveAnomStep(id, step){
  var entry = ANOM_DATA.entries.find(function(a){ return a.id===id; });
  if(!entry) return;
  var pfx = 'anomstep-'+id+'-';
  var visaCuisine = (document.getElementById(pfx+'vc')||{}).value || '';
  var visaGest    = (document.getElementById(pfx+'vg')||{}).value || '';
  var texte       = (document.getElementById(pfx+'texte')||{}).value || '';
  if(!visaCuisine.trim()){ alert('Veuillez saisir le visa cuisine'); return; }
  var stepData = {
    date: todayStr(), heure: nowTime(),
    visaCuisine: visaCuisine.trim(), visaGestionnaire: visaGest.trim(),
    texte: texte.trim()
  };
  if(step==='verif'){
    var resultat = (document.getElementById(pfx+'resultat')||{}).value || 'efficace';
    stepData.resultat = resultat;
  }
  entry.steps[step] = stepData;
  entry.status = step==='analyse' ? 'analyse' : step==='action' ? 'action' : 'cloturee';
  autocSaveAnomData();
  anomUIState[id] = {openStep:null};
  renderAnomalies();
  updateAutocAlertDot();
}

function anomStepForm(entry, step, title, withResultat){
  var pfx='anomstep-'+entry.id+'-';
  return '<div class="autoc-step-form">'+
    '<div class="rec-label" style="margin-bottom:8px">'+title+'</div>'+
    '<div class="rec-form-grid" style="padding:0">'+
      '<div class="full"><div class="rec-label">Description / analyse</div><input class="rec-input" type="text" id="'+pfx+'texte" placeholder="Détails…"></div>'+
      (withResultat ? '<div class="full"><div class="rec-label">Résultat</div><select class="rec-input" id="'+pfx+'resultat"><option value="efficace">✓ Action efficace</option><option value="inefficace">✕ Action inefficace — à reprendre</option></select></div>' : '')+
      '<div><div class="rec-label">Visa cuisine</div><input class="rec-input" type="text" id="'+pfx+'vc" placeholder="Initiales"></div>'+
      '<div><div class="rec-label">Visa gestionnaire</div><input class="rec-input" type="text" id="'+pfx+'vg" placeholder="Initiales"></div>'+
    '</div>'+
    '<div style="margin-top:10px;display:flex;gap:8px">'+
      '<button class="btn btn-primary" onclick="saveAnomStep('+entry.id+',\''+step+'\')">✓ Valider</button>'+
      '<button class="btn" onclick="autocCancelAnomStep('+entry.id+')">Annuler</button>'+
    '</div>'+
  '</div>';
}

function stepSummary(label, s){
  if(!s) return '';
  return '<div class="autoc-step-summary"><b>'+label+'</b> — '+s.date+' '+s.heure+
    (s.texte?' · '+s.texte:'')+' · Visa cuisine : <b>'+(s.visaCuisine||'—')+'</b>'+
    (s.visaGestionnaire?' · Visa gestionnaire : <b>'+s.visaGestionnaire+'</b>':'')+
    (s.resultat?' · '+(s.resultat==='efficace'?'✅ Efficace':'❌ Inefficace'):'')+
  '</div>';
}

function renderAnomalies(){
  var list=document.getElementById('anomalie-list');
  if(!list) return;
  var entries=ANOM_DATA.entries||[];
  if(!entries.length){ list.innerHTML='<div class="histo-empty">Aucune anomalie déclarée</div>'; return; }
  list.innerHTML = entries.map(function(a){
    var ui = anomUIState[a.id] || {};
    var html = '<div class="autoc-card">'+
      '<div class="autoc-card-head">'+
        '<div><div class="autoc-card-desc">'+a.description+'</div>'+
        '<div class="autoc-card-meta">'+a.date+' '+a.heure+' · Visa : '+a.visa+'</div></div>'+
        '<span class="autoc-status autoc-status-'+a.status+'">'+ANOM_STATUS_LABEL[a.status]+'</span>'+
      '</div>';

    html += stepSummary('Analyse des causes', a.steps.analyse);
    html += stepSummary('Action corrective', a.steps.action);
    html += stepSummary('Vérification de l\'efficacité', a.steps.verif);

    if(ui.openStep==='analyse') html += anomStepForm(a,'analyse','Traitement de l\'anomalie — analyse des causes', false);
    if(ui.openStep==='action')  html += anomStepForm(a,'action','Action corrective', false);
    if(ui.openStep==='verif')   html += anomStepForm(a,'verif','Vérification de la mise en place et de l\'efficacité', true);

    if(!ui.openStep){
      var actions='';
      if(a.status==='ouverte') actions += '<button class="btn" onclick="autocOpenAnomStep('+a.id+',\'analyse\')">▶ Analyse des causes</button>';
      else if(a.status==='analyse') actions += '<button class="btn" onclick="autocOpenAnomStep('+a.id+',\'action\')">▶ Action corrective</button>';
      else if(a.status==='action') actions += '<button class="btn" onclick="autocOpenAnomStep('+a.id+',\'verif\')">▶ Vérifier l\'efficacité</button>';
      actions += '<button class="dlc-btn-sm" onclick="deleteAnomalie('+a.id+')">🗑 Supprimer</button>';
      html += '<div class="autoc-card-actions">'+actions+'</div>';
    }

    html += '</div>';
    return html;
  }).join('');
}

function exportAnomaliesCSV(){
  var entries=ANOM_DATA.entries||[];
  if(!entries.length){ alert('Aucune anomalie à exporter'); return; }
  var header='Date,Heure,Description,Visa,Statut,Analyse causes,Action corrective,Résultat vérification';
  var rows=entries.map(function(a){
    return [
      a.date, a.heure, a.description, a.visa, ANOM_STATUS_LABEL[a.status]||a.status,
      a.steps.analyse ? a.steps.analyse.texte : '',
      a.steps.action ? a.steps.action.texte : '',
      a.steps.verif ? (a.steps.verif.resultat==='efficace'?'Efficace':'Inefficace') : ''
    ].map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(',');
  });
  downloadCSV(header+'\n'+rows.join('\n'), 'anomalies_'+todayStr()+'.csv');
}

// ── Utilitaire export CSV commun ──
function downloadCSV(csv, filename){
  var blob=new Blob(['﻿'+csv], {type:'text/csv;charset=utf-8'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.click();
}

// ══════════════════════════════════════════════════════════════════
// RÉSUMÉ MENSUEL + DOSSIER DE CONTRÔLE (impression PDF / sauvegarde sur disque)
// ══════════════════════════════════════════════════════════════════

var AUTOC_PRINT_CSS = '*{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#1a1a18;margin:0;padding:10mm}'+
  'h1{font-size:18px;font-weight:900;color:#1a3a5c;margin:0 0 2px}'+
  'h2{font-size:13px;color:#1a3a5c;margin:12px 0 6px;border-bottom:1px solid #1a3a5c;padding-bottom:3px}'+
  '.meta{font-size:9px;color:#888;margin-bottom:10px}'+
  'table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:9px}'+
  'th{background:#1a3a5c;color:#fff;padding:4px 6px;text-align:left;font-weight:700}'+
  'td{padding:3px 6px;border-bottom:.5px solid #eee}'+
  'tr:nth-child(even)td{background:#f5f5f5}'+
  '.alert td{background:#fff0f0!important}'+
  '.ok td{background:#f0fff0!important}'+
  '.summary{display:flex;gap:12px;margin-bottom:10px;flex-wrap:wrap}'+
  '.sum-box{border:1px solid #ccc;border-radius:4px;padding:8px 12px;min-width:120px}'+
  '.sum-label{font-size:8px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:3px}'+
  '.sum-val{font-size:16px;font-weight:800;color:#1a3a5c}'+
  '@media print{@page{size:A4;margin:10mm}body{padding:0}}';

function autocWrapHtmlDoc(title, bodyHtml){
  var dateStr=new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  return '<html><head><meta charset="UTF-8"><title>'+title+'</title><style>'+AUTOC_PRINT_CSS+'</style></head><body>'+
    '<h1>'+title+'</h1><div class="meta">La Salle à Manger · Grenoble — Document généré le '+dateStr+'</div>'+
    bodyHtml+
    '<div style="font-size:8px;color:#aaa;text-align:center;margin-top:16px;border-top:1px solid #eee;padding-top:8px">Document généré automatiquement le '+dateStr+'</div>'+
  '</body></html>';
}

function autocMonthRange(){
  var now=new Date();
  var total=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  var dates=[];
  for(var d=1; d<=total; d++) dates.push(now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'));
  return dates;
}

function autocMonthStats(){
  var dates=autocMonthRange();
  var monthSet={}; dates.forEach(function(d){ monthSet[d]=true; });

  // Températures
  var tempTotal=0, tempSurveil=0, tempNonConf=0;
  dates.forEach(function(ds){
    var dayData=(TEMP_DATA.entries||{})[ds]||{};
    TEMP_CHAMBRES.forEach(function(ch){ TEMP_SERVICES.forEach(function(svc){
      var cur=dayData[ch.id]&&dayData[ch.id][svc]; var v=cur&&cur.temp;
      if(v===''||v==null)return;
      tempTotal++;
      var st=tempStatus(ch,v);
      if(st==='nonconforme')tempNonConf++; else if(st==='surveiller')tempSurveil++;
    });});
  });

  // Huile
  var huileMois=(HUILE_DATA.entries||[]).filter(function(e){ return monthSet[e.date]; });
  var huileChangements=huileMois.filter(function(e){ return e.changement==='oui'; }).length;

  // Nettoyage
  var zones=NETT_DATA.zones||[];
  var nettDone=0, nettTotal=0;
  dates.forEach(function(ds){
    var dayData=(NETT_DATA.entries||{})[ds]||{};
    zones.forEach(function(z){ nettTotal++; if(dayData[z.id]&&dayData[z.id].done) nettDone++; });
  });
  var nettTaux=nettTotal?Math.round(nettDone/nettTotal*100):0;

  // Anomalies
  var anomMois=(ANOM_DATA.entries||[]).filter(function(a){ return monthSet[a.date]; });
  var anomOuvertes=anomMois.filter(function(a){ return a.status!=='cloturee'; }).length;
  var anomCloturees=anomMois.filter(function(a){ return a.status==='cloturee'; }).length;

  return {
    tempTotal:tempTotal, tempSurveil:tempSurveil, tempNonConf:tempNonConf,
    huileCount:huileMois.length, huileChangements:huileChangements,
    nettDone:nettDone, nettTotal:nettTotal, nettTaux:nettTaux,
    anomTotal:anomMois.length, anomOuvertes:anomOuvertes, anomCloturees:anomCloturees,
  };
}

function autocHtmlResume(){
  var s=autocMonthStats();
  var monthLabel=new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  var body='<div class="meta">Synthèse des autocontrôles — '+monthLabel+'</div>';
  body+='<h2>🌡️ Températures chambres froides</h2>';
  body+='<div class="summary">'+
    '<div class="sum-box"><div class="sum-label">Relevés</div><div class="sum-val">'+s.tempTotal+'</div></div>'+
    '<div class="sum-box"><div class="sum-label">🟡 À surveiller</div><div class="sum-val" style="color:#633806">'+s.tempSurveil+'</div></div>'+
    '<div class="sum-box"><div class="sum-label">🔴 Non conformes</div><div class="sum-val" style="color:#cc0000">'+s.tempNonConf+'</div></div>'+
  '</div>';
  body+='<h2>🍟 Huile de friture</h2>';
  body+='<div class="summary">'+
    '<div class="sum-box"><div class="sum-label">Contrôles</div><div class="sum-val">'+s.huileCount+'</div></div>'+
    '<div class="sum-box"><div class="sum-label">Changements d\'huile</div><div class="sum-val">'+s.huileChangements+'</div></div>'+
  '</div>';
  body+='<h2>🧽 Nettoyage</h2>';
  body+='<div class="summary">'+
    '<div class="sum-box"><div class="sum-label">Taux de réalisation</div><div class="sum-val">'+s.nettTaux+'%</div></div>'+
    '<div class="sum-box"><div class="sum-label">Zones × jours nettoyés</div><div class="sum-val">'+s.nettDone+'/'+s.nettTotal+'</div></div>'+
  '</div>';
  body+='<h2>⚠️ Anomalies</h2>';
  body+='<div class="summary">'+
    '<div class="sum-box"><div class="sum-label">Déclarées</div><div class="sum-val">'+s.anomTotal+'</div></div>'+
    '<div class="sum-box"><div class="sum-label">🔴 En cours</div><div class="sum-val" style="color:#cc0000">'+s.anomOuvertes+'</div></div>'+
    '<div class="sum-box"><div class="sum-label">✅ Clôturées</div><div class="sum-val" style="color:#27500a">'+s.anomCloturees+'</div></div>'+
  '</div>';
  return autocWrapHtmlDoc('📊 Résumé mensuel — Autocontrôles HACCP', body);
}

function autocHtmlTemperatures(){
  var dates=autocMonthRange();
  var rows=[];
  dates.forEach(function(ds){
    var dayData=(TEMP_DATA.entries||{})[ds]||{};
    TEMP_CHAMBRES.forEach(function(ch){ TEMP_SERVICES.forEach(function(svc){
      var cur=dayData[ch.id]&&dayData[ch.id][svc]; var v=cur&&cur.temp;
      if(v===''||v==null)return;
      var st=tempStatus(ch,v);
      rows.push('<tr class="'+(st==='nonconforme'?'alert':st==='conforme'?'ok':'')+'"><td>'+new Date(ds).toLocaleDateString('fr-FR')+'</td><td>'+ch.label+'</td><td>'+(svc==='matin'?'Matin':'Soir')+'</td><td style="font-weight:700">'+v+'°C</td><td>'+(cur.visa||'')+'</td><td>'+TEMP_STATUS_LABEL[st]+'</td></tr>');
    });});
  });
  var body='<table><tr><th>Date</th><th>Chambre</th><th>Service</th><th>T°</th><th>Visa</th><th>Statut</th></tr>'+rows.join('')+'</table>';
  if(TEMP_DATA.cellule&&TEMP_DATA.cellule.length){
    body+='<h2>🧊 Cellule de refroidissement</h2><table><tr><th>Date</th><th>Produit</th><th>Entrée</th><th>Sortie</th><th>Visa</th></tr>';
    TEMP_DATA.cellule.forEach(function(c){
      body+='<tr><td>'+c.date+'</td><td>'+c.produit+'</td><td>'+(c.heureEntree||'—')+' ('+(c.tEntree||'—')+'°C)</td><td>'+(c.heureSortie||'—')+' ('+(c.tSortie||'—')+'°C)</td><td>'+c.visa+'</td></tr>';
    });
    body+='</table>';
  }
  return autocWrapHtmlDoc('🌡️ Relevés de températures', body);
}

function autocHtmlHuile(){
  var rows=(HUILE_DATA.entries||[]).map(function(e){
    return '<tr><td>'+e.date+'</td><td>'+e.visa+'</td><td>'+(e.filtrage==='oui'?'✓':'✕')+'</td><td>'+(e.changement==='oui'?'✓':'✕')+'</td><td>'+(HUILE_LABELS[e.indice]||'')+'</td><td>'+(HUILE_LABELS[e.chrono]||'')+'</td><td>'+(e.note||'—')+'</td></tr>';
  }).join('');
  var body='<table><tr><th>Date</th><th>Visa</th><th>Filtrage</th><th>Changement</th><th>Indice</th><th>Temps chrono</th><th>Observation</th></tr>'+rows+'</table>';
  return autocWrapHtmlDoc('🍟 Contrôle huile de friture', body);
}

function autocHtmlNettoyage(){
  var dates=autocMonthRange();
  var zones=NETT_DATA.zones||[];
  var body='<table style="font-size:7px"><tr><th>Zone</th>'+dates.map(function(d){ return '<th>'+parseInt(d.slice(8))+'</th>'; }).join('')+'</tr>';
  zones.forEach(function(z){
    body+='<tr><td style="font-size:8px">'+z.label+'</td>';
    dates.forEach(function(ds){
      var st=(NETT_DATA.entries[ds]||{})[z.id];
      body+='<td style="text-align:center;background:'+(st&&st.done?'#f0fff0':'transparent')+'">'+(st&&st.done?'✓':'')+'</td>';
    });
    body+='</tr>';
  });
  body+='</table>';
  return autocWrapHtmlDoc('🧽 Checklist de nettoyage', body);
}

function autocHtmlAnomalies(){
  var body='';
  (ANOM_DATA.entries||[]).forEach(function(a){
    body+='<p style="font-weight:700;font-size:11px;margin:8px 0 2px">'+a.date+' '+a.heure+' — '+a.description+' <span style="font-weight:400;color:#888">('+ANOM_STATUS_LABEL[a.status]+')</span></p>';
    body+='<table><tr><th>Étape</th><th>Date</th><th>Détail</th><th>Visa cuisine</th><th>Visa gestionnaire</th></tr>';
    body+='<tr><td>Déclaration</td><td>'+a.date+' '+a.heure+'</td><td>'+a.description+'</td><td>'+a.visa+'</td><td>—</td></tr>';
    ['analyse','action','verif'].forEach(function(step){
      var s=a.steps[step]; if(!s)return;
      var label=step==='analyse'?'Analyse des causes':step==='action'?'Action corrective':'Vérification efficacité';
      body+='<tr><td>'+label+'</td><td>'+s.date+' '+s.heure+'</td><td>'+(s.texte||(s.resultat==='efficace'?'Efficace':s.resultat==='inefficace'?'Inefficace':''))+'</td><td>'+(s.visaCuisine||'—')+'</td><td>'+(s.visaGestionnaire||'—')+'</td></tr>';
    });
    body+='</table>';
  });
  if(!(ANOM_DATA.entries||[]).length) body='<div class="meta">Aucune anomalie déclarée.</div>';
  return autocWrapHtmlDoc('⚠️ Anomalies & actions correctives', body);
}

// Ouvre le résumé mensuel dans un nouvel onglet, prêt à imprimer (Ctrl+P → Enregistrer en PDF)
function genererResumeMensuel(){
  if(typeof openHtmlInNewTab==='function') openHtmlInNewTab(autocHtmlResume());
  else window.open('data:text/html;charset=utf-8,'+encodeURIComponent(autocHtmlResume()));
}

function autocDownloadHtml(filename, html){
  var blob=new Blob([html], {type:'text/html;charset=utf-8'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.click();
}

// Crée (ou réutilise) un dossier sur le disque et y enregistre le résumé + les 4 fiches,
// prêtes à imprimer, pour présentation lors d'un contrôle sanitaire.
async function ouvrirDossierControle(){
  var fb=document.getElementById('dossier-feedback');
  var stamp=todayStr();
  var files={
    '00_Resume_mensuel.html': autocHtmlResume(),
    '01_Temperatures.html': autocHtmlTemperatures(),
    '02_Huile_friture.html': autocHtmlHuile(),
    '03_Nettoyage.html': autocHtmlNettoyage(),
    '04_Anomalies.html': autocHtmlAnomalies(),
  };
  var folderName='Dossier_HACCP_'+stamp;

  if(window.showDirectoryPicker){
    try{
      var parent=await window.showDirectoryPicker({mode:'readwrite'});
      var folder=await parent.getDirectoryHandle(folderName, {create:true});
      for(var name in files){
        var handle=await folder.getFileHandle(name, {create:true});
        var writable=await handle.createWritable();
        await writable.write(files[name]);
        await writable.close();
      }
      if(fb){
        fb.style.display='block';
        fb.className='autoc-dossier-feedback ok';
        fb.innerHTML='✅ Dossier « '+folderName+' » créé avec 5 fichiers (résumé + 4 fiches). Ouvrez-les dans votre navigateur pour les consulter ou les imprimer en PDF (Ctrl+P → Enregistrer en PDF).';
      }
      return;
    }catch(e){
      if(e && e.name==='AbortError') return; // annulé par l'utilisateur
      console.warn('[DOSSIER] showDirectoryPicker:', e.message);
      // on retombe sur le téléchargement individuel ci-dessous
    }
  }

  // Fallback (Safari/Firefox, ou erreur) : téléchargement individuel des 5 fichiers
  for(var name2 in files){ autocDownloadHtml(name2, files[name2]); }
  if(fb){
    fb.style.display='block';
    fb.className='autoc-dossier-feedback';
    fb.innerHTML='📥 5 fichiers téléchargés (résumé + 4 fiches) — regroupez-les dans un dossier '+folderName+' sur votre disque.';
  }
}
