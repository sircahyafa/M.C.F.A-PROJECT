const MCFA_CORE = Object.freeze({
  birthDate:         '2004-11-21', // LAHIR
  treatmentEnd:      '2026-10-31', // PENGOBATAN — hari terakhir (resmi berakhir 31 OKT 2026)
  taskStart:         '2026-11-01', // TUGAS AWAL MC FATHUL ADZIM — hari pertama (1–20 NOV 2026, 20 hari) · SETUP · payung bagi Tugas Persiapan Lanjutan dan Program Adaptasi di bawah
  taskEnd:           '2026-11-20', // TUGAS AWAL — hari terakhir (20 NOV; besoknya DAY 1)
  prepStart:         '2026-11-03', // TUGAS PERSIAPAN LANJUTAN — hari pertama (3–4 NOV 2026, 2 hari) · berjalan DI DALAM Tugas Awal · daftar tugas tetap dipertahankan
  prepEnd:           '2026-11-04', // TUGAS PERSIAPAN LANJUTAN — hari terakhir (4 NOV)
  adaptStart:        '2026-11-08', // PROGRAM ADAPTASI — hari pertama (8–20 NOV 2026, 13 hari; dipindah dari 6 NOV) · berjalan DI DALAM Tugas Awal, berakhir bersamaan dengan Tugas Awal. 5–7 NOV = hari Tugas Awal biasa (5 NOV BUAT AKUN / BRANDING; 6–7 NOV daftar dekorasi studio)
  decoStart:         '2026-11-06', // DAFTAR DEKORASI STUDIO (Tugas Awal) — hari pertama aktif (6–20 NOV, tidak ikut bergeser bersama Adaptasi; centang 'dek-*' tetap utuh)
  adaptEnd:          '2026-11-20', // PROGRAM ADAPTASI — hari terakhir (besoknya DAY 1)
  projectStart:      '2026-11-21', // DAY 1 — M.C.F.A PROJECT
  financeStart:      '2026-01-01', // KEUANGAN — awal periode resmi (data sebelum tanggal ini diarsipkan, tidak dihapus)
  contentStart:      '2026-11-21', // DAY 1 — POSTING KONTEN RESMI (semua akun) = DAY 1 PROJECT = DAY 1 STUDIO (konten adaptasi dicatat terpisah)
  studioStart:       '2026-11-21', // DAY 1 — M.C.F.A STUDIO (resmi dimulai bersamaan dengan PROJECT)
  projectEnd:        '2029-11-20', // akhir periode utama (hari terakhir)
  perfectPhaseStart: '2029-11-21', // awal FASE SEMPURNA
  growthStart:       '2027-01-01', // TAHAP 3 — PERTUMBUHAN & MONETISASI (akhir = projectEnd)
  evalStart:         '2027-01-01', // TAHAP 4 — EVALUASI BESAR (akhir = projectEnd)
  stage1End:         '2027-11-20', // SISTEM TAHAP 1/2/3 — Tahap 1 = projectStart s/d tanggal ini (365 hari)
  stage2Start:       '2027-11-21', // Tahap 2 mulai
  stage2End:         '2028-11-20', // Tahap 2 akhir (366 hari, memuat 29 Feb 2028)
  stage3Start:       '2028-11-21'  // Tahap 3 mulai (akhir = projectEnd, 365 hari)
});

/* ── Parser & kalkulator tanggal (selalu local-midnight, bebas geser zona waktu) ── */
function mcfaParse(iso){
  const p = String(iso).split('-');
  return new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10));
}
function mcfaIso(d){
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
}
function mcfaAddDays(iso, n){              // ISO + n hari → ISO (local-midnight)
  const d = mcfaParse(iso);
  return mcfaIso(new Date(d.getFullYear(), d.getMonth(), d.getDate()+n));
}
function mcfaMidnight(d){ d = d || new Date(); if (typeof d === 'string') d = mcfaParse(d); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function mcfaDaysBetween(a, b){            // selisih hari kalender (b − a)
  const A = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const B = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((B - A) / 86400000);
}
function mcfaDaysInclusive(startIso, endIso){ // jumlah hari inklusif
  return mcfaDaysBetween(mcfaParse(startIso), mcfaParse(endIso)) + 1;
}
function mcfaAgeOn(date){                  // umur penuh pada tanggal tertentu, dihitung dari birthDate
  const b = mcfaParse(MCFA_CORE.birthDate), d = mcfaMidnight(date);
  let age = d.getFullYear() - b.getFullYear();
  if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) age--;
  return age;
}

/* ── Formatter global — SEMUA tanggal yang terlihat user = HURUF KAPITAL ── */
const MCFA_MONTHS_UPPER = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
const MCFA_DAYS_UPPER   = ['MINGGU','SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'];
function _mcfaToDate(x){ return (x instanceof Date) ? x : mcfaParse(x); }
function formatMonthUpper(x){ return MCFA_MONTHS_UPPER[_mcfaToDate(x).getMonth()]; }
function formatDayUpper(x){   return MCFA_DAYS_UPPER[_mcfaToDate(x).getDay()]; }
function formatDateUpper(x, withDay){      // '1 NOVEMBER 2026'  |  withDay → 'MINGGU, 1 NOVEMBER 2026'
  const d = _mcfaToDate(x);
  const s = d.getDate()+' '+formatMonthUpper(d)+' '+d.getFullYear();
  return withDay ? formatDayUpper(d)+', '+s : s;
}

/* ── Turunan utama ── */
const MCFA_DERIVED = ({
  projectTotalDays: mcfaDaysInclusive(MCFA_CORE.projectStart, MCFA_CORE.projectEnd), // 1.096 (21 NOV 2026 → 20 NOV 2029, inklusif; memuat 29 FEB 2028)
  projectDayOf(date){                       // DAY ke-n (1 = projectStart); ≤0 = belum dimulai
    return mcfaDaysBetween(mcfaParse(MCFA_CORE.projectStart), mcfaMidnight(date)) + 1;
  },
  projectDaysLeft(date){                    // sisa hari inklusif, tidak pernah > total
    const from = Math.max(mcfaMidnight(date).getTime(), mcfaParse(MCFA_CORE.projectStart).getTime());
    return Math.max(0, mcfaDaysBetween(new Date(from), mcfaParse(MCFA_CORE.projectEnd)) + 1);
  }
});

/* ── Isi naratif enam fase (tanggal/umur/durasi tetap dihitung dari MCFA_CORE) ── */
const LIFE_PHASE_TEXT = {
 'bibit-awal':{meaning:'Ini adalah titik awal seluruh perjalanan. Belum ada M.C.F.A PROJECT, belum ada M.C.F.A STUDIO, belum ada identitas yang dibangun secara sadar — hanya seorang anak yang baru memulai kehidupan. Bibit belum tahu akan menjadi pohon seperti apa; ia hanya mulai hidup.',
  focus:['kelahiran','keluarga','masa kanak-kanak','pengalaman awal','lingkungan pertama','pembentukan dasar karakter','mengenal kasih sayang','mengenal dunia pertama kali'],
  metaphor:'BIBIT BARU DITANAM.',narasi:'Sebelum menjadi siapa pun, seseorang terlebih dahulu hanya menjadi sebuah kehidupan kecil yang baru dimulai.',next:'kehidupan dimulai'},
 'pertumbuhan':{meaning:'Bibit mulai tumbuh dan dunia menjadi lebih luas. Fase ini adalah proses mengenal dunia sebelum benar-benar mengenal diri sendiri. Batang mulai terlihat, tetapi akar belum cukup dalam.',
  focus:['sekolah','lingkungan','teman','hubungan sosial','impian','cinta','konflik','kegagalan','keinginan','persaingan','kehidupan','realitas'],
  metaphor:'MENGENAL DUNIA SEBELUM BENAR-BENAR MENGENAL DIRI SENDIRI.',narasi:'Dunia mulai terbuka. Semakin banyak yang dikenal, semakin banyak pula yang harus dipahami.',next:'dunia mulai dikenal'},
 'akar':{meaning:'Salah satu fase paling penting — bukan sekadar “fase buruk”, melainkan FASE MENCARI FONDASI. Banyak hal diuji dan runtuh. Kalimat “di sini sampai pohon mati” dimaknai sebagai berakhirnya bentuk kehidupan lama, bukan kematian secara literal. Di permukaan pertumbuhan nyaris tak terlihat; di bawah tanah, akar berusaha menemukan tempat untuk bertahan.',
  focus:['keluarga','percintaan','masa depan','ekonomi','arah hidup','harapan','hubungan','identitas','kepercayaan diri','impian'],
  extra:'SEMPIT. GELAP. SUNYI. — KEGAGALAN MENJADI DATA. KEHILANGAN MENJADI PELAJARAN. KEGELAPAN MENJADI TEMPAT MENCARI FONDASI.',
  narasi:'Ada masa ketika pertumbuhan tidak terlihat sama sekali. Bukan karena kehidupan berhenti, tetapi karena akar sedang mencari tempat untuk bertahan.',next:'fondasi mulai dicari'},
 'penyembuhan':{meaning:'Setelah masa akar yang panjang, kehidupan tidak langsung dibangun dari nol. Pertama-tama, akar harus diselamatkan. Masih ada luka, masih ada bekas luka — tetapi sekarang luka itu mulai dipahami. Konsepnya: sembuh sambil tumbuh; menerima, memaafkan, dan berterima kasih.',
  focus:['mempelajari luka batin','evaluasi diri','memahami pola diri','menerima','memaafkan','berterima kasih','membangun kembali kepercayaan diri','memperbaiki hubungan dengan Allah','mempersiapkan fondasi baru'],
  extra:'AKHIR FASE · TUGAS AWAL '+(MCFA_CORE.taskStart===MCFA_CORE.taskEnd?formatDateUpper(MCFA_CORE.taskStart):formatDateUpper(MCFA_CORE.taskStart)+' – '+formatDateUpper(MCFA_CORE.taskEnd))+' · PROGRAM ADAPTASI '+formatDateUpper(MCFA_CORE.adaptStart)+' – '+formatDateUpper(MCFA_CORE.adaptEnd)+' · LALU DAY 1.',
  narasi:'Penyembuhan bukan berarti masa lalu tidak pernah terjadi. Penyembuhan berarti masa lalu tidak lagi menjadi satu-satunya arah kehidupan.',next:'akar yang terluka mulai dipulihkan'},
 'bibit-baru':{meaning:'Fase utama M.C.F.A PROJECT dan M.C.F.A STUDIO. DAY 1 bukan sekadar memulai project, melainkan memulai kehidupan baru dengan kesadaran: dari memahami menjadi melakukan, dari mengevaluasi menjadi membangun, dari bertahan menjadi bertumbuh. M.C.F.A PROJECT adalah laboratorium kehidupan.',
  focus:['identitas baru','disiplin','spiritual','fisik','mental','emosional','intelektual','ilmu','keuangan','branding','project','studio','karya','kreativitas','konsistensi','eksekusi','kontribusi'],
  extra:'PENGALAMAN → DATA → EVALUASI → PERBAIKAN → EKSEKUSI → PERTUMBUHAN. Belajar sambil berjalan. Sembuh sambil tumbuh. Menciptakan sambil menjadi.',
  narasi:'Kali ini bukan sekadar tumbuh. Kali ini aku tahu ke arah mana aku ingin tumbuh.',next:'kehidupan baru mulai ditanam'},
 'sempurna':{meaning:'“Sempurna” bukan berarti tanpa kekurangan, melainkan UTUH. Pohon telah memiliki akar, batang, ranting, daun, bunga, buah, dan tempat berteduh; manusia telah memiliki pengalaman, luka, ilmu, prinsip, identitas, karya, tanggung jawab, arah, tujuan, dan kontribusi. Ini bukan game over, melainkan bab baru: dari membangun diri menjadi menggunakan diri yang telah dibangun untuk memberi manfaat.',
  focus:['pengalaman','ilmu','prinsip','identitas','karya','tanggung jawab','arah','kontribusi'],
  extra:'STATUS: BERKELANJUTAN',narasi:'Menjadi utuh bukan berarti berhenti tumbuh. Menjadi utuh berarti mampu terus tumbuh sambil memberi kehidupan bagi sekitar.',next:'pohon menjadi utuh dan mulai memberi teduh'}
};

