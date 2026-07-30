import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaIdBadge } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log('Signup submitted:', formData);
  };

  return (
    <AuthCard 
      title="Create Account" 
      subtitle="Start tracking your GitHub contributions"
      width="min(90vw, 550px)"
    >
      <form onSubmit={handleSubmit}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
          <AuthInput
            icon={FaUser}
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
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

        <button type="submit" className="btn-primary-solid mt-2 mb-3">
          Create Account
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