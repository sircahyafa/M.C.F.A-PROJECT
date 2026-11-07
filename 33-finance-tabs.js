/* KEUANGAN — pengelompokan 3 tab + kartu alokasi lipat + "Dompet Bulan Ini" otomatis dari Buku Transaksi. */
(function(){
  'use strict';
  var pg=document.getElementById('page-keuangan'); if(!pg) return;
  var IC={
    ring:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="10" y="7" width="4" height="13" rx="1"/><rect x="17" y="3" width="4" height="17" rx="1"/></svg>',
    alo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v9h9"/><path d="M20.5 15A9 9 0 1 1 9 3.5"/></svg>',
    cat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M9 9h6M9 13h6"/></svg>'};
  function rpd(n){ return 'Rp '+Math.round(n).toLocaleString('id-ID'); }
  function ym(){ return mcfaTodayIso().slice(0,7); }
  var BLN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  function dompet(){
    var box=document.getElementById('finDompet'); if(!box) return;
    var o={}; try{ o=JSON.parse(localStorage.getItem('fin_ledger_v1')||'{}'); }catch(e){}
    var m=ym(), inc=0, exp=0, cats={};
    (o.tx||[]).forEach(function(t){ if(!t||String(t.date).slice(0,7)!==m) return; var a=+t.amount||0;
      if(t.type==='in'){ inc+=a; var c=(t.cat==='Pendapatan K.P Cihuy')?'Pendapatan KP.CIHUY':(t.cat||'Lainnya'); cats[c]=(cats[c]||0)+a; } else if(t.type==='out') exp+=a; });
    var ga=document.querySelector('.fg-amount'), target=0; try{ target=_rpOf(ga)||0; }catch(e){}
    var pct=target>0?Math.min(100,inc/target*100):0, net=inc-exp;
    var chips=Object.keys(cats).sort(function(a,b){return cats[b]-cats[a];}).map(function(c){ return '<span>'+c.replace('Pendapatan ','')+' · '+rpd(cats[c])+'</span>'; }).join('');
    box.innerHTML='<div class="fd-k">DOMPET BULAN INI</div><div class="fd-m">'+BLN[+m.slice(5,7)-1].toUpperCase()+' '+m.slice(0,4)+'</div>'+
      '<div class="fd-big">'+rpd(inc)+'</div><div class="fd-sub">pemasukan tercatat · target bulanan '+rpd(target)+' ('+(Math.round(pct*10)/10).toLocaleString('id-ID')+'%)</div>'+
      '<div class="fd-bar"><i data-w="'+pct+'"></i></div>'+
      '<div class="fd-row"><div><small>PENGELUARAN</small><b>'+rpd(exp)+'</b></div><div><small>SELISIH</small><b style="color:'+(net>=0?'#bbf7d0':'#fecaca')+'">'+(net<0?'−':'')+rpd(Math.abs(net))+'</b></div></div>'+
      (chips?'<div class="fd-cats">'+chips+'</div>':'<div class="fd-hint">Belum ada pemasukan bulan ini. Catat di tab CATATAN — angka di sini ikut otomatis.</div>');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ var i=box.querySelector('.fd-bar i'); if(i) i.style.width=i.getAttribute('data-w')+'%'; }); });
  }
  function pills(){
    pg.querySelectorAll('.finance-card').forEach(function(c){
      var h=c.querySelector('.fc-header'), t=c.querySelector('.fc-total-val'); if(!h||!t) return;
      var p=h.querySelector('.fc-pill'); if(!p){ p=document.createElement('span'); p.className='fc-pill'; h.appendChild(p); }
      if(p.textContent!==t.textContent) p.textContent=t.textContent;
    });
  }
  function tab(k){
    pg.setAttribute('data-ftab',k);
    document.querySelectorAll('#finTabs button').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-t')===k); });
    if(k==='ring') dompet();
    try{ window.scrollTo({top:Math.max(0,pg.getBoundingClientRect().top+(window.pageYOffset||0)-70),behavior:'smooth'}); }catch(e){}
    if(navigator.vibrate) navigator.vibrate(8);
  }
  function mount(tries){
    var d=pg.querySelector('.dtarget-banner'), g=pg.querySelector('.finance-grid'), lg=document.getElementById('lgCard'), tw=pg.querySelector('.tp-wrap');
    if(!d||!g||!lg||!tw){ if(tries>0) setTimeout(function(){ mount(tries-1); },250); return; }
    if(document.getElementById('finTabs')) return;
    [d,document.getElementById('fmProgressCard'),pg.querySelector('.fm-balance-card')].forEach(function(e){ e&&e.classList.add('fin-g-ring'); });
    [pg.querySelector('.fin-rate'),g,pg.querySelector('.finance-grand')].forEach(function(e){ e&&e.classList.add('fin-g-alo'); });
    [lg,pg.querySelector('.fm-history-card')].forEach(function(e){ e&&e.classList.add('fin-g-cat'); });
    var dm=document.createElement('div'); dm.id='finDompet'; dm.className='fin-g-ring'; d.parentNode.insertBefore(dm,d.nextSibling);
    var bar=document.createElement('div'); bar.id='finTabs';
    bar.innerHTML='<button data-t="ring">'+IC.ring+'RINGKASAN</button><button data-t="alo">'+IC.alo+'ALOKASI</button><button data-t="cat">'+IC.cat+'CATATAN</button>';
    tw.parentNode.insertBefore(bar,tw.nextSibling);
    bar.addEventListener('click',function(e){ var b=e.target.closest('button'); if(b) tab(b.getAttribute('data-t')); });
    pg.querySelectorAll('.finance-card .fc-header').forEach(function(h){ h.addEventListener('click',function(){ h.parentNode.classList.toggle('fc-open'); if(navigator.vibrate) navigator.vibrate(6); }); });
    pg.setAttribute('data-ftab','ring'); bar.querySelector('button').classList.add('on');
    pills(); dompet();
    document.addEventListener('mcfa-ledger',function(){ dompet(); pills(); });
    window.addEventListener('storage',dompet);
    if(window.MCFA_TAHAP) MCFA_TAHAP.onChange(function(){ setTimeout(function(){ pills(); dompet(); },120); });
    setInterval(function(){ pills(); },700);
    setInterval(dompet,60000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ mount(40); }); else mount(40);
})();
