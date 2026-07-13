# Procedure

## Step 1: Launch the Simulator

1. Open the **Smart Warehouse Management Simulator**.

2. Observe the dashboard, which consists of the following sections:

   - **Warehouse Controls (Left Panel):** Contains sliders for **Storage Capacity**, **Incoming Orders**, **AGV Speed**, **AGV Fleet Size**, and **Inventory Threshold**. It also includes a **Routing Algorithm** dropdown menu, along with the **Run Simulation**, **Reset**, and **Export CSV** buttons.

   - **Warehouse Digital Twin (Center Panel):** Displays a real-time 2D warehouse floor plan showing **four physical rack zones (A, B, C, D)**, the **Inbound Dock**, **Outbound Dock**, **Conveyor Belt System**, **Packaging / Quality Control Station**, an **animated AGV robot**, and a real-time analytics summary row displaying **Warehouse Efficiency**, **Pending Orders**, and **Storage Health**.

   - **Operations Center & Diagnostics (Right Panel):** Displays a circular **Core Operations Efficiency Gauge**, real-time calculated values (**Storage Utilization**, **AGV Utilization**, **Processing Time**, and **Pending Orders**), a **Congestion Heatmap**, a **Smart Recommendations** panel, and a **Live Calculation Trace** terminal.

   - **Insights & Logs (Bottom Panel):** Contains the **KPI Trend Analysis** chart and the **Warehouse Operation Log** table, which records all simulation runs.

3. Verify that the simulator initializes with the following default warehouse parameters:

   - **Storage Capacity:** 500
   - **Incoming Orders:** 200
   - **AGV Speed:** 5
   - **Inventory Threshold:** 100

---

## Step 2: Configure Warehouse Parameters

Adjust the following input parameters using the control panel sliders:

### Storage Capacity

Represents the total warehouse storage space available.
- Range: 100 to 1000 units (step: 50)

### Incoming Orders

Represents the number of customer orders entering the warehouse.
- Range: 0 to 1000 orders (step: 50)

### AGV Speed

Represents the operational speed of the Automated Guided Vehicle (AGV).
- Range: 1 to 10 m/s (step: 1)

### AGV Fleet Size

Represents the number of active Automated Guided Vehicles (AGVs) operating in the warehouse.
- Range: 1 to 5 vehicles (step: 1)

### Routing Algorithm

Represents the dispatch routing optimization algorithm used:
- **FIFO (Baseline)**: Standard first-in-first-out queue.
- **Nearest Neighbor (Time Opt)**: Prioritizes nearest destinations (reduces travel times by 20%).
- **Balanced Load (Congestion Opt)**: Evens rack distributions (reduces congestion by 10% and adds efficiency bonuses).

### Inventory Threshold

Represents the minimum inventory level required before replenishment is triggered.
- Range: 50 to 500 units (step: 10)

---

## Step 3: Run the Warehouse Simulation

1. Click the **Run Simulation** button.
2. Observe the AGV robot status change in the digital twin (IDLE, ACTIVE, or OVERLOADED) along with its status LED and base color outline.
3. Monitor rack zone fill levels across all four zones (A, B, C, D) in the SVG floor plan using the color-coded fill bars at the bottom of each rack.
4. Note the rack fill bar color changes: normal (green), warning (amber when fill exceeds 60%), and danger (red when fill exceeds 85%).
5. Observe the conveyor belt system animation connecting the inbound dock to the outbound dock.

---

## Step 4: Observe Warehouse KPIs

Analyze the following performance indicators displayed in the analytics row below the Digital Twin and the **Inferred Values** section of the **Diagnostics Panel**.

---

### Storage Utilization

Indicates how efficiently warehouse space is being used.

<p align="center">
<i>Storage Utilization = min(100, (Incoming Orders / Storage Capacity) × 100)</i>
</p>

---

### AGV Processing Time

Indicates the time required to process incoming orders.

<p align="center">
<i>Processing Time = (Incoming Orders / (Fleet Size × AGV Speed × 20)) × M<sub>algo</sub></i>
</p>

Where:

- **M<sub>algo</sub> = 0.80** for **Nearest Neighbor**
- **M<sub>algo</sub> = 0.90** for **Balanced Load**
- **M<sub>algo</sub> = 1.00** for **FIFO**

---

### AGV Utilization

Indicates the percentage of the AGV fleet workload relative to its operational speed.

<p align="center">
<i>AGV Utilization = min(100, Incoming Orders / (Fleet Size × AGV Speed × 10))</i>
</p>

---

### Warehouse Efficiency

Represents the overall warehouse operational performance with conditional penalties and routing algorithm bonuses.

<p align="center">
<i>Efficiency = max(40, min(100, 100 − (Utilization × 0.3) − P<sub>agv</sub> − P<sub>time</sub> + B<sub>algo</sub>))</i>
</p>

Where:

- **P<sub>agv</sub> = 12** if **AGV Utilization > 80%**, otherwise **0**.
- **P<sub>time</sub> = 8** if **Processing Time > 5 minutes**, otherwise **0**.
- **B<sub>algo</sub>** is the routing bonus:
  - **+5%** for **Nearest Neighbor**
  - **+3%** for **Balanced Load**
  - **+0%** for **FIFO**

---

### Congestion Index

Represents the risk of warehouse congestion:

- **Low:** Storage Utilization below **60%**
- **Medium:** Storage Utilization between **60% and 84%**
- **High:** Storage Utilization **85% and above**

---

### Inventory Health

Indicates inventory stability.

- **Healthy:** Incoming Orders ≥ Inventory Threshold
- **Low Stock:** Incoming Orders < Inventory Threshold

---

## Step 5: Analyze the Digital Twin Visualization

Observe the warehouse digital twin floor plan and identify:

- **Rack Zone Fill Levels**: Each zone (A, B, C, D) fills proportionally in the SVG floor plan. Zone A receives 100% of utilization, Zone B receives 90%, Zone C receives 75%, and Zone D receives 60%.
- **AGV Robot Status**: Active AGVs spawn programmatically based on the Fleet Size. Their status LEDs and base outlines turn green for IDLE (utilization < 40%), blue for ACTIVE (40%-79%), and red for OVERLOADED (80%+). Cloned AGVs run on staggered cycles.
- **Header Status Indicator**: Review the real-time warehouse state displayed in the top header (NORMAL in green, BUSY in amber, or CONGESTED in red).
- **Efficiency Gauge**: The circular gauge in the Diagnostics panel displays the overall core operations efficiency percentage with color coding (green >= 80%, amber >= 55%, red < 55%).

---

## Step 6: Evaluate Inventory Threshold Conditions

Perform the following:

1. Set incoming orders to a value below the inventory threshold (e.g., Orders: 50, Threshold: 100).
2. Run the simulation.
3. Observe the "LOW STOCK ALERT" warning appear in the **Smart Recommendations** panel and the corresponding warning message in the **Live Calculation Trace** terminal.
4. Increase incoming orders above the threshold (e.g., Orders: 200) and run again.
5. Observe the low stock alerts clear from the recommendations and trace panels.

Analyze how the relationship between incoming orders and inventory threshold affects warehouse alerts and recommendations.

---

## Step 7: Evaluate AGV Fleet & Algorithm Performance

1. Set a high number of incoming orders (e.g., 600) and Storage Capacity (e.g., 800).
2. Run the simulation with AGV Speed set to 2 m/s, Fleet Size set to 1, and Routing Algorithm set to FIFO. Record the processing time, AGV utilization, and efficiency.
3. Increase Fleet Size to 3, and switch Routing Algorithm to Balanced Load. Run the simulation again.
4. Compare the following across both runs:
   - Multiple concurrent AGVs operating in the digital twin.
   - Order processing time (should decrease dramatically with larger fleet size and balanced routing).
   - AGV utilization (should drop to normal levels as workload is distributed).
   - Warehouse efficiency (should improve as penalties are removed and routing bonuses are applied).
   - Pending orders backlog (should decrease as handling capacity scales).
5. Observe the trend indicators (up/down arrows) in the inferred values panel that show changes from the previous run.

---

## Step 8: Study Congestion Scenarios

Create congestion conditions by:

- Setting incoming orders higher than storage capacity (e.g., Capacity: 300, Orders: 800).
- Reducing AGV speed to minimum (1 m/s).

Run the simulation and observe:

- Storage utilization reaching 100% (capped).
- Congestion Index changing to "High" with the badge turning red.
- Rack zones showing red (danger) fill colors.
- Warehouse State changing to "CONGESTED".
- Storage Health changing to "Critical" in the analytics row.
- The Congestion Heatmap zones showing elevated percentages with red/orange coloring.

---

## Step 9: Review Smart Recommendations and Charts

After running multiple simulations:

1. Read the **Smart Recommendations** panel, which provides context-specific advice on:
   - Storage utilization status and recommended actions
   - AGV workload assessment
   - Inventory threshold alerts
   - Pending order warnings
   - Processing time evaluation
   - Overall efficiency assessment

2. Review the **KPI Trend Analysis** chart that plots Storage Utilization, AGV Utilization, and Overall Efficiency across all simulation runs.

3. Examine the **Congestion Heatmap** showing activity levels across four warehouse zones: Storage (Zone A), Picking (Zone B), Packaging (Zone C), and Dispatch (Zone D).

---

## Step 10: Export and Record Experimental Results

1. Click the **Export CSV** button (available in both the control panel and the **Warehouse Operation Log** section) to download a CSV file containing all simulation run data.

2. Review the **Warehouse Operation Log** table, which records the following information for each simulation run:

   - Run Number
   - Storage Capacity
   - Incoming Orders
   - AGV Speed
   - Inventory Threshold
   - Storage Utilization
   - AGV Utilization
   - Processing Time
   - Operations Efficiency (η)
   - Warehouse State

3. Record the following outputs from a representative simulation run.

<table>
<thead>
<tr>
<th>Parameter</th>
<th>Observation</th>
</tr>
</thead>
<tbody>
<tr>
<td>AGV Fleet Size</td>
<td>__________</td>
</tr>
<tr>
<td>Routing Algorithm</td>
<td>__________</td>
</tr>
<tr>
<td>Storage Utilization</td>
<td>__________</td>
</tr>
<tr>
<td>AGV Processing Time</td>
<td>__________</td>
</tr>
<tr>
<td>AGV Utilization</td>
<td>__________</td>
</tr>
<tr>
<td>Warehouse Efficiency</td>
<td>__________</td>
</tr>
<tr>
<td>Pending Orders</td>
<td>__________</td>
</tr>
<tr>
<td>Congestion Index</td>
<td>__________</td>
</tr>
<tr>
<td>Storage Health</td>
<td>__________</td>
</tr>
<tr>
<td>Warehouse State</td>
<td>__________</td>
</tr>
</tbody>
</table>

---

# Result

The Smart Warehouse Management Simulator was successfully executed. The effects of storage capacity, incoming orders, AGV speed, and inventory threshold on warehouse performance were analyzed. Key warehouse KPIs such as storage utilization, AGV processing time, AGV utilization, congestion index, inventory health, and overall efficiency were evaluated using the digital twin visualization, operations center, KPI trend charts, congestion heatmap, and smart recommendation engine. The experiment demonstrates how Industry 4.0 technologies enable data-driven optimization of warehouse operations and logistics management.
