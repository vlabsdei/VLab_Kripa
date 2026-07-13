# Theory

## 1. Introduction to Smart Energy Optimization
In Industry 4.0, **Smart Energy Optimization** is a core pillar of sustainable manufacturing. Modern industrial facilities consume substantial amounts of electrical energy, accounting for a significant portion of operating expenses. Smart energy systems utilize Internet of Things (IoT) sensors, smart meters, and edge computing to monitor, analyze, and optimize energy flows.

The goals of a Smart Energy Optimization System are:
- Minimizing total power and energy consumption.
- Reducing carbon footprint by maximizing renewable energy utilization.
- Managing peak demand charges using battery energy storage systems (BESS) and demand response.
- Improving power factor to avoid utility penalties and lower system losses.

---

## 2. Industrial Energy Management Formulas
Industrial energy management relies on core mathematical models to represent electrical loads, power quality, and energy distribution.

### 2.1 Total Active Power (<i>P<sub>total</sub></i>)
The total active power consumption of the factory at any instant is the sum of the power consumed by active production machines, conveyor systems, auxiliary loads (HVAC and lighting), and standby losses from idle machines:


<p align="center">
<i>P<sub>total</sub> = P<sub>machines</sub> + P<sub>conveyor</sub> + P<sub>aux</sub> + P<sub>idle</sub></i>
</p>


Where:
- **Machine Production Power (<i>P<sub>machines</sub></i>)**: Power consumed by machines performing active manufacturing processes.
  
<p align="center">
<i>P<sub>machines</sub> = (Machine Load (%) / 100) × N<sub>active</sub> × P<sub>base</sub></i>
</p>

  - <i>N<sub>active</sub></i> is the number of active production machines (e.g., <i>10 - N<sub>idle</sub></i> where total machines = 10).
  - <i>P<sub>base</sub></i> is the rated active power of a single machine under full load (e.g., <i>15 kW</i>).
- **Idle/Standby Power (<i>P<sub>idle</sub></i>)**: Power wasted by idle machines left running in standby mode.
  
<p align="center">
<i>P<sub>idle</sub> = N<sub>idle</sub> × P<sub>standby</sub></i>
</p>

  - <i>N<sub>idle</sub></i> is the count of idle machines.
  - <i>P<sub>standby</sub></i> is the standby power consumed by a machine (e.g., <i>2.5 kW</i>).
- **Conveyor Belt Power (<i>P<sub>conveyor</sub></i>)**: Power required to run the automated material handling system.
  
<p align="center">
<i>P<sub>conveyor</sub> = P<sub>conv-base</sub> × (1 + Machine Load (%) / 100)</i>
</p>

  - <i>P<sub>conv-base</sub></i> is the base conveyor power (e.g., <i>5 kW</i>).
- **Auxiliary HVAC and Lighting Power (<i>P<sub>aux</sub></i>)**:
  
<p align="center">
<i>P<sub>aux</sub> = P<sub>hvac-base</sub> + P<sub>light-base</sub></i>
</p>

  - <i>P<sub>hvac-base</sub></i> is the climate control power (e.g., <i>12 kW</i>).
  - <i>P<sub>light-base</sub></i> is the illumination power (e.g., <i>3 kW</i>).

### 2.2 Total Energy Consumption (<i>E<sub>total</sub></i>)
Energy consumption represents active power integrated over the factory's operating duration (<i>t</i> in hours):


<p align="center">
<i>E<sub>total</sub> = P<sub>total</sub> × t</i>
</p>


---

## 3. Power Quality and Power Factor Correction
Industrial loads (like electric motors, induction heaters, and transformers) are inductive, drawing both active power (<i>P</i>, measured in kW) and reactive power (<i>Q</i>, measured in kVAR).

### 3.1 Apparent Power (<i>S</i>) and Power Factor (<i>PF</i>)
The relationship between active, reactive, and apparent power is represented by the power triangle:


