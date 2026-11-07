// ═══ BLUEPRINT AKTIVITAS — GLOBAL FUNCTIONS ═══
// Semua fungsi di scope global agar onclick HTML bisa memanggil

function _baGetDateKey(offsetDays) {
  var d = mcfaNowJakarta();   /* AUDIT: kalender Asia/Jakarta, bukan zona waktu perangkat */
  if(offsetDays) d.setDate(d.getDate() + offsetDays);
  return 'ba_' + d.getFullYear() + '_' + (d.getMonth()+1) + '_' + d.getDate();
}
function _baDayNum(dateKey) {
  // Returns day number from Day 1 (MCFA_CORE.projectStart)
  var parts = dateKey.replace('ba_','').split('_');
  var d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
  var start = mcfaParse(MCFA_CORE.projectStart); // Day 1 = MCFA_CORE.projectStart
  var diff = mcfaDaysBetween(start, d) + 1;   /* AUDIT: selisih kalender, bebas geser DST */
  return Math.max(1, diff);
}

var _baCurrentKey = _baGetDateKey(0);
var _baViewingKey = _baCurrentKey; // which day we're viewing (clamped to DAY 1.096 on load — see _baClampedTodayKey)

var _baAudioCtx = null;
function baPlayUploadSound() {
  try {
    if(!_baAudioCtx) _baAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(_baAudioCtx.state === 'suspended') _baAudioCtx.resume();
    var ctx = _baAudioCtx;
    var notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      var t = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.start(t); osc.stop(t + 0.4);
    });
    var osc2 = ctx.createOscillator();
    var g2 = ctx.createGain();
    osc2.connect(g2); g2.connect(ctx.destination);
    osc2.type = 'triangle';
    osc2.frequency.value = 1567.98;
    var t2 = ctx.currentTime + 0.36;
    g2.gain.setValueAtTime(0, t2);
    g2.gain.linearRampToValueAtTime(0.18, t2 + 0.04);
    g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.5);
    osc2.start(t2); osc2.stop(t2 + 0.55);
  } catch(e) {}
}

