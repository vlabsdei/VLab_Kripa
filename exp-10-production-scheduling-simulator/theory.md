# Theory

## Introduction

Production Scheduling is one of the most important activities in modern manufacturing systems. It determines the order in which production jobs are assigned to available machines so that customer demands are fulfilled efficiently while minimizing production delays and maximizing resource utilization.

In Industry 4.0, production scheduling is no longer performed manually. Smart factories use intelligent scheduling systems that continuously analyze production requirements, machine availability, job priorities, and manufacturing resources to generate optimized production schedules.

An effective production schedule reduces manufacturing costs, minimizes machine idle time, improves throughput, and ensures timely product delivery. Poor scheduling, on the other hand, results in long waiting times, production bottlenecks, underutilized machines, and delayed customer orders.

This experiment simulates a smart manufacturing environment where students can configure production parameters, select different scheduling algorithms, and observe how scheduling decisions influence factory performance through real-time visualization and performance indicators.

---

# Smart Manufacturing

Smart Manufacturing is an advanced production approach that integrates automation, data analytics, artificial intelligence, robotics, Industrial Internet of Things (IIoT), and digital technologies to improve manufacturing efficiency and flexibility.

Unlike conventional factories, smart factories continuously monitor production resources and automatically optimize manufacturing operations based on real-time information.

Major objectives of Smart Manufacturing include:

- Higher production efficiency
- Better resource utilization
- Reduced production cost
- Improved product quality
- Faster order completion
- Reduced machine downtime
- Intelligent production planning

Production Scheduling is one of the core decision-making processes within a Smart Manufacturing system.

---

# Production Planning

Production Planning is the process of determining what products should be manufactured, how many products should be produced, and when production should take place.

Production planning focuses on long-term manufacturing decisions such as:

- Customer demand
- Raw material availability
- Production capacity
- Workforce planning
- Delivery schedules

The output of production planning is a list of manufacturing jobs that must be executed.

Production Scheduling begins after production planning has been completed.

---

# Production Scheduling

Production Scheduling is the process of assigning production jobs to available machines in an optimal sequence while satisfying manufacturing constraints.

The scheduling system decides:

- Which job should be processed first
- Which machine should process each job
- When each job should start
- When each job should finish

An effective production schedule improves machine utilization, reduces production delays, minimizes waiting time, and increases factory throughput.

Production Scheduling is one of the most widely used optimization problems in manufacturing engineering.

---

# Manufacturing Workflow

A typical smart manufacturing workflow is illustrated below.

```text
Customer Orders
        │
        ▼
Production Planning
        │
        ▼
Production Scheduling
        │
        ▼
Machine Allocation
        │
        ▼
Manufacturing Process
        │
        ▼
Quality Inspection
        │
        ▼
Packaging
        │
        ▼
Completed Orders
```

Each stage contributes to efficient manufacturing operations. The Production Scheduler acts as the decision-making engine that determines how manufacturing resources are utilized.

---

# Objectives of Production Scheduling

The primary objectives of production scheduling are:

- Minimize production completion time.
- Reduce machine idle time.
- Improve machine utilization.
- Reduce job waiting time.
- Increase production throughput.
- Balance workload among machines.
- Meet customer delivery deadlines.
- Reduce manufacturing cost.
- Improve overall factory efficiency.

A well-designed scheduling strategy enables manufacturers to produce more products using the same production resources.

---

# Production Jobs

A Production Job represents a manufacturing task that must be completed on a production machine.

Each production job generally contains the following information:

- Job ID
- Product Type
- Arrival Time
- Processing Time
- Priority Level
- Due Date

The scheduler uses these parameters to determine the execution order of jobs.

---

# Production Queue

When multiple jobs arrive simultaneously, they are placed in a Production Queue until a machine becomes available.

The scheduler continuously monitors the queue and assigns waiting jobs to available machines according to the selected scheduling algorithm.

The queue length changes dynamically as:

- New jobs arrive.
- Machines complete existing jobs.
- Waiting jobs are assigned to machines.

Efficient queue management reduces waiting time and improves production flow.

---

# Machine Allocation

Machine Allocation is the process of assigning production jobs to available manufacturing machines.

The scheduler considers several factors before assigning a job:

- Machine Availability
- Job Priority
- Processing Time
- Current Queue Length
- Scheduling Algorithm

Proper machine allocation balances workload across multiple machines and prevents excessive loading of a single resource.

---

# Scheduling Algorithms

