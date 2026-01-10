// src/components/OJTEntries.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
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
  User  // Added User import
} from 'lucide-react';
import './OJTEntries.css';

function OJTEntries() {
  const [entries, setEntries] = useState([
    {
      id: 1,
      title: 'Orientation & Company Tour',
      description: 'Introduction to company culture and workplace safety procedures.',
      date: '2024-01-10',
      status: 'completed',
      hours: 8,
      supervisor: 'John Smith',
      skills: ['Communication', 'Safety']
    },
    {
      id: 2,
      title: 'Software Development Training',
      description: 'Learning React.js and modern web development practices.',
      date: '2024-01-12',
      status: 'in-progress',
      hours: 6,
      supervisor: 'Sarah Johnson',
      skills: ['React.js', 'JavaScript', 'CSS']
    },
    {
      id: 3,
      title: 'Team Project Collaboration',
      description: 'Working with team on new feature implementation.',
      date: '2024-01-15',
      status: 'pending',
      hours: 4,
      supervisor: 'Mike Chen',
      skills: ['Teamwork', 'Problem Solving']
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    hours: 4,
    supervisor: '',
    skills: []
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f59e0b', icon: <Clock size={14} /> },
    { value: 'in-progress', label: 'In Progress', color: '#3b82f6', icon: <AlertCircle size={14} /> },
    { value: 'completed', label: 'Completed', color: '#10b981', icon: <CheckCircle size={14} /> }
  ];

  const skillOptions = [
    'Communication', 'Teamwork', 'Problem Solving', 'React.js', 'JavaScript', 
    'CSS', 'HTML', 'Git', 'Testing', 'Documentation', 'Safety', 'Time Management'
  ];

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
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
      return 0;
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode && selectedEntry) {
      // Update existing entry
      setEntries(entries.map(entry => 
        entry.id === selectedEntry.id 
          ? { ...formData, id: selectedEntry.id }
          : entry
      ));
    } else {
      // Add new entry
      const newEntry = {
        ...formData,
        id: entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1
      };
      setEntries([...entries, newEntry]);
    }
    
    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setFormData(entry);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const handleView = (entry) => {
    setSelectedEntry(entry);
    // You could open a view-only modal here
    alert(`Viewing: ${entry.title}\n\nStatus: ${entry.status}\nDate: ${entry.date}\n\n${entry.description}`);
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

  return (
    <div className="ojt-entries-container">
      {/* Header */}
      <div className="entries-header">
        <div>
          <h1 className="entries-title">OJT Entries</h1>
          <p className="entries-subtitle">Track your On-the-Job Training activities and progress</p>
        </div>
        {/* REMOVED: The duplicate "Add New Entry" button since it's already in the sidebar */}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <Clock size={20} color="#64748b" />
            <h3>Total Entries</h3>
          </div>
          <p className="stat-value">{entries.length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <CheckCircle size={20} color="#10b981" />
            <h3>Completed</h3>
          </div>
          <p className="stat-value">
            {entries.filter(e => e.status === 'completed').length}
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <AlertCircle size={20} color="#3b82f6" />
            <h3>In Progress</h3>
          </div>
          <p className="stat-value">
            {entries.filter(e => e.status === 'in-progress').length}
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <Calendar size={20} color="#f59e0b" />
            <h3>Total Hours</h3>
          </div>
          <p className="stat-value">
            {entries.reduce((total, entry) => total + entry.hours, 0)}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sort-group">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
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
                <button className="action-btn view-btn" onClick={() => handleView(entry)}>
                  <Eye size={16} />
                </button>
                <button className="action-btn edit-btn" onClick={() => handleEdit(entry)}>
                  <Edit size={16} />
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(entry.id)}>
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
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <Clock size={14} />
                  <span>{entry.hours} hours</span>
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
                  {entry.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="empty-state">
          <FileText size={48} color="#cbd5e1" />
          <h3>No entries found</h3>
          <p>Try adjusting your search or add a new entry</p>
          <button 
            className="add-entry-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={18} />
            Add Your First Entry
          </button>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Entry' : 'Add New Entry'}</h2>
              <button className="close-btn" onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}>
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
                  placeholder="Enter entry title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your OJT activity..."
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
                      style={{ borderColor: option.color }}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Supervisor</label>
                <input
                  type="text"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
                  placeholder="Supervisor name"
                />
              </div>
              
              <div className="form-group">
                <label>Skills Developed</label>
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
                    </button>
                  ))}
                </div>
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