(function(){
  'use strict';
  function nowD(){ try{ return mcfaNowJakarta(); }catch(e){ return mcfaMidnight(); } }
  function activeStage(){ return MCFA_TAHAP.running(); }
  function badge(){ if(!window.MCFA_TAHAP) return; var a=activeStage(); document.querySelectorAll('.tp-card').forEach(function(b){ b.setAttribute('data-now', +b.getAttribute('data-tahap')===a||+b.getAttribute('data-n')===a?'1':'0'); }); }
  /* urutan wajib: judul → TAHAP → daftar tugas/info yang berlaku */
  function order(){
    [['blueprintAktivitas','aktDash'],['page-kehidupan','khDash']].forEach(function(p){
      var pg=document.getElementById(p[0]), dash=document.getElementById(p[1]), tw=pg&&pg.querySelector('.tp-wrap');
      if(pg&&dash&&tw&&!dash.parentNode.classList.contains('dash-wrap')&&(dash.compareDocumentPosition(tw)&Node.DOCUMENT_POSITION_FOLLOWING)) dash.parentNode.insertBefore(tw,dash);
    });
  }
  /* Studio: rincian per akun dilipat */
  var open=false;
  function slim(body){
    var l=body.querySelector('.sm-list'); if(!l||body.querySelector('.sm-tog')) return;
    var n=l.querySelectorAll('.sm-row').length, b=document.createElement('button'); b.type='button'; b.className='sm-tog'+(open?' open':'');
    b.innerHTML='<span>RINCIAN PER AKUN · '+n+'</span><i>▾</i>'; l.classList.toggle('sm-collapsed',!open);
    b.addEventListener('click',function(){ open=!open; l.classList.toggle('sm-collapsed',!open); b.classList.toggle('open',open); });
    l.parentNode.insertBefore(b,l);
  }
  function watch(){
    document.querySelectorAll('.tp-wrap .tp-body').forEach(function(body){
      if(body.__w) return; body.__w=1; slim(body);
      new MutationObserver(function(){ slim(body); }).observe(body,{childList:true});
    });
  }
  /* foto + halaman Sheina (PROJECT ADIK SENDIRI) */
  var PK='mcfa_person_photo_sheina';
  var DEF='sheina.jpg';
  function photo(){ try{ return localStorage.getItem(PK)||DEF; }catch(e){ return DEF; } }
  function paintPhoto(){
    var p=photo(), html=p?'<img src="'+p+'" alt="Foto Sheina">':'S';
    var a=document.getElementById('ppImg'); if(a) a.innerHTML=html;
    document.querySelectorAll('.bp-sheina-img').forEach(function(e){ e.src=p; });
    document.querySelectorAll('.ah-pph').forEach(function(e){ e.innerHTML=p?'<img src="'+p+'" alt="">':'S'; });
    var ic=document.getElementById('am-icon'); if(ic&&ic.getAttribute('data-person')==='sheina'&&p) ic.innerHTML='<img src="'+p+'" alt="" style="width:100%;height:100%;border-radius:inherit;object-fit:cover">';
  }
  function savePhoto(file){
    if(!file||!/^image\//.test(file.type)) return;
    var r=new FileReader(); r.onload=function(){ var im=new Image(); im.onload=function(){
      var m=320, k=Math.min(1,m/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k);
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      try{ localStorage.setItem(PK,c.toDataURL('image/jpeg',.85)); }catch(e){ if(typeof showNotif==='function') showNotif('Foto terlalu besar, coba foto lain.'); return; }
      paintPhoto(); try{ MCFA_SFX.play('success'); }catch(e){}
    }; im.src=r.result; }; r.readAsDataURL(file);
  }
  window.openPerson=function(id){
    var d=PERSON[id]; if(!d) return;
    var ic=document.getElementById('am-icon'); ic.setAttribute('data-person',id); ic.innerHTML=goalIco(d.icon); ic.style.background=d.bg;
    document.getElementById('am-name').textContent=d.name; document.getElementById('am-niche').textContent='PROJECT ADIK SENDIRI · Manager';
    document.getElementById('am-body').innerHTML='<div id="pbody-'+id+'">'+
      '<div class="pp-hero"><div class="pp-ph"><span id="ppImg" style="display:contents"></span><label class="pp-cam" for="ppFile" title="Ganti foto">📷</label><input id="ppFile" type="file" accept="image/*" hidden></div>'+
      '<div><div class="pp-k">PROJECT ADIK SENDIRI</div><div class="pp-n">'+d.name+'</div><span class="pp-role">ADIK · MANAGER MC FATHUL ADZIM</span></div></div>'+
      '<div class="am-section"><div style="font-size:12px;font-style:italic;color:#475569;border-left:3px solid '+d.color+';padding-left:10px;line-height:1.65">Tidak punya channel sendiri. Punya project dan identitas tersendiri, dengan peran sebagai manager MC FATHUL ADZIM.</div></div>'+
      (typeof _personStatsHtml==='function' ? '<div class="am-section"><div class="am-slabel">Stats & Info</div><div class="am-grid">'+_personStatsHtml(id)+'</div></div>' : '')+
      '<div class="am-section xt-sec"><div class="am-slabel">'+goalIco('clipboard')+' Tugas Manager</div><div class="xt-rows">'+d.tugas.map(function(t){return '<div class="xt-row"><span>'+t+'</span></div>';}).join('')+'</div></div>'+
      '<div class="am-section xt-sec">'+_pLearnHtml(id)+'</div></div>';
    _pProg(id); paintPhoto();
    document.getElementById('ppFile').addEventListener('change',function(e){ savePhoto(e.target.files&&e.target.files[0]); });
    document.getElementById('akunOverlay').classList.add('show'); document.body.style.overflow='hidden';
  };
  function init(){ paintPhoto(); var t=0, iv=setInterval(function(){ order(); watch(); badge(); if(++t>40) clearInterval(iv); },300); setInterval(badge,60000); if(window.MCFA_TAHAP) MCFA_TAHAP.onChange(function(){ setTimeout(function(){ watch(); badge(); },120); }); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
