import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaIdBadge, FaGraduationCap, FaBuilding } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    rollNumber: '',
    email: '',
    phoneNumber: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if(formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', formData);
      // Auto login or redirect to login on success
      if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        navigate(`/${response.data.role}/dashboard`);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Something went wrong during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard 
      title="Create Account" 
      subtitle="Start tracking your GitHub contributions"
      width="min(90vw, 550px)"
    >
      {errorMsg && <div className="alert alert-danger p-2 text-center" style={{fontSize: '0.875rem'}}>{errorMsg}</div>}
      <form onSubmit={handleSubmit}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
          <AuthInput
            icon={FaUser}
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
          <AuthInput
            icon={FaIdBadge}
            type="text"
            name="rollNumber"
            placeholder="Roll Number"
            value={formData.rollNumber}
            onChange={handleChange}
          />
        </div>

        <AuthInput
          icon={FaEnvelope}
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />

        <AuthInput
          icon={FaPhone}
          type="tel"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
          <AuthInput
            icon={FaBuilding}
            type="text"
            name="department"
            placeholder="Department (e.g. CSE)"
            value={formData.department}
            onChange={handleChange}
          />
          <div className="auth-input-group mb-3">
            <span className="auth-input-icon"><FaGraduationCap /></span>
            <select name="year" value={formData.year} onChange={handleChange} className="auth-input" style={{width: '100%', border: 'none', outline: 'none', background: 'transparent'}} required>
              <option value="" disabled>Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
          <AuthInput
            icon={FaLock}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <AuthInput
            icon={FaLock}
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-primary-solid mt-2 mb-3" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="divider">OR</div>

      {/* Note the color update here to #64748B */}
      <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0, color: '#64748B', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" className="link-primary">Sign in</Link>
      </p>
    </AuthCard>
  );
};

export default Signup;