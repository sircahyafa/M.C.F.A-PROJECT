/* PETA PERTUMBUHAN KARIR — semua angka otomatis dari MCFA_TAHAP.def (target) + MCFA_CORE (tanggal) + data akun (capaian). */
(function(){
  'use strict';
  var view=null, tmr=null;
  function fk(v){ return v>=1000000 ? (Math.round(v/100000)/10).toLocaleString('id-ID')+' JT' : Math.round(v/1000).toLocaleString('id-ID')+' RB'; }
  function nowD(){ try{ return mcfaNowJakarta(); }catch(e){ return mcfaMidnight(); } }
  function activeStage(){
    var d=nowD(), D=MCFA_TAHAP.def;
    for(var n=1;n<=3;n++){ if(d<=mcfaParse(D[n].end)) return n; }
    return 3;
  }
  function from(n,k){ return n===1?0:MCFA_TAHAP.def[n-1][k]; }
  function prog(n){            // 0..1 posisi hari ini di dalam tahap n
    var D=MCFA_TAHAP.def[n], d=nowD(), tot=mcfaDaysInclusive(D.start,D.end), el=mcfaDaysBetween(mcfaParse(D.start),d)+1;
    return Math.max(0,Math.min(1,el/tot));
  }
  function avg(ids,field){
    if(!ids||!ids.length) return 0; var s=0;
    ids.forEach(function(id){ try{ s+=(_t1Load(id)[field]||0); }catch(e){} });
    return s/ids.length;
  }
  function hit(ids,field,n){ var c=0; (ids||[]).forEach(function(id){ try{ if((_t1Load(id)[field]||0)>=MCFA_STUDIO.target(id,n,field)) c++; }catch(e){} }); return c; }
  function metric(label,k,field,n,ids,act){
    var D=MCFA_TAHAP.def[n], goal=D[k], lo=from(n,k), p=n===act?prog(n):(n<act?1:0);
    var tNow=lo+(goal-lo)*p, real=(n===act)?avg(ids,field):0;
    var tw=goal?Math.min(100,tNow/goal*100):0, aw=goal?Math.min(100,real/goal*100):0;
    return '<div class="rm-m"><div class="rm-mt"><b>'+label+'</b><span>target hari ini '+fk(tNow)+' → akhir '+fk(goal)+'</span></div>'+
      '<div class="rm-bar"><div class="tg" data-w="'+tw+'"></div><div class="ac" data-w="'+aw+'"></div></div>'+
      '<div class="rm-leg">'+(n===act?'Rata-rata '+fk(real)+' per akun · '+hit(ids,field,n)+' / '+((ids&&ids.length)||0)+' akun capai target':(n<act?'Tahap selesai':'Belum dimulai'))+'</div></div>';
  }
  function kmetric(n,act){
    var D=MCFA_TAHAP.def[n], goal=D.konten, p=n===act?prog(n):(n<act?1:0), tNow=goal*p;
    var ids=Object.keys(AKUN).filter(function(id){ return MCFA_STUDIO.applies(id,'konten',n); }), real=0, hits=0;
    ids.forEach(function(id){ var c=MCFA_STUDIO.konten(id,n); real+=c; if(c>=MCFA_STUDIO.target(id,n,'konten')) hits++; });
    real=ids.length?real/ids.length:0;
    var tw=goal?Math.min(100,tNow/goal*100):0, aw=goal?Math.min(100,real/goal*100):0, f=function(v){ return Math.round(v).toLocaleString('id-ID'); };
    return '<div class="rm-m"><div class="rm-mt"><b>Konten Terupload</b><span>target hari ini '+f(tNow)+' → akhir '+f(goal)+'</span></div>'+
      '<div class="rm-bar"><div class="tg" data-w="'+tw+'"></div><div class="ac" data-w="'+aw+'"></div></div>'+
      '<div class="rm-leg">'+(n===act?'Total '+f(real*ids.length)+' konten · '+hits+' / '+ids.length+' akun capai target':(n<act?'Tahap selesai':'Belum dimulai'))+'</div></div>';
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
    for(var q=1;q<=4;q++){
      var end=mcfaAddDays(S.start,Math.round(tot*q/4)-1), pass=mcfaParse(end)<=d, nxt=!pass&&(q===1||mcfaParse(mcfaAddDays(S.start,Math.round(tot*(q-1)/4)-1))<=d);
      var sub=Math.round(from(n,'yt')+(S.yt-from(n,'yt'))*q/4);
      cp+='<div class="'+(pass?'ok':(nxt?'nx':''))+'"><b>'+(pass?'✓ ':'')+fk(sub)+'</b>'+(function(x){ var dd=mcfaParse(x); return formatMonthUpper(dd).slice(0,3)+' '+dd.getFullYear(); })(end)+'</div>';
    }
    box.innerHTML='<div class="rm-k">KARIR · PETA PERTUMBUHAN</div><div class="rm-t">Naik Tahap demi Tahap</div><span class="rm-live"><i></i>'+live+'</span>'+
      '<div class="rm-st">'+cards+'</div>'+
      '<div class="rm-goal"><div><b>'+fk(S.yt)+'</b><small>SUBS YT</small></div><div><b>'+fk(S.tt)+'</b><small>FOLLOWERS</small></div><div><b>'+S.konten.toLocaleString('id-ID')+'</b><small>KONTEN</small></div></div>'+
      metric('Subscriber YouTube','yt','subs',n,G.subs,act)+metric('Followers TikTok','tt','followers',n,G.followers,act)+kmetric(n,act)+
      '<div class="rm-leg" style="margin-top:12px">CHECKPOINT SUBS PER KUARTAL TAHAP '+n+'</div><div class="rm-cp">'+cp+'</div>';
    box.querySelectorAll('.rm-c').forEach(function(b){ b.addEventListener('click',function(){ view=+b.getAttribute('data-n'); try{ if(MCFA_TAHAP.get()!==view) MCFA_TAHAP.set(view); }catch(e){} render(); if(navigator.vibrate) navigator.vibrate(8); }); });
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
