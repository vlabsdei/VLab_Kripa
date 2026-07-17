/* =============================================================
   SmartFactory 4.0 — Production Scheduling Simulator
   Main JavaScript Engine  |  Exp-10
   Scientifically Accurate Scheduling Algorithms
   ─────────────────────────────────────────────────────────────
   ALGORITHMS IMPLEMENTED (non-preemptive parallel-machine):
   1. FCFS  — First Come First Served
   2. SJF   — Shortest Job First (non-preemptive)
   3. Priority Scheduling (non-preemptive, Higher-number = higher priority)
   4. Round Robin (preemptive time-quantum, single quantum per machine slot)

   METRICS (scientifically standard OS/scheduling definitions):
   • Arrival Time   (AT) : tick when job entered the system
   • Start Time     (ST) : tick when job first got a machine
   • Finish Time    (FT) : tick when job fully completed
   • Burst Time     (BT) : total processing time needed (unchanging)
   • Remaining Time (RT) : BT minus time already executed
   • Waiting Time   (WT) : total time spent waiting in queue
       Non-RR  → WT = ST − AT  (single wait period)
       RR      → WT = (FT − AT) − BT  (turnaround − burst)
   • Turnaround Time (TAT) = FT − AT
   • Response Time  (ResT) = ST − AT  (first response)
   • Makespan       = max(FT) − min(AT) across all completed jobs
   • Machine Utilization = Σ(busy ticks per machine) / (N × elapsed ticks) × 100
   • Throughput     = completed jobs / elapsed sim-seconds
   • Production Efficiency = [Σ BT across all machines] / [N × makespan] × 100
============================================================= */

'use strict';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const PRODUCTS = [
  'Gear Assembly', 'Motor Unit',     'Sensor Module',  'Clamp Unit',
  'Drive Belt',    'Circuit Board',  'Valve Block',    'Pump Housing',
  'Bearing Set',   'Coupling Unit',  'Control Panel',  'Filter Cartridge'
];

/* Algorithm metadata — for display and AI explanations only */
const ALGO_META = {
  FCFS: {
    name:  'FCFS — First Come First Served',
    short: 'FCFS',
    desc:  'Jobs are dispatched to idle machines strictly in arrival order. Simple and starvation-free, but susceptible to the convoy effect where a large job blocks shorter ones behind it.',
    pros:  '✓ No starvation  ✓ Simple, predictable  ✓ Fair in arrival order',
    cons:  '✗ Convoy effect  ✗ High average waiting time with mixed burst lengths',
    color: 'var(--primary)',
    decisionFn: (job, queue) => {
      const pos = queue.indexOf(job) + 1; // before removal
      return `FCFS dispatched JOB-${job.id} because it was the earliest arrival in the queue (arrival=${job.arrival}s). Jobs are served strictly in the order they enter the system.`;
    }
  },
  SJF: {
    name:  'SJF — Shortest Job First',
    short: 'SJF',
    desc:  'At each dispatch point, the job with the smallest burst time is selected from the ready queue. This is proven to minimise average waiting time for a given job set (non-preemptive variant).',
    pros:  '✓ Optimal average waiting time  ✓ Maximises throughput for short jobs',
    cons:  '✗ Starvation of long jobs  ✗ Requires knowledge of burst time in advance',
    color: 'var(--success)',
    decisionFn: (job, queue) => {
      const sorted = [...queue].sort((a,b)=>a.burst-b.burst);
      return `SJF dispatched JOB-${job.id} (burst=${job.burst}s) — the shortest burst time in the ready queue. This minimises average waiting time by processing fast jobs first.`;
    }
  },
  Priority: {
    name:  'Priority Scheduling',
    short: 'Priority',
    desc:  'Each job is assigned a priority level (High=3, Medium=2, Low=1). The scheduler always dispatches the highest-priority job. Ties are broken by arrival order (FCFS fallback).',
    pros:  '✓ Critical/urgent jobs processed first  ✓ Reflects real manufacturing urgency',
    cons:  '✗ Low-priority job starvation  ✗ Priority inversion possible without aging',
    color: 'var(--danger)',
    decisionFn: (job, queue) => {
      const pMap = { high:3, medium:2, low:1 };
      return `Priority Scheduling dispatched JOB-${job.id} (priority=${job.priority}, level=${pMap[job.priority]}) — the highest priority job in the ready queue. Ties are resolved by arrival order.`;
    }
  },
  RR: {
    name:  'Round Robin (Preemptive)',
    short: 'RR',
    desc:  `Each job executes on a machine for at most one time quantum (Q seconds). If unfinished, it is preempted and placed at the back of the ready queue, giving every job fair CPU time. Waiting time = (Finish − Arrival) − Burst.`,
    pros:  '✓ Fair time distribution  ✓ Good response time  ✓ No starvation',
    cons:  '✗ Higher turnaround for short jobs  ✗ Context-switch overhead',
    color: 'var(--purple)',
    decisionFn: (job, queue) => {
      return `Round Robin dispatched JOB-${job.id} (remaining=${job.remaining}s) from front of circular queue. It will run for up to ${STATE.quantum}s then be preempted if incomplete.`;
    }
  }
};

/* Scenario presets */
const SCENARIOS = {
  normal:   { arrivalMin:5,  arrivalMax:10, burstMin:5,  burstMax:20, priorityWeights:[1,2,1], label:'Normal Production'  },
  priority: { arrivalMin:3,  arrivalMax:7,  burstMin:8,  burstMax:25, priorityWeights:[4,2,1], label:'Priority Orders'     },
  heavy:    { arrivalMin:2,  arrivalMax:5,  burstMin:10, burstMax:35, priorityWeights:[1,2,1], label:'Heavy Workload'      },
  mixed:    { arrivalMin:3,  arrivalMax:8,  burstMin:3,  burstMax:30, priorityWeights:[1,1,1], label:'Mixed Production'    }
};

/* Gantt block CSS colour classes */
const GANTT_COLORS = [
  'gb-blue','gb-green','gb-orange','gb-purple',
  'gb-cyan','gb-pink','gb-teal','gb-red'
];

/* ─────────────────────────────────────────────────────────────
   GLOBAL STATE
───────────────────────────────────────────────────────────── */
let STATE = {
  running:     false,
  paused:      false,
  compareMode: false,

  tick:         0,       // simulation time (integer seconds)
  speed:        1,       // 1x / 2x / 5x
  machineCount: 2,
  algorithm:    'FCFS',
  algorithmB:   'SJF',
  scenario:     'mixed',
  quantum:      4,       // Round Robin quantum (seconds)

  /* Single-mode data */
  jobs:      [],         // all jobs ever created
  queue:     [],         // ready queue (waiting for machine)
  machines:  [],         // machine objects
  completed: [],         // fully finished jobs
  ganttData: [],         // completed gantt blocks

  nextJobId:   200,
  nextArrival: 0,

  /* Compare-mode lane data */
  cmpA: null,
  cmpB: null,

  /* Chart series */
  chartLabels:   [],
  chartQueue:    [],
  chartUtil:     [],
  chartCompleted:[],

  cmpChartLabels:     [],
  cmpChartQueueA:     [], cmpChartQueueB:     [],
  cmpChartUtilA:      [], cmpChartUtilB:      [],
  cmpChartCompletedA: [], cmpChartCompletedB: [],

  /* Misc */
  jobColorMap: {},
  colorIndex:  0,
  _timer:      null,
};

/* ─────────────────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────────────────── */
const rand    = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const el      = id => document.getElementById(id);
const setText = (id, v) => { const e = el(id); if (e) e.textContent = v; };
const pNum    = p => (p === 'high' ? 3 : p === 'medium' ? 2 : 1);

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function pickPriority(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand(1, total);
  if (r <= weights[0]) return 'high';
  if (r <= weights[0] + weights[1]) return 'medium';
  return 'low';
}

