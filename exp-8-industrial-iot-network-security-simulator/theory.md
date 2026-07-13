# Theory

## 1. Introduction: OT vs. IT Security in Smart Factories
In the modern landscape of Industry 4.0, the **Industrial Internet of Things (IIoT)** acts as the digital nervous system of the smart factory. Sensors, actuators, Programmable Logic Controllers (PLCs), Human-Machine Interfaces (HMIs), and edge gateways continuously exchange critical data streams to coordinate production lines, drive robotic assembly cells, and stream telemetry to cloud databases (like AWS IoT Core or Microsoft Azure IoT Hub).

While standard Information Technology (IT) networks prioritize the **Confidentiality** of data (protecting corporate records and intellectual property), Operational Technology (OT) networks in physical manufacturing prioritize **Availability** and **Safety**. If an IT system lags or crashes, email is delayed; if an OT system lags or crashes, physical machinery can malfunction, resulting in damaged equipment, lost batches, or serious injury to operators on the factory floor. Thus, IIoT security models must protect communication integrity without degrading real-time performance.

---

## 2. Real-World Backstory: Why Legacy OT is Vulnerable
Historically, industrial control networks operated under the principle of **"Security through Obscurity"** and physical air-gapping (keeping the factory completely isolated from the internet). Legacy OT protocols developed in the 1970s and 1980s were designed solely for speed and reliability, completely omitting cybersecurity safeguards:
*   **Modbus TCP / PROFINET**: Send data in plain text without encryption. Anyone on the network can read telemetry values or inject fake commands.
*   **No Authentication**: Legacy PLCs execute any commands (like "STOP motor") without checking if the sender is authorized.

As smart factories connect these legacy devices to IT environments and cloud servers to build Digital Twins, they expose these vulnerabilities to cyber-attackers.

### Historical Cyber Incidents in OT:
*   **Stuxnet (2010)**: The first known cyber-weapon targeting physical industrial controllers. It infected Siemens PLCs controlling centrifuges, modifying their rotor speeds to destroy themselves while sending false "normal" telemetry to the HMI monitoring systems.
*   **Triton / Trisis (2017)**: Malware that targeted Triconex Safety Instrumented Systems (SIS). Attackers gained remote control to disable safety shutdown triggers, creating a risk of physical explosions or chemical leaks.
*   **Colonial Pipeline (2021)**: A ransomware attack on an IT administrative network that forced the shutdown of operational control systems out of caution, illustrating the tight coupling between modern IT and OT architectures.

---

## 3. Defense-in-Depth & The Purdue Model
To protect connected IIoT devices, modern smart factories implement a **Defense-in-Depth** model based on the **Purdue Reference Model** (ISA-95/IEC 62443 standard):

<table>
<tr><th>Purdue Level</th><th>Components</th><th>Security Boundary</th></tr>
<tr><td>Level 4</td><td>Enterprise / Cloud (AWS / Azure Cloud Services)</td><td>Firewall Border</td></tr>
<tr><td>Level 3</td><td>SCADA Servers, Historians</td><td>Firewall Border</td></tr>
<tr><td>Level 2</td><td>HMIs, Engineering Workstations</td><td>Switch Routing</td></tr>
<tr><td>Level 1</td><td>PLCs, Edge Gateways</td><td>I/O Bus</td></tr>
<tr><td>Level 0</td><td>Sensors, Motors, Cameras, Actuators</td><td>Physical Process</td></tr>
</table>

1.  **Industrial Firewalls**: Placed at network boundaries (e.g., Level 3 to Level 4) to perform **Deep Packet Inspection (DPI)**. Unlike standard firewalls, industrial firewalls inspect industrial protocol payloads to verify that command arguments match safe operational profiles.
2.  **Network Segmentation**: Segmenting the factory floor into distinct physical or virtual zones (e.g., separating the assembly line from warehouse operations) so that a breach in one zone does not compromise the entire factory.

---

## 4. IIoT Security Standard: IEC 62443
The international standard **IEC 62443** governs cybersecurity for Industrial Automation and Control Systems (IACS). It defines four Security Levels (SL) depending on the threat agent:
*   **Security Level 1 (SL 1)**: Protection against casual or coincidental violation.
*   **Security Level 2 (SL 2)**: Protection against intentional violation using simple means with low resources.
*   **Security Level 3 (SL 3)**: Protection against intentional violation using sophisticated means with moderate resources.
*   **Security Level 4 (SL 4)**: Protection against intentional violation using sophisticated means with extended resources (e.g., state-sponsored attacks).

---

## 5. Mathematical Models and Formulas in IIoT Networking

The simulator calculates network health, performance, and threat dynamics based on the following engineering equations:

### A. Network Congestion (%)

Congestion occurs when the packet load exceeds the physical data processing capability of the core switch.

<p align="center">
<i>Congestion (%) = min(((Packet Rate (R<sub>p</sub>) × Device Count (N<sub>d</sub>) × 0.1) / Network Capacity (C<sub>net</sub>)) × 100, 100)</i>
</p>

- **Physical Meaning:** Shows how traffic volume scales with both device density and transmission frequency relative to the switch bandwidth limits.

### B. Packet Loss (%)

Packet loss occurs due to network congestion or malicious packet injection (Denial-of-Service floods).

<p align="center">
<i>Packet Loss (%) = Clamp(Attack Intensity (I<sub>atk</sub>) × f<sub>fw</sub> × 0.5 + Congestion × 0.18, 0, 100)</i>
</p>

where the firewall attenuation factor is defined as:

<p align="center">
<i>f<sub>fw</sub> = (11 − Firewall Strength (S<sub>fw</sub>)) / 10</i>
</p>

- **Physical Meaning:** A higher firewall strength reduces the impact of malicious traffic by filtering harmful packets before they reach the network. However, excessive network congestion or high attack intensity can still lead to packet loss due to switch buffer overflow and limited network processing capacity.

### C. Network Latency (ms)

The time delay for a packet to travel from sensor to controller/cloud:

<p align="center">
<i>Latency (ms) = Baseline (5 ms) + (R<sub>p</sub> / 80) × (1 + N<sub>d</sub> × 0.03) × (1 + I<sub>atk</sub> × 0.015) + Delay<sub>enc</sub></i>
</p>

- **Delay<sub>enc</sub>** = **18 ms** for AES-256, **8 ms** for AES-128, and **0 ms** for None.

- **Physical Meaning:** Enforcing high-grade encryption (such as AES-256) increases the cryptographic processing overhead on resource-constrained microcontrollers, adding latency to the transmission cycle.

### D. Throughput (pkt/s)
The quantity of clean, useful packets arriving successfully per second:
<p align="center"><i>Throughput (pkt/s) = R<sub>p</sub> × (1 − Packet Loss / 100)</i></p>

### E. Network Availability (%)
The fraction of the network that remains online and serving communication requests:
<p align="center"><i>Availability (%) = 100 − Packet Loss</i></p>

### F. Security Score

A composite index representing the overall security posture and cyber-resilience of the operational network:

<p align="center">
<i>Security Score = Availability − (Attack Intensity × 0.4) + (Firewall Strength × 5) + Bonus<sub>enc</sub></i>
</p>

- **Bonus<sub>enc</sub>** = **15** for AES-256, **8** for AES-128, and **0** for None.

- The final score is bounded to a maximum of **100%** and a minimum of **0%**.

---

## 6. Security Controls and Their Trade-Offs
Security implementation involves balancing security strength against processing overhead and communication delay:

| Control Option | Security Level (IEC 62443) | Latency Penalty | Network Throughput Impact | Vulnerability Addressed |
| :--- | :--- | :--- | :--- | :--- |
| **No Encryption** | Low (None) | 0 ms | High (No encryption overhead) | Man-in-the-Middle (Eavesdropping / Packet tampering) |
| **AES-128** | Medium (SL 2) | +8 ms | Minor | Basic packet payload decryption |
| **AES-256** | High (SL 3 - 4) | +18 ms | Moderate | Cryptographic interception and brute-force attacks |
| **Strong Firewall** | High (DPI Enabled) | Minimal | Filters out bad traffic, recovering throughput | Packet Injection, Flooding, Rogue commands |
