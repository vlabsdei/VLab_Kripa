// ==========================================================
// Digital Twin Factory Simulator - main.js
// Experiment 6 | SmartFactory 4.0 Virtual Lab
// ==========================================================

// ── STATE ─────────────────────────────────────────────────
let isRunning   = false;
let simInterval = null;
let animFrame   = null;
let runCount    = 0;
let tickCount   = 0;

let inputs  = { machineCount: 12, prodRate: 450, power: 250, downtime: 10 };
let metrics = { efficiency: 0, utilization: 0, output: 0, energy: 0 };
let thermalStress = 0;

// AGV animation state
let agvAX = 50,  agvARight = true;
let agvBX = 450, agvBRight = false;

// Conveyor state
let conveyorProducts = [];

// Spindle / Robot animation
let spindleAngle = 0;
let robotT       = 0;

// Trend data for chart
const MAXPTS = 20;
let trendEff  = Array(MAXPTS).fill(0);
let trendUtil = Array(MAXPTS).fill(0);
let trendEng  = Array(MAXPTS).fill(0);

let kpiChart;
const logData = [];

// ── HELPERS ────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function get(id) { return document.getElementById(id); }

function setText(id, v) {
    const e = get(id);
    if (e) e.textContent = v;
}

function setColor(id, c) {
    const e = get(id);
    if (e) e.style.color = c;
}

function heatColor(v) {
    if (v >= 80) return '#ef4444';
    if (v >= 60) return '#f97316';
    if (v >= 40) return '#f59e0b';
    return '#22c55e';
}

function timestamp() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

// ── CORE MATH: OEE MODEL ──────────────────────────────────
function computeMetrics() {
    const { machineCount, prodRate, power, downtime } = inputs;

    // Capacity Modeling
    const MAX_CAPACITY_PER_MACHINE = 20; // units/hr
    const totalCapacity = machineCount * MAX_CAPACITY_PER_MACHINE;
    const actualRateTarget = Math.min(prodRate, totalCapacity);

    // Power Model
    const powerRequired = (machineCount * 5) + (actualRateTarget * 0.2);
    let powerPenalty = 1.0;
    let overdrivePenalty = 0;

    if (power < powerRequired) {
        // Underpowered: Performance drops severely
        powerPenalty = clamp(power / powerRequired, 0.1, 1.0);
        thermalStress = Math.max(0, thermalStress - 5);
    } else if (power > powerRequired + 50) {
        // Overdrive: Quality drops, thermal stress builds up
        overdrivePenalty = clamp((power - (powerRequired + 50)) / 200, 0, 0.6);
        thermalStress += (power - (powerRequired + 50)) * 0.05;
    } else {
        // Optimal power
        thermalStress = Math.max(0, thermalStress - 2);
    }

    // Cap thermal stress
    thermalStress = clamp(thermalStress, 0, 100);

    // Dynamic downtime (base + thermal)
    const effectiveDowntime = clamp(downtime + thermalStress * 0.5, 0, 100);

    // Availability
    const availability = clamp(1 - effectiveDowntime / 100, 0, 1);

    // Performance
    const basePerformance = totalCapacity > 0 ? (actualRateTarget / totalCapacity) : 0;
    const performance = clamp(basePerformance * powerPenalty, 0, 1);

    // Quality
    const quality = clamp(1.0 - overdrivePenalty - (thermalStress * 0.002), 0.1, 1.0);

    // OEE = Availability × Performance × Quality × 100
    const rawOEE = availability * performance * quality * 100;
    metrics.efficiency = clamp(rawOEE + (Math.random() * 2 - 1), 0, 100);

    // Machine Utilization
    metrics.utilization = clamp((machineCount / 50) * performance * 100 + (Math.random() * 3 - 1.5), 0, 100);

    // Actual output (units/hr)
    metrics.output = clamp(actualRateTarget * availability * performance * quality + (Math.random() * 4 - 2), 0, 1000);

    // Energy consumption (kW)
    metrics.energy = power * (0.9 + Math.random() * 0.2);
}

// ── SLIDER BINDINGS ────────────────────────────────────────
function bindSlider(sliderId, displayId, key) {
    const slider  = get(sliderId);
    const display = get(displayId);
    if (!slider || !display) return;
    slider.addEventListener('input', () => {
        inputs[key] = Number(slider.value);
        display.textContent = slider.value;
        if (isRunning) { computeMetrics(); renderUI(); }
    });
}

