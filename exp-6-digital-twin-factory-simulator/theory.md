# Theory

## Introduction

A **Digital Twin** is a highly complex virtual model that serves as the exact counterpart (or twin) of a physical entity, system, or process. In the context of Industry 4.0 and Smart Factories, Digital Twins are utilized to continuously monitor manufacturing floors, analyze production performance, predict mechanical failures, and optimize factory operations in real-time.

Unlike conventional static computer simulations, a Digital Twin continuously exchanges information with its physical counterpart through Industrial Internet of Things (IIoT) sensors, enabling live dynamic visualization, analytics, and intelligent decision-making.

This experiment demonstrates a **full Digital Twin for a smart manufacturing factory floor**. The simulator presents a live SVG-based factory visualization divided into four production zones, allowing users to manipulate four key operational parameters — **Machine Count**, **Production Rate**, **Power Usage**, and **Downtime Probability** — and observe their direct impact on Overall Equipment Effectiveness (OEE), machine utilization, production output, and energy consumption in real time.

---

## The Factory Floor Layout

The digital twin visualizes a complete factory floor organized into **four distinct production zones**, each housing specialized equipment:

### Zone A — Assembly (CNC Machines)
Three Computer Numerical Control (CNC) machines — **CNC-01**, **CNC-02**, and **CNC-03** — are housed in this zone. Each CNC machine features:
- A **rotating spindle** (animated in real time) whose speed is proportional to the configured Production Rate.
- An embedded **data screen** displaying internal status lines.
- A **Status LED** that turns green when the factory is operating above 65% OEE, and red when OEE drops below this threshold.
- A **WiFi beacon** (IoT sensor indicator) that pulses to show active data transmission.

CNC machines are automated milling devices that manufacture precise industrial parts by removing material from a workpiece using rotary cutting tools. In the digital twin, the spinning spindle animation directly reflects how fast the machining process is running.

### Zone B — Machining (Robotic Arms)
Two articulated robotic arms — **ROB-01** and **ROB-02** — operate in the machining zone. These arms perform picking, placing, and assembly tasks. In the simulator:
- The robotic arms **oscillate back and forth** with sinusoidal motion, representing continuous pick-and-place operations.
- ROB-01 and ROB-02 swing in **opposite phases** to simulate coordinated dual-arm assembly.
- Each arm includes a **tool tip** (red dot) that traces the arm's kinematic path, and a shoulder/elbow joint system with visible articulation.
- A WiFi beacon on each robot indicates real-time sensor connectivity.

### Zone C — Packaging
Two packaging stations — **PACK-01** and **PACK-02** — receive assembled products from the conveyor belt and package them for dispatch. The digital twin displays colored product boxes within each station to visualize the packaging process.

### Zone D — Storage & Logistics (AGVs)
The bottom section of the factory floor houses:
- **Two Automated Guided Vehicles (AGVs)**: **AGV-A** (blue) and **AGV-B** (amber) traverse a curved logistics track autonomously.
  - AGV-A carries a visible **cargo box** that loads at one end and unloads at the other.
  - AGV speed is proportional to the Production Rate — higher production rates cause AGVs to move faster to keep up with material demand.
- **Two Storage Racks**: **RACK-01** and **RACK-02** display inventory items as colored blocks representing different product categories.

### Main Conveyor Belt
A full-width conveyor belt spans the factory between the upper production zones and the lower logistics zone. It features:
- **Animated seam lines** that move from left to right, conveying the direction of material flow.
- **Products** (amber and orange boxes) that spawn on the belt at a rate proportional to the Production Rate and travel across the factory.
- **Three IoT sensors** (blue glowing dots) positioned along the belt that represent quality inspection and monitoring checkpoints.
- **Safety stripe borders** (yellow/black hazard pattern) following industrial safety standards.

---

## Factory Control Parameters

The simulator provides **four slider controls** that the user can adjust in real time. Each slider directly influences the factory's OEE calculation and overall behavior:

### 1. Machine Count (1 – 50 machines)
Represents the number of active CNC machines on the factory floor. Increasing the machine count boosts the factory's **Performance** factor and **Machine Utilization**, allowing higher overall output. However, more machines also consume more energy and require more coordinated logistics.

### 2. Production Rate (10 – 1,000 units/hr)
Sets the target production throughput. This parameter affects:
- The **Performance** component of OEE (higher rate → higher performance, up to the theoretical maximum).
- The **conveyor belt speed** (products and seam lines move faster at higher rates).
- The **AGV speed** (AGVs travel faster to supply materials at higher rates).
- The **CNC spindle rotation speed** (faster machining at higher rates).
- The **product spawn rate** on the conveyor belt.

