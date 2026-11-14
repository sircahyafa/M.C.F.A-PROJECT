/* ═══════════════════════════════════════════════════════════════════════════
   DATA & MIGRASI — satu pintu untuk versi struktur data (Bagian 11)
   ───────────────────────────────────────────────────────────────────────────
   Aturan yang dijaga modul ini:
   • TIDAK PERNAH menghapus data pengguna. Data lama/tidak dikenal hanya dicatat di inventaris (dipertahankan apa adanya).
   • Berjalan hanya bila ada pekerjaan (scan hanya-baca dulu). Tanpa pekerjaan → tidak ada penulisan sama sekali.
   • Sebelum menulis: salinan pengaman kunci yang akan disentuh ('mcfa_pre_migration_snapshot_v1'). Gagal menyimpan salinan → migrasi dibatalkan.
   • Sesudah menulis: validasi (kunci tidak hilang, JSON tetap valid, jumlah daftar/riwayat tidak berkurang, angka audiens sama).
     Validasi gagal → kunci yang disentuh DIKEMBALIKAN dari salinan pengaman.
   • Idempoten: tiap langkah mendeteksi sendiri apakah masih perlu bekerja; dijalankan berulang kali tidak menggandakan apa pun.
   • Penanda versi 'mcfa_data_version_v1' bersifat lokal perangkat (tidak ikut ekspor/cloud) dan hanya informasi + penjaga "data dari versi
     yang lebih baru". Keputusan migrasi TIDAK bergantung pada penanda — jadi impor cadangan lama / pemulihan cloud tetap termigrasi.
   • Data rusak (JSON tak terbaca / bentuk salah) disalin ke 'mcfa_quarantine_v1' sebelum modul lain sempat menimpanya; aslinya tidak diubah.

   Versi struktur data:
     1 = struktur hingga build 20261109.13 (tanpa penanda versi; tiap modul menormalkan datanya sendiri secara lazy)
     2 = penanda versi + normalisasi mcfa_tahap1_* + buku pencapaian Karier (mcfa_career_ach_v1) + karantina data rusak
   Langkah tambahan dari modul lain didaftarkan lewat MCFA_MIGRATE.register({id, touches, scan, apply}).
   Dimuat PALING AWAL (sebelum 01-…) supaya salinan pengaman dibuat sebelum modul lain menyentuh data. */
