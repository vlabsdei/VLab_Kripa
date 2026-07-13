# Theory

## Introduction

A **Digital Twin** is a highly sophisticated virtual representation that serves as the exact counterpart (or twin) of a physical entity, system, or process. In the context of **Industry 4.0** and **Smart Factories**, Digital Twins are used to continuously monitor manufacturing operations, analyze production performance, predict mechanical failures, and optimize factory processes in real time.

Unlike conventional static computer simulations, a Digital Twin continuously exchanges information with its physical counterpart through **Industrial Internet of Things (IIoT)** sensors, enabling live monitoring, dynamic visualization, real-time analytics, and intelligent decision-making.

This experiment demonstrates a **Digital Twin of a Smart Manufacturing Factory Floor**. The simulator presents a live SVG-based factory visualization divided into **four production zones**, allowing users to manipulate four key operational parameters—**Machine Count**, **Production Rate**, **Power Usage**, and **Downtime Probability**—and observe their direct impact on **Overall Equipment Effectiveness (OEE)**, machine utilization, production output, and energy consumption in real time.

The Digital Twin continuously updates the factory state based on the selected operating conditions, providing a realistic representation of how changes in production parameters influence manufacturing efficiency, equipment availability, and overall plant performance.

---

## Factory Floor Layout

The Digital Twin visualizes a complete smart manufacturing factory floor organized into **four distinct production zones**, each containing specialized industrial equipment that performs a specific stage of the manufacturing process.

### Zone A — Assembly (CNC Machines)

This zone contains three Computer Numerical Control (CNC) machines — **CNC-01**, **CNC-02**, and **CNC-03**. Each CNC machine includes the following features:

- A **rotating spindle** (animated in real time) whose rotational speed is proportional to the configured **Production Rate**.
- An embedded **data display panel** showing internal machine status information.
- A **Status LED** that glows **green** when the factory operates above **65% Overall Equipment Effectiveness (OEE)** and turns **red** when the OEE falls below this threshold.
- A pulsing **WiFi beacon** representing continuous Industrial IoT (IIoT) communication with the Digital Twin.

CNC machines are automated manufacturing systems that produce high-precision industrial components by removing material from a workpiece using rotating cutting tools. In the Digital Twin, the spindle rotation speed directly represents the machining activity and production intensity.

---

### Zone B — Machining (Robotic Arms)

The machining zone consists of two articulated robotic manipulators — **ROB-01** and **ROB-02** — responsible for automated pick-and-place and assembly operations.

The simulator models the following robotic behaviors:

- The robotic arms **oscillate continuously** using sinusoidal motion to simulate repetitive industrial pick-and-place operations.
- **ROB-01** and **ROB-02** operate in **opposite phases**, representing coordinated dual-arm manufacturing.
- Each robotic arm contains a visible **tool tip** (red indicator), shoulder joint, and elbow joint to illustrate realistic articulated motion.
- A pulsing **WiFi beacon** on each robot indicates continuous communication with the factory monitoring system.

---

### Zone C — Packaging

The packaging zone contains two automated packaging stations — **PACK-01** and **PACK-02**.

These stations receive finished products from the conveyor system, package them for shipment, and prepare them for storage and distribution.

The Digital Twin displays colored product boxes inside each packaging station to visually represent the packaging process during factory operation.

---

### Zone D — Storage & Logistics (AGVs)

The lower section of the factory represents the storage and logistics area.

It contains:

- **Two Automated Guided Vehicles (AGVs)** — **AGV-A** (Blue) and **AGV-B** (Amber) — that autonomously travel along a predefined curved logistics path.
    - **AGV-A** carries a visible cargo container that is loaded at one end of the route and unloaded at the destination.
    - The movement speed of both AGVs is directly proportional to the configured **Production Rate**, ensuring that material transportation matches production demand.

- **Two Storage Racks** — **RACK-01** and **RACK-02** — displaying inventory items as colored storage blocks representing different categories of manufactured products.

---

### Main Conveyor Belt

A full-width conveyor belt connects the upper production zones with the lower logistics area, enabling continuous product transportation throughout the factory.

The conveyor system includes:

