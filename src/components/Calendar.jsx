// src/components/Calendar.jsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { db, auth } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import './Calendar.css';

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startingDay = firstDay.getDay();
    
    return { firstDay, lastDay, daysInMonth, startingDay };
  };

  const getEntriesForDate = (date) => {
    // Convert the date to YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return entries.filter(entry => {
      if (!entry.date) return false;
      
      // Convert entry date to YYYY-MM-DD format
      let entryDateString;
      if (typeof entry.date === 'string') {
        entryDateString = entry.date; // Already in YYYY-MM-DD format
      } else if (entry.date.toDate) {
        // Handle Firestore timestamp
        const d = entry.date.toDate();
        entryDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else if (entry.date instanceof Date) {
        entryDateString = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}-${String(entry.date.getDate()).padStart(2, '0')}`;
      } else {
        return false;
      }
      
      return entryDateString === dateString;
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} color="#10b981" />;
      case 'in-progress':
        return <AlertCircle size={14} color="#3b82f6" />;
      case 'pending':
        return <Clock size={14} color="#f59e0b" />;
      default:
        return null;
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateEntries = getEntriesForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="day-number">{day}</div>
          {dateEntries.length > 0 && (
            <div className="day-entries">
              {dateEntries.slice(0, 2).map((entry, index) => (
                <div key={index} className="entry-indicator" title={entry.title}>
                  {getStatusIcon(entry.status)}
                  <span className="entry-title-short">{entry.title.substring(0, 15)}...</span>
                </div>
              ))}
              {dateEntries.length > 2 && (
                <div className="more-entries">+{dateEntries.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getSelectedDateEntries = () => {
    if (!selectedDate) return [];
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return entries.filter(entry => {
      if (!entry.date) return false;
      
      // Convert entry date to YYYY-MM-DD format
      let entryDateString;
      if (typeof entry.date === 'string') {
        entryDateString = entry.date;
      } else if (entry.date.toDate) {
        const d = entry.date.toDate();
        entryDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else if (entry.date instanceof Date) {
        entryDateString = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}-${String(entry.date.getDate()).padStart(2, '0')}`;
      } else {
        return false;
      }
      
      return entryDateString === dateString;
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading calendar...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>OJT Calendar</h1>
        <p>View your training schedule and track progress over time</p>
      </div>

      <div className="calendar-controls">
        <button className="control-btn today-btn" onClick={goToToday}>
          Today
        </button>
        <div className="month-navigation">
          <button className="nav-btn" onClick={goToPreviousMonth}>
            <ChevronLeft size={20} />
          </button>
          <h2>{formatMonthYear(currentMonth)}</h2>
          <button className="nav-btn" onClick={goToNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="day-header">Sun</div>
        <div className="day-header">Mon</div>
        <div className="day-header">Tue</div>
        <div className="day-header">Wed</div>
        <div className="day-header">Thu</div>
        <div className="day-header">Fri</div>
        <div className="day-header">Sat</div>
        {renderCalendar()}
      </div>

      {selectedDate && (
        <div className="selected-date-details">
          <h3>Entries for {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h3>
          {getSelectedDateEntries().length > 0 ? (
            <div className="entries-list">
              {getSelectedDateEntries().map(entry => (
                <div key={entry.id} className="entry-item">
                  <div className="entry-header">
                    <h4>{entry.title}</h4>
                    <div className={`status-badge ${entry.status}`}>
                      {getStatusIcon(entry.status)}
                      <span>{entry.status}</span>
                    </div>
                  </div>
                  <p className="entry-description">{entry.description}</p>
                  <div className="entry-meta">
                    <span>{entry.hours} hours</span>
                    {entry.supervisor && <span>Supervisor: {entry.supervisor}</span>}
                  </div>
                  {entry.skills && entry.skills.length > 0 && (
                    <div className="skills-tags">
                      {entry.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-entries">No entries for this date</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Calendar;