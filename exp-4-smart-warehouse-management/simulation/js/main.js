// State variable tracking
let runCount = 0;
let historyLog = [];
let chartInstance = null;
let animationFrameId = null;
let activeAGVs = []; // Array of dynamically spawned AGV nodes and states
let agvAnimationState = {
    active: false,
    x: 90,
    y: 240,
    targetX: 90,
    targetY: 240,
    speed: 5,
    pathIndex: 0,
    path: [],
    cargo: false,
    stateStr: 'IDLE'
};

// DOM Controls
const capacityInput = document.getElementById("capacity");
const ordersInput = document.getElementById("orders");
const speedInput = document.getElementById("speed");
const fleetInput = document.getElementById("fleet");
const algorithmInput = document.getElementById("algorithm");
const thresholdInput = document.getElementById("threshold");

const capacityVal = document.getElementById("capacityValue");
const ordersVal = document.getElementById("ordersValue");
const speedVal = document.getElementById("speedValue");
const fleetVal = document.getElementById("fleetValue");
const thresholdVal = document.getElementById("thresholdValue");

const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const exportCsvBtnBottom = document.getElementById("exportCsvBtnBottom");

// DOM KPIs & Analytics
const efficiencyText = document.getElementById("efficiency");
const pendingOrdersText = document.getElementById("pendingOrders");
const storageHealthText = document.getElementById("storageHealth");
const liveClock = document.getElementById("liveClock");
const headerStatusDot = document.getElementById("headerStatusDot");
const headerStatusText = document.getElementById("headerStatusText");

// Gauge & Inferred DOM
const gaugeProgressRing = document.getElementById("gaugeProgressRing");
const gaugePctText = document.getElementById("gaugePctText");
const inferredStorage = document.getElementById("inferredStorage");
const inferredAGV = document.getElementById("inferredAGV");
const inferredTime = document.getElementById("inferredTime");
const inferredPending = document.getElementById("inferredPending");
const traceTerminal = document.getElementById("traceTerminal");

// Heatmap DOM
const zone1 = document.getElementById("zone1");
const zone2 = document.getElementById("zone2");
const zone3 = document.getElementById("zone3");
const zone4 = document.getElementById("zone4");
const zoneAVal = document.getElementById("zoneAVal");
const zoneBVal = document.getElementById("zoneBVal");
const zoneCVal = document.getElementById("zoneCVal");
const zoneDVal = document.getElementById("zoneDVal");

// SVG elements
const svgRackAFill = document.getElementById("svgRackAFill");
const svgRackBFill = document.getElementById("svgRackBFill");
const svgRackCFill = document.getElementById("svgRackCFill");
const svgRackDFill = document.getElementById("svgRackDFill");
const svgRackAPct = document.getElementById("svgRackAPct");
const svgRackBPct = document.getElementById("svgRackBPct");
const svgRackCPct = document.getElementById("svgRackCPct");
const svgRackDPct = document.getElementById("svgRackDPct");

const svgAGV = document.getElementById("svgAGV");
const agvStatusLED = document.getElementById("agvStatusLED");
const agvCargo = document.getElementById("agvCargo");
const agvBase = document.getElementById("agvBase");
const warehouseSvg = document.getElementById("warehouseSvg");

const logTable = document.getElementById("logTable");

// Previous Run Metrics for Trend arrow calculations
let prevStorageUtil = null;
let prevAGVUtil = null;
let prevEfficiency = null;
let prevProcTime = null;

// Clock updates
function updateClock() {
    const now = new Date();
    if (liveClock) liveClock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Sliders Event Listeners
capacityInput.addEventListener("input", () => capacityVal.textContent = capacityInput.value);
ordersInput.addEventListener("input", () => ordersVal.textContent = ordersInput.value);
speedInput.addEventListener("input", () => speedVal.textContent = speedInput.value);
fleetInput.addEventListener("input", () => fleetVal.textContent = fleetInput.value);
thresholdInput.addEventListener("input", () => thresholdVal.textContent = thresholdInput.value);

// Initialize Chart.js
function initializeChart() {
    const ctx = document.getElementById('kpiTrendChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Storage Util (%)',
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    data: [],
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#3b82f6'
                },
                {
                    label: 'AGV Util (%)',
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                    data: [],
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#a855f7'
                },
                {
                    label: 'Efficiency (%)',
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    data: [],
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#10b981'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 10, font: { size: 9 }, padding: 12 }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: { font: { size: 9 }, stepSize: 25 },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    ticks: { font: { size: 9 } },
                    grid: { color: '#f1f5f9' }
                }
            }
        }
    });
}
initializeChart();

