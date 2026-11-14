/* KEUANGAN × TAHAP — progres = total pemasukan aktif dari buku transaksi (bukan saldo manual), target Rp400 jt / Rp500 jt / Rp500 jt per tahap, kumulatif:
   Tahap 1 = 0–400 jt, Tahap 2 = 400–900 jt, Tahap 3 = 900 jt–1,4 M. Milestone/riwayat lama difilter ke rentang tahap (data tidak diubah). */
(function(){
  'use strict';
  var page = document.getElementById('page-keuangan'); if (!page) return;
  var divs = page.querySelectorAll('.section-divider'), ref = page.querySelector('.dtarget-banner'),
      d1 = divs[0], d2 = divs[1], bal = page.querySelector('.fm-balance-card'),
      prog = document.getElementById('fmProgressCard'), hist = page.querySelector('.fm-history-card');
  /* urutan efisien: saldo & progres di atas, rencana bulanan di bawah (elemen dipindah, id & event tetap) */
  if (ref && d1 && d2 && bal && prog && hist && ref.parentNode){
    [d2, bal, prog, hist, d1].forEach(function(n){ ref.parentNode.insertBefore(n, ref); });
    d1.classList.add('tp-fin-gate'); d2.classList.add('tp-fin-gate');
  }
  /* Progres Keuangan = Total Pemasukan Aktif (satu sumber: MCFA_FIN_CALC, buku transaksi). Pengeluaran tidak menurunkan progres. */
  function saldo(){ try{ return window.MCFA_FIN_CALC.totals().income; }catch(e){ return 0; } }
  function rp(n){ return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }
  function render(n, def, el){
    var u = MCFA_TAHAP.uang(saldo(), n);
    el.innerHTML = '<div class="tp-prow fn"><div class="tp-ptop"><span class="tp-pname">Progres Keuangan · Target '+rp(def.uang)+'</span>'+
      '<span class="tp-ppct">'+u.pct.toLocaleString('id-ID',{maximumFractionDigits:1})+'%</span></div>'+
      '<div class="tp-ptrack"><div class="tp-pfill" style="width:'+Math.min(100,u.terisi/u.target*100)+'%"></div></div>'+
      '<div class="tp-psub">'+rp(u.terisi)+' / '+rp(u.target)+' · kurang '+rp(u.sisa)+'</div></div>';
  }
  function precise(n){ return Math.round(n); }
  function applyFilter(n){
    document.body.classList.toggle('tp-has', n !== null);
    var lo = n === null ? 0 : MCFA_TAHAP.floor(n), hi = n === null ? 0 : lo + MCFA_TAHAP.def[n].uang;
    [].forEach.call(page.querySelectorAll('.fm-history-item[data-ms]'), function(r){
      var m = +r.getAttribute('data-ms');
      r.classList.toggle('tp-off', n !== null && !(m > lo && m <= hi));
    });
    var act = page.querySelector('.fm-history-item.fm-active'), m = act ? +act.getAttribute('data-ms') : null;
    if (prog) prog.classList.toggle('tp-off', n !== null && m !== null && !(m > lo && m <= hi));
  }
  function refresh(){
    var n = MCFA_TAHAP.get(); if (n === null) return;
    var el = document.querySelector('.tp-body[data-tp-body="keuangan"]');
    if (el) render(n, MCFA_TAHAP.def[n], el);
    applyFilter(n);
  }
  MCFA_TAHAP.register('keuangan', render);
  MCFA_TAHAP.onChange(applyFilter);
  MCFA_TAHAP.onChange(function(){ try{ updateAll(); }catch(e){ console.warn('[KEUANGAN×TAHAP]',e); } });
  var list = document.getElementById('fmHistoryList');
  if (list && window.MutationObserver) new MutationObserver(function(){ applyFilter(MCFA_TAHAP.get()); }).observe(list, {childList:true});
  document.addEventListener('mcfa-ledger', refresh);
  window.addEventListener('storage', refresh);
})();
