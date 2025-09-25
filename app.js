// Enhanced Manager Feedback Dashboard - JavaScript
// Configuration and Constants
const CONFIG = {
    // Replace with your Google Sheets published CSV URL
    GOOGLE_SHEETS_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR57GyQwEa-SSoSH2bTX64hty8_iw1IJrp0zjMg8xveCQmFDPtPGq9BIL8Jhnx6wOA5z_QLlGZ7pBe/pub?gid=1248584073&single=true&output=csv',
    
    // Competency mappings based on your sheet structure
    COMPETENCY_MAPPINGS: {
        communication: ['A1_Program_Goals_Communication', 'A2_Program_Updates_Communication', 'A3_Task_Clarity', 'A4_Listening_Effectiveness', 'A5_Team_Communication'],
        problem_solving: ['B1_Ground_Challenges_Understanding', 'B2_Problem_Solving_Effectiveness', 'B3_Response_Time', 'B4_Conflict_Handling', 'B5_Obstacle_Removal'],
        field_presence: ['C1_Field_Visit_Frequency', 'C2_School_Administration_Collaboration', 'C3_School_Context_Understanding', 'C4_Student_Interaction', 'C5_Field_Visit_Efficiency'],
        performance_mgmt: ['D1_Performance_Expectations', 'D2_Feedback_Frequency', 'D3_Recognition_Appreciation', 'D4_Professional_Development_Support', 'D5_Mission_Vision_Alignment'],
        leadership: ['E1_Team_Motivation', 'E2_Delegation_Empowerment', 'E3_Decision_Making', 'E4_Inclusive_Environment', 'E5_Values_Demonstration'],
        follow_through: ['F1_Regular_Checkins', 'F2_Follow_Through', 'F3_Task_Verification', 'F4_Adaptability', 'F5_Reliability'],
        strategic_thinking: ['G1_Strategic_Alignment', 'G2_Strategic_Balance', 'G3_Data_Driven_Decisions', 'G4_Challenge_Anticipation', 'G5_Cross_Functional_Collaboration']
    },
    
    COMPETENCY_LABELS: {
        communication: 'Communication & Information',
        problem_solving: 'Problem-Solving & Support',
        field_presence: 'Field Presence & Engagement',
        performance_mgmt: 'Performance Management',
        leadership: 'Leadership & Team Management',
        follow_through: 'Check-ins & Follow-through',
        strategic_thinking: 'Strategic Thinking'
    },
    
    CHART_COLORS: {
        primary: '#1e40af',
        secondary: '#059669',
        accent: '#f59e0b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    }
};

// Global state
let dashboardData = {
    rawData: [],
    processedData: {},
    currentPeriod: '',
    currentManager: '',
    periods: [],
    managers: []
};

let charts = {};

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const formatScore = (score) => {
    if (score === null || score === undefined || isNaN(score)) return '--';
    return Number(score).toFixed(2);
};

const getScoreClass = (score) => {
    if (score >= 4.5) return 'excellent';
    if (score >= 3.5) return 'good';
    if (score >= 2.5) return 'average';
    return 'poor';
};

const showLoading = () => {
    $('#loadingOverlay').classList.remove('hidden');
};

const hideLoading = () => {
    $('#loadingOverlay').classList.add('hidden');
};

const showError = () => {
    $('#loadingOverlay').classList.add('hidden');
    $('#errorMessage').classList.remove('hidden');
};

const hideError = () => {
    $('#errorMessage').classList.add('hidden');
};

// Data loading and processing
async function loadData() {
    showLoading();
    
    try {
        // Check if URL is configured
        if (CONFIG.GOOGLE_SHEETS_URL === 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR57GyQwEa-SSoSH2bTX64hty8_iw1IJrp0zjMg8xveCQmFDPtPGq9BIL8Jhnx6wOA5z_QLlGZ7pBe/pub?gid=1248584073&single=true&output=csv') {
            throw new Error('Google Sheets URL not configured');
        }
        
        const response = await fetch(CONFIG.https://docs.google.com/spreadsheets/d/e/2PACX-1vTR57GyQwEa-SSoSH2bTX64hty8_iw1IJrp0zjMg8xveCQmFDPtPGq9BIL8Jhnx6wOA5z_QLlGZ7pBe/pub?gid=1248584073&single=true&output=csv);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const results = Papa.parse(csvText, { 
            header: true, 
            skipEmptyLines: true,
            transformHeader: (header) => header.trim()
        });
        
        if (results.errors.length > 0) {
            console.warn('CSV parsing errors:', results.errors);
        }
        
        dashboardData.rawData = results.data;
        processData();
        initializeUI();
        updateDashboard();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading data:', error);
        showError();
    }
}

