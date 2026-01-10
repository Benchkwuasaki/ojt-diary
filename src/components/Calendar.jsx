// src/components/Calendar.jsx
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Grid, 
  List, 
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import './Calendar.css';

function Calendar({ entries = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState('month'); // 'month' or 'week'

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const days = [];
    
    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        events: entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getDate() === i &&
                 entryDate.getMonth() === month &&
                 entryDate.getFullYear() === year;
        })
      });
    }

    // Next month days
    const totalCells = 42; // 6 weeks * 7 days
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    return days;
  };

  const getWeekData = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      weekDays.push({
        date,
        isToday,
        isSelected,
        events: entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.toDateString() === date.toDateString();
        })
      });
    }
    
    return weekDays;
  };

  const getSelectedDateEvents = () => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === selectedDate.toDateString();
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={12} />;
      case 'in-progress': return <AlertCircle size={12} />;
      case 'pending': return <Clock size={12} />;
      default: return <Target size={12} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const selectedEvents = getSelectedDateEvents();
  const totalEvents = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentDate.getMonth() && 
           entryDate.getFullYear() === currentDate.getFullYear();
  }).length;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2 className="calendar-title">
          <CalendarIcon size={24} />
          OJT Calendar
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal', marginLeft: '8px' }}>
            ({totalEvents} entries this month)
          </span>
        </h2>
        
        <div className="calendar-controls">
          <div className="calendar-nav">
            <button 
              className="nav-btn"
              onClick={() => viewType === 'month' ? navigateMonth(-1) : navigateWeek(-7)}
              title="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            
            <span className="current-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            
            <button 
              className="nav-btn"
              onClick={() => viewType === 'month' ? navigateMonth(1) : navigateWeek(7)}
              title="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          
          <button 
            className="today-btn"
            onClick={goToToday}
          >
            Today
          </button>
          
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewType === 'month' ? 'active' : ''}`}
              onClick={() => setViewType('month')}
              title="Month View"
            >
              <Grid size={14} />
              Month
            </button>
            <button 
              className={`view-btn ${viewType === 'week' ? 'active' : ''}`}
              onClick={() => setViewType('week')}
              title="Week View"
            >
              <List size={14} />
              Week
            </button>
          </div>
        </div>
      </div>

      {viewType === 'month' ? (
        <>
          <div className="calendar-grid">
            {dayNames.map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
            
            {getMonthData().map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''} ${!day.isCurrentMonth ? 'other-month' : ''}`}
                onClick={() => {
                  setSelectedDate(day.date);
                  if (!day.isCurrentMonth) {
                    setCurrentDate(day.date);
                  }
                }}
              >
                <div className="day-number">{day.date.getDate()}</div>
                
                {day.events && day.events.length > 0 && (
                  <div className="day-events">
                    {day.events.slice(0, 4).map((event, idx) => (
                      <div
                        key={idx}
                        className={`day-event ${event.status}`}
                        style={{ backgroundColor: getStatusColor(event.status) }}
                        title={`${event.title} (${event.status})`}
                      />
                    ))}
                    {day.events.length > 4 && (
                      <div className="day-more" title={`${day.events.length - 4} more entries`}>
                        +{day.events.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="week-view">
          {getWeekData().map((day, index) => (
            <div
              key={index}
              className={`week-day ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(day.date)}
            >
              <div className="week-day-header">
                <span className="week-day-name">{fullDayNames[day.date.getDay()]}</span>
                <span className="week-day-number">{day.date.getDate()}</span>
              </div>
              
              <div className="week-day-events">
                {day.events.slice(0, 5).map((event, idx) => (
                  <div
                    key={idx}
                    className={`week-event ${event.status}`}
                    title={event.title}
                  >
                    <span className="event-dot" style={{ backgroundColor: getStatusColor(event.status) }} />
                    {event.title}
                  </div>
                ))}
                {day.events.length > 5 && (
                  <div className="day-more">+{day.events.length - 5} more</div>
                )}
                {day.events.length === 0 && (
                  <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '8px' }}>
                    No OJT entries
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="calendar-events">
        <h3 className="events-title">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        
        <div className="events-list">
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event, index) => (
              <div
                key={index}
                className={`calendar-event-item ${event.status}`}
                style={{ borderLeftColor: getStatusColor(event.status) }}
              >
                <div className="event-time">
                  {getStatusIcon(event.status)}
                  <span>{event.hours} {event.hours === 1 ? 'hour' : 'hours'} • {event.status}</span>
                </div>
                <h4 className="event-title">{event.title}</h4>
                <p className="event-details">{event.description}</p>
                {event.supervisor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    <User size={12} />
                    <span>Supervisor: {event.supervisor}</span>
                  </div>
                )}
                {event.skills && event.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                    {event.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} style={{ 
                        background: '#f1f5f9', 
                        color: '#475569', 
                        padding: '2px 6px', 
                        borderRadius: '6px', 
                        fontSize: '11px' 
                      }}>
                        {skill}
                      </span>
                    ))}
                    {event.skills.length > 3 && (
                      <span style={{ 
                        background: '#dbeafe', 
                        color: '#3b82f6', 
                        padding: '2px 6px', 
                        borderRadius: '6px', 
                        fontSize: '11px' 
                      }}>
                        +{event.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-events">
              <CalendarIcon size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p>No OJT entries scheduled for this day</p>
              <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.7 }}>Click on any day to view its entries</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendar;