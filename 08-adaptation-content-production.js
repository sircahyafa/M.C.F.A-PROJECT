    /* ═══ PRODUKSI KONTEN MASA ADAPTASI — MCFA_ADPP (v2, 3 NOV 2026) ═══
       Produksi konten MENYATU dengan Pagi/Siang/Sore/Malam di Tugas Adaptasi Harian (tidak ada bagian terpisah).
       Tiap waktu = SATU akun = SATU pekerjaan konten (maks. 4 per hari). Akun bergilir otomatis & berurutan (rotasi berkelanjutan antarhari)
       dari tanggal Adaptasi (MCFA_CORE.adaptStart), bukan acak. Tiap pekerjaan punya 6 tahap (Ide → Persiapan materi → Produksi → Editing →
       Pemeriksaan akhir → Siap upload) + judul/ide opsional. Data di kunci lama 'mcfa_adp_prod_v1' (days[tanggal][akun]['1']={t,s}) sehingga
       jembatan ke M.C.F.A STUDIO tetap sama. TIDAK ada status upload/publikasi; TIDAK menyentuh 'mcfa_konten_*' (selain jembatan Siap Upload),
       'mcfa_tahap1_*', 'ba_*'. Upload resmi baru mulai 21 NOV 2026. */
    (function(){
      'use strict';
      var KEY='mcfa_adp_prod_v1', IDX=1, TT=null;
      /* Urutan rotasi 8–18 NOV: 8 akun contoh pengguna (OKK, Zona, Alley's, LOL, Monkipedia, Ayla, KP.CIHUY, Fathul Al-Meme) lalu CNE.
         BARONGSUKMA dan MC FATHUL ADZIM TIDAK ikut rotasi dulu — keputusan pengguna: baru masuk 19–20 NOV (LATE_FROM), di waktu sesuai blok
         produksi resminya (Barongsukma = Pagi, MC Fathul Adzim = Siang); dua waktu lainnya (Sore, Malam) tetap melanjutkan rotasi.
         Ubah HANYA ORDER / LATE / LATE_FROM bila berubah — jadwal ikut otomatis. */
      var ORDER=['okk','zona','alley','lol','monkipedia','ayla','kpc','fathulmeme','cne'];
      var LATE_FROM='2026-11-19', LATE={pagi:'barongsukma',siang:'mcfa'};
      var ALL=ORDER.concat(Object.keys(LATE).map(function(k){ return LATE[k]; }));
      var SLOTS=['pagi','siang','sore','malam'];
      var STG=[['ide','Ide konten'],['materi','Persiapan materi'],['produksi','Produksi'],['editing','Editing'],['cek','Pemeriksaan akhir'],['siap','Siap upload']];
      var STAT=['Belum dimulai','Ide siap','Materi siap','Produksi selesai','Editing selesai','Sudah diperiksa','Siap upload'];
      function today(){ return mcfaNowJakarta(); }
      function iso(d){ return mcfaIso(d); }
      function esc(x){ return String(x).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
      function notif(m){ try{ if(typeof showNotif==='function') showNotif(m); }catch(e){} }
      function nameOf(id){ return (typeof AKUN!=='undefined'&&AKUN[id]&&AKUN[id].name)?AKUN[id].name:String(id); }
      function inRange(k){ return k>=MCFA_CORE.adaptStart&&k<=MCFA_CORE.adaptEnd; }
      function days(){ var a=[],d=MCFA_CORE.adaptStart; while(d<=MCFA_CORE.adaptEnd){ a.push(d); d=mcfaAddDays(d,1); } return a; }
      function dayIdx(k){ return mcfaDaysBetween(mcfaParse(MCFA_CORE.adaptStart),mcfaParse(k)); }
      /* rotasi: nomor giliran berlanjut lintas hari (hari ke-n, waktu ke-s → akun ke-(4n+s) mod jumlah akun) */
      function accOf(k,slot){
        var s=SLOTS.indexOf(slot); if(s<0||!inRange(k)) return null;
        if(k>=LATE_FROM&&LATE[slot]) return LATE[slot];
        /* nomor giliran = jumlah waktu rotasi (bukan khusus) yang sudah lewat; waktu khusus 19–20 NOV tidak memakai giliran */
        var late=Object.keys(LATE).length, n=0, di=dayIdx(k), li=k>=LATE_FROM?mcfaDaysBetween(mcfaParse(LATE_FROM),mcfaParse(k)):0, before=mcfaDaysBetween(mcfaParse(MCFA_CORE.adaptStart),mcfaParse(LATE_FROM));
        if(k<LATE_FROM) n=di*SLOTS.length+s;
        else n=before*SLOTS.length+li*(SLOTS.length-late)+(s-late);
        return ORDER[n%ORDER.length];
      }
      function schedule(k){ return SLOTS.map(function(sl){ return {slot:sl,acc:accOf(k,sl)}; }); }
      function readAll(){ try{ var o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&o.days&&typeof o.days==='object') return o; }catch(e){} return {v:1,days:{}}; }
      function writeAll(o){ try{ o.v=1; o.updated=new Date().toISOString(); localStorage.setItem(KEY,JSON.stringify(o)); return true; }catch(e){ return false; } }
      function item(o,k,a){ var d=o.days[k]; var r=d&&d[a]&&d[a][IDX]; return r&&typeof r==='object'?{t:String(r.t||''),s:(r.s&&typeof r.s==='object')?r.s:{}}:{t:'',s:{}}; }
      function ensure(o,k,a){ var d=o.days[k]||(o.days[k]={}); var x=d[a]||(d[a]={}); var r=x[IDX]||(x[IDX]={t:'',s:{}}); if(!r.s||typeof r.s!=='object') r.s={}; return r; }
      function prefix(s){ var c=0; for(var j=0;j<STG.length;j++){ if(s[STG[j][0]]) c++; else break; } return c; }
      function ticked(s){ var c=0; STG.forEach(function(g){ if(s[g[0]]) c++; }); return c; }
      function count(k){
        if(!inRange(k)) return {total:0,done:0};
        var o=readAll(), done=0; schedule(k).forEach(function(x){ done+=ticked(item(o,k,x.acc).s); });
        return {total:SLOTS.length*STG.length,done:done};
      }
      function slotCount(k,slot){
        var a=accOf(k,slot); if(!a) return {total:0,done:0};
        return {total:STG.length,done:ticked(item(readAll(),k,a).s)};
      }
      function collected(){   /* pekerjaan yang sudah melewati keenam tahap (Siap upload) — BUKAN yang sudah dipublikasikan */
        var o=readAll(), per={}, tgt={}, ready=0, started=0, ds=days();
        ALL.forEach(function(a){ per[a]=0; tgt[a]=0; });
        ds.forEach(function(k){ schedule(k).forEach(function(x){ var s=item(o,k,x.acc).s; tgt[x.acc]++; if(prefix(s)===STG.length){ per[x.acc]++; ready++; } else if(ticked(s)>0) started++; }); });
        return {target:ds.length*SLOTS.length,ready:ready,started:started,perAccount:per,perTarget:tgt,days:ds.length};
      }
      /* progres tiap akun = tahap produksi yang sudah dicentang / seluruh tahap pada giliran akun itu (8–20 NOV) */
      function accountProgress(){
        var o=readAll(), ds=days(), res={};
        ALL.forEach(function(a){ res[a]={name:nameOf(a),done:0,total:0,turns:0}; });
        ds.forEach(function(k){ schedule(k).forEach(function(x){ var r=res[x.acc]; r.turns++; r.total+=STG.length; r.done+=ticked(item(o,k,x.acc).s); }); });
        return res;
      }
      function canEdit(k){
        if(!inRange(k)) return false;
        if(k>iso(today())){ notif('Hari ini belum tiba — produksi konten hanya bisa dicentang sampai hari ini.'); return false; }
        return true;
      }
      function toggle(k,a,i,st){
        if(i!==IDX||!STG.some(function(g){ return g[0]===st; })||!canEdit(k)) return;
        if(!schedule(k).some(function(x){ return x.acc===a; })) return;   /* hanya akun yang memang mendapat giliran hari itu */
        var o=readAll(), r=ensure(o,k,a);
        if(r.s[st]) delete r.s[st]; else r.s[st]=iso(today());
        if(!writeAll(o)){ notif('Gagal menyimpan. Coba lagi.'); return; }
        try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){}
        if(window.MCFA_ADP) MCFA_ADP.render(); try{ document.dispatchEvent(new Event('mcfa:data')); }catch(e){}
      }
      function title(k,a,i,v){
        if(i!==IDX||!inRange(k)||!schedule(k).some(function(x){ return x.acc===a; })) return; clearTimeout(TT);
        TT=setTimeout(function(){ var o=readAll(), r=ensure(o,k,a); r.t=String(v).slice(0,200); writeAll(o); },400);
      }
      /* HTML satu pekerjaan produksi untuk satu waktu — disisipkan MCFA_ADP di dalam blok Pagi/Siang/Sore/Malam */
      function slotHtml(view,slot){
        var a=accOf(view,slot); if(!a) return '';
        var o=readAll(), r=item(o,view,a), p=prefix(r.s), future=view>iso(today());
        return '<div class="adpp-c"><div class="adpp-h"><span>PRODUKSI KONTEN · '+esc(nameOf(a))+'</span><span class="adpp-st'+(p===STG.length?' ok':'')+'">'+STAT[p].toUpperCase()+'</span></div>'+
          '<input class="adpp-t" type="text" maxlength="200" placeholder="Nama konten" aria-label="Nama konten" value="'+esc(r.t)+'" oninput="MCFA_ADPP.title(\''+view+'\',\''+a+'\','+IDX+',this.value)">'+
          '<div class="adpp-chips">'+STG.map(function(g){ return '<button type="button" class="adpp-chip'+(r.s[g[0]]?' on':'')+'"'+(future?' disabled':'')+' onclick="MCFA_ADPP.toggle(\''+view+'\',\''+a+'\','+IDX+',\''+g[0]+'\')">'+(r.s[g[0]]?'✓ ':'')+g[1]+'</button>'; }).join('')+'</div></div>';
      }
      function render(){ /* tidak ada lagi bagian produksi terpisah: tampilan ada di dalam blok waktu (slotHtml) */ }
      function selfCheck(){
        var bad=[], eq=function(l,a,b){ if(JSON.stringify(a)!==JSON.stringify(b)) bad.push(l+': '+JSON.stringify(a)+' ≠ '+JSON.stringify(b)); };
        eq('jumlah waktu', SLOTS, ['pagi','siang','sore','malam']); eq('jumlah tahap', STG.length, 6);
        eq('akun rotasi terdaftar di Studio', ORDER.filter(function(a){ return typeof AKUN==='undefined'||!AKUN[a]; }), []);
        eq('semua akun Studio mendapat giliran (rotasi + 19–20 NOV)', (typeof AKUN==='undefined'?[]:Object.keys(AKUN).filter(function(a){ return ALL.indexOf(a)<0; })), []);
        eq('tanpa akun ganda di rotasi', ALL.filter(function(a,i){ return ALL.indexOf(a)!==i; }), []);
        eq('Barongsukma & MC Fathul Adzim tidak muncul sebelum 19 NOV', days().filter(function(k){ return k<LATE_FROM&&schedule(k).some(function(x){ return x.acc==='barongsukma'||x.acc==='mcfa'; }); }), []);
        eq('Barongsukma & MC Fathul Adzim muncul 19 dan 20 NOV', ['2026-11-19','2026-11-20'].map(function(k){ var a=schedule(k).map(function(x){ return x.acc; }); return a.indexOf('barongsukma')>=0&&a.indexOf('mcfa')>=0; }), [true,true]);
        eq('hari produksi', days().length, 13); eq('target terkumpul (4 per hari)', collected().target, 52);
        eq('hari 1 (8 NOV, awal Adaptasi)', schedule(MCFA_CORE.adaptStart).map(function(x){ return x.acc; }), ['okk','zona','alley','lol']);
        eq('hari 2 (9 NOV)', schedule(mcfaAddDays(MCFA_CORE.adaptStart,1)).map(function(x){ return x.acc; }), ['monkipedia','ayla','kpc','fathulmeme']);
        eq('hari 3 melanjutkan akun yang belum giliran', schedule(mcfaAddDays(MCFA_CORE.adaptStart,2)).map(function(x){ return x.acc; }), ['cne','okk','zona','alley']);
        eq('19 NOV: Barongsukma pagi, MC Fathul Adzim siang, rotasi lanjut', schedule('2026-11-19').map(function(x){ return x.acc; }), ['barongsukma','mcfa','cne','okk']);
        eq('20 NOV', schedule('2026-11-20').map(function(x){ return x.acc; }), ['barongsukma','mcfa','zona','alley']);
        eq('5, 6, 7 NOV bukan hari Adaptasi (tidak ada jadwal produksi)', ['2026-11-05','2026-11-06','2026-11-07'].map(function(k){ return schedule(k).map(function(x){ return x.acc; }); }), [[null,null,null,null],[null,null,null,null],[null,null,null,null]]);
        eq('semua akun rotasi mendapat giliran produksi', ORDER.filter(function(a){ return !days().some(function(k){ return schedule(k).some(function(x){ return x.acc===a; }); }); }), []);
        eq('tiap hari 4 akun berbeda', days().filter(function(k){ var s=schedule(k).map(function(x){ return x.acc; }); return s.filter(function(a,i){ return s.indexOf(a)!==i; }).length>0; }), []);
        eq('di luar Adaptasi tidak dihitung', [count('2026-11-04').total,count('2026-11-05').total,count('2026-11-06').total,count('2026-11-07').total,count('2026-11-21').total], [0,0,0,0,0]);
        eq('hari Adaptasi = 24 centang (4 waktu × 6 tahap)', count(MCFA_CORE.adaptStart).total, 24);
        return bad;
      }
      window.MCFA_ADPP={count:count,slotCount:slotCount,collected:collected,accountProgress:accountProgress,schedule:schedule,slotHtml:slotHtml,render:render,toggle:toggle,title:title,selfCheck:selfCheck,key:KEY,accounts:ALL.slice(),stages:STG.map(function(g){return g[0];}),read:readAll};
      if(window.MCFA_ADP&&document.readyState!=='loading') MCFA_ADP.render();
    })();
    