<p align="center">
<i>S = P / PF   (measured in kVA)</i>
</p>



<p align="center">
<i>Q = √(S<sup>2</sup> - P<sup>2</sup>) = P × \tan(θ)   (measured in kVAR)</i>
</p>


Where <i>\cos(θ) = PF</i> represents the Power Factor.
- A **low Power Factor** (<i>PF < 0.90</i>) indicates high reactive power draw, causing larger current flowing through transformers and lines, increasing transmission losses, and resulting in **Power Factor Penalties** on electricity bills.
- **Power Factor Correction (PFC)**: The installation of capacitor banks near inductive loads supplies local reactive power, increasing the power factor toward unity (<i>1.00</i>).

---

## 4. Renewable Integration and Battery Energy Storage Systems (BESS)
To reduce utility grid dependence and carbon emissions, modern factories integrate rooftop solar photovoltaic (PV) generation and Battery Energy Storage Systems (BESS).

### 4.1 Solar Power Generation
The solar energy output (<i>E<sub>solar</sub></i>) depends on the renewable contribution setting (<i>R<sub>renewable</sub></i> in %):


<p align="center">
<i>E<sub>solar</sub> = E<sub>total</sub> × (R<sub>renewable</sub> / 100)</i>
</p>


### 4.2 Battery Energy Storage Dynamics
The BESS helps shift load and shave peak grid power. Let <i>SOC</i> be the Battery State of Charge:
- **Discharging**: When battery energy is utilized to support load (e.g., during Peak Shaving Mode).
- **Charging**: Excess renewable power charges the battery.
- The battery contribution to load (<i>E<sub>battery</sub></i>) is constrained by its <i>SOC</i>:
  
<p align="center">
<i>E<sub>batt-max</sub> = C<sub>battery</sub> × (SOC - SOC<sub>min</sub> / 100)</i>
</p>

  - <i>C<sub>battery</sub></i> is the total battery capacity (e.g., <i>100 kWh</i>).
  - <i>SOC<sub>min</sub></i> is the minimum allowed charge to prevent degradation (e.g., <i>20%</i>).

### 4.3 Net Grid Energy (<i>E<sub>grid</sub></i>)
The energy drawn from the utility grid is the remaining demand:


<p align="center">
<i>E<sub>grid</sub> = max(0, E<sub>total</sub> - E<sub>solar</sub> - E<sub>battery</sub>)</i>
</p>


---

## 5. Peak Demand Management & Tariffs
Industrial tariffs charge for both energy consumption (<i>E<sub>grid</sub> × Tariff</i>) and peak demand.
- **Peak Grid Demand (<i>P<sub>grid-peak</sub></i>)**: The maximum demand registered by the grid smart meter.
  
<p align="center">
<i>P<sub>grid-peak</sub> = P<sub>total</sub> - P<sub>shaved</sub></i>
</p>

- **Peak Shaving Mode**: If active and battery capacity permits, the battery discharges to keep the grid demand below a set threshold (<i>P<sub>threshold</sub></i>):
  
<p align="center">
<i>P<sub>shaved</sub> = min(P<sub>total</sub> - P<sub>threshold</sub>, P<sub>discharge-max</sub>)</i>
</p>


---

## 6. Environmental and Operational Metrics
### 6.1 Carbon Emissions
Carbon dioxide emissions (<i>CO<sub>2</sub></i>) are calculated from the grid energy consumption using the local grid emission factor (<i>EF<sub>grid</sub></i>):


<p align="center">
<i>Carbon Emissions (kg  CO<sub>2</sub>) = E<sub>grid</sub> × EF<sub>grid</sub></i>
</p>

- Typical grid emission factor <i>EF<sub>grid</sub> = 0.82 kg  CO<sub>2</sub>/kWh</i> (based on fossil-fuel heavy utility generation).

### 6.2 Specific Energy Consumption (SEC)
Specific Energy Consumption measures the efficiency of production by calculating the energy required to produce a single unit of output:


<p align="center">
<i>SEC = E<sub>total</sub> / Total Units Produced   (kWh/unit)</i>
</p>


### 6.3 Factory Energy Efficiency (<i>η_{factory}</i>)

<p align="center">
<i>η_{factory} = 100 × (1 - P<sub>idle</sub> + P<sub>losses</sub> / P<sub>total</sub>)   (%)</i>
</p>

Where <i>P<sub>losses</sub></i> are the transmission and reactive losses resulting from a low power factor:

<p align="center">
<i>P<sub>losses</sub> = P<sub>total</sub> × (1 - PF)<sup>2</sup> × 0.25</i>
</p>


---

## 7. Simulator Calibration Constants & Parameters
For conducting numerical calculations during laboratory exercises, the simulator is calibrated using the following industrial constants:

### 7.1 Constant Energy Coefficients
- **Total Machines (<i>N<sub>total</sub></i>)**: <i>10</i> units.
- **Machine Rated Base Power (<i>P<sub>base</sub></i>)**: <i>15 kW</i> (Active power per machine at <i>100%</i> capacity).
- **Machine Standby Power (<i>P<sub>standby</sub></i>)**: <i>2.5 kW</i> (Power consumed per machine in standby mode).
- **Conveyor Base Power (<i>P<sub>conv-base</sub></i>)**: <i>5 kW</i>.
- **HVAC Rated Power (<i>P<sub>hvac-base</sub></i>)**: <i>12 kW</i>.
- **Lighting Rated Power (<i>P<sub>light-base</sub></i>)**: <i>3 kW</i>.
- **BESS Battery Storage Capacity (<i>C<sub>battery</sub></i>)**: <i>100 kWh</i>.
- **Grid Carbon Emission Factor (<i>EF<sub>grid</sub></i>)**: <i>0.82 kg CO<sub>2</sub>/kWh</i>.

### 7.2 Battery Storage Discharge Limits
The battery state of charge (<i>SOC</i>) cannot discharge below a safety limit of <i>20%</i> to protect cell life. The maximum energy discharge allowed (<i>E<sub>discharge-max</sub></i>) is:

<p align="center">
<i>E<sub>discharge-max</sub> = C<sub>battery</sub> × max(0, SOC - 20) / 100   (kWh)</i>
</p>


- **BESS Peak Shaving Mode**: Battery discharge is capped at <i>30%</i> of total factory energy requirement:
  
<p align="center">
<i>E<sub>battery</sub> = min(E<sub>total</sub> × 0.3, E<sub>discharge-max</sub>)   (kWh)</i>
</p>

- **Demand Response Mode**: Battery discharge is capped at <i>50%</i> of total factory energy requirement:
  
<p align="center">
<i>E<sub>battery</sub> = min(E<sub>total</sub> × 0.5, E<sub>discharge-max</sub>)   (kWh)</i>
</p>


### 7.3 Billing Penalty Formulations
Utilities charge a penalty surcharge on low power factor levels below a target threshold of <i>0.90</i>:
- **Power Factor Penalty Multiplier (<i>M<sub>PF</sub></i>)**:
  
<p align="center">
<i>If  PF < 0.90:   M<sub>PF</sub> = (0.90 - PF) × 0.15</i>
</p>

  
<p align="center">
<i>If  PF ≥ 0.90:   M<sub>PF</sub> = 0</i>
</p>

- **Total Billing Cost (<i>C<sub>total</sub></i>)**:
  
<p align="center">
<i>C<sub>total</sub> = (P<sub>grid</sub> × Tariff) × (1 + M<sub>PF</sub>)   (₹/hour)</i>
</p>

  
<p align="center">
<i>E<sub>grid-cost</sub> = C<sub>total</sub> × t   (₹)</i>
</p>


Students are encouraged to perform sample calculations using these configurations to verify the real-time feedback displayed on the digital twin.
