// ═══ TUGAS AWAL HARIAN — periode Tugas Awal (MCFA_CORE.taskStart → taskEnd, 1–20 NOVEMBER 2026) ═══
// Daftar tugas per tanggal (H 1–H 5 = 1–5 NOV; urutan baru 6 NOV: 1 Persiapan Project · 2 Pembersihan Studio · 3 Pembersihan Rumah · 4 Persiapan Hidup Baru · 5 Persiapan Branding Akun · 20 Persiapan Akhir Menyeluruh; ID tetap per tugas; 4 NOV memuat Olahraga & Running (Day 1) setelah 'Buat ucapan Caca'; 5 NOV = BUAT AKUN / BRANDING untuk 11 akun) + satu daftar dekorasi studio aktif 6–20 NOV (MCFA_CORE.decoStart → adaptEnd; 6–7 NOV sebelum Program Adaptasi 8–20 NOV, tidak diduplikasi per tanggal).
// PEMBARUAN 7 NOV 2026: 6 NOV = LIBUR (tanpa tugas, tanpa progres); 7 NOV = kumpulan tugas 1–5 NOV dengan ID SAMA dengan tanggal asal (satu centang, sinkron dua arah, dihitung sekali); daftar dekorasi aktif 8–20 NOV (centang dek-* tidak berubah).
// Centang: hanya centang (tanpa tanggal/jam di layar) dan SELALU bisa dibatalkan — tidak ada penguncian.
// Penyimpanan: localStorage 'mcfa_tugasAwalHarian_v1' (ikut backup/cloud sync otomatis lewat hook setItem).
// Data checklist lama ('mcfa_tugasAwal_v*') TIDAK dihapus / diubah.
(function(){
var KEY='mcfa_tugasAwalHarian_v1', LAST=MCFA_CORE.taskEnd;
var HARI=['MINGGU','SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'], HS=['MIN','SEN','SEL','RAB','KAM','JUM','SAB'];
var COL=['#ff6b35,#f7931e','#0ea5e9,#0284c7','#16a34a,#15803d','#8b5cf6,#6d28d9','#e11d48,#be123c'];
/* 5 NOV — BUAT AKUN / BRANDING: tiap akun punya 5 tugas yang sama (ID tetap h5-<akun>-…). Urutan akun = urutan di daftar akun aplikasi. */
var BRAND=[['mcfa','MC FATHUL ADZIM'],['fathulmeme','FATHUL AL-MEME'],['barongsukma','BARONGSUKMA'],['okk','OTAK KEPALA KARDUS'],['zona','ZONA ASUMSI'],['alley','ALLEY\u2019S CREATIVE KIDS'],['ayla','DUNIA AYLA'],['lol','LOL MONKEY SHOP'],['monkipedia','MONKIPEDIA'],['kpc','KP.CIHUY'],['cne','CNE PICTURES']];
var BRAND_T=[['gmail','Buat akun Gmail'],['username','Samakan username'],['bio','Tambahkan bio yang pas'],['aman','Periksa keamanan akun'],['sosmed','Cek akun FB, TikTok, IG dan perhatikan sama seperti di atas']];
var BRAND_G=BRAND.map(function(a,n){ return {t:(n+1)+'. '+a[1],o:n===0,i:BRAND_T.map(function(t){ return {t:t[1],id:'h5-'+a[0]+'-'+t[0]}; })}; });
/* PEMBARUAN URUTAN (6 NOV 2026): tanggal 2 ⇄ 3 ditukar. ID tugas TIDAK diganti (tetap h2-…/h3-… sesuai asal) agar centang & riwayat lama tetap menempel pada tugas yang sama. Hanya isi per tanggal + judulnya yang berpindah. */
var N1=[{t:'Makan',id:'h1-makan'},{t:'Buat logo KP.Cihuy',id:'h1-logo-kpcihuy'},{t:'Buat MCFA Project 2.2',id:'h1-mcfa-project-22'},{t:'Buat jadwal olahraga',id:'h1-jadwal-olahraga'}];
var N2=[{t:'Bereskan kamar mandi',id:'h3-bereskan-kamar-mandi'},{t:'Bersihkan kamar mandi',id:'h3-bersihkan-kamar-mandi'},{t:'Bereskan dapur',id:'h3-bereskan-dapur'},{t:'Bersihkan dapur',id:'h3-bersihkan-dapur'},{t:'Bereskan tempat editing',id:'h3-bereskan-tempat-editing'},{t:'Bersihkan tempat editing',id:'h3-bersihkan-tempat-editing'},{t:'Bereskan ruangan tengah',id:'h3-bereskan-ruangan-tengah'},{t:'Bersihkan ruangan tengah',id:'h3-bersihkan-ruangan-tengah'},{t:'Bereskan alat workout',id:'h3-bereskan-alat-workout'},{t:'Bersihkan teras',id:'h3-bersihkan-teras'}];
var N3=[{t:'Bereskan kamar',id:'h2-bereskan-kamar'},{t:'Bersihkan kamar',id:'h2-bersihkan-kamar'},{t:'Sapu kamar',id:'h2-sapu-kamar'},{t:'Pel kamar',id:'h2-pel-kamar'},{t:'Bereskan rumah',id:'h2-bereskan-rumah'},{t:'Potong terpal dan buat plafon kamar Ayla',id:'h2-plafon-kamar-ayla'}];
var N4=[{t:'Cukur rambut',id:'h4-cukur-rambut'},{t:'Buat alat samsak',id:'h4-alat-samsak'},{t:'Buat alat pull up',id:'h4-alat-pull-up'},{t:'Buat pemberat',id:'h4-pemberat'},{t:'Mandi wajib',id:'h4-mandi-wajib'},{t:'Sholat tobat',id:'h4-sholat-tobat'},{t:'Dzikir',id:'h4-dzikir'},{t:'Buat buku fake',id:'h4-buku-fake'},{t:'Buat ucapan Caca',id:'h4-ucapan-caca'},{t:'Olahraga (Day 1)',id:'h4-olahraga-day1'},{t:'Running (Day 1)',id:'h4-running-day1'},{t:'Buat print A6',id:'h4-print-a6'},{t:'Buat mapel',id:'h4-mapel'}];
var DEK_G=[
 {t:'A. PEMBELIAN DAN PENGUMPULAN BAHAN',s:1,i:['Beli daun sintetis','Beli tali karung','Beli bunga matahari rambat','Beli cat coklat','Beli papan ukuran 40 × 5 cm (5 buah, total 2 meter)','Bunga matahari betulan','Beli cat merah dan putih']},
 {t:'B. DIY DAN DEKORASI',s:8,i:['DIY jamur','DIY kumbang','Poster kecil (2 buah)','Gayung kuning','Cat fitting lampu','Tempat sendok coklat','Tempat saus kecap','Botol saus kecap','Poster A3+ buat dapur (1 buah)','Sisi plafon coklat','Gorden kolong meja ruang editing','Dekorasi gitar','Lantai vinyl']}];
/* 20 NOV — PERSIAPAN AKHIR MENYELURUH: tugas tanggal 1–5 diulang sebagai pemeriksaan akhir dengan ID sendiri (h20-…, centang terpisah; centang tanggal asal tidak ditimpa). Daftar dekorasi memakai ID dek-* yang sama dengan 6–19 NOV (satu centang, bukan ganda; progres total dihitung sekali). */
var ALL={}; [N1,N2,N3,N4].forEach(function(a){ a.forEach(function(x){ ALL[x.id]=x; }); });
function R(a){ return a.map(function(id){ return {t:ALL[id].t,id:'h20-'+id.replace(/^h\d-/,'')}; }); }
var FIN_G=[
 {t:'KAMAR',o:true,i:R(['h2-bereskan-kamar','h2-bersihkan-kamar','h2-sapu-kamar','h2-pel-kamar','h2-plafon-kamar-ayla'])},
 {t:'STUDIO',i:R(['h3-bereskan-kamar-mandi','h3-bersihkan-kamar-mandi','h3-bereskan-dapur','h3-bersihkan-dapur','h3-bereskan-tempat-editing','h3-bersihkan-tempat-editing','h3-bereskan-ruangan-tengah','h3-bersihkan-ruangan-tengah','h3-bersihkan-teras'])},
 {t:'RUMAH',i:R(['h2-bereskan-rumah'])},
 {t:'PERALATAN DAN PERLENGKAPAN',i:R(['h3-bereskan-alat-workout','h4-alat-samsak','h4-alat-pull-up','h4-pemberat','h4-buku-fake','h4-mapel','h4-print-a6'])},
 {t:'PROJECT',i:R(['h1-logo-kpcihuy','h1-mcfa-project-22','h1-jadwal-olahraga'])},
 {t:'PERSIAPAN HIDUP BARU',i:R(['h1-makan','h4-cukur-rambut','h4-mandi-wajib','h4-sholat-tobat','h4-dzikir','h4-ucapan-caca','h4-olahraga-day1','h4-running-day1'])}
].concat(DEK_G.map(function(g,gi){ return {t:'DEKORASI STUDIO · '+g.t,s:g.s,i:g.i.map(function(x,ii){ return {t:x,id:'dek-'+gi+'-'+ii}; })}; }),
 BRAND.map(function(a,n){ return {t:'BRANDING SELURUH AKUN · '+(n+1)+'. '+a[1],i:BRAND_T.map(function(x){ return {t:x[1],id:'h20-'+a[0]+'-'+x[0]}; })}; }));
/* 7 NOV: kumpulan tugas 1–5 NOV. Objek item & ID SAMA dengan tanggal asal (h1-…–h5-…) → satu centang, satu hitungan; tidak ada ID baru. */
var N7G=[{t:'TANGGAL 1 — PERSIAPAN PROJECT',i:N1,o:true},{t:'TANGGAL 2 — PEMBERSIHAN STUDIO',i:N2},{t:'TANGGAL 3 — PEMBERSIHAN RUMAH',i:N3},{t:'TANGGAL 4 — PERSIAPAN HIDUP BARU',i:N4}].concat(BRAND_G.map(function(g){ return {t:'TANGGAL 5 · '+g.t,i:g.i}; }));
var D=[
{k:'n1',d:MCFA_CORE.taskStart,g:[{t:'TANGGAL 1 — PERSIAPAN PROJECT',i:N1}]},
{k:'n2',d:mcfaAddDays(MCFA_CORE.taskStart,1),g:[{t:'TANGGAL 2 — PEMBERSIHAN STUDIO',i:N2}]},
{k:'n3',d:MCFA_CORE.prepStart,g:[{t:'TANGGAL 3 — PEMBERSIHAN RUMAH',i:N3}]},
{k:'n4',d:MCFA_CORE.prepEnd,g:[{t:'TANGGAL 4 — PERSIAPAN HIDUP BARU',i:N4}]},
{k:'n5',d:'2026-11-05',tema:'TANGGAL 5 — PERSIAPAN BRANDING AKUN',g:BRAND_G},
{k:'n6',d:'2026-11-06',libur:true,tema:'LIBUR — ISTIRAHAT · FRESH · RECOVERY',g:[]},
{k:'n7',d:'2026-11-07',tema:'TANGGAL 1–5 — SELURUH TUGAS DIKUMPULKAN',note:'Tugas tanggal 1–5 NOV ditampilkan di sini. Setiap tugas adalah <b>satu tugas yang sama</b> dengan tanggal asalnya (satu ID): centang atau batalkan di sini atau di tanggal 1–5, keduanya langsung ikut berubah. Progres dihitung sekali.',g:N7G},
{k:'dek',d:MCFA_CORE.adaptStart,e:MCFA_CORE.adaptEnd,tema:'KUMPULAN BARANG-BARANG DEKORASI STUDIO',g:DEK_G},
{k:'n20',d:MCFA_CORE.taskEnd,tema:'TANGGAL 20 — PERSIAPAN AKHIR MENYELURUH',note:'Pemeriksaan dan persiapan akhir: seluruh tugas tanggal 1–5 diulang untuk diperiksa, dirapikan, disiapkan, dan diselesaikan kembali sebelum DAY 1. Centang di sini terpisah dari tanggal asalnya (progres lama tidak berubah). Daftar dekorasi studio memakai centang yang sama dengan 6–19 NOV.',g:FIN_G}
];
var S={}, sel=D[0].d, root=null;
function p2(n){return n<10?'0'+n:''+n;}
function iso(n){return '2026-11-'+p2(n);}
function entry(d){ var i,e; for(i=0;i<D.length;i++){ e=D[i]; if(d===e.d) return e; } for(i=0;i<D.length;i++){ e=D[i]; if(e.e&&d>=e.d&&d<=e.e) return e; } return null; }
function iT(x){ return (x&&typeof x==='object')?x.t:x; }
function iId(e,gi,ii){ var x=e.g[gi].i[ii]; return (x&&typeof x==='object'&&x.id)?x.id:(e.k+'-'+gi+'-'+ii); }
function ids(e){ var r=[]; e.g.forEach(function(g,gi){ g.i.forEach(function(_,ii){ r.push(iId(e,gi,ii)); }); }); return r; }
function st(e){ if(e.libur) return {done:0,total:0,pct:0,libur:true}; var a=ids(e), n=0; a.forEach(function(x){ if(S[x]) n++; }); return {done:n,total:a.length,pct:a.length?Math.round(n/a.length*100):0}; }
function cls(s){ return s.libur?3:s.done===0?0:(s.done>=s.total?2:1); }
var STX=['BELUM DIMULAI','SEDANG DIKERJAKAN','SELESAI','LIBUR'];
function overall(){ var d=0,t=0,seen={}; D.forEach(function(e){ ids(e).forEach(function(x){ if(seen[x]) return; seen[x]=1; t++; if(S[x]) d++; }); }); return {done:d,total:t,left:t-d,pct:t?Math.round(d/t*100):0}; }
function today(){ try{ return mcfaIso(mcfaNowJakarta()); }catch(e){ var n=new Date(); return n.getFullYear()+'-'+p2(n.getMonth()+1)+'-'+p2(n.getDate()); } }
function longDate(d){ var n=+d.slice(8); var w=new Date(2026,10,n).getDay(); return HARI[w]+', '+n+' NOVEMBER 2026'; }
function rngA(){ var a=mcfaParse(MCFA_CORE.adaptStart), b=mcfaParse(MCFA_CORE.adaptEnd); return a.getDate()+'–'+formatDateUpper(b); }
var LEG={}, DT={}, PREV=KEY+'_prev_v1', PREV2=KEY+'_prev_v2';
/* Skema v2 (3 NOV 2026): item ke-12 tanggal 3 NOV kini 'OLAHRAGA (DAY 3)'; 'Branding dan akun…' digabung ke tugas 4 NOV. Centang lama TIDAK dihapus: disalin utuh ke PREV, dan nilai item yang berganti makna disimpan di LEG (legacy), bukan dianggap selesai untuk tugas baru. */
var PREV3=KEY+'_prev_v3', MIG=false;
/* Skema v4 (4 NOV 2026, PEMBARUAN TOTAL TUGAS AWAL): daftar H 1–H 4 diganti; setiap tugas kini punya ID tetap (h1-…, h4-…). Data v3 disalin UTUH ke PREV3 sebelum ditulis ulang. Centang lama TIDAK dianggap selesai untuk tugas baru, kecuali tugas yang sama persis di hari yang sama (CARRY). Centang daftar dekorasi (dek-*) tidak diubah. */
var CARRY={'n1-0-2':'h1-jadwal-olahraga','n4-0-0':'h4-ucapan-caca','n4-0-1':'h4-print-a6'};
function migrateV4(raw,p){
  try{ if(!localStorage.getItem(PREV3)) localStorage.setItem(PREV3,raw); }catch(e){}
  var c=p.checks, out={};
  Object.keys(c).forEach(function(k){ if(k.indexOf('dek-')===0) out[k]=c[k]; else if(CARRY[k]) out[CARRY[k]]=c[k]; });
  var dt={}; Object.keys(DT).forEach(function(k){ if(out[k]) dt[k]=DT[k]; }); DT=dt;
  MIG=true; return out;
}
function load(){ try{ var r=localStorage.getItem(KEY); if(r){ var p=JSON.parse(r); if(p&&p.checks&&typeof p.checks==='object'){
  LEG=(p.legacy&&typeof p.legacy==='object')?p.legacy:{};
  DT=(p.dates&&typeof p.dates==='object')?p.dates:{};
  /* Skema v3 (Tahap 5): tanggal selesai per item. Data v2 disalin utuh ke PREV2 sebelum ditulis ulang; centang lama TIDAK diubah dan TIDAK diberi tanggal karangan. */
  if(p.v===2){ try{ if(!localStorage.getItem(PREV2)) localStorage.setItem(PREV2,r); }catch(e){} }
  if(!p.v||p.v<2){ try{ if(!localStorage.getItem(PREV)) localStorage.setItem(PREV,r); }catch(e){}
    if(p.checks['n3-0-11']){ LEG['n3-0-11']='Branding dan akun dari MC FATHUL ADZIM sampai CNE (dulu item 12 tanggal 3 NOV)'; delete p.checks['n3-0-11']; } }
  if(!p.v||p.v<4) return migrateV4(r,p);
  return p.checks; } } }catch(e){} return {}; }
function persistMig(){ if(MIG){ MIG=false; save(); } }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify({v:4,checks:S,legacy:LEG,dates:DT})); return true; }catch(e){ return false; } }
function late(){ return today()>LAST; }
function isDek(id){ return String(id).indexOf('dek-')===0; }
/* Centang TIDAK lagi mencatat/menampilkan tanggal & jam. Data tanggal lama (DT) tidak dihapus dari penyimpanan, hanya tidak ditampilkan; dibersihkan per item saat centang dibatalkan. */

