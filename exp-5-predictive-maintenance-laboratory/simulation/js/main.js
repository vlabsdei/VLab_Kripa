// ================================================
// Predictive Maintenance Simulation - main.js
// Experiment 5 | IIT Virtual Lab
// Full scientific formula + instant visual feedback
// ================================================

// --- STATE ---
let isRunning = false;
let simInterval = null;
let runCount = 0;

let inputs = { temp: 20, vib: 0, hours: 0, lube: 100 };
let outputs = { health: 100, risk: 0, score: 12.5 };

const MAX_PTS = 40;
let trendLabels = Array(MAX_PTS).fill('');
let trendHealth  = Array(MAX_PTS).fill(100);
let trendRisk    = Array(MAX_PTS).fill(0);
let trendScore   = Array(MAX_PTS).fill(12.5);

// Waveform state
let wavePoints = [];
let waveX = 10;
const WAVE_W = 330;

// --- DOM REFERENCES ---
const el = {
    tempSlider:  document.getElementById('tempSlider'),
    vibSlider:   document.getElementById('vibSlider'),
    hoursSlider: document.getElementById('hoursSlider'),
    lubeSlider:  document.getElementById('lubeSlider'),
    tempValue:   document.getElementById('tempValue'),
    vibValue:    document.getElementById('vibValue'),
    hoursValue:  document.getElementById('hoursValue'),
    lubeValue:   document.getElementById('lubeValue'),

    runBtn:          document.getElementById('runBtn'),
    pauseBtn:        document.getElementById('pauseBtn'),
    logBtn:          document.getElementById('logBtn'),
    resetBtn:        document.getElementById('resetBtn'),
    exportCsvBtn:    document.getElementById('exportCsvBtn'),
    exportCsvBtnBottom: document.getElementById('exportCsvBtnBottom'),
    maintBtns:       document.querySelectorAll('.btn-action'),

    // SVG core
    machineSvg:      document.getElementById('machineSvg'),
    motorFan:        document.getElementById('motorFan'),
    pumpImpeller:    document.getElementById('pumpImpeller'),
    coupling:        document.getElementById('coupling'),
    fluidFlow:       document.getElementById('fluidFlow'),
    motorHeatOverlay:document.getElementById('motorHeatOverlay'),
    pumpOuter:       document.getElementById('pumpOuter'),
    pressureNeedle:  document.getElementById('pressureNeedle'),

    // SVG live labels
    svgTempVal:      document.getElementById('svgTempVal'),
    svgTempTag:      document.getElementById('svgTempTag'),
    svgVibVal:       document.getElementById('svgVibVal'),
    svgVibTag:       document.getElementById('svgVibTag'),
    svgHealthPct:    document.getElementById('svgHealthPct'),
    healthBar:       document.getElementById('healthBar'),
    lubeBar:         document.getElementById('lubeBar'),
    lubePct:         document.getElementById('lubePct'),
    vibWaveform:     document.getElementById('vibWaveform'),
    monitorRiskBar:  document.getElementById('monitorRiskBar'),
    monitorRiskPct:  document.getElementById('monitorRiskPct'),
    monitorHealthTxt:document.getElementById('monitorHealthTxt'),
    ledTemp:         document.getElementById('ledTemp'),
    ledVib:          document.getElementById('ledVib'),

    // Analytics row
    anaHealth:       document.getElementById('anaHealth'),
    anaRisk:         document.getElementById('anaRisk'),
    anaMaintScore:   document.getElementById('anaMaintScore'),

    // Status
    headerStatusDot: document.getElementById('headerStatusDot'),
    headerStatusText:document.getElementById('headerStatusText'),
    liveBadge:       document.getElementById('liveBadge'),

    // Right panel
    gaugePctText:    document.getElementById('gaugePctText'),
    gaugeProgressRing: document.getElementById('gaugeProgressRing'),
    inferredScore:   document.getElementById('inferredScore'),
    inferredRisk:    document.getElementById('inferredRisk'),
    inferredTemp:    document.getElementById('inferredTemp'),
    inferredVib:     document.getElementById('inferredVib'),
    zoneTemp:        document.getElementById('zoneTemp'),
    zoneVib:         document.getElementById('zoneVib'),
    zoneLube:        document.getElementById('zoneLube'),
    zoneWear:        document.getElementById('zoneWear'),
    zoneTempVal:     document.getElementById('zoneTempVal'),
    zoneVibVal:      document.getElementById('zoneVibVal'),
    zoneLubeVal:     document.getElementById('zoneLubeVal'),
    zoneWearVal:     document.getElementById('zoneWearVal'),
    observation:     document.getElementById('observation'),
    traceTerminal:   document.getElementById('traceTerminal'),

    // Bottom
    logTable: document.getElementById('logTable'),
};

