// src/App.jsx - UPDATED
import { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import OJTEntries from './components/OJTEntries';
import Dashboard from './components/Dashboard'; // You'll need to create this
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

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
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'ojt-entries':
        return <OJTEntries />;
      case 'dashboard':
      default:
        return <Dashboard user={user} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #417bb5 0%, #b0974b 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '30px 50px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: 0, color: '#1e293b' }}>Loading...</h2>
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
            setActiveSection={setActiveSection}
          />
          <div className="main-content">
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