function jobColor(id) {
  if (!STATE.jobColorMap[id]) {
    STATE.jobColorMap[id] = GANTT_COLORS[STATE.colorIndex % GANTT_COLORS.length];
    STATE.colorIndex++;
  }
  return STATE.jobColorMap[id];
}

/* ─────────────────────────────────────────────────────────────
   JOB FACTORY
───────────────────────────────────────────────────────────── */
function createJob(arrivalTick) {
  const sc  = SCENARIOS[STATE.scenario];
  const prio = pickPriority(sc.priorityWeights);
  const bt   = rand(sc.burstMin, sc.burstMax);
  const id   = STATE.nextJobId++;
  return {
    id,
    product:    PRODUCTS[rand(0, PRODUCTS.length - 1)],
    priority:   prio,
    burst:      bt,          // original burst time — NEVER changes
    remaining:  bt,          // decremented each tick while running
    arrival:    arrivalTick,
    firstStart: null,        // tick when job first received a machine (response time base)
    startTime:  null,        // last start (for RR re-dispatch tracking)
    endTime:    null,        // tick when job fully completed
    machine:    null,        // machine name where it last ran
    status:     'incoming',  // incoming | queued | running | done
    totalWaited:0,           // accumulated ticks spent in queue (for RR)
    rrSliceUsed:0,           // ticks used in current quantum
    executedSegments: [],    // [{start,end,machineId}] — for multi-segment Gantt (RR)
  };
}

function cloneJob(src) {
  return {
    id:        src.id,
    product:   src.product,
    priority:  src.priority,
    burst:     src.burst,
    remaining: src.burst,
    arrival:   src.arrival,
    firstStart:null,
    startTime: null,
    endTime:   null,
    machine:   null,
    status:    'incoming',
    totalWaited:0,
    rrSliceUsed:0,
    executedSegments:[],
  };
}

function scheduleNextArrival() {
  const sc = SCENARIOS[STATE.scenario];
  STATE.nextArrival = STATE.tick + rand(sc.arrivalMin, sc.arrivalMax);
}

/* ─────────────────────────────────────────────────────────────
   MACHINE FACTORY
───────────────────────────────────────────────────────────── */
function createMachines(count) {
  const NAMES = ['Machine A', 'Machine B', 'Machine C'];
  return Array.from({ length: count }, (_, i) => ({
    id:       i,
    name:     NAMES[i] || `Machine ${i + 1}`,
    job:      null,     // currently running job
    busyTime: 0,        // accumulated ticks while running a job
  }));
}

/* ─────────────────────────────────────────────────────────────
   SCHEDULING ALGORITHMS
   ─────────────────────────────────────────────────────────
   All algorithms operate on the *ready queue* (jobs that have
   arrived and are waiting for a machine).

   FCFS  : Select job with minimum arrival time.
            Tie-break: lower job ID (earlier generated = earlier arrived).

   SJF   : Select job with minimum burst time (non-preemptive).
            Tie-break: arrival time (FCFS fallback), then job ID.
            Uses `burst` (original), NOT `remaining`, because
            non-preemptive SJF decides at dispatch time using
            the full burst time of each waiting job.

   Priority : Select job with maximum priority number (3=high,2=med,1=low).
              Tie-break: arrival time (FCFS fallback), then job ID.

   Round Robin : Select from front of queue (FIFO circular order).
                 Preempts after `quantum` ticks — job returns to
                 back of queue if still unfinished.
                 Uses `remaining` for progress tracking.
───────────────────────────────────────────────────────────── */
function pickNextJob(queue, algo) {
  if (!queue.length) return null;

  switch (algo) {

    case 'FCFS':
      // Sort by arrival time, break ties by job ID (lower = earlier)
      return queue.reduce((best, j) => {
        if (j.arrival < best.arrival) return j;
        if (j.arrival === best.arrival && j.id < best.id) return j;
        return best;
      });

    case 'SJF':
      // Non-preemptive SJF: compare ORIGINAL burst times.
      // Tie-break: earliest arrival, then job ID.
      return queue.reduce((best, j) => {
        if (j.burst < best.burst) return j;
        if (j.burst === best.burst) {
          if (j.arrival < best.arrival) return j;
          if (j.arrival === best.arrival && j.id < best.id) return j;
        }
        return best;
      });

    case 'Priority':
      // Higher priority number = served first.
      // Tie-break: earliest arrival (FCFS), then job ID.
      return queue.reduce((best, j) => {
        const jp = pNum(j.priority), bp = pNum(best.priority);
        if (jp > bp) return j;
        if (jp === bp) {
          if (j.arrival < best.arrival) return j;
          if (j.arrival === best.arrival && j.id < best.id) return j;
        }
        return best;
      });

    case 'RR':
      // Round Robin: FIFO circular — always take the front of queue.
      // Queue is maintained in circular order (preempted jobs go to back).
      return queue[0];

    default:
      return queue[0];
  }
}

/* ─────────────────────────────────────────────────────────────
   SINGLE-MODE TICK  (1 tick = 1 simulation second)

   Tick order (critical — must be exactly this sequence):
   1. Increment tick.
   2. Job arrival check → push to ready queue.
   3. For each machine running a job:
      a. Decrement remaining time (1 unit of work done).
      b. Increment machine busy counter.
      c. For RR: increment rrSliceUsed; if quantum exhausted and
         job not done → preempt (push to back of queue).
      d. If remaining == 0 → job done; record metrics.
   4. For each idle machine: assign next job from ready queue
      using the selected algorithm.
   5. Track waiting time for queued jobs.
   6. Update KPIs and render.
───────────────────────────────────────────────────────────── */
function tick() {
  if (!STATE.running || STATE.paused) return;
  STATE.tick++;

  /* ── Step 1: Job arrival ─────────────────────────────── */
  if (STATE.tick >= STATE.nextArrival) {
    const job = createJob(STATE.tick);
    STATE.jobs.push(job);
    job.status = 'queued';
    STATE.queue.push(job);
    scheduleNextArrival();
    showToast(`New order arrived: JOB-${job.id} (${job.product}) — ${job.priority} priority, burst=${job.burst}s`);
  }

  /* ── Step 2: Accumulate waiting time for queued jobs ─── */
  // Every tick a job spends in the queue adds 1 to its totalWaited.
  STATE.queue.forEach(j => { j.totalWaited++; });

  /* ── Step 3: Process each running machine ────────────── */
  STATE.machines.forEach(m => {
    if (!m.job) return;

    const job = m.job;
    m.busyTime++;
    job.remaining--;

    if (STATE.algorithm === 'RR') {
      job.rrSliceUsed++;
      /* Quantum exhausted but job not finished → preempt */
      if (job.rrSliceUsed >= STATE.quantum && job.remaining > 0) {
        // Close the current Gantt segment
        job.executedSegments.push({ start: job.startTime, end: STATE.tick, machineId: m.id });
        // Push to back of queue
        job.status = 'queued';
        job.rrSliceUsed = 0;
        STATE.queue.push(job);
        m.job = null;
        return; // machine is now free
      }
    }

    /* Job fully completed */
    if (job.remaining <= 0) {
      job.endTime = STATE.tick;
      job.status  = 'done';

      // For RR: close the final segment
      if (STATE.algorithm === 'RR') {
        job.executedSegments.push({ start: job.startTime, end: STATE.tick, machineId: m.id });
      }

      // Gantt block (for non-RR the whole job is one block)
      if (STATE.algorithm !== 'RR') {
        STATE.ganttData.push({
          machineId: m.id,
          jobId:     job.id,
          start:     job.firstStart,
          end:       job.endTime,
          color:     jobColor(job.id)
        });
      } else {
        // Add all RR segments to gantt
        job.executedSegments.forEach(seg => {
          STATE.ganttData.push({
            machineId: seg.machineId,
            jobId:     job.id,
            start:     seg.start,
            end:       seg.end,
            color:     jobColor(job.id)
          });
        });
      }

      STATE.completed.push(job);
      addHistoryRow(job, m.name, STATE.algorithm);
      m.job = null;
    }
  });

  /* ── Step 4: Assign jobs to idle machines ────────────── */
  STATE.machines.forEach(m => {
    if (m.job || !STATE.queue.length) return;

    const job = pickNextJob(STATE.queue, STATE.algorithm);
    if (!job) return;

    STATE.queue.splice(STATE.queue.indexOf(job), 1);
    job.status = 'running';
    job.machine = m.name;
    job.startTime = STATE.tick;        // start of this execution segment
    if (job.firstStart === null) job.firstStart = STATE.tick; // first ever start
    job.rrSliceUsed = 0;
    m.job = job;

    showDecision(job, STATE.algorithm);
  });

  /* ── Step 5: Chart data sampling ────────────────────── */
  if (STATE.tick % 2 === 0) {
    STATE.chartLabels.push(fmtTime(STATE.tick));
    STATE.chartQueue.push(STATE.queue.length);
    STATE.chartUtil.push(calcUtilization(STATE.machines, STATE.tick));
    STATE.chartCompleted.push(STATE.completed.length);
    if (STATE.chartLabels.length > 50) {
      STATE.chartLabels.shift();
      STATE.chartQueue.shift();
      STATE.chartUtil.shift();
      STATE.chartCompleted.shift();
    }
    updateSingleCharts();
  }

  /* ── Step 6: Render ─────────────────────────────────── */
  renderSingleUI();
}

