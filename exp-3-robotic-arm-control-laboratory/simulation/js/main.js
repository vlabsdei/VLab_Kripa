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

// State
let currentT1 = 45;
let currentT2 = 45;
let tracePoints = [];
let oscData = [];
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
document.getElementById("faultOverload").addEventListener("click", () => { activeFaults.overload = true; updateLiveState(); });
document.getElementById("faultFriction").addEventListener("click", () => { activeFaults.friction = true; updateLiveState(); });
document.getElementById("faultPayload").addEventListener("click", () => { activeFaults.payloadShift = true; updateLiveState(); });
document.getElementById("clearFaults").addEventListener("click", () => { activeFaults = { overload: false, friction: false, payloadShift: false }; updateLiveState(); });

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
    const ex = 400 + L*100*Math.cos(rad1) + L*100*Math.cos(rad1+rad2);
    const ey = 150 - L*100*Math.sin(rad1) - L*100*Math.sin(rad1+rad2);
    
    const currentPoint = `${ex},${ey}`;
    const lastPoint = tracePoints[tracePoints.length - 1];
    if (currentPoint !== lastPoint) {
        tracePoints.push(currentPoint);
        if(tracePoints.length > 100) tracePoints.shift();
        pathTrace.setAttribute("d", "M " + tracePoints.join(" L "));
    }
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
}

function drawOscilloscope() {
    canvas.width = canvasContainer.clientWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(oscData.length < 2) return;

    // Trace T1
    ctx.beginPath(); ctx.strokeStyle = "#1a73e8"; ctx.lineWidth = 1.5;
    for(let i=0; i<oscData.length; i++) {
        let x = canvas.width - (oscData.length - i) * (canvas.width/200);
        let y = canvas.height - (Math.max(0, Math.min(180, oscData[i].t1)) / 180 * canvas.height);
        if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    } ctx.stroke();

    // Trace T2
    ctx.beginPath(); ctx.strokeStyle = "#137333"; ctx.lineWidth = 1.5;
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
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>#${runCount++}</td>
        <td>${currentT1.toFixed(1)}</td>
        <td>${currentT2.toFixed(1)}</td>
        <td style="color:#1a73e8; font-weight:bold;">${p.x.toFixed(2)}</td>
        <td style="color:#1a73e8; font-weight:bold;">${p.y.toFixed(2)}</td>
        <td class="${p.stability < 50 ? 'metric-val alert' : ''}">${p.stability.toFixed(1)}%</td>
    `;
    logTable.insertBefore(row, logTable.firstChild);
});

clearLogBtn.addEventListener("click", () => {
    logTable.innerHTML = `<tr id="emptyRow"><td colspan="6" style="padding: 32px; font-style:italic; color:#7a9cb8;">Observation notebook empty.</td></tr>`;
    runCount = 1;
});

resetBtn.addEventListener("click", () => {
    theta1.value = 45; theta1Num.value = 45;
    theta2.value = 45; theta2Num.value = 45;
    armLength.value = 1; lengthNum.value = 1;
    payload.value = 2; payloadNum.value = 2;
    activeFaults = { overload: false, friction: false, payloadShift: false };
    tracePoints = []; pathTrace.setAttribute("d", "");
    oscData = []; 
    updateLiveState();
});

// Init
updateLiveState();