// Update circular efficiency gauge
function updateCircularGauge(pct) {
    gaugePctText.textContent = pct + "%";
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    gaugeProgressRing.style.strokeDashoffset = offset;
    
    // Color gauge conditionally
    if (pct >= 80) {
        gaugeProgressRing.style.stroke = "#10b981";
    } else if (pct >= 55) {
        gaugeProgressRing.style.stroke = "#f59e0b";
    } else {
        gaugeProgressRing.style.stroke = "#ef4444";
    }
}

// Log Terminal Print utility
function printTrace(line, type = 'info') {
    const traceLine = document.createElement("div");
    traceLine.className = "trace-line";
    if (type === 'math') {
        traceLine.style.color = '#38bdf8';
    } else if (type === 'warning') {
        traceLine.style.color = '#fbbf24';
    } else if (type === 'danger') {
        traceLine.style.color = '#f87171';
    } else {
        traceLine.style.color = '#a7f3d0';
    }
    traceLine.textContent = `> ${line}`;
    traceTerminal.appendChild(traceLine);
    traceTerminal.scrollTop = traceTerminal.scrollHeight;
}

// Update Heatmap colors based on utilization
function updateHeatmap(util, agvUtil) {
    const zones = [
        { card: zone1, val: zoneAVal, valPct: util },
        { card: zone2, val: zoneBVal, valPct: Math.round(util * 0.9) },
        { card: zone3, val: zoneCVal, valPct: Math.round(agvUtil * 0.8) },
        { card: zone4, val: zoneDVal, valPct: Math.round(agvUtil * 0.6) }
    ];

    zones.forEach(z => {
        z.val.textContent = z.valPct + "%";
        z.card.style.transition = "background-color 0.5s ease";
        if (z.valPct < 60) {
            z.card.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
            z.card.style.borderColor = "rgba(16, 185, 129, 0.3)";
            z.card.querySelector("strong").style.color = "#10b981";
        } else if (z.valPct < 85) {
            z.card.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
            z.card.style.borderColor = "rgba(245, 158, 11, 0.3)";
            z.card.querySelector("strong").style.color = "#f59e0b";
        } else {
            z.card.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            z.card.style.borderColor = "rgba(239, 68, 68, 0.3)";
            z.card.querySelector("strong").style.color = "#ef4444";
        }
    });
}

// Generate smart text recommendations
function updateRecommendations(util, agvUtil, pending, orders, threshold) {
    let recs = [];
    if (util >= 85) {
        recs.push("⚠️ CRITICAL STORAGE: Capacity utilization exceeds 85%. Trigger immediate outbound routing or expansion of storage zones.");
    } else if (util >= 60) {
        recs.push("📊 MONITOR STORAGE: Warehouse is filling up. Prepare to restrict incoming non-critical batches.");
    } else {
        recs.push("✅ STORAGE EFFICIENT: Optimal storage volume. Racks are functioning with adequate safety buffers.");
    }

    if (agvUtil > 80) {
        recs.push("🤖 AGV CONGESTION: Fleet is overloaded (>80%). Increase AGV Speed or dispatch extra vehicles.");
    }

    if (orders < threshold) {
        recs.push("📦 LOW STOCK ALERT: Incoming orders below threshold. Auto-replenishment signal sent.");
    }

    if (pending > 0) {
        recs.push(`🔄 PENDING: Queue has ${pending} stuck jobs. Boost material handling speed.`);
    }

    if (recs.length === 0) {
        recs.push("✅ SYSTEM STABLE: All components running within nominal range.");
    }

    document.getElementById("observation").innerHTML = recs.map(r => `• ${r}`).join("<br><br>");
}

// Conveyor belt visual states
function updateConveyorVisuals(active, speedVal) {
    const belt = document.getElementById("conveyorMovingBelt");
    const belt2 = document.getElementById("conveyorMovingBelt2");
    if (active) {
        warehouseSvg.classList.add("running");
        const duration = `${1.5 / speedVal}s`;
        belt.style.animationDuration = duration;
        if (belt2) belt2.style.animationDuration = duration;
    } else {
        warehouseSvg.classList.remove("running");
    }
}