A Scheduling Algorithm is a decision-making strategy used to determine the order in which production jobs are processed.

Different scheduling algorithms produce different production performance because each follows a different decision rule.

In this experiment, students will compare four commonly used scheduling algorithms:

- First Come First Served (FCFS)
- Shortest Job First (SJF)
- Priority Scheduling
- Round Robin

Each algorithm offers different advantages depending on production requirements.---

# First Come First Served (FCFS)

First Come First Served (FCFS) is the simplest production scheduling algorithm. In this method, production jobs are processed in the exact order in which they arrive in the production queue.

The first job entering the queue is assigned to the first available machine without considering its processing time or priority.

### Advantages

- Simple to implement
- Fair for all incoming jobs
- Minimal scheduling overhead

### Limitations

- Long production jobs delay shorter jobs.
- Average waiting time may become high.
- Machine utilization may decrease under certain production conditions.

FCFS is suitable for production systems where fairness is more important than optimization.

---

# Shortest Job First (SJF)

Shortest Job First (SJF) schedules the production job having the smallest processing time before all other waiting jobs.

By executing shorter jobs first, the scheduler reduces the average waiting time and increases production throughput.

### Advantages

- Lower average waiting time
- Higher production throughput
- Better machine utilization

### Limitations

- Long production jobs may wait for extended periods.
- Requires prior knowledge of processing time.

SJF is widely used when processing time of production jobs is known in advance.

---

# Priority Scheduling

In Priority Scheduling, every production job is assigned a priority level based on its importance.

The scheduler always selects the highest-priority job among all waiting jobs.

Examples of high-priority jobs include:

- Emergency customer orders
- Critical spare parts
- Medical equipment
- Defense manufacturing products

### Advantages

- Urgent jobs are completed quickly.
- Improves customer satisfaction.
- Supports critical manufacturing operations.

### Limitations

- Low-priority jobs may experience starvation.
- Requires proper priority assignment.

Priority Scheduling is commonly used in industrial manufacturing where certain products require immediate processing.

---

# Round Robin Scheduling

Round Robin Scheduling assigns each production job a fixed time interval known as a time quantum.

If a job is not completed within the allocated time, it is returned to the production queue, allowing other jobs to execute.

### Advantages

- Fair allocation of machine time
- Prevents starvation
- Suitable for continuous production systems

### Limitations

- Frequent switching between jobs increases scheduling overhead.
- Performance depends on the selected time quantum.

Round Robin Scheduling is commonly used in multitasking environments and flexible manufacturing systems.

---

# Machine Utilization

Machine Utilization represents the percentage of time during which a production machine remains actively processing manufacturing jobs.

<p align="center">
<i>Machine Utilization = (Machine Busy Time / Total Available Time) × 100</i>
</p>

Where:

- **Machine Busy Time** = Total duration for which the machine processes production jobs.
- **Total Available Time** = Total duration of the production schedule.

Higher machine utilization indicates better use of manufacturing resources. However, extremely high utilization may reduce scheduling flexibility and increase machine wear.

---

# Makespan

Makespan is one of the most important performance measures in production scheduling. It represents the total time required to complete all production jobs from the start of the first job until the completion of the last job.

<p align="center">
<i>Makespan = Completion Time of Last Job − Start Time of First Job</i>
</p>

Where:

- **Completion Time of Last Job** = Time when the final production job is completed.
- **Start Time of First Job** = Time when the first production job begins.

Lower makespan indicates a more efficient production schedule.

---

# Average Waiting Time

Average Waiting Time represents the average duration that production jobs remain in the queue before processing begins.

<p align="center">
<i>Average Waiting Time = Total Waiting Time of All Jobs / Total Number of Jobs</i>
</p>

Where:

- **Total Waiting Time of All Jobs** = Sum of waiting times for every production job.
- **Total Number of Jobs** = Number of production jobs processed.

Lower average waiting time improves customer satisfaction and production efficiency.

---

# Production Throughput

Production Throughput represents the number of production jobs completed within a specified production period.

<p align="center">
<i>Production Throughput = Completed Jobs / Total Production Time</i>
</p>

Where:

- **Completed Jobs** = Total number of successfully finished production jobs.
- **Total Production Time** = Total duration of the production schedule.

Higher throughput indicates greater manufacturing productivity.

---

# Production Efficiency

Production Efficiency measures how effectively the manufacturing system achieves its planned production target.

<p align="center">
<i>Production Efficiency = (Completed Jobs / Planned Jobs) × 100</i>
</p>

