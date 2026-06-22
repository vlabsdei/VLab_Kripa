# Procedure

## Step 1 — Launch the Simulation

Open the file `simulation/index.html` in a web browser. The **Robotic Arm Control Laboratory** interface will load with three columns:
- **Left** — Control Console, Disturbance Models, and System Advisor
- **Centre** — Forward Kinematics Simulation Viewport and Real-Time Telemetry Plotter
- **Right** — Advanced Analytics and Lab Observation Log

---

## Step 2 — Understand the Initial State

Observe the default configuration loaded on startup:
- Joint 1 angle θ₁ = **45°**
- Joint 2 angle θ₂ = **45°**
- Linkage Extension L = **1.0 m**
- End-Effector Payload = **2.0 kg**

The robotic arm is rendered in the SVG viewport with the two links positioned according to the forward kinematics equations. The **LIVE JOINT ANGLES** overlay in the upper-left of the viewport confirms the current angles in real time. A **dashed blue circle** shows the maximum reachable workspace boundary (2L = 2.0 m at default). The **System Advisor** panel (left column) displays live status messages about the current arm configuration.

---

## Step 3 — Adjust Joint Angle θ₁ (Joint 1)

1. Locate the **Joint 1 Angle (θ₁)** slider in the Control Console (Panel 1).
2. Drag the slider or type a value in the number box (range: 0° to 180°).
3. Observe simultaneously:
   - The **angle badge** (blue) beside the label updates to the current degree value.
   - The **LIVE JOINT ANGLES** overlay in the viewport updates θ₁.
   - **Link 1** rotates in the SVG viewport around the base joint.
   - **Cartesian X** and **Cartesian Y** values in the Analytics panel (Panel 5) update.
   - The **θ₁ Kinematic Trace** (blue line) is plotted on the oscilloscope.
   - The **System Advisor** updates with relevant stability or target proximity messages.
4. Note that angles near 0° or 180° cause the badge to **pulse red**, indicating a near-singular configuration.

---

## Step 4 — Adjust Joint Angle θ₂ (Joint 2)

1. Locate the **Joint 2 Angle (θ₂)** slider in the Control Console.
2. Drag the slider or type a value (range: 0° to 180°).
3. Observe simultaneously:
   - The **angle badge** (green) beside the label updates.
   - **Link 2** re-positions in the viewport relative to Link 1.
   - The **LIVE JOINT ANGLES** overlay updates θ₂.
   - **Singularity Risk / Accuracy Score** changes — it is maximised at θ₂ = 90° and decreases as θ₂ deviates from 90°.
   - The **θ₂ Kinematic Trace** (green line) is recorded on the oscilloscope.

---

## Step 5 — Adjust Linkage Extension (L)

1. Move the **Linkage Extension (L)** slider (range: 0.5 m to 2.0 m).
2. Observe that both arm links visually **scale in length** in the viewport.
3. Observe the **dashed blue workspace boundary circle** resize — its radius equals 2L and the label updates (e.g. "Max Reach: 1.50 m").
4. Note how increasing L amplifies the end-effector reach (X, Y coordinates change proportionally).

---

## Step 6 — Adjust Payload

1. Move the **End-Effector Payload** slider (range: 0.1 kg to 10.0 kg).
2. Observe the **Base Torque (τ)** metric — it increases as payload increases, computed as:
   ```
   τ = m × 9.81 × |x|
   ```
3. Observe that increasing payload reduces **System Stability** (computed as `100 − τ × 1.5`).
4. If stability drops **below 50%**:
   - The **Stability metric turns red**.
   - The **robot assembly vibrates** in the viewport to visually indicate an unstable configuration.
   - The **System Advisor** displays a [WARN] or [CRIT] stability message.

---

## Step 7 — Attempt to Reach the Target Zone

The **Target Zone** (coloured rectangle in the SVG viewport) represents a pick-and-place destination.

1. Observe the initial **red Target Zone** with a cross (✕) mark.
2. Gradually adjust the sliders toward **θ₁ ≈ 20°, θ₂ ≈ 40°, L = 1.0 m**.
3. Watch the target colour change:
   - **Red** → arm is far from the target
   - **Orange** → arm is within 70 px of the target (System Advisor shows [NEAR])
   - **Green with checkmark (✓)** → arm has reached the target
4. When the target is reached, verify:
   - The gripper jaws **close** visually.
   - The **"TARGET REACHED!"** green badge appears in the viewport.
   - The **System Advisor** shows a [TARGET] success message.

---

## Step 8 — Execute Trajectory Animation

1. Set θ₁ and θ₂ to any starting values.
2. Click **EXECUTE TRAJECTORY**.
3. Observe that both joint angles automatically sweep to their alternate target positions (45° ↔ 135°) using a smooth **ease-in-out** animation.
4. During the animation, verify that:
   - Slider values update in sync.
   - Angle badges update every frame.
   - The SVG arm moves continuously.
   - The oscilloscope records both joint traces in real time.
   - The end-effector path is traced as a blue line in the viewport.

