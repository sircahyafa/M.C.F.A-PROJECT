    (function(){
      var OH_TOTAL = 8; // 2 prolog + 6 bab fase (LIFE_PHASES)
      var ohIdx = 0;
      var ohActive = false;
      var ohSoundOn = true;
      try{ ohSoundOn = (localStorage.getItem('ohSoundOn') !== '0'); }catch(e){}
      var ohCtx = null;

      function ohEnsureCtx(){
        if(!ohCtx){ try{ ohCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ ohCtx = null; } }
        if(ohCtx && ohCtx.state === 'suspended') ohCtx.resume();
        return ohCtx;
      }
      function ohTone(freq, dur, type, vol, freqTo){
        if(!ohSoundOn) return;
        var c = ohEnsureCtx(); if(!c) return;
        var t0 = c.currentTime;
        var osc = c.createOscillator(); var gain = c.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        if(freqTo) osc.frequency.exponentialRampToValueAtTime(freqTo, t0 + dur);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(vol || 0.1, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain); gain.connect(c.destination);
        osc.start(t0); osc.stop(t0 + dur + 0.02);
      }
      function ohPageTurn(){ ohTone(180, 0.28, 'sine', 0.06, 90); }
      function ohChime(){ ohTone(660, 0.5, 'sine', 0.07, 990); }

      function ohBuildDots(){
        var wrap = document.getElementById('oh-dots');
        wrap.innerHTML = '';
        for(var i=0;i<OH_TOTAL;i++){
          var d = document.createElement('div');
          d.className = 'oh-dot';
          wrap.appendChild(d);
        }
      }
      function ohRenderDots(){
        var dots = document.querySelectorAll('#oh-dots .oh-dot');
        dots.forEach(function(d, i){
          d.className = 'oh-dot' + (i < ohIdx ? ' done' : '') + (i === ohIdx ? ' now' : '');
        });
      }
      function ohShow(i){
        var chapters = document.querySelectorAll('.oh-chapter');
        chapters.forEach(function(c){ c.classList.remove('active'); });
        chapters[i].classList.add('active');
        ohIdx = i;
        ohRenderDots();
        var hint = document.getElementById('oh-hint');
        hint.style.display = (i === OH_TOTAL - 1) ? 'none' : '';
        ohSyncNav();
      }
      /* ── navigasi dua arah: kiri/tombol ‹ = sebelumnya, kanan/tombol › = berikutnya.
            "Sebelumnya" lewat jalur yang sama dengan Back HP (MCFA_NAV) supaya history selalu sinkron ── */
      var ohBackPending = 0;
      function ohSyncNav(){
        var p = document.getElementById('oh-prev'), n = document.getElementById('oh-next'), pos = document.getElementById('oh-pos');
        if(p) p.disabled = (ohIdx <= 0);
        if(n) n.disabled = (ohIdx >= OH_TOTAL - 1);
        if(pos) pos.textContent = (ohIdx + 1) + ' / ' + OH_TOTAL;
      }
      function ohForward(){
        if(ohIdx >= OH_TOTAL - 1) return;
        var from = ohIdx;
        ohPageTurn();
        ohShow(from + 1);
        if(window.MCFA_NAV) MCFA_NAV.push('oh', function(){ ohBackPending = Math.max(0, ohBackPending - 1); ohPageTurn(); ohShow(from); });
      }
      function ohBackStep(){
        var eff = ohIdx - ohBackPending;           // posisi efektif bila ada Back yang masih diproses
        if(eff <= 0) return;                        // fase pertama: tidak melakukan apa pun
        if(window.MCFA_NAV && MCFA_NAV.top() === 'oh' && MCFA_NAV.depth('oh') > 1){ ohBackPending++; MCFA_NAV.back(); }
        else { ohPageTurn(); ohShow(ohIdx - 1); }
      }
      window.ohPrevBtn = function(e){ if(e) e.stopPropagation(); ohBackStep(); };
      window.ohNextBtn = function(e){ if(e) e.stopPropagation(); ohForward(); };
      window.ohOpen = function(e){
        var stage = document.getElementById('oh-stage');
        if(ohActive) return;
        var naskah = document.getElementById('oh-naskah-wrap');
        var launchDelay = 0;
        if(naskah && !naskah.classList.contains('oh-naskah-tapped')){
          naskah.classList.add('oh-naskah-tapped');
          naskah.addEventListener('animationend', function handler(){
            naskah.classList.remove('oh-naskah-tapped');
            naskah.removeEventListener('animationend', handler);
          });
          launchDelay = 180;
        }
        setTimeout(function(){
          ohBuildDots();
          ohShow(0);
          clearTimeout(stage._ohCloseT);
          stage.classList.remove('oh-closing');
          stage.classList.add('active');
          stage.classList.add('oh-opening');
          document.body.style.overflow = 'hidden';
          ohActive = true;
          ohBackPending = 0;
          if(window.MCFA_NAV) MCFA_NAV.push('oh', function(){ window.ohClose(null, true); });  // Back di fase pertama = keluar dari Official History
          ohEnsureCtx();
          ohChime();
        }, launchDelay);
      };
      window.ohClose = function(e, fromNav){
        if(e) e.stopPropagation();
        var stage = document.getElementById('oh-stage');
        if(!ohActive || stage.classList.contains('oh-closing')) return;
        if(!fromNav && window.MCFA_NAV) MCFA_NAV.drop('oh');   // tutup lewat UI → bersihkan semua entri history OH
        ohBackPending = 0;
        ohActive = false;
        stage.classList.remove('oh-opening');
        stage.classList.add('oh-closing');
        clearTimeout(stage._ohCloseT);
        stage._ohCloseT = setTimeout(function(){
          stage.classList.remove('active');
          stage.classList.remove('oh-closing');
          document.body.style.overflow = '';
        }, 560);
      };
      window.ohToggleSound = function(e){
        if(e) e.stopPropagation();
        ohSoundOn = !ohSoundOn;
        try{ localStorage.setItem('ohSoundOn', ohSoundOn ? '1' : '0'); }catch(e){}
        var btn = document.getElementById('oh-sound-btn');
        btn.innerHTML = goalIco(ohSoundOn ? 'speaker' : 'speaker-off');
        btn.setAttribute('aria-pressed', ohSoundOn ? 'true' : 'false');
        if(ohSoundOn) ohChime();
      };
      (function(){
        var btn = document.getElementById('oh-sound-btn');
        btn.innerHTML = goalIco(ohSoundOn ? 'speaker' : 'speaker-off');
        btn.setAttribute('aria-pressed', ohSoundOn ? 'true' : 'false');
      })();

      document.getElementById('oh-stage').addEventListener('click', function(e){
        if(e.target.closest('.oh-close') || e.target.closest('.oh-sound') || e.target.closest('.oh-navbtn')) return;
        var box = this.getBoundingClientRect();
        if((e.clientX - box.left) < box.width * 0.3){ ohBackStep(); return; }   // sisi kiri → sebelumnya
        if(ohIdx < OH_TOTAL - 1){
          ohForward();                                                          // sisi kanan → berikutnya
        } else {
          ohChime();
          setTimeout(function(){ window.ohClose(); }, 500);
        }
      });
      document.addEventListener('keydown', function(e){
        if(!ohActive) return;
        if(e.key === 'Escape') window.ohClose();
        else if(e.key === 'ArrowRight' || e.key === ' '){ ohForward(); }
        else if(e.key === 'ArrowLeft'){ ohBackStep(); }
      });
    })();
    
