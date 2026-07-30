import React from 'react';

const AuthCard = ({ title, subtitle, children, width = 'min(90vw, 480px)' }) => {
  return (
    <div className="auth-layout w-100">
      <div 
        className="solid-card" 
        style={{ 
          maxWidth: width,
          margin: '0 auto' 
        }}
      >
        <div className="text-center" style={{ marginBottom: '2rem' }}>
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