/* ═══════════════════════════════════════════════════════════════════════
   KP.CIHUY — PROFIL, MEDIA INFORMASI & PROMOSI  (build 20261106.3 · Pembaruan 3)
   Menggantikan panel "Perkembangan Proyek" (checkbox + persentase tugas + penghitung
   kontribusi) khusus akun KP.CIHUY. Akun lain (CNE, Persona, Ayla) TIDAK diubah.

   Aturan isi:
   - Semua teks diambil dari data yang SUDAH ada di aplikasi (AKUN.kpc, kartu Karya &
     Dampak Sosial, kartu Jajan Anak-Anak, data konten "Sudah Upload").
   - Tidak ada angka anggota, statistik, atau pencapaian yang dikarang.
   - Informasi yang memang belum tersedia (sejarah, profil kampung, pertanian/perikanan,
     dll.) tampil "Belum ada data" dan bisa diisi sendiri lewat tombol Isi / Ubah.
     Catatan disimpan di localStorage 'mcfa_kpc_info_v1' (ikut backup JSON & cloud).
   - Data lama (mcfa_fokus_kpc, mcfa_kolab_kpc) tidak dihapus; hanya tidak ditampilkan.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var KEY = 'mcfa_kpc_info_v1', ID = 'kpc', MAXLEN = 1200;
  var COL = '#c44d18', BG = '#fef3ee';
  var openGroups = {g1:true, g2:false, g3:false};     /* grup yang terbuka (bertahan antar render) */
  var editing = null;                                  /* kunci kartu yang sedang diedit */

  function esc(s){
    if (typeof _escHtml === 'function') return _escHtml(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }
  function ico(n){ return typeof goalIco === 'function' ? goalIco(n) : ''; }
  function n10(v){ return (+v || 0).toLocaleString('id-ID'); }
  function D(){ return (typeof AKUN !== 'undefined' && AKUN[ID]) || {}; }

  /* ── penyimpanan catatan ── */
  function load(){
    try{ var o = JSON.parse(localStorage.getItem(KEY) || '{}'); if (o && typeof o === 'object' && o.notes && typeof o.notes === 'object') return o; }catch(e){}
    return {notes:{}, upd:{}};
  }
  function note(k){ var t = load().notes[k]; return (typeof t === 'string') ? t : ''; }
  function toast(m){ try{ if (typeof showNotif === 'function') showNotif(m); }catch(e){} }

  /* ── helper blok isi ── */
  function rows(list){
    list = list.filter(function(r){ return r && r[1] != null && String(r[1]).trim() !== ''; });
    if (!list.length) return '';
    return '<div class="kp-rows">' + list.map(function(r){
      return '<div class="kp-row"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>';
    }).join('') + '</div>';
  }
  function chips(list, cls){
    list = (list || []).filter(Boolean);
    if (!list.length) return '';
    return '<div class="kp-chips">' + list.map(function(n){ return '<span class="kp-chip' + (cls ? ' ' + cls : '') + '">' + esc(n) + '</span>'; }).join('') + '</div>';
  }
  function head(t){ return '<div class="kp-sub">' + esc(t) + '</div>'; }
  function points(list){
    list = (list || []).filter(Boolean);
    if (!list.length) return '';
    return '<ol class="kp-pts">' + list.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>';
  }
  function extraRows(title){                           /* ambil baris dari d.extra berdasarkan judul */
    var out = [];
    (D().extra || []).forEach(function(x){ if (x.t === title && x.rows) out = x.rows; });
    return out;
  }
  function squad(){
    var m = [], u = [], p = [];
    (D().extra || []).forEach(function(x){ (x.chips || []).forEach(function(c){
      if (/UTAMA/i.test(c.h)) u = c.v.slice(); else p = c.v.slice();
    }); });
    return {utama:u, pelengkap:p, total:u.length + p.length};
  }

  /* ── kartu catatan (isi sendiri) ── */
  function noteBlock(k, emptyMsg){
    var t = note(k), h = '';
    if (editing === k) {
      h += '<textarea class="kp-ta" id="kp-ta-' + k + '" maxlength="' + MAXLEN + '" rows="4" placeholder="Tulis informasi KP.CIHUY di sini…">' + esc(t) + '</textarea>' +
           '<div class="kp-act"><button type="button" class="kp-btn kp-pri" onclick="MCFA_KPC.save(\'' + k + '\')">Simpan</button>' +
           '<button type="button" class="kp-btn" onclick="MCFA_KPC.cancel()">Batal</button></div>';
      return h;
    }
    if (t) h += '<div class="kp-note"><small>CATATAN SENDIRI</small>' + esc(t).replace(/\n/g, '<br>') + '</div>';
    else if (emptyMsg) h += '<div class="kp-empty">' + ico('pencil') + '<span>' + esc(emptyMsg) + '</span></div>';
    h += '<div class="kp-act"><button type="button" class="kp-btn" onclick="MCFA_KPC.edit(\'' + k + '\')">' + (t ? 'Ubah catatan' : 'Isi informasi') + '</button></div>';
    return h;
  }

  /* ── 16 bagian informasi ── */
  function sections(){
    var d = D(), sq = squad(), S = {}, p = null, a = {followers:0, subs:0};
    try{ p = _postInfo(ID); }catch(e){}
    try{ a = _t1Load(ID); }catch(e){}
    var olah = extraRows('Olahraga'), edu = extraRows('Edukasi: Belajar Sambil Main');
    var eduMap = {}; edu.forEach(function(r){ eduMap[r[0]] = r[1]; });
    var platforms = ['YouTube', 'TikTok', 'Facebook', 'Instagram'];
    var start = (typeof formatDateUpper === 'function' && p) ? formatDateUpper(p.start) : '21 NOVEMBER 2026';

    S.identitas = {g:1, ic:'community', t:'Identitas KP.CIHUY', d:'Siapa dan apa KP.CIHUY',
      html: rows([['Nama', 'KP.CIHUY'], ['Kepanjangan', 'Kreatif Project Siruang United'], ['Peran', 'Identitas komunitas, media informasi, dokumentasi, dan promosi Kampung Siruang'],
                  ['Kategori akun', 'Kolaborasi — M.C.F.A STUDIO']]) +
            '<div class="kp-quote">' + esc(d.persona || '') + '</div>'};

    S.profil = {g:1, ic:'map', t:'Profil Kampung Siruang', d:'Gambaran kampung dan komunitasnya',
      html: rows([['Kampung', 'Kampung Siruang'], ['Komunitas anak', 'Siruang United'], ['Usia anak-anak', 'Rata-rata kelas 6–10'], ['Anggota squad', sq.total ? n10(sq.total) + ' nama terdaftar' : '']]) +
            noteBlock('profil', 'Lokasi, jumlah penduduk, dan data kampung lainnya belum dicatat.')};

    S.sejarah = {g:1, ic:'calendar', t:'Sejarah Singkat Komunitas', d:'Awal mula dan perjalanan komunitas',
      html: rows([['Mulai dicatat di STUDIO', 'DAY 1 — ' + start]]) +
            noteBlock('sejarah', 'Sejarah terbentuknya komunitas belum dicatat.')};

    S.visimisi = {g:1, ic:'flag', t:'Visi dan Misi', d:'Arah dan tujuan komunitas',
      html: head('VISI') + '<p class="kp-p">Memajukan anak-anak kampung: mewujudkan program pemberdayaan anak-anak kampung yang nyata dan berdampak jangka panjang bagi generasi muda di lingkungan sekitar.</p>' +
            head('MISI') + points(['Menjadi wadah anak-anak untuk bermain, belajar, dan berkarya bareng.', 'Belajar sambil bersenang-senang, tanpa merasa dituntut.', 'Memberi bekal yang berguna untuk masa depan mereka.']) +
            noteBlock('visimisi', '')};

    S.masyarakat = {g:1, ic:'users', t:'Identitas Masyarakat', d:'Karakter dan budaya masyarakat setempat',
      html: noteBlock('masyarakat', 'Informasi tentang masyarakat Kampung Siruang belum dicatat.')};

    S.anak = {g:2, ic:'heart', t:'Kehidupan Anak-Anak dan Pemuda', d:'Squad Siruang United',
      html: head('TOKOH UTAMA') + chips(sq.utama) + head('PELENGKAP') + chips(sq.pelengkap, 'kp-soft') +
            rows([['Usia', 'Rata-rata kelas 6–10'], ['Keseharian', 'Main, latihan, dan momen lucu anak-anak']])};

    S.olahraga = {g:2, ic:'trophy', t:'Olahraga dan Permainan', d:'Olahraga & permainan yang dijalankan',
      html: rows(olah.map(function(r){ return [r[0], r[1]]; }).concat([['Permainan', 'Termasuk tantangan & kuis yang terasa seperti permainan']]))};

    S.edukasi = {g:2, ic:'books', t:'Pendidikan dan Edukasi', d:'Belajar sambil main',
      html: rows(edu.map(function(r){ return [r[0], r[1]]; }))};

    S.sosial = {g:2, ic:'party', t:'Kegiatan Sosial dan Kebersamaan', d:'Nilai kebersamaan sehari-hari',
      html: rows([['Karakter & tim', eduMap['Karakter & tim'] || ''], ['Lingkungan', 'Bersih kampung'], ['Lomba antar anggota', 'Bola, bulutangkis, catur, dan lari'],
                  ['Jajan anak-anak', 'Dari pendapatan KP.CIHUY: 50% untuk anak-anak, 50% untuk MC Fathul Adzim']])};

    S.pekerjaan = {g:2, ic:'sprout', t:'Pertanian, Perikanan, dan Pekerjaan Masyarakat', d:'Mata pencaharian & aktivitas alam',
      html: rows([['Tanam', 'Bagian dari edukasi sains & lingkungan anak-anak']]) +
            noteBlock('pekerjaan', 'Informasi pertanian, perikanan, dan pekerjaan masyarakat belum dicatat.')};

    S.program = {g:2, ic:'rocket', t:'Kegiatan dan Program Komunitas', d:'Program yang dijalankan',
      html: points(d.strategi || []) + noteBlock('program', '')};

    S.dokumentasi = {g:3, ic:'camera', t:'Dokumentasi Aktivitas', d:'Konten yang sudah diunggah',
      html: (p ? (p.started
              ? rows([['Konten diupload', n10(p.since) + ' sejak DAY 1'], ['Tercatat di daftar', n10(p.total) + ' konten'], ['Hari aktif', n10(p.activeDays) + ' dari ' + n10(p.dayNo) + ' hari']])
              : rows([['Dokumentasi publik', 'Dimulai DAY 1 — ' + start], ['Hitung mundur', n10(p.toStart) + ' hari lagi']]))
            : '') +
            rows([['Hanya dihitung', 'Konten berstatus Sudah Upload'], ['Bentuk dokumentasi', 'Keseharian, pertandingan, film pendek & sinematik, profil anggota']])};

    S.media = {g:3, ic:'globe', t:'Media Sosial dan Platform Publikasi', d:'Tempat KP.CIHUY dipublikasikan',
      html: head('PLATFORM') + chips(platforms) +
            rows([['Followers (aktual)', n10(a.followers)], ['Subscribers (aktual)', n10(a.subs)]]) +
            '<div class="kp-hint">Angka aktual diisi di bagian Fokus Tahap. KP.CIHUY tidak memakai target.</div>' +
            noteBlock('media', 'Nama akun / tautan tiap platform belum dicatat.')};

    S.promosi = {g:3, ic:'speaker', t:'Strategi Promosi', d:'Cara memperkenalkan Kampung Siruang',
      html: points(d.strategi || [])};

    S.visual = {g:3, ic:'palette', t:'Identitas Visual dan Branding', d:'Logo, warna, dan gaya',
      html: '<div class="kp-brand"><span class="kp-logo av-ring" style="--c:' + COL + '"><img src="kpc.jpg" alt="Logo KP.CIHUY" loading="lazy" decoding="async"></span>' +
            '<div class="kp-sw"><i style="background:' + COL + '"></i><i style="background:' + BG + ';box-shadow:inset 0 0 0 1px #e2e8f0"></i><em>' + COL.toUpperCase() + ' · ' + BG.toUpperCase() + '</em></div></div>' +
            rows([['Lencana', d.badge || 'SIRUANG UNITED'], ['Gaya foto', 'Foto bulat dengan cincin warna akun']])};

    S.cne = {g:3, ic:'clapper', t:'Kolaborasi dengan CNE Pictures', d:'Film & sinematik bersama',
      html: rows([['CNE Pictures', 'Studio film independen (short film, web series)'], ['Bentuk kolaborasi', 'Film pendek & sinematik dengan anak-anak sebagai pemeran'], ['Sutradara', 'MC Fathul Adzim']]) +
            '<div class="kp-act"><button type="button" class="kp-btn" onclick="MCFA_KPC.openCne()">Buka akun CNE Pictures</button></div>' +
            noteBlock('cne', '')};
    return S;
  }

  var GROUPS = [
    {id:'g1', ic:'building',  t:'Identitas & Profil',      keys:['identitas','profil','sejarah','visimisi','masyarakat']},
    {id:'g2', ic:'users',     t:'Kehidupan & Kegiatan',    keys:['anak','olahraga','edukasi','sosial','pekerjaan','program']},
    {id:'g3', ic:'speaker',   t:'Media & Promosi',         keys:['dokumentasi','media','promosi','visual','cne']}
  ];

  function card(k, c){
    return '<div class="kp-card" data-k="' + k + '"><div class="kp-ch"><span class="kp-ci">' + ico(c.ic) + '</span>' +
      '<div><div class="kp-ct">' + esc(c.t) + '</div><div class="kp-cd">' + esc(c.d) + '</div></div></div><div class="kp-cb">' + c.html + '</div></div>';
  }

  function html(){
    var S = sections(), d = D(), sq = squad(), n = 0, h = '';
    h += '<div class="kp-hero"><span class="kp-logo av-ring kp-lg" style="--c:' + COL + '"><img src="kpc.jpg" alt="KP.CIHUY" decoding="async"></span>' +
         '<div class="kp-ht"><div class="kp-hk">PROFIL KOMUNITAS</div><div class="kp-hn">KP.CIHUY</div><div class="kp-hs">Kreatif Project Siruang United · Kampung Siruang</div></div></div>' +
         '<div class="kp-mini"><div><small>KATEGORI</small><b>Kolaborasi</b></div><div><small>PLATFORM</small><b>4</b></div><div><small>SQUAD</small><b>' + n10(sq.total) + '</b></div></div>';
    GROUPS.forEach(function(g){
      var open = !!openGroups[g.id];
      h += '<details class="kp-grp" data-g="' + g.id + '"' + (open ? ' open' : '') + '><summary><span class="kp-gi">' + ico(g.ic) + '</span><span class="kp-gt">' + esc(g.t) + '</span><span class="kp-gn">' + g.keys.length + ' bagian</span></summary><div class="kp-gb">' +
           g.keys.map(function(k){ n++; return S[k] ? card(k, S[k]) : ''; }).join('') + '</div></details>';
    });
    return h;
  }

  function slot(){ return document.getElementById('post-sys-' + ID); }
  function render(el){
    el = el || slot(); if (!el) return;
    try{ el.innerHTML = '<div class="kp">' + html() + '</div>'; }
    catch(e){ el.innerHTML = '<div class="kp"><div class="kp-empty"><span>Profil KP.CIHUY belum dapat ditampilkan.</span></div></div>'; console.warn('[KPC] render gagal', e); }
    Array.prototype.forEach.call(el.querySelectorAll('details.kp-grp'), function(dt){
      dt.addEventListener('toggle', function(){ openGroups[dt.getAttribute('data-g')] = dt.open; });
    });
  }

  window.MCFA_KPC = {
    render: render,
    slotHtml: function(){ return '<div class="am-section kp-sec"><div class="am-slabel">' + ico('community') + ' Profil & Media Informasi KP.CIHUY</div><div id="post-sys-' + ID + '"></div></div>'; },
    edit: function(k){ editing = k; render(); var t = document.getElementById('kp-ta-' + k); if (t) { try{ t.focus(); }catch(e){} } },
    cancel: function(){ editing = null; render(); },
    save: function(k){
      var t = document.getElementById('kp-ta-' + k), v = t ? String(t.value || '').trim().slice(0, MAXLEN) : '';
      var o = load(); o.notes = o.notes || {}; o.upd = o.upd || {};
      if (v) { o.notes[k] = v; o.upd[k] = new Date().toISOString(); } else { delete o.notes[k]; delete o.upd[k]; }
      try{ localStorage.setItem(KEY, JSON.stringify(o)); }
      catch(e){ toast('Catatan belum tersimpan (penyimpanan penuh).'); return; }
      editing = null; render(); toast('Catatan KP.CIHUY tersimpan.');
    },
    openCne: function(){ try{ openAkun('cne'); var b = document.getElementById('am-body'); if (b) b.scrollTop = 0; }catch(e){} },
    /* untuk pengujian */
    _sections: function(){ return sections(); }
  };

  document.addEventListener('mcfa:data', function(){ try{ if (!editing) render(); }catch(e){} });
})();
