# Procedure

Follow these steps to conduct the virtual lab experiment:

---

## Part 1: Initializing and Exploring Machinery Profiles

1. **Launch the Simulation:** Open the **Industrial Machine Health Monitoring** simulation from the Virtual Lab interface.

2. **Explore Default Baselines:**
   - Observe the initial machinery type selection: **Centrifugal Pump**. Note the default safe parameters (e.g., Temp: **42.0 °C**, Pressure: **12.4 bar**, Vibration: **2.1 mm/s**, Humidity: **65.0 %**).
   - Use the **Select Machine Type** panel to switch to the **AC Induction Motor** or **Rotary Air Compressor**. Observe how the animated **Live Machine Schematic** updates to reflect the active machine and how the baseline parameters adjust automatically.

---

## Part 2: Real-Time Telemetry and Noise Filtering

3. **Simulate Signal Noise:**

   - In the **Signal Configuration** panel, enable the **Enable Signal Noise** option.
   - Observe the **Real-Time Sensor Waveform Plotter** located at the bottom of the dashboard. Notice how the temperature, pressure, vibration, and humidity waveforms begin to fluctuate due to simulated physical sensor noise, representing real-world SCADA telemetry.
   - Adjust the **Refresh Rate** slider to increase or decrease the simulation time scale.
   - Manually adjust the sliders in the **Sensor Input Parameters** panel and observe how the following update instantly in real time:
     - The live sensor waveform plots
     - The **Machine Health Index**
     - The mini-gauge indicators

---

## Part 3: Simulating System Failures (Fault Injection)

4. **Trigger Fault Injections:**

   - Locate the **Fault Injection Panel** at the bottom-left of the dashboard.
   - Click the **Trigger Cavitation Fault** button.
   - Observe the right-side diagnostic panels. Notice that the **Machine Health Index** drops to the **Critical** state (red).
   - Observe the **Predictive Maintenance** card. The **Cavitation Risk** progress bar increases sharply, triggering an alert banner at the top of the card.
   - Observe the animated **Live Machine Schematic**. The motor or pump animation changes its motion speed and color to indicate a critical stress condition.

5. **Clear Faults:**

   - Click the **Reset to Factory Baseline** button located under the **Signal Configuration** panel.
   - Observe that the active fault is cleared and all sensor values return to their nominal operating ranges.

6. **Simulate Other Degradations:**

   - Inject the **Induce Bearing Degradation** fault or the **Force Thermal Overload** fault.
   - Observe how the **Bearing Wear** percentage responds differently to temperature and vibration spikes compared with pressure-driven cavitation.

---

## Part 4: Logging Notebook Observations & Exporting

7. **Log Observation Runs:**

   - Configure a specific operating condition (for example, normal operation).
   - Scroll down to the **Lab Observation Log** section.
   - Click the **Record Data Point** button.
   - Observe that the current sensor values, calculated **RTD Resistance**, **Health Score**, and **Status** badge are appended to the observation table.
   - Introduce a fault (for example, **Thermal Overload**), wait a few seconds, and click **Record Data Point** again to record the critical operating condition.
   - Record at least **four distinct operating conditions**.

8. **Export Lab Workbook:**

   - Click the **Export as CSV** button located next to the **Record Data Point** button.
   - A **.csv** file containing the recorded telemetry data is downloaded. This file can be used for further analysis or attached to the final laboratory report.
