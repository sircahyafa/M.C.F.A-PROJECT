function showAppPage(pageKey){
  /* Bersihkan semua partikel konfeti yang mungkin tertinggal */
  var cfW = document.getElementById('cfWrap');
  if(cfW) cfW.innerHTML = '';
  document.querySelectorAll('body > div[style*="temaConfetti"], body > div[style*="fixed"][style*="z-index:9997"]').forEach(function(p){ p.remove(); });
  var pageIdMap = {
    aktivitas: 'blueprintAktivitas',
    identitas: 'page-identitas',
    kehidupan: 'page-kehidupan',
    karir: 'page-karir',
    keuangan: 'page-keuangan'
  };
  Object.keys(pageIdMap).forEach(function(key){
    var el = document.getElementById(pageIdMap[key]);
    if(!el) return;
    if(key === pageKey){
      el.classList.add('active');
      el.querySelectorAll('.reveal').forEach(function(r){ r.classList.add('visible'); });
    } else {
      el.classList.remove('active');
    }
  });
  document.querySelectorAll('.mu-card').forEach(function(card){
    card.classList.toggle('active', card.getAttribute('data-page') === pageKey);
  });
  document.querySelectorAll('.bn-item').forEach(function(btn){
    btn.classList.toggle('active', btn.getAttribute('data-page') === pageKey);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