function renderStrip(){
  var el=document.getElementById('tahStrip'); if(!el) return; var T=today(), h='';
  for(var n=+MCFA_CORE.taskStart.slice(8),k=0;k<MCFA_DERIVED.taskTotalDays;k++,n++){ var d=iso(n), e=entry(d), s=st(e), c=cls(s);
    h+='<button type="button" class="tah-t s'+c+(d===sel?' sel':'')+(d===T?' now':'')+'" data-d="'+d+'" aria-label="'+longDate(d)+' — '+STX[c]+' '+s.pct+'%"><small>'+HS[new Date(2026,10,n).getDay()]+'</small><b>'+n+'</b><i><u style="width:'+s.pct+'%"></u></i></button>'; }
  el.innerHTML=h;
}
function renderHead(){
  var el=document.getElementById('tahHead'); if(!el) return; var e=entry(sel), s=st(e), c=cls(s), dek=e.k==='dek', lt=late()&&dek&&s.done<s.total;
  var h='<div class="tah-dhead"><div><div class="tah-dt">'+longDate(sel)+'</div>'+(e.tema?'<div class="tah-tema">'+e.tema+'</div>':'')+'</div><span class="tah-chip s'+c+'">'+STX[c]+'</span></div>';
  if(dek) h+='<div class="tah-note">Satu daftar aktif <b>'+rngA()+'</b> — bukan tugas harian yang diulang. Centang kapan saja; progres sama di setiap tanggal. Centang yang salah bisa dibatalkan dengan mengetuknya lagi. Olahraga harian (pagi, sore, malam) dicentang di <b>Program Adaptasi</b> (mulai '+formatDateUpper(MCFA_CORE.adaptStart)+') dengan jadwal yang sama.</div>';
  if(lt) h+='<div class="tah-note tah-warn">Periode berakhir '+formatDateUpper(LAST)+'. '+(s.total-s.done)+' tugas masih BELUM SELESAI (tidak otomatis dianggap selesai).</div>';
  if(e.note) h+='<div class="tah-note">'+e.note+'</div>';
  if(e.libur){ h+='<div class="tah-libur"><b>LIBUR</b><span>Istirahat · Fresh · Recovery</span><small>Tanpa tugas dan tanpa kewajiban progres. Tidak masuk hitungan 196 tugas.</small></div>'; el.innerHTML=h; return; }
  h+=MCFA_WORKOUT.bar(sel)+'<div class="tah-dstat"><span><b>'+s.done+'</b> selesai</span><span><b>'+(s.total-s.done)+'</b> belum</span><span><b>'+s.pct+'%</b> '+(dek?'daftar dekorasi':'hari ini')+'</span></div><div class="ta-prog-track"><div class="ta-prog-fill" style="width:'+s.pct+'%"></div></div>';
  el.innerHTML=h;
}
function renderGroups(){
  var el=document.getElementById('tahGroups'); if(!el) return; var e=entry(sel), lt=late()&&e.k==='dek', h='';
  if(!e.g.length){ el.innerHTML='<div class="tah-libur tah-libur-body">🌿 Hari libur — nikmati istirahatmu.</div>'; counters(); return; }
  e.g.forEach(function(g,gi){
    var open=(e.g.length<=2||gi===0||g.o)?' open':'', n=g.s||1;
    h+='<div class="ta-block'+open+'"><div class="ta-block-header" style="background:linear-gradient(135deg,'+COL[gi%COL.length]+')"><span class="ta-block-title">'+g.t+'</span><span class="ta-block-count"></span></div><div class="ta-items">';
    g.i.forEach(function(x,ii){ var t=iT(x), id=iId(e,gi,ii), dn=!!S[id];
      h+='<div class="ta-item'+(dn?' done':'')+(lt&&!dn?' tah-late':'')+'" data-id="'+id+'" onclick="taToggle(this)"><span class="ta-cb"></span><span class="tah-n">'+(n+ii)+'.</span><span class="ta-label">'+t+'</span></div>'; });
    h+='</div></div>'; });
  el.innerHTML=h; counters();
}
function counters(){
  var e=entry(sel), lt=late()&&e.k==='dek';
  document.querySelectorAll('#tahGroups .ta-block').forEach(function(b,gi){
    var its=b.querySelectorAll('.ta-item'), n=0; its.forEach(function(x){ var id=x.dataset.id, dn=!!S[id]; if(dn) n++; x.classList.toggle('tah-late',lt&&!dn);
      var ds=x.querySelector('.tah-ds'); if(ds) ds.remove(); /* sisa tampilan tanggal lama (bila ada) dibuang — hanya centang */ });
    var c=b.querySelector('.ta-block-count'); if(c) c.textContent=(n===its.length&&n?'✓ ':'')+n+'/'+its.length; });
}
function taUpdate(){
  var o=overall(), v={'ta-fill':null,'ta-pct':o.pct+'%','ta-done':o.done,'ta-total':o.total,'ta-left':o.left};
  var f=document.getElementById('ta-fill'); if(f) f.style.width=o.pct+'%';
  Object.keys(v).forEach(function(k){ var x=document.getElementById(k); if(x&&v[k]!==null) x.textContent=v[k]; });
  renderStrip(); renderHead(); counters();
  if(typeof syncHeroProgress==='function') syncHeroProgress();
}
function taCbBurst(cb){
  var r=cb.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2, cl=['#10b981','#34d399','#6ee7b7','#fde68a','#1a56db','#ffffff'];
  for(var i=0;i<10;i++){ (function(ix){ var p=document.createElement('div'), sz=3+Math.random()*5, a=Math.random()*360, ds=20+Math.random()*35;
    p.style.cssText='position:fixed;left:'+cx+'px;top:'+cy+'px;width:'+sz+'px;height:'+sz+'px;background:'+cl[Math.floor(Math.random()*cl.length)]+';border-radius:50%;pointer-events:none;z-index:9997;animation:temaConfetti 0.55s ease-out '+(ix*0.015)+'s both;--dx:'+(Math.cos(a*Math.PI/180)*ds)+'px;--dy:'+(Math.sin(a*Math.PI/180)*ds-15)+'px;';
    document.body.appendChild(p); setTimeout(function(){ if(p.parentNode) p.parentNode.removeChild(p); },700+ix*15); })(i); }
}
function taToggle(el){
  var id=el&&el.dataset&&el.dataset.id; if(!id) return;
  var was=!!S[id];
  /* Semua item (termasuk daftar dekorasi) bisa dicentang dan dibatalkan kapan saja; tanpa tanggal/jam. */
  var oldDt=DT[id];
  if(was){ delete S[id]; delete DT[id]; } else { S[id]=true; delete DT[id]; }
  if(!save()){ if(was){ S[id]=true; if(oldDt) DT[id]=oldDt; } else { delete S[id]; } if(typeof showNotif==='function') showNotif('Gagal menyimpan. Coba lagi.'); return; }
  el.classList.toggle('done',!was); taUpdate();
  if(!was){ el.classList.remove('ta-just-unchecked'); el.classList.add('ta-just-checked'); setTimeout(function(){ el.classList.remove('ta-just-checked'); },450);
    var cb=el.querySelector('.ta-cb'); if(cb) taCbBurst(cb); if(navigator.vibrate) navigator.vibrate([10,20,8]); }
  else { el.classList.remove('ta-just-checked'); el.classList.add('ta-just-unchecked'); setTimeout(function(){ el.classList.remove('ta-just-unchecked'); },340); if(navigator.vibrate) navigator.vibrate(12); }
}
function taLoad(){ S=load(); persistMig(); if(root) { renderGroups(); taUpdate(); } }
function taResetAll(){
  if(!confirm('Reset semua checklist Tugas Awal ('+formatDateUpper(MCFA_CORE.taskStart)+' – '+formatDateUpper(MCFA_CORE.taskEnd)+')?')) return;
  var bS=JSON.parse(JSON.stringify(S)), bD=JSON.parse(JSON.stringify(DT));
  Object.keys(S).forEach(function(k){ delete S[k]; delete DT[k]; });
  if(!save()){ S=bS; DT=bD; if(typeof showNotif==='function') showNotif('Reset belum tersimpan. Coba lagi.'); return; }
  renderGroups(); taUpdate();
}
function select(d){ if(!entry(d)) return; sel=d; renderGroups(); taUpdate(); }
function init(){
  root=document.getElementById('tahRoot'); if(!root||root.dataset.ready) return; root.dataset.ready='1';
  S=load(); persistMig(); var T=today(); sel=T<D[0].d?D[0].d:(T>LAST?LAST:T);
  root.addEventListener('click',function(ev){
    var t=ev.target.closest&&ev.target.closest('.tah-t'); if(t){ select(t.dataset.d); return; }
    var h=ev.target.closest&&ev.target.closest('.ta-block-header'); if(h){ var b=h.closest('.ta-block'); if(b) b.classList.toggle('open'); }
  });
  renderGroups(); taUpdate();
}
window.taToggle=taToggle; window.taUpdate=taUpdate; window.taLoad=taLoad; window.taResetAll=taResetAll;
window.TAH={verify:function(){ var bad=[],own={}; ['n1','n2','n3','n4','n5'].forEach(function(k){ ids(D.filter(function(x){return x.k===k;})[0]).forEach(function(x){ own[x]=1; }); });
  var e7=D.filter(function(x){return x.k==='n7';})[0], a7=ids(e7), u={}; a7.forEach(function(x){ if(u[x]) bad.push('ID ganda di 7 NOV: '+x); u[x]=1; if(!own[x]) bad.push('ID 7 NOV tanpa tugas asal: '+x); });
  Object.keys(own).forEach(function(x){ if(!u[x]) bad.push('Tugas 1–5 tidak tampil di 7 NOV: '+x); });
  var l=entry('2026-11-06'); if(!l||!l.libur||ids(l).length) bad.push('6 NOV bukan LIBUR kosong');
  var seen={},n=0; D.forEach(function(e){ ids(e).forEach(function(x){ if(!seen[x]){ seen[x]=1; n++; } }); }); if(n!==overall().total) bad.push('total progres tidak sama dengan jumlah ID unik'); return bad; },stats:overall,select:select,legacy:function(){ return LEG; },dates:function(){ return DT; },
  next:function(){ for(var i=0;i<D.length;i++){ var e=D[i], a=ids(e); for(var j=0;j<a.length;j++){ if(!S[a[j]]){ for(var gi=0;gi<e.g.length;gi++) for(var ii=0;ii<e.g[gi].i.length;ii++) if(iId(e,gi,ii)===a[j]) return iT(e.g[gi].i[ii]); } } } return ''; }};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else setTimeout(init,0);
document.addEventListener('visibilitychange',function(){ if(!document.hidden&&root) taUpdate(); });
})();
