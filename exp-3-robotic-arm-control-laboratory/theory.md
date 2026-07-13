# Theory

## Introduction

Industrial robotic arms are programmable electro-mechanical systems designed to automate precise and repetitive manufacturing operations. A robotic arm's motion is governed by **kinematics** — the mathematical study of motion without considering forces — and **dynamics** — the study of forces and torques that produce motion.

This experiment focuses on a **two-link planar robotic arm** (2-DOF manipulator) operating in a 2D workspace. The arm is studied using **Forward Kinematics**, where the end-effector position is computed from known joint angles. The simulation models realistic physical phenomena including base torque, system stability, singularity risk, and external disturbance effects.

---

## Degrees of Freedom (DOF)

A **Degree of Freedom** represents an independent direction of motion available to a robotic joint. The simulation models a **2-DOF arm** with:

- **Joint 1 (θ₁)** — Rotates the first link relative to the fixed base. Range: 0° to 180°.
- **Joint 2 (θ₂)** — Rotates the second link relative to the first link. Range: 0° to 180°.

Each joint is independently controllable via the Control Console sliders.

---

## Forward Kinematics

**Forward Kinematics (FK)** is the process of computing the Cartesian coordinates of the end-effector (Tool Center Point) given the joint angles and link lengths.

For the two-link planar arm used in this simulation:

<p align="center">
<i>x = l<sub>1</sub> × cos(θ<sub>1</sub>) + l<sub>2</sub> × cos(θ<sub>1</sub> + θ<sub>2</sub>)</i>
</p>

<p align="center">
<i>y = l<sub>1</sub> × sin(θ<sub>1</sub>) + l<sub>2</sub> × sin(θ<sub>1</sub> + θ<sub>2</sub>)</i>
</p>

Where:

<table>
<thead>
<tr>
<th>Symbol</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>x</b></td>
<td>End-effector X coordinate (metres)</td>
</tr>
<tr>
<td><b>y</b></td>
<td>End-effector Y coordinate (metres)</td>
</tr>
<tr>
<td><b>l<sub>1</sub></b></td>
<td>Length of Link 1 (metres) — controlled by the <b>Linkage Extension</b> slider</td>
</tr>
<tr>
<td><b>l<sub>2</sub></b></td>
<td>Length of Link 2 (metres) — equal to <b>l<sub>1</sub></b> in this simulation</td>
</tr>
<tr>
<td><b>θ<sub>1</sub></b></td>
<td>Joint 1 angle (degrees), converted to radians for computation</td>
</tr>
<tr>
<td><b>θ<sub>2</sub></b></td>
<td>Joint 2 angle (degrees), converted to radians for computation</td>
</tr>
</tbody>
</table>

The simulation updates the values of <b>x</b> and <b>y</b> in the <b>Advanced Analytics</b> panel in real time as the sliders are adjusted.

---

## Linkage Extension

The **Linkage Extension (L)** slider scales both arm segments simultaneously (**l<sub>1</sub> = l<sub>2</sub> = L**). Increasing **L** extends the arm's reach, expanding its reachable workspace. The SVG viewport scales the link bodies proportionally in pixels as:

<p align="center">
<i>Pixel Length = L × 100 &nbsp; (pixels per metre)</i>
</p>

---

## Workspace Boundary

The simulation draws a **dashed blue circle** in the SVG viewport centered on the robot base. This circle represents the **maximum reachable radius** of the arm.

<p align="center">
<i>Maximum Reach = 2L &nbsp; (metres)</i>
</p>

The circle and its label (for example, **"Max Reach: 2.00 m"**) update in real time as the **Linkage Extension** slider is adjusted. Any point inside the circle is potentially reachable, whereas points outside the circle are not.

---

## Base Torque

The **Base Torque (τ)** is the rotational force exerted at the robot's fixed base, caused by the weight of the payload acting at the end-effector's horizontal distance from the base.

