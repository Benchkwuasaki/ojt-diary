// src/components/Dashboard.jsx - COMPLETE REVISED VERSION
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Clock, 
  CheckCircle,
  Calendar,
  FileText,
  BarChart3,
  PlusCircle,
  ChevronRight,
  Zap,
  Trophy,
  Activity
} from 'lucide-react';
import { db, auth } from '../firebase/config';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import './Dashboard.css';

function Dashboard({ user, onNavigate }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch user's entries from Firestore
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      
      try {
        const entriesRef = collection(db, 'ojtEntries');
        const q = query(entriesRef, where('userId', '==', user.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const entriesData = [];
          querySnapshot.forEach((doc) => {
            entriesData.push({ id: doc.id, ...doc.data() });
          });
          setEntries(entriesData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching entries:', error);
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user]);

  // Calculate stats from user's entries
  const totalEntries = entries.length;
  const completedEntries = entries.filter(e => e.status === 'completed').length;
  const inProgressEntries = entries.filter(e => e.status === 'in-progress').length;
  const totalHours = entries.reduce((total, entry) => total + (parseInt(entry.hours) || 0), 0);
  const completionRate = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

  // Determine active milestone
  const getActiveMilestone = (rate) => {
    if (rate >= 100) return 100;
    if (rate >= 75) return 75;
    if (rate >= 50) return 50;
    if (rate >= 25) return 25;
    return 0;
  };

  const stats = [
    { 
      id: 1, 
      title: 'Completion Rate', 
      value: `${completionRate}%`, 
      change: completionRate > 0 ? '+5%' : '0%', 
      icon: <TrendingUp size={24} />,
      color: '#22c55e',
      colorRgb: '34, 197, 94'
    },
    { 
      id: 2, 
      title: 'Active Tasks', 
      value: `${inProgressEntries}`, 
      change: inProgressEntries > 0 ? `+${inProgressEntries}` : '0', 
      icon: <Users size={24} />,
      color: '#3b82f6',
      colorRgb: '59, 130, 246'
    },
    { 
      id: 3, 
      title: 'Total Hours', 
      value: `${totalHours}`, 
      change: totalHours > 0 ? `+${totalHours}` : '0', 
      icon: <Clock size={24} />,
      color: '#f59e0b',
      colorRgb: '245, 158, 11'
    },
    { 
      id: 4, 
      title: 'Tasks Completed', 
      value: `${completedEntries}`, 
      change: completedEntries > 0 ? `+${completedEntries}` : '0', 
      icon: <CheckCircle size={24} />,
      color: '#10b981',
      colorRgb: '16, 185, 129'
    }
  ];

  const achievements = [
    { 
      id: 1, 
      title: 'Getting Started', 
      date: totalEntries > 0 ? `${totalEntries} entries logged` : 'Add your first entry',
      icon: <Zap size={20} />,
      color: '#f59e0b',
      unlocked: totalEntries > 0
    },
    { 
      id: 2, 
      title: 'Consistency Badge', 
      date: totalEntries >= 3 ? 'Multiple entries logged' : 'Log 3+ entries',
      icon: <Users size={20} />,
      color: '#3b82f6',
      unlocked: totalEntries >= 3
    },
    { 
      id: 3, 
      title: 'Progress Maker', 
      date: completedEntries > 0 ? `${completedEntries} tasks completed` : 'Complete 1+ task',
      icon: <Calendar size={20} />,
      color: '#10b981',
      unlocked: completedEntries > 0
    }
  ];

  const quickActions = [
    { id: 1, label: 'Add New Entry', icon: <PlusCircle />, action: 'add-entry' },
    { id: 2, label: 'View Calendar', icon: <Calendar />, action: 'view-calendar' },
    { id: 3, label: 'Generate Report', icon: <FileText />, action: 'generate-report' },
    { id: 4, label: 'Track Progress', icon: <BarChart3 />, action: 'track-progress' }
  ];

  const handleQuickAction = (action) => {
    if (onNavigate) {
      if (action === 'add-entry') {
        onNavigate('ojt-entries');
      } else if (action === 'view-calendar') {
        onNavigate('calendar');
      } else {
        console.log(`${action} clicked`);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  const activeMilestone = getActiveMilestone(completionRate);

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-card">
        <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
        <p>Track your OJT progress and manage your training activities efficiently.</p>
        
        {/* Progress Section - REVISED FOR BETTER VISIBILITY */}
        <div className="progress-section">
          <div className="progress-header">
            <h3>Overall Progress</h3>
            <div className="progress-value">
              <span className="progress-percentage-large">{completionRate}%</span>
              <span className="progress-label">Current Rate</span>
            </div>
          </div>
          
          <div className="progress-bar-container">
            <div 
              className={`progress-bar-fill ${completionRate === 0 ? 'zero-progress' : ''}`} 
              style={{ width: `${Math.max(completionRate, 3)}%` }}
            ></div>
          </div>
          
          <div className="progress-milestones">
            {[0, 25, 50, 75, 100].map((milestone) => (
              <span 
                key={milestone}
                className={`milestone ${activeMilestone >= milestone ? 'active' : ''}`}
              >
                {milestone}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="stat-card"
            style={{ 
              '--color': stat.color,
              '--color-rgb': stat.colorRgb
            }}
          >
            <div className="stat-header">
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <h3>{stat.title}</h3>
            </div>
            <p className="stat-value">{stat.value}</p>
            <div className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
              <TrendingUp size={12} />
              <span>{stat.change} this week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <Target size={24} color="#22c55e" />
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <button 
                key={action.id} 
                className="quick-action-btn"
                onClick={() => handleQuickAction(action.action)}
              >
                <div className="action-icon">
                  {action.icon}
                </div>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="dashboard-card">
          <div className="card-header">
            <Award size={24} color="#f59e0b" />
            <h3>Recent Achievements</h3>
          </div>
          <ul className="achievements-list">
            {achievements.map((achievement) => (
              <li key={achievement.id} className="achievement-item">
                <div 
                  className="achievement-icon" 
                  style={{ 
                    background: achievement.unlocked ? `${achievement.color}20` : '#F3F4F6',
                    color: achievement.unlocked ? achievement.color : '#9CA3AF'
                  }}
                >
                  {achievement.icon}
                </div>
                <div className="achievement-content">
                  <h4 className="achievement-title">{achievement.title}</h4>
                  <p className="achievement-date">{achievement.date}</p>
                </div>
                {achievement.unlocked && <ChevronRight size={16} color="#9CA3AF" />}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="dashboard-card">
        <div className="card-header">
          <Activity size={24} color="#3b82f6" />
          <h3>Recent OJT Entries</h3>
        </div>
        {entries.length > 0 ? (
          <div className="achievements-list">
            {entries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="achievement-item">
                <div 
                  className="achievement-icon" 
                  style={{ 
                    background: entry.status === 'completed' ? '#10b98120' : 
                               entry.status === 'in-progress' ? '#3b82f620' : '#f59e0b20',
                    color: entry.status === 'completed' ? '#10b981' : 
                          entry.status === 'in-progress' ? '#3b82f6' : '#f59e0b'
                  }}
                >
                  <FileText size={20} />
                </div>
                <div className="achievement-content">
                  <h4 className="achievement-title">{entry.title}</h4>
                  <p className="achievement-date">
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })} • {entry.hours} hours
                  </p>
                </div>
                <div 
                  className="status-badge"
                  style={{ 
                    background: entry.status === 'completed' ? '#10b981' : 
                               entry.status === 'in-progress' ? '#3b82f6' : '#f59e0b',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {entry.status === 'completed' ? 'Completed' : 
                   entry.status === 'in-progress' ? 'In Progress' : 'Pending'}
                </div>
              </div>
            ))}
            {entries.length > 3 && (
              <button 
                className="quick-action-btn"
                onClick={() => onNavigate('ojt-entries')}
                style={{ marginTop: '16px', width: '100%' }}
              >
                View All Entries ({entries.length})
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#6B7280', marginBottom: '16px' }}>No entries yet. Start tracking your OJT activities!</p>
            <button 
              className="quick-action-btn"
              onClick={() => onNavigate('ojt-entries')}
            >
              <PlusCircle size={20} />
              Add Your First Entry
            </button>
          </div>
        )}
      </div>

      {/* Upcoming Tasks */}
      <div className="dashboard-card">
        <div className="card-header">
          <Calendar size={24} color="#10b981" />
          <h3>Upcoming Tasks</h3>
        </div>
        <div className="achievements-list">
          <div className="achievement-item">
            <div className="achievement-icon" style={{ background: '#10b98120', color: '#10b981' }}>
              <Clock size={20} />
            </div>
            <div className="achievement-content">
              <h4 className="achievement-title">Track Your OJT Hours</h4>
              <p className="achievement-date">Log your daily activities</p>
            </div>
          </div>
          <div className="achievement-item">
            <div className="achievement-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
              <FileText size={20} />
            </div>
            <div className="achievement-content">
              <h4 className="achievement-title">Update Your Progress</h4>
              <p className="achievement-date">Mark completed tasks</p>
            </div>
          </div>
          <div className="achievement-item">
            <div className="achievement-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
              <Target size={20} />
            </div>
            <div className="achievement-content">
              <h4 className="achievement-title">Set Weekly Goals</h4>
              <p className="achievement-date">Plan your learning objectives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;