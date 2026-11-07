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
              if(!cur){ var iid=Date.now()*10+(n++);
                var it={id:iid,title:(r.t&&String(r.t).trim())||('Konten '+i+' · produksi '+dd(day)),done:false,doneDate:'',addedDate:_todayDD(),status:'siap',productionKey:'',productionDate:dd(s.produksi&&/^\d{4}-\d{2}-\d{2}$/.test(s.produksi)?s.produksi:day),uploadKey:'',jenis:'',jadwal:'',src:src,hist:[]};
                _kontenHist(it,'','siap','Dari Produksi Konten Adaptasi'); list.unshift(it); dirty=true; changed++; }
            } else if(cur&&cur.status==='siap'&&!cur.done){   /* tahap Adaptasi dibatalkan → konten kembali 'Dalam Produksi' (tidak dihapus) */
              _kontenHist(cur,'siap','produksi','Tahap Adaptasi dibatalkan'); cur.status='produksi'; dirty=true; changed++; }
          });
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
    eq('BARONGSUKMA akun pertama', MCFA_ADPK.official[MCFA_CORE.contentStart][0], 'barongsukma');
    eq('semua akun Studio ikut upload 21 NOV', Object.keys(AKUN).filter(function(a){ return MCFA_ADPK.official[MCFA_CORE.contentStart].indexOf(a)<0; }), []);
    eq('6 status konten', Object.keys(_KST).length, 6);
    return bad;
  }
  window.MCFA_T6={sync:sync,selfCheck:selfCheck};
  function go(){ sync(); }
  document.addEventListener('mcfa:data',function(){ setTimeout(go,0); });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(go,300); }); else setTimeout(go,300);
})();
