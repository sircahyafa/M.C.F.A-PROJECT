/* PETA PERTUMBUHAN KARIR — semua angka otomatis dari MCFA_TAHAP.def (target) + MCFA_CORE (tanggal) + data akun (capaian). */
(function(){
  'use strict';
  var view=null, tmr=null;
  function fk(v){ return v>=1000000 ? (Math.round(v/100000)/10).toLocaleString('id-ID')+' JT' : Math.round(v/1000).toLocaleString('id-ID')+' RB'; }
  function nowD(){ try{ return mcfaNowJakarta(); }catch(e){ return mcfaMidnight(); } }
  function activeStage(){ return MCFA_TAHAP.running(); }   /* satu implementasi (modul 23) */
  function from(n,k){ return n===1?0:MCFA_TAHAP.def[n-1][k]; }
  function prog(n){            // 0..1 posisi hari ini di dalam tahap n
    var D=MCFA_TAHAP.def[n], d=nowD(), tot=mcfaDaysInclusive(D.start,D.end), el=mcfaDaysBetween(mcfaParse(D.start),d)+1;
    return Math.max(0,Math.min(1,el/tot));
  }
  /* Angka capaian SEMUA dari MCFA_STUDIO.aggregate (satu sumber): persen = Σ min(aktual, target akun) / Σ target akun.
     Rata-rata mentah per akun tetap ditampilkan sebagai informasi, tetapi BAR tidak lagi dihitung dari rata-rata mentah
     (satu akun yang melampaui target menutupi akun lain yang belum). */
  function metric(label,k,field,n,ids,act){
    var D=MCFA_TAHAP.def[n], goal=D[k], lo=from(n,k), p=n===act?prog(n):(n<act?1:0);
    var tNow=lo+(goal-lo)*p, g=MCFA_STUDIO.aggregate(ids,n,field), avgRaw=g.n?g.actual/g.n:0;
    var tw=goal?Math.min(100,tNow/goal*100):0, aw=g.pct||0;
    return '<div class="rm-m"><div class="rm-mt"><b>'+label+'</b><span>target hari ini '+fk(tNow)+' → akhir '+fk(goal)+'</span></div>'+
      '<div class="rm-bar"><div class="tg" data-w="'+tw+'"></div><div class="ac" data-w="'+aw+'"></div></div>'+
      '<div class="rm-leg">'+(n===act?'Rata-rata '+fk(avgRaw)+' per akun · '+g.hit+' / '+g.n+' akun capai target':(n<act?'Tahap selesai':'Belum dimulai'))+'</div></div>';
  }
  function kmetric(n,act){
    var D=MCFA_TAHAP.def[n], goal=D.konten, p=n===act?prog(n):(n<act?1:0), tNow=goal*p;
    var g=MCFA_STUDIO.aggregate(null,n,'konten');
    var tw=goal?Math.min(100,tNow/goal*100):0, aw=g.pct||0, f=function(v){ return Math.round(v).toLocaleString('id-ID'); };
    return '<div class="rm-m"><div class="rm-mt"><b>Konten Terupload</b><span>target hari ini '+f(tNow)+' → akhir '+f(goal)+'</span></div>'+
      '<div class="rm-bar"><div class="tg" data-w="'+tw+'"></div><div class="ac" data-w="'+aw+'"></div></div>'+
      '<div class="rm-leg">'+(n===act?'Total '+f(g.actual)+' konten · '+g.hit+' / '+g.n+' akun capai target':(n<act?'Tahap selesai':'Belum dimulai'))+'</div></div>';
  }
  /* Angka teks di halaman Karier yang dulu tertulis tetap kini dihitung dari data/DOM yang sama:
     jumlah jalur karier & target ilmu = jumlah kartu; Status = posisi hari ini terhadap DAY 1; Total Target Audiens = Σ target Tahap 3
     seluruh akun penerima target (kategori akun di Pusat Akun menentukan siapa yang dihitung). */
  function bind(k,txt){ [].forEach.call(document.querySelectorAll('#page-karir [data-kr-bind="'+k+'"]'),function(e){ if(e.textContent!==txt) e.textContent=txt; }); }
  function syncStatic(){
    var pg=document.getElementById('page-karir'); if(!pg||!window.MCFA_STUDIO||!window.MCFA_TAHAP) return;
    var nK=pg.querySelectorAll('#krPanel0 .vision-card').length, nI=pg.querySelectorAll('#krPanel3 .vision-card').length;
    if(nK) bind('n-karir',String(nK)); if(nI) bind('n-ilmu',String(nI));
    var d=nowD(), pS=mcfaParse(MCFA_CORE.projectStart), pE=mcfaParse(MCFA_CORE.projectEnd), st;
    if(d<pS) st='H-'+mcfaDaysBetween(d,pS); else if(d>pE) st='Selesai'; else st='Tahap '+activeStage();
    bind('status',st);
    var G=window.MCFA_TAHAP_GROUPS||{followers:[],subs:[]}, gf=MCFA_STUDIO.aggregate(G.followers,3,'followers'), gs=MCFA_STUDIO.aggregate(G.subs,3,'subs'), tot=gf.target+gs.target;
    bind('aud-total', tot>=1000000 ? (tot/1000000).toLocaleString('id-ID',{maximumFractionDigits:1})+' Juta' : tot.toLocaleString('id-ID'));
    bind('aud-sub', gf.n+' akun followers + '+gs.n+' channel YouTube · jumlah target Tahap 3');
  }
  function render(){
    var box=document.getElementById('krRoadmap'); if(!box||!window.MCFA_TAHAP) return;
    var D=MCFA_TAHAP.def, act=activeStage(), n=view||act, d=nowD(), G=window.MCFA_TAHAP_GROUPS||{followers:[],subs:[]};
    var live, pS=mcfaParse(MCFA_CORE.projectStart);
    if(d<pS) live='DAY 1 DALAM '+mcfaDaysBetween(d,pS)+' HARI';
    else if(d>mcfaParse(MCFA_CORE.projectEnd)) live='PROJECT SELESAI';
    else live='TAHAP '+act+' · DAY '+MCFA_DERIVED.projectDayOf(d).toLocaleString('id-ID')+' DARI '+MCFA_DERIVED.projectTotalDays.toLocaleString('id-ID');
    var cards=[1,2,3].map(function(i){
      var g=i>1?'+'+Math.round((D[i].yt/D[i-1].yt-1)*100)+'% target':'TITIK AWAL';
      return '<button class="rm-c'+(i===n?' view':'')+'" data-n="'+i+'">'+(i===act?'<span class="now">AKTIF</span>':'')+'<div class="n">TAHAP</div><div class="nn">'+i+'</div><div class="g">'+g+'</div></button>';
    }).join('');
    var S=D[n], tot=mcfaDaysInclusive(S.start,S.end), cp='';
    /* CHECKPOINT: ✓ HANYA bila SEMUA akun subscriber sudah ≥ nilai checkpoint (data aktual). Tanggal terlewat tanpa angka tercapai
       ditandai "terlewat" dengan jumlah akun yang sudah sampai — bukan ✓ (sebelumnya ✓ muncul hanya karena tanggalnya lewat). */
    var subRows=MCFA_STUDIO.aggregate(G.subs,n,'subs').rows;
    for(var q=1;q<=4;q++){
      var end=mcfaAddDays(S.start,Math.round(tot*q/4)-1), pass=mcfaParse(end)<=d, nxt=!pass&&(q===1||mcfaParse(mcfaAddDays(S.start,Math.round(tot*(q-1)/4)-1))<=d);
      var sub=Math.round(from(n,'yt')+(S.yt-from(n,'yt'))*q/4);
      var reached=subRows.filter(function(r){ return r.actual>=sub; }).length, all=subRows.length>0&&reached===subRows.length;
      var cls=all?'ok':(pass?'late':(nxt?'nx':'')), mark=all?'✓ ':'';
      var note=(!all&&pass&&subRows.length)?'<small class="rm-cp-n">'+reached+'/'+subRows.length+' akun · terlewat</small>':'';
      cp+='<div class="'+cls+'"><b>'+mark+fk(sub)+'</b>'+(function(x){ var dd=mcfaParse(x); return formatMonthUpper(dd).slice(0,3)+' '+dd.getFullYear(); })(end)+note+'</div>';
    }
    box.innerHTML='<div class="rm-k">KARIR · PETA PERTUMBUHAN</div><div class="rm-t">Naik Tahap demi Tahap</div><span class="rm-live"><i></i>'+live+'</span>'+
      '<div class="rm-st">'+cards+'</div>'+
      '<div class="rm-goal"><div><b>'+fk(S.yt)+'</b><small>SUBS YT</small></div><div><b>'+fk(S.tt)+'</b><small>FOLLOWERS</small></div><div><b>'+S.konten.toLocaleString('id-ID')+'</b><small>KONTEN</small></div></div>'+
      metric('Subscriber YouTube','yt','subs',n,G.subs,act)+metric('Followers TikTok','tt','followers',n,G.followers,act)+kmetric(n,act)+
      '<div class="rm-leg" style="margin-top:12px">CHECKPOINT SUBS PER KUARTAL TAHAP '+n+'</div><div class="rm-cp">'+cp+'</div>';
    box.querySelectorAll('.rm-c').forEach(function(b){ b.addEventListener('click',function(){ view=+b.getAttribute('data-n'); try{ if(MCFA_TAHAP.get()!==view) MCFA_TAHAP.set(view); }catch(e){} render(); if(navigator.vibrate) navigator.vibrate(8); }); });
    try{ syncStatic(); }catch(e){ console.warn('[KARIR] sinkron angka', e); }
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ box.querySelectorAll('.rm-bar div').forEach(function(e){ e.style.width=e.getAttribute('data-w')+'%'; }); }); });
  }
  function mount(tries){
    var pg=document.getElementById('page-karir'); if(!pg||!window.MCFA_TAHAP||!window.MCFA_STUDIO){ if(tries>0) setTimeout(function(){ mount(tries-1); },250); return; }
    if(document.getElementById('krRoadmap')) return;
    var box=document.createElement('section'); box.id='krRoadmap';
    var anchor=pg.querySelector('.tp-wrap[data-tp-page="karir"]')||pg.querySelector('.kr-page-header');
    if(!anchor){ if(tries>0) setTimeout(function(){ mount(tries-1); },250); return; }
    anchor.parentNode.insertBefore(box,anchor.nextSibling);
    render();
    /* tahap aktif dipilih otomatis (sekali) supaya target tahap langsung tampil di semua halaman */
    try{ if(MCFA_TAHAP.get()===null) MCFA_TAHAP.set(activeStage()); }catch(e){}
    tmr=setInterval(render,60000);
    document.addEventListener('mcfa:data',render); window.addEventListener('storage',render);
    MCFA_TAHAP.onChange(function(n){ if(n!==null&&n!==view){ view=n; render(); } });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ mount(40); }); else mount(40);
})();
