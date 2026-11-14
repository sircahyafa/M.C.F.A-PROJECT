/* ═══════════════════════════════════════════════════════════════════════════
   KARIER — RIWAYAT PENCAPAIAN (Bagian 10)
   Mencatat KAPAN sebuah target Karier benar-benar tercapai (followers / subscribers / konten, per akun & per Tahap) dan menyimpannya
   di 'mcfa_career_ach_v1' agar tidak hilang saat aplikasi dimuat ulang atau angka dikoreksi.
   Prinsip:
   • Sumber kebenaran tetap MCFA_STUDIO (aktual & target). Buku ini hanya CATATAN WAKTU; tidak menghitung capaian sendiri.
   • Dicatat hanya bila aktual ≥ target (> 0). Tidak ada capaian yang dibuat-buat / diprediksi.
   • Append-only: bila angka kemudian dikoreksi ke bawah target, dicatat peristiwa "dikoreksi" — riwayat TIDAK dihapus, tetapi item
     tidak lagi ditampilkan sebagai tercapai. Tercapai lagi → peristiwa "tercapai" baru.
   • Data lama (sebelum buku ada) diisi lewat langkah migrasi (MCFA_MIGRATE) memakai waktu dari riwayat audiens / tanggal upload
     yang sudah tersimpan; bila waktu tak dapat ditentukan dicatat kosong ("waktu tidak tercatat"), bukan dikarang. */
