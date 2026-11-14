/* KEHIDUPAN — ringkasan otomatis: progres semua impian (utang + wishlist), hari berjalan, target berikutnya, 5 fase. */
(function(){
  'use strict';
  var sig='';
  function rp(n){ return 'Rp '+Math.round(n).toLocaleString('id-ID'); }
  function nowD(){ try{ return mcfaNowJakarta(); }catch(e){ return mcfaMidnight(); } }
  function nextTarget(){
    var rows=document.querySelectorAll('#panel0 .debt-row');
    for(var i=0;i<rows.length;i++){ var id=rows[i].getAttribute('data-id'); if(!S[id]){ var n=rows[i].querySelector('.d-name'); return {t:'LUNASI UTANG',n:n?n.textContent:'Utang berikutnya'}; } }
    for(var j=0;j<ALL_GOALS.length;j++){ if(!S[ALL_GOALS[j].id]) return {t:'IMPIAN BERIKUTNYA',n:ALL_GOALS[j].name}; }
    return {t:'SELESAI',n:'Semua impian tercapai 🎉'};
  }
  function paint(){
    var box=document.getElementById('khDash'); if(!box) return;
    var ids=[].concat(ALL_DEBTS_ID,ALL_GOALS.map(function(g){return g.id;})), done=ids.filter(function(i){return S[i];}).length, pct=ids.length?Math.round(done/ids.length*100):0;
    var d=nowD(), pS=mcfaParse(MCFA_CORE.projectStart), live;
    if(d<pS) live='DAY 1 DALAM '+mcfaDaysBetween(d,pS)+' HARI'; else if(d>mcfaParse(MCFA_CORE.projectEnd)) live='PROJECT SELESAI'; else live='DAY '+MCFA_DERIVED.projectDayOf(d).toLocaleString('id-ID')+' DARI '+MCFA_DERIVED.projectTotalDays.toLocaleString('id-ID');
    var left=MCFA_DERIVED.projectDaysLeft(d), nx=nextTarget();
    var paid=(document.getElementById('totalPaid')||{}).textContent||'Rp 0', tot=PHASE1_TOTAL+GRID_TOTALS.reduce(function(a,b){return a+b;},0);
    var phs=PHASE_GOALS.map(function(a,i){ var c=a.filter(function(x){return S[x];}).length; return {p:a.length?Math.round(c/a.length*100):0,n:PL[i]}; });
    var key=[done,pct,live,left,nx.n,paid].join('|'); if(key===sig) return; sig=key;
    box.innerHTML='<div class="kh-top"><div class="kh-ring"><svg viewBox="0 0 96 96"><circle class="bg" cx="48" cy="48" r="42"/><circle class="fg" cx="48" cy="48" r="42" data-p="'+pct+'"/></svg><b>'+pct+'%</b></div>'+
      '<div><div class="kh-k">KEHIDUPAN · IMPIAN</div><div class="kh-t">Perjalanan Hidup</div><span class="kh-live"><i></i>'+live+'</span></div></div>'+
      '<div class="kh-g"><div><b>'+done+' / '+ids.length+'</b><small>TARGET</small></div><div><b>'+left.toLocaleString('id-ID')+'</b><small>HARI TERSISA</small></div><div><b>'+paid.replace('Rp ','')+'</b><small>TERBAYAR (RP)</small></div></div>'+
      '<div class="kh-next"><div><small>'+nx.t+'</small>'+nx.n+'</div></div>'+
      '<div class="kh-ph">'+phs.map(function(f,i){ return '<button data-i="'+i+'"><b>'+f.p+'%</b><small>FASE '+(i+1)+'</small><i><u style="width:0" data-w="'+f.p+'"></u></i></button>'; }).join('')+'</div>';
    box.querySelectorAll('.kh-ph button').forEach(function(b){ b.addEventListener('click',function(){ var i=+b.getAttribute('data-i'); try{ switchPhase(i); }catch(e){} var n=document.getElementById('phaseNav'); if(n&&n.scrollIntoView) n.scrollIntoView({behavior:'smooth',block:'start'}); if(navigator.vibrate) navigator.vibrate(8); }); });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ var c=box.querySelector('.fg'); if(c) c.style.strokeDashoffset=(263.9*(1-pct/100)).toFixed(1); box.querySelectorAll('.kh-ph u').forEach(function(u){ u.style.width=u.getAttribute('data-w')+'%'; }); }); });
  }
  function mount(tries){
    var pg=document.getElementById('page-kehidupan'), hero=pg&&pg.querySelector('.hero-card');
    if(!hero||typeof S==='undefined'||typeof ALL_GOALS==='undefined'||!window.MCFA_DERIVED){ if(tries>0) setTimeout(function(){ mount(tries-1); },250); return; }
    if(document.getElementById('khDash')) return;
    var b=document.createElement('section'); b.id='khDash'; hero.parentNode.insertBefore(b,hero.nextSibling);
    paint(); setInterval(paint,600);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ mount(40); }); else mount(40);
})();
