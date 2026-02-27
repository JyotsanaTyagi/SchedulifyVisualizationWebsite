document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const processInputs = document.getElementById("process-inputs");
  const addProcessBtn = document.getElementById("add-process");
  const generateRandomBtn = document.getElementById("generate-random");
  const clearAllBtn = document.getElementById("clear-all");
  const simulateBtn = document.getElementById("simulate");
  const compareBtn = document.getElementById("compare");
  const algorithmCheckboxes = document.querySelectorAll(
    'input[name="algorithm"]'
  );
  const roundRobinInput = document.getElementById("round-robin-input");
  const resultsContainer = document.getElementById("results-container");

  // Event Listeners
  addProcessBtn.addEventListener("click", addProcessInput);
  generateRandomBtn.addEventListener("click", generateRandomProcesses);
  clearAllBtn.addEventListener("click", clearAllProcesses);
  simulateBtn.addEventListener("click", runSimulation);
  compareBtn.addEventListener("click", compareAlgorithms);

  // Round Robin toggle
  algorithmCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.value === "RoundRobin" && this.checked) {
        roundRobinInput.classList.remove("hidden");
      } else if (this.value === "RoundRobin" && !this.checked) {
        roundRobinInput.classList.add("hidden");
      }
    });
  });

  // Add initial process input
  addProcessInput();

  function addProcessInput() {
    const processDiv = document.createElement("div");
    processDiv.className = "process-input";

    const pidInput = document.createElement("input");
    pidInput.type = "number";
    pidInput.className = "pid";
    pidInput.placeholder = "PID";
    pidInput.min = "1";
    pidInput.value = processInputs.children.length + 1;

    const arrivalInput = document.createElement("input");
    arrivalInput.type = "number";
    arrivalInput.className = "arrival-time";
    arrivalInput.placeholder = "Arrival Time";
    arrivalInput.min = "0";
    arrivalInput.value = "0";

    const burstInput = document.createElement("input");
    burstInput.type = "number";
    burstInput.className = "burst-time";
    burstInput.placeholder = "Burst Time";
    burstInput.min = "1";
    burstInput.value = Math.floor(Math.random() * 10) + 1;

    const priorityInput = document.createElement("input");
    priorityInput.type = "number";
    priorityInput.className = "priority";
    priorityInput.placeholder = "Priority";
    priorityInput.min = "0";
    priorityInput.value = Math.floor(Math.random() * 5);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", function () {
      processInputs.removeChild(processDiv);
      updatePIDs();
    });

    processDiv.appendChild(pidInput);
    processDiv.appendChild(arrivalInput);
    processDiv.appendChild(burstInput);
    processDiv.appendChild(priorityInput);
    processDiv.appendChild(removeBtn);

    processInputs.appendChild(processDiv);
  }

  function updatePIDs() {
    const inputs = processInputs.querySelectorAll(".process-input");
    inputs.forEach((input, index) => {
      input.querySelector(".pid").value = index + 1;
    });
  }

  function generateRandomProcesses() {
    clearAllProcesses();

    const processCount = Math.floor(Math.random() * 5) + 3; // 3-7 processes
    for (let i = 0; i < processCount; i++) {
      addProcessInput();

      const inputs = processInputs.children[i];
      inputs.querySelector(".arrival-time").value = Math.floor(
        Math.random() * 5
      );
      inputs.querySelector(".burst-time").value =
        Math.floor(Math.random() * 10) + 1;
      inputs.querySelector(".priority").value = Math.floor(Math.random() * 5);
    }
  }

  function clearAllProcesses() {
    while (processInputs.firstChild) {
      processInputs.removeChild(processInputs.firstChild);
    }
    addProcessInput();
  }

  function getProcesses() {
    const processes = [];
    const inputs = processInputs.querySelectorAll(".process-input");

    inputs.forEach((input) => {
      const pid = parseInt(input.querySelector(".pid").value);
      const arrivalTime = parseInt(input.querySelector(".arrival-time").value);
      const burstTime = parseInt(input.querySelector(".burst-time").value);
      const priority = parseInt(input.querySelector(".priority").value);

      if (
        !isNaN(pid) &&
        !isNaN(arrivalTime) &&
        !isNaN(burstTime) &&
        !isNaN(priority)
      ) {
        processes.push({
          pid,
          arrivalTime,
          burstTime,
          priority,
          remainingTime: burstTime, // For algorithms that need it
        });
      }
    });

    return processes;
  }

  function validateInputs() {
    const processes = getProcesses();

    if (processes.length === 0) {
      alert("Please add at least one process");
      return false;
    }

    const selectedAlgorithms = Array.from(algorithmCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    if (selectedAlgorithms.length === 0) {
      alert("Please select at least one algorithm");
      return false;
    }

    return true;
  }

  function runSimulation() {
    if (!validateInputs()) return;

    resultsContainer.innerHTML = "";

    const processes = getProcesses();
    const selectedAlgorithms = Array.from(algorithmCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    const timeQuantum = selectedAlgorithms.includes("RoundRobin")
      ? parseInt(document.getElementById("time-quantum").value)
      : null;

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

      displayResult(algorithm, result);
    });
  }

  function displayResult(algorithm, result) {
    const card = document.createElement("div");
    card.className = "result-card";

    const title = document.createElement("h3");
    title.textContent =
      algorithm +
      (algorithm === "RoundRobin" ? ` (TQ=${result.timeQuantum})` : "");
    card.appendChild(title);

    // Create table for process metrics
    const table = document.createElement("table");
    table.className = "result-table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
            <tr>
                <th>PID</th>
                <th>Arrival</th>
                <th>Burst</th>
                <th>Priority</th>
                <th>Completion</th>
                <th>Turnaround</th>
                <th>Waiting</th>
                <th>Response</th>
            </tr>
        `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    result.processes.forEach((proc) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${proc.pid}</td>
                <td>${proc.arrivalTime}</td>
                <td>${proc.burstTime}</td>
                <td>${proc.priority}</td>
                <td>${proc.completionTime}</td>
                <td>${proc.turnaroundTime}</td>
                <td>${proc.waitingTime}</td>
                <td>${proc.responseTime}</td>
            `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Add averages row
    const footer = document.createElement("tfoot");
    footer.innerHTML = `
            <tr>
                <td colspan="4"><strong>Averages</strong></td>
                <td></td>
                <td>${result.avgTurnaroundTime.toFixed(2)}</td>
                <td>${result.avgWaitingTime.toFixed(2)}</td>
                <td>${result.avgResponseTime.toFixed(2)}</td>
            </tr>
        `;
    table.appendChild(footer);

    card.appendChild(table);

    // Add Gantt chart
    if (result.ganttChart && result.ganttChart.length > 0) {
      const ganttTitle = document.createElement("h4");
      ganttTitle.textContent = "Gantt Chart";
      card.appendChild(ganttTitle);

      const ganttDiv = document.createElement("div");
      ganttDiv.className = "gantt-chart";

      result.ganttChart.forEach((entry) => {
        const block = document.createElement("div");
        block.className = "gantt-block";
        block.style.backgroundColor = getRandomColor(entry.pid);
        block.textContent = `P${entry.pid}`;

        const timeSpan = document.createElement("span");
        timeSpan.textContent = entry.start;

        block.appendChild(timeSpan);
        ganttDiv.appendChild(block);
      });

      // Add end time
      const lastEntry = result.ganttChart[result.ganttChart.length - 1];
      const endTimeSpan = document.createElement("span");
      endTimeSpan.textContent = lastEntry.end;
      endTimeSpan.style.marginLeft = "5px";
      ganttDiv.appendChild(endTimeSpan);

      card.appendChild(ganttDiv);
    }

    resultsContainer.appendChild(card);
  }
  // Replace the existing compareAlgorithms function in main.js with this:

  function compareAlgorithms() {
    if (!validateInputs()) return;

    try {
      // Clear previous results but keep the chart container
      resultsContainer.innerHTML = `
            <h2>Algorithm Comparison</h2>
            <div id="chart-container" style="width: 800px; height: 400px;">
                <canvas id="comparisonChart"></canvas>
            </div>
            <div id="comparison-results"></div>
        `;

      const processes = getProcesses();
      const selectedAlgorithms = Array.from(algorithmCheckboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);

      const timeQuantum = selectedAlgorithms.includes("RoundRobin")
        ? parseInt(document.getElementById("time-quantum").value)
        : null;

      // Debug log
      console.log("Selected algorithms:", selectedAlgorithms);
      console.log("Processes:", processes);

      // Get comparison data
      const comparisonData = analyzeAlgorithms(
        processes,
        selectedAlgorithms,
        timeQuantum
      );
      console.log("Comparison data:", comparisonData);

      // Render the comparison chart
      if (comparisonData.length > 0) {
        renderComparisonChart(comparisonData);
        displayComparisonResults(comparisonData);
      } else {
        resultsContainer.innerHTML += `<p class="error">No valid algorithms selected or no data to compare.</p>`;
      }
    } catch (error) {
      console.error("Error in compareAlgorithms:", error);
      resultsContainer.innerHTML += `<p class="error">Error: ${error.message}</p>`;
    }
      }
    
    

  function displayComparisonResults(comparisonData) {
    const resultsDiv =
      document.getElementById("comparison-results") ||
      document.createElement("div");
    resultsDiv.id = "comparison-results";
    resultsDiv.className = "comparison-results";
    resultsDiv.innerHTML = "";

    // Create a table for the comparison
    const table = document.createElement("table");
    table.className = "result-table";

    // Create table header
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Algorithm</th>
            <th>Avg Turnaround</th>
            <th>Avg Waiting</th>
            <th>Avg Response</th>
            <th>Throughput</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");
    comparisonData.forEach((data) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.avgTurnaroundTime.toFixed(2)}</td>
            <td>${data.avgWaitingTime.toFixed(2)}</td>
            <td>${data.avgResponseTime.toFixed(2)}</td>
            <td>${data.throughput.toFixed(4)}</td>
        `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    resultsDiv.appendChild(table);
    resultsContainer.appendChild(resultsDiv);

    // Find and display best algorithm
    const bestAlgorithm = findBestAlgorithm(comparisonData);
    if (bestAlgorithm) {
      const bestDiv = document.createElement("div");
      bestDiv.className = "best-algorithm";
      bestDiv.innerHTML = `
            <h3>Recommended Algorithm</h3>
            <p>The most efficient algorithm for these processes is <strong>${
              bestAlgorithm.name
            }</strong>.</p>
            <p>It has the best balance of:</p>
            <ul>
                <li>Average Waiting Time: ${bestAlgorithm.avgWaitingTime.toFixed(
                  2
                )}</li>
                <li>Average Turnaround Time: ${bestAlgorithm.avgTurnaroundTime.toFixed(
                  2
                )}</li>
                <li>Average Response Time: ${bestAlgorithm.avgResponseTime.toFixed(
                  2
                )}</li>
            </ul>
        `;
      resultsContainer.appendChild(bestDiv);
    }
  }

  function getRandomColor(seed) {
    const colors = [
      "#3498db",
      "#2ecc71",
      "#e74c3c",
      "#f39c12",
      "#9b59b6",
      "#1abc9c",
      "#d35400",
      "#34495e",
      "#16a085",
      "#c0392b",
    ];
    return colors[seed % colors.length];
  }
});
