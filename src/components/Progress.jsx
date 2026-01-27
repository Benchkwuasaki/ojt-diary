
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Clock, 
  Calendar,
  BarChart3,
  PieChart,
  Award,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Sparkles
} from 'lucide-react';
import './Progress.css';
import { auth, db, storage } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Progress() {
  const [timeFilter, setTimeFilter] = useState('week');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [entries, setEntries] = useState([]);
  const [progressData, setProgressData] = useState({
    overallProgress: 0,
    weeklyTarget: 0,
    hoursCompleted: 0,
    totalHours: 500,
    completedTasks: 0,
    totalTasks: 0,
    streakDays: 0,
    lastActive: 'Loading...'
  });

  const categories = [
    { id: 'all', label: 'All Tasks', count: 0, color: '#22c55e' },
    { id: 'technical', label: 'Technical Skills', count: 0, color: '#3b82f6' },
    { id: 'soft', label: 'Soft Skills', count: 0, color: '#8b5cf6' },
    { id: 'projects', label: 'Projects', count: 0, color: '#f59e0b' },
    { id: 'documents', label: 'Documentation', count: 0, color: '#ef4444' }
  ];

  const milestones = [
    { id: 1, title: 'First Week Completed', date: 'Jan 5, 2024', completed: true },
    { id: 2, title: 'Technical Training Phase', date: 'Jan 15, 2024', completed: true },
    { id: 3, title: 'Mid-Evaluation', date: 'Feb 1, 2024', completed: true },
    { id: 4, title: 'Final Project Started', date: 'Feb 15, 2024', completed: false },
    { id: 5, title: 'OJT Completion', date: 'Mar 15, 2024', completed: false }
  ];

  const weeklyProgress = [
    { day: 'Mon', hours: 8, target: 8 },
    { day: 'Tue', hours: 7.5, target: 8 },
    { day: 'Wed', hours: 8, target: 8 },
    { day: 'Thu', hours: 6, target: 8 },
    { day: 'Fri', hours: 8, target: 8 },
    { day: 'Sat', hours: 4, target: 4 },
    { day: 'Sun', hours: 2, target: 4 }
  ];

  const achievements = [
    { id: 1, title: 'Quick Learner', description: 'Completed training 2 days early', icon: <Sparkles size={20} />, date: 'Jan 10' },
    { id: 2, title: 'Team Player', description: 'Collaborated on 5+ projects', icon: <Award size={20} />, date: 'Jan 25' },
    { id: 3, title: 'Documentation Pro', description: 'Submitted all reports on time', icon: <CheckCircle size={20} />, date: 'Feb 5' }
  ];

  const timeFilters = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'all', label: 'All Time' }
  ];

  const calculateCategoryProgress = (categoryId) => {
    if (entries.length === 0) return 0;
    
    let categoryEntries = entries;
    if (categoryId !== 'all') {
      categoryEntries = entries.filter(e => {
        const skills = e.skills || [];
        return skills.some(skill => 
          skill.toLowerCase().includes(categoryId) ||
          categoryId.includes(skill.toLowerCase())
        );
      });
    }
    
    if (categoryEntries.length === 0) return 0;
    const completed = categoryEntries.filter(e => e.status === 'completed').length;
    return Math.round((completed / categoryEntries.length) * 100);
  };

  const exportProgress = () => {
    setLoading(true);
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
        ...progressData,
        entries: entries,
        generatedAt: new Date().toISOString()
      }));
      link.download = `progress-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      setLoading(false);
    }, 500);
  };

  // Fetch entries from Firestore
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setLoading(false);
          return;
        }

        const entriesRef = collection(db, 'ojt_entries');
        const q = query(entriesRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedEntries = [];
        querySnapshot.forEach((doc) => {
          fetchedEntries.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setEntries(fetchedEntries);
        calculateProgressMetrics(fetchedEntries);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Calculate progress metrics from entries
  const calculateProgressMetrics = (entriesList) => {
    const totalEntries = entriesList.length;
    const completedEntries = entriesList.filter(e => e.status === 'completed').length;
    const totalHours = entriesList.reduce((total, entry) => total + (parseInt(entry.hours) || 0), 0);
    const targetHours = 500;
    const overallPct = totalHours > 0 ? Math.round((totalHours / targetHours) * 100) : 0;
    const weeklyPct = totalHours > 0 ? Math.round((totalHours / 40) * 100) : 0;

    const lastEntry = entriesList.length > 0 
      ? new Date(entriesList[0].date).toLocaleDateString()
      : 'No activity';

    setProgressData({
      overallProgress: Math.min(overallPct, 100),
      weeklyTarget: Math.min(weeklyPct, 100),
      hoursCompleted: totalHours,
      totalHours: targetHours,
      completedTasks: completedEntries,
      totalTasks: totalEntries,
      streakDays: calculateStreak(entriesList),
      lastActive: lastEntry
    });
  };

  // Calculate streak days
  const calculateStreak = (entriesList) => {
    if (entriesList.length === 0) return 0;
    
    const sortedEntries = entriesList
      .map(e => new Date(e.date))
      .sort((a, b) => b - a);
    
    let streak = 1;
    let currentDate = new Date(sortedEntries[0]);
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(sortedEntries[i]);
      prevDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate - prevDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate weekly progress from entries
  const calculateWeeklyProgress = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    
    return days.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + index);
      dayDate.setHours(0, 0, 0, 0);
      
      const dayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === dayDate.getTime();
      });
      
      const hours = dayEntries.reduce((total, entry) => total + (parseInt(entry.hours) || 0), 0);
      
      return {
        day,
        hours: parseFloat(hours.toFixed(1)),
        target: 8,
        entries: dayEntries.length
      };
    });
  };

  const weeklyProgress = calculateWeeklyProgress();

  return (
    <div className="progress-container">
      {/* Header */}
      <div className="progress-header">
        <div className="header-left">
          <h1 className="page-title">
            <BarChart3 size={28} className="title-icon" />
            Progress Tracking
          </h1>
          <p className="page-subtitle">Monitor your OJT journey and achievements</p>
        </div>
        <div className="header-actions">
          <button 
            className="filter-button"
            onClick={() => setTimeFilter(timeFilter === 'week' ? 'month' : 'week')}
          >
            <Filter size={18} />
            {timeFilters.find(f => f.id === timeFilter)?.label}
          </button>
          <button 
            className="export-button"
            onClick={exportProgress}
            disabled={loading}
          >
            <Download size={18} />
            {loading ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <TrendingUp size={24} />
            </div>
            <MoreVertical size={20} className="stat-menu" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{progressData.overallProgress}%</h3>
            <p className="stat-label">Overall Progress</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressData.overallProgress}%` }}
              />
            </div>
            <div className="stat-trend">
              <span className="trend-up">↑ 5% from last week</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Clock size={24} />
            </div>
            <MoreVertical size={20} className="stat-menu" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{progressData.hoursCompleted}h</h3>
            <p className="stat-label">Hours Completed</p>
            <p className="stat-subtext">of {progressData.totalHours}h total</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(progressData.hoursCompleted / progressData.totalHours) * 100}%`,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <CheckCircle size={24} />
            </div>
            <MoreVertical size={20} className="stat-menu" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{progressData.completedTasks}/{progressData.totalTasks}</h3>
            <p className="stat-label">Tasks Completed</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(progressData.completedTasks / progressData.totalTasks) * 100}%`,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                }}
              />
            </div>
            <div className="stat-trend">
              <span className="trend-up">67% completion rate</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Target size={24} />
            </div>
            <MoreVertical size={20} className="stat-menu" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{progressData.streakDays} days</h3>
            <p className="stat-label">Active Streak</p>
            <p className="stat-subtext">Last active: {progressData.lastActive}</p>
            <div className="streak-indicator">
              {Array.from({ length: 7 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`streak-day ${i < 5 ? 'active' : ''}`}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="progress-content-grid">
        {/* Left Column - Categories & Weekly Progress */}
        <div className="left-column">
          {/* Category Progress */}
          <div className="section-card">
            <div className="section-header">
              <h3>Category Progress</h3>
              <div className="category-filters">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      background: selectedCategory === category.id ? category.color : 'transparent',
                      borderColor: category.color,
                      color: selectedCategory === category.id ? 'white' : category.color
                    }}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="category-list">
              {categories.map(category => (
                <div key={category.id} className="category-item">
                  <div className="category-info">
                    <div 
                      className="category-color" 
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <h4>{category.label}</h4>
                      <p className="category-count">{category.count} tasks</p>
                    </div>
                  </div>
                  <div className="category-progress">
                    <span className="progress-percentage">
                      {calculateCategoryProgress(category.id)}%
                    </span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${calculateCategoryProgress(category.id)}%`,
                          background: category.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="section-card">
            <div className="section-header">
              <h3>Weekly Hours</h3>
              <span className="week-range">Jan 15-21, 2024</span>
            </div>
            <div className="weekly-chart">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="chart-column">
                  <div className="chart-bar-container">
                    <div 
                      className="chart-bar-target"
                      style={{ height: `${(day.target / 8) * 60}px` }}
                    />
                    <div 
                      className="chart-bar-actual"
                      style={{ 
                        height: `${(day.hours / 8) * 60}px`,
                        background: day.hours >= day.target ? '#22c55e' : '#f59e0b'
                      }}
                      title={`${day.hours}h / ${day.target}h`}
                    />
                  </div>
                  <span className="chart-label">{day.day}</span>
                  <span className="chart-value">{day.hours}h</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#22c55e' }} />
                <span>Target Achieved</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#f59e0b' }} />
                <span>Below Target</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Milestones & Achievements */}
        <div className="right-column">
          {/* Milestones */}
          <div className="section-card">
            <div className="section-header">
              <h3>Milestones</h3>
              <Calendar size={20} className="section-icon" />
            </div>
            <div className="milestones-timeline">
              {milestones.map(milestone => (
                <div key={milestone.id} className="milestone-item">
                  <div className="milestone-indicator">
                    <div className={`milestone-dot ${milestone.completed ? 'completed' : 'upcoming'}`}>
                      {milestone.completed && <CheckCircle size={12} />}
                    </div>
                    {milestone.id < milestones.length && (
                      <div className="milestone-line" />
                    )}
                  </div>
                  <div className="milestone-content">
                    <div className="milestone-header">
                      <h4 className={`milestone-title ${milestone.completed ? 'completed' : ''}`}>
                        {milestone.title}
                      </h4>
                      <span className="milestone-date">{milestone.date}</span>
                    </div>
                    <div className="milestone-status">
                      <span className={`status-badge ${milestone.completed ? 'completed' : 'upcoming'}`}>
                        {milestone.completed ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="section-card">
            <div className="section-header">
              <h3>Achievements</h3>
              <Award size={20} className="section-icon" />
            </div>
            <div className="achievements-grid">
              {achievements.map(achievement => (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-icon">
                    {achievement.icon}
                  </div>
                  <div className="achievement-content">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    <span className="achievement-date">{achievement.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="section-card recommendation-card">
            <div className="section-header">
              <h3>Recommendations</h3>
              <Sparkles size={20} className="section-icon" />
            </div>
            <div className="recommendation-list">
              <div className="recommendation-item">
                <ChevronRight size={16} className="rec-icon" />
                <span>Focus on documentation tasks to boost overall progress</span>
              </div>
              <div className="recommendation-item">
                <ChevronRight size={16} className="rec-icon" />
                <span>Try to maintain 8-hour days consistently next week</span>
              </div>
              <div className="recommendation-item">
                <ChevronRight size={16} className="rec-icon" />
                <span>Complete 2 more soft skills tasks to unlock next milestone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;