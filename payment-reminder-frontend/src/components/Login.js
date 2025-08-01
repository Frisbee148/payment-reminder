import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import './Auth.css';

const Login = () => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authAPI.requestLoginOTP(email);
      setMessage('OTP sent to your email successfully!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, otp });
      const { user, accessToken } = response.data.data;
      login(user, accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Payment Reminder</h2>
        
        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit OTP"
                maxLength="6"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="link-button"
            >
              Back to Email
            </button>
          </form>
        )}
        
        <p className="auth-link">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} className="link">
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
