/* SISTEM TAHAP 1/2/3 — satu state bersama untuk 5 modul (Aktivitas, Studio, Kehidupan, Karier, Keuangan).
   Tanggal dari MCFA_CORE; target dari prompt. Belum ada tahap dipilih = tidak ada angka/rincian yang tampil. */
(function(){
  'use strict';
  var C = MCFA_CORE, TG = {1:400000000, 2:500000000, 3:500000000} /* dibulatkan (sementara) dari total wishlist per tahap 396.803.816 / 450.000.000 / 425.000.000 (= Rp 1.271.803.816); kembalikan nilai itu bila ingin nominal asli */, TP = TG;  /* TG = nilai pencapaian (dasar progres) · TP = nominal tahap yang ditampilkan */
  var DEF = Object.freeze({
    1: Object.freeze({n:1, start:C.projectStart, end:C.stage1End,   konten:700,  yt:1000000,  tt:500000,  fase:Object.freeze([1,2,3]), uang:TG[1], tampil:TP[1]}),
    2: Object.freeze({n:2, start:C.stage2Start,  end:C.stage2End,   konten:800,  yt:1500000, tt:750000, fase:Object.freeze([4]),     uang:TG[2], tampil:TP[2]}),
    3: Object.freeze({n:3, start:C.stage3Start,  end:C.projectEnd,  konten:1000, yt:2000000, tt:1000000, fase:Object.freeze([5]),     uang:TG[3], tampil:TP[3]})
  });
  var PAGES = [
    {key:'aktivitas', root:'blueprintAktivitas', before:'.akt-hero-grid'},
    {key:'identitas', root:'page-identitas',     after:'#bp-fh-studio'},
    {key:'kehidupan', root:'page-kehidupan',     after:'.hero-card'},
    {key:'karir',     root:'page-karir',         after:'.kr-page-header'},
    {key:'keuangan',  root:'page-keuangan',      after:'.vision-head'}
  ];
  var sel = null, renderers = {}, listeners = [];

  /* TAHAP BERJALAN menurut tanggal Jakarta (BERBEDA dari tahap yang DIPILIH pengguna = get()). Satu-satunya implementasi:
     modul 12/27/32/36/37/38 memanggil MCFA_TAHAP.running(), bukan menulis ulang perulangan tanggal. Sebelum DAY 1 = 1; setelah projectEnd = 3. */
  function running(){
    var d; try{ d = mcfaNowJakarta(); }catch(e){ d = mcfaMidnight(); }
    for (var n = 1; n <= 3; n++){ if (d <= mcfaParse(DEF[n].end)) return n; }
    return 3;
  }
  function fmt(n){ return Number(n).toLocaleString('id-ID'); }
  function days(d){ return mcfaDaysInclusive(d.start, d.end); }

  function html(key){
    var cards = [1,2,3].map(function(n){
      return '<button type="button" class="tp-card" role="tab" aria-selected="false" data-tahap="'+n+'" aria-label="Tahap '+n+'">'+
             '<span class="tp-lbl">TAHAP</span><span class="tp-num">'+n+'</span></button>';
    }).join('');
    return '<section class="tp-wrap" data-tp-page="'+key+'" aria-label="Pilih tahap">'+
           '<div class="tp-row" role="tablist">'+cards+'</div>'+
           '<div class="tp-detail" data-tp-detail="'+key+'" hidden></div></section>';
  }

  function mount(){
    PAGES.forEach(function(pg){
      var root = document.getElementById(pg.root);
      if (!root || root.querySelector('.tp-wrap')) return;
      var tmp = document.createElement('div'); tmp.innerHTML = html(pg.key);
      var node = tmp.firstChild;
      var ref = pg.before ? root.querySelector(pg.before) : root.querySelector(pg.after);
      if (ref && pg.before) ref.parentNode.insertBefore(node, ref);
      else if (ref) ref.parentNode.insertBefore(node, ref.nextSibling);
      else root.insertBefore(node, root.firstChild);
    });
  }

  function paint(){
    PAGES.forEach(function(pg){
      var wrap = document.querySelector('.tp-wrap[data-tp-page="'+pg.key+'"]'); if (!wrap) return;
      wrap.querySelectorAll('.tp-card').forEach(function(b){ b.setAttribute('aria-selected', String(+b.getAttribute('data-tahap') === sel)); });
      var box = wrap.querySelector('.tp-detail');
      if (box._tpT){ clearTimeout(box._tpT); box._tpT = 0; }
      box.classList.remove('tp-out');
      if (sel === null){
        if (box.hidden) return;
        if (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches){ box.hidden = true; box.innerHTML = ''; return; }
        box.classList.add('tp-out');
        box._tpT = setTimeout(function(){ box.hidden = true; box.innerHTML = ''; box.classList.remove('tp-out'); box._tpT = 0; }, 220);
        return;
      }
      box.innerHTML = '';
      var d = DEF[sel];
      box.hidden = false;
      box.innerHTML = '<div class="tp-dhead">TAHAP '+sel+'</div><div class="tp-dsub">'+formatDateUpper(d.start)+' — '+formatDateUpper(d.end)+' · '+fmt(days(d))+' HARI</div><div class="tp-body" data-tp-body="'+pg.key+'"></div>';
      var fn = renderers[pg.key];
      if (fn){ try{ fn(sel, d, box.querySelector('.tp-body')); }catch(e){ console.warn('[TAHAP] '+pg.key, e); } }
    });
    listeners.forEach(function(fn){ try{ fn(sel); }catch(e){ console.warn('[TAHAP] listener', e); } });
  }

  function select(n){
    n = +n; if (!DEF[n] || n === sel) return;
    sel = n; paint();
  }

  /* progres keuangan kumulatif: Rp400 jt pertama = Tahap 1, berikutnya Rp500 jt = Tahap 2, lalu Rp500 jt = Tahap 3 */
  function floor(n){ var lo = 0; for (var i = 1; i < n; i++) lo += TG[i]; return lo; }   /* batas bawah kumulatif tahap n */
  function uang(saldo, n){
    var s = Math.max(0, +saldo || 0), lo = floor(n), T = TG[n];
    var isi = Math.min(T, Math.max(0, s - lo));
    return {terisi:isi, target:T, sisa:Math.max(0, T-isi), pct:Math.min(100, Math.round(isi/T*1000)/10)};
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.tp-card'); if (!b) return;
    if (+b.getAttribute('data-tahap') === sel){ sel = null; paint(); return; }   /* klik tahap yang sedang terbuka = tutup */
    select(b.getAttribute('data-tahap'));
    /* gulir agar pemilih tahap + rincian langsung terlihat (tanpa scroll manual) */
    var wrap = b.closest('.tp-wrap');
    if (wrap) requestAnimationFrame(function(){
      var top = wrap.getBoundingClientRect().top + (window.pageYOffset || 0) - 84;
      if (Math.abs(top - (window.pageYOffset || 0)) > 6) window.scrollTo({top: Math.max(0, top), behavior: 'smooth'});
    });
  });

  window.MCFA_TAHAP = Object.freeze({
    def: DEF,
    get: function(){ return sel; },
    running: running,
    set: select,
    uang: uang,
    floor: floor,
    register: function(key, fn){ renderers[key] = fn; if (sel !== null) paint(); },   // fn(n, def, el) — dipakai langkah berikutnya
    onChange: function(fn){ listeners.push(fn); }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
