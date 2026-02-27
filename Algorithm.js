// First-Come, First-Served (FCFS)
function FCFS(processes) {
  // Sort processes by arrival time
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  const ganttChart = [];

  processes.forEach((process) => {
    // If the process arrives after current time, jump to its arrival time
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime;
    }

    const startTime = currentTime;
    const completionTime = startTime + process.burstTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = startTime - process.arrivalTime;

    // Update process properties
    process.completionTime = completionTime;
    process.turnaroundTime = turnaroundTime;
    process.waitingTime = waitingTime;
    process.responseTime = responseTime;

    // Update totals
    totalTurnaroundTime += turnaroundTime;
    totalWaitingTime += waitingTime;
    totalResponseTime += responseTime;

    // Add to Gantt chart
    ganttChart.push({
      pid: process.pid,
      start: startTime,
      end: completionTime,
    });

    currentTime = completionTime;
  });

  return {
    processes,
    avgTurnaroundTime: totalTurnaroundTime / processes.length,
    avgWaitingTime: totalWaitingTime / processes.length,
    avgResponseTime: totalResponseTime / processes.length,
    ganttChart,
  };
}

// Shortest Job First (SJF) - Non-preemptive
function SJF(processes) {
  // Sort by arrival time first
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  const ganttChart = [];
  const queue = [];
  let i = 0;

  while (i < processes.length || queue.length > 0) {
    // Add all processes that have arrived by currentTime to the queue
    while (i < processes.length && processes[i].arrivalTime <= currentTime) {
      queue.push(processes[i]);
      i++;
    }

    if (queue.length === 0) {
      // No processes in queue, jump to next arrival time
      currentTime = processes[i].arrivalTime;
      continue;
    }

    // Sort queue by burst time (SJF)
    queue.sort((a, b) => a.burstTime - b.burstTime);

    const process = queue.shift();
    const startTime = currentTime;
    const completionTime = startTime + process.burstTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = startTime - process.arrivalTime;

    // Update process properties
    process.completionTime = completionTime;
    process.turnaroundTime = turnaroundTime;
    process.waitingTime = waitingTime;
    process.responseTime = responseTime;

    // Update totals
    totalTurnaroundTime += turnaroundTime;
    totalWaitingTime += waitingTime;
    totalResponseTime += responseTime;

    // Add to Gantt chart
    ganttChart.push({
      pid: process.pid,
      start: startTime,
      end: completionTime,
    });

    currentTime = completionTime;
  }

  return {
    processes,
    avgTurnaroundTime: totalTurnaroundTime / processes.length,
    avgWaitingTime: totalWaitingTime / processes.length,
    avgResponseTime: totalResponseTime / processes.length,
    ganttChart,
  };
}

// Shortest Remaining Time First (SRTF) - Preemptive
function SRTF(processes) {
  // Sort by arrival time first
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  const ganttChart = [];
  const queue = [];
  let i = 0;
  let prevProcess = null;

  // Initialize remaining time
  processes.forEach((p) => (p.remainingTime = p.burstTime));

  while (i < processes.length || queue.length > 0) {
    // Add all processes that have arrived by currentTime to the queue
    while (i < processes.length && processes[i].arrivalTime <= currentTime) {
      queue.push(processes[i]);
      i++;
    }

    if (queue.length === 0) {
      // No processes in queue, jump to next arrival time
      currentTime = processes[i].arrivalTime;
      continue;
    }

    // Sort queue by remaining time (SRTF)
    queue.sort((a, b) => a.remainingTime - b.remainingTime);

    const process = queue[0];

    // Check if this is the first time the process is getting CPU
    if (process.responseTime === undefined) {
      process.responseTime = currentTime - process.arrivalTime;
    }

    // Execute for 1 unit of time
    const executionTime = 1;
    process.remainingTime -= executionTime;

    // Add to Gantt chart if different from previous process
    if (!prevProcess || prevProcess.pid !== process.pid) {
      ganttChart.push({
        pid: process.pid,
        start: currentTime,
        end: currentTime + executionTime,
      });
    } else {
      // Extend the last Gantt block
      ganttChart[ganttChart.length - 1].end += executionTime;
    }
    prevProcess = process;

    currentTime += executionTime;

    // If process is finished
    if (process.remainingTime === 0) {
      queue.shift(); // Remove from queue

      process.completionTime = currentTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;
      process.waitingTime = process.turnaroundTime - process.burstTime;

      // Update totals
      totalTurnaroundTime += process.turnaroundTime;
      totalWaitingTime += process.waitingTime;
      totalResponseTime += process.responseTime;
    }
  }

  return {
    processes,
    avgTurnaroundTime: totalTurnaroundTime / processes.length,
    avgWaitingTime: totalWaitingTime / processes.length,
    avgResponseTime: totalResponseTime / processes.length,
    ganttChart,
  };
}

