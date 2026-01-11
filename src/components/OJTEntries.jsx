// src/components/OJTEntries.jsx - UPDATED WITH FIRESTORE
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  FileText,
  Search,
  Filter,
  Eye,
  X,
  ChevronUp,
  ChevronDown,
  User,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { db, auth } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import './OJTEntries.css';

function OJTEntries() {
  const [entries, setEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeFilter, setActiveFilter] = useState('all');
  const [skillInput, setSkillInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    hours: 4,
    supervisor: '',
    skills: []
  });

  const suggestionsRef = useRef(null);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f59e0b', icon: <Clock size={14} /> },
    { value: 'in-progress', label: 'In Progress', color: '#3b82f6', icon: <AlertCircle size={14} /> },
    { value: 'completed', label: 'Completed', color: '#10b981', icon: <CheckCircle size={14} /> }
  ];

  const skillOptions = [
    'Communication', 'Teamwork', 'Problem Solving', 'React.js', 'JavaScript', 
    'CSS', 'HTML', 'Git', 'Testing', 'Documentation', 'Safety', 'Time Management',
    'Company Culture', 'Presentation', 'Agile', 'SQL', 'Performance', 'Database',
    'Code Review', 'Best Practices', 'Quality Assurance', 'Leadership',
    'Project Management', 'Data Analysis', 'UI/UX Design', 'API Development'
  ];

  // Get current user and fetch their entries
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchEntries(currentUser.uid);
      } else {
        setUser(null);
        setEntries([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch entries from Firestore
  const fetchEntries = async (userId) => {
    try {
      const entriesRef = collection(db, 'ojtEntries');
      const q = query(
        entriesRef, 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entriesData = [];
        querySnapshot.forEach((doc) => {
          entriesData.push({
            id: doc.id,
            ...doc.data()
          });
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

  // Stats calculation
  const totalEntries = entries.length;
  const completedEntries = entries.filter(e => e.status === 'completed').length;
  const inProgressEntries = entries.filter(e => e.status === 'in-progress').length;
  const totalHours = entries.reduce((total, entry) => total + entry.hours, 0);
  const completionRate = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (entry.supervisor && entry.supervisor.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          entry.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = activeFilter === 'all' || entry.status === activeFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (sortBy === 'hours') {
        return sortOrder === 'asc'
          ? a.hours - b.hours
          : b.hours - a.hours;
      }
      return 0;
    });

  // Add new entry to Firestore
  const addEntry = async (entryData) => {
    try {
      if (!user) {
        alert('You must be logged in to add entries');
        return;
      }

      const entryWithUser = {
        ...entryData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'ojtEntries'), entryWithUser);
      return true;
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Error adding entry: ' + error.message);
      return false;
    }
  };

  // Update entry in Firestore
  const updateEntry = async (entryId, entryData) => {
    try {
      const entryRef = doc(db, 'ojtEntries', entryId);
      await updateDoc(entryRef, {
        ...entryData,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Error updating entry: ' + error.message);
      return false;
    }
  };

  // Delete entry from Firestore
  const deleteEntry = async (entryId) => {
    try {
      await deleteDoc(doc(db, 'ojtEntries', entryId));
      return true;
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error deleting entry: ' + error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to save entries');
      return;
    }

    let success = false;
    
    if (isEditMode && selectedEntry) {
      // Update existing entry
      success = await updateEntry(selectedEntry.id, formData);
    } else {
      // Add new entry
      success = await addEntry(formData);
    }
    
    if (success) {
      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      title: entry.title || '',
      description: entry.description || '',
      date: entry.date || new Date().toISOString().split('T')[0],
      status: entry.status || 'pending',
      hours: entry.hours || 4,
      supervisor: entry.supervisor || '',
      skills: entry.skills || []
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(id);
    }
  };

  const handleView = (entry) => {
    setSelectedEntry(entry);
    alert(`Viewing: ${entry.title}\n\nStatus: ${entry.status}\nDate: ${entry.date}\nHours: ${entry.hours}\nSupervisor: ${entry.supervisor || 'Not specified'}\n\n${entry.description}`);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      hours: 4,
      supervisor: '',
      skills: []
    });
    setSkillInput('');
    setShowSuggestions(false);
    setSelectedEntry(null);
    setIsEditMode(false);
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : '#64748b';
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.icon : <Clock size={14} />;
  };

  const handleQuickFilter = (status) => {
    setActiveFilter(status);
  };

  // Add skill function
  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmedSkill]
      });
    }
    setSkillInput('');
    setShowSuggestions(false);
  };

  // Remove skill function
  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading entries...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="ojt-entries-container">
      {/* Header */}
      <div className="entries-header">
        <div className="header-content">
          <h1 className="entries-title">OJT Entries</h1>
          <p className="entries-subtitle">Manage and track your On-the-Job Training activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Entries</h3>
            <p className="stat-value">{totalEntries}</p>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-value">{completedEntries}</p>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>In Progress</h3>
            <p className="stat-value">{inProgressEntries}</p>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Hours</h3>
            <p className="stat-value">{totalHours}</p>
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="quick-filters">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('all')}
        >
          All Entries ({totalEntries})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('pending')}
        >
          <Clock size={14} />
          Pending ({entries.filter(e => e.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'in-progress' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('in-progress')}
        >
          <AlertCircle size={14} />
          In Progress ({inProgressEntries})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('completed')}
        >
          <CheckCircle size={14} />
          Completed ({completedEntries})
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search by title, description, skills, or supervisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="hours">Sort by Hours</option>
            </select>
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Entries Grid */}
      <div className="entries-grid">
        {filteredEntries.map(entry => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header">
              <div className="entry-status" style={{ background: getStatusColor(entry.status) }}>
                {getStatusIcon(entry.status)}
                <span className="status-text">
                  {statusOptions.find(s => s.value === entry.status)?.label || entry.status}
                </span>
              </div>
              <div className="entry-actions">
                <button 
                  className="action-btn view-btn" 
                  onClick={() => handleView(entry)}
                  title="View details"
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="action-btn edit-btn" 
                  onClick={() => handleEdit(entry)}
                  title="Edit entry"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => handleDelete(entry.id)}
                  title="Delete entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="entry-content">
              <h3 className="entry-title">{entry.title}</h3>
              <p className="entry-description">{entry.description}</p>
              
              <div className="entry-details">
                <div className="detail-item">
                  <Calendar size={14} />
                  <span>{new Date(entry.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="detail-item">
                  <Clock size={14} />
                  <span>{entry.hours} {entry.hours === 1 ? 'hour' : 'hours'}</span>
                </div>
                {entry.supervisor && (
                  <div className="detail-item">
                    <User size={14} />
                    <span>{entry.supervisor}</span>
                  </div>
                )}
              </div>
              
              {entry.skills && entry.skills.length > 0 && (
                <div className="skills-container">
                  {entry.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                  {entry.skills.length > 3 && (
                    <span className="skill-tag more">
                      +{entry.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={60} color="#cbd5e1" />
          </div>
          <h3>No entries found</h3>
          <p>{searchTerm || activeFilter !== 'all' ? 'Try adjusting your search or filter' : 'Start tracking your OJT activities by adding your first entry'}</p>
          <button 
            className="add-first-entry-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Add Your First Entry
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        className="fab"
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        title="Add new OJT entry"
      >
        <Plus size={24} />
      </button>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => {
          setIsModalOpen(false);
          resetForm();
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{isEditMode ? 'Edit OJT Entry' : 'Add New OJT Entry'}</h2>
                <p className="modal-subtitle">{isEditMode ? 'Update your entry details' : 'Fill in the details of your OJT activity'}</p>
              </div>
              <button 
                className="close-btn" 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="entry-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="What did you work on?"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your OJT activity, tasks completed, and what you learned..."
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Hours *</label>
                  <input
                    type="number"
                    value={formData.hours}
                    onChange={(e) => setFormData({...formData, hours: parseInt(e.target.value) || 0})}
                    min="1"
                    max="24"
                    placeholder="Hours spent"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <div className="status-buttons">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`status-btn ${formData.status === option.value ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, status: option.value})}
                      style={{ 
                        borderColor: option.color,
                        background: formData.status === option.value ? option.color : 'white'
                      }}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Supervisor (Optional)</label>
                <input
                  type="text"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
                  placeholder="Supervisor's name"
                />
              </div>
              
              <div className="form-group">
                <label>Skills Developed</label>
                <p className="skills-hint">Type a skill and press Enter, or select from suggestions</p>
                
                {/* Selected Skills Display */}
                <div className="selected-skills-display">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="selected-skill-tag">
                      {skill}
                      <button 
                        type="button"
                        className="remove-skill-btn"
                        onClick={() => removeSkill(skill)}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                
                {/* Skills Input with Autocomplete */}
                <div className="skills-input-wrapper" ref={suggestionsRef}>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && skillInput.trim()) {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type a skill and press Enter"
                    className="skills-input"
                  />
                  
                  {/* Skill Suggestions */}
                  {showSuggestions && skillInput && (
                    <div className="skills-suggestions">
                      {skillOptions
                        .filter(skill => 
                          skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                          !formData.skills.includes(skill)
                        )
                        .slice(0, 5)
                        .map((skill, index) => (
                          <div
                            key={index}
                            className="suggestion-item"
                            onClick={() => addSkill(skill)}
                          >
                            {skill}
                          </div>
                        ))
                      }
                      {skillInput.trim() && !skillOptions.includes(skillInput.trim()) && (
                        <div
                          className="suggestion-item add-new"
                          onClick={() => addSkill(skillInput)}
                        >
                          <Plus size={12} />
                          Add "{skillInput.trim()}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Predefined Skill Buttons */}
                <p className="skills-hint">Or select from common skills:</p>
                <div className="skills-selector">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className={`skill-btn ${formData.skills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => {
                        const newSkills = formData.skills.includes(skill)
                          ? formData.skills.filter(s => s !== skill)
                          : [...formData.skills, skill];
                        setFormData({...formData, skills: newSkills});
                      }}
                    >
                      {skill}
                      {formData.skills.includes(skill) && <CheckCircle size={12} />}
                    </button>
                  ))}
                </div>
                
                {formData.skills.length > 0 && (
                  <p className="selected-count">
                    {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {isEditMode ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OJTEntries;