/* ─────────────────────────────────────────────────────────────
   COMPARE-MODE TICK
───────────────────────────────────────────────────────────── */
function tickCompare() {
  if (!STATE.running || STATE.paused) return;
  STATE.tick++;

  /* Shared job arrival — identical job goes to both lanes */
  if (STATE.tick >= STATE.nextArrival) {
    const srcJob = createJob(STATE.tick);
    const jobA = srcJob;
    const jobB = cloneJob(srcJob);

    jobA.status = 'queued';
    jobB.status = 'queued';

    STATE.cmpA.queue.push(jobA);
    STATE.cmpB.queue.push(jobB);
    scheduleNextArrival();
    showToast(`JOB-${srcJob.id} (${srcJob.product}, burst=${srcJob.burst}s) sent to both lanes`);
  }

  processLane(STATE.cmpA, STATE.algorithm);
  processLane(STATE.cmpB, STATE.algorithmB);

  /* Chart sampling */
  if (STATE.tick % 2 === 0) {
    STATE.cmpChartLabels.push(fmtTime(STATE.tick));
    STATE.cmpChartQueueA.push(STATE.cmpA.queue.length);
    STATE.cmpChartQueueB.push(STATE.cmpB.queue.length);
    STATE.cmpChartUtilA.push(calcUtilization(STATE.cmpA.machines, STATE.tick));
    STATE.cmpChartUtilB.push(calcUtilization(STATE.cmpB.machines, STATE.tick));
    STATE.cmpChartCompletedA.push(STATE.cmpA.completed.length);
    STATE.cmpChartCompletedB.push(STATE.cmpB.completed.length);
    if (STATE.cmpChartLabels.length > 50) {
      ['cmpChartLabels','cmpChartQueueA','cmpChartQueueB',
       'cmpChartUtilA','cmpChartUtilB','cmpChartCompletedA','cmpChartCompletedB']
        .forEach(k => STATE[k].shift());
    }
    updateCompareCharts();
  }

  renderCompareUI();
  updateCompareResults();
}

/* ─────────────────────────────────────────────────────────────
   LANE PROCESSOR  (used by compare mode)
───────────────────────────────────────────────────────────── */
function processLane(lane, algo) {
  /* Accumulate waiting time */
  lane.queue.forEach(j => { j.totalWaited++; });

  /* Process running machines */
  lane.machines.forEach(m => {
    if (!m.job) return;
    const job = m.job;
    m.busyTime++;
    job.remaining--;

    if (algo === 'RR') {
      job.rrSliceUsed++;
      if (job.rrSliceUsed >= STATE.quantum && job.remaining > 0) {
        job.executedSegments.push({ start: job.startTime, end: STATE.tick, machineId: m.id });
        job.status = 'queued';
        job.rrSliceUsed = 0;
        lane.queue.push(job);
        m.job = null;
        return;
      }
    }

    if (job.remaining <= 0) {
      job.endTime = STATE.tick;
      job.status  = 'done';
      if (algo === 'RR') {
        job.executedSegments.push({ start: job.startTime, end: STATE.tick, machineId: m.id });
        job.executedSegments.forEach(seg => {
          lane.ganttData.push({ machineId: seg.machineId, jobId: job.id, start: seg.start, end: seg.end, color: jobColor(job.id) });
        });
      } else {
        lane.ganttData.push({ machineId: m.id, jobId: job.id, start: job.firstStart, end: job.endTime, color: jobColor(job.id) });
      }
      lane.completed.push(job);
      addHistoryRow(job, `${algo} — ${m.name}`, algo);
      m.job = null;
    }
  });

  /* Assign jobs to idle machines */
  lane.machines.forEach(m => {
    if (m.job || !lane.queue.length) return;
    const job = pickNextJob(lane.queue, algo);
    if (!job) return;
    lane.queue.splice(lane.queue.indexOf(job), 1);
    job.status = 'running';
    job.startTime = STATE.tick;
    if (job.firstStart === null) job.firstStart = STATE.tick;
    job.rrSliceUsed = 0;
    m.job = job;
  });
}

/* ─────────────────────────────────────────────────────────────
   METRIC CALCULATIONS  (scientifically accurate)
───────────────────────────────────────────────────────────── */

/**
 * Machine Utilization = (Σ busy ticks) / (N × elapsed ticks) × 100
 * Range: [0, 100] %
 */
function calcUtilization(machines, elapsed) {
  if (!machines.length || !elapsed) return 0;
  const totalBusy = machines.reduce((s, m) => s + m.busyTime, 0);
  return Math.min(100, Math.round(totalBusy / (machines.length * elapsed) * 100));
}

/**
 * Average Waiting Time:
 * WT = ST − AT
 * Where ST is the start time, and AT is the arrival time.
 * For RR, to match the Virtual Lab standard WT = ST - AT simplified definition:
 */
function calcAvgWaiting(completed, algo) {
  if (!completed.length) return 0;
  const total = completed.reduce((s, j) => {
    // Virtual Lab Simplified WT = ST - AT definition
    const wt = j.firstStart - j.arrival;
    return s + Math.max(0, wt);
  }, 0);
  return parseFloat((total / completed.length).toFixed(1));
}

/**
 * Average Turnaround Time = Σ (FT_i − AT_i) / n
 */
function calcAvgTurnaround(completed) {
  if (!completed.length) return 0;
  const total = completed.reduce((s, j) => s + (j.endTime - j.arrival), 0);
  return parseFloat((total / completed.length).toFixed(1));
}

/**
 * Average Response Time = Σ (firstStart_i − arrival_i) / n
 * (same as avg waiting for non-preemptive; different for RR)
 */
function calcAvgResponse(completed) {
  if (!completed.length) return 0;
  const total = completed.reduce((s, j) => s + Math.max(0, j.firstStart - j.arrival), 0);
  return parseFloat((total / completed.length).toFixed(1));
}

/**
 * Makespan = max(FT) − min(AT)   across all completed jobs
 * Represents the total production completion time.
 */
function calcMakespan(completed) {
  if (!completed.length) return 0;
  const minAT = Math.min(...completed.map(j => j.arrival));
  const maxFT = Math.max(...completed.map(j => j.endTime));
  return maxFT - minAT;
}

/**
 * Throughput = Completed Jobs / Simulation Time (jobs/sec, multiplied by 60 for jobs/min readout)
 */
