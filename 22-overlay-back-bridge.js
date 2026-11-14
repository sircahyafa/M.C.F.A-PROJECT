(function(){
  var N = window.MCFA_NAV; if(!N) return;

  /* helper: pantau overlay yang dibuka/ditutup oleh kode lain, tanpa mengubah kode aslinya */
  function watch(el, isOpen, layer, closeFn){
    var was = isOpen(el);
    if(was) N.push(layer, closeFn);
    new MutationObserver(function(){
      var now = isOpen(el);
      if(now && !was) N.push(layer, closeFn);
      else if(!now && was) N.drop(layer);
      was = now;
    }).observe(el, {attributes:true, attributeFilter:['class','style']});
  }

  /* modal akun */
  var ak = document.getElementById('akunOverlay');
  if(ak) watch(ak, function(e){ return e.classList.contains('show'); }, 'akun', function(){ closeAkunModal(); });

  /* panel akun / sinkronisasi */
  var acc = document.getElementById('mcfa-acc-panel');
  if(acc) watch(acc, function(e){ return e.classList.contains('open'); }, 'acc', function(){ acc.classList.remove('open'); });

  /* panel pengaturan (dibuat saat pertama dibuka) */
  function hookSettings(){
    var sp = document.getElementById('mcfa-settings-panel');
    if(!sp || sp._navHooked) return !!sp;
    sp._navHooked = true;
    watch(sp, function(e){ return e.classList.contains('open'); }, 'settings', function(){ if(sp._mcfaClose) sp._mcfaClose(); else sp.classList.remove('open'); });
    return true;
  }
  if(!hookSettings()){
    var bo = new MutationObserver(function(){ if(hookSettings()) bo.disconnect(); });
    bo.observe(document.body, {childList:true});
  }

  /* tab bawah: Back dari tab mana pun → kembali ke tab awal (M.C.F.A STUDIO), lalu keluar */
  var HOME = 'identitas', curPage = HOME;
  var act = document.querySelector('.bn-item.active'); if(act && act.getAttribute('data-page')) curPage = act.getAttribute('data-page');
  var origPage = window.showAppPage;
  if(typeof origPage === 'function'){
    window.showAppPage = function(k){
      var prev = curPage;
      origPage.apply(this, arguments);
      curPage = k;
      if(k === prev) return;
      if(prev === 'karir') N.drop('karir');          // sub-tab Karir ikut ditutup saat pindah tab
      if(prev === 'identitas') N.drop('bptab');      // sub-tab Identitas
      if(k === HOME) N.drop('page');
      else if(!N.has('page')) N.push('page', function(){ origPage(HOME); curPage = HOME; });
    };
  }

  /* sub-tab Karir */
  var origK = window.switchKarirTab, kCur = 0;
  if(typeof origK === 'function'){
    window.switchKarirTab = function(i){
      origK.apply(this, arguments);
      if(i === kCur) return;
      kCur = i;
      if(i === 0) N.drop('karir');
      else if(!N.has('karir')) N.push('karir', function(){ origK(0); kCur = 0; });
    };
  }

  /* sub-tab Identitas (Blueprint) */
  var origB = window.bpTab, bCur = 0;
  if(typeof origB === 'function'){
    window.bpTab = function(idx, el){
      origB.apply(this, arguments);
      if(idx === bCur) return;
      bCur = idx;
      if(idx === 0) N.drop('bptab');
      else if(!N.has('bptab')) N.push('bptab', function(){ origB(0, document.querySelector('.bp-ftab')); bCur = 0; });
    };
  }
})();
