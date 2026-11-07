/* AKTIVITAS × TAHAP — progres saja, otomatis dari checklist yang sudah ada (tanpa data/centang baru).
   Aktivitas Sehari-hari: item harian × hari di jendela tahap. */
(function(){
  'use strict';
  function pctText(done,total){ var p = total>0 ? done/total*100 : 0; return p.toLocaleString('id-ID',{maximumFractionDigits:1}); }
  function fmt(n){ return Number(n).toLocaleString('id-ID'); }

  function harian(def){
    var keys = {}, items = 0;
    document.querySelectorAll('#body-harian .ba-item:not(.ba-prod-item)').forEach(function(el, i){ keys[el.dataset.bk || ('item_'+i)] = 1; items++; });
    var s = mcfaParse(def.start), e = mcfaParse(def.end), done = 0;
    try{
      for (var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i), m = /^ba_(\d+)_(\d+)_(\d+)$/.exec(k||''); if (!m) continue;
        var d = new Date(+m[1], +m[2]-1, +m[3]); if (d<s || d>e) continue;
        var rec = JSON.parse(localStorage.getItem(k)||'{}'), c = rec.checks||{};
        Object.keys(c).forEach(function(key){ if (keys[key] && c[key]===true) done++; });
      }
    }catch(err){}
    return {done:done, total:items*mcfaDaysInclusive(def.start, def.end)};
  }
  function row(cls, name, r){
    var p = pctText(r.done, r.total), w = r.total>0 ? Math.min(100, r.done/r.total*100) : 0;
    return '<div class="tp-prow '+cls+'"><div class="tp-ptop"><span class="tp-pname">'+name+'</span><span class="tp-ppct">'+p+'%</span></div>'+
           '<div class="tp-ptrack"><div class="tp-pfill" style="width:'+w+'%"></div></div>'+
           '<div class="tp-psub">'+fmt(r.done)+' / '+fmt(r.total)+' item</div></div>';
  }
  function render(n, def, el){
    var h = '';
    h += row('hr', 'Aktivitas Sehari-hari', harian(def));
    el.innerHTML = h;
  }
  function refresh(){
    var n = MCFA_TAHAP.get(); if (n === null) return;
    var el = document.querySelector('.tp-body[data-tp-body="aktivitas"]');
    if (el) render(n, MCFA_TAHAP.def[n], el);
  }
  MCFA_TAHAP.register('aktivitas', render);
  MCFA_TAHAP.onChange(function(n){ document.body.classList.toggle('tp-has', n !== null); document.body.classList.toggle('tp-stage1', n === 1); });
  /* progres ikut berubah saat checklist diubah / direset */
  var page = document.getElementById('blueprintAktivitas');
  if (page){
    ['click','change'].forEach(function(t){ page.addEventListener(t, function(){ setTimeout(refresh, 150); }, true); });
  }
  window.addEventListener('storage', refresh);
})();