// --- CHART ---
let kpiChart;
function initChart() {
    const ctx = document.getElementById('kpiTrendChart').getContext('2d');
    kpiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendLabels,
            datasets: [
                { label: 'Health (%)',      data: trendHealth, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, borderWidth: 2, pointRadius: 0, tension: 0.4 },
                { label: 'Failure Risk (%)',data: trendRisk,   borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)',  fill: true, borderWidth: 2, pointRadius: 0, tension: 0.4 },
                { label: 'Maint. Score',    data: trendScore,  borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)', fill: false,borderWidth: 2, pointRadius: 0, tension: 0.4 },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: true, position: 'top', labels: { font: { size: 10 }, boxWidth: 12, padding: 10 } } },
            scales: {
                x: { display: false },
                y: { beginAtZero: true, max: 110, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, color: '#64748b' } }
            }
        }
    });
}

// =====================================================
// CORE SCIENTIFIC FORMULA
// Failure Risk = (Temperature + Vibration) / Maintenance Score
// =====================================================
function calculate() {
    // Maintenance Score = 5 (base) + lube_bonus (0–10) − hours_penalty (0–10)
    // Lube 100% → bonus 10; Lube 0% → bonus 0
    // Hours 10000 → penalty 10; Hours 0 → penalty 0
    const lubeBonus    = (inputs.lube  / 100)   * 10;
    const hoursPenalty = (inputs.hours / 10000) * 10;
    outputs.score = Math.max(1, 5 + lubeBonus - hoursPenalty);

    // Raw risk index (physical units: °C + Hz) / score
    const rawRisk = (inputs.temp + inputs.vib) / outputs.score;

    // Normalise: worst case T=150, V=100, Score=1 → rawRisk=250 → 100%
    outputs.risk   = Math.min(100, Math.max(0, rawRisk / 2.5));
    outputs.health = 100 - outputs.risk;
}

// --- TRACE LOG ---
function addTrace(msg, type = '') {
    const line = document.createElement('div');
    line.className = `trace-line ${type}`;
    line.textContent = `> ${msg}`;
    el.traceTerminal.appendChild(line);
    el.traceTerminal.scrollTop = el.traceTerminal.scrollHeight;
    if (el.traceTerminal.children.length > 30) el.traceTerminal.removeChild(el.traceTerminal.firstChild);
}

// --- ANIMATION STATE ---
let fanAngle  = 0;
let impAngle  = 0;
let coupAngle = 0;
let dashOffset = 0;
let animFrame;

function animateSVG() {
    if (!isRunning) return;
    // Speed proportional to vibration (higher vib = faster spin)
    const speed = 1.5 + (inputs.vib / 100) * 9;

    fanAngle  = (fanAngle  + speed)       % 360;
    impAngle  = (impAngle  + speed * 0.7) % 360;
    coupAngle = (coupAngle + speed * 0.5) % 360;
    dashOffset -= (0.8 + speed * 0.25);

    if (el.motorFan)    el.motorFan.style.transform    = `rotate(${fanAngle}deg)`;
    if (el.pumpImpeller)el.pumpImpeller.style.transform= `rotate(${impAngle}deg)`;
    if (el.coupling)    el.coupling.style.transform    = `rotate(${coupAngle}deg)`;
    if (el.fluidFlow)   el.fluidFlow.style.strokeDashoffset = dashOffset;

    // Update vibration waveform
    updateWaveform();
}

