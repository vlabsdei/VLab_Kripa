# Theory

## 1. Introduction

A Smart Warehouse Management System (SWMS) is an advanced logistics and inventory management solution that utilizes automation, robotics, Industrial Internet of Things (IIoT), real-time monitoring, and data analytics to improve warehouse operations. Smart warehouses are a fundamental component of Industry 4.0, enabling organizations to increase efficiency, reduce operational costs, and enhance order fulfillment accuracy.

Traditional warehouses rely heavily on manual inventory tracking and material movement, whereas smart warehouses use intelligent systems to automate storage, retrieval, inventory management, and order processing activities.

---

## 2. Smart Warehouse in Industry 4.0

Industry 4.0 introduces interconnected systems where machines, sensors, software platforms, and robots communicate continuously. In a smart warehouse, this communication enables real-time decision-making and optimized logistics operations.

Key Industry 4.0 technologies used in smart warehouses include:

- Internet of Things (IoT)
- Automated Guided Vehicles (AGVs)
- Robotics and Automation
- Cloud Computing
- Artificial Intelligence (AI)
- Big Data Analytics
- Digital Twin Technology
- RFID and Smart Tracking Systems

These technologies improve inventory visibility, warehouse utilization, and operational productivity.

---

## 3. Warehouse Management System (WMS)

A Warehouse Management System (WMS) is software that controls and optimizes warehouse operations.

Major functions include:

- Inventory tracking
- Storage allocation
- Order management
- Resource utilization
- Warehouse analytics
- Shipment planning
- Demand forecasting

A WMS continuously monitors warehouse resources and helps managers make informed operational decisions.

---

## 4. Storage Management

Storage management refers to the efficient utilization of available warehouse space.

The storage utilization percentage is calculated as:

<p align="center">
<i>Storage Utilization = (Used Storage / Total Storage) × 100</i>
</p>

Where:

- **Used Storage:** Occupied warehouse capacity.
- **Total Storage:** Maximum warehouse capacity.

Higher storage utilization improves warehouse efficiency. However, excessive utilization may lead to congestion and operational delays.

---

## 5. Inventory Management

Inventory management ensures that products are available when needed while minimizing storage costs.

Important inventory parameters include:

### Inventory Level

Current quantity of goods available in storage.

---

### Inventory Threshold

Minimum inventory level that triggers replenishment activities.

---

### Reorder Point

The inventory quantity at which new stock must be ordered.

---

### Safety Stock

Extra inventory maintained to prevent stockouts during unexpected demand fluctuations.

**Observation**

Effective inventory management helps maintain continuous warehouse operations.

---

## 6. Automated Guided Vehicles (AGVs)

Automated Guided Vehicles (AGVs) are mobile robots used for material transportation inside warehouses.

Functions of AGVs include:

- Product transportation
- Storage operations
- Order fulfillment
- Inventory movement
- Warehouse routing

Benefits of AGVs:

- Reduced labor requirements
- Faster transportation
- Improved safety
- Higher operational efficiency
- Continuous operation capability

---

## 7. Order Processing

Order processing involves receiving, verifying, picking, packing, and dispatching customer orders.

Order processing performance directly affects:

- Customer satisfaction
- Delivery time
- Warehouse efficiency
- Logistics costs

The order processing time can be estimated as:

<p align="center">
<i>Processing Time = Number of Orders / Robot Speed</i>
</p>

A lower processing time indicates a more efficient warehouse operation.

---

## 8. Robot Utilization

Robot utilization measures how effectively warehouse robots are being used.

<p align="center">
<i>Robot Utilization = (Active Time / Available Time) × 100</i>
</p>

High robot utilization indicates efficient use of automation resources.

However, excessive utilization may lead to:

- Increased wear and tear
- Higher maintenance requirements
- Reduced system reliability

---

## 9. Warehouse Congestion

Warehouse congestion occurs when inventory levels, order volumes, or transportation activities exceed the warehouse's handling capacity.

Common causes include:

- High storage utilization
- Excessive incoming orders
- Slow transportation systems
- Poor inventory planning

Effects of congestion:

- Delayed order fulfillment
- Increased processing time
- Reduced operational efficiency
- Safety risks

Congestion monitoring is an important part of smart warehouse management.

---

## 10. Digital Twin Technology in Warehouses

A Digital Twin is a virtual representation of a physical warehouse system.

The digital twin continuously receives operational data and provides:

- Real-time monitoring
- Predictive analytics
- Performance optimization
- Resource planning
- Failure detection

Digital twins enable warehouse managers to simulate operational scenarios before implementing real-world changes.

---

## 11. Key Performance Indicators (KPIs)

Smart warehouses use **Key Performance Indicators (KPIs)** to evaluate operational performance.

### Storage Utilization (%)

Measures warehouse space efficiency.

---

### Order Processing Time

Measures order fulfillment speed.

---

### Robot Utilization (%)

Measures automation efficiency.

