// src/components/Dashboard.jsx
import React from 'react';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

function Dashboard({ user }) {
  return (
    <div className="dashboard-container">
      <div className="welcome-card">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Track your OJT progress and manage your training activities</p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <TrendingUp size={20} />
            <span>85% Completion</span>
          </div>
          <div className="stat-item">
            <Users size={20} />
            <span>Active in 3 Projects</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <Target size={24} color="#22c55e" />
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-list">
            <button className="quick-action-btn">
              + Add New Entry
            </button>
            <button className="quick-action-btn">
              📅 View Calendar
            </button>
            <button className="quick-action-btn">
              📊 Generate Report
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <Award size={24} color="#3b82f6" />
            <h3>Recent Achievements</h3>
          </div>
          <ul className="achievements-list">
            <li>✅ Completed Company Orientation</li>
            <li>⭐ Earned "Fast Learner" Badge</li>
            <li>🎯 Exceeded Weekly Goals</li>
            <li>🤝 Team Collaboration Award</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;