- **Animated seam lines** moving from left to right to indicate the direction of material flow.
- **Moving products** (amber and orange boxes) that are generated according to the configured **Production Rate** and transported across the production line.
- **Three Industrial IoT sensors** (blue illuminated indicators) positioned along the conveyor belt to represent automated inspection and process monitoring checkpoints.
- **Industrial safety stripes** (yellow-black hazard markings) placed along the conveyor boundaries to represent standard factory safety practices.

---

## Factory Control Parameters

The simulator provides **four interactive slider controls** that allow users to modify the operating conditions of the smart factory in real time. Each control directly influences the Overall Equipment Effectiveness (OEE) calculation and dynamically updates the Digital Twin visualization.

---

### 1. Machine Count (1 – 50 Machines)

This parameter represents the total number of active CNC machines operating on the factory floor.

Increasing the machine count improves the factory's **Performance** factor and **Machine Utilization**, resulting in higher production output. However, operating more machines also increases energy consumption and places greater demand on the factory's logistics and material handling systems.

---

### 2. Production Rate (10 – 1,000 Units/hr)

This parameter specifies the target production throughput of the factory.

It directly affects:

- The **Performance** component of OEE (higher production rate increases performance up to the theoretical maximum).
- The **Conveyor Belt Speed**, causing products and conveyor seam lines to move faster.
- The **Automated Guided Vehicle (AGV) Speed**, allowing AGVs to transport materials more rapidly.
- The **CNC Spindle Rotation Speed**, representing faster machining operations.
- The **Product Spawn Rate** on the conveyor belt.

---

### 3. Power Usage (10 – 500 kW)

This parameter controls the total electrical power supplied to the factory machines.

It directly influences the **Quality** component of OEE.

- **Standard Operating Range (80–350 kW):** Product quality remains at or close to **100%**.

- **Overdrive Mode (>350 kW):** Supplying power above the recommended operating range temporarily increases production capability, but product quality gradually decreases due to excessive vibration, overheating, and increased defect generation.

- **Underpowered Operation (<80 kW):** Operating below the minimum recommended power level results in a fixed **30% quality penalty**, reducing the Quality factor to **0.70**.

---

### 4. Downtime Probability (0 – 100%)

This parameter represents the probability of unplanned production downtime caused by mechanical failures, maintenance activities, or environmental disturbances.

It directly controls the **Availability** component of OEE.

<p align="center">
<i>Availability = 1 − (Downtime Probability / 100)</i>
</p>

A higher downtime probability decreases the amount of productive operating time, thereby reducing the Overall Equipment Effectiveness (OEE) of the factory.

---

## Overall Equipment Effectiveness (OEE)

The core metric used to evaluate manufacturing productivity in a smart factory is **Overall Equipment Effectiveness (OEE)**. It is the internationally recognized standard for measuring manufacturing efficiency and is calculated as the product of three distinct factors:

<p align="center">
<i>OEE = Availability × Performance × Quality × 100%</i>
</p>

---

### Availability

Availability measures the percentage of scheduled time that the operation is actually running.

<p align="center">
<i>Availability = 1 − (Downtime Probability / 100)</i>
</p>

- **Downtime Events:** Mechanical failures, unplanned maintenance, and environmental disruptions.

- When the **Downtime Probability** slider is set to **0%**, Availability is **100%** (no downtime). When it is set to **100%**, Availability becomes **0%**, indicating that the factory is completely halted.

---

### Performance

Performance measures how close the factory is operating to its theoretical maximum production capacity.

<p align="center">
<i>Performance = clamp((Production Rate / 1000) × (Machine Count / 50) × 2.5, 0, 1)</i>
</p>

- Performance depends on both the **Production Rate** and the **Machine Count**.

- A higher production rate combined with a greater number of active machines increases the Performance value toward **100%**.

- The **clamp(0, 1)** function ensures that the Performance value always remains within the valid **0–100%** operating range.

---

### Quality

Quality measures the proportion of manufactured parts that satisfy the required quality standards (Good Parts versus Defective Parts).

<p align="center">
<i>
Quality =
</i>
</p>

