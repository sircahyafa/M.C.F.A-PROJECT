/* PUSAT AKUN M.C.F.A STUDIO — satu sumber data: AKUN (data akun) + pemetaan kategori (id → kategori).
   Tidak menggandakan data akun: kategori hanyalah pemetaan id. Pengaturan pengguna (kategori, username, tautan, status, catatan)
   disimpan di localStorage 'mcfa_akun_hub_v1'; tidak ada data akun yang dikarang. */
(function(){
  'use strict';
  var KEY='mcfa_akun_hub_v1';
  var ICON={
    persona:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
    solo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.7 6.7 19.6l1.1-6L3.4 9.4l6-.8z"/></svg>',
    kolab:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.6"/><path d="M3 20c0-3.5 2.7-5.6 6-5.6s6 2.1 6 5.6M15.5 14.6c3 0 5.5 1.7 5.5 4.6"/></svg>',
    ayla:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.6"/><path d="M12 9.4C10.5 6 11 3.5 12 3c1 .5 1.5 3 0 6.4zM14.6 12c3.4-1.5 5.9-1 6.4 0-.5 1-3 1.5-6.4 0zM12 14.6c1.5 3.4 1 5.9 0 6.4-1-.5-1.5-3 0-6.4zM9.4 12C6 13.5 3.5 13 3 12c.5-1 3-1.5 6.4 0z"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z"/></svg>'
  };
  ICON.persona='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 19h14"/></svg>';
  ICON.solo='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.5 2 5.5 5.5 5.5 9.5L12 18l-5.5-5.5C6.5 8.5 8.5 5 12 3z"/><circle cx="12" cy="10" r="1.8"/><path d="M6.5 14.5L4 17.5l3.5-.5M17.5 14.5L20 17.5l-3.5-.5M10 21h4"/></svg>';
  ICON.kolab='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="12" r="5"/><circle cx="15.5" cy="12" r="5"/></svg>';
  ICON.adik='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/><path d="M17.5 3.5l.6 1.2 1.3.2-1 .9.2 1.3-1.1-.6-1.2.6.3-1.3-1-.9 1.3-.2z"/></svg>';
  function adAv(){ var p='sheina.jpg'; try{ p=localStorage.getItem('mcfa_person_photo_sheina')||p; }catch(e){} return '<span class="ah-stack"><span class="ah-pph">'+(p?'<img src="'+p+'" alt="">':'S')+'</span></span>'; }
  var GROUPS=[
    {id:'persona',name:'Persona Utama',desc:'Pusat personal branding',c:'#c8102e',bg:'#fef1f3',wide:true},
    {id:'solo',name:'Solo Branding',desc:'Brand mandiri, identitas sendiri',c:'#1a4fb0',bg:'#eef3fc'},
    {id:'kolab',name:'Kolaborasi',desc:'KP.CIHUY & CNE Pictures',c:'#c44d18',bg:'#fef3ee'},
    {id:'ayla',name:'PROJECT ADIK SENDIRI',desc:'Dunia Ayla · Sheina Shafira Anggreni',c:'#c8102e',bg:'#fff5f8',wide:true,ayla:true}
  ];
  var DEF=(window.MCFA_STUDIO&&MCFA_STUDIO.catDef)||{mcfa:'persona',fathulmeme:'persona',barongsukma:'solo',okk:'solo',zona:'solo',alley:'solo',lol:'solo',monkipedia:'solo',kpc:'kolab',cne:'kolab',ayla:'ayla'};   /* satu sumber default kategori: MCFA_STUDIO */
  var PLAT={YT:'YouTube',TT:'TikTok',FB:'Facebook',IG:'Instagram'};
  var STAT={aktif:'Aktif',prep:'Persiapan',jeda:'Dijeda'}, STORD={aktif:0,prep:1,jeda:2};
  var root, st={meta:{},group:{},notes:{}}, saved=true;
  var ui={view:'home',q:'',plat:'',sort:'awal'}, logos={}, navOn=false;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function load(){ try{ var o=JSON.parse(localStorage.getItem(KEY)||'{}'); st.meta=o.meta||{}; st.group=o.group||{}; st.notes=o.notes||{}; }catch(e){} }
  function persist(){ try{ localStorage.setItem(KEY,JSON.stringify(st)); saved=true; }catch(e){ saved=false; } return saved; }
  function toast(m){ if(typeof showNotif==='function') showNotif(m); }
  function ids(){ return (typeof AKUN!=='undefined')?Object.keys(AKUN):[]; }
  function gid(id){ if(id==='ayla') return 'ayla'; var g=st.group[id]||DEF[id]||'solo'; return (g==='persona'||g==='solo'||g==='kolab')?g:'solo'; }
  function G(g){ for(var i=0;i<GROUPS.length;i++) if(GROUPS[i].id===g) return GROUPS[i]; return GROUPS[1]; }
  function colorOf(id){ return (AKUN[id]&&AKUN[id].color)||'#1a4fb0'; }
  function nameOf(id){ return (AKUN[id]&&AKUN[id].name)||id; }
  function plats(id){ var s=(AKUN[id]&&AKUN[id].stats)||[]; for(var i=0;i<s.length;i++) if(s[i].lbl==='Platform') return String(s[i].num).split('·').map(function(x){return x.trim();}).filter(Boolean); return []; }
  function status(id){
    var m=st.meta[id]||{}; if(m.status&&STAT[m.status]) return {k:m.status,t:STAT[m.status]};
    var start=(typeof TAHAP1!=='undefined')?TAHAP1.start:MCFA_CORE.projectStart, diff;
    try{ diff=mcfaDaysBetween(mcfaParse(start),(typeof _postToday==='function')?_postToday():new Date()); }catch(e){ diff=0; }
    return diff<0?{k:'prep',t:'Persiapan · DAY 1 dalam '+(-diff)+' hari'}:{k:'aktif',t:'Aktif'};
  }
  function harvestLogos(){
    document.querySelectorAll('#akunLegacy .bp-akun').forEach(function(el){
      var m=(el.getAttribute('onclick')||'').match(/openAkun\('([^']+)'\)/), im=el.querySelector('img');
      if(m&&im) logos[m[1]]=im.getAttribute('src');
    });
  }
  function av(id){ var l=logos[id]; return '<div class="ah-av">'+(l?'<img src="'+esc(l)+'" alt="">':'<i>'+esc(nameOf(id).charAt(0))+'</i>')+'</div>'; }
  function match(id){
    if(ui.plat && plats(id).indexOf(ui.plat)<0) return false;
    var q=ui.q.trim().toLowerCase(); if(!q) return true;
    var d=AKUN[id], m=st.meta[id]||{};
    var hay=[d.name,d.niche,d.badge,(d.tags||[]).join(' '),plats(id).join(' '),plats(id).map(function(p){return PLAT[p]||'';}).join(' '),m.user||'',G(gid(id)).name].join(' ').toLowerCase();
    return q.split(/\s+/).every(function(w){ return hay.indexOf(w)>=0; });
  }
  function sorted(list){
    var a=list.slice(), pos={}; ids().forEach(function(i,n){ pos[i]=n; });
    if(ui.sort==='nama') a.sort(function(x,y){ return nameOf(x).localeCompare(nameOf(y),'id'); });
    else if(ui.sort==='status') a.sort(function(x,y){ return (STORD[status(x).k]-STORD[status(y).k])||(pos[x]-pos[y]); });
    else a.sort(function(x,y){ return pos[x]-pos[y]; });
    return a;
  }
  function filtering(){ return !!(ui.q.trim()||ui.plat); }
  function sgn(d){ return d; }

  /* ── bagian UI ── */
  function tools(){
    var chips='<button class="ah-chip'+(ui.plat?'':' on')+'" data-act="plat" data-v="">Semua</button>'+Object.keys(PLAT).map(function(p){
      return '<button class="ah-chip'+(ui.plat===p?' on':'')+'" data-act="plat" data-v="'+p+'" title="'+PLAT[p]+'">'+p+'</button>'; }).join('');
    return '<div class="ah-tools"><div class="ah-search">'+ICON.search+'<input id="ahQ" type="search" placeholder="Cari akun…" value="'+esc(ui.q)+'" autocomplete="off">'+(ui.q?'<button class="ah-x" data-act="clearq" aria-label="Hapus pencarian">×</button>':'')+'</div>'+
      '<div class="ah-row"><select class="ah-sort" id="ahSort" aria-label="Urutkan"><option value="awal"'+(ui.sort==='awal'?' selected':'')+'>Urutan awal</option><option value="nama"'+(ui.sort==='nama'?' selected':'')+'>Nama A–Z</option><option value="status"'+(ui.sort==='status'?' selected':'')+'>Status</option></select></div></div>';
  }
  function card(id,showGrp){
    var d=AKUN[id], g=G(gid(id)), s=status(id), m=st.meta[id]||{}, pl=plats(id);
    var url=m.url?'<a class="ah-ib" href="'+esc(m.url)+'" target="_blank" rel="noopener noreferrer" data-stop="1" aria-label="Buka tautan akun">'+ICON.link+'</a>':'<span class="ah-ib off" aria-hidden="true">'+ICON.link+'</span>';
    return '<div class="ah-card" style="--c:'+colorOf(id)+'" data-ahopen="'+esc(id)+'" role="button" tabindex="0">'+av(id)+
      '<div class="ah-info"><div class="ah-nm">'+esc(d.name)+'</div><div class="ah-ni">'+esc(d.niche||'')+'</div>'+
      '<div class="ah-meta">'+(showGrp?'<span class="ah-grp" style="--c:'+g.c+'">'+esc(g.name)+'</span>':'')+'<span class="ah-st '+s.k+'">'+esc(s.t)+'</span>'+((window.MCFA_STUDIO&&MCFA_STUDIO.hasTarget(id)&&!MCFA_STUDIO.kontenTarget(id))?'<span class="ah-grp" style="--c:#1a6b3a">Target Subs / Follow</span>':'')+(m.user?'<span class="ah-user">'+esc(m.user)+'</span>':'')+'</div></div>'+
      '<div class="ah-act">'+url+'<button class="ah-ib" data-act="edit" data-id="'+esc(id)+'" data-stop="1" aria-label="Atur akun">'+ICON.edit+'</button></div></div>';
  }
  function stack(list,c){ return '<div class="ah-stack" style="--c:'+c+'">'+list.slice(0,4).map(function(id){ var l=logos[id]; return l?'<img src="'+esc(l)+'" alt="">':'<i>'+esc(nameOf(id).charAt(0))+'</i>'; }).join('')+'</div>'; }
  function members(g){ return ids().filter(function(i){ return gid(i)===g; }); }

  function agg(){
    var t={akun:ids().length,konten:0,followers:0,subs:0};
    ids().forEach(function(id){ try{ if(typeof _t1Load==='function'){ var x=_t1Load(id)||{}; for(var n=1;n<=3;n++) t.konten+=(MCFA_STUDIO.konten(id,n)||0); t.followers+=+x.followers||0; t.subs+=+x.subs||0; } }catch(e){} });
    return t;
  }
  function ahCount(){
    var els=document.querySelectorAll('#akunHub .ah-num'); if(!els.length) return;
    var red=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
    els.forEach(function(el){
      var n=+el.getAttribute('data-n')||0, fmt=function(v){ return Math.round(v).toLocaleString('id-ID'); };
      if(red||!n){ el.textContent=fmt(n); return; }
      var t0=performance.now(); (function f(t){ var p=Math.min(1,(t-t0)/900), e=1-Math.pow(1-p,3); el.textContent=fmt(n*e); if(p<1) requestAnimationFrame(f); })(t0);
    });
  }
  document.addEventListener('mcfa:data',function(){
    var a=agg(), V={'AKUN':a.akun,'KONTEN':a.konten,'FOLLOWERS':a.followers,'SUBS':a.subs};
    document.querySelectorAll('#akunHub .ah-hs').forEach(function(e){ var l=e.querySelector('small'), n=e.querySelector('.ah-num'); if(l&&n&&V[l.textContent]!==undefined){ n.setAttribute('data-n',V[l.textContent]); n.textContent=Math.round(V[l.textContent]).toLocaleString('id-ID'); } });
  });
  function home(){
    var all=ids(), a=agg(), ps='';
    try{ ps=MCFA_DERIVED.projectStatus(mcfaNowJakarta()); }catch(e){}
    var stat=function(l,n,c){ return '<div class="ah-hs" style="--k:'+c+'"><b class="ah-num" data-n="'+n+'">0</b><small>'+l+'</small></div>'; };
    var h='<div class="ah-view"><div class="ah-hero"><span class="ah-spark s1">✦</span><span class="ah-spark s2">✦</span><span class="ah-spark s3">✦</span>'+
      '<div class="ah-hk">M.C.F.A STUDIO</div><div class="ah-ht">Pusat Akun</div>'+(ps?'<div class="ah-hp"><i></i>'+esc(ps)+'</div>':'')+
      '<div class="ah-hgrid">'+stat('AKUN',a.akun,'#fcd34d')+stat('KONTEN',a.konten,'#6ee7b7')+stat('FOLLOWERS',a.followers,'#93c5fd')+stat('SUBS',a.subs,'#fda4af')+'</div></div>'+tools();
    if(filtering()){
      var res=sorted(all.filter(match));
      h+='<div class="ah-head"><b style="font-size:12px">Hasil</b><span>'+res.length+' dari '+all.length+' akun</span></div>';
      h+=res.length?'<div class="ah-list">'+res.map(function(i){return card(i,true);}).join('')+'</div>':'<div class="ah-empty"><b>Tidak ada akun yang cocok</b>Coba kata kunci lain.<br><button class="ah-link" data-act="reset">Hapus pencarian</button></div>';
    } else {
      h+='<div class="ah-cats">'+GROUPS.map(function(g,n){
        var m=members(g.id), ad=(g.id==='ayla');
        return '<button class="ah-cat'+(g.wide?' wide':'')+(g.ayla?' ayla':'')+'" style="--c:'+g.c+';--c-bg:'+g.bg+';--i:'+n+'" data-act="group" data-g="'+g.id+'"><span class="bgi">'+ICON[g.id]+'</span><span class="ico">'+ICON[g.id]+'</span><span class="nm">'+esc(g.name)+'</span><span class="ds">'+esc(g.desc)+'</span><span class="ft"><span class="ct">'+(ad?'2 profil':m.length+' akun')+'</span>'+(ad?(stack(m,g.c)+adAv()):(m.length?stack(m,g.c):''))+'<span class="go">›</span></span></button>';
      }).join('')+'</div>';
    }
    return h+'</div>';
  }
  function segs(cur){ return '<div class="ah-seg" style="--c:'+G(cur).c+'">'+GROUPS.map(function(g){ return '<button class="'+(g.id===cur?'on':'')+'" style="'+(g.id===cur?'':'')+'" data-act="group" data-g="'+g.id+'">'+esc(g.name)+' · '+members(g.id).length+'</button>'; }).join('')+'</div>'; }
  function panel(gidv){
    var g=G(gidv), m=members(gidv), res=sorted(m.filter(match));
    var h='<div class="ah-view" style="--c:'+g.c+'"><div class="ah-bar"><button class="ah-back" data-act="home">‹ Pusat Akun</button>'+segs(gidv)+'</div>'+
      '<div class="ah-banner"><span class="ico">'+ICON[gidv]+'</span><div><b>'+esc(g.name)+'</b><span>'+esc(g.desc)+' · '+m.length+' akun · '+(gidv==='solo'?'dengan target':gidv==='ayla'?'target Subs / Follow saja (tanpa target konten)':(m.some(function(i){ return MCFA_STUDIO.hasTarget(i); })?'target Subs / Follow hanya untuk Fathul Al-Meme':'tanpa target'))+'</span></div></div>'+tools();
    if(!m.length) h+='<div class="ah-empty"><b>Belum ada akun di '+esc(g.name)+'</b>Kategori ini kosong. Pindahkan akun lewat tombol atur pada kartu akun, atau tambahkan akun baru ke data M.C.F.A STUDIO.</div>';
    else if(!res.length) h+='<div class="ah-empty"><b>Tidak ada akun yang cocok</b>Tidak ada akun di '+esc(g.name)+' yang sesuai pencarian atau filter.<br><button class="ah-link" data-act="reset">Hapus pencarian & filter</button></div>';
    else h+='<div class="ah-list">'+res.map(function(i){return card(i,false);}).join('')+'</div>';
    return h+'</div>';
  }

  /* kartu Sheina Shafira Anggreni (adik) — tampilan istimewa; data & fungsi buka profil tidak berubah */
  function sheinaProg(){
    try{
      var d=PERSON.sheina, tot=0; d.belajar.forEach(function(g){ tot+=g.length-1; });
      var sv=((typeof _pLoad==='function')?_pLoad():{}).sheina||{}, n=0;
      Object.keys(sv).forEach(function(k){ if(sv[k]) n++; });
      n=Math.min(n,tot); return {n:n,t:tot,p:tot?Math.round(n/tot*100):0};
    }catch(e){ return null; }
  }
  function sheinaCard(){
    var ph='sheina.jpg'; try{ ph=localStorage.getItem('mcfa_person_photo_sheina')||ph; }catch(e){}
    var pr=sheinaProg();
    var av=ph?'<img src="'+ph+'" alt="">':'<b>S</b>';
    var prog=(pr&&pr.t)?'<span class="sh-prog"><span class="sh-bar"><i style="width:'+pr.p+'%"></i></span><span class="sh-pt" style="display:block">'+pr.n+' / '+pr.t+' pelajaran · '+pr.p+'%</span></span>':'';
    return '<div class="ah-person ah-sheina" onclick="openPerson(\'sheina\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openPerson(\'sheina\');}" role="button" tabindex="0" aria-label="Buka profil Sheina Shafira Anggreni, adik, manager">'+
      '<span class="sh-sp a" aria-hidden="true">✦</span><span class="sh-sp b" aria-hidden="true">✦</span><span class="sh-sp c" aria-hidden="true">✦</span>'+
      '<span class="pi"><span class="pf">'+av+'</span><i class="sh-crown" aria-hidden="true">✦</i></span>'+
      '<span class="pt"><span class="sh-k">Adik · Manager</span><b class="sh-n">Sheina Shafira Anggreni</b><span class="sh-r">Manager · Daftar pelajaran</span>'+
      '<span class="sh-tags"><span>Profil sendiri</span><span class="g">Project Adik Sendiri</span></span>'+prog+'</span>'+
      '<span class="go" aria-hidden="true">›</span></div>'+
      '';
  }
  function ayla(){
    var d=AKUN.ayla; if(!d) return '<div class="ah-empty"><b>Data Dunia Ayla tidak ditemukan</b></div>';
    var m=st.meta.ayla||{}, s=status('ayla'), t1={konten:0,followers:0,subs:0}, sn=(typeof _t1Stage==='function')?_t1Stage():1, tg={konten:0,followers:0,subs:0};
    try{ if(typeof _t1Load==='function'){ var x=_t1Load('ayla')||{}; t1.followers=+x.followers||0; t1.subs=+x.subs||0; }
      if(window.MCFA_STUDIO){ var SS=MCFA_STUDIO; t1.konten=SS.konten('ayla',sn)||0; ['followers','subs'].forEach(function(k){ if(SS.applies('ayla',k,sn)) tg[k]=SS.target('ayla',sn,k)||0; }); if(SS.kontenTarget('ayla')) tg.konten=SS.target('ayla',sn,'konten')||0; } }catch(e){}
    var fn=function(n){ return Number(n).toLocaleString('id-ID'); };
    var url=m.url?'<a href="'+esc(m.url)+'" target="_blank" rel="noopener noreferrer" class="gh">Buka akun ↗</a>':'';
    return '<div class="ah-view" style="--c:#c8102e"><div class="ah-bar"><button class="ah-back" data-act="home">‹ Pusat Akun</button>'+segs('ayla')+'</div>'+
      '<div class="ah-banner" style="--c:#c8102e"><span class="ico">'+ICON.ayla+'</span><div><b>PROJECT ADIK SENDIRI</b><span>Dunia Ayla + Sheina · 2 profil, data masing-masing terpisah</span></div></div>'+
      '<div class="ay-hero"><div class="ay-top">'+av('ayla')+'<div><b>Dunia Ayla</b><span>'+esc(d.niche||'')+'</span><span><em class="ah-st '+s.k+'" style="font-style:normal;display:inline-block;margin-top:5px">'+esc(s.t)+'</em>'+(m.user?' · '+esc(m.user):'')+'</span></div></div>'+
      '<div class="ay-btns"><button data-ahopen="ayla">Buka detail & konten</button><button class="gh" data-act="edit" data-id="ayla">Atur akun</button>'+url+'</div></div>'+
      sheinaCard()+
      '<div class="ay-sec"><h4>Profil akun</h4><div class="ay-grid">'+(d.stats||[]).map(function(x){ if(typeof _tgtStat==='function') x=_tgtStat('ayla',x); return '<div class="ay-st"><b>'+esc(x.num)+'</b><small>'+esc(x.lbl)+'</small></div>'; }).join('')+'</div>'+
        (d.persona?'<p style="margin-top:12px">'+esc(d.persona)+'</p>':'')+(d.desc?'<p style="margin-top:8px;color:#4e6e9c">'+esc(d.desc)+'</p>':'')+
        ((d.tags&&d.tags.length)?'<div class="ay-tags">'+d.tags.map(function(t){return '<span>'+esc(t)+'</span>';}).join('')+'</div>':'')+'</div>'+
      ((d.strategi&&d.strategi.length)?'<div class="ay-sec"><h4>Strategi konten</h4><ul class="ay-ul">'+d.strategi.map(function(t){return '<li>'+esc(t)+'</li>';}).join('')+'</ul></div>':'')+
      '<div class="ay-sec"><h4>Progres Tahap '+sn+'</h4><div class="ay-grid" style="grid-template-columns:repeat(3,1fr)"><div class="ay-st"><b>'+fn(t1.konten)+'</b><small>KONTEN'+(tg.konten?' / '+fn(tg.konten):'')+'</small></div><div class="ay-st"><b>'+fn(t1.followers)+'</b><small>FOLLOWERS'+(tg.followers?' / '+fn(tg.followers):'')+'</small></div><div class="ay-st"><b>'+fn(t1.subs)+'</b><small>SUBSCRIBERS'+(tg.subs?' / '+fn(tg.subs):'')+'</small></div></div>'+
        '<p style="margin-top:10px;font-size:11px;color:#4e6e9c">Angka diambil dari data yang Anda isi di detail akun. Buka detail & konten untuk memperbarui.</p></div>'+
      '<div class="ay-sec"><h4>Catatan pengelolaan</h4><textarea class="ay-note" id="ayNote" placeholder="Tulis rencana, ide, atau catatan khusus Dunia Ayla di sini…">'+esc(st.notes.ayla||'')+'</textarea><div class="ay-saved" id="ayNoteS"></div></div></div>';
  }
  function render(){
    if(!root) return;
    var focus=document.activeElement&&document.activeElement.id==='ahQ', pos=focus?document.activeElement.selectionStart:0;
    root.innerHTML= ui.view==='home'?home():(ui.view==='ayla'?ayla():panel(ui.view)); ahCount();
    if(focus){ var q=document.getElementById('ahQ'); if(q){ q.focus(); try{ q.setSelectionRange(pos,pos); }catch(e){} } }
  }
  function openView(v){
    var wasHome=ui.view==='home'; ui.view=v;
    if(wasHome && v!=='home' && window.MCFA_NAV && !navOn){ navOn=true; MCFA_NAV.push('akunhub',function(){ navOn=false; ui.view='home'; render(); }); }
    render();
  }
  function goHome(){
    if(navOn && window.MCFA_NAV && MCFA_NAV.has('akunhub')){ MCFA_NAV.back(); return; }
    navOn=false; ui.view='home'; render();
  }

  /* ── sheet atur akun ── */
  var sheetId=null, wrap;
  function openSheet(id){
    sheetId=id; var m=st.meta[id]||{}, s=m.status||'';
    if(!wrap){ wrap=document.createElement('div'); wrap.id='ahSheetWrap'; wrap.innerHTML='<div id="ahSheet" role="dialog" aria-modal="true"></div>';
      wrap.addEventListener('click',function(e){ if(e.target===wrap) closeSheet(); }); document.body.appendChild(wrap); }
    var locked=(id==='ayla');
    document.getElementById('ahSheet').innerHTML='<h3>Atur '+esc(nameOf(id))+'</h3><div class="sub">Hanya mengubah pengaturan tampilan di Pusat Akun. Data akun lainnya tidak berubah.</div>'+
      '<label>Kategori</label>'+(locked?'<input value="Dunia Ayla (tempat khusus, tetap)" disabled>':'<select id="ahG">'+['persona','solo','kolab'].map(function(g){ return '<option value="'+g+'"'+(gid(id)===g?' selected':'')+'>'+esc(G(g).name)+'</option>'; }).join('')+'</select>')+
      '<label>Username</label><input id="ahU" maxlength="60" placeholder="@username (opsional)" value="'+esc(m.user||'')+'">'+
      '<label>Tautan akun</label><input id="ahL" inputmode="url" maxlength="300" placeholder="https://…" value="'+esc(m.url||'')+'"><div class="hint">Kosongkan jika belum ada. Tautan yang diisi akan membuka akun di tab baru.</div>'+
      '<label>Status pengelolaan</label><select id="ahS"><option value=""'+(s?'':' selected')+'>Otomatis (ikuti tanggal DAY 1)</option>'+Object.keys(STAT).map(function(k){ return '<option value="'+k+'"'+(s===k?' selected':'')+'>'+STAT[k]+'</option>'; }).join('')+'</select>'+
      '<div class="err" id="ahE"></div><div class="btns"><button class="sec" data-sheet="cancel">Batal</button><button class="pri" data-sheet="save">Simpan</button></div>';
    wrap.style.display='flex'; requestAnimationFrame(function(){ wrap.classList.add('on'); });
  }
  function closeSheet(){ if(!wrap) return; wrap.classList.remove('on'); setTimeout(function(){ if(!wrap.classList.contains('on')) wrap.style.display='none'; },220); sheetId=null; }
  function saveSheet(){
    var id=sheetId; if(!id) return;
    var u=document.getElementById('ahU').value.trim(), l=document.getElementById('ahL').value.trim(), s=document.getElementById('ahS').value, e=document.getElementById('ahE');
    if(l){ if(!/^https?:\/\//i.test(l)) l='https://'+l; try{ var U=new URL(l); if(!/^https?:$/.test(U.protocol)||U.hostname.indexOf('.')<0) throw 0; l=U.href; }catch(x){ e.textContent='Tautan tidak valid. Contoh: https://www.tiktok.com/@nama'; return; } }
    st.meta[id]={user:u,url:l,status:s};
    var gs=document.getElementById('ahG'); if(gs && id!=='ayla'){ if(gs.value===DEF[id]) delete st.group[id]; else st.group[id]=gs.value; }
    var ok=persist(); closeSheet(); render();
    try{ document.dispatchEvent(new Event('mcfa:data')); }catch(x){}   /* pindah kategori → target, KARIR, dan Sistem Posting dihitung ulang */
    toast(ok?'Pengaturan akun disimpan':'Diterapkan, tetapi belum tersimpan permanen (penyimpanan browser diblokir)');
  }

  /* ── event ── */
  function onClick(e){
    var t=e.target;
    var sh=t.closest&&t.closest('[data-sheet]'); if(sh){ if(sh.getAttribute('data-sheet')==='save') saveSheet(); else closeSheet(); return; }
    var a=t.closest&&t.closest('[data-act]');
    if(a){
      var act=a.getAttribute('data-act');
      if(act==='group'){ openView(a.getAttribute('data-g')==='ayla'?'ayla':a.getAttribute('data-g')); return; }
      if(act==='home'){ goHome(); return; }
      if(act==='plat'){ ui.plat=a.getAttribute('data-v'); render(); return; }
      if(act==='clearq'){ ui.q=''; render(); return; }
      if(act==='reset'){ ui.q=''; ui.plat=''; render(); return; }
      if(act==='edit'){ openSheet(a.getAttribute('data-id')); return; }
    }
    if(t.closest&&t.closest('[data-stop]')) return;
    var o=t.closest&&t.closest('[data-ahopen]'); if(o && typeof openAkun==='function'){ openAkun(o.getAttribute('data-ahopen')); }
  }
  var noteT;
  function onInput(e){
    if(e.target.id==='ahQ'){ ui.q=e.target.value; render(); }
    else if(e.target.id==='ayNote'){ var v=e.target.value; clearTimeout(noteT); noteT=setTimeout(function(){ st.notes.ayla=v; var ok=persist(); var s=document.getElementById('ayNoteS'); if(s){ s.textContent=ok?'Tersimpan':'Belum tersimpan permanen (penyimpanan browser diblokir)'; s.style.color=ok?'#047857':'#b45309'; } },450); }
  }
  function onChange(e){ if(e.target.id==='ahSort'){ ui.sort=e.target.value; render(); } }
  function onKey(e){ if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('ah-card')){ e.preventDefault(); openAkun(e.target.getAttribute('data-ahopen')); } if(e.key==='Escape'&&sheetId) closeSheet(); }

  function init(){
    root=document.getElementById('akunHub'); if(!root||typeof AKUN==='undefined') return;
    try{
      load(); harvestLogos(); render();
      root.addEventListener('click',onClick); root.addEventListener('input',onInput); root.addEventListener('change',onChange); root.addEventListener('keydown',onKey);
      document.addEventListener('click',function(e){ if(wrap&&wrap.contains(e.target)) onClick(e); });
    }catch(err){
      console.warn('[AKUN-HUB]',err); var lg=document.getElementById('akunLegacy'); if(lg) lg.style.display=''; root.style.display='none';
    }
    try{ if(window.MCFA_TAHAP) MCFA_TAHAP.onChange(function(){ if(ui.view==='ayla') render(); }); }catch(e){}
    window.MCFA_AKUN_HUB={groups:function(){ var o={}; GROUPS.forEach(function(g){ o[g.id]=members(g.id); }); return o; },open:openView,catOf:gid};
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
