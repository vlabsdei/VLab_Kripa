# Procedure

## Step 1: Launch the Simulator and Identify the Factory Layout

1. Open the **Digital Twin Factory Simulator** in a web browser.

2. Observe the main dashboard layout, which consists of:
   - A **left control panel** containing the simulation sliders.
   - A **center SVG factory visualization** displaying the Digital Twin.
   - A **right diagnostics panel** containing the factory status indicators, KPIs, and trend charts.

3. Identify the four factory zones displayed in the SVG visualization:
   - **Zone A (Assembly):** Three CNC machines — **CNC-01**, **CNC-02**, and **CNC-03** — located in the upper-left section.
   - **Zone B (Machining):** Two robotic arms — **ROB-01** and **ROB-02** — located in the upper-center section.
   - **Zone C (Packaging):** Two packaging stations — **PACK-01** and **PACK-02** — located in the upper-right section.
   - **Zone D (Storage & Logistics):** AGV tracks, two Automated Guided Vehicles (**AGV-A** and **AGV-B**), and storage racks (**RACK-01** and **RACK-02**) located in the lower section of the factory.

4. Observe the **main conveyor belt** spanning the entire width of the factory between the upper production zones and **Zone D**. Note the three blue IoT sensor indicators positioned along the conveyor.

5. Observe the **status ticker** displayed at the bottom of the SVG visualization. Initially, it displays the message:

   *"System initialized — press Run Simulation to begin."*

---

## Step 2: Explore the SVG Overlay Tabs

1. Above the factory SVG visualization, locate the **six visualization tabs**:
   - **Machines**
   - **Conveyor**
   - **AGVs**
   - **Sensors**
   - **Power Grid**
   - **Storage**

2. Click each tab to observe the different visualization layers:
   - **Sensors:** Displays blue dashed circles representing the IoT sensor coverage areas around each machine and along the conveyor belt.
   - **Power Grid:** Displays amber dashed lines illustrating the electrical power distribution from each CNC machine to the main power junction.
   - **Storage:** Highlights the storage racks located in **Zone D**.

3. After exploring each visualization layer, return to the **Machines** tab (default view) before proceeding to the next step.

---

## Step 3: Understand the Baseline Configuration

1. Before starting the simulation, observe the default slider values on the left control panel:

   - **Machine Count:** 12
   - **Production Rate:** 450 u/hr
   - **Power Usage:** 250 kW
   - **Downtime Probability:** 10%

2. On the right diagnostics panel, observe that all performance metrics display placeholder dashes (`--`). These values will be populated once the simulation begins.

3. Observe the **System Status** indicator located at the bottom of the left control panel. Initially, the simulator displays the status as **OFFLINE**.

---

## Step 4: Start the Simulation and Observe Real-Time Behavior

1. Click the **Run Simulation** button on the left control panel.

2. Observe the following changes immediately after the simulation starts:

   - The **Live Badge** changes from **OFFLINE** to **LIVE**, accompanied by a pulsing green indicator.
   - The **System Status** indicator turns green and displays **RUNNING**.
   - The **CNC spindles** begin rotating at a speed proportional to the configured **Production Rate**.
   - The **robotic arms** (**ROB-01** and **ROB-02**) begin oscillating back and forth in opposite phases.
   - The **conveyor belt** seam lines start moving from left to right, and colored product boxes begin spawning on the conveyor.
   - **AGV-A** and **AGV-B** begin traversing their predefined logistics routes. **AGV-A** loads cargo at one end of the track and unloads it at the opposite end.

3. Observe the **real-time analytics panel** located below the SVG visualization.

   - **OEE (Efficiency):** Displays the current Overall Equipment Effectiveness percentage *(Green ≥ 75%, Amber ≥ 50%, Red < 50%)*.
   - **Machine Utilization:** Displays the percentage of installed machine capacity currently in active use.
   - **Production Output:** Displays the actual production throughput in units per hour.
   - **Energy Consumption:** Displays the current electrical power consumption in kW.

4. Observe the **Factory Status** section on the right diagnostics panel, which continuously updates the following parameters:

   - Factory Health
   - Downtime
   - Power Usage
   - Production State
   - Alarm Status

5. Observe the **KPI Trend Chart**, which begins plotting three real-time performance metrics:

   - **Efficiency (OEE)** — Green line
   - **Machine Utilization** — Blue line
   - **Energy Consumption** — Amber line

