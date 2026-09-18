const ZONES={
  'FRIGO 1':{label:'Frigo 1',hclass:'h-froid',htext:'Froid +',color:'#378ADD'},
  'FRIGO 2':{label:'Frigo 2',hclass:'h-froid',htext:'Froid +',color:'#185FA5'},
  'CONGELATEUR':{label:'Congélateur',hclass:'h-congel',htext:'Congelé',color:'#7F77DD'},
  'BOISSONS':{label:'Boissons',hclass:'h-temp',htext:'Tempéré',color:'#BA7517'},
  'CAFETERIE':{label:'Caféterie',hclass:'h-temp',htext:'Tempéré',color:'#EF9F27'},
  'ECONOMAT':{label:'Économat',hclass:'h-sec',htext:'Sec',color:'#639922'},
  'BOF':{label:'BOF',hclass:'h-bof',htext:'BOF',color:'#D4537E'},
  'FRAIS BCP':{label:'Frais BCP',hclass:'h-froid',htext:'Froid +',color:'#1D9E75'},
  'AUTRE':{label:'Autre',hclass:'h-autre',htext:'Divers',color:'#888780'},
};
const CROSS_SUPPLIER_GROUPS={'F132':0,'N003':0,'F142':1,'P022':1,'N004':2,'F172':2,'N008':3,'P014':3,'F268':4,'P055':4,'F269':5,'P042':5,'F283':6,'N027':6,'F286':7,'F300':7,'F287':8,'N024':8,'F303':9,'P040':9,'N028':10,'N036':10};

// Groupes dont les produits ont des unités hétérogènes (calculé dynamiquement)
function getCrossGroupMixedUnits() {
  const mixed = new Set();
  // Regrouper les unités par groupe
  const groupUnits = {};
  DATA.forEach(function(d) {
    const gid = CROSS_SUPPLIER_GROUPS[d.code];
    if (gid === undefined) return;
    if (!groupUnits[gid]) groupUnits[gid] = new Set();
    const u = (d.unite || '').trim().toLowerCase();
    if (u) groupUnits[gid].add(u);
  });
  // Marquer les groupes avec plus d'une unité distincte
  Object.keys(groupUnits).forEach(function(gid) {
    if (groupUnits[gid].size > 1) mixed.add(parseInt(gid));
  });
  return mixed;
}

// 11 palettes pour groupes cross-fournisseur
const CROSS_GROUP_COLORS=[
  {bg:'#FFF3E0',border:'#FF8F00',text:'#E65100'},  // 0  Fond brun
  {bg:'#E8F5E9',border:'#388E3C',text:'#1B5E20'},  // 1  Huile olive
  {bg:'#E3F2FD',border:'#1565C0',text:'#0D47A1'},  // 2  Pulpe tomate
  {bg:'#F3E5F5',border:'#7B1FA2',text:'#4A148C'},  // 3  Vinaigre
  {bg:'#FCE4EC',border:'#C2185B',text:'#880E4F'},  // 4  Suprême poulet
  {bg:'#E0F7FA',border:'#0097A7',text:'#006064'},  // 5  Filet poulet
  {bg:'#FFF8E1',border:'#F9A825',text:'#F57F17'},  // 6  Petit pain
  {bg:'#F9FBE7',border:'#827717',text:'#558B2F'},  // 7  Pain burger
  {bg:'#EDE7F6',border:'#512DA8',text:'#311B92'},  // 8  Petits pois
  {bg:'#FBE9E7',border:'#BF360C',text:'#8B1000'},  // 9  Foie gras
  {bg:'#E0F2F1',border:'#00695C',text:'#004D40'},  // 10 Cuisse canette
];
const RESTAURANT_NAME='La Salle à Manger - Grenoble';
const ACCOUNT_CODES=[
  {code:'601100',label:'Nourriture'},
  {code:'607100',label:'Boissons'},
  {code:'602200',label:"Produits d'entretien - Fournitures consommables"},
  {code:'606300',label:'Achats vaisselle - petit matériel (< 500 €)'},
  {code:'606100',label:'Energie et Fluides'},
  {code:'651100',label:'Abonnement logiciel professionnel (caisse)'},
  {code:'615600',label:'Maintenance, entretien et réparations diverses'},
  {code:'626300',label:'Téléphonie'},
  {code:'622600',label:'Audit Hygiène'},
];
const INVOICES=[
  {id:"SYSCO 19/08",fournisseur:"SYSCO",date:"19/08/2026",total:216.59,items:[{p:"PETIT PAIN PAVE RUSTIQUE 43G X190",q:1,u:"CT",px:22.04},{p:"FLT COLIN LIEU IQF QSA MSC 120/140G 5KG",q:5,u:"Kg",px:8.06},{p:"PERSILLADE ST250G X8",q:3,u:"Kg",px:2.14},{p:"SUCRE POUDRE 1KG",q:1,u:"Kg",px:0.9},{p:"HUILE AMPHORA 75%COLZA 25%OLIVE 1L X15",q:6,u:"L",px:3.74},{p:"TR. JAMBON PROSCIUTTO PARME 16M BQ100G X5",q:2,u:"BQ",px:12.06},{p:"TR. JAMBON PARIS CHX DD VPF X25 BQ1KG X9",q:2,u:"BQ",px:7.824},{p:"VEGETOP UHT DEBIC 1L X6",q:6,u:"L",px:3.4},{p:"OEUF ALV MOY SOL 53/63G X90",q:90,u:"PC",px:0.265},{p:"COMTE 9M AOP 400G X12",q:2,u:"PC",px:9.49}]},
  {id:"SYSCO 24/08",fournisseur:"SYSCO",date:"24/08/2026",total:238.4,items:[{p:"AVOCAT CUBE ST 1KG X5",q:5,u:"Kg",px:4.886},{p:"SAUMON FUME ATLANTIQUE",q:1,u:"Kg",px:35.88},{p:"PIGNON PIN ST1KG X4",q:1,u:"Kg",px:4.19},{p:"JUS CITRON JAUNE 1L",q:1,u:"L",px:6.75},{p:"QUINOA BLC ST2.5KG X4",q:2,u:"Kg",px:7.933},{p:"GRENEAU ARC EN CIEL LIMANDE ST1KG X10",q:2,u:"Kg",px:8.56},{p:"MOZZARELLA FRAICHE 22%MG PAIN 1KG",q:2,u:"Kg",px:7.32},{p:"BEURRE PAST 250G X40",q:2,u:"Kg",px:8.9},{p:"COMTE 9M AOP 400G X12",q:1,u:"PC",px:9.49}]},
  {id:"SYSCO 26/08",fournisseur:"SYSCO",date:"26/08/2026",total:282.59,items:[{p:"FLT SAUMON SAUVAGE ROSE PACIFIQUE 150/350G 5KG",q:5,u:"Kg",px:12.54},{p:"SAMOUSSA BOEUF PREF 55G SYC X50",q:50,u:"PC",px:0.49},{p:"SAMOUSSA LEGUME FRIT 55G X50",q:50,u:"PC",px:0.401},{p:"MIEL TOUTES FLEURS 1KG X6",q:1,u:"Kg",px:8.95},{p:"JUS DE POMME 1L PK6PC",q:6,u:"L",px:2.1},{p:"JUS D ORANGE 1L PK6PC",q:6,u:"L",px:2.76},{p:"HUILE OLIVE SPECIAL CUISINE BI5L",q:5,u:"L",px:4.6},{p:"TR. ROSETTE LYON X50 ENV SYC BQ500G X8",q:2,u:"BQ",px:9.765},{p:"TR. JAMBON PROSCIUTTO PARME 16M BQ300G X5",q:2,u:"BQ",px:12.06},{p:"TR. JAMBON PARIS CHX DD VPF X25 BQ1KG X9",q:2,u:"BQ",px:7.824},{p:"VEGETOP UHT DEBIC 1L X6",q:12,u:"L",px:3.4},{p:"SELLE CHEVRE BQ200G X3",q:3,u:"BQ",px:4.54}]},
  {id:"POMONA 21/08",fournisseur:"POMONA",date:"21/08/2026",total:241.03,items:[{p:"GRANA PADANO RAPE 28.4% AOP 1KG X10",q:1,u:"Kg",px:14.69},{p:"MOZZA RAPE CANTADORA LFR 2.5KGX4",q:2.5,u:"Kg",px:6.586},{p:"PREPA TARTE CITRON SICILE 1L X6",q:2,u:"BRQ",px:7.5},{p:"ROSETTE TRANCHE (10CX50TR ENV)X8 4KG",q:3,u:"BOT",px:5.109},{p:"EMMENTAL RAPE 29% LFR 1KGX10 B&E",q:1,u:"Kg",px:7.206},{p:"CAMEMBERT NU 22% LFR 240GX30 B&E",q:1,u:"PU",px:1.839},{p:"JAMBON CRU PAYS S/OS (19CX26TR)X6",q:2,u:"BOT",px:5.61},{p:"MOZZARELLA PATE SPECIALE CUISINE 1KGX5",q:1,u:"PU",px:9.558},{p:"JAMBON SUP DD TORCHON (40GX20TR)X6",q:1,u:"BOT",px:6.273},{p:"RAVIOLE DAUPHINE TCP LR 1KGX5 ROYANS",q:5,u:"Kg",px:9.793},{p:"MIX4 PAIN LOSANGE PRECUIT 55GX25X4",q:100,u:"PU",px:0.45},{p:"NAVETTE NATURE CT 15GX100",q:100,u:"PU",px:0.243}]},
  {id:"PROMOCASH 17/08 BOISSONS",fournisseur:"PROMOCASH",date:"17/08/2026",total:75.93,items:[{p:"COCA COLA BTE 33CL VC",q:24,u:"BTE",px:1.033},{p:"EAU GAZEUSE PERRIER BTE 33CL VC",q:24,u:"BTE",px:0.97},{p:"LIMONADE SUD BTE 25CL VC",q:24,u:"BTE",px:0.49}]},
  {id:"UNION PRIMEURS 17/08",fournisseur:"UNION PRIMEURS",date:"17/08/2026",total:61.12,items:[{p:"SALADE BATAVIA FRANCE CI HVE",q:1,u:"Pce",px:1.5},{p:"ABRICOT FRANCE CI",q:5,u:"Kg",px:3.8},{p:"MELON CAL9 FRANCE",q:4,u:"Pce",px:2.6},{p:"RAISIN ITALIA CIA CI",q:1,u:"Kg",px:2.96},{p:"NECTARINE JAUNE ESPAGNE CI",q:4,u:"Kg",px:2.96},{p:"PERSIL PLAT FRA CI",q:1,u:"Botte",px:1.19},{p:"CAROTTE FRANCE X10",q:10,u:"Kg",px:0.89}]},
  {id:"UNION PRIMEURS 26/08",fournisseur:"UNION PRIMEURS",date:"26/08/2026",total:61.12,items:[{p:"COURGETTE CAT1 ESP",q:4,u:"Kg",px:2.44},{p:"NECTARINE JAUNE ESPAGNE CI",q:4,u:"Kg",px:2.96},{p:"ABRICOT FRANCE CI",q:5,u:"Kg",px:3.8},{p:"POMME GOLDEN 170/200 TR",q:3.2,u:"Kg",px:1.89},{p:"PRUNE JAUNE ESP CI",q:3.3,u:"Kg",px:2.6},{p:"CORIANDRE BOTTE FRANCE CI",q:2,u:"Botte",px:1.19}]}
];;
const DATA=[
{code:'F001',zone:'BOISSONS',cat:'Boissons',produit:'AFFLIGEN',unite:'BTL 25CL',prix:4.34,qte:null,fournisseur:'PROMOCASH',status:''},
{code:'F002',zone:'BOISSONS',cat:'Boissons',produit:'BADOIT PET',unite:'L',prix:1.456,qte:25,fournisseur:'TRANSGOURMET',status:'updated'},
{code:'F003',zone:'BOISSONS',cat:'Boissons',produit:'BIB MACON',unite:'L',prix:50,qte:0.38,fournisseur:'',status:''},
{code:'F004',zone:'BOISSONS',cat:'Boissons',produit:'BIB COTES DU RHONE LES FOUQUIERES 10L',unite:'L',prix:29.83,qte:0.12,fournisseur:'',status:''},
{code:'F005',zone:'BOISSONS',cat:'Boissons',produit:'BIB CROZES HERMITAGE CAVES DU CENTRE 10L',unite:'L',prix:99,qte:1,fournisseur:'',status:''},
{code:'F006',zone:'BOISSONS',cat:'Boissons',produit:'CDR FOUQUIERES',unite:'L',prix:3.776,qte:12,fournisseur:'',status:''},
{code:'F007',zone:'BOISSONS',cat:'Boissons',produit:'ST NICOLAS DE BOURGUEUIL',unite:'L',prix:5.95,qte:6,fournisseur:'',status:''},
{code:'F008',zone:'BOISSONS',cat:'Boissons',produit:'BADOIT',unite:'L',prix:0.85,qte:12,fournisseur:'PROMOCASH',status:''},
{code:'F009',zone:'BOISSONS',cat:'Boissons',produit:'CHARTREUSE JAUNE',unite:'L',prix:29.3,qte:0.8,fournisseur:'MICAND',status:''},
{code:'F010',zone:'BOISSONS',cat:'Boissons',produit:'CHARTREUSE VERTE',unite:'70cl',prix:29.36,qte:1,fournisseur:'MICAND',status:''},
{code:'F011',zone:'BOISSONS',cat:'Boissons',produit:'CLAIRETTE DE DIE',unite:'75cl',prix:8.6,qte:1,fournisseur:'MICAND',status:''},
{code:'F012',zone:'BOISSONS',cat:'Boissons',produit:'COCA COLA',unite:'33cl',prix:0.94,qte:8,fournisseur:'PROMOCASH',status:''},
{code:'F013',zone:'BOISSONS',cat:'Boissons',produit:'COCA ZERO',unite:'33cl',prix:0.76,qte:null,fournisseur:'FRANCE BOISSONS',status:''},
{code:'F016',zone:'BOISSONS',cat:'Boissons',produit:'COTE DU RHONE LUCENA',unite:'75CL',prix:6.58,qte:2,fournisseur:'MICAND',status:''},
{code:'F018',zone:'BOISSONS',cat:'Boissons',produit:'CREME DE CASSIS',unite:'70cl',prix:16.21,qte:0.8,fournisseur:'MICAND',status:''},
{code:'F019',zone:'BOISSONS',cat:'Boissons',produit:'CREME DE CHATAIGNE',unite:'70cl',prix:12.83,qte:0.4,fournisseur:'MICAND',status:''},
{code:'F021',zone:'BOISSONS',cat:'Boissons',produit:'CREME DE PECHE',unite:'70cl',prix:13.34,qte:0.5,fournisseur:'MICAND',status:''},
{code:'F022',zone:'BOISSONS',cat:'Boissons',produit:'CRISTALINE',unite:'50CL',prix:0.35,qte:4,fournisseur:'TRANSGOURMET',status:''},
{code:'F024',zone:'BOISSONS',cat:'Boissons',produit:'FUT LEFF',unite:'FUT',prix:24.92,qte:2,fournisseur:'MICAND',status:''},
{code:'F025',zone:'BOISSONS',cat:'Boissons',produit:'GENEPI FERRAND',unite:'70cl',prix:8.05,qte:0.3,fournisseur:'FRANCE BOISSONS',status:''},
{code:'F027',zone:'BOISSONS',cat:'Boissons',produit:'GET 27',unite:'70cl',prix:11.74,qte:1,fournisseur:'CARREFOUR',status:''},
{code:'F032',zone:'BOISSONS',cat:'Boissons',produit:'JUS MULTI FRUITS',unite:'L',prix:1.89,qte:null,fournisseur:'GINEYS',status:'updated'},
{code:'F035',zone:'BOISSONS',cat:'Boissons',produit:'LIMONADE 20CL',unite:'20CL',prix:0.42,qte:6,fournisseur:'PROMOCASH',status:''},
{code:'F040',zone:'BOISSONS',cat:'Boissons',produit:'SYMPLES ENERGISANTE',unite:'unité',prix:1.55,qte:14,fournisseur:'',status:''},
{code:'F041',zone:'BOISSONS',cat:'Boissons',produit:'SYMPLES DETOX',unite:'unité',prix:1.55,qte:23,fournisseur:'',status:''},
{code:'F042',zone:'BOISSONS',cat:'Boissons',produit:'SYMPLES RELAX',unite:'unité',prix:1.55,qte:29,fournisseur:'',status:''},
{code:'F043',zone:'BOISSONS',cat:'Boissons',produit:'PETILLANT POMME GINGEMBRE',unite:'unité',prix:1.86,qte:null,fournisseur:'',status:''},
{code:'F044',zone:'BOISSONS',cat:'Boissons',produit:'PETILLANT POMME SUREAU',unite:'unité',prix:1.86,qte:null,fournisseur:'',status:''},
{code:'F045',zone:'BOISSONS',cat:'Boissons',produit:'COMMUNITY COLA',unite:'unité',prix:1.24,qte:12,fournisseur:'',status:''},
{code:'F046',zone:'BOISSONS',cat:'Boissons',produit:'LEAFWELL THE GLACE',unite:'unité',prix:1.34,qte:18,fournisseur:'',status:''},
{code:'F047',zone:'BOISSONS',cat:'Boissons',produit:'BIERE NEIPA',unite:'unité',prix:1.9,qte:10,fournisseur:'',status:''},
{code:'F048',zone:'BOISSONS',cat:'Boissons',produit:'BIERE IPA',unite:'unité',prix:1.8,qte:2,fournisseur:'',status:''},
{code:'F049',zone:'BOISSONS',cat:'Boissons',produit:'BIERE BLONDE',unite:'unité',prix:1.7,qte:3,fournisseur:'',status:''},
{code:'F051',zone:'BOISSONS',cat:'Boissons',produit:'PAGO ACE',unite:'20CL',prix:0.73,qte:null,fournisseur:'FRANCE BOISSONS',status:''},
{code:'F052',zone:'BOISSONS',cat:'Boissons',produit:'PAGO POIRE',unite:'20CL',prix:0.81,qte:8,fournisseur:'PROMOCASH',status:''},
{code:'F053',zone:'BOISSONS',cat:'Boissons',produit:'PAGO ANANAS',unite:'20CL',prix:0.84,qte:11,fournisseur:'FRANCE BOISSONS',status:''},
{code:'F054',zone:'BOISSONS',cat:'Boissons',produit:'PERRIER',unite:'33CL',prix:0.98,qte:10,fournisseur:'PROMOCASH',status:''},
{code:'F055',zone:'BOISSONS',cat:'Boissons',produit:'PERRIER PET',unite:'L',prix:2.14,qte:6,fournisseur:'TRANSGOURMET',status:'new'},
{code:'F075',zone:'BOISSONS',cat:'Boissons',produit:'SIROP PECHE',unite:'L',prix:3.960,qte:0.3,fournisseur:'TRANSGOURMET',status:'new'},
{code:'F056',zone:'BOISSONS',cat:'Boissons',produit:'PETIT PONT BLANC',unite:'75cl',prix:4.23,qte:4,fournisseur:'MICAND',status:'updated'},
{code:'F058',zone:'BOISSONS',cat:'Boissons',produit:'PETIT PONT ROSE',unite:'75cl',prix:4.23,qte:0.8,fournisseur:'MICAND',status:'updated'},
{code:'F059',zone:'BOISSONS',cat:'Boissons',produit:'PETIT PONT ROUGE',unite:'75cl',prix:4.23,qte:9,fournisseur:'MICAND',status:'updated'},
{code:'M001',zone:'BOISSONS',cat:'Boissons',produit:'PETIT PONT BLANC IGP 5L - 2025',unite:'L',prix:3.224,qte:10,fournisseur:'MICAND',status:'new'},
{code:'M002',zone:'BOISSONS',cat:'Boissons',produit:'PETIT PONT ROUGE IGP 5L - 2024',unite:'L',prix:3.224,qte:5,fournisseur:'MICAND',status:'new'},
{code:'F065',zone:'BOISSONS',cat:'Boissons',produit:'RHUM MARTINIQUE AOP',unite:'1L',prix:23.327,qte:1,fournisseur:'TRANSGOURMET',status:''},
{code:'F066',zone:'BOISSONS',cat:'Boissons',produit:'ROSE PROVENCE',unite:'75cl',prix:6.9,qte:6.5,fournisseur:'',status:''},
{code:'N001',zone:'BOISSONS',cat:'Boissons',produit:'RHUM BLANC DILLON AOC',unite:'BL',prix:23.327,qte:null,fournisseur:'TRANSGOURMET',status:'new'},
{code:'F069',zone:'BOISSONS',cat:'Boissons',produit:'SIROP CANNE',unite:'L',prix:5.61,qte:1.5,fournisseur:'FRANCE BOISSONS',status:'updated'},
{code:'F071',zone:'BOISSONS',cat:'Boissons',produit:'SIROP CITRON',unite:'L',prix:2.99,qte:0.4,fournisseur:'PROMOCASH',status:''},
{code:'F073',zone:'BOISSONS',cat:'Boissons',produit:'SIROP GRENADINE',unite:'L',prix:2.38,qte:0.1,fournisseur:'PROMOCASH',status:'updated'},
{code:'F074',zone:'BOISSONS',cat:'Boissons',produit:'SIROP MENTHE',unite:'L',prix:3.29,qte:0.8,fournisseur:'TRANSGOURMET',status:''},
{code:'F080',zone:'BOISSONS',cat:'Boissons',produit:'VALS EAU MINERALE',unite:'L',prix:1.12,qte:11,fournisseur:'EPISAVEUR',status:''},
{code:'F084',zone:'BOISSONS',cat:'Boissons',produit:'VIOGNIER ROUQUETS',unite:'75cl',prix:6,qte:6,fournisseur:'MICAND',status:''},
{code:'F085',zone:'BOISSONS',cat:'Boissons',produit:'WHISKY LAWSON',unite:'75CL',prix:7.14,qte:1,fournisseur:'FRANCE BOISSONS',status:''},
{code:'F086',zone:'CAFETERIE',cat:'Cafeterie',produit:'COCKTAIL MIX',unite:'SEAU',prix:7.07,qte:1,fournisseur:'SYSCO',status:'updated'},
{code:'F089',zone:'CAFETERIE',cat:'Cafeterie',produit:'CAFE DECAFEINE',unite:'KG',prix:6.89,qte:2.5,fournisseur:'TRANSGOURMET',status:''},
{code:'F090',zone:'CAFETERIE',cat:'Cafeterie',produit:'CAFE GRAIN MOKA ETHIOPIE',unite:'KG',prix:20.71,qte:3,fournisseur:'FRAICA',status:''},
{code:'F091',zone:'CAFETERIE',cat:'Cafeterie',produit:'CAFE MOULU SAC OR',unite:'KG',prix:19.82,qte:5.5,fournisseur:'FRAICA',status:''},
{code:'F092',zone:'CAFETERIE',cat:'Cafeterie',produit:'CAFE PERSO',unite:'KG',prix:11.37,qte:1.5,fournisseur:'FRAICA',status:''},
{code:'F094',zone:'CAFETERIE',cat:'Cafeterie',produit:'INFUSION TILLEUL',unite:'bte',prix:10.9,qte:0.75,fournisseur:'FRAICA',status:''},
{code:'F095',zone:'CAFETERIE',cat:'Cafeterie',produit:'INFUSION VERVEINE MENTHE',unite:'bte',prix:10.9,qte:0.33,fournisseur:'FRAICA',status:''},
{code:'F096',zone:'CAFETERIE',cat:'Cafeterie',produit:'INFUSION VERVEINE',unite:'bte',prix:10.9,qte:1,fournisseur:'FRAICA',status:''},
{code:'F099',zone:'CAFETERIE',cat:'Cafeterie',produit:'SUCRE BUCHETTE',unite:'COLIS',prix:16.6,qte:1.5,fournisseur:'FRAICA',status:''},
{code:'F100',zone:'CAFETERIE',cat:'Cafeterie',produit:'THE FRUITS ROUGES',unite:'PCE',prix:10.9,qte:0.66,fournisseur:'FRAICA',status:''},
{code:'F102',zone:'CAFETERIE',cat:'Cafeterie',produit:'THE COQUELICOT',unite:'bte',prix:10.9,qte:1,fournisseur:'FRAICA',status:''},
{code:'F103',zone:'CAFETERIE',cat:'Cafeterie',produit:'THE EARL CAMOMILE',unite:'bte',prix:10.9,qte:0.3,fournisseur:'FRAICA',status:''},
{code:'F106',zone:'CAFETERIE',cat:'Cafeterie',produit:'THE VERT MENTHE',unite:'BTE',prix:10.9,qte:1,fournisseur:'FRAICA',status:''},
{code:'F108',zone:'ECONOMAT',cat:'Economat',produit:'AMANDE HACHEE',unite:'KG',prix:17.53,qte:null,fournisseur:'SYSCO',status:''},
{code:'N002',zone:'ECONOMAT',cat:'Economat',produit:'AMANDE EFFILEE',unite:'KG',prix:10.800,qte:null,fournisseur:'TRANSGOURMET',status:'new'},
{code:'F111',zone:'ECONOMAT',cat:'Economat',produit:'AMANDES POUDRE',unite:'KG',prix:6.99,qte:null,fournisseur:'GINEYS',status:''},
{code:'F112',zone:'ECONOMAT',cat:'Economat',produit:'BISCUITS CUILLERE',unite:'COLIS',prix:33.19,qte:null,fournisseur:'',status:''},
{code:'F114',zone:'ECONOMAT',cat:'Economat',produit:'CACAO POUDRE',unite:'BTE',prix:20.716,qte:null,fournisseur:'GINEYS',status:''},
{code:'F116',zone:'ECONOMAT',cat:'Economat',produit:'CHAPELURE',unite:'SAC',prix:2.5,qte:null,fournisseur:'GINEYS',status:''},
{code:'F118',zone:'ECONOMAT',cat:'Economat',produit:'CHOCOLAT PALET NOIR',unite:'KG',prix:14,qte:0.5,fournisseur:'SYSCO',status:''},
{code:'F119',zone:'ECONOMAT',cat:'Economat',produit:'CHAMPIGNONS NOIRS',unite:'BTE',prix:19.62,qte:1,fournisseur:'',status:''},
{code:'F121',zone:'ECONOMAT',cat:'Economat',produit:'COMPOTE POMMES',unite:'BTE',prix:0.954,qte:null,fournisseur:'GINEYS',status:''},
{code:'F122',zone:'ECONOMAT',cat:'Economat',produit:'CONCENTRE TOMATE',unite:'BTE',prix:6.607,qte:null,fournisseur:'GINEYS',status:''},
{code:'F124',zone:'ECONOMAT',cat:'Economat',produit:'CREME PATISSIERE',unite:'KG',prix:7.49,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F125',zone:'ECONOMAT',cat:'Economat',produit:'CROZET',unite:'SAC',prix:42.5,qte:3,fournisseur:'SYSCO',status:''},
{code:'F128',zone:'ECONOMAT',cat:'Economat',produit:'ESTRAGON',unite:'SAC',prix:8,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F129',zone:'ECONOMAT',cat:'Economat',produit:'FARINE',unite:'KG',prix:0.76,qte:8,fournisseur:'GINEYS',status:'updated'},
{code:'F130',zone:'ECONOMAT',cat:'Economat',produit:'FEUILLE DE RIZ',unite:'POCHETTE',prix:3.24,qte:null,fournisseur:'AUTRE',status:''},
{code:'F132',zone:'ECONOMAT',cat:'Economat',produit:'FOND BRUN LIE',unite:'BTE',prix:12.95,qte:1.2,fournisseur:'GINEYS',status:''},
{code:'N003',zone:'ECONOMAT',cat:'Economat',produit:'FOND BRUN LIE SYSCO',unite:'BT',prix:2.8,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'F135',zone:'ECONOMAT',cat:'Economat',produit:'FOND VOLAILLE',unite:'BTE',prix:11.6,qte:1,fournisseur:'TRANSGOURMET',status:''},
{code:'F137',zone:'ECONOMAT',cat:'Economat',produit:'GELATINE FEUILLE',unite:'BTE',prix:22.2,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F138',zone:'ECONOMAT',cat:'Economat',produit:'GIDOLIVE',unite:'L',prix:4.95,qte:20,fournisseur:'GINEYS',status:''},
{code:'F140',zone:'ECONOMAT',cat:'Economat',produit:'HUILE CUISINOR',unite:'L',prix:2.72,qte:null,fournisseur:'TRANSGOURMET',status:'updated'},
{code:'F142',zone:'ECONOMAT',cat:'Economat',produit:'HUILE OLIVE',unite:'L',prix:7.69,qte:null,fournisseur:'TRANSGOURMET',status:'updated'},
{code:'F145',zone:'ECONOMAT',cat:'Economat',produit:'HUILE TOURNESOL',unite:'L',prix:2.472,qte:5,fournisseur:'GINEYS',status:'updated'},
{code:'F146',zone:'ECONOMAT',cat:'Economat',produit:'KETCHUP',unite:'PCE',prix:3.25,qte:null,fournisseur:'SYSCO',status:''},
{code:'F148',zone:'ECONOMAT',cat:'Economat',produit:'LASAGNES GASTRONORME',unite:'COLIS',prix:11.256,qte:2,fournisseur:'EPISAVEUR',status:''},
{code:'F150',zone:'ECONOMAT',cat:'Economat',produit:'LENTILLES',unite:'KG',prix:5.68,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F151',zone:'ECONOMAT',cat:'Economat',produit:'LEVURE CHIMIQUE',unite:'BTE',prix:10.021,qte:1,fournisseur:'GINEYS',status:''},
{code:'F152',zone:'ECONOMAT',cat:'Economat',produit:'MAIZENA',unite:'BTE',prix:4.99,qte:2,fournisseur:'GINEYS',status:'updated'},
{code:'F156',zone:'ECONOMAT',cat:'Economat',produit:'MOUTARDE ANCIENNE',unite:'KG',prix:2.938,qte:1,fournisseur:'TRANSGOURMET',status:'updated'},
{code:'F158',zone:'ECONOMAT',cat:'Economat',produit:'MOUTARDE DISTRIBUTEUR',unite:'PCE',prix:63.88,qte:0.5,fournisseur:'TRANSGOURMET',status:''},
{code:'F161',zone:'ECONOMAT',cat:'Economat',produit:'NOIX',unite:'KG',prix:15.5,qte:null,fournisseur:'SYSCO',status:''},
{code:'F162',zone:'ECONOMAT',cat:'Economat',produit:'NOIX COCO RAPEE',unite:'KG',prix:6.99,qte:1.5,fournisseur:'GINEYS',status:'updated'},
{code:'F164',zone:'ECONOMAT',cat:'Economat',produit:'PAPRIKA',unite:'BTE',prix:9.1,qte:0.3,fournisseur:'SYSCO',status:''},
{code:'F166',zone:'ECONOMAT',cat:'Economat',produit:'POIRE SIROP',unite:'BTE',prix:7.34,qte:null,fournisseur:'GINEYS',status:''},
{code:'F167',zone:'ECONOMAT',cat:'Economat',produit:'POIS CHICHES',unite:'BTE',prix:1.71,qte:2,fournisseur:'GINEYS',status:''},
{code:'F169',zone:'ECONOMAT',cat:'Economat',produit:'POLENTA',unite:'KG',prix:2.49,qte:3,fournisseur:'GINEYS',status:''},
{code:'N004',zone:'ECONOMAT',cat:'Economat',produit:'PULPE TOMATE AU JUS',unite:'BT',prix:7.96,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'F172',zone:'ECONOMAT',cat:'Economat',produit:'PULPE TOMATE',unite:'BTE',prix:7.95,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F173',zone:'ECONOMAT',cat:'Economat',produit:'RAISINS SEC',unite:'KG',prix:5.95,qte:0.5,fournisseur:'GINEYS',status:''},
{code:'N005',zone:'ECONOMAT',cat:'Economat',produit:'RIZ LONG GRAIN',unite:'KG',prix:8.06,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N008',zone:'ECONOMAT',cat:'Economat',produit:'VINAIGRE ALCOOL CRISTAL',unite:'PC',prix:2.05,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N009',zone:'ECONOMAT',cat:'Economat',produit:'OLIVE NOIRE GRECQUE',unite:'KG',prix:11.56,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'F193',zone:'FRIGO 1',cat:'Frigo 1',produit:'MINI SAUCISSON',unite:'KG',prix:16.36,qte:null,fournisseur:'SYSCO',status:''},
{code:'N010',zone:'FRIGO 1',cat:'Frigo 1',produit:'CHAIR A SAUCISSE',unite:'KG',prix:8.97,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'F200',zone:'FRIGO 1',cat:'Frigo 1',produit:'OLIVES NOIRES',unite:'KG',prix:10.55,qte:1.5,fournisseur:'GINEYS',status:''},
{code:'F202',zone:'FRIGO 1',cat:'Frigo 1',produit:'AMARENA',unite:'BTE',prix:43.08,qte:1,fournisseur:'DUCEUX',status:''},
{code:'F203',zone:'FRIGO 1',cat:'Frigo 1',produit:'BEURRE',unite:'KG',prix:9.4,qte:2,fournisseur:'POMONA',status:'updated'},
{code:'F204',zone:'FRIGO 1',cat:'Frigo 1',produit:'BLANC LIQUIDE',unite:'L',prix:3.6,qte:null,fournisseur:'GINEYS',status:''},
{code:'N011',zone:'FRIGO 1',cat:'Frigo 1',produit:'BLANC OEUF LIQUIDE',unite:'L',prix:4.265,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'F205',zone:'FRIGO 1',cat:'Frigo 1',produit:'BLEU PAIN',unite:'KG',prix:8.823,qte:null,fournisseur:'POMONA',status:''},
{code:'F206',zone:'FRIGO 1',cat:'Frigo 1',produit:'TOME BLANCHE',unite:'KG',prix:11.15,qte:null,fournisseur:'GINEYS',status:''},
{code:'F208',zone:'FRIGO 1',cat:'Frigo 1',produit:'CREME VEGETOP',unite:'L',prix:3.7,qte:10,fournisseur:'POMONA',status:'updated'},
{code:'F210',zone:'FRIGO 1',cat:'Frigo 1',produit:'FEUILLE BRICK',unite:'SAC',prix:1.6,qte:null,fournisseur:'GINEYS',status:''},
{code:'N013',zone:'FRIGO 1',cat:'Frigo 1',produit:'GRANA PADANO RAPE 28.4% AOP 1KG X10',unite:'KG',prix:14.69,qte:null,fournisseur:'SYSCO',status:'updated'},
{code:'F212',zone:'FRIGO 1',cat:'Frigo 1',produit:'LAIT DEMI ECREME',unite:'L',prix:0.97,qte:7,fournisseur:'POMONA',status:'updated'},
{code:'F214',zone:'FRIGO 1',cat:'Frigo 1',produit:'LEVURE BOULANGERE',unite:'BTE',prix:7.99,qte:null,fournisseur:'GINEYS',status:''},
{code:'N014',zone:'FRIGO 1',cat:'Frigo 1',produit:'MOZZARELLA PATE SPECIALE CUISINE 1KGX5',unite:'SAC',prix:9.558,qte:null,fournisseur:'POMONA',status:'updated'},
{code:'N015',zone:'FRIGO 1',cat:'Frigo 1',produit:'COSSETTE MOZZARELLA SYSCO',unite:'KG',prix:6.046,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'F215',zone:'FRIGO 1',cat:'Frigo 1',produit:'OEUF VRAC FRAIS',unite:'PCE',prix:0.24,qte:60,fournisseur:'POMONA',status:''},
{code:'N016',zone:'FRIGO 1',cat:'Frigo 1',produit:'OEUF ALVEO MOYEN',unite:'PC',prix:0.265,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'F216',zone:'FRIGO 1',cat:'Frigo 1',produit:'TOMATE CONFITES',unite:'KG',prix:9.9,qte:1,fournisseur:'TRANSGOURMET',status:''},
{code:'F217',zone:'FRIGO 1',cat:'Frigo 1',produit:'MAYONNAISE SEAU',unite:'SEAU',prix:18.99,qte:null,fournisseur:'GINEYS',status:''},
{code:'F224',zone:'FRIGO 2',cat:'Frigo 2',produit:'AIL',unite:'KG',prix:2.283,qte:0.5,fournisseur:'UNION PRIMEURS',status:''},
{code:'F225',zone:'FRIGO 2',cat:'Frigo 2',produit:'ANANAS',unite:'KG',prix:2.5,qte:1.5,fournisseur:'UNION PRIMEURS',status:''},
{code:'F226',zone:'FRIGO 2',cat:'Frigo 2',produit:'PINK LADY',unite:'KG',prix:3.6,qte:6,fournisseur:'UNION PRIMEURS',status:''},
{code:'F227',zone:'FRIGO 2',cat:'Frigo 2',produit:'POMME DE TERRE VIDE',unite:'KG',prix:2.9,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F228',zone:'FRIGO 2',cat:'Frigo 2',produit:'BATAVIA',unite:'PCE',prix:0.98,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F229',zone:'FRIGO 2',cat:'Frigo 2',produit:'CAROTTE',unite:'KG',prix:2.4,qte:5,fournisseur:'UNION PRIMEURS',status:''},
{code:'F230',zone:'FRIGO 2',cat:'Frigo 2',produit:'RAISIN ROUGE',unite:'KG',prix:5.5,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F231',zone:'FRIGO 2',cat:'Frigo 2',produit:'FRAISES',unite:'KG',prix:6.8,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F232',zone:'FRIGO 2',cat:'Frigo 2',produit:'CITRON',unite:'KG',prix:2.89,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F233',zone:'FRIGO 2',cat:'Frigo 2',produit:'BANANE',unite:'KG',prix:1.96,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F235',zone:'FRIGO 2',cat:'Frigo 2',produit:'ECHALOTTE',unite:'KG',prix:3.6,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F238',zone:'FRIGO 2',cat:'Frigo 2',produit:'NAVET',unite:'KG',prix:2.6,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F239',zone:'FRIGO 2',cat:'Frigo 2',produit:'OIGNON',unite:'KG',prix:1.59,qte:10,fournisseur:'UNION PRIMEURS',status:''},
{code:'F240',zone:'FRIGO 2',cat:'Frigo 2',produit:'POMME GOLDEN 170/200 TR',unite:'KG',prix:1.89,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F241',zone:'FRIGO 2',cat:'Frigo 2',produit:'POIRES',unite:'KG',prix:2.85,qte:1,fournisseur:'UNION PRIMEURS',status:''},
{code:'F242',zone:'FRIGO 2',cat:'Frigo 2',produit:'PERSIL',unite:'BOTTE',prix:1.19,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F245',zone:'FRIGO 2',cat:'Frigo 2',produit:'POMME DE TERRE BINJ',unite:'KG',prix:0.98,qte:5,fournisseur:'UNION PRIMEURS',status:''},
{code:'F247',zone:'FRIGO 2',cat:'Frigo 2',produit:'POMME GOLDEN VARIETE',unite:'KG',prix:1.89,qte:6,fournisseur:'UNION PRIMEURS',status:'updated'},
{code:'F248',zone:'FRIGO 2',cat:'Frigo 2',produit:'TOMATE',unite:'KG',prix:2.96,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F249',zone:'FRIGO 2',cat:'Frigo 2',produit:'ORANGES',unite:'KG',prix:1.96,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F252',zone:'FRIGO 2',cat:'Frigo 2',produit:'PAMPLEMOUSSE',unite:'PCE',prix:0.86,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F254',zone:'CONGELATEUR',cat:'Surgelés',produit:'ANETH',unite:'SACHET',prix:3.95,qte:3,fournisseur:'POMONA',status:''},
{code:'F255',zone:'CONGELATEUR',cat:'Surgelés',produit:'AIL SURGELE',unite:'SACHET',prix:2.283,qte:null,fournisseur:'GINEYS',status:''},
{code:'F257',zone:'CONGELATEUR',cat:'Surgelés',produit:'BRUNOISE LEGUME',unite:'KG',prix:1.34,qte:7.5,fournisseur:'POMONA',status:'updated'},
{code:'F258',zone:'CONGELATEUR',cat:'Surgelés',produit:'COLIN CUBE',unite:'KG',prix:5.84,qte:3,fournisseur:'POMONA',status:''},
{code:'F259',zone:'CONGELATEUR',cat:'Surgelés',produit:'CHOUX FARCI',unite:'KG',prix:5.75,qte:2.5,fournisseur:'SYSCO',status:''},
{code:'F260',zone:'CONGELATEUR',cat:'Surgelés',produit:'COLIN DOS',unite:'KG',prix:6.09,qte:5,fournisseur:'GINEYS',status:''},
{code:'F261',zone:'CONGELATEUR',cat:'Surgelés',produit:'BRIOCHE',unite:'PCE',prix:8.06,qte:null,fournisseur:'POMONA',status:''},
{code:'F262',zone:'CONGELATEUR',cat:'Surgelés',produit:'PILON POULET',unite:'KG',prix:8.7,qte:null,fournisseur:'SYSCO',status:''},
{code:'F263',zone:'CONGELATEUR',cat:'Surgelés',produit:'ACCRAS',unite:'KG',prix:9.56,qte:1.5,fournisseur:'POMONA',status:''},
{code:'F264',zone:'CONGELATEUR',cat:'Surgelés',produit:'GNOCCHIS PDT',unite:'KG',prix:2.2,qte:null,fournisseur:'SYSCO',status:'updated'},
{code:'F265',zone:'CONGELATEUR',cat:'Surgelés',produit:'FALAFEL MENTHE CORIANDRE',unite:'KG',prix:7.95,qte:null,fournisseur:'GINEYS',status:''},
{code:'F266',zone:'CONGELATEUR',cat:'Surgelés',produit:'FOND TARTELETTE',unite:'PCE',prix:0.36,qte:200,fournisseur:'SYSCO',status:'updated'},
{code:'F268',zone:'CONGELATEUR',cat:'Surgelés',produit:'SUPREME POULET',unite:'KG',prix:8.27,qte:10,fournisseur:'POMONA',status:''},
{code:'F269',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET POULET HALAL',unite:'KG',prix:6.06,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F271',zone:'CONGELATEUR',cat:'Surgelés',produit:'COCKTAIL FRUIT ROUGES',unite:'KG',prix:7.2,qte:5,fournisseur:'POMONA',status:''},
{code:'F275',zone:'CONGELATEUR',cat:'Surgelés',produit:'GLACE ABRICOT',unite:'BAC',prix:16.99,qte:1,fournisseur:'GINEYS',status:''},
{code:'F276',zone:'CONGELATEUR',cat:'Surgelés',produit:'FEUILLETAGE',unite:'PLAQUE',prix:2.34,qte:18,fournisseur:'POMONA',status:''},
{code:'F277',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET DE CAILLE',unite:'KG',prix:23.6,qte:2,fournisseur:'SYSCO',status:''},
{code:'F280',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI VIENNOISERIES',unite:'PCE',prix:0.14,qte:120,fournisseur:'SYSCO',status:'updated'},
{code:'F281',zone:'CONGELATEUR',cat:'Surgelés',produit:'BOULE PATE PIZZA',unite:'PCE',prix:0.58,qte:60,fournisseur:'GINEYS',status:''},
{code:'F282',zone:'CONGELATEUR',cat:'Surgelés',produit:'NAVETTE',unite:'PCE',prix:0.2,qte:80,fournisseur:'GINEYS',status:''},
{code:'F283',zone:'CONGELATEUR',cat:'Surgelés',produit:'PETIT PAIN',unite:'PCE',prix:0.169,qte:190,fournisseur:'POMONA',status:'updated'},
{code:'F284',zone:'CONGELATEUR',cat:'Surgelés',produit:'PLAQUE PAIN DE MIE',unite:'PCE',prix:2.32,qte:5,fournisseur:'SYSCO',status:''},
{code:'F285',zone:'CONGELATEUR',cat:'Surgelés',produit:'PERSILLADE ST250G X8',unite:'SACHET',prix:2.14,qte:4,fournisseur:'SYSCO',status:'updated'},
{code:'F286',zone:'CONGELATEUR',cat:'Surgelés',produit:'PAIN BURGER NATURE',unite:'PCE',prix:0.21,qte:null,fournisseur:'POMONA',status:''},
{code:'F287',zone:'CONGELATEUR',cat:'Surgelés',produit:'PETITS POIS MARAICHER',unite:'KG',prix:2.99,qte:null,fournisseur:'GINEYS',status:''},
{code:'F288',zone:'CONGELATEUR',cat:'Surgelés',produit:'CUBE SAUMON',unite:'KG',prix:9.34,qte:5,fournisseur:'POMONA',status:''},
{code:'F289',zone:'CONGELATEUR',cat:'Surgelés',produit:'POISSON BORDELAISE',unite:'KG',prix:11.12,qte:null,fournisseur:'POMONA',status:''},
{code:'F291',zone:'CONGELATEUR',cat:'Surgelés',produit:'RAVIOLE DAUPHINE TCP LR 1KGX5 ROYANS',unite:'KG',prix:9.793,qte:7,fournisseur:'POMONA',status:'updated'},
{code:'F292',zone:'CONGELATEUR',cat:'Surgelés',produit:'RAVIOLES CHOCOLAT VALRHONA',unite:'KG',prix:8,qte:null,fournisseur:'POMONA',status:''},
{code:'F295',zone:'CONGELATEUR',cat:'Surgelés',produit:'TRUITE ENTIERE',unite:'KG',prix:13.68,qte:3,fournisseur:'SYSCO',status:''},
{code:'F296',zone:'CONGELATEUR',cat:'Surgelés',produit:'QUENELLE DE BROCHET',unite:'KG',prix:6.455,qte:4,fournisseur:'POMONA',status:''},
{code:'F297',zone:'CONGELATEUR',cat:'Surgelés',produit:'STEAK HACHE',unite:'KG',prix:13.05,qte:2,fournisseur:'SYSCO',status:''},
{code:'F298',zone:'CONGELATEUR',cat:'Surgelés',produit:'POISSON MEUNIERE',unite:'KG',prix:6.85,qte:null,fournisseur:'SYSCO',status:''},
{code:'F300',zone:'CONGELATEUR',cat:'Surgelés',produit:'PAIN BURGER BETTERAVE',unite:'PIECE',prix:0.98,qte:15,fournisseur:'SYSCO',status:''},
{code:'F302',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI COULANT CHOCO',unite:'PIECE',prix:0.5,qte:null,fournisseur:'GINEYS',status:''},
{code:'F303',zone:'CONGELATEUR',cat:'Surgelés',produit:'FOIE GRAS',unite:'KG',prix:29.99,qte:null,fournisseur:'POMONA',status:''},
{code:'F304',zone:'CONGELATEUR',cat:'Surgelés',produit:'MERLU',unite:'KG',prix:11.633,qte:null,fournisseur:'GINEYS',status:''},
{code:'F305',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET SOLE',unite:'KG',prix:9.95,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F306',zone:'CONGELATEUR',cat:'Surgelés',produit:'LEGUMES COUSCOUS',unite:'KG',prix:1.34,qte:null,fournisseur:'GINEYS',status:''},
{code:'F311',zone:'CONGELATEUR',cat:'Surgelés',produit:'CHUTE SAUMON FUME ATL. ST1KG X5',unite:'KG',prix:10.329,qte:5,fournisseur:'SYSCO',status:'updated'},
{code:'F312',zone:'CONGELATEUR',cat:'Surgelés',produit:'POIREAUX',unite:'KG',prix:1.74,qte:4,fournisseur:'POMONA',status:''},
{code:'F314',zone:'CONGELATEUR',cat:'Surgelés',produit:'COQUELET',unite:'KG',prix:11.9,qte:null,fournisseur:'POMONA',status:''},
{code:'F315',zone:'CONGELATEUR',cat:'Surgelés',produit:'PESCA CLOIN',unite:'KG',prix:7.522,qte:3,fournisseur:'POMONA',status:''},
{code:'F316',zone:'CONGELATEUR',cat:'Surgelés',produit:'PERSILLADE PIECE',unite:'PIECE',prix:2.156,qte:5,fournisseur:'POMONA',status:'updated'},
{code:'F317',zone:'CONGELATEUR',cat:'Surgelés',produit:'SAUTE BOEUF',unite:'KG',prix:11.99,qte:2.5,fournisseur:'POMONA',status:''},
{code:'F318',zone:'CONGELATEUR',cat:'Surgelés',produit:'LEGUMES MELANGES FESTIF',unite:'KG',prix:3.8,qte:null,fournisseur:'POMONA',status:''},
{code:'F319',zone:'CONGELATEUR',cat:'Surgelés',produit:'FONDANT POULET',unite:'KG',prix:11.2,qte:null,fournisseur:'POMONA',status:''},
{code:'F323',zone:'CONGELATEUR',cat:'Surgelés',produit:'ROUGET',unite:'KG',prix:12.887,qte:null,fournisseur:'POMONA',status:'updated'},
{code:'N017',zone:'CONGELATEUR',cat:'Surgelés',produit:'EGRENE BOEUF',unite:'KG',prix:11.123,qte:2,fournisseur:'SYSCO',status:'new'},
{code:'N018',zone:'CONGELATEUR',cat:'Surgelés',produit:'JARDINIERE LEGUME',unite:'KG',prix:1.286,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N019',zone:'CONGELATEUR',cat:'Surgelés',produit:'DES AUBERGINE',unite:'KG',prix:2.06,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N020',zone:'CONGELATEUR',cat:'Surgelés',produit:'SOUPE POISSON',unite:'KG',prix:3.406,qte:3,fournisseur:'SYSCO',status:'new'},
{code:'N021',zone:'CONGELATEUR',cat:'Surgelés',produit:'DOS COLIN ALASKA',unite:'KG',prix:6.159,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N022',zone:'CONGELATEUR',cat:'Surgelés',produit:'MOULE CUITE',unite:'KG',prix:4.1,qte:3,fournisseur:'SYSCO',status:'new'},
{code:'N023',zone:'CONGELATEUR',cat:'Surgelés',produit:'FRAISE IQF',unite:'KG',prix:4.183,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N024',zone:'CONGELATEUR',cat:'Surgelés',produit:'PETITS POIS FINS',unite:'KG',prix:1.751,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N025',zone:'CONGELATEUR',cat:'Surgelés',produit:'CHAMPIGNON EMINCE',unite:'KG',prix:1.676,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N026',zone:'CONGELATEUR',cat:'Surgelés',produit:'CIBOULETTE',unite:'KG',prix:4.874,qte:3,fournisseur:'SYSCO',status:'new'},
{code:'N027',zone:'CONGELATEUR',cat:'Surgelés',produit:'PETIT PAIN PAVE RUSTIQUE',unite:'CT',prix:22.04,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N028',zone:'CONGELATEUR',cat:'Surgelés',produit:'CUISSE CANETTE BARBARIE',unite:'KG',prix:7.746,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N029',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI FONDANT CHOCOLAT',unite:'PC',prix:0.74,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N030',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI FOND TARTELETTE SALE',unite:'CT',prix:59.99,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N031',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI CROISSANT BEURRE',unite:'CT',prix:21.99,qte:0.8,fournisseur:'SYSCO',status:'new'},
{code:'N032',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI PAIN CHOCOLAT BEURRE',unite:'CT',prix:22.624,qte:0.8,fournisseur:'SYSCO',status:'new'},
{code:'N033',zone:'CONGELATEUR',cat:'Surgelés',produit:'GRIOTTE DENOYAUTEE',unite:'PC',prix:0.373,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N034',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET COLIN LIEU',unite:'KG',prix:8.06,qte:4,fournisseur:'SYSCO',status:'new'},
{code:'N035',zone:'CONGELATEUR',cat:'Surgelés',produit:'DONUT SUCRE',unite:'CT',prix:16.522,qte:0.4,fournisseur:'SYSCO',status:'new'},
{code:'N036',zone:'CONGELATEUR',cat:'Surgelés',produit:'CUISSE CANETTE POMONA',unite:'COL',prix:6.739,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N037',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET ROUGET',unite:'COL',prix:12.887,qte:null,fournisseur:'POMONA',status:'new'},
{code:'P001',zone:'ECONOMAT',cat:'Economat',produit:'GOBELET CAFE KRAFT 10CL',unite:'Sac',prix:2.82,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P002',zone:'ECONOMAT',cat:'Economat',produit:'GOBELET CAFTHE KRAFT 25CL',unite:'Sac',prix:4.919,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P003',zone:'ECONOMAT',cat:'Economat',produit:'LAVETTE MICROFIBRE',unite:'Sac',prix:4.19,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P004',zone:'ECONOMAT',cat:'Economat',produit:'NETTOYANT SOL PIN BID 5L',unite:'Bidon',prix:9.557,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P005',zone:'ECONOMAT',cat:'Economat',produit:'DEGRAISSANT FOUR BID 5L',unite:'Bidon',prix:17.751,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P006',zone:'ECONOMAT',cat:'Economat',produit:'GODET ALUMINIUM 85ML',unite:'Sac',prix:3.883,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P007',zone:'ECONOMAT',cat:'Economat',produit:'NETTOYANT SOL SURFACE BID 5L',unite:'Bidon',prix:23.145,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P008',zone:'ECONOMAT',cat:'Economat',produit:'CHARLOTTE CLIP BLANCHE',unite:'Sac',prix:3.866,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P009',zone:'ECONOMAT',cat:'Economat',produit:'GEL NETTOYANT WC 750ML',unite:'PC',prix:5.42,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P010',zone:'ECONOMAT',cat:'Economat',produit:'PAPIER CUISSON 32X53',unite:'BT',prix:34.88,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P011',zone:'ECONOMAT',cat:'Economat',produit:'MOULE ALUMINIUM GODET 125',unite:'ST',prix:8.86,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P012',zone:'ECONOMAT',cat:'Economat',produit:'PIC BAMBOU GOLF 9CM',unite:'ST',prix:2.06,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P013',zone:'ECONOMAT',cat:'Economat',produit:'MELANGE APERITIF SEAU 2KG',unite:'Seau',prix:17.09,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P014',zone:'ECONOMAT',cat:'Economat',produit:'VINAIGRE ALCOOL GINEYS 1.5L',unite:'Bouteil',prix:1.221,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P015',zone:'ECONOMAT',cat:'Economat',produit:'PESTO VERT',unite:'PC',prix:6.42,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P016',zone:'ECONOMAT',cat:'Economat',produit:'SAUCE PIZZA RODOLFI',unite:'BT',prix:9.22,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P017',zone:'ECONOMAT',cat:'Economat',produit:'PULPE FINE TOMATE RODOLFI',unite:'BT',prix:7.99,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P018',zone:'ECONOMAT',cat:'Economat',produit:'CONFITURE FRAISE 45% 1KG',unite:'PC',prix:9.89,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P019',zone:'ECONOMAT',cat:'Economat',produit:'DOUBLE CONCENTRE TOMATE',unite:'BT',prix:4.38,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P020',zone:'ECONOMAT',cat:'Economat',produit:'NAPPAGE BLOND 900G',unite:'BT',prix:5.99,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P021',zone:'ECONOMAT',cat:'Economat',produit:'HUILE COLZA 5L',unite:'L',prix:2.15,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P022',zone:'ECONOMAT',cat:'Economat',produit:'HUILE OLIVE VIERGE EXTRA SYSCO',unite:'L',prix:8.7,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P023',zone:'ECONOMAT',cat:'Economat',produit:'VINAIGRE CIDRE 5%',unite:'L',prix:3.78,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P024',zone:'ECONOMAT',cat:'Economat',produit:'FARINE BLE T55 SYSCO',unite:'ST',prix:0.92,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P025',zone:'FRIGO 1',cat:'Frigo 1',produit:'CREAM CHEESE CHEVRE',unite:'Seau',prix:5.7,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P026',zone:'FRIGO 1',cat:'Frigo 1',produit:'FROMAGE FRAIS MONTAGNE',unite:'Seau',prix:12.009,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P027',zone:'FRIGO 1',cat:'Frigo 1',produit:'MASCARPONE GRANAROLO',unite:'Seau',prix:3.82,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P028',zone:'FRIGO 1',cat:'Frigo 1',produit:'PARMESAN AOP COPEAUX',unite:'BQ',prix:10.089,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P029',zone:'FRIGO 1',cat:'Frigo 1',produit:'JAMBON PROSCIUTTO PARME',unite:'BQ',prix:12.06,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P030',zone:'FRIGO 1',cat:'Frigo 1',produit:'MOZZARELLA DI BUFALA AOP',unite:'KG',prix:18.0,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P031',zone:'FRIGO 1',cat:'Frigo 1',produit:'MAYONNAISE SYSCO 5L',unite:'SE',prix:13.594,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P032',zone:'FRIGO 1',cat:'Frigo 1',produit:'JAMBON CUIT SUPERIEUR BQ',unite:'KG',prix:10.03,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P033',zone:'FRIGO 1',cat:'Frigo 1',produit:'BEURRE PAST 250G X40',unite:'KG',prix:8.56,qte:null,fournisseur:'SYSCO',status:'updated'},
{code:'P034',zone:'FRIGO 1',cat:'Frigo 1',produit:'BUCHE CHEVRE 23% 1KG',unite:'PC',prix:11.393,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P035',zone:'FRIGO 1',cat:'Frigo 1',produit:'BRIOCHE TRESSEE 600G',unite:'PC',prix:2.89,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P036',zone:'FRIGO 1',cat:'Frigo 1',produit:'YAOURT A LA GRECQUE 2.5L',unite:'S',prix:18.99,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P037',zone:'FRIGO 1',cat:'Frigo 1',produit:'YAOURT GREC 150G',unite:'PC',prix:0.593,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P038',zone:'FRIGO 1',cat:'Frigo 1',produit:'CHEDDAR ROUGE BQ',unite:'KG',prix:13.76,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P039',zone:'FRIGO 1',cat:'Frigo 1',produit:'BILLE MOZZARELLA 5G',unite:'KG',prix:14.97,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P040',zone:'CONGELATEUR',cat:'Surgelés',produit:'FOIE GRAS CANARD ENTIER',unite:'PCE',prix:38.99,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'P041',zone:'CONGELATEUR',cat:'Surgelés',produit:'FOND TARTELETTE D10 84PC',unite:'PC',prix:0.373,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P042',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET POULET IQF 110G',unite:'KG',prix:7.87,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P043',zone:'CONGELATEUR',cat:'Surgelés',produit:'PAIN BAGNAT 160G',unite:'CT',prix:25.7,qte:0.1,fournisseur:'SYSCO',status:'new'},
{code:'P044',zone:'CONGELATEUR',cat:'Surgelés',produit:'FOND TARTELETTE SUCREE D10',unite:'PC',prix:0.352,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P045',zone:'CONGELATEUR',cat:'Surgelés',produit:'CUISSE POULET HALAL 230G',unite:'KG',prix:4.518,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P046',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI NAVETTE NATURE 15G',unite:'CT',prix:12.01,qte:0.8,fournisseur:'SYSCO',status:'new'},
{code:'P047',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET SAUMON SAUVAGE ROSE',unite:'KG',prix:12.537,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P048',zone:'CONGELATEUR',cat:'Surgelés',produit:'PAVE SAUMON ATLANTIQUE 150G',unite:'KG',prix:16.392,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P049',zone:'CONGELATEUR',cat:'Surgelés',produit:'PERSILLADE SYSCO 250G',unite:'KG',prix:12.82,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P050',zone:'CONGELATEUR',cat:'Surgelés',produit:'LEGUME RATATOUILLE IQF',unite:'KG',prix:1.478,qte:7.5,fournisseur:'SYSCO',status:'new'},
{code:'P051',zone:'CONGELATEUR',cat:'Surgelés',produit:'FALAFEL SYSCO 20G',unite:'KG',prix:7.036,qte:4,fournisseur:'SYSCO',status:'new'},
{code:'P052',zone:'CONGELATEUR',cat:'Surgelés',produit:'FEUILLE GENOISE NATURE',unite:'PC',prix:4.68,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P053',zone:'CONGELATEUR',cat:'Surgelés',produit:'BILLE FRAMBOISE IQF',unite:'KG',prix:9.32,qte:1,fournisseur:'SYSCO',status:'new'},
{code:'P054',zone:'CONGELATEUR',cat:'Surgelés',produit:'FOND TARTE BRISEE 27CM',unite:'PC',prix:2.096,qte:2,fournisseur:'SYSCO',status:'new'},
{code:'P055',zone:'CONGELATEUR',cat:'Surgelés',produit:'SUPREME POULET JEUNE VF',unite:'KG',prix:9.74,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P056',zone:'CONGELATEUR',cat:'Surgelés',produit:'ECHALOTE CISELEE IQF',unite:'KG',prix:3.41,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P057',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI TARTELETTE SALEE TOMATE BASIL',unite:'CT',prix:45.91,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P058',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI FOND TARTELETTE ROND SUCRE',unite:'CT',prix:59.99,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P059',zone:'BOISSONS',cat:'Boissons',produit:'JUS CITRON JAUNE 1L',unite:'PC',prix:4.190,qte:null,fournisseur:'SYSCO',status:'updated'},
{code:'P060',zone:'BOISSONS',cat:'Boissons',produit:'JUS DE YUZU 25CL',unite:'BO',prix:13.99,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'P062',zone:'FRIGO 2',cat:'Frigo 2',produit:'CITRON VERT',unite:'KG',prix:4.8,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P063',zone:'FRIGO 2',cat:'Frigo 2',produit:'MENTHE BOTTE',unite:'BOTTE',prix:1.19,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P064',zone:'FRIGO 2',cat:'Frigo 2',produit:'ECHALOTE NOUVELLE',unite:'KG',prix:3.6,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P065',zone:'FRIGO 2',cat:'Frigo 2',produit:'OIGNON ROUGE',unite:'KG',prix:2.44,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P066',zone:'FRIGO 2',cat:'Frigo 2',produit:'PDT AGATA',unite:'KG',prix:1.19,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P067',zone:'FRIGO 2',cat:'Frigo 2',produit:'PERSIL PLAT FRA CI',unite:'BOTTE',prix:1.19,qte:null,fournisseur:'UNION PRIMEURS',status:'updated'},
{code:'P068',zone:'FRIGO 2',cat:'Frigo 2',produit:'RADIS BOTTE',unite:'BOTTE',prix:1.35,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P069',zone:'FRIGO 2',cat:'Frigo 2',produit:'CONCOMBRE',unite:'PCE',prix:2.1,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P070',zone:'FRIGO 2',cat:'Frigo 2',produit:'TOMATE CERISE',unite:'KG',prix:3.96,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P071',zone:'FRIGO 2',cat:'Frigo 2',produit:'MESCLUN ROQUETTE',unite:'KG',prix:7.8,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P072',zone:'FRIGO 2',cat:'Frigo 2',produit:'CELERI BRANCHE',unite:'PCE',prix:2.4,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P073',zone:'FRIGO 2',cat:'Frigo 2',produit:'FRAISE FRAICHE BQ',unite:'KG',prix:6.8,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P074',zone:'FRIGO 2',cat:'Frigo 2',produit:'AUBERGINE',unite:'KG',prix:2.96,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P075',zone:'FRIGO 2',cat:'Frigo 2',produit:'RAISIN BLANC',unite:'KG',prix:4.96,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P076',zone:'FRIGO 2',cat:'Frigo 2',produit:'TOMATE CALIBREE',unite:'KG',prix:2.65,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P077',zone:'FRIGO 2',cat:'Frigo 2',produit:'POIVRON ROUGE',unite:'KG',prix:3.9,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P078',zone:'FRIGO 2',cat:'Frigo 2',produit:'POIVRON JAUNE',unite:'KG',prix:3.9,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P079',zone:'FRIGO 2',cat:'Frigo 2',produit:'POIVRON VERT',unite:'KG',prix:3.4,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P080',zone:'FRIGO 2',cat:'Frigo 2',produit:'FRAMBOISE FRAICHE',unite:'KG',prix:2.96,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P082',zone:'FRIGO 2',cat:'Frigo 2',produit:'NECTARINE BLANCHE',unite:'KG',prix:3.6,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P083',zone:'FRIGO 2',cat:'Frigo 2',produit:'ANETH BOTTE',unite:'BOTTE',prix:1.19,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P084',zone:'FRIGO 2',cat:'Frigo 2',produit:'SALADE BATAVIA FRANCE CI HVE',unite:'PCE',prix:1.5,qte:null,fournisseur:'UNION PRIMEURS',status:'updated'},
{code:'P085',zone:'FRIGO 2',cat:'Frigo 2',produit:'SALADE FRISEE',unite:'PCE',prix:3.4,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P086',zone:'FRIGO 2',cat:'Frigo 2',produit:'CERISE FRAICHE',unite:'KG',prix:9.6,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P087',zone:'FRIGO 2',cat:'Frigo 2',produit:'OIGNON JAUNE',unite:'KG',prix:0.98,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P088',zone:'FRIGO 2',cat:'Frigo 2',produit:'CORIANDRE BOTTE FRANCE CI',unite:'BOTTE',prix:1.19,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P089',zone:'FRIGO 2',cat:'Frigo 2',produit:'PASTEQUE',unite:'KG',prix:2.6,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'P090',zone:'FRIGO 2',cat:'Frigo 2',produit:'PDT BINTJE',unite:'KG',prix:0.98,qte:null,fournisseur:'UNION PRIMEURS',status:'new'}
,
{code:'N038',zone:'BOISSONS',cat:'Boissons',produit:'FÛT 6L HOEGAARDEN BLANCHE',unite:'Fût',prix:25.75,qte:2,fournisseur:'PERFECTDRAFT',status:'new'},
{code:'N039',zone:'ECONOMAT',cat:'Economat',produit:'BOBINE A DEVIDAGE CENTRAL ECOLABEL C=6',unite:'Col',prix:12.642,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'N040',zone:'ECONOMAT',cat:'Economat',produit:'LUNCH BOX REFERMABLE TRANSPARENT PP 1000CC SAC=50',unite:'Sac',prix:12.35,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'N041',zone:'ECONOMAT',cat:'Economat',produit:'QUINOA BLOND DE FRANCE SAC 2.5KG',unite:'Kg',prix:5.75,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'N042',zone:'BOISSONS',cat:'Boissons',produit:'JUS MULTIVITAMINE 1L HAPPY DAY C=12',unite:'Brique',prix:2.056,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'N043',zone:'ECONOMAT',cat:'Economat',produit:'GANT NITRILE NOIR TAILLE 9 L BTE=100',unite:'Bte',prix:8.558,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'N044',zone:'ECONOMAT',cat:'Economat',produit:'MINI BROCHETTE BAMBOU RUBAN 9CM SAC=200',unite:'Sac',prix:4.957,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'N045',zone:'ECONOMAT',cat:'Economat',produit:'BROCHETTE BAMBOU RUBAN 15CM SAC=200',unite:'Sac',prix:6.337,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'N046',zone:'CONGELATEUR',cat:'Surgelés',produit:'FRITE LA CRISPY A/P BI-TEMPERATURE CARIGEL C=4X2.5KG',unite:'Kg',prix:2.6,qte:11,fournisseur:'GINEYS',status:'new'},
{code:'N047',zone:'CONGELATEUR',cat:'Surgelés',produit:'LAMELLE DE KEBAB VOLAILLE VEAU GRILLEE HALAL SAC 850G',unite:'Sac',prix:9.2,qte:1.8,fournisseur:'GINEYS',status:'new'},
{code:'N048',zone:'FRIGO 1',cat:'BOF',produit:'PESTO ROSSO ALLA SICILIANA SEAU 500G',unite:'Seau',prix:10.95,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'N050',zone:'BOISSONS',cat:'Boissons',produit:'JUS DE PECHE 20CL RAUCH C=24',unite:'Bouteille',prix:0.89,qte:18,fournisseur:'GINEYS',status:'new'},
{code:'N051',zone:'ECONOMAT',cat:'Economat',produit:'LIQUIDE LAVE VERRE CARE HYGIENE BID 1L',unite:'Bouteille',prix:6.529,qte:null,fournisseur:'GINEYS',status:'new'},
{code:'N052',zone:'CONGELATEUR',cat:'Surgelés',produit:'SUPRM PLT VF 160/200G 3KG FSA',unite:'Kg',prix:8.261,qte:3,fournisseur:'POMONA',status:'new'},
{code:'N053',zone:'CONGELATEUR',cat:'Surgelés',produit:'PLAQ FEUILL MARG 2.5MM 500GX16',unite:'PU',prix:2.055,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N054',zone:'CONGELATEUR',cat:'Surgelés',produit:'FALAFEL FEVE MENTHE 2.5KGX2',unite:'Kg',prix:6.902,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N055',zone:'CONGELATEUR',cat:'Surgelés',produit:'FD TARTEL SUCRE BEUR CRU 10CM 41GX45',unite:'PU',prix:0.347,qte:40,fournisseur:'POMONA',status:'new'},
{code:'N056',zone:'ECONOMAT',cat:'Economat',produit:'SAUCE PESTO 500GX10 ZINI',unite:'SAC',prix:8.058,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N057',zone:'CONGELATEUR',cat:'Surgelés',produit:'FD TARTEL BRISE BEUR CRU 10CM 60GX75',unite:'PU',prix:0.35,qte:120,fournisseur:'POMONA',status:'new'},
{code:'N058',zone:'CONGELATEUR',cat:'Surgelés',produit:'FLT COLIN LIEU IQF QSA MSC 120/140G 5KG',unite:'Kg',prix:8.06,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N059',zone:'CONGELATEUR',cat:'Surgelés',produit:'PIZZA TOMATE MOZZA IND 65G X50',unite:'PC',prix:0.61,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N060',zone:'ECONOMAT',cat:'Economat',produit:'CORNICHON 150 ET BT 5/1 PNE2.12KG X3',unite:'BT',prix:18.3,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N061',zone:'ECONOMAT',cat:'Economat',produit:'OLIVE VERTE DENOYAUTEE 34/40 BT4/4PNE360G',unite:'BT',prix:4.75,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N062',zone:'ECONOMAT',cat:'Economat',produit:'MOUTARDE A L\'ANCIENNE SEAU 5KG',unite:'Kg',prix:6.3,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N063',zone:'ECONOMAT',cat:'Economat',produit:'SEL FIN SEAU 5KG',unite:'SE',prix:9.9,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N064',zone:'ECONOMAT',cat:'Economat',produit:'SEMOULE COUSCOUS MOY SYE ST5KG',unite:'ST',prix:12.16,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N065',zone:'ECONOMAT',cat:'Economat',produit:'HUILE D\'OLIVE VIERGE EXTRA 1L',unite:'L',prix:5.9,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N066',zone:'FRIGO 1',cat:'BOF',produit:'YA GREC 10%MG SE1KG X4',unite:'Kg',prix:5.46,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N067',zone:'FRIGO 1',cat:'BOF',produit:'COMTE 9M AOP 400G X12',unite:'PC',prix:9.49,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N068',zone:'CONGELATEUR',cat:'Surgelés',produit:'CUIS POULET HALAL DEJ IQF 230/260G CT5KG',unite:'Kg',prix:4.518,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N069',zone:'ECONOMAT',cat:'Economat',produit:'HUILE VEGETALE FRITURE SYC 15L 7.5L X2',unite:'L',prix:2.35,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N070',zone:'CONGELATEUR',cat:'Surgelés',produit:'FRITE INCURVEE BI-TEMP SYC ST 2.5KG X4',unite:'Kg',prix:1.736,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N071',zone:'CONGELATEUR',cat:'Surgelés',produit:'GNOCCHI PDT ST1KG X6',unite:'Kg',prix:2.203,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N072',zone:'ECONOMAT',cat:'Economat',produit:'COULIS TOMATE BT 2/1 2KG X3',unite:'BT',prix:8.32,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N073',zone:'FRIGO 1',cat:'BOF',produit:'OEUF ALV MOY SOL 53/63G X90',unite:'PC',prix:0.265,qte:1.8,fournisseur:'SYSCO',status:'new'},
{code:'N074',zone:'ECONOMAT',cat:'Economat',produit:'CAPRE CAPUCINE BT 4/4 PNE 480G X6',unite:'BT',prix:7.81,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N075',zone:'CONGELATEUR',cat:'Surgelés',produit:'CUIS CANETTE BARBARIE DEJ VF 170/220G 5K',unite:'Kg',prix:7.746,qte:2.5,fournisseur:'SYSCO',status:'new'},
{code:'N076',zone:'ECONOMAT',cat:'Economat',produit:'FOND BLC VOLAILLE SYC BT750G X6',unite:'BT',prix:13.79,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N077',zone:'ECONOMAT',cat:'Economat',produit:'CURRY DOUX BT430G X8',unite:'BT',prix:9.6,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N078',zone:'BOISSONS',cat:'Boissons',produit:'VIN DE TABLE VCE ROSE BIB 10L',unite:'BAG',prix:13.001,qte:null,fournisseur:'TRANSGOURMET',status:'new'},
{code:'N079',zone:'ECONOMAT',cat:'Economat',produit:'HUILE FRITURE 5L TG ECONOMY',unite:'BD',prix:12.995,qte:null,fournisseur:'TRANSGOURMET',status:'new'},
{code:'N080',zone:'ECONOMAT',cat:'Economat',produit:'OURAGAN PRO DEBOUCHEUR GEL 1L',unite:'BD',prix:10.0,qte:null,fournisseur:'TRANSGOURMET',status:'new'},
{code:'N081',zone:'ECONOMAT',cat:'Economat',produit:'GANT NITRILE NOIR T.L X100',unite:'BT',prix:7.6,qte:null,fournisseur:'TRANSGOURMET',status:'new'},
{code:'N082',zone:'ECONOMAT',cat:'Economat',produit:'SAC DECHET 130L NOIR BD RFC X10',unite:'RL',prix:1.551,qte:null,fournisseur:'TRANSGOURMET',status:'new'},
{code:'N083',zone:'ECONOMAT',cat:'Economat',produit:'SEL ADOUCISSEUR EAU 10KG',unite:'SAC',prix:8.81,qte:null,fournisseur:'TRANSGOURMET',status:'new'},
{code:'N084',zone:'ECONOMAT',cat:'Economat',produit:'SERVIETTE 39X39 DINNER GAUFRE BLANC X50',unite:'SHT',prix:4.04,qte:null,fournisseur:'TRANSGOURMET',status:'new'}



,
{code:'F014',zone:'BOISSONS',cat:'Boissons',produit:'COGNAC LE PALIN 70CL',unite:'PCE',prix:11.05,qte:1.2,fournisseur:'France Boissons',status:''},
{code:'F015',zone:'BOISSONS',cat:'Boissons',produit:'COTE DU RHONE MARGERANS',unite:'75CL',prix:3.91,qte:null,fournisseur:'Micand',status:''},
{code:'F017',zone:'BOISSONS',cat:'Boissons',produit:'COTES DU RHONE ROUGE DOM ALIBERT',unite:'75CL',prix:2.99,qte:null,fournisseur:'France Boissons',status:''},
{code:'F020',zone:'BOISSONS',cat:'Boissons',produit:'CREMANT LOUIS BOUILLOT',unite:'71CL',prix:0.0,qte:null,fournisseur:'',status:''},
{code:'F023',zone:'BOISSONS',cat:'Boissons',produit:'ESTOUBLON VIN',unite:'75CL',prix:8.6,qte:1,fournisseur:'MICAND',status:''},
{code:'F026',zone:'BOISSONS',cat:'Boissons',produit:'GENEPI TETRAS',unite:'70CL',prix:26.8,qte:null,fournisseur:'Micand',status:''},
{code:'F028',zone:'BOISSONS',cat:'Boissons',produit:'GIN',unite:'70CL',prix:7.68,qte:null,fournisseur:'PROMOCASH',status:''},
{code:'F029',zone:'BOISSONS',cat:'Boissons',produit:'JUS DE POMME 1L PK6PC',unite:'L',prix:2.1,qte:null,fournisseur:'Transgourmet',status:'updated'},
{code:'F030',zone:'BOISSONS',cat:'Boissons',produit:'JUS DE POMME PURE',unite:'L',prix:2.1,qte:null,fournisseur:'Pomona',status:'updated'},
{code:'F033',zone:'BOISSONS',cat:'Boissons',produit:'JUS ORANGE',unite:'L',prix:2.76,qte:null,fournisseur:'GINEYS',status:'updated'},
{code:'F034',zone:'BOISSONS',cat:'Boissons',produit:'JUS ORANGE PUR BIO',unite:'L',prix:2.72,qte:null,fournisseur:'Pomona',status:''},
{code:'F037',zone:'BOISSONS',cat:'Boissons',produit:'LIMONCELLO',unite:'70CL',prix:5.18,qte:0.2,fournisseur:'France Boissons',status:''},
{code:'F038',zone:'BOISSONS',cat:'Boissons',produit:'MARSANNE',unite:'71CL',prix:5.35,qte:null,fournisseur:'',status:''},
{code:'F039',zone:'BOISSONS',cat:'Boissons',produit:'MOUVREDE',unite:'75CL',prix:6.0,qte:null,fournisseur:'Micand',status:''},
{code:'F050',zone:'BOISSONS',cat:'Boissons',produit:'COFFRET BIERE',unite:'unité',prix:9.9,qte:null,fournisseur:'',status:''},
{code:'F057',zone:'BOISSONS',cat:'Boissons',produit:'PETIT PONT BLANC 5L',unite:'L',prix:3.224,qte:null,fournisseur:'Micand',status:''},
{code:'F060',zone:'BOISSONS',cat:'Boissons',produit:'PULCO CITRON',unite:'L',prix:2.35,qte:null,fournisseur:'PROMOCASH',status:''},
{code:'F061',zone:'BOISSONS',cat:'Boissons',produit:'PULCO CITRON VERT',unite:'L',prix:2.6,qte:null,fournisseur:'PROMOCASH',status:''},
{code:'F062',zone:'BOISSONS',cat:'Boissons',produit:'PETIT PONT ROUGE 5L',unite:'L',prix:3.224,qte:null,fournisseur:'Micand',status:''},
{code:'F063',zone:'BOISSONS',cat:'Boissons',produit:'PORTO ROZES',unite:'75CL',prix:5.46,qte:null,fournisseur:'France Boissons',status:''},
{code:'F064',zone:'BOISSONS',cat:'Boissons',produit:'RHUM BLANC ANEJO 70CL',unite:'70CL',prix:15.92,qte:null,fournisseur:'Micand',status:''},
{code:'F067',zone:'BOISSONS',cat:'Boissons',produit:'RHUM BLANC ST JAMES 70CL',unite:'75CL',prix:11.19,qte:null,fournisseur:'France Boissons',status:''},
{code:'F068',zone:'BOISSONS',cat:'Boissons',produit:'SAN PELLEGRINO',unite:'L',prix:1.43,qte:null,fournisseur:'France Boissons',status:''},
{code:'F070',zone:'BOISSONS',cat:'Boissons',produit:'SIROP CANNE CANADOU 5L',unite:'L',prix:2.91,qte:null,fournisseur:'France Boissons',status:''},
{code:'F072',zone:'BOISSONS',cat:'Boissons',produit:'SIROP DE FRAISE',unite:'L',prix:5.4,qte:null,fournisseur:'France Boissons',status:''},
{code:'F076',zone:'BOISSONS',cat:'Boissons',produit:'SIROP D\'ORGEAT',unite:'L',prix:3.6,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F077',zone:'BOISSONS',cat:'Boissons',produit:'SYRAH',unite:'PIECE',prix:5.97,qte:null,fournisseur:'',status:''},
{code:'F078',zone:'BOISSONS',cat:'Boissons',produit:'SIROP CERISE',unite:'L',prix:6.22,qte:null,fournisseur:'France Boissons',status:''},
{code:'F079',zone:'BOISSONS',cat:'Boissons',produit:'TARIQUET ENTRACTE',unite:'75CL',prix:6.0,qte:null,fournisseur:'Micand',status:''},
{code:'F081',zone:'BOISSONS',cat:'Boissons',produit:'VIN DE NOIX',unite:'70CL',prix:12.53,qte:null,fournisseur:'Micand',status:''},
{code:'F082',zone:'BOISSONS',cat:'Boissons',produit:'VINSAUVAGE',unite:'75CL',prix:8.6,qte:null,fournisseur:'MICAND',status:''},
{code:'F083',zone:'BOISSONS',cat:'Boissons',produit:'VIOGNIER MICAND 100%',unite:'75CL',prix:4.98,qte:null,fournisseur:'Micand',status:''},
{code:'F087',zone:'CAFETERIE',cat:'Cafeterie',produit:'CACAO POUDRE CAFETERIE',unite:'KG',prix:13.55,qte:null,fournisseur:'FRAICA',status:''},
{code:'F093',zone:'CAFETERIE',cat:'Cafeterie',produit:'INFUSION TILLEUL X100',unite:'BTE',prix:12.81,qte:null,fournisseur:'FRAICA',status:''},
{code:'F097',zone:'CAFETERIE',cat:'Cafeterie',produit:'INFUSION VERVEINE X100',unite:'BTE',prix:8.9,qte:null,fournisseur:'FRAICA',status:''},
{code:'F098',zone:'CAFETERIE',cat:'Cafeterie',produit:'SPECULOS SACHET',unite:'COLIS',prix:13.291,qte:null,fournisseur:'GINEYS',status:''},
{code:'F101',zone:'CAFETERIE',cat:'Cafeterie',produit:'THE LIPTON YELLOW X100 TG',unite:'BTE',prix:9.8,qte:0.69,fournisseur:'Transgourmet',status:''},
{code:'F104',zone:'CAFETERIE',cat:'Cafeterie',produit:'THE VERT',unite:'BTE',prix:10.9,qte:null,fournisseur:'FRAICA',status:''},
{code:'F107',zone:'CAFETERIE',cat:'Cafeterie',produit:'THE VERT MENTHE BIO',unite:'PCE',prix:2.797,qte:null,fournisseur:'Transgourmet',status:''},
{code:'F109',zone:'ECONOMAT',cat:'Economat',produit:'AROME VANILLE',unite:'L',prix:16.48,qte:null,fournisseur:'SYSCO',status:''},
{code:'F110',zone:'ECONOMAT',cat:'Economat',produit:'AMANDES ENTIERES',unite:'KG',prix:8.446,qte:null,fournisseur:'GINEYS',status:''},
{code:'F113',zone:'ECONOMAT',cat:'Economat',produit:'BOUILLON LEGUMES MAGGI',unite:'POT',prix:16.4,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F115',zone:'ECONOMAT',cat:'Economat',produit:'CANELLE X 500G',unite:'BTE',prix:8.476,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F117',zone:'ECONOMAT',cat:'Economat',produit:'CEREALES GOURMANDES',unite:'KG',prix:5.251,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F120',zone:'ECONOMAT',cat:'Economat',produit:'CLOU DE GIROFLE X 300G',unite:'POT',prix:7.0,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F123',zone:'ECONOMAT',cat:'Economat',produit:'PULPE TOMATE BTE 5/1',unite:'BTE',prix:10.3,qte:2,fournisseur:'SYSCO',status:''},
{code:'F126',zone:'ECONOMAT',cat:'Economat',produit:'CUMIN POUDRE 400G',unite:'SAC',prix:8.277,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F127',zone:'ECONOMAT',cat:'Economat',produit:'CURCUMA MOULU X KG',unite:'SAC',prix:12.0,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F131',zone:'ECONOMAT',cat:'Economat',produit:'FLEUR DE SEL 500G',unite:'SACHET',prix:10.311,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F133',zone:'ECONOMAT',cat:'Economat',produit:'FOND DE VEAU LIE 1KG',unite:'BTE',prix:11.99,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F134',zone:'ECONOMAT',cat:'Economat',produit:'FOND FORESTIERE',unite:'BTE',prix:14.56,qte:null,fournisseur:'AUTRE',status:''},
{code:'F136',zone:'ECONOMAT',cat:'Economat',produit:'BOUILLON VOLAILLE X 750G',unite:'BTE',prix:13.94,qte:null,fournisseur:'SYSCO',status:''},
{code:'F139',zone:'ECONOMAT',cat:'Economat',produit:'GINGEMBRE',unite:'BTE',prix:11.5,qte:0.3,fournisseur:'EPISAVEUR',status:''},
{code:'F141',zone:'ECONOMAT',cat:'Economat',produit:'HUILE NOISETTES 50CL',unite:'BIDON',prix:5.303,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F143',zone:'ECONOMAT',cat:'Economat',produit:'HUILE SESAME',unite:'BTL',prix:8.79,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F144',zone:'ECONOMAT',cat:'Economat',produit:'JUS CITRON',unite:'BTL',prix:3.95,qte:null,fournisseur:'SYSCO',status:''},
{code:'F147',zone:'ECONOMAT',cat:'Economat',produit:'KNOR TEXTURE',unite:'BTE',prix:15.56,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F149',zone:'ECONOMAT',cat:'Economat',produit:'LENTILLES CORAIL',unite:'KG',prix:2.148,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F153',zone:'ECONOMAT',cat:'Economat',produit:'MAYONNAISE DISTRIBUTEUR',unite:'PCE',prix:46.55,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F154',zone:'ECONOMAT',cat:'Economat',produit:'MELANGE APERITIF HORECA MIX 5KG',unite:'PCE',prix:24.75,qte:null,fournisseur:'GINEYS',status:''},
{code:'F155',zone:'ECONOMAT',cat:'Economat',produit:'MELANGE CURRY MADRAS',unite:'BTE',prix:6.49,qte:1,fournisseur:'AUTRE',status:''},
{code:'F157',zone:'ECONOMAT',cat:'Economat',produit:'MOUTARDE DE DIJON SEAU 5KG',unite:'KG',prix:7.709,qte:null,fournisseur:'GINEYS',status:''},
{code:'F159',zone:'ECONOMAT',cat:'Economat',produit:'MUSCADE X 435G',unite:'SAC',prix:8.66,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F160',zone:'ECONOMAT',cat:'Economat',produit:'NAPPAGE',unite:'KG',prix:2.8,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F165',zone:'ECONOMAT',cat:'Economat',produit:'OIGNONS FRITS',unite:'KG',prix:10.62,qte:null,fournisseur:'SYSCO',status:''},
{code:'F168',zone:'ECONOMAT',cat:'Economat',produit:'POIVRE GRIS MIGNONETTE',unite:'KG',prix:8.725,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F170',zone:'ECONOMAT',cat:'Economat',produit:'PRALINE AMANDES NOISETTES',unite:'KG',prix:11.59,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F171',zone:'ECONOMAT',cat:'Economat',produit:'PRALINE CONCASSEE 1KG',unite:'KG',prix:8.016,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F174',zone:'ECONOMAT',cat:'Economat',produit:'RIZ ROUGE COMPLET',unite:'KG',prix:6.76,qte:null,fournisseur:'SYSCO',status:''},
{code:'F175',zone:'ECONOMAT',cat:'Economat',produit:'RIZ LONG INDICA 5KG',unite:'KG',prix:2.29,qte:4,fournisseur:'GINEYS',status:''},
{code:'F176',zone:'ECONOMAT',cat:'Economat',produit:'RIZ THAI X 5KG',unite:'KG',prix:2.6,qte:null,fournisseur:'GINEYS',status:''},
{code:'F177',zone:'ECONOMAT',cat:'Economat',produit:'SARDINE',unite:'BTE',prix:2.89,qte:null,fournisseur:'GINEYS',status:''},
{code:'F178',zone:'ECONOMAT',cat:'Economat',produit:'SAUCE SOJA KIKKOMAN',unite:'L',prix:8.95,qte:1,fournisseur:'TRANSGOURMET',status:''},
{code:'F179',zone:'ECONOMAT',cat:'Economat',produit:'SEL FIN/GROS SEAU 5KG',unite:'SEAU',prix:7.497,qte:2,fournisseur:'TRANSGOURMET',status:''},
{code:'F180',zone:'ECONOMAT',cat:'Economat',produit:'SPAGHETTIS X 3KG',unite:'KG',prix:3.2,qte:20,fournisseur:'TRANSGOURMET',status:''},
{code:'F181',zone:'ECONOMAT',cat:'Economat',produit:'SPRAY DE GRAISSAGE',unite:'PCE',prix:2.599,qte:2,fournisseur:'GINEYS',status:''},
{code:'F182',zone:'ECONOMAT',cat:'Economat',produit:'SUCRE GLACE',unite:'BOITE',prix:2.35,qte:0.75,fournisseur:'GINEYS',status:''},
{code:'F183',zone:'ECONOMAT',cat:'Economat',produit:'SUCRE CASSONADE',unite:'KG',prix:7.23,qte:7,fournisseur:'SYSCO',status:''},
{code:'F185',zone:'ECONOMAT',cat:'Economat',produit:'CONCHIGLIONI',unite:'KG',prix:6.0,qte:1,fournisseur:'TRANSGOURMET',status:''},
{code:'F187',zone:'ECONOMAT',cat:'Economat',produit:'TABASCO',unite:'FLACON',prix:6.72,qte:1,fournisseur:'EPISAVEUR',status:''},
{code:'F188',zone:'ECONOMAT',cat:'Economat',produit:'VIN ROUGE BIB 10L',unite:'L',prix:2.76,qte:null,fournisseur:'GINEYS',status:''},
{code:'F189',zone:'ECONOMAT',cat:'Economat',produit:'VINAIGRE BALSAMIQUE',unite:'L',prix:7.45,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F190',zone:'ECONOMAT',cat:'Economat',produit:'VINAIGRE BALSAMIQUE IGP X 2L',unite:'PCE',prix:8.621,qte:null,fournisseur:'EPISAVEUR',status:''},
{code:'F191',zone:'ECONOMAT',cat:'Economat',produit:'VINAIGRE BLANC',unite:'L',prix:0.9,qte:6,fournisseur:'GINEYS',status:''},
{code:'F192',zone:'ECONOMAT',cat:'Economat',produit:'ZAATAR',unite:'BTE',prix:7.86,qte:null,fournisseur:'AUTRE',status:''},
{code:'F194',zone:'FRIGO 1',cat:'FRAIS BCP',produit:'SAUCE TARTUFFA',unite:'BOCAL',prix:11.4,qte:null,fournisseur:'POMONA',status:''},
{code:'F201',zone:'FRIGO 1',cat:'BOF',produit:'ANCHOIS A HUILE',unite:'SEAU',prix:11.836,qte:null,fournisseur:'GINEYS',status:''},
{code:'F207',zone:'FRIGO 1',cat:'BOF',produit:'BUCHE CHEVRE',unite:'KG',prix:10.664,qte:null,fournisseur:'POMONA',status:''},
{code:'F209',zone:'FRIGO 1',cat:'BOF',produit:'EMMENTAL RAPE 29% LFR 1KGX10 B&E',unite:'KG',prix:7.206,qte:null,fournisseur:'POMONA',status:'updated'},
{code:'F211',zone:'FRIGO 1',cat:'BOF',produit:'MASCARPONE',unite:'POT',prix:3.9,qte:null,fournisseur:'POMONA',status:''},
{code:'F213',zone:'FRIGO 1',cat:'BOF',produit:'LAIT COCO',unite:'L',prix:5.95,qte:null,fournisseur:'GINEYS',status:''},
{code:'F218',zone:'FRIGO 1',cat:'BOF',produit:'MOZZARELLA FRAICHE 22%MG PAIN 1KG',unite:'KG',prix:7.933,qte:null,fournisseur:'POMONA',status:'updated'},
{code:'F219',zone:'FRIGO 1',cat:'BOF',produit:'MOZZA RAPE',unite:'KG',prix:6.0,qte:null,fournisseur:'POMONA',status:''},
{code:'F220',zone:'FRIGO 1',cat:'BOF',produit:'FETA',unite:'KG',prix:15.26,qte:null,fournisseur:'POMONA',status:''},
{code:'F221',zone:'FRIGO 1',cat:'BOF',produit:'MOZZA BOULE',unite:'PCE',prix:1.1,qte:null,fournisseur:'POMONA',status:''},
{code:'F222',zone:'FRIGO 1',cat:'BOF',produit:'ST MARCELLIN',unite:'PCE',prix:1.23,qte:null,fournisseur:'GINEYS',status:''},
{code:'F223',zone:'FRIGO 1',cat:'BOF',produit:'FROMAGE TARTIFLETTE',unite:'KG',prix:9.99,qte:null,fournisseur:'GINEYS',status:''},
{code:'F234',zone:'FRIGO 2',cat:'Fruits et légumes',produit:'ENDIVES',unite:'KG',prix:2.96,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F236',zone:'FRIGO 2',cat:'Fruits et légumes',produit:'GINGEMBRE FRAIS',unite:'KG',prix:7.8,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F237',zone:'FRIGO 2',cat:'Fruits et légumes',produit:'KIWI',unite:'PCE',prix:0.55,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F243',zone:'FRIGO 2',cat:'Fruits et légumes',produit:'POIRE',unite:'KG',prix:2.75,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F244',zone:'FRIGO 2',cat:'Fruits et légumes',produit:'PRUNE ROUGE',unite:'KG',prix:3.8,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F246',zone:'FRIGO 2',cat:'Fruits et légumes',produit:'POMME DE TERRE GRENAILLE',unite:'KG',prix:1.96,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F250',zone:'FRIGO 2',cat:'Fruits et légumes',produit:'CHOU FLEUR',unite:'KG',prix:2.4,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F251',zone:'FRIGO 2',cat:'Fruits et légumes',produit:'MELON',unite:'PCE',prix:2.96,qte:null,fournisseur:'UNION PRIMEURS',status:''},
{code:'F256',zone:'CONGELATEUR',cat:'Surgelés',produit:'ASSORTIMENTS MACARONS',unite:'BTE',prix:29.992,qte:null,fournisseur:'POMONA',status:''},
{code:'F267',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET LOUP',unite:'KG',prix:10.85,qte:null,fournisseur:'SYSCO',status:''},
{code:'F270',zone:'CONGELATEUR',cat:'Surgelés',produit:'FLAN',unite:'PCE',prix:9.08,qte:null,fournisseur:'GINEYS',status:''},
{code:'F272',zone:'CONGELATEUR',cat:'Surgelés',produit:'FRAISES SURGELES',unite:'KG',prix:4.9,qte:null,fournisseur:'SYSCO',status:''},
{code:'F273',zone:'CONGELATEUR',cat:'Surgelés',produit:'FRITES BI TEMPERATURE',unite:'KG',prix:2.49,qte:12.5,fournisseur:'GINEYS',status:''},
{code:'F274',zone:'CONGELATEUR',cat:'Surgelés',produit:'FRUITS DE MER',unite:'KG',prix:6.2,qte:null,fournisseur:'POMONA',status:''},
{code:'F278',zone:'CONGELATEUR',cat:'Surgelés',produit:'ENTRECOTE 250G',unite:'KG',prix:18.6,qte:null,fournisseur:'GINEYS',status:''},
{code:'F279',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI FOND TARTELETTE SABLEE',unite:'PCE',prix:0.74,qte:120,fournisseur:'GINEYS',status:''},
{code:'F290',zone:'CONGELATEUR',cat:'Surgelés',produit:'POTIRON',unite:'KG',prix:1.7,qte:null,fournisseur:'POMONA',status:''},
{code:'F293',zone:'CONGELATEUR',cat:'Surgelés',produit:'ARRAIGNEE PORC',unite:'KG',prix:6.49,qte:null,fournisseur:'GINEYS',status:''},
{code:'F294',zone:'CONGELATEUR',cat:'Surgelés',produit:'CREVETTE PAPILLON',unite:'KG',prix:11.5,qte:null,fournisseur:'GINEYS',status:''},
{code:'F299',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI WRAP',unite:'PIECE',prix:0.65,qte:null,fournisseur:'POMONA',status:''},
{code:'F301',zone:'CONGELATEUR',cat:'Surgelés',produit:'POULET PAC',unite:'KG',prix:3.79,qte:null,fournisseur:'POMONA',status:''},
{code:'F307',zone:'CONGELATEUR',cat:'Surgelés',produit:'SAMOSSA LEGUMES',unite:'COLIS',prix:23.99,qte:null,fournisseur:'POMONA',status:''},
{code:'F308',zone:'CONGELATEUR',cat:'Surgelés',produit:'SAMOSSA BOEUF',unite:'COLIS',prix:28.874,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F309',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI BEIGNETS CHOC',unite:'unité',prix:0.28,qte:null,fournisseur:'POMONA',status:''},
{code:'F310',zone:'CONGELATEUR',cat:'Surgelés',produit:'ECHALOTTES CUBE',unite:'PIECE',prix:3.382,qte:3,fournisseur:'SYSCO',status:''},
{code:'F313',zone:'CONGELATEUR',cat:'Surgelés',produit:'MINI CANNELES',unite:'PIECE',prix:0.5,qte:null,fournisseur:'GINEYS',status:''},
{code:'F320',zone:'CONGELATEUR',cat:'Surgelés',produit:'COCKTAIL CHAMPIGNON',unite:'KG',prix:3.04,qte:null,fournisseur:'SYSCO',status:''},
{code:'N090',zone:'BOISSONS',cat:'Boissons',produit:'BIB VIOGNIER BLANC VINOREM 10L',unite:'L',prix:33.5,qte:1,fournisseur:'Micand',status:'new'}
,
{code:'F088',zone:'CAFETERIE',cat:'Cafeterie',produit:'CAFE DECA POD',unite:'PCE',prix:0.36,qte:null,fournisseur:'FRAICA',status:''},
{code:'F186',zone:'ECONOMAT',cat:'Economat',produit:'TARTELETTE',unite:'PU',prix:0.216,qte:null,fournisseur:'TRANSGOURMET',status:''},
{code:'F322',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET BAR',unite:'KG',prix:19.5,qte:null,fournisseur:'',status:''}
,
{code:'N091',zone:'FRIGO 2',cat:'Fruits et légumes',produit:'COURGETTE',unite:'KG',prix:2.4,qte:1.5,fournisseur:'UNION PRIMEURS',status:'updated'},
{code:'N092',zone:'CONGELATEUR',cat:'Surgelés',produit:'FILET CANETTE BARBARIE',unite:'KG',prix:7.746,qte:7.5,fournisseur:'SYSCO',status:'new'},
{code:'N094',zone:'CONGELATEUR',cat:'Surgelés',produit:'MOULES',unite:'KG',prix:6.2,qte:3,fournisseur:'SYSCO',status:'new'},
{code:'N096',zone:'CONGELATEUR',cat:'Surgelés',produit:'DONUTS',unite:'PCE',prix:0.5,qte:30,fournisseur:'GINEYS',status:'new'},
{code:'N097',zone:'CONGELATEUR',cat:'Surgelés',produit:'CREPES SARRASIN',unite:'PCE',prix:0.3,qte:50,fournisseur:'SYSCO',status:'new'},
{code:'N099',zone:'ECONOMAT',cat:'Economat',produit:'SESAME',unite:'KG',prix:8.5,qte:0.3,fournisseur:'EPISAVEUR',status:'new'},
{code:'N100',zone:'ECONOMAT',cat:'Economat',produit:'QUINOA BLANC',unite:'KG',prix:5.75,qte:1,fournisseur:'GINEYS',status:'new'},
{code:'N101',zone:'ECONOMAT',cat:'Economat',produit:'SEMOULE COUSCOUS FINE 5KG',unite:'KG',prix:2.29,qte:3,fournisseur:'SYSCO',status:'new'},
{code:'N102',zone:'ECONOMAT',cat:'Economat',produit:'EPICE COUSCOUS',unite:'BTE',prix:6.0,qte:1,fournisseur:'EPISAVEUR',status:'new'},
{code:'N103',zone:'ECONOMAT',cat:'Economat',produit:'VINAIGRE DE CIDRE',unite:'L',prix:3.5,qte:0.8,fournisseur:'EPISAVEUR',status:'new'},
{code:'N104',zone:'FRIGO 1',cat:'FRAIS BCP',produit:'ABRICOT SEC',unite:'KG',prix:8.5,qte:0.5,fournisseur:'GINEYS',status:'new'},
{code:'N105',zone:'CONGELATEUR',cat:'Surgelés',produit:'PETIT OIGNONS BLANC',unite:'KG',prix:3.5,qte:2.5,fournisseur:'GINEYS',status:'new'},
{code:'N106',zone:'CONGELATEUR',cat:'Surgelés',produit:'PAIN PITA',unite:'PCE',prix:0.45,qte:3,fournisseur:'GINEYS',status:'new'}
,
{code:'N107',zone:'ECONOMAT',cat:'Economat',produit:'HUILE AMPHORA 75%COLZA 25%OLIVE 1L X15',unite:'L',prix:3.74,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N108',zone:'FRIGO 1',cat:'BOF',produit:'TR. JAMBON PROSCIUTTO PARME 16M BQ300G X5',unite:'BQ',prix:12.06,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N109',zone:'CONGELATEUR',cat:'Surgeles',produit:'AVOCAT CUBE ST 1KG X5',unite:'Kg',prix:4.886,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N110',zone:'ECONOMAT',cat:'Economat',produit:'PIGNON PIN ST1KG X4',unite:'ST',prix:35.880,qte:null,fournisseur:'SYSCO',status:'updated'},
{code:'N111',zone:'CONGELATEUR',cat:'Surgeles',produit:'GRENEAU ARC EN CIEL LIMANDE ST1KG X10',unite:'Kg',prix:10.85,qte:null,fournisseur:'SYSCO',status:'updated'},
{code:'N112',zone:'CONGELATEUR',cat:'Surgeles',produit:'FLT SAUMON SAUVAGE ROSE PACIFIQUE 150/350G 5KG',unite:'Kg',prix:12.54,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N113',zone:'CONGELATEUR',cat:'Surgeles',produit:'SAMOUSSA BOEUF PREF 55G SYC X50',unite:'PC',prix:0.49,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N114',zone:'ECONOMAT',cat:'Economat',produit:'MIEL TOUTES FLEURS 1KG X6',unite:'Kg',prix:8.95,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N115',zone:'BOISSONS',cat:'Boissons',produit:'JUS D ORANGE 1L PK6PC',unite:'L',prix:2.76,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N116',zone:'FRIGO 1',cat:'BOF',produit:'TR. ROSETTE LYON X50 ENV SYC BQ500G X8',unite:'BQ',prix:9.765,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N117',zone:'FRIGO 1',cat:'BOF',produit:'BILLE CHEVRE BQ200G X3',unite:'BQ',prix:4.580,qte:null,fournisseur:'SYSCO',status:'updated'},
{code:'N118',zone:'CONGELATEUR',cat:'Surgeles',produit:'PREPA TARTE CITRON SICILE 1L X6',unite:'BRQ',prix:7.5,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N119',zone:'FRIGO 1',cat:'BOF',produit:'ROSETTE TRANCHE (10CX50TR ENV)X8 4KG',unite:'BOT',prix:5.109,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N120',zone:'FRIGO 1',cat:'BOF',produit:'CAMEMBERT NU 22% LFR 240GX30 B&E',unite:'PU',prix:1.839,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N121',zone:'FRIGO 1',cat:'BOF',produit:'JAMBON CRU PAYS S/OS (19CX26TR)X6',unite:'BOT',prix:5.61,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N122',zone:'FRIGO 1',cat:'BOF',produit:'JAMBON SUP DD TORCHON (40GX20TR)X6',unite:'BOT',prix:6.273,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N123',zone:'CONGELATEUR',cat:'Surgeles',produit:'MIX4 PAIN LOSANGE PRECUIT 55GX25X4',unite:'PU',prix:0.45,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N124',zone:'CONGELATEUR',cat:'Surgeles',produit:'NAVETTE NATURE CT 15GX100',unite:'PU',prix:0.243,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N125',zone:'BOISSONS',cat:'Boissons',produit:'EAU GAZEUSE PERRIER BTE 33CL VC',unite:'BTE',prix:0.97,qte:null,fournisseur:'PROMOCASH',status:'new'},
{code:'N126',zone:'FRAIS BCP',cat:'Frais',produit:'ABRICOT FRANCE CI',unite:'Kg',prix:3.8,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'N127',zone:'FRAIS BCP',cat:'Frais',produit:'MELON CAL9 FRANCE',unite:'Pce',prix:2.6,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'N128',zone:'FRAIS BCP',cat:'Frais',produit:'RAISIN ITALIA CIA CI',unite:'Kg',prix:2.96,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'N129',zone:'FRAIS BCP',cat:'Frais',produit:'CAROTTE FRANCE X10',unite:'Kg',prix:0.89,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'N130',zone:'FRAIS BCP',cat:'Frais',produit:'PRUNE JAUNE ESP CI',unite:'Kg',prix:2.6,qte:null,fournisseur:'UNION PRIMEURS',status:'new'}
,
{code:'N131',zone:'FRIGO 1',cat:'BOF',produit:'TR. JAMBON PARIS CHX DD VPF X25 BQ1KG X9',unite:'BQ',prix:7.824,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N132',zone:'FRIGO 1',cat:'BOF',produit:'VEGETOP UHT DEBIC 1L X6',unite:'L',prix:3.4,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N133',zone:'CONGELATEUR',cat:'Surgeles',produit:'QUINOA BLC ST2.5KG X4',unite:'Kg',prix:6.750,qte:null,fournisseur:'SYSCO',status:'updated'},
{code:'N134',zone:'ECONOMAT',cat:'Economat',produit:'ESSUIE MAIN DEV CENTRE TYPE 450 PK6PC X1',unite:'PK',prix:19.16,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N135',zone:'FRIGO 1',cat:'BOF',produit:'MOULE ALU GODET 85 80ML ST100PC X10',unite:'ST',prix:7.320,qte:null,fournisseur:'SYSCO',status:'updated'},
{code:'N136',zone:'CONGELATEUR',cat:'Surgeles',produit:'SAMOUSSA LEGUME FRIT 55G X50',unite:'PC',prix:0.401,qte:null,fournisseur:'SYSCO',status:'new'},
{code:'N137',zone:'FRIGO 1',cat:'BOF',produit:'MOZZA RAPE CANTADORA LFR 2.5KGX4',unite:'Kg',prix:6.586,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N138',zone:'FRAIS BCP',cat:'Frais',produit:'ANETH HVE 250GX8 2KG B&E',unite:'Kg',prix:1.523,qte:null,fournisseur:'POMONA',status:'new'},
{code:'N139',zone:'BOISSONS',cat:'Boissons',produit:'COCA COLA BTE 33CL VC',unite:'BTE',prix:1.033,qte:null,fournisseur:'PROMOCASH',status:'new'},
{code:'N140',zone:'BOISSONS',cat:'Boissons',produit:'LIMONADE SUD BTE 25CL VC',unite:'BTE',prix:0.49,qte:null,fournisseur:'PROMOCASH',status:'new'},
{code:'N141',zone:'FRAIS BCP',cat:'Frais',produit:'NECTARINE JAUNE ESPAGNE CI',unite:'Kg',prix:2.96,qte:null,fournisseur:'UNION PRIMEURS',status:'new'},
{code:'N142',zone:'FRAIS BCP',cat:'Frais',produit:'COURGETTE CAT1 ESP',unite:'Kg',prix:2.400,qte:null,fournisseur:'UNION PRIMEURS',status:'updated'}
,
{code:'N143',zone:'ECONOMAT',cat:'Economat',produit:'HUILE OLIVE SPECIAL CUISINE BI5L',unite:'L',prix:4.600,qte:null,fournisseur:'SYSCO',status:'new'}
,
{code:'N144',zone:'ECONOMAT',cat:'Economat',produit:'SUCRE POUDRE 1KG',unite:'Kg',prix:0.900,qte:null,fournisseur:'SYSCO',status:'new'}
,
{code:'N145',zone:'ECONOMAT',cat:'Economat',produit:'CERNEAU NX ARLEQUIN ST1KG X10',unite:'KG',prix:10.850,qte:null,fournisseur:'SYSCO',status:'new'}

,
{code:'F036',zone:'BOISSONS',cat:'Boissons',produit:'LIMONADE BOUTEILLE 1L',unite:'L',prix:1.290,qte:null,fournisseur:'',status:''}
,
{code:'N147',zone:'BOISSONS',cat:'Boissons',produit:'PORTO ROUGE',unite:'75CL',prix:8.5,qte:null,fournisseur:'Micand',status:'new'},
{code:'N148',zone:'BOISSONS',cat:'Boissons',produit:'COGNAC',unite:'70CL',prix:15.0,qte:null,fournisseur:'Micand',status:'new'},
{code:'N150',zone:'CAFETERIE',cat:'Cafeterie',produit:'THE LIPTON YELLOW X100',unite:'BTE',prix:10.9,qte:null,fournisseur:'FRAICA',status:'new'}
,
{code:'N146',zone:'BOISSONS',cat:'Boissons',produit:'JUS ABRICOT 20CL RAUCH C=24',unite:'Bouteille',prix:0.89,qte:null,fournisseur:'GINEYS',status:'new'}
];

let activeZone='TOUT';
const hc=z=>(ZONES[z]||{hclass:'h-autre'}).hclass;
const hl=z=>(ZONES[z]||{htext:'Divers'}).htext;
const mont=d=>(d.qte===null||d.qte===undefined)?null:d.prix*d.qte;

function buildZoneTabs(){
  const wrap=document.getElementById('zone-tabs');
  wrap.innerHTML=['TOUT',...Object.keys(ZONES)].map(z=>{
    const info=ZONES[z];const cnt=z==='TOUT'?DATA.length:DATA.filter(d=>d.zone===z).length;
    return`<button class="zone-chip${z===activeZone?' active':''}" onclick="setZone('${z}')"><span class="dot" style="background:${info?info.color:'#888'}"></span>${z==='TOUT'?'Toutes':(info?info.label:z)} (${cnt})</button>`;
  }).join('');
}
function buildFilters(){
  [...new Set(DATA.map(d=>d.cat).filter(Boolean))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;document.getElementById('filt-cat').appendChild(o);});
  [...new Set(DATA.map(d=>d.fournisseur).filter(Boolean))].sort().forEach(f=>{const o=document.createElement('option');o.value=f;o.textContent=f;document.getElementById('filt-fourn').appendChild(o);});
}
function setZone(z){activeZone=z;buildZoneTabs();render();}
function getFiltered(){
  const q=document.getElementById('search').value.toLowerCase();
  const cat=document.getElementById('filt-cat').value;
  const fourn=document.getElementById('filt-fourn').value;
  const st=document.getElementById('filt-status').value;
  const sortEl=document.getElementById('filt-sort');
  const sort=sortEl?sortEl.value:'default';

  let items=DATA.filter(d=>{
    if(activeZone!=='TOUT'&&d.zone!==activeZone)return false;
    if(cat&&d.cat!==cat)return false;
    if(fourn&&d.fournisseur!==fourn)return false;
    if(st==='new'&&d.status!=='new')return false;
    if(st==='updated'&&d.status!=='updated')return false;
    if(st==='missing'&&d.qte!==null&&d.qte!==undefined)return false;
    if(st==='cross'&&!(d.code in CROSS_SUPPLIER_GROUPS))return false;
    if(q&&!(d.produit+d.code+d.fournisseur+d.zone+d.cat).toLowerCase().includes(q))return false;
    return true;
  });

  // Tri
  if(sort==='alpha'){
    items=[...items].sort((a,b)=>a.produit.localeCompare(b.produit,'fr',{sensitivity:'base'}));
  } else if(sort==='prix_desc'){
    items=[...items].sort((a,b)=>(b.prix||0)-(a.prix||0));
  } else if(sort==='prix_asc'){
    items=[...items].sort((a,b)=>(a.prix||0)-(b.prix||0));
  } else if(sort==='montant_desc'){
    items=[...items].sort((a,b)=>(mont(b)||0)-(mont(a)||0));
  } else if(sort==='cross'){
    // Grouper les produits multi-fournisseurs ensemble, le reste après
    const inGroup=items.filter(d=>d.code in CROSS_SUPPLIER_GROUPS)
      .sort((a,b)=>CROSS_SUPPLIER_GROUPS[a.code]-CROSS_SUPPLIER_GROUPS[b.code]||a.produit.localeCompare(b.produit,'fr'));
    const noGroup=items.filter(d=>!(d.code in CROSS_SUPPLIER_GROUPS))
      .sort((a,b)=>a.produit.localeCompare(b.produit,'fr',{sensitivity:'base'}));
    items=[...inGroup,...noGroup];
  }
  return items;
}
function updateDlcTabDot(){
  try {
    var today = new Date();
    var warn = new Date(); warn.setDate(warn.getDate()+7);
    var warnStr = warn.toISOString().slice(0,10);
    var todayStr = today.toISOString().slice(0,10);
    var urgent = 0;
    if(typeof DLC_DATA !== 'undefined') {
      Object.values(DLC_DATA).forEach(function(d) {
        if(d.dlc && d.dlc <= warnStr) urgent++;
      });
    }
    var dot = document.getElementById('dlc-tab-dot');
    if(dot) {
      if(urgent > 0) {
        dot.style.display = 'inline-block';
        dot.title = urgent + ' produit(s) DLC < 7 jours';
        dot.style.background = urgent > 0 ? '#ef4444' : '#f59e0b';
      } else {
        dot.style.display = 'none';
      }
    }
    // Aussi mettre à jour la tuile DLC sur l'accueil
    var hsDlc = document.getElementById('hs-dlc');
    if(hsDlc) {
      hsDlc.textContent = urgent > 0 ? urgent : '✓';
      hsDlc.style.color = urgent > 0 ? '#ef4444' : '#52B788';
    }
    var hsDot = document.getElementById('hs-dlc-dot');
    if(hsDot) hsDot.style.display = urgent > 0 ? 'block' : 'none';
  } catch(e) {}
}

function updateStats(){
  const tot=DATA.reduce((s,d)=>s+(mont(d)||0),0);
  document.getElementById('stat-total').textContent=tot.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
  document.getElementById('stat-refs').textContent=DATA.length;
  document.getElementById('stat-new-lbl').textContent=DATA.filter(d=>d.status==='new').length+' nouveaux';
  document.getElementById('stat-vides').textContent=DATA.filter(d=>d.qte===null||d.qte===undefined).length;
  document.getElementById('stat-upd').textContent=DATA.filter(d=>d.status==='updated').length;
}
function render(){
  const filtered=getFiltered();
  const tbody=document.getElementById('tbody');
  document.getElementById('empty-state').style.display=filtered.length?'none':'block';

  // Tracker pour les séparateurs de groupes
  let lastGroupId=null;
  let lastZone=null;
  // Groupes avec unités hétérogènes
  const mixedUnitsGroups = getCrossGroupMixedUnits();

  tbody.innerHTML=filtered.map(d=>{
    const m=mont(d);
    const badge=d.status==='new'?'<span class="new-pill">NEW</span>':d.status==='updated'?'<span class="upd-pill">MAJ</span>':d.status==='custom'?'<span class="custom-tag">CUSTOM</span>':'';
    const seuilBadge=getSeuilBadge(d);

    // Cross-supplier highlighting
    const gid=CROSS_SUPPLIER_GROUPS[d.code];
    // En-tête de zone collant
    let zoneHeader='';
    if(d.zone!==lastZone){
      lastZone=d.zone;
      const zoneLabel=ZONES[d.zone]?.label||d.zone||'Autre';
      const zoneColor=ZONES[d.zone]?.color||'#888';
      zoneHeader=`<tr class="zone-sticky-header" data-zone="${d.zone}">
        <td colspan="5" style="background:${zoneColor}18;color:${zoneColor};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:6px 8px;position:sticky;top:0;z-index:2;border-bottom:.5px solid ${zoneColor}44">
          ${zoneLabel}
        </td>
      </tr>`;
    }
    const hasGroup=gid!==undefined;
    const gc=hasGroup?CROSS_GROUP_COLORS[gid%CROSS_GROUP_COLORS.length]:null;
    const rowBg=hasGroup?`background:${gc.bg};`:'';
    const borderLeft=hasGroup?`border-left:3px solid ${gc.border};`:'border-left:3px solid transparent;';
    const isMixed = hasGroup && mixedUnitsGroups.has(gid);
    const mixedWarn = isMixed ? ' ⚠️' : '';
    const mixedTitle = isMixed ? 'Unités différentes dans ce groupe — comparer avec précaution' : 'Même produit, fournisseurs différents';
    const crossBadge=hasGroup?`<span class="cross-pill" style="background:${gc.bg};color:${gc.text};border-color:${gc.border};${isMixed?'outline:1px solid #c05621;':''}" title="${mixedTitle}">🔀 G${gid+1}${mixedWarn}</span>`:'';

    // Séparateur visuel entre groupes
    let separator='';
    if(hasGroup && gid!==lastGroupId && lastGroupId!==null){
      separator=`<div style="grid-column:1/-1;height:2px;background:${gc.border};opacity:.3"></div>`;
    }
    lastGroupId=hasGroup?gid:null;

    return`<div class="product-row" id="row-${d.code}" style="${rowBg}${borderLeft}">
      <div class="cell"><span class="code-pill">${d.code}</span></div>
      <div class="cell" style="cursor:pointer" onclick="openEditProduct('${d.code}')" title="Modifier ce produit">
        <div class="product-name" style="display:flex;align-items:center;gap:4px">${d.produit}<span style="font-size:10px;color:var(--text3);flex-shrink:0">✏️</span></div>
        <div class="product-meta"><span class="haccp-pill ${hc(d.zone)}">${hl(d.zone)}</span>${badge}${crossBadge}${seuilBadge}<span class="fourn-text">${d.fournisseur||''}</span></div></div>
      <div class="cell cell-prix">${d.prix?d.prix.toFixed(2)+' €':'—'}<br><span style="font-size:10px;color:var(--text3)">${d.unite||''}</span></div>
      <div class="cell"><input class="qte-input" type="number" inputmode="decimal" min="0" step="0.01" value="${d.qte!==null&&d.qte!==undefined?d.qte:''}" placeholder="0" data-code="${d.code}" oninput="updInput(this)"></div>
      <div class="cell cell-montant${m===null?' montant-zero':''}" id="m-${d.code}">${m!==null?m.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €':'—'}</div>
    </div>`;
  }).join('');

  const ft=filtered.reduce((s,d)=>s+(mont(d)||0),0);
  document.getElementById('footer-total').textContent=ft.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
  document.getElementById('footer-count').textContent=filtered.length+' référence'+(filtered.length>1?'s':'');
}
function updInput(inp){upd(inp.dataset.code,inp.value);}
let bilanTimer=null;
function scheduleBilanRebuild(){
  // Rebuild le bilan seulement si l'onglet bilan est actif (ou après 1s sinon)
  const bilanActive=document.getElementById('panel-bilan')&&document.getElementById('panel-bilan').classList.contains('active');
  if(bilanActive){clearTimeout(bilanTimer);bilanTimer=setTimeout(buildBilan,200);}
  else{clearTimeout(bilanTimer);bilanTimer=setTimeout(buildBilan,800);}
}
function upd(code,val){
  const item=DATA.find(d=>d.code===code);if(!item)return;
  const n=parseFloat(String(val).replace(',','.'));
  item.qte=isNaN(n)?null:n;
  const m=mont(item);const cell=document.getElementById('m-'+code);
  if(cell){cell.textContent=m!==null?m.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €':'—';cell.className='cell cell-montant'+(m===null?' montant-zero':'');}
  updateStats();
  const ft=getFiltered().reduce((s,d)=>s+(mont(d)||0),0);
  document.getElementById('footer-total').textContent=ft.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
  scheduleAutoSave();
  scheduleBilanRebuild();
}
function exportCSV(){
  const h=['Code','Zone','Catégorie','Produit','Unité','Prix HT','Quantité','Montant HT','Fournisseur','HACCP','Statut'];
  const rows=DATA.map(d=>{const m=mont(d);return[d.code,d.zone,d.cat,d.produit,d.unite,d.prix??'',d.qte??'',m!==null?m.toFixed(2):'',d.fournisseur,hl(d.zone),d.status==='new'?'Nouveau':d.status==='updated'?'Prix MAJ':''];});
  const csv=[h,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));a.download='inventaire_HACCP_'+new Date().toISOString().slice(0,10)+'.csv';a.click();
}
function buildBilan(){
  const BEV_ZONES=['BOISSONS','CAFETERIE'];

  // ── Agréger par zone ──
  const byZone={};
  // ── Agréger par catégorie ──
  const byCat={};
  // ── Sous-totaux Boissons / Nourriture ──
  const synth={
    boissons:{total:0,refs:0,manquants:0,saisies:0},
    nourriture:{total:0,refs:0,manquants:0,saisies:0}
  };

  DATA.forEach(d=>{
    const m=mont(d);
    const hasQte=(d.qte!==null&&d.qte!==undefined);

    // Par zone
    if(!byZone[d.zone])byZone[d.zone]={total:0,refs:0,manquants:0,saisies:0};
    byZone[d.zone].total+=(m||0);
    byZone[d.zone].refs++;
    if(!hasQte)byZone[d.zone].manquants++;
    else byZone[d.zone].saisies++;

    // Par catégorie
    const cat=d.cat||'Divers';
    if(!byCat[cat])byCat[cat]={total:0,refs:0,manquants:0,zone:d.zone};
    byCat[cat].total+=(m||0);
    byCat[cat].refs++;
    if(!hasQte)byCat[cat].manquants++;

    // Synthèse
    const key=BEV_ZONES.includes(d.zone)?'boissons':'nourriture';
    synth[key].total+=(m||0);
    synth[key].refs++;
    if(!hasQte)synth[key].manquants++;
    else synth[key].saisies++;
  });

  const gt=DATA.reduce((s,d)=>s+(mont(d)||0),0);
  const totalRefs=DATA.length;
  const totalSaisies=DATA.filter(d=>d.qte!==null&&d.qte!==undefined).length;
  const totalManquants=totalRefs-totalSaisies;
  const pctSaisies=totalRefs>0?Math.round(totalSaisies/totalRefs*100):0;

  // Couleurs zones
  const zc={
    'FRIGO 1':'#e6f1fb','FRIGO 2':'#dce8f7',
    'CONGELATEUR':'#eeedfe','BOISSONS':'#faeeda',
    'CAFETERIE':'#fdf4e4','ECONOMAT':'#eaf3de',
    'FRAIS BCP':'#e1f5ee','BOF':'#fbeaf0','AUTRE':'#f1efe8'
  };
  const zBarColor={
    'FRIGO 1':'#378ADD','FRIGO 2':'#185FA5',
    'CONGELATEUR':'#7F77DD','BOISSONS':'#BA7517',
    'CAFETERIE':'#EF9F27','ECONOMAT':'#639922',
    'FRAIS BCP':'#1D9E75','BOF':'#D4537E','AUTRE':'#888780'
  };

  const fmt=(v)=>v.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
  const pct=(v,tot)=>tot>0?Math.round(v/tot*100):0;

  let h='';

  // ── 1. Total général ──
  h+=`<div class="bilan-section">
    <div class="bilan-title">Total général</div>
    <div class="bilan-row" style="background:var(--info-bg);border-radius:var(--radius-lg);border:.5px solid rgba(12,68,124,.15)">
      <div style="flex:1">
        <div class="bilan-zone-name" style="color:var(--info-text);font-size:14px">${fmt(gt)}</div>
        <div class="bilan-zone-sub" style="margin-top:2px">${totalRefs} références · <b style="color:var(--info-text)">${totalSaisies} saisies</b> · ${totalManquants} sans quantité</div>
        <div style="margin-top:8px">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--info-text);margin-bottom:3px"><span>Avancement saisie</span><span>${pctSaisies}%</span></div>
          <div class="bilan-bar-track"><div class="bilan-bar-fill" style="width:${pctSaisies}%;background:var(--info-text)"></div></div>
        </div>
      </div>
    </div>
  </div>`;

  // ── 2. Synthèse Boissons / Nourriture ──
  const bevPct=pct(synth.boissons.total,gt);
  const nourPct=pct(synth.nourriture.total,gt);
  h+=`<div class="bilan-section">
    <div class="bilan-title">Sous-totaux</div>
    <div class="bilan-synth-grid">
      <div class="bilan-synth-card" style="background:var(--amber-bg)">
        <div class="bsc-icon">🥤</div>
        <div class="bsc-label" style="color:var(--amber-text)">Boissons & Café</div>
        <div class="bsc-val" style="color:var(--amber-text)">${fmt(synth.boissons.total)}</div>
        <div class="bsc-sub" style="color:var(--amber-text)">${synth.boissons.refs} réf. · ${synth.boissons.manquants} sans qté · ${bevPct}% du stock</div>
      </div>
      <div class="bilan-synth-card" style="background:var(--green-bg)">
        <div class="bsc-icon">🍴</div>
        <div class="bsc-label" style="color:var(--green-text)">Nourriture</div>
        <div class="bsc-val" style="color:var(--green-text)">${fmt(synth.nourriture.total)}</div>
        <div class="bsc-sub" style="color:var(--green-text)">${synth.nourriture.refs} réf. · ${synth.nourriture.manquants} sans qté · ${nourPct}% du stock</div>
      </div>
    </div>
    <div style="height:8px;border-radius:4px;overflow:hidden;display:flex;gap:2px;margin-top:4px">
      <div style="flex:${bevPct};background:var(--amber-text);opacity:.7;transition:flex .4s ease;border-radius:4px 0 0 4px"></div>
      <div style="flex:${nourPct};background:var(--green-text);opacity:.7;transition:flex .4s ease;border-radius:0 4px 4px 0"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-top:3px"><span>🥤 ${bevPct}%</span><span>🍴 ${nourPct}%</span></div>
  </div>`;

  // ── 3. Par catégorie (avec sous-total par groupe) ──
  // Groupes : Boissons = BOISSONS+CAFETERIE, Frais = FRIGO1+FRIGO2+BOF+FRAIS BCP, Surgelés = CONGELATEUR, Sec = ECONOMAT
  const CAT_GROUPS=[
    {label:'🥤 Boissons & Caféterie', zones:['BOISSONS','CAFETERIE'], bg:'var(--amber-bg)', color:'var(--amber-text)'},
    {label:'❄️ Surgelés', zones:['CONGELATEUR'], bg:'var(--purple-bg)', color:'var(--purple-text)'},
    {label:'🧊 Réfrigéré', zones:['FRIGO 1','FRIGO 2','BOF','FRAIS BCP'], bg:'var(--blue-bg)', color:'var(--blue-text)'},
    {label:'🏪 Économat (sec)', zones:['ECONOMAT'], bg:'var(--green-bg)', color:'var(--green-text)'},
  ];

  h+=`<div class="bilan-section"><div class="bilan-title">Par catégorie</div>`;
  CAT_GROUPS.forEach(grp=>{
    // Calculer le sous-total du groupe
    const grpData=DATA.filter(d=>grp.zones.includes(d.zone));
    const grpTotal=grpData.reduce((s,d)=>s+(mont(d)||0),0);
    const grpRefs=grpData.length;
    const grpManq=grpData.filter(d=>d.qte===null||d.qte===undefined).length;
    const grpPct=pct(grpTotal,gt);

    // Zones dans ce groupe
    const zonesInGrp=grp.zones.filter(z=>byZone[z]);

    h+=`<div style="border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:10px">
      <!-- Header groupe -->
      <div style="background:${grp.bg};padding:10px 12px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:13px;font-weight:600;color:${grp.color}">${grp.label}</div>
          <div style="font-size:10px;color:${grp.color};opacity:.75;margin-top:1px">${grpRefs} réf. · ${grpManq} sans qté · ${grpPct}% du total</div>
        </div>
        <div style="font-size:15px;font-weight:700;color:${grp.color}">${fmt(grpTotal)}</div>
      </div>`;

    // Barre de progression globale groupe
    const grpSaisies=grpData.filter(d=>d.qte!==null&&d.qte!==undefined).length;
    const grpSaisPct=grpRefs>0?Math.round(grpSaisies/grpRefs*100):0;
    h+=`<div style="padding:6px 12px 2px;background:${grp.bg};opacity:.8">
      <div style="display:flex;justify-content:space-between;font-size:9px;color:${grp.color};margin-bottom:2px"><span>Saisie</span><span>${grpSaisPct}% (${grpSaisies}/${grpRefs})</span></div>
      <div class="bilan-bar-track"><div class="bilan-bar-fill" style="width:${grpSaisPct}%;background:${grp.color};opacity:.7"></div></div>
    </div>`;

    // Détail par zone
    zonesInGrp.sort((a,b)=>(byZone[b]?.total||0)-(byZone[a]?.total||0)).forEach(z=>{
      const v=byZone[z];
      const info=ZONES[z]||{label:z};
      const zPct=pct(v.total,grpTotal);
      const zSaisPct=v.refs>0?Math.round(v.saisies/v.refs*100):0;
      h+=`<div style="border-top:.5px solid var(--border)">
        <div class="bilan-cat-row" style="background:${zc[z]||'#f5f5f3'}">
          <div style="flex:1;min-width:0">
            <div class="bilan-cat-name">${info.label}</div>
            <div class="bilan-cat-sub">${v.refs} réf. · ${v.manquants} sans qté · ${zSaisPct}% saisi</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="bilan-cat-pct">${zPct}%</span>
            <span class="bilan-cat-val">${fmt(v.total)}</span>
          </div>
        </div>
        <div class="bilan-bar-wrap" style="background:${zc[z]||'#f5f5f3'}">
          <div class="bilan-bar-track"><div class="bilan-bar-fill" style="width:${zPct}%;background:${zBarColor[z]||'#888'}"></div></div>
        </div>
      </div>`;
    });

    h+='</div>';
  });
  h+='</div>';

  // ── 4. Récap fournisseurs (top 5 par valeur) ──
  const byFourn={};
  DATA.forEach(d=>{
    const f=d.fournisseur||'(sans fournisseur)';
    if(!byFourn[f])byFourn[f]={total:0,refs:0};
    byFourn[f].total+=(mont(d)||0);
    byFourn[f].refs++;
  });
  const top5=Object.entries(byFourn).sort((a,b)=>b[1].total-a[1].total).slice(0,5);
  h+=`<div class="bilan-section">
    <div class="bilan-title">Top fournisseurs</div>
    <div style="border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">`;
  top5.forEach(([f,v],i)=>{
    const fp=pct(v.total,gt);
    h+=`<div style="padding:8px 12px;border-bottom:${i<top5.length-1?'.5px solid var(--border)':'none'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:12px;font-weight:500">${f}</span>
        <span style="font-size:12px;font-weight:600">${fmt(v.total)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="bilan-bar-track" style="flex:1"><div class="bilan-bar-fill" style="width:${fp}%;background:var(--info-text);opacity:.6"></div></div>
        <span style="font-size:10px;color:var(--text3);white-space:nowrap">${v.refs} réf. · ${fp}%</span>
      </div>
    </div>`;
  });
  h+='</div></div>';

  document.getElementById('bilan-content').innerHTML=h;
}
function buildInvoiceList(){
  // Update tab label dynamically
  const tbl=document.getElementById('tab-factures-btn');
  if(tbl)tbl.textContent='Factures ('+INVOICES.length+')';
  const gt=INVOICES.reduce((s,i)=>s+i.total,0);
  document.getElementById('inv-list').innerHTML=
    `<div style="padding:12px 14px;background:var(--info-bg);border-radius:var(--radius-lg);display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><div><div style="font-size:14px;font-weight:600;color:var(--info-text)">Total 10 factures</div><div style="font-size:11px;color:var(--info-text);opacity:.8">Juin 2026</div></div><div style="font-size:16px;font-weight:700;color:var(--info-text)">${gt.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}</div></div>`+
    INVOICES.map(inv=>`<div class="inv-card"><div class="inv-card-header"><div><div class="inv-card-title">${inv.fournisseur}</div><div style="font-size:11px;color:var(--text2)">${inv.date} · N° ${inv.id}</div></div><div class="inv-card-total">${inv.total.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}</div></div>${inv.items.map(it=>`<div class="inv-item"><span class="inv-item-name">${it.p}</span><span class="inv-item-price">${it.q} ${it.u} × ${it.px.toFixed(2)} €</span></div>`).join('')}</div>`).join('');
}
function switchTab(name,btn){
  // Afficher le bouton retour accueil dès qu'on est dans un module
  var hf = document.getElementById('btn-home-float');
  if(hf) hf.classList.add('visible');
  if(name==='reception-mp'){
    document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');});
    document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active');});
    if(btn) if(btn) btn.classList.add('active');
    var p=document.getElementById('panel-reception-mp');
    if(p){p.classList.add('active');initReceptionModule();renderReceptionsMP();}
    return;
  }
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');document.getElementById('panel-'+name).classList.add('active');
  if(name==='pieces'){try{const r=localStorage.getItem(PIECES_KEY);PIECES=r?JSON.parse(r):[];}catch(e){PIECES=[];} renderPieces(); detectCameraContext();}
  if(name==='bilan'){clearTimeout(bilanTimer);buildBilan();}
  if(name==='dashboard')buildDashboard();
  if(name==='prix'){initPrixPanel();renderPrixChart();}
  if(name==='carte-allergenes'){renderCartAlg();}
  if(name==='recettes'){if(typeof loadNewModules==='function')loadNewModules();renderRecettes();}
  if(name==='tracabilite')renderTracabilite();
  if(name==='dlc')renderDLC();
  if(name==='historique')renderHistorique();
  if(name==='commande'){renderCommande();}
  if(name==='allergenes')renderAllergens();
}

// ── MOTEUR VOCAL HAUTE PRÉCISION ──────────────────────────
let lastAction=null;

// ── 1. Dictionnaire complet français → nombre ──
const NUMS={
  'zéro':0,'zero':0,'un':1,'une':1,'deux':2,'trois':3,'quatre':4,'cinq':5,
  'six':6,'sept':7,'huit':8,'neuf':9,'dix':10,'onze':11,'douze':12,
  'treize':13,'quatorze':14,'quinze':15,'seize':16,
  'dix-sept':17,'dix sept':17,'dixsept':17,
  'dix-huit':18,'dix huit':18,'dixhuit':18,
  'dix-neuf':19,'dix neuf':19,'dixneuf':19,
  'vingt':20,'vingt et un':21,'vingt-et-un':21,'vingt-un':21,
  'vingt-deux':22,'vingt deux':22,'vingt-trois':23,'vingt trois':23,
  'vingt-quatre':24,'vingt quatre':24,'vingt-cinq':25,'vingt cinq':25,
  'vingt-six':26,'vingt six':26,'vingt-sept':27,'vingt sept':27,
  'vingt-huit':28,'vingt huit':28,'vingt-neuf':29,'vingt neuf':29,
  'trente':30,'trente et un':31,'trente-et-un':31,'trente-deux':32,'trente deux':32,
  'trente-trois':33,'trente trois':33,'trente-quatre':34,'trente quatre':34,
  'trente-cinq':35,'trente cinq':35,'trente-six':36,'trente six':36,
  'quarante':40,'quarante et un':41,'quarante-et-un':41,'quarante-deux':42,'quarante deux':42,
  'cinquante':50,'soixante':60,'soixante-dix':70,'soixante dix':70,
  'quatre-vingts':80,'quatre vingts':80,'quatre-vingt':80,'quatrevingt':80,
  'quatre-vingt-dix':90,'quatre vingt dix':90,'cent':100,'deux cents':200,'deux cent':200,
  'demi':0.5,'demie':0.5,'moitié':0.5,'moitie':0.5,'quart':0.25,'trois quarts':0.75,
  'un et demi':1.5,'deux et demi':2.5,'trois et demi':3.5,'quatre et demi':4.5,
  'cinq et demi':5.5,'six et demi':6.5,'sept et demi':7.5,'huit et demi':8.5,
  'neuf et demi':9.5,'dix et demi':10.5,
};

// ── 2. Corrections phonétiques (ce que reconnaît souvent l'ASR) ──
const PHON={
  // Unités mal comprises
  'kilos':'kg','kilo':'kg','kilogramme':'kg','kilogrammes':'kg',
  'gramme':'g','grammes':'g','litre':'l','litres':'l',
  'pièce':'pce','pièces':'pce','bouteille':'btl','bouteilles':'btl',
  'boite':'bte','boîte':'bte','sachet':'sac','sachets':'sac',
  // Corrections erreurs ASR fréquentes
  'cola':'cola','coca cola':'coca','café':'cafe','cafés':'cafe',
  'œufs':'oeufs','oeuf':'oeuf','boeuf':'boeuf','foie gras':'foie gras',
  'courgette':'courgette','aubergine':'aubergine',
  'emmental':'emmental','gruyère':'gruyere','gruyere':'gruyere',
  'mozzarella':'mozzarella','parmesan':'parmesan',
  'colin':'colin','saumon':'saumon','merlu':'merlu','thon':'thon',
  'poulet':'poulet','dinde':'dinde','veau':'veau','agneau':'agneau',
  'tomate':'tomate','tomates':'tomate','carotte':'carotte','carottes':'carotte',
  'oignon':'oignon','oignons':'oignon','ail':'ail',
  'beurre':'beurre','lait':'lait','crème':'creme','creme':'creme',
  'farine':'farine','sucre':'sucre','sel':'sel','poivre':'poivre',
  'huile':'huile','vinaigre':'vinaigre','moutarde':'moutarde',
  'rouget':'rouget','raviole':'raviole','gnocchi':'gnocchi','gnocchis':'gnocchi',
  // Nombres souvent mal transcrits
  'zéros':'zéro','un s':'un','deux s':'deux',
};

// ── 3. Distance de Levenshtein (fuzzy match) ──
function levenshtein(a,b){
  const m=a.length,n=b.length;
  const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i||j));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)
    dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}

// ── 4. Normalisation avancée du texte ──
function normalizeText(t){
  return t.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'') // Supprimer accents
    .replace(/['']/g,"'").replace(/[^a-z0-9\s\-']/g,' ')
    .replace(/\s+/g,' ').trim();
}

// ── 5. Convertir texte → nombre (avec gestion composés) ──
function wtn(s){
  s=s.toLowerCase().trim().replace(',','.').replace(/\s+/g,' ');
  // Nombre décimal direct
  const d=parseFloat(s);if(!isNaN(d))return d;
  // Supprimer accents pour matching
  const sn=normalizeText(s);
  // Chercher dans NUMS (du plus long au plus court)
  const keys=Object.keys(NUMS).sort((a,b)=>b.length-a.length);
  for(const k of keys){
    const kn=normalizeText(k);
    if(sn===kn)return NUMS[k];
    if(sn.startsWith(kn+' ')){
      const rest=wtn(s.slice(k.length).trim());
      if(rest!==null)return NUMS[k]+rest;
    }
  }
  return null;
}

// ── 6. Score de similarité entre deux strings ──
function similarity(a,b){
  a=normalizeText(a);b=normalizeText(b);
  if(a===b)return 1;
  if(b.includes(a)||a.includes(b))return 0.9;
  const maxLen=Math.max(a.length,b.length);
  if(maxLen===0)return 1;
  const dist=levenshtein(a,b);
  return 1-dist/maxLen;
}


// ══════════════════════════════════════════════════════════
// ASSISTANT VOCAL UNIVERSEL — toute l'application
// ══════════════════════════════════════════════════════════

// ── Moteur de recherche produit ──
function findProd(text, allTranscripts){
  const texts=allTranscripts||[text];
  let globalBest=null, globalScore=0;
  texts.forEach(raw=>{
    let t=raw.toLowerCase().trim();
    Object.entries(PHON).forEach(([bad,good])=>{t=t.replace(new RegExp('\\b'+bad+'\\b','g'),good);});
    t=normalizeText(t);
    // Retirer les mots-nombres
    const numWords=Object.keys(NUMS).map(k=>normalizeText(k)).sort((a,b)=>b.length-a.length);
    let clean=t;
    numWords.forEach(nw=>{try{clean=clean.replace(new RegExp('\\b'+nw.replace(/[-]/g,'[-\\s]')+'\\b','g'),' ');}catch(e){}});
    clean=clean.replace(/\b\d+([.,]\d+)?\s*(kg|g|l|cl|ml|pce|bte|sac)\b/g,' ').replace(/\s+/g,' ').trim();
    DATA.forEach(d=>{
      const prodN=normalizeText(d.produit);
      let score=0;
      if(t.includes(d.code.toLowerCase()))score=10;
      const prodWords=prodN.split(/\s+/).filter(w=>w.length>2);
      const textWords=(clean||t).split(/\s+/).filter(w=>w.length>2);
      let wordMatches=0;
      prodWords.forEach(pw=>{
        if(textWords.some(tw=>tw===pw)){wordMatches+=pw.length*2;return;}
        if(textWords.some(tw=>tw.startsWith(pw.slice(0,4))&&pw.length>=4)){wordMatches+=pw.length;return;}
        const best=textWords.reduce((b,tw)=>Math.max(b,similarity(pw,tw)),0);
        if(best>0.75)wordMatches+=pw.length*best;
      });
      score+=wordMatches;
      const fullSim=similarity(clean||t,prodN);
      if(fullSim>0.6)score+=fullSim*5;
      if(d.fournisseur&&t.includes(normalizeText(d.fournisseur)))score+=2;
      if(score>globalScore){globalScore=score;globalBest=d;}
    });
  });
  return globalScore>=2?globalBest:null;
}

// ── Dictionnaire de navigation vocal ──
const VOICE_NAV = {
  // Onglets
  'inventaire':     ()=>switchTabByName('inventaire'),
  'stock':          ()=>switchTabByName('inventaire'),
  'saisie':         ()=>switchTabByName('inventaire'),
  'tableau de bord':()=>switchTabByName('dashboard'),
  'bilan zones':    ()=>switchTabByName('bilan'),
  'bilan zone':     ()=>switchTabByName('bilan'),
  'dashboard':      ()=>switchTabByName('dashboard'),
  'bilan':          ()=>switchTabByName('dashboard'),
  'recettes':       ()=>switchTabByName('recettes'),
  'fiches':         ()=>switchTabByName('recettes'),
  'traçabilité':    ()=>switchTabByName('tracabilite'),
  'tracabilite':    ()=>switchTabByName('tracabilite'),
  'journal':        ()=>switchTabByName('tracabilite'),
  'dlc':            ()=>switchTabByName('dlc'),
  'dates':          ()=>switchTabByName('dlc'),
  'alertes':        ()=>switchTabByName('dlc'),
  'temperatures':   ()=>switchTabByName('dlc'),
  'températures':   ()=>switchTabByName('dlc'),
  'historique':     ()=>switchTabByName('historique'),
  'commandes':      ()=>switchTabByName('commande'),
  'commande':       ()=>switchTabByName('commande'),
  'prix':           ()=>switchTabByName('prix'),
  'allergènes':     ()=>switchTabByName('allergenes'),
  'allergenes':     ()=>switchTabByName('allergenes'),
  'carte allergènes':()=>switchTabByName('carte-allergenes'),
  'étiquettes allergènes':()=>switchTabByName('carte-allergenes'),
  'carte allergenes':()=>switchTabByName('carte-allergenes'),
  'factures':       ()=>switchTabByName('factures'),
  'pièces':         ()=>switchTabByName('pieces'),
  'pieces':         ()=>switchTabByName('pieces'),
};

// ── Dictionnaire commandes globales ──
const VOICE_CMDS = {
  // Actions
  'exporter excel':          ()=>{exportExcel();return'📊 Export Excel lancé';},
  'exporter csv':            ()=>{exportCSV();return'⬇ Export CSV lancé';},
  'archiver inventaire':     ()=>{snapshotInventaire();return'📸 Inventaire archivé';},
  'nouvelle sauvegarde':     ()=>{openSave();return'💾 Sauvegarde ouverte';},
  'ajouter produit':         ()=>{openAddProduct();return'+ Ajout produit ouvert';},
  'nouveau produit':         ()=>{openAddProduct();return'+ Ajout produit ouvert';},
  'générer commande':        ()=>{genCommande();return'🛒 Commande générée';},
  'generer commande':        ()=>{genCommande();return'🛒 Commande générée';},
  'imprimer':                ()=>{printInventory();return'🖨 Impression...';},
  'annuler':                 ()=>'undo',
  // ── Envoi email / exports ──
  'envoyer':                 ()=>{openSendCenter();return'✉️ Centre d\'envoi ouvert';},
  'envoyer email':           ()=>{openSendCenter();return'✉️ Centre d\'envoi ouvert';},
  'envoyer par email':       ()=>{openSendCenter();return'✉️ Centre d\'envoi ouvert';},
  'envoyer rapport':         ()=>{openSendCenter();return'✉️ Centre d\'envoi ouvert';},
  'envoyer inventaire':      ()=>{_sendSelected=new Set(['inventaire','bilan','dlc']);openSendCenter();return'✉️ Envoi inventaire';},
  'envoyer bilan':           ()=>{_sendSelected=new Set(['bilan']);openSendCenter();return'✉️ Envoi bilan';},
  'envoyer commande':        ()=>{_sendSelected=new Set(['commande']);openSendCenter();return'✉️ Envoi commande';},
  'envoyer recettes':        ()=>{_sendSelected=new Set(['recettes']);openSendCenter();return'✉️ Envoi recettes';},
  'envoyer allergènes':      ()=>{_sendSelected=new Set(['allergenes','carte-allergenes']);openSendCenter();return'✉️ Envoi allergènes';},
  'envoyer allergenes':      ()=>{_sendSelected=new Set(['allergenes','carte-allergenes']);openSendCenter();return'✉️ Envoi allergènes';},
  'envoyer dlc':             ()=>{_sendSelected=new Set(['dlc']);openSendCenter();return'✉️ Envoi DLC';},
  'envoyer traçabilité':     ()=>{_sendSelected=new Set(['tracabilite']);openSendCenter();return'✉️ Envoi traçabilité';},
  'envoyer tracabilite':     ()=>{_sendSelected=new Set(['tracabilite']);openSendCenter();return'✉️ Envoi traçabilité';},
  'envoyer tout':            ()=>{_sendSelected=new Set(SEND_MODULES.map(m=>m.id));openSendCenter();return'✉️ Envoi tous les modules';},
  'rapport complet':         ()=>{_sendSelected=new Set(SEND_MODULES.map(m=>m.id));openSendCenter();return'✉️ Rapport complet';},
  'télécharger excel':       ()=>{_sendSelected=new Set(['inventaire','bilan','dlc']);buildUnifiedExcel(SEND_MODULES.filter(m=>_sendSelected.has(m.id)));return'📊 Excel téléchargé';},
  'telecharger excel':       ()=>{_sendSelected=new Set(['inventaire','bilan','dlc']);buildUnifiedExcel(SEND_MODULES.filter(m=>_sendSelected.has(m.id)));return'📊 Excel téléchargé';},
  // Zones
  'frigo 1':                 ()=>{setZone('FRIGO 1');return'Zone Frigo 1';},
  'frigo 2':                 ()=>{setZone('FRIGO 2');return'Zone Frigo 2';},
  'congélateur':             ()=>{setZone('CONGELATEUR');return'Zone Congélateur';},
  'congelateur':             ()=>{setZone('CONGELATEUR');return'Zone Congélateur';},
  'boissons':                ()=>{setZone('BOISSONS');return'Zone Boissons';},
  'caféterie':               ()=>{setZone('CAFETERIE');return'Zone Caféterie';},
  'cafeterie':               ()=>{setZone('CAFETERIE');return'Zone Caféterie';},
  'économat':                ()=>{setZone('ECONOMAT');return'Zone Économat';},
  'economat':                ()=>{setZone('ECONOMAT');return'Zone Économat';},
  'toutes zones':            ()=>{setZone('TOUT');return'Toutes les zones';},
  'tout':                    ()=>{setZone('TOUT');return'Toutes les zones';},
  // Relevé températures vocal
  'enregistrer températures':()=>{saveTempReleve();return'🌡 Relevé enregistré';},
  'sauvegarder températures':()=>{saveTempReleve();return'🌡 Relevé enregistré';},
};

// ── Commandes de traçabilité rapide ──
// "entrée beurre 3" / "sortie colin 2" / "perte tomate 1"
const TRAC_PREFIXES = {
  'entrée':['entree'],'entree':['entree'],'réception':['entree'],'reception':['entree'],
  'livraison':['entree'],'reçu':['entree'],'recu':['entree'],
  'sortie':['sortie'],'utilisé':['sortie'],'utilise':['sortie'],
  'cuisine':['sortie'],'envoyé':['sortie'],'envoye':['sortie'],
  'perte':['perte'],'perdu':['perte'],'périmé':['perte'],'perime':['perte'],
  'cassé':['perte'],'casse':['perte'],'jeté':['perte'],'jete':['perte'],
};

// ── DLC rapide : "dlc beurre 15 janvier" ──
const MOIS = {
  'janvier':1,'février':2,'fevrier':2,'mars':3,'avril':4,'mai':5,'juin':6,
  'juillet':7,'août':8,'aout':8,'septembre':9,'octobre':10,'novembre':11,'décembre':12,'decembre':12
};

// ── Température vocale : "frigo un trois degrés" ──
const TEMP_VOICE_ZONES = {
  'frigo 1':       'frigo1','frigo un':'frigo1','premier frigo':'frigo1',
  'frigo 2':       'frigo2','frigo deux':'frigo2','deuxième frigo':'frigo2','deuxieme frigo':'frigo2',
  'congélateur':   'congel','congelateur':'congel','congel':'congel',
  'cave':          'cave','boissons cave':'cave','cellier':'cave',
  'cuisine':       'cuisine',
};

// ── parseCmd étendu — toute l'application ──
function parseCmd(raw, allAlternatives){
  const t = normalizeText(raw||'');
  if(!t) return null;

  // 1. Annuler
  if(/^annul/.test(t)) return {cmd:'undo'};

  // 2. Navigation onglets
  for(const [key,fn] of Object.entries(VOICE_NAV)){
    if(t===normalizeText(key)||t.startsWith(normalizeText(key)+' ')||
       t.endsWith(' '+normalizeText(key))||t.includes(normalizeText(key))){
      return {cmd:'nav',fn,label:key};
    }
  }

  // 3. Commandes globales
  for(const [key,fn] of Object.entries(VOICE_CMDS)){
    if(t.includes(normalizeText(key))){
      const result=fn();
      if(result==='undo') return {cmd:'undo'};
      return {cmd:'action',label:result||key};
    }
  }

  // 4. Traçabilité rapide "entrée colin 3" / "sortie beurre 2"
  for(const [prefix,types] of Object.entries(TRAC_PREFIXES)){
    const pn=normalizeText(prefix);
    if(t.startsWith(pn+' ')||t===pn){
      const rest=t.slice(pn.length).trim();
      if(!rest) return {cmd:'trac-open',type:types[0]};
      // Parser quantité + produit dans le reste
      const qtyParsed=parseQtyAndProduct(rest, allAlternatives);
      if(qtyParsed) return {cmd:'trac',type:types[0],...qtyParsed};
      // Juste le produit sans quantité
      const prod=findProd(rest,allAlternatives);
      if(prod) return {cmd:'trac-ask-qty',type:types[0],product:prod};
    }
  }

  // 5. DLC rapide "dlc beurre 15 janvier 2026"
  if(t.startsWith('dlc ')||t.startsWith('date limite ')||t.startsWith('peremption ')){
    const rest=t.replace(/^(dlc|date limite|peremption)\s+/,'');
    const dlcResult=parseDLCVoice(rest,allAlternatives);
    if(dlcResult) return {cmd:'dlc',...dlcResult};
  }

  // 6. Température "frigo 1 trois degrés" / "congélateur moins vingt"
  const tempResult=parseTempVoice(t);
  if(tempResult) return {cmd:'temp',...tempResult};

  // 7. Recherche "chercher beurre" / "recherche colin"
  const searchMatch=t.match(/^(?:cherch(?:er?)?|recherch(?:er?)?|trouv(?:er?)?)\s+(.+)$/);
  if(searchMatch) return {cmd:'search',query:searchMatch[1]};

  // 8. Saisie quantité (comportement original)
  const qtyResult=parseQtyAndProduct(t, allAlternatives);
  if(qtyResult) return {cmd:'set',...qtyResult};

  return {cmd:'err',msg:`Non compris : "${raw}". Dites un produit et une quantité, ou une commande (ex: "dashboard", "entrée beurre 3", "frigo 1").`};
}

// ── Extraire quantité + produit (factorisation) ──
function parseQtyAndProduct(t, allAlternatives){
  const attempts=[
    ()=>{const m=t.match(/^(\d+(?:[.,]\d+)?)\s*(?:kilos?|kg|grammes?|g|litres?|l|cl|pieces?)?\s+(.+)$/);
         return m?{val:parseFloat(m[1].replace(',','.')),rest:m[2]}:null;},
    ()=>{const m=t.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:kilos?|kg|grammes?|g|litres?|l|cl|pieces?)?$/);
         return m?{val:parseFloat(m[2].replace(',','.')),rest:m[1]}:null;},
    ()=>{
      const keys=Object.keys(NUMS).sort((a,b)=>b.length-a.length);
      for(const k of keys){
        const kn=normalizeText(k);
        if(t.startsWith(kn+' ')){return{val:NUMS[k],rest:t.slice(k.length).trim()};}
        if(t.endsWith(' '+kn)){return{val:NUMS[k],rest:t.slice(0,t.lastIndexOf(k)).trim()};}
      }
      return null;
    },
    ()=>{
      const keys=Object.keys(NUMS).sort((a,b)=>b.length-a.length);
      for(const k of keys){
        const kn=normalizeText(k);
        const knEsc=kn.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        const rx=new RegExp('(.+?)\\s+'+knEsc+'\\s*(?:kilos?|kg|g|l|cl)?\\s*$','i');
        const m=t.match(rx);
        if(m)return{val:NUMS[k],rest:m[1]};
      }
      return null;
    },
  ];
  for(const attempt of attempts){
    const res=attempt();
    if(res&&res.val!=null&&!isNaN(res.val)&&res.rest){
      const prod=findProd(res.rest,[...(allAlternatives||[]),res.rest]);
      if(prod) return {product:prod,val:res.val,confidence:'high'};
    }
  }
  // Produit seul sans quantité
  const prod=findProd(t, allAlternatives);
  if(prod){
    const numMatch=t.match(/\d+(?:[.,]\d+)?/);
    if(numMatch) return {product:prod,val:parseFloat(numMatch[0].replace(',','.')),confidence:'low'};
    return null; // Renvoie null pour laisser la logique "ask" se déclencher dans l'appelant
  }
  return null;
}

// ── Parser DLC vocal ──
function parseDLCVoice(text, allAlternatives){
  // "beurre 15 janvier" / "colin 5 mars 2026"
  let day=null,month=null,year=new Date().getFullYear();
  // Extraire jour
  const dayM=text.match(/\b(\d{1,2})\b/);
  if(dayM) day=parseInt(dayM[1]);
  // Extraire mois
  for(const[m,n] of Object.entries(MOIS)){if(text.includes(m)){month=n;break;}}
  // Extraire année
  const yearM=text.match(/\b(202\d)\b/);
  if(yearM) year=parseInt(yearM[1]);
  if(!day||!month) return null;
  const dateStr=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  // Extraire produit (enlever les nombres et mois)
  let prodText=text.replace(/\b\d+\b/g,' ').replace(new RegExp(Object.keys(MOIS).join('|'),'g'),' ').replace(/\s+/g,' ').trim();
  const prod=findProd(prodText,allAlternatives);
  return prod?{product:prod,date:dateStr}:null;
}

// ── Parser température vocal ──
function parseTempVoice(text){
  for(const[zoneText,zoneId] of Object.entries(TEMP_VOICE_ZONES)){
    const zn=normalizeText(zoneText);
    if(!text.includes(zn)) continue;
    const rest=text.replace(zn,'').trim();
    // Chercher le nombre (peut être négatif "moins vingt")
    let val=null;
    const neg=rest.includes('moins')||rest.includes('-');
    const numM=rest.replace('moins','').trim().match(/^(\d+(?:[.,]\d+)?)/);
    if(numM) val=(neg?-1:1)*parseFloat(numM[1].replace(',','.'));
    if(numM===null){
      // Essayer wtn
      const numText=rest.replace('moins','').trim();
      const n=wtn(numText);
      if(n!==null) val=(neg?-1:1)*n;
    }
    if(val!==null) return {zoneId,val,zoneLabel:zoneText};
  }
  return null;
}

// ── sendCmd étendu ──
function sendCmd(raw, allAlternatives){
  const inp=document.getElementById('v-input');
  const text=raw!==undefined?raw:(inp?inp.value.trim():'');
  if(!text)return;
  const fb=document.getElementById('v-feedback');
  const parsed=parseCmd(text, allAlternatives);
  if(!parsed){fb.className='voice-feedback err';fb.textContent='Commande vide.';return;}

  // UNDO
  if(parsed.cmd==='undo'){voiceUndo();if(inp)inp.value='';return;}

  // NAVIGATION
  if(parsed.cmd==='nav'){
    parsed.fn();
    fb.className='voice-feedback ok';
    fb.innerHTML=`🧭 Navigation → <b>${parsed.label}</b>`;
    if(inp)inp.value='';return;
  }

  // ACTION GLOBALE
  if(parsed.cmd==='action'){
    fb.className='voice-feedback ok';
    fb.innerHTML=`✓ <b>${parsed.label}</b>`;
    if(inp)inp.value='';return;
  }

  // TRAÇABILITÉ RAPIDE
  if(parsed.cmd==='trac'){
    const icons={entree:'📥',sortie:'📤',perte:'🗑'};
    const labels={entree:'Entrée',sortie:'Sortie',perte:'Perte'};
    const entry={
      id:Date.now(),type:parsed.type,
      code:parsed.product.code,produit:parsed.product.produit,
      qte:parsed.val,unite:parsed.product.unite||'',
      date:new Date().toISOString(),resp:'Vocal',note:'Saisie vocale'
    };
    TRAC_DATA.unshift(entry);
    if(TRAC_DATA.length>1000)TRAC_DATA=TRAC_DATA.slice(0,1000);
    // Mise à jour stock
    const delta=parsed.type==='entree'?parsed.val:-parsed.val;
    parsed.product.qte=(parsed.product.qte||0)+delta;
    if(parsed.product.qte<0)parsed.product.qte=0;
    saveNewModules();autoSave();updateStats();render();scheduleBilanRebuild();
    fb.className='voice-feedback ok';
    fb.innerHTML=`${icons[parsed.type]||'📋'} <b>${labels[parsed.type]||parsed.type}</b> — <b>${parsed.product.produit}</b> : ${parsed.val} ${parsed.product.unite}`;
    if(inp)inp.value='';buildVoiceSuggestions();return;
  }

  if(parsed.cmd==='trac-open'){
    openTracAdd();
    fb.className='voice-feedback ok';
    fb.textContent='📋 Saisie traçabilité ouverte';
    if(inp)inp.value='';return;
  }

  if(parsed.cmd==='trac-ask-qty'){
    if(inp)inp.value=(parsed.type==='entree'?'entrée ':parsed.type==='sortie'?'sortie ':'perte ')+parsed.product.produit+' ';
    fb.className='voice-feedback';fb.style.color='var(--amber-text)';
    fb.textContent=`${parsed.product.produit} reconnu — quelle quantité ?`;
    if(inp)inp.focus();return;
  }

  // DLC RAPIDE
  if(parsed.cmd==='dlc'){
    DLC_DATA.push({
      id:Date.now(),code:parsed.product.code,produit:parsed.product.produit,
      lot:'',date:parsed.date,type:'DLC',qte:null,note:'Saisie vocale',
      createdAt:new Date().toISOString()
    });
    saveAllData();
    fb.className='voice-feedback ok';
    fb.innerHTML=`🌡 DLC enregistrée — <b>${parsed.product.produit}</b> : ${new Date(parsed.date).toLocaleDateString('fr-FR')}`;
    if(inp)inp.value='';return;
  }

  // TEMPÉRATURE
  if(parsed.cmd==='temp'){
    // Saisir dans le champ de la zone
    const tempInp=document.getElementById('temp-'+parsed.zoneId);
    if(tempInp){
      tempInp.value=parsed.val;
      checkTempLive(parsed.zoneId,
        TEMP_ZONES.find(z=>z.id===parsed.zoneId)?.min||0,
        TEMP_ZONES.find(z=>z.id===parsed.zoneId)?.max||100
      );
    }
    fb.className='voice-feedback ok';
    fb.innerHTML=`🌡 <b>${parsed.zoneLabel}</b> → <b>${parsed.val}°C</b>`;
    if(inp)inp.value='';
    // Aller sur l'onglet DLC si pas déjà là
    if(!document.getElementById('panel-dlc')?.classList.contains('active'))
      switchTabByName('dlc');
    return;
  }

  // RECHERCHE
  if(parsed.cmd==='search'){
    const searchEl=document.getElementById('search');
    if(searchEl){searchEl.value=parsed.query;render();}
    if(!document.getElementById('panel-inventaire')?.classList.contains('active'))
      switchTabByName('inventaire');
    fb.className='voice-feedback ok';
    fb.innerHTML=`🔍 Recherche : <b>${parsed.query}</b>`;
    if(inp)inp.value='';return;
  }

  // ERREUR
  if(parsed.cmd==='err'){
    fb.className='voice-feedback err';
    fb.innerHTML='❌ '+parsed.msg;
    return;
  }

  // SAISIE QUANTITÉ (cmd:'set' ou cmd:'ask')
  if(parsed.cmd==='ask'){
    if(inp)inp.value=parsed.product.produit+' ';
    fb.className='voice-feedback';fb.style.color='var(--amber-text)';
    fb.textContent='✅ '+parsed.product.produit+' reconnu — quelle quantité ?';
    if(inp)inp.focus();return;
  }

  // SET quantité
  const p=parsed.product;
  lastAction={code:p.code,prev:p.qte};
  p.qte=parsed.val;
  const el=document.querySelector(`input[data-code="${p.code}"]`);
  if(el)el.value=parsed.val;
  upd(p.code,parsed.val);
  const row=document.getElementById('row-'+p.code);
  if(row){row.classList.remove('row-flash');void row.offsetWidth;row.classList.add('row-flash');
    if(typeof row.scrollIntoView==='function')row.scrollIntoView({behavior:'smooth',block:'center'});}
  const confIcon=parsed.confidence==='low'?'⚠️ ':'✓ ';
  fb.className='voice-feedback ok';
  fb.innerHTML=`${confIcon}<b>${p.produit}</b> → <b>${parsed.val} ${p.unite||''}</b>${parsed.confidence==='low'?' <small style="color:var(--amber-text)">(vérifiez)</small>':''}`;
  if(inp){inp.value='';setTimeout(()=>inp.focus(),100);}
  buildVoiceSuggestions();
}


function clearInput(){
  const inp=document.getElementById('v-input');if(inp)inp.value='';
  const fb=document.getElementById('v-feedback');if(fb){fb.className='voice-feedback';fb.textContent='';}
  if(inp)inp.focus();
}
function voiceUndo(){
  const fb=document.getElementById('v-feedback');
  if(!lastAction){fb.className='voice-feedback err';fb.textContent='Rien à annuler.';return;}
  const item=DATA.find(d=>d.code===lastAction.code);
  if(item){item.qte=lastAction.prev;
    const el=document.querySelector(`input[data-code="${item.code}"]`);
    if(el)el.value=lastAction.prev??'';
    upd(item.code,lastAction.prev);
    fb.className='voice-feedback ok';fb.textContent=`↩ ${item.produit} rétabli à ${lastAction.prev??'vide'}`;}
  lastAction=null;
}

// ── IMPRESSION ─────────────────────────────────────────────
function buildPrintPage(){
  const now=new Date();
  const dateStr=now.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  const timeStr=now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});

  // Grouper par zone, dans l'ordre de ZONES
  const zoneOrder=Object.keys(ZONES);
  const byZone={};
  DATA.forEach(d=>{(byZone[d.zone]=byZone[d.zone]||[]).push(d);});

  let html=`<div class="print-header">
    <h1>🍽 Inventaire HACCP — La Salle à Manger</h1>
    <p>Grenoble · Juin 2026</p>
    <div class="print-meta">
      <span>Édité le ${dateStr} à ${timeStr}</span>
      <span>${DATA.length} références</span>
    </div>
  </div>`;

  zoneOrder.forEach(z=>{
    const items=byZone[z];
    if(!items||!items.length)return;
    const info=ZONES[z];
    let zoneTotal=0;
    let rows=items.map(d=>{
      const m=mont(d);
      if(m!==null)zoneTotal+=m;
      const qStr=(d.qte!==null&&d.qte!==undefined)?String(d.qte).replace('.',','):'';
      const mStr=m!==null?m.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}):'';
      const empty=(d.qte===null||d.qte===undefined)?' class="empty-qty"':'';
      return`<tr${empty}>
        <td>${d.code}</td>
        <td>${d.produit}</td>
        <td>${d.unite||''}</td>
        <td class="num">${d.prix?d.prix.toFixed(2):''}</td>
        <td class="num">${qStr}</td>
        <td class="num">${mStr}</td>
      </tr>`;
    }).join('');
    html+=`<div class="print-zone">
      <div class="print-zone-title">${info?info.label:z} — ${info?info.htext:'Divers'}</div>
      <table class="print-table">
        <thead><tr>
          <th>Code</th><th>Produit</th><th>Unité</th>
          <th class="num">Prix HT</th><th class="num">Qté</th><th class="num">Montant</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="print-zone-total">Sous-total ${info?info.label:z} : ${zoneTotal.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €</div>
    </div>`;
  });

  const grandTotal=DATA.reduce((s,d)=>s+(mont(d)||0),0);
  const vides=DATA.filter(d=>d.qte===null||d.qte===undefined).length;

  const BEV_ZONES=['BOISSONS','CAFETERIE'];
  const synth={boissons:{total:0,refs:0,manquants:0},nourriture:{total:0,refs:0,manquants:0}};
  DATA.forEach(d=>{
    const key=BEV_ZONES.includes(d.zone)?'boissons':'nourriture';
    const m=mont(d);
    synth[key].total+=(m||0);
    synth[key].refs++;
    if(d.qte===null||d.qte===undefined)synth[key].manquants++;
  });
  html+=`<div class="print-synth">
    <div class="print-synth-box">
      <div class="print-synth-label">🥤 Sous-total Boissons &amp; Caféterie</div>
      <div class="print-synth-sub">${synth.boissons.refs} réf. · ${synth.boissons.manquants} sans qté</div>
      <div class="print-synth-val">${synth.boissons.total.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €</div>
    </div>
    <div class="print-synth-box">
      <div class="print-synth-label">🍴 Sous-total Nourriture</div>
      <div class="print-synth-sub">${synth.nourriture.refs} réf. · ${synth.nourriture.manquants} sans qté</div>
      <div class="print-synth-val">${synth.nourriture.total.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €</div>
    </div>
  </div>`;

  html+=`<div class="print-grand-total">
    <div class="label">TOTAL GÉNÉRAL HT (${DATA.length} réf. · ${vides} sans quantité)</div>
    <div class="val">${grandTotal.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €</div>
  </div>`;

  html+=`<div class="print-sig-row">
    <div class="print-sig"><div class="line"></div>Réalisé par</div>
    <div class="print-sig"><div class="line"></div>Vérifié par</div>
    <div class="print-sig"><div class="line"></div>Date / Visa</div>
  </div>`;

  html+=`<div class="print-footer-note">Document généré automatiquement — Inventaire HACCP La Salle à Manger, Grenoble.</div>`;

  document.getElementById('print-page').innerHTML=html;
}

function printInventory(){
  buildPrintPage();
  setTimeout(()=>window.print(),50);
}

// ── REMISE À ZÉRO ──────────────────────────────────────────
function resetInventory(){
  const count=DATA.filter(d=>d.qte!==null&&d.qte!==undefined).length;
  document.getElementById('reset-count').textContent=count;
  document.getElementById('reset-overlay').classList.add('open');
}

function closeReset(){
  document.getElementById('reset-overlay').classList.remove('open');
}

function confirmReset(){
  // Double confirmation obligatoire pour action irréversible HACCP
  if(!confirm('⚠️ ACTION IRRÉVERSIBLE\n\nToutes les quantités de l\'inventaire seront remises à zéro.\nCette action affecte des données de conformité légale HACCP.\n\nConfirmez-vous ?')) return;
  DATA.forEach(d=>{d.qte=null;});
  lastAction=null;
  // Vider tous les champs de saisie visibles
  document.querySelectorAll('.qte-input').forEach(inp=>{inp.value='';});
  // Recalculer affichages des montants
  document.querySelectorAll('[id^="m-"]').forEach(cell=>{
    cell.textContent='—';
    cell.className='cell cell-montant montant-zero';
  });
  updateStats();
  render();
  buildBilan();
  closeReset();
  autoSave();
}

// ── SAUVEGARDE ─────────────────────────────────────────────
const STORAGE_KEY='haccp_salleamanger_inventaire_v1';

// ══ DONNÉES PERSISTANTES NOUVELLES FONCTIONNALITÉS ══════
const DLC_KEY='haccp_dlc_v1';
const HISTO_KEY='haccp_historique_v1';
const SEUILS_KEY='haccp_seuils_v1';
const TEMP_KEY='haccp_temperatures_v1';
const ALLERGENS_KEY='haccp_allergenes_v1';
const CMD_KEY='haccp_commande_v1';

// 14 allergènes réglementaires UE
const ALLERGENS_LIST=[
  {id:'gluten',label:'Gluten',emoji:'🌾'},
  {id:'crustaces',label:'Crustacés',emoji:'🦐'},
  {id:'oeufs',label:'Œufs',emoji:'🥚'},
  {id:'poisson',label:'Poisson',emoji:'🐟'},
  {id:'arachides',label:'Arachides',emoji:'🥜'},
  {id:'soja',label:'Soja',emoji:'🫘'},
  {id:'lait',label:'Lait',emoji:'🥛'},
  {id:'fruits_coque',label:'Fruits à coque',emoji:'🌰'},
  {id:'celeri',label:'Céleri',emoji:'🌿'},
  {id:'moutarde',label:'Moutarde',emoji:'🍯'},
  {id:'sesame',label:'Sésame',emoji:'🌻'},
  {id:'so2',label:'SO₂/Sulfites',emoji:'🍷'},
  {id:'lupin',label:'Lupin',emoji:'🌼'},
  {id:'mollusques',label:'Mollusques',emoji:'🦑'},
];

// Zones de stockage avec seuils de température HACCP
const TEMP_ZONES=[
  {id:'frigo1',label:'Frigo 1',min:0,max:4,unit:'°C'},
  {id:'frigo2',label:'Frigo 2',min:0,max:4,unit:'°C'},
  {id:'congel',label:'Congélateur',min:-25,max:-18,unit:'°C'},
  {id:'cave',label:'Cave / Boissons',min:8,max:15,unit:'°C'},
  {id:'cuisine',label:'Cuisine',min:0,max:63,unit:'°C'},
];

let DLC_DATA=[];
let HISTO_DATA=[];
let SEUILS_DATA={};   // {code: {min, unite}}
let TEMP_DATA=[];     // [{date, releves:{frigo1:3.2, congel:-21...}}]
let ALLERGEN_DATA={}; // {code: [allergen_id, ...]}
let CMD_DATA=[];      // [{code, produit, fournisseur, qteCmd, unite, prix, note}]

const ALLERGEN_PRESETS={'F193':['gluten','so2'],'N010':['gluten','so2'],'F202':['so2'],'F203':['lait'],'F204':['oeufs'],'N011':['oeufs'],'F205':['lait'],'F206':['lait'],'F208':['lait','soja'],'F210':['gluten'],'N012':['lait'],'N013':['lait'],'F212':['lait'],'F214':['gluten'],'N014':['lait'],'N015':['lait'],'F215':['oeufs'],'N016':['oeufs'],'F217':['oeufs','moutarde','so2'],'P025':['lait'],'P026':['lait'],'P027':['lait'],'P028':['lait'],'P029':['so2'],'P030':['lait'],'P031':['oeufs','moutarde','so2'],'P032':['so2','gluten'],'P033':['lait'],'P034':['lait'],'P035':['gluten','oeufs','lait'],'P036':['lait'],'P037':['lait'],'P038':['lait'],'P039':['lait'],'P072':['celeri'],'F258':['poisson'],'F259':['gluten','oeufs','lait'],'F260':['poisson'],'F261':['gluten','oeufs','lait'],'F263':['gluten','crustaces'],'F264':['gluten','oeufs'],'F265':['gluten','sesame'],'F266':['gluten','oeufs','lait'],'F275':['lait'],'F276':['gluten','lait'],'F280':['gluten','oeufs','lait'],'F281':['gluten'],'F282':['gluten'],'F283':['gluten'],'F284':['gluten','oeufs','lait'],'F286':['gluten'],'F288':['poisson'],'F289':['poisson','gluten','lait'],'F291':['gluten','oeufs','lait'],'F292':['gluten','oeufs','lait'],'F295':['poisson'],'F296':['poisson','gluten','oeufs','lait'],'F298':['poisson','gluten','lait'],'F300':['gluten'],'F302':['gluten','oeufs','lait'],'F303':['so2'],'F304':['poisson'],'F305':['poisson'],'F311':['poisson'],'N020':['poisson','mollusques'],'N021':['poisson'],'N022':['mollusques'],'N027':['gluten'],'N029':['gluten','oeufs','lait'],'N030':['gluten','oeufs','lait'],'N031':['gluten','oeufs','lait'],'N032':['gluten','oeufs','lait'],'N034':['poisson'],'N035':['gluten','oeufs','lait'],'N037':['poisson'],'P040':['so2'],'P041':['gluten','oeufs','lait'],'P042':['gluten'],'P043':['gluten','oeufs'],'P044':['gluten','oeufs','lait'],'P046':['gluten'],'P047':['poisson'],'P048':['poisson'],'P051':['gluten','sesame'],'P052':['gluten','oeufs','lait'],'P054':['gluten','oeufs','lait'],'P057':['gluten','oeufs','lait'],'P058':['gluten','oeufs','lait'],'F001':['gluten'],'F003':['so2'],'F004':['so2'],'F005':['so2'],'F006':['so2'],'F007':['so2'],'F009':['so2'],'F010':['so2'],'F011':['so2','gluten'],'F016':['so2'],'F018':['so2'],'F019':['so2'],'F021':['so2'],'F024':['gluten'],'F025':['so2'],'F027':['so2'],'F047':['gluten'],'F048':['gluten'],'F049':['gluten'],'F056':['so2'],'F058':['so2'],'F059':['so2'],'M001':['so2'],'M002':['so2'],'F065':['so2'],'F066':['so2'],'N001':['so2'],'F084':['so2'],'F085':['gluten'],'F051':['so2'],'F052':['so2'],'F053':['so2'],'F086':['fruits_coque'],'F100':['so2'],'F108':['fruits_coque'],'N002':['fruits_coque'],'F111':['fruits_coque'],'F112':['gluten','oeufs','lait'],'F116':['gluten'],'F118':['so2'],'F124':['lait','gluten','oeufs'],'F125':['gluten','oeufs'],'F129':['gluten'],'F132':['celeri','so2'],'N003':['celeri','so2'],'F135':['celeri'],'F137':['poisson'],'F146':['celeri','so2'],'F148':['gluten','oeufs'],'F156':['moutarde','so2'],'F158':['moutarde','so2'],'F161':['fruits_coque'],'P013':['fruits_coque','celeri','moutarde','so2'],'P014':['so2'],'N008':['so2'],'P015':['fruits_coque'],'P018':['so2'],'P024':['gluten']};
function loadAllData(){
  try{const r=localStorage.getItem(DLC_KEY);if(r)DLC_DATA=JSON.parse(r);}catch(e){}
  try{const r=localStorage.getItem(HISTO_KEY);if(r)HISTO_DATA=JSON.parse(r);}catch(e){}
  try{const r=localStorage.getItem(SEUILS_KEY);if(r)SEUILS_DATA=JSON.parse(r);}catch(e){}
  try{const r=localStorage.getItem(TEMP_KEY);if(r)TEMP_DATA=JSON.parse(r);}catch(e){}
  try{const r=localStorage.getItem(ALLERGENS_KEY);if(r)ALLERGEN_DATA=JSON.parse(r);}catch(e){}
  try{const r=localStorage.getItem(CMD_KEY);if(r)CMD_DATA=JSON.parse(r);}catch(e){}
  loadNewModules();
  loadPlats();
  // Pré-remplir les allergènes si jamais définis
  let changed=false;
  Object.entries(ALLERGEN_PRESETS).forEach(([code,algs])=>{
    if(!ALLERGEN_DATA[code]){ALLERGEN_DATA[code]=algs;changed=true;}
  });
  if(changed){try{localStorage.setItem(ALLERGENS_KEY,JSON.stringify(ALLERGEN_DATA));syncToCloud('allergenes',ALLERGEN_DATA);}catch(e){}}
}
function saveAllData(){
  try{localStorage.setItem(DLC_KEY,JSON.stringify(DLC_DATA));syncToCloud('dlc',DLC_DATA);}catch(e){}
  try{localStorage.setItem(HISTO_KEY,JSON.stringify(HISTO_DATA));syncToCloud('historique',HISTO_DATA);}catch(e){}
  try{localStorage.setItem(SEUILS_KEY,JSON.stringify(SEUILS_DATA));syncToCloud('seuils',SEUILS_DATA);}catch(e){}
  try{syncToCloud('temperatures', JSON.parse(localStorage.getItem(TEMP_KEY)||'[]'));
  localStorage.setItem(TEMP_KEY,JSON.stringify(TEMP_DATA));syncToCloud('temperatures',TEMP_DATA);}catch(e){}
  try{localStorage.setItem(ALLERGENS_KEY,JSON.stringify(ALLERGEN_DATA));syncToCloud('allergenes',ALLERGEN_DATA);}catch(e){}
  try{localStorage.setItem(CMD_KEY,JSON.stringify(CMD_DATA));syncToCloud('commande',CMD_DATA);}catch(e){}
}

let autoSaveTimer=null;
let lastSavedAt=null;
let lastRestoredAt=null;
let storageAvailable=true;

function scheduleAutoSave(){
  clearTimeout(autoSaveTimer);
  autoSaveTimer=setTimeout(autoSave,300);
}

function autoSave(){

  try{
    const payload={
      savedAt:new Date().toISOString(),
      qtes:{}
    };
    DATA.forEach(d=>{payload.qtes[d.code]=d.qte;});
    localStorage.setItem(STORAGE_KEY,JSON.stringify(payload));syncToCloud('inventaire',payload);
    lastSavedAt=payload.savedAt;
    storageAvailable=true;
    return true;
  }catch(e){
    storageAvailable=false;
    return false;
  }
}

function loadAutoSave(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return null;
    const payload=JSON.parse(raw);
    if(!payload||typeof payload.qtes!=='object')return null;
    let applied=0;
    DATA.forEach(d=>{
      if(Object.prototype.hasOwnProperty.call(payload.qtes,d.code)){
        const v=payload.qtes[d.code];
        d.qte=(v===null||v===undefined)?null:Number(v);
        applied++;
      }
    });
    lastSavedAt=payload.savedAt||null;
    lastRestoredAt=payload.savedAt||null;
    return {applied,savedAt:payload.savedAt};
  }catch(e){
    storageAvailable=false;
    return null;
  }
}

function fmtDateTime(iso){
  if(!iso)return null;
  try{
    const d=new Date(iso);
    return d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})+' à '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  }catch(e){return null;}
}

function refreshSaveStatus(){
  const el=document.getElementById('save-status');
  if(!el)return;
  if(!storageAvailable){
    el.innerHTML='⚠️ La sauvegarde automatique n\'est pas disponible dans ce navigateur (mode privé ?). Utilisez Exporter/Importer pour conserver vos données.';
    return;
  }
  let html='';
  if(lastRestoredAt){
    html+='✅ Données restaurées (sauvegarde du '+fmtDateTime(lastRestoredAt)+').<br>';
  }
  if(lastSavedAt){
    html+='💾 Dernière sauvegarde automatique : <b>'+fmtDateTime(lastSavedAt)+'</b>';
  }else{
    html+='Aucune sauvegarde automatique pour l\'instant — elle se déclenche dès votre première saisie.';
  }
  el.innerHTML=html;
}

function openSave(){
  refreshSaveStatus();
  document.getElementById('save-feedback').className='voice-feedback';
  document.getElementById('save-overlay').classList.add('open');
}
function closeSave(){
  document.getElementById('save-overlay').classList.remove('open');
}

function exportInventoryJSON(){
  const now=new Date();
  const payload={
    app:'Inventaire HACCP - La Salle à Manger - Grenoble',
    exportedAt:now.toISOString(),
    totalHT:DATA.reduce((s,d)=>s+(mont(d)||0),0),
    items:DATA.map(d=>({code:d.code,produit:d.produit,zone:d.zone,qte:(d.qte===undefined?null:d.qte)}))
  };
  const json=JSON.stringify(payload,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  const stamp=now.toISOString().slice(0,16).replace('T','_').replace(':','h');
  a.download='inventaire_HACCP_save_'+stamp+'.json';
  a.click();
  URL.revokeObjectURL(url);
  const fb=document.getElementById('save-feedback');
  fb.className='voice-feedback ok';
  fb.textContent='✓ Fichier de sauvegarde exporté : '+a.download;
}

function importInventoryJSON(input){
  const file=input.files&&input.files[0];
  const fb=document.getElementById('save-feedback');
  const diskStatus=document.getElementById('disk-save-status');
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const payload=JSON.parse(e.target.result);
      // Support format v2 (qtes flat) et v1 (items array)
      let applied=0,unknown=0;
      if(payload.version===2&&payload.qtes&&typeof payload.qtes==='object'){
        // Format v2 : {qtes:{code:qte,...}}
        Object.entries(payload.qtes).forEach(([code,qte])=>{
          const target=DATA.find(d=>d.code===code);
          if(target){
            target.qte=(qte===null||qte===undefined||qte==='')?null:Number(qte);
            applied++;
          }else{
            unknown++;
          }
        });
      }else{
        // Format v1 : {items:[{code,qte},...]}
        const items=Array.isArray(payload.items)?payload.items:null;
        if(!items){
          fb.className='voice-feedback err';
          fb.textContent='❌ Fichier invalide — format de sauvegarde non reconnu.';
          return;
        }
        items.forEach(it=>{
          const target=DATA.find(d=>d.code===it.code);
          if(target){
            const v=it.qte;
            target.qte=(v===null||v===undefined||v==='')?null:Number(v);
            applied++;
          }else{
            unknown++;
          }
        });
      }
      // Rafraîchir l'UI complète
      document.querySelectorAll('.qte-input').forEach(inp=>{
        const item=DATA.find(d=>d.code===inp.dataset.code);
        inp.value=(item&&item.qte!==null&&item.qte!==undefined)?item.qte:'';
      });
      document.querySelectorAll('[id^="m-"]').forEach(cell=>{
        const code=cell.id.slice(2);
        const item=DATA.find(d=>d.code===code);
        if(!item)return;
        const m=mont(item);
        cell.textContent=m!==null?m.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €':'—';
        cell.className='cell cell-montant'+(m===null?' montant-zero':'');
      });
      updateStats();
      render();
      buildBilan();
      autoSave();
      // Lier ce fichier comme cible disque si File System Access disponible
      if(window.showSaveFilePicker&&file.name){
        if(diskStatus){
          diskStatus.style.display='block';
          diskStatus.textContent='💿 Fichier lié : '+file.name+' — le bouton "Enregistrer sur le disque" le mettra à jour directement.';
        }
      }
      fb.className='voice-feedback ok';
      fb.textContent='✓ '+applied+' référence(s) restaurée(s)'+(unknown?' · '+unknown+' code(s) ignoré(s) (non présents dans cet inventaire)':'')+(payload.exportedAt?' — sauvegarde du '+fmtDateTime(payload.exportedAt):'');
      input.value='';
      refreshSaveStatus();
    }catch(err){
      fb.className='voice-feedback err';
      fb.textContent='❌ Impossible de lire ce fichier (JSON invalide).';
    }
    input.value='';
  };
  reader.readAsText(file);
}

// ── ENREGISTREMENT SUR DISQUE ────────────────────────────────
// Clé localStorage pour retenir le handle de fichier entre sessions
const DISK_HANDLE_KEY='haccp_disk_filehandle_v1';
let __diskFileHandle=null; // FileSystemFileHandle (API moderne)

function buildSavePayload(){
  const qtes={};
  DATA.forEach(d=>{ qtes[d.code]=(d.qte!==null&&d.qte!==undefined)?d.qte:null; });
  return JSON.stringify({
    app:'Inventaire HACCP - La Salle à Manger - Grenoble',
    exportedAt:new Date().toISOString(),
    version:2,
    qtes,
    items:DATA.map(d=>({code:d.code,produit:d.produit,zone:d.zone,qte:d.qte??null}))
  },null,2);
}

function diskSaveFilename(){
  const d=new Date();
  return 'inventaire_HACCP_'+d.toISOString().slice(0,10)+'.json';
}

async function saveToDisk(){
  const fb=document.getElementById('save-feedback');
  const diskStatus=document.getElementById('disk-save-status');
  const payload=buildSavePayload();
  const blob=new Blob([payload],{type:'application/json'});

  // Essai 1 : File System Access API (Chrome ≥86 sur PC/Mac/Android)
  if(window.showSaveFilePicker){
    try{
      // Réutiliser le handle précédent si disponible (mise à jour du même fichier)
      let handle=__diskFileHandle;
      if(!handle){
        handle=await window.showSaveFilePicker({
          suggestedName:diskSaveFilename(),
          types:[{description:'Sauvegarde inventaire JSON',accept:{'application/json':['.json']}}],
          startIn:'documents'
        });
        __diskFileHandle=handle;
      }
      const writable=await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      const fname=handle.name||diskSaveFilename();
      fb.className='voice-feedback ok';
      fb.textContent='✅ Enregistré sur le disque : '+fname;
      diskStatus.style.display='block';
      diskStatus.textContent='💿 Fichier lié : '+fname+' — le bouton "Enregistrer sur le disque" le mettra à jour directement.';
      lastSavedAt=new Date().toISOString();
      refreshSaveStatus();
      return;
    }catch(e){
      if(e&&e.name==='AbortError'){
        // L'utilisateur a annulé la boîte de dialogue → pas une erreur
        fb.className='voice-feedback';
        fb.textContent='';
        return;
      }
      // Handle invalide (fichier déplacé/supprimé) → réessayer sans handle
      if(e&&(e.name==='NotAllowedError'||e.name==='InvalidStateError')){
        __diskFileHandle=null;
        diskStatus.style.display='none';
        return saveToDisk(); // relancer proprement
      }
      // Autre erreur → fallback téléchargement
      console.warn('showSaveFilePicker erreur:', e);
    }
  }

  // Essai 2 : showOpenFilePicker n'est pas dispo → fallback download classique
  // (iOS Safari, Firefox, vieux Chrome)
  try{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=diskSaveFilename();
    a.click();
    URL.revokeObjectURL(url);
    fb.className='voice-feedback ok';
    fb.textContent='✅ Fichier téléchargé dans vos Téléchargements : '+diskSaveFilename()+'. Utilisez "Ouvrir / Importer" pour le recharger.';
    diskStatus.style.display='none';
    lastSavedAt=new Date().toISOString();
    refreshSaveStatus();
  }catch(e2){
    fb.className='voice-feedback err';
    fb.textContent='❌ Enregistrement impossible sur ce navigateur.';
  }
}

function clearAutoSave(){
  const fb=document.getElementById('save-feedback');
  try{
    localStorage.removeItem(STORAGE_KEY);
    lastSavedAt=null;
    lastRestoredAt=null;
    fb.className='voice-feedback ok';
    fb.textContent='✓ Sauvegarde automatique effacée de ce navigateur.';
  }catch(e){
    fb.className='voice-feedback err';
    fb.textContent='❌ Impossible d\'effacer la sauvegarde.';
  }
  refreshSaveStatus();
}

function showRestoreBanner(count,savedAt){
  const el=document.getElementById('restore-banner');
  const txt=document.getElementById('restore-banner-text');
  if(!el||!txt)return;
  const when=fmtDateTime(savedAt);
  txt.textContent='✅ '+count+' quantité'+(count>1?'s':'')+' restaurée'+(count>1?'s':'')+(when?' — sauvegarde du '+when:'')+'.';
  el.classList.add('show');
}

function dismissRestoreBanner(){
  const el=document.getElementById('restore-banner');
  if(el)el.classList.remove('show');
}

// ── ACCÈS PHOTO / CAMÉRA ────────────────────────────────────
function detectCameraContext(){
  const banner=document.getElementById('camera-context-banner');
  const hint=document.getElementById('camera-status-hint');
  if(!banner||!hint)return;
  const proto=window.location.protocol;
  const isSecure=window.isSecureContext===true;
  const hasCapture='capture' in document.createElement('input');
  if(proto==='file:'){
    banner.style.display='block';
    banner.innerHTML='⚠️ <b>Page ouverte en file:// (fichier local)</b> — la caméra peut être bloquée par le navigateur. Pour une utilisation complète, hébergez l\'app sur <b>tiiny.host</b> ou ouvrez-la depuis un vrai serveur HTTPS. La galerie (📁) fonctionne toujours.';
  }else if(proto==='about:'){
    banner.style.display='block';
    banner.innerHTML='⚠️ <b>Page affichée dans un aperçu intégré (about:)</b> — accès caméra restreint. Ouvrez l\'app directement dans votre navigateur (Safari, Chrome…) en collant l\'URL dans la barre d\'adresse. La galerie (📁) fonctionne toujours.';
  }else if(!isSecure){
    banner.style.display='block';
    banner.innerHTML='⚠️ <b>Contexte non sécurisé (HTTP)</b> — la caméra nécessite HTTPS. La galerie (📁) fonctionne toujours.';
  }else{
    banner.style.display='none';
  }
  hint.textContent=hasCapture?'':'ℹ️ Attribut capture non supporté — le bouton Caméra utilisera le sélecteur de fichiers.';
}

function openCamera(){
  try{
    document.getElementById('photo-input-camera').click();
  }catch(e){
    const fb=document.getElementById('pieces-feedback');
    if(fb){fb.className='voice-feedback err';fb.textContent='❌ Impossible d\'ouvrir la caméra sur ce navigateur. Utilisez le bouton Galerie / Fichier à la place.';}
  }
}

function openGallery(){
  try{
    document.getElementById('photo-input-gallery').click();
  }catch(e){
    const fb=document.getElementById('pieces-feedback');
    if(fb){fb.className='voice-feedback err';fb.textContent='❌ Impossible d\'ouvrir la galerie.';}
  }
}


const PIECES_KEY='haccp_salleamanger_pieces_v1';
const COMPTABLE_KEY='haccp_salleamanger_email_comptable_v1';
let PIECES=[];
let currentPiece=null;

function buildAccountSelect(){
  const sel=document.getElementById('piece-code');
  if(!sel)return;
  sel.innerHTML=ACCOUNT_CODES.map(a=>`<option value="${a.code}">${a.code} — ${a.label}</option>`).join('');
}

function accountLabel(code){
  const a=ACCOUNT_CODES.find(x=>x.code===code);
  return a?(a.code+' — '+a.label):code;
}

function collectPieceMeta(){
  const sel=document.getElementById('piece-code');
  const code=sel?sel.value:(ACCOUNT_CODES[0]&&ACCOUNT_CODES[0].code);
  const a=ACCOUNT_CODES.find(x=>x.code===code)||{code:code,label:''};
  const montantRaw=(document.getElementById('piece-montant')||{value:''}).value;
  const montant=montantRaw===''?null:parseFloat(String(montantRaw).replace(',','.'));
  const fournisseur=((document.getElementById('piece-fournisseur')||{value:''}).value||'').trim();
  const now=new Date();
  return{
    code:a.code,
    label:a.label,
    montant:(montant===null||isNaN(montant))?null:montant,
    fournisseur:fournisseur,
    dateISO:now.toISOString(),
    dateStr:now.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})+' à '+now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
  };
}

function buildStampLines(meta){
  const lines=[RESTAURANT_NAME,meta.dateStr,accountLabel(meta.code)];
  if(meta.montant!==null&&meta.montant!==undefined&&!isNaN(meta.montant)){
    lines.push('Montant TTC : '+meta.montant.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €');
  }
  if(meta.fournisseur){
    lines.push('Fournisseur / Réf. : '+meta.fournisseur);
  }
  return lines;
}

function drawStamp(ctx,lines,w,h){
  const lineH=Math.max(16,Math.round(w*0.024));
  const pad=Math.round(lineH*0.55);
  const bannerH=lines.length*lineH+pad*2;
  ctx.save();
  ctx.fillStyle='rgba(255,255,255,0.92)';
  ctx.fillRect(0,Math.max(0,h-bannerH),w,bannerH);
  ctx.fillStyle='#1a1a18';
  lines.forEach((line,i)=>{
    ctx.font=(i===0||i===2?'700 ':'400 ')+lineH+'px -apple-system,Helvetica,Arial,sans-serif';
    ctx.fillText(line,pad,h-bannerH+pad+(i+1)*lineH-Math.round(lineH*0.28));
  });
  ctx.restore();
  return bannerH;
}

function pieceFilename(meta){
  const d=new Date(meta.dateISO);
  const stamp=d.toISOString().slice(0,16).replace('T','_').replace(':','h');
  return 'piece_'+meta.code+'_'+stamp+'.png';
}

// ── SUGGESTION AUTOMATIQUE D'IMPUTATION ─────────────────────
// Mots-clés (fournisseurs, libellés) associés à chaque code comptable.
// Ordre = priorité : les libellés de service les plus spécifiques sont
// testés avant le repli générique "alimentaire" (601100).
const ACCOUNT_KEYWORDS=[
  {code:'622600',words:['AUDIT','HACCP','APAVE','BUREAU VERITAS','SOCOTEC','CONTROLE SANITAIRE','LABORATOIRE','ANALYSE MICROBIO','PRELEVEMENT']},
  {code:'626300',words:['ORANGE','SFR','BOUYGUES TELECOM','FREE MOBILE','TELEPHONIE','FORFAIT MOBILE','FIBRE OPTIQUE','TELECOM','ABONNEMENT MOBILE','OPERATEUR']},
  {code:'606100',words:['EDF','ENGIE','TOTALENERGIES','ENERGIE','ELECTRICITE','GAZ NATUREL','FACTURE GAZ','FLUIDES','EAU CONSOMMATION','VEOLIA']},
  {code:'651100',words:['LOGICIEL','CAISSE ENREGISTREUSE','ABONNEMENT LOGICIEL','LICENCE LOGICIEL','SAAS','ZELTY','LIGHTSPEED','TILLO','SUMUP','LOGICIEL CAISSE']},
  {code:'615600',words:['MAINTENANCE','REPARATION','DEPANNAGE','SAV','TECHNICIEN','INTERVENTION TECHNIQUE','CLIMATISATION','CHAUDIERE','FRIGORISTE','CONTRAT ENTRETIEN MATERIEL']},
  {code:'602200',words:['PRODUITS ENTRETIEN','DESINFECTANT','DETERGENT','SOPALIN','ESSUIE TOUT','PAPIER TOILETTE','SAC POUBELLE','ECOLABEL','GANTS','LESSIVE','NETTOYANT']},
  {code:'606300',words:['VAISSELLE','COUVERT','ASSIETTE','VERRERIE','PLATEAU SERVICE','USTENSILE','PETIT MATERIEL','CASSEROLE','MARMITE','BATTERIE CUISINE']},
  {code:'607100',words:['FRANCE BOISSONS','MICAND','BRASSERIE','CAVE A VIN','OENOLOGIE','BIERE','VIN ','SODA','EAU MINERALE','SPIRITUEUX']},
  {code:'601100',words:['SYSCO','POMONA','GINEYS','TRANSGOURMET','EPISAVEUR','EPISSAVEUR','FRAICA','UNION PRIMEURS','DUCEUX','METRO','BRAKE','PROMOCASH','BOUCHERIE','POISSONNERIE','PRIMEUR','CREMERIE','BOULANGERIE','ALIMENTAIRE']},
];

// Fournisseurs connus, utilisés pour repérer un nom dans le texte OCR.
const KNOWN_SUPPLIERS=['SYSCO','POMONA','GINEYS','TRANSGOURMET','EPISAVEUR','FRAICA','UNION PRIMEURS','DUCEUX','MICAND','FRANCE BOISSONS','PROMOCASH','CARREFOUR','EDF','ENGIE','ORANGE','SFR','BOUYGUES','FREE','VEOLIA','APAVE','SOCOTEC'];



function suggestAccountCodeDetailed(text){
  const t=normalizeText(text);
  if(!t.trim())return null;
  for(let i=0;i<ACCOUNT_KEYWORDS.length;i++){
    const rule=ACCOUNT_KEYWORDS[i];
    for(let j=0;j<rule.words.length;j++){
      const w=normalizeText(rule.words[j]);
      if(t.indexOf(w)>=0)return{code:rule.code,keyword:rule.words[j].trim()};
    }
  }
  return null;
}

function suggestAccountCode(text){
  const r=suggestAccountCodeDetailed(text);
  return r?r.code:null;
}

function extractAmountFromText(text){
  if(!text)return null;
  const t=String(text).replace(/\u00A0/g,' ');
  const patterns=[
    /TOTAL\s*(?:A\s*PAYER|TTC|G[EÉ]N[EÉ]RAL)?\s*[:\s]*([0-9]{1,5}[.,][0-9]{2})\s*(?:€|EUR)?/i,
    /MONTANT\s*(?:TTC)?\s*[:\s]*([0-9]{1,5}[.,][0-9]{2})/i,
  ];
  for(let i=0;i<patterns.length;i++){
    const m=t.match(patterns[i]);
    if(m){
      const v=parseFloat(m[1].replace(',','.'));
      if(!isNaN(v))return v;
    }
  }
  const all=[...t.matchAll(/([0-9]{1,5}[.,][0-9]{2})/g)];
  if(all.length){
    const v=parseFloat(all[all.length-1][1].replace(',','.'));
    if(!isNaN(v))return v;
  }
  return null;
}

function extractKnownSupplier(text){
  const t=normalizeText(text);
  for(let i=0;i<KNOWN_SUPPLIERS.length;i++){
    if(t.indexOf(normalizeText(KNOWN_SUPPLIERS[i]))>=0)return KNOWN_SUPPLIERS[i];
  }
  return null;
}

function applyAutoSuggestion(text,origin){
  const sugEl=document.getElementById('pieces-suggestion');
  const result=suggestAccountCodeDetailed(text);
  if(!result){
    if(sugEl){sugEl.className='pieces-suggestion';sugEl.textContent='';}
    return null;
  }
  const sel=document.getElementById('piece-code');
  if(sel)sel.value=result.code;
  if(sugEl){
    sugEl.className='pieces-suggestion ok';
    sugEl.textContent='🤖 Imputation suggérée automatiquement ('+origin+', détecté « '+result.keyword+' ») → '+accountLabel(result.code);
  }
  return result.code;
}

function markManualCode(){
  const sugEl=document.getElementById('pieces-suggestion');
  if(sugEl){sugEl.className='pieces-suggestion';sugEl.textContent='✓ Imputation modifiée manuellement.';}
}

let __fournisseurDebounce=null;
function handleFournisseurInput(){
  if(__fournisseurDebounce)clearTimeout(__fournisseurDebounce);
  __fournisseurDebounce=setTimeout(function(){
    const val=(document.getElementById('piece-fournisseur')||{value:''}).value;
    if(val&&val.trim())applyAutoSuggestion(val,'fournisseur saisi');
  },250);
}

// ── OCR (Tesseract.js, best-effort) ────────────────────────
let __lastImage=null,__lastW=0,__lastH=0;

function redrawCanvas(){
  const canvas=document.getElementById('pieces-canvas');
  const ctx=canvas&&canvas.getContext&&canvas.getContext('2d');
  if(!ctx||!__lastImage)return false;
  ctx.clearRect(0,0,__lastW,__lastH);
  ctx.drawImage(__lastImage,0,0,__lastW,__lastH);
  currentPiece=collectPieceMeta();
  drawStamp(ctx,buildStampLines(currentPiece),__lastW,__lastH);
  return true;
}

function runOCR(dataUrl){
  const sugEl=document.getElementById('pieces-suggestion');
  if(typeof Tesseract==='undefined'||typeof Tesseract.recognize!=='function')return;
  if(sugEl&&!sugEl.textContent){
    sugEl.className='pieces-suggestion busy';
    sugEl.textContent='🔎 Analyse automatique du document en cours… (peut prendre quelques secondes)';
  }
  try{
    Tesseract.recognize(dataUrl,'fra').then(function(result){
      const text=(result&&result.data&&result.data.text)||'';
      handleOcrResult(text);
    }).catch(function(){
      if(sugEl&&sugEl.className.indexOf('busy')>=0){sugEl.className='pieces-suggestion';sugEl.textContent='';}
    });
  }catch(e){
    if(sugEl&&sugEl.className.indexOf('busy')>=0){sugEl.className='pieces-suggestion';sugEl.textContent='';}
  }
}

function handleOcrResult(text){
  const fournEl=document.getElementById('piece-fournisseur');
  const montEl=document.getElementById('piece-montant');
  if(fournEl&&!fournEl.value.trim()){
    const found=extractKnownSupplier(text);
    if(found)fournEl.value=found;
  }
  if(montEl&&!montEl.value){
    const amt=extractAmountFromText(text);
    if(amt!==null)montEl.value=amt.toFixed(2);
  }
  const sourceForSuggestion=(fournEl&&fournEl.value.trim())?fournEl.value:text;
  applyAutoSuggestion(sourceForSuggestion,'document scanné');
  redrawCanvas();
}

function handlePhotoFile(input){
  const fb=document.getElementById('pieces-feedback');
  fb.className='voice-feedback';
  const file=input.files&&input.files[0];
  if(!file)return;
  if(!file.type||file.type.indexOf('image/')!==0){
    fb.className='voice-feedback err';
    fb.textContent='❌ Veuillez sélectionner une image (photo ou scan).';
    input.value='';
    return;
  }
  const reader=new FileReader();
  reader.onload=function(e){
    const img=new Image();
    img.onload=function(){
      try{
        const canvas=document.getElementById('pieces-canvas');
        const ctx=canvas&&canvas.getContext&&canvas.getContext('2d');
        const MAXW=1600;
        let w=img.width||MAXW,h=img.height||Math.round(MAXW*0.75);
        if(w>MAXW){h=Math.round(h*MAXW/w);w=MAXW;}
        __lastImage=img;__lastW=w;__lastH=h;
        // Suggestion immédiate si un fournisseur est déjà renseigné, AVANT le premier tampon
        const fournVal=(document.getElementById('piece-fournisseur')||{value:''}).value;
        if(fournVal&&fournVal.trim())applyAutoSuggestion(fournVal,'fournisseur saisi');
        if(!ctx){
          currentPiece=collectPieceMeta();
          document.getElementById('pieces-actions').style.display='flex';
          fb.className='voice-feedback err';
          fb.textContent='❌ Aperçu indisponible sur ce navigateur (canvas non supporté). Vous pouvez tout de même ajouter la ligne au registre.';
        }else{
          canvas.width=w;canvas.height=h;
          redrawCanvas();
          document.getElementById('pieces-canvas-wrap').classList.add('show');
          document.getElementById('pieces-actions').style.display='flex';
          fb.className='voice-feedback ok';
          fb.textContent='✓ Photo chargée et annotée. Vous pouvez la télécharger ou préparer l\'email.';
        }
        // Analyse automatique du document (OCR, best-effort)
        runOCR(e.target.result);
      }catch(err){
        fb.className='voice-feedback err';
        fb.textContent='❌ Erreur lors du traitement de l\'image.';
      }
    };
    img.onerror=function(){
      fb.className='voice-feedback err';
      fb.textContent='❌ Impossible de lire cette image.';
    };
    img.src=e.target.result;
  };
  reader.onerror=function(){
    fb.className='voice-feedback err';
    fb.textContent='❌ Erreur de lecture du fichier.';
  };
  reader.readAsDataURL(file);
}

function downloadAnnotated(){
  const fb=document.getElementById('pieces-feedback');
  if(!currentPiece){fb.className='voice-feedback err';fb.textContent='❌ Prenez d\'abord une photo.';return;}
  const canvas=document.getElementById('pieces-canvas');
  const filename=pieceFilename(currentPiece);
  if(!canvas||!canvas.toBlob){
    fb.className='voice-feedback err';
    fb.textContent='❌ Téléchargement de l\'image indisponible sur ce navigateur.';
    return;
  }
  canvas.toBlob(function(blob){
    if(!blob){fb.className='voice-feedback err';fb.textContent='❌ Export de l\'image impossible.';return;}
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=filename;a.click();
    URL.revokeObjectURL(url);
    fb.className='voice-feedback ok';
    fb.textContent='✓ Image téléchargée : '+filename;
  },'image/png');
}

function buildMailSubject(meta){
  return 'Pièce comptable '+meta.code+' - '+meta.label+' - '+meta.dateStr.split(' à ')[0];
}

function buildMailBody(meta){
  const lines=[];
  lines.push('Bonjour,');
  lines.push('');
  lines.push('Veuillez trouver ci-joint une pièce comptable pour '+RESTAURANT_NAME+'.');
  lines.push('');
  lines.push('Imputation : '+meta.code+' — '+meta.label);
  if(meta.montant!==null&&meta.montant!==undefined){
    lines.push('Montant TTC : '+meta.montant.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €');
  }
  if(meta.fournisseur){
    lines.push('Fournisseur / Référence : '+meta.fournisseur);
  }
  lines.push('Date : '+meta.dateStr);
  lines.push('');
  lines.push('⚠️ Merci de joindre le fichier téléchargé : '+pieceFilename(meta));
  lines.push('');
  lines.push('Cordialement');
  return lines.join('\n');
}

function buildMailtoUrl(meta,toEmail){
  const subject=encodeURIComponent(buildMailSubject(meta));
  const body=encodeURIComponent(buildMailBody(meta));
  const to=toEmail?encodeURIComponent(toEmail):'';
  return 'mailto:'+to+'?subject='+subject+'&body='+body;
}

function prepareEmail(){
  const fb=document.getElementById('pieces-feedback');
  if(!currentPiece){fb.className='voice-feedback err';fb.textContent='❌ Prenez d\'abord une photo.';return;}
  downloadAnnotated();
  const toEmail=loadAccountantEmail();
  const url=buildMailtoUrl(currentPiece,toEmail);
  try{
    const a=document.createElement('a');
    a.href=url;
    a.click();
  }catch(e){}
  fb.className='voice-feedback ok';
  fb.textContent='✓ Image téléchargée — brouillon email ouvert. N\'oubliez pas de joindre le fichier '+pieceFilename(currentPiece)+'.';
}

function saveAccountantEmail(val){
  try{localStorage.setItem(COMPTABLE_KEY,val||'');}catch(e){}
}
function loadAccountantEmail(){
  try{return localStorage.getItem(COMPTABLE_KEY)||'';}catch(e){return '';}
}

function loadPieces(){
  try{
    const raw=localStorage.getItem(PIECES_KEY);
    PIECES=raw?JSON.parse(raw):[];
    if(!Array.isArray(PIECES))PIECES=[];
  }catch(e){PIECES=[];}
}
function savePieces(){
  try{localStorage.setItem(PIECES_KEY,JSON.stringify(PIECES));}catch(e){}
}

function addToRegistre(){
  const fb=document.getElementById('pieces-feedback');
  if(!currentPiece){fb.className='voice-feedback err';fb.textContent='❌ Prenez d\'abord une photo.';return;}
  const entry=Object.assign({},currentPiece,{
    id:Date.now()+'-'+Math.random().toString(36).slice(2,7),
    filename:pieceFilename(currentPiece)
  });
  PIECES.unshift(entry);
  savePieces();
  renderPieces();
  fb.className='voice-feedback ok';
  fb.textContent='✓ Ajouté au registre : '+entry.code+' — '+entry.label+'.';
}

function removePiece(id){
  PIECES=PIECES.filter(p=>p.id!==id);
  savePieces();
  renderPieces();
}

function renderPieces(){
  const list=document.getElementById('pieces-list');
  const countEl=document.getElementById('pieces-count');
  const tabEl=document.getElementById('tab-pieces');
  if(countEl)countEl.textContent=PIECES.length?'('+PIECES.length+')':'';
  if(tabEl)tabEl.textContent='📎 Pièces'+(PIECES.length?' ('+PIECES.length+')':'');
  if(!list)return;
  if(!PIECES.length){
    list.innerHTML='<div class="empty-state" style="padding:1.5rem">Aucune pièce enregistrée</div>';
    return;
  }
  list.innerHTML='<div class="piece-list">'+PIECES.map(p=>{
    const d=new Date(p.dateISO);
    const dateStr=d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'});
    const montantStr=(p.montant!==null&&p.montant!==undefined)?p.montant.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €':'—';
    return`<div class="piece-row">
      <div class="piece-main">
        <div class="piece-title">${p.code} — ${p.label}</div>
        <div class="piece-sub">${dateStr}${p.fournisseur?' · '+p.fournisseur:''}</div>
      </div>
      <div class="piece-right">
        <span>${montantStr}</span>
        <button class="piece-del" onclick="removePiece('${p.id}')" title="Supprimer">🗑</button>
      </div>
    </div>`;
  }).join('')+'</div>';
}

function exportPiecesCSV(){
  const h=['Date','Code','Libellé','Montant TTC','Fournisseur / Référence'];
  const rows=PIECES.map(p=>{
    const d=new Date(p.dateISO);
    return[d.toLocaleDateString('fr-FR'),p.code,p.label,p.montant!==null&&p.montant!==undefined?p.montant.toFixed(2):'',p.fournisseur||''];
  });
  const csv=[h,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));
  a.download='registre_comptable_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
}


// ── EXPORT EXCEL ───────────────────────────────────────────
function exportExcel(){
  if(typeof XLSX==='undefined'){
    alert('La bibliothèque Excel (SheetJS) n\'est pas encore chargée. Vérifiez votre connexion internet et réessayez.');
    return;
  }

  const now=new Date();
  const dateStr=now.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  const stamp=now.toISOString().slice(0,10);
  const BEV_ZONES=['BOISSONS','CAFETERIE'];
  const wb=XLSX.utils.book_new();

  // ── Helpers styles ──
  const C={
    HD:'FF1A3A5C', HM:'FF2E6DAF', HZ:'FF0E5A8A',
    ALT:'FFF0F6FF', WHITE:'FFFFFFFF', DARK:'FF1A1A18',
    GREY:'FF6B6B68', BLUE:'FF0C447C', AMBER:'FF633806',
    GREEN:'FF27500A', RED:'FFCC0000', TOT:'FF1A3A5C',
    BEV:'FFFFF3E0', NOU:'FFF1F8E9',
    zBg:{'FRIGO 1':'FFE6F1FB','FRIGO 2':'FFDCE8F7','CONGELATEUR':'FFEEEDFE',
         'BOISSONS':'FFFAEEDA','CAFETERIE':'FFFDF4E4','ECONOMAT':'FFEAF3DE',
         'BOF':'FFFBEAF0','FRAIS BCP':'FFE1F5EE','AUTRE':'FFF1EFE8'},
    zHd:{'FRIGO 1':'FF1A5FA5','FRIGO 2':'FF185FA5','CONGELATEUR':'FF5A52B5',
         'BOISSONS':'FF8A5200','CAFETERIE':'FFAA7000','ECONOMAT':'FF3E6A0A',
         'BOF':'FF8E2050','FRAIS BCP':'FF1D7A58','AUTRE':'FF555450'},
    zAlt:{'FRIGO 1':'FFE6F1FB','FRIGO 2':'FFDCE8F7','CONGELATEUR':'FFEEEDFE',
          'BOISSONS':'FFFAEEDA','CAFETERIE':'FFFDF4E4','ECONOMAT':'FFEAF3DE',
          'BOF':'FFFBEAF0','FRAIS BCP':'FFE1F5EE','AUTRE':'FFF1EFE8'},
  };

  function fl(argb){return{type:'pattern',pattern:'solid',fgColor:{argb}};}
  function bd(s){s=s||'thin';const e={style:s,color:{argb:'FFBBBBBB'}};return{top:e,bottom:e,left:e,right:e};}
  function bdD(){const e={style:'medium',color:{argb:'FF777777'}};return{top:e,bottom:e,left:e,right:e};}
  function al(h,v){return{horizontal:h||'left',vertical:v||'center',wrapText:false};}

  function setS(ws,addr,s){
    if(!ws[addr]){ws[addr]={t:'z',v:''};}
    ws[addr].s=s;
  }

  function styleHdr(ws,row,ncols,bg,fg){
    for(let c=0;c<ncols;c++){
      const a=XLSX.utils.encode_cell({r:row,c});
      if(!ws[a])ws[a]={t:'z',v:''};
      ws[a].s={font:{bold:true,color:{argb:fg||C.WHITE},sz:10,name:'Arial'},
               fill:fl(bg||C.HD),border:bdD(),alignment:al('center','center')};
    }
  }

  function styleRow(ws,row,ncols,bg,opts){
    opts=opts||{};
    for(let c=0;c<ncols;c++){
      const a=XLSX.utils.encode_cell({r:row,c});
      if(!ws[a])ws[a]={t:'z',v:''};
      const isN=typeof ws[a].v==='number';
      ws[a].s={font:{bold:!!opts.bold,color:{argb:opts.fg||C.DARK},sz:10,name:'Arial'},
               fill:fl(bg||C.WHITE),border:bd(),
               alignment:al(isN?'right':'left','center'),
               ...(isN&&!opts.noNum?{numFmt:'#,##0.00'}:{})};
    }
  }

  function titleRow(ws,addr,val,bg,fg,sz){
    ws[addr]={t:'s',v:val};
    ws[addr].s={font:{bold:true,color:{argb:fg||C.WHITE},sz:sz||13,name:'Arial'},
                fill:fl(bg||C.HD),alignment:{horizontal:'left',vertical:'center'}};
  }

  // ═══════════════════════════════════════════
  // FEUILLE 1 : Inventaire complet
  // ═══════════════════════════════════════════
  {
    const COLS=['Code','Produit','Zone','Catégorie','Unité','Prix HT (€)','Quantité','Montant HT (€)','Fournisseur','Statut'];
    const nc=COLS.length;
    const dataRows=DATA.map(d=>{
      const m=mont(d);
      return[d.code,d.produit||'',(ZONES[d.zone]||{label:d.zone}).label,d.cat||'',
             d.unite||'',d.prix!=null?d.prix:0,d.qte!=null?d.qte:'',
             m!=null?Math.round(m*100)/100:'',d.fournisseur||'',
             d.status==='new'?'Nouveau':d.status==='updated'?'Prix MAJ':d.status==='custom'?'Ajouté':''];
    });
    const gt=DATA.reduce((s,d)=>s+(mont(d)||0),0);
    const nMiss=DATA.filter(d=>d.qte==null||d.qte===undefined).length;
    const ws=XLSX.utils.aoa_to_sheet([
      ['INVENTAIRE HACCP — La Salle à Manger · Grenoble',...Array(nc-1).fill('')],
      ['Édition du '+dateStr,...Array(nc-1).fill('')],
      Array(nc).fill(''),
      COLS,
      ...dataRows,
      Array(nc).fill(''),
      ['TOTAL GÉNÉRAL','','','',' ',DATA.length,'',Math.round(gt*100)/100,'',''],
    ]);
    ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:nc-1}},{s:{r:1,c:0},e:{r:1,c:nc-1}}];
    titleRow(ws,'A1','INVENTAIRE HACCP — La Salle à Manger · Grenoble',C.HD,C.WHITE,14);
    ws['A2']={t:'s',v:'Édition du '+dateStr};
    ws['A2'].s={font:{italic:true,color:{argb:C.GREY},sz:9,name:'Arial'},fill:fl('FFEFF5FF')};
    styleHdr(ws,3,nc,C.HD,C.WHITE);
    dataRows.forEach((row,i)=>{
      const ri=4+i; const bg=i%2===0?C.WHITE:C.ALT;
      styleRow(ws,ri,nc,bg);
      const ma=XLSX.utils.encode_cell({r:ri,c:7});
      if(ws[ma]&&typeof ws[ma].v==='number'){ws[ma].s.font.bold=true;ws[ma].s.font.color={argb:C.BLUE};}
      const qa=XLSX.utils.encode_cell({r:ri,c:6});
      if(ws[qa]&&(ws[qa].v===''||ws[qa].v==null)){
        ws[qa].v='—';ws[qa].t='s';
        ws[qa].s={font:{color:{argb:C.RED},italic:true,sz:10,name:'Arial'},fill:fl(bg),border:bd(),alignment:al('center','center')};
      }
      const sa=XLSX.utils.encode_cell({r:ri,c:9});
      if(ws[sa]){
        if(ws[sa].v==='Nouveau')ws[sa].s.font.color={argb:C.GREEN};
        else if(ws[sa].v==='Prix MAJ')ws[sa].s.font.color={argb:C.AMBER};
        else if(ws[sa].v==='Ajouté')ws[sa].s.font.color={argb:'FF5A52B5'};
      }
    });
    const totR=4+dataRows.length+1;
    styleRow(ws,totR,nc,C.TOT,{bold:true,fg:C.WHITE,noNum:true});
    const tmA=XLSX.utils.encode_cell({r:totR,c:7});
    if(ws[tmA]){ws[tmA].s.numFmt='#,##0.00';ws[tmA].s.font={bold:true,color:{argb:C.WHITE},sz:10,name:'Arial'};}
    ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:3,c:0},e:{r:3+dataRows.length,c:nc-1}})};
    ws['!cols']=[{wch:8},{wch:36},{wch:12},{wch:14},{wch:8},{wch:12},{wch:10},{wch:14},{wch:16},{wch:10}];
    ws['!rows']=[{hpt:26},{hpt:14},{hpt:6},{hpt:20}];
    XLSX.utils.book_append_sheet(wb,ws,'Inventaire complet');
  }

  // ═══════════════════════════════════════════
  // FEUILLE 2 : Bilan zones & synthèse
  // ═══════════════════════════════════════════
  {
    const byZone={};
    const synth={boissons:{total:0,refs:0,manq:0},nourriture:{total:0,refs:0,manq:0}};
    DATA.forEach(d=>{
      if(!byZone[d.zone])byZone[d.zone]={total:0,refs:0,manq:0,saisies:0};
      const m=mont(d); const hasQ=d.qte!=null&&d.qte!==undefined;
      byZone[d.zone].total+=(m||0); byZone[d.zone].refs++;
      if(!hasQ)byZone[d.zone].manq++; else byZone[d.zone].saisies++;
      const key=BEV_ZONES.includes(d.zone)?'boissons':'nourriture';
      synth[key].total+=(m||0); synth[key].refs++; if(!hasQ)synth[key].manq++;
    });
    const gt=DATA.reduce((s,d)=>s+(mont(d)||0),0);
    const nMiss=DATA.filter(d=>d.qte==null||d.qte===undefined).length;
    const zEntries=Object.entries(byZone).sort((a,b)=>b[1].total-a[1].total);

    // Construire le tableau ligne par ligne
    const aoa=[];
    aoa.push(['BILAN PAR ZONE — La Salle à Manger · Grenoble','','','','']);   // 0
    aoa.push(['Édition du '+dateStr,'','','','']);                               // 1
    aoa.push(['','','','','']);                                                  // 2
    aoa.push(['PAR ZONE DE STOCKAGE','','','','']);                             // 3
    aoa.push(['Zone','Libellé HACCP','Références','Sans quantité','Valeur HT (€)']); // 4
    zEntries.forEach(([z,v])=>{
      aoa.push([z,(ZONES[z]||{htext:'Divers'}).htext,v.refs,v.manq,Math.round(v.total*100)/100]);
    });
    const totZoneRow=aoa.length;
    aoa.push(['TOTAL GÉNÉRAL','',DATA.length,nMiss,Math.round(gt*100)/100]);
    aoa.push(['','','','','']);
    const synthHdrRow=aoa.length;
    aoa.push(['SYNTHÈSE BOISSONS / NOURRITURE','','','','']);
    aoa.push(['Catégorie','','Références','Sans quantité','Valeur HT (€)']);
    aoa.push(['🥤 Boissons & Caféterie','',synth.boissons.refs,synth.boissons.manq,Math.round(synth.boissons.total*100)/100]);
    aoa.push(['🍴 Nourriture (frais + surgelés + sec)','',synth.nourriture.refs,synth.nourriture.manq,Math.round(synth.nourriture.total*100)/100]);
    aoa.push(['TOTAL','',DATA.length,nMiss,Math.round(gt*100)/100]);

    const ws=XLSX.utils.aoa_to_sheet(aoa);
    const nc=5;
    ws['!merges']=[
      {s:{r:0,c:0},e:{r:0,c:nc-1}},{s:{r:1,c:0},e:{r:1,c:nc-1}},
      {s:{r:3,c:0},e:{r:3,c:nc-1}},{s:{r:synthHdrRow,c:0},e:{r:synthHdrRow,c:nc-1}},
    ];

    titleRow(ws,'A1','BILAN PAR ZONE — La Salle à Manger · Grenoble',C.HD,C.WHITE,14);
    ws['A2']={t:'s',v:'Édition du '+dateStr};
    ws['A2'].s={font:{italic:true,color:{argb:C.GREY},sz:9,name:'Arial'},fill:fl('FFEFF5FF')};

    // Section zones
    const secZA=XLSX.utils.encode_cell({r:3,c:0});
    ws[secZA].s={font:{bold:true,color:{argb:C.WHITE},sz:11,name:'Arial'},fill:fl(C.HM),alignment:al('left','center')};
    for(let c=1;c<nc;c++){const a=XLSX.utils.encode_cell({r:3,c});if(!ws[a])ws[a]={t:'z',v:''};ws[a].s={fill:fl(C.HM),border:bd()};}
    styleHdr(ws,4,nc,C.HZ,C.WHITE);

    zEntries.forEach(([z,v],i)=>{
      const ri=5+i; const bg=C.zBg[z]||C.ALT;
      styleRow(ws,ri,nc,bg);
      const ma=XLSX.utils.encode_cell({r:ri,c:4});
      if(ws[ma]&&typeof ws[ma].v==='number'){ws[ma].s.font.bold=true;ws[ma].s.font.color={argb:C.zHd[z]||C.BLUE};}
    });
    styleRow(ws,totZoneRow,nc,C.TOT,{bold:true,fg:C.WHITE});
    const tA=XLSX.utils.encode_cell({r:totZoneRow,c:4});
    if(ws[tA])ws[tA].s.numFmt='#,##0.00';

    // Section synthèse
    const shA=XLSX.utils.encode_cell({r:synthHdrRow,c:0});
    ws[shA].s={font:{bold:true,color:{argb:C.WHITE},sz:11,name:'Arial'},fill:fl(C.HM),alignment:al('left','center')};
    for(let c=1;c<nc;c++){const a=XLSX.utils.encode_cell({r:synthHdrRow,c});if(!ws[a])ws[a]={t:'z',v:''};ws[a].s={fill:fl(C.HM)};}
    styleHdr(ws,synthHdrRow+1,nc,C.HZ,C.WHITE);
    styleRow(ws,synthHdrRow+2,nc,C.BEV);
    const bA=XLSX.utils.encode_cell({r:synthHdrRow+2,c:4});
    if(ws[bA]){ws[bA].s.font.bold=true;ws[bA].s.font.color={argb:C.AMBER};ws[bA].s.numFmt='#,##0.00';}
    styleRow(ws,synthHdrRow+3,nc,C.NOU);
    const nA=XLSX.utils.encode_cell({r:synthHdrRow+3,c:4});
    if(ws[nA]){ws[nA].s.font.bold=true;ws[nA].s.font.color={argb:C.GREEN};ws[nA].s.numFmt='#,##0.00';}
    styleRow(ws,synthHdrRow+4,nc,C.TOT,{bold:true,fg:C.WHITE});
    const gtA=XLSX.utils.encode_cell({r:synthHdrRow+4,c:4});
    if(ws[gtA])ws[gtA].s.numFmt='#,##0.00';

    ws['!cols']=[{wch:30},{wch:16},{wch:14},{wch:16},{wch:16}];
    ws['!rows']=[{hpt:26},{hpt:14},{hpt:6},{hpt:20},{hpt:18}];
    XLSX.utils.book_append_sheet(wb,ws,'Bilan zones');
  }

  // ═══════════════════════════════════════════
  // FEUILLES 3+ : Une par zone
  // ═══════════════════════════════════════════
  Object.keys(ZONES).forEach(zone=>{
    const items=DATA.filter(d=>d.zone===zone);
    if(!items.length)return;
    const zInfo=ZONES[zone];
    const hd=C.zHd[zone]||C.HD;
    const alt=C.zAlt[zone]||C.ALT;
    const zTotal=items.reduce((s,d)=>s+(mont(d)||0),0);
    const saisies=items.filter(d=>d.qte!=null&&d.qte!==undefined).length;
    const COLS=['Code','Produit / Désignation','Unité','Prix HT (€)','Quantité','Montant HT (€)','Fournisseur','Statut'];
    const nc=COLS.length;
    const dataRows=items.map(d=>{
      const m=mont(d);
      return[d.code,d.produit||'',d.unite||'',d.prix!=null?d.prix:0,
             d.qte!=null?d.qte:'',m!=null?Math.round(m*100)/100:'',
             d.fournisseur||'',d.status==='new'?'Nouveau':d.status==='updated'?'Prix MAJ':d.status==='custom'?'Ajouté':''];
    });
    const aoa=[
      [zInfo.label.toUpperCase()+' — '+zInfo.htext,...Array(nc-1).fill('')],
      ['La Salle à Manger · Grenoble — '+dateStr,...Array(nc-1).fill('')],
      [saisies+' / '+items.length+' références saisies',...Array(nc-1).fill('')],
      Array(nc).fill(''),
      COLS,
      ...dataRows,
      Array(nc).fill(''),
      ['TOTAL ZONE','','','','',Math.round(zTotal*100)/100,'',''],
    ];
    const ws=XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges']=[
      {s:{r:0,c:0},e:{r:0,c:nc-1}},
      {s:{r:1,c:0},e:{r:1,c:nc-1}},
      {s:{r:2,c:0},e:{r:2,c:nc-1}},
    ];
    titleRow(ws,'A1',zInfo.label.toUpperCase()+' — '+zInfo.htext,hd,C.WHITE,13);
    ws['A2']={t:'s',v:'La Salle à Manger · Grenoble — '+dateStr};
    ws['A2'].s={font:{italic:true,color:{argb:C.GREY},sz:9,name:'Arial'},fill:fl('FFEFF5FF')};
    ws['A3']={t:'s',v:saisies+' / '+items.length+' références saisies'};
    ws['A3'].s={font:{bold:true,color:{argb:hd},sz:10,name:'Arial'},fill:fl(alt)};
    styleHdr(ws,4,nc,hd,C.WHITE);
    dataRows.forEach((row,i)=>{
      const ri=5+i; const bg=i%2===0?C.WHITE:alt;
      styleRow(ws,ri,nc,bg);
      const ma=XLSX.utils.encode_cell({r:ri,c:5});
      if(ws[ma]&&typeof ws[ma].v==='number'){ws[ma].s.font.bold=true;ws[ma].s.font.color={argb:hd};}
      const qa=XLSX.utils.encode_cell({r:ri,c:4});
      if(ws[qa]&&(ws[qa].v===''||ws[qa].v==null)){
        ws[qa].v='—';ws[qa].t='s';
        ws[qa].s={font:{color:{argb:C.RED},italic:true,sz:10,name:'Arial'},fill:fl(bg),border:bd(),alignment:al('center','center')};
      }
    });
    const totR=5+dataRows.length+1;
    styleRow(ws,totR,nc,hd,{bold:true,fg:C.WHITE});
    const tmA=XLSX.utils.encode_cell({r:totR,c:5});
    if(ws[tmA]){ws[tmA].s.numFmt='#,##0.00';ws[tmA].s.font={bold:true,color:{argb:C.WHITE},sz:10,name:'Arial'};}
    ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:4,c:0},e:{r:4+dataRows.length,c:nc-1}})};
    ws['!cols']=[{wch:8},{wch:36},{wch:8},{wch:12},{wch:10},{wch:14},{wch:18},{wch:10}];
    ws['!rows']=[{hpt:22},{hpt:14},{hpt:14},{hpt:6},{hpt:18}];
    const sn=zInfo.label.replace(/[:\\/\[\]*?]/g,'').slice(0,28);
    XLSX.utils.book_append_sheet(wb,ws,sn);
  });

  // ═══════════════════════════════════════════
  // FEUILLE Factures
  // ═══════════════════════════════════════════
  {
    const COLS=['Fournisseur','N° Facture','Date','Désignation','Qté','Unité','Prix unit. HT','Montant HT (€)'];
    const nc=COLS.length;
    const aoa=[
      ['FACTURES '+new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'}).toUpperCase()+' — La Salle à Manger · Grenoble',...Array(nc-1).fill('')],
      ['Édition du '+dateStr,...Array(nc-1).fill('')],
      Array(nc).fill(''),
      COLS,
    ];
    const rowMeta=[];// stocke {type:'data'|'sub'|'space',ri}
    let rowIdx=4;
    let dataCount=0;
    INVOICES.forEach(inv=>{
      inv.items.forEach(it=>{
        aoa.push([inv.fournisseur,inv.id,inv.date,it.p,it.q,it.u,it.px,Math.round(it.q*it.px*100)/100]);
        rowMeta.push({type:'data',ri:rowIdx}); rowIdx++; dataCount++;
      });
      aoa.push(['SOUS-TOTAL '+inv.fournisseur,...Array(nc-2).fill(''),Math.round(inv.total*100)/100]);
      rowMeta.push({type:'sub',ri:rowIdx}); rowIdx++;
      aoa.push(Array(nc).fill(''));
      rowMeta.push({type:'space',ri:rowIdx}); rowIdx++;
    });
    const gtInv=INVOICES.reduce((s,i)=>s+i.total,0);
    aoa.push(['TOTAL GÉNÉRAL FACTURES',...Array(nc-2).fill(''),Math.round(gtInv*100)/100]);
    const gtRow=rowIdx;

    const ws=XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:nc-1}},{s:{r:1,c:0},e:{r:1,c:nc-1}}];
    titleRow(ws,'A1','FACTURES '+new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'}).toUpperCase()+' — La Salle à Manger · Grenoble',C.HD,C.WHITE,13);
    ws['A2']={t:'s',v:'Édition du '+dateStr};
    ws['A2'].s={font:{italic:true,color:{argb:C.GREY},sz:9,name:'Arial'},fill:fl('FFEFF5FF')};
    styleHdr(ws,3,nc,C.HD,C.WHITE);

    let dataLineLocal=0;
    rowMeta.forEach(m=>{
      if(m.type==='data'){
        const bg=dataLineLocal%2===0?C.WHITE:C.ALT;
        styleRow(ws,m.ri,nc,bg); dataLineLocal++;
      } else if(m.type==='sub'){
        styleRow(ws,m.ri,nc,'FFFFF8E1',{bold:true,fg:'FF7B4F00'});
        const sA=XLSX.utils.encode_cell({r:m.ri,c:nc-1});
        if(ws[sA]){ws[sA].s.numFmt='#,##0.00';ws[sA].s.font.bold=true;}
        dataLineLocal=0;
      }
    });
    styleRow(ws,gtRow,nc,C.TOT,{bold:true,fg:C.WHITE});
    const gA=XLSX.utils.encode_cell({r:gtRow,c:nc-1});
    if(ws[gA])ws[gA].s.numFmt='#,##0.00';

    ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:3,c:0},e:{r:3+dataCount,c:nc-1}})};
    ws['!cols']=[{wch:16},{wch:22},{wch:12},{wch:40},{wch:8},{wch:8},{wch:14},{wch:14}];
    ws['!rows']=[{hpt:22},{hpt:14},{hpt:6},{hpt:18}];
    XLSX.utils.book_append_sheet(wb,ws,'Factures '+new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'}));
  }

  // ── Export ──
  XLSX.writeFile(wb,'Inventaire_HACCP_SalleAManger_'+stamp+'.xlsx',{bookType:'xlsx',type:'binary',cellStyles:true});
}

// ── AJOUT / ÉDITION PRODUIT ────────────────────────────────
let _editCode=null; // null = mode ajout, sinon code du produit édité

const ZONE_TO_CAT={
  'FRIGO 1':'BOF','FRIGO 2':'Fruits et légumes',
  'CONGELATEUR':'Surgelés','BOISSONS':'Boissons',
  'CAFETERIE':'Cafeterie','ECONOMAT':'Economat','AUTRE':'Divers'
};

function apZoneChanged(){
  const z=document.getElementById('ap-zone').value;
  const catField=document.getElementById('ap-cat');
  if(z&&!catField.value)catField.value=ZONE_TO_CAT[z]||'';
}

function _genCode(){
  // Génère un code C### unique (C pour Custom)
  const existing=new Set(DATA.map(d=>d.code));
  let n=1;
  while(existing.has('C'+String(n).padStart(3,'0')))n++;
  return'C'+String(n).padStart(3,'0');
}

function _fillFournisseurList(){
  const dl=document.getElementById('ap-fourn-list');
  const fourns=[...new Set(DATA.map(d=>d.fournisseur).filter(Boolean))].sort();
  dl.innerHTML=fourns.map(f=>`<option value="${f}">`).join('');
}

function openAddProduct(){
  _editCode=null;
  document.getElementById('addprod-title').textContent='+ Nouveau produit';
  document.getElementById('ap-submit-btn').textContent='✓ Ajouter';
  document.getElementById('addprod-actions').style.display='flex';
  document.getElementById('ap-edit-actions').style.display='none';
  document.getElementById('addprod-feedback').className='addprod-feedback';
  // Réinitialiser les champs
  ['ap-nom','ap-prix','ap-unite','ap-qte','ap-fourn','ap-cat'].forEach(id=>{document.getElementById(id).value='';});
  document.getElementById('ap-zone').value='';
  document.getElementById('ap-seuil').value='';
  document.getElementById('ap-seuil-unit').textContent='';
  document.getElementById('ap-code-wrap').style.display='none';
  _fillFournisseurList();
  document.getElementById('addprod-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('ap-nom').focus(),200);
}

function openEditProduct(code){
  const item=DATA.find(d=>d.code===code);
  if(!item)return;
  _editCode=code;
  document.getElementById('addprod-title').textContent='✏️ Modifier le produit';
  document.getElementById('addprod-actions').style.display='none';
  document.getElementById('ap-edit-actions').style.display='flex';
  document.getElementById('addprod-feedback').className='addprod-feedback';
  // Remplir les champs
  document.getElementById('ap-nom').value=item.produit||'';
  document.getElementById('ap-zone').value=item.zone||'';
  document.getElementById('ap-cat').value=item.cat||'';
  document.getElementById('ap-prix').value=item.prix!=null?item.prix:'';
  document.getElementById('ap-unite').value=item.unite||'';
  document.getElementById('ap-qte').value=item.qte!=null?item.qte:'';
  document.getElementById('ap-fourn').value=item.fournisseur||'';
  document.getElementById('ap-code-wrap').style.display='block';
  document.getElementById('ap-code-preview').textContent='Code : '+code+(item.status==='custom'?' (produit ajouté)':'');
  _fillFournisseurList();
  document.getElementById('addprod-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('ap-nom').focus(),200);
}


// ── SCAN PHOTO ÉTIQUETTE ──
async function analyzeReceptionPhoto(input) {
  var file = input && input.files && input.files[0];
  if (!file) return;
  var status = document.getElementById('rec-photo-status');
  var preview = document.getElementById('rec-photo-preview');
  if (status) status.innerHTML = '<span style="color:var(--info-text)">⏳ Compression…</span>';

  try {
    // Compression maximale : 300px, qualité 30%
    var b64 = await new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
          var MAX = 300;
          var w = img.width, h = img.height;
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/jpeg', 0.3).split(',')[1]);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    if (preview) { preview.src = 'data:image/jpeg;base64,' + b64; preview.style.display = 'block'; }
    if (status) status.innerHTML = '<span style="color:var(--info-text)">⏳ Analyse IA…</span>';

    var response = await fetch('https://pbydidazdjqqihkolzgc.supabase.co/functions/v1/scan-etiquette', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64, mimeType: 'image/jpeg' })
    });

    if (!response.ok) throw new Error('Erreur ' + response.status);
    var info = await response.json();
    if (info.error) throw new Error(info.error);

    var filled = 0;
    if (info.produit) { var e1=document.getElementById('rec-produit'); if(e1){e1.value=info.produit;filled++;} }
    if (info.fournisseur) { var e2=document.getElementById('rec-fourn'); if(e2){e2.value=info.fournisseur;filled++;} }
    if (info.dlc) {
      var e3=document.getElementById('rec-dlc-date'); // nouveau module: rec-dlc-date
      if(!e3) e3=document.getElementById('rec-dlc'); // ancien module fallback
      if(e3 && e3.type==='date'){e3.value=info.dlc;filled++;if(typeof recCalcDlc==='function')recCalcDlc();}
    }
    if (info.temperature) {
      var e4=document.getElementById('rec-temp'); if(e4) e4.value=info.temperature;
      var t=parseFloat(info.temperature);
      var te=document.getElementById('rec-type-temp');
      if(te){
        if(t<=-18) te.value='-18';
        else if(t<=4) te.value='4';
        else if(t<=8) te.value='8';
        else te.value='na';
      }
      if(typeof checkReception==='function') checkReception();
      filled++;
    }
    var obs='';
    if(info.lot) obs+='Lot: '+info.lot+' ';
    if(info.poids) obs+='Poids: '+info.poids+' ';
    if(info.observations) obs+=info.observations;
    if(obs.trim()){ var e5=document.getElementById('rec-obs'); if(e5){e5.value=obs.trim();filled++;} }

    if(status) status.innerHTML='<span style="color:var(--success-text)">✅ '+filled+' champ(s) rempli(s)</span>';

  } catch(e) {
    console.error('[SCAN]', e);
    if(status) status.innerHTML='<span style="color:var(--pink-text)">⚠️ '+(e.message||'Erreur')+'</span>';
  }
  if(input) input.value='';
}


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



// ---------------------------------------------------------------------------
// Données de référence
// ---------------------------------------------------------------------------
const DEFAULT_CODES = [
  { code:"601100", libelle:"Nourriture (denrées alimentaires)", taux:5.5, compteTva:"445660" },
  { code:"601200", libelle:"Boissons", taux:20, compteTva:"445660" },
  { code:"601400", libelle:"Cafétéria (café, thé, consommables)", taux:5.5, compteTva:"445660" },
  { code:"602100", libelle:"Emballages et fournitures liées aux produits", taux:20, compteTva:"445660" },
  { code:"606300", libelle:"Produits d’entretien", taux:20, compteTva:"445660" },
  { code:"606400", libelle:"Fournitures administratives", taux:20, compteTva:"445660" },
  { code:"606800", libelle:"Autres achats (exploitation courante)", taux:20, compteTva:"445660" },
  { code:"607000", libelle:"Achats de marchandises (revente en l’état)", taux:10, compteTva:"445660" },
  { code:"611000", libelle:"Sous-traitance générale", taux:20, compteTva:"445660" },
  { code:"615000", libelle:"Entretien et réparations", taux:20, compteTva:"445660" },
  { code:"622600", libelle:"Honoraires (comptable, conseil)", taux:20, compteTva:"445660" },
  { code:"626000", libelle:"Frais postaux et télécommunications", taux:20, compteTva:"445660" },
];
const DEFAULT_SUPPLIERS = [
  { id:"sup-primeur", nom:"Union Primeurs (FUNI01)", code:"601100" },
  { id:"sup-sysco", nom:"Sysco", code:"601100" },
  { id:"sup-pomona", nom:"Pomona", code:"601100" },
  { id:"sup-boulanger", nom:"Boulangerie Le Pain et le Vin", code:"601100" },
];
const SEED_INVOICES = [
  { id:"seed-1", date:"2026-08-17", fournisseur:"Union Primeurs (FUNI01)", bl:"", ht:65.28, taux:0, code:"601100" },
  { id:"seed-2", date:"2026-08-24", fournisseur:"Union Primeurs (FUNI01)", bl:"", ht:73.87, taux:0, code:"601100" },
  { id:"seed-3", date:"2026-08-26", fournisseur:"Union Primeurs (FUNI01)", bl:"", ht:57.93, taux:0, code:"601100" },
  { id:"seed-4", date:"2026-08-31", fournisseur:"Union Primeurs (FUNI01)", bl:"", ht:42.26, taux:0, code:"601100" },
  { id:"seed-5", date:"2026-08-19", fournisseur:"Sysco", bl:"", ht:205.30, taux:0, code:"601100" },
  { id:"seed-6", date:"2026-08-24", fournisseur:"Sysco", bl:"", ht:195.85, taux:0, code:"601100" },
  { id:"seed-7", date:"2026-08-26", fournisseur:"Sysco", bl:"", ht:238.70, taux:0, code:"601100" },
  { id:"seed-8", date:"2026-08-19", fournisseur:"Pomona", bl:"", ht:228.46, taux:0, code:"601100" },
];
const TAUX_OPTIONS = [0, 5.5, 10, 20];
const PIE_COLORS = ["#7f1d2e","#b5763f","#5b7a5e","#8a8478","#a3623f","#4a6670","#9c8a5a","#6f4a5b"];

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
const CaApp = {
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
          <select id="${prefix}-fournisseur" onchange="App.onSupplierPick('${prefix}')">
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
          <select id="${prefix}-code" onchange="App.onCodePick('${prefix}')">
            ${this.codes.map(c=>`<option value="${esc(c.code)}" ${c.code===v.code?'selected':''}>${esc(c.code)} — ${esc(c.libelle)}</option>`).join("")}
          </select></label>
      </div>
      <div id="${prefix}-error" class="error-text" style="margin-bottom:10px;"></div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-primary" onclick="App.addInvoiceFromForm('${prefix}')">✓ ${initial?'Mettre à jour':'Enregistrer la facture'}</button>
        ${initial?`<button class="btn btn-ghost" onclick="App.cancelEdit()">Annuler</button>`:''}
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
          <button class="btn btn-ghost" onclick="App.saveApiKey()">Enregistrer</button>
        </div>
      </div>`;

    let body = "";
    if(!s.common && !s.loading){
      body = `<div class="card">
        <div style="font-size:14px;font-weight:600;margin-bottom:6px;">Scanner une facture</div>
        <div style="font-size:12.5px;color:#8a8478;margin-bottom:16px;">Prenez une photo ou importez un fichier (image ou PDF). Les montants seront extraits et ventilés automatiquement — vous pourrez les vérifier avant d’enregistrer.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <label class="btn btn-primary" style="cursor:pointer;">📷 Prendre une photo
            <input type="file" accept="image/*" capture="environment" onchange="App.onScanFile(this)" style="display:none;"></label>
          <label class="btn btn-ghost" style="cursor:pointer;">⬆ Importer un fichier
            <input type="file" accept="image/*,application/pdf" onchange="App.onScanFile(this)" style="display:none;"></label>
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
          <button class="btn btn-ghost" onclick="App.resetScan(); App.render();">↻ Scanner une autre facture</button>
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
                  <select id="scan-line-code-${l.id}" onchange="App.scanCodeChange('${l.id}', this.value)">
                    ${this.codes.map(c2=>`<option value="${esc(c2.code)}" ${c2.code===l.code?'selected':''}>${esc(c2.code)} — ${esc(c2.libelle)}</option>`).join("")}
                  </select>
                  <input type="number" step="0.01" min="0" id="scan-line-ht-${l.id}" value="${esc(l.ht)}" placeholder="HT">
                  <select class="taux" id="scan-line-taux-${l.id}">
                    ${TAUX_OPTIONS.map(t=>`<option value="${t}" ${t===l.taux?'selected':''}>${t}%</option>`).join("")}
                  </select>
                  <span class="muted" style="font-size:12.5px;min-width:90px;text-align:right;">TTC ${eur(c.ttc)}</span>
                  <button class="btn-icon" onclick="App.scanRemoveLine('${l.id}')">🗑</button>
                </div>`;
              }).join("")}
            </div>
            <button class="btn btn-ghost" style="margin-top:4px;" onclick="App.scanAddLine()">+ Ajouter une ligne</button>
            <div class="banner" style="display:flex;gap:24px;margin:14px 0;">
              <div>Total HT : <strong>${eur(totals.ht)}</strong></div>
              <div>Total TVA : <strong>${eur(totals.tva)}</strong></div>
              <div>Total TTC : <strong>${eur(totals.ttc)}</strong></div>
            </div>
            <div id="scan-error" class="error-text" style="margin-bottom:10px;"></div>
            <div style="display:flex;gap:10px;">
              <button class="btn btn-primary" onclick="App.submitScan()">✓ Enregistrer la ventilation</button>
              <button class="btn btn-ghost" onclick="App.resetScan(); App.render();">Annuler</button>
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
      <select style="width:auto;" onchange="App.setLedgerFilter(this.value)">
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
                  <button class="btn-icon" onclick="App.editInvoice('${inv.id}')">✎</button>
                  <button class="btn-icon" onclick="App.deleteInvoice('${inv.id}')">🗑</button>
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
                <td><select style="font-size:12.5px;padding:5px 8px;" onchange="App.updateSupplierCode('${s.id}', this.value)">
                  ${this.codes.map(c=>`<option value="${esc(c.code)}" ${c.code===s.code?'selected':''}>${esc(c.code)}</option>`).join("")}
                </select></td>
                <td class="num">${eur(total)}</td>
                <td style="text-align:right;"><button class="btn-icon" onclick="App.deleteSupplier('${s.id}')">🗑</button></td>
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
          <button class="btn btn-primary" onclick="App.addSupplier()">+ Ajouter</button>
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
              <td style="text-align:right;"><button class="btn-icon" onclick="App.deleteCode('${c.code}')">🗑</button></td>
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
          <button class="btn btn-primary" onclick="App.addCode()">+ Ajouter au plan</button>
        </div>
      </div>
    </div>`;
  },

  render(){
    const monthSelectHtml = (this.tab==='dashboard'||this.tab==='registre') ? `
      <div style="margin-bottom:18px;display:flex;gap:10px;align-items:center;">
        <span style="font-size:13px;color:#8a8478;font-weight:500;">Période :</span>
        <select style="width:auto;" onchange="App.setMonth(this.value)">
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
          <button class="btn btn-ghost" onclick="App.exportExcel()">⬇ Exporter en Excel</button>
        </div>
        <div class="tabs">
          ${tabs.map(t=>`<button class="tab-btn ${this.tab===t.id?'active':''}" onclick="App.setTab('${t.id}')">${t.label}</button>`).join("")}
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
    return `<div class="modal-overlay" onclick="if(event.target===this){App.cancelEdit();}">
      <div class="modal">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div style="font-size:14px;font-weight:600;">Modifier la facture</div>
          <button class="btn-icon" onclick="App.cancelEdit()">✕</button>
        </div>
        ${this.invoiceFormHtml('manual', inv)}
      </div>
    </div>`;
  },
};
window.CaApp = CaApp;
// CaApp sera initialisé au clic sur Factures


// ══ NAVIGATION TUILES ══








// Doublon mort de updateSyncDot (voir la définition ligne ~1644) retiré le 18/09/2026

// Démarrer sur l'écran d'accueil



// ══ NAVIGATION TUILES ══
function tileGoTo(name) {
  // 1. Masquer l'écran d'accueil
  var hs = document.getElementById('home-screen');
  if (hs) hs.style.display = 'none';
  
  // 2. Afficher le contenu de l'app
  var header = document.querySelector('.app-header');
  if (header) header.style.display = '';
  
  // 3. Naviguer vers le bon module
  var moreModules = ['reception-mp','factures','tracabilite','historique','prix','carte-allergenes','pieces'];
  if (moreModules.indexOf(name) >= 0) {
    switchTabMore(name, null);
  } else {
    switchTab(name, null);
  }
}

function showHomeScreen() {
  // Masquer tous les panneaux
  document.querySelectorAll('.panel').forEach(function(p) {
    p.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn, .tab-more-item').forEach(function(b) {
    b.classList.remove('active');
  });
  
  // Afficher l'écran d'accueil
  var hs = document.getElementById('home-screen');
  if (hs) hs.style.display = 'block';
  
  // Mettre à jour les stats
  try {
    var total = 0;
    DATA.forEach(function(d) { if(d.prix && d.qte) total += d.prix * d.qte; });
    var refs = DATA.length;
    var el = document.getElementById('hs-valeur');
    if (el) el.textContent = refs > 0 ? Math.round(total).toLocaleString('fr-FR') + ' €' : '—';
    var el2 = document.getElementById('hs-refs');
    if (el2) el2.textContent = refs || '—';
    var el3 = document.getElementById('hs-refs2');
    if (el3) el3.textContent = refs || '539';
    var el4 = document.getElementById('hs-valeur2');
    if (el4) el4.textContent = refs > 0 ? Math.round(total).toLocaleString('fr-FR') + ' € HT' : '— € HT';
  } catch(e) {}
}

// Bouton 🏠 dans le header
function goHomeScreen() {
  showHomeScreen();
  var hf = document.getElementById('btn-home-float');
  if(hf) hf.classList.remove('visible');
}


// ══ AUTHENTIFICATION SUPABASE AUTH ══
const SUPA_AUTH_URL = 'https://pbydidazdjqqihkolzgc.supabase.co/auth/v1';
// Même clé que SUPA_KEY utilisée pour les données — une seule clé pour tout
const SUPA_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRpZGF6ZGpxcWloa29semdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNDI4MDQsImV4cCI6MjEwMzYxODgwNH0.xrrlnV6-7gBwQyC3UMKsEd5wTDsyBhCjc7tZevIaQWE';
let currentSession = null;

async function doLogin() {
  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var btn = document.getElementById('login-btn');
  var errEl = document.getElementById('login-error');
  
  if (!email || !password) {
    showLoginError('Veuillez saisir votre email et mot de passe.');
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Connexion…';
  errEl.style.display = 'none';
  
  try {
    var resp = await fetch(SUPA_AUTH_URL + '/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_ANON_KEY
      },
      body: JSON.stringify({ email: email, password: password })
    });
    
    var data = await resp.json();
    
    if (!resp.ok || data.error) {
      showLoginError(data.error_description || data.message || 'Identifiants incorrects.');
      btn.disabled = false;
      btn.textContent = 'Se connecter';
      return;
    }
    
    // Succès — stocker la session
    currentSession = data;
    localStorage.setItem('haccp_session', JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000)
    }));
    
    // Masquer l'écran de connexion
    document.getElementById('login-screen').style.display = 'none';
    
    // Mettre à jour les headers Supabase avec le token
    updateSupabaseAuth(data.access_token);
    
    console.log('[AUTH] Connecté:', data.user?.email);
    
  } catch(e) {
    showLoginError('Erreur de connexion. Vérifiez votre connexion internet.');
    btn.disabled = false;
    btn.textContent = 'Se connecter';
  }
}

async function doMagicLink() {
  var email = document.getElementById('login-email').value.trim();
  if (!email) {
    showLoginError('Saisissez votre email pour recevoir un lien de connexion.');
    return;
  }
  
  var btn = event && event.target;
  try {
    // Endpoint correct Supabase Auth v2 : /otp avec type magiclink
    var resp = await fetch(SUPA_AUTH_URL + '/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPA_ANON_KEY },
      body: JSON.stringify({ email: email, create_user: false })
    });
    
    var errEl = document.getElementById('login-error');
    if (resp.ok || resp.status === 204) {
      errEl.style.display = 'block';
      errEl.style.background = '#eaf3de';
      errEl.style.color = '#27500a';
      errEl.textContent = '✅ Lien envoyé à ' + email + ' — vérifiez votre boîte mail (et les spams).';
    } else {
      var data = {};
      try { data = await resp.json(); } catch(e2) {}
      showLoginError('Échec envoi lien : ' + (data.msg || data.error_description || data.message || 'Erreur ' + resp.status) + '. Vérifiez que le compte existe.');
    }
  } catch(e) {
    showLoginError('Erreur réseau — impossible d\'envoyer le lien. Vérifiez votre connexion.');
  }
}


// ══ MON COMPTE ══
function openAccount() {
  var overlay = document.getElementById('account-overlay');
  var emailEl = document.getElementById('account-email-display');
  if (overlay) overlay.classList.add('open');
  // Afficher l'email de l'utilisateur connecté
  try {
    var id = getCurrentUserIdentifier();
    if (emailEl) emailEl.textContent = id !== DEVICE_ID ? '✉️ ' + id : 'Non connecté';
  } catch(e) {}
  // Reset les champs
  var p1 = document.getElementById('acc-pwd1');
  var p2 = document.getElementById('acc-pwd2');
  var msg = document.getElementById('acc-pwd-msg');
  if (p1) p1.value = '';
  if (p2) p2.value = '';
  if (msg) { msg.className = 'account-msg'; msg.textContent = ''; }
}

function closeAccount() {
  var overlay = document.getElementById('account-overlay');
  if (overlay) overlay.classList.remove('open');
}

function toggleAccPwd(inputId, btn) {
  var inp = document.getElementById(inputId);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

async function changePassword() {
  var pwd1 = document.getElementById('acc-pwd1').value;
  var pwd2 = document.getElementById('acc-pwd2').value;
  var btn = document.getElementById('acc-pwd-btn');
  var msg = document.getElementById('acc-pwd-msg');

  msg.className = 'account-msg';
  msg.textContent = '';

  if (!pwd1 || pwd1.length < 8) {
    msg.textContent = 'Le mot de passe doit contenir au moins 8 caractères.';
    msg.className = 'account-msg err'; return;
  }
  if (pwd1 !== pwd2) {
    msg.textContent = 'Les mots de passe ne correspondent pas.';
    msg.className = 'account-msg err'; return;
  }

  // Récupérer le token depuis la session
  var token = null;
  try {
    if (window.currentSession && window.currentSession.access_token) {
      token = window.currentSession.access_token;
    } else {
      var stored = JSON.parse(localStorage.getItem('haccp_session') || '{}');
      token = stored.access_token;
    }
  } catch(e) {}

  if (!token) {
    msg.textContent = 'Session expirée — reconnectez-vous d\'abord.';
    msg.className = 'account-msg err'; return;
  }

  btn.disabled = true;
  btn.textContent = 'Enregistrement…';

  try {
    var resp = await fetch(SUPA_AUTH_URL + '/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_ANON_KEY,
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ password: pwd1 })
    });

    var data = {};
    try { data = await resp.json(); } catch(e2) {}

    if (resp.ok) {
      msg.textContent = '✅ Mot de passe modifié avec succès !';
      msg.className = 'account-msg ok';
      document.getElementById('acc-pwd1').value = '';
      document.getElementById('acc-pwd2').value = '';
    } else {
      msg.textContent = 'Erreur : ' + (data.msg || data.message || data.error_description || 'Réessayez.');
      msg.className = 'account-msg err';
    }
  } catch(e) {
    msg.textContent = 'Erreur réseau — vérifiez votre connexion.';
    msg.className = 'account-msg err';
  }

  btn.disabled = false;
  btn.textContent = 'Enregistrer le mot de passe';
}

function toggleLoginPwd(btn) {
  var inp = document.getElementById('login-password');
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
    btn.title = 'Masquer';
  } else {
    inp.type = 'password';
    btn.textContent = '👁';
    btn.title = 'Afficher';
  }
}

function showLoginError(msg) {
  var el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = 'block';
  el.style.background = '#fbeaf0';
  el.style.color = '#72243e';
}

function updateSupabaseAuth(token) {
  // Mettre à jour le token dans les headers de toutes les requêtes Supabase
  window._supabaseAuthToken = token;
}

function getAuthHeaders() {
  var headers = {
    'apikey': SUPA_ANON_KEY,
    'Content-Type': 'application/json'
  };
  if (window._supabaseAuthToken) {
    headers['Authorization'] = 'Bearer ' + window._supabaseAuthToken;
  }
  return headers;
}

function checkExistingSession() {
  try {
    var stored = localStorage.getItem('haccp_session');
    if (!stored) return false;
    var session = JSON.parse(stored);
    
    // Vérifier si le token est encore valide (avec 5 min de marge)
    if (session.expires_at && Date.now() < session.expires_at - 300000) {
      currentSession = session;
      updateSupabaseAuth(session.access_token);
      document.getElementById('login-screen').style.display = 'none';
      return true;
    }
    // Token expiré — tenter de le renouveler
    if (session.refresh_token) {
      refreshSession(session.refresh_token);
      return true; // Optimiste — on masque l'écran pendant le refresh
    }
  } catch(e) {}
  return false;
}

async function refreshSession(refreshToken) {
  try {
    var resp = await fetch(SUPA_AUTH_URL + '/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPA_ANON_KEY },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    var data = await resp.json();
    if (resp.ok && data.access_token) {
      currentSession = data;
      localStorage.setItem('haccp_session', JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000)
      }));
      updateSupabaseAuth(data.access_token);
      document.getElementById('login-screen').style.display = 'none';
    } else {
      // Refresh échoué — afficher l'écran de connexion
      localStorage.removeItem('haccp_session');
      document.getElementById('login-screen').style.display = 'flex';
    }
  } catch(e) {
    document.getElementById('login-screen').style.display = 'flex';
  }
}

// ══ INSCRIPTION AVEC RESTRICTION DOMAINE ══
const ALLOWED_EMAIL_DOMAINS = ['lasalleamanger.fr', 'sp-conseil.fr', 'gmail.com'];

function showSignup() {
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('login-error').style.display = 'none';
}

function hideSignup() {
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('signup-email').value = '';
  document.getElementById('signup-password').value = '';
}

function isEmailAllowed(email) {
  var domain = email.split('@')[1];
  return ALLOWED_EMAIL_DOMAINS.indexOf(domain) >= 0;
}

async function doSignup() {
  var email = document.getElementById('signup-email').value.trim().toLowerCase();
  var password = document.getElementById('signup-password').value;
  var btn = document.getElementById('signup-btn');
  
  // Validation email
  if (!email || !email.includes('@')) {
    showLoginError('Veuillez saisir une adresse email valide.');
    return;
  }
  
  // Restriction domaine
  if (!isEmailAllowed(email)) {
    showLoginError('Inscription réservée aux adresses @lasalleamanger.fr ou @gmail.com.');
    return;
  }
  
  // Validation mot de passe
  if (!password || password.length < 8) {
    showLoginError('Le mot de passe doit contenir au moins 8 caractères.');
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Création du compte…';
  
  try {
    var resp = await fetch(SUPA_AUTH_URL + '/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_ANON_KEY
      },
      body: JSON.stringify({
        email: email,
        password: password,
        data: { app: 'haccp-lsm', created_via: 'app' }
      })
    });
    
    var data = await resp.json();
    
    if (!resp.ok || data.error) {
      showLoginError(data.msg || data.error_description || 'Erreur lors de la création du compte.');
      btn.disabled = false;
      btn.textContent = 'Créer mon compte';
      return;
    }
    
    // Succès — compte créé mais en attente de validation admin
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-error').style.background = '#eaf3de';
    document.getElementById('login-error').style.color = '#27500a';
    document.getElementById('login-error').textContent = 
      '✅ Compte créé ! Vérifiez votre email pour confirmer votre adresse, puis attendez la validation de l\'administrateur.';
    
    btn.disabled = false;
    btn.textContent = 'Créer mon compte';
    
    // Revenir au formulaire de connexion
    setTimeout(function() {
      hideSignup();
      document.getElementById('login-email').value = email;
    }, 3000);
    
  } catch(e) {
    showLoginError('Erreur réseau. Réessayez.');
    btn.disabled = false;
    btn.textContent = 'Créer mon compte';
  }
}

function doLogout() {
  localStorage.removeItem('haccp_session');
  currentSession = null;
  window._supabaseAuthToken = null;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

// Vérifier la session au démarrage
window.addEventListener('DOMContentLoaded', function() {
  if (!checkExistingSession()) {
    document.getElementById('login-screen').style.display = 'flex';
  }
});


// ── Normalisation unités ──
function normalizeUnite(str) {
  if (!str) return '';
  var s = str.trim().toUpperCase().replace(/\./g, '');
  var map = {
    'KG':'KG','KILO':'KG','KILOS':'KG','KILOGRAMME':'KG','KILOGRAMMES':'KG',
    'G':'G','GR':'G','GRS':'G','GRAMME':'G','GRAMMES':'G',
    'L':'L','LT':'L','LTR':'L','LITRE':'L','LITRES':'L','LTS':'L',
    'CL':'CL','ML':'ML',
    'PCE':'PCE','PCS':'PCE','PC':'PCE','PIECE':'PCE','PIECES':'PCE',
    'PIÈCE':'PCE','PIÈCES':'PCE','U':'PCE','UNIT':'PCE','UNITE':'PCE','UN':'PCE',
    'BTL':'BTL','BOUTEILLE':'BTL','BOUTEILLES':'BTL',
    'BTE':'BTE','BOITE':'BTE','BOÎTE':'BTE','BOITES':'BTE','BOÎTES':'BTE',
    'CTN':'CTN','CARTON':'CTN','CARTONS':'CTN','CAR':'CTN',
    'SAC':'SAC','SACS':'SAC','POT':'POT','POTS':'POT',
    'BDL':'BDL','BOTTE':'BDL','BOTTES':'BDL',
    'PORT':'PORT','PORTION':'PORT','PORTIONS':'PORT',
    'PLT':'PLT','PALETTE':'PLT','PALETTES':'PLT',
  };
  return map[s] || s;
}

// ── Normalisation fournisseur ──
function normalizeFournisseur(str) {
  if (!str) return '';
  // 1. Nettoyer les espaces
  str = str.trim();
  // 2. Tout en minuscules d'abord, PUIS capitaliser chaque mot
  str = str.toLowerCase().replace(/(?:^|\s)\S/g, function(c) { return c.toUpperCase(); });
  // 3. Corrections spécifiques (après normalisation)
  var map = {
    'Micand': 'Micand',
    'Pomona': 'Pomona',
    'Transgourmet': 'Transgourmet',
    'France Boissons': 'France Boissons',
    'Sysco': 'SYSCO',
    'Union Primeurs': 'Union Primeurs',
    'Promocash': 'Promocash',
    'Promocash ': 'Promocash',
  };
  return map[str] || str;
}


// ══ GESTION HORS-LIGNE ══
var _isOnline = navigator.onLine;
var _pendingSync = false;

function updateOnlineStatus() {
  var wasOffline = !_isOnline;
  _isOnline = navigator.onLine;
  var banner = document.getElementById('offline-banner');

  if (!_isOnline) {
    // Passage hors-ligne
    if (banner) banner.classList.add('show');
    var dot = document.getElementById('sync-dot');
    if (dot) { dot.style.background = '#f59e0b'; dot.title = 'Hors-ligne'; }
    _pendingSync = true;
  } else {
    // Retour en ligne
    if (banner) banner.classList.remove('show');
    if (_pendingSync) {
      _pendingSync = false;
      // Sync automatique dès la reconnexion
      setTimeout(function() {
        if (typeof initSync === 'function') initSync();
        showSyncToast('🔄 Reconnecté — synchronisation en cours…');
      }, 1000);
    }
  }
}

// Écouter les événements réseau
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// État initial
document.addEventListener('DOMContentLoaded', function() {
  updateOnlineStatus();
});

// Intercepter syncToCloud pour gérer le mode hors-ligne
var _originalSyncToCloud = null;
function patchSyncToCloud() {
  if (typeof syncToCloud !== 'function' || _originalSyncToCloud) return;
  _originalSyncToCloud = syncToCloud;
  syncToCloud = function(module, data) {
    if (!_isOnline) {
      // Hors-ligne : sauvegarder localement uniquement (déjà fait avant l'appel)
      _pendingSync = true;
      console.log('[OFFLINE] Sync différée pour:', module);
      return;
    }
    return _originalSyncToCloud(module, data);
  };
}

// Patcher après le chargement complet
window.addEventListener('load', function() {
  setTimeout(patchSyncToCloud, 2000);
});


// ══ MODULE MERCURIALE ══
let _mercMatches = []; // [{mercLine, dataProduct, checked}]

function openMercuriale() {
  document.getElementById('mercuriale-overlay').classList.add('open');
  mercReset();
}
function closeMercuriale() {
  document.getElementById('mercuriale-overlay').classList.remove('open');
}
function mercReset() {
  document.getElementById('merc-status').className = 'merc-status';
  document.getElementById('merc-status').textContent = '';
  document.getElementById('merc-results').classList.remove('show');
  document.getElementById('merc-file-input').value = '';
  _mercMatches = [];
}

// ── Drag & Drop ──
function mercHandleDrop(e) {
  e.preventDefault();
  document.getElementById('merc-drop').classList.remove('dragover');
  var file = e.dataTransfer.files[0];
  if (file) mercHandleFile(file);
}

// ── Point d'entrée principal ──
async function mercHandleFile(file) {
  if (!file) return;
  mercReset();
  var status = document.getElementById('merc-status');
  status.className = 'merc-status loading';
  status.textContent = '⏳ Lecture du fichier…';

  try {
    var ext = file.name.split('.').pop().toLowerCase();
    var lines = [];

    if (ext === 'xlsx' || ext === 'xls') {
      lines = await mercParseExcel(file);
    } else {
      // PDF ou image → Edge Function scan-mercuriale
      lines = await mercScanPDF(file);
    }

    if (!lines || lines.length === 0) {
      status.className = 'merc-status error';
      status.textContent = '❌ Aucune ligne produit trouvée dans ce fichier.';
      return;
    }

    status.textContent = '⏳ Rapprochement avec l\'inventaire (' + lines.length + ' lignes)…';

    // Rapprochement
    _mercMatches = mercMatch(lines);

    var matched = _mercMatches.filter(function(m) { return m.dataProduct; }).length;
    status.className = 'merc-status ok';
    status.textContent = '✅ ' + lines.length + ' lignes extraites — ' + matched + ' correspondances trouvées dans l\'inventaire.';

    mercRenderResults();
  } catch(e) {
    status.className = 'merc-status error';
    status.textContent = '❌ Erreur : ' + (e.message || e);
    console.error('[MERC]', e);
  }
}

// ── Parse Excel côté navigateur ──
async function mercParseExcel(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = new Uint8Array(e.target.result);
        var wb = XLSX.read(data, { type: 'array' });
        var ws = wb.Sheets[wb.SheetNames[0]];
        var rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        // Détecter les colonnes (désignation + prix)
        var lines = mercParseExcelRows(rows);
        resolve(lines);
      } catch(err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function mercParseExcelRows(rows) {
  if (!rows || rows.length < 2) return [];
  var lines = [];

  // Chercher la ligne d'en-tête
  var headerRow = -1;
  var colDesig = -1, colPrix = -1, colRef = -1, colUnite = -1;
  var prixKws = ['prix', 'tarif', 'pu', 'p.u', 'p/u', 'prix ht', 'tarif ht', 'montant'];
  var desigKws = ['designation', 'désignation', 'libelle', 'libellé', 'produit', 'article', 'description'];
  var refKws = ['ref', 'référence', 'code', 'art', 'ean'];
  var uniteKws = ['unite', 'unité', 'uc', 'cond', 'conditionnement'];

  for (var i = 0; i < Math.min(10, rows.length); i++) {
    var row = rows[i].map(function(c) { return String(c).toLowerCase().trim(); });
    var foundPrix = row.findIndex(function(c) { return prixKws.some(function(k) { return c.includes(k); }); });
    var foundDesig = row.findIndex(function(c) { return desigKws.some(function(k) { return c.includes(k); }); });
    if (foundPrix >= 0 && foundDesig >= 0) {
      headerRow = i;
      colDesig = foundDesig;
      colPrix = foundPrix;
      colRef = row.findIndex(function(c) { return refKws.some(function(k) { return c.includes(k); }); });
      colUnite = row.findIndex(function(c) { return uniteKws.some(function(k) { return c.includes(k); }); });
      break;
    }
  }

  // Si pas d'en-tête trouvé, heuristique : col 0 = désig, chercher col numérique
  var startRow = headerRow >= 0 ? headerRow + 1 : 1;
  if (headerRow < 0) {
    colDesig = 0;
    // Trouver la première colonne avec des valeurs numériques
    for (var c = 1; c < (rows[1] || []).length; c++) {
      var val = parseFloat(String(rows[startRow][c]).replace(',', '.'));
      if (!isNaN(val) && val > 0) { colPrix = c; break; }
    }
  }

  if (colDesig < 0 || colPrix < 0) return [];

  for (var r = startRow; r < rows.length; r++) {
    var row2 = rows[r];
    var desig = String(row2[colDesig] || '').trim();
    var prixRaw = String(row2[colPrix] || '').replace(',', '.').replace(/[^0-9.]/g, '');
    var prix = parseFloat(prixRaw);
    if (!desig || isNaN(prix) || prix <= 0) continue;
    lines.push({
      designation: desig,
      reference: colRef >= 0 ? String(row2[colRef] || '').trim() : '',
      prix_ht: prix,
      unite: colUnite >= 0 ? String(row2[colUnite] || '').trim() : '',
      conditionnement: ''
    });
  }
  return lines;
}

// ── Scan PDF via Edge Function ──
async function mercScanPDF(file) {
  var status = document.getElementById('merc-status');
  status.textContent = '⏳ Analyse IA de la mercuriale…';

  var base64 = await new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  var mediaType = file.type || 'application/pdf';
  // Compresser si image
  if (mediaType.startsWith('image/')) {
    base64 = await new Promise(function(resolve, reject) {
      var img = new Image();
      img.onload = function() {
        var MAX = 1200;
        var w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
      };
      img.onerror = reject;
      img.src = 'data:' + mediaType + ';base64,' + base64;
    });
    mediaType = 'image/jpeg';
  }

  var resp = await fetch('https://pbydidazdjqqihkolzgc.supabase.co/functions/v1/scan-mercuriale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64: base64, media_type: mediaType })
  });

  if (!resp.ok) throw new Error('Erreur serveur ' + resp.status);
  var data = await resp.json();
  if (data.error) throw new Error(data.error);
  return data.lignes || [];
}

// ── Rapprochement fuzzy avec DATA[] ──
function mercMatch(lines) {
  return lines.map(function(line) {
    var best = null;
    var bestScore = 0;
    var desigNorm = mercNorm(line.designation);

    DATA.forEach(function(d) {
      var score = mercSimilarity(desigNorm, mercNorm(d.produit));
      // Bonus si même référence fournisseur
      if (line.reference && d.code && mercNorm(line.reference) === mercNorm(d.code)) score = Math.max(score, 0.85);
      if (score > bestScore) { bestScore = score; best = d; }
    });

    return {
      mercLine: line,
      dataProduct: bestScore >= 0.55 ? best : null,
      score: bestScore,
      checked: bestScore >= 0.55 && best !== null
    };
  });
}

function mercNorm(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function mercSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  // Jaccard sur les mots
  var wa = new Set(a.split(' ').filter(function(w) { return w.length > 2; }));
  var wb = new Set(b.split(' ').filter(function(w) { return w.length > 2; }));
  if (wa.size === 0 || wb.size === 0) return 0;
  var inter = [...wa].filter(function(w) { return wb.has(w); }).length;
  var union = new Set([...wa, ...wb]).size;
  return inter / union;
}

// ── Affichage des résultats ──
function mercRenderResults() {
  var matched = _mercMatches.filter(function(m) { return m.dataProduct; });
  var unmatched = _mercMatches.filter(function(m) { return !m.dataProduct; });
  var withChange = matched.filter(function(m) {
    return m.dataProduct && m.dataProduct.prix !== null && Math.abs(m.mercLine.prix_ht - m.dataProduct.prix) > 0.001;
  });

  // Résumé
  document.getElementById('merc-summary').innerHTML = [
    ['📋', _mercMatches.length, 'lignes extraites'],
    ['✅', matched.length, 'correspondances'],
    ['💰', withChange.length, 'prix différents'],
    ['❓', unmatched.length, 'non trouvés'],
  ].map(function(s) {
    return '<div class="merc-stat"><div class="merc-stat-val">' + s[0] + ' ' + s[1] + '</div><div class="merc-stat-lbl">' + s[2] + '</div></div>';
  }).join('');

  // Tableau — matched en premier, puis unmatched
  var rows = '';
  var idx = 0;
  _mercMatches.forEach(function(m, i) {
    var line = m.mercLine;
    var prod = m.dataProduct;
    var checked = m.checked ? 'checked' : '';
    var rowClass = prod ? 'match-found' : 'match-none';

    var oldPrix = prod && prod.prix !== null ? prod.prix : null;
    var newPrix = line.prix_ht;
    var delta = oldPrix !== null ? newPrix - oldPrix : null;
    var pctStr = delta !== null && oldPrix > 0 ? (delta >= 0 ? '+' : '') + (delta / oldPrix * 100).toFixed(1) + '%' : '—';
    var deltaClass = delta === null ? 'merc-price-same' : delta > 0.005 ? 'merc-price-up' : delta < -0.005 ? 'merc-price-down' : 'merc-price-same';

    var oldPrixStr = oldPrix !== null ? oldPrix.toFixed(2) + ' €' : '—';
    var uniteStr = line.unite ? ' / ' + line.unite : '';

    rows += '<tr class="' + rowClass + '">' +
      '<td><input type="checkbox" class="merc-check" data-idx="' + i + '" ' + checked + (prod ? '' : ' disabled') + ' onchange="_mercMatches[' + i + '].checked=this.checked;mercUpdateApplyBtn()"></td>' +
      '<td><div style="font-weight:500">' + line.designation + '</div>' +
        (line.conditionnement ? '<div style="font-size:11px;color:var(--text2)">' + line.conditionnement + '</div>' : '') + '</td>' +
      '<td>' + (prod ? '<span style="font-size:12px">' + prod.produit + '</span><br><span style="font-size:11px;color:var(--text2)">' + (prod.fournisseur || '') + ' · ' + prod.code + '</span>' : '<span style="color:var(--text3);font-size:12px">— non trouvé —</span>') + '</td>' +
      '<td class="merc-price-old">' + oldPrixStr + '</td>' +
      '<td class="merc-price-new">' + newPrix.toFixed(2) + ' €' + uniteStr + '</td>' +
      '<td class="' + deltaClass + '" style="font-weight:600;white-space:nowrap">' + pctStr + '</td>' +
    '</tr>';
    idx++;
  });

  document.getElementById('merc-tbody').innerHTML = rows;
  document.getElementById('merc-results').classList.add('show');
  mercUpdateApplyBtn();
}

function mercUpdateApplyBtn() {
  var n = _mercMatches.filter(function(m) { return m.checked; }).length;
  var btn = document.getElementById('merc-apply-btn');
  btn.disabled = n === 0;
  btn.textContent = n > 0 ? '✅ Appliquer ' + n + ' prix sélectionné' + (n > 1 ? 's' : '') : '✅ Appliquer les prix sélectionnés';
}

function mercSelectAll(state) {
  _mercMatches.forEach(function(m, i) {
    if (m.dataProduct) {
      m.checked = state;
      var cb = document.querySelector('input[data-idx="' + i + '"]');
      if (cb) cb.checked = state;
    }
  });
  mercUpdateApplyBtn();
}

function mercSelectOnly(type) {
  _mercMatches.forEach(function(m, i) {
    if (!m.dataProduct) return;
    var delta = m.dataProduct.prix !== null ? m.mercLine.prix_ht - m.dataProduct.prix : null;
    var select = type === 'down' ? (delta !== null && delta < -0.005) : false;
    m.checked = select;
    var cb = document.querySelector('input[data-idx="' + i + '"]');
    if (cb) cb.checked = select;
  });
  mercUpdateApplyBtn();
}

// ── Application des prix ──
function mercApplySelected() {
  var toApply = _mercMatches.filter(function(m) { return m.checked && m.dataProduct; });
  if (toApply.length === 0) return;

  var msg = 'Mettre à jour ' + toApply.length + ' prix dans l\'inventaire ?\n\nCette action est irréversible. Confirmez ?';
  if (!confirm(msg)) return;

  var updated = 0;
  toApply.forEach(function(m) {
    var code = m.dataProduct.code;
    var newPrix = m.mercLine.prix_ht;
    // Mettre à jour dans DATA[]
    var idx = DATA.findIndex(function(d) { return d.code === code; });
    if (idx >= 0) {
      DATA[idx].prix = newPrix;
      DATA[idx].status = 'updated';
      updated++;
    }
  });

  // Sauvegarder et synchroniser
  if (typeof saveAll === 'function') saveAll();
  if (typeof syncProductsToCloud === 'function') syncProductsToCloud();
  if (typeof render === 'function') render();
  if (typeof updateStats === 'function') updateStats();

  var status = document.getElementById('merc-status');
  status.className = 'merc-status ok';
  status.textContent = '✅ ' + updated + ' prix mis à jour dans l\'inventaire !';
  document.getElementById('merc-results').classList.remove('show');

  showSyncToast('💰 ' + updated + ' prix mis à jour depuis la mercuriale');
}


// ══ LOGGING ET ALERTES ══
var _errorLog = [];
var _syncFailCount = 0;

function logError(context, error) {
  var entry = { ts: new Date().toISOString(), context: context, message: error && error.message ? error.message : String(error) };
  _errorLog.push(entry);
  if (_errorLog.length > 50) _errorLog.shift();
  console.error('[HACCP/' + context + ']', error);
  try { localStorage.setItem('haccp_error_log', JSON.stringify(_errorLog.slice(-20))); } catch(e) {}
}

function logSyncError(module, error) {
  _syncFailCount++;
  logError('SYNC/' + module, error);
  if (_syncFailCount >= 3) {
    var msg = '⚠️ Sync instable — ' + _syncFailCount + ' erreurs récentes';
    var existing = document.getElementById('_sync_alert');
    if (!existing) {
      var t = document.createElement('div');
      t.id = '_sync_alert';
      t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#faeeda;color:#633806;border:1px solid #f59e0b;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;z-index:9999;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.15)';
      t.textContent = msg + ' — Cliquez pour ignorer';
      t.onclick = function() { t.remove(); };
      document.body && document.body.appendChild(t);
    }
  }
  var dot = document.getElementById('sync-dot');
  if (dot) { dot.style.background = '#f59e0b'; dot.title = 'Erreur sync: ' + String(error); }
}

function logSyncSuccess() { _syncFailCount = 0; var a = document.getElementById('_sync_alert'); if (a) a.remove(); }

window.haccpDiag = function() {
  console.group('HACCP Diagnostic');
  console.log('Erreurs:', _errorLog.slice(-10));
  console.log('Echecs sync:', _syncFailCount);
  console.log('Produits:', typeof DATA !== 'undefined' ? DATA.length : 'N/A');
  console.groupEnd();
  return { errorLog: _errorLog, syncFailCount: _syncFailCount };
};

function closeAddProduct(){
  document.getElementById('addprod-overlay').classList.remove('open');
  _editCode=null;
}

function _validateForm(){
  const fb=document.getElementById('addprod-feedback');
  const nom=document.getElementById('ap-nom').value.trim();
  const zone=document.getElementById('ap-zone').value;
  const prix=parseFloat(String(document.getElementById('ap-prix').value).replace(',','.'));
  if(!nom){fb.className='addprod-feedback err';fb.textContent='⚠️ Le nom du produit est obligatoire.';return null;}
  if(!zone){fb.className='addprod-feedback err';fb.textContent='⚠️ Veuillez choisir une zone HACCP.';return null;}
  if(isNaN(prix)||prix<0){fb.className='addprod-feedback err';fb.textContent='⚠️ Prix HT invalide — entrez un nombre ≥ 0.';return null;}
  const qteRaw=document.getElementById('ap-qte').value.trim();
  const qte=qteRaw===''?null:parseFloat(qteRaw.replace(',','.'));
  if(qteRaw!==''&&isNaN(qte)){fb.className='addprod-feedback err';fb.textContent='⚠️ Quantité invalide.';return null;}
  return{
    nom:nom.toUpperCase(),
    zone,
    cat:document.getElementById('ap-cat').value.trim()||ZONE_TO_CAT[zone]||'Divers',
    prix,
    unite:document.getElementById('ap-unite').value.trim().toUpperCase(),
    qte,
    fournisseur:document.getElementById('ap-fourn').value.trim().toUpperCase(),
  };
}

function submitAddProduct(){
  const vals=_validateForm();
  if(!vals)return;
  const code=_genCode();
  const newItem={
    code,
    zone:vals.zone,
    cat:vals.cat,
    produit:vals.nom,
    unite:vals.unite,
    prix:vals.prix,
    qte:vals.qte,
    fournisseur:vals.fournisseur,
    status:'custom',
  };
  DATA.push(newItem);
  // ── Envoyer vers Supabase ──
  (async()=>{
    try{
      await supa('/rest/v1/haccp_products',{method:'POST',
        headers:{'Prefer':'return=minimal'},
        body:JSON.stringify({code:newItem.code,zone:newItem.zone,cat:newItem.cat,
          produit:newItem.produit,unite:newItem.unite,prix:newItem.prix,
          fournisseur:newItem.fournisseur||'',status:'custom'})});
      showSyncToast('✨ '+newItem.produit+' ajouté dans Supabase');
    }catch(e){showSyncToast('⚠ Produit ajouté localement uniquement');}
  })();
  // Sauvegarder le seuil si renseigné
  const seuilVal=parseFloat(document.getElementById('ap-seuil').value);
  if(!isNaN(seuilVal)&&seuilVal>=0)SEUILS_DATA[code]={min:seuilVal,unite:vals.unite};
  else delete SEUILS_DATA[code];
  saveAllData();
  // Mettre à jour les filtres
  buildFilters_update();
  buildZoneTabs();
  updateStats();
  render();
  scheduleBilanRebuild();
  autoSave();
  const fb=document.getElementById('addprod-feedback');
  fb.className='addprod-feedback ok';
  fb.textContent='✓ Produit ajouté ('+code+') — '+vals.nom;
  // Reset pour en ajouter un autre
  ['ap-nom','ap-prix','ap-unite','ap-qte'].forEach(id=>{document.getElementById(id).value='';});
  document.getElementById('ap-nom').focus();
}

function submitEditProduct(){
  const vals=_validateForm();
  if(!vals)return;
  const item=DATA.find(d=>d.code===_editCode);
  if(!item)return;
  item.produit=vals.nom;
  item.zone=vals.zone;
  item.cat=vals.cat;
  item.prix=vals.prix;
  item.unite=vals.unite;
  item.qte=vals.qte;
  item.fournisseur=vals.fournisseur;
  // Seuil
  const seuilValE=parseFloat(document.getElementById('ap-seuil').value);
  if(!isNaN(seuilValE)&&seuilValE>=0)SEUILS_DATA[_editCode]={min:seuilValE,unite:vals.unite};
  else delete SEUILS_DATA[_editCode];
  saveAllData();
  buildFilters_update();
  buildZoneTabs();
  updateStats();
  render();
  scheduleBilanRebuild();
  autoSave();
  // ── Envoyer vers Supabase ──
  const _code=_editCode;
  const _item=item;
  (async()=>{
    try{
      // Tenter PATCH (mise à jour)
      const r=await supa('/rest/v1/haccp_products?code=eq.'+encodeURIComponent(_code),{
        method:'PATCH',
        body:JSON.stringify({produit:_item.produit,zone:_item.zone,cat:_item.cat,
          prix:_item.prix,unite:_item.unite,fournisseur:_item.fournisseur||'',status:'updated'})
      });
      // Si 0 ligne modifiée → INSERT
      if(r.status===404||r.status===200&&(await r.text())==='[]'){
        await supa('/rest/v1/haccp_products',{method:'POST',
          headers:{'Prefer':'return=minimal'},
          body:JSON.stringify({code:_code,zone:_item.zone,cat:_item.cat,produit:_item.produit,
            unite:_item.unite,prix:_item.prix,fournisseur:_item.fournisseur||'',status:'updated'})});
      }
      showSyncToast('✓ '+_item.produit+' enregistré dans Supabase');
    }catch(e){showSyncToast('⚠ Sauvegarde locale uniquement');}
  })();
  const fb=document.getElementById('addprod-feedback');
  fb.className='addprod-feedback ok';
  fb.textContent='✓ Produit modifié : '+vals.nom;
  setTimeout(closeAddProduct,1200);
}

function deleteCurrentProduct(){
  if(!_editCode)return;
  const item=DATA.find(d=>d.code===_editCode);
  if(!item)return;
  if(!confirm('Supprimer définitivement « '+item.produit+' » ('+_editCode+') ?'))return;
  const idx=DATA.findIndex(d=>d.code===_editCode);
  if(idx>-1)DATA.splice(idx,1);
  buildZoneTabs();
  updateStats();
  render();
  scheduleBilanRebuild();
  autoSave();
  closeAddProduct();
}

function buildFilters_update(){
  // Refresh catégories & fournisseurs dans les selects sans doublons
  const cs=document.getElementById('filt-cat');
  const fs=document.getElementById('filt-fourn');
  const prevCat=cs.value,prevFourn=fs.value;
  const cats=[...new Set(DATA.map(d=>d.cat).filter(Boolean))].sort();
  const fourns=[...new Set(DATA.map(d=>d.fournisseur).filter(Boolean))].sort();
  cs.innerHTML='<option value="">Toutes catégories</option>'+cats.map(c=>`<option value="${c}"${c===prevCat?' selected':''}>${c}</option>`).join('');
  fs.innerHTML='<option value="">Tous fournisseurs</option>'+fourns.map(f=>`<option value="${f}"${f===prevFourn?' selected':''}>${f}</option>`).join('');
}


// ══════════════════════════════════════════════════════════
// MODULE DLC / DATES DE PÉREMPTION
// ══════════════════════════════════════════════════════════
function dlcDaysLeft(dateStr){
  const today=new Date(); today.setHours(0,0,0,0);
  const d=new Date(dateStr); d.setHours(0,0,0,0);
  return Math.round((d-today)/(1000*60*60*24));
}
function dlcColor(days){
  if(days<0)return{dot:'#CC0000',bg:'var(--pink-bg)',text:'var(--pink-text)',label:'Expiré'};
  if(days<=2)return{dot:'#E53935',bg:'var(--pink-bg)',text:'var(--pink-text)',label:'Urgent'};
  if(days<=7)return{dot:'#F59E0B',bg:'var(--amber-bg)',text:'var(--amber-text)',label:'Bientôt'};
  return{dot:'#27500A',bg:'var(--green-bg)',text:'var(--green-text)',label:'OK'};
}
function openDLCAdd(code){
  const sel=document.getElementById('dlc-prod-select');
  sel.innerHTML=DATA.map(d=>`<option value="${d.code}">${d.produit} (${(ZONES[d.zone]||{label:d.zone}).label})</option>`).join('');
  if(code)sel.value=code;
  const today=new Date().toISOString().slice(0,10);
  document.getElementById('dlc-date').value='';
  document.getElementById('dlc-lot').value='';
  document.getElementById('dlc-qte-lot').value='';
  document.getElementById('dlc-note').value='';
  document.getElementById('dlc-type').value='DLC';
  document.getElementById('dlc-feedback').style.display='none';
  document.getElementById('dlc-overlay').classList.add('open');
}
function closeDLCAdd(){document.getElementById('dlc-overlay').classList.remove('open');}
function submitDLC(){
  const code=document.getElementById('dlc-prod-select').value;
  const date=document.getElementById('dlc-date').value;
  const fb=document.getElementById('dlc-feedback');
  if(!date){fb.style.display='block';fb.style.color='var(--pink-text)';fb.textContent='⚠️ Date obligatoire.';return;}
  const item=DATA.find(d=>d.code===code);
  DLC_DATA.push({
    id:Date.now(),code,produit:item?item.produit:code,
    lot:document.getElementById('dlc-lot').value.trim(),
    date,type:document.getElementById('dlc-type').value,
    qte:parseFloat(document.getElementById('dlc-qte-lot').value)||null,
    note:document.getElementById('dlc-note').value.trim(),
    createdAt:new Date().toISOString()
  });
  saveAllData();
  fb.style.display='block';fb.style.color='var(--green-text)';fb.textContent='✓ DLC enregistrée !';
  setTimeout(()=>{closeDLCAdd();renderDLC();},800);
}
function deleteDLC(id){
  if(!confirm('Supprimer cette DLC ?'))return;
  DLC_DATA=DLC_DATA.filter(d=>d.id!==id);
  saveAllData();renderDLC();
}
function renderDLC(){
  const filter=document.getElementById('dlc-filter').value;
  let items=[...DLC_DATA].sort((a,b)=>new Date(a.date)-new Date(b.date));
  // Stats
  const expired=DLC_DATA.filter(d=>dlcDaysLeft(d.date)<0).length;
  const urgent=DLC_DATA.filter(d=>{const n=dlcDaysLeft(d.date);return n>=0&&n<=2;}).length;
  const soon=DLC_DATA.filter(d=>{const n=dlcDaysLeft(d.date);return n>2&&n<=7;}).length;
  const ok=DLC_DATA.filter(d=>dlcDaysLeft(d.date)>7).length;
  const noDLC=DATA.filter(d=>!DLC_DATA.some(x=>x.code===d.code)).length;
  document.getElementById('dlc-summary').innerHTML=
    `<span class="dlc-badge dlc-badge-red" onclick="document.getElementById('dlc-filter').value='alert';renderDLC()">🔴 ${expired+urgent} urgents</span>`+
    `<span class="dlc-badge dlc-badge-yellow" onclick="document.getElementById('dlc-filter').value='soon';renderDLC()">🟡 ${soon} bientôt</span>`+
    `<span class="dlc-badge dlc-badge-green" onclick="document.getElementById('dlc-filter').value='ok';renderDLC()">🟢 ${ok} OK</span>`+
    `<span class="dlc-badge dlc-badge-grey" onclick="document.getElementById('dlc-filter').value='nodlc';renderDLC()">⚪ ${noDLC} sans DLC</span>`;
  // Filtre
  if(filter==='alert')items=items.filter(d=>dlcDaysLeft(d.date)<=2);
  else if(filter==='soon')items=items.filter(d=>{const n=dlcDaysLeft(d.date);return n>2&&n<=7;});
  else if(filter==='ok')items=items.filter(d=>dlcDaysLeft(d.date)>7);
  else if(filter==='nodlc'){
    const withDLC=new Set(DLC_DATA.map(d=>d.code));
    const noDLCItems=DATA.filter(d=>!withDLC.has(d.code));
    document.getElementById('dlc-list').innerHTML=noDLCItems.length===0?
      '<div class="histo-empty">✅ Tous les produits ont une DLC saisie</div>':
      '<div style="border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">'+
      noDLCItems.map((d,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-bottom:${i<noDLCItems.length-1?'.5px solid var(--border)':'none'};background:${i%2===0?'var(--bg)':'var(--bg2)'}">
        <div><div style="font-size:12px;font-weight:500">${d.produit}</div><div style="font-size:10px;color:var(--text3)">${(ZONES[d.zone]||{label:d.zone}).label}</div></div>
        <button class="dlc-btn-sm" onclick="openDLCAdd('${d.code}')">+ DLC</button>
      </div>`).join('')+'</div>';
    renderTempGrid();return;
  }
  const el=document.getElementById('dlc-list');
  if(!items.length){el.innerHTML='<div class="histo-empty">Aucune DLC enregistrée — appuyez sur « + Saisir DLC »</div>';renderTempGrid();return;}
  el.innerHTML=items.map(d=>{
    const days=dlcDaysLeft(d.date);const c=dlcColor(days);
    const daysLabel=days<0?`Expiré depuis ${Math.abs(days)}j`:days===0?`Expire aujourd\'hui`:`${days}j restants`;
    return`<div class="dlc-card" style="border-color:${c.dot}33">
      <div class="dlc-card-header">
        <div class="dlc-card-left">
          <div class="dlc-card-dot" style="background:${c.dot}"></div>
          <div>
            <div class="dlc-card-name">${d.produit}</div>
            <div class="dlc-card-meta">${d.type}${d.lot?' · Lot '+d.lot:''}${d.qte?' · Qté '+d.qte:''}</div>
          </div>
        </div>
        <div class="dlc-card-right">
          <div class="dlc-card-date" style="color:${c.dot}">${new Date(d.date).toLocaleDateString('fr-FR')}</div>
          <div class="dlc-card-days" style="color:${c.dot}">${daysLabel}</div>
        </div>
      </div>
      ${d.note?`<div style="padding:0 12px 8px;font-size:11px;color:var(--text2)">📝 ${d.note}</div>`:''}
      <div class="dlc-card-actions">
        <button class="dlc-btn-sm" onclick="openDLCAdd('${d.code}')">+ Nouvelle DLC</button>
        <button class="dlc-btn-sm" style="color:var(--pink-text)" onclick="deleteDLC(${d.id})">🗑 Supprimer</button>
      </div>
    </div>`;
  }).join('');
  renderTempGrid();
}

// ── Relevés de températures ──
function renderTempGrid(){
  const last=TEMP_DATA.length?TEMP_DATA[TEMP_DATA.length-1]:null;
  document.getElementById('temp-grid').innerHTML=TEMP_ZONES.map(z=>{
    const lastVal=last&&last.releves[z.id]!=null?last.releves[z.id]:'';
    const isOk=lastVal===''||lastVal===null?null:(lastVal>=z.min&&lastVal<=z.max);
    const statusHtml=lastVal!==''&&lastVal!==null?
      `<div class="temp-status ${isOk?'temp-ok':'temp-alert'}">${isOk?'✓ OK':'⚠ HORS SEUIL'} (seuil ${z.min}/${z.max}${z.unit})</div>`:'';
    return`<div class="temp-card">
      <div class="temp-card-label">${z.label}</div>
      <div class="temp-input-wrap">
        <input class="temp-input" id="temp-${z.id}" type="number" inputmode="decimal" step="0.1"
          placeholder="—" value="${lastVal}" oninput="checkTempLive('${z.id}',${z.min},${z.max})">
        <span class="temp-unit">${z.unit}</span>
      </div>
      <div id="temp-status-${z.id}" class="temp-status">${isOk===null?'':''}${isOk===true?`<span class="temp-ok">✓ OK</span>`:isOk===false?`<span class="temp-alert">⚠ HORS SEUIL (seuil ${z.min}/${z.max}${z.unit})</span>`:''}</div>
    </div>`;
  }).join('');
}
function checkTempLive(id,min,max){
  const v=parseFloat(document.getElementById('temp-'+id).value);
  const el=document.getElementById('temp-status-'+id);
  if(isNaN(v)){el.innerHTML='';return;}
  if(v>=min&&v<=max)el.innerHTML=`<span class="temp-ok">✓ OK</span>`;
  else el.innerHTML=`<span class="temp-alert">⚠ HORS SEUIL (${min}/${max}°C)</span>`;
}
function saveTempReleve(){
  const releves={};
  TEMP_ZONES.forEach(z=>{
    const v=parseFloat(document.getElementById('temp-'+z.id).value);
    releves[z.id]=isNaN(v)?null:v;
  });
  TEMP_DATA.push({date:new Date().toISOString(),releves});
  if(TEMP_DATA.length>365)TEMP_DATA=TEMP_DATA.slice(-365);
  saveAllData();
  renderTempGrid();
  alert('Relevé enregistré ✓');
}
function showTempHistory(){
  const el=document.getElementById('temp-history');
  if(el.style.display!=='none'){el.style.display='none';return;}
  const last20=[...TEMP_DATA].reverse().slice(0,20);
  if(!last20.length){el.innerHTML='<div style="color:var(--text2);font-size:13px;padding:8px 0">Aucun relevé enregistré.</div>';el.style.display='block';return;}
  el.innerHTML='<div style="border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">'+
    last20.map((r,i)=>`<div class="temp-histo-row" style="padding:8px 12px;background:${i%2===0?'var(--bg)':'var(--bg2)'}">
      <span class="temp-histo-date">${new Date(r.date).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
      <span style="font-size:11px;color:var(--text)">${TEMP_ZONES.filter(z=>r.releves[z.id]!=null).map(z=>`${z.label} : <b>${r.releves[z.id]}${z.unit}</b>`).join(' · ')}</span>
    </div>`).join('')+'</div>';
  el.style.display='block';
}

// ══════════════════════════════════════════════════════════
// MODULE HISTORIQUE INVENTAIRES
// ══════════════════════════════════════════════════════════
function snapshotInventaire(){
  const label=prompt('Nom de cet inventaire (ex : Juillet 2026) :','');
  if(!label)return;
  const snap={
    id:Date.now(),label,date:new Date().toISOString(),
    total:DATA.reduce((s,d)=>s+(mont(d)||0),0),
    refs:DATA.length,
    items:DATA.map(d=>({code:d.code,produit:d.produit,zone:d.zone,qte:d.qte??null,prix:d.prix}))
  };
  HISTO_DATA.unshift(snap);
  if(HISTO_DATA.length>24)HISTO_DATA=HISTO_DATA.slice(0,24);
  saveAllData();renderHistorique();
  alert('Inventaire archivé ✓');
}
function deleteSnapshot(id){
  if(!confirm('Supprimer cet inventaire archivé ?'))return;
  HISTO_DATA=HISTO_DATA.filter(h=>h.id!==id);
  saveAllData();renderHistorique();
}
function renderHistorique(){
  const el=document.getElementById('histo-list');
  if(!HISTO_DATA.length){
    el.innerHTML='<div class="histo-empty">Aucun inventaire archivé.<br><br>Cliquez sur <b>📸 Archiver l\'inventaire actuel</b> après chaque inventaire mensuel pour conserver un historique et comparer les consommations.</div>';
    return;
  }
  el.innerHTML=HISTO_DATA.map((snap,idx)=>{
    const prev=HISTO_DATA[idx+1];
    const diffVal=prev?snap.total-prev.total:null;
    const diffStr=diffVal!==null?(diffVal>0?'+':'')+diffVal.toFixed(2)+' €':'';
    const diffCls=diffVal===null?'':diffVal>0?'diff-pos':diffVal<0?'diff-neg':'diff-zero';
    return`<div class="histo-card">
      <div class="histo-card-header" onclick="toggleHistoBody(${snap.id})">
        <div>
          <div class="histo-card-title">${snap.label}</div>
          <div class="histo-card-meta">${new Date(snap.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})} · ${snap.refs} références${diffVal!==null?' · <span class="'+diffCls+'" style="font-weight:600">'+diffStr+'</span>':''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="histo-card-val">${snap.total.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}</div>
          <span style="color:var(--text3);font-size:14px">▼</span>
        </div>
      </div>
      <div class="histo-card-body" id="histo-body-${snap.id}">
        ${prev?renderHistoDelta(snap,prev):'<div style="padding:12px 14px;font-size:12px;color:var(--text2)">Pas d\'inventaire précédent pour comparaison.</div>'}
        <div style="padding:10px 14px;display:flex;gap:8px;border-top:.5px solid var(--border)">
          <button class="dlc-btn-sm" onclick="restoreSnapshot(${snap.id})">↩ Restaurer</button>
          <button class="dlc-btn-sm" style="color:var(--pink-text)" onclick="deleteSnapshot(${snap.id})">🗑 Supprimer</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function renderHistoDelta(snap,prev){
  const prevMap={};prev.items.forEach(i=>{prevMap[i.code]=i;});
  const changes=snap.items.filter(i=>{
    const p=prevMap[i.code];
    return p&&i.qte!==null&&p.qte!==null&&Math.abs((i.qte||0)-(p.qte||0))>0.001;
  }).slice(0,20);
  if(!changes.length)return'<div style="padding:12px 14px;font-size:12px;color:var(--text2)">Aucune variation détectée.</div>';
  return'<div>'+changes.map((item,i)=>{
    const prev=prevMap[item.code];
    const diff=(item.qte||0)-(prev.qte||0);
    const diffCls=diff<0?'diff-pos':diff>0?'diff-neg':'diff-zero'; // consommation = négatif = vert
    return`<div class="histo-delta-row" style="background:${i%2===0?'var(--bg)':'var(--bg2)'}">
      <span class="histo-delta-name">${item.produit}</span>
      <span class="histo-delta-old">${prev.qte}</span>
      <span class="histo-delta-arrow">→</span>
      <span class="histo-delta-new">${item.qte}</span>
      <span class="histo-delta-diff ${diffCls}">${diff>0?'+':''}${diff.toFixed(2)}</span>
    </div>`;
  }).join('')+'</div>';
}
function toggleHistoBody(id){
  const el=document.getElementById('histo-body-'+id);
  el.classList.toggle('open');
}
function restoreSnapshot(id){
  const snap=HISTO_DATA.find(h=>h.id===id);
  if(!snap||!confirm('Restaurer les quantités de « '+snap.label+' » ? Cela remplacera les quantités actuelles.'))return;
  const snapMap={};snap.items.forEach(i=>{snapMap[i.code]=i.qte;});
  DATA.forEach(d=>{if(Object.prototype.hasOwnProperty.call(snapMap,d.code))d.qte=snapMap[d.code];});
  autoSave();updateStats();render();scheduleBilanRebuild();
  alert('Quantités restaurées depuis « '+snap.label+' » ✓');
}
function exportHistoExcel(){
  if(typeof XLSX==='undefined'){alert('SheetJS non chargé.');return;}
  if(HISTO_DATA.length<2){alert('Besoin d\'au moins 2 inventaires pour un comparatif.');return;}
  const wb=XLSX.utils.book_new();
  const snap=HISTO_DATA[0]; const prev=HISTO_DATA[1];
  const prevMap={};prev.items.forEach(i=>{prevMap[i.code]=i;});
  const rows=[['Code','Produit','Zone',prev.label+' (qté)',snap.label+' (qté)','Consommation','Prix HT','Valeur consommée HT (€)']];
  snap.items.forEach(item=>{
    const p=prevMap[item.code];if(!p)return;
    const conso=(p.qte||0)-(item.qte||0);
    rows.push([item.code,item.produit,(ZONES[item.zone]||{label:item.zone}).label,p.qte??'',item.qte??'',Math.round(conso*100)/100,item.prix||0,Math.round(conso*(item.prix||0)*100)/100]);
  });
  const ws=XLSX.utils.aoa_to_sheet(rows);
  ws['!cols']=[{wch:8},{wch:36},{wch:14},{wch:14},{wch:14},{wch:14},{wch:12},{wch:18}];
  XLSX.utils.book_append_sheet(wb,ws,'Comparatif');
  XLSX.writeFile(wb,'Comparatif_inventaire_'+new Date().toISOString().slice(0,10)+'.xlsx',{cellStyles:true});
}

// ══════════════════════════════════════════════════════════
// MODULE BON DE COMMANDE
// ══════════════════════════════════════════════════════════
function initCmdFournisseurFilter(){
  const sel=document.getElementById('cmd-fourn-filter');
  const prev=sel.value;
  const fourns=[...new Set(DATA.map(d=>d.fournisseur).filter(Boolean))].sort();
  sel.innerHTML='<option value="">Tous fournisseurs</option>'+fourns.map(f=>`<option value="${f}"${f===prev?' selected':''}>${f}</option>`).join('');
}
function genCommande(){
  CMD_DATA=[];
  DATA.forEach(d=>{
    const s=SEUILS_DATA[d.code];
    if(s&&s.min!=null&&(d.qte===null||d.qte===undefined||d.qte<s.min)){
      CMD_DATA.push({id:Date.now()+Math.random(),code:d.code,produit:d.produit,fournisseur:d.fournisseur||'',
        unite:d.unite||'',prix:d.prix||0,qteCmd:s.min-(d.qte||0),note:''});
    }
  });
  if(!CMD_DATA.length){
    // Générer une commande pour tous les produits sans quantité
    DATA.filter(d=>d.qte===null||d.qte===undefined).forEach(d=>{
      CMD_DATA.push({id:Date.now()+Math.random(),code:d.code,produit:d.produit,fournisseur:d.fournisseur||'',
        unite:d.unite||'',prix:d.prix||0,qteCmd:1,note:''});
    });
  }
  saveAllData();renderCommande();
}
function addCmdLine(){
  const code=prompt('Code produit à ajouter (ex: F001) :','');
  if(!code)return;
  const d=DATA.find(x=>x.code.toUpperCase()===code.toUpperCase());
  if(!d){alert('Produit introuvable.');return;}
  CMD_DATA.push({id:Date.now(),code:d.code,produit:d.produit,fournisseur:d.fournisseur||'',
    unite:d.unite||'',prix:d.prix||0,qteCmd:1,note:''});
  saveAllData();renderCommande();
}
function removeCmdLine(id){
  CMD_DATA=CMD_DATA.filter(c=>c.id!==id);saveAllData();renderCommande();
}
function updateCmdQte(id,val){
  const c=CMD_DATA.find(x=>x.id===id);if(!c)return;
  c.qteCmd=parseFloat(val)||0;saveAllData();updateCmdTotaux();
}
function renderCommande(){
  initCmdFournisseurFilter();
  const filterFourn=document.getElementById('cmd-fourn-filter').value;
  let items=CMD_DATA.filter(c=>!filterFourn||c.fournisseur===filterFourn);
  const el=document.getElementById('cmd-list');
  if(!items.length){el.innerHTML='<div class="histo-empty">Aucune ligne de commande.<br>Cliquez sur <b>⚡ Générer depuis seuils</b> ou <b>+ Ajouter ligne</b>.</div>';updateCmdTotaux();return;}
  el.innerHTML='<div class="cmd-table"><div class="cmd-row cmd-hdr">'+
    '<div class="cmd-cell">Produit</div><div class="cmd-cell" style="text-align:right">Prix HT</div>'+
    '<div class="cmd-cell" style="text-align:right">Qté</div><div class="cmd-cell" style="text-align:right">Montant</div><div class="cmd-cell"></div></div>'+
    items.map(c=>`<div class="cmd-row">
      <div class="cmd-cell"><div class="cmd-cell-name">${c.produit}</div><div class="cmd-cell-fourn">${c.fournisseur||'—'} · ${c.unite}</div></div>
      <div class="cmd-cell" style="text-align:right;font-size:12px">${c.prix.toFixed(2)} €</div>
      <div class="cmd-cell"><input class="cmd-input" type="number" min="0" step="0.1" value="${c.qteCmd}" oninput="updateCmdQte(${c.id},this.value)"></div>
      <div class="cmd-cell" style="text-align:right;font-weight:600">${(c.qteCmd*c.prix).toFixed(2)} €</div>
      <div class="cmd-cell"><button class="cmd-del-btn" onclick="removeCmdLine(${c.id})">✕</button></div>
    </div>`).join('')+'</div>';
  updateCmdTotaux();
}
function updateCmdTotaux(){
  const filterFourn=document.getElementById('cmd-fourn-filter').value;
  const items=CMD_DATA.filter(c=>!filterFourn||c.fournisseur===filterFourn);
  const byFourn={};
  items.forEach(c=>{
    const f=c.fournisseur||'(sans fournisseur)';
    if(!byFourn[f])byFourn[f]=0;byFourn[f]+=c.qteCmd*c.prix;
  });
  const gt=items.reduce((s,c)=>s+c.qteCmd*c.prix,0);
  const el=document.getElementById('cmd-totaux');
  el.innerHTML='<div class="cmd-total-section">'+
    Object.entries(byFourn).sort((a,b)=>b[1]-a[1]).map(([f,v])=>
      `<div class="cmd-total-row"><span>${f}</span><span>${v.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}</span></div>`
    ).join('')+
    `<div class="cmd-total-row">TOTAL COMMANDE <span>${gt.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}</span></div>
  </div>`;
}
function exportCmdExcel(){
  if(typeof XLSX==='undefined'){alert('SheetJS non chargé.');return;}
  const wb=XLSX.utils.book_new();
  const byFourn={};
  CMD_DATA.forEach(c=>{const f=c.fournisseur||'(sans fournisseur)';if(!byFourn[f])byFourn[f]=[];byFourn[f].push(c);});
  const dateStr=new Date().toLocaleDateString('fr-FR');
  Object.entries(byFourn).forEach(([fourn,items])=>{
    const rows=[['BON DE COMMANDE — '+fourn,'','','',''],['La Salle à Manger · Grenoble — '+dateStr,'','','',''],[''],
      ['Code','Désignation','Unité','Quantité','Prix HT (€)','Montant HT (€)'],
      ...items.map(c=>[c.code,c.produit,c.unite,c.qteCmd,c.prix,Math.round(c.qteCmd*c.prix*100)/100]),
      [''],['TOTAL',fourn,'','',Math.round(items.reduce((s,c)=>s+c.qteCmd*c.prix,0)*100)/100,''],
    ];
    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:8},{wch:36},{wch:8},{wch:10},{wch:12},{wch:14}];
    XLSX.utils.book_append_sheet(wb,ws,fourn.slice(0,28));
  });
  XLSX.writeFile(wb,'BonCommande_'+new Date().toISOString().slice(0,10)+'.xlsx',{cellStyles:true});
}
function exportCmdPDF(){
  const dateStr=new Date().toLocaleDateString('fr-FR');
  const byFourn={};
  CMD_DATA.forEach(c=>{const f=c.fournisseur||'(sans fournisseur)';if(!byFourn[f])byFourn[f]=[];byFourn[f].push(c);});
  let html='<html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:12px;color:#1a1a18}h1{font-size:16px;margin-bottom:2px}h2{font-size:13px;color:#0c447c;margin:20px 0 6px}table{width:100%;border-collapse:collapse;margin-bottom:12px}th{background:#1a3a5c;color:#fff;padding:7px 8px;text-align:left;font-size:11px}td{padding:6px 8px;border-bottom:.5px solid #ccc}tr:nth-child(even)td{background:#f0f6ff}.total{font-weight:700;background:#1a3a5c!important;color:#fff}.footer{font-size:10px;color:#888;margin-top:20px}</style></head><body>';
  html+=`<h1>BON DE COMMANDE — La Salle à Manger · Grenoble</h1><p style="color:#666;font-size:11px">Édition du ${dateStr}</p>`;
  Object.entries(byFourn).forEach(([fourn,items])=>{
    const tot=items.reduce((s,c)=>s+c.qteCmd*c.prix,0);
    html+=`<h2>📦 ${fourn}</h2><table><tr><th>Code</th><th>Désignation</th><th>Unité</th><th>Qté</th><th style="text-align:right">Prix HT</th><th style="text-align:right">Montant HT</th></tr>`;
    items.forEach(c=>{html+=`<tr><td>${c.code}</td><td>${c.produit}</td><td>${c.unite}</td><td>${c.qteCmd}</td><td style="text-align:right">${c.prix.toFixed(2)} €</td><td style="text-align:right">${(c.qteCmd*c.prix).toFixed(2)} €</td></tr>`;});
    html+=`<tr class="total"><td colspan="5">TOTAL ${fourn}</td><td style="text-align:right">${tot.toFixed(2)} €</td></tr></table>`;
  });
  html+=`<p class="footer">La Salle à Manger · 6 rue Emile Guyemard · 38000 Grenoble</p></body></html>`;
  openHtmlInNewTab(html);
}

// ══════════════════════════════════════════════════════════
// MODULE ALLERGÈNES
// ══════════════════════════════════════════════════════════
function toggleAllergen(code,aid){
  if(!ALLERGEN_DATA[code])ALLERGEN_DATA[code]=[];
  const idx=ALLERGEN_DATA[code].indexOf(aid);
  if(idx>=0)ALLERGEN_DATA[code].splice(idx,1);
  else ALLERGEN_DATA[code].push(aid);
  saveAllData();
  // Update UI
  const el=document.getElementById('alg-'+code+'-'+aid);
  if(el)el.classList.toggle('active',ALLERGEN_DATA[code].includes(aid));
  updateAllergenPills(code);
}
function updateAllergenPills(code){
  const el=document.getElementById('alg-pills-'+code);
  if(!el)return;
  const algs=ALLERGEN_DATA[code]||[];
  if(!algs.length){el.innerHTML='<span class="allergen-empty-pill">✓ Aucun</span>';return;}
  el.innerHTML=algs.map(aid=>{const a=ALLERGENS_LIST.find(x=>x.id===aid);return a?`<span class="allergen-pill">${a.emoji} ${a.label}</span>`:''}).join('');
}

function resetAllergenToPresets(){
  if(!confirm('Recharger les allergènes depuis la base de données ? Vos modifications locales seront perdues.'))return;
  try {
    const stored = localStorage.getItem(ALLERGENS_KEY);
    if(stored) { ALLERGEN_DATA = JSON.parse(stored); }
    saveAllData(); renderAllergens();
    alert('Allergènes rechargés depuis Supabase ✓');
  } catch(e) { alert('Erreur: ' + e.message); }
}

function exportAllergenPDF(){
  const dateStr=new Date().toLocaleDateString('fr-FR');
  let html=`<html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;font-size:11px;color:#1a1a18}
    h1{font-size:15px;margin-bottom:4px;color:#1a3a5c}
    h2{font-size:11px;color:#666;font-weight:normal;margin-bottom:12px}
    table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:10px}
    th{background:#1a3a5c;color:#fff;padding:5px 6px;text-align:left}
    td{padding:4px 6px;border-bottom:.5px solid #ddd;vertical-align:top}
    tr:nth-child(even)td{background:#f5f5f5}
    .alg{display:inline-block;background:#fbeaf0;color:#72243e;border-radius:3px;padding:1px 5px;margin:1px;font-size:9px;font-weight:700}
    .none{color:#27500a;font-size:9px;font-style:italic}
    .zone{font-size:9px;color:#888}
    @media print{@page{size:A4;margin:12mm}}
  
/* ══ TABLEAU DE BORD ═══════════════════════════════════ */
.dash-wrap{padding:12px 16px 100px}
.dash-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
@media(min-width:600px){.dash-grid{grid-template-columns:repeat(3,1fr)}}
.dash-card{border-radius:var(--radius-lg);padding:14px;border:.5px solid var(--border)}
.dash-card-icon{font-size:24px;margin-bottom:6px}
.dash-card-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text2);margin-bottom:4px}
.dash-card-value{font-size:22px;font-weight:800;line-height:1;letter-spacing:-.02em}
.dash-card-sub{font-size:11px;color:var(--text2);margin-top:4px}
.dash-section-title{font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.07em;margin:16px 0 8px;display:flex;align-items:center;gap:6px}
.dash-section-title::after{content:'';flex:1;height:1px;background:var(--border)}
.dash-alert-card{border-radius:var(--radius);padding:10px 12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;cursor:pointer}
.dash-alert-card:active{opacity:.7}
.dash-foodcost-bar{height:12px;border-radius:6px;background:var(--bg3);overflow:hidden;margin-top:6px}
.dash-foodcost-fill{height:100%;border-radius:6px;transition:width .5s ease}

/* ══ RECETTES ════════════════════════════════════════════ */
.recette-wrap{padding:12px 16px 100px}
.recette-toolbar{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.recette-card{border:.5px solid var(--border);border-radius:var(--radius-lg);margin-bottom:10px;overflow:hidden}
.recette-card-header{padding:12px 14px;background:var(--bg2);display:flex;justify-content:space-between;align-items:center;cursor:pointer}
.recette-card-title{font-size:14px;font-weight:700}
.recette-card-meta{font-size:11px;color:var(--text2);margin-top:2px}
.recette-card-fc{font-size:13px;font-weight:700;white-space:nowrap;margin-left:8px}
.recette-card-body{display:none;border-top:.5px solid var(--border)}
.recette-card-body.open{display:block}
.recette-ing-row{display:flex;justify-content:space-between;align-items:center;padding:7px 14px;border-bottom:.5px solid var(--border);font-size:12px}
.recette-ing-name{flex:1;color:var(--text)}
.recette-ing-cost{color:var(--text2);white-space:nowrap;margin-left:8px}
.recette-total-row{display:flex;justify-content:space-between;padding:10px 14px;font-size:13px;font-weight:700;background:var(--info-bg);color:var(--info-text)}
/* Ligne ingrédient dans modale */
.rec-ing-line{display:grid;grid-template-columns:1fr 70px 60px 32px;gap:6px;align-items:center;margin-bottom:8px}
.rec-ing-select{font-family:var(--font);font-size:12px;padding:7px 8px;border-radius:var(--radius);border:.5px solid var(--border2);background:var(--bg2);color:var(--text);width:100%}
.rec-ing-input{font-family:var(--font);font-size:13px;padding:7px 6px;border-radius:var(--radius);border:.5px solid var(--border2);background:var(--bg);color:var(--text);text-align:right;width:100%}
.rec-ing-unit{font-size:11px;color:var(--text2);padding:4px 0}
.rec-del-btn{background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:4px}
.fc-good{color:var(--green-text)}
.fc-ok{color:var(--amber-text)}
.fc-bad{color:var(--pink-text)}

/* ══ TRAÇABILITÉ ══════════════════════════════════════ */
.trac-wrap{padding:12px 16px 100px}
.trac-toolbar{margin-bottom:12px;display:flex;flex-direction:column;gap:8px}
.trac-row{border-radius:var(--radius);margin-bottom:6px;padding:10px 12px;border:.5px solid var(--border);display:flex;gap:10px;align-items:flex-start}
.trac-icon{font-size:20px;flex-shrink:0;margin-top:2px}
.trac-body{flex:1;min-width:0}
.trac-prod{font-size:13px;font-weight:600}
.trac-meta{font-size:11px;color:var(--text2);margin-top:2px}
.trac-right{text-align:right;flex-shrink:0}
.trac-qte{font-size:13px;font-weight:700}
.trac-date{font-size:10px;color:var(--text3);margin-top:2px}
.trac-del{background:none;border:none;color:var(--text3);font-size:14px;cursor:pointer;padding:2px 4px}
.trac-type-entree{border-left:3px solid var(--green-text)}
.trac-type-sortie{border-left:3px solid var(--blue-text)}
.trac-type-perte{border-left:3px solid var(--pink-text)}
.trac-type-transfert{border-left:3px solid var(--amber-text)}

</style></head><body>`;
  html+=`<h1>Fiche Allergènes — La Salle à Manger · Grenoble</h1>`;
  html+=`<h2>Édition du ${dateStr} · ${DATA.length} références · Règlement UE 1169/2011</h2>`;
  html+=`<table><tr><th>Code</th><th>Produit</th><th>Zone</th><th>Allergènes</th></tr>`;
  DATA.forEach(d=>{
    const algs=ALLERGEN_DATA[d.code]||[];
    const algHtml=algs.length
      ? algs.map(a=>{const al=ALLERGENS_LIST.find(x=>x.id===a);return al?`<span class="alg">${al.emoji} ${al.label}</span>`:''}).join('')
      : '<span class="none">✓ Aucun allergène déclaré</span>';
    html+=`<tr><td>${d.code}</td><td><b>${d.produit}</b></td><td class="zone">${(ZONES[d.zone]||{label:d.zone}).label}</td><td>${algHtml}</td></tr>`;
  });
  html+=`</table><p style="font-size:9px;color:#888;margin-top:8px">Document généré automatiquement — À valider avec les fiches techniques fournisseurs.</p></body></html>`;
  openHtmlInNewTab(html);
}

function renderAllergens(){
  const q=(document.getElementById('allergen-search').value||'').toLowerCase();
  const items=DATA.filter(d=>!q||(d.produit+d.fournisseur).toLowerCase().includes(q));
  const el=document.getElementById('allergen-list');
  if(!items.length){el.innerHTML='<div class="histo-empty">Aucun produit trouvé.</div>';return;}
  el.innerHTML=items.map(d=>{
    const algs=ALLERGEN_DATA[d.code]||[];
    const pillsHtml=algs.length?algs.map(aid=>{const a=ALLERGENS_LIST.find(x=>x.id===aid);return a?`<span class="allergen-pill">${a.emoji} ${a.label}</span>`:''}).join(''):'<span class="allergen-empty-pill">✓ Aucun</span>';
    return`<div class="allergen-card">
      <div class="allergen-card-header" onclick="toggleAllergenBody('${d.code}')">
        <div>
          <div class="allergen-card-name">${d.produit}</div>
          <div class="allergen-card-zone">${(ZONES[d.zone]||{label:d.zone}).label}${d.fournisseur?' · '+d.fournisseur:''}</div>
        </div>
        <div class="allergen-card-pills" id="alg-pills-${d.code}">${pillsHtml}</div>
      </div>
      <div class="allergen-card-body" id="alg-body-${d.code}">
        <div class="allergen-grid">
          ${ALLERGENS_LIST.map(a=>`<label class="allergen-check${algs.includes(a.id)?' active':''}" id="alg-${d.code}-${a.id}" onclick="toggleAllergen('${d.code}','${a.id}')">
            <input type="checkbox" ${algs.includes(a.id)?'checked':''} onclick="event.stopPropagation()" onchange="toggleAllergen('${d.code}','${a.id}')">
            <span class="allergen-check-label">${a.emoji} ${a.label}</span>
          </label>`).join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}
function toggleAllergenBody(code){
  const el=document.getElementById('alg-body-'+code);
  el.classList.toggle('open');
}

// ══════════════════════════════════════════════════════════
// MODULE SEUILS STOCK MINI (intégré dans openEditProduct)
// ══════════════════════════════════════════════════════════
function getSeuilBadge(d){
  const s=SEUILS_DATA[d.code];
  if(!s||s.min==null)return'';
  if((d.qte===null||d.qte===undefined||d.qte<s.min))
    return`<span class="seuil-alert-badge">⬇ Stock bas</span>`;
  return'';
}

// ══════════════════════════════════════════════════════════
// MODE INVENTAIRE RAPIDE
// ══════════════════════════════════════════════════════════
// Déjà géré par le filtre "Sans quantité" dans l'inventaire

// Mise à jour switchTab pour init des panels


// ══ MENU ••• ═══════════════════════════════════════════
function toggleMoreMenu(btn){
  const m=document.getElementById('more-menu');
  const open=m.style.display!=='none';
  m.style.display=open?'none':'block';
  if(!open){
    // Ferme si on clique ailleurs
    setTimeout(()=>{
      document.addEventListener('click',function handler(e){
        if(!m.contains(e.target)&&e.target!==btn){
          m.style.display='none';
          document.removeEventListener('click',handler);
        }
      });
    },10);
  }
}
function closeMoreMenu(){
  const m=document.getElementById('more-menu');
  if(m)m.style.display='none';
}


// ══════════════════════════════════════════════════════════
// STORAGE KEYS NOUVEAUX MODULES
// ══════════════════════════════════════════════════════════
const RECETTES_KEY='haccp_recettes_v1';
const TRAC_KEY='haccp_tracabilite_v1';
const PRIX_HISTO_KEY='haccp_prix_historique_v1';

let RECETTES_DATA=[];   // [{id,nom,cat,couverts,prixVente,ingredients:[{code,qte}],createdAt}]

// Recettes PDF migrées dans Supabase haccp_store (id="recettes")

// Les recettes sont chargées depuis Supabase via pullCloud()
// Cette fonction est conservée pour compatibilité mais ne charge plus de données codées en dur
function initRecettesPDF() {
  // Recettes migrées dans Supabase — rien à faire ici
  console.log('[RECETTES] Source: Supabase haccp_store');
}
let TRAC_DATA=[];       // [{id,type,code,produit,qte,unite,date,resp,note}]
let PRIX_HISTO_DATA={}; // {code:[{date,prix},...]}

function loadNewModules(){
  try{const r=localStorage.getItem(RECETTES_KEY);if(r)RECETTES_DATA=JSON.parse(r);}catch(e){}
  try{const r=localStorage.getItem(TRAC_KEY);if(r)TRAC_DATA=JSON.parse(r);}catch(e){}
  try{const r=localStorage.getItem(PRIX_HISTO_KEY);if(r)PRIX_HISTO_DATA=JSON.parse(r);}catch(e){}
}
function saveNewModules(){
  // Sync automatique via setItem hooks
  try{localStorage.setItem(RECETTES_KEY,JSON.stringify(RECETTES_DATA));syncToCloud('recettes',RECETTES_DATA);}catch(e){}
  try{localStorage.setItem(TRAC_KEY,JSON.stringify(TRAC_DATA));syncToCloud('tracabilite',TRAC_DATA);}catch(e){}
  try{localStorage.setItem(PRIX_HISTO_KEY,JSON.stringify(PRIX_HISTO_DATA));syncToCloud('prix_historique',PRIX_HISTO_DATA);}catch(e){}
}

// ══════════════════════════════════════════════════════════
// TABLEAU DE BORD DIRECTION
// ══════════════════════════════════════════════════════════
function buildDashboard(){
  const wrap=document.getElementById('dash-content');
  if(!wrap)return;
  const now=new Date();
  const todayStr=now.toISOString().slice(0,10);
  const dayLabel=now.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  const BEV_ZONES=['BOISSONS','CAFETERIE'];

  // ── Stock global ──
  const totalStock=DATA.reduce((s,d)=>s+(mont(d)||0),0);
  const totalRefs=DATA.length;
  const saisies=DATA.filter(d=>d.qte!=null&&d.qte!==undefined).length;
  const pctSaisies=totalRefs>0?Math.round(saisies/totalRefs*100):0;

  // ── Sous-totaux Boissons / Nourriture ──
  const boissons={total:0,refs:0,saisies:0,manq:0};
  const nourriture={total:0,refs:0,saisies:0,manq:0};
  DATA.forEach(d=>{
    const m=mont(d)||0;
    const hasQ=d.qte!=null&&d.qte!==undefined;
    const grp=BEV_ZONES.includes(d.zone)?boissons:nourriture;
    grp.total+=m; grp.refs++;
    if(hasQ)grp.saisies++;else grp.manq++;
  });
  const bevPct=totalStock>0?Math.round(boissons.total/totalStock*100):0;
  const nourPct=totalStock>0?Math.round(nourriture.total/totalStock*100):0;

  // ── Par zone (top 4) ──
  const byZone={};
  DATA.forEach(d=>{
    if(!byZone[d.zone])byZone[d.zone]={total:0,refs:0};
    byZone[d.zone].total+=(mont(d)||0);byZone[d.zone].refs++;
  });
  const topZones=Object.entries(byZone).sort((a,b)=>b[1].total-a[1].total).slice(0,6);

  // ── Alertes DLC ──
  const dlcExpires=DLC_DATA.filter(d=>dlcDaysLeft(d.date)<0).length;
  const dlcUrgent=DLC_DATA.filter(d=>{const n=dlcDaysLeft(d.date);return n>=0&&n<=2;}).length;
  const dlcSoon=DLC_DATA.filter(d=>{const n=dlcDaysLeft(d.date);return n>2&&n<=7;}).length;
  const dlcOk=DLC_DATA.filter(d=>dlcDaysLeft(d.date)>7).length;
  const dlcTotal=DLC_DATA.length;

  // ── Stock bas ──
  const stockBas=DATA.filter(d=>{
    const s=SEUILS_DATA[d.code];
    return s&&s.min!=null&&(d.qte==null||d.qte===undefined||d.qte<s.min);
  });

  // ── Food cost ──
  const recFC=RECETTES_DATA.filter(r=>r.prixVente>0);
  const fcMoyen=recFC.length?Math.round(recFC.reduce((s,r)=>{
    const c=calcRecetteCout(r);return s+(c/(r.prixVente*r.couverts)*100);
  },0)/recFC.length):null;

  // ── Températures ──
  const lastTemp=TEMP_DATA.length?TEMP_DATA[TEMP_DATA.length-1]:null;
  const tempAlerts=lastTemp?TEMP_ZONES.filter(z=>{
    const v=lastTemp.releves[z.id];return v!=null&&(v<z.min||v>z.max);
  }):[];

  // ── Traçabilité du jour ──
  const tracToday=TRAC_DATA.filter(t=>t.date.slice(0,10)===todayStr);
  const tracEntrees=tracToday.filter(t=>t.type==='entree').length;
  const tracSorties=tracToday.filter(t=>t.type==='sortie').length;
  const tracPertes=tracToday.filter(t=>t.type==='perte').length;

  // ── Achats du mois (factures) ──
  const monthStr=now.toISOString().slice(0,7);
  const achats=INVOICES.reduce((s,inv)=>s+inv.total,0);

  const fmt=(v)=>v.toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0});
  const fmtDec=(v)=>v.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});

  let html=`<div style="padding:8px 0 10px;font-size:12px;color:var(--text2);font-weight:500">${dayLabel}</div>`;

  // ══ 1. VALEUR TOTALE + BARRE RÉPARTITION ══
  html+=`
  <div style="border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:12px">
    <!-- Header total -->
    <div style="background:var(--info-bg);padding:14px 16px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--info-text);opacity:.75">Valeur totale HT</div>
        <div style="font-size:26px;font-weight:800;color:var(--info-text);letter-spacing:-.02em;margin-top:2px">${fmtDec(totalStock)}</div>
        <div style="font-size:11px;color:var(--info-text);opacity:.7;margin-top:2px">${totalRefs} références · ${saisies} saisies (${pctSaisies}%)</div>
      </div>
      <div style="font-size:32px">📦</div>
    </div>

    <!-- Barre progression saisie -->
    <div style="padding:10px 16px;border-bottom:.5px solid var(--border)">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:5px">
        <span>Avancement saisie inventaire</span><span style="font-weight:600;color:${pctSaisies>=80?'var(--green-text)':pctSaisies>=50?'var(--amber-text)':'var(--pink-text)'}">${pctSaisies}%</span>
      </div>
      <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${pctSaisies}%;background:${pctSaisies>=80?'var(--green-text)':pctSaisies>=50?'var(--amber-text)':'var(--pink-text)'};border-radius:3px;transition:width .5s ease"></div>
      </div>
    </div>

    <!-- Sous-totaux Boissons / Nourriture -->
    <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:.5px solid var(--border)">
      <div style="padding:12px 14px;border-right:.5px solid var(--border);cursor:pointer" onclick="switchTabByName('bilan')">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--amber-text);opacity:.8">🥤 Boissons & Café</div>
        <div style="font-size:18px;font-weight:800;color:var(--amber-text);margin-top:3px">${fmtDec(boissons.total)}</div>
        <div style="font-size:10px;color:var(--amber-text);opacity:.7;margin-top:2px">${boissons.refs} réf. · ${bevPct}% du stock</div>
      </div>
      <div style="padding:12px 14px;cursor:pointer" onclick="switchTabByName('bilan')">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--green-text);opacity:.8">🍴 Nourriture</div>
        <div style="font-size:18px;font-weight:800;color:var(--green-text);margin-top:3px">${fmtDec(nourriture.total)}</div>
        <div style="font-size:10px;color:var(--green-text);opacity:.7;margin-top:2px">${nourriture.refs} réf. · ${nourPct}% du stock</div>
      </div>
    </div>

    <!-- Barre répartition Boissons / Nourriture -->
    <div style="padding:10px 16px">
      <div style="height:8px;border-radius:4px;overflow:hidden;display:flex;gap:2px">
        <div style="flex:${bevPct};background:var(--amber-text);opacity:.7;border-radius:4px 0 0 4px;min-width:${bevPct>0?'4px':'0'}"></div>
        <div style="flex:${nourPct};background:var(--green-text);opacity:.7;border-radius:0 4px 4px 0;min-width:${nourPct>0?'4px':'0'}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-top:4px">
        <span>🥤 Boissons ${bevPct}%</span><span>🍴 Nourriture ${nourPct}%</span>
      </div>
    </div>
  </div>`;

  // ══ 2. RÉPARTITION PAR ZONE ══
  html+=`
  <div style="border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:12px">
    <div style="padding:10px 14px;background:var(--bg2);font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;display:flex;justify-content:space-between">
      <span>📍 Par zone de stockage</span>
      <span style="font-weight:400;text-transform:none;cursor:pointer;color:var(--info-text)" onclick="switchTabByName('bilan')">Voir le bilan →</span>
    </div>
    ${topZones.map(([z,v],i)=>{
      const info=ZONES[z]||{label:z};
      const pct=totalStock>0?Math.round(v.total/totalStock*100):0;
      const zColors={'FRIGO 1':'#378ADD','FRIGO 2':'#185FA5','CONGELATEUR':'#7F77DD','BOISSONS':'#BA7517','CAFETERIE':'#EF9F27','ECONOMAT':'#639922','BOF':'#D4537E','FRAIS BCP':'#1D9E75','AUTRE':'#888780'};
      const col=zColors[z]||'#888';
      return`<div style="padding:9px 14px;border-top:${i>0?'.5px solid var(--border)':'none'};display:flex;align-items:center;gap:10px">
        <div style="width:10px;height:10px;border-radius:50%;background:${col};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
            <span style="font-size:12px;font-weight:600">${info.label}</span>
            <span style="font-size:12px;font-weight:700;color:${col}">${v.total.toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0})}</span>
          </div>
          <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${col};opacity:.7;border-radius:2px"></div>
          </div>
        </div>
        <span style="font-size:10px;color:var(--text3);width:28px;text-align:right">${pct}%</span>
      </div>`;
    }).join('')}
  </div>`;

  // ══ 3. ALERTES DLC ══
  const dlcHasAlert=dlcExpires>0||dlcUrgent>0;
  html+=`
  <div style="border:.5px solid ${dlcHasAlert?'var(--pink-text)':'var(--border)'};border-radius:var(--radius-lg);overflow:hidden;margin-bottom:12px;cursor:pointer" onclick="switchTabByName('dlc')">
    <div style="padding:10px 14px;background:${dlcHasAlert?'var(--pink-bg)':'var(--bg2)'};display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${dlcHasAlert?'var(--pink-text)':'var(--text2)'}">🌡 Alertes DLC</span>
      <span style="font-size:11px;color:${dlcHasAlert?'var(--pink-text)':'var(--text3)'}">${dlcTotal} DLC enregistrées · Voir →</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr">
      ${[
        {label:'Expirés',val:dlcExpires,bg:dlcExpires>0?'var(--pink-bg)':'var(--bg)',col:dlcExpires>0?'var(--pink-text)':'var(--text3)',icon:'🔴'},
        {label:'< 48h',val:dlcUrgent,bg:dlcUrgent>0?'var(--pink-bg)':'var(--bg)',col:dlcUrgent>0?'var(--pink-text)':'var(--text3)',icon:'🟠'},
        {label:'< 7 j',val:dlcSoon,bg:dlcSoon>0?'var(--amber-bg)':'var(--bg)',col:dlcSoon>0?'var(--amber-text)':'var(--text3)',icon:'🟡'},
        {label:'OK',val:dlcOk,bg:dlcOk>0?'var(--green-bg)':'var(--bg)',col:dlcOk>0?'var(--green-text)':'var(--text3)',icon:'🟢'},
      ].map((item,i)=>`<div style="padding:12px 8px;text-align:center;border-left:${i>0?'.5px solid var(--border)':'none'};background:${item.bg}">
        <div style="font-size:16px">${item.icon}</div>
        <div style="font-size:20px;font-weight:800;color:${item.col};margin:2px 0">${item.val}</div>
        <div style="font-size:9px;color:${item.col};opacity:.8;text-transform:uppercase;letter-spacing:.03em">${item.label}</div>
      </div>`).join('')}
    </div>
  </div>`;

  // ══ 4. TEMPÉRATURES ══
  html+=`
  <div style="border:.5px solid ${tempAlerts.length>0?'var(--pink-text)':'var(--border)'};border-radius:var(--radius-lg);overflow:hidden;margin-bottom:12px;cursor:pointer" onclick="switchTabByName('dlc')">
    <div style="padding:10px 14px;background:${tempAlerts.length>0?'var(--pink-bg)':lastTemp?'var(--green-bg)':'var(--bg2)'};display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${tempAlerts.length>0?'var(--pink-text)':lastTemp?'var(--green-text)':'var(--text2)'}">🌡 Températures</div>
        <div style="font-size:13px;font-weight:600;color:${tempAlerts.length>0?'var(--pink-text)':lastTemp?'var(--green-text)':'var(--text2)'};margin-top:2px">
          ${tempAlerts.length>0?`⚠️ ${tempAlerts.length} hors seuil : ${tempAlerts.map(z=>z.label).join(', ')}`:lastTemp?'✅ Toutes températures OK':'Aucun relevé — Saisir →'}
        </div>
        ${lastTemp?`<div style="font-size:10px;color:var(--text3);margin-top:1px">Relevé : ${new Date(lastTemp.date).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</div>`:''}
      </div>
      <div style="font-size:28px">${tempAlerts.length>0?'🔴':lastTemp?'🟢':'⚪'}</div>
    </div>
    ${lastTemp?`<div style="display:flex;flex-wrap:wrap;gap:0;border-top:.5px solid var(--border)">
      ${TEMP_ZONES.filter(z=>lastTemp.releves[z.id]!=null).map((z,i)=>{
        const v=lastTemp.releves[z.id];
        const ok=v>=z.min&&v<=z.max;
        return`<div style="padding:8px 12px;flex:1;min-width:80px;border-right:.5px solid var(--border);text-align:center;background:${ok?'var(--bg)':'var(--pink-bg)'}">
          <div style="font-size:10px;color:var(--text2)">${z.label}</div>
          <div style="font-size:14px;font-weight:700;color:${ok?'var(--green-text)':'var(--pink-text)'}">${v}${z.unit}</div>
        </div>`;
      }).join('')}
    </div>`:''}
  </div>`;

  // ══ 5. STOCK BAS ══
  if(stockBas.length){
    html+=`
  <div style="border:.5px solid var(--pink-text);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:12px;cursor:pointer" onclick="switchTabByName('commande')">
    <div style="padding:10px 14px;background:var(--pink-bg);display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--pink-text)">⬇ Stock bas — ${stockBas.length} produit${stockBas.length>1?'s':''}</div>
      <span style="font-size:11px;color:var(--pink-text)">Commander →</span>
    </div>
    ${stockBas.slice(0,4).map((d,i)=>`<div style="padding:8px 14px;border-top:.5px solid var(--border);display:flex;justify-content:space-between;background:${i%2===0?'var(--bg)':'var(--bg2)'}">
      <span style="font-size:12px;font-weight:500">${d.produit}</span>
      <span style="font-size:11px;color:var(--pink-text);font-weight:600">${d.qte!=null?d.qte:0} ${d.unite} / min ${SEUILS_DATA[d.code]?.min} ${d.unite}</span>
    </div>`).join('')}
    ${stockBas.length>4?`<div style="padding:8px 14px;font-size:11px;color:var(--text2);text-align:center;border-top:.5px solid var(--border)">+ ${stockBas.length-4} autre${stockBas.length-4>1?'s':''} produit${stockBas.length-4>1?'s':''} sous seuil</div>`:''}
  </div>`;
  }

  // ══ 6. FOOD COST ══
  if(RECETTES_DATA.length){
    const fcCol=fcMoyen===null?'var(--text2)':fcMoyen<=28?'var(--green-text)':fcMoyen<=35?'var(--amber-text)':'var(--pink-text)';
    const fcLabel=fcMoyen===null?'—':fcMoyen<=28?'Excellent ✅':fcMoyen<=35?'Correct ⚠️':'Trop élevé 🔴';
    html+=`
  <div style="border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:12px">
    <div style="padding:10px 14px;background:var(--bg2);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text2);display:flex;justify-content:space-between">
      <span>👨‍🍳 Food Cost</span>
      <span style="font-weight:400;text-transform:none;cursor:pointer;color:var(--info-text)" onclick="switchTabByName('recettes')">${RECETTES_DATA.length} recette${RECETTES_DATA.length>1?'s':''} →</span>
    </div>
    <div style="padding:14px 16px">
      <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:8px">
        <div style="font-size:32px;font-weight:800;color:${fcCol}">${fcMoyen!==null?fcMoyen+'%':'—'}</div>
        <div style="font-size:13px;color:${fcCol};font-weight:600">${fcLabel}</div>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:6px">
        <div style="height:100%;width:${fcMoyen?Math.min(fcMoyen,100):0}%;background:${fcCol};border-radius:4px;transition:width .5s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)">
        <span>0%</span><span style="color:var(--green-text)">25–32% cible</span><span>100%</span>
      </div>
    </div>
    ${recFC.slice(0,3).map(r=>{
      const c=calcRecetteCout(r);
      const fc=r.prixVente>0?Math.round(c/(r.prixVente*r.couverts)*100):null;
      const col=fc===null?'var(--text3)':fc<=28?'var(--green-text)':fc<=35?'var(--amber-text)':'var(--pink-text)';
      return`<div style="padding:8px 14px;border-top:.5px solid var(--border);display:flex;justify-content:space-between;cursor:pointer" onclick="switchTabByName('recettes')">
        <span style="font-size:12px;font-weight:500">${r.nom}</span>
        <span style="font-size:13px;font-weight:700;color:${col}">${fc!==null?fc+'%':'—'}</span>
      </div>`;
    }).join('')}
  </div>`;
  }

  // ══ 7. TRAÇABILITÉ DU JOUR ══
  html+=`
  <div style="border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:12px;cursor:pointer" onclick="switchTabByName('tracabilite')">
    <div style="padding:10px 14px;background:var(--bg2);display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text2)">📋 Traçabilité aujourd'hui</span>
      <span style="font-size:11px;color:var(--info-text)">${tracToday.length} opération${tracToday.length>1?'s':''} →</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-top:.5px solid var(--border)">
      ${[
        {label:'Entrées',val:tracEntrees,icon:'📥',col:'var(--green-text)',bg:'var(--green-bg)'},
        {label:'Sorties',val:tracSorties,icon:'📤',col:'var(--info-text)',bg:'var(--info-bg)'},
        {label:'Pertes',val:tracPertes,icon:'🗑',col:'var(--pink-text)',bg:tracPertes>0?'var(--pink-bg)':'var(--bg)'},
      ].map((item,i)=>`<div style="padding:12px 8px;text-align:center;border-left:${i>0?'.5px solid var(--border)':'none'};background:${item.val>0?item.bg:'var(--bg)'}">
        <div style="font-size:18px">${item.icon}</div>
        <div style="font-size:22px;font-weight:800;color:${item.val>0?item.col:'var(--text3)'}">${item.val}</div>
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:.03em;color:${item.val>0?item.col:'var(--text3)'}">${item.label}</div>
      </div>`).join('')}
    </div>
    <div style="padding:8px 14px;border-top:.5px solid var(--border);font-size:11px;color:var(--text3);display:flex;justify-content:space-between">
      <span>Total historique : ${TRAC_DATA.length} opération${TRAC_DATA.length>1?'s':''}</span>
      <span>Achats inventoriés : ${fmt(achats)}</span>
    </div>
  </div>`;

  // ══ 8. NOTIFICATIONS ══
  if('Notification' in window && Notification.permission!=='granted'){
    html+=`<div style="border:.5px solid var(--amber-text);border-radius:var(--radius-lg);padding:12px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;background:var(--amber-bg)" onclick="enableNotifications()">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--amber-text)">🔔 Activer les alertes automatiques</div>
        <div style="font-size:11px;color:var(--amber-text);opacity:.8;margin-top:2px">Recevez une alerte si DLC urgente ou stock bas</div>
      </div>
      <button style="background:var(--amber-text);color:#fff;border:none;border-radius:8px;padding:8px 14px;font-weight:600;font-size:13px;cursor:pointer;white-space:nowrap;margin-left:10px">Activer</button>
    </div>`;
  }

  wrap.innerHTML=html;
}

function switchTabByName(name){
  // Cas spécial: bilan accessible via le tab dashboard
  if(name==='bilan'){
    document.querySelectorAll('.tab-btn,.tab-more-item').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    const panel=document.getElementById('panel-bilan');
    if(panel){panel.classList.add('active');buildBilan();}
    return;
  }
  const btn=document.querySelector(`.tab-btn[onclick*="'${name}'"]`)||
             document.querySelector(`.tab-more-item[onclick*="'${name}'"]`);
  if(btn){btn.click();return;}
  // Fallback direct panel activation
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  const panel=document.getElementById('panel-'+name);
  if(panel){
    panel.classList.add('active');
    if(name==='dashboard')buildDashboard();
    if(name==='tracabilite')renderTracabilite();
    if(name==='historique')renderHistorique();
    if(name==='commande')renderCommande();
    if(name==='recettes')renderRecettes();
    if(name==='allergenes')renderAllergens();
    if(name==='dlc')renderDLC();
    if(name==='prix'){initPrixPanel();setTimeout(renderPrixChart,100);}
    if(name==='carte-allergenes')renderCartAlg();
  }
}

// ══════════════════════════════════════════════════════════
// MODULE RECETTES / FICHES TECHNIQUES
// ══════════════════════════════════════════════════════════
let _editRecetteId=null;
let _recetteIngredients=[];

// ── Conversion d'unités pour le calcul du coût matière ──
// Convertit la quantité d'un ingrédient de recette vers l'unité du catalogue,
// uniquement quand la conversion est arithmétiquement sûre : même famille
// (poids, volume, ou unité de comptage). Ne devine JAMAIS un facteur pour un
// conditionnement (boîte, seau, botte, bouteille...) ni entre familles
// différentes (ex: poids vs volume) — dans ces cas la conversion doit rester
// manuelle plutôt que d'inventer un chiffre faux.
function normUnit(u){
  if(!u) return '';
  return u.toString().toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z]/g,'');
}
const WEIGHT_TO_G = {g:1,gr:1,gramme:1,grammes:1,mg:0.001,kg:1000,kilo:1000,kilos:1000,kilogramme:1000,kilogrammes:1000};
const VOLUME_TO_ML = {ml:1,millilitre:1,millilitres:1,cl:10,centilitre:10,centilitres:10,dl:100,decilitre:100,decilitres:100,l:1000,litre:1000,litres:1000};
const COUNT_UNITS = new Set(['piece','pieces','pu','pce','pc','u','unite','unites']);

// Renvoie le facteur qui convertit une quantité exprimée dans uniteRecette
// vers l'unité du catalogue uniteCatalogue, ou null si la conversion n'est
// pas sûre (unités de familles différentes, ou conditionnement non comptable).
function unitConversionFactor(uniteRecette, uniteCatalogue){
  const a = normUnit(uniteRecette), b = normUnit(uniteCatalogue);
  if(!a || !b) return null;
  if(a===b) return 1;
  if(WEIGHT_TO_G[a]!==undefined && WEIGHT_TO_G[b]!==undefined) return WEIGHT_TO_G[a]/WEIGHT_TO_G[b];
  if(VOLUME_TO_ML[a]!==undefined && VOLUME_TO_ML[b]!==undefined) return VOLUME_TO_ML[a]/VOLUME_TO_ML[b];
  if(COUNT_UNITS.has(a) && COUNT_UNITS.has(b)) return 1;
  return null;
}

// Résout un ingrédient de recette vers son produit catalogue (haccp_products),
// en lisant code_produit (rapprochement recettes PDF / niveau 1) avec repli sur
// code (ingrédients ajoutés manuellement via le formulaire Recettes).
// Ne fige jamais de prix : le prix vient toujours de DATA (catalogue courant).
// Ne calcule un coût que si la conversion d'unité recette → catalogue est sûre ;
// sinon renvoie needsManualConversion=true plutôt que d'inventer un chiffre.
function resolveIngredient(ing){
  const code = ing.code_produit || ing.code || null;
  const prod = code ? DATA.find(d=>d.code===code) : null;
  const nom = prod ? prod.produit : (ing.designation || ing.code || '?');
  const uniteRecette = ing.unite || '';
  const qte = parseFloat(ing.qte||0);

  if(!prod || !prod.prix){
    return {code, prod, hasPrice:false, needsManualConversion:false, nom, uniteRecette, uniteCatalogue:null, qte, prixU:null, cout:0};
  }

  const uniteCatalogue = prod.unite || '';
  const factor = unitConversionFactor(uniteRecette, uniteCatalogue);
  if(factor===null){
    // Unité recette et unité catalogue incompatibles (conditionnement différent,
    // ou familles différentes) : conversion manuelle nécessaire, pas de calcul auto.
    return {code, prod, hasPrice:false, needsManualConversion:true, nom, uniteRecette, uniteCatalogue, qte, prixU:prod.prix, cout:0};
  }

  const qteConvertie = qte * factor;
  const cout = prod.prix * qteConvertie;
  return {code, prod, hasPrice:true, needsManualConversion:false, nom, uniteRecette, uniteCatalogue, qte, qteConvertie, prixU:prod.prix, cout};
}

function calcRecetteCout(r){
  return (r.ingredients||[]).reduce((s,ing)=>s+resolveIngredient(ing).cout, 0);
}

function openNewRecette(){
  _editRecetteId=null;
  _recetteIngredients=[];
  document.getElementById('rec-nom').value='';
  document.getElementById('rec-couverts').value='4';
  document.getElementById('rec-prix-vente').value='';
  document.getElementById('rec-cat').value='plat';
  document.getElementById('recette-modal-title').textContent='👨‍🍳 Nouvelle recette';
  document.getElementById('rec-submit-btn').textContent='✓ Enregistrer';
  document.getElementById('rec-cost-preview').style.display='none';
  document.getElementById('rec-feedback').style.display='none';
  renderRecetteIngredients();
  document.getElementById('recette-overlay').classList.add('open');
}

function openEditRecette(id){
  const r=RECETTES_DATA.find(x=>x.id===id);
  if(!r)return;
  _editRecetteId=id;
  _recetteIngredients=r.ingredients.map(i=>({...i}));
  document.getElementById('rec-nom').value=r.nom;
  document.getElementById('rec-couverts').value=r.couverts;
  document.getElementById('rec-prix-vente').value=r.prixVente||'';
  document.getElementById('rec-cat').value=r.cat||'plat';
  document.getElementById('recette-modal-title').textContent='✏️ Modifier la recette';
  document.getElementById('rec-submit-btn').textContent='✓ Mettre à jour';
  renderRecetteIngredients();
  updateRecetteCost();
  document.getElementById('recette-overlay').classList.add('open');
}

function closeRecette(){document.getElementById('recette-overlay').classList.remove('open');}

function addRecetteIngredient(){
  _recetteIngredients.push({code:DATA[0]?.code||'',qte:0});
  renderRecetteIngredients();
  updateRecetteCost();
}

function removeRecetteIngredient(idx){
  _recetteIngredients.splice(idx,1);
  renderRecetteIngredients();
  updateRecetteCost();
}

function renderRecetteIngredients(){
  const el=document.getElementById('rec-ingredients-list');
  if(!_recetteIngredients.length){
    el.innerHTML='<div style="font-size:12px;color:var(--text2);text-align:center;padding:10px 0">Aucun ingrédient — cliquez sur « + Ajouter »</div>';
    return;
  }
  el.innerHTML=_recetteIngredients.map((ing,i)=>{
    const prod=DATA.find(d=>d.code===ing.code);
    return`<div class="rec-ing-line">
      <select class="rec-ing-select" onchange="updRecIng(${i},'code',this.value)">
        ${DATA.map(d=>`<option value="${d.code}"${d.code===ing.code?' selected':''}>${d.produit} (${d.unite})</option>`).join('')}
      </select>
      <input class="rec-ing-input" type="number" min="0" step="0.01" value="${ing.qte||''}" placeholder="Qté" oninput="updRecIng(${i},'qte',this.value)">
      <span class="rec-ing-unit">${prod?prod.unite:''}</span>
      <button class="rec-del-btn" onclick="removeRecetteIngredient(${i})">✕</button>
    </div>`;
  }).join('');
}

function updRecIng(idx,field,val){
  if(field==='code')_recetteIngredients[idx].code=val;
  else _recetteIngredients[idx].qte=parseFloat(val)||0;
  if(field==='code')renderRecetteIngredients();
  updateRecetteCost();
}

function updateRecetteCost(){
  const couverts=parseInt(document.getElementById('rec-couverts').value)||1;
  const prixVente=parseFloat(document.getElementById('rec-prix-vente').value)||0;
  const cout=_recetteIngredients.reduce((s,ing)=>{
    const prod=DATA.find(d=>d.code===ing.code);
    return s+(prod?prod.prix*(ing.qte||0):0);
  },0);
  if(cout===0){document.getElementById('rec-cost-preview').style.display='none';return;}
  const coutCouvert=cout/couverts;
  const fc=prixVente>0?Math.round(cout/(prixVente*couverts)*100):null;
  const fcColor=fc===null?'var(--info-text)':fc<=28?'var(--green-text)':fc<=35?'var(--amber-text)':'var(--pink-text)';
  document.getElementById('rec-cout-couvert').textContent=coutCouvert.toFixed(2)+' €';
  document.getElementById('rec-cout-total').textContent=cout.toFixed(2)+' €';
  document.getElementById('rec-food-cost').textContent=fc!==null?fc+'%':'— (saisir prix de vente)';
  document.getElementById('rec-food-cost').style.color=fcColor;
  document.getElementById('rec-cost-preview').style.display='block';
}

function submitRecette(){
  const nom=document.getElementById('rec-nom').value.trim();
  const fb=document.getElementById('rec-feedback');
  if(!nom){fb.style.display='block';fb.style.color='var(--pink-text)';fb.textContent='⚠️ Nom obligatoire.';return;}
  if(!_recetteIngredients.length){fb.style.display='block';fb.style.color='var(--pink-text)';fb.textContent='⚠️ Ajoutez au moins un ingrédient.';return;}
  const r={
    id:_editRecetteId||Date.now(),
    nom,cat:document.getElementById('rec-cat').value,
    couverts:parseInt(document.getElementById('rec-couverts').value)||4,
    prixVente:parseFloat(document.getElementById('rec-prix-vente').value)||0,
    ingredients:_recetteIngredients.map(i=>({code:i.code,qte:i.qte||0})),
    updatedAt:new Date().toISOString()
  };
  if(_editRecetteId){
    const idx=RECETTES_DATA.findIndex(x=>x.id===_editRecetteId);
    if(idx>=0)RECETTES_DATA[idx]=r;
  } else {
    r.createdAt=new Date().toISOString();
    RECETTES_DATA.unshift(r);
  }
  saveNewModules();
  fb.style.display='block';fb.style.color='var(--green-text)';fb.textContent='✓ Recette enregistrée !';
  setTimeout(()=>{closeRecette();renderRecettes();},700);
}

function deleteRecette(id){
  if(!confirm('Supprimer cette recette ?'))return;
  RECETTES_DATA=RECETTES_DATA.filter(r=>r.id!==id);
  saveNewModules();renderRecettes();
}

function renderRecettes(){
  const el=document.getElementById('recettes-list');
  if(!el)return;
  if(!RECETTES_DATA.length){
    el.innerHTML='<div class="histo-empty">Aucune recette.<br>Cliquez sur <b>+ Nouvelle recette</b> pour créer votre première fiche technique.</div>';
    return;
  }
  const CATS={entree:'Entrée',plat:'Plat',dessert:'Dessert',autre:'Autre'};
  el.innerHTML=RECETTES_DATA.map(r=>{
    const cout=calcRecetteCout(r);
    const coutCouvert=cout/r.couverts;
    const fc=r.prixVente>0?Math.round(cout/(r.prixVente*r.couverts)*100):null;
    const fcColor=fc===null?'var(--text2)':fc<=28?'var(--green-text)':fc<=35?'var(--amber-text)':'var(--pink-text)';
    const fcLabel=fc===null?'Prix vente non renseigné':fc<=28?'✅ Excellent':fc<=35?'⚠️ Correct':'🔴 Trop élevé';
    return`<div class="recette-card">
      <div class="recette-card-header" onclick="toggleRecetteBody(${r.id})">
        <div>
          <div class="recette-card-title">${r.nom}</div>
          <div class="recette-card-meta">${CATS[r.cat]||r.cat} · ${r.couverts} couverts · ${cout.toFixed(2)}€ coût · ${coutCouvert.toFixed(2)}€/couvert</div>
        </div>
        <div class="recette-card-fc" style="color:${fcColor}">${fc!==null?fc+'%':'—'}</div>
      </div>
      <div class="recette-card-body" id="rec-body-${r.id}">
        ${r.ingredients.map(ing=>{
          const ri=resolveIngredient(ing);
          let coutStr;
          if(ri.hasPrice){
            coutStr = `${ing.qte} ${ri.uniteRecette} × ${ri.prixU.toFixed(2)}€/${ri.uniteCatalogue} = <b>${ri.cout.toFixed(2)}€</b>`;
          } else if(ri.needsManualConversion){
            coutStr = `${ing.qte||''} ${ri.uniteRecette} <span style="color:var(--amber-text);font-style:italic">· conversion manuelle requise (catalogue : ${ri.uniteCatalogue})</span>`;
          } else {
            coutStr = `${ing.qte||''} ${ri.uniteRecette} <span style="color:var(--text2);font-style:italic">· prix à renseigner</span>`;
          }
          return`<div class="recette-ing-row">
            <span class="recette-ing-name">${ri.nom}</span>
            <span class="recette-ing-cost">${coutStr}</span>
          </div>`;
        }).join('')}
        <div class="recette-total-row">
          <span>Coût total · ${r.couverts} couverts</span>
          <span>${cout.toFixed(2)} €</span>
        </div>
        <div style="padding:8px 14px;background:var(--bg2);border-top:.5px solid var(--border)">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span>Coût / couvert</span><span style="font-weight:600">${coutCouvert.toFixed(2)} €</span>
          </div>
          ${r.prixVente?`<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span>Prix vente HT / couvert</span><span style="font-weight:600">${r.prixVente.toFixed(2)} €</span>
          </div>`:''}
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700">
            <span style="color:${fcColor}">Food cost</span>
            <span style="color:${fcColor}">${fc!==null?fc+'% — '+fcLabel:'Prix de vente non renseigné'}</span>
          </div>
          ${fc!==null?`<div class="dash-foodcost-bar"><div class="dash-foodcost-fill" style="width:${Math.min(fc,100)}%;background:${fcColor}"></div></div>`:''}
        </div>
        <div style="padding:10px 14px;display:flex;gap:8px;border-top:.5px solid var(--border)">
          <button class="dlc-btn-sm" onclick="openEditRecette(${r.id})">✏️ Modifier</button>
          <button class="dlc-btn-sm" style="color:var(--pink-text)" onclick="deleteRecette(${r.id})">🗑 Supprimer</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleRecetteBody(id){
  document.getElementById('rec-body-'+id)?.classList.toggle('open');
}

function exportRecettesPDF(){
  const dateStr=new Date().toLocaleDateString('fr-FR');
  let html=`<html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;font-size:11px;color:#1a1a18}
    h1{font-size:16px;color:#1a3a5c;margin-bottom:2px}
    h2{font-size:13px;color:#0c447c;margin:18px 0 6px;border-bottom:1px solid #ccc;padding-bottom:4px}
    table{width:100%;border-collapse:collapse;margin-bottom:8px}
    th{background:#1a3a5c;color:#fff;padding:5px 8px;text-align:left;font-size:10px}
    td{padding:4px 8px;border-bottom:.5px solid #eee;font-size:11px}
    .total{font-weight:700;background:#f0f6ff}.fc{font-weight:700}
    .fc-good{color:#27500a}.fc-ok{color:#633806}.fc-bad{color:#cc0000}
    @media print{@page{size:A4;margin:15mm}}
  </style></head><body>`;
  html+=`<h1>Fiches Techniques — La Salle à Manger · Grenoble</h1><p style="color:#888;font-size:10px">Édition du ${dateStr}</p>`;
  RECETTES_DATA.forEach(r=>{
    const cout=calcRecetteCout(r);
    const fc=r.prixVente>0?Math.round(cout/(r.prixVente*r.couverts)*100):null;
    const fcClass=fc===null?'':fc<=28?'fc-good':fc<=35?'fc-ok':'fc-bad';
    html+=`<h2>${r.nom} <span style="font-size:11px;color:#888">(${r.couverts} couverts)</span></h2>`;
    html+=`<table><tr><th>Ingrédient</th><th>Quantité</th><th>Unité</th><th>Prix HT/U</th><th>Coût</th></tr>`;
    r.ingredients.forEach(ing=>{
      const ri=resolveIngredient(ing);
      const prixCell = ri.hasPrice ? ri.prixU.toFixed(2)+' €/'+ri.uniteCatalogue : (ri.needsManualConversion ? 'conversion manuelle requise' : 'prix à renseigner');
      const coutCell = ri.hasPrice ? ri.cout.toFixed(2)+' €' : '—';
      html+=`<tr><td>${ri.nom}</td><td>${ing.qte}</td><td>${ri.uniteRecette}</td><td>${prixCell}</td><td>${coutCell}</td></tr>`;
    });
    html+=`<tr class="total"><td colspan="4">Coût total recette</td><td>${cout.toFixed(2)} €</td></tr>`;
    html+=`<tr class="total"><td colspan="4">Coût / couvert</td><td>${(cout/r.couverts).toFixed(2)} €</td></tr>`;
    if(r.prixVente)html+=`<tr class="total"><td colspan="4">Food cost</td><td class="fc ${fcClass}">${fc!==null?fc+'%':'—'}</td></tr>`;
    html+='</table>';
  });
  html+='</body></html>';
  openHtmlInNewTab(html);
}

// ══════════════════════════════════════════════════════════
// MODULE TRAÇABILITÉ
// ══════════════════════════════════════════════════════════
const TRAC_ICONS={entree:'📥',sortie:'📤',perte:'🗑',transfert:'↔'};
const TRAC_LABELS={entree:'Entrée',sortie:'Sortie cuisine',perte:'Perte/Périmé',transfert:'Transfert'};

function openTracAdd(){
  const sel=document.getElementById('trac-prod');
  sel.innerHTML=DATA.map(d=>`<option value="${d.code}">${d.produit} (${(ZONES[d.zone]||{label:d.zone}).label})</option>`).join('');
  const now=new Date();
  now.setMinutes(now.getMinutes()-now.getTimezoneOffset());
  document.getElementById('trac-date').value=now.toISOString().slice(0,16);
  document.getElementById('trac-qte').value='';
  document.getElementById('trac-note').value='';
  document.getElementById('trac-resp').value='';
  document.getElementById('trac-type').value='entree';
  // Auto-fill unite from selected product
  const firstProd=DATA[0];
  if(firstProd)document.getElementById('trac-unite').value=firstProd.unite||'';
  document.getElementById('trac-prod').onchange=function(){
    const p=DATA.find(d=>d.code===this.value);
    if(p)document.getElementById('trac-unite').value=p.unite||'';
  };
  document.getElementById('trac-overlay').classList.add('open');
}
function closeTracAdd(){document.getElementById('trac-overlay').classList.remove('open');}

function submitTrac(){
  const code=document.getElementById('trac-prod').value;
  const qte=parseFloat(document.getElementById('trac-qte').value);
  if(isNaN(qte)||qte<=0){alert('Quantité invalide.');return;}
  const prod=DATA.find(d=>d.code===code);
  const entry={
    id:Date.now(),type:document.getElementById('trac-type').value,
    code,produit:prod?prod.produit:code,
    qte,unite:document.getElementById('trac-unite').value.trim(),
    date:document.getElementById('trac-date').value||new Date().toISOString(),
    resp:document.getElementById('trac-resp').value.trim(),
    note:document.getElementById('trac-note').value.trim()
  };
  TRAC_DATA.unshift(entry);
  if(TRAC_DATA.length>1000)TRAC_DATA=TRAC_DATA.slice(0,1000);
  // Mettre à jour le stock automatiquement
  if(prod){
    const delta=entry.type==='entree'?qte:-qte;
    prod.qte=(prod.qte||0)+delta;
    if(prod.qte<0)prod.qte=0;
    autoSave();updateStats();render();scheduleBilanRebuild();
  }
  saveNewModules();
  closeTracAdd();renderTracabilite();
}

function deleteTrac(id){
  if(!confirm('Supprimer cette opération ?'))return;
  TRAC_DATA=TRAC_DATA.filter(t=>t.id!==id);
  saveNewModules();renderTracabilite();
}

function renderTracabilite(){
  const el=document.getElementById('trac-list');
  if(!el)return;
  const typeF=document.getElementById('trac-type-filter')?.value||'';
  const q=(document.getElementById('trac-search')?.value||'').toLowerCase();
  let items=TRAC_DATA.filter(t=>{
    if(typeF&&t.type!==typeF)return false;
    if(q&&!(t.produit+t.code+(t.resp||'')+(t.note||'')).toLowerCase().includes(q))return false;
    return true;
  });
  if(!items.length){
    el.innerHTML='<div class="histo-empty">Aucune opération enregistrée.<br>Utilisez <b>+ Enregistrer</b> pour saisir une entrée, sortie ou perte.</div>';
    return;
  }
  // Grouper par jour
  const byDay={};
  items.forEach(t=>{
    const day=t.date.slice(0,10);
    if(!byDay[day])byDay[day]=[];
    byDay[day].push(t);
  });
  el.innerHTML=Object.entries(byDay).map(([day,entries])=>{
    const d=new Date(day);
    const label=d.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
    return`<div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;padding:10px 0 6px">${label}</div>`+
    entries.map(t=>`<div class="trac-row trac-type-${t.type}">
      <div class="trac-icon">${TRAC_ICONS[t.type]||'📋'}</div>
      <div class="trac-body">
        <div class="trac-prod">${t.produit}</div>
        <div class="trac-meta">${TRAC_LABELS[t.type]||t.type}${t.resp?' · '+t.resp:''}${t.note?' · '+t.note:''}</div>
      </div>
      <div class="trac-right">
        <div class="trac-qte">${t.type==='entree'?'+':'−'}${t.qte} ${t.unite}</div>
        <div class="trac-date">${new Date(t.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
        <button class="trac-del" onclick="deleteTrac(${t.id})">✕</button>
      </div>
    </div>`).join('');
  }).join('');
}

function exportTracPDF(){
  const dateStr=new Date().toLocaleDateString('fr-FR');
  let html=`<html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;font-size:11px}h1{font-size:15px;color:#1a3a5c}
    table{width:100%;border-collapse:collapse;margin-top:10px}
    th{background:#1a3a5c;color:#fff;padding:5px 8px;text-align:left;font-size:10px}
    td{padding:4px 8px;border-bottom:.5px solid #ddd;font-size:11px}
    tr:nth-child(even)td{background:#f9f9f9}
    @media print{@page{size:A4;margin:12mm}}
  
/* ══ COMPARATEUR PRIX ══════════════════════════════════ */
.prix-wrap{padding:12px 16px 100px}
.prix-toolbar{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center}
.prix-table-wrap{border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-top:8px}
.prix-row{display:grid;grid-template-columns:1fr 80px 90px 80px 100px;align-items:center;border-bottom:.5px solid var(--border);font-size:12px}
.prix-row:last-child{border-bottom:none}
.prix-row.prix-hdr{background:var(--bg2);font-weight:600;font-size:10px;text-transform:uppercase;color:var(--text2)}
.prix-cell{padding:8px 10px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.prix-badge-best{display:inline-block;font-size:9px;padding:1px 5px;border-radius:3px;background:var(--green-bg);color:var(--green-text);font-weight:700}
.prix-badge-worst{display:inline-block;font-size:9px;padding:1px 5px;border-radius:3px;background:var(--pink-bg);color:var(--pink-text);font-weight:700}
.prix-diff-pos{color:var(--green-text);font-weight:600}
.prix-diff-neg{color:var(--pink-text);font-weight:600}
/* Summary cards */
.prix-summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:10px 0}
.prix-sum-card{background:var(--bg2);border-radius:var(--radius);padding:10px 12px;text-align:center}
.prix-sum-label{font-size:9px;text-transform:uppercase;letter-spacing:.04em;color:var(--text2);margin-bottom:4px}
.prix-sum-val{font-size:16px;font-weight:700}

/* ══ CARTE ALLERGÈNES PAR PLAT ══════════════════════════ */
.carte-alg-wrap{padding:12px 16px 100px}
.carte-alg-toolbar{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.plat-card{border:.5px solid var(--border);border-radius:var(--radius-lg);margin-bottom:10px;overflow:hidden}
.plat-card-header{padding:12px 14px;background:var(--bg2);display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer}
.plat-card-title{font-size:14px;font-weight:700}
.plat-card-cat{font-size:10px;color:var(--text2);margin-top:2px;text-transform:uppercase;letter-spacing:.04em}
.plat-card-pills{display:flex;flex-wrap:wrap;gap:3px;margin-top:6px}
.plat-alg-pill{font-size:10px;padding:3px 7px;border-radius:4px;background:var(--pink-bg);color:var(--pink-text);font-weight:600}
.plat-no-alg{font-size:11px;color:var(--green-text);font-weight:600}
.plat-card-body{display:none;border-top:.5px solid var(--border);padding:12px 14px}
.plat-card-body.open{display:block}
.plat-alg-grid-display{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
@media(min-width:480px){.plat-alg-grid-display{grid-template-columns:repeat(3,1fr)}}
.plat-alg-item{display:flex;align-items:center;gap:6px;font-size:12px;padding:6px 8px;border-radius:6px}
.plat-alg-item.present{background:var(--pink-bg);color:var(--pink-text);font-weight:600}
.plat-alg-item.absent{background:var(--bg2);color:var(--text3)}
/* Affichage salle - grand format imprimable */
@media print{
  .carte-print-header{font-size:20px!important;font-weight:900!important}
  .plat-alg-pill{font-size:14px!important;padding:6px 12px!important}
}

/* ══ SAISIE VOCALE AMÉLIORÉE ══════════════════════════ */
.voice-mic-btn{width:52px;height:52px;border-radius:50%;border:none;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;touch-action:manipulation;transition:all .2s ease}
.voice-mic-btn.idle{background:var(--bg2);color:var(--text2)}
.voice-mic-btn.listening{background:var(--pink-bg);color:var(--pink-text);animation:pulse 1s infinite}
.voice-mic-btn.unsupported{background:var(--bg3);color:var(--text3);cursor:not-allowed}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
.voice-suggestions{display:flex;flex-wrap:wrap;gap:6px;padding:6px 0}
.voice-chip{font-size:12px;padding:5px 10px;border-radius:20px;background:var(--bg2);border:.5px solid var(--border2);color:var(--text2);cursor:pointer;touch-action:manipulation}
.voice-chip:active{background:var(--info-bg);color:var(--info-text)}

</style></head><body>
  <h1>Journal de Traçabilité — La Salle à Manger · Grenoble</h1>
  <p style="color:#888;font-size:10px">Édition du ${dateStr} · ${TRAC_DATA.length} opérations</p>
  <table><tr><th>Date/heure</th><th>Type</th><th>Produit</th><th>Quantité</th><th>Responsable</th><th>Note</th></tr>`;
  TRAC_DATA.forEach(t=>{
    html+=`<tr><td>${new Date(t.date).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</td>
      <td>${TRAC_LABELS[t.type]||t.type}</td><td>${t.produit}</td>
      <td>${t.type==='entree'?'+':'−'}${t.qte} ${t.unite}</td>
      <td>${t.resp||'—'}</td><td>${t.note||'—'}</td></tr>`;
  });
  html+='</table></body></html>';
  openHtmlInNewTab(html);
}

// ══════════════════════════════════════════════════════════
// NOTIFICATIONS / ALERTES (Web Notifications API)
// ══════════════════════════════════════════════════════════
async function requestNotificationPermission(){
  if(!('Notification' in window)){return false;}
  if(Notification.permission==='granted')return true;
  const perm=await Notification.requestPermission();
  return perm==='granted';
}

function scheduleAlerts(){
  // Vérifier toutes les heures
  checkAndNotify();
  setInterval(checkAndNotify,60*60*1000);
}

function checkAndNotify(){
  if(Notification.permission!=='granted')return;
  const now=new Date();
  // DLC urgentes
  const urgent=DLC_DATA.filter(d=>{const n=dlcDaysLeft(d.date);return n>=0&&n<=2;});
  if(urgent.length){
    new Notification('⚠️ DLC HACCP — La Salle à Manger',{
      body:`${urgent.length} produit${urgent.length>1?'s expirent':'expire'} dans moins de 48h !\n${urgent.map(d=>d.produit).join(', ')}`,
      icon:'/icon-192.png',tag:'dlc-alert'
    });
  }
  // Stock bas
  const bas=DATA.filter(d=>{
    const s=SEUILS_DATA[d.code];
    return s&&s.min!=null&&(d.qte===null||d.qte===undefined||d.qte<s.min);
  });
  if(bas.length){
    new Notification('📦 Stock bas — La Salle à Manger',{
      body:`${bas.length} produit${bas.length>1?'s sont':'est'} sous le seuil minimum.\n${bas.slice(0,3).map(d=>d.produit).join(', ')}`,
      icon:'/icon-192.png',tag:'stock-alert'
    });
  }
}

// Bouton activer les notifications (dans dashboard)
async function enableNotifications(){
  const ok=await requestNotificationPermission();
  if(ok){
    alert('✅ Notifications activées ! Vous serez alerté(e) en cas de DLC urgente ou de stock bas.');
    scheduleAlerts();
    buildDashboard();
  } else {
    alert('Notifications refusées. Vous pouvez les activer dans les réglages de votre navigateur.');
  }
}



// ══════════════════════════════════════════════════════════
// MODULE COMPARATEUR DE PRIX FOURNISSEURS
// ══════════════════════════════════════════════════════════
const PLATS_KEY = 'haccp_plats_v1';
let PLATS_DATA = []; // [{id,nom,cat,allergenes:[],traces:bool}]

function loadPlats(){
  try{const r=localStorage.getItem(PLATS_KEY);if(r)PLATS_DATA=JSON.parse(r);}catch(e){}
}
function savePlats(){
  try{localStorage.setItem(PLATS_KEY,JSON.stringify(PLATS_DATA));syncToCloud('plats',PLATS_DATA);}catch(e){}
}

// ── Init onglet Prix ──
function initPrixPanel(){
  const sel=document.getElementById('prix-prod-select');
  if(!sel)return;
  sel.innerHTML='<option value="">— Choisir un produit —</option>'+
    [...DATA].sort((a,b)=>a.produit.localeCompare(b.produit,'fr')).map(d=>
      `<option value="${d.code}">${d.produit} (${d.fournisseur||'—'})</option>`
    ).join('');
  // Fill fournisseur datalist
  const dl=document.getElementById('prix-fourn-list');
  if(dl){
    const fourns=[...new Set(DATA.map(d=>d.fournisseur).filter(Boolean))].sort();
    dl.innerHTML=fourns.map(f=>`<option value="${f}">`).join('');
  }
}

function openAddPrix(code){
  const sel=document.getElementById('prix-add-prod');
  sel.innerHTML=[...DATA].sort((a,b)=>a.produit.localeCompare(b.produit,'fr')).map(d=>
    `<option value="${d.code}"${d.code===code?' selected':''}>${d.produit}</option>`
  ).join('');
  // Prefill fournisseur from selected product
  const updateFourn=()=>{
    const p=DATA.find(d=>d.code===sel.value);
    document.getElementById('prix-add-fourn').value=p?.fournisseur||'';
    document.getElementById('prix-add-val').value=p?.prix||'';
  };
  sel.onchange=updateFourn; updateFourn();
  document.getElementById('prix-add-date').value=new Date().toISOString().slice(0,10);
  document.getElementById('prix-add-note').value='';
  document.getElementById('prix-feedback').style.display='none';
  document.getElementById('prix-overlay').classList.add('open');
}
function closePrix(){document.getElementById('prix-overlay').classList.remove('open');}

function submitPrix(){
  const code=document.getElementById('prix-add-prod').value;
  const val=parseFloat(document.getElementById('prix-add-val').value);
  const fb=document.getElementById('prix-feedback');
  if(!code||isNaN(val)||val<=0){fb.style.display='block';fb.style.color='var(--pink-text)';fb.textContent='⚠️ Prix invalide.';return;}
  const fourn=document.getElementById('prix-add-fourn').value.trim().toUpperCase();
  const date=document.getElementById('prix-add-date').value;
  const note=document.getElementById('prix-add-note').value.trim();
  if(!PRIX_HISTO_DATA[code])PRIX_HISTO_DATA[code]=[];
  PRIX_HISTO_DATA[code].push({date,prix:val,fournisseur:fourn,note});
  PRIX_HISTO_DATA[code].sort((a,b)=>a.date.localeCompare(b.date));
  // Update current product price
  const prod=DATA.find(d=>d.code===code);
  if(prod){prod.prix=val;prod.fournisseur=fourn||prod.fournisseur;prod.status='updated';}
  saveNewModules();autoSave();
  fb.style.display='block';fb.style.color='var(--green-text)';fb.textContent='✓ Prix enregistré !';
  setTimeout(()=>{closePrix();renderPrixChart();},600);
}

function renderPrixChart(){
  const code=document.getElementById('prix-prod-select').value;
  const wrap=document.getElementById('prix-chart-wrap');
  const empty=document.getElementById('prix-empty');
  if(!code){wrap.style.display='none';empty.style.display='block';return;}

  const prod=DATA.find(d=>d.code===code);
  const history=PRIX_HISTO_DATA[code]||[];

  // Add current price as a data point if not in history
  const allPoints=[...history];
  if(prod&&!allPoints.some(p=>p.date===new Date().toISOString().slice(0,10)&&p.prix===prod.prix)){
    allPoints.push({date:new Date().toISOString().slice(0,10),prix:prod.prix,fournisseur:prod.fournisseur||'Actuel',note:'Prix actuel'});
  }

  wrap.style.display='block';empty.style.display='none';

  // ── Canvas chart (pure JS, no lib) ──
  const canvas=document.getElementById('prix-canvas');
  // Attendre le paint pour avoir offsetWidth correct
  requestAnimationFrame(()=>{
  const ctx=canvas.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  const W=canvas.parentElement?.clientWidth||canvas.offsetWidth||320;
  canvas.width=Math.round(W*dpr);
  canvas.height=Math.round(220*dpr);
  canvas.style.width=W+'px';canvas.style.height='220px';
  ctx.scale(dpr,dpr);
  const cw=W, ch=220;

  ctx.clearRect(0,0,cw,ch);

  if(allPoints.length<2){
    // Just show a note
    ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text2').trim()||'#888';
    ctx.font='13px Arial';ctx.textAlign='center';
    ctx.fillText('Ajoutez des prix pour voir l\'évolution',cw/2,ch/2);
  } else {
    const prices=allPoints.map(p=>p.prix);
    const minP=Math.min(...prices)*0.95, maxP=Math.max(...prices)*1.05;
    const pad={t:20,r:20,b:40,l:55};
    const pw=cw-pad.l-pad.r, ph=ch-pad.t-pad.b;

    // Grid
    const isDark=window.matchMedia('(prefers-color-scheme:dark)').matches;
    const gridColor=isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)';
    const textColor=isDark?'#a8a8a4':'#6b6b68';
    const lineColor='#2E6DAF';

    // Y gridlines
    for(let i=0;i<=4;i++){
      const y=pad.t+ph*(1-i/4);
      const val=minP+(maxP-minP)*i/4;
      ctx.strokeStyle=gridColor;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+pw,y);ctx.stroke();
      ctx.fillStyle=textColor;ctx.font='10px Arial';ctx.textAlign='right';
      ctx.fillText(val.toFixed(2)+'€',pad.l-4,y+4);
    }

    // Line
    ctx.strokeStyle=lineColor;ctx.lineWidth=2;ctx.beginPath();
    allPoints.forEach((p,i)=>{
      const x=pad.l+pw*i/(allPoints.length-1);
      const y=pad.t+ph*(1-(p.prix-minP)/(maxP-minP));
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.stroke();

    // Fill under line
    ctx.fillStyle=isDark?'rgba(46,109,173,.15)':'rgba(46,109,173,.08)';
    ctx.beginPath();
    allPoints.forEach((p,i)=>{
      const x=pad.l+pw*i/(allPoints.length-1);
      const y=pad.t+ph*(1-(p.prix-minP)/(maxP-minP));
      if(i===0)ctx.moveTo(x,ph+pad.t);ctx.lineTo(x,y);
    });
    ctx.lineTo(pad.l+pw,ph+pad.t);ctx.closePath();ctx.fill();

    // Points + dates
    allPoints.forEach((p,i)=>{
      const x=pad.l+pw*i/(allPoints.length-1);
      const y=pad.t+ph*(1-(p.prix-minP)/(maxP-minP));
      ctx.fillStyle=lineColor;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();
      if(i===0||i===allPoints.length-1||allPoints.length<=6){
        ctx.fillStyle=textColor;ctx.font='9px Arial';ctx.textAlign='center';
        ctx.fillText(p.date.slice(5),x,ch-pad.b+14);
        ctx.fillStyle=lineColor;ctx.font='bold 10px Arial';
        ctx.fillText(p.prix.toFixed(2)+'€',x,y-8);
      }
    });
  }

  // ── Tableau comparatif par fournisseur ──
  const byFourn={};
  allPoints.forEach(p=>{
    const f=p.fournisseur||'Inconnu';
    if(!byFourn[f])byFourn[f]={prices:[],last:null};
    byFourn[f].prices.push(p.prix);
    byFourn[f].last=p;
  });
  const allPrices=allPoints.map(p=>p.prix);
  const bestPrice=Math.min(...allPrices);
  const worstPrice=Math.max(...allPrices);
  const currentPrice=prod?.prix||allPoints[allPoints.length-1]?.prix;

  // Summary cards
  let tableHTML=`<div class="prix-summary">
    <div class="prix-sum-card">
      <div class="prix-sum-label">Prix actuel</div>
      <div class="prix-sum-val" style="color:var(--info-text)">${currentPrice?.toFixed(3)||'—'}€</div>
    </div>
    <div class="prix-sum-card">
      <div class="prix-sum-label">Meilleur prix</div>
      <div class="prix-sum-val" style="color:var(--green-text)">${bestPrice.toFixed(3)}€</div>
    </div>
    <div class="prix-sum-card">
      <div class="prix-sum-label">Variation</div>
      <div class="prix-sum-val" style="color:${((worstPrice-bestPrice)/bestPrice*100)>10?'var(--pink-text)':'var(--amber-text)'}">
        ${Math.round((worstPrice-bestPrice)/bestPrice*100)}%
      </div>
    </div>
  </div>`;

  // Table par fournisseur
  const fourns=Object.entries(byFourn).sort((a,b)=>Math.min(...a[1].prices)-Math.min(...b[1].prices));
  tableHTML+=`<div class="prix-table-wrap">
    <div class="prix-row prix-hdr">
      <div class="prix-cell">Fournisseur</div>
      <div class="prix-cell">Prix min</div>
      <div class="prix-cell">Prix max</div>
      <div class="prix-cell">Dernier</div>
      <div class="prix-cell">vs meilleur</div>
    </div>`;
  fourns.forEach(([f,v])=>{
    const min=Math.min(...v.prices), max=Math.max(...v.prices), last=v.last.prix;
    const diff=Math.round((last-bestPrice)/bestPrice*100);
    const isBest=last===bestPrice;
    tableHTML+=`<div class="prix-row">
      <div class="prix-cell" style="font-weight:500">${f}${isBest?'<span class="prix-badge-best" style="margin-left:4px">★ Mieux</span>':''}</div>
      <div class="prix-cell">${min.toFixed(3)}€</div>
      <div class="prix-cell">${max.toFixed(3)}€</div>
      <div class="prix-cell" style="font-weight:600">${last.toFixed(3)}€</div>
      <div class="prix-cell ${diff===0?'':diff<0?'prix-diff-pos':'prix-diff-neg'}">${diff===0?'ref':diff>0?'+'+diff+'%':diff+'%'}</div>
    </div>`;
  });
  tableHTML+='</div>';

  // Historique
  if(history.length){
    tableHTML+=`<div style="margin-top:12px;font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Historique</div>
    <div style="border:.5px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">`;
    [...history].reverse().slice(0,10).forEach((p,i)=>{ 
      tableHTML+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 12px;border-bottom:.5px solid var(--border);background:${i%2===0?'var(--bg)':'var(--bg2)'}">
        <div><span style="font-size:12px;font-weight:500">${p.fournisseur||'—'}</span>${p.note?`<span style="font-size:10px;color:var(--text3);margin-left:6px">${p.note}</span>`:''}</div>
        <div style="display:flex;gap:12px;align-items:center">
          <span style="font-size:11px;color:var(--text2)">${new Date(p.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'})}</span>
          <span style="font-size:13px;font-weight:700;color:${p.prix===bestPrice?'var(--green-text)':p.prix===worstPrice?'var(--pink-text)':'var(--text)'}">${p.prix.toFixed(3)}€</span>
        </div>
      </div>`;
    });
    tableHTML+='</div>';
  }

  tableHTML+=`<div style="text-align:right;margin-top:8px">
    <button class="btn" onclick="openAddPrix('${code}')" style="font-size:12px">+ Ajouter un relevé de prix</button>
  </div>`;

  document.getElementById('prix-table').innerHTML=tableHTML;
  }); // end requestAnimationFrame
}

function exportPrixExcel(){
  if(typeof XLSX==='undefined'){alert('SheetJS non chargé.');return;}
  const wb=XLSX.utils.book_new();
  // Feuille récap
  const rows=[['Code','Produit','Fournisseur actuel','Prix actuel','Prix min historique','Prix max historique','Nb relevés']];
  DATA.forEach(d=>{
    const h=PRIX_HISTO_DATA[d.code]||[];
    if(!h.length&&!d.prix)return;
    const prices=[d.prix,...h.map(p=>p.prix)].filter(Boolean);
    rows.push([d.code,d.produit,d.fournisseur||'',d.prix||'',Math.min(...prices),Math.max(...prices),h.length]);
  });
  const ws=XLSX.utils.aoa_to_sheet(rows);
  ws['!cols']=[{wch:8},{wch:36},{wch:16},{wch:12},{wch:14},{wch:14},{wch:10}];
  XLSX.utils.book_append_sheet(wb,ws,'Récap prix');
  // Feuille historique détaillé
  const rows2=[['Code','Produit','Fournisseur','Date','Prix HT','Note']];
  Object.entries(PRIX_HISTO_DATA).forEach(([code,hist])=>{
    const prod=DATA.find(d=>d.code===code);
    hist.forEach(h=>rows2.push([code,prod?.produit||code,h.fournisseur||'',h.date,h.prix,h.note||'']));
  });
  const ws2=XLSX.utils.aoa_to_sheet(rows2);
  ws2['!cols']=[{wch:8},{wch:36},{wch:16},{wch:12},{wch:12},{wch:20}];
  XLSX.utils.book_append_sheet(wb,ws2,'Historique détaillé');
  XLSX.writeFile(wb,'Comparatif_prix_'+new Date().toISOString().slice(0,10)+'.xlsx',{cellStyles:true});
}

// ══════════════════════════════════════════════════════════
// MODULE CARTE ALLERGÈNES PAR PLAT
// ══════════════════════════════════════════════════════════
let _editPlatId=null;
let _platAlgSelected=[];

function openNewPlat(){
  _editPlatId=null;_platAlgSelected=[];
  document.getElementById('plat-nom').value='';
  document.getElementById('plat-cat').value='plat';
  document.getElementById('plat-traces').value='non';
  document.getElementById('plat-modal-title').textContent='🍽 Nouveau plat';
  document.getElementById('plat-submit-btn').textContent='✓ Enregistrer';
  document.getElementById('plat-feedback').style.display='none';
  renderPlatAlgGrid();
  document.getElementById('plat-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('plat-nom').focus(),200);
}
function openEditPlat(id){
  const p=PLATS_DATA.find(x=>x.id===id);if(!p)return;
  _editPlatId=id;_platAlgSelected=[...(p.allergenes||[])];
  document.getElementById('plat-nom').value=p.nom;
  document.getElementById('plat-cat').value=p.cat||'plat';
  document.getElementById('plat-traces').value=p.traces?'oui':'non';
  document.getElementById('plat-modal-title').textContent='✏️ Modifier le plat';
  document.getElementById('plat-submit-btn').textContent='✓ Mettre à jour';
  document.getElementById('plat-feedback').style.display='none';
  renderPlatAlgGrid();
  document.getElementById('plat-overlay').classList.add('open');
}
function closePlat(){document.getElementById('plat-overlay').classList.remove('open');}

function renderPlatAlgGrid(){
  document.getElementById('plat-alg-grid').innerHTML=ALLERGENS_LIST.map(a=>`
    <label class="allergen-check${_platAlgSelected.includes(a.id)?' active':''}" 
           id="palg-${a.id}" onclick="togglePlatAlg('${a.id}')">
      <input type="checkbox" ${_platAlgSelected.includes(a.id)?'checked':''}
             onclick="event.stopPropagation()" onchange="togglePlatAlg('${a.id}')">
      <span class="allergen-check-label">${a.emoji} ${a.label}</span>
    </label>`).join('');
}
function togglePlatAlg(id){
  const idx=_platAlgSelected.indexOf(id);
  if(idx>=0)_platAlgSelected.splice(idx,1);else _platAlgSelected.push(id);
  const el=document.getElementById('palg-'+id);
  if(el)el.classList.toggle('active',_platAlgSelected.includes(id));
}

function submitPlat(){
  const nom=document.getElementById('plat-nom').value.trim();
  const fb=document.getElementById('plat-feedback');
  if(!nom){fb.style.display='block';fb.style.color='var(--pink-text)';fb.textContent='⚠️ Nom obligatoire.';return;}
  const p={
    id:_editPlatId||Date.now(),nom,
    cat:document.getElementById('plat-cat').value,
    traces:document.getElementById('plat-traces').value==='oui',
    allergenes:[..._platAlgSelected],
    updatedAt:new Date().toISOString()
  };
  if(_editPlatId){const idx=PLATS_DATA.findIndex(x=>x.id===_editPlatId);if(idx>=0)PLATS_DATA[idx]=p;}
  else{p.createdAt=new Date().toISOString();PLATS_DATA.push(p);}
  savePlats();
  fb.style.display='block';fb.style.color='var(--green-text)';fb.textContent='✓ Plat enregistré !';
  setTimeout(()=>{closePlat();renderCartAlg();},600);
}
function deletePlat(id){
  if(!confirm('Supprimer ce plat de la carte ?'))return;
  PLATS_DATA=PLATS_DATA.filter(p=>p.id!==id);savePlats();renderCartAlg();
}

const PLAT_CATS={entree:'Entrées',plat:'Plats principaux',dessert:'Desserts',boisson:'Boissons',autre:'Autres'};
const PLAT_CAT_ORDER=['entree','plat','dessert','boisson','autre'];

function renderCartAlg(){
  const el=document.getElementById('carte-alg-list');if(!el)return;
  if(!PLATS_DATA.length){
    el.innerHTML='<div class="histo-empty">Aucun plat.<br>Cliquez sur <b>+ Nouveau plat</b> pour construire votre carte allergènes.<br><br><small style="color:var(--text3)">Obligation légale — Règlement UE 1169/2011</small></div>';
    return;
  }
  // Group by category
  let html='';
  PLAT_CAT_ORDER.forEach(cat=>{
    const plats=PLATS_DATA.filter(p=>p.cat===cat);
    if(!plats.length)return;
    html+=`<div style="font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;padding:12px 0 6px">${PLAT_CATS[cat]}</div>`;
    html+=plats.map(p=>{
      const algs=p.allergenes||[];
      const pillsHtml=algs.length
        ?algs.map(aid=>{const a=ALLERGENS_LIST.find(x=>x.id===aid);return a?`<span class="plat-alg-pill">${a.emoji} ${a.label}</span>`:''}).join('')
        :'<span class="plat-no-alg">✓ Aucun allergène majeur déclaré</span>';
      return`<div class="plat-card">
        <div class="plat-card-header" onclick="togglePlatBody(${p.id})">
          <div>
            <div class="plat-card-title">${p.nom}</div>
            ${p.traces?'<div style="font-size:10px;color:var(--amber-text);margin-top:1px">⚠️ Peut contenir des traces</div>':''}
            <div class="plat-card-pills">${pillsHtml}</div>
          </div>
          <span style="color:var(--text3);font-size:12px;margin-left:8px">▼</span>
        </div>
        <div class="plat-card-body" id="plat-body-${p.id}">
          <div class="plat-alg-grid-display">
            ${ALLERGENS_LIST.map(a=>`<div class="plat-alg-item ${algs.includes(a.id)?'present':'absent'}">
              <span style="font-size:16px">${a.emoji}</span>
              <span>${a.label}</span>
              ${algs.includes(a.id)?'<span style="margin-left:auto;font-size:11px">✓</span>':''}
            </div>`).join('')}
          </div>
          ${p.traces?'<div style="margin-top:8px;padding:6px 10px;background:var(--amber-bg);border-radius:var(--radius);font-size:11px;color:var(--amber-text)">⚠️ Ce plat peut contenir des traces d\'allergènes non listés.</div>':''}
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="dlc-btn-sm" onclick="openEditPlat(${p.id})">✏️ Modifier</button>
            <button class="dlc-btn-sm" style="color:var(--pink-text)" onclick="deletePlat(${p.id})">🗑 Supprimer</button>
          </div>
        </div>
      </div>`;
    }).join('');
  });
  el.innerHTML=html;
}

function togglePlatBody(id){document.getElementById('plat-body-'+id)?.classList.toggle('open');}

function exportCarteAlgPDF(){
  const dateStr=new Date().toLocaleDateString('fr-FR');
  const ALG_COLORS={'gluten':'#8B4513','crustaces':'#FF6347','oeufs':'#DAA520','poisson':'#1E90FF',
    'arachides':'#8B0000','soja':'#556B2F','lait':'#4169E1','fruits_coque':'#A0522D',
    'celeri':'#228B22','moutarde':'#FFD700','sesame':'#D2691E','so2':'#9370DB',
    'lupin':'#FF69B4','mollusques':'#20B2AA'};
  let html=`<html><head><meta charset="UTF-8"><style>
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:11px;color:#1a1a18;margin:0;padding:15mm}
    .header{text-align:center;margin-bottom:20px;border-bottom:3px solid #1a3a5c;padding-bottom:12px}
    h1{font-size:22px;font-weight:900;color:#1a3a5c;margin:0 0 4px}
    .subtitle{font-size:11px;color:#888}
    .legal{font-size:9px;color:#aaa;margin-top:4px}
    .cat-title{font-size:14px;font-weight:900;color:#1a3a5c;text-transform:uppercase;letter-spacing:.1em;margin:20px 0 8px;border-bottom:1px solid #eee;padding-bottom:4px}
    table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:10px}
    th{background:#1a3a5c;color:#fff;padding:6px 8px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
    td{padding:5px 8px;border-bottom:.5px solid #eee;vertical-align:middle}
    tr:nth-child(even)td{background:#f9f9f9}
    .plat-name{font-weight:700;font-size:11px}
    .alg-badge{display:inline-block;border-radius:3px;padding:2px 6px;margin:1px;font-size:9px;font-weight:700;color:#fff}
    .traces{font-size:9px;color:#B8860B;font-style:italic}
    .none-alg{font-size:9px;color:#27500a;font-weight:600}
    .legend{display:flex;flex-wrap:wrap;gap:6px;margin-top:20px;padding-top:12px;border-top:1px solid #eee}
    .legend-item{display:flex;align-items:center;gap:4px;font-size:9px}
    .legend-dot{width:12px;height:12px;border-radius:2px}
    @media print{@page{size:A4;margin:12mm}body{padding:0}}
  
/* ══ ONGLETS SECONDAIRES "PLUS ▾" ════════════════════════ */
.tab-more-btn{font-style:normal;color:var(--info-text)!important;background:var(--info-bg)!important;border-radius:6px;margin:4px 0;flex-shrink:0}
.tab-more-btn.active-more{background:var(--info-text)!important;color:#fff!important}
.tab-more-menu{position:sticky;top:44px;z-index:99;background:var(--bg);border-bottom:.5px solid var(--border);padding:6px 16px;display:flex;flex-wrap:wrap;gap:6px;box-shadow:0 4px 12px rgba(0,0,0,.08)}
.tab-more-item{font-family:var(--font);font-size:13px;font-weight:500;padding:8px 14px;background:var(--bg2);border:.5px solid var(--border);border-radius:20px;color:var(--text2);cursor:pointer;white-space:nowrap;min-height:36px;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.tab-more-item:active,.tab-more-item.active{background:var(--info-bg);color:var(--info-text);border-color:var(--info-text)}
.tab-more-item.active{font-weight:700}


/* Padding bottom global pour tous les panels (footer sticky ~60px) */
.recette-wrap,.trac-wrap,.prix-wrap,.carte-alg-wrap,.dash-wrap,
.dlc-wrap,.histo-wrap,.cmd-wrap,.allergen-wrap,.bilan-wrap,.inv-list,.pieces-wrap{
  padding-bottom:100px!important
}


/* ══ CENTRE D'ENVOI EMAIL ════════════════════════════════ */
.send-overlay{position:fixed;inset:0;z-index:500;display:none}
.send-overlay.open{display:block}
.send-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.5)}
.send-panel{position:absolute;bottom:0;left:0;right:0;background:var(--bg);border-top:.5px solid var(--border2);border-radius:20px 20px 0 0;padding:20px 16px env(safe-area-inset-bottom,16px);z-index:501;box-shadow:0 -8px 40px rgba(0,0,0,.25);max-height:92vh;overflow-y:auto}
@media(min-width:600px){.send-panel{left:50%;right:auto;transform:translateX(-50%);width:560px;border-radius:16px 16px 0 0}}
.send-handle{width:36px;height:4px;background:var(--border2);border-radius:2px;margin:0 auto 16px}
.send-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.send-title{font-size:17px;font-weight:700}
.send-close{background:var(--bg2);border:none;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;color:var(--text2);display:flex;align-items:center;justify-content:center}
/* Destinataires */
.send-field{margin-bottom:12px}
.send-label{font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px;display:block}
.send-input{font-family:var(--font);font-size:16px;padding:10px 12px;border-radius:var(--radius);border:.5px solid var(--border2);background:var(--bg);color:var(--text);width:100%}
.send-input:focus{outline:none;border-color:var(--info-text)}
/* Modules à inclure */
.send-modules-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.send-module-card{border:.5px solid var(--border);border-radius:var(--radius);padding:10px 12px;cursor:pointer;transition:all .15s;position:relative;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
.send-module-card.selected{border-color:var(--info-text);background:var(--info-bg)}
.send-module-card.selected .send-module-check{opacity:1}
.send-module-check{position:absolute;top:8px;right:8px;width:18px;height:18px;border-radius:50%;background:var(--info-text);color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:700;opacity:0;transition:opacity .15s}
.send-module-icon{font-size:20px;margin-bottom:4px}
.send-module-name{font-size:12px;font-weight:600;color:var(--text)}
.send-module-desc{font-size:10px;color:var(--text2);margin-top:2px}
/* Format */
.send-format-row{display:flex;gap:8px;margin-bottom:14px}
.send-format-btn{flex:1;font-family:var(--font);font-size:13px;font-weight:600;padding:9px;border-radius:var(--radius);border:.5px solid var(--border2);background:var(--bg2);color:var(--text2);cursor:pointer;text-align:center;transition:all .15s}
.send-format-btn.active{background:var(--green-bg);color:var(--green-text);border-color:var(--green-text)}
/* Boutons action */
.send-actions{display:flex;gap:8px;margin-top:4px}
.send-btn{flex:1;font-family:var(--font);font-size:14px;font-weight:600;padding:13px;border-radius:var(--radius);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;touch-action:manipulation;min-height:48px}
.send-btn.cancel{background:var(--bg2);color:var(--text2)}
.send-btn.excel{background:var(--green-bg);color:var(--green-text)}
.send-btn.pdf{background:var(--pink-bg);color:var(--pink-text)}
.send-btn.mail{background:var(--info-bg);color:var(--info-text)}
.send-btn:active{opacity:.7}
.send-progress{font-size:12px;color:var(--text2);text-align:center;padding:8px 0;display:none}
.send-feedback{font-size:13px;padding:8px 12px;border-radius:var(--radius);margin-top:8px;display:none}
.send-feedback.ok{display:block;background:var(--green-bg);color:var(--green-text)}
.send-feedback.err{display:block;background:var(--pink-bg);color:var(--pink-text)}
/* Bouton envoi dans le header */
.btn-send{background:var(--purple-bg)!important;color:var(--purple-text)!important;border-color:transparent!important;font-weight:600}

</style></head><body>
  <div class="header">
    <h1>🍽 Étiquettes Allergènes</h1>
    <div class="subtitle">La Salle à Manger · 6 rue Emile Guyemard · 38000 Grenoble</div>
    <div class="legal">Conformément au Règlement UE n°1169/2011 — Édition du ${dateStr}</div>
  </div>`;
  PLAT_CAT_ORDER.forEach(cat=>{
    const plats=PLATS_DATA.filter(p=>p.cat===cat);if(!plats.length)return;
    html+=`<div class="cat-title">${PLAT_CATS[cat]}</div><table>
      <tr><th>Plat</th>${ALLERGENS_LIST.map(a=>`<th style="text-align:center">${a.emoji}</th>`).join('')}<th>Traces</th></tr>`;
    plats.forEach(p=>{
      const algs=p.allergenes||[];
      html+=`<tr><td class="plat-name">${p.nom}</td>`;
      ALLERGENS_LIST.forEach(a=>{
        const has=algs.includes(a.id);
        html+=`<td style="text-align:center;background:${has?ALG_COLORS[a.id]+'22':'transparent'}">
          <span style="color:${has?ALG_COLORS[a.id]:'#ccc'};font-weight:${has?'700':'400'}">${has?'✓':'·'}</span></td>`;
      });
      html+=`<td class="traces">${p.traces?'⚠️ Oui':'—'}</td></tr>`;
    });
    html+='</table>';
  });
  // Légende
  html+=`<div class="legend">${ALLERGENS_LIST.map(a=>`<div class="legend-item"><div class="legend-dot" style="background:${ALG_COLORS[a.id]}"></div>${a.emoji} ${a.label}</div>`).join('')}</div>`;
  html+=`<p style="font-size:8px;color:#aaa;margin-top:12px;text-align:center">Ce document est établi à titre indicatif. En cas de doute, contactez directement l'établissement. Informations mises à jour le ${dateStr}.</p>`;
  html+='</body></html>';
  openHtmlInNewTab(html);
}

function exportCarteAlgExcel(){
  if(typeof XLSX==='undefined'){alert('SheetJS non chargé.');return;}
  const wb=XLSX.utils.book_new();
  const headers=['Plat','Catégorie','Traces',...ALLERGENS_LIST.map(a=>a.emoji+' '+a.label)];
  const rows=[headers,...PLATS_DATA.map(p=>[
    p.nom, PLAT_CATS[p.cat]||p.cat, p.traces?'Oui':'Non',
    ...ALLERGENS_LIST.map(a=>(p.allergenes||[]).includes(a.id)?'✓':'')
  ])];
  const ws=XLSX.utils.aoa_to_sheet(rows);
  ws['!cols']=[{wch:30},{wch:14},{wch:8},...ALLERGENS_LIST.map(()=>({wch:12}))];
  XLSX.utils.book_append_sheet(wb,ws,'Carte allergènes');
  XLSX.writeFile(wb,'Carte_Allergenes_'+new Date().toISOString().slice(0,10)+'.xlsx');
}

// ══════════════════════════════════════════════════════════
// ── RECONNAISSANCE VOCALE WEB SPEECH API ──────────────────







// Suggestions basées sur les produits sans quantité
function buildVoiceSuggestions(){
  const el=document.getElementById('voice-suggestions');if(!el)return;
  const missing=DATA.filter(d=>d.qte===null||d.qte===undefined).slice(0,8);
  if(!missing.length){el.style.display='none';return;}
  el.innerHTML='<div style="font-size:10px;color:var(--text3);width:100%;margin-bottom:2px">⚡ Saisir rapidement :</div>'+
    missing.map(d=>{
      const shortName=d.produit.split(' ').slice(0,3).join(' ');
      return`<button class="voice-chip" onclick="quickFillVoice('${d.code}')" title="${d.produit}">${shortName}</button>`;
    }).join('');
  el.style.display='flex';
  el.style.flexWrap='wrap';
}

function quickFillVoice(code){
  const prod=DATA.find(d=>d.code===code);
  if(prod){
    const inp=document.getElementById('v-input');
    if(inp){inp.value=prod.produit+' ';inp.focus();}
  }
}

function toggleTabMore(btn){
  const m=document.getElementById('tab-more-menu');
  const open=m.style.display!=='none';
  m.style.display=open?'none':'flex';
  btn.classList.toggle('active-more',!open);
}
function switchTabMore(name,btn){
  var hf = document.getElementById('btn-home-float');
  if(hf) hf.classList.add('visible');
  // Fermer le menu
  var moreMenu = document.getElementById('tab-more-menu');
  if(moreMenu) moreMenu.style.display='none';
  document.querySelector('.tab-more-btn')?.classList.remove('active-more');
  // Désactiver tous les onglets principaux et secondaires
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-more-item').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  // Activer le panel
  document.getElementById('panel-'+name)?.classList.add('active');
  if(btn) btn.classList.add('active'); // Guard contre null
  document.querySelector('.tab-more-btn')?.classList.add('active-more');
  // Init du panel
  if(name==='tracabilite')renderTracabilite();
  if(name==='historique')renderHistorique();
  if(name==='prix'){initPrixPanel();setTimeout(renderPrixChart,100);}
  if(name==='carte-allergenes')renderCartAlg();
  if(name==='pieces'){try{const r=localStorage.getItem(PIECES_KEY);PIECES=r?JSON.parse(r):[];}catch(e){PIECES=[];} renderPieces(); detectCameraContext();}
  if(name==='reception-mp'){recLoad();renderReceptions();recRenderCal();}
  if(name==='factures'){
    var caDiv=document.getElementById('panel-factures-ca');
    if(caDiv) caDiv.style.display='block';
    if(window.CaApp && !window.CaApp._initialized){
      window.CaApp.init();
      window.CaApp._initialized=true;
    } else if(window.CaApp){
      window.CaApp.render();
    }
  }
}


// ══════════════════════════════════════════════════════════
// CENTRE D'ENVOI EMAIL — tous modules Excel + PDF
// ══════════════════════════════════════════════════════════

// ── Définition des modules exportables ──
const SEND_MODULES = [
  {
    id:'inventaire', icon:'📦', name:'Inventaire complet',
    desc:'Toutes les références, quantités, montants',
    excel: ()=>buildExcelInventaire(),
    pdf:   ()=>buildPDFInventaire(),
    defaultOn: true,
  },
  {
    id:'bilan', icon:'📊', name:'Bilan par zone',
    desc:'Sous-totaux Boissons / Nourriture / zones',
    excel: ()=>buildExcelBilan(),
    pdf:   ()=>buildPDFBilan(),
    defaultOn: true,
  },
  {
    id:'dlc', icon:'🌡', name:'DLC & Alertes',
    desc:'Dates de péremption, relevés températures',
    excel: ()=>buildExcelDLC(),
    pdf:   ()=>buildPDFDLC(),
    defaultOn: true,
  },
  {
    id:'commande', icon:'🛒', name:'Bon de commande',
    desc:'Produits à commander, totaux par fournisseur',
    excel: ()=>exportCmdExcel(),
    pdf:   ()=>exportCmdPDF(),
    defaultOn: false,
  },
  {
    id:'tracabilite', icon:'📋', name:'Traçabilité',
    desc:'Journal des entrées, sorties, pertes',
    excel: ()=>buildExcelTrac(),
    pdf:   ()=>exportTracPDF(),
    defaultOn: false,
  },
  {
    id:'recettes', icon:'👨‍🍳', name:'Fiches techniques',
    desc:'Recettes, food cost, coût matière',
    excel: ()=>buildExcelRecettes(),
    pdf:   ()=>exportRecettesPDF(),
    defaultOn: false,
  },
  {
    id:'allergenes', icon:'⚠️', name:'Carte allergènes',
    desc:'14 allergènes par produit et par plat',
    excel: ()=>exportCarteAlgExcel(),
    pdf:   ()=>exportCarteAlgPDF(),
    defaultOn: false,
  },
  {
    id:'prix', icon:'💰', name:'Historique prix',
    desc:'Évolution des prix par fournisseur',
    excel: ()=>exportPrixExcel(),
    pdf:   ()=>buildPDFPrix(),
    defaultOn: false,
  },
  {
    id:'factures', icon:'📄', name:'Factures',
    desc:'Toutes les factures du mois',
    excel: ()=>buildExcelFactures(),
    pdf:   ()=>buildPDFFactures(),
    defaultOn: false,
  },
];

let _sendFormat='excel'; // 'excel' | 'pdf' | 'both'
let _sendSelected=new Set(['inventaire','bilan','dlc']);

function openSendCenter(){
  // Remplir le TO avec l'email comptable sauvegardé
  const savedEmail=loadAccountantEmail();
  document.getElementById('send-to').value=savedEmail||'';
  document.getElementById('send-cc').value='';
  // Objet par défaut
  const now=new Date();
  const dateLabel=now.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  document.getElementById('send-subject').value=`Inventaire HACCP — La Salle à Manger — ${dateLabel}`;
  document.getElementById('send-msg').value='Bonjour,\n\nVeuillez trouver ci-joint les documents d\'inventaire HACCP de La Salle à Manger.\n\nCordialement,';
  // Reset format
  _sendFormat='excel';
  document.querySelectorAll('.send-format-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('fmt-excel')?.classList.add('active');
  // Build module cards
  buildSendModuleCards();
  // Reset feedback
  document.getElementById('send-feedback').style.display='none';
  document.getElementById('send-progress').style.display='none';
  document.getElementById('send-overlay').classList.add('open');
}

function closeSendCenter(){
  document.getElementById('send-overlay').classList.remove('open');
}

function buildSendModuleCards(){
  const grid=document.getElementById('send-modules-grid');
  if(!grid)return;
  grid.innerHTML=SEND_MODULES.map(m=>{
    if(m.defaultOn)_sendSelected.add(m.id);
    const sel=_sendSelected.has(m.id);
    return`<div class="send-module-card${sel?' selected':''}" id="smod-${m.id}" onclick="toggleSendModule('${m.id}')">
      <div class="send-module-check">✓</div>
      <div class="send-module-icon">${m.icon}</div>
      <div class="send-module-name">${m.name}</div>
      <div class="send-module-desc">${m.desc}</div>
    </div>`;
  }).join('');
}

function toggleSendModule(id){
  if(_sendSelected.has(id))_sendSelected.delete(id);
  else _sendSelected.add(id);
  const card=document.getElementById('smod-'+id);
  if(card)card.classList.toggle('selected',_sendSelected.has(id));
}

function toggleSendFormat(fmt){
  _sendFormat=fmt;
  document.querySelectorAll('.send-format-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('fmt-'+fmt)?.classList.add('active');
}

async function doSend(action){
  const fb=document.getElementById('send-feedback');
  const prog=document.getElementById('send-progress');
  fb.style.display='none';
  if(_sendSelected.size===0){
    fb.className='send-feedback err';fb.style.display='block';
    fb.textContent='⚠️ Sélectionnez au moins un module.';return;
  }

  const modules=SEND_MODULES.filter(m=>_sendSelected.has(m.id));
  prog.style.display='block';prog.textContent='⏳ Préparation…';

  try{
    if(action==='excel'||action==='both'){
      prog.textContent='📊 Génération Excel…';
      await new Promise(r=>setTimeout(r,50));
      // Un seul classeur Excel avec un onglet par module
      if(typeof XLSX==='undefined')throw new Error('SheetJS non chargé');
      const wb=XLSX.utils.book_new();
      for(const m of modules){
        if(m.excel){
          try{
            const result=m.excel();
            // Si la fonction retourne un workbook partiel, on fusionne
            // Sinon elle génère elle-même son fichier
          }catch(e){console.warn('Excel error for',m.id,e);}
        }
      }
      // Build unified workbook
      buildUnifiedExcel(modules);
    }

    if(action==='pdf'||action==='both'){
      prog.textContent='📄 Génération PDF…';
      await new Promise(r=>setTimeout(r,50));
      buildUnifiedPDF(modules);
    }

    if(action==='mail'){
      prog.textContent='✉️ Ouverture messagerie…';
      await new Promise(r=>setTimeout(r,50));
      const to=document.getElementById('send-to').value.trim();
      const cc=document.getElementById('send-cc').value.trim();
      const subject=document.getElementById('send-subject').value.trim()||'Inventaire HACCP — La Salle à Manger';
      const msg=document.getElementById('send-msg').value.trim();
      const now=new Date();
      const dateLabel=now.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
      // Sauvegarder l'email destinataire
      if(to)saveAccountantEmail(to);
      // Construire le body de l'email avec le résumé
      const body=buildEmailBody(modules,msg,dateLabel);
      const url='mailto:'+encodeURIComponent(to)+
        (cc?'?cc='+encodeURIComponent(cc)+'&':'?')+
        'subject='+encodeURIComponent(subject)+
        '&body='+encodeURIComponent(body);
      // Ouvrir la messagerie
      window.location.href=url;
      // Aussi télécharger les fichiers pour les joindre manuellement
      prog.textContent='📊 Téléchargement des pièces jointes…';
      await new Promise(r=>setTimeout(r,300));
      buildUnifiedExcel(modules);
      fb.className='send-feedback ok';fb.style.display='block';
      fb.innerHTML='✓ Brouillon email ouvert + fichier Excel téléchargé.<br><small>Joignez le fichier .xlsx depuis vos téléchargements.</small>';
    }

    prog.style.display='none';
    if(action!=='mail'){
      fb.className='send-feedback ok';fb.style.display='block';
      fb.textContent=action==='excel'?'✓ Fichier Excel téléchargé':action==='pdf'?'✓ PDF ouvert pour impression':'✓ Excel + PDF générés';
    }
  }catch(e){
    prog.style.display='none';
    fb.className='send-feedback err';fb.style.display='block';
    fb.textContent='❌ Erreur : '+e.message;
    console.error(e);
  }
}

// ── Classeur Excel unifié ──
function buildUnifiedExcel(modules){
  if(typeof XLSX==='undefined')throw new Error('SheetJS non chargé');
  const wb=XLSX.utils.book_new();
  const now=new Date();
  const dateStr=now.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  const stamp=now.toISOString().slice(0,10);
  const BEV=['BOISSONS','CAFETERIE'];

  // Couleurs
  const C={HD:'FF1A3A5C',HM:'FF2E6DAF',WHITE:'FFFFFFFF',DARK:'FF1A1A18',
            ALT:'FFF0F6FF',GREY:'FF6B6B68',BLUE:'FF0C447C',GREEN:'FF27500A',
            AMBER:'FF633806',PINK:'FF72243e',RED:'FFCC0000',TOT:'FF1A3A5C'};
  
  
  
  
  

  modules.forEach(mod=>{
    try{
      let ws=null, sheetName=mod.name.slice(0,28);

      if(mod.id==='inventaire'){
        const COLS=['Code','Produit','Zone','Unité','Prix HT (€)','Quantité','Montant HT (€)','Fournisseur','Statut'];
        const nc=COLS.length;
        const rows=DATA.map(d=>{const m=mont(d);return[d.code,d.produit||'',(ZONES[d.zone]||{label:d.zone}).label,d.unite||'',d.prix||0,d.qte!=null?d.qte:'',m!=null?Math.round(m*100)/100:'',d.fournisseur||'',d.status==='new'?'Nouveau':d.status==='updated'?'Prix MAJ':d.status==='custom'?'Ajouté':''];});
        const gt=DATA.reduce((s,d)=>s+(mont(d)||0),0);
        ws=XLSX.utils.aoa_to_sheet([['INVENTAIRE HACCP — La Salle à Manger · Grenoble',...Array(nc-1).fill('')],['Édition du '+dateStr,...Array(nc-1).fill('')],[],COLS,...rows,[],['TOTAL GÉNÉRAL','','','','',DATA.length,Math.round(gt*100)/100,'','']]);
        ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:nc-1}},{s:{r:1,c:0},e:{r:1,c:nc-1}}];
        ws['A1'].s={font:{bold:true,color:{argb:C.WHITE},sz:13,name:'Arial'},fill:fl(C.HD),alignment:al('left')};
        styleHdr(ws,3,nc,C.HD);
        rows.forEach((_,i)=>styleRow(ws,4+i,nc,i%2===0?'FFFFFFFF':C.ALT));
        const totR=4+rows.length+1;styleRow(ws,totR,nc,C.TOT,{bold:true,fg:C.WHITE});
        ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:3,c:0},e:{r:3+rows.length,c:nc-1}})};
        ws['!cols']=[{wch:8},{wch:36},{wch:14},{wch:8},{wch:12},{wch:10},{wch:14},{wch:16},{wch:10}];
      }

      else if(mod.id==='bilan'){
        const byZone={};
        const synth={bev:{total:0,refs:0,manq:0},nour:{total:0,refs:0,manq:0}};
        DATA.forEach(d=>{
          if(!byZone[d.zone])byZone[d.zone]={total:0,refs:0,manq:0};
          const m=mont(d)||0; const hasQ=d.qte!=null;
          byZone[d.zone].total+=m;byZone[d.zone].refs++;if(!hasQ)byZone[d.zone].manq++;
          const key=BEV.includes(d.zone)?'bev':'nour';
          synth[key].total+=m;synth[key].refs++;if(!hasQ)synth[key].manq++;
        });
        const gt=DATA.reduce((s,d)=>s+(mont(d)||0),0);
        const zEntries=Object.entries(byZone).sort((a,b)=>b[1].total-a[1].total);
        const aoa=[['BILAN PAR ZONE — La Salle à Manger · Grenoble','','','',''],['Édition du '+dateStr,'','','',''],[''],
          ['Zone','Libellé HACCP','Références','Sans quantité','Valeur HT (€)'],
          ...zEntries.map(([z,v])=>[z,(ZONES[z]||{htext:'Divers'}).htext,v.refs,v.manq,Math.round(v.total*100)/100]),
          ['TOTAL','',DATA.length,DATA.filter(d=>d.qte==null).length,Math.round(gt*100)/100],[''],
          ['SYNTHÈSE','','','',''],['Catégorie','','Références','Sans quantité','Valeur HT (€)'],
          ['Boissons & Café','',synth.bev.refs,synth.bev.manq,Math.round(synth.bev.total*100)/100],
          ['Nourriture','',synth.nour.refs,synth.nour.manq,Math.round(synth.nour.total*100)/100],
          ['TOTAL','',DATA.length,DATA.filter(d=>d.qte==null).length,Math.round(gt*100)/100],
        ];
        ws=XLSX.utils.aoa_to_sheet(aoa);
        ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:4}},{s:{r:1,c:0},e:{r:1,c:4}}];
        if(ws['A1'])ws['A1'].s={font:{bold:true,color:{argb:C.WHITE},sz:13,name:'Arial'},fill:fl(C.HD),alignment:al('left')};
        styleHdr(ws,3,5,C.HD);
        zEntries.forEach((_,i)=>styleRow(ws,4+i,5,i%2===0?'FFFFFFFF':C.ALT));
        styleRow(ws,4+zEntries.length,5,C.TOT,{bold:true,fg:C.WHITE});
        const sr=4+zEntries.length+2;
        styleHdr(ws,sr+1,5,C.HM||C.HD);
        styleRow(ws,sr+2,5,'FFFAEEDA');styleRow(ws,sr+3,5,'FFEAF3DE');
        styleRow(ws,sr+4,5,C.TOT,{bold:true,fg:C.WHITE});
        ws['!cols']=[{wch:16},{wch:16},{wch:14},{wch:16},{wch:16}];
      }

      else if(mod.id==='dlc'){
        const COLS=['Produit','Type','Date limite','Jours restants','Lot','Quantité','Note','Statut'];
        const rows=DLC_DATA.map(d=>{
          const days=dlcDaysLeft(d.date);
          const status=days<0?'EXPIRÉ':days<=2?'URGENT':days<=7?'Bientôt':'OK';
          return[d.produit,d.type,new Date(d.date).toLocaleDateString('fr-FR'),days,d.lot||'',d.qte||'',d.note||'',status];
        });
        ws=XLSX.utils.aoa_to_sheet([['DLC / DATES DE PÉREMPTION — La Salle à Manger',...Array(7).fill('')],['Édition du '+dateStr,...Array(7).fill('')],[],COLS,...rows]);
        ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:7}},{s:{r:1,c:0},e:{r:1,c:7}}];
        if(ws['A1'])ws['A1'].s={font:{bold:true,color:{argb:C.WHITE},sz:13,name:'Arial'},fill:fl(C.HD),alignment:al('left')};
        styleHdr(ws,3,8,C.HD);
        rows.forEach((r,i)=>{
          const bg=r[7]==='EXPIRÉ'?'FFFFDDDD':r[7]==='URGENT'?'FFFFEEDD':r[7]==='Bientôt'?'FFFFFACC':i%2===0?'FFFFFFFF':C.ALT;
          styleRow(ws,4+i,8,bg);
        });
        ws['!cols']=[{wch:30},{wch:8},{wch:14},{wch:14},{wch:14},{wch:10},{wch:20},{wch:10}];
      }

      else if(mod.id==='tracabilite'){
        const COLS=['Date/Heure','Type','Produit','Quantité','Unité','Responsable','Note'];
        const rows=TRAC_DATA.map(t=>[
          new Date(t.date).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}),
          {entree:'Entrée',sortie:'Sortie',perte:'Perte',transfert:'Transfert'}[t.type]||t.type,
          t.produit,t.qte,t.unite||'',t.resp||'',t.note||''
        ]);
        ws=XLSX.utils.aoa_to_sheet([['JOURNAL DE TRAÇABILITÉ — La Salle à Manger',...Array(6).fill('')],['Édition du '+dateStr,...Array(6).fill('')],[],COLS,...rows]);
        ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:6}},{s:{r:1,c:0},e:{r:1,c:6}}];
        if(ws['A1'])ws['A1'].s={font:{bold:true,color:{argb:C.WHITE},sz:13,name:'Arial'},fill:fl(C.HD),alignment:al('left')};
        styleHdr(ws,3,7,C.HD);
        rows.forEach((_,i)=>styleRow(ws,4+i,7,i%2===0?'FFFFFFFF':C.ALT));
        ws['!cols']=[{wch:16},{wch:10},{wch:30},{wch:10},{wch:8},{wch:16},{wch:24}];
      }

      else if(mod.id==='recettes'){
        const COLS=['Recette','Catégorie','Couverts','Coût total (€)','Coût/couvert (€)','Prix vente HT (€)','Food cost (%)'];
        const rows=RECETTES_DATA.map(r=>{
          const cout=calcRecetteCout(r);
          const fc=r.prixVente>0?Math.round(cout/(r.prixVente*r.couverts)*100):null;
          return[r.nom,{entree:'Entrée',plat:'Plat',dessert:'Dessert',autre:'Autre'}[r.cat]||r.cat,r.couverts,Math.round(cout*100)/100,Math.round(cout/r.couverts*100)/100,r.prixVente||'',fc!=null?fc+'%':'—'];
        });
        ws=XLSX.utils.aoa_to_sheet([['FICHES TECHNIQUES — La Salle à Manger',...Array(6).fill('')],['Édition du '+dateStr,...Array(6).fill('')],[],COLS,...rows]);
        ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:6}},{s:{r:1,c:0},e:{r:1,c:6}}];
        if(ws['A1'])ws['A1'].s={font:{bold:true,color:{argb:C.WHITE},sz:13,name:'Arial'},fill:fl(C.HD),alignment:al('left')};
        styleHdr(ws,3,7,C.HD);
        rows.forEach((_,i)=>styleRow(ws,4+i,7,i%2===0?'FFFFFFFF':C.ALT));
        ws['!cols']=[{wch:28},{wch:10},{wch:10},{wch:14},{wch:16},{wch:16},{wch:12}];
      }

      else if(mod.id==='allergenes'){
        const COLS=['Code','Produit','Zone',...ALLERGENS_LIST.map(a=>a.emoji+' '+a.label)];
        const rows=DATA.map(d=>[d.code,d.produit||'',(ZONES[d.zone]||{label:d.zone}).label,...ALLERGENS_LIST.map(a=>(ALLERGEN_DATA[d.code]||[]).includes(a.id)?'✓':'')]);
        ws=XLSX.utils.aoa_to_sheet([['ALLERGÈNES PAR PRODUIT — La Salle à Manger',...Array(COLS.length-1).fill('')],['Édition du '+dateStr,...Array(COLS.length-1).fill('')],[],COLS,...rows]);
        ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:COLS.length-1}},{s:{r:1,c:0},e:{r:1,c:COLS.length-1}}];
        if(ws['A1'])ws['A1'].s={font:{bold:true,color:{argb:C.WHITE},sz:13,name:'Arial'},fill:fl(C.HD),alignment:al('left')};
        styleHdr(ws,3,COLS.length,C.HD);
        rows.forEach((_,i)=>styleRow(ws,4+i,COLS.length,i%2===0?'FFFFFFFF':C.ALT));
        ws['!cols']=[{wch:8},{wch:30},{wch:14},...ALLERGENS_LIST.map(()=>({wch:12}))];
      }

      else if(mod.id==='prix'){
        const rows2=[['Code','Produit','Fournisseur actuel','Prix actuel (€)','Prix min (€)','Prix max (€)','Relevés']];
        DATA.forEach(d=>{
          const h=PRIX_HISTO_DATA[d.code]||[];
          const prices=[...(d.prix?[d.prix]:[]),...h.map(p=>p.prix)].filter(Boolean);
          if(!prices.length)return;
          rows2.push([d.code,d.produit||'',d.fournisseur||'',d.prix||'',Math.min(...prices),Math.max(...prices),h.length]);
        });
        ws=XLSX.utils.aoa_to_sheet([['COMPARATEUR PRIX — La Salle à Manger',...Array(6).fill('')],['Édition du '+dateStr,...Array(6).fill('')],[],rows2[0],...rows2.slice(1)]);
        ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:6}},{s:{r:1,c:0},e:{r:1,c:6}}];
        if(ws['A1'])ws['A1'].s={font:{bold:true,color:{argb:C.WHITE},sz:13,name:'Arial'},fill:fl(C.HD),alignment:al('left')};
        styleHdr(ws,3,7,C.HD);
        rows2.slice(1).forEach((_,i)=>styleRow(ws,4+i,7,i%2===0?'FFFFFFFF':C.ALT));
        ws['!cols']=[{wch:8},{wch:34},{wch:16},{wch:14},{wch:12},{wch:12},{wch:10}];
      }

      else if(mod.id==='factures'){
        const COLS=['Fournisseur','N° Facture','Date','Désignation','Qté','Unité','Prix HT','Montant HT (€)'];
        const rows3=[];
        INVOICES.forEach(inv=>{
          inv.items.forEach(it=>rows3.push([inv.fournisseur,inv.id,inv.date,it.p,it.q,it.u,it.px,Math.round(it.q*it.px*100)/100]));
          rows3.push(['SOUS-TOTAL '+inv.fournisseur,'','','','','','',Math.round(inv.total*100)/100]);rows3.push([]);
        });
        const gtInv=INVOICES.reduce((s,i)=>s+i.total,0);
        rows3.push(['TOTAL GÉNÉRAL','','','','','','',Math.round(gtInv*100)/100]);
        ws=XLSX.utils.aoa_to_sheet([['FACTURES — La Salle à Manger',...Array(7).fill('')],['Édition du '+dateStr,...Array(7).fill('')],[],COLS,...rows3]);
        ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:7}},{s:{r:1,c:0},e:{r:1,c:7}}];
        if(ws['A1'])ws['A1'].s={font:{bold:true,color:{argb:C.WHITE},sz:13,name:'Arial'},fill:fl(C.HD),alignment:al('left')};
        styleHdr(ws,3,8,C.HD);
        rows3.forEach((_,i)=>styleRow(ws,4+i,8,i%2===0?'FFFFFFFF':C.ALT));
        ws['!cols']=[{wch:14},{wch:20},{wch:12},{wch:38},{wch:8},{wch:8},{wch:12},{wch:14}];
      }

      else if(mod.id==='commande'){
        // Utilise les données CMD_DATA existantes
        const COLS=['Code','Produit','Fournisseur','Unité','Qté à commander','Prix HT (€)','Montant HT (€)'];
        const rows=CMD_DATA.map(c=>[c.code,c.produit,c.fournisseur||'',c.unite||'',c.qteCmd,c.prix,Math.round(c.qteCmd*c.prix*100)/100]);
        const tot=CMD_DATA.reduce((s,c)=>s+c.qteCmd*c.prix,0);
        ws=XLSX.utils.aoa_to_sheet([['BON DE COMMANDE — La Salle à Manger',...Array(6).fill('')],['Édition du '+dateStr,...Array(6).fill('')],[],COLS,...rows,[],['TOTAL','','','','','',Math.round(tot*100)/100]]);
        ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:6}},{s:{r:1,c:0},e:{r:1,c:6}}];
        if(ws['A1'])ws['A1'].s={font:{bold:true,color:{argb:C.WHITE},sz:13,name:'Arial'},fill:fl(C.HD),alignment:al('left')};
        styleHdr(ws,3,7,C.HD);
        rows.forEach((_,i)=>styleRow(ws,4+i,7,i%2===0?'FFFFFFFF':C.ALT));
        ws['!cols']=[{wch:8},{wch:34},{wch:16},{wch:8},{wch:16},{wch:12},{wch:14}];
      }

      if(ws){
        const sn=sheetName.replace(/[:\\/\[\]*?]/g,'').slice(0,28);
        XLSX.utils.book_append_sheet(wb,ws,sn);
      }
    }catch(e){console.warn('Onglet ignoré:',mod.id,e);}
  });

  const stamp2=new Date().toISOString().slice(0,10);
  XLSX.writeFile(wb,'HACCP_LSM_'+stamp2+'.xlsx',{bookType:'xlsx',type:'binary',cellStyles:true});
}

// ── PDF unifié ──
function buildUnifiedPDF(modules){
  const dateStr=new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  let html=`<html><head><meta charset="UTF-8"><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:10px;color:#1a1a18;margin:0;padding:10mm}
    .page-break{page-break-before:always;padding-top:10mm}
    h1{font-size:18px;font-weight:900;color:#1a3a5c;margin:0 0 2px}
    h2{font-size:13px;color:#1a3a5c;margin:12px 0 6px;border-bottom:1px solid #1a3a5c;padding-bottom:3px}
    .meta{font-size:9px;color:#888;margin-bottom:10px}
    table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:9px}
    th{background:#1a3a5c;color:#fff;padding:4px 6px;text-align:left;font-weight:700}
    td{padding:3px 6px;border-bottom:.5px solid #eee}
    tr:nth-child(even)td{background:#f5f5f5}
    .total td{background:#1a3a5c!important;color:#fff;font-weight:700}
    .alert td{background:#fff0f0!important}
    .ok td{background:#f0fff0!important}
    .summary{display:flex;gap:12px;margin-bottom:10px;flex-wrap:wrap}
    .sum-box{border:1px solid #ccc;border-radius:4px;padding:8px 12px;min-width:120px}
    .sum-label{font-size:8px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:3px}
    .sum-val{font-size:16px;font-weight:800;color:#1a3a5c}
    @media print{@page{size:A4;margin:10mm}body{padding:0}.page-break{page-break-before:always}}
  
/* Touch action globale pour tous les éléments cliquables */
button,a,[onclick]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
</style></head><body>`;

  html+=`<h1>📋 Rapport HACCP — La Salle à Manger · Grenoble</h1>
  <div class="meta">Édition du ${dateStr} · ${modules.length} module${modules.length>1?'s':''} inclus</div>`;

  modules.forEach((mod,idx)=>{
    if(idx>0)html+=`<div class="page-break">`;
    html+=`<h2>${mod.icon} ${mod.name}</h2>`;

    if(mod.id==='inventaire'){
      const gt=DATA.reduce((s,d)=>s+(mont(d)||0),0);
      const saisies=DATA.filter(d=>d.qte!=null).length;
      html+=`<div class="summary">
        <div class="sum-box"><div class="sum-label">Valeur totale HT</div><div class="sum-val">${gt.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}</div></div>
        <div class="sum-box"><div class="sum-label">Références</div><div class="sum-val">${DATA.length}</div></div>
        <div class="sum-box"><div class="sum-label">Saisies</div><div class="sum-val">${saisies}/${DATA.length}</div></div>
      </div>`;
      html+=`<table><tr><th>Code</th><th>Produit</th><th>Zone</th><th>Qté</th><th>Unité</th><th>Prix HT</th><th>Montant HT</th></tr>`;
      DATA.forEach(d=>{const m=mont(d);html+=`<tr><td>${d.code}</td><td>${d.produit}</td><td>${(ZONES[d.zone]||{label:d.zone}).label}</td><td>${d.qte!=null?d.qte:'—'}</td><td>${d.unite||''}</td><td>${(d.prix||0).toFixed(2)}€</td><td style="font-weight:600">${m!=null?m.toFixed(2)+'€':'—'}</td></tr>`;});
      html+=`<tr class="total"><td colspan="6">TOTAL</td><td>${gt.toFixed(2)}€</td></tr></table>`;
    }

    else if(mod.id==='bilan'){
      const BEV=['BOISSONS','CAFETERIE'];
      const byZone={};let bev=0,nour=0;
      DATA.forEach(d=>{if(!byZone[d.zone])byZone[d.zone]={total:0,refs:0};const m=mont(d)||0;byZone[d.zone].total+=m;byZone[d.zone].refs++;BEV.includes(d.zone)?bev+=m:nour+=m;});
      const gt=bev+nour;
      html+=`<div class="summary">
        <div class="sum-box"><div class="sum-label">Total stock</div><div class="sum-val">${gt.toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0})}</div></div>
        <div class="sum-box"><div class="sum-label">🥤 Boissons</div><div class="sum-val" style="color:#633806">${bev.toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0})}</div></div>
        <div class="sum-box"><div class="sum-label">🍴 Nourriture</div><div class="sum-val" style="color:#27500a">${nour.toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0})}</div></div>
      </div>`;
      html+=`<table><tr><th>Zone</th><th>Libellé</th><th>Références</th><th>Valeur HT</th><th>% du total</th></tr>`;
      Object.entries(byZone).sort((a,b)=>b[1].total-a[1].total).forEach(([z,v])=>{
        html+=`<tr><td>${z}</td><td>${(ZONES[z]||{htext:'Divers'}).htext}</td><td>${v.refs}</td><td style="font-weight:600">${v.total.toFixed(2)}€</td><td>${gt>0?Math.round(v.total/gt*100):0}%</td></tr>`;
      });
      html+=`<tr class="total"><td colspan="3">TOTAL</td><td>${gt.toFixed(2)}€</td><td>100%</td></tr></table>`;
    }

    else if(mod.id==='dlc'){
      const expired=DLC_DATA.filter(d=>dlcDaysLeft(d.date)<0);
      const urgent=DLC_DATA.filter(d=>{const n=dlcDaysLeft(d.date);return n>=0&&n<=2;});
      const soon=DLC_DATA.filter(d=>{const n=dlcDaysLeft(d.date);return n>2&&n<=7;});
      html+=`<div class="summary">
        <div class="sum-box"><div class="sum-label">🔴 Expirés</div><div class="sum-val" style="color:#cc0000">${expired.length}</div></div>
        <div class="sum-box"><div class="sum-label">🟠 Urgents &lt;48h</div><div class="sum-val" style="color:#e65100">${urgent.length}</div></div>
        <div class="sum-box"><div class="sum-label">🟡 Bientôt &lt;7j</div><div class="sum-val" style="color:#633806">${soon.length}</div></div>
        <div class="sum-box"><div class="sum-label">Total DLC</div><div class="sum-val">${DLC_DATA.length}</div></div>
      </div>`;
      html+=`<table><tr><th>Produit</th><th>Type</th><th>Date limite</th><th>Jours restants</th><th>Statut</th></tr>`;
      [...DLC_DATA].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(d=>{
        const days=dlcDaysLeft(d.date);
        const cl=days<0?'alert':days<=7?'alert':'';
        html+=`<tr class="${cl}"><td>${d.produit}</td><td>${d.type}</td><td>${new Date(d.date).toLocaleDateString('fr-FR')}</td><td style="font-weight:600;color:${days<0?'#cc0000':days<=2?'#e65100':days<=7?'#633806':'#27500a'}">${days<0?'EXPIRÉ':days+'j'}</td><td>${days<0?'⛔ Retirer':days<=2?'🚨 Urgent':days<=7?'⚠️ Surveiller':'✅ OK'}</td></tr>`;
      });
      html+=`</table>`;
      // Températures
      if(TEMP_DATA.length){
        const last=TEMP_DATA[TEMP_DATA.length-1];
        html+=`<h2 style="margin-top:10px">🌡 Dernier relevé de températures</h2>`;
        html+=`<div class="meta">${new Date(last.date).toLocaleString('fr-FR')}</div>`;
        html+=`<table><tr><th>Zone</th><th>Température</th><th>Seuil</th><th>Statut</th></tr>`;
        TEMP_ZONES.forEach(z=>{
          const v=last.releves[z.id];if(v==null)return;
          const ok=v>=z.min&&v<=z.max;
          html+=`<tr class="${ok?'ok':'alert'}"><td>${z.label}</td><td style="font-weight:700;color:${ok?'#27500a':'#cc0000'}">${v}${z.unit}</td><td>${z.min}/${z.max}${z.unit}</td><td>${ok?'✅ OK':'⚠️ HORS SEUIL'}</td></tr>`;
        });
        html+=`</table>`;
      }
    }

    else if(mod.id==='commande'){
      const tot=CMD_DATA.reduce((s,c)=>s+c.qteCmd*c.prix,0);
      html+=`<div class="summary"><div class="sum-box"><div class="sum-label">Total commande</div><div class="sum-val">${tot.toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0})}</div></div><div class="sum-box"><div class="sum-label">Lignes</div><div class="sum-val">${CMD_DATA.length}</div></div></div>`;
      html+=`<table><tr><th>Code</th><th>Produit</th><th>Fournisseur</th><th>Qté</th><th>Unité</th><th>Prix HT</th><th>Montant HT</th></tr>`;
      CMD_DATA.forEach(c=>html+=`<tr><td>${c.code}</td><td>${c.produit}</td><td>${c.fournisseur||'—'}</td><td>${c.qteCmd}</td><td>${c.unite||''}</td><td>${c.prix.toFixed(2)}€</td><td style="font-weight:600">${(c.qteCmd*c.prix).toFixed(2)}€</td></tr>`);
      html+=`<tr class="total"><td colspan="6">TOTAL</td><td>${tot.toFixed(2)}€</td></tr></table>`;
    }

    else if(mod.id==='tracabilite'){
      const today=new Date().toISOString().slice(0,10);
      const todayOps=TRAC_DATA.filter(t=>t.date.slice(0,10)===today);
      html+=`<div class="summary"><div class="sum-box"><div class="sum-label">Opérations aujourd'hui</div><div class="sum-val">${todayOps.length}</div></div><div class="sum-box"><div class="sum-label">Total historique</div><div class="sum-val">${TRAC_DATA.length}</div></div></div>`;
      html+=`<table><tr><th>Date/Heure</th><th>Type</th><th>Produit</th><th>Qté</th><th>Responsable</th><th>Note</th></tr>`;
      TRAC_DATA.slice(0,50).forEach(t=>html+=`<tr><td>${new Date(t.date).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</td><td>${{entree:'📥 Entrée',sortie:'📤 Sortie',perte:'🗑 Perte',transfert:'↔ Transfert'}[t.type]||t.type}</td><td>${t.produit}</td><td>${t.type==='entree'?'+':'-'}${t.qte} ${t.unite||''}</td><td>${t.resp||'—'}</td><td>${t.note||'—'}</td></tr>`);
      if(TRAC_DATA.length>50)html+=`<tr><td colspan="6" style="text-align:center;color:#888">... et ${TRAC_DATA.length-50} autres opérations</td></tr>`;
      html+=`</table>`;
    }

    else if(mod.id==='recettes'){
      RECETTES_DATA.forEach(r=>{
        const cout=calcRecetteCout(r);
        const fc=r.prixVente>0?Math.round(cout/(r.prixVente*r.couverts)*100):null;
        html+=`<h2 style="font-size:11px;margin-top:8px">${r.nom} <span style="font-weight:400;color:#888">(${r.couverts} couverts)</span></h2>`;
        html+=`<table><tr><th>Ingrédient</th><th>Qté</th><th>Unité</th><th>Prix HT</th><th>Coût</th></tr>`;
        r.ingredients.forEach(ing=>{const ri=resolveIngredient(ing);const prixCell=ri.hasPrice?ri.prixU.toFixed(2)+'€/'+ri.uniteCatalogue:(ri.needsManualConversion?'conversion manuelle requise':'prix à renseigner');const coutCell=ri.hasPrice?ri.cout.toFixed(2)+'€':'—';html+=`<tr><td>${ri.nom}</td><td>${ing.qte}</td><td>${ri.uniteRecette}</td><td>${prixCell}</td><td>${coutCell}</td></tr>`;});
        html+=`<tr class="total"><td colspan="4">Coût total · Food cost${fc!=null?' : '+fc+'%':''}</td><td>${cout.toFixed(2)}€</td></tr></table>`;
      });
    }

    else if(mod.id==='allergenes'){
      html+=`<table><tr><th>Produit</th>${ALLERGENS_LIST.map(a=>`<th style="text-align:center;font-size:8px">${a.emoji}</th>`).join('')}</tr>`;
      DATA.slice(0,80).forEach(d=>{
        const algs=ALLERGEN_DATA[d.code]||[];
        html+=`<tr><td style="font-size:9px">${d.produit}</td>${ALLERGENS_LIST.map(a=>`<td style="text-align:center;background:${algs.includes(a.id)?'#fbeaf0':'transparent'};color:${algs.includes(a.id)?'#72243e':'#ccc'}">${algs.includes(a.id)?'✓':'·'}</td>`).join('')}</tr>`;
      });
      html+=`</table>`;
    }

    else if(mod.id==='prix'){
      html+=`<table><tr><th>Produit</th><th>Fournisseur actuel</th><th>Prix actuel</th><th>Prix min</th><th>Prix max</th><th>Relevés</th></tr>`;
      DATA.filter(d=>PRIX_HISTO_DATA[d.code]?.length>0||d.prix).slice(0,60).forEach(d=>{
        const h=PRIX_HISTO_DATA[d.code]||[];
        const prices=[...(d.prix?[d.prix]:[]),...h.map(p=>p.prix)].filter(Boolean);
        html+=`<tr><td>${d.produit}</td><td>${d.fournisseur||'—'}</td><td style="font-weight:600">${d.prix?.toFixed(3)||'—'}€</td><td style="color:#27500a">${prices.length?Math.min(...prices).toFixed(3)+'€':'—'}</td><td style="color:#cc0000">${prices.length?Math.max(...prices).toFixed(3)+'€':'—'}</td><td>${h.length}</td></tr>`;
      });
      html+=`</table>`;
    }

    else if(mod.id==='factures'){
      const tot=INVOICES.reduce((s,i)=>s+i.total,0);
      html+=`<div class="summary"><div class="sum-box"><div class="sum-label">Total factures</div><div class="sum-val">${tot.toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0})}</div></div><div class="sum-box"><div class="sum-label">Factures</div><div class="sum-val">${INVOICES.length}</div></div></div>`;
      INVOICES.forEach(inv=>{
        html+=`<p style="font-weight:700;font-size:11px;margin:8px 0 3px">${inv.fournisseur} — ${inv.date} — ${inv.total.toFixed(2)}€</p>`;
        html+=`<table><tr><th>Désignation</th><th>Qté</th><th>Unité</th><th>Prix HT</th><th>Montant HT</th></tr>`;
        inv.items.forEach(it=>html+=`<tr><td>${it.p}</td><td>${it.q}</td><td>${it.u}</td><td>${it.px.toFixed(2)}€</td><td>${(it.q*it.px).toFixed(2)}€</td></tr>`);
        html+=`<tr class="total"><td colspan="4">TOTAL ${inv.fournisseur}</td><td>${inv.total.toFixed(2)}€</td></tr></table>`;
      });
    }

    if(idx>0)html+=`</div>`;
  });

  html+=`<div style="font-size:8px;color:#aaa;text-align:center;margin-top:16px;border-top:1px solid #eee;padding-top:8px">La Salle à Manger · 6 rue Emile Guyemard · 38000 Grenoble · Document généré automatiquement le ${dateStr}</div>`;
  html+=`</body></html>`;
  openHtmlInNewTab(html);
}

// ── Corps d'email avec résumé ──
function buildEmailBody(modules, customMsg, dateLabel){
  const gt=DATA.reduce((s,d)=>s+(mont(d)||0),0);
  const dlcAlert=DLC_DATA.filter(d=>dlcDaysLeft(d.date)<=2).length;
  const stockBas=DATA.filter(d=>{const s=SEUILS_DATA[d.code];return s&&s.min!=null&&(d.qte==null||d.qte<s.min);}).length;

  let body=customMsg?customMsg+'\n\n':'';
  body+=`=== RÉSUMÉ INVENTAIRE HACCP — ${dateLabel} ===\n`;
  body+=`La Salle à Manger · 6 rue Emile Guyemard · 38000 Grenoble\n\n`;
  body+=`📦 STOCK\n`;
  body+=`• Valeur totale HT : ${gt.toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}\n`;
  body+=`• Références : ${DATA.length} (${DATA.filter(d=>d.qte!=null).length} saisies)\n\n`;
  if(dlcAlert>0)body+=`⚠️ ALERTES DLC : ${dlcAlert} produit${dlcAlert>1?'s':''} expiré${dlcAlert>1?'s':''} ou urgent${dlcAlert>1?'s':''}\n`;
  if(stockBas>0)body+=`⬇️ STOCK BAS : ${stockBas} produit${stockBas>1?'s':''} sous le seuil minimum\n`;
  if(dlcAlert>0||stockBas>0)body+='\n';
  if(RECETTES_DATA.length){
    const recFC=RECETTES_DATA.filter(r=>r.prixVente>0);
    if(recFC.length){const fc=Math.round(recFC.reduce((s,r)=>s+calcRecetteCout(r)/(r.prixVente*r.couverts)*100,0)/recFC.length);body+=`👨‍🍳 FOOD COST MOYEN : ${fc}% (cible : 25-32%)\n\n`;}
  }
  body+=`Modules inclus : ${modules.map(m=>m.name).join(' · ')}\n`;
  body+=`\nFichier Excel joint à cet email.`;
  return body;
}

// Stubs pour les PDF simples des modules déjà gérés par leurs fonctions natives
function buildPDFInventaire(){buildUnifiedPDF([SEND_MODULES.find(m=>m.id==='inventaire')]);}
function buildPDFBilan(){buildUnifiedPDF([SEND_MODULES.find(m=>m.id==='bilan')]);}
function buildPDFDLC(){buildUnifiedPDF([SEND_MODULES.find(m=>m.id==='dlc')]);}
function buildPDFPrix(){buildUnifiedPDF([SEND_MODULES.find(m=>m.id==='prix')]);}
function buildPDFFactures(){buildUnifiedPDF([SEND_MODULES.find(m=>m.id==='factures')]);}
function buildExcelInventaire(){/* handled in buildUnifiedExcel */}
function buildExcelBilan(){/* handled in buildUnifiedExcel */}
function buildExcelDLC(){/* handled in buildUnifiedExcel */}
function buildExcelTrac(){/* handled in buildUnifiedExcel */}
function buildExcelRecettes(){/* handled in buildUnifiedExcel */}
function buildExcelFactures(){/* handled in buildUnifiedExcel */}


function openHtmlInNewTab(html, autoPrint=true, delay=600){
  // Compatible Chrome/Android : Blob URL instead of document.write
  try {
    const blob = new Blob([html], {type: 'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if(win) {
      if(autoPrint) setTimeout(()=>{win.print();setTimeout(()=>URL.revokeObjectURL(url),2000);}, delay);
    } else {
      // Popup blocked fallback: download as HTML file
      const a = document.createElement('a');
      a.href = url; a.download = 'rapport_haccp.html'; a.click();
      setTimeout(()=>URL.revokeObjectURL(url), 2000);
    }
  } catch(e) {
    // Ultimate fallback
    const win = window.open('','_blank');
    if(win){win.document.write(html);win.document.close();if(autoPrint)setTimeout(()=>win.print(),600);}
  }
}


// ══════════════════════════════════════════════════════════
// ASSISTANT VOCAL UNIVERSEL — compatible tous navigateurs
// Stratégie : Web Speech API → getUserMedia+reconnect → fallback clavier
// ══════════════════════════════════════════════════════════

var _voiceActive = false;
var _voiceTimer = null;
var _voiceStream = null;

function startVoice() {
  if (_voiceActive) { stopVoice(); return; }

  var btn = document.getElementById('v-mic-btn');
  var status = document.getElementById('v-mic-status');
  var fb = document.getElementById('v-feedback');

  // Méthode 1 : Web Speech API (Chrome desktop, Edge, Chrome Android si autorisé)
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    try {
      var sr = new SR();
      sr.lang = 'fr-FR';
      sr.continuous = false;
      sr.interimResults = true;
      sr.maxAlternatives = 3;

      sr.onstart = function() {
        _voiceActive = true;
        if (btn) { btn.textContent = '⏹'; btn.style.background = 'var(--pink-bg)'; btn.style.color = 'var(--pink-text)'; }
        if (status) status.textContent = 'Parlez maintenant…';
        if (fb) { fb.className = 'voice-feedback'; fb.style.color = 'var(--info-text)'; fb.textContent = '🎙 Je vous écoute…'; }
        _voiceTimer = setTimeout(function() { try { sr.stop(); } catch(e) {} }, 8000);
      };

      sr.onresult = function(e) {
        clearTimeout(_voiceTimer);
        var inp = document.getElementById('v-input');
        var final = '';
        var alts = [];
        for (var i = e.resultIndex; i < e.results.length; i++) {
          for (var j = 0; j < e.results[i].length; j++) {
            if (e.results[i][j].transcript.trim()) alts.push(e.results[i][j].transcript.trim());
          }
          if (e.results[i].isFinal) {
            final = e.results[i][0].transcript.trim();
          } else {
            if (fb) fb.textContent = '🎤 ' + e.results[i][0].transcript;
          }
        }
        if (inp && alts.length) inp.value = final || alts[0];
        if (final) { stopVoice(); setTimeout(function() { sendCmd(final, alts); }, 200); }
      };

      sr.onspeechend = function() { try { sr.stop(); } catch(e) {} };

      sr.onerror = function(e) {
        clearTimeout(_voiceTimer);
        stopVoice();
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          // Web Speech bloqué → essayer getUserMedia pour débloquer le micro
          tryGetUserMedia();
        } else if (e.error === 'no-speech') {
          if (fb) { fb.className = 'voice-feedback'; fb.style.color = 'var(--amber-text)'; fb.textContent = '🔇 Rien entendu — réessayez'; }
        } else if (e.error === 'network') {
          if (fb) { fb.className = 'voice-feedback err'; fb.textContent = '❌ Connexion requise pour la dictée'; }
        } else {
          // Fallback clavier
          showKeyboardFallback();
        }
      };

      sr.onend = function() { stopVoice(); };

      sr.start();
      return; // Web Speech lancé avec succès
    } catch(e) {
      // Web Speech échoue → essayer getUserMedia
    }
  }

  // Méthode 2 : getUserMedia pour demander l'autorisation micro explicitement
  tryGetUserMedia();
}

function tryGetUserMedia() {
  var fb = document.getElementById('v-feedback');
  var status = document.getElementById('v-mic-status');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showKeyboardFallback();
    return;
  }

  if (status) status.textContent = 'Demande d\'autorisation…';

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      // Micro autorisé — arrêter le stream et relancer Web Speech
      stream.getTracks().forEach(function(t) { t.stop(); });
      _voiceStream = null;

      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        // Relancer maintenant que le micro est autorisé
        setTimeout(startVoice, 300);
      } else {
        showKeyboardFallback();
      }
    })
    .catch(function(err) {
      stopVoice();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        var fb2 = document.getElementById('v-feedback');
        if (fb2) {
          fb2.className = 'voice-feedback err';
          fb2.innerHTML = '❌ Micro refusé par Android.<br>' +
            '<small>Paramètres → Applications → Chrome → Autorisations → Micro → Autoriser<br>' +
            'Ou utilisez le 🎤 du clavier ci-dessous.</small>';
        }
        showKeyboardFallback();
      } else {
        showKeyboardFallback();
      }
    });
}

function showKeyboardFallback() {
  var status = document.getElementById('v-mic-status');
  var fb = document.getElementById('v-feedback');
  var btn = document.getElementById('v-mic-btn');
  if (btn) { btn.textContent = '⌨️'; btn.style.background = 'var(--bg2)'; btn.style.color = 'var(--text2)'; }
  if (status) status.textContent = 'Utilisez le clavier';
  if (fb) {
    fb.className = 'voice-feedback';
    fb.style.color = 'var(--amber-text)';
    fb.innerHTML = '💡 Appuyez sur le champ texte → 🎤 du clavier → dictez → OK';
  }
  // Focus sur le champ pour ouvrir le clavier
  var inp = document.getElementById('v-input');
  if (inp) setTimeout(function() { inp.focus(); }, 300);
}

function stopVoice() {
  clearTimeout(_voiceTimer);
  _voiceActive = false;
  var btn = document.getElementById('v-mic-btn');
  var status = document.getElementById('v-mic-status');
  if (btn) { btn.textContent = '🎙'; btn.style.background = 'var(--info-bg)'; btn.style.color = 'var(--info-text)'; }
  if (status) status.textContent = 'Micro prêt';
}

// Surcharge de openVoice pour init suggestions
var _origOpenVoice = null;
function refreshApp(){
  if('serviceWorker' in navigator && navigator.serviceWorker.controller){
    navigator.serviceWorker.controller.postMessage('skipWaiting');
    setTimeout(()=>window.location.reload(true),300);
  } else {
    window.location.reload(true);
  }
}

// ══════════════════════════════════════
// MODULE RÉCEPTION MARCHANDISES
// ══════════════════════════════════════























// ══════════════════════════════════════
// SCANNER ÉTIQUETTE — Caméra + Claude Vision
// ══════════════════════════════════════
let _recStream = null;
let _recPhotoData = null;

function openCameraReception() {
  const preview = document.getElementById('rec-scan-preview');
  const photoPreview = document.getElementById('rec-photo-preview');
  if (!preview) return;
  photoPreview.style.display = 'none';
  preview.style.display = 'block';
  document.getElementById('rec-scan-status').textContent = 'Démarrage de la caméra…';
  
  const video = document.getElementById('rec-video');
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
  }).then(function(stream) {
    _recStream = stream;
    video.srcObject = stream;
    document.getElementById('rec-scan-status').textContent = '📦 Pointez vers l\'étiquette du colis';
  }).catch(function(e) {
    document.getElementById('rec-scan-status').textContent = '⚠️ Caméra non disponible: ' + e.message;
  });
}

function stopCameraReception() {
  if (_recStream) {
    _recStream.getTracks().forEach(function(t) { t.stop(); });
    _recStream = null;
  }
  document.getElementById('rec-scan-preview').style.display = 'none';
}

function captureReceptionPhoto() {
  const video = document.getElementById('rec-video');
  const canvas = document.getElementById('rec-canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  _recPhotoData = canvas.toDataURL('image/jpeg', 0.85);
  
  stopCameraReception();
  
  // Afficher la photo prise
  const photoPreview = document.getElementById('rec-photo-preview');
  document.getElementById('rec-photo-img').src = _recPhotoData;
  document.getElementById('rec-analysis-result').textContent = '';
  photoPreview.style.display = 'block';
}

function retakeReceptionPhoto() {
  document.getElementById('rec-photo-preview').style.display = 'none';
  _recPhotoData = null;
  openCameraReception();
}




// ══════════════════════════════════════
// MODULE SCAN IA — RÉCEPTION MARCHANDISES
// ══════════════════════════════════════
let _scanData = null; // Données extraites par l'IA

async function handleScanPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];

  // Afficher l'aperçu
  const preview = document.getElementById('scan-preview');
  if (preview) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  }

  // Masquer résultat précédent
  const resultEl = document.getElementById('scan-result');
  const applyBtn = document.getElementById('scan-btn-apply');
  if (resultEl) resultEl.style.display = 'none';
  if (applyBtn) applyBtn.style.display = 'none';

  // Afficher loading
  const loadingEl = document.getElementById('scan-loading');
  if (loadingEl) loadingEl.style.display = 'block';

  try {
    // Convertir en base64
    const base64 = await fileToBase64(file);
    const mediaType = file.type || 'image/jpeg';

    // Appel Claude Vision via l'API Anthropic
    const response = await fetch('https://pbydidazdjqqihkolzgc.supabase.co/functions/v1/scan-etiquette', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mimeType: 'image/jpeg' })
    });

    if (!response.ok) throw new Error('API error: ' + response.status);
    const data = await response.json();

    // Parser la réponse JSON
    const text = data.content[0].text.trim();
    let parsed;
    try {
      // Nettoyer les backticks éventuels
      const clean = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch(e) {
      throw new Error('Impossible de parser la réponse IA');
    }

    _scanData = parsed;
    displayScanResult(parsed);

  } catch(e) {
    if (loadingEl) loadingEl.style.display = 'none';
    console.error('[SCAN]', e);
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = '<div style="color:var(--pink-text);text-align:center;padding:8px">⚠️ Erreur d\'analyse — ' + e.message + '</div>';
    }
  }
}

function displayScanResult(data) {
  const loadingEl = document.getElementById('scan-loading');
  const resultEl = document.getElementById('scan-result');
  const applyBtn = document.getElementById('scan-btn-apply');
  if (loadingEl) loadingEl.style.display = 'none';
  if (!resultEl) return;

  const fields = [
    ['Produit',      data.produit],
    ['Fournisseur',  data.fournisseur],
    ['N° de lot',    data.lot],
    ['DLC / DDM',    data.dlc],
    ['Quantité',     data.quantite],
    ['Poids net',    data.poids_net],
    ['Température',  data.temperature],
    ['Origine',      data.origine],
    ['Info',         data.commentaire],
  ].filter(([k, v]) => v && v !== 'null' && v !== null);

  if (!fields.length) {
    resultEl.innerHTML = '<div style="text-align:center;color:var(--text2);padding:8px">Aucune information détectée sur cette image</div>';
    resultEl.style.display = 'block';
    return;
  }

  resultEl.innerHTML = '<div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">🤖 Informations détectées</div>'
    + fields.map(([k, v]) =>
        '<div class="scan-result-row"><span class="scan-result-key">' + k + '</span><span class="scan-result-val">' + v + '</span></div>'
      ).join('');
  resultEl.style.display = 'block';

  if (applyBtn) applyBtn.style.display = 'block';
}

function applyScanResult() {
  if (!_scanData) return;
  const d = _scanData;

  // Remplir le formulaire réception
  if (d.produit)      setVal('rec-produit', d.produit);
  if (d.fournisseur)  setVal('rec-fourn', d.fournisseur);
  if (d.dlc)          setVal('rec-dlc', d.dlc);
  if (d.temperature) {
    const tempNum = parseFloat(d.temperature.replace(',', '.').replace(/[^0-9.\-]/g, ''));
    if (!isNaN(tempNum)) {
      setVal('rec-temp', tempNum);
      // Détecter le type de température
      const typeEl = document.getElementById('rec-type-temp');
      if (typeEl) {
        if (tempNum <= -10) typeEl.value = '-18';
        else if (tempNum <= 4) typeEl.value = '4';
        else if (tempNum <= 8) typeEl.value = '8';
        else typeEl.value = 'na';
        checkReceptionMP();
      }
    }
  }

  // Mettre les infos supplémentaires en observations
  const obsEl = document.getElementById('rec-obs');
  if (obsEl) {
    const extras = [];
    if (d.lot)        extras.push('Lot: ' + d.lot);
    if (d.quantite)   extras.push('Qté: ' + d.quantite);
    if (d.poids_net)  extras.push('Poids: ' + d.poids_net);
    if (d.origine)    extras.push('Origine: ' + d.origine);
    if (d.commentaire) extras.push(d.commentaire);
    if (extras.length) obsEl.value = extras.join(' | ');
  }

  // Feedback
  if (typeof showSyncToast === 'function') showSyncToast('✅ Formulaire pré-rempli !');

  // Masquer le bouton appliquer
  const applyBtn = document.getElementById('scan-btn-apply');
  if (applyBtn) applyBtn.style.display = 'none';
}



function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


// ══════════════════════════════════════
// SCAN ÉTIQUETTE → RÉCEPTION AUTO
// ══════════════════════════════════════




function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== null && val !== undefined) el.value = val;
}

function openVoice() {
  document.getElementById('voice-overlay').classList.add('open');
  setTimeout(function() {
    buildVoiceSuggestions();
    stopVoice(); // reset état
  }, 150);
}

function closeVoice(){
  document.getElementById('voice-overlay').classList.remove('open');
  stopVoice();
}


// Init
const __restoreResult=loadAutoSave();
const _now=new Date();
const _dateLocale=_now.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
document.getElementById('footer-date').textContent=_dateLocale;
const _hdl=document.getElementById('header-date-line');
if(_hdl)_hdl.textContent='La Salle à Manger · Grenoble — '+_now.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
loadAllData();
buildZoneTabs();buildFilters();updateStats();render();buildBilan();buildInvoiceList();
if(__restoreResult&&__restoreResult.savedAt){
  const __restoredCount=DATA.filter(d=>d.qte!==null&&d.qte!==undefined).length;
  if(__restoredCount>0)showRestoreBanner(__restoredCount,__restoreResult.savedAt);
}
buildAccountSelect();
loadPieces();
renderPieces();
detectCameraContext();
const __comptableEmailEl=document.getElementById('comptable-email');
if(__comptableEmailEl)__comptableEmailEl.value=loadAccountantEmail();
