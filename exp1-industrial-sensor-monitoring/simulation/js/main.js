const temperature = document.getElementById("temperature");
const pressure = document.getElementById("pressure");
const vibration = document.getElementById("vibration");
const humidity = document.getElementById("humidity");

const tempValue = document.getElementById("tempValue");
const pressureValue = document.getElementById("pressureValue");
const vibrationValue = document.getElementById("vibrationValue");
const humidityValue = document.getElementById("humidityValue");

const tempDisplay = document.getElementById("tempDisplay");
const pressureDisplay = document.getElementById("pressureDisplay");
const vibrationDisplay = document.getElementById("vibrationDisplay");
const humidityDisplay = document.getElementById("humidityDisplay");

const healthPercent = document.getElementById("healthPercent");

const overallStatus = document.getElementById("overallStatus");
const riskLevel = document.getElementById("riskLevel");
const performanceIndex = document.getElementById("performanceIndex");
const reliability = document.getElementById("reliability");
const maintenance = document.getElementById("maintenance");

const observation = document.getElementById("observation");
const recommendation = document.getElementById("recommendation");

const tempAlarm = document.getElementById("tempAlarm");
const pressureAlarm = document.getElementById("pressureAlarm");
const vibrationAlarm = document.getElementById("vibrationAlarm");
const humidityAlarm = document.getElementById("humidityAlarm");

const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");

const logTable = document.getElementById("logTable");

/* LIVE VALUE UPDATE */

temperature.addEventListener("input", () => {
    tempValue.textContent = temperature.value;
    tempDisplay.textContent = temperature.value + " °C";
});

pressure.addEventListener("input", () => {
    pressureValue.textContent = pressure.value;
    pressureDisplay.textContent = pressure.value + " Bar";
});

vibration.addEventListener("input", () => {
    vibrationValue.textContent = vibration.value;
    vibrationDisplay.textContent = vibration.value + " mm/s";
});

humidity.addEventListener("input", () => {
    humidityValue.textContent = humidity.value;
    humidityDisplay.textContent = humidity.value + " %";
});

/* MAIN CALCULATION */

calculateBtn.addEventListener("click", () => {

    const temp = Number(temperature.value);
    const pres = Number(pressure.value);
    const vib = Number(vibration.value);
    const hum = Number(humidity.value);

    let health =
        100
        - ((temp - 40) * 1.5)
        - ((pres - 5) * 3)
        - ((vib - 5) * 4)
        - (Math.abs(hum - 50) * 0.4);

    health = Math.max(0, Math.min(100, health));
    health = Math.round(health);

    healthPercent.textContent = health + "%";

    updateGauge(health);
    updateKPIs(health);
    updateAlarms(temp, pres, vib, hum);
    updateObservation(health, temp, vib);

    addLog(
        temp,
        pres,
        vib,
        hum,
        health
    );

});

/* HEALTH GAUGE */

function updateGauge(health) {

    const circle =
        document.querySelector(".health-circle");

    if (health >= 85) {

        circle.style.background =
        "linear-gradient(135deg,#22c55e,#15803d)";

    }

    else if (health >= 60) {

        circle.style.background =
        "linear-gradient(135deg,#facc15,#ca8a04)";

    }

    else {

        circle.style.background =
        "linear-gradient(135deg,#ef4444,#b91c1c)";

    }

}

/* KPI ENGINE */

function updateKPIs(health) {

    if (health >= 90) {

        overallStatus.textContent = "Excellent";
        riskLevel.textContent = "Low";
        reliability.textContent = "Very High";
        maintenance.textContent = "30 Days";

    }

    else if (health >= 75) {

        overallStatus.textContent = "Good";
        riskLevel.textContent = "Medium";
        reliability.textContent = "High";
        maintenance.textContent = "21 Days";

    }

    else if (health >= 60) {

        overallStatus.textContent = "Warning";
        riskLevel.textContent = "High";
        reliability.textContent = "Moderate";
        maintenance.textContent = "10 Days";

    }

    else {

        overallStatus.textContent = "Critical";
        riskLevel.textContent = "Critical";
        reliability.textContent = "Low";
        maintenance.textContent = "Immediate";

    }

    performanceIndex.textContent = health;

}

/* ALARM ENGINE */

function updateAlarms(
    temp,
    pres,
    vib,
    hum
) {

    tempAlarm.textContent =
        temp > 70
        ? "🔴 Critical"
        : temp > 55
        ? "🟡 Warning"
        : "🟢 Normal";

    pressureAlarm.textContent =
        pres > 12
        ? "🔴 Critical"
        : pres > 8
        ? "🟡 Warning"
        : "🟢 Normal";

    vibrationAlarm.textContent =
        vib > 12
        ? "🔴 Critical"
        : vib > 8
        ? "🟡 Warning"
        : "🟢 Normal";

    humidityAlarm.textContent =
        (hum > 80 || hum < 20)
        ? "🔴 Critical"
        : (hum > 70 || hum < 30)
        ? "🟡 Warning"
        : "🟢 Normal";

}

/* OBSERVATION ENGINE */

function updateObservation(
    health,
    temp,
    vib
) {

    if (health >= 90) {

        observation.textContent =
        "Machine is operating under ideal industrial conditions. All monitored parameters remain within safe operating limits.";

        recommendation.textContent =
        "Continue routine monitoring and follow preventive maintenance schedules.";

    }

    else if (health >= 75) {

        observation.textContent =
        "Machine performance is stable. Some parameters are approaching operational thresholds.";

        recommendation.textContent =
        "Monitor temperature and vibration levels regularly to prevent future degradation.";

    }

    else if (health >= 60) {

        observation.textContent =
        "Abnormal machine conditions detected. Performance degradation may occur if corrective actions are not taken.";

        recommendation.textContent =
        "Inspect bearings, cooling systems and pressure controls immediately.";

    }

    else {

        observation.textContent =
        "Critical machine condition detected. Failure probability is significantly high.";

        recommendation.textContent =
        "Stop operation and perform corrective maintenance immediately.";

    }

}

/* DATA LOG */

function addLog(
    temp,
    pres,
    vib,
    hum,
    health
) {

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${new Date().toLocaleTimeString()}</td>
        <td>${temp}</td>
        <td>${pres}</td>
        <td>${vib}</td>
        <td>${hum}</td>
        <td>${health}%</td>
    `;

    logTable.appendChild(row);

}

/* RESET */

resetBtn.addEventListener("click", () => {

    temperature.value = 40;
    pressure.value = 5;
    vibration.value = 5;
    humidity.value = 50;

    tempValue.textContent = 40;
    pressureValue.textContent = 5;
    vibrationValue.textContent = 5;
    humidityValue.textContent = 50;

    tempDisplay.textContent = "40 °C";
    pressureDisplay.textContent = "5 Bar";
    vibrationDisplay.textContent = "5 mm/s";
    humidityDisplay.textContent = "50 %";

    healthPercent.textContent = "100%";

    overallStatus.textContent = "Excellent";
    riskLevel.textContent = "Low";
    performanceIndex.textContent = "100";
    reliability.textContent = "High";
    maintenance.textContent = "30 Days";

    observation.textContent =
    "Machine operating under normal conditions.";

    recommendation.textContent =
    "Continue monitoring regularly.";

    tempAlarm.textContent = "🟢 Normal";
    pressureAlarm.textContent = "🟢 Normal";
    vibrationAlarm.textContent = "🟢 Normal";
    humidityAlarm.textContent = "🟢 Normal";

    logTable.innerHTML = "";

    updateGauge(100);

});