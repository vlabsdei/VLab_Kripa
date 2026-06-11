# Procedure

Follow these steps to conduct the virtual lab experiment:

---

## Part 1: Initializing and Exploring Machinery Profiles

1. **Launch the Simulation:** Open the simulation dashboard (`index.html`) in a modern web browser.
2. **Explore Default Baselines:**
   - Observe the initial machinery type selection: **Centrifugal Pump**. Note the default safe parameters (e.g., Temp: 42.0 °C, Pressure: 12.4 bar, Vibration: 2.1 mm/s, Humidity: 65.0 %).
   - Use the **Select Machine Type** panel to switch to the **AC Induction Motor** or **Rotary Air Compressor**. Observe how the animated Live Machine Schematic updates to reflect the active machine, and how the baseline parameters adjust automatically.

---

## Part 2: Real-time Telemetry and Noise Filtering

3. **Simulate Signal Noise:**
   - In the **Signal Configuration** panel on the left, toggle **Enable Signal Noise**.
   - Observe the **Real-Time Sensor Waveform Plotter** at the bottom. Notice how the fluid lines for Temp, Pressure, Vibration, and Humidity begin to fluctuate with physical sensor noise, reflecting real-world SCADA telemetry.
   - Adjust the **Refresh Rate** slider to speed up the simulation time scale.
   - Manually drag the sliders in the **Sensor Input Parameters** panel and observe how the live line charts, machine health index, and mini-gauges update instantly.

---

## Part 3: Simulating System Failures (Fault Injection)

4. **Trigger Fault Injections:**
   - Locate the **Fault Injection Panel** at the bottom left.
   - Click the **Trigger Cavitation Fault** button.
   - Watch the right-side panels. Observe the **Machine Health Index** drop to "Critical" (red). 
   - Check the **Predictive Maintenance** card. Notice how the **Cavitation Risk** progress bar spikes dramatically, triggering an alert banner at the top of the card.
   - Observe the animated **Live Machine Schematic**. The motor/pump animation will visually change its motion speed and color to indicate a critical stress state.
5. **Clear Faults:** 
   - Click the **Reset to Factory Baseline** button under Signal Configuration to clear the active fault and return all sensors to their nominal safe zones.
6. **Simulate Other Degradations:**
   - Inject **Induce Bearing Degradation** or **Force Thermal Overload**. Watch how **Bearing Wear** percentages respond differently to temperature and vibration spikes compared to pressure-driven cavitation.

---

## Part 4: Logging Notebook Observations & Exporting

7. **Log Observation Runs:**
   - Configure a specific state (e.g., normal operation).
   - Scroll down to the **Lab Observation Log** section.
   - Click the **Record Data Point** button. The current sensor values, calculated RTD Resistance, Health Score, and Status badge will be permanently appended to the data table.
   - Introduce a fault (e.g., Thermal Overload), wait a few seconds, and click **Record Data Point** again to log the critical state. Log at least 4 distinct operating conditions.
8. **Export Lab Workbook:**
   - Click the **Export as CSV** button next to the record button. This downloads a `.csv` spreadsheet containing your captured telemetry data runs, which you can format and attach to your final lab report.