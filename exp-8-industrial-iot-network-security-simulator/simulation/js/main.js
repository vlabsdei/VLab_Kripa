/**
 * Experiment 8 – Industrial IoT Network Security Simulator
 * SmartFactory 4.0 Virtual Lab · v3 Reference Dashboard
 */
'use strict';

/* ═══════════════════════════════════════════
   DEVICE REGISTRY
═══════════════════════════════════════════ */
const DEVS = {
  cloud:  { name:'Industrial Cloud',    ip:'10.0.0.1',      role:'Cloud Platform',          vendor:'AWS/Azure',  model:'IoT Core/Hub'   },
  fw:     { name:'Industrial Firewall', ip:'192.168.0.1',   role:'Security Gateway',        vendor:'Fortinet',   model:'FortiGate 100F' },
  gw:     { name:'IoT Gateway',         ip:'192.168.0.10',  role:'Protocol Converter',      vendor:'Siemens',    model:'IOT2050'        },
  sw:     { name:'Ethernet Switch',     ip:'192.168.1.1',   role:'Network Switch',          vendor:'Cisco',      model:'IE 3400'        },
  plc:    { name:'PLC Controller',      ip:'192.168.10.11', role:'Programmable Logic Ctrl', vendor:'Siemens',    model:'S7-315'         },
  cam:    { name:'Vision Camera',       ip:'192.168.10.12', role:'Machine Vision',          vendor:'Keyence',    model:'CV-X400'        },
  sensor: { name:'Sensor Hub',          ip:'192.168.10.13', role:'Data Acquisition',        vendor:'Phoenix',    model:'Contact'        },
  hmi:    { name:'HMI Panel',           ip:'192.168.10.14', role:'Human-Machine Interface', vendor:'Weintek',    model:'MT8071'         },
  rfid:   { name:'RFID Reader',         ip:'192.168.10.15', role:'Asset Tracking',          vendor:'Zebra',      model:'FX9600'         },
  mc:     { name:'Motor Controller',    ip:'192.168.10.16', role:'Motion Controller',       vendor:'ABB',        model:'ACS880'         },
  tmp:    { name:'Temp. Sensor',        ip:'192.168.10.17', role:'Process Monitoring',      vendor:'Honeywell',  model:'ST700'          },
  wh:     { name:'Warehouse OW',        ip:'192.168.10.18', role:'Storage Management',      vendor:'Advantech',  model:'EKI'            },
};

/* Packet paths: sXY and dXY match SVG viewBox (860×480) */
const PATHS = [
  { src:'cloud',  dst:'fw',     sXY:[426,80],  dXY:[426,116] },
  { src:'fw',     dst:'gw',     sXY:[426,180], dXY:[426,222] },
  { src:'gw',     dst:'sw',     sXY:[426,258], dXY:[426,307] },
  { src:'sw',     dst:'plc',    sXY:[384,324], dXY:[55,400]  },
  { src:'sw',     dst:'cam',    sXY:[402,324], dXY:[161,400] },
  { src:'sw',     dst:'sensor', sXY:[420,326], dXY:[267,400] },
  { src:'sw',     dst:'hmi',    sXY:[426,326], dXY:[373,400] },
  { src:'sw',     dst:'rfid',   sXY:[432,326], dXY:[479,400] },
  { src:'sw',     dst:'mc',     sXY:[438,324], dXY:[585,400] },
  { src:'sw',     dst:'tmp',    sXY:[450,324], dXY:[691,400] },
  { src:'sw',     dst:'wh',     sXY:[468,324], dXY:[797,400] },
  { src:'plc',    dst:'cloud',  sXY:[55,396],  dXY:[426,80]  },
  { src:'cam',    dst:'cloud',  sXY:[161,396], dXY:[426,80]  },
];

/* Flow minimap paths (horizontal SVG, viewBox 900x60) */
const FLOW_NODES = [
  { id:'fn-plc',  x:60,  label:'PLC'    },
  { id:'fn-gw',   x:240, label:'GW'     },
  { id:'fn-sw',   x:420, label:'SWITCH' },
  { id:'fn-fw',   x:620, label:'FW'     },
  { id:'fn-cloud',x:800, label:'Cloud'  },
];

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let running = false;
let simInterval = null;
let simCount = 0;
let logCount = 0;
let totalPkts = 0, delPkts = 0, blkPkts = 0;

let P = { devices:20, pktRate:250, fwStrength:5, attack:0, protocol:'MQTT', encryption:'None' };
let M = {};
let Mprev = {};

let packets = [];
let flowPackets = [];
let pktId = 0;
let lastSpawn = 0;
let rafId = null;

const HIST = 30;
const hist = { loss: new Array(HIST).fill(0), lat: new Array(HIST).fill(0), tp: new Array(HIST).fill(0), lbl: new Array(HIST).fill('') };

