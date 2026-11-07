/* ═══ MCFA PREFS (localStorage-backed) ═══ */
var MCFA = window.MCFA || {};
(function(){
  var KEY = 'mcfa_fx_prefs_v1';
  var systemReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var defaults = { animations: true, reduceMotion: systemReduced, sound: true, haptic: true, muteAll: false };
  function load(){
    try {
      var raw = localStorage.getItem(KEY);
      if(!raw) return Object.assign({}, defaults);
      var parsed = JSON.parse(raw);
      return Object.assign({}, defaults, parsed);
    } catch(e){ return Object.assign({}, defaults); }
  }
  function save(p){ try{ localStorage.setItem(KEY, JSON.stringify(p)); return true; }catch(e){ return false; } }

  var prefs = load();
  MCFA.prefs = prefs;
  MCFA.setPref = function(key, val){
    prefs[key] = val;
    var ok = save(prefs);
    MCFA.applyPrefsToDOM();
    if(!ok && typeof showNotif==='function') showNotif('Pengaturan belum tersimpan. Mungkin akan kembali setelah reload.');
  };
  MCFA.applyPrefsToDOM = function(){
    try{
      document.documentElement.classList.toggle('mcfa-reduce-motion', !!prefs.reduceMotion);
    }catch(e){}
  };

  /* ═══ FX: ripple, shake, tone (all no-ops if prefs say off) ═══ */
  var _ctx = null;
  function ensureCtx(){
    if(prefs.muteAll || !prefs.sound) return null;
    try{
      if(!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
      if(_ctx.state === 'suspended') _ctx.resume();
      return _ctx;
    }catch(e){ return null; }
  }
  /* Nada lembut namun jernih — pakai lowpass filter agar tidak pecah/menusuk,
     dan sedikit harmoni (dua oscillator) untuk kesan lebih "premium" */
  MCFA.playTone = function(name){
    var c = ensureCtx(); if(!c) return;
    try{
      var map = {
        click:    {f:480, to:400, d:0.09,  v:0.045, type:'sine',     lp:2600},
        success:  {f:600, to:880, d:0.30,  v:0.06,  type:'sine',     lp:3400, harmony:1.5},
        error:    {f:300, to:210, d:0.24,  v:0.05,  type:'triangle', lp:1600},
        notif:    {f:720, to:760, d:0.16,  v:0.045, type:'sine',     lp:3000},
        popup:    {f:340, to:640, d:0.26,  v:0.035, type:'sine',     lp:2400}
      };
      var t = map[name] || map.click;
      var t0 = c.currentTime;

      var filt = c.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(t.lp || 3000, t0);
      filt.Q.value = 0.7;

      var master = c.createGain();
      master.gain.setValueAtTime(0.0001, t0);
      master.gain.exponentialRampToValueAtTime(t.v, t0 + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, t0 + t.d);

      var osc = c.createOscillator();
      osc.type = t.type;
      osc.frequency.setValueAtTime(t.f, t0);
      osc.frequency.exponentialRampToValueAtTime(t.to, t0 + t.d);
      osc.connect(filt);

      filt.connect(master); master.connect(c.destination);
      osc.start(t0); osc.stop(t0 + t.d + 0.03);

      /* Lapisan harmoni tipis untuk nada "success" agar terasa lebih hangat/positif */
      if(t.harmony){
        var osc2 = c.createOscillator(), g2 = c.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(t.f * t.harmony, t0);
        osc2.frequency.exponentialRampToValueAtTime(t.to * t.harmony, t0 + t.d);
        g2.gain.setValueAtTime(0.0001, t0);
        g2.gain.exponentialRampToValueAtTime(t.v * 0.4, t0 + 0.03);
        g2.gain.exponentialRampToValueAtTime(0.0001, t0 + t.d);
        osc2.connect(g2); g2.connect(c.destination);
        osc2.start(t0); osc2.stop(t0 + t.d + 0.03);
      }
    }catch(e){}
  };

  MCFA.haptic = function(pattern){
    if(prefs.muteAll || !prefs.haptic) return;
    try{ if(navigator.vibrate) navigator.vibrate(pattern || 8); }catch(e){}
  };

  MCFA.ripple = function(el, evt){
    if(prefs.muteAll || !prefs.animations || prefs.reduceMotion) return;
    try{
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.2;
      var x = (evt && evt.clientX != null) ? evt.clientX - rect.left : rect.width/2;
      var y = (evt && evt.clientY != null) ? evt.clientY - rect.top : rect.height/2;
      var span = document.createElement('span');
      span.className = 'mcfa-ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (x - size/2) + 'px';
      span.style.top = (y - size/2) + 'px';
      var cs = window.getComputedStyle(el);
      if(cs.position === 'static') el.style.position = 'relative';
      if(cs.overflow !== 'hidden') el.style.overflow = el.style.overflow || 'visible';
      el.appendChild(span);
      setTimeout(function(){ if(span.parentNode) span.parentNode.removeChild(span); }, 600);
    }catch(e){}
  };

  MCFA.shake = function(el){
    if(prefs.muteAll || !prefs.animations || prefs.reduceMotion) { return; }
    try{
      el.classList.remove('mcfa-shake');
      void el.offsetWidth;
      el.classList.add('mcfa-shake');
      setTimeout(function(){ el.classList.remove('mcfa-shake'); }, 400);
    }catch(e){}
  };

  /* ═══ Delegated click feedback (P1: ripple + haptic + click sound) ═══
     Applies automatically to buttons and common interactive classes
     already in the file, without editing individual elements. */
  var SELECTOR = 'button, .ba-nav-btn, .oh-sound, .oh-close, .mcfa-settings-fab, [role="button"]:not(.ta-item):not(.ba-item):not(.g-check)';
  document.addEventListener('click', function(e){
    var el = e.target.closest ? e.target.closest(SELECTOR) : null;
    if(!el) return;
    if(el.classList.contains('ta-item') || el.classList.contains('ba-item') || el.classList.contains('g-check')) return;
    MCFA.ripple(el, e);
    MCFA.haptic(6);
  }, true);

  MCFA.applyPrefsToDOM();
})();

/* ═══ MCFA SETTINGS PANEL ═══ */
(function(){
  function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html!=null) e.innerHTML = html; return e; }

  function buildRow(label, prefKey){
    var row = el('div','mcfa-set-row');
    var span = el('span', null, label);
    var toggle = el('div', 'mcfa-toggle' + (MCFA.prefs[prefKey] ? ' on' : ''));
    toggle.setAttribute('role','switch');
    toggle.setAttribute('aria-checked', MCFA.prefs[prefKey] ? 'true':'false');
    toggle.setAttribute('aria-label', label);
    toggle.tabIndex = 0;
    function flip(){
      var val = !MCFA.prefs[prefKey];
      MCFA.setPref(prefKey, val);
      toggle.classList.toggle('on', val);
      toggle.setAttribute('aria-checked', val ? 'true':'false');
    }
    toggle.addEventListener('click', flip);
    toggle.addEventListener('keydown', function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); flip(); } });
    row.appendChild(span); row.appendChild(toggle);
    return row;
  }

  function buildPanel(){
    var overlay = el('div','mcfa-settings-panel');
    overlay.id = 'mcfa-settings-panel';
    var sheet = el('div','mcfa-settings-sheet');
    sheet.appendChild(el('h3', null, 'Animasi & Suara'));
    sheet.appendChild(buildRow('Animasi', 'animations'));
    sheet.appendChild(buildRow('Kurangi Gerakan (Reduce Motion)', 'reduceMotion'));
    sheet.appendChild(buildRow('Efek Suara', 'sound'));
    sheet.appendChild(buildRow('Getaran (Haptic)', 'haptic'));
    sheet.appendChild(buildRow('Bisukan Semua (Mute All)', 'muteAll'));
    var accDivider = el('div', null, '');
    accDivider.style.cssText = 'height:1px;background:var(--border2);margin:14px 0 10px;';
    sheet.appendChild(accDivider);
    var accBtn = el('button', 'mcfa-set-close', 'Akun & Backup Cloud');
    accBtn.style.cssText = 'background:var(--primary);color:#fff;border-radius:14px;font-weight:700;';
    accBtn.setAttribute('aria-label','Buka akun dan backup cloud');
    accBtn.addEventListener('click', function(){
      closePanel();
      setTimeout(function(){ if(window.mcfaOpenAccountPanel) window.mcfaOpenAccountPanel(); }, 200);
    });
    sheet.appendChild(accBtn);
    var closeBtn = el('button','mcfa-set-close','Tutup');
    closeBtn.setAttribute('aria-label','Tutup pengaturan animasi dan suara');
    function closePanel(){
      overlay.classList.remove('open');
      setTimeout(function(){ if(!overlay.classList.contains('open')) overlay.style.display='none'; }, 340);
    }
    closeBtn.addEventListener('click', closePanel);
    sheet.appendChild(closeBtn);
    overlay.appendChild(sheet);
    overlay.addEventListener('click', function(e){ if(e.target === overlay) closePanel(); });
    document.body.appendChild(overlay);
    overlay._mcfaClose = closePanel;
    return overlay;
  }

  function init(){
    try{
      var fab = document.createElement('div');
      fab.className = 'mcfa-settings-fab';
      fab.setAttribute('role','button');
      fab.setAttribute('tabindex','0');
      fab.setAttribute('aria-label','Buka pengaturan animasi dan suara');
      fab.innerHTML = goalIco('gear');
      var panel = null;
      function open(){
        if(!panel) panel = buildPanel();
        panel.style.display = 'flex';
        /* paksa reflow lalu tambahkan .open agar transisi fade+slide benar-benar berjalan */
        void panel.offsetWidth;
        requestAnimationFrame(function(){ panel.classList.add('open'); });
        if(window.MCFA && MCFA.playTone) MCFA.playTone('popup');
      }
      fab.addEventListener('click', open);
      fab.addEventListener('keydown', function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); open(); } });
      document.body.appendChild(fab);
    }catch(e){}
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
