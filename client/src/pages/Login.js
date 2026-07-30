import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock} from 'react-icons/fa';
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
    // Add authentication logic here
  };

  return (
    <AuthCard 
      title="Welcome Back" 
      subtitle="Sign in to continue to GitScope"
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

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="form-check custom-checkbox">
            <input className="form-check-input" type="checkbox" id="rememberMe" />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember Me
            </label>
          </div>
          <Link to="/forgot-password" className="link-primary" style={{ fontSize: '0.9rem' }}>
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="btn-primary-gradient mb-3">
          Login
        </button>
      </form>

      <div className="divider">OR</div>


      <p className="text-center mt-4 mb-0" style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
        New to GitScope? <Link to="/signup" className="link-primary fw-medium">Create an Account</Link>
      </p>
    </AuthCard>
  );
};

export default Login;