<p align="center">
<i>τ = m × g × |x|</i>
</p>

Where:

- **m** = Payload mass (kg)
- **g** = **9.81 m/s²** (gravitational acceleration)
- **|x|** = Absolute horizontal distance of the end-effector from the base

When the **Motor Overload** disturbance is active, the computed torque is multiplied by **2.5** to simulate an overloaded motor condition.

---

## System Stability

**System Stability** is a derived metric (**0–100%**) representing the operational safety margin of the robotic arm under its current configuration and load.

<p align="center">
<i>Stability (%) = 100 − (τ × 1.5)</i>
</p>

The calculated value is clamped between **0%** and **100%**.

Additional deductions:

- **Payload Center Shift** disturbance: **−30%** (simulates an unbalanced load)

When the **Stability** value falls **below 50%**, the simulation:

- Highlights the stability metric in **red**.
- Applies a physical **vibration animation** to the robot assembly in the SVG viewport.

---

## Singularity Risk and Accuracy Score

**Singularity** in robotics refers to arm configurations where the manipulator loses one or more degrees of freedom, causing unpredictable motion and control breakdown. For a two-link arm, singularity occurs when **θ<sub>2</sub> ≈ 0°** or **θ<sub>2</sub> ≈ 180°** (fully extended or fully folded).

The simulation computes an **Accuracy Score (0–100%)** based on singularity proximity.

<p align="center">
<i>Angle Deviation = |θ<sub>2</sub> − 90°|</i>
</p>

<p align="center">
<i>Accuracy (%) = 100 − (Angle Deviation × 0.4)</i>
</p>

A **θ<sub>2</sub>** value near **90°** is considered optimal and produces the highest accuracy.

Additional deductions:

- **Joint Friction** disturbance: **−25%**
- **Stability < 40%:** Additional **−15%**

When the **Accuracy Score** falls **below 70%**, the corresponding metric is highlighted in **red**.

---

## Disturbance Models

The simulation includes three injectable disturbance conditions to study fault responses.

<table>
<thead>
<tr>
<th>Disturbance</th>
<th>Effect on System</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Motor Overload</b></td>
<td>Multiplies the Base Torque by <b>2.5×</b>.</td>
</tr>
<tr>
<td><b>Joint Friction</b></td>
<td>Reduces the Accuracy Score by <b>25%</b>.</td>
</tr>
<tr>
<td><b>Payload Center Shift</b></td>
<td>Reduces the System Stability by <b>30%</b>.</td>
</tr>
</tbody>
</table>

Each disturbance button **toggles**. Clicking the button once activates the disturbance (the button glows **red**), while clicking it again deactivates the disturbance.

Multiple disturbances can be enabled simultaneously to simulate compound fault scenarios.

All active disturbances can be cleared simultaneously using the **Clear External Disturbances** button.

---

## Target Zone and Pick-and-Place Operation

The SVG viewport contains a **Target Zone**, represented by a colored rectangle that serves as the pick-and-place destination for the robotic arm.

The simulation continuously tracks the distance between the **Tool Center Point (TCP)** and the center of the target zone, producing the following visual states.

<table>
<thead>
<tr>
<th>State</th>
<th>Distance to Target</th>
<th>Observation</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Far</b></td>
<td>&gt; 70 px</td>
<td>Target zone is displayed in <b>red</b> with a cross (✕).</td>
</tr>
<tr>
<td><b>Getting Close</b></td>
<td>≤ 70 px</td>
<td>Target zone changes to <b>orange</b>.</td>
</tr>
<tr>
<td><b>Reached</b></td>
<td>≤ 28 px</td>
<td>Target zone changes to <b>green</b>, the gripper jaws close, and the <b>"TARGET REACHED!"</b> badge appears.</td>
</tr>
</tbody>
</table>

The target zone is reachable at approximately **θ<sub>1</sub> ≈ 20°**, **θ<sub>2</sub> ≈ 40°**, and **L = 1.0 m**.

