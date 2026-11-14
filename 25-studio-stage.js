/* STUDIO × TAHAP — dashboard ringkas. Semua angka lewat MCFA_STUDIO (satu sumber): konten dari Sistem Posting (Sudah Upload, unik per ID),
   followers/subscribers dari data akun. Satu panel detail aktif; draf input tidak hilang saat render ulang. */
(function(){
  'use strict';
  var S = window.MCFA_STUDIO, openId = null, drafts = {}, timer = null;
  /* daftar penerima target dibaca langsung dari kategori akun (getter), bukan salinan beku — ikut berubah saat akun dipindah kategori */
  window.MCFA_TAHAP_GROUPS = Object.freeze(Object.defineProperties({}, {followers:{enumerable:true, get:function(){ return S.members('followers'); }}, subs:{enumerable:true, get:function(){ return S.members('subs'); }}}));
  var LBL = {konten:['KONTEN','K'], followers:['FOLLOWERS','F'], subs:['SUBSCRIBERS','S']};
  function esc(v){ return typeof _escHtml === 'function' ? _escHtml(v) : String(v); }
  /* rumus gabungan = MCFA_STUDIO.aggregate (satu sumber; persen dibatasi per akun, sama dengan halaman Karier) */
  function tot(ids,n,m){ var g = S.aggregate(ids,n,m); return {a:g.actual, t:g.target, p:g.pct}; }
  function card(m,t){
    return '<div class="sm-card"><small>'+LBL[m][0]+'</small>'+(t.p === null ? '<b class="sm-na">—</b>' : '<b>'+S.fpct(t.p)+'</b>')+
      '<div class="sm-bar"><i style="width:'+Math.min(100,t.p||0)+'%"></i></div><span>'+S.fnum(t.a)+'</span><em>'+(t.t > 0 ? '/ '+S.fnum(t.t) : 'target belum ditentukan')+'</em></div>';
  }
  function chip(id,n,m){
    if(!S.hasTarget(id)){ var av = S.actual(id,n,m); return '<span class="sm-chip na"><b>'+LBL[m][1]+'</b>'+(av > 0 ? S.fnum(av) : '—')+'</span>'; }
    if(!S.applies(id,m,n)){ var a2 = (m === 'konten') ? S.actual(id,n,m) : 0; return '<span class="sm-chip na"><b>'+LBL[m][1]+'</b>'+(a2 > 0 ? S.fnum(a2) : '—')+'</span>'; }
    var p = S.pct(S.actual(id,n,m), S.target(id,n,m));
    return '<span class="sm-chip"><b>'+LBL[m][1]+'</b>'+(p === null ? '—' : S.fpct(p))+'</span>';
  }
  function detail(id,n){
    var h = '<div class="sm-detail">';
    S.metrics.forEach(function(m){
      var a = S.actual(id,n,m), t = S.target(id,n,m), p = S.pct(a,t);
      if(!S.hasTarget(id) || (m === 'konten' && !S.kontenTarget(id))){ h += '<div class="sm-m"><div class="sm-mt"><b>'+LBL[m][0]+'</b><span>'+S.fnum(a)+' · dicatat, tanpa target</span></div></div>'; return; }
      h += '<div class="sm-m"><div class="sm-mt"><b>'+LBL[m][0]+'</b><span>'+S.fnum(a)+' / '+S.fnum(t)+' · '+S.fpct(p)+'</span></div><div class="sm-bar"><i style="width:'+Math.min(100,p||0)+'%"></i></div></div>';
    });
    return h + S.form(id,n,'st') + '<button type="button" class="sm-link" data-open="'+id+'">Jadwal &amp; riwayat konten →</button></div>';
  }
  function render(n, def, el){
    var ids = Object.keys(AKUN), act = document.activeElement, actId = act && act.id && el.contains(act) ? act.id : null, caret = actId ? act.selectionStart : null;
    var h = '<div class="sm-cards">'+S.metrics.map(function(m){ return card(m, tot(ids,n,m)); }).join('')+'</div>'+
      '<div class="sm-list">';
    ids.forEach(function(id){
      var d = AKUN[id];
      h += '<button type="button" class="sm-row'+(openId === id ? ' open' : '')+'" data-acc="'+id+'" aria-expanded="'+(openId === id)+'"><span class="sm-name"><i style="background:'+(d.color||'#1a56db')+'"></i>'+esc(d.name)+'</span>'+
        S.metrics.map(function(m){ return chip(id,n,m); }).join('')+'</button>';
      if(openId === id) h += detail(id,n);
    });
    el.innerHTML = h + '</div>';
    Object.keys(drafts).forEach(function(k){ var i = document.getElementById(k); if(i && el.contains(i)) i.value = drafts[k]; });
    if(actId){ var f = document.getElementById(actId); if(f){ f.focus(); try{ f.setSelectionRange(caret,caret); }catch(e){} } }
  }
  function body(){ return document.querySelector('.tp-body[data-tp-body="identitas"]'); }
  function refresh(){ var n = MCFA_TAHAP.get(), el = body(); if(n !== null && el) render(n, MCFA_TAHAP.def[n], el); }
  S.rerender = refresh;
  S.onSaved = function(id){ Object.keys(drafts).forEach(function(k){ if(/^st-/.test(k) && k.slice(-id.length-1) === '-'+id) delete drafts[k]; }); };
  MCFA_TAHAP.register('identitas', render);
  /* modal akun yang sedang terbuka ikut tahap yang dipilih (bagian "Fokus TAHAP n") */
  MCFA_TAHAP.onChange(function(){ try{ if(typeof _curAkunId !== 'undefined' && _curAkunId && document.getElementById('t1-box-'+_curAkunId)) _renderTahap1(_curAkunId); }catch(e){ console.warn('[TAHAP] modal akun', e); } });
  document.addEventListener('click', function(e){
    var t = e.target, row = t.closest && t.closest('.sm-row'), lnk = t.closest && t.closest('[data-open]');
    if(lnk){ if(typeof openAkun === 'function') openAkun(lnk.getAttribute('data-open')); return; }
    if(row && row.closest('.tp-body[data-tp-body="identitas"]')){ var id = row.getAttribute('data-acc'); openId = (openId === id) ? null : id; refresh(); }
  });
  document.addEventListener('input', function(e){
    var i = e.target; if(!i || !/^st-/.test(i.id || '')) return; drafts[i.id] = i.value;
    var id = i.id.replace(/^st-[a-z]+-/,''); delete S.msgs[id];
  });
  document.addEventListener('focusout', function(e){
    var i = e.target; if(!i || !/^st-/.test(i.id || '')) return; var r = S.parse(i.value);
    if(r.v !== undefined){ i.value = S.fnum(r.v); drafts[i.id] = i.value; }
  });
  function later(){ clearTimeout(timer); timer = setTimeout(refresh, 60); }
  document.addEventListener('mcfa:data', later);
  window.addEventListener('storage', later);
})();