function calcThroughput(completed, elapsed) {
  if (!elapsed) return '0.0';
  return (completed.length / elapsed * 60).toFixed(1);
}

/**
 * Production Efficiency = (Completed Jobs / Generated Jobs) * 100
 */
function calcProductionEfficiency(completed, generatedCount) {
  if (!generatedCount) return 100;
  return Math.min(100, Math.round((completed.length / generatedCount) * 100));
}

/* ─────────────────────────────────────────────────────────────
   SINGLE MODE — RENDER
───────────────────────────────────────────────────────────── */
function renderSingleUI() {
  /* Timer */
  el('timerDisplay').textContent = fmtTime(STATE.tick);
  el('timerStatus').textContent  = STATE.paused ? '⏸ Paused' : '⏱ Running…';

  /* Scheduler visual */
  const scLabel = el('schedulerLabel');
  if (scLabel) scLabel.textContent = ALGO_META[STATE.algorithm].short;
  const sc = el('schedulerCircle');
  if (sc) sc.classList.toggle('active', !STATE.paused);

  /* KPIs */
  const algo      = STATE.algorithm;
  const completed = STATE.completed;
  const machines  = STATE.machines;
  const elapsed   = STATE.tick;

  const util  = calcUtilization(machines, elapsed);
  const wait  = calcAvgWaiting(completed, algo);
  const ms    = calcMakespan(completed);
  const tp    = calcThroughput(completed, elapsed);
  const eff   = calcProductionEfficiency(completed, STATE.jobs.length);
  const tat   = calcAvgTurnaround(completed);

  setText('kpiMakespan',    `${ms} s`);
  setText('kpiWaiting',     `${wait} s`);
  setText('kpiThroughput',  `${tp} /min`);
  setText('kpiUtilization', `${util}%`);
  setText('kpiQueue',       STATE.queue.length);
  setText('kpiEfficiency',  `${eff}%`);

  setText('packagingCount', completed.length);
  setText('completedCount', completed.length);

  /* Session summary */
  const allJobs = STATE.jobs;
  setText('totalJobsGenerated', allJobs.length);
  setText('totalCompleted',     completed.length);
  setText('highPriorityCount',  allJobs.filter(j => j.priority === 'high').length);
  setText('medPriorityCount',   allJobs.filter(j => j.priority === 'medium').length);
  setText('lowPriorityCount',   allJobs.filter(j => j.priority === 'low').length);

  const busiest = machines.length
    ? machines.reduce((b, m) => m.busyTime > b.busyTime ? m : b)
    : null;
  setText('bestMachine', busiest ? busiest.name : '—');

  renderIncoming();
  renderQueue();
  renderMachines();
  renderNextJobs();
  renderGantt();
  updateRecommendations();
}

/* ─────────────────────────────────────────────────────────────
   INCOMING ORDERS
───────────────────────────────────────────────────────────── */
function renderIncoming() {
  const c = el('incomingOrders');
  if (!c) return;
  const recent = STATE.jobs.filter(j => j.arrival >= STATE.tick - 10).slice(-5);
  if (!recent.length) {
    c.innerHTML = `<div class="empty-state"><i class="fa-solid fa-inbox"></i>Awaiting orders…</div>`;
    return;
  }
  c.innerHTML = recent.map(j => jobCardHTML(j, true)).join('');
}

/* ─────────────────────────────────────────────────────────────
   JOB QUEUE
───────────────────────────────────────────────────────────── */
function renderQueue() {
  const c = el('jobQueue');
  if (!c) return;
  if (!STATE.queue.length) {
    c.innerHTML = `<div class="empty-state"><i class="fa-solid fa-database"></i>Queue empty</div>`;
    return;
  }
  // Show queue in the order the algorithm would pick
  const sorted = sortedQueueForDisplay(STATE.queue, STATE.algorithm);
  c.innerHTML = sorted.slice(0, 7).map((j, idx) => jobCardHTML(j, false, idx + 1)).join('');
}

function sortedQueueForDisplay(queue, algo) {
  const q = [...queue];
  switch (algo) {
    case 'SJF':
      return q.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
    case 'Priority':
      return q.sort((a, b) => pNum(b.priority) - pNum(a.priority) || a.arrival - b.arrival);
    case 'FCFS':
    case 'RR':
    default:
      return q.sort((a, b) => a.arrival - b.arrival || a.id - b.id);
  }
}

/* ─────────────────────────────────────────────────────────────
   MACHINE CARDS
───────────────────────────────────────────────────────────── */
function renderMachines() {
  const c = el('machinesContainer');
  if (!c) return;
  c.innerHTML = STATE.machines.map(m => machineCardHTML(m)).join('');
}

function machineCardHTML(m) {
  const running = !!m.job;
  const pct     = running ? Math.round((1 - m.job.remaining / m.job.burst) * 100) : 0;
  const util    = STATE.tick ? Math.round(m.busyTime / STATE.tick * 100) : 0;

  return `
  <div class="machine-card ${running ? 'running' : 'idle'}">
    <div class="machine-header">
      <span class="machine-name">${m.name}</span>
      <span class="machine-status-dot ${running ? 'running' : 'idle'}"></span>
    </div>
    <svg class="machine-icon" viewBox="0 0 120 36">
      <rect x="4"  y="4"  width="112" height="28" rx="6"
            fill="none" stroke="${running ? '#BFDBFE' : '#E2E8F0'}" stroke-width="1.5"/>
      <circle cx="30" cy="18" r="9"
              fill="none" stroke="${running ? '#3B82F6' : '#CBD5E1'}" stroke-width="1.5"
              style="${running ? 'animation:spin 2s linear infinite;transform-origin:30px 18px' : ''}"/>
      <circle cx="90" cy="18" r="9"
              fill="none" stroke="${running ? '#3B82F6' : '#CBD5E1'}" stroke-width="1.5"
              style="${running ? 'animation:spin 1.5s linear infinite reverse;transform-origin:90px 18px' : ''}"/>
      <rect x="50" y="9" width="20" height="18" rx="4"
            fill="${running ? '#DBEAFE' : '#F1F5F9'}" stroke="${running ? '#93C5FD' : '#CBD5E1'}" stroke-width="1"/>
    </svg>
    <div class="machine-job">
      ${running
        ? `<strong>JOB-${m.job.id}</strong> &mdash; ${m.job.product}
           <span class="priority-badge ${m.job.priority}">${m.job.priority}</span>`
        : `<span style="color:var(--text-faint);">Idle</span>`
      }
    </div>
    <div class="machine-progress-track">
      <div class="machine-progress-fill ${running ? 'running' : ''}" style="width:${pct}%"></div>
    </div>
    <div class="machine-time">
      ${running
        ? `${m.job.remaining}s remaining &mdash; ${pct}% complete`
        : `Utilization this session: ${util}%`
      }
    </div>
  </div>`;
}

