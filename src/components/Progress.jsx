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
  Sparkles,
  Image as ImageIcon,
  X,
  ZoomIn,
  Eye
} from 'lucide-react';
import './Progress.css';
import { auth, db, storage } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

function Progress() {
  const [timeFilter, setTimeFilter] = useState('week');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [entries, setEntries] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
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

  // Fetch entries from Firestore with real-time updates
  useEffect(() => {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Use the correct collection name 'ojtEntries' as shown in the Firebase screenshot
      const entriesRef = collection(db, 'ojtEntries');
      const q = query(
        entriesRef, 
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const fetchedEntries = [];
          querySnapshot.forEach((doc) => {
            fetchedEntries.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          console.log('Fetched entries with images:', fetchedEntries);
          setEntries(fetchedEntries);
          calculateProgressMetrics(fetchedEntries);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching entries:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up listener:', error);
      setLoading(false);
    }
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
        hours,
        target: 8,
        completed: hours >= 8
      };
    });
  };

  const weeklyProgress = calculateWeeklyProgress();

  // Get entries with images
  const getEntriesWithImages = () => {
    return entries.filter(entry => entry.imageUrl && entry.imageUrl.trim() !== '');
  };

  const entriesWithImages = getEntriesWithImages();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading progress data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      {/* Header */}
      <div className="progress-header">
        <div className="header-content">
          <h1>Training Progress</h1>
          <p>Track your OJT performance and achievements</p>
        </div>
        <div className="header-actions">
          <div className="time-filter">
            {timeFilters.map(filter => (
              <button
                key={filter.id}
                className={`filter-btn ${timeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setTimeFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button className="export-btn" onClick={exportProgress}>
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <TrendingUp size={24} />
            </div>
            <MoreVertical size={20} className="stat-menu" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{progressData.overallProgress}%</h3>
            <p className="stat-label">Overall Progress</p>
            <p className="stat-subtext">{progressData.hoursCompleted} / {progressData.totalHours} hours completed</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressData.overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <CheckCircle size={24} />
            </div>
            <MoreVertical size={20} className="stat-menu" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{progressData.completedTasks}/{progressData.totalTasks}</h3>
            <p className="stat-label">Tasks Completed</p>
            <p className="stat-subtext">
              {progressData.totalTasks > 0 
                ? Math.round((progressData.completedTasks / progressData.totalTasks) * 100) 
                : 0}% completion rate
            </p>
            <div className="task-indicators">
              {Array.from({ length: Math.min(progressData.totalTasks, 10) }).map((_, i) => (
                <div 
                  key={i} 
                  className={`task-indicator ${i < progressData.completedTasks ? 'completed' : ''}`}
                />
              ))}
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
                  className={`streak-day ${i < progressData.streakDays ? 'active' : ''}`}
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
              <span className="week-range">Current Week</span>
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

          {/* Image Gallery Section */}
          <div className="section-card image-gallery-section">
            <div className="section-header">
              <h3>
                <ImageIcon size={20} style={{ marginRight: '8px' }} />
                OJT Images Gallery
              </h3>
              <span className="image-count">{entriesWithImages.length} images</span>
            </div>
            
            {entriesWithImages.length > 0 ? (
              <div className="image-gallery-grid">
                {entriesWithImages.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="gallery-item"
                    onClick={() => setSelectedImage(entry)}
                  >
                    <div className="gallery-image-wrapper">
                      <img 
                        src={entry.imageUrl} 
                        alt={entry.title}
                        className="gallery-image"
                      />
                      <div className="gallery-overlay">
                        <ZoomIn size={24} color="white" />
                      </div>
                    </div>
                    <div className="gallery-info">
                      <h4 className="gallery-title">{entry.title}</h4>
                      <p className="gallery-date">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className={`gallery-status ${entry.status}`}>
                        {entry.status === 'completed' && <CheckCircle size={12} />}
                        {entry.status === 'in-progress' && <Clock size={12} />}
                        {entry.status === 'pending' && <Clock size={12} />}
                        <span>{entry.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-gallery">
                <ImageIcon size={48} color="#cbd5e1" />
                <p>No images uploaded yet</p>
                <p className="empty-gallery-hint">Add images to your OJT entries to see them here</p>
              </div>
            )}
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
              <X size={24} />
            </button>
            <div className="modal-image-container">
              <img src={selectedImage.imageUrl} alt={selectedImage.title} />
            </div>
            <div className="modal-details">
              <h3>{selectedImage.title}</h3>
              <p className="modal-description">{selectedImage.description}</p>
              <div className="modal-meta">
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{new Date(selectedImage.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{selectedImage.hours} hours</span>
                </div>
                <div className={`meta-status ${selectedImage.status}`}>
                  {selectedImage.status === 'completed' && <CheckCircle size={16} />}
                  {selectedImage.status === 'in-progress' && <Clock size={16} />}
                  {selectedImage.status === 'pending' && <Clock size={16} />}
                  <span>{selectedImage.status}</span>
                </div>
              </div>
              {selectedImage.skills && selectedImage.skills.length > 0 && (
                <div className="modal-skills">
                  <h4>Skills:</h4>
                  <div className="skills-tags">
                    {selectedImage.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedImage.supervisor && (
                <div className="modal-supervisor">
                  <strong>Supervisor:</strong> {selectedImage.supervisor}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Progress;