function processData() {
    const data = dashboardData.rawData;
    
    // Extract unique periods and managers
    dashboardData.periods = [...new Set(data.map(row => row.Assessment_Period))].filter(p => p).sort();
    dashboardData.managers = [...new Set(data.map(row => row.Manager_Name))].filter(m => m).sort();
    
    // Process data by manager and period
    dashboardData.processedData = {};
    
    dashboardData.managers.forEach(manager => {
        dashboardData.processedData[manager] = {};
        
        dashboardData.periods.forEach(period => {
            const periodData = data.filter(row => 
                row.Manager_Name === manager && row.Assessment_Period === period
            );
            
            if (periodData.length > 0) {
                dashboardData.processedData[manager][period] = calculateMetrics(periodData);
            }
        });
        
        // Calculate cumulative data
        const allManagerData = data.filter(row => row.Manager_Name === manager);
        if (allManagerData.length > 0) {
            dashboardData.processedData[manager]['cumulative'] = calculateMetrics(allManagerData);
        }
    });
}

function calculateMetrics(data) {
    const metrics = {
        responseCount: data.length,
        overallEffectiveness: 0,
        recommendationLikelihood: 0,
        successConfidence: 0,
        improvementPerception: 0,
        competencies: {},
        responseDistribution: [0, 0, 0, 0, 0],
        textFeedback: {
            strengths: [],
            improvements: [],
            additionalComments: []
        }
    };
    
    // Calculate overall scores
    let overallSum = 0, recSum = 0, successSum = 0, improvSum = 0;
    let overallCount = 0, recCount = 0, successCount = 0, improvCount = 0;
    
    data.forEach(row => {
        // Overall effectiveness
        if (row.H1_Overall_Effectiveness && !isNaN(parseFloat(row.H1_Overall_Effectiveness))) {
            overallSum += parseFloat(row.H1_Overall_Effectiveness);
            overallCount++;
            
            // Response distribution
            const score = Math.round(parseFloat(row.H1_Overall_Effectiveness));
            if (score >= 1 && score <= 5) {
                metrics.responseDistribution[score - 1]++;
            }
        }
        
        // Recommendation likelihood
        if (row.H2_Recommendation_Likelihood && !isNaN(parseFloat(row.H2_Recommendation_Likelihood))) {
            recSum += parseFloat(row.H2_Recommendation_Likelihood);
            recCount++;
        }
        
        // Success confidence
        if (row.H3_Success_Confidence && !isNaN(parseFloat(row.H3_Success_Confidence))) {
            successSum += parseFloat(row.H3_Success_Confidence);
            successCount++;
        }
        
        // Improvement perception
        if (row.Manager_Improvement_Since_Last_Assessment && !isNaN(parseFloat(row.Manager_Improvement_Since_Last_Assessment))) {
            improvSum += parseFloat(row.Manager_Improvement_Since_Last_Assessment);
            improvCount++;
        }
        
        // Collect text feedback
        if (row.Manager_Strengths && row.Manager_Strengths.trim()) {
            metrics.textFeedback.strengths.push(row.Manager_Strengths.trim());
        }
        if (row.Improvement_Areas && row.Improvement_Areas.trim()) {
            metrics.textFeedback.improvements.push(row.Improvement_Areas.trim());
        }
        if (row.Additional_Comments && row.Additional_Comments.trim()) {
            metrics.textFeedback.additionalComments.push(row.Additional_Comments.trim());
        }
    });
    
    // Calculate averages
    metrics.overallEffectiveness = overallCount ? overallSum / overallCount : 0;
    metrics.recommendationLikelihood = recCount ? recSum / recCount : 0;
    metrics.successConfidence = successCount ? successSum / successCount : 0;
    metrics.improvementPerception = improvCount ? improvSum / improvCount : 0;
    
    // Calculate competency scores
    Object.keys(CONFIG.COMPETENCY_MAPPINGS).forEach(competency => {
        const fields = CONFIG.COMPETENCY_MAPPINGS[competency];
        let sum = 0, count = 0;
        
        data.forEach(row => {
            fields.forEach(field => {
                if (row[field] && !isNaN(parseFloat(row[field]))) {
                    sum += parseFloat(row[field]);
                    count++;
                }
            });
        });
        
        metrics.competencies[competency] = count ? sum / count : 0;
    });
    
    return metrics;
}

