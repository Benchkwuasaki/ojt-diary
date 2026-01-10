// src/App.jsx - UPDATED (final)
import { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import OJTEntries from './components/OJTEntries';
import Dashboard from './components/Dashboard';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setActiveSection('dashboard');
    setIsMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'ojt-entries':
        return <OJTEntries />;
      case 'calendar':
        return <div className="coming-soon">Calendar - Coming Soon</div>;
      case 'reports':
        return <div className="coming-soon">Reports - Coming Soon</div>;
      case 'progress':
        return <div className="coming-soon">Progress - Coming Soon</div>;
      case 'notifications':
        return <div className="coming-soon">Notifications - Coming Soon</div>;
      case 'profile':
        return <div className="coming-soon">Profile - Coming Soon</div>;
      case 'settings':
        return <div className="coming-soon">Settings - Coming Soon</div>;
      case 'dashboard':
      default:
        return <Dashboard user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <>
          <Sidebar 
            user={user} 
            onLogout={handleLogout} 
            activeSection={activeSection}
            setActiveSection={handleNavClick}
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
          <div className={`main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
            {renderContent()}
          </div>
        </>
      ) : (
        <AuthForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;