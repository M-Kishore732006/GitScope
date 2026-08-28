import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaIdBadge, FaGraduationCap, FaBuilding } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';

const AuthSelect = ({ icon: Icon, name, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="auth-input-group mb-3 position-relative" ref={dropdownRef}>
      <span className="auth-input-icon"><Icon /></span>
      <div 
        className="auth-input d-flex align-items-center justify-content-between" 
        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', paddingRight: '0.75rem' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: selectedOption ? '#1e293b' : '#94a3b8', fontSize: '0.95rem', userSelect: 'none' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </div>
      
      {isOpen && (
        <div className="position-absolute shadow-sm border rounded-3 bg-white w-100 mt-1 py-1" style={{ zIndex: 1050, top: '100%', left: 0, maxHeight: '220px', overflowY: 'auto' }}>
          {options.map((opt, idx) => (
            <div 
              key={idx}
              className="px-3 py-2"
              style={{
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: value === opt.value ? '#2563eb' : '#475569',
                background: value === opt.value ? '#eff6ff' : 'white',
                fontWeight: value === opt.value ? '600' : '400',
                transition: 'background 0.1s'
              }}
              onClick={() => {
                onChange({ target: { name, value: opt.value } });
                setIsOpen(false);
              }}
              onMouseEnter={(e) => { if (value !== opt.value) e.target.style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { if (value !== opt.value) e.target.style.background = 'white'; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  inputMode="numeric"
  maxLength={10}
  name="phoneNumber"
  placeholder="Phone Number"
  value={formData.phoneNumber}
  onChange={handleChange}
/>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
          <AuthSelect
            icon={FaBuilding}
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Select Department"
            options={[
              { value: 'CSE', label: 'CSE (Computer Science)' },
              { value: 'IT', label: 'IT (Information Technology)' },
              { value: 'AI&DS', label: 'AI&DS (Artificial Intelligence & Data Science)' },
              { value: 'ECE', label: 'ECE (Electronics & Communication)' },
              { value: 'EEE', label: 'EEE (Electrical & Electronics)' },
              { value: 'MECH', label: 'MECH (Mechanical Engineering)' },
              { value: 'CIVIL', label: 'CIVIL (Civil Engineering)' }
            ]}
          />
          <AuthSelect
            icon={FaGraduationCap}
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="Select Year"
            options={[
              { value: '1st Year', label: '1st Year' },
              { value: '2nd Year', label: '2nd Year' },
              { value: '3rd Year', label: '3rd Year' },
              { value: '4th Year', label: '4th Year' }
            ]}
          />
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