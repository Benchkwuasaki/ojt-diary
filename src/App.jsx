// src/App.jsx - COMPLETE WITH REAL-TIME USER UPDATES
import { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import OJTEntries from './components/OJTEntries';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import Profile from './components/Profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      const isRegistering = sessionStorage.getItem('isRegistering') === 'true';
      
      if (firebaseUser && !isRegistering) {
        // Create initial user object from Firebase Auth
        const initialUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || null
        };
        
        // Set up real-time listener to Firestore user document
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const firestoreData = docSnap.data();
            // Merge Firebase Auth data with Firestore data
            const updatedUser = {
              ...initialUser,
              ...firestoreData,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              photoURL: firestoreData.photoURL || initialUser.photoURL
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            setUser(initialUser);
            localStorage.setItem('user', JSON.stringify(initialUser));
          }
        });

        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
      setLoading(false);
    });

    // Cleanup function
    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
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

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'ojt-entries':
        return <OJTEntries />;
      case 'calendar':
        return <Calendar />;
      case 'reports':
        return <div className="coming-soon">Reports - Coming Soon</div>;
      case 'progress':
        return <div className="coming-soon">Progress - Coming Soon</div>;
      case 'notifications':
        return <div className="coming-soon">Notifications - Coming Soon</div>;
      case 'profile':
        return <Profile user={user} onUserUpdate={handleUserUpdate} />;
      case 'settings':
        return <div className="coming-soon">Settings - Coming Soon</div>;
      case 'dashboard':
      default:
        return <Dashboard user={user} onNavigate={handleNavClick} />;
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