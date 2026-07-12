# Experiment Procedure: IIoT Network Security Simulation

This step-by-step procedure guide will walk you through setting up, analyzing, and securing an Industrial IoT (IIoT) factory network. By following these steps, you will understand how network variables interact, how cyber threats degrade operations, and how to apply defenses following the IEC 62443 standard.

---

## Part 1: Familiarize Yourself with the Dashboard Layout
Before starting the simulation, understand the roles of the six core dashboard sections:
1.  **Factory Network Controls (Left Panel)**: This is your operational command center. Here you can tweak system parameters (Device Count, Packet Rate), simulate threats (Attack Intensity), change communication protocols, toggle encryption layers, and control the simulation state (Run, Pause, Reset).
2.  **LIVE Industrial IoT Network Topology (Center Panel)**: A digital twin visualization representing the Purdue Model levels (Cloud, Firewall, Gateway, Switch, and industrial floor nodes like PLCs, Cameras, HMIs, and Sensors). Hovering or clicking on devices reveals detailed diagnostics.
3.  **Live Attack / Packet Flow Animation (Middle Strip)**: A high-fidelity timeline that animates individual packet transmissions in real-time. The packet colors convey their state:
    *   **Blue**: Unencrypted normal traffic.
    *   **Green**: Secure encrypted traffic.
    *   **Red**: Hostile attack traffic (packet flooding).
    *   **Yellow**: Malicious packets intercepted and blocked by the firewall.
4.  **Network Security Status (Right Panel)**: Displays real-time Key Performance Indicators (KPIs) such as Latency, Throughput, Packet Loss, Bandwidth, and the system's overall Security Score.
5.  **Analytics & logs (Bottom Panels)**:
    *   **Communication Logs**: A scrolling list of every packet captured on the wire.
    *   **AI Threat Intelligence**: Generates automated notifications and defensive recommendations based on traffic anomalies.
    *   **Selected Device Details**: Inspects the physical health (CPU load, memory allocation, and operating temperature) of the selected device node.
    *   **Analytics Charts**: Historical line charts tracking Throughput, Latency, and Packet Loss over time.

---

## Part 2: Step-by-Step Laboratory Exercises

### Exercise 1: Establishing a Baseline Security Audit (Normal Operations)
In this exercise, you will measure the network's performance under clean, default operating parameters.

1.  **Configure Parameters**:
    *   **Device Count**: `20`
    *   **Packet Rate**: `250 pkt/s`
    *   **Firewall Strength**: `5`
    *   **Attack Intensity**: `0%`
    *   **Protocol**: `MQTT`
    *   **Encryption Level**: `None`
2.  **Start the Network**: Click the blue **Run** button.
3.  **Observe Packet Flow**: Look at the horizontal packet flow strip. Observe the blue dots shifting from left to right. This indicates normal, plain-text industrial transmission.
4.  **Document baseline Metrics**: Let the simulation run for 20 seconds. Under the **Network Security Status** panel, write down the values for:
    *   **Security Score**: ____________ % (Baseline should be around 75-80%)
    *   **Latency**: ____________ ms
    *   **Throughput**: ____________ pkt/s
    *   **Packet Loss**: ____________ %
5.  **Examine Device Diagnostics**: Select **PLC Controller** in the *Selected Device Details* dropdown. Note its CPU Usage and Operating Temperature under normal load.

---

### Exercise 2: Simulating a Cyber Attack (Denial-of-Service Flood)
Here, you will observe the direct physical and operational consequences of an unmitigated network security breach.

1.  **Simulate Attack**: While the simulation is running, drag the **Attack Intensity** slider to `70%`. Leave all other parameters unchanged.
2.  **Observe the Visual Shifts**:
    *   Watch the topology and timeline strip: Red packet dots will flood the lines.
    *   Notice the **AI Threat Intelligence** box. It will flash red with alerts indicating a high-volume packet injection attack.
3.  **Analyze Performance Degradation**: Wait for the metrics to stabilize, then document the impact:
    *   **New Security Score**: ____________ % (Expect a drop below 50%)
    *   **New Latency**: ____________ ms (Notice how latency spikes as buffers saturate)
    *   **New Throughput**: ____________ pkt/s (Throughput drops because valid packets are drowned out)
    *   **New Packet Loss**: ____________ % (Observe high packet loss)
4.  **Verify Device Stress**: Check the **PLC Controller** details. Notice the rise in CPU load and temperature caused by processing the overhead of flood packets.

---

### Exercise 3: Deploying Firewall Protection (Packet Filtering)
You will now activate boundary defenses to block malicious traffic at the network edge.

1.  **Adjust Firewall Controls**: While the attack is still active at `70%`, drag the **Firewall Strength** slider up to `9`.
2.  **Observe Filtering**: Look at the packet flow strip. Yellow packet dots will appear, showing that the firewall is actively intercepting and dropping attack packets before they reach the switch.
3.  **Document Metrics After Mitigation**:
    *   **Mitigated Security Score**: ____________ %
    *   **Mitigated Packet Loss**: ____________ %
    *   **Mitigated Throughput**: ____________ pkt/s
4.  Notice how the Security Score and Network Health recover because the firewall is successfully isolating the internal OT subnet from external malicious flood sources.

---

### Exercise 4: Enforcing Cryptographic Confidentiality (IEC 62443 Compliance)
To prevent network eavesdropping (Man-in-the-Middle attacks), you must secure the payload data using encryption.

1.  **Enable Encryption**: Change the **Encryption Level** dropdown to `AES-256`.
2.  **Observe Visual Changes**:
    *   The packet dots in the animation will turn **Green**, indicating secure, encrypted payloads.
    *   The encryption LED in the KPI panel will turn green.
3.  **Analyze the Latency vs. Security Trade-off**:
    *   Note the **Latency** value: ____________ ms. You will observe that latency has increased slightly (by approximately 18ms). This is a realistic representation of the mathematical processing time required for microcontrollers to compute AES cryptographic algorithms.
    *   Note the **Security Score**: ____________ %. Despite the slight latency penalty, the Security Score rises to its highest point (above 90%), signifying complete defense-in-depth compliance.

---

### Exercise 5: Exporting Experimental Data
1.  Click the red **Pause** button to freeze the dashboard.
2.  Go to the **Communication Logs** header and click **Export CSV**.
3.  Save the file to your computer. Open it in a spreadsheet application (like Microsoft Excel or Google Sheets) to inspect the tabular logs of packet states, protocols, and transaction times for your lab report.
4.  Click **Reset** to return the simulator to its default state for the next session.