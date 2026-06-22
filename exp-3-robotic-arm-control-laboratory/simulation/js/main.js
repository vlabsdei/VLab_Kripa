// DOM Elements: Inputs
const theta1 = document.getElementById("theta1");
const theta2 = document.getElementById("theta2");
const armLength = document.getElementById("armLength");
const payload = document.getElementById("payload");
const theta1Num = document.getElementById("theta1Num");
const theta2Num = document.getElementById("theta2Num");
const lengthNum = document.getElementById("lengthNum");
const payloadNum = document.getElementById("payloadNum");

const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const recordBtn = document.getElementById("recordBtn");
const clearLogBtn = document.getElementById("clearLogBtn");

// DOM Elements: Advanced Analytics
const valX = document.getElementById("valX");
const valY = document.getElementById("valY");
const valStab = document.getElementById("valStab");
const valTorque = document.getElementById("valTorque");
const valAcc = document.getElementById("valAcc");

// DOM Elements: SVG & Plotter
const fullRobot = document.getElementById("fullRobot");
const link1Group = document.getElementById("link1Group");
const link2Group = document.getElementById("link2Group");
const link1Body = document.getElementById("link1Body");
const link2Body = document.getElementById("link2Body");
const gripperGroup = document.getElementById("gripperGroup");
const pathTrace = document.getElementById("pathTrace");
const logTable = document.getElementById("logTable");

// DOM Elements: Live Angle Badges & SVG Overlay
const badge1 = document.getElementById("badge1");
const badge2 = document.getElementById("badge2");
const overlayT1 = document.getElementById("overlayT1");
const overlayT2 = document.getElementById("overlayT2");

const canvas = document.getElementById("oscilloscope");
const canvasContainer = document.getElementById("canvasContainer");
const ctx = canvas.getContext("2d");
const advisorBody = document.getElementById("advisorBody");

// State
let currentT1 = 45;
let currentT2 = 45;
let tracePoints = [];
let oscData = [];
let logData = [];
let animationFrameId = null;
let activeFaults = { overload: false, friction: false, payloadShift: false };
let runCount = 1;

// Binding Inputs
function syncInputs(source, target) { target.value = source.value; updateLiveState(); }
theta1.addEventListener("input", () => syncInputs(theta1, theta1Num));
theta1Num.addEventListener("input", () => syncInputs(theta1Num, theta1));
theta2.addEventListener("input", () => syncInputs(theta2, theta2Num));
theta2Num.addEventListener("input", () => syncInputs(theta2Num, theta2));
armLength.addEventListener("input", () => syncInputs(armLength, lengthNum));
lengthNum.addEventListener("input", () => syncInputs(lengthNum, armLength));
payload.addEventListener("input", () => syncInputs(payload, payloadNum));
payloadNum.addEventListener("input", () => syncInputs(payloadNum, payload));

// Faults (Disturbance Models)
const faultOverloadBtn = document.getElementById("faultOverload");
const faultFrictionBtn = document.getElementById("faultFriction");
const faultPayloadBtn  = document.getElementById("faultPayload");
const clearFaultsBtn   = document.getElementById("clearFaults");

function updateFaultButtons() {
    faultOverloadBtn.classList.toggle("active", activeFaults.overload);
    faultFrictionBtn.classList.toggle("active", activeFaults.friction);
    faultPayloadBtn.classList.toggle("active",  activeFaults.payloadShift);
}

faultOverloadBtn.addEventListener("click", () => {
    activeFaults.overload = !activeFaults.overload;
    updateFaultButtons(); updateLiveState();
});
faultFrictionBtn.addEventListener("click", () => {
    activeFaults.friction = !activeFaults.friction;
    updateFaultButtons(); updateLiveState();
});
faultPayloadBtn.addEventListener("click", () => {
    activeFaults.payloadShift = !activeFaults.payloadShift;
    updateFaultButtons(); updateLiveState();
});
clearFaultsBtn.addEventListener("click", () => {
    activeFaults = { overload: false, friction: false, payloadShift: false };
    updateFaultButtons(); updateLiveState();
});

