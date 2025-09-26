// Adjust GOOGLE_SHEETS_URL to your published CSV URL
const CONFIG = {
    GOOGLE_SHEETS_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVxiI0tQx98bOCJL8y-HsYlXvJY_cr9ISI9sqvx7j8064hfRQ3TkyeQlLBLH3FLZDK8f_32zT3IMYM/pub?gid=1591627104&single=true&output=csv',
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
        primary: '#1e40af'
    }
};

let dashboardData = { rawData: [], processedData: {}, currentPeriod: '', currentManager: '', periods: [], managers: [] };
let charts = {};

const $ = sel => document.querySelector(sel);

function showLoading() { $('#loadingOverlay').classList.remove('hidden'); }
function hideLoading() { $('#loadingOverlay').classList.add('hidden'); }
function showError() { hideLoading(); $('#errorMessage').classList.remove('hidden'); }
function hideError() { $('#errorMessage').classList.add('hidden'); }

async function loadData() {
    showLoading();
    try {
        if (CONFIG.GOOGLE_SHEETS_URL === 'YOUR_PUBLISHED_CSV_URL_HERE')
            throw new Error('Google Sheets URL not configured');
        const resp = await fetch(CONFIG.GOOGLE_SHEETS_URL);
        if (!resp.ok) throw new Error(resp.status);
        const csvText = await resp.text();
        const results = Papa.parse(csvText, { header: true, skipEmptyLines: true, transformHeader: h=>h.trim() });
        dashboardData.rawData = results.data;
        processData();
        initializeUI();
        updateDashboard();
        hideLoading();
    } catch(e) { showError(); }
}

function processData() {
    const data = dashboardData.rawData;
    dashboardData.periods = [...new Set(data.map(r=>r.Assessment_Period))].filter(Boolean).sort();
    dashboardData.managers = [...new Set(data.map(r=>r.Manager_Name))].filter(Boolean).sort();
    dashboardData.processedData = {};
    dashboardData.managers.forEach(manager => {
        dashboardData.processedData[manager] = {};
        dashboardData.periods.forEach(period => {
            const pd = data.filter(row => row.Manager_Name === manager && row.Assessment_Period === period);
            if (pd.length > 0) dashboardData.processedData[manager][period] = calculateMetrics(pd);
        });
        const allMgrData = data.filter(row => row.Manager_Name === manager);
        if (allMgrData.length) dashboardData.processedData[manager]['cumulative'] = calculateMetrics(allMgrData);
    });
}

function calculateMetrics(data) {
    const metrics = {
        responseCount: data.length, overallEffectiveness: 0,
        competencies: {}, responseDistribution: [0,0,0,0,0]
    }, sums = {};
    let overallSum = 0, overallCount = 0;
    data.forEach(row => {
        if (row.H1_Overall_Effectiveness && !isNaN(+row.H1_Overall_Effectiveness)) {
            overallSum += +row.H1_Overall_Effectiveness; overallCount++;
            const score = Math.round(+row.H1_Overall_Effectiveness);
            if (score>=1 && score<=5) metrics.responseDistribution[score-1]++;
        }
    });
    metrics.overallEffectiveness = overallCount ? overallSum / overallCount : 0;
    Object.keys(CONFIG.COMPETENCY_MAPPINGS).forEach(key => {
        let sum=0,ct=0;
        data.forEach(row => {
            CONFIG.COMPETENCY_MAPPINGS[key].forEach(field=>{
                if(row[field] && !isNaN(+row[field])) { sum+=+row[field]; ct++; }
            });
        });
        metrics.competencies[key] = ct ? sum / ct : 0;
    });
    return metrics;
}

function initializeUI() {
    // Period Select
    const periodSelect = $('#periodSelect');
    periodSelect.innerHTML = '';
    dashboardData.periods.forEach(period=>{
        let option = document.createElement('option');
        option.value = period; option.textContent = period;
        periodSelect.appendChild(option);
    });
    periodSelect.value = dashboardData.currentPeriod = dashboardData.periods[dashboardData.periods.length-1];
    periodSelect.addEventListener('change',e=>{
        dashboardData.currentPeriod = e.target.value;
        updateDashboard();
    });
    // Initial manager
    dashboardData.currentManager = dashboardData.managers[0];
    // Individual View default
    renderManagerSection(dashboardData.currentManager, dashboardData.currentPeriod);
    // Tab setup
    setupTabs();

    // Comparison Multi-Select
    populateMultiManagerSelect();
    document.getElementById('compareBtn').addEventListener('click', ()=>{
        renderComparisonTable_selected();
        renderManagerComparisonBarChart_selected();
    });
}

function updateDashboard() {
    // Individual tab always loads first manager (or update handler for manager select if added)
    renderManagerSection(dashboardData.currentManager, dashboardData.currentPeriod);
}

function renderManagerSection(manager, period) {
    const data = dashboardData.processedData[manager];
    if (!data) return;
    const metrics = period && data[period] ? data[period] : data['cumulative'];
    $('#managerResponses').textContent = metrics.responseCount;
    $('#overallScore').textContent = metrics.overallEffectiveness.toFixed(2);
    renderCompetencyBars(metrics.competencies);
    renderRadarChart(metrics.competencies, manager);
}

