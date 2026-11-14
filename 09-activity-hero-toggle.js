/* ═══ TOGGLE AKTIVITAS HERO CARDS ═══ */
/* Prevent clicks inside the body panel from bubbling to the hero card */
document.querySelectorAll('.akt-section-body').forEach(function(el){
  el.addEventListener('click', function(e){ e.stopPropagation(); });
});

function toggleAktHero(key) {
  var card = document.getElementById(key === 'tugasAwal' ? 'heroTugasAwal' : (key === 'adaptasi' ? 'heroAdaptasi' : 'heroHarian'));
  var isOpen = card.classList.contains('open');
  /* Close all first */
  ['heroTugasAwal','heroAdaptasi','heroHarian'].forEach(function(id){
    var el = document.getElementById(id); if (el) el.classList.remove('open');
  });
  /* Toggle clicked one */
  if (!isOpen) {
    card.classList.add('open');
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* Make all reveals inside instantly visible (no re-animation) */
    card.querySelectorAll('.reveal').forEach(function(r){
      r.classList.add('visible');
      r.classList.add('settled');
      r.style.transitionDelay = '';
    });
  }
}
/* Sync hero progress bars from main counters */
function syncHeroProgress() {
  /* Tugas Awal */
  var taDone = parseInt(document.getElementById('ta-done')?.textContent)||0;
  var taTotal = parseInt(document.getElementById('ta-total')?.textContent)||0;
  var taPct = taTotal ? Math.round(taDone/taTotal*100) : 0;
  try{ if(window.TAH&&TAH.overall){ var _o=TAH.overall(); taDone=_o.done; taTotal=_o.total; taPct=_o.pct; } }catch(e){}   /* satu sumber: rumus & pembulatan TAH (100% hanya bila semua selesai) */
  var taHF = document.getElementById('ta-hero-fill');
  if(taHF) taHF.style.width = taPct + '%';
  var taHD = document.getElementById('ta-hero-done'); if(taHD) taHD.textContent = taDone;
  var taHT = document.getElementById('ta-hero-total'); if(taHT) taHT.textContent = taTotal;
  var taHP = document.getElementById('ta-hero-pct'); if(taHP) taHP.textContent = taPct + '%';
  /* Harian */
  var baDone = parseInt(document.getElementById('ba-done')?.textContent)||0;
  var baTotal = parseInt(document.getElementById('ba-total')?.textContent)||0;
  var baPct = baTotal ? Math.round(baDone/baTotal*100) : 0;
  var baHF = document.getElementById('ba-hero-fill');
  if(baHF) baHF.style.width = baPct + '%';
  var baHD = document.getElementById('ba-hero-done'); if(baHD) baHD.textContent = baDone;
  var baHT = document.getElementById('ba-hero-total'); if(baHT) baHT.textContent = baTotal;
  var baHP = document.getElementById('ba-hero-pct'); if(baHP) baHP.textContent = baPct + '%';
}
/* Observe the existing progress counters */
var _origUpdateAll = window.updateAll;
window.updateAll = function() {
  if(typeof _origUpdateAll === 'function') _origUpdateAll();
  syncHeroProgress();
};
setTimeout(syncHeroProgress, 600);