| Operating Condition | Quality |
|--------------------|---------|
| **Power > 350 kW (Overdrive)** | <i>1.0 − ((Power − 350) / 400)</i> |
| **Power < 80 kW (Underpowered)** | <i>0.70</i> |
| **Otherwise (Standard Operating Range)** | <i>1.0</i> |

- Quality is clamped between **0.35** and **1.0**.

- **Defect Generation:** Operating machines in **Overdrive Mode (Power > 350 kW)** generates excessive vibration and heat, increasing the defect rate and reducing the Quality factor.

---

> **Note:** A small random perturbation (**±1%**) is added to the computed OEE during each simulation update to represent real-world sensor noise and measurement variability.

---

## Machine Utilization

Machine Utilization indicates what proportion of the installed machine capacity is actively engaged in production.

<p align="center">
<i>Utilization = clamp((Machine Count / 50) × Performance × 100, 0, 100)</i>
</p>

- A small random noise (**±1.5%**) is added to simulate real-world variability.

- High utilization (**≥ 80%**) indicates that the factory is making efficient use of its installed machine capacity, while lower utilization suggests overcapacity or suboptimal operating conditions.

---

## Production Output

Actual production output (in units per hour) represents the real throughput of the factory after accounting for efficiency losses.

<p align="center">
<i>Output = Production Rate × (OEE / 100) × (Machine Count / 25)</i>
</p>

- This metric represents the number of good-quality units actually produced by the factory after considering downtime, performance losses, and quality-related defects.

---

## Energy Consumption

Energy consumption (in kW) reflects the factory's real-time electrical power demand.

<p align="center">
<i>Energy = Power Setting × (0.9 + random × 0.2)</i>
</p>

- The **±10%** variation simulates real-world fluctuations in electrical power demand caused by varying machine loads, motor acceleration and deceleration, and HVAC system operation.

---

## Digital Twin Visualization Layers

The SVG-based factory visualization provides **six overlay tabs**, each highlighting a different aspect of the smart manufacturing system.

| **Tab** | **Description** |
|----------|-----------------|
| **Machines** | Default view displaying all CNC machines, robotic arms, and packaging stations with their real-time animations. |
| **Conveyor** | Highlights the main conveyor belt, moving products, and the direction of material flow. |
| **AGVs** | Focuses on the Automated Guided Vehicles (AGVs) and their logistics routes. |
| **Sensors** | Displays sensor coverage areas (blue dashed circles) around each machine and conveyor section, representing Industrial IoT monitoring zones. |
| **Power Grid** | Visualizes the electrical power distribution network using amber dashed lines connecting each CNC machine to the main power junction. |
| **Storage** | Highlights the storage racks and inventory visualization within Zone D. |

---

## Digital Twin Capabilities

### 1. Live Interactive Diagnostics (AI Diagnostic)

The factory status panel on the right side continuously displays an **AI-generated diagnostic message** that automatically updates according to the current Overall Equipment Effectiveness (OEE).

- **OEE ≥ 85%:** *"Factory running at X% OEE. All KPIs within optimal range."*

- **65% ≤ OEE < 85%:** *"Moderate efficiency. Review downtime probability and power usage."*

- **OEE < 65%:** *"⚠ Critical — OEE dropped to X%. Immediate intervention required."*

---

### 2. AI Recommendations Panel

The simulator generates **five context-aware recommendations** that update in real time based on the selected factory control parameters.

- **Machine Utilization:** Flags utilization below **80%** and recommends increasing the machine count.

- **Production Output:** Compares the actual production output with the configured production target and highlights underperformance.

- **Energy Consumption:** Generates a warning when power usage exceeds **350 kW** and recommends scheduling idle machines to reduce energy consumption.

- **Downtime Assessment:** Recommends predictive maintenance when downtime exceeds **20%**, or continuous monitoring when downtime is greater than **5%**.

- **Overall OEE Assessment:** Provides a summary recommendation based on the combined Overall Equipment Effectiveness (OEE) score.

Each recommendation is color-coded:

- 🟢 **Green** — Healthy
- 🟠 **Amber** — Warning
- 🔴 **Red** — Critical

