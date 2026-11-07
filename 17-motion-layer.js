(function MOTION_LAYER(){

  var _reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Ambient Background Blobs ── */
  function injectAmbient(){
    if(_reduced) return;
    if(document.querySelector('.ambient-bg-layer')) return;
    var layer = document.createElement('div');
    layer.className = 'ambient-bg-layer';
    layer.innerHTML =
      '<div class="ambient-orb o1"></div>'+
      '<div class="ambient-orb o2"></div>'+
      '<div class="ambient-orb o3"></div>';
    document.body.insertBefore(layer, document.body.firstChild);
  }
  injectAmbient();

  /* ── 2. Floating Sparkles in Hero/Banner/Grand/Manifesto ── */
  function spawnSparkles(container, count, gold){
    if(!container || container.dataset.sparked) return;
    container.dataset.sparked = '1';
    for(var i=0;i<count;i++){
      var s = document.createElement('div');
      s.className = 'section-spark' + (gold ? ' gold' : '');
      var left = 6 + Math.random()*86;
      var size = 2 + Math.random()*3.2;
      var dur  = 5 + Math.random()*5;
      var delay = Math.random()*6;
      var drift = (Math.random()*44-22).toFixed(0)+'px';
      var bottom = Math.random()*68;
      s.style.cssText =
        'left:'+left.toFixed(1)+'%;bottom:'+bottom.toFixed(1)+'%;'+
        'width:'+size.toFixed(1)+'px;height:'+size.toFixed(1)+'px;'+
        'animation-duration:'+dur.toFixed(2)+'s;animation-delay:'+delay.toFixed(2)+'s;'+
        '--sx:'+drift+';';
      container.appendChild(s);
    }
  }
  if(!_reduced){
    spawnSparkles(document.querySelector('.hero-card'), 5, false);
    spawnSparkles(document.querySelector('.project-banner'), 6, false);
    spawnSparkles(document.querySelector('.grand'), 5, true);
    spawnSparkles(document.querySelector('.bp-manifesto'), 4, false);
  }

  /* ── 3. Card Tilt-on-Pointer (mu-card) ── */
  function attachTilt(el, maxTilt){
    if(!el || el.dataset.tilt) return;
    el.dataset.tilt = '1';
    function onMove(e){
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      var rx = (py - 0.5) * -maxTilt;
      var ry = (px - 0.5) * maxTilt;
      el.style.transform = 'perspective(720px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg)';
    }
    function reset(){
      el.classList.remove('tilting');
      el.style.transform = '';
    }
    el.addEventListener('pointerenter', function(){ el.classList.add('tilting'); });
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('pointerup', reset);
    el.addEventListener('pointercancel', reset);
  }
  function bindTilts(){
    document.querySelectorAll('.mu-card').forEach(function(el){ attachTilt(el, 9); });
  }
  bindTilts();
  (function(){
    var _rafId = null;
    new MutationObserver(function(){
      if(_rafId) return;
      _rafId = requestAnimationFrame(function(){ _rafId = null; bindTilts(); });
    }).observe(document.body, {childList:true, subtree:true});
  })();

  /* ── 4. Magnetic Spotlight — Enter Button ── */
  var enterBtn = document.querySelector('.i-enter-btn');
  if(enterBtn){
    enterBtn.addEventListener('pointermove', function(e){
      var r = enterBtn.getBoundingClientRect();
      var mx = ((e.clientX - r.left)/r.width*100).toFixed(1)+'%';
      var my = ((e.clientY - r.top)/r.height*100).toFixed(1)+'%';
      enterBtn.style.setProperty('--mx', mx);
      enterBtn.style.setProperty('--my', my);
    });
  }

  /* ── 5. Section Divider — Draw-in on Scroll ── */
  if('IntersectionObserver' in window){
    var divObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('sd-drawn'); divObs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    function regDividers(){
      document.querySelectorAll('.section-divider:not(.sd-drawn)').forEach(function(el){ divObs.observe(el); });
    }
    regDividers();
    setTimeout(regDividers, 1000);
  }

  /* ── 6. Extra Ripple Targets (rows/cards not yet covered) ── */
  function spawnRipple2(e, el, dark){
    var r = el.getBoundingClientRect();
    var d = Math.max(r.width, r.height) * 1.7;
    var x = ((e.clientX != null ? e.clientX : r.left + r.width/2)) - r.left - d/2;
    var y = ((e.clientY != null ? e.clientY : r.top  + r.height/2)) - r.top  - d/2;
    var w = document.createElement('div');
    w.className = 'ripple-wave' + (dark ? ' dark' : '');
    w.style.cssText = 'width:'+d+'px;height:'+d+'px;left:'+x+'px;top:'+y+'px;';
    el.appendChild(w);
    setTimeout(function(){ if(w.parentNode) w.remove(); }, 640);
  }
  function bindExtraRipples(){
    var sel = '.lv-head,.goal-main,.debt-row,.fc-row,.bp-akun,.vision-card,.am-konten-item,.bp-tl-card,.bp-nilai';
    document.querySelectorAll(sel).forEach(function(el){
      if(el.dataset.rip) return;
      el.dataset.rip = '1';
      el.classList.add('ripple-host');
      el.addEventListener('pointerdown', function(e){ spawnRipple2(e, el, true); });
    });
  }
  bindExtraRipples();
  (function(){
    var _rafId = null;
    new MutationObserver(function(){
      if(_rafId) return;
      _rafId = requestAnimationFrame(function(){ _rafId = null; bindExtraRipples(); });
    }).observe(document.body, {childList:true, subtree:true});
  })();

  /* ── 7. Swipe Gesture — Day Navigator ── */
  (function setupDaySwipe(){
    var el = document.getElementById('ba-day-nav');
    if(!el) return;
    var startX=0, startY=0, curX=0, dragging=false, locked=false, isH=false;
    var THRESH = 56;

    function onStart(e){
      var t = e.touches ? e.touches[0] : e;
      startX = t.clientX; startY = t.clientY; curX = startX;
      dragging = true; locked = false; isH = false;
      el.classList.add('daynav-dragging');
    }
    function onMove(e){
      if(!dragging) return;
      var t = e.touches ? e.touches[0] : e;
      curX = t.clientX;
      var dx = curX - startX;
      var dy = t.clientY - startY;
      if(!locked){
        if(Math.abs(dx) > 8 || Math.abs(dy) > 8){
          locked = true;
          isH = Math.abs(dx) > Math.abs(dy);
        }
      }
      if(isH){
        if(e.cancelable) e.preventDefault();
        var resist = dx * 0.55;
        el.style.transform = 'translateX('+resist.toFixed(1)+'px)';
        el.style.opacity = String(Math.max(0.55, 1 - Math.abs(resist)/210));
      }
    }
    function onEnd(){
      if(!dragging) return;
      dragging = false;
      el.classList.remove('daynav-dragging');
      var dx = curX - startX;
      if(isH && Math.abs(dx) > THRESH){
        var next = dx < 0;
        el.style.transition = 'transform .20s cubic-bezier(.4,0,.2,1), opacity .20s ease';
        el.style.transform = 'translateX('+(next ? '-64px' : '64px')+')';
        el.style.opacity = '0';
        setTimeout(function(){
          if(next){ if(typeof baNextDay==='function') baNextDay(); }
          else { if(typeof baPrevDay==='function') baPrevDay(); }
          el.style.transition = 'none';
          el.style.transform = 'translateX('+(next?'42px':'-42px')+')';
          el.style.opacity = '0';
          requestAnimationFrame(function(){
            requestAnimationFrame(function(){
              el.style.transition = 'transform .3s cubic-bezier(.4,0,.2,1), opacity .3s ease';
              el.style.transform = 'translateX(0)';
              el.style.opacity = '1';
              setTimeout(function(){ el.style.transition=''; el.style.transform=''; el.style.opacity=''; }, 320);
            });
          });
        }, 190);
      } else {
        el.style.transition = 'transform .34s cubic-bezier(.34,1.56,.64,1), opacity .25s ease';
        el.style.transform = 'translateX(0)';
        el.style.opacity = '1';
        setTimeout(function(){ el.style.transition=''; }, 360);
      }
      isH = false; locked = false;
    }

    el.addEventListener('touchstart', onStart, {passive:true});
    el.addEventListener('touchmove', onMove, {passive:false});
    el.addEventListener('touchend', onEnd, {passive:true});
    el.addEventListener('touchcancel', onEnd, {passive:true});
  })();

  /* ── 8. Swipe Hint — Show Once on First Aktivitas Visit ── */
  var _swipeHintShown = false;
  var _origShowAppPage = window.showAppPage;
  if(typeof _origShowAppPage === 'function'){
    window.showAppPage = function(pageKey){
      _origShowAppPage.apply(this, arguments);
      if(pageKey === 'aktivitas' && !_swipeHintShown && !_reduced){
        _swipeHintShown = true;
        setTimeout(function(){
          var inner = document.querySelector('#ba-day-nav .ba-daynav-inner');
          if(inner){
            inner.classList.add('swipe-hint');
            setTimeout(function(){ inner.classList.remove('swipe-hint'); }, 1200);
          }
        }, 700);
      }
    };
  }

  /* ── 9. Pop-in for Modal Sections & Konten Items ── */
  (function watchModalBody(){
    var body = document.getElementById('am-body');
    if(!body) return;
    var obs = new MutationObserver(function(){
      var items = body.querySelectorAll('.am-section, .am-konten-item');
      items.forEach(function(it, i){
        if(it.dataset.popped) return;
        it.dataset.popped = '1';
        it.style.animationDelay = (i * 0.04) + 's';
        it.classList.add('pop-in');
      });
    });
    obs.observe(body, { childList: true, subtree: true });
  })();

  console.log('[MCFA] Motion Layer v3.5 ✦ loaded');

})();
