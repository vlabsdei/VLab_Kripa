# Procedure

## Step 1 – Initialize the Smart Energy Optimization Laboratory

Launch the Smart Energy Optimization Laboratory. The simulator loads the Industrial Energy Management Dashboard with default operating parameters, factory energy flow visualization, control panel, energy analytics, and monitoring indicators.

---

## Step 2 – Observe the Initial Factory Configuration

Observe the default values of the energy management parameters displayed in the Factory Control Panel.

The default parameters include:

- Machine Load (%)
- Operating Hours
- Renewable Energy Contribution (%)
- Idle Machines
- Power Factor
- Electricity Tariff (₹/kWh)
- Battery State of Charge (SOC)
- Peak Demand Mode

Also observe the initial values displayed on the Factory Energy Dashboard before executing the simulation.

---

## Step 3 – Configure Factory Energy Parameters

Adjust one or more operating parameters using the control panel.

Modify the following parameters as required:

- Machine Load
- Operating Hours
- Renewable Energy Contribution
- Idle Machines
- Power Factor
- Electricity Tariff
- Battery State of Charge
- Peak Demand Mode

Observe the parameter values before running the simulation.

---

## Step 4 – Execute the Simulation

Click the **Solve & Log Run** button.

The simulator calculates the energy performance of the smart factory using industrial engineering equations, logs the run details in the history table, and updates the digital energy flow twin in real time.

---

## Step 5 – Observe the Digital Twin Energy Flow and Wire Labels

Study the Digital Twin visualization displayed in the center panel.

Observe the real-time flow of electrical energy through the factory components:
- Utility Grid
- Solar Power System
- Battery Energy Storage System (BESS)
- Primary Substation Transformer
- Load Feeders (Machines, Conveyor, HVAC/Light)

Read the **SVG Wire Labels** on every wire segment. These boxes display the exact active power (in kW) moving through that specific path. Observe how they change dynamically when operating parameters are adjusted.

---

## Step 6 – Read the Real-Time Observation Panel

Look at the **Observation** panel located directly under the SVG.

Read the four real-time narrative statements. These translate complex mathematical and electrical results into plain English:
1. **Grid Source**: Explains how much grid energy is imported and the overall grid dependency percentage.
2. **Solar Contribution**: Describes solar offsets and utilization.
3. **Battery Status**: Details charge safety margins and peak shaving discharges.
4. **Machine Load**: Summarizes machine capacity, standby idle waste, and power factor reactive losses.

---

## Step 7 – Analyze Energy Performance Indicators

Observe the Key Performance Indicators (KPIs) displayed on the right dashboard.

Analyze the following parameters:
- Total Power Consumption (kW)
- Total Energy Consumption (kWh)
- Grid Energy Consumption (kWh)
- Carbon Footprint (kg CO₂)
- Factory Efficiency (%)

Compare the calculated values for different operating conditions.

---

## Step 8 – Monitor Factory Energy Status

Observe the System Health Indicators panel.

Analyze the following indicators:
- Grid Connection Status
- Power Factor status (cos θ)
- Battery Status
- Peak Demand mode state
- Hourly Tariff Cost (including low power factor penalties)

---

## Step 9 – Review AI Energy Advisor Recommendations

Observe the recommendations generated in the green card at the bottom right.

Study how different operating conditions affect system warnings:
- Low Power Factor penalties
- Standby losses from idle machines
- Battery SOC thresholds
- Peak shaving opportunities

---

## Step 10 – Review and Export the Simulation History Log

Observe the Simulation History Log generated at the bottom.

Compare the recorded values across multiple runs:
- Machine Load
- Total Power
- Energy Consumption
- Renewable Contribution
- Carbon Emission
- Factory Efficiency

You can click **Export CSV** to save this run data or **Clear Log** to reset the history log.

---

## Step 11 – Reset the Experiment

Click the **Reset** button in the Control Panel.

The simulator restores all operating parameters in the sliders to their default values and updates the Digital Twin visualization back to standard configuration. If you wish to clear all table rows, click **Clear Log** in the history section.