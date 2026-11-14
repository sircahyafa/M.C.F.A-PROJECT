/* ===== Cadangan LOKAL (JSON) — MANDIRI: tidak bergantung pada Firebase/jaringan (tetap jalan offline/WebView) ===== */
(function(){
  /* Bagian 11: salinan pengaman migrasi, karantina data rusak, dan penanda versi bersifat LOKAL perangkat — tidak ikut ekspor/cloud
     (penanda versi tidak boleh terbawa ke perangkat lain: impor cadangan lama harus tetap termigrasi di perangkat tujuan). */
  var SNAP = 'mcfa_pre_import_snapshot', SKIP = /^(firebase|__)|^mcfa_pre_import_snapshot$|^mcfa_cloud_seen$|^mcfa_pre_migration_snapshot_v1$|^mcfa_quarantine_v1$|^mcfa_data_version_v1$/;
  function curSchema(){ return (window.MCFA_MIGRATE && MCFA_MIGRATE.SCHEMA) || 1; }
  var panel = document.getElementById('mcfa-acc-panel'), sheet = document.getElementById('mcfa-acc-sheet');
  if(!panel || !sheet) return;
  function collect(){ var o = {}; for(var i=0;i<localStorage.length;i++){ var k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; }
  function msg(type, text){ var el = sheet.querySelector('.mcfa-lb-msg'); if(!el) return; el.style.cssText = 'margin-top:8px;font-size:12px;line-height:1.4;color:'+(type === 'ok' ? '#15803d' : '#b91c1c'); el.textContent = text; }
  function doExport(){
    var all = collect(), data = {}, n = 0;
    Object.keys(all).forEach(function(k){ if(!SKIP.test(k)){ data[k] = all[k]; n++; } });
    var pkg = {app:'MCFA', schema:1, dataSchema:curSchema(), exportedAt:new Date().toISOString(), count:n, data:data};   /* schema = format berkas (tetap 1); dataSchema = versi struktur data (Bagian 11) */
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(pkg)], {type:'application/json'}));
    a.download = 'mcfa-backup-'+mcfaTodayIso()+'.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
    msg('ok', '✓ '+n+' kunci data diekspor ke file JSON.');
  }
  function validate(pkg){
    if(!pkg || typeof pkg !== 'object' || pkg.app !== 'MCFA') return 'Bukan file cadangan M.C.F.A.';
    if(typeof pkg.schema !== 'number' || pkg.schema > 1) return 'Versi skema file tidak dikenali.';
    if(pkg.dataSchema !== undefined && (typeof pkg.dataSchema !== 'number' || pkg.dataSchema > curSchema())) return 'Cadangan ini dibuat versi aplikasi yang lebih baru (struktur data v'+pkg.dataSchema+'). Perbarui aplikasi dulu; data di perangkat ini tidak diubah.';   /* tanpa dataSchema = cadangan lama (v1): tetap diterima dan dimigrasi saat dimuat */
    if(!pkg.data || typeof pkg.data !== 'object' || Array.isArray(pkg.data)) return 'Isi data tidak valid.';
    var keys = Object.keys(pkg.data); if(!keys.length) return 'File tidak berisi data.';
    for(var i=0;i<keys.length;i++){
      var v = pkg.data[keys[i]];
      if(typeof v !== 'string') return 'Nilai pada "'+keys[i]+'" bukan teks.';
      if(/^\s*[\[{]/.test(v)){ try{ JSON.parse(v); }catch(e){ return 'Data "'+keys[i]+'" rusak (JSON tidak valid).'; } }
    }
    return '';
  }
  function doImport(file){
    if(!file) return;
    var rd = new FileReader();
    rd.onerror = function(){ msg('err', 'Gagal membaca file.'); };
    rd.onload = function(){
      var pkg; try{ pkg = JSON.parse(rd.result); }catch(e){ msg('err', 'File bukan JSON yang valid.'); return; }
      var bad = validate(pkg); if(bad){ msg('err', bad); return; }
      var keys = Object.keys(pkg.data).filter(function(k){ return !SKIP.test(k); });
      if(!confirm('Impor '+keys.length+' kunci data dari file cadangan'+(pkg.exportedAt ? ' ('+String(pkg.exportedAt).slice(0,10)+')' : '')+'?\n\nData dengan nama kunci yang sama di perangkat ini akan DITIMPA. Salinan pengaman data sekarang disimpan otomatis dulu.')) return;
      try{ localStorage.setItem(SNAP, JSON.stringify({at:new Date().toISOString(), data:collect()})); }
      catch(e){ msg('err', 'Impor dibatalkan: salinan pengaman gagal disimpan (penyimpanan penuh). Ekspor data sekarang dulu.'); return; }
      keys.forEach(function(k){ try{ localStorage.setItem(k, pkg.data[k]); }catch(e){} });
      msg('ok', '✓ Data diimpor. Memuat ulang halaman...');
      setTimeout(function(){ location.reload(); }, 1000);
    };
    rd.readAsText(file);
  }
  function verText(){
    try{ var v = MCFA_MIGRATE.summary(); return 'Struktur data: v'+v.schema+(v.build ? ' · build '+v.build : '')+(v.at ? ' · dicek '+String(v.at).slice(0,10) : '')+(v.ok ? '' : ' · ⚠ '+(v.note || 'migrasi perlu perhatian')); }catch(e){ return 'Struktur data: belum tercatat'; }
  }
  function mount(){
    if(sheet.querySelector('.mcfa-lb')) return;
    var box = document.createElement('div'); box.className = 'mcfa-lb';
    box.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px solid rgba(128,128,128,.3)';
    box.innerHTML = '<div style="font-size:11px;letter-spacing:.6px;opacity:.8;margin-bottom:8px">CADANGAN LOKAL (FILE JSON) — TANPA CLOUD</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="mcfa-lb-ex">Ekspor JSON</button><button type="button" class="mcfa-lb-im">Impor JSON</button></div>'+
      '<input type="file" class="mcfa-lb-file" accept="application/json,.json" style="display:none"><div class="mcfa-lb-ver" style="margin-top:8px;font-size:11px;opacity:.75">'+verText()+'</div><div class="mcfa-lb-msg" role="status"></div>';
    sheet.appendChild(box);
    box.querySelector('.mcfa-lb-ex').addEventListener('click', doExport);
    var fi = box.querySelector('.mcfa-lb-file');
    box.querySelector('.mcfa-lb-im').addEventListener('click', function(){ fi.value = ''; fi.click(); });
    fi.addEventListener('change', function(){ doImport(fi.files && fi.files[0]); });
  }
  /* sisipkan kotak cadangan setiap kali isi panel dirender ulang (oleh modul akun cloud atau mode offline) */
  new MutationObserver(function(){ if(sheet.children.length && !sheet.querySelector('.mcfa-lb')) mount(); }).observe(sheet, {childList:true});
  /* Mode offline: modul akun cloud tidak aktif (Firebase tidak termuat) → sediakan panel sendiri */
  if(typeof window.mcfaOpenAccountPanel !== 'function'){
    window.mcfaOpenAccountPanel = function(){
      sheet.innerHTML = '<div style="font-weight:700;margin-bottom:6px">Akun &amp; Cadangan</div><div style="font-size:12px;opacity:.85;line-height:1.5">Akun cloud tidak tersedia (tidak ada koneksi atau layanan belum termuat). Data tetap tersimpan di perangkat ini. Gunakan cadangan file JSON di bawah.</div><div style="margin-top:10px"><button type="button" class="mcfa-lb-close">Tutup</button></div>';
      panel.classList.add('open');
      sheet.querySelector('.mcfa-lb-close').addEventListener('click', function(){ panel.classList.remove('open'); });
    };
    panel.addEventListener('click', function(e){ if(e.target === panel) panel.classList.remove('open'); });
  }
})();
