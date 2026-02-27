// Function to analyze and compare all selected algorithms
function analyzeAlgorithms(processes, selectedAlgorithms, timeQuantum) {
  const comparisonData = [];

  selectedAlgorithms.forEach((algorithm) => {
    let result;

    switch (algorithm) {
      case "FCFS":
        result = FCFS([...processes]);
        break;
      case "SJF":
        result = SJF([...processes]);
        break;
      case "SRTF":
        result = SRTF([...processes]);
        break;
      case "LJF":
        result = LJF([...processes]);
        break;
      case "LRTF":
        result = LRTF([...processes]);
        break;
      case "Priority":
        result = Priority([...processes]);
        break;
      case "RoundRobin":
        result = RoundRobin([...processes], timeQuantum);
        break;
      default:
        return;
    }

    // Calculate throughput (processes per unit time)
    const maxCompletionTime = Math.max(
      ...result.processes.map((p) => p.completionTime)
    );
    const throughput = processes.length / maxCompletionTime;

    comparisonData.push({
      name:
        algorithm + (algorithm === "RoundRobin" ? ` (TQ=${timeQuantum})` : ""),
      avgTurnaroundTime: result.avgTurnaroundTime,
      avgWaitingTime: result.avgWaitingTime,
      avgResponseTime: result.avgResponseTime,
      throughput: throughput,
      algorithm: algorithm,
      result: result,
    });
  });

  return comparisonData;
}

// Function to determine the best algorithm based on criteria
function findBestAlgorithm(comparisonData) {
  if (comparisonData.length === 0) return null;

  // We'll consider multiple factors with different weights
  const weightedScores = comparisonData.map((data) => {
    // Normalize each metric (lower is better)
    const maxTurnaround = Math.max(
      ...comparisonData.map((d) => d.avgTurnaroundTime)
    );
    const maxWaiting = Math.max(...comparisonData.map((d) => d.avgWaitingTime));
    const maxResponse = Math.max(
      ...comparisonData.map((d) => d.avgResponseTime)
    );
    const maxThroughput = Math.max(...comparisonData.map((d) => d.throughput));

    const turnaroundScore = 1 - data.avgTurnaroundTime / maxTurnaround;
    const waitingScore = 1 - data.avgWaitingTime / maxWaiting;
    const responseScore = 1 - data.avgResponseTime / maxResponse;
    const throughputScore = data.throughput / maxThroughput;

    // Weighted sum (adjust weights as needed)
    // Higher weight for waiting time as it's often the most important metric
    const totalScore =
      0.35 * waitingScore +
      0.25 * turnaroundScore +
      0.2 * responseScore +
      0.2 * throughputScore;

    return {
      ...data,
      score: totalScore,
    };
  });

  // Sort by score descending
  weightedScores.sort((a, b) => b.score - a.score);

  return weightedScores[0];
}

// Function to suggest which algorithm might be best for the given process characteristics
function suggestAlgorithm(processes) {
  const characteristics = analyzeProcessCharacteristics(processes);

  let suggestions = [];

  // Check for characteristics that favor specific algorithms
  if (characteristics.isHomogeneous) {
    suggestions.push("FCFS", "RoundRobin");
  }

  if (characteristics.hasShortJobs) {
    suggestions.push("SJF", "SRTF");
  }

  if (characteristics.hasLongJobs) {
    suggestions.push("LJF", "LRTF");
  }

  if (characteristics.hasPriorityVariation) {
    suggestions.push("Priority");
  }

  if (characteristics.isMixed) {
    suggestions.push("RoundRobin", "SRTF");
  }

  // Count occurrences and get the most suggested
  const suggestionCounts = suggestions.reduce((acc, algo) => {
    acc[algo] = (acc[algo] || 0) + 1;
    return acc;
  }, {});

  const topSuggestion = Object.keys(suggestionCounts).reduce((a, b) =>
    suggestionCounts[a] > suggestionCounts[b] ? a : b
  );

  return {
    suggestedAlgorithm: topSuggestion,
    characteristics: characteristics,
    allSuggestions: [...new Set(suggestions)], // Unique suggestions
  };
}

// Helper function to analyze process characteristics
function analyzeProcessCharacteristics(processes) {
  const burstTimes = processes.map((p) => p.burstTime);
  const arrivalTimes = processes.map((p) => p.arrivalTime);
  const priorities = processes.map((p) => p.priority);

  const avgBurstTime =
    burstTimes.reduce((a, b) => a + b, 0) / burstTimes.length;
  const maxBurstTime = Math.max(...burstTimes);
  const minBurstTime = Math.min(...burstTimes);

  const avgArrivalTime =
    arrivalTimes.reduce((a, b) => a + b, 0) / arrivalTimes.length;
  const maxArrivalTime = Math.max(...arrivalTimes);
  const minArrivalTime = Math.min(...arrivalTimes);

  const avgPriority = priorities.reduce((a, b) => a + b, 0) / priorities.length;
  const maxPriority = Math.max(...priorities);
  const minPriority = Math.min(...priorities);

  // Determine characteristics
  const isHomogeneous =
    maxBurstTime - minBurstTime < avgBurstTime * 0.5 && // Burst times are similar
    maxArrivalTime - minArrivalTime < avgArrivalTime * 0.5; // Arrival times are similar

  const hasShortJobs = burstTimes.some((t) => t < avgBurstTime * 0.5);
  const hasLongJobs = burstTimes.some((t) => t > avgBurstTime * 1.5);
  const hasPriorityVariation = maxPriority - minPriority > 2;
  const isMixed = !isHomogeneous && hasShortJobs && hasLongJobs;

  return {
    isHomogeneous,
    hasShortJobs,
    hasLongJobs,
    hasPriorityVariation,
    isMixed,
    avgBurstTime,
    maxBurstTime,
    minBurstTime,
    avgArrivalTime,
    maxArrivalTime,
    minArrivalTime,
    avgPriority,
    maxPriority,
    minPriority,
  };
}