### 3. Power Usage (10 – 500 kW)
Controls the total electrical power allocated to the factory machines. This parameter directly impacts the **Quality** component of OEE:
- **Standard range (80–350 kW)**: Quality remains at or near 100%.
- **Overdrive (> 350 kW)**: Pushing power beyond the standard limit increases output temporarily, but quality degrades progressively. The excess power causes excessive vibration and heat, generating defects.
- **Underpowered (< 80 kW)**: Running machines below minimum power thresholds results in a fixed quality penalty of 30% (quality drops to 0.70).

### 4. Downtime Probability (0 – 100%)
Represents the likelihood of unplanned machine downtime due to mechanical failures, maintenance needs, or environmental factors. This parameter directly controls the **Availability** component of OEE:
- **Availability = 1 − (Downtime / 100)**
- Higher downtime probability reduces the time the factory is actually producing, causing OEE to drop.

---

## Overall Equipment Effectiveness (OEE)

The core metric used to evaluate manufacturing productivity in a smart factory is **Overall Equipment Effectiveness (OEE)**. It is the internationally recognized standard for measuring manufacturing efficiency and is calculated as the product of three distinct factors:

$$\text{OEE} = \text{Availability} \times \text{Performance} \times \text{Quality} \times 100\%$$

### Availability
Availability measures the percentage of scheduled time that the operation is actually running.

$$\text{Availability} = 1 - \frac{\text{Downtime Probability}}{100}$$

- *Downtime Events*: Mechanical failures, unplanned maintenance, environmental disruptions.
- When the Downtime Probability slider is at 0%, Availability is 100% (no downtime). At 100%, Availability drops to 0% (factory is completely halted).

### Performance
Performance measures how close the factory is running to its theoretical maximum output capacity.

$$\text{Performance} = \text{clamp}\left(\frac{\text{Production Rate}}{1000} \times \frac{\text{Machine Count}}{50} \times 2.5,\ 0,\ 1\right)$$

- Performance depends on both the production rate and the number of active machines.
- A higher production rate with more machines pushes performance closer to 100%.
- The `clamp(0, 1)` function ensures Performance stays within the valid 0–100% range.

### Quality
Quality measures the proportion of manufactured parts that meet quality standards (Good Parts vs. Defects).

$$\text{Quality} = \begin{cases}
1.0 - \frac{\text{Power} - 350}{400} & \text{if Power} > 350 \text{ kW (overdrive)} \\
0.70 & \text{if Power} < 80 \text{ kW (underpowered)} \\
1.0 & \text{otherwise (standard range)}
\end{cases}$$

- Quality is clamped between 0.35 and 1.0.
- *Defect Generation*: Operating machines in overdrive mode (> 350 kW) creates excessive vibration and heat, directly increasing the defect rate and lowering quality.

> **Note:** A small random perturbation (±1%) is added to the computed OEE each tick to simulate real-world sensor noise and measurement variability.

---

## Machine Utilization

Machine Utilization indicates what proportion of the installed machine capacity is actively engaged in production:

$$\text{Utilization} = \text{clamp}\left(\frac{\text{Machine Count}}{50} \times \text{Performance} \times 100,\ 0,\ 100\right)$$

A small random noise (±1.5%) is added to simulate real-world variability. High utilization (≥ 80%) indicates the factory is making efficient use of its installed capacity, while low utilization suggests overcapacity or suboptimal configuration.

---

## Production Output

Actual production output (in units per hour) represents the real throughput of the factory, accounting for efficiency losses:

$$\text{Output} = \text{Production Rate} \times \frac{\text{OEE}}{100} \times \frac{\text{Machine Count}}{25}$$

This metric shows how many good units the factory actually produces, factoring in downtime, performance losses, and quality defects.

---

## Energy Consumption

Energy consumption (in kW) reflects the factory's real-time power draw:

$$\text{Energy} = \text{Power Setting} \times (0.9 + \text{random} \times 0.2)$$

The ±10% variation simulates the real-world fluctuation in energy demand caused by varying machine loads, motor ramp-up/down cycles, and HVAC systems.

---

## Digital Twin Visualization Layers

The SVG factory visualization supports **six overlay tabs** that highlight different aspects of the factory:

| Tab | Description |
|-----|-------------|
| **Machines** | Default view showing all CNC machines, robotic arms, and packaging stations with their real-time animations |
| **Conveyor** | Highlights the main conveyor belt, moving products, and material flow direction |
| **AGVs** | Focuses on the automated guided vehicles and their logistics routes |
| **Sensors** | Overlays sensor coverage radii (blue dashed circles) on each machine and conveyor section, visualizing IoT monitoring zones |
| **Power Grid** | Displays the electrical power distribution network — amber dashed lines connecting each CNC machine to the main power junction |
| **Storage** | Highlights the storage racks and inventory visualization in Zone D |

