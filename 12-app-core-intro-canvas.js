/* ═══ INTRO CANVAS ═══ */
(function(){ try{
  const cv=document.getElementById('intro-canvas');
  const cx=cv.getContext('2d');
  let W,H,pts=[],meteors=[];
  function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);

  /* Starfield sinematik: suhu warna bintang nyata, sebaran ukuran (banyak kecil, sedikit terang), glow & spike */
  const ptColors=['255,255,255','202,222,255','165,192,255','255,246,220','255,220,180','255,190,150'];
  const starSprites=ptColors.map(function(c){
    const sc=document.createElement('canvas'); sc.width=sc.height=32; const g=sc.getContext('2d');
    const gr=g.createRadialGradient(16,16,0,16,16,16);
    gr.addColorStop(0,'rgba('+c+',1)'); gr.addColorStop(.18,'rgba('+c+',.55)');
    gr.addColorStop(.5,'rgba('+c+',.12)'); gr.addColorStop(1,'rgba('+c+',0)');
    g.fillStyle=gr; g.fillRect(0,0,32,32); return sc;
  });
  for(let i=0;i<240;i++){
    const d=Math.pow(Math.random(),2.6);
    const r=.22+d*2.0;
    pts.push({
      x:Math.random()*100, y:Math.random()*100,
      r:r, ph:Math.random()*Math.PI*2,
      spd:.002+Math.random()*.012,
      ci:Math.floor(Math.pow(Math.random(),1.35)*ptColors.length),
      drift:(Math.random()-.5)*.004*(.3+r)
    });
  }

  /* Twinkle stars — kecil, kelap-kelip cepat, tersebar rapat */
  let twinkles=[];
  for(let i=0;i<140;i++) twinkles.push({
    x:Math.random()*100, y:Math.random()*100,
    r:.35+Math.random()*.55, ph:Math.random()*Math.PI*2,
    spd:.03+Math.random()*.07,
    baseA:.15+Math.random()*.35
  });

  /* Meteor/shooting star pool — slow, sparse, elegant */
  function newMeteor(){
    const gold=Math.random()<0.40;
    return {
      x: Math.random()*130-15,
      y: Math.random()*-10,
      len: 50+Math.random()*90,
      spd: 0.35+Math.random()*0.45,           /* jauh lebih lambat dari sebelumnya (1.6–4.0) */
      angle: Math.PI/4 + (Math.random()-.5)*.3,
      alpha: 0.55+Math.random()*.25,          /* lebih lembut, tidak terlalu terang */
      life: 0, maxLife: 260+Math.random()*220, /* durasi hidup jauh lebih panjang = gerak lambat */
      gold: gold
    };
  }
  meteors=[];
  for(let i=0;i<3;i++){                        /* jumlah meteor sekaligus dikurangi drastis (8→3) */
    const m=newMeteor();
    m.life=Math.random()*m.maxLife;
    meteors.push(m);
  }

  function draw(){
    var introEl=document.getElementById('intro');
    if(!introEl || introEl.style.display==='none'){ return; } /* stop loop begitu intro sudah ditutup — hemat CPU/GPU, tidak lagi menggambar tak terlihat di belakang app */
    if(document.hidden){ requestAnimationFrame(draw); return; }
    cx.clearRect(0,0,W,H);

    /* Draw stars — glow sprite + inti + spike pada bintang terang */
    pts.forEach(p=>{
      p.ph+=p.spd;
      p.x+=p.drift;
      if(p.x>105)p.x=-5; if(p.x<-5)p.x=105;
      const op=Math.min(1,(.16+.5*(.5+.5*Math.sin(p.ph)))*(.4+p.r/2.2));
      const sx=p.x/100*W, sy=p.y/100*H;
      if(p.r>.8){
        cx.globalAlpha=op;
        cx.drawImage(starSprites[p.ci],sx-p.r*5,sy-p.r*5,p.r*10,p.r*10);
        cx.globalAlpha=1;
      }
      cx.beginPath();
      cx.arc(sx, sy, p.r*.55, 0, Math.PI*2);
      cx.fillStyle=`rgba(${ptColors[p.ci]},${Math.min(1,op+.15)})`;
      cx.fill();
      if(p.r>1.7){
        cx.strokeStyle=`rgba(${ptColors[p.ci]},${op*.35})`; cx.lineWidth=.6;
        cx.beginPath(); cx.moveTo(sx-p.r*9,sy); cx.lineTo(sx+p.r*9,sy); cx.moveTo(sx,sy-p.r*9); cx.lineTo(sx,sy+p.r*9); cx.stroke();
      }
    });

    /* Draw twinkle stars — kecil & kelap-kelip */
    twinkles.forEach(t=>{
      t.ph+=t.spd;
      const op=Math.max(0, t.baseA*(.4+.6*Math.sin(t.ph)));
      cx.beginPath();
      cx.arc(t.x/100*W, t.y/100*H, t.r, 0, Math.PI*2);
      cx.fillStyle=`rgba(255,255,255,${op})`;
      cx.fill();
    });

    /* Draw meteors — gerakan & fade halus dengan easing ease-in-out */
    meteors.forEach(m=>{
      m.life++;
      if(m.life>m.maxLife){ Object.assign(m,newMeteor()); return; }
      const prog=m.life/m.maxLife;
      /* Fade in/out lebih landai (25% masuk, 30% keluar) untuk transisi lembut */
      const fadeRaw=prog<0.25?prog/0.25:prog>0.7?(1-prog)/0.3:1;
      const fade=fadeRaw<1 ? (fadeRaw*fadeRaw*(3-2*fadeRaw)) : 1; /* smoothstep, bukan linear */
      /* Posisi mengikuti kurva ease-in-out cubic (mirip cubic-bezier(0.4,0,0.2,1)) agar tidak terasa mekanis */
      const easedProg = prog<0.5 ? 4*prog*prog*prog : 1-Math.pow(-2*prog+2,3)/2;
      const tx=Math.cos(m.angle)*m.len;
      const ty=Math.sin(m.angle)*m.len;
      const px=(m.x+easedProg*m.spd*80)/100*W;
      const py=(m.y+easedProg*m.spd*80)/100*H;
      const grad=cx.createLinearGradient(px,py,px-tx*0.4,py-ty*0.4);
      if(m.gold){
        grad.addColorStop(0,`rgba(253,215,70,${fade*m.alpha})`);
        grad.addColorStop(0.4,`rgba(253,170,20,${fade*m.alpha*0.5})`);
        grad.addColorStop(1,'rgba(217,119,6,0)');
      } else {
        grad.addColorStop(0,`rgba(255,255,255,${fade*m.alpha})`);
        grad.addColorStop(0.4,`rgba(180,210,255,${fade*m.alpha*0.5})`);
        grad.addColorStop(1,'rgba(37,99,235,0)');
      }
      const hg=cx.createRadialGradient(px,py,0,px,py,7);
      hg.addColorStop(0,`rgba(255,255,255,${fade*m.alpha})`); hg.addColorStop(1,'rgba(255,255,255,0)');
      cx.fillStyle=hg; cx.fillRect(px-7,py-7,14,14);
      cx.beginPath();
      cx.strokeStyle=grad;
      cx.lineWidth=1.5;
      cx.moveTo(px,py);
      cx.lineTo(px-tx*0.4,py-ty*0.4);
      cx.stroke();
      /* Head glow */
      cx.beginPath();
      cx.arc(px,py,1.5,0,Math.PI*2);
      cx.fillStyle=m.gold?`rgba(253,220,80,${fade*0.9})`:`rgba(255,255,255,${fade*0.9})`;
      cx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
 }catch(_introCanvasErr){ /* animasi intro hanya hiasan: bila canvas/context gagal, aplikasi tetap lanjut */ }
})();

/* ═══ ENTER APP ═══ */
var _mcfaEntered=false; /* pengaman: masuk aplikasi hanya sekali (Enter/ketuk ganda tidak mengulang animasi) */
function enterApp(){
  var introEl=document.getElementById('intro');
  if(_mcfaEntered || !introEl) return false;
  _mcfaEntered=true;
  playTap();
  // Big entrance celebration
  introFireworks();
  introEl.classList.add('intro-exit');
  setTimeout(()=>{
    introEl.style.display='none';
    document.getElementById('app').classList.add('visible');
    playSuccess();
    setTimeout(()=>boom(60),300);
    setTimeout(()=>boom(40),800);
    setTimeout(()=>boom(30),1400);
  },700);
  return true;
}

function introFireworks(){
  try{
    const ctx=_ac(); const t=ctx.currentTime;
    // Dramatic entrance fanfare
    const melody = [
      {f:392,st:0},{f:493.88,st:0.1},{f:523.25,st:0.2},
      {f:659.25,st:0.3},{f:783.99,st:0.4},{f:880,st:0.5},
      {f:1046.5,st:0.6},{f:1318.5,st:0.7},{f:1568,st:0.78}
    ];
    melody.forEach(({f,st})=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t+st);
      g.gain.exponentialRampToValueAtTime(0.12,t+st+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+st+0.35);
      o.connect(g);g.connect(ctx.destination);o.start(t+st);o.stop(t+st+0.4);
    });
    // Bass chord
    [130.81,196,261.63].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.08,t+0.05);
      g.gain.exponentialRampToValueAtTime(0.0001,t+1.2);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+1.3);
    });
  }catch(e){}
}
document.addEventListener('keydown',e=>{if(e.key==='Enter' && !_mcfaEntered)enterApp();});

/* ═══ INTRO STAT/PILL TAP FEEDBACK ═══ */
function introTap(el){
  try{ playTap(); }catch(e){}
  el.style.transform='scale(0.94)';
  setTimeout(()=>{ el.style.transform=''; },140);
}

