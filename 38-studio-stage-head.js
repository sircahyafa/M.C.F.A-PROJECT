(function(){
  'use strict';
  function nowD(){ try{ return mcfaNowJakarta(); }catch(e){ return mcfaMidnight(); } }
  function stageNow(){ var d=nowD(), D=MCFA_TAHAP.def; for(var n=1;n<=3;n++){ if(d<=mcfaParse(D[n].end)) return n; } return 3; }
  function mount(){
    var tw=document.querySelector('.tp-wrap[data-tp-page="identitas"]'); if(!tw||!window.MCFA_TAHAP||document.getElementById('stuHead')) return false;
    var w=document.createElement('div'); w.className='dash-wrap dw-stu'; var h=document.createElement('div'); h.id='stuHead';
    tw.parentNode.insertBefore(w,tw); w.appendChild(h); w.appendChild(tw);
    var sig='';
    function paint(){
      var d=nowD(), pS=mcfaParse(MCFA_CORE.projectStart), live;
      if(d<pS) live='DAY 1 DALAM '+mcfaDaysBetween(d,pS)+' HARI'; else if(d>mcfaParse(MCFA_CORE.projectEnd)) live='PROJECT SELESAI'; else live='TAHAP '+stageNow()+' · DAY '+MCFA_DERIVED.projectDayOf(d).toLocaleString('id-ID')+' DARI '+MCFA_DERIVED.projectTotalDays.toLocaleString('id-ID');
      if(live===sig) return; sig=live;
      h.innerHTML='<div class="kh-k">M.C.F.A STUDIO · TAHAPAN</div><div class="kh-t" style="font-size:19px">Akun & Konten per Tahap</div><span class="kh-live"><i></i>'+live+'</span>';
    }
    paint(); setInterval(paint,800); return true;
  }
  function init(){ var t=0, iv=setInterval(function(){ try{ if(mount()||++t>60) clearInterval(iv); }catch(e){ if(++t>60) clearInterval(iv); } },250); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