// Called AFTER DOM is ready
function initSliders() {
    bindSlider('machineSlider', 'machineValue', 'machineCount');
    bindSlider('prodSlider',    'prodValue',    'prodRate');
    bindSlider('powerSlider',   'powerValue',   'power');
    bindSlider('downtimeSlider','downtimeValue','downtime');
}

// ── CHART INIT ─────────────────────────────────────────────
function initChart() {
    const canvas = get('kpiChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    kpiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(MAXPTS).fill(''),
            datasets: [
                {
                    label: 'Efficiency (%)',
                    data: [...trendEff],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.08)',
                    fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0
                },
                {
                    label: 'Utilization (%)',
                    data: [...trendUtil],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.06)',
                    fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0
                },
                {
                    label: 'Energy (kW)',
                    data: [...trendEng],
                    borderColor: '#f59e0b',
                    backgroundColor: 'transparent',
                    fill: false, tension: 0.4, borderWidth: 2, pointRadius: 0
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true, position: 'top',
                    labels: { font: { size: 10 }, boxWidth: 10, padding: 8 }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    beginAtZero: true, max: 120,
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { size: 10 }, color: '#94a3b8' }
                }
            }
        }
    });
}

// ── UPDATE ALL UI ──────────────────────────────────────────
function renderUI() {
    const eff  = metrics.efficiency;
    const util = metrics.utilization;
    const out  = metrics.output;
    const eng  = metrics.energy;
    const { downtime } = inputs;

    // ── Analytics row (under SVG) ──
    setText('anaOee',  `${eff.toFixed(1)}%`);
    setText('anaUtil', `${util.toFixed(1)}%`);
    setText('anaOut',  `${Math.round(out)} u/hr`);
    setText('anaEng',  `${Math.round(eng)} kW`);

    setColor('anaOee',  eff  < 50 ? '#ef4444' : eff  < 75 ? '#f59e0b' : '#10b981');
    setColor('anaUtil', util < 50 ? '#ef4444' : util < 75 ? '#f59e0b' : '#3b82f6');
    setColor('anaEng',  eng  > 400 ? '#ef4444' : eng  > 300 ? '#f59e0b' : '#0f172a');

    // ── Right status panel ──
    const health = clamp(100 - downtime - (eff < 60 ? 20 : 0), 0, 100);
    setText('sHealth',   `${health.toFixed(0)}%`);
    setColor('sHealth',  health >= 80 ? '#16a34a' : health >= 60 ? '#d97706' : '#dc2626');

    setText('sDowntime', `${downtime}%`);
    setColor('sDowntime', downtime < 10 ? '#16a34a' : downtime < 25 ? '#d97706' : '#dc2626');

    setText('sPower', `${Math.round(eng)} kW`);

    const prodState = eff >= 85 ? 'Optimal' : eff >= 65 ? 'Moderate' : 'Critical';
    setText('sProdState', prodState);
    setColor('sProdState', eff >= 85 ? '#16a34a' : eff >= 65 ? '#d97706' : '#dc2626');

    const alarmText = downtime > 30 ? 'High Downtime!' : eff < 50 ? 'Low Efficiency!' : 'No Alarms';
    setText('sAlarm', alarmText);
    setColor('sAlarm', alarmText === 'No Alarms' ? '#16a34a' : '#dc2626');

    // ── Factory badge & status dot ──
    const isGood = eff >= 65;
    const badge  = get('factoryBadge');
    if (badge) {
        badge.textContent = isGood ? 'OPERATIONAL' : 'DEGRADED';
        badge.className   = `status-chip ${isGood ? 'chip-green' : 'chip-red'}`;
    }
    const dot = get('statusDot');
    if (dot) dot.className = `pulse-dot ${isGood ? 'green' : 'red'}`;

    // ── CNC LED colours ──
    ['led1','led2','led3'].forEach(id => {
        const e = get(id);
        if (e) e.setAttribute('fill', isGood ? '#22c55e' : '#ef4444');
    });

    // ── AI Diagnostic (brief, right panel) ──
    const diagMsg = eff >= 85
        ? `Factory running at ${eff.toFixed(0)}% OEE. All KPIs within optimal range.`
        : eff >= 65
        ? `Moderate efficiency (${eff.toFixed(0)}%). Review downtime probability and power usage.`
        : `⚠ Critical — OEE dropped to ${eff.toFixed(0)}%. Immediate intervention required.`;
    const diagEl = get('aiDiag');
    if (diagEl) {
        diagEl.textContent = diagMsg;
        diagEl.className   = `obs-content${eff < 65 ? ' danger' : eff < 85 ? ' warn' : ''}`;
    }

    // ── AI Recommendations panel ──
    renderAIRecs();

    // ── Zone heatmap ──
    renderHeatmap();

    // ── KPI chart trend push ──
    trendEff.push(eff);   trendEff.shift();
    trendUtil.push(util); trendUtil.shift();
    trendEng.push(eng);   trendEng.shift();
    if (kpiChart) {
        kpiChart.data.datasets[0].data = [...trendEff];
        kpiChart.data.datasets[1].data = [...trendUtil];
        kpiChart.data.datasets[2].data = [...trendEng];
        kpiChart.update('none');
    }

    // ── Status ticker ──
    renderTicker();
}

