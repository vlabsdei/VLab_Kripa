# Procedure

## Step 1: Launch the Simulator and Identify the Factory Layout

1. Open the **Digital Twin Factory Simulator** in a web browser.
2. Observe the main dashboard layout: a **left control panel** with sliders, a **center SVG factory visualization**, and a **right diagnostics panel** with status indicators and charts.
3. Identify the four factory zones in the SVG visualization:
   - **Zone A (Assembly)**: Three CNC machines — CNC-01, CNC-02, CNC-03 — in the top-left.
   - **Zone B (Machining)**: Two robotic arms — ROB-01, ROB-02 — in the top-center.
   - **Zone C (Packaging)**: Two packaging stations — PACK-01, PACK-02 — in the top-right.
   - **Zone D (Storage & Logistics)**: AGV tracks, two AGVs (AGV-A, AGV-B), and storage racks (RACK-01, RACK-02) in the bottom section.
4. Note the **main conveyor belt** spanning the full width between the upper zones and Zone D, with three blue sensor dots positioned along its length.
5. Observe the **status ticker bar** at the bottom of the SVG showing the message: *"System initialized — press Run Simulation to begin"*.

---

## Step 2: Explore the SVG Overlay Tabs

1. Above the factory SVG, locate the **six visualization tabs**: Machines, Conveyor, AGVs, Sensors, Power Grid, and Storage.
2. Click each tab to observe the different overlay layers:
   - **Sensors**: Displays blue dashed circles representing IoT sensor coverage radii around each machine and along the conveyor.
   - **Power Grid**: Shows amber dashed lines tracing the electrical power distribution from each CNC machine up to the main power junction.
   - **Storage**: Highlights the storage racks in Zone D.
3. Return to the **Machines** tab (default view) before proceeding.

---

## Step 3: Understand the Baseline Configuration

1. Before starting the simulation, read the default slider values on the left control panel:
   - **Machine Count**: 12
   - **Production Rate**: 450 u/hr
   - **Power Usage**: 250 kW
   - **Downtime Probability**: 10%
2. On the right panel, note that all metrics display placeholder dashes (`--`) — these will populate once the simulation begins.
3. Observe the **System Status** indicator at the bottom of the left panel showing **OFFLINE**.

---

## Step 4: Start the Simulation and Observe Real-Time Behavior

1. Click the **▶ Run Simulation** button on the left panel.
2. Observe the following changes immediately:
   - The **Live Badge** switches from "OFFLINE" to **"LIVE"** with a pulsing green indicator.
   - The **System Status** dot turns green and shows **"RUNNING"**.
   - **CNC spindles** begin rotating at a speed proportional to the Production Rate.
   - **Robotic arms** (ROB-01 and ROB-02) start oscillating back and forth in opposite phases.
   - **Conveyor belt** seam lines begin moving from left to right, and colored product boxes start spawning on the belt.
   - **AGV-A** and **AGV-B** begin traversing their logistics tracks across the factory floor. AGV-A picks up cargo at one end and drops it off at the other.
3. Read the **real-time analytics row** below the SVG:
   - **OEE (Efficiency)**: The current OEE percentage (color-coded: green ≥ 75%, amber ≥ 50%, red < 50%).
   - **Machine Utilization**: Percentage of installed machine capacity in active use.
   - **Production Output**: Actual units produced per hour.
   - **Energy Consumption**: Current power draw in kW.
4. On the right panel, observe the **Factory Status** metrics: Factory Health, Downtime, Power Usage, Production State, and Alarm Status.
5. Watch the **KPI Trend Chart** begin plotting three lines over time: Efficiency (green), Utilization (blue), and Energy (amber).
6. Read the **AI Diagnostic** message that provides a natural-language assessment of factory performance.

---

## Step 5: Experiment with Machine Count

1. Move the **Machine Count** slider from 12 upwards towards 30–50.
2. Observe the following effects:
   - **Machine Utilization** increases (more machines engaged in production).
   - **Performance** component of OEE improves (more machines contribute to output capacity).
   - **Production Output** rises as more machines process parts concurrently.
3. Reduce the Machine Count to a very low value (1–3) and observe:
   - Utilization and Performance drop significantly.
   - OEE decreases even if downtime and power are optimal.
4. **Key Insight**: Machine count directly scales the factory's throughput capacity. Under-provisioning machines creates a performance bottleneck regardless of other settings.

---

## Step 6: Experiment with Production Rate

1. Increase the **Production Rate** slider from 450 towards 800–1000 u/hr.
2. Observe the following visual and metric changes:
   - **CNC spindles rotate faster** (higher machining speed).
   - **Conveyor belt moves faster** with more frequent product spawns.
   - **AGVs move faster** to keep up with material demand.
   - **Performance** component of OEE approaches 100%.
   - **Production Output** increases.
3. Lower the Production Rate to the minimum (10 u/hr) and observe:
   - All animations slow dramatically.
   - AGVs barely move, conveyor nearly stops, spindles rotate slowly.
   - Performance drops to near zero, causing OEE to plummet.
4. **Key Insight**: Production rate controls the factory's target speed, but actual output also depends on machine count, power, and downtime.

---

## Step 7: Test Power Overdrive and Quality Degradation

