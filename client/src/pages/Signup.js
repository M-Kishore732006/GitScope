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
    // Add registration logic here
  };

  return (
    <AuthCard 
      title="Create Account" 
      subtitle="Start tracking your GitHub contributions"
    >
      {/* Removed the inline styles handling the overflow/scroll here */}
      <form onSubmit={handleSubmit}>
        
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

        <button type="submit" className="btn-primary-gradient mt-2 mb-3">
          Sign Up
        </button>
      </form>

      <div className="divider">OR</div>

      

      <p className="text-center mt-4 mb-0" style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" className="link-primary fw-medium">Login</Link>
      </p>
    </AuthCard>
  );
};

export default Signup;