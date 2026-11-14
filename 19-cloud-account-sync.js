(function(){
  var firebaseConfig = {
    apiKey: "AIzaSyB9k9YnL6bGG54qJmXvOegbr5M0zfOoE8c",
    authDomain: "mcfaproject.firebaseapp.com",
    projectId: "mcfaproject",
    storageBucket: "mcfaproject.firebasestorage.app",
    messagingSenderId: "434249757419",
    appId: "1:434249757419:web:8333f79242ad9fb439c4ae"
  };

  if(typeof firebase === 'undefined'){ return; }
  firebase.initializeApp(firebaseConfig);
  var auth = firebase.auth();
  var db = firebase.firestore();

  var panel = document.getElementById('mcfa-acc-panel');
  var sheet = document.getElementById('mcfa-acc-sheet');
  var currentUser = null;
  var saveTimer = null;
  var mode = 'login'; // 'login' | 'register'

  function openPanel(){ panel.classList.add('open'); mode = 'login'; render(); }
  function closePanel(){ panel.classList.remove('open'); }
  window.mcfaOpenAccountPanel = openPanel;
  panel.addEventListener('click', function(e){ if(e.target===panel) closePanel(); });

  /* PENGAMAN SINKRON ANTARPERANGKAT: backup otomatis TIDAK boleh menimpa cloud yang lebih baru dari yang pernah dilihat perangkat ini
     (mencegah HP lama menghapus data terbaru dari HP lain). Penanda 'mcfa_cloud_seen' = waktu cloud terakhir yang disinkronkan di perangkat ini. */
  var SYNC_KEY = 'mcfa_cloud_seen', SNAP_KEY = 'mcfa_pre_import_snapshot', CLOUD_SCHEMA = 1, conflictWarned = false;
  /* TAHAP 11: salinan pengaman lokal TIDAK ikut ke cloud (menggandakan ukuran & mempercepat kena batas ±1 MB) */
  /* Bagian 11: salinan pengaman migrasi, karantina, dan penanda versi data = lokal perangkat (tidak ikut cloud; menjaga batas ±950 KB) */
  var LOCAL_ONLY = /^mcfa_(pre_migration_snapshot_v1|quarantine_v1|data_version_v1)$/;
  function collectLocalData(){
    var out = {};
    for(var i=0;i<localStorage.length;i++){
      var k = localStorage.key(i);
      if(k === SYNC_KEY || k === SNAP_KEY || LOCAL_ONLY.test(k)) continue;
      out[k] = localStorage.getItem(k);
    }
    /* versi struktur data dibawa DI DALAM payload (bukan field dokumen baru: Firestore Rules tidak ada di repositori) */
    out.__mcfa_data_schema = String((window.MCFA_MIGRATE && MCFA_MIGRATE.SCHEMA) || 1);
    return out;
  }
  function applyLocalData(obj){
    Object.keys(obj||{}).forEach(function(k){
      if(k === SYNC_KEY || k === SNAP_KEY || LOCAL_ONLY.test(k) || k.indexOf('__') === 0) return;
      try{ _origSet(k, obj[k]); }catch(e){}
    });
  }
  function cloudMillis(doc){ try{ var d = doc && doc.data && doc.data(); return (d && d.updatedAt && d.updatedAt.toMillis) ? d.updatedAt.toMillis() : 0; }catch(e){ return 0; } }
  function seenMillis(){ try{ return +(localStorage.getItem(SYNC_KEY) || 0) || 0; }catch(e){ return 0; } }
  function markSeen(ms){ try{ _origSet(SYNC_KEY, String(ms || 0)); }catch(e){} }
  function warnConflict(){
    if(conflictWarned) return; conflictWarned = true;
    try{ if(typeof showNotif === 'function') showNotif('Cloud berisi data lebih baru. Buka Akun & Backup lalu pilih Pulihkan agar tidak tertimpa.'); }catch(e){}
  }

  function backupNow(showMsg, force){
    if(!currentUser) return Promise.resolve();
    var ref = db.collection('backups').doc(currentUser.uid);
    return ref.get().then(function(doc){
      if(doc.exists && !force && cloudMillis(doc) > seenMillis()){
        /* cloud lebih baru dari yang dilihat perangkat ini → jangan timpa diam-diam */
        if(showMsg){
          if(confirm('Cloud berisi data yang lebih baru dari HP ini. Timpa cloud dengan data HP ini?\n\nPilih Batal, lalu gunakan "Pulihkan Data dari Cloud" bila data cloud yang benar.')) return backupNow(true, true);
          msg('err', 'Tidak disimpan: cloud lebih baru. Pulihkan dulu dari cloud.');
        } else warnConflict();
        return;
      }
      var payload = JSON.stringify(collectLocalData()), bytes = (typeof Blob !== 'undefined') ? new Blob([payload]).size : payload.length;
      if(bytes > 950000){   /* AUDIT: batas dokumen Firestore ±1 MB — dulu gagal diam-diam pada backup otomatis */
        var big = 'Data terlalu besar untuk cloud (' + Math.round(bytes/1024) + ' KB, batas ±1000 KB). Backup dibatalkan; kecilkan foto/data lalu coba lagi.';
        if(showMsg) msg('err', big); else { try{ if(typeof showNotif === 'function') showNotif(big); }catch(e){} }
        return;
      }
      return ref.set({
        data: payload,
        schema: CLOUD_SCHEMA,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        email: currentUser.email
      }).then(function(){ return ref.get(); }).then(function(d2){
        markSeen(cloudMillis(d2)); conflictWarned = false;
        if(showMsg) msg('ok', '✓ Data berhasil disimpan ke cloud.');
      });
    }).catch(function(err){
      if(showMsg) msg('err', 'Gagal simpan: '+err.message);
    });
  }

  function restoreNow(){
    if(!currentUser) return Promise.resolve();
    return db.collection('backups').doc(currentUser.uid).get().then(function(doc){
      if(doc.exists){
        var d = doc.data();
        try{
          if(typeof d.schema === 'number' && d.schema > CLOUD_SCHEMA){ msg('err', 'Cadangan cloud dibuat versi aplikasi yang lebih baru. Perbarui aplikasi dulu, data tidak diubah.'); return; }
          var parsed = JSON.parse(d.data);
          if(parsed && parsed.__mcfa_data_schema && window.MCFA_MIGRATE && +parsed.__mcfa_data_schema > MCFA_MIGRATE.SCHEMA){ msg('err', 'Cadangan cloud memakai struktur data yang lebih baru. Perbarui aplikasi dulu, data tidak diubah.'); return; }
          if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)){ msg('err', 'Isi cadangan cloud tidak valid. Data di HP ini tidak diubah.'); return; }
          /* TAHAP 11: salinan pengaman data HP ini sebelum ditimpa (sama seperti Impor JSON); batal bila gagal tersimpan */
          try{
            var snap = {}; for(var i=0;i<localStorage.length;i++){ var sk = localStorage.key(i); if(sk !== SNAP_KEY && !LOCAL_ONLY.test(sk)) snap[sk] = localStorage.getItem(sk); }
            _origSet(SNAP_KEY, JSON.stringify({at:new Date().toISOString(), from:'restore-cloud', data:snap}));
          }catch(e){ msg('err', 'Pemulihan dibatalkan: salinan pengaman gagal disimpan (penyimpanan penuh). Data di HP ini tidak diubah.'); return; }
          applyLocalData(parsed);
          markSeen(cloudMillis(doc)); conflictWarned = false;
          msg('ok', '✓ Data berhasil dipulihkan dari cloud. Memuat ulang halaman...');
          setTimeout(function(){ location.reload(); }, 1200);
        }catch(e){ msg('err', 'Gagal membaca data cloud.'); }
      } else {
        msg('err', 'Belum ada data tersimpan di cloud untuk akun ini. Tap "Simpan Data ke Cloud" dulu.');
      }
    }).catch(function(err){ msg('err', 'Gagal memuat: '+err.message); });
  }

  function scheduleAutoBackup(){
    if(!currentUser) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){ backupNow(false); }, 4000);
  }

  // Monkey-patch localStorage supaya setiap perubahan data otomatis
  // dijadwalkan untuk di-backup ke cloud (debounced, 4 detik).
  var _origSet = localStorage.setItem.bind(localStorage);
  var _origRemove = localStorage.removeItem.bind(localStorage);
  localStorage.setItem = function(k, v){ _origSet(k, v); scheduleAutoBackup(); };
  localStorage.removeItem = function(k){ _origRemove(k); scheduleAutoBackup(); };

  function msg(type, text){
    var el = sheet.querySelector('.mcfa-acc-msg');
    if(!el) return;
    el.className = 'mcfa-acc-msg show '+type;
    el.textContent = text;
  }

  function translateErr(err){
    var code = err && err.code;
    if(code==='auth/email-already-in-use') return 'Email sudah terdaftar. Coba menu "Masuk".';
    if(code==='auth/invalid-email') return 'Format email tidak valid.';
    if(code==='auth/weak-password') return 'Password terlalu lemah (minimal 6 karakter).';
    if(code==='auth/wrong-password' || code==='auth/invalid-credential') return 'Email atau password salah.';
    if(code==='auth/user-not-found') return 'Akun tidak ditemukan. Coba menu "Daftar".';
    if(code==='auth/too-many-requests') return 'Terlalu banyak percobaan. Coba lagi nanti.';
    if(code==='auth/network-request-failed') return 'Koneksi internet bermasalah.';
    return (err && err.message) ? err.message : 'Terjadi kesalahan.';
  }

  function render(){
    if(currentUser){
      sheet.innerHTML =
        '<h3>'+goalIco('lock')+' Akun & Backup Cloud</h3>'+
        '<div class="mcfa-acc-userbox">'+
          '<div class="em">'+currentUser.email+'</div>'+
          '<div class="st">✓ Login aktif — backup otomatis nyala</div>'+
        '</div>'+
        '<button class="mcfa-acc-btn primary" id="mcfa-do-backup">'+goalIco('cloud')+' Simpan Data ke Cloud</button>'+
        '<button class="mcfa-acc-btn ghost" id="mcfa-do-restore">⬇️ Pulihkan Data dari Cloud</button>'+
        '<button class="mcfa-acc-btn danger" id="mcfa-do-logout">Keluar</button>'+
        '<div class="mcfa-acc-msg"></div>'+
        '<button class="mcfa-acc-close" id="mcfa-acc-cancel">Tutup</button>';
      document.getElementById('mcfa-do-backup').addEventListener('click', function(){ backupNow(true); });
      document.getElementById('mcfa-do-restore').addEventListener('click', function(){
        if(confirm('Ini akan MENIMPA data yang ada di HP ini dengan data dari cloud. Lanjutkan?')) restoreNow();
      });
      document.getElementById('mcfa-do-logout').addEventListener('click', function(){ auth.signOut(); });
    } else if(mode === 'register'){
      sheet.innerHTML =
        '<h3>'+goalIco('lock')+' Daftar Akun Baru</h3>'+
        '<div class="mcfa-acc-field"><label>Email</label><input type="email" id="mcfa-in-email" placeholder="email@contoh.com" autocomplete="email"></div>'+
        '<div class="mcfa-acc-field"><label>Password</label><input type="password" id="mcfa-in-pw" placeholder="Minimal 6 karakter" autocomplete="new-password"></div>'+
        '<button class="mcfa-acc-btn primary" id="mcfa-do-register">Daftar & Simpan Data Sekarang</button>'+
        '<div class="mcfa-acc-msg"></div>'+
        '<button class="mcfa-acc-link" id="mcfa-switch-login">Sudah punya akun? Masuk di sini</button>'+
        '<button class="mcfa-acc-close" id="mcfa-acc-cancel">Batal</button>';
      document.getElementById('mcfa-do-register').addEventListener('click', function(){
        var email = document.getElementById('mcfa-in-email').value.trim();
        var pw = document.getElementById('mcfa-in-pw').value;
        if(!email || !pw){ msg('err', 'Isi email dan password dulu.'); return; }
        if(pw.length < 6){ msg('err', 'Password minimal 6 karakter.'); return; }
        auth.createUserWithEmailAndPassword(email, pw).then(function(){
          return backupNow(false);
        }).catch(function(err){ msg('err', translateErr(err)); });
      });
      document.getElementById('mcfa-switch-login').addEventListener('click', function(){ mode='login'; render(); });
    } else {
      sheet.innerHTML =
        '<h3>'+goalIco('lock')+' Masuk ke Akun</h3>'+
        '<div class="mcfa-acc-field"><label>Email</label><input type="email" id="mcfa-in-email" placeholder="email@contoh.com" autocomplete="email"></div>'+
        '<div class="mcfa-acc-field"><label>Password</label><input type="password" id="mcfa-in-pw" placeholder="Password" autocomplete="current-password"></div>'+
        '<button class="mcfa-acc-btn primary" id="mcfa-do-login">Masuk</button>'+
        '<div class="mcfa-acc-msg"></div>'+
        '<button class="mcfa-acc-link" id="mcfa-switch-register">Belum punya akun? Daftar di sini</button>'+
        '<button class="mcfa-acc-close" id="mcfa-acc-cancel">Batal</button>';
      document.getElementById('mcfa-do-login').addEventListener('click', function(){
        var email = document.getElementById('mcfa-in-email').value.trim();
        var pw = document.getElementById('mcfa-in-pw').value;
        if(!email || !pw){ msg('err', 'Isi email dan password dulu.'); return; }
        auth.signInWithEmailAndPassword(email, pw).catch(function(err){ msg('err', translateErr(err)); });
      });
      document.getElementById('mcfa-switch-register').addEventListener('click', function(){ mode='register'; render(); });
    }
    var cancelBtn = document.getElementById('mcfa-acc-cancel');
    if(cancelBtn) cancelBtn.addEventListener('click', closePanel);
  }

  auth.onAuthStateChanged(function(user){
    currentUser = user;
    if(panel.classList.contains('open')) render();
    /* saat login: beri tahu bila cloud lebih baru dari perangkat ini (tanpa menimpa apa pun) */
    if(user){ db.collection('backups').doc(user.uid).get().then(function(doc){ if(doc.exists && cloudMillis(doc) > seenMillis()) warnConflict(); }).catch(function(){}); }
  });
})();