/* ═══════════════════════════════════════════
   ENGINEERING MODEL
═══════════════════════════════════════════ */
function compute(p) {
  const CAP = 1000;
  const { devices, pktRate, fwStrength, attack, encryption } = p;

  const congestion = Math.min((pktRate * devices * 0.1) / CAP * 100, 100);
  const fwFactor   = (11 - fwStrength) / 10;
  const lossRaw    = (attack * fwFactor * 0.5) + (congestion * 0.18);
  const packetLoss = clamp(lossRaw, 0, 100);

  const encLat = encryption === 'AES-256' ? 18 : encryption === 'AES-128' ? 8 : 0;
  const latency = 5 + (pktRate / 80) * (1 + devices * 0.03) * (1 + attack * 0.015) + encLat;

  const throughput   = pktRate * (1 - packetLoss / 100);
  const availability = 100 - packetLoss;
  const encBonus     = encryption === 'AES-256' ? 15 : encryption === 'AES-128' ? 8 : 0;
  const securityScore= clamp(100 - packetLoss - (attack * 0.4) + (fwStrength * 5) + encBonus, 0, 100);
  const bandwidth    = clamp((pktRate / CAP) * devices * 10, 0, 100);
  const threatLevel  = clamp(attack * fwFactor, 0, 100);
  const connections  = Math.round(devices * (1 - packetLoss / 200));

  return {
    packetLoss:    +packetLoss.toFixed(1),
    latency:       +latency.toFixed(1),
    throughput:    +throughput.toFixed(0),
    availability:  +availability.toFixed(1),
    congestion:    +congestion.toFixed(1),
    securityScore: +securityScore.toFixed(1),
    bandwidth:     +bandwidth.toFixed(1),
    threatLevel:   +threatLevel.toFixed(1),
    connections:   connections,
  };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ═══════════════════════════════════════════
   CONTROLS
═══════════════════════════════════════════ */
function initControls() {
  const bind = (slid, valId, key, fmt) => {
    const sl = document.getElementById(slid);
    const vl = document.getElementById(valId);
    sl.addEventListener('input', () => { P[key] = +sl.value; vl.textContent = fmt ? fmt(sl.value) : sl.value; });
  };
  bind('sl-dev', 'v-dev', 'devices');
  bind('sl-pkt', 'v-pkt', 'pktRate');
  bind('sl-fw',  'v-fw',  'fwStrength');
  bind('sl-atk', 'v-atk', 'attack', v => v + '%');

  document.getElementById('sel-proto').addEventListener('change', e => { P.protocol = e.target.value; refreshBarProto(); });
  document.getElementById('sel-enc').addEventListener('change',   e => { P.encryption = e.target.value; refreshBarEnc(); });

  document.getElementById('btn-run').addEventListener('click', toggleSim);
  document.getElementById('btn-reset').addEventListener('click', resetSim);

  document.getElementById('sel-device').addEventListener('change', updateDeviceDetails);
}

function refreshBarProto() {
  document.getElementById('bar-proto').textContent = P.protocol;
}
function refreshBarEnc() {
  const enc = P.encryption;
  const txt = enc === 'None' ? 'No Enc' : enc;
  document.getElementById('bar-enc').textContent  = txt;
  const el2 = document.getElementById('bar-enc2');
  if (el2) el2.textContent = txt;
  const dot = document.getElementById('enc-dot');
  dot.className = 'dot ' + (enc === 'AES-256' ? 'green' : enc === 'AES-128' ? 'orange' : 'red');
}

/* ═══════════════════════════════════════════
   CLOCK
═══════════════════════════════════════════ */
function startClock() {
  const el = document.getElementById('bar-clock');
  setInterval(() => {
    const d = new Date();
    el.textContent = d.toLocaleTimeString('en-GB');
  }, 1000);
}

/* ═══════════════════════════════════════════
   SIMULATION CONTROL
═══════════════════════════════════════════ */
function toggleSim() {
  running ? stopSim() : startSim();
}

function startSim() {
  running = true;
  setRunState(true);
  simInterval = setInterval(tick, 1000);
  tick();
  rafId = requestAnimationFrame(pktLoop);
}

function stopSim() {
  running = false;
  clearInterval(simInterval);
  cancelAnimationFrame(rafId);
  packets = []; flowPackets = [];
  document.getElementById('pkt-layer').innerHTML = '';
  document.getElementById('flow-pkt-layer').innerHTML = '';
  setRunState(false);
  setConnColors();
}

function resetSim() {
  stopSim();
  P = { devices:20, pktRate:250, fwStrength:5, attack:0, protocol:'MQTT', encryption:'None' };
  totalPkts = 0; delPkts = 0; blkPkts = 0;

  document.getElementById('sl-dev').value  = 20;
  document.getElementById('sl-pkt').value  = 250;
  document.getElementById('sl-fw').value   = 5;
  document.getElementById('sl-atk').value  = 0;
  document.getElementById('sel-proto').value = 'MQTT';
  document.getElementById('sel-enc').value   = 'None';

  document.getElementById('v-dev').textContent  = '20';
  document.getElementById('v-pkt').textContent  = '250';
  document.getElementById('v-fw').textContent   = '5';
  document.getElementById('v-atk').textContent  = '0%';
  refreshBarProto(); refreshBarEnc();

  hist.loss.fill(0); hist.lat.fill(0); hist.tp.fill(0); hist.lbl.fill('');
  pushCharts();
  resetKPIs();
  updatePacketStats();

  logCount = 0;
  document.getElementById('log-count').textContent = '0 records';
  document.getElementById('log-body').innerHTML = `<tr><td colspan="8" style="text-align:center;color:#94A3B8;padding:10px 0">Awaiting simulation…</td></tr>`;
  const led = document.getElementById('log-led');
  if (led) { led.style.background = ''; led.style.boxShadow = ''; }

  resetDeviceMetrics();
}

function setRunState(on) {
  const btn  = document.getElementById('btn-run');
  const dot  = document.getElementById('sim-dot');
  const lbl  = document.getElementById('sim-label');
  const led  = document.getElementById('state-led');
  const txt  = document.getElementById('state-txt');
  const netBadge = document.getElementById('net-badge');
  const netLed   = document.getElementById('net-led');

  if (on) {
    btn.textContent = 'Pause';
    btn.style.background = '#DC2626';
    dot.className = 'dot red';
    lbl.textContent = 'RUNNING';
    led.style.cssText = 'background:#22C55E;box-shadow:0 0 6px #22C55E;animation:blink 0.7s infinite';
    txt.textContent = 'Simulation Running';
    netBadge.textContent = 'LIVE';
    netBadge.style.color = '#10B981';
    netLed.className = 'ph-led green';
  } else {
    btn.textContent = 'Run';
    btn.style.background = '';
    dot.className = 'dot';
    lbl.textContent = 'IDLE';
    led.style.cssText = 'background:#CBD5E1;box-shadow:none;animation:none';
    txt.textContent = 'Simulation Stopped';
    netBadge.textContent = 'IDLE';
    netBadge.style.color = '#94A3B8';
    netLed.className = 'ph-led';
  }
}

/* ═══════════════════════════════════════════
   SIM TICK
═══════════════════════════════════════════ */
function tick() {
  Mprev = { ...M };
  M = compute(P);
  updateKPIs();
  updateThreats();
  pushHistory();
  pushCharts();
  updateDeviceDetails();
  simCount++;
  if (simCount % 5 === 0) addLog();
  setConnColors();
}

/* ═══════════════════════════════════════════
   KPI UPDATES
═══════════════════════════════════════════ */
function trend(cur, prev, lowerBetter = false) {
  const delta = cur - prev;
  if (Math.abs(delta) < 0.05) return { t: '-', c: 'flat' };
  const up = delta > 0;
  return lowerBetter
    ? { t: up ? 'Up' : 'Dn', c: up ? 'dn' : 'up' }
    : { t: up ? 'Up' : 'Dn', c: up ? 'up' : 'dn' };
}

function setKPI(id, val, pct, color) {
  const vEl = document.getElementById('kv-' + id);
  const bEl = document.getElementById('kb-' + id);
  if (vEl) vEl.textContent = val;
  if (bEl) { bEl.style.width = Math.min(pct, 100) + '%'; bEl.style.background = color; }
}

function colorFor(val, good, warn, inverted = false) {
  if (!inverted) {
    return val >= good ? '#22C55E' : val >= warn ? '#F59E0B' : '#EF4444';
  } else {
    return val <= good ? '#22C55E' : val <= warn ? '#F59E0B' : '#EF4444';
  }
}

function updateKPIs() {
  const m = M, p = P;

  setKPI('health', m.availability,   m.availability,          colorFor(m.availability,80,60));
  setKPI('sec',    m.securityScore,  m.securityScore,         '#2563EB');
  setKPI('threat', m.threatLevel.toFixed(1), m.threatLevel,   colorFor(m.threatLevel,10,30,true));
  setKPI('loss',   m.packetLoss,     m.packetLoss*2,          colorFor(m.packetLoss,5,15,true));
  setKPI('lat',    m.latency,        clamp(m.latency/2,0,100),colorFor(m.latency,50,150,true));
  setKPI('tp',     m.throughput,     (m.throughput/p.pktRate)*100, '#10B981');
  setKPI('bw',     m.bandwidth,      m.bandwidth,              colorFor(m.bandwidth,60,85,true));
  setKPI('conns',  m.connections,    (m.connections/p.devices)*100,'#10B981');

  // Devices
  const dvEl = document.getElementById('kv-devs');
  const dvBr = document.getElementById('kb-devs');
  if (dvEl) dvEl.textContent = p.devices;
  if (dvBr) dvBr.style.width = p.devices + '%';

  // Firewall
  const fwEl = document.getElementById('kv-fw');
  const fwBr = document.getElementById('kb-fw');
  const fwLd = document.getElementById('kl-fw');
  if (fwEl) fwEl.textContent = p.fwStrength;
  if (fwBr) { fwBr.style.width = p.fwStrength*10+'%'; fwBr.style.background = colorFor(p.fwStrength,7,4); }
  if (fwLd) { const c = colorFor(p.fwStrength,7,4); fwLd.style.background = c; fwLd.style.boxShadow = `0 0 4px ${c}`; }

  // Encryption
  const enEl = document.getElementById('kv-enc');
  const enLd = document.getElementById('kl-enc');
  if (enEl) enEl.textContent = p.encryption;
  if (enLd) {
    const c = p.encryption === 'AES-256' ? '#22C55E' : p.encryption === 'AES-128' ? '#F59E0B' : '#EF4444';
    enLd.style.background = c; enLd.style.boxShadow = `0 0 4px ${c}`;
  }

  // Threat text
  const tSub = document.getElementById('kt-threat');
  if (tSub) {
    tSub.textContent = m.threatLevel > 60 ? 'CRITICAL — Attack Detected!' :
                        m.threatLevel > 30 ? 'WARNING — Elevated Threat' :
                        m.threatLevel > 10 ? 'Low — Monitor Traffic' :
                        'Low — No Active Threats';
  }

  // Sec panel LED
  const secLed = document.getElementById('sec-led');
  if (secLed) {
    const c = colorFor(m.securityScore,70,50);
    secLed.style.background = c; secLed.style.boxShadow = `0 0 5px ${c}`;
  }

  // Health trend
  const htEl = document.getElementById('kt-health');
  if (htEl && Object.keys(Mprev).length) {
    const tr = trend(m.availability, Mprev.availability || 0, false);
    htEl.textContent = tr.t; htEl.className = 'kpi-trend ' + tr.c;
  }

  updatePacketStats();
}

function updatePacketStats() {
  const s = document.getElementById('stat-total');
  const d = document.getElementById('stat-del');
  const b = document.getElementById('stat-blk');
  const e = document.getElementById('stat-enc');
  if (s) s.textContent = totalPkts.toLocaleString();
  if (d) d.textContent = delPkts.toLocaleString();
  if (b) b.textContent = blkPkts.toLocaleString();
  if (e) e.textContent = P.encryption === 'None' ? '0%' : P.encryption === 'AES-128' ? '100%' : '100%';
}

function resetKPIs() {
  ['health','sec','threat','loss','lat','tp','bw','conns','devs','fw'].forEach(id => {
    const el = document.getElementById('kv-'+id);
    const br = document.getElementById('kb-'+id);
    if (el) el.textContent = '—';
    if (br) br.style.width = '0%';
  });
  const enEl = document.getElementById('kv-enc');
  if (enEl) enEl.textContent = 'None';
}

/* ═══════════════════════════════════════════
   THREAT INTELLIGENCE
═══════════════════════════════════════════ */
const RULES = [
  { chk:(m,p)=>p.attack>60,              lv:'crit', txt:'Critical attack detected — increase Firewall Strength to ≥ 8.' },
  { chk:(m,p)=>m.packetLoss>15,          lv:'crit', txt:'Packet Loss > 15% — network reliability severely degraded.' },
  { chk:(m,p)=>p.encryption==='None'&&p.attack>0, lv:'crit', txt:'No encryption with active attack — enable AES-256 immediately.' },
  { chk:(m,p)=>m.congestion>70,          lv:'crit', txt:'Network congestion critical — reduce Packet Rate or segment network.' },
  { chk:(m,p)=>m.securityScore<50,       lv:'crit', txt:'Security Score < 50 — immediate countermeasures required.' },
  { chk:(m,p)=>m.packetLoss>5,           lv:'warn', txt:'Packet Loss above 5% threshold — monitor traffic closely.' },
  { chk:(m,p)=>p.encryption==='None',    lv:'warn', txt:'Unencrypted communication — enable AES-256 for IEC 62443 compliance.' },
  { chk:(m,p)=>m.congestion>40,          lv:'warn', txt:'Elevated congestion — consider QoS traffic prioritisation.' },
  { chk:(m,p)=>p.fwStrength<5&&p.attack>20, lv:'warn', txt:'Weak firewall with active attack — increase strength to ≥ 7.' },
  { chk:(m,p)=>m.latency>150,            lv:'warn', txt:'Latency > 150 ms — real-time control may be affected.' },
  { chk:(m,p)=>m.bandwidth>85,           lv:'warn', txt:'Bandwidth utilisation > 85% — saturation risk.' },
  { chk:(m,p)=>p.encryption==='AES-256'&&m.securityScore>80, lv:'ok', txt:'AES-256 active — communication secured per IEC 62443.' },
  { chk:(m,p)=>p.fwStrength>=8&&p.attack>0, lv:'info', txt:'Strong firewall blocking attack packets — threat mitigated.' },
  { chk:(m,p)=>m.availability>95,        lv:'info', txt:'Availability > 95% — network performing optimally.' },
];

const LV_COL = { crit:'#EF4444', warn:'#F59E0B', info:'#2563EB', ok:'#22C55E' };

function updateThreats() {
  const active = RULES.filter(r => r.chk(M, P)).slice(0, 5);
  const body = document.getElementById('threat-body');
  const led  = document.getElementById('threat-led');
  if (!active.length) {
    body.innerHTML = '<div style="font-size:9px;color:#22C55E;text-align:center;padding:10px 0;font-weight:700">No active threats detected - All systems normal</div>';
    if (led) { led.style.background='#22C55E'; led.style.boxShadow='0 0 5px #22C55E'; }
    return;
  }
  const hasCrit = active.some(r => r.lv === 'crit');
  if (led) {
    const c = hasCrit ? '#EF4444' : '#F59E0B';
    led.style.background = c; led.style.boxShadow = `0 0 5px ${c}`;
    led.className = 'ph-led ' + (hasCrit ? 'red' : 'orange');
  }
  body.innerHTML = active.map(r => {
    const col = LV_COL[r.lv] || '#64748B';
    return `<div class="t-item">
      <svg class="t-icon" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="${col}20" stroke="${col}" stroke-width="1.2"/>
        <text x="8" y="12" text-anchor="middle" font-size="8" fill="${col}" font-weight="700" font-family="Outfit,sans-serif">${r.lv==='crit'?'!':r.lv==='warn'?'!':r.lv==='ok'?'OK':'i'}</text>
      </svg>
      <div>
        <span class="t-tag ${r.lv}">${r.lv.toUpperCase()}</span>
        <div class="t-text">${r.txt}</div>
      </div>
    </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════
   DEVICE DETAILS
═══════════════════════════════════════════ */
const DEVICE_INFO = {
  plc:    { type:'PLC Controller',      vendor:'Siemens',   model:'S7-315',      ip:'192.168.10.11' },
  cam:    { type:'Vision Camera',       vendor:'Keyence',   model:'CV-X400',     ip:'192.168.10.12' },
  sensor: { type:'Sensor Hub',          vendor:'Phoenix',   model:'Contact Hub', ip:'192.168.10.13' },
  hmi:    { type:'HMI Panel',           vendor:'Weintek',   model:'MT8071',      ip:'192.168.10.14' },
  rfid:   { type:'RFID Reader',         vendor:'Zebra',     model:'FX9600',      ip:'192.168.10.15' },
  fw:     { type:'Industrial Firewall', vendor:'Fortinet',  model:'FortiGate 100F', ip:'192.168.0.1' },
  gw:     { type:'IoT Gateway',         vendor:'Siemens',   model:'IOT2050',     ip:'192.168.0.10' },
  cloud:  { type:'Cloud Platform',      vendor:'AWS/Azure', model:'IoT Core/Hub',ip:'10.0.0.1'     },
};

function updateDeviceDetails() {
  const sel = document.getElementById('sel-device').value;
  const info = DEVICE_INFO[sel] || DEVICE_INFO['plc'];
  const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

  setEl('dd-type',   info.type);
  setEl('dd-vendor', info.vendor);
  setEl('dd-model',  info.model);
  setEl('dd-ip',     info.ip);

  const online = running;
  const statusEl = document.getElementById('dd-status');
  if (statusEl) {
    statusEl.textContent = online ? (M.packetLoss > 20 ? 'Degraded' : 'Online') : 'Standby';
    statusEl.style.color = online ? (M.packetLoss > 20 ? '#F59E0B' : '#22C55E') : '#94A3B8';
  }

  // Simulated per-device metrics
  const seed = sel.charCodeAt(0) * 7;
  const cpu  = online ? clamp(20 + Math.sin(Date.now()/3000 + seed) * 15 + P.pktRate/50, 5, 95) : 0;
  const mem  = online ? clamp(35 + Math.cos(Date.now()/4000 + seed) * 10 + P.devices/5, 20, 90) : 0;
  const tmp  = online ? clamp(38 + P.pktRate/100 + P.attack/10, 30, 85) : 0;
  const pkt  = online ? Math.floor(M.throughput * (0.7 + Math.random()*0.3)) : 0;
  const pktPct = online ? clamp((pkt / (P.pktRate * P.devices)) * 100, 0, 100) : 0;

  const setMetric = (sfx, val, pct, col) => {
    const bar = document.getElementById('dm-'+sfx);
    const txt = document.getElementById('dmv-'+sfx);
    if (bar) { bar.style.width = pct+'%'; bar.style.background = col; }
    if (txt) txt.textContent = val;
  };
  setMetric('cpu', Math.round(cpu)+'%',  cpu,    cpu>70?'#EF4444':cpu>50?'#F59E0B':'#22C55E');
  setMetric('mem', Math.round(mem)+'%',  mem,    '#2563EB');
  setMetric('tmp', Math.round(tmp)+'°C', (tmp-30)/0.55, tmp>70?'#EF4444':tmp>60?'#F59E0B':'#06B6D4');
  setMetric('pkt', online ? pkt.toLocaleString() : '—', pktPct, '#10B981');
}

function resetDeviceMetrics() {
  ['cpu','mem','tmp','pkt'].forEach(s => {
    const bar = document.getElementById('dm-'+s);
    const txt = document.getElementById('dmv-'+s);
    if (bar) { bar.style.width = '0%'; }
    if (txt) txt.textContent = '—';
  });
}

/* ═══════════════════════════════════════════
   CHART.JS
═══════════════════════════════════════════ */
let cLoss, cLat, cTp;

function initCharts() {
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font:{size:6.5,family:'JetBrains Mono'}, color:'#475569', maxTicksLimit:5 },
           grid: { color:'#E2E8F0', lineWidth:.5 } },
      y: { ticks: { font:{size:6.5,family:'JetBrains Mono'}, color:'#475569' },
           grid: { color:'#E2E8F0', lineWidth:.5 } }
    },
    elements: { point:{radius:0}, line:{tension:.4} }
  };

  cLoss = new Chart(document.getElementById('ch-loss'), {
    type:'line', data:{ labels:[...hist.lbl],
      datasets:[{ data:[...hist.loss], borderColor:'#EF4444', backgroundColor:'rgba(239,68,68,.14)',
                  fill:true, borderWidth:2 }] }, options:{...base}
  });
  cLat = new Chart(document.getElementById('ch-lat'), {
    type:'line', data:{ labels:[...hist.lbl],
      datasets:[{ data:[...hist.lat], borderColor:'#2563EB', backgroundColor:'rgba(37,99,235,.14)',
                  fill:true, borderWidth:2 }] }, options:{...base}
  });
  cTp = new Chart(document.getElementById('ch-tp'), {
    type:'line', data:{ labels:[...hist.lbl],
      datasets:[{ data:[...hist.tp], borderColor:'#10B981', backgroundColor:'rgba(16,185,129,.14)',
                  fill:true, borderWidth:2 }] }, options:{...base}
  });
}

function pushHistory() {
  const now = new Date();
  const lbl = `${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
  hist.loss.shift(); hist.loss.push(M.packetLoss);
  hist.lat.shift();  hist.lat.push(M.latency);
  hist.tp.shift();   hist.tp.push(M.throughput);
  hist.lbl.shift();  hist.lbl.push(lbl);
}

function pushCharts() {
  if (!cLoss) return;
  cLoss.data.labels = [...hist.lbl]; cLoss.data.datasets[0].data = [...hist.loss]; cLoss.update('none');
  cLat.data.labels  = [...hist.lbl]; cLat.data.datasets[0].data  = [...hist.lat];  cLat.update('none');
  cTp.data.labels   = [...hist.lbl]; cTp.data.datasets[0].data   = [...hist.tp];   cTp.update('none');
}

/* ═══════════════════════════════════════════
   COMMUNICATION LOG
═══════════════════════════════════════════ */
function addLog() {
  logCount++;
  const m = M, p = P;
  
  // Format current timestamp
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB');

  // Device list for random log generation
  const devKeys = ['plc', 'cam', 'sensor', 'hmi', 'rfid', 'mc', 'tmp', 'wh'];
  const srcKey = devKeys[Math.floor(Math.random() * devKeys.length)];
  let dstKey = 'gw';
  if (Math.random() < 0.25) dstKey = 'cloud';
  else if (Math.random() < 0.15) dstKey = 'sw';

  let srcName = DEVS[srcKey]?.name || 'Unknown Device';
  let dstName = DEVS[dstKey]?.name || 'Gateway';

  // Introduce an occasional rogue device under attack
  let isAttack = false;
  if (p.attack > 10 && Math.random() * 100 < p.attack) {
    isAttack = true;
    srcName = 'Unknown Device';
    dstName = 'Firewall';
  }

  // Determine protocol
  let proto = p.protocol;
  if (isAttack) proto = 'TCP';
  else if (Math.random() < 0.1) proto = 'HTTPS';

  // Latency with micro-fluctuations (jitter)
  const jitter = Math.round((Math.random() * 6 - 3));
  const latencyVal = isAttack ? 0 : Math.max(1, Math.round(m.latency + jitter));

  // Determine status and style
  let statusText = 'Delivered';
  let statusClass = 'secure';

  if (isAttack) {
    const blocked = Math.random() * 10 < p.fwStrength;
    if (blocked) {
      statusText = 'Blocked';
      statusClass = 'critical';
    } else {
      statusText = 'Intrusion';
      statusClass = 'warning';
    }
  } else if (p.encryption !== 'None') {
    statusText = 'Encrypted';
    statusClass = 'secure';
  }

  const body = document.getElementById('log-body');
  const ph = body.querySelector('td[colspan]');
  if (ph) ph.parentElement.remove();

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${logCount}</td>
    <td style="color:#1E3A5F; font-weight:700">${srcName} → ${dstName}</td>
    <td style="font-weight:600">${proto}</td>
    <td>${latencyVal} ms</td>
    <td><span class="badge ${statusClass}">${statusText}</span></td>`;
  
  body.appendChild(tr);
  if (body.children.length > 30) body.removeChild(body.firstChild);

  // Auto-scroll logic if container is scrolled near bottom
  const container = document.querySelector('.log-body');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }

  document.getElementById('log-count').textContent = logCount + ' records';
  
  const led = document.getElementById('log-led');
  if (led) {
    const c = statusClass === 'secure' ? '#22C55E' : statusClass === 'warning' ? '#F59E0B' : '#EF4444';
    led.style.background = c;
    led.style.boxShadow = `0 0 5px ${c}`;
  }
}

/* ═══════════════════════════════════════════
   PACKET ANIMATION (Main SVG)
═══════════════════════════════════════════ */
const PKT_COLOR = { normal:'#2563EB', encrypted:'#22C55E', attack:'#EF4444', dropped:'#F59E0B' };

function pktType() {
  const r = Math.random() * 100;
  if (r < P.attack * 0.35) return 'attack';
  if (r < P.attack * 0.35 + P.attack * 0.12) return 'dropped';
  return P.encryption !== 'None' ? 'encrypted' : 'normal';
}

function spawnPkt() {
  const path = PATHS[Math.floor(Math.random() * PATHS.length)];
  let type = pktType();
  const blocked = type === 'attack' && Math.random() * 10 < P.fwStrength;
  if (blocked) type = 'dropped';

  totalPkts++;
  if (type === 'dropped' || blocked) blkPkts++;
  else delPkts++;

  const id = pktId++;
  const dur = 0.8 + Math.random() * 0.6;
  const pkt = { id, path, type, dur, start: performance.now(), blocked, size: 64 + Math.floor(Math.random() * 1400) };
  packets.push(pkt);

  const layer = document.getElementById('pkt-layer');
  const el = makeSVG('circle', { r:3.5, fill: PKT_COLOR[type], stroke:'#fff', 'stroke-width':.8,
    opacity:.9, id:`p-${id}`, class:'pkt',
    style:`filter:drop-shadow(0 0 3px ${PKT_COLOR[type]})` });
  el.addEventListener('click', e => { e.stopPropagation(); showInspector(pkt, e.clientX, e.clientY); });
  layer.appendChild(el);

  // Also spawn in flow minimap (20% of the time to prevent crowding)
  if (Math.random() < 0.20) {
    spawnFlowPkt(type);
  }
}

/* ═══════════════════════════════════════════
   FLOW MINIMAP PACKETS
═══════════════════════════════════════════ */
function spawnFlowPkt(type) {
  const id = 'fp-' + pktId;
  const dur = 2.5 + Math.random();
  const fpkt = { id, type, dur, start: performance.now() };
  flowPackets.push(fpkt);

  const layer = document.getElementById('flow-pkt-layer');
  const el = makeSVG('circle', {
    r: 4, fill: PKT_COLOR[type], stroke:'#fff', 'stroke-width':.8,
    opacity:.95, id, style:`filter:drop-shadow(0 0 3px ${PKT_COLOR[type]})`
  });
  layer.appendChild(el);
}

function pktLoop(ts) {
  if (!running) return;

  const rate = Math.max(50, 1200 / Math.min(P.pktRate / 4, 20));
  if (ts - lastSpawn > rate) {
    const n = Math.min(3, 1 + Math.floor(P.devices / 20));
    for (let i = 0; i < n; i++) spawnPkt();
    lastSpawn = ts;
  }

  // Animate main SVG packets
  const done = [];
  packets.forEach(pk => {
    const t = Math.min((ts - pk.start) / (pk.dur * 1000), 1);
    const [x1,y1] = pk.path.sXY, [x2,y2] = pk.path.dXY;
    const el = document.getElementById(`p-${pk.id}`);
    if (el) {
      el.setAttribute('cx', x1 + (x2-x1)*t);
      el.setAttribute('cy', y1 + (y2-y1)*t);
      if (pk.type === 'dropped') el.setAttribute('opacity', Math.max(0.9 - t*1.8, 0));
      if (pk.type === 'attack')  el.setAttribute('opacity', 0.6 + Math.sin(t*25)*0.4);
    }
    if (t >= 1) done.push(pk.id);
  });
  done.forEach(id => {
    const el = document.getElementById(`p-${id}`);
    if (el) el.remove();
    packets = packets.filter(p => p.id !== id);
  });

  // Animate flow minimap packets
  const flowDone = [];
  flowPackets.forEach(fp => {
    const t = Math.min((ts - fp.start) / (fp.dur * 1000), 1);
    const el = document.getElementById(fp.id);
    if (el) {
      const x = 40 + t * 820;
      el.setAttribute('cx', x);
      el.setAttribute('cy', 30 + Math.sin(t * Math.PI * 2) * 5);
      el.setAttribute('opacity', t > 0.9 ? (1 - t) * 10 : 0.9);
    }
    if (t >= 1) flowDone.push(fp.id);
  });
  flowDone.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
    flowPackets = flowPackets.filter(p => p.id !== id);
  });

  rafId = requestAnimationFrame(pktLoop);
}

/* ═══════════════════════════════════════════
   PACKET INSPECTOR
═══════════════════════════════════════════ */
function showInspector(pkt, cx, cy) {
  const wrap = document.getElementById('net-svg-wrap');
  const rect = wrap.getBoundingClientRect();
  const insp = document.getElementById('pkt-inspector');
  const stateMap = { normal:'Transmitting', encrypted:'Encrypted Tx', attack:'Cyber Attack', dropped: pkt.blocked ? 'Blocked — Firewall' : 'Packet Dropped' };

  let left = cx - rect.left + 12;
  let top  = cy - rect.top  - 8;
  if (left + 185 > rect.width)  left -= 200;
  if (top  + 170 > rect.height) top  -= 170;

  insp.style.left = left + 'px';
  insp.style.top  = top  + 'px';

  document.getElementById('pi-src').textContent   = DEVS[pkt.path.src]?.name || pkt.path.src;
  document.getElementById('pi-dst').textContent   = DEVS[pkt.path.dst]?.name || pkt.path.dst;
  document.getElementById('pi-proto').textContent = P.protocol;
  document.getElementById('pi-size').textContent  = pkt.size + ' B';
  document.getElementById('pi-enc').textContent   = P.encryption;
  document.getElementById('pi-tx').textContent    = Math.round(pkt.dur * 1000) + ' ms';
  document.getElementById('pi-state').textContent = stateMap[pkt.type] || pkt.type;

  insp.classList.add('show');
  clearTimeout(insp._t);
  insp._t = setTimeout(() => insp.classList.remove('show'), 3000);
}

/* ═══════════════════════════════════════════
   DEVICE TOOLTIPS
═══════════════════════════════════════════ */
function initDevTooltips() {
  const tip = document.getElementById('dev-tooltip');
  document.getElementById('tt-x').addEventListener('click', () => tip.classList.remove('show'));

  document.querySelectorAll('.dev-node').forEach(node => {
    node.addEventListener('click', e => {
      e.stopPropagation();
      const key = node.getAttribute('data-dev');
      const dev = DEVS[key]; if (!dev) return;

      const wrap = document.getElementById('net-svg-wrap');
      const wRect = wrap.getBoundingClientRect();
      const nRect = node.getBoundingClientRect();

      let left = nRect.left - wRect.left + nRect.width/2 + 8;
      let top  = nRect.top  - wRect.top;
      if (left + 230 > wRect.width) left -= 240;
      if (top  + 210 > wRect.height) top -= 190;

      tip.style.left = left + 'px';
      tip.style.top  = top  + 'px';

      document.getElementById('tt-name').textContent = dev.name;
      document.getElementById('tt-ip').textContent   = dev.ip;

      const online = running;
      const stEl   = document.getElementById('tt-status');
      stEl.textContent = online ? (M.packetLoss > 20 ? 'DEGRADED' : 'ONLINE') : 'STANDBY';
      stEl.className   = 'tt-v ' + (online ? (M.packetLoss>20 ? 'warn':'ok') : '');

      document.getElementById('tt-sent').textContent = online ? Math.floor(M.throughput * (0.8+Math.random()*0.2)) + ' pkts' : '—';
      document.getElementById('tt-lat').textContent  = online ? M.latency + ' ms' : '—';

      const lossEl = document.getElementById('tt-loss');
      lossEl.textContent = online ? M.packetLoss + '%' : '—';
      lossEl.className   = 'tt-v ' + (M.packetLoss>10?'bad':M.packetLoss>3?'warn':'ok');

      const secEl = document.getElementById('tt-sec');
      secEl.textContent = online ? (M.securityScore>=70?'SECURE':M.securityScore>=50?'WARNING':'CRITICAL') : '—';
      secEl.className   = 'tt-v ' + (M.securityScore>=70?'ok':M.securityScore>=50?'warn':'bad');

      const rec = document.getElementById('tt-rec');
      if (!online) {
        rec.textContent = 'Start simulation to view diagnostics.';
      } else if (M.packetLoss > 15) {
        rec.textContent = 'Raise Firewall Strength and reduce Attack Intensity.';
      } else if (P.encryption === 'None') {
        rec.textContent = 'Enable AES-256 for IEC 62443 secure communication.';
      } else if (M.latency > 100) {
        rec.textContent = 'Reduce packet rate to lower network latency.';
      } else {
        rec.textContent = 'Device operating within normal parameters.';
      }

      tip.classList.add('show');

      // Also update device details panel
      const selEl = document.getElementById('sel-device');
      if (selEl && DEVICE_INFO[key]) {
        selEl.value = key;
        updateDeviceDetails();
      }
    });
  });

  document.addEventListener('click', e => {
    if (!tip.contains(e.target)) tip.classList.remove('show');
    const insp = document.getElementById('pkt-inspector');
    if (insp && !insp.contains(e.target)) insp.classList.remove('show');
  });
}

/* ═══════════════════════════════════════════
   CONNECTION LINE COLOURS
═══════════════════════════════════════════ */
function setConnColors() {
  const lines = document.querySelectorAll('.conn');
  let stroke;
  if (!running) {
    stroke = '#CBD5E1';
  } else if (M.packetLoss > 15 || P.attack > 60) {
    stroke = '#FCA5A5';
  } else if (M.packetLoss > 5 || P.attack > 20) {
    stroke = '#FDE68A';
  } else if (P.encryption !== 'None') {
    stroke = '#86EFAC';
  } else {
    stroke = '#93C5FD';
  }
  lines.forEach(l => l.setAttribute('stroke', stroke));
}

/* ═══════════════════════════════════════════
   SVG HELPERS
═══════════════════════════════════════════ */
function makeSVG(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
  return el;
}

/* ═══════════════════════════════════════════
   CSV EXPORT
═══════════════════════════════════════════ */
function exportCSV() {
  const rows = document.querySelectorAll('#log-body tr');
  if (!rows.length || (rows.length === 1 && rows[0].querySelector('td[colspan]'))) {
    alert('No log data available to export.');
    return;
  }
  let csv = 'Time,Source -> Destination,Protocol,Latency,Status\n';
  rows.forEach(tr => {
    const cols = tr.querySelectorAll('td');
    if (cols.length >= 5) {
      const rowData = Array.from(cols).map(td => td.textContent.trim());
      csv += rowData.join(',') + '\n';
    }
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `iiot_security_logs_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initControls();
  initCharts();
  initDevTooltips();
  startClock();
  refreshBarProto();
  refreshBarEnc();
  updateDeviceDetails();

  const expBtn = document.getElementById('btn-export-csv');
  if (expBtn) expBtn.addEventListener('click', exportCSV);

  const scrollBtn = document.getElementById('btn-scroll-log');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const container = document.querySelector('.log-body');
      if (container) {
        if (scrollBtn.textContent === 'Scroll Down') {
          container.scrollTop = container.scrollHeight;
          scrollBtn.textContent = 'Scroll Up';
        } else {
          container.scrollTop = 0;
          scrollBtn.textContent = 'Scroll Down';
        }
      }
    });
  }

  // Initial connection colors
  setConnColors();
});
