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

### 2.1 Total Active Power ($P_{\text{total}}$)
The total active power consumption of the factory at any instant is the sum of the power consumed by active production machines, conveyor systems, auxiliary loads (HVAC and lighting), and standby losses from idle machines:

$$P_{\text{total}} = P_{\text{machines}} + P_{\text{conveyor}} + P_{\text{aux}} + P_{\text{idle}}$$

Where:
- **Machine Production Power ($P_{\text{machines}}$)**: Power consumed by machines performing active manufacturing processes.
  $$P_{\text{machines}} = \left(\frac{\text{Machine Load (\%)}}{100}\right) \times N_{\text{active}} \times P_{\text{base}}$$
  - $N_{\text{active}}$ is the number of active production machines (e.g., $10 - N_{\text{idle}}$ where total machines = 10).
  - $P_{\text{base}}$ is the rated active power of a single machine under full load (e.g., $15\text{ kW}$).
- **Idle/Standby Power ($P_{\text{idle}}$)**: Power wasted by idle machines left running in standby mode.
  $$P_{\text{idle}} = N_{\text{idle}} \times P_{\text{standby}}$$
  - $N_{\text{idle}}$ is the count of idle machines.
  - $P_{\text{standby}}$ is the standby power consumed by a machine (e.g., $2.5\text{ kW}$).
- **Conveyor Belt Power ($P_{\text{conveyor}}$)**: Power required to run the automated material handling system.
  $$P_{\text{conveyor}} = P_{\text{conv-base}} \times \left(1 + \frac{\text{Machine Load (\%)}}{100}\right)$$
  - $P_{\text{conv-base}}$ is the base conveyor power (e.g., $5\text{ kW}$).
- **Auxiliary HVAC and Lighting Power ($P_{\text{aux}}$)**:
  $$P_{\text{aux}} = P_{\text{hvac-base}} + P_{\text{light-base}}$$
  - $P_{\text{hvac-base}}$ is the climate control power (e.g., $12\text{ kW}$).
  - $P_{\text{light-base}}$ is the illumination power (e.g., $3\text{ kW}$).

### 2.2 Total Energy Consumption ($E_{\text{total}}$)
Energy consumption represents active power integrated over the factory's operating duration ($t$ in hours):

$$E_{\text{total}} = P_{\text{total}} \times t$$

---

## 3. Power Quality and Power Factor Correction
Industrial loads (like electric motors, induction heaters, and transformers) are inductive, drawing both active power ($P$, measured in kW) and reactive power ($Q$, measured in kVAR).

### 3.1 Apparent Power ($S$) and Power Factor ($PF$)
The relationship between active, reactive, and apparent power is represented by the power triangle:

$$S = \frac{P}{PF} \quad (\text{measured in kVA})$$

$$Q = \sqrt{S^2 - P^2} = P \times \tan(\theta) \quad (\text{measured in kVAR})$$

Where $\cos(\theta) = PF$ represents the Power Factor.
- A **low Power Factor** ($PF < 0.90$) indicates high reactive power draw, causing larger current flowing through transformers and lines, increasing transmission losses, and resulting in **Power Factor Penalties** on electricity bills.
- **Power Factor Correction (PFC)**: The installation of capacitor banks near inductive loads supplies local reactive power, increasing the power factor toward unity ($1.00$).

---

## 4. Renewable Integration and Battery Energy Storage Systems (BESS)
To reduce utility grid dependence and carbon emissions, modern factories integrate rooftop solar photovoltaic (PV) generation and Battery Energy Storage Systems (BESS).

### 4.1 Solar Power Generation
The solar energy output ($E_{\text{solar}}$) depends on the renewable contribution setting ($R_{\text{renewable}}$ in %):

$$E_{\text{solar}} = E_{\text{total}} \times \left(\frac{R_{\text{renewable}}}{100}\right)$$

### 4.2 Battery Energy Storage Dynamics
The BESS helps shift load and shave peak grid power. Let $SOC$ be the Battery State of Charge:
- **Discharging**: When battery energy is utilized to support load (e.g., during Peak Shaving Mode).
- **Charging**: Excess renewable power charges the battery.
- The battery contribution to load ($E_{\text{battery}}$) is constrained by its $SOC$:
  $$E_{\text{batt-max}} = C_{\text{battery}} \times \left(\frac{SOC - SOC_{\text{min}}}{100}\right)$$
  - $C_{\text{battery}}$ is the total battery capacity (e.g., $100\text{ kWh}$).
  - $SOC_{\text{min}}$ is the minimum allowed charge to prevent degradation (e.g., $20\%$).

### 4.3 Net Grid Energy ($E_{\text{grid}}$)
The energy drawn from the utility grid is the remaining demand:

$$E_{\text{grid}} = \max(0, E_{\text{total}} - E_{\text{solar}} - E_{\text{battery}})$$

---

## 5. Peak Demand Management & Tariffs
Industrial tariffs charge for both energy consumption ($E_{\text{grid}} \times \text{Tariff}$) and peak demand.
- **Peak Grid Demand ($P_{\text{grid-peak}}$)**: The maximum demand registered by the grid smart meter.
  $$P_{\text{grid-peak}} = P_{\text{total}} - P_{\text{shaved}}$$
- **Peak Shaving Mode**: If active and battery capacity permits, the battery discharges to keep the grid demand below a set threshold ($P_{\text{threshold}}$):
  $$P_{\text{shaved}} = \min(P_{\text{total}} - P_{\text{threshold}}, P_{\text{discharge-max}})$$

---

## 6. Environmental and Operational Metrics
### 6.1 Carbon Emissions
Carbon dioxide emissions ($CO_2$) are calculated from the grid energy consumption using the local grid emission factor ($\text{EF}_{\text{grid}}$):

$$\text{Carbon Emissions (kg } CO_2) = E_{\text{grid}} \times \text{EF}_{\text{grid}}$$
- Typical grid emission factor $\text{EF}_{\text{grid}} = 0.82\text{ kg } CO_2/\text{kWh}$ (based on fossil-fuel heavy utility generation).

### 6.2 Specific Energy Consumption (SEC)
Specific Energy Consumption measures the efficiency of production by calculating the energy required to produce a single unit of output:

$$\text{SEC} = \frac{E_{\text{total}}}{\text{Total Units Produced}} \quad (\text{kWh/unit})$$

### 6.3 Factory Energy Efficiency ($\eta_{\text{factory}}$)
$$\eta_{\text{factory}} = 100 \times \left(1 - \frac{P_{\text{idle}} + P_{\text{losses}}}{P_{\text{total}}}\right) \quad (\%)$$
Where $P_{\text{losses}}$ are the transmission and reactive losses resulting from a low power factor:
$$P_{\text{losses}} = P_{\text{total}} \times (1 - PF)^2 \times 0.25$$
