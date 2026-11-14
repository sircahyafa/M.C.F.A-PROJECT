/* ═══ PERSIAPAN MCFA PROJECT — panel utama Aktivitas ═══
   Susunan halaman Aktivitas:  1. KEGIATAN SEHARI-HARI (kartu #heroHarian)   2. PERSIAPAN MCFA PROJECT (panel #pspGroup)
   Isi PERSIAPAN MCFA PROJECT: subbagian ① TUGAS AWAL MC FATHUL ADZIM (#heroTugasAwal) dan ② ADAPTASI (#heroAdaptasi).
   Yang digabung HANYA penempatan & tampilan: kedua kartu dipindahkan apa adanya (elemen, ID, pendengar klik, data localStorage tidak disentuh),
   jadi daftar tugas, tanggal, centang, riwayat, dan progres tiap subbagian tetap terpisah dan utuh. Panel TIDAK menyimpan data apa pun.

   Status dihitung otomatis dari centang yang tersimpan — tidak pernah dari tanggal atau tombol manual:
     · satu subbagian dianggap SELESAI hanya bila totalnya > 0 dan semua tugasnya tercentang
     · kedua subbagian belum selesai → BELUM SELESAI · salah satu selesai → PERSIAPAN BERLANGSUNG · keduanya selesai → SELESAI
   Sumber hitungan (tidak ada salinan data): Tugas Awal = TAH.overall() (ID unik); Adaptasi = MCFA_ADP.stats() (seluruh hari periode, termasuk produksi konten).
   Progres gabungan = Σ selesai / Σ tugas dari kedua sumber itu. Batal centang → status ikut kembali otomatis.
   Pratinjau tampilan SELESAI (hanya tampilan, tidak menulis apa pun): buka alamat aplikasi dengan ?preview=selesai */