// Advanced Physics & Forward Kinematics Engine
function calculatePhysics(t1, t2, L, p) {
    const rad1 = t1 * Math.PI / 180;
    const rad2 = t2 * Math.PI / 180;
    const l1 = L; // Length in meters
    const l2 = L;
    
    // Forward Kinematics (Cartesian X, Y from base)
    const x = l1 * Math.cos(rad1) + l2 * Math.cos(rad1 + rad2);
    const y = l1 * Math.sin(rad1) + l2 * Math.sin(rad1 + rad2);
    
    // Torque Calculation (Lever arm = X)
    let torque = p * 9.81 * Math.abs(x); 
    if (activeFaults.overload) torque *= 2.5;

    // Stability Calculation
    let stability = 100 - (torque * 1.5);
    if (activeFaults.payloadShift) stability -= 30;
    stability = Math.max(0, Math.min(100, stability));

    // Accuracy / Singularity Risk
    let angleDeviation = Math.abs(t2 - 90); 
    let accuracy = 100 - (angleDeviation * 0.4);
    if (activeFaults.friction) accuracy -= 25;
    if (stability < 40) accuracy -= 15;
    accuracy = Math.max(0, Math.min(100, accuracy));

    return { x, y, torque, stability, accuracy };
}

function updateLiveState() {
    const t1 = Number(theta1.value);
    const t2 = Number(theta2.value);
    const L = Number(armLength.value);
    const p = Number(payload.value);

    // Keep currentT1/currentT2 in sync for the record button
    currentT1 = t1;
    currentT2 = t2;

    const phys = calculatePhysics(t1, t2, L, p);
    
    // Update Advanced Analytics
    valX.textContent = phys.x.toFixed(2) + " m";
    valY.textContent = phys.y.toFixed(2) + " m";
    valStab.textContent = phys.stability.toFixed(1) + "%";
    valTorque.textContent = phys.torque.toFixed(2) + " Nm";
    valAcc.textContent = phys.accuracy.toFixed(1) + "%";

    // Visual Alerts
    valStab.className = phys.stability < 50 ? "metric-val alert" : "metric-val";
    valAcc.className = phys.accuracy < 70 ? "metric-val alert" : "metric-val";
    if (phys.stability < 50) fullRobot.classList.add("vibrating");
    else fullRobot.classList.remove("vibrating");

    // --- Live Angle Badges (next to sliders) ---
    badge1.textContent = t1.toFixed(1) + "\u00b0";
    badge2.textContent = t2.toFixed(1) + "\u00b0";

    // Colour the badges based on proximity to limits
    badge1.className = "angle-badge" + (t1 < 10 || t1 > 170 ? " badge-warn" : "");
    badge2.className = "angle-badge badge-green" + (t2 < 10 || t2 > 170 ? " badge-warn" : "");

    // --- SVG Viewport Overlay ---
    overlayT1.textContent = "\u03b8\u2081 = " + t1.toFixed(1) + "\u00b0";
    overlayT2.textContent = "\u03b8\u2082 = " + t2.toFixed(1) + "\u00b0";
    
    updateRobotVisuals(t1, t2, L);

    // Live Oscilloscope Update
    oscData.push({t1: t1, t2: t2});
    if(oscData.length > 200) oscData.shift();
    drawOscilloscope();

    // Live Trace Update
    const rad1 = t1 * Math.PI / 180;
    const rad2 = t2 * Math.PI / 180;
    const l_px = L * 100;
    const ex = 400 + l_px*Math.cos(rad1) + l_px*Math.cos(rad1+rad2);
    const ey = 150 - l_px*Math.sin(rad1) - l_px*Math.sin(rad1+rad2);
    
    const currentPoint = `${ex},${ey}`;
    const lastPoint = tracePoints[tracePoints.length - 1];
    if (currentPoint !== lastPoint) {
        tracePoints.push(currentPoint);
        if(tracePoints.length > 100) tracePoints.shift();
        pathTrace.setAttribute("d", "M " + tracePoints.join(" L "));
    }

    // ── Target Zone Proximity Detection ──────────────────────────────────
    // TCP is the red dot at end of gripper (15px past end of link2)
    const tcpX = 400 + l_px*Math.cos(rad1) + (l_px + 15)*Math.cos(rad1 + rad2);
    const tcpY = 150 - l_px*Math.sin(rad1) - (l_px + 15)*Math.sin(rad1 + rad2);
    const targetCX = 547, targetCY = 3; // centre of target zone rect
    const dist = Math.sqrt((tcpX - targetCX)**2 + (tcpY - targetCY)**2);

    const tRect   = document.getElementById("targetRect");
    const tIcon   = document.getElementById("targetIcon");
    const tLabelA = document.getElementById("targetLabelA");
    const tLabelB = document.getElementById("targetLabelB");
    const rOverlay = document.getElementById("reachOverlay");
    const gTop    = document.getElementById("gripperTop");
    const gBot    = document.getElementById("gripperBot");

    if (dist < 28) {
        // ✅ REACHED — green, gripper closes, badge shows
        tRect.setAttribute("fill", "#e6f4ea");
        tRect.setAttribute("stroke", "#137333");
        tIcon.setAttribute("fill", "#137333");
        tIcon.textContent = "✓";
        tLabelA.setAttribute("fill", "#137333");
        tLabelB.setAttribute("fill", "#137333");
        rOverlay.setAttribute("opacity", "1");
        gTop.setAttribute("d", "M 0 -4 L 15 -4 L 15 0 L 0 0 Z");
        gBot.setAttribute("d", "M 0 4 L 15 4 L 15 0 L 0 0 Z");
    } else if (dist < 70) {
        // 🟠 CLOSE — orange "getting warm" state
        tRect.setAttribute("fill", "#fff3e0");
        tRect.setAttribute("stroke", "#f57c00");
        tIcon.setAttribute("fill", "#f57c00");
        tIcon.textContent = "✕";
        tLabelA.setAttribute("fill", "#f57c00");
        tLabelB.setAttribute("fill", "#f57c00");
        rOverlay.setAttribute("opacity", "0");
        gTop.setAttribute("d", "M 0 -10 L 15 -10 L 15 -2 L 0 -2 Z");
        gBot.setAttribute("d", "M 0 10 L 15 10 L 15 2 L 0 2 Z");
    } else {
        // 🔴 FAR — default red state
        tRect.setAttribute("fill", "#fce8e6");
        tRect.setAttribute("stroke", "#ea4335");
        tIcon.setAttribute("fill", "#ea4335");
        tIcon.textContent = "✕";
        tLabelA.setAttribute("fill", "#ea4335");
        tLabelB.setAttribute("fill", "#ea4335");
        rOverlay.setAttribute("opacity", "0");
        gTop.setAttribute("d", "M 0 -10 L 15 -10 L 15 -2 L 0 -2 Z");
        gBot.setAttribute("d", "M 0 10 L 15 10 L 15 2 L 0 2 Z");
    }

    // Render advisor messages
    renderAdvisor(generateAdvisorMessages(phys, t1, t2, L, p, dist));
}

