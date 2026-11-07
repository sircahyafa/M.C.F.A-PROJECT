/* ════════════════════════════════════════════════════════════
   M.C.F.A — PRODUCTION JS POLISH
   Unique additions only (scroll bar + ripple already active above)
════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── 1. STAGGER REVEAL on page switch
     Wraps the EXISTING showAppPage wrapper (premium upgrade block)
     to add cascading reveal animation on tab navigation.
  ── */
  var _prevShowAppPage = window.showAppPage;
  if (typeof _prevShowAppPage === 'function') {
    window.showAppPage = function(pageKey) {
      /* Call existing wrapper (which handles haptic, page switch, scroll) */
      _prevShowAppPage(pageKey);

      /* Re-animate reveals with stagger for premium cascade effect */
      var pageIdMap = {
        aktivitas: 'blueprintAktivitas',
        identitas: 'page-identitas',
        kehidupan: 'page-kehidupan',
        karir:     'page-karir',
        keuangan:  'page-keuangan'
      };
      var pid = pageIdMap[pageKey];
      if (!pid) return;
      var pg = document.getElementById(pid);
      if (!pg) return;

      var reveals = pg.querySelectorAll('.reveal');
      /* Reset visible so CSS transition replays */
      reveals.forEach(function(el) {
        el.classList.remove('visible');
        el.classList.remove('settled');
        el.style.transitionDelay = '';
      });
      /* Double rAF ensures browser processes remove before re-adding */
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          reveals.forEach(function(el, i) {
            el.style.transitionDelay = ((i % 8) * 0.055) + 's';
            el.classList.add('visible');
            /* Lock in place after animation - prevents reflow-triggered movement */
            setTimeout(function() {
              el.classList.add('settled');
              el.style.transitionDelay = '';
            }, ((i % 8) * 55) + 700);
          });
        });
      });
    };
  }

  /* ── 2. SMOOTH TOPBAR ELEVATION on scroll: ditangani oleh listener "Topbar Elevation" di bawah agar tidak duplikat/saling timpa ── */

  /* ── 3. HERO CARD SUBTLE PARALLAX ── */
  var heroCard = document.querySelector('.hero-card');
  if (heroCard) {
    var heroTicking = false;
    window.addEventListener('scroll', function() {
      if (heroTicking) return;
      heroTicking = true;
      requestAnimationFrame(function(){
        var sy = window.pageYOffset;
        if (sy < 250) {
          heroCard.style.transform = 'translateY(' + (sy * 0.055) + 'px)';
        }
        heroTicking = false;
      });
    }, { passive: true });
  }

  /* ── 4. BOTTOM NAV ICON SPRING on click ── */
  document.querySelectorAll('.bn-item').forEach(function(btn) {
    btn.addEventListener('pointerdown', function() {
      var icon = btn.querySelector('.bn-icon');
      if (icon) { icon.style.transform = 'scale(0.86)'; }
    });
    btn.addEventListener('pointerup', function() {
      var icon = btn.querySelector('.bn-icon');
      if (icon) {
        icon.style.transition = 'transform .32s cubic-bezier(.34,1.56,.64,1)';
        icon.style.transform = 'scale(1)';
      }
    });
    btn.addEventListener('pointerleave', function() {
      var icon = btn.querySelector('.bn-icon');
      if (icon) { icon.style.transform = 'scale(1)'; }
    });
  });

  /* ── 6. BLOCK PILL STRIPS — horizontal swipe nav ── */
  (function initPillStrips() {

    function buildPillStrip(stripId, blockClass) {
      var strip = document.getElementById(stripId);
      if (!strip) return;

      var blocks = Array.prototype.slice.call(document.querySelectorAll((blockClass === 'ba-block' ? '#body-harian .' : '.') + blockClass));
      if (!blocks.length) return;

      // Track focus state
      var focusIdx = -1; // -1 = show all

      // ── "Semua" pill ──
      var allPill = document.createElement('button');
      allPill.className = 'bps-pill bps-pill-all active';
      allPill.style.background = 'linear-gradient(135deg,#334155,#1e293b)';
      allPill.innerHTML = '<span class="bps-pill-icon">'+goalIco('bolt')+'</span><span class="bps-pill-label">Semua</span>';
      strip.appendChild(allPill);

      var pills = [];
      var autoOpenedBlock = null; // block that focus-mode force-opened, to be reverted on showAll

      blocks.forEach(function(block, i) {
        var header = block.querySelector('.' + blockClass + '-header');
        if (!header) return;

        var icon  = (header.querySelector('.' + blockClass + '-icon')  || {}).textContent || '';
        var title = (header.querySelector('.' + blockClass + '-title') || {}).textContent || '';
        var bg    = header.style.background || '#1a56db';

        var pill = document.createElement('button');
        pill.className = 'bps-pill';
        pill.style.background = bg;
        pill.innerHTML =
          '<span class="bps-pill-icon">' + icon + '</span>' +
          '<span class="bps-pill-label">' + title + '</span>' +
          '<span class="bps-pill-count" id="' + stripId + '-pcnt-' + i + '">0</span>';
        pills.push(pill);
        strip.appendChild(pill);

        pill.addEventListener('click', function() {
          if (focusIdx === i) {
            // Second tap on same pill = back to Semua
            showAll();
            return;
          }
          focusIdx = i;

          // Update pill states
          allPill.classList.remove('active');
          pills.forEach(function(p, j) {
            p.classList.toggle('active', j === i);
            p.classList.toggle('bps-dim', j !== i);
          });

          // Hide all blocks except this one — animate out
          blocks.forEach(function(b, j) {
            if (j !== i) {
              b.style.transition = 'opacity .22s ease, transform .22s ease, max-height .3s ease';
              b.style.opacity = '0';
              b.style.transform = 'scale(0.96)';
              b.style.pointerEvents = 'none';
              setTimeout(function() { b.style.display = 'none'; }, 220);
            } else {
              b.style.display = '';
              b.style.opacity = '1';
              b.style.transform = 'scale(1)';
              b.style.pointerEvents = '';
              // Auto-expand this block only if it wasn't already open (user's manual state is preserved)
              if (!b.classList.contains('open')) {
                b.classList.add('open');
                autoOpenedBlock = b;
              } else {
                autoOpenedBlock = null; // was already open before focus — not ours to revert
              }
            }
          });

          // Scroll strip pill into center
          pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

          // Scroll page to block — small delay to let layout settle
          setTimeout(function() {
            var stripEl = document.getElementById(stripId);
            var target = stripEl ? (stripEl.getBoundingClientRect().top + window.pageYOffset - 16) : 0;
            window.scrollTo({ top: target, behavior: 'smooth' });
          }, 80);
        });
      });

      // "Semua" pill handler
      allPill.addEventListener('click', showAll);

      function showAll() {
        focusIdx = -1;
        allPill.classList.add('active');
        pills.forEach(function(p) {
          p.classList.remove('active', 'bps-dim');
        });
        blocks.forEach(function(b) {
          b.style.display = '';
          b.style.opacity = '';
          b.style.transform = '';
          b.style.pointerEvents = '';
          b.style.transition = 'opacity .25s ease, transform .25s ease';
          // Only revert the block that focus-mode itself auto-opened;
          // leave blocks the user opened manually (via header click) untouched
          if (b === autoOpenedBlock) {
            b.classList.remove('open');
          }
          // Trigger repaint for animation
          void b.offsetWidth;
          b.style.opacity = '1';
        });
        autoOpenedBlock = null;
      }
    }

    // Run after DOM + data loaded
    setTimeout(function() {
      buildPillStrip('ta-pill-strip', 'ta-block');
      buildPillStrip('ba-pill-strip', 'ba-block');

      // Sync pill counts
      function syncPillCounts() {
        document.querySelectorAll('.ta-block').forEach(function(block, i) {
          var done  = block.querySelectorAll('.ta-item.done').length;
          var total = block.querySelectorAll('.ta-item').length;
          var el = document.getElementById('ta-pill-strip-pcnt-' + i);
          if (el) el.textContent = done + '/' + total;
        });
        document.querySelectorAll('#body-harian .ba-block').forEach(function(block, i) {
          var done  = block.querySelectorAll('.ba-item.done').length;
          var total = block.querySelectorAll('.ba-item').length;
          var el = document.getElementById('ba-pill-strip-pcnt-' + i);
          if (el) el.textContent = done + '/' + total;
        });
      }
      syncPillCounts();

      document.addEventListener('click', function(e) {
        if (e.target.closest && (e.target.closest('.ta-item') || e.target.closest('.ba-item'))) {
          setTimeout(syncPillCounts, 50);
        }
      });
    }, 600);

  })();

  /* ═══════════════════════════════════════════
     PREMIUM JS INTERACTIONS — HD Visual Layer
  ═══════════════════════════════════════════ */
  (function HD_PREMIUM() {

    /* ── Ripple Effect ── */
    function makeRipple(e, el, dark) {
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

    function bindRipples() {
      var btns = document.querySelectorAll(
        '.bn-item,.ba-nav-btn,.ba-reset-btn,.i-enter-btn,.kr-tab,.bp-ftab,' +
        '.phase-tab,.am-kf-btn,.am-konten-addbtn,.back-top,.bps-pill,' +
        '.am-cred-save,.am-cred-toggle,.am-cred-copy,.akun-modal-close'
      );
      btns.forEach(function(el) {
        if (el.dataset.rip) return;
        el.dataset.rip = '1';
        el.classList.add('ripple-host');
        el.addEventListener('pointerdown', function(e){ makeRipple(e,el,false); });
      });
      /* Dark ripple for light cards */
      document.querySelectorAll('.mu-card:not([data-rip])').forEach(function(el){
        el.dataset.rip = '1'; el.classList.add('ripple-host');
        el.addEventListener('pointerdown', function(e){ makeRipple(e,el,true); });
      });
    }
    bindRipples();
    (function(){
      var _rafId = null;
      new MutationObserver(function(){
        if(_rafId) return;
        _rafId = requestAnimationFrame(function(){ _rafId = null; bindRipples(); });
      }).observe(document.body, {childList:true,subtree:true});
    })();

    /* ── Gold Name ── */
    (function(){
      var s = document.querySelector('.topbar-sub');
      if(s && !s.querySelector('.tb-gold-name')){
        s.innerHTML = s.innerHTML.replace('MC FATHUL ADZIM',
          '<span class="tb-gold-name">MC FATHUL ADZIM</span>');
      }
    })();

    /* ── Topbar Elevation ── */
    var topbar = document.querySelector('.topbar');
    if(topbar){
      var topbarElevated = false;
      var topbarTicking = false;
      var SHADOW_UP = '0 1px 0 rgba(21,73,211,0.10), 0 10px 44px rgba(10,35,120,0.16), 0 4px 16px rgba(10,35,120,0.08)';
      var SHADOW_DOWN = '0 1px 0 rgba(21,73,211,0.06), 0 4px 20px rgba(10,35,120,0.08)';
      function updateTopbarShadow(){
        var shouldElevate = window.pageYOffset > 10;
        if (shouldElevate !== topbarElevated) {
          topbarElevated = shouldElevate;
          topbar.style.boxShadow = shouldElevate ? SHADOW_UP : SHADOW_DOWN;
        }
        topbarTicking = false;
      }
      window.addEventListener('scroll', function(){
        if (!topbarTicking) { requestAnimationFrame(updateTopbarShadow); topbarTicking = true; }
      }, {passive:true});
    }

    /* ── Counter Animate ── */
    if('IntersectionObserver' in window){
      var cntObs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting) return;
          var el = entry.target;
          if(el.dataset.counted) return;
          el.dataset.counted = '1';
          var val = parseInt(el.textContent.replace(/[^0-9]/g,''), 10) || 0;
          if(val > 5){
            var orig = el.textContent;
            el.dataset.orig = orig;
            var pre = orig.match(/^[^0-9]*/)[0];
            var suf = orig.match(/[^0-9]*$/)[0];
            var t0 = Date.now();
            var dur = Math.min(1000, 250 + val * 0.4);
            (function tick(){
              var p = Math.min((Date.now()-t0)/dur, 1);
              var e = 1-Math.pow(1-p,3);
              el.textContent = pre + Math.round(e*val).toLocaleString('id-ID') + suf;
              if(p<1) requestAnimationFrame(tick);
              else el.textContent = orig;
            })();
          }
          cntObs.unobserve(el);
        });
      },{threshold:0.5});
      function regCnt(){
        document.querySelectorAll('.bp-stat-num,.i-stat-num,.am-konten-stat-num,.grand-amt').forEach(function(el){
          if(!el.dataset.counted) cntObs.observe(el);
        });
      }
      regCnt(); setTimeout(regCnt,1500);
    }

    /* ── Celebration System ── */
    window.fireCelebration = function(msg, icon){
      var wrap = document.getElementById('cfWrap');
      if(!wrap) return;
      var cols = ['#1549d3','#4338ca','#7c3aed','#fde68a','#f59e0b','#10b981','#c8102e','#06b6d4'];
      for(var i=0; i<36; i++){
        (function(i){
          setTimeout(function(){
            var p = document.createElement('div');
            p.className = 'cp';
            var w = 5+Math.random()*9;
            p.style.cssText =
              'left:'+(15+Math.random()*70)+'%;top:-12px;'+
              'width:'+w+'px;height:'+w+'px;'+
              'border-radius:'+(Math.random()>.5?'50%':'3px')+';'+
              'background:'+cols[Math.floor(Math.random()*cols.length)]+';'+
              'animation-duration:'+(1.5+Math.random()*1.2)+'s;';
            wrap.appendChild(p);
            setTimeout(function(){ if(p.parentNode) p.remove(); }, 3000);
          }, i*22);
        })(i);
      }
      if(msg){
        var toast = document.createElement('div');
        toast.className = 'milestone-toast';
        toast.innerHTML =
          '<div style="font-size:40px;margin-bottom:12px">'+goalIco(icon||'trophy')+'</div>'+
          '<div style="font-size:18px;font-weight:900;letter-spacing:-0.3px;margin-bottom:5px">'+msg+'</div>'+
          '<div style="font-size:11px;opacity:.6;letter-spacing:1.5px;font-family:\'JetBrains Mono\'">M.C.F.A PROJECT ✦</div>';
        document.body.appendChild(toast);
        requestAnimationFrame(function(){ toast.classList.add('pop'); });
        setTimeout(function(){ if(toast.parentNode) toast.remove(); }, 2900);
      }
      if(navigator.vibrate) navigator.vibrate([15,25,15,25,15]);
    };

    /* ── Progress Milestone ── */
    var _lastMilePct = -1;
    function chkMile(pct){
      [{m:25,msg:'Luar Biasa! 25%',ico:'bolt'},{m:50,msg:'Setengah Jalan!',ico:'fire'},
       {m:75,msg:'Hampir Selesai!',ico:'rocket'},{m:100,msg:'Sempurna! Hari Ini Selesai!',ico:'trophy'}
      ].forEach(function(d){
        if(pct>=d.m && _lastMilePct<d.m){
          _lastMilePct = d.m;
          setTimeout(function(){ window.fireCelebration(d.msg,d.ico); }, 350);
        }
      });
    }
    var _origBaUpd = window.baUpdate;
    if(typeof _origBaUpd==='function'){
      window.baUpdate = function(){
        _origBaUpd.apply(this,arguments);
        var p = document.getElementById('ba-pct');
        if(p) chkMile(parseInt(p.textContent,10)||0);
      };
    }

    /* ── Stat Number Pop ── */
    function watchNum(id){
      var el = document.getElementById(id);
      if(!el||el.dataset.wnum) return;
      el.dataset.wnum = '1';
      var prev = el.textContent;
      new MutationObserver(function(){
        if(el.textContent===prev) return;
        prev = el.textContent;
        el.classList.remove('count-up'); void el.offsetWidth; el.classList.add('count-up');
        setTimeout(function(){ el.classList.remove('count-up'); }, 420);
      }).observe(el,{characterData:true,childList:true,subtree:true});
    }
    ['ba-pct','ba-done','ba-total','daysLeft','masterPctBadge','pb-elapsed',
     'ba-qhodo-pct','ba-qhodo-done','ba-hero-done','ba-hero-total','ba-hero-pct'].forEach(watchNum);

    /* ── Scroll Reveal — delegates to the single canonical observer
       (window.__revealScan). Third duplicate observer removed. ── */
    (function(){
      function run(){ if(window.__revealScan) window.__revealScan(); }
      run(); setTimeout(run,900); setTimeout(run,2600);
    })();

    /* ── Bottom Nav Bounce ── */
    document.querySelectorAll('.bn-item').forEach(function(btn){
      btn.addEventListener('pointerdown',function(){
        var ic=btn.querySelector('.bn-icon');
        if(ic){ ic.style.transition='transform .10s ease'; ic.style.transform='scale(0.78)'; }
      });
      ['pointerup','pointercancel'].forEach(function(ev){
        btn.addEventListener(ev,function(){
          var ic=btn.querySelector('.bn-icon');
          if(ic){ ic.style.transition='transform .38s cubic-bezier(.34,1.56,.64,1)'; ic.style.transform=''; }
        });
      });
    });

    /* ── Back-to-top & Hero Card Parallax: sudah ditangani oleh listener global (lihat atas), dihapus agar tidak duplikat/konflik ── */

    /* ── Welcome Stagger ── */
    var _origEnter = window.enterApp;
    if(typeof _origEnter==='function'){
      window.enterApp = function(){
        _origEnter.apply(this,arguments);
        setTimeout(function(){
          document.querySelectorAll('.mu-card,.hero-card,.project-banner').forEach(function(el,i){
            el.style.cssText += 'opacity:0;transform:translateY(22px);transition:none;';
            setTimeout(function(){
              el.style.transition='opacity .44s ease,transform .44s cubic-bezier(.4,0,.2,1)';
              el.style.opacity=''; el.style.transform='';
              setTimeout(function(){ el.style.cssText = el.style.cssText.replace(/opacity:[^;]+;/g,'').replace(/transform:[^;]+;/g,'').replace(/transition:[^;]+;/g,''); },460);
            }, i*60+200);
          });
        }, 420);
      };
    }

    /* ── Card hover glow ── */
    document.querySelectorAll('.lv-card,.vision-card,.bp-tl-card').forEach(function(c){
      c.addEventListener('mouseenter',function(){ c.style.borderColor='rgba(21,73,211,0.28)'; });
      c.addEventListener('mouseleave',function(){ c.style.borderColor=''; });
    });

    console.log('[MCFA] HD Premium v3.4 ✦ loaded');

  })();

})();
