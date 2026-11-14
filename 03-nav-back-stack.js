(function(){
  var stack = [];            // [{layer,onBack,dead}] — cermin dari entri history buatan kita
  var ignore = 0;            // jumlah popstate yang sengaja ditimbulkan oleh kode sendiri
  var queue = [];            // operasi yang menunggu popstate "sengaja" selesai
  var ignoreTimer = null;
  var hasH = !!(window.history && history.pushState && history.go);
  try{ if(hasH) history.replaceState({mcfaNav:'root'}, ''); }catch(e){ hasH = false; }

  function flush(){ while(!ignore && queue.length){ var f = queue.shift(); try{ f(); }catch(e){ console.warn('[NAV]', e); } } }
  function run(fn){ if(ignore > 0) queue.push(fn); else fn(); }
  function armIgnore(){
    ignore++;
    clearTimeout(ignoreTimer);
    ignoreTimer = setTimeout(function(){ if(ignore>0){ ignore = 0; flush(); } }, 900); // pengaman bila popstate tak datang
  }

  /* daftarkan satu langkah/lapisan baru */
  function push(layer, onBack){
    if(!hasH) return;
    run(function(){
      stack.push({layer:layer, onBack:onBack, dead:false});
      try{ history.pushState({mcfaNav:layer, n:stack.length}, ''); }catch(e){ stack.pop(); }
    });
  }
  /* mundur satu langkah (sama persis dengan menekan Back HP) */
  function back(){
    if(!hasH) return;
    run(function(){ if(stack.length) history.back(); });
  }
  /* lapisan ditutup lewat UI (tombol X, dsb) → buang SEMUA entri miliknya tanpa memicu onBack */
  function drop(layer){
    if(!hasH) return;
    run(function(){
      var n = 0;
      while(stack.length && stack[stack.length-1].layer === layer){ stack.pop(); n++; }
      stack.forEach(function(s){ if(s.layer === layer) s.dead = true; }); // yang tertimbun: lewati diam-diam nanti
      if(n > 0){ armIgnore(); try{ history.go(-n); }catch(e){ ignore = 0; } }
    });
  }
  function top(){ for(var i=stack.length-1;i>=0;i--){ if(!stack[i].dead) return stack[i].layer; } return null; }
  function depth(layer){ var c=0; stack.forEach(function(s){ if(!s.dead && s.layer===layer) c++; }); return c; }

  window.addEventListener('popstate', function(ev){
    if(ignore > 0){ ignore = 0; clearTimeout(ignoreTimer); flush(); return; }
    var t = stack.pop();
    if(!t){
      /* entri basi (mis. setelah reload halaman): lewati diam-diam sampai entri awal */
      var st = ev && ev.state;
      if(st && st.mcfaNav && st.mcfaNav !== 'root'){ try{ history.back(); }catch(e){} }
      return;
    }
    if(t.dead){ try{ history.back(); }catch(e){} return; }
    try{ t.onBack(); }catch(e){ console.warn('[NAV] onBack gagal', e); }
  });

  window.MCFA_NAV = { push:push, back:back, drop:drop, top:top, depth:depth, has:function(l){ return depth(l) > 0; } };
})();
