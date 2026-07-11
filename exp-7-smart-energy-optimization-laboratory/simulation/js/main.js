/**
 * Smart Energy Optimization Laboratory
 * Mathematical Model Solver and Digital Twin Visualizer
 */

document.addEventListener('DOMContentLoaded', () => {
    // Sliders
    const machineLoad = document.getElementById('machineLoad');
    const operatingHours = document.getElementById('operatingHours');
    const renewableContribution = document.getElementById('renewableContribution');
    const idleMachines = document.getElementById('idleMachines');
    const powerFactor = document.getElementById('powerFactor');
    const electricityTariff = document.getElementById('electricityTariff');
    const batterySoc = document.getElementById('batterySoc');
    const peakDemandMode = document.getElementById('peakDemandMode');

    // Badges
    const machineLoadVal = document.getElementById('machineLoadVal');
    const operatingHoursVal = document.getElementById('operatingHoursVal');
    const renewableContributionVal = document.getElementById('renewableContributionVal');
    const idleMachinesVal = document.getElementById('idleMachinesVal');
    const powerFactorVal = document.getElementById('powerFactorVal');
    const electricityTariffVal = document.getElementById('electricityTariffVal');
    const batterySocVal = document.getElementById('batterySocVal');

    // Controls Buttons
    const runBtn = document.getElementById('runBtn');
    const resetBtn = document.getElementById('resetBtn');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    // Table elements
    const logTableBody = document.getElementById('logTableBody');

    // State Variables
    let currentCalculation = null;
    let runCount = 0;

    // Default configuration constants
    const TOTAL_MACHINES = 10;
    const MACHINE_BASE_POWER = 15; // kW per machine at 100% load
    const MACHINE_STANDBY_POWER = 2.5; // kW standby
    const CONVEYOR_BASE_POWER = 5; // kW base
    const HVAC_BASE_POWER = 12; // kW hvac
    const LIGHTING_BASE_POWER = 3; // kW lighting
    const BATTERY_CAPACITY_KWH = 100; // kWh BESS
    const GRID_EMISSION_FACTOR = 0.82; // kg CO2 / kWh

    // Synchronize slider badges in real-time
    function syncBadges() {
        machineLoadVal.textContent = `${machineLoad.value}%`;
        operatingHoursVal.textContent = `${operatingHours.value} hrs`;
        renewableContributionVal.textContent = `${renewableContribution.value}%`;
        idleMachinesVal.textContent = `${idleMachines.value} unit${idleMachines.value === '1' ? '' : 's'}`;
        powerFactorVal.textContent = parseFloat(powerFactor.value).toFixed(2);
        electricityTariffVal.textContent = `₹${parseFloat(electricityTariff.value).toFixed(2)}/kWh`;
        batterySocVal.textContent = `${batterySoc.value}%`;
    }

    // Event listeners for sliders input (live updates)
    [machineLoad, operatingHours, renewableContribution, idleMachines, powerFactor, electricityTariff, batterySoc].forEach(el => {
        el.addEventListener('input', () => {
            syncBadges();
            calculateAndSolve(false); // Update preview calculations without logging
        });
    });

    peakDemandMode.addEventListener('change', () => {
        calculateAndSolve(false);
    });

    // Sync left and right panel heights to exactly match the middle SVG panel (only on desktop)
    function syncPanelHeights() {
        const mid = document.querySelector('.twin-section');
        const left = document.querySelector('.control-panel');
        const right = document.querySelector('.diagnostics-panel');
        if (!mid || !left || !right) return;
        
        if (window.innerWidth > 1200) {
            const h = mid.offsetHeight;
            left.style.height = h + 'px';
            left.style.overflowY = 'auto';
            right.style.height = h + 'px';
            right.style.overflowY = 'auto';
        } else {
            left.style.height = '';
            left.style.overflowY = '';
            right.style.height = '';
            right.style.overflowY = '';
        }
    }

    window.addEventListener('resize', syncPanelHeights);

    // Core Solver Logic
    function calculateAndSolve(isLogging = false) {
        // Retrieve slider inputs
        const loadPct = parseFloat(machineLoad.value) / 100;
        const hours = parseFloat(operatingHours.value);
        const renewPct = parseFloat(renewableContribution.value) / 100;
        const idleCount = parseInt(idleMachines.value, 10);
        const pf = parseFloat(powerFactor.value);
        const tariff = parseFloat(electricityTariff.value);
        const soc = parseFloat(batterySoc.value);
        const mode = peakDemandMode.value;

        // 1. Calculate loads
        const activeMachines = Math.max(0, TOTAL_MACHINES - idleCount);
        const machinesPower = loadPct * activeMachines * MACHINE_BASE_POWER;
        const idlePower = idleCount * MACHINE_STANDBY_POWER;
        
        // Conveyor power depends on machine load throughput
        const conveyorPower = CONVEYOR_BASE_POWER * (1 + loadPct);
        const hvacPower = HVAC_BASE_POWER + LIGHTING_BASE_POWER;

        // Total active power
        const totalPower = machinesPower + idlePower + conveyorPower + hvacPower;

        // Total energy
        const totalEnergy = totalPower * hours;

        // 2. Solar generation
        const solarPower = totalPower * renewPct;
        const solarEnergy = solarPower * hours;

        // 3. Battery contribution (BESS)
        let batteryPower = 0;
        let batteryEnergy = 0;
        let batteryStatusText = "Idle";

        // Limit battery depth of discharge to 20%
        const usableSoc = Math.max(0, soc - 20) / 100;
        const maxBatteryEnergy = BATTERY_CAPACITY_KWH * usableSoc;

        if (mode === 'shaving' && usableSoc > 0) {
            // peak shaving: supplies up to 30% of total load
            batteryEnergy = Math.min(totalEnergy * 0.3, maxBatteryEnergy);
            batteryPower = batteryEnergy / hours;
            batteryStatusText = `Discharging (${soc}%)`;
        } else if (mode === 'response' && usableSoc > 0) {
            // demand response: supplies up to 50% of total load
            batteryEnergy = Math.min(totalEnergy * 0.5, maxBatteryEnergy);
            batteryPower = batteryEnergy / hours;
            batteryStatusText = `Demand Support (${soc}%)`;
        } else {
            batteryStatusText = soc < 20 ? `Low Charge (${soc}%)` : `Charged (${soc}%)`;
        }

        // 4. Utility Grid Supply
        const gridEnergy = Math.max(0, totalEnergy - solarEnergy - batteryEnergy);
        const gridPower = Math.max(0, totalPower - solarPower - batteryPower);

        // 5. Carbon Emissions
        const carbonEmissions = gridEnergy * GRID_EMISSION_FACTOR;
        const offsetPercent = totalEnergy > 0 ? ((totalEnergy - gridEnergy) / totalEnergy * 100).toFixed(0) : 0;

        // 6. Power Quality Factor Losses & Efficiency
        // High reactive losses when PF is low
        const pfLosses = totalPower * Math.pow(1 - pf, 2) * 0.25;
        const idleLossPct = (idlePower / totalPower) * 100;
        const finalEfficiency = Math.max(0, Math.min(100, 100 - idleLossPct - (100 * (1 - pf) * 0.5) - ((pfLosses / totalPower) * 100)));

        // 7. Costs
        const pfPenaltyMultiplier = pf < 0.90 ? (0.90 - pf) * 0.15 : 0;
        const hourlyBaseCost = gridPower * tariff;
        const penaltyCost = hourlyBaseCost * pfPenaltyMultiplier;
        const totalHourlyCost = hourlyBaseCost + penaltyCost;

        currentCalculation = {
            machineLoad: `${loadPct * 100}%`,
            operatingHours: hours,
            renewPct: `${renewPct * 100}%`,
            idleCount: idleCount,
            pf: pf.toFixed(2),
            totalPower: totalPower.toFixed(1),
            totalEnergy: totalEnergy.toFixed(1),
            gridEnergy: gridEnergy.toFixed(1),
            carbon: carbonEmissions.toFixed(1),
            efficiency: finalEfficiency.toFixed(1)
        };

        // Render values to UI with clean locale formatting
        document.getElementById('kpiTotalPower').textContent = `${totalPower.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kW`;
        document.getElementById('kpiTotalEnergy').textContent = `${totalEnergy.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kWh`;
        document.getElementById('kpiEnergyHrs').textContent = `For ${hours} hour${hours === 1 ? '' : 's'} operation`;
        document.getElementById('kpiGridEnergy').textContent = `${gridEnergy.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kWh`;
        document.getElementById('kpiGridPercent').textContent = `${totalEnergy > 0 ? ((gridEnergy / totalEnergy) * 100).toFixed(0) : 0}% of total load`;
        document.getElementById('kpiCarbon').textContent = `${carbonEmissions.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg CO₂`;
        document.getElementById('kpiCarbonOffset').innerHTML = `<i class="fa-solid fa-leaf"></i> ${offsetPercent}% emission offset`;
        
        document.getElementById('kpiEfficiency').textContent = `${finalEfficiency.toFixed(1)}%`;
        document.getElementById('kpiEffProgress').style.width = `${finalEfficiency}%`;

        // Update Node SVG labels
        document.getElementById('svg-grid-power').textContent = `${gridPower.toFixed(1)} kW`;
        document.getElementById('svg-solar-power').textContent = `${solarPower.toFixed(1)} kW`;
        document.getElementById('svg-battery-power').textContent = `${batteryPower > 0 ? '-' : ''}${batteryPower.toFixed(1)} kW`;
        document.getElementById('svg-pf-val').textContent = `PF: ${pf.toFixed(2)}`;
        
        document.getElementById('svg-machines-power').textContent = `${(machinesPower + idlePower).toFixed(1)} kW`;
        document.getElementById('svg-conveyor-power').textContent = `${conveyorPower.toFixed(1)} kW`;
        document.getElementById('svg-hvac-power').textContent = `${hvacPower.toFixed(1)} kW`;

        // Adjust SVG Wires speed/visibility based on active flow power
        updateSvgFlow('flow-grid-trans', gridPower);
        updateSvgFlow('flow-solar-trans', solarPower);
        updateSvgFlow('flow-battery-trans', batteryPower);
        
        updateSvgFlow('flow-bus-machines', machinesPower + idlePower);
        updateSvgFlow('flow-bus-conveyor', conveyorPower);
        updateSvgFlow('flow-bus-hvac', hvacPower);

        // System indicators tags
        const indGrid = document.getElementById('indGrid');
        if (gridPower > 0) {
            indGrid.textContent = "Importing Power";
            indGrid.className = "status-tag status-success";
        } else {
            indGrid.textContent = "Self-Sufficient";
            indGrid.className = "status-tag status-success";
        }

        const indPF = document.getElementById('indPF');
        if (pf >= 0.95) {
            indPF.textContent = `${pf.toFixed(2)} (Excellent)`;
            indPF.style.color = "var(--success)";
        } else if (pf >= 0.90) {
            indPF.textContent = `${pf.toFixed(2)} (Good)`;
            indPF.style.color = "var(--success)";
        } else {
            indPF.textContent = `${pf.toFixed(2)} (Low PF Penalty)`;
            indPF.style.color = "var(--danger)";
        }

        document.getElementById('indBattery').textContent = `${batteryStatusText}`;
        document.getElementById('indPeak').textContent = mode === 'standard' ? 'Standard' : (mode === 'shaving' ? 'Peak Shaving Active' : 'Demand Response');
        document.getElementById('indCost').textContent = `₹${totalHourlyCost.toFixed(2)} / hr`;

        // AI Advice generation
        generateAiAdvice(pf, idleCount, renewPct, mode, gridPower);

        // ===== Wire Label Updates (kW on every wire segment) =====
        updateWireLabels(gridPower, solarPower, batteryPower, totalPower, machinesPower + idlePower, conveyorPower, hvacPower);

        // ===== Live Observation Panel Updates =====
        updateObservationPanel(gridPower, solarPower, batteryPower, totalPower, renewPct, pf, idleCount, mode, soc, loadPct, machinesPower + idlePower);

        if (isLogging) {
            recordLogItem();
        }
    }

    // Helper: dynamic animation speed matching the load
    function updateSvgFlow(elementId, powerVal) {
        const path = document.getElementById(elementId);
        if (!path) return;
        
        if (powerVal <= 0.1) {
            path.style.display = 'none';
        } else {
            path.style.display = 'block';
            // Scale animation speed: higher power draws faster animation
            const speed = Math.max(0.3, Math.min(2.5, 40 / powerVal));
            path.style.animationDuration = `${speed}s`;
        }
    }

    // Rules Engine for AI Recommendations
    function generateAiAdvice(pf, idleCount, renewPct, mode, gridPower) {
        const list = document.getElementById('aiAdviceList');
        list.innerHTML = '';
        
        let adviceHtml = '';

        if (pf < 0.90) {
            adviceHtml += `<li><i class="fa-solid fa-triangle-exclamation text-danger"></i> <strong>Critical:</strong> Power Factor is ${pf.toFixed(2)}. Install capacitor banks to avoid active utility billing penalties.</li>`;
        }
        if (idleCount > 0) {
            adviceHtml += `<li><i class="fa-solid fa-lightbulb text-warning"></i> <strong>Efficiency Tip:</strong> ${idleCount} idle machine(s) are in standby. Configure automated shutdown to save standby losses.</li>`;
        }
        if (renewPct < 0.40) {
            adviceHtml += `<li><i class="fa-solid fa-circle-info text-blue"></i> <strong>Renewables Suggestion:</strong> Expand solar photovoltaic roof array to increase offsets beyond current ${Math.round(renewPct * 100)}%.</li>`;
        }
        if (mode === 'standard' && gridPower > 80) {
            adviceHtml += `<li><i class="fa-solid fa-battery-half text-success"></i> <strong>Peak Shaving:</strong> Turn on "BESS Peak Shaving" to discharge battery energy during peak periods.</li>`;
        }
        if (mode === 'shaving' && parseFloat(batterySoc.value) < 30) {
            adviceHtml += `<li><i class="fa-solid fa-battery-quarter text-danger"></i> <strong>BESS Advisory:</strong> Battery SOC is critically low. Disable Peak Shaving to allow recharge during off-peak solar hours.</li>`;
        }

        if (adviceHtml === '') {
            adviceHtml = `<li><i class="fa-solid fa-circle-check text-success"></i> Factory energy system is running at optimal capacity configuration!</li>`;
        }

        list.innerHTML = adviceHtml;
    }

    // Add simulation run data to logs table
    function recordLogItem() {
        if (!currentCalculation) return;

        // Remove empty state placeholder row
        const emptyRow = logTableBody.querySelector('.empty-row');
        if (emptyRow) {
            emptyRow.remove();
        }

        runCount++;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${runCount}</strong></td>
            <td>${currentCalculation.machineLoad}</td>
            <td>${currentCalculation.operatingHours} hrs</td>
            <td>${currentCalculation.renewPct}</td>
            <td>${currentCalculation.idleCount} units</td>
            <td>${currentCalculation.pf}</td>
            <td>${currentCalculation.totalPower} kW</td>
            <td>${currentCalculation.totalEnergy} kWh</td>
            <td>${currentCalculation.gridEnergy} kWh</td>
            <td>${currentCalculation.carbon} kg</td>
            <td><span class="value-badge">${currentCalculation.efficiency}%</span></td>
        `;

        // Append to end of table (ascending order)
        logTableBody.appendChild(tr);
    }

    // Event listener: Run/Log button — solve model then record one row
    runBtn.addEventListener('click', () => {
        runBtn.disabled = true;
        runBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Solving...`;
        
        const svg = document.getElementById('energyTwinSvg');
        if (svg) {
            svg.style.transition = 'filter 0.15s ease';
            svg.style.filter = 'brightness(1.3) saturate(1.2)';
        }

        setTimeout(() => {
            if (svg) svg.style.filter = 'none';
            calculateAndSolve(false);  // Update SVG and KPIs
            recordLogItem();            // Append exactly one row
            runBtn.disabled = false;
            runBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> Solve &amp; Log Run`;
        }, 800);
    });

    // Reset button handler
    resetBtn.addEventListener('click', () => {
        machineLoad.value = 75;
        operatingHours.value = 8;
        renewableContribution.value = 30;
        idleMachines.value = 2;
        powerFactor.value = 0.85;
        electricityTariff.value = 8.5;
        batterySoc.value = 60;
        peakDemandMode.value = "standard";

        syncBadges();
        calculateAndSolve(false);
    });

    // Clear logs table
    clearLogBtn.addEventListener('click', () => {
        runCount = 0;
        logTableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="11">No simulation runs recorded yet. Adjust parameters and click "Run Simulation".</td>
            </tr>
        `;
    });

    // Export CSV
    exportCsvBtn.addEventListener('click', () => {
        const rows = logTableBody.querySelectorAll('tr:not(.empty-row)');
        if (rows.length === 0) { alert('No data to export yet. Run a simulation first.'); return; }

        const headers = ['Run #', 'Machine Load', 'Operating Hours', 'Renewables', 'Idle Count', 'Power Factor', 'Total Power (kW)', 'Total Energy (kWh)', 'Grid Energy (kWh)', 'Carbon (kg CO2)', 'Efficiency (%)'];
        const csvLines = [headers.join(',')];

        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td')).map(td => `"${td.innerText.trim()}"`);
            csvLines.push(cells.join(','));
        });

        const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'energy_simulation_log.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // ===================================================================
    // Wire Label Updater — kW values on every wire in the SVG
    // ===================================================================
    function updateWireLabels(gridPower, solarPower, batteryPower, totalPower, machinesPower, conveyorPower, hvacPower) {
        // Source → Transformer wires
        setWireLabel('wire-grid-kw',     'wlabel-grid-trans',     gridPower);
        setWireLabel('wire-solar-kw',    'wlabel-solar-trans',    solarPower);
        setWireLabel('wire-battery-kw',  'wlabel-battery-trans',  batteryPower);

        // Transformer → Busbar (total load flowing through)
        setWireLabel('wire-total-kw',    'wlabel-trans-bus',      totalPower);

        // Busbar → Load feeders
        setWireLabel('wire-machines-kw', 'wlabel-bus-machines',   machinesPower);
        setWireLabel('wire-conveyor-kw', 'wlabel-bus-conveyor',   conveyorPower);
        setWireLabel('wire-hvac-kw',     'wlabel-bus-hvac',       hvacPower);
    }

    function setWireLabel(textId, groupId, powerVal) {
        const textEl = document.getElementById(textId);
        const groupEl = document.getElementById(groupId);
        if (!textEl || !groupEl) return;

        if (powerVal <= 0.1) {
            groupEl.style.opacity = '0.25';
            textEl.textContent = '0 kW';
        } else {
            groupEl.style.opacity = '1';
            textEl.textContent = `${powerVal.toFixed(1)} kW`;
        }
    }

    // ===================================================================
    // Observation Panel — 4 real-time English narrative sentences
    // ===================================================================
    function updateObservationPanel(gridPower, solarPower, batteryPower, totalPower, renewPct, pf, idleCount, mode, soc, loadPct, machinesPower) {
        // Sentence 1: Grid source narrative
        const s1 = document.querySelector('#obs-sentence-1 span');
        if (s1) {
            const gridPct = totalPower > 0 ? ((gridPower / totalPower) * 100).toFixed(0) : 0;
            if (gridPower <= 0.1) {
                s1.textContent = `The factory is fully self-sufficient. Zero power is drawn from the utility grid.`;
            } else if (gridPct > 80) {
                s1.textContent = `The grid is the main power source, supplying ${gridPower.toFixed(1)} kW which is ${gridPct}% of total demand.`;
            } else if (gridPct > 50) {
                s1.textContent = `The grid is providing ${gridPower.toFixed(1)} kW (${gridPct}% of total demand), and other sources supply the rest.`;
            } else {
                s1.textContent = `Grid import is low at ${gridPower.toFixed(1)} kW (${gridPct}% of demand). Most power comes from local generation.`;
            }
        }

        // Sentence 2: Solar contribution narrative
        const s2 = document.querySelector('#obs-sentence-2 span');
        if (s2) {
            const solarPctOfLoad = totalPower > 0 ? ((solarPower / totalPower) * 100).toFixed(0) : 0;
            if (solarPower <= 0.1) {
                s2.textContent = `Solar panels are producing 0 kW. Solar contribution is zero because the slider is at 0%.`;
            } else if (renewPct >= 0.7) {
                s2.textContent = `Solar panels are generating a strong ${solarPower.toFixed(1)} kW, covering ${solarPctOfLoad}% of the factory demand.`;
            } else if (renewPct >= 0.3) {
                s2.textContent = `Solar panels are producing ${solarPower.toFixed(1)} kW, which offsets ${solarPctOfLoad}% of the total demand.`;
            } else {
                s2.textContent = `Solar output is low at ${solarPower.toFixed(1)} kW, covering only ${solarPctOfLoad}% of the load.`;
            }
        }

        // Sentence 3: Battery / BESS narrative
        const s3 = document.querySelector('#obs-sentence-3 span');
        if (s3) {
            if (mode === 'standard') {
                if (soc < 20) {
                    s3.textContent = `The battery has a low charge of ${soc}%. It cannot discharge until it is recharged above 20%.`;
                } else {
                    s3.textContent = `The battery is charged at ${soc}% but is idle. Change the Peak Demand Mode to use battery power.`;
                }
            } else if (mode === 'shaving') {
                if (batteryPower > 0.1) {
                    s3.textContent = `Peak Shaving mode is active. The battery is discharging ${batteryPower.toFixed(1)} kW to help reduce peak grid bills.`;
                } else {
                    s3.textContent = `Peak Shaving is selected, but the battery cannot discharge because charge is below 20%.`;
                }
            } else { // demand response
                if (batteryPower > 0.1) {
                    s3.textContent = `Demand Response mode is active. The battery is discharging ${batteryPower.toFixed(1)} kW to support the grid.`;
                } else {
                    s3.textContent = `Demand Response is selected, but the battery has too low of a charge (${soc}%) to discharge.`;
                }
            }
        }

        // Sentence 4: Factory load and efficiency narrative
        const s4 = document.querySelector('#obs-sentence-4 span');
        if (s4) {
            const loadPctDisplay = (loadPct * 100).toFixed(0);
            if (idleCount >= 5) {
                s4.textContent = `${idleCount} machines are idle in standby, wasting energy. Active machines are running at ${loadPctDisplay}% capacity.`;
            } else if (idleCount > 0) {
                if (pf < 0.85) {
                    s4.textContent = `Active machines are running at ${loadPctDisplay}% capacity. Power factor is low at ${pf.toFixed(2)}, causing energy losses.`;
                } else {
                    s4.textContent = `Active machines are running at ${loadPctDisplay}% capacity. There are ${idleCount} machines in standby wasting small standby power.`;
                }
            } else {
                if (loadPct >= 0.9) {
                    s4.textContent = `All machines are running near maximum capacity at ${loadPctDisplay}% load, drawing ${machinesPower.toFixed(1)} kW.`;
                } else {
                    s4.textContent = `All machines are active at ${loadPctDisplay}% load. There is no standby power waste.`;
                }
            }
        }
    }

    // Initialize UI on load
    syncBadges();
    calculateAndSolve(false);
    // Sync heights after a short delay to let layout paint first
    setTimeout(syncPanelHeights, 50);
});
