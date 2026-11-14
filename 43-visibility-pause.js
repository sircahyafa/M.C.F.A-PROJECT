/* Tahap 10 — hentikan animasi CSS saat aplikasi tidak terlihat (hemat baterai Android).
   Animasi dilanjutkan otomatis saat aplikasi kembali terlihat. Tidak mengubah logika/data. */
(function(){
  var root=document.documentElement;
  function sync(){ root.classList.toggle('mcfa-bg', !!document.hidden); }
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', function(){ root.classList.add('mcfa-bg'); });
  window.addEventListener('pageshow', sync);
  sync();
})();