// Setup dynamic paths and tick loops for all active AGVs
function tickAGV() {
    let anyActive = false;
    activeAGVs.forEach(agv => {
        if (agv.delay > 0) {
            agv.delay--;
            anyActive = true;
            return;
        }

        const dx = agv.targetX - agv.x;
        const dy = agv.targetY - agv.y;
        const distance = Math.hypot(dx, dy);
        const step = (agvAnimationState.speed * 0.8) + 1.5;

        if (distance <= step) {
            agv.x = agv.targetX;
            agv.y = agv.targetY;

            agv.pathIndex++;
            if (agv.pathIndex >= agv.path.length) {
                agv.pathIndex = 0;
            }

            const nextNode = agv.path[agv.pathIndex];
            agv.targetX = nextNode.x;
            agv.targetY = nextNode.y;
            agv.cargo = nextNode.cargo;
        } else {
            agv.x += (dx / distance) * step;
            agv.y += (dy / distance) * step;
        }

        agv.element.setAttribute("transform", `translate(${agv.x}, ${agv.y})`);

        // Rotate arrow indicator
        if (agv.arrowEl) {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) agv.arrowEl.setAttribute("transform", "rotate(90)");
                else agv.arrowEl.setAttribute("transform", "rotate(-90)");
            } else if (Math.abs(dy) > Math.abs(dx)) {
                if (dy > 0) agv.arrowEl.setAttribute("transform", "rotate(180)");
                else agv.arrowEl.setAttribute("transform", "rotate(0)");
            }
        }

        // Update cargo box display
        if (agv.cargoEl) {
            agv.cargoEl.style.display = agv.cargo ? "block" : "none";
        }

        // Update LEDs and stroke colors
        if (agv.ledEl && agv.baseEl) {
            if (agvAnimationState.stateStr === 'OVERLOADED') {
                agv.ledEl.setAttribute("fill", "#ef4444");
                agv.baseEl.setAttribute("stroke", "#ef4444");
            } else if (agvAnimationState.stateStr === 'ACTIVE') {
                agv.ledEl.setAttribute("fill", "#3b82f6");
            } else {
                agv.ledEl.setAttribute("fill", "#94a3b8");
                agv.baseEl.setAttribute("stroke", "#cbd5e1");
            }
        }
        anyActive = true;
    });

    if (anyActive) {
        animationFrameId = requestAnimationFrame(tickAGV);
    }
}

// Compute trend badge
function renderTrendBadge(curr, prev, unit = "") {
    if (prev === null) return "";
    const diff = curr - prev;
    if (diff > 0) {
        return `<span class="trend-badge trend-up"><i class="fa-solid fa-arrow-trend-up"></i> +${diff.toFixed(1)}${unit}</span>`;
    } else if (diff < 0) {
        return `<span class="trend-badge trend-down"><i class="fa-solid fa-arrow-trend-down"></i> ${diff.toFixed(1)}${unit}</span>`;
    } else {
        return `<span class="trend-badge" style="color: var(--muted); font-size:9px;"><i class="fa-solid fa-minus"></i> 0${unit}</span>`;
    }
}

