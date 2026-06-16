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

```
x = l₁·cos(θ₁) + l₂·cos(θ₁ + θ₂)

y = l₁·sin(θ₁) + l₂·sin(θ₁ + θ₂)
```

Where:

| Symbol | Description |
|--------|-------------|
| x | End-effector X coordinate (metres) |
| y | End-effector Y coordinate (metres) |
| l₁ | Length of Link 1 (metres) — controlled by Linkage Extension slider |
| l₂ | Length of Link 2 (metres) — equal to l₁ in this simulation |
| θ₁ | Joint 1 angle (degrees), converted to radians for computation |
| θ₂ | Joint 2 angle (degrees), converted to radians for computation |

The simulation updates x and y in the **Advanced Analytics** panel in real-time as sliders are adjusted.

---

## Linkage Extension

The **Linkage Extension (L)** slider scales both arm segments simultaneously (l₁ = l₂ = L). Increasing L extends the arm's reach, expanding its reachable workspace. The SVG viewport scales the link bodies proportionally in pixels as:

```
pixel_length = L × 100  (pixels per metre)
```

---

## Base Torque

The **Base Torque (τ)** is the rotational force exerted at the robot's fixed base, caused by the weight of the payload acting at the end-effector's horizontal distance from the base:

```
τ = m × g × |x|
```

Where:
- m = Payload mass (kg)
- g = 9.81 m/s² (gravitational acceleration)
- |x| = Absolute horizontal distance of the end-effector from the base

When the **Motor Overload** disturbance is active, the computed torque is multiplied by 2.5 to simulate an overloaded motor condition.

---

## System Stability

**System Stability** is a derived metric (0–100%) representing the operational safety margin of the arm under its current configuration and load:

```
Stability (%) = 100 − (τ × 1.5)
```

Clamped between 0% and 100%. Additional deductions:
- **Payload Center Shift** disturbance: −30% (simulates unbalanced load)

When stability drops **below 50%**, the simulation:
- Highlights the stability metric in red
- Applies a physical **vibration animation** to the robot assembly in the viewport

---

## Singularity Risk and Accuracy Score

**Singularity** in robotics refers to arm configurations where the manipulator loses one or more degrees of freedom, causing unpredictable motion and control breakdown. For a two-link arm, singularity occurs when θ₂ ≈ 0° or θ₂ ≈ 180° (fully extended or fully folded).

The simulation computes an **Accuracy Score** (0–100%) based on singularity proximity:

```
angleDeviation = |θ₂ − 90°|
Accuracy (%) = 100 − (angleDeviation × 0.4)
```

A θ₂ value near 90° is optimal (maximum accuracy). Deductions:
- **Joint Friction** disturbance: −25%
- Stability < 40%: additional −15%

When accuracy falls **below 70%**, the metric is highlighted in red.

---

## Disturbance Models

The simulation includes three injectable disturbance conditions to study fault responses:

| Disturbance | Effect on System |
|---|---|
| **Motor Overload** | Multiplies base torque by 2.5× |
| **Joint Friction** | Reduces accuracy score by 25% |
| **Payload Center Shift** | Reduces stability by 30% |

Disturbances can be combined to simulate compound fault scenarios. All disturbances are cleared using the **Clear External Disturbances** button.

---

## Real-Time Telemetry Plotter

The **Oscilloscope / Telemetry Plotter** continuously records and plots the history of θ₁ and θ₂ angle values over the last 200 data points:

- **Blue trace** — θ₁ (Joint 1 Kinematic Trace)
- **Green trace** — θ₂ (Joint 2 Kinematic Trace)

The plotter updates on every slider interaction or animation frame, providing a live time-series record of joint angle trajectories.

---

## Execute Trajectory (Automated Sweep)

The **Execute Trajectory** button runs an automated easing animation that sweeps both joint angles between their current values and a target configuration (alternating between 45° and 135°). The animation uses an **ease-in-out quadratic** function for smooth, physically realistic motion:

```
ease = t < 0.5 ? 2t² : 1 − (−2t + 2)² / 2
```

During the sweep, the slider values, angle badges, SVG viewport, oscilloscope, and end-effector trace all update synchronously.

---

## Live Angle Display

The simulation provides two layers of real-time angle feedback:

1. **Angle Badges** — Displayed beside each joint slider in the Control Console. Update instantly on every slider change.
   - Blue badge for θ₁
   - Green badge for θ₂
   - Pulsing red if angle is near its limit (< 10° or > 170°), indicating singularity risk

2. **SVG Viewport Overlay** — A dark panel in the upper-left corner of the simulation viewport displaying live θ₁ and θ₂ values, updated on every frame.

---

## Observation Log

The **Lab Observation Log** allows students to capture discrete data points during an experiment session. Each recorded entry stores:

- Observation ID
- θ₁ angle (degrees)
- θ₂ angle (degrees)
- End-effector X position (metres)
- End-effector Y position (metres)
- System Stability (%)

Entries appear in reverse chronological order and persist until the notebook is cleared.

---

## Conclusion

The two-link planar robotic arm simulation demonstrates core principles of industrial robotics including forward kinematics, torque analysis, stability monitoring, singularity detection, and disturbance response. Understanding these principles provides the foundation for designing, programming, and maintaining robotic systems in Industry 4.0 smart manufacturing environments.