fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTR57GyQwEa-SSoSH2bTX64hty8_iw1IJrp0zjMg8xveCQmFDPtPGq9BIL8Jhnx6wOA5z_QLlGZ7pBe/pubhtml?gid=1248584073&single=true')
  .then(response => response.text())
  .then(csvText => {
    const data = Papa.parse(csvText, { header: true }).data;
    processData(data);
  })
  .catch(error => console.error('Error loading sheet data:', error));
// Sample quarterly manager data (You should replace this with your real CSV loaded data)
const dashboardData = {
    assessment_periods: ["Q1-2024", "Q2-2024", "Q3-2024", "Q4-2024", "Q1-2025"],
    managers: [
        {
            name: "Siva Dasari",
            quarterly_data: {
                "Q1-2024": {
                    overall_effectiveness: 3.6,
                    response_count: 6,
                    competencies: { communication: 3.8, problem_solving: 3.4, field_presence: 3.5, performance_management: 3.7, leadership: 3.6, follow_through: 3.2, strategic_thinking: 3.8 },
                    response_distribution: [0, 2, 2, 2, 0],
                    improvement_perception: 3.0
                },
                "Q1-2025": {
                    overall_effectiveness: 4.1,
                    response_count: 7,
                    competencies: { communication: 4.3, problem_solving: 3.9, field_presence: 4.0, performance_management: 4.1, leadership: 4.1, follow_through: 3.7, strategic_thinking: 4.0 },
                    response_distribution: [0, 0, 2, 3, 2],
                    improvement_perception: 3.8
                }
            },
            cumulative: {
                overall_effectiveness: 3.9,
                total_responses: 32,
                competencies: { communication: 3.9, problem_solving: 3.5, field_presence: 3.6, performance_management: 3.8, leadership: 3.7, follow_through: 3.3, strategic_thinking: 3.9 }
            }
        },
        {
            name: "Deepak",
            quarterly_data: {
                "Q1-2024": {
                    overall_effectiveness: 3.2,
                    response_count: 5,
                    competencies: { communication: 3.4, problem_solving: 3.0, field_presence: 2.8, performance_management: 3.3, leadership: 3.4, follow_through: 3.1, strategic_thinking: 3.0 },
                    response_distribution: [0, 1, 3, 0, 0],
                    improvement_perception: 3.0
                },
                "Q1-2025": {
                    overall_effectiveness: 3.8,
                    response_count: 7,
                    competencies: { communication: 4.0, problem_solving: 3.5, field_presence: 3.2, performance_management: 3.6, leadership: 3.8, follow_through: 3.6, strategic_thinking: 3.7 },
                    response_distribution: [0, 0, 3, 3, 1],
                    improvement_perception: 3.4
                }
            },
            cumulative: {
                overall_effectiveness: 3.4,
                total_responses: 26,
                competencies: { communication: 3.7, problem_solving: 3.2, field_presence: 3.0, performance_management: 3.4, leadership: 3.6, follow_through: 3.3, strategic_thinking: 3.3 }
            }
        }
    ]
};

// Utility functions for updating UI
function $(id) { return document.getElementById(id); }

function populateDropdown(id, options) {
    const select = $(id);
    select.innerHTML = "";
    options.forEach(opt => {
        let option = document.createElement("option");
        option.text = opt;
        option.value = opt;
        select.add(option);
    });
}

// Render competency bars with colors
function renderCompetencyBars(containerId, competencies) {
    const container = $(containerId);
    container.innerHTML = "";
    for (const [key, value] of Object.entries(competencies)) {
        let div = document.createElement("div");
        div.classList.add("competency-bar");

        let fill = document.createElement("div");
        fill.classList.add("competency-fill");
        fill.style.width = (value / 5 * 100) + "%";

        // Color coding based on score
        if (value >= 4) {
            fill.style.backgroundColor = "#29a4b3"; // teal strong
        } else if (value >= 3) {
            fill.style.backgroundColor = "#f2a365"; // orange
        } else {
            fill.style.backgroundColor = "#ea4c89"; // red-pink
        }
        fill.textContent = key.replace(/_/g, " ") + ": " + value.toFixed(2);
        div.appendChild(fill);
        container.appendChild(div);
    }
}

