document.addEventListener('DOMContentLoaded', () => {

    // --- 1. State Management Core ---
    let state = {
        selectedMachine: 'compressor',
        temperature: 70.0,
        pressure: 7.0,
        vibration: 3.5,
        humidity: 40.0,
        noiseActive: true,
        speedFactor: 3,
        activeFault: null,
        calculatedHealth: 100,
        runCounter: 0,
        logHistory: []
    };

    // --- 2. Element Mappings (correct order — all declarations before usage) ---
    const sliders = {
        temp: document.getElementById('sliderTemp'),
        press: document.getElementById('sliderPress'),
        vib: document.getElementById('sliderVib'),
        hum: document.getElementById('sliderHum'),
        speed: document.getElementById('sliderSpeed')
    };

    const textDisplays = {
        temp: document.getElementById('txtTemp'),
        press: document.getElementById('txtPress'),
        vib: document.getElementById('txtVib'),
        hum: document.getElementById('txtHum'),
        speed: document.getElementById('txtSpeed')
    };

    const analytics = {
        healthVal: document.getElementById('lblHealthValue'),
        healthBadge: document.getElementById('lblHealthBadge'),
        healthRing: document.getElementById('healthRingCircle'),
        alertBanner: document.getElementById('alertBanner'),
        cavitationBar: document.getElementById('barCavitation'),
        cavitationTxt: document.getElementById('lblCavitation'),
        bearingBar: document.getElementById('barBearing'),
        bearingTxt: document.getElementById('lblBearing'),
        rtdTxt: document.getElementById('lblRtdValue')
    };

    const miniGauges = {
        txtTemp: document.getElementById('lblGaugeTempText'),
        txtPress: document.getElementById('lblGaugePressText'),
        txtVib: document.getElementById('lblGaugeVibText'),
        txtHum: document.getElementById('lblGaugeHumText'),
        fillTemp: document.getElementById('gaugeTemp'),
        fillPress: document.getElementById('gaugePress'),
        fillVib: document.getElementById('gaugeVib'),
        fillHum: document.getElementById('gaugeHum')
    };

    const svgCanvas = document.getElementById('machineSvgGraphic');
    const activeMachineLabel = document.getElementById('activeMachineLabel');
    const terminalLog = document.getElementById('terminalLog');
    const chkNoise = document.getElementById('chkNoise');
    const notebookTableBody = document.querySelector('#notebookTable tbody');
    const btnExportCSV = document.getElementById('btnExportCSV');

    // --- 3. Setup Telemetry Real-time Plotter Canvas ---
    const canvas = document.getElementById('telemetryCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let historyPoints = Array.from({ length: 60 }, () => ({ t: 70, p: 7, v: 3.5, h: 40, score: 100 }));

    // Resize canvas to fill its container
    function resizeCanvas() {
        if (!canvas) return;
        const wrapper = canvas.parentElement;
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Debounce timer for slider inputs
    let debounceTimer = null;
    const debounceDelay = 80;
    function debouncedCalculateMetrics() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(calculateSystemMetrics, debounceDelay);
    }

    // --- 4. Logic Initialization Handlers ---
    function init() {
        // Setup Machinery buttons event listeners
        document.querySelectorAll('.machinery-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.machinery-btn').forEach(b => b.classList.remove('active'));

                const chosenLabel = e.currentTarget.getAttribute('data-machine') || '';
                e.currentTarget.classList.add('active');

                const machineKey = chosenLabel.toLowerCase();
                if (machineKey.includes('pump')) state.selectedMachine = 'pump';
                else if (machineKey.includes('motor')) state.selectedMachine = 'motor';
                else state.selectedMachine = 'compressor';

                // Update machine label
                if (activeMachineLabel) {
                    activeMachineLabel.textContent = e.currentTarget.textContent.trim() + ' Active';
                }

                appendTerminalLine(`Machinery set to: ${e.currentTarget.textContent.trim()}. Recalibrating safe zones.`, 'info');
                applyMachineBaselineDefaults(state.selectedMachine);
                calculateSystemMetrics();
            });
        });

        // Map inputs directly to live computations with debouncing
        if (sliders.temp) sliders.temp.addEventListener('input', (e) => { state.temperature = parseFloat(e.target.value); debouncedCalculateMetrics(); });
        if (sliders.press) sliders.press.addEventListener('input', (e) => { state.pressure = parseFloat(e.target.value); debouncedCalculateMetrics(); });
        if (sliders.vib) sliders.vib.addEventListener('input', (e) => { state.vibration = parseFloat(e.target.value); debouncedCalculateMetrics(); });
        if (sliders.hum) sliders.hum.addEventListener('input', (e) => { state.humidity = parseFloat(e.target.value); debouncedCalculateMetrics(); });

        if (sliders.speed) sliders.speed.addEventListener('input', (e) => {
            state.speedFactor = parseInt(e.target.value);
            if (textDisplays.speed) textDisplays.speed.textContent = `${state.speedFactor}x`;
            appendTerminalLine(`Failure transition physics rate boosted to ${state.speedFactor}x.`, 'info');
            if (typeof startSimulationLoop === 'function') startSimulationLoop();
        });

        if (chkNoise) chkNoise.addEventListener('change', (e) => {
            state.noiseActive = e.target.checked;
            appendTerminalLine(`High-frequency telemetry noise model ${state.noiseActive ? 'ACTIVATED' : 'DEACTIVATED'}.`, 'info');
        });

        // Set action items triggers
        const btnReinit = document.getElementById('btnReinit');
        if (btnReinit) btnReinit.addEventListener('click', () => applyMachineBaselineDefaults(state.selectedMachine));

        const btnCaptureRun = document.getElementById('btnCaptureRun');
        if (btnCaptureRun) btnCaptureRun.addEventListener('click', captureExperimentalNotebookRow);

        if (btnExportCSV) btnExportCSV.addEventListener('click', exportNotebookLedgerToCSV);

        // Mobile Sidebar Controls
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (mobileMenuBtn && sidebarOverlay) {
            mobileMenuBtn.addEventListener('click', () => {
                document.body.classList.add('sidebar-open');
            });
            sidebarOverlay.addEventListener('click', () => {
                document.body.classList.remove('sidebar-open');
            });
        }

        // Setup individual emergency fault triggers
        setupFaultTriggers();

        // Establish initial values loadout sequence
        applyMachineBaselineDefaults(state.selectedMachine);

        // Kick off asynchronous live tracking systems
        if (typeof startSimulationLoop === 'function') startSimulationLoop();
        appendTerminalLine("Telemetry infrastructure initial link successfully initialized.", "info");
    }

    // --- 5. Industrial Mathematical Modeling Engine ---
    function calculateSystemMetrics() {
        let T = state.temperature;
        let P = state.pressure;
        let V = state.vibration;
        let H = state.humidity;

        // Apply slider text feedback values updates
        if (textDisplays.temp) textDisplays.temp.textContent = T.toFixed(1);
        if (textDisplays.press) textDisplays.press.textContent = P.toFixed(1);
        if (textDisplays.vib) textDisplays.vib.textContent = V.toFixed(1);
        if (textDisplays.hum) textDisplays.hum.textContent = H.toFixed(1);

        // Calculate RTD Resistance based on Platinum standard: R = R0 * (1 + alpha * T)
        let rtdResistance = (100.00 + (0.385 * T)).toFixed(2);
        if (analytics.rtdTxt) analytics.rtdTxt.textContent = `${rtdResistance} Ω`;

        // Calculate Predictive Risks
        let cavitationRisk = 0;
        let bearingAbrasion = 0;

        if (state.selectedMachine === 'pump') {
            if (V > 8 || P < 3 || state.activeFault === 'cavitation' || state.activeFault === 'leak') {
                cavitationRisk = Math.min(100, (V * 3.5) + (30 - P * 4));
            }
            if (V > 12 || T > 85 || state.activeFault === 'bearing') {
                bearingAbrasion = Math.min(100, ((V - 6) * 4) + (T - 60));
            }
        } else if (state.selectedMachine === 'motor') {
            if (T > 90 || state.activeFault === 'thermal') {
                cavitationRisk = Math.min(100, (T - 80) * 2.5 + (V * 1.5));
            }
            if (V > 10 || state.activeFault === 'bearing') {
                bearingAbrasion = Math.min(100, V * 4);
            }
        } else if (state.selectedMachine === 'compressor') {
            if (P > 25 || V > 9 || state.activeFault === 'blockage' || state.activeFault === 'leak') {
                cavitationRisk = Math.min(100, (P * 2) + (V * 1.8));
            }
            if (T > 80 || V > 11 || state.activeFault === 'bearing') {
                bearingAbrasion = Math.min(100, (T - 70) * 1.8 + (V * 2.2));
            }
        }

        cavitationRisk = Math.max(0, Math.round(cavitationRisk));
        bearingAbrasion = Math.max(0, Math.round(bearingAbrasion));

        // Display results
        if (analytics.cavitationTxt) analytics.cavitationTxt.textContent = `${cavitationRisk}%`;
        if (analytics.cavitationBar) analytics.cavitationBar.style.width = `${cavitationRisk}%`;
        if (analytics.bearingTxt) analytics.bearingTxt.textContent = `${bearingAbrasion}%`;
        if (analytics.bearingBar) analytics.bearingBar.style.width = `${bearingAbrasion}%`;

        setBarIndicatorColor(analytics.cavitationBar, cavitationRisk);
        setBarIndicatorColor(analytics.bearingBar, bearingAbrasion);

        // Compute aggregate overall system safety score
        let deductions = (cavitationRisk * 0.6) + (bearingAbrasion * 0.6);
        if (state.activeFault) deductions = Math.max(deductions, 65);

        let targetHealth = Math.max(0, Math.round(100 - deductions));
        state.calculatedHealth = targetHealth;

        // Render Circular Indicator
        if (analytics.healthVal) analytics.healthVal.textContent = targetHealth;
        if (analytics.healthRing) {
            let strokeOffset = 263.89 - (263.89 * targetHealth / 100);
            analytics.healthRing.style.strokeDashoffset = strokeOffset;
        }

        updateDashboardUITheme(targetHealth, cavitationRisk, bearingAbrasion);
        updateMiniGaugesUI(T, P, V, H);

        drawMachineVectorSimulation(targetHealth);
    }

    // --- 6. Interface Graphics Updates Engine ---
    function updateDashboardUITheme(score, cav, bear) {
        if (!analytics.healthBadge) return;

        // Use the CSS class names that actually exist in main.css
        analytics.healthBadge.className = "status-badge";
        if (score >= 85) {
            analytics.healthBadge.textContent = "Excellent";
            analytics.healthBadge.classList.add('badge-success');
            if (analytics.healthRing) analytics.healthRing.style.stroke = "#10b981";

            if (analytics.alertBanner) {
                analytics.alertBanner.className = "alert-banner alert-success-banner";
                analytics.alertBanner.textContent = "All operations normal. Baseline telemetry signature stable.";
            }
        } else if (score >= 50) {
            analytics.healthBadge.textContent = "Degraded";
            analytics.healthBadge.classList.add('badge-warning');
            if (analytics.healthRing) analytics.healthRing.style.stroke = "#f59e0b";

            if (analytics.alertBanner) {
                analytics.alertBanner.className = "alert-banner alert-warning-banner";
                analytics.alertBanner.textContent = `Warning: Elevated operational thresholds. ${cav > bear ? 'Fluid instability risk tracked.' : 'Mechanical friction tracked.'}`;
            }
        } else {
            analytics.healthBadge.textContent = "Critical";
            analytics.healthBadge.classList.add('badge-danger');
            if (analytics.healthRing) analytics.healthRing.style.stroke = "#ef4444";

            if (analytics.alertBanner) {
                analytics.alertBanner.className = "alert-banner alert-danger-banner";
                analytics.alertBanner.textContent = "CRITICAL METRIC BREACH: Shut down system or check active fault items.";
            }
        }
    }

    function updateMiniGaugesUI(t, p, v, h) {
        if (miniGauges.txtTemp) miniGauges.txtTemp.textContent = `${t.toFixed(1)}°C`;
        if (miniGauges.txtPress) miniGauges.txtPress.textContent = `${p.toFixed(1)} bar`;
        if (miniGauges.txtVib) miniGauges.txtVib.textContent = `${v.toFixed(1)} Hz`;
        if (miniGauges.txtHum) miniGauges.txtHum.textContent = `${h.toFixed(1)}%`;

        // Update SVG ring angle property
        if (miniGauges.fillTemp) miniGauges.fillTemp.style.setProperty('--gauge-angle', `${Math.min(180, Math.max(0, (t / 150) * 180))}deg`);
        if (miniGauges.fillPress) miniGauges.fillPress.style.setProperty('--gauge-angle', `${Math.min(180, Math.max(0, (p / 50) * 180))}deg`);
        if (miniGauges.fillVib) miniGauges.fillVib.style.setProperty('--gauge-angle', `${Math.min(180, Math.max(0, (v / 30) * 180))}deg`);
        if (miniGauges.fillHum) miniGauges.fillHum.style.setProperty('--gauge-angle', `${Math.min(180, Math.max(0, (h / 100) * 180))}deg`);
    }

    function setBarIndicatorColor(element, value) {
        if (!element) return;
        if (value < 25) { element.style.backgroundColor = "#475569"; }
        else if (value < 60) { element.style.backgroundColor = "#f59e0b"; }
        else { element.style.backgroundColor = "#ef4444"; }
    }

    // --- 7. SVG Machine Vector Simulation ---
    function drawMachineVectorSimulation(health) {
        if (!svgCanvas) return;

        let isWorking = health > 40;
        let accentColor = isWorking ? "#10b981" : "#ef4444";
        let motionSpeed = isWorking ? (state.vibration > 10 ? "0.2s" : "0.8s") : "0s";

        let svgContent = '';

        if (state.selectedMachine === 'pump') {
            svgContent = `
                <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                    <style>
                        @keyframes impellerSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                        @keyframes fluidFlow { to { stroke-dashoffset: -10; } }
                        @keyframes fluidOut { to { stroke-dashoffset: -10; } }
                    </style>
                </defs>
                <path d="M 60 30 Q 40 30 40 50 Q 40 70 60 70 L 140 70 Q 160 70 160 50 Q 160 30 140 30 Z" fill="#1e293b" stroke="#475569" stroke-width="3" />
                <rect x="10" y="45" width="30" height="10" fill="#334155" stroke="#475569" stroke-width="2" rx="3" />
                <path d="M 40 48 Q 35 48 30 50" stroke="#0ea5e9" stroke-width="3" fill="none" stroke-dasharray="5,5" style="animation: fluidFlow ${motionSpeed} linear infinite;" />
                <path d="M 15 45 Q 25 40 35 50 T 50 45" stroke="#0ea5e9" stroke-width="1.5" fill="none" stroke-dasharray="3,6" style="animation: fluidFlow ${motionSpeed} linear infinite; opacity: 0.6;" />
                <rect x="95" y="15" width="10" height="25" fill="#334155" stroke="#475569" stroke-width="2" rx="3" />
                <path d="M 100 35 L 100 15" stroke="#10b981" stroke-width="3" fill="none" style="animation: fluidOut ${motionSpeed} linear infinite; opacity: ${isWorking ? 1 : 0.3};" />
                <path d="M 97 35 L 97 15" stroke="#10b981" stroke-width="1" fill="none" stroke-dasharray="2,4" style="animation: fluidOut 0.4s linear infinite; opacity: ${isWorking ? 0.7 : 0.2};" />
                <g transform="translate(100,50)" style="animation: impellerSpin ${motionSpeed} linear infinite; transform-origin: 0 0;">
                    <circle cx="0" cy="0" r="25" fill="none" stroke="#475569" stroke-width="1.5" opacity="0.5" />
                    <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#64748b" stroke-width="2" />
                    <path d="M 0,0 L 15,-8 L 12,-2 Z" fill="${accentColor}" />
                    <path d="M 0,0 L 8,15 L 2,12 Z" fill="${accentColor}" />
                    <path d="M 0,0 L -15,8 L -12,2 Z" fill="${accentColor}" />
                    <path d="M 0,0 L -8,-15 L -2,-12 Z" fill="${accentColor}" />
                    <circle cx="0" cy="0" r="6" fill="#94a3b8" />
                    <circle cx="0" cy="0" r="14" fill="none" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="4,8" />
                </g>
                <circle cx="155" cy="35" r="4" fill="${accentColor}" />
                </svg>
            `;
        } else if (state.selectedMachine === 'motor') {
            svgContent = `
                <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                    <style>
                        @keyframes rotorSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    </style>
                </defs>
                <rect x="35" y="25" width="130" height="50" fill="#1e293b" stroke="#475569" stroke-width="3" rx="6" />
                <rect x="35" y="20" width="4" height="60" fill="#475569" />
                <rect x="45" y="20" width="4" height="60" fill="#475569" />
                <rect x="55" y="20" width="4" height="60" fill="#475569" />
                <rect x="155" y="20" width="4" height="60" fill="#475569" />
                <rect x="165" y="20" width="4" height="60" fill="#475569" />
                <circle cx="100" cy="50" r="28" fill="none" stroke="#64748b" stroke-width="2" opacity="0.6" />
                <path d="M 75 35 Q 85 30 100 30 Q 115 30 125 35" stroke="#0ea5e9" stroke-width="2" fill="none" />
                <path d="M 75 65 Q 85 70 100 70 Q 115 70 125 65" stroke="#0ea5e9" stroke-width="2" fill="none" />
                <g transform="translate(100,50)" style="animation: rotorSpin ${motionSpeed} linear infinite; transform-origin: 0 0;">
                    <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="${accentColor}" stroke-width="2.5" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#f59e0b" stroke-width="2" />
                    <line x1="-10" y1="-8" x2="10" y2="8" stroke="#f59e0b" stroke-width="1.5" />
                    <line x1="-10" y1="8" x2="10" y2="-8" stroke="#f59e0b" stroke-width="1.5" />
                    <circle cx="0" cy="0" r="24" fill="none" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="6,12" opacity="0.7" />
                </g>
                <rect x="131" y="47" width="45" height="6" fill="#94a3b8" />
                <circle cx="176" cy="50" r="5" fill="#64748b" stroke="#94a3b8" stroke-width="2" />
                <rect x="28" y="46" width="7" height="8" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
                </svg>
            `;
        } else if (state.selectedMachine === 'compressor') {
            svgContent = `
                <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                    <style>
                        @keyframes rotorL { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                        @keyframes rotorR { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
                        @keyframes fluidOut { to { stroke-dashoffset: -10; } }
                    </style>
                </defs>
                <rect x="25" y="20" width="150" height="60" fill="#1e293b" stroke="#334155" stroke-width="4" rx="10" />
                <line x1="100" y1="25" x2="100" y2="75" stroke="#475569" stroke-width="2" opacity="0.5" />
                <circle cx="20" cy="35" r="5" fill="#0ea5e9" stroke="#06b6d4" stroke-width="2" />
                <path d="M 25 35 L 35 35" stroke="#0ea5e9" stroke-width="3" stroke-dasharray="4,2" />
                <g transform="translate(60,50)" style="animation: rotorL ${motionSpeed} linear infinite; transform-origin: 0 0;">
                    <circle cx="0" cy="0" r="15" fill="#0f172a" stroke="#64748b" stroke-width="2" />
                    <ellipse cx="0" cy="-6" rx="6" ry="9" fill="#334155" stroke="${accentColor}" stroke-width="2" />
                    <ellipse cx="0" cy="6" rx="6" ry="9" fill="#334155" stroke="${accentColor}" stroke-width="2" />
                    <circle cx="0" cy="0" r="20" fill="none" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="4,8" opacity="0.6" />
                </g>
                <g transform="translate(140,50)" style="animation: rotorR ${motionSpeed} linear infinite; transform-origin: 0 0;">
                    <circle cx="0" cy="0" r="15" fill="#0f172a" stroke="#64748b" stroke-width="2" />
                    <path d="M -8,-8 Q -6,-14 0,-15 Q 6,-14 8,-8 Z" fill="#334155" stroke="${accentColor}" stroke-width="2" />
                    <path d="M -8,8 Q -6,14 0,15 Q 6,14 8,8 Z" fill="#334155" stroke="${accentColor}" stroke-width="2" />
                    <circle cx="0" cy="0" r="20" fill="none" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="4,8" opacity="0.6" />
                </g>
                <circle cx="180" cy="50" r="5" fill="#10b981" stroke="#059669" stroke-width="2" />
                <path d="M 175 50 L 165 50" stroke="#10b981" stroke-width="3" style="animation: fluidOut ${motionSpeed} linear infinite; opacity: ${isWorking ? 1 : 0.3};" />
                <path d="M 30 30 L 160 30" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="5,15" fill="none" style="animation: fluidOut 0.5s linear infinite; opacity: 0.5;" />
                <path d="M 30 70 L 160 70" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="5,15" fill="none" style="animation: fluidOut 0.5s linear infinite; opacity: 0.5;" />
                <circle cx="130" cy="28" r="6" fill="#334155" stroke="#64748b" stroke-width="1.5" />
                <path d="M 130 28 L 133 25" stroke="#f59e0b" stroke-width="1.5" />
                </svg>
            `;
        }

        svgCanvas.innerHTML = svgContent;
    }

    // --- 8. Canvas Oscilloscope Multi-Sensor Waveforms Plotter Engine ---
    let plotterIntervalId = null;

    function startSimulationLoop() {
        if (plotterIntervalId) clearInterval(plotterIntervalId);
        let delay = 1000 / state.speedFactor; 
        plotterIntervalId = setInterval(simulationTick, delay);
    }

    function simulationTick() {
        historyPoints.push({ t: state.temperature, p: state.pressure, v: state.vibration, h: state.humidity, score: state.calculatedHealth });
        if (historyPoints.length > 60) historyPoints.shift();
        renderLivePlotterGraph();
    }

    function renderLivePlotterGraph() {
        if (!canvas || !ctx) return;

        // Ensure canvas dimensions are fresh
        if (canvas.width === 0 || canvas.height === 0) resizeCanvas();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw simple Y axis labels for scale reference inside the graph
        ctx.fillStyle = "#9ca3af";
        ctx.font = "10px Inter";
        ctx.fillText("100%", 5, 12);
        ctx.fillText("50%", 5, canvas.height / 2 + 4);
        ctx.fillText("0%", 5, canvas.height - 5);

        const drawSignalPath = (keyRef, colorHex, minVal, maxVal) => {
            ctx.beginPath();
            ctx.strokeStyle = colorHex;
            ctx.lineWidth = 1.8;

            for (let x = 0; x < historyPoints.length; x++) {
                let rawVal = historyPoints[x][keyRef];

                // Reduced noise significantly and applied smoothing
                if (state.noiseActive && keyRef !== 'score') {
                    rawVal += (Math.random() - 0.5) * (maxVal * 0.05);
                }

                // Fill entire width, no padding
                let usableWidth = canvas.width;
                let normalizedY = canvas.height - (((rawVal - minVal) / (maxVal - minVal)) * canvas.height);
                // add tiny 2px padding to top/bottom so lines don't get clipped completely
                normalizedY = Math.min(canvas.height - 2, Math.max(2, normalizedY));
                let computedX = (usableWidth / 59) * x;

                if (x === 0) {
                    ctx.moveTo(computedX, normalizedY);
                } else {
                    ctx.lineTo(computedX, normalizedY);
                }
            }
            ctx.stroke();
        };

        drawSignalPath('t', '#f59e0b', 0, 150);
        drawSignalPath('p', '#06b6d4', 0, 50);
        drawSignalPath('v', '#ec4899', 0, 30);
        drawSignalPath('h', '#10b981', 0, 100);
        drawSignalPath('score', '#3b82f6', 0, 100);
    }

    // --- 9. Automated Environmental Presets ---
    function applyMachineBaselineDefaults(machineKey) {
        state.activeFault = null;
        document.querySelectorAll('.btn-fault').forEach(b => {
            b.classList.remove('active-fault');
            b.style.display = 'none';
        });

        const lblRisk1 = document.getElementById('lblRisk1');

        if (machineKey === 'pump') {
            state.temperature = 42.0; state.pressure = 12.4; state.vibration = 2.1; state.humidity = 65.0;
            if (document.getElementById('btnFaultCavitation')) document.getElementById('btnFaultCavitation').style.display = 'inline-flex';
            if (document.getElementById('btnFaultBearing')) document.getElementById('btnFaultBearing').style.display = 'inline-flex';
            if (document.getElementById('btnFaultLeak')) document.getElementById('btnFaultLeak').style.display = 'inline-flex';
            if (lblRisk1) lblRisk1.textContent = 'Cavitation Risk:';
        } else if (machineKey === 'motor') {
            state.temperature = 55.0; state.pressure = 0.0; state.vibration = 1.8; state.humidity = 35.0;
            if (document.getElementById('btnFaultBearing')) document.getElementById('btnFaultBearing').style.display = 'inline-flex';
            if (document.getElementById('btnFaultThermal')) document.getElementById('btnFaultThermal').style.display = 'inline-flex';
            if (lblRisk1) lblRisk1.textContent = 'Thermal Risk:';
        } else if (machineKey === 'compressor') {
            state.temperature = 70.0; state.pressure = 7.0; state.vibration = 3.5; state.humidity = 40.0;
            if (document.getElementById('btnFaultBlockage')) document.getElementById('btnFaultBlockage').style.display = 'inline-flex';
            if (document.getElementById('btnFaultLeak')) document.getElementById('btnFaultLeak').style.display = 'inline-flex';
            if (document.getElementById('btnFaultBearing')) document.getElementById('btnFaultBearing').style.display = 'inline-flex';
            if (lblRisk1) lblRisk1.textContent = 'Blockage Risk:';
        }

        if (sliders.temp) sliders.temp.value = state.temperature;
        if (sliders.press) sliders.press.value = state.pressure;
        if (sliders.vib) sliders.vib.value = state.vibration;
        if (sliders.hum) sliders.hum.value = state.humidity;

        calculateSystemMetrics();
    }

    // --- 10. Emergency Diagnostics Stress-Fault Injectors ---
    function setupFaultTriggers() {
        const faultButtons = Array.from(document.querySelectorAll('.btn-fault'));

        const resetFaultButtonsStyle = (activeButton) => {
            faultButtons.forEach(b => b.classList.remove('active-fault'));
            if (activeButton) activeButton.classList.add('active-fault');
        };

        faultButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const faultKey = btn.getAttribute('data-fault');
                resetFaultButtonsStyle(e.currentTarget);

                if (faultKey === 'cavitation') {
                    state.activeFault = 'cavitation';
                    state.vibration = 24.5;
                    state.pressure = 1.2;
                    if (sliders.vib) sliders.vib.value = 24.5;
                    if (sliders.press) sliders.press.value = 1.2;
                    appendTerminalLine("CRITICAL WARNING: Hydrodynamic pump cavitation vortex generated manually!", "err");
                } else if (faultKey === 'bearing') {
                    state.activeFault = 'bearing';
                    state.vibration = 18.2;
                    state.temperature = 94.0;
                    if (sliders.vib) sliders.vib.value = 18.2;
                    if (sliders.temp) sliders.temp.value = 94.0;
                    appendTerminalLine("ALERT: Structural mechanical bearing cage abrasive degradation active.", "err");
                } else if (faultKey === 'overload') {
                    state.activeFault = 'thermal';
                    state.temperature = 118.0;
                    state.vibration = 12.0;
                    if (sliders.temp) sliders.temp.value = 118.0;
                    if (sliders.vib) sliders.vib.value = 12.0;
                    appendTerminalLine("EMERGENCY: Motor overload induced thermal breakdown leak forced.", "err");
                } else if (faultKey === 'leak') {
                    state.activeFault = 'leak';
                    state.pressure = 0.4;
                    state.humidity = 85.0;
                    if (sliders.press) sliders.press.value = 0.4;
                    if (sliders.hum) sliders.hum.value = 85.0;
                    appendTerminalLine("NOTICE: Pneumatic high-pressure cylinder casing rupture detected.", "warn");
                } else if (faultKey === 'blockage') {
                    state.activeFault = 'blockage';
                    state.pressure = 48.0;
                    state.temperature = 88.5;
                    if (sliders.press) sliders.press.value = 48.0;
                    if (sliders.temp) sliders.temp.value = 88.5;
                    appendTerminalLine("CRITICAL: Downstream line output pipe structural occlusion failure active.", "err");
                }

                calculateSystemMetrics();
            });
        });

        const resetBtn = document.getElementById('btnResetFaults');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                applyMachineBaselineDefaults(state.selectedMachine);
                appendTerminalLine("System telemetry protection safety parameters re-established. All fault overrides cleared.", "info");
            });
        }
    }

    // --- 11. Laboratory Ledger Workbook Data Capture & Exporter ---
    function captureExperimentalNotebookRow() {
        state.runCounter++;

        const placeholder = document.getElementById('emptyRowPlaceholder');
        if (placeholder) placeholder.remove();

        const timestamp = new Date().toLocaleTimeString();
        const machineNamesMap = { pump: "Centrifugal Pump", motor: "AC Induction Motor", compressor: "Rotary Air Compressor" };

        let machineText = machineNamesMap[state.selectedMachine];
        let rtdText = analytics.rtdTxt ? analytics.rtdTxt.textContent : '—';
        let safetyStatusText = analytics.healthBadge ? analytics.healthBadge.textContent : '—';

        let rowData = {
            id: `RUN-${String(state.runCounter).padStart(3, '0')}`,
            time: timestamp,
            machine: machineText,
            t: state.temperature.toFixed(1),
            rtd: rtdText,
            p: state.pressure.toFixed(1),
            v: state.vibration.toFixed(1),
            h: state.humidity.toFixed(1),
            score: `${state.calculatedHealth}%`,
            safety: safetyStatusText
        };

        state.logHistory.push(rowData);

        const tr = document.createElement('tr');
        const scoreColor = state.calculatedHealth > 80 ? '#10b981' : (state.calculatedHealth > 50 ? '#f59e0b' : '#ef4444');
        const badgeClass = safetyStatusText === 'Excellent' ? 'badge-success' : (safetyStatusText === 'Degraded' ? 'badge-warning' : 'badge-danger');

        tr.innerHTML = `
            <td><strong>${rowData.id}</strong></td>
            <td>${rowData.time}</td>
            <td>${rowData.machine}</td>
            <td>${rowData.t} °C</td>
            <td>${rowData.rtd}</td>
            <td>${rowData.p} bar</td>
            <td>${rowData.v} mm/s</td>
            <td>${rowData.h} %</td>
            <td><span style="font-weight:700; color:${scoreColor}">${rowData.score}</span></td>
            <td><span class="badge ${badgeClass}">${rowData.safety}</span></td>
        `;

        if (notebookTableBody) notebookTableBody.appendChild(tr);
        appendTerminalLine(`Experimental Run observation row recorded into Notebook ledger: ${rowData.id}`, "info");
    }

    function exportNotebookLedgerToCSV() {
        if (state.logHistory.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Run ID,Timestamp,Selected Machinery,Temperature (C),RTD Resistance (Ohm),Pressure (bar),Vibration Wave (Hz),Humidity Ratio (%),Net Health Score,Safety Status\n";

        state.logHistory.forEach(r => {
            csvContent += `${r.id},${r.time},${r.machine},${r.t},${r.rtd.replace(/,/g, '')},${r.p},${r.v},${r.h},${r.score},${r.safety}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const downloadLink = document.createElement("a");
        downloadLink.setAttribute("href", encodedUri);
        downloadLink.setAttribute("download", `Industrial_Experiment_Log_Workbook.csv`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        appendTerminalLine("Workbook ledger log formatted and exported successfully as spreadsheet (.CSV)", "info");
    }

    // --- 12. Auxiliary Logging System Broadcast Terminal ---
    function appendTerminalLine(message, type = 'info') {
        if (!terminalLog) return;

        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
        const line = document.createElement('div');
        line.className = "terminal-line";

        let typeClass = '';
        if (type === 'warn') typeClass = 'log-warn';
        else if (type === 'err') typeClass = 'log-err';

        line.innerHTML = `
            <span class="t-stamp">[${timeStr}]</span>
            <span class="${typeClass}">${message}</span>
        `;

        terminalLog.appendChild(line);
        terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    // --- Boot ---
    init();

});