function startAnimLoop() {
    function loop() { animateSVG(); animFrame = requestAnimationFrame(loop); }
    animFrame = requestAnimationFrame(loop);
}
function stopAnimLoop() { cancelAnimationFrame(animFrame); }

// ======================================================
// VIBRATION WAVEFORM (scientific sinusoidal plot)
// Amplitude grows with vibration level
// ======================================================
let waveT = 0;
function updateWaveform() {
    waveT += 0.12;
    const amplitude = 2 + (inputs.vib / 100) * 12; // px, grows with Vib
    const freq      = 1 + (inputs.vib / 100) * 3;  // cycles per frame

    // Build 320px wide waveform using sinusoid
    const pts = [];
    for (let x = 10; x <= 330; x += 3) {
        const t = ((x - 10) / 320) * freq * Math.PI * 2 + waveT;
        const noise = amplitude * 0.2 * (Math.random() - 0.5); // sensor noise
        const y = 35 - (amplitude * Math.sin(t)) + noise;
        pts.push(`${x},${y}`);
    }
    if (el.vibWaveform) el.vibWaveform.setAttribute('points', pts.join(' '));

    // Color waveform based on vibration level
    const wColor = inputs.vib > 70 ? '#ef4444' : inputs.vib > 40 ? '#f59e0b' : '#3b82f6';
    if (el.vibWaveform) el.vibWaveform.setAttribute('stroke', wColor);
}