// ── System Advisor ────────────────────────────────────────────────────────
function generateAdvisorMessages(phys, t1, t2, L, p, targetDist) {
    const msgs = [];

    // 1. Target zone feedback
    if (targetDist < 28) {
        msgs.push({ level: 'success', icon: '[TARGET]', text: 'Target zone reached! Gripper engaged — pick operation successful.' });
    } else if (targetDist < 70) {
        msgs.push({ level: 'info', icon: '[NEAR]', text: `Getting close to target! Distance: ${targetDist.toFixed(0)} px. Try θ₁ ≈ 20°, θ₂ ≈ 40°, L = 1.0 m.` });
    } else {
        msgs.push({ level: 'info', icon: '[TARGET]', text: `Target is ${targetDist.toFixed(0)} px away. Aim for θ₁ ≈ 20°, θ₂ ≈ 40°, L = 1.0 m to reach it.` });
    }

    // 2. Stability feedback
    if (phys.stability < 20) {
        msgs.push({ level: 'danger', icon: '[CRIT]', text: `Critical instability (${phys.stability.toFixed(1)}%)! Reduce payload or reposition arm immediately.` });
    } else if (phys.stability < 50) {
        msgs.push({ level: 'warn', icon: '[WARN]', text: `Low stability (${phys.stability.toFixed(1)}%) — robot vibrating. Reduce payload or torque.` });
    } else if (phys.stability >= 80) {
        msgs.push({ level: 'success', icon: '[OK]', text: `Stability nominal (${phys.stability.toFixed(1)}%). System operating safely.` });
    }

    // 3. Torque feedback
    if (phys.torque > 30) {
        msgs.push({ level: 'danger', icon: '[CRIT]', text: `High base torque (${phys.torque.toFixed(1)} Nm) — structural overload risk.` });
    } else if (phys.torque > 12) {
        msgs.push({ level: 'warn', icon: '[TORQ]', text: `Elevated torque (${phys.torque.toFixed(1)} Nm). Monitor motor load carefully.` });
    }

    // 4. Singularity / accuracy feedback
    if (Math.abs(t2 - 90) > 75) {
        msgs.push({ level: 'danger', icon: '[SING]', text: `Singularity risk: θ₂ = ${t2.toFixed(1)}° (near 0° or 180°). Arm losing a degree of freedom!` });
    } else if (phys.accuracy < 70) {
        msgs.push({ level: 'warn', icon: '[ACC]', text: `Low accuracy (${phys.accuracy.toFixed(1)}%). Move θ₂ closer to 90° for better performance.` });
    } else if (phys.accuracy >= 90) {
        msgs.push({ level: 'success', icon: '[ACC]', text: `Excellent accuracy (${phys.accuracy.toFixed(1)}%). θ₂ near optimal 90°.` });
    }

    // 5. Active faults summary
    const faultNames = [];
    if (activeFaults.overload)     faultNames.push('Motor Overload');
    if (activeFaults.friction)     faultNames.push('Joint Friction');
    if (activeFaults.payloadShift) faultNames.push('Payload Shift');
    if (faultNames.length > 0) {
        msgs.push({ level: 'danger', icon: '[FAULT]', text: `Active fault(s): ${faultNames.join(', ')}. Click each again or use Clear to remove.` });
    }

    // 6. Heavy payload tip
    if (p > 7) {
        msgs.push({ level: 'warn', icon: '[LOAD]', text: `Heavy payload (${p.toFixed(1)} kg) amplifies torque and reduces stability significantly.` });
    }

    // 7. Large linkage tip
    if (L >= 1.8) {
        msgs.push({ level: 'info', icon: '[INFO]', text: `Large linkage (L = ${L.toFixed(1)} m). Max workspace radius is ${(2 * L).toFixed(1)} m.` });
    }

    // Default: all nominal
    if (msgs.length <= 1 && targetDist >= 70 && phys.stability >= 80 && phys.accuracy >= 80 && faultNames.length === 0) {
        msgs.push({ level: 'success', icon: '[OK]', text: 'All systems nominal. Adjust sliders, inject disturbances, or try reaching the target zone.' });
    }

    return msgs;
}