(function(){
  'use strict';
  var SCHEMA = 2, BUILD = '20261114.2';
  var VKEY = 'mcfa_data_version_v1', SNAPK = 'mcfa_pre_migration_snapshot_v1', QKEY = 'mcfa_quarantine_v1';
  var MAX_ATTEMPTS = 3, SNAP_VALUE_MAX = 200000;   /* nilai > 200 KB (foto) tidak ikut salinan pengaman: foto tidak pernah disentuh langkah mana pun */
  var steps = [], state = {ran:false, blocked:false, log:[], pre:null, post:null, result:null};

  /* ── akses penyimpanan yang aman (tidak pernah melempar) ── */
  function rd(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function wr(k,v){ try{ localStorage.setItem(k,v); return localStorage.getItem(k) === v; }catch(e){ return false; } }
  function rm(k){ try{ localStorage.removeItem(k); return true; }catch(e){ return false; } }
  function allKeys(){ var o = []; try{ for(var i = 0; i < localStorage.length; i++) o.push(localStorage.key(i)); }catch(e){} return o; }
  function pj(raw){ try{ return {ok:true, v:JSON.parse(raw)}; }catch(e){ return {ok:false}; } }
  function log(s){ state.log.push(s); if(state.log.length > 60) state.log.shift(); }
  function isObj(v){ return v && typeof v === 'object' && !Array.isArray(v); }

  /* ── registri kunci: aktif / legacy (dipertahankan, tidak dirender lagi) / volatil / sementara ── */
  var REG = [
    [/^mcfa_konten_[a-z0-9_]+$/i,'aktif'], [/^mcfa_tahap1_[a-z0-9_]+$/i,'aktif'], [/^mcfa_akun_hub_v1$/,'aktif'], [/^mcfa_kpc_info_v1$/,'aktif'],
    [/^mcfa_adp_v1_\d{4}-\d{2}-\d{2}$/,'aktif'], [/^mcfa_adp_(prod|custom)_v1$/,'aktif'], [/^mcfa_tugasAwalHarian_v1$/,'aktif'],
    [/^ba_\d{4}_\d{1,2}_\d{1,2}$/,'aktif'], [/^fin_(ledger|milestones)_v1$/,'aktif'], [/^mcfa_usd_rate_v1$/,'aktif'], [/^fathul_light_v1$/,'aktif'],
    [/^mcfa_reno_v1$/,'aktif'], [/^mcfa_person_[a-z0-9_]+$/i,'aktif'], [/^mcfa_kolab_[a-z0-9_]+$/i,'aktif'], [/^mcfa_cred_[a-z0-9_]+$/i,'aktif'],
    [/^avatar_/,'aktif'], [/^mcfa_career_ach_v1$/,'aktif'],
    [/^mcfa_adpk_(v1|log_v1(_prev\d*)?)$/,'legacy'], [/^mcfa_backup_pre_adaptasi_v1$/,'legacy'], [/^mcfa_tugasAwal(Harian_v1_prev_v\d|_.*)$/,'legacy'],
    [/^mcfa_(fx|fx_prefs_v1|sfx|pwa_dismissed)$/,'preferensi'], [/^oh[A-Za-z_]*$/,'preferensi'],
    [/^(mcfa_cloud_seen|mcfa_pre_import_snapshot|mcfa_pre_migration_snapshot_v1|mcfa_quarantine_v1|mcfa_data_version_v1)$/,'sistem'],
    [/^(firebase|__)/,'sistem']
  ];
  function classOf(k){ for(var i = 0; i < REG.length; i++) if(REG[i][0].test(k)) return REG[i][1]; return 'tidak-dikenal'; }

  /* ── sidik jari semantik satu kunci (untuk validasi sebelum/sesudah) ── */
  function fp(k, raw){
    if(raw === null || raw === undefined) return null;
    var f = {len:raw.length}, p;
    if(/^\s*[\[{]/.test(raw)){
      p = pj(raw); f.json = p.ok;
      if(p.ok){
        if(Array.isArray(p.v)) f.n = p.v.length;
        else if(isObj(p.v)){
          if(Array.isArray(p.v.hist)) f.hist = p.v.hist.length;
          if(/^mcfa_tahap1_/.test(k)){ f.fol = +p.v.followers || 0; f.sub = +p.v.subs || 0; }
          if(p.v.items && isObj(p.v.items)) f.items = Object.keys(p.v.items).length;
        }
      }
    }
    return f;
  }
  /* "tidak lebih buruk": JSON tetap valid, daftar/riwayat/butir tidak berkurang, angka audiens sama */
  function notWorse(a, b){
    if(!a) return true;                      // kunci belum ada sebelumnya
    if(!b) return false;                     // kunci hilang
    if(a.json === true && b.json !== true) return false;
    if(a.n !== undefined && (b.n === undefined || b.n < a.n)) return false;
    if(a.hist !== undefined && (b.hist === undefined || b.hist < a.hist)) return false;
    if(a.items !== undefined && (b.items === undefined || b.items < a.items)) return false;
    if(a.fol !== undefined && (a.fol !== b.fol || a.sub !== b.sub)) return false;
    return true;
  }

  /* ── pemindaian hanya-baca ── */
  function scanAll(){
    var ks = allKeys(), r = {keys:ks.length, bytes:0, json:0, corrupt:[], cls:{aktif:0, legacy:0, preferensi:0, sistem:0, 'tidak-dikenal':0}, legacy:[], unknown:[]};
    ks.forEach(function(k){
      var v = rd(k); if(v === null) return; r.bytes += k.length + v.length;
      var c = classOf(k); r.cls[c]++;
      if(c === 'legacy') r.legacy.push(k); else if(c === 'tidak-dikenal') r.unknown.push(k);
      if(/^\s*[\[{]/.test(v)){ r.json++; if(!pj(v).ok && c !== 'sistem') r.corrupt.push(k); }
    });
    return r;
  }

  /* ── karantina: salinan data rusak (aslinya tidak diubah) ── */
  function quarantineAdd(items){
    var cur = pj(rd(QKEY) || '[]'), list = (cur.ok && Array.isArray(cur.v)) ? cur.v : [], n = 0;
    items.forEach(function(it){
      if(list.some(function(x){ return x && x.k === it.k && x.raw === it.raw; })) return;
      list.push({k:it.k, why:it.why, at:new Date().toISOString(), raw:it.raw}); n++;
    });
    if(!n) return {added:0};
    var out = JSON.stringify(list);
    if(out.length > 400000) return {added:0, note:'karantina penuh'};
    return wr(QKEY, out) ? {added:n} : {added:0, note:'gagal menyimpan karantina'};
  }

  /* ═════════ LANGKAH INTI ═════════ */
  /* 1) karantina data rusak: JSON tak terbaca, atau bentuk salah (daftar konten bukan array; data akun bukan objek) */
  function badShape(k, raw){
    if(raw === null) return '';
    var isK = /^mcfa_konten_/.test(k), isT = /^mcfa_tahap1_/.test(k);
    if(!isK && !isT) return '';
    var p = pj(raw); if(!p.ok) return 'JSON tidak terbaca';
    if(isK && !Array.isArray(p.v)) return 'daftar konten bukan array';
    if(isT && !isObj(p.v)) return 'data akun bukan objek';
    return '';
  }
  steps.push({
    id:'karantina-data-rusak', touches:[/^mcfa_quarantine_v1$/],
    scan:function(){
      var cur = pj(rd(QKEY) || '[]'), q = (cur.ok && Array.isArray(cur.v)) ? cur.v : [];
      return allKeys().filter(function(k){ var raw = rd(k), why = badShape(k, raw); return why && !q.some(function(x){ return x && x.k === k && x.raw === raw; }); });
    },
    apply:function(keys){ var it = keys.map(function(k){ return {k:k, raw:rd(k), why:badShape(k, rd(k))}; }); var r = quarantineAdd(it); return {changed:r.added, note:r.note}; }
  });

  /* 2) normalisasi mcfa_tahap1_<akun>: tambah field yang hilang, JANGAN membuang field lama.
        Format lama {followers, subs} tetap valid. followers/subs berupa teks digit murni → angka. Riwayat bukan array → dipindah ke hist_legacy. */
  function t1Fix(o){
    var ch = false, out = {}, k;
    for(k in o) if(Object.prototype.hasOwnProperty.call(o, k)) out[k] = o[k];
    ['followers','subs'].forEach(function(m){
      var v = out[m];
      if(typeof v === 'string' && /^\d+$/.test(v.trim())){ out[m] = parseInt(v, 10); ch = true; }
      else if(v === undefined){ out[m] = 0; ch = true; }
    });
    if(out.targets === undefined || out.targets === null){ out.targets = {}; ch = true; }
    else if(!isObj(out.targets)){ out.targets_legacy = out.targets; out.targets = {}; ch = true; }
    if(out.hist === undefined || out.hist === null){ out.hist = []; ch = true; }
    else if(!Array.isArray(out.hist)){ out.hist_legacy = out.hist; out.hist = []; ch = true; }
    return ch ? out : null;
  }
  steps.push({
    id:'tahap1-normalisasi', touches:[/^mcfa_tahap1_/],
    scan:function(){
      return allKeys().filter(function(k){
        if(!/^mcfa_tahap1_/.test(k)) return false; var raw = rd(k); if(raw === null) return false;
        var p = pj(raw); return p.ok && isObj(p.v) && t1Fix(p.v) !== null;
      });
    },
    apply:function(keys){
      var n = 0;
      keys.forEach(function(k){ var p = pj(rd(k)); if(!p.ok || !isObj(p.v)) return; var fixed = t1Fix(p.v); if(fixed && wr(k, JSON.stringify(fixed))) n++; });
      return {changed:n};
    }
  });

  /* ── penjalan ── */
  function readVersion(){ var p = pj(rd(VKEY) || 'null'); return (p.ok && isObj(p.v)) ? p.v : null; }

  function snapshotFor(pending){
    var data = {}, skipped = [], pats = [];
    pending.forEach(function(s){ (s.touches || []).forEach(function(re){ pats.push(re); }); });
    allKeys().forEach(function(k){
      if(!pats.some(function(re){ return re.test(k); })) return;
      var v = rd(k); if(v === null) return;
      if(v.length > SNAP_VALUE_MAX){ skipped.push(k); return; }
      data[k] = v;
    });
    /* kunci yang belum ada saat salinan dibuat dicatat null → rollback = hapus kunci baru itu */
    pending.forEach(function(s){ (s.newKeys || []).forEach(function(k){ if(!(k in data) && rd(k) === null) data[k] = null; }); });
    var snap = {at:new Date().toISOString(), from:(readVersion() || {}).schema || 1, to:SCHEMA, build:BUILD, skipped:skipped, data:data};
    return wr(SNAPK, JSON.stringify(snap)) ? snap : null;
  }

  function run(){
    if(state.ran) return state.result; state.ran = true;
    var stored = readVersion(), out = {schemaFrom:stored ? stored.schema : 1, schemaTo:SCHEMA, ok:true, steps:[], at:new Date().toISOString()};
    state.pre = scanAll();
    /* penjaga: data dibuat versi aplikasi yang lebih baru → jangan disentuh sama sekali */
    if(stored && typeof stored.schema === 'number' && stored.schema > SCHEMA){
      state.blocked = true; out.ok = false; out.blocked = true; out.note = 'Data bertanda versi ' + stored.schema + ' (lebih baru dari aplikasi ini: ' + SCHEMA + '). Migrasi dilewati, data tidak diubah.';
      log(out.note); state.result = out; return out;
    }
    var attempts = (stored && stored.attempts) || 0;
    var pending = [];
    steps.forEach(function(s){ var keys = []; try{ keys = s.scan() || []; }catch(e){ log('scan gagal ' + s.id + ': ' + e.message); } if(keys.length) pending.push({step:s, keys:keys}); });
    if(!pending.length){
      out.note = 'Tidak ada yang perlu dimigrasi.';
    } else if(attempts >= MAX_ATTEMPTS){
      out.ok = false; out.note = 'Migrasi dihentikan setelah ' + attempts + ' percobaan gagal; data tidak diubah.'; log(out.note);
    } else {
      var snap = snapshotFor(pending.map(function(x){ return x.step; }));
      if(!snap){ out.ok = false; out.note = 'Migrasi dibatalkan: salinan pengaman gagal disimpan (penyimpanan penuh). Data tidak diubah.'; log(out.note); }
      else {
        var fpPre = {};
        Object.keys(snap.data).forEach(function(k){ fpPre[k] = fp(k, snap.data[k]); });
        pending.forEach(function(x){
          var r; try{ r = x.step.apply(x.keys) || {}; }catch(e){ r = {error:e.message}; }
          out.steps.push({id:x.step.id, keys:x.keys.length, changed:r.changed || 0, error:r.error || null, note:r.note || ''});
          if(r.error){ out.ok = false; log('langkah ' + x.step.id + ' gagal: ' + r.error); }
        });
        /* validasi sesudah: kunci tidak hilang & tidak lebih buruk; kunci tak tersentuh identik */
        var bad = [];
        Object.keys(snap.data).forEach(function(k){
          var now = rd(k), before = snap.data[k];
          if(before === null) return;
          if(!notWorse(fpPre[k], fp(k, now))) bad.push(k);
        });
        if(bad.length){
          out.ok = false; out.rolledBack = bad.slice(0, 20);
          bad.forEach(function(k){ wr(k, snap.data[k]); });
          Object.keys(snap.data).forEach(function(k){ if(snap.data[k] === null) rm(k); });
          log('validasi gagal, dikembalikan: ' + bad.join(', '));
        }
      }
    }
    state.post = scanAll(); out.keysBefore = state.pre.keys; out.keysAfter = state.post.keys;
    if(state.post.keys < state.pre.keys){ out.ok = false; log('jumlah kunci berkurang: ' + state.pre.keys + ' → ' + state.post.keys); }
    var inv = {aktif:state.post.cls.aktif, legacy:state.post.cls.legacy, preferensi:state.post.cls.preferensi, sistem:state.post.cls.sistem, tidakDikenal:state.post.cls['tidak-dikenal'],
               legacyKeys:state.post.legacy.slice(0, 20), unknownKeys:state.post.unknown.slice(0, 20), corruptKeys:state.post.corrupt.slice(0, 20)};
    var rec = {schema:out.ok ? SCHEMA : ((stored && stored.schema) || 1), build:BUILD, at:out.at, lastOk:out.ok, attempts:out.ok ? 0 : attempts + (pending.length ? 1 : 0),
               from:out.schemaFrom, steps:out.steps, inventory:inv, note:out.note || ''};
    if(!pending.length) rec.schema = SCHEMA;
    wr(VKEY, JSON.stringify(rec));
    state.result = out; return out;
  }

  /* Phase A — segera saat dimuat: hanya pemindaian hanya-baca + karantina data rusak (aman, hanya menambah kunci karantina) */
  try{
    var qs = steps[0], qk = qs.scan(); if(qk.length) qs.apply(qk);
  }catch(e){ log('karantina awal gagal: ' + e.message); }

  /* Phase B — setelah semua modul termuat (langkah dari modul lain sudah terdaftar) */
  function phaseB(){
    try{ run(); }catch(e){ log('run gagal: ' + e.message); }
    try{
      if(state.blocked && typeof showNotif === 'function') showNotif('Data berasal dari versi aplikasi yang lebih baru. Perbarui aplikasi; data tidak diubah.');
    }catch(e){}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', phaseB); else setTimeout(phaseB, 0);

  window.MCFA_MIGRATE = {
    SCHEMA:SCHEMA, BUILD:BUILD, KEYS:{version:VKEY, snapshot:SNAPK, quarantine:QKEY},
    register:function(step){ if(step && step.id && !steps.some(function(s){ return s.id === step.id; })) steps.push(step); },
    run:run, classOf:classOf, readVersion:readVersion, scanAll:scanAll,
    /* ringkasan hanya-baca untuk panel Akun & Cadangan */
    summary:function(){ var v = readVersion(); return v ? {schema:v.schema, build:v.build, at:v.at, ok:v.lastOk !== false, note:v.note || ''} : {schema:1, build:null, at:null, ok:true, note:'belum tercatat'}; },
    report:function(){ return {schema:SCHEMA, stored:readVersion(), pre:state.pre, post:state.post, result:state.result, log:state.log.slice(), blocked:state.blocked}; },
    /* kembalikan data dari salinan pengaman migrasi (manual; dipakai bila ada masalah) — tidak pernah otomatis */
    restoreSnapshot:function(){
      var p = pj(rd(SNAPK) || 'null'); if(!p.ok || !p.v || !p.v.data) return {ok:false, note:'Tidak ada salinan pengaman.'};
      var n = 0; Object.keys(p.v.data).forEach(function(k){ if(p.v.data[k] === null) rm(k); else if(wr(k, p.v.data[k])) n++; });
      return {ok:true, restored:n, at:p.v.at};
    },
    _fp:fp, _notWorse:notWorse, _t1Fix:t1Fix
  };
})();
