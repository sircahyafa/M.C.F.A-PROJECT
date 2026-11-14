/* ── AVATAR UPLOAD — PERSONA ── */
function triggerAvatarUpload(color) {
  document.getElementById('avatar-input-' + color).click();
}
function loadAvatar(color, input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = document.getElementById('avatar-img-' + color);
    var ph = document.getElementById('avatar-placeholder-' + color);
    img.src = e.target.result;
    img.style.display = 'block';
    ph.style.display = 'none';
    // save to localStorage
    var saved = true;
    try { localStorage.setItem('avatar_' + color, e.target.result); } catch(err){ saved = false; }
    if(!saved && typeof showNotif === 'function'){
      showNotif('Foto ditampilkan tapi belum tersimpan (gambar terlalu besar).');
    }
  };
  reader.readAsDataURL(file);
}
// Restore saved avatars on load
(function() {
  ['red', 'green'].forEach(function(color) {
    try {
      var saved = localStorage.getItem('avatar_' + color);
      if (saved) {
        var img = document.getElementById('avatar-img-' + color);
        var ph = document.getElementById('avatar-placeholder-' + color);
        if (img) { img.src = saved; img.style.display = 'block'; }
        if (ph) { ph.style.display = 'none'; }
      }
    } catch(err){}
  });
})();

/* ── COLLAPSIBLE BLOCKS — Aktivitas & Persona ── */
(function(){
  // Toggle ba-block on header click
  document.querySelectorAll('.ba-block-header').forEach(function(hdr){
    hdr.addEventListener('click', function(e){
      // Don't interfere with checkbox clicks inside
      var block = hdr.closest('.ba-block');
      if(!block) return;
      var items = block.querySelector('.ba-items');
      var opening = !block.classList.contains('open');
      block.classList.toggle('open');
      // Ukur tinggi konten sebenarnya (bukan batas atas 2000px tetap) agar
      // durasi transisi terasa proporsional dan tidak patah — pola sama
      // dengan collapse Tugas Awal.
      if (items) {
        if (opening) {
          items.style.maxHeight = items.scrollHeight + 'px';
          items.addEventListener('transitionend', function handler(ev) {
            if (ev.propertyName === 'max-height' && block.classList.contains('open')) {
              items.style.maxHeight = 'none';
            }
            items.removeEventListener('transitionend', handler);
          });
        } else {
          items.style.maxHeight = items.scrollHeight + 'px';
          items.offsetHeight; // force reflow so transition starts from measured height, not 'none'
          requestAnimationFrame(function(){ items.style.maxHeight = '0px'; });
        }
      }
    });
  });
  // bp-persona toggle: ukur tinggi konten sebenarnya (bukan batas atas
  // 3000px tetap) agar transisi buka/tutup terasa proporsional & tidak patah.
  window.toggleBpPersona = function(headerEl) {
    var block = headerEl.closest('.bp-persona');
    if (!block) return;
    var body = block.querySelector('.bp-persona-body');
    var opening = !block.classList.contains('open');
    block.classList.toggle('open');
    if (body) {
      if (opening) {
        body.style.maxHeight = body.scrollHeight + 'px';
        body.addEventListener('transitionend', function handler(ev) {
          if (ev.propertyName === 'max-height' && block.classList.contains('open')) {
            body.style.maxHeight = 'none';
          }
          body.removeEventListener('transitionend', handler);
        });
      } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        body.offsetHeight; // force reflow so transition starts from measured height, not 'none'
        requestAnimationFrame(function(){ body.style.maxHeight = '0px'; });
      }
    }
  };
})();

/* ── KARIR MULTI-TAB SWITCHER ── */
(function(){
  var _curKarirIdx = 0;
  var TOTAL_TABS = 4;

  function updateIndicator(idx) {
    var ind = document.getElementById('karirIndicator');
    if (!ind) return;
    var pct = (idx / (TOTAL_TABS - 1)) * (100 - 100/TOTAL_TABS);
    ind.style.transform = 'translateX(' + (idx * 400 / TOTAL_TABS) + '%)';
    // Simpler: just move by percentage of track
    ind.style.transform = 'translateX(' + (idx * (400 - 0) / TOTAL_TABS) + '%)';
  }

  window.switchKarirTab = function(idx) {
    if (idx === _curKarirIdx) return;

    var panels = document.querySelectorAll('.kr-panel');
    var tabs   = document.querySelectorAll('.kr-tab');
    var prev   = _curKarirIdx;
    var next   = idx;
    var goRight = next > prev;

    // Update tabs
    tabs.forEach(function(t, i) {
      t.classList.toggle('active', i === next);
    });

    // Update indicator
    var ind = document.getElementById('karirIndicator');
    if (ind) ind.style.transform = 'translateX(' + (next * 300) + '%)';

    // Animate panels
    var leaveClass  = goRight ? 'kr-leaving'       : 'kr-leaving-right';
    var enterClass  = goRight ? 'kr-entering'      : 'kr-entering-left';

    var leaving = panels[prev];
    var entering = panels[next];

    // 1. Remove active from current, add leave animation
    leaving.classList.remove('active');
    leaving.classList.add(leaveClass);

    // 2. Show entering panel with animation
    entering.classList.add(enterClass);

    // 3. After leave animation finishes
    var leaveDur = 220;
    setTimeout(function() {
      leaving.classList.remove(leaveClass);
      leaving.style.position = '';
      // Trigger reveal on entering cards
      entering.querySelectorAll('.reveal').forEach(function(r) {
        r.classList.add('visible');
      });
    }, leaveDur);

    // 4. After enter animation finishes, lock it as active
    setTimeout(function() {
      entering.classList.remove(enterClass);
      entering.classList.add('active');
    }, 320);

    // Haptic
    if (navigator.vibrate) navigator.vibrate(8);
    _curKarirIdx = next;
  };

  // Init indicator position
  document.addEventListener('DOMContentLoaded', function() {
    var ind = document.getElementById('karirIndicator');
    if (ind) ind.style.transform = 'translateX(0%)';
    // Trigger visible for first panel
    var firstPanel = document.getElementById('krPanel0');
    if (firstPanel) {
      firstPanel.querySelectorAll('.reveal').forEach(function(r) {
        r.classList.add('visible');
      });
    }
  });
})();

/* 7 NOV 2026 — Aksesibilitas tombol Persona: header bisa difokus & dibuka dengan Enter/Spasi; aria-expanded mengikuti status. Fungsi toggleBpPersona asli tidak diubah. */
(function(){
  function sync(){ document.querySelectorAll('.bp-persona-header').forEach(function(h){ var b=h.closest('.bp-persona'); h.setAttribute('aria-expanded', b&&b.classList.contains('open')?'true':'false'); }); }
  function init(){
    document.querySelectorAll('.bp-persona-header').forEach(function(h){
      h.setAttribute('role','button'); h.setAttribute('tabindex','0');
      h.addEventListener('keydown',function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); ev.stopPropagation(); window.toggleBpPersona(h); sync(); } });
      h.addEventListener('click',function(){ setTimeout(sync,0); });
    }); sync();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
