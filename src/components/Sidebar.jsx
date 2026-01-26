// src/components/Sidebar.jsx - COMPLETE WITH PROFILE IMAGE SUPPORT
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';


function Sidebar({ 
  user, 
  onLogout, 
  activeSection,
  setActiveSection,
  isCollapsed,
  toggleSidebar,
  isMobileMenuOpen,
  toggleMobileMenu
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        // Close mobile menu on larger screens
        if (isMobileMenuOpen) {
          toggleMobileMenu();
        }
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobileMenuOpen, toggleMobileMenu]);

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
      toggleMobileMenu();
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Button */}
      {isMobile && !isMobileMenuOpen && (
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          transform: isMobile && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-container">
              <img src={logo} alt="OJT Diary Logo" />
            </div>
            
            {/* Desktop Toggle Button - NOW POSITIONED OUTSIDE */}
            {!isMobile && (
              <button 
                className="sidebar-toggle"
                onClick={toggleSidebar}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            )}
          </div>
          
          {!isCollapsed && user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar-initials">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <div className="user-details">
                <h4>{user.name || 'User'}</h4>
                <p>{user.email || 'user@example.com'}</p>
                <span className="user-role">Student</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isMobile && (
          <button 
            className="mobile-close-button"
            onClick={toggleMobileMenu}
          >
            <X size={24} />
          </button>
        )}

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
                      <span className="nav-badge">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {!isCollapsed && (
                    <span className="nav-label">
                      {item.label}
                      {item.badge && !isCollapsed && (
                        <span className="badge">
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
              <p className="made-by">@ made by lipang</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;