function renderAIRecs() {
    const { prodRate, downtime } = inputs;
    const eff  = metrics.efficiency;
    const util = metrics.utilization;
    const eng  = metrics.energy;
    const recs = [];

    if (util >= 80)
        recs.push({ d: 'green', t: 'Machine utilization is optimal.' });
    else
        recs.push({ d: 'amber', t: `Utilization at ${util.toFixed(0)}%. Consider increasing machine count.` });

    const outPct = (metrics.output / Math.max(prodRate * (inputs.machineCount / 25), 1)) * 100;
    if (outPct >= 75)
        recs.push({ d: 'green', t: 'Production rate is meeting the target.' });
    else
        recs.push({ d: 'amber', t: `Actual output (${Math.round(metrics.output)} u/hr) is below potential. Tune parameters.` });

    if (eng > 350)
        recs.push({ d: 'amber', t: 'Reduce power usage by scheduling idle machines during low-demand periods.' });
    else
        recs.push({ d: 'green', t: 'Power consumption is within acceptable limits.' });

    if (downtime > 20)
        recs.push({ d: 'red',   t: `High downtime probability (${downtime}%). Predictive maintenance is strongly recommended.` });
    else if (downtime > 5)
        recs.push({ d: 'amber', t: `Downtime at ${downtime}%. Monitor and schedule preventive maintenance.` });
    else
        recs.push({ d: 'green', t: 'Downtime probability is low. System running reliably.' });

    if (eff >= 85)
        recs.push({ d: 'green', t: 'Overall factory performance is healthy.' });
    else if (eff >= 65)
        recs.push({ d: 'amber', t: 'Moderate OEE. Optimize downtime and power to improve efficiency.' });
    else
        recs.push({ d: 'red',   t: `Factory OEE critically low (${eff.toFixed(0)}%). Investigate root cause immediately.` });

    const panel = get('aiRecs');
    if (panel) {
        panel.innerHTML = recs.map(r =>
            `<div class="ai-rec"><span class="ai-dot ${r.d}"></span>${r.t}</div>`
        ).join('');
    }
}

function renderHeatmap() {
    const { prodRate, power, downtime, machineCount } = inputs;
    const zA = clamp((prodRate / 1000) * 100 * (1 - downtime / 100) + (Math.random() * 5 - 2.5), 5, 100);
    const zB = clamp((machineCount / 50) * 100 * (power / 500)      + (Math.random() * 5 - 2.5), 5, 100);
    const zC = clamp(zA * 0.85                                        + (Math.random() * 6 - 3),   5, 100);
    const zD = clamp((prodRate / 1000) * 50                           + (Math.random() * 8 - 4),   5, 100);

    [['A', zA], ['B', zB], ['C', zC], ['D', zD]].forEach(([z, val]) => {
        const col = heatColor(val);
        const barEl  = get(`bar${z}`);
        const valEl  = get(`val${z}`);
        const svgEl  = get(`hz${z}`);
        
        if (barEl)  { barEl.style.width = `${val.toFixed(0)}%`; barEl.style.background = col; }
        if (valEl)    valEl.textContent = `${val.toFixed(0)}%`;
        if (svgEl)  { svgEl.setAttribute('fill', col); svgEl.setAttribute('opacity', '0.5'); }
    });
}