/* ═══ COUNT-UP ANIMATION FOR HERO DAY NUMBER ═══ */
(function(){
  const target = MCFA_DERIVED.projectTotalDays;
  const el = document.getElementById('i-stat-hero-num');
  if(!el) return;
  let started = false;

  function runCount(){
    if(started) return;
    started = true;
    el.textContent = '0';
    const duration = 1200;
    let startTime = null;
    let done = false;
    function tick(ts){
      if(!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = progress < 0.5
        ? 2*progress*progress
        : -1 + (4-2*progress)*progress;
      el.textContent = Math.floor(eased * target).toLocaleString('id-ID');
      if(progress < 1){
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString('id-ID');
        if(!done){
          done = true;
          el.classList.add('counting');
          const wrap = el.closest('.i-stat-num-wrap');
          if(wrap){
            const sparks = ['✦','⋆','★','✧'];
            sparks.forEach((s,i)=>{
              const d = document.createElement('div');
              d.textContent = s;
              d.style.cssText = `position:absolute;font-size:${10+i*2}px;color:#fde68a;pointer-events:none;z-index:10;top:50%;left:50%;transform:translate(-50%,-50%);animation:sparkBurst${i} 0.8s ease forwards;`;
              const kf = document.createElement('style');
              const angle = (i/sparks.length)*360;
              const rad = angle*(Math.PI/180);
              const dx = Math.cos(rad)*30, dy = Math.sin(rad)*30;
              kf.textContent = `@keyframes sparkBurst${i}{0%{transform:translate(-50%,-50%) scale(0);opacity:1;}100%{transform:translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1.5);opacity:0;}}`;
              document.head.appendChild(kf);
              wrap.appendChild(d);
              setTimeout(()=>{ d.remove(); kf.remove(); }, 800);
            });
          }
          setTimeout(()=>el.classList.remove('counting'), 400);
        }
      }
    }
    requestAnimationFrame(tick);
  }

  // Trigger saat elemen masuk viewport (scroll ke sana)
  const statEl = el.closest('.i-stat') || el;
  if('IntersectionObserver' in window){
    const obs = new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){ runCount(); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(statEl);
  } else {
    setTimeout(runCount, 1800);
  }
})();

/* ═══ DATA ═══ */
const START=mcfaParse(MCFA_CORE.projectStart); // DAY 1 — dibaca dari MCFA_CORE (local-midnight, bebas geser zona waktu)
const END=mcfaParse(MCFA_CORE.projectEnd); // hari terakhir periode utama — dibaca dari MCFA_CORE. perfectPhaseStart = awal FASE SEMPURNA (di luar hitungan hari proyek).

/* Elapsed days counter for banner */
(function(){
  const el=document.getElementById('pb-elapsed');
  if(!el)return;
  const now=mcfaNowJakarta();
  el.textContent=MCFA_DERIVED.projectStatus(now); // HARI PERSIAPAN → DAY n → FASE SEMPURNA (dari MCFA_CORE)
})();

const GRID1=[
  {id:'g1_1',emoji:'gift',name:'Ultah Caca — Sepatu Samba + Boneka Nailong',amt:'Rp 2.000.000',val:2000000,
    desc:'Bayar utang Caca + hadiahkan Sepatu Samba + Boneka Nailong di hari ulang tahunnya',
    steps:[{num:'01',title:'Bayar Utang Caca',desc:'Lunasi tagihan yang ada ke Caca terlebih dahulu'},{num:'02',title:'Beli Sepatu Samba',desc:'Adidas Samba ori untuk hadiah spesial'},{num:'03',title:'Boneka Nailong',desc:'Cari boneka Nailong yang sudah lama diinginkan'},{num:'04',title:'Bungkus & Kasih',desc:'Bungkus cantik dan kasih di hari ulang tahunnya'}]},
  {id:'g1_2',emoji:'washer',name:'Mesin Cuci untuk Mamah',amt:'Rp 3.000.000',val:3000000,
    desc:'Hadiah sayang untuk Mamah yang sudah berjuang keras',
    steps:[{num:'01',title:'Survey Toko',desc:'Bandingkan harga mesin cuci di beberapa toko'},{num:'02',title:'Pilih Model',desc:'Pilih tipe front/top loader sesuai kebutuhan'},{num:'03',title:'Beli & Instalasi',desc:'Beli dan pastikan instalasi berjalan lancar'}]},
  {id:'g1_3',emoji:'phone',name:'HP Tecno 40 untuk Senot',amt:'Rp 3.500.000',val:3500000,
    desc:'HP baru untuk Senot agar lebih produktif',
    steps:[{num:'01',title:'Cek Spesifikasi',desc:'Pastikan Tecno 40 sesuai kebutuhan Senot'},{num:'02',title:'Beli HP',desc:'Beli di toko resmi atau marketplace terpercaya'},{num:'03',title:'Setup & Kado',desc:'Setup HP dan kasih sebagai hadiah'}]},
  {id:'g1_4',emoji:'tablet',name:'Tablet untuk Ayla',amt:'Rp 2.000.000',val:2000000,
    desc:'Tablet untuk belajar dan aktivitas Ayla',
    steps:[{num:'01',title:'Pilih Tablet',desc:'Pilih tablet yang sesuai usia dan kebutuhan Ayla'},{num:'02',title:'Install App Belajar',desc:'Siapkan aplikasi edukatif yang berguna'}]},
  {id:'g1_5',emoji:'tv',name:'TV untuk Nenek',amt:'Rp 1.000.000',val:1000000,desc:'Hiburan baru untuk nenek tercinta di rumah'},
  {id:'g1_5b',emoji:'phone',name:'2x HP Samsung A07',amt:'Rp 3.000.000',val:3000000,desc:'2 unit HP Samsung A07 @ Rp 1.500.000'},
  {id:'g1_6',emoji:'moto',name:'Motor (Buat Diri Sendiri)',amt:'Rp 10.000.000',val:10000000,
    desc:'Motor pertama untuk mobilitas sehari-hari',
    steps:[{num:'01',title:'Kumpulkan DP',desc:'Siapkan uang muka untuk kredit motor'},{num:'02',title:'Pilih Motor',desc:'Survey dan bandingkan tipe motor yang diinginkan'},{num:'03',title:'Proses Kredit',desc:'Ajukan kredit di leasing terpercaya'},{num:'04',title:'Ambil Motor!',desc:'Proses STNK dan bawa pulang motor impian'}]},
  {id:'g1_7',emoji:'phone',name:'iPhone 13',amt:'Rp 5.500.000',val:5500000,
    desc:'HP impian untuk upgrade kehidupan digital',
    steps:[{num:'01',title:'Kumpulkan Dana',desc:'Sisihkan dari penghasilan untuk beli cash'},{num:'02',title:'Beli Second/Baru',desc:'Cari kondisi terbaik dengan harga terbaik'},{num:'03',title:'Setup & Migrasi',desc:'Pindahkan data dan setup sesuai kebutuhan'}]},
  {id:'g1_8',emoji:'watch',name:'Smartwatch',amt:'Rp 2.000.000',val:2000000,
    desc:'Smartwatch untuk tracking kesehatan & fitness journey',
    steps:[{num:'01',title:'Pilih Model',desc:'Riset smartwatch terbaik sesuai kebutuhan'},{num:'02',title:'Beli & Aktivasi',desc:'Beli dan setup smartwatch'}]},
  {id:'g1_10',emoji:'banknote',name:'Bayar Utang Keluarga',amt:'Rp 10.000.000',val:10000000,desc:'Lunasi semua hutang kepada anggota keluarga'},
  {id:'g1_11',emoji:'home',name:'Renovasi Rumah Mamah',amt:'Rp 20.000.000',val:20000000,
    desc:'Renovasi total rumah orang tua tersayang',
    steps:[{num:'01',title:'Survey & RAB',desc:'Buat rencana anggaran bersama tukang kepercayaan'},{num:'02',title:'Perbaiki Struktur',desc:'Atap, dinding, dan fondasi utama'},{num:'03',title:'Finishing',desc:'Cat, plafon, dan detail estetika'},{num:'04',title:'Furnitur Baru',desc:'Tambah perabot yang dibutuhkan Mamah'}]},
  {id:'g1_12',emoji:'tools',name:'Renovasi Rumah Sendiri + Alat Konten',amt:'Rp 8.000.000',val:8000000,
    reno:true,desc:'Renovasi 5 ruangan: Kamar Mandi · Dapur · Studio · Ruang Tengah · Depan Teras (checklist per ruangan di bawah) + alat konten',
    renos:[{title:'Kamar Mandi · Sisa anggaran Rp 150.000',detail:'Cat hijau muda + putih · aksesoris tanaman & DIY · ganti plafon'},{title:'Dapur · belum ada angka anggaran',detail:'Cat hijau + langit-langit cokelat · perlengkapan masak, piring, dispenser, karpet'},{title:'Studio · Rp 850.000',detail:'Cat putih + plafon cokelat · wallpaper kayu & sage · poster, bingkai, buku fake · PC gaming'},{title:'Ruang Tengah · Rp 4.800.000',detail:'Cat kuning mustard + plafon cokelat · lantai vinyl · kasur, lemari, gorden hitam, AC'},{title:'Depan Teras · Rp 500.000',detail:'Cat abu-abu + hazel · sofa, matras · peralatan olahraga kayu lalu besi'}]},
];
const GRID2=[
  {id:'g2_1',emoji:'moto',name:'Motor Benelli PE',amt:'Rp 30.000.000',val:30000000,
    desc:'Motor sport impian pertama',
    steps:[{num:'01',title:'Test Ride',desc:'Coba langsung di dealer resmi Benelli'},{num:'02',title:'Kumpulkan Cash',desc:'Beli tunai agar lebih hemat tanpa bunga'},{num:'03',title:'Ambil Motor!',desc:'Bawa pulang Benelli PE impian'}]},
  {id:'g2_1b',emoji:'monitor',name:'Rakit PC',amt:'Rp 8.000.000',val:8000000,
    desc:'PC rakitan untuk kebutuhan kerja dan kreatif',
    steps:[{num:'01',title:'Kumpulkan Dana',desc:'Sisihkan dari penghasilan untuk rakit PC'},{num:'02',title:'Beli',desc:'Beli komponen dan rakit PC'}]},
  {id:'g2_1c',emoji:'laptop',name:'Laptop Sheina',amt:'Rp 5.000.000',val:5000000,
    desc:'Laptop untuk Sheina',
    steps:[{num:'01',title:'Kumpulkan Dana',desc:'Sisihkan dari penghasilan untuk laptop Sheina'},{num:'02',title:'Beli',desc:'Beli laptop untuk Sheina'}]},
  {id:'g2_1d',emoji:'tablet',name:'Tab Xiaomi SE',amt:'Rp 2.000.000',val:2000000,
    desc:'Tablet Xiaomi SE',
    steps:[{num:'01',title:'Kumpulkan Dana',desc:'Sisihkan dari penghasilan untuk Tab Xiaomi SE'},{num:'02',title:'Beli',desc:'Beli Tab Xiaomi SE'}]},
  {id:'g2_2',emoji:'moto',name:'Motor Sheina',amt:'Rp 15.000.000',val:15000000,
    desc:'Motor untuk Sheina tersayang',
    steps:[{num:'01',title:'Survey Bersama',desc:'Pilih motor bareng Sheina sesuai selera'},{num:'02',title:'Beli & Kado',desc:'Beli dan serahkan sebagai hadiah spesial'}]},
  {id:'g2_2b',emoji:'projector',name:'Proyektor',amt:'Rp 2.000.000',val:2000000,desc:'Proyektor untuk studio konten dan nonton film'},
  {id:'g2_2c',emoji:'shoe',name:'Sepatu Lari',amt:'Rp 2.000.000',val:2000000,desc:'Sepatu lari untuk menunjang fitness journey'},
  {id:'g2_2d',emoji:'shirt',name:'Perlengkapan Baju/Fashion',amt:'Rp 1.000.000',val:1000000,desc:'Perlengkapan baju dan fashion sehari-hari'},
  {id:'g2_3',emoji:'plane',name:'Temui Caca ke China',amt:'Rp 20.000.000',val:20000000,
    desc:'Perjalanan spesial menemui Caca di China — mimpi yang dinantikan',
    steps:[{num:'01',title:'Urus Paspor',desc:'Siapkan paspor dan dokumen perjalanan'},{num:'02',title:'Visa China',desc:'Ajukan visa China dengan dokumen lengkap'},{num:'03',title:'Beli Tiket',desc:'Booking tiket pesawat jauh-jauh hari agar hemat'},{num:'04',title:'Akomodasi',desc:'Booking hotel atau tempat tinggal di China'},{num:'05',title:'Berangkat!',desc:'Perjalanan impian menemui Caca🇨🇳'}]},
  {id:'g2_4',emoji:'banknote',name:'Lunasi Utang Orang Tua',amt:'Rp 15.000.000',val:15000000,desc:'Melunasi semua utang orang tua sebagai bentuk bakti'},
  {id:'g2_5',emoji:'land',name:'Tanah WA Iyas',amt:'Rp 200.000.000',val:200000000,
    desc:'Investasi tanah untuk masa depan keluarga',
    steps:[{num:'01',title:'Survey Lokasi',desc:'Cek kondisi dan legalitas tanah di lokasi WA Iyas'},{num:'02',title:'Cek Sertifikat',desc:'Pastikan SHM dan kondisi bebas sengketa'},{num:'03',title:'Negosiasi',desc:'Nego harga terbaik dengan penjual'},{num:'04',title:'Proses Notaris',desc:'AJB dan balik nama di notaris terpercaya'},{num:'05',title:'Sertifikat Aman',desc:'Simpan sertifikat tanah di tempat yang aman'}]},
];
const GRID3=[
  {id:'g3_1',emoji:'home',name:'Bangun Rumah',amt:'Rp 400.000.000',val:400000000,
    desc:'Bangun rumah impian dari nol untuk keluarga',
    steps:[{num:'01',title:'Siapkan Tanah',desc:'Pastikan tanah sudah siap dan legal untuk dibangun'},{num:'02',title:'Desain Rumah',desc:'Buat desain rumah impian bersama arsitek'},{num:'03',title:'IMB / PBG',desc:'Urus izin mendirikan bangunan secara resmi'},{num:'04',title:'Fondasi & Struktur',desc:'Tahap konstruksi utama — pasang pondasi dan kerangka'},{num:'05',title:'Dinding & Atap',desc:'Bangun dinding, pasang rangka atap dan genteng'},{num:'06',title:'Instalasi',desc:'Pasang jaringan listrik, air bersih, dan saluran pembuangan'},{num:'07',title:'Finishing',desc:'Plester, cat, keramik, dan detail interior'},{num:'08',title:'Pindah Masuk!',desc:'Rumah impian siap ditempati keluarga'}]},
  {id:'g3_2',emoji:'sofa',name:'Perabotan Rumah',amt:'Rp 50.000.000',val:50000000,
    desc:'Lengkapi rumah baru dengan furnitur & perabotan pilihan',
    steps:[{num:'01',title:'List Kebutuhan',desc:'Buat daftar furnitur dan perabotan prioritas'},{num:'02',title:'Survey & Beli',desc:'Beli furnitur berkualitas sesuai anggaran'},{num:'03',title:'Instalasi & Dekorasi',desc:'Susun dan dekorasi semua ruangan'}]},
];
const GRID4=[
  {id:'g4_1',emoji:'car',name:'Mobil Ertiga GX Gen 1',amt:'Rp 120.000.000',val:120000000,
    desc:'Mobil keluarga pertama yang nyaman',
    steps:[{num:'01',title:'Kumpulkan DP',desc:'Siapkan uang muka ~20-30% dari harga'},{num:'02',title:'Cek Unit',desc:'Beli second — cek mesin, body, dan surat-surat'},{num:'03',title:'Proses Pembelian',desc:'Proses pembiayaan atau beli tunai'},{num:'04',title:'Balik Nama',desc:'Proses balik nama STNK dan BPKB atas nama sendiri'}]},
  {id:'g4_2',emoji:'car',name:'Mobil BMW E46 325i',amt:'Rp 100.000.000',val:100000000,
    desc:'Mobil sport klasik favorit — impian sejak kecil',
    steps:[{num:'01',title:'Hunt Unit Bagus',desc:'Cari E46 325i kondisi prima, pajak hidup'},{num:'02',title:'Inspeksi Mesin',desc:'Bawa ke bengkel spesialis BMW untuk cek menyeluruh'},{num:'03',title:'Negosiasi & Beli',desc:'Deal harga terbaik, proses pembayaran'},{num:'04',title:'Servis & Modif',desc:'Servis rutin dan sentuhan personal favorit'}]},
  {id:'g4_3',emoji:'car',name:'Mobil Mercy W115',amt:'Rp 100.000.000',val:100000000,
    desc:'Kendaraan serbaguna untuk keluarga (sudah peremajaan)',
    steps:[{num:'01',title:'Cari Unit',desc:'Cari Mercy W115 kondisi terbaik'},{num:'02',title:'Cek & Beli',desc:'Inspeksi menyeluruh dan proses pembelian'}]},
  {id:'g4_4',emoji:'moto',name:'Motor SMV16 Modif Road Glide',amt:'Rp 65.000.000',val:65000000,
    desc:'Motor modifikasi bergaya Road Glide',
    steps:[{num:'01',title:'Siapkan Basis',desc:'Cari unit basis SMV16 kondisi terbaik'},{num:'02',title:'Desain Modif',desc:'Rancang tampilan ala Road Glide'},{num:'03',title:'Proses Modifikasi',desc:'Kerjakan modifikasi di bengkel terpercaya'}]},
  {id:'g4_5',emoji:'moto',name:'Motor Chopper',amt:'Rp 40.000.000',val:40000000,
    desc:'Motor chopper impian',
    steps:[{num:'01',title:'Cari Unit',desc:'Cari motor chopper kondisi terbaik'},{num:'02',title:'Cek & Beli',desc:'Inspeksi menyeluruh dan proses pembelian'}]},
];

const ALL_GOALS=[...GRID1,...GRID2,...GRID3,...GRID4];
const ALL_DEBTS_ID=[
  'd_kreditpintar1','d_spinjamayah','d_gopaymamah',
  'd_cairin','d_uangme','d_ktakilat','d_klikumkm','d_samir','d_allobank','d_easycash','d_adapundi','d_indosaku','d_kreditpintar2',
  'd_gopaypinjamayah',
  'd_gopaylater4','d_spinjam4','d_spaylater4','d_spaylatermamah4',
  'd_gopaylater5','d_sp1_5','d_sp2_5','d_sp3_5','d_sp4_5','d_sp5_5','d_sp6_5','d_sp7_5','d_sp8_5','d_sp9_5','d_sp10_5','d_sp11_5',
  'd_gopaylater6','d_spinjam6','d_spaylatermamah6',
  'd_sp1_7','d_sp2_7','d_sp3_7','d_sp4_7','d_sp5_7','d_sp6_7','d_sp7_7','d_sp8_7','d_sp9_7','d_sp10_7','d_sp11_7'
];
const LV_DEBTS={
  lc1:['d_kreditpintar1','d_spinjamayah','d_gopaymamah'],
  lc2:['d_cairin','d_uangme','d_ktakilat','d_klikumkm','d_samir','d_allobank','d_easycash','d_adapundi','d_indosaku','d_kreditpintar2'],
  lc3:['d_gopaypinjamayah'],
  lc4:['d_gopaylater4','d_spinjam4','d_spaylater4','d_spaylatermamah4'],
  lc5:['d_gopaylater5','d_sp1_5','d_sp2_5','d_sp3_5','d_sp4_5','d_sp5_5','d_sp6_5','d_sp7_5','d_sp8_5','d_sp9_5','d_sp10_5','d_sp11_5'],
  lc6:['d_gopaylater6','d_spinjam6','d_spaylatermamah6'],
  lc7:['d_sp1_7','d_sp2_7','d_sp3_7','d_sp4_7','d_sp5_7','d_sp6_7','d_sp7_7','d_sp8_7','d_sp9_7','d_sp10_7','d_sp11_7'],
};

/* STATE */
let S={};
try{S=JSON.parse(localStorage.getItem('fathul_light_v1')||'{}');}catch(e){}
function save(){
  try{
    localStorage.setItem('fathul_light_v1',JSON.stringify(S));
    return true;
  }catch(e){
    return false;
  }
}
/* Sinkron dari penyimpanan (20261110.8): centang Kehidupan yang lebih baru dari tab/jendela lain dimuat dulu sebelum mengubah & menulis, agar tidak tertimpa salinan memori yang basi. */
function syncS(){
  try{ var r=localStorage.getItem('fathul_light_v1'); if(r){ var o=JSON.parse(r); if(o&&typeof o==='object'&&!Array.isArray(o)){ S=o; return true; } } }catch(e){}
  return false;
}

/* DATE */
function fmtDate(d){return formatDateUpper(d);}
function dayIdx(d){return mcfaDaysBetween(START,mcfaMidnight(d))+1;}   /* selisih hari kalender (fungsi pusat) */

/* RENDER GOALS */
/* Ikon goal: nama ikon → <svg><use> dari sprite (tanpa emoji) */
function goalIco(n){ return '<svg class="mi" aria-hidden="true"><use href="#mi-'+n+'"/></svg>'; }
function renderGoals(items,cid){
  const el=document.getElementById(cid);
  el.innerHTML=items.map(item=>{
    const done=!!S[item.id];
    const stamp=S[item.id+'_stamp']||'';
    let detHtml='';
    if(item.steps&&item.steps.length){
      detHtml=`<div class="detail-steps">${item.steps.map(s=>`
        <div class="step-item">
          <div class="step-num">TAHAP ${s.num}</div>
          <div class="step-title">${s.title}</div>
          <div class="step-desc">${s.desc}</div>
        </div>`).join('')}</div>`;
    }
    if(item.reno&&item.renos){
      detHtml=renoDetailHtml(item);
    }
    const hasDet=!!(item.steps||item.reno);
    return `
    <div class="goal-card ${done?'achieved':''} ${hasDet?'expandable':''} reveal" id="gc_${item.id}">
      <div class="g-ribbon">TERCAPAI</div>
      <div class="goal-main" onclick="toggleGoal('${item.id}',this.closest('.goal-card'))">
        <div class="g-check">${done?'✓':goalIco(item.emoji)}</div>
        <div class="g-body">
          <div class="g-name">${item.name}</div>
          ${item.desc?`<div class="g-desc">${item.desc}</div>`:''}
          ${item.reno?'<div class="rn-mini" id="rn-mini"></div>':''}
          <div class="g-stamp" id="stamp_${item.id}" style="${done&&stamp?'display:flex':'display:none'}">
            <span>${goalIco('calendar')} ${stamp}</span>
          </div>
        </div>
        <div class="g-right">
          <div class="g-amt">${item.amt}</div>
          ${hasDet?`<div class="g-expand-btn" onclick="event.stopPropagation();toggleDetail('${item.id}')">Detail ▾</div>`:''}
        </div>
      </div>
      ${hasDet?`<div class="goal-detail" id="detail_${item.id}">${detHtml}</div>`:''}
    </div>`;
  }).join('');
}

function toggleDetail(id){
  const c=document.getElementById('gc_'+id);
  if(!c)return;
  c.classList.toggle('open');
  const btn=c.querySelector('.g-expand-btn');
  if(btn)btn.textContent=c.classList.contains('open')?'Tutup ▴':'Detail ▾';
}

/* ═══ RENOVASI RUMAH SENDIRI — checklist interaktif per ruangan ═══
   Progres tiap item disimpan terpisah di localStorage 'mcfa_reno_v1' (ikut ter-backup cloud). Tidak menyentuh data tujuan finansial (S / fathul_light_v1).
   Format: {v:1, checks:{idItem:true}, custom:{idRuangan:[{id,text}]}, open:{idRuangan:true}}. Centang tidak pernah berasal dari judul ruangan. */
const RENO_KEY = 'mcfa_reno_v1';
const RENO_ROOMS = [
  {id:'km', letter:'A', name:"KAMAR MANDI", sub:"Sisa anggaran Rp 150.000", budget:150000, sisa:true, items:[
      ['km01',"Cat tembok hijau muda"],
      ['km02',"Pembatas putih"],
      ['km03',"Gantungan baju putih"],
      ['km04',"Cermin"],
      ['km05',"Tempat sabun"],
      ['km07',"Tempat sikat gigi"],
      ['km08',"Wadah sabun cair"],
      ['km12',"Aksesoris daun sintetis (5 meter)"],
      ['km15',"Bunga matahari sintetis (1 meter)"],
      ['km16',"Bunga matahari batang"],
      ['km17',"Pot besar"],
      ['km18',"Tanaman lidah mertua"],
      ['km19',"Pot gantung"],
      ['km20',"Tanaman janda bolong"],
      ['km21',"DIY jamur (3)"],
      ['km22',"DIY kumbang merah (5)"],
      ['km23',"Papan 4 (ukuran 40, 30, 20, 10)"],
      ['km24',"Poster kecil (2)"],
      ['km25',"Gayung kuning"],
      ['km26',"Cat fitting lampu jadi jamur"],
      ['km27',"Ember hijau"],
      ['km13',"Ganti plafon"]
  ]},
  {id:'dp', letter:'B', name:"DAPUR", sub:"", budget:0, items:[
      ['dp01',"Cat hijau"],
      ['dp02',"Cat cokelat langit-langit"],
      ['dp03',"Gorden cokelat"],
      ['dp04',"Tempat piring"],
      ['dp05',"Piring dan mangkuk"],
      ['dp06',"Gorden bawah wastafel"],
      ['dp07',"Kompor"],
      ['dp08',"Sendok dan garpu"],
      ['dp09',"Perlengkapan masak: wajan, spatula, dan centong"],
      ['dp10',"Perlengkapan lain: talenan dan lain-lain"],
      ['dp11',"Buat tempat gelas"],
      ['dp12',"Gelas"],
      ['dp13',"Wallpaper wastafel"],
      ['dp20',"Piring estetik putih"],
      ['dp21',"Ganti tempat sendok cokelat"],
      ['dp14',"Poster masak A3+"],
      ['dp22',"Kayu tempat bumbu 40 × 5 (3)"],
      ['dp23',"Tempat saos/kecap"],
      ['dp24',"Kecap botol, saos"],
      ['dp25',"Keset tumbuhan"],
      ['dp26',"Tempat kopi"],
      ['dp27',"Tong sampah"],
      ['dp19',"Aksesoris tumbuhan"],
      ['dp15',"Tempat dispenser air"],
      ['dp16',"Dispenser air"],
      ['dp28',"Karpet P 100 × L 120 cm"]
  ]},
  {id:'st', letter:'C', name:"STUDIO", sub:"Anggaran Rp 850.000", budget:850000, items:[
      ['st01',"Cat putih"],
      ['st02',"Plafon cat cokelat"],
      ['st03',"Wallpaper kayu"],
      ['st04',"Sisi plafon dicat cokelat"],
      ['st10',"Gorden bawah meja hijau sage"],
      ['st13',"Papan panjang 40 × 10 (3)"],
      ['st14',"Papan 100 × 10 (3)"],
      ['st15',"Reng 150 × 2 (2)"],
      ['st16',"Buat buku fake (8)"],
      ['st17',"Poster kecil (5)"],
      ['st18',"Gantungan baju cokelat"],
      ['st19',"Wallpaper kayu (30 × 100)"],
      ['st20',"Wallpaper sage (170 × 100)"],
      ['st21',"Bingkai A4 (2)"],
      ['st22',"Poster A4 (3)"],
      ['st23',"Poster A5 (3)"],
      ['st24',"Bingkai A3+"],
      ['st25',"Poster A3+"],
      ['st26',"Tanaman dan pot kecil (6)"],
      ['st27',"Daun rambat (2)"],
      ['st28',"Kursi DIY"],
      ['st29',"Aksesoris tambahan"],
      ['st12',"PC gaming"]
  ]},
  {id:'rt', letter:'D', name:"RUANG TENGAH", sub:"Anggaran Rp 4.800.000", budget:4800000, items:[
      ['rt01',"Cat kuning mustard"],
      ['rt02',"Plafon warna cokelat"],
      ['rt03',"Bikin samping kayu warna cokelat"],
      ['rt04',"Green screen"],
      ['rt05',"Lampu kuning"],
      ['rt06',"Tempat cantolan baju"],
      ['rt07',"Tempat aksesoris dekat gantungan baju"],
      ['rt08',"Kursi pakai kain"],
      ['rt09',"Poster"],
      ['rt10',"Tempat Zona Asumsi"],
      ['rt19',"Kayu ambalan (2 unit)"],
      ['rt20',"Dekorasi gitar"],
      ['rt12',"Lantai vinyl"],
      ['rt22',"Lemari baju pendek"],
      ['rt13',"Gorden hitam 2 × 1,8 m"],
      ['rt15',"Kasur 90 × 200 cm"],
      ['rt16',"Sprei army"],
      ['rt23',"Lemari baju"],
      ['rt24',"Daun jurai (2)"],
      ['rt25',"Buku fake (5)"],
      ['rt17',"Pintu rak buku (L 120 × P 220) (2)"],
      ['rt18',"AC"],
      ['rt26',"Aksesoris lain"]
  ]},
  {id:'tr', letter:'E', name:"DEPAN TERAS", sub:"Termasuk peralatan olahraga besi · Anggaran Rp 500.000", budget:500000, items:[
      ['tr01',"Cat abu-abu"],
      ['tr02',"Peralatan olahraga awal (kayu): tempat barbel"],
      ['tr03',"Peralatan olahraga awal (kayu): pull-up"],
      ['tr04',"Peralatan olahraga awal (kayu): samsak"],
      ['tr05',"Sofa"],
      ['tr06',"Cat hazel"],
      ['tr07',"Matras hitam (2)"],
      ['tr08',"Poster"],
      ['tr09',"Tempat medali"],
      ['tr10',"Ganti kain sofa"],
      ['tr11',"Tambah lampu dan turunkan lampu"],
      ['tr12',"Cat abu-abu garasi"],
      ['tr13',"Kipas angin"],
      ['gr01',"Peralatan olahraga besi: tempat barbel"],
      ['gr02',"Peralatan olahraga besi: pull-up"],
      ['gr03',"Peralatan olahraga besi: samsak"],
      ['gr04',"Peralatan olahraga besi: dips"],
      ['gr05',"Peralatan olahraga besi: kursi"],
      ['gr06',"Peralatan olahraga besi: katrol"]
  ]}
];
function renoEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function renoLoad(){
  var o = {v:1, checks:{}, custom:{}, open:{}, mig:{}, cost:{}};
  try{
    var raw = localStorage.getItem(RENO_KEY);
    if(raw){ var p = JSON.parse(raw); if(p && typeof p === 'object'){ o.checks = p.checks || {}; o.custom = p.custom || {}; o.open = p.open || {}; o.mig = p.mig || {}; if(p.cost && typeof p.cost === 'object'){ Object.keys(p.cost).forEach(function(k){ var v = Math.floor(+p.cost[k]); if(isFinite(v) && v > 0) o.cost[k] = v; }); } } }
  }catch(e){}
  /* migrasi: ruang GARASI digabung ke DEPAN TERAS (id item gr01–gr06 tetap, centang lama aman) */
  if(o.custom.gr){ o.custom.tr = (o.custom.tr || []).concat(o.custom.gr); delete o.custom.gr; }
  if(o.open.gr){ o.open.tr = true; delete o.open.gr; }
  /* migrasi (25 Okt 2026): 'Kayu ambalan' 1 dan 2 digabung jadi satu item (2 unit) — selesai hanya jika KEDUA centang lama aktif; berjalan sekali (penanda mig.ambalan) */
  if(!o.mig.ambalan){ o.checks.rt19 = !!(o.checks.rt19 && o.checks.rt21); if(!o.checks.rt19) delete o.checks.rt19; delete o.checks.rt21; o.mig.ambalan = 1; }
  /* migrasi (26 Okt 2026): status awal — barang SEBELUM titik awal = selesai, titik awal s/d akhir = belum selesai. Berjalan sekali (mig.statusAwal); barang buatan sendiri tidak disentuh. */
  if(!o.mig.statusAwal){
    var START = {km:'km12', dp:'dp21', st:'st04', rt:'rt20', tr:'tr06'};
    RENO_ROOMS.forEach(function(r){ var at = START[r.id]; if(!at) return; var hit = false;
      r.items.forEach(function(x){ if(x[0] === at) hit = true; if(hit) delete o.checks[x[0]]; else o.checks[x[0]] = true; }); });
    o.mig.statusAwal = 1; renoSave(o);
  }
  return o;
}
function renoSave(o){ try{ localStorage.setItem(RENO_KEY, JSON.stringify(o)); return true; }catch(e){ return false; } }
function renoItems(room, st){
  var base = room.items.map(function(x){ return {id:x[0], text:x[1], custom:false}; });
  var extra = (st.custom[room.id] || []).map(function(x){ return {id:x.id, text:x.text, custom:true}; });
  return base.concat(extra);
}
function renoCount(room, st){
  var it = renoItems(room, st), d = 0;
  it.forEach(function(x){ if(st.checks[x.id]) d++; });
  return {done:d, total:it.length, pct: it.length ? Math.round(d / it.length * 100) : 0};
}
function renoTotals(st){
  var d = 0, t = 0;
  RENO_ROOMS.forEach(function(r){ var c = renoCount(r, st); d += c.done; t += c.total; });
  return {done:d, total:t, pct: t ? Math.round(d / t * 100) : 0};
}
/* Biaya aktual per item = DATA saja (st.cost{idItem: rupiah numerik}). Bukan pengeluaran/pemasukan, tidak masuk total Keuangan, tidak menandai item selesai. */
function renoCost(room, st){ var sum = 0; renoItems(room, st).forEach(function(x){ sum += st.cost[x.id] || 0; }); return sum; }
function renoRp(n){ return 'Rp '+Number(n).toLocaleString('id-ID'); }
function renoCostText(r, st){
  var sum = renoCost(r, st); if(!sum) return '';
  var t = ' · biaya tercatat '+renoRp(sum);
  if(r.budget > 0){ var d = r.budget - sum;
    if(r.sisa) t += d >= 0 ? ' · sisa setelah biaya tercatat '+renoRp(d) : ' · melebihi sisa anggaran '+renoRp(-d);   /* Rp150.000 = sisa anggaran saat ini, bukan biaya total */
    else t += d >= 0 ? ' · sisa anggaran '+renoRp(d) : ' · melebihi anggaran '+renoRp(-d); }
  return t;
}
function renoSetCost(id, raw){
  var st = renoLoad(), v = parseInt(String(raw || '').replace(/[^0-9]/g, ''), 10);
  if(isFinite(v) && v > 0) st.cost[id] = v; else delete st.cost[id];
  if(!renoSave(st)){ if(typeof showNotif === 'function') showNotif('Gagal menyimpan. Coba lagi.'); return; }
  renoRender();
}
var RENO_NOTES_HTML = '';
function renoDetailHtml(item){
  var notes = (item && item.renos || []).map(function(r){ return '<div class="reno-item"><strong>'+r.title+'</strong>'+r.detail+'</div>'; }).join('');
  RENO_NOTES_HTML = notes;
  return '<div class="rn-wrap" id="rn-root"></div>';
}
function renoBudgetLine(){
  var sum = 0; RENO_ROOMS.forEach(function(r){ sum += r.budget || 0; });
  var goal = 0; try{ GRID1.forEach(function(g){ if(g.id === 'g1_12') goal = g.val; }); }catch(e){}
  var fmt = function(n){ return 'Rp '+n.toLocaleString('id-ID'); };
  var line = 'ANGGARAN & SISA ANGGARAN RUANGAN TERCATAT '+fmt(sum)+' · DAPUR BELUM ADA ANGKA (MASUK TARGET TUJUAN)';
  if(goal > 0){
    var sisa = goal - sum;
    line += (sisa >= 0)
      ? ' · TARGET TUJUAN '+fmt(goal)+' → SISA '+fmt(sisa)+' UNTUK DAPUR, ALAT KONTEN & KEBUTUHAN LAIN'
      : ' · MELEBIHI TARGET TUJUAN '+fmt(goal)+' SEBESAR '+fmt(-sisa);
  }
  return '<div style=\"font-size:11px;letter-spacing:.4px;opacity:.85;margin:8px 0 2px;line-height:1.5\">'+line+'</div>';
}
function renoRender(){
  var root = document.getElementById('rn-root'); if(!root) return;
  var st = renoLoad(), tot = renoTotals(st), h = '';
  h += '<div class="rn-sum"><div class="k">PROGRES RENOVASI RUMAH SENDIRI</div>' +
       '<div class="big"><b>'+tot.done+'/'+tot.total+'</b><span>pekerjaan selesai · '+tot.pct+'%</span></div>' +
       '<div class="bar"><i style="width:'+tot.pct+'%"></i></div>' + renoBudgetLine() + '<div class="rn-chips">' +
       RENO_ROOMS.map(function(r){ var c = renoCount(r, st); return '<span class="rn-chip">'+renoEsc(r.name.split(' / ')[0])+'<b>'+c.done+'/'+c.total+'</b></span>'; }).join('') +
       '</div></div>';
  RENO_ROOMS.forEach(function(r){
    var c = renoCount(r, st), open = !!st.open[r.id], full = c.total > 0 && c.done === c.total;
    h += '<div class="rn-room'+(open ? ' open' : '')+(full ? ' full' : '')+'" id="rn-room-'+r.id+'">' +
      '<button type="button" class="rn-head" aria-expanded="'+open+'" onclick="renoToggleRoom(\''+r.id+'\')">' +
        '<span class="rn-badge">'+r.letter+'</span>' +
        '<span class="rn-title"><b>'+renoEsc(r.name)+'</b><small>'+c.done+'/'+c.total+' selesai'+(r.sub ? ' · '+renoEsc(r.sub) : '')+renoCostText(r, st)+'</small></span>' +
        '<span class="rn-pct">'+c.pct+'%</span><span class="rn-chev"></span></button>' +
      '<div class="rn-bar"><i style="width:'+c.pct+'%"></i></div>' +
      '<div class="rn-body">' +
      renoItems(r, st).map(function(x){
        var on = !!st.checks[x.id];
        return '<div class="rn-it'+(on ? ' done' : '')+'" role="checkbox" aria-checked="'+on+'" tabindex="0" onclick="renoToggle(\''+x.id+'\')" onkeydown="if(event.key===\' \'||event.key===\'Enter\'){event.preventDefault();renoToggle(\''+x.id+'\')}">' +
          '<span class="rn-cb">'+(on ? '✓' : '')+'</span><span class="rn-tx">'+renoEsc(x.text)+'</span>' +
          '<input class="rn-cost" type="text" inputmode="numeric" maxlength="12" aria-label="Biaya aktual (data saja)" placeholder="0" value="'+(st.cost[x.id] ? st.cost[x.id].toLocaleString('id-ID') : '')+'" onclick="event.stopPropagation()" onkeydown="event.stopPropagation()" onchange="renoSetCost(\''+x.id+'\',this.value)">' +
          (x.custom ? '<button type="button" class="rn-x" title="Hapus pekerjaan ini" onclick="event.stopPropagation();renoDel(\''+r.id+'\',\''+x.id+'\')">×</button>' : '') +
        '</div>';
      }).join('') +
      '<div class="rn-add"><input id="rn-inp-'+r.id+'" type="text" maxlength="120" placeholder="Tambah pekerjaan di '+renoEsc(r.name.split(' / ')[0].toLowerCase())+'..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();renoAdd(\''+r.id+'\')}">' +
        '<button type="button" onclick="renoAdd(\''+r.id+'\')">+ TAMBAH</button></div>' +
      '</div></div>';
  });
  if(RENO_NOTES_HTML){
    var no = !!st.open._notes;
    h += '<div class="rn-room rn-notes'+(no ? ' open' : '')+'">' +
      '<button type="button" class="rn-head" aria-expanded="'+no+'" onclick="renoToggleRoom(\'_notes\')"><span class="rn-badge">i</span>' +
      '<span class="rn-title"><b>CATATAN UMUM &amp; TEMA</b><small>Informasi — bukan checklist</small></span><span class="rn-chev"></span></button>' +
      '<div class="rn-body"><div class="reno-grid">'+RENO_NOTES_HTML+'</div></div></div>';
  }
  root.innerHTML = h;
  var mini = document.getElementById('rn-mini');
  if(mini) mini.innerHTML = '<span>'+tot.done+'/'+tot.total+' pekerjaan selesai · '+tot.pct+'%</span><i><b style="width:'+tot.pct+'%"></b></i>';
}
function renoToggle(id){
  var st = renoLoad(), prev = !!st.checks[id];
  if(prev) delete st.checks[id]; else st.checks[id] = true;
  if(!renoSave(st)){ if(typeof showNotif === 'function') showNotif('Gagal menyimpan. Coba lagi.'); return; }
  renoRender();
  try{ if(!prev && typeof playTap === 'function') playTap(); }catch(e){}
}
function renoToggleRoom(rid){
  var st = renoLoad(); st.open[rid] = !st.open[rid];
  renoSave(st); renoRender();
}
function renoAdd(rid){
  var inp = document.getElementById('rn-inp-'+rid); if(!inp) return;
  var txt = inp.value.trim(); if(!txt) return;
  var st = renoLoad(); st.custom[rid] = st.custom[rid] || [];
  st.custom[rid].push({id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), text:txt.slice(0,120)});
  st.open[rid] = true;
  if(!renoSave(st)){ if(typeof showNotif === 'function') showNotif('Gagal menyimpan. Coba lagi.'); return; }
  renoRender();
  var again = document.getElementById('rn-inp-'+rid); if(again) again.focus();
}
function renoDel(rid, id){
  if(!confirm('Hapus pekerjaan tambahan ini?')) return;
  var st = renoLoad();
  st.custom[rid] = (st.custom[rid] || []).filter(function(x){ return x.id !== id; });
  delete st.checks[id]; delete st.cost[id];
  if(!renoSave(st)){ if(typeof showNotif === 'function') showNotif('Gagal menghapus. Coba lagi.'); return; }
  renoRender();
}
(function _renoValidate(){
  var exp = {km: 22, dp: 26, st: 23, rt: 23, tr: 19}, bad = [], seen = {};
  RENO_ROOMS.forEach(function(r){
    if(r.items.length !== exp[r.id]) bad.push(r.id+' '+r.items.length+' ≠ '+exp[r.id]);
    r.items.forEach(function(x){ if(seen[x[0]]) bad.push('id ganda '+x[0]); seen[x[0]] = 1; });
  });
  /* hitungan progres dari state tiruan (tidak menyentuh data asli) */
  var km = RENO_ROOMS[0], fake = {checks:{}, custom:{}, open:{}};
  if(renoCount(km, fake).done !== 0 || renoCount(km, fake).pct !== 0) bad.push('progres awal ≠ 0%');
  km.items.forEach(function(x){ fake.checks[x[0]] = true; });
  if(renoCount(km, fake).pct !== 100) bad.push('semua item dicentang ≠ 100%');
  delete fake.checks[km.items[0][0]];
  if(renoCount(km, fake).done !== km.items.length - 1) bad.push('batal centang tidak mengurangi progres');
  fake.custom.km = [{id:'ctest', text:'uji'}];
  if(renoCount(km, fake).total !== km.items.length + 1) bad.push('item tambahan tidak dihitung');
  /* penyimpanan: tulis-baca lalu kembalikan isi semula */
  try{
    var raw = localStorage.getItem(RENO_KEY), t = renoLoad(); t.checks.__uji = true;
    if(!renoSave(t) || renoLoad().checks.__uji !== true) bad.push('centang tidak tersimpan');
    if(raw === null) localStorage.removeItem(RENO_KEY); else localStorage.setItem(RENO_KEY, raw);
  }catch(e){ bad.push('penyimpanan gagal: '+e.message); }
  if(bad.length) console.warn('[RENOVASI] validasi gagal:', bad); else console.info('[RENOVASI] validasi OK: 5 ruangan, 113 pekerjaan, hitungan progres & penyimpanan');
})();

renderGoals(GRID1,'grid1');
renderGoals(GRID2,'grid2');
renderGoals(GRID3,'grid3');
renderGoals(GRID4,'grid4');
renoRender();

/* TOGGLE GOAL */
function toggleGoal(id,el){
  syncS();
  const prevVal=S[id];
  const prevStamp=S[id+'_stamp'];
  S[id]=!S[id];
  const item=ALL_GOALS.find(i=>i.id===id);
  if(S[id]){
    const now=mcfaNowJakarta();
    const di=dayIdx(now);
    const stamp=`${fmtDate(now)} · Hari ke-${di>0?di.toLocaleString('id-ID'):'—'}`;
    S[id+'_stamp']=stamp;
  } else {
    delete S[id+'_stamp'];
  }
  if(!save()){
    // Gagal simpan: batalkan perubahan, jangan sentuh UI/audio sama sekali
    S[id]=prevVal;
    if(prevStamp!==undefined) S[id+'_stamp']=prevStamp; else delete S[id+'_stamp'];
    showNotif('Gagal menyimpan. Coba lagi.');
    return;
  }
  /* Keuangan ikut berubah SEBELUM tampilan: bila buku gagal menyimpan, centang dibatalkan agar checklist & transaksi tidak pernah berbeda. */
  var _lr=null; try{ _lr=_mcfaGoalLedger(item, !!S[id]); }catch(e){ _lr=null; }
  if(_lr && _lr.ok===false){
    S[id]=prevVal; if(prevStamp!==undefined) S[id+'_stamp']=prevStamp; else delete S[id+'_stamp']; save();
    showNotif(_lr.msg||'Gagal mencatat ke Keuangan. Centang dibatalkan.'); return;
  }
  if(S[id]){
    const stamp=S[id+'_stamp'];
    el.classList.add('achieved');
    el.classList.add('just-achieved');
    setTimeout(()=>el.classList.remove('just-achieved'),650);
    const chk=el.querySelector('.g-check');
    chk.textContent='✓';
    chk.classList.add('pop');
    setTimeout(()=>chk.classList.remove('pop'),550);
    const st=document.getElementById('stamp_'+id);
    if(st){st.style.display='flex';st.querySelector('span').innerHTML=goalIco('calendar')+' '+stamp;}
    showNotif(''+item.name.slice(0,40)+' — Tercapai!');
    playGoalAchieved();
    boom();
  } else {
    el.classList.remove('achieved');
    el.querySelector('.g-check').innerHTML=goalIco(item.emoji);
    const st=document.getElementById('stamp_'+id);
    if(st)st.style.display='none';
    showNotif('↩️ Ditandai belum tercapai');
    playUndo();
  }
  updateAll();
}
/* KEHIDUPAN → KEUANGAN (OTOMATIS, tanpa pop-up): target bernominal yang dicentang = satu transaksi tertaut (ID 'KH-<id target>'); undo = transaksi dibatalkan; nominal berubah = transaksi diperbarui.
   Jenis = 'out' (pembelian/pelunasan) kecuali item.ftype==='in'; kategori = item.fcat bila valid, utang → 'Cicilan / Hutang', selain itu 'Lainnya'. Item tanpa nominal (val ≤ 0) tidak membuat transaksi. */
var _MCFA_GOAL_CAT = {g1_10:'Cicilan / Hutang', g2_4:'Cicilan / Hutang'};
function _mcfaGoalLedger(item, done){
  var API = window.MCFA_FIN_LEDGER; if(!API || !API.syncLinked || !item || !(item.val > 0)) return null;
  var rp = 'Rp ' + item.val.toLocaleString('id-ID'), ty = item.ftype==='in' ? 'in' : 'out';
  var r = API.syncLinked('KH-' + item.id, done ? {amount:item.val, type:ty, cat:item.fcat || _MCFA_GOAL_CAT[item.id] || 'Lainnya', note:'Target Kehidupan: ' + item.name} : null);
  if(r && r.ok && r.action){ setTimeout(function(){ try{ showNotif(r.action==='remove' ? (ty==='in'?'Pemasukan':'Pengeluaran')+' '+rp+' dibatalkan di Keuangan, saldo diperbarui' : (ty==='in'?'Pemasukan ':'Pengeluaran ')+rp+(r.action==='update'?' diperbarui':' tercatat')+' di Keuangan'); }catch(e){} }, 700); }
  return r;
}
/* Panggil bila nominal sebuah target berubah: transaksi tertaut (bila targetnya sedang tercentang) ikut diperbarui. */
window.mcfaGoalNominalChanged = function(id){ var it = ALL_GOALS.find(function(g){ return g.id===id; }); if(it && S[id]) return _mcfaGoalLedger(it, true); return null; };

/* TOGGLE DEBT */
function toggleDebt(row){
  const id=row.dataset.id;
  syncS();
  const prevVal=S[id];
  const prevStamp=S[id+'_stamp'];
  S[id]=!S[id];
  const name=row.querySelector('.d-name').textContent;
  if(S[id]){
    const now=mcfaNowJakarta();
    const di=dayIdx(now);
    const stamp=`Lunas: ${fmtDate(now)}${di>0?' · Hari ke-'+di.toLocaleString('id-ID'):''}`;
    S[id+'_stamp']=stamp;
  } else {
    delete S[id+'_stamp'];
  }
  if(!save()){
    S[id]=prevVal;
    if(prevStamp!==undefined) S[id+'_stamp']=prevStamp; else delete S[id+'_stamp'];
    showNotif('Gagal menyimpan. Coba lagi.');
    return;
  }
  if(S[id]){
    const stamp=S[id+'_stamp'];
    row.classList.add('paid');
    row.querySelector('.d-check').textContent='✓';
    const ds=document.getElementById('ds_'+id);
    if(ds){ds.textContent=stamp;ds.style.display='block';}
    showNotif(''+name+' — Lunas!');
    playDebtPaid();
    boom(12);
  } else {
    row.classList.remove('paid');
    row.querySelector('.d-check').textContent='';
    const ds=document.getElementById('ds_'+id);
    if(ds){ds.textContent='';ds.style.display='none';}
  }
  updateAll();checkLvDone();
}

