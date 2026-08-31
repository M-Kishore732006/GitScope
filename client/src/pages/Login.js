import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/login', formData);
      if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        
        const targetRole = (response.data.role === 'teacher' || response.data.role === 'staff') ? 'staff' : response.data.role;
        navigate(`/${targetRole}/dashboard`);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard 
      title="Welcome Back" 
      subtitle="Sign in to your GitScope account"
    >
      {errorMsg && <div className="alert alert-danger p-2 text-center" style={{fontSize: '0.875rem'}}>{errorMsg}</div>}
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

        <button type="submit" className="btn-primary-solid mb-3" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
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