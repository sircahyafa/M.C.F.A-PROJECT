/* Hemat baterai & CPU: semua timer berhenti saat app di latar belakang. */
(function(){ var si=window.setInterval; window.setInterval=function(f,t){ if(typeof f!=='function') return si.apply(window,arguments); var a=[].slice.call(arguments,2); return si(function(){ if(document.hidden) return; f.apply(null,a); },t); };
  try{ if(localStorage.getItem('mcfa_fx')==='full') document.documentElement.classList.add('full-fx'); }catch(e){} })();
/* 20261111.5 — SATU AudioContext bersama untuk seluruh aplikasi (sebelumnya 5 konteks terpisah: 06, 10, 12, 14, 18).
   Setiap konteks menahan satu thread audio; Android kelas bawah membatasi jumlahnya. Semua suara bersifat sekali-putar
   (osilator/noise yang dihubungkan ke destination), jadi berbagi satu konteks aman. Dibuat malas saat suara pertama;
   bila 'suspended' langsung di-resume. Mengembalikan null bila peramban tidak mendukung Web Audio. */
(function(){ var c=null;
  window.mcfaAudioCtx=function(){
    var A=window.AudioContext||window.webkitAudioContext; if(!A) return null;
    if(!c){ try{ c=new A(); }catch(e){ c=null; return null; } }
    try{ if(c.state==='suspended'){ var p=c.resume(); if(p&&p.catch) p.catch(function(){}); } }catch(e){}
    return c; };
  /* hemat baterai: tahan konteks saat aplikasi di latar belakang; dipakai lagi (resume) pada suara berikutnya */
  document.addEventListener('visibilitychange',function(){ try{ if(document.hidden&&c&&c.state==='running') c.suspend(); }catch(e){} });
})();
