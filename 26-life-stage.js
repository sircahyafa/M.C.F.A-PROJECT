/* KEHIDUPAN × TAHAP — Tahap 1 = Fase 1–3, Tahap 2 = Fase 4, Tahap 3 = Fase 5 (pemetaan di MCFA_TAHAP.def[n].fase).
   Progres = target fase yang sudah tercapai (state S yang sudah ada). Ringkasan seluruh-fase disembunyikan agar tahap tidak tercampur. */
(function(){
  'use strict';
  var page = document.getElementById('page-kehidupan'); if (!page) return;
  Array.prototype.forEach.call(page.querySelectorAll('.section-label'), function(el){
    var t = (el.textContent||'').trim();
    if (t === 'Progress Keseluruhan') el.classList.add('tp-agg');
    if (t === 'Fase Impian') el.classList.add('tp-fase-label');
  });
  function pctTxt(d,t){ return (t>0 ? d/t*100 : 0).toLocaleString('id-ID',{maximumFractionDigits:1}); }
  function stat(i){ var ids = PHASE_GOALS[i] || []; return {done: ids.filter(function(id){ return S[id]; }).length, total: ids.length}; }
  function row(cls, name, d, t){
    var w = t>0 ? Math.min(100, d/t*100) : 0;
    return '<div class="tp-prow '+cls+'"><div class="tp-ptop"><span class="tp-pname">'+name+'</span><span class="tp-ppct">'+pctTxt(d,t)+'%</span></div>'+
           '<div class="tp-ptrack"><div class="tp-pfill" style="width:'+w+'%"></div></div>'+
           '<div class="tp-psub">'+d+' / '+t+' target tercapai</div></div>';
  }
  function render(n, def, el){
    var h = '', D = 0, T = 0, body = '';
    def.fase.forEach(function(fn){
      var st = stat(fn-1); D += st.done; T += st.total;
      body += row('kh', 'Fase '+fn+' · '+PL[fn-1], st.done, st.total);
    });
    if (def.fase.length > 1) h += row('khs', 'Gabungan Fase '+def.fase[0]+'–'+def.fase[def.fase.length-1], D, T);
    el.innerHTML = h + body;
  }
  function applyFilter(n){
    document.body.classList.toggle('tp-has', n !== null);
    var fase = n === null ? [] : MCFA_TAHAP.def[n].fase;
    Array.prototype.forEach.call(page.querySelectorAll('.phase-tab'),   function(t,i){ t.classList.toggle('tp-off', fase.indexOf(i+1) < 0); });
    Array.prototype.forEach.call(page.querySelectorAll('.phase-panel'), function(t,i){ t.classList.toggle('tp-off', fase.indexOf(i+1) < 0); });
    var nav = document.getElementById('phaseNav'); if (nav) nav.classList.toggle('tp-off', fase.length < 2);
    if (n !== null && fase.indexOf(curPhase+1) < 0) switchPhase(fase[0]-1);
  }
  function refresh(){
    var n = MCFA_TAHAP.get(); if (n === null) return;
    var el = document.querySelector('.tp-body[data-tp-body="kehidupan"]');
    if (el) render(n, MCFA_TAHAP.def[n], el);
  }
  MCFA_TAHAP.register('kehidupan', render);
  MCFA_TAHAP.onChange(applyFilter);
  var orig = window.updateAll;
  if (typeof orig === 'function') window.updateAll = function(){ var r = orig.apply(this, arguments); refresh(); return r; };
})();
