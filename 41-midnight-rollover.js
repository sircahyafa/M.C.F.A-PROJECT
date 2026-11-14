/* AUDIT: pantau pergantian hari (Asia/Jakarta). Aplikasi/APK yang dibiarkan terbuka semalaman otomatis pindah ke hari baru:
   Aktivitas Sehari-hari langsung pindah kunci hari; seluruh tampilan berbasis tanggal disegarkan lewat muat ulang
   (data tersimpan di localStorage sehingga aman). Bila sedang mengetik / dialog terbuka, muat ulang ditunda. */
(function(){
  var iso = mcfaIso(mcfaNowJakarta()), pending = false;
  function busy(){
    var a = document.activeElement;
    if(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return true;
    return !!document.querySelector('.fm-dlg-overlay, #akunOverlay.show, .modal.show, .overlay.show');
  }
  function check(){
    var now = mcfaIso(mcfaNowJakarta()); if(now === iso) return;
    try{ if(typeof baRollover === 'function') baRollover(); }catch(e){}
    if(pending || busy()) return;
    pending = true; setTimeout(function(){ location.reload(); }, 400);
  }
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) check(); });
  window.addEventListener('focus', check); window.addEventListener('pageshow', check);
  setInterval(check, 20000);
})();