1. Set the **Power Usage** slider to the standard range (around 200–350 kW). Note that OEE quality remains high.
2. Push the **Power Usage above 350 kW** (overdrive zone). Observe:
   - Initially, production output may spike slightly.
   - The **Quality** component of OEE begins degrading — the higher the power above 350 kW, the more defects are produced.
   - At maximum power (500 kW), quality drops to approximately 62.5% (1.0 − 150/400).
   - The overall **OEE decreases** despite higher power input due to quality losses.
   - **AI Recommendations** flag high energy consumption and suggest scheduling idle machines.
3. Now set Power below 80 kW (underpowered mode):
   - Quality is penalized to a fixed 70%.
   - OEE drops significantly due to the quality penalty.
4. Return Power to the standard range (200–300 kW).
5. **Key Insight**: There is an optimal power range. Overdrive increases defects, and underpowering reduces quality — both lower OEE.

---

## Step 8: Simulate High Downtime and Use Interventions

1. Increase the **Downtime Probability** slider to 30–50%.
2. Observe:
   - **OEE drops sharply** as Availability decreases (Availability = 1 − Downtime/100).
   - **Factory Health** metric decreases.
   - The **Alarm Status** changes to **"High Downtime!"** (if downtime > 30%).
   - The **Factory Badge** may switch from "OPERATIONAL" to **"DEGRADED"** (OEE < 65%).
   - **Status LEDs** on CNC machines turn **red**.
   - The **AI Diagnostic** displays a critical warning message.
   - **AI Recommendations** turn red and strongly recommend predictive maintenance.
3. Use the **Interventions** section in the left panel:
   - Click **"Schedule Maintenance" → Apply**: This reduces the Downtime Probability by 10 percentage points. Observe the downtime slider value decrease and OEE begin to recover.
   - Click **"Optimize Power" → Apply**: This reduces Power Usage by 30 kW. Observe the power slider value decrease and energy consumption drop.
4. **Key Insight**: Interventions simulate real-world maintenance actions. Proactive scheduling directly reduces downtime, while power optimization improves energy efficiency.

---

## Step 9: Analyze the Factory Zone Heatmap

1. Scroll down to the **Factory Zone Heatmap** section below the main visualization.
2. Observe the four zones displayed as both an SVG grid and horizontal progress bars:
   - **Zone A (Assembly)**: Activity driven by Production Rate × Availability.
   - **Zone B (Machining)**: Activity driven by Machine Count × Power allocation.
   - **Zone C (Packaging)**: Follows Zone A at ~85% capacity (downstream effect).
   - **Zone D (Storage)**: Activity driven by Production Rate (logistics demand).
3. Adjust sliders and observe how the heatmap colors change:
   - Green (< 40% load) → Amber (40–60%) → Orange (60–80%) → Red (> 80% critical load).
4. **Key Insight**: The heatmap reveals which zones are under stress. A red zone indicates potential bottlenecks or overload.

---

## Step 10: Review AI Recommendations

1. In the **AI Recommendations** panel (bottom of the page), read the five recommendations generated by the system.
2. Each recommendation has a color-coded dot:
   - 🟢 **Green**: The metric is within optimal range.
   - 🟡 **Amber**: Warning — the metric needs attention.
   - 🔴 **Red**: Critical — immediate action is required.
3. Try to achieve a state where **all five recommendations are green** by finding the optimal combination of Machine Count, Production Rate, Power, and Downtime.
4. **Key Insight**: The AI Recommendations serve as an intelligent advisory system that helps operators tune factory parameters for maximum efficiency.

---

## Step 11: Record Data and Compare Configurations

1. Once you have found an interesting configuration, click the **📋 Record Data** button (on the left panel or in the log section header).
2. A new row appears in the **Production Timeline / Factory Event Log** table showing:
   - Run number, Machine Count, Production Rate, Efficiency (%), Power Usage (kW), Downtime (%), and a color-coded Status badge (Optimal / Good / Warning / High Downtime).
3. Adjust the sliders to a different configuration and click **Record Data** again.
4. Repeat for 4–5 different configurations to build a comparison dataset.
5. **Key Insight**: Recording multiple configurations allows you to empirically determine the optimal operating point where OEE is maximized.

---

## Step 12: Export Data for External Analysis

1. After recording several data points, click the **📥 Export CSV** button.
2. A CSV file named `factory_twin_log.csv` is downloaded containing all recorded entries with columns: Run, Machine Count, Production Rate, Efficiency, Power Usage, Downtime, Status.
3. Open the CSV in a spreadsheet application (Excel, Google Sheets) or import it into a data analysis tool (Python/Pandas) for further analysis:
   - Plot Efficiency vs. Production Rate to find the point of diminishing returns.
   - Analyze the relationship between Power Usage and Quality degradation.
   - Identify the Downtime threshold at which OEE becomes unacceptable.

---

## Step 13: Pause, Reset, and Reflect

1. Click **⏸ Pause** to freeze the simulation while retaining the current state.
2. Click **↺ Reset** to restore all parameters to their default values and clear the event log.
3. Document your findings:
   - What is the maximum OEE you achieved? What parameters produced it?
   - At what Power level did quality begin to degrade noticeably?
   - What Downtime Probability threshold caused the factory to shift from "Operational" to "Degraded"?
   - How did Machine Count interact with Production Rate to affect utilization?
   - Which factory zones showed the highest activity in your optimal configuration?