/* RESTORE STATE */
ALL_DEBTS_ID.forEach(id=>{
  const row=document.querySelector(`[data-id="${id}"]`);
  if(!row)return;
  if(S[id]){
    row.classList.add('paid');
    row.querySelector('.d-check').textContent='✓';
    const stamp=S[id+'_stamp']||'';
    const ds=document.getElementById('ds_'+id);
    if(ds&&stamp){ds.textContent=stamp;ds.style.display='block';}
  }
});
ALL_GOALS.forEach(item=>{
  if(S[item.id]){
    const c=document.getElementById('gc_'+item.id);
    if(!c)return;
    c.classList.add('achieved');
    const gc=c.querySelector('.g-check');
    if(gc)gc.textContent='✓';
    const st=document.getElementById('stamp_'+item.id);
    const stamp=S[item.id+'_stamp']||'';
    if(st&&stamp){st.style.display='flex';const sp=st.querySelector('span');if(sp)sp.innerHTML=goalIco('calendar')+' '+stamp;}
  }
});

/* LV DONE */
function checkLvDone(){
  Object.entries(LV_DEBTS).forEach(([lc,ids])=>{
    const done=ids.every(id=>S[id]);
    const cnt=ids.filter(id=>S[id]).length;
    document.getElementById(lc).classList.toggle('lv-done',done);
    const bar=document.getElementById('lp_'+lc);
    if(bar)bar.style.width=(cnt/ids.length*100)+'%';
  });
}
checkLvDone();

/* SINKRON LINTAS-TAB (20261110.8): bila tab/jendela lain mengubah centang Kehidupan, tampilan di sini ikut selaras (dua arah: tercentang & dibatalkan). Hanya DOM; tidak menulis penyimpanan, tanpa suara/animasi. */
window.addEventListener('storage',function(e){
  if(!e||(e.key&&e.key!=='fathul_light_v1')) return;
  if(!syncS()) return;
  try{
    ALL_DEBTS_ID.forEach(function(id){
      var row=document.querySelector('[data-id="'+id+'"]'); if(!row) return;
      var on=!!S[id], ck=row.querySelector('.d-check'), ds=document.getElementById('ds_'+id);
      row.classList.toggle('paid',on); if(ck) ck.textContent=on?'✓':'';
      if(ds){ ds.textContent=on?(S[id+'_stamp']||''):''; ds.style.display=(on&&S[id+'_stamp'])?'block':'none'; }
    });
    ALL_GOALS.forEach(function(item){
      var c=document.getElementById('gc_'+item.id); if(!c) return;
      var on=!!S[item.id], gc=c.querySelector('.g-check'), st=document.getElementById('stamp_'+item.id);
      c.classList.toggle('achieved',on);
      if(gc) gc.innerHTML=on?'✓':goalIco(item.emoji);
      if(st){ if(on&&S[item.id+'_stamp']){ st.style.display='flex'; var sp=st.querySelector('span'); if(sp) sp.innerHTML=goalIco('calendar')+' '+S[item.id+'_stamp']; } else st.style.display='none'; }
    });
    updateAll(); checkLvDone();
  }catch(x){}
});

/* TOGGLE LV */
function toggleLv(id){document.getElementById(id).classList.toggle('open');}

/* PHASE NAV */
let curPhase=0;
function switchPhase(n){
  document.querySelectorAll('.phase-panel').forEach((p,i)=>p.classList.toggle('active',i===n));
  document.querySelectorAll('.phase-tab').forEach((b,i)=>b.classList.toggle('active',i===n));
  curPhase=n;
}

/* STATS */
const PHASE_GOALS=[ALL_DEBTS_ID,GRID1.map(i=>i.id),GRID2.map(i=>i.id),GRID3.map(i=>i.id),GRID4.map(i=>i.id)];
const PL=['Bangun Pondasi','Reward','Motor & Cinta','Bangun Rumah','Mobil Impian'];

/* ── AUTO CALCULATION HELPERS ── */
/* Semua total dihitung dari data GRID (val), bukan angka manual */
function sumVal(grid){ return grid.reduce((a,i)=>a+(i.val||0),0); }
function fmtRp(n){ return 'Rp ' + n.toLocaleString('id-ID'); }
function fmtRpDot(n){ return 'Rp ' + n.toLocaleString('id-ID').replace(/,/g,'.'); }
function fmtShort(n){
  if(n>=1000000000){
    const v=n/1000000000;
    const s=(Math.round(v*100)/100).toString().replace('.',',');
    return 'Rp '+s+' M';
  }
  const jt=Math.round(n/1000000);
  return 'Rp '+jt+' jt';
}
/* Sumber tunggal finansial: kurs & target harian — dipakai Kehidupan & Keuangan */
/* Kurs USD/IDR: manual (tersimpan di mcfa_usd_rate_v1), default 17.000 = kurs referensi, BELUM diverifikasi ke sumber live. Nominal Rupiah tetap sumber utama. */
const MCFA_FIN={usdRate:(function(){ try{ var v=+localStorage.getItem('mcfa_usd_rate_v1'); return (isFinite(v) && v>=1000 && v<=100000) ? v : 17000; }catch(e){ return 17000; } })(),dailyUsd:20,daysPerMonth:30};
function fmtUsd(n){
  const usd=n/MCFA_FIN.usdRate; // kurs tunggal, tanpa pembulatan antar-langkah
  return '~$'+usd.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' USD';
}
/* Nominal tiap baris ditentukan pemilik per tahap (atribut data-rp-t="T1,T2,T3"); idx = indeks tahap terpilih.
   Belum dipilih = tahap berjalan menurut tanggal Jakarta (MCFA_TAHAP.running(); sama dengan _t1Stage) — sebelum DAY 1 itu Tahap 1. */
function finStageFactor(){
  var n=null;
  try{
    if(window.MCFA_TAHAP&&MCFA_TAHAP.get){ n=MCFA_TAHAP.get(); if(n===null&&MCFA_TAHAP.running) n=MCFA_TAHAP.running(); }
  }catch(e){ n=null; }
  return {n:n, idx:(n===2?1:(n===3?2:0))};
}
const FIN_KIDS_TARGET=[1500000,3000000,4500000]; /* jajan anak-anak per tahap; = 50% dari pendapatan K.P Cihuy */
const FIN_KIDS_CAT='Pendapatan KP.CIHUY';
function finKidsRefresh(){
  var card=document.querySelector('.fc-kids'); if(!card) return;
  var SF=finStageFactor(), tgt=FIN_KIDS_TARGET[SF.idx], need=tgt*2, inc=0;
  try{
    var ym=mcfaTodayIso().slice(0,7);
    window.MCFA_FIN_CALC.activeTx().forEach(function(t){ if(t&&t.type==='in'&&(t.cat===FIN_KIDS_CAT||t.cat==='Pendapatan K.P Cihuy')&&String(t.date).slice(0,7)===ym) inc+=t.amount; });   /* satu sumber: transaksi aktif valid */
  }catch(e){}
  var half=Math.floor(inc/2), q=function(id){ return document.getElementById(id); };
  q('kidsKids').textContent=fmtRpDot(tgt); q('kidsMe').textContent=fmtRpDot(tgt);
  q('kidsInc').textContent=fmtRpDot(inc);
  var tt=q('kidsTotal'); tt.setAttribute('data-rp',String(need)); tt.textContent=fmtRpDot(need);
  q('kidsNote').textContent= inc>=need
    ? 'Target tercapai \u00B7 anak-anak '+fmtRpDot(half)+' \u00B7 saya '+fmtRpDot(inc-half)
    : 'Masuk '+fmtRpDot(inc)+' \u2192 anak-anak '+fmtRpDot(half)+' \u00B7 saya '+fmtRpDot(inc-half)+' \u00B7 kurang '+fmtRpDot(need-inc)+'. Catat di Buku Transaksi, kategori "'+FIN_KIDS_CAT+'".';
  if(typeof finUsdRefresh==='function') finUsdRefresh();
}
function finUsdRefresh(){
  var usd=function(rp){ return '≈ US$ '+(rp/MCFA_FIN.usdRate).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); };
  function put(host,rp,cls){ if(!host) return; var e=host.querySelector(':scope > .'+cls); if(!e){ e=document.createElement('span'); e.className=cls; host.appendChild(e); } e.textContent=usd(rp); }
  /* USD hanya untuk total (bukan per baris) */
  document.querySelectorAll('.finance-card .fc-row .fc-usd').forEach(function(e){ e.remove(); });
  document.querySelectorAll('.finance-card .fc-total').forEach(function(t){ var v=t.querySelector('.fc-total-val'); if(v) put(t,_rpOf(v),'fc-usd'); });
  var g=document.querySelector('.fg-amount'); if(g) put(g.parentNode,_rpOf(g),'fc-usd');
  var inp=document.getElementById('finRateInput'); if(inp && document.activeElement!==inp) inp.value=MCFA_FIN.usdRate.toLocaleString('id-ID');
}
document.addEventListener('mcfa-ledger',function(){ try{ finKidsRefresh(); }catch(e){} });
window.addEventListener('storage',function(){ try{ finKidsRefresh(); }catch(e){} });
function finSetRate(raw){
  var v=parseInt(String(raw||'').replace(/[^0-9]/g,''),10), msg=document.getElementById('finRateMsg');
  if(!isFinite(v)||v<1000||v>100000){ if(msg) msg.textContent='Kurs tidak valid. Isi angka Rupiah per 1 USD (1.000–100.000).'; return; }
  MCFA_FIN.usdRate=v; /* kurs langsung dipakai, walau penyimpanan browser diblokir (mis. pratinjau/viewer) */
  var saved=true; try{ localStorage.setItem('mcfa_usd_rate_v1',String(v)); }catch(e){ saved=false; }
  var stamp=formatStampUpper(new Date());
  if(msg) msg.textContent= saved ? ('Kurs manual disimpan · '+stamp) : ('Kurs diterapkan · '+stamp+' (belum tersimpan permanen: penyimpanan browser diblokir, buka file di browser biasa)');
  updateAll();
}
/* Sumber angka = atribut numerik data-rp (bukan teks tampilan 'Rp 325.000'); teks hanya fallback untuk elemen lama */
function _rpOf(el){ if(el && el.hasAttribute && el.hasAttribute('data-rp')){ var v = +el.getAttribute('data-rp'); if(isFinite(v)) return v; } return parseInt(((el && el.textContent)||'').replace(/[^0-9]/g,''),10) || 0; }
/* Total Fase 1 (Bangun Pondasi) dihitung langsung dari nominal tiap debt-row di DOM,
   supaya akurat sampai rupiah dan otomatis ikut berubah jika data hutang diedit */
function sumDebts(){
  let total=0;
  document.querySelectorAll('.debt-row .d-val').forEach(el=>{
    total += _rpOf(el) || 0;
  });
  return total;
}
const GRID_TOTALS=[sumVal(GRID1),sumVal(GRID2),sumVal(GRID3),sumVal(GRID4)];
/* Total hutang = nilai ASLI (26.803.816 tetap 26.803.816); pembulatan hanya untuk tampilan ringkas (fmtShort) */
const PHASE1_TOTAL=sumDebts();
const GRAND_TOTAL_VAL=PHASE1_TOTAL+GRID_TOTALS.reduce((a,b)=>a+b,0);

