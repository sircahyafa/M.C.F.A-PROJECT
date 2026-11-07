(function(){
  var FM_KEY = 'fin_milestones_v1';
  var FM_MILESTONES = [
    10000000, 25000000, 50000000, 100000000, 150000000, 200000000,
    300000000, 400000000, 500000000, 600000000, 700000000, 800000000,
    900000000, 1000000000, 1271803816
  ];

  /* ═══ SATU SUMBER DATA KEUANGAN ═══
     Buku transaksi (localStorage 'fin_ledger_v1') adalah satu-satunya sumber. Semua angka diturunkan dari rumus yang sama:
       Saldo Saat Ini   = Total Pemasukan Aktif − Total Pengeluaran Aktif
       Progres Keuangan = Total Pemasukan Aktif      (pengeluaran TIDAK menurunkan progres)
       Sisa Target      = Target − Total Pemasukan Aktif · Persentase = Pemasukan Aktif ÷ Target × 100
     Transaksi yang dihapus dipindah ke daftar 'deleted' (histori) dan tidak ikut hitungan. */
  var FIN_LEDGER_KEY = 'fin_ledger_v1';
  function finIsDate(s){ if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return false; var y=+s.slice(0,4), m=+s.slice(5,7), d=+s.slice(8,10), x=new Date(Date.UTC(y,m-1,d)); return x.getUTCFullYear()===y && x.getUTCMonth()===m-1 && x.getUTCDate()===d; }
  function finActiveTx(){
    var raw = null, out = [], seen = {};
    try{ raw = JSON.parse(localStorage.getItem(FIN_LEDGER_KEY) || 'null'); }catch(e){ raw = null; }
    if(raw && Array.isArray(raw.tx)){
      raw.tx.forEach(function(t){
        if(!t || !t.id || seen[t.id] || (t.type !== 'in' && t.type !== 'out') || !Number.isSafeInteger(t.amount) || !(t.amount > 0) || !finIsDate(t.date)) return;
        seen[t.id] = 1; out.push({type:t.type, amount:t.amount});
      });
      /* format lama (v<2): saldo awal dihitung sebagai satu pemasukan/pengeluaran awal sampai migrasi tersimpan */
      if(raw.v !== 2 && typeof raw.opening === 'number' && Math.round(raw.opening) !== 0) out.push({type: raw.opening > 0 ? 'in' : 'out', amount: Math.abs(Math.round(raw.opening))});
    } else {
      /* belum ada buku transaksi: saldo manual lama (jika ada) dibaca sebagai satu pemasukan awal, lalu dimigrasi oleh modul buku */
      var ob = 0; try{ ob = Math.round(+(JSON.parse(localStorage.getItem('fin_milestones_v1') || '{}').balance) || 0); }catch(e){}
      if(ob !== 0) out.push({type: ob > 0 ? 'in' : 'out', amount: Math.abs(ob)});
    }
    return out;
  }
  function finTotals(){
    var inc = 0, exp = 0, tx = finActiveTx();
    tx.forEach(function(t){ if(t.type === 'in') inc += t.amount; else exp += t.amount; });
    return {income:inc, expense:exp, balance:inc - exp, count:tx.length};
  }
  window.MCFA_FIN_CALC = Object.freeze({totals: finTotals, activeTx: finActiveTx});

  function fmFormatRp(n){
    return 'Rp ' + Math.round(n).toLocaleString('id-ID');
  }

  function fmFormatDateFull(iso){
    // iso: 'YYYY-MM-DD'
    var parts = iso.split('-');
    var d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
    return formatDayUpper(d) + ', ' + formatDateUpper(d);
  }

  function fmTodayIso(){
    return mcfaTodayIso();
  }

  function fmLoadState(){
    try {
      var raw = localStorage.getItem(FM_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(parsed && typeof parsed === 'object'){
          if(typeof parsed.balance !== 'number') parsed.balance = 0;
          if(!parsed.achieved || typeof parsed.achieved !== 'object') parsed.achieved = {};
          if(!parsed.revoked || typeof parsed.revoked !== 'object') parsed.revoked = {};   // pencapaian yang sengaja dibatalkan
          return parsed;
        }
      }
    } catch(e){}
    return { balance: 0, achieved: {}, revoked: {} };
  }

  function fmSaveState(state){
    try {
      localStorage.setItem(FM_KEY, JSON.stringify(state));
      return true;
    } catch(e) {
      return false;
    }
  }

  var fmState = fmLoadState();

  function fmReconcileAchievements(basis){
    /* Pencapaian mengikuti PROGRES KEUANGAN = total pemasukan aktif (pengeluaran tidak membatalkan).
       - basis ≥ target → ditandai tercapai (tanggal pertama tercapai tetap, kecuali diedit pengguna).
       - basis < target (mis. pemasukan dihapus/diedit turun) → pencapaian itu dicabut otomatis agar sinkron.
       Target yang sengaja dibatalkan (revoked) tidak ditandai lagi sampai basis turun di bawahnya. */
    var newlyAchieved = [], clearedRevoked = [], removed = {};
    var today = fmTodayIso();
    FM_MILESTONES.forEach(function(m){
      var key = String(m);
      if(basis >= m){
        if(!fmState.achieved[key] && !fmState.revoked[key]){ fmState.achieved[key] = today; newlyAchieved.push(key); }
      } else {
        if(fmState.revoked[key]){ delete fmState.revoked[key]; clearedRevoked.push(key); }
        if(fmState.achieved[key]){ removed[key] = fmState.achieved[key]; delete fmState.achieved[key]; }
      }
    });
    if(newlyAchieved.length || clearedRevoked.length || Object.keys(removed).length){
      if(!fmSaveState(fmState)){
        // Gagal simpan: kembalikan perubahan di memori supaya tetap sinkron dengan disk.
        newlyAchieved.forEach(function(key){ delete fmState.achieved[key]; });
        clearedRevoked.forEach(function(key){ fmState.revoked[key] = true; });
        Object.keys(removed).forEach(function(key){ fmState.achieved[key] = removed[key]; });
      }
    }
  }

  function fmGetNextTarget(){
    for(var i=0;i<FM_MILESTONES.length;i++){
      var m = FM_MILESTONES[i];
      if(!fmState.achieved[String(m)]) return m;
    }
    return null; // all achieved
  }

  function fmRender(){
    var T = finTotals(), basis = T.income;
    /* saldo hanya turunan dari buku transaksi (read-only); fmState.balance sekadar cache */
    if(fmState.balance !== T.balance){ fmState.balance = T.balance; fmSaveState(fmState); }
    fmReconcileAchievements(basis);

    var balEl = document.getElementById('fmBalanceVal');
    if(balEl) balEl.textContent = (T.balance < 0 ? '−' : '') + Math.abs(Math.round(T.balance)).toLocaleString('id-ID');

    var target = fmGetNextTarget();
    var progressCard = document.getElementById('fmProgressCard');
    var targetLabel = document.getElementById('fmTargetLabel');
    var fill = document.getElementById('fmProgressFill');
    var pctEl = document.getElementById('fmProgressPct');
    var leftEl = document.getElementById('fmProgressLeft');

    if(target === null){
      if(progressCard) progressCard.style.display = 'none';
    } else {
      if(progressCard) progressCard.style.display = '';
      var pct = target > 0 ? Math.floor((basis / target) * 100) : 0;   /* AUDIT: floor — 99,6% tidak boleh tampil 100% sebelum tercapai */
      pct = Math.max(0, Math.min(100, pct));
      var left = Math.max(0, target - basis);

      if(targetLabel) targetLabel.textContent = fmFormatRp(target);
      if(fill) fill.style.width = pct + '%';
      if(pctEl) pctEl.textContent = pct + '%';
      if(leftEl) leftEl.textContent = fmFormatRp(left);
    }

    var historyList = document.getElementById('fmHistoryList');
    if(historyList){
      var html = '';
      var nextTarget = fmGetNextTarget();
      FM_MILESTONES.forEach(function(m, idx){
        var key = String(m);
        var achievedDate = fmState.achieved[key];
        var isNext = (m === nextTarget);
        var label = (m % 1000000 !== 0) ? fmFormatRp(m) : (m >= 1000000000 ? (m/1000000000) + ' Miliar' : (m/1000000) + ' Juta');
        var isRev = !!fmState.revoked[key];
        var redoBtn = isRev ? '<div class="fm-history-actions"><button type="button" class="fm-act fm-act-redo" data-fm-act="redo" data-ms="'+key+'">TANDAI TERCAPAI</button></div>' : '';
        var revNote = isRev ? '<span class="fm-note-revoked">Dibatalkan — saldo saat ini masih di atas target ini.</span>' : '';
        if(achievedDate){
          html += '<div class="fm-history-item fm-done" data-ms="'+key+'">' +
            '<div class="fm-history-icon">'+goalIco('check')+'</div>' +
            '<div class="fm-history-body"><div class="fm-history-amt">' + fmFormatRp(m) + (m>=1000000000?' — ' + label.toUpperCase():'') + '</div>' +
            '<div class="fm-history-sub">Tercapai · '+goalIco('calendar')+' ' + fmFormatDateFull(achievedDate) + '</div>' +
            '<div class="fm-history-actions">' +
              '<button type="button" class="fm-act fm-act-edit" data-fm-act="edit" data-ms="'+key+'" aria-label="Edit pencapaian '+fmFormatRp(m)+'">EDIT</button>' +
              '<button type="button" class="fm-act fm-act-undo" data-fm-act="undo" data-ms="'+key+'" aria-label="Batalkan pencapaian '+fmFormatRp(m)+'">BATALKAN</button>' +
            '</div></div>' +
          '</div>';
        } else if(isNext){
          html += '<div class="fm-history-item fm-active" data-ms="'+key+'">' +
            '<div class="fm-history-icon">'+goalIco('refresh')+'</div>' +
            '<div class="fm-history-body"><div class="fm-history-amt">' + fmFormatRp(m) + '</div>' +
            '<div class="fm-history-sub">Sedang dikejar'+revNote+'</div>'+redoBtn+'</div>' +
          '</div>';
        } else {
          html += '<div class="fm-history-item" data-ms="'+key+'">' +
            '<div class="fm-history-icon">'+goalIco('lock')+'</div>' +
            '<div class="fm-history-body"><div class="fm-history-amt">' + fmFormatRp(m) + '</div>' +
            '<div class="fm-history-sub">Belum tercapai'+revNote+'</div>'+redoBtn+'</div>' +
          '</div>';
        }
      });
      historyList.innerHTML = html;
    }
  }


  /* ═══ AKSI RIWAYAT PENCAPAIAN: EDIT TANGGAL · BATALKAN (UNDO) · TANDAI LAGI ═══
     Target (daftar FM_MILESTONES) TIDAK PERNAH dihapus — hanya statusnya yang berubah:
     BELUM TERCAPAI → TERCAPAI → BELUM TERCAPAI (reversibel). Semua angka UI dihitung ulang lewat fmRender(). */
  var fmDlgEl = null;
  function fmDlgClose(fromNav){
    if(!fmDlgEl || !fmDlgEl.classList.contains('open')) return;
    fmDlgEl.classList.remove('open');
    if(!fromNav && window.MCFA_NAV) MCFA_NAV.drop('fmdlg');
  }
  function fmDlgOpen(html){
    if(!fmDlgEl){
      fmDlgEl = document.createElement('div');
      fmDlgEl.className = 'fm-dlg';
      fmDlgEl.innerHTML = '<div class="fm-dlg-box" role="dialog" aria-modal="true"></div>';
      fmDlgEl.addEventListener('click', function(e){ if(e.target === fmDlgEl) fmDlgClose(); });
      document.body.appendChild(fmDlgEl);
    }
    fmDlgEl.firstChild.innerHTML = html;
    if(!fmDlgEl.classList.contains('open')){
      fmDlgEl.classList.add('open');
      if(window.MCFA_NAV) MCFA_NAV.push('fmdlg', function(){ fmDlgClose(true); });   // Back HP menutup dialog
    }
    return fmDlgEl.firstChild;
  }
  function fmIsoValid(s){
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||''));
    if(!m) return false;
    var d = new Date(+m[1], +m[2]-1, +m[3]);
    return d.getFullYear()===+m[1] && d.getMonth()===+m[2]-1 && d.getDate()===+m[3];
  }
  function fmUndo(key){
    var m = parseInt(key, 10), prevA = fmState.achieved[key], prevR = fmState.revoked[key];
    delete fmState.achieved[key];                              // status & tanggal tercapai dihapus
    if(finTotals().income >= m) fmState.revoked[key] = true;  // cegah tanda otomatis langsung kembali
    if(!fmSaveState(fmState)){
      if(prevA) fmState.achieved[key] = prevA;
      if(prevR) fmState.revoked[key] = prevR; else delete fmState.revoked[key];
      showNotif('Gagal menyimpan. Pencapaian belum dibatalkan.');
      return false;
    }
    fmRender();                                                // progress, target, riwayat dihitung ulang
    showNotif('Pencapaian ' + fmFormatRp(m) + ' dibatalkan.');
    return true;
  }
  function fmRedo(key){
    var m = parseInt(key, 10), prevR = fmState.revoked[key];
    delete fmState.revoked[key];
    fmState.achieved[key] = fmTodayIso();
    if(!fmSaveState(fmState)){
      delete fmState.achieved[key]; if(prevR) fmState.revoked[key] = prevR;
      showNotif('Gagal menyimpan. Coba lagi.');
      return false;
    }
    fmRender();
    showNotif('Pencapaian ' + fmFormatRp(m) + ' ditandai tercapai.');
    return true;
  }
  function fmSetDate(key, iso){
    if(!fmIsoValid(iso)){ showNotif('Tanggal tidak valid.'); return false; }
    var prev = fmState.achieved[key];
    fmState.achieved[key] = iso;
    if(!fmSaveState(fmState)){ fmState.achieved[key] = prev; showNotif('Gagal menyimpan tanggal. Coba lagi.'); return false; }
    fmRender();
    showNotif('Tanggal pencapaian diperbarui.');
    return true;
  }
  function fmConfirmUndo(key){
    var m = parseInt(key, 10);
    var box = fmDlgOpen(
      '<div class="fm-dlg-title">Batalkan pencapaian ini?</div>' +
      '<div class="fm-dlg-text"><b>' + fmFormatRp(m) + '</b> akan kembali menjadi <b>BELUM TERCAPAI</b> dan tanggal tercapainya dihapus. ' +
      'Target tetap ada, progress dihitung ulang otomatis. Kamu bisa menandainya lagi kapan saja.</div>' +
      '<div class="fm-dlg-row"><button type="button" class="fm-dlg-btn" data-d="no">Kembali</button><button type="button" class="fm-dlg-btn dng" data-d="yes">Ya, batalkan</button></div>');
    box.querySelector('[data-d="no"]').onclick = function(){ fmDlgClose(); };
    box.querySelector('[data-d="yes"]').onclick = function(){ fmUndo(key); fmDlgClose(); };
  }
  function fmEditDlg(key){
    var m = parseInt(key, 10), cur = fmState.achieved[key] || fmTodayIso();
    var box = fmDlgOpen(
      '<div class="fm-dlg-title">Edit pencapaian</div>' +
      '<div class="fm-dlg-text"><b>' + fmFormatRp(m) + '</b> — koreksi tanggal tercapai bila salah input.</div>' +
      '<input type="date" class="fm-dlg-input" id="fmDlgDate" value="' + cur + '" max="' + fmTodayIso() + '" aria-label="Tanggal tercapai">' +
      '<div class="fm-dlg-row"><button type="button" class="fm-dlg-btn" data-d="no">Batal</button><button type="button" class="fm-dlg-btn pri" data-d="save">Simpan tanggal</button></div>' +
      '<button type="button" class="fm-dlg-link" data-d="undo">Batalkan pencapaian ini</button>');
    box.querySelector('[data-d="no"]').onclick = function(){ fmDlgClose(); };
    box.querySelector('[data-d="save"]').onclick = function(){ if(fmSetDate(key, box.querySelector('#fmDlgDate').value)) fmDlgClose(); };
    box.querySelector('[data-d="undo"]').onclick = function(){ fmConfirmUndo(key); };
  }
  function fmBindActions(){
    var list = document.getElementById('fmHistoryList');
    if(!list || list._fmBound) return;
    list._fmBound = true;
    list.addEventListener('click', function(e){
      var b = e.target.closest('[data-fm-act]'); if(!b) return;
      var act = b.getAttribute('data-fm-act'), key = b.getAttribute('data-ms');
      if(act === 'edit') fmEditDlg(key);
      else if(act === 'undo') fmConfirmUndo(key);
      else if(act === 'redo') fmRedo(key);
    });
  }

  function fmInit(){
    fmBindActions();
    fmRender();
    window.addEventListener('storage', function(e){ if(!e || !e.key || e.key === FIN_LEDGER_KEY || e.key === FM_KEY){ fmState = fmLoadState(); fmRender(); } });
  }

  window.MCFA_FM = {state:function(){ return fmState; }, save:function(){ return fmSaveState(fmState); }, render:fmRender};
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', fmInit);
  } else {
    fmInit();
  }
})();
