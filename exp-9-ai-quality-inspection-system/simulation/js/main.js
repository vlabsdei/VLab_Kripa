/* ================================================================
   main.js — AI Quality Inspection System Gaming Console
   Experiment 9 | SmartFactory 4.0
   ================================================================ */
'use strict';

// ── Sector Database ─────────────────────────────────────────────
const SECTORS = {
  auto: {
    name: 'Automotive Parts Assembly',
    bg: '#0f172a',
    products: ['Metal Bracket', 'Steel Shaft', 'Gear Assembly'],
    previewColor: '#94a3b8',
    edgeColor: '#22c55e',
    ambientColor: '#1e293b'
  },
  food: {
    name: 'Food & Beverage Packaging',
    bg: '#14532d',
    products: ['Plastic Bottle', 'Cardboard Carton', 'Confectionary Tray'],
    previewColor: '#10b981',
    edgeColor: '#a855f7',
    ambientColor: '#064e3b'
  },
  silicon: {
    name: 'Silicon Cleanroom Lab',
    bg: '#1e3a8a',
    products: ['Microprocessor Wafer', 'Printed Circuit Board', 'Capacitor Array'],
    previewColor: '#3b82f6',
    edgeColor: '#f43f5e',
    ambientColor: '#172554'
  }
};

const DEFECT_TYPES = ['Surface Scratch','Crack','Dent','Missing Component','Dimensional Error','Color Variation'];
const DONUT_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7'];

const SPARK_CFG = {
  'sp-acc' :{color:'#2563eb',key:'acc' },
  'sp-conf':{color:'#0d9488',key:'conf'},
  'sp-dpct':{color:'#dc2626',key:'dpct'},
  'sp-pass':{color:'#16a34a',key:'pass'},
  'sp-rej' :{color:'#dc2626',key:'rej' },
  'sp-tput':{color:'#b45309',key:'tput'},
};

// ── State ──────────────────────────────────────────────────────
let S = fresh();

function fresh() {
  return {
    running:false, autoMode:false,
    totalInspected:0, totalPassed:0, totalRejected:0,
    history:[], defectCounts:{}, confBins:[0,0,0,0,0],
    spark:{ acc:[], conf:[], dpct:[], pass:[], rej:[], tput:[] },
    nextId:28491, inspTimeout:null, animRaf:null,
    convOff:0, scanX:0, scanDir:1, currentProduct:null,
    
    // Configurable parameters
    sector: 'auto',
    cvEdgeMode: false,
    params: {
      threshold: 0.50,
      speed: 60,
      lighting: 85,
      // Diagnostics
      focus: 95,
      exposure: 50,
      contrast: 60,
      zoom: 100
    },
    
    // Custom Object template configuration
    productCfg: {
      type: 'Metal Bracket',
      size: 25,
      surface: 'clean',
      hasDefect: false,
      defectType: 'Surface Scratch',
      defectSize: 0.75,
      defectX: null,
      defectY: null
    }
  };
}

const CV={}, CTX={};

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', ()=>{
  grabCanvases();
  initControls();
  initSectorSelectors();
  initProductCreator();
  initClock();
  drawScene();
  drawConfGauge(0,false);
  drawProductPreview(null);
  drawDonut();
  drawBar();
  drawAllSparks();
});

function grabCanvases(){
  ['cv-main','cv-prod','cv-gauge','cv-donut','cv-bar','cv-creator',
   'sp-acc','sp-conf','sp-dpct','sp-pass','sp-rej','sp-tput'
  ].forEach(id=>{
    const el=document.getElementById(id);
    if(el){CV[id]=el;CTX[id]=el.getContext('2d');}
  });
}

// ── Clock ──
function initClock(){ tickClock(); setInterval(tickClock,1000); }
function tickClock(){
  const n=new Date(), p=v=>String(v).padStart(2,'0');
  const H=n.getHours(), ap=H>=12?'PM':'AM', h12=H%12||12;
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  set('hdr-time',`${p(h12)}:${p(n.getMinutes())}:${p(n.getSeconds())} ${ap}`);
  set('hdr-date',`${DAYS[n.getDay()]}, ${n.getDate()} ${MONTHS[n.getMonth()]} ${n.getFullYear()}`);
}
function nowStr(){
  const n=new Date(), p=v=>String(v).padStart(2,'0');
  const H=n.getHours(), ap=H>=12?'PM':'AM', h12=H%12||12;
  return `${p(h12)}:${p(n.getMinutes())}:${p(n.getSeconds())} ${ap}`;
}

// ================================================================
// CONTROLS & DIAGNOSTICS
// ================================================================
function initControls(){
  // Main settings sliders
  const sliders=[
    ['sl-thresh','num-thresh','threshold',2,2],
    ['sl-spd',   'num-spd',  'speed',   0,0],
    ['sl-light', 'num-light','lighting', 0,0],
  ];
  sliders.forEach(([sId,nId,key,sDec,nDec])=>{
    const sl=el(sId), ni=el(nId);
    if(!sl||!ni) return;
    const sync=src=>{
      let v=parseFloat(src==='sl'?sl.value:ni.value);
      if(isNaN(v)) return;
      v=clamp(v,parseFloat(sl.min),parseFloat(sl.max));
      S.params[key]=v;
      sl.value=v; ni.value=v.toFixed(nDec);
      paintSlider(sl);
    };
    sl.addEventListener('input',  ()=>sync('sl'));
    ni.addEventListener('change', ()=>sync('num'));
    paintSlider(sl);
  });

  // Diagnostics sliders
  const diagSliders=[
    ['sl-focus',    'badge-focus',    'focus',    '%'],
    ['sl-exposure', 'badge-exposure', 'exposure', '%'],
    ['sl-contrast', 'badge-contrast', 'contrast', '%'],
  ];
  diagSliders.forEach(([sId, bId, key, unit]) => {
    const sl=el(sId), bd=el(bId);
    if(!sl||!bd) return;
    sl.addEventListener('input', e=>{
      const val=parseInt(e.target.value);
      S.params[key]=val;
      bd.textContent=`${val}${unit}`;
      paintSlider(sl);
      drawScene();
    });
    paintSlider(sl);
  });

  // Zoom
  el('sl-zoom').addEventListener('input', e => {
    const val = parseInt(e.target.value);
    S.params.zoom = val;
    set('badge-zoom', `${(val/100).toFixed(1)}x`);
    paintSlider(e.target);
    drawScene();
  });
  paintSlider(el('sl-zoom'));

  // CV Mode overlay toggle
  el('btn-cv-mode').addEventListener('click', e => {
    S.cvEdgeMode = !S.cvEdgeMode;
    e.target.textContent = S.cvEdgeMode ? '⚡ CV EDGE SCANNER: ON' : '⚡ CV EDGE SCANNER: OFF';
    e.target.className = S.cvEdgeMode ? 'cv-overlay-btn active' : 'cv-overlay-btn';
    drawScene();
  });

  el('btn-inspect').addEventListener('click', inspectManual);
  el('btn-auto').addEventListener('click', toggleAuto);
  el('btn-reset').addEventListener('click', resetAll);
  el('btn-fs').addEventListener('click',()=>{
    if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen();
  });
}