/* ── Enam fase kehidupan: struktur & tanggal + narasi ── */
const LIFE_PHASES = (function(){
  const raw = [
    {no:'01', key:'bibit-awal',  title:'FASE BIBIT AWAL',  subtitle:'FASE KELAHIRAN',                          identity:'MUHAMMAD CAHYA FATHUL ADZIM', start:'2004-11-21', end:'2010-11-20'},
    {no:'02', key:'pertumbuhan', title:'FASE PERTUMBUHAN', subtitle:'BELAJAR MENGENAL DUNIA LUAR',             identity:'MOCH. CAHYA FATHUL ADZIM',    start:'2010-11-21', end:'2022-11-20'},
    {no:'03', key:'akar',        title:'FASE AKAR',        subtitle:'MENCARI FONDASI — SEMPIT, GELAP, DAN SUNYI', identity:'CAHYA FATHUL ADZIM',       start:'2022-11-21', end:'2025-11-20'},
    {no:'04', key:'penyembuhan', title:'FASE PENYEMBUHAN', subtitle:'PENYEMBUHAN AKAR YANG MATI',              identity:'FATHUL ADZIM',                start:'2025-11-21', end:mcfaAddDays(MCFA_CORE.projectStart,-1)},
    {no:'05', key:'bibit-baru',  title:'FASE BIBIT BARU',  subtitle:'BIBIT YANG LEBIH FRESH, LEBIH BAHAGIA, DAN LEBIH SIAP TUMBUH', identity:'MC. FATHUL ADZIM', start:MCFA_CORE.projectStart, end:MCFA_CORE.projectEnd},
    {no:'06', key:'sempurna',    title:'FASE SEMPURNA',    subtitle:'UTUH — MEMBERI TEDUH',                    identity:'MC. FATHUL ADZIM', subIdentity:'M.C.F.A FOUNDER', start:MCFA_CORE.perfectPhaseStart, end:null}
  ];
  return raw.map(function(p){
    return Object.freeze(Object.assign({}, p, LIFE_PHASE_TEXT[p.key], {
      days:     p.end ? mcfaDaysInclusive(p.start, p.end) : null,   // null = SELANJUTNYA
      ageStart: mcfaAgeOn(mcfaParse(p.start)),
      ageEnd:   p.end ? mcfaAgeOn(mcfaParse(p.end)) : null,
      endLabel: p.end ? formatDateUpper(p.end) : 'SELANJUTNYA'
    }));
  });
})();
function mcfaPhaseOn(date){                // fase aktif pada tanggal tertentu
  const t = mcfaMidnight(date).getTime();
  for (let i = LIFE_PHASES.length-1; i >= 0; i--) { if (t >= mcfaParse(LIFE_PHASES[i].start).getTime()) return LIFE_PHASES[i]; }
  return LIFE_PHASES[0];
}
/* Milestone umur 1–25 TAHUN, otomatis dari birthDate */
const MCFA_AGE_MILESTONES = (function(){
  const b = mcfaParse(MCFA_CORE.birthDate), out = [];
  for (let n = 1; n <= 25; n++) { const d = new Date(b.getFullYear()+n, b.getMonth(), b.getDate()); out.push({age:n, date:mcfaIso(d), label:formatDateUpper(d)}); }
  return out;
})();
/* ── Binder: elemen bertanda data-mcfa-date / data-mcfa-days selalu membaca MCFA_CORE ── */
function mcfaBindDates(root){
  const r = root || document;
  r.querySelectorAll('[data-mcfa-date]').forEach(function(el){
    const k = el.getAttribute('data-mcfa-date');
    if (MCFA_CORE[k]) el.textContent = formatDateUpper(MCFA_CORE[k]);
  });
  r.querySelectorAll('[data-mcfa-days="total"]').forEach(function(el){
    el.textContent = MCFA_DERIVED.projectTotalDays.toLocaleString('id-ID');
  });
  r.querySelectorAll('[data-mcfa-days="task"]').forEach(function(el){ el.textContent = MCFA_DERIVED.taskTotalDays.toLocaleString('id-ID'); });
  r.querySelectorAll('[data-mcfa-days="prep"]').forEach(function(el){ el.textContent = MCFA_DERIVED.prepTotalDays.toLocaleString('id-ID'); });
  r.querySelectorAll('[data-mcfa-days="adapt"]').forEach(function(el){ el.textContent = MCFA_DERIVED.adaptTotalDays.toLocaleString('id-ID'); });
  r.querySelectorAll('[data-mcfa-range]').forEach(function(el){
    const rk = el.getAttribute('data-mcfa-range');
    const a = rk==='adapt' ? MCFA_CORE.adaptStart : (rk==='deco' ? MCFA_CORE.decoStart : (rk==='prep' ? MCFA_CORE.prepStart : MCFA_CORE.taskStart)), b = rk==='adapt' ? MCFA_CORE.adaptEnd : (rk==='deco' ? MCFA_CORE.adaptEnd : (rk==='prep' ? MCFA_CORE.prepEnd : MCFA_CORE.taskEnd));
    el.textContent = (a === b) ? formatDateUpper(a) : formatDateUpper(a)+' – '+formatDateUpper(b);   // rentang 1 hari = satu tanggal
  });
  r.querySelectorAll('[data-mcfa-range-short]').forEach(function(el){   // '27 OKT — 31 OKT 2026'
    const a = mcfaParse(MCFA_CORE.taskStart), b = mcfaParse(MCFA_CORE.taskEnd);
    el.textContent = (a.getTime() === b.getTime())
      ? a.getDate()+' '+formatMonthUpper(a).slice(0,3)+' '+a.getFullYear()
      : a.getDate()+' '+formatMonthUpper(a).slice(0,3)+(a.getFullYear()!==b.getFullYear()?' '+a.getFullYear():'')+' — '+b.getDate()+' '+formatMonthUpper(b).slice(0,3)+' '+b.getFullYear();
  });
  r.querySelectorAll('[data-mcfa-span]').forEach(function(el){ const k=el.getAttribute('data-mcfa-span'); if(MCFA_CORE[k]) el.textContent = formatDateUpper(MCFA_CORE[k])+' – '+formatDateUpper(MCFA_CORE.projectEnd); });
  r.querySelectorAll('[data-mcfa-period]').forEach(function(el){ el.textContent = MCFA_DERIVED.periodInfo(el.getAttribute('data-mcfa-period'), mcfaNowJakarta()).text; });
  r.querySelectorAll('[data-mcfa-age]').forEach(function(el){
    const k = el.getAttribute('data-mcfa-age');
    if (MCFA_CORE[k]) el.textContent = mcfaAgeOn(mcfaParse(MCFA_CORE[k]));
  });
}
/* Tanggal hari ini (Asia/Jakarta) sebagai 'YYYY-MM-DD' — SATU-SATUNYA sumber 'tanggal hari ini' berbentuk teks; modul lain memanggil ini, bukan menulis ulang Intl.DateTimeFormat. */
function mcfaTodayIso(){ return mcfaIso(mcfaNowJakarta()); }
function mcfaNowJakarta(){
  try{ return mcfaParse(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())); }
  catch(e){ return mcfaMidnight(); }
}
function mcfaAgeCycle(now, forAge){
  const b = mcfaParse(MCFA_CORE.birthDate), cur = mcfaAgeOn(now), age = (forAge==null ? cur : forAge), y = b.getFullYear()+age;
  const start = new Date(y,b.getMonth(),b.getDate()), next = new Date(y+1,b.getMonth(),b.getDate());
  const total = mcfaDaysBetween(start,next), done = mcfaDaysBetween(start,now);
  return {age:age, cur:cur, start:start, next:next, end:new Date(y+1,b.getMonth(),b.getDate()-1),
          total:total, done:done, left:mcfaDaysBetween(now,next), toStart:mcfaDaysBetween(now,start),
          pct: age<cur ? 100 : age>cur ? 0 : Math.min(100,Math.max(0,done/total*100))};
}
function mcfaAgePhaseLabel(c, now){
  const first = mcfaParse(LIFE_PHASES[0].start), ref = c.age===c.cur ? now : c.start;
  if (c.end < first) return 'SEBELUM PERJALANAN M.C.F.A';
  const ph = mcfaPhaseOn(ref < first ? first : ref); return ph.title+' · '+ph.identity;
}
function mcfaAgeChips(box, cur, sel, onPick){
  box.innerHTML = '';
  for (let n = 0; n <= 25; n++){
    const d = document.createElement('button'); d.type = 'button';
    d.className = 'mcfa-chip'+(n<cur?' is-past':n===cur?' is-now':n===cur+1?' is-next':'')+(n===sel?' is-sel':'');
    d.textContent = n; d.setAttribute('aria-label','Usia '+n+' tahun');
    d.addEventListener('click', function(e){ e.stopPropagation(); onPick(n); });
    box.appendChild(d);
  }
  const t = box.querySelector('.is-sel') || box.querySelector('.is-now');
  if (t) box.scrollLeft = Math.max(0, t.offsetLeft - box.clientWidth/2 + t.offsetWidth/2);
}
function mcfaRenderAge(){
  const now = mcfaNowJakarta(), c = mcfaAgeCycle(now), age = c.age;
  const set = function(id,v){ const e=document.getElementById(id); if(e) e.textContent=v; };
  set('mcfa-age-now', age+' TAHUN');
  set('mcfa-age-next', 'ULANG TAHUN KE-'+(age+1)+' · '+formatDateUpper(c.next)+' · SISA '+c.left.toLocaleString('id-ID')+' HARI');
  const ph = mcfaPhaseOn(now); set('mcfa-age-phase', ph.title+' · '+ph.identity);
  const box = document.getElementById('mcfa-age-chips'); if(!box) return;
  mcfaAgeChips(box, age, null, function(n){ mcfaOpenAge(n); });
}
function mcfaFillAge(n){
  const now = mcfaNowJakarta(), c = mcfaAgeCycle(now, n), F = formatDateUpper, b = mcfaParse(MCFA_CORE.birthDate), cur = c.cur;
  const m = document.getElementById('mcfa-age-modal'); if (!m) return;
  const st = n<cur ? 'USIA YANG SUDAH DILALUI' : n===cur ? 'USIA SAAT INI' : n===cur+1 ? 'USIA BERIKUTNYA' : 'USIA MENDATANG';
  const row = function(cls,t,d){ return '<div class="mcfa-am-row '+cls+'"><div class="mcfa-am-n">'+t+'</div><div class="mcfa-am-d">'+d+'</div></div>'; };
  const rng = function(k){ const x = mcfaAgeCycle(now,k); return F(x.start)+' — '+F(x.end); };
  let rows = '';
  if (n>0) rows += row('', (n-1)+' TAHUN', rng(n-1));
  if (n>cur) rows += row('is-cd', c.toStart.toLocaleString('id-ID')+' HARI MENUJU', n+' TAHUN · '+F(c.start));
  rows += row('is-now', n+' TAHUN', F(c.start)+' — '+F(c.end));
  if (n===cur) rows += row('is-cd', c.left.toLocaleString('id-ID')+' HARI MENUJU', (n+1)+' TAHUN · '+F(c.next));
  if (n<cur) rows += row('is-cd', 'SELESAI '+(-mcfaDaysBetween(now,c.next)+0).toLocaleString('id-ID')+' HARI LALU', (n+1)+' TAHUN DIMULAI '+F(c.next));
  if (n<25) rows += row('', (n+1)+' TAHUN', rng(n+1));
  const cell = function(k,v){ return '<div><span>'+k+'</span><b>'+v+'</b></div>'; };
  const grid = n===cur
    ? cell('TANGGAL LAHIR',F(b))+cell('ULANG TAHUN BERIKUTNYA',F(c.next))+cell('USIA BERIKUTNYA',(n+1)+' TAHUN')+cell('SISA MENUJU ULANG TAHUN',c.left.toLocaleString('id-ID')+' HARI')
    : cell('TANGGAL LAHIR',F(b))+cell('USIA '+n+' DIMULAI',F(c.start))+cell('USIA '+n+' BERAKHIR',F(c.end))+cell('LAMA USIA INI',c.total+' HARI');
  const bar = n===cur ? c.done.toLocaleString('id-ID')+' DARI '+c.total.toLocaleString('id-ID')+' HARI · USIA BERJALAN' : n<cur ? 'SELESAI · '+c.total+' HARI' : 'BELUM DIMULAI · '+c.total+' HARI';
  m.querySelector('.mcfa-am-body').innerHTML =
    '<div class="mcfa-am-hero"><div class="mcfa-am-k">'+st+'</div><div class="mcfa-am-big">'+n+' TAHUN</div>'+
    '<div class="mcfa-am-s">LAHIR · '+F(b)+' · TAHUN '+c.start.getFullYear()+'–'+c.end.getFullYear()+'</div>'+
    '<div class="mcfa-am-bar" aria-hidden="true"><i style="width:'+c.pct.toFixed(1)+'%"></i></div><div class="mcfa-am-s">'+bar+'</div>'+
    '<div class="mcfa-am-s">'+mcfaAgePhaseLabel(c,now)+'</div></div>'+
    '<div class="mcfa-am-tl">'+rows+'</div><div class="mcfa-am-grid">'+grid+'</div>';
  mcfaAgeChips(m.querySelector('.mcfa-am-rail'), cur, n, mcfaFillAge);
}
function mcfaOpenAge(n){
  const cur = mcfaAgeOn(mcfaNowJakarta());
  let m = document.getElementById('mcfa-age-modal');
  if (!m){
    m = document.createElement('div'); m.id = 'mcfa-age-modal'; m.className = 'mcfa-am';
    m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-labelledby','mcfa-am-t');
    m.addEventListener('click', function(e){ if (e.target === m) mcfaCloseAge(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') mcfaCloseAge(); });
    document.body.appendChild(m);
  }
  m.innerHTML = '<div class="mcfa-am-sheet"><div class="mcfa-am-head"><div id="mcfa-am-t" class="mcfa-am-title">PERJALANAN USIA</div>'+
    '<button type="button" class="mcfa-am-x" onclick="mcfaCloseAge()" aria-label="Tutup"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'+
    '<div class="mcfa-chips mcfa-am-rail"></div><div class="mcfa-am-body"></div></div>';
  mcfaFillAge(n==null ? cur : n);
  document.body.classList.add('mcfa-am-lock');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ m.classList.add('on'); var r=m.querySelector('.mcfa-am-rail'), t=r.querySelector('.is-sel'); if(t) r.scrollLeft=Math.max(0,t.offsetLeft-r.clientWidth/2+t.offsetWidth/2); }); });
}
function mcfaCloseAge(){
  const m = document.getElementById('mcfa-age-modal'); if (!m) return;
  m.classList.remove('on'); document.body.classList.remove('mcfa-am-lock');
  setTimeout(function(){ if (!m.classList.contains('on')) m.innerHTML = ''; }, 320);
}
/* Status proyek pada tanggal tertentu (HARI PERSIAPAN → DAY n → FASE SEMPURNA) */
MCFA_DERIVED.taskTotalDays   = mcfaDaysInclusive(MCFA_CORE.taskStart, MCFA_CORE.taskEnd);     // 20
MCFA_DERIVED.prepTotalDays   = mcfaDaysInclusive(MCFA_CORE.prepStart, MCFA_CORE.prepEnd);      // 2
MCFA_DERIVED.adaptTotalDays  = mcfaDaysInclusive(MCFA_CORE.adaptStart, MCFA_CORE.adaptEnd);    // 13 (8–20 NOV)
MCFA_DERIVED.decoTotalDays   = mcfaDaysInclusive(MCFA_CORE.decoStart, MCFA_CORE.adaptEnd);     // 15 (6–20 NOV)
/* Info periode persiapan (Tugas Awal): key = 'task' → {state:'next|now|done', dayNo, total, text} */
MCFA_DERIVED.periodInfo = function(key, date){
  const a = key==='adapt' ? MCFA_CORE.adaptStart : (key==='prep' ? MCFA_CORE.prepStart : MCFA_CORE.taskStart), b = key==='adapt' ? MCFA_CORE.adaptEnd : (key==='prep' ? MCFA_CORE.prepEnd : MCFA_CORE.taskEnd);
  const total = mcfaDaysInclusive(a, b), d = mcfaMidnight(date), dayNo = mcfaDaysBetween(mcfaParse(a), d) + 1;
  if (dayNo < 1) return {state:'next', dayNo:0, total:total, text:'DIMULAI DALAM '+(1-dayNo).toLocaleString('id-ID')+' HARI'};
  if (dayNo > total) return {state:'done', dayNo:total, total:total, text:'SELESAI'};
  return {state:'now', dayNo:dayNo, total:total, text:'HARI KE-'+dayNo+' DARI '+total};
};
MCFA_DERIVED.projectStatus = function(date){
  const d = mcfaMidnight(date), tS = mcfaParse(MCFA_CORE.taskStart), tE = mcfaParse(MCFA_CORE.taskEnd), pS = mcfaParse(MCFA_CORE.projectStart), pE = mcfaParse(MCFA_CORE.projectEnd);
  if (d < tS) return 'PERSIAPAN DALAM '+mcfaDaysBetween(d, tS).toLocaleString('id-ID')+' HARI';
  const aS = mcfaParse(MCFA_CORE.adaptStart), aE = mcfaParse(MCFA_CORE.adaptEnd), qS = mcfaParse(MCFA_CORE.prepStart), qE = mcfaParse(MCFA_CORE.prepEnd);
  /* Tugas Awal = payung 1–20 NOV; Persiapan Lanjutan dan Adaptasi berjalan di dalamnya (tidak pernah dua-duanya di hari yang sama) */
  if (d >= tS && d <= tE){ const a = MCFA_DERIVED.periodInfo('task', d); let t = 'TUGAS AWAL '+a.dayNo+'/'+a.total;
    if (d >= qS && d <= qE){ const q = MCFA_DERIVED.periodInfo('prep', d); t += ' · PERSIAPAN '+q.dayNo+'/'+q.total; }
    else if (d >= aS && d <= aE){ const b = MCFA_DERIVED.periodInfo('adapt', d); t += ' · ADAPTASI '+b.dayNo+'/'+b.total; }
    return t; }
  if (d <= pE){ const n = MCFA_DERIVED.projectDayOf(d); return n === 1 ? 'DAY 1 — HARI INI DIMULAI' : 'DAY '+n.toLocaleString('id-ID')+' · BERJALAN'; }
  return 'FASE SEMPURNA';
};
/* Validasi otomatis terhadap spesifikasi (hasil di console) */
function mcfaSelfCheck(){
  const bad=[], eq=function(l,a,b){ if(a!==b) bad.push(l+': '+a+' ≠ '+b); };
  eq('total hari', MCFA_DERIVED.projectTotalDays, 1096);
  eq('hari tugas awal', MCFA_DERIVED.taskTotalDays, 20);
  eq('studio mulai = project mulai', MCFA_CORE.studioStart, MCFA_CORE.projectStart);
  eq('keuangan mulai', MCFA_CORE.financeStart, '2026-01-01');
  eq('pengobatan berakhir', MCFA_CORE.treatmentEnd, '2026-10-31');
  eq('tugas awal mulai', MCFA_CORE.taskStart, '2026-11-01');
  eq('tugas awal berakhir', MCFA_CORE.taskEnd, '2026-11-20');
  eq('tugas persiapan mulai', MCFA_CORE.prepStart, '2026-11-03');
  eq('tugas persiapan berakhir', MCFA_CORE.prepEnd, '2026-11-04');
  eq('hari tugas persiapan', MCFA_DERIVED.prepTotalDays, 2);
  eq('program adaptasi mulai', MCFA_CORE.adaptStart, '2026-11-08');
  eq('daftar dekorasi mulai', MCFA_CORE.decoStart, '2026-11-06');
  eq('program adaptasi berakhir', MCFA_CORE.adaptEnd, '2026-11-20');
  eq('hari program adaptasi', MCFA_DERIVED.adaptTotalDays, 13);
  eq('hari daftar dekorasi', MCFA_DERIVED.decoTotalDays, 15);
  eq('tugas persiapan di dalam tugas awal', MCFA_CORE.prepStart>=MCFA_CORE.taskStart && MCFA_CORE.prepEnd<=MCFA_CORE.taskEnd, true);
  eq('program adaptasi di dalam tugas awal', MCFA_CORE.adaptStart>=MCFA_CORE.taskStart && MCFA_CORE.adaptEnd<=MCFA_CORE.taskEnd, true);
  eq('tugas awal berakhir = adaptasi berakhir', MCFA_CORE.taskEnd, MCFA_CORE.adaptEnd);
  eq('tugas awal → DAY 1 berurutan', mcfaDaysBetween(mcfaParse(MCFA_CORE.taskEnd), mcfaParse(MCFA_CORE.projectStart)), 1);
  eq('persiapan → adaptasi: 5, 6, 7 NOV = tiga hari Tugas Awal di antaranya', mcfaDaysBetween(mcfaParse(MCFA_CORE.prepEnd), mcfaParse(MCFA_CORE.adaptStart)), 4);
  eq('DAY 2 = 22 NOV 2026', MCFA_DERIVED.projectDayOf(mcfaParse('2026-11-22')), 2);
  eq('29 FEB 2028 ada (kabisat)', mcfaIso(mcfaParse('2028-02-29')), '2028-02-29');
  eq('Tahap 2 memuat 366 hari', mcfaDaysBetween(mcfaParse('2027-11-21'), mcfaParse('2028-11-21')), 366);
  eq('adaptasi → DAY 1 berurutan', mcfaDaysBetween(mcfaParse(MCFA_CORE.adaptEnd), mcfaParse(MCFA_CORE.projectStart)), 1);
  eq('pengobatan → tugas awal berurutan', mcfaDaysBetween(mcfaParse(MCFA_CORE.treatmentEnd), mcfaParse(MCFA_CORE.taskStart)), 1);
  eq('tahap 3 mulai', MCFA_CORE.growthStart, '2027-01-01');
  eq('tahap 4 mulai', MCFA_CORE.evalStart, '2027-01-01');
  eq('project mulai', MCFA_CORE.projectStart, '2026-11-21');
  eq('posting konten mulai', MCFA_CORE.contentStart, '2026-11-21');
  eq('DAY 1 posting = DAY 1 project', MCFA_CORE.contentStart === MCFA_CORE.projectStart, true);
  eq('project berakhir', MCFA_CORE.projectEnd, '2029-11-20');
  eq('hari Tahap 1', mcfaDaysInclusive(MCFA_CORE.projectStart, MCFA_CORE.stage1End), 365);
  eq('hari Tahap 2', mcfaDaysInclusive(MCFA_CORE.stage2Start, MCFA_CORE.stage2End), 366);
  eq('hari Tahap 3', mcfaDaysInclusive(MCFA_CORE.stage3Start, MCFA_CORE.projectEnd), 365);
  eq('Tahap 1→2 berurutan', mcfaDaysBetween(mcfaParse(MCFA_CORE.stage1End), mcfaParse(MCFA_CORE.stage2Start)), 1);
  eq('Tahap 2→3 berurutan', mcfaDaysBetween(mcfaParse(MCFA_CORE.stage2End), mcfaParse(MCFA_CORE.stage3Start)), 1);
  eq('DAY 1', MCFA_DERIVED.projectDayOf(mcfaParse(MCFA_CORE.projectStart)), 1);
  eq('DAY akhir', MCFA_DERIVED.projectDayOf(mcfaParse(MCFA_CORE.projectEnd)), 1096);
  eq('Tahap 1+2+3 = total', mcfaDaysInclusive(MCFA_CORE.projectStart, MCFA_CORE.stage1End)+mcfaDaysInclusive(MCFA_CORE.stage2Start, MCFA_CORE.stage2End)+mcfaDaysInclusive(MCFA_CORE.stage3Start, MCFA_CORE.projectEnd), 1096);
  eq('umur 21 @ H-1 DAY 1 (adaptasi hari ke-13)', mcfaAgeOn(mcfaParse(MCFA_CORE.adaptEnd)), 21);
  eq('umur 22 @ projectStart (DAY 1 = ulang tahun ke-22)', mcfaAgeOn(mcfaParse(MCFA_CORE.projectStart)), 22);
  eq('umur 24 @ projectEnd', mcfaAgeOn(mcfaParse(MCFA_CORE.projectEnd)), 24);
  eq('umur 25 @ fase sempurna', mcfaAgeOn(mcfaParse(MCFA_CORE.perfectPhaseStart)), 25);
  eq('jumlah milestone', MCFA_AGE_MILESTONES.length, 25);
  MCFA_AGE_MILESTONES.forEach(function(m){ const d=mcfaParse(m.date); eq('milestone '+m.age, mcfaAgeOn(d), m.age); eq('H-1 milestone '+m.age, mcfaAgeOn(new Date(d.getFullYear(),d.getMonth(),d.getDate()-1)), m.age-1); });
  [2191,4383,1096,365,1096,null].forEach(function(v,i){ eq('durasi fase '+(i+1), LIFE_PHASES[i].days, v); });
  for(let i=1;i<LIFE_PHASES.length;i++) eq('fase '+(i+1)+' menyambung', mcfaDaysBetween(mcfaParse(LIFE_PHASES[i-1].end), mcfaParse(LIFE_PHASES[i].start)), 1);
  if (bad.length) console.warn('[MCFA] CORE TIDAK SINKRON:', bad); else console.log('[MCFA] CORE OK — tanggal, umur, fase, dan hitungan hari sinkron');
  return bad;
}
/* Tanggal tersimpan format d/m/yyyy (riwayat konten) → tampil KAPITAL */
function formatDDMYUpper(s){
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s||'').trim());
  return m ? formatDateUpper(new Date(+m[3], +m[2]-1, +m[1])) : String(s||'');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ mcfaBindDates(); });
