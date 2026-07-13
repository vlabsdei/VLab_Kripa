# Procedure: Step-by-Step Laboratory Guide

## 1. Laboratory Objectives
By completing this virtual laboratory, students will:
1. Understand the parameters governing industrial machine vision cells.
2. Observe how lens focus, lighting exposure, and backlights mathematically scale AI confidence.
3. Learn to identify and eliminate **False Positives** and **False Negatives**.
4. Balance production throughput (Feed Rate) against classification accuracy.

---

## 2. Walkthrough of the User Interface Controls

Before running experiments, familiarize yourself with the three columns of the console:
* **Left Column (Product Configurator)**: Selects the manufacturing sector (Auto, Food, Silicon Lab), configures baseline product dimensions, stamps defects directly on the interactive template canvas, and injects individual test samples onto the conveyor.
* **Center Column (Live Cell & Analytics)**: Houses the live camera viewport, the 7-stage pipeline checkmarks, the real-time classification strip (ID, Type, Defect Size, AI Confidence Gauge, Decision Badge), the AI reasoning logs, and the analytical dashboards (defect distribution chart, confidence histogram, history log table).
* **Right Column (Diagnostics & Automation Control)**: Controls camera optics, sensor settings, quality tolerances, backlight, conveyor speed, and starts the automatic loop.

---

## 3. Step-by-Step Operating Instructions

### Part A: Performing a Manual Single-Product Inspection
1. **Choose a Sector**: Click on one of the sector tabs at the top-left (e.g., **Silicon Lab**).
2. **Select Product Geometry**: Choose a specific geometry from the dropdown list (e.g., **Microchip**).
3. **Set Dimensions**: Adjust the **Object Size** slider (e.g., to 15 cm) and set the **Surface Finish** to **Clean**.
4. **Stamp a Defect**: Tap/click on the schematic canvas template inside the creator panel. A defect indicator will appear where you tap.
5. **Configure Defect Parameters**:
   * Select a tool from the **Defect Stamp Tool** dropdown (e.g., **Crack**).
   * Adjust the **Defect Size** slider to **0.80 mm**.
6. **Adjust Camera Settings**: Go to the right column and set:
   * **Optics Focus**: 90%
   * **Sensor Exposure**: 50% (optimal)
   * **Digital Contrast Boost**: 65%
7. **Set Quality Tolerance**: Adjust the **Defect Rejection Threshold** to **0.50 mm**.
8. **Inject Object**: Click **INJECT INTO CONVEYOR**.
9. **Observe Pipeline**: Watch the object move along the belt under the scanner beam. The pipeline status checks will light up sequentially.
10. **Analyze Outcome**: Check the **Result Strip** and the **AI Reasoning Banner**:
    * *Did the AI detect the defect?* (Yes, because focus and exposure are high).
    * *What was the final decision?* (REJECT, because the defect size of 0.80 mm exceeds the 0.50 mm threshold).
    * *What was the AI Confidence score?* (Review the circular confidence gauge).

---

### Part B: Running the Automated Assembly Line
1. Click **START AUTO-SORT PIPELINE** in the right column.
2. The conveyor will start feeding products continuously. The system automatically alternates between perfect and defective configurations, applying your current diagnostics.
3. Monitor the **DIAGNOSTICS & SCOREBOARD** to view:
   * **Accuracy**: The percentage of correct classifications.
   * **AI Confidence**: Average confidence of active detections.
   * **Defect Rate**: Percentage of rejected parts.
   * **Passed / Rejected Counters**: Cumulative logs.
4. Review the **Defect Sector Distribution** (donut chart) and **Confidence Range** (histogram) to see statistical spreads in real-time.
5. Click **STOP AUTO-SORT PIPELINE** to pause the feed at any time.

---

## 4. Guided Laboratory Exercises

### Exercise 1: Achieving 100% Inspection Accuracy
* **Goal**: Optimize parameters to achieve a perfect 100.00% accuracy score.
* **Procedure**:
  1. Click **FACTORY RESET** to clear previous statistics.
  2. Set **Optics Focus** to **95%** or higher.
  3. Set **Sensor Exposure** to **50%**.
  4. Set **Digital Contrast Boost** to **70%**.
  5. Set **Base LED Backlight** to **85%**.
  6. Choose **Surface Finish: Clean**.
  7. Start the **Auto-Sort Pipeline**. Run it for 20 products.
  8. **Questions**: What is the final accuracy? Why do these settings prevent false readings?

### Exercise 2: Triggering and Analyzing False Positives
* **Goal**: Observe how sensor noise leads to rejecting good parts.
* **Procedure**:
  1. Click **FACTORY RESET**. Stop the pipeline if running.
  2. In the creator card, make sure **no defect** is stamped (click **RESET STAMP**).
  3. Set **Surface Finish** to **dirty** (Grease/Smudges).
  4. Degrade the camera settings: Set **Optics Focus** to **45%** (blurry) and **Sensor Exposure** to **85%** (over-exposed).
  5. Click **INJECT INTO CONVEYOR**.
  6. **Observe**: Read the **AI Reasoning Banner**. 
  7. **Questions**: What classification did the AI make? Why did a defect-free product get rejected? How does this increase production scrap costs?

### Exercise 3: Triggering and Analyzing False Negatives
* **Goal**: Observe how poor optics let defective products pass inspection.
* **Procedure**:
  1. Click **FACTORY RESET**.
  2. Stamp a large defect on the template: **Crack** at **1.50 mm**.
  3. Move the **Defect Rejection Threshold** to **0.40 mm** (a defect of 1.50 mm should easily trigger a rejection).
  4. Lower the **Optics Focus** to **25%** and set the **Base LED Backlight** to **50%**.
  5. Click **INJECT INTO CONVEYOR**.
  6. **Observe**: Read the final decision badge and reasoning.
  7. **Questions**: Did the AI reject the part? Why was a critical defect passed through to the downstream assembly line? What is the risk of false negatives in real factories?

### Exercise 4: Throughput vs. Quality Trade-off
* **Goal**: Analyze how mechanical conveyor speed limits computer vision processing.
* **Procedure**:
  1. Start the **Auto-Sort Pipeline** at **optimal settings** (Focus = 95%, Exposure = 50%, contrast = 60%, Backlight = 85%).
  2. Move the **Flow Feed Rate** slider to **120 products/min** (maximum throughput).
  3. Monitor the accuracy score on the scoreboard over 30 cycles.
  4. **Observe**: Watch the confidence histogram shift and check if accuracy drops below 100%.
  5. **Questions**: Why does high throughput degrade classification confidence even when focus settings are optimal? What is the speed limit of this inspection cell?