/* ═══════ PREMIUM JS UPGRADES ═══════ */

/* ── 1. SCROLL PROGRESS BAR ── */
(function(){
  var bar = document.createElement('div');
  bar.id = 'mcfa-scroll-bar';
  document.body.insertBefore(bar, document.body.firstChild);
  var ticking = false;
  function updateBar(){
    var st = window.scrollY, dh = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (dh > 0 ? (st / dh) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if (!ticking) { requestAnimationFrame(updateBar); ticking = true; }
  }, { passive: true });
})();

/* ── 2. RIPPLE EFFECT — semua tombol & card ── */
(function(){
  function addRipple(el){
    el.classList.add('ripple-host');
    el.addEventListener('pointerdown', function(e){
      var r = el.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      var size = Math.max(r.width, r.height) * 1.6;
      var circle = document.createElement('div');
      circle.className = 'ripple-circle';
      circle.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+(x-size/2)+'px;top:'+(y-size/2)+'px;';
      el.appendChild(circle);
      setTimeout(function(){ if(circle.parentNode) circle.remove(); }, 600);
    });
  }
  function initRipples(){
    document.querySelectorAll('.mu-card, .bn-item, .phase-tab, .bp-akun, .goal-main, .lv-head, .debt-row, .bp-nilai, .hero-chip, .am-konten-item, .back-top').forEach(function(el){
      if(!el.dataset.ripple){ el.dataset.ripple = '1'; addRipple(el); }
    });
  }
  document.addEventListener('DOMContentLoaded', initRipples);
  setTimeout(initRipples, 1500);
  setTimeout(initRipples, 3000);
})();

/* ── 3. HAPTIC FEEDBACK ── */
function haptic(type){
  if(!navigator.vibrate) return;
  if(type === 'light') navigator.vibrate(8);
  else if(type === 'medium') navigator.vibrate(18);
  else if(type === 'success') navigator.vibrate([10,30,10]);
}
document.addEventListener('click', function(e){
  var el = e.target.closest('.bn-item, .phase-tab, .mu-card');
  if(el) haptic('light');
  var el2 = e.target.closest('.goal-main, .am-konten-chk, .d-check, .lv-head');
  if(el2) haptic('medium');
}, { passive: true });

/* ── 4. SOFT CLICK SOUND ── */
(function(){
  var ctx;
  function getCtx(){
    ctx = window.mcfaAudioCtx();   /* selalu lewat getter bersama: ikut di-resume bila sempat ditahan di latar belakang */
    return ctx;
  }
  function playClick(freq, dur, vol){
    try {
      var c = getCtx();
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.frequency.value = freq || 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(vol || 0.06, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (dur || 0.08));
      osc.start(c.currentTime); osc.stop(c.currentTime + (dur || 0.08));
    } catch(e){}
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest('.bn-item'); if(el){ playClick(1046, 0.07, 0.04); return; }
    var el2 = e.target.closest('.mu-card'); if(el2){ playClick(880, 0.06, 0.03); return; }
    var el3 = e.target.closest('.goal-main, .am-konten-chk'); if(el3){ playClick(1318, 0.09, 0.05); return; }
    var el4 = e.target.closest('.phase-tab'); if(el4){ playClick(740, 0.06, 0.03); return; }
  }, { passive: true });
})();

/* ── 5. BOTTOM NAV — showAppPage override dengan page transition ── */
(function(){
  var _orig = window.showAppPage;
  window.showAppPage = function(pageKey){
    haptic('light');
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
    document.querySelectorAll('.mu-card').forEach(function(c){
      c.classList.toggle('active', c.getAttribute('data-page') === pageKey);
    });
    document.querySelectorAll('.bn-item').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-page') === pageKey);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
})();

/* ── 6. Reveal-on-scroll: delegates to the single canonical observer
   defined earlier (window.__revealScan) instead of creating a second
   IntersectionObserver, which previously caused duplicate reveal
   animations on tab switches/refresh. ── */
(function(){
  function run(){ if(window.__revealScan) window.__revealScan(); }
  run();
  setTimeout(run, 1000);
  setTimeout(run, 2500);
})();

/* ── 7. BUG FIX: prevent double-tap zoom on iOS ── */
(function(){
  var lastTap = 0;
  document.addEventListener('touchend', function(e){
    var now = Date.now();
    if(now - lastTap < 300){
      var t = e.target.closest('button, .mu-card, .bn-item, .bp-akun, .goal-main, .phase-tab, .lv-head');
      if(t){ e.preventDefault(); }
    }
    lastTap = now;
  }, { passive: false });
})();

/* ── 8. BUG FIX: make sure .app-page transitions work ── */
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    // ensure first active page is shown without transition flash
    document.querySelectorAll('.app-page.active').forEach(function(p){
      p.style.opacity = '1';
    });
  });
})();

/* ── 9. BUG FIX: safe-area on older iOS ── */
(function(){
  if(CSS && CSS.supports && !CSS.supports('padding-bottom', 'env(safe-area-inset-bottom)')){
    var bn = document.querySelector('.bottom-nav');
    if(bn) bn.style.paddingBottom = '14px';
  }
})();

/* ── 10. PERFORMANCE: use will-change for animated elements ── */
(function(){
  var toAccelerate = '.hero-card, .mu-card, .bp-akun, .back-top, .notif';
  document.querySelectorAll(toAccelerate).forEach(function(el){
    el.style.willChange = 'transform';
  });
})();
