import { useState, useEffect } from 'react';
import './AuthForm.css';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import benchlogo from '../assets/Gemini_Generated_Image_d9cjlzd9cjlzd9cj.png';

// Your InfinityFree domain
const API_URL = 'https://ojt-diary.42web.io'; // Replace with your InfinityFree domain

function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  // Debug: Log what we're sending
  console.log('Attempting registration with:', {
    name: formData.name,
    email: formData.email,
    passwordLength: formData.password.length,
    confirmPasswordLength: formData.confirmPassword.length
  });

  try {
    const endpoint = isLogin ? '/login.php' : '/register.php';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { 
          name: formData.name, 
          email: formData.email, 
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };

    console.log('Sending to:', `${API_URL}${endpoint}`);
    console.log('Payload:', payload);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Try to get response text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      alert('Server returned invalid response: ' + responseText.substring(0, 100));
      return;
    }

    if (result.success) {
      alert(result.message);
      if (isLogin && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isAuthenticated', 'true');
        if (onLogin) {
          onLogin(result.user);
        }
      } else if (!isLogin) {
        handleSwitchForm();
      }
    } else {
      alert(result.message || 'Something went wrong');
    }
  } catch (error) {
    console.error('Fetch Error Details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    alert('Network error: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchForm = () => {
    setIsSwitching(true);
    
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
            
            <div className="made-by">@ made by lipang</div>
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