else mcfaBindDates();

/* ── Official History: enam bab fase dibangun dari LIFE_PHASES ── */
const MCFA_ROMAN=['I','II','III','IV','V','VI'];
const MCFA_PH_STYLE=[
 {a:'#d9b37a',bg:'#2a2013,#17110a'},{a:'#a8c47a',bg:'#1d2514,#10150b'},{a:'#c98a3e',bg:'#2a1c10,#150e07'},
 {a:'#8fc1b0',bg:'#16262a,#0b1517'},{a:'#e0b94f',bg:'#2d2610,#161208'},{a:'#f7dfa0',bg:'#3d2f18,#1a1209'}];
function mcfaTreeSvg(n){            /* n = 1..6, pohon tumbuh dari bibit hingga utuh */
  const h=[14,30,26,34,52,78][n-1], c='#e8c264', g='#7fae5c', w=n>=5?4:2.5;
  let s='<svg class="oh-emblem" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:96px;height:96px">'+
   '<defs><radialGradient id="ohg'+n+'"><stop offset="0" stop-color="'+c+'" stop-opacity=".35"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></radialGradient></defs>'+
   '<circle cx="50" cy="55" r="46" fill="url(#ohg'+n+')"/><path d="M8 82h84" stroke="#6b5430" stroke-width="2"/>';
  if(n>=3){ s+='<path d="M50 82C44 90 36 92 28 95M50 82C56 90 66 91 74 95M50 82V96" stroke="#9c7a45" stroke-width="'+(n===3?1.4:2)+'"'+(n===4?' stroke-dasharray="3 2"':'')+'/>'; }
  if(n===4) s+='<circle cx="50" cy="90" r="9" stroke="#8fc1b0" stroke-opacity=".6"/>';
  s+='<path d="M50 82V'+(82-h)+'" stroke="#a98254" stroke-width="'+w+'" stroke-linecap="round"/>';
  if(n===1) s+='<ellipse cx="50" cy="76" rx="5" ry="7" fill="#b98a4a"/>';
  if(n>=2) s+='<path d="M50 '+(82-h)+'C42 '+(78-h)+' 38 '+(82-h)+' 38 '+(86-h)+'C45 '+(86-h)+' 50 '+(84-h)+' 50 '+(82-h)+'zM50 '+(82-h*0.7)+'C58 '+(78-h*0.7)+' 63 '+(80-h*0.7)+' 63 '+(84-h*0.7)+'C56 '+(85-h*0.7)+' 51 '+(84-h*0.7)+' 50 '+(82-h*0.7)+'z" fill="'+g+'"/>';
  if(n>=5) s+='<path d="M50 '+(82-h*0.55)+'L30 '+(82-h*0.8)+'M50 '+(82-h*0.45)+'L72 '+(82-h*0.72)+'M50 '+(82-h*0.7)+'L36 '+(82-h*0.95)+'M50 '+(82-h*0.7)+'L64 '+(82-h*0.98)+'" stroke="#a98254" stroke-width="2.2" stroke-linecap="round"/>';
  if(n===6){ s+='<circle cx="50" cy="26" r="24" fill="'+g+'" fill-opacity=".85"/><circle cx="34" cy="38" r="15" fill="'+g+'" fill-opacity=".8"/><circle cx="66" cy="38" r="15" fill="'+g+'" fill-opacity=".8"/><circle cx="42" cy="30" r="2.6" fill="#f7dfa0"/><circle cx="60" cy="22" r="2.6" fill="#f7dfa0"/><circle cx="56" cy="40" r="2.6" fill="#e0954f"/><circle cx="38" cy="44" r="2.6" fill="#e0954f"/>'; }
  else if(n===5){ s+='<circle cx="50" cy="'+(82-h-4)+'" r="9" fill="'+g+'" fill-opacity=".85"/><circle cx="30" cy="'+(82-h*0.8-3)+'" r="6" fill="'+g+'" fill-opacity=".8"/><circle cx="72" cy="'+(82-h*0.72-3)+'" r="6" fill="'+g+'" fill-opacity=".8"/>'; }
  return s+'</svg>';
}
/* ═══ HERO ILUSTRASI OFFICIAL HISTORY — vektor prosedural, tanpa emoji ═══ */
function _ohR(seed){ let q=seed%2147483647; if(q<=0) q+=2147483646; return function(){ q=q*16807%2147483647; return (q-1)/2147483646; }; }
function _f(n){ return Math.round(n*10)/10; }
function ohSky(id,a,b,c){ return '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset=".62" stop-color="'+b+'"/><stop offset="1" stop-color="'+c+'"/></linearGradient></defs><rect width="320" height="160" fill="url(#'+id+')"/>'; }
function ohGlow(id,x,y,r,c,o){ return '<defs><radialGradient id="'+id+'"><stop offset="0" stop-color="'+c+'" stop-opacity="'+(o||1)+'"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></radialGradient></defs><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="url(#'+id+')"/>'; }
function ohRays(x,y,c,o){ let d=''; for(let i=0;i<7;i++){ const a1=i*0.9, a2=a1+0.13; d+='<path d="M'+x+' '+y+'L'+_f(x+Math.cos(a1)*420)+' '+_f(y+Math.sin(a1)*420)+'L'+_f(x+Math.cos(a2)*420)+' '+_f(y+Math.sin(a2)*420)+'Z"/>'; } return '<g fill="'+c+'" opacity="'+o+'">'+d+'</g>'; }
function ohHills(y,amp,seed,col,op){ const r=_ohR(seed); let d='M0 '+y, x=0; while(x<320){ const nx=x+55+r()*40; d+='Q'+_f(x+(nx-x)/2)+' '+_f(y-amp*(.4+r()*.8))+' '+_f(nx)+' '+_f(y+(r()-.5)*amp*.4); x=nx; } return '<path d="'+d+'V160H0Z" fill="'+col+'" fill-opacity="'+(op||1)+'"/>'; }
function ohCanopy(cx,cy,R,seed,c1,c2){ const r=_ohR(seed); let o=''; for(let i=0;i<18;i++){ const a=r()*6.283, d=r()*R*.72, rr=R*(.26+r()*.28); o+='<circle cx="'+_f(cx+Math.cos(a)*d)+'" cy="'+_f(cy+Math.sin(a)*d*.72)+'" r="'+_f(rr)+'" fill="'+(i%3?c1:c2)+'" fill-opacity="'+(.55+r()*.4).toFixed(2)+'"/>'; } return o; }
function ohTree(x,b,h,seed,c1,c2,tr){ const w=h*.06; let o='<ellipse cx="'+x+'" cy="'+(b+1)+'" rx="'+_f(h*.32)+'" ry="'+_f(h*.05)+'" fill="#000" opacity=".28"/>';
  o+='<path d="M'+_f(x-w)+' '+b+'Q'+_f(x-w*.45)+' '+_f(b-h*.4)+' '+_f(x-w*.3)+' '+_f(b-h*.72)+'H'+_f(x+w*.3)+'Q'+_f(x+w*.45)+' '+_f(b-h*.4)+' '+_f(x+w)+' '+b+'Z" fill="'+tr+'"/>';
  o+='<g fill="none" stroke="'+tr+'" stroke-linecap="round" stroke-width="'+_f(Math.max(1,w*.5))+'"><path d="M'+x+' '+_f(b-h*.5)+'Q'+_f(x-h*.14)+' '+_f(b-h*.62)+' '+_f(x-h*.26)+' '+_f(b-h*.74)+'"/><path d="M'+x+' '+_f(b-h*.56)+'Q'+_f(x+h*.14)+' '+_f(b-h*.68)+' '+_f(x+h*.25)+' '+_f(b-h*.8)+'"/></g>';
  return o+ohCanopy(x,b-h*.8,h*.36,seed,c1,c2); }
