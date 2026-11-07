/* Kilau bergerak pada kartu berwarna — hanya dekorasi, tidak menyentuh data/fungsi */
(function(){
  try{
    var SEL='.project-banner,.hero-card,.kr-header-banner,.identity-intro-card,.dash-wrap,.bp-frame-header,.akt-hero-card,.mt-card,.ah-hero,.ah-cat,.ay-hero,.pp-hero';
    var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){
      es.forEach(function(e){ e.target.classList.toggle('on',e.isIntersecting); });
    },{threshold:0.05}):null;
    var n=0;
    function decorate(){
      var els=document.querySelectorAll(SEL);
      for(var i=0;i<els.length;i++){
        var el=els[i], has=false;
        for(var c=el.lastElementChild;c;c=c.previousElementSibling){ if(c.classList&&c.classList.contains('pf-sh')){has=true;break;} }
        if(has) continue;
        if(getComputedStyle(el).position==='static') el.style.position='relative';
        var sh=document.createElement('i'); sh.className='pf-sh'; sh.setAttribute('aria-hidden','true');
        sh.style.setProperty('--d',((n++%5)*1.1).toFixed(1)+'s');
        el.appendChild(sh); if(io) io.observe(sh); else sh.classList.add('on');
      }
    }
    var t=0; function sched(){ if(t) return; t=setTimeout(function(){ t=0; decorate(); },350); }
    decorate();
    new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});
  }catch(e){}
})();