---

## Real-Time Telemetry Plotter

The **Oscilloscope / Telemetry Plotter** continuously records and plots the history of **θ<sub>1</sub>** and **θ<sub>2</sub>** angle values over the last **200 data points**.

- **Blue Trace** — θ<sub>1</sub> (Joint 1 Kinematic Trace)
- **Green Trace** — θ<sub>2</sub> (Joint 2 Kinematic Trace)

The plotter updates on every slider interaction or animation frame, providing a live time-series record of joint angle trajectories.

---

## Execute Trajectory (Automated Sweep)

The **Execute Trajectory** button runs an automated easing animation that sweeps both joint angles between their current values and a target configuration (alternating between **45°** and **135°**).

The animation uses an **ease-in-out quadratic** function for smooth, physically realistic motion.

<p align="center">
<i>Ease = t &lt; 0.5 ? 2t² : 1 − ((−2t + 2)² / 2)</i>
</p>

During the sweep, the slider values, angle badges, SVG viewport, oscilloscope, and end-effector trace all update synchronously.

---

## Live Angle Display

The simulation provides two layers of real-time angle feedback.

### 1. Angle Badges

Displayed beside each joint slider in the **Control Console** and updated instantly whenever a slider value changes.

- **Blue badge** for **θ<sub>1</sub>**
- **Green badge** for **θ<sub>2</sub>**
- **Pulsing red** when the joint angle approaches its operating limits (**< 10°** or **> 170°**), indicating singularity risk

---

### 2. SVG Viewport Overlay

A dark information panel located in the upper-left corner of the simulation viewport displays the live values of **θ<sub>1</sub>** and **θ<sub>2</sub>**, updated continuously during every animation frame.

---

## System Advisor

The **System Advisor** panel (left column, below **Disturbance Models**) provides real-time contextual feedback about the robotic arm's operating state.

Messages are color-coded according to their severity.

<table>
<thead>
<tr>
<th>Label</th>
<th>Color</th>
<th>Meaning</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>[OK]</b></td>
<td>Green</td>
<td>System is operating normally.</td>
</tr>
<tr>
<td><b>[INFO]</b>, <b>[TARGET]</b>, <b>[NEAR]</b></td>
<td>Blue</td>
<td>Informational guidance.</td>
</tr>
<tr>
<td><b>[WARN]</b>, <b>[ACC]</b>, <b>[TORQ]</b>, <b>[LOAD]</b></td>
<td>Orange</td>
<td>Caution — parameter approaching its operating limit.</td>
</tr>
<tr>
<td><b>[CRIT]</b>, <b>[SING]</b>, <b>[FAULT]</b></td>
<td>Red</td>
<td>Critical condition requiring immediate attention.</td>
</tr>
</tbody>
</table>

The advisor checks the following parameters during every update cycle:

- Target proximity
- System Stability
- Base Torque
- Singularity Risk
- Active Faults
- Payload Level
- Linkage Extension

---

## Observation Log

The **Lab Observation Log** allows students to capture discrete data points during an experiment session.

Each recorded entry stores the following information.

- Observation ID
- θ<sub>1</sub> angle (degrees)
- θ<sub>2</sub> angle (degrees)
- End-effector X position (metres)
- End-effector Y position (metres)
- System Stability (%)

Entries are displayed in **chronological order** (oldest first and newest at the bottom).

The complete observation log can be exported as a **CSV** file using the **EXPORT CSV** button for use in laboratory reports.

---

## Conclusion

The two-link planar robotic arm simulation demonstrates the core principles of industrial robotics, including **Forward Kinematics**, **Torque Analysis**, **Stability Monitoring**, **Singularity Detection**, **Disturbance Response**, and **Pick-and-Place Targeting**.

Understanding these principles provides the foundation for designing, programming, and maintaining robotic systems in **Industry 4.0** smart manufacturing environments.
