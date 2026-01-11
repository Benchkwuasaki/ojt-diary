// src/components/Dashboard.jsx - UPDATED WITH FIRESTORE INTEGRATION
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
            entriesData.push(doc.data());
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
  const totalHours = entries.reduce((total, entry) => total + entry.hours, 0);
  const completionRate = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

  const stats = [
    { 
      id: 1, 
      title: 'Completion Rate', 
      value: `${completionRate}%`, 
      change: completionRate >= 85 ? '+5%' : '0%', 
      icon: <TrendingUp size={24} />,
      color: '#22c55e'
    },
    { 
      id: 2, 
      title: 'Active Tasks', 
      value: `${inProgressEntries}`, 
      change: inProgressEntries > 0 ? `+${inProgressEntries}` : '0', 
      icon: <Users size={24} />,
      color: '#3b82f6'
    },
    { 
      id: 3, 
      title: 'Total Hours', 
      value: `${totalHours}`, 
      change: totalHours > 0 ? `+${totalHours}` : '0', 
      icon: <Clock size={24} />,
      color: '#f59e0b'
    },
    { 
      id: 4, 
      title: 'Tasks Completed', 
      value: `${completedEntries}`, 
      change: completedEntries > 0 ? `+${completedEntries}` : '0', 
      icon: <CheckCircle size={24} />,
      color: '#10b981'
    }
  ];

  const achievements = [
    { 
      id: 1, 
      title: 'Getting Started', 
      date: 'First entry added',
      icon: <Zap size={20} />,
      color: '#f59e0b'
    },
    { 
      id: 2, 
      title: 'Consistency Badge', 
      date: 'Multiple entries logged',
      icon: <Users size={20} />,
      color: '#3b82f6'
    },
    { 
      id: 3, 
      title: 'Progress Maker', 
      date: 'Tasks completed',
      icon: <Calendar size={20} />,
      color: '#10b981'
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
        // For other actions, you could show a message or implement later
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

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-card">
        <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
        <p>Track your OJT progress and manage your training activities efficiently.</p>
        
        <div className="progress-container">
          <div className="progress-text">
            <span>Overall Progress</span>
            <span className="progress-percentage">{completionRate}%</span>
          </div>
          <div className="progress-bar" style={{ width: `${completionRate}%` }}></div>
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
              '--color-rgb': stat.color.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16)).join(', ')
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
                    background: `${achievement.color}20`,
                    color: achievement.color
                  }}
                >
                  {achievement.icon}
                </div>
                <div className="achievement-content">
                  <h4 className="achievement-title">{achievement.title}</h4>
                  <p className="achievement-date">{achievement.date}</p>
                </div>
                <ChevronRight size={16} color="#9CA3AF" />
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
            {entries.slice(0, 3).map((entry, index) => (
              <div key={index} className="achievement-item">
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
                    fontWeight: '500'
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