import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

const Register = () => {
  const [step, setStep] = useState(1); // 1: register, 2: verify OTP
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authAPI.register(formData);
      setMessage('Registration successful! Please check your email for OTP.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.verifyOTP({ email: formData.email, otp });
      setMessage('Email verified successfully! You can now login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register for Payment Reminder</h2>
        
        {step === 1 ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
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
              <small>Please check your email for the OTP</small>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="link-button"
            >
              Back to Registration
            </button>
          </form>
        )}
        
        <p className="auth-link">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="link">
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