function renderCompetencyBars(competencies) {
    const container = document.getElementById('competencyBars');
    container.innerHTML = '';
    Object.keys(CONFIG.COMPETENCY_LABELS).forEach(key => {
        const score = competencies[key] || 0;
        const barDiv = document.createElement('div');
        barDiv.style.margin = '8px 0';
        barDiv.innerHTML = `
          <div style="display:flex;justify-content:space-between;">
            <span>${CONFIG.COMPETENCY_LABELS[key]}</span>
            <span style="font-weight:700">${score.toFixed(2)}</span>
          </div>
          <div style="background:#e5e7eb; border-radius:4px;height:10px;width:100%;">
            <div style="width:${(score/5)*100}%;background:#1e40af;height:10px;border-radius:4px"></div>
          </div>
        `;
        container.appendChild(barDiv);
    });
}

function renderRadarChart(competencies, manager) {
    const ctx = document.getElementById('competencyRadar').getContext('2d');
    const labels = Object.values(CONFIG.COMPETENCY_LABELS);
    const values = Object.keys(CONFIG.COMPETENCY_LABELS).map(k=>competencies[k]||0);
    if (charts.radar) charts.radar.destroy();
    charts.radar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [{
                label: manager,
                data: values,
                fill: true, backgroundColor:'#3b82f625',
                borderColor:'#3b82f6', pointBackgroundColor:'#3b82f6'
            }]
        },
        options: {
            responsive:true, plugins:{legend:{display:false}},
            scales:{r:{beginAtZero:true,min:0,max:5,ticks:{stepSize:1}}}
        }
    });
}

// ==== Manager Comparison Tab Functions ===
function setupTabs(){
    document.getElementById('tabIndividualBtn').addEventListener('click', function() {
        document.getElementById('tabIndividual').style.display = 'block';
        document.getElementById('tabComparison').style.display = 'none';
        this.classList.add('active');
        document.getElementById('tabComparisonBtn').classList.remove('active');
    });
    document.getElementById('tabComparisonBtn').addEventListener('click', function() {
        document.getElementById('tabIndividual').style.display = 'none';
        document.getElementById('tabComparison').style.display = 'block';
        this.classList.add('active');
        document.getElementById('tabIndividualBtn').classList.remove('active');
        renderComparisonSection();
    });
}
function populateMultiManagerSelect() {
    const sel = document.getElementById('multiManagerSelect');
    sel.innerHTML = '';
    dashboardData.managers.forEach(mgr => {
        let opt = document.createElement('option');
        opt.value = mgr;
        opt.textContent = mgr;
        sel.appendChild(opt);
    });
}
function renderComparisonSection() {
    renderComparisonTable_selected();
    renderManagerComparisonBarChart_selected();
}
function renderComparisonTable_selected() {
    const sel = document.getElementById('multiManagerSelect');
    const selectedManagers = Array.from(sel.selectedOptions).map(opt => opt.value);
    const period = dashboardData.currentPeriod;
    let tableHtml = `
      <thead>
        <tr>
          <th>Manager</th><th>Overall</th>
          <th>Communication</th><th>Problem-Solving</th>
          <th>Field Presence</th><th>Responses</th>
        </tr>
      </thead><tbody>`;
    (selectedManagers.length?selectedManagers:dashboardData.managers).forEach(mgr =>{
        const data = dashboardData.processedData[mgr];
        if(!data) return;
        const metrics = period && data[period]?data[period]:data['cumulative'];
        if(!metrics) return;
        tableHtml += `<tr>
          <td>${mgr}</td>
          <td>${metrics.overallEffectiveness.toFixed(2)}</td>
          <td>${metrics.competencies.communication.toFixed(2)}</td>
          <td>${metrics.competencies.problem_solving.toFixed(2)}</td>
          <td>${metrics.competencies.field_presence.toFixed(2)}</td>
          <td>${metrics.responseCount}</td>
        </tr>`;
    });
    tableHtml += '</tbody>';
    document.getElementById('comparisonTable').innerHTML = tableHtml;
}
function renderManagerComparisonBarChart_selected() {
    const ctx = document.getElementById('managersBarChart').getContext('2d');
    const sel = document.getElementById('multiManagerSelect');
    const selectedManagers = Array.from(sel.selectedOptions).map(opt => opt.value);
    const period = dashboardData.currentPeriod;
    const dataPoints = [];
    (selectedManagers.length?selectedManagers:dashboardData.managers).forEach(mgr=>{
        const data = dashboardData.processedData[mgr];
        if(!data) return;
        const metrics = period && data[period]?data[period]:data['cumulative'];
        if(!metrics) return;
        dataPoints.push({manager:mgr,score:metrics.overallEffectiveness});
    });
    dataPoints.sort((a,b)=>b.score - a.score);
    if(window.managersBarChartInstance) window.managersBarChartInstance.destroy();
    window.managersBarChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dataPoints.map(p => p.manager),
            datasets: [{
                label: 'Overall Effectiveness',
                data: dataPoints.map(p => p.score),
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            indexAxis: 'y',responsive:true,
            plugins: { legend: { display: false }},
            scales: { x: { min: 0, max: 5, beginAtZero: true} }
        }
    });
}

document.addEventListener('DOMContentLoaded', ()=>{ loadData(); });