// ======================================================
// UPDATE ALL UI — called INSTANTLY on every slider move
// ======================================================
function updateUI() {
    // ---- SVG: motor body heat glow ----
    // Temperature maps 20°C → 0 opacity, 150°C → 0.5 opacity (red glow)
    const heatOpacity = Math.max(0, (inputs.temp - 60) / 90) * 0.5;
    if (el.motorHeatOverlay) el.motorHeatOverlay.setAttribute('opacity', heatOpacity.toFixed(3));

    // ---- SVG: pump ring color (blue=ok, amber=warn, red=critical) ----
    if (el.pumpOuter) {
        const pumpColor = outputs.risk > 60 ? '#ef4444' : outputs.risk > 35 ? '#f59e0b' : '#3b82f6';
        el.pumpOuter.setAttribute('stroke', pumpColor);
    }

    // ---- SVG: sensor live labels ----
    if (el.svgTempVal) el.svgTempVal.textContent = `T: ${inputs.temp}°C`;
    if (el.svgTempTag) el.svgTempTag.textContent  = `${inputs.temp}°C`;
    if (el.svgVibVal)  el.svgVibVal.textContent   = `V: ${inputs.vib}Hz`;
    if (el.svgVibTag)  el.svgVibTag.textContent   = `${inputs.vib}Hz`;

    // ---- SVG: LED sensor dots (green→amber→red) ----
    const tempColor = inputs.temp > 100 ? '#ef4444' : inputs.temp > 70 ? '#f59e0b' : '#22c55e';
    const vibColor  = inputs.vib  > 70  ? '#ef4444' : inputs.vib  > 40 ? '#f59e0b' : '#22c55e';
    if (el.ledTemp) el.ledTemp.setAttribute('fill', tempColor);
    if (el.ledVib)  el.ledVib.setAttribute('fill',  vibColor);

    // ---- SVG: health bar ----
    if (el.healthBar) {
        const hWidth = Math.max(0, (outputs.health / 100) * 149);
        el.healthBar.setAttribute('width', hWidth.toFixed(1));
        const hColor = outputs.health < 30 ? '#ef4444' : outputs.health < 60 ? '#f59e0b' : '#22c55e';
        el.healthBar.setAttribute('fill', hColor);
    }
    if (el.svgHealthPct) el.svgHealthPct.textContent = `${outputs.health.toFixed(0)}%`;

    // ---- SVG: lubrication bar ----
    if (el.lubeBar) {
        const lubeW = (inputs.lube / 100) * 164;
        el.lubeBar.setAttribute('width', lubeW.toFixed(1));
        const lubeColor = inputs.lube < 20 ? '#ef4444' : inputs.lube < 50 ? '#f59e0b' : '#10b981';
        el.lubeBar.setAttribute('fill', lubeColor);
    }
    if (el.lubePct) el.lubePct.textContent = `${Math.round(inputs.lube)}%`;

    // ---- SVG: monitoring panel risk bar ----
    if (el.monitorRiskBar) {
        const rWidth = (outputs.risk / 100) * 115;
        el.monitorRiskBar.setAttribute('width', rWidth.toFixed(1));
        const rColor = outputs.risk > 60 ? '#ef4444' : outputs.risk > 35 ? '#f59e0b' : '#22c55e';
        el.monitorRiskBar.setAttribute('fill', rColor);
    }
    if (el.monitorRiskPct)   el.monitorRiskPct.textContent   = `RISK: ${outputs.risk.toFixed(1)}%`;
    if (el.monitorHealthTxt) {
        el.monitorHealthTxt.textContent = `HEALTH: ${outputs.health.toFixed(0)}%`;
        const hColor = outputs.health < 30 ? '#ef4444' : outputs.health < 60 ? '#f59e0b' : '#10b981';
        el.monitorHealthTxt.setAttribute('fill', hColor);
    }

    // ---- SVG: pressure gauge needle ----
    // Maps 0% risk → -45° (green zone), 100% risk → +45° (red zone)
    if (el.pressureNeedle) {
        const needleDeg  = -45 + (outputs.risk / 100) * 90;
        const rad = (needleDeg - 90) * Math.PI / 180;
        const nx  = 680 + 15 * Math.cos(rad);
        const ny  = 205 + 15 * Math.sin(rad);
        el.pressureNeedle.setAttribute('x2', nx.toFixed(1));
        el.pressureNeedle.setAttribute('y2', ny.toFixed(1));
        const nColor = outputs.risk > 60 ? '#ef4444' : outputs.risk > 35 ? '#f59e0b' : '#1e293b';
        el.pressureNeedle.setAttribute('stroke', nColor);
    }

    // ---- SVG: machine shake on high risk ----
    if (outputs.risk > 70) {
        el.machineSvg.style.animation = 'shake 0.10s infinite';
    } else if (outputs.risk > 40) {
        el.machineSvg.style.animation = 'shake 0.25s infinite';
    } else {
        el.machineSvg.style.animation = 'none';
    }

    // ---- Fluid flow color reflects lubrication (healthy=cyan, degraded=amber/red) ----
    if (el.fluidFlow) {
        const fColor = inputs.lube < 20 ? '#ef4444' : inputs.lube < 50 ? '#f59e0b' : '#60a5fa';
        el.fluidFlow.setAttribute('stroke', fColor);
    }

    // ---- Analytics row ----
    if (el.anaHealth) {
        el.anaHealth.textContent = `${outputs.health.toFixed(1)}%`;
        el.anaHealth.style.color = outputs.health < 40 ? '#ef4444' : outputs.health < 70 ? '#f59e0b' : '#0f172a';
    }
    if (el.anaRisk) {
        el.anaRisk.textContent = `${outputs.risk.toFixed(1)}%`;
        el.anaRisk.style.color = outputs.risk > 60 ? '#ef4444' : outputs.risk > 35 ? '#f59e0b' : '#0f172a';
    }
    if (el.anaMaintScore) el.anaMaintScore.textContent = outputs.score.toFixed(2);

    // ---- Right panel gauge ----
    const pct = outputs.health;
    const circumference = 314.16;
    if (el.gaugeProgressRing) {
        el.gaugeProgressRing.style.strokeDashoffset = (circumference - (pct / 100) * circumference).toFixed(2);
        el.gaugeProgressRing.setAttribute('stroke', pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#22c55e');
    }
    if (el.gaugePctText) {
        el.gaugePctText.textContent = `${pct.toFixed(0)}%`;
        el.gaugePctText.setAttribute('fill', pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#0f172a');
    }

    // ---- Inferred values ----
    if (el.inferredScore) el.inferredScore.textContent = outputs.score.toFixed(2);
    if (el.inferredRisk)  el.inferredRisk.textContent  = `${outputs.risk.toFixed(1)}%`;
    if (el.inferredTemp)  el.inferredTemp.textContent  = `${inputs.temp}°C`;
    if (el.inferredVib)   el.inferredVib.textContent   = `${inputs.vib} Hz`;

    // ---- Condition zones ----
    setZone(el.zoneTemp, el.zoneTempVal, inputs.temp > 100 ? 'danger' : inputs.temp > 70  ? 'warn' : '', inputs.temp > 100 ? 'Critical' : inputs.temp > 70 ? 'Elevated' : 'Normal');
    setZone(el.zoneVib,  el.zoneVibVal,  inputs.vib  > 70  ? 'danger' : inputs.vib  > 40  ? 'warn' : '', inputs.vib  > 70  ? 'High'     : inputs.vib  > 40 ? 'Moderate' : 'Normal');
    setZone(el.zoneLube, el.zoneLubeVal, inputs.lube  < 20  ? 'danger' : inputs.lube  < 50  ? 'warn' : '', inputs.lube  < 20  ? 'Critical' : inputs.lube  < 50 ? 'Low'      : 'Good');
    setZone(el.zoneWear, el.zoneWearVal, outputs.risk > 60 ? 'danger' : outputs.risk > 35 ? 'warn' : '', outputs.risk > 60 ? 'Severe'   : outputs.risk > 35 ? 'Moderate' : 'Low');

    // ---- Header status ----
    let dot = 'green', statusTxt = 'NORMAL';
    if (outputs.risk > 60)      { dot = 'red';   statusTxt = 'CRITICAL'; }
    else if (outputs.risk > 35) { dot = 'amber'; statusTxt = 'WARNING';  }
    if (el.headerStatusDot)  el.headerStatusDot.className = `pulse-dot ${dot}`;
    if (el.headerStatusText) el.headerStatusText.textContent = statusTxt;

    // ---- AI Recommendation ----
    updateRecommendation();

    // ---- Trend chart ----
    trendHealth.push(outputs.health); trendHealth.shift();
    trendRisk.push(outputs.risk);     trendRisk.shift();
    trendScore.push(outputs.score);   trendScore.shift();
    kpiChart.update('none');
}

function setZone(zoneEl, valEl, cls, txt) {
    if (zoneEl) zoneEl.className = `heat-card ${cls}`;
    if (valEl)  valEl.textContent = txt;
}

function updateRecommendation() {
    let rec = '', cls = '';
    if (outputs.risk > 70) {
        rec = `⚠ CRITICAL: Risk = (${inputs.temp} + ${inputs.vib}) / ${outputs.score.toFixed(2)} = ${outputs.risk.toFixed(1)}%. STOP machine. Check motor temperature and vibration source immediately.`;
        cls = 'danger-rec';
    } else if (outputs.risk > 35) {
        const actions = [];
        if (inputs.temp > 100) actions.push('reduce motor load to lower temperature');
        if (inputs.vib  > 50)  actions.push('inspect shaft/bearing alignment');
        if (inputs.lube < 50)  actions.push('apply lubrication immediately');
        if (inputs.hours > 7000) actions.push('schedule full overhaul');
        rec = `WARNING: Failure Risk = (${inputs.temp}+${inputs.vib})/${outputs.score.toFixed(2)} = ${outputs.risk.toFixed(1)}%. Action: ${actions.length ? actions.join(', ') : 'monitor closely'}.`;
    } else {
        rec = `System nominal. Risk = (${inputs.temp} + ${inputs.vib}) / ${outputs.score.toFixed(2)} = ${outputs.risk.toFixed(1)}%. Continue standard monitoring.`;
    }
    if (el.observation) {
        el.observation.textContent = rec;
        el.observation.className   = `recommendation-content ${cls}`;
    }
}

// --- SIMULATION TICK (adds Gaussian noise for realism) ---
function tick() {
    // Automatically advance operating hours and degrade lubrication while running
    inputs.hours = Math.min(10000, inputs.hours + 50); 
    
    // Lube degrades faster at higher temperatures and vibrations
    const lubeDegradation = 0.5 + (inputs.temp / 150) * 1.5 + (inputs.vib / 100) * 1.5;
    inputs.lube = Math.max(0, inputs.lube - lubeDegradation);

    // Sync sliders to inputs
    if (el.hoursSlider) {
        el.hoursSlider.value = Math.round(inputs.hours);
        el.hoursValue.textContent = Math.round(inputs.hours);
    }
    if (el.lubeSlider) {
        el.lubeSlider.value = Math.round(inputs.lube);
        el.lubeValue.textContent = Math.round(inputs.lube);
    }

    // Add sensor measurement noise ±2°C and ±2Hz
    const tNoisy = Math.max(20, Math.min(150, inputs.temp + (Math.random() * 4 - 2)));
    const vNoisy = Math.max(0,  Math.min(100, inputs.vib  + (Math.random() * 4 - 2)));

    const lubeBonus    = (inputs.lube  / 100)   * 10;
    const hoursPenalty = (inputs.hours / 10000) * 10;
    outputs.score  = Math.max(1, 5 + lubeBonus - hoursPenalty);
    const rawRisk  = (tNoisy + vNoisy) / outputs.score;
    outputs.risk   = Math.min(100, Math.max(0, rawRisk / 2.5));
    outputs.health = 100 - outputs.risk;

    updateUI();

    const msg = `[${new Date().toLocaleTimeString('en-US',{hour12:false})}] T=${tNoisy.toFixed(1)}°C V=${vNoisy.toFixed(1)}Hz S=${outputs.score.toFixed(2)} → Risk=${outputs.risk.toFixed(1)}% H=${outputs.health.toFixed(1)}%`;
    addTrace(msg, outputs.risk > 60 ? 'danger' : outputs.risk > 35 ? 'warn' : '');
}

// --- LOG TABLE ---
const logData = [];
function addLogRow() {
    runCount++;
    const state = outputs.risk > 60 ? { lbl: 'CRITICAL', cls: 'red' } : outputs.risk > 35 ? { lbl: 'WARNING', cls: 'amber' } : { lbl: 'NORMAL', cls: 'green' };
    logData.unshift({ run: runCount, temp: inputs.temp, vib: inputs.vib, hours: Math.round(inputs.hours), lube: Math.round(inputs.lube), score: outputs.score.toFixed(2), risk: outputs.risk.toFixed(1) + '%', health: outputs.health.toFixed(1) + '%', state });
    if (logData.length > 50) logData.pop();
    renderLog();
}
function renderLog() {
    el.logTable.innerHTML = logData.map(r => `
        <tr>
            <td>${r.run}</td><td>${r.temp}°C</td><td>${r.vib}Hz</td><td>${r.hours}h</td>
            <td>${r.lube}%</td><td>${r.score}</td><td>${r.risk}</td><td>${r.health}</td>
            <td><span class="status-badge ${r.state.cls}">${r.state.lbl}</span></td>
        </tr>`).join('');
}

// --- CSV EXPORT ---
function exportCSV() {
    if (!logData.length) return;
    const header = 'Run,Temp(°C),Vib(Hz),Hours,Lube(%),Score,Risk(%),Health(%),State\n';
    const rows   = logData.map(r => `${r.run},${r.temp},${r.vib},${r.hours},${r.lube},${r.score},${r.risk},${r.health},${r.state.lbl}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'predictive_maintenance_log.csv'; a.click();
}

// --- SLIDER BINDINGS ---
// Sliders update instantly on every move — no need to click "Run"
function bindSlider(slider, display, key) {
    slider.addEventListener('input', e => {
        inputs[key] = Number(e.target.value);
        display.textContent = e.target.value;
        calculate();
        updateUI();
        // If running, also add a trace entry
        if (isRunning) {
            addTrace(`[Input] ${key}=${e.target.value} → Risk=${outputs.risk.toFixed(1)}%`, outputs.risk > 60 ? 'danger' : outputs.risk > 35 ? 'warn' : '');
        }
    });
}

bindSlider(el.tempSlider,  el.tempValue,  'temp');
bindSlider(el.vibSlider,   el.vibValue,   'vib');
bindSlider(el.hoursSlider, el.hoursValue, 'hours');
bindSlider(el.lubeSlider,  el.lubeValue,  'lube');

// --- BUTTON BINDINGS ---
el.runBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    el.runBtn.disabled = true;
    if (el.pauseBtn) el.pauseBtn.disabled = false;
    el.liveBadge.className = 'live-badge running';
    el.liveBadge.innerHTML = '<span class="pulse"></span> LIVE';
    addTrace(runCount === 0 ? 'Simulation started.' : 'Simulation resumed.', 'success');
    tick();
    simInterval = setInterval(() => { tick(); }, 2000);
    startAnimLoop();
});

if (el.pauseBtn) {
    el.pauseBtn.addEventListener('click', () => {
        if (!isRunning) return;
        clearInterval(simInterval);
        stopAnimLoop();
        isRunning = false;
        el.runBtn.disabled = false;
        el.pauseBtn.disabled = true;
        el.liveBadge.className = 'live-badge';
        el.liveBadge.innerHTML = '<span class="pulse"></span> PAUSED';
        addTrace('Simulation paused.', 'warn');
    });
}

if (el.logBtn) {
    el.logBtn.addEventListener('click', () => {
        addLogRow();
        addTrace('Data point recorded to log manually.', 'success');
    });
}

el.resetBtn.addEventListener('click', () => {
    clearInterval(simInterval);
    stopAnimLoop();
    isRunning = false;
    inputs = { temp: 20, vib: 0, hours: 0, lube: 100 };
    el.tempSlider.value  = 20;  el.tempValue.textContent  = '20';
    el.vibSlider.value   = 0;   el.vibValue.textContent   = '0';
    el.hoursSlider.value = 0;   el.hoursValue.textContent = '0';
    el.lubeSlider.value  = 100; el.lubeValue.textContent  = '100';
    el.runBtn.innerHTML = '<i class="fa-solid fa-play"></i> Run';
    el.runBtn.disabled = false;
    if (el.pauseBtn) el.pauseBtn.disabled = true;
    runCount = 0;
    logData.length = 0;
    renderLog();
    el.liveBadge.className = 'live-badge';
    el.liveBadge.innerHTML = '<span class="pulse"></span> OFFLINE';
    el.machineSvg.style.animation = 'none';
    if (el.motorFan)    el.motorFan.style.transform     = 'rotate(0deg)';
    if (el.pumpImpeller)el.pumpImpeller.style.transform = 'rotate(0deg)';
    if (el.coupling)    el.coupling.style.transform     = 'rotate(0deg)';
    calculate(); updateUI();
    addTrace('System reset to base parameters.', 'success');
});

el.maintBtns.forEach(btn => {
    btn.addEventListener('click', e => {
        const action = e.target.dataset.action || e.target.closest('button').dataset.action;
        const targetBtn = e.target.closest('button') || e.target;
        const originalText = targetBtn.innerHTML;
        
        targetBtn.innerHTML = '<i class="fa-solid fa-check"></i> Applied';
        targetBtn.classList.add('btn-success-flash');
        setTimeout(() => {
            targetBtn.innerHTML = originalText;
            targetBtn.classList.remove('btn-success-flash');
        }, 1500);

        if (action === 'lubricate') {
            inputs.lube = 100;
            el.lubeSlider.value = 100; el.lubeValue.textContent = '100';
            addTrace('Maintenance: System lubricated. Lube → 100%.', 'success');
        } else if (action === 'overhaul') {
            inputs.hours = 0;
            el.hoursSlider.value = 0; el.hoursValue.textContent = '0';
            addTrace('Maintenance: Full overhaul done. Hours → 0.', 'success');
        }
        calculate(); updateUI();
    });
});

el.exportCsvBtn.addEventListener('click', exportCSV);
el.exportCsvBtnBottom.addEventListener('click', exportCSV);

// --- INIT ---
initChart();
calculate();
updateUI();
addTrace('System initialized. Awaiting parameters.');