function paintSlider(sl){
  const mn=parseFloat(sl.min), mx=parseFloat(sl.max), v=parseFloat(sl.value);
  const pct=((v-mn)/(mx-mn))*100;
  sl.style.background=`linear-gradient(to right,#2563eb 0%,#2563eb ${pct}%,#e2e8f0 ${pct}%)`;
}

// ================================================================
// FACTORY SECTOR SWITCH
// ================================================================
function initSectorSelectors() {
  document.querySelectorAll('.sector-tab').forEach(btn => {
    btn.addEventListener('click', e => {
      const targetSector = e.currentTarget.getAttribute('data-sector');
      switchSector(targetSector);
      
      // Update UI active states
      document.querySelectorAll('.sector-tab').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  // Load default options
  switchSector('auto');
}

function switchSector(secName) {
  S.sector = secName;
  const cfg = SECTORS[secName];

  // Repopulate geometry select box
  const select = el('sel-type');
  select.innerHTML = '';
  cfg.products.forEach(p => {
    const opt = document.createElement('option');
    opt.textContent = p;
    select.appendChild(opt);
  });

  S.productCfg.type = cfg.products[0];
  
  // Re-draw Creator object template
  drawCreatorCanvas();
  drawScene();
}

// ================================================================
// INTERACTIVE OBJECT CREATOR
// ================================================================
function initProductCreator() {
  const canvas = CV['cv-creator'];
  if (!canvas) return;

  // Geometry selector
  el('sel-type').addEventListener('change', e => {
    S.productCfg.type = e.target.value;
    drawCreatorCanvas();
  });

  // Size slider
  el('sl-psize').addEventListener('input', e => {
    S.productCfg.size = parseInt(e.target.value);
    set('badge-psize', `${S.productCfg.size} cm`);
    paintSlider(e.target);
    drawCreatorCanvas();
  });
  paintSlider(el('sl-psize'));

  // Surface selector
  el('sel-surface').addEventListener('change', e => {
    S.productCfg.surface = e.target.value;
    drawCreatorCanvas();
  });

  // Defect Tool Selector
  el('sel-dtype').addEventListener('change', e => {
    S.productCfg.defectType = e.target.value;
    drawCreatorCanvas();
  });

  // Defect Size Slider
  el('sl-dsize').addEventListener('input', e => {
    S.productCfg.defectSize = parseFloat(e.target.value);
    set('badge-dsize', `${S.productCfg.defectSize.toFixed(2)} mm`);
    paintSlider(e.target);
    drawCreatorCanvas();
  });
  paintSlider(el('sl-dsize'));

  // Mouse & Touch stamping defects
  function stampDefect(clientX, clientY) {
    if (S.running) return; // Prevent stamping during scanning
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const margin = 18;
    const w = canvas.width - margin*2;
    const h = canvas.height - margin*2;

    if (x >= margin && x <= margin + w && y >= margin && y <= margin + h) {
      S.productCfg.hasDefect = true;
      S.productCfg.defectX = x;
      S.productCfg.defectY = y;
      drawCreatorCanvas();
    }
  }

  canvas.addEventListener('mousedown', e => {
    stampDefect(e.clientX, e.clientY);
  });

  canvas.addEventListener('touchstart', e => {
    if (e.touches && e.touches[0]) {
      e.preventDefault(); // Prevent double triggers and scrolling while stamping
      stampDefect(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  el('btn-clear-defect').addEventListener('click', () => {
    S.productCfg.hasDefect = false;
    S.productCfg.defectX = null;
    S.productCfg.defectY = null;
    drawCreatorCanvas();
  });

  drawCreatorCanvas();
}

function drawCreatorCanvas() {
  const cv = CV['cv-creator']; if (!cv) return;
  const ctx = CTX['cv-creator'];
  const W = cv.width, H = cv.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,W,H);

  // Layout grids
  ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
  for (let x=0; x<W; x+=14) ln(ctx, x, 0, x, H);
  for (let y=0; y<H; y+=14) ln(ctx, 0, y, W, y);

  const margin = 18, w = W - margin*2, h = H - margin*2;
  const finish = S.productCfg.surface;

  // Ambient shading according to sector
  let objectColor = '#cbd5e1';
  let borderStroke = '#94a3b8';
  if (S.sector === 'food') { objectColor = '#a7f3d0'; borderStroke = '#059669'; }
  else if (S.sector === 'silicon') { objectColor = '#bfdbfe'; borderStroke = '#2563eb'; }

  const baseGrad = ctx.createLinearGradient(margin, margin, W - margin, H - margin);
  if (finish === 'clean') {
    baseGrad.addColorStop(0, '#ffffff'); baseGrad.addColorStop(1, objectColor);
  } else if (finish === 'dirty') {
    baseGrad.addColorStop(0, '#e2e8f0'); baseGrad.addColorStop(0.5, '#ca8a0420'); baseGrad.addColorStop(1, '#64748b');
  } else { // damaged
    baseGrad.addColorStop(0, '#fee2e2'); baseGrad.addColorStop(1, '#94a3b8');
  }

  // Draw object body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
  ctx.fillStyle = baseGrad;
  rr(ctx, margin, margin, w, h, 6); ctx.fill();
  ctx.strokeStyle = borderStroke; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.restore();

  // Pattern Details based on product geometry selection
  const pType = S.productCfg.type;
  ctx.strokeStyle = 'rgba(148,163,184,0.35)'; ctx.lineWidth = 1;

  if (pType === 'Metal Bracket') {
    [margin+12, W-margin-12].forEach(cx => {
      [margin+12, H-margin-12].forEach(cy => {
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2); ctx.fillStyle = '#f8fafc'; ctx.fill(); ctx.stroke();
      });
    });
    ctx.fillStyle = 'rgba(148,163,184,0.15)'; rr(ctx, W/2-18, H/2-8, 36, 16, 2); ctx.fill(); ctx.stroke();
  } else if (pType === 'Printed Circuit Board' || pType === 'Circuit Board') {
    ctx.strokeStyle = 'rgba(16,185,129,0.3)'; ctx.lineWidth = 1.5;
    ln(ctx, margin+20, margin+20, W-margin-20, margin+20);
    ln(ctx, margin+20, H-margin-20, W-margin-20, H-margin-20);
    ctx.fillStyle = '#334155'; rr(ctx, W/2-12, H/2-12, 24, 24, 2); ctx.fill();
  } else if (pType === 'Plastic Bottle' || pType === 'Plastic Housing') {
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; rr(ctx, margin+10, H/2-15, w-20, 30, 8); ctx.fill(); ctx.stroke();
  } else if (pType === 'Steel Shaft') {
    ctx.fillStyle = 'rgba(100,116,139,0.15)'; ctx.fillRect(margin, H/2-8, w, 16);
    ln(ctx, margin, H/2-8, W-margin, H/2-8); ln(ctx, margin, H/2+8, W-margin, H/2+8);
  } else {
    // Grid or fallback
    ctx.strokeRect(margin+12, margin+12, w-24, h-24);
  }

  // Draw defect stamp
  if (S.productCfg.hasDefect && S.productCfg.defectX !== null) {
    const dx = S.productCfg.defectX, dy = S.productCfg.defectY;
    const ds = Math.max(3, S.productCfg.defectSize * 8);

    ctx.save();
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2.2;

    if (S.productCfg.defectType === 'Surface Scratch') {
      ln(ctx, dx - ds, dy - ds/3, dx + ds, dy + ds/3);
    } else if (S.productCfg.defectType === 'Crack') {
      ctx.beginPath(); ctx.moveTo(dx - ds, dy); ctx.lineTo(dx - ds/3, dy - ds/2);
      ctx.lineTo(dx + ds/3, dy + ds/3); ctx.lineTo(dx + ds, dy - ds/4); ctx.stroke();
    } else if (S.productCfg.defectType === 'Dent') {
      ctx.beginPath(); ctx.arc(dx, dy, ds/2, 0, Math.PI*2); ctx.fillStyle = 'rgba(220,38,38,0.25)'; ctx.fill(); ctx.stroke();
    } else if (S.productCfg.defectType === 'Missing Component') {
      ctx.fillStyle = '#fee2e2'; ctx.fillRect(dx - ds/2, dy - ds/2, ds, ds); ctx.strokeRect(dx - ds/2, dy - ds/2, ds, ds);
    } else if (S.productCfg.defectType === 'Dimensional Error') {
      ctx.setLineDash([2, 2]); ctx.strokeRect(dx - ds, dy - ds, ds*2, ds*2);
    } else { // Color Variation
      ctx.beginPath(); ctx.arc(dx, dy, ds, 0, Math.PI*2); ctx.fillStyle = '#ea580c40'; ctx.fill();
      ctx.strokeStyle = '#ea580c'; ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = '#dc2626'; ctx.font = 'bold 8px Inter';
    ctx.fillText('STAMPED', dx + 6, dy - 5);
  }
}

// ================================================================
// SORT ENGINE - MANUAL/AUTO OPERATIONS
// ================================================================

function inspectManual(){
  if(S.running) return;
  S.running=true;
  setStatus('st-conv','running','RUNNING');
  setBadge('running','Inspecting…');
  el('btn-inspect').disabled=true;

  const cfg=S.productCfg;
  let stampedLoc = 'Center';
  if (cfg.hasDefect && cfg.defectX !== null) {
    const W = CV['cv-creator'].width;
    const H = CV['cv-creator'].height;
    const rx = cfg.defectX / W, ry = cfg.defectY / H;
    let hor = rx < 0.35 ? 'Left' : (rx > 0.65 ? 'Right' : 'Center');
    let ver = ry < 0.35 ? 'Top' : (ry > 0.65 ? 'Bottom' : 'Middle');
    stampedLoc = hor === ver ? hor : `${ver} ${hor}`;
  }

  const product={
    id:`P-${++S.nextId}`,
    type:cfg.type,
    size:cfg.size,
    surface:cfg.surface,
    hasDefect:cfg.hasDefect,
    defectType:cfg.hasDefect?cfg.defectType:'–',
    defectSize:cfg.hasDefect?cfg.defectSize:0,
    defectLoc: cfg.hasDefect?stampedLoc:'–',
    defectX: cfg.defectX,
    defectY: cfg.defectY,
    time:nowStr(),
    manual:true
  };

  const result=computeAIDecision(product, S.params);
  product.confidence=result.confidence;
  product.decision=result.decision;
  product.aiDetected=result.aiDetected;
  product.reasoning=result.reasoning;
  product.pills=result.pills;

  S.currentProduct=product;
  startConveyorAnim();

  animateWorkflow(()=>{
    applyResult(product);
    S.running=false;
    setStatus('st-conv','idle','IDLE');
    setBadge('idle','Idle');
    el('btn-inspect').disabled=false;
    stopConveyorAnim();
  });
}

function toggleAuto(){
  if(S.autoMode){
    S.autoMode=false;
    S.running=false;
    clearTimeout(S.inspTimeout);
    stopConveyorAnim();
    el('btn-auto').innerHTML='&#9654; START AUTO-SORT PIPELINE';
    el('btn-auto').classList.remove('active');
    el('btn-inspect').disabled=false;
    setStatus('st-conv','idle','IDLE');
    setBadge('idle','Idle');
  } else {
    S.autoMode=true;
    S.running=true;
    el('btn-auto').innerHTML='&#9632; STOP PIPELINE';
    el('btn-auto').classList.add('active');
    el('btn-inspect').disabled=true;
    setStatus('st-conv','running','RUNNING');
    setBadge('running','Auto Running');
    startConveyorAnim();
    autoLoop();
  }
}

function autoLoop(){
  if(!S.autoMode) return;
  const product=generateRandom();
  S.currentProduct=product;
  animateWorkflow(()=>{
    applyResult(product);
    if(S.autoMode){
      const ms=(60/S.params.speed)*1000;
      S.inspTimeout=setTimeout(autoLoop, Math.max(400, ms));
    }
  });
}

function generateRandom(){
  const sectorCfg = SECTORS[S.sector];
  const type = rand(sectorCfg.products);
  const size = rng(10, 90);
  const surface = rand(['clean','clean','clean','dirty','damaged']);
  const hasDefect = Math.random() < 0.22;
  const defectType = hasDefect ? rand(DEFECT_TYPES) : '–';
  const defectSize = hasDefect ? parseFloat(rng(0.1, 2.5).toFixed(2)) : 0;

  let defectX=null, defectY=null;
  if(hasDefect){
    defectX = rng(25, 170);
    defectY = rng(25, 110);
  }

  const product={
    id:`P-${++S.nextId}`,type,size,surface,
    hasDefect,defectType,defectSize,
    defectLoc:hasDefect?rand(['Top Center','Left Edge','Right Edge','Corner']):'–',
    defectX, defectY,
    time:nowStr(),manual:false
  };
  const result=computeAIDecision(product, S.params);
  product.confidence=result.confidence;
  product.decision=result.decision;
  product.aiDetected=result.aiDetected;
  product.reasoning=result.reasoning;
  product.pills=result.pills;
  return product;
}

// ================================================================
// AI DECISION ENGINE
// ================================================================
function computeAIDecision(product, params){
  // Diagnostics factors
  const focusF    = params.focus / 100;
  const exposureF = 1 - Math.abs(params.exposure - 50) / 50 * 0.4;
  const contrastF = 0.8 + (params.contrast / 100) * 0.2;
  const lightF    = params.lighting / 100;
  const speedF    = 1 - ((params.speed - 10) / 110) * 0.25;
  const surfaceF  = { clean:1.0, dirty:0.80, damaged:0.65 }[product.surface] ?? 1.0;

  // base AI confidence calculation
  const rawConf = focusF * exposureF * contrastF * lightF * speedF * surfaceF * 100;
  const confidence = parseFloat(clamp(rawConf, 30, 99.9).toFixed(1));

  const pills=[];
  let decision, aiDetected=false, reasoning='', titleText='', bannerClass='';

  // Deterministic Optimal threshold
  const diagOptimal = (params.focus >= 80) && (params.exposure >= 40 && params.exposure <= 65) && (params.contrast >= 50);
  const flowOptimal = (params.lighting >= 75) && (params.speed <= 85) && (product.surface === 'clean');
  const isOptimal = diagOptimal && flowOptimal;

  if(!product.hasDefect){
    // Good product — check for False Positive due to bad settings
    const isFP = !isOptimal && (params.focus < 60 || params.exposure < 30 || params.exposure > 75 || params.lighting < 60);
    decision = isFP ? 'REJECT' : 'PASS';
    aiDetected = false;

    if(isFP){
      titleText = '⚠ False Positive — Good product incorrectly rejected';
      reasoning = `The product has NO defect, but the AI incorrectly flagged it as defective. `+
                  `This false positive was caused by poor camera focus (${params.focus}%), exposure misalignment, or noise on the surface.`;
      bannerClass='warn-bg';
      pills.push({text:'No real defect',cls:'ok'});
      pills.push({text:'False Positive ⚠',cls:'bad'});
    } else {
      titleText = '✓ Correct — Good product accepted (PASS)';
      reasoning = `The product has NO defect. The AI correctly analyzed the surface texture and passed it.`;
      bannerClass='pass-bg';
      pills.push({text:'Correct PASS',cls:'ok'});
      pills.push({text:`Conf. ${confidence}%`,cls:'info'});
    }
  } else {
    // Defective product — AI detects it if diagnostics are correct
    aiDetected = isOptimal || (params.focus >= 70 && params.exposure >= 35 && params.exposure <= 75 && params.lighting >= 65);

    if(!aiDetected){
      // False Negative — defect missed
      decision = 'PASS';
      titleText = '✗ False Negative — Defect MISSED by AI';
      reasoning = `The product has a ${product.defectType} (${product.defectSize} mm) but the AI FAILED to detect it. `+
                  `Reasons: ${getDiagnosticFailReasons(params, product.surface)}.`;
      bannerClass='reject-bg';
      pills.push({text:`${product.defectType}`,cls:'bad'});
      pills.push({text:'AI missed it',cls:'bad'});
      pills.push({text:'False Negative ⚠',cls:'warn'});
    } else {
      // Defect detected — compare to threshold
      if(product.defectSize <= params.threshold){
        decision = 'PASS';
        titleText = '✓ Defect detected but BELOW threshold — PASS';
        reasoning = `AI detected a ${product.defectType} at ${product.defectSize} mm. `+
                    `This is within the acceptable limit (threshold = ${params.threshold} mm) → PASS.`;
        bannerClass='pass-bg';
        pills.push({text:`${product.defectType}`,cls:'info'});
        pills.push({text:`${product.defectSize} mm`,cls:'info'});
        pills.push({text:'Below limit',cls:'ok'});
      } else {
        decision = 'REJECT';
        const excess = (product.defectSize - params.threshold).toFixed(2);
        titleText = '✗ Defect EXCEEDS threshold — REJECT';
        reasoning = `AI detected a ${product.defectType} at ${product.defectSize} mm. `+
                    `This exceeds the threshold of ${params.threshold} mm by ${excess} mm → Product REJECTED.`;
        bannerClass='reject-bg';
        pills.push({text:`${product.defectType}`,cls:'bad'});
        pills.push({text:`${product.defectSize} mm`,cls:'bad'});
        pills.push({text:`+${excess} mm over limit`,cls:'bad'});
      }
    }
  }

  pills.push({text:`Zoom ${params.zoom/100}x`,cls:'purple'});
  pills.push({text:`Focus ${params.focus}%`,cls:'purple'});

  return { confidence, decision, aiDetected, reasoning, pills, titleText, bannerClass };
}

function getDiagnosticFailReasons(params, surface){
  const causes=[];
  if(params.focus < 75) causes.push(`blurry optics focus (${params.focus}%)`);
  if(params.exposure < 35 || params.exposure > 75) causes.push(`unbalanced sensor exposure (${params.exposure}%)`);
  if(params.lighting < 65) causes.push(`insufficient backlight (${params.lighting}%)`);
  if(params.speed > 90) causes.push(`high line feed speed (${params.speed}/min)`);
  if(surface === 'dirty') causes.push('greasy surface smudges');
  if(surface === 'damaged') causes.push('extreme surface scuffs');
  return causes.length > 0 ? causes.join(', ') : 'poor diagnostic calibration';
}

// ================================================================
// APPLY RESULTS & STATISTICS
// ================================================================
function applyResult(product){
  S.totalInspected++;
  if(product.decision==='PASS') S.totalPassed++;
  else S.totalRejected++;

  if(product.hasDefect && product.aiDetected){
    S.defectCounts[product.defectType]=(S.defectCounts[product.defectType]||0)+1;
  }

  const bin=Math.min(4,Math.floor(product.confidence/20));
  S.confBins[bin]++;

  updateResultStrip(product);
  showReasoning(product);
  addHistory(product);
  pushSpark(product);

  updateMetrics();
  drawDonut();
  drawBar();
  drawConfGauge(product.confidence, true);
  drawProductPreview(product);
  updateFooter();

  const pct=Math.min(100,(S.totalInspected/50)*100);
  el('prog-fill').style.width=`${pct}%`;
  set('prog-pct',`${Math.round(pct)}%`);
}

function updateResultStrip(p){
  set('r-id',   p.id);
  set('r-type', p.type);
  set('r-time', p.time);
  set('r-defect', p.hasDefect ? p.defectType : '–');
  set('r-dsize',  p.hasDefect ? `${p.defectSize} mm` : '– mm');
  set('r-loc',    p.hasDefect ? p.defectLoc : '–');
  set('conf-num', `${p.confidence}%`);
  set('prod-img-label', p.type);

  const badge=el('dec-badge');
  badge.textContent=p.decision;
  badge.className=`dec-badge ${p.decision==='PASS'?'pass':'reject'} anim-in`;
}

function showReasoning(p){
  const banner=el('reasoning-banner');
  banner.className=`reasoning-banner ${p.bannerClass||''} anim-in`;

  const icon = p.bannerClass==='pass-bg'  ? '✅' :
               p.bannerClass==='reject-bg' ? '❌' : '⚠️';
  el('rb-icon').textContent=icon;
  el('rb-title').textContent=p.titleText||'Inspection Complete';

  const pillsHtml=p.pills
    .map(pl=>`<span class="pill ${pl.cls}">${pl.text}</span>`)
    .join('');

  const detailEl=el('rb-detail');
  detailEl.innerHTML=`${p.reasoning}<div class="rb-pills" style="margin-top:5px">${pillsHtml}</div>`;
}

function addHistory(p){
  const tbody=el('hist-body');
  const empty=tbody.querySelector('.hist-empty');
  if(empty) empty.parentElement.remove();

  const tr=document.createElement('tr');
  tr.className='anim-in';
  tr.innerHTML=`
    <td class="mono">${p.id}</td>
    <td>${p.type.split(' ')[0]}</td>
    <td>${p.hasDefect?p.defectType:'–'}</td>
    <td class="mono">${p.hasDefect?p.defectSize:'–'}</td>
    <td class="mono">${p.confidence}</td>
    <td class="${p.decision==='PASS'?'pass-td':'reject-td'}">${p.decision}</td>`;
  tbody.insertBefore(tr,tbody.firstChild);
  while(tbody.rows.length>20) tbody.deleteRow(tbody.rows.length-1);

  S.history.unshift(p);
  if(S.history.length>20) S.history.pop();
}

function pushSpark(p){
  const acc  = S.totalInspected>0?(S.totalPassed/S.totalInspected)*100:0;
  const totD = Object.values(S.defectCounts).reduce((a,b)=>a+b,0);
  const dpct = S.totalInspected>0?(totD/S.totalInspected)*100:0;
  const avg  = S.history.length>0?S.history.reduce((a,h)=>a+h.confidence,0)/S.history.length:0;

  push('acc',  acc);
  push('conf', avg);
  push('dpct', dpct);
  push('pass', S.totalPassed);
  push('rej',  S.totalRejected);
  push('tput', S.params.speed);

  Object.keys(SPARK_CFG).forEach(id=>drawSparkline(id));
}
function push(key,val){ S.spark[key].push(val); if(S.spark[key].length>20)S.spark[key].shift(); }

function updateMetrics(){
  const acc  = S.totalInspected>0?(S.totalPassed/S.totalInspected)*100:0;
  const totD = Object.values(S.defectCounts).reduce((a,b)=>a+b,0);
  const dpct = S.totalInspected>0?(totD/S.totalInspected)*100:0;
  const avg  = S.history.length>0?S.history.reduce((a,h)=>a+h.confidence,0)/S.history.length:0;

  set('m-acc',  `${acc.toFixed(2)} %`);
  set('m-conf', `${avg.toFixed(2)} %`);
  set('m-dpct', `${dpct.toFixed(2)} %`);
  set('m-pass', S.totalPassed);
  set('m-rej',  S.totalRejected);
  set('m-tput', S.params.speed);
  set('dc-val', totD);
}

function updateFooter(){
  set('ft-total', S.totalInspected);
  set('ft-pass',  S.totalPassed);
  set('ft-rej',   S.totalRejected);
}

// ================================================================
// RESET
// ================================================================
function resetAll(){
  clearTimeout(S.inspTimeout);
  stopConveyorAnim();
  const currentSec = S.sector;
  S=fresh();
  
  el('btn-auto').innerHTML='&#9654; START AUTO-SORT PIPELINE';
  el('btn-auto').classList.remove('active');
  el('btn-inspect').disabled=false;
  setStatus('st-conv','idle','IDLE');
  setBadge('idle','Idle');

  set('r-id','–'); set('r-type','–'); set('r-time','–');
  set('r-defect','–'); set('r-dsize','– mm'); set('r-loc','–');
  set('conf-num','–'); set('prod-img-label','–');

  const badge=el('dec-badge');
  badge.textContent='–'; badge.className='dec-badge';

  el('reasoning-banner').className='reasoning-banner';
  el('rb-icon').textContent='🤖';
  el('rb-title').textContent='Awaiting Object Insertion';
  el('rb-detail').textContent='Select a sector, stamp a defect, adjust camera diagnostics on the right, and insert the object!';

  el('hist-body').innerHTML='<tr><td colspan="6" class="hist-empty">No objects inspected yet</td></tr>';
  el('prog-fill').style.width='0%';
  set('prog-pct','0%');

  // Reset sliders
  set('badge-psize', '25 cm');
  set('badge-dsize', '0.75 mm');
  set('badge-focus', '95%');
  set('badge-exposure', '50%');
  set('badge-contrast', '60%');
  set('badge-zoom', '1.0x');

  el('sl-psize').value = 25; paintSlider(el('sl-psize'));
  el('sl-dsize').value = 0.75; paintSlider(el('sl-dsize'));
  el('sl-focus').value = 95; paintSlider(el('sl-focus'));
  el('sl-exposure').value = 50; paintSlider(el('sl-exposure'));
  el('sl-contrast').value = 60; paintSlider(el('sl-contrast'));
  el('sl-zoom').value = 100; paintSlider(el('sl-zoom'));

  el('sel-surface').value = 'clean';
  el('sel-dtype').value = 'Surface Scratch';

  // Computer vision edge toggle reset
  S.cvEdgeMode = false;
  el('btn-cv-mode').textContent = '⚡ CV EDGE SCANNER: OFF';
  el('btn-cv-mode').className = 'cv-overlay-btn';

  resetWorkflow();
  switchSector(currentSec);
  drawConfGauge(0,false);
  drawProductPreview(null);
  drawDonut(); drawBar(); drawAllSparks();

  ['m-acc','m-conf','m-dpct'].forEach(id=>set(id,'0.00 %'));
  set('m-pass','0'); set('m-rej','0'); set('m-tput','0'); set('dc-val','0');
  set('ft-total','0'); set('ft-pass','0'); set('ft-rej','0');
}

// ================================================================
// PIPELINE WORKFLOW ANIMATION
// ================================================================
function animateWorkflow(done){
  resetWorkflow();
  let step=0;
  const spd=Math.max(60, Math.round(400/(S.params.speed/15)));

  function next(){
    if(step>0){
      const pv=document.querySelector(`.wf-step[data-s="${step}"]`);
      const pc=el(`wf${step}`);
      if(pv) pv.className='wf-step done';
      if(pc) pc.textContent='✓';
    }
    step++;
    if(step>7){ done&&done(); return; }
    const cv=document.querySelector(`.wf-step[data-s="${step}"]`);
    const cc=el(`wf${step}`);
    if(cv) cv.className='wf-step active';
    if(cc) cc.textContent='●';
    setTimeout(next, spd);
  }
  next();
}
function resetWorkflow(){
  for(let i=1;i<=7;i++){
    const s=document.querySelector(`.wf-step[data-s="${i}"]`);
    const c=el(`wf${i}`);
    if(s) s.className='wf-step';
    if(c) c.textContent='○';
  }
}

// ================================================================
// LIVE CANVAS ANIMATIONS & COMPUTER VISION EFFECTS
// ================================================================
function startConveyorAnim(){
  if(S.animRaf) cancelAnimationFrame(S.animRaf);
  function frame(){
    if(!S.running&&!S.autoMode){ drawScene(); return; }
    S.convOff=(S.convOff+1.8)%40;
    S.scanX+=S.scanDir*2.5;
    if(S.scanX>70)S.scanDir=-1;
    if(S.scanX<0) S.scanDir=1;
    drawScene();
    S.animRaf=requestAnimationFrame(frame);
  }
  S.animRaf=requestAnimationFrame(frame);
}
function stopConveyorAnim(){
  if(S.animRaf){ cancelAnimationFrame(S.animRaf); S.animRaf=null; }
  drawScene();
}

function drawScene(){
  const cv=CV['cv-main']; if(!cv) return;
  cv.width=cv.clientWidth||600; cv.height=cv.clientHeight||195;
  const ctx=CTX['cv-main'];
  const W=cv.width, H=cv.height;

  // Background
  const currentSec = SECTORS[S.sector];
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0, '#0f172a'); bg.addColorStop(1, currentSec.bg);
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // Diagnostic Blur Effect
  if (S.params.focus < 85) {
    ctx.filter = `blur(${Math.max(0, (85 - S.params.focus)/8)}px)`;
  } else {
    ctx.filter = 'none';
  }

  // Draw Conveyor
  drawConveyor(ctx,W,H);

  // Draw Products
  drawProductsOnBelt(ctx,W,H);

  // Draw Scanner
  if(S.running||S.autoMode) drawScanBeam(ctx,W,H);

  // Draw camera rig
  drawCameraRig(ctx,W,H);

  // Draw sorting bins
  drawBins(ctx,W,H);

  // Apply computer vision edge scanner filter overlay
  if (S.cvEdgeMode) {
    applyCVEdgeFilter(ctx, W, H);
  }

  // Exposure Overlay shading
  ctx.filter = 'none';
  if (S.params.exposure !== 50) {
    ctx.fillStyle = S.params.exposure > 50 ? 
      `rgba(255,255,255,${(S.params.exposure-50)/100 * 0.4})` :
      `rgba(0,0,0,${(50-S.params.exposure)/100 * 0.5})`;
    ctx.fillRect(0,0,W,H);
  }
}

function drawConveyor(ctx,W,H){
  const bY=H-63,bH=36;
  const g=ctx.createLinearGradient(0,bY,0,bY+bH);
  g.addColorStop(0,'#1e293b'); g.addColorStop(.5,'#334155'); g.addColorStop(1,'#0f172a');
  ctx.fillStyle=g; ctx.fillRect(0,bY,W,bH);

  // Stripes
  ctx.save(); ctx.rect(0,bY,W,bH); ctx.clip();
  for(let x=-40+(S.convOff%40);x<W+40;x+=40){
    ctx.fillStyle='rgba(51,65,85,.6)'; ctx.fillRect(x,bY,18,bH);
  }
  ctx.restore();

  ctx.fillStyle='rgba(100,116,139,.3)'; ctx.fillRect(0,bY,W,2);
  ctx.strokeStyle='#475569'; ctx.lineWidth=2;
  ctx.strokeRect(0,bY-4,W,bH+8);
}

function drawCameraRig(ctx,W,H){
  const bY=H-63, cX=W/2, camY=50;
  ctx.fillStyle='rgba(148,163,184,0.4)'; ctx.fillRect(cX-4,12,8,bY-camY-5);
  ctx.fillStyle='#475569'; ctx.fillRect(cX-52,18,104,6);

  ctx.save();
  const cg=ctx.createLinearGradient(cX-20,camY-15,cX+20,camY+15);
  cg.addColorStop(0,'#1e293b'); cg.addColorStop(1,'#334155');
  ctx.fillStyle=cg; rr(ctx,cX-21,camY-15,42,32,4); ctx.fill(); ctx.restore();

  const lg=ctx.createRadialGradient(cX,camY+7,2,cX,camY+7,10);
  lg.addColorStop(0,'#93c5fd'); lg.addColorStop(1,'#0f172a');
  ctx.beginPath(); ctx.arc(cX,camY+7,10,0,Math.PI*2); ctx.fillStyle=lg; ctx.fill();

  const on=S.running||S.autoMode;
  ctx.beginPath(); ctx.arc(cX+14,camY-9,3,0,Math.PI*2);
  ctx.fillStyle=on?'#22c55e':'#ef4444'; ctx.fill();
}

function drawScanBeam(ctx,W,H){
  const bY=H-63, cX=W/2, camY=50, bX=cX-35+S.scanX;
  const scanColor = SECTORS[S.sector].edgeColor;

  const bg=ctx.createLinearGradient(bX,camY+20,bX,bY-4);
  bg.addColorStop(0,`${scanColor}ee`); bg.addColorStop(1,`${scanColor}05`);
  ctx.fillStyle=bg; ctx.fillRect(bX-1.5,camY+20,3,bY-camY-24);

  const fg=ctx.createRadialGradient(bX,bY-4,0,bX,bY-4,20);
  fg.addColorStop(0,`${scanColor}77`); fg.addColorStop(1,`${scanColor}00`);
  ctx.beginPath(); ctx.arc(bX,bY-4,20,0,Math.PI*2); ctx.fillStyle=fg; ctx.fill();
}

function drawProductsOnBelt(ctx,W,H){
  const bY=H-63;
  const cur=S.currentProduct;
  const slots=[{x:W*.13,sz:20,main:false},{x:W*.42,sz:26,main:true},{x:W*.72,sz:20,main:false}];
  const previewColor = SECTORS[S.sector].previewColor;

  slots.forEach(sl=>{
    const x=sl.x, y=bY-13, s=sl.sz;
    
    // Determine what geometry to draw
    let typeToDraw = S.productCfg.type;
    if(!sl.main && cur) {
      typeToDraw = cur.type;
    }

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    if (typeToDraw === 'Metal Bracket' || typeToDraw === 'Aluminum Plate') {
      const pg=ctx.createLinearGradient(x-s/2,y-s/2,x+s/2,y+s/2);
      pg.addColorStop(0,'#f1f5f9'); pg.addColorStop(1,'#94a3b8');
      ctx.fillStyle=pg; ctx.strokeStyle='#ffffff'; ctx.lineWidth=1;
      rr(ctx,x-s/2,y-s/2,s,s,3); ctx.fill(); ctx.stroke();
      // Bolt holes
      ctx.fillStyle = '#1e293b';
      [[x-s/3, y-s/3], [x+s/3, y-s/3], [x-s/3, y+s/3], [x+s/3, y+s/3]].forEach(([hx, hy]) => {
        ctx.beginPath(); ctx.arc(hx, hy, s*0.08, 0, Math.PI*2); ctx.fill();
      });
    } 
    else if (typeToDraw === 'Steel Shaft') {
      const pg=ctx.createLinearGradient(x-s/2,y-s/3,x+s/2,y+s/3);
      pg.addColorStop(0,'#e2e8f0'); pg.addColorStop(.5,'#ffffff'); pg.addColorStop(1,'#64748b');
      ctx.fillStyle=pg; ctx.strokeStyle='#475569'; ctx.lineWidth=1;
      rr(ctx, x-s/2, y-s/4, s, s/2, 2); ctx.fill(); ctx.stroke();
    }
    else if (typeToDraw === 'Gear Assembly') {
      ctx.fillStyle = '#475569'; ctx.beginPath();
      const teeth = 8;
      const rOuter = s/2;
      const rInner = s/3;
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i * Math.PI) / teeth;
        const r = i % 2 === 0 ? rOuter : rInner;
        ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(x, y, s*0.15, 0, Math.PI*2); ctx.fill();
    }
    else if (typeToDraw === 'Plastic Bottle' || typeToDraw === 'Plastic Housing') {
      const pg=ctx.createLinearGradient(x-s/3,y-s/2,x+s/3,y+s/2);
      pg.addColorStop(0,'#a7f3d0'); pg.addColorStop(1,'#047857');
      ctx.fillStyle=pg; ctx.strokeStyle='#ffffff'; ctx.lineWidth=1;
      ctx.fillRect(x-s*0.1, y-s/2, s*0.2, s*0.15); // neck
      rr(ctx, x-s/3, y-s/3, s*0.66, s*0.7, 4); ctx.fill(); ctx.stroke();
    }
    else if (typeToDraw === 'Cardboard Carton' || typeToDraw === 'Confectionary Tray') {
      const pg=ctx.createLinearGradient(x-s/2,y-s/2,x+s/2,y+s/2);
      pg.addColorStop(0,'#fcd34d'); pg.addColorStop(1,'#d97706');
      ctx.fillStyle=pg; ctx.strokeStyle='#fef3c7'; ctx.lineWidth=1;
      rr(ctx, x-s/2, y-s/2, s, s, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x-s/2, y-s/6, s, s/3);
    }
    else if (typeToDraw === 'Printed Circuit Board' || typeToDraw === 'Microprocessor Wafer' || typeToDraw === 'Circuit Board' || typeToDraw === 'Capacitor Array') {
      const pg=ctx.createLinearGradient(x-s/2,y-s/2,x+s/2,y+s/2);
      pg.addColorStop(0,'#3b82f6'); pg.addColorStop(1,'#1e3a8a');
      ctx.fillStyle=pg; ctx.strokeStyle='#93c5fd'; ctx.lineWidth=1;
      rr(ctx,x-s/2,y-s/2,s,s,3); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(147,197,253,0.3)'; ctx.lineWidth = 1;
      ln(ctx, x-s/2, y-s/4, x+s/2, y-s/4);
      ln(ctx, x-s/4, y-s/2, x-s/4, y+s/2);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(x-s*0.2, y-s*0.2, s*0.4, s*0.4);
    }
    else {
      const pg=ctx.createLinearGradient(x-s/2,y-s/2,x+s/2,y+s/2);
      pg.addColorStop(0,'#f8fafc'); pg.addColorStop(1, previewColor);
      ctx.fillStyle=pg; rr(ctx,x-s/2,y-s/2,s,s,4); ctx.fill();
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.5;
      rr(ctx,x-s/2,y-s/2,s,s,4); ctx.stroke();
    }
    ctx.restore();

    if(sl.main && cur && cur.hasDefect && cur.defectX !== null){
      ctx.strokeStyle='#ef4444'; ctx.lineWidth=1.5;
      ctx.setLineDash([2,2]);
      rr(ctx, x-s/2-2, y-s/2-2, s+4, s+4, 3);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}

function drawBins(ctx,W,H){
  const by=H-57;
  // PASS
  const px=W-57;
  ctx.fillStyle='rgba(22,163,74,0.1)'; ctx.strokeStyle='#16a34a'; ctx.lineWidth=2;
  rr(ctx,px,by,48,44,4); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#4ade80'; ctx.font='bold 8px Inter'; ctx.textAlign='center';
  ctx.fillText('PASS',px+24,by+18);
  ctx.fillStyle='#ffffff'; ctx.font='bold 11px "JetBrains Mono"'; ctx.fillText(S.totalPassed,px+24,by+35);

  // REJECT
  const rx=8;
  ctx.fillStyle='rgba(220,38,38,0.1)'; ctx.strokeStyle='#dc2626'; ctx.lineWidth=2;
  rr(ctx,rx,by,48,44,4); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#f87171'; ctx.font='bold 8px Inter'; ctx.textAlign='center';
  ctx.fillText('REJECT',rx+24,by+18);
  ctx.fillStyle='#ffffff'; ctx.font='bold 11px "JetBrains Mono"'; ctx.fillText(S.totalRejected,rx+24,by+35);
  ctx.textAlign='left';
}

// ── Glow Edge detection filter ──
function applyCVEdgeFilter(ctx, W, H) {
  const edgeColor = SECTORS[S.sector].edgeColor;
  
  // Create neon glowing outlines using global composition
  ctx.save();
  ctx.globalCompositeOperation = 'difference';
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1.2;
  ctx.shadowColor = edgeColor;
  ctx.shadowBlur = 8;
  
  // Overlay scanning laser matrix lines
  ctx.beginPath();
  for (let y = 10; y < H; y += 12) {
    ln(ctx, 0, y, W, y);
  }
  ctx.strokeStyle = 'rgba(34,197,94,0.08)';
  ctx.stroke();
  ctx.restore();
}

// ================================================================
// DIAGNOSTIC CHARTS & PREVIEWS
// ================================================================
function drawConfGauge(value,active){
  const cv=CV['cv-gauge']; if(!cv) return;
  const ctx=CTX['cv-gauge'];
  const W=cv.width,H=cv.height,cx=W/2,cy=H/2,r=Math.min(W,H)/2-6;
  ctx.clearRect(0,0,W,H);
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=8; ctx.stroke();
  if(!active||value<=0) return;
  const color=value>=80?'#16a34a':value>=60?'#ca8a04':'#dc2626';
  ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+(value/100)*Math.PI*2);
  ctx.strokeStyle=color; ctx.lineWidth=8; ctx.lineCap='round'; ctx.stroke();
}

function drawProductPreview(product){
  const cv=CV['cv-prod']; if(!cv) return;
  const ctx=CTX['cv-prod'], W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#f1f5f9'; ctx.fillRect(0,0,W,H);

  if(!product){
    ctx.fillStyle='#94a3b8'; ctx.font='9px Inter'; ctx.textAlign='center';
    ctx.fillText('No Product',W/2,H/2+3); ctx.textAlign='left'; return;
  }

  const pColor = SECTORS[S.sector].previewColor;
  const pg=ctx.createLinearGradient(6,4,W-6,H-4);
  pg.addColorStop(0,'#ffffff'); pg.addColorStop(1, pColor);
  ctx.fillStyle=pg; rr(ctx,6,4,W-12,H-8,5); ctx.fill();
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1.5; rr(ctx,6,4,W-12,H-8,5); ctx.stroke();

  // Draw defect if AI detected it, or if it has a physical coordinate
  if(product.hasDefect && product.defectX !== null){
    const scaleX = (W - 12) / 204;
    const scaleY = (H - 8) / 136;
    const px = 6 + (product.defectX - 18) * scaleX;
    const py = 4 + (product.defectY - 18) * scaleY;
    const ds = Math.max(3, product.defectSize * 4);

    ctx.save();
    ctx.strokeStyle='#ef4444'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(px, py, ds, 0, Math.PI*2); ctx.stroke();
    
    ctx.setLineDash([2,1]);
    ln(ctx, px, py, W/2, H/2);
    ctx.restore();
  }
}

function drawDonut(){
  const cv=CV['cv-donut']; if(!cv) return;
  const ctx=CTX['cv-donut'], W=cv.width, H=cv.height;
  const cx=W/2,cy=H/2,r=Math.min(W,H)/2-4,ir=r*.58;
  ctx.clearRect(0,0,W,H);

  const data=DEFECT_TYPES.map((t,i)=>({t,c:S.defectCounts[t]||0,col:DONUT_COLORS[i]})).filter(d=>d.c>0);
  const total=data.reduce((a,d)=>a+d.c,0);

  if(!total){
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=10; ctx.stroke();
    el('donut-legend').innerHTML='<div class="legend-empty">No defects logged</div>';
    return;
  }
  let ang=-Math.PI/2;
  data.forEach(d=>{
    const sl=(d.c/total)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,ang,ang+sl); ctx.closePath();
    ctx.fillStyle=d.col; ctx.fill(); ang+=sl;
  });
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,ir,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();

  el('donut-legend').innerHTML=data.map(d=>
    `<div class="legend-item">
      <div class="leg-left"><div class="leg-dot" style="background:${d.col}"></div><span>${d.t}</span></div>
      <span class="leg-cnt">${d.c} (${((d.c/total)*100).toFixed(1)}%)</span>
    </div>`
  ).join('');
}

function drawBar(){
  const cv=CV['cv-bar']; if(!cv) return;
  const p=cv.parentElement;
  cv.width=p?p.clientWidth:260; cv.height=p?p.clientHeight:130;
  const ctx=CTX['cv-bar'], W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);

  const labels=['0–20','20–40','40–60','60–80','80–100'];
  const data=S.confBins, maxV=Math.max(...data,1);
  const colors=['#f87171','#fb923c','#fbbf24','#4ade80','#60a5fa'];
  const pad={t:20,r:8,b:30,l:30};
  const cW=W-pad.l-pad.r, cH=H-pad.t-pad.b;
  const bW=cW/labels.length, gap=bW*.25;

  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+cH);
  ctx.lineTo(pad.l+cW,pad.t+cH); ctx.stroke();

  ctx.setLineDash([3,3]); ctx.strokeStyle='#f1f5f9';
  for(let i=1;i<=4;i++){
    const y=pad.t+cH-(cH/4)*i;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(pad.l+cW,y); ctx.stroke();
    ctx.fillStyle='#94a3b8'; ctx.font='8px Inter'; ctx.textAlign='right';
    ctx.fillText(Math.round((maxV/4)*i), pad.l-4, y+3);
  }
  ctx.setLineDash([]);

  data.forEach((v,i)=>{
    const x=pad.l+i*bW+gap/2, bh=(v/maxV)*cH, y=pad.t+cH-bh;
    const bg=ctx.createLinearGradient(x,y,x,pad.t+cH);
    bg.addColorStop(0,colors[i]); bg.addColorStop(1,`${colors[i]}70`);
    ctx.fillStyle=bg; rr(ctx,x,y,bW-gap,Math.max(bh,1),3); ctx.fill();
    if(v>0){ ctx.fillStyle='#374151'; ctx.font='bold 8.5px Inter'; ctx.textAlign='center'; ctx.fillText(v,x+(bW-gap)/2,y-4); }
    ctx.fillStyle='#64748b'; ctx.font='8px Inter'; ctx.textAlign='center';
    ctx.fillText(labels[i],x+(bW-gap)/2,pad.t+cH+11);
  });

  ctx.fillStyle='#94a3b8'; ctx.font='8px Inter'; ctx.textAlign='center';
  ctx.fillText('Confidence Range (%)', pad.l+cW/2, H-3);
  ctx.save(); ctx.translate(9,pad.t+cH/2); ctx.rotate(-Math.PI/2);
  ctx.fillText('Products',0,0); ctx.restore();
  ctx.textAlign='left';
}

function drawAllSparks(){ Object.keys(SPARK_CFG).forEach(id=>drawSparkline(id)); }
function drawSparkline(id){
  const cfg=SPARK_CFG[id]; if(!cfg) return;
  const cv=CV[id], ctx=CTX[id]; if(!cv||!ctx) return;
  const W=cv.width, H=cv.height, data=S.spark[cfg.key], col=cfg.color;
  ctx.clearRect(0,0,W,H);

  if(data.length<2){
    ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke(); return;
  }
  const mx=Math.max(...data)||1, mn=Math.min(...data), range=mx-mn||1;
  const pts=data.map((v,i)=>({ x:(i/(data.length-1))*W, y:H-((v-mn)/range)*(H-4)-2 }));

  const fg=ctx.createLinearGradient(0,0,0,H);
  fg.addColorStop(0,`${col}30`); fg.addColorStop(1,`${col}00`);
  ctx.fillStyle=fg; ctx.beginPath(); ctx.moveTo(pts[0].x,H);
  pts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.lineTo(pts[pts.length-1].x,H);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.lineJoin='round';
  ctx.beginPath(); pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();

  const lp=pts[pts.length-1];
  ctx.beginPath(); ctx.arc(lp.x,lp.y,2.5,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
}

// ================================================================
// HELPERS
// ================================================================
function el(id){ return document.getElementById(id); }
function set(id,val){ const e=el(id); if(e) e.textContent=val; }
function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function rng(a,b){ return a+Math.random()*(b-a); }
function clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }
function ln(ctx,x1,y1,x2,y2){ ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
function rr(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
function setStatus(id,cls,text){ const e=el(id); if(e){e.className=`badge ${cls}`;e.textContent=text;} }
function setBadge(cls,text){ const e=el('sim-badge'); if(e){e.className=`sim-badge ${cls}`;e.textContent=text;} }

window.addEventListener('resize',()=>{ drawScene(); drawBar(); });
