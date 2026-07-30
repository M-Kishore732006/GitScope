import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', formData);
  };

  return (
    <AuthCard 
      title="Welcome Back" 
      subtitle="Sign in to your GitScope account"
    >
      <form onSubmit={handleSubmit}>
        <AuthInput
          icon={FaEnvelope}
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="custom-checkbox">
            <input type="checkbox" id="rememberMe" />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>
          <Link to="/forgot-password" className="link-primary" style={{ fontSize: '0.9rem' }}>
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="btn-primary-solid mb-3">
          Sign In
        </button>
      </form>

      <div className="divider">OR</div>

      {/* Note the color update here to #64748B */}
      <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0, color: '#64748B', fontSize: '0.9rem' }}>
        New to GitScope? <Link to="/signup" className="link-primary">Create an account</Link>
      </p>
    </AuthCard>
  );
};

export default Login;