// Longest Job First (LJF) - Non-preemptive
function LJF(processes) {
  // Sort by arrival time first
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  const ganttChart = [];
  const queue = [];
  let i = 0;

  while (i < processes.length || queue.length > 0) {
    // Add all processes that have arrived by currentTime to the queue
    while (i < processes.length && processes[i].arrivalTime <= currentTime) {
      queue.push(processes[i]);
      i++;
    }

    if (queue.length === 0) {
      // No processes in queue, jump to next arrival time
      currentTime = processes[i].arrivalTime;
      continue;
    }

    // Sort queue by burst time descending (LJF)
    queue.sort((a, b) => b.burstTime - a.burstTime);

    const process = queue.shift();
    const startTime = currentTime;
    const completionTime = startTime + process.burstTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = startTime - process.arrivalTime;

    // Update process properties
    process.completionTime = completionTime;
    process.turnaroundTime = turnaroundTime;
    process.waitingTime = waitingTime;
    process.responseTime = responseTime;

    // Update totals
    totalTurnaroundTime += turnaroundTime;
    totalWaitingTime += waitingTime;
    totalResponseTime += responseTime;

    // Add to Gantt chart
    ganttChart.push({
      pid: process.pid,
      start: startTime,
      end: completionTime,
    });

    currentTime = completionTime;
  }

  return {
    processes,
    avgTurnaroundTime: totalTurnaroundTime / processes.length,
    avgWaitingTime: totalWaitingTime / processes.length,
    avgResponseTime: totalResponseTime / processes.length,
    ganttChart,
  };
}

// Longest Remaining Time First (LRTF) - Preemptive
function LRTF(processes) {
  // Sort by arrival time first
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  const ganttChart = [];
  const queue = [];
  let i = 0;
  let prevProcess = null;

  // Initialize remaining time
  processes.forEach((p) => (p.remainingTime = p.burstTime));

  while (i < processes.length || queue.length > 0) {
    // Add all processes that have arrived by currentTime to the queue
    while (i < processes.length && processes[i].arrivalTime <= currentTime) {
      queue.push(processes[i]);
      i++;
    }

    if (queue.length === 0) {
      // No processes in queue, jump to next arrival time
      currentTime = processes[i].arrivalTime;
      continue;
    }

    // Sort queue by remaining time descending (LRTF)
    queue.sort((a, b) => b.remainingTime - a.remainingTime);

    const process = queue[0];

    // Check if this is the first time the process is getting CPU
    if (process.responseTime === undefined) {
      process.responseTime = currentTime - process.arrivalTime;
    }

    // Execute for 1 unit of time
    const executionTime = 1;
    process.remainingTime -= executionTime;

    // Add to Gantt chart if different from previous process
    if (!prevProcess || prevProcess.pid !== process.pid) {
      ganttChart.push({
        pid: process.pid,
        start: currentTime,
        end: currentTime + executionTime,
      });
    } else {
      // Extend the last Gantt block
      ganttChart[ganttChart.length - 1].end += executionTime;
    }
    prevProcess = process;

    currentTime += executionTime;

    // If process is finished
    if (process.remainingTime === 0) {
      queue.shift(); // Remove from queue

      process.completionTime = currentTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;
      process.waitingTime = process.turnaroundTime - process.burstTime;

      // Update totals
      totalTurnaroundTime += process.turnaroundTime;
      totalWaitingTime += process.waitingTime;
      totalResponseTime += process.responseTime;
    }
  }

  return {
    processes,
    avgTurnaroundTime: totalTurnaroundTime / processes.length,
    avgWaitingTime: totalWaitingTime / processes.length,
    avgResponseTime: totalResponseTime / processes.length,
    ganttChart,
  };
}

