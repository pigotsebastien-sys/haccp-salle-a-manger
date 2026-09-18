// ---------------------------------------------------------------------------
// Données de référence
// ---------------------------------------------------------------------------
// DEFAULT_CODES défini dans le script principal

// DEFAULT_SUPPLIERS défini dans le script principal

// SEED_INVOICES défini dans le script principal

// TAUX_OPTIONS défini dans le script principal

// PIE_COLORS défini dans le script principal

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function eur(n){ const v=Number.isFinite(n)?n:0; return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(v); }
function monthKey(d){ return d?d.slice(0,7):""; }
function monthLabel(key){
  if(!key) return "";
  const [y,m]=key.split("-");
  const d=new Date(Number(y), Number(m)-1, 1);
  const label=d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  return label.charAt(0).toUpperCase()+label.slice(1);
}
function computeLine(inv){
  const ht=Number(inv.ht)||0, taux=Number(inv.taux)||0;
  const tva=Math.round(ht*(taux/100)*100)/100;
  const ttc=Math.round((ht+tva)*100)/100;
  return {ht,tva,ttc};
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------
const App = {
  invoices: [], suppliers: [], codes: [], apiKey: "",
  tab: "dashboard", selectedMonth: "", ledgerCodeFilter: "",
  entryMode: "manual", editingInvoiceId: null,
  scan: { previewUrl:"", loading:false, error:"", note:"", common:null, lines:[] },
  toastMsg: null, toastTimer: null,

  init(){
    try { this.invoices = JSON.parse(localStorage.getItem("ca_invoices")) || SEED_INVOICES.slice(); }
    catch(e){ this.invoices = SEED_INVOICES.slice(); }
    try { this.suppliers = JSON.parse(localStorage.getItem("ca_suppliers")) || DEFAULT_SUPPLIERS.slice(); }
    catch(e){ this.suppliers = DEFAULT_SUPPLIERS.slice(); }
    try { this.codes = JSON.parse(localStorage.getItem("ca_codes")) || DEFAULT_CODES.slice(); }
    catch(e){ this.codes = DEFAULT_CODES.slice(); }
    this.apiKey = localStorage.getItem("ca_api_key") || "";
    const months = Array.from(new Set(this.invoices.map(i=>monthKey(i.date)))).sort();
    this.selectedMonth = months.length ? months[months.length-1] : "";
    this.saveAll();
    this.render();
  },
  saveInvoices(){ localStorage.setItem("ca_invoices", JSON.stringify(this.invoices)); },
  saveSuppliers(){ localStorage.setItem("ca_suppliers", JSON.stringify(this.suppliers)); },
  saveCodes(){ localStorage.setItem("ca_codes", JSON.stringify(this.codes)); },
  saveAll(){ this.saveInvoices(); this.saveSuppliers(); this.saveCodes(); },

  toast(msg, type){
    this.toastMsg = {msg, type: type||"success"};
    this.renderToast();
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(()=>{ this.toastMsg=null; this.renderToast(); }, 2600);
  },
  renderToast(){
    const el = document.getElementById("toast-holder");
    if(!el) return;
    if(!this.toastMsg){ el.innerHTML=""; return; }
    el.innerHTML = `<div class="toast ${this.toastMsg.type==='error'?'error':''}">${esc(this.toastMsg.msg)}</div>`;
  },

  months(){ return Array.from(new Set(this.invoices.map(i=>monthKey(i.date)))).sort(); },
  filteredInvoices(){
    let list = this.invoices;
    if (this.selectedMonth) list = list.filter(i=>monthKey(i.date)===this.selectedMonth);
    return list;
  },
  totals(list){
    let ht=0,tva=0,ttc=0;
    list.forEach(i=>{ const c=computeLine(i); ht+=c.ht; tva+=c.tva; ttc+=c.ttc; });
    return {ht,tva,ttc,count:list.length};
  },
  byCode(list){
    const map={};
    list.forEach(i=>{ const c=computeLine(i); map[i.code]=(map[i.code]||0)+c.ht; });
    return Object.entries(map).map(([code,ht])=>({code,ht,libelle:(this.codes.find(c=>c.code===code)||{}).libelle||code})).sort((a,b)=>b.ht-a.ht);
  },
  bySupplier(list){
    const map={};
    list.forEach(i=>{ const c=computeLine(i); map[i.fournisseur]=(map[i.fournisseur]||0)+c.ht; });
    return Object.entries(map).map(([nom,ht])=>({nom,ht})).sort((a,b)=>b.ht-a.ht);
  },

  setTab(t){ this.tab=t; this.render(); },
  setMonth(v){ this.selectedMonth=v; this.render(); },
  setLedgerFilter(v){ this.ledgerCodeFilter=v; this.render(); },
  setEntryMode(m){ this.entryMode=m; this.resetScan(); this.render(); },

  // ---- Factures ----
  addInvoiceFromForm(prefix){
    const date = document.getElementById(prefix+"-date").value;
    const fournisseur = document.getElementById(prefix+"-fournisseur").value;
    const bl = document.getElementById(prefix+"-bl").value.trim();
    const ht = Number(document.getElementById(prefix+"-ht").value);
    const taux = Number(document.getElementById(prefix+"-taux").value);
    const code = document.getElementById(prefix+"-code").value;
    const errEl = document.getElementById(prefix+"-error");
    if(!date){ errEl.textContent="La date est obligatoire."; return; }
    if(!fournisseur){ errEl.textContent="Le fournisseur est obligatoire."; return; }
    if(!code){ errEl.textContent="Le code de ventilation est obligatoire."; return; }
    if(!Number.isFinite(ht) || ht<=0){ errEl.textContent="Le montant HT doit être un nombre supérieur à 0."; return; }
    if(this.editingInvoiceId){
      this.invoices = this.invoices.map(i=> i.id===this.editingInvoiceId ? {...i,date,fournisseur,bl,ht,taux,code} : i);
      this.editingInvoiceId = null;
      this.toast("Facture mise à jour.");
    } else {
      this.invoices.push({id:uid(),date,fournisseur,bl,ht,taux,code});
      this.toast("Facture enregistrée.");
    }
    this.saveInvoices();
    this.render();
  },
  editInvoice(id){ this.editingInvoiceId = id; this.render(); },
  cancelEdit(){ this.editingInvoiceId = null; this.render(); },
  deleteInvoice(id){
    if(!confirm("Supprimer cette facture ?")) return;
    this.invoices = this.invoices.filter(i=>i.id!==id);
    this.saveInvoices();
    this.toast("Facture supprimée.");
    this.render();
  },
  onSupplierPick(prefix){
    const sel = document.getElementById(prefix+"-fournisseur").value;
    const sup = this.suppliers.find(s=>s.nom===sel);
    if(sup){
      document.getElementById(prefix+"-code").value = sup.code;
      const c = this.codes.find(c=>c.code===sup.code);
      if(c) document.getElementById(prefix+"-taux").value = c.taux;
    }
  },
  onCodePick(prefix){
    const code = document.getElementById(prefix+"-code").value;
    const c = this.codes.find(c=>c.code===code);
    if(c) document.getElementById(prefix+"-taux").value = c.taux;
  },

  // ---- Fournisseurs ----
  addSupplier(){
    const nom = document.getElementById("new-sup-nom").value.trim();
    const code = document.getElementById("new-sup-code").value;
    if(!nom){ this.toast("Nom de fournisseur requis.","error"); return; }
    this.suppliers.push({id:uid(), nom, code: code||this.codes[0].code});
    this.saveSuppliers();
    this.toast("Fournisseur ajouté.");
    this.render();
  },
  deleteSupplier(id){
    const sup = this.suppliers.find(s=>s.id===id);
    const used = this.invoices.some(i=>i.fournisseur===(sup&&sup.nom));
    if(used){ this.toast("Impossible : ce fournisseur a des factures enregistrées.","error"); return; }
    this.suppliers = this.suppliers.filter(s=>s.id!==id);
    this.saveSuppliers();
    this.toast("Fournisseur supprimé.");
    this.render();
  },
  updateSupplierCode(id, code){
    this.suppliers = this.suppliers.map(s=> s.id===id ? {...s, code} : s);
    this.saveSuppliers();
  },

  // ---- Plan de ventilation ----
  addCode(){
    const code = document.getElementById("new-code-code").value.trim();
    const libelle = document.getElementById("new-code-libelle").value.trim();
    const taux = Number(document.getElementById("new-code-taux").value);
    const compteTva = document.getElementById("new-code-compteTva").value.trim() || "445660";
    if(!code || !libelle){ this.toast("Code et libellé requis.","error"); return; }
    if(this.codes.some(c=>c.code===code)){ this.toast("Ce code existe déjà.","error"); return; }
    this.codes.push({code, libelle, taux, compteTva});
    this.saveCodes();
    this.toast("Code ajouté au plan de ventilation.");
    this.render();
  },
  deleteCode(code){
    const used = this.invoices.some(i=>i.code===code) || this.suppliers.some(s=>s.code===code);
    if(used){ this.toast("Impossible : ce code est utilisé par des factures ou fournisseurs.","error"); return; }
    this.codes = this.codes.filter(c=>c.code!==code);
    this.saveCodes();
    this.toast("Code supprimé.");
    this.render();
  },

  // ---- Réglages / clé API ----
  saveApiKey(){
    const key = document.getElementById("api-key-input").value.trim();
    this.apiKey = key;
    localStorage.setItem("ca_api_key", key);
    this.toast(key ? "Clé API enregistrée dans ce navigateur." : "Clé API effacée.");
    this.render();
  },

  // ---- Scan ----
  resetScan(){
    if(this.scan.previewUrl) URL.revokeObjectURL(this.scan.previewUrl);
    this.scan = { previewUrl:"", loading:false, error:"", note:"", common:null, lines:[] };
  },
  onScanFile(input){
    const file = input.files && input.files[0];
    input.value = "";
    if(!file) return;
    this.resetScan();
    if(file.type.startsWith("image/")) this.scan.previewUrl = URL.createObjectURL(file);
    this.analyzeInvoiceFile(file);
  },
  fileToBase64(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = ()=> resolve(String(r.result).split(",")[1]||"");
      r.onerror = ()=> reject(new Error("Lecture du fichier impossible."));
      r.readAsDataURL(file);
    });
  },
  resizeImageFile(file, maxDim){
    const limit = maxDim||1600;
    return new Promise((resolve,reject)=>{
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = ()=>{
        let {width,height} = img;
        if(width>limit||height>limit){ const s=limit/Math.max(width,height); width=Math.round(width*s); height=Math.round(height*s); }
        const canvas=document.createElement("canvas"); canvas.width=width; canvas.height=height;
        canvas.getContext("2d").drawImage(img,0,0,width,height);
        URL.revokeObjectURL(url);
        canvas.toBlob(b=> b?resolve(b):reject(new Error("Conversion image impossible.")), "image/jpeg", 0.87);
      };
      img.onerror = ()=>{ URL.revokeObjectURL(url); reject(new Error("Image illisible.")); };
      img.src = url;
    });
  },
  matchOrCreateSupplier(rawName){
    const name = (rawName||"").trim();
    if(!name) return {supplier:null, isNew:false};
    const lower = name.toLowerCase();
    let found = this.suppliers.find(s=>s.nom.toLowerCase()===lower);
    if(!found) found = this.suppliers.find(s=>lower.includes(s.nom.toLowerCase())||s.nom.toLowerCase().includes(lower));
    if(found) return {supplier:found, isNew:false};
    const created = {id:uid(), nom:name, code:this.codes[0].code};
    this.suppliers.push(created);
    this.saveSuppliers();
    return {supplier:created, isNew:true};
  },
  async analyzeInvoiceFile(file){
    // Clé API gérée par Supabase Edge Function
    this.scan.loading = true; this.scan.error=""; this.scan.note=""; this.scan.common=null; this.scan.lines=[];
    this.render();
    try{
      const isPdf = file.type === "application/pdf";
      let base64, contentBlock;
      if(isPdf){
        base64 = await this.fileToBase64(file);
        contentBlock = { type:"document", source:{ type:"base64", media_type:"application/pdf", data:base64 } };
      } else {
        const resized = await this.resizeImageFile(file);
        base64 = await this.fileToBase64(resized);
        contentBlock = { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:base64 } };
      }
      const codesListText = this.codes.map(c=>`${c.code} = ${c.libelle}`).join("\n");
      const systemPrompt = "Tu es un assistant comptable qui ventile les factures fournisseurs d'un restaurant selon le plan de ventilation suivant (code = libellé) :\n"+codesListText+
        "\n\nAnalyse la facture fournie (photo ou PDF) et découpe son montant en une ou plusieurs lignes de ventilation, une ligne par catégorie de produits réellement présente sur la facture. Pour chaque ligne, choisis le code EXACTEMENT parmi la liste ci-dessus, sans en inventer un nouveau. Si un seul type de produit est présent, renvoie une seule ligne. Réponds UNIQUEMENT avec un objet JSON valide, sans texte ni balises markdown, au format exact :\n"+
        '{"date":"AAAA-MM-JJ","fournisseur":"...","numero_bl":"...","lignes":[{"code":"...","montant_ht":0.00,"taux_tva":0}]}\n'+
        "Les taux de TVA possibles sont 0, 5.5, 10 ou 20. Si une information est illisible ou absente, mets null.";

      const resp = await fetch("https://pbydidazdjqqihkolzgc.supabase.co/functions/v1/scan-facture", {
        method:"POST",
        headers:{"content-type":"application/json"},
        body: JSON.stringify({ base64: base64, media_type: isPdf ? "application/pdf" : (file.type || "image/jpeg") })
      });
      if(!resp.ok){
        const errBody = await resp.text().catch(()=> "");
        throw new Error("Le service d’analyse a répondu une erreur ("+resp.status+"). "+(errBody? "Vérifiez votre clé API." : ""));
      }
      const data = await resp.json();
      if(data.error) throw new Error('Erreur analyse : ' + data.error);
      // Edge Function renvoie JSON direct {date, fournisseur, lignes}
      // Compatibilite ancien format {content:[{type:"text",...}]}
      let parsed = data;
      if(data.content && Array.isArray(data.content)) {
        const textBlock = data.content.find(b=>b.type==="text");
        if(!textBlock || !textBlock.text) throw new Error("Aucune donnée exploitable retournée.");
        const cleaned = textBlock.text.replace(/```json|```/g,"").trim();
        parsed = JSON.parse(cleaned);
      }
      if(!parsed || (!parsed.lignes && !parsed.date)) throw new Error("Réponse inattendue — réessayez.");

      const dateOk = typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date);
      const {supplier, isNew} = this.matchOrCreateSupplier(parsed.fournisseur);
      const fallbackCode = this.codes.find(c=>/autre/i.test(c.libelle)) || this.codes[0];
      const rawLines = Array.isArray(parsed.lignes) ? parsed.lignes : [];
      let lines = rawLines.map(l=>{
        const codeMatch = this.codes.find(c=>c.code===l.code);
        const ht = Number(l.montant_ht);
        const rawTaux = Number(l.taux_tva);
        const base = Number.isFinite(rawTaux)?rawTaux:0;
        const taux = TAUX_OPTIONS.reduce((best,t)=> Math.abs(t-base)<Math.abs(best-base)?t:best, TAUX_OPTIONS[0]);
        return { id:uid(), code: codeMatch? codeMatch.code : (fallbackCode?fallbackCode.code:this.codes[0].code), ht: (Number.isFinite(ht)&&ht>0)?ht:"", taux };
      });
      if(lines.length===0) lines=[{id:uid(), code: supplier?supplier.code:(fallbackCode?fallbackCode.code:this.codes[0].code), ht:"", taux:0}];

      this.scan.common = { date: dateOk?parsed.date:new Date().toISOString().slice(0,10), fournisseur: supplier?supplier.nom:"", bl: parsed.numero_bl||"" };
      this.scan.lines = lines;

      const notes=[];
      if(!dateOk) notes.push("date non reconnue (à corriger)");
      if(lines.some(l=>l.ht==="")) notes.push("un ou plusieurs montants non reconnus (à saisir)");
      if(lines.length>1) notes.push(`facture ventilée automatiquement sur ${lines.length} codes, à vérifier`);
      if(isNew && supplier) notes.push(`nouveau fournisseur « ${supplier.nom} » ajouté automatiquement`);
      this.scan.note = notes.length? notes.join(" · ") : "Facture analysée. Vérifiez les champs avant d’enregistrer.";
      this.toast(notes.length? "Extraction partielle : vérifiez les champs." : "Facture analysée et ventilée.", notes.length?"error":"success");
    } catch(e){
      this.scan.error = e.message || "Échec de l’analyse de la facture.";
      this.scan.loading = false;
      this.render(); // Afficher l'erreur immédiatement
    } finally {
      this.scan.loading = false;
      this.render();
    }
  },
  scanAddLine(){
    // sync current DOM values into state first
    this.syncScanLinesFromDom();
    this.scan.lines.push({id:uid(), code:this.codes[0].code, ht:"", taux:this.codes[0].taux});
    this.render();
  },
  scanRemoveLine(id){
    this.syncScanLinesFromDom();
    this.scan.lines = this.scan.lines.filter(l=>l.id!==id);
    this.render();
  },
  scanCodeChange(id, code){
    this.syncScanLinesFromDom();
    const c = this.codes.find(c=>c.code===code);
    this.scan.lines = this.scan.lines.map(l=> l.id===id ? {...l, code, taux: c?c.taux:l.taux} : l);
    this.render();
  },
  syncScanLinesFromDom(){
    this.scan.lines = this.scan.lines.map(l=>{
      const codeEl = document.getElementById("scan-line-code-"+l.id);
      const htEl = document.getElementById("scan-line-ht-"+l.id);
      const tauxEl = document.getElementById("scan-line-taux-"+l.id);
      return {
        id: l.id,
        code: codeEl ? codeEl.value : l.code,
        ht: htEl ? htEl.value : l.ht,
        taux: tauxEl ? Number(tauxEl.value) : l.taux,
      };
    });
  },
  submitScan(){
    this.syncScanLinesFromDom();
    const date = document.getElementById("scan-common-date").value;
    const fournisseur = document.getElementById("scan-common-fournisseur").value;
    const bl = document.getElementById("scan-common-bl").value.trim();
    const errEl = document.getElementById("scan-error");
    if(!date){ errEl.textContent="La date est obligatoire."; return; }
    if(!fournisseur){ errEl.textContent="Le fournisseur est obligatoire."; return; }
    if(this.scan.lines.length===0){ errEl.textContent="Ajoutez au moins une ligne de ventilation."; return; }
    for(const l of this.scan.lines){
      const htNum = Number(l.ht);
      if(!l.code){ errEl.textContent="Chaque ligne doit avoir un code."; return; }
      if(!Number.isFinite(htNum) || htNum<=0){ errEl.textContent="Chaque ligne doit avoir un montant HT valide."; return; }
    }
    errEl.textContent = "";
    const factureId = uid();
    const records = this.scan.lines.map(l=>({ id:uid(), factureId, date, fournisseur, bl, ht:Number(l.ht), taux:Number(l.taux)||0, code:l.code }));
    this.invoices.push(...records);
    this.saveInvoices();
    this.toast(records.length>1 ? `Facture ventilée sur ${records.length} codes et enregistrée.` : "Facture enregistrée.");
    this.resetScan();
    this.render();
  },

  // ---- Export Excel ----
  exportExcel(){
    const rows = this.invoices.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(i=>{
      const c = computeLine(i);
      const acc = this.codes.find(cc=>cc.code===i.code);
      return { Date:i.date, Mois:monthLabel(monthKey(i.date)), Fournisseur:i.fournisseur, "N° BL":i.bl||"", Code:i.code,
        Compte: acc?acc.libelle:"", "Taux TVA": i.taux+"%", HT:c.ht, TVA:c.tva, "Compte TVA": acc?(acc.compteTva||""):"", TTC:c.ttc };
    });
    const wsLedger = XLSX.utils.json_to_sheet(rows);
    wsLedger["!cols"] = [{wch:11},{wch:16},{wch:26},{wch:12},{wch:8},{wch:36},{wch:9},{wch:10},{wch:10},{wch:11},{wch:10}];

    const pivotMap={};
    this.invoices.forEach(i=>{ const m=monthLabel(monthKey(i.date)); const c=computeLine(i); pivotMap[i.code]=pivotMap[i.code]||{}; pivotMap[i.code][m]=(pivotMap[i.code][m]||0)+c.ht; });
    const monthCols = Array.from(new Set(this.invoices.map(i=>monthLabel(monthKey(i.date)))));
    const pivotRows = Object.entries(pivotMap).map(([code,byMonth])=>{
      const acc=this.codes.find(cc=>cc.code===code); const row={Code:code, Compte:acc?acc.libelle:""}; let total=0;
      monthCols.forEach(m=>{ const v=Math.round((byMonth[m]||0)*100)/100; row[m]=v; total+=v; });
      row["Total"]=Math.round(total*100)/100; return row;
    });
    const wsPivot = XLSX.utils.json_to_sheet(pivotRows);

    const supplierMap={};
    this.invoices.forEach(i=>{ const m=monthLabel(monthKey(i.date)); const c=computeLine(i); supplierMap[i.fournisseur]=supplierMap[i.fournisseur]||{}; supplierMap[i.fournisseur][m]=(supplierMap[i.fournisseur][m]||0)+c.ht; });
    const supplierRows = Object.entries(supplierMap).map(([nom,byMonth])=>{
      const row={Fournisseur:nom}; let total=0;
      monthCols.forEach(m=>{ const v=Math.round((byMonth[m]||0)*100)/100; row[m]=v; total+=v; });
      row["Total"]=Math.round(total*100)/100; return row;
    });
    const wsSupplier = XLSX.utils.json_to_sheet(supplierRows);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsLedger, "Cahier d'achat");
    XLSX.utils.book_append_sheet(wb, wsPivot, "Synthese par code");
    XLSX.utils.book_append_sheet(wb, wsSupplier, "Synthese fournisseur");
    XLSX.writeFile(wb, `Cahier_Achat_${this.selectedMonth||"complet"}.xlsx`);
    this.toast("Export Excel généré.");
  },

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------
  invoiceFormHtml(prefix, initial){
    const v = initial || { date:new Date().toISOString().slice(0,10), fournisseur:this.suppliers[0]?this.suppliers[0].nom:"", bl:"", ht:"", taux:this.codes[0]?this.codes[0].taux:0, code:this.suppliers[0]?this.suppliers[0].code:(this.codes[0]?this.codes[0].code:"") };
    return `
      <div class="row">
        <label class="field"><span class="label">Date de facture</span>
          <input type="date" id="${prefix}-date" value="${esc(v.date)}"></label>
        <label class="field"><span class="label">Fournisseur</span>
          <select id="${prefix}-fournisseur" onchange="CaApp.onSupplierPick('${prefix}')">
            ${this.suppliers.map(s=>`<option value="${esc(s.nom)}" ${s.nom===v.fournisseur?'selected':''}>${esc(s.nom)}</option>`).join("")}
          </select></label>
        <label class="field"><span class="label">N° BL / facture</span><span class="hint">facultatif</span>
          <input type="text" id="${prefix}-bl" value="${esc(v.bl)}" placeholder="BL-00214"></label>
      </div>
      <div class="row">
        <label class="field"><span class="label">Montant HT (€)</span>
          <input type="number" step="0.01" min="0" id="${prefix}-ht" value="${esc(v.ht)}" placeholder="0.00"></label>
        <label class="field"><span class="label">Taux de TVA</span>
          <select id="${prefix}-taux">
            ${TAUX_OPTIONS.map(t=>`<option value="${t}" ${t===v.taux?'selected':''}>${t}%</option>`).join("")}
          </select></label>
        <label class="field"><span class="label">Code de ventilation</span>
          <select id="${prefix}-code" onchange="CaApp.onCodePick('${prefix}')">
            ${this.codes.map(c=>`<option value="${esc(c.code)}" ${c.code===v.code?'selected':''}>${esc(c.code)} — ${esc(c.libelle)}</option>`).join("")}
          </select></label>
      </div>
      <div id="${prefix}-error" class="error-text" style="margin-bottom:10px;"></div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-primary" onclick="CaApp.addInvoiceFromForm('${prefix}')">✓ ${initial?'Mettre à jour':'Enregistrer la facture'}</button>
        ${initial?`<button class="btn btn-ghost" onclick="CaApp.cancelEdit()">Annuler</button>`:''}
      </div>`;
  },

  renderDashboard(){
    const list = this.filteredInvoices();
    const t = this.totals(list);
    const byCode = this.byCode(list);
    const bySupplier = this.bySupplier(list);
    const maxHt = Math.max(1, ...byCode.map(c=>c.ht));
    const supTotal = bySupplier.reduce((s,x)=>s+x.ht,0)||1;
    if(list.length===0){
      return `<div class="empty card">Aucune facture pour cette période. Ajoutez-en depuis l’onglet Saisie facture.</div>`;
    }
    return `
      <div class="row" style="margin-bottom:8px;">
        <div class="kpi"><div class="label">Total HT</div><div class="value">${eur(t.ht)}</div><div class="muted" style="font-size:12px;margin-top:4px;">${t.count} facture${t.count>1?'s':''}</div></div>
        <div class="kpi"><div class="label">Total TVA</div><div class="value">${eur(t.tva)}</div></div>
        <div class="kpi"><div class="label">Net à payer (TTC)</div><div class="value">${eur(t.ttc)}</div></div>
        <div class="kpi"><div class="label">Fournisseurs actifs</div><div class="value">${bySupplier.length}</div></div>
      </div>
      <div class="row">
        <div class="card" style="flex:1 1 380px;">
          <div style="font-size:13px;font-weight:600;margin-bottom:12px;">Répartition par code de ventilation (HT)</div>
          ${byCode.map(c=>`
            <div class="bar-row">
              <div class="top"><span>${esc(c.code)} — ${esc(c.libelle)}</span><span>${eur(c.ht)}</span></div>
              <div class="bar-track"><div class="bar-fill" style="width:${(c.ht/maxHt*100).toFixed(1)}%"></div></div>
            </div>`).join("")}
        </div>
        <div class="card" style="flex:1 1 280px;">
          <div style="font-size:13px;font-weight:600;margin-bottom:12px;">Répartition par fournisseur (HT)</div>
          ${bySupplier.map((s,idx)=>`
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:6px 0;border-bottom:1px solid #f0ece0;">
              <span><span class="dot" style="background:${PIE_COLORS[idx%PIE_COLORS.length]}"></span>${esc(s.nom)}</span>
              <span class="muted">${eur(s.ht)} · ${(s.ht/supTotal*100).toFixed(0)}%</span>
            </div>`).join("")}
        </div>
      </div>`;
  },

  renderSaisie(){
    let html = `<div style="max-width:760px;">
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <button class="btn ${this.entryMode==='manual'?'btn-primary':'btn-ghost'}" onclick="CaApp.setEntryMode('manual')">✎ Saisie manuelle</button>
        <button class="btn ${this.entryMode==='scan'?'btn-primary':'btn-ghost'}" onclick="CaApp.setEntryMode('scan')">📷 Scanner une facture</button>
      </div>`;
    if(this.entryMode==='manual'){
      html += `<div class="card"><div style="font-size:14px;font-weight:600;margin-bottom:16px;">Nouvelle facture</div>${this.invoiceFormHtml('manual', null)}</div>`;
    } else {
      html += this.renderScanPanel();
    }
    html += `</div>`;
    return html;
  },

  renderScanPanel(){
    const s = this.scan;
    let apiKeyBox = `
      <div class="card" style="margin-bottom:16px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Clé API Anthropic</div>
        <div style="font-size:12px;color:#8a8478;margin-bottom:10px;">Nécessaire pour la lecture automatique des factures depuis ce fichier ouvert hors de Claude. Obtenez une clé sur <a href="https://console.anthropic.com/settings/keys" target="_blank">console.anthropic.com</a>. Elle est stockée uniquement dans ce navigateur.</div>
        <div style="display:flex;gap:8px;">
          <input type="password" id="api-key-input" placeholder="sk-ant-..." value="${esc(this.apiKey)}" style="flex:1;">
          <button class="btn btn-ghost" onclick="CaApp.saveApiKey()">Enregistrer</button>
        </div>
      </div>`;

    let body = "";
    if(!s.common && !s.loading){
      body = `<div class="card">
        <div style="font-size:14px;font-weight:600;margin-bottom:6px;">Scanner une facture</div>
        <div style="font-size:12.5px;color:#8a8478;margin-bottom:16px;">Prenez une photo ou importez un fichier (image ou PDF). Les montants seront extraits et ventilés automatiquement — vous pourrez les vérifier avant d’enregistrer.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <label class="btn btn-primary" style="cursor:pointer;">📷 Prendre une photo
            <input type="file" accept="image/*" capture="environment" onchange="CaApp.onScanFile(this)" style="display:none;"></label>
          <label class="btn btn-ghost" style="cursor:pointer;">⬆ Importer un fichier
            <input type="file" accept="image/*,application/pdf" onchange="CaApp.onScanFile(this)" style="display:none;"></label>
        </div>
        ${s.error?`<div class="error-text" style="margin-top:16px;">⚠ ${esc(s.error)}</div>`:''}
      </div>`;
    } else if(s.loading){
      body = `<div class="card" style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px 0;color:#8a8478;">
        <div class="spin" style="font-size:22px;">⏳</div>
        <div style="font-size:13px;">Analyse de la facture en cours…</div>
      </div>`;
    } else if(s.common){
      const totals = s.lines.reduce((acc,l)=>{ const c=computeLine(l); return {ht:acc.ht+c.ht, tva:acc.tva+c.tva, ttc:acc.ttc+c.ttc}; }, {ht:0,tva:0,ttc:0});
      const supplierOptionsHave = this.suppliers.some(sp=>sp.nom===s.common.fournisseur);
      body = `<div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div style="font-size:14px;font-weight:600;">Vérifiez la facture scannée</div>
          <button class="btn btn-ghost" onclick="CaApp.resetScan(); CaApp.render();">↻ Scanner une autre facture</button>
        </div>
        ${s.note?`<div class="banner" style="margin-bottom:16px;">${esc(s.note)}</div>`:''}
        <div class="row" style="align-items:flex-start;">
          ${s.previewUrl?`<img src="${s.previewUrl}" alt="Aperçu" style="width:200px;max-height:280px;object-fit:contain;border:1px solid #ece5d5;border-radius:8px;background:#faf6ee;">`:''}
          <div style="flex:1 1 380px;">
            <div class="row">
              <label class="field"><span class="label">Date de facture</span>
                <input type="date" id="scan-common-date" value="${esc(s.common.date)}"></label>
              <label class="field"><span class="label">Fournisseur</span>
                <select id="scan-common-fournisseur">
                  ${!supplierOptionsHave?`<option value="${esc(s.common.fournisseur)}" selected>${esc(s.common.fournisseur||'Sélectionner…')}</option>`:''}
                  ${this.suppliers.map(sp=>`<option value="${esc(sp.nom)}" ${sp.nom===s.common.fournisseur?'selected':''}>${esc(sp.nom)}</option>`).join("")}
                </select></label>
              <label class="field"><span class="label">N° BL / facture</span><span class="hint">facultatif</span>
                <input type="text" id="scan-common-bl" value="${esc(s.common.bl)}"></label>
            </div>
            <div style="font-size:12.5px;font-weight:600;color:#5b5346;margin-bottom:8px;">Ventilation détectée par code comptable</div>
            <div id="scan-lines">
              ${s.lines.map(l=>{
                const c = computeLine(l);
                return `<div class="line-row">
                  <select id="scan-line-code-${l.id}" onchange="CaApp.scanCodeChange('${l.id}', this.value)">
                    ${this.codes.map(c2=>`<option value="${esc(c2.code)}" ${c2.code===l.code?'selected':''}>${esc(c2.code)} — ${esc(c2.libelle)}</option>`).join("")}
                  </select>
                  <input type="number" step="0.01" min="0" id="scan-line-ht-${l.id}" value="${esc(l.ht)}" placeholder="HT">
                  <select class="taux" id="scan-line-taux-${l.id}">
                    ${TAUX_OPTIONS.map(t=>`<option value="${t}" ${t===l.taux?'selected':''}>${t}%</option>`).join("")}
                  </select>
                  <span class="muted" style="font-size:12.5px;min-width:90px;text-align:right;">TTC ${eur(c.ttc)}</span>
                  <button class="btn-icon" onclick="CaApp.scanRemoveLine('${l.id}')">🗑</button>
                </div>`;
              }).join("")}
            </div>
            <button class="btn btn-ghost" style="margin-top:4px;" onclick="CaApp.scanAddLine()">+ Ajouter une ligne</button>
            <div class="banner" style="display:flex;gap:24px;margin:14px 0;">
              <div>Total HT : <strong>${eur(totals.ht)}</strong></div>
              <div>Total TVA : <strong>${eur(totals.tva)}</strong></div>
              <div>Total TTC : <strong>${eur(totals.ttc)}</strong></div>
            </div>
            <div id="scan-error" class="error-text" style="margin-bottom:10px;"></div>
            <div style="display:flex;gap:10px;">
              <button class="btn btn-primary" onclick="CaApp.submitScan()">✓ Enregistrer la ventilation</button>
              <button class="btn btn-ghost" onclick="CaApp.resetScan(); CaApp.render();">Annuler</button>
            </div>
          </div>
        </div>
      </div>`;
    }
    return apiKeyBox + body;
  },

  renderRegistre(){
    let list = this.filteredInvoices();
    if(this.ledgerCodeFilter) list = list.filter(i=>i.code===this.ledgerCodeFilter);
    const groups = {};
    list.forEach(i=>{ groups[i.fournisseur]=groups[i.fournisseur]||[]; groups[i.fournisseur].push(i); });
    const grouped = Object.entries(groups).map(([fournisseur,items])=>({
      fournisseur, items: items.sort((a,b)=>a.date.localeCompare(b.date)), total: items.reduce((s,i)=>s+computeLine(i).ht,0)
    })).sort((a,b)=>a.fournisseur.localeCompare(b.fournisseur));

    let html = `<div style="margin-bottom:14px;display:flex;gap:10px;align-items:center;">
      <span style="font-size:13px;color:#8a8478;">Filtrer par code :</span>
      <select style="width:auto;" onchange="CaApp.setLedgerFilter(this.value)">
        <option value="">Tous les codes</option>
        ${this.codes.map(c=>`<option value="${esc(c.code)}" ${c.code===this.ledgerCodeFilter?'selected':''}>${esc(c.code)} — ${esc(c.libelle)}</option>`).join("")}
      </select>
    </div>`;

    if(grouped.length===0){ html += `<div class="empty card">Aucune facture à afficher.</div>`; return html; }

    grouped.forEach(g=>{
      html += `<div class="card" style="padding:0;margin-bottom:16px;overflow:hidden;">
        <div class="group-head"><span>${esc(g.fournisseur)}</span><span>Sous-total HT : ${eur(g.total)}</span></div>
        <table>
          <thead><tr><th>Date</th><th>N° BL</th><th>Code</th><th class="num">HT</th><th class="num">TVA</th><th class="num">TTC</th><th></th></tr></thead>
          <tbody>
            ${g.items.map(inv=>{
              const c = computeLine(inv);
              return `<tr>
                <td>${esc(inv.date)}</td>
                <td class="muted">${esc(inv.bl)||'—'}</td>
                <td>${esc(inv.code)}</td>
                <td class="num">${eur(c.ht)}</td>
                <td class="num muted">${eur(c.tva)}</td>
                <td class="num" style="font-weight:600;">${eur(c.ttc)}</td>
                <td style="text-align:right;white-space:nowrap;">
                  <button class="btn-icon" onclick="CaApp.editInvoice('${inv.id}')">✎</button>
                  <button class="btn-icon" onclick="CaApp.deleteInvoice('${inv.id}')">🗑</button>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
    });
    return html;
  },

  renderFournisseurs(){
    return `<div class="row" style="align-items:flex-start;">
      <div class="card" style="flex:1 1 420px;padding:0;overflow:hidden;">
        <table>
          <thead><tr><th>Fournisseur</th><th>Code par défaut</th><th class="num">Total HT</th><th></th></tr></thead>
          <tbody>
            ${this.suppliers.map(s=>{
              const total = this.invoices.filter(i=>i.fournisseur===s.nom).reduce((sum,i)=>sum+computeLine(i).ht,0);
              return `<tr>
                <td>${esc(s.nom)}</td>
                <td><select style="font-size:12.5px;padding:5px 8px;" onchange="CaApp.updateSupplierCode('${s.id}', this.value)">
                  ${this.codes.map(c=>`<option value="${esc(c.code)}" ${c.code===s.code?'selected':''}>${esc(c.code)}</option>`).join("")}
                </select></td>
                <td class="num">${eur(total)}</td>
                <td style="text-align:right;"><button class="btn-icon" onclick="CaApp.deleteSupplier('${s.id}')">🗑</button></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
      <div class="card" style="flex:1 1 280px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:12px;">Ajouter un fournisseur</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <input type="text" id="new-sup-nom" placeholder="Nom du fournisseur">
          <select id="new-sup-code"><option value="">Code par défaut…</option>
            ${this.codes.map(c=>`<option value="${esc(c.code)}">${esc(c.code)} — ${esc(c.libelle)}</option>`).join("")}
          </select>
          <button class="btn btn-primary" onclick="CaApp.addSupplier()">+ Ajouter</button>
        </div>
      </div>
    </div>`;
  },

  renderPlan(){
    return `<div class="row" style="align-items:flex-start;">
      <div class="card" style="flex:1 1 460px;padding:0;overflow:hidden;">
        <table>
          <thead><tr><th>Code</th><th>Libellé (plan comptable)</th><th>TVA</th><th>Compte TVA</th><th></th></tr></thead>
          <tbody>
            ${this.codes.map(c=>`<tr>
              <td class="num" style="text-align:left;">${esc(c.code)}</td>
              <td>${esc(c.libelle)}</td>
              <td>${c.taux}%</td>
              <td class="muted">${esc(c.compteTva||'—')}</td>
              <td style="text-align:right;"><button class="btn-icon" onclick="CaApp.deleteCode('${c.code}')">🗑</button></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="card" style="flex:1 1 280px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:12px;">Ajouter un code de ventilation</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <input type="text" id="new-code-code" placeholder="Code (ex : 601100)">
          <input type="text" id="new-code-libelle" placeholder="Libellé du compte">
          <select id="new-code-taux">${TAUX_OPTIONS.map(t=>`<option value="${t}">${t}%</option>`).join("")}</select>
          <input type="text" id="new-code-compteTva" placeholder="Compte TVA déductible (ex : 445660)" value="445660">
          <button class="btn btn-primary" onclick="CaApp.addCode()">+ Ajouter au plan</button>
        </div>
      </div>
    </div>`;
  },

  render(){
    const monthSelectHtml = (this.tab==='dashboard'||this.tab==='registre') ? `
      <div style="margin-bottom:18px;display:flex;gap:10px;align-items:center;">
        <span style="font-size:13px;color:#8a8478;font-weight:500;">Période :</span>
        <select style="width:auto;" onchange="CaApp.setMonth(this.value)">
          <option value="">Toutes les périodes</option>
          ${this.months().map(m=>`<option value="${m}" ${m===this.selectedMonth?'selected':''}>${monthLabel(m)}</option>`).join("")}
        </select>
      </div>` : "";

    let tabContent = "";
    if(this.tab==='dashboard') tabContent = this.renderDashboard();
    else if(this.tab==='saisie') tabContent = this.renderSaisie();
    else if(this.tab==='registre') tabContent = this.renderRegistre();
    else if(this.tab==='fournisseurs') tabContent = this.renderFournisseurs();
    else if(this.tab==='plan') tabContent = this.renderPlan();

    const tabs = [
      {id:'dashboard', label:'Tableau de bord'},
      {id:'saisie', label:'Saisie facture'},
      {id:'registre', label:'Registre'},
      {id:'fournisseurs', label:'Fournisseurs'},
      {id:'plan', label:'Plan de ventilation'},
    ];

    document.getElementById("app").innerHTML = `
      <div class="shell">
        <div class="header">
          <div><h1>Cahier d’achats</h1><p>Ventilation et suivi des factures fournisseurs</p></div>
          <button class="btn btn-ghost" onclick="CaApp.exportExcel()">⬇ Exporter en Excel</button>
        </div>
        <div class="tabs">
          ${tabs.map(t=>`<button class="tab-btn ${this.tab===t.id?'active':''}" onclick="CaApp.setTab('${t.id}')">${t.label}</button>`).join("")}
        </div>
        <div class="content">
          ${monthSelectHtml}
          ${this.editingInvoiceId ? this.renderEditModal() : ""}
          ${tabContent}
        </div>
      </div>
      <div id="toast-holder"></div>`;
    this.renderToast();
  },

  renderEditModal(){
    const inv = this.invoices.find(i=>i.id===this.editingInvoiceId);
    if(!inv) return "";
    return `<div class="modal-overlay" onclick="if(event.target===this){CaApp.cancelEdit();}">
      <div class="modal">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div style="font-size:14px;font-weight:600;">Modifier la facture</div>
          <button class="btn-icon" onclick="CaApp.cancelEdit()">✕</button>
        </div>
        ${this.invoiceFormHtml('manual', inv)}
      </div>
    </div>`;
  },
};

// CaApp.init() appelé après chargement complet