// UI Initialization
function initializeUI() {
    // Populate period dropdown
    const periodSelect = $('#periodSelect');
    periodSelect.innerHTML = '<option value="">All Periods</option>';
    dashboardData.periods.forEach(period => {
        const option = document.createElement('option');
        option.value = period;
        option.textContent = period;
        periodSelect.appendChild(option);
    });
    
    // Set default to latest period
    if (dashboardData.periods.length > 0) {
        dashboardData.currentPeriod = dashboardData.periods[dashboardData.periods.length - 1];
        periodSelect.value = dashboardData.currentPeriod;
    }
    
    // Populate manager dropdown
    const managerSelect = $('#managerSelect');
    managerSelect.innerHTML = '<option value="">All Managers</option>';
    dashboardData.managers.forEach(manager => {
        const option = document.createElement('option');
        option.value = manager;
        option.textContent = manager;
        managerSelect.appendChild(option);
    });
    
    // Add event listeners
    periodSelect.addEventListener('change', (e) => {
        dashboardData.currentPeriod = e.target.value;
        updateDashboard();
    });
    
    managerSelect.addEventListener('change', (e) => {
        dashboardData.currentManager = e.target.value;
        updateDashboard();
    });
    
    $('#refreshData').addEventListener('click', loadData);
    $('#retryBtn').addEventListener('click', () => {
        hideError();
        loadData();
    });
    
    $('#exportBtn').addEventListener('click', exportReport);
    
    // Search functionality
    $('#searchManagers').addEventListener('input', (e) => {
        filterManagerTable(e.target.value);
    });
    
    // Sort functionality
    $('#sortBy').addEventListener('change', (e) => {
        sortManagerTable(e.target.value);
    });
}

// Dashboard updates
function updateDashboard() {
    updateMetricsOverview();
    updateManagerPerformance();
    updateCompetencyRadar();
    updateTrendsChart();
    updateManagerComparison();
    updateResponseDistribution();
    updateDevelopmentFocus();
}

