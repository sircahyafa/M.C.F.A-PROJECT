    /* ═══ PROGRAM ADAPTASI — MCFA_ADP ═══
       Sistem terpisah: kunci 'mcfa_adp_v1_YYYY-MM-DD' (checklist + catatan konten adaptasi) — TIDAK memakai 'ba_*' (Kegiatan Sehari-hari)
       dan tidak ikut statistik resmi Tahap 1. ID tugas stabil (bukan indeks). Periode & hitungan hari dari MCFA_CORE.adaptStart/adaptEnd. */
    (function(){
      'use strict';
      var PFX='mcfa_adp_v1_', BKP='mcfa_backup_pre_adaptasi_v1';
      /* ═ SUMBER TUNGGAL (build 20261107.4) ═
         Daftar tugas rutinitas Program Adaptasi TIDAK ditulis ulang di sini. Nama, urutan, kategori, dan penempatan dibaca langsung dari Kegiatan Sehari-hari (#ba-blk-* di index.html)
         pada saat render, sehingga kedua halaman tidak mungkin berbeda. Tidak ada peningkatan bertahap: semua tanggal 8–20 NOV memakai daftar yang sama.
         Hanya yang dipertahankan: ID tugas lama (LEGACY_ID) agar centang yang sudah tersimpan tetap terbaca, dan status centang tetap terpisah per tanggal. */
      var BLOCKS=[
        {id:"pagi", t:"Pagi Hari", ic:"mi-sunrise", bg:"linear-gradient(135deg,#ff6b35,#f7931e)", src:"ba-blk-0"},
        {id:"siang", t:"Siang Hari", ic:"mi-sun", bg:"linear-gradient(135deg,#0ea5e9,#0284c7)", src:"ba-blk-2"},
        {id:"sore", t:"Sore Hari", ic:"mi-mosque", bg:"linear-gradient(135deg,#f59e0b,#d97706)", src:"ba-blk-4"},
        {id:"boxing", t:"Latihan Boxing", ic:"mi-glove", bg:"linear-gradient(135deg,#dc2626,#7f1d1d)", src:"ba-blk-boxing"},
        {id:"malam", t:"Malam Hari", ic:"mi-moon", bg:"linear-gradient(135deg,#4f46e5,#312e81)", src:"ba-blk-6"},
        {id:"tidur", t:"Menjelang Tidur", ic:"mi-galaxy", bg:"linear-gradient(135deg,#0f172a,#1e1b4b)", src:"ba-blk-8"}
      ];
      /* ID tugas per kunci data-bk di Kegiatan Sehari-hari: 48 ID lama (checklist yang sudah tersimpan tetap terbaca). Kunci yang tidak ada di sini memakai "adp_"+data-bk. */
      var LEGACY_ID={"item_0":"adp_pg_bangun","item_1":"adp_pg_afirmasi","item_2":"adp_pg_air","item_3":"adp_pg_buah","item_4":"adp_pg_pemanasan","item_5":"adp_pg_makan","item_6":"adp_pg_kasur","item_7":"adp_pg_olahraga","item_8":"adp_pg_rumah","item_9":"adp_pg_suplemen","item_10":"adp_pg_mandi","item_11":"adp_pg_tahajud","item_12":"adp_pg_subuh","item_13":"adp_pg_qhodo_subuh1","item_16":"adp_pg_grounding","item_17":"adp_pg_lari","item_18":"adp_pg_mata","item_19":"adp_pg_makan2","item_20":"adp_pg_mandi2","item_21":"adp_pg_dhuha","item_22":"adp_sg_dzuhur","item_23":"adp_sg_qhodo_dzuhur1","item_26":"adp_sg_makan","item_27":"adp_sr_ashar","item_28":"adp_sr_qhodo_ashar1","wk_leg":"adp_sr_kaki","item_31":"adp_sr_boxing","item_32":"adp_sr_sparring","item_33":"adp_sr_footwork","item_34":"adp_sr_abc","item_35":"adp_sr_plyo","item_36":"adp_sr_cooldown","item_37":"adp_ml_magrib","item_38":"adp_ml_qhodo_magrib1","item_41":"adp_ml_isya","item_42":"adp_ml_qhodo_isya1","item_45":"adp_ml_makan","item_47":"adp_td_olahraga_tangan","item_46":"adp_td_makan5","item_48":"adp_td_calisthenics","item_49":"adp_td_belajar","item_50":"adp_td_buah","item_51":"adp_td_pemanasan","item_52":"adp_td_mandi","item_53":"adp_td_taubat","item_54":"adp_td_dzikir","item_55":"adp_td_vc","item_56":"adp_td_tidur"};
      /* Keputusan pengguna (6 NOV 2026): Program Adaptasi hanya memakai Qhodo (1) per waktu sholat. Qhodo (2) dan (3) tetap ada di Kegiatan Sehari-hari, tidak di Adaptasi. Hanya 10 kunci ini yang boleh berbeda dari Sehari-hari. */
      var ADP_SKIP={"item_14":1,"item_15":1,"item_24":1,"item_25":1,"item_29":1,"item_30":1,"item_39":1,"item_40":1,"item_43":1,"item_44":1};
      var CAT=null;
      function catalog(){
        if(CAT) return CAT;
        var out=[], total=0;
        BLOCKS.forEach(function(b){
          var root=document.getElementById(b.src), its=[];
          if(root) Array.prototype.forEach.call(root.querySelectorAll('.ba-item'),function(el,idx){
            if(el.classList.contains('ba-prod-item')) return;
            var bk=el.getAttribute('data-bk'); if(!bk||ADP_SKIP[bk]) return;
            var lb=el.querySelector('.ba-label'), base=((lb&&lb.dataset&&lb.dataset.wkBase)||(lb?lb.textContent:'')).replace(/\s+/g,' ').trim();
            its.push({id:LEGACY_ID[bk]||('adp_'+bk), bk:bk, label:base, kind:el.getAttribute('data-wk')||'', src:b.src, idx:its.length});
          });
          total+=its.length; out.push({id:b.id,t:b.t,ic:b.ic,bg:b.bg,src:b.src,items:its});
        });
        if(total>0) CAT=out;   /* jangan simpan hasil kosong bila halaman belum selesai dimuat */
        return out;
      }
      function allIds(){ var a=[]; catalog().forEach(function(b){ b.items.forEach(function(i){ a.push(i.id); }); }); return a; }
      function P(){ return {s:mcfaParse(MCFA_CORE.adaptStart), e:mcfaParse(MCFA_CORE.adaptEnd)}; }
      function today(){ return mcfaNowJakarta(); }
      function iso(d){ return mcfaIso(d); }
      function esc(x){ return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
      function clampDate(d){ var p=P(); return d<p.s?p.s:(d>p.e?p.e:d); }
      function read(k){ try{ var r=localStorage.getItem(PFX+k); if(!r) return {checks:{},note:''}; var o=JSON.parse(r), c=o.checks||{};
          if(c.adp_pg_latihan!==undefined && c.adp_pg_lari===undefined) c.adp_pg_lari=c.adp_pg_latihan;   /* build 20261104.1 sempat memakai ID ganda untuk Running; centangnya disatukan ke ID asli */
          return {checks:c,note:o.note||''}; }catch(e){ return {checks:{},note:''}; } }
      function write(k,rec){ try{ localStorage.setItem(PFX+k, JSON.stringify({v:1,date:k,checks:rec.checks,note:rec.note||'',updated:new Date().toISOString()})); return true; }catch(e){ return false; } }
      function dayNoOf(k){ return mcfaDaysBetween(mcfaParse(MCFA_CORE.adaptStart),mcfaParse(k))+1; }
      /* ── TUGAS TAMBAHAN (tanpa batas jumlah) ── disimpan di 'mcfa_adp_custom_v1' = daftar {id,cat,t,from,until}. Tugas muncul mulai hari ia ditambahkan sampai akhir Adaptasi
         (atau sampai hari sebelum dihapus), centang per hari tersimpan di catatan harian yang sama dengan tugas bawaan. */
      var CUS='mcfa_adp_custom_v1';
      var CATS=[{id:'pagi',b:'pagi'},{id:'prod-pagi',t:'Produksi Konten — Pagi',slot:'pagi'},{id:'siang',b:'siang'},{id:'prod-siang',t:'Produksi Konten — Siang',slot:'siang'},
        {id:'sore',b:'sore'},{id:'boxing',b:'boxing'},{id:'prod-sore',t:'Produksi Konten — Sore',slot:'sore'},{id:'malam',b:'malam'},{id:'prod-malam',t:'Produksi Konten — Malam',slot:'malam'},{id:'tidur',b:'tidur'}];
      var PROD_BG='linear-gradient(135deg,#1a56db,#7c3aed)';
      var open={};   /* kategori yang sedang dibuka — default semua tertutup */
      var focus=null;   /* kategori yang sedang difokuskan lewat strip pill (null = Semua), sama seperti strip pill Kegiatan Sehari-hari */
      function cRead(){ try{ var o=JSON.parse(localStorage.getItem(CUS)||'null'); if(o&&Array.isArray(o.tasks)) return o.tasks.filter(function(t){ return t&&t.id&&t.cat&&t.t&&t.from; }); }catch(e){} return []; }
      function cWrite(a){ try{ localStorage.setItem(CUS,JSON.stringify({v:1,tasks:a,updated:new Date().toISOString()})); return true; }catch(e){ return false; } }
      function customFor(k,cat){ return cRead().filter(function(t){ return t.from<=k && (!t.until||k<=t.until) && (!cat||t.cat===cat); }); }
      function activeIds(k){ return allIds().concat(customFor(k).map(function(t){ return t.id; })); }
      function nOf(k){ return activeIds(k).length; }
      function doneCount(rec,k){ var n=0; activeIds(k).forEach(function(id){ if(rec.checks[id]===true) n++; }); return n; }
      function ck(k){ try{ return (window.MCFA_ADPP&&MCFA_ADPP.count)?MCFA_ADPP.count(k):{total:0,done:0}; }catch(e){ return {total:0,done:0}; } }
      function totalOf(k){ return nOf(k)+ck(k).total; }                 /* rutinitas + konten yang terjadwal pada tanggal itu */
      function doneOf(rec,k){ return doneCount(rec,k)+ck(k).done; }
      function pct(a,b){ return b>0?Math.round(a/b*100):0; }
      function notif(m){ try{ if(typeof showNotif==='function') showNotif(m); }catch(e){} }

      var view=iso(clampDate(today())), lastToday=iso(today()), noteTimer=null;

      function programStats(){
        var p=P(), days=mcfaDaysInclusive(MCFA_CORE.adaptStart,MCFA_CORE.adaptEnd), done=0, full=0, tot=0, rows=[];
        for(var i=0;i<days;i++){ var d=new Date(p.s.getFullYear(),p.s.getMonth(),p.s.getDate()+i), k=iso(d), r=read(k), c=doneOf(r,k), tN=totalOf(k); done+=c; tot+=tN; if(c===tN) full++; rows.push({k:k,d:d,n:i+1,c:c,t:tN}); }
        return {days:days,done:done,total:tot,full:full,rows:rows};
      }
      function heroSync(){
        var t=iso(clampDate(today())), c=doneOf(read(t),t), N=totalOf(t), started=today()>=P().s;
        var f=document.getElementById('adp-hero-fill'), d=document.getElementById('adp-hero-done'), tt=document.getElementById('adp-hero-total'), pp=document.getElementById('adp-hero-pct');
        var v=started?c:0; if(f) f.style.width=pct(v,N)+'%'; if(d) d.textContent=v; if(tt) tt.textContent=N; if(pp) pp.textContent=pct(v,N)+'%';
      }
      /* ringkasan produksi konten per akun (dihitung dari tahap produksi) — bagian dari kartu Progres program, bukan halaman terpisah */
      function accHtml(){
        try{ if(!(window.MCFA_ADPP&&MCFA_ADPP.accountProgress)) return ''; var cl=MCFA_ADPP.collected(), ap=MCFA_ADPP.accountProgress();
          return '<div class="adp-sub" style="margin-top:6px">Konten siap upload '+cl.ready+' / '+cl.target+' · belum ada yang dipublikasikan (upload resmi mulai '+formatDateUpper(MCFA_CORE.projectStart)+')</div><div class="adp-acc">'+
            MCFA_ADPP.accounts.map(function(a){ var r=ap[a]; return '<span><b>'+esc(r.name)+'</b> '+pct(r.done,r.total)+'%</span>'; }).join('')+'</div>'; }catch(e){ return ''; }
      }
      function blockById(id){ var c=catalog(); for(var i=0;i<c.length;i++) if(c[i].id===id) return c[i]; return null; }
      /* Visual tugas (tampilan saja; nama, ID, urutan, centang tidak berubah): warna = kategori, tebal = tingkat penting, emoji hanya tugas kunci. */
      function vis(t){ var l=String(t).toLowerCase(), q=/qhodo/.test(l), c='', w=4, em='';
        if(/sholat|salat|qhodo|tahajud|subuh|dzuhur|zuhur|ashar|maghrib|isya|dzikir|wudhu/.test(l)) c='ibadah';
        else if(/olahraga|running|strength|boxing|calisthenics|pemanasan|latihan|samsak|pull ?up|angkat|footwork|drill|plyometric|pendinginan|stretching|sparring/.test(l)) c='olahraga';
        else if(/makan|minum|air|buah|suplemen|vitamin/.test(l)) c='gizi';
        else if(/belajar|baca|edit|konten|upload/.test(l)) c='belajar';
        else if(/tidur|istirahat/.test(l)) c='tidur';
        else if(/vc|sayang/.test(l)) c='relasi';
        else if(/mandi|bereskan|rapi|kasur|rumah|sapu|pel|bersih/.test(l)) c='rutin';
        if(/sholat|salat|qhodo|tahajud|subuh|dzuhur|zuhur|ashar|maghrib|isya|olahraga|running|strength|boxing|belajar|upload|konten/.test(l)) w=7;
        else if(/makan berat|mandi|afirmasi|dzikir|tidur|vc|pemanasan|calisthenics/.test(l)) w=6;
        if(!q){ if(/tahajud/.test(l)) em='🌙'; else if(/^(sholat )?(subuh|dzuhur|zuhur|ashar|maghrib|isya)/.test(l)) em='🕌'; else if(/running/.test(l)) em='🏃'; else if(/strength/.test(l)) em='💪'; else if(/boxing/.test(l)) em='🥊'; else if(/makan berat/.test(l)) em='🍽️'; else if(/^belajar$/.test(l)) em='📚'; else if(/vc sama/.test(l)) em='💕'; else if(/^tidur/.test(l)) em='😴'; }
        return {c:c,w:w,em:em}; }
      
function itemLabel(i,view,bid){ return i.kind ? MCFA_WORKOUT.item(i.kind,view) : MCFA_WORKOUT.relabel(i.label,view,bid); }
      function render(){
        var root=document.getElementById('adpRoot'); if(!root) return;
        var p=P(), vd=mcfaParse(view), now=today(), started=now>=p.s, rec=read(view), N=totalOf(view), c=doneOf(rec,view), pc=pct(c,N);
        var dayNo=mcfaDaysBetween(p.s,vd)+1, total=mcfaDaysInclusive(MCFA_CORE.adaptStart,MCFA_CORE.adaptEnd);
        var isToday=iso(now)===view, st=programStats();
        var status=c===0?'BELUM':(c===N?'SELESAI':'SEBAGIAN');
        var sub=!started?('BELUM DIMULAI · MULAI '+formatDateUpper(MCFA_CORE.adaptStart)):(now>p.e&&isToday===false&&view===MCFA_CORE.adaptEnd?'PROGRAM SELESAI · HARI KE-'+dayNo+' DARI '+total:'HARI KE-'+dayNo+' DARI '+total);
        var cuAll=customFor(view), cuDone=0; cuAll.forEach(function(t){ if(rec.checks[t.id]===true) cuDone++; });
        var h='';
        h+='<div class="adp-top"><b>PROGRAM ADAPTASI<small>Kebutuhan utama sebelum DAY 1 · '+formatDateUpper(MCFA_CORE.adaptStart)+' – '+formatDateUpper(MCFA_CORE.adaptEnd)+'</small></b><button class="adp-btn" onclick="MCFA_ADP.reset()">↺ Reset</button></div>';
        h+='<div class="adp-nav"><button class="adp-btn" onclick="MCFA_ADP.go(-1)"'+(view===MCFA_CORE.adaptStart?' disabled':'')+' aria-label="Hari sebelumnya">‹</button>'+
           '<div class="adp-nav-c">'+(isToday?'<span class="adp-badge">HARI INI</span> ':'')+formatDayUpper(vd)+', '+formatDateUpper(vd)+'<em>'+sub+'</em></div>'+
           '<button class="adp-btn" onclick="MCFA_ADP.go(1)"'+(view===MCFA_CORE.adaptEnd?' disabled':'')+' aria-label="Hari berikutnya">›</button></div>';
        h+='<div class="adp-card"><div class="adp-pr"><span>Progres hari ini · '+status+'</span><span>'+pc+'%</span></div><div class="adp-track"><div class="adp-fill" style="width:'+pc+'%"></div></div><div class="adp-sub">'+c+' / '+N+' tugas selesai · rutinitas '+(doneCount(rec,view)-cuDone)+' / '+(nOf(view)-cuAll.length)+(cuAll.length?' · tugas tambahan '+cuDone+' / '+cuAll.length:'')+' · produksi konten '+ck(view).done+' / '+ck(view).total+'</div></div>';
        /* Kartu Qhodo — struktur yang sama dengan Kegiatan Sehari-hari; murni turunan dari tugas Qhodo yang aktif hari itu (tidak ada data baru) */
        var qIds=activeIds(view).filter(function(id){ return /^adp_.*qhodo/.test(id); }), qD=0; qIds.forEach(function(id){ if(rec.checks[id]===true) qD++; });
        h+='<div class="adp-card adp-qh"><div class="adp-pr"><span>Sholat Qhodo Hari Ini</span><span>'+pct(qD,qIds.length)+'%</span></div><div class="adp-track"><div class="adp-fill" style="width:'+pct(qD,qIds.length)+'%"></div></div><div class="adp-sub">'+qD+' dari '+qIds.length+' qhodo selesai hari ini · melunasi sholat yang tertinggal sejak sebelum Day 1'+(qIds.length?'':' ')+'</div></div>';
        h+='<div class="adp-card"><div class="adp-pr"><span>Progres program</span><span>'+pct(st.done,st.total)+'%</span></div><div class="adp-track"><div class="adp-fill" style="width:'+pct(st.done,st.total)+'%"></div></div><div class="adp-sub">'+st.done+' / '+st.total+' tugas · hari lengkap '+st.full+' / '+st.days+'</div>'+accHtml()+'<div class="adp-hist">';
        st.rows.forEach(function(r){ var pp=pct(r.c,r.t), col=pp===0?'#e2e8f0':pp<50?'#fde68a':pp<100?'#6ee7b7':'#10b981';
          h+='<div class="adp-dot'+(r.k===view?' view':'')+(r.k===iso(now)?' today':'')+'" style="background:'+col+'" onclick="MCFA_ADP.open(\''+r.k+'\')" title="Hari ke-'+r.n+' · '+r.t+' tugas: '+pp+'% selesai">'+r.n+'</div>'; });
        h+='</div></div>';
        /* Kategori = struktur & urutan yang sama dengan Kegiatan Sehari-hari. Tahap 1: hitung data tiap kategori (dipakai strip pill & kartu). */
        var cd=CATS.map(function(ct){
          var b=ct.b?blockById(ct.b):null, its=b?b.items:[], cu=customFor(view,ct.id);
          var pc2={total:0,done:0}, pHtml='';
          if(ct.slot){ try{ if(window.MCFA_ADPP&&MCFA_ADPP.slotHtml){ pc2=MCFA_ADPP.slotCount(view,ct.slot); pHtml=MCFA_ADPP.slotHtml(view,ct.slot); } }catch(e){} }
          var bd=0; its.forEach(function(i){ if(rec.checks[i.id]===true) bd++; }); cu.forEach(function(t){ if(rec.checks[t.id]===true) bd++; });
          return {ct:ct,b:b,its:its,cu:cu,pc2:pc2,pHtml:pHtml,bd:bd,tot:its.length+cu.length+pc2.total,title:b?b.t:ct.t,bg:b?b.bg:PROD_BG,ic:b?b.ic:'mi-clapper'};
        });
        if(focus&&!cd.some(function(x){ return x.ct.id===focus; })) focus=null;
        /* Strip pill horizontal (komponen yang sama dengan Kegiatan Sehari-hari): ketuk pill = fokus ke satu kategori, "Semua" = kembali ke grid */
        h+='<div class="block-pill-strip adp-pills"><button type="button" class="bps-pill bps-pill-all'+(focus?'':' active')+'" onclick="MCFA_ADP.focus(null)"><span class="bps-pill-label">Semua</span></button>'+
          cd.map(function(x){ return '<button type="button" class="bps-pill'+(focus===x.ct.id?' active':(focus?' bps-dim':''))+'" style="background:'+x.bg+'" onclick="MCFA_ADP.focus(\''+x.ct.id+'\')"><span class="bps-pill-icon"><svg class="mi" aria-hidden="true"><use href="#'+x.ic+'"/></svg></span><span class="bps-pill-label">'+esc(x.title)+'</span><span class="bps-pill-count">'+(x.bd+x.pc2.done)+'/'+x.tot+'</span></button>'; }).join('')+'</div>';
        h+=MCFA_WORKOUT.bar(view);
        /* Tahap 2: grid kategori berdampingan; kategori yang dibuka melebar penuh (lihat CSS .adp-grid). Daftar tugas tampil setelah kategori diketuk. */
        h+='<div class="adp-grid'+(focus?' adp-focused':'')+'">';
        cd.forEach(function(x){
          var ct=x.ct, b=x.b, its=x.its, cu=x.cu, pHtml=x.pHtml, tot=x.tot, bd=x.bd, pc2=x.pc2, title=x.title, bg=x.bg, ic=x.ic;
          if(focus&&focus!==ct.id) return;
          var isOpen=focus?true:open[ct.id]===true, dn=bd+pc2.done;
          h+='<div class="adp-block'+(isOpen?' open':'')+'" data-cat="'+ct.id+'"><div class="adp-bh" style="background:'+bg+'" role="button" tabindex="0" aria-expanded="'+isOpen+'" onclick="MCFA_ADP.cat(\''+ct.id+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();MCFA_ADP.cat(\''+ct.id+'\');}"><svg class="mi" aria-hidden="true"><use href="#'+ic+'"/></svg><span>'+esc(title)+'</span><i>'+dn+' / '+tot+'</i><u class="adp-chev" aria-hidden="true"></u><em class="adp-mini" aria-hidden="true"><b style="width:'+pct(dn,tot)+'%"></b></em></div><div class="adp-body">';
          its.forEach(function(i){ var lbl=itemLabel(i,view,b.id), vs=vis(lbl); h+='<div class="adp-it adp-w'+vs.w+(rec.checks[i.id]===true?' done':'')+'"'+(vs.c?' data-cat="'+vs.c+'"':'')+' onclick="MCFA_ADP.toggle(\''+i.id+'\')"><span class="adp-cb"></span><span class="adp-lb">'+esc(lbl)+(vs.em?' <span class="adp-em" aria-hidden="true">'+vs.em+'</span>':'')+'</span></div>'; });
          cu.forEach(function(t){ h+='<div class="adp-it adp-cu'+(rec.checks[t.id]===true?' done':'')+'" onclick="MCFA_ADP.toggle(\''+t.id+'\')"><span class="adp-cb"></span><span class="adp-lb">'+esc(t.t)+'</span><button type="button" class="adp-del" aria-label="Hapus tugas" onclick="event.stopPropagation();MCFA_ADP.del(\''+t.id+'\')">×</button></div>'; });
          h+=pHtml;
          if(!its.length&&!cu.length&&!pHtml) h+='<div class="adp-empty">Belum ada tugas di kategori ini.</div>';
          h+='<div class="adp-add"><input type="text" id="adp-in-'+ct.id+'" maxlength="120" autocomplete="off" placeholder="Tambah tugas baru…" onkeydown="if(event.key===\'Enter\'){event.preventDefault();MCFA_ADP.add(\''+ct.id+'\');}"><button type="button" class="adp-btn" onclick="MCFA_ADP.add(\''+ct.id+'\')">+ Tambah</button></div></div></div>';
        });
        h+='</div>';
        h+='<div class="adp-card adp-note"><label for="adpNote">Catatan konten adaptasi (hari ini)</label><textarea id="adpNote" placeholder="Ide, progres edit, atau hasil konten masa adaptasi — dicatat terpisah dari statistik resmi project." oninput="MCFA_ADP.note(this.value)">'+esc(rec.note)+'</textarea><div class="adp-sub">Konten masa adaptasi tidak mengubah statistik resmi project yang dimulai '+formatDateUpper(MCFA_CORE.projectStart)+'.</div></div>';
        root.innerHTML=h; heroSync();
        try{ var dv=root.querySelector('.adp-dot.view'), hs=dv&&dv.parentNode; if(hs) hs.scrollLeft=dv.offsetLeft-hs.clientWidth/2+dv.offsetWidth/2; }catch(e){}
        try{ var pa=root.querySelector('.adp-pills .bps-pill.active:not(.bps-pill-all)'), ps=pa&&pa.parentNode; if(ps) ps.scrollLeft=pa.offsetLeft-ps.clientWidth/2+pa.offsetWidth/2; }catch(e){}
      }
      function canEdit(){
        var now=today(), p=P(), vd=mcfaParse(view);
        if(now<p.s){ notif('Program Adaptasi dimulai '+formatDateUpper(MCFA_CORE.adaptStart)+'.'); return false; }
        if(vd>now){ notif('Hari ini belum tiba — checklist hanya bisa diisi sampai hari ini.'); return false; }
        return true;
      }
      var api={
        view:function(){ return view; },
        toggle:function(id){ if(activeIds(view).indexOf(id)<0||!canEdit()) return; var r=read(view); r.checks[id]=!(r.checks[id]===true);
          if(!write(view,r)){ notif('Gagal menyimpan. Coba lagi.'); return; } try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){} render(); },
        cat:function(id){ open[id]=!(open[id]===true); var el=document.querySelector('#adpRoot .adp-block[data-cat="'+id+'"]'); if(el){ el.classList.toggle('open',open[id]); var hd=el.querySelector('.adp-bh'); if(hd) hd.setAttribute('aria-expanded',open[id]?'true':'false'); if(open[id]&&el.scrollIntoView){ try{ el.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){} } } },
        focus:function(id){ focus=(id&&focus!==id)?id:null; if(focus) open[focus]=true; render(); var ps=document.querySelector('#adpRoot .adp-pills'); if(ps&&ps.scrollIntoView){ try{ ps.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){} } },
        add:function(cat){ if(!CATS.some(function(x){ return x.id===cat; })) return; var inp=document.getElementById('adp-in-'+cat), v=inp?inp.value.replace(/\s+/g,' ').trim():''; if(!v){ notif('Tulis nama tugasnya dulu.'); return; }
          var all=cRead(), dup=all.some(function(t){ return t.cat===cat && t.t.toLowerCase()===v.toLowerCase() && t.from<=view && (!t.until||view<=t.until); });
          if(dup){ notif('Tugas itu sudah ada di kategori ini.'); return; }
          all.push({id:'adc_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),cat:cat,t:v.slice(0,120),from:view,until:null});
          if(!cWrite(all)){ notif('Gagal menyimpan. Coba lagi.'); return; } open[cat]=true; render();
          setTimeout(function(){ var n=document.getElementById('adp-in-'+cat); if(n) n.focus(); },30); },
        del:function(id){ var all=cRead(), t=null; all.forEach(function(x){ if(x.id===id) t=x; }); if(!t) return;
          if(!confirm('Hapus tugas "'+t.t+'" mulai hari ini? Riwayat hari-hari sebelumnya tetap tersimpan.')) return;
          var prev=iso(new Date(mcfaParse(view).getFullYear(),mcfaParse(view).getMonth(),mcfaParse(view).getDate()-1));
          if(prev<t.from) all=all.filter(function(x){ return x.id!==id; }); else t.until=prev;
          if(!cWrite(all)){ notif('Gagal menyimpan. Coba lagi.'); return; } render(); },
        /* Audit jadwal olahraga: setiap hari Adaptasi (8–20 NOV) tepat 1 Angkat Beban, 1 sesi utama (= jadwal mingguan), 1 Latihan Kaki, 1 Latihan Lengan; nama Running/Strength hanya sekali;
           penempatan Pagi/Sore/Malam; dan sama dengan Kegiatan Sehari-hari (DOM #body-harian). Hasil kosong = konsisten. */
        audit:function(){ var bad=[], where={lift:'pagi',main:'pagi',leg:'sore',arm:'malam'}, ba={lift:'ba-blk-0',main:'ba-blk-0',leg:'ba-blk-4',arm:'ba-blk-6'}, nm=['Running','Strength Training'];
          var days=mcfaDaysInclusive(MCFA_CORE.adaptStart,MCFA_CORE.adaptEnd), p0=P().s;
          for(var d=0;d<days;d++){ var dt=new Date(p0.getFullYear(),p0.getMonth(),p0.getDate()+d), k=iso(dt), cnt={}, sport=0;
            catalog().forEach(function(b){ b.items.forEach(function(i){ var lb=itemLabel(i,k,b.id);
              if(i.kind){ cnt[i.kind]=(cnt[i.kind]||0)+1; if(b.id!==where[i.kind]) bad.push(k+' '+lb+' di blok '+b.id+' (harusnya '+where[i.kind]+')'); if(i.src!==ba[i.kind]) bad.push(k+' '+lb+' sumber '+i.src+' ≠ '+ba[i.kind]); }
              if(nm.indexOf(lb)>=0||/Running|Strength/.test(lb)) sport++; }); });
            ['lift','main','leg','arm'].forEach(function(x){ if(cnt[x]!==1) bad.push(k+' '+x+' muncul '+(cnt[x]||0)+'×'); });
            if(sport!==1) bad.push(k+' nama Running/Strength muncul '+sport+'×');
            if(MCFA_WORKOUT.item('main',k)!==MCFA_WORKOUT.name(k)) bad.push(k+' sesi utama ≠ jadwal mingguan'); }
          var bd=document.querySelectorAll('#body-harian .ba-item[data-wk]'), bc={};
          bd.forEach(function(el){ var kd=el.dataset.wk, blk=el.closest('.ba-block'); bc[kd]=(bc[kd]||0)+1; if(!blk||blk.id!==ba[kd]) bad.push('Sehari-hari '+kd+' di '+(blk?blk.id:'?')+' (harusnya '+ba[kd]+')'); });
          ['lift','main','leg','arm'].forEach(function(x){ if(bc[x]!==1) bad.push('Sehari-hari '+x+' muncul '+(bc[x]||0)+'×'); });
          var bs=0; document.querySelectorAll('#body-harian .ba-item:not(.ba-prod-item) .ba-label').forEach(function(l){ if(/Running|Strength/.test(l.textContent)) bs++; }); if(bs!==1) bad.push('Sehari-hari: nama Running/Strength muncul '+bs+'×');
          return bad; },
        custom:function(k){ return customFor(k||view); }, customKey:CUS, categories:CATS.map(function(x){ return x.id; }),
        go:function(n){ var d=mcfaParse(view); d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+n); view=iso(clampDate(d)); render(); },
        open:function(k){ view=k; render(); },
        reset:function(){ if(!canEdit()) return; if(!confirm('Reset semua checklist Program Adaptasi untuk hari yang sedang dilihat?')) return;
          var r=read(view); r.checks={}; if(!write(view,r)) notif('Reset belum tersimpan. Coba lagi.'); render(); },
        note:function(v){ clearTimeout(noteTimer); var k=view; noteTimer=setTimeout(function(){ var r=read(k); r.note=String(v).slice(0,2000); write(k,r); },400); },
        stats:programStats, ids:allIds, catalog:catalog, dayCount:nOf, dayTotal:totalOf, dayNo:dayNoOf,
        verify:function(){   /* kosong = konsisten */
          var bad=[], seen={}, dom=0, mine=0, days=mcfaDaysInclusive(MCFA_CORE.adaptStart,MCFA_CORE.adaptEnd), p0=P().s, sig=null;
          BLOCKS.forEach(function(b){ document.querySelectorAll('#'+b.src+' .ba-item:not(.ba-prod-item)').forEach(function(el){ var bk=el.getAttribute('data-bk'); if(ADP_SKIP[bk]){ var t=(el.querySelector('.ba-label')||{}).textContent||''; if(!/^Qhodo .*\([23]\)$/.test(t.trim())) bad.push('ADP_SKIP bukan Qhodo (2)/(3): '+bk); } else dom++; }); });
          catalog().forEach(function(b){ b.items.forEach(function(i){ mine++; if(seen[i.id]) bad.push('ID ganda '+i.id); seen[i.id]=1; }); });
          if(dom!==mine) bad.push('jumlah tugas Adaptasi '+mine+' ≠ Kegiatan Sehari-hari '+dom);
          if(typeof RAMP_OFFSET!=='undefined') bad.push('RAMP_OFFSET masih ada');
          for(var d=0;d<days;d++){ var k=iso(new Date(p0.getFullYear(),p0.getMonth(),p0.getDate()+d)), s2=JSON.stringify(activeIds(k).filter(function(id){ return id.indexOf('adc_')!==0; }));
            if(sig===null) sig=s2; else if(s2!==sig) bad.push(k+' daftar tugas rutin berbeda dari hari pertama'); }
          if(document.querySelector('#adpRoot .adp-new')) bad.push('label BARU masih tampil');
          return bad; }, render:render, keyPrefix:PFX, backupKey:BKP,
        restoreBackup:function(){ var n=0; try{ var b=JSON.parse(localStorage.getItem(BKP)||'null'); if(!b||!b.items) return 0;
          Object.keys(b.items).forEach(function(k){ if(localStorage.getItem(k)===null){ localStorage.setItem(k,b.items[k]); n++; } }); }catch(e){} return n; }
      };
      window.MCFA_ADP=api;

      /* Backup otomatis SEKALI sebelum migrasi: salinan kunci ba_2026_11_1..20 (centang lama 1–20 NOV) dan Tugas Awal. Tidak menghapus / menimpa apa pun. */
      (function backupOnce(){ try{ if(localStorage.getItem(BKP)) return; var items={};
        for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i), m=/^ba_2026_11_(\d+)$/.exec(k||'');
          if((m&&+m[1]>=1&&+m[1]<=20)||/^mcfa_tugasAwal_/.test(k||'')) items[k]=localStorage.getItem(k); }
        localStorage.setItem(BKP, JSON.stringify({created:new Date().toISOString(),note:'Salinan sebelum pemisahan Program Adaptasi (v28). Data asli tidak diubah.',items:items})); }catch(e){} })();

      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render); else render();
      setInterval(function(){ var t=iso(today()); if(t!==lastToday){ var wasToday=(view===iso(clampDate(mcfaParse(lastToday)))); lastToday=t; if(wasToday) view=iso(clampDate(today())); render(); } },60000);
    })();

    /* ═══ [DINONAKTIFKAN DARI TAMPILAN ADAPTASI — 3 NOV 2026, Tahap 4] ═══
       Prompt master terbaru: tidak ada kewajiban/jadwal upload selama Adaptasi; upload resmi mulai 21 NOV 2026. Modul di bawah TIDAK lagi dirender di Adaptasi dan tidak ikut hitungan progres
       (diganti MCFA_ADPP — produksi konten). Kode & kunci 'mcfa_adpk_log_v1' DIPERTAHANKAN (riwayat lama aman). Pratinjau 21–22 NOV (official) masih dibaca halaman Akun; dirapikan di Tahap 6. */
    /* ═══ JADWAL KONTEN BERTAHAP (MASA ADAPTASI) — MCFA_ADPK (v2) ═══
       Mulai 3 NOV 2026 dari BARONGSUKMA, lalu akun lain (semua 10 akun posting + CNE) masuk bertahap sampai penuh sebelum 21 NOV 2026. v3: tugas konten tampil di dalam checklist Adaptasi (blok Produksi Konten per waktu, sesuai penempatan resmi) dan ikut progres harian/program.
       Jadwal UPLOAD dari pengguna (tiap upload = 2 konten): 3 NOV BS · 4 NOV OKK, ZA · 6 NOV AYLA, BS, KPC · 7 NOV OKK, ZA, ACK, LMS · 8 NOV ACK, LMS, MP (dipindah dari 5 NOV).
       Setelah 8 NOV (ekstrapolasi, bisa diubah): akun solo upload ulang tiap 3 hari (s.d. 11 NOV), 2 hari (12–15 NOV), lalu setiap hari (16 NOV dst).
       AYLA, KP.CIHUY, CNE = kolaborasi project adik: tidak dipatok, upload dicatat manual (opsional). 21 & 22 NOV = pratinjau hari resmi (tampilan saja).
       Tahapan: Ide → Produksi → Editing → Pemeriksaan → Upload (1 tahap/hari). Upload pertama (3–6 NOV) memakai stok dari persiapan sebelumnya.
       Kunci 'mcfa_adpk_log_v1' (hanya yang BENAR-BENAR dicentang) dipertahankan; konfigurasi lama 'mcfa_adpk_v1' tidak disentuh.
       TIDAK menyentuh 'mcfa_konten_*', 'mcfa_tahap1_*', 'ba_*' → tidak memengaruhi statistik resmi mulai 21 NOV 2026. */
    (function(){
      'use strict';
      var LOG='mcfa_adpk_log_v1', PREV='mcfa_adpk_log_v1_prev', PLAN_START='2026-11-03', PER_UP=2;
      var SOLO=['barongsukma','okk','zona','alley','lol','monkipedia','fathulmeme','mcfa'], COLLAB=['ayla','kpc'];   /* 10 akun posting + CNE (tim film) = 11 akun M.C.F.A STUDIO */
      var SLOTS=[['pagi','PAGI'],['siang','SIANG'],['sore','SORE'],['malam','MALAM']];
      /* Penempatan = blok Produksi Konten pada Kegiatan Sehari-hari (BA_BLOCK_OF_AKUN). Cadangan di bawah hanya dipakai jika peta resmi tidak ada; mcfa & cne tidak punya blok resmi. */
      var SLOT_UP={barongsukma:'pagi',okk:'pagi',zona:'pagi',ayla:'siang',alley:'siang',lol:'sore',monkipedia:'sore',kpc:'malam',fathulmeme:'malam',mcfa:'siang',cne:'malam'};
      function slotOf(a){ var m=(typeof BA_BLOCK_OF_AKUN!=='undefined')?BA_BLOCK_OF_AKUN:null; return (m&&m[a])||SLOT_UP[a]||'malam'; }
      var STAGES=[['ide','Membuat ide','siang'],['produksi','Produksi','siang'],['editing','Editing','sore'],['pemeriksaan','Pemeriksaan','sore'],['upload','Upload','']];
      var FIX={'2026-11-03':['barongsukma'],'2026-11-04':['okk','zona'],'2026-11-06':['ayla','barongsukma','kpc'],'2026-11-07':['okk','zona','alley','lol'],'2026-11-08':['alley','lol','monkipedia']};   /* upload Alley, Lol, Monkipedia dipindah dari 5 NOV ke 8 NOV (tanggal Adaptasi saat itu: 6 NOV; kini 8 NOV — modul ini tidak ditampilkan) */
      /* ekstrapolasi (bisa diubah): dua akun terdaftar yang belum punya jadwal, masuk bertahap SETELAH jadwal pengguna di atas */
      var ENTRY={'2026-11-09':['fathulmeme'],'2026-11-11':['mcfa']};
      var OFFICIAL={'2026-11-21':['barongsukma','okk','zona','alley','lol','monkipedia','fathulmeme','mcfa','ayla','kpc','cne'],'2026-11-22':SOLO.slice()};
      var GAP={ideal:4,normal:5,tol:7};
      var cacheU=null, cacheP=null;
      function today(){ return mcfaNowJakarta(); }
      function iso(d){ return mcfaIso(d); }
      function esc(x){ return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
      function notif(m){ try{ if(typeof showNotif==='function') showNotif(m); }catch(e){} }
      function order(){ return SOLO.concat(COLLAB); }
      function nameOf(id){ return (typeof AKUN!=='undefined'&&AKUN[id]&&AKUN[id].name)?AKUN[id].name:String(id).toUpperCase(); }
      function gapOf(k){ return k<'2026-11-12'?3:(k<'2026-11-16'?2:1); }
      function uploads(){
        if(cacheU) return cacheU;
        var m={}, last={}, E=MCFA_CORE.adaptEnd, d;
        Object.keys(FIX).sort().forEach(function(k){ m[k]=FIX[k].slice(); FIX[k].forEach(function(a){ if(SOLO.indexOf(a)>=0) last[a]=k; }); });
        Object.keys(ENTRY).sort().forEach(function(k){ m[k]=(m[k]||[]).concat(ENTRY[k]); ENTRY[k].forEach(function(a){ last[a]=k; }); });
        for(d=mcfaAddDays('2026-11-08',0); d<=E; d=mcfaAddDays(d,1)){
          SOLO.forEach(function(a){ if(last[a]&&mcfaAddDays(last[a],gapOf(last[a]))<=d){ (m[d]=m[d]||[]).push(a); last[a]=d; } });
        }
        return (cacheU=m);
      }
      function plan(){
        if(cacheP) return cacheP;
        var U0=uploads(), U={}, E=MCFA_CORE.adaptEnd, t=[], ord=order().concat(['cne']);
        Object.keys(U0).forEach(function(k){ U[k]=U0[k]; });
        Object.keys(OFFICIAL).forEach(function(k){ U[k]=OFFICIAL[k]; });   /* tahap persiapan (ide–pemeriksaan) untuk upload 21–22 NOV jatuh di masa adaptasi; upload-nya sendiri bukan tugas adaptasi */
        Object.keys(U).sort().forEach(function(u){ U[u].forEach(function(a){
          STAGES.forEach(function(st,si){ var d=mcfaAddDays(u,si-4); if(d<PLAN_START||d>E) return;
            t.push({id:'adpk2_'+a+'_'+u+'_'+st[0],acct:a,n:u,upload:u,stage:st[0],label:st[1],si:si,date:d,ai:ord.indexOf(a),slot:slotOf(a)}); }); }); });
        return (cacheP=t);
      }
      function optId(a,d){ return 'adpk2_'+a+'_'+d+'_kolab'; }
      function findTask(id){
        var t=plan().filter(function(x){ return x.id===id; })[0]; if(t) return t;
        var m=/^adpk2_(ayla|kpc)_(\d{4}-\d{2}-\d{2})_kolab$/.exec(id);
        if(m&&m[2]>=PLAN_START&&m[2]<=MCFA_CORE.adaptEnd) return {id:id,acct:m[1],date:m[2],stage:'kolab',opt:true};
        return null;
      }
      function readLog(){ try{ var o=JSON.parse(localStorage.getItem(LOG)||'null'); if(o&&o.done&&typeof o.done==='object') return o; }catch(e){} return {v:1,done:{}}; }
      function writeLog(o){ try{ var old=localStorage.getItem(LOG); if(old!==null) localStorage.setItem(PREV,old); o.v=1; o.updated=new Date().toISOString(); localStorage.setItem(LOG,JSON.stringify(o)); return true; }catch(e){ return false; } }
      var PIPE=[['TERJADWAL'],['IDE'],['PRODUKSI'],['EDITING'],['DIPERIKSA'],['UPLOAD']];
      function jobs(){   /* satu paket = satu upload (akun + tanggal upload); tahap = tahap TERTINGGI yang dicentang. Terjadwal ≠ sudah di-upload. */
        var T=plan(), L=readLog(), m={};
        T.forEach(function(x){ var k=x.acct+'|'+x.upload, j=m[k]||(m[k]={acct:x.acct,upload:x.upload,hi:-1}); if(L.done[x.id]&&x.si>j.hi) j.hi=x.si; });
        return Object.keys(m).map(function(k){ return m[k]; });
      }
      function pipeCounts(acct){ var c=[0,0,0,0,0,0]; jobs().forEach(function(j){ if(!acct||j.acct===acct) c[j.hi+1]++; }); return c; }
      function count(k){ var n=0,d=0,L=readLog(); plan().forEach(function(x){ if(x.date===k){ n++; if(L.done[x.id]) d++; } }); return {total:n,done:d}; }
      function slotHTML(view,sk){   /* blok 'Produksi Konten — <waktu>' di dalam checklist Adaptasi, meniru Kegiatan Sehari-hari */
        var L=readLog(), nowIso=iso(today()), F=formatDateUpper, lab={pagi:'Pagi',siang:'Siang',sore:'Sore',malam:'Malam'}[sk];
        var it=plan().filter(function(x){ return x.date===view&&x.slot===sk; }).sort(function(a,b){ return a.ai-b.ai||a.si-b.si; }); if(!it.length) return '';
        var dn=it.filter(function(x){ return L.done[x.id]; }).length;
        var h='<div class="adp-block"><div class="adp-bh" style="background:linear-gradient(135deg,#1a56db,#7c3aed)"><svg class="mi" aria-hidden="true"><use href="#mi-clapper"/></svg><span>Produksi Konten — '+lab+'</span><i>'+dn+' / '+it.length+'</i></div>';
        it.forEach(function(x){ var d=!!L.done[x.id], late=!d&&x.date<nowIso, up=x.stage==='upload';
          h+='<div class="adp-it'+(d?' done':'')+'" onclick="MCFA_ADPK.toggle(\''+x.id+'\')"><span class="adp-cb"></span><span class="adp-lb">'+(up?'Upload '+PER_UP+' konten':esc(x.label))+' · '+esc(nameOf(x.acct))+(up?'':' <small>(untuk upload '+F(x.upload)+')</small>')+(late?' <span class="adpk-late">TERTUNDA</span>':'')+(d&&up?' <span class="adpk-late" style="color:#047857">TERCATAT '+F(L.done[x.id])+'</span>':'')+'</span></div>'; });
        return h+'</div>';
      }
      function accStats(){
        var n=iso(today()), L=readLog(), T=plan();
        return order().map(function(id){
          var ups=T.filter(function(x){ return x.acct===id&&x.stage==='upload'; });
          var planned=ups.filter(function(x){ return x.date<=n; }).length;
          var dts=ups.filter(function(x){ return L.done[x.id]; }).map(function(x){ return L.done[x.id]; });
          Object.keys(L.done).forEach(function(k){ if(k.indexOf('adpk2_'+id+'_')===0&&/_kolab$/.test(k)) dts.push(L.done[k]); });
          dts.sort();
          var collab=COLLAB.indexOf(id)>=0, first=ups.length?ups[0].date:null, started=!!first&&first<=n;
          var last=dts.length?dts[dts.length-1]:null, gap=started?mcfaDaysBetween(mcfaParse(last||first),today()):null, st;
          if(!started) st=['BELUM MASUK','nx']; else if(collab) st=['FLEKSIBEL','']; else if(gap<=GAP.ideal) st=['IDEAL','ok']; else if(gap<=GAP.normal) st=['NORMAL','']; else if(gap<=GAP.tol) st=['TOLERANSI','wr']; else st=['TERLAMBAT','bad'];
          return {id:id,start:first,collab:collab,started:started,planned:planned,done:dts.length,total:ups.length,last:last,gap:gap,status:st,pipe:pipeCounts(id)};
        });
      }
      function summary(){ var s=accStats(); return {accounts:s.length,active:s.filter(function(x){return x.started;}).length,planned:s.reduce(function(a,x){return a+x.planned;},0),done:s.reduce(function(a,x){return a+x.done;},0),start:PLAN_START}; }
      function render(view){
        var el=document.getElementById('adpkRoot'); if(!el) return;
        var nowIso=iso(today()), T=plan(), L=readLog(), S=accStats(), sm=summary(), F=formatDateUpper, E=MCFA_CORE.adaptEnd;
        var ct=count(view), P=pipeCounts(), h='';
        h+='<div class="adp-card"><div class="adp-pr"><span>JADWAL KONTEN BERTAHAP</span><span>'+sm.active+' / '+sm.accounts+' akun</span></div>'+
           '<div class="adp-sub">Mulai '+F(PLAN_START)+' dari '+esc(nameOf('barongsukma'))+'; akun lain masuk bertahap. Tiap upload = '+PER_UP+' konten. Tugas konten hari ini ada di blok <b>Produksi Konten</b> di atas, ikut hitungan progres. Siap penuh '+F(MCFA_CORE.projectStart)+'.</div>'+
           '<div class="adpk-grid"><div><small>KONTEN HARI INI</small><b>'+ct.done+' / '+ct.total+'</b></div><div><small>UPLOAD SELESAI</small><b>'+sm.done+'</b></div><div><small>UPLOAD RENCANA</small><b>'+sm.planned+'</b></div></div></div>';
        h+='<div class="adp-card"><div class="adp-pr"><span>ALUR KONTEN ADAPTASI</span><span>'+jobs().length+' paket</span></div>'+
           '<div class="adpk-grid">'+PIPE.map(function(p,i){ return '<div><small>'+p[0]+'</small><b>'+P[i]+'</b></div>'; }).join('')+'</div>'+
           '<div class="adp-sub">Satu paket = satu upload ('+PER_UP+' konten), dihitung sekali pada tahap tertinggi yang dicentang. Hanya <b>UPLOAD</b> yang berarti sudah dipublikasikan; jadwal saja bukan upload.</div></div>';
        if(view>=PLAN_START&&view<=E){
          h+='<div class="adp-block"><div class="adp-bh" style="background:linear-gradient(135deg,#8b5cf6,#6366f1)"><span>Kolaborasi project adik · opsional</span></div>';
          COLLAB.forEach(function(a){ var id=optId(a,view), d=!!L.done[id];
            h+='<div class="adp-it'+(d?' done':'')+'" onclick="MCFA_ADPK.toggle(\''+id+'\')"><span class="adp-cb"></span><span class="adp-lb">Upload kolaborasi · '+esc(nameOf(a))+' <small>(tidak dipatok)</small></span></div>'; });
          h+='</div>'; }
        h+='<div class="adp-card"><div class="adp-pr"><span>URUTAN MASUK &amp; UPLOAD PER AKUN</span></div>';
        S.forEach(function(a){ var p=a.pipe; h+='<div class="adpk-row"><span><b>'+esc(nameOf(a.id))+'</b><br><small>'+(a.collab?'Kolaborasi · tanpa patokan interval':'Masuk '+F(a.start))+' · upload '+a.done+'/'+a.total+(a.last?' · terakhir '+F(a.last):'')+'<br>Terjadwal '+p[0]+' · Ide '+p[1]+' · Produksi '+p[2]+' · Edit '+p[3]+' · Diperiksa '+p[4]+' · Upload '+p[5]+'</small></span><span class="adpk-st '+a.status[1]+'">'+a.status[0]+'</span></div>'; });
        h+='<div class="adp-sub">Interval ideal 2–4 hari · normal maks. 5 · toleransi 7 hari. Rencana ≠ selesai: hanya yang dicentang masuk statistik aktual.</div></div>';
        h+='<div class="adp-card"><div class="adp-pr"><span>PRATINJAU HARI RESMI</span></div>';
        Object.keys(OFFICIAL).sort().forEach(function(k){ h+='<div class="adpk-row"><span><b>'+F(k)+' · DAY '+(mcfaDaysBetween(mcfaParse(MCFA_CORE.projectStart),mcfaParse(k))+1)+'</b><br><small>'+OFFICIAL[k].map(function(a){ return esc(nameOf(a)); }).join(' · ')+'</small></span></div>'; });
        h+='<div class="adp-sub">Hanya tampilan. Kolaborasi (AYLA, KP.CIHUY, CNE) fleksibel, beberapa hari sekali. Konten adaptasi tidak mengubah statistik resmi project '+F(MCFA_CORE.projectStart)+'.</div></div>';
        el.innerHTML=h;
      }
      function toggle(id){
        var t=findTask(id); if(!t) return;
        if(t.date>iso(today())){ notif('Tugas ini terjadwal '+formatDateUpper(t.date)+' — belum bisa dicentang.'); return; }
        var L=readLog(); if(L.done[id]) delete L.done[id]; else L.done[id]=iso(today());
        if(!writeLog(L)){ notif('Gagal menyimpan. Coba lagi.'); return; }
        try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){}
        if(window.MCFA_ADP) MCFA_ADP.render(); try{ document.dispatchEvent(new Event('mcfa:data')); }catch(e){}
      }
      function selfCheck(){
        var bad=[], U=uploads(), eq=function(l,a,b){ if(JSON.stringify(a)!==JSON.stringify(b)) bad.push(l+': '+JSON.stringify(a)+' ≠ '+JSON.stringify(b)); };
        Object.keys(FIX).forEach(function(k){ eq('upload '+k, U[k], FIX[k]); });
        Object.keys(ENTRY).forEach(function(k){ eq('akun baru masuk '+k, ENTRY[k].every(function(a){ return U[k].indexOf(a)>=0; }), true); });
        eq('adaptasi tidak upload sebelum 3 NOV', Object.keys(U).filter(function(k){ return k<PLAN_START; }), []);
        eq('hari penuh solo 18–20 NOV', ['2026-11-18','2026-11-19','2026-11-20'].map(function(k){ return U[k]&&SOLO.every(function(a){ return U[k].indexOf(a)>=0; }); }), [true,true,true]);
        eq('resmi 21 NOV = DAY 1', Object.keys(OFFICIAL).sort()[0], MCFA_CORE.projectStart);
        eq('resmi 21 NOV 11 akun', OFFICIAL[MCFA_CORE.projectStart].length, 11);
        if(typeof AKUN!=='undefined') eq('semua akun M.C.F.A STUDIO tercakup', Object.keys(AKUN).filter(function(id){ return order().concat(['cne']).indexOf(id)<0; }), []);
        eq('tiap akun punya paket upload di adaptasi', order().filter(function(a){ return !plan().some(function(x){ return x.acct===a&&x.stage==='upload'; }); }).filter(function(a){ return COLLAB.indexOf(a)<0; }), []);
        eq('tugas konten ditempatkan di blok resmi', plan().filter(function(x){ return x.slot!==slotOf(x.acct); }).length, 0);
        eq('resmi 22 NOV 6 akun solo', OFFICIAL[mcfaAddDays(MCFA_CORE.projectStart,1)], SOLO);
        eq('semua tugas dalam rentang rencana (PLAN_START s/d akhir Adaptasi)', plan().filter(function(x){ return x.date<PLAN_START||x.date>MCFA_CORE.adaptEnd; }).length, 0);
        eq('ID tugas unik', new Set(plan().map(function(x){return x.id;})).size, plan().length);
        return bad;
      }
      window.MCFA_ADPK={plan:plan,uploads:uploads,stats:accStats,summary:summary,render:render,toggle:toggle,count:count,slotHTML:slotHTML,jobs:jobs,pipe:pipeCounts,slotOf:slotOf,order:order,official:OFFICIAL,selfCheck:selfCheck,logKey:LOG,startDate:PLAN_START,gaps:GAP};
      if(window.MCFA_ADP&&document.readyState!=='loading') MCFA_ADP.render();
    })();
    
