import { useState, useEffect } from 'react';
import './AuthForm.css';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import benchlogo from '../assets/Gemini_Generated_Image_d9cjlzd9cjlzd9cj.png'; // Make sure this path is correct

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Login attempt:', { email: formData.email, password: formData.password });
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      console.log('Register attempt:', formData);
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
              // Mobile: Show image logo
              <img 
                src={benchlogo} 
                alt="OJT Diary Logo" 
                className="mobile-logo-img"
              />
            ) : (
              // Desktop: Show original logo
              <>
                <div className="logo-circle">
                  <span>L</span>
                </div>
                <h1>LoginPro</h1>
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
            
            {/* Cards Container - Hide on mobile */}
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
            
            {/* Made by lipang */}
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

            {/* Form Options */}
            <div className={`form-options ${!isLogin ? 'conditional' : ''}`} 
                 style={{ 
                   maxHeight: isLogin ? '50px' : '0', 
                   opacity: isLogin ? '1' : '0',
                   overflow: 'hidden',
                   transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                 }}>
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#forgot" className="forgot-password">Forgot password?</a>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-button">
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight size={18} />
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