// Main simulation logic
function runSimulation() {
    const cap = Number(capacityInput.value);
    const ord = Number(ordersInput.value);
    const spd = Number(speedInput.value);
    const flt = Number(fleetInput.value);
    const algo = algorithmInput.value;
    const th = Number(thresholdInput.value);

    // Mathematical formula evaluations
    const utilization = Math.min(100, Math.round((ord / cap) * 100));
    const agvUtil = Math.min(100, Math.round(ord / (flt * spd * 10)));
    
    let algoMultiplier = 1.0;
    if (algo === 'nearest') {
        algoMultiplier = 0.8;
    } else if (algo === 'balanced') {
        algoMultiplier = 0.9;
    }
    const procTime = Number((ord / (flt * spd * 20) * algoMultiplier).toFixed(1));
    const pending = Math.max(0, ord - (flt * spd * 60));

    // Efficiency calculation
    const baseEfficiency = 100 - (utilization * 0.3);
    let penaltyAGV = 0;
    let penaltyTime = 0;

    if (agvUtil > 80) penaltyAGV = 12;
    if (procTime > 5) penaltyTime = 8;

    // Algorithm routing efficiency bonuses
    let algoBonus = 0;
    if (algo === 'nearest') algoBonus = 5;
    else if (algo === 'balanced') algoBonus = 3;

    const finalEfficiency = Math.max(40, Math.min(100, Math.round(baseEfficiency - penaltyAGV - penaltyTime + algoBonus)));

    // Terminal Trace logs
    traceTerminal.innerHTML = "";
    printTrace("Initializing diagnostic calculation matrix...");
    printTrace(`INPUTS: Cap=${cap}, Orders=${ord}, Fleet=${flt}, Speed=${spd} m/s, Algo=${algo.toUpperCase()}, Thr=${th}`, 'info');
    
    printTrace(`Step 1: Storage Utilization`, 'math');
    printTrace(`  Util = min(100, (${ord}/${cap})*100) = ${utilization}%`, 'math');
    
    printTrace(`Step 2: Fleet Dynamics (Fleet Size = ${flt}, Routing = ${algo.toUpperCase()})`, 'math');
    printTrace(`  AGV Util = min(100, ${ord}/(${flt}*${spd}*10)) = ${agvUtil}%`, 'math');
    printTrace(`  Proc Time = (${ord}/(${flt}*${spd}*20)) * ${algoMultiplier} = ${procTime} min`, 'math');
    
    printTrace(`Step 3: Efficiency η`, 'math');
    printTrace(`  Base η = 100-(${utilization}*0.3) = ${(100 - utilization * 0.3).toFixed(1)}%`, 'math');
    if (penaltyAGV > 0) printTrace(`  [PENALTY] AGV overloaded (>80%): -12%`, 'danger');
    if (penaltyTime > 0) printTrace(`  [PENALTY] Proc time >5min: -8%`, 'danger');
    if (algoBonus > 0) printTrace(`  [BONUS] ${algo.toUpperCase()} routing efficiency: +${algoBonus}%`, 'info');
    printTrace(`  Final η = ${finalEfficiency}%`, 'math');

    // Determine state
    let stateStr = 'NORMAL';
    let statusClass = 'green';
    let agvStateStr = 'IDLE';

    if (utilization >= 85) {
        stateStr = 'CONGESTED';
        statusClass = 'red';
    } else if (utilization >= 60 || agvUtil > 80) {
        stateStr = 'BUSY';
        statusClass = 'amber';
    }

    if (agvUtil > 80) {
        agvStateStr = 'OVERLOADED';
    } else if (agvUtil >= 40) {
        agvStateStr = 'ACTIVE';
    }

    // Update header status
    headerStatusText.textContent = stateStr;
    headerStatusDot.className = `pulse-dot ${statusClass}`;
    
    if (ord < th) {
        printTrace("Warning: Low stock threshold triggered!", 'warning');
    }
    printTrace("AGVs dispatched. Processing warehouse flow...");

    // Update inferred values
    inferredStorage.innerHTML = `${utilization}% ${renderTrendBadge(utilization, prevStorageUtil, "%")}`;
    inferredAGV.innerHTML = `${agvUtil}% ${renderTrendBadge(agvUtil, prevAGVUtil, "%")}`;
    inferredTime.innerHTML = `${procTime} min ${renderTrendBadge(procTime, prevProcTime, "m")}`;
    inferredPending.innerHTML = `${pending} ${renderTrendBadge(pending, prevPendingOrders(), "")}`;

    // Update tracking
    prevStorageUtil = utilization;
    prevAGVUtil = agvUtil;
    prevEfficiency = finalEfficiency;
    prevProcTime = procTime;

    // Analytics cards
    efficiencyText.textContent = `${finalEfficiency}%`;
    pendingOrdersText.textContent = pending;
    storageHealthText.textContent = (utilization >= 85) ? "Critical" : (utilization >= 60) ? "Warning" : "Optimal";

    // SVG Rack fill updates (using new dimensions: fill bar is 170px wide)
    const fillA = utilization;
    const fillB = Math.round(utilization * 0.9);
    const fillC = Math.round(utilization * 0.75);
    const fillD = Math.round(utilization * 0.6);

    const updateRackVisual = (fill, bar, text) => {
        const pixelWidth = (fill / 100) * 170;
        bar.setAttribute("width", pixelWidth);
        text.textContent = fill + "%";
        if (fill >= 85) {
            bar.setAttribute("fill", "#ef4444");
        } else if (fill >= 60) {
            bar.setAttribute("fill", "#f59e0b");
        } else {
            bar.setAttribute("fill", "#10b981");
        }
    };

    updateRackVisual(fillA, svgRackAFill, svgRackAPct);
    updateRackVisual(fillB, svgRackBFill, svgRackBPct);
    updateRackVisual(fillC, svgRackCFill, svgRackCPct);
    updateRackVisual(fillD, svgRackDFill, svgRackDPct);

    // Clear existing dynamic AGVs in DOM
    const dynamicAgvs = warehouseSvg.querySelectorAll('[data-dynamic-agv]');
    dynamicAgvs.forEach(el => el.remove());
    activeAGVs = [];

    // Start dynamic AGV spawn and animations
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    agvAnimationState.speed = spd;
    agvAnimationState.stateStr = agvStateStr;

    const template = document.getElementById("svgAGV");
    const zonesList = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < flt; i++) {
        const clone = template.cloneNode(true);
        clone.id = `dynamic-agv-${i}`;
        clone.setAttribute('class', 'dynamic-agv');
        clone.setAttribute('data-dynamic-agv', 'true');
        clone.removeAttribute("display");
        
        // Rename child IDs to avoid DOM duplicates
        const idMap = { agvBase: `agvBase-${i}`, agvCargo: `agvCargo-${i}`, agvArrow: `agvArrow-${i}`, agvStatusLED: `agvStatusLED-${i}` };
        Object.entries(idMap).forEach(([oldId, newId]) => {
            const el = clone.querySelector(`#${oldId}`);
            if (el) el.id = newId;
        });

        // Stagger visual starting outline colors to distinguish AGVs
        const colors = ["#3b82f6", "#10b981", "#fbbf24", "#ef4444", "#a855f7"];
        const base = clone.querySelector(`#agvBase-${i}`);
        if (base) base.setAttribute("stroke", colors[i % colors.length]);
        
        warehouseSvg.appendChild(clone);
        
        // Choose target storage zone depending on algorithm
        let targetZone = 'A';
        if (algo === 'balanced') {
            targetZone = zonesList[i % zonesList.length];
        } else {
            targetZone = zonesList[Math.floor(Math.random() * zonesList.length)];
        }
        
        let rackCoord = { x: 275, y: 85 };
        if (targetZone === 'B') rackCoord = { x: 525, y: 85 };
        else if (targetZone === 'C') rackCoord = { x: 275, y: 395 };
        else if (targetZone === 'D') rackCoord = { x: 525, y: 395 };
        
        const path = [
            { x: 90, y: 240, cargo: true },
            { x: rackCoord.x, y: 240, cargo: true },
            { x: rackCoord.x, y: rackCoord.y, cargo: true },
            { x: rackCoord.x, y: 240, cargo: false },
            { x: 500, y: 240, cargo: false },
            { x: 710, y: 240, cargo: true },
            { x: 90, y: 240, cargo: false }
        ];
        
        activeAGVs.push({
            element: clone,
            x: 90,
            y: 240,
            targetX: path[0].x,
            targetY: path[0].y,
            pathIndex: 0,
            path: path,
            cargo: path[0].cargo,
            delay: i * 35, // Staggered start delay in frames
            cargoEl: clone.querySelector(`#agvCargo-${i}`),
            arrowEl: clone.querySelector(`#agvArrow-${i}`),
            ledEl: clone.querySelector(`#agvStatusLED-${i}`),
            baseEl: clone.querySelector(`#agvBase-${i}`)
        });
    }

    tickAGV();
    updateConveyorVisuals(true, spd);

    // Update Gauge, Heatmap, Recommendations
    updateCircularGauge(finalEfficiency);
    updateHeatmap(utilization, agvUtil);
    updateRecommendations(utilization, agvUtil, pending, ord, th);

    // Add to history log table
    runCount++;
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>#${runCount}</td>
        <td>${cap}</td>
        <td>${ord}</td>
        <td>${spd}</td>
        <td>${flt}</td>
        <td>${algo.toUpperCase()}</td>
        <td>${th}</td>
        <td>${utilization}%</td>
        <td>${agvUtil}%</td>
        <td>${procTime}m</td>
        <td><strong style="color: ${finalEfficiency >= 80 ? '#10b981' : finalEfficiency >= 55 ? '#f59e0b' : '#ef4444'}">${finalEfficiency}%</strong></td>
        <td><span class="status-badge ${statusClass}">${stateStr}</span></td>
    `;
    logTable.appendChild(row);

    historyLog.push({
        run: runCount, capacity: cap, orders: ord, speed: spd, fleet: flt, algorithm: algo, threshold: th,
        storageUtil: utilization, agvUtil: agvUtil, procTime: procTime,
        efficiency: finalEfficiency, state: stateStr, pending: pending
    });

    // Update chart
    chartInstance.data.labels.push(`#${runCount}`);
    chartInstance.data.datasets[0].data.push(utilization);
    chartInstance.data.datasets[1].data.push(agvUtil);
    chartInstance.data.datasets[2].data.push(finalEfficiency);
    chartInstance.update();
}