function baShowUploadCelebration(el) {
  var rect = el.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;
  var colors = ['#fde68a','#1a56db','#4f46e5','#10b981','#f43f5e','#a855f7','#fb923c','#ffffff'];
  for (var i = 0; i < 18; i++) {
    (function(idx) {
      var p = document.createElement('div');
      var size = 5 + Math.random() * 7;
      var color = colors[Math.floor(Math.random() * colors.length)];
      var angle = Math.random() * 360;
      var dist = 50 + Math.random() * 80;
      var dx = Math.cos(angle * Math.PI / 180) * dist;
      var dy = Math.sin(angle * Math.PI / 180) * dist - 40;
      p.style.cssText = 'position:fixed;left:' + cx + 'px;top:' + cy + 'px;width:' + size + 'px;height:' + size + 'px;background:' + color + ';border-radius:' + (Math.random() > 0.5 ? '50%' : '3px') + ';pointer-events:none;z-index:9997;animation:temaConfetti 0.7s ease-out ' + (idx * 0.02) + 's both;--dx:' + dx + 'px;--dy:' + dy + 'px;';
      document.body.appendChild(p);
      var removeAt = 800 + idx * 20;
      setTimeout(function(){
        p.style.opacity = '0';
        p.style.transition = 'none';
        setTimeout(function(){ if(p.parentNode) p.parentNode.removeChild(p); }, 50);
      }, removeAt);
    })(i);
  }
  var msgs = ['Upload done! Mantap!', 'Konten live! Keep going!', 'Uploaded! Satu langkah maju!', 'Konten naik! Hajar lagi!', 'Done! Konsistensi = kemenangan!', 'Upload sukses! Terus gaspol!'];
  var msg = msgs[Math.floor(Math.random() * msgs.length)];
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(20px);background:linear-gradient(135deg,#1443b5,#4f46e5);color:#fff;padding:13px 26px;border-radius:99px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 8px 32px rgba(26,86,219,0.5),0 0 0 1.5px rgba(255,255,255,0.15);white-space:nowrap;opacity:0;transition:all 0.38s cubic-bezier(.34,1.56,.64,1);pointer-events:none;';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.style.opacity='1'; toast.style.transform='translateX(-50%) translateY(0)'; }, 10);
  setTimeout(function(){ toast.style.opacity='0'; toast.style.transform='translateX(-50%) translateY(-12px)'; }, 1900);
  setTimeout(function(){ if(toast.parentNode) toast.parentNode.removeChild(toast); }, 2400);
}

function baToggle(el) {
  // Sebelum DAY 1 checklist Project tidak boleh terisi.
  if (_baKeyToDate(_baViewingKey) < mcfaParse(MCFA_CORE.projectStart)) { showNotif('Aktivitas Sehari-hari dimulai pada DAY 1.'); return; }
  var wasDone = el.classList.contains('done');
  el.classList.toggle('done');
  if (!baSave()) {
    el.classList.toggle('done'); // rollback: kembalikan ke state semula
    showNotif('Gagal menyimpan. Coba lagi.');
    return;
  }
  baUpdate();
  if (!wasDone && el.classList.contains('ba-has-input')) {
    baPlayUploadSound();
    baShowUploadCelebration(el);
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'temaCheckBounce 0.5s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(function(){ el.style.animation = ''; }, 520);
  } else if (!wasDone) {
    // Regular check: pop bounce
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'baItemCheckPop 0.42s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(function(){ el.style.animation = ''; }, 450);
    // Mini burst on the checkbox icon
    var chk = el.querySelector('.am-konten-chk');
    if(chk){ taCbBurst(chk); }
    if(navigator.vibrate) navigator.vibrate([8,15,6]);
  } else {
    // Uncheck shake
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'baItemUncheckShake 0.3s ease';
    setTimeout(function(){ el.style.animation = ''; }, 320);
    if(navigator.vibrate) navigator.vibrate(10);
  }
}

function baSave() {
  var checks = {};
  document.querySelectorAll('#body-harian .ba-item:not(.ba-prod-item)').forEach(function(item, i){
    /* kunci stabil: tiap item membawa data-bk (item_N asli / wk_*), jadi menambah/memindah item TIDAK menggeser centang lama */
    checks[item.dataset.bk || ('item_'+i)] = item.classList.contains('done');
  });
  try {
    localStorage.setItem(_baViewingKey, JSON.stringify({checks: checks, date: _baViewingKey}));
    return true;
  } catch(e) {
    return false;
  }
}

function baResetAll() {
  var _isViewingToday = (_baViewingKey === _baGetDateKey(0));
  if(!confirm(_isViewingToday ? 'Reset semua checklist hari ini?' : 'Reset semua checklist untuk hari yang sedang dilihat ini?')) return;
  document.querySelectorAll('#body-harian .ba-item:not(.ba-prod-item)').forEach(function(item){ item.classList.remove('done'); });
  var removed = true;
  try { localStorage.removeItem(_baViewingKey); } catch(e){ removed = false; }
  if(!removed){
    showNotif('Reset belum tersimpan. Coba lagi.');
  }
  baUpdate();
}

function baApplyWorkout(key) {
  try {
    var body = document.getElementById('body-harian'); if(!body || !window.MCFA_WORKOUT) return;
    var bar = document.getElementById('wkBarBa'), first = document.getElementById('ba-blk-0');
    if(!bar && first && first.parentNode){ bar = document.createElement('div'); bar.id = 'wkBarBa'; bar.className = 'wk-wrap'; first.parentNode.insertBefore(bar, first); }
    if(bar) bar.innerHTML = MCFA_WORKOUT.bar(key);
    body.querySelectorAll('.ba-item:not(.ba-prod-item) .ba-label').forEach(function(el){
      if(!el.dataset.wkBase) el.dataset.wkBase = el.textContent.trim();
      var it = el.parentNode, blk = it.closest ? it.closest('.ba-block') : null;
      /* item olahraga bertanda data-wk (Angkat Beban / Running atau Strength Training / Latihan Kaki / Latihan Lengan) → nama dari MCFA_WORKOUT */
      var t = (it.dataset && it.dataset.wk) ? MCFA_WORKOUT.item(it.dataset.wk, key) : MCFA_WORKOUT.relabel(el.dataset.wkBase, key, blk ? blk.id : '');
      if(el.textContent !== t) el.textContent = t;
    });
  } catch(e){}
}
function baLoadDay(key) {
  _baViewingKey = key;
  baApplyWorkout(key);
  var saved = {};
  try {
    /* Sebelum DAY 1 (21 NOV 2026) tidak memuat centang lama — masa itu milik Program Adaptasi. Data lama TIDAK dihapus. */
    var _kp = key.replace('ba_','').split('_'), _kd = new Date(parseInt(_kp[0],10), parseInt(_kp[1],10)-1, parseInt(_kp[2],10));
    var raw = (_kd < mcfaParse(MCFA_CORE.projectStart)) ? null : localStorage.getItem(key);
    if(raw) { var p = JSON.parse(raw); saved = p.checks || {}; }
  } catch(e){}
  document.querySelectorAll('#body-harian .ba-item:not(.ba-prod-item)').forEach(function(item, i){
    item.classList.toggle('done', !!saved[item.dataset.bk || ('item_'+i)]);
  });
  baUpdate();
  // Update day nav UI
  _baRenderDayNav();
}

function baPrevDay() {
  var parts = _baViewingKey.replace('ba_','').split('_');
  var d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
  d.setDate(d.getDate() - 1);
  var start = mcfaParse(MCFA_CORE.projectStart);
  if(d < start) return; // can't go before Day 1
  var newKey = 'ba_' + d.getFullYear() + '_' + (d.getMonth()+1) + '_' + d.getDate();
  baLoadDay(newKey);
}

function baNextDay() {
  var parts = _baViewingKey.replace('ba_','').split('_');
  var d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
  d.setDate(d.getDate() + 1);
  // FIX: aktivitas day-counter period ends 20 NOVEMBER 2029 = DAY 1.096 (start is
  // dari MCFA_CORE: projectStart–projectEnd).
  // perfectPhaseStart (FASE SEMPURNA) adalah milestone — a separate screen,
  // NOT part of the 1.096-day counter. Navigating past 20 NOVEMBER must stop here
  // so the counter can never render "DAY 1.117 dari 1.096".
  var end = mcfaParse(MCFA_CORE.projectEnd);
  if(d > end) return; // can't go past DAY 1.096 (20 NOVEMBER 2029) — last day of aktivitas period
  var newKey = 'ba_' + d.getFullYear() + '_' + (d.getMonth()+1) + '_' + d.getDate();
  baLoadDay(newKey);
}

function baGoToday() {
  baLoadDay(_baClampedTodayKey());
}

// Returns today's ba_ key, clamped to the main-period boundary (20 NOVEMBER 2029
// = DAY 1.096). If the device clock is ever past the project end, this keeps
// the app pinned to the last valid day instead of rendering DAY 1.117+.
function _baClampedTodayKey() {
  var d = mcfaNowJakarta();
  var lastDay = mcfaParse(MCFA_CORE.projectEnd);
  if(d > lastDay) d = lastDay;
  return 'ba_' + d.getFullYear() + '_' + (d.getMonth()+1) + '_' + d.getDate();
}

function _baRenderDayNav() {
  var el = document.getElementById('ba-day-nav');
  if(!el) return;
  var parts = _baViewingKey.replace('ba_','').split('_');
  var d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
  var dayNum = _baDayNum(_baViewingKey);
  var isToday = (_baViewingKey === _baGetDateKey(0));
  var start = mcfaParse(MCFA_CORE.projectStart);
  var isPast = d < start;
  // Aktivitas day-counter period ends 20 NOVEMBER 2029 = DAY 1.096 (start is
  // dari MCFA_CORE: projectStart–projectEnd).
  var lastDay = mcfaParse(MCFA_CORE.projectEnd);
  var isLastDay = (d.getTime() === lastDay.getTime());

  el.innerHTML =
    '<div class="ba-daynav-inner">' +
      '<button class="ba-nav-btn" onclick="baPrevDay()" title="Hari sebelumnya">‹</button>' +
      '<div class="ba-daynav-center">' +
        '<div class="ba-daynav-day">' +
          (isToday ? '<span class="ba-today-badge">HARI INI</span> ' : '') +
          '<span class="ba-daynav-dayname">' + formatDayUpper(d) + '</span>' +
          ', ' + formatDateUpper(d) +
        '</div>' +
        '<div class="ba-daynav-num">' + (isPast ? 'BELUM DIMULAI &nbsp;·&nbsp; MULAI ' + formatDateUpper(MCFA_CORE.projectStart) : ('DAY ' + dayNum.toLocaleString('id-ID') + ' dari ' + MCFA_DERIVED.projectTotalDays.toLocaleString('id-ID'))) + (isLastDay ? ' &nbsp;·&nbsp; <span class="ba-lastday-badge">LAST DAY</span>' : '') + (isToday ? '' : ' &nbsp;·&nbsp; <button class="ba-gotd-btn" onclick="baGoToday()">→ Hari ini</button>') + '</div>' +
      '</div>' +
      '<button class="ba-nav-btn"' + (isLastDay ? ' disabled title="Hari terakhir periode utama (Day ' + MCFA_DERIVED.projectTotalDays.toLocaleString('id-ID') + ')"' : ' onclick="baNextDay()" title="Hari berikutnya"') + '>›</button>' +
    '</div>';
}

function baUpdate() {
  // SSOT sync: re-render Produksi Konten blocks from Jadwal & Upload Konten data
  // sebelum menghitung progres, supaya status selalu real-time & konsisten.
  if (typeof renderProduksiBlocks === 'function') renderProduksiBlocks();

  var allItems = document.querySelectorAll('#body-harian .ba-item');
  var total = allItems.length, done = 0;
  allItems.forEach(function(item){ if(item.classList.contains('done')) done++; });

  
  var pct = total > 0 ? Math.round(done/total*100) : 0;
  var fill = document.getElementById('ba-fill');
  var pctEl = document.getElementById('ba-pct');
  var doneEl = document.getElementById('ba-done');
  var totalEl = document.getElementById('ba-total');
  if(fill) fill.style.width = pct + '%';
  if(pctEl) pctEl.textContent = pct + '%';
  if(doneEl) doneEl.textContent = done;
  if(totalEl) totalEl.textContent = total;

  // Qhodo counter
  var qItems = document.querySelectorAll('#body-harian .ba-item.ba-qhodo');
  var qTotal = qItems.length, qDone = 0;
  qItems.forEach(function(item){ if(item.classList.contains('done')) qDone++; });
  var qPct = qTotal > 0 ? Math.round(qDone/qTotal*100) : 0;
  var qFill = document.getElementById('ba-qhodo-fill');
  var qPctEl = document.getElementById('ba-qhodo-pct');
  var qDoneEl = document.getElementById('ba-qhodo-done');
  var qTotalEl = document.getElementById('ba-qhodo-total');
  var qRemainEl = document.getElementById('ba-qhodo-remain');
  if(qFill) qFill.style.width = qPct + '%';
  if(qPctEl) qPctEl.textContent = qPct + '%';
  if(qDoneEl) qDoneEl.textContent = qDone;
  if(qTotalEl) qTotalEl.textContent = qTotal;
  if(qRemainEl) {
    var today = mcfaNowJakarta();
    var start = mcfaParse(MCFA_CORE.projectStart); start.setHours(0,0,0,0);
    // Qhodo (daily checklist) period ends 20 NOVEMBER 2029 = DAY 1.096, same as
    // the day-counter/baNextDay boundary. 21 NOVEMBER 2029 is the FASE SEMPURNA
    // Sempurna milestone, not a checklist day.
    var end = mcfaParse(MCFA_CORE.projectEnd); end.setHours(0,0,0,0);
    var dayElapsed = Math.max(0, Math.floor((today - start)/(1000*60*60*24)));
    var _tLeft = today < start ? start : today; // sebelum DAY 1 sisa hari = total penuh (MCFA_DERIVED.projectTotalDays)
    var daysLeft = Math.max(0, Math.floor((end - _tLeft)/(1000*60*60*24)) + 1);
    var totalQhodoLeft = Math.max(0, (daysLeft * qTotal) - qDone);
    qRemainEl.textContent = totalQhodoLeft.toLocaleString('id-ID') + ' qhodo (' + daysLeft + ' hari tersisa)';
  }

  // Block counters
  var container = document.getElementById('body-harian');
  var blocks = container ? container.querySelectorAll('.ba-block') : [];
  var cntIds = ['cnt-pagi','cnt-prod-pagi','cnt-siang','cnt-prod-siang','cnt-sore','cnt-boxing','cnt-prod-sore','cnt-malam','cnt-prod-malam','cnt-tidur'];
  blocks.forEach(function(block, idx){
    var cntEl = document.getElementById(cntIds[idx]);
    if(!cntEl) return;
    var bItems = block.querySelectorAll('.ba-item');
    var bDone = 0;
    bItems.forEach(function(it){ if(it.classList.contains('done')) bDone++; });
    cntEl.textContent = bDone + '/' + bItems.length;
  });

  // Bug fix: hero header (ba-hero-done/total/pct) was only refreshed by
  // the unrelated Keuangan updateAll() on page load, so it never moved
  // when checklist items were toggled. Sync it here directly.
  if (typeof syncHeroProgress === 'function') syncHeroProgress();

  // Update day history dots
  _baRenderHistory();
}

function _baRenderHistory() {
  var el = document.getElementById('ba-history');
  if(!el) return;
  var html = '';
  var today = mcfaNowJakarta();
  var start = mcfaParse(MCFA_CORE.projectStart); // AKTIVITAS SEHARI-HARI start = Day 1 (MCFA_CORE.projectStart; Tugas Awal berlangsung sebelum DAY 1). Must match _baDayNum's start so dates before Day 1 are never shown/counted here.
  for(var i = 6; i >= 0; i--) {
    var d = new Date(today); d.setDate(d.getDate() - i);
    if(d < start) continue;
    var key = 'ba_' + d.getFullYear() + '_' + (d.getMonth()+1) + '_' + d.getDate();
    var dayNum = _baDayNum(key);
    var pct = 0;
    try {
      var raw = localStorage.getItem(key);
      if(raw) {
        var p = JSON.parse(raw);
        var checks = p.checks || {};
        var total = Object.keys(checks).length;
        var done = Object.values(checks).filter(Boolean).length;
        if(total > 0) pct = Math.round(done/total*100);
      }
    } catch(e){}
    var isViewing = (key === _baViewingKey);
    var isToday = (key === _baGetDateKey(0));
    var color = pct === 0 ? '#e2e8f0' : pct < 50 ? '#fde68a' : pct < 100 ? '#6ee7b7' : '#10b981';
    html += '<div class="ba-hist-dot' + (isViewing ? ' viewing' : '') + (isToday ? ' today' : '') + '" ' +
      'onclick="baLoadDay(\'' + key + '\')" title="Day ' + dayNum + ': ' + pct + '% selesai" ' +
      'style="background:' + color + '">' +
      '<span class="ba-hist-num">' + dayNum + '</span>' +
      '</div>';
  }
  el.innerHTML = html || '<div style="font-size:11px;color:#94a3b8;padding:8px">Baru dimulai hari ini</div>';
}

/* AUDIT: pergantian hari saat aplikasi tetap terbuka. Dulu kunci hari dihitung sekali saat dimuat, sehingga centang setelah tengah malam
   tersimpan ke HARI KEMARIN. Sekarang kunci hari diperbarui otomatis. */
var _baRollKey = null;
function baRollover(){
  var nk = _baClampedTodayKey();
  if(_baRollKey === null){ _baRollKey = nk; return false; }
  if(nk === _baRollKey) return false;
  var wasToday = (_baViewingKey === _baRollKey);
  _baRollKey = nk; _baCurrentKey = nk;
  if(wasToday) baLoadDay(nk); else _baRenderDayNav();
  try{ _baRenderHistory(); }catch(e){}
  return true;
}
baRollover();

// Init on DOM ready
document.addEventListener('DOMContentLoaded', function(){
  _baRenderDayNav();
  baLoadDay(_baClampedTodayKey());
  _baRenderHistory();
});
// Fallback if DOMContentLoaded already fired
if(document.readyState === 'complete' || document.readyState === 'interactive'){
  setTimeout(function(){
    _baRenderDayNav();
    baLoadDay(_baClampedTodayKey());
    _baRenderHistory();
  }, 0);
}