(function(){
  'use strict';
  var grid, harian, ta, ad, group, wired=false, prev=null, tmr=null, boomT=null, upT=null;
  var els={};

  function preview(){ try{ return /[?&]preview=selesai(&|$)/.test(location.search); }catch(e){ return false; } }
  function reduce(){ try{ return document.documentElement.classList.contains('mcfa-reduce-motion') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } }
  function sh(x){ var d=mcfaParse(x); return d.getDate()+' '+formatMonthUpper(d).slice(0,3); }
  function range(){ return sh(MCFA_CORE.taskStart)+' – '+sh(MCFA_CORE.adaptEnd)+' '+mcfaParse(MCFA_CORE.adaptEnd).getFullYear(); }
  function num(x){ x=+x; return (isFinite(x)&&x>0)?Math.floor(x):0; }

  /* ── hitungan: dibaca langsung dari sumber aslinya ── */
  function readTA(){
    try{ if(window.TAH&&TAH.overall){ var o=TAH.overall(); return {d:num(o.done),t:num(o.total)}; } }catch(e){}
    return {d:num((document.getElementById('ta-done')||{}).textContent),t:num((document.getElementById('ta-total')||{}).textContent)};
  }
  function readAD(){
    try{ if(window.MCFA_ADP&&MCFA_ADP.stats){ var s=MCFA_ADP.stats(); return {d:num(s.done),t:num(s.total)}; } }catch(e){}
    return {d:0,t:0};
  }
  function pctOf(d,t){ if(!(t>0)) return 0; if(d>=t) return 100; return Math.min(99,Math.round(d/t*100)); }
  function calc(){
    var a=readTA(), b=readAD(), pv=preview();
    a.d=Math.min(a.d,a.t); b.d=Math.min(b.d,b.t);
    if(pv){ a={d:a.t,t:a.t}; b={d:b.t,t:b.t}; }                         /* pratinjau: hanya tampilan */
    var ca=a.t>0&&a.d===a.t, cb=b.t>0&&b.d===b.t, T=a.t+b.t, D=a.d+b.d;
    return {ta:a,ad:b,ca:ca,cb:cb,total:T,done:D,pct:pctOf(D,T),pv:pv,state:(ca&&cb)?'selesai':((ca||cb)?'berlangsung':'belum')};
  }
  var STX={belum:'BELUM SELESAI',berlangsung:'PERSIAPAN BERLANGSUNG',selesai:'SELESAI'};

  /* ── bangun panel ── */
  function build(){
    group=document.createElement('section'); group.className='psp'; group.id='pspGroup'; group.setAttribute('data-state','belum');
    group.setAttribute('aria-label','Persiapan MCFA Project');
    group.innerHTML=
      '<div class="psp-bg" aria-hidden="true"></div><div class="psp-bg done" aria-hidden="true"></div><div class="psp-stars" aria-hidden="true"></div><div class="psp-sheen" aria-hidden="true"></div><div class="psp-fx" id="pspFx" aria-hidden="true"></div>'+
      '<span class="psp-pv" id="pspPv" hidden>PRATINJAU TAMPILAN</span>'+
      '<button type="button" class="psp-head" id="pspHead" aria-expanded="false" aria-controls="pspBody">'+
        '<span class="psp-ring" aria-hidden="true">'+
          '<svg viewBox="0 0 64 64"><defs>'+
            '<linearGradient id="pspGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>'+
            '<linearGradient id="pspDisc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10b981"/><stop offset="1" stop-color="#047857"/></linearGradient>'+
          '</defs><circle class="psp-ring-bg" cx="32" cy="32" r="27"/><circle class="psp-ring-fg" id="pspRingFg" cx="32" cy="32" r="27" pathLength="100"/></svg>'+
          '<b class="psp-ring-pct" id="pspRingPct">0%</b>'+
          '<svg class="psp-ring-check" viewBox="0 0 64 64"><path d="M19 33l9 9 17-20" pathLength="100"/></svg>'+
        '</span>'+
        '<span class="psp-text"><small class="psp-kicker">PERSIAPAN · <span id="pspRange"></span></small>'+
          '<b class="psp-title">PERSIAPAN MCFA PROJECT</b>'+
          '<span class="psp-status" id="pspStatus"><i class="psp-dot"></i><span id="pspStatusTx">BELUM SELESAI</span></span></span>'+
        '<span class="psp-chev" aria-hidden="true">▾</span>'+
      '</button>'+
      '<div class="psp-prog" id="pspProg">'+
        '<div class="psp-bar"><i class="psp-bar-fill" id="pspBarFill"></i><i class="psp-bar-shine"></i></div>'+
        '<div class="psp-bar-tx"><span><b id="pspDone">0</b> / <b id="pspTotal">0</b> tugas selesai</span><span id="pspPct">0%</span></div>'+
        '<div class="psp-parts">'+
          '<div class="psp-part" id="pspPartTA"><span class="psp-part-n">1</span><span class="psp-part-t"><b>TUGAS AWAL</b><small id="pspTaTx">0 / 0</small></span><em class="psp-part-ok">✓</em><span class="psp-part-bar"><i id="pspTaFill"></i></span></div>'+
          '<div class="psp-part" id="pspPartAD"><span class="psp-part-n">2</span><span class="psp-part-t"><b>ADAPTASI</b><small id="pspAdTx">0 / 0</small></span><em class="psp-part-ok">✓</em><span class="psp-part-bar"><i id="pspAdFill"></i></span></div>'+
        '</div>'+
      '</div>'+
      '<div class="psp-finish" id="pspFinish"><div class="psp-finish-in"><div class="psp-finish-pad">'+
        '<div class="psp-finish-badge" aria-hidden="true"><i class="psp-spark s1"></i><i class="psp-spark s2"></i><i class="psp-spark s3"></i><i class="psp-spark s4"></i><i class="psp-spark s5"></i>'+
          '<svg viewBox="0 0 96 96"><circle class="psp-fc-disc" cx="48" cy="48" r="38"/><circle class="psp-fc-ring" cx="48" cy="48" r="43" pathLength="100" transform="rotate(-90 48 48)"/><path class="psp-fc-check" d="M30 49l13 13 24-28" pathLength="100"/></svg></div>'+
        '<b class="psp-finish-title">PERSIAPAN MCFA PROJECT SELESAI</b>'+
        '<p class="psp-finish-note">Tahap persiapan sudah selesai. Sekarang kamu dapat melanjutkan fokus pada Aktivitas Sehari-hari.</p>'+
        '<button type="button" class="psp-finish-cta" id="pspCta">LANJUT KE AKTIVITAS SEHARI-HARI</button>'+
      '</div></div></div>'+
      '<div class="psp-body" id="pspBody" role="region" aria-labelledby="pspHead"><div class="psp-body-in"><div class="psp-body-pad">'+
        '<div class="psp-sec" data-sec="ta"><div class="psp-sec-label"><i>1</i><span>TUGAS AWAL MC FATHUL ADZIM</span><em id="pspSecTA">0 / 0</em></div><div class="psp-slot" id="pspSlotTA"></div></div>'+
        '<div class="psp-link" aria-hidden="true"><i></i></div>'+
        '<div class="psp-sec" data-sec="ad"><div class="psp-sec-label"><i>2</i><span>ADAPTASI</span><em id="pspSecAD">0 / 0</em></div><div class="psp-slot" id="pspSlotAD"></div></div>'+
      '</div></div></div>'+
      '<span class="psp-sr" id="pspLive" role="status" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap"></span>';
    ['pspHead','pspBody','pspStatus','pspStatusTx','pspRingFg','pspRingPct','pspBarFill','pspDone','pspTotal','pspPct','pspPartTA','pspPartAD','pspTaTx','pspAdTx','pspTaFill','pspAdFill','pspSecTA','pspSecAD','pspFinish','pspFx','pspPv','pspLive','pspRange','pspProg','pspCta']
      .forEach(function(id){ els[id]=group.querySelector('#'+id); });
    els.pspRange.textContent=range();
    function toggle(){ var o=!group.classList.contains('open'); group.classList.toggle('open',o); els.pspHead.setAttribute('aria-expanded',o?'true':'false'); }
    els.pspHead.addEventListener('click',toggle);
    els.pspProg.addEventListener('click',toggle);
    els.pspCta.addEventListener('click',function(ev){ ev.stopPropagation();
      try{ if(harian&&!harian.classList.contains('open')&&typeof toggleAktHero==='function') toggleAktHero('harian'); else if(harian) harian.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){} });
  }

  /* ── angka berjalan (tampilan saja) ── */
  function tween(el,to){
    if(!el) return; var from=el.__v; el.__v=to;
    if(typeof from!=='number'||from===to||reduce()){ el.textContent=to; return; }
    if(el.__r) cancelAnimationFrame(el.__r);
    var t0=null, dur=650;
    (function step(ts){ if(t0===null) t0=ts; var k=Math.min(1,(ts-t0)/dur), e=1-Math.pow(1-k,3);
      el.textContent=Math.round(from+(to-from)*e); if(k<1) el.__r=requestAnimationFrame(step); else { el.textContent=to; el.__r=0; } })(performance.now());
  }
  function w(el,p){ if(el) el.style.width=p+'%'; }

  /* ── terapkan hitungan ke tampilan ── */
  function paint(c){
    var st=c.state, was=prev?prev.state:null;
    group.setAttribute('data-state',st);
    els.pspPv.hidden=!c.pv;
    els.pspStatusTx.textContent=STX[st];
    els.pspRingFg.style.strokeDashoffset=String(100-c.pct);
    els.pspRingPct.textContent=c.pct+'%';
    w(els.pspBarFill,c.pct); tween(els.pspDone,c.done); tween(els.pspTotal,c.total); els.pspPct.textContent=c.pct+'%';
    els.pspTaTx.textContent=c.ta.d+' / '+c.ta.t; els.pspAdTx.textContent=c.ad.d+' / '+c.ad.t;
    w(els.pspTaFill,pctOf(c.ta.d,c.ta.t)); w(els.pspAdFill,pctOf(c.ad.d,c.ad.t));
    els.pspPartTA.classList.toggle('ok',c.ca); els.pspPartAD.classList.toggle('ok',c.cb);
    els.pspSecTA.textContent=c.ca?'✓ SELESAI':(c.ta.d+' / '+c.ta.t); els.pspSecTA.classList.toggle('ok',c.ca);
    els.pspSecAD.textContent=c.cb?'✓ SELESAI':(c.ad.d+' / '+c.ad.t); els.pspSecAD.classList.toggle('ok',c.cb);
    els.pspFinish.setAttribute('aria-hidden',st==='selesai'?'false':'true');
    els.pspCta.tabIndex=st==='selesai'?0:-1;
    if(prev){
      if(c.done>prev.done&&!reduce()){ group.classList.remove('psp-up'); void group.offsetWidth; group.classList.add('psp-up'); clearTimeout(upT); upT=setTimeout(function(){ group.classList.remove('psp-up'); },1100); }
      if(st!==was){
        els.pspLive.textContent='Persiapan MCFA Project: '+STX[st]+(st==='selesai'?'. Tahap persiapan sudah selesai.':'');
        if(st==='selesai') celebrate(); else { group.classList.remove('psp-boom'); }
      }
    }
    prev=c;
  }

  /* efek khusus saat seluruh persiapan selesai (hanya saat berubah menjadi selesai di sesi ini) */
  function celebrate(){
    try{ if(window.MCFA_SFX&&MCFA_SFX.play) MCFA_SFX.play('success'); }catch(e){}
    try{ if(navigator.vibrate) navigator.vibrate([18,40,18,40,70]); }catch(e){}
    if(reduce()) return;
    group.classList.remove('psp-boom'); void group.offsetWidth; group.classList.add('psp-boom');
    clearTimeout(boomT); boomT=setTimeout(function(){ group.classList.remove('psp-boom'); },4200);
    try{
      var fx=els.pspFx, gr=group.getBoundingClientRect(), bd=group.querySelector('.psp-finish-badge').getBoundingClientRect(), hd=group.querySelector('.psp-ring').getBoundingClientRect();
      var onScreen=bd.width>0&&bd.height>0; var r=onScreen?bd:hd;
      var cx=r.left-gr.left+r.width/2, cy=r.top-gr.top+r.height/2, cols=['#ffe08a','#f5b533','#ffffff','#6ee7b7','#34d399','#c4b5fd'];
      fx.innerHTML='';
      for(var i=0;i<34;i++){ (function(i){
        var p=document.createElement('i'); p.className='psp-conf'; var a=(Math.PI*2)*(i/34)+Math.random()*.4, d=70+Math.random()*120;
        p.style.left=cx+'px'; p.style.top=cy+'px'; p.style.setProperty('--c',cols[i%cols.length]);
        p.style.setProperty('--dx',(Math.cos(a)*d).toFixed(0)+'px'); p.style.setProperty('--dy',(Math.sin(a)*d*.8+60+Math.random()*50).toFixed(0)+'px'); p.style.setProperty('--r',((Math.random()*720)-360).toFixed(0)+'deg');
        p.style.animationDelay=(0.45+Math.random()*.35).toFixed(2)+'s'; fx.appendChild(p); })(i); }
      setTimeout(function(){ if(els.pspFx) els.pspFx.innerHTML=''; },3200);
    }catch(e){}
  }

  function sync(){ if(!group) return; try{ paint(calc()); }catch(e){} }
  function schedule(){ if(tmr) return; tmr=setTimeout(function(){ tmr=null; sync(); },90); }

  /* ── pasang kabel pembaruan (hanya membaca; tidak mengubah modul lain selain membungkus pemanggilan tampilan) ── */
  function wire(){
    if(wired) return; wired=true;
    try{ var o=window.syncHeroProgress; if(typeof o==='function'&&!o.__psp){ var f=function(){ var r=o.apply(this,arguments); schedule(); return r; }; f.__psp=1; window.syncHeroProgress=f; } }catch(e){}
    try{ if(window.MutationObserver){ var mo=new MutationObserver(schedule);
      ['adpRoot','tahRoot'].forEach(function(id){ var n=document.getElementById(id); if(n) mo.observe(n,{childList:true,subtree:true,attributes:true,attributeFilter:['class']}); }); } }catch(e){}
    document.addEventListener('mcfa:data',schedule);
    window.addEventListener('storage',schedule);
    window.addEventListener('focus',schedule);
    document.addEventListener('visibilitychange',function(){ if(!document.hidden) schedule(); });
    setInterval(schedule,30000);
  }

  /* ── susunan: KEGIATAN SEHARI-HARI di atas, PERSIAPAN di bawahnya ── */
  function arrange(){
    if(!grid||!harian||!ta||!ad) return false;
    if(!group) build();
    els.pspRange.textContent=range();
    els.pspHead.parentNode.querySelector('#pspSlotTA').appendChild(ta);
    els.pspHead.parentNode.querySelector('#pspSlotAD').appendChild(ad);
    if(harian.parentNode!==grid||grid.firstElementChild!==harian) grid.insertBefore(harian,grid.firstChild);
    if(group.parentNode!==grid||harian.nextElementSibling!==group) grid.insertBefore(group,harian.nextSibling);
    return true;
  }
  function init(){
    grid=document.querySelector('#blueprintAktivitas .akt-hero-grid'); harian=document.getElementById('heroHarian');
    ta=document.getElementById('heroTugasAwal'); ad=document.getElementById('heroAdaptasi');
    if(!arrange()) return;
    wire(); sync();
    setTimeout(sync,700); setTimeout(sync,2000);        /* modul lain mengisi data sedikit setelah dimuat */
  }
  window.MCFA_PSP={
    apply:function(){ sync(); }, calc:calc, active:function(){ return !!group&&!!group.parentNode; }, state:function(){ return group?group.getAttribute('data-state'):null; },
    verify:function(){ var bad=[];
      if(!grid||!harian||!ta||!ad||!group){ bad.push('kartu/panel tidak ditemukan'); return bad; }
      var kids=[].slice.call(grid.children).filter(function(x){ return x.id; }).map(function(x){ return x.id; });
      if(kids.join()!=='heroHarian,pspGroup') bad.push('urutan utama salah: '+kids.join());
      if(ta.parentNode.id!=='pspSlotTA'||ad.parentNode.id!=='pspSlotAD') bad.push('kartu belum di dalam panel persiapan');
      ['heroTugasAwal','heroAdaptasi','heroHarian','pspGroup','tahRoot','adpRoot'].forEach(function(id){ if(document.querySelectorAll('#'+id).length!==1) bad.push('ID ganda/hilang: '+id); });
      var c=calc(), a=readTA(), b=readAD();
      if(!c.pv){ if(c.total!==a.t+b.t||c.done!==a.d+b.d) bad.push('progres gabungan ≠ jumlah kedua sumber');
        var want=(a.t>0&&a.d===a.t&&b.t>0&&b.d===b.t)?'selesai':(((a.t>0&&a.d===a.t)||(b.t>0&&b.d===b.t))?'berlangsung':'belum');
        if(c.state!==want) bad.push('status hitungan '+c.state+' ≠ '+want); }
      if(group.getAttribute('data-state')!==c.state) bad.push('tampilan status '+group.getAttribute('data-state')+' ≠ '+c.state);
      if(els.pspStatusTx.textContent!==STX[c.state]) bad.push('teks status salah');
      return bad; }
  };
  /* skrip dimuat di akhir halaman: susun segera (sebelum cat pertama) bila elemen sudah ada */
  init();
  if(!group) document.addEventListener('DOMContentLoaded',init);
})();
