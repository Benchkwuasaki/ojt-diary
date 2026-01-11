// src/components/AuthForm.jsx - FIXED REGISTRATION FLOW
import { useState, useEffect } from 'react';
import './AuthForm.css';
import { 
  Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Zap, Users, 
  AlertCircle, X, CheckCircle 
} from 'lucide-react';
import benchlogo from '../assets/Gemini_Generated_Image_d9cjlzd9cjlzd9cj.png';
import { auth, db } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Error Notification Component
const ErrorNotification = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div className={`error-notification ${isClosing ? 'hide' : 'show'}`}>
      <div className="error-icon">
        <AlertCircle size={20} />
      </div>
      <div className="error-content">
        <h4 className="error-title">
          <AlertCircle size={16} />
          Authentication Error
        </h4>
        <p className="error-message">{message}</p>
      </div>
      <button 
        className="error-close" 
        onClick={handleClose}
        aria-label="Close error message"
      >
        <X size={18} />
      </button>
      <div className="error-progress">
        <div className="error-progress-bar"></div>
      </div>
    </div>
  );
};

// Success Notification Component
const SuccessNotification = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div className={`success-notification ${isClosing ? 'hide' : 'show'}`}>
      <div className="success-icon">
        <CheckCircle size={20} />
      </div>
      <div className="success-content">
        <h4 className="success-title">
          <CheckCircle size={16} />
          Success!
        </h4>
        <p className="success-message">{message}</p>
      </div>
      <button 
        className="success-close" 
        onClick={handleClose}
        aria-label="Close success message"
      >
        <X size={18} />
      </button>
      <div className="error-progress">
        <div className="error-progress-bar"></div>
      </div>
    </div>
  );
};

function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showError = (errorMessage) => {
    setError(errorMessage);
    // Clear success message if showing
    if (success) setSuccess(null);
  };

  const showSuccess = (successMessage) => {
    setSuccess(successMessage);
    // Clear error message if showing
    if (error) setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    clearSuccess();

    try {
      if (isLogin) {
        // Login with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        const user = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || formData.email.split('@')[0]
        };

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        
        if (onLogin) {
          onLogin(user);
        }
      } else {
        // Register with Firebase
        
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          showError('Passwords do not match!');
          setIsLoading(false);
          return;
        }

        // Validate password strength
        if (formData.password.length < 6) {
          showError('Password should be at least 6 characters long.');
          setIsLoading(false);
          return;
        }

        // Create user account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });

        // Save additional user data to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: formData.name,
          email: formData.email,
          createdAt: new Date().toISOString(),
          role: 'student'
        });

        // Sign out immediately after registration
        await signOut(auth);

        // Show success message
        showSuccess('Account created successfully! Please sign in with your credentials.');
        
        // Clear form data
        setFormData({
          email: '',
          password: '',
          name: '',
          confirmPassword: ''
        });
        
        // Switch to login form after showing success message
        setTimeout(() => {
          handleSwitchForm();
        }, 2000); // Give user time to read the success message
      }
    } catch (error) {
      console.error('Auth Error:', error);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password sign-in is not enabled.';
          break;
        default:
          errorMessage = error.message;
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) clearError();
    if (success) clearSuccess();
  };

  const handleSwitchForm = () => {
    setIsSwitching(true);
    clearError();
    clearSuccess();
    
    setTimeout(() => {
      setIsLogin(!isLogin);
      setFormData({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setIsSwitching(false);
      }, 50);
    }, 300);
  };

  return (
    <div className="auth-wrapper">
      {/* Error Notification */}
      {error && (
        <ErrorNotification 
          message={error} 
          onClose={clearError} 
        />
      )}

      {/* Success Notification */}
      {success && (
        <SuccessNotification 
          message={success} 
          onClose={clearSuccess} 
        />
      )}

      {/* Background Elements */}
      <div className="background-elements">
        <div className="gradient-ball ball-1"></div>
        <div className="gradient-ball ball-2"></div>
        <div className="gradient-ball ball-3"></div>
        <div className="grid-lines"></div>
      </div>

      {/* Main Container */}
      <div className={`auth-container ${isSwitching ? 'switching' : ''}`}>
        {/* Left Panel - Branding */}
        <div className="brand-panel">
          <div className="brand-logo">
            {isMobile ? (
              <img 
                src={benchlogo} 
                alt="OJT Diary Logo" 
                className="mobile-logo-img"
              />
            ) : (
              <>
                <div className="logo-circle">
                  <span>L</span>
                </div>
                <h1>OJT Diary</h1>
              </>
            )}
          </div>
          <div className="brand-content">
            <h2>{isLogin ? 'Welcome To OJT Diary' : 'Join Us'}</h2>
            <p className="brand-subtitle">
              {isLogin 
                ? 'Sign in to access your dashboard and continue your journey.'
                : 'Create an account to unlock all features and benefits.'
              }
            </p>
            
            <div className="brand-cards">
              <div className="card">
                <div className="card-icon">
                  <Shield size={20} />
                </div>
                <div className="card-label">Secure</div>
              </div>
              <div className="card">
                <div className="card-icon">
                  <Zap size={20} />
                </div>
                <div className="card-label">Fast</div>
              </div>
              <div className="card">
                <div className="card-icon">
                  <Users size={20} />
                </div>
                <div className="card-label">Community</div>
              </div>
            </div>
            
            <div className="made-by">@ made by Bench Lipang</div>
          </div>
          
          <div className="switch-prompt">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={handleSwitchForm} className="switch-link">
                {isLogin ? ' Create Account' : ' Sign In'}
                <ArrowRight size={14} />
              </button>
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className={`form-panel ${isSwitching ? 'switching' : ''} ${isLogin ? 'login' : 'register'}`}>
          <div className="form-header">
            <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
            <p>Enter your details to {isLogin ? 'sign in to your account' : 'create a new account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            {/* Name Field */}
            <div className={`input-field ${!isLogin ? 'conditional visible' : 'conditional'}`}>
              <div className="input-icon">
                <User size={18} />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
              <div className="input-border"></div>
            </div>

            {/* Email Field */}
            <div className="input-field">
              <div className="input-icon">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="input-border"></div>
            </div>

            {/* Password Field */}
            <div className="input-field">
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <div className="input-border"></div>
            </div>

            {/* Confirm Password Field */}
            <div className={`input-field ${!isLogin ? 'conditional visible' : 'conditional'}`}>
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                minLength="6"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <div className="input-border"></div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-button" disabled={isLoading}>
              <span>
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </span>
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Mobile Switch Prompt */}
          <div className="mobile-switch-prompt">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={handleSwitchForm} className="switch-link">
                {isLogin ? ' Create Account' : ' Sign In'}
                <ArrowRight size={14} />
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;