---

## Digital Twin Capabilities

### 1. Live Interactive Diagnostics (AI Diagnostic)
The factory status panel on the right side continuously displays an **AI-generated diagnostic message** that adapts based on current OEE:
- **OEE ≥ 85%**: "Factory running at X% OEE. All KPIs within optimal range."
- **65% ≤ OEE < 85%**: "Moderate efficiency. Review downtime probability and power usage."
- **OEE < 65%**: "⚠ Critical — OEE dropped to X%. Immediate intervention required."

### 2. AI Recommendations Panel
The simulator generates **five context-aware recommendations** that update in real time based on all four control parameters:
- **Machine Utilization**: Flags when utilization is below 80% and suggests increasing machine count.
- **Production Output**: Compares actual output to the configured target and flags underperformance.
- **Energy Consumption**: Warns when power exceeds 350 kW and recommends scheduling idle machines.
- **Downtime Assessment**: Recommends predictive maintenance when downtime exceeds 20%, or monitoring when above 5%.
- **Overall OEE Assessment**: Provides a summary recommendation based on the combined OEE score.

Each recommendation is color-coded: 🟢 Green (healthy), 🟡 Amber (warning), 🔴 Red (critical).

### 3. Factory Zone Heatmap
The heatmap displays the **activity intensity** of each factory zone using color-coded bars and an SVG grid:
- **Zone A (Assembly)**: Activity driven by Production Rate × (1 − Downtime/100).
- **Zone B (Machining)**: Activity driven by Machine Count × Power allocation.
- **Zone C (Packaging)**: Follows Zone A at ~85% capacity (downstream dependency).
- **Zone D (Storage)**: Activity driven by Production Rate (logistics demand).

Colors range from Green (low activity) → Amber → Orange → Red (critical load).

### 4. KPI Trend Chart
A real-time **time-series line chart** (powered by Chart.js) continuously tracks three key metrics over the last 20 simulation ticks:
- **Efficiency (OEE %)** — Green line with filled area
- **Machine Utilization (%)** — Blue line with filled area
- **Energy Consumption (kW)** — Amber line

This allows operators to visualize trends over time and recognize how parameter changes propagate through the system.

### 5. Factory Status Dashboard
The right panel displays real-time factory status metrics:
- **Machine Status**: Running / Standby
- **Factory Health**: Derived from downtime and OEE (100 − Downtime − penalty if OEE < 60%)
- **Downtime**: Current downtime probability percentage
- **Power Usage**: Current energy consumption in kW
- **Production State**: Optimal (OEE ≥ 85%) / Moderate (≥ 65%) / Critical (< 65%)
- **Alarm Status**: "High Downtime!" / "Low Efficiency!" / "No Alarms"

### 6. Data Logging & Export
The **Factory Event Log** allows users to:
- **Record Data**: Capture a snapshot of the current configuration (Run #, Machine Count, Production Rate, Efficiency, Power Usage, Downtime, Status) into a scrollable log table.
- **Export CSV**: Download all recorded log entries as a CSV file for external analysis in spreadsheet tools or data science platforms.

### 7. Interventions
Two predefined intervention actions allow users to simulate maintenance and optimization:
- **Schedule Maintenance**: Reduces the Downtime Probability by 10 percentage points (simulating the benefit of proactive maintenance scheduling).
- **Optimize Power**: Reduces Power Usage by 30 kW (simulating an energy optimization routine that eliminates waste without affecting output quality).

---

## Advantages of Factory Digital Twins

- **Zero-Risk Experimentation**: Test new production targets, machine counts, and power configurations virtually before applying them to a physical factory.
- **Predictive Maintenance**: Use downtime probability modeling to anticipate and prevent equipment failures before they halt production.
- **Real-Time Monitoring**: Continuously track OEE, utilization, output, and energy — catching degradation the moment it begins.
- **AI-Powered Insights**: Leverage context-aware recommendations to make data-driven decisions about factory configuration.
- **Data-Driven Optimization**: Record multiple configurations and compare them via the event log and CSV export to find the optimal operating point.
- **Multi-Layer Visualization**: View the factory from multiple perspectives (machines, sensors, power grid, logistics) to understand the complete system.
- **Remote Operations**: Monitor and intervene in factory operations from anywhere — the digital twin provides full operational transparency through a web browser.