function renderTicker() {
    const msgs = [
        `[ ${timestamp()} ] Factory running — OEE: ${metrics.efficiency.toFixed(1)}% | Output: ${Math.round(metrics.output)} u/hr | Power: ${Math.round(metrics.energy)} kW`,
        `[ ${timestamp()} ] AGV-A & AGV-B on logistics route — delivery cycle nominal`,
        `[ ${timestamp()} ] CNC-01, CNC-02, CNC-03 — spindles running at target RPM`,
        `[ ${timestamp()} ] Zone heatmap updated — Zone B activity: ${Math.round((inputs.machineCount / 50) * 100)}%`,
    ];
    setText('tickerText', msgs[tickCount % msgs.length]);
}

// ── SVG ANIMATION LOOP ─────────────────────────────────────
function startAnimLoop() {
    let lastT = performance.now();

    function loop(t) {
        if (!isRunning) return;
        const dt = Math.min((t - lastT) / 1000, 0.05);
        lastT = t;

        const agvSpd = 70 + (inputs.prodRate / 1000) * 130; // px/s

        // ── AGV A ──
        agvAX += (agvARight ? 1 : -1) * agvSpd * dt;
        if (agvAX > 820) {
            agvARight = false;
            const c = get('cargA'); if (c) c.setAttribute('opacity', '0');
        }
        if (agvAX < 50) {
            agvARight = true;
            const c = get('cargA'); if (c) c.setAttribute('opacity', '1');
        }
        const agvAEl = get('agvA');
        if (agvAEl) agvAEl.setAttribute('transform', `translate(${agvAX.toFixed(1)}, 312)`);

        // ── AGV B ──
        agvBX += (agvBRight ? 1 : -1) * agvSpd * 0.75 * dt;
        if (agvBX > 820) agvBRight = false;
        if (agvBX < 50)  agvBRight = true;
        const agvBEl = get('agvB');
        if (agvBEl) agvBEl.setAttribute('transform', `translate(${agvBX.toFixed(1)}, 358)`);

        // ── Spindle rotation ──
        spindleAngle = (spindleAngle + (inputs.prodRate / 300) * dt * 200) % 360;
        [[66, 71], [156, 71], [246, 71]].forEach(([cx, cy], i) => {
            const g = get(`spindleGroup${i + 1}`);
            if (g) g.setAttribute('transform', `rotate(${spindleAngle.toFixed(1)}, ${cx}, ${cy})`);
        });

        // ── Beacon pulse ──
        const bOpacity = (0.5 + 0.5 * Math.abs(Math.sin(t / 750))).toFixed(2);
        for (let i = 1; i <= 7; i++) {
            const b = get(`b${i}`);
            if (b) b.setAttribute('opacity', bOpacity);
        }

        // ── Conveyor belt seam lines ──
        document.querySelectorAll('.seam').forEach(line => {
            let x = parseFloat(line.getAttribute('x1')) || 0;
            x += (inputs.prodRate / 300) * dt * 50;
            if (x > 880) x -= 840;
            line.setAttribute('x1', x.toFixed(1));
            line.setAttribute('x2', x.toFixed(1));
        });

        // ── Conveyor products ──
        const cpGroup = get('conveyorProducts');
        if (cpGroup) {
            // Spawn new product
            if (Math.random() < (inputs.prodRate / 1000) * 0.07) {
                conveyorProducts.push({ x: 40, col: Math.random() > 0.5 ? '#fbbf24' : '#f97316' });
            }
            // Move existing products & rebuild SVG children
            cpGroup.innerHTML = '';
            const beltSpd = (inputs.prodRate / 300) * 50 * dt;
            for (let i = conveyorProducts.length - 1; i >= 0; i--) {
                conveyorProducts[i].x += beltSpd;
                if (conveyorProducts[i].x > 880) { conveyorProducts.splice(i, 1); continue; }
                const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                r.setAttribute('x',            conveyorProducts[i].x.toFixed(1));
                r.setAttribute('y',            '174');
                r.setAttribute('width',        '24');
                r.setAttribute('height',       '24');
                r.setAttribute('rx',           '4');
                r.setAttribute('fill',         conveyorProducts[i].col);
                r.setAttribute('stroke',       '#b45309');
                r.setAttribute('stroke-width', '1');
                cpGroup.appendChild(r);
            }
        }

        // ── Robotic arm oscillation ──
        robotT += dt;
        const armAngle = Math.sin(robotT * 2.2) * 28;

        // Robot 1
        const ra1  = get('ra1');
        const ra1b = get('ra1b');
        const tool1= get('tool1');
        if (ra1)   ra1.setAttribute('transform',  `rotate(${armAngle.toFixed(1)}, 337, 96)`);
        if (ra1b)  ra1b.setAttribute('transform', `rotate(${armAngle.toFixed(1)}, 337, 96)`);
        if (tool1) {
            const rad = (armAngle * Math.PI) / 180;
            tool1.setAttribute('cx', (337 + 25 * Math.sin(rad)).toFixed(1));
            tool1.setAttribute('cy', (96 - 38 - 25 * (Math.cos(rad) - 1)).toFixed(1));
        }

        // Robot 2 (opposite phase)
        const ra2  = get('ra2');
        const ra2b = get('ra2b');
        if (ra2)  ra2.setAttribute('transform',  `rotate(${(-armAngle).toFixed(1)}, 477, 96)`);
        if (ra2b) ra2b.setAttribute('transform', `rotate(${(-armAngle).toFixed(1)}, 477, 96)`);

        animFrame = requestAnimationFrame(loop);
    }

    animFrame = requestAnimationFrame(loop);
}

