// ═══ TUGAS AWAL MC FATHUL ADZIM — 2 TAHAP (build 20261114.1) ═══
// TAHAP 1 = MCFA_CORE.taStage1 (14 NOV 2026) · TAHAP 2 = MCFA_CORE.taStage2 (20 NOV 2026) · 15–19 NOV (taGapStart–taGapEnd) = KOSONG: tanpa tugas, tanpa aktivitas otomatis.
// Dua tahap memakai DAFTAR TUGAS yang sama (satu definisi, ID unik) tetapi checklist & progres masing-masing terpisah: S = {t1:{id:true}, t2:{id:true}}.
// Database: localStorage 'mcfa_tugasAwalHarian_v1' skema v5 = {v:5, s:{t1:{...}, t2:{...}}} (ikut backup/cloud otomatis). Semua angka (selesai/belum/persen/ringkasan) dihitung dari S, tidak ada angka statis.
// Migrasi v4 → v5 (14 NOV 2026): data 1–13 NOV DIHAPUS dari data aktif (tugas, riwayat, statistik, persentase). Salinan pengaman utuh v4 disimpan SEKALI di 'mcfa_tugasAwal_arsip_v4' (tidak dirender, tidak dihitung). Hanya centang Branding akun (ID h5-…, milik 14 NOV) yang dipertahankan, di Tahap 1.
// Centang: hanya centang (tanpa tanggal/jam) dan SELALU bisa dibatalkan.
(function(){
var KEY='mcfa_tugasAwalHarian_v1', ARS='mcfa_tugasAwal_arsip_v4', BAD='mcfa_tugasAwal_rusak_v5';
var HS=['MIN','SEN','SEL','RAB','KAM','JUM','SAB'];
var COL=['#ff6b35,#f7931e','#0ea5e9,#0284c7','#16a34a,#15803d','#8b5cf6,#6d28d9','#e11d48,#be123c'];
var BRAND=[['mcfa','MC FATHUL ADZIM'],['fathulmeme','FATHUL AL-MEME'],['barongsukma','BARONGSUKMA'],['okk','OTAK KEPALA KARDUS'],['zona','ZONA ASUMSI'],['alley','ALLEY\u2019S CREATIVE KIDS'],['ayla','DUNIA AYLA'],['lol','LOL MONKEY SHOP'],['monkipedia','MONKIPEDIA'],['kpc','KP.CIHUY'],['cne','CNE PICTURES']];
var BRAND_T=[['gmail','Buat akun Gmail'],['username','Samakan username'],['bio','Tambahkan bio yang pas'],['aman','Periksa keamanan akun'],['sosmed','Cek akun FB, TikTok, IG dan perhatikan sama seperti di atas']];
/* ID tetap & permanen: tugas baru HANYA boleh ditambah di akhir daftar (nomor berikutnya), jangan menomori ulang. */
function X(a){ return a.map(function(x){ return {t:x[1],id:x[0]}; }); }   /* ID eksplisit (untuk daftar yang diubah setelah rilis: ID lama tidak boleh bergeser) */
function L(p,a){ return a.map(function(t,n){ return {t:t,id:p+'-'+(n<9?'0':'')+(n+1)}; }); }
var CAT=[
 /* 14 NOV 2026: 'Pemanasan Fisik' (a-08) dihapus & ID-nya dipensiunkan (centang lamanya tidak dihitung); 'Makan' ditambah sebelum Mandi Wajib (ID baru a-09) */
 {k:'a',t:'A. MEMULAI HARI',g:[{i:X([['a-01','Buat M.C.F.A Project'],['a-02','Buat Jadwal Olahraga Baru'],['a-09','Makan'],['a-03','Mandi Wajib'],['a-04','Sholat Tobat'],['a-05','Sholat Subuh'],['a-06','Baca Al-Waqiah'],['a-07','Dzikir']])}]},
 {k:'b',t:'B. OLAHRAGA',g:[{i:L('b',['Pemanasan Running Pertama (1)','Pemanasan Workout Pertama (1)'])}]},
 {k:'c',t:'C. PERBAIKAN KAMAR AYLA',g:[{i:L('c',['Perbagus Kamar Ayla','Pasang Terpal'])}]},
 {k:'d',t:'D. PEMBERSIHAN RUMAH',g:[
  {t:'Kamar Sendiri',i:L('d1',['Bereskan Kamar Sendiri','Cuci dan Pasang Seprei','Bersihkan Kamar Sendiri','Pel dan Beri Pewangi Kamar'])},
  {t:'Kamar Mandi',i:L('d2',['Bereskan Kamar Mandi','Tambahkan Gayung Kuning','Tambahkan Kayu Ambalan','Tambahkan Tanaman','Bersihkan Kamar Mandi','Beri Parfum Kamar Mandi'])},
  {t:'Dapur',i:L('d3',['Bersihkan Dapur','Pasang Lantai Vinyl','Tambahkan Kayu Tempat Bumbu','Ganti Tempat Sendok','Tambahkan Kayu Ambalan','Tambahkan Tanaman','Pel dan Beri Pewangi Dapur'])},
  {t:'Tempat Editing',i:L('d4',['Bereskan Tempat Editing','Tambahkan Dekorasi dan Perlengkapan','Cat Bagian Atas Plafon','Bersihkan Tempat Editing','Pel dan Beri Pewangi Tempat Editing'])},
  {t:'Ruangan Tengah',i:L('d5',['Bereskan Ruangan Tengah','Cuci Seprei dan Pasangkan','Tambahkan Kayu Dekorasi','Ubah Bingkai Jadi Tanggal 21','Bersihkan Ruangan Tengah','Pel dan Beri Pewangi Ruangan Tengah'])},
  {t:'Kamar',i:L('d6',['Bersihkan Kamar','Pel dan Beri Pewangi Kamar'])}]},
 {k:'e',t:'E. AREA WORKOUT',g:[{i:L('e',['Bereskan Alat WO','Tambahkan Matras Hitam','Cat Tembok Abu'])}]},
 {k:'f',t:'F. AREA SOFA',g:[{i:L('f',['Bereskan Sofa','Tambahkan Tanaman','Pel dan Beri Pewangi'])}]},
 {k:'g',t:'G. ALAT TAMBAHAN',g:[{i:L('g',['Buat Pull Up','Buat Samsak','Buat Pemberat'])}]},
 {k:'h',t:'H. PEDOMAN KEHIDUPAN',g:[{i:X([['h-03','Makan'],['h-01','Buat Print A6 Kehidupan MC Fathul Adzim'],['h-02','Buat Mata Pelajaran']])}]},   /* 'Makan' (h-03) ditambah sebelum Print A6 */
 /* I. AKUN DAN BRANDING — data, struktur, dan ID (h5-<akun>-<tugas>) DIPERTAHANKAN dari file sebelumnya: 11 akun × 5 tugas = 55 */
 {k:'i',t:'I. AKUN DAN BRANDING',g:BRAND.map(function(a,n){ return {t:(n+1)+'. '+a[1],i:BRAND_T.map(function(t){ return {t:t[1],id:'h5-'+a[0]+'-'+t[0]}; })}; })},
 /* J. PENUTUP — 'Makan' di akhir daftar (14 NOV 2026) */
 {k:'j',t:'J. PENUTUP',g:[{i:X([['j-01','Makan']])}]}
];
var ST=[{k:'t1',n:1,d:MCFA_CORE.taStage1},{k:'t2',n:2,d:MCFA_CORE.taStage2}];
var IDSET={}, ALLIDS=[];
CAT.forEach(function(c){ c.ids=[]; c.g.forEach(function(g){ g.ids=g.i.map(function(x){ return x.id; }); c.ids=c.ids.concat(g.ids); }); c.ids.forEach(function(id){ ALLIDS.push(id); IDSET[id]=(IDSET[id]||0)+1; }); });
var TOTAL=ALLIDS.length;
var S={t1:{},t2:{}}, sel='t1', root=null;

/* ── perhitungan: SATU fungsi, murni dari data S ── */
function pctOf(d,t){ if(!t||!d) return 0; if(d>=t) return 100; return Math.max(1,Math.min(99,Math.round(d/t*100))); }   /* (selesai ÷ total) × 100; 100% hanya bila semua selesai */
function cnt(ss,ids){ var n=0; ids.forEach(function(id){ if(ss&&ss[id]===true) n++; }); return n; }
function mk(d,t){ return {done:d,total:t,left:t-d,pct:pctOf(d,t)}; }
function calc(st){
  var o={cats:{}}, sd=0;
  ST.forEach(function(s){ var ss=st[s.k], d=cnt(ss,ALLIDS), r=mk(d,TOTAL); r.cats={}; CAT.forEach(function(c){ r.cats[c.k]=mk(cnt(ss,c.ids),c.ids.length); }); o[s.k]=r; sd+=d; });
  var a=mk(sd,TOTAL*ST.length); a.t1=o.t1; a.t2=o.t2; return a;
}
function overall(){ return calc(S); }
function stage(k){ return ST.filter(function(s){ return s.k===k; })[0]; }
function today(){ return mcfaTodayIso(); }

/* ── database ── */
function clean(raw){   /* hanya ID yang dikenal & bernilai true */
  var o={}; if(raw&&typeof raw==='object') Object.keys(raw).forEach(function(id){ if(raw[id]===true&&IDSET[id]) o[id]=true; }); return o;
}
function load(){
  var r=null, out={t1:{},t2:{}};
  try{ r=localStorage.getItem(KEY); }catch(e){}
  if(!r) return out;
  var p; try{ p=JSON.parse(r); }catch(e){ try{ if(!localStorage.getItem(BAD)) localStorage.setItem(BAD,r); }catch(_){} return out; }   /* rusak: salinan pengaman, aslinya tidak ditimpa sampai ada centang baru */
  if(p&&p.v===5&&p.s){ out.t1=clean(p.s.t1); out.t2=clean(p.s.t2); return out; }
  if(p&&p.checks&&typeof p.checks==='object'){   /* migrasi dari v4 (atau lebih lama) → v5 */
    try{ if(!localStorage.getItem(ARS)) localStorage.setItem(ARS,r); }catch(e){}
    var keep={}; Object.keys(p.checks).forEach(function(id){ if(p.checks[id]===true&&/^h5-/.test(id)) keep[id]=true; });   /* hanya Branding (14 NOV) */
    out.t1=clean(keep); save(out); return out;
  }
  return out;
}
function save(st){ var s=JSON.stringify({v:5,s:st||S}); try{ localStorage.setItem(KEY,s); return localStorage.getItem(KEY)===s; }catch(e){ return false; } }

/* ── tampilan ── */
function longDate(d){ return formatDayUpper(d)+', '+formatDateUpper(d); }
var STX=['BELUM DIMULAI','SEDANG DIKERJAKAN','SELESAI'];
function cls(r){ return r.done===0?0:(r.done>=r.total?2:1); }
function renderStrip(){
  var el=document.getElementById('tahStrip'); if(!el) return; var T=today(), h='', A=calc(S);
  for(var d=MCFA_CORE.taskStart; d<=MCFA_CORE.taskEnd; d=mcfaAddDays(d,1)){
    var s=ST.filter(function(x){ return x.d===d; })[0], n=+d.slice(8), w=HS[mcfaParse(d).getDay()];
    if(s){ var r=A[s.k], c=cls(r);
      h+='<button type="button" class="tah-t s'+c+(s.k===sel?' sel':'')+(d===T?' now':'')+'" data-s="'+s.k+'" aria-label="TAHAP '+s.n+' — '+longDate(d)+' — '+STX[c]+' '+r.pct+'%"><small>TAHAP '+s.n+'</small><b>'+n+' NOV</b><i><u style="width:'+r.pct+'%"></u></i></button>'; }
    else h+='<div class="tah-t tah-gap'+(d===T?' now':'')+'" aria-label="'+longDate(d)+' — KOSONG"><small>'+w+'</small><b>'+n+'</b></div>'; }
  el.innerHTML=h;
}
function renderHead(){
  var el=document.getElementById('tahHead'); if(!el) return; var s=stage(sel), r=calc(S)[sel], c=cls(r), wk='';
  try{ if(window.MCFA_WORKOUT&&MCFA_WORKOUT.bar) wk=MCFA_WORKOUT.bar(s.d)||''; }catch(e){}
  el.innerHTML='<div class="tah-dhead"><div><div class="tah-dt">TAHAP '+s.n+' — '+longDate(s.d)+'</div><div class="tah-tema">'+TOTAL+' TUGAS · CHECKLIST DAN PROGRES SENDIRI</div></div><span class="tah-chip s'+c+'">'+STX[c]+'</span></div>'+
   '<div class="tah-note">'+(s.n===2?'Daftar tugas <b>sama dengan Tahap 1</b>, tetapi centang dan progres Tahap 2 <b>terpisah</b> — tidak memengaruhi Tahap 1.':'Centang dan progres Tahap 1 <b>terpisah</b> dari Tahap 2.')+'</div>'+wk+
   '<div class="tah-dstat"><span><b>'+r.done+'</b> selesai</span><span><b>'+r.left+'</b> belum</span><span><b>'+r.pct+'%</b> Tahap '+s.n+'</span></div><div class="ta-prog-track"><div class="ta-prog-fill" style="width:'+r.pct+'%"></div></div>';
}
function renderGroups(){
  var el=document.getElementById('tahGroups'); if(!el) return; var h='', n;
  CAT.forEach(function(c,ci){ n=0;
    h+='<div class="ta-block'+(ci===0?' open':'')+'" data-c="'+c.k+'"><div class="ta-block-header" style="background:linear-gradient(135deg,'+COL[ci%COL.length]+')"><span class="ta-block-title">'+c.t+'</span><span class="ta-block-count"></span></div><i class="tah-cbar"><u></u></i><div class="ta-items">';
    c.g.forEach(function(g,gi){
      if(g.t) h+='<div class="tah-sub" data-g="'+gi+'"><b>'+g.t+'</b><span></span></div>';
      g.i.forEach(function(x){ n++; h+='<div class="ta-item" data-id="'+x.id+'" data-s="'+sel+'" onclick="taToggle(this)"><span class="ta-cb"></span><span class="tah-n">'+n+'.</span><span class="ta-label">'+x.t+'</span></div>'; }); });
    h+='</div></div>'; });
  el.innerHTML=h; counters();
}
function counters(){   /* semua status & hitungan blok dibaca dari S (bukan dari DOM) */
  var ss=S[sel];
  document.querySelectorAll('#tahGroups .ta-block').forEach(function(b){
    var c=CAT.filter(function(x){ return x.k===b.dataset.c; })[0], d=cnt(ss,c.ids), t=c.ids.length;
    b.querySelectorAll('.ta-item').forEach(function(x){ x.dataset.s=sel; x.classList.toggle('done',ss[x.dataset.id]===true); });
    var cc=b.querySelector('.ta-block-count'); if(cc) cc.textContent=(d===t?'✓ ':'')+d+'/'+t+' · '+pctOf(d,t)+'%';
    var u=b.querySelector('.tah-cbar u'); if(u) u.style.width=pctOf(d,t)+'%';
    b.classList.toggle('tah-full',d===t);
    b.querySelectorAll('.tah-sub').forEach(function(sb){ var g=c.g[+sb.dataset.g], gd=cnt(ss,g.ids), sp=sb.querySelector('span'); if(sp) sp.textContent=gd+'/'+g.ids.length; sb.classList.toggle('tah-full',gd===g.ids.length); }); });
}
function taUpdate(){
  var o=calc(S), set=function(id,v){ var x=document.getElementById(id); if(x) x.textContent=v; };
  var f=document.getElementById('ta-fill'); if(f) f.style.width=o.pct+'%';
  set('ta-pct',o.pct+'%'); set('ta-done',o.done); set('ta-total',o.total); set('ta-left',o.left);
  var sm=document.getElementById('taStageSum'); if(sm) sm.innerHTML=ST.map(function(s){ var r=o[s.k]; return '<div class="tah-srow"><span>TAHAP '+s.n+' · '+mcfaCompactRange(s.d,s.d)+'</span><i><u style="width:'+r.pct+'%"></u></i><b>'+r.done+'/'+r.total+' · '+r.pct+'%</b></div>'; }).join('');
  renderStrip(); renderHead(); counters();
  if(typeof syncHeroProgress==='function') syncHeroProgress();
}
function taToggle(el){
  var id=el&&el.dataset&&el.dataset.id, sk=(el&&el.dataset&&el.dataset.s)||sel; if(!id||!IDSET[id]||!S[sk]) return;
  S=load();   /* baca ulang database dulu: tab lain mungkin sudah mengubah */
  var was=S[sk][id]===true;
  if(was) delete S[sk][id]; else S[sk][id]=true;
  if(!save()){ if(was) S[sk][id]=true; else delete S[sk][id]; if(typeof showNotif==='function') showNotif('Gagal menyimpan. Coba lagi.'); counters(); return; }
  taUpdate();
  var cur=document.querySelector('#tahGroups .ta-item[data-id="'+id+'"]');
  if(cur){ var k=was?'ta-just-unchecked':'ta-just-checked'; cur.classList.add(k); setTimeout(function(){ cur.classList.remove(k); },was?340:450); }
  if(navigator.vibrate) navigator.vibrate(was?12:[10,20,8]);
}
function taLoad(){ S=load(); if(root){ renderGroups(); taUpdate(); } }
function taResetAll(){   /* hanya Tahap yang sedang dipilih */
  var s=stage(sel); if(!confirm('Reset semua checklist TAHAP '+s.n+' ('+formatDateUpper(s.d)+')? Tahap lain tidak terpengaruh.')) return;
  S=load(); var b=S[sel]; S[sel]={};
  if(!save()){ S[sel]=b; if(typeof showNotif==='function') showNotif('Reset belum tersimpan. Coba lagi.'); return; }
  taUpdate();
}
function select(k){ if(!stage(k)) return; sel=k; counters(); taUpdate(); }
function init(){
  root=document.getElementById('tahRoot'); if(!root||root.dataset.ready) return; root.dataset.ready='1';
  S=load(); sel=(today()>ST[0].d)?'t2':'t1';
  root.addEventListener('click',function(ev){
    var t=ev.target.closest&&ev.target.closest('.tah-t[data-s]'); if(t){ select(t.dataset.s); return; }
    var h=ev.target.closest&&ev.target.closest('.ta-block-header'); if(h){ var b=h.closest('.ta-block'); if(b) b.classList.toggle('open'); }
  });
  renderGroups(); taUpdate();
}
window.addEventListener('storage',function(e){ if(!e||!e.key||e.key===KEY){ S=load(); if(root) taUpdate(); } });
window.taToggle=taToggle; window.taUpdate=taUpdate; window.taLoad=taLoad; window.taResetAll=taResetAll;
window.TAH={overall:overall,stats:overall,calc:calc,select:select,stage:function(){ return sel; },arsip:function(){ try{ return JSON.parse(localStorage.getItem(ARS)||'null'); }catch(e){ return null; } },
 next:function(){ for(var i=0;i<ST.length;i++){ for(var j=0;j<ALLIDS.length;j++){ if(!S[ST[i].k][ALLIDS[j]]){ var f=null; CAT.forEach(function(c){ c.g.forEach(function(g){ g.i.forEach(function(x){ if(x.id===ALLIDS[j]) f=x.t; }); }); }); return f; } } } return ''; },
 verify:function(){ var bad=[], eq=function(l,a,b){ if(a!==b) bad.push(l+': '+a+' ≠ '+b); };
  eq('Tahap 1 = 14 NOV 2026',ST[0].d,'2026-11-14'); eq('Tahap 2 = 20 NOV 2026',ST[1].d,'2026-11-20'); eq('jumlah tahap',ST.length,2);
  eq('taskStart = Tahap 1',MCFA_CORE.taskStart,ST[0].d); eq('taskEnd = Tahap 2',MCFA_CORE.taskEnd,ST[1].d);
  for(var d=MCFA_CORE.taGapStart; d<=MCFA_CORE.taGapEnd; d=mcfaAddDays(d,1)) if(ST.some(function(s){ return s.d===d; })) bad.push(d+' (15–19 NOV) harus kosong');
  eq('tanggal 15–19 NOV',MCFA_CORE.taGapStart+'/'+MCFA_CORE.taGapEnd,'2026-11-15/2026-11-19');
  eq('total tugas per tahap',TOTAL,110); eq('ID unik',Object.keys(IDSET).length,TOTAL);
  Object.keys(IDSET).forEach(function(id){ if(IDSET[id]>1) bad.push('ID ganda: '+id); });
  var want={a:8,b:2,c:2,d:30,e:3,f:3,g:3,h:3,i:55,j:1}; CAT.forEach(function(c){ eq('kategori '+c.k,c.ids.length,want[c.k]); });
  eq('D: sub-kelompok',CAT[3].g.map(function(g){ return g.ids.length; }).join(','),'4,6,7,5,6,2');
  eq('I: 11 akun × 5',CAT[8].g.length+'x'+CAT[8].g.map(function(g){ return g.ids.length; }).join(''),'11x55555555555');
  var all={}; ST.forEach(function(s){ Object.keys(S[s.k]).forEach(function(id){ if(!IDSET[id]) bad.push('centang tanpa tugas: '+s.k+'/'+id); }); });
  var x=calc({t1:clean(ALLIDS.reduce(function(a,id){ a[id]=true; return a; },{})),t2:{}});   /* uji independensi tahap */
  eq('uji: Tahap 1 penuh → 100%',x.t1.pct,100); eq('uji: Tahap 2 tetap 0%',x.t2.done,0); eq('uji: keseluruhan 110/220 = 50%',x.pct,50); eq('uji: ID a-08 (Pemanasan Fisik) dipensiunkan',clean({'a-08':true})['a-08'],undefined); eq('urutan A',CAT[0].ids.join(','),'a-01,a-02,a-09,a-03,a-04,a-05,a-06,a-07'); eq('urutan H',CAT[7].ids.join(','),'h-03,h-01,h-02'); eq('urutan terakhir = Makan',ALLIDS[ALLIDS.length-1],'j-01'); eq('jumlah tugas Makan',CAT.reduce(function(n,c){ return n+c.g.reduce(function(m,g){ return m+g.i.filter(function(t){ return t.t==='Makan'; }).length; },0); },0),3); eq('uji: total keseluruhan',x.total,TOTAL*2);
  var y=calc({t1:{},t2:{'a-01':true}}); eq('uji: 1 tugas Tahap 2 tidak mengubah Tahap 1',y.t1.done,0); eq('uji: persen Tahap 2 = round(1/110)',y.t2.pct,1);
  var o=overall(); eq('selesai+belum=total',o.done+o.left,o.total); eq('keseluruhan = Tahap 1 + Tahap 2',o.done,o.t1.done+o.t2.done);
  if(document.getElementById('tahExtra')) bad.push('panel lama #tahExtra masih ada');
  return bad; }};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else setTimeout(init,0);
document.addEventListener('visibilitychange',function(){ if(!document.hidden&&root){ S=load(); taUpdate(); } });
})();