function updateAll(){
  const dots=document.getElementById('phaseDots');
  dots.innerHTML=PHASE_GOALS.map((ids,i)=>{
    const done=ids.filter(id=>S[id]).length;
    const pct=Math.round(done/ids.length*100);
    const isDone=done===ids.length;
    return `<div class="phase-mini ${isDone?'done':''}" onclick="switchPhase(${i})">
      <div class="phase-mini-pct">${pct}%</div>
      <div class="phase-mini-label">${PL[i]}</div>
      <div class="phase-mini-bar"><div class="phase-mini-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  /* tabs done state */
  PHASE_GOALS.forEach((ids,i)=>{
    const done=ids.every(id=>S[id]);
    document.getElementById('pn'+i).classList.toggle('done',done);
  });

  const allIds=[...ALL_DEBTS_ID,...ALL_GOALS.map(g=>g.id)];
  const td=allIds.filter(id=>S[id]).length;
  const pct=Math.round(td/allIds.length*100);
  document.getElementById('masterBar').style.width=pct+'%';
  document.getElementById('masterPct').textContent=pct+'%';
  document.getElementById('masterPctBadge').textContent=pct+'%';

  const gd=ALL_GOALS.filter(g=>S[g.id]).length;
  const gpvGoals=ALL_GOALS.filter(g=>S[g.id]).reduce((a,g)=>a+g.val,0);
/* Terbayar = goal tercapai + hutang yang sudah dilunasi (dibaca dari baris hutang) */
const gpvDebts=ALL_DEBTS_ID.filter(id=>S[id]).reduce((a,id)=>{const el=document.querySelector('.debt-row[data-id="'+id+'"] .d-val');return a+(el?(_rpOf(el)||0):0);},0);
const gpv=gpvGoals+gpvDebts;
  document.getElementById('totalDone').textContent=`${gd}/${ALL_GOALS.length} Tercapai`;
  document.getElementById('totalPaid').textContent='Rp '+gpv.toLocaleString('id-ID');
  document.getElementById('grandGoals').textContent=`${td}/${allIds.length} Target`;
  document.getElementById('grandGoalsCard').textContent=`${td}/${allIds.length} Tercapai`;

  const todayMidnight=mcfaNowJakarta();
  const dl=MCFA_DERIVED.projectDaysLeft(todayMidnight); // dari MCFA_CORE; sebelum DAY 1 = total penuh
  document.getElementById('daysLeft').textContent=dl.toLocaleString('id-ID')+' Hari';
  document.getElementById('daysLeftGrand').textContent=dl.toLocaleString('id-ID')+' hari tersisa';

  /* ── Fase 1 (Hutang) dihitung dari baris hutang di DOM ── */
  const _d0=document.getElementById('ptAmt0'); if(_d0) _d0.textContent=fmtShort(PHASE1_TOTAL);
  const _d1=document.getElementById('debtSub'); if(_d1) _d1.textContent='7 Level · Total '+fmtRpDot(PHASE1_TOTAL);
  const _d2=document.getElementById('debtTotalAmt'); if(_d2) _d2.textContent=fmtRpDot(PHASE1_TOTAL);
  /* ── Keuangan: target harian/bulanan, total kartu, dan total penghasilan dihitung dari data ── */
  (function(){
    const F=MCFA_FIN;
    /* Total alokasi bulanan = jumlah semua kartu (Keluarga + Diri Sendiri), dibaca dari data-rp tiap baris */
    /* Tiap baris = nominal pada tahap terpilih (data-rp-t). Total kartu = target bulanan; tidak ada pengali otomatis. */
    const SF=finStageFactor(), tots=[0,0,0];
    let grand=0;
    document.querySelectorAll('.finance-card:not(.fc-kids) .fc-val').forEach(function(el){
      var arr=(el.getAttribute('data-rp-t')||'').split(',').map(Number), ok=arr.length===3&&arr.every(isFinite);
      var v= ok ? arr[SF.idx] : (_rpOf(el)||0);
      for(var i=0;i<3;i++) tots[i]+= ok ? arr[i] : v;
      el.setAttribute('data-rp',String(v)); el.textContent=fmtRpDot(v);
    });
    /* Bayar Utang: di Tahap 3 (dan setelah semua utang lunas) alokasinya menjadi Investasi */
    (function(){
      var el=document.querySelector('.fc-val[data-debt]'); if(!el) return;
      var lb=el.parentNode.querySelector('.fc-label'); if(!lb) return;
      var lunas=(typeof ALL_DEBTS_ID!=='undefined' && ALL_DEBTS_ID.length>0 && ALL_DEBTS_ID.every(function(id){ return S[id]; }));
      var tn=[].slice.call(lb.childNodes).filter(function(n){ return n.nodeType===3; }).pop();
      if(tn) tn.textContent=' '+(SF.n===3?'Investasi':(lunas?'Investasi (utang lunas)':'Bayar Utang'));
    })();
    document.querySelectorAll('.finance-card:not(.fc-kids)').forEach(function(card){
      let sum=0; card.querySelectorAll('.fc-val').forEach(function(el){ sum+=_rpOf(el)||0; });
      const tv=card.querySelector('.fc-total-val'); if(tv){ tv.textContent=fmtRpDot(sum); grand+=sum; }
    });
    const ga=document.querySelector('.fg-amount'); if(ga && grand>0) ga.textContent=fmtRpDot(grand);
    /* Target penghasilan mengikuti alokasi: Rupiah = sumber utama, USD & per hari diturunkan dari kurs.
       Cadangan (jika kartu kosong): F.dailyUsd × hari × kurs. */
    const monthlyRp = grand>0 ? grand : F.dailyUsd*F.daysPerMonth*F.usdRate;
    const dailyRp = monthlyRp/F.daysPerMonth, dailyUsd = dailyRp/F.usdRate, monthlyUsd = monthlyRp/F.usdRate;
    const usd2 = function(v){ return v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); };
    const amts=document.querySelectorAll('.dtarget-amount');
    if(amts[0]) amts[0].textContent='$'+usd2(dailyUsd);
    if(amts[1]) amts[1].innerHTML=Math.round(dailyRp/1000)+'<span class="dtarget-unit">K</span>';
    const mv=document.querySelector('.dtarget-m-val'); if(mv) mv.textContent='$'+usd2(monthlyUsd)+' \u00A0\u00B7\u00A0 '+fmtRpDot(monthlyRp);
    const rt=document.querySelector('.dtarget-rate'); if(rt) rt.textContent='Kurs referensi: 1 USD \u2248 '+fmtRpDot(F.usdRate);
    /* Catatan kenaikan antar tahap (dihitung dari data, hanya Tahap 2–3) */
    (function(){
      var ft=document.querySelector('.dtarget-footer'); if(!ft) return;
      var rn=document.getElementById('dtargetRange');
      if(SF.n===2||SF.n===3){
        if(!rn){ rn=document.createElement('div'); rn.id='dtargetRange'; rn.className='dtarget-rate'; rn.style.marginTop='4px'; ft.appendChild(rn); }
        var prev=tots[SF.idx-1], pct=prev>0?Math.round((tots[SF.idx]/prev-1)*100):0;
        rn.textContent='Tahap '+SF.n+': naik '+pct+'% dari Tahap '+(SF.n-1)+' ('+fmtRpDot(prev)+' \u2192 '+fmtRpDot(tots[SF.idx])+')';
      } else if(rn){ rn.remove(); }
    })();
    finKidsRefresh();
    finUsdRefresh();
    /* Selisih target harian vs alokasi kartu — ditampilkan, bukan disembunyikan */
    if(ga && grand>0){
      const target=monthlyRp, diff=target-grand;
      let note=document.getElementById('fgNote');
      if(!note){ note=document.createElement('div'); note.id='fgNote'; note.className='fg-note'; ga.parentNode.appendChild(note); }
      note.textContent='Target harian '+fmtRpDot(target)+' \u00B7 alokasi '+fmtRpDot(grand)+' \u00B7 '+(diff===0?'seimbang':(diff>0?'sisa '+fmtRpDot(diff):'kurang '+fmtRpDot(-diff)));
    }
  })();
  /* ── Total tiap level hutang dihitung dari baris d-val (bukan angka manual) ── */
  document.querySelectorAll('.lv-card').forEach(function(card){
    let sum=0; card.querySelectorAll('.debt-row .d-val').forEach(function(el){ sum+=_rpOf(el)||0; });
    const amt=card.querySelector('.lv-amt'); if(amt) amt.textContent=(sum%1000===0?'':'~')+fmtRpDot(Math.round(sum/1000)*1000);
    const ft=card.querySelector('.lv-f-val'); if(ft) ft.textContent=fmtRpDot(sum);
  });
  /* ── Fase 2–5: tab, judul panel, kotak total & USD dihitung dari GRID ── */
  const _tabs=document.querySelectorAll('.phase-tab'), _pans=document.querySelectorAll('.phase-panel');
  for(let i=0;i<GRID_TOTALS.length;i++){
    const tot=GRID_TOTALS[i], boxVal=(i===0)?(PHASE1_TOTAL+tot):tot; /* Fase 2 = Pondasi + Reward (kumulatif) */
    const pt=_tabs[i+1]&&_tabs[i+1].querySelector('.pt-amt'); if(pt) pt.textContent=fmtShort(tot);
    const pan=_pans[i+1]; if(!pan) continue;
    const sp=pan.querySelector('.s-info p'); if(sp) sp.textContent=sp.textContent.replace(/Rp [\d.]+/,fmtRpDot(tot));
    const ta=pan.querySelector('.total-box .tb-amt'); if(ta) ta.textContent=fmtRpDot(boxVal);
    const tu=pan.querySelector('.total-box .tb-usd'); if(tu) tu.textContent=fmtUsd(boxVal);
  }
  /* ── Grand Total dihitung dari dataset (hutang + semua GRID) ── */
  const grandAmtEl=document.getElementById('grandAmt');
  if(grandAmtEl) grandAmtEl.textContent=fmtRpDot(GRAND_TOTAL_VAL);
  const grandSubEl=document.getElementById('grandSub');
  if(grandSubEl) grandSubEl.textContent=`${fmtUsd(GRAND_TOTAL_VAL)} \u00A0\u00B7\u00A0 ${formatDateUpper(MCFA_CORE.projectStart)} — ${formatDateUpper(MCFA_CORE.projectEnd)}`;
}
updateAll();

/* NOTIF */
let nT;
function showNotif(msg){
  const n=document.getElementById('notif');
  n.classList.remove('show');
  clearTimeout(nT);
  void n.offsetWidth;
  n.textContent=msg;
  n.classList.add('show');
  nT=setTimeout(()=>{
    n.classList.remove('show');
  },1800);
}
// Tap to dismiss
document.addEventListener('DOMContentLoaded',function(){
  var n=document.getElementById('notif');
  if(n) n.addEventListener('click',function(){
    clearTimeout(nT);
    n.classList.remove('show');
  });
});

/* SOUND ENGINE */
let _actx;
function _ac(){ if(!_actx) _actx=window.mcfaAudioCtx(); if(_actx.state==='suspended')_actx.resume(); return _actx; }
function playTap(){
  try{
    const ctx=_ac(); const t=ctx.currentTime;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(720,t); o.frequency.exponentialRampToValueAtTime(420,t+0.08);
    g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);
    o.connect(g);g.connect(ctx.destination); o.start(t); o.stop(t+0.1);
  }catch(e){}
}
function playSuccess(){
  try{
    const ctx=_ac(); const t=ctx.currentTime;
    // Rich triumphant chord sequence
    const notes=[523.25,659.25,783.99,1046.50,1318.51];
    notes.forEach((f,i)=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='triangle'; o.frequency.value=f;
      const st=t+i*0.09;
      g.gain.setValueAtTime(0.0001,st);
      g.gain.exponentialRampToValueAtTime(0.14,st+0.025);
      g.gain.exponentialRampToValueAtTime(0.0001,st+0.6);
      o.connect(g);g.connect(ctx.destination); o.start(st); o.stop(st+0.65);
    });
    // Extra shimmer on top
    const s=ctx.createOscillator(), sg=ctx.createGain();
    s.type='sine'; s.frequency.value=2093;
    sg.gain.setValueAtTime(0.0001,t+0.3);
    sg.gain.exponentialRampToValueAtTime(0.06,t+0.35);
    sg.gain.exponentialRampToValueAtTime(0.0001,t+0.9);
    s.connect(sg);sg.connect(ctx.destination);s.start(t+0.3);s.stop(t+0.95);
  }catch(e){}
}

function playGoalAchieved(){
  try{
    const ctx=_ac(); const t=ctx.currentTime;
    // Epic achievement fanfare
    const seq=[
      {f:392,d:0.0},{f:523.25,d:0.12},{f:659.25,d:0.24},
      {f:783.99,d:0.36},{f:1046.50,d:0.44},{f:1318.51,d:0.52}
    ];
    seq.forEach(({f,d})=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t+d);
      g.gain.exponentialRampToValueAtTime(0.18,t+d+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.5);
      o.connect(g);g.connect(ctx.destination);o.start(t+d);o.stop(t+d+0.55);
    });
    // Celebration bells
    [1046,1318,1568].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine'; o.frequency.value=f;
      const st=t+0.65+i*0.1;
      g.gain.setValueAtTime(0.0001,st);g.gain.exponentialRampToValueAtTime(0.1,st+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001,st+0.4);
      o.connect(g);g.connect(ctx.destination);o.start(st);o.stop(st+0.45);
    });
  }catch(e){}
}

function playDebtPaid(){
  try{
    const ctx=_ac(); const t=ctx.currentTime;
    // Satisfying "paid" sound - rising tone
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(440,t);
    o.frequency.exponentialRampToValueAtTime(880,t+0.15);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.15,t+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.4);
    // Coin sound
    const o2=ctx.createOscillator(),g2=ctx.createGain();
    o2.type='triangle'; o2.frequency.value=1760;
    g2.gain.setValueAtTime(0.0001,t+0.1);g2.gain.exponentialRampToValueAtTime(0.08,t+0.11);
    g2.gain.exponentialRampToValueAtTime(0.0001,t+0.3);
    o2.connect(g2);g2.connect(ctx.destination);o2.start(t+0.1);o2.stop(t+0.35);
  }catch(e){}
}

function playUndo(){
  try{
    const ctx=_ac(); const t=ctx.currentTime;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(660,t);
    o.frequency.exponentialRampToValueAtTime(440,t+0.12);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.07,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.2);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.25);
  }catch(e){}
}
function playUnlock(){
  try{
    const ctx=_ac(); const t=ctx.currentTime;
    // Tab/expand click sound
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(600,t);
    o.frequency.exponentialRampToValueAtTime(800,t+0.06);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.09,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+0.15);
  }catch(e){}
}
/* GLOBAL TAP SOUND — delegated, light click feedback on interactive elements */
document.addEventListener('click',function(e){
  const t=e.target.closest('.bp-ftab,.phase-tab,.bp-akun,.am-tag,.vc-sub-item');
  if(t){ playUnlock(); return; }
  const b=e.target.closest('button,.i-enter-btn');
  if(b){ playTap(); return; }
  const g=e.target.closest('.goal-card,.lv-card,.debt-row,[onclick]');
  if(g) playTap();
},true);

/* CONFETTI */
const CC=['#1a56db','#7c3aed','#059669','#d97706','#f43f5e','#ffffff','#0ea5e9','#10b981','#fde68a','#c8102e','#f97316','#8b5cf6','#ec4899','#fbbf24'];
function boom(n=40){
  const w=document.getElementById('cfWrap');
  if(!w) return;
  const shapes=['50%','3px','6px','0'];
  for(let i=0;i<n;i++){
    setTimeout(()=>{
      const p=document.createElement('div');p.className='cp';
      const c=CC[Math.floor(Math.random()*CC.length)];
      const s=5+Math.random()*8;
      const sh=shapes[Math.floor(Math.random()*shapes.length)];
      const dur=1.2+Math.random()*1.5;
      p.style.cssText=`left:${Math.random()*100}%;width:${s}px;height:${s}px;background:${c};border-radius:${sh};animation-duration:${dur}s;animation-delay:${Math.random()*0.3}s;`;
      w.appendChild(p);
      /* Remove immediately after animation ends */
      setTimeout(()=>{ if(p.parentNode) p.parentNode.removeChild(p); }, Math.ceil((dur+0.3)*1000)+100);
    },i*12);
  }
  /* Hard cleanup — wipe everything after 4s no matter what */
  setTimeout(()=>{ if(w) w.innerHTML=''; }, 4000);
}

/* BACK TO TOP */
(function(){
  const btEl = document.getElementById('backTop');
  if(!btEl) return;
  let btTicking = false;
  window.addEventListener('scroll',()=>{
    if(!btTicking){
      requestAnimationFrame(()=>{ btEl.classList.toggle('show', window.scrollY>300); btTicking = false; });
      btTicking = true;
    }
  }, {passive:true});
})();

/* SCROLL REVEAL — single global observer (canonical). Other reveal triggers
   in this file must call window.__revealScan() instead of creating their
   own IntersectionObserver, to avoid duplicate/stacked animations. */
(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const obs = ('IntersectionObserver' in window) ? new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        obs.unobserve(e.target);
        setTimeout(()=>{
          e.target.classList.add('settled');
          e.target.style.transitionDelay='';
        }, 700);
      }
    });
  },{threshold:0.1,rootMargin:'0px 0px -20px 0px'}) : null;

  let idx = 0;
  function scan(){
    document.querySelectorAll('.reveal:not(.visible):not(.settled)').forEach(el=>{
      if(prefersReduced || !obs){
        el.classList.add('visible','settled');
        el.style.transitionDelay='';
        return;
      }
      if(el.dataset.revealBound) return;
      el.dataset.revealBound='1';
      el.style.transitionDelay=(idx%5*.06)+'s';
      idx++;
      obs.observe(el);
    });
  }
  window.__revealScan = scan;

  const appEl = document.getElementById('app');
  if(appEl && appEl.classList.contains('visible')){
    /* #app was already revealed before this script ran (race condition) —
       scan immediately instead of waiting for a class change that will never come. */
    setTimeout(scan, 200);
  } else if(appEl){
    const mo = new MutationObserver(()=>{
      if(appEl.classList.contains('visible')){
        setTimeout(scan, 200);
        mo.disconnect();
      }
    });
    mo.observe(appEl,{attributes:true,attributeFilter:['class']});
  } else {
    scan();
  }
  setTimeout(scan, 1200);
  setTimeout(scan, 3000);
})();

/* BLUEPRINT TABS */
function bpTab(idx, el) {
  for (var i = 0; i < 5; i++) {
    var p = document.getElementById('bp-tab-' + i);
    if (p) p.style.display = (i === idx ? 'block' : 'none');
  }
  document.querySelectorAll('.bp-ftab').forEach(function(t, i) {
    t.classList.toggle('active', i === idx);
  });
}

/* AKUN MODAL */
var AKUN = {
  mcfa: {
    icon:'orb-red', bg:'#fef1f3', color:'#c8102e', badge:'PERSONA UTAMA',
    name:'MC FATHUL ADZIM', niche:'Influencer · Model · Sutradara · MC/Host · Aktor',
    persona:'Sosok utama — dark, intens, beraura bad boy yang penuh wibawa. Membangun ekosistem kreatif M.C.F.A STUDIO dari nol. Arsitek dari semua cerita.',
    desc:'Akun utama MC FATHUL ADZIM sebagai brand personal. Konten berkaitan dengan karir, dunia kreatif, behind the scenes M.C.F.A STUDIO, modeling, dan perjalanan membangun nama besar sebelum usia 25 tahun.',
    tags:['Personal Brand','Model','Influencer','Sutradara','MC/Host','Aktor','Creative Director'],
    stats:[
      {num:'Utama',lbl:'Persona',color:'#c8102e'},
      {num:'2×/Hari',lbl:'Posting',color:'#c8102e'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#c8102e'},
      {num:'2 JT',lbl:'Target Subs',color:'#c8102e'}
    ],
    strategi:[
      'Konten personal branding — perjalanan hidup, karir, dan mimpi sebelum 25 tahun',
      'Behind the scenes M.C.F.A STUDIO dan semua akun di bawah naungannya',
      'Konten model & penampilan profesional yang membangun aura bad boy',
      'Cerita inspiratif dengan tone intens dan misterius khas MC FATHUL ADZIM',
      'Kolaborasi lintas platform dan brand building yang konsisten'
    ]
  },
  fathulmeme: {
    icon:'orb-green', bg:'#edf7f1', color:'#1a6b3a', badge:'PERSONA KEDUA',
    name:'Fathul Al-Meme', niche:'Humor · Daily Vlog · Edukasi Ringan · Komunitas',
    persona:'Sisi asli yang ceria, hangat, dan merangkul semua orang. Pintar tanpa merendahkan. Berbagi ilmu dengan kebahagiaan. Ini jiwa yang paling jujur.',
    desc:'Second account yang menampilkan sisi keseharian Fathul yang berbeda 180° dari MC FATHUL ADZIM. Di sini dia lucu, hangat, relatable — berbagi meme, ilmu, dan keseharian tanpa filter karir.',
    tags:['Humor','Meme','Daily Vlog','Keseharian','Edukasi Ringan','Komunitas','Relatable'],
    stats:[
      {num:'Kedua',lbl:'Persona',color:'#1a6b3a'},
      {num:'2×/Hari',lbl:'Posting',color:'#1a6b3a'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#1a6b3a'},
      {num:'2 JT',lbl:'Target Subs',color:'#1a6b3a'}
    ],
    strategi:[
      'Meme & humor yang relatable — konten yang bikin senyum dan ketawa',
      'Keseharian asli tanpa filter — spontan dan jujur',
      'Sharing ilmu dengan cara yang menyenangkan, tidak menggurui',
      'Interaksi komunitas yang hangat dan merangkul semua kalangan',
      'Konten parodi dan komedi yang tetap berisi dan bermakna'
    ]
  },
  barongsukma: {
    icon:'dumbbell', bg:'#fef3ee', color:'#c44d18', badge:'FITNESS & BULKING',
    name:'Barongsukma', niche:'Fitness · Bulking · Running · Boxing',
    persona:'Sosok tengil tapi menjual. Omongannya memancing emosi netizen — tapi itu yang bikin dia viral. Inspirator bagi orang kurus yang mau berubah.',
    desc:'Akun fitness journey yang mendokumentasikan perjalanan latihan, perkembangan fisik, perubahan berat badan, running, workout, boxing, calisthenics, strength, dan mindset. Mengikuti PROGRAM BARONGSUKMA 4 FASE: bulking dan cutting bertahap dari 21 NOVEMBER 2026 (DAY 0) sampai 20 NOVEMBER 2027 (DAY 364), lalu siklus lanjutan 9 bulan: 4 bulan bulking (+20 KG), 1 bulan mencent, 3 bulan cutting (−20 KG), 1 bulan mencent (otot 85 KG).',
    tags:['Fitness','Running','Boxing','Calisthenics','DIY Gym'],
    program:true,
    stats:[
      {num:'4 Fase',lbl:'Program Utama',color:'#c44d18'},
      {num:'DAY 0→364',lbl:'Rentang Global Day',color:'#c44d18'},
      {num:'57→85kg',lbl:'Target Berat Awal → Akhir',color:'#c44d18'},
      {num:'2×/Hari',lbl:'Posting',color:'#1a6b3a'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#c44d18'},
      {num:'2 JT',lbl:'Target Subs',color:'#c44d18'}
    ],
    strategi:[
      'Dokumentasi harian sesuai fase program yang sedang berjalan — progres jujur tanpa filter',
      'Setiap pergantian fase (bulking ↔ cutting) dijadikan konten milestone — Global Day terus berjalan, progress fase kembali ke 0%',
      'Konten "tengil tapi menjual" yang memancing emosi & diskusi netizen',
      'Tutorial workout dengan peralatan minim / rumahan yang terjangkau',
      'Running & boxing journey — belajar dari nol sampai mahir',
      'Review makanan & suplemen bulking dengan budget anak muda Indonesia'
    ]
  },
  okk: {
    icon:'brain', bg:'#eef3fc', color:'#1a4fb0', badge:'EDUKASI ANAK',
    name:'Otak Kepala Kardus', niche:'Psikologi Anak · Parenting · Edukasi',
    persona:'Sosok yang dekat sekali dengan anak-anak. Seperti guru TK yang sayang muridnya — membangun kreativitas, mental, dan emosional anak.',
    desc:'Akun edukasi yang fokus pada perkembangan anak. Membangun kreativitas, mental, dan emosional anak-anak sekitar. Konten berisi kegiatan seru, fakta unik, dan keseharian anak.',
    tags:['Edukasi','Psikologi Anak','Parenting','Kreativitas','Mental Health','Anak-anak'],
    stats:[
      {num:'Semua',lbl:'Kalangan',color:'#1a4fb0'},
      {num:'2×/Hari',lbl:'Posting',color:'#1a4fb0'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#1a4fb0'},
      {num:'2 JT',lbl:'Target Subs',color:'#1a4fb0'}
    ],
    strategi:[
      'Konten membangun kreativitas anak dengan cara yang menyenangkan',
      'Fakta unik dunia anak yang orang tua perlu tahu',
      'Keseharian bersama anak yang menginspirasi dan heartwarming',
      'DIY aktivitas edukatif yang bisa dilakukan di rumah tanpa modal besar',
      'Konten psikologi anak yang disajikan ringan dan mudah dipahami'
    ]
  },
  zona: {
    icon:'eye', bg:'#f3effe', color:'#6b3cbc', badge:'HOROR & MISTERI',
    name:'Zona Asumsi', niche:'Horor · Misteri · Konspirasi · Spekulasi',
    persona:'Storyteller ulung. Skill komunikasi & storytelling luar biasa — penonton terbawa emosi, seakan ada dalam kejadian.',
    desc:'Akun misteri & horor dengan pendekatan sinematik. Membahas konspirasi, kasus misterius, spekulasi, dan fakta-fakta yang belum banyak didengar — disajikan lewat storytelling yang memukau.',
    tags:['Horor','Misteri','Konspirasi','Spekulasi','Storytelling','True Crime'],
    stats:[
      {num:'Semua',lbl:'Kalangan',color:'#6b3cbc'},
      {num:'2×/Hari',lbl:'Posting',color:'#6b3cbc'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#6b3cbc'},
      {num:'2 JT',lbl:'Target Subs',color:'#6b3cbc'}
    ],
    strategi:[
      'Video misteri dengan narasi sinematik & sound design profesional',
      'Kasus kriminal & konspirasi Indonesia yang jarang dibahas',
      'Storytelling yang membuat penonton terbawa dalam kejadian',
      'Fakta unik & misterius yang membuat penonton tercengang',
      'Series investigasi panjang yang bisa berkembang jadi podcast'
    ]
  },
  alley: {
    icon:'palette', bg:'#edf7f6', color:'#0d7c72', badge:'KREATIVITAS ANAK',
    name:"Alley's Creative Kids", niche:"DIY · Kerajinan · Lagu Anak · Jalan-jalan",
    persona:'Akun kreatif untuk anak-anak — lebih ke praktek. Membuat sesuatu dari barang bekas, lagu anak, jalan-jalan, dan keseharian yang menyenangkan.',
    desc:"Berbeda dengan Otak Kepala Kardus yang fokus psikologi, Alley's lebih ke aksi kreatif — membuat kerajinan dari barang bekas, menciptakan lagu anak, dan mengeksplorasi dunia.",
    tags:['DIY','Kerajinan','Barang Bekas','Lagu Anak','Jalan-jalan','Kreativitas'],
    stats:[
      {num:'Semua',lbl:'Kalangan',color:'#0d7c72'},
      {num:'2×/Hari',lbl:'Posting',color:'#0d7c72'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#0d7c72'},
      {num:'2 JT',lbl:'Target Subs',color:'#0d7c72'}
    ],
    strategi:[
      'Tutorial kerajinan dari barang bekas yang mudah diikuti anak-anak',
      'Lagu anak orisinal berbahasa Indonesia yang catchy & mendidik',
      'Konten jalan-jalan & eksplorasi alam yang menyenangkan',
      'DIY project yang bisa dikerjakan anak bersama orang tua',
      'Keseharian kreatif yang membuktikan imajinasi itu tak berbatas'
    ]
  },
  ayla: {
    icon:'flower', bg:'#fef1f3', color:'#c8102e', badge:'DUNIA ADIK',
    name:'Dunia Ayla', niche:'Keseharian · Edukasi · Permainan · Olahraga',
    persona:'Bukan akun milik pribadi — wadah yang dibuat kakak (MC FATHUL ADZIM) untuk adiknya berkarya. Keseharian tetap murni tanpa skrip; edukasi dan permainan dibuat ringan dan menyenangkan.',
    desc:'Keseharian Ayla yang genuine, ditambah edukasi, permainan, dan olahraga (bulutangkis, catur, lari). Dikelola kakak sebagai creative director, bersama Sheina sebagai manager.',
    tags:['Keseharian','Edukasi','Permainan','Bulutangkis','Catur','Lari','Genuine','Heartwarming'],
    stats:[
      {num:'Semua',lbl:'Kalangan',color:'#c8102e'},
      {num:'2×/Hari',lbl:'Posting',color:'#c8102e'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#c8102e'},
      {num:'2 JT',lbl:'Target Subs',color:'#c8102e'}
    ],
    extra:[
      {t:'4 Pilar Dunia Ayla',ic:'flower',rows:[
        ['Keseharian','Momen nyata, tanpa skrip'],
        ['Edukasi','Belajar hal baru dengan cara seru'],
        ['Permainan','Game & tantangan kakak-adik'],
        ['Olahraga','Bulutangkis · Catur · Lari']]}
    ],
    strategi:[
      'Momen keseharian Ayla yang 100% natural — tanpa skrip',
      'Edukasi ringan: Ayla belajar dan mencoba hal baru',
      'Permainan & tantangan seru bersama kakak',
      'Latihan dan progres bulutangkis, catur, dan lari',
      'Milestone tumbuh kembang Ayla yang direkam dengan cinta'
    ]
  },
  lol: {
    icon:'banana', bg:'#fdf8ee', color:'#b8860b', badge:'MARKETING & COMEDY',
    name:'LoL Monkey Shop', niche:'Marketing · Affiliate · Comedy · Jualan',
    persona:'Skill marketing di atas rata-rata — tapi tampilnya lucu, sering marah-marah, asal bunyi, yapping. Marah-marah dalam sesuatu yang lucu. Jualan tanpa terasa jualan.',
    desc:'Akun marketing dengan persona unik: marah-marah tapi lucu. Review produk, affiliate marketing, dan promosi yang tidak terasa seperti iklan. Fokus pada penjualan barang & affiliate.',
    tags:['Marketing','Affiliate','Comedy','Review','Promosi','Jualan'],
    stats:[
      {num:'Semua',lbl:'Kalangan',color:'#b8860b'},
      {num:'2×/Hari',lbl:'Posting',color:'#b8860b'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#b8860b'},
      {num:'2 JT',lbl:'Target Subs',color:'#b8860b'}
    ],
    strategi:[
      'Review produk dengan format komedi marah-marah yang menghibur',
      'Affiliate marketing yang natural — tidak terasa seperti hard selling',
      'Flash sale & promosi dengan konten absurd yang mudah viral',
      'Yapping konten: bicara panjang lebar soal produk dengan cara lucu',
      'Kolaborasi dengan brand lokal Indonesia untuk konten sponsored'
    ]
  },
  monkipedia: {
    icon:'clapper', bg:'#eef3fc', color:'#1a4fb0', badge:'CLAYMATION',
    name:'Monkipedia', niche:'Animasi Tanah Liat · Fakta Unik · Sejarah',
    persona:'Wadah bercerita & membagikan fakta unik, sejarah, apapun — dalam format animasi claymation (tanah liat) yang dibuat sendiri dari nol.',
    desc:'Akun animasi claymation stop-motion. Setiap video adalah karya tangan murni — sculpting, animating, hingga editing dilakukan sendiri. Konten: fakta unik dunia, sejarah, cerita pendek.',
    tags:['Claymation','Stop Motion','Animasi','Fakta Unik','Sejarah','DIY Art'],
    stats:[
      {num:'Semua',lbl:'Kalangan',color:'#1a4fb0'},
      {num:'2×/Hari',lbl:'Posting',color:'#1a4fb0'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#1a4fb0'},
      {num:'2 JT',lbl:'Target Subs',color:'#1a4fb0'}
    ],
    strategi:[
      'Video claymation fakta unik dunia yang dibuat sepenuhnya dengan tangan',
      'Short film animasi dengan karakter clay original yang ikonik',
      'Behind the scenes proses sculpting & animating yang menarik ditonton',
      'Fakta sejarah & kejadian unik disajikan dalam format animasi yang menggemaskan',
      'Kolaborasi dengan brand untuk konten animasi clay custom'
    ]
  },
  kpc: {
    icon:'community', bg:'#fef3ee', color:'#c44d18', badge:'SIRUANG UNITED',
    name:'KP.CIHUY', niche:'Kreatif Project · Siruang United',
    persona:'KP.CIHUY = Kreatif Project Siruang United. Wadah anak-anak untuk bermain, belajar, dan berkarya bareng — belajar sambil bersenang-senang, tanpa merasa dituntut, tapi berguna untuk masa depan mereka.',
    desc:'Keseharian, edukasi anak, permainan, pembelajaran, film & sinematik, serta olahraga (bola, bulutangkis, catur, lari). Punya squad bernama Siruang United. Anak-anak rata-rata kelas 6–10.',
    tags:['Keseharian','Edukasi Anak','Permainan','Film & Sinematik','Bola','Bulutangkis','Catur','Lari','Siruang United'],
    stats:[
      {num:'Semua',lbl:'Kalangan',color:'#c44d18'},
      {num:'2×/Hari',lbl:'Posting',color:'#c44d18'},
      {num:'YT·TT·FB·IG',lbl:'Platform',color:'#c44d18'},
      {num:'2 JT',lbl:'Target Subs',color:'#c44d18'}
    ],
    extra:[
      {t:'Squad Siruang United',ic:'community',chips:[
        {h:'TOKOH UTAMA',v:['Ayla Tingking','Kafka Sarko','Rezha Jaya','Zidan Jayden','Irgi Dodo']},
        {h:'PELENGKAP',v:['Jilan','Ropik','Fikri Bool','Ahmad Ahmed','Adilah Ardilah']}]},
      {t:'Olahraga',ic:'trophy',rows:[
        ['Bola','Khusus cowok — tim Siruang United'],
        ['Bulutangkis','Cowok & cewek ikut'],
        ['Catur','Cowok & cewek ikut'],
        ['Lari','Cowok & cewek ikut']]},
      {t:'Edukasi: Belajar Sambil Main',ic:'books',rows:[
        ['Literasi uang','Lapak mini & celengan target — kenal untung, rugi, menabung'],
        ['Kreatif digital','Bikin video, edit, dan sinematik dasar'],
        ['Berani bicara','Jadi host & reporter cilik — percaya diri & public speaking'],
        ['Logika & strategi','Catur, teka-teki, puzzle — berpikir beberapa langkah ke depan'],
        ['Bahasa Inggris','Lewat game, lagu, dan film pendek'],
        ['Dasar coding','Game logika tanpa komputer, lalu Scratch'],
        ['Karakter & tim','Kapten bergilir, sportif, tanggung jawab'],
        ['Sains & lingkungan','Eksperimen dapur, tanam, bersih kampung']]}
    ],
    strategi:[
      'Keseharian Siruang United: main, latihan, dan momen lucu anak-anak',
      'Edukasi terselubung: tantangan & kuis yang terasa seperti permainan',
      'Pertandingan bola, bulutangkis, catur, dan lomba lari antar anggota',
      'Film pendek & sinematik dengan anak-anak sebagai pemeran',
      'Profil tiap anggota — cerita, bakat, dan perkembangannya'
    ]
  },
  cne: {
    icon:'camera', bg:'#eef3fc', color:'#1a4fb0', badge:'FILM STUDIO',
    name:'CNE Pictures', niche:'Film Indie · Short Film · Festival · Produksi',
    persona:'Studio film independen. Bekerja sama dengan 2 orang sepupu. Wadah visi artistik MC FATHUL ADZIM sebagai sutradara — dari short film hingga film layak festival.',
    desc:'Studio produksi film independen bersama sepupu. Memproduksi short film, web series, dan karya sinematik berkualitas tinggi yang layak diajukan ke festival film nasional maupun internasional.',
    tags:['Film Indie','Short Film','Festival Film','Web Series','Sutradara','Kolaborasi'],
    stats:[
      {num:'3',lbl:'Orang Tim',color:'#1a4fb0'},
      {num:'2026',lbl:'Target Film',color:'#1a4fb0'},
      {num:'Festival',lbl:'Goal Submit',color:'#6b3cbc'},
      {num:'2027',lbl:'Web Series',color:'#1a4fb0'}
    ],
    strategi:[
      'Short film horor/thriller sebagai debut resmi CNE Pictures',
      'Proses produksi behind the scenes yang memperlihatkan journey film indie',
      'Kolaborasi dengan aktor & sineas lokal yang berbakat',
      'Submit ke festival film indie nasional & internasional',
      'Membangun reputasi CNE Pictures sebagai studio indie terpercaya'
    ]
  }
};

/* ═══ SSOT: PEMETAAN AKUN ↔ BLOK PRODUKSI HARIAN ═══ */
var BA_BLOCK_OF_AKUN = {
  barongsukma:'pagi', okk:'pagi', zona:'pagi',
  ayla:'siang', alley:'siang',
  lol:'sore', monkipedia:'sore',
  kpc:'malam', fathulmeme:'malam'
};
var BA_AKUN_META = {
  barongsukma:{icon:'dumbbell', label:'Barongsukma'},
  okk:{icon:'box', label:'Otak Kepala Kardus'},
  zona:{icon:'thought', label:'Zona Asumsi'},
  ayla:{icon:'globe', label:'Dunia Ayla'},
  alley:{icon:'blocks', label:"Alley's Creative Kids"},
  lol:{icon:'banana', label:'LOL Monkey Shop'},
  monkipedia:{icon:'books', label:'Monkipedia'},
  kpc:{icon:'community', label:'KP.CIHUY'},
  fathulmeme:{icon:'masks', label:'Fathul Al-Meme'}
};
var BA_BLOCKS_ORDER = ['pagi','siang','sore','malam'];
var BA_BLOCK_ELID = {pagi:'ba-blk-1', siang:'ba-blk-3', sore:'ba-blk-5', malam:'ba-blk-7'};
function _todayDD(){ var n; try{ n=mcfaNowJakarta(); }catch(e){ n=new Date(); } return n.getDate()+'/'+(n.getMonth()+1)+'/'+n.getFullYear(); }
/* Tahap 6: riwayat perubahan status per konten. TIDAK dipotong otomatis (Bagian 5, build .11): hanya pengguna yang boleh menghapus riwayat. */
function _kontenHist(item,from,to,note){ if(!Array.isArray(item.hist)) item.hist=[]; var d; try{ d=mcfaIso(mcfaNowJakarta()); }catch(e){ d=''; }
  item.hist.push({t:new Date().toISOString(),d:d,from:from||'',to:to||'',n:note||''}); }
var _KST={belum:'Ide',produksi:'Dalam Produksi',editing:'Editing',siap:'Siap Upload',terjadwal:'Terjadwal',upload:'Sudah Diupload'};

function _statusMeta(st){
  switch(st){
    case 'produksi': return {text:goalIco('clapper')+' Dalam Produksi', cls:'st-produksi'};
    case 'editing':  return {text:goalIco('clapper')+' Editing', cls:'st-produksi'};
    case 'siap':      return {text:goalIco('upload')+' Siap Upload', cls:'st-siap'};
    case 'terjadwal': return {text:goalIco('upload')+' Terjadwal', cls:'st-siap'};
    case 'upload':    return {text:goalIco('check')+' Sudah Diupload · Selesai', cls:'st-upload'};
    default:          return {text:goalIco('circle')+' Ide', cls:'st-belum'};
  }
}

/* ═══ AKUN CREDENTIAL & KONTEN MANAGER ═══ */
var _curAkunId = null;
var _kontenFilter = 'all'; // 'all' | 'pending' | 'done'

function _credKey(id){ return 'mcfa_cred_' + id; }

// One-time cleanup: versi lama menyimpan password mentah di localStorage
// (mcfa_cred_*). Hapus field 'pw' dari data yang sudah tersimpan supaya
// tidak ikut ter-backup ke cloud dan tidak tersisa di perangkat.
(function _purgeLegacyCredPasswords(){
  try{
    for(var i=0;i<localStorage.length;i++){
      var k = localStorage.key(i);
      if(!k || k.indexOf('mcfa_cred_')!==0) continue;
      var raw = localStorage.getItem(k);
      if(!raw) continue;
      var obj;
      try{ obj = JSON.parse(raw); }catch(e){ continue; }
      if(obj && Object.prototype.hasOwnProperty.call(obj,'pw')){
        delete obj.pw;
        localStorage.setItem(k, JSON.stringify(obj));
      }
    }
  }catch(e){}
})();
function _kontenKey(id){ return 'mcfa_konten_' + id; }

// Password TIDAK disimpan ke localStorage (plaintext localStorage bukan
// tempat aman untuk menyimpan password nyata — lihat migrasi pembersihan
// di atas). Password hanya disimpan sementara di memori tab ini (hilang
// saat halaman ditutup/di-reload) sehingga tiap akun tetap bisa punya
// password sendiri-sendiri tanpa risiko tersimpan permanen tanpa enkripsi.
var _credPwMemory = {};

function _saveCred(id){
  var em = document.getElementById('cred-email-'+id);
  var pwEl = document.getElementById('cred-password-'+id);
  if(!em) return;
  var ok = true;
  try{
    localStorage.setItem(_credKey(id), JSON.stringify({email:em.value}));
    _credPwMemory[id] = pwEl ? pwEl.value : '';
  }catch(e){ ok = false; }
  var btn = document.getElementById('cred-savebtn-'+id);
  if(ok){
    if(btn){ btn.textContent='✓ TERSIMPAN'; setTimeout(function(){ btn.innerHTML=goalIco('save')+' SIMPAN KREDENSIAL'; },1500); }
  } else {
    if(typeof showNotif==='function') showNotif('Gagal menyimpan kredensial. Coba lagi.');
  }
  playTap();
}

function _loadCred(id){
  var out = {email:'', password: _credPwMemory[id] || ''};
  try{
    var raw = localStorage.getItem(_credKey(id));
    if(raw){ var p = JSON.parse(raw); if(p && p.email) out.email = p.email; }
  }catch(e){}
  return out;
}

function _toggleCredPw(id){
  var inp = document.getElementById('cred-password-'+id);
  var btn = document.getElementById('togglepw-'+id);
  if(!inp) return;
  if(inp.type === 'password'){
    inp.type = 'text';
    if(btn) btn.innerHTML = goalIco('eyeoff');
  } else {
    inp.type = 'password';
    if(btn) btn.innerHTML = goalIco('eye');
  }
}

function _copyVal(id, field){
  var inp = document.getElementById('cred-'+field+'-'+id);
  if(!inp) return;
  try{
    navigator.clipboard.writeText(inp.value).then(function(){
      var btn = document.getElementById('copy-'+field+'-'+id);
      if(btn){ var orig=btn.textContent; btn.textContent='✓'; setTimeout(function(){btn.textContent=orig;},1200); }
    });
  }catch(e){}
  playTap();
}

function _getKonten(id){
  try{
    var raw = localStorage.getItem(_kontenKey(id));
    if(raw){
      var list = JSON.parse(raw);
      // Migrasi data lama (tanpa field status) → Single Source of Truth
      var changed = false;
      list.forEach(function(k){
        if(!k.status){ k.status = k.done ? 'upload' : 'belum'; changed = true; }
        if(k.productionKey === undefined){ k.productionKey = ''; changed = true; }
        if(k.productionDate === undefined){ k.productionDate = ''; changed = true; }
        if(k.uploadKey === undefined){ k.uploadKey = k.status==='upload' ? (k.productionKey||'') : ''; changed = true; }
        if(k.jenis === undefined){ k.jenis = ''; changed = true; }
        if(k.jadwal === undefined){ k.jadwal = ''; changed = true; }
        if(!Array.isArray(k.hist)){ k.hist = []; changed = true; }
      });
      if(changed) _saveKonten(id, list);
      return list;
    }
  }catch(e){}
  return [];
}

function _saveKonten(id, list){
  try{
    localStorage.setItem(_kontenKey(id), JSON.stringify(list));
  try{ document.dispatchEvent(new Event('mcfa:data')); }catch(e){}
    return true;
  }catch(e){
    return false;
  }
}

function _addKonten(id){
  var inp = document.getElementById('konten-inp-'+id);
  if(!inp) return;
  var title = inp.value.trim();
  if(!title) return;
  var list = _getKonten(id);
  var now = mcfaNowJakarta();
  var dd = now.getDate()+'/'+(now.getMonth()+1)+'/'+now.getFullYear();
  list.unshift({ id: Date.now(), title: title, done: false, doneDate: '', addedDate: dd, status:'belum', productionKey:'', productionDate:'', uploadKey:'', jenis:'', jadwal:'', hist:[{t:new Date().toISOString(),d:'',from:'',to:'belum',n:'Konten dibuat'}] });
  if(!_saveKonten(id, list)){
    _kontenToast('Gagal menyimpan. Coba lagi.');
    return;
  }
  inp.value = '';
  _renderKonten(id);
  // Animate new item
  var listEl = document.getElementById('konten-list-'+id);
  if(listEl && listEl.firstElementChild) listEl.firstElementChild.classList.add('just-added');
  playTap();
  inp.focus();
}

/* Klik "Mulai Produksi" pada Jadwal & Upload Konten → otomatis muncul di Produksi Konten
   hari ini (akun, platform, jadwal ikut terbawa). Jika sudah pernah dimulai, tidak
   membuat data baru — cukup arahkan ke item yang sudah ada (anti-duplikasi). */
function _mulaiProduksi(id, itemId){
  var list = _getKonten(id);
  var item = list.find(function(k){ return k.id===itemId; });
  if(!item) return;
  if(!item.status || item.status === 'belum'){
    var prevStatus = item.status, prevKey = item.productionKey, prevDate = item.productionDate;
    item.status = 'produksi';
    item.productionKey = _baGetDateKey(0);
    item.productionDate = _todayDD();
    var _h0 = Array.isArray(item.hist) ? item.hist.slice() : [];
    _kontenHist(item, prevStatus||'belum', 'produksi', 'Mulai produksi');
    if(!_saveKonten(id, list)){
      item.status = prevStatus; item.productionKey = prevKey; item.productionDate = prevDate; item.hist = _h0;
      _kontenToast('Gagal menyimpan. Coba lagi.');
      return;
    }
    _renderKonten(id);
    _kontenToast('Produksi dimulai — cek di Produksi Konten hari ini!');
  }
  _gotoProduksi(id, itemId);
}

/* Membuka lokasi item di Produksi Konten tanpa mengubah status (anti-duplikasi). */
function _gotoProduksi(id, itemId){
  playTap();
  closeAkunModal();
  showAppPage('aktivitas');
  setTimeout(function(){
    var card = document.getElementById('heroHarian');
    if(card && !card.classList.contains('open')) toggleAktHero('harian');
    baGoToday();
    setTimeout(function(){
      var blockKey = BA_BLOCK_OF_AKUN[id];
      var el = blockKey && document.getElementById(BA_BLOCK_ELID[blockKey]);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      var row = document.getElementById('ki-'+itemId+'-prod');
      if(row){
        row.style.animation = 'none'; void row.offsetHeight;
        row.style.animation = 'temaCheckBounce 0.6s cubic-bezier(.34,1.56,.64,1)';
      }
    }, 380);
  }, 260);
}

function _kontenToast(msg){
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(20px);background:linear-gradient(135deg,#1443b5,#4f46e5);color:#fff;padding:13px 26px;border-radius:99px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 8px 32px rgba(26,86,219,0.5),0 0 0 1.5px rgba(255,255,255,0.15);white-space:nowrap;opacity:0;transition:all 0.38s cubic-bezier(.34,1.56,.64,1);pointer-events:none;max-width:90vw;overflow:hidden;text-overflow:ellipsis;';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.style.opacity='1'; toast.style.transform='translateX(-50%) translateY(0)'; }, 10);
  setTimeout(function(){ toast.style.opacity='0'; toast.style.transform='translateX(-50%) translateY(-12px)'; }, 1900);
  setTimeout(function(){ if(toast.parentNode) toast.parentNode.removeChild(toast); }, 2400);
}

function _toggleKonten(id, itemId){
  var list = _getKonten(id);
  var dd = _todayDD();
  var item = list.find(function(k){ return k.id===itemId; });
  if(!item) return;
  var prev = { done: item.done, doneDate: item.doneDate, status: item.status, uploadKey: item.uploadKey, hist: Array.isArray(item.hist) ? item.hist.slice() : [], jadwal: item.jadwal };
  if(item.status !== 'upload' && !item.done){
    /* Tahap 6: upload resmi baru dimulai MCFA_CORE.contentStart (21 NOV 2026). Sebelum itu tidak ada konten yang boleh dicatat sebagai sudah dipublikasikan. */
    var _tdy; try{ _tdy = mcfaIso(mcfaNowJakarta()); }catch(e){ _tdy = ''; }
    if(_tdy && _tdy < MCFA_CORE.contentStart){ _kontenToast('Upload resmi baru dimulai '+formatDateUpper(MCFA_CORE.contentStart)+'. Belum bisa ditandai Sudah Diupload.'); return; }
  }
  if(item.status === 'upload'){
    // Batalkan status upload → kembali ke tahap sebelumnya (siap upload jika sudah pernah produksi)
    item.done = false;
    item.doneDate = '';
    item.status = (item.productionKey || item.src) ? 'siap' : 'belum';   /* konten dari produksi Adaptasi (src) juga kembali 'Siap Upload', bukan 'Ide'; bila sumbernya sudah hilang, sinkronisasi menurunkannya ke 'Dalam Produksi' */
    item.uploadKey = '';
    _kontenHist(item, 'upload', item.status, 'Status upload dibatalkan');
  } else {
    var _fromSt = item.status;
    item.done = true;
    item.doneDate = dd;
    item.status = 'upload';
    item.uploadKey = _baGetDateKey(0);
    _kontenHist(item, _fromSt||'belum', 'upload', 'Diupload (dipublikasikan)');
  }
  if(!_saveKonten(id, list)){
    item.done = prev.done; item.doneDate = prev.doneDate; item.status = prev.status; item.uploadKey = prev.uploadKey; item.hist = prev.hist; item.jadwal = prev.jadwal;
    _kontenToast('Gagal menyimpan. Coba lagi.');
    return;
  }
  _renderKonten(id);
  if(typeof baUpdate === 'function') baUpdate();
  if(item.status === 'upload') boom(18);
  else playTap();
}

/* ═══ SSOT: RENDER PRODUKSI KONTEN (Auto Rollover, tanpa duplikasi) ═══ */
function _baKeyToDate(key){
  var p = key.replace('ba_','').split('_');
  return mcfaParse(p[0]+'-'+p[1]+'-'+p[2]);
}
function _baKeyCmp(a, b){
  var da = _baKeyToDate(a), db = _baKeyToDate(b);
  return da < db ? -1 : (da > db ? 1 : 0);
}

/* Item dianggap aktif di suatu hari jika sudah dimulai produksinya (productionKey)
   pada/​sebelum hari yang dilihat, dan belum "Sudah Upload" — inilah Auto Rollover:
   selama belum selesai, item terus tampil setiap hari tanpa membuat data baru. */
function _produksiItemsForAkun(akunId, viewingKey){
  var list = _getKonten(akunId);
  return list.filter(function(k){
    if(!k.productionKey) return false;
    if(_baKeyCmp(k.productionKey, viewingKey) > 0) return false;
    if(k.status === 'upload'){
      return k.uploadKey === viewingKey; // riwayat: tampil hanya di hari ia diupload
    }
    return true; // 'produksi' / 'siap' → rollover terus sampai selesai
  });
}

function renderProduksiBlocks(){
  if(typeof _baViewingKey === 'undefined') return;
  var viewingKey = _baViewingKey;
  BA_BLOCKS_ORDER.forEach(function(blockKey){
    var container = document.getElementById('prod-items-' + blockKey);
    if(!container) return;
    var akunIds = Object.keys(BA_BLOCK_OF_AKUN).filter(function(a){ return BA_BLOCK_OF_AKUN[a] === blockKey; });
    var html = '';
    akunIds.forEach(function(akunId){
      var meta = BA_AKUN_META[akunId];
      var items = _produksiItemsForAkun(akunId, viewingKey);
      html += '<div class="ba-sub-label"><span>'+goalIco(meta.icon)+'</span> '+meta.label+'</div>';
      if(items.length === 0){
        html += '<div class="ba-prod-empty">Belum ada konten yang dimulai produksinya. Buka <b>Jadwal & Upload Konten</b> (halaman Karir) lalu tekan <b>Mulai Produksi</b>.</div>';
      } else {
        items.forEach(function(k){
          var checked = (k.status === 'siap' || k.status === 'terjadwal' || k.status === 'upload');
          var st = _statusMeta(k.status);
          var locked = k.status === 'upload';
          html += '<div class="ba-item ba-prod-item'+(checked?' done':'')+(locked?' ba-prod-locked':'')+'" id="ki-'+k.id+'-prod" onclick="'+(locked?'':'_toggleProduksiItem(\''+akunId+'\','+k.id+')')+'">' +
            '<span class="ba-cb"></span>' +
            '<span class="ba-label">'+_escHtml(k.title)+'</span>' +
            '<span class="ba-prod-status '+st.cls+'">'+st.text+'</span>' +
          '</div>';
        });
      }
    });
    container.innerHTML = html;
  });
}

/* Checklist di Produksi Konten: toggle antara "Sedang Diproduksi" ⇄ "Siap Upload".
   Status final "Sudah Upload" hanya dikontrol dari Jadwal & Upload Konten (SSOT). */
function _toggleProduksiItem(akunId, itemId){
  var list = _getKonten(akunId);
  var item = list.find(function(k){ return k.id === itemId; });
  if(!item || item.status === 'upload') return;
  var prevStatus = item.status, _h1 = Array.isArray(item.hist) ? item.hist.slice() : [], _j1 = item.jadwal;
  var goingToSiap = (item.status !== 'siap' && item.status !== 'terjadwal');
  item.status = goingToSiap ? 'siap' : 'produksi';
  if(!goingToSiap) item.jadwal = '';
  _kontenHist(item, prevStatus||'belum', item.status, 'Dari Produksi Konten');
  if(!_saveKonten(akunId, list)){
    item.status = prevStatus; item.hist = _h1; item.jadwal = _j1;
    _kontenToast('Gagal menyimpan. Coba lagi.');
    return;
  }
  if(goingToSiap){ baPlayUploadSound(); boom(14); }
  else { playTap(); }
  if(typeof baUpdate === 'function') baUpdate(); else renderProduksiBlocks();
}

function _delKonten(id, itemId){
  var full = _getKonten(id);
  var list = full.filter(function(k){ return k.id!==itemId; });
  if(!_saveKonten(id, list)){
    _kontenToast('Gagal menghapus. Coba lagi.');
    return;
  }
  _renderKonten(id);
  playTap();
}

function _editKonten(id, itemId, val, isBlur){
  var list = _getKonten(id).map(function(k){
    if(k.id===itemId) k.title = val;
    return k;
  });
  if(!_saveKonten(id, list) && isBlur){
    _kontenToast('Perubahan judul belum tersimpan.');
  }
}

function _setKontenFilter(id, f){
  _kontenFilter = f;
  document.querySelectorAll('.am-kf-btn').forEach(function(b){ b.classList.remove('active'); });
  var btn = document.getElementById('kf-'+f+'-'+id);
  if(btn) btn.classList.add('active');
  _renderKonten(id);
  playTap();
}

function _renderKonten(id){
  var list = _getKonten(id);
  if (typeof _renderPostingSys === 'function') { _renderPostingSys(id); _renderPostingGlobal(); }
  if (typeof _renderTahap1 === 'function') { try{ _renderTahap1(id); }catch(e){ console.warn('[TAHAP 1]', e); } }
  var total = list.length;
  var done = list.filter(function(k){return k.done;}).length;
  var pending = total - done;
  var pct = total > 0 ? Math.round(done/total*100) : 0;

  var statEl = document.getElementById('konten-stats-'+id);
  if(statEl){
    statEl.innerHTML =
      '<div class="am-konten-stat">' +
        '<div class="am-konten-stat-num">'+total+'</div>' +
        '<div class="am-konten-stat-lbl">Total</div>' +
      '</div>' +
      '<div class="am-konten-stat pending-stat">' +
        '<div class="am-konten-stat-num">'+pending+'</div>' +
        '<div class="am-konten-stat-lbl">Belum Upload</div>' +
      '</div>' +
      '<div class="am-konten-stat done-stat">' +
        '<div class="am-konten-stat-num">'+done+'</div>' +
        '<div class="am-konten-stat-lbl">Sudah Upload</div>' +
      '</div>';
  }

  // Update progress bar
  var progEl = document.getElementById('konten-prog-'+id);
  if(progEl) progEl.style.width = pct+'%';

  var filtered = list;
  if(_kontenFilter==='pending') filtered = list.filter(function(k){return !k.done;});
  if(_kontenFilter==='done')    filtered = list.filter(function(k){return k.done;});

  var listEl = document.getElementById('konten-list-'+id);
  if(!listEl) return;

  if(filtered.length===0){
    var emptyMsg = _kontenFilter==='done'
      ? ['inbox','Belum ada konten yang diupload','Centang konten setelah upload!']
      : _kontenFilter==='pending'
      ? ['party','Semua konten sudah diupload!','Luar biasa — konsisten terus!']
      : ['note','Belum ada judul konten','Tambahkan judul konten di atas'];
    listEl.innerHTML =
      '<div class="am-konten-empty">' +
        '<span class="am-konten-empty-icon">'+goalIco(emptyMsg[0])+'</span>' +
        '<strong style="display:block;color:#475569;margin-bottom:4px">'+emptyMsg[1]+'</strong>' +
        emptyMsg[2] +
      '</div>';
    return;
  }

  listEl.innerHTML = filtered.map(function(k, idx){
    var numStr = String(idx+1).padStart(2,'0');
    var st = _statusMeta(k.status || 'belum');
    var actionBtn = '';
    if(!k.status || k.status === 'belum'){
      actionBtn = '<button class="am-konten-actionbtn" onclick="event.stopPropagation();_mulaiProduksi(\''+id+'\','+k.id+')">▶ Mulai Produksi</button>';
    } else if(k.status === 'produksi' || k.status === 'editing' || k.status === 'siap' || k.status === 'terjadwal'){
      actionBtn = '<button class="am-konten-actionbtn secondary" onclick="event.stopPropagation();_gotoProduksi(\''+id+'\','+k.id+')">'+goalIco('clapper')+' Lihat Produksi</button>';
    }
    return '<div class="am-konten-item'+(k.done?' uploaded':'')+'" id="ki-'+k.id+'">' +
      '<div class="am-konten-chk" onclick="_toggleKonten(\''+id+'\','+k.id+')" title="'+(k.done?'Batalkan Sudah Upload':'Tandai Sudah Upload')+'">' +
        (k.done?'✓':'') +
      '</div>' +
      '<div class="am-konten-body">' +
        '<textarea class="am-konten-title" rows="1" ' +
          'oninput="this.style.height=\'auto\';this.style.height=this.scrollHeight+\'px\';_editKonten(\''+id+'\','+k.id+',this.value)" ' +
          'onblur="_editKonten(\''+id+'\','+k.id+',this.value,true)"' +
          (k.done?' readonly':'')+'>'+_escHtml(k.title)+'</textarea>' +
        '<div class="am-konten-meta">' +
          (k.done ? '<div class="am-konten-date">'+goalIco('check')+' UPLOAD: '+formatDDMYUpper(k.doneDate)+'</div>' : '') +
          (k.addedDate ? '<div class="am-konten-date-added">+'+formatDDMYUpper(k.addedDate)+'</div>' : '') +
          (k.productionDate ? '<div class="am-konten-date-added">PRODUKSI: '+formatDDMYUpper(k.productionDate)+'</div>' : '') +
          (k.status==='terjadwal' && k.jadwal ? '<div class="am-konten-date">JADWAL UPLOAD: '+formatDateUpper(k.jadwal)+'</div>' : '') +
        '</div>' + _kontenT6Controls(id,k) +
        '<div class="am-konten-footer">' +
          '<span class="am-konten-status '+st.cls+'">'+st.text+'</span>' +
          actionBtn +
        '</div>' +
      '</div>' +
      '<span class="am-konten-num">#'+numStr+'</span>' +
      '<button class="am-konten-del" onclick="_delKonten(\''+id+'\','+k.id+')" title="Hapus">×</button>' +
    '</div>';
  }).join('');

  listEl.querySelectorAll('.am-konten-title').forEach(function(ta){
    ta.style.height='auto'; ta.style.height=ta.scrollHeight+'px';
  });
}

/* ═══ TAHAP 6 — kontrol status / jenis / jadwal / riwayat per konten ═══ */
function _kontenT6Controls(id,k){
  var up = (k.status==='upload'||k.done), cur = k.status||'belum', h='';
  var opts = ['belum','produksi','editing','siap'].map(function(v){ return '<option value="'+v+'"'+((cur===v||(cur==='terjadwal'&&v==='siap'))?' selected':'')+'>'+_KST[v]+'</option>'; }).join('');
  h += '<div class="t6-row"><input class="t6-in" type="text" maxlength="40" placeholder="Jenis konten (opsional)" value="'+_escHtml(k.jenis||'')+'"'+(up?' readonly':'')+' onchange="_kontenSetJenis(\''+id+'\','+k.id+',this.value)">';
  if(!up){
    h += '<select class="t6-in" onchange="_kontenSetStatus(\''+id+'\','+k.id+',this.value)" aria-label="Status konten">'+opts+'</select>';
    h += '<label class="t6-jd">Jadwal upload <input class="t6-in" type="date" min="'+MCFA_CORE.contentStart+'" value="'+(k.jadwal||'')+'" onchange="_kontenSetJadwal(\''+id+'\','+k.id+',this.value)"></label>';
  }
  h += '</div>';
  var hs = Array.isArray(k.hist) ? k.hist : [];
  if(hs.length){ h += '<details class="t6-hist"><summary>Riwayat perubahan ('+hs.length+')</summary>'+hs.slice(-6).reverse().map(function(e){
    var d = /^\d{4}-\d{2}-\d{2}$/.test(e.d||'') ? formatDateUpper(e.d) : ''; return '<div>'+d+(d?' · ':'')+(e.from?(_KST[e.from]||e.from)+' → ':'')+(_KST[e.to]||e.to)+(e.n?' <i>('+_escHtml(e.n)+')</i>':'')+'</div>'; }).join('')+'</details>'; }
  return h;
}
function _kontenMut(id,itemId,fn){
  var list=_getKonten(id), item=list.find(function(k){ return k.id===itemId; }); if(!item) return;
  var snap=JSON.stringify(item); if(fn(item)===false){ _renderKonten(id); return; }
  if(!_saveKonten(id,list)){ Object.keys(item).forEach(function(x){ delete item[x]; }); Object.assign(item,JSON.parse(snap)); _kontenToast('Gagal menyimpan. Coba lagi.'); }
  _renderKonten(id);
}
function _kontenSetJenis(id,itemId,v){ _kontenMut(id,itemId,function(k){ if(k.status==='upload'||k.done) return false; k.jenis=String(v||'').trim().slice(0,40); }); }
function _kontenSetStatus(id,itemId,to){
  _kontenMut(id,itemId,function(k){
    if(k.status==='upload'||k.done||!_KST[to]||to==='upload'||to==='terjadwal') return false;
    var from=k.status||'belum'; if(from===to||(from==='terjadwal'&&to==='siap')) return false;
    if(to!=='siap') k.jadwal='';
    if(to!=='belum'&&!k.productionKey&&!k.src){ k.productionKey=_baGetDateKey(0); k.productionDate=_todayDD(); }
    k.status=to; _kontenHist(k,from,to,'Status diubah manual'); });
}
function _kontenSetJadwal(id,itemId,v){
  _kontenMut(id,itemId,function(k){
    if(k.status==='upload'||k.done) return false;
    v=String(v||'');
    if(v===''){ if(k.status==='terjadwal'){ k.status='siap'; k.jadwal=''; _kontenHist(k,'terjadwal','siap','Jadwal dihapus'); } else k.jadwal=''; return; }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||v<MCFA_CORE.contentStart){ _kontenToast('Jadwal upload tidak boleh sebelum '+formatDateUpper(MCFA_CORE.contentStart)+'.'); return false; }
    if(k.status!=='siap'&&k.status!=='terjadwal'){ _kontenToast('Jadwalkan setelah status Siap Upload.'); return false; }
    var from=k.status; k.jadwal=v; k.status='terjadwal'; _kontenHist(k,from,'terjadwal','Dijadwalkan '+v); });
}
function _escHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ═══ TIMELINE PROGRES PROYEK — dihitung ulang setiap kali dibuka, selalu sinkron dengan tanggal hari ini ═══ */
function _fmtTglID(d){ return formatDateUpper(d); }
function _computeTimeline(startStr, totalDays) {
  var p = startStr.split('-');
  var start = mcfaParse(startStr);
  var today = mcfaNowJakarta();
  var end = new Date(start);
  end.setDate(end.getDate() + totalDays);
  var diffDays = mcfaDaysBetween(start, today);
  var elapsed = Math.max(0, Math.min(diffDays, totalDays));
  var remaining = totalDays - elapsed;
  var pct = totalDays > 0 ? Math.round((elapsed / totalDays) * 100) : 0;
  var status = diffDays < 0 ? 'belum-mulai' : (diffDays >= totalDays ? 'selesai' : 'berjalan');
  return {
    elapsed: elapsed, remaining: remaining, total: totalDays, pct: pct,
    startLabel: _fmtTglID(start), endLabel: _fmtTglID(end),
    todayLabel: _fmtTglID(today), status: status
  };
}
function _timelineSectionHtml(d) {
  if (d.program) return _barongProgramHtml(d);
  if (!d.timeline) return '';
  var tl = _computeTimeline(d.timeline.start, d.timeline.totalDays);
  var statusTxt = tl.status === 'selesai' ? goalIco('check')+' Program Selesai' : (tl.status === 'belum-mulai' ? goalIco('hourglass')+' Belum Dimulai' : goalIco('fire')+' Sedang Berjalan');
  return (
    '<div class="am-section">' +
      '<div class="am-slabel">'+goalIco('calendar')+' Timeline Progres</div>' +
      '<div class="am-timeline-box" style="border-color:'+d.color+'33">' +
        '<div class="am-timeline-top">' +
          '<span class="am-timeline-day">Hari ke-<b style="color:'+d.color+'">'+tl.elapsed+'</b> <span class="am-timeline-total">/ '+tl.total+' hari</span></span>' +
          '<span class="am-timeline-status" style="color:'+d.color+';background:'+d.bg+'">'+statusTxt+'</span>' +
        '</div>' +
        '<div class="am-timeline-bar-wrap"><div class="am-timeline-bar-fill" style="width:'+tl.pct+'%;background:'+d.color+'"></div>' +
          '<span class="am-timeline-bar-pct">'+tl.pct+'%</span>' +
        '</div>' +
        '<div class="am-timeline-dates">' +
          '<span>'+goalIco('flag')+' Mulai: <b>'+tl.startLabel+'</b></span>' +
          '<span>'+goalIco('finish')+' Target: <b>'+tl.endLabel+'</b></span>' +
        '</div>' +
        '<div class="am-timeline-stats">' +
          '<div class="am-timeline-stat"><div class="am-timeline-stat-num" style="color:'+d.color+'">'+tl.elapsed+'</div><div class="am-timeline-stat-lbl">Hari Berjalan</div></div>' +
          '<div class="am-timeline-stat"><div class="am-timeline-stat-num" style="color:'+d.color+'">'+tl.remaining+'</div><div class="am-timeline-stat-lbl">Hari Tersisa</div></div>' +
          '<div class="am-timeline-stat"><div class="am-timeline-stat-num" style="color:'+d.color+'">'+tl.total+'</div><div class="am-timeline-stat-lbl">Total Hari</div></div>' +
        '</div>' +
        '<div class="am-timeline-note">'+goalIco('pin')+' Dihitung otomatis dari hari ini ('+tl.todayLabel+') — update tiap hari</div>' +
      '</div>' +
    '</div>'
  );
}

/* ═══════════ BARONGSUKMA — GLOBAL JOURNEY + PHASE PROGRESS (sumber tunggal; semua dihitung otomatis dari tanggal hari ini) ═══════════
   PRINSIP
   1) GLOBAL DAY     = selisih hari kalender dari day0 — TIDAK PERNAH reset.
   1b) DAY FASE     = nomor hari di dalam fase (DAY 1 = hari pertama fase, termasuk Fase 1). Dipisah dari Global Day (Global Day 0 = 21 NOV 2026).
   2) PHASE PROGRESS = (Global Day − awal fase) ÷ (akhir fase − awal fase) × 100, dibatasi 0–100%; reset ke 0% tiap fase baru.
   3) CYCLE PROGRESS = rumus sama untuk satu siklus (bulking + cutting) setelah program utama; reset tiap siklus baru.
   4) HISTORY        = diturunkan dari tanggal, tidak ada yang dihapus; status UPCOMING / ACTIVE / COMPLETED otomatis.
   MENAMBAH FASE BARU: cukup tambah satu objek di BARONG_PROGRAM.phases (urut, tanpa celah tanggal). Tidak ada kode lain yang perlu diubah. */
const BARONG_PROGRAM = Object.freeze({
  day0: MCFA_CORE.projectStart,   // GLOBAL DAY 0 = 21 NOV 2026 (awal Fase 1) · DAY 1 Fase 1 = hari yang sama · tidak pernah reset
  /* 4 FASE (restrukturisasi: Fase 1 lama "Bulking Tidak Teratur" dihapus; Fase 2→1, 3→2, 4→3, 5→4 dengan tanggal fase masing-masing tetap) */
  phases: [
    {key:'p1', no:'1', title:'BULKING TERATUR', mode:'BULKING', start:MCFA_CORE.projectStart, end:'2027-02-07', tb:'171–172 CM', bb:'57 → 77 KG', bbFrom:57, bbTo:77,
     traits:['Bulking teratur','Pola makan, workout, jam tidur, dan recovery lebih konsisten','Disiplin meningkat','Progress lebih terkontrol']},
    {key:'p2', no:'2', title:'CUTTING TERATUR', mode:'CUTTING', start:'2027-02-08', end:'2027-03-14', tb:'172–173 CM', bb:'77 → 75 KG', bbFrom:77, bbTo:75,
     traits:['Cutting teratur','Mengurangi lemak tubuh','Mempertahankan massa otot','Tetap menjalankan workout','Mengontrol pola makan']},
    {key:'p3', no:'3', title:'BULKING TERATUR', mode:'BULKING', start:'2027-03-15', end:'2027-09-30', tb:'173–175 CM', bb:'75 → 110 KG', bbFrom:75, bbTo:110,
     traits:['Bulking teratur','Pola makan, workout, recovery, dan jam tidur teratur','Fokus membangun massa otot','Fase mass building terpanjang']},
    {key:'p4', no:'4', title:'CUTTING', mode:'CUTTING', start:'2027-10-01', end:MCFA_CORE.stage1End, tb:'175 CM', bb:'110 → 85 KG', bbFrom:110, bbTo:85,
     traits:['Cutting dari 110 KG menuju 85 KG','Akhir program utama, target menetap di 85 KG']}
  ],
  cycle: {from:MCFA_CORE.stage2Start, bulkMonths:4, holdAfterBulk:1, cutMonths:3, holdAfterCut:1, deltaKg:20, baseKg:85},   // SIKLUS 9 BULAN: 4 bulan bulking (+20 KG) → 1 bulan mencent → 3 bulan cutting (−20 KG) → 1 bulan mencent (otot 85 KG), berulang menurut bulan kalender
  milestones: [ {date:MCFA_CORE.stage2Start, label:'1 YEAR BARONGSUKMA PROGRESS'} ]   // tepat 365 hari setelah DAY 0 (21 NOV 2027)
});
/* Validasi otomatis (console): Global Day resmi, durasi inklusif, tanpa celah/tumpang tindih, siklus menyambung, milestone tepat 1 tahun. */
const BARONG_EXPECTED_DAYS = {p1:[0,78], p2:[79,113], p3:[114,313], p4:[314,364]};
const BARONG_EXPECTED_DUR  = {p1:79, p2:35, p3:200, p4:51};
const BARONG_EXPECTED_BB   = {p1:[57,77], p2:[77,75], p3:[75,110], p4:[110,85]};
function _barongValidate(){
  var d0 = mcfaParse(BARONG_PROGRAM.day0), bad = [], prevEnd = null;
  BARONG_PROGRAM.phases.forEach(function(p){
    var e = BARONG_EXPECTED_DAYS[p.key];
    var s = mcfaDaysBetween(d0, mcfaParse(p.start)), f = mcfaDaysBetween(d0, mcfaParse(p.end));
    if (e && (s !== e[0] || f !== e[1])) bad.push(p.key+' Global Day '+s+'–'+f+' ≠ '+e[0]+'–'+e[1]);
    var dur = mcfaDaysInclusive(p.start, p.end), ed = BARONG_EXPECTED_DUR[p.key];
    if (ed && dur !== ed) bad.push(p.key+' durasi '+dur+' ≠ '+ed);
    if (prevEnd && mcfaAddDays(prevEnd, 1) !== p.start) bad.push(p.key+' tidak menyambung dengan fase sebelumnya');
    prevEnd = p.end;
  });
  if (mcfaAddDays(prevEnd, 1) !== BARONG_PROGRAM.cycle.from) bad.push('siklus tidak menyambung dengan fase terakhir');
  if (BARONG_PROGRAM.phases.length !== 4) bad.push('jumlah fase harus 4');
  if (BARONG_PROGRAM.phases[0].start !== '2026-11-21') bad.push('Fase 1 harus mulai 21 Nov 2026');
  if (mcfaDaysBetween(d0, mcfaParse(MCFA_CORE.projectStart)) !== 0) bad.push('21 Nov 2026 bukan Global Day 0');
  var keys = {}; BARONG_PROGRAM.phases.forEach(function(p, n){
    if (keys[p.key]) bad.push('fase ganda '+p.key); keys[p.key] = 1;
    if (p.no !== String(n+1)) bad.push('nomor fase '+p.no+' ≠ '+(n+1));
    var eb = BARONG_EXPECTED_BB[p.key];
    if (eb && (p.bbFrom !== eb[0] || p.bbTo !== eb[1] || p.bb !== eb[0]+' → '+eb[1]+' KG')) bad.push(p.key+' target BB '+p.bb+' ≠ '+eb.join('→'));
  });
  BARONG_PROGRAM.milestones.forEach(function(m){ if (mcfaDaysBetween(d0, mcfaParse(m.date)) !== 365) bad.push('milestone '+m.date+' bukan tepat 1 tahun (DAY 365)'); });
  var all = _barongAllPhases(mcfaParse('2032-01-01'));
  for (var i = 1; i < all.length; i++) { if (mcfaAddDays(all[i-1].end, 1) !== all[i].start) { bad.push('celah/tumpang tindih sebelum '+all[i].key); break; } }
  if (bad.length) console.warn('[BARONGSUKMA] validasi gagal:', bad); else console.info('[BARONGSUKMA] validasi OK: 4 fase 79/35/200/51 hari, Global Day 0 = 21 Nov 2026 (awal Fase 1), BB 57→77 / 77→75 / 75→110 / 110→85');
}
function _barongPct(g, s, e){                       // 0–100, tidak pernah negatif / lebih dari 100
  if (e <= s) return g >= s ? 100 : 0;
  return Math.max(0, Math.min(100, (g - s) / (e - s) * 100));
}
function _barongFmtPct(p){                          // 0% · 19,2% · 97,8% · 100%
  var r = Math.round(p * 10) / 10;
  return (r % 1 === 0 ? String(r) : r.toFixed(1).replace('.', ',')) + '%';
}
function _barongAllPhases(today){
  var out = BARONG_PROGRAM.phases.map(function(p){ return Object.assign({name:'FASE '+p.no+' — '+p.title}, p); });
  var c = BARONG_PROGRAM.cycle, cur = mcfaParse(c.from), n = 1;
  var endOf = function(d, m){ return new Date(d.getFullYear(), d.getMonth()+m, d.getDate()-1); };   /* hari terakhir setelah m bulan kalender */
  var nextDay = function(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()+1); };
  while (n <= 60) {
    var cycStart = cur;
    var bEnd = endOf(cur, c.bulkMonths), h1s = nextDay(bEnd), h1e = endOf(h1s, c.holdAfterBulk);
    var cs = nextDay(h1e), cEnd = endOf(cs, c.cutMonths), h2s = nextDay(cEnd), h2e = endOf(h2s, c.holdAfterCut);
    var cyc = {cyc:n, cycStart:mcfaIso(cycStart), cycEnd:mcfaIso(h2e)};
    var hiKg = (c.baseKg + c.deltaKg);
    out.push(Object.assign({key:'s'+n+'b', no:'S'+n, title:'BULKING', name:'SIKLUS '+n+' — BULKING', mode:'BULKING', start:mcfaIso(cycStart), end:mcfaIso(bEnd), tb:'', bb:'+'+c.deltaKg+' KG',
      traits:[c.bulkMonths+' bulan bulking, target +'+c.deltaKg+' KG']}, cyc));
    out.push(Object.assign({key:'s'+n+'h1', no:'S'+n, title:'MENCENT', name:'SIKLUS '+n+' — MENCENT', mode:'MENCENT', start:mcfaIso(h1s), end:mcfaIso(h1e), tb:'', bb:'JAGA ±'+hiKg+' KG',
      traits:[c.holdAfterBulk+' bulan mencent: menjaga hasil bulking']}, cyc));
    out.push(Object.assign({key:'s'+n+'c', no:'S'+n, title:'CUTTING', name:'SIKLUS '+n+' — CUTTING', mode:'CUTTING', start:mcfaIso(cs), end:mcfaIso(cEnd), tb:'', bb:'−'+c.deltaKg+' KG',
      traits:[c.cutMonths+' bulan cutting, target −'+c.deltaKg+' KG, menjaga massa otot']}, cyc));
    out.push(Object.assign({key:'s'+n+'h2', no:'S'+n, title:'MENCENT', name:'SIKLUS '+n+' — MENCENT (OTOT '+c.baseKg+' KG)', mode:'MENCENT', start:mcfaIso(h2s), end:mcfaIso(h2e), tb:'', bb:c.baseKg+' KG',
      traits:[c.holdAfterCut+' bulan mencent: menjaga otot di '+c.baseKg+' KG']}, cyc));
    cur = nextDay(h2e);
    if (cycStart > today) break;
    n++;
  }
  return out;
}
function _barongState(todayDate){
  var t = mcfaMidnight(todayDate || mcfaNowJakarta()), d0 = mcfaParse(BARONG_PROGRAM.day0);
  var gDay = mcfaDaysBetween(d0, t);
  var ph = _barongAllPhases(t).map(function(p){
    var s0 = mcfaParse(p.start), e0 = mcfaParse(p.end), q = Object.assign({}, p);
    q.sDay = mcfaDaysBetween(d0, s0); q.eDay = mcfaDaysBetween(d0, e0); q.total = q.dur || (q.eDay - q.sDay + 1);
    q.status = t < s0 ? 'next' : (t > e0 ? 'done' : 'live');
    q.pct = _barongPct(gDay, q.sDay, q.eDay);
    /* DAY FASE: nomor hari di dalam fase; selalu mulai dari 1 pada hari pertama fase (Global Day 0 = Day Fase 1 Fase 1). */
    q.dFirst = 1; q.dLast = q.total;
    q.dayNo = Math.min(q.dLast, Math.max(q.dFirst, gDay - q.sDay + q.dFirst));
    if (q.cyc) { q.cycSDay = mcfaDaysBetween(d0, mcfaParse(q.cycStart)); q.cycEDay = mcfaDaysBetween(d0, mcfaParse(q.cycEnd)); q.cycPct = _barongPct(gDay, q.cycSDay, q.cycEDay); }
    return q;
  });
  var cur = null, idx = -1;
  for (var k = 0; k < ph.length; k++) { if (ph[k].status === 'live') { cur = ph[k]; idx = k; break; } }
  var nxt = null;
  if (idx >= 0) nxt = ph[idx+1] || null;
  else for (var m = 0; m < ph.length; m++) { if (ph[m].status === 'next') { nxt = ph[m]; break; } }
  return {today:t, gDay:gDay, programDay:gDay, phases:ph, cur:cur, idx:idx, nxt:nxt};
}
function _barongMilestone(st, phase){               // milestone (opsional dibatasi pada satu fase)
  var out = null;
  (BARONG_PROGRAM.milestones || []).forEach(function(m){
    if (phase && !(m.date >= phase.start && m.date <= phase.end)) return;
    var md = mcfaParse(m.date), diff = mcfaDaysBetween(st.today, md);
    out = {label:m.label, date:m.date, gDay:mcfaDaysBetween(mcfaParse(BARONG_PROGRAM.day0), md), diff:diff, state:(diff === 0 ? 'today' : (diff > 0 ? 'upcoming' : 'achieved'))};
  });
  return out;
}
var BARONG_NOTIF_KEY = 'barongPhaseNotified.v1', BARONG_ACK_KEY = 'barongPhaseAck.v1';
function _barongLS(k, v){ try{ if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){} return null; }
function _barongToast(msg){ try{ if (typeof showNotif === 'function') showNotif(msg); }catch(e){} }
function _barongLabel(p){ return p.cyc ? p.name : 'FASE '+p.no; }
function _barongCheckPhaseChange(){
  var st = _barongState(mcfaNowJakarta()); if (!st.cur) return;
  var seen = _barongLS(BARONG_NOTIF_KEY);
  if (!seen) { _barongLS(BARONG_NOTIF_KEY, st.cur.key); _barongLS(BARONG_ACK_KEY, st.cur.key); return; }   // pertama kali: catat tanpa notifikasi
  if (seen !== st.cur.key) {
    _barongToast(st.cur.name + ' DIMULAI · GLOBAL DAY ' + st.gDay + ' · PROGRESS ' + _barongFmtPct(st.cur.pct));
    _barongLS(BARONG_NOTIF_KEY, st.cur.key);
  }
}
function _barongAck(){
  var st = _barongState(mcfaNowJakarta()); if (st.cur) _barongLS(BARONG_ACK_KEY, st.cur.key);
  var el = document.getElementById('bpg-newphase'); if (el) el.style.display = 'none';
}
function _barongBar(pct, col){
  return '<div class="am-timeline-bar-wrap" style="height:12px"><div class="am-timeline-bar-fill" style="width:'+pct.toFixed(2)+'%;background:'+col+'"></div></div>';
}
function _barongToggle(id){                       // buka/tutup detail satu fase (accordion)
  var el = document.getElementById(id); if (!el) return;
  var open = !el.classList.contains('open');
  el.classList.toggle('open', open);
  var acc = el.closest ? el.closest('.bpg-acc') : null; if (acc) acc.classList.toggle('open', open);
}
function _barongDetailHtml(p, st, col){            // pemberitahuan + program satu fase, sesuai status otomatis
  var g = st.gDay, sisa = p.eDay - g, h = '', nTitle, nLine, nCls;
  if (p.status === 'live') {
    nCls = 'bpg-dn-live'; nTitle = 'FASE SEDANG BERJALAN';
    nLine = 'Global Day '+g+' · Day Fase '+p.dayNo+' · Phase Progress '+_barongFmtPct(p.pct)+' · Sisa '+Math.max(0, sisa)+' hari';
    if (st.nxt && sisa <= 7) nLine += '<br>Berikutnya: <b>'+st.nxt.name+'</b> mulai '+formatDateUpper(st.nxt.start, true);
  } else if (p.status === 'next') {
    var w = mcfaDaysBetween(st.today, mcfaParse(p.start));
    nCls = 'bpg-dn-next'; nTitle = 'FASE BELUM DIMULAI';
    nLine = 'Mulai '+formatDateUpper(p.start, true)+' · '+w+' hari lagi<br>Saat dimulai: Global Day '+p.sDay+' · Day Fase '+p.dFirst+' · Phase Progress 0%';
  } else {
    var ago = mcfaDaysBetween(mcfaParse(p.end), st.today);
    nCls = 'bpg-dn-done'; nTitle = 'FASE SELESAI';
    nLine = 'Selesai '+formatDateUpper(p.end, true)+' ('+ago+' hari lalu)<br>Global Day '+p.eDay+' · Day Fase '+p.dLast+' · Phase Progress 100%';
  }
  h += '<div class="bpg-dn '+nCls+'" style="'+(p.status === 'live' ? 'border-color:'+col : '')+'"><b>'+nTitle+'</b><br>'+nLine+'</div>';
  h += '<div class="bpg-dk">TARGET</div><div class="bpg-dtarget"><span>TARGET BB <b>'+p.bb+'</b>'+(p.bbNote?'<em style="display:block;font-style:normal;font-size:10px;font-weight:700;color:#b45309;margin-top:3px">⚠ '+p.bbNote+'</em>':'')+'</span>'+(p.tb ? '<span>TARGET TB <b>'+p.tb+'</b></span>' : '')+'</div>';
  h += '<div class="bpg-dk">PERIODE</div><div class="bpg-dfacts">' +
    '<div><span>Tanggal</span><b>'+formatDateUpper(p.start)+' — '+formatDateUpper(p.end)+'</b></div>' +
    '<div><span>Global Day</span><b>'+p.sDay+' → '+p.eDay+'</b></div>' +
    '<div><span>Day Fase</span><b>'+p.dFirst+' → '+p.dLast+'</b></div>' +
    '<div><span>Durasi</span><b>'+p.total+' hari</b></div>' +
    '<div><span>Phase Progress</span><b>'+(p.status === 'live' ? _barongFmtPct(p.pct)+' (0% → 100%)' : '0% → 100%')+'</b></div>' +
    (p.cyc ? '<div><span>Siklus '+p.cyc+'</span><b>'+formatDateUpper(p.cycStart)+' — '+formatDateUpper(p.cycEnd)+'</b></div>' : '') +
  '</div>';
  h += '<div class="bpg-dk">KARAKTER FASE</div><ul class="bpg-dul">'+p.traits.map(function(t){ return '<li>'+t+'</li>'; }).join('')+'</ul>';
  (p.program || []).forEach(function(b){               // opsional: program:[{title:'WORKOUT', items:['...']}]
    h += '<div class="bpg-dk">'+b.title+'</div><ul class="bpg-dul">'+b.items.map(function(t){ return '<li>'+t+'</li>'; }).join('')+'</ul>';
  });
  var pm = _barongMilestone(st, p);
  if (pm) h += '<div class="bpg-ms">'+goalIco('star')+' <span><b>'+pm.label+'</b><br>'+formatDateUpper(pm.date)+' · Global Day '+pm.gDay+(pm.state === 'upcoming' ? ' · '+pm.diff+' hari lagi' : (pm.state === 'today' ? ' · HARI INI' : ' · TERCAPAI'))+'</span></div>';
  return h;
}
function _barongProgramHtml(d){
  var st = _barongState(mcfaNowJakarta()), c = st.cur, col = d.color, h = '', g = st.gDay;

  // ── 1. GLOBAL JOURNEY — umur perjalanan, tidak pernah reset
  h += '<div class="am-section"><div class="am-slabel">'+goalIco('globe')+' Global Journey</div><div class="bpg-hero">';
  if (g < 0) {
    h += '<div class="bpg-gl">BARONGSUKMA</div><div class="bpg-gday" style="color:'+col+';font-size:24px">BELUM DIMULAI</div>';
    h += '<div class="bpg-sub">DAY 0 = '+formatDateUpper(BARONG_PROGRAM.day0, true)+' · '+(-g)+' HARI LAGI</div>';
  } else {
    h += '<div class="bpg-gl">GLOBAL DAY · KESELURUHAN</div><div class="bpg-gday" style="color:'+col+'">'+g+'</div>';
    h += '<div class="bpg-sub">'+formatDateUpper(BARONG_PROGRAM.day0)+' → SEKARANG<br>Hari ini: '+formatDateUpper(st.today, true)+'</div>';
  }
  if (c && g >= 0) h += '<div class="bpg-sub" style="margin-top:2px">'+(c.cyc ? 'SIKLUS '+c.cyc : 'FASE '+c.no)+' · DAY FASE <b style="color:'+col+'">'+c.dayNo+'</b> / '+c.dLast+'</div>';
  h += '<div class="bpg-rule">Global Day tidak pernah reset</div> <div class="bpg-rule">Day Fase mulai ulang tiap fase</div></div></div>';

  // ── 2. PEMBERITAHUAN (pergantian fase · segera berganti · milestone)
  var alerts = '';
  var ack = _barongLS(BARONG_ACK_KEY);
  if (c && ack && ack !== c.key) {
    var prev = st.phases.filter(function(p){ return p.key === ack; })[0];
    alerts += '<div class="bpg-alert bpg-alert-new" id="bpg-newphase" style="border-color:'+col+'">' +
      (prev ? '<b>'+_barongLabel(prev)+' SELESAI</b><br>Global Day: '+prev.eDay+' · Phase Progress: 100%<br><br>' : '') +
      'Selamat. Fase berikutnya telah dimulai.<br><b>'+c.name+'</b><br>Global Day: '+g+' · Phase Progress: '+_barongFmtPct(c.pct)+'<br>' +
      '<button class="bpg-ok" style="background:'+col+'" onclick="_barongAck()">OK, MULAI</button></div>';
  }
  if (c && st.nxt) {
    var sisa = c.eDay - g;
    if (sisa <= 7) {
      alerts += '<div class="bpg-alert"><b>FASE BERIKUTNYA SEGERA DIMULAI</b><br>' +
        'Fase saat ini: '+c.name+'<br>Global Day: Day '+g+' · Progress: '+_barongFmtPct(c.pct)+'<br>' +
        'Fase berikutnya: <b>'+st.nxt.name+'</b><br>Mulai: '+formatDateUpper(st.nxt.start, true)+'<br>' +
        'Sisa: <b>'+(sisa <= 0 ? 'HARI TERAKHIR FASE INI' : sisa+' hari')+'</b></div>';
    }
  } else if (!c && st.nxt) {
    var w = mcfaDaysBetween(st.today, mcfaParse(st.nxt.start));
    alerts += '<div class="bpg-alert">'+st.nxt.name+' dimulai '+w+' hari lagi · '+formatDateUpper(st.nxt.start, true)+'</div>';
  }
  var msAny = _barongMilestone(st, null);
  if (msAny && msAny.state === 'today') {
    alerts += '<div class="bpg-alert bpg-ms-today" style="border-color:'+col+'">'+goalIco('star')+' <b>'+msAny.label+'</b><br>Global Day '+msAny.gDay+' · '+formatDateUpper(msAny.date, true)+'</div>';
  }
  h += alerts;

  // ── 3. CURRENT PHASE + PHASE PROGRESS
  if (c) {
    var ms = _barongMilestone(st, c);
    h += '<div class="am-section"><div class="am-slabel">'+goalIco('flag')+' '+(c.cyc ? 'Fase Aktif · Siklus '+c.cyc : 'Fase Aktif')+'</div>';
    h += '<div class="am-timeline-box" style="border-color:'+col+'33">' +
      '<div class="am-timeline-top"><span class="bpg-phno" style="color:'+col+'">'+(c.cyc ? 'SIKLUS '+c.cyc : 'FASE '+c.no)+'</span>' +
      '<span class="am-timeline-status" style="color:'+col+';background:'+d.bg+'">'+goalIco('fire')+' '+c.mode+'</span></div>' +
      '<div class="bpg-name">'+c.title+'</div>' +
      '<div class="bpg-pl">PHASE PROGRESS</div><div class="bpg-pbig" style="color:'+col+'">'+_barongFmtPct(c.pct)+'</div>' +
      _barongBar(c.pct, col) +
      '<div class="am-timeline-dates"><span>'+goalIco('flag')+' Mulai: <b>'+formatDateUpper(c.start)+'</b></span><span>'+goalIco('finish')+' Selesai: <b>'+formatDateUpper(c.end)+'</b></span></div>' +
      '<div class="bpg-chips"><span class="bpg-chip">GLOBAL DAY '+c.sDay+' → '+c.eDay+'</span><span class="bpg-chip">DAY FASE '+c.dayNo+' / '+c.dLast+'</span></div>' +
      '<div class="am-timeline-stats">' +
        '<div class="am-timeline-stat"><div class="am-timeline-stat-num" style="color:'+col+'">'+Math.max(0, c.eDay - g)+'</div><div class="am-timeline-stat-lbl">Sisa Hari</div></div>' +
        '<div class="am-timeline-stat"><div class="am-timeline-stat-num" style="color:'+col+'">'+c.total+'</div><div class="am-timeline-stat-lbl">Durasi (Hari)</div></div>' +
        '<div class="am-timeline-stat"><div class="am-timeline-stat-num" style="color:'+col+'">'+c.eDay+'</div><div class="am-timeline-stat-lbl">Selesai di Global Day</div></div>' +
      '</div>' +
      (ms ? '<div class="bpg-ms">'+goalIco('star')+' <span><b>'+ms.label+'</b><br>'+formatDateUpper(ms.date)+' · Global Day '+ms.gDay+(ms.state === 'upcoming' ? ' · '+ms.diff+' hari lagi' : (ms.state === 'today' ? ' · HARI INI' : ' · TERCAPAI'))+'</span></div>' : '') +
      '<details class="bpg-det"><summary>KARAKTER FASE</summary><ul>'+c.traits.map(function(t){ return '<li>'+t+'</li>'; }).join('')+'</ul></details>' +
      '<div class="am-timeline-note">Progress fase reset ke 0% tiap fase baru — Global Day tetap berjalan.</div>' +
    '</div></div>';

    // ── 4. BODY TARGET
    h += '<div class="am-section"><div class="am-slabel">'+goalIco('target')+' Body Target</div><div class="bpg-target">' +
      '<div class="bpg-tcell"><div class="bpg-tl">TARGET BB</div><div class="bpg-tv" style="color:'+col+'">'+c.bb+'</div></div>' +
      (c.tb ? '<div class="bpg-tcell"><div class="bpg-tl">TARGET TB</div><div class="bpg-tv" style="color:'+col+'">'+c.tb+'</div></div>' : '') +
    '</div><div class="am-timeline-note" style="margin-top:6px">Angka di atas adalah target perencanaan, bukan hasil pengukuran aktual.</div></div>';

    // ── 5. CYCLE (setelah program utama)
    if (c.cyc) {
      var cc = BARONG_PROGRAM.cycle;
      h += '<div class="am-section"><div class="am-slabel">'+goalIco('refresh')+' Muscle Building Cycle</div><div class="am-timeline-box" style="border-color:'+col+'33">' +
        '<div class="am-timeline-top"><span class="bpg-phno" style="color:'+col+'">SIKLUS '+c.cyc+'</span></div>' +
        '<div class="bpg-pl">CYCLE PROGRESS</div><div class="bpg-pbig" style="color:'+col+'">'+_barongFmtPct(c.cycPct)+'</div>' +
        _barongBar(c.cycPct, col) +
        '<div class="am-timeline-dates"><span>'+goalIco('flag')+' Mulai: <b>'+formatDateUpper(c.cycStart)+'</b></span><span>'+goalIco('finish')+' Selesai: <b>'+formatDateUpper(c.cycEnd)+'</b></span></div>' +
        '<div class="am-timeline-note">'+cc.bulkMonths+' bulan bulking (+'+cc.deltaKg+' KG) → '+cc.holdAfterBulk+' bulan mencent → '+cc.cutMonths+' bulan cutting (−'+cc.deltaKg+' KG) → '+cc.holdAfterCut+' bulan mencent (otot '+cc.baseKg+' KG) · Global Day '+c.cycSDay+' → '+c.cycEDay+'</div>' +
      '</div></div>';
    }
  }

  // ── 6. NEXT PHASE
  if (c && st.nxt) {
    var n2 = st.nxt, nid = 'bpg-dn-'+n2.key;
    h += '<div class="am-section"><div class="am-slabel">'+goalIco('rocket')+' Fase Berikutnya</div><div class="bpg-next bpg-acc">' +
      '<div class="bpg-head" onclick="_barongToggle(\''+nid+'\')"><span class="bpg-chev"></span>' +
      '<div class="bpg-rname">'+n2.name+'</div>' +
      '<div class="bpg-rdate">Mulai '+formatDateUpper(n2.start, true)+'</div>' +
      '<div class="bpg-rmeta">GLOBAL DAY '+n2.sDay+' → '+n2.eDay+' · '+n2.total+' HARI'+(n2.bb ? ' · TARGET BB '+n2.bb : '')+(n2.tb ? ' · TARGET TB '+n2.tb : '')+'</div>' +
      '<div class="bpg-tap">KETUK UNTUK LIHAT PROGRAM</div></div>' +
      '<div class="bpg-detail" id="'+nid+'">'+_barongDetailHtml(n2, st, col)+'</div>' +
    '</div></div>';
  }

  // ── 7. BARONGSUKMA HISTORY — tidak pernah dihapus; status otomatis dari tanggal
  h += '<div class="am-section"><div class="am-slabel">'+goalIco('book')+' Barongsukma History</div><div class="bpg-list">';
  st.phases.forEach(function(p, i){
    if (i >= BARONG_PROGRAM.phases.length && !(st.idx >= 0 && i <= st.idx + 1)) return;   // siklus mendatang disembunyikan sampai dekat
    var chip = p.status === 'done' ? 'COMPLETED' : (p.status === 'live' ? 'ACTIVE' : 'UPCOMING');
    var mk = p.status === 'done' ? goalIco('check') : p.no;
    var pm = _barongMilestone(st, p), rid = 'bpg-d-'+p.key;
    h += '<div class="bpg-row bpg-acc bpg-'+p.status+'"><div class="bpg-no" style="'+(p.status === 'live' ? 'background:'+col+';color:#fff' : (p.status === 'done' ? 'background:#dcfce7;color:#166534' : ''))+'">'+mk+'</div><div class="bpg-body">' +
      '<div class="bpg-head" onclick="_barongToggle(\''+rid+'\')"><span class="bpg-chev"></span>' +
      '<div class="bpg-rname">'+p.name+' <span class="bpg-state">'+chip+'</span></div>' +
      '<div class="bpg-rdate">'+formatDateUpper(p.start)+' — '+formatDateUpper(p.end)+'</div>' +
      '<div class="bpg-rmeta">GLOBAL DAY '+p.sDay+' → '+p.eDay+' · '+p.total+' HARI</div>' +
      '<div class="bpg-rmeta">PHASE PROGRESS '+(p.status === 'live' ? _barongFmtPct(p.pct)+' (0% → 100%)' : '0% → 100%')+(p.bb ? ' · TARGET BB '+p.bb : '')+(p.tb ? ' · TARGET TB '+p.tb : '')+'</div>' +
      (pm ? '<div class="bpg-rmeta bpg-rms">'+goalIco('star')+' '+pm.label+' · '+formatDateUpper(pm.date)+'</div>' : '') +
      (p.status === 'live' ? _barongBar(p.pct, col) : '') +
      '</div>' +
      '<div class="bpg-detail" id="'+rid+'">'+_barongDetailHtml(p, st, col)+'</div>' +
    '</div></div>';
  });
  var cc2 = BARONG_PROGRAM.cycle;
  h += '</div><div class="am-timeline-note" style="margin-top:8px">Setelah FASE '+BARONG_PROGRAM.phases.length+' (Global Day '+st.phases[BARONG_PROGRAM.phases.length-1].eDay+'): MUSCLE BUILDING CYCLE — '+cc2.bulkMonths+' bulan bulking (+'+cc2.deltaKg+' KG), '+cc2.holdAfterBulk+' bulan mencent, '+cc2.cutMonths+' bulan cutting (−'+cc2.deltaKg+' KG), lalu '+cc2.holdAfterCut+' bulan mencent (otot '+cc2.baseKg+' KG), berulang, mulai '+formatDateUpper(cc2.from, true)+'. Global Day terus berjalan; progress fase dan progress siklus reset saat memasuki yang baru.</div></div>';
  return h;
}
_barongValidate();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _barongCheckPhaseChange); else _barongCheckPhaseChange();

/* ═══ SISTEM POSTING KONTEN — DAY 1 = MCFA_CORE.contentStart (21 NOV 2026) ═══
   DAY 1 posting = DAY 1 M.C.F.A PROJECT = DAY 1 STUDIO (21 NOV 2026).
   Hanya MEMBACA data konten (mcfa_konten_<akun>) — tidak mengubah status, tanggal upload, atau histori yang sudah ada.
   Posting dihitung hanya dari konten berstatus "Sudah Upload"; tanggal DAY 1 yang tiba tidak dianggap sebagai posting. */
function _postIds(){ return Object.keys(AKUN); }
function _postTarget(id){                      // target/hari diambil dari data akun ('2×/Hari'); null jika akun tidak punya target
  var d = AKUN[id], s = ((d && d.stats) || []).filter(function(x){ return /posting/i.test(x.lbl); })[0];
  var m = s && /(\d+)\s*[×x]\s*\/\s*hari/i.exec(s.num);
  return m ? parseInt(m[1], 10) : null;
}
function _postDate(s){                         // 'd/m/yyyy' → Date (tanggal upload aktual; tidak diubah)
  var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
  return m ? new Date(+m[3], +m[2]-1, +m[1]) : null;
}
function _postToday(){ try{ return mcfaNowJakarta(); }catch(e){ return mcfaMidnight(); } }
function _postInfo(id){
  var start = mcfaParse(MCFA_CORE.contentStart), today = _postToday();
  var diff = mcfaDaysBetween(start, today), started = diff >= 0, dayNo = diff + 1;
  var perDay = _postTarget(id), all = _getKonten(id);
  var noTgt = !!(window.MCFA_STUDIO && !MCFA_STUDIO.kontenTarget(id));     // Persona/Kolaborasi/akun Subs-Follow saja: posting dicatat, tanpa target konten
  var posted = all.filter(function(k){ return k.status === 'upload' || k.done; });
  var since = 0, before = 0, undated = 0, todayN = 0, by = {};
  posted.forEach(function(k){
    var dt = _postDate(k.doneDate);
    if (!dt) { undated++; return; }
    var key = k.doneDate; by[key] = by[key] || {date:dt, label:key, n:0}; by[key].n++;
    if (dt >= start) since++; else before++;
    if (dt.getTime() === today.getTime()) todayN++;
  });
  /* Konsistensi: jumlah posting per hari kalender sejak DAY 1 (hanya membaca data konten). */
  var perIdx = {}, activeDays = 0, daysMet = 0, streak = 0, lastActive = null;
  Object.keys(by).forEach(function(k){ var r = by[k]; if (r.date < start) return; var ix = mcfaDaysBetween(start, r.date); perIdx[ix] = (perIdx[ix] || 0) + r.n; });
  var needN = (perDay != null && !noTgt) ? perDay : 1;
  if (started) {
    Object.keys(perIdx).forEach(function(ix){ if (+ix <= diff) { if (perIdx[ix] >= 1) activeDays++; if (perDay != null && !noTgt && perIdx[ix] >= perDay) daysMet++; if (lastActive == null || +ix > lastActive) lastActive = +ix; } });
    var cur = diff; if (!(perIdx[cur] >= needN)) cur = diff - 1;       /* hari ini belum penuh tidak memutus runtun */
    while (cur >= 0 && perIdx[cur] >= needN) { streak++; cur--; }
  }
  var targetNow = (started && perDay != null && !noTgt) ? perDay * dayNo : null;
  var targetPrev = (started && perDay != null && !noTgt) ? perDay * (dayNo - 1) : 0;
  var st;
  if (!started) st = ['BELUM DIMULAI','nx'];
  else if (noTgt) st = ['TANPA TARGET · DICATAT','nx'];
  else if (perDay == null) st = ['TARGET BELUM DITETAPKAN','nx'];
  else if (since >= targetNow) st = ['SESUAI TARGET','ok'];
  else if (since < targetPrev) st = ['PERLU DIKEJAR','ch'];
  else st = ['BERJALAN',''];
  var rows = Object.keys(by).map(function(k){ return by[k]; }).sort(function(a,b){ return b.date - a.date; });
  return {id:id, start:start, today:today, started:started, dayNo:dayNo, toStart:-diff, perDay:perDay, targetNow:targetNow,
          total:all.length, postedAll:posted.length, since:since, before:before, undated:undated, todayN:todayN,
          status:st, rows:rows, noTarget:noTgt, activeDays:activeDays, daysMet:daysMet, streak:streak, lastActive:lastActive};
}
/* Kategori fungsi akun (dibaca dari satu sumber MCFA_STUDIO.cat): solo | persona | kolab | adik */
function _akunKind(id){
  var c = 'solo'; try{ c = MCFA_STUDIO.cat(id); }catch(e){}
  return c === 'persona' ? 'persona' : c === 'kolab' ? 'kolab' : c === 'ayla' ? 'adik' : 'solo';
}
var _KIND_LABEL = {solo:'Sistem Posting Konten', persona:'Identitas & Perkembangan Akun', kolab:'Aktivitas Kolaborasi', adik:'Perkembangan & Proyek Adik'};
function _postingSectionHtml(id){
  if (id === 'kpc' && window.MCFA_KPC) return '';   /* KP.CIHUY: profil informasi (js/45) menggantikan panel checklist */
  return '<div class="am-section"><div class="am-slabel">'+goalIco('clipboard')+' '+_KIND_LABEL[_akunKind(id)]+'</div><div id="post-sys-'+id+'"></div></div>';
}
/* Chip "Posting 2×/Hari" hanya untuk SOLO. Persona/Kolaborasi/Adik memakai chip fokus yang sesuai fungsi akun. */
function _akunStats(id){
  var d = AKUN[id], kind = _akunKind(id), F = {persona:['Branding','Fokus Akun'], kolab:['Kolaborasi','Fokus Akun'], adik:['Proyek Adik','Fokus Akun']};
  return d.stats.map(function(t){
    if (kind !== 'solo' && /posting/i.test(t.lbl)) return {num:F[kind][0], lbl:F[kind][1], color:t.color};
    return t;
  });
}
/* ── Kontribusi pihak (Kolaborasi) — disimpan lokal; tulis hanya jika berhasil. Checklist fokus lama dihapus dari tampilan (data lama 'mcfa_fokus_<akun>' tidak disentuh). ── */
function _kolabLoad(id){ try{ var o = JSON.parse(localStorage.getItem('mcfa_kolab_'+id)||'{}'); return (o && typeof o.c === 'object') ? o : {c:{}}; }catch(e){ return {c:{}}; } }
function _kolabAdj(id, i, d){
  var o = _kolabLoad(id), v = Math.max(0, (+o.c[i] || 0) + d);
  o.c[i] = v;
  try{ localStorage.setItem('mcfa_kolab_'+id, JSON.stringify(o)); }catch(e){ if (typeof showNotif === 'function') showNotif('Perubahan belum tersimpan (penyimpanan penuh).'); return; }
  _renderPostingSys(id);
}
function _kolabParties(id){            /* pihak diambil dari data akun; tidak ada nama yang dikarang */
  var d = AKUN[id] || {}, out = [];
  (d.extra || []).forEach(function(x){ (x.chips || []).forEach(function(c){ (c.v || []).forEach(function(n){ out.push(n); }); }); });
  if (out.length) return ['MC FATHUL ADZIM'].concat(out);
  if (id === 'cne') return ['MC FATHUL ADZIM', 'Nizam', 'Rezki'];
  return ['MC FATHUL ADZIM'];
}
var _KIND_PILL = {persona:'TANPA TARGET HARIAN · FOKUS BRANDING', kolab:'FLEKSIBEL · FOKUS KOLABORASI', adik:'TANPA TARGET HARIAN · FOKUS PROYEK ADIK'};
function _renderAktivitasAkun(id, kind){
  var el = document.getElementById('post-sys-'+id); if (!el) return;
  var d = AKUN[id], i = _postInfo(id), a = _t1Load(id), F = formatDateUpper, h = '';
  var cell = function(k, v, u){ return '<div class="psys-c"><small>'+k+'</small><b>'+v+(u ? '<u> '+u+'</u>' : '')+'</b></div>'; };
  var cells;
  if (kind === 'persona') cells =
    cell('IDENTITAS', _escHtml(d.badge)) + cell('PERKEMBANGAN AKUN', a.followers.toLocaleString('id-ID')+'<u> F</u> · '+a.subs.toLocaleString('id-ID')+'<u> S</u>') +
    cell('KONTEN DIUPLOAD', i.since.toLocaleString('id-ID'), 'sejak DAY 1') + cell('KONSISTENSI AKTIVITAS', i.started ? i.activeDays+' / '+i.dayNo : '—', i.started ? 'hari aktif' : '');
  else if (kind === 'kolab') cells =
    cell('PIHAK TERLIBAT', _kolabParties(id).length, 'orang') + cell('AKTIVITAS KOLABORASI', i.since.toLocaleString('id-ID'), 'konten diupload') +
    cell('PERKEMBANGAN AKUN', a.followers.toLocaleString('id-ID')+'<u> F</u> · '+a.subs.toLocaleString('id-ID')+'<u> S</u>') + cell('KONSISTENSI AKTIVITAS', i.started ? i.activeDays+' / '+i.dayNo : '—', i.started ? 'hari aktif' : '');
  else cells =
    cell('IDENTITAS', _escHtml(d.badge)) + cell('PERKEMBANGAN AKUN', a.followers.toLocaleString('id-ID')+'<u> F</u> · '+a.subs.toLocaleString('id-ID')+'<u> S</u>') +
    cell('AKTIVITAS KONTEN', i.since.toLocaleString('id-ID'), 'diupload · '+i.total+' tercatat') + cell('KONSISTENSI AKTIVITAS', i.started ? i.activeDays+' / '+i.dayNo : '—', i.started ? 'hari aktif' : '');
  h += '<div class="psys"><div class="psys-top"><div>' + (i.started
        ? '<div class="psys-day" style="white-space:nowrap">DAY '+i.dayNo.toLocaleString('id-ID')+' <small>AKTIVITAS AKUN</small></div>'
        : '<div class="psys-day psys-nx">BELUM DIMULAI</div>') + '</div><span class="psys-pill nx">'+_KIND_PILL[kind]+'</span></div>' +
    '<div class="psys-sub">'+(i.started ? 'Dihitung sejak <b>'+F(i.start)+'</b>' : 'Dimulai <b>'+F(i.start)+'</b> · '+i.toStart.toLocaleString('id-ID')+' hari lagi')+
      ' · akun ini <b>tidak</b> memakai target posting harian Solo Project.</div>' +
    '<div class="psys-grid">'+cells+'</div>';
  if (i.started) h += '<div class="psys-note">Runtun aktif: <b>'+i.streak+'</b> hari berturut-turut'+(i.lastActive != null ? ' · aktivitas terakhir DAY '+(i.lastActive+1) : ' · belum ada aktivitas tercatat')+'. Aktivitas = konten berstatus <b>Sudah Upload</b>.</div>';
  if (kind === 'kolab') {
    var kc = _kolabLoad(id).c, ps = _kolabParties(id), tot = 0; ps.forEach(function(_, ix){ tot += (+kc[ix] || 0); });
    h += '<div class="psys-h">KONTRIBUSI SETIAP PIHAK · '+tot+' TOTAL</div>' + ps.map(function(n, ix){ var v = +kc[ix] || 0;
      return '<div class="psys-hr"><span>'+_escHtml(n)+'<i>'+(tot ? Math.round(v / tot * 100) : 0)+'%</i></span><em class="psys-adj"><button type="button" class="psys-b" aria-label="Kurangi" onclick="_kolabAdj(\''+id+'\','+ix+',-1)">−</button>'+v+'<button type="button" class="psys-b" aria-label="Tambah" onclick="_kolabAdj(\''+id+'\','+ix+',1)">+</button></em></div>'; }).join('');
  }
  el.innerHTML = h + '</div>';
}
function _renderPostingSys(id){
  var el = document.getElementById('post-sys-'+id); if (!el) return;
  if (id === 'kpc' && window.MCFA_KPC) { MCFA_KPC.render(el); return; }   /* tanpa checkbox / persentase tugas */
  var kind = _akunKind(id); if (kind !== 'solo') { _renderAktivitasAkun(id, kind); return; }
  var i = _postInfo(id), F = formatDateUpper, h = '';
  h += '<div class="psys"><div class="psys-top"><div>' +
    (i.started ? '<div class="psys-day">DAY '+i.dayNo.toLocaleString('id-ID')+'<small>POSTING KONTEN</small></div>'
               : '<div class="psys-day psys-nx">BELUM DIMULAI</div>') +
    '</div><span class="psys-pill '+i.status[1]+'">'+i.status[0]+'</span></div>' +
    '<div class="psys-sub">'+(i.started
        ? 'DAY 1 posting: <b>'+F(i.start)+'</b> · hari ini '+F(i.today, true)
        : 'DAY 1 posting: <b>'+F(i.start)+'</b> · '+i.toStart.toLocaleString('id-ID')+' hari lagi')+'</div>' +
    '<div class="psys-grid">' +
      '<div class="psys-c"><small>TARGET POSTING</small><b>'+(i.noTarget ? '<u>TANPA TARGET</u>' : (i.perDay != null ? i.perDay+'<u>×/hari</u>' : '<u>BELUM DITETAPKAN</u>'))+'</b></div>' +
      '<div class="psys-c"><small>TARGET SAMPAI HARI INI</small><b>'+(i.targetNow != null ? i.targetNow.toLocaleString('id-ID')+'<u> posting</u>' : '—')+'</b></div>' +
      '<div class="psys-c"><small>TERPOSTING SEJAK DAY 1</small><b>'+i.since.toLocaleString('id-ID')+'<u> posting</u></b></div>' +
      '<div class="psys-c"><small>HARI INI</small><b>'+(i.started ? i.todayN+(i.perDay != null && !i.noTarget ? '<u> / '+i.perDay+'</u>' : '<u> posting</u>') : '—')+'</b></div>' +
    '</div>' +
    (i.perDay != null && !i.noTarget ? '<div class="psys-grid" style="margin-top:6px">' +
      '<div class="psys-c"><small>JADWAL POSTING</small><b>'+i.perDay+'<u>×/hari · setiap hari</u></b></div>' +
      '<div class="psys-c"><small>KONSISTENSI</small><b>'+(i.started ? i.daysMet+' / '+i.dayNo+'<u> hari penuh</u>' : '—')+'</b></div>' +
      '<div class="psys-c"><small>RUNTUN HARI PENUH</small><b>'+(i.started ? i.streak+'<u> hari</u>' : '—')+'</b></div>' +
      '<div class="psys-c"><small>CAPAIAN AKTIVITAS</small><b>'+(i.started && i.targetNow ? Math.min(100, Math.round(i.since / i.targetNow * 100))+'<u>% dari target</u>' : '—')+'</b></div></div>' +
      (i.started && i.targetNow ? '<div class="am-konten-progress-wrap" style="margin:8px 0 0"><div class="am-konten-progress-fill" style="width:'+Math.min(100, Math.round(i.since / i.targetNow * 100))+'%;background:'+AKUN[id].color+'"></div></div>' : '') : '') +
    '<div class="psys-note">Dihitung dari konten berstatus <b>Sudah Upload</b>. Konten tercatat: <b>'+i.total+'</b>'+
      (i.before || i.undated ? ' · posting lama sebelum DAY 1: <b>'+(i.before + i.undated)+'</b> (tetap di histori, tidak dihitung ke target)' : '')+'. DAY posting berdiri sendiri — bukan DAY 1 M.C.F.A PROJECT ('+F(MCFA_CORE.projectStart)+').</div>';
  try{   /* jadwal awal resmi = MCFA_CORE.contentStart (semua akun Studio terdaftar ikut posting DAY 1) — hanya tampilan; angka posting tetap dari konten 'Sudah Upload' */
    var cs = MCFA_CORE.contentStart, collab = ['ayla','kpc','cne'].indexOf(i.id) >= 0;
    h += '<div class="psys-note" style="margin-top:6px"><b>JADWAL AWAL:</b> ' + F(cs)+' · DAY '+(mcfaDaysBetween(i.start, mcfaParse(cs))+1)+' — '+(AKUN[i.id] ? 'DIJADWALKAN' : 'tidak dijadwalkan') +
      (collab ? '. Akun kolaborasi: setelah itu fleksibel, tanpa patokan harian.' : '') + '</div>';
  }catch(e){}
  h += '<div class="psys-h">HISTORI POSTING</div>';
  if (!i.rows.length) h += '<div class="psys-note" style="margin-top:4px">Belum ada posting tercatat.</div>';
  else i.rows.slice(0, 7).forEach(function(r){
    var k = mcfaDaysBetween(i.start, r.date) + 1;
    h += '<div class="psys-hr"><span>'+F(r.date)+'<i>'+(k >= 1 ? 'DAY '+k : 'SEBELUM DAY 1')+'</i></span><em>'+r.n+' posting</em></div>';
  });
  if (i.rows.length > 7) h += '<div class="psys-note" style="margin-top:2px">+ '+(i.rows.length - 7)+' tanggal lainnya tersimpan di daftar konten.</div>';
  el.innerHTML = h + '</div>';
}
function _renderPostingGlobal(){
  var el = document.getElementById('post-sys-global'); if (!el) return;
  var ids = _postIds(), infos = ids.map(_postInfo), F = formatDateUpper, f = infos[0];
  var sumSince = 0, sumTarget = 0, noTarget = [], noCat = [];
  infos.forEach(function(i){ sumSince += i.since; if (i.targetNow != null) sumTarget += i.targetNow; if (i.noTarget) noCat.push(AKUN[i.id].name); else if (i.perDay == null) noTarget.push(AKUN[i.id].name); });
  el.innerHTML = '<div class="psys-g"><div class="k">SISTEM POSTING KONTEN · '+ids.length+' AKUN</div>' +
    (f.started ? '<div class="d">DAY '+f.dayNo.toLocaleString('id-ID')+'</div>' : '<div class="d nx">BELUM DIMULAI</div>') +
    '<div class="s">DAY 1 = '+F(f.start, true)+(f.started ? '' : ' · '+f.toStart.toLocaleString('id-ID')+' hari lagi')+'</div>' +
    '<div class="m"><div><small>AKUN TERDAFTAR</small><b>'+ids.length+'</b></div><div><small>TERPOSTING SEJAK DAY 1</small><b>'+sumSince+'</b></div><div><small>TARGET SAMPAI HARI INI</small><b>'+(f.started ? sumTarget.toLocaleString('id-ID') : '—')+'</b></div></div>' +
    '<div class="psys-chips">'+infos.map(function(i){ return '<button type="button" class="psys-chip" onclick="openAkun(\''+i.id+'\')">'+_escHtml(AKUN[i.id].name)+'<b>'+i.since+'</b></button>'; }).join('')+'</div>' +
    '<div class="n">Hanya posting berstatus Sudah Upload yang dihitung. DAY 1 posting = DAY 1 M.C.F.A PROJECT dan STUDIO ('+F(MCFA_CORE.projectStart)+').'+
      (noTarget.length ? ' Target harian belum ditetapkan untuk: '+_escHtml(noTarget.join(', '))+'.' : '')+(noCat.length ? ' Tanpa target posting harian (Persona, Kolaborasi, Adik — fokus aktivitas & perkembangan akun): '+_escHtml(noCat.join(', '))+'.' : '')+'</div></div>';
  try{ if(window.MCFA_ADPP){ var q = MCFA_ADPP.collected(); el.querySelector('.psys-g').insertAdjacentHTML('beforeend', '<div class="n" style="margin-top:6px">KONTEN MASA ADAPTASI (tahap produksi — bukan upload, tidak masuk angka di atas): '+q.ready+' siap upload dari target '+q.target+' · '+q.started+' sedang dikerjakan.</div>'); } }catch(e){}
}
(function _postValidate(){
  var bad = [], s = mcfaParse(MCFA_CORE.contentStart);
  if (mcfaDaysBetween(s, mcfaParse('2026-11-21')) + 1 !== 1) bad.push('21 Nov 2026 bukan DAY 1 posting');
  if (mcfaDaysBetween(s, mcfaParse('2026-11-22')) + 1 !== 2) bad.push('22 Nov 2026 bukan DAY 2 posting');
  if (mcfaDaysBetween(s, mcfaParse(MCFA_CORE.projectStart)) !== 0) bad.push('DAY 1 posting harus sama dengan DAY 1 PROJECT');
  if (_postIds().length !== Object.keys(AKUN).length) bad.push('daftar akun tidak lengkap');
  if (bad.length) console.warn('[POSTING] validasi gagal:', bad); else console.info('[POSTING] validasi OK: DAY 1 posting = 21 Nov 2026, '+_postIds().length+' akun');
})();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _renderPostingGlobal); else _renderPostingGlobal();
document.addEventListener('mcfa:data', function(){ try{ _renderPostingGlobal(); }catch(e){} });

function _kontenEnter(e, id){
  if(e.key==='Enter'){ e.preventDefault(); _addKonten(id); }
}

/* ═══ TAHAP 1 — fokus semua akun: 21 NOV 2026 – 20 NOV 2027 (365 hari) ═══
   Konten dihitung dari data "Sudah Upload" yang sama dengan Sistem Posting (satu sumber). Audiens diisi manual (tersimpan per akun). */
const TAHAP1 = Object.freeze({start:MCFA_CORE.projectStart, end:MCFA_CORE.stage1End});   /* hanya rentang tanggal; target tiap tahap = MCFA_TAHAP.def (satu sumber) */   // konten = posting/hari akun × hari Tahap 1 (lihat _t1Konten)
/* ═══ M.C.F.A STUDIO — LAPISAN DATA TERPUSAT (satu sumber: mcfa_tahap1_<akun> untuk audiens/target, mcfa_konten_<akun> untuk konten) ═══
   Format lama {followers, subs} tetap valid (tanpa migrasi destruktif); field baru ditambahkan: targets{tahap:{konten,followers,subs}}, hist[], updated. */
function _t1Key(id){ return 'mcfa_tahap1_'+id; }
var MCFA_STUDIO = (function(){
  var G = {followers:['mcfa','fathulmeme','barongsukma'], subs:['okk','zona','ayla','alley','lol','monkipedia']}, M = ['konten','followers','subs'], msgs = {};
  /* KATEGORI AKUN (satu sumber = pemetaan di Pusat Akun, 'mcfa_akun_hub_v1'). ATURAN FINAL: hanya SOLO PROJECT (+ PROJECT ADIK/Ayla, kategori terpisah yang
     sejak awal memiliki target Tahap 1) yang punya target followers, subscribers, dan konten. PERSONA & KOLABORASI hanya DICATAT (angka aktual + riwayat), tanpa target apa pun. */
  var CAT_DEF = {mcfa:'persona',fathulmeme:'persona',barongsukma:'solo',okk:'solo',zona:'solo',alley:'solo',lol:'solo',monkipedia:'solo',kpc:'kolab',cne:'kolab',ayla:'ayla'};
  function cat(id){
    if(id === 'ayla') return 'ayla';
    try{ if(window.MCFA_AKUN_HUB && typeof MCFA_AKUN_HUB.catOf === 'function') return MCFA_AKUN_HUB.catOf(id); }catch(e){}
    var g = null;
    try{ g = ((JSON.parse(localStorage.getItem('mcfa_akun_hub_v1')||'{}')||{}).group||{})[id]; }catch(e){}
    return (g === 'persona' || g === 'solo' || g === 'kolab') ? g : (CAT_DEF[id] || 'solo');
  }
  /* MODE "TARGET SUBS / FOLLOW SAJA" (tanpa Target Konten): Fathul Al-Meme dan Dunia Ayla (hanya SOLO BRANDING yang punya Target Konten). Terikat ke akun (bukan ke kategori Pusat Akun) sehingga tetap berlaku
     walau kategorinya dipindah. Konten TETAP dicatat; hanya target konten yang tidak ada. Satu sumber untuk Studio, Karir, Aktivitas, Posting. */
  var FOLLOW_ONLY = {fathulmeme:1, ayla:1};
  function hasTarget(id){ var c = cat(id); return c === 'solo' || c === 'ayla' || !!FOLLOW_ONLY[id]; }
  function kontenTarget(id){ return hasTarget(id) && !FOLLOW_ONLY[id]; }
  function raw(id){ try{ var p = JSON.parse(localStorage.getItem(_t1Key(id))||'{}'); return (p && typeof p==='object') ? p : {}; }catch(e){ return {}; } }
  function num(v){ v = +v; return isFinite(v) && v > 0 ? Math.floor(v) : 0; }
  function load(id){ var p = raw(id); return {followers:num(p.followers), subs:num(p.subs), targets:p.targets||{}, hist:p.hist||[], updated:p.updated||null}; }
  function def(n){ return (window.MCFA_TAHAP && MCFA_TAHAP.def && MCFA_TAHAP.def[n]) || null; }
  function dflt(n,m){ var d = def(n); return d ? (m==='konten' ? d.konten : m==='followers' ? d.tt : d.yt) : 0; }
  function ovr(id,n,m){ var t = load(id).targets[n]; return t ? num(t[m]) : 0; }
  /* K.P Cihuy & CNE Pictures (kolaborasi) tidak punya target — kini berlaku untuk SEMUA akun Persona/Kolaborasi lewat kategori (hasTarget). Konten tetap dicatat. */
  function target(id,n,m){ if(!hasTarget(id)) return 0; if(m === 'konten' && !kontenTarget(id)) return 0; return ovr(id,n,m) || dflt(n,m); }
  function konten(id,n){
    var d = def(n); if(!d) return 0;
    var st = mcfaParse(d.start), en = mcfaParse(d.end), seen = {}, c = 0;
    try{ _getKonten(id).forEach(function(k){
      if(!(k.status === 'upload' || k.done)) return;
      var dt = _postDate(k.doneDate); if(!dt || dt < st || dt > en) return;
      var key = (k.id != null ? k.id : k.title); if(seen[key]) return; seen[key] = 1; c++;
    }); }catch(e){}
    return c;
  }
  function actual(id,n,m){ return m === 'konten' ? konten(id,n) : load(id)[m]; }
  function applies(id,m,n){ if(!hasTarget(id)) return false; if(m === 'konten') return kontenTarget(id); return G[m].indexOf(id) >= 0 || load(id)[m] > 0 || ovr(id,n,m) > 0; }
  function anyOvr(id,m){ return [1,2,3].some(function(k){ return ovr(id,k,m) > 0; }); }
  /* akun penerima target untuk satu metrik (followers|subs) — hanya yang berkategori bertarget */
  function members(m){ return Object.keys(AKUN).filter(function(id){ return hasTarget(id) && (G[m].indexOf(id) >= 0 || load(id)[m] > 0 || anyOvr(id,m)); }); }
  function pct(v,t){ return t > 0 ? v/t*100 : null; }
  function fnum(v){ return Number(v).toLocaleString('id-ID'); }
  function fpct(p){ if(p === null) return 'target belum ditentukan'; return p.toLocaleString('id-ID',{maximumFractionDigits:(p > 0 && p < 1) ? 2 : 1}) + '%'; }
  function stamp(iso){ try{ return formatStampUpper(iso); }catch(e){ return ''; } }
  function parse(v){ v = String(v == null ? '' : v).trim(); if(v === '') return {empty:true}; if(!/^[\d.,\s]+$/.test(v)) return {bad:true}; var d = v.replace(/[.,\s]/g,''); return d ? {v:parseInt(d,10)} : {bad:true}; }
  function save(id,n,patch){
    var p = raw(id), now = new Date().toISOString(), ch = {};
    ['followers','subs'].forEach(function(m){ if(patch[m] !== undefined && patch[m] !== num(p[m])){ ch[m] = [num(p[m]), patch[m]]; p[m] = patch[m]; } });
    if(patch.targets && hasTarget(id)){
      M.forEach(function(m){ var v = patch.targets[m]; if(v === undefined) return; if(m === 'konten' && !kontenTarget(id)) return; p.targets = p.targets || {}; p.targets[n] = p.targets[n] || {}; var old = num(p.targets[n][m]);
        if(v !== old){ ch['target '+m+' T'+n] = [old, v]; if(v > 0) p.targets[n][m] = v; else delete p.targets[n][m]; } });
    }
    if(!Object.keys(ch).length) return {ok:true, nochange:true};
    var dl = {}; Object.keys(ch).forEach(function(k){ dl[k] = ch[k][1] - ch[k][0]; });   /* selisih (baru − lama) disimpan per perubahan */
    p.hist = (p.hist || []).concat([{t:now, c:ch, dl:dl}]); p.updated = now;      /* TIDAK dipotong otomatis: riwayat dipertahankan sampai pengguna menghapusnya */
    try{ localStorage.setItem(_t1Key(id), JSON.stringify(p)); if((JSON.parse(localStorage.getItem(_t1Key(id))||'{}')).updated !== now) throw new Error('verify'); }
    catch(e){ return {ok:false}; }
    try{ document.dispatchEvent(new Event('mcfa:data')); }catch(e){}
    return {ok:true};
  }
  /* Riwayat audiens: followers/subscribers (nilai lama → baru, selisih, waktu). Menampilkan 10 terbaru; seluruh riwayat tetap tersimpan. */
  function histHtml(h){
    var rows = (h || []).filter(function(e){ return e && e.c && (e.c.followers || e.c.subs); });
    if(!rows.length) return '';
    var lbl = {followers:'Followers', subs:'Subscribers'};
    return '<details class="t6-hist"><summary>Riwayat audiens ('+rows.length+')</summary>'+rows.slice(-10).reverse().map(function(e){
      var parts = ['followers','subs'].filter(function(m){ return e.c[m]; }).map(function(m){ var o = e.c[m][0], n = e.c[m][1], d = n - o; return lbl[m]+' '+fnum(o)+' → '+fnum(n)+' ('+(d > 0 ? '+' : '')+fnum(d)+')'; });
      return '<div>'+stamp(e.t)+' · '+parts.join(' · ')+'</div>'; }).join('')+'</details>';
  }
  function field(pf,k,id,label,val,ph){ return '<label class="sf"><span>'+label+'</span><input id="'+pf+'-'+k+'-'+id+'" type="text" inputmode="numeric" autocomplete="off" value="'+(val ? fnum(val) : '')+'" placeholder="'+ph+'"></label>'; }
  function form(id,n,pf){
    var a = load(id), m = msgs[id], txt = m ? m.t : (a.updated ? 'Diperbarui '+stamp(a.updated) : ''), cls = m ? m.c : '';
    return '<div class="sf-grid">'+
      field(pf,'f',id,'Followers aktual',a.followers,'0')+(hasTarget(id) ? field(pf,'ft',id,'Target followers',ovr(id,n,'followers'),fnum(dflt(n,'followers'))) : '')+
      field(pf,'s',id,'Subscribers aktual',a.subs,'0')+(hasTarget(id) ? field(pf,'st',id,'Target subscribers',ovr(id,n,'subs'),fnum(dflt(n,'subs'))) : '')+
      (kontenTarget(id) ? field(pf,'kt',id,'Target konten',ovr(id,n,'konten'),fnum(dflt(n,'konten'))) : '')+
      '<button type="button" class="sf-save" onclick="_t1Save(\''+id+'\','+n+',\''+pf+'\')">Simpan</button></div>'+
      '<div class="sf-msg '+cls+'" role="status">'+txt+'</div>'+histHtml(a.hist);
  }
  /* AGREGAT TUNGGAL (Bagian 10): satu-satunya rumus gabungan untuk Studio, Karier, dan modal akun.
     persen = Σ min(aktual, target) / Σ target — satu akun yang melampaui target TIDAK menutupi akun lain yang belum.
     Hanya akun yang berlaku (applies) dan bertarget yang ikut; hit = jumlah akun yang aktualnya ≥ targetnya. */
  function aggregate(ids,n,m){
    var a = 0, t = 0, cap = 0, hit = 0, rows = [];
    (ids || Object.keys(AKUN)).forEach(function(id){
      if(!applies(id,m,n)) return;
      var v = actual(id,n,m), tg = target(id,n,m);
      a += v; t += tg; cap += Math.min(v,tg); if(tg > 0 && v >= tg) hit++;
      rows.push({id:id, actual:v, target:tg, reached:(tg > 0 && v >= tg)});
    });
    return {actual:a, target:t, capped:cap, pct:(t > 0 ? cap/t*100 : null), hit:hit, n:rows.length, rows:rows};
  }
  return {aggregate:aggregate, groups:G, metrics:M, load:load, target:target, dflt:dflt, konten:konten, actual:actual, applies:applies, pct:pct, fnum:fnum, fpct:fpct, stamp:stamp, parse:parse, save:save, form:form, msgs:msgs, def:def, cat:cat, hasTarget:hasTarget, kontenTarget:kontenTarget, members:members, catDef:CAT_DEF};
})();
function _t1Load(id){ return MCFA_STUDIO.load(id); }
function _t1Save(id, n, pf){
  var S = MCFA_STUDIO; pf = pf || 't1'; n = n || 1;
  function g(k){ var e = document.getElementById(pf+'-'+k+'-'+id); return S.parse(e ? e.value : ''); }
  var F = g('f'), U = g('s'), FT = g('ft'), ST = g('st'), KT = g('kt');
  function again(){ if(pf === 't1') _renderTahap1(id); else if(S.rerender) S.rerender(); }
  if([F,U,FT,ST,KT].some(function(x){ return x.bad; })){ S.msgs[id] = {t:'Angka tidak valid — isi dengan digit saja. Tidak ada yang disimpan.', c:'err'}; again(); return; }
  var patch = {targets:{}};
  if(!F.empty) patch.followers = F.v; if(!U.empty) patch.subs = U.v;
  if(!FT.empty) patch.targets.followers = FT.v; if(!ST.empty) patch.targets.subs = ST.v; if(!KT.empty) patch.targets.konten = KT.v;
  var r = S.save(id, n, patch);
  S.msgs[id] = r.ok ? {t:(r.nochange ? 'Tidak ada perubahan.' : 'Tersimpan · '+S.stamp(new Date().toISOString())), c:'ok'} : {t:'Gagal menyimpan — penyimpanan penuh atau diblokir browser.', c:'err'};
  if(r.ok && S.onSaved) S.onSaved(id);
  again();
  if(typeof _renderKarirTahap1 === 'function') try{ _renderKarirTahap1(); }catch(e){}
}
function _t1Bar(p, col){ return '<div class="am-konten-progress-wrap" style="margin:4px 0 10px"><div class="am-konten-progress-fill" style="width:'+Math.min(100,p||0)+'%;background:'+col+'"></div></div>'; }
/* Tahap yang dipakai tampilan akun: tahap yang dipilih di pemilih Tahap; bila belum ada yang dipilih → tahap berjalan menurut tanggal (sebelum DAY 1 = Tahap 1). */
function _t1Stage(){
  try{ var sel = (window.MCFA_TAHAP && MCFA_TAHAP.get) ? MCFA_TAHAP.get() : null; if (sel) return sel; }catch(e){}
  try{ return MCFA_TAHAP.running(); }catch(e){ return 1; }   /* satu implementasi: MCFA_TAHAP.running() (modul 23) */
}
function _tahap1SectionHtml(id){
  return '<div class="am-section"><div class="am-slabel">'+goalIco('flag')+' Fokus TAHAP <span id="t1-lbl-'+id+'">'+_t1Stage()+'</span></div><div id="t1-box-'+id+'"></div></div>';
}
function _t1Metric(id, m, label, col, n){
  n = n || 1;
  var S = MCFA_STUDIO, a = S.actual(id,n,m), t = S.target(id,n,m), p = S.pct(a,t);
  if(!S.hasTarget(id) || (m === 'konten' && !S.kontenTarget(id))) return '<div style="font-size:12px;font-weight:700;margin-bottom:8px">'+label+' <span style="color:'+col+'">'+S.fnum(a)+'</span> · dicatat, tanpa target</div>';
  return '<div style="font-size:12px;font-weight:700">'+label+' <span style="color:'+col+'">'+S.fnum(a)+' / '+S.fnum(t)+'</span> · '+S.fpct(p)+'</div>' + _t1Bar(p, col);
}
function _renderTahap1(id){
  var el = document.getElementById('t1-box-'+id), d = AKUN[id]; if(!el || !d) return;
  var n = _t1Stage(), TD = (window.MCFA_TAHAP && MCFA_TAHAP.def && MCFA_TAHAP.def[n]) || {start:TAHAP1.start, end:TAHAP1.end};
  var S = MCFA_STUDIO, total = mcfaDaysInclusive(TD.start, TD.end), col = d.color;
  var lb = document.getElementById('t1-lbl-'+id); if (lb) lb.textContent = n;
  var diff = mcfaDaysBetween(mcfaParse(TD.start), _postToday()), dayNo = diff + 1, pd = _postTarget(id);
  var status = diff < 0 ? 'DIMULAI DALAM '+(-diff)+' HARI' : (dayNo > total ? 'TAHAP '+n+' SELESAI' : 'DAY '+dayNo+' DARI '+total);
  var h = '<div class="bpg-sub" style="margin-bottom:6px">'+formatDateUpper(TD.start)+' — '+formatDateUpper(TD.end)+' · <b style="color:'+col+'">'+status+'</b></div>' +
    _t1Metric(id,'konten','KONTEN DIUNGGAH',col,n) + _t1Metric(id,'followers','FOLLOWERS',col,n) + _t1Metric(id,'subs','SUBSCRIBERS',col,n) + S.form(id,n,'t1');
  if (id === 'barongsukma' && typeof BARONG_PROGRAM !== 'undefined') {
    var lines = BARONG_PROGRAM.phases.filter(function(p){ return p.end >= TD.start && p.start <= TD.end; }).map(function(p){
      return '<div class="am-list-item"><span class="am-list-num">F'+p.no+'</span><span class="am-list-txt"><b>'+p.title+'</b> · '+formatDateUpper(p.start)+' — '+formatDateUpper(p.end)+' · BB '+p.bb+' · TB '+p.tb+'</span></div>'; }).join('');
    if (lines) h += '<div class="am-slabel" style="margin-top:12px">Program Barongsukma di Tahap '+n+'</div><div class="am-list">'+lines+'</div>';
  }
  var _own = S.hasTarget(id), _cat = S.cat(id);
  h += '<div class="am-timeline-note" style="margin-top:8px">'+(_own ? (!S.kontenTarget(id) ? 'Akun ini hanya memakai <b>Target Subs / Follow</b> (tanpa Target Konten). Followers dan subscribers dihitung terhadap target tahap; konten tetap dicatat.' : S.target(id,n,'konten') > 0 ? 'Target konten Tahap '+n+' = <b>'+S.fnum(S.target(id,n,'konten'))+'</b> per akun (target resmi tahap).' : 'Target konten belum ditentukan.') : (_cat === 'kolab' ? 'Akun <b>KOLABORASI</b>: tidak memiliki target followers, subscribers, maupun konten (jadwal upload tidak pasti). Perkembangan dan konten tetap dicatat.' : 'Akun <b>PERSONA</b>: tidak memiliki target followers, subscribers, maupun konten. Perkembangan dan konten tetap dicatat.'))+(pd ? ' Jadwal Sistem Posting: '+pd+'×/hari × '+total+' hari = '+S.fnum(pd*total)+' slot — kapasitas jadwal, bukan target tahap.' : '')+' Konten dihitung hanya dari status Sudah Upload.</div>';
  el.innerHTML = h;
}
/* ═══ KARIER · PLATFORM — ringkasan TAHAP 1 (satu sumber: TAHAP1 + data audiens tiap akun) ═══ */
function _renderKarirTahap1(){
  var box = document.getElementById('krTahap1Box'); if (!box || typeof AKUN === 'undefined') return;
  var S = MCFA_STUDIO, ids = Object.keys(AKUN), days = mcfaDaysInclusive(TAHAP1.start, TAHAP1.end);
  /* persen & jumlah akun yang mencapai target = MCFA_STUDIO.aggregate (satu rumus untuk Studio dan Karier); Persona/Kolaborasi tidak ikut dihitung */
  var gF = S.aggregate(ids,1,'followers'), gS = S.aggregate(ids,1,'subs'), fr = gF.hit, sr = gS.hit, fN = gF.n, sN = gS.n;
  var rows = ids.map(function(id){
    var d = AKUN[id], a = _t1Load(id), own = S.hasTarget(id), tag = '';
    if (!own) tag = ' <small style=\"opacity:.6\">· '+(S.cat(id) === 'kolab' ? 'Kolaborasi' : 'Persona')+' · tanpa target</small>';
    return '<div class=\"vc-sub-item\"><div class=\"vc-sub-dot\"></div><div class=\"vc-sub-name\">'+_escHtml(d.name)+tag+'</div><div class=\"vc-sub-badge\">'+a.followers.toLocaleString('id-ID')+' F · '+a.subs.toLocaleString('id-ID')+' S</div></div>';
  }).join('');
  var _fp = function(g){ return (g.pct || 0).toLocaleString('id-ID',{maximumFractionDigits:1}); };
  var pf = _fp(gF), ps = _fp(gS);

  var tF = S.dflt(1,'followers'), tS = S.dflt(1,'subs'), tK = S.dflt(1,'konten');
  box.innerHTML =
    '<div class="vision-card reveal visible">' +
      '<div class="vc-num">Platform · TAHAP 1</div>' +
      '<div class="vc-title"><svg class="mi" aria-hidden="true"><use href="#mi-chart"/></svg> Fokus TAHAP 1 — Semua Akun</div>' +
      '<div class="vc-desc">'+formatDateUpper(TAHAP1.start)+' — '+formatDateUpper(TAHAP1.end)+' · '+days+' hari. Target per akun <b>SOLO PROJECT</b>: <b>'+tF.toLocaleString('id-ID')+' followers</b> (TT · FB · IG), <b>'+tS.toLocaleString('id-ID')+' subscriber</b> (YouTube)'+(tK ? ' dan <b>'+tK.toLocaleString('id-ID')+' konten</b>' : '')+'. Akun Persona dan Kolaborasi dicatat tanpa target.</div>' +
      '<div class="vc-sub-list">'+rows+'</div>' +
      '<div class="vc-desc" style="margin-top:8px">Capaian (akun SOLO PROJECT): followers '+pf+'% · subscriber '+ps+'% · '+fr+'/'+fN+' akun followers capai target · '+sr+'/'+sN+' akun subscriber capai target. Isi angka di tiap akun (M.C.F.A STUDIO).</div>' +
      '<div class="vc-desc" style="margin-top:6px"><b>Ini target Tahap 1 saja.</b> Target akhir (semua tahap) tetap di kartu di atas: 1 JT pengikut dan 2 JT subscriber. Target Tahap 2–3 diatur di panel tiap akun SOLO PROJECT (M.C.F.A STUDIO).</div>' +
      '<div class="kr-card-badge" style="--kc:#0891b2;--kc-bg:#ecfeff">Tahap 1</div>' +
    '</div>';
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _renderKarirTahap1); else _renderKarirTahap1();
document.addEventListener('mcfa:data', function(){ try{ _renderKarirTahap1(); }catch(e){} });
/* Kartu "Target Subs/Follow" di detail akun mengikuti target TAHAP (satu sumber: MCFA_STUDIO), bukan angka statis "2 JT". */
function _tgtStat(id, t){
  try{
    if(!/^Target\s+(Subs|Followers|Pengikut|Subscriber)/i.test(t.lbl) || !MCFA_STUDIO.hasTarget(id)) return t;
    var S = MCFA_STUDIO, n = _t1Stage(), field = S.members('followers').indexOf(id) >= 0 ? 'followers' : 'subs', v = S.target(id, n, field);
    if(!(v > 0)) return t;
    var txt = v >= 1000000 ? (v/1000000).toLocaleString('id-ID',{maximumFractionDigits:1}) + ' JT' : Math.round(v/1000).toLocaleString('id-ID') + ' RB';
    return {num:txt, lbl:(field === 'followers' ? 'Target Follow' : 'Target Subs') + ' · T' + n, color:t.color};
  }catch(e){ return t; }
}
function openAkun(id) {
  _curAkunId = id;
  _kontenFilter = 'all';
  var d = AKUN[id]; if (!d) return;
  var amIcon = document.getElementById('am-icon');
  var srcEl = document.querySelector('.bp-akun[onclick*="openAkun(\'' + id + '\')"] .bp-akun-icon img');
  if (srcEl && srcEl.src) {
    amIcon.innerHTML = '<img src="' + srcEl.src + '" style="width:100%;height:100%;border-radius:14px;object-fit:cover;">';
    amIcon.style.background = d.bg;
    amIcon.style.padding = '0';
    amIcon.style.overflow = 'hidden';
  } else {
    amIcon.innerHTML = goalIco(d.icon);
    amIcon.style.background = d.bg;
  }
  document.getElementById('am-name').textContent = d.name;
  document.getElementById('am-niche').textContent = d.niche;

  var cred = _loadCred(id);
  var badge = '<div style="display:inline-block;font-size:8px;font-weight:800;letter-spacing:2px;padding:3px 10px;border-radius:20px;background:'+d.color+';color:white;margin-bottom:12px">'+d.badge+'</div>';
  var persona = '<div style="font-size:12px;font-style:italic;color:#475569;border-left:3px solid '+d.color+';padding-left:10px;line-height:1.65;margin-bottom:0">'+d.persona+'</div>';
  var tags = d.tags.map(function(t){ return '<span class="am-tag" style="border-color:'+d.color+'33;color:'+d.color+';background:'+d.bg+'">'+t+'</span>'; }).join('');
  var stats = (typeof _statsInfoHtml === 'function' && _statsInfoHtml(id)) || _akunStats(id).filter(function(t){ return MCFA_STUDIO.hasTarget(id) || !/^Target\s+(Subs|Followers|Pengikut|Subscriber)/i.test(t.lbl); }).map(function(t){ t = _tgtStat(id,t); return '<div class="am-stat"><div class="am-stat-num" style="color:'+t.color+'">'+t.num+'</div><div class="am-stat-lbl">'+t.lbl+'</div></div>'; }).join('');
  var list = d.strategi.map(function(s,i){ return '<div class="am-list-item"><span class="am-list-num">0'+(i+1)+'</span><span class="am-list-txt">'+s+'</span></div>'; }).join('');

  var credHtml =
    '<div class="am-section">' +
      '<div class="am-slabel">'+goalIco('lock')+' Kredensial Akun</div>' +
      '<div class="am-cred-box">' +
        '<div class="am-cred-row">' +
          '<span class="am-cred-icon">'+goalIco('mail')+'</span>' +
          '<span class="am-cred-label">EMAIL</span>' +
          '<input id="cred-email-'+id+'" class="am-cred-val" type="email" ' +
            'placeholder="email@akun.com" value="'+_escHtml(cred.email)+'">' +
          '<button class="am-cred-copy" id="copy-email-'+id+'" onclick="_copyVal(\''+id+'\',\'email\')" title="Salin">⎘</button>' +
        '</div>' +
        '<div class="am-cred-row">' +
          '<span class="am-cred-icon">'+goalIco('key')+'</span>' +
          '<span class="am-cred-label">PASSWORD</span>' +
          '<input id="cred-password-'+id+'" class="am-cred-val" type="password" autocomplete="off" ' +
            'placeholder="Isi password akun ini" value="'+_escHtml(cred.password)+'">' +
          '<button class="am-cred-toggle" id="togglepw-'+id+'" onclick="_toggleCredPw(\''+id+'\')" title="Lihat/sembunyikan">'+goalIco('eye')+'</button>' +
          '<button class="am-cred-copy" id="copy-password-'+id+'" onclick="_copyVal(\''+id+'\',\'password\')" title="Salin">⎘</button>' +
        '</div>' +
        '<button class="am-cred-save" id="cred-savebtn-'+id+'" onclick="_saveCred(\''+id+'\')">'+goalIco('save')+' SIMPAN KREDENSIAL</button>' +
        '<div class="am-cred-lock">'+goalIco('lock')+' Email tersimpan di perangkat ini (dan ter-backup ke cloud jika Anda login akun). Password sengaja TIDAK disimpan permanen — hanya diingat selama tab ini terbuka, agar tidak tersimpan sebagai teks polos.</div>' +
      '</div>' +
    '</div>';

  var kontenHtml =
    '<div class="am-section">' +
      '<div class="am-slabel">'+goalIco('clipboard')+' Jadwal & Upload Konten</div>' +
      '<div class="am-konten-add">' +
        '<input id="konten-inp-'+id+'" class="am-konten-input" type="text" ' +
          'placeholder="Tulis judul konten baru..." onkeydown="_kontenEnter(event,\''+id+'\')">' +
        '<button class="am-konten-addbtn" onclick="_addKonten(\''+id+'\')" >+</button>' +
      '</div>' +
      '<div id="konten-stats-'+id+'" class="am-konten-stats"></div>' +
      '<div class="am-konten-progress-wrap"><div class="am-konten-progress-fill" id="konten-prog-'+id+'" style="width:0%"></div></div>' +
      '<div class="am-konten-filters">' +
        '<button class="am-kf-btn active" id="kf-all-'+id+'" onclick="_setKontenFilter(\''+id+'\',\'all\')" >'+goalIco('clipboard')+' Semua</button>' +
        '<button class="am-kf-btn" id="kf-pending-'+id+'" onclick="_setKontenFilter(\''+id+'\',\'pending\')" >'+goalIco('hourglass')+' Belum</button>' +
        '<button class="am-kf-btn" id="kf-done-'+id+'" onclick="_setKontenFilter(\''+id+'\',\'done\')" >'+goalIco('check')+' Upload</button>' +
      '</div>' +
      '<div id="konten-list-'+id+'" class="am-konten-list"></div>' +
    '</div>';

  document.getElementById('am-body').innerHTML =
    '<div class="am-section">'+badge+persona+'</div>' +
    ((id === 'kpc' && window.MCFA_KPC) ? MCFA_KPC.slotHtml() : _extraHtml(d)) +
    credHtml +
    _postingSectionHtml(id) +
    _tahap1SectionHtml(id) +
    kontenHtml +
    '<div class="am-section"><div class="am-slabel">Deskripsi Akun</div><div class="am-desc">'+d.desc+'</div></div>' +
    '<div class="am-section"><div class="am-slabel">Tags & Niche</div><div class="am-tags">'+tags+'</div></div>' +
    _timelineSectionHtml(d) +
    '<div class="am-section"><div class="am-slabel">Stats & Info</div><div class="am-grid">'+stats+'</div></div>' +
    '<div class="am-section"><div class="am-slabel">Strategi Konten</div><div class="am-list">'+list+'</div></div>' +
    '<div class="am-cta" style="background:'+d.bg+';border-color:'+d.color+'44"><div class="am-cta-icon">'+goalIco(d.icon)+'</div><div><div class="am-cta-name" style="color:'+d.color+'">'+d.name+'</div><div class="am-cta-sub">M.C.F.A STUDIO &nbsp;·&nbsp; Active 2026</div></div></div>';

  _renderKonten(id);
  document.getElementById('akunOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}


/* ═══ LANGKAH 2–3: bagian tambahan akun + profil orang (Sheina) ═══ */
function _extraHtml(d){
  if(!d || !d.extra) return '';
  return d.extra.map(function(x){
    var b='';
    if(x.chips) b=x.chips.map(function(c){ return '<div class="xt-h">'+c.h+'</div><div class="xt-chips">'+c.v.map(function(n){return '<span class="xt-chip" style="--c:'+d.color+'">'+n+'</span>';}).join('')+'</div>'; }).join('');
    if(x.rows) b='<div class="xt-rows">'+x.rows.map(function(r){ return '<div class="xt-row"><b style="color:'+d.color+'">'+r[0]+'</b><span>'+r[1]+'</span></div>'; }).join('')+'</div>';
    return '<div class="am-section xt-sec"><div class="am-slabel">'+goalIco(x.ic||'star')+' '+x.t+'</div>'+b+'</div>';
  }).join('');
}
var PERSON = {
  sheina:{icon:'butterfly', bg:'#f3edff', color:'#7c3aed', badge:'MANAGER · DUNIA AYLA',
    name:'Sheina Shafira Anggreni', niche:'Adik · Manager MC FATHUL ADZIM · Tanpa channel',
    persona:'Tidak punya channel sendiri. Satu kelompok dengan Dunia Ayla, tapi perannya berbeda: manager MC FATHUL ADZIM.',
    tugas:['Atur jadwal posting & agenda','Urus kerja sama brand & komunikasi','Catat pemasukan–pengeluaran','Pantau subscriber, follower, dan insight'],
    belajar:[
      ['Bahasa','Bahasa Inggris','Bahasa Jepang'],
      ['Organisasi','Manajemen waktu & kalender','Manajemen proyek: checklist, deadline, tim','Etika profesional & public speaking'],
      ['Bisnis','Komunikasi & negosiasi (WA/email profesional)','Dasar marketing: media kit, rate card, proposal','Dasar kontrak & hak cipta'],
      ['Angka & data','Pembukuan dasar & invoice','Literasi keuangan pribadi','Baca analitik media sosial','Spreadsheet & Canva']],
    /* Tampilan LMS (hanya metadata visual: ikon, warna, deskripsi). Nama & urutan materi tetap dari 'belajar'. */
    lms:{
      eyebrow:'PROGRAM PEMBELAJARAN',
      desc:'Program belajar yang membekali Sheina sebagai manager MC FATHUL ADZIM — dari komunikasi dan pengelolaan proyek sampai keuangan dan data.',
      tujuan:['Mengatur jadwal posting & agenda dengan rapi','Berkomunikasi dan bekerja sama dengan brand secara profesional','Mencatat keuangan serta membaca insight akun'],
      kat:{
        'Bahasa':{ic:'globe',c:'#0ea5e9',d:'Bahasa untuk komunikasi yang lebih luas'},
        'Organisasi':{ic:'users',c:'#7c3aed',d:'Mengatur waktu, proyek, dan sikap kerja'},
        'Bisnis':{ic:'building',c:'#d97706',d:'Dasar bekerja sama dan berbisnis dengan brand'},
        'Angka & data':{ic:'chart',c:'#059669',d:'Mengelola keuangan dan membaca data'}
      },
      materi:{
        'Bahasa Inggris':{ic:'book',d:'Komunikasi lisan dan tulisan untuk surat, rapat, dan kerja sama dengan pihak luar.'},
        'Bahasa Jepang':{ic:'flag',d:'Sapaan, kosakata harian, dan sopan santun dasar untuk membuka wawasan baru.'},
        'Manajemen waktu & kalender':{ic:'calendar',d:'Menyusun prioritas dan jadwal harian agar agenda tidak bertabrakan.'},
        'Manajemen proyek: checklist, deadline, tim':{ic:'clipboard',d:'Memecah pekerjaan menjadi checklist, menetapkan tenggat, dan membagi peran tim.'},
        'Etika profesional & public speaking':{ic:'mic',d:'Sikap, tata krama, dan percaya diri saat berbicara di depan orang.'},
        'Komunikasi & negosiasi (WA/email profesional)':{ic:'mail',d:'Menulis pesan WA dan email yang rapi, jelas, dan sopan kepada brand maupun mitra.'},
        'Dasar marketing: media kit, rate card, proposal':{ic:'speaker',d:'Menyusun media kit, rate card, dan proposal kerja sama yang meyakinkan.'},
        'Dasar kontrak & hak cipta':{ic:'scale',d:'Memahami isi perjanjian kerja sama dan melindungi karya dari penyalahgunaan.'},
        'Pembukuan dasar & invoice':{ic:'banknote',d:'Mencatat pemasukan–pengeluaran dan membuat invoice yang tertib.'},
        'Literasi keuangan pribadi':{ic:'moneybag',d:'Mengatur arus uang, menabung, dan membedakan kebutuhan dari keinginan.'},
        'Baca analitik media sosial':{ic:'eye',d:'Membaca insight subscriber, follower, dan jangkauan untuk menilai performa konten.'},
        'Spreadsheet & Canva':{ic:'laptop',d:'Merapikan data di spreadsheet dan membuat materi visual sederhana dengan Canva.'}
      }
    }}
};
var PERSON_KEY='mcfa_person_belajar_v1';
function _pLoad(){ try{ return JSON.parse(localStorage.getItem(PERSON_KEY))||{}; }catch(e){ return {}; } }
function _pToggle(el,id,k){
  var o=_pLoad(); o[id]=o[id]||{}; o[id][k]=!o[id][k];
  try{ localStorage.setItem(PERSON_KEY,JSON.stringify(o)); }catch(e){ if(typeof showNotif==='function') showNotif('Gagal menyimpan. Coba lagi.'); return; }
  el.classList.toggle('done',!!o[id][k]); el.setAttribute('aria-pressed',o[id][k]?'true':'false');
  var st=el.querySelector('.pl-st'); if(st) st.textContent=o[id][k]?'Selesai':'Belum dipelajari';
  _pProg(id);
  if(o[id][k]&&navigator.vibrate) navigator.vibrate(10);
}
function _pProg(id){
  var root=document.getElementById('pbody-'+id); if(!root) return;
  var all=root.querySelectorAll('.pl-card'), n=0; all.forEach(function(e){ if(e.classList.contains('done')) n++; });
  var p=all.length?Math.round(n/all.length*100):0, f=document.getElementById('pfill-'+id), t=document.getElementById('ptxt-'+id), r=document.getElementById('pring-'+id);
  if(f) f.style.width=p+'%'; if(t) t.textContent=n+' / '+all.length+' pelajaran · '+p+'%';
  if(r){ r.style.setProperty('--p',p); var rb=r.querySelector('b'); if(rb) rb.textContent=p+'%'; }
  root.querySelectorAll('.pl-cat').forEach(function(c){
    var cs=c.querySelectorAll('.pl-card'), cd=0; cs.forEach(function(e){ if(e.classList.contains('done')) cd++; });
    var cn=c.querySelector('.pl-cat-n'), cb=c.querySelector('.pl-cat-bar i');
    if(cn) cn.textContent=cd+' / '+cs.length; if(cb) cb.style.width=(cs.length?Math.round(cd/cs.length*100):0)+'%';
    c.classList.toggle('all-done', cs.length>0 && cd===cs.length);
  });
}
/* Struktur LMS: program → kategori → kartu materi (ikon, judul, deskripsi singkat, indikator progres). Data materi tetap dari PERSON[id].belajar. */
function _pLearnHtml(id){
  var d=PERSON[id]; if(!d) return '';
  var L=d.lms||{}, kat=L.kat||{}, mat=L.materi||{}, sv=_pLoad()[id]||{}, k=0, tot=0;
  d.belajar.forEach(function(g){ tot+=g.length-1; });
  var cats=d.belajar.map(function(g){
    var km=kat[g[0]]||{}, c=km.c||d.color, cards=g.slice(1).map(function(n){
      var key='k'+(k++), m=mat[n]||{}, on=!!sv[key];
      return '<button type="button" class="pl-card'+(on?' done':'')+'" aria-pressed="'+(on?'true':'false')+'" onclick="_pToggle(this,\''+id+'\',\''+key+'\')">'+
        '<span class="pl-ic">'+goalIco(m.ic||'book')+'</span>'+
        '<span class="pl-bd"><b class="pl-t">'+_escHtml(n)+'</b>'+(m.d?'<span class="pl-s">'+_escHtml(m.d)+'</span>':'')+
        '<span class="pl-pg"><span class="pl-pgbar"><i></i></span><em class="pl-st">'+(on?'Selesai':'Belum dipelajari')+'</em></span></span></button>';
    }).join('');
    return '<div class="pl-cat" style="--c:'+c+'"><div class="pl-cat-h"><span class="pl-cat-ic">'+goalIco(km.ic||'books')+'</span>'+
      '<div class="pl-cat-tx"><div class="pl-cat-t">'+_escHtml(g[0]).toUpperCase()+'</div>'+(km.d?'<div class="pl-cat-d">'+_escHtml(km.d)+'</div>':'')+'</div>'+
      '<span class="pl-cat-n">0 / '+(g.length-1)+'</span></div><div class="pl-cat-bar"><i></i></div><div class="pl-cards">'+cards+'</div></div>';
  }).join('');
  return '<div class="pl" style="--c:'+d.color+'"><div class="pl-hero">'+
    '<div class="pl-hero-top"><div><div class="pl-eyebrow">'+goalIco('books')+' '+_escHtml(L.eyebrow||'PROGRAM PEMBELAJARAN')+'</div><div class="pl-title">Daftar Pelajaran</div></div>'+
      '<div class="pl-ring" id="pring-'+id+'" style="--p:0"><b>0%</b></div></div>'+
    (L.desc?'<p class="pl-desc">'+_escHtml(L.desc)+'</p>':'')+
    (L.tujuan&&L.tujuan.length?'<div class="pl-goal-h">TUJUAN PEMBELAJARAN</div><ul class="pl-goals">'+L.tujuan.map(function(t){ return '<li>'+_escHtml(t)+'</li>'; }).join('')+'</ul>':'')+
    '<div class="pl-bar"><i id="pfill-'+id+'"></i></div><div class="pl-sum"><span id="ptxt-'+id+'"></span><span>'+d.belajar.length+' kategori · '+tot+' materi</span></div>'+
    '<div class="pl-hint">Ketuk kartu materi untuk menandai selesai.</div></div>'+cats+'</div>';
}
function openPerson(id){
  var d=PERSON[id]; if(!d) return;
  var ic=document.getElementById('am-icon'); ic.innerHTML=goalIco(d.icon); ic.style.background=d.bg;
  document.getElementById('am-name').textContent=d.name; document.getElementById('am-niche').textContent=d.niche;
  document.getElementById('am-body').innerHTML='<div id="pbody-'+id+'">'+
    '<div class="am-section"><div style="display:inline-block;font-size:8px;font-weight:800;letter-spacing:2px;padding:3px 10px;border-radius:20px;background:'+d.color+';color:#fff;margin-bottom:12px">'+d.badge+'</div><div style="font-size:12px;font-style:italic;color:#475569;border-left:3px solid '+d.color+';padding-left:10px;line-height:1.65">'+d.persona+'</div></div>'+
    '<div class="am-section xt-sec"><div class="am-slabel">'+goalIco('clipboard')+' Tugas Manager</div><div class="xt-rows">'+d.tugas.map(function(t){return '<div class="xt-row"><span>'+t+'</span></div>';}).join('')+'</div></div>'+
    '<div class="am-section xt-sec">'+_pLearnHtml(id)+'</div></div>';
  _pProg(id);
  document.getElementById('akunOverlay').classList.add('show'); document.body.style.overflow='hidden';
}

function closeAkunModal(e) {
  if (e && e.type === 'click' && e.target !== document.getElementById('akunOverlay')) return;
  document.getElementById('akunOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

/* ═══ PWA — SERVICE WORKER (GitHub Pages) ═══ */
if ('serviceWorker' in navigator) {
  let swRefreshing = false;
  const swHadController = !!navigator.serviceWorker.controller;   /* instalasi pertama (belum ada controller) tidak perlu reload */
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (swRefreshing || !swHadController) return;
    swRefreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => {
        console.log('[MCFA PWA] SW registered:', reg.scope);
        setInterval(() => reg.update(), 60 * 60 * 1000);
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch(err => { /* SW optional (e.g. sw.js unavailable in local/preview context) — fail silently */ });
  });
}

/* ═══ PWA — INSTALL BANNER ═══ */
/* Bug fix: installBanner/installBtn/installDismiss were queried via
   getElementById() at top-level script execution, but the #installBanner
   markup is placed after the closing tag of this script block in the
   document — so all three references resolved to null at parse time.
   installBtn/installDismiss were silently ignored (guarded by `if`), but
   installBanner itself had no guard, so beforeinstallprompt/appinstalled
   would throw. Fix: defer element lookup to DOMContentLoaded so the
   markup below has already been parsed. */
let deferredPrompt;
let installBanner, installBtn, installDismiss;

document.addEventListener('DOMContentLoaded', () => {
  installBanner = document.getElementById('installBanner');
  installBtn = document.getElementById('installBtn');
  installDismiss = document.getElementById('installDismiss');

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        if (installBanner) installBanner.classList.remove('show');
        try { localStorage.setItem('mcfa_pwa_dismissed', '1'); } catch(e){}
      }
      deferredPrompt = null;
    });
  }

  if (installDismiss) {
    installDismiss.addEventListener('click', () => {
      if (installBanner) installBanner.classList.remove('show');
      try { localStorage.setItem('mcfa_pwa_dismissed', '1'); } catch(e){}
    });
  }
});

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  let dismissed = false;
  try { dismissed = !!localStorage.getItem('mcfa_pwa_dismissed'); } catch(e){}
  if (!dismissed) {
    setTimeout(() => { if (installBanner) installBanner.classList.add('show'); }, 2000);
  }
});

window.addEventListener('appinstalled', () => {
  if (installBanner) installBanner.classList.remove('show');
});
