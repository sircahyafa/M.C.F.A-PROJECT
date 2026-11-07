/* Hemat baterai & CPU: semua timer berhenti saat app di latar belakang. */
(function(){ var si=window.setInterval; window.setInterval=function(f,t){ if(typeof f!=='function') return si.apply(window,arguments); var a=[].slice.call(arguments,2); return si(function(){ if(document.hidden) return; f.apply(null,a); },t); };
  try{ if(localStorage.getItem('mcfa_fx')==='full') document.documentElement.classList.add('full-fx'); }catch(e){} })();
