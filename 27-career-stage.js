/* KARIER × TAHAP — setiap item masuk satu tahap (Platform masuk ketiganya dengan target tahap masing-masing).
   Progres hanya untuk item yang punya data (Platform = audiens di akun). Item lain tampil tanpa persentase: tidak ada data/centang baru. */
(function(){
  'use strict';
  var page = document.getElementById('page-karir'); if (!page) return;
  var MAP = {
    'platform-1':[1,2,3], 'platform-2':[1,2,3],
    'karir-2':[1], 'karya-1':[1], 'ilmu-1':[1], 'ilmu-6':[1], 'ilmu-7':[1],
    'karir-1':[2], 'karir-4':[2], 'ilmu-2':[2], 'ilmu-4':[2], 'ilmu-5':[2],
    'karir-3':[3], 'karya-2':[3], 'ilmu-3':[3]
  };
  var panels = [].slice.call(page.querySelectorAll('.kr-panel')), tabs = [].slice.call(page.querySelectorAll('.kr-tab')), cards = [];
  panels.forEach(function(p, pi){
    [].forEach.call(p.querySelectorAll('.vision-card'), function(c){
      if (c.closest && c.closest('#krTahap1Box')) return;
      var num = c.querySelector('.vc-num'), m = /^(karir|platform|karya|ilmu)\D*(\d+)/i.exec(((num && num.textContent) || '').trim());
      if (m) cards.push({el:c, pi:pi, key:m[1].toLowerCase()+'-'+(+m[2])});
    });
  });
  var cta = page.querySelector('.kr-karya-cta');

  function fmt(n){ return Number(n).toLocaleString('id-ID'); }
  function pctTxt(p){ return p.toLocaleString('id-ID',{maximumFractionDigits:1}); }
  /* rumus gabungan = MCFA_STUDIO.aggregate (satu sumber untuk Studio, Karier, modal akun) */
  function agg(ids, field, target, n){ var g = MCFA_STUDIO.aggregate(ids, n, field); return {pct: g.pct || 0, hit: g.hit, n: g.n}; }
  function row(name, a, target){
    return '<div class="tp-prow kr"><div class="tp-ptop"><span class="tp-pname">'+name+'</span><span class="tp-ppct">'+pctTxt(a.pct)+'%</span></div>'+
           '<div class="tp-ptrack"><div class="tp-pfill" style="width:'+Math.min(100,a.pct)+'%"></div></div>'+
           '<div class="tp-psub">'+a.hit+' / '+a.n+' akun capai '+fmt(target)+'</div></div>';
  }
  function render(n, def, el){
    var G = window.MCFA_TAHAP_GROUPS || {followers:[], subs:[]};
    el.innerHTML = row('Platform 01 · Followers TikTok', agg(G.followers, 'followers', def.tt, n), def.tt) +
                   row('Platform 02 · Subscriber YouTube', agg(G.subs, 'subs', def.yt, n), def.yt) +
                   '';
  }
  /* Kartu Platform 01/02 ikut tahap terpilih. Angka dibaca dari MCFA_TAHAP.def[n] (tt = followers, yt = subscriber)
     → Tahap 1: 500 Rb / 1 Juta · Tahap 2: 750 Rb / 1,5 Juta · Tahap 3: 1 Juta / 2 Juta. Tanpa tahap = teks target akhir semula. */
  function audTxt(v){ return v >= 1000000 ? (v/1000000).toLocaleString('id-ID',{maximumFractionDigits:1}) + ' Juta' : Math.round(v/1000).toLocaleString('id-ID') + ' Rb'; }
  function audBadge(v){ return audTxt(v).replace('Juta','JT').replace('Rb','RB').toUpperCase(); }
  function platCard(key){ for (var i = 0; i < cards.length; i++) if (cards[i].key === key) return cards[i].el; return null; }
  function setPlat(el, target, n, kind){
    if (!el) return;
    var num = el.querySelector('.vc-num'), ttl = el.querySelector('.vc-title'), dsc = el.querySelector('.vc-desc'), bdg = el.querySelectorAll('.vc-sub-item:not(.kr-live) .vc-sub-badge');
    var tn = ttl && ttl.lastChild && ttl.lastChild.nodeType === 3 ? ttl.lastChild : null;
    if (!el._plat) el._plat = {num: num && num.textContent, ttl: tn && tn.nodeValue, dsc: dsc && dsc.textContent, bdg: [].map.call(bdg, function(b){ return b.textContent; })};
    var o = el._plat;
    if (n === null){
      if (num) num.textContent = o.num; if (tn) tn.nodeValue = o.ttl; if (dsc) dsc.textContent = o.dsc;
      [].forEach.call(bdg, function(b, i){ if (o.bdg[i] != null) b.textContent = o.bdg[i]; });
      return;
    }
    var t = audTxt(target);
    if (num) num.textContent = o.num.replace(/\s*·\s*TAHAP\s*\d+$/i, '') + ' · TAHAP ' + n;
    if (kind === 'f'){
      if (tn) tn.nodeValue = ' ' + t + ' Pengikut Tiap Platform';
      if (dsc) dsc.textContent = 'Target Tahap ' + n + ': minimal ' + t.toLowerCase() + ' pengikut di masing-masing akun:';
      [].forEach.call(bdg, function(b){ b.textContent = audBadge(target) + ' PENGIKUT'; });
    } else {
      if (tn) tn.nodeValue = ' ' + t + ' Subscriber YouTube';
      if (dsc) dsc.textContent = 'Target Tahap ' + n + ': setiap channel YouTube mencapai ' + t.toLowerCase() + ' subscriber:';
      [].forEach.call(bdg, function(b){ b.textContent = audBadge(target) + ' SUBS'; });
    }
  }
  /* daftar akun di kartu Platform 01/02 = akun SOLO PROJECT penerima target (Persona/Kolaborasi tidak tampil) */
  var PL = {'platform-1':['followers','1 JT PENGIKUT'], 'platform-2':['subs','2 JT SUBS']};
  function rebuildLists(){
    var cur = MCFA_TAHAP.get(), n = cur === null ? MCFA_TAHAP.running() : cur, S = MCFA_STUDIO;   /* tanpa pilihan = tahap berjalan (bukan Tahap 1 tertulis langsung) */
    Object.keys(PL).forEach(function(k){
      var el = platCard(k), list = el && el.querySelector('.vc-sub-list'); if (!list) return;
      var field = PL[k][0], ids = S.members(field), hit = 0, sum = 0, tsum = 0;
      var rows = ids.map(function(id){
        var t = S.target(id, n, field), v = (_t1Load(id)[field] || 0), p = t > 0 ? Math.min(100, v / t * 100) : 0, ok = t > 0 && v >= t;
        if (ok) hit++; sum += Math.min(v, t); tsum += t;
        return '<div class="vc-sub-item kr-live'+(ok ? ' kr-ok' : '')+'" data-kr-open="'+id+'" role="button" tabindex="0" title="Buka akun untuk memperbarui angka">'+
               '<div class="vc-sub-dot"></div><div class="vc-sub-name">'+_escHtml(AKUN[id].name)+'<div class="kr-lv-bar"><i style="width:'+p+'%"></i></div></div>'+
               '<div class="vc-sub-badge">'+(ok ? '✓ ' : '')+fmt(v)+' / '+fmt(t)+' · '+pctTxt(p)+'%</div></div>';
      }).join('');
      var ag = S.aggregate(ids, n, field), avg = ag.pct || 0; hit = ag.hit;   /* ringkasan = agregat tunggal */
      list.innerHTML = ids.length ? rows + '<div class="kr-lv-sum">Tahap '+n+' · '+hit+' / '+ids.length+' akun mencapai target · progres gabungan '+pctTxt(avg)+'%</div>'
                                  : '<div class="vc-sub-item"><div class="vc-sub-dot"></div><div class="vc-sub-name">Belum ada akun dengan target untuk metrik ini</div></div>';
    });
    if (cur !== null) { try { applyTarget(cur); } catch(e){} }
  }
  function applyTarget(n){
    var d = n === null ? null : MCFA_TAHAP.def[n];
    setPlat(platCard('platform-1'), d && d.tt, n, 'f');
    setPlat(platCard('platform-2'), d && d.yt, n, 's');
  }
  function applyFilter(n){
    document.body.classList.toggle('tp-has', n !== null);
    try { applyTarget(n); } catch(e){ console.warn('[TAHAP] karir target', e); }
    var shown = {}, ctaOn = false;
    cards.forEach(function(c){
      var t = MAP[c.key], on = n !== null && (!t || t.indexOf(n) >= 0);
      c.el.classList.toggle('tp-off', !on);
      if (on) shown[c.pi] = true;
      if (c.key === 'karya-2' && on) ctaOn = true;
    });
    if (cta) cta.classList.toggle('tp-off', !ctaOn);
    tabs.forEach(function(t, i){ t.classList.toggle('tp-dim', n !== null && !shown[i] && i !== 3); });
    if (n === null) return;
    var act = tabs.map(function(t){ return t.classList.contains('active'); }).indexOf(true);
    if (act >= 0 && !shown[act] && act !== 3){
      for (var i = 0; i < panels.length; i++){ if (shown[i] || i === 3){ if (typeof window.switchKarirTab === 'function') window.switchKarirTab(i); break; } }
    }
  }
  function refresh(){
    var n = MCFA_TAHAP.get(); if (n === null) return;
    var el = document.querySelector('.tp-body[data-tp-body="karir"]');
    if (el) render(n, MCFA_TAHAP.def[n], el);
  }
  MCFA_TAHAP.register('karir', render);
  try { rebuildLists(); } catch(e){ console.warn('[TAHAP] daftar platform', e); }
  document.addEventListener('mcfa:data', function(){ try { rebuildLists(); } catch(e){} });
  window.addEventListener('storage', function(ev){ if (!ev.key || ev.key.indexOf('mcfa_tahap1_') === 0 || ev.key === 'mcfa_akun_hub_v1') { try { rebuildLists(); } catch(e){} } });
  window.addEventListener('focus', function(){ try { rebuildLists(); } catch(e){} });
  window.addEventListener('pageshow', function(){ try { rebuildLists(); } catch(e){} });
  /* ketuk baris akun di Karir → buka akun yang sama (satu sumber data; tidak ada input ganda di Karir) */
  page.addEventListener('click', function(e){ var r = e.target.closest && e.target.closest('[data-kr-open]'); if (r && typeof openAkun === 'function') openAkun(r.getAttribute('data-kr-open')); });
  page.addEventListener('keydown', function(e){ if (e.key !== 'Enter' && e.key !== ' ') return; var r = e.target.closest && e.target.closest('[data-kr-open]'); if (r && typeof openAkun === 'function'){ e.preventDefault(); openAkun(r.getAttribute('data-kr-open')); } });
  MCFA_TAHAP.onChange(function(){ try { rebuildLists(); } catch(e){} });
  MCFA_TAHAP.onChange(applyFilter);
  document.addEventListener('mcfa:data', refresh);
  window.addEventListener('storage', refresh);
})();