function prevPendingOrders() {
    if (historyLog.length === 0) return null;
    return historyLog[historyLog.length - 1].pending;
}

// Reset everything
function resetSimulation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    // Clear dynamic AGVs
    const dynamicAgvs = warehouseSvg.querySelectorAll('[data-dynamic-agv]');
    dynamicAgvs.forEach(el => el.remove());
    activeAGVs = [];

    capacityInput.value = 500;
    ordersInput.value = 200;
    speedInput.value = 5;
    fleetInput.value = 1;
    algorithmInput.value = "fifo";
    thresholdInput.value = 100;

    capacityVal.textContent = 500;
    ordersVal.textContent = 200;
    speedVal.textContent = 5;
    fleetVal.textContent = 1;
    thresholdVal.textContent = 100;

    efficiencyText.textContent = "100%";
    pendingOrdersText.textContent = "0";
    storageHealthText.textContent = "Optimal";
    headerStatusText.textContent = "NORMAL";
    headerStatusDot.className = "pulse-dot green";

    updateCircularGauge(100);
    inferredStorage.textContent = "0%";
    inferredAGV.textContent = "0%";
    inferredTime.textContent = "0 min";
    inferredPending.textContent = "0";

    prevStorageUtil = null;
    prevAGVUtil = null;
    prevEfficiency = null;
    prevProcTime = null;

    svgRackAFill.setAttribute("width", 0);
    svgRackBFill.setAttribute("width", 0);
    svgRackCFill.setAttribute("width", 0);
    svgRackDFill.setAttribute("width", 0);
    svgRackAPct.textContent = "0%";
    svgRackBPct.textContent = "0%";
    svgRackCPct.textContent = "0%";
    svgRackDPct.textContent = "0%";

    agvAnimationState = {
        active: false,
        x: 90,
        y: 240,
        targetX: 90,
        targetY: 240,
        speed: 5,
        pathIndex: 0,
        path: [],
        cargo: false,
        stateStr: 'IDLE'
    };
    svgAGV.setAttribute("transform", "translate(90, 240)");
    agvCargo.style.display = "none";
    agvStatusLED.setAttribute("fill", "#22c55e");
    agvBase.setAttribute("stroke", "#3b82f6");
    updateConveyorVisuals(false, 5);

    updateHeatmap(0, 0);

    document.getElementById("observation").textContent = "Configure warehouse parameters and run the simulation to receive intelligent recommendations.";

    traceTerminal.innerHTML = '<div class="trace-line">> System initialized. Awaiting parameters.</div>';

    historyLog = [];
    runCount = 0;
    logTable.innerHTML = "";
    chartInstance.data.labels = [];
    chartInstance.data.datasets.forEach(dataset => dataset.data = []);
    chartInstance.update();
}

// Export CSV
function exportToCSV() {
    if (historyLog.length === 0) {
        alert("No simulation runs recorded in this session.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Run #,Capacity,Incoming Orders,AGV Speed,Fleet Size,Algorithm,Inventory Threshold,Storage Util (%),AGV Util (%),Proc Time (min),Efficiency (%),Warehouse State\n";

    historyLog.forEach(row => {
        csvContent += `${row.run},${row.capacity},${row.orders},${row.speed},${row.fleet},${row.algorithm.toUpperCase()},${row.threshold},${row.storageUtil},${row.agvUtil},${row.procTime},${row.efficiency},${row.state}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `warehouse_simulation_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

runBtn.addEventListener("click", runSimulation);
resetBtn.addEventListener("click", resetSimulation);
exportCsvBtn.addEventListener("click", exportToCSV);
exportCsvBtnBottom.addEventListener("click", exportToCSV);

// Initialize
resetSimulation();