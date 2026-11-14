/* ═══ TAHAP 6 — JEMBATAN: Produksi Konten Adaptasi (MCFA_ADPP) → daftar konten M.C.F.A STUDIO ═══
   Konten Adaptasi yang sudah melewati 6 tahap (Siap upload) dicatat SATU KALI di daftar konten akun pemiliknya dengan status 'Siap Upload'
   (kunci sumber 'src' mencegah duplikat). Status 'Siap Upload' BUKAN upload: tidak masuk statistik posting. productionKey dikosongkan agar tidak
   muncul di Kegiatan Sehari-hari. Upload resmi hanya mulai 21 NOV 2026 dan hanya lewat centang 'Sudah Diupload'. Data lama tidak diubah. */
(function(){
  'use strict'; var busy=false;
  function dd(iso){ var p=iso.split('-'); return (+p[2])+'/'+(+p[1])+'/'+p[0]; }
  function sync(){
    if(busy||!window.MCFA_ADPP||typeof _getKonten!=='function'||typeof _saveKonten!=='function') return 0;
    busy=true; var changed=0, n=0;
    try{
      var all=MCFA_ADPP.read(), ST=MCFA_ADPP.stages;
      MCFA_ADPP.accounts.forEach(function(acc){
        var list=_getKonten(acc), dirty=false, want={};
        Object.keys(all.days||{}).sort().forEach(function(day){
          var d=all.days[day]&&all.days[day][acc]; if(!d) return;
          Object.keys(d).sort().forEach(function(i){
            var r=d[i], s=(r&&r.s)||{}, src='adpp:'+day+':'+acc+':'+i, full=ST.every(function(g){ return !!s[g]; });
            var cur=list.filter(function(k){ return k.src===src; })[0];
            if(full){ want[src]=1;
              if(cur&&cur.status==='produksi'&&!cur.done){   /* tahap dilengkapi lagi setelah dibatalkan oleh sinkronisasi → kembali 'Siap Upload' (konten yang sama, tanpa duplikat) */
                var lh=cur.hist&&cur.hist.length?cur.hist[cur.hist.length-1]:null;
                if(lh&&lh.to==='produksi'&&(lh.n==='Tahap Adaptasi dibatalkan'||lh.n==='Sumber produksi tidak ditemukan')){ _kontenHist(cur,'produksi','siap','Tahap Adaptasi dilengkapi kembali'); cur.status='siap'; dirty=true; changed++; } }
              if(!cur){ var iid=Date.now()*10+(n++);
                var it={id:iid,title:(r.t&&String(r.t).trim())||('Konten '+i+' · produksi '+dd(day)),done:false,doneDate:'',addedDate:_todayDD(),status:'siap',productionKey:'',productionDate:dd(s.produksi&&/^\d{4}-\d{2}-\d{2}$/.test(s.produksi)?s.produksi:day),uploadKey:'',jenis:'',jadwal:'',src:src,hist:[]};
                _kontenHist(it,'','siap','Dari Produksi Konten Adaptasi'); list.unshift(it); dirty=true; changed++; }
            } else if(cur&&cur.status==='siap'&&!cur.done){   /* tahap Adaptasi dibatalkan → konten kembali 'Dalam Produksi' (tidak dihapus) */
              _kontenHist(cur,'siap','produksi','Tahap Adaptasi dibatalkan'); cur.status='produksi'; dirty=true; changed++; }
          });
        });
        /* REKONSILIASI: konten tertaut (src 'adpp:…') yang sumber produksinya sudah tidak ada. 'Siap Upload' → kembali 'Dalam Produksi'
           (tidak dihapus). Yang SUDAH diupload tidak disentuh sama sekali (tidak dihapus diam-diam); dilaporkan lewat reconcile(). */
        list.forEach(function(k){
          if(!k||typeof k.src!=='string'||k.src.indexOf('adpp:')!==0||want[k.src]) return;
          var rec=(all.days||{})[k.src.split(':')[1]], has=rec&&rec[acc]&&rec[acc][k.src.split(':')[3]];
          if(has) return;                                  /* sumber ada tapi tahap belum lengkap → sudah ditangani di atas */
          if(k.status==='siap'&&!k.done){ _kontenHist(k,'siap','produksi','Sumber produksi tidak ditemukan'); k.status='produksi'; dirty=true; changed++; }
        });
        if(dirty) _saveKonten(acc,list);
      });
    }catch(e){ console.warn('[TAHAP 6] sync gagal',e); }
    busy=false; return changed;
  }
  function selfCheck(){
    var bad=[], eq=function(l,a,b){ if(JSON.stringify(a)!==JSON.stringify(b)) bad.push(l+': '+JSON.stringify(a)+' ≠ '+JSON.stringify(b)); };
    eq('upload resmi = Day 1 proyek', MCFA_CORE.contentStart, MCFA_CORE.projectStart);
    eq('upload resmi 21 NOV 2026', MCFA_CORE.contentStart, '2026-11-21');
    eq('Studio mulai = posting resmi mulai', MCFA_CORE.studioStart, MCFA_CORE.contentStart);
    eq('akun inti terdaftar di Studio', ['mcfa','barongsukma'].filter(function(a){ return !AKUN[a]; }), []);
    eq('semua akun Studio terdaftar ikut posting resmi mulai 21 NOV (sumber: MCFA_CORE + AKUN, bukan jadwal lama)', Object.keys(AKUN).filter(function(a){ return !AKUN[a] || !AKUN[a].name; }), []);
    eq('tidak ada dependensi jadwal lama MCFA_ADPK', typeof window.MCFA_ADPK, 'undefined');
    eq('6 status konten', Object.keys(_KST).length, 6);
    return bad;
  }
  /* Laporan rekonsiliasi (hanya membaca): yatim = konten tertaut tanpa sumber produksi; ganda = lebih dari satu konten untuk satu sumber. */
  function reconcile(){
    var out={orphan:[],orphanUploaded:[],duplicate:[]};
    try{ var all=MCFA_ADPP.read();
      MCFA_ADPP.accounts.forEach(function(acc){ var seen={};
        _getKonten(acc).forEach(function(k){ if(!k||typeof k.src!=='string'||k.src.indexOf('adpp:')!==0) return;
          if(seen[k.src]) out.duplicate.push(acc+' '+k.src); seen[k.src]=1;
          var pr=k.src.split(':'), rec=(all.days||{})[pr[1]], has=rec&&rec[acc]&&rec[acc][pr[3]];
          if(!has){ (k.status==='upload'||k.done?out.orphanUploaded:out.orphan).push(acc+' '+k.src); } }); });
    }catch(e){ out.error=String(e); }
    return out;
  }
  window.MCFA_T6={sync:sync,selfCheck:selfCheck,reconcile:reconcile};
  function go(){ sync(); }
  document.addEventListener('mcfa:data',function(){ setTimeout(go,0); });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(go,300); }); else setTimeout(go,300);
})();