/* ─────────────────────────────────────────────────────────────
   JOB CARD HTML
───────────────────────────────────────────────────────────── */
function jobCardHTML(j, showArrival = false, qPos = null) {
  const remainLabel = (j.remaining < j.burst)
    ? `<span class="job-meta-item"><i class="fa-solid fa-hourglass-half"></i> ${j.remaining}s left</span>`
    : '';

  return `
  <div class="job-card ${j.priority}">
    <div class="job-card-header">
      <span class="job-id">JOB-${j.id}${qPos ? ` <small style="opacity:.5">#${qPos}</small>` : ''}</span>
      <span class="priority-badge ${j.priority}">${j.priority}</span>
    </div>
    <div class="job-card-meta">
      <span class="job-meta-item"><i class="fa-solid fa-clock"></i> ${j.burst}s</span>
      <span class="job-meta-item"><i class="fa-solid fa-cube"></i> ${j.product.substring(0, 10)}</span>
      ${showArrival ? `<span class="job-meta-item"><i class="fa-solid fa-plane-arrival"></i> T=${j.arrival}s</span>` : ''}
      ${remainLabel}
    </div>
  </div>`;
}

function renderNextJobs() {
  const p = el('nextJobsPanel');
  if (!p) return;
  const upcoming = STATE.jobs.filter(j => j.status === 'queued').slice(0, 5);
  if (!upcoming.length) {
    p.innerHTML = `<div class="empty-state"><i class="fa-solid fa-inbox"></i>No upcoming jobs</div>`;
    return;
  }
  p.innerHTML = upcoming.map(j => jobCardHTML(j)).join('');
}

/* ─────────────────────────────────────────────────────────────
   GANTT CHART  (proportional timeline, absolute pixel positions)
───────────────────────────────────────────────────────────── */
function renderGantt() {
  const body = el('ganttBody');
  if (!body) return;
  const maxTime = Math.max(STATE.tick, 1);

  let html = '';
  for (let i = 0; i < STATE.machineCount; i++) {
    const mName  = ['Machine A', 'Machine B', 'Machine C'][i];
    const blocks = STATE.ganttData.filter(b => b.machineId === i);
    const running = STATE.machines[i]?.job;

    let blocksHTML = blocks.map(b => {
      const left  = (b.start  / maxTime * 100).toFixed(2);
      const width = ((b.end - b.start) / maxTime * 100).toFixed(2);
      return `<div class="gantt-block ${b.color}"
               style="left:${left}%;width:${Math.max(0.5, width)}%"
               title="JOB-${b.jobId} | T=${b.start}–${b.end}s">JOB-${b.jobId}</div>`;
    }).join('');

    /* Show in-progress block */
    if (running && running.startTime !== null) {
      const segStart = running.startTime;
      const left  = (segStart / maxTime * 100).toFixed(2);
      const width = ((STATE.tick - segStart) / maxTime * 100).toFixed(2);
      blocksHTML += `<div class="gantt-block ${jobColor(running.id)}"
               style="left:${left}%;width:${Math.max(0.5, width)}%;opacity:.65;"
               title="JOB-${running.id} — running">JOB-${running.id}</div>`;
    }

    html += `
    <div class="gantt-row">
      <span class="gantt-machine-label">${mName}</span>
      <div class="gantt-track">${blocksHTML}</div>
    </div>`;
  }
  body.innerHTML = html || `<div class="empty-state">No execution data yet</div>`;
}

function renderCompareGantt(lane, containerId) {
  const body = el(containerId);
  if (!body) return;
  const maxTime = Math.max(STATE.tick, 1);

  let html = '';
  for (let i = 0; i < STATE.machineCount; i++) {
    const mName  = ['Machine A', 'Machine B', 'Machine C'][i];
    const blocks = lane.ganttData.filter(b => b.machineId === i);
    const running = lane.machines[i]?.job;

    let blocksHTML = blocks.map(b => {
      const left  = (b.start  / maxTime * 100).toFixed(2);
      const width = ((b.end - b.start) / maxTime * 100).toFixed(2);
      return `<div class="gantt-block ${b.color}"
               style="left:${left}%;width:${Math.max(0.5, width)}%"
               title="JOB-${b.jobId} | T=${b.start}–${b.end}s">JOB-${b.jobId}</div>`;
    }).join('');

    if (running && running.startTime !== null) {
      const left  = (running.startTime / maxTime * 100).toFixed(2);
      const width = ((STATE.tick - running.startTime) / maxTime * 100).toFixed(2);
      blocksHTML += `<div class="gantt-block ${jobColor(running.id)}"
               style="left:${left}%;width:${Math.max(0.5, width)}%;opacity:.65;">JOB-${running.id}</div>`;
    }

    html += `
    <div class="gantt-row">
      <span class="gantt-machine-label">${mName}</span>
      <div class="gantt-track">${blocksHTML}</div>
    </div>`;
  }
  body.innerHTML = html || `<div class="empty-state">No data yet</div>`;
}

/* ─────────────────────────────────────────────────────────────
   PRODUCTION HISTORY TABLE
───────────────────────────────────────────────────────────── */
function addHistoryRow(job, machineName, algo) {
  const tbody = el('historyBody');
  if (!tbody) return;

  const emptyRow = tbody.querySelector('tr td[colspan]');
  if (emptyRow) emptyRow.closest('tr').remove();

  const alg = algo || (STATE.compareMode ? 'FCFS' : STATE.algorithm);
  const wt  = (alg === 'RR') ? job.totalWaited : Math.max(0, job.firstStart - job.arrival);
  const tat    = job.endTime - job.arrival;
  const wtColor = wt > 20 ? 'var(--danger)' : wt > 10 ? 'var(--warning)' : 'var(--success)';

  const row = document.createElement('tr');
  row.className = 'newest';
  row.innerHTML = `
    <td><strong>JOB-${job.id}</strong></td>
    <td>${job.product}</td>
    <td><span class="priority-badge ${job.priority}">${job.priority}</span></td>
    <td>${machineName}</td>
    <td>${fmtTime(job.arrival)}</td>
    <td>${fmtTime(job.firstStart)}</td>
    <td>${fmtTime(job.endTime)}</td>
    <td style="color:${wtColor};font-weight:600">${wt}s</td>
    <td><span class="status-done">✓ Done</span></td>
  `;
  tbody.insertBefore(row, tbody.firstChild);
  setTimeout(() => row.classList.remove('newest'), 2000);

  while (tbody.children.length > 50) tbody.lastChild.remove();
}

/* ─────────────────────────────────────────────────────────────
   AI DECISION PANEL
───────────────────────────────────────────────────────────── */
function showDecision(job, algo) {
  const panel = el('decisionPanel');
  if (!panel) return;

  const meta   = ALGO_META[algo];
  const reason = meta ? meta.decisionFn(job, STATE.queue) : '';

  panel.innerHTML = `
    <div class="decision-algo-badge">
      <i class="fa-solid fa-microchip"></i> ${meta.short}
    </div>
    <div class="decision-job-row">
      <span>Dispatching:</span>
      <span class="decision-job-id">JOB-${job.id}</span>
      <span class="priority-badge ${job.priority}">${job.priority}</span>
    </div>
    <div class="decision-reason">${reason}</div>
  `;

  const aiText = el('aiPanelText');
  if (aiText) aiText.textContent = reason;

  const sel = el('schedulerSelectedJob');
  if (sel) sel.innerHTML = `<span class="selected-job-chip">JOB-${job.id}</span>`;
}

/* ─────────────────────────────────────────────────────────────
   AI RECOMMENDATIONS
───────────────────────────────────────────────────────────── */
function updateRecommendations() {
  const algo      = STATE.algorithm;
  const completed = STATE.completed;
  const qLen      = STATE.queue.length;
  const util      = calcUtilization(STATE.machines, STATE.tick);
  const avgWait   = calcAvgWaiting(completed, algo);
  const hRatio    = STATE.jobs.length
    ? STATE.jobs.filter(j => j.priority === 'high').length / STATE.jobs.length
    : 0;

  let r1 = '', r2 = '', r3 = '';
  let s2 = false, s3 = false;

  if (!STATE.running) {
    r1 = 'Start the simulation to receive real-time AI recommendations.';
  } else if (qLen > 8) {
    r1 = `⚠ Queue congestion: ${qLen} jobs waiting. Consider Shortest Job First (SJF) to drain the queue faster by clearing short jobs first.`;
    s2 = true; r2 = 'Increasing machine count to 3 can also reduce queue buildup under heavy load.';
  } else if (util < 40 && STATE.tick > 15) {
    r1 = `Machine utilization is low (${util}%). Jobs are arriving slowly relative to machine capacity. Increase job arrival rate or reduce machine count.`;
  } else if (hRatio > 0.5 && algo !== 'Priority') {
    r1 = `${Math.round(hRatio*100)}% of jobs are high-priority. Priority Scheduling will ensure urgent orders complete first, reducing critical order delays.`;
    s2 = true; r2 = 'Priority Scheduling is optimal when you have a clear priority hierarchy among jobs.';
  } else if (algo === 'FCFS' && qLen > 3) {
    r1 = `FCFS may cause convoy effect: a long job (large burst) is blocking ${qLen} shorter jobs behind it. SJF would reduce avg waiting time.`;
    s2 = true; r2 = `Switching to SJF: shorter jobs get served first, reducing average waiting time from ~${avgWait}s.`;
  } else if (algo === 'RR') {
    r1 = `Round Robin is distributing machine time fairly (quantum=${STATE.quantum}s). Each job gets regular CPU turns — no starvation occurs.`;
    s2 = true; r2 = avgWait > 20
      ? `Avg waiting time is ${avgWait}s. A shorter quantum may improve response time at the cost of more preemptions.`
      : `Avg waiting time is ${avgWait}s. Current quantum is well-tuned for this workload.`;
  } else if (algo === 'SJF') {
    r1 = `SJF is minimising average waiting time. Avg WT: ${avgWait}s. Note: long jobs may wait longer as short jobs keep arriving.`;
  } else if (algo === 'Priority') {
    r1 = `Priority Scheduling: high-priority jobs are served first. Avg response time: ${calcAvgResponse(completed)}s. Low-priority jobs may experience starvation if high-priority jobs keep arriving.`;
  } else {
    r1 = `${algo} running. Utilization: ${util}%. Queue: ${qLen} jobs. Avg waiting: ${avgWait}s.`;
  }

  if (completed.length > 3) {
    const ms = calcMakespan(completed);
    s3 = true;
    r3 = `Makespan: ${ms}s | Avg TAT: ${calcAvgTurnaround(completed)}s | Efficiency: ${calcProductionEfficiency(completed, STATE.jobs.length)}%`;
  }

  setText('rec1', r1);
  if (el('recItem2')) el('recItem2').style.display = s2 ? 'flex' : 'none';
  if (el('recItem3')) el('recItem3').style.display = s3 ? 'flex' : 'none';
  if (s2) setText('rec2', r2);
  if (s3) setText('rec3', r3);
}

/* ─────────────────────────────────────────────────────────────
   COMPARE MODE — RENDER
───────────────────────────────────────────────────────────── */
function renderCompareUI() {
  el('timerDisplay').textContent = fmtTime(STATE.tick);
  el('timerStatus').textContent  = STATE.paused ? '⏸ Paused' : '⏱ Running…';

  renderLane(STATE.cmpA, STATE.algorithm,  'queueLaneA', 'machinesLaneA', 'completedLaneA', 'laneAStatus');
  renderLane(STATE.cmpB, STATE.algorithmB, 'queueLaneB', 'machinesLaneB', 'completedLaneB', 'laneBStatus');

  renderCompareGantt(STATE.cmpA, 'ganttCompareA');
  renderCompareGantt(STATE.cmpB, 'ganttCompareB');
}

function renderLane(lane, algo, qId, mId, cId, sId) {
  const qEl = el(qId);
  if (qEl) {
    const sorted = sortedQueueForDisplay(lane.queue, algo);
    qEl.innerHTML = sorted.slice(0, 8).map(j =>
      `<div class="mini-job ${j.priority}" title="JOB-${j.id} | burst=${j.burst}s | arr=${j.arrival}s">
         JOB-${j.id}
       </div>`
    ).join('') || '<span style="font-size:10px;color:var(--text-faint);">Empty</span>';
  }

  const mEl = el(mId);
  if (mEl) {
    mEl.innerHTML = lane.machines.map(m => {
      const pct = m.job ? Math.round((1 - m.job.remaining / m.job.burst) * 100) : 0;
      return `
      <div class="mini-machine ${m.job ? 'running' : 'idle'}">
        <span class="mini-machine-name">${m.name}</span>
        <div class="mini-machine-bar">
          <div class="mini-machine-fill" style="width:${pct}%"></div>
        </div>
        <span class="mini-machine-pct">${m.job ? `${m.job.remaining}s` : 'idle'}</span>
      </div>`;
    }).join('');
  }

  setText(cId, lane.completed.length);

  const sEl = el(sId);
  if (sEl) {
    const isRunning = lane.machines.some(m => !!m.job);
    sEl.className = `lane-status ${isRunning ? 'running' : 'idle'}`;
    sEl.textContent = isRunning ? 'Running' : 'Idle';
  }
}

/* ─────────────────────────────────────────────────────────────
   COMPARE RESULTS TABLE  (scientifically accurate metrics)
───────────────────────────────────────────────────────────── */
function updateCompareResults() {
  const algoA = STATE.algorithm;
  const algoB = STATE.algorithmB;
  const cA    = STATE.cmpA.completed;
  const cB    = STATE.cmpB.completed;
  const mA    = STATE.cmpA.machines;
  const mB    = STATE.cmpB.machines;
  const t     = STATE.tick;

  setText('cmpHeaderA', `Alg. A — ${algoA}`);
  setText('cmpHeaderB', `Alg. B — ${algoB}`);
  setText('laneAName',  algoA);
  setText('laneBName',  algoB);

  /* Makespan */
  const msA = calcMakespan(cA), msB = calcMakespan(cB);
  metricRow('cmpMakespanA','cmpMakespanB','cmpMakespanW', msA, msB, v => `${v}s`, true);

  /* Avg Waiting Time */
  const wtA = calcAvgWaiting(cA, algoA), wtB = calcAvgWaiting(cB, algoB);
  metricRow('cmpWaitA','cmpWaitB','cmpWaitW', wtA, wtB, v => `${v}s`, true);

  /* Avg Turnaround */
  const tatA = calcAvgTurnaround(cA), tatB = calcAvgTurnaround(cB);
  metricRow('cmpTatA','cmpTatB','cmpTatW', tatA, tatB, v => `${v}s`, true);

  /* Throughput */
  const tpA = parseFloat(calcThroughput(cA, t));
  const tpB = parseFloat(calcThroughput(cB, t));
  metricRow('cmpThroughA','cmpThroughB','cmpThroughW', tpA, tpB, v => `${v.toFixed(1)}/min`, false);

  /* Utilization */
  const utA = calcUtilization(mA, t), utB = calcUtilization(mB, t);
  metricRow('cmpUtilA','cmpUtilB','cmpUtilW', utA, utB, v => `${v}%`, false);

  /* Production Efficiency */
  const effA = calcProductionEfficiency(cA, STATE.cmpA.queue.length + cA.length + (STATE.cmpA.machines.filter(m => m.job).length)),
        effB = calcProductionEfficiency(cB, STATE.cmpB.queue.length + cB.length + (STATE.cmpB.machines.filter(m => m.job).length));
  metricRow('cmpEffA','cmpEffB','cmpEffW', effA, effB, v => `${v}%`, false);

  /* Winner banner */
  if (cA.length > 2 || cB.length > 2) {
    const banner  = el('winnerBanner');
    const wText   = el('winnerText');
    if (banner && wText) {
      banner.style.display = 'flex';
      const aWins = [
        msA < msB, wtA < wtB, tpA > tpB, utA > utB
      ].filter(Boolean).length;
      const bWins = 4 - aWins;
      const winner    = aWins >= bWins ? algoA : algoB;
      const loser     = winner === algoA ? algoB : algoA;
      const winnerWt  = winner === algoA ? wtA : wtB;
      const loserWt   = winner === algoA ? wtB : wtA;
      const winnerUtil = winner === algoA ? utA : utB;

      wText.innerHTML = `<strong>${winner}</strong> is outperforming ${loser} on ${Math.max(aWins,bWins)}/4 metrics.
        ${winner==='SJF' ? ' SJF achieves lower average waiting time by clearing short jobs first.' : ''}
        ${winner==='Priority' ? ' Priority Scheduling fast-tracks high-priority orders, improving critical job throughput.' : ''}
        ${winner==='RR' ? ' Round Robin distributes machine time fairly, giving better response time across all jobs.' : ''}
        ${winner==='FCFS' ? ' FCFS provides predictable, low-overhead scheduling with no starvation.' : ''}
        Avg waiting: <strong>${winnerWt}s</strong> vs ${loserWt}s. Machine utilization: <strong>${winnerUtil}%</strong>.`;
    }
  }
}

/**
 * Populate a metric row with colour-coded better/worse values.
 * lowerBetter: true → lower value wins (waiting time, makespan)
 *              false → higher value wins (throughput, utilization)
 */
function metricRow(idA, idB, idW, valA, valB, fmt, lowerBetter) {
  const elA = el(idA), elB = el(idB), elW = el(idW);
  if (!elA || !elB) return;

  const aIsBetter = lowerBetter
    ? (valA <= valB && valA > 0)
    : (valA >= valB && valA > 0);

  elA.innerHTML = `<span class="${valA > 0 ? (aIsBetter  ? 'val-better' : 'val-worse') : ''}">${valA > 0 ? fmt(valA) : '—'}</span>`;
  elB.innerHTML = `<span class="${valB > 0 ? (!aIsBetter ? 'val-better' : 'val-worse') : ''}">${valB > 0 ? fmt(valB) : '—'}</span>`;

  if (elW) {
    if (!valA && !valB) { elW.innerHTML = '—'; return; }
    const winner = aIsBetter ? STATE.algorithm : STATE.algorithmB;
    elW.innerHTML = `<span class="winner-cell"><i class="fa-solid fa-trophy"></i> ${winner}</span>`;
  }
}

/* ─────────────────────────────────────────────────────────────
   CHARTS  (Chart.js)
───────────────────────────────────────────────────────────── */
let CHARTS = {};

function initSingleCharts() {
  destroyCharts(['queue','util','throughput']);

  const baseOpts = (yLabel, max) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 9 } } },
      y: {
        beginAtZero: true,
        ...(max ? { max } : {}),
        grid: { color: '#F1F5F9' },
        title: { display: true, text: yLabel, font: { size: 9 } }
      }
    }
  });

  CHARTS.queue = new Chart(el('queueChart'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Queue Length', data: [],
      borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,.1)',
      fill: true, tension: .4, pointRadius: 2 }] },
    options: baseOpts('Jobs in Queue')
  });

  CHARTS.util = new Chart(el('utilChart'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Utilization %', data: [],
      borderColor: '#16A34A', backgroundColor: 'rgba(22,163,74,.1)',
      fill: true, tension: .4, pointRadius: 2 }] },
    options: baseOpts('Utilization (%)', 100)
  });

  CHARTS.throughput = new Chart(el('throughputChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Completed Jobs', data: [],
      backgroundColor: 'rgba(124,58,237,.65)', borderRadius: 4 }] },
    options: baseOpts('Completed Jobs')
  });
}

function initCompareCharts() {
  destroyCharts(['cmpQueue','cmpUtil','cmpThrough']);

  const opts = (yLabel, max) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    plugins: { legend: { position: 'top', labels: { boxWidth: 10, font: { size: 9 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 9 } } },
      y: { beginAtZero: true, ...(max?{max}:{}), grid: { color: '#F1F5F9' },
           title: { display: true, text: yLabel, font: { size: 9 } } }
    }
  });

  const nameA = STATE.algorithm, nameB = STATE.algorithmB;

  CHARTS.cmpQueue = new Chart(el('compareQueueChart'), {
    type: 'line',
    data: { labels: [], datasets: [
      { label: nameA, data: [], borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,.08)', fill: true, tension: .4, pointRadius: 2 },
      { label: nameB, data: [], borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,.08)', fill: true, tension: .4, pointRadius: 2 }
    ]},
    options: opts('Queue Length')
  });

  CHARTS.cmpUtil = new Chart(el('compareUtilChart'), {
    type: 'line',
    data: { labels: [], datasets: [
      { label: nameA, data: [], borderColor: '#2563EB', fill: false, tension: .4, pointRadius: 2 },
      { label: nameB, data: [], borderColor: '#7C3AED', fill: false, tension: .4, pointRadius: 2 }
    ]},
    options: opts('Utilization (%)', 100)
  });

  CHARTS.cmpThrough = new Chart(el('compareThroughChart'), {
    type: 'bar',
    data: { labels: [], datasets: [
      { label: nameA, data: [], backgroundColor: 'rgba(37,99,235,.7)',  borderRadius: 3 },
      { label: nameB, data: [], backgroundColor: 'rgba(124,58,237,.7)', borderRadius: 3 }
    ]},
    options: opts('Completed Jobs')
  });
}

function destroyCharts(keys) {
  keys.forEach(k => {
    if (CHARTS[k]) { CHARTS[k].destroy(); CHARTS[k] = null; }
  });
}

function updateSingleCharts() {
  if (!CHARTS.queue) return;
  const L = STATE.chartLabels;

  CHARTS.queue.data.labels = L;
  CHARTS.queue.data.datasets[0].data = STATE.chartQueue;
  CHARTS.queue.update('none');

  CHARTS.util.data.labels = L;
  CHARTS.util.data.datasets[0].data = STATE.chartUtil;
  CHARTS.util.update('none');

  CHARTS.throughput.data.labels = L;
  CHARTS.throughput.data.datasets[0].data = STATE.chartCompleted;
  CHARTS.throughput.update('none');
}

function updateCompareCharts() {
  if (!CHARTS.cmpQueue) return;
  const L = STATE.cmpChartLabels;

  CHARTS.cmpQueue.data.labels = L;
  CHARTS.cmpQueue.data.datasets[0].data = STATE.cmpChartQueueA;
  CHARTS.cmpQueue.data.datasets[1].data = STATE.cmpChartQueueB;
  CHARTS.cmpQueue.update('none');

  CHARTS.cmpUtil.data.labels = L;
  CHARTS.cmpUtil.data.datasets[0].data = STATE.cmpChartUtilA;
  CHARTS.cmpUtil.data.datasets[1].data = STATE.cmpChartUtilB;
  CHARTS.cmpUtil.update('none');

  CHARTS.cmpThrough.data.labels = L;
  CHARTS.cmpThrough.data.datasets[0].data = STATE.cmpChartCompletedA;
  CHARTS.cmpThrough.data.datasets[1].data = STATE.cmpChartCompletedB;
  CHARTS.cmpThrough.update('none');
}

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
let _toastTimer;
function showToast(msg) {
  const t = el('toast'), m = el('toastMsg');
  if (!t || !m) return;
  m.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3800);
}

/* ─────────────────────────────────────────────────────────────
   SIMULATION LOOP
───────────────────────────────────────────────────────────── */
function startLoop() {
  clearInterval(STATE._timer);
  const interval = Math.round(1000 / STATE.speed);
  STATE._timer = setInterval(() => {
    if (STATE.compareMode) tickCompare();
    else tick();
  }, interval);
}

function stopLoop() {
  clearInterval(STATE._timer);
  STATE._timer = null;
}

/* ─────────────────────────────────────────────────────────────
   CONTROL ACTIONS
───────────────────────────────────────────────────────────── */
function startSim() {
  if (STATE.running && !STATE.paused) return;

  if (!STATE.running) {
    /* Full fresh start */
    resetState();
    scheduleNextArrival();

    if (STATE.compareMode) {
      STATE.cmpA = makeLaneState();
      STATE.cmpB = makeLaneState();
      setTimeout(initCompareCharts, 80);
    } else {
      setTimeout(initSingleCharts, 80);
    }

    STATE.running = true;
    STATE.paused  = false;
    el('startBtn').disabled = true;
    el('pauseBtn').disabled = false;
    showToast(`Simulation started | Algorithm: ${STATE.algorithm} | Machines: ${STATE.machineCount} | Scenario: ${SCENARIOS[STATE.scenario].label}`);
  } else {
    /* Resume from pause */
    STATE.paused = false;
    el('startBtn').disabled = true;
    el('pauseBtn').disabled = false;
    showToast('Simulation resumed');
  }

  startLoop();
  updateAlgoInfoPanel();
}

function pauseSim() {
  if (!STATE.running) return;
  STATE.paused = true;
  stopLoop();
  el('startBtn').disabled = false;
  el('pauseBtn').disabled = true;
  showToast('Simulation paused — press Start to resume');
}

function resetSim() {
  stopLoop();
  resetState();
  el('startBtn').disabled = false;
  el('pauseBtn').disabled = true;

  /* Clear charts */
  destroyCharts(['queue','util','throughput','cmpQueue','cmpUtil','cmpThrough']);

  showToast('Simulation reset — configure settings and press Start');
  renderResetUI();
}

function resetState() {
  STATE.running    = false;
  STATE.paused     = false;
  STATE.tick       = 0;
  STATE.jobs       = [];
  STATE.queue      = [];
  STATE.completed  = [];
  STATE.ganttData  = [];
  STATE.nextJobId  = 200;
  STATE.nextArrival= 0;
  STATE.jobColorMap= {};
  STATE.colorIndex = 0;

  STATE.chartLabels    = [];
  STATE.chartQueue     = [];
  STATE.chartUtil      = [];
  STATE.chartCompleted = [];

  STATE.cmpChartLabels     = [];
  STATE.cmpChartQueueA     = []; STATE.cmpChartQueueB     = [];
  STATE.cmpChartUtilA      = []; STATE.cmpChartUtilB      = [];
  STATE.cmpChartCompletedA = []; STATE.cmpChartCompletedB = [];

  STATE.cmpA = null;
  STATE.cmpB = null;

  STATE.machines = createMachines(STATE.machineCount);
}

function renderResetUI() {
  el('timerDisplay').textContent = '00:00';
  el('timerStatus').textContent  = 'Ready to start';

  /* Clear KPIs */
  ['kpiMakespan','kpiWaiting','kpiThroughput','kpiUtilization','kpiQueue','kpiEfficiency',
   'packagingCount','completedCount','totalJobsGenerated','totalCompleted',
   'highPriorityCount','medPriorityCount','lowPriorityCount']
    .forEach(id => setText(id, id.includes('kpiQueue') || id.includes('Count') ? '0' :
      id.includes('kpiEfficiency') ? '100%' : id.includes('kpi') ? '—' : '0'));

  setText('bestMachine', '—');

  const dp = el('decisionPanel');
  if (dp) dp.innerHTML = `<div class="empty-state"><i class="fa-solid fa-brain"></i>Awaiting simulation…</div>`;
  const sp = el('schedulerSelectedJob');
  if (sp) sp.innerHTML = '';
  const ai = el('aiPanelText');
  if (ai) ai.textContent = 'Start the simulation to see real-time scheduling decisions and explanations.';
  const wb = el('winnerBanner');
  if (wb) wb.style.display = 'none';

  /* Clear history */
  const tbody = el('historyBody');
  if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="color:var(--text-faint);padding:20px;">No jobs executed yet.</td></tr>`;

  /* Clear Gantt */
  const gb = el('ganttBody');
  if (gb) gb.innerHTML = `<div class="empty-state">No execution data yet</div>`;
  const gca = el('ganttCompareA');
  if (gca) gca.innerHTML = `<div class="empty-state">No data yet</div>`;
  const gcb = el('ganttCompareB');
  if (gcb) gcb.innerHTML = `<div class="empty-state">No data yet</div>`;

  /* Clear incoming / queue */
  const io = el('incomingOrders');
  if (io) io.innerHTML = `<div class="empty-state"><i class="fa-solid fa-inbox"></i>No orders yet</div>`;
  const jq = el('jobQueue');
  if (jq) jq.innerHTML = `<div class="empty-state"><i class="fa-solid fa-database"></i>Queue empty</div>`;
  const mc = el('machinesContainer');
  if (mc) mc.innerHTML = STATE.machines.map(m => machineCardHTML(m)).join('');

  /* Clear compare */
  ['cmpMakespanA','cmpMakespanB','cmpMakespanW','cmpWaitA','cmpWaitB','cmpWaitW',
   'cmpTatA','cmpTatB','cmpTatW','cmpThroughA','cmpThroughB','cmpThroughW',
   'cmpUtilA','cmpUtilB','cmpUtilW','cmpEffA','cmpEffB','cmpEffW'].forEach(id => setText(id, '—'));

  updateRecommendations();
  renderGantt();
}

