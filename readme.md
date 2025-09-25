# Enhanced Manager Feedback Dashboard - Deployment Guide

## 📋 Overview

This enhanced dashboard provides comprehensive quarterly manager feedback analytics with advanced features including:

- **Real-time Google Sheets Integration**
- **Interactive Competency Radar Charts**  
- **Historical Performance Trends**
- **Manager Comparison Rankings**
- **Development Focus Recommendations**
- **Export Functionality**
- **Responsive Mobile Design**

## 🚀 GitHub Pages Deployment

### Step 1: Create GitHub Repository

1. **Create New Repository**
   - Go to GitHub.com
   - Click "New repository"
   - Name: `manager-feedback-dashboard`
   - Set to Public (for GitHub Pages)
   - Initialize with README

### Step 2: Upload Dashboard Files

1. **Upload the three main files:**
   - `index.html` (main dashboard interface)
   - `styles.css` (modern responsive styling)
   - `dashboard.js` (interactive functionality)

2. **File Organization:**
   ```
   manager-feedback-dashboard/
   ├── index.html
   ├── styles.css  
   ├── dashboard.js
   └── README.md
   ```

### Step 3: Enable GitHub Pages

1. **Repository Settings**
   - Go to your repository
   - Click "Settings" tab
   - Scroll to "Pages" section

2. **Configure Pages**
   - Source: Deploy from a branch
   - Branch: main / master
   - Folder: / (root)
   - Click "Save"

3. **Access Your Dashboard**
   - URL will be: `https://yourusername.github.io/manager-feedback-dashboard`
   - Takes 5-10 minutes for first deployment

## 🔗 Google Sheets Integration Setup

### Step 1: Prepare Your Google Sheet

1. **Sheet Structure Required:**
   - Sheet must match the column names from your PM-Feedback-AY-2025.xlsx
   - Ensure data is in the first sheet or specify sheet name
   - Headers should exactly match the form field names

2. **Important Columns:**
   ```
   - Manager_Name
   - Assessment_Period  
   - H1_Overall_Effectiveness
   - A1_Program_Goals_Communication through A5_Team_Communication
   - B1_Ground_Challenges_Understanding through B5_Obstacle_Removal
   - C1_Field_Visit_Frequency through C5_Field_Visit_Efficiency
   - D1_Performance_Expectations through D5_Mission_Vision_Alignment
   - E1_Team_Motivation through E5_Values_Demonstration
   - F1_Regular_Checkins through F5_Reliability
   - G1_Strategic_Alignment through G5_Cross_Functional_Collaboration
   ```

### Step 2: Publish Sheet as CSV

1. **Open Your Google Sheet**
   - Go to your manager feedback sheet
   - Ensure data is clean and complete

2. **Publish to Web**
   - File → Share → Publish to web
   - Choose the specific sheet tab (e.g., "Form Responses")
   - Format: CSV
   - Click "Publish"
   - Copy the generated URL

3. **URL Format Example:**
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/pub?gid=[GID]&single=true&output=csv
   ```

### Step 3: Configure Dashboard

1. **Edit dashboard.js**
   - Open `dashboard.js` in your repository
   - Find line: `GOOGLE_SHEETS_URL: 'YOUR_PUBLISHED_CSV_URL_HERE',`
   - Replace with your CSV URL:
   ```javascript
   GOOGLE_SHEETS_URL: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/pub?gid=413026993&single=true&output=csv',
   ```

2. **Commit Changes**
   - Save the file
   - Commit changes to repository
   - GitHub Pages will auto-deploy

## ⚙️ Configuration Options

### Manager Names Customization

Update the manager list in `dashboard.js` if needed:

```javascript
// The dashboard will automatically detect managers from your data
// No manual configuration needed - it reads from Manager_Name column
```

### Competency Mappings

The dashboard automatically maps your form fields to competencies:

```javascript
COMPETENCY_MAPPINGS: {
    communication: ['A1_Program_Goals_Communication', 'A2_Program_Updates_Communication', ...],
    problem_solving: ['B1_Ground_Challenges_Understanding', 'B2_Problem_Solving_Effectiveness', ...],
    // ... other competencies
}
```

### Custom Branding

Update branding elements in `index.html`:

```html
<!-- Replace placeholder logo -->
<img src="https://via.placeholder.com/40x40?text=AF" alt="Avanti Fellows" class="brand-logo">