// Render radar chart
let radarChart;
function renderRadarChart(competencies) {
    const ctx = document.getElementById('competencyRadar').getContext('2d');
    const labels = Object.keys(competencies).map(k => k.replace(/_/g, " "));

    if (radarChart) radarChart.destroy();

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Competency Scores',
                data: Object.values(competencies),
                fill: true,
                backgroundColor: 'rgba(33, 128, 141, 0.3)',
                borderColor: '#21808d',
                pointBackgroundColor: '#21808d',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#21808d'
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Render distribution bar chart
let barChart;
function renderBarChart(dist) {
    const ctx = document.getElementById('distributionBarChart').getContext('2d');
    if (barChart) barChart.destroy();

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [1, 2, 3, 4, 5],
            datasets: [{
                label: 'Number of responses',
                data: dist,
                backgroundColor: '#21808d'
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, precision: 0 }
            }
        }
    });
}

// Display development focus
function renderDevFocusList(list) {
    const ul = $('devFocusList');
    ul.innerHTML = "";
    list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
    });
}

// Render manager comparison table
function renderComparisonTable(managers) {
    const tbody = $('comparisonTable').querySelector('tbody');
    tbody.innerHTML = "";
    managers.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `\
            <td>${m.name}</td>\
            <td>${m.cumulative.overall_effectiveness.toFixed(2)}</td>\
            <td>${m.cumulative.competencies.communication.toFixed(2)}</td>\
            <td>${m.cumulative.competencies.problem_solving.toFixed(2)}</td>\
            <td>${m.cumulative.competencies.field_presence.toFixed(2)}</td>`;
        tbody.appendChild(tr);
    });
}

// Initialize dashboard
function initDashboard() {
    // Populate assessment periods dropdown
    populateDropdown('periodSelect', dashboardData.assessment_periods);

    // Populate managers dropdown
    const managerNames = dashboardData.managers.map(m => m.name);
    populateDropdown('managerSelect', managerNames);

    // Default selections
    $('periodSelect').value = dashboardData.assessment_periods[dashboardData.assessment_periods.length - 1];
    $('managerSelect').value = managerNames[0];

    // Add event listeners
    $('periodSelect').addEventListener('change', updateDashboard);
    $('managerSelect').addEventListener('change', updateDashboard);

    // Initial update
    updateDashboard();
}

function updateDashboard() {
    const period = $('periodSelect').value;
    const managerName = $('managerSelect').value;

    const manager = dashboardData.managers.find(m => m.name === managerName);
    if (!manager) return;

    const currentData = manager.quarterly_data[period];
    if (!currentData) {
        alert("No data for this period and manager.");
        return;
    }

    // Update metrics
    $('totalResponses').textContent = currentData.response_count;
    $('overallEffectiveness').textContent = currentData.overall_effectiveness.toFixed(2);
    $('recommendationScore').textContent = currentData.recommendation_perception ? currentData.improvement_perception.toFixed(2) : "-";
    $('successConfidence').textContent = currentData.success_confidence ? currentData.success_confidence.toFixed(2) : "-";
    $('improvementPerception').textContent = currentData.improvement_perception.toFixed(2);

    // Historical comparison
    const periods = dashboardData.assessment_periods;
    const currentIndex = periods.indexOf(period);
    let prevPeriod = null;
    if (currentIndex > 0) prevPeriod = periods[currentIndex - 1];

    if (prevPeriod && manager.quarterly_data[prevPeriod]) {
        const prevData = manager.quarterly_data[prevPeriod];
        $('prevPeriodScore').textContent = prevData.overall_effectiveness.toFixed(2);
        const change = currentData.overall_effectiveness - prevData.overall_effectiveness;
        $('quarterChange').textContent = (change >= 0 ? "+" : "") + change.toFixed(2);
        $('changeDescription').textContent = change > 0.3 ? "↗ Improvement" : change < -0.3 ? "↘ Decline" : "→ Stable";
    } else {
        $('prevPeriodScore').textContent = "-";
        $('quarterChange').textContent = "-";
        $('changeDescription').textContent = "No previous data";
    }

    $('cumulativeScore').textContent = manager.cumulative.overall_effectiveness.toFixed(2);
    const latestVsCumulative = currentData.overall_effectiveness - manager.cumulative.overall_effectiveness;
    $('latestVsCumulative').textContent = (latestVsCumulative >= 0 ? "+" : "") + latestVsCumulative.toFixed(2);

    // Render competency bars and radar
    renderCompetencyBars('competencyBars', currentData.competencies);
    renderRadarChart(currentData.competencies);

    // Render response distribution bar chart
    renderBarChart(currentData.response_distribution);

    // Development focus
    renderDevFocusList([
        "Communication",
        "Problem Solving",
        "Field Presence",
        "Performance Management",
        "Leadership",
        "Follow Through",
        "Strategic Thinking"
    ]);

    // Comparison table
    renderComparisonTable(dashboardData.managers);
}

window.onload = initDashboard;
