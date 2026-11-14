/* Jumlah akun di narasi dibaca dari data AKUN (bukan angka manual) */
(function(){function f(){try{var n=Object.keys(AKUN).length;document.querySelectorAll('[data-akun-count]').forEach(function(e){e.textContent=n;});}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',f);else f();})();
