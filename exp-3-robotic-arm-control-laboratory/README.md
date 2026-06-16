# Robotic Arm Control Laboratory

## Introduction

| **Discipline** | Computer Science and Engineering                                  |
| :------------- | :---------------------------------------------------------------- |
| **Lab**        | SmartFactory 4.0 Virtual Lab                                      |
| **Experiment** | Robotic Arm Control Laboratory                                    |

### About the Experiment

The Robotic Arm Control Laboratory is a virtual laboratory experiment developed under the SmartFactory 4.0 Virtual Lab project. This experiment helps students understand the working principles of industrial robotic arms and the mathematical foundations of robotic motion in modern smart manufacturing environments.

The experiment provides an interactive simulation where users can control joint angles (θ₁ and θ₂), linkage extension, and end-effector payload to observe their impact on end-effector positioning, base torque, system stability, singularity risk, and real-time kinematic traces using a two-link planar robotic arm model.

| **Name of Developer** | Kripa Bansal                                             |
| :-------------------- | :------------------------------------------------------- |
| **Institute**         | Jaypee Institute of Information Technology (JIIT), Noida |
| **Email id**          | kripabansal.06@gmail.com                                 |
| **Department**        | Computer Science and Engineering                         |

### Contributors List

| Sr. No. | Name               | Faculty or Student | Department                       | Institute                                  | Email id                 |
| :------ | :----------------- | :----------------- | :------------------------------- | :----------------------------------------- | :----------------------- |
| 1       | Kripa Bansal       | Student            | Computer Science and Engineering | Jaypee Institute of Information Technology | kripabansal.06@gmail.com |

---

## Learning Outcomes

After completing this experiment, students will be able to:

- Understand the fundamentals of industrial robotic systems and 2-DOF planar arm mechanics.
- Apply forward kinematics equations to compute end-effector Cartesian coordinates.
- Analyze the effect of joint angle configuration on robotic arm positioning and reach.
- Evaluate the impact of payload weight on base torque and system stability.
- Identify singularity configurations and understand their effect on accuracy.
- Interpret real-time telemetry traces for joint angle trajectories.
- Simulate and analyze the effect of external disturbances (motor overload, joint friction, payload shift).
- Record and compare experimental observations across multiple arm configurations.

---

## Folder Structure

```
exp-3-robotic-arm-control-laboratory/
├── experiment-name.md
├── aim.md
├── theory.md
├── procedure.md
├── references.md
├── README.md
├── pretest.json
├── posttest.json
├── images/
└── simulation/
    ├── index.html
    ├── css/
    │   └── main.css
    └── js/
        └── main.js
```

---

## Simulation Features

- **Two-link planar arm** rendered in an SVG viewport with grid, axes, and end-effector trace
- **Independent joint control** — θ₁ and θ₂ sliders (0° to 180°) with live number inputs
- **Live angle badges** beside each slider showing real-time degree values, with red pulse warning near singularity limits
- **SVG viewport overlay** displaying current θ₁ and θ₂ values inside the simulation canvas
- **Linkage extension control** — scales both arm links from 0.5 m to 2.0 m
- **Payload configuration** — 0.1 kg to 10.0 kg with computed base torque
- **Execute Trajectory** — automated ease-in-out sweep animation between joint configurations
- **Advanced Analytics panel** — Cartesian X, Cartesian Y, System Stability, Base Torque (τ), Singularity Risk / Accuracy Score
- **Disturbance Models** — injectable faults: Motor Overload, Joint Friction, Payload Center Shift
- **Real-Time Telemetry Plotter** — oscilloscope-style canvas plotting θ₁ and θ₂ history
- **Lab Observation Log** — record, view, and clear discrete data points during experiments

---

## Industrial Applications

The concepts demonstrated in this experiment are widely used in:

- Automotive manufacturing (welding, painting, assembly)
- Electronics assembly (PCB handling, micro-component placement)
- Material handling and pick-and-place systems
- Packaging and palletizing industries
- Warehouse and logistics automation
- Quality inspection and precision measurement systems
- Smart manufacturing and Industry 4.0 facilities

---

## Developed Under

**SmartFactory 4.0 Virtual Lab**

An interactive virtual laboratory designed to provide practical exposure to industrial automation, robotics, Industrial IoT, predictive maintenance, digital twin systems, smart energy optimization, and Industry 4.0 manufacturing technologies.