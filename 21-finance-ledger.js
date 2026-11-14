(function(){
  'use strict';
  var KEY = 'fin_ledger_v1';
  var CAT = {in:['Gaji / Pekerjaan','Pendapatan Studio','Pendapatan KP.CIHUY','YouTube','TikTok','Lainnya'], out:['Kebutuhan Harian','Cicilan / Hutang','Keluarga','Transport','Tagihan','Lainnya']};
  var BLN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  var BLN_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  var FIN_START = (typeof MCFA_CORE!=='undefined' && MCFA_CORE.financeStart) || '2026-01-01';   /* awal periode resmi Keuangan (SSOT: MCFA_CORE.financeStart) */
  var L = null, type = 'in', flt = 'all', editId = null, month = '', year = '', kind = 'month', lastSig = '', lastAt = 0;
  var card = document.getElementById('lgCard'); if(!card) return;

  function today(){ return mcfaTodayIso(); }
  function rp(n){ return (n < 0 ? '−' : '') + 'Rp ' + Math.abs(Math.round(n)).toLocaleString('id-ID'); }
  function pad(n){ return (n<10?'0':'')+n; }
  /* kalender sesungguhnya: tanggal harus ada di kalender (mis. 2026-02-31 ditolak), tanpa perkiraan jumlah hari */
  function isDate(s){ if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false; if(typeof mcfaIsValidIso==='function') return mcfaIsValidIso(s); var y=+s.slice(0,4), m=+s.slice(5,7), d=+s.slice(8,10), x=new Date(Date.UTC(y,m-1,d)); return x.getUTCFullYear()===y && x.getUTCMonth()===m-1 && x.getUTCDate()===d; }
  function daysIn(y,m){ return new Date(Date.UTC(y,m,0)).getUTCDate(); }
  function dtxt(iso){ if(typeof formatDateUpper==='function' && typeof mcfaIsValidIso==='function' && mcfaIsValidIso(iso)) return formatDateUpper(iso); var a = iso.split('-'); return +a[2] + ' ' + BLN[+a[1]-1].toUpperCase() + ' ' + a[0]; }   /* SSOT format: formatDateUpper */
  function esc(t){ return String(t==null?'':t).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function fm(){ return window.MCFA_FM ? window.MCFA_FM.state() : null; }
  function net(list){ return list.reduce(function(a,t){ return a + (t.type==='in' ? t.amount : -t.amount); }, 0); }
  function load(){
    var o = null;
    try{ var r = localStorage.getItem(KEY); if(r) o = JSON.parse(r); }catch(e){ o = null; }
    var fresh = !(o && Array.isArray(o.tx));
    var base;
    if(fresh){ var f = fm(), ob = (f && !f.bd) ? Math.round(+f.balance || 0) : 0;   /* hanya saldo manual LAMA; angka turunan (bd) bukan uang baru */ base = {v:1, opening:ob, tx:[], deleted:[]}; }   /* saldo manual lama dibaca sebagai saldo awal → dimigrasi di bawah */
    else { base = o; if(typeof base.opening !== 'number') base.opening = 0; }
    if(!Array.isArray(base.invalid)) base.invalid = [];
    if(!Array.isArray(base.deleted)) base.deleted = [];
    /* Transaksi yang tidak lolos validasi TIDAK dibuang diam-diam: dipindah ke 'invalid' (perlu verifikasi), tidak dihitung ke saldo. */
    var good = [], seen = {}, seenSid = {};
    base.tx.forEach(function(t){
      var okTx = t && t.id && (t.type==='in'||t.type==='out') && Number.isSafeInteger(t.amount) && t.amount > 0 && isDate(t.date);
      if(!okTx){ if(t && typeof t === 'object'){ base.invalid.push(t); base._dirty = true; } return; }
      if(seen[t.id]) return;                        /* id sama persis = salinan yang sama */
      seen[t.id] = 1;
      if(t.source==='kehidupan' && t.sourceId){     /* satu sourceId tertaut = satu transaksi aktif; salinan lain ke riwayat dihapus */
        if(seenSid[t.sourceId]){ base.deleted.push(Object.assign({}, t, {status:'dihapus', deletedAt:new Date().toISOString(), reason:'duplikat-sumber'})); base._dirty = true; return; }
        seenSid[t.sourceId] = 1;
      }
      good.push(t);
    });
    base.tx = good;
    /* MIGRASI v2 (satu sumber data): "saldo awal" tidak lagi dipakai. Nilainya diubah menjadi satu transaksi "Saldo awal (migrasi)"
       sehingga Saldo = Total Pemasukan − Total Pengeluaran dan semua histori lama (termasuk koreksi saldo) tetap ada. */
    if(base.v !== 2){
      var op = Math.round(base.opening || 0);
      if(op !== 0 && !base.tx.some(function(t){ return t.id === 'tx_migrasi_saldo_awal'; })){
        base.tx.unshift({id:'tx_migrasi_saldo_awal', date:FIN_START, type: op > 0 ? 'in' : 'out', cat:'Lainnya', note:'Saldo awal (migrasi dari sistem lama)', amount:Math.abs(op), source:'migrasi', sourceId:'', status:'tercatat'});
      }
      base.openingMigrated = op; base.opening = 0; base.v = 2; base._dirty = true;
    }
    return base;
  }
  /* Tulis AMAN: simpan dulu, baru ganti keadaan memori. Gagal simpan → buku & saldo TIDAK berubah. */
  /* 20261110.8: sebelum SETIAP perubahan buku dibaca ulang dari penyimpanan, supaya transaksi yang dicatat di tab/jendela lain tidak hilang tertimpa salinan memori yang basi. */
  function fresh(){ var f = load(); f.tx.forEach(function(t){ if(t.cat==='Pendapatan K.P Cihuy') t.cat='Pendapatan KP.CIHUY'; }); return f; }
  function clone(){ try{ L = fresh(); }catch(e){} return JSON.parse(JSON.stringify(L)); }
  function commit(next){
    var dirty = next._dirty; delete next._dirty;
    try{ localStorage.setItem(KEY, JSON.stringify(next)); }catch(e){ if(dirty) next._dirty = true; return false; }
    L = next; return true;
  }
  /* Saldo/progres tidak pernah ditulis dari sini: semuanya diturunkan MCFA_FM.render() dari buku yang sudah tersimpan. */
  function syncBalance(){
    try{ if(window.MCFA_FM) window.MCFA_FM.render(); }catch(e){}
    try{ document.dispatchEvent(new Event('mcfa-ledger')); }catch(e){}
    return true;
  }
  function trash(next, t){ next.deleted.push(Object.assign({}, t, {status:'dihapus', deletedAt:new Date().toISOString()})); }
  function msg(ok, t){ var m = card.querySelector('.lg-msg'); m.style.color = ok ? '#15803d' : '#b91c1c'; m.textContent = t; }
  /* transaksi tertaut milik target Kehidupan: selama targetnya tercentang, pemiliknya adalah Kehidupan (batalkan centang di sana) */
  function goalOn(sid){
    if(!sid || String(sid).indexOf('KH-') !== 0) return false;
    try{ var S = JSON.parse(localStorage.getItem('fathul_light_v1') || '{}'); return S[String(sid).slice(3)] === true; }catch(e){ return false; }
  }
  var LOCK_MSG = 'Transaksi ini milik target Kehidupan. Batalkan centang targetnya di Kehidupan agar transaksinya ikut dibatalkan.';
  function uid(){ return 'tx_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  function build(){
    card.innerHTML =
      '<div class="lg-h">BUKU TRANSAKSI</div>'+
      '<div class="lg-per">Periode keuangan resmi: sejak '+dtxt(FIN_START)+'</div>'+
      '<div class="lg-seg"><button type="button" data-lp="month" class="on">Bulan</button><button type="button" data-lp="year">Tahun</button><button type="button" data-lp="all">Semua</button></div>'+
      '<input type="month" id="lgMonth" aria-label="Bulan"><select id="lgYear" aria-label="Tahun" style="display:none"></select>'+
      '<div class="lg-perlbl" id="lgPerLbl"></div>'+
      '<div class="lg-sum"><div><small id="lgOpenL">Saldo awal bulan</small><b id="lgOpen"></b></div><div><small id="lgCloseL">Saldo akhir bulan</small><b id="lgClose"></b></div>'+
      '<div class="lg-in"><small>Pemasukan</small><b id="lgInc"></b></div><div class="lg-out"><small>Pengeluaran</small><b id="lgExp"></b></div>'+
      '<div class="lg-net"><small>Selisih (pemasukan − pengeluaran)</small><b id="lgNet"></b></div></div>'+
      '<div class="lg-seg"><button type="button" data-lt="in" class="on">Pemasukan</button><button type="button" data-lt="out">Pengeluaran</button></div>'+
      '<input type="date" id="lgDate" aria-label="Tanggal transaksi">'+
      '<select id="lgCat" aria-label="Kategori"></select>'+
      '<select id="lgSrc" aria-label="Sumber"><option value="manual">Sumber: Manual</option><option value="studio">Sumber: Pendapatan M.C.F.A Studio (terverifikasi)</option><option value="kehidupan" disabled hidden>Sumber: Target Kehidupan</option></select>'+
      '<input type="text" id="lgSid" placeholder="ID sumber unik (mis. YT-2026-11-OKK)" style="display:none">'+
      '<input type="text" id="lgNote" placeholder="Keterangan" maxlength="120">'+
      '<input type="text" id="lgAmt" inputmode="numeric" placeholder="Nominal (Rp)" autocomplete="off">'+
      '<div style="display:flex;gap:8px;margin-top:6px"><button type="button" class="lg-btn main" id="lgSave">Simpan transaksi</button><button type="button" class="lg-btn" id="lgCancel" style="display:none">Batal edit</button></div>'+
      '<div class="lg-msg" role="status"></div>'+
      '<div class="lg-seg" id="lgFlt"><button type="button" data-lf="all" class="on">Semua</button><button type="button" data-lf="in">Histori Pemasukan</button><button type="button" data-lf="out">Histori Pengeluaran</button></div>'+
      '<div id="lgList"></div><div id="lgArch"></div><div id="lgInv"></div><div id="lgDel"></div>'+
      '<div class="lg-note">Subscriber, follower, dan jumlah konten bukan uang. Catat hanya pendapatan yang benar-benar sudah diterima. Saldo tidak bisa diketik manual: Saldo = total pemasukan − total pengeluaran, dan hanya berubah lewat transaksi yang berhasil disimpan. Belum terhubung otomatis ke rekening bank atau YouTube/TikTok; pencatatan tersimpan otomatis dan ikut cadangan.</div>';
    month = today().slice(0,7); year = today().slice(0,4);
    var qm = card.querySelector('#lgMonth'); qm.value = month; qm.min = FIN_START.slice(0,7); qm.max = today().slice(0,7);
    card.querySelector('#lgYear').innerHTML = yearsList().map(function(y){ return '<option value="'+y+'"'+(y===year?' selected':'')+'>'+y+'</option>'; }).join('');
    var qd = card.querySelector('#lgDate'); qd.value = today(); qd.min = FIN_START; qd.max = today();
    fillCats();
  }
  function fillCats(){ card.querySelector('#lgCat').innerHTML = CAT[type].map(function(c){ return '<option>'+esc(c)+'</option>'; }).join(''); }
  /* ── MESIN PERIODE ──
     Periode resmi mulai FIN_START. Transaksi sebelum FIN_START TIDAK dihapus: disimpan sebagai arsip dan nilainya
     masuk ke saldo awal periode (agar saldo tetap benar). Hari/bulan/tahun dihitung dari kalender sesungguhnya. */
  function rangeOf(k, v){
    var td = today(), from, to;
    if(k==='month'){ from = v+'-01'; to = v+'-'+pad(daysIn(+v.slice(0,4), +v.slice(5,7))); }
    else if(k==='year'){ from = v+'-01-01'; to = v+'-12-31'; }
    else if(k==='day'){ from = to = v; }
    else { from = FIN_START; to = td; }
    if(from < FIN_START) from = FIN_START;
    if(to > td) to = td;
    return {from:from, to:to};
  }
  function sumBy(list, ty){ return list.reduce(function(a,t){ return a + (t.type===ty ? t.amount : 0); }, 0); }
  function summary(k, v){
    var r = rangeOf(k, v), openP = L.opening + net(L.tx.filter(function(t){ return t.date < FIN_START; }));
    if(r.from > r.to) return {from:r.from, to:r.to, open:openP, inc:0, exp:0, net:0, close:openP, list:[], count:0};
    var before = L.tx.filter(function(t){ return t.date >= FIN_START && t.date < r.from; });
    var cur = L.tx.filter(function(t){ return t.date >= r.from && t.date <= r.to; });
    var inc = sumBy(cur,'in'), exp = sumBy(cur,'out'), open = openP + net(before);
    return {from:r.from, to:r.to, open:open, inc:inc, exp:exp, net:inc-exp, close:open+inc-exp, list:cur, count:cur.length};
  }
  function monthsList(){ var out = [], y = +FIN_START.slice(0,4), m = +FIN_START.slice(5,7), ty = +today().slice(0,4), tm = +today().slice(5,7);
    while(y < ty || (y === ty && m <= tm)){ out.push(y+'-'+pad(m)); m++; if(m>12){ m=1; y++; } } return out; }
  function yearsList(){ var out = [], y = +FIN_START.slice(0,4), ty = +today().slice(0,4); for(; y<=ty; y++) out.push(String(y)); return out; }
  function archived(){ return L.tx.filter(function(t){ return t.date < FIN_START; }); }
  function label(k, v, r){
    if(k==='month') return BLN_FULL[+v.slice(5,7)-1].toUpperCase() + ' ' + v.slice(0,4);
    if(k==='year') return 'TAHUN ' + v;
    return dtxt(r.from) + ' – ' + dtxt(r.to);
  }
  function curVal(){ return kind==='month' ? month : (kind==='year' ? year : ''); }
  function paint(){
    var S = summary(kind, curVal());
    var q = function(s){ return card.querySelector(s); };
    q('#lgPerLbl').textContent = label(kind, curVal(), S);
    q('#lgMonth').style.display = kind==='month' ? '' : 'none';
    q('#lgYear').style.display = kind==='year' ? '' : 'none';
    card.querySelectorAll('[data-lp]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-lp')===kind); });
    q('#lgOpenL').textContent = kind==='all' ? 'Saldo awal periode' : (kind==='year' ? 'Saldo awal tahun' : 'Saldo awal bulan');
    q('#lgCloseL').textContent = kind==='all' ? 'Saldo akhir (hari ini)' : (kind==='year' ? 'Saldo akhir tahun' : 'Saldo akhir bulan');
    q('#lgOpen').textContent = rp(S.open); q('#lgInc').textContent = rp(S.inc); q('#lgExp').textContent = rp(S.exp);
    q('#lgClose').textContent = rp(S.close); q('#lgNet').textContent = (S.net>0?'+':'') + rp(S.net);
    q('#lgNet').style.color = S.net>0 ? '#15803d' : (S.net<0 ? '#b91c1c' : 'inherit');
    card.querySelectorAll('[data-lf]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-lf')===flt); });
    var cur = S.list.filter(function(t){ return flt==='all' || t.type===flt; }).sort(function(a,b){ return a.date < b.date ? 1 : a.date > b.date ? -1 : (a.id < b.id ? 1 : -1); });
    var CAP = 200, shown = cur.slice(0, CAP);
    q('#lgList').innerHTML = (shown.length ? shown.map(function(t){
      return '<div class="lg-row" data-id="'+esc(t.id)+'"><div class="m"><b>'+esc(t.cat)+'</b><small>'+dtxt(t.date)+(t.note?' · '+esc(t.note):'')+(t.source==='studio'?' · Studio '+esc(t.sourceId):(t.source==='kehidupan'?' · Kehidupan':''))+'</small></div>'+
        '<div class="lg-amt '+(t.type==='in'?'i':'o')+'">'+(t.type==='in'?'+':'−')+rp(t.amount).replace('−','')+'</div>'+
        (t.source==='kehidupan' && goalOn(t.sourceId) ? '<button type="button" class="lg-act" data-a="locked" style="opacity:.65">TERTAUT</button>' : '<button type="button" class="lg-act" data-a="edit">EDIT</button><button type="button" class="lg-act" data-a="del">HAPUS</button>')+'</div>';
    }).join('') : '<div class="lg-note">Belum ada '+(flt==='in'?'pemasukan':(flt==='out'?'pengeluaran':'transaksi'))+' pada periode ini.</div>') + (cur.length>CAP ? '<div class="lg-note">Menampilkan '+CAP+' transaksi terbaru dari '+cur.length+'. Persempit periode untuk melihat yang lain.</div>' : '');
    var dl = (L.deleted||[]), dbox = q('#lgDel');
    dbox.innerHTML = dl.length ? '<details class="lg-arch"><summary>Riwayat dihapus · '+dl.length+' transaksi</summary><div class="lg-note">Tidak dihitung ke saldo, pemasukan, pengeluaran, maupun progres. Disimpan sebagai histori.</div>'+
      dl.slice(-50).reverse().map(function(t){ return '<div class="lg-row"><div class="m"><b>'+esc(t.cat)+'</b><small>'+dtxt(t.date)+(t.note?' · '+esc(t.note):'')+' · dihapus '+esc(String(t.deletedAt||'').slice(0,10))+'</small></div><div class="lg-amt '+(t.type==='in'?'i':'o')+'" style="text-decoration:line-through;opacity:.6">'+(t.type==='in'?'+':'−')+rp(t.amount).replace('−','')+'</div></div>'; }).join('')+'</details>' : '';
    var iv = L.invalid || [], ivb = q('#lgInv');
    ivb.innerHTML = iv.length ? '<details class="lg-arch"><summary>Perlu verifikasi · '+iv.length+' data tidak valid</summary><div class="lg-note">Data ini tidak lolos pemeriksaan (jenis, nominal, atau tanggal tidak sah). Tidak dihitung ke saldo dan tidak diubah atau dihapus otomatis.</div>'+
      iv.map(function(t){ return '<div class="lg-row"><div class="m"><b>'+esc(t.cat||'?')+'</b><small>tanggal: '+esc(String(t.date))+' · jenis: '+esc(String(t.type))+(t.note?' · '+esc(t.note):'')+'</small></div><div class="lg-amt">'+esc(String(t.amount))+'</div></div>'; }).join('')+'</details>' : '';
    var ar = archived(), box = q('#lgArch');
    box.innerHTML = ar.length ? '<details class="lg-arch"><summary>Arsip sebelum '+dtxt(FIN_START)+' · '+ar.length+' transaksi</summary><div class="lg-note">Tidak masuk periode resmi dan tidak dihapus. Nilai bersihnya ('+rp(net(ar))+') sudah terhitung di saldo awal periode.</div>'+
      ar.slice().sort(function(a,b){ return a.date < b.date ? 1 : -1; }).map(function(t){ return '<div class="lg-row"><div class="m"><b>'+esc(t.cat)+'</b><small>'+dtxt(t.date)+(t.note?' · '+esc(t.note):'')+'</small></div><div class="lg-amt '+(t.type==='in'?'i':'o')+'">'+(t.type==='in'?'+':'−')+rp(t.amount).replace('−','')+'</div></div>'; }).join('')+'</details>' : '';
  }
  /* API baca-saja untuk dashboard Keuangan (langkah berikutnya) — satu sumber hitungan */
  window.MCFA_FIN_LEDGER = {
    start: FIN_START,
    summary: function(k, v){ return summary(k, v); },
    months: monthsList, years: yearsList,
    byMonth: function(y){ return monthsList().filter(function(m){ return m.slice(0,4)===String(y); }).map(function(m){ var x = summary('month', m); return {month:m, inc:x.inc, exp:x.exp, net:x.net, open:x.open, close:x.close}; }); },
    count: function(){ return L ? L.tx.length : 0; },
    /* Pemeriksaan konsistensi buku (hanya baca): satu angka untuk satu informasi, tanpa ganda, tanpa yatim */
    selfCheck: function(){
      var is = [], ids = {}, sids = {}, st = {}, net0 = 0, fut = 0, orph = [];
      if(!L) return {ok:false, issues:['buku belum siap']};
      L.tx.forEach(function(t){
        if(ids[t.id]) is.push('id ganda: '+t.id); ids[t.id] = 1;
        if(!(t.type==='in'||t.type==='out')) is.push('jenis tidak sah: '+t.id);
        if(!Number.isSafeInteger(t.amount) || !(t.amount>0)) is.push('nominal tidak aman: '+t.id);
        if(!isDate(t.date)) is.push('tanggal tidak sah: '+t.id); else if(t.date > today()) fut++;
        if(t.source==='kehidupan'){ if(sids[t.sourceId]) is.push('sourceId tertaut ganda: '+t.sourceId); sids[t.sourceId] = 1; if(!goalOn(t.sourceId)) orph.push(t.sourceId); }
        if(t.source==='studio' && t.sourceId){ if(st[t.sourceId]) is.push('sourceId Studio ganda: '+t.sourceId); st[t.sourceId] = 1; }
        net0 += (t.type==='in' ? 1 : -1) * t.amount;
      });
      var T = window.MCFA_FIN_CALC.totals();
      if(T.balance !== net0) is.push('saldo ('+T.balance+') ≠ jumlah buku ('+net0+')');
      if(T.income - T.expense !== T.balance) is.push('saldo ≠ pemasukan − pengeluaran');
      if(T.count !== L.tx.length) is.push('jumlah transaksi aktif beda: '+T.count+' vs '+L.tx.length);
      if(!Number.isSafeInteger(T.income) || !Number.isSafeInteger(T.expense)) is.push('total melewati batas integer aman');
      var sm = summary('all','');
      if(fut === 0 && sm.close !== T.balance) is.push('saldo akhir periode ('+sm.close+') ≠ saldo total ('+T.balance+')');
      orph.forEach(function(x){ is.push('transaksi tertaut yatim (target tidak tercentang): '+x); });
      return {ok:is.length===0, issues:is, aktif:L.tx.length, dihapus:(L.deleted||[]).length, perluVerifikasi:(L.invalid||[]).length, bertanggalMasaDepan:fut};
    },
    totals: function(){ return window.MCFA_FIN_CALC.totals(); },   /* satu rumus: saldo = pemasukan aktif − pengeluaran aktif */
    /* transaksi tertaut dari bagian lain (mis. target Kehidupan): satu sourceId = satu transaksi, tidak pernah ganda */
    hasLinked: function(sid){ return !!(L && L.tx.some(function(t){ return t.source==='kehidupan' && t.sourceId===sid; })); },
    addLinked: function(o){
      if(!L) return {ok:false, msg:'Buku transaksi belum siap.'};
      var amt = o && o.amount, sid = o && o.sourceId, d = today();
      if(!Number.isSafeInteger(amt) || amt <= 0 || !sid) return {ok:false, msg:'Nominal tidak valid.'};
      if(d < FIN_START) return {ok:false, msg:'Periode keuangan belum dimulai.'};
      if(window.MCFA_FIN_LEDGER.hasLinked(sid)) return {ok:false, dup:true, msg:'Sudah tercatat sebelumnya.'};
      var next = clone();
      next.tx.push({id:uid(), date:d, type:'out', cat:'Lainnya', note:String(o.note||'').slice(0,120), amount:amt, source:'kehidupan', sourceId:sid, status:'tercatat'});
      if(!commit(next)) return {ok:false, msg:'Gagal menyimpan.'};
      syncBalance(); paint(); return {ok:true};
    },
    /* SINKRON TRANSAKSI TERTAUT (idempoten): spec = {amount,type,cat,note} → pastikan TEPAT SATU transaksi untuk sourceId ini (tambah / perbarui / hapus duplikat);
       spec = null → batalkan (pindah ke Riwayat dihapus, tidak dihitung saldo). Transaksi lain (manual/historis) tidak disentuh. */
    syncLinked: function(sid, spec){
      if(!L) return {ok:false, msg:'Buku transaksi belum siap.'};
      if(!sid) return {ok:false, msg:'ID sumber kosong.'};
      var cur = L.tx.filter(function(t){ return t.source==='kehidupan' && t.sourceId===sid; });
      if(!spec){
        if(!cur.length) return {ok:true, none:true};
        var nx = clone(); nx.tx = nx.tx.filter(function(t){ if(t.source==='kehidupan' && t.sourceId===sid){ trash(nx, t); return false; } return true; });
        if(!commit(nx)) return {ok:false, msg:'Gagal menghapus dari Keuangan.'};
        syncBalance(); paint(); return {ok:true, action:'remove'};
      }
      var amt = spec.amount, ty = spec.type==='in' ? 'in' : 'out', cat = CAT[ty].indexOf(spec.cat) >= 0 ? spec.cat : 'Lainnya', note = String(spec.note||'').slice(0,120);
      if(!Number.isSafeInteger(amt) || amt <= 0) return {ok:true, none:true};   /* tanpa nominal → tidak ada transaksi */
      var d = today(); if(!cur.length && d < FIN_START) return {ok:false, msg:'Periode keuangan belum dimulai.'};
      var next = clone(), act;
      if(!cur.length){ next.tx.push({id:uid(), date:d, type:ty, cat:cat, note:note, amount:amt, source:'kehidupan', sourceId:sid, status:'tercatat'}); act = 'add'; }
      else {
        var keep = cur[0], extra = cur.length > 1, same = keep.amount===amt && keep.type===ty && keep.cat===cat && keep.note===note;
        if(same && !extra) return {ok:true, same:true};
        var seen = false;
        next.tx = next.tx.filter(function(t){ if(t.source==='kehidupan' && t.sourceId===sid){ if(!seen){ seen = true; t.amount = amt; t.type = ty; t.cat = cat; t.note = note; return true; } trash(next, t); return false; } return true; });
        act = 'update';
      }
      if(!commit(next)) return {ok:false, msg:'Gagal menyimpan ke Keuangan.'};
      syncBalance(); paint(); return {ok:true, action:act};
    },
    removeLinked: function(sid){
      if(!L || !window.MCFA_FIN_LEDGER.hasLinked(sid)) return {ok:false, msg:'Tidak ada transaksi tertaut.'};
      var next = clone();
      next.tx = next.tx.filter(function(t){ if(t.source==='kehidupan' && t.sourceId===sid){ trash(next, t); return false; } return true; });
      if(!commit(next)) return {ok:false, msg:'Gagal menghapus.'};
      syncBalance(); paint(); return {ok:true};
    }
  };
  function resetForm(){
    editId = null; var q = function(s){ return card.querySelector(s); };
    q('#lgAmt').value=''; q('#lgNote').value=''; q('#lgSid').value=''; q('#lgSrc').value='manual'; q('#lgSid').style.display='none';
    q('#lgDate').value = today(); q('#lgSave').textContent='Simpan transaksi'; q('#lgCancel').style.display='none';
  }
  function setType(t){
    type = t; card.querySelectorAll('[data-lt]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-lt')===t); });
    var srcSel = card.querySelector('#lgSrc'); srcSel.options[1].disabled = (t!=='in'); if(t!=='in'){ srcSel.value='manual'; card.querySelector('#lgSid').style.display='none'; }
    fillCats();
  }
  function save(){
    var q = function(s){ return card.querySelector(s); };
    var amt = parseInt((q('#lgAmt').value||'').replace(/\D/g,''),10), date = q('#lgDate').value, src = q('#lgSrc').value, sid = q('#lgSid').value.trim();
    if(!Number.isSafeInteger(amt) || amt > 999999999999){ msg(false,'Nominal terlalu besar (maksimal Rp 999.999.999.999).'); return; }
    if(!(amt > 0)){ msg(false,'Nominal harus lebih dari 0.'); return; }
    if(!isDate(date) || date > today()){ msg(false,'Tanggal tidak valid atau di masa depan.'); return; }
    if(date < FIN_START){ msg(false,'Periode keuangan dimulai '+dtxt(FIN_START)+'. Tanggal sebelum itu tidak dicatat.'); return; }
    var cat = src==='studio' ? 'Pendapatan Studio' : q('#lgCat').value;
    if(src==='studio'){
      if(!sid){ msg(false,'ID sumber wajib untuk pendapatan Studio.'); return; }
      if(L.tx.some(function(t){ return t.sourceId===sid && t.id!==editId; })){ msg(false,'ID sumber "'+sid+'" sudah tercatat — tidak dicatat ganda.'); return; }
    }
    var sig = [type,date,amt,cat,q('#lgNote').value,sid].join('|'), now = Date.now();
    if(!editId && sig===lastSig && now-lastAt < 3000){ msg(false,'Transaksi yang sama baru saja dicatat.'); return; }
    var rec = {id: editId || uid(), date:date, type:type, cat:cat, note:q('#lgNote').value.trim(), amount:amt, source:src, sourceId: (src==='studio'||src==='kehidupan')?sid:'', status:'tercatat'};
    if(editId){ var old = L.tx.filter(function(t){ return t.id===editId; })[0]; if(old && (old.source==='migrasi' || old.source==='koreksi')){ rec.source = old.source; rec.sourceId = old.sourceId || ''; } }
    var next = clone();
    if(editId){ next.tx = next.tx.map(function(t){ return t.id===editId ? rec : t; }); } else { next.tx.push(rec); }
    if(!commit(next)){ msg(false,'Gagal menyimpan. Transaksi TIDAK tercatat dan saldo tidak berubah.'); return; }
    syncBalance();
    lastSig = sig; lastAt = now; month = date.slice(0,7); year = date.slice(0,4); q('#lgMonth').value = month; q('#lgYear').value = year;
    msg(true, editId ? '✓ Transaksi diperbarui — saldo & progres dihitung ulang.' : '✓ Transaksi tersimpan — saldo & progres diperbarui.'); resetForm(); paint();
  }
  function onList(e){
    var b = e.target.closest('[data-a]'); if(!b) return;
    var id = b.closest('.lg-row').getAttribute('data-id'), t = L.tx.filter(function(x){ return x.id===id; })[0]; if(!t) return;
    if(b.getAttribute('data-a')==='locked' || (t.source==='kehidupan' && goalOn(t.sourceId))){ msg(false, LOCK_MSG); return; }
    if(b.getAttribute('data-a')==='del'){
      if(!confirm('Hapus transaksi '+rp(t.amount)+' ('+t.cat+')? Saldo'+(t.type==='in'?' dan progres target':'')+' akan dihitung ulang.')) return;
      var next = clone(); next.tx = next.tx.filter(function(x){ if(x.id===id){ trash(next, x); return false; } return true; });
      if(!commit(next)){ msg(false,'Gagal menghapus. Saldo tidak berubah.'); return; }
      syncBalance();
      msg(true,'✓ Transaksi dihapus — saldo'+(t.type==='in'?' dan progres':'')+' dihitung ulang.'); if(editId===id) resetForm(); paint();
    } else {
      editId = id; setType(t.type);
      var q = function(s){ return card.querySelector(s); };
      q('#lgCat').value = t.cat; q('#lgDate').value = t.date; q('#lgNote').value = t.note; q('#lgAmt').value = String(t.amount).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
      q('#lgSrc').value = t.source; q('#lgSid').value = t.sourceId; q('#lgSid').style.display = t.source==='studio' ? '' : 'none';
      q('#lgSave').textContent='Simpan perubahan'; q('#lgCancel').style.display=''; card.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }
  function init(){
    L = load(); L.tx.forEach(function(t){ if(t.cat==='Pendapatan K.P Cihuy') t.cat='Pendapatan KP.CIHUY'; });
    if(L._dirty){ var mig = JSON.parse(JSON.stringify(L)); if(!commit(mig)) console.warn('[KEUANGAN] migrasi buku belum tersimpan; hitungan tetap konsisten (dibaca dari format lama).'); }
    build(); paint();
    syncBalance();   /* saldo & progres selalu diturunkan dari buku transaksi */
    window.addEventListener('storage', function(e){ if(e && e.key && e.key !== KEY) return; try{ L = fresh(); paint(); syncBalance(); }catch(x){} });
    card.addEventListener('click', function(e){
      var s = e.target.closest('[data-lt]'); if(s){ setType(s.getAttribute('data-lt')); return; }
      var lf = e.target.closest('[data-lf]'); if(lf){ flt = lf.getAttribute('data-lf'); paint(); return; }
      var pb = e.target.closest('[data-lp]'); if(pb){ kind = pb.getAttribute('data-lp'); paint(); return; }
      if(e.target.id==='lgSave'){ save(); return; }
      if(e.target.id==='lgCancel'){ resetForm(); msg(true,''); return; }
      onList(e);
    });
    card.addEventListener('change', function(e){
      if(e.target.id==='lgMonth' && /^\d{4}-\d{2}$/.test(e.target.value)){ month = e.target.value < FIN_START.slice(0,7) ? FIN_START.slice(0,7) : e.target.value; e.target.value = month; paint(); }
      if(e.target.id==='lgYear'){ year = e.target.value; paint(); }
      if(e.target.id==='lgSrc'){ var st = e.target.value==='studio'; card.querySelector('#lgSid').style.display = st ? '' : 'none'; }
    });
    card.addEventListener('input', function(e){
      if(e.target.id==='lgAmt'){ var v = e.target.value.replace(/\D/g,''); e.target.value = v.replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
