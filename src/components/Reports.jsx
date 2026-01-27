// src/components/Reports.jsx - MODERN REPORTS COMPONENT
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Target,
  ChevronDown,
  Eye
} from 'lucide-react';
import './Reports.css';

function Reports() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [activeChart, setActiveChart] = useState('hours');

  // Mock data - Replace with actual API calls
  const reportData = {
    summary: {
      totalEntries: 124,
      totalHours: 320,
      avgHoursPerDay: 6.5,
      completionRate: 88,
      pendingTasks: 12,
      completedTasks: 112
    },
    weeklyHours: [
      { day: 'Mon', hours: 6.5, entries: 4 },
      { day: 'Tue', hours: 7.2, entries: 5 },
      { day: 'Wed', hours: 8.0, entries: 6 },
      { day: 'Thu', hours: 5.5, entries: 3 },
      { day: 'Fri', hours: 6.8, entries: 5 },
      { day: 'Sat', hours: 4.0, entries: 2 },
      { day: 'Sun', hours: 2.5, entries: 1 }
    ],
    monthlyTrends: [
      { month: 'Jan', hours: 280, entries: 110 },
      { month: 'Feb', hours: 310, entries: 124 },
      { month: 'Mar', hours: 320, entries: 128 },
      { month: 'Apr', hours: 295, entries: 118 },
      { month: 'May', hours: 335, entries: 134 },
      { month: 'Jun', hours: 320, entries: 124 }
    ],
    performanceMetrics: [
      { metric: 'Task Completion', value: 92, target: 90, status: 'exceeded' },
      { metric: 'On-time Submission', value: 88, target: 85, status: 'met' },
      { metric: 'Quality Rating', value: 4.2, target: 4.0, status: 'exceeded' },
      { metric: 'Learning Objectives', value: 85, target: 90, status: 'below' }
    ],
    recentEntries: [
      { id: 1, date: '2024-05-15', title: 'Project Analysis', hours: 7.5, status: 'approved', type: 'Project Work' },
      { id: 2, date: '2024-05-14', title: 'Client Meeting', hours: 3.0, status: 'pending', type: 'Meeting' },
      { id: 3, date: '2024-05-13', title: 'Code Review', hours: 5.5, status: 'approved', type: 'Development' },
      { id: 4, date: '2024-05-12', title: 'Documentation', hours: 6.0, status: 'approved', type: 'Documentation' },
      { id: 5, date: '2024-05-11', title: 'Training Session', hours: 4.0, status: 'rejected', type: 'Training' }
    ]
  };

  const handleExportReport = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert('Report exported successfully!');
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={14} />;
      case 'pending': return <AlertCircle size={14} />;
      case 'rejected': return <AlertCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getMetricStatusColor = (status) => {
    switch (status) {
      case 'exceeded': return 'metric-exceeded';
      case 'met': return 'metric-met';
      case 'below': return 'metric-below';
      default: return 'metric-met';
    }
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="header-left">
          <h1>
            <BarChart3 size={28} />
            OJT Reports & Analytics
          </h1>
          <p>Track your internship progress, hours, and performance metrics</p>
        </div>
        <div className="header-actions">
          <div className="filter-dropdown">
            <Filter size={18} />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-select"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown size={16} />
          </div>
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            className="export-btn"
            onClick={handleExportReport}
            disabled={loading}
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon total-entries">
            <FileText size={24} />
          </div>
          <div className="card-content">
            <h3>{reportData.summary.totalEntries}</h3>
            <p>Total Entries</p>
            <span className="trend positive">
              <TrendingUp size={14} />
              +12% from last month
            </span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon total-hours">
            <Clock size={24} />
          </div>
          <div className="card-content">
            <h3>{reportData.summary.totalHours}h</h3>
            <p>Total Hours</p>
            <span className="trend positive">
              <TrendingUp size={14} />
              +8% from last month
            </span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon avg-hours">
            <Calendar size={24} />
          </div>
          <div className="card-content">
            <h3>{reportData.summary.avgHoursPerDay}h</h3>
            <p>Avg Hours/Day</p>
            <span className="trend neutral">
              → Consistent
            </span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon completion">
            <Target size={24} />
          </div>
          <div className="card-content">
            <h3>{reportData.summary.completionRate}%</h3>
            <p>Completion Rate</p>
            <span className="trend positive">
              <TrendingUp size={14} />
              +5% from target
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>
              <BarChart3 size={20} />
              Hours Distribution
            </h3>
            <div className="chart-tabs">
              <button 
                className={`chart-tab ${activeChart === 'hours' ? 'active' : ''}`}
                onClick={() => setActiveChart('hours')}
              >
                Hours
              </button>
              <button 
                className={`chart-tab ${activeChart === 'entries' ? 'active' : ''}`}
                onClick={() => setActiveChart('entries')}
              >
                Entries
              </button>
            </div>
          </div>
          <div className="bar-chart">
            {reportData.weeklyHours.map((item, index) => (
              <div key={index} className="bar-item">
                <div className="bar-label">{item.day}</div>
                <div className="bar-track">
                  <div 
                    className="bar-fill"
                    style={{
                      height: `${(item.hours / 10) * 100}%`,
                      background: activeChart === 'hours' 
                        ? 'linear-gradient(to top, #3b82f6, #60a5fa)'
                        : 'linear-gradient(to top, #10b981, #34d399)'
                    }}
                  />
                </div>
                <div className="bar-value">
                  {activeChart === 'hours' ? `${item.hours}h` : `${item.entries}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>
              <TrendingUp size={20} />
              Performance Metrics
            </h3>
          </div>
          <div className="metrics-grid">
            {reportData.performanceMetrics.map((metric, index) => (
              <div key={index} className="metric-item">
                <div className="metric-header">
                  <span className="metric-title">{metric.metric}</span>
                  <span className={`metric-status ${getMetricStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
                <div className="metric-progress">
                  <div className="progress-track">
                    <div 
                      className="progress-fill"
                      style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
                    />
                  </div>
                  <div className="metric-values">
                    <span className="current-value">{metric.value}{metric.metric.includes('Rating') ? '' : '%'}</span>
                    <span className="target-value">Target: {metric.target}{metric.metric.includes('Rating') ? '' : '%'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Entries Table */}
      <div className="table-section">
        <div className="section-header">
          <h3>
            <FileText size={20} />
            Recent OJT Entries
          </h3>
          <button className="view-all-btn">
            <Eye size={16} />
            View All
          </button>
        </div>
        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Entry Title</th>
                <th>Type</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportData.recentEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="date-cell">
                    <Calendar size={14} />
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="title-cell">
                    <strong>{entry.title}</strong>
                  </td>
                  <td>
                    <span className="entry-type">{entry.type}</span>
                  </td>
                  <td className="hours-cell">
                    <Clock size={14} />
                    {entry.hours}h
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(entry.status)}`}>
                      {getStatusIcon(entry.status)}
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="progress-summary">
        <div className="progress-header">
          <h3>
            <Target size={20} />
            Progress Overview
          </h3>
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-value">{reportData.summary.completedTasks}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{reportData.summary.pendingTasks}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Math.round((reportData.summary.completedTasks / (reportData.summary.completedTasks + reportData.summary.pendingTasks)) * 100)}%
              </span>
              <span className="stat-label">Overall</span>
            </div>
          </div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-completed"
            style={{
              width: `${(reportData.summary.completedTasks / (reportData.summary.completedTasks + reportData.summary.pendingTasks)) * 100}%`
            }}
          />
          <div className="progress-marker" style={{ left: '85%' }}>
            <div className="marker-label">Target: 85%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;