---

### 3. Factory Zone Heatmap

The heatmap displays the **activity intensity** of each production zone using color-coded bars and an SVG-based visualization.

- **Zone A (Assembly):** Activity is proportional to **Production Rate × (1 − Downtime / 100)**.

- **Zone B (Machining):** Activity depends on **Machine Count × Power Allocation**.

- **Zone C (Packaging):** Operates at approximately **85%** of Zone A activity due to downstream production dependency.

- **Zone D (Storage):** Activity is proportional to the current **Production Rate**, representing logistics demand.

Activity levels are represented using the following color scale:

- 🟢 Green — Low Activity
- 🟠 Amber — Moderate Activity
- 🟧 Orange — High Activity
- 🔴 Red — Critical Load

---

### 4. KPI Trend Chart

A real-time **time-series line chart** (powered by **Chart.js**) continuously displays the most recent **20 simulation ticks**.

The chart tracks the following Key Performance Indicators (KPIs):

- **Efficiency (OEE %)** — Green line with filled area.
- **Machine Utilization (%)** — Blue line with filled area.
- **Energy Consumption (kW)** — Amber line.

This visualization enables operators to observe performance trends and understand how changes in factory parameters influence manufacturing performance over time.

---

### 5. Factory Status Dashboard

The right-side dashboard continuously displays the current factory operating status.

Displayed parameters include:

- **Machine Status:** Running / Standby
- **Factory Health:** Calculated from Downtime Probability and OEE *(100 − Downtime − penalty if OEE < 60%)*.
- **Downtime:** Current downtime probability (%).
- **Power Usage:** Current electrical power consumption (kW).
- **Production State:** Optimal *(OEE ≥ 85%)* / Moderate *(65% ≤ OEE < 85%)* / Critical *(OEE < 65%)*.
- **Alarm Status:** *"High Downtime!"*, *"Low Efficiency!"*, or *"No Alarms"*.

---

### 6. Data Logging & Export

The **Factory Event Log** enables users to record and export simulation data.

Users can perform the following actions:

- **Record Data:** Captures the current factory configuration (**Run Number, Machine Count, Production Rate, Efficiency, Power Usage, Downtime, and Factory Status**) and stores it in a scrollable event log.

- **Export CSV:** Downloads all recorded log entries as a CSV file for further analysis using spreadsheet software or data analysis tools.

---

### 7. Interventions

Two predefined intervention actions allow users to simulate maintenance and operational optimization.

- **Schedule Maintenance:** Reduces the **Downtime Probability** by **10 percentage points**, representing the effect of proactive preventive maintenance.

- **Optimize Power:** Reduces **Power Usage** by **30 kW**, simulating an energy optimization strategy that minimizes unnecessary power consumption without affecting production quality.

---

## Advantages of Factory Digital Twins

Digital Twins provide significant advantages for modern smart manufacturing by enabling continuous monitoring, optimization, and intelligent decision-making without disrupting physical production.

- **Zero-Risk Experimentation:** Test new production targets, machine counts, and power configurations in a virtual environment before implementing them on the physical factory floor.

- **Predictive Maintenance:** Utilize downtime probability modeling to anticipate potential equipment failures and schedule maintenance before unexpected breakdowns interrupt production.

- **Real-Time Monitoring:** Continuously monitor Overall Equipment Effectiveness (OEE), machine utilization, production output, and energy consumption, allowing operators to detect performance degradation as soon as it occurs.

- **AI-Powered Insights:** Generate context-aware recommendations that assist operators in making data-driven decisions for improving factory performance and operational efficiency.

- **Data-Driven Optimization:** Record multiple factory configurations and compare simulation results using the Factory Event Log and CSV export feature to identify the optimal operating conditions.

- **Multi-Layer Visualization:** Visualize the factory from multiple operational perspectives, including machines, sensors, conveyor systems, power distribution, automated logistics, and storage infrastructure, providing a comprehensive understanding of the manufacturing process.

- **Remote Operations:** Monitor, analyze, and manage factory operations remotely through the Digital Twin interface, providing complete operational transparency and supporting informed decision-making from any location.