function ohRoots(x,y,len,seed,col,w){ const r=_ohR(seed); let o='<g fill="none" stroke="'+col+'" stroke-linecap="round">';
  const br=function(px,py,a,l,sw,d){ if(d<0||l<3) return; const nx=px+Math.cos(a)*l, ny=py+Math.sin(a)*l; o+='<path d="M'+_f(px)+' '+_f(py)+'L'+_f(nx)+' '+_f(ny)+'" stroke-width="'+_f(sw)+'"/>'; br(nx,ny,a+(r()-.5)*.9-.3,l*.8,sw*.72,d-1); if(r()>.35) br(nx,ny,a+(r()-.5)*.9+.5,l*.7,sw*.6,d-1); };
  br(x,y,1.57,len,w,4); br(x,y,1.57-.75,len*.8,w*.8,3); br(x,y,1.57+.75,len*.8,w*.8,3); return o+'</g>'; }
function ohGrass(y,seed,col,n){ const r=_ohR(seed); let d=''; for(let i=0;i<(n||40);i++){ const x=r()*320, h=3+r()*7; d+='M'+_f(x)+' '+y+'q'+_f((r()-.5)*4)+' '+_f(-h*.6)+' '+_f((r()-.5)*5)+' '+_f(-h); } return '<path d="'+d+'" stroke="'+col+'" stroke-width=".9" fill="none" opacity=".8"/>'; }
const MCFA_OH_HERO = {
 prolog1: function(){ return ohSky('hs0','#1b130b','#6b4623','#f0b866')+ohGlow('hg0',160,98,80,'#ffe0a0',.9)+ohRays(160,98,'#ffe6b0',.07)+ohHills(104,14,3,'#2a1d10',.9)+ohHills(114,10,5,'#17100a')+
   '<path d="M144 160L158 102H162L176 160Z" fill="#3a2a17"/><path d="M122 160L156 102M198 160L164 102" stroke="#9a7a45" stroke-width=".8" opacity=".5"/>'+ohGlow('hg0b',160,101,14,'#fff3cf')+'<circle cx="160" cy="101" r="2.6" fill="#fff8e0"/>'+
   '<path d="M52 160V140Q52 126 66 126Q80 126 80 140V160Z" fill="#2b2118" stroke="#6a5030" stroke-width="1"/><circle cx="66" cy="141" r="6.5" fill="none" stroke="#d7ad66" stroke-width="1.6"/>'+ohGrass(160,4,'#5a4526',26); },
 prolog2: function(){ let P=[[28,128],[70,104],[112,114],[160,84],[206,94],[250,56],[292,34]], d='M'+P.map(function(p){return p[0]+' '+p[1];}).join('L'), w='';
   P.forEach(function(p,i){ w+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i===6?4.5:2.8)+'" fill="'+(i===6?'#fff0c0':'#d7ad66')+'"/>'; });
   let c=''; for(let i=1;i<6;i++) c+='<ellipse cx="236" cy="52" rx="'+(i*26)+'" ry="'+(i*15)+'" fill="none" stroke="#c9a05a" stroke-opacity=".13"/>';
   return '<rect width="320" height="160" fill="#17110a"/>'+ohGlow('hg1',292,34,60,'#ffe0a0',.55)+c+'<ellipse cx="80" cy="130" rx="90" ry="40" fill="none" stroke="#c9a05a" stroke-opacity=".08"/><path d="'+d+'" fill="none" stroke="#d7ad66" stroke-width="1.6" stroke-dasharray="4 4" stroke-linejoin="round" stroke-linecap="round" opacity=".85"/>'+w+
   '<g transform="translate(34 36)" fill="none" stroke="#c9a05a" stroke-opacity=".7"><circle r="15"/><circle r="10" stroke-opacity=".4"/><path d="M0-19L3 0L0 19L-3 0Z" fill="#c9a05a" fill-opacity=".55"/><path d="M-19 0L0-3L19 0L0 3Z" fill="#c9a05a" fill-opacity=".3"/></g>'; },
 'bibit-awal': function(){ return ohSky('hs2','#241a14','#8a5a36','#e8a860')+ohGlow('hg2',80,104,70,'#ffcf86',.8)+ohHills(100,12,8,'#2a1d14',.95)+
   '<path d="M222 106V84L246 68L270 84V106Z" fill="#120c07"/><path d="M216 86L246 64L276 86" fill="none" stroke="#1e150d" stroke-width="3"/><rect x="238" y="88" width="9" height="12" fill="#ffc46b"/>'+ohGlow('hg2w',242,94,22,'#ffc46b',.6)+
   '<rect y="118" width="320" height="42" fill="#2e1d10"/><path d="M0 118H320" stroke="#6a4a2a" stroke-width="1.5"/>'+ohGrass(118,6,'#7d8a3e',34)+
   '<g transform="rotate(-14 120 144)"><ellipse cx="120" cy="144" rx="7" ry="4.2" fill="#c89a58"/><ellipse cx="118" cy="143" rx="3" ry="1.4" fill="#e8c88a" opacity=".6"/></g><path d="M130 142Q128 132 126 122" fill="none" stroke="#8aa347" stroke-width="1.6" stroke-linecap="round"/><path d="M127 126Q116 124 113 114Q125 114 127 126Z" fill="#7f9a3d"/><path d="M127 124Q138 120 141 111Q129 111 127 124Z" fill="#9ab850"/>'; },
 pertumbuhan: function(){ return ohSky('hs3','#16301f','#5f8a3e','#e8dc8a')+ohGlow('hg3',262,34,70,'#fff0b3',.85)+ohRays(262,34,'#fff0b3',.06)+ohHills(104,16,9,'#27452a',.9)+ohHills(114,10,2,'#1d3320')+
   ohTree(150,120,64,7,'#6f9a3a','#a6c95a','#6b4a2a')+'<rect y="120" width="320" height="40" fill="#3a2615"/><path d="M0 120H320" stroke="#7a5a30"/>'+ohRoots(150,121,15,5,'#8a6a40',2.2)+ohGrass(120,3,'#8bb04a',40); },
 akar: function(){ return '<rect width="320" height="160" fill="#07060b"/>'+ohGlow('hg4',160,0,110,'#ffd9a0',.28)+'<path d="M146 0H174L200 160H120Z" fill="#ffd9a0" opacity=".05"/>'+'<path d="M0 0H64Q80 80 52 160H0Z M320 0H256Q240 80 268 160H320Z" fill="#100d16"/>'+
   ohRoots(160,0,34,11,'#6e5238',3.4)+ohRoots(110,0,30,17,'#58412e',2.6)+ohRoots(212,0,30,23,'#58412e',2.6)+'<circle cx="160" cy="96" r="2.2" fill="#ffd9a0" opacity=".8"/>'+ohGlow('hg4b',160,96,16,'#ffd9a0',.35); },
 penyembuhan: function(){ let f='', r=_ohR(31); for(let i=0;i<14;i++) f+='<circle cx="'+_f(r()*320)+'" cy="'+_f(124+r()*30)+'" r="1.4" fill="'+(i%2?'#f6c6d4':'#fff3d6')+'"/>';
   return ohSky('hs5','#1f3b3a','#8fbfa8','#f0dca0')+ohGlow('hg5',90,92,80,'#fff1c0',.85)+ohRays(90,92,'#fff6d6',.07)+ohHills(100,14,12,'#3f7a62',.8)+ohHills(112,10,4,'#2d5a48')+
   '<ellipse cx="170" cy="108" rx="120" ry="9" fill="#fff" opacity=".12"/><ellipse cx="90" cy="118" rx="100" ry="7" fill="#fff" opacity=".1"/>'+'<rect y="124" width="320" height="36" fill="#1d3a2c"/>'+ohTree(222,126,66,11,'#8fcf78','#c4e68f','#6a4a30')+ohGrass(124,7,'#9bd07a',44)+f; },
 'bibit-baru': function(){ return '<defs><linearGradient id="hs6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset="1" stop-color="#16203f"/></linearGradient><linearGradient id="hm6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe2ff"/><stop offset="1" stop-color="#3566c8"/></linearGradient><linearGradient id="hb6" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff3d0" stop-opacity=".55"/><stop offset="1" stop-color="#fff3d0" stop-opacity="0"/></linearGradient></defs><rect width="320" height="160" fill="url(#hs6)"/>'+
   ohGlow('hg6',170,70,90,'#7fb2ff',.3)+'<path d="M40 40L130 74V112L40 128Z" fill="url(#hb6)"/><rect x="26" y="34" width="16" height="100" rx="3" fill="#e9dcc0" opacity=".9"/><path d="M34 134V150" stroke="#2c2c34" stroke-width="3"/>'+
   '<rect y="126" width="320" height="34" fill="#100b08"/><rect x="92" y="112" width="150" height="8" rx="2" fill="#2e2217"/><path d="M108 120V150M226 120V150" stroke="#241a11" stroke-width="5"/>'+
   '<rect x="140" y="62" width="80" height="50" rx="4" fill="#06080f" stroke="#33436a" stroke-width="2"/><rect x="145" y="67" width="70" height="40" rx="2" fill="url(#hm6)" opacity=".88"/><path d="M180 112V104M164 112H196" stroke="#33436a" stroke-width="3"/>'+
   '<g stroke="#3a2f22" stroke-width="2" stroke-linecap="round"><path d="M266 122L252 80M266 122L282 80M266 122V84"/></g><rect x="248" y="58" width="36" height="26" rx="4" fill="#0b0b10" stroke="#5a6278" stroke-width="1.5"/><circle cx="266" cy="71" r="8" fill="#10172a" stroke="#7fb2ff" stroke-width="1.6"/><circle cx="263" cy="68" r="2" fill="#bcd6ff" opacity=".7"/>'+
   '<path d="M108 112L112 98H124L128 112Z" fill="#b8825a"/>'+ohTree(118,98,22,41,'#7fcf78','#a6e08a','#6a4a30'); },
 sempurna: function(){ let st='', c='', r=_ohR(53); for(let i=0;i<26;i++) st+='<circle cx="'+_f(r()*320)+'" cy="'+_f(r()*60)+'" r=".8" fill="#fff" opacity="'+(.3+r()*.5).toFixed(2)+'"/>';
   for(let x=6;x<150;x+=14){ const h=18+r()*40; c+='<rect x="'+x+'" y="'+_f(112-h)+'" width="11" height="'+_f(h)+'" fill="#1a1626"/>'; if(r()>.4) c+='<rect x="'+(x+3)+'" y="'+_f(112-h+6)+'" width="2" height="3" fill="#ffd58a"/>'; }
   return ohSky('hs7','#141a3a','#b8783e','#f6d58a')+st+ohGlow('hg7',215,96,90,'#fff0c4',.7)+ohRays(215,96,'#fff0c4',.05)+'<path d="M24 0L-10 112H58Z M120 0L84 112H158Z" fill="#fff0c4" opacity=".08"/>'+c+ohHills(116,10,14,'#1e1710')+'<rect y="118" width="320" height="42" fill="#0f0b07"/>'+ohTree(214,124,92,13,'#4f7a3a','#7da64e','#4a331f')+ohGrass(124,9,'#6f9a4a',36); }
};
const MCFA_OH_VIG='<defs><radialGradient id="hvg"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs><rect width="320" height="160" fill="url(#hvg)"/>';
var MCFA_OH_N = 0; /* id gradien unik per SVG agar tidak ada ID ganda di DOM */
function mcfaOhSvg(key){ const f=MCFA_OH_HERO[key]; return f ? '<svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustrasi Official History" focusable="false">'+f()+MCFA_OH_VIG.split('hvg').join('hvg'+(++MCFA_OH_N))+'</svg>' : ''; }
function mcfaOhHero(key){ return '<div class="oh-hero">'+mcfaOhSvg(key)+'</div>'; }
function mcfaFillHeroes(){ document.querySelectorAll('[data-hero]').forEach(function(el){ if(!el.firstChild) el.innerHTML = mcfaOhSvg(el.getAttribute('data-hero')); }); }
function mcfaBuildPhaseChapters(){
  mcfaFillHeroes();
  const stage=document.getElementById('oh-stage'), hint=document.getElementById('oh-hint');
  if(!stage||!hint||stage.querySelector('[data-phase]')) return;
  const ribbon=function(i){ return '<div class="oh-ribbon">'+LIFE_PHASES.map(function(q,k){ return '<span class="oh-rb'+(k<i?' done':'')+(k===i?' now':'')+'"></span>'; }).join('')+'</div>'; };
  LIFE_PHASES.forEach(function(p,i){
    const st=MCFA_PH_STYLE[i], prev=LIFE_PHASES[i-1], nxt=LIFE_PHASES[i+1], bg=st.bg.split(',');
    const umur = p.ageEnd===null ? p.ageStart+' TAHUN DAN SETERUSNYA' : (p.ageStart===p.ageEnd ? p.ageStart+' TAHUN' : p.ageStart+' – '+p.ageEnd+' TAHUN');
    const range = formatDateUpper(p.start)+'</span><span class="oh-date-arrow">↓</span><span>'+p.endLabel;
    const el=document.createElement('div');
    el.className='oh-chapter oh-scrollable'; el.setAttribute('data-key',String(i+3)); el.setAttribute('data-phase',p.key);
    el.style.setProperty('--oh-accent',st.a); el.style.setProperty('--oh-accent-soft',st.a+'2a');
    el.innerHTML='<div class="oh-bg" style="background-image:linear-gradient(180deg,'+bg[0]+' 0%,'+bg[1]+' 60%,#0b0704 100%);"></div><div class="oh-rays"></div><div class="oh-fog oh-fog1"></div><div class="oh-dust"></div><div class="oh-vignette"></div><div class="oh-grain"></div>'+
     '<div class="oh-content">'+ribbon(i)+
     '<div class="oh-eyebrow">Bab '+MCFA_ROMAN[i]+' &middot; '+p.title+'</div>'+mcfaOhHero(p.key)+
     '<div class="oh-title" style="font-size:24px;">'+p.title.replace('FASE ','')+'</div>'+
     '<div class="oh-date-sub" style="margin:2px 0 6px;font-size:11px;letter-spacing:1.5px;">'+p.subtitle+'</div>'+
     '<div class="oh-date-sub" style="color:#f3d38a;font-size:12px;letter-spacing:1px;">'+p.identity+(p.subIdentity?' · '+p.subIdentity:'')+'</div>'+
     '<div class="oh-date-range"><span>'+range+'</span></div>'+
     '<div class="oh-date-sub" style="font-size:10.5px;letter-spacing:2px;">'+umur+(p.days?' · '+p.days.toLocaleString('id-ID')+' HARI':' · BERKELANJUTAN')+'</div>'+
     '<div class="oh-body" style="font-size:13px;margin-top:10px;">'+p.meaning+'</div>'+
     '<div class="oh-focus-list"><div class="oh-focus-item"><b>Fokus —</b> '+p.focus.join(' · ')+'</div>'+(p.extra?'<div class="oh-focus-item"><b>'+p.extra+'</b></div>':'')+(p.metaphor?'<div class="oh-focus-item"><b>'+p.metaphor+'</b></div>':'')+'</div>'+
     '<div class="oh-quote" style="margin-top:16px;font-size:15px;">“'+p.narasi+'”</div>'+
     '<div class="oh-fineprint">'+(prev?'← dari '+prev.title.replace('FASE ',''):'← LAHIR')+' &nbsp;|&nbsp; '+(nxt?p.next+' → '+nxt.title.replace('FASE ',''):p.next+' → SELANJUTNYA')+'</div></div>';
    stage.insertBefore(el,hint);
  });
}
function mcfaRenderTree(){
  const wrap=document.getElementById('mcfaTreeWrap'); if(!wrap) return;
  const today=mcfaNowJakarta();
  const cur=LIFE_PHASES.indexOf(mcfaPhaseOn(today));
  const ti=MCFA_DERIVED.periodInfo('task',today);
  const pst=function(i){ return i<cur?'done':(i===cur?'now':'next'); };
  const bst=function(inf){ return cur>3?'done':inf.state; };
  /* 7 perhentian di pohon: 01 02 03 04 · TUGAS AWAL · 05 06  (urutan = jalur perjalanan; indeks 5 = ruas jalur penghubung Tugas Awal → 05, tanpa simpul) */
  const S=[pst(0),pst(1),pst(2),
    (cur===3?(ti.state==='next'?'now':'done'):(cur>3?'done':'next')),
    bst(ti),bst(ti),pst(4),pst(5)];
  const op=function(s){ return s==='next'?.5:1; };
  const TR=['kehidupan dimulai','dunia mulai dikenal','fondasi mulai dicari','akar yang terluka mulai dipulihkan','kehidupan baru mulai ditanam','pohon menjadi utuh dan mulai memberi teduh'];
  const SHORT=['BIBIT AWAL','PERTUMBUHAN','AKAR','PENYEMBUHAN','BIBIT BARU','SEMPURNA'];
  const fmt=formatDateUpper;

  /* ── alat gambar: pseudo-acak deterministik, kurva bezier, bentuk meruncing ── */
  let seed=20261101;
  const rnd=function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return((t^t>>>14)>>>0)/4294967296; };
  const f1=function(n){ return (Math.round(n*10)/10); };
  const bz=function(p,n){ const o=[]; for(let i=0;i<=n;i++){ const t=i/n,u=1-t;
    o.push([u*u*u*p[0]+3*u*u*t*p[2]+3*u*t*t*p[4]+t*t*t*p[6], u*u*u*p[1]+3*u*u*t*p[3]+3*u*t*t*p[5]+t*t*t*p[7]]); } return o; };
  const chain=function(segs,n){ let o=[]; segs.forEach(function(s,k){ const q=bz(s,n||12); o=o.concat(k?q.slice(1):q); }); return o; };
  const taper=function(pts,w0,w1,pw){ pw=pw||1; const L=[],R=[],n=pts.length;
    for(let i=0;i<n;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(n-1,i+1)]; let dx=b[0]-a[0], dy=b[1]-a[1]; const l=Math.hypot(dx,dy)||1; dx/=l; dy/=l;
      const t=i/(n-1), w=(w1+(w0-w1)*Math.pow(1-t,pw))/2;
      L.push([pts[i][0]-dy*w,pts[i][1]+dx*w]); R.push([pts[i][0]+dy*w,pts[i][1]-dx*w]); }
    let d='M'+f1(L[0][0])+' '+f1(L[0][1]); for(let i=1;i<n;i++) d+='L'+f1(L[i][0])+' '+f1(L[i][1]);
    for(let i=n-1;i>=0;i--) d+='L'+f1(R[i][0])+' '+f1(R[i][1]); return d+'Z'; };
  const line=function(pts){ return 'M'+pts.map(function(p){ return f1(p[0])+' '+f1(p[1]); }).join('L'); };

  /* ── langit & bintang & cahaya bulan (sumber cahaya kiri-atas) ── */
  let stars=''; [[22,30,.8],[70,60,.6],[120,22,.9],[300,40,.7],[335,90,.6],[40,150,.5],[320,170,.6],[95,200,.5],[265,24,.8],[345,230,.5],[18,260,.6],[150,70,.5],[330,300,.5],[28,330,.6]].forEach(function(s){
    stars+='<circle cx="'+s[0]+'" cy="'+s[1]+'" r="'+s[2]+'" fill="#fff" opacity="'+f1(.35+s[2]*.4)+'"/>'; });
  const moon='<circle cx="58" cy="58" r="46" fill="url(#mtMoonHalo)"/><circle cx="58" cy="58" r="11" fill="#f6efd2" opacity=".9"/><circle cx="62" cy="55" r="9.5" fill="#0b1a38" opacity=".55"/>';

  /* ── tanah: lapisan, kerikil, miselium ── */
  let soil='<path d="M0 372C50 366 110 376 200 372C270 368 320 376 360 370V720H0Z" fill="url(#mtSoil)"/>'+
    '<path d="M0 436C80 428 140 446 220 438S330 434 360 442" stroke="#fff" stroke-opacity=".05" stroke-width="7" fill="none"/>'+
    '<path d="M0 560C70 552 150 570 230 562S320 556 360 566" stroke="#000" stroke-opacity=".18" stroke-width="9" fill="none"/>';
  for(let i=0;i<26;i++){ const x=rnd()*350+5, y=392+rnd()*310, r=.8+rnd()*2.1; soil+='<ellipse cx="'+f1(x)+'" cy="'+f1(y)+'" rx="'+f1(r*1.3)+'" ry="'+f1(r)+'" fill="'+(rnd()<.5?'#5a4129':'#150c05')+'" opacity="'+f1(.35+rnd()*.35)+'"/>'; }

  /* ── AKAR: bentuk meruncing, pangkalnya menyatu dengan batang (leher akar) ── */
  const R=[
    {s:[[196,388,176,432,142,468,112,500],[112,500,96,522,80,562,70,614]],w:17},
    {s:[[200,390,206,442,216,488,226,530],[226,530,238,568,233,606,222,660]],w:16},
    {s:[[206,388,238,426,274,448,300,484],[300,484,318,510,324,550,316,598]],w:15},
    {s:[[128,484,150,506,164,540,156,604]],w:6.5},
    {s:[[116,497,98,488,72,500,52,540]],w:5.5},
    {s:[[228,534,254,542,276,558,286,608]],w:6},
    {s:[[292,472,312,464,332,472,346,504]],w:5},
    {s:[[176,428,146,416,116,422,90,448]],w:5}
  ];
  let roots='', veins='', hair='';
  R.forEach(function(r,k){
    const pts=chain(r.s,12), d=taper(pts,r.w,1.4,.9);
    roots+='<path d="'+d+'" fill="url(#mtRoot)" stroke="#1a0f06" stroke-width=".9" stroke-linejoin="round"/>';
    if(k<3){ veins+='<path d="'+line(pts.filter(function(_,i){return i%2===0;}))+'" stroke="url(#mtGold)" stroke-width="1.3" stroke-dasharray="2 6" stroke-linecap="round" fill="none" opacity=".8"/>'; }
    if(k<3) roots+='<path d="'+line(pts.slice(1,Math.floor(pts.length*.85)).map(function(p){return [p[0]-r.w*.12,p[1]];}))+'" stroke="#9a7048" stroke-opacity=".35" stroke-width="1" fill="none"/>';
    /* akar rambut halus di sepanjang akar utama */
    if(k<3) for(let j=0;j<5;j++){ const q=pts[3+Math.floor(rnd()*(pts.length-5))], dir=(rnd()<.5?-1:1), ln=10+rnd()*16;
      hair+='<path d="M'+f1(q[0])+' '+f1(q[1])+'q'+f1(dir*ln*.5)+' '+f1(ln*.3)+' '+f1(dir*ln)+' '+f1(ln*.8)+'" stroke="#5d4228" stroke-width="1.1" stroke-linecap="round" fill="none"/>'; }
  });
  const tips=[[70,614],[222,660],[316,598],[156,604],[52,540],[286,608],[346,504],[90,448]];
  let glow=''; tips.forEach(function(t,k){ glow+=(k<5?'<circle cx="'+t[0]+'" cy="'+t[1]+'" r="7" fill="#a6f08a" opacity=".16"/>':'')+'<circle cx="'+t[0]+'" cy="'+t[1]+'" r="'+(k<5?3:2.2)+'" fill="#a6f08a"/>'; });

  /* ── BATANG meruncing (melebar di pangkal), serat kulit kayu, sorot cahaya kiri ── */
  const trunkPts=chain([[200,396,199,344,201,292,200,228]],16);
  const trunk='<path d="'+taper(trunkPts,54,19,2.1)+'" fill="url(#mtBark)" stroke="#2a190b" stroke-width=".8" stroke-linejoin="round"/>';
  let bark=''; [[-9,.9],[-3,.6],[5,.8],[11,.5]].forEach(function(o,k){
    const pts=trunkPts.filter(function(_,i){ return i>=2&&i<=14; }).map(function(p,i){ const t=i/12; return [p[0]+o[0]*(1-t*.45)+Math.sin(i*1.3+k)*1.1,p[1]]; });
    bark+='<path d="'+line(pts)+'" stroke="'+(k%2?'#c39663':'#2b1a0c')+'" stroke-opacity="'+(k%2?.28:.5)+'" stroke-width="'+o[1]+'" fill="none" stroke-linecap="round"/>'; });
  bark+='<ellipse cx="205" cy="318" rx="3" ry="6.5" fill="#24150a" opacity=".55"/><ellipse cx="195" cy="272" rx="2.4" ry="5" fill="#24150a" opacity=".45"/>';

  /* ── RANTING: percabangan rekursif (sudut & panjang menurun), ujungnya jadi tempat daun ── */
  let branches='', btips=[];
  const limb=function(x,y,ang,len,w,depth){
    const bend=(rnd()-.5)*.6, a1=ang+bend, a2=ang-bend*.6;
    const p=[x,y, x+Math.sin(a1)*len*.38,y-Math.cos(a1)*len*.38, x+Math.sin(a2)*len*.72,y-Math.cos(a2)*len*.72, x+Math.sin(ang)*len,y-Math.cos(ang)*len];
    const w1=w*.56;
    branches+='<path d="'+taper(bz(p,10),w,w1)+'" fill="url(#mtBark)" stroke="#2a190b" stroke-width=".7" stroke-linejoin="round"/>';
    if(depth>0){ const k=depth>1?3:2; for(let j=0;j<k;j++){ const off=(j-(k-1)/2)*(.55+rnd()*.25); limb(p[6],p[7],ang*.35+off,len*(.68+rnd()*.12),w1*.96,depth-1); } }
    else btips.push([p[6],p[7]]);
  };
  limb(200,326,-1.28,40,6,0); limb(200,306,1.2,44,6.5,0);          // ranting rendah (masa BIBIT BARU)
  limb(200,276,-1.12,54,8,1); limb(200,252,1.08,58,8.5,1);           // cabang samping
  limb(200,236,-.62,72,13,2); limb(200,236,.6,74,13,2); limb(200,238,.02,88,12,2); // cabang utama → tajuk

  /* ── TAJUK: bobot warna berlapis (gelap di belakang → terang di depan), bukan lingkaran tempelan ── */
  const blobs=[[200,112,118,74],[122,148,66,48],[278,148,66,48],[200,64,66,46],[148,92,60,44],[254,92,60,44],[96,168,44,30],[304,168,44,30]];
  let can='<g filter="url(#mtSoft)">';
  blobs.forEach(function(b){ can+='<ellipse cx="'+b[0]+'" cy="'+b[1]+'" rx="'+b[2]+'" ry="'+b[3]+'" fill="#0f3322"/>'; });
  can+='</g><g filter="url(#mtSoft)">';
  blobs.forEach(function(b){ can+='<ellipse cx="'+(b[0]-3)+'" cy="'+(b[1]-4)+'" rx="'+f1(b[2]*.86)+'" ry="'+f1(b[3]*.82)+'" fill="url(#mtCan)"/>'; });
  can+='</g><ellipse cx="170" cy="84" rx="54" ry="24" fill="#d9ffb8" opacity=".13"/><ellipse cx="128" cy="136" rx="30" ry="15" fill="#d9ffb8" opacity=".1"/>';
  const inside=function(x,y){ return blobs.some(function(b){ const dx=(x-b[0])/b[2], dy=(y-b[1])/b[3]; return dx*dx+dy*dy<=.92; }); };
  const PAL=['#1b5f30','#2b8340','#47a24e','#86cf68'];
  let leaves='', n=0, guard=0;
  while(n<190 && guard<3000){ guard++; const x=60+rnd()*280, y=20+rnd()*190; if(!inside(x,y)) continue; n++;
    const light=Math.max(0,Math.min(3.99,((200-x)/240+(110-y)/260+rnd()*.9+.25)*2.2));
    leaves+='<use href="#mtLf" transform="translate('+f1(x)+' '+f1(y)+') rotate('+Math.floor(rnd()*360)+') scale('+f1(1+rnd()*.8)+')" fill="'+PAL[Math.floor(light)]+'"/>'; }
  btips.forEach(function(t){ for(let j=0;j<8;j++){ const a=rnd()*6.283, r=rnd()*16;
    leaves+='<use href="#mtLf" transform="translate('+f1(t[0]+Math.cos(a)*r)+' '+f1(t[1]+Math.sin(a)*r)+') rotate('+Math.floor(rnd()*360)+') scale('+f1(.8+rnd()*.5)+')" fill="'+PAL[1+Math.floor(rnd()*3)]+'"/>'; } });
  let flowers=''; [[128,120],[170,70],[232,66],[276,112],[150,160],[250,160],[200,48],[110,150],[290,150],[185,100],[225,124]].forEach(function(f,k){
    flowers+='<circle cx="'+f[0]+'" cy="'+f[1]+'" r="'+(k%3===0?3.6:2.8)+'" fill="'+(k%2?'#ffc2d9':'#fff3c4')+'"/><circle cx="'+f[0]+'" cy="'+f[1]+'" r="1.1" fill="#e8b04a"/>'; });
  let fruits=''; [[140,132],[260,130],[198,176],[168,104],[238,98],[210,60],[120,100],[285,98]].forEach(function(f){
    fruits+='<circle cx="'+f[0]+'" cy="'+(f[1]+1.2)+'" r="5.6" fill="#000" opacity=".25"/><circle cx="'+f[0]+'" cy="'+f[1]+'" r="5.2" fill="url(#mtFruit)"/><circle cx="'+(f[0]-1.6)+'" cy="'+(f[1]-1.8)+'" r="1.3" fill="#fff" opacity=".7"/>'; });
  /* bunga tiap anak ranting rendah (hasil dini) */
  const crown='<g opacity="'+op(S[7])+'">'+(cur>=5?'<path d="M150 120L90 372H190ZM250 120L310 372H210Z" fill="url(#mtRay)"/>':'')+can+leaves+flowers+fruits+'</g>';

  /* ── rumput di permukaan tanah ── */
  let grass=''; for(let x=8;x<356;x+=13){ if(x>166&&x<236) continue; const y=372+Math.sin(x/37)*2.2, h=7+rnd()*7;
    grass+='<path d="M'+f1(x)+' '+f1(y)+'q-1.5 -'+f1(h*.7)+' -4.5 -'+f1(h)+'M'+f1(x)+' '+f1(y)+'q.5 -'+f1(h*.9)+' 1 -'+f1(h*1.2)+'M'+f1(x)+' '+f1(y)+'q2 -'+f1(h*.6)+' 5 -'+f1(h*.9)+'" stroke="#5f8c40" stroke-width="1.3" stroke-linecap="round" fill="none" opacity=".85"/>'; }

  /* ── BIBIT AWAL & PERTUMBUHAN (kiri): biji + tunas bercabang daun ── */
  const seedG='<g opacity="'+op(S[0])+'"><ellipse cx="58" cy="392" rx="7" ry="9.5" fill="#a97a43"/><ellipse cx="55.5" cy="388" rx="2.2" ry="3.6" fill="#f3d38a" opacity=".6"/><path d="M58 384C57 380 59 376 58 372" stroke="#8fbf6e" stroke-width="1.6" fill="none"/></g>';
  const sproutG='<g opacity="'+op(S[1])+'"><path d="'+taper(bz([58,374,60,356,57,338,58,322],10),4.2,2.2)+'" fill="#7fb858"/>'+
    '<use href="#mtLf" transform="translate(58 346) rotate(-155) scale(1.5)" fill="#47a24e"/><use href="#mtLf" transform="translate(58 340) rotate(-25) scale(1.5)" fill="#6cc15c"/>'+
    '<use href="#mtLf" transform="translate(58 326) rotate(-120) scale(1.15)" fill="#86cf68"/><use href="#mtLf" transform="translate(58 324) rotate(-62) scale(1.15)" fill="#a2e07a"/></g>';

  /* ── jalur perjalanan (urat emas dari akar → batang → tajuk) ── */
  const SEG=['',
    'M58 404L58 326',
    'M58 404C60 444 84 478 112 500',
    'M112 500C150 546 198 564 226 530',
    'M226 530C222 514 219 500 216 486',
    'M216 486C212 470 209 450 206 433',
    'M206 433C203 415 201 400 200 380L200 304',
    'M200 304L200 152'];
  const DST=[0,1,2,3,4,5,6,7];
  let segs=''; for(let i=1;i<8;i++){ segs+='<path class="mt-seg mt-seg-'+S[i]+'" d="'+SEG[i]+'" fill="none" stroke-linecap="round"/>'; }
  const NODES=[ [58,404,11,'01',78,408,SHORT[0]], [58,324,11,'02',78,328,SHORT[1]], [112,500,11,'03',130,504,SHORT[2]],
    [226,530,11,'04',244,534,SHORT[3]], [216,486,8.6,'TA',231,490,'TUGAS AWAL'],
    [200,304,11,'05',217,308,SHORT[4]], [200,152,11,'06',200,26,SHORT[5]+' · DAN SETERUSNYA'] ];
  let nodes='';
  NODES.forEach(function(nd,i){ const s=S[i<5?i:i+1], small=nd[2]<10;   /* S punya 8 indeks (ruas jalur); simpul hanya 7 */
    nodes+=(s==='now'?'<circle class="mt-pulse" cx="'+nd[0]+'" cy="'+nd[1]+'" r="'+(nd[2]+1)+'" fill="none" stroke="#fff3c4" stroke-width="1.5"/>':'')+
     '<circle cx="'+nd[0]+'" cy="'+nd[1]+'" r="'+nd[2]+'" class="mt-node mt-node-'+s+'"/><text x="'+nd[0]+'" y="'+f1(nd[1]+(small?2.6:3.6))+'" text-anchor="middle" class="mt-num mt-num-'+s+'"'+(small?' style="font-size:7px"':'')+'>'+nd[3]+'</text>'+
     '<text x="'+nd[4]+'" y="'+nd[5]+'" text-anchor="'+(i===6?'middle':'start')+'" class="mt-lbl mt-lbl-'+s+'">'+nd[6]+'</text>'; });
  nodes+='<text x="217" y="320" class="mt-lbl mt-lbl-'+S[6]+'" style="font-size:7.5px;letter-spacing:.5px">DAY 1 · '+fmt(MCFA_CORE.projectStart)+'</text>';

  const svg='<svg viewBox="0 0 360 720" class="mt-svg" role="img" aria-label="Pohon kehidupan: enam fase dengan Tugas Awal sebagai jembatan menuju Bibit Baru"><defs>'+
   '<linearGradient id="mtSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040916"/><stop offset=".6" stop-color="#0d2247"/><stop offset="1" stop-color="#2a566f"/></linearGradient>'+
   '<linearGradient id="mtSoil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a1a"/><stop offset=".45" stop-color="#20150c"/><stop offset="1" stop-color="#0b0603"/></linearGradient>'+
   '<linearGradient id="mtBark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c29360"/><stop offset=".38" stop-color="#8a5f36"/><stop offset=".8" stop-color="#4b3019"/><stop offset="1" stop-color="#34200f"/></linearGradient>'+
   '<linearGradient id="mtRoot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5434"/><stop offset=".55" stop-color="#4a3220"/><stop offset="1" stop-color="#2b1b0e"/></linearGradient>'+
   '<radialGradient id="mtCan" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#3d9a4a"/><stop offset=".6" stop-color="#1f6a34"/><stop offset="1" stop-color="#154a26"/></radialGradient>'+
   '<radialGradient id="mtFruit" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffd27a"/><stop offset=".5" stop-color="#e8573a"/><stop offset="1" stop-color="#8d1c1c"/></radialGradient>'+
   '<linearGradient id="mtGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b0"/><stop offset="1" stop-color="#e0a93a"/></linearGradient>'+
   '<radialGradient id="mtGlow"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="mtMoonHalo"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".35"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="mtVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>'+
   '<linearGradient id="mtRay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".2"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></linearGradient>'+
   '<filter id="mtSoft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.6"/></filter>'+
   '<path id="mtLf" d="M0 0C2.5-3.6 8.5-3.8 12 0C8.5 3.8 2.5 3.6 0 0Z"/>'+
   '</defs>'+
   '<rect width="360" height="374" fill="url(#mtSky)"/>'+stars+moon+'<ellipse cx="200" cy="374" rx="190" ry="40" fill="url(#mtGlow)" opacity=".5"/>'+
   soil+
   '<g opacity="'+op(S[2])+'">'+roots+hair+'</g><g opacity="'+op(S[3])+'">'+veins+glow+'</g>'+
   '<ellipse cx="200" cy="374" rx="122" ry="10" fill="#000" opacity=".38"/>'+
   '<g opacity="'+op(S[6])+'">'+branches+trunk+bark+'</g>'+
   crown+
   '<path d="M0 372C50 366 110 376 200 372C270 368 320 376 360 370" stroke="#6b8a4a" stroke-width="1.6" fill="none" opacity=".75"/>'+grass+
   '<rect x="0" y="374" width="360" height="346" fill="url(#mtVig)"/>'+
   seedG+sproutG+segs+nodes+'</svg>';

  /* ── baris timeline: 6 fase + Tugas Awal sebagai jembatan resmi ── */
  const stateTxt=function(s){ return s==='done'?'SELESAI':s==='now'?'SEKARANG':'BERIKUTNYA'; };
  const progBar=function(inf,s){ if(s!=='now') return ''; const pc=Math.round(inf.dayNo/inf.total*100);
    return '<div class="mt-prog"><i style="width:'+pc+'%"></i></div><div class="mt-prog-t">HARI '+inf.dayNo+' / '+inf.total+' · '+pc+'%</div>'; };
  const bridge=function(cls,no,title,sub,a,b,days,tr,note,inf,s){
    return '<div class="mt-row mt-bridge '+cls+' mt-'+s+'"><div class="mt-no mt-no-s">'+no+'</div><div class="mt-info"><b>'+title+'</b><span class="mt-sub">'+sub+'</span>'+
      '<span class="mt-range">'+fmt(a)+' → '+fmt(b)+'</span><span class="mt-age">'+days+' HARI · '+inf.text+'</span><span class="mt-tr">'+tr+'</span><span class="mt-note">'+note+'</span>'+progBar(inf,s)+
      '</div><div class="mt-badge">'+stateTxt(s)+'</div></div>'; };
  let rows='';
  LIFE_PHASES.forEach(function(p,i){
    const s=pst(i);
    const umur=p.ageEnd===null?p.ageStart+' TAHUN DAN SETERUSNYA':(p.ageStart===p.ageEnd?p.ageStart+' TAHUN':p.ageStart+' – '+p.ageEnd+' TAHUN');
    let sess='';
    if(p.key==='penyembuhan'){
      const dayBefore=mcfaAddDays(MCFA_CORE.taskStart,-1);
      sess='<div class="mt-sess"><div class="mt-sess-r mt-sess-'+(cur===3&&ti.state==='next'?'now':'done')+'"><b>PENYEMBUHAN INTI</b><span>'+fmt(p.start)+' → '+fmt(dayBefore)+'</span><em>'+(cur===3&&ti.state==='next'?'BERJALAN':'SELESAI')+'</em></div></div>';
    }
    let prog=''; if(s==='now'&&p.days){ const el=Math.min(p.days,Math.max(0,mcfaDaysBetween(mcfaParse(p.start),today)+1)); const pc=Math.round(el/p.days*100); prog='<div class="mt-prog"><i style="width:'+pc+'%"></i></div><div class="mt-prog-t">'+el.toLocaleString('id-ID')+' / '+p.days.toLocaleString('id-ID')+' HARI · '+pc+'%</div>'; }
    const day1=(p.key==='bibit-baru')?'<span class="mt-note">DAY 1 · M.C.F.A PROJECT &amp; M.C.F.A STUDIO · '+fmt(MCFA_CORE.projectStart)+'</span>':'';
    rows+='<div class="mt-row mt-'+s+'"><div class="mt-no">'+p.no+'</div><div class="mt-info"><b>'+SHORT[i]+'</b><span class="mt-sub">'+p.subtitle+'</span><span class="mt-range">'+fmt(p.start)+' → '+p.endLabel+'</span><span class="mt-age">'+umur+(p.days?' · '+p.days.toLocaleString('id-ID')+' HARI':' · BERKELANJUTAN')+'</span><span class="mt-tr">'+SHORT[i].charAt(0)+SHORT[i].slice(1).toLowerCase()+' → '+TR[i]+'</span>'+day1+sess+prog+'</div><div class="mt-badge">'+stateTxt(s)+'</div></div>';
    if(p.key==='penyembuhan'){
      rows+=bridge('mt-ta','TA','TUGAS AWAL','MEMPERSIAPKAN TEMPAT DAN DIRI',MCFA_CORE.taskStart,MCFA_CORE.taskEnd,MCFA_DERIVED.taskTotalDays,'Tugas awal → mempersiapkan tempat dan diri','PERSIAPAN · PEMBARUAN DIRI · BRANDING AKUN',ti,S[4]);
    }
  });
  const toDay1=mcfaDaysBetween(today,mcfaParse(MCFA_CORE.projectStart));
  const where=(cur===3&&ti.state!=='done'&&S[4]!=='done')||cur===3?MCFA_DERIVED.projectStatus(today):'';
  const head='<div class="mt-head"><div class="mt-kicker">ENAM FASE · SATU JEMBATAN</div><div class="mt-now">SEKARANG — FASE '+LIFE_PHASES[cur].no+' · '+SHORT[cur]+'</div>'+
    (where?'<div class="mt-count" style="color:#f3d38a;font-weight:800">'+where+'</div>':'')+
    (toDay1>0?'<div class="mt-count">'+toDay1.toLocaleString('id-ID')+' HARI menuju DAY 1 M.C.F.A PROJECT · '+fmt(MCFA_CORE.projectStart)+'</div>':'')+'</div>';
  wrap.innerHTML=head+svg+'<div class="mt-rows">'+rows+'</div>';
}
function mcfaRenderPeriods(){
  mcfaBindDates();
}
function mcfaInitHistory(){ mcfaBuildPhaseChapters(); mcfaRenderTree(); mcfaRenderPeriods(); mcfaRenderAge(); mcfaSelfCheck(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mcfaInitHistory); else mcfaInitHistory();

/* ═══ JADWAL OLAHRAGA — SUMBER TUNGGAL (Running / Strength Training + Angkat Beban, Latihan Kaki, Latihan Lengan) ═══
   Index = getDay(): 0 Minggu … 6 Sabtu. Running: Minggu, Selasa, Rabu, Jumat. Strength Training: Senin, Kamis, Sabtu.
   Pembagian harian (sama di Tugas Awal, Program Adaptasi, dan Kegiatan Sehari-hari):
     PAGI  → Angkat Beban  +  Running ATAU Strength Training (sesuai hari)
     SORE  → Latihan Kaki
     MALAM → Latihan Lengan
   Semua bagian aplikasi membaca nama & jadwal dari sini (tidak ada daftar kedua). */
var MCFA_WORKOUT = (function(){
  var SCH=['run','str','run','run','str','run','str'];
  var NM={run:'Running',str:'Strength Training'};
  var HR=['MIN','SEN','SEL','RAB','KAM','JUM','SAB'];
  var HF=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  var FIX={lift:'Angkat Beban', leg:'Latihan Kaki', arm:'Latihan Lengan'};
  var PLAN=[['pagi','lift'],['pagi','main'],['sore','leg'],['malam','arm']];
  var SLOT_LB={pagi:'PAGI',sore:'SORE',malam:'MALAM'};
  function toDate(d){
    if(d instanceof Date) return d;
    d=String(d||'');
    if(d.indexOf('ba_')===0){ var p=d.slice(3).split('_'); return new Date(+p[0],+p[1]-1,+p[2]); }
    return mcfaParse(d);
  }
  function type(d){ return SCH[toDate(d).getDay()]; }
  function name(d){ return NM[type(d)]; }
  /* nama item olahraga: lift / leg / arm tetap; main = Running atau Strength Training menurut hari */
  function item(kind,d){ return kind==='main' ? name(d) : (FIX[kind]||''); }
  function plan(d){ return PLAN.map(function(p){ return {slot:p[0],kind:p[1],label:item(p[1],d)}; }); }
  /* Nama Running / Strength Training HANYA muncul pada satu item per hari (data-wk="main" / kind 'main').
     Tugas pendukung (Pemanasan, Pendinginan & Stretching) memakai teks dasarnya, supaya nama olahraga tidak tercatat dua kali. */
  function relabel(base,d,slot){ return base; }
  function bar(d){
    var dt=toDate(d), cur=dt.getDay(), t=type(dt), h='<div class="wk-bar" role="group" aria-label="Jadwal olahraga"><div class="wk-today"><span>OLAHRAGA HARI INI</span><b class="'+t+'">'+NM[t]+'</b></div><div class="wk-week">';
    for(var i=0;i<7;i++) h+='<span class="wk-d '+SCH[i]+(i===cur?' on':'')+'" title="'+HF[i]+' — '+NM[SCH[i]]+'"><small>'+HR[i]+'</small><i>'+(SCH[i]==='run'?'RUN':'STR')+'</i></span>';
    h+='</div><div class="wk-plan">';
    plan(dt).forEach(function(x){ h+='<span class="wk-p '+x.slot+'"><small>'+SLOT_LB[x.slot]+'</small><b>'+x.label+'</b></span>'; });
    return h+'</div></div>';
  }
  return {schedule:SCH, names:NM, fixed:FIX, plan:plan, item:item, type:type, name:name, relabel:relabel, bar:bar};
})();
window.MCFA_WORKOUT = MCFA_WORKOUT;

window.MCFA_CORE = MCFA_CORE; window.LIFE_PHASES = LIFE_PHASES; window.MCFA_DERIVED = MCFA_DERIVED;
