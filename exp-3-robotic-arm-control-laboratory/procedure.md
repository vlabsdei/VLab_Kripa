# Procedure

## Step 1 — Launch the Simulation

1. Launch the **Robotic Arm Control Laboratory** simulation from the Virtual Lab interface.

2. The **Robotic Arm Control Laboratory** interface will load with three columns:

   - **Left** — Control Console, Disturbance Models, and System Advisor.
   - **Centre** — Forward Kinematics Simulation Viewport and Real-Time Telemetry Plotter.
   - **Right** — Advanced Analytics and Lab Observation Log.

---

## Step 2 — Understand the Initial State

1. Observe the default configuration loaded when the simulation starts.

   - **Joint 1 Angle (θ₁):** **45°**
   - **Joint 2 Angle (θ₂):** **45°**
   - **Linkage Extension (L):** **1.0 m**
   - **End-Effector Payload:** **2.0 kg**

2. Observe the robotic arm displayed in the SVG viewport. The two links are positioned according to the **Forward Kinematics** equations.

3. Observe the **LIVE JOINT ANGLES** overlay located in the upper-left corner of the simulation viewport. The panel continuously displays the current values of **θ₁** and **θ₂** in real time.

4. Observe the **dashed blue circle**, which represents the maximum reachable workspace boundary of the robotic arm.

<p align="center">
<i>Maximum Reach = 2L = 2.0 m (Default Configuration)</i>
</p>

5. Observe the **System Advisor** panel located in the left column. The panel displays live status messages describing the current operating condition of the robotic arm.

---

## Step 3 — Adjust Joint Angle θ₁ (Joint 1)

1. Locate the **Joint 1 Angle (θ₁)** slider in the **Control Console** (Panel 1).

2. Drag the slider or enter a value in the number box (range: **0° to 180°**).

3. Observe the following changes simultaneously:

   - The **blue angle badge** beside the slider updates to the current angle value.
   - The **LIVE JOINT ANGLES** overlay updates the value of **θ₁**.
   - **Link 1** rotates about the robot base in the SVG viewport.
   - The **Cartesian X** and **Cartesian Y** values in the **Advanced Analytics** panel (Panel 5) update.
   - The **θ₁ Kinematic Trace** (blue line) is plotted on the oscilloscope.
   - The **System Advisor** displays updated stability and target proximity messages.

4. Observe that joint angles approaching **0°** or **180°** cause the angle badge to **pulse red**, indicating a near-singular configuration.

---

## Step 4 — Adjust Joint Angle θ₂ (Joint 2)

1. Locate the **Joint 2 Angle (θ₂)** slider in the **Control Console**.

2. Drag the slider or enter a value (range: **0° to 180°**).

3. Observe the following changes simultaneously:

   - The **green angle badge** beside the slider updates.
   - **Link 2** repositions in the SVG viewport relative to **Link 1**.
   - The **LIVE JOINT ANGLES** overlay updates the value of **θ₂**.
   - The **Singularity Risk / Accuracy Score** changes. It is maximized when **θ₂ = 90°** and decreases as **θ₂** deviates from **90°**.
   - The **θ₂ Kinematic Trace** (green line) is recorded on the oscilloscope.

---

## Step 5 — Adjust Linkage Extension (L)

1. Move the **Linkage Extension (L)** slider (range: **0.5 m to 2.0 m**).

2. Observe that both robotic arm links **scale proportionally in length** within the SVG viewport.

3. Observe the **dashed blue workspace boundary** resize. Its radius equals **2L**, and the accompanying label updates accordingly (for example, **"Max Reach: 1.50 m"**).

4. Observe how increasing the **Linkage Extension** increases the end-effector reach, causing the **Cartesian X** and **Cartesian Y** coordinates to change proportionally.

---

## Step 6 — Adjust Payload

1. Move the **End-Effector Payload** slider (range: **0.1 kg to 10.0 kg**).

2. Observe the **Base Torque (τ)** metric. It increases as the payload increases and is computed as:

<p align="center">
<i>τ = m × 9.81 × |x|</i>
</p>

3. Observe that increasing the payload reduces the **System Stability**, which is computed as:

<p align="center">
<i>Stability (%) = 100 − (τ × 1.5)</i>
</p>

