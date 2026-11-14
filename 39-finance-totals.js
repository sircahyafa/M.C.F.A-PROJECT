/* KEUANGAN — Total Pemasukan, Total Pengeluaran, Jumlah Transaksi, dan cek rumus; semua dari satu sumber (MCFA_FIN_CALC = Buku Transaksi). */
(function(){
  'use strict';
  function rpf(n){ return (n<0?'−':'')+'Rp '+Math.abs(Math.round(n)).toLocaleString('id-ID'); }
  var sig='';
  function paint(){
    var box=document.getElementById('fmTotals'); if(!box||!window.MCFA_FIN_CALC) return;
    var T=MCFA_FIN_CALC.totals(), el=document.getElementById('fmBalanceVal');
    var ok=!el || String(T.balance)===el.textContent.replace(/\./g,'').replace('−','-');
    var k=[T.income,T.expense,T.count,T.balance,ok].join('|'); if(k===sig) return; sig=k;
    box.innerHTML='<div class="ft-g"><div class="in"><small>TOTAL PEMASUKAN</small><b>'+rpf(T.income)+'</b></div><div class="out"><small>TOTAL PENGELUARAN</small><b>'+rpf(T.expense)+'</b></div><div class="op"><small>TRANSAKSI AKTIF</small><b>'+T.count.toLocaleString('id-ID')+'</b></div></div>'+
      '<div class="ft-ok'+(ok?'':' bad')+'">'+(ok?'✓ Saldo saat ini '+rpf(T.balance)+' = total pemasukan − total pengeluaran':'Menyelaraskan tampilan saldo…')+'</div>';
    if(!ok){ try{ MCFA_FM.render(); }catch(e){} }
  }
  function mount(t){
    var card=document.querySelector('#page-keuangan .fm-balance-card');
    if(!card||!window.MCFA_FM||!window.MCFA_FIN_CALC){ if(t>0) setTimeout(function(){ mount(t-1); },250); return; }
    if(document.getElementById('fmTotals')) return;
    var b=document.createElement('div'); b.id='fmTotals'; b.className='fin-g-ring'; card.parentNode.insertBefore(b,card.nextSibling);
    paint(); document.addEventListener('mcfa-ledger',paint); window.addEventListener('storage',paint);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ mount(40); }); else mount(40);
})();