6. Read the **AI Diagnostic** message displayed on the right panel, which provides a natural-language assessment of the current factory operating conditions.

---

## Step 5: Experiment with Machine Count

1. Increase the **Machine Count** slider from **12** towards **30–50**.

2. Observe the following effects:

   - **Machine Utilization** increases as more machines participate in production.
   - The **Performance** component of OEE improves because additional machines contribute to the available production capacity.
   - **Production Output** increases as more machines process products simultaneously.

3. Reduce the **Machine Count** to a very low value (**1–3**) and observe the following:

   - Machine Utilization and Performance decrease significantly.
   - OEE decreases even when the Power Usage and Downtime settings remain optimal.

4. **Key Insight:** Machine Count directly determines the factory's production capacity. Operating with too few machines creates a production bottleneck regardless of the other operating parameters.

---

## Step 6: Experiment with Production Rate

1. Increase the **Production Rate** slider from **450** towards **800–1000 u/hr**.

2. Observe the following visual and performance changes:

   - The **CNC spindles** rotate faster, representing increased machining speed.
   - The **conveyor belt** moves faster, with products spawning more frequently.
   - The **AGVs** travel faster to meet the increased material handling demand.
   - The **Performance** component of OEE approaches **100%**.
   - **Production Output** increases accordingly.

3. Reduce the **Production Rate** to the minimum value (**10 u/hr**) and observe the following:

   - All factory animations slow down considerably.
   - The AGVs move very slowly, the conveyor belt nearly stops, and the CNC spindle rotation speed decreases significantly.
   - The **Performance** component drops close to zero, causing the Overall Equipment Effectiveness (OEE) to decrease substantially.

4. **Key Insight:** The Production Rate controls the target operating speed of the factory. However, the actual production output also depends on the Machine Count, Power Usage, and Downtime Probability.

---

## Step 7: Test Power Overdrive and Quality Degradation

1. Set the **Power Usage** slider within the standard operating range (**200–350 kW**). Observe that the **Quality** component of OEE remains high.

2. Increase the **Power Usage** above **350 kW** (Overdrive Mode) and observe the following:

   - Production Output may increase slightly during the initial stage.
   - The **Quality** component of OEE begins to decrease. As the power level increases beyond **350 kW**, the number of defective products also increases.
   - At the maximum power setting (**500 kW**), the Quality factor decreases to approximately **62.5%** *(1.0 − 150/400)*.
   - The overall **OEE** decreases despite the higher power input because of the reduction in product quality.
   - The **AI Recommendations** panel generates a warning for excessive energy consumption and recommends scheduling idle machines.

3. Reduce the **Power Usage** below **80 kW** (Underpowered Mode) and observe the following:

   - The **Quality** factor is reduced to a fixed value of **70%**.
   - The Overall Equipment Effectiveness (OEE) decreases because of the quality penalty.

4. Return the **Power Usage** slider to the standard operating range (**200–300 kW**).

5. **Key Insight:** There is an optimal operating range for power consumption. Excessive power increases defect generation, while insufficient power reduces manufacturing quality. Both conditions decrease the Overall Equipment Effectiveness (OEE).

---

## Step 8: Simulate High Downtime and Use Interventions

1. Increase the **Downtime Probability** slider to **30–50%**.

2. Observe the following effects:

   - **OEE** decreases significantly as the **Availability** component is reduced.

   <p align="center">
   <i>Availability = 1 − (Downtime Probability / 100)</i>
   </p>

   - The **Factory Health** metric decreases.
   - The **Alarm Status** changes to **"High Downtime!"** when the downtime probability exceeds **30%**.
   - The **Factory Badge** may change from **OPERATIONAL** to **DEGRADED** when **OEE < 65%**.
   - The **Status LEDs** on the CNC machines change from green to **red**.
   - The **AI Diagnostic** panel displays a critical warning message.
   - The **AI Recommendations** become red and strongly recommend predictive maintenance.

3. Use the **Interventions** section on the left control panel.

   - Click **Schedule Maintenance → Apply**. The simulator reduces the **Downtime Probability** by **10 percentage points**. Observe the downtime value decrease and the OEE begin to recover.

   - Click **Optimize Power → Apply**. The simulator reduces the **Power Usage** by **30 kW**. Observe the reduction in the Power Usage value and the corresponding decrease in Energy Consumption.