// ── SIMULATION TICK (every 2 s) ────────────────────────────
function tick() {
    tickCount++;
    computeMetrics();
    renderUI();
}

// ── BUTTON EVENTS ──────────────────────────────────────────
function initButtons() {
    const runBtn    = get('runBtn');
    const pauseBtn  = get('pauseBtn');
    const resetBtn  = get('resetBtn');
    const logBtn    = get('logBtn');
    const logBtn2   = get('logBtn2');
    const exportBtn = get('exportCsvBtn');
    const exportBtn2= get('exportBtn');

    if (runBtn) runBtn.addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;
        runBtn.disabled  = true;
        if (pauseBtn) pauseBtn.disabled = false;

        const lb = get('liveBadge');
        if (lb) { lb.className = 'live-badge running'; lb.innerHTML = '<span class="pulse"></span> LIVE'; }

        setText('statusText',     'RUNNING');
        setText('sMachineStatus', 'Running');
        setColor('sMachineStatus', '#16a34a');

        tick();
        simInterval = setInterval(tick, 2000);
        startAnimLoop();
    });

    if (pauseBtn) pauseBtn.addEventListener('click', () => {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(simInterval);
        cancelAnimationFrame(animFrame);
        if (runBtn) runBtn.disabled = false;
        pauseBtn.disabled = true;

        const lb = get('liveBadge');
        if (lb) { lb.className = 'live-badge'; lb.innerHTML = '<span class="pulse"></span> PAUSED'; }
        setText('statusText', 'PAUSED');
    });

    if (resetBtn) resetBtn.addEventListener('click', () => {
        isRunning = false;
        clearInterval(simInterval);
        cancelAnimationFrame(animFrame);
        if (runBtn)   runBtn.disabled   = false;
        if (pauseBtn) pauseBtn.disabled = true;

        const lb = get('liveBadge');
        if (lb) { lb.className = 'live-badge'; lb.innerHTML = '<span class="pulse"></span> OFFLINE'; }

        const dot = get('statusDot');
        if (dot) dot.className = 'pulse-dot green';
        setText('statusText', 'OFFLINE');

        // Reset inputs & sliders
        inputs = { machineCount: 12, prodRate: 450, power: 250, downtime: 10 };
        [['machineSlider','machineValue', 12],
         ['prodSlider',   'prodValue',   450],
         ['powerSlider',  'powerValue',  250],
         ['downtimeSlider','downtimeValue',10]
        ].forEach(([sid, vid, val]) => {
            const s = get(sid); if (s) s.value = val;
            setText(vid, val);
        });

        metrics = { efficiency: 0, utilization: 0, output: 0, energy: 0 };
        thermalStress = 0;
        conveyorProducts = [];
        trendEff.fill(0); trendUtil.fill(0); trendEng.fill(0);
        agvAX = 50; agvBX = 450;
        tickCount = 0; runCount = 0;
        const lt = get('logTable'); if (lt) lt.innerHTML = '';

        ['anaOee','anaUtil','anaOut','anaEng'].forEach(id => setText(id, '--'));
        setText('tickerText', '[ System Reset — press Run Simulation to begin ]');

        const badge = get('factoryBadge');
        if (badge) { badge.textContent = 'OPERATIONAL'; badge.className = 'status-chip chip-green'; }
    });

    [logBtn, logBtn2].forEach(b => { if (b) b.addEventListener('click', addLogRow); });
    [exportBtn, exportBtn2].forEach(b => { if (b) b.addEventListener('click', exportCSV); });
}