function renderAdvisor(msgs) {
    advisorBody.innerHTML = msgs.map(m =>
        `<div class="advisor-msg ${m.level}">
            <span class="adv-icon">${m.icon}</span>
            <span class="adv-text">${m.text}</span>
        </div>`
    ).join('');
}

function updateRobotVisuals(t1, t2, L) {
    const l1_px = L * 100;
    const l2_px = L * 100;
    
    link1Body.setAttribute("width", l1_px + 20);
    link2Body.setAttribute("width", l2_px + 16);
    gripperGroup.setAttribute("transform", `translate(${l2_px}, 0)`);

    link1Group.setAttribute("transform", `translate(400, 150) rotate(${-t1})`);
    
    const rad1 = t1 * Math.PI / 180;
    const x1 = 400 + l1_px * Math.cos(rad1);
    const y1 = 150 - l1_px * Math.sin(rad1);
    
    link2Group.setAttribute("transform", `translate(${x1}, ${y1}) rotate(${-(t1 + t2)})`);

    // Update workspace boundary circle (radius = 2L in pixels)
    const boundaryR = 2 * l1_px;
    const workspaceBoundary = document.getElementById("workspaceBoundary");
    const workspaceLabel    = document.getElementById("workspaceLabel");
    workspaceBoundary.setAttribute("r", boundaryR);
    // Position label at top of circle
    workspaceLabel.setAttribute("x", 400 + boundaryR * 0.68);
    workspaceLabel.setAttribute("y", 150 - boundaryR * 0.68);
    workspaceLabel.textContent = `Max Reach: ${(2 * L).toFixed(2)} m`;
}