4. **Key Insight:** The intervention controls simulate real-world maintenance and optimization strategies. Preventive maintenance reduces downtime, while power optimization improves overall energy efficiency.

---

## Step 9: Analyze the Factory Zone Heatmap

1. Scroll to the **Factory Zone Heatmap** section located below the main factory visualization.

2. Observe the four production zones displayed using both an SVG grid and horizontal activity bars.

   - **Zone A (Assembly):** Activity is proportional to **Production Rate × Availability**.
   - **Zone B (Machining):** Activity is proportional to **Machine Count × Power Allocation**.
   - **Zone C (Packaging):** Operates at approximately **85%** of Zone A activity because of downstream dependency.
   - **Zone D (Storage):** Activity is proportional to the current **Production Rate**, representing logistics demand.

3. Modify the factory control parameters and observe the corresponding changes in the heatmap colors.

   - **Green:** Load below **40%**
   - **Amber:** Load between **40% and 60%**
   - **Orange:** Load between **60% and 80%**
   - **Red:** Load above **80%** (Critical Load)

4. **Key Insight:** The heatmap provides a visual representation of factory workload. Red zones indicate potential bottlenecks or overloaded production areas that may require operational adjustments.

---

## Step 10: Review AI Recommendations

1. Navigate to the **AI Recommendations** panel located at the bottom of the simulator.

2. Review the five recommendations generated by the Digital Twin.

   - 🟢 **Green:** The corresponding metric is operating within the optimal range.
   - 🟠 **Amber:** Warning — the metric requires attention.
   - 🔴 **Red:** Critical — immediate corrective action is recommended.

3. Adjust the **Machine Count**, **Production Rate**, **Power Usage**, and **Downtime Probability** sliders to achieve a condition where **all five recommendations are green**.

4. **Key Insight:** The AI Recommendations function as an intelligent decision-support system, assisting operators in selecting the optimal operating conditions for maximum manufacturing efficiency.

---

## Step 11: Record Data and Compare Configurations

1. After identifying an interesting factory configuration, click the **Record Data** button (available on the left control panel or in the Factory Event Log section).

2. Observe that a new entry is added to the **Production Timeline / Factory Event Log** table containing the following information:

   - Run Number
   - Machine Count
   - Production Rate
   - Efficiency (%)
   - Power Usage (kW)
   - Downtime (%)
   - Status badge (**Optimal / Good / Warning / High Downtime**)

3. Modify one or more factory control parameters and click **Record Data** again to save the new configuration.

4. Repeat this process for **4–5 different operating configurations** to create a comparison dataset.

5. **Key Insight:** Recording multiple operating configurations enables a comparative analysis of factory performance and helps identify the operating point that maximizes the Overall Equipment Effectiveness (OEE).

---

## Step 12: Export Data for External Analysis

1. After recording multiple simulation runs, click the **Export CSV** button.

2. A CSV file named **`factory_twin_log.csv`** is downloaded containing all recorded simulation entries with the following columns:

   - Run
   - Machine Count
   - Production Rate
   - Efficiency
   - Power Usage
   - Downtime
   - Status

3. Open the exported CSV file using a spreadsheet application (such as **Microsoft Excel** or **Google Sheets**) or import it into a data analysis environment (such as **Python/Pandas**) for further analysis.

   Possible analyses include:

   - Plot **Efficiency** versus **Production Rate** to determine the point of diminishing returns.
   - Analyze the relationship between **Power Usage** and **Quality** degradation.
   - Identify the **Downtime Probability** threshold at which the Overall Equipment Effectiveness (OEE) becomes unacceptable.

---

## Step 13: Pause, Reset, and Reflect

1. Click the **Pause** button to temporarily stop the simulation while preserving the current factory state.

2. Click the **Reset** button to restore all simulation parameters to their default values and clear the Factory Event Log.

3. Document your observations by answering the following questions:

   - What was the maximum Overall Equipment Effectiveness (OEE) achieved during the experiment? Which parameter settings produced this result?
   - At what **Power Usage** level did product quality begin to degrade noticeably?
   - At what **Downtime Probability** did the factory transition from **Operational** to **Degraded**?
   - How did the **Machine Count** interact with the **Production Rate** to influence Machine Utilization?
   - Which factory zones exhibited the highest activity under the optimal operating configuration?