// Priority Scheduling - Non-preemptive (lower number = higher priority)
function Priority(processes) {
  // Sort by arrival time first
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  const ganttChart = [];
  const queue = [];
  let i = 0;

  while (i < processes.length || queue.length > 0) {
    // Add all processes that have arrived by currentTime to the queue
    while (i < processes.length && processes[i].arrivalTime <= currentTime) {
      queue.push(processes[i]);
      i++;
    }

    if (queue.length === 0) {
      // No processes in queue, jump to next arrival time
      currentTime = processes[i].arrivalTime;
      continue;
    }

    // Sort queue by priority (lower number = higher priority)
    queue.sort((a, b) => a.priority - b.priority);

    const process = queue.shift();
    const startTime = currentTime;
    const completionTime = startTime + process.burstTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = startTime - process.arrivalTime;

    // Update process properties
    process.completionTime = completionTime;
    process.turnaroundTime = turnaroundTime;
    process.waitingTime = waitingTime;
    process.responseTime = responseTime;

    // Update totals
    totalTurnaroundTime += turnaroundTime;
    totalWaitingTime += waitingTime;
    totalResponseTime += responseTime;

    // Add to Gantt chart
    ganttChart.push({
      pid: process.pid,
      start: startTime,
      end: completionTime,
    });

    currentTime = completionTime;
  }

  return {
    processes,
    avgTurnaroundTime: totalTurnaroundTime / processes.length,
    avgWaitingTime: totalWaitingTime / processes.length,
    avgResponseTime: totalResponseTime / processes.length,
    ganttChart,
  };
}

// Round Robin Scheduling
function RoundRobin(processes, timeQuantum) {
  // Sort by arrival time first
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  const ganttChart = [];
  const queue = [];
  let i = 0;

  // Initialize remaining time and response flag
  processes.forEach((p) => {
    p.remainingTime = p.burstTime;
    p.hasResponded = false;
  });

  while (i < processes.length || queue.length > 0) {
    // Add all processes that have arrived by currentTime to the queue
    while (i < processes.length && processes[i].arrivalTime <= currentTime) {
      queue.push(processes[i]);
      i++;
    }

    if (queue.length === 0) {
      // No processes in queue, jump to next arrival time
      currentTime = processes[i].arrivalTime;
      continue;
    }

    const process = queue.shift();

    // Check if this is the first time the process is getting CPU
    if (!process.hasResponded) {
      process.responseTime = currentTime - process.arrivalTime;
      process.hasResponded = true;
    }

    // Execute for time quantum or remaining time, whichever is smaller
    const executionTime = Math.min(timeQuantum, process.remainingTime);

    // Add to Gantt chart
    ganttChart.push({
      pid: process.pid,
      start: currentTime,
      end: currentTime + executionTime,
    });

    currentTime += executionTime;
    process.remainingTime -= executionTime;

    // Add processes that arrived during this execution to the queue
    while (i < processes.length && processes[i].arrivalTime <= currentTime) {
      queue.push(processes[i]);
      i++;
    }

    // If process is not finished, add it back to the queue
    if (process.remainingTime > 0) {
      queue.push(process);
    } else {
      // Process is finished
      process.completionTime = currentTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;
      process.waitingTime = process.turnaroundTime - process.burstTime;

      // Update totals
      totalTurnaroundTime += process.turnaroundTime;
      totalWaitingTime += process.waitingTime;
      totalResponseTime += process.responseTime;
    }
  }

  return {
    processes,
    avgTurnaroundTime: totalTurnaroundTime / processes.length,
    avgWaitingTime: totalWaitingTime / processes.length,
    avgResponseTime: totalResponseTime / processes.length,
    ganttChart,
    timeQuantum,
  };
}