4. If the **System Stability** falls **below 50%**, observe the following:

   - The **System Stability** metric is highlighted in **red**.
   - The **robot assembly vibrates** in the SVG viewport, indicating an unstable operating condition.
   - The **System Advisor** displays a **[WARN]** or **[CRIT]** stability message.

---

## Step 7 — Attempt to Reach the Target Zone

The **Target Zone** (colored rectangle in the SVG viewport) represents a pick-and-place destination.

1. Observe the initial **red Target Zone** displaying a cross (**✕**) symbol.

2. Gradually adjust the sliders toward **θ₁ ≈ 20°**, **θ₂ ≈ 40°**, and **L = 1.0 m**.

3. Observe the target zone change through the following states:

   - **Red** — The robotic arm is far from the target.
   - **Orange** — The robotic arm is within **70 px** of the target (**System Advisor** displays **[NEAR]**).
   - **Green with checkmark (✓)** — The robotic arm has reached the target.

4. When the target is reached, verify the following:

   - The gripper jaws **close** visually.
   - The **"TARGET REACHED!"** badge appears in **green** within the viewport.
   - The **System Advisor** displays a **[TARGET]** success message.

---

## Step 8 — Execute Trajectory Animation

1. Set **θ₁** and **θ₂** to any desired starting values.

2. Click the **EXECUTE TRAJECTORY** button.

3. Observe that both joint angles automatically sweep to their alternate target positions (**45° ↔ 135°**) using a smooth **ease-in-out** animation.

4. During the animation, verify the following:

   - The slider values update synchronously.
   - The angle badges update during every animation frame.
   - The SVG robotic arm moves continuously.
   - The oscilloscope records both joint traces in real time.
   - The end-effector path is traced as a **blue line** within the SVG viewport.

---

## Step 9 — Inject Disturbance Models

Navigate to **Panel 2 — Disturbance Models**.

Each disturbance button **toggles**. Click the button once to activate the disturbance (the button glows **red**), and click it again to deactivate it.

Test each disturbance individually and then in combination.

<table>
<thead>
<tr>
<th>Disturbance Button</th>
<th>What to Observe</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>[!] Inject Motor Overload</b></td>
<td>Button glows <b>red</b>. Base Torque is multiplied by <b>2.5×</b>. System Stability decreases significantly, and the vibration animation is likely to activate.</td>
</tr>
<tr>
<td><b>[!] Induce Joint Friction</b></td>
<td>Button glows <b>red</b>. Accuracy Score decreases by <b>25%</b>. The Accuracy metric is highlighted in red.</td>
</tr>
<tr>
<td><b>[!] Shift Payload Center</b></td>
<td>Button glows <b>red</b>. System Stability decreases by an additional <b>30%</b>. The robotic arm may begin vibrating.</td>
</tr>
</tbody>
</table>

After testing each disturbance:

1. Click **Clear External Disturbances** to remove all active faults simultaneously.

2. Verify that all disturbance buttons return to their normal state (no red glow) and that all performance metrics return to their normal values.

---

## Step 10 — Record Observations

1. Set a specific robotic arm configuration (**θ₁**, **θ₂**, **L**, and **Payload**).

2. Click **RECORD DATA POINT** in the **Lab Observation Log** (Panel 6).

3. Verify that a new entry is added to the bottom of the observation table containing the following information:

   - Observation ID
   - θ₁ (degrees)
   - θ₂ (degrees)
   - End-effector X position (metres)
   - End-effector Y position (metres)
   - System Stability (%)

4. Repeat the procedure for at least **five different configurations**, varying one parameter at a time.

5. After completing all observations, click **EXPORT CSV** to download the recorded data as a **.csv** file for use in laboratory reports.

---

## Step 11 — Systematic Observations to Record

Perform the following experimental configurations and record the corresponding observations.