function drawOscilloscope() {
    canvas.width = canvasContainer.clientWidth;
    // Light background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = "rgba(196,181,253,0.35)"; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * i / 4);
        ctx.lineTo(canvas.width, canvas.height * i / 4);
        ctx.stroke();
    }

    if(oscData.length < 2) return;

    // Trace T1 — indigo
    ctx.beginPath(); ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2;
    for(let i=0; i<oscData.length; i++) {
        let x = canvas.width - (oscData.length - i) * (canvas.width/200);
        let y = canvas.height - (Math.max(0, Math.min(180, oscData[i].t1)) / 180 * canvas.height);
        if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    } ctx.stroke();

    // Trace T2 — emerald
    ctx.beginPath(); ctx.strokeStyle = "#059669"; ctx.lineWidth = 2;
    for(let i=0; i<oscData.length; i++) {
        let x = canvas.width - (oscData.length - i) * (canvas.width/200);
        let y = canvas.height - (Math.max(0, Math.min(180, oscData[i].t2)) / 180 * canvas.height);
        if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    } ctx.stroke();
}

// Execute Trajectory Animation (Automated Sweep)
runBtn.addEventListener("click", () => {
    runBtn.disabled = true; runBtn.style.opacity = "0.5";
    
    // Instead of animating from the current slider position, let's do an automated trajectory sweep
    // to demonstrate the kinematics of the arm, like drawing an arc.
    const startT1 = Number(theta1.value);
    const startT2 = Number(theta2.value);
    const L = Number(armLength.value);
    
    const targetT1 = startT1 === 45 ? 135 : 45;
    const targetT2 = startT2 === 45 ? 135 : 45;
    
    const dist = Math.max(Math.abs(targetT1 - startT1), Math.abs(targetT2 - startT2));
    const duration = dist * 15; 
    
    if (dist === 0) { runBtn.disabled = false; runBtn.style.opacity = "1"; return; }

    const startTime = performance.now();

    function animate(time) {
        let elapsed = time - startTime;
        let progress = Math.min(elapsed / duration, 1);
        let ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        let curT1 = startT1 + (targetT1 - startT1) * ease;
        let curT2 = startT2 + (targetT2 - startT2) * ease;

        // Update slider visuals to match automation
        theta1.value = curT1; theta1Num.value = curT1.toFixed(1);
        theta2.value = curT2; theta2Num.value = curT2.toFixed(1);
        
        updateLiveState(); // This handles all visual updates, trace, and oscilloscope

        if (progress < 1) animationFrameId = requestAnimationFrame(animate);
        else {
            runBtn.disabled = false; runBtn.style.opacity = "1";
        }
    }
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(animate);
});

recordBtn.addEventListener("click", () => {
    const emptyRow = document.getElementById("emptyRow");
    if (emptyRow) emptyRow.remove();
    
    const p = calculatePhysics(currentT1, currentT2, Number(armLength.value), Number(payload.value));
    const entry = {
        id: `#${runCount}`,
        t1: currentT1.toFixed(1),
        t2: currentT2.toFixed(1),
        x:  p.x.toFixed(2),
        y:  p.y.toFixed(2),
        stab: p.stability.toFixed(1)
    };
    logData.push(entry);
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${entry.id}</td>
        <td>${entry.t1}</td>
        <td>${entry.t2}</td>
        <td style="color:#1a73e8; font-weight:bold;">${entry.x}</td>
        <td style="color:#1a73e8; font-weight:bold;">${entry.y}</td>
        <td class="${p.stability < 50 ? 'metric-val alert' : ''}">${entry.stab}%</td>
    `;
    logTable.appendChild(row);
    runCount++;
});

clearLogBtn.addEventListener("click", () => {
    logTable.innerHTML = `<tr id="emptyRow"><td colspan="6" style="padding: 32px; font-style:italic; color:#1e293b;">Observation notebook empty — record your first data point.</td></tr>`;
    runCount = 1;
    logData = [];
});

// CSV Export
document.getElementById("csvBtn").addEventListener("click", () => {
    if (logData.length === 0) {
        alert("No observations recorded yet. Record at least one data point first.");
        return;
    }
    const headers = ["ID","θ1 (°)","θ2 (°)","X (m)","Y (m)","Stability (%)"];
    const rows = logData.map(d => [
        d.id, d.t1, d.t2, d.x, d.y, d.stab
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `robotic_arm_observations_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});

resetBtn.addEventListener("click", () => {
    theta1.value = 45; theta1Num.value = 45;
    theta2.value = 45; theta2Num.value = 45;
    armLength.value = 1; lengthNum.value = 1;
    payload.value = 2; payloadNum.value = 2;
    activeFaults = { overload: false, friction: false, payloadShift: false };
    updateFaultButtons();
    tracePoints = []; pathTrace.setAttribute("d", "");
    oscData = [];
    updateLiveState();
});

// Init
updateLiveState();