function updateMetricsOverview() {
    const period = dashboardData.currentPeriod;
    const manager = dashboardData.currentManager;
    
    let totalResponses = 0;
    let totalEffectiveness = 0;
    let managerCount = 0;
    let topPerformer = { name: '--', score: 0 };
    let improvementCount = 0;
    
    dashboardData.managers.forEach(mgr => {
        const data = manager ? 
            (manager === mgr ? dashboardData.processedData[mgr] : null) :
            dashboardData.processedData[mgr];
        
        if (!data) return;
        
        const metrics = period && data[period] ? data[period] : data['cumulative'];
        if (!metrics) return;
        
        totalResponses += metrics.responseCount;
        totalEffectiveness += metrics.overallEffectiveness;
        managerCount++;
        
        if (metrics.overallEffectiveness > topPerformer.score) {
            topPerformer = { name: mgr, score: metrics.overallEffectiveness };
        }
        
        if (metrics.improvementPerception > 3) {
            improvementCount++;
        }
    });
    
    const avgEffectiveness = managerCount ? totalEffectiveness / managerCount : 0;
    const improvementRate = managerCount ? (improvementCount / managerCount) * 100 : 0;
    
    $('#totalResponses').textContent = totalResponses.toLocaleString();
    $('#avgEffectiveness').textContent = formatScore(avgEffectiveness);
    $('#topPerformer').textContent = topPerformer.name;
    $('#topPerformerScore').textContent = formatScore(topPerformer.score);
    $('#improvementRate').textContent = `${Math.round(improvementRate)}%`;
    
    // Update change indicators (simplified for now)
    $('#responseChange').textContent = period ? 'vs Previous' : 'All Time';
    $('#effectivenessChange').textContent = `Avg: ${formatScore(avgEffectiveness)}`;
    $('#improvementChange').textContent = `${improvementCount} managers`;
}

function updateManagerPerformance() {
    const period = dashboardData.currentPeriod;
    const manager = dashboardData.currentManager;
    
    if (manager) {
        const data = dashboardData.processedData[manager];
        if (!data) return;
        
        const metrics = period && data[period] ? data[period] : data['cumulative'];
        if (!metrics) return;
        
        $('#selectedManagerName').textContent = manager;
        $('#currentPeriod').textContent = period || 'All Periods';
        $('#managerResponses').textContent = metrics.responseCount;
        $('#overallScore').textContent = formatScore(metrics.overallEffectiveness);
        
        // Update competency bars
        updateCompetencyBars(metrics.competencies);
        
        // Show historical section
        $('#historicalSection').style.display = 'block';
        updateHistoricalComparison(manager, period);
        
    } else {
        $('#selectedManagerName').textContent = 'All Managers Overview';
        $('#currentPeriod').textContent = period || 'All Periods';
        $('#managerResponses').textContent = '--';
        $('#overallScore').textContent = '--';
        
        // Hide historical section
        $('#historicalSection').style.display = 'none';
        
        // Show average competencies
        const avgCompetencies = calculateAverageCompetencies(period);
        updateCompetencyBars(avgCompetencies);
    }
}

function calculateAverageCompetencies(period) {
    const avgCompetencies = {};
    const competencyKeys = Object.keys(CONFIG.COMPETENCY_MAPPINGS);
    
    competencyKeys.forEach(key => {
        let sum = 0, count = 0;
        
        dashboardData.managers.forEach(manager => {
            const data = dashboardData.processedData[manager];
            if (!data) return;
            
            const metrics = period && data[period] ? data[period] : data['cumulative'];
            if (!metrics) return;
            
            if (metrics.competencies[key] > 0) {
                sum += metrics.competencies[key];
                count++;
            }
        });
        
        avgCompetencies[key] = count ? sum / count : 0;
    });
    
    return avgCompetencies;
}

