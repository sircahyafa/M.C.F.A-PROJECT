(function(){
  'use strict';
  function rpf(n){ return 'Rp '+Math.round(n).toLocaleString('id-ID'); }
  function nowD(){ try{ return mcfaNowJakarta(); }catch(e){ return mcfaMidnight(); } }
  function stageNow(){ var d=nowD(), D=MCFA_TAHAP.def; for(var n=1;n<=3;n++){ if(d<=mcfaParse(D[n].end)) return n; } return 3; }
  function wrap(cls,anchor,pg){
    var tw=pg.querySelector('.tp-wrap'); if(!tw||!anchor||anchor.parentNode.classList.contains('dash-wrap')) return false;
    var w=document.createElement('div'); w.className='dash-wrap '+cls; anchor.parentNode.insertBefore(w,anchor); w.appendChild(anchor); w.appendChild(tw); return true;
  }
  function finHead(){
    var pg=document.getElementById('page-keuangan'), tw=pg&&pg.querySelector('.tp-wrap'); if(!tw||document.getElementById('finHead')) return;
    var h=document.createElement('div'); h.id='finHead';
    var w=document.createElement('div'); w.className='dash-wrap dw-keu'; tw.parentNode.insertBefore(w,tw); w.appendChild(h); w.appendChild(tw);
    var sig='';
    function paint(){
      var d=nowD(), pS=mcfaParse(MCFA_CORE.projectStart), live, sel=MCFA_TAHAP.get()||stageNow();
      if(d<pS) live='DAY 1 DALAM '+mcfaDaysBetween(d,pS)+' HARI'; else if(d>mcfaParse(MCFA_CORE.projectEnd)) live='PROJECT SELESAI'; else live='TAHAP '+stageNow()+' · DAY '+MCFA_DERIVED.projectDayOf(d).toLocaleString('id-ID')+' DARI '+MCFA_DERIVED.projectTotalDays.toLocaleString('id-ID');
      var ga=pg.querySelector('.fg-amount'), mo=0; try{ mo=_rpOf(ga)||0; }catch(e){}
      var k=[live,sel,mo].join('|'); if(k===sig) return; sig=k;
      h.innerHTML='<div class="kh-k">KEUANGAN · RENCANA</div><div class="kh-t" style="font-size:19px">Pemasukan & Pengeluaran</div><span class="kh-live"><i></i>'+live+'</span>'+
        '<div class="fh-g"><div><small>TARGET BULANAN</small><b>'+rpf(mo)+'</b></div><div><small>TARGET UANG TAHAP '+sel+'</small><b>'+rpf(MCFA_TAHAP.def[sel].uang)+'</b></div></div>';
    }
    paint(); setInterval(paint,800);
  }
  function init(){
    var t=0, iv=setInterval(function(){
      try{
        var a=document.getElementById('blueprintAktivitas'), k=document.getElementById('page-kehidupan');
        if(a) wrap('dw-akt',document.getElementById('aktDash'),a);
        if(k) wrap('dw-keh',document.getElementById('khDash'),k);
        if(window.MCFA_TAHAP&&window.MCFA_STUDIO) finHead();
      }catch(e){}
      if(++t>60) clearInterval(iv);
    },250);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
