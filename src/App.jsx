// src/App.jsx - UPDATED (final)
import { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import OJTEntries from './components/OJTEntries';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Moved entries state to App.jsx to share between components
  const [entries, setEntries] = useState([
    {
      id: 1,
      title: 'Orientation & Company Tour',
      description: 'Introduction to company culture and workplace safety procedures. Learned about company values and workplace ethics.',
      date: '2024-01-10',
      status: 'completed',
      hours: 8,
      supervisor: 'John Smith',
      skills: ['Communication', 'Safety', 'Company Culture']
    },
    {
      id: 2,
      title: 'Software Development Training',
      description: 'Learning React.js and modern web development practices. Built a sample dashboard application.',
      date: '2024-01-12',
      status: 'in-progress',
      hours: 6,
      supervisor: 'Sarah Johnson',
      skills: ['React.js', 'JavaScript', 'CSS', 'Git']
    },
    {
      id: 3,
      title: 'Team Project Collaboration',
      description: 'Working with team on new feature implementation. Participated in daily standups and code reviews.',
      date: '2024-01-15',
      status: 'pending',
      hours: 4,
      supervisor: 'Mike Chen',
      skills: ['Teamwork', 'Problem Solving', 'Agile']
    },
    {
      id: 4,
      title: 'Client Meeting Preparation',
      description: 'Prepared documentation and presentation for upcoming client meeting. Assisted in creating project timelines.',
      date: '2024-01-18',
      status: 'completed',
      hours: 5,
      supervisor: 'Emma Wilson',
      skills: ['Documentation', 'Presentation', 'Time Management']
    },
    {
      id: 5,
      title: 'Database Optimization',
      description: 'Worked on optimizing database queries and improving application performance.',
      date: '2024-01-20',
      status: 'in-progress',
      hours: 7,
      supervisor: 'David Lee',
      skills: ['SQL', 'Performance', 'Database']
    },
    {
      id: 6,
      title: 'Code Review Session',
      description: 'Participated in peer code review sessions and learned best practices for code quality.',
      date: '2024-01-22',
      status: 'completed',
      hours: 3,
      supervisor: 'Sarah Johnson',
      skills: ['Code Review', 'Best Practices', 'Quality Assurance']
    },
    {
      id: 7,
      title: 'Team Building Activity',
      description: 'Participated in team building exercises to improve collaboration and communication.',
      date: '2024-02-01',
      status: 'completed',
      hours: 4,
      supervisor: 'Lisa Wong',
      skills: ['Teamwork', 'Communication', 'Leadership']
    },
    {
      id: 8,
      title: 'Project Presentation',
      description: 'Presented final project to management team and received feedback.',
      date: '2024-02-05',
      status: 'pending',
      hours: 3,
      supervisor: 'Robert Kim',
      skills: ['Presentation', 'Public Speaking', 'Feedback']
    }
  ]);

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
        return <OJTEntries entries={entries} setEntries={setEntries} />;
      case 'calendar':
        return <Calendar entries={entries} />;
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
        return <Dashboard user={user} entries={entries} />;
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