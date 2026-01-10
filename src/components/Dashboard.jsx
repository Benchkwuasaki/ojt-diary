// src/components/Dashboard.jsx - REVISED WITH NAVIGATION
import React from 'react';
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
import './Dashboard.css';

function Dashboard({ user, onNavigate }) {
  const stats = [
    { 
      id: 1, 
      title: 'Completion Rate', 
      value: '85%', 
      change: '+5%', 
      icon: <TrendingUp size={24} />,
      color: '#22c55e'
    },
    { 
      id: 2, 
      title: 'Active Projects', 
      value: '3', 
      change: '+1', 
      icon: <Users size={24} />,
      color: '#3b82f6'
    },
    { 
      id: 3, 
      title: 'Total Hours', 
      value: '256', 
      change: '+48', 
      icon: <Clock size={24} />,
      color: '#f59e0b'
    },
    { 
      id: 4, 
      title: 'Tasks Completed', 
      value: '42', 
      change: '+8', 
      icon: <CheckCircle size={24} />,
      color: '#10b981'
    }
  ];

  const achievements = [
    { 
      id: 1, 
      title: 'Fast Learner Badge', 
      date: 'Jan 15, 2024',
      icon: <Zap size={20} />,
      color: '#f59e0b'
    },
    { 
      id: 2, 
      title: 'Team Collaboration Award', 
      date: 'Jan 10, 2024',
      icon: <Users size={20} />,
      color: '#3b82f6'
    },
    { 
      id: 3, 
      title: 'Perfect Attendance', 
      date: 'Jan 8, 2024',
      icon: <Calendar size={20} />,
      color: '#10b981'
    },
    { 
      id: 4, 
      title: 'Exceeded Weekly Goals', 
      date: 'Jan 5, 2024',
      icon: <Trophy size={20} />,
      color: '#8b5cf6'
    }
  ];

  const projects = [
    { 
      id: 1, 
      title: 'Company Portal Redesign', 
      progress: 75,
      team: 4,
      icon: 'P',
      color: '#3b82f6'
    },
    { 
      id: 2, 
      title: 'Mobile App Development', 
      progress: 90,
      team: 3,
      icon: 'M',
      color: '#8b5cf6'
    },
    { 
      id: 3, 
      title: 'Database Migration', 
      progress: 60,
      team: 2,
      icon: 'D',
      color: '#f59e0b'
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

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-card">
        <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
        <p>Track your OJT progress and manage your training activities efficiently.</p>
        
        <div className="progress-container">
          <div className="progress-text">
            <span>Overall Progress</span>
            <span className="progress-percentage">85%</span>
          </div>
          <div className="progress-bar" style={{ width: '85%' }}></div>
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

      {/* Active Projects */}
      <div className="dashboard-card">
        <div className="card-header">
          <Activity size={24} color="#3b82f6" />
          <h3>Active Projects</h3>
        </div>
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <div 
                  className="project-icon" 
                  style={{ background: project.color }}
                >
                  {project.icon}
                </div>
                <h4 className="project-title">{project.title}</h4>
              </div>
              
              <div className="project-progress">
                <div className="progress-text">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${project.progress}%`,
                    background: `linear-gradient(90deg, ${project.color} 0%, ${project.color}80 100%)`
                  }}
                ></div>
              </div>
              
              <div className="project-meta">
                <span>Team: {project.team} members</span>
                <span>{project.progress < 100 ? 'In Progress' : 'Completed'}</span>
              </div>
            </div>
          ))}
        </div>
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
              <h4 className="achievement-title">Project Review Meeting</h4>
              <p className="achievement-date">Tomorrow, 10:00 AM</p>
            </div>
          </div>
          <div className="achievement-item">
            <div className="achievement-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
              <FileText size={20} />
            </div>
            <div className="achievement-content">
              <h4 className="achievement-title">Submit Weekly Report</h4>
              <p className="achievement-date">Jan 18, 2024</p>
            </div>
          </div>
          <div className="achievement-item">
            <div className="achievement-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
              <Target size={20} />
            </div>
            <div className="achievement-content">
              <h4 className="achievement-title">Training Session</h4>
              <p className="achievement-date">Jan 19, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;