function makeLaneState() {
  return {
    queue:     [],
    machines:  createMachines(STATE.machineCount),
    completed: [],
    ganttData: [],
  };
}

/* ─────────────────────────────────────────────────────────────
   ALGO INFO PANEL
───────────────────────────────────────────────────────────── */
function updateAlgoInfoPanel() {
  const algo = STATE.algorithm;
  const meta = ALGO_META[algo];
  if (!meta) return;
  setText('algoInfoName', meta.name);
  setText('algoInfoDesc', meta.desc);
  setText('algoInfoPros', meta.pros);
  setText('algoInfoCons', meta.cons);
  const lbl = el('schedulerLabel');
  if (lbl) lbl.textContent = meta.short;
}

/* ─────────────────────────────────────────────────────────────
   COMPARE MODE SWITCH
───────────────────────────────────────────────────────────── */
function setCompareMode(on) {
  STATE.compareMode = on;
  el('singleMode').classList.toggle('hidden', on);
  el('compareSection').classList.toggle('hidden', !on);
  el('algoBGroup').classList.toggle('hidden', !on);
}

/* ─────────────────────────────────────────────────────────────
   EVENT LISTENERS & BOOT
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* Loading screen */
  setTimeout(() => {
    const ov = el('loadingOverlay');
    if (ov) { ov.style.opacity = '0'; ov.style.transition = 'opacity .4s'; setTimeout(() => ov.style.display='none', 400); }
  }, 800);

  /* Initial machine setup */
  STATE.machines = createMachines(STATE.machineCount);

  /* Sim control buttons */
  el('startBtn').addEventListener('click', startSim);
  el('pauseBtn').addEventListener('click', pauseSim);
  el('resetBtn').addEventListener('click', resetSim);

  /* Algorithm A selector */
  el('algoA').addEventListener('change', e => {
    STATE.algorithm = e.target.value;
    updateAlgoInfoPanel();
    if (STATE.running) resetSim();
    else renderResetUI();
  });

  /* Algorithm B selector */
  el('algoB').addEventListener('change', e => {
    STATE.algorithmB = e.target.value;
    if (STATE.running) resetSim();
  });

  /* Scenario */
  el('scenario').addEventListener('change', e => {
    STATE.scenario = e.target.value;
    if (STATE.running) resetSim();
  });

  /* Machine count */
  document.querySelectorAll('.mcount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mcount-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.machineCount = parseInt(btn.dataset.count);
      if (!STATE.running) {
        STATE.machines = createMachines(STATE.machineCount);
        renderResetUI();
      }
    });
  });

  /* Simulation speed */
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.speed = parseInt(btn.dataset.speed);
      if (STATE.running && !STATE.paused) startLoop(); // restart loop at new speed
    });
  });

  /* Compare toggle */
  el('compareToggle').addEventListener('change', e => {
    setCompareMode(e.target.checked);
    if (STATE.running) resetSim();
  });

  /* Initial render */
  renderResetUI();
  updateAlgoInfoPanel();

  showToast('SmartFactory 4.0 ready! Select an algorithm and press Start.');
});
