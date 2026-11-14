// ═══ SPLASH — penutupan DIJAMIN, tidak bergantung pada canvas ═══
// Pemasangan timer & tap-to-skip dilakukan PERTAMA, sebelum kode canvas apa pun,
// sehingga kegagalan canvas/context tidak pernah membuat splash tertahan selamanya.
(function(){
  function closeSplash(ms){
    var splash = document.getElementById('splashScreen');
    if(!splash) return;
    try{ splash.style.animation = 'splashOut ' + (ms/1000) + 's ease forwards'; }catch(e){}
    splash.style.opacity = '0';
    splash.style.pointerEvents = 'none';
    setTimeout(function(){ if(splash.parentNode) splash.parentNode.removeChild(splash); }, ms);
  }
  // Auto dismiss (4.5 detik)
  setTimeout(function(){ closeSplash(700); }, 4500);
  // Tap splash untuk melewati
  var el = document.getElementById('splashScreen');
  if(el) el.addEventListener('click', function(){ closeSplash(400); });
})();

// ═══ SPLASH PARTICLE CANVAS (opsional — hanya animasi latar) ═══
(function(){
  try{
    var canvas = document.getElementById('splashCanvas');
    if(!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if(!ctx) return;
    var stars = [];
    function resize(){
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    for(var i=0;i<80;i++){
      stars.push({
        x: Math.random()*window.innerWidth,
        y: Math.random()*window.innerHeight,
        r: Math.random()*1.5+0.3,
        a: Math.random(),
        da: (Math.random()-0.5)*0.012,
        vy: -(Math.random()*0.3+0.05),
        gold: Math.random()<0.30
      });
    }
    function drawStars(){
      try{
        if(document.hidden){ if(document.getElementById('splashScreen')) requestAnimationFrame(drawStars); return; }
        ctx.clearRect(0,0,canvas.width,canvas.height);
        stars.forEach(function(s){
          s.a += s.da;
          if(s.a<=0){s.a=0;s.da=Math.abs(s.da);}
          if(s.a>=1){s.a=1;s.da=-Math.abs(s.da);}
          s.y += s.vy;
          if(s.y < -4) s.y = canvas.height+4;
          ctx.beginPath();
          ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
          ctx.fillStyle = s.gold ? 'rgba(253,200,80,'+s.a.toFixed(2)+')' : 'rgba(255,255,255,'+s.a.toFixed(2)+')';
          ctx.fill();
        });
        if(document.getElementById('splashScreen')) requestAnimationFrame(drawStars);
      }catch(e){ /* animasi berhenti diam-diam; splash tetap ditutup oleh timer */ }
    }
    drawStars();
  }catch(e){ /* canvas gagal → lanjut tanpa animasi partikel */ }
})();