<table>
<thead>
<tr>
<th>#</th>
<th>θ₁</th>
<th>θ₂</th>
<th>L (m)</th>
<th>Payload (kg)</th>
<th>Expected Observation</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>45°</td>
<td>45°</td>
<td>1.0</td>
<td>2.0</td>
<td>Baseline configuration</td>
</tr>
<tr>
<td>2</td>
<td>90°</td>
<td>90°</td>
<td>1.0</td>
<td>2.0</td>
<td>Maximum Y extension</td>
</tr>
<tr>
<td>3</td>
<td>45°</td>
<td>0°</td>
<td>1.0</td>
<td>2.0</td>
<td>Near-singular configuration — angle badge pulses red and the <b>[SING]</b> advisor alert appears.</td>
</tr>
<tr>
<td>4</td>
<td>45°</td>
<td>90°</td>
<td>1.0</td>
<td>2.0</td>
<td>Maximum Accuracy Score</td>
</tr>
<tr>
<td>5</td>
<td>20°</td>
<td>40°</td>
<td>1.0</td>
<td>2.0</td>
<td>Target zone reached — gripper closes.</td>
</tr>
<tr>
<td>6</td>
<td>45°</td>
<td>45°</td>
<td>1.0</td>
<td>9.0</td>
<td>High Base Torque — System Stability decreases and vibration activates.</td>
</tr>
<tr>
<td>7</td>
<td>135°</td>
<td>135°</td>
<td>1.5</td>
<td>5.0</td>
<td>Extended arm operating under high load.</td>
</tr>
</tbody>
</table>

---

## Step 12 — Analyse Telemetry Plotter

After performing several slider adjustments and trajectory executions:

1. Observe the **Real-Time Telemetry Plotter** (Panel 4).

2. Identify the following traces:

   - **Blue Trace** — θ₁ (Joint 1)
   - **Green Trace** — θ₂ (Joint 2)

3. Observe that rapid slider movements produce steep gradients in the plotted traces, whereas the **Execute Trajectory** animation produces smooth, continuous curves.

---

## Step 13 — Read the System Advisor

Review the **System Advisor** panel located at the bottom of the left column.

1. Observe how the advisor messages change as you adjust the sliders, inject disturbances, or move the robotic arm toward the target zone.

2. Identify any **[WARN]** or **[CRIT]** messages and perform the recommended corrective actions.

3. Aim to achieve an **all-green ([OK])** System Advisor state for all monitored parameters.

---

## Step 14 — Reset and Repeat

1. Click **RESET TO BASELINE** to restore the default configuration (**θ₁ = 45°**, **θ₂ = 45°**, **L = 1.0 m**, **Payload = 2.0 kg**) and clear all recorded traces. Any active disturbance buttons are also reset.

2. Repeat the experiment using a different set of initial parameters.

3. Click **CLEAR NOTEBOOK** to reset the observation log for a new experimental session.

---

# Result

The two-link planar robotic arm simulation was successfully operated. Joint angles **θ₁** and **θ₂** were adjusted using the **Control Console** sliders, and the **Forward Kinematics** equations were verified in real time through the computed **Cartesian X** and **Cartesian Y** coordinates displayed in the **Advanced Analytics** panel.

The effects of **Linkage Extension**, **Payload Weight**, **Disturbance Injection**, and **Joint Configuration** on **System Stability**, **Base Torque**, and **Singularity Risk** were observed and recorded.

The target zone was successfully reached by setting **θ₁ ≈ 20°**, **θ₂ ≈ 40°**, and **L = 1.0 m**, confirming the accuracy of the **Tool Center Point (TCP)** position calculation.

The simulation confirmed the following observations:

- The end-effector position follows the **Forward Kinematics** equations.

<p align="center">
<i>x = l<sub>1</sub> × cos(θ<sub>1</sub>) + l<sub>2</sub> × cos(θ<sub>1</sub> + θ<sub>2</sub>)</i>
</p>

<p align="center">
<i>y = l<sub>1</sub> × sin(θ<sub>1</sub>) + l<sub>2</sub> × sin(θ<sub>1</sub> + θ<sub>2</sub>)</i>
</p>

- System Stability decreases as the payload and Base Torque increase.
- Singularity Risk is highest when **θ₂** approaches **0°** or **180°**.
- External disturbances combine to degrade both System Stability and Accuracy. Each disturbance button can be toggled on or off independently.
- The **Execute Trajectory** animation demonstrates smooth, physically realistic joint sweeps using **ease-in-out interpolation**.
- The **System Advisor** provided real-time guidance throughout the experiment by identifying critical conditions and confirming normal system operation.
- Observation data was recorded in chronological order and exported as a **CSV** file for further analysis.