---

### Warehouse Efficiency

Indicates overall warehouse productivity.

---

### Congestion Index

Measures operational congestion risk.

---

### Inventory Health

Represents the condition of inventory availability and stock balance.

---

These KPIs help managers identify performance bottlenecks and optimize warehouse operations.

---

## 12. Applications of Smart Warehouses

Smart warehouse systems are widely used in:

- E-commerce fulfillment centers
- Manufacturing industries
- Retail distribution centers
- Pharmaceutical logistics
- Automotive supply chains
- Food and beverage warehouses
- Third-party logistics providers (3PL)

Organizations such as Amazon, Walmart, Flipkart, and DHL use smart warehouse technologies to manage large-scale logistics operations efficiently.

---

## 13. Learning Outcome

After completing this experiment, learners will be able to:

- Understand smart warehouse architecture.
- Analyze storage utilization and inventory management.
- Evaluate AGV fleet performance and routing optimization.
- Understand Digital Twin technology and congestion heatmaps.

## 14. Simulation Calculation Engine

The warehouse simulator utilizes real-time mathematical models to calculate various KPIs based on the configured parameters. All values are capped at **100%** where applicable.

---

### 1. Storage Utilization (%)

Calculates how much of the warehouse capacity is currently occupied by incoming orders.

**Formula:**

<p align="center">
<i>Storage Utilization = min(100, (Incoming Orders / Storage Capacity) × 100)</i>
</p>

---

### 2. AGV Processing Time (minutes)

Estimates the time required to process and transport all incoming orders based on the size and speed of the AGV fleet, as well as the travel efficiency of the routing algorithm.

**Formula:**

<p align="center">
<i>Processing Time = (Incoming Orders / (Fleet Size × AGV Speed × 20)) × M<sub>algo</sub></i>
</p>

Where:

- **M<sub>algo</sub> = 0.80** for **Nearest Neighbor** (reduces travel time by **20%**).
- **M<sub>algo</sub> = 0.90** for **Balanced Load** (reduces congestion delays by **10%**).
- **M<sub>algo</sub> = 1.00** for **FIFO** (baseline travel time).

---

### 3. AGV Utilization (%)

Measures the workload placed on the Automated Guided Vehicle (AGV) fleet relative to its fleet size and operational speed.

**Formula:**

<p align="center">
<i>AGV Utilization = min(100, Incoming Orders / (Fleet Size × AGV Speed × 10))</i>
</p>

---

### 4. Overall Efficiency Score (%)

A derived metric that indicates the overall health of the warehouse operation. It starts at **100%** and applies penalties based on storage and fleet bottlenecks, while adding bonuses for advanced routing.

**Formula:**

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
- The efficiency score is capped at **100%** and has a minimum value of **40%**.

---

### 5. Pending Orders

Estimates the backlog of orders that cannot be fulfilled immediately by the current active AGV fleet.

**Formula:**

<p align="center">
<i>Pending Orders = max(0, Incoming Orders − (Fleet Size × AGV Speed × 60))</i>
</p>

---

### 6. Congestion Index

A categorical indicator derived from storage utilization that classifies the level of warehouse congestion.

| **Storage Utilization** | **Congestion Level** |
|-------------------------|----------------------|
| Below **60%** | Low |
| **60% to 84%** | Medium |
| **85% and above** | High |

---

### 7. Inventory Health

Indicates whether current stock levels are adequate relative to the configured inventory threshold. In the simulation UI, this health status is reflected through the **Smart Recommendations** and **Live Calculation Trace** panels.

| **Condition** | **Health Status (UI Indicators)** |
|---------------|-----------------------------------|
| Incoming Orders ≥ Inventory Threshold | Healthy (No stock warnings) |
| Incoming Orders < Inventory Threshold | Low Stock ("Low Stock Alert" warning in recommendations and trace) |

---

### 8. Rack Zone Distribution

The warehouse contains four physical rack zones (**A**, **B**, **C**, and **D**) in the SVG layout that are filled proportionally based on the overall storage utilization.

| **Rack Zone** | **Fill Percentage** |
|---------------|---------------------|
| Zone A | Storage Utilization |
| Zone B | Storage Utilization × 0.90 |
| Zone C | Storage Utilization × 0.75 |
| Zone D | Storage Utilization × 0.60 |

---

### 9. Congestion Heatmap Zone Distribution

The congestion heatmap displays the activity levels across four key functional areas. Zones **A** and **B** scale with storage utilization, while the activity-driven packaging and dispatch areas (**Zones C** and **D**) scale with AGV utilization.

| **Heatmap Zone** | **Functional Area** | **Activity Level Percentage** |
|------------------|---------------------|-------------------------------|
| Zone A | Storage | Storage Utilization |
| Zone B | Picking | Storage Utilization × 0.90 |
| Zone C | Packaging | AGV Utilization × 0.80 |
| Zone D | Dispatch | AGV Utilization × 0.60 |
