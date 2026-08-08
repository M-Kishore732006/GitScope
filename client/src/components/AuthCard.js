import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const AuthCard = ({ title, subtitle, children, width = 'min(90vw, 480px)' }) => {
  return (
    <div className="auth-layout w-100">
      <div 
        className="solid-card" 
        style={{ 
          maxWidth: width,
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <Link to="/" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
          <FaArrowLeft /> Home
        </Link>
        <div className="text-center" style={{ marginBottom: '2rem', marginTop: '1.5rem' }}>
          {/* Optional: Add a subtle logo placeholder here if you want */}
          <h2 className="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;