Where:

- **Completed Jobs** = Number of production jobs successfully completed.
- **Planned Jobs** = Total number of jobs scheduled for production.

Higher production efficiency indicates better scheduling performance and improved utilization of manufacturing resources.

------

# Bottleneck Analysis

A Bottleneck is a stage in the manufacturing process where the production capacity is lower than the demand, causing jobs to accumulate and reducing the overall production rate.

Bottlenecks increase production delays, machine waiting times, and customer delivery times.

Common causes of production bottlenecks include:

- Slow processing machines
- Machine failures
- Excessive production demand
- Poor scheduling strategy
- Limited manufacturing resources

Identifying and eliminating bottlenecks is essential for improving production efficiency and increasing factory throughput.

---

# Queue Management

Queue Management is the process of controlling the flow of production jobs waiting to be processed.

Whenever all production machines are busy, newly arriving jobs are placed in a waiting queue until a machine becomes available.

An efficient queue management system helps to:

- Reduce production delays
- Minimize waiting time
- Improve resource utilization
- Maintain smooth production flow
- Prevent congestion in manufacturing systems

The production scheduler continuously monitors the queue and assigns waiting jobs according to the selected scheduling algorithm.

---

# Effect of Scheduling Algorithms on Factory Performance

Different scheduling algorithms produce different manufacturing outcomes.

### First Come First Served (FCFS)

- Simple implementation
- Fair processing order
- Higher waiting time for short jobs

### Shortest Job First (SJF)

- Lower average waiting time
- Higher throughput
- Long jobs may wait longer

### Priority Scheduling

- Critical jobs completed earlier
- Supports urgent production orders
- Low-priority jobs may experience delays

### Round Robin

- Fair allocation of machine time
- Suitable for continuous production
- Increased scheduling overhead

Selecting an appropriate scheduling algorithm depends on production objectives, customer requirements, and manufacturing constraints.

---

# Production Performance Indicators

Production scheduling performance can be evaluated using several important indicators.

These include:

- Machine Utilization
- Makespan
- Average Waiting Time
- Queue Length
- Production Throughput
- Production Efficiency

These indicators help production managers evaluate scheduling effectiveness and identify opportunities for process improvement.

---

# Industrial Applications

Production Scheduling is widely used in modern manufacturing industries, including:

- Automotive Manufacturing
- Electronics Assembly
- Pharmaceutical Manufacturing
- Food and Beverage Processing
- Textile Manufacturing
- Aerospace Manufacturing
- Semiconductor Fabrication
- Steel and Metal Industries
- Consumer Goods Manufacturing
- Smart Factories

Efficient production scheduling enables industries to improve productivity while maintaining product quality and reducing manufacturing costs.

---

# Advantages of Production Scheduling

Production Scheduling offers several advantages in smart manufacturing environments.

These include:

- Improves production efficiency.
- Reduces machine idle time.
- Minimizes production delays.
- Increases manufacturing throughput.
- Improves machine utilization.
- Reduces average waiting time.
- Balances production workload.
- Enhances resource allocation.
- Supports timely customer delivery.
- Improves overall factory productivity.

---

# Role of Production Scheduling in Industry 4.0

Industry 4.0 integrates intelligent manufacturing technologies such as Industrial Internet of Things (IIoT), Artificial Intelligence (AI), Digital Twins, Robotics, and Data Analytics.

Production Scheduling acts as the decision-making engine that coordinates manufacturing resources using real-time production data.

Modern scheduling systems continuously monitor:

- Machine Availability
- Production Status
- Customer Orders
- Resource Utilization
- Production Capacity

Based on these inputs, intelligent scheduling systems dynamically assign production jobs to optimize manufacturing performance.

---

# Learning Outcome

After completing this experiment, students will be able to:

- Understand the concept of Production Scheduling in smart manufacturing systems.
- Explain the role of scheduling in improving manufacturing productivity.
- Compare different production scheduling algorithms including FCFS, SJF, Priority Scheduling, and Round Robin.
- Analyze production queues and machine allocation strategies.
- Evaluate machine utilization and identify production bottlenecks.
- Calculate makespan, average waiting time, production throughput, and production efficiency.
- Interpret production scheduling results using engineering performance indicators.
- Compare scheduling strategies based on manufacturing performance.
- Understand the role of intelligent scheduling in Industry 4.0 Smart Factories.
- Apply production scheduling concepts to improve manufacturing efficiency and optimize industrial operations.