---

## Step 9 — Inject Disturbance Models

Navigate to Panel 2 — **Disturbance Models**. Each disturbance button **toggles** — click once to activate (button glows red), click again to deactivate. Test each disturbance individually and in combination:

| Disturbance Button | What to Observe |
|---|---|
| **[!] Inject Motor Overload** | Button glows red. Base Torque multiplied by 2.5×. Stability drops sharply. Vibration likely activates. |
| **[!] Induce Joint Friction** | Button glows red. Accuracy Score reduces by 25%. Accuracy metric turns red. |
| **[!] Shift Payload Center** | Button glows red. Stability reduces by an additional 30%. Robot may start vibrating. |

After testing each disturbance:
1. Click **Clear External Disturbances** to remove all active faults at once.
2. Confirm all buttons return to normal (no glow) and all metrics return to normal values.

---

## Step 10 — Record Observations

1. Set a specific joint configuration (θ₁, θ₂, L, Payload).
2. Click **RECORD DATA POINT** in the Lab Observation Log (Panel 6).
3. Verify that a new row is added to the bottom of the table recording:
   - Observation ID
   - θ₁ (degrees)
   - θ₂ (degrees)
   - End-effector X (metres)
   - End-effector Y (metres)
   - System Stability (%)
4. Repeat for at least **5 different configurations**, varying one parameter at a time.
5. When all observations are complete, click **EXPORT CSV** to download the data as a `.csv` file for use in lab reports.

---

## Step 11 — Systematic Observations to Record

Perform the following configurations and record each:

| # | θ₁ | θ₂ | L (m) | Payload (kg) | Expected Observation |
|---|---|---|---|---|---|
| 1 | 45° | 45° | 1.0 | 2.0 | Baseline configuration |
| 2 | 90° | 90° | 1.0 | 2.0 | Maximum Y extension |
| 3 | 45° | 0° | 1.0 | 2.0 | Near-singular — badge pulses red, [SING] advisor alert |
| 4 | 45° | 90° | 1.0 | 2.0 | Maximum accuracy score |
| 5 | 20° | 40° | 1.0 | 2.0 | Target zone reached — gripper closes |
| 6 | 45° | 45° | 1.0 | 9.0 | High torque — stability drops, vibration |
| 7 | 135° | 135° | 1.5 | 5.0 | Extended arm, high load |

---

## Step 12 — Analyse Telemetry Plotter

After several slider adjustments and trajectory runs:
1. Observe the **Real-Time Telemetry Plotter** (Panel 4).
2. Identify the **blue trace** (θ₁) and **green trace** (θ₂) traces.
3. Note how rapid slider changes produce steep gradients, while the Execute Trajectory animation produces smooth curves.

---

## Step 13 — Read the System Advisor

Review the **System Advisor** panel at the bottom of the left column:
1. Note how messages change as you adjust sliders, inject faults, or approach the target.
2. Identify any [WARN] or [CRIT] messages and take the recommended corrective action.
3. Aim to achieve an all-green ([OK]) advisor state simultaneously for all checks.

---

## Step 14 — Reset and Repeat

1. Click **RESET TO BASELINE** to restore all default values (θ₁=45°, θ₂=45°, L=1.0 m, Payload=2.0 kg) and clear traces. Active disturbance button states are also reset.
2. Repeat the experiment with a different set of initial parameters.
3. Use the **CLEAR NOTEBOOK** button to reset the observation log for a fresh session.

---

# Result

The two-link planar robotic arm simulation was successfully operated. Joint angles θ₁ and θ₂ were adjusted using the Control Console sliders, and the forward kinematics equations were verified in real time through the computed Cartesian X and Y coordinates displayed in the Advanced Analytics panel.

The effects of linkage extension, payload weight, disturbance injection, and joint configuration on system stability, base torque, and singularity risk were observed and recorded. The target zone was reached by setting θ₁ ≈ 20°, θ₂ ≈ 40°, L = 1.0 m, confirming the accuracy of the TCP position calculation. The simulation confirmed that:

- End-effector position follows the forward kinematics equations: **x = l₁cosθ₁ + l₂cos(θ₁+θ₂)** and **y = l₁sinθ₁ + l₂sin(θ₁+θ₂)**
- System stability decreases as payload and base torque increase
- Singularity risk is highest when θ₂ approaches 0° or 180°
- External disturbances compound to degrade both stability and accuracy; disturbance buttons toggle on/off individually
- The Execute Trajectory animation demonstrates smooth, physically realistic joint sweeps using ease-in-out interpolation
- The System Advisor provided real-time guidance throughout the experiment, flagging critical conditions and confirming nominal operation
- Observation data was recorded chronologically and exported as a CSV file for analysis