function updateCompetencyBars(competencies) {
    const container = $('#competencyBars');
    container.innerHTML = '';
    
    Object.keys(CONFIG.COMPETENCY_LABELS).forEach(key => {
        const score = competencies[key] || 0;
        const percentage = (score / 5) * 100;
        
        const barElement = document.createElement('div');
        barElement.className = 'competency-bar';
        barElement.innerHTML = `
            <div class="competency-label">
                <span>${CONFIG.COMPETENCY_LABELS[key]}</span>
                <span class="competency-score">${formatScore(score)}</span>
            </div>
            <div class="competency-progress">
                <div class="competency-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        
        container.appendChild(barElement);
    });
}

function updateHistoricalComparison(manager, currentPeriod) {
    const data = dashboardData.processedData[manager];
    if (!data) return;
    
    const currentMetrics = currentPeriod && data[currentPeriod] ? data[currentPeriod] : data['cumulative'];
    const cumulativeMetrics = data['cumulative'];
    
    // Find previous period
    let prevPeriodScore = '--';
    let periodChange = '--';
    
    if (currentPeriod) {
        const periodIndex = dashboardData.periods.indexOf(currentPeriod);
        if (periodIndex > 0) {
            const prevPeriod = dashboardData.periods[periodIndex - 1];
            const prevMetrics = data[prevPeriod];
            
            if (prevMetrics) {
                prevPeriodScore = formatScore(prevMetrics.overallEffectiveness);
                const change = currentMetrics.overallEffectiveness - prevMetrics.overallEffectiveness;
                periodChange = (change >= 0 ? '+' : '') + formatScore(change);
            }
        }
    }
    
    $('#prevPeriodScore').textContent = prevPeriodScore;
    $('#periodChange').textContent = periodChange;
    $('#cumulativeScore').textContent = formatScore(cumulativeMetrics.overallEffectiveness);
    
    // Add CSS classes for positive/negative changes
    const changeElement = $('#periodChange');
    changeElement.className = 'comparison-value';
    if (periodChange !== '--') {
        if (periodChange.startsWith('+')) {
            changeElement.classList.add('positive');
        } else if (periodChange.startsWith('-')) {
            changeElement.classList.add('negative');
        }
    }
}

function updateCompetencyRadar() {
    const ctx = $('#competencyRadar').getContext('2d');
    const period = dashboardData.currentPeriod;
    const manager = dashboardData.currentManager;
    
    let competencies;
    if (manager) {
        const data = dashboardData.processedData[manager];
        if (!data) return;
        
        const metrics = period && data[period] ? data[period] : data['cumulative'];
        if (!metrics) return;
        
        competencies = metrics.competencies;
    } else {
        competencies = calculateAverageCompetencies(period);
    }
    
    const labels = Object.values(CONFIG.COMPETENCY_LABELS);
    const values = Object.keys(CONFIG.COMPETENCY_LABELS).map(key => competencies[key] || 0);
    
    if (charts.radar) {
        charts.radar.destroy();
    }
    
    charts.radar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: manager || 'Average',
                data: values,
                fill: true,
                backgroundColor: CONFIG.CHART_COLORS.primary + '20',
                borderColor: CONFIG.CHART_COLORS.primary,
                pointBackgroundColor: CONFIG.CHART_COLORS.primary,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: CONFIG.CHART_COLORS.primary,
                borderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    min: 0,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: '#e5e7eb'
                    },
                    angleLines: {
                        color: '#d1d5db'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateTrendsChart() {
    const ctx = $('#trendsChart').getContext('2d');
    const manager = dashboardData.currentManager;
    
    if (!manager) {
        if (charts.trends) {
            charts.trends.destroy();
        }
        return;
    }
    
    const data = dashboardData.processedData[manager];
    if (!data) return;
    
    const trendData = dashboardData.periods.map(period => {
        const metrics = data[period];
        return {
            x: period,
            y: metrics ? metrics.overallEffectiveness : null
        };
    }).filter(point => point.y !== null);
    
    if (charts.trends) {
        charts.trends.destroy();
    }
    
    charts.trends = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Overall Effectiveness',
                data: trendData,
                fill: false,
                borderColor: CONFIG.CHART_COLORS.primary,
                backgroundColor: CONFIG.CHART_COLORS.primary,
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 0.5
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateManagerComparison() {
    const tbody = $('#comparisonTableBody');
    tbody.innerHTML = '';
    
    const period = dashboardData.currentPeriod;
    const comparisonData = [];
    
    dashboardData.managers.forEach(manager => {
        const data = dashboardData.processedData[manager];
        if (!data) return;
        
        const metrics = period && data[period] ? data[period] : data['cumulative'];
        if (!metrics) return;
        
        comparisonData.push({
            manager,
            metrics,
            overallScore: metrics.overallEffectiveness
        });
    });
    
    // Sort by overall score
    comparisonData.sort((a, b) => b.overallScore - a.overallScore);
    
    comparisonData.forEach((item, index) => {
        const row = document.createElement('tr');
        const scoreClass = getScoreClass(item.overallScore);
        
        row.innerHTML = `
            <td class="manager-col">${item.manager}</td>
            <td class="score-col">
                <div class="score-badge score-${scoreClass}">${formatScore(item.overallScore)}</div>
            </td>
            <td class="score-col">${formatScore(item.metrics.competencies.communication)}</td>
            <td class="score-col">${formatScore(item.metrics.competencies.problem_solving)}</td>
            <td class="score-col">${formatScore(item.metrics.competencies.field_presence)}</td>
            <td class="score-col">${formatScore(item.metrics.competencies.performance_mgmt)}</td>
            <td class="score-col">${formatScore(item.metrics.competencies.leadership)}</td>
            <td class="score-col">${formatScore(item.metrics.competencies.follow_through)}</td>
            <td class="score-col">${formatScore(item.metrics.competencies.strategic_thinking)}</td>
            <td class="responses-col">${item.metrics.responseCount}</td>
            <td class="rank-col">
                <div class="rank-badge">${index + 1}</div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function updateResponseDistribution() {
    const ctx = $('#distributionChart').getContext('2d');
    const period = dashboardData.currentPeriod;
    const manager = dashboardData.currentManager;
    
    let distribution = [0, 0, 0, 0, 0];
    
    if (manager) {
        const data = dashboardData.processedData[manager];
        if (data) {
            const metrics = period && data[period] ? data[period] : data['cumulative'];
            if (metrics) {
                distribution = metrics.responseDistribution;
            }
        }
    } else {
        // Aggregate distribution across all managers
        dashboardData.managers.forEach(mgr => {
            const data = dashboardData.processedData[mgr];
            if (!data) return;
            
            const metrics = period && data[period] ? data[period] : data['cumulative'];
            if (!metrics) return;
            
            metrics.responseDistribution.forEach((count, index) => {
                distribution[index] += count;
            });
        });
    }
    
    if (charts.distribution) {
        charts.distribution.destroy();
    }
    
    charts.distribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Number of Responses',
                data: distribution,
                backgroundColor: [
                    CONFIG.CHART_COLORS.danger,
                    '#ff9800',
                    CONFIG.CHART_COLORS.warning,
                    CONFIG.CHART_COLORS.accent,
                    CONFIG.CHART_COLORS.success
                ],
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateDevelopmentFocus() {
    const period = dashboardData.currentPeriod;
    const manager = dashboardData.currentManager;
    
    let competencies;
    if (manager) {
        const data = dashboardData.processedData[manager];
        if (!data) return;
        
        const metrics = period && data[period] ? data[period] : data['cumulative'];
        if (!metrics) return;
        
        competencies = metrics.competencies;
    } else {
        competencies = calculateAverageCompetencies(period);
    }
    
    // Sort competencies by score to identify lowest performing areas
    const sortedCompetencies = Object.entries(competencies)
        .sort(([,a], [,b]) => a - b)
        .slice(0, 3);
    
    const topPriorityList = $('#topPriorityList');
    topPriorityList.innerHTML = '';
    
    sortedCompetencies.forEach(([key, score]) => {
        const li = document.createElement('li');
        li.textContent = `${CONFIG.COMPETENCY_LABELS[key]} (${formatScore(score)})`;
        topPriorityList.appendChild(li);
    });
    
    // Quick wins (areas just below good threshold)
    const quickWins = Object.entries(competencies)
        .filter(([,score]) => score >= 3.0 && score < 3.5)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    const quickWinsList = $('#quickWinsList');
    quickWinsList.innerHTML = '';
    
    if (quickWins.length > 0) {
        quickWins.forEach(([key, score]) => {
            const li = document.createElement('li');
            li.textContent = `${CONFIG.COMPETENCY_LABELS[key]} (${formatScore(score)})`;
            quickWinsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No quick wins identified';
        quickWinsList.appendChild(li);
    }
}

// Table filtering and sorting
function filterManagerTable(searchTerm) {
    const rows = $$('#comparisonTableBody tr');
    
    rows.forEach(row => {
        const managerName = row.querySelector('.manager-col').textContent.toLowerCase();
        const matches = managerName.includes(searchTerm.toLowerCase());
        row.style.display = matches ? '' : 'none';
    });
}

function sortManagerTable(sortBy) {
    const tbody = $('#comparisonTableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'overall':
                aValue = parseFloat(a.querySelector('.score-col .score-badge').textContent);
                bValue = parseFloat(b.querySelector('.score-col .score-badge').textContent);
                break;
            case 'communication':
                aValue = parseFloat(a.querySelectorAll('.score-col')[1].textContent);
                bValue = parseFloat(b.querySelectorAll('.score-col')[1].textContent);
                break;
            case 'problem_solving':
                aValue = parseFloat(a.querySelectorAll('.score-col')[2].textContent);
                bValue = parseFloat(b.querySelectorAll('.score-col')[2].textContent);
                break;
            case 'field_presence':
                aValue = parseFloat(a.querySelectorAll('.score-col')[3].textContent);
                bValue = parseFloat(b.querySelectorAll('.score-col')[3].textContent);
                break;
            default:
                return 0;
        }
        
        return bValue - aValue; // Descending order
    });
    
    tbody.innerHTML = '';
    rows.forEach((row, index) => {
        // Update rank
        row.querySelector('.rank-badge').textContent = index + 1;
        tbody.appendChild(row);
    });
}

// Export functionality
function exportReport() {
    const period = dashboardData.currentPeriod || 'All_Periods';
    const manager = dashboardData.currentManager || 'All_Managers';
    
    // Create a simple CSV export
    let csvContent = 'Manager,Period,Overall_Score,Communication,Problem_Solving,Field_Presence,Performance_Mgmt,Leadership,Follow_Through,Strategic_Thinking,Responses\n';
    
    dashboardData.managers.forEach(mgr => {
        const data = dashboardData.processedData[mgr];
        if (!data) return;
        
        const metrics = dashboardData.currentPeriod && data[dashboardData.currentPeriod] ? 
            data[dashboardData.currentPeriod] : data['cumulative'];
        if (!metrics) return;
        
        csvContent += [
            mgr,
            dashboardData.currentPeriod || 'Cumulative',
            formatScore(metrics.overallEffectiveness),
            formatScore(metrics.competencies.communication),
            formatScore(metrics.competencies.problem_solving),
            formatScore(metrics.competencies.field_presence),
            formatScore(metrics.competencies.performance_mgmt),
            formatScore(metrics.competencies.leadership),
            formatScore(metrics.competencies.follow_through),
            formatScore(metrics.competencies.strategic_thinking),
            metrics.responseCount
        ].join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manager_Feedback_Report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add notice about configuration if URL not set
    if (CONFIG.GOOGLE_SHEETS_URL === 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR57GyQwEa-SSoSH2bTX64hty8_iw1IJrp0zjMg8xveCQmFDPtPGq9BIL8Jhnx6wOA5z_QLlGZ7pBe/pub?gid=1248584073&single=true&output=csv') {
        const notice = document.createElement('div');
        notice.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #f59e0b; color: white; padding: 10px; text-align: center; z-index: 1001;';
        notice.innerHTML = '<strong>Configuration Required:</strong> Please update the GOOGLE_SHEETS_URL in dashboard.js with your published Google Sheets CSV URL.';
        document.body.appendChild(notice);
    }
    
    loadData();
});

// Make functions globally available for debugging
window.dashboardDebug = {
    data: dashboardData,
    loadData,
    processData,
    updateDashboard
};
