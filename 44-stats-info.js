/* ═══════════════════════════════════════════════════════════════════════
   M.C.F.A STUDIO — STATS & INFO per akun  (build 20261106.2 · Pembaruan 2)
   Satu sumber untuk kartu "Stats & Info" di modal akun dan profil Sheina.
   - Isi kartu diambil dari data akun yang SUDAH ADA (AKUN / PERSON / MCFA_STUDIO);
     tidak ada angka, pencapaian, atau statistik yang dikarang.
   - Data yang memang belum ada ditampilkan "Belum ditetapkan" (bukan kartu kosong).
   - Kartu "Perkembangan" dibaca langsung dari _postInfo (konten berstatus Sudah Upload).
   - Grid dua kolom; jika jumlah kartu ganjil, kartu terakhir melebar penuh (tanpa ruang kosong).
   Dipanggil dari openAkun() dan openPerson() di js/12; bila berkas ini gagal dimuat,
   js/12 memakai tampilan lama (fallback).
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  function esc(s){
    if (typeof _escHtml === 'function') return _escHtml(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }
  function ico(n){ return typeof goalIco === 'function' ? goalIco(n) : ''; }
  function n10(v){ return (+v || 0).toLocaleString('id-ID'); }

  /* ── 1. Kartu bawaan (d.stats) — diberi judul, ikon, dan keterangan singkat ── */
  var STAT_MAP = {
    'Persona':                  {i:'user',    t:'Peran Akun',        s:'Posisi akun dalam ekosistem M.C.F.A STUDIO'},
    'Posting':                  {i:'calendar',t:'Frekuensi Posting', s:'Target unggahan per hari sejak DAY 1'},
    'Platform':                 {i:'globe',   t:'Platform Publikasi',s:'YouTube · TikTok · Facebook · Instagram'},
    'Kalangan':                 {i:'users',   t:'Target Audiens',    s:'Cakupan penonton yang dituju akun ini'},
    'Program Utama':            {i:'dumbbell',t:'Program Utama',     s:'Bulking & cutting bertahap'},
    'Rentang Global Day':       {i:'calendar',t:'Rentang Program',   s:'21 NOV 2026 sampai 20 NOV 2027'},
    'Target Berat Awal → Akhir':{i:'target',  t:'Target Berat Badan',s:'Dari berat awal ke berat akhir program'},
    'Orang Tim':                {i:'users',   t:'Tim Produksi',      s:null},
    'Target Film':              {i:'clapper', t:'Target Film',       s:'Debut resmi: short film horor/thriller'},
    'Goal Submit':              {i:'trophy',  t:'Goal Festival',     s:'Submit ke festival film indie nasional & internasional'},
    'Web Series':               {i:'laptop',  t:'Web Series',        s:'Produksi web series CNE Pictures'}
  };
  function statCard(id, t){
    var lbl = String(t.lbl || '');
    if (/^Fokus Akun$/i.test(lbl)) return null;             /* kartu pengganti lama; sudah tercakup kartu informasi di bawah */
    var m, c = {i:'star', t:lbl, v:t.num, s:'', col:t.color};
    if (/^Target\s+(Subs|Follow)/i.test(lbl)) {               /* hasil _tgtStat: "Target Subs · T2" / "Target Follow · T1" */
      m = lbl.match(/T(\d)$/);
      c.i = 'target'; c.t = /Follow/i.test(lbl) ? 'Target Followers' : 'Target Subscribers';
      c.s = m ? 'Target resmi Tahap ' + m[1] + ' untuk akun ini' : 'Target akun ini';
      return c;
    }
    var def = STAT_MAP[lbl];
    if (def) { c.i = def.i; c.t = def.t; c.s = def.s; }
    if (lbl === 'Orang Tim') {
      c.s = ''; try{ c.s = _kolabParties(id).join(' · '); }catch(e){}
    }
    if (lbl === 'Platform' && !String(t.num).trim()) c.v = 'Belum ditetapkan';
    if (lbl === 'Kalangan' && /^semua$/i.test(String(t.num).trim())) c.v = 'Semua kalangan';
    if (lbl === 'Goal Submit') c.v = 'Submit festival';
    return c;
  }

  /* ── 2. Kartu informasi per akun (ditulis dari teks yang sudah ada di data akun) ── */
  var NA = 'Belum ditetapkan';
  var INFO = {
    mcfa: [
      {i:'user',    t:'Identitas Pribadi',  v:'MC Fathul Adzim',           s:'Sosok utama — dark, intens, berwibawa. Arsitek dari semua cerita'},
      {i:'star',    t:'Personal Branding',  v:'Bad boy berwibawa',         s:'Aura intens dan misterius sebagai ciri khas persona utama'},
      {i:'rocket',  t:'Fokus Karier',       v:'Kreator multi-peran',       s:'Influencer · Model · Sutradara · MC/Host · Aktor'},
      {i:'mic',     t:'Keahlian & Profesi', v:'Creative Director',         s:'Sutradara, aktor, MC/host, dan model dalam satu persona'},
      {i:'map',     t:'Niche & Positioning',v:'Karier & dunia kreatif',    s:'Behind the scenes M.C.F.A STUDIO, modeling, dan perjalanan hidup'},
      {i:'users',   t:'Target Audiens',     v:NA,                          s:'Profil audiens persona utama belum dicatat di data akun'},
      {i:'thought', t:'Strategi Konten',    v:'5 Strategi',                s:'Personal branding, behind the scenes, model, cerita inspiratif, kolaborasi'},
      {i:'flag',    t:'Arah Perkembangan',  v:'Nama besar sebelum usia 25',s:'Membangun personal brand yang konsisten lintas platform'}
    ],
    fathulmeme: [
      {i:'user',    t:'Identitas Pribadi',  v:'Fathul Al-Meme',            s:'Sisi asli yang ceria, hangat, dan merangkul semua orang'},
      {i:'heart',   t:'Personal Branding',  v:'Hangat & relatable',        s:'Berbeda 180° dari MC Fathul Adzim — tanpa filter karier'},
      {i:'masks',   t:'Fokus Konten',       v:'Humor & keseharian',        s:'Meme, daily vlog, edukasi ringan, dan komunitas'},
      {i:'brain',   t:'Keahlian',           v:'Berbagi ilmu ringan',       s:'Pintar tanpa merendahkan; ilmu dibagi dengan bahagia'},
      {i:'map',     t:'Niche & Positioning',v:'Persona kedua',             s:'Akun kedua yang menampilkan sisi keseharian paling jujur'},
      {i:'users',   t:'Target Audiens',     v:'Semua kalangan',            s:'Komunitas yang hangat dan merangkul semua kalangan'},
      {i:'thought', t:'Strategi Konten',    v:'5 Strategi',                s:'Meme & humor, keseharian asli, sharing ilmu, komunitas, parodi bermakna'},
      {i:'flag',    t:'Arah Perkembangan',  v:'Humor yang bermakna',       s:'Parodi dan komedi yang tetap berisi, dengan komunitas sebagai pusat'}
    ],
    barongsukma: [
      {i:'tag',     t:'Identitas Merek',    v:'Fitness & Bulking',         s:'Fitness · Bulking · Running · Boxing'},
      {i:'flag',    t:'Tujuan Branding',    v:'Inspirasi untuk berubah',   s:'Inspirator bagi orang kurus yang mau berubah lewat perjalanan yang jujur'},
      {i:'map',     t:'Positioning',        v:'Tengil tapi menjual',       s:'Omongan memancing emosi netizen — itu yang membuatnya viral'},
      {i:'fire',    t:'Karakter Konten',    v:'Jujur tanpa filter',        s:'Latihan, running, boxing, calisthenics, dan perkembangan fisik'},
      {i:'thought', t:'Strategi & Promosi', v:'6 Strategi',                s:'Konten milestone tiap fase, tutorial workout minim alat, review suplemen'}
    ],
    okk: [
      {i:'tag',     t:'Identitas Merek',    v:'Edukasi Anak',              s:'Psikologi anak, parenting, dan edukasi'},
      {i:'flag',    t:'Tujuan Branding',    v:'Tumbuh kembang anak',       s:'Membangun kreativitas, mental, dan emosional anak-anak sekitar'},
      {i:'map',     t:'Positioning',        v:'Seperti guru TK',           s:'Dekat dengan anak-anak; fokus psikologi (Alley\'s lebih ke praktik kreatif)'},
      {i:'fire',    t:'Karakter Konten',    v:'Seru & edukatif',           s:'Kegiatan seru, fakta unik, dan keseharian anak'},
      {i:'thought', t:'Strategi & Promosi', v:'5 Strategi',                s:'Fakta unik dunia anak, DIY edukatif di rumah, psikologi anak yang ringan'}
    ],
    zona: [
      {i:'tag',     t:'Identitas Merek',    v:'Horor & Misteri',           s:'Horor, misteri, konspirasi, dan spekulasi'},
      {i:'flag',    t:'Tujuan Branding',    v:'Penonton terbawa cerita',   s:'Storytelling yang membuat penonton seakan ada dalam kejadian'},
      {i:'map',     t:'Positioning',        v:'Misteri sinematik',         s:'Narasi sinematik dan sound design profesional'},
      {i:'fire',    t:'Karakter Konten',    v:'Storyteller ulung',         s:'Kasus kriminal, konspirasi, dan fakta misterius yang jarang dibahas'},
      {i:'thought', t:'Strategi & Promosi', v:'5 Strategi',                s:'Video misteri sinematik, kasus Indonesia, series investigasi menuju podcast'}
    ],
    alley: [
      {i:'tag',     t:'Identitas Merek',    v:'Kreativitas Anak',          s:'DIY, kerajinan, lagu anak, dan jalan-jalan'},
      {i:'flag',    t:'Tujuan Branding',    v:'Anak berkarya',             s:'Membuktikan imajinasi tak berbatas lewat praktik langsung'},
      {i:'map',     t:'Positioning',        v:'Aksi kreatif',              s:'Berbeda dari Otak Kepala Kardus (psikologi) — lebih ke praktik'},
      {i:'fire',    t:'Karakter Konten',    v:'Praktik & menyenangkan',    s:'Kerajinan barang bekas, lagu anak orisinal, eksplorasi alam'},
      {i:'thought', t:'Strategi & Promosi', v:'5 Strategi',                s:'Tutorial barang bekas, lagu anak, jalan-jalan, DIY bersama orang tua'}
    ],
    lol: [
      {i:'tag',     t:'Identitas Merek',    v:'Marketing & Comedy',        s:'Review produk, affiliate, dan jualan'},
      {i:'flag',    t:'Tujuan Branding',    v:'Penjualan & affiliate',     s:'Fokus pada penjualan barang dan affiliate marketing'},
      {i:'map',     t:'Positioning',        v:'Jualan tanpa terasa jualan',s:'Skill marketing di atas rata-rata, dikemas dengan komedi'},
      {i:'fire',    t:'Karakter Konten',    v:'Marah-marah yang lucu',     s:'Asal bunyi, yapping, tetap menghibur'},
      {i:'thought', t:'Strategi & Promosi', v:'5 Strategi',                s:'Review komedi, affiliate natural, flash sale absurd, kolaborasi brand lokal'}
    ],
    monkipedia: [
      {i:'tag',     t:'Identitas Merek',    v:'Claymation',                s:'Animasi tanah liat: fakta unik, sejarah, cerita pendek'},
      {i:'flag',    t:'Tujuan Branding',    v:'Bercerita lewat clay',      s:'Wadah membagikan fakta unik, sejarah, apa pun'},
      {i:'map',     t:'Positioning',        v:'Karya tangan murni',        s:'Sculpting, animating, hingga editing dikerjakan sendiri'},
      {i:'fire',    t:'Karakter Konten',    v:'Stop-motion menggemaskan',  s:'Karakter clay original dengan format animasi yang ringan'},
      {i:'thought', t:'Strategi & Promosi', v:'5 Strategi',                s:'Fakta unik, short film animasi, behind the scenes, kolaborasi brand'}
    ],
    kpc: [
      {i:'community',t:'Identitas Kolaborator',v:'Siruang United',         s:'Squad anak-anak, rata-rata kelas 6–10'},
      {i:'tag',     t:'Nama Proyek',        v:'Kreatif Project',           s:'KP.CIHUY = Kreatif Project Siruang United'},
      {i:'users',   t:'Squad Terdaftar',    v:'10 Nama',                   s:'5 tokoh utama · 5 pelengkap, sesuai daftar di profil akun'},
      {i:'camera',  t:'Jenis Produksi',     v:'Keseharian, edukasi, film', s:'Permainan, film & sinematik, dan olahraga'},
      {i:'thought', t:'Strategi Publikasi', v:'5 Strategi',                s:'Keseharian, kuis edukasi, pertandingan, film pendek, profil anggota'}
    ],
    cne: [
      {i:'clapper', t:'Nama Proyek',        v:'CNE Pictures',              s:'Studio film independen'},
      {i:'globe',   t:'Platform Publikasi', v:NA,                          s:'Platform CNE Pictures belum dicatat di data akun'},
      {i:'mic',     t:'Pembagian Peran',    v:'Sutradara: MC Fathul Adzim',s:'Peran Nizam dan Rezki belum dicatat'},
      {i:'camera',  t:'Jenis Produksi',     v:'Short film & web series',   s:'Film indie dan karya sinematik layak festival'},
      {i:'thought', t:'Strategi Publikasi', v:'5 Strategi',                s:'Festival nasional & internasional, behind the scenes, kolaborasi sineas lokal'}
    ],
    ayla: [
      {i:'flower',  t:'Profil Dunia Ayla',  v:'Wadah karya Ayla',          s:'Dibuat kakak untuk adiknya berkarya — bukan akun pribadi'},
      {i:'users',   t:'Pengelolaan Akun',   v:'Kakak & Sheina',            s:'MC Fathul Adzim sebagai creative director, Sheina sebagai manager'},
      {i:'star',    t:'Fokus Aktivitas',    v:'4 Pilar',                   s:'Keseharian · Edukasi · Permainan · Olahraga'},
      {i:'heart',   t:'Keseharian',         v:'Tanpa skrip',               s:'Momen natural dan genuine'},
      {i:'books',   t:'Edukasi & Permainan',v:'Ringan & menyenangkan',     s:'Belajar hal baru, game dan tantangan bersama kakak'},
      {i:'trophy',  t:'Olahraga',           v:'Bulutangkis · Catur · Lari',s:'Latihan dan progres Ayla'},
      {i:'thought', t:'Strategi Pengelolaan',v:'5 Strategi',               s:'Natural, edukasi ringan, tantangan seru, progres olahraga, milestone tumbuh kembang'}
    ]
  };

  var PROG_TITLE = {solo:'Perkembangan Merek', persona:'Aktivitas Akun', kolab:'Perkembangan Kolaborasi', adik:'Perkembangan Proyek'};

  /* ── 3. Kartu dinamis: perkembangan akun (dibaca dari catatan konten "Sudah Upload") ── */
  function progressCard(id, kind, col){
    var c = {i:'chart', t:PROG_TITLE[kind] || 'Perkembangan', col:col};
    try{
      var p = _postInfo(id);
      if (p.started) {
        c.v = 'DAY ' + n10(p.dayNo);
        c.s = n10(p.since) + ' konten diupload sejak DAY 1 · ' + n10(p.activeDays) + ' hari aktif';
      } else {
        c.v = 'Belum dimulai';
        c.s = 'DAY 1 pada ' + (typeof formatDateUpper === 'function' ? formatDateUpper(p.start) : '21 NOVEMBER 2026') + ' · ' + n10(p.toStart) + ' hari lagi';
      }
    }catch(e){ c.v = 'Belum tersedia'; c.s = 'Data aktivitas akun belum dapat dibaca'; }
    return c;
  }
  function visualCard(col){
    return {i:'palette', t:'Identitas Visual', v:'Warna merek ' + col.toUpperCase(), s:'Foto bulat dengan cincin warna akun', col:col, sw:true};
  }

  /* ── 4. Render ── */
  function cardHtml(c, wide){
    var col = c.col || '#1a4fb0';
    return '<div class="am-stat si-card'+(wide ? ' si-wide' : '')+'" style="--si:'+col+'">' +
      '<span class="si-ic" aria-hidden="true">'+ico(c.i)+'</span>' +
      '<div class="si-tx">' +
        '<div class="si-t">'+esc(c.t)+'</div>' +
        '<div class="si-v" style="color:'+col+'">'+(c.sw ? '<i class="si-sw" style="background:'+col+'"></i>' : '')+esc(c.v)+'</div>' +
        (c.s ? '<div class="si-s">'+esc(c.s)+'</div>' : '') +
      '</div></div>';
  }
  function render(list){
    return list.map(function(c, ix){ return cardHtml(c, list.length % 2 === 1 && ix === list.length - 1); }).join('');
  }

  /* modal akun: stats bawaan (disaring sesuai aturan target) + info akun + perkembangan */
  window._statsInfoHtml = function(id){
    var d = AKUN[id]; if (!d) return '';
    var kind = _akunKind(id), col = d.color || '#1a4fb0', list = [];
    var hasT = MCFA_STUDIO.hasTarget(id);
    _akunStats(id).filter(function(t){ return hasT || !/^Target\s+(Subs|Followers|Pengikut|Subscriber)/i.test(t.lbl); }).forEach(function(t){
      var c = statCard(id, _tgtStat(id, t)); if (c) list.push(c);
    });
    (INFO[id] || []).forEach(function(c){ var x = {}; for (var k in c) x[k] = c[k]; x.col = col; list.push(x); });
    if (kind === 'solo') list.push(visualCard(col));
    list.push(progressCard(id, kind, col));
    return render(list);
  };

  /* profil Sheina (PERSON) — dari data PERSON + progres daftar pelajaran yang tersimpan */
  window._personStatsHtml = function(id){
    var d = (typeof PERSON !== 'undefined') ? PERSON[id] : null; if (!d) return '';
    var col = d.color || '#7c3aed', tot = 0, done = 0, sv = {}, k = 0;
    try{ sv = _pLoad()[id] || {}; }catch(e){}
    (d.belajar || []).forEach(function(g){ g.slice(1).forEach(function(){ tot++; if (sv['k'+(k++)]) done++; }); });
    var list = [
      {i:'user',   t:'Profil',           v:'Adik MC Fathul Adzim',    s:d.name},
      {i:'mic',    t:'Peran',            v:'Manager',                 s:'Manager MC FATHUL ADZIM'},
      {i:'users',  t:'Kelompok',         v:'Project Adik Sendiri',    s:'Satu kelompok dengan Dunia Ayla, dengan peran yang berbeda'},
      {i:'globe',  t:'Channel',          v:'Tanpa channel',           s:'Tidak punya channel sendiri'},
      {i:'clipboard',t:'Tugas Manager',  v:n10((d.tugas || []).length) + ' Tugas', s:'Jadwal posting, kerja sama brand, pembukuan, dan pantauan insight'},
      {i:'books',  t:'Daftar Pelajaran', v:n10(done) + ' / ' + n10(tot), s:(d.belajar || []).map(function(g){ return g[0]; }).join(' · ')}
    ];
    list.forEach(function(c){ c.col = col; });
    return render(list);
  };
})();