(function(){
  'use strict';
  var KEY = 'mcfa_career_ach_v1', LBL = {followers:'Followers', subs:'Subscribers', konten:'Konten'}, METRICS = ['followers','subs','konten'];
  var timer = null;

  function S(){ return window.MCFA_STUDIO; }
  function esc(v){ return typeof _escHtml === 'function' ? _escHtml(v) : String(v); }
  function fnum(v){ return Number(v).toLocaleString('id-ID'); }
  function idKey(id,m,n){ return id + '|' + m + '|' + n; }

  function load(){
    var o = {v:1, items:{}};
    try{
      var raw = localStorage.getItem(KEY);
      if(raw){ var p = JSON.parse(raw); if(p && typeof p === 'object' && p.items && typeof p.items === 'object' && !Array.isArray(p.items)) o = p; }
    }catch(e){}
    return o;
  }
  function save(o){ try{ var s = JSON.stringify(o); localStorage.setItem(KEY, s); return localStorage.getItem(KEY) === s; }catch(e){ return false; } }
  function last(it){ return it.events && it.events.length ? it.events[it.events.length - 1] : null; }
  function isActive(it){ var e = last(it); return !!e && e.type === 'tercapai'; }

  /* semua kombinasi (akun, metrik, tahap) yang berlaku + aktual & target dari MCFA_STUDIO */
  function combos(){
    var out = [], St = S(); if(!St || typeof AKUN === 'undefined' || !window.MCFA_TAHAP) return out;
    Object.keys(AKUN).forEach(function(id){
      if(!St.hasTarget(id)) return;
      [1,2,3].forEach(function(n){
        METRICS.forEach(function(m){
          if(!St.applies(id,m,n)) return;
          var t = St.target(id,n,m), a = St.actual(id,n,m);
          if(t > 0) out.push({id:id, m:m, n:n, actual:a, target:t, reached:a >= t});
        });
      });
    });
    return out;
  }

  /* ── pemuatan ke buku: dipanggil saat data berubah ── */
  function evaluate(){
    var led = load(), changed = false, now = new Date().toISOString();
    combos().forEach(function(c){
      var k = idKey(c.id,c.m,c.n), it = led.items[k], act = !!it && isActive(it);
      if(c.reached && !act){
        it = led.items[k] = it || {id:c.id, m:c.m, n:c.n, events:[]};
        it.events.push({t:now, type:'tercapai', value:c.actual, target:c.target, src:'catatan'}); changed = true;
      } else if(!c.reached && act){
        it.events.push({t:now, type:'dikoreksi', value:c.actual, target:c.target, src:'catatan'}); changed = true;
      }
    });
    if(changed && !save(led)){ try{ console.warn('[KARIER] riwayat pencapaian gagal disimpan'); }catch(e){} }
    return changed;
  }

  /* ── waktu tercapai dari data lama (hanya untuk migrasi) ── */
  function histTime(id,m,target){
    var h = (S().load(id).hist || []).filter(function(e){ return e && e.t && e.c && e.c[m] && +e.c[m][1] >= target; });
    h.sort(function(a,b){ return String(a.t) < String(b.t) ? -1 : 1; });
    return h.length ? h[0].t : null;
  }
  function kontenTime(id,n,target){
    try{
      var d = MCFA_TAHAP.def[n], st = mcfaParse(d.start), en = mcfaParse(d.end), seen = {}, dates = [];
      _getKonten(id).forEach(function(k){
        if(!(k.status === 'upload' || k.done)) return;
        var dt = _postDate(k.doneDate); if(!dt || dt < st || dt > en) return;
        var key = (k.id != null ? k.id : k.title); if(seen[key]) return; seen[key] = 1; dates.push(dt);
      });
      dates.sort(function(a,b){ return a - b; });
      return dates.length >= target ? mcfaIso(dates[target - 1]) : null;
    }catch(e){ return null; }
  }
  function backfillMissing(){
    var led = load(), miss = [];
    combos().forEach(function(c){ if(c.reached && !led.items[idKey(c.id,c.m,c.n)]) miss.push(c); });
    return {led:led, miss:miss};
  }

  /* ── langkah migrasi: isi buku dari data lama (sekali; idempoten) ── */
  function registerMigration(){
    if(!window.MCFA_MIGRATE || !MCFA_MIGRATE.register) return;
    MCFA_MIGRATE.register({
      id:'pencapaian-karier-isi-dari-data-lama', touches:[/^mcfa_career_ach_v1$/], newKeys:[KEY],
      scan:function(){ try{ return backfillMissing().miss.length ? [KEY] : []; }catch(e){ return []; } },
      apply:function(){
        var b = backfillMissing(), n = 0;
        b.miss.forEach(function(c){
          var t = c.m === 'konten' ? kontenTime(c.id,c.n,c.target) : (histTime(c.id,c.m,c.target) || S().load(c.id).updated || null);
          b.led.items[idKey(c.id,c.m,c.n)] = {id:c.id, m:c.m, n:c.n, events:[{t:t, type:'tercapai', value:c.actual, target:c.target, src:'migrasi'}]}; n++;
        });
        return n ? (save(b.led) ? {changed:n} : {changed:0, error:'gagal menyimpan buku pencapaian'}) : {changed:0};
      }
    });
  }

  /* ── tampilan: kartu "Riwayat Pencapaian" di tab Platform ── */
  function when(e){
    if(!e || !e.t) return 'waktu tidak tercatat';
    try{ var w = formatStampUpper(e.t, !/T\d/.test(e.t)); return w || String(e.t); }catch(x){ return String(e.t); }
  }
  function render(){
    var host = document.getElementById('krTahap1Box'); if(!host || typeof AKUN === 'undefined') return;
    var box = document.getElementById('krAchBox');
    if(!box){ box = document.createElement('div'); box.id = 'krAchBox'; box.className = 'vision-grid'; box.style.marginTop = '12px'; host.parentNode.insertBefore(box, host.nextSibling); }
    var led = load(), items = Object.keys(led.items).map(function(k){ return led.items[k]; }).filter(function(it){ return it && it.events && it.events.length && AKUN[it.id]; });
    items.sort(function(a,b){ var ta = (last(a) || {}).t || '', tb = (last(b) || {}).t || ''; return ta < tb ? 1 : ta > tb ? -1 : 0; });
    var act = items.filter(isActive).length;
    function row(it){
      var e = last(it), ok = e.type === 'tercapai', mark = ok ? '✓ ' : '';
      return '<div class="vc-sub-item kr-live'+(ok ? ' kr-ok' : ' kr-ach-corr')+'"><div class="vc-sub-dot"></div><div class="vc-sub-name">'+esc(AKUN[it.id].name)+' · '+LBL[it.m]+' · Tahap '+it.n+
        '<div class="kr-lv-sub">'+(ok ? 'Tercapai ' : 'Dikoreksi (di bawah target) ')+esc(when(e))+(it.events[0] && it.events[0].src === 'migrasi' && it.events.length === 1 ? ' · dari data tersimpan' : '')+'</div></div>'+
        '<div class="vc-sub-badge">'+mark+fnum(e.value)+' / '+fnum(e.target)+'</div></div>';
    }
    var body;
    if(!items.length) body = '<div class="vc-sub-item"><div class="vc-sub-dot"></div><div class="vc-sub-name">Belum ada target yang tercapai. Pencapaian dicatat otomatis saat angka akun mencapai target.</div></div>';
    else body = items.slice(0,8).map(row).join('') + (items.length > 8 ? '<details class="t6-hist"><summary>Selengkapnya ('+(items.length - 8)+')</summary>'+items.slice(8).map(row).join('')+'</details>' : '');
    box.innerHTML = '<div class="vision-card reveal visible"><div class="vc-num">Karier · Riwayat</div>'+
      '<div class="vc-title"><svg class="mi" aria-hidden="true"><use href="#mi-trophy"/></svg> Riwayat Pencapaian</div>'+
      '<div class="vc-desc">'+act+' target tercapai · '+items.length+' tercatat. Hanya target yang angkanya benar-benar tercapai; tersimpan permanen di perangkat.</div>'+
      '<div class="vc-sub-list">'+body+'</div></div>';
  }

  function later(){ clearTimeout(timer); timer = setTimeout(function(){ try{ evaluate(); render(); }catch(e){ try{ console.warn('[KARIER] riwayat', e); }catch(x){} } }, 120); }
  window.MCFA_CAREER_ACH = {key:KEY, load:load, evaluate:evaluate, render:render, activeCount:function(){ var l = load(); return Object.keys(l.items).filter(function(k){ return isActive(l.items[k]); }).length; }};

  registerMigration();
  function init(){ try{ evaluate(); render(); }catch(e){} }
  /* DOMContentLoaded: pendaftar kita setelah MCFA_MIGRATE (yang terdaftar paling awal) → langkah migrasi sudah selesai sebelum evaluasi pertama */
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
  document.addEventListener('mcfa:data', later);
  window.addEventListener('storage', function(e){ if(!e.key || /^mcfa_(tahap1|konten)_/.test(e.key) || e.key === KEY || e.key === 'mcfa_akun_hub_v1') later(); });
})();