<!-- Update titles -->
<h1>Manager Feedback Dashboard</h1>
<p>Academic Year 2024-25</p>
```

## 🔧 Advanced Features

### Export Functionality

- **CSV Export**: Click "Export Report" button
- **Filtered Data**: Exports data based on current filters
- **Automatic Filename**: Includes date and period

### Responsive Design

- **Mobile Optimized**: Works on phones and tablets
- **Touch Friendly**: Large buttons and touch targets
- **Adaptive Layout**: Reorganizes for different screen sizes

### Real-time Updates

- **Auto Refresh**: Click refresh button to reload data
- **Live Data**: Always shows latest Google Sheets data
- **No Caching**: Bypasses browser cache for fresh data

## 🛠️ Troubleshooting

### Common Issues

1. **"Unable to Load Data" Error**
   - Check Google Sheets URL is correct
   - Ensure sheet is published publicly
   - Verify CSV format is selected
   - Check for CORS issues

2. **Blank Dashboard**
   - Confirm column headers match expected format
   - Check for empty or malformed data
   - Verify JavaScript console for errors

3. **Charts Not Loading**
   - Ensure Chart.js library loads (check internet connection)
   - Verify data format is correct
   - Check browser console for errors

### Data Validation

1. **Required Columns:**
   - Manager_Name: Text
   - Assessment_Period: Format like "Q1-2024"
   - All rating columns: Numbers 1-5
   - H1_Overall_Effectiveness: Number 1-5

2. **Data Quality Checks:**
   ```javascript
   // Dashboard validates:
   // - Non-empty manager names
   // - Valid assessment periods  
   // - Numeric ratings within 1-5 range
   // - Sufficient responses per manager/period
   ```

## 📱 Mobile Optimization

The dashboard is fully responsive:

- **Tablet View**: Side-by-side layout preserved
- **Phone View**: Stacked cards, optimized tables
- **Touch Navigation**: Large buttons, smooth scrolling
- **Readable Text**: Scales appropriately for all screens

## 🔄 Update Process

### Updating Dashboard Code

1. **Edit Files**: Make changes to HTML, CSS, or JS files
2. **Commit**: Push changes to GitHub repository  
3. **Auto Deploy**: GitHub Pages automatically rebuilds
4. **Verify**: Check live site after 2-3 minutes

### Updating Data

1. **Google Forms**: New responses automatically appear
2. **Manual Data**: Edit Google Sheet directly
3. **Refresh**: Click refresh button in dashboard
4. **Real-time**: No code changes needed

## 📊 Dashboard Sections

### 1. Metrics Overview
- Total responses across periods
- Average effectiveness scores
- Top performer identification  
- Improvement rate tracking

### 2. Manager Performance
- Individual manager deep dive
- Competency breakdown with visual bars
- Historical comparison with previous periods
- Development focus recommendations

### 3. Competency Radar
- 7-dimension competency visualization
- Current vs cumulative view toggle
- Interactive hover details
- Color-coded performance levels

### 4. Performance Trends  
- Quarterly progression charts
- Individual manager trend lines
- Improvement/decline identification
- Period-over-period analysis

### 5. Manager Comparison
- Sortable comparison table
- Performance ranking system
- Color-coded score badges
- Search and filter capabilities

### 6. Response Distribution
- Rating distribution charts
- Response pattern analysis
- Quality vs quantity insights
- Trend identification

## 🎯 Key Features Summary

### Enhanced from Previous Version:

1. **Better Visual Design**: Modern, professional interface
2. **Advanced Analytics**: Deeper insights and comparisons  
3. **Mobile Responsive**: Works perfectly on all devices
4. **Real-time Data**: Direct Google Sheets integration
5. **Export Capabilities**: CSV download functionality
6. **Interactive Charts**: Radar, trend, and distribution charts
7. **Search & Filter**: Advanced table functionality
8. **Development Focus**: Automated recommendations
9. **Error Handling**: Robust data validation
10. **Performance Optimized**: Fast loading and smooth interactions

## 🔒 Security & Privacy

### Data Security
- **Read-Only Access**: Dashboard only reads published CSV data
- **No Data Storage**: No user data stored on GitHub Pages
- **Public Dashboard**: Suitable for internal organizational use
- **HTTPS**: Secure connection via GitHub Pages

### Privacy Considerations
- **Anonymous Responses**: Maintains respondent anonymity
- **Aggregated Views**: Shows patterns without individual identification
- **Controlled Access**: Share dashboard URL only with authorized users

## 📞 Support

### Getting Help

1. **GitHub Issues**: Report bugs or feature requests
2. **Documentation**: Refer to this comprehensive guide
3. **Browser Console**: Check for JavaScript errors
4. **Data Validation**: Verify Google Sheets format

### Performance Monitoring

The dashboard includes built-in debugging:

```javascript
// Access debug information in browser console:
window.dashboardDebug.data // View processed data
window.dashboardDebug.loadData() // Manually reload data
```

## 🚀 Going Live

### Final Checklist

- [ ] Google Sheets CSV URL configured
- [ ] Dashboard deployed to GitHub Pages  
- [ ] All managers and periods showing correctly
- [ ] Charts and visualizations working
- [ ] Export functionality tested
- [ ] Mobile responsiveness verified
- [ ] Team access permissions set
- [ ] Data refresh process documented

Your enhanced Manager Feedback Dashboard is now ready for production use!

**Live Dashboard URL**: `https://yourusername.github.io/manager-feedback-dashboard`
