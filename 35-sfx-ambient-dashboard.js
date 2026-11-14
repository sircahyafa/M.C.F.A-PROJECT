/* LANGKAH 8 — mesin suara baru (kompresor + sintesis berlapis), partikel ambient, dashboard Aktivitas otomatis. */
(function(){
  'use strict';
  var muted=false; try{ muted=localStorage.getItem('mcfa_sfx')==='0'; }catch(e){}
  var bus=null;
  function B(){
    var c=_ac();
    if(!bus||bus.c!==c){ var comp=c.createDynamicsCompressor(); comp.threshold.value=-16; comp.ratio.value=6; comp.attack.value=.003; comp.release.value=.2;
      var g=c.createGain(); comp.connect(g); g.connect(c.destination); bus={c:c,i:comp,o:g}; }
    bus.o.gain.value=muted?0:1; return bus;
  }
  function osc(type,f,t,d,v,f2){
    var b=B(),c=b.c,o=c.createOscillator(),g=c.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);
    if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+d*.9);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g); g.connect(b.i); o.start(t); o.stop(t+d+.05);
  }
  function noise(t,d,v,f0,f1,type){
    var b=B(),c=b.c,n=Math.floor(c.sampleRate*d),buf=c.createBuffer(1,n,c.sampleRate),a=buf.getChannelData(0);
    for(var i=0;i<n;i++) a[i]=(Math.random()*2-1)*(1-i/n);
    var s=c.createBufferSource(); s.buffer=buf; var fl=c.createBiquadFilter(); fl.type=type||'bandpass'; fl.frequency.setValueAtTime(f0,t); fl.frequency.exponentialRampToValueAtTime(f1,t+d);
    var g=c.createGain(); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+d);
    s.connect(fl); fl.connect(g); g.connect(b.i); s.start(t);
  }
  function run(fn){ try{ if(muted) return; var t=B().c.currentTime; fn(t); }catch(e){} }
  var SFX={
    tap:function(){ run(function(t){ osc('sine',900,t,.07,.2,520); noise(t,.03,.05,5000,2500,'highpass'); }); },
    unlock:function(){ run(function(t){ osc('triangle',520,t,.1,.16,780); osc('sine',1040,t+.06,.12,.1); }); },
    undo:function(){ run(function(t){ osc('sine',640,t,.16,.14,380); }); },
    check:function(){ run(function(t){ [784,988,1319].forEach(function(f,i){ osc('triangle',f,t+i*.055,.22,.17); }); noise(t,.12,.04,6000,9000,'highpass'); }); },
    paid:function(){ run(function(t){ osc('sine',110,t,.25,.3,55); [988,1319,1760].forEach(function(f,i){ osc('triangle',f,t+.04+i*.07,.28,.15); }); noise(t+.1,.15,.04,7000,10000,'highpass'); }); },
    success:function(){ run(function(t){ osc('sine',65,t,.8,.35,50); [523.25,659.25,783.99,1046.5,1318.51].forEach(function(f,i){ osc('triangle',f,t+i*.08,.6,.15); osc('sawtooth',f/2,t+i*.08,.35,.04); }); noise(t,.55,.08,300,7000,'bandpass'); osc('sine',2093,t+.35,.6,.07); }); },
    goal:function(){ run(function(t){ osc('sine',80,t,.5,.4,45); [523.25,659.25,783.99,1046.5].forEach(function(f,i){ osc('sawtooth',f,t+i*.11,.22,.07); osc('triangle',f*2,t+i*.11,.22,.05); });
      [523.25,659.25,783.99,1046.5,1318.51].forEach(function(f){ osc('triangle',f,t+.5,1.0,.1); }); noise(t+.5,.9,.07,9000,5000,'highpass'); }); },
    whoosh:function(){ run(function(t){ noise(t,.3,.1,300,4500,'bandpass'); }); }
  };
  window.playTap=SFX.tap; window.playUnlock=SFX.unlock; window.playUndo=SFX.undo; window.playDebtPaid=SFX.paid; window.playSuccess=SFX.success; window.playGoalAchieved=SFX.goal;
  window.MCFA_SFX={play:function(n){ if(SFX[n]) SFX[n](); }, isMuted:function(){ return muted; },
    mute:function(m){ muted=!!m; try{ localStorage.setItem('mcfa_sfx',muted?'0':'1'); }catch(e){} if(bus) bus.o.gain.value=muted?0:1; if(!muted) SFX.tap(); }};
  /* centang Tugas Awal: bunyi sesuai hasil (centang / batal) */
  if(typeof window.taToggle==='function'){ var o1=window.taToggle; window.taToggle=function(el){ o1.apply(this,arguments); try{ SFX[el.classList.contains('done')?'check':'undo'](); }catch(e){} }; }
  if(typeof window.showAppPage==='function'){ var o2=window.showAppPage; window.showAppPage=function(){ var r=o2.apply(this,arguments); SFX.whoosh(); return r; }; }
  if(window.MCFA_TAHAP&&MCFA_TAHAP.onChange) MCFA_TAHAP.onChange(function(){ SFX.unlock(); });

  /* partikel ambient halus */
  function amb(){
    return;
    var d=document.createElement('div'); d.id='mcfaAmb'; d.setAttribute('aria-hidden','true'); var cols=['rgba(250,204,21,.9)','rgba(96,165,250,.9)','rgba(244,114,182,.8)','rgba(52,211,153,.8)'], h='';
    for(var i=0;i<14;i++) h+='<i style="--x:'+(Math.random()*100).toFixed(1)+'%;--s:'+(5+Math.random()*9).toFixed(1)+'px;--d:'+(11+Math.random()*12).toFixed(1)+'s;--dl:-'+(Math.random()*20).toFixed(1)+'s;--dx:'+((Math.random()*80-40)|0)+'px;--c:'+cols[i%4]+'"></i>';
    d.innerHTML=h; document.body.appendChild(d);
  }

  /* dashboard Aktivitas */
  var sig='', BL=['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGU','SEP','OKT','NOV','DES'];
  function nowD(){ try{ return mcfaNowJakarta(); }catch(e){ return mcfaMidnight(); } }
  function paint(){
    var box=document.getElementById('aktDash'); if(!box) return;
    var items=document.querySelectorAll('#tugasAwalSection .ta-item'), _ts=(window.TAH&&TAH.stats)?TAH.stats():null, done=_ts?_ts.done:document.querySelectorAll('#tugasAwalSection .ta-item.done').length, tot=_ts?_ts.total:items.length, pct=tot?Math.round(done/tot*100):0;
    var d=nowD(), st=mcfaParse(MCFA_CORE.taskStart), N=MCFA_DERIVED.taskTotalDays, idx=mcfaDaysBetween(st,d), pS=mcfaParse(MCFA_CORE.projectStart);
    var wd=formatDayUpper(d);   /* d = tanggal Jakarta (tengah malam lokal) → hari dari komponen tanggal, bukan dari instan UTC */
    var status=idx<0?'TUGAS AWAL DIMULAI '+(-idx)+' HARI LAGI':(idx>=N?(function(){var aS=mcfaParse(MCFA_CORE.adaptStart),aE=mcfaParse(MCFA_CORE.adaptEnd);return (d>=aS&&d<=aE)?'PROGRAM ADAPTASI · HARI '+(mcfaDaysBetween(aS,d)+1)+' DARI '+MCFA_DERIVED.adaptTotalDays:'TUGAS AWAL SELESAI';})():'TUGAS AWAL · HARI '+(idx+1)+' DARI '+N);
    var key=[done,tot,idx,d.getDate(),muted,document.documentElement.classList.contains('full-fx')].join('|'); if(key===sig) return; sig=key;
    var dots=''; for(var i=0;i<N;i++){ var dd=new Date(st.getFullYear(),st.getMonth(),st.getDate()+i), c=idx>i?'ok':(idx===i?'now':'');
      dots+='<div class="ak-d '+c+'"><b>'+(idx>i?'✓':dd.getDate())+'</b>'+BL[dd.getMonth()]+'</div>'; }
    var left=mcfaDaysBetween(d,pS); dots+='<div class="ak-d d1"><b>🚀</b>DAY 1 · '+pS.getDate()+' '+BL[pS.getMonth()]+'</div>';
    var nxt=(window.TAH&&TAH.next)?TAH.next():''; for(var j=0;j<items.length&&!(window.TAH&&TAH.next);j++){ if(!items[j].classList.contains('done')){ var l=items[j].querySelector('.ta-label'); nxt=l?l.textContent:''; break; } }
    var sfx=muted?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6m0-6 6 6"/></svg>SUARA OFF':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>SUARA ON';
    box.innerHTML='<span class="ak-spark" style="right:18px;top:12px;font-size:16px">✦</span><span class="ak-spark" style="right:58px;top:36px;font-size:10px;animation-delay:.9s">✦</span>'+
      '<div class="ak-top"><div class="kh-ring"><svg viewBox="0 0 96 96"><circle class="bg" cx="48" cy="48" r="42"/><circle class="fg" cx="48" cy="48" r="42"/></svg><b>'+pct+'%</b></div>'+
      '<div><div class="kh-k">AKTIVITAS · HARI INI</div><div class="kh-t" style="font-size:18px">'+(wd?wd+', ':'')+d.getDate()+' '+BL[d.getMonth()]+' '+d.getFullYear()+'</div><span class="kh-live"><i></i>'+status+'</span></div></div>'+
      '<div class="ak-days">'+dots+'</div>'+
      '<div class="ak-row"><div class="kh-next"><div><small>'+(done>=tot&&tot?'SEMUA TUGAS SELESAI':'TUGAS BERIKUTNYA · '+done+' / '+tot)+'</small>'+(nxt||'Siap menuju DAY 1 🎉')+'</div></div><button id="akSfx" type="button" aria-label="Suara">'+sfx+'</button><button id="akLite" type="button" aria-label="Efek animasi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>'+(document.documentElement.classList.contains('full-fx')?'PENUH':'HEMAT')+'</button></div>';
    var ring=box.querySelector('.fg'); requestAnimationFrame(function(){ requestAnimationFrame(function(){ if(ring) ring.style.strokeDashoffset=(263.9*(1-pct/100)).toFixed(1); }); });
    var b=document.getElementById('akSfx'); if(b) b.addEventListener('click',function(e){ e.stopPropagation(); MCFA_SFX.mute(!muted); sig=''; paint(); });
    var lb=document.getElementById('akLite'); if(lb) lb.addEventListener('click',function(e){ e.stopPropagation(); var on=document.documentElement.classList.toggle('full-fx'); try{ localStorage.setItem('mcfa_fx',on?'full':'lite'); }catch(x){} sig=''; paint(); });
  }
  function mount(tries){
    var pg=document.getElementById('blueprintAktivitas');
    if(!pg||typeof taToggle!=='function'||!window.MCFA_DERIVED||!pg.querySelector('.tp-wrap')){ if(tries>0) setTimeout(function(){ mount(tries-1); },250); return; }
    if(document.getElementById('aktDash')) return;
    var b=document.createElement('section'); b.id='aktDash'; pg.insertBefore(b,pg.querySelector('.tp-wrap')); paint(); setInterval(paint,700);
  }
  function init(){ amb(); mount(40); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
