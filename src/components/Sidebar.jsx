// src/components/Sidebar.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  FileText,
  BarChart3,
  Bell,
  Home,
  ChevronLeft,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import './Sidebar.css';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

function Sidebar({ user, onLogout, activeSection, setActiveSection }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'ojt-entries', label: 'OJT Entries', icon: <BookOpen size={20} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, badge: 3 },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    }
  };

  const handleNavClick = (itemId) => {
    setActiveSection(itemId);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}

      {/* Mobile Menu Button */}
      {isMobile && !isMobileOpen && (
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMobileOpen(true)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)',
          }}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          transform: isMobile && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button 
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              position: 'absolute',
              right: isCollapsed ? '-15px' : '-12px',
              top: '20px',
              background: '#22c55e',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)',
              transition: 'all 0.3s ease',
              zIndex: 1001,
            }}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <button 
            className="mobile-close-button"
            onClick={() => setIsMobileOpen(false)}
            style={{
              position: 'absolute',
              right: '20px',
              top: '20px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              zIndex: 1002,
            }}
          >
            <X size={24} />
          </button>
        )}

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-circle">
              <span>OJT</span>
            </div>
            {!isCollapsed && <h2>OJT Diary</h2>}
          </div>
          
          {!isCollapsed && user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
                <span className="user-role" style={{
                  fontSize: '11px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  marginTop: '4px',
                  display: 'inline-block',
                }}>Student</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="nav-icon">
                    {item.icon}
                    {item.badge && (
                      <span className="nav-badge" style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '10px',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {!isCollapsed && (
                    <span className="nav-label">
                      {item.label}
                      {item.badge && !isCollapsed && (
                        <span className="badge" style={{
                          marginLeft: '8px',
                          background: '#ef4444',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '10px',
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="quick-actions" style={{
            padding: '0 20px 20px',
          }}>
            <button 
              className="add-entry-btn"
              onClick={() => setActiveSection('ojt-entries')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                marginBottom: '15px',
                transition: 'all 0.3s ease',
              }}
            >
              <PlusCircle size={18} />
              New OJT Entry
            </button>
          </div>
        )}

        {/* Logout Section */}
        <div className="sidebar-footer">
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
          
          {!isCollapsed && (
            <div className="version-info">
              <p>v1.0.0</p>
              <p className="made-by">@ made by lipang</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;