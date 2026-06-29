# Procedure

## Step 1: Launch the Simulator

1. Open the Smart Warehouse Management Simulator.
2. The dashboard displays the following sections:
   - **Warehouse Controls** (left panel): Sliders for Storage Capacity, Incoming Orders, AGV Speed, AGV Fleet Size, and Inventory Threshold, a dropdown for Routing Algorithm, along with Run Simulation, Reset, and Export CSV buttons.
   - **Warehouse Digital Twin** (center): A real-time 2D floor plan showing four physical rack zones (A, B, C, D), inbound dock, outbound dock, conveyor belt system, packaging/QC station, an animated AGV robot, and an analytics summary row at the bottom (Warehouse Efficiency, Pending Orders, Storage Health).
   - **Operations Center & Diagnostics** (right panel): A circular core operations efficiency gauge, real-time inferred values (Storage Utilization, AGV Utilization, Processing Time, Pending Orders), a congestion heatmap, a smart recommendations panel, and a live calculation trace terminal.
   - **Insights & Logs** (bottom): KPI Trend Analysis chart and the Warehouse Operation Log table recording all simulation runs.
3. Verify that the system initializes with default warehouse parameters (Capacity: 500, Orders: 200, AGV Speed: 5, Threshold: 100).

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

Analyze the following performance indicators displayed in the analytics row below the digital twin and the inferred values section of the diagnostics panel:

### Storage Utilization

Indicates how efficiently warehouse space is being used.

\[
Storage\ Utilization = \min\!\Bigl(100,\ \frac{Incoming\ Orders}{Storage\ Capacity} \times 100\Bigr)
\]

### AGV Processing Time

Indicates the time required to process incoming orders.

\[
Processing\ Time = \frac{Incoming\ Orders}{Fleet\ Size \times AGV\ Speed \times 20} \times M_{algo}
\]

Where $M_{algo} = 0.80$ for Nearest Neighbor, $0.90$ for Balanced Load, and $1.00$ for FIFO.

### AGV Utilization

Indicates the percentage of the AGV fleet workload relative to speed.

\[
AGV\ Utilization = \min\!\Bigl(100,\ \frac{Incoming\ Orders}{Fleet\ Size \times AGV\ Speed \times 10}\Bigr)
\]

### Warehouse Efficiency

Represents overall warehouse operational performance with conditional penalties and algorithm routing bonuses.

\[
Efficiency = \max\!\Bigl(40,\ \min\!\bigl(100,\ 100 - (Utilization \times 0.3) - P_{agv} - P_{time} + B_{algo}\bigr)\Bigr)
\]

Where:
- $P_{agv} = 12$ if AGV Utilization > 80%, otherwise 0
- $P_{time} = 8$ if Processing Time > 5 minutes, otherwise 0
- $B_{algo}$ is the routing bonus: $+5\%$ for Nearest Neighbor, $+3\%$ for Balanced Load, and $+0\%$ for FIFO

### Congestion Index

Represents the risk of warehouse congestion: Low (utilization below 60%), Medium (60%-84%), or High (85% and above).

### Inventory Health

Indicates inventory stability: Healthy (when orders >= threshold) or Low Stock (when orders < threshold).

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

1. Click the **Export CSV** button (available in both the control panel and the operation log section) to download a CSV file containing all simulation run data.

2. Review the **Warehouse Operation Log** table that records: Run number, Capacity, Incoming Orders, AGV Speed, Inventory Threshold, Storage Utilization, AGV Utilization, Processing Time, Operations Efficiency (η), and Warehouse State for each run.

3. Record the following outputs from a representative simulation run:

| Parameter | Observation |
|-----------|-------------|
| AGV Fleet Size | ______ |
| Routing Algorithm | ______ |
| Storage Utilization | ______ |
| AGV Processing Time | ______ |
| AGV Utilization | ______ |
| Warehouse Efficiency | ______ |
| Pending Orders | ______ |
| Congestion Index | ______ |
| Storage Health | ______ |
| Warehouse State | ______ |

---

# Result

The Smart Warehouse Management Simulator was successfully executed. The effects of storage capacity, incoming orders, AGV speed, and inventory threshold on warehouse performance were analyzed. Key warehouse KPIs such as storage utilization, AGV processing time, AGV utilization, congestion index, inventory health, and overall efficiency were evaluated using the digital twin visualization, operations center, KPI trend charts, congestion heatmap, and smart recommendation engine. The experiment demonstrates how Industry 4.0 technologies enable data-driven optimization of warehouse operations and logistics management.