// ── INTERVENTION BUTTONS ───────────────────────────────────
function initInterventions() {
    document.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Applied';
            btn.classList.add('btn-success-flash');
            setTimeout(() => {
                btn.innerHTML = orig;
                btn.classList.remove('btn-success-flash');
            }, 1400);

            if (action === 'maintenance') {
                inputs.downtime = Math.max(0, inputs.downtime - 10);
                const s = get('downtimeSlider'); if (s) s.value = inputs.downtime;
                setText('downtimeValue', inputs.downtime);
            }
            if (action === 'optimize') {
                inputs.power = clamp(inputs.power - 30, 10, 500);
                const s = get('powerSlider'); if (s) s.value = inputs.power;
                setText('powerValue', inputs.power);
            }
            if (isRunning) { computeMetrics(); renderUI(); }
        });
    });
}

// ── LOG TABLE ──────────────────────────────────────────────
function addLogRow() {
    if (!isRunning && runCount === 0) return;
    runCount++;
    const eff = metrics.efficiency;
    const cls = eff >= 85 ? 'optimal' : eff >= 70 ? 'good' : eff >= 55 ? 'warning' : 'high-down';
    const lbl = eff >= 85 ? 'Optimal'  : eff >= 70 ? 'Good'  : eff >= 55 ? 'Warning'  : 'High Downtime';

    logData.push({
        run: runCount,
        mc:  inputs.machineCount,
        pr:  inputs.prodRate,
        eff: eff.toFixed(0),
        pw:  Math.round(metrics.energy),
        dt:  inputs.downtime,
        lbl, cls
    });
    if (logData.length > 50) logData.shift();

    const lt = get('logTable');
    if (lt) {
        lt.innerHTML = logData.map(r =>
            `<tr>
                <td>${r.run}</td><td>${r.mc}</td><td>${r.pr}</td>
                <td>${r.eff}</td><td>${r.pw}</td><td>${r.dt}</td>
                <td><span class="sbadge ${r.cls}">${r.lbl}</span></td>
            </tr>`
        ).join('');
    }
}

function exportCSV() {
    if (!logData.length) return;
    const header = 'Run,Machine Count,Production Rate,Efficiency,Power Usage,Downtime,Status\n';
    const rows   = logData.map(r =>
        `${r.run},${r.mc},${r.pr},${r.eff},${r.pw},${r.dt},${r.lbl}`
    ).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([header + rows], { type: 'text/csv' }));
    a.download = 'factory_twin_log.csv';
    a.click();
}

// ── SVG TABS ───────────────────────────────────────────────
function switchTab(btn) {
    document.querySelectorAll('.svg-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    
    // Toggle explicit tab layers (sensors, power)
    document.querySelectorAll('.tab-layer').forEach(layer => {
        layer.style.display = (layer.dataset.tab === tab) ? '' : 'none';
    });

    // Handle generic highlights
    const highlights = {
        'all': ['cnc1', 'cnc2', 'cnc3', 'robot1', 'robot2'],
        'conveyor': ['beltSeams', 'conveyorProducts', 'sensor1', 'sensor2', 'sensor3'],
        'agvs': ['agvA', 'agvB'],
        'storage': ['rack1', 'rack2']
    };

    const allZoneIds = Object.values(highlights).flat();
    
    if (highlights[tab]) {
        allZoneIds.forEach(id => {
            const el = get(id);
            if (el) el.style.opacity = highlights[tab].includes(id) ? '1' : '0.25';
        });
    } else {
        allZoneIds.forEach(id => {
            const el = get(id);
            if (el) el.style.opacity = '1';
        });
    }
}

// ── BOOTSTRAP ─────────────────────────────────────────────
// Wait for DOM to be fully ready before touching any elements
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    initSliders();
    initButtons();
    initInterventions();
});
