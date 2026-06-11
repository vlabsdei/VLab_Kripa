# Theory

## Introduction

Industrial Sensor Monitoring is a fundamental component of Industry 4.0 and Smart Manufacturing systems. Modern factories use sensors to continuously monitor machine conditions, detect abnormalities, and prevent unexpected failures.

The collected sensor data is analyzed in real time to evaluate machine health and support predictive maintenance strategies. This reduces downtime, improves operational efficiency, and enhances workplace safety.

---

## Objectives

The objectives of this experiment are:

- To understand the role of industrial sensors in smart manufacturing.
- To study machine health monitoring and diagnostic techniques.
- To analyze the effect of different sensor parameters on machine performance.
- To understand predictive maintenance concepts.
- To observe how abnormal conditions and faults impact machine health scores.
- To study signal noise and data logger collection in SCADA environments.

---

## Industrial Sensors

Industrial sensors convert physical quantities into measurable signals that can be processed by monitoring systems.

Common sensors used in smart factories include:

| Sensor Type | Parameter Measured | Primary Industrial Application |
|------------|-------------------|-------------------------------|
| Temperature Sensor (RTD/Thermocouple) | Temperature | Overheating detection in bearings, stators, and gearboxes |
| Pressure Sensor (Piezoelectric) | Pressure | Fluid pressure in pump discharge, pneumatic compression lines |
| Vibration Sensor (Accelerometers) | Mechanical Vibrations | Fault detection in rotating shafts, imbalances, and bearing wear |
| Humidity Sensor (Capacitive) | Relative Humidity | Moisture monitoring in sensitive electrical winding cabinets |
| Proximity Sensor | Object Detection | Speed tracking, shaft revolutions (RPM), indexing alignment |
| Current Sensor (Hall Effect) | Electrical Current | Stator phase load balancing, power consumption tracking |

---

## Temperature Monitoring

Temperature monitoring helps identify overheating conditions in machines. Excessive temperature may indicate:

- Motor stator overloading
- Bearing lubrication starvation
- Excess shaft misalignment friction
- Air line cooling failures

---

## Pressure Monitoring

Pressure sensors are used in hydraulic and pneumatic systems. Pressure variations may indicate:

- Outlet blockages and pressure buildup
- Tubing leaks and pressure collapse
- Impeller cavitation or pump starvation

---

## Vibration Monitoring

Vibration analysis is one of the most critical techniques used for predictive maintenance. Vibration is typically analyzed via its Root Mean Square (RMS) acceleration or velocity to measure the total energy of the vibration signal:

$$
V_{RMS} = \sqrt{\frac{1}{N}\sum_{i=1}^{N}V_i^2}
$$

Where:
- $V_{RMS}$ = Effective Vibration Value (mm/s)
- $V_i$ = Individual High-Frequency Vibration Readings
- $N$ = Number of samples

High vibration levels indicate mechanical problems such as shaft misalignment, bearing degradation, or rotor imbalances.

---

## Humidity Monitoring

Humidity affects machinery insulation performance and environmental conditions. High humidity can result in:
- Winding insulation breakdown
- Internal component corrosion
- Electrical leakage currents

---

## Predictive Maintenance & Health Calculation

In this advanced simulation, Machine Health is computed dynamically using predictive risk models. Rather than simple singular thresholds, the system computes specific mechanical risks—**Cavitation Risk** and **Bearing Wear**—which then determine the overall Machine Health Index.

### 1. Risk Penalty Functions

The algorithms evaluate continuous sensor inputs to estimate physical degradation percentages (0% to 100%):

- **Cavitation Risk**: Primarily driven by combinations of abnormally low fluid pressure and high-frequency vibration spikes (often seen in pumps and compressors). For example, if pressure drops below critical limits while vibration increases, the risk of fluid cavitation bubbles imploding against the impeller skyrockets.
- **Bearing Wear**: Driven by excessive physical vibration (friction) combined with severe thermal overheating (temperature spikes). Prolonged high temperatures degrade bearing lubrication, leading to metal-on-metal abrasion.

### 2. Overall Health Index

The overall Machine Health Score is calculated by applying a weighted deduction based on the highest active predictive risks:

$$
Health\ Score = 100 - (Cavitation\ Risk \times 0.6 + Bearing\ Wear \times 0.6)
$$

If a critical fault is actively injected (like a forced Thermal Overload), the system automatically enforces a heavy penalty limit, dropping the health score firmly into the "Critical" zone (below 60).

The machine health score indicates the operational status of the machinery:

| Health Score | Condition | Diagnostic Response |
|-------------|-----------|--------------------|
| 90 - 100 | Excellent | Nominal parameters. Normal operations. |
| 75 - 89 | Good | Acceptable range. Periodic monitoring. |
| 60 - 74 | Warning | Minor abnormality. Schedule routine maintenance. |
| Below 60 | Critical | Emergency threshold. Automatic or manual shutdown required. |

---

## Physical Fault Mechanisms

Predictive maintenance algorithms analyze multi-sensor anomalies to predict specific failures:

### 1. Cavitation (Pumps)
Cavitation occurs when fluid pressure drops below vapor pressure, causing vapor bubbles to form and implode violently. This manifests as a sudden drop in pressure accompanied by severe high-frequency vibration spikes.

### 2. Bearing Wear (Motors / Pumps)
Rotary bearing degradation causes metal-on-metal friction. This is characterized by a steady increase in mechanical vibrations ($V_{RMS}$) and localized frictional temperature rise.

### 3. Stator Winding Overload (Motors)
High currents or phase imbalances heat stator coils. This degrades insulation, risking winding short circuits, indicated by thermal spikes and high sensitivity to ambient humidity.

### 4. Air Line Leakage (Compressors)
Pneumatic line fatigue leads to gas escape. This results in pressure collapse accompanied by compression cooling (since expanding air absorbs heat).

---

## Signal Noise & Filtering

In industrial plants, sensors capture high-frequency physical vibrations, electrical EMI, and thermal drafts. This manifests as **noise** in raw SCADA telemetry. Signal processing algorithms use filtering techniques (e.g., low-pass or Kalman filters) to smooth sensor data before health scoring.

---

## Simulation Parameters

The simulator allows interactive control over physical parameters:

| Parameter | Operating Range |
|------------|---------|
| Temperature | $0^\circ\text{C} – 150^\circ\text{C}$ |
| System Pressure | $0.0\text{ bar} – 50.0\text{ bar}$ |
| Vibration RMS | $0.0\text{ mm/s} – 30.0\text{ mm/s}$ |
| Relative Humidity | $0\% – 100\%$ |