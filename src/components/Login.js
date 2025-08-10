import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';
import backgroundImage from '../assets/images/bg2.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add no-scroll class to body when component mounts
    document.body.classList.add('no-scroll');
    
    // Remove no-scroll class when component unmounts
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await api.login(username, password);
      
      if (!userData || !userData.id) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('user', JSON.stringify(userData));
      
      if (userData.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div 
        className="login-container"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="login-box">
          <h2>Login Here</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Enter your username"
              />
            </div>
            
            <div className="input-group password-input-container">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                {(isPasswordFocused || password) && (
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                )}
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="login-btn"
            >
              {isLoading ? (
                <span>Logging in...</span>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;